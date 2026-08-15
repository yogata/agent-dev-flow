# 配布物間の形式・参照契約の突合機構（SSoT 統一・参照先実ファイル存在検査）（spec 候補）

## 背景

配布物間で同一情報の正規形式が二重定義され、突合機構が存在しないため3件の不整合が発生した:

1. **Epic ステータス追跡テーブル形式**: `agentdev-epic-tracker`（新4列/旧4列 + 正規表現）と case-open テンプレート（状態別件数テーブル + Wave テーブル）の形式契約不一致。件数テーブルを数値更新で代替し、形式標準化を課題として残した（Epic #2076 / PR #2084）
2. **参照のみ存在テンプレート**: `agentdev-workflow-case-open` reference Step 15 が `templates/case-open/{standard,epic,multi-req-epic}.md` を参照するが配布物に実ファイルが存在しない（Epic #2099）。具体修正は intake item が管理
3. **G03 vs テンプレート構造**: 子Issue 本文先頭行 `Parent: #{epic_number}` を要求する G03 と、`## 親Issue` セクション内に Parent 行を置く `issue_desc_child.md` テンプレートが突合しない。全10子Issue を本文1行目付与で修正し重複記載で両立（Epic #2099 / Issue #2100〜#2109）

## 問題

テンプレート・command ガードレール・スキル形式定義・reference 間で、形式の正規位置が二重定義され、参照先実ファイルの作成・確認を強制する機構が存在しない。実行時の手戻り修正と tracker 機能不全を生む。

## 望ましい変更

1. 形式契約の SSoT 統一: Parent 配置・Epic テーブル形式等の正規形式を一元化し、他方（ガードレール・スキル正規表現）を参照・追随させる
2. authoring 時の参照先実ファイル存在確認を `agentdev-skill-authoring` / `agentdev-command-authoring` の査読観点として明示
3. checker による「skill/command reference → templates/ 等へのパス参照 → 実ファイル存在」検査の追加

## 対象範囲

### 対象

- `issue_desc_child.md` テンプレートの正規形（Parent 先頭行 vs `## 親Issue` セクション）
- `agentdev-epic-tracker` のテーブル形式定義と case-open Epic テンプレートの整合
- Workflow Skill reference から配布テンプレートへの参照整合
- authoring 査読観点・checker 検査の追加

### 対象外

- `templates/case-open/*.md` の実ファイル作成（または参照側の実態合わせ）— `intake-2026-08-14-case-open-completion-report-templates-missing.md`（intake inbox）が具体修正を管理。backlog-review で本成果物と統合前提
- 既存 Epic Issue の遡及的な形式統一（新規起票以降の適用）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| template | `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_epic.md`、`issue_desc_child.md` | 形式正規形の統一（Parent 先頭行、追跡テーブル形式） |
| skill | `src/opencode/skills/agentdev-epic-tracker/SKILL.md`、`references/regex-and-merge-conflict.md` | 形式定義・正規表現のテンプレート側への整合 |
| skill | `src/opencode/skills/agentdev-skill-authoring/`（参照整合の査読観点） | 参照先実ファイル存在確認の明示 |
| script | `src/opencode/skills/repo-agentdev-integrity/scripts/check_templates.ts`（要 backlog-review 判断） | reference → templates パス参照の実ファイル存在検査 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: `agentdev-skill-authoring` の参照整合 axis、`intake-2026-08-14-case-open-completion-report-templates-missing.md`（E11 相当の具体修正）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: テンプレート vs ガードレール vs スキル形式定義の突合機構、reference → 実ファイルの存在検査が存在しない

## 制約

- 具体修正（templates/case-open 実ファイル化等）は intake item との統合時に判断する。本成果物は再発防止機構（SSoT 統一・査読観点・checker）に責務を分離する
- 既存 Issue との後方互換（先行実績 #2092 形式等）は移行措置として許容する

## 受け入れ条件

- [ ] Parent 配置・Epic 追跡テーブル形式の正規形が一元化され、関係配布物が整合している
- [ ] authoring 査読観点に参照先実ファイル存在確認が明示されている
- [ ] checker による参照→実ファイル存在検査の追加要否が backlog-review で判断されている

## 元learning item / 根拠

- **要約**: 配布物間の形式・参照契約の突合機構不在で、テーブル形式不一致・参照のみ存在テンプレート・G03 突合欠陥の3件が発生
- **根拠**: Epic #2076 / PR #2084（件数テーブル形式、正規表現不合致）、Epic #2099（templates/case-open 不存在、glob 11ファイルと突合）、Issue #2100〜#2109（全10子Issue の本文1行目 Parent 付与修正）
- **再発条件**: 配布物間で形式・参照を追加・変更する際に SSoT 整合と参照先実ファイルの作成・確認を行わずに merge した場合
- **横展開可能性**: 高い。配布物（テンプレート・command・skill）を持つプラグイン開発全般

## 推奨Issue分類

- **分類**: chore（形式統一・検査追加。checker 実装を含む場合は feature）
- **推奨ラベル**: documentation, templates, integrity
- **関連Issue**: Epic #2076（PR #2084）、Epic #2099、intake-2026-08-14-case-open-completion-report-templates-missing.md
