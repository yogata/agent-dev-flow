// 解決手順: 対象作業が基準となる採用済み工程・工程間関係・必須成果物を確認する手続き。
// v5 採用規約機構 Design の解決手順（採用宣言の確認 → 基準の特定 → 判定）の実装側。
//
// - 採用宣言が存在する場合: その宣言を正規の採用規約として解決する
// - 採用宣言が存在しない場合: 移行期デフォルトへ接続する。
//   移行期デフォルトは「プロジェクトの現に実効している工程・成果物の運用」であり、
//   機械的に基準へ変換しない（現行運用の意味判断は呼出側の実行契約が行う）。
//   本 resolver は参照点の提示のみを行い、参照モデル（未採用の例示）を
//   基準の入力にしない
// - 解決が実行不能な場合（読取不能、schema 不適合）: 判定を下さず判断留保として扱う。
//   実行不能な解決を、全要件の不存在や全工程の省略として解釈しない
// - 純関数として実装し、工程進捗の恒久状態を保持しない

import { loadConventions } from "./parse.ts";
import type { AdoptedConventions, AdoptedProcess, RequiredArtifact } from "./schema.ts";

export type ResolutionBasis =
  | { readonly basis: "adopted"; readonly file: string; readonly declarations: AdoptedConventions }
  | { readonly basis: "transition-default"; readonly file: null; readonly reference: string }
  | { readonly basis: "unresolvable"; readonly file: string; readonly reason: string; readonly issues: readonly unknown[] };

/** 移行期デフォルトの参照点の説明（現行運用の正規成果物から解決する旨の固定文面）。 */
export const TRANSITION_DEFAULT_REFERENCE =
  "採用宣言が存在しないため移行期デフォルトへ接続する。プロジェクトの現に実効している工程・成果物の運用を、現行の正規成果物（docs/requirements、docs/designs、docs/decisions、配布物の workflow 定義等）から解決すること。実効していない参照例の工程を、現行運用に読み込んで解決しない";

/** 解決手順の第 1 段階: 採用宣言の確認と解決基準の決定。 */
export function resolveBasis(root: string, file?: string): ResolutionBasis {
  const loaded = loadConventions(root, file);
  switch (loaded.status) {
    case "absent":
      return { basis: "transition-default", file: null, reference: TRANSITION_DEFAULT_REFERENCE };
    case "unreadable":
      return { basis: "unresolvable", file: loaded.file, reason: `採用宣言を読み取れない: ${loaded.detail ?? "不明な読取エラー"}`, issues: [] };
    case "invalid":
      return { basis: "unresolvable", file: loaded.file, reason: "採用宣言の schema が不適合（silent skip しないため解決を実行不能とする）", issues: loaded.issues };
    case "loaded":
      return { basis: "adopted", file: loaded.file, declarations: loaded.declarations };
  }
}

export interface ProcessRelation {
  /** 前置工程（完了が前提）。 */
  readonly from: string;
  /** 後続工程。 */
  readonly to: string;
}

export interface InheritedObligationRecord {
  readonly process: string;
  readonly restructuredFrom: readonly string[];
  readonly obligations: {
    readonly requirements: readonly string[];
    readonly constraints: readonly string[];
    readonly acceptanceCriteria: readonly string[];
    readonly verificationObligations: readonly string[];
  };
}

/** 基準の特定の結果（対象作業の判定基準として参照する採用済み基準）。 */
export interface ResolvedCriteria {
  readonly processes: readonly AdoptedProcess[];
  /** 工程間関係（requires から導出した順序・依存）。 */
  readonly processRelations: readonly ProcessRelation[];
  readonly requiredArtifacts: readonly RequiredArtifact[];
  /** 分割・統合元の工程から継承した義務（元の義務を失わせないための保持）。 */
  readonly inheritedObligations: readonly InheritedObligationRecord[];
}

/**
 * 解決手順の第 2 段階: 採用規約から、対象作業に適用される基準を特定する。
 * 参照モデル（未採用の例示）は基準の特定の入力にしない。
 * scope を指定した場合、対象工程の部分集合（単独工程の実施）に限定して特定する。
 * scope 内の工程が requires で scope 外の前置工程を参照する場合、
 * その前置工程も基準に含める（依存切断で義務が失われないため）。
 */
export function identifyCriteria(declarations: AdoptedConventions, scope?: readonly string[]): ResolvedCriteria {
  const processById = new Map(declarations.processes.map((p) => [p.id, p] as const));
  let selected: readonly AdoptedProcess[];
  if (scope === undefined || scope.length === 0) {
    selected = declarations.processes;
  } else {
    const unknown = scope.filter((id) => !processById.has(id));
    if (unknown.length > 0) {
      throw new Error(`scope に採用されていない工程 id が含まれる: ${unknown.join(", ")}`);
    }
    const selectedIds = new Set<string>();
    const queue = [...scope];
    while (queue.length > 0) {
      const id = queue.shift();
      if (id === undefined || selectedIds.has(id)) continue;
      selectedIds.add(id);
      const process = processById.get(id);
      if (process === undefined) continue;
      for (const required of process.requires) {
        if (!selectedIds.has(required)) queue.push(required);
      }
    }
    selected = declarations.processes.filter((p) => selectedIds.has(p.id));
  }
  const selectedIds = new Set(selected.map((p) => p.id));
  const processRelations: ProcessRelation[] = [];
  for (const process of selected) {
    for (const from of process.requires) {
      if (selectedIds.has(from)) {
        processRelations.push({ from, to: process.id });
      }
    }
  }
  const requiredArtifacts = declarations.requiredArtifacts.filter((a) => selectedIds.has(a.process));
  const inheritedObligations: InheritedObligationRecord[] = [];
  for (const process of selected) {
    if (process.restructuredFrom.length > 0 && process.inheritsObligations !== null) {
      inheritedObligations.push({
        process: process.id,
        restructuredFrom: process.restructuredFrom,
        obligations: process.inheritsObligations,
      });
    }
  }
  return { processes: selected, processRelations, requiredArtifacts, inheritedObligations };
}
