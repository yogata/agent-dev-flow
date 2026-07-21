---
description: 壁打ち成果物をREQ/ADRファイルとしてdocs/に保存し、コミット、プッシュする
agent: sisyphus
---

# 要件保存（壁打ち→docs永続化）

req-defineで生成された壁打ち成果物をREQ/ADRファイルとしてdocs/に保存し、コミット、プッシュする。
壁打ちフェーズで使用（REQ/ADR 対象 artifact_actions がある場合）。
`work_type` による消費判定は廃止し、`artifact_actions` の有無で判定する。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define で生成されたドラフト）

## 出力

- `docs/requirements/REQ-{NNNN}.md`（新規/追記/更新）
- `docs/requirements/README.md`（インデックス更新）
- `docs/README.md`（ドキュメントハブ更新）
- `docs/adr/ADR-{NNNN}.md`（ADR判断がある場合のみ）
- `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（SPLIT検出時のみ。要件の膨張、関心分離によるSPLIT候補の詳細）
- `.agentdev/intake/inbox/req-restructure/*.md`（REQ再構成候補検知時のみ）

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/req-save.yaml`）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 手順

### Step 1: 事前チェック

`draft-data` の `artifact_actions` を確認し、`artifact: req` または `artifact: adr` の entry が含まれるか判定する。
REQ/ADR 対象 artifact_actions がない場合は no-op 完了（後続の case-open へ進むよう完了報告で案内）。
`work_type` による停止は廃止する。
旧形式 draft（`artifact_actions` フィールドなし）の場合は従来どおり全 req-operation を処理する（後方互換）

### Step 2: ドラフト読込

`.agentdev/drafts/req-draft-*.md` を読み込む → 最新の1件を対象とする。
見つからない場合はエラーで中止: `壁打ちドラフトが見つかりません。
先に /agentdev/req-define を実行してください。
`

- **読込時 hash 記録**: `git rev-parse HEAD` で読込時点の commit hash を記録する

### Step 3: ドラフト検証

`draft-data` の必須フィールド（artifact_actions, operation_units, topic_slug）が存在することを確認。欠損時はエラーで中止

**Step 3-1**: 分類ゲート検査。
CREATE対象REQの要件テーブルを検査する。
詳細は `agentdev-req-file-manager` を参照。
委譲接続点: サブエージェントは反映作業候補、理由、移送先候補のみを返し、親エージェントが停止とユーザー指示待ちを判断する

**Step 3-2**: 文書分類適合確認。
REQ/ADR 保存前に対象ドキュメント種別を確認する。
詳細は `agentdev-req-file-manager` を参照。
委譲接続点: サブエージェントは分類適合の判定材料のみを返し、親エージェントが保存可否を判断する

**Step 3-3**: REQ/ADR artifact_actions 処理ゲート。ドラフトの `artifact_actions` から `artifact: req`/ `artifact: adr` の entry を処理対象とする（draft 全体の REQ/ADR artifact_actions を処理し、OU ごとに分割しない）:
- `artifact_actions` に REQ/ADR entry がない場合 → no-op 完了（Step 1 で判定済み）
- `operation_units` が存在する場合 → 処理対象 `artifact_actions` を決定する（REQ-0102-039/040/041）:
 - OU ID が指定されている場合 → 指定された OU に属する REQ/ADR 対象 `artifact_actions` だけを処理対象とする
 - OU ID 未指定時 → draft 全体の REQ/ADR 対象 `artifact_actions` を処理対象とする（OU 件数によらず、OU が複数存在することだけを理由に停止しない）
- `artifact_actions` フィールドがない（旧形式 draft）の場合 → 従来どおり全 req-operation を処理する（後方互換）
- **SPEC artifact_actions の取扱い**: `artifact: spec` の entry は spec-save コマンドの対象であり、req-save は処理しない（スキップする）

### Step 4: REQ ファイル操作

`agentdev-req-file-manager` の判定ロジックと採番ルールに従って実行。
Step 3-3 で処理対象とした `artifact_actions`（`artifact: req`/ `artifact: adr`）の全 entry を処理する（draft 全体の REQ/ADR artifact_actions を処理し、OU ごとの消費は行わない）。
`artifact_actions` フィールドがない場合は従来どおり全 req-operation を処理する。
詳細は `agentdev-req-file-manager` を参照。
委譲接続点: サブエージェントはCREATE/APPEND/UPDATE候補、SPLIT候補、REQ再構成候補を返し、親エージェントがファイル保存を行う

**決定的処理のスクリプト呼出（REQ、AG-002、design-principles.md 第5節）**: 本 Step の決定的処理（REQ番号採番、要件行ID採番、frontmatter id↔ファイル名整合性確認）は `agentdev-req-file-manager/scripts/` の決定的スクリプトを bash 経由で呼び出して実行する（SKILL.md「Scripts（決定的処理）」セクション参照）。LLM 推論で代替しない:

```bash
# REQ番号採番（CREATE 時、max+1、欠番埋め禁止）
bun .opencode/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts docs/requirements
# → stdout: { ok: true, allocated: "REQ-NNNN", max: N }

# 要件行ID採番（APPEND 時、REQ-NNNN-MMM 形式、max+1）
bun .opencode/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts docs/requirements/REQ-{NNNN}.md
# → stdout: { ok: true, allocated: "REQ-NNNN-MMM", req: N, max: M }

# frontmatter id ↔ ファイル名整合性確認（保存前後の検証）
bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-frontmatter-consistency.ts docs/requirements req
# → stdout: { ok: boolean, errors: string[], warnings: string[] }
```

**Step 4-0**: QG-1（適用結果の整合性検証、REQ/082、AG-003）。
REQ/ADR ファイル保存前に、`agentdev-quality-gates` の QG-1（Definition Integrity Gate）を「適用結果の整合性検証」として実行する。
検証項目: 採番結果の整合性（`new:{slug}` → 確定番号の置換漏れなし）、マージ結果の整合性（要件テーブル構造、番号重複なし）、インデックスの整合性（README/DOC-MAP/mapping-table エントリと採番結果の一致）、変更範囲の妥当性（Step 9 で検証）。
各検証は決定的スクリプトの JSON 結果で機械的に確認する。
判定基準、検査観点は同スキルの `.opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md` を参照。
fail 時は保存を停止し req-define へ差し戻しを推奨。
**REQ**: req-save の QG-1 は内容の品質（検証可能性、REQ/SPEC 分類適合性等）を再検証せず、内容の品質は req-define の QG-1 の責務とする

**Step 4-1**: 語彙、責務、runtime境界矛盾の防止。
Step 4 の保存完了後、既知の矛盾を検出可能な範囲で防止する。
詳細は `agentdev-req-file-manager` を参照。
委譲接続点: サブエージェントは検査結果と根拠のみを返し、親エージェントがfollow-up扱いを判断する

**Step 4-2**: Catalog entry 確認（APPEND 時）。
Step 4 で への APPEND 操作を実行した場合、追加した要件行に関連する integrity-rule-catalog SPEC（extension 経由）の catalog entry 有無を確認する。
catalog entry が未記載の場合、ユーザーに追記を促す。
req-save 自身は `docs/specs/` 配下を直接編集しない（G02 制約）

**Step 4-3**: 複数 REQ/ADR ファイルの3フェーズ分離（REQ/093）。複数 REQ/ADR ファイルを保存する場合、並列委譲可能な作成フェーズと直列集約フェーズを分離する（詳細は後述「case-auto 並列委譲モデル」セクション参照）

### Step 5: インデックス、ハブ更新

詳細は `agentdev-req-file-manager` を参照。委譲接続点: 親エージェントのみが `docs/` ファイルを更新する

**エントリ存在確認のスクリプト呼出（REQ、AG-002）**: README/DOC-MAP/mapping-table へのエントリ追加後に、当該エントリが正しく登録されたかを決定的スクリプトで検証する:

```bash
# REQ エントリが README/DOC-MAP/mapping-table に存在するか確認
bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-entry-existence.ts REQ-NNNN \
  docs/requirements/README.md docs/DOC-MAP.md docs/requirements/<mapping-table>.md
# → stdout: { ok: boolean, errors: string[], warnings: string[], found: string[] }

# stdin JSON 入力（複数 ID 一括確認）も可能
echo '{"id":"REQ-NNNN","files":["docs/requirements/README.md"]}' | \
  bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-entry-existence.ts
```

### Step 6: ADR ファイル作成

`artifact_actions` に `artifact: adr` の entry が含まれる場合のみ → `agentdev-adr-file-manager` に従って ADR ファイルを作成。作成後、`docs/README.md` にADRセクションが存在しない場合は追加し、ADRエントリを記載

### Step 7: docs 変更整合性検証

REQ番号の連続性確認、frontmatter の `id` とファイル名の一致を確認

**決定的処理のスクリプト呼出（REQ、AG-002）**: frontmatter id ↔ ファイル名整合性確認は決定的スクリプトで実行する:

```bash
# REQ ファイル群の frontmatter id ↔ ファイル名整合性確認
bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-frontmatter-consistency.ts docs/requirements req
# → stdout: { ok: boolean, errors: string[], warnings: string[] }

# ADR ファイル群の整合性確認（ADR 保存時）
bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-frontmatter-consistency.ts docs/adr adr
```

### Step 8: DOC-MAP 影響確認

REQ/ADR/SPEC操作が `docs/DOC-MAP.md` に影響するか確認する。
影響がある場合は DOC-MAP を更新する。
影響がない場合は「DOC-MAP更新なし」とする。
DOC-MAP更新は探索経路の更新であり、要件、判断、仕様の更新ではない。
影響確認ルールの詳細は `agentdev-doc-map` スキルを参照

**targeted docs guard（REQ）**: 変更された REQ ファイルと連動ファイル（`docs/requirements/README.md`、`docs/DOC-MAP.md`、`docs/README.md`、`AGENTS.md`）に対し targeted docs guard を実行する。実行コマンド:

```bash
bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts \
  --workflow req-save --files <changed REQ files> --json
```

JSON 出力の `failures` に strict severity が含まれる場合は保存工程を継続せず、対象ファイルを修正して再実行する。`doc_map_update_required` が true の場合は Step 8 の更新要否判定に反映する。`full_docs_check_recommended` が true の場合は `/repo/docs-check` の実行をユーザーに提案する。

**extension 更新要否の確認（REQ）**: REQ/ADR の追加、移動、削除が `.agentdev/extensions/**` に影響するか確認する。該当 REQ/ADR を context に列挙している command または skill extension がある場合、それらの paths も更新対象となる。extension 更新が必要な場合はユーザーに指示を仰ぐ（req-save 自身は extension を直接編集しない）。

**エントリ存在確認のスクリプト呼出（REQ、AG-002）**: DOC-MAP 更新の有無にかかわらず、REQ/ADR エントリが DOC-MAP に存在するかを決定的スクリプトで確認する:

```bash
bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-entry-existence.ts REQ-NNNN docs/DOC-MAP.md
# → stdout: { ok: boolean, errors: string[], warnings: string[], found: string[] }
```

### Step 9: 変更範囲検証

**決定的処理のスクリプト呼出（REQ、AG-002）**: `git diff --name-only` で変更ファイル一覧を取得し、許可パスリスト（G02）との照合を決定的スクリプトで実行する。許可範囲外の変更を検出したらエラー内容をユーザーに報告して指示を待つ（変更の自動破棄は行わない）:

```bash
# git diff --name-only をファイルに出力し、許可パスリストと照合
git diff --name-only > /tmp/changed-paths.txt
cat > /tmp/allowed-paths.txt <<EOF
docs/requirements/**
docs/adr/**
docs/README.md
.agentdev/drafts/**
EOF
bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-change-impact.ts \
  /tmp/changed-paths.txt /tmp/allowed-paths.txt
# → stdout: { ok: boolean, errors: string[], warnings: string[], violations: string[] }

# stdin JSON 入力も可能
echo '{"changed":["docs/requirements/REQ-0102.md"],"allowed":["docs/requirements/**"]}' | \
  bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-change-impact.ts
```

`violations` が空でない場合は G02 違反としてユーザーに報告し、指示を待つ

**Step 9-1**: リモート同期と hash 検証。
詳細は `agentdev-req-file-manager` を参照。
委譲接続点: 親エージェントのみが git 操作と読込やり直し判断を行う

**Step 9-2**: RU パス保存禁止。
詳細は `agentdev-req-file-manager` を参照。
委譲接続点: サブエージェントはRU由来情報の有無だけを返し、親エージェントがdocs本文から除外する

### Step 10: ドラフト status 更新

ドラフトの `draft-data` の `status`（frontmatter）を `saved` に更新する。
commit/push より前に更新し、status変更をcommitに含めることで永続化を保証する。
push後のstatus更新は永続化されないため不可

### Step 11: コミット、プッシュ

`agentdev-conventional-commits` に従ってコミットメッセージを生成し、mainブランチに push。
Step 10 で更新したドラフトファイルのstatus変更をcommit対象に含めること。
並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、`git add <path>` で明示パスステージし、`git commit -- <paths>`（--only pathspec 形式）でコミットする。
スイープ操作（`git add -A`/ `git add .` 等）は禁止し、共有 index の他セッション変更を排出しないこと

**Step 11-1**: REQ/ADR artifact_actions 処理結果の保存（ドラフトに複数の `artifact_actions` entry が含まれる場合、以下を保存する）:
- (a) 保存したREQドキュメントのリスト（REQ番号を含む）
- (b) 各 artifact_action から保存したREQドキュメントへのマッピング
- (c) ソースRUからREQ操作へのマッピング
- (d) case-openで消費可能な形式での保存結果

**OU 結果の書き戻し**: ドラフトに `operation_units` セクションがある場合、各 OU の `result` に保存結果を書き戻す。書き戻し内容: (a) 保存したREQドキュメント一覧 (b) OU 操作と保存先REQ doc の対応 (c) source RUとOU操作の対応 (d) case-open が入力として扱える保存結果

**Step 11-2**: Issue作成の責任分離。
req-saveはREQドキュメントの保存中にIssueを作成しない。
Issue作成はcase-openの責任範囲とする

### Step 12: 完了報告

完了報告templateに従って出力。実行結果に応じた種別を選択:
- SPLIT検出 → .opencode/commands/agentdev/templates/req-save/split-detected.md（{docmap_status}変数あり）
- DOC-MAP更新あり（SPLITなし）→ .opencode/commands/agentdev/templates/req-save/docmap-updated.md
- DOC-MAP確認、更新不要（SPLITなし）→ .opencode/commands/agentdev/templates/req-save/docmap-not-needed.md
- Epic規模 → .opencode/commands/agentdev/templates/req-save/epic.md
- 上記以外 → .opencode/commands/agentdev/templates/req-save/standard.md

## case-auto 並列委譲モデル（REQ/093）

req-save は複数 REQ/ADR ファイルの変更案作成、検査を並列化できる（REQ）。3 フェーズ分離で実現する:

| フェーズ | 操作 | 該当 Step | 実行方法 |
|---|---|---|---|
| 1. 採番バッチ | 最大番号+N を一括確保（G05 一意性維持） | Step 4（`agentdev-req-file-manager` 採番ルール） | 直列 |
| 2. ファイル作成 | 各 REQ/ADR ファイル作成、変更（独立パス） | Step 4（CREATE/APPEND/UPDATE） | 並列（最大5件） |
| 3. インデックス更新 | README.md への順序挿入、draft status 更新、commit/push | Step 5 / Step 10 / Step 11 | 直列 |

- G07（commit 前 status 更新）は フェーズ3 で維持する
- 直列集約対象（採番、index 更新、draft 更新、commit、push）は並列委譲の完了を待ってから実行する（REQ）

## 廃止時の下流横断クリーンアップ（追加候補）

本セクションは REQ/ADR 廃止確定時に、下流（配布 Command/Skill 群、Guide 群、SPEC 群）へ残る旧 ID 参照の横断クリーンアップを実行するステップの**追加候補**を記録する。既存の req-save 手順（Step 1〜12）に代わるものではなく、既存フローを破壊しない追加ステップである。本候補は REQ-0124-024（廃止 REQ/SPEC 由来記述残置検出カテゴリ）および integrity-rule-catalog.md の新規 IR 候補（retired-reference-residual）と整合する。本候補の実行可否、タイミングは別途 SPEC 確定を待って確定する。

### 対象トリガ

- REQ/ADR の廃止確定時（要件行削除、REQ ファイル全体の物理削除、ADR ステータスの Superseded/Deprecated 変更）
- 廃止 ID に由来する下流参照の有無確認が前提

### クリーンアップ手順（候補）

1. **廃止 ID リスト作成**: 当該 req-save 操作で廃止確定した REQ/ADR ID（例: REQ-NNNN、ADR-NNNN）のリストを作成する
2. **下流参照検索**: 廃止 ID をソースに配布 Command/Skill 群、Guide 群、SPEC 群を横断検索する。活性 REQ/SPEC への言及は対象外とする（REQ-0124-024 準拠）
3. **参照更新候補の分類**:
   - supersede 元への妥当な文脈参照 → finding 扱い（人間確認）。自動更新しない
   - 廃止 ID のまま残置 → 当該ドキュメントの後継 ID へ更新、または文脈次第で削除
4. **更新適用範囲**: req-save の G02（`docs/requirements/**`、`docs/adr/**`、`docs/README.md`、`.agentdev/drafts/**`）範囲外のため、本ステップでは候補の提示に留め、更新適用は後続の別工程（case-update、inspect-promote 経由の intake、または手動修正）で実施する
5. **Findings 記録**: 抽出した参照更新候補を完了報告の follow-up に記録し、intake/inspect 経由で処理可能な状態で残す

### 既存フローとの関係

本ステップは既存の req-save 手順（Step 1〜12）に代わるものではなく、廃止操作時に追加で実行される候補ステップである。本ステップの実行有無、実行タイミングは今後の SPEC 確定（REQ-0124/REQ-0125 関連）を待って確定する。現時点では本候補の記録のみを行い、自動実行は行わない。既存の G02（ファイル操作制約）、G12（Capture 非関与制約）に違反しない範囲で運用される。

## ガードレール

### フェーズ制約
- G01: REQ/ADR 対象 artifact_actions（`artifact: req`/ `artifact: adr`）がない場合は no-op 完了。`work_type` による停止は廃止

### ファイル操作制約
- G02: ファイル編集スコープ: 以下のパスのみ作成、編集、削除を許可: `docs/requirements/**`（REQファイル）、`docs/adr/**`（ADR）、`docs/README.md`（ドキュメントハブ）、`.agentdev/drafts/**`（ドラフトstatus更新用）
- G03: 上記以外のファイル作成、編集は禁止

### 品質ゲート
- G04: ドラフトファイルが存在しない場合は実行不可（エラーで中止）
- G05: REQ番号は連番、一意であること（空き番号の再利用禁止）→ `agentdev-req-file-manager` に従う
- G06: 要件doc構造は `doc_requirement.md` テンプレートに厳密に従うこと。【必須】セクションの欠落は禁止
- G07: ドラフトのstatus更新（`saved`）は commit/push より前に実行し、commit対象に含めること。push後のstatus更新は永続化されないため禁止
- G08: Step 9-1 の `git pull --ff-only` 後、読込時 hash と pull 後 hash の一致検証を必須とすること。一致しない場合は評価、承認をやり直すこと

### ADR妥当性再検証ゲート

ADR保存の直前に、以下の妥当性を再検証すること:
- ADRが技術判断（アーキテクチャ上の決定）を含むか確認
- REQ/SPEC相当の内容のみの場合、保存を停止し理由を報告
- adr-guidelinesの判定結果を前提として検証する
- ADR ファイル保存時に `agentdev-adr-file-manager` の採番ルール（max+1, 欠番埋め禁止）で確定した番号を振ること
- draft 内の全 ADR 参照（`new:{topic-slug}` 形式）を当該確定番号で置換すること
- 採番は `docs/adr/` 配下の既存 ADR ファイルの最大番号 + 1 とし、欠番があっても埋めないこと

### 委譲、参照制約
- G09: 工程分岐は `work_type` 固定分岐ではなく `artifact_actions` の有無で判定する。判定基準の詳細は `agentdev-workflow-lifecycle` を参照

### 出力制約
- G10: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

### Capture 非関与制約
- G12: req-save の capture 責務は原則非関与。intake/ learning capture を行わない。例外: REQ 再構成 intake（`.agentdev/intake/inbox/req-restructure/**`）のみ生成可能。capture 境界の詳細は `agentdev-workflow-orchestration/references/capture-boundaries.md` を参照

### Issue作成制約
- G11: req-saveはIssueを作成してはならない。Issue作成はcase-openの責任範囲である
