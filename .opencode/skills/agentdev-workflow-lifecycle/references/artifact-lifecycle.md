# 成果物ライフサイクル

AgentDevFlow の主要成果物（promoted artifact、RU、REQ ファイル）の生成・読取り・削除の宣言的ルールを定義する。

## ライフサイクル概観

```
promoted artifact → RU → REQ / Issue → RU 削除
```

| 成果物 | 生成コマンド | 読取りコマンド | 削除トリガー |
|--------|-------------|-------------|-------------|
| promoted artifact（intake） | `intake-promote` | `backlog-review` | RU 化成功時 |
| promoted artifact（learning） | `learning-promote` | `backlog-review` | RU 化成功時 |
| RU（Requirement Unit） | `backlog-save` | `req-define`, `req-save`, `case-open` | 永続化完了時 |
| REQ ファイル | `req-save` | `case-open`, `case-run`, `case-close` | なし（永続） |
| Issue | `case-open` | `case-run`, `case-close` | なし（永続） |

## Promoted Artifact

### 定義

promoted artifact は intake/learning パイプラインの最終出力であり、backlog-review コマンドの入力となる。

### 配置先

| パイプライン | 配置先 | 構造 |
|-------------|--------|------|
| intake | `.agentdev/intake/promoted/` | フラット（`*.md`） |
| learning | `.agentdev/learning/promoted/` | フラット（`*.md`） |

### 生成ルール

- `intake-promote`: レビュー済み intake item を `.agentdev/intake/promoted/*.md` に出力（REQ-0105）
- `learning-promote`: 昇華判定済み staging stub を `.agentdev/learning/promoted/*.md` に出力（REQ-0105）
- サブディレクトリへのルーティングは行わない（フラット構造）

### 読取り・削除ルール

- `backlog-review` が promoted artifact を読み込み、分析・HITLを経て review draft を保存する
- `backlog-save` が review draft から RU を生成する
- RU 生成に成功した promoted artifact は `backlog-save` が削除する（REQ-0105）
- 失敗・矛盾の promoted artifact は `promoted/` に残置する
- promoted artifact が 0 件の場合、`backlog-review` は正常終了する（REQ-0105）

## RU（Requirement Unit）

### 定義

RU は promoted artifact を分析・統合した構造化成果物であり、req-define の Requirement Source として機能する。

### 配置先

- `.agentdev/backlog/req-units/RU-*.md`

### 構造

```yaml
---
source_type: intake | learning | mixed
generated_by: backlog-save
generated_at: "{YYYY-MM-DDTHH:mm:ss}"
status: active
sources:
  - path: "{promoted artifact path}"
    type: intake | learning
---
```

frontmatter 以降に Sources セクション、Source Summary セクション、統合理由セクション、要件化の方向セクションを含む。

### 粒度ルール

- N:1（複数 artifact → 1 RU 統合）を許可（REQ-0105）
- 1:N（1 artifact → 複数 RU 分割）を許可（REQ-0105）
- promoted artifact の単純コピー（パススルー）は禁止（REQ-0105）

### 矛盾検出

- promoted artifact 間に矛盾が検出された場合、矛盾する artifact を RU 化せずユーザーに確認する（REQ-0105）
- 矛盾しない artifact は通常通り RU 化を継続する（partial success）

### 読取り・削除ルール

- `req-define` は RU を Requirement Source として受け入れる（REQ-0105）
- `req-define` は promoted artifact を直接読み込んではならない（REQ-0105）
- `req-save` は RU の内容が REQ ファイルに永続化された後、該当 RU を削除する（REQ-0105）
- `case-open` は RU の内容が Issue に永続化された後、該当 RU を削除する（REQ-0105）
- RU 削除のトリガーは永続化完了に限定する（REQ-0105）。永続化未完了の場合は RU を残置する

## REQ ファイル

### 定義

REQ ファイルは要件定義書の永続基準（SSoT）である。詳細は `artifact-boundaries.md` の Anchored Development モデルを参照。

### ライフサイクル

- 生成: `req-save` が `docs/requirements/REQ-{NNNN}.md` に保存
- 更新: `case-update` が APPEND/UPDATE 対応
- 参照: `case-open`, `case-run`, `case-close` が READ
- 削除: なし（永続ドキュメント）

## REQ再構成intake（REQ-0109）

REQ再構成intake lifecycle: `inbox/req-restructure/` → intake-review（独立判定基準）→ `accepted/req-restructure/` または `archive/rejected/req-restructure/`。backlog-review/backlog-saveへの移行はしない（REQ-0109）。将来のREQ再構成レビューの入力として蓄積する。

## 禁止事項

- `backlog-review` / `backlog-save` は intake/learning の raw item を更新してはならない（REQ-0105）
- `req-define` は promoted artifact を直接読み込んではならない（REQ-0105）
- promoted artifact のサブディレクトリルーティング（`promoted/req-define/`, `promoted/intake-open/`）は廃止
- `elevation-staging/` への出力は廃止（`promoted/` に統一）

## 参照

- **アーティファクト責務境界**: [`reference/artifact-boundaries.md`](./artifact-boundaries.md)
- **コマンド関連マップ**: [`reference/command-map.md`](./command-map.md)
- **SSoT遷移ルール**: [`reference/ssot-transitions.md`](./ssot-transitions.md)
