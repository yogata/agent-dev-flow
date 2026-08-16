---
title: Decision Lifecycle
status: draft
created: 2026-08-10
updated: 2026-08-10
canonical_owner: decision-lifecycle
spec_logical_division: cross_cutting_contract
---

<!-- declaration
spec_logical_division: cross_cutting_contract
canonical_owner: decision-lifecycle
-->

# Decision Lifecycle

本 SPEC は agent-dev-flow リポジトリのみに適用される。

## 目的

Decision の関係モデル、粒度管理規則、健全性評価モデルを正規所有する（REQ-001-061〜064、AG-005、AG-006、AG-017）。
Decision は REQ と管理特性を分離し（AG-004）、意味的健全性で粒度を評価し（AG-006）、REQ 重複・分割モデルと分離された健全性評価を持つ（AG-017）。
本 SPEC はこれらを Decision 固有の契約として定義し、document-model.md「文書ライフサイクル」から参照される詳細を所有する。

### 他 SPEC との役割分担

| 関心 | 主に扱う SPEC |
|---|---|
| 文書種別基準境界、文書ライフサイクル全体、accepted Decision の意味的不変、編集制約 | `document-model.md` |
| Decision 関係モデル（relates-to / supersedes / reaffirms）、粒度管理規則、健全性評価モデル | 本 SPEC |
| REQ 健全性メトリクス、SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT 診断観点 | `../quality/req-health-metrics.md`、`../responsibilities/document-type-responsibilities.md` |
| Decision ID 形式、採番規則、欠番管理 | `patterns.md`、`numbering-policy.md` |

本 SPEC は Decision 固有の意味境界、関係、粒度、健全性に特化し、REQ 健全性モデルと重複しない（AG-017）。

## Decision 関係モデル

Decision 間の意味的関係を追跡可能とする（REQ-001-062、AG-005）。
関係は3種類とし、frontmatter `relations` フィールドで宣言する。

### 関係タイプ enum

| 関係タイプ | 意味 | 方向性 | 例 |
|---|---|---|---|
| `relates-to` | 関連。意味的に関連するが置換でも再確認でもない関係 | 双方向性（どちらからでも宣言可能） | セキュリティ判断とパフォーマンス判断の関連 |
| `supersedes` | 置換。後継 Decision が前の Decision を置き換える | 単方向（後継 → 前任） | DEC-009 が DEC-003 を拡張置換する場合 |
| `reaffirms` | 再確認。既存 Decision を改めて承認し直す関係 | 単方向（再確認 → 原本） | 新しい文脈で DEC-001 の判断を改めて承認する場合 |

`supersedes` は文書ライフサイクル上の `status: superseded` 遷移と協調する。
`supersedes` 関係を宣言された前任 Decision は、`superseded_by` frontmatter で後継 Decision を指す。
`reaffirms` は原本 Decision の status を変更せず、意味的承認の再確認のみを記録する。

### frontmatter relations フィールド仕様

Decision frontmatter の `relations` フィールドで関係を宣言する。

```yaml
---
id: DEC-{NNN}
title: {Decision タイトル}
status: proposed | accepted | superseded | deprecated
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
relations:
  - type: relates-to | supersedes | reaffirms
    target: DEC-{NNN}
    reason: {関係の理由（1行）}
---
```

- `relations` は optional フィールドとする。関係を持たない Decision は `relations` を省略する
- `type` は必須。3値のいずれかとする
- `target` は必須。対象 Decision の `DEC-{NNN}` 識別子とする
- `reason` は必須。関係を1行で説明する
- 同一対象への複数関係宣言を禁止しないが、`type` と `target` の組合せは一意とする

### serialization 形式

- frontmatter `relations` フィールドで宣言する（YAML list of objects）
- Markdown 本文内に関係を再掲する必要はない。frontmatter が SSoT
- 後継 Decision が `supersedes` を宣言した場合、前任 Decision の frontmatter `superseded_by` フィールドへ後継 Decision のパスを記録する（双方向からの参照整合）
- `reaffirms` は原本 Decision の status を変更せず、再確認の事実だけを frontmatter へ記録する

## Decision 粒度管理

Decision の SPLIT / MERGE は固定件数ではなく意味的健全性で評価する（REQ-001-063、AG-006）。
件数、行数、文字数等の機械的閾値だけで SPLIT / MERGE を判定しない。

### 粒度評価シグナル

Decision の粒度健全性を次の5シグナルで評価する。
複数シグナルの累積で SPLIT または MERGE 候補とみなす。

| シグナル | 内容 | SPLIT / MERGE 候補 |
|---|---|---|
| 無関係な判断の混在 | 単一 Decision に意味的に無関係な複数判断が混在している | SPLIT 候補 |
| 責務領域の過度な混在 | 単一 Decision が複数の責務領域（セキュリティ、パフォーマンス、運用、文書体系等）にまたがり、各領域の判断が独立して成立する | SPLIT 候補 |
| 判断境界の不明瞭化 | Decision の主題が曖昧で、読者が判断範囲を特定できない | SPLIT または MERGE 候補（文脈で判定） |
| accepted Decision 間の矛盾 | 複数の accepted Decision が意味的に矛盾する。矛盾は `relates-to` 関係で明示するか、後継 Decision による `supersedes` で解消する | MERGE または 後継作成候補 |
| 関係付けされていない実質的な再確認・置換候補 | 実質的に再確認または置換に該当する関係が `relations` フィールドで宣言されていない | `reaffirms` / `supersedes` 宣言候補 |

### 評価プロセス

1. 各 Decision について上記5シグナルを評価する
2. 単一シグナルだけで SPLIT / MERGE を確定しない。複数シグナルの累積、または深刻な単一シグナル（例: 明白に無関係な判断の混在）で候補とする
3. SPLIT 候補は元 Decision を `superseded` とし、分割先 Decision 群を新規作成する。分割先 Decision は `relates-to` で相互参照する
4. MERGE 候補は統合先 Decision を新規作成し、元 Decision 群を `superseded` とする。統合先 Decision は各元 Decision へ `supersedes` を宣言する
5. 再確認・置換候補は既存 Decision の frontmatter `relations` へ `reaffirms` / `supersedes` を追記する。新規 Decision 作成を必須としない

### 機械的閾値の扱い

件数、行数、文字数等の機械的閾値は補助情報として扱い、単独で SPLIT / MERGE を確定しない。
機械的閾値の超過は詳細評価のトリガーであり、判定そのものではない。
REQ 健全性メトリクス（`req-health-metrics.md`）の閾値モデルとは独立して運用する（AG-006）。

## Decision 健全性評価モデル

Decision 健全性評価は REQ 重複・分割モデルと分離し、Decision 固有の意味境界、関係、矛盾を評価対象とする（REQ-001-064、AG-017）。
類似性だけを根拠とする自動 MERGE を禁止する。

### 評価対象

| 評価対象 | 内容 | REQ 健全性モデルとの関係 |
|---|---|---|
| 意味境界の健全性 | 各 Decision が単一の判断境界を保っているか（粒度管理の5シグナルで評価） | REQ 関心ズレ検出とは独立 |
| 関係の健全性 | `relations` 宣言が実態と一致しているか。実質的な再確認・置換が未宣言ではないか | REQ には関係モデルなし（AG-005 が Decision 固有） |
| 矛盾の健全性 | accepted Decision 間に意味矛盾がないか。矛盾がある場合は `relates-to` で明示されるか、後継 Decision で解消されるか | REQ 矛盾検出とは独立 |
| 判断文脈の多様性許容 | 意味的に近い複数 Decision の存在だけを理由として、重複違反または自動統合対象としない | REQ 重複排除モデルとは分離（AG-004） |

### 自動 MERGE 禁止

類似性（cosine 類似度、文字列類似度、主題の近さ等）だけを根拠とする Decision の自動 MERGE を禁止する。
類似性検出は人間または LLM の評価トリガーとし、最終判断は意味境界、責務領域、判断文脈の評価を経て行う。

類似性が高いだけの Decision 対は、次のいずれかに該当する場合 MERGE せず別 Decision として維持する。

- 判断文脈が異なる（例: セキュリティ観点の判断とパフォーマンス観点の判断が同じ技術対象についてなされる場合）
- 判断時期が異なり、後の判断が前の判断を `reaffirms` で再確認している場合
- 判断対象の責務領域が異なる場合

類似性が高く、かつ上記いずれにも該当しない場合は MERGE 候補とするが、自動実行せず人間または LLM の最終判断を経る。

### REQ 健全性モデルとの分離

REQ 健全性メトリクス（`req-health-metrics.md`）の SPLIT / MERGE / DUPLICATE 診断観点は REQ 体系に適用する。
Decision 体系へは本 SPEC の粒度管理規則、健全性評価モデルを適用する。
両者は独立して運用し、閾値、判定プロセス、評価対象を共有しない（AG-017）。

### 診断観点との対応

inspect-docs の診断観点（SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT）は REQ 体系を主対象とする。
Decision 体系へ適用する場合は本 SPEC の粒度管理規則、健全性評価モデルへ読み替える。
読み替え対応は本 SPEC が正規所有する。

| 診断観点 | Decision 体系での読み替え |
|---|---|
| SPLIT | 粒度管理「無関係な判断の混在」「責務領域の過度な混在」シグナルで評価 |
| MERGE | 粒度管理「矛盾」「関係付け未宣言」シグナルで評価。自動 MERGE 禁止 |
| MOVE | Decision の配置ディレクトリ移動。意味境界の変更を伴わない |
| DUPLICATE | 類似性の高い Decision 対。判断文脈、責務領域の評価後に MERGE 候補判定。自動 MERGE 禁止 |
| RETIRE | Decision の廃止。`status: deprecated` または `superseded` への遷移 |
| DRIFT | Decision 記述と実態の乖離。accepted Decision の意味的不変原則との整合で評価 |

## 適用範囲宣言

本 SPEC は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（REQ-001）。
他プロジェクトへの適用を意図しない。
実行時コマンドは本 SPEC ファイルに依存しない（REQ-001）。

## 関連情報

- 関連 REQ: REQ-001（文書体系と持続可能な基準構造、要件行 061〜064）
- 関連 SPEC: `document-model.md`（文書ライフサイクル、accepted Decision の意味的不変）、`numbering-policy.md`（Decision 採番規則）、`../quality/req-health-metrics.md`（REQ 健全性モデル、本 SPEC と分離）
- 根拠合意項目: AG-004（REQ と Decision の管理特性分離）、AG-005（Decision 関係モデル）、AG-006（粒度管理の意味的健全性評価）、AG-017（Decision 健全性評価の REQ との分離）
