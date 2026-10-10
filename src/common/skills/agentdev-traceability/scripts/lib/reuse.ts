// 変更前の証拠を再利用する場合の構造的適用可否確認（追跡・品質検証モデルにおける
// 証拠再利用時の適用可否確認要件の機械解決面。v4-traceability-model Design と
// agentdev-traceability Design「advisory 能力と品質ゲートとしての check の境界」節の
// 構造/意味分離に従う）。
//
// - 構造検査で確認できる範囲（対象の存在・読取可能性、宣言済み対応関係の現状、
//   上流・下流の隣接工程間対応の現状）を列挙して返す
// - 版・条件の適合（旧版の証拠と現在の対象・条件の同一性の内容判断）は意味的
//   品質検証であり、本確認は合格判定を返さない。manualConfirmation へ確認事項を
//   明示し、再利用側の検証手続きが独立に評価する
// - git 解決・差分取得は行わない（決定的走査のみ。revision は記録専用）

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseDeclarations } from "./declarations.ts";
import type { CoverDeclaration } from "./declarations.ts";
import { scanCorpus } from "./corpus.ts";
import type { ScanResult } from "./corpus.ts";

export interface EvidenceReuseRelation {
  readonly role: string;
  readonly reqIds: readonly string[];
}

export interface ReuseCheckResult {
  /** 再利用対象の証拠成果物（リポジトリ相対パス）。 */
  readonly evidence: string;
  /** 証拠の版（呼出側が指定した識別子。解決・比較は行わない）。 */
  readonly revision?: string;
  readonly exists: boolean;
  /** 存在しない・読取不能の場合の理由。 */
  readonly existsReason?: string;
  /** 証拠成果物自身が対応宣言する要件関係（現在の要件・条件との照合入力）。 */
  readonly declaredRelations: readonly EvidenceReuseRelation[];
  /** 証拠成果物が links 宣言する上流（下流→上流）。 */
  readonly upstreamArtifacts: readonly string[];
  /** 証拠成果物を上流として参照する下流（上流→下流の逆引き）。 */
  readonly downstreamArtifacts: readonly string[];
  /** 構造検査の状態。confirmed: 対象が存在し宣言関係を列挙した。 */
  readonly structuralStatus: "confirmed" | "evidence-not-found";
  /** 構造検査で解決せず、再利用側の検証手続きが確認すべき事項。 */
  readonly manualConfirmation: readonly string[];
  readonly note: string;
}

export const REUSE_NOTE =
  "本結果は構造検査のみであり、証拠の適用可否を合格判定しない。manualConfirmation の確認を経ない証拠再利用を変更反映完了の根拠にしない";

function toForwardSlash(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function collectDeclarationsOf(content: string, file: string): readonly CoverDeclaration[] {
  return parseDeclarations(file, content).declarations;
}

/**
 * 証拠成果物の再利用適用可否確認の構造部分を実行する。
 * 存在確認、covers 宣言関係の列挙、links の双方向列挙を行い、
 * 版・条件の適合確認事項を manualConfirmation として明示する。
 */
export function evaluateEvidenceReuse(
  root: string,
  evidenceValue: string,
  revision?: string,
): ReuseCheckResult {
  const evidence = toForwardSlash(evidenceValue);
  const normalizedRevision = revision && revision.trim() !== "" ? revision.trim() : undefined;
  const manualConfirmation = [
    "版の適合: 証拠が形成された版と現在の対象の版の差分内容を確認し、証拠が現在の対象に適用可能か判断する",
    "条件の適合: 証拠の検証実行条件（入力、環境、前提）と現在の条件の同一性を確認する",
  ];
  let st;
  try {
    st = statSync(join(root, evidence));
  } catch {
    return {
      evidence,
      ...(normalizedRevision ? { revision: normalizedRevision } : {}),
      exists: false,
      existsReason: "file-not-found",
      declaredRelations: [],
      upstreamArtifacts: [],
      downstreamArtifacts: [],
      structuralStatus: "evidence-not-found",
      manualConfirmation,
      note: REUSE_NOTE,
    };
  }
  if (!st.isFile()) {
    return {
      evidence,
      ...(normalizedRevision ? { revision: normalizedRevision } : {}),
      exists: false,
      existsReason: "not-a-regular-file",
      declaredRelations: [],
      upstreamArtifacts: [],
      downstreamArtifacts: [],
      structuralStatus: "evidence-not-found",
      manualConfirmation,
      note: REUSE_NOTE,
    };
  }
  let content: string | undefined;
  try {
    content = readFileSync(join(root, evidence), "utf-8");
  } catch {
    return {
      evidence,
      ...(normalizedRevision ? { revision: normalizedRevision } : {}),
      exists: false,
      existsReason: "unreadable",
      declaredRelations: [],
      upstreamArtifacts: [],
      downstreamArtifacts: [],
      structuralStatus: "evidence-not-found",
      manualConfirmation,
      note: REUSE_NOTE,
    };
  }
  const own = collectDeclarationsOf(content, evidence);
  const declaredRelations = own.map((d) => ({
    role: d.role,
    reqIds: [...d.reqIds],
  }));
  const scan: ScanResult = scanCorpus(root);
  const upstream = new Set<string>();
  const downstream = new Set<string>();
  for (const link of scan.links) {
    if (link.source === evidence) upstream.add(link.target);
    if (link.target === evidence) downstream.add(link.source);
  }
  return {
    evidence,
    ...(normalizedRevision ? { revision: normalizedRevision } : {}),
    exists: true,
    declaredRelations,
    upstreamArtifacts: [...upstream].sort(),
    downstreamArtifacts: [...downstream].sort(),
    structuralStatus: "confirmed",
    manualConfirmation,
    note: REUSE_NOTE,
  };
}
