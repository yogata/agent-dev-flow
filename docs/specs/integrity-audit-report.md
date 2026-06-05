# Integrity Audit Report

- **実行日時**: 2026-06-06
- **対象コミット**: 13a33a9
- **スキャン対象**: 14 active REQ, 50 retired REQ, 19 ADR, 9 SPEC, 10 guides, 18 commands, 21 skills, 35+11 templates, 14 integrity scripts
- **スコープ**: REQ-0108-143~149 (source/projection scan分離, baseline管理, REQ-first verification)

## サマリ

| 検査カテゴリ | OK | Finding | 備考 |
|-------------|----|---------|------|
| Active REQ 内部整合性 | ✅ | 0 | 全14件でfrontmatter/ID正常 |
| Active REQ ID一意性 | ✅ | 0 | active/retired間で重複なし |
| REQ index ↔ 実体 | ✅ | 0 | 14件すべてREADMEに記載・リンク正常 |
| RET→derivative drift | ✅ | 10 (info) | 全件baseline-known (BL-001~BL-010) |
| Source/projection分離状態 | ⚠️ | 1 (info) | 未分離 (BL-source-001) |
| Command frontmatter | ✅ | 0 | 全18件でdescription+agentのみ |
| Skill frontmatter | ✅ | 0 | 全21件でname=dir名、USE FOR/DO NOT USE FORあり |
| ADR status正規化 | ✅ | 0 | 旧形式superseded-byなし |
| Mapping table存在 | ✅ | 0 | docs/requirements/mapping-table.md存在 |
| Integrity scripts存在 | ✅ | 0 | 14スクリプトすべて存在 |

## 詳細

### 1. Active REQ 内部整合性検証

全14件のactive REQについて以下を検証:

| REQ | frontmatter | ID一致 | tags | 相互参照 |
|-----|------------|--------|------|----------|
| REQ-0101 | ✅ | ✅ | ✅ | ✅ |
| REQ-0102 | ✅ | ✅ | ✅ | ✅ |
| REQ-0103 | ✅ | ✅ | ✅ | ✅ |
| REQ-0104 | ✅ | ✅ | ✅ | ✅ |
| REQ-0105 | ✅ | ✅ | ✅ | ✅ |
| REQ-0106 | ✅ | ✅ | ✅ | ✅ |
| REQ-0107 | ✅ | ✅ | ✅ | ✅ |
| REQ-0108 | ✅ | ✅ | ✅ | ✅ |
| REQ-0109 | ✅ | ✅ | ✅ | ✅ |
| REQ-0110 | ✅ | ✅ | ✅ | ✅ |
| REQ-0111 | ✅ | ✅ | ✅ | ✅ |
| REQ-0112 | ✅ | ✅ | ✅ | ✅ |
| REQ-0113 | ✅ | ✅ | ✅ | ✅ |
| REQ-0114 | ✅ | ✅ | ✅ | ✅ |

### 2. REQ→Derivative Drift確認

| Finding ID | 分類 | 対象 | Drift内容 | 解決先 |
|-----------|------|------|-----------|--------|
| BL-001 | historical-acceptable | AGENTS.md | .opencode/参照がsource/projection区別なし | #596/#597 |
| BL-002 | historical-acceptable | README.md | .opencode/commands/参照がprojection前提 | #597 |
| BL-003 | retired-doc-preservation | retired REQ 50件 | 履歴参照として保存 | 永続 |
| BL-004 | ssot-candidates | REQ-0103/0108 | frontmatter検証ルール重複 | #599 |
| BL-005 | ssot-candidates | REQ-0103/0108 | references/正規化ルール重複 | #599 |
| BL-006 | continuous-rule-candidates | (不存在) | rule catalog未作成 | #600 |
| BL-007 | continuous-rule-candidates | (不存在) | REQ impact map未作成 | #600 |
| BL-008 | old-spec-remnant | REQ-0103/0108 | 取消線付き廃止要件 | 永続 |
| BL-009 | clarification-needed | REQ-0108, integrity skill | source/projection scan分離未実装 | #600 |
| BL-010 | ssot-candidates | command README | 手動メンテinventory | #599 |

### 3. Source/Projection状態

| 項目 | 状態 |
|------|------|
| `src/opencode/` 存在 | ❌ (未分離) |
| `.opencode/` 種別 | ディレクトリ (projection化前) |
| sync script存在 | ❌ |
| migration script存在 | ❌ |

**注記**: 本監査時点ではsource/projection分離前。Issue #596で分離実施予定。

### 4. Integrity Infrastructure監査

| 項目 | 状態 | 備考 |
|------|------|------|
| `check_integrity.ts` | ✅ 存在 | 主検査スクリプト |
| `check_templates.ts` | ✅ 存在 | template構造検査 |
| `lint_skills.ts` | ✅ 存在 | skill構造lint |
| `cli_utils.ts` | ✅ 存在 | 共通CLI契約 |
| テストファイル (10件) | ✅ 存在 | regression test完備 |
| Rule catalog | ❌ 不存在 | REQ-0108-150/151 未対応 |
| REQ impact map | ❌ 不存在 | REQ-0108-152 未対応 |
| Baseline | ✅ (本監査で作成) | `.agentdev/integrity/baseline.json` |

### 5. 選択的Drift是正

本監査で実施した是正:

| # | 是正内容 | 根拠 |
|---|----------|------|
| 1 | baseline.json作成 | REQ-0108-145 |
| 2 | 本audit report作成 | REQ-0108-143~149 |

**延期した是正**（別Issueで対応）:
- AGENTS.mdの.opencode/参照更新 → #597
- README.mdの.opencode/参照更新 → #597
- integrity SKILL.mdのsource/projection scan分離 → #600
- integrity scriptsのsource scan追加 → #600

## Finding分類集計

| 分類 | 件数 | 対応 |
|------|------|------|
| old-spec-remnant | 1 | 保存（履歴） |
| historical-acceptable | 2 | 保存（#596/#597で解消予定） |
| retired-doc-preservation | 1 | 保存（永続） |
| negative-fixture | 0 | — |
| clarification-needed | 1 | #600で対応 |
| ssot-candidates | 3 | #599で対応 |
| continuous-rule-candidates | 2 | #600で対応 |

## REQ-0108-143~149 対応状況

| REQ ID | 要件 | 状態 | 備考 |
|--------|------|------|------|
| REQ-0108-143 | source/projection scan分離 | ⚠️ 部分対応 | baseline記録済み、script修正は#600 |
| REQ-0108-144 | stale symlink等のintegrity finding | ⚠️ 未対応 | #600で実装 |
| REQ-0108-145 | baseline-known/new区別 | ✅ | baseline.json作成 |
| REQ-0108-146 | active REQをintegrity対象に含める | ✅ | 14件検証済み |
| REQ-0108-147 | integrity関連artifactもvalidator drift対象 | ✅ | スクリプト14件確認 |
| REQ-0108-148 | finding分類追加 | ✅ | 4分類で分類済み |
| REQ-0108-149 | REQ-first verification | ✅ | REQ内部整合性を先に検証 |

## 次のアクション

1. **Wave 1完了後**: #596のsource/projection分離マージ後に再度scanしてbaseline更新
2. **Wave 2 (#599)**: SSOT candidates 3件を解消
3. **Wave 3 (#600)**: rule catalog / impact map / 3層gate / source-projection scan分離を実装
