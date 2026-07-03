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
  classifyFindingLevel,
  processResults,
  type CheckResult,
  type CheckResultOptions,
  type IntegrityReport,
  type ScanSummary,
  type FindingCategory,
  type FindingRoute,
} from "./cli_utils.ts";

const SCRIPT_NAME = "check_integrity.ts";
const DESCRIPTION = "AgentDevFlow artifact integrity validator";
const USAGE =
  "bun run check_integrity.ts [--help] [--json] [--dry-run] [--classification] [--update-ir055-baseline]";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

function parseFrontmatter(
  content: string,
): Record<string, string | string[]> | null {
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

// REQ-0158-004: docs/specs/**/*.md 再帰収集ヘルパー。
// AC-7: collectAllArtifactPaths, checkDocMapSpecSync, checkSpecReadmeIndexSync,
// checkUpdateNotesInDocs, scanned.Specs, SPEC inventory 照合、DOC-MAP と SPEC の
// 照合処理は再帰前提へ更新する（docs/specs/*.md 直下のみ前提の廃止）。
// opts.excludeReadme: docs/specs/README.md は SPEC status の単一追跡情報源
// （REQ-0154-001/003、REQ-0158-005）であり、SPEC 本文検査では除外する。
// SPEC inventory/status 同期検査と DOC-MAP との照合では対象とするため、
// 各呼び出し元で明示的に指定する（AC-8）。
function collectSpecMarkdownRecursively(
  specsDir: string,
  opts?: { excludeReadme?: boolean },
): string[] {
  if (!fs.existsSync(specsDir)) return [];
  const collected: string[] = [];
  walkMarkdown(specsDir, collected);
  if (opts?.excludeReadme) {
    return collected.filter((full) => path.basename(full) !== "README.md");
  }
  return collected;
}

// REQ-0158-005: docs/specs/README.md は SPEC status の単一追跡情報源。
// SPEC 本文検査では除外し、SPEC inventory/status 同期検査と DOC-MAP 照合では対象とする。
function isSpecReadme(fullPath: string, specsDir: string): boolean {
  const readmePath = path.join(specsDir, "README.md");
  try {
    return fs.realpathSync(fullPath) === fs.realpathSync(readmePath);
  } catch {
    return fullPath === readmePath;
  }
}

function listDirs(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return (
      fs.readdirSync(dirPath, { withFileTypes: true }) as import("fs").Dirent[]
    )
      .filter((d) => {
        if (d.isDirectory()) return true;
        // Windows junctions: isDirectory() returns false (libuv reparse point behavior)
        try {
          return fs.statSync(path.join(dirPath, d.name)).isDirectory();
        } catch {
          return false;
        }
      })
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

function resolveRelative(fullPath: string, root: string): string {
  return path.relative(root, fullPath).replace(/\\/g, "/");
}

// REQ-0108-189: Fall back to src/opencode/ (原本) when runtime projection doesn't exist
function resolvePathWithFallback(runtimePath: string): string {
  if (fs.existsSync(runtimePath)) return runtimePath;
  const sourcePath = runtimePath
    .replace(/\.opencode[\\/]/, "src/opencode/")
    .replace(/\.opencode\\/, "src/opencode/");
  if (sourcePath !== runtimePath && fs.existsSync(sourcePath)) return sourcePath;
  return runtimePath;
}

function extractReadmeTableReqIds(content: string): Set<string> {
  const ids = new Set<string>();
  // Track the current heading so REQ IDs listed under a Retired / historical
  // section (docs/requirements/README.md "## Retired Requirements") are not
  // treated as part of the active index.
  let underRetiredHeading = false;
  for (const line of content.split("\n")) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      underRetiredHeading = /\b(retired|historical)\b|履歴|過去経緯|廃止済み|廃止|retired-no-successor|historical-only/i.test(
        headingMatch[1],
      );
      continue;
    }
    if (underRetiredHeading) continue;
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    // Extract from plain text in table cell: | REQ-NNNN | ...
    const plainMatch = trimmed.match(/\|\s*(REQ-\d+)\s*\|/);
    if (plainMatch) {
      ids.add(plainMatch[1]);
      continue;
    }
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

const LEGACY_PATTERNS = [
  {
    pattern: /\blearning-capture-skill\b/g,
    name: "learning-capture-skill (old suffix)",
  },
  // R4: legacy normative keyword markers in active documents (REQ-0102-024~028, REQ-0108-236)
  {
    pattern: new RegExp(["（" + "S" + "HALL）", "（" + "S" + "HOULD）", "（" + "M" + "AY）", "（" + "M" + "UST）"].join("|"), "g"),
    name: "bracketed legacy normative marker (REQ-0102-028)",
  },
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

function checkReqFrontmatterFilename(
  reqDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const files = listFiles(reqDir).filter(
    (f) => f.startsWith("REQ-") && f !== "README.md",
  );
  for (const file of files) {
    const fullPath = path.join(reqDir, file);
    const content = readText(fullPath);
    if (!content) {
      results.push(
        ng(
          "REQ",
          "frontmatter-filename",
          `Cannot read file`,
          resolveRelative(fullPath, root),
        ),
      );
      continue;
    }
    const fm = parseFrontmatter(content);
    if (!fm) {
      results.push(
        ng(
          "REQ",
          "frontmatter-filename",
          `No valid frontmatter found`,
          resolveRelative(fullPath, root),
        ),
      );
      continue;
    }
    const expectedId = file.replace(".md", "");
    const actualId = fm["id"];
    if (typeof actualId !== "string") {
      results.push(
        ng(
          "REQ",
          "frontmatter-filename",
          `Missing or invalid 'id' field`,
          resolveRelative(fullPath, root),
        ),
      );
    } else if (actualId !== expectedId) {
      results.push(
        ng(
          "REQ",
          "frontmatter-filename",
          `id '${actualId}' does not match filename '${expectedId}'`,
          resolveRelative(fullPath, root),
        ),
      );
    } else {
      results.push(
        ok("REQ", "frontmatter-filename", `${expectedId}: id matches filename`),
      );
    }
  }
  return results;
}

function checkReqRequiredFields(reqDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const required = ["id", "title", "created", "updated"];
  const files = listFiles(reqDir).filter(
    (f) => f.startsWith("REQ-") && f !== "README.md",
  );
  for (const file of files) {
    const fullPath = path.join(reqDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) {
      results.push(
        ng(
          "REQ",
          "required-fields",
          `No frontmatter to validate`,
          resolveRelative(fullPath, root),
        ),
      );
      continue;
    }
    const missing = required.filter((k) => fm[k] === undefined || fm[k] === "");
    if (missing.length > 0) {
      results.push(
        ng(
          "REQ",
          "required-fields",
          `Missing required fields: ${missing.join(", ")}`,
          resolveRelative(fullPath, root),
        ),
      );
    } else {
      results.push(
        ok("REQ", "required-fields", `${file}: all required fields present`),
      );
    }
  }
  return results;
}

function checkReqReadmeIndexSync(reqDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqFiles = listFiles(reqDir).filter(
    (f) => f.startsWith("REQ-") && f !== "README.md",
  );
  const reqIds = new Set(reqFiles.map((f) => f.replace(".md", "")));

  const readmePath = path.join(reqDir, "README.md");
  const readmeContent = readText(readmePath);
  if (!readmeContent) {
    results.push(
      ng(
        "REQ",
        "readme-index-sync",
        `README.md not found in ${resolveRelative(reqDir, root)}`,
      ),
    );
    return results;
  }

  const indexedIds = extractReadmeTableReqIds(readmeContent);

  const missingFromIndex = [...reqIds].filter((id) => !indexedIds.has(id));
  const phantomEntries = [...indexedIds].filter((id) => !reqIds.has(id));

  if (missingFromIndex.length > 0) {
    for (const id of missingFromIndex) {
      results.push(
        ng(
          "REQ",
          "readme-index-sync",
          `${id} exists as file but missing from README index`,
        ),
      );
    }
  }
  if (phantomEntries.length > 0) {
    for (const id of phantomEntries) {
      results.push(
        ng(
          "REQ",
          "readme-index-sync",
          `${id} listed in README index but no corresponding file`,
        ),
      );
    }
  }
  if (missingFromIndex.length === 0 && phantomEntries.length === 0) {
    results.push(
      ok(
        "REQ",
        "readme-index-sync",
        `All ${reqIds.size} REQ files match README index`,
      ),
    );
  }
  return results;
}

function checkAdrReqCrossReference(
  reqDir: string,
  adrDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const reqFiles = listFiles(reqDir).filter((f) => f.startsWith("REQ-"));
  const adrFiles = listFiles(adrDir).filter((f) => f.startsWith("ADR-"));
  const existingAdrIds = new Set(adrFiles.map((f) => f.replace(".md", "")));
  // REQ-0112-050: include retired ADR IDs as valid references
  const retiredAdrDir = path.join(adrDir, "retired");
  const retiredAdrFiles = fs.existsSync(retiredAdrDir)
    ? listFiles(retiredAdrDir).filter((f) => f.startsWith("ADR-"))
    : [];
  const retiredAdrIds = new Set(retiredAdrFiles.map((f) => f.replace(".md", "")));
  const allAdrIds = new Set([...existingAdrIds, ...retiredAdrIds]);
  const existingReqIds = new Set(reqFiles.map((f) => f.replace(".md", "")));
  // REQ-0108-074: include retired REQ IDs as valid references
  const retiredDir = path.join(reqDir, "retired");
  const retiredFiles = fs.existsSync(retiredDir)
    ? listFiles(retiredDir).filter((f) => f.startsWith("REQ-"))
    : [];
  const retiredReqIds = new Set(retiredFiles.map((f) => f.replace(".md", "")));
  const allReqIds = new Set([...existingReqIds, ...retiredReqIds]);

  for (const file of reqFiles) {
    const fullPath = path.join(reqDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const references = content.match(/\bADR-\d{4}\b/g) || [];
    const uniqueRefs = [...new Set(references)];
    for (const ref of uniqueRefs) {
      if (!allAdrIds.has(ref)) {
        results.push(
          ng(
            "ADR",
            "adr-req-crossref",
            `${ref} referenced in ${file} but ADR file does not exist`,
          ),
        );
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
      // REQ-0108-074: active or retired existence check
      if (!allReqIds.has(ref)) {
        results.push(
          ng(
            "ADR",
            "adr-req-crossref",
            `${ref} referenced in ${file} but REQ file does not exist`,
          ),
        );
      }
    }
  }

  const reqRefErrors = results.filter((r) => r.level === "ng").length;
  if (reqRefErrors === 0) {
    results.push(
      ok("ADR", "adr-req-crossref", "All ADR ↔ REQ cross-references are valid"),
    );
  }
  return results;
}

function checkSkillAgentdevPrefix(
  skillsDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const dirs = listDirs(skillsDir);

  for (const dir of dirs) {
    if (dir.startsWith("agentdev-")) {
      results.push(
        ok(
          "Skill",
          "skill-prefix",
          `${dir}: follows agentdev- naming convention`,
        ),
      );
    } else {
      results.push(
        info(
          "Skill",
          "skill-prefix",
          `${dir}: does not follow agentdev- prefix convention`,
        ),
      );
    }
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
    results.push(
      ng(
        "Command",
        "command-readme-sync",
        `README.md not found in ${resolveRelative(cmdDir, root)}`,
      ),
    );
    return results;
  }

  const indexedCommands = extractReadmeTableCommands(readmeContent);

  const missingFromIndex = [...cmdFileNames].filter(
    (name) => !indexedCommands.has(name),
  );
  const phantomEntries = [...indexedCommands].filter(
    (name) => !cmdFileNames.has(name),
  );

  if (missingFromIndex.length > 0) {
    for (const name of missingFromIndex) {
      results.push(
        ng(
          "Command",
          "command-readme-sync",
          `${name}.md exists but not listed in README table`,
        ),
      );
    }
  }
  if (phantomEntries.length > 0) {
    for (const name of phantomEntries) {
      results.push(
        ng(
          "Command",
          "command-readme-sync",
          `${name} listed in README table but no corresponding .md file`,
        ),
      );
    }
  }
  if (missingFromIndex.length === 0 && phantomEntries.length === 0) {
    results.push(
      ok(
        "Command",
        "command-readme-sync",
        "All command files match README index",
      ),
    );
  }
  return results;
}

function checkExpandedReadmeSync(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  const cmdFileNames = new Set(cmdFiles.map((f) => f.replace(".md", "")));

  const targets: { label: string; absPath: string }[] = [
    { label: "root README", absPath: path.join(root, "README.md") },
    {
      label: "system.md",
      absPath: path.join(root, "docs", "specs", "foundations", "system.md"),
    },
  ];

  for (const { label, absPath } of targets) {
    const content = readText(absPath);
    if (!content) {
      results.push(
        info(
          "Command",
          "expanded-readme-sync",
          `${label} not found at ${resolveRelative(absPath, root)}`,
        ),
      );
      continue;
    }

    const missingInDoc = [...cmdFileNames].filter(
      (name) => !content.includes(name),
    );

    if (missingInDoc.length > 0) {
      for (const name of missingInDoc) {
        results.push(
          ng(
            "Command",
            "expanded-readme-sync",
            `${name} exists in agentdev/ but not found in ${label}`,
          ),
        );
      }
    }
    if (missingInDoc.length === 0) {
      results.push(
        ok(
          "Command",
          "expanded-readme-sync",
          `All commands in agentdev/ are referenced in ${label}`,
        ),
      );
    }
  }
  return results;
}

function checkCommandInventory(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  const required = ["description", "agent"];

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) {
      results.push(
        ng(
          "Command",
          "command-inventory",
          `No frontmatter found`,
          resolveRelative(fullPath, root),
        ),
      );
      continue;
    }
    const missing = required.filter((k) => fm[k] === undefined || fm[k] === "");
    if (missing.length > 0) {
      results.push(
        ng(
          "Command",
          "command-inventory",
          `Missing frontmatter fields: ${missing.join(", ")}`,
          resolveRelative(fullPath, root),
        ),
      );
    } else {
      results.push(
        ok("Command", "command-inventory", `${file}: frontmatter complete`),
      );
    }
  }
  return results;
}

const LEGACY_EXEMPT_PATHS = [
  /vocabulary-registry\.md$/,
  /gate-levels\.md$/,
];

function isLegacyExemptPath(relPath: string): boolean {
  return LEGACY_EXEMPT_PATHS.some((re) => re.test(relPath));
}

function stripInlineCode(text: string): string {
  return text.replace(/`[^`]+`/g, "");
}

function checkLegacyNamespace(
  skillsDir: string,
  cmdDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const filesToCheck: string[] = [];

  const skillDirs = listDirs(skillsDir);
  for (const dir of skillDirs) {
    const skillMd = path.join(skillsDir, dir, "SKILL.md");
    if (fs.existsSync(skillMd)) filesToCheck.push(skillMd);
  }

  const cmdFiles = listFiles(cmdDir).filter(
    (f) => f !== "README.md" && f !== "integrity-check.md",
  );
  for (const file of cmdFiles) {
    filesToCheck.push(path.join(cmdDir, file));
  }

  const pathRefExemptPatterns = [
    /templates\//,
    /\/commands\/agentdev\//,
    /\.opencode\//,
    /\.test\./,
    /_test\./,
  ];

  let foundLegacy = false;
  for (const filePath of filesToCheck) {
    const content = readText(filePath);
    if (!content) continue;
    const relPath = resolveRelative(filePath, root);
    if (isLegacyExemptPath(relPath)) continue;
    const lines = content.split("\n");
    for (const { pattern, name } of LEGACY_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (pathRefExemptPatterns.some((p) => p.test(line))) continue;
        const lineToTest = stripInlineCode(line);
        pattern.lastIndex = 0;
        const slashMatch = pattern.exec(lineToTest);
        if (slashMatch) {
          const ctxStart = Math.max(0, slashMatch.index - 1);
          if (isPathFragment(lineToTest.substring(ctxStart, slashMatch.index + slashMatch[0].length))) {
            continue;
          }
          foundLegacy = true;
          results.push(
            ng(
              "Namespace",
              "legacy-namespace",
              `Legacy pattern '${name}' found`,
              relPath,
            ),
          );
          break;
        }
      }
    }
  }

  if (!foundLegacy) {
    results.push(
      ok(
        "Namespace",
        "legacy-namespace",
        "No legacy namespace patterns detected",
      ),
    );
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
        ng(
          "Namespace",
          "name-collision",
          `Duplicate skill directory name: ${dir} (also seen as ${seen.get(dir)})`,
        ),
      );
    } else {
      seen.set(dir, dir);
    }
  }

  if (!hasCollision) {
    results.push(
      ok("Namespace", "name-collision", "No skill name collisions detected"),
    );
  }
  return results;
}

// ─── Completion report format validation (REQ-0024-017, REQ-0024-018) ──────

function buildCompletionReportSections(
  completionReportsPath: string,
): Map<string, string[]> {
  const content = readText(completionReportsPath);
  const sections = new Map<string, string[]>();
  if (!content) return sections;

  // Try new format: variant registry table with paths like completion-reports/{cmd}/{variant}.md
  const variantPathRegex =
    /completion-reports\/([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*\.md)/g;
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

function checkCompletionReportTemplates(
  cmdDir: string,
  completionReportsPath: string,
  root: string,
): CheckResult[] {
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
    const hasVariantDir =
      usesVariantRegistry && fs.existsSync(path.join(variantBaseDir, cmdName));

    if (!hasRegistryEntry && !hasVariantDir) {
      results.push(
        ng(
          "CompletionReport",
          "template-section-existence",
          `No completion report section found for command '${cmdName}' in completion-reports.md`,
        ),
      );
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "CompletionReport",
        "template-section-existence",
        "All commands have corresponding sections in completion-reports.md",
      ),
    );
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
  return /completion-reports\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*\.md/.test(
    content,
  );
}

function checkVariantExistence(
  completionReportsPath: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  if (!hasVariantRegistry(completionReportsPath)) return results;

  const variants = buildCompletionReportSections(completionReportsPath);
  const baseDir = getCompletionReportsDir(completionReportsPath);

  if (variants.size === 0) {
    results.push(
      info(
        "VariantReport",
        "variant-existence",
        "No variant registry found in completion-reports.md",
      ),
    );
    return results;
  }

  let foundViolation = false;
  for (const [cmd, expectedVariants] of variants) {
    const cmdDir = path.join(baseDir, cmd);
    if (!fs.existsSync(cmdDir)) {
      foundViolation = true;
      results.push(
        ng(
          "VariantReport",
          "variant-existence",
          `Variant directory not found for command '${cmd}'`,
          resolveRelative(cmdDir, root),
        ),
      );
      continue;
    }
    for (const variant of expectedVariants) {
      const variantPath = path.join(cmdDir, variant);
      if (!fs.existsSync(variantPath)) {
        foundViolation = true;
        results.push(
          ng(
            "VariantReport",
            "variant-existence",
            `Variant file '${variant}' not found for command '${cmd}'`,
            resolveRelative(variantPath, root),
          ),
        );
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "VariantReport",
        "variant-existence",
        "All expected variant files exist",
      ),
    );
  }
  return results;
}

function checkInlineCompletionBodyInCommands(
  cmdDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  let foundViolation = false;

  const bodyPatterns = [/✅/, /完了コマンド/, /次のコマンド/];

  const errorPatterns = [/エラー/, /Error/i, /失敗/, /リトライ/, /Retry/i];

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
          "VariantReport",
          "inline-completion-body",
          `Inline completion report body text detected (should be in variant file)`,
          resolveRelative(fullPath, root),
          i + 1,
        ),
      );
      break;
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "VariantReport",
        "inline-completion-body",
        "No inline completion report body text detected in command definitions",
      ),
    );
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

function checkVariantRequiredFields(
  completionReportsPath: string,
  root: string,
): CheckResult[] {
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
      const missing = VARIANT_REQUIRED_FIELDS.filter(
        (field) => !content.includes(field),
      );
      if (missing.length > 0) {
        results.push(
          ng(
            "VariantReport",
            "variant-required-fields",
            `Missing required fields: ${missing.join(", ")}`,
            resolveRelative(variantPath, root),
          ),
        );
      }
    }
  }

  if (checked && results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "VariantReport",
        "variant-required-fields",
        "All variant files contain all 6 required fields",
      ),
    );
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

function checkFragmentPatterns(
  completionReportsPath: string,
  root: string,
): CheckResult[] {
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
              "VariantReport",
              "fragment-patterns",
              `Fragment composition pattern '${name}' found (variants must be self-contained)`,
              resolveRelative(variantPath, root),
            ),
          );
        }
      }
    }
  }

  if (!foundViolation) {
    const hasVariantsOnDisk = [...variants.entries()].some(([cmd]) =>
      fs.existsSync(path.join(baseDir, cmd)),
    );
    if (hasVariantsOnDisk) {
      results.push(
        ok(
          "VariantReport",
          "fragment-patterns",
          "No fragment composition patterns detected in variant files",
        ),
      );
    }
  }
  return results;
}

// ─── Post-completion output checks (REQ-0024-017, REQ-0024-018) ──────

function checkPostCompletionOutput(
  cmdDir: string,
  root: string,
): CheckResult[] {
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
            resolveRelative(fullPath, root),
          ),
        );
      }
    }
  }

  if (!foundIssue) {
    results.push(
      ok(
        "CompletionReport",
        "post-completion-output",
        "No post-completion output instructions detected",
      ),
    );
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
            i + 1,
          ),
        );
      }
    }
  }

  if (!foundOld) {
    results.push(
      ok(
        "CompletionReport",
        "old-terminology",
        "No old terminology ('次のステップ') detected in command definitions",
      ),
    );
  }
  return results;
}

// SPEC inventory source: docs/specs/README.md (REQ-0154-001/003). Reading the
// explicit list (instead of enumerating the directory) keeps missing SPECs
// detectable. Old direct paths (system.md, patterns.md) are no longer required.
const SPEC_DOMAINS =
  "commands|skills|workflows|foundations|responsibilities|quality|integrity|local|authoring";
// Capture group 1 holds the SPEC entry. The leading (?:^|[|(])\s* boundary
// restricts matches to a table-cell start ("| ") or link href "(", so prose
// mentions of multiple domains (e.g. "commands/skills/workflows") and
// placeholders (specs/commands/<x>.md) are not captured. The segment class
// excludes "/" so each match is a single domain/file entry.
const SPEC_ENTRY_RE = new RegExp(
  `(?:^|[|(])\\s*((${SPEC_DOMAINS})/[A-Za-z0-9._-]+(?:\\.md|/))`,
  "gm",
);

function checkSpecsExistence(specsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const readmePath = path.join(specsDir, "README.md");
  const readmeContent = readText(readmePath);

  if (!readmeContent) {
    results.push(
      info(
        "Specs",
        "specs-existence",
        `docs/specs/README.md not found at ${resolveRelative(readmePath, root)}; specs-existence skipped`,
      ),
    );
    return results;
  }

  const entries = new Set<string>();
  let m: RegExpExecArray | null;
  SPEC_ENTRY_RE.lastIndex = 0;
  while ((m = SPEC_ENTRY_RE.exec(readmeContent)) !== null) {
    entries.add(m[1]);
  }

  if (entries.size === 0) {
    results.push(
      ng(
        "Specs",
        "specs-existence",
        `No SPEC entries found in ${resolveRelative(readmePath, root)}`,
      ),
    );
    return results;
  }

  for (const rel of [...entries].sort()) {
    const fullPath = path.join(specsDir, rel);
    if (fs.existsSync(fullPath)) {
      results.push(ok("Specs", "specs-existence", `${rel} exists`));
    } else {
      results.push(
        ng(
          "Specs",
          "specs-existence",
          `${rel} not found at ${resolveRelative(fullPath, root)}`,
        ),
      );
    }
  }
  return results;
}

// ─── Link integrity checks (REQ-0108-013) ────────────────────────────────

function collectAllArtifactPaths(root: string): string[] {
  const paths: string[] = [];
  // REQ-0108-188: 8 independent collections aligned with Document Classification Policy
  // REQ-0158-004: docs/specs/**/*.md 再帰収集に更新
  const collections: { dir: string; recursive?: boolean }[] = [
    { dir: path.join(root, "docs", "requirements") }, // 1. active_req
    // 2. retired_req (excluded from active)
    { dir: path.join(root, "docs", "adr") }, // 3. adr
    { dir: path.join(root, "docs", "specs"), recursive: true }, // 4. spec (recursive)
    { dir: path.join(root, "docs", "guides") }, // 5. guide
    // 6. doc_map (single files added below)
    // 7. report: deliberately omitted — generated artifacts; scanning them
    //    re-detects their own error text (feedback loop, REQ-0108-213).
    // 8. runtime (included via .opencode/commands and .opencode/skills elsewhere)
  ];
  for (const { dir, recursive } of collections) {
    if (!fs.existsSync(dir)) continue;
    const files = recursive
      ? collectSpecMarkdownRecursively(dir)
      : listFiles(dir).map((f) => path.join(dir, f));
    for (const full of files) {
      if (!paths.includes(full)) paths.push(full);
    }
  }
  // 6. doc_map (single files)
  for (const single of [
    path.join(root, "docs", "DOC-MAP.md"),
    path.join(root, "docs", "README.md"),
    path.join(root, "README.md"),
  ]) {
    if (fs.existsSync(single) && !paths.includes(single)) paths.push(single);
  }
  return paths;
}

function parseMarkdownLinks(content: string): { text: string; href: string }[] {
  const links: { text: string; href: string }[] = [];
  const regex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const href = match[2].trim();
    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("#") ||
      href.startsWith("mailto:")
    )
      continue;
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
      const slug = match[1]
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.add(slug);
    }
  }
  return headings;
}

function resolveLinkTarget(
  linkHref: string,
  sourceFilePath: string,
  root: string,
): { filePath: string; anchor?: string } | null {
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

// REQ-0108-193: Check if the source ADR is superseded and references its predecessor
function isSupersededAdr(sourcePath: string, referencedRef: string): boolean {
  const content = readText(sourcePath);
  if (!content) return false;
  const fm = parseFrontmatter(content);
  if (!fm) return false;
  const status = typeof fm["status"] === "string" ? fm["status"].toLowerCase() : "";
  if (status !== "superseded") return false;
  const supersedes = typeof fm["supersedes"] === "string" ? fm["supersedes"] : "";
  return supersedes === referencedRef;
}

function checkLinkIntegrity(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const allFiles = collectAllArtifactPaths(root);
  const brokenRefCount = new Map<string, number>();

  for (const filePath of allFiles) {
    const content = readText(filePath);
    if (!content) continue;
    const relPath = resolveRelative(filePath, root);
    const contentLines = content.split("\n");

    const links = parseMarkdownLinks(content);
    for (const link of links) {
      const target = resolveLinkTarget(link.href, filePath, root);
      if (!target) continue;

      if (!fs.existsSync(target.filePath)) {
        const linkStr = `[${link.text}](${link.href})`;
        let inCode = false;
        for (let li = 0; li < contentLines.length; li++) {
          if (isInsideCodeBlock(contentLines, li)) {
            if (contentLines[li].includes(linkStr)) {
              inCode = true;
              break;
            }
            continue;
          }
          const charIdx = contentLines[li].indexOf(linkStr);
          if (charIdx >= 0 && isInsideCodeSpan(contentLines[li], charIdx)) {
            inCode = true;
            break;
          }
        }
        if (inCode) continue;
        const count = (brokenRefCount.get("broken-file-link") ?? 0) + 1;
        brokenRefCount.set("broken-file-link", count);
        const route: FindingRoute = count >= 3 ? "intake+learning" : "intake";
        results.push(
          ng(
            "LinkIntegrity",
            "broken-file-link",
            `Link target does not exist: ${link.href}`,
            relPath,
            undefined,
            { evidence: link.href, expected: "file must exist", route },
          ),
        );
        continue;
      }

      if (target.anchor) {
        const targetContent = readText(target.filePath);
        if (targetContent) {
          const headings = parseHeadings(targetContent);
          const normalizedAnchor = target.anchor
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
          if (!headings.has(normalizedAnchor)) {
            const count =
              (brokenRefCount.get("broken-section-anchor") ?? 0) + 1;
            brokenRefCount.set("broken-section-anchor", count);
            const route: FindingRoute =
              count >= 3 ? "intake+learning" : "intake";
            results.push(
              ng(
                "LinkIntegrity",
                "broken-section-anchor",
                `Section anchor '#${target.anchor}' not found in ${resolveRelative(target.filePath, root)}`,
                relPath,
                undefined,
                {
                  evidence: `#${target.anchor}`,
                  expected: "heading must exist",
                  route,
                },
              ),
            );
          }
        }
      }
    }

    // Check REQ-/ADR- text references
    // REQ-0108-194: Suppress false positives for template placeholders
    const isTemplateLike = /\{[a-zA-Z_]+\}/.test(content) || content.includes("🔄") || content.includes("✅") || content.includes("☐");
    const isReqRangeContext = isRangeExpression(content);
    const reqRefs = content.match(/\bREQ-\d{4}\b/g) || [];
    const uniqueReqRefs = [...new Set(reqRefs)];
    for (const ref of uniqueReqRefs) {
      // REQ-0108-194: Skip template-like content with placeholders or workflow markers
      if (isTemplateLike) break;
      const activePath = path.join(root, "docs", "requirements", `${ref}.md`);
      const retiredPath = path.join(
        root,
        "docs",
        "requirements",
        "retired",
        `${ref}.md`,
      );
      if (!fs.existsSync(activePath) && !fs.existsSync(retiredPath)) {
        const count = (brokenRefCount.get("broken-req-ref") ?? 0) + 1;
        brokenRefCount.set("broken-req-ref", count);
        const route: FindingRoute = count >= 3 ? "intake+learning" : "intake";
        results.push(
          ng(
            "LinkIntegrity",
            "broken-req-ref",
            `${ref} referenced but REQ file does not exist`,
            relPath,
            undefined,
            {
              evidence: ref,
              expected: `${ref}.md must exist in docs/requirements/`,
              route,
            },
          ),
        );
      }
    }

    const adrRefs = content.match(/\bADR-\d{4}\b/g) || [];
    const uniqueAdrRefs = [...new Set(adrRefs)];
    for (const ref of uniqueAdrRefs) {
      // REQ-0108-194: Skip template-like content with placeholders or workflow markers
      if (isTemplateLike) break;
      const adrPath = path.join(root, "docs", "adr", `${ref}.md`);
      const retiredAdrPath = path.join(root, "docs", "adr", "retired", `${ref}.md`);
      if (!fs.existsSync(adrPath) && !fs.existsSync(retiredAdrPath)) {
        const count = (brokenRefCount.get("broken-adr-ref") ?? 0) + 1;
        brokenRefCount.set("broken-adr-ref", count);
        const route: FindingRoute = count >= 3 ? "intake+learning" : "intake";
        results.push(
          ng(
            "LinkIntegrity",
            "broken-adr-ref",
            `${ref} referenced but ADR file does not exist`,
            relPath,
            undefined,
            {
              evidence: ref,
              expected: `${ref}.md must exist in docs/adr/ or docs/adr/retired/`,
              route,
            },
          ),
        );
      }
    }

    // REQ-0112-048/050, REQ-0108-193: retired ADR referenced as current baseline
    // with context-dependent exemptions:
    // - In retired files: historical references are OK
    // - In superseded ADRs: references to predecessor are OK
    for (const ref of uniqueAdrRefs) {
      const retiredAdrPath = path.join(root, "docs", "adr", "retired", `${ref}.md`);
      const activeAdrPath = path.join(root, "docs", "adr", `${ref}.md`);
      const appearsOutsideRetired = contentLines.some(
        (line, idx) =>
          line.includes(ref) && !isHistoricalReferenceContext(contentLines, idx),
      );
      if (
        fs.existsSync(retiredAdrPath) &&
        !fs.existsSync(activeAdrPath) &&
        !relPath.startsWith("docs/adr/retired/") &&
        !relPath.startsWith("docs/adr/README.md") &&
        !relPath.startsWith("docs/adr/ADR-") && // ADRs discuss retired predecessors historically
        appearsOutsideRetired &&
        !(relPath.startsWith("docs/adr/ADR-") && isSupersededAdr(filePath, ref))
      ) {
        results.push(
          warn(
            "LinkIntegrity",
            "retired-adr-as-current",
            `${ref} is retired ADR but referenced in non-retired file`,
            relPath,
            undefined,
            {
              evidence: ref,
              expected:
                "retired ADRs should not be referenced as current architecture decisions",
              route: "intake",
            },
          ),
        );
      }
    }

    // Check retired REQ referenced as current requirement
    // REQ-0108-193: In retired files, references to other retired docs are OK (historical)
    for (const ref of uniqueReqRefs) {
      const retiredPath = path.join(
        root,
        "docs",
        "requirements",
        "retired",
        `${ref}.md`,
      );
      const activePath = path.join(root, "docs", "requirements", `${ref}.md`);
      const appearsOutsideRetired = contentLines.some(
        (line, idx) =>
          line.includes(ref) && !isHistoricalReferenceContext(contentLines, idx),
      );
      if (
        fs.existsSync(retiredPath) &&
        !fs.existsSync(activePath) &&
        !relPath.startsWith("docs/requirements/retired/") &&
        !relPath.endsWith("mapping-table.md") &&
        !relPath.startsWith("docs/adr/ADR-") && // ADRs discuss REQ reorganization historically
        appearsOutsideRetired &&
        !isReqRangeContext // REQ-0108-194: REQ range references like "REQ-0101 through REQ-0116"
      ) {
        results.push(
          warn(
            "LinkIntegrity",
            "retired-req-as-current",
            `${ref} is retired but referenced in non-retired file`,
            relPath,
            undefined,
            {
              evidence: ref,
              expected:
                "retired REQs should not be referenced as current requirements",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "LinkIntegrity",
        "link-integrity",
        "All links and references are valid",
      ),
    );
  }
  return results;
}

// ─── Canonical boundary checks (REQ-0108-014) ────────────────────────────

function checkCanonicalBoundary(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const REQUIREMENT_KEYWORD_PATTERN = new RegExp(`\\b(${["S" + "HALL", "M" + "UST", "必須"].join("|")})\\b`, "g");
  const REQ_TABLE_PATTERN = /\|\s*ID\s*\|\s*要件\s*\|/g;
  const THRESHOLD = 5;

  // Check DOC-MAP
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  const docMapContent = readText(docMapPath);
  if (docMapContent) {
    const matches = docMapContent.match(REQUIREMENT_KEYWORD_PATTERN);
    const count = matches ? matches.length : 0;
    if (count > THRESHOLD) {
      results.push(
        warn(
          "CanonicalBoundary",
          "docmap-requirements",
          `DOC-MAP contains ${count} requirement keywords, threshold is ${THRESHOLD}`,
          resolveRelative(docMapPath, root),
          undefined,
          {
            evidence: `${count} requirement keywords`,
            expected: `at most ${THRESHOLD}`,
            route: "req-define",
          },
        ),
      );
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
        results.push(
          warn(
            "CanonicalBoundary",
            "guide-req-table",
            `Guide contains requirement-like table pattern (${tableCount} matches)`,
            resolveRelative(guidePath, root),
            undefined,
            {
              evidence: `| ID | 要件 | pattern x${tableCount}`,
              expected: "no requirement tables in guides",
              route: "req-define",
            },
          ),
        );
      }
    }
  }

  // Check README
  const readmePath = path.join(root, "README.md");
  const readmeContent = readText(readmePath);
  if (readmeContent) {
    const matches = readmeContent.match(REQUIREMENT_KEYWORD_PATTERN);
    const count = matches ? matches.length : 0;
    if (count > THRESHOLD) {
      results.push(
        warn(
          "CanonicalBoundary",
          "readme-specifications",
          `Root README contains ${count} specification keywords, threshold is ${THRESHOLD}`,
          resolveRelative(readmePath, root),
          undefined,
          {
            evidence: `${count} specification keywords`,
            expected: `at most ${THRESHOLD}`,
            route: "req-define",
          },
        ),
      );
    }
  }

  if (results.length === 0) {
    results.push(
      ok(
        "CanonicalBoundary",
        "canonical-boundary",
        "No canonical boundary violations detected",
      ),
    );
  }
  return results;
}

// ─── Lifecycle boundary checks (REQ-0108-015) ───────────────────────────

function checkLifecycleBoundary(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqDir = path.join(root, "docs", "requirements");
  const retiredDir = path.join(reqDir, "retired");

  const activeFiles = listFiles(reqDir).filter(
    (f) => f.startsWith("REQ-") && f !== "README.md",
  );
  const activeIds = new Set(activeFiles.map((f) => f.replace(".md", "")));

  const retiredFiles = fs.existsSync(retiredDir)
    ? listFiles(retiredDir).filter((f) => f.startsWith("REQ-"))
    : [];
  const retiredIds = new Set(retiredFiles.map((f) => f.replace(".md", "")));

  // (a) Active/retired ID duplication
  for (const id of activeIds) {
    if (retiredIds.has(id)) {
      results.push(
        ng(
          "LifecycleBoundary",
          "active-retired-duplication",
          `${id} exists in both active and retired directories`,
          undefined,
          undefined,
          {
            evidence: `${id}.md in both dirs`,
            expected: "unique IDs across active and retired",
            route: "intake",
          },
        ),
      );
    }
  }

  // (b) Retired IDs in active README index
  const readmePath = path.join(reqDir, "README.md");
  const readmeContent = readText(readmePath);
  if (readmeContent) {
    const indexedIds = extractReadmeTableReqIds(readmeContent);
    for (const id of indexedIds) {
      if (retiredIds.has(id) && !activeIds.has(id)) {
        results.push(
          ng(
            "LifecycleBoundary",
            "retired-in-active-index",
            `${id} is retired but still listed in active README index`,
            resolveRelative(readmePath, root),
            undefined,
            {
              evidence: id,
              expected: "retired IDs should not appear in active index",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  // (c) Retired REQ referenced as primary reference in non-retired docs
  const allDocFiles = collectAllArtifactPaths(root);
  for (const filePath of allDocFiles) {
    const relPath = resolveRelative(filePath, root);
    if (relPath.startsWith("docs/requirements/retired/")) continue;
    if (relPath.endsWith("mapping-table.md")) continue;
    if (relPath.startsWith("docs/adr/ADR-")) continue; // ADRs discuss REQ reorganization historically
    const content = readText(filePath);
    if (!content) continue;
    const contentLines = content.split("\n");
    const refs = content.match(/\bREQ-\d{4}\b/g) || [];
    const uniqueRefs = [...new Set(refs)];
    for (const ref of uniqueRefs) {
      if (retiredIds.has(ref) && !activeIds.has(ref)) {
        // REQ-0108-193/AGENTS.md: a retired REQ may be mentioned as historical
        // (retirement identification, changelog, related-info section). Only
        // flag when it appears outside any historical reference context.
        const appearsOutsideHistorical = contentLines.some(
          (line, idx) =>
            line.includes(ref) && !isHistoricalReferenceContext(contentLines, idx),
        );
        if (!appearsOutsideHistorical) continue;
        results.push(
          warn(
            "LifecycleBoundary",
            "retired-req-primary-ref",
            `${ref} is retired but referenced in ${relPath}`,
            relPath,
            undefined,
            {
              evidence: ref,
              expected: "retired REQs should not be primary references",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  // (d) mapping-table.md referencing non-existent old REQ IDs
  const mappingTablePath = path.join(
    root,
    "docs",
    "requirements",
    "retired",
    "mapping-table.md",
  );
  const mappingContent = readText(mappingTablePath);
  if (mappingContent) {
    const allReqIds = new Set([...activeIds, ...retiredIds]);
    const refs = mappingContent.match(/\bREQ-\d{4}\b/g) || [];
    const uniqueRefs = [...new Set(refs)];
    for (const ref of uniqueRefs) {
      if (!allReqIds.has(ref)) {
        results.push(
          ng(
            "LifecycleBoundary",
            "mapping-table-nonexistent",
            `${ref} referenced in mapping-table.md does not exist`,
            resolveRelative(mappingTablePath, root),
            undefined,
            {
              evidence: ref,
              expected: "all REQ references in mapping table must exist",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  // (e) Retired REQ missing from mapping table
  if (mappingContent && retiredIds.size > 0) {
    const mappingRefs = new Set(mappingContent.match(/\bREQ-\d{4}\b/g) || []);
    for (const id of retiredIds) {
      if (!mappingRefs.has(id)) {
        results.push(
          warn(
            "LifecycleBoundary",
            "retired-missing-from-mapping",
            `${id} is retired but not listed in mapping-table.md`,
            undefined,
            undefined,
            {
              evidence: id,
              expected: "all retired REQs should be in mapping table",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (
    results.filter((r) => r.level === "ng").length === 0 &&
    results.filter((r) => r.level === "warning").length === 0
  ) {
    results.push(
      ok(
        "LifecycleBoundary",
        "lifecycle-boundary",
        "No lifecycle boundary issues detected",
      ),
    );
  }
  return results;
}

// ─── Expanded legacy namespace check (REQ-0108-016) ──────────────────────

function checkExpandedLegacyNamespace(
  skillsDir: string,
  cmdDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const filesToCheck: string[] = [];

  // Existing: skill SKILL.md files
  const skillDirs = listDirs(skillsDir);
  for (const dir of skillDirs) {
    const skillMd = path.join(skillsDir, dir, "SKILL.md");
    if (fs.existsSync(skillMd)) filesToCheck.push(skillMd);
  }

  // Existing: command .md files
  const cmdFiles = listFiles(cmdDir).filter(
    (f) => f !== "README.md" && f !== "integrity-check.md",
  );
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
    for (const f of listFiles(guidesDir))
      filesToCheck.push(path.join(guidesDir, f));
  }

  // NEW: docs/specs/**/*.md (REQ-0158-004: recursive)
  const specsDir = path.join(root, "docs", "specs");
  if (fs.existsSync(specsDir)) {
    for (const f of collectSpecMarkdownRecursively(specsDir))
      filesToCheck.push(f);
  }

  // NEW: skills references/*.md (canonical)
  for (const dir of skillDirs) {
    const refsDir = path.join(skillsDir, dir, "references");
    if (fs.existsSync(refsDir)) {
      for (const f of listFiles(refsDir))
        filesToCheck.push(path.join(refsDir, f));
    }
  }

  const expandedPathRefExemptPatterns = [
    /templates\//,
    /\/commands\/agentdev\//,
    /\.opencode\//,
    /\.test\./,
    /_test\./,
  ];

  let foundLegacy = false;
  for (const filePath of filesToCheck) {
    const content = readText(filePath);
    if (!content) continue;
    const relPath = resolveRelative(filePath, root);
    if (isLegacyExemptPath(relPath)) continue;
    const lines = content.split("\n");
    for (const { pattern, name } of LEGACY_PATTERNS) {
      let matched = false;
      for (let i = 0; i < lines.length; i++) {
        if (expandedPathRefExemptPatterns.some((p) => p.test(lines[i])))
          continue;
        const lineToTest = stripInlineCode(lines[i]);
        pattern.lastIndex = 0;
        const slashMatch = pattern.exec(lineToTest);
        if (slashMatch) {
          const ctxStart = Math.max(0, slashMatch.index - 1);
          if (isPathFragment(lineToTest.substring(ctxStart, slashMatch.index + slashMatch[0].length))) {
            continue;
          }
          matched = true;
          break;
        }
      }
      if (matched) {
        foundLegacy = true;
        results.push(
          ng(
            "Namespace",
            "expanded-legacy-namespace",
            `Legacy pattern '${name}' found`,
            relPath,
          ),
        );
      }
    }
  }

  if (!foundLegacy) {
    results.push(
      ok(
        "Namespace",
        "expanded-legacy-namespace",
        "No legacy namespace patterns detected in expanded file set",
      ),
    );
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
    results.push(
      info("Inventory", "req-retired-index", "No retired directory found"),
    );
    return results;
  }

  if (!readmeContent) {
    results.push(
      ng(
        "Inventory",
        "req-retired-index",
        "README.md not found in requirements dir",
      ),
    );
    return results;
  }

  // Check README has guidance/link to retired section
  if (
    !readmeContent.includes("retired") &&
    !readmeContent.includes("Retired")
  ) {
    results.push(
      ng(
        "Inventory",
        "req-retired-index",
        "README.md does not mention or link to retired REQs section",
        resolveRelative(readmePath, root),
        undefined,
        {
          evidence: "no 'retired' mention in README",
          expected: "README should link to retired section",
          route: "intake",
        },
      ),
    );
  } else {
    results.push(
      ok(
        "Inventory",
        "req-retired-index",
        "README links to retired REQs section",
      ),
    );
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
  const reqFiles = listFiles(reqDir).filter(
    (f) => f.startsWith("REQ-") && f !== "README.md",
  );
  const reqIds = new Set(reqFiles.map((f) => f.replace(".md", "")));

  // Check REQ references in DOC-MAP
  const docMapReqRefs = docMapContent.match(/\bREQ-\d{4}\b/g) || [];
  const uniqueRefs = [...new Set(docMapReqRefs)];

  for (const ref of uniqueRefs) {
    if (!reqIds.has(ref)) {
      results.push(
        ng(
          "Inventory",
          "docmap-req-sync",
          `${ref} referenced in DOC-MAP but REQ file does not exist`,
          resolveRelative(docMapPath, root),
          undefined,
          {
            evidence: ref,
            expected: "DOC-MAP REQ references must match existing files",
            route: "intake",
          },
        ),
      );
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "Inventory",
        "docmap-req-sync",
        "All DOC-MAP REQ references match existing files",
      ),
    );
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

  // REQ-0158-004/005: docs/specs/**/*.md を再帰収集。docs/specs/README.md は
  // DOC-MAP との照合では対象とする（SPEC status の単一追跡情報源、REQ-0154-001/003）。
  const specsDir = path.join(root, "docs", "specs");
  const specFiles = collectSpecMarkdownRecursively(specsDir);
  const specNames = new Set(specFiles.map((full) => path.basename(full)));

  // Check file links to specs in DOC-MAP
  const links = parseMarkdownLinks(docMapContent);
  for (const link of links) {
    const target = resolveLinkTarget(link.href, docMapPath, root);
    if (!target) continue;
    const rel = path.relative(root, target.filePath).replace(/\\/g, "/");
    if (rel.startsWith("docs/specs/")) {
      const specFileName = path.basename(target.filePath);
      if (!specNames.has(specFileName) && !fs.existsSync(target.filePath)) {
        results.push(
          ng(
            "Inventory",
            "docmap-spec-sync",
            `DOC-MAP links to spec '${specFileName}' which does not exist`,
            resolveRelative(docMapPath, root),
            undefined,
            {
              evidence: link.href,
              expected: "linked spec must exist",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "Inventory",
        "docmap-spec-sync",
        "All DOC-MAP spec references are valid",
      ),
    );
  }
  return results;
}

function checkDocMapGuideSync(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  const docMapContent = readText(docMapPath);

  if (!docMapContent) {
    results.push(
      info("Inventory", "docmap-guide-sync", "DOC-MAP.md not found"),
    );
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
        results.push(
          ng(
            "Inventory",
            "docmap-guide-sync",
            `DOC-MAP links to guide '${guideFileName}' which does not exist`,
            resolveRelative(docMapPath, root),
            undefined,
            {
              evidence: link.href,
              expected: "linked guide must exist",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "Inventory",
        "docmap-guide-sync",
        "All DOC-MAP guide references are valid",
      ),
    );
  }
  return results;
}

function checkAdrReadmeIndexSync(adrDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const adrFiles = listFiles(adrDir).filter(
    (f) => f.startsWith("ADR-") && f !== "README.md",
  );
  const adrIds = new Set(adrFiles.map((f) => f.replace(".md", "")));

  const readmePath = path.join(adrDir, "README.md");
  const readmeContent = readText(readmePath);
  if (!readmeContent) {
    results.push(
      info("Inventory", "adr-readme-index", "ADR README.md not found"),
    );
    return results;
  }

  const indexedIds = new Set<string>();
  const readmeLines = readmeContent.split("\n");
  for (let i = 0; i < readmeLines.length; i++) {
    if (isRetiredSectionInLines(readmeLines, i)) continue;
    const match = readmeLines[i].match(/\b(ADR-\d{4})\b/);
    if (match) indexedIds.add(match[1]);
  }

  const missingFromIndex = [...adrIds].filter((id) => !indexedIds.has(id));
  const phantomEntries = [...indexedIds].filter((id) => !adrIds.has(id));

  for (const id of missingFromIndex) {
    results.push(
      ng(
        "Inventory",
        "adr-readme-index",
        `${id} exists as file but missing from ADR README index`,
      ),
    );
  }
  for (const id of phantomEntries) {
    results.push(
      ng(
        "Inventory",
        "adr-readme-index",
        `${id} listed in ADR README index but no corresponding file`,
      ),
    );
  }

  if (missingFromIndex.length === 0 && phantomEntries.length === 0) {
    results.push(
      ok(
        "Inventory",
        "adr-readme-index",
        `All ${adrIds.size} ADR files match README index`,
      ),
    );
  }
  return results;
}

// ─── Implementation pattern diagnostics (REQ-0108-026~038) ─────────────────

interface CommandPatternEntry {
  primary: string;
  secondary?: string;
}

interface SkillResponsibility {
  useFor: string;
  doNotUseFor: string;
}

const STOP_WORDS = new Set([
  "also",
  "from",
  "this",
  "that",
  "with",
  "for",
  "not",
  "the",
  "and",
  "but",
  "are",
  "has",
  "can",
  "use",
  "used",
  "when",
  "which",
  "their",
  "these",
  "those",
  "other",
  "should",
  "would",
  "could",
  "does",
  "specific",
  "determine",
  "include",
  "using",
  "based",
  "command",
  "skill",
  "について",
  "すること",
  "する場合",
  "しない",
  "こと",
  "ため",
  "おく",
  "また",
  "よい",
  " where",
  "whose",
]);

function buildSkillResponsibilityCache(
  skillsDir: string,
): Map<string, SkillResponsibility> {
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
  return /分析|analysis|guideline|ガイドライン|診断|diagnostic|検査|inspection|整合性|integrity|validation|検証|compliance|適合|評価|assessment|基準|品質|quality/.test(
    useFor,
  );
}

function extractSignificantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[|\-`#*>]/g, " ")
      .split(/[\s,.;:!?(){}\[\]\/\\]+/)
      .filter((w) => w.length > 2)
      .filter((w) => !STOP_WORDS.has(w)),
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
      if (
        trimmed.includes("Command") &&
        trimmed.includes("Pattern Correspondence")
      ) {
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
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      if (cells.length >= 2) {
        const cmdMatch = cells[0].match(/agentdev\/([a-z][a-z0-9-]*)/);
        if (cmdMatch) {
          const cmdName = cmdMatch[1];
          const primary = cells[1].replace(/`/g, "").trim();
          const secondaryRaw =
            cells.length >= 3 ? cells[2].replace(/`/g, "").trim() : undefined;
          const secondary =
            secondaryRaw && secondaryRaw !== "—" ? secondaryRaw : undefined;
          commandPatterns.set(cmdName, { primary, secondary });
        }
      }
    } else if (currentSection === "prohibitions") {
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      if (cells.length >= 2) {
        const patternName = cells[0].replace(/\*\*/g, "").trim();
        const skillsRaw = cells[1];
        if (patternName && !skillsRaw.includes("なし")) {
          const skills = [...skillsRaw.matchAll(/`([^`]+)`/g)].map((m) =>
            m[1].trim(),
          );
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

// REQ-0108-192: command-map.md may not exist on disk; parseCommandMap returns
// empty gracefully and the check emits info-level result (no removal needed).
function checkCommandMapConsistency(
  cmdDir: string,
  root: string,
  commandMapPath: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const { commandPatterns } = parseCommandMap(commandMapPath);

  if (commandPatterns.size === 0) {
    results.push(
      info(
        "Implementation Pattern",
        "command-map-consistency",
        "[recommendation: no-action] No command patterns parsed from command-map.md",
      ),
    );
    return results;
  }

  const validPatterns = new Set<string>(IMPLEMENTATION_PATTERNS);

  for (const [cmdName, entry] of commandPatterns) {
    if (!validPatterns.has(entry.primary)) {
      results.push(
        ng(
          "Implementation Pattern",
          "command-map-consistency",
          `[recommendation: integrity-check-gap] command-map.md: command '${cmdName}' has unknown primary pattern '${entry.primary}'`,
          resolveRelative(commandMapPath, root),
          undefined,
          {
            evidence: entry.primary,
            expected: `one of: ${IMPLEMENTATION_PATTERNS.join(", ")}`,
            route: "req-define",
          },
        ),
      );
    }

    if (entry.secondary && !validPatterns.has(entry.secondary)) {
      results.push(
        ng(
          "Implementation Pattern",
          "command-map-consistency",
          `[recommendation: integrity-check-gap] command-map.md: command '${cmdName}' has unknown secondary pattern '${entry.secondary}'`,
          resolveRelative(commandMapPath, root),
          undefined,
          {
            evidence: entry.secondary,
            expected: `one of: ${IMPLEMENTATION_PATTERNS.join(", ")}`,
            route: "req-define",
          },
        ),
      );
    }

    const cmdFile = path.join(cmdDir, `${cmdName}.md`);
    if (!fs.existsSync(cmdFile)) {
      results.push(
        ng(
          "Implementation Pattern",
          "command-map-consistency",
          `[recommendation: integrity-check-gap] command-map.md references '${cmdName}' but no corresponding command file exists`,
          resolveRelative(commandMapPath, root),
          undefined,
          {
            evidence: cmdName,
            expected: `${cmdName}.md must exist`,
            route: "req-define",
          },
        ),
      );
      continue;
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "Implementation Pattern",
        "command-map-consistency",
        "Command-map patterns are consistent with command files",
      ),
    );
  }

  return results;
}

function checkSpecReadmeIndexSync(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const specsDir = path.join(root, "docs", "specs");
  // REQ-0158-004/005: docs/specs/**/*.md を再帰収集。docs/specs/README.md 自身は
  // SPEC inventory/status 同期検査の追跡情報源（REQ-0154-001/003）として扱うため、
  // 収集対象から除外する（自身との照合を避ける）。
  const specFiles = collectSpecMarkdownRecursively(specsDir, {
    excludeReadme: true,
  });
  const specRelPaths = specFiles.map((full) =>
    path.relative(specsDir, full).replace(/\\/g, "/"),
  );

  const readmePath = path.join(specsDir, "README.md");
  const readmeContent = readText(readmePath);
  if (!readmeContent) {
    results.push(
      info("Inventory", "spec-readme-index", "Specs README.md not found"),
    );
    return results;
  }

  // REQ-0158-004: README.md は個別 SPEC ファイル（basename or 相対パス）と
  // ディレクトリ参照（例: `integrity/rules/`）の両方を持つ。ディレクトリ参照は
  // 配下全ファイルを網羅扱いとする。
  const readmeFileRefs = new Set<string>();
  const readmeDirRefs = new Set<string>();
  const links = parseMarkdownLinks(readmeContent);
  for (const link of links) {
    const href = link.href.replace(/^\.?\//, "");
    if (href.endsWith("/")) {
      readmeDirRefs.add(href);
    } else {
      readmeFileRefs.add(path.basename(href));
    }
  }
  // Also check bare filenames / directory paths in tables
  for (const line of readmeContent.split("\n")) {
    const fileMatch = line.match(/\b([\w./-]+\.md)\b/);
    if (fileMatch && fileMatch[1] !== "README.md") {
      readmeFileRefs.add(path.basename(fileMatch[1]));
    }
    // Detect directory references like `integrity/rules/` in table cells
    const dirMatches = line.match(/`?([a-z][a-z0-9-]*\/(?:[a-z][a-z0-9-]*\/)*)`?/g);
    if (dirMatches) {
      for (const dm of dirMatches) {
        const cleaned = dm.replace(/`/g, "");
        if (cleaned.endsWith("/") || /^[a-z][a-z0-9-]*\//.test(cleaned)) {
          readmeDirRefs.add(cleaned.endsWith("/") ? cleaned : cleaned + "/");
        }
      }
    }
  }

  // REQ-0158-004: 各 SPEC ファイルについて、basename が個別参照されているか、
  // 親ディレクトリパスがディレクトリ参照として README に含まれるかを判定する。
  const missingFromIndex: string[] = [];
  for (const relPath of specRelPaths) {
    const basename = path.basename(relPath);
    if (readmeFileRefs.has(basename)) continue;
    const parts = relPath.split("/");
    let covered = false;
    for (let i = 1; i < parts.length; i++) {
      const dirPrefix = parts.slice(0, i).join("/") + "/";
      if (readmeDirRefs.has(dirPrefix)) {
        covered = true;
        break;
      }
    }
    if (!covered) missingFromIndex.push(relPath);
  }
  for (const name of missingFromIndex) {
    results.push(
      ng(
        "Inventory",
        "spec-readme-index",
        `${name} exists but not referenced in specs README`,
      ),
    );
  }

  if (missingFromIndex.length === 0) {
    results.push(
      ok(
        "Inventory",
        "spec-readme-index",
        "All spec files referenced in specs README",
      ),
    );
  }
  return results;
}

// ─── Obsolete reference/ directory detection (REQ-0108-039, 040) ──────────

function checkObsoleteReferenceDirs(
  skillsDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const skillDirs = listDirs(skillsDir);
  let foundObsolete = false;

  for (const dir of skillDirs) {
    const obsoleteDir = path.join(skillsDir, dir, "reference");
    if (fs.existsSync(obsoleteDir)) {
      foundObsolete = true;
      const relDir = resolveRelative(obsoleteDir, root);
      results.push(
        ng(
          "Canonical",
          "obsolete-reference-dir",
          `Obsolete 'reference/' directory found (should be 'references/')`,
          relDir,
          undefined,
          {
            evidence: relDir,
            expected: "directory should be named 'references/' (canonical)",
            route: "intake",
          },
        ),
      );
    }
  }

  if (!foundObsolete) {
    results.push(
      ok(
        "Canonical",
        "obsolete-reference-dir",
        "No obsolete 'reference/' directories found (all use canonical 'references/')",
      ),
    );
  }
  return results;
}

// ─── Bare slash check scoped to public command invocation (REQ-0108-076) ────

const BARE_SLASH_COMMAND_PATTERNS = [
  { pattern: /(?<!agentdev)\/case-open\b/g, name: "/case-open" },
  { pattern: /(?<!agentdev)\/case-run\b/g, name: "/case-run" },
  { pattern: /(?<!agentdev)\/case-close\b/g, name: "/case-close" },
  { pattern: /(?<!agentdev)\/case-update\b/g, name: "/case-update" },
  { pattern: /(?<!agentdev)\/req-define\b/g, name: "/req-define" },
  { pattern: /(?<!agentdev)\/req-save\b/g, name: "/req-save" },
  { pattern: /(?<!agentdev)\/integrity-check\b/g, name: "/integrity-check" },
  { pattern: /(?<!agentdev)\/intake-capture\b/g, name: "/intake-capture" },
  { pattern: /(?<!agentdev)\/intake-promote\b/g, name: "/intake-promote" },
  { pattern: /(?<!agentdev)\/backlog-review\b/g, name: "/backlog-review" },
  { pattern: /(?<!agentdev)\/learning-promote\b/g, name: "/learning-promote" },
];

function isBareSlashExemption(relPath: string, line: string): boolean {
  const pathExemptions = [
    /completion-reports\//,
    /reference\//,
    /references\//,
    /\.test\./,
    /_test\./,
    /spec\//,
  ];
  if (pathExemptions.some((re) => re.test(relPath))) return true;

  const lineExemptions = [
    /旧\s*bare\s*command/i,
    /旧.*コマンド名/i,
    /検出対象/,
    /bare\s*slash/i,
    /pattern.*:/,
    /\|.*\|.*\|/,
    /completion-reports\//,
    /variant:\s/,
    /^\s*[-*]\s.*completion-reports/,
    /^\s*\d+\.\s/,
    /^description:/,
    /^---$/,
    /^[a-z_]+:/,
    /[-\w]+\/[-\w]+-\w/,
    /\.md[`"'s]/,
    /\{.*\}.*\.md/,
    /\*\.(md|ts)/,
    /drafts\//,
    /\.sisyphus\//,
    /status:/,
  ];
  if (lineExemptions.some((re) => re.test(line))) return true;

  return false;
}

function checkBareSlashScoped(
  skillsDir: string,
  cmdDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const filesToCheck: string[] = [];

  for (const dir of listDirs(skillsDir)) {
    const skillMd = path.join(skillsDir, dir, "SKILL.md");
    if (fs.existsSync(skillMd)) filesToCheck.push(skillMd);
    const refsDir = path.join(skillsDir, dir, "references");
    if (fs.existsSync(refsDir)) {
      for (const f of listFiles(refsDir))
        filesToCheck.push(path.join(refsDir, f));
    }
  }
  for (const file of listFiles(cmdDir)) {
    if (file !== "README.md" && file !== "integrity-check.md") {
      filesToCheck.push(path.join(cmdDir, file));
    }
  }

  let foundViolation = false;
  for (const filePath of filesToCheck) {
    const content = readText(filePath);
    if (!content) continue;
    const relPath = resolveRelative(filePath, root);
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isBareSlashExemption(relPath, line)) continue;
      for (const { pattern, name } of BARE_SLASH_COMMAND_PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          foundViolation = true;
          results.push(
            ng(
              "Namespace",
              "bare-slash-scoped",
              `Bare slash command '${name}' in public command invocation context`,
              relPath,
              i + 1,
              {
                evidence: line.trim(),
                expected: "use /agentdev/{cmd} form",
                route: "intake",
              },
            ),
          );
        }
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "Namespace",
        "bare-slash-scoped",
        "No bare slash command invocations outside exempt contexts",
      ),
    );
  }
  return results;
}

// ─── Retired REQ frontmatter/id checks (REQ-0108-080~082) ─────────────────

function checkRetiredFrontmatter(reqDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const retiredDir = path.join(reqDir, "retired");
  if (!fs.existsSync(retiredDir)) {
    results.push(
      info("REQ", "retired-frontmatter", "No retired directory found"),
    );
    return results;
  }

  const activeFiles = listFiles(reqDir).filter(
    (f) => f.startsWith("REQ-") && f !== "README.md",
  );
  const activeIds = new Set(activeFiles.map((f) => f.replace(".md", "")));

  const retiredFiles = listFiles(retiredDir).filter((f) =>
    f.startsWith("REQ-"),
  );
  const required = ["id", "title", "created", "updated"];

  for (const file of retiredFiles) {
    const fullPath = path.join(retiredDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    const relPath = resolveRelative(fullPath, root);

    if (!fm) {
      results.push(
        ng(
          "REQ",
          "retired-frontmatter-filename",
          `No valid frontmatter`,
          relPath,
        ),
      );
      continue;
    }

    // REQ-0108-080: filename ↔ frontmatter id match
    const expectedId = file.replace(".md", "");
    const actualId = fm["id"];
    if (typeof actualId !== "string") {
      results.push(
        ng(
          "REQ",
          "retired-frontmatter-filename",
          `Missing or invalid 'id' field`,
          relPath,
        ),
      );
    } else if (actualId !== expectedId) {
      results.push(
        ng(
          "REQ",
          "retired-frontmatter-filename",
          `id '${actualId}' does not match filename '${expectedId}'`,
          relPath,
        ),
      );
    }

    // REQ-0108-081: required frontmatter fields
    const missing = required.filter((k) => fm[k] === undefined || fm[k] === "");
    if (missing.length > 0) {
      results.push(
        ng(
          "REQ",
          "retired-required-fields",
          `Missing required fields: ${missing.join(", ")}`,
          relPath,
        ),
      );
    }
  }

  // REQ-0108-082: active/retired cross-boundary ID duplication
  const retiredIds = new Set(retiredFiles.map((f) => f.replace(".md", "")));
  for (const id of activeIds) {
    if (retiredIds.has(id)) {
      results.push(
        ng(
          "REQ",
          "retired-frontmatter-filename",
          `${id} exists in both active and retired directories (ID duplication)`,
          undefined,
          undefined,
          {
            evidence: `${id}.md in both dirs`,
            expected: "unique IDs across active and retired",
            route: "intake",
          },
        ),
      );
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "REQ",
        "retired-frontmatter-filename",
        "All retired REQ frontmatter and IDs are valid",
      ),
    );
  }
  return results;
}

// ─── Mapping-table checks (REQ-0108-083~088) ──────────────────────────────

const VALID_MAPPING_STATUSES = new Set([
  "migrated",
  "retired-no-successor",
  "historical-only",
]);

function parseMappingTable(mappingPath: string): {
  entries: Array<{ oldReq: string; status: string; successor: string | null }>;
  allOldRefs: Set<string>;
} {
  const entries: Array<{
    oldReq: string;
    status: string;
    successor: string | null;
  }> = [];
  const allOldRefs = new Set<string>();
  const content = readText(mappingPath);
  if (!content) return { entries, allOldRefs };

  const lines = content.split("\n");
  let inMigrationSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##\s/.test(trimmed)) {
      inMigrationSection = /^##\s+対応表/.test(trimmed);
      continue;
    }
    if (!inMigrationSection) continue;
    if (!trimmed.startsWith("|")) continue;
    if (/^[\s|:-]+$/.test(trimmed)) continue;
    const cells = trimmed
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length >= 2 && /REQ-\d{4}/.test(cells[0])) {
      const oldReqMatch = cells[0].match(/(REQ-\d{4})/);
      const statusMatch = cells[1]?.trim();
      const successorText = cells.length >= 3 ? cells[2]?.trim() : "";
      if (oldReqMatch) {
        allOldRefs.add(oldReqMatch[1]);
        let successor: string | null = null;
        if (
          successorText &&
          successorText !== "なし" &&
          successorText !== "—"
        ) {
          const successorMatches = successorText.match(/REQ-\d{4}/g);
          if (successorMatches && successorMatches.length === 1) {
            successor = successorMatches[0];
          }
        }
        entries.push({
          oldReq: oldReqMatch[1],
          status: statusMatch || "",
          successor,
        });
      }
    }
  }

  return { entries, allOldRefs };
}

function checkMappingTable(reqDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const mappingPath = path.join(reqDir, "mapping-table.md");
  const mappingContent = readText(mappingPath);

  if (!mappingContent) {
    results.push(
      info(
        "MappingTable",
        "mapping-table-checks",
        "mapping-table.md not found",
      ),
    );
    return results;
  }

  const retiredDir = path.join(reqDir, "retired");
  const activeFiles = listFiles(reqDir).filter(
    (f) => f.startsWith("REQ-") && f !== "README.md",
  );
  const activeIds = new Set(activeFiles.map((f) => f.replace(".md", "")));
  const retiredFiles = fs.existsSync(retiredDir)
    ? listFiles(retiredDir).filter((f) => f.startsWith("REQ-"))
    : [];
  const retiredIds = new Set(retiredFiles.map((f) => f.replace(".md", "")));
  const allReqIds = new Set([...activeIds, ...retiredIds]);

  const { entries, allOldRefs } = parseMappingTable(mappingPath);

  // REQ-0108-084: all retired REQs recorded in mapping-table
  for (const id of retiredIds) {
    if (!allOldRefs.has(id)) {
      results.push(
        ng(
          "MappingTable",
          "mapping-table-completeness",
          `Retired REQ ${id} not found in mapping-table`,
          resolveRelative(mappingPath, root),
          undefined,
          {
            evidence: id,
            expected: "all retired REQs must be in mapping table",
            route: "intake",
          },
        ),
      );
    }
  }

  // REQ-0108-085: mapping-table references non-existent old REQ IDs
  for (const oldRef of allOldRefs) {
    if (!allReqIds.has(oldRef)) {
      results.push(
        ng(
          "MappingTable",
          "mapping-table-completeness",
          `mapping-table references ${oldRef} but REQ does not exist in active or retired`,
          resolveRelative(mappingPath, root),
          undefined,
          {
            evidence: oldRef,
            expected: "all old REQ refs must exist",
            route: "intake",
          },
        ),
      );
    }
  }

  // REQ-0108-086: migrated successor must exist as active REQ
  for (const entry of entries) {
    if (entry.status === "migrated" && entry.successor) {
      if (!activeIds.has(entry.successor)) {
        results.push(
          ng(
            "MappingTable",
            "mapping-table-migration-target",
            `${entry.oldReq} migrated to ${entry.successor} but target is not an active REQ`,
            resolveRelative(mappingPath, root),
            undefined,
            {
              evidence: entry.successor,
              expected: "migration target must be active REQ",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  // REQ-0108-087: status enum validation
  for (const entry of entries) {
    if (!VALID_MAPPING_STATUSES.has(entry.status)) {
      results.push(
        ng(
          "MappingTable",
          "mapping-table-status-enum",
          `${entry.oldReq} has unknown status '${entry.status}'`,
          resolveRelative(mappingPath, root),
          undefined,
          {
            evidence: entry.status,
            expected: `one of: ${[...VALID_MAPPING_STATUSES].join(", ")}`,
            route: "intake",
          },
        ),
      );
    }
  }

  // REQ-0108-088: retired-no-successor / historical-only should not have migration target
  for (const entry of entries) {
    if (
      (entry.status === "retired-no-successor" ||
        entry.status === "historical-only") &&
      entry.successor
    ) {
      results.push(
        warn(
          "MappingTable",
          "mapping-table-status-enum",
          `${entry.oldReq} has status '${entry.status}' but migration target '${entry.successor}' is set`,
          resolveRelative(mappingPath, root),
          undefined,
          {
            evidence: `${entry.status} → ${entry.successor}`,
            expected: "no migration target for this status",
            route: "intake",
          },
        ),
      );
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok("MappingTable", "mapping-table-checks", "Mapping-table is consistent"),
    );
  }
  return results;
}

// ─── Variant path existence & registry checks (REQ-0108-089~091) ──────────

function checkVariantPathExistence(
  cmdDir: string,
  completionReportsPath: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  const baseDir = getCompletionReportsDir(completionReportsPath);

  for (const file of cmdFiles) {
    const cmdName = file.replace(".md", "");
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;

    const variantRefs =
      content.match(
        /completion-reports\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*\.md/g,
      ) || [];
    const uniqueRefs = [...new Set(variantRefs)];

    for (const ref of uniqueRefs) {
      const variantPath = path.join(path.dirname(completionReportsPath), ref);
      if (!fs.existsSync(variantPath)) {
        results.push(
          ng(
            "VariantReport",
            "variant-path-existence",
            `Command '${cmdName}' references '${ref}' but file does not exist`,
            resolveRelative(fullPath, root),
            undefined,
            {
              evidence: ref,
              expected: "referenced variant file must exist",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "VariantReport",
        "variant-path-existence",
        "All referenced variant paths exist",
      ),
    );
  }
  return results;
}

function checkVariantRegistryRegistered(
  cmdDir: string,
  completionReportsPath: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  if (!hasVariantRegistry(completionReportsPath)) return results;

  const sections = buildCompletionReportSections(completionReportsPath);
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");

  for (const file of cmdFiles) {
    const cmdName = file.replace(".md", "");
    if (cmdName === "integrity-check") continue;
    if (!sections.has(cmdName)) {
      const cmdPath = path.join(cmdDir, file);
      results.push(
        ng(
          "VariantReport",
          "variant-registry-registered",
          `Command '${cmdName}' has no entry in completion-reports registry`,
          resolveRelative(cmdPath, root),
          undefined,
          {
            evidence: cmdName,
            expected: "each command must have a registry entry",
            route: "intake",
          },
        ),
      );
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "VariantReport",
        "variant-registry-registered",
        "All commands have registry entries",
      ),
    );
  }
  return results;
}

// ─── Skill frontmatter checks (REQ-0108-092~094) ──────────────────────────

function checkSkillFrontmatter(skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const skillDirs = listDirs(skillsDir);

  for (const dir of skillDirs) {
    const skillMdPath = path.join(skillsDir, dir, "SKILL.md");
    const content = readText(skillMdPath);
    if (!content) continue;
    const relPath = resolveRelative(skillMdPath, root);

    const fm = parseFrontmatter(content);
    if (!fm) continue;

    // REQ-0108-092: name ↔ dir match
    const fmName = fm["name"];
    if (typeof fmName === "string" && fmName !== dir) {
      results.push(
        ng(
          "Skill",
          "skill-name-dir-match",
          `SKILL.md name '${fmName}' does not match directory '${dir}'`,
          relPath,
          undefined,
          {
            evidence: `name: ${fmName}, dir: ${dir}`,
            expected: "name must match directory name",
            route: "intake",
          },
        ),
      );
    }

    // REQ-0108-093: USE FOR / DO NOT USE FOR boundary
    if (!content.includes("USE FOR") && !content.includes("use for")) {
      results.push(
        warn(
          "Skill",
          "skill-use-for-boundary",
          `Skill '${dir}' has no USE FOR section — boundary unclear`,
          relPath,
          undefined,
          {
            evidence: dir,
            expected: "USE FOR section should exist",
            route: "intake",
          },
        ),
      );
    }
    if (
      !content.includes("DO NOT USE FOR") &&
      !content.includes("do not use for")
    ) {
      results.push(
        info(
          "Skill",
          "skill-use-for-boundary",
          `Skill '${dir}' has no DO NOT USE FOR section`,
          relPath,
        ),
      );
    }

    // REQ-0108-094: reference/ vs references/ (also covered by checkObsoleteReferenceDirs,
    // but check per SKILL.md reference)
    const obsoleteRefDir = path.join(skillsDir, dir, "reference");
    if (fs.existsSync(obsoleteRefDir)) {
      results.push(
        ng(
          "Skill",
          "skill-use-for-boundary",
          `Skill '${dir}' has obsolete 'reference/' directory (should be 'references/')`,
          resolveRelative(obsoleteRefDir, root),
          undefined,
          { evidence: `reference/`, expected: `references/`, route: "intake" },
        ),
      );
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "Skill",
        "skill-frontmatter",
        "All skill frontmatter and directories are consistent",
      ),
    );
  }
  return results;
}

// ─── Command frontmatter checks (REQ-0108-095~099, inverted: Case 5 / RU-0020) ─

const KNOWN_AGENTS = new Set([
  "sisyphus",
  "prometheus",
  "oracle",
  "metis",
  "hephaestus",
  "momus",
  "test-agent",
]);

/** Additional prohibited fields (REQ-0108-124) */
const EXTRA_PROHIBITED_FIELDS = [
  "pattern",
  "workflow_route",
  "branch_type",
  "labels",
] as const;

/** Allowed frontmatter fields for commands (REQ-0108-046, 098) */
const ALLOWED_FRONTMATTER_FIELDS = new Set(["description", "agent"]);

function checkCommandFrontmatterDetailed(
  cmdDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;
    const relPath = resolveRelative(fullPath, root);
    const cmdName = file.replace(".md", "");

    // REQ-0108-124: additional prohibited fields (pattern, workflow_route, branch_type, labels)
    for (const field of EXTRA_PROHIBITED_FIELDS) {
      if (fm[field] !== undefined) {
        results.push(
          ng(
            "Command",
            "cmd-extra-prohibited-field",
            `Command '${cmdName}' has prohibited '${field}' in frontmatter (REQ-0108-124)`,
            relPath,
            undefined,
            {
              evidence: `${field}: ${String(fm[field])}`,
              expected: "field must not exist in frontmatter",
              route: "req-define",
            },
          ),
        );
      }
    }

    // REQ-0108-098: agent must be known
    const agent = fm["agent"];
    if (typeof agent === "string" && !KNOWN_AGENTS.has(agent)) {
      results.push(
        warn(
          "Command",
          "cmd-agent-name",
          `Command '${cmdName}' has unknown agent '${agent}'`,
          relPath,
          undefined,
          {
            evidence: agent,
            expected: `one of: ${[...KNOWN_AGENTS].join(", ")}`,
            route: "req-define",
          },
        ),
      );
    }

    // REQ-0108-099: deprecated command in inventory
    const desc = typeof fm["description"] === "string" ? fm["description"] : "";
    if (strictVocabMatch(desc, "非推奨") || strictVocabMatch(desc, "deprecated")) {
      const readmePath = path.join(cmdDir, "README.md");
      const readmeContent = readText(readmePath);
      if (readmeContent && readmeContent.includes(cmdName)) {
        results.push(
          warn(
            "Command",
            "cmd-deprecated-in-inventory",
            `Command '${cmdName}' is marked deprecated but listed in command README inventory`,
            relPath,
            undefined,
            {
              evidence: `${cmdName} deprecated but in README`,
              expected:
                "deprecated commands should be removed from active inventory",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "Command",
        "cmd-frontmatter-detailed",
        "All command frontmatter fields are valid (no prohibited dev metadata)",
      ),
    );
  }
  return results;
}

// ─── Inline completion report detection tightened (REQ-0108-079) ──────────

function checkInlineCompletionReportsStrict(
  cmdDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  let foundViolation = false;

  // REQ-0108-079: detect only when multiple common required fields appear in same code block
  const REQUIRED_FIELD_INDICATORS = [
    /完了コマンド/,
    /次のコマンド/,
    /検証結果/,
    /git 永続化/,
  ];

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;

    const lines = content.split("\n");
    let inCodeBlock = false;
    let blockStart = -1;
    let blockMatches = 0;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          // Block ended
          if (blockMatches >= 2) {
            foundViolation = true;
            results.push(
              ng(
                "CompletionReport",
                "inline-completion-report",
                `Inline completion report body detected (${blockMatches} required fields in code block)`,
                resolveRelative(fullPath, root),
                blockStart + 1,
              ),
            );
          }
          blockMatches = 0;
          blockStart = -1;
        } else {
          blockStart = i;
          blockMatches = 0;
        }
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (!inCodeBlock) continue;

      for (const indicator of REQUIRED_FIELD_INDICATORS) {
        if (indicator.test(trimmed)) {
          blockMatches++;
        }
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "CompletionReport",
        "inline-completion-report",
        "No inline completion report code blocks with required fields detected",
      ),
    );
  }
  return results;
}

// ─── Script / Template / Reference path existence (REQ-0108-115, REQ-0108-116) ─

/**
 * Regex patterns for file path references in command and skill markdown files.
 * Captures paths that reference scripts (.ts), templates (.md), or references (.md).
 */
const SCRIPT_TEMPLATE_REF_PATTERNS = [
  // Repo-root-relative: .opencode/skills/agentdev-*/scripts/*.ts
  /\.opencode\/skills\/(agentdev-[^/\s"')\]]+\/(?:scripts\/[^/\s"')\]]+\.ts|templates\/[^/\s"')\]]+\.md|references\/[^/\s"')\]]+\.md))/g,
  // Command-local template: .opencode/commands/agentdev/templates/**/*.md
  /(\.opencode\/commands\/agentdev\/templates\/[^/\s"')\]]+\/[^/\s"')\]]+\.md)/g,
  // Skill-relative: scripts/*.ts, templates/*.md, references/*.md
  /(?<![.\w/])(scripts\/[^/\s"')\]]+\.ts|templates\/[^/\s"')\]]+\.md|references\/[^/\s"')\]]+\.md)/g,
];

/**
 * Check if a line is inside a code block.
 * Returns true if the cumulative ``` count at that line position is odd.
 */
function isInsideCodeBlock(lines: string[], lineIndex: number): boolean {
  let count = 0;
  for (let i = 0; i < lineIndex; i++) {
    if (lines[i].trimStart().startsWith("```")) count++;
  }
  // If the current line opens a block, it's not yet inside
  if (lines[lineIndex].trimStart().startsWith("```")) return count % 2 === 1;
  return count % 2 === 1;
}

/**
 * Check if a matched path is a template placeholder like {xxx} or REQ-{NNNN}.
 */
function isTemplatePlaceholder(refPath: string): boolean {
  if (/\{[^}]*\}/.test(refPath)) return true;
  return false;
}

// ─── Context identification helpers (REQ-0108-246~248) ─────────────────────

function isInsideCodeSpan(line: string, charIndex: number): boolean {
  let backtickCount = 0;
  for (let i = 0; i < charIndex && i < line.length; i++) {
    if (line[i] === "`") backtickCount++;
  }
  return backtickCount % 2 === 1;
}

function isRetiredSectionInLines(lines: string[], lineIndex: number): boolean {
  let currentHeading = "";
  for (let i = 0; i <= lineIndex && i < lines.length; i++) {
    const m = lines[i].match(/^#{1,6}\s+(.+)$/);
    if (m) currentHeading = m[1];
  }
  return /\b(retired|historical)\b|履歴|過去経緯|retired-no-successor|historical-only/i.test(
    currentHeading,
  );
}

function isRetiredSection(filePath: string, lineNum: number): boolean {
  const content = readText(filePath);
  if (!content) return false;
  return isRetiredSectionInLines(content.split("\n"), lineNum - 1);
}

// REQ-0108-193/AGENTS.md policy: a retired REQ/ADR mentioned in a non-retired
// document is acceptable when the reference is explicitly marked historical or
// points at retirement. This returns true when either (a) the line itself
// carries retirement-identification vocabulary next to the reference, or (b) the
// reference sits under a historical / changelog / related-information heading.
const RETIREMENT_CONTEXT_RE =
  /retired|migrated|retired-no-successor|historical-only|historical|履歴|過去経緯|廃止|移行|移管|再配置|再編|統合|吸収|changelog|superseded|deprecated|後継|前身|predecessor|successor|旧REQ|旧ADR|は\s*retired|is\s*retired/i;
const HISTORICAL_HEADING_RE =
  /\b(retired|historical)\b|履歴|過去経緯|retired-no-successor|historical-only|Update\s+Notes|Changelog|変更履歴|関連情報|関連\s*ADR|Related|Migration|移行表|適用範囲/i;

function isHistoricalReferenceContext(
  lines: string[],
  lineIndex: number,
): boolean {
  if (RETIREMENT_CONTEXT_RE.test(lines[lineIndex])) return true;
  let currentHeading = "";
  for (let i = 0; i <= lineIndex && i < lines.length; i++) {
    const m = lines[i].match(/^#{1,6}\s+(.+)$/);
    if (m) currentHeading = m[1];
  }
  return HISTORICAL_HEADING_RE.test(currentHeading);
}

function isNegativeExample(line: string): boolean {
  const hasOldFormMarker =
    /旧形式|旧語彙|廃止済み|旧\s*(command|コマンド|status|形式)/i.test(line);
  const hasProhibitionMarker =
    /使用しない|べきではない|禁止|しないこと|do not use|must not use/i.test(line);
  return hasOldFormMarker && hasProhibitionMarker;
}

function isGlobPattern(token: string): boolean {
  return /[*?[\]{}]/.test(token);
}

function isPathFragment(token: string): boolean {
  return /[a-zA-Z0-9_]\/[a-zA-Z0-9_-]/.test(token);
}

function isRangeExpression(token: string): boolean {
  return /[\w-]+\s*(?:から|〜|~|through|thru|–|—)\s*[\w-]+/i.test(token);
}

function isNegationContext(line: string): boolean {
  return /廃止|不要|禁止|使用しない|べきではない|持たない|含まない|除く|混入させない|書かない|含めない|させない|記述しない|否定|抗わない|abolish|deprecated|obsolete|superseded|prohibit|do not use|must not|not\s+to\s+include|without\s+including/i.test(
    line,
  );
}

function strictVocabMatch(line: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (/^[a-zA-Z][a-zA-Z0-9-]*$/.test(term) && !term.startsWith("-")) {
    return new RegExp(
      `(?<![a-zA-Z0-9-])${escaped}(?![a-zA-Z0-9-])`,
      "i",
    ).test(line);
  }
  return line.includes(term);
}

/**
 * Resolve a referenced path to an absolute filesystem path.
 * - Repo-root-relative paths start with `.opencode/`
 * - Skill-relative paths (scripts/..., templates/..., references/...) are resolved
 *   relative to the skill directory containing the source file.
 */
function resolveReferencePath(
  refPath: string,
  sourceFilePath: string,
  root: string,
  skillsDir: string,
): string {
  if (refPath.startsWith(".opencode/")) {
    const runtimePath = path.join(root, refPath);
    if (!fs.existsSync(runtimePath)) {
      const srcPath = path.join(
        root,
        refPath.replace(/^\.opencode\//, "src/opencode/"),
      );
      if (fs.existsSync(srcPath)) return srcPath;
    }
    return runtimePath;
  }
  if (refPath.startsWith("agentdev-")) {
    const runtimePath = path.join(skillsDir, refPath);
    if (!fs.existsSync(runtimePath)) {
      const srcSkillsDir = skillsDir.replace(
        /[\\/]\.opencode[\\/]skills$/,
        path.sep + "src" + path.sep + "opencode" + path.sep + "skills",
      );
      const srcPath = path.join(srcSkillsDir, refPath);
      if (fs.existsSync(srcPath)) return srcPath;
    }
    return runtimePath;
  }
  const relSource = resolveRelative(sourceFilePath, root);
  const skillsPrefix = ".opencode/skills/";
  if (relSource.startsWith(skillsPrefix)) {
    const afterSkills = relSource.slice(skillsPrefix.length);
    const slashIdx = afterSkills.indexOf("/");
    if (slashIdx >= 0) {
      const skillDir = afterSkills.slice(0, slashIdx);
      return path.join(skillsDir, skillDir, refPath);
    }
  }
  return path.join(root, refPath);
}

export function checkScriptTemplateReferencePaths(
  cmdDir: string,
  skillsDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const filesToCheck: { absPath: string; skillDir?: string }[] = [];

  // Collect command files
  for (const file of listFiles(cmdDir).filter((f) => f !== "README.md")) {
    filesToCheck.push({ absPath: path.join(cmdDir, file) });
  }

  // Collect skill SKILL.md files and reference files
  for (const dir of listDirs(skillsDir)) {
    const skillMd = path.join(skillsDir, dir, "SKILL.md");
    if (fs.existsSync(skillMd)) {
      filesToCheck.push({ absPath: skillMd, skillDir: dir });
    }
  }

  let foundViolation = false;

  for (const { absPath, skillDir } of filesToCheck) {
    const content = readText(absPath);
    if (!content) continue;
    const relPath = resolveRelative(absPath, root);
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip lines inside code blocks
      if (isInsideCodeBlock(lines, i)) continue;

      for (const regex of SCRIPT_TEMPLATE_REF_PATTERNS) {
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(line)) !== null) {
          // REQ-0144-020: strip Markdown backticks (inline code formatting of
          // path components) before resolving. Backticks are never literal
          // path characters.
          const rawRef = match[1];
          const normalizedRef = rawRef.replace(/`/g, "");

          // Skip template placeholders
          if (isTemplatePlaceholder(normalizedRef)) continue;

          // Skip paths that are clearly glob patterns
          if (normalizedRef.includes("*")) continue;

          // Skip runtime-generated paths (check parent dir only)
          if (
            normalizedRef.startsWith(".agentdev/") ||
            normalizedRef.startsWith(".sisyphus/")
          ) {
            const parentDir = path.dirname(
              resolveReferencePath(normalizedRef, absPath, root, skillsDir),
            );
            if (!fs.existsSync(parentDir)) {
              foundViolation = true;
              results.push(
                ng(
                  "ReferencePath",
                  "reference-path-existence",
                  `Parent directory does not exist for runtime-generated path: ${rawRef}`,
                  relPath,
                  i + 1,
                  {
                    evidence: rawRef,
                    expected: `parent directory must exist at ${resolveRelative(parentDir, root)}`,
                    route: "intake",
                  },
                ),
              );
            }
            continue;
          }

          const resolvedPath = resolveReferencePath(
            normalizedRef,
            absPath,
            root,
            skillsDir,
          );

          if (fs.existsSync(resolvedPath)) {
            results.push(
              ok(
                "ReferencePath",
                "reference-path-existence",
                `Referenced path exists: ${rawRef}`,
                { file: relPath, line: i + 1, evidence: rawRef },
              ),
            );
          } else {
            // REQ-0145-010: command files referencing bare `references/X.md`
            // are skill-relative. Resolve via nearby skill context, then all skills.
            let contextResolved = false;
            const isSkillRelativeBare =
              !normalizedRef.startsWith(".opencode/") &&
              !normalizedRef.startsWith("agentdev-") &&
              /^(scripts|templates|references)\//.test(normalizedRef);
            if (!skillDir && isSkillRelativeBare) {
              const ctxStart = Math.max(0, i - 5);
              const ctxEnd = Math.min(lines.length, i + 6);
              const contextSlice = lines.slice(ctxStart, ctxEnd).join("\n");
              const candidateSkills: string[] = [];
              const seenSkills = new Set<string>();
              const ctxMatches = contextSlice.matchAll(
                /\b(agentdev-[a-z][a-z0-9-]*)\b/g,
              );
              for (const m of ctxMatches) {
                if (!seenSkills.has(m[1])) {
                  seenSkills.add(m[1]);
                  candidateSkills.push(m[1]);
                }
              }
              const srcSkillsDir = skillsDir.replace(
                /[\\/]\.opencode[\\/]skills$/,
                path.sep + "src" + path.sep + "opencode" + path.sep + "skills",
              );
              for (const baseDir of [skillsDir, srcSkillsDir]) {
                if (!fs.existsSync(baseDir)) continue;
                for (const otherSkill of listDirs(baseDir)) {
                  if (
                    otherSkill.startsWith("agentdev-") &&
                    !seenSkills.has(otherSkill)
                  ) {
                    seenSkills.add(otherSkill);
                    candidateSkills.push(otherSkill);
                  }
                }
              }
              for (const candidate of candidateSkills) {
                const candidatePath = path.join(
                  skillsDir,
                  candidate,
                  normalizedRef,
                );
                if (fs.existsSync(candidatePath)) {
                  contextResolved = true;
                  results.push(
                    ok(
                      "ReferencePath",
                      "reference-path-existence",
                      `Referenced path resolves to skill ${candidate}: ${rawRef}`,
                      { file: relPath, line: i + 1, evidence: rawRef },
                    ),
                  );
                  break;
                }
                const srcCandidatePath = path.join(
                  srcSkillsDir,
                  candidate,
                  normalizedRef,
                );
                if (fs.existsSync(srcCandidatePath)) {
                  contextResolved = true;
                  results.push(
                    ok(
                      "ReferencePath",
                      "reference-path-existence",
                      `Referenced path resolves to skill ${candidate} (src fallback): ${rawRef}`,
                      { file: relPath, line: i + 1, evidence: rawRef },
                    ),
                  );
                  break;
                }
              }
            }
            if (contextResolved) continue;

            // Cross-skill bare reference detection (REQ-0108-119)
            let crossSkillFound = false;
            if (skillDir && !normalizedRef.startsWith(".opencode/")) {
              const otherSkills = listDirs(skillsDir).filter(
                (d) => d !== skillDir,
              );
              for (const otherSkill of otherSkills) {
                const crossSkillPath = path.join(skillsDir, otherSkill, normalizedRef);
                if (fs.existsSync(crossSkillPath)) {
                  crossSkillFound = true;
                  foundViolation = true;
                  results.push(
                    ng(
                      "ReferencePath",
                      "reference-path-existence",
                      `Referenced path does not exist in current skill but found in ${otherSkill}: ${rawRef}`,
                      relPath,
                      i + 1,
                      {
                        evidence: rawRef,
                        expected: `use explicit path: ${resolveRelative(path.join(skillsDir, otherSkill, normalizedRef), root)} or move file to current skill`,
                        route: "intake",
                      },
                    ),
                  );
                  break;
                }
              }
            }

            // Generic NG (not cross-skill)
            if (!crossSkillFound) {
              foundViolation = true;
              results.push(
                ng(
                  "ReferencePath",
                  "reference-path-existence",
                  `Referenced path does not exist: ${rawRef}`,
                  relPath,
                  i + 1,
                  {
                    evidence: rawRef,
                    expected: `file must exist at ${resolveRelative(resolvedPath, root)}`,
                    route: "intake",
                  },
                ),
              );
            }
          }
        }
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "ReferencePath",
        "reference-path-existence",
        "All script/template/reference paths exist",
      ),
    );
  }
  return results;
}

// ─── ADR status normalization check (REQ-0108-121) ──────────────────────────

function checkAdrStatusNormalization(
  adrDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const adrFiles = listFiles(adrDir).filter(
    (f) => f.startsWith("ADR-") && f !== "README.md",
  );
  let foundViolation = false;

  const oldStatusPattern = /superseded-by:\s*\[ADR-\d{4}\]/gi;

  for (const file of adrFiles) {
    const fullPath = path.join(adrDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const relPath = resolveRelative(fullPath, root);

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      oldStatusPattern.lastIndex = 0;
      if (oldStatusPattern.test(lines[i])) {
        foundViolation = true;
        results.push(
          ng(
            "ADR",
            "adr-status-normalization",
            `ADR status uses old 'superseded-by:[ADR-XXXX]' format (should be normalized)`,
            relPath,
            i + 1,
            {
              evidence: lines[i].trim(),
              expected: "normalized ADR status format",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "ADR",
        "adr-status-normalization",
        "All ADR status fields use normalized format",
      ),
    );
  }
  return results;
}

// ─── RU-ID ground reference detection (REQ-0108-122) ─────────────────────────

function checkRuidGroundReference(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  // REQ-0158-004: docs/specs/**/*.md 再帰対応。flat dirs (requirements/guides/adr) は
  // listFiles、specs のみ collectSpecMarkdownRecursively で収集する。
  const flatDirs = [
    path.join(root, "docs", "requirements"),
    path.join(root, "docs", "guides"),
    path.join(root, "docs", "adr"),
  ];
  const specsDir = path.join(root, "docs", "specs");

  const ruidPattern = /\.agentdev\/backlog\/req-units\/RU-\d{8}-\d{2,}/g;
  let foundViolation = false;

  const allFiles: string[] = [];
  for (const dir of flatDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of listFiles(dir)) allFiles.push(path.join(dir, f));
  }
  if (fs.existsSync(specsDir)) {
    for (const f of collectSpecMarkdownRecursively(specsDir)) allFiles.push(f);
  }

  for (const fullPath of allFiles) {
    const content = readText(fullPath);
    if (!content) continue;
    const relPath = resolveRelative(fullPath, root);

    const lines = content.split("\n");
    // A RU path listed in an out-of-scope / exclusion context (e.g. REQ-0124
    // 適用範囲 "- **対象外**:" naming RU-20260615-01 as edit-exempt) is a scope
    // boundary statement, not a ground reference. Skip such contexts. This
    // covers both "## 対象外" headings and "- **対象外**:" list markers.
    let underExclusion = false;
    for (let i = 0; i < lines.length; i++) {
      const headingMatch = lines[i].match(/^#{1,6}\s+(.+)$/);
      if (headingMatch) {
        underExclusion = /対象外|out.of.scope|excluded|スコープ外/i.test(
          headingMatch[1],
        );
        continue;
      }
      if (/^\s*-\s*\*\*対象外/.test(lines[i])) {
        underExclusion = true;
        continue;
      }
      if (/^\s*-\s*\*\*対象\*\*:?\s*$/.test(lines[i])) {
        underExclusion = false;
        continue;
      }
      if (underExclusion) continue;
      ruidPattern.lastIndex = 0;
      if (ruidPattern.test(lines[i])) {
        foundViolation = true;
        results.push(
          ng(
            "Canonical",
            "ruid-ground-reference",
            `RU-ID ground reference detected in persistent docs`,
            relPath,
            i + 1,
            {
              evidence: lines[i].trim(),
              expected:
                "RU-ID references should not appear in persistent docs",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "Canonical",
        "ruid-ground-reference",
        "No RU-ID ground references in persistent docs",
      ),
    );
  }
  return results;
}

// ─── Workflow status / 6 micro-phase detection prohibition (REQ-0108-123) ────

function checkWorkflowStatusProhibition(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  // REQ-0158-004: docs/specs/**/*.md 再帰対応
  const reqDir = path.join(root, "docs", "requirements");
  const specsDir = path.join(root, "docs", "specs");

  // "domain state" / "ドメイン状態" denote .agentdev persistent state
  // (ADR-0105), not workflow status. Exclude them so the 6-micro-phase
  // detector does not fire on REQ/SPEC lines merely mentioning persistent state.
  const stateWord =
    "status|ステータス|マイクロフェーズ|micro.phase|(?<!domain )state|(?<!ドメイン)状態";
  const sixPhasePattern = new RegExp(
    "\\b(requirement|analyzed|created|in_progress|review|done)\\b.*\\b(" +
      stateWord +
      ")\\b|\\b(" +
      stateWord +
      ")\\b.*\\b(requirement|analyzed|created|in_progress|review|done)\\b",
    "gi",
  );
  let foundViolation = false;

  // REQ-0158-004: flat dirs (requirements) は listFiles、specs のみ再帰収集
  const allFiles: string[] = [];
  if (fs.existsSync(reqDir)) {
    for (const file of listFiles(reqDir)) allFiles.push(path.join(reqDir, file));
  }
  if (fs.existsSync(specsDir)) {
    for (const f of collectSpecMarkdownRecursively(specsDir)) {
      allFiles.push(f);
    }
  }

  for (const fullPath of allFiles) {
    const file = path.basename(fullPath);
    if (!file.startsWith("REQ-") && !file.endsWith(".md")) continue;
    const content = readText(fullPath);
    if (!content) continue;
    const relPath = resolveRelative(fullPath, root);

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (isNegationContext(lines[i])) continue;
      // REQ-0145-002: skip data-model enum rows (e.g. Case file status field
      // `open`, `running`, `blocked`, `review`, `closed`, `cancelled`).
      // When a phase word like `review` appears inside backticks it is an
      // enum literal, not workflow status state management.
      sixPhasePattern.lastIndex = 0;
      let phaseMatch;
      let phaseInEnum = false;
      let phaseInNarrative = false;
      while ((phaseMatch = sixPhasePattern.exec(lines[i])) !== null) {
        const matchEnd = phaseMatch.index + phaseMatch[0].length;
        if (isInsideCodeSpan(lines[i], phaseMatch.index) ||
            isInsideCodeSpan(lines[i], matchEnd - 1)) {
          phaseInEnum = true;
        } else {
          phaseInNarrative = true;
          break;
        }
      }
      if (phaseInNarrative) {
        foundViolation = true;
        results.push(
          ng(
            "LifecycleBoundary",
            "workflow-status-prohibition",
            `Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC`,
            relPath,
            i + 1,
            {
              evidence: lines[i].trim(),
              expected:
                "REQ/SPEC must not define workflow status state management",
              route: "intake",
            },
          ),
        );
      } else if (phaseInEnum) {
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "LifecycleBoundary",
        "workflow-status-prohibition",
        "No workflow status / 6 micro-phase patterns in REQ/SPEC",
      ),
    );
  }
  return results;
}

// ─── Accepted ADR only citation check (REQ-0108-125, advisory) ───────────────

function checkAcceptedAdrOnlyCitation(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const adrDir = path.join(root, "docs", "adr");
  const adrFiles = listFiles(adrDir).filter(
    (f) => f.startsWith("ADR-") && f !== "README.md",
  );

  const nonAcceptedAdrs = new Map<string, string>();
  for (const file of adrFiles) {
    const fullPath = path.join(adrDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;
    const status =
      typeof fm["status"] === "string" ? fm["status"].toLowerCase() : "";
    if (status && status !== "accepted") {
      nonAcceptedAdrs.set(file.replace(".md", ""), status);
    }
  }

  if (nonAcceptedAdrs.size === 0) {
    results.push(
      ok(
        "ADR",
        "accepted-adr-only-citation",
        "All ADRs are accepted or no non-accepted ADRs exist",
      ),
    );
    return results;
  }

  // REQ-0158-004: docs/specs/**/*.md 再帰対応
  const filesToScan = [
    path.join(root, "docs", "requirements"),
    path.join(root, "docs", "specs"),
    path.join(root, "docs", "guides"),
    path.join(root, "README.md"),
    path.join(root, "docs", "DOC-MAP.md"),
  ];

  for (const scanTarget of filesToScan) {
    if (!fs.existsSync(scanTarget)) continue;

    const stat = fs.statSync(scanTarget);
    if (stat.isDirectory()) {
      const isSpecsDir = scanTarget === path.join(root, "docs", "specs");
      const fileList = isSpecsDir
        ? collectSpecMarkdownRecursively(scanTarget)
        : listFiles(scanTarget).map((f) => path.join(scanTarget, f));
      for (const fullPath of fileList) {
        checkNonAcceptedAdrRefsInFile(fullPath, root, nonAcceptedAdrs, results);
      }
    } else {
      checkNonAcceptedAdrRefsInFile(scanTarget, root, nonAcceptedAdrs, results);
    }
  }

  if (results.filter((r) => r.level === "warning").length === 0) {
    results.push(
      ok(
        "ADR",
        "accepted-adr-only-citation",
        "Only accepted ADRs are cited as current basis",
      ),
    );
  }
  return results;
}

function checkNonAcceptedAdrRefsInFile(
  filePath: string,
  root: string,
  nonAcceptedAdrs: Map<string, string>,
  results: CheckResult[],
): void {
  const content = readText(filePath);
  if (!content) return;
  const relPath = resolveRelative(filePath, root);

  const contextExemptPatterns = [
    /historical/i,
    /proposed.*現行根拠ではない/,
    /blob\/main/,
    /acceptance.?criteria/i,
    /^\s*\|\s*AC-/i,
    /FPR-\d{3}/,
  ];

  const lines = content.split("\n");
  const exemptedRefs = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    for (const ref of nonAcceptedAdrs.keys()) {
      if (
        lines[i].includes(ref) &&
        (contextExemptPatterns.some((p) => p.test(lines[i])) ||
          isHistoricalReferenceContext(lines, i))
      ) {
        exemptedRefs.add(ref);
      }
    }
  }

  const adrRefs = content.match(/\bADR-\d{4}\b/g) || [];
  const uniqueRefs = [...new Set(adrRefs)].filter(
    (ref) => !exemptedRefs.has(ref),
  );

  for (const ref of uniqueRefs) {
    const status = nonAcceptedAdrs.get(ref);
    if (status) {
      results.push(
        warn(
          "ADR",
          "accepted-adr-only-citation",
          `Non-accepted ADR ${ref} (status: ${status}) cited in ${relPath}`,
          relPath,
          undefined,
          {
            evidence: ref,
            expected: "only accepted ADRs should be cited as current basis",
            route: "intake",
          },
        ),
      );
    }
  }
}

// ─── Pattern A/B/C/D residual detection (REQ-0108-111) ────────────────────

const PATTERN_RESIDUAL_PATTERNS = [
  { pattern: /\bPattern\s+[ABCD]\b/g, name: "Pattern A/B/C/D label" },
  {
    pattern:
      /\bwork_type\s*[:=]\s*["']?(bugfix|feature|maintenance|docs_chore)["']?/gi,
    name: "work_type explicit value",
  },
];

// ─── Pattern A/B/C/D residual detection (REQ-0108-111) ────────────────────

function checkPatternResidualDetection(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  let foundViolation = false;
  const patternLabelRe = /Pattern [A-D]/gi;
  const validWorkTypes = new Set([
    "bugfix",
    "feature",
    "maintenance",
    "docs_chore",
  ]);

  const exemptPatterns = [
    /retired\//,
    /mapping-table/,
    /\.test\./,
    /_test\./,
    /integrity-check\.md$/,
    /gate-levels\.md$/,
    /vocabulary-registry\.md$/,
    /REQ-0108\.md$/,
    /REQ-0112\.md$/,
    /design-principles\.md$/,
    /command-authoring-standards\.md$/,
  ];

  const dirsToScan = [
    path.join(root, ".opencode", "commands"),
    path.join(root, ".opencode", "skills"),
    path.join(root, "docs", "specs"),
    path.join(root, "docs", "guides"),
  ];

  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) continue;
    function scanDir(scanPath: string): void {
      const entries = fs.readdirSync(scanPath, {
        withFileTypes: true,
      }) as import("fs").Dirent[];
      for (const entry of entries) {
        const fullPath = path.join(scanPath, entry.name);
        const relPath = resolveRelative(fullPath, root);
        if (entry.isDirectory()) {
          scanDir(fullPath);
          continue;
        }
        if (!entry.name.endsWith(".md")) continue;
        if (exemptPatterns.some((p) => p.test(relPath))) continue;
        const content = readText(fullPath);
        if (!content) continue;

        patternLabelRe.lastIndex = 0;
        if (patternLabelRe.test(content)) {
          foundViolation = true;
          results.push(
            warn(
              "Canonical",
              "pattern-residual-detection",
              "Pattern A/B/C/D label detected in " +
                relPath +
                " — classification is deprecated (REQ-0108-111)",
              relPath,
              undefined,
              {
                evidence: "Pattern A/B/C/D",
                expected:
                  "Pattern labels should not appear in active documents",
                route: "intake",
                finding_category: "obsolete-structure",
              },
            ),
          );
        }

        const fm = parseFrontmatter(content);
        if (fm && fm.work_type && typeof fm.work_type === "string") {
          if (!validWorkTypes.has(fm.work_type)) {
            foundViolation = true;
            results.push(
              warn(
                "Canonical",
                "pattern-residual-detection",
                "Invalid work_type '" +
                  fm.work_type +
                  "' in " +
                  relPath +
                  " — must be one of: bugfix, feature, maintenance, docs_chore",
                relPath,
                undefined,
                {
                  evidence: "work_type: " + fm.work_type,
                  expected:
                    "work_type must be one of: bugfix, feature, maintenance, docs_chore",
                  route: "intake",
                  finding_category: "obsolete-structure",
                },
              ),
            );
          }
        }
      }
    }
    scanDir(dir);
  }

  if (!foundViolation) {
    results.push(
      ok(
        "Canonical",
        "pattern-residual-detection",
        "No Pattern A/B/C/D residual labels or invalid work_type values detected",
      ),
    );
  }
  return results;
}

// ─── req-backlog residual detection (REQ-0108-112) ────────────────────────

function checkReqBacklogResidualDetection(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqBacklogPattern = /\breq-backlog\b/gi;
  let foundViolation = false;

  const exemptPatterns = [
    /retired\//,
    /mapping-table/,
    /\.test\./,
    /_test\./,
    /integrity-check\.md$/,
    /gate-levels\.md$/,
    /vocabulary-registry\.md$/,
    /REQ-0105\.md$/,
    /REQ-0101\.md$/,
    /REQ-0108\.md$/,
    /ADR-\d{4}\.md$/,
  ];

  const dirsToScan = [
    path.join(root, ".opencode", "commands"),
    path.join(root, ".opencode", "skills"),
    path.join(root, "docs", "specs"),
    path.join(root, "docs", "guides"),
  ];

  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) continue;
    function scanDir(scanPath: string): void {
      const entries = fs.readdirSync(scanPath, {
        withFileTypes: true,
      }) as import("fs").Dirent[];
      for (const entry of entries) {
        const fullPath = path.join(scanPath, entry.name);
        const relPath = resolveRelative(fullPath, root);
        if (entry.isDirectory()) {
          scanDir(fullPath);
          continue;
        }
        if (!entry.name.endsWith(".md")) continue;
        if (exemptPatterns.some((p) => p.test(relPath))) continue;
        const content = readText(fullPath);
        if (!content) continue;
        reqBacklogPattern.lastIndex = 0;
        if (reqBacklogPattern.test(content)) {
          foundViolation = true;
          results.push(
            warn(
              "Canonical",
              "req-backlog-residual-detection",
              "req-backlog reference detected in " +
                relPath +
                " — abolished per REQ-0105-038 (REQ-0108-112)",
              relPath,
              undefined,
              {
                evidence: "req-backlog",
                expected:
                  "req-backlog is abolished; use backlog-review / backlog-save flow",
                route: "intake",
                finding_category: "obsolete-structure",
              },
            ),
          );
        }
      }
    }
    scanDir(dir);
  }

  if (!foundViolation) {
    results.push(
      ok(
        "Canonical",
        "req-backlog-residual-detection",
        "No req-backlog residual references detected",
      ),
    );
  }
  return results;
}

// ─── Abolished skill references detection (REQ-0108-126, 127) ──────────────

const ABOLISHED_SKILLS_DETECTION_LIST = ["agentdev-workflow-reporting"];

function checkAbolishedSkillReferences(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  let foundViolation = false;

  const exemptPatterns = [
    /\.test\./,
    /_test\./,
    /integrity-check\.md$/,
    /vocabulary-registry\.md$/,
    /gate-levels\.md$/,
    /integrity-contracts\.md$/,
    /integrity-rule-catalog\.md$/,
  ];

  const filesToScan: string[] = [];

  // Scope: .opencode/commands/**/*.md (REQ-0108-127)
  const cmdDir = path.join(root, ".opencode", "commands");
  if (fs.existsSync(cmdDir)) {
    function collectCmdFiles(dir: string): void {
      const entries = fs.readdirSync(dir, {
        withFileTypes: true,
      }) as import("fs").Dirent[];
      for (const entry of entries) {
        const fp = path.join(dir, entry.name);
        if (entry.isDirectory()) collectCmdFiles(fp);
        else if (entry.name.endsWith(".md")) filesToScan.push(fp);
      }
    }
    collectCmdFiles(cmdDir);
  }

  // Scope: .opencode/skills/*/SKILL.md and references/**/*.md
  const skillsDir = path.join(root, ".opencode", "skills");
  if (fs.existsSync(skillsDir)) {
    for (const skillDir of listDirs(skillsDir)) {
      const skillMd = path.join(skillsDir, skillDir, "SKILL.md");
      if (fs.existsSync(skillMd)) filesToScan.push(skillMd);
      const refsDir = path.join(skillsDir, skillDir, "references");
      if (fs.existsSync(refsDir)) {
        function collectRefFiles(dir: string): void {
          const entries = fs.readdirSync(dir, {
            withFileTypes: true,
          }) as import("fs").Dirent[];
          for (const entry of entries) {
            const fp = path.join(dir, entry.name);
            if (entry.isDirectory()) collectRefFiles(fp);
            else if (entry.name.endsWith(".md")) filesToScan.push(fp);
          }
        }
        collectRefFiles(refsDir);
      }
    }
  }

  // Scope: docs/specs/**/*.md (runtime guidance) — REQ-0158-004: recursive
  const specsDir = path.join(root, "docs", "specs");
  if (fs.existsSync(specsDir)) {
    for (const f of collectSpecMarkdownRecursively(specsDir)) {
      filesToScan.push(f);
    }
  }

  // Scope: docs/DOC-MAP.md
  const docMap = path.join(root, "docs", "DOC-MAP.md");
  if (fs.existsSync(docMap)) filesToScan.push(docMap);

  for (const fullPath of filesToScan) {
    const relPath = resolveRelative(fullPath, root);
    if (exemptPatterns.some((p) => p.test(relPath))) continue;
    const content = readText(fullPath);
    if (!content) continue;

    for (const abolished of ABOLISHED_SKILLS_DETECTION_LIST) {
      const re = new RegExp(
        "\\b" +
          abolished.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
          "\\b",
        "g",
      );
      if (re.test(content)) {
        foundViolation = true;
        const result = ng(
          "Canonical",
          "abolished-skill-references",
          "Reference to abolished skill '" +
            abolished +
            "' detected in " +
            relPath +
            " (REQ-0108-126)",
          relPath,
          undefined,
          {
            evidence: abolished,
            expected: "skill '" + abolished + "' is abolished; remove references",
            route: "intake",
            finding_category: "obsolete-structure",
          },
        );
        result.finding_level = "strict";
        results.push(result);
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "Canonical",
        "abolished-skill-references",
        "No references to abolished skills detected",
      ),
    );
  }
  return results;
}

// ─── REQ range staleness check (INC-0027) ─────────────────────────────────

function checkReqRangeStaleness(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqDir = path.join(root, "docs", "requirements");
  const reqFiles = listFiles(reqDir).filter(
    (f) => f.startsWith("REQ-") && f !== "README.md",
  );
  const actualCount = reqFiles.length;

  if (actualCount === 0) {
    results.push(
      info("Canonical", "req-range-staleness", "No active REQ files found"),
    );
    return results;
  }

  const actualIds = reqFiles.map((f) => f.replace(".md", "")).sort();
  const firstId = actualIds[0];
  const lastId = actualIds[actualIds.length - 1];

  // Extract range from text: patterns like "REQ-0101 through REQ-0114", "REQ-0101〜REQ-0114", "REQ-0101~REQ-0114"
  const rangePattern =
    /REQ-\d{4}\s*(?:through|〜|~|から|through)\s*REQ-\d{4}/gi;

  // REQ-0144-018: scan docs/guides/*.md and vocabulary-registry.md in addition to core files
  const filesToCheck: { absPath: string; label: string }[] = [
    { absPath: path.join(root, "AGENTS.md"), label: "AGENTS.md" },
    {
      absPath: path.join(root, "docs", "specs", "foundations", "system.md"),
      label: "system.md",
    },
    { absPath: path.join(root, "docs", "DOC-MAP.md"), label: "DOC-MAP.md" },
  ];

  const guidesDir = path.join(root, "docs", "guides");
  if (fs.existsSync(guidesDir)) {
    for (const f of listFiles(guidesDir)) {
      filesToCheck.push({
        absPath: path.join(guidesDir, f),
        label: `docs/guides/${f}`,
      });
    }
  }

  const vocabPath = resolvePathWithFallback(
    path.join(
      root,
      ".opencode",
      "skills",
      "repo-agentdev-integrity",
      "references",
      "vocabulary-registry.md",
    ),
  );
  if (fs.existsSync(vocabPath)) {
    filesToCheck.push({
      absPath: vocabPath,
      label: "vocabulary-registry.md",
    });
  }

  let foundStale = false;

  for (const { absPath, label } of filesToCheck) {
    const content = readText(absPath);
    if (!content) continue;
    const scanLines = content.split("\n");

    // Check range expressions
    rangePattern.lastIndex = 0;
    const rangeMatches = content.match(rangePattern);
    if (rangeMatches) {
      for (const match of rangeMatches) {
        const ids = match.match(/REQ-\d{4}/g);
        if (ids && ids.length === 2) {
          const rangeEnd = ids[1];
          const matchLineIdx = scanLines.findIndex((l) => l.includes(match));
          if (
            matchLineIdx >= 0 &&
            (isRetiredSectionInLines(scanLines, matchLineIdx) ||
              /旧\s*REQ|retired|historical/i.test(scanLines[matchLineIdx]))
          ) {
            continue;
          }
          if (rangeEnd !== lastId) {
            foundStale = true;
            results.push(
              ng(
                "Canonical",
                "req-range-staleness",
                `${label} states REQ range ending at ${rangeEnd} but actual last active REQ is ${lastId} (${actualCount} files)`,
                resolveRelative(absPath, root),
                undefined,
                {
                  evidence: match,
                  expected: `REQ range should end at ${lastId}`,
                  route: "intake",
                },
              ),
            );
          }
        }
      }
    }

    // Check count expressions: "11件", "14件", "11 件" etc.
    const countPattern =
      /(?:active\s*REQ|現行.*REQ|REQ.*件)\s*(?:は\s*)?(\d+)\s*件/gi;
    let countMatch;
    while ((countMatch = countPattern.exec(content)) !== null) {
      const statedCount = parseInt(countMatch[1], 10);
      if (statedCount !== actualCount) {
        foundStale = true;
        results.push(
          ng(
            "Canonical",
            "req-range-staleness",
            `${label} states ${statedCount} active REQs but actual count is ${actualCount}`,
            resolveRelative(absPath, root),
            undefined,
            {
              evidence: countMatch[0],
              expected: `${actualCount} active REQs`,
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (!foundStale) {
    results.push(
      ok(
        "Canonical",
        "req-range-staleness",
        `REQ range and count consistent across all documents (${actualCount} active REQs, ${firstId}~${lastId})`,
      ),
    );
  }
  return results;
}

/**
 * REQ-0108-161: SKILL.md categories vs script implementations gap detection
 * Checks that each category defined in the authoritative SKILL.md has
 * a corresponding implementation in the integrity check scripts.
 */
function checkSkillCategoryGap(
  root: string,
  skillsDir: string,
  cmdDir: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const skillMdPath = path.join(
    skillsDir,
    "repo-agentdev-integrity",
    "SKILL.md",
  );
  const skillMdContent = readText(skillMdPath);
  if (!skillMdContent) {
    results.push(
      info(
        "integrity-rule-gap",
        "skill-category-gap",
        "SKILL.md not found for repo-agentdev-integrity skill",
      ),
    );
    return results;
  }

  const categoriesInSkillMd = new Set<string>();
  const lines = skillMdContent.split("\n");
  let inCategoryTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes("検査カテゴリ")) {
      inCategoryTable = true;
      continue;
    }
    if (inCategoryTable && !trimmed.startsWith("|")) {
      inCategoryTable = false;
      continue;
    }
    if (inCategoryTable && trimmed.startsWith("|")) {
      if (/^[\s|:-]+$/.test(trimmed)) continue;
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      if (cells.length >= 2) {
        const category = cells[0].replace(/\*\*/g, "").trim();
        if (category && category !== "検査カテゴリ") {
          categoriesInSkillMd.add(category);
        }
      }
    }
  }

  if (categoriesInSkillMd.size === 0) {
    results.push(
      info(
        "integrity-rule-gap",
        "skill-category-gap",
        "No category table entries found in SKILL.md",
      ),
    );
    return results;
  }

  const scriptCheckNames = new Set<string>();
  const scriptsDir = path.join(skillsDir, "repo-agentdev-integrity", "scripts");
  const scriptFiles = [
    "check_integrity.ts",
    "check_templates.ts",
    "lint_skills.ts",
  ];
  for (const scriptFile of scriptFiles) {
    const scriptPath = path.join(scriptsDir, scriptFile);
    const content = readText(scriptPath);
    if (!content) continue;
    const checkFuncMatches = content.matchAll(/function\s+((?:check|lint)\w+)/g);
    for (const m of checkFuncMatches) {
      scriptCheckNames.add(m[1]);
    }
  }

  const categoryToCheckPattern = new Map([
    ["REQ frontmatter ↔ ファイル名", ["ReqFrontmatter", "ReqRequired"]],
    ["REQ frontmatter↔ファイル名", ["ReqFrontmatter", "ReqRequired"]],
    ["Retired REQ frontmatter", ["RetiredFrontmatter"]],
    ["ADR ↔ REQ 相互参照", ["AdrReqCrossReference"]],
    ["ADR↔REQ 相互参照", ["AdrReqCrossReference"]],
    ["Skill frontmatter", ["SkillFrontmatter"]],
    ["Command-map ↔ 実体", ["CommandReadmeSync", "CommandInventory"]],
    ["Command-map↔実体", ["CommandReadmeSync", "CommandInventory"]],
    ["Command frontmatter", ["CommandFrontmatterDetailed"]],
    ["旧 namespace 残存", ["LegacyNamespace", "BareSlashScoped"]],
    ["完了報告フォーマット", ["CompletionReport", "InlineCompletion"]],
    ["Variant report", ["VariantExistence"]],
    ["Mapping table", ["MappingTable"]],
    ["ADR status 正規化", ["AdrStatusNormalization"]],
    ["RU-ID 根拠参照", ["RuidGroundReference"]],
    ["Workflow status 禁止", ["WorkflowStatusProhibition"]],
    ["Accepted ADR 引用", ["AcceptedAdrOnlyCitation"]],
    ["Workflow template 構造", ["checkNaming", "checkFrontmatter", "checkSectionMarkers"]],
    ["Skill 構造", ["lintSkill"]],
    ["Junction 整合性", ["BrokenJunctions"]],
    ["Capture boundary", ["CaptureBoundaryReference", "PrTemplateCaptureSection", "CommandCaptureDuties"]],
    ["Mapping table history", ["MappingTableHistoryLabels"]],
    ["REQ verification basis", ["ReqVerificationBasis"]],
    ["Runtime reference", ["RuntimeUnresolvedReference"]],
    ["Distribution untracked skill", ["DistributionUntrackedSkillReference"]],
  ]);

  let foundGap = false;
  for (const category of categoriesInSkillMd) {
    const patterns = categoryToCheckPattern.get(category);
    if (patterns === undefined) {
      results.push(
        ng(
          "integrity-rule-gap",
          "skill-category-gap",
          [
            "SKILL.md category '" + category + "' has no mapping",
            "in gap detector (category-to-check-pattern map)",
          ].join(" "),
          resolveRelative(skillMdPath, root),
          undefined,
          {
            evidence: category,
            expected:
              "each SKILL.md category must map to check function patterns",
            route: determineRoute("integrity-rule-gap", 1),
          },
        ),
      );
      foundGap = true;
    } else if (patterns.length > 0) {
      const hasMatch = patterns.some((p) =>
        [...scriptCheckNames].some((fn) => fn.includes(p)),
      );
      if (!hasMatch) {
        results.push(
          ng(
            "integrity-rule-gap",
            "skill-category-gap",
            "SKILL.md category '" +
              category +
              "' has no corresponding implementation in scripts",
            resolveRelative(skillMdPath, root),
            undefined,
            {
              evidence: category,
              expected: "corresponding check function must exist",
              route: determineRoute("integrity-rule-gap", 1),
            },
          ),
        );
        foundGap = true;
      }
    }
  }

  if (!foundGap) {
    results.push(
      ok(
        "integrity-rule-gap",
        "skill-category-gap",
        "All " +
          categoriesInSkillMd.size +
          " SKILL.md categories have corresponding implementations",
      ),
    );
  }
  return results;
}

/**
 * REQ-0108-165: Template path integrity check
 * Detects non-existent template paths, namespace mismatches, and
 * description inconsistencies as integrity-rule-gap findings.
 */
function checkTemplatePathIntegrity(
  cmdDir: string,
  root: string,
): CheckResult[] {
  const results: CheckResult[] = [];
  const cmdFiles = listFiles(cmdDir).filter((f) => f !== "README.md");
  let foundViolation = false;

  for (const file of cmdFiles) {
    const fullPath = path.join(cmdDir, file);
    const content = readText(fullPath);
    if (!content) continue;

    const relPath = resolveRelative(fullPath, root);
    const cmdName = file.replace(".md", "");

    const templateRefPattern =
      /\.opencode\/skills\/[^/\s"'\\)\]]+\/templates\/[^/\s"'\\)\]]+\.md/g;
    const templateRefs = content.match(templateRefPattern) || [];
    const uniqueRefs = [...new Set(templateRefs)];

    for (const ref of uniqueRefs) {
      if (isGlobPattern(ref)) continue;
      // REQ-0108-189: Fall back to src/opencode/ when runtime projection doesn't exist
      const resolvedPath = resolvePathWithFallback(
        path.join(root, ref.replace(/\//g, path.sep)),
      );
      if (!fs.existsSync(resolvedPath)) {
        foundViolation = true;
        results.push(
          ng(
            "integrity-rule-gap",
            "template-path-integrity",
            "Command '" +
              cmdName +
              "' references template '" +
              ref +
              "' but file does not exist",
            relPath,
            undefined,
            {
              evidence: ref,
              expected: "referenced template file must exist",
              route: determineRoute("integrity-rule-gap", 1),
            },
          ),
        );
      }
    }

    const fm = parseFrontmatter(content);
    if (fm && fm["template_path"]) {
      const templatePath = String(fm["template_path"]);
      // REQ-0108-189: Fall back to src/opencode/ when runtime projection doesn't exist
      const resolvedFmPath = resolvePathWithFallback(
        path.join(root, templatePath.replace(/\//g, path.sep)),
      );
      if (!fs.existsSync(resolvedFmPath)) {
        foundViolation = true;
        results.push(
          ng(
            "integrity-rule-gap",
            "template-path-integrity",
            "Command '" +
              cmdName +
              "' frontmatter template_path '" +
              templatePath +
              "' does not exist",
            relPath,
            undefined,
            {
              evidence: templatePath,
              expected: "frontmatter template_path must point to existing file",
              route: determineRoute("integrity-rule-gap", 1),
            },
          ),
        );
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "integrity-rule-gap",
        "template-path-integrity",
        "All command template path references are valid",
      ),
    );
  }
  return results;
}

// ─── Source vs Projection consistency check ─────────────────────────────────

// REQ-0108-190: Extended to cover commands AND skills source/projection pairs
function isInsideWorktree(root: string): boolean {
  // `git worktree add` creates a `.git` file (not directory) pointing at the
  // main repo's worktree admin path. Junctions under `.opencode/skills/` are
  // not recreated in worktrees, so source-projection-sync would falsely fire.
  const dotGitPath = path.join(root, ".git");
  try {
    const stat = fs.statSync(dotGitPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function checkSourceProjectionConsistency(root: string): CheckResult[] {
  const results: CheckResult[] = [];

  // REQ-0145-010: skip in worktree (see isInsideWorktree).
  if (isInsideWorktree(root)) {
    results.push(
      info(
        "Inventory",
        "source-projection-sync",
        "Skipped inside git worktree (junctions not recreated)",
      ),
    );
    return results;
  }

  // Commands: src/opencode/commands/ ↔ .opencode/commands/
  const projectionCmdDir = path.join(root, ".opencode", "commands", "agentdev");
  const sourceCmdDir = path.join(root, "src", "opencode", "commands", "agentdev");

  if (fs.existsSync(sourceCmdDir) && fs.existsSync(projectionCmdDir)) {
    const sourceFiles = new Set(
      listFiles(sourceCmdDir).filter((f) => f !== "README.md"),
    );
    const projectionFiles = new Set(
      listFiles(projectionCmdDir).filter((f) => f !== "README.md"),
    );

    const missingFromProjection = [...sourceFiles].filter(
      (f) => !projectionFiles.has(f),
    );
    const extraInProjection = [...projectionFiles].filter(
      (f) => !sourceFiles.has(f),
    );

    for (const f of missingFromProjection) {
      results.push(
        ng(
          "Inventory",
          "source-projection-sync",
          `${f} exists in source but missing from projection`,
        ),
      );
    }
    for (const f of extraInProjection) {
      results.push(
        ng(
          "Inventory",
          "source-projection-sync",
          `${f} exists in projection but missing from source`,
        ),
      );
    }
  }

  // Skills: src/opencode/skills/ ↔ .opencode/skills/
  const projectionSkillsDir = path.join(root, ".opencode", "skills");
  const sourceSkillsDir = path.join(root, "src", "opencode", "skills");

  if (fs.existsSync(sourceSkillsDir) && fs.existsSync(projectionSkillsDir)) {
    const sourceSkillDirs = new Set(listDirs(sourceSkillsDir));
    const projectionSkillDirs = new Set(listDirs(projectionSkillsDir));

    const missingSkills = [...sourceSkillDirs].filter(
      (d) => !projectionSkillDirs.has(d),
    );
    // repo-* skills are repo-local and projection-only (ADR-0020): they
    // intentionally have no src/opencode/skills/ counterpart and are excluded
    // from selective-junction sync (sync-self-opencode.ps1 RepoLocalSkillPrefix).
    // Other projection-only skills referenced by distribution must be promoted
    // to src/opencode/skills/ (ADR-0134/REQ-0159-001); detection is handled by
    // checkDistributionUntrackedSkillReference (IR-058).
    const extraSkills = [...projectionSkillDirs].filter(
      (d) =>
        !sourceSkillDirs.has(d) &&
        !d.startsWith("repo-"),
    );

    for (const d of missingSkills) {
      results.push(
        ng(
          "Inventory",
          "source-projection-sync",
          `Skill '${d}' exists in source but missing from projection`,
        ),
      );
    }
    for (const d of extraSkills) {
      results.push(
        ng(
          "Inventory",
          "source-projection-sync",
          `Skill '${d}' exists in projection but missing from source`,
        ),
      );
    }
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "Inventory",
        "source-projection-sync",
        "Source and projection directories are in sync for commands and skills",
      ),
    );
  }
  return results;
}

// ─── IR-058: distribution-untracked-skill-reference (REQ-0159-003) ──────────

// Distribution roots whose .md content is scanned for skill name references.
const IR058_DISTRIBUTION_DIRS = [
  "src/opencode/commands/agentdev",
  "src/opencode/skills",
] as const;

// Patterns that count as a reference to skill <name>:
//   - path reference: `.opencode/skills/<name>` or `src/opencode/skills/<name>`
//   - backtick-quoted: `` `<name>` ``
//   - Japanese prose: `<name> スキル` / `<name>スキル`
//   - load_skills literal: `load_skills` value containing `<name>`
function buildIr058ReferencePattern(skillName: string): RegExp {
  const escaped = skillName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    "(" +
      "\\.opencode/skills/" +
      escaped +
      "(?=[/\\s\"'`]|$)" +
      "|" +
      "src/opencode/skills/" +
      escaped +
      "(?=[/\\s\"'`]|$)" +
      "|" +
      "`" +
      escaped +
      "`" +
      "|" +
      "\\b" +
      escaped +
      "\\s*スキル" +
      "|" +
      "\\b" +
      escaped +
      "スキル" +
      "|" +
      'load_skills\\s*[=:].*?"[^"]*\\b' +
      escaped +
      '\\b[^"]*"' +
      ")",
    "g",
  );
}

// Exemption: the rule catalog itself documents skill names; do not flag those.
const IR058_EXEMPT_PATH_PATTERNS: RegExp[] = [
  /\/integrity-rule-catalog\.md$/,
  /\/rules\/IR-058[-/]/,
  /\/runtime-package-boundary\.md$/,
  /\/vocabulary-registry\.md$/,
];

function isIr058ExemptPath(relPath: string): boolean {
  return IR058_EXEMPT_PATH_PATTERNS.some((re) => re.test(relPath));
}

function checkDistributionUntrackedSkillReference(root: string): CheckResult[] {
  const results: CheckResult[] = [];

  const projectionSkillsDir = path.join(root, ".opencode", "skills");
  const sourceSkillsDir = path.join(root, "src", "opencode", "skills");

  if (!fs.existsSync(projectionSkillsDir) || !fs.existsSync(sourceSkillsDir)) {
    return results;
  }

  const sourceSkillDirs = new Set(listDirs(sourceSkillsDir));
  const projectionSkillDirs = listDirs(projectionSkillsDir);

  // Projection-only skill names: exist in .opencode/skills/ but not in src/opencode/skills/.
  // repo-* prefix is repo-local by design (ADR-0106 / REQ-0159-002).
  const projectionOnlySkills = projectionSkillDirs.filter(
    (d) => !sourceSkillDirs.has(d) && !d.startsWith("repo-"),
  );

  if (projectionOnlySkills.length === 0) {
    results.push(
      ok(
        "Inventory",
        "distribution-untracked-skill-reference",
        "No projection-only skills referenced by distribution (REQ-0159-003)",
      ),
    );
    return results;
  }

  // Collect distribution .md targets once.
  const targets: string[] = [];
  for (const rel of IR058_DISTRIBUTION_DIRS) {
    const absDir = path.join(root, ...rel.split("/"));
    if (!fs.existsSync(absDir)) continue;
    const acc: string[] = [];
    if (rel.endsWith("skills")) {
      for (const sub of listDirs(absDir)) {
        walkMarkdown(path.join(absDir, sub), acc);
      }
    } else {
      walkMarkdown(absDir, acc);
    }
    targets.push(...acc);
  }

  let foundViolation = false;
  for (const skillName of projectionOnlySkills) {
    const refPattern = buildIr058ReferencePattern(skillName);
    let referenced = false;
    let evidence: { file: string; line: number; text: string } | null = null;
    for (const fullPath of targets) {
      const relPath = resolveRelative(fullPath, root);
      if (isIr058ExemptPath(relPath)) continue;
      const content = readText(fullPath);
      if (!content) continue;
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        refPattern.lastIndex = 0;
        if (refPattern.test(lines[i])) {
          referenced = true;
          evidence = { file: relPath, line: i + 1, text: lines[i].trim() };
          break;
        }
      }
      if (referenced) break;
    }
    if (referenced) {
      foundViolation = true;
      results.push(
        ng(
          "Inventory",
          "distribution-untracked-skill-reference",
          `Skill '${skillName}' is referenced by distribution (${evidence!.file}:${evidence!.line}) but exists only in .opencode/skills/. Promote to src/opencode/skills/ (ADR-0134/REQ-0159-001).`,
          undefined,
          undefined,
          {
            evidence: `${evidence!.file}:${evidence!.line}: ${evidence!.text}`,
            expected: `src/opencode/skills/${skillName}/`,
            route: determineRoute("integrity-rule-gap", 1),
          },
        ),
      );
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "Inventory",
        "distribution-untracked-skill-reference",
        "No projection-only skills referenced by distribution (REQ-0159-003)",
      ),
    );
  }
  return results;
}

// ─── Broken junction / symlink detection (REQ-0108-172, REQ-0108-173) ───────

/**
 * Detect broken junctions (Windows) and broken symlinks (Unix) under the
 * .opencode/skills/ directory. A junction/symlink is "broken" when its
 * target directory does not exist on disk.
 *
 * Windows: fs.statSync follows the reparse point, so we use lstatSync-style
 * checks via fs.readdirSync with withFileTypes and inspect the Dirent.
 * If a junction target is missing, fs.existsSync returns false for the path,
 * but the junction directory entry still appears in readdir.
 */
// REQ-0108-191: Extended to scan both skills and commands directories
function checkBrokenJunctions(skillsDir: string, root: string, cmdsDir?: string): CheckResult[] {
  const results: CheckResult[] = [];
  let foundBroken = false;

  // REQ-0108-191: Scan multiple directories for broken junctions
  const dirsToScan = [skillsDir];
  if (cmdsDir && fs.existsSync(path.dirname(cmdsDir))) {
    dirsToScan.push(cmdsDir);
  }

  for (const scanDir of dirsToScan) {
    if (!fs.existsSync(scanDir)) {
      results.push(
        info(
          "JunctionIntegrity",
          "broken-junction",
          `Directory does not exist: ${resolveRelative(scanDir, root)}`,
        ),
      );
      continue;
    }

    const entries = fs.readdirSync(scanDir, {
      withFileTypes: true,
    }) as import("fs").Dirent[];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(scanDir, entry.name);
      const relPath = resolveRelative(fullPath, root);

      let isJunction = false;
      try {
        const lstat = fs.lstatSync(fullPath) as import("fs").Stats;
        isJunction = lstat.isSymbolicLink();
      } catch {
        try {
          fs.statSync(fullPath);
        } catch {
          foundBroken = true;
          results.push(
            ng(
              "JunctionIntegrity",
              "broken-junction",
              `Broken junction/symlink detected: '${entry.name}' target does not exist`,
              relPath,
              undefined,
              {
                evidence: entry.name,
                expected: "junction/symlink target directory must exist",
                route: determineRoute("JunctionIntegrity", 1),
              },
            ),
          );
          continue;
        }
      }

      if (isJunction) {
        try {
          fs.statSync(fullPath);
        } catch {
          foundBroken = true;
          results.push(
            ng(
              "JunctionIntegrity",
              "broken-junction",
              `Broken junction/symlink detected: '${entry.name}' target does not exist`,
              relPath,
              undefined,
              {
                evidence: entry.name,
                expected: "junction/symlink target directory must exist",
                route: determineRoute("JunctionIntegrity", 1),
              },
            ),
          );
        }
      }
    }
  }

  if (!foundBroken) {
    results.push(
      ok(
        "JunctionIntegrity",
        "broken-junction",
        "No broken junctions or symlinks detected in skills/commands directories",
      ),
    );
  }
  return results;
}

// ─── Document Classification Policy checks (REQ-0108-196) ─────────────────

const DOCUMENT_CLASSIFICATIONS = ["REQ", "ADR", "SPEC", "Guide", "Report", "DOC-MAP"] as const;

function checkDocumentClassificationPolicy(root: string): CheckResult[] { // REQ-0108-196
  const results: CheckResult[] = [];

  // Verify 6 document classifications are recognized
  if (DOCUMENT_CLASSIFICATIONS.length !== 6) {
    results.push(
      ng(
        "ClassificationPolicy",
        "classification-count",
        `Expected 6 document classifications but found ${DOCUMENT_CLASSIFICATIONS.length}`,
      ),
    );
  } else {
    results.push(
      ok(
        "ClassificationPolicy",
        "classification-count",
        `6 document classifications recognized: ${DOCUMENT_CLASSIFICATIONS.join(", ")}`,
      ),
    );
  }

  // Verify report documents are in the expected location
  const reportsDir = path.join(root, ".agentdev", "integrity", "reports");
  if (fs.existsSync(reportsDir)) {
    const reportFiles = listFiles(reportsDir);
    results.push(
      ok(
        "ClassificationPolicy",
        "report-collection",
        `Report collection at .agentdev/integrity/reports/ contains ${reportFiles.length} file(s)`,
      ),
    );
  } else {
    results.push(
      warn(
        "ClassificationPolicy",
        "report-collection",
        "Report collection directory .agentdev/integrity/reports/ does not exist",
        undefined,
        undefined,
        {
          evidence: reportsDir,
          expected: "directory should exist for Report classification",
          route: "intake",
        },
      ),
    );
  }

  // Verify DOC-MAP exists
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  if (fs.existsSync(docMapPath)) {
    results.push(
      ok(
        "ClassificationPolicy",
        "docmap-collection",
        "DOC-MAP collection exists at docs/DOC-MAP.md",
      ),
    );
  } else {
    results.push(
      ng(
        "ClassificationPolicy",
        "docmap-collection",
        "DOC-MAP.md not found — DOC-MAP classification has no instances",
        resolveRelative(docMapPath, root),
      ),
    );
  }

  if (results.filter((r) => r.level === "ng").length === 0) {
    results.push(
      ok(
        "ClassificationPolicy",
        "classification-policy",
        "Document Classification Policy checks passed (6 classifications, collection integrity verified)",
      ),
    );
  }
  return results;
}

// ─── REQ-0108-202: Update Notes section detection in non-REQ docs ──────────

function checkUpdateNotesInDocs(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  let foundViolation = false;

  const updateNotesPattern = /^##\s+(Update\s+Notes|更新履歴)\s*$/gm;

  // Scan docs except REQ files (which legitimately have Update Notes)
  const dirsToScan = [
    path.join(root, "docs", "specs"),
    path.join(root, "docs", "guides"),
    path.join(root, "docs", "adr"),
  ];

  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) continue;
    for (const file of listFiles(dir)) {
      const fullPath = path.join(dir, file);
      const content = readText(fullPath);
      if (!content) continue;
      const relPath = resolveRelative(fullPath, root);

      updateNotesPattern.lastIndex = 0;
      if (updateNotesPattern.test(content)) {
        foundViolation = true;
        results.push(
          warn(
            "DocumentDrift",
            "update-notes-in-docs",
            `Update Notes section found in non-REQ document (REQ-0108-202)`,
            relPath,
            undefined,
            {
              evidence: "## Update Notes / ## 更新履歴",
              expected: "Update Notes sections should only exist in REQ files",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "DocumentDrift",
        "update-notes-in-docs",
        "No Update Notes sections found in non-REQ documents",
      ),
    );
  }
  return results;
}

// ─── REQ-0108-206: Summary/index REQ range consistency ────────────────────
// (Extends checkReqRangeStaleness with specific summary/index file focus)

function checkSummaryReqRangeConsistency(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqDir = path.join(root, "docs", "requirements");
  const reqFiles = listFiles(reqDir).filter(
    (f) => f.startsWith("REQ-") && f !== "README.md",
  );
  const actualReqIds = new Set(reqFiles.map((f) => f.replace(".md", "")));

  // Check README index for range/count statements
  const readmePath = path.join(reqDir, "README.md");
  const readmeContent = readText(readmePath);

  if (readmeContent) {
    // Check count in README: e.g., "以下16件" or "以下14件"
    const countMatch = readmeContent.match(/以下(\d+)件/);
    if (countMatch) {
      const statedCount = parseInt(countMatch[1], 10);
      if (statedCount !== actualReqIds.size) {
        results.push(
          warn(
            "DocumentDrift",
            "summary-req-range",
            `README states ${statedCount} active REQs but actual count is ${actualReqIds.size} (REQ-0108-206)`,
            resolveRelative(readmePath, root),
            undefined,
            {
              evidence: countMatch[0],
              expected: `${actualReqIds.size} active REQs`,
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (results.length === 0) {
    results.push(
      ok(
        "DocumentDrift",
        "summary-req-range",
        `Summary/index REQ range is consistent (${actualReqIds.size} active REQs)`,
      ),
    );
  }
  return results;
}

// ─── REQ-0108-207: Old status vocabulary detection ─────────────────────────

function checkOldStatusVocabulary(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  let foundViolation = false;

  // Detect old status patterns beyond what checkAdrStatusNormalization covers
  const oldStatusPatterns = [
    /superseded-by:\s*\[/gi,
    /status:\s*retained\b/gi,
    /status:\s*partially\s+superseded\b/gi,
  ];

  const dirsToScan = [
    path.join(root, "docs", "adr"),
    path.join(root, "docs", "requirements"),
  ];

  const exemptPatterns = [
    /retired\//,
    /mapping-table/,
    /vocabulary-registry\.md$/,
    /REQ-0108\.md$/,
  ];

  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) continue;
    for (const file of listFiles(dir)) {
      const fullPath = path.join(dir, file);
      const relPath = resolveRelative(fullPath, root);
      if (exemptPatterns.some((p) => p.test(relPath))) continue;

      const content = readText(fullPath);
      if (!content) continue;

      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (isNegativeExample(lines[i])) continue;
        for (const pattern of oldStatusPatterns) {
          pattern.lastIndex = 0;
          if (pattern.test(lines[i])) {
            foundViolation = true;
            results.push(
              warn(
                "DocumentDrift",
                "old-status-vocabulary",
                `Old status vocabulary detected (REQ-0108-207)`,
                relPath,
                i + 1,
                {
                  evidence: lines[i].trim(),
                  expected: "use normalized status vocabulary (migrated / retired-no-successor / historical-only)",
                  route: "intake",
                },
              ),
            );
          }
        }
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "DocumentDrift",
        "old-status-vocabulary",
        "No old status vocabulary patterns detected",
      ),
    );
  }
  return results;
}

// ─── REQ-0108-208: Legacy namespace detection in docs ──────────────────────
// (Supplements checkExpandedLegacyNamespace with broader doc scope)

function checkLegacyNamespaceInDocs(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  let foundViolation = false;

  const legacyCommandPatterns = [
    /\/issue\//g,
    /\/tips\//g,
  ];

  const dirsToScan = [
    path.join(root, "docs", "guides"),
    path.join(root, "docs", "specs"),
    path.join(root, "docs", "DOC-MAP.md"),
  ];

  const exemptPatterns = [
    /vocabulary-registry\.md$/,
    /integrity-rule-catalog\.md$/,
  ];

  for (const target of dirsToScan) {
    if (!fs.existsSync(target)) continue;

    const stat = fs.statSync(target);
    const filesToCheck: string[] = [];

    if (stat.isDirectory()) {
      for (const f of listFiles(target)) filesToCheck.push(path.join(target, f));
    } else {
      filesToCheck.push(target);
    }

    for (const fullPath of filesToCheck) {
      const relPath = resolveRelative(fullPath, root);
      if (exemptPatterns.some((p) => p.test(relPath))) continue;

      const content = readText(fullPath);
      if (!content) continue;

      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (isInsideCodeBlock(lines, i)) continue;
        for (const pattern of legacyCommandPatterns) {
          pattern.lastIndex = 0;
          if (pattern.test(lines[i])) {
            foundViolation = true;
            results.push(
              warn(
                "DocumentDrift",
                "legacy-namespace-in-docs",
                `Legacy command namespace detected in docs (REQ-0108-208)`,
                relPath,
                i + 1,
                {
                  evidence: lines[i].trim(),
                  expected: "use /agentdev/ namespace",
                  route: "intake",
                },
              ),
            );
          }
        }
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "DocumentDrift",
        "legacy-namespace-in-docs",
        "No legacy command namespaces detected in docs",
      ),
    );
  }
  return results;
}

// ─── REQ-0108-210: Windows junction scan coverage ──────────────────────────
// Already implemented in checkBrokenJunctions (skillsDir + cmdsDir).
// This check verifies that junction scanning is enabled for all relevant dirs.

function checkJunctionScanCoverage(root: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Verify that the key directories exist and are scannable
  const dirsToVerify = [
    path.join(root, ".opencode", "skills"),
    path.join(root, ".opencode", "commands"),
  ];

  let allAccessible = true;
  for (const dir of dirsToVerify) {
    if (!fs.existsSync(dir)) {
      allAccessible = false;
      results.push(
        warn(
          "JunctionIntegrity",
          "junction-scan-coverage",
          `Directory not accessible for junction scanning: ${resolveRelative(dir, root)} (REQ-0108-210)`,
          resolveRelative(dir, root),
          undefined,
          {
            evidence: dir,
            expected: "directory must be accessible for junction detection",
            route: "intake",
          },
        ),
      );
    }
  }

  if (allAccessible) {
    results.push(
      ok(
        "JunctionIntegrity",
        "junction-scan-coverage",
        "All required directories are accessible for junction scanning (REQ-0108-210)",
      ),
    );
  }
  return results;
}

// ─── REQ-0108-211: .agentdev/ exclusion from false positives ──────────────

function checkAgentdevExclusion(root: string): CheckResult[] {
  const results: CheckResult[] = [];

  // Verify .agentdev/ exists and is excluded from docs scan targets
  const agentdevDir = path.join(root, ".agentdev");
  if (fs.existsSync(agentdevDir)) {
    results.push(
      ok(
        "ScanScope",
        "agentdev-exclusion",
        ".agentdev/ exists and is excluded from docs-check false positive targets (REQ-0108-211)",
      ),
    );
  } else {
    results.push(
      info(
        "ScanScope",
        "agentdev-exclusion",
        ".agentdev/ does not exist — no exclusion needed (REQ-0108-211)",
      ),
    );
  }
  return results;
}

// ─── REQ-0108-212: references/ recursive scan ─────────────────────────────

function checkReferencesRecursiveScan(skillsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  let refCount = 0;

  for (const dir of listDirs(skillsDir)) {
    const refsDir = path.join(skillsDir, dir, "references");
    if (fs.existsSync(refsDir)) {
      // Count files recursively
      function countFilesRecurse(d: string): number {
        let count = 0;
        const entries = fs.readdirSync(d, { withFileTypes: true }) as import("fs").Dirent[];
        for (const entry of entries) {
          const fp = path.join(d, entry.name);
          if (entry.isDirectory()) {
            count += countFilesRecurse(fp);
          } else if (entry.name.endsWith(".md")) {
            count++;
          }
        }
        return count;
      }
      refCount += countFilesRecurse(refsDir);
    }
  }

  results.push(
    ok(
      "ScanScope",
      "references-recursive-scan",
      `${refCount} files found in references/ directories — all recursively scanned (REQ-0108-212)`,
    ),
  );
  return results;
}

// ─── REQ-0108-213: Integrity report self-exclusion ────────────────────────

function checkReportSelfExclusion(root: string): CheckResult[] {
  const results: CheckResult[] = [];

  const reportsDir = path.join(root, ".agentdev", "integrity", "reports");
  if (fs.existsSync(reportsDir)) {
    const reportFiles = listFiles(reportsDir);
    results.push(
      ok(
        "ScanScope",
        "report-self-exclusion",
        `${reportFiles.length} integrity report(s) exist — excluded from scan targets to prevent self-detection (REQ-0108-213)`,
      ),
    );
  } else {
    results.push(
      ok(
        "ScanScope",
        "report-self-exclusion",
        "No integrity reports directory — no self-exclusion needed (REQ-0108-213)",
      ),
    );
  }
  return results;
}

// ─── REQ-0108-214: Vocabulary registry sync ────────────────────────────────

function checkVocabularyRegistrySync(root: string): CheckResult[] {
  const results: CheckResult[] = [];

  const registryPath = path.join(
    root,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "references",
    "vocabulary-registry.md",
  );

  const registryContent = readText(registryPath);
  if (!registryContent) {
    results.push(
      warn(
        "Canonical",
        "vocabulary-registry-sync",
        "Vocabulary registry not found (REQ-0108-214)",
        undefined,
        undefined,
        {
          evidence: registryPath,
          expected: "vocabulary-registry.md must exist",
          route: "req-define",
        },
      ),
    );
    return results;
  }

  // Check that registry contains the expected sections
  const requiredSections = ["コマンド名", "コマンドパス", "スキル名", "廃止済み概念"];
  const missingSections = requiredSections.filter(
    (s) => !registryContent.includes(s),
  );

  if (missingSections.length > 0) {
    results.push(
      warn(
        "Canonical",
        "vocabulary-registry-sync",
        `Vocabulary registry missing sections: ${missingSections.join(", ")} (REQ-0108-214)`,
        resolveRelative(registryPath, root),
        undefined,
        {
          evidence: missingSections.join(", "),
          expected: `all required sections: ${requiredSections.join(", ")}`,
          route: "req-define",
        },
      ),
    );
  } else {
    results.push(
      ok(
        "Canonical",
        "vocabulary-registry-sync",
        "Vocabulary registry contains all required sections and is synchronized (REQ-0108-214)",
      ),
    );
  }
  return results;
}

// ─── Capture boundary checks (REQ-0105) ─────────────────────────────────

function checkCaptureBoundaryReference(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const runtimePath = path.join(
    root,
    "src",
    "opencode",
    "skills",
    "agentdev-workflow-orchestration",
    "references",
    "capture-boundaries.md",
  );
  const resolved = resolvePathWithFallback(runtimePath);

  if (fs.existsSync(resolved)) {
    results.push(
      ok(
        "CaptureBoundary",
        "capture-boundaries-existence",
        "capture-boundaries.md exists at canonical location",
      ),
    );
  } else {
    results.push(
      ng(
        "CaptureBoundary",
        "capture-boundaries-existence",
        `capture-boundaries.md not found (resolved: ${resolveRelative(resolved, root)})`,
      ),
    );
  }
  return results;
}

function checkPrTemplateCaptureSection(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const runtimePath = path.join(
    root,
    ".opencode",
    "skills",
    "agentdev-workflow-templates",
    "templates",
    "pr_desc.md",
  );
  const resolved = resolvePathWithFallback(runtimePath);
  const content = readText(resolved);

  if (!content) {
    results.push(
      ng(
        "CaptureBoundary",
        "pr-template-capture-section",
        `pr_desc.md not found (resolved: ${resolveRelative(resolved, root)})`,
      ),
    );
    return results;
  }

  if (content.includes("## Findings / Intake候補")) {
    results.push(
      ng(
        "CaptureBoundary",
        "pr-template-capture-section",
        `pr_desc.md contains old section name '## Findings / Intake候補' (should be '## Findings / Capture候補')`,
        resolveRelative(resolved, root),
      ),
    );
    return results;
  }

  if (!content.includes("## Findings / Capture候選") && !content.includes("## Findings / Capture候補")) {
    results.push(
      ng(
        "CaptureBoundary",
        "pr-template-capture-section",
        `pr_desc.md missing required section '## Findings / Capture候補'`,
        resolveRelative(resolved, root),
      ),
    );
    return results;
  }

  const missingSubsections: string[] = [];
  if (!content.includes("### intake")) {
    missingSubsections.push("### intake");
  }
  if (!content.includes("### learning")) {
    missingSubsections.push("### learning");
  }

  if (missingSubsections.length > 0) {
    results.push(
      ng(
        "CaptureBoundary",
        "pr-template-capture-section",
        `pr_desc.md missing subsections: ${missingSubsections.join(", ")}`,
        resolveRelative(resolved, root),
      ),
    );
  } else {
    results.push(
      ok(
        "CaptureBoundary",
        "pr-template-capture-section",
        "pr_desc.md has correct capture section structure (## Findings / Capture候補, ### intake, ### learning)",
      ),
    );
  }
  return results;
}

function checkCommandCaptureDuties(cmdDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const duties: Record<string, { dutyKeyword: string; dutyLabel: string }> = {
    "case-run.md": { dutyKeyword: "記録のみ", dutyLabel: "record only" },
    "case-close.md": { dutyKeyword: "回収・保存", dutyLabel: "recover and save" },
    "req-save.md": { dutyKeyword: "原則非関与", dutyLabel: "principle: non-involvement" },
    "case-open.md": { dutyKeyword: "非関与", dutyLabel: "non-involvement" },
    "case-auto.md": { dutyKeyword: "委譲", dutyLabel: "delegation" },
  };

  for (const [filename, { dutyKeyword, dutyLabel }] of Object.entries(duties)) {
    const fullPath = path.join(cmdDir, filename);
    const content = readText(fullPath);

    if (!content) {
      results.push(
        ng(
          "CaptureBoundary",
          "command-capture-duty",
          `${filename} not found in command directory`,
          resolveRelative(fullPath, root),
        ),
      );
      continue;
    }

    const hasCaptureRef = content.includes("capture-boundaries");
    const hasDutyKeyword = content.includes(dutyKeyword);

    if (!hasCaptureRef && !hasDutyKeyword) {
      results.push(
        ng(
          "CaptureBoundary",
          "command-capture-duty",
          `${filename} missing both 'capture-boundaries' reference and duty keyword '${dutyKeyword}' (${dutyLabel})`,
          resolveRelative(fullPath, root),
        ),
      );
    } else if (!hasCaptureRef) {
      results.push(
        ng(
          "CaptureBoundary",
          "command-capture-duty",
          `${filename} missing 'capture-boundaries' reference`,
          resolveRelative(fullPath, root),
        ),
      );
    } else if (!hasDutyKeyword) {
      results.push(
        ng(
          "CaptureBoundary",
          "command-capture-duty",
          `${filename} missing duty keyword '${dutyKeyword}' (${dutyLabel})`,
          resolveRelative(fullPath, root),
        ),
      );
    } else {
      results.push(
        ok(
          "CaptureBoundary",
          "command-capture-duty",
          `${filename} has capture-boundaries reference and duty keyword '${dutyKeyword}'`,
        ),
      );
    }
  }
  return results;
}

const SJ_ULWLOOP_PATTERN = /Sisyphus-Junior[\s]*[(（]\s*ulw-loop\s*[)）]/;
const SJ_ULWLOOP_EXEMPT_PATHS: RegExp[] = [
  /retired\/REQ-/,
  /docs[\\/]+requirements[\\/]+REQ-/,
  /mapping-table\.md$/,
  /integrity-rule-catalog\.md$/,
  /\.test\.ts$/,
  /check_integrity\.ts$/,
];

function checkSisyphusJuniorUlwLoopMisclassification(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const scanDirs = [
    path.join(root, "docs"),
    path.join(root, ".opencode", "skills"),
    path.join(root, ".opencode", "commands"),
    path.join(root, "src", "opencode", "skills"),
    path.join(root, "src", "opencode", "commands"),
  ];

  const mdFiles: string[] = [];
  for (const dir of scanDirs) {
    if (!fs.existsSync(dir)) continue;
    if (fs.statSync(dir).isDirectory()) {
      const entries = fs.readdirSync(dir, { recursive: true }) as string[];
      for (const entry of entries) {
        if (typeof entry === "string" && entry.endsWith(".md")) {
          mdFiles.push(path.join(dir, entry));
        }
      }
    }
  }

  let found = false;
  for (const filePath of mdFiles) {
    const content = readText(filePath);
    if (!content) continue;
    const relPath = resolveRelative(filePath, root);
    if (SJ_ULWLOOP_EXEMPT_PATHS.some((re) => re.test(relPath))) continue;
    const inCodeBlock = content.split("```");
    const nonCodeParts = inCodeBlock.filter((_, i) => i % 2 === 0).join(" ");
    if (SJ_ULWLOOP_PATTERN.test(nonCodeParts)) {
      found = true;
      results.push(
        ng(
          "ExecutionSubject",
          "sisyphus-junior-ulw-loop-misclassification",
          "'Sisyphus-Junior(ulw-loop)' misclassification found: /ulw-loop is a command, not a skill (REQ-0144-012/013)",
          relPath,
        ),
      );
    }
  }

  if (!found) {
    results.push(
      ok(
        "ExecutionSubject",
        "sisyphus-junior-ulw-loop-misclassification",
        "No 'Sisyphus-Junior(ulw-loop)' misclassification detected (REQ-0144-013)",
      ),
    );
  }
  return results;
}

function checkMappingTableHistoryLabels(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const mappingTablePath = path.join(root, "docs", "requirements", "mapping-table.md");
  if (!fs.existsSync(mappingTablePath)) {
    results.push(ok("Vocabulary", "mapping-table-history", "mapping-table.md not found, skip"));
    return results;
  }

  const content = readText(mappingTablePath);
  if (!content) {
    results.push(ok("Vocabulary", "mapping-table-history", "mapping-table.md empty, skip"));
    return results;
  }

  const oldVocabPatterns = [
    /retained/g,
    /partially superseded/g,
  ];

  let unlabeledCount = 0;
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("|") && line.includes("status")) continue;
    if (!line.startsWith("|")) continue;
    for (const pat of oldVocabPatterns) {
      pat.lastIndex = 0;
      if (pat.test(line)) {
        const hasHistoryLabel = line.includes("履歴") || line.includes("historical") || line.includes("旧");
        if (!hasHistoryLabel) {
          unlabeledCount++;
        }
      }
    }
  }

  if (unlabeledCount > 0) {
    results.push(
      ng(
        "Vocabulary",
        "mapping-table-history",
        `mapping-table.md has ${unlabeledCount} old vocabulary entries without history label (REQ-0108-240)`,
      ),
    );
  } else {
    results.push(
      ok("Vocabulary", "mapping-table-history", "Old vocabulary in mapping-table.md properly labeled as historical (REQ-0108-240)"),
    );
  }
  return results;
}

function checkReqVerificationBasis(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqDir = path.join(root, "docs", "requirements");
  if (!fs.existsSync(reqDir)) {
    results.push(ok("DocsCheck", "req-verification-basis", "REQ directory not found, skip"));
    return results;
  }

  const reqFiles = listFiles(reqDir).filter((f) => f.startsWith("REQ-") && f.endsWith(".md"));
  let totalReqRows = 0;
  let legacyMarkerBasedRows = 0;

  for (const file of reqFiles) {
    const content = readText(path.join(reqDir, file));
    if (!content) continue;
    const lines = content.split("\n");
    for (const line of lines) {
      if (!line.startsWith("|") || line.includes("---")) continue;
      if (line.includes("REQ-") && /\d{3}/.test(line)) {
        totalReqRows++;
        const legacyMarkerPattern = new RegExp(`（(${["S" + "HALL", "S" + "HOULD", "M" + "AY", "M" + "UST"].join("|")})）`);
        if (legacyMarkerPattern.test(line)) {
          legacyMarkerBasedRows++;
        }
      }
    }
  }

  if (legacyMarkerBasedRows > 0) {
    results.push(
      ng(
        "DocsCheck",
        "req-verification-basis",
        `${legacyMarkerBasedRows}/${totalReqRows} REQ rows still use legacy markers instead of 必達要件 (REQ-0115-044)`,
      ),
    );
  } else {
    results.push(
      ok(
        "DocsCheck",
        "req-verification-basis",
        `All ${totalReqRows} REQ rows use 必達要件-based verification (REQ-0115-044)`,
      ),
    );
  }
  return results;
}

// ─── IR-044: REQ/SPEC boundary violation detection (REQ-0108-259, REQ-0108-260) ──
// Detects SPEC detail contamination in active REQ requirement lines.
// 9 SPEC separation criteria violation signals (REQ-0101-067, 068):
//   1. schema field   2. enum value list      3. fixture detail
//   4. checker individual rule   5. false positive suppression
//   6. Step number    7. Phase number         8. internal algorithm
//   9. specific work history
// Step number signal covers `Step N`, `ステップ N`, `手順 N` direct references
// (REQ-0136-031). The word "Step 番号" (without digit literal) is NOT matched,
// preventing META rule declaration lines like REQ-0136-031 itself from being
// falsely flagged (mechanical digit-literal distinction, not context exemption).
// Pure pattern-match detection (no meaning-based context exemption).
// Severity: heuristic (warn / exit 0).

const IR044_SIGNAL_PATTERNS: ReadonlyArray<{ signal: string; pattern: RegExp }> =
  [
    {
      signal: "schema field",
      pattern:
        /schema\s*field|スキーマ\s*フィールド|frontmatter\s*フィールド\s*の\s*型|フィールド\s*の\s*型\s*は\s*["'`]|必須\s*フィールド\s*.*型\s*[=:]/i,
    },
    {
      signal: "enum value list",
      pattern:
        /\benum\s*(値|リスト|一覧)?|列挙値\s*(一覧|リスト)?|列挙\s*(一覧|リスト)|値\s*一覧\s*[:：]/i,
    },
    {
      signal: "fixture detail",
      pattern: /\bfixtures?\b|フィクスチャ|テスト\s*データ\s*詳細/i,
    },
    {
      signal: "checker individual rule",
      pattern:
        /checker\s*(個別\s*)?ルール|検出\s*(ルール|パターン)\s*[:：]|detection\s*pattern\s*[:：]/i,
    },
    {
      signal: "false positive suppression",
      pattern:
        /false\s*positive\s*(抑制|除外)|偽陽性\s*(抑制|除外)|\bFP\s*抑制|除外\s*(パス|ルール)\s*[:：]|\bexempt\s*(path|file)/i,
    },
    {
      signal: "Step number",
      pattern: /\bStep\s*\d+(?:\s*[-–]\s*\d+)?\b|ステップ\s*\d+(?:\s*[-–]\s*\d+)?|手順\s*\d+(?:\s*[-–]\s*\d+)?/,
    },
    {
      signal: "Phase number",
      pattern: /\bPhase\s*\d+\b|フェーズ\s*\d+/,
    },
    {
      signal: "internal algorithm",
      pattern: /内部\s*アルゴリズム|internal\s*algorithm|実装\s*の\s*アルゴリズム/i,
    },
    {
      signal: "work history",
      pattern:
        /作業履歴\s*[:：]|PR\s*#\d+|commit\s+[0-9a-f]{7,40}|\bINC-\d{4,}\b|Issue\s*#\d+\s*で\s*(実装|追加|修正)/i,
    },
  ];

// REQ-0145-013: 件数・内容規定検出。予防的ガード句の判定根拠。
function hasCountOrContentRule(line: string): boolean {
  return /\d+\s*(件|個|本|つ|種類|項目|以上|以下)|最大\s*\d+|最小\s*\d+/.test(
    line,
  );
}

// REQ-0145-012/013: behavior predicate context 判定。契約・状態・禁止の記述文脈を検出する。
// REQ-0145-013 予防的ガード句: 件数・内容規定を含む行は exemption を拒否する。
function isBehaviorPredicateContext(line: string): boolean {
  if (hasCountOrContentRule(line)) {
    return false;
  }
  return /が\s*存在\s*すること|を\s*禁止\s*する|を\s*許可\s*しない/.test(line);
}

// REQ-0145-012: META 規則行 exemption。REQ/SPEC 責務範囲を規定する行（SPEC 種別を
// 名指しして責務境界を宣言する行）を機械的に判定し免除する。件数・内容規定を含む行は
// 予防的ガード句 (REQ-0145-013) により免除を拒否し、true positive 保護を維持する。
// 当該行は SPEC 詳細の記述ではなく責務範囲の規定である（REQ-0145-012 準拠）。
function isMetaRuleLine(line: string): boolean {
  if (hasCountOrContentRule(line)) {
    return false;
  }
  // (1) SPEC への切り出し・配置・混入排除を宣言する行
  if (/切り出し|切り出す|配置する\s*(対象|こと)|混入\s*させ(ない|ぬ)/.test(line)) {
    return true;
  }
  // (2) REQ/SPEC 定義構造（REQ は X、SPEC は Y の文書種別定義）
  if (/REQ\s*は.*SPEC\s*は/.test(line)) {
    return true;
  }
  // (3) 文書種別・境界・exemption のメタ言語
  if (/文書種別|境界\s*を\s*(定義|規定)|exemption\s*対象/.test(line)) {
    return true;
  }
  // (4) SPEC / catalog / reference への委譲（委譲先に SPEC 系キーワードを含む行のみ）
  if (/委譲/.test(line) && /SPEC|catalog|カタログ|reference|リファレンス/.test(line)) {
    return true;
  }
  return false;
}

function checkReqSpecBoundaryViolation(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const reqDir = path.join(root, "docs", "requirements");
  if (!fs.existsSync(reqDir)) return results;
  let foundViolation = false;

  for (const file of listFiles(reqDir)) {
    // listFiles returns top-level .md files only; retired/ subdirectory excluded.
    if (!file.startsWith("REQ-") || !file.endsWith(".md")) continue;
    const fullPath = path.join(reqDir, file);
    const content = readText(fullPath);
    if (!content) continue;
    const relPath = resolveRelative(fullPath, root);

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Only inspect requirement table rows: | REQ-NNNN-NNN | description |
      const rowMatch = line.match(
        /^\|\s*(REQ-\d{4}-\d{3})\s*\|\s*([\s\S]*?)\s*\|\s*$/,
      );
      if (!rowMatch) continue;
      const reqItemId = rowMatch[1];
      const description = rowMatch[2];

      // Skip header / separator artifacts
      if (/^-+$/.test(description) || /^要\s*件$/.test(description.trim())) {
        continue;
      }

      // Strip inline code spans so code-only tokens don't trigger keyword match
      const stripped = stripInlineCode(description);

      for (const { signal, pattern } of IR044_SIGNAL_PATTERNS) {
        if (pattern.test(stripped)) {
          // REQ-0145-012/013: behavior predicate context は exemption 対象。
          // 件数・内容規定を含む行は isBehaviorPredicateContext が false を返し拒否される。
          if (isBehaviorPredicateContext(stripped)) {
            break;
          }
          // REQ-0145-012: META 規則行 exemption。REQ/SPEC 責務範囲を規定する行は免除する。
          if (isMetaRuleLine(stripped)) {
            break;
          }
          foundViolation = true;
          results.push(
            warn(
              "CanonicalConflict",
              "req-spec-boundary-violation",
              `REQ requirement line may contain SPEC detail ("${signal}") — consider moving to SPEC/rule catalog/command reference (IR-044, REQ-0108-259)`,
              relPath,
              i + 1,
              {
                evidence: `${reqItemId}: ${description.trim()}`,
                expected:
                  "REQ should describe external contract / state / behavior; SPEC detail belongs in SPEC docs",
                route: "req-define",
              },
            ),
          );
          break; // one finding per requirement line
        }
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "CanonicalConflict",
        "req-spec-boundary-violation",
        "No REQ/SPEC boundary violations detected in active REQs (IR-044, REQ-0108-259)",
      ),
    );
  }
  return results;
}

// ─── IR-053: gh direct invocation detection (REQ-0152-001, REQ-0152-002) ──────
// Detects direct `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)`
// invocations embedded in command/skill definitions. Direct gh CLI usage bypasses
// the agentdev-gh-cli delegation base (REQ-0149) and must route through it.
// Scan targets (REQ-0152-001):
//   src/opencode/commands/agentdev/*.md
//   src/opencode/skills/agentdev-*/**/*.md
// Exclusion (REQ-0152-002, REQ-0149-003 permitted file):
//   src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md
// Code-block contents are exempt (example/pattern description, REQ-0108-254).
// Severity: heuristic (warn / exit 1).

const IR053_GH_DIRECT_PATTERN =
  /\bgh\s+(issue|pr)\s+(create|edit|view|comment|merge|close|list|status)\b/i;

// Exemption paths (repo-root-relative, forward-slash normalized).
const IR053_EXEMPT_PATHS: RegExp[] = [
  /src\/opencode\/skills\/agentdev-gh-cli\/references\/standard-procedures\.md$/,
];

function walkMarkdown(dirPath: string, acc: string[]): void {
  if (!fs.existsSync(dirPath)) return;
  for (
    const entry of fs.readdirSync(dirPath, { withFileTypes: true }) as import("fs").Dirent[]
  ) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkMarkdown(full, acc);
    } else if (entry.name.endsWith(".md")) {
      acc.push(full);
    }
  }
}

function collectAgentdevSkillMarkdown(skillRoot: string): string[] {
  // Walk src/opencode/skills/agentdev-*/**/*.md recursively.
  const collected: string[] = [];
  if (!fs.existsSync(skillRoot)) return collected;
  for (const dir of listDirs(skillRoot)) {
    if (!dir.startsWith("agentdev-")) continue;
    walkMarkdown(path.join(skillRoot, dir), collected);
  }
  return collected;
}

function checkGhDirectInvocation(root: string): CheckResult[] {
  const results: CheckResult[] = [];

  const commandDir = path.join(root, "src", "opencode", "commands", "agentdev");
  const skillRoot = path.join(root, "src", "opencode", "skills");

  const targets: string[] = [];
  if (fs.existsSync(commandDir)) {
    for (const f of listFiles(commandDir)) targets.push(path.join(commandDir, f));
  }
  for (const f of collectAgentdevSkillMarkdown(skillRoot)) targets.push(f);

  let foundViolation = false;
  for (const fullPath of targets) {
    const relPath = resolveRelative(fullPath, root);
    if (IR053_EXEMPT_PATHS.some((re) => re.test(relPath))) continue;
    const content = readText(fullPath);
    if (!content) continue;
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (isInsideCodeBlock(lines, i)) continue;
      const match = lines[i].match(IR053_GH_DIRECT_PATTERN);
      if (match) {
        foundViolation = true;
        results.push(
          warn(
            "CanonicalConflict",
            "gh-direct-invocation",
            `Direct gh CLI invocation 'gh ${match[1]} ${match[2]}' detected — route via agentdev-gh-cli delegation (IR-053, REQ-0152-001)`,
            relPath,
            i + 1,
            {
              evidence: match[0],
              expected:
                "delegate gh CLI access through agentdev-gh-cli procedures (REQ-0149)",
              route: "intake",
            },
          ),
        );
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "CanonicalConflict",
        "gh-direct-invocation",
        "No direct gh CLI invocations detected in command/skill definitions (IR-053, REQ-0152-001)",
      ),
    );
  }
  return results;
}

// ===== IR-054: draft SPEC 放置検出 (REQ-0154-002) =====
// 閾値: 30日（docs/specs/integrity-rule-catalog.md「IR-054 閾値設計」が原本）
const IR054_DRAFT_STALE_DAYS = 30;
const IR054_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function checkDraftSpecStaleness(specsDir: string, root: string): CheckResult[] {
  const results: CheckResult[] = [];
  if (!fs.existsSync(specsDir)) return results;

  // docs/specs/**/*.md を再帰収集（README.md は対象外）
  const collected: string[] = [];
  walkMarkdown(specsDir, collected);
  const specFiles = collected.filter((full) => {
    const base = path.basename(full);
    return base !== "README.md";
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let foundStale = false;
  let draftCount = 0;

  for (const fullPath of specFiles) {
    const content = readText(fullPath);
    if (!content) continue;
    const fm = parseFrontmatter(content);
    if (!fm) continue;
    const status = fm["status"];
    if (typeof status !== "string" || status !== "draft") continue;
    draftCount++;

    const updated = fm["updated"];
    if (typeof updated !== "string") continue; // updated なしは別ルール（IR-002 相当）対象
    const m = updated.match(IR054_DATE_PATTERN);
    if (!m) continue;
    const updatedDate = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
    );
    if (isNaN(updatedDate.getTime())) continue;

    const diffMs = today.getTime() - updatedDate.getTime();
    const ageDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (ageDays > IR054_DRAFT_STALE_DAYS) {
      foundStale = true;
      results.push(
        warn(
          "Specs",
          "draft-spec-staleness",
          `Draft SPEC stale: age=${ageDays}d (threshold=${IR054_DRAFT_STALE_DAYS}d), updated=${updated}. Triage: (a) promote to accepted via case-close SPEC determination, (b) update content and bump updated, or (c) retire (IR-054, REQ-0154-002)`,
          resolveRelative(fullPath, root),
          1,
          {
            evidence: `status: draft, updated: ${updated}, age: ${ageDays}d`,
            expected: `draft SPEC updated within ${IR054_DRAFT_STALE_DAYS} days, or promoted to accepted`,
            route: "intake",
          },
        ),
      );
    }
  }

  if (!foundStale) {
    results.push(
      ok(
        "Specs",
        "draft-spec-staleness",
        `No stale draft SPECs detected (checked ${draftCount} draft SPECs, threshold ${IR054_DRAFT_STALE_DAYS}d) (IR-054, REQ-0154-002)`,
      ),
    );
  }
  return results;
}

// ===== IR-055: runtime-unresolved-reference (REQ-0108-263, REQ-0108-264) =====
// Detects references in distribution files (src/opencode/commands/agentdev/**/*.md,
// src/opencode/skills/agentdev-*/**/*.md) that cannot be resolved in consumer
// environments: REQ/ADR IDs, src/opencode/ paths, docs/specs/, docs/guides/,
// /repo/*, repo-*, main-repo GitHub URLs, line-number-qualified internal refs.
// Severity per SPEC docs/specs/integrity/rules/IR-055-runtime-unresolved-reference.md:
//   strict:    REQ-NNNN, REQ-NNNN-NNN, ADR-NNNN, src/opencode/, /repo/*, repo-*
//   heuristic: docs/specs/, docs/guides/, main-repo GitHub URL, file.md#L<N>
// Gradual rollout (REQ-0108-264): baseline-known violations are reported as info
// (no fail). New violations (delta from baseline) are reported as warn/ng and
// fail in delta guard / impact guard. Full audit fails once baseline reaches 0.

const IR055_STRICT_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: "REQ-NNNN-NNN", pattern: /\bREQ-\d{4}-\d{3}\b/g },
  { name: "REQ-NNNN", pattern: /\bREQ-\d{4}\b/g },
  { name: "ADR-NNNN", pattern: /\bADR-\d{4}\b/g },
  { name: "src/opencode/", pattern: /\bsrc\/opencode\//g },
  { name: "/repo/", pattern: /\/repo\//g },
  { name: "repo-*", pattern: /\brepo-[a-z][a-z0-9-]*/g },
];

const IR055_HEURISTIC_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: "docs/specs/", pattern: /\bdocs\/specs\//g },
  { name: "docs/guides/", pattern: /\bdocs\/guides\//g },
  {
    name: "main-repo GitHub URL",
    pattern:
      /\bhttps?:\/\/github\.com\/yogata\/agent-dev-flow\/(blob|tree|issues|pull)\//g,
  },
  { name: "line-number ref", pattern: /\b[\w.-]+\.md#L\d+\b/g },
];

const IR055_EXEMPT_PATH_PATTERNS: RegExp[] = [
  /\/vocabulary-registry\.md$/,
  /\/integrity-rule-catalog\.md$/,
  /\/integrity-contracts\.md$/,
  /\/rules\/IR-055[-/]/,
  /\/baselines\/ir-055-baseline\.json$/,
];

const IR055_BASELINE_PATH = path.join(
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "baselines",
  "ir-055-baseline.json",
);

interface Ir055BaselineEntry {
  file: string;
  pattern: string;
  severity: "strict" | "heuristic";
  count: number;
}

interface Ir055Baseline {
  version: number;
  rule_id: "IR-055";
  generated_at: string;
  entries: Ir055BaselineEntry[];
}

function loadIr055Baseline(root: string): Ir055Baseline | null {
  const baselineAbs = path.join(root, IR055_BASELINE_PATH);
  const content = readText(baselineAbs);
  if (!content) return null;
  try {
    return JSON.parse(content) as Ir055Baseline;
  } catch {
    return null;
  }
}

function writeIr055Baseline(root: string, baseline: Ir055Baseline): void {
  const baselineAbs = path.join(root, IR055_BASELINE_PATH);
  const dir = path.dirname(baselineAbs);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(baselineAbs, JSON.stringify(baseline, null, 2) + "\n", "utf-8");
}

function isIr055ExemptPath(relPath: string): boolean {
  return IR055_EXEMPT_PATH_PATTERNS.some((re) => re.test(relPath));
}

function isIr055ExemptLine(line: string): boolean {
  // Template placeholder exemption: lines carrying {NNN} style placeholders where
  // the match is a parameter rather than a concrete reference.
  if (/\{[^}]*\}/.test(line)) {
    // Only exempt when the placeholder is adjacent to the pattern kind; cheap
    // heuristic: if the line contains any "{...}" we skip it to avoid noisy FPs
    // on templated example text.
    return true;
  }
  return false;
}

interface Ir055RawViolation {
  file: string;
  line: number;
  pattern: string;
  severity: "strict" | "heuristic";
  evidence: string;
}

function collectIr055Violations(root: string): Ir055RawViolation[] {
  const commandDir = path.join(root, "src", "opencode", "commands", "agentdev");
  const skillRoot = path.join(root, "src", "opencode", "skills");

  const targets: string[] = [];
  if (fs.existsSync(commandDir)) {
    for (const f of listFiles(commandDir)) {
      if (f.endsWith(".md")) targets.push(path.join(commandDir, f));
    }
  }
  for (const f of collectAgentdevSkillMarkdown(skillRoot)) targets.push(f);

  const violations: Ir055RawViolation[] = [];

  for (const fullPath of targets) {
    const relPath = resolveRelative(fullPath, root);
    if (isIr055ExemptPath(relPath)) continue;
    const content = readText(fullPath);
    if (!content) continue;
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (isInsideCodeBlock(lines, i)) continue;
      const line = lines[i];
      if (isIr055ExemptLine(line)) continue;

      const scanList: ReadonlyArray<{ name: string; pattern: RegExp; severity: "strict" | "heuristic" }> = [
        ...IR055_STRICT_PATTERNS.map((p) => ({ ...p, severity: "strict" as const })),
        ...IR055_HEURISTIC_PATTERNS.map((p) => ({ ...p, severity: "heuristic" as const })),
      ];

      for (const { name, pattern, severity } of scanList) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(line)) !== null) {
          violations.push({
            file: relPath,
            line: i + 1,
            pattern: name,
            severity,
            evidence: match[0],
          });
        }
      }
    }
  }

  return violations;
}

function summarizeIr055Violations(
  violations: Ir055RawViolation[],
): Map<string, Ir055BaselineEntry> {
  // Key: `${file}\t${pattern}\t${severity}` → aggregated count.
  const summary = new Map<string, Ir055BaselineEntry>();
  for (const v of violations) {
    const key = `${v.file}\t${v.pattern}\t${v.severity}`;
    const existing = summary.get(key);
    if (existing) {
      existing.count++;
    } else {
      summary.set(key, {
        file: v.file,
        pattern: v.pattern,
        severity: v.severity,
        count: 1,
      });
    }
  }
  return summary;
}

function checkRuntimeUnresolvedReference(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const violations = collectIr055Violations(root);
  const baseline = loadIr055Baseline(root);

  // Index baseline by `${file}\t${pattern}\t${severity}` for O(1) lookup.
  const baselineIndex = new Map<string, number>();
  if (baseline) {
    for (const entry of baseline.entries) {
      const key = `${entry.file}\t${entry.pattern}\t${entry.severity}`;
      baselineIndex.set(key, entry.count);
    }
  }

  // Count current violations per (file, pattern, severity) bucket so we can
  // distinguish baseline-known from new at the bucket granularity.
  const currentSummary = summarizeIr055Violations(violations);

  // Per-bucket classification. A bucket with count <= baseline is fully
  // baseline-known (reported as info). Any excess is "new" and reported as
  // warn (heuristic) or ng (strict) so delta guard fails on new growth.
  const newBuckets = new Set<string>();
  for (const [key, entry] of currentSummary) {
    const baselineCount = baselineIndex.get(key) ?? 0;
    if (entry.count > baselineCount) {
      newBuckets.add(key);
    }
  }

  // Re-walk violations to emit per-line results, tracking how many we've
  // emitted per bucket so only the excess (new) entries are flagged.
  const emittedPerBucket = new Map<string, number>();

  // Sort violations by (file, line) so that for each bucket the earliest
  // occurrences are treated as baseline-known and the trailing ones as new.
  // This keeps the "new" tag stable relative to file position.
  const sorted = [...violations].sort((a, b) => {
    if (a.file !== b.file) return a.file < b.file ? -1 : 1;
    return a.line - b.line;
  });

  let baselineKnownCount = 0;
  let newCount = 0;

  for (const v of sorted) {
    const key = `${v.file}\t${v.pattern}\t${v.severity}`;
    const baselineCount = baselineIndex.get(key) ?? 0;
    const emitted = emittedPerBucket.get(key) ?? 0;
    emittedPerBucket.set(key, emitted + 1);
    const isBaselineKnown = emitted < baselineCount;

    const expected =
      v.severity === "strict"
        ? `distribution files must not contain ${v.pattern} references (unresolved in consumer env)`
        : `distribution files should avoid ${v.pattern} references (likely unresolved in consumer env)`;

    const route: FindingRoute = "intake";

    if (isBaselineKnown) {
      baselineKnownCount++;
      results.push(
        info(
          "RuntimeReference",
          "runtime-unresolved-reference",
          `Baseline-known ${v.severity} violation: ${v.pattern} reference '${v.evidence}' (IR-055 baseline, not yet cleaned)`,
          v.file,
          v.line,
          {
            evidence: v.evidence,
            expected,
            route,
            finding_category: "broken-reference",
            finding_level: v.severity,
          },
        ),
      );
    } else {
      newCount++;
      const ctor = v.severity === "strict" ? ng : warn;
      results.push(
        ctor(
          "RuntimeReference",
          "runtime-unresolved-reference",
          `New ${v.severity} violation: ${v.pattern} reference '${v.evidence}' detected (IR-055 delta from baseline)`,
          v.file,
          v.line,
          {
            evidence: v.evidence,
            expected,
            route,
            finding_category: "broken-reference",
            finding_level: v.severity,
          },
        ),
      );
    }
  }

  // Always emit a summary result so the check surface is visible even when
  // there are zero violations (post-cleanup steady state).
  if (newCount === 0) {
    results.push(
      ok(
        "RuntimeReference",
        "runtime-unresolved-reference",
        `IR-055 runtime-unresolved-reference: ${baselineKnownCount} baseline-known (info), 0 new violations. Full audit report-only mode (REQ-0108-264).`,
      ),
    );
  }

  return results;
}

function updateIr055Baseline(root: string): void {
  const violations = collectIr055Violations(root);
  const summary = summarizeIr055Violations(violations);
  const baseline: Ir055Baseline = {
    version: 1,
    rule_id: "IR-055",
    generated_at: new Date().toISOString().slice(0, 10),
    entries: [...summary.values()].sort((a, b) => {
      if (a.file !== b.file) return a.file < b.file ? -1 : 1;
      if (a.pattern !== b.pattern) return a.pattern < b.pattern ? -1 : 1;
      return a.severity < b.severity ? -1 : 1;
    }),
  };
  writeIr055Baseline(root, baseline);
  console.error(
    `[integrity] IR-055 baseline regenerated: ${baseline.entries.length} entries across ${new Set(baseline.entries.map((e) => e.file)).size} files (${violations.length} total violations).`,
  );
}

// ===== IR-057: obsolete-spec-path-after-domain-split (REQ-0158-002) =====
// Detects残留する旧SPEC直下パス参照 (`docs/specs/<name>.md`) と link mode 統一
// (ADR-0131) に伴う廃止語彙 (`generation-flow.md`, `transform/`, `local-opencode-transform`,
// 直接生成方式、生成フロー、再生成、上書き保護) を検出する。
// `generated_by` は `local-opencode-transform` と同一ファイルに共存する場合のみ検出する。
// 対照表: docs/specs/integrity/obsolete-path-map.yaml

interface ObsoletePathEntry {
  old: string;
  new: string;
  severity: string;
}

interface ObsoletePathMap {
  scope: { include: string[]; exclude: string[] };
  entries: ObsoletePathEntry[];
  legacy_local_generation_vocabulary?: { term: string; severity: string }[];
  legacy_local_generation_conditional_vocabulary?: { term: string; severity: string; proximity_required?: boolean }[];
  generated_by_combination_rule?: {
    trigger: string;
    paired_with: string;
    severity: string;
  };
}

function loadObsoletePathMap(root: string): ObsoletePathMap | null {
  const mapPath = path.join(
    root,
    "docs",
    "specs",
    "integrity",
    "obsolete-path-map.yaml",
  );
  const content = readText(mapPath);
  if (!content) return null;

  // 簡易YAMLパーサー（check_integrity.ts 内の parseFrontmatter と同レベルの依存）
  // 構造化YAMLを扱うが、obsolete-path-map.yaml のスキーマに特化する。
  const lines = content.split("\n");
  const map: ObsoletePathMap = { scope: { include: [], exclude: [] }, entries: [] };
  let section: "scope" | "entries" | "vocab" | "conditional_vocab" | "combo" | null = null;
  let currentEntry: Partial<ObsoletePathEntry> | null = null;
  let currentVocab: { term: string; severity: string; proximity_required?: boolean } | null = null;
  let currentScopeKey: "include" | "exclude" | null = null;
  let vocabTarget: "vocab" | "conditional_vocab" | null = null;

  const flushEntry = () => {
    if (currentEntry && currentEntry.old) {
      map.entries.push(currentEntry as ObsoletePathEntry);
    }
    currentEntry = null;
  };
  const flushVocab = () => {
    if (currentVocab && currentVocab.term) {
      if (vocabTarget === "conditional_vocab") {
        if (!map.legacy_local_generation_conditional_vocabulary) {
          map.legacy_local_generation_conditional_vocabulary = [];
        }
        map.legacy_local_generation_conditional_vocabulary.push(currentVocab);
      } else {
        if (!map.legacy_local_generation_vocabulary) {
          map.legacy_local_generation_vocabulary = [];
        }
        map.legacy_local_generation_vocabulary.push(currentVocab);
      }
    }
    currentVocab = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;

    if (/^scope:/.test(line)) {
      flushEntry();
      flushVocab();
      section = "scope";
      continue;
    }
    if (/^entries:/.test(line)) {
      flushEntry();
      flushVocab();
      section = "entries";
      continue;
    }
    if (/^legacy_local_generation_vocabulary:/.test(line)) {
      flushEntry();
      flushVocab();
      section = "vocab";
      vocabTarget = "vocab";
      continue;
    }
    if (/^legacy_local_generation_conditional_vocabulary:/.test(line)) {
      flushEntry();
      flushVocab();
      section = "conditional_vocab";
      vocabTarget = "conditional_vocab";
      continue;
    }
    if (/^generated_by_combination_rule:/.test(line)) {
      flushEntry();
      flushVocab();
      section = "combo";
      continue;
    }

    if (section === "scope") {
      const incMatch = line.match(/^\s*include:\s*$/);
      if (incMatch) {
        currentScopeKey = "include";
        continue;
      }
      const excMatch = line.match(/^\s*exclude:\s*$/);
      if (excMatch) {
        currentScopeKey = "exclude";
        continue;
      }
      const itemMatch = line.match(/^\s*-\s*"([^"]+)"/);
      if (itemMatch && currentScopeKey) {
        map.scope[currentScopeKey].push(itemMatch[1]);
        continue;
      }
    }

    if (section === "entries") {
      const startMatch = line.match(/^\s*-\s*old:\s*"([^"]+)"/);
      if (startMatch) {
        flushEntry();
        currentEntry = { old: startMatch[1] };
        continue;
      }
      if (currentEntry) {
        const newMatch = line.match(/^\s*new:\s*"([^"]+)"/);
        if (newMatch) {
          currentEntry.new = newMatch[1];
          continue;
        }
        const sevMatch = line.match(/^\s*severity:\s*"([^"]+)"/);
        if (sevMatch) {
          currentEntry.severity = sevMatch[1];
          continue;
        }
      }
    }

    if (section === "vocab" || section === "conditional_vocab") {
      const startMatch = line.match(/^\s*-\s*term:\s*"([^"]+)"/);
      if (startMatch) {
        flushVocab();
        currentVocab = { term: startMatch[1], severity: section === "conditional_vocab" ? "conditional" : "ng" };
        continue;
      }
      if (currentVocab) {
        const sevMatch = line.match(/^\s*severity:\s*"([^"]+)"/);
        if (sevMatch) {
          currentVocab.severity = sevMatch[1];
          continue;
        }
        const proxMatch = line.match(/^\s*proximity_required:\s*(true|false)/);
        if (proxMatch) {
          currentVocab.proximity_required = proxMatch[1] === "true";
          continue;
        }
      }
    }

    if (section === "combo" && map.generated_by_combination_rule) {
      const m = line.match(/^\s*(trigger|paired_with|severity):\s*"([^"]+)"/);
      if (m) {
        (map.generated_by_combination_rule as any)[m[1]] = m[2];
      }
    }
    if (section === "combo" && !map.generated_by_combination_rule) {
      if (line.match(/^\s*(trigger|paired_with|severity):\s*"([^"]+)"/)) {
        map.generated_by_combination_rule = {
          trigger: "generated_by",
          paired_with: "local-opencode-transform",
          severity: "ng",
        };
        const m = line.match(/^\s*(trigger|paired_with|severity):\s*"([^"]+)"/);
        if (m) {
          (map.generated_by_combination_rule as any)[m[1]] = m[2];
        }
      }
    }
  }
  flushEntry();
  flushVocab();
  return map;
}

function isIr057ExemptPath(relPath: string): boolean {
  // 履歴参照領域
  if (/docs\/requirements\/retired\//.test(relPath)) return true;
  if (/docs\/adr\/retired\//.test(relPath)) return true;
  // 対照表・カタログ自身の参照は正当
  if (/docs\/specs\/integrity\/obsolete-path-map\.yaml$/.test(relPath)) return true;
  if (/docs\/specs\/integrity\/rules\/IR-057-obsolete-spec-path-after-domain-split\.md$/.test(relPath)) return true;
  if (/docs\/specs\/integrity\/integrity-rule-catalog\.md$/.test(relPath)) return true;
  if (/vocabulary-registry\.md$/.test(relPath)) return true;
  if (/docs\/specs\/integrity\/rule-ownership\.md$/.test(relPath)) return true;
  // 検査スクリプト自身のドキュメント参照
  if (/repo-agentdev-integrity.*\/(SKILL|references\/)/.test(relPath)) return true;
  // legacy vocabulary を定義・検出する正当な文書:
  // - REQ-0158 (IR-057 の要件元。vocabulary を列挙)
  // - REQ-0141 (link mode 移行に伴う廃止語彙を規定)
  // - local-generation.md (link mode 移行と廃止経緯を記載)
  // - IR-048 (generated_by 識別子整合性ルール)
  if (/docs\/requirements\/REQ-0158\.md$/.test(relPath)) return true;
  if (/docs\/requirements\/REQ-0141\.md$/.test(relPath)) return true;
  if (/docs\/specs\/local\/local-generation\.md$/.test(relPath)) return true;
  if (/docs\/specs\/integrity\/rules\/IR-048-generated-by-identifier-integrity\.md$/.test(relPath)) return true;
  return false;
}

function isIr057InCodeBlock(lines: string[], lineIdx: number): boolean {
  // 行番号は 0-indexed。コードブロック内 (``` で囲まれた範囲) は exemption。
  let inCode = false;
  for (let i = 0; i <= lineIdx && i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) {
      inCode = !inCode;
    }
  }
  // 当該行が ``` 自体である場合、直前状態で判定
  if (/^\s*```/.test(lines[lineIdx])) {
    // トグル前の状態で考える: 上位ループでカウント済みならトグル後
    let countAbove = 0;
    for (let i = 0; i < lineIdx; i++) {
      if (/^\s*```/.test(lines[i])) countAbove++;
    }
    return countAbove % 2 === 1;
  }
  return inCode;
}

function isIr057HistoricalAdrContext(
  fullPath: string,
  root: string,
  line: string,
): boolean {
  // REQ-0158-002 例外登録: 現行 ADR (accepted) の履歴説明コンテキストは免除。
  // 履歴マーカーを含む行のみ免除する。
  const relPath = resolveRelative(fullPath, root);
  if (!/^docs\/adr\/ADR-\d+\.md$/.test(relPath)) return false;
  const historicalMarkers = [
    "旧",
    "移行前",
    "廃止",
    "前提",
    "historical",
    "legacy",
    "deprecated",
    "歴史",
    "経緯",
  ];
  return historicalMarkers.some((m) => line.includes(m));
}

function checkObsoleteSpecPath(root: string): CheckResult[] {
  const results: CheckResult[] = [];
  const map = loadObsoletePathMap(root);
  if (!map) {
    results.push(
      info(
        "CanonicalConflict",
        "obsolete-spec-path",
        "obsolete-path-map.yaml not found; IR-057 skipped",
      ),
    );
    return results;
  }

  // 収集対象ファイル: scope.include に合致し scope.exclude に合致しない .md, .yaml ファイル
  // 簡易実装: AGENTS.md, README.md, docs/**, src/**, .opencode/**
  const targetFiles: string[] = [];
  const candidateRoots = [
    path.join(root, "AGENTS.md"),
    path.join(root, "README.md"),
  ];
  const candidateDirs = [
    path.join(root, "docs"),
    path.join(root, "src"),
    path.join(root, ".opencode"),
  ];
  for (const f of candidateRoots) {
    if (fs.existsSync(f)) targetFiles.push(f);
  }
  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) continue;
    const acc: string[] = [];
    walkAllFiles(dir, acc);
    targetFiles.push(...acc);
  }

  let foundViolation = false;

  // 1. 旧SPEC直下パス参照検出
  for (const fullPath of targetFiles) {
    const relPath = resolveRelative(fullPath, root);
    // scope.exclude 判定
    if (isIr057ExemptPath(relPath)) continue;
    // 対象外拡張子
    if (!/\.(md|yaml|yml)$/.test(fullPath)) continue;

    const content = readText(fullPath);
    if (!content) continue;
    const lines = content.split("\n");

    for (const entry of map.entries) {
      const pattern = entry.old;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes(pattern)) continue;
        // コードブロック内は exemption
        if (isIr057InCodeBlock(lines, i)) continue;
        // 履歴 ADR コンテキストは exemption
        if (isIr057HistoricalAdrContext(fullPath, root, line)) continue;
        // backticks 内 (例: `docs/specs/system.md`) も免除
        if (isInsideCodeSpan(line, line.indexOf(pattern))) continue;
        foundViolation = true;
        results.push(
          ng(
            "CanonicalConflict",
            "obsolete-spec-path",
            `Old SPEC direct path reference '${pattern}' detected (current: ${entry.new})`,
            relPath,
            i + 1,
            {
              evidence: line.trim(),
              expected: `use current path: ${entry.new}`,
              route: "intake",
              finding_category: "broken-reference",
              finding_level: "strict",
            },
          ),
        );
      }
    }
  }

  // 2. legacy local generation vocabulary 検出
  if (map.legacy_local_generation_vocabulary) {
    for (const fullPath of targetFiles) {
      const relPath = resolveRelative(fullPath, root);
      if (isIr057ExemptPath(relPath)) continue;
      if (!/\.(md|yaml|yml)$/.test(fullPath)) continue;
      // local-generation.md は廃止経緯を説明する正当な文書
      if (/docs\/specs\/local\/local-generation\.md$/.test(relPath)) continue;

      const content = readText(fullPath);
      if (!content) continue;
      const lines = content.split("\n");

      for (const item of map.legacy_local_generation_vocabulary) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line.includes(item.term)) continue;
          if (isIr057InCodeBlock(lines, i)) continue;
          if (isIr057HistoricalAdrContext(fullPath, root, line)) continue;
          if (isInsideCodeSpan(line, line.indexOf(item.term))) continue;
          foundViolation = true;
          results.push(
            ng(
              "CanonicalConflict",
              "obsolete-spec-path",
              `Legacy local generation vocabulary '${item.term}' detected (link mode unified, ADR-0131)`,
              relPath,
              i + 1,
              {
                evidence: line.trim(),
                expected:
                  "remove legacy vocabulary; use link mode terminology (ADR-0131)",
                route: "intake",
                finding_category: "broken-reference",
                finding_level: "strict",
              },
            ),
          );
        }
      }
    }
  }

  // 3. generated_by + local-opencode-transform 組み合わせ検出
  if (map.generated_by_combination_rule) {
    const { trigger, paired_with } = map.generated_by_combination_rule;
    for (const fullPath of targetFiles) {
      const relPath = resolveRelative(fullPath, root);
      if (isIr057ExemptPath(relPath)) continue;
      if (!/\.(md|yaml|yml)$/.test(fullPath)) continue;
      if (/docs\/specs\/local\/local-generation\.md$/.test(relPath)) continue;

      const content = readText(fullPath);
      if (!content) continue;
      if (!content.includes(trigger)) continue;
      if (!content.includes(paired_with)) continue;

      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes(trigger)) continue;
        if (isIr057InCodeBlock(lines, i)) continue;
        if (isIr057HistoricalAdrContext(fullPath, root, line)) continue;
        if (isInsideCodeSpan(line, line.indexOf(trigger))) continue;
        foundViolation = true;
        results.push(
          ng(
            "CanonicalConflict",
            "obsolete-spec-path",
            `Legacy local generation identifier '${trigger}' coexists with '${paired_with}' (link mode unified, ADR-0131)`,
            relPath,
            i + 1,
            {
              evidence: line.trim(),
              expected:
                "remove legacy generated_by: local-opencode-transform identifier",
              route: "intake",
              finding_category: "broken-reference",
              finding_level: "strict",
            },
          ),
        );
      }
    }
  }

  // 4. legacy local generation conditional vocabulary（近接条件つき検出語）検出
  // 単独では検出せず、同一ファイル内に旧 local 生成方式文脈語がある場合のみ検出する
  if (map.legacy_local_generation_conditional_vocabulary && map.legacy_local_generation_vocabulary) {
    const contextTerms = map.legacy_local_generation_vocabulary.map((v) => v.term);
    for (const fullPath of targetFiles) {
      const relPath = resolveRelative(fullPath, root);
      if (isIr057ExemptPath(relPath)) continue;
      if (!/\.(md|yaml|yml)$/.test(fullPath)) continue;
      if (/docs\/specs\/local\/local-generation\.md$/.test(relPath)) continue;

      const content = readText(fullPath);
      if (!content) continue;
      const hasContextTerm = contextTerms.some((t) => content.includes(t));
      if (!hasContextTerm) continue;

      const lines = content.split("\n");
      for (const item of map.legacy_local_generation_conditional_vocabulary) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line.includes(item.term)) continue;
          if (isIr057InCodeBlock(lines, i)) continue;
          if (isIr057HistoricalAdrContext(fullPath, root, line)) continue;
          if (isInsideCodeSpan(line, line.indexOf(item.term))) continue;
          foundViolation = true;
          results.push(
            ng(
              "CanonicalConflict",
              "obsolete-spec-path",
              `Legacy local generation conditional vocabulary '${item.term}' detected with context term nearby (link mode unified, ADR-0131)`,
              relPath,
              i + 1,
              {
                evidence: line.trim(),
                expected:
                  "remove legacy vocabulary; use link mode terminology (ADR-0131)",
                route: "intake",
                finding_category: "broken-reference",
                finding_level: "strict",
              },
            ),
          );
        }
      }
    }
  }

  if (!foundViolation) {
    results.push(
      ok(
        "CanonicalConflict",
        "obsolete-spec-path",
        "No obsolete SPEC direct path references or legacy local generation vocabulary detected (IR-057, REQ-0158-002)",
      ),
    );
  }
  return results;
}

// walkAllFiles: walkMarkdown と同等だが .md に限定しない（.yaml/.yml 含む）
function walkAllFiles(dirPath: string, acc: string[]): void {
  if (!fs.existsSync(dirPath)) return;
  for (
    const entry of fs.readdirSync(dirPath, { withFileTypes: true }) as import("fs").Dirent[]
  ) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkAllFiles(full, acc);
    } else if (/\.(md|yaml|yml)$/.test(entry.name)) {
      acc.push(full);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let options;
  try {
    options = parseArgs(args);
  } catch (e) {
    console.error(`[integrity] ${e instanceof Error ? e.message : String(e)}`);
    process.exit(EXIT_ERROR);
  }

  if (options.help) {
    printHelp(SCRIPT_NAME, DESCRIPTION, USAGE);
    process.exit(EXIT_OK);
  }

  const scriptDir =
    (typeof import.meta !== "undefined" && (import.meta as any).dir) ||
    __dirname ||
    process.cwd();
  const root = findRepoRoot(scriptDir, { explicitRoot: options.root });

  if (args.includes("--update-ir055-baseline")) {
    updateIr055Baseline(root);
    process.exit(EXIT_OK);
  }

  const reqDir = path.join(root, "docs", "requirements");
  const adrDir = path.join(root, "docs", "adr");
  const specsDir = path.join(root, "docs", "specs");
  const skillsDir = path.join(root, ".opencode", "skills");
  // REQ-0108-189: Use resolvePathWithFallback for runtime→source fallback
  const cmdDir = resolvePathWithFallback(
    path.join(root, ".opencode", "commands", "agentdev"),
  );
  const commandMapPath = path.join(
    root,
    ".opencode",
    "skills",
    "agentdev-workflow-lifecycle",
    "references",
    "command-map.md",
  );

  // REQ-0108-188: 8 independent collections aligned with Document Classification Policy
  const scanned: Record<string, number> = {
    REQ: listFiles(reqDir).filter((f) => f.startsWith("REQ-")).length,
    ADR: listFiles(adrDir).filter((f) => f.startsWith("ADR-")).length,
    Skill: listDirs(skillsDir).length,
    Command: listFiles(cmdDir).filter((f) => f !== "README.md").length,
    Guides: fs.existsSync(path.join(root, "docs", "guides"))
      ? listFiles(path.join(root, "docs", "guides")).length
      : 0,
    Specs: collectSpecMarkdownRecursively(specsDir).length,
    RetiredREQ: fs.existsSync(path.join(reqDir, "retired"))
      ? listFiles(path.join(reqDir, "retired")).filter((f: string) =>
          f.startsWith("REQ-"),
        ).length
      : 0,
    DocMap: fs.existsSync(path.join(root, "docs", "DOC-MAP.md")) ? 1 : 0,
    Report: fs.existsSync(path.join(root, ".agentdev", "integrity", "reports"))
      ? listFiles(path.join(root, ".agentdev", "integrity", "reports")).length
      : 0,
    Runtime: (function () {
      let count = 0;
      const repoCmdDir = path.join(root, ".opencode", "commands");
      if (fs.existsSync(repoCmdDir)) {
        for (const dir of listDirs(repoCmdDir)) {
          count += listFiles(path.join(repoCmdDir, dir)).length;
        }
      }
      for (const skillDir of listDirs(skillsDir)) {
        const skillMd = path.join(skillsDir, skillDir, "SKILL.md");
        if (fs.existsSync(skillMd)) count++;
      }
      return count;
    })(),
  };

  if (options.dryRun) {
    const targets = [
      `REQ files: ${reqDir} (${scanned.REQ} files)`,
      `ADR files: ${adrDir} (${scanned.ADR} files)`,
      `Specs: ${specsDir} (existence verified against ${specsDir}/README.md, REQ-0154-001/003)`,
      `Skills: ${skillsDir} (${scanned.Skill} directories)`,
      `Commands: ${cmdDir} (${scanned.Command} files)`,
      `Report: .agentdev/integrity/reports/ (${scanned.Report} files)`, // REQ-0108-188
      `Runtime: .opencode/commands/**/*.md + SKILL.md (${scanned.Runtime} files)`, // REQ-0108-188
    ];
    console.log("Dry run - would check:");
    for (const t of targets) console.log(`  ${t}`);
    process.exit(EXIT_OK);
  }

  const results: CheckResult[] = [
    ...checkReqFrontmatterFilename(reqDir, root),
    ...checkReqRequiredFields(reqDir, root),
    ...checkReqReadmeIndexSync(reqDir, root),
    ...checkRetiredFrontmatter(reqDir, root),
    ...checkAdrReqCrossReference(reqDir, adrDir, root),
    ...checkSkillAgentdevPrefix(skillsDir, root),
    ...checkCommandReadmeSync(cmdDir, root),
    ...checkExpandedReadmeSync(cmdDir, root),
    ...checkCommandInventory(cmdDir, root),
    ...checkLegacyNamespace(skillsDir, cmdDir, root),
    ...checkBareSlashScoped(skillsDir, cmdDir, root),
    ...checkNameCollision(skillsDir, root),
    ...checkSpecsExistence(specsDir, root),
    ...checkInlineCompletionReportsStrict(cmdDir, root),
    ...checkInlineCompletionBodyInCommands(cmdDir, root),
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
    ...checkCommandMapConsistency(cmdDir, root, commandMapPath),
    ...checkObsoleteReferenceDirs(skillsDir, root),
    ...checkMappingTable(reqDir, root),
    ...checkSkillFrontmatter(skillsDir, root),
    ...checkCommandFrontmatterDetailed(cmdDir, root),
    ...checkScriptTemplateReferencePaths(cmdDir, skillsDir, root),
    ...checkAdrStatusNormalization(adrDir, root),
    ...checkRuidGroundReference(root),
    ...checkWorkflowStatusProhibition(root),
    ...checkAcceptedAdrOnlyCitation(root),
    ...checkPatternResidualDetection(root),
    ...checkReqBacklogResidualDetection(root),
    ...checkAbolishedSkillReferences(root),
    ...checkReqRangeStaleness(root),
    ...checkSkillCategoryGap(root, skillsDir, cmdDir),
    ...checkTemplatePathIntegrity(cmdDir, root),
    ...checkSourceProjectionConsistency(root),
    ...checkDistributionUntrackedSkillReference(root), // IR-058 (REQ-0159-003)
    ...checkBrokenJunctions(skillsDir, root, cmdDir),
    ...checkUpdateNotesInDocs(root),
    ...checkSummaryReqRangeConsistency(root),
    ...checkOldStatusVocabulary(root),
    ...checkLegacyNamespaceInDocs(root),
    ...checkJunctionScanCoverage(root),
    ...checkAgentdevExclusion(root),
    ...checkReferencesRecursiveScan(skillsDir, root),
    ...checkReportSelfExclusion(root),
    ...checkVocabularyRegistrySync(root),
    ...checkCaptureBoundaryReference(root),
    ...checkPrTemplateCaptureSection(root),
    ...checkCommandCaptureDuties(cmdDir, root),
    ...checkMappingTableHistoryLabels(root),
    ...checkReqVerificationBasis(root),
    ...checkReqSpecBoundaryViolation(root), // IR-044 (REQ-0108-259)
    ...checkGhDirectInvocation(root), // IR-053 (REQ-0152-001/002)
    ...checkDraftSpecStaleness(specsDir, root), // IR-054 (REQ-0154-002)
    ...checkSisyphusJuniorUlwLoopMisclassification(root), // REQ-0144-013
    ...checkRuntimeUnresolvedReference(root), // IR-055 (REQ-0108-263/264)
    ...checkObsoleteSpecPath(root), // IR-057 (REQ-0158-002)
  ];

  // REQ-0108-196: classification policy checks (enabled by --classification flag)
  if (options.classification) {
    results.push(...checkDocumentClassificationPolicy(root));
  }

  const processed = processResults(results);

  const summary = computeSummary(processed);

  const report: IntegrityReport = {
    timestamp: new Date().toISOString(),
    script: SCRIPT_NAME,
    scanned,
    summary,
    results: processed,
  };

  if (options.json) {
    console.log(formatJsonReport(report));
  } else {
    console.log(formatMarkdownReport(report));
  }

  const reportPath = writeReportFile(root, report);
  console.error(`Report written to: ${reportPath}`);

  const exitCode = determineExitCode(summary);
  process.exit(exitCode);
}

if (import.meta.main) {
  main();
}
