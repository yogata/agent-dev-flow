//
// 定型状態確認集約の入力・報告の型。
// コア関数（collect_status_summary.ts）と CLI 入口（src/collect_status_summary.ts）の
// 共有契約。取得手段（git・gh・ファイルシステム読取）は呼出側が注入する collectors
// 抽象に限定し、コアは副作用を持たない純粋関数として保持する。
//
// 出力契約の要点:
// - セクションごとに ok / empty / partial / unavailable / skipped を区別する。
//   空の検索結果を対象なし・成功の証拠にしない（呼出側の読取補完規律を機械的に保持する）。
// - 件数上限（limit）と offset による範囲指定を既定に持ち、total と returned を別々に報告する。
// - 既定出力の目安上限（バイト数）を超過した場合は集約自体を不合格とする
//   （切り詰め後の再読込を呼出側に要求しない設計の fail-closed 維持）。

export type SectionStatus =
  | "ok"
  | "empty"
  | "partial"
  | "unavailable"
  | "skipped";

export interface GitSection {
  status: SectionStatus;
  error?: string;
  head_commit: string | null;
  branch: string | null;
  status_entries: string[];
  status_total: number;
  worktrees: string[];
  worktree_total: number;
  limit: number;
}

export interface FileEntry {
  path: string;
  exists: boolean;
  sha256: string | null;
  bytes: number | null;
  lines: number | null;
  error?: string;
}

export interface FilesSection {
  status: SectionStatus;
  total: number;
  returned: number;
  offset: number;
  limit: number;
  entries: FileEntry[];
}

export interface StalenessQueue {
  name: string;
  count: number;
  oldest_age_days: number | null;
}

export interface StalenessSection {
  status: SectionStatus;
  error?: string;
  queues: StalenessQueue[];
}

export interface IssuesSection {
  status: SectionStatus;
  error?: string;
  total: number;
  returned: number;
  offset: number;
  limit: number;
  items: Record<string, unknown>[];
}

export interface StatusSummaryReport {
  ok: boolean;
  error?: string;
  root: string;
  sections: {
    git?: GitSection;
    files?: FilesSection;
    staleness?: StalenessSection;
    issues?: IssuesSection;
  };
  output_bytes: number;
}

export interface CollectInput {
  root: string;
  files: string[];
  stalenessQueues: string[];
  issuesArgs: string[] | null;
  limit: number;
  offset: number;
  maxBytes: number;
}

/** git・gh・ファイルシステムの読取を注入する collectors 抽象。全て読取専用。 */
export interface Collectors {
  /** git サブコマンド実行。実行不能時は null（unavailable として報告する）。 */
  runGit(args: string[]): { status: number; stdout: string } | null;
  /** gh CLI 読取実行。実行不能時は null。書込みサブコマンドは呼出側で拒否する。 */
  runGh(args: string[]): { status: number; stdout: string } | null;
  /** ファイル存在確認（存在時はバイト数）。 */
  stat(path: string): { exists: boolean; bytes: number | null };
  /** テキスト読取（行数計算と SHA256 生成に使用）。読取不能時は null。 */
  readText(path: string): string | null;
  /** テキストの SHA256 16進表記。ハッシュ実装の詳細は呼出側が所有する。 */
  hashText(text: string): string | null;
  /** ディレクトリ直下のファイル列挙（滞留計算に使用）。読取不能時は null。 */
  listFiles(
    dir: string,
  ): { name: string; modifiedMs: number | null }[] | null;
  /** 現在時刻（滞留日数計算の基準。テストで固定可能にする）。 */
  nowMs(): number;
}

export interface SectionRequest {
  git: boolean;
  files: boolean;
  staleness: boolean;
  issues: boolean;
}
