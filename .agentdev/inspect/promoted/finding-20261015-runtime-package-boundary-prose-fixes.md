# runtime-package-boundary.md の文意品質是正（異言語文字混入・冗長参照）

- 出所: inspect-docs 20261015T093252Z DS23・DS24（backlog-auto stage 1、系統識別 [inspect-docs]）
- 種別: 表現是正（文意品質）
- 対象: `docs/designs/local/runtime-package-boundary.md`
- 前例: DS-20（case-run.md 簡体字「项」3箇所、20260928 promote → RU 経由で是正実施済み）と同一パターン

## DS23: 異言語文字混入「卡」

- target: `docs/designs/local/runtime-package-boundary.md:488`
- evidence: 「REQ-001 の `repo-*` 卡out 対象」—「carve-out」の意と推定される中国語字「卡」の混入（現物実読で確認）
- severity: medium / confidence: high
- source_of_truth: REQ-094（Markdown 日本語表現基準）
- 処置方針: 「carve-out 対象」へ修正する
- 補足: check_content_corruption の Unicode 検出平面に近接するため、docs-check ルール候補（異言語文字混入〔中国語字等〕の Unicode 検査への追加）を併記する。ルール化の育成は backlog-review 経由

## DS24: 同一 REQ の三重引用

- target: `docs/designs/local/runtime-package-boundary.md:51`
- evidence: 「`consumer-generated` はローカル版 OpenCode を link mode で導入する利用側リポジトリである（REQ-009, REQ-009, REQ-009）。」同一 REQ の三重引用（現物実読で確認）
- severity: low / confidence: high
- source_of_truth: REQ-009
- 処置方針: 「REQ-009」1回へ集約する（条項番号の明示を要するかは是正時に判断）

## review 検証記録（Jev 先行評価 + adversarial-review 2026-10-15、backlog-auto stage 2 inspect 系統）

- Jev 先行評価（観測 20261015T094749Z-77ac、confidence 0.91）: DS23 0.98 / DS24 0.97 で promote 妥当（対抗なし）
- Stream B（証拠適合）: :488 の「卡」、:51 の三重引用を現物実読で確認済み
- HITL 0件・破壊的変更なし
