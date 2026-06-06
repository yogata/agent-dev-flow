# Promote Command Unification 検証未完了

intake-review / learning-refine 廃止・promote 統合（ADR-0022）の実装完了後、全サブIssue の完了条件・テスト戦略のチェックボックスが未チェックのままクローズされている。実装自体は完了している可能性が高いが、検証が明示的に記録されていないため、各コマンド・スキル・SPEC の整合性を再確認する必要がある。

- intake-review / learning-refine の完全削除と残留確認
- intake-promote の inbox 直読み・採用/却下/保留判定・HITL 確定ステップ
- learning-promote の内部フェーズ（normalize → classify → 8-axis eval → report → HITL → 判定）
- SPEC（workflow-contracts, system, integrity-contracts）からの旧コマンド参照除去
- ADR-0010 / ガイド / DOC-MAP / README の更新
- ADR-0022 のステータスを proposed → accepted に更新（未実施）

## 根拠

- Issue #618: Promote Command Unification: intake-review / learning-refine 廃止・promote 統合
  - ADR-0022 のステータス更新が完了条件に含まれているが未チェック（唯一の未チェック項目、他は [x]）
- Issue #619: intake-review / learning-refine コマンド・スキル・テンプレート削除
  - 完了条件10項目・テスト戦略3項目がすべて未チェックでクローズ
- Issue #620: intake-promote コマンド — intake-review 統合・accepted/ 廃止
  - 完了条件5項目・テスト戦略3項目がすべて未チェックでクローズ
- Issue #621: ADR・ガイド・コマンド選択・DOC-MAP 更新
  - 完了条件4項目・テスト戦略2項目がすべて未チェックでクローズ
- Issue #622: learning-promote コマンド — learning-refine 統合
  - 完了条件5項目・テスト戦略3項目がすべて未チェックでクローズ
- Issue #623: SPEC 更新 — workflow-contracts, system, integrity-contracts
  - 完了条件4項目・テスト戦略2項目がすべて未チェックでクローズ
