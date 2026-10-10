// 判定規則の実装。採用規約機構 Design の判定規則 2 条（誤判定禁止・省略合格禁止）と
// 根拠確認の機械的部分を所有する。
//
// 判定規則 2 条:
// 1. 誤判定禁止: 採用されていない参照例の工程・成果物が存在しないことを欠落と判定しない。
//    参照例は基準に含まれず、基準に含まれない成果物の不在は正である
// 2. 省略合格禁止: 採用済みで必須の成果物が存在しない場合、ファイル不在だけを根拠に
//    工程省略として合格させない。工程省略は、採用規約上の採用外・省略の明示、または
//    対象作業の実行契約における根拠ある除外宣言によってのみ成立する。
//    ファイル不在は欠落として検出した上で根拠確認を経て解消し、
//    根拠確認を経ない不在は欠落のままとする
//
// 判定の入力は採用規約（または解決結果）であり、参照モデルの工程一覧を入力にしない。
// 純関数として実装し、工程進捗の恒久状態を保持しない。

import { statSync } from "node:fs";
import { identifyCriteria, type ResolutionBasis, type ResolvedCriteria } from "./resolve.ts";

export type ArtifactVerdict =
  | { readonly status: "pass"; readonly process: string; readonly artifact: string }
  | { readonly status: "excluded-with-basis"; readonly process: string; readonly artifact: string; readonly reason: string }
  | { readonly status: "missing"; readonly process: string; readonly artifact: string; readonly confirmationRequired: true }
  | { readonly status: "not-in-criteria"; readonly process?: string; readonly artifact: string };

export type EvaluateOutcome =
  | {
      readonly outcome: "judged";
      readonly verdicts: readonly ArtifactVerdict[];
      readonly accepted: boolean;
      readonly summary: {
        readonly total: number;
        readonly pass: number;
        readonly excluded: number;
        readonly missing: number;
        readonly notInCriteria: number;
      };
    }
  | { readonly outcome: "judgment-deferred"; readonly basis: "transition-default"; readonly reference: string }
  | { readonly outcome: "unresolvable"; readonly reason: string; readonly issues: readonly unknown[] };

function artifactExists(root: string, artifact: string): boolean {
  const path = `${root}/${artifact}`;
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/**
 * 解決結果の基準に対し、対象成果物の有無と成立根拠を判定する。
 * 基準に含まれない成果物の不在は欠落として計上しない（誤判定禁止）。
 * 採用済み必須成果物の不在は missing（合格禁止）として返し、
 * 採用規約上の除外明示（exclusions）がある場合のみ excluded-with-basis とする。
 */
export function evaluateCriteria(root: string, basis: ResolutionBasis, options?: {
  /** 判定対象工程の部分集合（単独工程の実施）。基準特定の scope として解決に再適用される。 */
  readonly processScope?: readonly string[];
  /** 存在確認の対象パス（リポジトリ相対）を限定する。指定時はそのパスのみ判定する。 */
  readonly checkPaths?: readonly string[];
  /** 実行契約由来の根拠ある除外宣言（対象作業側で承認済みのもの）。 */
  readonly executionExclusions?: readonly { readonly process: string; readonly artifact: string; readonly reason: string }[];
}): EvaluateOutcome {
  if (basis.basis === "transition-default") {
    return { outcome: "judgment-deferred", basis: "transition-default", reference: basis.reference };
  }
  if (basis.basis === "unresolvable") {
    return { outcome: "unresolvable", reason: basis.reason, issues: basis.issues };
  }
  const criteria: ResolvedCriteria = identifyCriteria(basis.declarations, options?.processScope);
  const exclusionReasons = new Map<string, string>();
  for (const exclusion of basis.declarations.exclusions) {
    exclusionReasons.set(`${exclusion.process}\n${exclusion.artifact}`, exclusion.reason);
  }
  for (const exclusion of options?.executionExclusions ?? []) {
    // 空の根拠は除外宣言として成立しない（根拠のない不在は missing のまま）
    if (exclusion.reason.trim() === "") continue;
    exclusionReasons.set(`${exclusion.process}\n${exclusion.artifact}`, exclusion.reason);
  }
  const targets = options?.checkPaths !== undefined && options.checkPaths.length > 0
    ? criteria.requiredArtifacts.filter((a) => options.checkPaths!.includes(a.path))
    : criteria.requiredArtifacts;
  const verdicts: ArtifactVerdict[] = [];
  for (const artifact of targets) {
    if (artifactExists(root, artifact.path)) {
      verdicts.push({ status: "pass", process: artifact.process, artifact: artifact.path });
      continue;
    }
    const reason = exclusionReasons.get(`${artifact.process}\n${artifact.path}`);
    if (reason !== undefined) {
      verdicts.push({ status: "excluded-with-basis", process: artifact.process, artifact: artifact.path, reason });
      continue;
    }
    verdicts.push({ status: "missing", process: artifact.process, artifact: artifact.path, confirmationRequired: true });
  }
  // checkPaths に基準外のパスが含まれる場合、誤判定禁止規則を明示的に返す
  if (options?.checkPaths !== undefined) {
    const criteriaPaths = new Set(criteria.requiredArtifacts.map((a) => a.path));
    for (const checkPath of options.checkPaths) {
      if (!criteriaPaths.has(checkPath)) {
        verdicts.push({ status: "not-in-criteria", artifact: checkPath });
      }
    }
  }
  const count = (status: ArtifactVerdict["status"]) => verdicts.filter((v) => v.status === status).length;
  const missing = count("missing");
  return {
    outcome: "judged",
    verdicts,
    accepted: missing === 0,
    summary: {
      total: verdicts.length,
      pass: count("pass"),
      excluded: count("excluded-with-basis"),
      missing,
      notInCriteria: count("not-in-criteria"),
    },
  };
}

/** 特定パス 1 件の軽量判定（対象作業からの即時問い合わせ用）。 */
export function evaluateArtifactPath(root: string, basis: ResolutionBasis, artifactPath: string): ArtifactVerdict {
  const result = evaluateCriteria(root, basis, { checkPaths: [artifactPath] });
  if (result.outcome !== "judged") {
    throw new Error(`判定できない解決状態（basis: ${basis.basis}）でパス判定は実行できない`);
  }
  const verdict = result.verdicts.find((v) => v.artifact === artifactPath);
  if (verdict === undefined) {
    throw new Error(`判定結果にパスが反映されていない: ${artifactPath}`);
  }
  return verdict;
}
