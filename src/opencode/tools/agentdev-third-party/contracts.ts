// agentdev_third_party Custom Tool の操作契約。
//
// 本ファイルは Design `docs/designs/responsibilities/custom-tool-contracts.md`
// の「third-party Skill 取得」操作契約（入力、出力、保証、失敗時の意味）を
// 型と操作カタログとして公開する。取得プロファイル（判定、正規化、再帰取得、
// 相対構造保持、Skill ディレクトリ外非取得）の正は Design
// `docs/designs/local/third-party-skill-management.md` である。
//
// 保証: 取得結果の検証（読み戻し）後に成功を返す。取得開始前に存在した
// 正常な配置を取得失敗時に破壊しない。機構管理外の既存配置を無断で
// 上書きしない。
//
// 失敗: 失敗を成功扱いとしない。部分取得状態を開始前状態へ解消し、
// 失敗要因を報告する。


export const TP_TOOL_OPERATIONS = ["acquire"] as const;

export type TpOperation = (typeof TP_TOOL_OPERATIONS)[number];

/** 操作の副作用分類。side-effect 操作は VERIFY（読み戻し）を必須とする。 */
export type OperationKind = "side-effect" | "read-only";

/**
 * 補助能力の継続契約。acquire は副作用操作のため fail-closed
 * （canContinue: false、代替手段なし）。宣言の確認等は read-only として
 * 代替手段を案内する。
 */
export interface CapabilityContingency {
  readonly fallbacks: readonly string[];
  readonly canContinue: boolean;
}

/** 操作カタログのエントリ。契約メタデータのみを保持する。 */
export interface OperationCatalogEntry {
  readonly operation: TpOperation;
  readonly kind: OperationKind;
  readonly contingency: CapabilityContingency;
}

const ACQUIRE_CONTINGENCY: CapabilityContingency = {
  fallbacks: [],
  canContinue: false,
};

/** 操作カタログ。 */
export const TP_TOOL_OPERATION_CATALOG: readonly OperationCatalogEntry[] = [
  { operation: "acquire", kind: "side-effect", contingency: ACQUIRE_CONTINGENCY },
];

/** fail-closed 4異常系と運用上の失敗種別（agentdev_gh と同一構造）。 */
export type TpFailureKind =
  | "config-uninterpretable"
  | "path-unresolvable"
  | "enforcement-crashed"
  | "verification-incomplete"
  | "operation-failed"
  | "invalid-input";

/** 失敗の意味。エラー種別と再試行可否を返す（Design「失敗」要素）。 */
export interface TpFailure {
  readonly kind: TpFailureKind;
  readonly retryable: boolean;
  readonly detail: string;
  readonly contingency: CapabilityContingency;
}

/** 操作要求（入力）。構造化引数のみで、環境依存の引数運用規則を含まない。 */
export type TpRequest = {
  readonly operation: "acquire";
  /** 対象 Skill 名。省略時は宣言の全件。 */
  readonly skill?: string;
  /** dry-run 指定。実行せず取得計画（対象一覧、配置先、衝突検出）を返す。 */
  readonly dryRun?: boolean;
};

/** 取得プロファイル。 */
export type AcquisitionProfile = "single-file" | "directory";

/** 対象一覧のエントリ（計画表示と結果報告の双方で使用）。 */
export interface PlannedTarget {
  readonly name: string;
  readonly source: string;
  readonly profile: AcquisitionProfile;
  /** 配置先パス（.opencode/skills/<name>/）。 */
  readonly placementPath: string;
  /** 既存配置の管理区分。 */
  readonly existing: "absent" | "managed" | "unmanaged";
}

/** 管理外衝突の検出状況。 */
export interface UnmanagedConflict {
  readonly name: string;
  readonly placementPath: string;
  readonly detail: string;
}

/**
 * 対象ごとの取得結果。取得成否、配置パス、実施内容を含む。
 * refused-unmanaged は「機構管理外の既存配置を無断で上書きしない」保護であり、
 * skip 成功ではなく失敗として報告する。
 */
export interface TargetResult {
  readonly name: string;
  readonly ok: boolean;
  readonly action: "acquired" | "updated" | "planned" | "refused-unmanaged" | "failed";
  readonly placementPath: string;
  readonly fileCount: number;
  readonly failure: string | null;
}

/** 取得結果報告（出力）。対象一覧、取得成否、配置パス、管理外衝突の検出状況。 */
export interface AcquireReport {
  readonly operation: "acquire";
  readonly dryRun: boolean;
  readonly targets: readonly PlannedTarget[];
  readonly results: readonly TargetResult[];
  readonly conflicts: readonly UnmanagedConflict[];
  readonly summary: {
    readonly requested: number;
    readonly succeeded: number;
    readonly failed: number;
    readonly refused: number;
  };
}

/** 操作成功（出力）。 */
export type TpSuccess = {
  readonly operation: "acquire";
  readonly report: AcquireReport;
};

/** 操作結果（保証と失敗を型で強制する）。失敗時も対象別明細（report）を報告する。 */
export type TpResult =
  | { readonly ok: true; readonly success: TpSuccess }
  | { readonly ok: false; readonly failure: TpFailure; readonly report?: AcquireReport };
