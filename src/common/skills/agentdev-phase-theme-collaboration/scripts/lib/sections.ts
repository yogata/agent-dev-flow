/**
 * themes.md / pending.md のセクション解析（決定的）。
 * 様式は .agentdev/phase/README.md の領域契約に従う。
 * - テーマ1件 = `## THEME-{NNN}: テーマ名` セクション
 * - 未決1件 = `## PEND-{NNN}: 要約` セクション
 * 同一入力から同一の JSON を返す（実質変更なしの再実行で不当な再編を増やさない導出の基盤）。
 */

export interface ThemeSection {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly successor: string | null;
  readonly pendingRefs: readonly string[];
  readonly adoptionBasis: string | null;
  readonly detail: string;
}

export interface PendingSection {
  readonly id: string;
  readonly summary: string;
  readonly status: string;
  readonly relatedThemes: readonly string[];
  readonly basis: string;
}

export interface ThemeListEntry {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly successor: string | null;
  readonly pendingRefs: readonly string[];
}

const THEME_HEADING = /^## (THEME-\d+): (.+)$/;
const PEND_HEADING = /^## (PEND-\d+): (.+)$/;
const FIELD = /^- ([^:：]+): ?(.*)$/;

function splitSections(text: string, heading: RegExp): Array<{ id: string; name: string; body: string[] }> {
  const sections: Array<{ id: string; name: string; body: string[] }> = [];
  let current: { id: string; name: string; body: string[] } | null = null;
  for (const line of text.split("\n")) {
    const match = heading.exec(line);
    if (match !== null && match[1] !== undefined && match[2] !== undefined) {
      if (current !== null) sections.push(current);
      current = { id: match[1], name: match[2].trim(), body: [] };
      continue;
    }
    if (current !== null) current.body.push(line);
  }
  if (current !== null) sections.push(current);
  return sections;
}

function readFields(body: readonly string[]): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of body) {
    const match = FIELD.exec(line);
    if (match !== null && match[1] !== undefined && match[2] !== undefined) {
      fields.set(match[1].trim(), match[2].trim());
    }
  }
  return fields;
}

/** themes.md を解析する。テーマ識別の重複は例外で拒否する（silent skip しない）。 */
export function parseThemes(text: string): readonly ThemeSection[] {
  const seen = new Set<string>();
  const sections: ThemeSection[] = [];
  for (const raw of splitSections(text, THEME_HEADING)) {
    if (seen.has(raw.id)) {
      throw new Error(`テーマ識別が重複している: ${raw.id}`);
    }
    seen.add(raw.id);
    const fields = readFields(raw.body);
    const successor = fields.get("後継") ?? null;
    const pendingLine = fields.get("未決") ?? "";
    const pendingRefs = pendingLine.length > 0
      ? pendingLine.split(/[\s、,]+/).filter((token) => /^PEND-\d+$/.test(token))
      : [];
    const adoptionBasisField = fields.has("採用根拠") ? fields.get("採用根拠") ?? "" : null;
    const detailIndex = raw.body.findIndex((line) => line.startsWith("- 具体化:"));
    const detail = detailIndex >= 0
      ? [raw.body[detailIndex]?.slice("- 具体化:".length).trim() ?? "", ...raw.body.slice(detailIndex + 1).map((line) => line.trim())]
          .filter((line) => line.length > 0)
          .join("\n")
      : "";
    sections.push({
      id: raw.id,
      name: raw.name,
      status: fields.get("状態") ?? "",
      successor: successor !== null && successor.length > 0 ? extractThemeId(successor) : null,
      pendingRefs,
      adoptionBasis: adoptionBasisField,
      detail,
    });
  }
  return sections;
}

/** 後継フィールドの自由記述からテーマ識別を抽出する。 */
function extractThemeId(value: string): string | null {
  const match = /THEME-\d+/.exec(value);
  return match !== null ? match[0] : null;
}

/** pending.md を解析する。未決識別の重複は例外で拒否する。 */
export function parsePending(text: string): readonly PendingSection[] {
  const seen = new Set<string>();
  const sections: PendingSection[] = [];
  for (const raw of splitSections(text, PEND_HEADING)) {
    if (seen.has(raw.id)) {
      throw new Error(`未決識別が重複している: ${raw.id}`);
    }
    seen.add(raw.id);
    const fields = readFields(raw.body);
    const relatedLine = fields.get("関連テーマ") ?? "";
    const relatedThemes = relatedLine.length > 0
      ? [...relatedLine.matchAll(/THEME-\d+/g)].map((match) => match[0])
      : [];
    sections.push({
      id: raw.id,
      summary: raw.name,
      status: fields.get("状態") ?? "",
      relatedThemes,
      basis: fields.get("判断根拠") ?? "",
    });
  }
  return sections;
}

/** テーマ正本から一覧を導出する（一覧は正本からの導出であり恒久保存しない）。 */
export function deriveThemeList(sections: readonly ThemeSection[]): readonly ThemeListEntry[] {
  return sections.map((section) => ({
    id: section.id,
    name: section.name,
    status: section.status,
    successor: section.successor,
    pendingRefs: section.pendingRefs,
  }));
}

export type OldIdResolution =
  | { readonly status: "resolved"; readonly chain: readonly string[]; readonly resolvedId: string; readonly resolvedName: string; readonly resolvedStatus: string }
  | { readonly status: "terminal"; readonly chain: readonly string[]; readonly resolvedId: null }
  | { readonly status: "unknown"; readonly chain: readonly string[]; readonly resolvedId: null }
  | { readonly status: "cycle"; readonly chain: readonly string[]; readonly resolvedId: null };

/**
 * 旧テーマ識別の後継チェーンを解決する（旧識別の安全な再接続の機械的部分）。
 * 後継参照を辿り、現行テーマ（active）・終端・未知識別・循環を区別する。
 * 循環は解決せず cycle として報告する（fail-closed）。
 */
export function resolveOldId(sections: readonly ThemeSection[], oldId: string): OldIdResolution {
  const byId = new Map(sections.map((section) => [section.id, section] as const));
  const chain: string[] = [oldId];
  let current = byId.get(oldId);
  if (current === undefined) {
    return { status: "unknown", chain, resolvedId: null };
  }
  while (current.successor !== null) {
    if (chain.includes(current.successor)) {
      return { status: "cycle", chain, resolvedId: null };
    }
    chain.push(current.successor);
    const next = byId.get(current.successor);
    if (next === undefined) {
      return { status: "unknown", chain, resolvedId: null };
    }
    current = next;
  }
  if (current.status === "active") {
    return { status: "resolved", chain, resolvedId: current.id, resolvedName: current.name, resolvedStatus: current.status };
  }
  return { status: "terminal", chain, resolvedId: null };
}

/** carried 状態（後継テーマへ引き継ぎ済み）の未決を抽出する（未決引継ぎの機械的部分）。 */
export function carriedPending(sections: readonly PendingSection[]): readonly PendingSection[] {
  return sections.filter((section) => section.status === "carried");
}

/** 未決識別で未決を検索する。 */
export function findPending(sections: readonly PendingSection[], pendingId: string): PendingSection | null {
  return sections.find((section) => section.id === pendingId) ?? null;
}

// ===== テーマと採用状態の整合（採用状態照合の機械的部分。対応関係は top-level traceability/ 配下 sidecar が所有） =====

/**
 * テーマ内の採用根拠の種別（`- 採用根拠:` フィールドから分類する）。
 * 語句検出は行わず、フィールドの値に基づく決定的分類のみを行う。
 * 分類は機械的な確認対象の限定であり、採用の意味的な認定を行わない
 * （参照先が存在することだけを根拠に採用を認定しない）。
 */
export type AdoptionBasisKind =
  | "user-decision"
  | "canonical-decision"
  | "insufficient"
  | "none";

export interface AdoptionClaimAssessment {
  readonly themeId: string;
  /** 採用根拠フィールドの値（フィールド未指定は null） */
  readonly basisText: string | null;
  readonly basisKind: AdoptionBasisKind;
  /**
   * 採用主張の扱い:
   * - adopted-claim-unverified: 採用主張あり・照合前（正規成果物との照合を要する。機械解析だけでは正式採用としない）
   * - candidate: 根拠が不足（確認不足または候補として示す。正式採用の主張を維持しない）
   * - reference-only: 採用主張なし（通常の参考テーマ。根拠参照の不在だけを理由に無効化しない）
   */
  readonly treatedAs: "adopted-claim-unverified" | "candidate" | "reference-only";
}

const DECISION_REF = /DEC-\d+/;

/**
 * テーマセクションの採用主張を分類する（採用状態照合の機械的部分）。
 * 有効な採用根拠がない内容を正式な採用済み要求として扱わないための分類を返す。
 * 両方の根拠が併記された場合は利用者の明示判断を優先する。
 */
export function assessAdoptionClaims(sections: readonly ThemeSection[]): readonly AdoptionClaimAssessment[] {
  return sections.map((section) => {
    const text = section.adoptionBasis;
    if (text === null) {
      return { themeId: section.id, basisText: null, basisKind: "none" as const, treatedAs: "reference-only" as const };
    }
    const basisKind: AdoptionBasisKind = /利用者|ユーザー/.test(text)
      ? "user-decision"
      : DECISION_REF.test(text)
        ? "canonical-decision"
        : "insufficient";
    const treatedAs = basisKind === "insufficient" ? "candidate" as const : "adopted-claim-unverified" as const;
    return { themeId: section.id, basisText: text, basisKind, treatedAs };
  });
}

/**
 * 正規成果物側の採用状態（不整合検出の照合入力）。
 * 呼出側が正規成果物の実内容から判定して渡す（本関数は正規成果物の様式を走査しない）。
 */
export type CanonicalAdoptionStatus = "adopted" | "candidate" | "not-adopted" | "unknown";

export interface AdoptionInconsistency {
  readonly themeId: string;
  readonly themeClaim: AdoptionBasisKind;
  readonly canonicalStatus: CanonicalAdoptionStatus;
  readonly kind: "theme-adopted-canonical-not-adopted" | "theme-not-adopted-canonical-adopted";
  /**
   * 検出後の機械的な扱いは未確認まで。
   * 是正は根拠に基づく利用者判断経路のみで行い、テーマの記述だけを根拠にした
   * 正規成果物の採用状態の書換え提案は出力に含めない（不整合検出の契約）。
   */
  readonly action: "treat-unconfirmed";
}

/**
 * テーマ側の採用主張と正規成果物側の採用状態の不整合を検出する（採用状態照合の機械的部分）。
 * 不整合がなければ null を返す。正規側が unknown の場合は照合不能として不整合に計上しない。
 */
export function assessAdoptionInconsistency(
  themeId: string,
  themeClaim: AdoptionBasisKind,
  canonicalStatus: CanonicalAdoptionStatus,
): AdoptionInconsistency | null {
  const themeAdopted = themeClaim === "user-decision" || themeClaim === "canonical-decision";
  if (canonicalStatus === "unknown") return null;
  if (themeAdopted && (canonicalStatus === "not-adopted" || canonicalStatus === "candidate")) {
    return { themeId, themeClaim, canonicalStatus, kind: "theme-adopted-canonical-not-adopted", action: "treat-unconfirmed" };
  }
  if (!themeAdopted && canonicalStatus === "adopted") {
    return { themeId, themeClaim, canonicalStatus, kind: "theme-not-adopted-canonical-adopted", action: "treat-unconfirmed" };
  }
  return null;
}

/**
 * 採用判断のライフサイクル状態（採用状態照合の機械的部分）。
 * candidate: 採用判断は未成立（候補）/ decided: 採用判断は成立・正規反映は未完了 / reflected: 正規反映完了。
 * decided は正式な成果物反映完了として扱わない（採用判断と反映完了の区別）。
 */
export type AdoptionReflectionState = "candidate" | "decided" | "reflected";

export interface AdoptionReflectionAssessment {
  readonly state: AdoptionReflectionState;
  /** 正規成果物への反映が完了しているか。decided では false（反映完了と扱わない） */
  readonly reflectedToCanonical: boolean;
}

/**
 * 採用根拠の分類と正規成果物への反映の有無から、採用判断のライフサイクル状態を導出する（採用状態照合の機械的部分）。
 * 根拠が不足・不在の場合は候補として扱い、通常の参考テーマを無効化しない。
 */
export function assessAdoptionReflection(
  adoptionBasis: AdoptionBasisKind,
  canonicalReflection: "absent" | "present",
): AdoptionReflectionAssessment {
  if (adoptionBasis === "user-decision" || adoptionBasis === "canonical-decision") {
    return canonicalReflection === "present"
      ? { state: "reflected", reflectedToCanonical: true }
      : { state: "decided", reflectedToCanonical: false };
  }
  return { state: "candidate", reflectedToCanonical: false };
}
