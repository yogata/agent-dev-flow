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
  type CheckResult,
  type IntegrityReport,
  type ScanSummary,
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
    const match = trimmed.match(/\|\s*(REQ-\d+)\s*\|/);
    if (match) ids.add(match[1]);
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

  const scanned: Record<string, number> = {
    REQ: listFiles(reqDir).filter((f) => f.startsWith("REQ-")).length,
    ADR: listFiles(adrDir).filter((f) => f.startsWith("ADR-")).length,
    Skill: listDirs(skillsDir).length,
    Command: listFiles(cmdDir).filter((f) => f !== "README.md").length,
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
    ...checkUnusedSkills(cmdDir, skillsDir, root),
    ...checkCommandReadmeSync(cmdDir, root),
    ...checkExpandedReadmeSync(cmdDir, root),
    ...checkCommandInventory(cmdDir, root),
    ...checkLegacyNamespace(skillsDir, cmdDir, root),
    ...checkNameCollision(skillsDir, root),
    ...checkSpecsExistence(specsDir, root),
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

  process.exit(determineExitCode(summary));
}

main();
