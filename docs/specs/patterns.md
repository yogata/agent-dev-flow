# Implementation Patterns

## コマンドfrontmatter規約

### エージェント指定

コマンドのfrontmatterでagentを指定。対話系コマンド（issue-req）は `agent: prometheus`、ファイル操作系コマンド（issue-save-req, issue-create等）は `agent: sisyphus` を使用。

**対話系コマンド（issue-req）:**
```yaml
---
description: ...
agent: prometheus
load_skills:
  - ...
---
```

**ファイル操作系コマンド（issue-save-req, issue-create等）:**
```yaml
---
description: ...
agent: sisyphus
load_skills:
  - ...
---
```

**理由**: デフォルトエージェント（Plan/Prometheus）の誤用を防止するため。PlanエージェントはRead-only権限であり、ファイル書込やコマンド実行ができない。

## .sisyphus/ 命名規則

`.sisyphus/` 配下の7カテゴリ（plans, drafts, evidence, execution, notepads, tasks, reports）のファイル・ディレクトリ命名は plan 名を基準とする。詳細なルール・例は `AGENTS.md` の「Sisyphus 命名規則」セクションを参照。

**重要**: notepads は完全一致マッチングのみ対応。plan 名にサフィックスがある場合、notepad ディレクトリ名にも同一サフィックスが必要。

## REQ frontmatter規約

REQ文書のfrontmatterには以下のフィールドを定義する:

```yaml
---
id: REQ-{NNNN}
title: {領域タイトル}
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
tags: [{tag1}, {tag2}]
---
```

- フィールドは `id`, `title`, `created`, `updated`, `tags` のみ。`status` および `scale` フィールドは持たない
- `id` と `tags` 内の要件IDは `REQ-{NNNN}-{NNN}` 形式（例: `REQ-0028-001`）

### REQセクション構成

```markdown
## 目的

{この領域の要件が存在する理由}

## 要件

| ID | 要件 |
|---|---|
| REQ-{NNNN}-001 | {RFC 2119言語で記述} |

## 適用範囲

- **対象**: ...
- **対象外**: ...
```

- セクションは 目的 / 要件 / 適用範囲 のみ。FR/NFRの区別を持たない
- 要件はRFC 2119言語（SHALL/SHOULD/MAY）で記述する
