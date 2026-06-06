const fs = require("fs");
const path = require("path");
import {
  EXIT_OK,
  EXIT_NG,
  EXIT_ERROR,
  type CheckResult,
  type IntegrityReport,
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
} from "./cli_utils.ts";

const SCRIPT_NAME = "check_templates";
const DESCRIPTION = "Workflow template validator for AgentDevFlow";
const USAGE = "bun run check_templates.ts [options] [paths...]";

const TEMPLATE_REL_DIR = path.join(
  ".opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);

const NAMING_PATTERNS: RegExp[] = [
  /^issue_desc_.+\.md$/,
  /^issue_comment_.+\.md$/,
  /^pr_desc.*\.md$/,
];

const FEATURE_SECTION_ORDER: string[] = [
  "概要",
  "課題",
  "提案内容",
  "完了条件",
  "テスト戦略",
];

const PLACEHOLDER_PATTERNS: RegExp[] = [
  /\$\{[^}]*\}/,
  /\{%[^%]*%\}/,
  /__PLACEHOLDER__/,
];

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  if (options.help) {
    printHelp(SCRIPT_NAME, DESCRIPTION, USAGE);
    process.exit(EXIT_OK);
  }
  const repoRoot = findRepoRoot(import.meta.dir);
  const templatesDir = path.join(repoRoot, TEMPLATE_REL_DIR);
  if (!fs.existsSync(templatesDir)) {
    console.error(`Templates directory not found: ${templatesDir}`);
    process.exit(EXIT_ERROR);
  }
  const results: CheckResult[] = [];
  const templateFiles = scanTemplateFiles(templatesDir, results);
  const scanned: Record<string, number> = { templates: templateFiles.length };
  if (options.dryRun) {
    const report = buildReport(scanned, results);
    outputReport(report, options.json);
    process.exit(EXIT_OK);
  }
  for (const filePath of templateFiles) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    checkNamingConvention(fileName, results);
    checkFrontmatter(fileName, content, results);
    checkSectionMarkers(fileName, lines, results);
    checkPlaceholders(fileName, lines, results);
    checkTableStructure(fileName, lines, results);
    checkBarePathReferences(fileName, content, results);
    if (fileName.includes("feature")) {
      checkSectionOrder(fileName, lines, results);
    }
  }
  checkSkillTemplateReferences(templatesDir, repoRoot, results);
  const report = buildReport(scanned, results);
  outputReport(report, options.json);
  process.exit(determineExitCode(report.summary));
}

function buildReport(
  scanned: Record<string, number>,
  results: CheckResult[],
): IntegrityReport {
  return {
    timestamp: new Date().toISOString(),
    script: SCRIPT_NAME,
    scanned,
    summary: computeSummary(results),
    results,
  };
}

function outputReport(report: IntegrityReport, jsonMode: boolean): void {
  if (jsonMode) {
    console.log(formatJsonReport(report));
  } else {
    console.log(formatMarkdownReport(report));
  }
}

function scanTemplateFiles(
  templatesDir: string,
  results: CheckResult[],
): string[] {
  const entries: string[] = fs.readdirSync(templatesDir);
  const mdFiles: string[] = [];
  for (const name of entries) {
    if (name.endsWith(".md")) {
      mdFiles.push(path.join(templatesDir, name));
    }
  }
  if (mdFiles.length === 0) {
    results.push(
      ng(
        "TemplateFiles",
        "Template inventory",
        "No template files found in templates directory",
      ),
    );
  } else {
    results.push(
      ok(
        "TemplateFiles",
        "Template inventory",
        `${mdFiles.length} template files found`,
      ),
    );
  }
  return mdFiles.sort();
}

function checkNamingConvention(fileName: string, results: CheckResult[]): void {
  const matches = NAMING_PATTERNS.some((p) => p.test(fileName));
  if (matches) {
    results.push(
      ok(
        "TemplateFiles",
        "Naming convention",
        "Filename follows naming convention",
        fileName,
      ),
    );
  } else {
    results.push(
      warn(
        "TemplateFiles",
        "Naming convention",
        "Filename does not match known naming pattern",
        fileName,
      ),
    );
  }
}

function checkFrontmatter(
  fileName: string,
  content: string,
  results: CheckResult[],
): void {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!match) {
    results.push(
      ng(
        "Frontmatter",
        "Required frontmatter fields",
        "Missing frontmatter (no --- delimiters found)",
        fileName,
      ),
    );
    return;
  }
  const body = match[1];
  const keys = new Set<string>();
  for (const line of body.split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+)\s*:/);
    if (kv) {
      keys.add(kv[1]);
    }
  }
  const missing: string[] = [];
  if (!keys.has("name")) missing.push("name");
  if (!keys.has("about")) missing.push("about");
  if (missing.length > 0) {
    results.push(
      ng(
        "Frontmatter",
        "Required frontmatter fields",
        `Missing required fields: ${missing.join(", ")}`,
        fileName,
      ),
    );
  } else {
    results.push(
      ok(
        "Frontmatter",
        "Required frontmatter fields",
        "Frontmatter contains required 'name' and 'about' fields",
        fileName,
      ),
    );
  }
}

function checkSectionMarkers(
  fileName: string,
  lines: string[],
  results: CheckResult[],
): void {
  const markerRe = /<!--\s*【必須】\s*-->/;
  const headingRe = /^#{1,6}\s/;
  let markerCount = 0;
  let issueCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!markerRe.test(lines[i])) continue;
    markerCount++;
    const lineIsHeading = headingRe.test(lines[i]);
    const prevIsHeading = i > 0 && headingRe.test(lines[i - 1]);
    if (!lineIsHeading && !prevIsHeading) {
      results.push(
        ng(
          "Structure",
          "Required section markers",
          `Required marker not preceded by heading on line ${i + 1}`,
          fileName,
          i + 1,
        ),
      );
      issueCount++;
    }
  }
  if (markerCount > 0 && issueCount === 0) {
    results.push(
      ok(
        "Structure",
        "Required section markers",
        `All ${markerCount} required markers are preceded by headings`,
        fileName,
      ),
    );
  }
}

function checkPlaceholders(
  fileName: string,
  lines: string[],
  results: CheckResult[],
): void {
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    for (const pat of PLACEHOLDER_PATTERNS) {
      if (pat.test(lines[i])) {
        results.push(
          ng(
            "Structure",
            "Unresolved placeholders",
            `Unresolved placeholder found: ${lines[i].trim()}`,
            fileName,
            i + 1,
          ),
        );
        found = true;
      }
    }
  }
  if (!found) {
    results.push(
      ok(
        "Structure",
        "Unresolved placeholders",
        "No unresolved placeholders found",
        fileName,
      ),
    );
  }
}

function checkTableStructure(
  fileName: string,
  lines: string[],
  results: CheckResult[],
): void {
  const blocks = extractTableBlocks(lines);
  if (blocks.length === 0) {
    results.push(
      ok(
        "Structure",
        "Table structure",
        "No tables found in template",
        fileName,
      ),
    );
    return;
  }
  let hasIssue = false;
  for (const block of blocks) {
    if (block.rows.length < 2) continue;
    const headerCols = countColumns(block.rows[0]);
    const sepCols = countColumns(block.rows[1]);
    if (headerCols !== sepCols) {
      results.push(
        ng(
          "Structure",
          "Table structure",
          `Table column mismatch: header has ${headerCols} columns, separator has ${sepCols} columns (near line ${block.startLine})`,
          fileName,
          block.startLine,
        ),
      );
      hasIssue = true;
    }
    for (let r = 2; r < block.rows.length; r++) {
      const rowCols = countColumns(block.rows[r]);
      if (rowCols !== headerCols) {
        const lineNum = block.startLine + r;
        results.push(
          ng(
            "Structure",
            "Table structure",
            `Table row column mismatch: expected ${headerCols} columns, got ${rowCols} (line ${lineNum})`,
            fileName,
            lineNum,
          ),
        );
        hasIssue = true;
      }
    }
  }
  if (!hasIssue) {
    results.push(
      ok(
        "Structure",
        "Table structure",
        `All ${blocks.length} table(s) have consistent column counts`,
        fileName,
      ),
    );
  }
}

function extractTableBlocks(
  lines: string[],
): { rows: string[]; startLine: number }[] {
  const blocks: { rows: string[]; startLine: number }[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim().startsWith("|")) {
      const startLine = i + 1;
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i]);
        i++;
      }
      if (rows.length >= 2) {
        blocks.push({ rows, startLine });
      }
    } else {
      i++;
    }
  }
  return blocks;
}

function countColumns(row: string): number {
  const trimmed = row.trim();
  if (!trimmed.startsWith("|")) return 0;
  const parts = trimmed.split("|");
  if (trimmed.endsWith("|")) {
    return parts.length - 2;
  }
  return parts.length - 1;
}

function checkSkillTemplateReferences(
  templatesDir: string,
  repoRoot: string,
  results: CheckResult[],
): void {
  const skillMdPath = path.join(
    repoRoot,
    ".opencode",
    "skills",
    "agentdev-workflow-templates",
    "SKILL.md",
  );
  if (!fs.existsSync(skillMdPath)) {
    results.push(
      warn(
        "SkillRef",
        "SKILL.md template references",
        "agentdev-workflow-templates/SKILL.md not found",
      ),
    );
    return;
  }
  const skillContent = fs.readFileSync(skillMdPath, "utf-8");
  const templateNamePattern =
    /`(issue_desc_[a-z0-9_]+\.md|issue_comment_[a-z0-9_]+\.md|pr_desc[a-z0-9_]*\.md)`/g;
  const mentionedTemplates = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = templateNamePattern.exec(skillContent)) !== null) {
    mentionedTemplates.add(match[1]);
  }
  const actualFiles = new Set(
    fs.readdirSync(templatesDir).filter((f: string) => f.endsWith(".md")),
  );
  const inSkillButMissing = [...mentionedTemplates].filter(
    (t) => !actualFiles.has(t),
  );
  const onDiskButNotInSkill = [...actualFiles].filter(
    (t) => !mentionedTemplates.has(t),
  );
  if (inSkillButMissing.length > 0) {
    for (const t of inSkillButMissing) {
      results.push(
        ng(
          "SkillRef",
          "SKILL.md template references",
          `${t} mentioned in SKILL.md but missing from templates/ directory`,
          t,
        ),
      );
    }
  }
  if (onDiskButNotInSkill.length > 0) {
    for (const t of onDiskButNotInSkill) {
      results.push(
        warn(
          "SkillRef",
          "SKILL.md template references",
          `${t} exists in templates/ but not mentioned in SKILL.md`,
          t,
        ),
      );
    }
  }
  if (inSkillButMissing.length === 0 && onDiskButNotInSkill.length === 0) {
    results.push(
      ok(
        "SkillRef",
        "SKILL.md template references",
        `All ${mentionedTemplates.size} templates in SKILL.md match filesystem`,
      ),
    );
  }
}

function checkSectionOrder(
  fileName: string,
  lines: string[],
  results: CheckResult[],
): void {
  const headingRe = /^##\s+(.+)/;
  const found: { name: string; line: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(headingRe);
    if (!match) continue;
    let sectionName = match[1].trim();
    const commentIdx = sectionName.indexOf("<!--");
    if (commentIdx !== -1) {
      sectionName = sectionName.substring(0, commentIdx).trim();
    }
    if (FEATURE_SECTION_ORDER.includes(sectionName)) {
      found.push({ name: sectionName, line: i + 1 });
    }
  }
  if (found.length === 0) {
    results.push(
      warn(
        "Completeness",
        "Section order",
        "No expected feature sections found in template",
        fileName,
      ),
    );
    return;
  }
  let outOfOrder = false;
  for (let i = 1; i < found.length; i++) {
    const prevIdx = FEATURE_SECTION_ORDER.indexOf(found[i - 1].name);
    const currIdx = FEATURE_SECTION_ORDER.indexOf(found[i].name);
    if (currIdx <= prevIdx) {
      results.push(
        warn(
          "Completeness",
          "Section order",
          `Section "${found[i].name}" (line ${found[i].line}) appears after "${found[i - 1].name}" but expected order is: ${FEATURE_SECTION_ORDER.join(" → ")}`,
          fileName,
          found[i].line,
        ),
      );
      outOfOrder = true;
    }
  }
  if (!outOfOrder) {
    results.push(
      ok(
        "Completeness",
        "Section order",
        `Sections appear in expected order: ${found.map((s) => s.name).join(" → ")}`,
        fileName,
      ),
    );
  }
}

function checkBarePathReferences(
  fileName: string,
  content: string,
  results: CheckResult[],
): void {
  const lines = content.split("\n");
  const barePathPattern =
    /\(docs\/requirements\/[^)]+\)|\(docs\/adr\/[^)]+\)|\(\.opencode\/[^)]+\)|\(\.\.\/docs\/[^)]+\)/;
  let inCodeBlock = false;
  let foundIssue = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    if (barePathPattern.test(line)) {
      results.push(
        warn(
          "LinkNormalization",
          "Bare path references",
          `Non-normalized repository path found: ${line.trim()}`,
          fileName,
          i + 1,
        ),
      );
      foundIssue = true;
    }
  }
  if (!foundIssue) {
    results.push(
      ok(
        "LinkNormalization",
        "Bare path references",
        "No bare path references found",
        fileName,
      ),
    );
  }
}

main();
