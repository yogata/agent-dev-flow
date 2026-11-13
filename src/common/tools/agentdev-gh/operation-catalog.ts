// agentdev-gh Custom Tool の操作定義単一正本（操作一覧・副作用分類・共通入力検査）。
//
// Design `docs/designs/responsibilities/custom-tool-contracts.md`
// 「対象操作の境界（初期セット）」節の一元化条項（B3-5c）に従い、
// 操作名称、副作用分類（side-effect / read-only）、操作ごとの入力フィールド宣言
// （許容フィールド、必須、型、enum 値域）を本モジュールの単一テーブルのみで所有する。
// contracts.ts（操作カタログ・公開型）、public-schema.ts（公開スキーマの enum と
// 説明文列挙）、specs-issue.ts / specs-pr.ts / specs-release.ts（共通入力検査）は
// 本テーブルから派生する。操作の追加は本テーブル1箇所の更新だけで全利用側へ反映される。
//
// 各スペックが所有する操作ごとの差分（空更新検査、承認根拠の形式検査、runner 要求の
// 組立て、応答解釈、読み戻し照合）は本テーブルの対象外であり、specs が所有し続ける。
//
// 意味契約の正（操作名の意味、入出力契約、fail-closed）は Design と contracts.ts が
// 所有する。本テーブルは操作一覧と定型入力検査の機械可読な配置正本である。

/** 操作の副作用分類（正本上の値）。side-effect 操作は VERIFY（読み戻し）を必須とする。 */
export type OperationKindName = "side-effect" | "read-only";

/** 宣言可能な入力フィールド型。 */
export type OperationFieldType =
  | /** 任意の文字列（空文字列を含む） */
    "string"
  /** 非空文字列 */
  | "nonempty-string"
  /** 正整数 */
  | "positive-int"
  /** 文字列の配列 */
  | "string-array"
  /** boolean */
  | "boolean"
  /** 列挙値域（enumValues） */
  | "enum";

/** 操作入力フィールドの宣言。`operation` フィールド自身を除く入力フィールド。 */
export interface OperationFieldDecl {
  readonly name: string;
  readonly required: boolean;
  readonly type: OperationFieldType;
  /** type: "enum" の場合の許容値。 */
  readonly enumValues?: readonly string[];
}

/** 生要求がオブジェクトでない場合に返す構造化エラー（操作群ごとの現行様式を維持）。 */
export interface NonRecordOutcome {
  readonly field: string;
  readonly detail: string;
}

/** 操作定義のエントリ（正本テーブルの1行）。 */
export interface OperationDefinition {
  readonly operation: string;
  readonly kind: OperationKindName;
  readonly fields: readonly OperationFieldDecl[];
  /** raw がオブジェクトでない場合の構造化エラー。 */
  readonly nonRecord: NonRecordOutcome;
}

/** フィールド宣言の簡記ヘルパー。 */
function f(
  name: string,
  required: boolean,
  type: OperationFieldType,
  enumValues?: readonly string[],
): OperationFieldDecl {
  return { name, required, type, ...(enumValues !== undefined ? { enumValues } : {}) };
}

// 操作群ごとの not-a-record 様式（現行の specs 実装の構造化エラーを正本へ移管）。
const nonRecordFor = (operation: string, field: string): NonRecordOutcome => ({
  field,
  detail: `required field '${field}' is missing for ${operation}`,
});

/**
 * 操作定義の単一正本テーブル（20操作。Design 対象操作の境界の機械可読配置）。
 * 操作の追加・削除・入力契約の変更は本テーブルのみを更新する。
 */
export const GH_TOOL_OPERATION_DEFINITIONS = [
  // 基本操作（Issue 系）
  {
    operation: "issue_create",
    kind: "side-effect",
    fields: [
      f("title", true, "nonempty-string"),
      f("body", true, "nonempty-string"),
      f("labels", true, "string-array"),
      f("role", false, "enum", ["tracking", "case"]),
    ],
    nonRecord: nonRecordFor("issue_create", "operation"),
  },
  {
    operation: "issue_read",
    kind: "read-only",
    fields: [f("number", true, "positive-int")],
    nonRecord: nonRecordFor("issue_read", "operation"),
  },
  {
    operation: "issue_update",
    kind: "side-effect",
    fields: [
      f("number", true, "positive-int"),
      f("title", false, "nonempty-string"),
      f("body", false, "nonempty-string"),
      f("labels", false, "string-array"),
    ],
    nonRecord: nonRecordFor("issue_update", "operation"),
  },
  {
    operation: "issue_close",
    kind: "side-effect",
    fields: [
      f("number", true, "positive-int"),
      f("reason", false, "enum", ["completed", "not_planned"]),
    ],
    nonRecord: nonRecordFor("issue_close", "operation"),
  },
  // 基本操作（PR 系）
  {
    operation: "pr_create",
    kind: "side-effect",
    fields: [
      f("title", true, "nonempty-string"),
      f("body", true, "string"),
      f("base", true, "nonempty-string"),
      f("head", true, "nonempty-string"),
      f("number", false, "positive-int"),
    ],
    nonRecord: nonRecordFor("pr_create", "number"),
  },
  {
    operation: "pr_read",
    kind: "read-only",
    fields: [f("number", true, "positive-int")],
    nonRecord: nonRecordFor("pr_read", "number"),
  },
  {
    operation: "pr_merge",
    kind: "side-effect",
    fields: [
      f("number", true, "positive-int"),
      f("method", true, "enum", ["merge", "squash", "rebase"]),
      f("commitHash", false, "nonempty-string"),
    ],
    nonRecord: nonRecordFor("pr_merge", "number"),
  },
  {
    operation: "pr_changed_files",
    kind: "read-only",
    fields: [f("number", true, "positive-int")],
    nonRecord: nonRecordFor("pr_changed_files", "number"),
  },
  {
    operation: "pr_mergeable",
    kind: "read-only",
    fields: [f("number", true, "positive-int")],
    nonRecord: nonRecordFor("pr_mergeable", "number"),
  },
  {
    operation: "pr_update",
    kind: "side-effect",
    fields: [
      f("number", true, "positive-int"),
      f("title", false, "nonempty-string"),
      f("body", false, "string"),
    ],
    nonRecord: nonRecordFor("pr_update", "number"),
  },
  // 追跡Issue操作
  {
    operation: "issue_list",
    kind: "read-only",
    fields: [
      f("role", false, "enum", ["tracking", "case"]),
      f("state", false, "enum", ["open", "closed"]),
      f("labels", false, "string-array"),
      f("search", false, "nonempty-string"),
    ],
    nonRecord: nonRecordFor("issue_list", "operation"),
  },
  {
    operation: "issue_reopen",
    kind: "side-effect",
    fields: [f("number", true, "positive-int")],
    nonRecord: nonRecordFor("issue_reopen", "operation"),
  },
  // Comment 操作（Comment は Issue と PR の会話コメントの共通論理リソース）
  {
    operation: "comment_create",
    kind: "side-effect",
    fields: [
      f("number", true, "positive-int"),
      f("body", true, "nonempty-string"),
    ],
    nonRecord: nonRecordFor("comment_create", "operation"),
  },
  {
    operation: "comment_list",
    kind: "read-only",
    fields: [f("number", true, "positive-int")],
    nonRecord: nonRecordFor("comment_list", "operation"),
  },
  {
    operation: "comment_update",
    kind: "side-effect",
    fields: [
      f("commentId", true, "nonempty-string"),
      f("body", true, "nonempty-string"),
    ],
    nonRecord: nonRecordFor("comment_update", "operation"),
  },
  {
    operation: "comment_delete",
    kind: "side-effect",
    fields: [f("commentId", true, "nonempty-string")],
    nonRecord: nonRecordFor("comment_delete", "operation"),
  },
  // Release 操作（GitHub 接続専用）
  {
    operation: "release_create",
    kind: "side-effect",
    fields: [
      f("tagName", true, "nonempty-string"),
      f("title", true, "nonempty-string"),
      f("body", true, "string"),
      f("prerelease", true, "boolean"),
    ],
    nonRecord: nonRecordFor("release_create", "tagName"),
  },
  {
    operation: "release_list",
    kind: "read-only",
    fields: [],
    nonRecord: { field: "operation", detail: "request must be an object with an operation field" },
  },
  {
    operation: "release_read",
    kind: "read-only",
    fields: [f("tagName", true, "nonempty-string")],
    nonRecord: nonRecordFor("release_read", "tagName"),
  },
  {
    operation: "release_publish",
    kind: "side-effect",
    fields: [
      f("tagName", true, "nonempty-string"),
      f("approvalBasis", true, "nonempty-string"),
    ],
    nonRecord: nonRecordFor("release_publish", "tagName"),
  },
] as const satisfies readonly OperationDefinition[];

/** 操作名の型（正本テーブルから派生）。 */
export type GhToolOperationName = (typeof GH_TOOL_OPERATION_DEFINITIONS)[number]["operation"];

/** 操作名一覧（正本テーブルから派生。contracts.ts が再公開する）。 */
export const GH_TOOL_OPERATION_NAMES: readonly GhToolOperationName[] =
  GH_TOOL_OPERATION_DEFINITIONS.map((d) => d.operation);

/** 操作名から正本定義を引く。 */
export function operationDefinition(
  operation: string,
): OperationDefinition | undefined {
  return GH_TOOL_OPERATION_DEFINITIONS.find((d) => d.operation === operation);
}

/** 共通入力検査の構造化エラー（engine.ts の InputContractError と構造互換）。 */
export type DeclaredInputViolation = {
  readonly ok: false;
  readonly error: {
    readonly code: "unknown-field" | "missing-field" | "invalid-field";
    readonly field: string;
    readonly detail: string;
  };
};

function violation(
  code: "unknown-field" | "missing-field" | "invalid-field",
  field: string,
  detail: string,
): DeclaredInputViolation {
  return { ok: false, error: { code, field, detail } };
}

function declaredTypeCheck(
  field: OperationFieldDecl,
  value: unknown,
): DeclaredInputViolation | null {
  switch (field.type) {
    case "string":
      if (typeof value !== "string") {
        return violation("invalid-field", field.name, `${field.name} must be a string`);
      }
      return null;
    case "nonempty-string":
      if (typeof value !== "string" || value.length === 0) {
        return violation(
          "invalid-field",
          field.name,
          `${field.name} must be a non-empty string`,
        );
      }
      return null;
    case "positive-int":
      if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
        return violation(
          "invalid-field",
          field.name,
          `${field.name} must be a positive integer`,
        );
      }
      return null;
    case "string-array":
      if (
        !Array.isArray(value) ||
        !value.every((l) => typeof l === "string")
      ) {
        return violation(
          "invalid-field",
          field.name,
          `${field.name} must be an array of strings`,
        );
      }
      return null;
    case "boolean":
      if (typeof value !== "boolean") {
        return violation("invalid-field", field.name, `${field.name} must be a boolean`);
      }
      return null;
    case "enum":
      if (
        typeof value !== "string" ||
        !(field.enumValues ?? []).includes(value)
      ) {
        return violation(
          "invalid-field",
          field.name,
          `${field.name} must be one of: ${(field.enumValues ?? []).join(", ")}`,
        );
      }
      return null;
  }
}

/**
 * 共通入力検査（定型入力検査の正本実装）。全操作スペックの validate が最初に
 * 呼び出す。正本テーブルの入力フィールド宣言から、契約外フィールド、必須欠落、
 * 型・値域違反を構造化エラーとして検出する。null は定型検査の通過を意味し、
 * 呼出側スペックが操作固有の差分検査（空更新、承認根拠の形式等）と要求の組立てを
 * 続行する。操作の模擬追加では本関数が正本テーブルの宣言のみから当該操作の
 * 定型検査を提供する（specs の個別更新を要しない）。
 */
export function validateOperationInput(
  operation: string,
  raw: unknown,
): DeclaredInputViolation | null {
  const def = operationDefinition(operation);
  if (def === undefined) return null;
  if (typeof raw !== "object" || raw === null) {
    return violation("missing-field", def.nonRecord.field, def.nonRecord.detail);
  }
  const record = raw as Record<string, unknown>;
  const allowed = new Set<string>(["operation", ...def.fields.map((fd) => fd.name)]);
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) {
      return violation(
        "unknown-field",
        key,
        `field '${key}' is not part of the ${operation} input contract`,
      );
    }
  }
  for (const field of def.fields) {
    if (record[field.name] === undefined) {
      if (field.required) {
        return violation(
          "missing-field",
          field.name,
          `required field '${field.name}' is missing for ${operation}`,
        );
      }
      continue;
    }
    const typeError = declaredTypeCheck(field, record[field.name]);
    if (typeError !== null) return typeError;
  }
  return null;
}
