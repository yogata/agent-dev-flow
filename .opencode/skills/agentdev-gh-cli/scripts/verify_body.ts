import {
  EXIT_OK,
  EXIT_NG,
  EXIT_ERROR,
  type CheckResult,
  type IntegrityReport,
  ok,
  ng,
  info,
  computeSummary,
  formatJsonReport,
  formatMarkdownReport,
  determineExitCode,
  findRepoRoot,
} from "../../agentdev-integrity/scripts/cli_utils";

const SCRIPT_NAME = "verify_body.ts";
const DESCRIPTION = "GitHub Issue/PR body verifier - validates encoding, markdown structure, and required sections";
const USAGE = "bun run verify_body.ts --expected <file> --actual <file> [--json] [--dry-run]";

interface BodyCliOptions {
  help: boolean;
  json: boolean;
  dryRun: boolean;
  expected: string;
  actual: string;
}

function parseBodyArgs(args: string[]): BodyCliOptions {
  const opts: BodyCliOptions = { help: false, json: false, dryRun: false, expected: "", actual: "" };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--json") {
      opts.json = true;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--expected" && i + 1 < args.length) {
      opts.expected = args[++i];
    } else if (arg === "--actual" && i + 1 < args.length) {
      opts.actual = args[++i];
    }
  }
  return opts;
}

function printBodyHelp(): void {
  const lines = [
    `${SCRIPT_NAME} — ${DESCRIPTION}`,
    "",
    "USAGE:",
    `  ${USAGE}`,
    "",
    "OPTIONS:",
    "  --expected <file>  Path to the source text (what was intended to be written)",
    "  --actual <file>    Path to the read-back text (what GitHub returned)",
    "  --help             Show this help message",
    "  --json             Output results in JSON format",
    "  --dry-run          Show what would be checked without running checks",
    "",
    "EXIT CODES:",
    "  0  No issues found",
    "  1  Issues detected (NG or warning)",
    "  2  Input error or execution failure",
  ];
  console.log(lines.join("\n"));
}

function checkBOMFromBytes(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 3) return false;
  const bytes = new Uint8Array(buffer);
  return bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
}

function checkEncoding(actual: string, hasBOM: boolean, results: CheckResult[]): void {
  if (actual.includes("\r\n")) {
    const crlfCount = (actual.match(/\r\n/g) || []).length;
    results.push(ng("Encoding", "UTF-8 / LF", `Actual text contains ${crlfCount} CRLF line ending(s)`));
  } else {
    results.push(ok("Encoding", "UTF-8 / LF", "No CRLF line endings detected"));
  }

  if (hasBOM) {
    results.push(ng("Encoding", "UTF-8 / LF", "Actual file starts with UTF-8 BOM (EF BB BF)"));
  } else {
    results.push(ok("Encoding", "UTF-8 / LF", "No BOM marker detected"));
  }

  const controlPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/;
  const controlMatch = actual.match(controlPattern);
  if (controlMatch) {
    const charCode = controlMatch[0].charCodeAt(0);
    const hex = `U+${charCode.toString(16).toUpperCase().padStart(4, "0")}`;
    results.push(ng("Encoding", "Control characters", `Disallowed control character found: ${hex}`));
  } else {
    results.push(ok("Encoding", "Control characters", "No disallowed control characters found"));
  }
}

function checkJapanesePreservation(expected: string, actual: string, results: CheckResult[]): void {
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g;
  const expectedJapanese = expected.match(japaneseRegex) || [];
  const actualJapanese = actual.match(japaneseRegex) || [];

  if (expectedJapanese.length === 0) {
    results.push(ok("Encoding", "Japanese text preservation", "No Japanese text in expected input, nothing to verify"));
    return;
  }

  const expectedStr = expectedJapanese.join("");
  const actualStr = actualJapanese.join("");

  if (expectedStr === actualStr) {
    results.push(ok("Encoding", "Japanese text preservation", `All ${expectedJapanese.length} Japanese characters preserved`));
  } else {
    const mismatchCount = findMismatchCount(expectedJapanese, actualJapanese);
    results.push(ng("Encoding", "Japanese text preservation", `${mismatchCount} Japanese character(s) differ between expected and actual`));
  }
}

function findMismatchCount(expected: string[], actual: string[]): number {
  let mismatches = 0;
  const maxLen = Math.max(expected.length, actual.length);
  for (let i = 0; i < maxLen; i++) {
    if (expected[i] !== actual[i]) {
      mismatches++;
    }
  }
  return mismatches;
}

function checkTableConsistency(text: string, results: CheckResult[], label: string): void {
  const lines = text.split("\n");
  const tables: string[][] = [];
  let currentTable: string[] = [];

  for (const line of lines) {
    if (line.trimStart().startsWith("|")) {
      currentTable.push(line);
    } else {
      if (currentTable.length > 0) {
        tables.push(currentTable);
        currentTable = [];
      }
    }
  }
  if (currentTable.length > 0) {
    tables.push(currentTable);
  }

  if (tables.length === 0) {
    results.push(ok("Markdown", "Table column consistency", `No markdown tables found in ${label} text`));
    return;
  }

  let hasIssue = false;
  for (const table of tables) {
    const columnCounts = table.map((row) => {
      const trimmed = row.trim();
      const parts = trimmed.split("|");
      return parts.length - (trimmed.startsWith("|") ? 1 : 0) - (trimmed.endsWith("|") ? 1 : 0);
    });

    const firstCount = columnCounts[0];
    for (let i = 1; i < columnCounts.length; i++) {
      if (columnCounts[i] !== firstCount) {
        hasIssue = true;
        results.push(ng("Markdown", "Table column consistency", `Table row ${i + 1} has ${columnCounts[i]} columns, expected ${firstCount} in ${label} text`));
      }
    }
  }

  if (!hasIssue) {
    results.push(ok("Markdown", "Table column consistency", `All ${tables.length} table(s) in ${label} text have consistent columns`));
  }
}

function checkCheckboxSyntax(expected: string, actual: string, results: CheckResult[]): void {
  const checkboxPattern = /- \[[ x]\]/g;
  const expectedCheckboxes = expected.match(checkboxPattern) || [];
  const actualCheckboxes = actual.match(checkboxPattern) || [];

  if (expectedCheckboxes.length === 0) {
    results.push(ok("Markdown", "Checkbox syntax", "No checkboxes in expected text, nothing to verify"));
    return;
  }

  if (expectedCheckboxes.length !== actualCheckboxes.length) {
    results.push(ng("Markdown", "Checkbox syntax", `Checkbox count mismatch: expected ${expectedCheckboxes.length}, actual ${actualCheckboxes.length}`));
    return;
  }

  const diffs: string[] = [];
  for (let i = 0; i < expectedCheckboxes.length; i++) {
    if (expectedCheckboxes[i] !== actualCheckboxes[i]) {
      diffs.push(`#${i + 1}: expected '${expectedCheckboxes[i]}', actual '${actualCheckboxes[i]}'`);
    }
  }

  if (diffs.length === 0) {
    results.push(ok("Markdown", "Checkbox syntax", `All ${expectedCheckboxes.length} checkbox(es) preserved in order`));
  } else {
    results.push(ng("Markdown", "Checkbox syntax", `${diffs.length} checkbox(es) differ: ${diffs.join("; ")}`));
  }
}

function checkCodeBlockPairing(text: string, results: CheckResult[], label: string): void {
  const backtickCount = (text.match(/```/g) || []).length;

  if (backtickCount === 0) {
    results.push(ok("Markdown", "Code block pairing", `No code blocks in ${label} text`));
    return;
  }

  if (backtickCount % 2 === 0) {
    results.push(ok("Markdown", "Code block pairing", `${backtickCount / 2} code block pair(s) in ${label} text (count: ${backtickCount})`));
  } else {
    results.push(ng("Markdown", "Code block pairing", `Unpaired code block in ${label} text (triple-backtick count: ${backtickCount})`));
  }
}

function checkListIndentation(expected: string, actual: string, results: CheckResult[]): void {
  const listPattern = /^( +)([-*]) /gm;
  const expectedMatches = [...expected.matchAll(listPattern)];
  const actualMatches = [...actual.matchAll(listPattern)];

  if (expectedMatches.length === 0) {
    results.push(ok("Markdown", "List indentation", "No list items in expected text, nothing to verify"));
    return;
  }

  const expectedIndents = expectedMatches.map((m) => m[1].length);
  const actualIndents = actualMatches.map((m) => m[1].length);

  const indentDiffs: number[] = [];
  const maxCompare = Math.min(expectedIndents.length, actualIndents.length);
  for (let i = 0; i < maxCompare; i++) {
    if (expectedIndents[i] !== actualIndents[i]) {
      indentDiffs.push(i);
    }
  }

  if (expectedIndents.length !== actualIndents.length) {
    results.push(ng("Markdown", "List indentation", `List item count mismatch: expected ${expectedIndents.length}, actual ${actualIndents.length}`));
  } else if (indentDiffs.length > 0) {
    results.push(ng("Markdown", "List indentation", `${indentDiffs.length} list item(s) have different indentation levels`));
  } else {
    results.push(ok("Markdown", "List indentation", `All ${expectedIndents.length} list item indentation(s) preserved`));
  }
}

function checkRequiredSections(expected: string, actual: string, results: CheckResult[]): void {
  const expectedLines = expected.split("\n");
  const requiredHeadings: string[] = [];

  for (let i = 0; i < expectedLines.length; i++) {
    const line = expectedLines[i];
    if (/^## /.test(line)) {
      for (let j = i + 1; j < expectedLines.length; j++) {
        if (expectedLines[j].trim() === "") continue;
        if (expectedLines[j].includes("<!-- 【必須】 -->")) {
          requiredHeadings.push(line.trim());
        }
        break;
      }
    }
  }

  if (requiredHeadings.length === 0) {
    results.push(ok("RequiredSections", "Required section presence", "No required sections (marked with <!-- 【必須】 -->) in expected text"));
    return;
  }

  const actualLines = actual.split("\n");
  const actualHeadings = new Set(actualLines.filter((l) => /^## /.test(l)).map((l) => l.trim()));

  const missingHeadings: string[] = [];
  for (const heading of requiredHeadings) {
    if (!actualHeadings.has(heading)) {
      missingHeadings.push(heading);
    }
  }

  if (missingHeadings.length === 0) {
    results.push(ok("RequiredSections", "Required section presence", `All ${requiredHeadings.length} required section(s) present`));
  } else {
    for (const heading of missingHeadings) {
      results.push(ng("RequiredSections", "Required section presence", `Missing required section: ${heading}`));
    }
  }
}

function generateDiff(expected: string, actual: string, results: CheckResult[]): void {
  const expectedLines = expected.split("\n");
  const actualLines = actual.split("\n");
  const maxLen = Math.max(expectedLines.length, actualLines.length);
  const diffs: string[] = [];

  for (let i = 0; i < maxLen; i++) {
    const eLine = i < expectedLines.length ? expectedLines[i] : undefined;
    const aLine = i < actualLines.length ? actualLines[i] : undefined;

    if (eLine !== aLine) {
      const eDisplay = eLine !== undefined ? eLine : "(absent)";
      const aDisplay = aLine !== undefined ? aLine : "(absent)";
      diffs.push(`L${i + 1}: expected="${truncate(eDisplay, 80)}" actual="${truncate(aDisplay, 80)}"`);
    }
  }

  if (diffs.length > 0) {
    const diffLines = diffs.length > 20 ? [...diffs.slice(0, 20), `... and ${diffs.length - 20} more`] : diffs;
    results.push(info("RequiredSections", "Diff generation", `${diffs.length} line(s) differ:\n${diffLines.join("\n")}`));
  }
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

async function main(): Promise<void> {
  const opts = parseBodyArgs(process.argv.slice(2));

  if (opts.help) {
    printBodyHelp();
    process.exit(EXIT_OK);
  }

  if (!opts.expected || !opts.actual) {
    const missing: string[] = [];
    if (!opts.expected) missing.push("--expected");
    if (!opts.actual) missing.push("--actual");
    console.error(`Error: missing required argument(s): ${missing.join(", ")}`);
    process.exit(EXIT_ERROR);
  }

  const root = findRepoRoot(import.meta.dir);

  const expectedPath = require("path").resolve(root, opts.expected);
  const actualPath = require("path").resolve(root, opts.actual);

  const expectedFile = Bun.file(expectedPath);
  const actualFile = Bun.file(actualPath);

  if (!(await expectedFile.exists())) {
    console.error(`Error: --expected file not found: ${expectedPath}`);
    process.exit(EXIT_ERROR);
  }
  if (!(await actualFile.exists())) {
    console.error(`Error: --actual file not found: ${actualPath}`);
    process.exit(EXIT_ERROR);
  }

  const expected = await expectedFile.text();
  const actual = await actualFile.text();
  const actualBytes = await actualFile.arrayBuffer();
  const actualHasBOM = checkBOMFromBytes(actualBytes);

  if (opts.dryRun) {
    console.log(`Would verify ${expectedPath} against ${actualPath}`);
    console.log("Checks: Encoding (UTF-8/LF, BOM, control chars, Japanese), Markdown (tables, checkboxes, code blocks, lists), RequiredSections");
    process.exit(EXIT_OK);
  }

  const results: CheckResult[] = [];

  checkEncoding(actual, actualHasBOM, results);
  checkJapanesePreservation(expected, actual, results);
  checkTableConsistency(actual, results, "actual");
  checkCheckboxSyntax(expected, actual, results);
  checkCodeBlockPairing(actual, results, "actual");
  checkListIndentation(expected, actual, results);
  checkRequiredSections(expected, actual, results);

  const summary = computeSummary(results);
  if (summary.ng > 0) {
    generateDiff(expected, actual, results);
  }

  const report: IntegrityReport = {
    timestamp: new Date().toISOString(),
    script: SCRIPT_NAME,
    scanned: { checks: results.length },
    summary: computeSummary(results),
    results,
  };

  if (opts.json) {
    console.log(formatJsonReport(report));
  } else {
    console.log(formatMarkdownReport(report));
  }

  process.exit(determineExitCode(report.summary));
}

main();
