# Intake Item: REQ-0146-011 意味不一致（識別子中心評価との参照ズレ）

## 発生源

- PR: #1559 (Issue #1558 / AG-001..AG-007, feature)
- 発生 phase: case-close capture 回収 (Step 10)
- capture 分類: intake (後続作業候補 = 別 Issue 検討推奨、user 確認候補)

## 問題

REQ-0146-015（Issue #1558 の req-save 工程、commit c36d1c37 で追加）は、QG-4 観点9 の要件根拠として「識別子中心評価（REQ-0146-011）の運用実例集を同 reference に蓄積し」と明記する。しかし現 REQ-0146-011 の実際の内容は「case-open は子 Issue 本文に『前工程完了度』属性を埋め込む」であり、「識別子中心評価」とは意味的に不一致である。

PR #1559 の AG-004 実装では:
- REQ-0146-015 の後段（運用実例集の蓄積、主評価値と補助値の使い分け）に基づき qg-4 reference 観点9「識別子中心評価の運用実例集」を実装した
- REQ-0146-011 への参照は qg-4 reference 観点9 に注意書きとして明記（自律的な REQ 修正は行わない方針）
- 実害は現状ない（qg-4 観点9 は REQ-0146-015 の後段に基づき機能する）が、REQ-0146-015 → REQ-0146-011 の参照が意味的に不正確なまま残存する

## 推奨修正対象

別 Issue で以下のいずれかを採用（user 確認が必要）:

1. **(a) REQ-0146-011 の内容修正**: 現 REQ-0146-011「case-open は子 Issue 本文に『前工程完了度』属性を埋め込む」を廃止し、「識別子中心評価の運用実例集」へ内容を差し替える。既存の「前工程完了度属性埋め込み」要件は別 REQ（例: REQ-0146-016）として分離
2. **(b) REQ-0146-015 の参照先変更**: REQ-0146-015 の参照を REQ-0146-011 から新規 REQ（例: REQ-0146-016「識別子中心評価の運用実例集」）に変更。REQ-0146-011 は現状維持
3. **(c) REQ-0146-011 の廃止と新規 REQ 移行**: REQ-0146-011 を廃止し、新規 REQ（REQ-0146-016 等）へ要件を統合再編。参照元（REQ-0146-015 等）は新 REQ へ参照更新

推奨: (a)。REQ-0146-015 が意図する「識別子中心評価」を REQ-0146-011 に集約するのが最も自然。「前工程完了度属性埋め込み」要件は独立 REQ として整理する。

影響範囲:
- `docs/requirements/REQ-0146.md`（REQ-0146-011 内容修正、または新規 REQ-0146-016 追加）
- `docs/specs/quality/quality-gates.md`（QG-4 観点9 の REQ 参照が更新される場合あり）
- `src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md` 観点9 の注意書き（REQ-0146-011 意味不一致注記）を削除可能
- 過去 Issue/PR 完了条件で REQ-0146-011 を参照するものがあるか確認（横展開）

昇格先候補: REQ ファイル運用 SPEC（`docs/specs/responsibilities/` 配下）、または `agentdev-req-file-manager` skill の REQ 整合性確認プロセス。

## 関連

- references: docs/requirements/REQ-0146.md (REQ-0146-011, REQ-0146-015)
- references: src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md (観点9 L123-166, REQ-0146-011 意味不一致注記 L166)
- Issue: #1558 (CLOSED, AG-004 実装 PR #1559)
- PR: #1559 (squash merge a8ab3fd6ed3ad1689aea259fb7526659e74912ed, Findings ### intake REQ-0146-011 意味不一致)
- ADR/REQ: REQ-0146-015 追加時の req-save（commit c36d1c37、Issue #1558 の OU-001）
