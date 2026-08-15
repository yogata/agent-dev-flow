# SPEC確定候補: テスト内蔵 command validator の配布 checker 規則への単一化契約

## 観測内容

テスト内蔵 command validator と配布 checker が同種の整合性検証を二重実装している状態に対し、単一実装原則の契約上の規定が存在しない。単一化契約が明文化されていないため、構造変更時にテスト側だけが陳腐化する事象が再発しうる。

## 影響

- 検証規則の単一実装原則がないため、二重管理の再発を防げない
- v1 fail 24件のような陳腐化失敗が再発し得る

## 課題

integrity ドメインまたは authoring/command-file-format の検査契約として、単一化契約を確定する。実装側 item（validatecommand-dual-management-unification）と一体で要件化する。SPEC 内容変更を伴うため case-close スコープ外と見送り記録済み。採否は backlog-review 以降の判断。

## 既存要件・成果物との関連

- 対象: commands_error_cases.test.ts、check_command_format.ts、command-format-rules.yaml、検査契約 SPEC
- 関連: 実装側 item（promoted item 2026-08-15-validatecommand-dual-management-unification）

## 出典

- 発生日: 2026-08-15
- 取得元: case-close 見送り記録（SPEC確定候補）
- 元 item: intake-2026-08-15-spec-candidate-test-embedded-validator-unification.md
- 注記: intake-promote 経路C review で採用。実装側 item との統合可否は backlog-review の判断
