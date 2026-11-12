# agentdev-artifact-validation scripts README.md 59 行に既存 textlint 助言（sentence-length・110文字）が残存

## 観測事実

- Case #4005（PR #4017 本文 Findings/intake 候補）で記録。`agentdev-artifact-validation/scripts/README.md` 59 行に既存の textlint 助言（sentence-length・110 文字）が残る。本次変更（B1-2）の対象外の既存行。
- textlint gate は既存助言を対象外扱いで合格（本 Case 受入済み・PR #4017 記録）。

## 処置候補

- 当該行の文分割・文体調整による助言解消の要否を promote 判断で評価する（低緊急度・既存助言の恒久残存債務の一部）。

## 関連

- Case #4005・PR #4017（検証差分 #13 textlint 関連・TS-008）
