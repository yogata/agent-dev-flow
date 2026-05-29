# 成果物ライフサイクル

RU・promoted artifact・REQ ファイル等の成果物ライフサイクルの宣言的ルールを定義する（REQ-0039-021）。

## 成果物一覧

| 成果物 | 格納先 | 生成コマンド | 消費コマンド | 削除トリガー |
|--------|--------|-------------|-------------|-------------|
| intake promoted artifact | `.agentdev/intake/promoted/*.md` | `intake-promote` | `req-backlog` | RU 化成功時（REQ-0039-006） |
| learning promoted artifact | `.agentdev/learning/promoted/*.md` | `learning-promote` | `req-backlog` | RU 化成功時（REQ-0039-006） |
| Requirement Unit（RU） | `.agentdev/backlog/req-units/RU-*.md` | `req-backlog` | `req-define`, `req-save`, `case-open` | REQ ファイル永続化完了時（REQ-0039-015）または Issue 作成完了時（REQ-0039-016） |
| REQ ファイル | `docs/requirements/REQ-{NNNN}.md` | `req-save` | `case-open`, `case-run`, `case-close` | なし（永続） |
| ADR ファイル | `docs/adr/ADR-*.md` | `req-save` | 参照のみ | なし（永続、superseded で管理） |

## RU ライフサイクル

### 生成

- **生成コマンド**: `req-backlog`
- **入力**: intake promoted artifact + learning promoted artifact
- **出力**: `.agentdev/backlog/req-units/RU-*.md`
- **フォーマット**: frontmatter（source_type, generated_by, generated_at, status, sources）+ Sources + Source Summary + 統合理由 + 要件化の方向（REQ-0039-002）

### 消費

RU は以下の2つのルートで消費される:

1. **req-define ルート**: `req-backlog` → `req-define`（RU を明示入力ファイルとして読み込み）→ `req-save` → `case-open` → `case-run`
2. **直接 Issue 化ルート**: `req-backlog` → `req-define` → `case-open`（バグ修正・軽微変更の場合）

### 削除

RU の削除トリガーは以下のいずれか（REQ-0039-015, 016, 017）:

| トリガー | コマンド | 条件 |
|----------|---------|------|
| REQ ファイル永続化完了 | `req-save` | RU の内容が REQ ファイルに正常保存された後 |
| Issue 作成完了 | `case-open` | RU の内容が GitHub Issue に正常作成された後 |

- **削除条件**: Requirement Source の永続化完了（REQ ファイル保存成功 または Issue 作成成功）に限定
- **残置条件**: 永続化が未完了の場合は RU を残置する

## Promoted Artifact ライフサイクル

### Intake Promoted

- **生成**: `intake-promote` が `.agentdev/intake/promoted/*.md`（フラット）に出力
- **消費**: `req-backlog` が読み込み
- **削除**: RU 化成功時に `req-backlog` が削除（REQ-0039-006）
- **残置**: RU 化失敗・矛盾検出時は `promoted/` に残置

### Learning Promoted

- **生成**: `learning-promote` が `.agentdev/learning/promoted/*.md`（フラット）に出力
- **消費**: `req-backlog` が読み込み
- **削除**: RU 化成功時に `req-backlog` が削除（REQ-0039-006）
- **残置**: RU 化失敗・矛盾検出時は `promoted/` に残置

## データフロー

```
intake-promote → .agentdev/intake/promoted/*.md ──┐
                                                    ├→ req-backlog → .agentdev/backlog/req-units/RU-*.md
learning-promote → .agentdev/learning/promoted/*.md ┘                     │
                                                                          ├→ req-define → req-save → REQ ファイル（RU 削除）
                                                                          └→ req-define → case-open → Issue（RU 削除）
```

## 制約

- promoted artifact はフラット構造（サブディレクトリなし）からのみ読み込む（REQ-0039-011, 012）
- `req-define` は promoted artifact を直接読み込まない（REQ-0039-019）。RU 経由が必須
- `req-define` はユーザーの直接入力及び一般 source file を引き続き受け入れる（REQ-0039-020）
- raw item（inbox.md, archive.md, entries/）は req-backlog の更新対象外（REQ-0039-009）
