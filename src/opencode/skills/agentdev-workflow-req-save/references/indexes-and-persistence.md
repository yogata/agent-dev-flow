# STEP-5〜12: インデックス・整合性検証・永続化・報告（indexes-and-persistence）

> 本 reference は `agentdev-workflow-req-save` SKILL.md の STEP-5〜STEP-12 詳細である。インデックス・ハブ更新、Decision ファイル作成、docs 変更整合性検証、README 索引影響確認、変更範囲検証、ドラフト status 更新、コミット・プッシュ、完了報告を提供する。

## 目次

- STEP-5: インデックス・ハブ更新
- STEP-6: Decision ファイル作成
- STEP-7: docs 変更整合性検証
- STEP-8: README 索引影響確認
- STEP-9: 変更範囲検証・リモート同期
- STEP-10: ドラフト status 更新
- STEP-11: コミット・プッシュ
- STEP-12: 完了報告

## STEP-5: インデックス・ハブ更新

### Purpose

REQ インデックスとドキュメントハブへ新規エントリを登録する。

### Input Resolution

1. SSoT 再構成: `docs/requirements/README.md`、`docs/README.md`
2. identifier 保持: REQ番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-4 の REQ ファイル操作が完了している

### Procedure

詳細は `agentdev-req-file-manager` を参照。委譲接続点: 親エージェントのみが `docs/` ファイルを更新する。**エントリ存在確認のスクリプト呼出（REQ、AG-{NNN}、AG-{NNN}）**: README へのエントリ追加後に `agentdev-artifact-validation` の公開検証契約（RU-{NNNNNNNN}-01 合意、`check-entry-existence`）で登録を検証する。具体的な CLI 形式、stdin JSON 入力、stdout schema は同 SKILL.md を参照。

### Result

- README エントリ登録済み（check-entry-existence 検証合格）

### Evidence

- 更新後 README、check-entry-existence の JSON 結果

### Completion Verification

- 新規 REQ のエントリが README 索引に存在すること

### Resume-Idempotency

- エントリ存在確認で登録済みを検出した場合は再追加しない

## STEP-6: Decision ファイル作成

### Purpose

`artifact: decision` entry から Decision ファイルを作成する。

### Input Resolution

1. SSoT 再構成: `docs/decisions/` 既存ファイル（採番 max+1）
2. identifier 保持: `new:{topic-slug}` → 確定 DEC-NNN
3. 最小 scalar: なし
4. runtime artifact: ドラフト内 Decision 参照

### Preconditions

- `artifact_actions` に `artifact: decision` の entry が含まれる場合のみ実行

### Procedure

`agentdev-decision-file-manager` に従って Decision ファイルを作成する。作成後、`docs/README.md` にDecisionセクションが存在しない場合は追加し、Decisionエントリを記載する。**Decision妥当性再検証ゲート**（保存の直前）: Decisionが技術判断（アーキテクチャ上の決定）を含むか確認、REQ/SPEC相当の内容のみの場合は保存を停止し理由を報告、`agentdev-decision-guidelines` の判定結果を前提として検証、`agentdev-decision-file-manager` の採番ルール（max+1、欠番埋め禁止）で確定した番号を振る、draft 内の全 Decision 参照（`new:{topic-slug}` 形式）を当該確定番号で置換する。

### Result

- Decision ファイル作成済み、ハブ追記済み、draft 内参照置換済み

### Evidence

- 作成ファイルパス、採番根拠（既存最大番号）

### Completion Verification

- 採番が max+1 であり、draft 内参照置換が完了していること

### Resume-Idempotency

- Decision ファイルの存在（durable state）で再実行を判定する。作成済みの場合は再作成しない

## STEP-7: docs 変更整合性検証

### Purpose

REQ番号の連続性と frontmatter id↔ファイル名一致を検証する。

### Input Resolution

1. SSoT 再構成: `docs/requirements/**`、`docs/decisions/**`
2. identifier 保持: REQ番号、DEC番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-4〜6 のファイル操作が完了している

### Procedure

REQ番号の連続性確認、frontmatter の `id` とファイル名の一致を確認する。frontmatter id↔ファイル名整合性確認は `agentdev-artifact-validation` の公開検証契約で決定的スクリプトを実行する（REQ/Decision 保存時）。CLI 形式は同 SKILL.md を参照。

### Result

- 連続性・整合性検証結果

### Evidence

- 検証スクリプトの JSON 結果

### Completion Verification

- 違反0件であること（違反時は STEP-4 へ戻して修正）

### Resume-Idempotency

- 読取検査であり再実行可能

## STEP-8: README 索引影響確認

### Purpose

REQ/Decision/SPEC 操作が各 README 索引へ影響するか確認し、targeted docs guard を実行する。

### Input Resolution

1. SSoT 再構成: `docs/README.md`、各 README、`.agentdev/extensions/**`
2. identifier 保持: REQ番号、DEC番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-7 の整合性検証が完了している

### Procedure

REQ/Decision/SPEC操作が `docs/README.md`、各 README（`docs/requirements/README.md`、`docs/decisions/README.md`、`docs/specs/README.md`）の索引に影響するか確認する。影響がある場合は更新、ない場合は「README 索引更新なし」とする。README 索引更新は導線の更新であり、要件、判断、仕様の更新ではない。

- **targeted docs guard（REQ）**: 変更 REQ ファイルと連動ファイル（`docs/requirements/README.md`、`docs/README.md`、`AGENTS.md`）に対し `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_changed_docs.ts --workflow req-save --files <changed REQ files> --json` を実行する（bun run 起動。モード使い分けの標準は コミット前の worktree 上での検証 = `--base-ref`、コミット後・PR 作成後の main 環境 = `--files` であり、保存直後ファイルの直接指定には `--files` を使用する。PowerShell で複数パスを渡す場合は配列変数経由（`$files = @('a.md','b.md')` を `--files $files` で渡す）または個別渡しとし、引用符まとめ渡し（`--files "a.md b.md"`）は使用しない）。`failures` に strict severity を含む場合は修正して再実行する。`full_docs_check_recommended` true 時は全体監査（self-hosting リポジトリ限定の自己監査コマンド）の実行をユーザーに提案する
- **extension 更新要否（REQ）**: REQ/Decision 追加/移動/削除が `.agentdev/extensions/**` へ影響するか確認する。該当 REQ/Decision を context に列挙している extension がある場合、paths も更新対象。必要時はユーザーへ指示を仰ぐ（直接編集しない）
- **エントリ存在確認（REQ、AG-{NNN}）**: `agentdev-artifact-validation` の公開検証契約（`check-entry-existence`）で REQ/Decision エントリの README 索引への存在を確認する

### Result

- 索引更新結果、targeted docs guard 結果、extension 更新要否

### Evidence

- check_changed_docs.ts の JSON 結果、索引更新の有無

### Completion Verification

- targeted docs guard の failures に strict severity を含まないこと

### Resume-Idempotency

- 読取と guard 実行であり再実行可能

## STEP-9: 変更範囲検証・リモート同期

### Purpose

変更ファイルが許可パスリスト内であることを検証し、リモート同期と hash 一致を確認する。

### Input Resolution

1. SSoT 再構成: `git diff --name-only`、`git pull` 後の HEAD
2. identifier 保持: 読込時 commit hash（STEP-2 記録）
3. 最小 scalar: pull 後 commit hash
4. runtime artifact: なし

### Preconditions

- STEP-8 の索引確認が完了している

### Procedure

- **決定的処理のスクリプト呼出（REQ、AG-{NNN}）**: `git diff --name-only` で変更ファイル一覧を取得し、許可パスリスト（G02）との照合を `agentdev-artifact-validation` の公開検証契約（`check-change-impact`、RU-{NNNNNNNN}-01 合意）で実行する。許可範囲外の変更を検出したらエラー内容をユーザーに報告して指示を待つ（自動破棄しない）。`violations` が空でない場合は G02 違反として報告し指示を待つ
- **リモート同期と hash 検証**: `git pull --ff-only` 後、読込時 hash と pull 後 hash の一致検証を必須とする。一致しない場合は評価、承認をやり直す。**RU パス保存禁止**の詳細、委譲接続点は `agentdev-req-file-manager` を参照

### Result

- 変更範囲検証結果、hash 一致検証結果

### Evidence

- check-change-impact の JSON 結果、読込時/pull 後 hash

### Completion Verification

- violations 0件、hash 一致であること（不一致時は中止）

### Resume-Idempotency

- 検証は読取であり再実行可能。external Git failure（pull 失敗等）時はエラー報告し、同一状態からリトライする

## STEP-10: ドラフト status 更新

### Purpose

ドラフトの `status` を `saved` へ更新し、commit 対象に含める。

### Input Resolution

1. SSoT 再構成: ドラフト frontmatter
2. identifier 保持: topic-slug
3. 最小 scalar: `status: saved`
4. runtime artifact: ドラフトファイル

### Preconditions

- STEP-9 の変更範囲検証が合格している

### Procedure

ドラフト `draft-data` の `status`（frontmatter）を `saved` に更新する。commit/push より前に更新し commit 対象に含める（push 後の status 更新は永続化されないため禁止、G07）。

### Result

- `status: saved` 更新済み

### Evidence

- 更新後 frontmatter

### Completion Verification

- `status: saved` が commit 対象に含まれていること

### Resume-Idempotency

- `status: saved` の存在（durable state）で commit 済み否かを再構成できる。二重更新は冪等

## STEP-11: コミット・プッシュ

### Purpose

変更を明示パスでコミットし、main ブランチへ push する。

### Input Resolution

1. SSoT 再構成: `git status`、変更ファイル一覧
2. identifier 保持: REQ番号、DEC番号
3. 最小 scalar: なし
4. runtime artifact: OU 結果書き戻し（`operation_units` の `result`）

### Preconditions

- STEP-10 の status 更新が完了している

### Procedure

`agentdev-conventional-commits` に従ってコミットメッセージを生成し、main ブランチに push する。STEP-10 の status 変更を commit 対象に含める。並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、`git add <path>` で明示パスステージし、`git commit -- <paths>`（--only pathspec 形式）でコミットする。スイープ操作（`git add -A`/ `git add .` 等）は禁止する。

- **REQ/Decision artifact_actions 処理結果の保存（ドラフトに複数 entry がある場合）**: (a) 保存したREQドキュメントのリスト（REQ番号含む）(b) 各 artifact_action から保存したREQドキュメントへのマッピング (c) ソースRUからREQ操作へのマッピング (d) case-open で消費可能な形式での保存結果
- **OU 結果の書き戻し**: ドラフトに `operation_units` セクションがある場合、各 OU の `result` に (a) 保存したREQドキュメント一覧 (b) OU 操作と保存先REQ doc の対応 (c) source RUとOU操作の対応 (d) case-open が入力として扱える保存結果を書き戻す
- **Issue作成の責任分離**: req-save はREQドキュメントの保存中に Issue を作成しない（case-open の責任範囲）

### Result

- commit・push 完了、OU 結果書き戻し済み

### Evidence

- commit hash、push 結果、commit 対象パス一覧

### Completion Verification

- 変更が全てコミット済みであり、push が成功していること

### Resume-Idempotency

- commit 前中断時は `git status` から未コミット変更を再検出して再実行する。push 拒絶（external Git failure）時はエラー報告し、同一 commit からリトライする

## STEP-12: 完了報告

### Purpose

実行結果に応じた種別の完了報告を出力する。

### Input Resolution

1. SSoT 再構成: STEP-11 の結果、保存済み REQ/Decision 一覧
2. identifier 保持: REQ番号、DEC番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-11 の push が完了している（no-op 時は STEP-1 判定直後）

### Procedure

完了報告 template に従って出力する。実行結果に応じて `templates/req-save/` 配下の種別（`split-detected.md` / `epic.md` / `standard.md`）を選択する。

### Result

- 完了報告出力

### Evidence

- 完了報告本文（種別、保存結果）

### Completion Verification

- 選択種別が実行結果（SPLIT 検出有無、Epic 規模）と一致していること

### Resume-Idempotency

- 報告のみで副作用を持たない

## 関連 STEP

- 前: STEP-4（precheck-and-req-ops.md）
- 次: なし（workflow 終了。後続は spec-save / case-open）

## 関連 Capability Skill

- `agentdev-decision-file-manager`: Decision ファイル作成、採番
- `agentdev-artifact-validation`: check-entry-existence、check-change-impact
- `agentdev-conventional-commits`: commit message 生成
- `agentdev-git-worktree`: 並列実行安全ステージング
- integrity checker skill（AG-{NNN} detector、repo 固有）: check_changed_docs.ts（--workflow req-save）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G07（status 更新は commit/push 前に実施し commit 対象に含める）
- G08（pull 後の読込時 hash と pull 後 hash の一致検証必須）
- G10（成果物本文 verbatim、過程は圧縮）
- G11（Issue 作成禁止）
- G12（capture 原則非関与、例外は REQ 再構成 intake のみ）
