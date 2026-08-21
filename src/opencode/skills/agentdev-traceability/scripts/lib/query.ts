// coverage と impact の公開契約（agentdev-traceability Design「公開能力」の実装）。
// 入力は scanCorpus の結果（正規成果物の直接走査でその場で解決した対応宣言の和集合）。
//
// - coverage は明示された対応関係を全件返し、候補数上限、ランキング、
//   探索深度によって黙って切り捨てない（切り捨て経路自体が存在しない）
// - impact は任意深度のグラフ探索を行わず、成果物 ↔ 要件 ↔ 成果物の範囲を
//   超えて探索しない（起点から固定の2ホップのみ）
// - impact の空結果を「影響なし」の証明として扱わない

import type { CoverDeclaration, CoverRole } from "./declarations.ts";

export interface CoverageRelation {
  readonly role: CoverRole;
  readonly file: string;
  readonly line: number;
}

export interface CoverageByRequirement {
  readonly mode: "requirement";
  readonly reqId: string;
  readonly relations: readonly CoverageRelation[];
  readonly counts: { readonly design: number; readonly implementation: number; readonly verification: number; readonly total: number };
  /** 全件返却の明示。切り捨て経路が存在しないため常に false。 */
  readonly truncated: false;
  readonly emptyResult: boolean;
}

export interface CoverageByArtifactRelation {
  readonly reqId: string;
  readonly role: CoverRole;
  readonly line: number;
}

export interface CoverageByArtifact {
  readonly mode: "artifact";
  readonly artifact: string;
  readonly relations: readonly CoverageByArtifactRelation[];
  readonly truncated: false;
  readonly emptyResult: boolean;
}

function byFileLine(a: CoverageRelation | CoverDeclaration, b: CoverageRelation | CoverDeclaration): number {
  return a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1;
}

/** 要件起点: 当該要件へ対応する Design 文書、実装成果物、検証手段を役割付きで全件返す。 */
export function coverageByRequirement(
  declarations: readonly CoverDeclaration[],
  reqId: string,
): CoverageByRequirement {
  const relations = declarations
    .filter((d) => d.reqIds.includes(reqId))
    .map((d) => ({ role: d.role, file: d.file, line: d.line }))
    .sort(byFileLine);
  const count = (role: CoverRole): number => relations.filter((r) => r.role === role).length;
  return {
    mode: "requirement",
    reqId,
    relations,
    counts: {
      design: count("design"),
      implementation: count("implementation"),
      verification: count("verification"),
      total: relations.length,
    },
    truncated: false,
    emptyResult: relations.length === 0,
  };
}

/** 成果物起点: 当該成果物が対応する要件を全件返す。 */
export function coverageByArtifact(
  declarations: readonly CoverDeclaration[],
  artifact: string,
): CoverageByArtifact {
  const relations = declarations
    .filter((d) => d.file === artifact)
    .flatMap((d) => d.reqIds.map((reqId) => ({ reqId, role: d.role, line: d.line })))
    .sort((a, b) => (a.line === b.line ? (a.reqId < b.reqId ? -1 : 1) : a.line - b.line));
  return {
    mode: "artifact",
    artifact,
    relations,
    truncated: false,
    emptyResult: relations.length === 0,
  };
}

export interface ImpactViaRequirement {
  readonly reqId: string;
  readonly role: CoverRole;
  readonly line: number;
}

export interface ImpactCandidate {
  readonly role: CoverRole;
  readonly file: string;
  readonly line: number;
  readonly viaReqId: string;
}

export interface ImpactByRequirement {
  readonly mode: "requirement";
  readonly reqId: string;
  readonly recheckCandidates: readonly CoverageRelation[];
  readonly emptyResult: boolean;
  readonly note?: string;
}

export interface ImpactByArtifact {
  readonly mode: "artifact";
  readonly artifact: string;
  readonly viaRequirements: readonly ImpactViaRequirement[];
  readonly recheckCandidates: readonly ImpactCandidate[];
  readonly emptyResult: boolean;
  readonly note?: string;
}

export const EMPTY_IMPACT_NOTE =
  "空結果は「影響なし」の証明ではない。対応宣言の欠落、走査範囲の過小、宣言形式の不正等の別原因の可能性を残す。";

/** 要件起点: 当該要件へ明示的に対応する成果物を変更時の再確認候補として返す。 */
export function impactByRequirement(
  declarations: readonly CoverDeclaration[],
  reqId: string,
): ImpactByRequirement {
  const recheckCandidates = declarations
    .filter((d) => d.reqIds.includes(reqId))
    .map((d) => ({ role: d.role, file: d.file, line: d.line }))
    .sort(byFileLine);
  const emptyResult = recheckCandidates.length === 0;
  return {
    mode: "requirement",
    reqId,
    recheckCandidates,
    emptyResult,
    ...(emptyResult ? { note: EMPTY_IMPACT_NOTE } : {}),
  };
}

/**
 * 成果物起点: 当該成果物が対応する要件を経由して、同じ要件へ対応する他成果物を
 * 再確認候補として返す。探索範囲は成果物 ↔ 要件 ↔ 成果物（固定2ホップ）であり、
 * 候補先からさらに先へは進まない。
 */
export function impactByArtifact(
  declarations: readonly CoverDeclaration[],
  artifact: string,
): ImpactByArtifact {
  const viaRequirements = declarations
    .filter((d) => d.file === artifact)
    .flatMap((d) => d.reqIds.map((reqId) => ({ reqId, role: d.role, line: d.line })))
    .sort((a, b) => (a.line === b.line ? (a.reqId < b.reqId ? -1 : 1) : a.line - b.line));

  const seen = new Set<string>();
  const recheckCandidates: ImpactCandidate[] = [];
  for (const via of viaRequirements) {
    for (const d of declarations) {
      if (!d.reqIds.includes(via.reqId)) continue;
      if (d.file === artifact) continue; // 起点成果物自身は候補に含めない
      const key = `${d.file}:${d.line}:${via.reqId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      recheckCandidates.push({ role: d.role, file: d.file, line: d.line, viaReqId: via.reqId });
    }
  }
  recheckCandidates.sort(byFileLine);
  const emptyResult = recheckCandidates.length === 0;
  return {
    mode: "artifact",
    artifact,
    viaRequirements,
    recheckCandidates,
    emptyResult,
    ...(emptyResult ? { note: EMPTY_IMPACT_NOTE } : {}),
  };
}
