---
title: design-save Design
status: accepted
created: 2026-06-21
updated: 2026-08-21
---

<!-- ADF-COVERS(implementation): REQ-021-013, REQ-021-020 -->
<!-- ADF-COVERS(implementation): REQ-004-041, REQ-006-107 -->

# design-save Design

## 目的

req-define で分離された Design 保存対象（`draft-data` の `artifact_actions` 内 `artifact: design` entry）を `docs/designs/**/*.md` に保存、確定する。
req-save の次、case-open の前に実行する。
全 work_type 対象であり、`work_type` による判定は廃止する（REQ-008-009）。

## 承認・HITL 境界

- design-save 自身の承認点を持たない（req-define で分離済みの Design 保存対象を入力として保存する）。
- 配置一貫性検証の保存拒否、Design 分離基準の最終確認で REQ 残留と判定した場合は、保存せず停止してユーザー判断を求める。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define が生成し req-save が REQ 保存済みのドラフト、`draft-data` の `artifact_actions` に `artifact: design` entry を含む）

## 出力

- `docs/designs/**/*.md`（既存 Design への追記 or 新規 Design 作成）
- `.agentdev/drafts/req-draft-{topic-slug}.md`（Design artifact_actions 消費済みフラグの status 更新）

## 副作用

- ファイル作成/更新: `docs/designs/**`, `.agentdev/drafts/**`（status 更新用）。`docs/designs/README.md` は Design 操作に付随する更新のみ許可
- git 操作: commit + push（`agentdev-conventional-commits` + `agentdev-git-worktree` 並列実行安全ステージング）
- Issue 作成: 行わない（case-open 責務）
- deviation capture: design-save 実行中に実観測した deviation を agentdev-learning-capture skill または
  agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存。
  保存先は capture-boundaries.md の Split Rule に従う。
- git 永続化: capture 成果物を design-save 自身の既存 commit/push 処理内で永続化。
- 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節（`結果` 内）に含める。

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-design-save`）が正規情報源である。

- 事前チェック: `draft-data` の `artifact_actions` から `artifact: design` entry の有無を確認。なければ no-op 完了。ドラフト不存在時はエラー中止
- Design artifact_actions 読込（`artifact: design` entry を読込）。`artifact_actions` フィールド不存在（旧形式 draft）の場合は Design 保存対象なしと判定し no-op 完了（後方互換）。各 action の `target`（file path または `new:{slug}`）、`operation`（公式 enum: create/append/update の3値。別名は不受理、REQ-008-058）、`content` を処理対象とする
- 配置先解決（既存 Design パス（例: `docs/designs/foundations/patterns.md`）→ update 操作）。`target_design: {operation, domain, slug}` 構造化 → 新規 Design 作成（`docs/designs/{domain}/{topic-slug}.md`）。同一 `target` の action は1つの Design へ集約。配置先解決の決定的処理は `agentdev-req-file-manager/scripts/` の決定的スクリプトで実行（REQ-001-029、design-principles.md 第5節「決定的処理の Script 委譲原則」）
- Design 分離基準の最終確認（各 action が REQ-001-055（Design に置くべき内容の基準）に適合するか再確認）。安定契約例外（REQ-001-069）相当は除外し follow-up に明示
- Design ファイル操作。`target_area` 見出し検索は `agentdev-design-file-manager/scripts/` の決定的スクリプトで実行
  - create: 新規 Design ファイルを frontmatter（`title`, `status: draft`, `created`, `updated`）付きで作成し、action の `content` をセクションとして記載
  - update: `target_area` 指定時は対象セクションを `content` で置換、未指定時は該当セクションへ `content` を追記。frontmatter `updated` を更新。`status` は変更しない。詳細は「target_area ベースのセクション置換ロジック」セクション参照
  - append: 既存 Design ファイルへ `target_area`（anchor）と `placement` に基づき `content` を新規セクションとして追加。frontmatter `updated` を更新。`status` は変更しない。詳細は「append 操作時のセクション追加ロジック」セクション参照
  - 各 action の `target_area`（指定時）に応じた適切なセクション見出しを用いる
- インデックス整合（新規 Design 作成時は `docs/designs/README.md`（Design 一覧）に追加）。既存 Design 追記時は README 更新不要。エントリ存在確認は決定的スクリプトで実行
- Design 一覧整合確認（Design 操作が `docs/designs/README.md` の Design 一覧に影響するか確認し、影響がある場合は更新）
- ドラフト status 更新（`draft-data` に Design 消費済みフラグを付与）。commit/push より前に更新し commit 対象に含める
- 変更範囲検証（許可パス照合は `agentdev-req-file-manager/scripts/` の決定的スクリプトで実行。`git diff --name-only` で `docs/designs/**` と `.agentdev/drafts/**` 以外の変更を検出したらエラー報告、指示待ち（自動破棄しない））
- コミット、プッシュ（`agentdev-conventional-commits` + `agentdev-git-worktree` 並列実行安全ステージング）
- 完了報告（保存した Design 一覧（新規/追記別）、スキップ有無、follow-up（安定契約例外で除外した候補））

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（`src/opencode/commands/agentdev/design-save.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（STEP 構成、resume protocol、reference 構成）は Workflow Skill（`agentdev-workflow-design-save`）が所有し、本 Design はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 配置一貫性検証

design-save は Design ファイル保存に先立ち、保存内容と配置先の整合を「配置一貫性検証」として検証する（REQ-001-034、REQ-001）。
配置一貫性検証は確定済み分類・所有情報と保存先の整合確認であり、「内容品質の再査読」ではない（REQ-001-030 との整合）。
内容品質は引き続き req-define QG-1 の責務である。

### 検証項目

| 検証項目 | 内容 | 不一致検出時 |
|---|---|---|
| 配置ドメイン整合 | 変更の所有対象（artifact_action が示す正規所有対象）と配置先ドメイン（commands/ skills/ workflows/ 基盤6ドメイン）が整合する | 保存を停止し、分類または追記先の再判定へ戻す |
| 別所有Design 不存在 | 同一関心の別の正規所有 Design が存在しない（REQ-003-038 違反でない） | 同上 |
| 横断Design 不当配置 不存在 | command 固有仕様を不当に横断 Design へ配置していない | 同上 |
| パラメータ不当混入 不存在 | パラメータ変更を不当に挙動説明またはカタログへ混入させていない（v2:REQ-0155-009 準拠） | 同上 |
| accepted 間分界矛盾 不存在 | accepted Design 間で責任分界が矛盾しない | 同上 |

不一致を検出した場合、保存せず、分類または追記先の再判定へ戻す。

### 強制ゲート（保存拒否）の有効化条件

強制ゲート（保存拒否条件: 重複所有、配置不一致）は配置一貫性検証の入力（`../responsibilities/artifact-contracts.md`「分類根拠伝播契約」の伝播フィールド）で機械判定可能な項目について有効化する（REQ-001-035）。
Design ファイルの基本frontmatterは title、status、created、updated の4キーとし、伝播フィールドを Design ファイルへ宣言として書き込まない。

### 配置一貫性検証の入力読取（CREATE/UPDATE 共通）

design-save は req-define が `artifact_actions` の Design action へ出力した `canonical_owner` を読み取り、CREATE/UPDATE 各操作で配置一貫性検証の入力とする。
分類値が `unknown` または欠落の場合は警告して処理を継続する（soft-contract、欠落だけを理由に保存拒否しない、DEC-003）。
既存 Design へ遡及的に伝播フィールドを書き込まない（REQ-001-035 段階適用）。

### 段階適用

配置一貫性検証の未実施残存は警告モードで経過観察する（後方互換期間）。段階適用は次の5ステップとする:

| ステップ | 内容 |
|---|---|
| (a) 検証入力確定 | 分類根拠伝播契約の伝播フィールド（`canonical_owner`）を配置一貫性検証の入力として確定する（完了: `../responsibilities/artifact-contracts.md`「分類根拠伝播契約」） |
| (b) 警告モード棚卸し | 既存 Design を警告モードで棚卸し、配置一貫性検証の適用状況を把握する |
| (c) 重複解消 | 同一関心キーに対する複数の正規所有 Design を解消する |
| (d) 新規/変更 Design 強制 | 新規作成、または変更がある Design に対して配置一貫性検証を強制する |
| (e) 全件強制 | 全 Design に対して配置一貫性検証を強制する |

bootstrap 問題（検証前に強制すると既存 Design 処理不能）を避けるため、強制は段階的に有効化する。
各ステップの移行条件、タイミングは別途 inspect/backlog 経由で判断する。

### 検証と内容品質の責務分離

配置一貫性検証は配置先の整合確認であり、内容品質の再査読ではない。
内容品質は req-define QG-1 の責務（REQ-001-030）。
design-save が配置一貫性検証で不一致を検出した場合、保存を停止するが、内容品質の再評価は実施しない。

## target_area ベースのセクション置換ロジック

`operation: update` において action の `target_area` が指定された場合、design-save は対象 Design ファイル内で `target_area` に一致する見出し行を検索し、セクション置換を行う（REQ-001-027、REQ-008-058）。

Design operation の公式 enum は `create` / `append` / `update` の3値である（別名は不受理、REQ-008-058）。
`append` の配置契約は後段「append 操作時のセクション追加ロジック」に定める。

### マッチング規則

- 対象 Design ファイル内の見出し行を走査し、`target_area` に一致する見出し行を検索する
- **入力正規化**: `target_area` に Markdown 見出しプレフィックス（`##`、`###` 等）が含まれる場合、比較前にプレフィックスを除去して見出しテキスト部分へ正規化する。`## セクション名` と `セクション名` のいずれの形式でも同じ結果となる
- **見出し行全体完全一致**: 正規化後の見出しテキストが見出し行全体と完全一致する場合のみマッチとする。前方一致、後方一致、部分一致は受け付けない（例: 正規入力 `### IR-044` は見出し行 `### IR-044 - 題` とはマッチしない）。この規則は `search-target-area.ts` が正規契約に従うことを要求する
- 当該見出し行から次の同レベル（または上位レベル）見出し行の直前までを「セクション」として特定する
  - 例: `### X` で検索した場合、次の `###` または `##` または `#` 見出しの直前までを範囲とする
- 特定したセクションを action の `content` で置換する

### 複数マッチ時の挙動

`target_area` に一致する見出しが複数存在する場合、最初のマッチを採用し warn を出力する。

### 未検出時の挙動

`target_area` に一致する見出しが存在しない場合、当該 action をスキップし、follow-up として「target_area 未検出、operation を create へ切り替えを推奨」を報告する（全体中止しない）。

### 後方互換（target_area 未指定）

`target_area` が未指定の draft（旧形式）、または `operation` が create の場合は従来の「追記」動作を維持する（REQ-001-028）。
`target_area` が指定された場合のみ「置換」動作を適用し、既存 draft の破壊を防ぐ。

### append operation の処理

`operation: append` の場合、design-save は既存 Design ファイルへ新規セクションを追加する（REQ-008-058）。
本操作は `target_area`（追加対象の見出し行全体）と `placement`（追加位置指示）で追加対象を特定し、`placement` が `tail` 以外の場合は `anchor` 見出し行を基準に挿入位置を算出する。

主な処理（配置契約の実行詳細は後段「append 操作時のセクション追加ロジック」セクションが正規所有する）:

- `target_area` と完全一致する見出しが既存 Design ファイルに存在する場合は追加をスキップし、follow-up 報告を行う（重複追加防止、全体中止しない）
- `placement: tail`（既定）の場合は Design ファイル末尾へ新規セクションを追加する
- `placement: after_anchor` / `before_anchor` の場合は `anchor` で指定された見出し行の前後へ追加する。`anchor` が未検出の場合は action をスキップし、follow-up 報告を行う（全体中止しない）
- 合格基準: 追加後の Design ファイルに `target_area` と完全一致する見出しが1つだけ存在すること

### search-target-area.ts 契約

target_area 見出し検索は `agentdev-design-file-manager/scripts/src/search-target-area.ts`（Design 固有決定的処理）へ委譲する（REQ-0136-029）。
本 script は次の契約に従う。

- 見出し行全体との完全一致のみを受け付ける。前方一致、後方一致、部分一致は受け付けない
- 入力正規化: `target_area` に Markdown 見出しプレフィックス（`##`、`###` 等）が含まれる場合、比較前にプレフィックスを除去して見出しテキスト部分へ正規化する（`## セクション名` と `セクション名` は同一に扱う）
- 正規入力（例: `### IR-044`）での回帰テストを維持する。正規入力 `### IR-044` は見出し行 `### IR-044 - 題` とはマッチしない（見出し行全体との完全一致のみ許容）
- 本契約は `operation: update` の `target_area` マッチングと、`operation: append` の `anchor` マッチングの双方に適用される

## append 操作時のセクション追加ロジック

`operation: append` は既存 Design ファイルへ新規セクションを追加する操作である（公式 enum の1値、REQ-008-058）。
`target_area`（追加対象の見出し行全体）で追加対象の見出しを特定し、`placement` と `anchor` で挿入位置を指示する。
契約の正規所有は `../responsibilities/artifact-contracts.md`「append operation」、本節は配置契約の実行詳細を正規所有する。

### 入力契約

| field | 必須性 | 形式 |
|---|---|---|
| `target_area` | 必須 | 追加対象の見出し行全体（Markdown 見出し行形式。例: `### IR-044`）。見出しプレフィックス（`##`、`###` 等）の有無は正規化により吸収する |
| `content` | 必須 | 追加する新規セクション本文（見出し行から始まる） |
| `placement` | 任意（省略時 `tail`） | `tail` / `after_anchor` / `before_anchor` のいずれか |
| `anchor` | `placement` が `tail` 以外は必須 | 挿入位置の基準となる見出し行（`target_area` と同一形式） |

### placement 別挙動

| placement | 追加位置 |
|---|---|
| `tail`（既定） | Design ファイル末尾へ新規セクションを追加する（`anchor` 不要） |
| `after_anchor` | `anchor` 見出し行の直後（`anchor` セクション本文の先頭） |
| `before_anchor` | `anchor` 見出し行の直前 |

`tail` は `anchor` を参照せず Design ファイル末尾へ新規セクションを追加する。
`after_anchor` は `anchor` セクション本文の先頭へ挿入する。
`before_anchor` は `anchor` セクションの前に新規セクションを挿入する。

### anchor マッチング規則

- 「target_area ベースのセクション置換ロジック」の「マッチング規則」と同一の規則を適用する（入力正規化、見出し行全体完全一致）。正規契約の詳細は同セクション「search-target-area.ts 契約」参照
- anchor 見出し行が複数存在する場合、最初のマッチを採用し warn を出力する

### anchor 未検出時の挙動

`placement` が `tail` 以外で `anchor` 見出し行が存在しない場合、当該 action をスキップし、follow-up として「anchor 未検出、operation を create へ切り替えを推奨」を報告する（全体中止しない）。

### 同名見出し時の挙動

`target_area` と完全一致する見出しが既存 Design ファイルに存在する場合、design-save は当該 action の追加をスキップし、follow-up として「同名見出し既存、operation を create へ切り替えを推奨、または `target_area` を変更して再指定を推奨」を報告する（重複追加防止、全体中止しない）。

### 合格基準

- 追加後の Design ファイルに `target_area` と完全一致する見出しが1つだけ存在すること
- `placement` が `tail` の場合は Design ファイル末尾へ、`after_anchor` / `before_anchor` の場合は `anchor` 見出し行の前後へ `content` が挿入されていること
- 挿入結果の Design ファイルが Markdown 構造として破損しないこと（見出し階層の不整合がないこと）
- frontmatter `updated` が更新されていること
- `status` は変更しないこと

### 旧別名の不受理

Design operation の旧別名（`spec-create` / `spec-update` / `spec-append`）と新別名（`design-create` / `design-update` / `design-append`）は受理しない（REQ-008-058）。
旧別名が指定された場合は形式不正としてエラー中止し、req-define 差し戻しを推奨する。

## トレーサビリティ能力の利用

design-save は、req-define で Design action と対象要件の対応が明示的に確定している場合、その情報を利用して Design 文書と要件の対応関係を対応宣言として保存できる（REQ-021-013）。
対応宣言の表記仕様は `agentdev-traceability` Design「対応宣言の表記」が正規所有し、本 Design は表記仕様を再定義しない。

- Design 本文の自由記述から対象要件を再推論して正規の対応関係を生成しない
- Design 文書の対応付けは任意とし、Design action が存在しない要件の処理を妨げない
- 対応 REQ、同一または関連 canonical owner を持つ Design、関連 command, skill, integrity rule の探索は、README 索引、正規成果物の直接読取、`rg` 等の独立探索手段で行う（agentdev-traceability を一般文書探索、依存関係探索へ利用しない）
- 中断後の再実行では、正規成果物に保存済みの対応宣言を再利用し、同じ対応宣言を重複生成しない（REQ-021-020）

## 参照する横断 Design

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（artifact_actions 工程分岐、README 索引影響規則）
- [quality-gates.md](../quality/quality-gates.md)（Design lifecycle 連携（QG-4 で accepted 昇格））
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（Design body 品質検査）
- [req-health-metrics.md](../quality/req-health-metrics.md)（Design 分離基準との連携）
- [integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md)（IR-057 obsolete-spec-path-after-domain-split、targeted docs guard 連携）

## targeted docs guard (v2:REQ-0158-003)

Design保存工程では、変更されたDesignと連動する`docs/designs/README.md`を`check_changed_docs.ts --workflow design-save`で検査する。

検査は以下を含む。

- Design frontmatter必須項目
- status値`draft`、`accepted`の妥当性
- Design READMEのstatus同期
- Designドメイン分類、リンク、Design 一覧更新要否
- command/skill/integrity Designと対応原本・catalog・rule file・scriptの整合

strict failureが存在する場合は修正して再実行する。
## 対象外

- Design 対象 artifact_actions（`artifact: design`）がない場合の Design ファイル作成、編集（no-op 完了）
- `docs/designs/**`, `.agentdev/drafts/**`, `docs/designs/README.md` 以外のファイル作成、編集。REQ ファイル（`docs/requirements/**`）、Decision（`docs/decisions/**`）、コマンド、スキル、テンプレート編集禁止
- Design 対象 artifact_actions がない場合の Design ファイル作成、編集
- 新規 Design 作成時の `status: draft` 省略
- 既存 Design 追記時の `status` 変更（`status: accepted` 昇格は case-close 責務）
- Design status が `draft` の Design を IR-044（REQ/Design 境界違反検出）の対象に含めること
- REQ-001-055（Design 分離基準）不適合 action の保存（安定契約例外 REQ-001-069 は follow-up 扱い）
- 実行時コマンドが Design ファイルに依存する記述（REQ-001 実行時非依存維持）
- Design artifact_actions の分離根拠、配置先判定の再分類（req-define `agentdev-req-analysis` 結果を尊重）
- Design status 昇格（draft → accepted）の判定（case-close 責務）
- Issue 作成（case-open 責務）

## 検証観点

- 品質ゲート（適用結果の整合性検証）: target_area 置換結果の整合性、Design status の整合性（新規作成時 `status: draft` 付与）、インデックスの整合性（`docs/designs/README.md` エントリと新規 Design の一致）、変更範囲の妥当性を検証。内容の品質は req-define の QG-1 の責務（REQ-001-030）
- Design 分離基準適合性（REQ-001-055）: 各 action の content が Design に置くべき内容か
- frontmatter 完全性: 新規作成時の `title`, `status: draft`, `created`, `updated`
- 配置先解決の正確性: 既存パス vs `new:{slug}` の判定、重複候補統合
- 変更範囲検証: `docs/designs/**` と `.agentdev/drafts/**` 以外の変更を含まないこと

## case-auto 並列委譲モデル（REQ-006-087〜093）

design-save は複数 Design ファイルの変更案作成、検査を並列化できる（REQ-006-091）。
異なる target パスの Design create/update は L0（完全独立）のため並列可能（最大5件）。
同一 Design ファイルへの複数 action のみ順序依存のため直列サブセットとして分離。
最終的な commit/push は v2:REQ-0137 の明示パス指定で一括実行。

## 停止状態

- ドラフトファイル不存在時（エラー中止する）。
- 配置一貫性検証による保存拒否時（対象 action を保存せず停止する）。
- 変更範囲検証で許可パス外の変更を検出した場合（自動破棄せずエラー報告、指示待ちで停止する）。
- 実行前同期（`git pull --ff-only`）失敗時、push 失敗時（エラーを報告して停止する）。

## See Also

- [req-define.md](req-define.md)（前段コマンド（Design 候補分離））
- [req-save.md](req-save.md)（前段コマンド（REQ/Decision 保存））
- [case-open.md](case-open.md)（後続コマンド（Issue 作成））
- `agentdev-workflow-design-save` skill（workflow 実装本体（STEP 構成、resume protocol））
- `agentdev-artifact-validation` skill（README エントリ存在確認）
- `agentdev-conventional-commits` skill（コミットメッセージ規約）
- `agentdev-git-worktree` skill（並列実行安全 git 操作）
- REQ-001（REQ/Design 責務分離の徹底と design-save 新設）
- REQ-008（構造化 req_draft 契約）
- v2:ADR-0123（Design lifecycle（draft/accepted））

