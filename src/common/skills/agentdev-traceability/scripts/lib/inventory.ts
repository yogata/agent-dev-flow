// 正規成果物の棚卸し（宣言外候補の発見）の純粋関数。
// 正規成果物を、宣言済みの対応関係と独立に確認（棚卸し）し、宣言外の
// 実在成果物・追跡候補を発見候補として扱う（agentdev-traceability Design
// 「正規成果物の棚卸しと宣言外候補の発見」節）。
//
// - 棚卸しは coverage・check の能力（外部契約・その出力）を入力にせず、
//   正規成果物の直接走査（enumerateCorpusFiles）で行う
// - 宣言済み集合の算出には同一の直接走査上で宣言抽出（parseDeclarations /
//   parseLinkDeclarations / parseSidecar）を利用する。covers 宣言と links 宣言の
//   いずれにも現れない実在成果物を発見候補として返す
// - 発見候補は advisory・fail-open であり、対応関係の欠落（missing-*）とは別の
//   分類である。発見候補を対応関係の欠落と誤判定しない
// - 宣言されていない成果物の不在は正である（未採用参照例の不在を欠落としない）

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseDeclarations } from "./declarations.ts";
import { parseLinkDeclarations } from "./links.ts";
import { enumerateCorpusFiles, enumerateSidecarFiles, POLICY_FILE_REL } from "./corpus.ts";
import { parseSidecar } from "./sidecar.ts";
import { DEFAULT_REQUIREMENTS_DIR } from "./requirements.ts";

export interface InventoryResult {
  /** 直接走査で発見した実在成果物（リポジトリ相対パス・名前順）。 */
  readonly corpusArtifacts: readonly string[];
  /** covers 対応宣言（inline + sidecar）に現れる artifact パス集合。 */
  readonly declaredArtifacts: readonly string[];
  /** links 宣言（inline + sidecar）に現れる source / target パス集合。 */
  readonly linkedArtifacts: readonly string[];
  /** covers・links いずれの宣言にも現れない実在成果物（発見候補・advisory）。 */
  readonly discoveredCandidates: readonly string[];
  readonly corpusCount: number;
  readonly emptyResult: boolean;
  /** 発見候補の解釈に関する note（欠落と誤判定しない、候補提供である旨）。 */
  readonly note: string;
}

export const INVENTORY_NOTE =
  "発見候補は宣言済み対応関係に現れない実在成果物の列挙であり、対応関係の欠落を意味しない。採用されていない参照例の成果物・対応不要の成果物を含み得る。対応関係の作成・修正の最終判断は各工程が行う候補提供である";

/**
 * root 配下のコーパスを直接走査し、棚卸し結果を構築する。
 * 走査は enumerateCorpusFiles（宣言解析を行わない直接走査）を入口とし、
 * 宣言済み集合の算出のみ宣言抽出を行う。
 */
export function buildInventory(root: string): InventoryResult {
  const corpusArtifacts = enumerateCorpusFiles(root);
  const declared = new Set<string>();
  const linked = new Set<string>();
  for (const rel of corpusArtifacts) {
    const content = readPlainFile(root, rel);
    if (content === undefined) continue;
    for (const d of parseDeclarations(rel, content).declarations) {
      declared.add(d.file);
    }
    for (const link of parseLinkDeclarations(rel, content).links) {
      linked.add(link.source);
      linked.add(link.target);
    }
  }
  for (const rel of enumerateSidecarFiles(root)) {
    if (rel === POLICY_FILE_REL) continue;
    const content = readPlainFile(root, rel);
    if (content === undefined) continue;
    const parsed = parseSidecar(rel, content);
    for (const relation of parsed.relations) {
      declared.add(relation.artifact);
    }
    for (const link of parsed.links) {
      linked.add(link.source);
      linked.add(link.target);
    }
  }
  const known = new Set<string>([...declared, ...linked]);
  const requirementsPrefix = `${DEFAULT_REQUIREMENTS_DIR}/`;
  // 要件テーブル（docs/requirements/REQ-*.md）は対応関係の中心軸であり、
  // covers 宣言の対象から常に構造的に外れるため発見候補の対象外とする
  const discoveredCandidates = corpusArtifacts.filter(
    (rel) => !known.has(rel) && !(rel.startsWith(requirementsPrefix) && /^REQ-\d{3,4}\.md$/.test(rel.slice(requirementsPrefix.length))),
  );
  return {
    corpusArtifacts,
    declaredArtifacts: [...declared].sort(),
    linkedArtifacts: [...linked].sort(),
    discoveredCandidates,
    corpusCount: corpusArtifacts.length,
    emptyResult: discoveredCandidates.length === 0,
    note: INVENTORY_NOTE,
  };
}

function readPlainFile(root: string, rel: string): string | undefined {
  try {
    const st = statSync(join(root, rel));
    if (!st.isFile()) return undefined;
    return readFileSync(join(root, rel), "utf-8");
  } catch {
    return undefined;
  }
}
