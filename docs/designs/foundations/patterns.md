---
title: 文書フォーマット規約
status: accepted
created: 2026-08-20
updated: 2026-08-10
---
<!-- ADF-COVERS(implementation): REQ-001-008, REQ-001-010, REQ-001-011, REQ-001-012, REQ-001-013, REQ-001-014, REQ-001-015, REQ-001-016, REQ-001-030, REQ-001-046, REQ-001-047 -->

# 文書フォーマット規約

> **正本としての位置づけ**: 本 Design が共通文書モデル規約（frontmatter、ID 体系、命名規則、URL 参照形式、共通フォーマット規約）の正本である。
> 本文構造、見出し構成、Step 表現、記述形式等の執筆規約寄り内容は `../authoring/` ドメイン（現在は `command-file-format.md` のみ）への移管候補とする。
> 実移管の判断は case-run で行い、本 Design からの一括移送は行わない。

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
