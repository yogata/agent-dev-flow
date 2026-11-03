// 依拠版に基づく差分・変更影響・増分更新 CLI（lib/relied_diff.ts の公開契約）。
// 既存 impact CLI（src/impact.ts）の引数・出力契約は変更せず、独立した CLI として追加する。
//
// 使い方:
//   bun scripts/src/relied-diff.ts --root <repo-root> --relied <commit> [--head <commit>]
//     [--paths <p1,p2>] [--downstream <path>] [--evidence-basis <commit>] [--basis-note <text>]
//
// - --relied は既存下流成果物が実際に依拠した上流版。工程開始時点のコミットやタグを
//   機械的に仮定しないため、呼出側が正規成果物・承認・検証記録・Git 履歴から確認した
//   依拠版を明示指定する。省略時・解決不能時は unverified レポートを返し、
//   「影響なし」や「完了」の判定を出さない
// - --basis-note は比較基準を特定できない場合の代替整合確認の判断根拠の記録チャネル。
//   呼出側が示した根拠をそのまま出力に保持する（比較自体は依拠版解決後の再実行で行う）
// - 削除・移動元は依拠版から読み、現行版の走査だけで候補を落とさない
// - Git 実行不能（git 不在・非 git リポジトリ等）は構造化エラーで非ゼロ終了する

import { existsSync } from "node:fs";
import { fail, emitJson, normalizeArtifactPath, parseArgs, resolveRoot } from "../lib/cli_utils.ts";
import {
  blobAt,
  classifyDownstream,
  classifyEvidenceIntegration,
  classifyPathImpact,
  diffNameStatus,
  EMPTY_RELIED_DIFF_NOTE,
  judgePropagationCompletion,
  listTouchedPaths,
  resolveCommit,
} from "../lib/relied_diff.ts";
import type { PathGitFacts, PathImpact } from "../lib/relied_diff.ts";

const args = parseArgs(process.argv.slice(2));
const rootValue = args.get("root");
if (!rootValue) fail("--root は必須です（例: --root <repo-root>）");
const root = resolveRoot(rootValue);
if (!existsSync(root)) fail(`--root が存在しません: ${root}`);

const reliedRef = args.get("relied");
const headRef = args.get("head") ?? "HEAD";
const pathsArg = args.get("paths");
const downstreamArg = args.get("downstream");
const evidenceRef = args.get("evidence-basis");
const basisNote = args.get("basis-note");

const headCommit = resolveCommit(root, headRef);
if (headCommit === null) {
  fail(JSON.stringify({ error: "head-unresolvable", head: headRef }));
}

const reliedCommit = reliedRef ? resolveCommit(root, reliedRef) : null;

// 依拠版が指定されたのに解決できない場合は、比較基準を特定できない状態として
// unverified レポートを返す（影響なし・完了としない）。指定なしも同様。
if (reliedRef && reliedCommit === null) {
  emitJson({
    mode: "relied-diff",
    reliedCommit: null,
    headCommit,
    comparisonRange: "unresolved",
    basisNote: basisNote ?? null,
    impacts: [],
    downstream: null,
    evidence: classifyEvidenceIntegration([], false),
    fullyPropagated: "undetermined",
    emptyResult: false,
    note:
      `指定された依拠版（${reliedRef}）を解決できない。比較基準を特定できないため影響分類を実行しない。` +
      "正規成果物・承認・検証記録・Git 履歴から依拠版を確認し、--relied で再実行すること。根拠がない限り「影響なし」や「完了」と判定しない",
  });
  process.exit(0);
}

if (!reliedCommit) {
  const requestedPaths = pathsArg ? parsePaths(pathsArg) : [];
  emitJson({
    mode: "relied-diff",
    reliedCommit: null,
    headCommit,
    comparisonRange: "unresolved",
    basisNote: basisNote ?? null,
    impacts: [],
    downstream: null,
    evidence: classifyEvidenceIntegration([], false),
    fullyPropagated: "undetermined",
    emptyResult: false,
    note:
      "比較基準（依拠版）が指定されていないため影響分類を実行しない。" +
      (requestedPaths.length > 0
        ? "代替整合確認の対象として指定されたパスは basisNote と併せて記録する。"
        : "--paths で依拠版比較の対象上流パスを列挙し、正規成果物・承認・検証記録・Git 履歴から依拠版を確認して --relied で再実行すること。") +
      "根拠がない限り「影響なし」や「完了」と判定しない",
    alternativesRequestedPaths: requestedPaths,
  });
  process.exit(0);
}

function parsePaths(value: string): string[] {
  return value
    .split(",")
    .map((s) => normalizeArtifactPath(s.trim()))
    .filter((s) => s.length > 0);
}

// 候補パス集合の決定: 指定パス（--paths）∪ 依拠版..現行版の name-status 全パス
// ∪ 履歴で触れたパス（git log --name-only）。履歴由来のパスは正味差分ゼロでも
// 中間変更情報を候補決定へ反映する（変更起点の後続引き継ぎ）。
const nameStatus = diffNameStatus(root, reliedCommit, headCommit);
if (nameStatus === null) {
  fail(JSON.stringify({ error: "git-unavailable", reason: "git diff --name-status の実行に失敗した" }));
}

const requestedPaths = pathsArg ? parsePaths(pathsArg) : [];
const candidateSet = new Set<string>(requestedPaths);
for (const entry of nameStatus) candidateSet.add(entry.path);

const touched = listTouchedPaths(root, reliedCommit, headCommit);
if (touched === null) {
  fail(
    JSON.stringify({
      error: "git-unavailable",
      reason: "git log --name-only（履歴取得）の実行に失敗した。失敗を空の変更集合として隠蔽しない",
    }),
  );
}
for (const p of touched) candidateSet.add(p);

const factEntries: PathGitFacts[] = [...candidateSet].sort().map((path) => {
  const entry = nameStatus.find((e) => e.path === path);
  return {
    path,
    reliedBlob: blobAt(root, reliedCommit!, path),
    headBlob: blobAt(root, headCommit, path),
    intermediateTouched: touched.has(path),
    changeKind: entry?.kind ?? "unchanged",
    ...(entry?.peer !== undefined ? { renamePeer: entry.peer } : {}),
  };
});

const impacts = factEntries
  .map((facts) => classifyPathImpact(facts))
  .filter((impact): impact is NonNullable<typeof impact> => impact !== null);

// lib 決定表契約「両版とも不在のパスは候補から除外する」は維持する（除外は lib）。
// 候補のうち分類結果に現れないパスを CLI 層で unverified として報告し、
// 判断根拠の得られない指定・参照不能パスが無判定のまま完了にならないようにする（報告は CLI）。
const classifiedPaths = new Set<string>(impacts.map((impact) => impact.path));
const unverifiedImpacts: PathImpact[] = [...candidateSet]
  .filter((path) => !classifiedPaths.has(path))
  .sort()
  .map((path) => {
    const entry = nameStatus.find((e) => e.path === path);
    return {
      path,
      changeKind: entry?.kind ?? "unchanged",
      classification: "unverified" as const,
      basis:
        "依拠版・現行版のいずれにもパスが存在せず、分類の判断根拠が得られない" +
        "（指定誤り・参照不能・中間版での作成と削除の可能性）。根拠が得られないため" +
        "「影響なし」や「完了」と判定しない",
      propagationRequired: touched.has(path),
      reliedBlob: null,
      headBlob: null,
      intermediateTouched: touched.has(path),
      ...(entry?.peer !== undefined ? { renamePeer: entry.peer } : {}),
    };
  });
impacts.push(...unverifiedImpacts);

const downstream = downstreamArg
  ? classifyDownstream(normalizeArtifactPath(downstreamArg), blobAt(root, headCommit, normalizeArtifactPath(downstreamArg)))
  : null;

const evidenceCommit = evidenceRef ? resolveCommit(root, evidenceRef) : null;
const evidence = classifyEvidenceIntegration(
  factEntries.map((facts) => ({
    path: facts.path,
    evidenceBlob: evidenceCommit ? blobAt(root, evidenceCommit, facts.path) : null,
    headBlob: facts.headBlob,
  })),
  evidenceCommit !== null,
);

const fullyPropagated = judgePropagationCompletion(impacts, downstream);
const emptyResult = impacts.length === 0 && downstream === null;

emitJson({
  mode: "relied-diff",
  reliedCommit,
  headCommit,
  comparisonRange: `${reliedCommit}..${headCommit}`,
  basisNote: basisNote ?? null,
  impacts,
  downstream,
  evidence,
  fullyPropagated,
  emptyResult,
  ...(emptyResult ? { note: EMPTY_RELIED_DIFF_NOTE } : {}),
});
