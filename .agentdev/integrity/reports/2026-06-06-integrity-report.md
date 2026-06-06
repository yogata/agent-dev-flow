# Integrity Check Report

- **実行日時**: 2026-06-06 (manual — scripts non-functional)
- **スキャン対象**: REQ 14件（active）、REQ 50件（retired）、ADR 21件、Skill 22件、Command 17件、Template 11件

## サマリ

| 検査カテゴリ | OK | NG | 備考 |
|-------------|----|----|------|
| REQ frontmatter↔ファイル名 | 14 | 0 | retired 50件も全件一致 |
| ADR↔REQ 相互参照 | 21 | 0 | — |
| Skill frontmatter & 構造 | 20 | 1 | NG: broken junction `agentdev-integrity` |
| Command frontmatter | 17 | 0 | — |
| 旧 namespace 残存 | — | 0 | docs/ 内の引用はすべて歴史的参照 |
| ADR status 正規化 | 21 | 0 | 旧形式 `superseded-by:[...]` なし |
| RU-ID 根拠参照 | — | 0 | docs 永続文書内に RU-ID パターンなし |
| Workflow status 禁止 | — | 0 | REQ-0105 の軽量 status は除外済（REQ-0105 注記） |
| Accepted ADR 引用 | — | 0 | REQ-0112 は正規化対象 ADR を引用（expected） |
| Workflow template 構造 | 11 | 0 | — |
| 完了報告フォーマット | 35 | 0 | variant 35件全6必須フィールドあり、inline完了報告なし、fragment合成なし |
| Variant report | 35 | 0 | 全variant実在・path一致 |
| Mapping table | 50 | 0 | retired全件記録・移行先存在・enum妥当（Active Set欄は9件で古い: observation） |

### 重要検出

| # | レベル | カテゴリ | 分類 | ルート | 内容 |
|---|--------|---------|------|--------|------|
| F-001 | **strict NG** | skill-structure | obsolete-structure | intake+learning | `.opencode/skills/agentdev-integrity` が junction で `src/opencode/skills/agentdev-integrity` を指すが、実体ディレクトリが存在しない（SKILL.md 欠落） |
| F-002 | **heuristic warning** | skill-structure | document-drift | learning | `.opencode/skills/agentdev-no-ai-slop-writing` SKILL.md が 542 行で 500 行閾値を超過 |
| F-003 | **heuristic warning** | skill-structure | document-drift | learning | 21技能中 17 技能が `## USE FOR` / `## DO NOT USE FOR` を専用セクションとして持たず、frontmatter description に埋め込み |
| F-004 | **observation** | integrity-rule-gap | integrity-rule-gap | intake+learning | 3 本の整合性スクリプト (`check_integrity.ts`, `check_templates.ts`, `lint_skills.ts`) が単一行化・エンコーディング破損で実行不能。リポジトリ HEAD にそのまま保存されている |

---

## 詳細

### REQ frontmatter↔ファイル名

**Active REQ (14件):** REQ-0101 ~ REQ-0114

| ファイル | frontmatter id | 判定 |
|----------|---------------|------|
| REQ-0101.md | REQ-0101 | OK |
| REQ-0102.md | REQ-0102 | OK |
| REQ-0103.md | REQ-0103 | OK |
| REQ-0104.md | REQ-0104 | OK |
| REQ-0105.md | REQ-0105 | OK |
| REQ-0106.md | REQ-0106 | OK |
| REQ-0107.md | REQ-0107 | OK |
| REQ-0108.md | REQ-0108 | OK |
| REQ-0109.md | REQ-0109 | OK |
| REQ-0110.md | REQ-0110 | OK |
| REQ-0111.md | REQ-0111 | OK |
| REQ-0112.md | REQ-0112 | OK |
| REQ-0113.md | REQ-0113 | OK |
| REQ-0114.md | REQ-0114 | OK |

**Retired REQ (50件):** REQ-0001 ~ REQ-0050 — 全件 frontmatter id とファイル名一致。Active/Retired ID 範囲重複なし。

### ADR↔REQ 相互参照

**ADR status 分布:**

| status | 件数 | ADR IDs |
|--------|------|---------|
| accepted | 7 | ADR-0005, ADR-0013, ADR-0017, ADR-0018, ADR-0019, ADR-0020, ADR-0021 |
| proposed | 8 | ADR-0001, ADR-0002, ADR-0003, ADR-0006, ADR-0008, ADR-0010, ADR-0011, ADR-0012 |
| superseded | 5 | ADR-0004, ADR-0007, ADR-0014, ADR-0015, ADR-0016 |
| deprecated | 1 | ADR-0009 |

全 21 ADR が参照する REQ は実在確認済（retired 含む）。REQ→ADR 逆方向も全件実在確認済。**参照切れなし。**

### Skill frontmatter & 構造

**ディレクトリ構成:** 22 ディレクトリ（21 は `src/opencode/skills/` への junction、1 は repo-local `repo-agentdev-integrity`）

| チェック項目 | 結果 |
|-------------|------|
| SKILL.md 存在 | 21/22（`agentdev-integrity` 欠落） |
| frontmatter name ↔ dir 一致 | 21/21 OK |
| `## USE FOR` / `## DO NOT USE FOR` 専用セクション | 4/21 のみ（残り 17 は description 埋め込み） |
| 500 行超過 | 1件（`agentdev-no-ai-slop-writing` 542行） |
| 廃止 `reference/` ディレクトリ | なし |
| See Also 相互参照 | 最小限（大部分に See Also なし） |

**F-001 詳細:**
- `.opencode/skills/agentdev-integrity/` は junction
- リンク先 `src/opencode/skills/agentdev-integrity/` が存在しない
- 当該ディレクトリには SKILL.md がなく、実体ファイルなし
- 他 20 ディレクトリ（`repo-agentdev-integrity` 除く）は正常な junction
- **分類**: `obsolete-structure`（namespace 分割時の残骸）
- **ルート**: `intake+learning`（junction 除去 + junction 管理の学習）

**F-002 詳細:**
- `.opencode/skills/agentdev-no-ai-slop-writing/SKILL.md` = 542 行
- `references/` ディレクトリあり — 内容の一部抽出で行数削減の余地あり
- **分類**: `document-drift`（閾値超過）
- **ルート**: `learning`（内容抽出による構造改善の学習）

**F-003 詳細:**
- 専用セクションを持つ 4 技能: `agentdev-workflow-lifecycle`, `agentdev-workflow-routing`, `agentdev-workflow-templates`, `repo-agentdev-integrity`
- 残り 17 技能は frontmatter `description` フィールドに USE FOR / DO NOT USE FOR 情報を埋め込み
- **分類**: `document-drift`（表記規約との乖離）
- **ルート**: `learning`（規約見直しの学習）

### Command frontmatter

**17 コマンド:** 16 agentdev + 1 repo

| チェック項目 | 結果 |
|-------------|------|
| 禁止フィールド（implementation_pattern 等） | 0件 |
| agent 名 | sisyphus (14), prometheus (3) — ともに有効 |
| command inventory ↔ README | 16/16 一致 |
| 旧 namespace（/issue/*, /tips/*） | コマンド実体になし |

### 旧 namespace 残存

- `.opencode/` 配下のコマンドソースに `/issue/`, `/tips/` なし
- `docs/` 内の参照は ADR-0005（移行 ADR）、retired REQ、REQ-0108（チェック定義）内の歴史的引用のみ
- `issue-*`, `tips-*` skill prefix なし
- 二重 prefix `/agentdev/agentdev/*` なし

### ADR status 正規化

- 旧形式 `superseded-by:[ADR-XXXX]`（status フィールド内表記）は検出されず
- superseded ADR はすべて `status: superseded` + `superseded_by: ADR-XXXX` の 2 フィールド構成

### RU-ID 根拠参照

- docs 永続文書内に `RU-\d{4}-\d{3}` パターンなし

### Workflow status 禁止

- Active REQ/SPEC 内に 6 マイクロフェーズ進行管理モデルの workflow status なし
- REQ-0105 の `status: reviewed` / `status: saved` は backlog-review draft の 2 値フラグ（REQ-0105 本文で明示的に除外定義済）

### Accepted ADR 引用

- Active REQ のうち REQ-0112 のみが非-accepted ADR を引用
- 引用先（ADR-0004, 0007, 0009, 0014, 0015, 0016）は正規化対象であり、規範的引用ではない → expected

### Workflow template 構造

**11 テンプレート:**

| テンプレート | frontmatter | 必須セクション | 判定 |
|-------------|------------|--------------|------|
| issue_desc_bug.md | あり (name, about, labels) | あり | OK |
| issue_desc_child.md | あり | あり | OK |
| issue_desc_epic.md | あり | あり | OK |
| issue_desc_feature.md | あり (name, about, labels) | あり | OK |
| issue_comment_bug_analysis.md | なし | あり | OK |
| issue_comment_bug_record.md | なし | あり | OK |
| issue_comment_feature_implementation.md | なし | あり | OK |
| issue_comment_feature_technical.md | なし | あり | OK |
| issue_comment_review_ng.md | なし | あり | OK |
| issue_comment_update.md | なし | あり | OK |
| pr_desc.md | なし | あり | OK |

### Integrity script 非機能 (F-004)

| スクリプト | サイズ | 状態 |
|-----------|--------|------|
| `check_integrity.ts` | 126 KB (1行) | 単一行化・パース不能 |
| `check_templates.ts` | 13 KB (1行) | 単一行化・文字化け（日本語） |
| `lint_skills.ts` | 8.7 KB (1行) | 単一行化・パース不能 |

- `bun` / `npx tsx` とも `Unexpected end of file` または文字化けエラー
- HEAD にそのままコミットされている（ローカル diff なし）
- 最終変更コミット: `e32b935 feat: separate integrity-check into /repo/* namespace (#611)`
- **分類**: `integrity-rule-gap`（検査機構そのものの不備）
- **ルート**: `intake+learning`（スクリプト復元または再実装 + エンコーディング管理の学習）

---

## メタ情報

- **検査方法**: 手動（スクリプト非機能のため、explore エージェント 5並列 + 直接 grep/glob/read による代替実施）
- **検査範囲**: integrity skill が定義する全検査カテゴリ（16カテゴリ全件実施）
- **偽陽性方針**: false positive を許容し false negative を減らす（REQ-0108-103）
