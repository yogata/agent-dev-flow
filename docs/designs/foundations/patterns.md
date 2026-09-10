---
title: 文書フォーマット規約
status: accepted
created: 2026-08-20
updated: 2026-09-10
---
<!-- ADF-COVERS(implementation): REQ-001-008, REQ-001-010, REQ-001-011, REQ-001-012, REQ-001-013, REQ-001-014, REQ-001-015, REQ-001-016, REQ-001-030, REQ-001-046, REQ-001-047 -->
<!-- ADF-COVERS(implementation): REQ-059-001 -->

# 文書フォーマット規約

> **正本としての位置づけ**: 本 Design が共通文書モデル規約（frontmatter、ID 体系、命名規則、URL 参照形式、共通フォーマット規約）の正本である。

## コマンド frontmatter 規約

command frontmatter の正規契約を description 単一へ変更する。
agent を必須フィールド・許可フィールド・有効値検査の全てから除外する。
REQ-029-007（配布command は harness 固有詳細を含まない）および DEC-001（harness 分離）に基づき、実行エージェント固定は harness 側設定へ移管し command frontmatter から除去する。
詳細 normative は移行計画 §5.2。

## REQ frontmatter 規約

REQ文書のfrontmatterは以下のフィールドを持つ。

```yaml
---
id: REQ-{NNN}
title: {領域タイトル}
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---
```

- 許可フィールドは`id`、`title`、`created`、`updated`だけとする。
- `id`は`REQ-{NNN}`、要件行IDは`REQ-{NNN}-{MMM}`形式とする。

### REQ セクション構成

```markdown
## 目的

{この領域の要件が存在する理由}

## 要件

| ID | 要件 |
|---|---|
| REQ-{NNN}-001 | {検証可能な要件} |

## 適用範囲

- **対象**: ...
- **対象外**: ...
```

REQファイルは`## 目的`、`## 要件`、`## 適用範囲`の3セクションだけを持つ。
`## 関連情報`、`## Requirement Source`、`## Update Notes`、`## 関連ドキュメント更新候補`、変更履歴節は持たない。

- 要件は検証可能な必達要件（満たす必要がある要件）として記述する。推奨、任意、将来候補は要件行に含めない。FR/NFR の区別を持たない

### Design frontmatter 形式

Design frontmatterは`title`、`status`、`created`、`updated`を基本とする。
`status`は`draft`、`accepted`のいずれかとする。
status欠落は後方互換のため`accepted`相当として扱う。

### Knowledge frontmatter 規約

Knowledge 文書（docs/knowledge/ 配下、REQ-056）の frontmatter は以下の基本構造とする。

| フィールド | 必須 | 内容 |
|---|---|---|
| title | 必須 | 知識の主題を表す名称 |
| created | 必須 | 作成日（ISO 8601 の日付） |
| updated | 必須 | 最終更新日。created 以降 |

Knowledge 文書は固定 ID 採番を持たず、ファイル名 slug（kebab-case）が識別子となる。
本体の必須セクションは知識内容、適用条件、適用対象、根拠、関連知識の5項目とする（REQ-056）。
Knowledge 文書は独立文書種別であり、REQ・Decision・Design への ADF-COVERS 宣言を持たない。

#### 機械判定形式（check_knowledge_docs.ts 準拠）

Knowledge frontmatter 規約の機械判定は次の5項目で構成する。

1. frontmatter 境界: ファイル先頭の `---` 囲みブロックを frontmatter として判定する
2. 必須性: `title`、`created`、`updated` の3フィールドの存在を判定する
3. 日付妥当性: `created`、`updated` を ISO 8601 日付として解釈可能かを判定する
4. 順序比較: `updated >= created` を判定する
5. 違反種別: 「必須項目欠落」（2 の違反）と「日付不整合」（3 または 4 の違反）の2種に分類して報告する

本形式の正実装は check_knowledge_docs.ts であり、checker の判定変更時に本規約が追従する。

規約と実装の対応は次のとおりである。checker の判定を変更した場合は、この表と上記の規約を同じ変更で更新する。

| 規約項目 | checker の判定 |
|---|---|
| frontmatter 境界 | `extractFrontmatterLines` による先頭 `---` と閉じ `---` の検出 |
| 必須性 | `REQUIRED_FRONTMATTER_FIELDS`（`title`、`created`、`updated`）の欠落・空値検出 |
| 日付妥当性 | `FRONTMATTER_DATE_PATTERN` と `isValidIsoDate` による `YYYY-MM-DD` 検証 |
| 順序比較 | `updated >= created` の比較 |
| 違反種別 | `missing-frontmatter` / `invalid-frontmatter` の分類 |

knowledge 見出し一致の機械判定形式: 必須セクションの存在は、Markdown 見出し行（`#`〜`######`）の見出しテキストと必須セクション名（知識内容、適用条件、適用対象、根拠、関連知識）との trim 後の完全一致で判定する。見出しとセクション名の意味一致は判定対象に含まらず、検査は構造面（配置、ファイル名命名、必須見出しの存在）に限定される。

## REQ 分類規約

旧 REQ（v2:REQ-0001〜0050 [全て廃止]）は 3 分類で管理する（REQ-010）:

| 分類 | 意味 | 取扱い |
|------|------|--------|
| `migrated` | 新現行 REQ へ要件内容を移行した | 現行 REQ は `docs/requirements/README.md`、履歴資料は tag `v2.11.0` で参照する |
| `retired-no-successor` | 最新方針では不要なため新現行 REQ へ移行しない | 履歴参照として保持 |
| `historical-only` | 当時の判断、経緯として残すが現行要件ではない | 履歴参照として保持 |

**新基準 REQ 群**を現行仕様の主参照とする。
現行 REQ の件数、範囲は `docs/README.md` の AUTOGEN 件数ブロックと `docs/requirements/README.md` を正とし、本 Design 本文では件数、範囲を固定値として記述しない。

件数の固定記述を禁止する根拠の一つは、v3.0.0 移行後に旧表記（REQ-001〜0133、25 件）が残存した事象である。
当該残存を IR-042（hardcoded-req-count）、IR-018（REQ 範囲表記鮮度）が検出しなかった理由は、両ルールが full-audit gate で検出器実装を持たず（regression_test は手動確認、`check_integrity.ts` 未実装）、v3.0.0 移行以降に full-audit が実行されていなかったためである（実行頻度の欠如）。
表記形式の対象漏れの有無は検出器不在のため未検証であり、検出器実装時に確認する。

**要件行の記述規約**（REQ-010, 004）:
- 要件行には振る舞い、制約、状態のみを記述する
- 反映作業（更新、削除、移動、名称変更等）を要件行に記述しない

## テンプレート命名規則

ファイル種別に応じたプレフィクスで命名する:

| プレフィクス | 用途 |
|---|---|
| `issue_desc_` | Issue 本文テンプレート |
| `issue_comment_` | コメントテンプレート |
| `pr_desc_` | PR 本文テンプレート |

### テンプレート本体に含めるもの

- frontmatter（name, about, labels）
- セクション見出し（日本語）
- `<!-- 【必須】 -->` / `<!-- 【任意】 -->` マーカー
- 変数プレースホルダー（`{variable}` 形式）

### テンプレート本体に含めないもの

- gh 操作のコマンド（`gh issue create` 等）
- 実行手順、分岐ロジック
- テンプレート選定ルール

## リポジトリ参照リンク規約

Issue/PR/コメント本文にリポジトリ内ファイル、ディレクトリへの参照を含める場合の URL 形式。

### URL 形式

| 種別 | URL 形式 |
|---|---|
| ファイル参照 | `https://github.com/{owner}/{repo}/blob/{branch}/{path}` |
| ディレクトリ参照 | `https://github.com/{owner}/{repo}/tree/{branch}/{path}` |

### 変換ルール

- `docs/requirements/v2:REQ-0107.md` → `https://github.com/yogata/agent-dev-flow/blob/main/docs/requirements/v2:REQ-0107.md`
- `docs/decisions/DEC-001.md` → `https://github.com/yogata/agent-dev-flow/blob/main/docs/decisions/DEC-001.md`
- `src/opencode/skills/agentdev-traceability/SKILL.md` → `https://github.com/yogata/agent-dev-flow/blob/main/src/opencode/skills/agentdev-traceability/SKILL.md`
- `src/opencode/skills/` → `https://github.com/yogata/agent-dev-flow/tree/main/src/opencode/skills/`

### 対象外

- テンプレート変数プレースホルダー（`{xxx}` 形式）
- コードブロック内のパス参照
- `http://` `https://` で始まる既存 URL
- リポジトリ内 Markdown ファイル間の相対リンク

## Decision frontmatter 関連REQ宣言（related_reqs）規約と承認記録形式

### related_reqs フィールド

- Decision frontmatter の標準フィールド related_reqs は REQ 識別子（REQ-{NNNN}）のリストとする
- 関連 REQ が存在しない Decision は `related_reqs: []`（空宣言）として明示する。
  未宣言（フィールド自体の欠落）は機械検出の対象であり、正規状態とは扱わない
- 宣言は Decision 成果物のローカルメタデータであり、TIM の ADF-COVERS 宣言・covers 関係とは
  独立に管理される。agentdev-traceability は本フィールドを消費しない
- req-save が Decision 作成時に要件doc（draft-data）の関連情報から保存し、
  既存 Decision への付与はバックフィル（一括付与）による
- 本規約は patterns.md が Decision frontmatter 規約を持たない現状の解消を兼ねる
  （共通文書モデル規約の正本としての配置。decision-lifecycle Design は意味境界・関係・粒度・
  健全性に特化し、形式規約の正本とはしない）

### 承認記録セクション形式（正規所有）

- Decision の accepted 遷移には、本文末尾に「## 承認記録」セクションを追記する
- 形式: 「YYYY-MM-DD に Decision ライフサイクルの確認手続きに従い承認した
  （status: proposed → accepted）。{承認根拠}（REQ-001-021 との矛盾解消）。」
- 承認根拠には、評価時点で照合した根拠（合意内容と現行 REQ・Design・実装の一致、
  またはユーザー承認の旨）を記載する
- 本形式は DEC-008 / DEC-015 / DEC-019〜027 / DEC-028 の昇格実績で採用された慣行の
  正規化である。遷移の実行主体（case-open、確認手続きによる一括昇格）を問わず同一形式を用いる
- 形式の正本は本 Design（patterns.md）、テンプレート実体は doc_decision.md、
  存在確認・検証は agentdev-decision-file-manager、「明示承認記録が存在する」存在要件は
  document-model.md（現状維持）が所有する
