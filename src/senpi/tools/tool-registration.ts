// Senpi ホスト接続の Tool 登録単位の共通境界型。
//
// Senpi（OmO Native v5）の extension 機構への物理登録はホスト接続領域の配置契約
// （multi-host-canonical-model Design）と installer 投影・Wave 3 統合検証が扱う。
// 本モジュールは host 非依存の登録単位形状を固定し、Tool engine（src/common/tools/）
// への委譲と、引数・結果・実行 context の変換の所在を定める。

/** Senpi 実行 context（実行ディレクトリ基点。OpenCode の ToolContext worktree 相当）。 */
export interface SenpiToolContext {
  /** プロジェクトルート（実行ディレクトリ）。Tool engine の path 解決の基点。 */
  readonly worktree: string;
  readonly [key: string]: unknown;
}

/** Tool 結果の論理形状（OpenCode の ToolResultObject と同一の構造的契約）。 */
export interface SenpiToolResult {
  readonly title?: string;
  readonly output: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Senpi 向け Tool 登録単位。同じ Tool 名で1つのバックエンドのみを有効化する
 * （選択したバックエンドに接続し、両バックエンドの同時有効化は行わない）。
 * args は host 非依存の公開スキーマ（Tool engine 領域の public-schema.ts）を参照する。
 */
export interface SenpiToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly args: Record<string, unknown>;
  readonly execute: (
    args: { request?: unknown },
    context: SenpiToolContext,
  ) => Promise<SenpiToolResult>;
}
