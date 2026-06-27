---
status: accepted
---

# 文書フォーマット規約

## コマンド frontmatter 規約

### エージェント指定

コマンドの frontmatter で agent を指定する。
対話系コマンド（req-define）は `agent: prometheus`、ファイル操作系コマンド（req-save, case-open 等）は `agent: sisyphus` を使用する。

**対話系コマンド（req-define）:**
```yaml
---
description: ...
agent: prometheus
---
```

**ファイル操作系コマンド（req-save, case-open 等）:**
```yaml
---
description: ...
agent: sisyphus
---
```

**理由**: デフォルトエージェント（Plan/Prometheus）の誤用を防止するため。
Plan エージェントは読み取り権限のみを持ち、ファイル書込やコマンド実行ができない。
対話系、ファイル操作系いずれも Sisyphus 系（書込、実行可能）を要求するため、明示指定が必要。

### Frontmatter 許可フィールド

command frontmatter の許可フィールドは `description` と `agent` のみ（REQ-0103-015, REQ-0103-044, ADR-0102）。

分類定義は `design-principles.md` を参照。

## .sisyphus/ 命名規則

`.sisyphus/` 配下の 7 カテゴリ（plans, drafts, evidence, execution, notepads, tasks, reports）のファイル、ディレクトリ命名は plan 名を基準とする。
詳細なルール、例は `AGENTS.md` の「Sisyphus 命名規則」セクションを参照。

**重要**: notepads は完全一致マッチングのみ対応。
plan 名にサフィックスがある場合、notepad ディレクトリ名にも同一サフィックスが必要。

## REQ frontmatter 規約

REQ 文書の frontmatter には以下のフィールドを定義する:

```yaml
---
id: REQ-{NNNN}
title: {領域タイトル}
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---
```

- フィールドは `id`, `title`, `created`, `updated` のみ（`status`、`scale` は REQ frontmatter には含めない）
- `id` は `REQ-{NNNN}` 形式（例: `REQ-0104`）。要件行の ID は `REQ-{NNNN}-{MMM}` 形式（例: `REQ-0104-001`）

### REQ セクション構成

```markdown
## 目的

{この領域の要件が存在する理由}

## 要件

| ID | 要件 |
|---|---|
| REQ-{NNNN}-001 | {検証可能な必達要件を記述} |

## 適用範囲

- **対象**: ...
- **対象外**: ...
```

- セクションは 目的 / 要件 / 適用範囲 を基本とし、関連情報（関連 SPEC、ADR、REQ 等）等の補助セクションを含む。FR/NFR の区別を持たない
- 要件は検証可能な必達要件（満たす必要がある要件）として記述する。推奨、任意、将来候補は要件行に含めない

## REQ 分類規約

旧 REQ（REQ-0001〜0050 [全て廃止]）は 3 分類で管理する（REQ-0109）:

| 分類 | 意味 | 取扱い |
|------|------|--------|
| `migrated` | 新現行 REQ へ要件内容を移行した | 履歴参照として保持。後継 REQ は mapping-table.md で追跡 |
| `retired-no-successor` | 最新方針では不要なため新現行 REQ へ移行しない | 履歴参照として保持 |
| `historical-only` | 当時の判断、経緯として残すが現行要件ではない | 履歴参照として保持 |

**新基準 REQ 群**（REQ-0101〜0133、25 件、REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は廃止）を現行仕様の主参照とする。
現行 REQ の一覧、範囲は `docs/requirements/README.md` を正とし、本 SPEC では複製しない。

**要件行の記述規約**（REQ-0109, 004）:
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

- `docs/requirements/REQ-0107.md` → `https://github.com/yogata/agent-dev-flow/blob/main/docs/requirements/REQ-0107.md`
- `docs/adr/ADR-0101.md` → `https://github.com/yogata/agent-dev-flow/blob/main/docs/adr/ADR-0101.md`
- `docs/adr/retired/ADR-0001.md` → `https://github.com/yogata/agent-dev-flow/blob/main/docs/adr/retired/ADR-0001.md`
- `src/opencode/skills/agentdev-gh-cli/SKILL.md` → `https://github.com/yogata/agent-dev-flow/blob/main/src/opencode/skills/agentdev-gh-cli/SKILL.md`
- `src/opencode/skills/` → `https://github.com/yogata/agent-dev-flow/tree/main/src/opencode/skills/`

### 対象外

- テンプレート変数プレースホルダー（`{xxx}` 形式）
- コードブロック内のパス参照
- `http://` `https://` で始まる既存 URL
- リポジトリ内 Markdown ファイル間の相対リンク
