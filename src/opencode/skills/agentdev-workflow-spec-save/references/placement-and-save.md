# STEP-1〜5: 事前チェック・配置先解決・SPEC ファイル操作（placement-and-save）

> 本 reference は `agentdev-workflow-spec-save` SKILL.md の STEP-1〜STEP-5 詳細である。事前チェック、SPEC artifact_actions 読込、配置先解決、SPEC 分離基準の最終確認、SPEC ファイル操作を提供する。

## 目次

- STEP-1: 事前チェック
- STEP-2: SPEC artifact_actions 読込
- STEP-3: 配置先解決
- STEP-4: SPEC 分離基準の最終確認
- STEP-5: SPEC ファイル操作

## STEP-1: 事前チェック

### Purpose

ドラフトの `artifact: spec` entry 有無を判定する（no-op 判定）。

### Input Resolution

1. SSoT 再構成: `.agentdev/drafts/req-draft-{topic-slug}.md` の `# draft-data` block
2. identifier 保持: topic-slug
3. 最小 scalar: なし
4. runtime artifact: ドラフトファイル

### Preconditions

- spec-save command が起動している

### Procedure

ドラフトの `draft-data` の `artifact_actions` から `artifact: spec` entry の有無を確認する（全 work_type 対象、`work_type` による判定は廃止）。SPEC 対象 artifact_actions がない場合は no-op で完了する。ドラフトが存在しない場合はエラーで中止する（先に `/agentdev/req-define` を実行するよう案内）。

### Result

- 処理要否判定（no-op or 継続）

### Evidence

- `artifact_actions` の entry 種別一覧

### Completion Verification

- no-op 判定時に `artifact: spec` entry が実際に0件であること

### Resume-Idempotency

- 読取のみで副作用を持たない。再実行時は同一判定になる

## STEP-2: SPEC artifact_actions 読込

### Purpose

処理対象となる SPEC action 群を読み込む。

### Input Resolution

1. SSoT 再構成: draft-data の `artifact_actions`
2. identifier 保持: なし
3. 最小 scalar: なし
4. runtime artifact: ドラフトファイル

### Preconditions

- STEP-1 で処理対象ありと判定されている

### Procedure

ドラフトの `draft-data` の `artifact_actions` から `artifact: spec` の entry を読み込む。`artifact_actions` フィールドが存在しない（旧形式 draft）場合は SPEC 保存対象なしと判定し、no-op で完了する（後方互換）。`artifact: spec` entry が空の場合も no-op で完了する。各 action の `target`（file path または `new:{slug}`）、`operation`（create/update）、`content` を処理対象とする。

### Result

- 処理対象 entry 一覧（target、operation、content）

### Evidence

- entry ごとの target と operation

### Completion Verification

- 処理対象 entry の必須項目（target、operation、content）が読み取れていること（形式不正時はエラーで中止し req-define 差し戻し推奨）

### Resume-Idempotency

- 読取のみで副作用を持たない

## STEP-3: 配置先解決

### Purpose

各 SPEC action の配置先 SPEC を解決する。

### Input Resolution

1. SSoT 再構成: `docs/specs/` 配下の既存 SPEC パス
2. identifier 保持: `target_spec: {operation, domain, slug}` 構造化指定
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-2 で処理対象 entry が確定している

### Procedure

各 SPEC action の `target`（または `target_spec: {operation, domain, slug}` 構造化）から配置先 SPEC を解決する。既存 SPEC パス（例: `docs/specs/{domain}/<existing-spec>.md`、または `target_spec: {operation: update, domain, slug}`）は当該 SPEC へ追記（`update` 操作）とする。`target_spec: {operation: create, domain, slug}` は新規 SPEC 作成（`create` 操作、ファイル名 `docs/specs/{domain}/{slug}.md`）とする。同一 `target` の action は1つの SPEC へ集約する。

**決定的処理のスクリプト呼出（REQ、AG-{NNN}）**: 配置先 SPEC が既存か新規か、`target_area` が存在するかの判定は `agentdev-spec-file-manager` SKILL.md「Scripts（決定的処理）」が規定する決定的スクリプト（`search-target-area.ts`）を bash 経由で呼び出して実行する（LLM 推論で代替しない）。CLI 形式、stdin JSON 入力、stdout schema は同 SKILL.md を参照。

### Result

- 配置先 SPEC 解決済み（既存 or 新規）、target_area 判定結果（matches）

### Evidence

- search-target-area.ts の JSON 結果（matches）

### Completion Verification

- 全 action の配置先が解決済みであること（特定不能な候補はスキップし follow-up 記録、全体中止しない）

### Resume-Idempotency

- 読取とスクリプト実行のみで副作用を持たない

## STEP-4: SPEC 分離基準の最終確認

### Purpose

各 SPEC action が SPEC に置くべき内容の基準に適合するか再確認する。

### Input Resolution

1. SSoT 再構成: SPEC 分離基準（`agentdev-req-analysis` の結果を尊重）
2. identifier 保持: なし
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-3 で配置先が解決されている

### Procedure

各 SPEC action が SPEC に置くべき内容の基準に適合するか再確認する。安定契約例外相当の内容は REQ 側に残すべきものとして除外し、完了報告の follow-up に明示する。

### Result

- 適合判定（除外候補と follow-up 一覧）

### Evidence

- 判定根拠（分離基準照合結果）

### Completion Verification

- 不適合 action が follow-up へ退避済みであること

### Resume-Idempotency

- 判定は読取であり副作用を持たない

## STEP-5: SPEC ファイル操作

### Purpose

処理対象 entry に対する SPEC create / update を実行する。

### Input Resolution

1. SSoT 再構成: 配置先 SPEC ファイル、`docs/specs/README.md`
2. identifier 保持: target、target_area
3. 最小 scalar: なし
4. runtime artifact: ドラフトの `spec_logical_division`、`canonical_owner` 宣言

### Preconditions

- STEP-4 の適合判定が完了している

### Procedure

`draft-data` の `artifact_actions`（`artifact: spec`）の全 entry を処理する:

- **create**: 新規 SPEC ファイルを frontmatter（`title`、`status: draft`、`created`、`updated`）付きで作成し、action の `content` をセクションとして記載する
- **update**: `target_area` 指定時（operation が `update`/`spec-update`）は `agentdev-spec-file-manager` のセクション置換ロジック（target-area-matching）で対象セクションを `content` で置換する。`target_area` 未指定時は既存 SPEC ファイルの該当セクションへ `content` を追記する（後方互換）。frontmatter `updated` を更新し、`status` は変更しない
- **target_area 見出し検索のスクリプト呼出（REQ、AG-{NNN}）**: `update` 操作における `target_area` 見出し検索は `search-target-area.ts` で実行する。STEP-3 の結果（`matches`）を用いてセクション範囲を特定し `content` で置換する。`matches` 空 → スキップし follow-up 記録（operation を spec-create 推奨）、複数マッチ → G09 に従い置換拒否
- **複数 SPEC action の並列化**: 異なる `target` パスの SPEC create/update は並列化可能（最大5件）。同一 SPEC ファイルへの複数 action は順序依存のため直列サブセットとして分離する。直列集約対象（index 更新、draft 更新、commit、push）は並列委譲の完了を待ってから実行する
- **SPEC 宣言付与（CREATE/UPDATE）**: req-define が各 entry へ出力した `spec_logical_division` と `canonical_owner` を読み取り、SPEC frontmatter または冒頭宣言節へ宣言として付与する。CREATE で宣言なしで完了することを禁止する。UPDATE で宣言未宣言かつ分類値が `unknown` 以外に確定の場合は宣言を補完、`unknown` または欠落の場合は警告して処理を継続する（soft-contract、宣言欠落だけで保存拒否しない）。既存 SPEC の一括更新は行わず、未変更 SPEC へ遡及的に宣言を付与しない（段階適用）

### Result

- SPEC create / update 実行済み

### Evidence

- 作成・更新ファイルパス、search-target-area.ts の JSON 結果、宣言付与結果

### Completion Verification

- 新規 SPEC に frontmatter（`title`、`status: draft`、`created`、`updated`）があること。CREATE で宣言が付与されていること。既存追記で `status` が不変であること

### Resume-Idempotency

- SPEC ファイルの存在（durable state）で再開点を判定する。保存済み action は再処理しない。partial failure 時は保存済み SPEC を残したまま未完了 action のみ再処理する

## 関連 STEP

- 前: なし（workflow 開始）
- 次: STEP-6（verification-and-persistence.md）

## 関連 Capability Skill

- `agentdev-spec-file-manager`: 配置判断、target_area マッチング規則、セクション置換ロジック、並列化詳細、SPEC ライフサイクル適用
- `agentdev-req-analysis`: SPEC 分離基準（req-define の結果を尊重）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G01（`artifact: spec` 有無での判定、`work_type` 判定廃止）
- G02/G03/G04（ファイル編集スコープ、SPEC 対象なし時の編集禁止）
- G05/G06/G07（SPEC ライフサイクル制約）
- G08/G09（SPEC 分離基準適合、実行時非依存）
