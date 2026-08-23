// 課題ファイル（docs/issue-list/ISL-*.md）の frontmatter 解析、検索フィルタ、
// 状態別必須項目の形式検証。純粋関数と決定的な単一ディレクトリ列挙のみで構成する。
// list 利用は frontmatter（最初の --- ブロック）のみを解析対象とし、
// validate 利用は本文の H2 見出しのみを検査する（本文の全文解析を行わない）。

import * as fs from "node:fs";
import * as path from "node:path";

/** 課題 ID の形式。GitHub Issue 番号参照（純数字）とは交差しない。 */
export const ISSUE_ID_RE = /^ISL-\d{3}$/;
/** 課題ファイル名の形式。 */
export const ISSUE_FILE_RE = /^ISL-\d{3}\.md$/;
/** GitHub Issue 番号参照（#NNNN または純数字）。課題 ID と機械的に識別するための対比定義。 */
export const GITHUB_ISSUE_REF_RE = /^#?\d+$/;
/** 状態保存値（未着手、検討中、保留、解決済み、クローズ済みの5意味）。 */
export const ISSUE_STATUSES = ["open", "in-progress", "on-hold", "resolved", "closed"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

/** 本文セクションの見出し（状態別必須項目の検査対象）。 */
export const SECTION_ISSUE = "課題内容";
export const SECTION_REEVALUATION = "再評価条件";
export const SECTION_CONCLUSION = "結論";
export const SECTION_REFLECTION = "反映先";
export const SECTION_CLOSE_CONFIRMATION = "クローズ確認";

export interface IssueRecord {
  /** ファイル名由来の課題 ID。 */
  readonly id: string;
  /** 走査ルートからの相対パス（forward slash 区切り）。 */
  readonly file: string;
  /** frontmatter `id` の値。未記述は null（id-mismatch 検査で報告）。 */
  readonly fmId: string | null;
  readonly title: string | null;
  readonly status: string | null;
  readonly created: string | null;
  readonly updated: string | null;
  readonly relatedArtifacts: readonly string[];
  readonly owner: string | null;
  readonly due: string | null;
  readonly reevaluation: string | null;
}

export interface IssueFile {
  readonly record: IssueRecord;
  /** 本文の H2 見出一覧（validate 用）。 */
  readonly headings: readonly string[];
}

export interface ValidationFinding {
  readonly file: string;
  readonly code: string;
  readonly message: string;
}

export interface IssueFilters {
  readonly status?: string;
  readonly related?: string;
  readonly id?: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function splitFrontmatter(content: string): { fields: Record<string, string>; body: string } | null {
  if (!content.startsWith("---")) return null;
  const end = content.indexOf("\n---", 3);
  if (end === -1) return null;
  const fmText = content.slice(3, end);
  const body = content.slice(end + 4);
  const fields: Record<string, string> = {};
  for (const rawLine of fmText.split("\n")) {
    const line = rawLine.trim();
    if (line === "") continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (key !== "") fields[key] = value;
  }
  return { fields, body };
}

function parseInlineList(value: string | undefined): string[] {
  if (!value) return [];
  const v = value.trim();
  if (!(v.startsWith("[") && v.endsWith("]"))) return [];
  const inner = v.slice(1, -1).trim();
  if (inner === "") return [];
  return inner
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

function extractHeadings(body: string): string[] {
  const headings: string[] = [];
  for (const line of body.split("\n")) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m && m[1]) headings.push(m[1]);
  }
  return headings;
}

export function parseIssueContent(id: string, file: string, content: string): IssueFile {
  const parsed = splitFrontmatter(content);
  const fields = parsed?.fields ?? {};
  const record: IssueRecord = {
    id,
    file,
    fmId: fields["id"] ?? null,
    title: fields["title"] ?? null,
    status: fields["status"] ?? null,
    created: fields["created"] ?? null,
    updated: fields["updated"] ?? null,
    relatedArtifacts: parseInlineList(fields["related_artifacts"]),
    owner: fields["owner"] ?? null,
    due: fields["due"] ?? null,
    reevaluation: fields["reevaluation"] ?? null,
  };
  return { record, headings: parsed ? extractHeadings(parsed.body) : [] };
}

/** docs/issue-list/ の課題ファイルをファイル名順に列挙する。ディレクトリ不在は空配列。 */
export function scanIssueDir(root: string): IssueFile[] {
  const dir = path.join(root, "docs", "issue-list");
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  const files: IssueFile[] = [];
  for (const name of entries.sort()) {
    if (!ISSUE_FILE_RE.test(name)) continue;
    const id = name.slice(0, -3);
    const content = fs.readFileSync(path.join(dir, name), "utf8");
    files.push(parseIssueContent(id, toForwardSlash(`docs/issue-list/${name}`), content));
  }
  return files;
}

function toForwardSlash(p: string): string {
  return p.replace(/\\/g, "/");
}

function hasHeading(headings: readonly string[], heading: string): boolean {
  return headings.includes(heading);
}

/** 状態別必須項目の形式検証。 */
export function validateIssues(files: readonly IssueFile[]): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  for (const { record, headings } of files) {
    const push = (code: string, message: string) =>
      findings.push({ file: record.file, code, message });
    if (record.fmId === null) push("missing-field", "frontmatter の id が未記述です");
    else if (record.fmId !== record.id)
      push("id-mismatch", `frontmatter id (${record.fmId}) がファイル名の課題 ID (${record.id}) と一致しません`);
    if (!record.title) push("missing-field", "frontmatter の title が未記述です");
    if (!record.status) push("missing-field", "frontmatter の status が未記述です");
    else if (!(ISSUE_STATUSES as readonly string[]).includes(record.status))
      push("unknown-status", `未知の状態保存値です: ${record.status}`);
    if (!record.created) push("missing-field", "frontmatter の created が未記述です");
    else if (!DATE_RE.test(record.created)) push("invalid-date", `created が YYYY-MM-DD 形式ではありません: ${record.created}`);
    if (!record.updated) push("missing-field", "frontmatter の updated が未記述です");
    else if (!DATE_RE.test(record.updated)) push("invalid-date", `updated が YYYY-MM-DD 形式ではありません: ${record.updated}`);
    if (!hasHeading(headings, SECTION_ISSUE))
      push("missing-section", `本文に「## ${SECTION_ISSUE}」セクションがありません`);
    if (record.status === "on-hold") {
      if (!record.reevaluation)
        push("on-hold-requires-reevaluation", "保留状態は frontmatter reevaluation（再評価条件の要約）が必須です");
      if (!hasHeading(headings, SECTION_REEVALUATION))
        push("on-hold-requires-section", `保留状態は本文「## ${SECTION_REEVALUATION}」セクションが必須です`);
    }
    if (record.status === "resolved" || record.status === "closed") {
      if (!hasHeading(headings, SECTION_CONCLUSION))
        push("resolved-requires-conclusion", `解決済み以上は本文「## ${SECTION_CONCLUSION}」セクションが必須です`);
    }
    if (record.status === "closed") {
      if (!hasHeading(headings, SECTION_REFLECTION))
        push("closed-requires-reflection", `クローズ済みは本文「## ${SECTION_REFLECTION}」セクション（反映先または反映不要の理由）が必須です`);
      if (!hasHeading(headings, SECTION_CLOSE_CONFIRMATION))
        push("closed-requires-close-confirmation", `クローズ済みは本文「## ${SECTION_CLOSE_CONFIRMATION}」セクションが必須です`);
    }
  }
  return findings;
}

function relatedMatches(artifact: string, filter: string): boolean {
  return artifact === filter || artifact.includes(filter) || filter.includes(artifact);
}

/** フィルタ適用（status は完全一致、id は完全一致、related は完全一致または包含一致）。 */
export function filterIssues(files: readonly IssueFile[], filters: IssueFilters): IssueRecord[] {
  return files
    .filter((f) => {
      if (filters.status !== undefined && f.record.status !== filters.status) return false;
      if (filters.id !== undefined && f.record.id !== filters.id) return false;
      if (
        filters.related !== undefined &&
        !f.record.relatedArtifacts.some((a) => relatedMatches(a, filters.related ?? ""))
      )
        return false;
      return true;
    })
    .map((f) => f.record);
}

/** 状態別件数。全状態キーを常に含める（決定的出力）。 */
export function countByStatus(records: readonly IssueRecord[]): Record<IssueStatus, number> {
  const counts: Record<IssueStatus, number> = { open: 0, "in-progress": 0, "on-hold": 0, resolved: 0, closed: 0 };
  for (const r of records) {
    if (r.status && (ISSUE_STATUSES as readonly string[]).includes(r.status)) {
      counts[r.status as IssueStatus] += 1;
    }
  }
  return counts;
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

/** 一覧の Markdown 表出力。 */
export function toMarkdownTable(records: readonly IssueRecord[]): string {
  const header = "| 課題ID | 状態 | 件名 | 更新日 | 関連成果物 | 再評価条件 |";
  const sep = "|---|---|---|---|---|---|";
  const rows = records.map((r) =>
    [
      r.id,
      r.status ?? "",
      r.title ?? "",
      r.updated ?? "",
      r.relatedArtifacts.join(", "),
      r.reevaluation ?? "",
    ]
      .map(escapeCell)
      .join(" | "),
  );
  return [header, sep, ...rows.map((r) => `| ${r} |`)].join("\n");
}
