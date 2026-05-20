# Requirements Review Finding プロトコル

`issue-save-req` と `issue-req` 間の requirements review finding のライフサイクルとスキーマを定義する。finding は要件レビューで検出された問題（SPLIT・重複・廃止・乖離等）を構造的に記録し、`issue-req` の明示入力ファイルとして次工程に渡すための中間アーティファクトである。

## Finding の保存先

- `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md`
- `docs/requirements/` には保存しない
- backlog-draft-protocol とは独立したライフサイクル（別の来源・別の経路・別のステータス値）

## Finding の frontmatter

```yaml
---
finding_type: SPLIT | MOVE | RETIRE | DUPLICATE | OBSOLETE | DRIFT
source_req: REQ-{NNNN} | null
source_command: issue-save-req
topic_slug: {topic-slug}
created: "{YYYY-MM-DD}"
status: open | consumed
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
| `status` | enum | `open`（未処理）/ `consumed`（処理済み） |

## Finding の本文構造

```markdown
## 検出概要
{何が検出され、なぜ重要か}

## 検出コンテキスト
{いつ・どのコマンドで・どのような処理中に検出されたか（例: issue-save-req の SPLIT 検出時）}

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
| `SPLIT` | 要件が膨張・関心分離の基準に該当し、複数REQへの分割が必要 | `issue-save-req` で SPLIT 検出時 |
| `MOVE` | 要件が別のREQに移動すべき | requirements review 時 |
| `RETIRE` | 要件が不要になり廃止すべき | requirements review 時 |
| `DUPLICATE` | 複数REQ間で要件が重複 | requirements review 時 |
| `OBSOLETE` | 要件が既に古く現在のシステムに適合しない | requirements review 時 |
| `DRIFT` | 要件と実装の間に乖離が生じている | requirements review 時 |

## Finding ライフサイクル

```
open → consumed
```

| 状態 | 遷移トリガー | 説明 |
|------|-------------|------|
| `open` | `issue-save-req` SPLIT検出時の作成 | 初期状態。処理待ち |
| `consumed` | `issue-req` が finding を入力として処理完了時 | finding が正式な要件変更に変換された状態 |

## 次工程

Finding は `issue-req` の明示入力ファイルとして渡される（ADR-0003 パターン）。

1. `issue-req` が finding ファイルを読み込む（明示入力ファイルとしての読み込み）
2. `issue-req` が finding の内容を解析し、正式な要件変更（CREATE / APPEND / UPDATE）に変換する
3. 変換後、finding の `status` を `consumed` に更新する

## コマンド間の責務分離

| 責務 | コマンド | 説明 |
|------|----------|------|
| Finding 作成 | `issue-save-req` | SPLIT検出時に finding ファイルを作成 |
| Finding 消費 | `issue-req` | 明示入力ファイルとして読み込み、要件変更に変換 |
| Finding 保存 | `issue-save-req` | `.sisyphus/drafts/` に保存 |
| Finding status 更新 | `issue-req` | 処理完了時に `consumed` に更新 |

## backlog-draft-protocol との分離

Finding は backlog-draft-protocol とは独立したライフサイクルで管理する。

| 項目 | backlog-draft | finding |
|------|---------------|---------|
| 経路 | `issue-backlog` → `issue-backlog-create` | `issue-save-req` → `issue-req` |
| ステータス値 | `draft` / `approved` / `issued` | `open` / `consumed` |
| frontmatter 構造 | period / sources 等を含む | finding_type / source_req 等を含む |
| ライフサイクルトリガー | クローズ済みissue/PRからの残課題抽出 | SPLIT検出・要件レビュー時の問題検出 |
| 保存先 | `.sisyphus/drafts/` | `.sisyphus/drafts/`（同一場所・別管理） |

## 参照

- **コマンド定義**: `issue-save-req.md`, `issue-req.md`
- **ADR**: `ADR-0003`（issue-req入力の抽象化）
- **REQ**: `REQ-0004-023` 〜 `REQ-0004-027`（finding protocol 要件）
- **関連プロトコル**: `backlog-draft-protocol.md`
