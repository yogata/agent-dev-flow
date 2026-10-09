// ADF-COVERS(verification): REQ-110-005
// ADF-COVERS(verification): REQ-032-001
/**
 * Completion judgment path checker (REQ-110-005, DEC-057 decisions 1/2).
 *
 * Implements the machine rejection structure for the single canonical
 * completion path (v5-completion-judgment Design「迂回経路の反証検査」節):
 *
 *   1. Enumerates completion-state transition trigger points across
 *      src/**, .opencode/** (host-side projections), docs/designs/** and
 *      scripts/** (both canonical originals and projections), for text
 *      artifacts (.md, .ts, .mjs).
 *   2. Classifies every enumerated trigger point:
 *        - single-path  the file belongs to the case-close QG-4 ownership
 *                       set (the single legitimate completion path)
 *        - exempted     the line is a prohibition / single-writer ownership
 *                       declaration or a See Also reference line
 *        - bypass       none of the above: a completion-state change path
 *                       that does not route through case-close QG-4
 *   3. Rejects (fail-closed) when any bypass trigger point exists, when a
 *      scan root or the single-path ownership structure itself is missing,
 *      when the enumeration is empty (non-vacuous enumeration guard), or
 *      when the count reconciliation does not balance.
 *
 * Trigger classes (a line is a trigger point only when completion-STATE
 * semantics are exercised on the same line):
 *
 *   - checkbox-finalize            checkbox / achievement semantics
 *                                  (チェックボックス / 達成扱い / [x]) with an
 *                                  affirmative finalize verb, or an explicit
 *                                  achievement mark on a 完了条件 line. Bare
 *                                  完了条件 + 更新/反映/確定 lines are wording
 *                                  edits owned by case-open / case-ready
 *                                  (REQ-017) and are deliberately not triggers
 *   - completion-declaration       完遂宣言 / 完遂判定 / 完遂扱い /
 *                                  完遂状態 / 完遂条件 with an exercise verb
 *   - final-acceptance-exercise    最終受入 with an exercise verb
 *
 * Deliberate non-detections (documented so future pattern changes stay
 * reviewable):
 *   - passive forms (更新される / 対応づけられている) describe that state
 *     changes happen, they do not start a transition path
 *   - bare 完遂する / 完遂させる (wave iteration completion, case-auto
 *     stage 3) is an execution-unit completion judgement, which DEC-057
 *     decision 4 keeps distinct from the completion declaration
 *   - 付与する in classes B/C: its real corpus usage is version tagging
 *     after the completion judgment, not the declaration
 *   - noun-only lines (state classification tables, section name lists)
 *
 * Exemptions (structured, in evaluation order):
 *   - negation         the line forbids the action (更新しない / 行わない /
 *                      ならない / せず / 除外 / 防止 / 禁止 / 認めない)
 *   - ownership        the line attributes the action to case-close
 *                      (専任 / 単一書き手 / single-writer / 単点化 /
 *                      case-close...が|のみ|だけ|責務|担当)
 *   - reference-line   markdown See Also section lines (the Design mandates
 *                      「See Also 等の参照行は検出対象外とする扱いを明示する」)
 *
 * Structured file exemptions:
 *   - *.test.ts fixture files legitimately build bypass-shaped lines to
 *     validate detection (same precedent as check_workflow_preventive
 *     check-4 detection fixtures)
 *
 * The checker itself is the guard: fail-closed (ok=false, exit 1) on any
 * bypass, missing structure, empty enumeration, or unbalanced counts.
 */

import * as fs from "fs";
import * as path from "path";
import { globWalkRel } from "./lib/glob_walk.ts";

export type TriggerClass =
  | "checkbox-finalize"
  | "completion-declaration"
  | "final-acceptance-exercise";

export type TriggerClassification = "single-path" | "exempted" | "bypass";
export type ExemptionKind = "negation" | "ownership" | "reference-line";

export interface CompletionTriggerPoint {
  file: string;
  line: number;
  klass: TriggerClass;
  classification: TriggerClassification;
  exemption?: ExemptionKind;
  text: string;
}

export interface CompletionJudgmentFailure {
  check: "bypass-trigger" | "scan-root-missing" | "single-point-missing" | "enumeration-empty" | "count-reconciliation";
  severity: "strict";
  file?: string;
  line?: number;
  message: string;
}

export interface CompletionJudgmentExemption {
  area: string;
  description: string;
}

export interface CompletionJudgmentReport {
  ok: boolean;
  failures: CompletionJudgmentFailure[];
  stats: {
    roots_scanned: number;
    files_scanned: number;
    trigger_points_enumerated: number;
    single_path: number;
    exempted: number;
    bypass: number;
    reference_lines: number;
  };
  trigger_points: CompletionTriggerPoint[];
  exemptions: CompletionJudgmentExemption[];
}

/** Scan roots: canonical originals (src) and projections (.opencode) plus design bodies and scripts. */
const SCAN_ROOTS = ["src", ".opencode", path.join("docs", "designs"), "scripts"] as const;

const SCAN_EXTENSIONS = [".md", ".ts", ".mjs"] as const;
const SKIP_DIR_NAMES = ["node_modules"] as const;

/**
 * The single legitimate completion path (case-close QG-4 ownership set).
 * Suffix matchers are segment-anchored so they hit both canonical originals
 * (src/common/...) and host-side projections (.opencode/...) when present.
 */
const SINGLE_POINT_SUFFIXES = [
  "/agentdev-workflow-case-close/",
  "/agentdev-quality-gates/",
  "/commands/case-close.md",
] as const;

export const COMPLETION_JUDGMENT_EXEMPTIONS: CompletionJudgmentExemption[] = [
  {
    area: "*.test.ts detection fixtures",
    description:
      "test files legitimately build bypass-shaped lines to validate detection (check_workflow_preventive check-4 precedent)",
  },
  {
    area: "See Also reference lines",
    description:
      "markdown See Also section lines are reference rows, explicitly out of detection scope (v5-completion-judgment Design「迂回経路の反証検査」節)",
  },
  {
    area: "markdown fenced code blocks",
    description:
      "fenced code block contents are examples/templates, not transition paths (IR-052 code-block criterion)",
  },
  {
    area: "rule self-reference files",
    description:
      "the checker source itself and the IR-052 rule definition document contain the detection vocabulary by definition (ルール自己参照 file-unit exclusion, checker-execution-contracts Design「検出対象除外規定」)",
  },
];

// A trigger line needs a completion-domain noun on the same line. Achievement
// treatment words count as completion-domain nouns on their own: a bypass can
// phrase the state change as 条件を達成扱いにする without naming the checkbox.
const CONTEXT_NOUN = /完了条件|チェックボックス|完遂|最終受入|達成扱い|完了扱い|チェック済み|\[x\]|\[ \]/;

// Class A: completion-checkbox state domain. The state gate (checkbox /
// achievement semantics) separates state-changing exercises from condition
// TEXT editing: bare 完了条件 + 更新/反映/確定 lines describe wording
// amendments owned by case-open / case-ready (REQ-017 execution contract
// authority), which are a separate, legitimate responsibility. Only checkbox
// marking / achievement treatment changes the completion STATE (REQ-032-001).
const CHECK_CONDITION_NOUN = /完了条件|チェックボックス/;
const CHECK_STATE_CONTEXT = /チェックボックス|チェック済み|達成扱い|(?<!未)完了扱い|\[x\]|\[ \]/;
// State-treatment phrasing is standalone completion-state semantics: a
// bypass can phrase the change as 条件を達成扱いにする without naming the
// checkbox or the condition list.
const STATE_TREATMENT = /達成扱い|(?<!未)完了扱い|済みにする/;
// A literal checkbox mark alone is NOT a trigger: list-option bullets like
// "- [x] NG" (review-result templates) are UI selections outside the
// REQ-032-001 completion-condition checkbox domain. Marks count only with
// completion-condition vocabulary, an exercise verb, or treatment phrasing.
const MARK_LITERAL = /\[x\]/;
const FINALIZE_VERB =
  /更新する|評価する|確定する|反映する|チェックする|マークする|付けする|つける|付与する|達成扱いに|チェック済みに|\[x\]化|\[x\]に|済みにする/;

// Class B: completion declaration domain (compound nouns only; bare
// 完遂する/完遂させる is wave-iteration completion, DEC-057 decision 4).
const COMPLETION_NOUN = /完遂(宣言|判定|扱い|状態|条件)/;

// Class C: final acceptance domain.
const FINAL_ACCEPTANCE_NOUN = /最終受入/;

// Shared affirmative exercise verb for classes B and C. 付与する is
// intentionally absent: its real corpus usage is version tagging
// (版を付与する) after the completion judgment, not the declaration itself.
const EXERCISE_VERB =
  /宣言する|判定する|扱いにする|とする|みなす|遷移する|変更する|確定する|更新する|合格させる|合格と/;

// Exemption: prohibition / negation declarations (IR-052 negation-context
// criterion: 否定表現は未達ではなく要件の一部). せず / ていない cover
// 完了扱いにせず / 完了扱いにしていない; 除外 / 防止 cover filter and
// prevention statements about the checked state.
const NEGATION = /しない|行わない|させない|ならない|せず|ていない|除外|防止|禁止|認めない|許さない/;

// Exemption: single-writer ownership / attribution to case-close.
const OWNERSHIP = /専任|単一書き手|single-writer|単点化|単一点/;
const ATTRIBUTION = /case-close[^。\n]*(が|のみ|だけ|専任|責務|担当)/;

const SEE_ALSO_HEADING = /^#{1,6}\s.*See\s*Also/i;
const MD_HEADING = /^#{1,6}\s/;

export interface LineJudgment {
  klass: TriggerClass | null;
  classification: "not-a-trigger" | TriggerClassification;
  exemption?: ExemptionKind;
}

/**
 * Pure line classifier. Section membership (See Also) is handled by the
 * scan loop and folded in afterwards.
 */
export function judgeLine(line: string): LineJudgment {
  if (!CONTEXT_NOUN.test(line)) {
    return { klass: null, classification: "not-a-trigger" };
  }
  let klass: TriggerClass | null = null;
  const classAMatch =
    STATE_TREATMENT.test(line) ||
    (CHECK_CONDITION_NOUN.test(line) && CHECK_STATE_CONTEXT.test(line) && FINALIZE_VERB.test(line)) ||
    (MARK_LITERAL.test(line) &&
      (CHECK_CONDITION_NOUN.test(line) || FINALIZE_VERB.test(line) || STATE_TREATMENT.test(line)));
  if (classAMatch) {
    klass = "checkbox-finalize";
  } else if (COMPLETION_NOUN.test(line) && EXERCISE_VERB.test(line)) {
    klass = "completion-declaration";
  } else if (FINAL_ACCEPTANCE_NOUN.test(line) && EXERCISE_VERB.test(line)) {
    klass = "final-acceptance-exercise";
  }
  if (klass === null) {
    return { klass: null, classification: "not-a-trigger" };
  }
  if (NEGATION.test(line)) {
    return { klass, classification: "exempted", exemption: "negation" };
  }
  if (OWNERSHIP.test(line) || ATTRIBUTION.test(line)) {
    return { klass, classification: "exempted", exemption: "ownership" };
  }
  return { klass, classification: "bypass" };
}

function isTestFixture(relPath: string): boolean {
  return relPath.endsWith(".test.ts");
}

/**
 * Rule self-reference files: the detector's own source and the IR-052 rule
 * definition document carry the detection vocabulary by definition. File-unit
 * exclusion with documented basis (ルール自己参照), the category allowed by
 * checker-execution-contracts Design「検出対象除外規定」.
 */
const SELF_REFERENCE_FILE_SUFFIXES = [
  "check_completion_judgment_path.ts",
  "IR-052-completion-grep-pattern-design.md",
] as const;

function isSelfReferenceFile(relPath: string): boolean {
  return SELF_REFERENCE_FILE_SUFFIXES.some((suffix) => relPath.endsWith(suffix));
}

function isSinglePointFile(relPath: string): boolean {
  return SINGLE_POINT_SUFFIXES.some((suffix) => relPath.includes(suffix));
}

function toRel(repoRoot: string, abs: string): string {
  return path.relative(repoRoot, abs).replace(/\\/g, "/");
}

interface ScannedFile {
  abs: string;
  rel: string;
}

function listScanFiles(repoRoot: string, root: string): ScannedFile[] {
  const rootAbs = path.join(repoRoot, root);
  const entries = globWalkRel(rootAbs, {
    extensions: [...SCAN_EXTENSIONS],
    skipDirNames: [...SKIP_DIR_NAMES],
    filesOnly: true,
  });
  const out: ScannedFile[] = [];
  for (const rel of entries) {
    const abs = path.join(rootAbs, ...rel.split("/"));
    const relFromRoot = toRel(repoRoot, abs);
    if (isTestFixture(relFromRoot)) continue;
    if (isSelfReferenceFile(relFromRoot)) continue;
    out.push({ abs, rel: relFromRoot });
  }
  return out.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
}

export function checkCompletionJudgmentPath(repoRoot: string): CompletionJudgmentReport {
  const failures: CompletionJudgmentFailure[] = [];
  const triggerPoints: CompletionTriggerPoint[] = [];
  const scannedRelPaths: string[] = [];
  let filesScanned = 0;
  let rootsScanned = 0;
  let referenceLines = 0;

  for (const root of SCAN_ROOTS) {
    const rootAbs = path.join(repoRoot, root);
    if (!fs.existsSync(rootAbs) || !fs.statSync(rootAbs).isDirectory()) {
      failures.push({
        check: "scan-root-missing",
        severity: "strict",
        file: root,
        message: `scan root missing (fail-closed): ${root}`,
      });
      continue;
    }
    const files = listScanFiles(repoRoot, root);
    if (files.length === 0) {
      failures.push({
        check: "scan-root-missing",
        severity: "strict",
        file: root,
        message: `scan root resolved to zero targets (invalid run, fail-closed): ${root}`,
      });
      continue;
    }
    rootsScanned += 1;
    filesScanned += files.length;

    for (const file of files) {
      scannedRelPaths.push(file.rel);
      const rel = file.rel;
      const singlePoint = isSinglePointFile(rel);
      let inSeeAlso = false;
      let inFence = false;
      const text = fs.readFileSync(file.abs, "utf-8") as string;
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i] as string;
        const line = raw.trim();
        if (/\.md$/.test(rel)) {
          if (/^(```|~~~)/.test(line)) {
            inFence = !inFence;
            continue;
          }
          if (inFence) {
            referenceLines += 1;
            continue;
          }
          if (MD_HEADING.test(line)) {
            inSeeAlso = SEE_ALSO_HEADING.test(line);
            continue;
          }
          if (inSeeAlso) {
            referenceLines += 1;
            continue;
          }
        }
        const judgment = judgeLine(line);
        if (judgment.classification === "not-a-trigger" || judgment.klass === null) continue;
        if (singlePoint) {
          triggerPoints.push({
            file: rel,
            line: i + 1,
            klass: judgment.klass,
            classification: "single-path",
            text: line,
          });
        } else if (judgment.classification === "exempted") {
          triggerPoints.push({
            file: rel,
            line: i + 1,
            klass: judgment.klass,
            classification: "exempted",
            exemption: judgment.exemption,
            text: line,
          });
        } else {
          triggerPoints.push({
            file: rel,
            line: i + 1,
            klass: judgment.klass,
            classification: "bypass",
            text: line,
          });
          failures.push({
            check: "bypass-trigger",
            severity: "strict",
            file: rel,
            line: i + 1,
            message: `completion-state bypass path outside the case-close QG-4 single path (${judgment.klass})`,
          });
        }
      }
    }
  }

  // Single-path structure presence: every suffix matcher must hit at least
  // one scanned file, otherwise the canonical completion path itself is
  // missing from the scanned tree (fail-closed).
  for (const suffix of SINGLE_POINT_SUFFIXES) {
    if (!scannedRelPaths.some((f) => f.includes(suffix))) {
      failures.push({
        check: "single-point-missing",
        severity: "strict",
        file: suffix,
        message: `single-path ownership structure missing from scanned tree (fail-closed): ${suffix}`,
      });
    }
  }

  const singlePath = triggerPoints.filter((t) => t.classification === "single-path").length;
  const exempted = triggerPoints.filter((t) => t.classification === "exempted").length;
  const bypass = triggerPoints.filter((t) => t.classification === "bypass").length;

  // Non-vacuous enumeration guard: the enumeration must surface at least the
  // single-path trigger points; zero targets means the scan found nothing
  // and proves nothing (REQ-018-004 zero-targets handling).
  if (rootsScanned > 0 && triggerPoints.length === 0) {
    failures.push({
      check: "enumeration-empty",
      severity: "strict",
      message: "completion-state transition trigger enumeration is empty (non-vacuous guard, fail-closed)",
    });
  }

  // Count reconciliation (列挙件数突合): per-class counts must sum to the
  // enumerated total.
  if (triggerPoints.length !== singlePath + exempted + bypass) {
    failures.push({
      check: "count-reconciliation",
      severity: "strict",
      message: `count reconciliation unbalanced: enumerated=${triggerPoints.length} single=${singlePath} exempted=${exempted} bypass=${bypass}`,
    });
  }

  return {
    ok: failures.length === 0,
    failures,
    stats: {
      roots_scanned: rootsScanned,
      files_scanned: filesScanned,
      trigger_points_enumerated: triggerPoints.length,
      single_path: singlePath,
      exempted,
      bypass,
      reference_lines: referenceLines,
    },
    trigger_points: triggerPoints,
    exemptions: COMPLETION_JUDGMENT_EXEMPTIONS,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const positional = args.filter((a) => !a.startsWith("--"));
  const repoRoot = positional[0] || process.cwd();
  const report = checkCompletionJudgmentPath(repoRoot);
  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(`check_completion_judgment_path.ts - completion judgment path (REQ-110-005)\n`);
    process.stdout.write(`============================================================================\n`);
    process.stdout.write(`repoRoot: ${repoRoot}\n`);
    process.stdout.write(`ok: ${report.ok}\n`);
    process.stdout.write(`stats: ${JSON.stringify(report.stats, null, 2)}\n`);
    process.stdout.write(`failures (${report.failures.length}):\n`);
    for (const f of report.failures) {
      process.stdout.write(
        `  [${f.severity}/${f.check}]${f.file ? ` (${f.file}${f.line ? `:${f.line}` : ""})` : ""}: ${f.message}\n`,
      );
    }
    process.stdout.write(`trigger points (${report.trigger_points.length}):\n`);
    for (const t of report.trigger_points) {
      process.stdout.write(
        `  [${t.classification}${t.exemption ? `/${t.exemption}` : ""}] ${t.klass} ${t.file}:${t.line}: ${t.text}\n`,
      );
    }
  }
  process.exit(report.ok ? 0 : 1);
}
