// 検証スコープポリシー（traceability/policy.yaml）の読み込みと解決
// （agentdev-traceability Design「公開能力 check」、v4-traceability-model
// Design「completeness の 2 層」節の実装側）。
//
// - ポリシーの正規情報源はリポジトリ top-level の traceability/policy.yaml
// - 未指定の要件行は検証対応必須（default は required 固定）。検証対応を任意とする
//   要件行は policy への明示登録（optional 列挙）によってのみ宣言する
// - policy.yaml が存在しない場合は空の解決結果を返し、全現行要件行が
//   検証対応必須として扱われる（未指定 = required の安全側既定。
//   実行時エラーで停止しない）
// - policy.yaml が読取不能・YAML 解析不能・schema 不適合の場合は issue を報告し
//   unavailable: true を返す（check は要否判定不能を合格として扱わない、fail-closed）
// - YAML 解析は保証サブセット（anchor、alias、カスタムタグ、
//   複数ドキュメントを除く）に従い標準 API（Bun.YAML.parse）へ委譲する
//
// 本モジュールは解析のみを担い、検査（check.ts）や CLI（../src/）から分離している。

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_POLICY_FILE = "traceability/policy.yaml";

const REQ_LINE_RE = /^REQ-\d{3,4}-\d{3}$/;

export type VerificationPolicyIssueReason =
  | "unreadable-policy"
  | "invalid-syntax"
  | "invalid-schema"
  | "unknown-req-ref";

export interface VerificationPolicyIssue {
  readonly reason: VerificationPolicyIssueReason;
  readonly reqId: string | undefined;
  readonly text: string;
  readonly detail: string;
}

export interface VerificationPolicyResolution {
  /** policy.yaml のリポジトリ相対パス（未解決時も既定パス）。 */
  readonly policyFile: string;
  /** 検証対応任意行（policy 明示登録行）の要件行ID集合。 */
  readonly optionalReqIds: ReadonlySet<string>;
  /** policy の無効な内容・参照（check の policy-invalid / unknown-req-refs 検査の入力）。 */
  readonly issues: readonly VerificationPolicyIssue[];
  /** 要否判定が実行不能か（読取不能・解析不能・schema 不適合）。 */
  readonly unavailable: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * policy.yaml 本文を解析する。schema:
 *
 *   verification:
 *     default: required
 *     optional:
 *       - REQ-{NNNN}-{MMM}
 *
 * トップレベルキーは verification のみ。verification 配下のキーは default と
 * optional のみ（それ以外のキーは schema 違反）。default は省略時 required、
 * 存在する場合は文字列 required のみ。optional は要件行 ID 形式の文字列配列。
 */
export function parseVerificationPolicy(content: string): {
  optionalReqIds: ReadonlySet<string>;
  issues: readonly VerificationPolicyIssue[];
  unavailable: boolean;
} {
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(content);
  } catch (error) {
    return {
      optionalReqIds: new Set(),
      issues: [
        {
          reason: "invalid-syntax",
          reqId: undefined,
          text: content.slice(0, 200),
          detail: `policy.yaml の YAML 解析に失敗した（${error instanceof Error ? error.message : "unknown error"}）`,
        },
      ],
      unavailable: true,
    };
  }
  const issues: VerificationPolicyIssue[] = [];
  const optional = new Set<string>();
  const schemaIssue = (text: string, detail: string) =>
    issues.push({ reason: "invalid-schema", reqId: undefined, text, detail });
  if (!isRecord(parsed)) {
    schemaIssue(content.slice(0, 200), "policy.yaml の内容はトップレベルに verification キーを持つマッピング");
    return { optionalReqIds: optional, issues, unavailable: true };
  }
  for (const key of Object.keys(parsed)) {
    if (key !== "verification") {
      schemaIssue(key, `未知のトップレベルキー（許容: verification のみ）`);
    }
  }
  const verification = parsed["verification"];
  if (!isRecord(verification)) {
    schemaIssue("verification", "verification キーの値は default と optional を持つマッピング");
    return { optionalReqIds: optional, issues, unavailable: true };
  }
  for (const key of Object.keys(verification)) {
    if (key !== "default" && key !== "optional") {
      schemaIssue(key, "verification 配下の未知のキー（許容: default / optional のみ）");
    }
  }
  const defaultValue = verification["default"];
  if (defaultValue !== undefined && defaultValue !== "required") {
    schemaIssue(
      typeof defaultValue === "string" ? defaultValue : JSON.stringify(defaultValue),
      "verification.default は文字列 required のみ（検証対応任意は optional への明示登録で宣言する）",
    );
  }
  const optionalValue = verification["optional"];
  if (optionalValue !== undefined) {
    if (!Array.isArray(optionalValue)) {
      schemaIssue(String(optionalValue), "verification.optional は要件行 ID の配列");
    } else {
      for (const reqId of optionalValue) {
        if (typeof reqId !== "string" || !REQ_LINE_RE.test(reqId)) {
          schemaIssue(
            typeof reqId === "string" ? reqId : String(reqId),
            "verification.optional の要素は REQ-{NNNN}-{MMM} 形式の要件行 ID",
          );
          continue;
        }
        optional.add(reqId);
      }
    }
  }
  return { optionalReqIds: optional, issues, unavailable: issues.length > 0 };
}

/**
 * root 配下の既定パスから policy.yaml を読み込み、検証対応任意行集合を解決する。
 * policy.yaml が存在しない場合は空の解決結果を返す（全現行要件行が検証対応必須 =
 * policy 機構導入前と同一の挙動。実行時エラーで停止しない）。
 * 存在するが読み取れない場合は unreadable-policy を報告し unavailable: true。
 * optional 列挙の未知の要件行は unknown-req-ref を報告し、当該 ID は
 * optionalReqIds から除外する（安全側: 該当行は検証対応必須のまま）。
 */
export function resolveVerificationPolicyFromRoot(
  root: string,
  knownReqIds: readonly string[],
  policyPath: string = DEFAULT_POLICY_FILE,
): VerificationPolicyResolution {
  const full = join(root, policyPath);
  let stat;
  try {
    stat = statSync(full);
  } catch {
    return { policyFile: policyPath, optionalReqIds: new Set(), issues: [], unavailable: false };
  }
  if (!stat.isFile()) {
    return {
      policyFile: policyPath,
      optionalReqIds: new Set(),
      issues: [
        {
          reason: "unreadable-policy",
          reqId: undefined,
          text: policyPath,
          detail: "traceability/policy.yaml は通常ファイルとして読み取れない",
        },
      ],
      unavailable: true,
    };
  }
  let content: string;
  try {
    content = readFileSync(full, "utf-8");
  } catch {
    return {
      policyFile: policyPath,
      optionalReqIds: new Set(),
      issues: [
        {
          reason: "unreadable-policy",
          reqId: undefined,
          text: policyPath,
          detail: "traceability/policy.yaml を読み取れない",
        },
      ],
      unavailable: true,
    };
  }
  const parsed = parseVerificationPolicy(content);
  const known = new Set(knownReqIds);
  const issues: VerificationPolicyIssue[] = [...parsed.issues];
  const optional = new Set<string>();
  for (const reqId of parsed.optionalReqIds) {
    if (!known.has(reqId)) {
      issues.push({
        reason: "unknown-req-ref",
        reqId,
        text: reqId,
        detail: "policy.yaml の optional 列挙が参照する要件行が現行要件として存在しない",
      });
      continue;
    }
    optional.add(reqId);
  }
  return {
    policyFile: policyPath,
    optionalReqIds: optional,
    issues,
    unavailable: parsed.unavailable,
  };
}
