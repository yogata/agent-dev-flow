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

ADR-001 決定6（リリース条件）の条件4「SPECが定義する10件の必須シナリオをすべて通過する」（ADR-001 L114）が参照する10シナリオの正規一覧を定義する（REQ-001、REQ-010）。
シナリオの定義は本 SPEC が正規所有し、実行結果（通過/未通過の証跡）は Release Report が所有する（規範情報と非規範情報の分離、RU-0026 準拠）。

### シナリオ一覧

| ID | シナリオ名 | 合格基準 | 関連 REQ |
|----|-----------|---------|---------|
| S-001 | 単一REQ保存 | req-save がREQファイルへ要件行を保存し check-frontmatter-consistency.ts が ok を返す | REQ-008 |
| S-002 | SPECセクション保存 | spec-save が target_area ベースでSPECへセクション追記・置換を行い search-target-area.ts が正しくマッチする | REQ-008 |
| S-003 | Issue作成 | case-open が draft-data から Issue 本文を生成し QG-2 が通る | REQ-006 |
| S-004 | 標準実行 | case-run が単一 Issue を実行し PR を作成する | REQ-006 |
| S-005 | 標準クローズ | case-close が PR を merge し Issue を close し capture を実施する | REQ-006 |
| S-006 | Epic Wave実行 | case-open が Epic Issue を作成し case-run が Wave 内子 Issue を並列実行し Epic が close される | REQ-006 |
| S-007 | 全自動実行 | case-auto が draft から merge まで自走し main へ反映される | REQ-006 |
| S-008 | GitHub課題取り込み | intake-from-github が課題を抽出し intake-promote が採用/却下を判定する | REQ-007 |
| S-009 | 学びの捕捉と昇格 | case-close が learning を capture し learning-promote が評価・採用する | REQ-007 |
| S-010 | 文書整合性検証 | docs-check / inspect-docs が REQ/ADR/SPEC の整合性を検証し全て ok を返す | REQ-010 |

### ADR-001 との参照関係

- 本セクションは ADR-001 決定6 条件4（L114）が参照する10シナリオの正規一覧を所有する
- ADR-001 はシナリオ定義を本 SPEC へ委譲し、シナリオの列挙や合格基準を ADR 本文へ重複して記述しない
- シナリオの実行結果は Release Report が証跡として記録し、本 SPEC へ実行結果を規範内容として持ち込まない（RU-0026）
