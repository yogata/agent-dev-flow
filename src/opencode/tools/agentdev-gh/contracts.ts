// agentdev-gh Custom Tool の操作契約（種別契約 REQ、決定4・6）。
//
// 本ファイルは Design `docs/designs/responsibilities/custom-tool-contracts.md`
// が所有する操作契約の構成要素（入力、出力、保証、失敗時の意味）を型と
// 操作カタログとして公開する。ツール名・公開単位・ファイル構成の詳細は
// 同 Design の所有事項である。
//
// 保証: 副作用操作は操作の結果を検証（読み戻し）してから成功を返す。
// 検証は engine.ts が所有し、各操作の読み戻し照合は specs が定義する。
//
// 失敗: 設定解釈不能、パス解決不能、強制処理異常終了、必須検証未了の
// いずれかの場合、対象副作用を実行せず成功扱いとしない（fail-closed）。


/** Issue 番号（GitHub Issue の識別数値）。PrNumber と型上の混入を防ぐ。 */
export type IssueNumber = number & { readonly __brand: "IssueNumber" };

/** PR 番号（GitHub Pull Request の識別数値）。IssueNumber と型上の混入を防ぐ。 */
export type PrNumber = number & { readonly __brand: "PrNumber" };

/** Issue 番号の構築（境界でのみ使用）。 */
export function issueNumber(n: number): IssueNumber {
  if (!Number.isInteger(n) || n <= 0) {
    throw new RangeError(`invalid issue number: ${n}`);
  }
  return n as IssueNumber;
}

/** PR 番号の構築（境界でのみ使用）。 */
export function prNumber(n: number): PrNumber {
  if (!Number.isInteger(n) || n <= 0) {
    throw new RangeError(`invalid pr number: ${n}`);
  }
  return n as PrNumber;
}

/** 操作名（初期セット。Design「対象操作の境界（初期セット）」が所有）。 */
export const GH_TOOL_OPERATIONS = [
  "issue_create",
  "issue_read",
  "issue_update",
  "issue_comment",
  "issue_close",
  "pr_create",
  "pr_read",
  "pr_merge",
  "pr_changed_files",
  "pr_mergeable",
] as const;

export type GhToolOperation = (typeof GH_TOOL_OPERATIONS)[number];

/** 操作の副作用分類。side-effect 操作は VERIFY（読み戻し）を必須とする。 */
export type OperationKind = "side-effect" | "read-only";

/**
 * 補助能力の継続契約。
 *
 * 能力が失敗したとき、利用者が代替手段へ継続できるかをこの契約が定義する。
 * 副作用操作は fail-closed（canContinue: false）、読み取り操作は代替手段を
 * 案内して継続できる（canContinue: true）。
 */
export interface CapabilityContingency {
  /** 代替手段の説明。存在しない場合は空配列。 */
  readonly fallbacks: readonly string[];
  /** 当該能力の喪失時に処理を継続できるか。 */
  readonly canContinue: boolean;
}

/** 操作カタログのエントリ。契約メタデータのみを保持する。 */
export interface OperationCatalogEntry {
  readonly operation: GhToolOperation;
  readonly kind: OperationKind;
  readonly contingency: CapabilityContingency;
}

const SIDE_EFFECT_CONTINGENCY: CapabilityContingency = {
  fallbacks: [],
  canContinue: false,
};

const READ_CONTINGENCY: CapabilityContingency = {
  fallbacks: ["gh CLI（読み取り系）の手動実行", "GitHub Web UI での確認"],
  canContinue: true,
};

function sideEffect(operation: GhToolOperation): OperationCatalogEntry {
  return { operation, kind: "side-effect", contingency: SIDE_EFFECT_CONTINGENCY };
}

function readOnly(operation: GhToolOperation): OperationCatalogEntry {
  return { operation, kind: "read-only", contingency: READ_CONTINGENCY };
}

/** 操作カタログ（Design の初期セットに対応）。 */
export const GH_TOOL_OPERATION_CATALOG: readonly OperationCatalogEntry[] = [
  sideEffect("issue_create"),
  readOnly("issue_read"),
  sideEffect("issue_update"),
  sideEffect("issue_comment"),
  sideEffect("issue_close"),
  sideEffect("pr_create"),
  readOnly("pr_read"),
  sideEffect("pr_merge"),
  readOnly("pr_changed_files"),
  readOnly("pr_mergeable"),
];

/** fail-closed 4異常系と運用上の失敗種別。 */
export type GhToolFailureKind =
  | "config-uninterpretable"
  | "path-unresolvable"
  | "enforcement-crashed"
  | "verification-incomplete"
  | "operation-failed"
  | "invalid-input";

/** 失敗の意味。エラー種別と再試行可否を返す（Design「失敗」要素）。 */
export interface GhToolFailure {
  readonly kind: GhToolFailureKind;
  readonly retryable: boolean;
  readonly detail: string;
  /** 当該操作の継続契約。 */
  readonly contingency: CapabilityContingency;
}

/** 操作要求（入力）。構造化引数のみで、環境依存の引数運用規則を含まない。 */
export type GhToolRequest =
  | {
      readonly operation: "issue_create";
      readonly title: string;
      readonly body: string;
      readonly labels: readonly string[];
    }
  | { readonly operation: "issue_read"; readonly number: IssueNumber }
  | {
      readonly operation: "issue_update";
      readonly number: IssueNumber;
      readonly title?: string;
      readonly body?: string;
    }
  | {
      readonly operation: "issue_comment";
      readonly number: IssueNumber;
      readonly body: string;
    }
  | {
      readonly operation: "issue_close";
      readonly number: IssueNumber;
      readonly reason?: "completed" | "not_planned";
    }
  | {
      readonly operation: "pr_create";
      readonly title: string;
      readonly body: string;
      readonly base: string;
      readonly head: string;
      readonly draft?: boolean;
    }
  | { readonly operation: "pr_read"; readonly number: PrNumber }
  | {
      readonly operation: "pr_merge";
      readonly number: PrNumber;
      readonly method: "merge" | "squash" | "rebase";
    }
  | { readonly operation: "pr_changed_files"; readonly number: PrNumber }
  | { readonly operation: "pr_mergeable"; readonly number: PrNumber };

/** 操作成功（出力）。構造化結果（番号、URL 等）のみを公開する。 */
export type GhToolSuccess =
  | {
      readonly operation: "issue_create";
      readonly number: IssueNumber;
      readonly url: string;
    }
  | {
      readonly operation: "issue_read";
      readonly number: IssueNumber;
      readonly title: string;
      readonly body: string;
      readonly state: "open" | "closed";
    }
  | {
      readonly operation: "issue_update";
      readonly number: IssueNumber;
      readonly url: string;
    }
  | {
      readonly operation: "issue_comment";
      readonly number: IssueNumber;
      readonly url: string;
    }
  | {
      readonly operation: "issue_close";
      readonly number: IssueNumber;
      readonly state: "closed";
    }
  | {
      readonly operation: "pr_create";
      readonly number: PrNumber;
      readonly url: string;
    }
  | {
      readonly operation: "pr_read";
      readonly number: PrNumber;
      readonly title: string;
      readonly state: "open" | "closed" | "merged";
      readonly mergeable: "MERGEABLE" | "CONFLICTING" | "UNKNOWN";
    }
  | {
      readonly operation: "pr_merge";
      readonly number: PrNumber;
      readonly merged: true;
    }
  | {
      readonly operation: "pr_changed_files";
      readonly number: PrNumber;
      readonly files: readonly string[];
    }
  | {
      readonly operation: "pr_mergeable";
      readonly number: PrNumber;
      readonly mergeable: "MERGEABLE" | "CONFLICTING" | "UNKNOWN";
    };

/** 操作結果（保証と失敗を型で強制する）。 */
export type GhToolResult =
  | { readonly ok: true; readonly success: GhToolSuccess }
  | { readonly ok: false; readonly failure: GhToolFailure };
