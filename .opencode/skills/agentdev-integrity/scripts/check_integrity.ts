import {
  EXIT_OK,
  EXIT_NG,
  EXIT_ERROR,
  parseArgs,
  printHelp,
  ok,
  ng,
  warn,
  info,
  computeSummary,
  formatJsonReport,
  formatMarkdownReport,
  determineExitCode,
  findRepoRoot,
  determineRoute,
  writeReportFile,
  type CheckResult,
  type CheckResultOptions,
  type IntegrityReport,
  type ScanSummary,
  type FindingCategory,
  type FindingRoute,
} from "./cli_utils.ts";

const SCRIPT_NAME = "check_integrity.ts";
const DESCRIPTION = "AgentDevFlow artifact integrity validator";
const USAGE = "bun run check_integrity.ts [--help] [--json] [--dry-run]";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

function parseFrontmatter(content: string): Record<string, string | string[]> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const yaml = parts[1].trim();
  const result: Record<string, string | string[]> = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  const currentArray: string[] = [];

  function flushArray() {
    if (currentKey !== null && currentArray.length > 0) {
      result[currentKey] = [...currentArray];
    }
    currentKey = null;
    currentArray.length = 0;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("- ") && currentKey !== null) {
      currentArray.push(trimmed.slice(2).trim());
      continue;
    }

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    flushArray();
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (value === "") {
      currentKey = key;
      currentArray.length = 0;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      result[key] = value.replace(/^["']|["']$/g, "");
    }
  }

  flushArray();
  return result;
}

function readText(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8") as string;
  } catch {
    return null;
  }
}

function listFiles(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return (fs.readdirSync(dirPath) as string[])
      .filter((f) => f.endsWith(".md"))
      .sort();
  } catch {
    return [];
  }
}

function listDirs(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return (fs.readdirSync(dirPath, { withFileTypes: true }) as import("fs").Dirent[])
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

function resolveRelative(fullPath: string, root: string): string {
  return path.relative(root, fullPath).replace(/\\/g, "/");
}

function extractReadmeTableReqIds(content: string): Set<string> {
  const ids = new Set<string>();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    // Extract from plain text in table cell: | REQ-NNNN | ...
    const plainMatch = trimmed.match(/\|\s*(REQ-\d+)\s*\|/);
    if (plainMatch) { ids.add(plainMatch[1]); continue; }
    // Extract from markdown link in table cell: | [REQ-NNNN](...) | ...
    const linkMatches = trimmed.matchAll(/\[(REQ-\d+)\]\([^)]+\)/g);
    for (const m of linkMatches) {
      ids.add(m[1]);
    }
  }
  return ids;
}

function extractReadmeTableCommands(content: string): Set<string> {
  const commands = new Set<string>();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const backtickContent = trimmed.match(/`[^`]+`/g);
    if (!backtickContent) continue;
    for (const bt of backtickContent) {
      const inner = bt.replace(/`/g, "");
      const slashIdx = inner.lastIndexOf("/");
      const name = slashIdx >= 0 ? inner.slice(slashIdx + 1) : inner;
      if (/^[a-z][a-z0-9-]*$/.test(name) && name.length > 1) {
        commands.add(name);
      }
    }
  }
  return commands;
}

function extractLoadSkills(frontmatter: Record<string, string | string[]> | null): string[] {
  if (!frontmatter) return [];
  const ls = frontmatter["load_skills"];
  if (Array.isArray(ls)) return ls;
  if (typeof ls === "string" && ls.length > 0) return [ls];
  return [];
}

const LEGACY_PATTERNS = [
  { pattern: /\bintegrity_check\b/g, name: "integrity_check (snake_case)" },
  { pattern: /\blearning-capture-skill\b/g, name: "learning-capture-skill (old suffix)" },
  { pattern: /\breq_define\b/g, name: "req_define (snake_case)" },
  { pattern: /\bcase_run\b/g, name: "case_run (snake_case)" },
  { pattern: /\bcase_open\b/g, name: "case_open (snake_case)" },
  { pattern: /\bcase_close\b/g, name: "case_close (snake_case)" },
  // R1: old bare command names
  { pattern: /\bissue-req\b/g, name: "issue-req (old bare command)" },
  { pattern: /\bissue-work\b/g, name: "issue-work (old bare command)" },
  { pattern: /\bissue-close\b/g, name: "issue-close (old bare command)" },
  { pattern: /\bissue-create\b/g, name: "issue-create (old bare command)" },
  { pattern: /\bissue-update\b/g, name: "issue-update (old bare command)" },
  { pattern: /\bissue-save-req\b/g, name: "issue-save-req (old bare command)" },
  { pattern: /\bissue-backlog-create\b/g, name: "issue-backlog-create (old bare command)" },
  { pattern: /\btips-elevate\b/g, name: "tips-elevate (old bare command)" },
  { pattern: /\btips-refactor\b/g, name: "tips-refactor (old bare command)" },
  // R1: bare slash forms without agentdev prefix (should not appear outside command definition files)
  { pattern: /(?<!agentdev)\/case-open\b/g, name: "/case-open (bare slash form)" },
  { pattern: /(?<!agentdev)\/case-run\b/g, name: "/case-run (bare slash form)" },
  { pattern: /(?<!agentdev)\/case-close\b/g, name: "/case-close (bare slash form)" },
  { pattern: /(?<!agentdev)\/case-update\b/g, name: "/case-update (bare slash form)" },
  { pattern: /(?<!agentdev)\/req-define\b/g, name: "/req-define (bare slash form)" },
  { pattern: /(?<!agentdev)\/req-save\b/g, name: "/req-save (bare slash form)" },
  // R2: old command paths
  { pattern: /\.opencode\/commands\/issue\//g, name: ".opencode/commands/issue/ (old command path)" },
  { pattern: /\.opencode\/commands\/tips\//g, name: ".opencode/commands/tips/ (old command path)" },
  { pattern: /commands\/issue\//g, name: "commands/issue/ (old relative path)" },
  { pattern: /commands\/tips\//g, name: "commands/tips/ (old relative path)" },
  // R3: old hyphenated skill names
  { pattern: /\bissue-lifecycle\b/g, name: "issue-lifecycle (old skill name)" },
  { pattern: /\bissue-template-manager\b/g, name: "issue-template-manager (old skill name)" },
  { pattern: /\btips-pipeline-orchestration\b/g, name: "tips-pipeline-orchestration (old skill name)" },
  { pattern: /\bissue-completion-reporting\b/g, name: "issue-completion-reporting (old skill name)" },
  { pattern: /\bissue-post-review-routing\b/g, name: "issue-post-review-routing (old skill name)" },
  { pattern: /\bissue-work-orchestration\b/g, name: "issue-work-orchestration (old skill name)" },
  // 6j: old data path (docs/tips/ → docs/ migration)
  { pattern: /\bdocs\/tips\//g, name: "docs/tips/ (old data path)" },
  // 6k: old terminology in active guidance
  { pattern: /\btips[- ]プール/g, name: "tips プール (old terminology: should be learning プール)" },
  { pattern: /\brefactor時prune\b/g, name: "refactor時prune (old terminology: should be refine時prune)" },
  { pattern: /\belevate時prune\b/g, name: "elevate時prune (old terminology: should be promote時prune)" },
];

const IMPLEMENTATION_PATTERNS = [
  "wall-session",
  "file-pipeline",
  "manager-orchestrator",
  "capture-only",
  "read-only-diagnostic",
] as const;

const PATTERN_PROHIBITED_SKILLS: Record<string, string[]> = {
  "capture-only": [
    "agentdev-workflow-orchestration",
    "agentdev-workflow-routing",
    "agentdev-req-file-manager",
    "agentdev-adr-file-manager",
    "agentdev-workflow-templates",
    "agentdev-spec-compliance",
    "agentdev-epic-tracker",
    "agentdev-learning-pipeline",
  ],
  "read-only-diagnostic": [
    "agentdev-workflow-orchestration",
    "agentdev-workflow-routing",
    "agentdev-req-file-manager",
    "agentdev-adr-file-manager",
    "agentdev-workflow-templates",
    "agentdev-spec-compliance",
    "agentdev-epic-tracker",
    "agentdev-learning-pipeline",
    "agentdev-git-worktree",
    "agentdev-gh-cli",
    "agentdev-conventional-commits",
    "agentdev-learning-capture",
  ],
  "wall-session": [
    "agentdev-workflow-orchestration",
    "agentdev-workflow-routing",
    "agentdev-gh-cli",
    "agentdev-git-worktree",
    "agentdev-conventional-commits",
  ],
};

function checkReqFrontmatterFilename(reqDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const files = listFiles(reqDir).filter((f) => f.startsWith("REQ-") && f !== "README.md");
  for (const file of files) {
    const fullPath = path.join(reqDir, file);
    const content = readText(fullPath);
    if (!content) {
      results.push(ng("REQ", "frontmatter-filename", `Cannot read file`, resolveRelative(fullPath, root)));
      continue;
    }
    const fm = parseFrontmatter(content);
    if (!fm) {
      results.push(ng("REQ", "frontmatter-filename", `No valid frontmatter found`, resolveRelative(fullPath, root)));
      continue;
    }
    const expectedId = file.replace(".md", "");
    const actualId = fm["id"];
    if (typeof actualId !== "string") {
      results.push(ng("REQ", "frontmatter-filename", `Missing or invalid 'id' field`, resolveRelative(fullPath, root)));
    } else if (actualId !== expectedId) {
      results.push(
        ng("REQ", "frontmatter-filename", `id '${actualId}' does not match filename '${expectedId}'`, resolveRelative(fullPath, root))
      );
    } else {
      results.push(ok("REQ", "frontmatter-filename", `${expectedId}: id matches filename`));
    }
  }
  return results;
}

function checkReqRequiredFields(reqDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const required = ["id", "title", "created", "updated", "tags"];
  const files = listFiles(reqDir).filter((f) => f.startsWith("REQ-") && f !== "README.md");
  for (const file of files) {
    const fullPath = path.join(reqDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) {
      results.push(ng("REQ", "required-fields", `No frontmatter to validate`, resolveRelative(fullPath, root)));
      continue;
    }
    const missing = required.filter((k) => fm[k] === undefined || fm[k] === "");
    if (missing.length > 0) {
      results.push(
        ng("REQ", "required-fields", `Missing required fields: ${missing.join(", ")}`, resolveRelative(fullPath, root))
      );
    } else {
      results.push(ok("REQ", "required-fields", `${file}: all required fields present`));
    }
  }
  return results;
}

function checkReqReadmeIndexSync(reqDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqFiles = listFiles(reqDir).filter((f) => f.startsWith("REQ-") && f !== "README.md");
  const reqIds = new Set(reqFiles.map((f) => f.replace(".md", "")));

  const readmePath = path.join(reqDir, "README.md");
  const readmeContent = readText(readmePath);
  if (!readmeContent) {
    results.push(ng("REQ", "readme-index-sync", `README.md not found in ${resolveRelative(reqDir, root)}`));
    return results;
  }

  const indexedIds = extractReadmeTableReqIds(readmeContent);

  const missingFromIndex = [...reqIds].filter((id) => !indexedIds.has(id));
  const phantomEntries = [...indexedIds].filter((id) => !reqIds.has(id));

  if (missingFromIndex.length > 0) {
    for (const id of missingFromIndex) {
      results.push(ng("REQ", "readme-index-sync", `${id} exists as file but missing from README index`));
    }
  }
  if (phantomEntries.length > 0) {
    for (const id of phantomEntries) {
      results.push(ng("REQ", "readme-index-sync", `${id} listed in README index but no corresponding file`));
    }
  }
  if (missingFromIndex.length === 0 && phantomEntries.length === 0) {
    results.push(ok("REQ", "readme-index-sync", `All ${reqIds.size} REQ files match README index`));
  }
  return results;
}

function checkAdrReqCrossReference(reqDir: string, adrDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqFiles = listFiles(reqDir).filter((f) => f.startsWith("REQ-"));
  const adrFiles = listFiles(adrDir).filter((f) => f.startsWith("ADR-"));
  const existingAdrIds = new Set(adrFiles.map((f) => f.replace(".md", "")));
  const existingReqIds = new Set(reqFiles.map((f) => f.replace(".md", "")));

  for (const file of reqFiles) {
    const fullPath = path.join(reqDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const references = content.match(/\bADR-\d{4}\b/g) || [];
    const uniqueRefs = [...new Set(references)];
    for (const ref of uniqueRefs) {
      if (!existingAdrIds.has(ref)) {
        results.push(ng("ADR", "adr-req-crossref", `${ref} referenced in ${file} but ADR file does not exist`));
      }
    }
  }

  for (const file of adrFiles) {
    const fullPath = path.join(adrDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const references = content.match(/\bREQ-\d{4}\b/g) || [];
    const uniqueRefs = [...new Set(references)];
    for (const ref of uniqueRefs) {
      if (!existingReqIds.has(ref)) {
        results.push(ng("ADR", "adr-req-crossref", `${ref} referenced in ${file} but REQ file does not exist`));
      }
    }
  }

  const reqRefErrors = results.filter((r) => r.level === "ng").length;
  if (reqRefErrors === 0) {
    results.push(ok("ADR", "adr-req-crossref", "All ADR ↔ REQ cross-references are valid"));
  }
  return results;
}

function checkLoadSkillsExistence(cmdDir: string, skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const skillDirs = new Set(listDirs(skillsDir));
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    const loadSkills = extractLoadSkills(fm);
    for (const skill of loadSkills) {
      if (!skillDirs.has(skill)) {
        results.push(
          ng("Skill", "load-skills-existence", `Skill '${skill}' referenced in ${file} does not exist under .opencode/skills/`)
        );
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("Skill", "load-skills-existence", "All load_skills references point to existing skill directories"));
  }
  return results;
}

function checkSkillAgentdevPrefix(skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const dirs = listDirs(skillsDir);

  for (const dir of dirs) {
    if (dir.startsWith("agentdev-")) {
      results.push(ok("Skill", "skill-prefix", `${dir}: follows agentdev- naming convention`));
    } else {
      results.push(info("Skill", "skill-prefix", `${dir}: does not follow agentdev- prefix convention`));
    }
  }
  return results;
}

function checkUnusedSkills(cmdDir: string, skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const allSkillDirs = new Set(listDirs(skillsDir));
  const referencedSkills = new Set<string>();

  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    const loadSkills = extractLoadSkills(fm);
    for (const s of loadSkills) referencedSkills.add(s);
  }

  const unused = [...allSkillDirs].filter((s) => !referencedSkills.has(s));
  if (unused.length > 0) {
    for (const s of unused) {
      results.push(info("Skill", "unused-skills", `${s}: not referenced by any command's load_skills`));
    }
  }
  if (unused.length === 0) {
    results.push(ok("Skill", "unused-skills", "All skills are referenced by at least one command"));
  }
  return results;
}

function checkCommandReadmeSync(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  const cmdFileNames = new Set(cmdFiles.map((f) => f.replace(".md", "")));

  const readmePath = path.join(cmdDir, "README.md");
  const readmeContent = readText(readmePath);
  if (!readmeContent) {
    results.push(ng("Command", "command-readme-sync", `README.md not found in ${resolveRelative(cmdDir, root)}`));
    return results;
  }

  const indexedCommands = extractReadmeTableCommands(readmeContent);

  const missingFromIndex = [...cmdFileNames].filter((name) => !indexedCommands.has(name));
  const phantomEntries = [...indexedCommands].filter((name) => !cmdFileNames.has(name));

  if (missingFromIndex.length > 0) {
    for (const name of missingFromIndex) {
      results.push(ng("Command", "command-readme-sync", `${name}.md exists but not listed in README table`));
    }
  }
  if (phantomEntries.length > 0) {
    for (const name of phantomEntries) {
      results.push(ng("Command", "command-readme-sync", `${name} listed in README table but no corresponding .md file`));
    }
  }
  if (missingFromIndex.length === 0 && phantomEntries.length === 0) {
    results.push(ok("Command", "command-readme-sync", "All command files match README index"));
  }
  return results;
}

function checkExpandedReadmeSync(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  const cmdFileNames = new Set(cmdFiles.map((f) => f.replace(".md", "")));

  const targets: { label: string; absPath: string }[] = [
    { label: "root README", absPath: path.join(root, "README.md") },
    { label: "system.md", absPath: path.join(root, "docs", "specs", "system.md") },
  ];

  for (const { label, absPath } of targets) {
    const content = readText(absPath);
    if (!content) {
      results.push(info("Command", "expanded-readme-sync", `${label} not found at ${resolveRelative(absPath, root)}`));
      continue;
    }

    const missingInDoc = [...cmdFileNames].filter((name) => !content.includes(name));

    if (missingInDoc.length > 0) {
      for (const name of missingInDoc) {
        results.push(ng("Command", "expanded-readme-sync", `${name} exists in agentdev/ but not found in ${label}`));
      }
    }
    if (missingInDoc.length === 0) {
      results.push(ok("Command", "expanded-readme-sync", `All commands in agentdev/ are referenced in ${label}`));
    }
  }
  return results;
}

function checkCommandInventory(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  const required = ["description", "agent", "load_skills"];

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) {
      results.push(ng("Command", "command-inventory", `No frontmatter found`, resolveRelative(fullPath, root)));
      continue;
    }
    const missing = required.filter((k) => fm[k] === undefined || fm[k] === "");
    if (missing.length > 0) {
      results.push(
        ng("Command", "command-inventory", `Missing frontmatter fields: ${missing.join(", ")}`, resolveRelative(fullPath, root))
      );
    } else {
      results.push(ok("Command", "command-inventory", `${file}: frontmatter complete`));
    }
  }
  return results;
}

function checkLegacyNamespace(skillsDir: string, cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const filesToCheck: string[] = [];

  const skillDirs = listDirs(skillsDir);
  for (const dir of skillDirs) {
    const skillMd = path.join(skillsDir, dir, "SKILL.md");
    if (fs.existsSync(skillMd)) filesToCheck.push(skillMd);
  }

  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md" && f !== "integrity-check.md");
  for (const file of cmdFiles) {
    filesToCheck.push(path.join(cmdDir, file));
  }

  let foundLegacy = false;
  for (const filePath of filesToCheck) {
    const content = readText(filePath);
    if (!content) continue;
    const relPath = resolveRelative(filePath, root);
    for (const { pattern, name } of LEGACY_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        foundLegacy = true;
        results.push(ng("Namespace", "legacy-namespace", `Legacy pattern '${name}' found`, relPath));
      }
    }
  }

  if (!foundLegacy) {
    results.push(ok("Namespace", "legacy-namespace", "No legacy namespace patterns detected"));
  }
  return results;
}

function checkNameCollision(skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const dirs = listDirs(skillsDir);
  const seen = new Map<string, string>();

  let hasCollision = false;
  for (const dir of dirs) {
    if (seen.has(dir)) {
      hasCollision = true;
      results.push(
        ng("Namespace", "name-collision", `Duplicate skill directory name: ${dir} (also seen as ${seen.get(dir)})`)
      );
    } else {
      seen.set(dir, dir);
    }
  }

  if (!hasCollision) {
    results.push(ok("Namespace", "name-collision", "No skill name collisions detected"));
  }
  return results;
}

// ─── Completion report format validation (REQ-0024-017, REQ-0024-018) ──────

function buildCompletionReportSections(completionReportsPath: string): Map<string, string[]> {
  const content = readText(completionReportsPath);
  const sections = new Map<string, string[]>();
  if (!content) return sections;

  // Try new format: variant registry table with paths like completion-reports/{cmd}/{variant}.md
  const variantPathRegex = /completion-reports\/([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*\.md)/g;
  let hasRegistry = false;
  let match;
  while ((match = variantPathRegex.exec(content)) !== null) {
    hasRegistry = true;
    const cmd = match[1];
    const variant = match[2];
    const existing = sections.get(cmd) || [];
    if (!existing.includes(variant)) {
      existing.push(variant);
    }
    sections.set(cmd, existing);
  }

  // Fall back to old format: ## {cmd} 完了時 headers
  if (!hasRegistry) {
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      const headerMatch = trimmed.match(/^##\s+(.+)$/);
      if (headerMatch) {
        const header = headerMatch[1];
        const cmdMatch = header.match(/^([a-z]+-[a-z]+(?:-[a-z]+)*)\s+完了時/);
        if (cmdMatch) {
          sections.set(cmdMatch[1], ["完了時"]);
        }
      }
    }
  }

  return sections;
}

function checkCompletionReportSkills(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  let allOk = true;

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    const loadSkills = extractLoadSkills(fm);
    if (!loadSkills.includes("agentdev-workflow-reporting")) {
      allOk = false;
      results.push(
        ng(
          "CompletionReport",
          "load-skills-reporting",
          `Missing 'agentdev-workflow-reporting' in load_skills`,
          resolveRelative(fullPath, root)
        )
      );
    }
  }

  if (allOk && cmdFiles.length > 0) {
    results.push(ok("CompletionReport", "load-skills-reporting", "All commands reference agentdev-workflow-reporting in load_skills"));
  }
  return results;
}

function checkCompletionReportTemplates(cmdDir: string, completionReportsPath: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const sections = buildCompletionReportSections(completionReportsPath);
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  const usesVariantRegistry = hasVariantRegistry(completionReportsPath);
  const variantBaseDir = getCompletionReportsDir(completionReportsPath);

  for (const file of cmdFiles) {
    const cmdName = file.replace(".md", "");
    if (cmdName === "integrity-check") continue;

    const hasRegistryEntry = sections.has(cmdName);
    // When variant registry is used, also accept on-disk variant files as valid
    const hasVariantDir = usesVariantRegistry && fs.existsSync(path.join(variantBaseDir, cmdName));

    if (!hasRegistryEntry && !hasVariantDir) {
      results.push(
        ng(
          "CompletionReport",
          "template-section-existence",
          `No completion report section found for command '${cmdName}' in completion-reports.md`
        )
      );
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("CompletionReport", "template-section-existence", "All commands have corresponding sections in completion-reports.md"));
  }
  return results;
}

function checkInlineCompletionReports(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  let foundViolation = false;

  const completionPatterns = [
    /✅/,
    /完了/,
    /次のステップ/,
    /次のコマンド/,
  ];

  const errorPatterns = [
    /エラー/,
    /Error/i,
    /失敗/,
    /リトライ/,
    /Retry/i,
  ];

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;

    const lines = content.split("\n");
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (!inCodeBlock) continue;

      const hasCompletionPattern = completionPatterns.some((p) => p.test(trimmed));
      if (!hasCompletionPattern) continue;

      const isErrorContext = errorPatterns.some((p) => p.test(trimmed));
      if (isErrorContext) continue;

      foundViolation = true;
      results.push(
        ng(
          "CompletionReport",
          "inline-completion-report",
          `Inline completion report code block detected`,
          resolveRelative(fullPath, root),
          i + 1
        )
      );
      break;
    }
  }

  if (!foundViolation) {
    results.push(ok("CompletionReport", "inline-completion-report", "No inline completion report code blocks detected"));
  }
  return results;
}

// ─── Variant structure checks (REQ-0107-024~027) ──────────────────────────

function getCompletionReportsDir(completionReportsPath: string): string {
  return path.join(path.dirname(completionReportsPath), "completion-reports");
}

function hasVariantRegistry(completionReportsPath: string): boolean {
  const content = readText(completionReportsPath);
  if (!content) return false;
  return /completion-reports\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*\.md/.test(content);
}

function checkVariantExistence(completionReportsPath: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  if (!hasVariantRegistry(completionReportsPath)) return results;

  const variants = buildCompletionReportSections(completionReportsPath);
  const baseDir = getCompletionReportsDir(completionReportsPath);

  if (variants.size === 0) {
    results.push(info("VariantReport", "variant-existence", "No variant registry found in completion-reports.md"));
    return results;
  }

  let foundViolation = false;
  for (const [cmd, expectedVariants] of variants) {
    const cmdDir = path.join(baseDir, cmd);
    if (!fs.existsSync(cmdDir)) {
      foundViolation = true;
      results.push(
        ng("VariantReport", "variant-existence", `Variant directory not found for command '${cmd}'`, resolveRelative(cmdDir, root))
      );
      continue;
    }
    for (const variant of expectedVariants) {
      const variantPath = path.join(cmdDir, variant);
      if (!fs.existsSync(variantPath)) {
        foundViolation = true;
        results.push(
          ng("VariantReport", "variant-existence", `Variant file '${variant}' not found for command '${cmd}'`, resolveRelative(variantPath, root))
        );
      }
    }
  }

  if (!foundViolation) {
    results.push(ok("VariantReport", "variant-existence", "All expected variant files exist"));
  }
  return results;
}

function checkInlineCompletionBodyInCommands(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  let foundViolation = false;

  const bodyPatterns = [
    /✅/,
    /完了コマンド/,
    /次のコマンド/,
  ];

  const errorPatterns = [
    /エラー/,
    /Error/i,
    /失敗/,
    /リトライ/,
    /Retry/i,
  ];

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;

    const lines = content.split("\n");
    let inCodeBlock = false;
    let inGuardrailSection = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      if (/^#{1,4}\s+/.test(trimmed)) {
        inGuardrailSection = /Guardrail/i.test(trimmed) || /制約/.test(trimmed);
        continue;
      }

      if (trimmed.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (!inCodeBlock || inGuardrailSection) continue;

      const hasBody = bodyPatterns.some((p) => p.test(trimmed));
      if (!hasBody) continue;

      const isErrorTemplate = errorPatterns.some((p) => p.test(trimmed));
      if (isErrorTemplate) continue;

      foundViolation = true;
      results.push(
        ng(
          "VariantReport", "inline-completion-body",
          `Inline completion report body text detected (should be in variant file)`,
          resolveRelative(fullPath, root),
          i + 1
        )
      );
      break;
    }
  }

  if (!foundViolation) {
    results.push(ok("VariantReport", "inline-completion-body", "No inline completion report body text detected in command definitions"));
  }
  return results;
}

const VARIANT_REQUIRED_FIELDS = [
  "完了コマンド",
  "対象",
  "結果",
  "検証結果",
  "git 永続化",
  "次のコマンド",
];

function checkVariantRequiredFields(completionReportsPath: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  if (!hasVariantRegistry(completionReportsPath)) return results;

  const variants = buildCompletionReportSections(completionReportsPath);
  const baseDir = getCompletionReportsDir(completionReportsPath);

  if (variants.size === 0) return results;

  let checked = false;
  for (const [cmd, expectedVariants] of variants) {
    const cmdDir = path.join(baseDir, cmd);
    if (!fs.existsSync(cmdDir)) continue;

    for (const variant of expectedVariants) {
      const variantPath = path.join(cmdDir, variant);
      const content = readText(variantPath);
      if (!content) continue;

      checked = true;
      const missing = VARIANT_REQUIRED_FIELDS.filter((field) => !content.includes(field));
      if (missing.length > 0) {
        results.push(
          ng("VariantReport", "variant-required-fields", `Missing required fields: ${missing.join(", ")}`, resolveRelative(variantPath, root))
        );
      }
    }
  }

  if (checked && results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("VariantReport", "variant-required-fields", "All variant files contain all 6 required fields"));
  }
  return results;
}

const FRAGMENT_PATTERNS = [
  { pattern: /完了報告に以下を追加/, name: "完了報告に以下を追加" },
  { pattern: /完了報告に追加/, name: "完了報告に追加" },
  { pattern: /追加報告/, name: "追加報告" },
  { pattern: /DOC-MAP更新時/, name: "DOC-MAP更新時" },
  { pattern: /壁打ち結論ハイライト/, name: "壁打ち結論ハイライト" },
];

function checkFragmentPatterns(completionReportsPath: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  if (!hasVariantRegistry(completionReportsPath)) return results;

  const variants = buildCompletionReportSections(completionReportsPath);
  const baseDir = getCompletionReportsDir(completionReportsPath);

  if (variants.size === 0) return results;

  let foundViolation = false;
  for (const [cmd, expectedVariants] of variants) {
    const cmdDir = path.join(baseDir, cmd);
    if (!fs.existsSync(cmdDir)) continue;

    for (const variant of expectedVariants) {
      const variantPath = path.join(cmdDir, variant);
      const content = readText(variantPath);
      if (!content) continue;

      for (const { pattern, name } of FRAGMENT_PATTERNS) {
        if (pattern.test(content)) {
          foundViolation = true;
          results.push(
            ng(
              "VariantReport", "fragment-patterns",
              `Fragment composition pattern '${name}' found (variants must be self-contained)`,
              resolveRelative(variantPath, root)
            )
          );
        }
      }
    }
  }

  if (!foundViolation) {
    const hasVariantsOnDisk = [...variants.entries()].some(([cmd]) =>
      fs.existsSync(path.join(baseDir, cmd))
    );
    if (hasVariantsOnDisk) {
      results.push(ok("VariantReport", "fragment-patterns", "No fragment composition patterns detected in variant files"));
    }
  }
  return results;
}

// ─── Post-completion output checks (REQ-0024-017, REQ-0024-018) ──────

function checkPostCompletionOutput(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  let foundIssue = false;

  const postCompletionPatterns = [
    /完了報告.*後.*Todo/i,
    /Todo.*一覧.*出力/,
    /TodoWrite.*最終/,
    /最終.*Todo/,
    /次にやるべきことがあれば/,
    /他にご要望があれば/,
    /何かあればお気軽に/,
  ];

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;

    for (const pattern of postCompletionPatterns) {
      if (pattern.test(content)) {
        foundIssue = true;
        results.push(
          warn(
            "CompletionReport",
            "post-completion-output",
            `Post-completion output instruction detected (${pattern.source})`,
            resolveRelative(fullPath, root)
          )
        );
      }
    }
  }

  if (!foundIssue) {
    results.push(ok("CompletionReport", "post-completion-output", "No post-completion output instructions detected"));
  }
  return results;
}

function checkTerminology(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  let foundOld = false;

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (/次のステップ/.test(lines[i])) {
        foundOld = true;
        results.push(
          warn(
            "CompletionReport",
            "old-terminology",
            `Old terminology '次のステップ' found (should be '次のコマンド')`,
            resolveRelative(fullPath, root),
            i + 1
          )
        );
      }
    }
  }

  if (!foundOld) {
    results.push(ok("CompletionReport", "old-terminology", "No old terminology ('次のステップ') detected in command definitions"));
  }
  return results;
}

function checkSpecsExistence(specsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const requiredSpecs = ["system.md", "patterns.md"];

  for (const specFile of requiredSpecs) {
    const fullPath = path.join(specsDir, specFile);
    if (fs.existsSync(fullPath)) {
      results.push(ok("Specs", "specs-existence", `${specFile} exists`));
    } else {
      results.push(ng("Specs", "specs-existence", `${specFile} not found at ${resolveRelative(path.join(specsDir, specFile), root)}`));
    }
  }
  return results;
}

// ─── Link integrity checks (REQ-0108-013) ────────────────────────────────

function collectAllArtifactPaths(root: string): string[] {
  const paths: string[] = [];
  const globs: string[] = [
    path.join(root, "docs", "requirements", "*.md"),
    path.join(root, "docs", "adr", "*.md"),
    path.join(root, "docs", "specs", "*.md"),
    path.join(root, "docs", "guides", "*.md"),
    path.join(root, "docs", "README.md"),
    path.join(root, "docs", "DOC-MAP.md"),
    path.join(root, "README.md"),
  ];
  for (const g of globs) {
    const dir = path.dirname(g);
    if (!fs.existsSync(dir)) continue;
    for (const f of listFiles(dir)) {
      const full = path.join(dir, f);
      if (!paths.includes(full)) paths.push(full);
    }
  }
  return paths;
}

function parseMarkdownLinks(content: string): { text: string; href: string }[] {
  const links: { text: string; href: string }[] = [];
  const regex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const href = match[2].trim();
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#") || href.startsWith("mailto:")) continue;
    // Skip placeholder hrefs like [text](URL) where href is an uppercase word with no path separators
    if (/^[A-Z_]+$/.test(href)) continue;
    links.push({ text: match[1], href });
  }
  return links;
}

function parseHeadings(content: string): Set<string> {
  const headings = new Set<string>();
  for (const line of content.split("\n")) {
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (match) {
      const slug = match[1].trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      headings.add(slug);
    }
  }
  return headings;
}

function resolveLinkTarget(linkHref: string, sourceFilePath: string, root: string): { filePath: string; anchor?: string } | null {
  const parts = linkHref.split("#");
  const linkPath = parts[0];
  const anchor = parts.length > 1 ? parts[1] : undefined;

  if (!linkPath) {
    return { filePath: sourceFilePath, anchor };
  }

  const sourceDir = path.dirname(sourceFilePath);
  const resolved = path.resolve(sourceDir, linkPath);
  return { filePath: resolved, anchor };
}

function checkLinkIntegrity(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const allFiles = collectAllArtifactPaths(root);
  const brokenRefCount = new Map<string, number>();

  for (const filePath of allFiles) {
    const content = readText(filePath);
    if (!content) continue;
    const relPath = resolveRelative(filePath, root);

    const links = parseMarkdownLinks(content);
    for (const link of links) {
      const target = resolveLinkTarget(link.href, filePath, root);
      if (!target) continue;

      if (!fs.existsSync(target.filePath)) {
        const count = (brokenRefCount.get("broken-file-link") ?? 0) + 1;
        brokenRefCount.set("broken-file-link", count);
        const route: FindingRoute = count >= 3 ? "intake+learning" : "intake";
        results.push(ng(
          "LinkIntegrity", "broken-file-link",
          `Link target does not exist: ${link.href}`,
          relPath,
          undefined,
          { evidence: link.href, expected: "file must exist", route }
        ));
        continue;
      }

      if (target.anchor) {
        const targetContent = readText(target.filePath);
        if (targetContent) {
          const headings = parseHeadings(targetContent);
          const normalizedAnchor = target.anchor.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
          if (!headings.has(normalizedAnchor)) {
            const count = (brokenRefCount.get("broken-section-anchor") ?? 0) + 1;
            brokenRefCount.set("broken-section-anchor", count);
            const route: FindingRoute = count >= 3 ? "intake+learning" : "intake";
            results.push(ng(
              "LinkIntegrity", "broken-section-anchor",
              `Section anchor '#${target.anchor}' not found in ${resolveRelative(target.filePath, root)}`,
              relPath,
              undefined,
              { evidence: `#${target.anchor}`, expected: "heading must exist", route }
            ));
          }
        }
      }
    }

    // Check REQ-/ADR- text references
    const reqRefs = content.match(/\bREQ-\d{4}\b/g) || [];
    const uniqueReqRefs = [...new Set(reqRefs)];
    for (const ref of uniqueReqRefs) {
      const activePath = path.join(root, "docs", "requirements", `${ref}.md`);
      const retiredPath = path.join(root, "docs", "requirements", "retired", `${ref}.md`);
      if (!fs.existsSync(activePath) && !fs.existsSync(retiredPath)) {
        const count = (brokenRefCount.get("broken-req-ref") ?? 0) + 1;
        brokenRefCount.set("broken-req-ref", count);
        const route: FindingRoute = count >= 3 ? "intake+learning" : "intake";
        results.push(ng(
          "LinkIntegrity", "broken-req-ref",
          `${ref} referenced but REQ file does not exist`,
          relPath,
          undefined,
          { evidence: ref, expected: `${ref}.md must exist in docs/requirements/`, route }
        ));
      }
    }

    const adrRefs = content.match(/\bADR-\d{4}\b/g) || [];
    const uniqueAdrRefs = [...new Set(adrRefs)];
    for (const ref of uniqueAdrRefs) {
      const adrPath = path.join(root, "docs", "adr", `${ref}.md`);
      if (!fs.existsSync(adrPath)) {
        const count = (brokenRefCount.get("broken-adr-ref") ?? 0) + 1;
        brokenRefCount.set("broken-adr-ref", count);
        const route: FindingRoute = count >= 3 ? "intake+learning" : "intake";
        results.push(ng(
          "LinkIntegrity", "broken-adr-ref",
          `${ref} referenced but ADR file does not exist`,
          relPath,
          undefined,
          { evidence: ref, expected: `${ref}.md must exist in docs/adr/`, route }
        ));
      }
    }

    // Check retired REQ referenced as current requirement
    for (const ref of uniqueReqRefs) {
      const retiredPath = path.join(root, "docs", "requirements", "retired", `${ref}.md`);
      const activePath = path.join(root, "docs", "requirements", `${ref}.md`);
      if (fs.existsSync(retiredPath) && !fs.existsSync(activePath) && !relPath.startsWith("docs/requirements/retired/") && !relPath.endsWith("mapping-table.md")) {
        results.push(warn(
          "LinkIntegrity", "retired-req-as-current",
          `${ref} is retired but referenced in non-retired file`,
          relPath,
          undefined,
          { evidence: ref, expected: "retired REQs should not be referenced as current requirements", route: "intake" }
        ));
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("LinkIntegrity", "link-integrity", "All links and references are valid"));
  }
  return results;
}

// ─── Canonical boundary checks (REQ-0108-014) ────────────────────────────

function checkCanonicalBoundary(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const SHALL_MUST_PATTERN = /\b(SHALL|MUST|必須)\b/g;
  const REQ_TABLE_PATTERN = /\|\s*ID\s*\|\s*要件\s*\|/g;
  const THRESHOLD = 5;

  // Check DOC-MAP
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  const docMapContent = readText(docMapPath);
  if (docMapContent) {
    const matches = docMapContent.match(SHALL_MUST_PATTERN);
    const count = matches ? matches.length : 0;
    if (count > THRESHOLD) {
      results.push(warn(
        "CanonicalBoundary", "docmap-requirements",
        `DOC-MAP contains ${count} requirement keywords (SHALL/MUST), threshold is ${THRESHOLD}`,
        resolveRelative(docMapPath, root),
        undefined,
        { evidence: `${count} SHALL/MUST keywords`, expected: `at most ${THRESHOLD}`, route: "req-define" }
      ));
    }
  }

  // Check guides
  const guidesDir = path.join(root, "docs", "guides");
  if (fs.existsSync(guidesDir)) {
    for (const file of listFiles(guidesDir)) {
      const guidePath = path.join(guidesDir, file);
      const content = readText(guidePath);
      if (!content) continue;
      const tableMatches = content.match(REQ_TABLE_PATTERN);
      const tableCount = tableMatches ? tableMatches.length : 0;
      if (tableCount > 0) {
        results.push(warn(
          "CanonicalBoundary", "guide-req-table",
          `Guide contains requirement-like table pattern (${tableCount} matches)`,
          resolveRelative(guidePath, root),
          undefined,
          { evidence: `| ID | 要件 | pattern x${tableCount}`, expected: "no requirement tables in guides", route: "req-define" }
        ));
      }
    }
  }

  // Check README
  const readmePath = path.join(root, "README.md");
  const readmeContent = readText(readmePath);
  if (readmeContent) {
    const matches = readmeContent.match(SHALL_MUST_PATTERN);
    const count = matches ? matches.length : 0;
    if (count > THRESHOLD) {
      results.push(warn(
        "CanonicalBoundary", "readme-specifications",
        `Root README contains ${count} specification keywords (SHALL/MUST), threshold is ${THRESHOLD}`,
        resolveRelative(readmePath, root),
        undefined,
        { evidence: `${count} SHALL/MUST keywords`, expected: `at most ${THRESHOLD}`, route: "req-define" }
      ));
    }
  }

  if (results.length === 0) {
    results.push(ok("CanonicalBoundary", "canonical-boundary", "No canonical boundary violations detected"));
  }
  return results;
}

// ─── Lifecycle boundary checks (REQ-0108-015) ───────────────────────────

function checkLifecycleBoundary(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqDir = path.join(root, "docs", "requirements");
  const retiredDir = path.join(reqDir, "retired");

  const activeFiles = listFiles(reqDir).filter((f) => f.startsWith("REQ-") && f !== "README.md");
  const activeIds = new Set(activeFiles.map((f) => f.replace(".md", "")));

  const retiredFiles = fs.existsSync(retiredDir) ? listFiles(retiredDir).filter((f) => f.startsWith("REQ-")) : [];
  const retiredIds = new Set(retiredFiles.map((f) => f.replace(".md", "")));

  // (a) Active/retired ID duplication
  for (const id of activeIds) {
    if (retiredIds.has(id)) {
      results.push(ng(
        "LifecycleBoundary", "active-retired-duplication",
        `${id} exists in both active and retired directories`,
        undefined,
        undefined,
        { evidence: `${id}.md in both dirs`, expected: "unique IDs across active and retired", route: "intake" }
      ));
    }
  }

  // (b) Retired IDs in active README index
  const readmePath = path.join(reqDir, "README.md");
  const readmeContent = readText(readmePath);
  if (readmeContent) {
    const indexedIds = extractReadmeTableReqIds(readmeContent);
    for (const id of indexedIds) {
      if (retiredIds.has(id) && !activeIds.has(id)) {
        results.push(ng(
          "LifecycleBoundary", "retired-in-active-index",
          `${id} is retired but still listed in active README index`,
          resolveRelative(readmePath, root),
          undefined,
          { evidence: id, expected: "retired IDs should not appear in active index", route: "intake" }
        ));
      }
    }
  }

  // (c) Retired REQ referenced as primary reference in non-retired docs
  const allDocFiles = collectAllArtifactPaths(root);
  for (const filePath of allDocFiles) {
    const relPath = resolveRelative(filePath, root);
    if (relPath.startsWith("docs/requirements/retired/")) continue;
    if (relPath.endsWith("mapping-table.md")) continue;    const content = readText(filePath);
    if (!content) continue;
    const refs = content.match(/\bREQ-\d{4}\b/g) || [];
    const uniqueRefs = [...new Set(refs)];
    for (const ref of uniqueRefs) {
      if (retiredIds.has(ref) && !activeIds.has(ref)) {
        results.push(warn(
          "LifecycleBoundary", "retired-req-primary-ref",
          `${ref} is retired but referenced in ${relPath}`,
          relPath,
          undefined,
          { evidence: ref, expected: "retired REQs should not be primary references", route: "intake" }
        ));
      }
    }
  }

  // (d) mapping-table.md referencing non-existent old REQ IDs
  const mappingTablePath = path.join(root, "docs", "requirements", "retired", "mapping-table.md");
  const mappingContent = readText(mappingTablePath);
  if (mappingContent) {
    const allReqIds = new Set([...activeIds, ...retiredIds]);
    const refs = mappingContent.match(/\bREQ-\d{4}\b/g) || [];
    const uniqueRefs = [...new Set(refs)];
    for (const ref of uniqueRefs) {
      if (!allReqIds.has(ref)) {
        results.push(ng(
          "LifecycleBoundary", "mapping-table-nonexistent",
          `${ref} referenced in mapping-table.md does not exist`,
          resolveRelative(mappingTablePath, root),
          undefined,
          { evidence: ref, expected: "all REQ references in mapping table must exist", route: "intake" }
        ));
      }
    }
  }

  // (e) Retired REQ missing from mapping table
  if (mappingContent && retiredIds.size > 0) {
    const mappingRefs = new Set((mappingContent.match(/\bREQ-\d{4}\b/g) || []));
    for (const id of retiredIds) {
      if (!mappingRefs.has(id)) {
        results.push(warn(
          "LifecycleBoundary", "retired-missing-from-mapping",
          `${id} is retired but not listed in mapping-table.md`,
          undefined,
          undefined,
          { evidence: id, expected: "all retired REQs should be in mapping table", route: "intake" }
        ));
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0 && results.filter((r) => r.level === "warning").length === 0) {
    results.push(ok("LifecycleBoundary", "lifecycle-boundary", "No lifecycle boundary issues detected"));
  }
  return results;
}

// ─── Expanded legacy namespace check (REQ-0108-016) ──────────────────────

function checkExpandedLegacyNamespace(skillsDir: string, cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const filesToCheck: string[] = [];

  // Existing: skill SKILL.md files
  const skillDirs = listDirs(skillsDir);
  for (const dir of skillDirs) {
    const skillMd = path.join(skillsDir, dir, "SKILL.md");
    if (fs.existsSync(skillMd)) filesToCheck.push(skillMd);
  }

  // Existing: command .md files
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md" && f !== "integrity-check.md");
  for (const file of cmdFiles) {
    filesToCheck.push(path.join(cmdDir, file));
  }

  // NEW: docs/DOC-MAP.md
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  if (fs.existsSync(docMapPath)) filesToCheck.push(docMapPath);

  // NEW: docs/README.md
  const docsReadme = path.join(root, "docs", "README.md");
  if (fs.existsSync(docsReadme)) filesToCheck.push(docsReadme);

  // NEW: docs/guides/*.md
  const guidesDir = path.join(root, "docs", "guides");
  if (fs.existsSync(guidesDir)) {
    for (const f of listFiles(guidesDir)) filesToCheck.push(path.join(guidesDir, f));
  }

  // NEW: docs/specs/*.md
  const specsDir = path.join(root, "docs", "specs");
  if (fs.existsSync(specsDir)) {
    for (const f of listFiles(specsDir)) filesToCheck.push(path.join(specsDir, f));
  }

  // NEW: skills references/*.md (canonical)
  for (const dir of skillDirs) {
    const refsDir = path.join(skillsDir, dir, "references");
    if (fs.existsSync(refsDir)) {
      for (const f of listFiles(refsDir)) filesToCheck.push(path.join(refsDir, f));
    }
  }

  let foundLegacy = false;
  for (const filePath of filesToCheck) {
    const content = readText(filePath);
    if (!content) continue;
    const relPath = resolveRelative(filePath, root);
    for (const { pattern, name } of LEGACY_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        foundLegacy = true;
        results.push(ng("Namespace", "expanded-legacy-namespace", `Legacy pattern '${name}' found`, relPath));
      }
    }
  }

  if (!foundLegacy) {
    results.push(ok("Namespace", "expanded-legacy-namespace", "No legacy namespace patterns detected in expanded file set"));
  }
  return results;
}

// ─── Inventory sync checks (REQ-0108-003) ────────────────────────────────

function checkReqRetiredIndexSync(reqDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const retiredDir = path.join(reqDir, "retired");
  const readmePath = path.join(reqDir, "README.md");
  const readmeContent = readText(readmePath);

  if (!fs.existsSync(retiredDir)) {
    results.push(info("Inventory", "req-retired-index", "No retired directory found"));
    return results;
  }

  if (!readmeContent) {
    results.push(ng("Inventory", "req-retired-index", "README.md not found in requirements dir"));
    return results;
  }

  // Check README has guidance/link to retired section
  if (!readmeContent.includes("retired") && !readmeContent.includes("Retired")) {
    results.push(ng(
      "Inventory", "req-retired-index",
      "README.md does not mention or link to retired REQs section",
      resolveRelative(readmePath, root),
      undefined,
      { evidence: "no 'retired' mention in README", expected: "README should link to retired section", route: "intake" }
    ));
  } else {
    results.push(ok("Inventory", "req-retired-index", "README links to retired REQs section"));
  }
  return results;
}

function checkDocMapReqSync(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  const docMapContent = readText(docMapPath);

  if (!docMapContent) {
    results.push(info("Inventory", "docmap-req-sync", "DOC-MAP.md not found"));
    return results;
  }

  const reqDir = path.join(root, "docs", "requirements");
  const reqFiles = listFiles(reqDir).filter((f) => f.startsWith("REQ-") && f !== "README.md");
  const reqIds = new Set(reqFiles.map((f) => f.replace(".md", "")));

  // Check REQ references in DOC-MAP
  const docMapReqRefs = docMapContent.match(/\bREQ-\d{4}\b/g) || [];
  const uniqueRefs = [...new Set(docMapReqRefs)];

  for (const ref of uniqueRefs) {
    if (!reqIds.has(ref)) {
      results.push(ng(
        "Inventory", "docmap-req-sync",
        `${ref} referenced in DOC-MAP but REQ file does not exist`,
        resolveRelative(docMapPath, root),
        undefined,
        { evidence: ref, expected: "DOC-MAP REQ references must match existing files", route: "intake" }
      ));
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("Inventory", "docmap-req-sync", "All DOC-MAP REQ references match existing files"));
  }
  return results;
}

function checkDocMapSpecSync(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  const docMapContent = readText(docMapPath);

  if (!docMapContent) {
    results.push(info("Inventory", "docmap-spec-sync", "DOC-MAP.md not found"));
    return results;
  }

  const specsDir = path.join(root, "docs", "specs");
  const specFiles = listFiles(specsDir);
  const specNames = new Set(specFiles);

  // Check file links to specs in DOC-MAP
  const links = parseMarkdownLinks(docMapContent);
  for (const link of links) {
    const target = resolveLinkTarget(link.href, docMapPath, root);
    if (!target) continue;
    const rel = path.relative(root, target.filePath).replace(/\\/g, "/");
    if (rel.startsWith("docs/specs/")) {
      const specFileName = path.basename(target.filePath);
      if (!specNames.has(specFileName) && !fs.existsSync(target.filePath)) {
        results.push(ng(
          "Inventory", "docmap-spec-sync",
          `DOC-MAP links to spec '${specFileName}' which does not exist`,
          resolveRelative(docMapPath, root),
          undefined,
          { evidence: link.href, expected: "linked spec must exist", route: "intake" }
        ));
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("Inventory", "docmap-spec-sync", "All DOC-MAP spec references are valid"));
  }
  return results;
}

function checkDocMapGuideSync(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  const docMapContent = readText(docMapPath);

  if (!docMapContent) {
    results.push(info("Inventory", "docmap-guide-sync", "DOC-MAP.md not found"));
    return results;
  }

  const guidesDir = path.join(root, "docs", "guides");
  const guideFiles = fs.existsSync(guidesDir) ? listFiles(guidesDir) : [];
  const guideNames = new Set(guideFiles);

  const links = parseMarkdownLinks(docMapContent);
  for (const link of links) {
    const target = resolveLinkTarget(link.href, docMapPath, root);
    if (!target) continue;
    const rel = path.relative(root, target.filePath).replace(/\\/g, "/");
    if (rel.startsWith("docs/guides/")) {
      const guideFileName = path.basename(target.filePath);
      if (!guideNames.has(guideFileName) && !fs.existsSync(target.filePath)) {
        results.push(ng(
          "Inventory", "docmap-guide-sync",
          `DOC-MAP links to guide '${guideFileName}' which does not exist`,
          resolveRelative(docMapPath, root),
          undefined,
          { evidence: link.href, expected: "linked guide must exist", route: "intake" }
        ));
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("Inventory", "docmap-guide-sync", "All DOC-MAP guide references are valid"));
  }
  return results;
}

function checkAdrReadmeIndexSync(adrDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const adrFiles = listFiles(adrDir).filter((f) => f.startsWith("ADR-") && f !== "README.md");
  const adrIds = new Set(adrFiles.map((f) => f.replace(".md", "")));

  const readmePath = path.join(adrDir, "README.md");
  const readmeContent = readText(readmePath);
  if (!readmeContent) {
    results.push(info("Inventory", "adr-readme-index", "ADR README.md not found"));
    return results;
  }

  const indexedIds = new Set<string>();
  for (const line of readmeContent.split("\n")) {
    const match = line.match(/\b(ADR-\d{4})\b/);
    if (match) indexedIds.add(match[1]);
  }

  const missingFromIndex = [...adrIds].filter((id) => !indexedIds.has(id));
  const phantomEntries = [...indexedIds].filter((id) => !adrIds.has(id));

  for (const id of missingFromIndex) {
    results.push(ng("Inventory", "adr-readme-index", `${id} exists as file but missing from ADR README index`));
  }
  for (const id of phantomEntries) {
    results.push(ng("Inventory", "adr-readme-index", `${id} listed in ADR README index but no corresponding file`));
  }

  if (missingFromIndex.length === 0 && phantomEntries.length === 0) {
    results.push(ok("Inventory", "adr-readme-index", `All ${adrIds.size} ADR files match README index`));
  }
  return results;
}

// ─── Implementation pattern checks (REQ-0108-022~024) ─────────────────────

function checkImplementationPattern(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const pattern = fm["implementation_pattern"];
    if (!pattern || (typeof pattern === "string" && pattern.trim() === "")) {
      results.push(
        ng("Implementation Pattern", "implementation-pattern", `command ${file} に implementation_pattern が定義されていない`, resolveRelative(fullPath, root), undefined, { evidence: "implementation_pattern field missing", route: "req-define" })
      );
      continue;
    }

    if (typeof pattern !== "string" || !IMPLEMENTATION_PATTERNS.includes(pattern as any)) {
      results.push(
        ng("Implementation Pattern", "implementation-pattern", `command ${file} の implementation_pattern '${pattern}' は未知のパターン`, resolveRelative(fullPath, root), undefined, { evidence: String(pattern), expected: `one of: ${IMPLEMENTATION_PATTERNS.join(", ")}`, route: "req-define" })
      );
    }

    const secondaryPattern = fm["secondary_pattern"];
    if (secondaryPattern && typeof secondaryPattern === "string" && secondaryPattern.trim() !== "") {
      if (!IMPLEMENTATION_PATTERNS.includes(secondaryPattern as any)) {
        results.push(
          ng("Implementation Pattern", "implementation-pattern", `command ${file} の secondary_pattern '${secondaryPattern}' は未知のパターン`, resolveRelative(fullPath, root), undefined, { evidence: String(secondaryPattern), expected: `one of: ${IMPLEMENTATION_PATTERNS.join(", ")}`, route: "req-define" })
        );
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("Implementation Pattern", "implementation-pattern", "All commands have valid implementation patterns"));
  }
  return results;
}

function checkPatternProhibitions(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const pattern = fm["implementation_pattern"];
    if (typeof pattern !== "string") continue;

    const primaryProhibited = PATTERN_PROHIBITED_SKILLS[pattern] || [];
    const secondaryPattern = fm["secondary_pattern"];
    const secondaryStr = typeof secondaryPattern === "string" && secondaryPattern.trim() !== "" ? secondaryPattern.trim() : undefined;
    const secondaryProhibited = secondaryStr ? (PATTERN_PROHIBITED_SKILLS[secondaryStr] || []) : [];
    const allProhibited = [...new Set([...primaryProhibited, ...secondaryProhibited])];
    if (allProhibited.length > 0) {
      const loadSkills = extractLoadSkills(fm);
      const violations = loadSkills.filter((s) => allProhibited.includes(s));
      for (const violating of violations) {
        results.push(
          ng("Implementation Pattern", "pattern-prohibitions", `${pattern} command '${file}' が禁止 skill '${violating}' を load_skills に含んでいる`, resolveRelative(fullPath, root), undefined, { evidence: violating, route: "req-define" })
        );
      }
    }

    if (pattern === "manager-orchestrator" && file !== "case-run.md") {
      results.push(
        ng("Implementation Pattern", "pattern-prohibitions", `command '${file}' に manager-orchestrator が設定されているが、manager-orchestrator は case-run.md のみ使用可能`, resolveRelative(fullPath, root), undefined, { evidence: file, expected: "case-run.md", route: "req-define" })
      );
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("Implementation Pattern", "pattern-prohibitions", "No pattern prohibition violations"));
  }
  return results;
}

function checkLoadSkillsConsistency(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const loadSkills = extractLoadSkills(fm);

    if (!loadSkills.includes("agentdev-workflow-reporting")) {
      results.push(
        warn("Implementation Pattern", "load-skills-consistency", `command '${file}' に agentdev-workflow-reporting が load_skills に含まれていない`, resolveRelative(fullPath, root))
      );
    }

    const pattern = fm["implementation_pattern"];
    if (pattern === "manager-orchestrator" && !loadSkills.includes("agentdev-workflow-orchestration")) {
      results.push(
        warn("Implementation Pattern", "load-skills-consistency", `command '${file}' は manager-orchestrator パターンだが agentdev-workflow-orchestration が load_skills に含まれていない`, resolveRelative(fullPath, root))
      );
    }
  }

  if (results.filter((r) => r.level === "warning").length === 0) {
    results.push(ok("Implementation Pattern", "load-skills-consistency", "All commands have consistent load_skills"));
  }
  return results;
}

// ─── Implementation pattern diagnostics (REQ-0108-026~038) ─────────────────

interface CommandPatternEntry {
  primary: string;
  secondary?: string;
}

// PATTERN_EXPECTED_CONCERNS removed (REQ-0108-047):
// Responsibility-based load_skills checks now read skill USE FOR / DO NOT USE FOR
// instead of relying on fixed concern substrings + name matching.

interface SkillResponsibility {
  useFor: string;
  doNotUseFor: string;
}

const STOP_WORDS = new Set([
  "also", "from", "this", "that", "with", "for", "not", "the", "and", "but",
  "are", "has", "can", "use", "used", "when", "which", "their", "these",
  "those", "other", "should", "would", "could", "does", "specific", "determine",
  "include", "using", "based", "command", "skill", "について", "すること", "する場合",
  "しない", "こと", "ため", "おく", "また", "よい", " where", "whose",
]);

function buildSkillResponsibilityCache(skillsDir: string): Map<string, SkillResponsibility> {
  const cache = new Map<string, SkillResponsibility>();
  for (const dir of listDirs(skillsDir)) {
    const skillMdPath = path.join(skillsDir, dir, "SKILL.md");
    const content = readText(skillMdPath);
    if (!content) continue;
    const useFor = extractSection(content, "USE FOR") || "";
    const doNotUseFor = extractSection(content, "DO NOT USE FOR") || "";
    cache.set(dir, { useFor, doNotUseFor });
  }
  return cache;
}

function isAnalysisOrGuidelineSkill(useFor: string): boolean {
  return /分析|analysis|guideline|ガイドライン|診断|diagnostic|検査|inspection|整合性|integrity|validation|検証|compliance|適合|評価|assessment|基準|品質|quality/.test(useFor);
}

function extractSignificantWords(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[|\-`#*>]/g, " ")
      .split(/[\s,.;:!?(){}\[\]\/\\]+/)
      .filter(w => w.length > 2)
      .filter(w => !STOP_WORDS.has(w))
  );
}

function parseCommandMap(commandMapPath: string): {
  commandPatterns: Map<string, CommandPatternEntry>;
  patternProhibitions: Map<string, string[]>;
} {
  const content = readText(commandMapPath);
  const commandPatterns = new Map<string, CommandPatternEntry>();
  const patternProhibitions = new Map<string, string[]>();

  if (!content) return { commandPatterns, patternProhibitions };

  let currentSection: "correspondence" | "prohibitions" | null = null;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (/^###\s/.test(trimmed)) {
      if (trimmed.includes("Command") && trimmed.includes("Pattern Correspondence")) {
        currentSection = "correspondence";
      } else if (trimmed.includes("禁止")) {
        currentSection = "prohibitions";
      } else {
        currentSection = null;
      }
      continue;
    }

    if (/^##\s/.test(trimmed) && currentSection !== null) {
      currentSection = null;
      continue;
    }

    if (!trimmed.startsWith("|") || /^[\s|:-]+$/.test(trimmed)) continue;

    if (currentSection === "correspondence") {
      const cells = trimmed.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
      if (cells.length >= 2) {
        const cmdMatch = cells[0].match(/agentdev\/([a-z][a-z0-9-]*)/);
        if (cmdMatch) {
          const cmdName = cmdMatch[1];
          const primary = cells[1].replace(/`/g, "").trim();
          const secondaryRaw = cells.length >= 3 ? cells[2].replace(/`/g, "").trim() : undefined;
          const secondary = secondaryRaw && secondaryRaw !== "—" ? secondaryRaw : undefined;
          commandPatterns.set(cmdName, { primary, secondary });
        }
      }
    } else if (currentSection === "prohibitions") {
      const cells = trimmed.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
      if (cells.length >= 2) {
        const patternName = cells[0].replace(/\*\*/g, "").trim();
        const skillsRaw = cells[1];
        if (patternName && !skillsRaw.includes("なし")) {
          const skills = [...skillsRaw.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
          if (skills.length > 0) {
            patternProhibitions.set(patternName, skills);
          }
        }
      }
    }
  }

  return { commandPatterns, patternProhibitions };
}

function extractSection(content: string, heading: string): string | null {
  const lines = content.split("\n");
  let inSection = false;
  const sectionLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##\s+/.test(trimmed)) {
      if (trimmed.includes(heading)) {
        inSection = true;
      } else if (inSection) {
        break;
      }
      continue;
    }
    if (inSection) {
      sectionLines.push(line);
    }
  }

  return sectionLines.length > 0 ? sectionLines.join("\n") : null;
}

function checkCommandMapConsistency(cmdDir: string, root: string, commandMapPath: string): CheckResult[] {
  const results: CheckResult[] = [];
  const { commandPatterns } = parseCommandMap(commandMapPath);

  if (commandPatterns.size === 0) {
    results.push(info("Implementation Pattern", "command-map-consistency", "[recommendation: no-action] No command patterns parsed from command-map.md"));
    return results;
  }

  const validPatterns = new Set<string>(IMPLEMENTATION_PATTERNS);

  for (const [cmdName, entry] of commandPatterns) {
    if (!validPatterns.has(entry.primary)) {
      results.push(ng(
        "Implementation Pattern", "command-map-consistency",
        `[recommendation: integrity-check-gap] command-map.md: command '${cmdName}' has unknown primary pattern '${entry.primary}'`,
        resolveRelative(commandMapPath, root),
        undefined,
        { evidence: entry.primary, expected: `one of: ${IMPLEMENTATION_PATTERNS.join(", ")}`, route: "req-define" }
      ));
    }

    if (entry.secondary && !validPatterns.has(entry.secondary)) {
      results.push(ng(
        "Implementation Pattern", "command-map-consistency",
        `[recommendation: integrity-check-gap] command-map.md: command '${cmdName}' has unknown secondary pattern '${entry.secondary}'`,
        resolveRelative(commandMapPath, root),
        undefined,
        { evidence: entry.secondary, expected: `one of: ${IMPLEMENTATION_PATTERNS.join(", ")}`, route: "req-define" }
      ));
    }

    const cmdFile = path.join(cmdDir, `${cmdName}.md`);
    if (!fs.existsSync(cmdFile)) {
      results.push(ng(
        "Implementation Pattern", "command-map-consistency",
        `[recommendation: integrity-check-gap] command-map.md references '${cmdName}' but no corresponding command file exists`,
        resolveRelative(commandMapPath, root),
        undefined,
        { evidence: cmdName, expected: `${cmdName}.md must exist`, route: "req-define" }
      ));
      continue;
    }

    const content = readText(cmdFile);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const fmPattern = fm["implementation_pattern"];
    if (typeof fmPattern === "string" && fmPattern !== entry.primary) {
      results.push(ng(
        "Implementation Pattern", "command-map-consistency",
        `[recommendation: integrity-check-gap] '${cmdName}' frontmatter has '${fmPattern}' but command-map.md says '${entry.primary}'`,
        resolveRelative(cmdFile, root),
        undefined,
        { evidence: `frontmatter: ${fmPattern}, command-map: ${entry.primary}`, expected: "must match", route: "req-define" }
      ));
    }

    const fmSecondary = fm["secondary_pattern"];
    const fmSecondaryStr = typeof fmSecondary === "string" && fmSecondary.trim() !== "" ? fmSecondary.trim() : undefined;
    const mapSecondary = entry.secondary;

    if (fmSecondaryStr && !mapSecondary) {
      results.push(ng(
        "Implementation Pattern", "command-map-consistency",
        `[recommendation: integrity-check-gap] '${cmdName}' frontmatter has secondary_pattern '${fmSecondaryStr}' but command-map.md has none`,
        resolveRelative(cmdFile, root),
        undefined,
        { evidence: `frontmatter: ${fmSecondaryStr}, command-map: (none)`, expected: "must match", route: "req-define" }
      ));
    } else if (!fmSecondaryStr && mapSecondary) {
      results.push(ng(
        "Implementation Pattern", "command-map-consistency",
        `[recommendation: integrity-check-gap] '${cmdName}' command-map.md has secondary '${mapSecondary}' but frontmatter has none`,
        resolveRelative(cmdFile, root),
        undefined,
        { evidence: `command-map: ${mapSecondary}, frontmatter: (none)`, expected: "must match", route: "req-define" }
      ));
    } else if (fmSecondaryStr && mapSecondary && fmSecondaryStr !== mapSecondary) {
      results.push(ng(
        "Implementation Pattern", "command-map-consistency",
        `[recommendation: integrity-check-gap] '${cmdName}' secondary_pattern mismatch: frontmatter '${fmSecondaryStr}' vs command-map '${mapSecondary}'`,
        resolveRelative(cmdFile, root),
        undefined,
        { evidence: `frontmatter: ${fmSecondaryStr}, command-map: ${mapSecondary}`, expected: "must match", route: "req-define" }
      ));
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(ok("Implementation Pattern", "command-map-consistency", "Command-map patterns are consistent with command files"));
  }

  return results;
}

function checkExcessLoadSkills(cmdDir: string, skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  const skillCache = buildSkillResponsibilityCache(skillsDir);

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const pattern = fm["implementation_pattern"];
    if (typeof pattern !== "string") continue;
    const secondaryPattern = fm["secondary_pattern"];
    const secondaryStr = typeof secondaryPattern === "string" && secondaryPattern.trim() !== "" ? secondaryPattern.trim() : undefined;

    const loadSkills = extractLoadSkills(fm);
    const cmdName = file.replace(".md", "");
    const cmdContentLower = content.toLowerCase();

    for (const skill of loadSkills) {
      const skillResp = skillCache.get(skill);

      if (!skillResp) continue;

      if (!skillResp.useFor && !skillResp.doNotUseFor) continue;

      if (skillResp.doNotUseFor) {
        if (skillResp.doNotUseFor.includes(cmdName)) {
          results.push(warn(
            "Implementation Pattern", "excess-load-skills",
            `[recommendation: load_skills-remove-candidate] command '${file}' references skill '${skill}' but its DO NOT USE FOR mentions '${cmdName}'`,
            resolveRelative(fullPath, root),
            undefined,
            { evidence: `${skill} DO NOT USE FOR → ${cmdName}`, route: "req-define" }
          ));
          continue;
        }
      }

      if (skillResp.useFor) {
        const useForLower = skillResp.useFor.toLowerCase();

        const isReadOnlyDiag = pattern === "read-only-diagnostic" || secondaryStr === "read-only-diagnostic";
        if (isReadOnlyDiag && isAnalysisOrGuidelineSkill(useForLower)) {
          continue;
        }

        const useForWords = extractSignificantWords(useForLower);
        const cmdWords = extractSignificantWords(cmdContentLower);
        const overlap = [...useForWords].filter(w => cmdWords.has(w));
        if (overlap.length >= 3) continue;

        results.push(info(
          "Implementation Pattern", "excess-load-skills",
          `[recommendation: load_skills-remove-candidate] command '${file}' (pattern: ${pattern}) loads skill '${skill}' — relevance not confirmed from USE FOR, manual review recommended`
        ));
      }
    }
  }

  if (results.length === 0) {
    results.push(ok("Implementation Pattern", "excess-load-skills", "No excess load_skills detected"));
  }

  return results;
}

function checkMissingLoadSkills(cmdDir: string, skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  const skillCache = buildSkillResponsibilityCache(skillsDir);

  const PATTERN_CAPABILITY_KEYWORDS: Record<string, string[]> = {
    "wall-session": ["session", "壁打ち", "要件", "requirement"],
    "file-pipeline": ["file", "save", "保存", "pipeline", "template", "テンプレート"],
    "capture-only": ["capture", "入力", "inbox", "capture"],
    "read-only-diagnostic": ["integrity", "整合性", "validation", "検査", "diagnostic"],
  };

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const pattern = fm["implementation_pattern"];
    if (typeof pattern !== "string") continue;

    const capabilityKeywords = PATTERN_CAPABILITY_KEYWORDS[pattern];
    if (!capabilityKeywords) continue;

    const loadSkills = extractLoadSkills(fm);

    const hasAnyUseFor = loadSkills.some((s) => {
      const resp = skillCache.get(s);
      return resp && resp.useFor;
    });
    if (!hasAnyUseFor) continue;

    const coveredCapabilities = new Set<string>();
    for (const skill of loadSkills) {
      const skillResp = skillCache.get(skill);
      if (!skillResp || !skillResp.useFor) continue;
      const useForLower = skillResp.useFor.toLowerCase();
      for (const kw of capabilityKeywords) {
        if (useForLower.includes(kw.toLowerCase())) {
          coveredCapabilities.add(kw);
        }
      }
    }

    for (const kw of capabilityKeywords) {
      if (!coveredCapabilities.has(kw)) {
        results.push(info(
          "Implementation Pattern", "missing-load-skills",
          `[recommendation: load_skills-add-candidate] command '${file}' (pattern: ${pattern}) — no loaded skill covers capability '${kw}', manual review recommended`
        ));
      }
    }
  }

  if (results.length === 0) {
    results.push(ok("Implementation Pattern", "missing-load-skills", "No missing load_skills concerns detected"));
  }

  return results;
}

function checkUseForConsistency(cmdDir: string, skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");

  const skillToCommands = new Map<string, string[]>();
  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    const loadSkills = extractLoadSkills(fm);
    const cmdName = file.replace(".md", "");
    for (const skill of loadSkills) {
      const cmds = skillToCommands.get(skill) || [];
      cmds.push(cmdName);
      skillToCommands.set(skill, cmds);
    }
  }

  const captureCmds = skillToCommands.get("agentdev-learning-capture") || [];
  for (const cmd of captureCmds) {
    if (cmd === "learning-promote" || cmd === "learning-refine") {
      results.push(warn(
        "Implementation Pattern", "use-for-consistency",
        `[recommendation: skill-use-for-update-candidate] agentdev-learning-capture referenced by '${cmd}' but its DO NOT USE FOR includes elevation/judgment`,
        undefined,
        undefined,
        { evidence: `agentdev-learning-capture → ${cmd}`, route: "req-define" }
      ));
    }
  }

  const pipelineCmds = skillToCommands.get("agentdev-learning-pipeline") || [];
  for (const cmd of pipelineCmds) {
    if (cmd === "case-close") {
      results.push(warn(
        "Implementation Pattern", "use-for-consistency",
        `[recommendation: skill-use-for-update-candidate] agentdev-learning-pipeline referenced by '${cmd}' but its USE FOR is limited to learning-refine/learning-promote`,
        undefined,
        undefined,
        { evidence: `agentdev-learning-pipeline → ${cmd}`, route: "req-define" }
      ));
    }
  }

  const docMapCmds = skillToCommands.get("agentdev-doc-map") || [];
  if (docMapCmds.length === 0 && listDirs(skillsDir).includes("agentdev-doc-map")) {
    results.push(info(
      "Implementation Pattern", "use-for-consistency",
      "[recommendation: no-action] agentdev-doc-map is not referenced by any runtime command's load_skills"
    ));
  }

  const skillDirs = listDirs(skillsDir);
  for (const skillDir of skillDirs) {
    const skillMdPath = path.join(skillsDir, skillDir, "SKILL.md");
    const content = readText(skillMdPath);
    if (!content) continue;

    const doNotUseForSection = extractSection(content, "DO NOT USE FOR");
    if (doNotUseForSection) {
      const cmds = skillToCommands.get(skillDir) || [];
      for (const cmd of cmds) {
        if (doNotUseForSection.includes(cmd)) {
          results.push(warn(
            "Implementation Pattern", "use-for-consistency",
            `[recommendation: skill-use-for-update-candidate] skill '${skillDir}' DO NOT USE FOR mentions '${cmd}' but command references it in load_skills`,
            undefined,
            undefined,
            { evidence: `${skillDir} DO NOT USE FOR → ${cmd}`, route: "req-define" }
          ));
        }
      }
    }
  }

  if (results.length === 0) {
    results.push(ok("Implementation Pattern", "use-for-consistency", "No USE FOR / DO NOT USE FOR inconsistencies detected"));
  }

  return results;
}

function classifyUnusedSkill(skillName: string, skillsDir: string): string {
  if (["agentdev-command-creator", "agentdev-command-authoring", "agentdev-skill-authoring"].includes(skillName)) {
    return "authoring-only";
  }
  const skillMdPath = path.join(skillsDir, skillName, "SKILL.md");
  const content = readText(skillMdPath);
  if (content) {
    if (/deprecated|非推奨/i.test(content)) return "deprecated-candidate";
    if (/not loaded via load_skills/i.test(content)) return "manual-reference";
    if (/intentionally.*excluded|意図的.*除外/i.test(content)) return "intentional-unused";
  }
  return "runtime-unused";
}

function checkUnusedSkillsCategorized(cmdDir: string, skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const allSkillDirs = new Set(listDirs(skillsDir));
  const referencedSkills = new Set<string>();

  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    const loadSkills = extractLoadSkills(fm);
    for (const s of loadSkills) referencedSkills.add(s);
  }

  const unused = [...allSkillDirs].filter((s) => !referencedSkills.has(s));
  if (unused.length > 0) {
    for (const s of unused) {
      const category = classifyUnusedSkill(s, skillsDir);
      results.push(info("Skill", "unused-skills-categorized",
        `[recommendation: no-action] ${s}: not referenced by any command's load_skills (category: ${category})`));
    }
  }
  if (unused.length === 0) {
    results.push(ok("Skill", "unused-skills-categorized", "All skills are referenced by at least one command"));
  }
  return results;
}

function checkSpecReadmeIndexSync(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const specsDir = path.join(root, "docs", "specs");
  const specFiles = listFiles(specsDir).filter((f) => f !== "README.md");
  const specNames = new Set(specFiles);

  const readmePath = path.join(specsDir, "README.md");
  const readmeContent = readText(readmePath);
  if (!readmeContent) {
    results.push(info("Inventory", "spec-readme-index", "Specs README.md not found"));
    return results;
  }

  const readmeFileRefs = new Set<string>();
  const links = parseMarkdownLinks(readmeContent);
  for (const link of links) {
    readmeFileRefs.add(path.basename(link.href));
  }
  // Also check bare filenames in tables
  for (const line of readmeContent.split("\n")) {
    const match = line.match(/\b(\w+\.md)\b/);
    if (match && match[1] !== "README.md") readmeFileRefs.add(match[1]);
  }

  const missingFromIndex = [...specNames].filter((n) => !readmeFileRefs.has(n));
  for (const name of missingFromIndex) {
    results.push(ng("Inventory", "spec-readme-index", `${name} exists but not referenced in specs README`));
  }

  if (missingFromIndex.length === 0) {
    results.push(ok("Inventory", "spec-readme-index", "All spec files referenced in specs README"));
  }
  return results;
}

// ─── Obsolete reference/ directory detection (REQ-0108-039, 040) ──────────

function checkObsoleteReferenceDirs(skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const skillDirs = listDirs(skillsDir);
  let foundObsolete = false;

  for (const dir of skillDirs) {
    const obsoleteDir = path.join(skillsDir, dir, "reference");
    if (fs.existsSync(obsoleteDir)) {
      foundObsolete = true;
      const relDir = resolveRelative(obsoleteDir, root);
      results.push(ng(
        "Canonical", "obsolete-reference-dir",
        `Obsolete 'reference/' directory found (should be 'references/')`,
        relDir,
        undefined,
        { evidence: relDir, expected: "directory should be named 'references/' (canonical)", route: "intake" }
      ));
    }
  }

  if (!foundObsolete) {
    results.push(ok("Canonical", "obsolete-reference-dir", "No obsolete 'reference/' directories found (all use canonical 'references/')"));
  }
  return results;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printHelp(SCRIPT_NAME, DESCRIPTION, USAGE);
    process.exit(EXIT_OK);
  }

  const root = findRepoRoot(import.meta.dir);
  const reqDir = path.join(root, "docs", "requirements");
  const adrDir = path.join(root, "docs", "adr");
  const specsDir = path.join(root, "docs", "specs");
  const skillsDir = path.join(root, ".opencode", "skills");
  const cmdDir = path.join(root, ".opencode", "commands", "agentdev");
  const completionReportsPath = path.join(root, ".opencode", "skills", "agentdev-workflow-reporting", "references", "completion-reports.md");
  const commandMapPath = path.join(root, ".opencode", "skills", "agentdev-workflow-lifecycle", "references", "command-map.md");

  const scanned: Record<string, number> = {
    REQ: listFiles(reqDir).filter((f) => f.startsWith("REQ-")).length,
    ADR: listFiles(adrDir).filter((f) => f.startsWith("ADR-")).length,
    Skill: listDirs(skillsDir).length,
    Command: listFiles(cmdDir).filter((f) => f !== "README.md").length,
    Guides: fs.existsSync(path.join(root, "docs", "guides")) ? listFiles(path.join(root, "docs", "guides")).length : 0,
    Specs: listFiles(specsDir).length,
    RetiredREQ: fs.existsSync(path.join(reqDir, "retired")) ? listFiles(path.join(reqDir, "retired")).filter((f: string) => f.startsWith("REQ-")).length : 0,
    DocMap: fs.existsSync(path.join(root, "docs", "DOC-MAP.md")) ? 1 : 0,
  };

  if (options.dryRun) {
    const targets = [
      `REQ files: ${reqDir} (${scanned.REQ} files)`,
      `ADR files: ${adrDir} (${scanned.ADR} files)`,
      `Specs: ${specsDir}/system.md, ${specsDir}/patterns.md`,
      `Skills: ${skillsDir} (${scanned.Skill} directories)`,
      `Commands: ${cmdDir} (${scanned.Command} files)`,
    ];
    console.log("Dry run - would check:");
    for (const t of targets) console.log(`  ${t}`);
    process.exit(EXIT_OK);
  }

  const results: CheckResult[] = [
    ...checkReqFrontmatterFilename(reqDir, root),
    ...checkReqRequiredFields(reqDir, root),
    ...checkReqReadmeIndexSync(reqDir, root),
    ...checkAdrReqCrossReference(reqDir, adrDir, root),
    ...checkLoadSkillsExistence(cmdDir, skillsDir, root),
    ...checkSkillAgentdevPrefix(skillsDir, root),
    ...checkUnusedSkillsCategorized(cmdDir, skillsDir, root),
    ...checkCommandReadmeSync(cmdDir, root),
    ...checkExpandedReadmeSync(cmdDir, root),
    ...checkCommandInventory(cmdDir, root),
    ...checkLegacyNamespace(skillsDir, cmdDir, root),
    ...checkNameCollision(skillsDir, root),
    ...checkSpecsExistence(specsDir, root),
    ...checkCompletionReportSkills(cmdDir, root),
    ...checkCompletionReportTemplates(cmdDir, completionReportsPath, root),
    ...checkInlineCompletionReports(cmdDir, root),
    ...checkVariantExistence(completionReportsPath, root),
    ...checkInlineCompletionBodyInCommands(cmdDir, root),
    ...checkVariantRequiredFields(completionReportsPath, root),
    ...checkFragmentPatterns(completionReportsPath, root),
    ...checkPostCompletionOutput(cmdDir, root),
    ...checkTerminology(cmdDir, root),
    ...checkLinkIntegrity(root),
    ...checkCanonicalBoundary(root),
    ...checkLifecycleBoundary(root),
    ...checkExpandedLegacyNamespace(skillsDir, cmdDir, root),
    ...checkReqRetiredIndexSync(reqDir, root),
    ...checkDocMapReqSync(root),
    ...checkDocMapSpecSync(root),
    ...checkDocMapGuideSync(root),
    ...checkAdrReadmeIndexSync(adrDir, root),
    ...checkSpecReadmeIndexSync(root),
    ...checkImplementationPattern(cmdDir, root),
    ...checkPatternProhibitions(cmdDir, root),
    ...checkLoadSkillsConsistency(cmdDir, root),
    ...checkCommandMapConsistency(cmdDir, root, commandMapPath),
    ...checkExcessLoadSkills(cmdDir, skillsDir, root),
    ...checkMissingLoadSkills(cmdDir, skillsDir, root),
    ...checkUseForConsistency(cmdDir, skillsDir, root),
    ...checkObsoleteReferenceDirs(skillsDir, root),
  ];

  const summary = computeSummary(results);

  const report: IntegrityReport = {
    timestamp: new Date().toISOString(),
    script: SCRIPT_NAME,
    scanned,
    summary,
    results,
  };

  if (options.json) {
    console.log(formatJsonReport(report));
  } else {
    console.log(formatMarkdownReport(report));
  }

  const reportPath = writeReportFile(root, report);
  console.error(`Report written to: ${reportPath}`);

  process.exit(determineExitCode(summary));
}

main();
