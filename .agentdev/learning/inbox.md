# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-29 Case #3233（case-close Capture 回収・PR #3235 本文 learning 候補）

- bun test フル suite の実測 197.77〜235.88 秒（integrity suite 2600 台・Windows・依存整備なし）は REQ-060-007 の timeout 300〜600 秒標準の妥当性を実測裏付けした。既定 120 秒では打ち切りとなる実測値
- worktree 内の配布物編集では distribution boundary（concrete-id）と IR-055（runtime-unresolved-reference）の両 gate が語彙制約を課す。REQ 行 ID の対応関係は traceability sidecar へ集約する運用が実効的（PR #3235 で 9 sidecar 更新・1 sidecar 新規作成）

## 2026-09-29 Case #3233（case-close 工程内検知）

- git 履歴依存 checker（IR-072 等）の実測結果は commit 前 working tree と commit 後 HEAD で変化し得る（updated 進行 commit が自身を last content-change と判定する構造）。検証記録には実測局面（commit 前後）の明示が必要で、QG-4 checker 実測手順の merge 直前 HEAD 実施規定（REQ-032-030）がこの乖離を検出した実例。checker 側は frontmatter のみ commit 除外で恒久対応済み（e7f1f639）
- case-close の Design 状態評価による Design 本体への経緯追記は merge 前に PR へ含める必要がある。merge 後の追記は反映経路が intake 回収に限定される（本 Case で intake 化: `.agentdev/intake/inbox/2026-09-29-3233-checker-execution-contracts-lifecycle-notes.md`）

