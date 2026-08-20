# スコープ外残存の再帰ファイル探索実装 6 箇所の後続移行候補

## 観測
PR 2357（OU-002 再帰ファイル探索移行）の TS-001 残存スキャンで、Execution Contract の変更対象成果物外として未移行の再帰列挙実装が 6 箇所残存する（いずれも `.opencode/skills/repo-agentdev-integrity/scripts/` 配下）。

- `lib/distribution-boundary-fs.ts` listArtifactsRec
- `lib/distribution-boundary-rules.ts` listPublicMarkdownFiles
- `trusted-distribution-gate/archive-installed-verifier.ts`
- `trusted-distribution-gate/archive-zip.ts`
- `generate_indexes.ts` countDesignFiles
- `effectiveness/independent_search.ts` walkFiles

## 今回扱わない理由
Issue 2353 の Execution Contract「変更対象成果物」に含まれず、artifact-graph Design の移行契約は lib 3 ファイルのみを列挙している。`effectiveness/independent_search.ts` の walkFiles は Graph を使わない独立探索として意図的に素の fs 実装を保持する評価 harness である。

## 影響
委譲対象3領域の移行は完了したが、リポジトリ全体では再帰列挙の独自実装が残存する。REQ-044-001「二重経路なし」の解釈は移行契約スコープ内で判定済み（Epic 2351 完了条件の最終評価記録参照）。現状機能への影響なし。

## レビューで決めること
- 残存 6 箇所を後続 Issue として移行するか、意図的な移行対象外として checker-execution-contracts Design に明記するか（independent_search は独立探索としての除外が既に根拠明示済み）

## 根拠
- PR 2357 本文「Findings / Capture候補」2件目、TS-001「意図的な移行対象外」（回収元: https://github.com/yogata/agent-dev-flow/pull/2357）
