// engine/types.ts — IntegrityRule / IntegrityContext / RuleViolation の型定義。
// 契約所有: docs/designs/integrity/integrity-engine-plugin-architecture.md
// （IntegrityRule インターフェース・共有コンテキストキャッシュ・RuleViolation）。

/** 単一走査で構築されるファイル単位の事前パース結果。 */
export interface ParsedFile {
  /** リポジトリルート相対・forward slash のパス。 */
  path: string;
  rawContent: string;
  lines: string[];
  /** YAML frontmatter（`---` 囲み）。欠落・解析不能は null。 */
  frontmatter: Record<string, unknown> | null;
  /** 本文から抽出済みの相対リンク（`[text](href)` 形式）。 */
  markdownLinks: { text: string; href: string }[];
  /** 本文から抽出済みの REQ/DEC 参照（例: REQ-001、DEC-065）。 */
  reqReferences: string[];
}

/** 個別検出違反。severity は検出時の報告水準（error=NG / warning=Warning）。 */
export interface RuleViolation {
  ruleId: string;
  severity: "error" | "warning";
  /** リポジトリルート相対・forward slash のパス。 */
  filePath: string;
  line?: number;
  message: string;
  remediationHint?: string;
}

/** カタログ表記用のルール severity（REQ-036-022 の3値を維持）。 */
export type CatalogSeverity = "strict" | "heuristic" | "observation";

/**
 * 検証ルールのプラグイン契約。1ルール1ファイルで本インターフェースを実装し、
 * rules/index.ts のレジストリへ登録する。
 * check(ctx) は検出対象を ctx 経由でのみ取得すること（ルール内での
 * fs.readFileSync・glob 直接呼出は禁止）。
 */
export interface IntegrityRule {
  /** 例: "IR-001"。 */
  id: string;
  /** rules/IR-NNN-{slug}.md と整合する slug。 */
  slug: string;
  /** カタログ・エントリタイトル。 */
  title: string;
  /** カタログ・エントリの説明（1文）。 */
  description: string;
  /** 関連 REQ 行 ID（IR docs の related_req と整合）。 */
  relatedReqs: string[];
  /**
   * 差分実行（--changed）のトリガーパス glob（repo ルート相対）。
   * 変更ファイルがこれらに該当しない場合は当該ルールは実行対象外。
   */
  targetGlobs: string[];
  /**
   * 全体整合が必要な相互参照系は true。--changed 実行時に変更対象に含まれない
   * 場合でも、最小限の相互参照ルールとして実行される。
   */
  globalScan: boolean;
  /** カタログ severity（自動生成の単一ソースとして使用）。 */
  severity: CatalogSeverity;
  check(ctx: IntegrityContext): RuleViolation[];
}

/**
 * 共有コンテキスト。buildContext の単一走査で構築され、全ルールへ共有される。
 * 走査対象: docs/、src/、.agentdev/、traceability/ 配下の Markdown/YAML
 * （.opencode/ は copy 投影であり、IR-016 専用の projection 突合でのみ走査する）。
 */
export interface IntegrityContext {
  /** リポジトリルートの絶対パス。 */
  repoRoot: string;
  /** 走査済みファイル一覧（repo ルート相対パス順）。 */
  readonly files: readonly ParsedFile[];
  /** 指定パス（repo ルート相対）の ParsedFile。未走査パスは null。 */
  readFile(relPath: string): ParsedFile | null;
  /** 指定パスの実在確認（走査対象外の非 Markdown/YAML を含む）。 */
  pathExists(relPath: string): boolean;
  /**
   * 指定パス（repo ルート相対）の生テキスト内容。拡張子制限なし。
   * copy 投影の内容突合（IR-016）など走査対象外ファイルの比較に使用する。
   */
  readRaw(relPath: string): string | null;
  /** 指定 glob（repo ルート相対）に一致する ParsedFile 一覧。 */
  getFilesByGlob(pattern: string): ParsedFile[];
  /**
   * 指定ディレクトリ（repo ルート相対）のエントリ名一覧。
   * ディレクトリ不在は空配列。投影領域（.opencode/ 等）の列挙もこれ経由で行う。
   */
  listDir(relPath: string): string[];
  /** --changed 用の変更ファイル一覧（空配列 = 全量実行）。 */
  readonly changedFiles: readonly string[];
}

/** ルール実行単位の結果。 */
export interface RuleResult {
  ruleId: string;
  violations: RuleViolation[];
  /** ルールの check が throw した場合のエラー内容（違反とは区別される）。 */
  error?: string;
}

/** Runner の実行結果サマリ。 */
export interface RunnerSummary {
  rulesRun: number;
  ok: number;
  violations: number;
  warnings: number;
  skipped: string[];
}
