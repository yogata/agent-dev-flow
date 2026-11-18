// rules/ir-070.ts — design-frontmatter-required-keys。
// ルール詳細: docs/designs/integrity/rules/IR-070-design-frontmatter-required-keys.md
// frontmatter 境界抽出・ISO 日付妥当性判定は旧 check_knowledge_docs.ts と同一の検出基準を
// 本モジュール内へ移設した（旧 checker は AG-007 で削除）。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

export const DESIGNS_DIR = "docs/designs";
export const REQUIRED_DESIGN_FRONTMATTER_FIELDS: readonly string[] = [
  "title",
  "status",
  "created",
  "updated",
];
export const ALLOWED_STATUS_VALUES: readonly string[] = ["draft", "accepted"];
export const EXCLUDED_DIR_SEGMENTS: readonly string[] = [
  "references",
  "audits",
  "baselines",
];
export const SIGNAL_KEYS: readonly string[] = ["baseline_for", "audit_for"];

const FRONTMATTER_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type DesignFrontmatterFindingKind =
  | "missing-frontmatter"
  | "invalid-frontmatter"
  | "leading-whitespace-key";

export function stripYamlQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function isValidIsoDate(value: string): boolean {
  if (!FRONTMATTER_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (month! < 1 || month! > 12 || day! < 1) return false;
  const daysInMonth = new Date(Date.UTC(year!, month!, 0)).getUTCDate();
  return day! <= daysInMonth;
}

export function extractFrontmatterLines(content: string): string[] | null {
  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === "---") return lines.slice(1, i);
  }
  return null;
}

export function extractFrontmatterFields(lines: readonly string[]): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of lines) {
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (m && !fields.has(m[1]!)) fields.set(m[1]!, m[2]!.trim());
  }
  return fields;
}

export function findLeadingWhitespaceKeys(lines: readonly string[]): string[] {
  const corrupted: string[] = [];
  for (const line of lines) {
    const m = /^\s+(title|status|created|updated)\s*:/.exec(line);
    if (m) corrupted.push(m[1]!);
  }
  return corrupted;
}

export interface DesignFrontmatterViolation {
  kind: DesignFrontmatterFindingKind;
  problem: string;
}

export function findDesignFrontmatterViolations(
  content: string,
): DesignFrontmatterViolation[] {
  const lines = extractFrontmatterLines(content);
  if (lines === null) {
    return [
      {
        kind: "missing-frontmatter",
        problem:
          "frontmatter ブロック（先頭 --- 〜 閉じ ---）が存在しない。" +
          "title / status / created / updated を --- で挟んで記述する",
      },
    ];
  }
  const violations: DesignFrontmatterViolation[] = [];
  for (const key of findLeadingWhitespaceKeys(lines)) {
    violations.push({
      kind: "leading-whitespace-key",
      problem:
        `frontmatter 内に行頭空白付きの必須キー行が存在し、キー名「${key}」が YAML キーとして認識されない` +
        "（キー名破損。「updated値のキー名欠落」の検出）。行頭空白を除去する",
    });
  }
  const fields = extractFrontmatterFields(lines);
  for (const field of REQUIRED_DESIGN_FRONTMATTER_FIELDS) {
    const value = fields.get(field);
    if (value === undefined || value === "") {
      violations.push({
        kind: "invalid-frontmatter",
        problem: `必須 frontmatter フィールド「${field}」が存在しないまたは空`,
      });
    }
  }
  for (const name of ["created", "updated"] as const) {
    const raw = fields.get(name);
    if (raw === undefined || raw === "") continue;
    if (!isValidIsoDate(stripYamlQuotes(raw))) {
      violations.push({
        kind: "invalid-frontmatter",
        problem: `frontmatter フィールド「${name}」は ISO 8601 日付（YYYY-MM-DD）とする`,
      });
    }
  }
  const statusRaw = fields.get("status");
  if (statusRaw !== undefined && statusRaw !== "") {
    const status = stripYamlQuotes(statusRaw);
    if (!ALLOWED_STATUS_VALUES.includes(status)) {
      violations.push({
        kind: "invalid-frontmatter",
        problem:
          `frontmatter フィールド「status」は ${ALLOWED_STATUS_VALUES.join(" / ")} のいずれかとする`,
      });
    }
  }
  return violations;
}

export function isExcludedDesignFile(relPath: string): boolean {
  const segments = relPath.split("/");
  const fileName = segments[segments.length - 1];
  if (fileName === "README.md") return true;
  return segments.slice(0, -1).some((s) => EXCLUDED_DIR_SEGMENTS.includes(s));
}

export function hasDetectionSignalKey(fmLines: readonly string[] | null): boolean {
  if (fmLines === null) return false;
  return fmLines.some((l) =>
    SIGNAL_KEYS.some((k) => new RegExp(`^${k}\\s*:`).test(l)),
  );
}

export const ir070: IntegrityRule = {
  id: "IR-070",
  slug: "design-frontmatter-required-keys",
  title: "design-frontmatter-required-keys",
  description:
    "docs/designs/** の Design frontmatter 必須キー（title/status/created/updated）・キー名破損・値形式を機械検査する。",
  relatedReqs: ["REQ-010-062", "REQ-010-068"],
  targetGlobs: ["docs/designs/**/*.md"],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const file of ctx.getFilesByGlob(`${DESIGNS_DIR}/**/*.md`)) {
      const relPath = file.path;
      if (isExcludedDesignFile(relPath)) continue;
      if (hasDetectionSignalKey(extractFrontmatterLines(file.rawContent))) continue;
      for (const v of findDesignFrontmatterViolations(file.rawContent)) {
        violations.push({
          ruleId: "IR-070",
          severity: "error",
          filePath: relPath,
          message: `${v.problem}（IR-070、checker-execution-contracts Design「Design frontmatter 必須キー検証観点」）`,
          remediationHint: v.kind,
        });
      }
    }
    return violations;
  },
};
