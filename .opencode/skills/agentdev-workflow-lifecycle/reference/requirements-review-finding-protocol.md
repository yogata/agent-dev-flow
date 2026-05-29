# Requirements Review Finding プロトコル

`req-save` と `req-define` 間の requirements review finding のスキーマと扱いを定義する。finding は要件レビューで検出された問題（SPLIT・重複・廃止・乖離等）を構造的に記録し、`req-define` の明示入力ファイルとして次工程に渡すための中間アーティファクトである。

finding は state管理対象ではなく、req-define の入力として read-only で参照される Requirement Source である。作成以降の status 更新や state遷移は行わない。

## Finding の保存先

- `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md`
- `docs/requirements/` には保存しない
- backlog-draft-protocol とは独立した中間アーティファクト（state管理なし・read-only参照）

## Finding の frontmatter

```yaml
---
finding_type: SPLIT | MOVE | RETIRE | DUPLICATE | OBSOLETE | DRIFT
source_req: REQ-{NNNN} | null
source_command: req-save
topic_slug: {topic-slug}
created: "{YYYY-MM-DD}"
---
```

### frontmatter フィールド定義

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `finding_type` | enum | 検出された問題の種別（6種） |
| `source_req` | string \| null | 検出元のREQ番号。新規要件に由来しない場合は null |
| `source_command` | string | finding を作成したコマンド名 |
| `topic_slug` | string | finding の主題を示すスラグ（ファイル名と一致） |
| `created` | date | 作成日（YYYY-MM-DD） |

## Finding の本文構造

```markdown
## 検出概要
{何が検出され、なぜ重要か}

## 検出コンテキスト
{いつ・どのコマンドで・どのような処理中に検出されたか（例: req-save の SPLIT 検出時）}

## 影響範囲
{どのREQ・要件が影響を受けるか}

## 推奨アクション
{次に何をすべきか（例: REQ の分割、要件の移動、廃止要件の整理）}

## 関連情報
{関連するREQ、ADR、Issueへの参照}
```

## Finding 種別

| 種別 | 説明 | 検出タイミング |
|------|------|---------------|
| `SPLIT` | 要件が膨張・関心分離の基準に該当し、複数REQへの分割が必要 | `req-save` で SPLIT 検出時 |
| `MOVE` | 要件が別のREQに移動すべき | requirements review 時 |
| `RETIRE` | 要件が不要になり廃止すべき | requirements review 時 |
| `DUPLICATE` | 複数REQ間で要件が重複 | requirements review 時 |
| `OBSOLETE` | 要件が既に古く現在のシステムに適合しない | requirements review 時 |
| `DRIFT` | 要件と実装の間に乖離が生じている | requirements review 時 |

## 次工程

Finding は `req-define` の明示入力ファイルとして渡される（ADR-0003 パターン）。

1. `req-define` が finding ファイルを読み込む（明示入力ファイルとしての読み込み）
2. `req-define` が finding の内容を解析し、正式な要件変更（CREATE / APPEND / UPDATE）に変換する

## コマンド間の責務分離

| 責務 | コマンド | 説明 |
|------|----------|------|
| Finding 作成 | `req-save` | SPLIT検出時に finding ファイルを作成 |
| Finding 取り込み | `req-define` | 明示入力ファイルとして読み込み、要件変更に変換 |
| Finding 保存 | `req-save` | `.sisyphus/drafts/` に保存 |

## backlog-draft-protocol との分離

Finding は backlog-draft-protocol とは独立した中間アーティファクトである。state管理（ライフサイクル）は行わない。

| 項目 | backlog-draft | finding |
|------|---------------|---------|
| 経路 | `intake-from-github` → `req-backlog` | `req-save` → `req-define` |
| ステータス値 | `draft` / `approved` / `issued` | なし（state管理外） |
| frontmatter 構造 | period / sources 等を含む | finding_type / source_req 等を含む |
| 作成トリガー | クローズ済みissue/PRからの残課題抽出 | SPLIT検出・要件レビュー時の問題検出 |
| 保存先 | `.sisyphus/drafts/` | `.sisyphus/drafts/`（同一場所・別管理） |

## 参照

- **コマンド定義**: `req-save.md`, `req-define.md`
- **ADR**: `ADR-0003`（req-define入力の抽象化）
- **REQ**: `REQ-0004-023` 〜 `REQ-0004-027`（finding protocol 要件）
- **関連プロトコル**: `backlog-draft-protocol.md`
