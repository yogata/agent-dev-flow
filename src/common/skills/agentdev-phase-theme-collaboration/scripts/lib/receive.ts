/**
 * 外部AIの戻り入力の受理・解釈（戻り受理・部分反映・非機能受け入れ条件の機械的部分）。
 * - 貼付（stdin）と指定ファイルの両経路を同一の正規化（改行統一）で受理し、
 *   意味上同じ確定結果（同一 JSON）を返す
 * - 受理・解釈は入力サイズ n に対する単一の線形走査（時間計算量 O(n)）である:
 *   1 回の行走査でエントリを抽出し、後戻り・再走査を行わない
 * - 採用根拠は利用者の明示採用指示（--adopt）のみであり、
 *   外部AIの自己申告（承認済み・approved 等の本文申告）を採用証拠にしない
 * - 不正または曖昧な入力（エントリ様式不備・空本文）は不採用として残し、確定しない（fail-closed）
 * - 採用・不採用の記録は明示採用件数に比例する証跡量である:
 *   エントリ本文を複写せず、採用分は根拠付きレコード、不採用分は id と分類の要約のみを記録する
 */

import {
  computeCounts,
  parseReceiveResult,
  type ReceiveEntry,
  type ReceiveResult,
} from "./schema.ts";

const ENTRY_HEADING = /^##\s+(\S+)?\s*:?\s*(.*)$/;
const SELF_REPORT_PATTERN = /(承認済み|承認された|採用済み|approved|ACCEPTED|PASS OK)/i;

/** 両経路で同一結果となる正規化。 */
export function normalizeInput(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

interface RawEntry {
  readonly id: string | null;
  readonly title: string;
  readonly body: readonly string[];
}

/** 見出し行でエントリを分割する（単一走査。抽出した行は保持のみで再走査しない）。 */
function extractEntries(text: string): readonly RawEntry[] {
  const entries: RawEntry[] = [];
  let current: { id: string | null; title: string; body: string[] } | null = null;
  let ordinal = 0;
  for (const line of text.split("\n")) {
    const match = ENTRY_HEADING.exec(line);
    if (match !== null && match[2] !== undefined && match[2].trim().length > 0) {
      if (current !== null) entries.push(current);
      ordinal += 1;
      const label = match[1] ?? null;
      current = {
        id: label !== null && /^E-\d+$/.test(label) ? label : `E-${String(ordinal).padStart(3, "0")}`,
        title: match[2].trim(),
        body: [],
      };
      continue;
    }
    if (current !== null) current.body.push(line);
  }
  if (current !== null) entries.push(current);
  return entries;
}

function joinNonEmpty(lines: readonly string[]): string {
  return lines.map((line) => line.trim()).filter((line) => line.length > 0).join("\n");
}

/**
 * 戻り入力を受理し、採否記録を生成する（単一の線形走査）。
 *
 * @param rawText 戻り入力の生テキスト（貼付・ファイルのいずれも正規化済みであること）
 * @param adoptIds 利用者の明示採用指示（エントリ id または見出しタイトル）
 * @param prior 照合する既存受領記録（再投入時。重複エントリの検出に使う）
 * @param priorLabel 既存受領記録の参照ラベル（証跡用。省略可）
 */
export function receiveReturnInput(
  rawText: string,
  adoptIds: readonly string[],
  prior: ReceiveResult | null,
  priorLabel: string | null = null,
): ReceiveResult {
  const text = normalizeInput(rawText);
  const adopted = new Set(adoptIds);
  // 重複検出の対象は受理が確定したエントリ（accepted / rejected-invalid）のみ。
  // not-adopted は採否未確定（利用者判断の対象）であるため、再投入時に再採否される
  // （消失を生まず、確定済み分の重複処理も生まない）。
  const priorKeys = prior === null
    ? new Set<string>()
    : new Set(
        prior.entries
          .filter((entry) => entry.disposition === "accepted" || entry.disposition === "rejected-invalid")
          .map((entry) => `${entry.id}\u0000${entry.title}`),
      );
  const entries: ReceiveEntry[] = [];
  const rawEntries = extractEntries(text);
  for (const raw of rawEntries) {
    const key = `${raw.id}\u0000${raw.title}`;
    const selfReportDetected = SELF_REPORT_PATTERN.test(joinNonEmpty(raw.body));
    const body = joinNonEmpty(raw.body);
    if (body.length === 0) {
      entries.push({
        id: raw.id ?? "",
        title: raw.title,
        disposition: "rejected-invalid",
        basis: null,
        selfReportDetected,
        reason: "エントリ本文が空であり曖昧な入力として不採用とする（確定しない）",
      });
      continue;
    }
    if (priorKeys.has(key)) {
      entries.push({
        id: raw.id ?? "",
        title: raw.title,
        disposition: "detected-duplicate",
        basis: null,
        selfReportDetected,
        reason: "既存の受領記録に同一エントリを検出した。重複を生まないため処理対象外とする",
      });
      continue;
    }
    if (adopted.has(raw.id ?? "") || adopted.has(raw.title)) {
      entries.push({
        id: raw.id ?? "",
        title: raw.title,
        disposition: "accepted",
        basis: "user-explicit",
        selfReportDetected,
        reason: null,
      });
      continue;
    }
    entries.push({
      id: raw.id ?? "",
      title: raw.title,
      disposition: "not-adopted",
      basis: null,
      selfReportDetected,
      reason: "利用者の明示採用指示がなく不採用として記録する（外部AIの自己申告は採用根拠にならない）",
    });
  }
  if (rawEntries.length === 0) {
    entries.push({
      id: "E-000",
      title: "様式不備の戻り入力",
      disposition: "rejected-invalid",
      basis: null,
      selfReportDetected: false,
      reason: "エントリ見出しが検出できないため不採用として残し確定しない（fail-closed）",
    });
  }
  const missing = adoptIds.filter(
    (id) => !entries.some((entry) => (entry.id === id || entry.title === id) && entry.disposition === "accepted"),
  );
  if (missing.length > 0) {
    throw new Error(`明示採用指示に該当する受理済みエントリが存在しない（fail-closed）: ${missing.join(", ")}`);
  }
  return {
    result: "received",
    normalization: "newline-unified",
    entries,
    counts: computeCounts(entries),
    priorReference: prior === null ? null : (priorLabel ?? "prior"),
  };
}

/** 既存受領記録 JSON を検証して読み込む（--prior 入力の fail-closed 検証）。 */
export function loadPriorRecord(value: unknown): ReceiveResult {
  return parseReceiveResult(value);
}

/** 証跡量の性質: 出力はエントリ本文を複写しない（採否記録の要約と採用分の根拠のみ）。 */
export function outputContainsEntryBody(output: ReceiveResult, bodyFragment: string): boolean {
  return JSON.stringify(output).includes(bodyFragment);
}
