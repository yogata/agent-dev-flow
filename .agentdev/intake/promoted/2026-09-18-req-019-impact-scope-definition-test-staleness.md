# REQ-019 影響範囲検出 gate の適用範囲確認 — Definition 変更時に docs 文言を期待値とするテストが陳腐化する（改善候補）

## 観測

Case #2936（実装 PR #2948、Wave 2-1）で、traceability_workflow_integration.test.ts の REQ-021-015/022 割り当て文言検査が Wave 1（Definition PR #2937）の docs 更新により陳腐化しており、本 PR 変更前から fail していたことを確認した。docs（正規文言）を期待値とするテストは docs 変更と同一変更単位で更新されないと陳腐化するが、Definition PR（docs 変更）ではテスト更新が行われない運用のため、実装 Wave の worktree bun test で先行 fail が混入した。本 PR では docs 現行文言へ期待更新して解消済み。

## 今回扱わない理由

本 Case（#2936）の合意済み Definition は TIM 4役割・sidecar・policy モデルの実現（RA-001..013）であり、REQ-019 影響範囲検出 gate の適用範囲拡張は対象範囲外。規約検討は別作業候補。

## 影響

Definition 変更のたびに、docs 文言を期待値とする文言検証テスト全般で同種の先行 fail が混入し得る。実装 Wave の検証差分に「本変更起因でない先行 fail」の由来分類コストが毎回発生し、機械受理基準の判定を煩雑化させる。

## レビューで決めること

(1) Definition 変更時にテスト更新担当を明示する規約を導入するか（case-open / case-ready の Definition 品質検査に「docs 文言を期待値とするテストの影響確認」を追加）。(2) REQ-019 影響範囲検出 gate の適用範囲に「docs 文言を期待値とするテスト」を含めるか判断するか。(3) 現状挙動を既知制限として文書化するか。

## 根拠（任意）

PR #2948 本文 検証差分・Findings「traceability_workflow_integration.test.ts の REQ-021-015/022 割り当て文言検査が Wave 1（Definition PR #2937）の docs 更新により陳腐化していた（本 PR 変更前から fail）」。2026-09-18、Case #2936 main 8ceb90ac 時点。

## intake-promote 確定注記（2026-09-18、adversarial-review 実施済み）

本 item は intake-promote の対論型レビューを経て「採用」で自律確定した（観測正確・fix 解消裏付け付き）。

- 同一事象の学びが learning にも記録されていた（2026-09-18「Definition 変更（Wave 1 docs 更新）により既存テストの期待文言が陳腐化」。learning-promote 2026-09-18 実行では deferred 分類）。本 item を主として backlog-review で処理し、learning 側 deferred エントリは再評価時に本 item の処置を参照すること。
- 対応方針（REQ-019 影響範囲検出 gate の適用範囲確認）の要否判断は backlog-review → req-define で行う。
