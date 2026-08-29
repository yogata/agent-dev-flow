# package-release-archive.ps1 が現行 HEAD で zip を公開できない（exit 6、pre-existing）

## 観測

package-release-archive.ps1 の実行が事前境界検査（archive profile）で失敗し exit 6 となる。失敗要因は agentdev-gh 系 README 等の concrete-id 違反 10件。

- origin/main と当該スクリプト・違反対象ファイルは差分ゼロ（main 既存の状態）
- Epic 2446 Wave 1（PR 2456/2457/2458/2459）が導入したものではない
- PR 2459 の TS-005 release 投影検証は、staged tree 再現 + zip 中身走査により「投影範囲に third-party 本体なし」を PASS で確認済み（スクリプトの zip 公開経路とは別の検証経路）

## 今回扱わない理由

修正には `src/opencode/tools|plugins` の README 編集が必要だが、Issue 2450 の変更対象成果物外。Wave 1 の完了条件（投影範囲に third-party 本体を含まない）とは独立の pre-existing 条件。

## 影響

release archive の実公開が不可能。配布物のリリース手順がブロックされ続ける。

## レビューで決めること

- archive 公開が必要になるまでの対応時期
- 対応方針: concrete-id の除去（distribution-baseline-cleanup intake と共通）または archive profile 検査の例外設計のどちらで解消するか

## 根拠

- PR 2459 本文「Findings / Capture候補」intake 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2459 ）
