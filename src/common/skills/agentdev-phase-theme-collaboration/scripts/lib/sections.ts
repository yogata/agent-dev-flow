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
