---
description: 要件定義をもとにGitHub Issueを作成する
---

# Case登録

要件定義（req-define）の結果をもとにGitHub Issueを作成する。①壁打ち→②構造的実行フェーズの境界。

**draft-data 入力**: case-open は構造化 `draft-data`（`# draft-data` fenced YAML block）を入力として読み取る。draft 全体の `agreed_items`、`artifact_actions`、`operation_units` を処理対象とし、OU ごとにスライスせず draft 全体の合意結果を取り扱う。`auto_gate.auto_ready` が false、または未解決質問、未解決衝突、repo外操作、停止理由が残る場合は停止する。`conflict_resolutions` に記録済みの衝突については同じ内容をユーザーへ再確認しない

## 入力

- req-defineで生成された要件doc（構造化 `draft-data` 形式。チェックボックス付き）

## 出力

- GitHub Issue（ラベル付き、要件doc埋め込み）

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-open.yaml`）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 手順

### Step 1: 前工程からの引き継ぎ停止判定

要件doc または RU に `agentdev_handoff: true` が含まれる場合、リポジトリ種別に応じて分岐（詳細は `agentdev-workflow-lifecycle` runtime-package-boundary 参照）: self-hosting リポジトリ（ジャンクション or 実ディレクトリ）では履歴メタデータとして処理を継続、consumer リポジトリ（コピー配置等）では Issue を作成せず停止し agent-dev-flow repository への手動取り込み対象として報告

**Step 1-1**: OU 選択ゲート（`operation_units` セクションがある場合）。OU ID 指定あり → 当該 OU のみを処理対象とする例外経路。OU ID 指定なし → OU 1件なら自動選択、2件以上なら execution_unit 構成を生成し Step 3-1 へ分岐。`operation_units` セクションがない場合は従来どおり全要件docを処理（後方互換）

### Step 2: 要件docからIssue本文を生成

詳細、委譲接続点（サブエージェントはREQ読解、テンプレート充足検査、完了条件候補抽出のみを返し、親エージェントが本文確定とIssue作成）は `agentdev-issue-management` を参照。本文候補の受け渡しは `agentdev-issue-management` の「委譲接続点と本文受け渡し」セクションに従いファイルパス経由で行う（G25）

**Step 2-1/2-1a/2-1b**: QG-2 完了条件網羅性検証。Issue本文生成後、Issue作成前に `agentdev-quality-gates` の QG-2 に従い完了条件が対象 REQ/ADR/SPEC の必達要件を網羅しているかを検証（fail 時は req-define 差し戻し推奨）。**2-1a**: 数値閾値到達可能性検証（QG-2 観点6、#1538/TS-007 由来、要件定義者が明示した閾値のみ受け付け、自動推論しない）。**2-1b**: スコープ明示（本 Issue 対象範囲 vs 全体、#1532/TS-006 由来、QG-4 観点8 判定マトリクスの入力前提、識別子中心、横断評価は「全体」デフォルト）

**Step 2-2**: test_strategy 埋め込み（REQ）。draft-data の `test_strategy` を読み取り、Issue 本文の「テスト戦略」セクションに 3 要素構造（`verification` / `pass_criteria` / `on_failure`）で反映（スキーマは req-define command SPEC extension 経由）。未定義の場合はテンプレートのプレースホルダをそのまま残す

**Step 2-3/2-4/2-5**: 識別子中心の記載粒度ガイドライン（2-3、case-run の QG-3 前置 staleness check の入力前提、詳細・記載例は `agentdev-issue-management` 参照）、完了条件展開前の最新状態再確認（2-4、同日内複数 PR マージ後・順次 Wave 実行時の後続 Wave Issue 起票で必須、識別子存在確認を主軸）、review_dispositions の読取・evidence 再確認・証跡転記（2-5、AG-008、consumer 契約は case-open command SPEC extension 経由、evidence 失効時は停止し `stale_target` へ更新）の各詳細は `agentdev-issue-management`、case-open command SPEC（extension 経由）を参照

**Step 2-6: execution contract 確定ステップ（EC-1〜EC-8、REQ-017）**: Issue 本文生成前に次の確定ステップを実行し、結果を Issue 本文の対応セクション（対象範囲、test strategy、完了条件、Execution Contract セクション）へ反映する。詳細な判定規則、対応表は case-open command SPEC（extension 経由）「execution contract 確定ステップ」節、artifact-quality-control-routing SPEC（extension 経由）を正とする。

- **EC-1: 変更対象成果物の確定** — 合意済み要件doc の `artifact_actions` から変更予定成果物を抽出し、Issue 本文の「対象範囲」セクションへ確定する
- **EC-2: 必須品質統制の導出と test strategy 投影** — artifact-quality-control-routing SPEC の合成規則に従い変更予定成果物の種別から必須品質能力を導出する。各能力について test strategy 項目を生成し、Issue 本文の test strategy セクションへ投影する
- **EC-3: 完了条件の確定** — 合意内容から成果状態を抽出し、Issue 本文の完了条件セクションへ確定する。実行手段、検証手段は test strategy へ分離する。必須品質能力の呼出自体が利用者要求でない限り、Skill 呼出を完了条件化しない（AG-002、REQ-017-003）
- **EC-4: 関連 ADR 拘束条件の特定と反映** — Issue の実装を拘束する関連 ADR を特定し、必要な制約を完了条件または test strategy へ反映する
- **EC-5: 予定変更内容から事前判定可能な追加検証条件の展開** — 「関数削除時は全利用箇所を検査する」等、予定変更内容から事前判定可能な検証条件を test strategy へ展開する。case-open が追加できる test strategy は合意済み変更対象と共通ルールから決定的に導ける必須検証に限定し、新しい利用者要求を生成しない
- **EC-6: scope-affecting impact candidate の探索と反映** — Issue 作成前に変更影響候補を探索し、scope、完了条件、test strategy に影響する候補を execution contract へ反映する
- **EC-7: adversarial-review 発動契約の永続化** — ユーザー明示指定による adversarial-review 発動契約が Issue 作成前に判明している場合、Issue 本文の契約セクションへ永続化する（経路F 拡張）
- **EC-8: execution contract 必須セクションの付与** — 新規 Issue 作成時、新契約識別用の必須セクション（Execution Contract セクション、必須品質統制セクション）を Issue 本文へ付与する。presence-based 判定により新旧 Issue を識別する（AG-012、REQ-017-014）。テンプレート（`issue_desc_feature.md`、`issue_desc_child.md`）の Execution Contract セクション構造は `agentdev-workflow-templates` を参照

### Step 3: マルチREQ入力判定

入力要件doc数を確認。単一REQ → Step 4。複数REQ または draft-meta `scale: large` → **マルチREQ Epic flow**（Step 5〜）。OU モード時: Step 1-1 で選択した OU が複数または `scale: large` を含む場合 → Epic flow に分岐（Step 3-1 へ）

**Step 3-1**: 自律構成生成（OU モード、複数REQ時）。ドラフトの `operation_units` を読み取り要件分析に基づき Epic/Wave/Issue 構造を自律生成（req-define 出力は参考情報、case-open が最終構造を決定）。独立 OU の自動 Epic 化（REQ、複数の独立 OU `depends_on` 空 L0 相当を検出時、Wave 1 に全 OU 配置、独立 OU 1件のみなら Standard flow G20）。Wave テーブル「実行方法」列（L0/L1 → 並列、L2/L3 → 直列）。停止条件、禁止事項、構成生成事前検証（preflight）の詳細は `agentdev-epic-tracker` を参照

### Step 4: 規模判定（Step 3 で単一REQの場合）

`scale: large` → **単一REQ Epic flow**（Step 5〜）。`scale: standard`/フィールドなし → **Standard flow**（Step 10〜）。**Step 4-1**: 構成生成事前検証（preflight、Step 3-1 通過時および Step 4 通過時に実施）。Standard/Epic/混在構成の全ルートで GitHub Issue 作成前に共通の事前検証（5項目: 各 Epic の子 Issue 数が10件以下、各 Wave の同時実行対象が5件以下、各 Standard Issue と子 Issue が1つの OU に対応、必須依存関係が維持、全 OU が execution_unit へ割当・欠落重複なし）。検証で上限超過または構成不備を検出した場合は Issue 作成呼び出しを行わず停止する。検証失敗時はドラフト削除、RU ファイル削除を実施せず再開可能な状態で停止

**共通ルール**（全Step適用）: VERIFY（gh CLI 書込後は毎回 `agentdev-gh-cli` VERIFY 操作で検証）、テンプレート準拠（テンプレート読込後は毎回【必須】セクションの完備を確認、【任意】は内容がある場合のみ含める、欠落時は再生成）

### adversarial-review 挿入境界（経路F、REQ-015-009）

execution structure、Issue 本文候補、完了条件を構成した後、最初の GitHub Issue 作成の前に挿入する。Epic flow の場合は Step 5（テンプレート読込）、Step 6（Epic Issue 本文生成）完了後、Step 7（Epic Issue 作成）の前。Standard flow の場合は Step 4-1（preflight）完了後、Step 10（関連ADR特定）の前。case-open は adversarial-review を原則実行する（default-on、REQ-015-002）。発動条件判定と review 呼出を分離する（REQ-015-001）。詳細な挿入境界、Step 構造対応付け、変更影響別再実行ルールは case-open command SPEC（extension 経由）「adversarial-review 挿入境界（経路F）」節を正とする。

- **発動条件判定（REQ-015-002、REQ-015-003）**: default-on で発動する。skip 条件（Standard flow で単一 OU の機械的確定、Wave 分割なし）該当時は省略して従来フロー（review を挿入せず最初の GitHub Issue 作成 Step へ進む）を継続できる（REQ-015-003）。Epic flow は Step 7、Standard flow は Step 12 へそのまま進む。ユーザー明示指定時は skip 条件にかかわらず必ず発動する（REQ-015-002）。skip 判断のためだけの新規 HITL、承認点は追加しない。
- **review 呼出（REQ-015-001）**: 発動条件判定で発動と判定された場合、execution structure（Step 3-1 または Step 4-1 で確定）、Issue 本文候補（Epic flow は Step 6 Epic Issue 本文、Standard flow は Step 2 Issue 本文）、完了条件（Step 2-1 の QG-2 で検証済み）の3者を対象に adversarial-review を呼び出す。委譲契約は delegation-contracts SPEC（extension 経由）「adversarial-review との委譲契約接続」節に従う。
  - execution structure に関わる finding は Step 3-1（自律構成生成）または Step 4（規模判定）へ戻し再評価する。Issue 本文、完了条件に関わる finding は該当 Step へ戻す。accepted finding の反映は呼出元の責務である（REQ-014-006）。
  - **変更影響別の再実行ルール（REQ-015-009）**: review の結果反映で review 対象の意味内容が変更された場合、変更影響範囲に応じて4パターンのいずれかを実行する。完了条件のみ変更 → QG-2（Step 2-1）を再実行。execution structure のみ変更 → preflight（Step 4-1）を再実行。両方が変更 → QG-2、preflight 両方を再実行（順序は QG-2 → preflight）。意味内容変更なし → 再実行不要、最初の GitHub Issue 作成 Step へ進む。
  - 未解決のユーザー判断事項が残る場合、最初の GitHub Issue 作成 Step へ進まない（REQ-014-009）。工程委譲起源であるため既存 status に unresolved 判断事項を付加する（REQ-014-012）。
  - 呼出失敗時は silent skip を禁止し、従来フローを維持する（REQ-014-010）。

### Step 5: テンプレート読込（Epic flow）

`agentdev-workflow-templates` の選定ルールに従いテンプレートを読み込む。詳細は `agentdev-issue-management` を参照。Epic flow は Step 3 または Step 4 のルーティングにより開始。マルチREQ/ 単一REQ の差分（分解ソース、Waveテーブル列、子Issue数上限、子Issue内容ソース、子Issue追加要素）の詳細は `agentdev-epic-tracker` を参照

### Step 6〜9: Epic flow（Step 5 通過後）

- **Step 6**: Epic Issue本文を生成。Step 3-1 の自律構成分析結果に基づき Epic 本文を構築。詳細、委譲接続点は `agentdev-issue-management` を参照
- **Step 7**: Epic Issueを作成。ラベル `enhancement`, `feature`, `epic`。Issue 作成手続き（`agentdev-gh-cli`）で本文を書き込み → VERIFY。Issue番号を `{epic_number}` として記録
- **Step 8**: 子Issueを作成。Issue 化単位は OU 単位（G14、G21）。子Issue 本文に `Parent: #{epic_number}`（G03）、対象 OU ID、紐づく REQ/ADR/SPEC 識別子を記載。子Issue 本文案作成、検査、Issue 作成は最大5件まで並列化（3つの「5件」文脈のうち case-run Wave 内子 Issue 並列上限と同一、後述）。Epic Issue 作成、Wave 1 配置、Epic 本文ステータス追跡テーブル更新は親が直列集約（REQ、G04 集約更新で維持）。詳細、委譲接続点は `agentdev-issue-management` を参照。**前工程完了度属性の埋め込み（REQ）**: 各子 Issue 本文の「## 補足情報」セクションに「前工程完了度」属性を埋め込む（3段階: 完全完了/ 検証のみ/ 補完あり、epic-wave-model SPEC extension 経由）
- **Step 9**: Epic Issue本文を更新。詳細、委譲接続点は `agentdev-issue-management` を参照。**Step 9-1**: OU 結果の書き戻し（`operation_units` セクションがある場合、作成した Issue/Epic 番号を当該 OU の `result` に書き戻す）。**Epic flow 完了後、共通終了処理（Step 13〜15）を必ず実行すること**

### Step 10〜12: Standard flow（Step 4 通過後）

- **Step 10**: 関連ADR特定（`docs/adr/README.md` から、単一REQ Epic flow の内容反映にも活用）
- **Step 11**: ラベル付与（`agentdev-workflow-lifecycle` に従う）
- **Step 12**: GitHub Issue作成。Issue 作成手続き（`agentdev-gh-cli`）→ VERIFY。**Step 12-1**: OU 結果の書き戻し（`operation_units` セクションがある場合、作成した Issue 番号を当該 OU の `result` に書き戻す）

### Step 13: コメント追加（共通終了処理）

`agentdev-workflow-templates` の選定ルールに従いコメント用テンプレートを読み込む（Epic flowではEpic Issueにコメント追加）→ VERIFY

### Step 14: ドラフト削除（共通終了処理）

ドラフトが存在する場合、`.agentdev/drafts/req-draft-{topic-slug}.md` を削除（Standard/Epic 全フロー共通）。削除は並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、`git rm <draft-path>` で明示パスをステージし、同一ステップ内で `git commit -- <draft-path>` により即時コミットする（Form Zero）。未ステージの削除を作業ツリーに残存させないこと

**Step 14-1**: RU ファイル削除（Standard/Epic 全フロー共通）。詳細、委譲接続点は `agentdev-req-file-manager` を参照。削除は並列実行安全ステージングプロシージャに従い `git rm <RU-path>` で明示パスをステージし、同一ステップ内で `git commit -- <RU-path>` により即時コミットする（Form Zero）

**Step 14-2**: draft/RU 削除残存検証（Standard/Epic 全フロー共通）。Step 14/14-1 の削除後、当該ファイルが作業ツリー、index に残存していないことを検証（`git status --porcelain -- <draft-path> <RU-path>` が空、またはファイル非存在確認）。残存を検出した場合、即座に停止し残存ファイル一覧を報告。Standard flow と Epic flow の双方で実施

**Step 14-3**: draft/RU 削除 commit 後の即時 push（REQ）。Step 14/14-1 の削除コミット後に `git push` を即時実行（case-run 引き継ぎ時の `git pull --ff-only` 失敗を防止するため）。push 失敗時は構造化エラーメッセージを表示して停止する

### Step 15: 完了報告（共通終了処理）

テンプレート種別: Standard → `templates/case-open/standard.md`、単一REQ Epic → `templates/case-open/epic.md`、マルチREQ Epic → `templates/case-open/multi-req-epic.md`。**Capture結果 小節**: case-open 実行中に実観測した deviation を `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存した場合、保存した capture 成果物のパス・分類・保存結果のみを含める（capture 本体は含めない、成果物が無い場合は省略、共通意味契約は `artifact-contracts` SPEC「Capture結果 小節」節参照）

## ガードレール

### フェーズ制約
- G01: ADR、specsの内容はIssue本文の生成に反映すること

### 実行制約
- G03: 子Issue本文の先頭行に `Parent: #{epic_number}` を必ず含める（親子関係の追跡用）
- G04: 全子Issueの作成完了後にEpic本文のステータス追跡テーブルを更新する（部分更新は禁止）
- G05: 子Issueは最大10件まで（Epic 1件あたり）。Step 8 で子Issue数を確認し、超過時はEpic、子Issueいずれも作成せずエラーで停止
- G14: Wave単位のみの子Issue構造を作成してはならない。子Issue は OU 単位で作成し、対応 OU 経由で REQ/ADR/SPEC へのトレーサビリティを保持すること
- G15/G16: マルチREQ Epic flow は複数REQドキュメント入力時または draft-meta に `scale: large` 設定時のみ実行。単一REQ Epic flow は `scale: large` 明示時のみ

### 品質ゲート
- G06: req-define未実行の場合は警告
- G07: 要件docのチェックボックスが空の場合は警告
- G08: featureの場合、対応するREQファイルが存在することを確認
- G09: テンプレートの【必須】セクションが全て本文に含まれていることを確認してから Issue 作成手続き（`agentdev-gh-cli`）を実行。欠落時は再生成
- G10: `完了条件` セクションはテンプレートの【必須】セクション。準拠検証で必ず確認

### 委譲、参照制約
- G12: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G13: work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照

### 出力制約
- G02: Standard flowの動作、出力形式はEpic flow追加による影響を受けない
- G17: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す（LF・空行・インデントを含む行構造をbyte単位で保持、正規化・圧縮・空白挿入削除禁止）。委譲接続点（Step 2/6/8/9）と最終 gh CLI 渡し（Step 12/13）の双方に適用。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

### deviation capture 制約
- G18/G22: case-open は自工程で実観測した deviation を `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存する。保存先は Split Rule（`agentdev-workflow-orchestration` 参照）に従い、`intake-capture` command 等、別 command を直接呼ばない。capture 本文は完了報告に含めず保存した成果物のパス・分類・保存結果のみを `Capture結果` 小節へ含める

### OU 処理制約
- G19/G20/G21: case-open は自律的な要件分析に基づいて Epic Issue または子 Issue 構造を生成（複数 OU 存在時、単一 Issue 完結時は Epic を作成しない）。機能要件、非機能要件、対象外、受け入れ条件を新規作成しない。Issue 化単位は REQ doc 単位ではなく OU 単位

### 並列実行安全 git 操作制約
- G23/G24: 共有作業ツリーでスイープ操作（`git add -A`/ `git add .`/ `git add --all`/ `git commit -a`/ `git checkout .`/ `git reset --hard`/ `git stash`/ 非所有パスへの `git checkout -- <path>`/ `git restore <path>`）を実行せず、`agentdev-git-worktree` の並列実行安全ステージングプロシージャに従う。ステージ・コミットは明示パス指定（`git add <path>`/ `git rm <path>`）+ `git commit -- <paths>`（--only pathspec 形式）で行い共有 index の他セッション変更を排出しない。draft/RU 削除は同一ステップで即時ステージ・コミットし未ステージ残存を許さない（Form Zero）。`git add` は `.agentdev/` 全体の一括スコープではなく明示パスに限定

### 本文 verbatim・ファイル経由制約
- G25: Issue 本文（Standard/Epic/子Issue/完了報告コメント全て）は文字列変数で持ち回らず `[System.IO.File]::WriteAllText`（UTF8Encoding($false)）による UTF-8 BOM なし LF 一時ファイル経由で `gh --body-file` へ渡す。テンプレート読込→変数置換→ファイル保存→gh CLI 渡しまでファイル経由で固定し、親エージェントの本文再構成を禁止

## 並列上限と3つの「5件」文脈

case-open、case-auto、case-run で参照される「5件」上限は文脈ごとに区別される（epic-wave-model SPEC「並列上限と停止条件の整理」セクション参照）: (1) case-run Wave 内子 Issue 並列（5件、同一 Wave 内 case-run サブエージェント並列起動上限）(2) case-auto Phase 2 同時起動数（5件、Phase 分離モデルにおける case-run bg task 同時起動数）(3) execution_unit 全体並列（上限なし、必須依存がない execution_unit 群は全て並列実行可能）。case-open の Step 8「子 Issue 作成の並列化」は(1)に該当。3文脈は別なので混同しない



