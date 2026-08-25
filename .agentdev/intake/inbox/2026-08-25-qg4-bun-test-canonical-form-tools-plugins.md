# QG-4 bun test フルスイート正規形の tools/plugins 対象拡張

## 観測

QG-4 の bun test フルスイート正規形（3 cwd 分割: integrity suite / src skills / root guards）は `src/opencode/tools/`・`src/opencode/plugins/` を対象に含まない（スイート B は src/opencode/skills/ のみ）。Wave 2 で Custom Tool・Plugin/Hook が正規配布種別となり、専属スイート（93 tests、4 files）が存在するが、正規形の機械受理対象の外にある。Wave 2 の case-close 事後再実行では正規形 3 cwd（2458 / 97 / 140 pass）に加えて補足（正規形外）として 93 pass を別途記録した。

## 今回扱わない理由

正規形の定義は quality-gates Design（qg-4-final-acceptance「bun test フル suite 正規形（実行形態契約）」）が所有する。case-close が正規形を拡張すると Design と実行記録の整合が崩れるため、Design 更新を経由すべき。

## 影響

tools/plugins のスイートが機械受理対象外である間、配布種別のテスト欠落は QG-4 の fail として検出されない（PR 本文の自主記録に依存する）。

## レビューで決めること

- 正規形へスイート D（`bun test ./src/opencode/tools/ ./src/opencode/plugins/`）を追加するか、スイート B の対象を src/opencode 全体に拡張するか
- quality-gates Design（および agentdev-quality-gates references/qg-4-final-acceptance.md）の更新方法（design-save 経由の更新 Case として起票するか）

## 根拠

- PR 2434 本文「Design確定候補」item 3
- Issue 2430 対応記録コメント（case-close、テスト結果の補足行）
