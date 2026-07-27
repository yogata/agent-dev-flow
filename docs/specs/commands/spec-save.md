---
title: spec-save SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-27
---

# spec-save SPEC

## 目的

req-define で分離された SPEC 保存対象（`draft-data` の `artifact_actions` 内 `artifact: spec` entry）を `docs/specs/**/*.md` に保存、確定する。
req-save の次、case-open の前に実行する。
全 work_type 対象であり、`work_type` による判定は廃止する（REQ-008-009）。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define が生成し req-save が REQ 保存済みのドラフト、`draft-data` の `artifact_actions` に `artifact: spec` entry を含む）

## 出力

- `docs/specs/**/*.md`（既存 SPEC への追記 or 新規 SPEC 作成）
- `.agentdev/drafts/req-draft-{topic-slug}.md`（SPEC artifact_actions 消費済みフラグの status 更新）

## 副作用

- ファイル作成/更新: `docs/specs/**`, `.agentdev/drafts/**`（status 更新用）。`docs/specs/README.md`, `docs/DOC-MAP.md` は SPEC 操作に付随する更新のみ許可
- git 操作: commit + push（`agentdev-conventional-commits` + `agentdev-git-worktree` 並列実行安全ステージング）
- Issue 作成: 行わない（G12、case-open 責務）
- deviation capture: spec-save 実行中に実観測した deviation を agentdev-learning-capture skill または
  agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存。
  保存先は capture-boundaries.md の Split Rule に従う。
- git 永続化: capture 成果物を spec-save 自身の既存 commit/push 処理内で永続化。
- 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節（`結果` 内）に含める。

## 現在の動作

- Step 1: 事前チェック（`draft-data` の `artifact_actions` から `artifact: spec` entry の有無を確認）。なければ no-op 完了。ドラフト不存在時はエラー中止
- Step 2: SPEC artifact_actions 読込（`artifact: spec` entry を読込）。`artifact_actions` フィールド不存在（旧形式 draft）の場合は SPEC 保存対象なしと判定し no-op 完了（後方互換）。各 action の `target`（file path または `new:{slug}`）、`operation`（公式 enum: create/update、非正規 alias: spec-create/spec-update/spec-append、REQ-008-058）、`content` を処理対象とする
- Step 3: 配置先解決（既存 SPEC パス（例: `docs/specs/foundations/patterns.md`）→ update 操作）。`target_spec: {operation, domain, slug}` 構造化 → 新規 SPEC 作成（`docs/specs/{domain}/{topic-slug}.md`）。同一 `target` の action は1つの SPEC へ集約。配置先解決の決定的処理は `agentdev-req-file-manager/scripts/` の決定的スクリプトで実行（REQ-001-029、design-principles.md 第5節「決定的処理の Script 委譲原則」）
- Step 4: SPEC 分離基準の最終確認（各 action が REQ-001-055（SPEC に置くべき内容の基準）に適合するか再確認）。安定契約例外（REQ-001-069）相当は除外し follow-up に明示
- Step 5: SPEC ファイル操作。`target_area` 見出し検索は `agentdev-spec-file-manager/scripts/` の決定的スクリプトで実行
  - create / spec-create: 新規 SPEC ファイルを frontmatter（`title`, `status: draft`, `created`, `updated`）付きで作成し、action の `content` をセクションとして記載
  - update / spec-update: `target_area` 指定時は対象セクションを `content` で置換、未指定時は該当セクションへ `content` を追記。frontmatter `updated` を更新。`status` は変更しない。詳細は「target_area ベースのセクション置換ロジック」セクション参照
  - spec-append: 既存 SPEC ファイルへ `target_area`（anchor）と `placement` に基づき `content` を新規セクションとして追加。frontmatter `updated` を更新。`status` は変更しない。詳細は「spec-append 操作時のセクション追加ロジック」セクション参照
  - 各 action の `target_area`（指定時）に応じた適切なセクション見出しを用いる
- Step 6: インデックス整合（新規 SPEC 作成時は `docs/specs/README.md`（SPEC 一覧）に追加）。既存 SPEC 追記時は README 更新不要。エントリ存在確認は決定的スクリプトで実行
- Step 7: DOC-MAP 影響確認（SPEC 操作が `docs/DOC-MAP.md` に影響するか確認し、影響がある場合は更新（`agentdev-doc-map`））
- Step 8: ドラフト status 更新（`draft-data` に SPEC 消費済みフラグを付与）。commit/push より前に更新し commit 対象に含める
- Step 9: 変更範囲検証（許可パス照合は `agentdev-req-file-manager/scripts/` の決定的スクリプトで実行。`git diff --name-only` で `docs/specs/**` と `.agentdev/drafts/**` 以外の変更を検出したらエラー報告、指示待ち（自動破棄しない））
- Step 10: コミット、プッシュ（`agentdev-conventional-commits` + `agentdev-git-worktree` 並列実行安全ステージング）
- Step 11: 完了報告（保存した SPEC 一覧（新規/追記別）、スキップ有無、follow-up（安定契約例外で除外した候補））

## 配置一貫性検証

spec-save は SPEC ファイル保存に先立ち、対象 SPEC の主論理区分・正規所有対象と保存内容の整合を「配置一貫性検証」として検証する（REQ-001-034、REQ-001）。配置一貫性検証は確定済み分類・所有情報と保存先の整合確認であり、「内容品質の再査読」ではない（REQ-001-030 との整合）。内容品質は引き続き req-define QG-1 の責務である。

### 検証項目

| 検証項目 | 内容 | 不一致検出時 |
|---|---|---|
| 論理区分整合 | 変更の論理区分（artifact_action が示す SPEC 論理区分）と対象 SPEC の主論理区分が整合する | 保存を停止し、分類または追記先の再判定へ戻す |
| 所有対象整合 | 変更の所有対象（artifact_action が示す正規所有対象）と対象 SPEC の正規所有対象が整合する | 同上 |
| 別所有SPEC 不存在 | 同一関心の別の正規所有 SPEC が存在しない（REQ-003-038 違反でない） | 同上 |
| 横断SPEC 不当配置 不存在 | command 固有仕様を不当に横断 SPEC へ配置していない | 同上 |
| パラメータ不当混入 不存在 | パラメータ変更を不当に挙動説明またはカタログへ混入させていない（v2:REQ-0155-009 準拠） | 同上 |
| accepted 間分界矛盾 不存在 | accepted SPEC 間で責任分界が矛盾しない | 同上 |

不一致を検出した場合、保存せず、分類または追記先の再判定へ戻す。

### 強制ゲート（保存拒否）の有効化条件

強制ゲート（保存拒否条件: 重複所有、配置不一致）は SPEC 宣言形式（主論理区分、正規所有対象）の定義完了後に有効化する（REQ-001-035）。宣言形式の定義は `../foundations/document-model.md`「SPEC 宣言形式」を正規所有者とし、`../responsibilities/artifact-contracts.md`「分類根拠伝播契約」の伝播フィールド名（`spec_logical_division`、`canonical_owner`）と一致させる。

### 宣言付与フロー（CREATE/UPDATE）

spec-save は req-define が `artifact_actions` の SPEC action へ出力した `spec_logical_division` と `canonical_owner` を読み取り、CREATE/UPDATE 各操作で SPEC frontmatter または冒頭宣言節（`../foundations/document-model.md`「SPEC 宣言形式」が定義する形式）へ宣言を付与する。CREATE と UPDATE で宣言付与要件を一本化する。

- **CREATE**: 新規 SPEC の frontmatter または冒頭宣言節へ `spec_logical_division` と `canonical_owner` を宣言として書き込む。spec-save が対象 SPEC を宣言なしで完了することを禁止する
- **UPDATE**: 変更対象 SPEC が frontmatter または冒頭宣言節で当該宣言を未宣言の場合、かつ req-define から渡された分類値が `unknown` 以外に確定している場合に、宣言を補完する。分類値が `unknown` または欠落の場合は警告して処理を継続する（宣言欠落だけを理由に保存拒否しない、ADR-003 soft-contract）
- **既存 SPEC の一括更新**: 行わない。未変更 SPEC へ遡及的に宣言を付与しない（REQ-001-035 段階適用）。宣言率指標（`../quality/spec-health-metrics.md`「測定対象と計測方法」参照）が段階的な宣言率向上を追跡する

宣言形式の正規所有者は `../foundations/document-model.md`「SPEC 宣言形式」、伝播フィールドの schema の正規所有者は `../responsibilities/artifact-contracts.md`「分類根拠伝播契約」である。本節は宣言付与の実行ステップを定義する。

### 段階適用

宣言未完了の既存 SPEC は警告モードで経過観察する（後方互換期間）。段階適用は次の5ステップとする:

| ステップ | 内容 |
|---|---|
| (a) 宣言形式定義 | SPEC frontmatter または冒頭宣言節で主論理区分・正規所有対象の宣言形式を定義する（完了: `../foundations/document-model.md`「SPEC 宣言形式」） |
| (b) 警告モード棚卸し | 既存 SPEC を警告モードで棚卸し、宣言形式の適用状況を把握する |
| (c) 重複解消 | 同一関心キーに対する複数正規所有宣言を解消する |
| (d) 新規/変更 SPEC 強制 | 新規作成、または変更がある SPEC に対して配置一貫性検証を強制する |
| (e) 全件強制 | 全 SPEC に対して配置一貫性検証を強制する |

bootstrap 問題（宣言前に強制すると既存 SPEC 処理不能）を避けるため、強制は段階的に有効化する。各ステップの移行条件、タイミングは別途 inspect/backlog 経由で判断する。

### 検証と内容品質の責務分離

配置一貫性検証は配置先の整合確認であり、内容品質の再査読ではない。内容品質は req-define QG-1 の責務（REQ-001-030）。spec-save が配置一貫性検証で不一致を検出した場合、保存を停止するが、内容品質の再評価は実施しない。

## target_area ベースのセクション置換ロジック

`operation: update` / `operation: spec-update` において action の `target_area` が指定された場合、spec-save は対象 SPEC ファイル内で `target_area` に一致する見出し行を検索し、セクション置換を行う（REQ-001-027、REQ-008-058）。

SPEC operation の公式 enum は `create` / `update` であり、`spec-append` は既存 SPEC ファイルへ新規セクションを追加する alias として `update` へ映射される（REQ-008-058）。`spec-append` の配置契約は後段「spec-append 操作時のセクション追加ロジック」に定める。

### マッチング規則

- 対象 SPEC ファイル内の見出し行を走査し、`target_area` に一致する見出し行を検索する
- **入力正規化**: `target_area` に Markdown 見出しプレフィックス（`##`、`###` 等）が含まれる場合、比較前にプレフィックスを除去して見出しテキスト部分へ正規化する。`## セクション名` と `セクション名` のいずれの形式でも同じ結果となる
- **見出し行全体完全一致**: 正規化後の見出しテキストが見出し行全体と完全一致する場合のみマッチとする。前方一致、後方一致、部分一致は受け付けない（例: 正規入力 `### IR-044` は見出し行 `### IR-044 - 題` とはマッチしない）。この規則は `search-target-area.ts` が正規契約に従うことを要求する
- 当該見出し行から次の同レベル（または上位レベル）見出し行の直前までを「セクション」として特定する
  - 例: `### X` で検索した場合、次の `###` または `##` または `#` 見出しの直前までを範囲とする
- 特定したセクションを action の `content` で置換する

### 複数マッチ時の挙動

`target_area` に一致する見出しが複数存在する場合、最初のマッチを採用し warn を出力する。

### 未検出時の挙動

`target_area` に一致する見出しが存在しない場合、当該 action をスキップし、follow-up として「target_area 未検出、operation を spec-create へ切り替えを推奨」を報告する（全体中止しない）。

### 後方互換（target_area 未指定）

`target_area` が未指定の draft（旧形式）、または `operation` が create/spec-create の場合は従来の「追記」動作を維持する（REQ-001-028）。
`target_area` が指定された場合のみ「置換」動作を適用し、既存 draft の破壊を防ぐ。

## spec-append 操作時のセクション追加ロジック

`operation: spec-append` は既存 SPEC ファイルへ新規セクションを追加する操作であり、公式 enum の `update` へ alias として映射される（REQ-008-058）。`target_area`（anchor）と `placement` を用いて追加位置を明示する。

### 入力契約

| field | 必須性 | 形式 |
|---|---|---|
| `target_area` | 必須 | anchor 見出し行（Markdown 見出し行形式。例: `### IR-044`） |
| `placement` | 任意（省略時 `tail`） | `tail` / `after_anchor` / `before_anchor` のいずれか |
| `content` | 必須 | 追加する新規セクション本文（見出し行を含む） |

### placement 別挙動

| placement | 追加位置 |
|---|---|
| `tail`（既定） | anchor セクションの末尾（次の同レベルまたは上位レベル見出し行の直前） |
| `after_anchor` | anchor 見出し行の直後（anchor セクション本文の先頭） |
| `before_anchor` | anchor 見出し行の直前 |

`tail` は anchor セクション全体の末尾へ新規セクションを追加する。`after_anchor` は anchor セクション本文の先頭へ挿入する。`before_anchor` は anchor セクションの前に新規セクションを挿入する。

### anchor マッチング規則

- 「target_area ベースのセクション置換ロジック」の「マッチング規則」と同一の規則を適用する（入力正規化、見出し行全体完全一致）
- anchor 見出し行が複数存在する場合、最初のマッチを採用し warn を出力する

### anchor 未検出時の挙動

anchor 見出し行が存在しない場合、当該 action をスキップし、follow-up として「anchor 未検出、operation を spec-create へ切り替えを推奨」を報告する（全体中止しない）。

### 同名見出し時の挙動

`content` の見出し行と同名の見出しが既存 SPEC ファイルに存在する場合、spec-save は warn を出力し、追加処理は継続する（重複防止のための事前拒否は行わない）。重複見出しの整理は別工程（inspect-docs 等）で扱う。

### 合格基準

- anchor が特定でき、`placement` に従った位置へ `content` が挿入されていること
- 挿入結果の SPEC ファイルが Markdown 構造として破損しないこと（見出し階層の不整合がないこと）
- frontmatter `updated` が更新されていること
- `status` は変更しないこと（G06）

### 後方互換（create / spec-create / update / spec-update）

`spec-append` は新規 alias であり、既存の `create` / `spec-create` / `update` / `spec-update` 動作は従来通り維持する。`spec-append` が指定された場合のみ本節のロジックを適用する。

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（artifact_actions 工程分岐、DOC-MAP 影響規則）
- [quality-gates.md](../quality/quality-gates.md)（SPEC lifecycle 連携（QG-4 で accepted 昇格））
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（SPEC body 品質検査）
- [req-health-metrics.md](../quality/req-health-metrics.md)（SPEC 分離基準との連携）
- [integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md)（IR-057 obsolete-spec-path-after-domain-split、targeted docs guard 連携）

## targeted docs guard (v2:REQ-0158-003)

SPEC保存工程では、変更されたSPECと連動する`docs/specs/README.md`、`docs/DOC-MAP.md`を`check_changed_docs.ts --workflow spec-save`で検査する。

検査は以下を含む。

- SPEC frontmatter必須項目
- status値`draft`、`accepted`、`superseded`の妥当性
- `superseded`時の`superseded_by`必須性
- `superseded_by`保持SPECの通常内容検査対象外判定
- SPEC READMEのstatus同期
- SPECドメイン分類、リンク、DOC-MAP更新要否
- command/skill/integrity SPECと対応原本・catalog・rule file・scriptの整合

strict failureが存在する場合は修正して再実行する。
## 対象外

- SPEC 対象 artifact_actions（`artifact: spec`）がない場合の SPEC ファイル作成、編集（G01、G04、no-op）
- `docs/specs/**`, `.agentdev/drafts/**`, `docs/specs/README.md`, `docs/DOC-MAP.md` 以外のファイル作成、編集（G02、G03）。REQ ファイル（`docs/requirements/**`）、ADR（`docs/adr/**`）、コマンド、スキル、テンプレート編集禁止
- SPEC 対象 artifact_actions がない場合の SPEC ファイル作成、編集（G04）
- 新規 SPEC 作成時の `status: draft` 省略（G05）
- 既存 SPEC 追記時の `status` 変更（G06、`status: accepted` 昇格は case-close Step 3 責務）
- SPEC status が `draft` の SPEC を IR-044（REQ/SPEC 境界違反検出）の対象に含めること（G07）
- REQ-001-055（SPEC 分離基準）不適合 action の保存（G08、安定契約例外 REQ-001-069 は follow-up 扱い）
- 実行時コマンドが SPEC ファイルに依存する記述（G09、REQ-001 実行時非依存維持）
- SPEC artifact_actions の分離根拠、配置先判定の再分類（G10、req-define `agentdev-req-analysis` 結果を尊重）
- SPEC status 昇格（draft → accepted）の判定（G11、case-close 責務）
- Issue 作成（G12、case-open 責務）

## 検証観点

- 品質ゲート（適用結果の整合性検証）: target_area 置換結果の整合性、SPEC status の整合性（新規作成時 `status: draft` 付与）、インデックスの整合性（`docs/specs/README.md` エントリと新規 SPEC の一致）、変更範囲の妥当性を検証。内容の品質は req-define の QG-1 の責務（REQ-001-030）
- SPEC 分離基準適合性（REQ-001-055）: 各 action の content が SPEC に置くべき内容か
- frontmatter 完全性: 新規作成時の `title`, `status: draft`, `created`, `updated`
- 配置先解決の正確性: 既存パス vs `new:{slug}` の判定、重複候補統合
- 変更範囲検証: `docs/specs/**` と `.agentdev/drafts/**` 以外の変更を含まないこと

## case-auto 並列委譲モデル（REQ-006-087〜093）

spec-save は複数 SPEC ファイルの変更案作成、検査を並列化できる（REQ-006-091）。
異なる target パスの SPEC create/update は L0（完全独立）のため並列可能（最大5件）。
同一 SPEC ファイルへの複数 action のみ順序依存のため直列サブセットとして分離。
最終的な commit/push は v2:REQ-0137 の明示パス指定で一括実行。

## See Also

- [req-define.md](req-define.md)（前段コマンド（SPEC 候補分離））
- [req-save.md](req-save.md)（前段コマンド（REQ/ADR 保存））
- [case-open.md](case-open.md)（後続コマンド（Issue 作成））
- `agentdev-doc-map` skill（DOC-MAP 影響確認）
- `agentdev-conventional-commits` skill（コミットメッセージ規約）
- `agentdev-git-worktree` skill（並列実行安全 git 操作）
- REQ-001（REQ/SPEC 責務分離の徹底と spec-save 新設）
- REQ-008（構造化 req_draft 契約）
- v2:ADR-0123（SPEC lifecycle（draft/accepted））

