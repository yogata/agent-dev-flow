---
status: accepted
updated: 2026-06-28
---

# ルール所有権マトリックス

> **位置づけ**: 本ファイルは全ドメイン（foundations/responsibilities/quality/integrity/local/authoring）横断のルール所有権マトリックスである。
> `integrity/` 配下に配置するが `integrity` ドメイン専用ではなく、全ルールドメインの canonical REQ/SPEC 対応を示すメタファイルとして機能する。

## req-impact-map.md との関係

本ファイル（ルールドメイン → canonical REQ/SPEC）と `../responsibilities/req-impact-map.md`（REQ → 影響するルール/アーティファクト）は逆方向の対応マップである。両者の整合性維持運用:

- 新規 IR 追加時: 両ファイルの対応行列を同期更新する
- IR の `baseline_status` 変更時（new / resolved 等）: 両ファイルで整合を確認する
- canonical owner 変更時: 両ファイルで参照先を更新する

req-impact-map.md の配置移動は Phase 1 の対象外とし、本節では関係整理のみを扱う。

## ルールドメイン一覧

| # | Domain | Canonical REQ | Canonical SPEC | 補足 |
|---|--------|--------------|----------------|------|
| 1 | Command frontmatter | REQ-0103 (015, 044) | artifact-contracts.md | description + agent のみ |
| 2 | Skill frontmatter | REQ-0103 (012, 013) | artifact-contracts.md | name + description |
| 3 | Command 行数上限 | REQ-0103 (022-024) | quality-specs.md | 100 行目標、150 行上限、200 行以内 |
| 4 | Skill 行数上限 | REQ-0103 (037) | quality-specs.md | 200 行超で分割候補報告 |
| 5 | Template 配置 | REQ-0103 (005, 046) | artifact-contracts.md | command-local template 配置規約 |
| 6 | Script 配置 | REQ-0103 (006, 014) | artifact-contracts.md | skill scripts/ 配下 |
| 7 | Namespace 予約 | REQ-0103 (009, 056) | system.md | agentdev / agentdev-* 予約 |
| 8 | References 正規化 | REQ-0103 (013, 039) | - | `references/` が正規、`reference/` は廃止 |
| 9 | Progressive disclosure | REQ-0103 (035, 036) | - | SKILL.md 入口 + `references/` 詳細 |
| 10 | 完了報告フォーマット | REQ-0103 (046), REQ-0107 (013, 022) | artifact-contracts.md | 種別（`variant`）別管理 |
| 11 | 共通処理集約 | REQ-0103 (040-043) | - | Git 同期等の共通化 |
| 12 | Source/projection 分離 | REQ-0103 (048-055) | system.md | `src/opencode/` 原本 + `.opencode/` 配置先 |
| 13 | Integrity 検査カテゴリ | REQ-0108 (001-021) | integrity-contracts.md | 18 集合、strict/heuristic/observation |
| 14 | Finding 分類 | REQ-0108 (017, 018) | integrity-contracts.md | 6 カテゴリ + 経路 |
| 15 | Frontmatter dev metadata 禁止 | REQ-0108 (022-024, 095-098) | integrity-contracts.md | dev メタデータ禁止 |
| 16 | Retired REQ 管理 | REQ-0108 (070-088) | integrity-contracts.md | mapping-table、注記、参照区別 |
| 17 | Link 整合性 | REQ-0108 (013) | integrity-contracts.md | Markdown リンク先存在確認 |
| 18 | Namespace legacy 残存 | REQ-0108 (016) | integrity-contracts.md | 旧コマンド名、旧パス検出 |
| 19 | REQ/ADR 相互参照 | REQ-0108 (005) | integrity-contracts.md | 双方向参照確認 |
| 20 | Authoring DoD | REQ-0108 (060-064) | quality-specs.md | 行数、Steps、共通化、正規パス（`canonical path`） |
| 21 | Command Step 整数化 | REQ-0119 (005, 007) | artifact-contracts.md | 最上位 Step は整数のみ。小数 Step を禁止 |
| 22 | Command サブステップ表記 | REQ-0119 (006) | artifact-contracts.md | サブステップは N-M 形式のみ許容。英字サブステップを禁止 |
| 23 | Subagent verbatim 条件 | REQ-0119 (013) | workflow-contracts.md | 成果物本文のみそのまま（verbatim）。一律 verbatim 制約を禁止 |
| 24 | Findings / Capture候補 見出し | REQ-0119 (014, 020, 021) | workflow-contracts.md | current/source は新見出しへ統一。旧語検出用文字列は許容 |
| 25 | Delegation envelope 最小契約 | REQ-0119 (017, 018) | workflow-contracts.md | `delegation_type`/`on_result` は必須 envelope ではないことを確認 |
| 26 | lightweight-delegation 位置付け | REQ-0119 (015, 016) | workflow-contracts.md | 主要パターン（`primary pattern`）ではなく重ねる委譲として扱う |
| 27 | 語彙ポリシー横断検出 | REQ-0102 (024-028), REQ-0108 (236, 237) | integrity-contracts.md | 現行対象範囲の語彙ポリシー違反検出 |
| 28 | Cross-REQ 語彙矛盾 | REQ-0108 (239) | integrity-contracts.md | 現行 REQ 間の語彙矛盾検出 |
| 29 | mapping-table 履歴名明示 | REQ-0108 (240) | integrity-contracts.md | 旧語彙に履歴名を明示 |
| 30 | REQ 検証基準（必達要件） | REQ-0108 | integrity-contracts.md | 規範語ではなく必達要件判定に基づく検証（REQ-0115-044 から REQ-0108 に移管） |
| 31 | Quality Gates | REQ-0108 | quality-gates.md | QG-1〜QG-4 定義、機械化境界、実装マッピング（REQ-0115 から REQ-0108 に移管） |
| 32 | docs 日本語表現、文意整合 | REQ-0140, REQ-0108 (255-257) | integrity-rule-catalog.md (IR-045) | 英字混じり抽象用語、読取専用セマンティクスの検出。文書表記、文意品質ゲート（付帯品質ゲート）の機械検査担当 |
| 33 | local-case-file（ローカル Case ファイルスキーマ） | REQ-0141 (016-020, 024, 025) | local-case-file.md | ローカル版 OpenCode の Case ファイル YAML 前書き、status enum、labels 値域、見出し一覧、マージ結果記録 |
| 34 | local-generation（ローカル版生成フロー、安全ゲート） | REQ-0141 (001-015) | local-generation.md | ローカル版生成フロー Step、`generated_by: local-opencode-transform` 識別子、ジャンクション検出安全ゲート、上書き許可条件 |
| 35 | local-transform（ローカル版変換プロンプト） | REQ-0141 (028, 029, 032) | local-generation.md（local-transform.md から一元化、AG-003） | **確定廃止**（PR#1195 で transform/ 完全削除、REQ-0141-004/009/028 確定廃止昇格）。変換用プロンプト、レビュー用プロンプト、変換仕様の要件は全て廃止済み。残存 GitHub 固有参照の違反判定基準と変換プロンプト廃止経緯は `local-generation.md` へ一元化済み（AG-003、REQ-0141-028/029）。local-transform.md ファイル自体の削除は case-run の責務 |

## 重複ルールの解消状況

以下のルールは複数 REQ 間で重複していたが、本マトリックスで原本所有者（`canonical owner`）を明確化した:

| 重複ルール | 旧参照箇所 | 原本所有者 | 状態 |
|-----------|-----------|----------------|------|
| Frontmatter 許可フィールド | REQ-0103-044, REQ-0108-046/098 | REQ-0103-044 (primary) | ✅ |
| `references/` 正規化 | REQ-0103-013/039, REQ-0108-039/040/094 | REQ-0103-013 (primary) | ✅ |
| Template 配置規約 | REQ-0103-005/046, REQ-0107-013/022, REQ-0108-042/075 | REQ-0103-005 (primary) | ✅ |
| Namespace 予約 | REQ-0103-009/056, REQ-0108-016 | REQ-0103-009 (primary) | ✅ |
| Dev metadata 禁止 | REQ-0103-015/020, REQ-0108-022/095 | REQ-0103-015 (primary) | ✅ |
