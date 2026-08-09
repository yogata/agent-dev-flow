---
description: 壁打ち成果物をREQ/Decisionファイルとしてdocs/に保存し、コミット、プッシュする
---

# 要件保存（壁打ち→docs永続化）

req-defineで生成された壁打ち成果物をREQ/Decisionファイルとしてdocs/に保存し、コミット、プッシュする。
壁打ちフェーズで使用（REQ/Decision 対象 artifact_actions がある場合）。
`work_type` による消費判定は廃止し、`artifact_actions` の有無で判定する。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define で生成されたドラフト）

## 出力

- `docs/requirements/REQ-{NNNN}.md`（新規/追記/更新）
- `docs/requirements/README.md`（インデックス更新）
- `docs/README.md`（ドキュメントハブ更新）
- `docs/decisions/DEC-NNN.md`（Decision判断がある場合のみ）
- `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（SPLIT検出時のみ。要件の膨張、関心分離によるSPLIT候補の詳細）
- `.agentdev/intake/inbox/req-restructure/*.md`（REQ再構成候補検知時のみ）

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/req-save.yaml`）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 手順

### Step 1: 事前チェック

`draft-data` の `artifact_actions` を確認し、`artifact: req` または `artifact: decision` の entry が含まれるか判定する。
REQ/Decision 対象 artifact_actions がない場合は no-op 完了（後続の case-open へ進むよう完了報告で案内）。
`work_type` による停止は廃止する。
旧形式 draft（`artifact_actions` フィールドなし）の場合は従来どおり全 req-operation を処理する（後方互換）

### Step 2: ドラフト読込

`.agentdev/drafts/req-draft-*.md` を読み込む → 最新の1件を対象とする。見つからない場合はエラーで中止（先に `/agentdev/req-define` を実行してください）。**読込時 hash 記録**: `git rev-parse HEAD` で読込時点の commit hash を記録する

### Step 3: ドラフト検証

`draft-data` の必須フィールド（artifact_actions, operation_units, topic_slug）が存在することを確認。欠損時はエラーで中止

**Step 3-1**: 分類ゲート検査（CREATE対象REQの要件テーブル検査）、**Step 3-2**: 文書分類適合確認（REQ/Decision 保存前のドキュメント種別確認）。詳細、委譲接続点は `agentdev-req-file-manager` を参照

**Step 3-3**: REQ/Decision artifact_actions 処理ゲート。ドラフトの `artifact_actions` から `artifact: req`/ `artifact: decision` の entry を処理対象とする（draft 全体を処理し、OU ごとに分割しない）。`artifact_actions` に REQ/Decision entry がない場合 → no-op 完了。`operation_units` 存在時は OU ID 指定があれば当該 OU 配下のみ、未指定時は draft 全体を処理対象。`artifact_actions` フィールドがない（旧形式 draft）の場合は従来どおり全 req-operation を処理（後方互換）。`artifact: spec` の entry は spec-save コマンドの対象であり処理しない

### Step 4: REQ ファイル操作

`agentdev-req-file-manager` の判定ロジックと採番ルールに従って実行。Step 3-3 で処理対象とした `artifact_actions`（`artifact: req`/`artifact: decision`）の全 entry を処理する（draft 全体を処理し、OU ごとの消費は行わない）。`artifact_actions` フィールドがない場合は従来どおり全 req-operation を処理する（後方互換）。委譲接続点: サブエージェントはCREATE/APPEND/UPDATE候補、SPLIT候補、REQ再構成候補を返し、親エージェントがファイル保存を行う。詳細は `agentdev-req-file-manager` を参照

**決定的処理のスクリプト呼出（REQ、AG-002）**: REQ番号採番、要件行ID採番、frontmatter id↔ファイル名整合性確認は `agentdev-artifact-validation` の公開検証契約（RU-20260722-01 合意）および `agentdev-req-file-manager` SKILL.md「Scripts（決定的処理）」で規定する決定的スクリプトを bash 経由で呼び出して実行する。LLM 推論で代替しない。具体的な CLI 形式、stdin JSON 入力、stdout schema は同 SKILL.md を参照

**Step 4-0**: QG-1（適用結果の整合性検証、REQ/082、AG-003）。REQ/Decision ファイル保存前に `agentdev-quality-gates` の QG-1 を「適用結果の整合性検証」として実行。採番結果、マージ結果、インデックス、変更範囲の妥当性を決定的スクリプトの JSON 結果で機械的に確認。fail 時は保存を停止し req-define へ差し戻し。**REQ**: req-save の QG-1 は内容の品質を再検証せず、それは req-define の QG-1 の責務。**Step 4-1**: 語彙、責務、runtime境界矛盾の防止（Step 4 完了後に既知の矛盾を検出可能な範囲で防止）。**Step 4-2**: Catalog entry 確認（APPEND 時。関連 integrity-rule-catalog SPEC（extension 経由）の catalog entry 有無を確認、未記載時はユーザーへ追記を促す、`docs/specs/` 配下は直接編集しない G02）。**Step 4-3**: 複数 REQ/Decision ファイルの3フェーズ分離（REQ/093、後述「case-auto 並列委譲モデル」参照）。Step 4-1/4-2 の詳細は `agentdev-req-file-manager` を参照

### Step 5: インデックス、ハブ更新

詳細は `agentdev-req-file-manager` を参照。委譲接続点: 親エージェントのみが `docs/` ファイルを更新する

**エントリ存在確認のスクリプト呼出（REQ、AG-002、AG-019）**: README へのエントリ追加後に `agentdev-artifact-validation` の公開検証契約（RU-20260722-01 合意、`check-entry-existence`）で登録を検証する。具体的な CLI 形式、stdin JSON 入力、stdout schema は同 SKILL.md を参照

### Step 6: Decision ファイル作成

`artifact_actions` に `artifact: decision` の entry が含まれる場合のみ → `agentdev-decision-file-manager` に従って Decision ファイルを作成。作成後、`docs/README.md` にDecisionセクションが存在しない場合は追加し、Decisionエントリを記載

### Step 7: docs 変更整合性検証

REQ番号の連続性確認、frontmatter の `id` とファイル名の一致を確認。frontmatter id ↔ ファイル名整合性確認は `agentdev-artifact-validation` の公開検証契約で決定的スクリプトを実行（REQ/Decision 保存時）。CLI 形式は同 SKILL.md を参照

### Step 8: README 索引影響確認

REQ/Decision/SPEC操作が `docs/README.md`、各 README（`docs/requirements/README.md`、`docs/decisions/README.md`、`docs/specs/README.md`）の索引に影響するか確認。影響がある場合は更新、ない場合は「README 索引更新なし」。README 索引更新は導線の更新であり、要件、判断、仕様の更新ではない。

**targeted docs guard（REQ）**: 変更 REQ ファイルと連動ファイル（`docs/requirements/README.md`、`docs/README.md`、`AGENTS.md`）に対し `check_changed_docs.ts --workflow req-save --files <changed REQ files> --json` を実行。`failures` に strict severity を含む場合は修正して再実行。`full_docs_check_recommended` true 時は `/repo/docs-check` をユーザーに提案

**extension 更新要否（REQ）**: REQ/Decision 追加/移動/削除が `.agentdev/extensions/**` へ影響するか確認。該当 REQ/Decision を context に列挙している extension がある場合、paths も更新対象。必要時はユーザーへ指示を仰ぐ（直接編集しない）

**エントリ存在確認（REQ、AG-019）**: `agentdev-artifact-validation` の公開検証契約（`check-entry-existence`）で REQ/Decision エントリの README 索引への存在を確認する

### Step 9: 変更範囲検証

**決定的処理のスクリプト呼出（REQ、AG-019）**: `git diff --name-only` で変更ファイル一覧を取得し、許可パスリスト（G02）との照合を `agentdev-artifact-validation` の公開検証契約（`check-change-impact`、RU-20260722-01 合意）で実行。許可範囲外の変更を検出したらエラー内容をユーザーに報告して指示を待つ（自動破棄しない）。`violations` が空でない場合は G02 違反として報告し指示を待つ

**Step 9-1**: リモート同期と hash 検証。**Step 9-2**: RU パス保存禁止。詳細、委譲接続点は `agentdev-req-file-manager` を参照

### Step 10: ドラフト status 更新

ドラフト `draft-data` の `status`（frontmatter）を `saved` に更新。commit/push より前に更新し commit 対象に含める（push 後の status 更新は永続化されないため禁止）

### Step 11: コミット、プッシュ

`agentdev-conventional-commits` に従ってコミットメッセージを生成し、main ブランチに push。Step 10 の status 変更を commit 対象に含める。並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、`git add <path>` で明示パスステージし、`git commit -- <paths>`（--only pathspec 形式）でコミットする。スイープ操作（`git add -A`/ `git add .` 等）は禁止

**Step 11-1**: REQ/Decision artifact_actions 処理結果の保存（ドラフトに複数 entry がある場合）。保存する内容: (a) 保存したREQドキュメントのリスト（REQ番号含む）(b) 各 artifact_action から保存したREQドキュメントへのマッピング (c) ソースRUからREQ操作へのマッピング (d) case-open で消費可能な形式での保存結果

**OU 結果の書き戻し**: ドラフトに `operation_units` セクションがある場合、各 OU の `result` に (a) 保存したREQドキュメント一覧 (b) OU 操作と保存先REQ doc の対応 (c) source RUとOU操作の対応 (d) case-open が入力として扱える保存結果 を書き戻す

**Step 11-2**: Issue作成の責任分離。req-save はREQドキュメントの保存中に Issue を作成しない（case-open の責任範囲）

### Step 12: 完了報告

完了報告 template に従って出力。実行結果に応じて `templates/req-save/` 配下の種別（`split-detected.md` / `epic.md` / `standard.md`）を選択

## case-auto 並列委譲モデル（REQ/093）

req-save は複数 REQ/Decision ファイルの変更案作成、検査を並列化できる（REQ）。3 フェーズ（1. 採番バッチ[直列] / 2. ファイル作成[並列・最大5件] / 3. インデックス更新[直列]）で分離する。G07（commit 前 status 更新）はフェーズ3で維持し、直列集約対象（採番、index 更新、draft 更新、commit、push）は並列委譲の完了を待ってから実行する（REQ）。詳細は `agentdev-req-file-manager` を参照

## ガードレール

### フェーズ制約
- G01: REQ/Decision 対象 artifact_actions（`artifact: req`/ `artifact: decision`）がない場合は no-op 完了。`work_type` による停止は廃止

### ファイル操作制約
- G02: ファイル編集スコープ: 以下のパスのみ作成、編集、削除を許可: `docs/requirements/**`（REQファイル）、`docs/decisions/**`（Decision）、`docs/README.md`（ドキュメントハブ）、`.agentdev/drafts/**`（ドラフトstatus更新用）
- G03: 上記以外のファイル作成、編集は禁止

### 品質ゲート
- G04: ドラフトファイルが存在しない場合は実行不可（エラーで中止）
- G05: REQ番号は連番、一意であること（空き番号の再利用禁止）→ `agentdev-req-file-manager` に従う
- G06: 要件doc構造は `doc_requirement.md` テンプレートに厳密に従うこと。【必須】セクションの欠落は禁止
- G07: ドラフトのstatus更新（`saved`）は commit/push より前に実行し、commit対象に含めること。push後のstatus更新は永続化されないため禁止
- G08: Step 9-1 の `git pull --ff-only` 後、読込時 hash と pull 後 hash の一致検証を必須とすること。一致しない場合は評価、承認をやり直すこと

### Decision妥当性再検証ゲート

Decision保存の直前に、以下の妥当性を再検証すること: Decisionが技術判断（アーキテクチャ上の決定）を含むか確認、REQ/SPEC相当の内容のみの場合は保存を停止し理由を報告、`agentdev-decision-guidelines`の判定結果を前提として検証、`agentdev-decision-file-manager` の採番ルール（max+1, 欠番埋め禁止）で確定した番号を振る、draft 内の全 Decision 参照（`new:{topic-slug}` 形式）を当該確定番号で置換、採番は `docs/decisions/` 配下の既存 Decision ファイルの最大番号 + 1 とし欠番があっても埋めない

### 委譲、参照制約
- G09: 工程分岐は `work_type` 固定分岐ではなく `artifact_actions` の有無で判定する。判定基準の詳細は `agentdev-workflow-lifecycle` を参照

### 出力制約
- G10: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

### Capture 非関与制約
- G12: req-save の capture 責務は原則非関与。req-save は intake/ learning capture を直接行わない。例外: REQ 再構成 intake（`.agentdev/intake/inbox/req-restructure/**`）のみ生成可能。deviation capture（req-save 実行中に実観測した deviation）は Skill（`agentdev-learning-capture` または `agentdev-intake-pipeline`）への委譲で実施し、req-save が直接 capture しない（REQ-006-106、REQ-006-111）。capture 境界（capture-boundaries）の詳細は `agentdev-workflow-orchestration` 参照

### Issue作成制約
- G11: req-saveはIssueを作成してはならない。Issue作成はcase-openの責任範囲である
