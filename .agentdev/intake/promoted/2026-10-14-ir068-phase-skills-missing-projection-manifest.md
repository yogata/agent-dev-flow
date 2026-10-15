# phase 系 skill 6件の .opencode/skills projection 未登録（IR-068）を解消する

## 観測内容

2026-10-14 時点の check_integrity（source profile）で、phase 系 skill 6件（agentdev-phase-theme-collaboration、agentdev-workflow-phase-artifacts-update、agentdev-workflow-phase-review、agentdev-workflow-phase-tasks-create、agentdev-workflow-phase-tasks-update、agentdev-workflow-phase-transition）が src/common/skills に存在する一方、.opencode/skills projection に欠落している旨の IR-068 NG が 6件検出。兄弟 Case #3684 の PR #3701（投影登録と参照の自己完結化・2026-10-14 merge 済み、main HEAD 485365bd に含む）実施後も同一 6件が残存している。

## 背景（実行 Case で扱わなかった理由）

Root Case #3675 は docs 現行化バッチであり、skill projection・junction の修復（コード・構造変更を伴う）は本筋外。既存処遇として兄弟 Issue #3684（IR-068/IR-055 債務の処遇 Case）が存在するが、PR #3701 merge 後も実測で未解決であるため、現行状態の記録を残す。

## 影響

check_integrity（source profile）の exit 1 が継続。.opencode/skills 側から phase 系 skill が解決できない環境では、依存する workflow 実行時に skill 参照が解決しない。

## 課題（後段 review で決めること）

- PR #3701 で実施済みの投影登録内容と IR-068 検出条件（junction 存在確認か manifest 登録確認か）の乖離の所在特定
- junction 再構築がローカル環境作業（git 管理外）として必要か、manifest 登録の是正が必要かの判断

## 既存要件・既存処遇との関連

- 既存処遇: Issue #3684（IR-068/IR-055 債務の処遇 Case）、PR #3701。PR #3701 実施後も未解決の現行状態記録であり、統合・依存解決は後段 review で実施する
- 代替識別子: PR #3698 本文「Findings/ Capture候補」intake 3件目「Root Case #3675 の検証差分この行」

## 根拠

- 観測元: Root Case #3675（case-run 検証・case-close 再実行、2026-10-14）
- 証拠: check_integrity（source profile）の IR-068 NG 6件（2026-10-14 実測。PR #3701 merge 後の main 485365bd で再確認）
