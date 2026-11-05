//
// 検証結果の証跡保存・読み戻しモジュール。
// 様式の正は 検証用一時資材のライフサイクル Design「証跡の保存と読み戻し」節:
// - 検証の必要な結果（入力、対象版、操作、実結果、失敗、訂正、判定理由）は
//   本体 Issue/PR へ保存する（SSoTコメント・PR本文検証差分の既存チャネル契約に
//   従う。新規の保存経路・別保管庫を作らない）
// - 回収した一時資材へのアクセスなしで読み戻して理解できることを保存形式の要件とする
// - 全生ログ、環境一式、Git bundle を別保管庫へ恒久保持する方式は採らない。
//   本モジュールは別保管庫・恒久保持の経路を所有せず、機械判定のためにローカル
//   生ログの永久保持を要求しない（材料生成と読み戻しの純粋関数のみ）
//

/** 証跡として保存する要素（7要素）。 */
export const VERIFICATION_EVIDENCE_ELEMENTS = [
  "入力",
  "対象版",
  "操作",
  "実結果",
  "失敗",
  "訂正",
  "判定理由",
] as const;

export type VerificationEvidenceElement = (typeof VERIFICATION_EVIDENCE_ELEMENTS)[number];

/** 検証結果の証跡レコード（REQ の7要素の対応実体）。 */
export interface VerificationEvidenceRecord {
  /** 入力（検証に与えた入力・対象の識別）。 */
  input: string;
  /** 対象版（検証対象の版情報。監査値は計測基準〔基準 commit または時点〕を含む）。 */
  targetRevision: string;
  /** 操作（実施した検証手順・実行工程）。 */
  operation: string;
  /** 実結果（観測された結果。終了コード・件数等の監査値を含む）。 */
  actualResult: string;
  /** 失敗（検出された失敗。失敗なしは null）。 */
  failure: string | null;
  /** 訂正（失敗に対する訂正・処置。訂正なしは null）。 */
  correction: string | null;
  /** 判定理由（合格・不合格の判定根拠）。 */
  judgmentReason: string;
}

/** 証跡レコードの契約違反。fail-closed（必須要素欠落の保存を行わない）。 */
export class EvidenceInputError extends Error {}

/** 保存材料の形式違反。fail-closed（欠落要素を補完せず読み戻しを拒否する）。 */
export class EvidenceMaterialFormatError extends Error {}

const EVIDENCE_MATERIAL_SENTINEL = "<!-- verification-evidence:v1 -->";

const ELEMENT_TO_FIELD: Record<VerificationEvidenceElement, keyof VerificationEvidenceRecord> = {
  入力: "input",
  対象版: "targetRevision",
  操作: "operation",
  実結果: "actualResult",
  失敗: "failure",
  訂正: "correction",
  判定理由: "judgmentReason",
};

const OPTIONAL_ELEMENTS: readonly VerificationEvidenceElement[] = ["失敗", "訂正"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** 証跡レコードの構築と契約検証。必須5要素（入力・対象版・操作・実結果・判定理由）の欠落は EvidenceInputError。 */
export function createVerificationEvidenceRecord(value: unknown): VerificationEvidenceRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new EvidenceInputError("verification evidence record must be a JSON object");
  }
  const v = value as Record<string, unknown>;
  const required = (element: VerificationEvidenceElement): string => {
    if (!isNonEmptyString(v[ELEMENT_TO_FIELD[element]])) {
      throw new EvidenceInputError(`verification evidence record requires a non-empty ${element} element`);
    }
    return v[ELEMENT_TO_FIELD[element]] as string;
  };
  const optional = (element: VerificationEvidenceElement): string | null => {
    const raw = v[ELEMENT_TO_FIELD[element]];
    if (raw === null || raw === undefined) return null;
    if (!isNonEmptyString(raw)) {
      throw new EvidenceInputError(
        `verification evidence record requires a non-empty ${element} element when recorded (use null when absent)`,
      );
    }
    return raw;
  };
  return {
    input: required("入力"),
    targetRevision: required("対象版"),
    operation: required("操作"),
    actualResult: required("実結果"),
    failure: optional("失敗"),
    correction: optional("訂正"),
    judgmentReason: required("判定理由"),
  };
}

function writeValue(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\n/g, "\n  ");
}

/**
 * 本体 Issue/PR（SSoTコメント・PR本文検証差分の既存チャネル）へ記載する
 * 記録生成材料を返す。材料は純粋な文字列であり、I/O を行わず、ローカル
 * 生ログ・環境一式・bundle の保持を要求しない。失敗・訂正なしは「なし」記載と
 * して欠落記載と区別する。
 */
export function serializeEvidenceMaterial(record: VerificationEvidenceRecord): string {
  const validated = createVerificationEvidenceRecord(record);
  const lines = [
    EVIDENCE_MATERIAL_SENTINEL,
    `- 入力: ${writeValue(validated.input)}`,
    `- 対象版: ${writeValue(validated.targetRevision)}`,
    `- 操作: ${writeValue(validated.operation)}`,
    `- 実結果: ${writeValue(validated.actualResult)}`,
    `- 失敗: ${writeValue(validated.failure ?? "なし")}`,
    `- 訂正: ${writeValue(validated.correction ?? "なし")}`,
    `- 判定理由: ${writeValue(validated.judgmentReason)}`,
  ];
  return `${lines.join("\n")}\n`;
}

/**
 * 保存材料からの読み戻し。回収した一時資材へのアクセスなしで、本体 Issue/PR へ
 * 保存された記録のみから7要素を復元する。センチネル欠落・要素欠落の材料は
 * EvidenceMaterialFormatError で拒否する（欠落要素を補完しない）。
 */
export function parseEvidenceMaterial(material: string): VerificationEvidenceRecord {
  const normalized = material.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const sentinelIndex = lines.indexOf(EVIDENCE_MATERIAL_SENTINEL);
  if (sentinelIndex < 0) {
    throw new EvidenceMaterialFormatError("evidence material sentinel is missing (verification-evidence:v1)");
  }
  const collected = new Map<VerificationEvidenceElement, string[]>();
  let current: { element: VerificationEvidenceElement; parts: string[] } | null = null;
  for (const line of lines.slice(sentinelIndex + 1)) {
    const elementStart = line.match(/^- (入力|対象版|操作|実結果|失敗|訂正|判定理由): (.*)$/);
    if (elementStart !== null) {
      const element = elementStart[1] as VerificationEvidenceElement;
      current = { element, parts: [elementStart[2] ?? ""] };
      collected.set(element, current.parts);
      continue;
    }
    if (current === null) break;
    if (line.trim().length === 0) break;
    current.parts.push(line.startsWith("  ") ? line.slice(2) : line);
  }
  const value = (element: VerificationEvidenceElement): string => {
    const parts = collected.get(element);
    const joined = parts?.join("\n") ?? "";
    if (parts === undefined || joined.trim().length === 0) {
      throw new EvidenceMaterialFormatError(`evidence material element is missing: ${element}`);
    }
    return joined;
  };
  const optionalValue = (element: VerificationEvidenceElement): string | null => {
    const raw = value(element);
    return OPTIONAL_ELEMENTS.includes(element) && raw === "なし" ? null : raw;
  };
  const record: Record<string, string | null> = {};
  for (const element of VERIFICATION_EVIDENCE_ELEMENTS) {
    record[ELEMENT_TO_FIELD[element]] = optionalValue(element);
  }
  return createVerificationEvidenceRecord(record);
}
