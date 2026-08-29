// ADF-COVERS(implementation): REQ-010-071, REQ-053-012
// check_content_corruption.ts
//
// Deterministic content corruption checker (REQ-010-071). Scans the bodies of
// distributed commands (src/opencode/commands/agentdev/**) and distributed
// skills (src/opencode/skills/**) for mechanically detectable corruption:
//
//   - heading-hierarchy:  heading level jumps (e.g. h1 -> h3)
//   - unclosed-code-block: odd number of fenced code block markers
//   - broken-link:        unclosed link syntax or non-existent relative target
//   - broken-code-span:   odd number of inline backticks per line
//   - broken-emphasis:    odd number of unescaped `**` per line (outside spans)
//   - control-char:       C0/C1 control characters other than \t \n \r
//   - invalid-unicode:    BOM, U+FFFD, noncharacters, PUA, zero-width chars
//   - foreign-script:     unintended foreign-script characters (REQ-053-009)
//   - stale-reference:    known-form residual references (retired paths,
//                         legacy ADR-/REQ-0108- id forms)
//
// Rule ownership follows REQ-010-009 / REQ-053-012: the individual detection
// signals and the allowed-usage enumeration are owned by
// docs/designs/integrity/content-corruption-checker.md (this script is its
// implementation; check_content_corruption.test.ts pins its contract).
//
// Exit codes: 0 ok, 1 violation, 2 error.

import { parseArgs } from "node:util";
import * as path from "path";
import * as fs from "fs";
import { globWalkRel } from "./lib/glob_walk.ts";

export type CorruptionRuleId =
  | "heading-hierarchy"
  | "unclosed-code-block"
  | "broken-link"
  | "broken-code-span"
  | "broken-emphasis"
  | "control-char"
  | "invalid-unicode"
  | "foreign-script"
  | "stale-reference";

export interface CorruptionFinding {
  rule_id: CorruptionRuleId;
  file: string;
  line: number;
  matched: string;
  description: string;
}

export interface CorruptionReport {
  ok: boolean;
  findings: CorruptionFinding[];
  stats: {
    scanned_files: number;
    violations: Record<CorruptionRuleId, number>;
  };
}

const RULE_IDS: readonly CorruptionRuleId[] = [
  "heading-hierarchy",
  "unclosed-code-block",
  "broken-link",
  "broken-code-span",
  "broken-emphasis",
  "control-char",
  "invalid-unicode",
  "foreign-script",
  "stale-reference",
];

function emptyViolations(): Record<CorruptionRuleId, number> {
  const out = {} as Record<CorruptionRuleId, number>;
  for (const id of RULE_IDS) out[id] = 0;
  return out;
}

function findRepoRoot(start: string): string {
  let cur = path.resolve(start);
  while (!fs.existsSync(path.join(cur, ".git"))) {
    const parent = path.dirname(cur);
    if (parent === cur) return start;
    cur = parent;
  }
  return cur;
}

export function listMarkdownRecursive(dir: string): string[] {
  return globWalkRel(dir, { extensions: [".md"], filesOnly: true, skipDirNames: ["node_modules", ".git"] }).map(
    (rel) => path.join(dir, ...rel.split("/")).replace(/\\/g, "/"),
  );
}

function collectScanFiles(repoRoot: string): string[] {
  const dirs = [
    path.join(repoRoot, "src", "opencode", "commands", "agentdev"),
    path.join(repoRoot, "src", "opencode", "skills"),
  ];
  const out: string[] = [];
  for (const d of dirs) out.push(...listMarkdownRecursive(d));
  return out.sort();
}

// ---------------------------------------------------------------------------
// Allowed-usage enumeration (REQ-010-071 "unintended foreign-script chars").
// File-unit exemptions with documented rationale, per checker-execution-
// contracts Design "detection exclusion rules". Empty at introduction: the
// current distributed corpus contains no foreign-script characters.
// ---------------------------------------------------------------------------

interface AllowedUsageEntry {
  /** repository-relative forward-slash path of the allowed file */
  file: string;
  /** rule allowed in this file */
  rule_id: CorruptionRuleId;
  rationale: string;
}

/** Allowed-usage enumeration owned by the Design "allowed usage enumeration"
 * section. Tests append entries to exercise the exemption mechanism. */
export const ALLOWED_USAGE: AllowedUsageEntry[] = [];

function isAllowedUsage(file: string, ruleId: CorruptionRuleId): boolean {
  return ALLOWED_USAGE.some((e) => e.file === file && e.rule_id === ruleId);
}

// ---------------------------------------------------------------------------
// Character classes
// ---------------------------------------------------------------------------

// C0 control chars except \t (0x09), \n (0x0A), \r (0x0D), plus DEL and C1.
const CONTROL_CHAR_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u0080-\u009F]/g;

// BOM, replacement char (decode corruption signal), noncharacters, private
// use area, and invisible formatting characters.
const INVALID_UNICODE_RE = /[\uFEFF\uFFFD\uFDD0-\uFDEF\uFFFE\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{E0001}\u{E0020}-\u{E007F}\u{E000}-\u{F8FF}\u{200B}-\u{200F}\u{2060}-\u{2064}\u{206A}-\u{206F}]/gu;

// Scripts that should not appear in this Japanese/English corpus
// (REQ-053-009 "unintended foreign-script characters").
const FOREIGN_SCRIPT_RE =
  /[\u0370-\u03FF\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF\u0900-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1780-\u17FF\u1800-\u18AF\u2E80-\u2EFF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uFFF0-\uFFF8]/g;

// Legacy id forms whose references are residual (current forms: DEC-NNN,
// REQ-NNNN-NNN).
const STALE_ID_RES: readonly RegExp[] = [
  /\bADR-\d{3}(?:-\d+)?\b/g,
  /\bREQ-0108-\d{3}\b/g,
];

const STALE_LINK_PATH_RE = /(?:requirements\/retired\/|retired\/REQ-)/;

// ---------------------------------------------------------------------------
// Line partitioning: frontmatter, fenced blocks, HTML comments
//
// Planes per the Design "target scope" section:
//   - charScan    : frontmatter excluded only (fences and HTML comments
//                   included) — raw-file character quality applies everywhere
//   - structural  : frontmatter, fenced blocks and HTML comment regions
//                   excluded — link/emphasis/heading syntax only governs the
//                   rendered body
// HTML comment toggle is line-unit: a line containing `<!--` opens the
// comment region (closing at the first later line containing `-->`).
// ---------------------------------------------------------------------------

interface BodyLine {
  no: number;
  text: string;
}

interface FenceLine {
  ch: "`" | "~";
  len: number;
  info: string;
}

/** CommonMark fence line: 3+ backticks/tildes, up to 3 leading spaces. A
 * backtick fence must not have backticks in its info string. */
function parseFenceLine(text: string): FenceLine | null {
  const m = text.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
  if (!m) return null;
  const marker = m[1];
  const info = m[2].trim();
  if (marker[0] === "`" && info.includes("`")) return null;
  return { ch: marker[0] as "`" | "~", len: marker.length, info };
}

function partitionLines(lines: readonly string[]): {
  structural: BodyLine[];
  charScan: BodyLine[];
  fenceCount: number;
} {
  const structural: BodyLine[] = [];
  const charScan: BodyLine[] = [];
  let fenceCount = 0;
  let i = 0;
  // frontmatter: only when the file starts with a `---` line
  if (lines.length > 0 && lines[0].trimEnd() === "---") {
    i = 1;
    while (i < lines.length && lines[i].trimEnd() !== "---") i++;
    i++; // skip closing --- (or EOF; frontmatter brokenness is not a target)
  }
  let fence: FenceLine | null = null;
  let inComment = false;
  for (; i < lines.length; i++) {
    const text = lines[i];
    charScan.push({ no: i + 1, text });
    if (fence !== null) {
      const p = parseFenceLine(text);
      if (p && p.ch === fence.ch && p.len >= fence.len && p.info === "") {
        fenceCount++;
        fence = null;
      }
      continue;
    }
    if (inComment) {
      if (text.includes("-->")) inComment = false;
      continue;
    }
    if (text.includes("<!--")) {
      inComment = !text.includes("-->");
      continue;
    }
    const p = parseFenceLine(text);
    if (p) {
      fenceCount++;
      fence = p;
      continue;
    }
    structural.push({ no: i + 1, text });
  }
  return { structural, charScan, fenceCount };
}

// ---------------------------------------------------------------------------
// Structural checks (paragraph units over structural body lines)
// ---------------------------------------------------------------------------

function stripCodeSpans(text: string): string {
  // Remove inline code spans so their content is invisible to structural
  // checks. A run of N backticks opens/closes a span of the same run length;
  // simple paired-run removal is deterministic for the corpus grammar.
  return text.replace(/(`+)[\s\S]*?\1/g, " ");
}

function stripEmphasisPairs(text: string): string {
  // Remove `**open...close**` pairs. A pair opener must not be followed by
  // whitespace, `*`, or `/` — that excludes glob tokens (`**/*.md`) from
  // opening a pair. The body may span lines (multi-line emphasis inside one
  // paragraph is valid CommonMark).
  return text.replace(/\*\*(?![*\s/])[^*]*?\*\*/g, " ");
}

function removeGlobContextDoubleStars(text: string): string {
  // Residual `**` after pair removal: glob/pattern tokens adjacent to path
  // separators (`docs/**`, `**/*.md`) or ending a word (`docs/** `).
  return text.replace(/\*\*\/|\/\*\*|\w\*\*(?=\s|$)/g, " ");
}

function checkBodyParagraph(
  paragraph: string,
  findings: CorruptionFinding[],
  file: string,
  lineNo: number,
): void {
  const noCode = stripCodeSpans(paragraph);

  // broken-link: link syntax residues and non-existent relative targets.
  const linkRe = /\[([^\]]*)\]\(([^)]*)\)/g;
  let lm: RegExpExecArray | null;
  while ((lm = linkRe.exec(noCode)) !== null) {
    const target = lm[2].trim();
    if (target === "") {
      findings.push({
        rule_id: "broken-link",
        file,
        line: lineNo,
        matched: lm[0],
        description: "Link syntax with empty target () is broken (REQ-053-008).",
      });
      continue;
    }
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    if (STALE_LINK_PATH_RE.test(target)) {
      findings.push({
        rule_id: "stale-reference",
        file,
        line: lineNo,
        matched: target,
        description: `Link target '${target}' references a retired artifact path (REQ-053-010).`,
      });
      continue;
    }
    const resolved = path.resolve(path.dirname(file), decodeURI(target.split("#")[0]));
    if (!fs.existsSync(resolved)) {
      findings.push({
        rule_id: "broken-link",
        file,
        line: lineNo,
        matched: target,
        description: `Relative link target '${target}' does not exist in the distribution (REQ-053-008).`,
      });
    }
  }
  // residual open link syntax: a `[text](` whose `)` never closes within the
  // paragraph.
  const om = noCode.match(/\[[^\]]*\]\([^)]*$/);
  if (om) {
    findings.push({
      rule_id: "broken-link",
      file,
      line: lineNo,
      matched: om[0],
      description: "Link syntax opened with [text]( but never closed with ) (REQ-053-008).",
    });
  }

  // broken-emphasis: after pair removal and glob-token removal, remaining
  // `**` markers must pair up within the paragraph.
  const emphasisText = removeGlobContextDoubleStars(stripEmphasisPairs(noCode));
  const emphasisCount = (emphasisText.match(/\*\*/g) ?? []).length;
  if (emphasisCount % 2 !== 0) {
    findings.push({
      rule_id: "broken-emphasis",
      file,
      line: lineNo,
      matched: paragraph,
      description: `Unpaired '**' emphasis markers (${emphasisCount}) in the paragraph starting here (REQ-053-008).`,
    });
  }

  // broken-code-span: odd number of inline backtick runs in the paragraph.
  const backtickRuns = (paragraph.match(/`+/g) ?? []).length;
  if (backtickRuns % 2 !== 0) {
    findings.push({
      rule_id: "broken-code-span",
      file,
      line: lineNo,
      matched: paragraph,
      description: `Odd number of inline backtick runs (${backtickRuns}) in the paragraph starting here (REQ-053-008).`,
    });
  }

  // stale-reference: legacy id forms outside links.
  for (const re of STALE_ID_RES) {
    re.lastIndex = 0;
    let sm: RegExpExecArray | null;
    while ((sm = re.exec(noCode)) !== null) {
      findings.push({
        rule_id: "stale-reference",
        file,
        line: lineNo,
        matched: sm[0],
        description: `Reference '${sm[0]}' uses a retired id form (current forms: DEC-NNN, REQ-NNNN-NNN) (REQ-053-010).`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Per-file check
// ---------------------------------------------------------------------------

export function checkFile(fileRel: string, repoRoot: string): CorruptionFinding[] {
  const file = path.join(repoRoot, ...fileRel.split("/"));
  const text = fs.readFileSync(file, "utf-8");
  const lines = text.split(/\r?\n/);
  const findings: CorruptionFinding[] = [];

  const { structural, charScan, fenceCount } = partitionLines(lines);

  // heading-hierarchy: level jump > 1 between consecutive structural headings.
  let prevLevel: number | null = null;
  for (const { no, text: lineText } of structural) {
    const hm = lineText.match(/^(#{1,6})\s+\S/);
    if (hm) {
      const level = hm[1].length;
      if (prevLevel !== null && level > prevLevel + 1) {
        findings.push({
          rule_id: "heading-hierarchy",
          file,
          line: no,
          matched: lineText,
          description: `Heading level jumps from h${prevLevel} to h${level} (REQ-053-008).`,
        });
      }
      prevLevel = level;
    }
  }

  // character-level checks: frontmatter excluded only (raw-file plane).
  for (const { no, text: lineText } of charScan) {
    for (const [ruleId, re] of [
      ["control-char", CONTROL_CHAR_RE],
      ["invalid-unicode", INVALID_UNICODE_RE],
      ["foreign-script", FOREIGN_SCRIPT_RE],
    ] as const) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(lineText)) !== null) {
        if (isAllowedUsage(fileRel, ruleId)) break;
        findings.push({
          rule_id: ruleId,
          file,
          line: no,
          matched: m[0],
          description:
            ruleId === "control-char"
              ? `Control character U+${m[0].codePointAt(0)!.toString(16).padStart(4, "0").toUpperCase()} (REQ-053-009).`
              : ruleId === "invalid-unicode"
                ? `Invalid Unicode character U+${m[0].codePointAt(0)!.toString(16).toUpperCase().padStart(5, "0")} (REQ-053-009).`
                : `Foreign-script character U+${m[0].codePointAt(0)!.toString(16).toUpperCase().padStart(5, "0")} outside the Japanese/English corpus (REQ-053-009).`,
        });
      }
    }
  }

  // paragraph-based structural checks: structural body lines split on blank
  // lines; table rows are checked as single-line paragraphs (row-local
  // syntax, so adjacent rows must not pair up their inline markers).
  let para: BodyLine[] = [];
  const flush = () => {
    if (para.length === 0) return;
    checkBodyParagraph(para.map((l) => l.text).join("\n"), findings, file, para[0].no);
    para = [];
  };
  for (const line of structural) {
    const trimmed = line.text.trim();
    if (trimmed === "" || trimmed.startsWith("|")) {
      flush();
      if (trimmed !== "") checkBodyParagraph(line.text, findings, file, line.no);
    } else {
      para.push(line);
    }
  }
  flush();

  // unclosed-code-block: odd fenced marker count over the whole file.
  if (fenceCount % 2 !== 0) {
    findings.push({
      rule_id: "unclosed-code-block",
      file,
      line: lines.length,
      matched: `${fenceCount} fences`,
      description: `Odd number of fenced code block markers (${fenceCount}); a block is unclosed (REQ-053-008).`,
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function checkContentCorruption(repoRoot?: string): CorruptionReport {
  const root = findRepoRoot(repoRoot ?? process.cwd());
  const files = collectScanFiles(root);

  const findings: CorruptionFinding[] = [];
  for (const f of files) {
    findings.push(...checkFile(path.relative(root, f).replace(/\\/g, "/"), root));
  }

  const violations = emptyViolations();
  for (const f of findings) violations[f.rule_id]++;

  return {
    ok: findings.length === 0,
    findings,
    stats: {
      scanned_files: files.length,
      violations,
    },
  };
}

if (import.meta.main) {
  try {
    const parsed = parseArgs({
      args: process.argv.slice(2),
      options: {
        root: { type: "string" },
        json: { type: "boolean", default: false },
        help: { type: "boolean", default: false },
      },
      allowPositionals: false,
    });
    if (parsed.values.help) {
      console.log("usage: bun run check_content_corruption.ts [--root <path>] [--json]");
      process.exit(0);
    }
    const report = checkContentCorruption(parsed.values.root);

    if (parsed.values.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`check_content_corruption.ts`);
      console.log(`=============================================================`);
      console.log(`ok: ${report.ok}`);
      console.log(`stats: ${JSON.stringify(report.stats, null, 2)}`);
      if (report.findings.length > 0) {
        console.log(`findings (${report.findings.length}):`);
        for (const f of report.findings) {
          console.log(`  [${f.rule_id}] ${f.file}:${f.line} matched=${f.matched}`);
          console.log(`    ${f.description}`);
        }
      }
    }
    process.exit(report.ok ? 0 : 1);
  } catch (error) {
    console.error(
      `check_content_corruption.ts: error: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(2);
  }
}
