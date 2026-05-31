# Implementation Patterns

## コマンドfrontmatter規約

### エージェント指定

コマンドのfrontmatterでagentを指定。対話系コマンド（req-define）は `agent: prometheus`、ファイル操作系コマンド（req-save, case-open等）は `agent: sisyphus` を使用。

**対話系コマンド（req-define）:**
```yaml
---
description: ...
agent: prometheus
load_skills:
  - ...
---
```

**ファイル操作系コマンド（req-save, case-open等）:**
```yaml
---
description: ...
agent: sisyphus
load_skills:
  - ...
---
```

**理由**: デフォルトエージェント（Plan/Prometheus）の誤用を防止するため。PlanエージェントはRead-only権限であり、ファイル書込やコマンド実行ができない。

### Implementation Pattern 指定

各コマンドのfrontmatterに `implementation_pattern` を指定する（REQ-0103-015）。定義と対応表は [`reference/command-map.md`](../../.opencode/skills/agentdev-workflow-lifecycle/reference/command-map.md) の「Implementation Pattern Taxonomy」セクションが SSoT である。

```yaml
---
description: ...
agent: sisyphus
implementation_pattern: file-pipeline
load_skills:
  - ...
---
```

5パターン（wall-session, file-pipeline, manager-orchestrator, capture-only, read-only-diagnostic）は REQ-0103-016 において Pattern A/B/C/D（Issue 種別分類）と直交する。integrity-check が `implementation_pattern` の有無・妥当性（REQ-0108-022）、禁止 skill の検査（REQ-0108-023）、load_skills 整合性（REQ-0108-024）に加え、pattern 定義妥当性・command-map整合性（REQ-0108-026~027）、secondary pattern 検証（REQ-0108-028~030）、load_skills 過剰/不足診断（REQ-0108-031~032）、skill USE FOR/DO NOT USE FOR 整合性（REQ-0108-033~034）、未使用 skill 5カテゴリ分類（REQ-0108-035~036）、Phase 3候補分類（REQ-0108-037~038）を自動検証する。

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
- `id` と `tags` 内の要件IDは `REQ-{NNNN}-{NNN}` 形式（例: `REQ-0104`）

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

## REQ分類規約

旧REQ（REQ-0104〜0040）は3分類で管理する（REQ-0109）:

| 分類 | 意味 | 取扱い |
|------|------|--------|
| `retained` | 現行仕様としてそのまま有効 | 変更なし |
| `partially superseded` | 一部が新基準REQに移行 | 本文冒頭に移行範囲・後継REQ・履歴理由を記載 |
| `superseded` | 全面置き換え済み | 本文冒頭に置き換え理由を記載 |

**新基準REQ群**（REQ-0101〜0049）を現行仕様の主参照とする。README.md は新基準REQ群を先頭に配置し、旧REQ群をカテゴリ別セクションに分離する。

**要件行の記述規約**（REQ-0109, 004）:
- 要件行には振る舞い・制約・状態のみを記述する（SHALL）
- 反映作業（更新・削除・移動・名称変更等）を要件行に記述しない（SHALL NOT）
