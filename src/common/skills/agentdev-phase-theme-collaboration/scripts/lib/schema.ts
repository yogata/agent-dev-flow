/**
 * 戻り入力の受理・採否記録の schema 型と検証（fail-closed）。
 * 外部AIの自己申告は採用根拠にならず、採用根拠は利用者の明示判断のみである。
 */

/** エントリの採否区分。 */
export type Disposition =
  | "accepted"
  | "not-adopted"
  | "rejected-invalid"
  | "detected-duplicate";

export interface ReceiveEntry {
  readonly id: string;
  readonly title: string;
  readonly disposition: Disposition;
  /** 採用根拠。accepted の場合のみ "user-explicit"（利用者の明示判断）。 */
  readonly basis: "user-explicit" | null;
  /** 自己申告パターンの検出。採用判断の根拠にはならない（観測情報としてのみ記録）。 */
  readonly selfReportDetected: boolean;
  /** rejected-invalid / detected-duplicate の理由。 */
  readonly reason: string | null;
}

export interface ReceiveCounts {
  readonly total: number;
  readonly accepted: number;
  readonly notAdopted: number;
  readonly rejectedInvalid: number;
  readonly detectedDuplicate: number;
}

export interface ReceiveResult {
  readonly result: "received";
  /** 貼付・ファイル両経路で同一となる正規化（改行統一）を明示する。 */
  readonly normalization: "newline-unified";
  readonly entries: readonly ReceiveEntry[];
  readonly counts: ReceiveCounts;
  /** 照合に使った既存受領記録の参照。未指定の場合は null。 */
  readonly priorReference: string | null;
}

export function isDisposition(value: unknown): value is Disposition {
  return (
    value === "accepted" ||
    value === "not-adopted" ||
    value === "rejected-invalid" ||
    value === "detected-duplicate"
  );
}

/**
 * 受理結果 JSON を検証する（--prior で既存記録を照合する際の fail-closed 入力検証）。
 * 様式不備は silent skip せず例外で拒否する。
 */
export function parseReceiveResult(value: unknown): ReceiveResult {
  if (typeof value !== "object" || value === null) {
    throw new Error("受領記録は JSON オブジェクトである必要がある");
  }
  const record = value as Record<string, unknown>;
  if (record["result"] !== "received") {
    throw new Error("受領記録の result が received でない");
  }
  const rawEntries = record["entries"];
  if (!Array.isArray(rawEntries)) {
    throw new Error("受領記録の entries が配列でない");
  }
  const entries: ReceiveEntry[] = rawEntries.map((raw, index) => {
    if (typeof raw !== "object" || raw === null) {
      throw new Error(`entries[${index}] がオブジェクトでない`);
    }
    const entry = raw as Record<string, unknown>;
    if (typeof entry["id"] !== "string" || entry["id"].length === 0) {
      throw new Error(`entries[${index}].id が不正`);
    }
    if (typeof entry["title"] !== "string") {
      throw new Error(`entries[${index}].title が不正`);
    }
    if (!isDisposition(entry["disposition"])) {
      throw new Error(`entries[${index}].disposition が不正: ${String(entry["disposition"])}`);
    }
    const basis = entry["basis"];
    if (basis !== "user-explicit" && basis !== null) {
      throw new Error(`entries[${index}].basis が不正: ${String(basis)}`);
    }
    const selfReportDetected = entry["selfReportDetected"];
    if (typeof selfReportDetected !== "boolean") {
      throw new Error(`entries[${index}].selfReportDetected が不正`);
    }
    const reason = entry["reason"];
    if (reason !== null && typeof reason !== "string") {
      throw new Error(`entries[${index}].reason が不正`);
    }
    return {
      id: entry["id"],
      title: entry["title"],
      disposition: entry["disposition"],
      basis,
      selfReportDetected,
      reason,
    };
  });
  return {
    result: "received",
    normalization: "newline-unified",
    entries,
    counts: computeCounts(entries),
    priorReference: typeof record["priorReference"] === "string" ? record["priorReference"] : null,
  };
}

export function computeCounts(entries: readonly ReceiveEntry[]): ReceiveCounts {
  let accepted = 0;
  let notAdopted = 0;
  let rejectedInvalid = 0;
  let detectedDuplicate = 0;
  for (const entry of entries) {
    switch (entry.disposition) {
      case "accepted":
        accepted += 1;
        break;
      case "not-adopted":
        notAdopted += 1;
        break;
      case "rejected-invalid":
        rejectedInvalid += 1;
        break;
      case "detected-duplicate":
        detectedDuplicate += 1;
        break;
    }
  }
  return {
    total: entries.length,
    accepted,
    notAdopted,
    rejectedInvalid,
    detectedDuplicate,
  };
}

/** 受領記録ファイル（received/ 配下）の frontmatter 様式の検証結果。 */
export interface ReceivedRecordMeta {
  readonly receivedAt: string;
  readonly theme: string;
  readonly purpose: string;
  readonly question: string | null;
  readonly references: readonly string[];
}

/**
 * 受領記録 frontmatter の最小検証。欠落は silent skip せず例外で拒否する
 * （破損した受領記録を受領済み知見として扱わないため）。
 */
export function parseReceivedRecordMeta(value: unknown, file: string): ReceivedRecordMeta {
  if (typeof value !== "object" || value === null) {
    throw new Error(`${file}: 受領記録の frontmatter が不正（オブジェクトでない）`);
  }
  const record = value as Record<string, unknown>;
  if (typeof record["receivedAt"] !== "string" || record["receivedAt"].length === 0) {
    throw new Error(`${file}: 受領記録の receivedAt が不正`);
  }
  if (typeof record["theme"] !== "string" || record["theme"].length === 0) {
    throw new Error(`${file}: 受領記録の theme が不正`);
  }
  if (typeof record["purpose"] !== "string" || record["purpose"].length === 0) {
    throw new Error(`${file}: 受領記録の purpose が不正`);
  }
  const question = record["question"];
  const references = record["references"];
  if (references !== undefined && !Array.isArray(references)) {
    throw new Error(`${file}: 受領記録の references が配列でない`);
  }
  return {
    receivedAt: record["receivedAt"],
    theme: record["theme"],
    purpose: record["purpose"],
    question: typeof question === "string" ? question : null,
    references: Array.isArray(references) ? references.filter((r): r is string => typeof r === "string") : [],
  };
}
