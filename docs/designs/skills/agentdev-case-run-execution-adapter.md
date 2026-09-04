---
title: `agentdev-case-run-execution-adapter` Design
status: accepted
created: 2026-06-21
updated: 2026-08-15
---
<!-- ADF-COVERS(implementation): REQ-011-010, REQ-011-011, REQ-011-012, REQ-011-017, REQ-015-010, REQ-015-011, REQ-031-007, REQ-031-008 -->

# `agentdev-case-run-execution-adapter` Design

## 目的

case-run が Issue 実装を実行担当サブエージェントへ委譲する際のアダプタープロトコルを定義し、実行結果（completed-pr / blocked / failed / delegation-unavailable）を処理する。
実行 command は委譲 prompt 内で指定され、`load_skills` には adapter skill を指定する。
command の具体名、起動手段は AGENTS.md および references/<harness>.md 参照（REQ-002-002）。

## 適用対象

- Issue 単位の実装作業を実行担当サブエージェントに接続し、実行結果を case-run へ返却する時
- REQ-011 / v2:ADR-0128 に基づく外部実行委譲
- 委譲起動失敗、異常終了時の事後処理

## 提供する判断、操作

- 委譲プロトコル（adapter skill 経由での委譲起動 + 委譲 prompt 内で実行 command を指定）。起動手段の詳細は AGENTS.md および references/<harness>.md 参照（REQ-002-002）
- result 契約（4状態: completed-pr / blocked / failed / delegation-unavailable）
- 欠陥類型を修正単位とする修正・検証契約（本質的な指摘事項確認時の修正前整理、欠陥類型単位の検証対象選定）
- worktree 隔離遵守、自己検証
- 委譲起動失敗時の事後処理（worktree `git status` で未コミット変更確認、残留箇所 grep と手動修正）

## 参照する references

- `references/<harness>.md`（harness 固有の委譲起動仕様）

## 現在の動作

- 実行担当サブエージェントの起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-002-002）
- worktree root 外での作業を禁止
- PR URL を SSoT として返却（REQ-006-021 廃止に伴い PR URL フォールバック検索不使用）
- 各ツール呼び出しは120秒 timeout で保護
- runtime workspace（実行監査トレイル等）の構造、配置は harness の責務であり、配布 Design は関与しない（REQ-002-002）

## 対象外

- req-define のアーキテクチャ確認（`agentdev-architecture-advisory` 担当）
- ワークフロー状態管理（`agentdev-workflow-lifecycle` 担当）
- Issue 完了条件チェックボックスの評価、更新（case-close QG-4 責務）

## 検証観点

- worktree 隔離の自己検証
- PR URL の正確性
- result 契約（4状態）の適合性
- 欠陥類型単位の修正・検証契約の遵守（修正前整理、検証対象選定、completed-pr 許可条件）
- 委譲起動失敗時の適切な事後処理

## See Also

- [agentdev-workflow-orchestration.md](agentdev-workflow-orchestration.md)
- [agentdev-git-worktree.md](agentdev-git-worktree.md)
- [commands/case-run.md](../commands/case-run.md)
- REQ-006（case-run / 実装パイプライン）
- REQ-003（外部エージェント統合契約）
- REQ-011（case-auto 最大自走モード）
- v2:ADR-0128（case-run 外部実行委譲）

## adversarial-review 統合（実装方針→review→結果反映）

本節は case-run の adapter 委譲内（REQ-015-010）における adversarial-review 統合の内部手続きを正典として所有する（REQ-014-011）。
共通 caller integration 契約の正規所有者は adversarial-review Design であり（REQ-014-003）、本節は adapter 委譲内固有の実装方針形成、review 呼出、結果反映、blocked 遷移の手続きのみを所有する。
挿入境界（委譲内実施、STEP-S4 投影、実装方針限定、blocked 遷移）の正規所有者は case-run command Design「adversarial-review 挿入境界（case-run: adapter 委譲内）」節であり、本節は再定義せず参照する。
adversarial-review 自身の振る舞い契約、再 review 条件、停止条件は adversarial-review Design を正とし、本節で再定義しない。

### 実装方針の形成と限定（REQ-015-010）

実行担当サブエージェントは委譲 prompt で指定された実行 command に従い、Issue 本文、受け入れ基準、Decision、REQ、Design、docs、repository context を再確認した上で、実装方針を形成する。
実装方針は既確定 Issue/REQ/Decision/Design を実現する内部選択（関数配置、命名、データ構造の選択、実装の並び順、使用ライブラリ選択等の実現手段）に限定する（REQ-015-010）。
実装方針は新規要件の創出、既存 REQ/Decision/Design の変更、撤回、再解釈を含まない。

実装方針は最初の実装変更（ファイル編集、コード生成等の不可逆処理）前に形成、確定する。
実装方針の生成、審査は case-run 本体（委譲元）ではなく adapter 委譲内の実行担当サブエージェント責務である（REQ-015-010、case-run command Design「case-run 本体は実装方針を生成・審査しない」節参照）。

### review 呼出と発動条件（REQ-015-001/002）

実行担当サブエージェントは実装方針形成完了後、最初の実装変更前に発動条件を判定する。
発動条件判定と review 呼出は分離する（REQ-015-001）。
発動条件はユーザー明示指定のみ（REQ-015-002、REQ-014-001）を正とする。
明示指定の検出、伝達経路（委譲 prompt、メタデータ等）の詳細は harness execution mechanism に属し、本 Design の対象外とする。

発動条件該当時、実行担当サブエージェントは `agentdev-adversarial-review` を起動し、実装方針を審議対象へ渡す。
呼出契約、返却契約、副作用境界は `agentdev-adversarial-review` と delegation-contracts Design（`semantic_review`、書き込み禁止型）を正とする。
adversarial-review は実装ファイル、Issue、PR、git 操作を行わず（REQ-014-004）、審議結果は中間成果として呼出元（実行担当サブエージェント）へ返却され、新規正規 artifact を生成しない（REQ-014-005）。

### 結果反映（REQ-014-006/007）

accepted finding の実装方針への反映は実行担当サブエージェント（呼出元）の責務である（REQ-014-006）。
反映は最初の実装変更前に行う。
反映後に実装方針の意味内容が変更された場合、adapter 委譲内で必要な既存検証（REQ/Decision/Design 整合性再確認、targeted docs guard、QG-3 等）を再実行する。
意味内容変更から新たな本質的争点が生じ得る場合のみ adapter 委譲内で再 review を発動でき（REQ-014-007）、新証拠、新前提、異なる failure condition、未評価範囲のいずれも伴わない同一 finding の再起票を禁止する。
再 review 停止条件4点（REQ-014-008）は adversarial-review Design を正とする。

### 欠陥類型を修正単位とする契約（修正単位・検証）

実行中に本質的な指摘事項が確認された場合（adversarial-review 由来に限定せず、コードレビュー、QA、品質ゲート、試験等で確認されたものを含む）、報告された個別事例のみを修正単位とせず、利用可能な証拠から根本原因、欠陥類型、同じ原因の影響を受ける範囲、必要な修正範囲、必要な追加検証範囲を整理してから修正する（REQ-031-018）。

自律修正と blocked の境界: 一般化した修正範囲が既確定 Issue の対象範囲内の内部実装変更だけで完結する場合は自律的に修正してよい。
Issue の対象範囲、完了条件、受け入れ条件、REQ、Decision、Design、必須品質条件の変更が必要になる場合は現行 Issue 内で勝手に変更せず blocked とする（REQ-031-019。blocked 遷移判定は「blocked 遷移の内部手続き」節を正とする）。

欠陥類型単位の検証: 修正後は元の再現事例だけの再検証をもって完了とせず、欠陥類型に応じて合理的に必要な検証対象（元の再現事例、同種事例、境界条件、対称となる事例、適用外であるべき事例、既存の回帰試験等の候補）を選定する。
固定的な全項目必須チェックリストにはしない（REQ-031-020）。
検証中に新たな失敗事例を発見した場合、既存の指摘事項と根本原因が同一なら既存欠陥類型の適用範囲不足として修正範囲を再設定し修正と検証を再実行し、根本原因が異なる場合のみ新しい指摘事項として扱う（REQ-031-021）。

結果状態との関係: 本質的な指摘事項は Findings 等への記録だけを理由として未解消のまま completed-pr にせず、Issue の対象範囲内で修正可能な場合は修正および欠陥類型単位の検証が成功した後にのみ completed-pr を許可する。
非本質的な指摘事項は既存契約に従い Findings 記録による継続を許可する（REQ-031-022）。
利用可能なリポジトリ情報、実装差分、試験結果、関連する Issue / REQ / Decision / Design / docs を十分に調査しても安全な修正範囲を正当化できる根本原因または欠陥類型を確立できない場合は、局所的な推測修正によって completed-pr へ進まず failed とする（REQ-031-023）。
result 契約は既存4状態（completed-pr / blocked / failed / delegation-unavailable）を維持し、本契約のために新しい結果状態を追加しない。

### blocked 遷移の内部手続き（REQ-015-010/011）

実行担当サブエージェントは adapter 委譲内で次のいずれかに該当する場合、最初の実装変更を行わず result を `blocked` として case-run へ返却する。
blocked 遷移の契約は case-run command Design「blocked 遷移」節を正とし、本節は adapter 委譲内での判定手続きを所有する。

| blocked 要因 | 要件 | 詳細 |
|---|---|---|
| 実装方針が既確定文書の変更を必要とする | REQ-015-010 | 実装方針が既確定 Issue/REQ/Decision/Design の変更、追加、撤回を要求する場合、実装を開始せず blocked へ遷移する |
| 要件、仕様問題の検出 | REQ-015-011 | 要件、仕様に欠落、矛盾、曖昧さ、実現不可能な条件等を検出した場合、勝手に仕様変更、REQ 黙示変更、Decision 再解釈を行わず blocked へ遷移する |
| unresolved 争点の残存 | REQ-014-009 | adversarial-review 審議で unresolved な本質的争点またはユーザー判断事項が残り、実装の最初の変更（不可逆処理）へ進めない場合、blocked へ遷移する |

blocked 詳細本文（検出理由、対象 REQ/Decision/Design、想定される修正方向等）は Issue コメントに SSoT として構造化して記録する（result 契約「SSoT」節、case-run STEP-S5（result 処理）参照）。
実行担当サブエージェントは blocked 遷移時に実装ファイル、PR、commit を残さず、worktree を実装前の状態に保つ。

### 従来フロー維持（REQ-015-003）

発動条件非該当時（ユーザー明示指定なし）、呼出失敗時（REQ-014-010）のいずれの場合も、adapter 委譲内の従来フロー（実装方針形成、実装、検証、PR 作成）を維持する（REQ-015-003）。
review 呼出を行わず、実装方針形成から直接実装、検証、PR 作成へ進む。
呼出失敗時は silent skip を禁止し（REQ-014-010）、利用不能を PR 本文の `## Findings / Capture候補` セクションに記録した上で従来フローを維持する。

### 副作用境界と委譲契約

adversarial-review は delegation-contracts Design の `semantic_review`（書き込み禁止型）として適用する。
許可操作は `read_files`、`inspect_content`、`return_summary`、`return_evidence`、`return_artifact_body_when_requested` に限定し、`file_write`、`issue_pr_update`、`commit`、`push`、`user_confirmation` を forbidden とする（REQ-014-004）。
審議結果は中間成果として実行担当サブエージェントへ返却し、新規正規 artifact を生成しない（REQ-014-005）。
呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し（REQ-014-010）、従来フローと既存 QG/HITL を維持する。

### 正規所有者マトリックス参照

本節と adversarial-review Design「adversarial-review caller integration 共通契約」節（REQ-014-011）、delegation-contracts Design「adversarial-review との委譲契約接続」節、case-run command Design「adversarial-review 挿入境界（case-run: adapter 委譲内）」節との間で意味の重複、矛盾を生じない。
adapter 委譲内の内部手続き（実装方針形成、review 呼出、結果反映、blocked 遷移）のみを本節が所有し、挿入境界（委譲内実施、STEP-S4 投影）、実装方針限定の契約は case-run command Design を正とする。

