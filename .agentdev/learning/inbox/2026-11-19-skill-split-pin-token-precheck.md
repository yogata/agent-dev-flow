---
id: learn-20261119-skill-split-pin-token-precheck
created_at: 2026-11-19
source: case-run deviation capture (Root Case #4150・PR #4161)
status: inbox
---
# SKILL/Design 分割で pin 型テストの references 追随が漏れ、case-close の full integrity suite で初めて顕在化した

- 問題事象: SKILL 本文固定トークン（verification_diff_contract.test.ts の 4 箇所等）が SKILL 分割で fail した。固定トークン事前 grep（skill authoring 前段チェック）の走査対象が SKILL.md 本体のみで、テスト側の pin（toContain/toMatch の文言・固定値）が分割後の references/ 側に追随する前提がなかった。scripts 配下の pin テスト計 10 件（suite2 6 件・suite3 4 件）が case-close 機械工程の full-repository bun test（suite2・suite3 分割）で初めて検出された
- 発生局面: case-run（Issue 4156・Case 4150 Wave-4・PR 4161。検出は case-close 機械工程 pre-merge 第1回実行）
- 検知方法: bun test 分割実行（./src/・./.opencode/plugins/ ./scripts/ の分割で pin テストを実行する対象が起動された）
- 根本原因: skill authoring の固定トークン事前 grep が「SKILL.md 本体」を対象とし、「テスト側の pin 固定値」を対象に含めていない。case-run 段階の bun test が suite1 相当（検証エンジン scripts）のみで、scripts/ 配下の pin テストを実行する分割は case-close の full-repository 宣言まで起動されなかった
- 自律対応内容: pin の文言の正が references/ 側に存在することを確認したうえで、7 テストの検査対象を本体+references/ 連結へ追随させる追補 commit（046d7e42f）を case-close 工程で PR へ追加し、bun test 4 分割・pre-commit/pre-push を再検証してから merge した
- ユーザー確認有無: なし（機械的文言追随であり、文言の正の存在を references 側で確認済み）
- Decision/REQ/spec 影響: agentdev-skill-authoring・agentdev-command-authoring の品質基準（固定トークン事前 grep の対象拡張）への反映候補
- 横展開観点: SKILL/Design 分割を含む変更では、pin 型テスト（文言 pin・固定値 pin・件数 pin）の走査対象を事前に grep し、references への追随を同一変更内で完結させる。bun test の分割実行対象（scripts/・src/・plugins/）を case-run 段階で少なくとも1回起動しないと pin テストの fail は case-close まで顕在化しない
- 再発条件: SKILL/Design の骨格+references 分割を含む変更で、scripts 配下の pin テストが本体文言を参照し、変更内で追随更新していない場合
- 予防策候補: skill authoring の前段チェックを「SKILL.md 本体に加えてテスト固定値」へ拡張する。分割対象の test strategy に「pin 型テストの走査対象確認」を前置項目として含める
- 想定反映先: agentdev-skill-authoring・agentdev-command-authoring の品質基準、case-close 機械工程の検証差分記録
- 関連: Case 4150、Issue 4156、PR 4161（Findings F3）
- タグ: SKILL 分割、pin テスト、references 追随、固定トークン、前段チェック
