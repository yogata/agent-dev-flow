/**
 * 受領記録の生成と区別保存（受領記録の識別と信頼性の機械的部分）。
 * - 1受領1ファイル契約: 同日・同一テーマの複数受領は連番ファイル名で互いに区別し、
 *   既存記録を上書きしない
 * - 受領日時は受領操作時点の時計からのみ取得し、入力本文の日付・推定値を代用しない。
 *   取得できない場合は日時を捏造せず例外で失敗を明示する
 * - 由来（provenance）と正式な採用根拠（adoptionBasis）は別フィールドで記録し、
 *   由来だけで採用済みと扱わない
 * - ファイル名・連番の決定は既存ファイル名一覧に対する線形走査（O(n)）である
 */

import {
  isAdoptionBasisKind,
  isProvenanceKind,
  type AdoptionBasisKind,
  type ProvenanceKind,
} from "./schema.ts";

/**
 * 受領操作時点の時計から受領日時（ISO 8601 UTC）を取得する。
 * 時計が無効（時刻を取得できない）な場合は日時を捏造せず例外で失敗を明示する（fail-closed）。
 */
export function resolveReceivedAt(clock: () => Date = () => new Date()): string {
  const date = clock();
  const time = date.getTime();
  if (!Number.isFinite(time)) {
    throw new Error("受領日時を取得できない（時計が無効）。日時を捏造せず、取得失敗を明示する");
  }
  return date.toISOString();
}

/** 受領日時からファイル名の日付部分（YYYY-MM-DD）を抽出する。ISO 形式でなければ例外。 */
export function receivedDatePart(receivedAt: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})T/.exec(receivedAt);
  if (match === null || match[1] === undefined) {
    throw new Error(`受領日時の形式が不正で日付部分を抽出できない（fail-closed）: ${receivedAt}`);
  }
  return match[1];
}

/**
 * 受領記録のファイル名を決定する（1受領1ファイル契約）。
 * `YYYY-MM-DD-{テーマ識別}.md` が未使用ならその名前を返し、使用済みなら
 * `YYYY-MM-DD-{テーマ識別}-{2からの連番}.md` の最小の空き番号を返す。
 * 既存のどのファイル名も返さないため、既存記録を上書きしない。
 */
export function resolveReceivedFileName(
  existingFileNames: readonly string[],
  receivedAt: string,
  theme: string,
): string {
  const trimmedTheme = theme.trim();
  if (trimmedTheme.length === 0) {
    throw new Error("テーマ識別が空で受領記録のファイル名を決定できない（fail-closed）");
  }
  const date = receivedDatePart(receivedAt);
  const existing = new Set(existingFileNames);
  const base = `${date}-${trimmedTheme}.md`;
  if (!existing.has(base)) return base;
  let seq = 2;
  while (existing.has(`${date}-${trimmedTheme}-${seq}.md`)) {
    seq += 1;
  }
  return `${date}-${trimmedTheme}-${seq}.md`;
}

export interface ReceivedRecordInput {
  /** 受領操作時点の受領日時（resolveReceivedAt の返値）。入力本文の日付を代用しない。 */
  readonly receivedAt: string;
  readonly theme: string;
  readonly purpose: string;
  readonly question?: string | null;
  readonly references?: readonly string[];
  /** 受領内容の由来。採用根拠とは独立に記録する。 */
  readonly provenance: ProvenanceKind;
  /** 正式な採用の根拠。未採用では null。 */
  readonly adoptionBasis: AdoptionBasisKind | null;
  /** 受領本文（採否記録の証跡量契約に倣い、ビルダーは本文を検査せず保持のみ行う）。 */
  readonly body: string;
  /** 保存済み受領記録のファイル名一覧（区別保存の衝突判定に使う）。 */
  readonly existingFileNames?: readonly string[];
}

function quoteYamlString(value: string): string {
  return JSON.stringify(value);
}

/**
 * 受領記録ファイル（frontmatter + 本文）を生成する（1受領1ファイル）。
 * ファイル名は受領日時から導出した日付とテーマ識別、既存名との衝突判定で決定し、
 * 入力本文の内容はファイル名・受領日時へ影響させない。
 */
export function buildReceivedRecord(
  input: ReceivedRecordInput,
): { fileName: string; content: string } {
  if (!isProvenanceKind(input.provenance)) {
    throw new Error(`受領記録の由来が不正（fail-closed）: ${String(input.provenance)}`);
  }
  if (input.adoptionBasis !== null && !isAdoptionBasisKind(input.adoptionBasis)) {
    throw new Error(`受領記録の採用根拠が不正（fail-closed）: ${String(input.adoptionBasis)}`);
  }
  const theme = input.theme.trim();
  if (theme.length === 0) {
    throw new Error("テーマ識別が空で受領記録を生成できない（fail-closed）");
  }
  const question = input.question ?? null;
  const references = input.references ?? [];
  const frontmatter = [
    "---",
    `receivedAt: ${input.receivedAt}`,
    `theme: ${theme}`,
    `purpose: ${quoteYamlString(input.purpose)}`,
    ...(question !== null ? [`question: ${quoteYamlString(question)}`] : []),
    `references: [${references.map((reference) => quoteYamlString(reference)).join(", ")}]`,
    `provenance: ${input.provenance}`,
    `adoptionBasis: ${input.adoptionBasis ?? "null"}`,
    "---",
  ].join("\n");
  const fileName = resolveReceivedFileName(input.existingFileNames ?? [], input.receivedAt, theme);
  const bodyPart = input.body.endsWith("\n") || input.body.length === 0 ? input.body : `${input.body}\n`;
  return { fileName, content: `${frontmatter}\n\n${bodyPart}` };
}
