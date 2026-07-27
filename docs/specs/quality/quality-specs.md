---
status: accepted
---

# 品質仕様

AgentDevFlow の品質基準、検証ルールを定義する。

## 品質ゲート（QG-1〜QG-4）

主ワークフローの品質ゲート定義は [quality-gates.md](quality-gates.md) を原本とする。
各 Gate の判定基準、検査観点は `agentdev-quality-gates` スキルの参照ファイルを参照。

- QG-1 Definition Integrity Gate（req-define / req-save）
- QG-2 Acceptance Criteria Coverage Gate（case-open）
- QG-3 Implementation Deviation Gate（case-run）
- QG-4 Final Acceptance Gate（case-close）

## 品質メトリクス収集

型チェック、Lint、ビルド、テスト等の品質メトリクス収集は、各コマンドのローカル検証ステップ（case-run Step 11-1 等）の責務である。

## 文書品質ルール

以下の文書品質ルールの原本 SPEC として機能する（rule-ownership.md Domain 3, 4, 20 参照）:

- Command 行数上限: 100行目標、150行上限、200行以内（200行超は分割対象）
- Skill 行数上限: 200行超で分割候補報告
- 執筆完了基準（Authoring DoD）: 行数、Steps、共通化、正規パス（`canonical path`）

## 必須シナリオ（10シナリオ）

ADR-001 決定6 のリリース条件「必須シナリオ（10シナリオ）が通る」が参照する10シナリオの正規一覧を所有する。
シナリオ定義は本 SPEC が所有し、実行結果は Release Report が所有する（agentdev-adr-guidelines「参照先明確化」）。

### 10シナリオ一覧

（※ case-run 工程で確定。charter.md の基本フロー、ADR-001 決定6 のリリース条件に関連するシナリオから抽出。

1. （シナリオ1: 名称、合格基準、関連 REQ/SPEC）
2. （シナリオ2: ...）
...
10. （シナリオ10: ...）

### ADR-001 L114 との参照関係

ADR-001 決定6 条件4「SPECが定義する10件の必須シナリオをすべて通過する」は本セクションを正規参照先とする。
