// check の9種検査（agentdev-traceability Design「公開能力 check」の実装）。
//
// 1. malformed-declarations: 不正な対応関係記述（inline 宣言の形式・構文違反 +
//    sidecar の形式・構文違反）
// 2. unknown-roles: 未知の成果物役割
// 3. unknown-req-refs: 存在しない要件行への参照（sidecar、inline declaration、
//    policy.yaml の optional 列挙を含む）
// 4. invalid-artifact-paths: 存在しない、または取得不能な artifact path
//    （sidecar 参照先のファイル不在・読取不能を含む）
// 5. missing-design: Design 対応の欠落（現行要件行で0件）
// 6. missing-implementation: 実装対応の欠落（現行要件行で0件）
// 7. missing-verification: 検証対応の欠落（policy が required と判定する現行要件行のみ）
// 8. policy-invalid: 検証スコープポリシーの不正（schema 違反、default 値不正、
//    optional 列挙の要件行 ID 形式違反、policy 読取不能）
// 9. duplicate-inconsistencies: 同一論理関係の不整合な重複（同一 artifact パス ×
//    role × 要件行 ID の組み合わせが sidecar と inline declaration の間、または
//    同一情報源内で矛盾する状態）
//
// Decision 対応の欠落は不合格に計上しない（TIM 完全性規則の任意役割）。
// policy の要否判定が実行不能な場合、または sidecar の解析が実行不能な場合、
// 対応完全性の合格を返さない（fail-closed、agentdev-traceability Design
// 「advisory 能力と品質ゲートとしての check の境界」）。

import type { DeclarationIssue } from "./declarations.ts";
import type { ScanResult } from "./corpus.ts";
import type { VerificationPolicyResolution } from "./verification_scope.ts";

export type CheckKind =
  | "malformed-declarations"
  | "unknown-roles"
  | "unknown-req-refs"
  | "invalid-artifact-paths"
  | "missing-design"
  | "missing-implementation"
  | "missing-verification"
  | "policy-invalid"
  | "duplicate-inconsistencies";

export interface CheckFinding {
  readonly file?: string;
  readonly line?: number;
  readonly reqId?: string;
  readonly artifact?: string;
  readonly reason?: string;
  readonly text?: string;
  readonly detail?: string;
}

export interface CheckResultItem {
  readonly kind: CheckKind;
  readonly status: "pass" | "fail";
  readonly findings: readonly CheckFinding[];
}

export interface CheckSummary {
  readonly pass: number;
  readonly fail: number;
}

export interface CheckReport {
  readonly checks: Readonly<Record<CheckKind, CheckResultItem>>;
  readonly summary: CheckSummary;
  /** 完全性検査（missing-*）の対象要件。all は現行要件全体を指す。 */
  readonly completenessScope: "all" | readonly string[];
  /** policy の要否判定が実行不能か（fail-closed 判定の根拠）。 */
  readonly verificationPolicyUnavailable: boolean;
}

export interface CheckOptions {
  /**
   * 完全性検査（missing-design / missing-implementation / missing-verification）
   * の対象要件ID。省略時は knownReqIds 全体（= 現行要件行全体）を対象とする。
   */
  readonly completenessReqIds?: readonly string[];
  /** 根拠検査（invalid-artifact-paths）に追加する成果物パス。 */
  readonly evidenceArtifacts?: readonly { artifact: string; reason: string }[];
  /** 検証スコープポリシーの解決結果（任意行の除外と policy-invalid 検査の入力）。 */
  readonly verificationPolicy?: VerificationPolicyResolution;
}

// 既知の意図的 fixture（malformed 宣言の見た目を持つ検出器回帰テスト行）。
// fail-closed 検証のために本物の不正宣言として埋め込まれており、実 corpus の
// 誤宣言ではないため malformed-declarations 検査から除外する。
// file 一致かつ行テキストが固有断片を含む場合のみ除外し、一般の malformed 検出は
// 弱めない。fixture の編集・削除で断片一致が失効し、免除は自動で無効化される。
const MALFORMED_DECLARATION_FIXTURE_EXEMPTIONS: readonly {
  readonly file: string;
  readonly lineIncludes: string;
}[] = [
  {
    // distribution-boundary 検出器の escape 隠蔽 fail-closed 回帰テスト行。
    file: ".opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.test.ts",
    lineIncludes: ["REQ", "-", "\\\\", "u0030", "\\\\", "u0031"].join(""),
  },
];

/**
 * malformed-declaration 検出が既知の意図的 fixture に対するものかを判定する。
 * 既知 fixture の file と行テキストの固有断片が両方一致する場合のみ true。
 */
export function isMalformedDeclarationFixtureExempt(
  file: string,
  text: string,
): boolean {
  return MALFORMED_DECLARATION_FIXTURE_EXEMPTIONS.some(
    (e) => e.file === file && text.includes(e.lineIncludes),
  );
}

function item(kind: CheckKind, findings: readonly CheckFinding[]): CheckResultItem {
  return { kind, status: findings.length === 0 ? "pass" : "fail", findings };
}

/**
 * 9種検査を実行する。scan は正規成果物の直接走査結果（sidecar 正規化分を含む）、
 * knownReqIds は現行要件行ID。verificationPolicy を省略した場合（policy 不在と同等）、
 * 全要件行が検証対応必須となる。policy の要否判定が実行不能、または sidecar の
 * 解析が実行不能な場合、対応完全性の合格を返さない（fail-closed）。
 */
export function runChecks(
  scan: ScanResult,
  knownReqIds: readonly string[],
  options: CheckOptions = {},
): CheckReport {
  const known = new Set(knownReqIds);
  const scope = options.completenessReqIds ?? knownReqIds;
  const policy = options.verificationPolicy;
  const optionalReqIds = policy?.optionalReqIds ?? new Set<string>();
  const policyUnavailable = policy?.unavailable ?? false;
  const sidecarEvaluationBlocked = scan.sidecarIssues.length > 0;

  const malformed: CheckFinding[] = scan.issues
    .filter((i): i is DeclarationIssue & { kind: "malformed-declaration" } => i.kind === "malformed-declaration")
    .filter((i) => !isMalformedDeclarationFixtureExempt(i.file, i.text))
    .map((i) => ({
      file: i.file,
      line: i.line,
      text: i.text,
      detail: i.detail,
    }));
  for (const issue of scan.sidecarIssues) {
    malformed.push({
      file: issue.file,
      ...(issue.artifact !== undefined ? { reqId: issue.artifact } : {}),
      reason: issue.reason,
      ...(issue.text !== undefined ? { text: issue.text } : {}),
      detail: issue.detail,
    });
  }
  const unknownRoles = scan.issues.filter((i): i is DeclarationIssue & { kind: "unknown-role" } => i.kind === "unknown-role")
    .map((i) => ({
      file: i.file,
      line: i.line,
      text: i.text,
      detail: i.detail,
    }));

  const unknownReqRefs: CheckFinding[] = [];
  for (const d of scan.declarations) {
    for (const reqId of d.reqIds) {
      if (!known.has(reqId)) {
        unknownReqRefs.push({ file: d.file, line: d.line, reqId });
      }
    }
  }
  for (const issue of policy?.issues ?? []) {
    if (issue.reason !== "unknown-req-ref") continue;
    unknownReqRefs.push({
      ...(policy ? { file: policy.policyFile } : {}),
      reqId: issue.reqId,
      detail: issue.detail,
    });
  }

  const artifactPathFindings: CheckFinding[] = scan.unreadableFiles.map((file) => ({
    artifact: file,
    reason: "unreadable",
  }));
  for (const missing of scan.sidecarMissingArtifacts) {
    artifactPathFindings.push({
      artifact: missing.artifact,
      reason: "sidecar-target-not-found",
      detail: `sidecar ${missing.sidecarFile} が参照する成果物が存在しない`,
    });
  }
  for (const extra of options.evidenceArtifacts ?? []) {
    artifactPathFindings.push({ artifact: extra.artifact, reason: extra.reason });
  }

  const policyInvalid: CheckFinding[] = (policy?.issues ?? [])
    .filter((issue) => issue.reason !== "unknown-req-ref")
    .map((issue) => ({
      ...(policy ? { file: policy.policyFile } : {}),
      reason: issue.reason,
      text: issue.text,
      detail: issue.detail,
    }));

  const missingDesign: CheckFinding[] = [];
  const missingImplementation: CheckFinding[] = [];
  const missingVerification: CheckFinding[] = [];
  for (const reqId of scope) {
    if (!scan.declarations.some((d) => d.role === "design" && d.reqIds.includes(reqId))) {
      missingDesign.push({ reqId });
    }
    if (!scan.declarations.some((d) => d.role === "implementation" && d.reqIds.includes(reqId))) {
      missingImplementation.push({ reqId });
    }
    if (
      !optionalReqIds.has(reqId) &&
      !scan.declarations.some((d) => d.role === "verification" && d.reqIds.includes(reqId))
    ) {
      missingVerification.push({ reqId });
    }
  }
  if (sidecarEvaluationBlocked) {
    // sidecar の対応関係を取り込めないため現行スキャンの completeness は不完全。
    // 合格を返さない（fail-closed、完全性判定不能を合格として扱わない）。
    const blocked: CheckFinding = {
      reason: "sidecar-evaluation-blocked",
      detail: "sidecar の解析が実行不能なため対応完全性を判定できない（fail-closed）",
    };
    missingDesign.push(blocked);
    missingImplementation.push(blocked);
    missingVerification.push({ ...blocked });
  }
  if (policyUnavailable) {
    // 検証対応要否の判定が不能。missing-verification を合格としない（fail-closed）。
    missingVerification.push({
      reason: "policy-evaluation-unavailable",
      detail: "検証スコープポリシーの解決が実行不能なため検証対応の要否を判定できない（fail-closed）",
    });
  }

  const duplicateFindings = detectDuplicateInconsistencies(scan);

  const checks: Record<CheckKind, CheckResultItem> = {
    "malformed-declarations": item("malformed-declarations", malformed),
    "unknown-roles": item("unknown-roles", unknownRoles),
    "unknown-req-refs": item("unknown-req-refs", unknownReqRefs),
    "invalid-artifact-paths": item("invalid-artifact-paths", artifactPathFindings),
    "missing-design": item("missing-design", missingDesign),
    "missing-implementation": item("missing-implementation", missingImplementation),
    "missing-verification": item("missing-verification", missingVerification),
    "policy-invalid": item("policy-invalid", policyInvalid),
    "duplicate-inconsistencies": item("duplicate-inconsistencies", duplicateFindings),
  };

  const values = Object.values(checks);
  const summary: CheckSummary = {
    pass: values.filter((v) => v.status === "pass").length,
    fail: values.filter((v) => v.status === "fail").length,
  };
  return {
    checks,
    summary,
    completenessScope: options.completenessReqIds ?? "all",
    verificationPolicyUnavailable: policyUnavailable,
  };
}

/**
 * 同一論理関係（artifact パス × role）を複数情報源（sidecar ファイル、inline ファイル）
 * が保持する場合、情報源ごとの要件行 ID 集合が一致しなければ不整合な重複として検出する。
 * 同一情報源内の複数宣言行は和集合に集約され、整合する重複は正規化して1論理関係として扱う。
 */
function detectDuplicateInconsistencies(
  scan: ScanResult,
): CheckFinding[] {
  const byKey = new Map<string, Map<string, Set<string>>>();
  for (const d of scan.declarations) {
    const key = `${d.file}\u0000${d.role}`;
    let bySource = byKey.get(key);
    if (bySource === undefined) {
      bySource = new Map();
      byKey.set(key, bySource);
    }
    let set = bySource.get(d.sourceFile);
    if (set === undefined) {
      set = new Set();
      bySource.set(d.sourceFile, set);
    }
    for (const reqId of d.reqIds) set.add(reqId);
  }
  const findings: CheckFinding[] = [];
  for (const [key, bySource] of byKey) {
    if (bySource.size < 2) continue;
    const sets = [...bySource.values()];
    const union = new Set<string>();
    for (const set of sets) {
      for (const reqId of set) union.add(reqId);
    }
    if (sets.every((s) => s.size === union.size)) continue;
    const [artifact, role] = key.split("\u0000");
    findings.push({
      artifact,
      reason: role,
      detail: `同一論理関係（artifact パス × role）の対応宣言が複数情報源で矛盾（情報源: ${[...bySource.keys()].sort().join(", ")}）`,
    });
  }
  return findings.sort((a, b) =>
    (a.artifact ?? "") === (b.artifact ?? "") ? (a.reason ?? "").localeCompare(b.reason ?? "") : (a.artifact ?? "").localeCompare(b.artifact ?? ""),
  );
}
