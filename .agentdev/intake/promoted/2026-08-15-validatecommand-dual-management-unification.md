# テスト内蔵 validateCommand と配布 checker の二重管理の単一化

## 観測内容

commands_error_cases.test.ts 内蔵の validateCommand が、配布 checker と同種の Command 構造検証を独立実装しており二重管理になっている。Command 構造変更時に配布 checker 側は追従してもテスト側が陳腐化し、v1 fail 24件の直接原因となった。

## 影響

- Command 構造変更のたびにテスト側の期待値陳腐化が再発する
- 検証規則が二重管理のため、単一の正が維持できない

## 課題

テスト内蔵 validateCommand を廃止し、配布 checker の規則から期待値を単一化する。SPEC 契約面は別 item（spec-candidate-test-embedded-validator-unification）と一体で要件化する。

## 既存要件・成果物との関連

- 対象: commands_error_cases.test.ts、check_command_format.ts、command-format-rules.yaml
- 関連: SPEC 確定候補「テスト内蔵 validator 単一化の契約」（promoted item 2026-08-15-spec-candidate-test-embedded-validator-unification）

## 出典

- 発生日: 2026-08-15
- 取得元: テスト失敗（v1 fail 24件）の観測
- 元 item: intake-2026-08-15-validatecommand-dual-management-unification.md
