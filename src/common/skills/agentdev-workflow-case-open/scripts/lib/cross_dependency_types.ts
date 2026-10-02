//
// Case 投入時の横断依存検査（case-open STEP-5 / case-ready トレーサビリティ完全性ゲート）の
// 入力・報告契約の型定義。共通契約の正規所有はワークフロー契約 Design
// 「Case 投入時の横断依存検査契約」節である。本モジュールは型と正規化のみを担い、
// 比較ロジックは cross_dependency_engine.ts、共有領域登録状態の読取は
// shared_area_registration.ts が所有する。
//
// 一般化境界: 本モジュールは特定プロジェクトの具体パスを参照しない。
// 共有領域の実パスは入力（project-extensions の context 等でプロジェクト側が
// 解決した値）から与える。

/** 検査の実行モード。case-open は draft の artifact_actions を、case-ready は
 *  canonical Definition（execution contract）を検出源とする。 */
export type InspectionMode = "case-open" | "case-ready";

/** 共有領域の登録状態の読取方式。 */
export type SharedAreaKind =
  | "req-row-list"
  | "adf-covers-declarations"
  | "req-row-mentions";

/** 検査対象populationの個別 Case 宣言（合意済み宣言のみ。機械的比較の入力）。 */
export interface CaseDeclaration {
  /** Case 参照（Issue 番号等の識別文字列）。 */
  readonly case_ref: string;
  /** 属する Epic の参照。同一 Epic 配下（Wave 内）は前置検出へ委譲するため
   *  判定に使う。Standard Case は null。 */
  readonly epic_ref: string | null;
  /** 変更対象成果物のパス一覧（相対パス）。 */
  readonly artifact_paths: readonly string[];
  /** 対象要件行ID一覧（case-ready モードの条件 (b) で使用）。 */
  readonly target_rows: readonly string[];
}

/** 検査入力。検出源の収集は呼出側（workflow skill の手順）が行い、
 *  本エンジンは合意済み宣言の機械的比較に限定する。 */
export interface CrossDependencyInspectionInput {
  readonly mode: InspectionMode;
  /** 検査実行の中心となる Case（case-open は投入中の draft、case-ready は
   *  ready 遷移対象の Root Case）。 */
  readonly current_case: CaseDeclaration & {
    /** case-open モード: draft の構成ヒント（case_open_hints）が Epic 構成を
     *  示す場合に true。Wave 内重複は前置検出へ委譲する旨の注記に使う。 */
    readonly is_epic_intake: boolean;
  };
  /** 未クローズ Case 群の宣言。時間窓による狭域化は行わない。 */
  readonly unclosed_cases: readonly CaseDeclaration[];
  /** 条件 (b) の共有領域定義（プロジェクト側で解決した値）。 */
  readonly shared_areas?: readonly SharedAreaDefinition[];
  /** 呼出側で観測した検出源の取得失敗（Issue 取得失敗等）。比較を省略せず
   *  検出不能として報告するための入力。 */
  readonly source_failures?: readonly DetectionSourceFailure[];
}

export interface SharedAreaDefinition {
  readonly area_id: string;
  readonly display_name: string;
  readonly kind: SharedAreaKind;
  /** 正規成果物実ファイルの相対パス一覧（repo root 基準）。 */
  readonly file_paths: readonly string[];
}

export interface DetectionSourceFailure {
  readonly source: string;
  readonly ref: string;
  readonly reason: string;
}

/** 条件 (a): 同一パス重複の警告。 */
export interface SamePathWarning {
  readonly path: string;
  readonly cases: readonly string[];
}

/** 条件 (b): 共有領域未登録行の重複需要。 */
export interface SharedAreaDemand {
  readonly area_id: string;
  readonly display_name: string;
  readonly file_results: readonly SharedAreaFileResult[];
  readonly demand_cases: readonly {
    readonly case_ref: string;
    readonly unregistered_rows: readonly string[];
  }[];
  readonly case_count: number;
}

export interface SharedAreaFileResult {
  readonly file_path: string;
  readonly read_ok: boolean;
  readonly registered_rows: readonly string[];
}

/** 検出不能報告（検出源の取得失敗。比較の黙示省略を禁止するための出力）。 */
export interface DetectionUnavailable {
  readonly source: string;
  readonly ref: string;
  readonly reason: string;
}

export interface CrossDependencyInspectionReport {
  readonly ok: true;
  readonly mode: InspectionMode;
  readonly scan: {
    readonly current_case: string;
    readonly population_count: number;
    readonly time_window_narrowing: false;
    readonly epic_intake: boolean;
    readonly wave_internal_delegated_paths: readonly string[];
  };
  readonly condition_a: {
    readonly warnings: readonly SamePathWarning[];
    readonly count: number;
  };
  readonly condition_b: readonly SharedAreaDemand[];
  readonly detection_unavailable: readonly DetectionUnavailable[];
  /** 警告検出時の投入者（HITL）への選択肢。case-auto 配下では decision_context
   *  による親判断解決へ委譲する（呼出側手順の責務）。 */
  readonly hitl_options: readonly [string, string, string];
  /** 警告はゲート遷移判定（Root Case の確立・ready 遷移）に影響しない。 */
  readonly gate_effect: "none";
}

/** パスの機械的正規化（区切り文字統一、先頭 ./ 除去）。比較のみに使う。 */
export function normalizeArtifactPath(raw: string): string {
  const unified = raw.trim().replace(/\\/g, "/");
  let p = unified;
  while (p.startsWith("./")) p = p.slice(2);
  return p;
}
