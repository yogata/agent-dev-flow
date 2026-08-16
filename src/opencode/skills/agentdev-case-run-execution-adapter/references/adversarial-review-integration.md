# adversarial-review 統合（経路G）

本ファイルは case-run 経路Gにおける adapter 委譲内の adversarial-review 統合の実行時参照を提供する。正規原本は `agentdev-case-run-execution-adapter` SPEC「adversarial-review 統合（実装方針→review→結果反映）」節である。本ファイルは SPEC を補完する実行手続きのみを保持し、SPEC と矛盾する場合は SPEC を正とする。共通 caller integration 契約は adversarial-review SPEC が正規所有者であり、本ファイルは再定義しない。挿入境界、委譲内実施、実装方針限定、blocked 遷移の契約は case-run command SPEC「adversarial-review 挿入境界（経路G: adapter 委譲内）」節が正であり、本ファイルは参照レベルに留める。

## 実装方針形成

実行担当サブエージェントは委譲 prompt で指定された実行 command に従い、Issue 本文、受け入れ基準、ADR、REQ、SPEC、docs、repository context を再確認した上で実装方針を形成する。

実装方針の構成要素:

- 実装の全体構造（モジュール、ファイル構成、関数配置）
- 命名規則、データ構造の選択
- 実装の並び順、依存関係の整理
- 使用ライブラリ、ユーティリティの選択（既確定 SPEC 範囲内）
- テスト方針（test strategy 項目の検証手順の具体化）

実装方針は既確定 Issue 本文、REQ、ADR、SPEC を実現する内部選択に限定する。新規要件の創出、既存 REQ/ADR/SPEC の変更、撤回、再解釈を含まない。実装方針の生成、審査は case-run 本体（委譲元）ではなく adapter 委譲内の実行担当サブエージェント責務である。実装方針は最初の実装変更（ファイル編集、コード生成等の不可逆処理）前に形成、確定する。

## 発動条件判定と review 呼出

実行担当サブエージェントは実装方針形成完了後、最初の実装変更前に発動条件を判定する。発動条件判定と review 呼出は分離する。

### 発動条件判定

発動条件はユーザー明示指定のみを正とする。明示指定の検出、伝達経路（委譲 prompt、メタデータ等）の詳細は harness execution mechanism に属し、本ファイルの対象外とする。明示指定がない場合、review 呼出を行わず次節「従来フロー（review 非発動時）」へ進む。

### review 呼出（発動条件該当時）

発動条件該当時、実行担当サブエージェントは `agentdev-adversarial-review` を起動し、実装方針を審議対象へ渡す。呼出契約、返却契約、副作用境界は `agentdev-adversarial-review` と delegation-contracts SPEC（`semantic_review`、書き込み禁止型）を正とする。adversarial-review は実装ファイル、Issue、PR、git 操作を行わず、審議結果は中間成果として実行担当サブエージェントへ返却され、新規正規 artifact を生成しない。

審議対象へ渡す実装方針の内容:

- 対象 Issue 番号、完了条件、受け入れ基準
- 形成した実装方針（構成要素、根拠、既確定 Issue/REQ/ADR/SPEC との対応）
- 想定失敗条件、技術領域、制約（review 戦略構成の入力）

## 結果反映

accepted finding の実装方針への反映は実行担当サブエージェント（呼出元）の責務である。反映は最初の実装変更前に行う。

反映後に実装方針の意味内容が変更された場合、adapter 委譲内で必要な既存検証（REQ/ADR/SPEC 整合性再確認、targeted docs guard、QG 等）を再実行する。意味内容変更から新たな本質的争点が生じ得る場合のみ adapter 委譲内で再 review を発動でき、新証拠、新前提、異なる failure condition、未評価範囲のいずれも伴わない同一 finding の再起票を禁止する。再 review 停止条件4点は adversarial-review SPEC を正とする。

## blocked 遷移

実行担当サブエージェントは adapter 委譲内で次のいずれかに該当する場合、最初の実装変更を行わず result を `blocked` として case-run へ返却する。

### 実装方針が既確定文書の変更を必要とする

実装方針が次のいずれかを必要とする場合、blocked へ遷移する。

- 既確定 Issue 本文の受け入れ基準、完了条件の変更
- 既存 REQ の要件行の追加、変更、撤回
- 既存 ADR の決定事項の変更、撤回
- 既存 SPEC の契約、手続き、責務の変更

これらは adapter 委譲内で解決せず、ユーザー判断、REQ 更新プロセス（req-define / req-save / spec-save）、case-update 経由の Issue 本文更新等の正規経路へ引き渡すため blocked とする。

### 要件、仕様問題の検出

要件、仕様に次のいずれかを検出した場合、勝手に仕様変更、REQ 黙示変更、ADR 再解釈を行わず blocked へ遷移する。

- 要件の欠落（完了条件、受け入れ基準が不明確、実装不可能）
- 要件の矛盾（完了条件同士、完了条件と受け入れ基準、REQ 間の矛盾）
- 曖昧さ（用語、対象範囲、境界が複数解釈可能）
- 実現不可能な条件（技術的制約、リソース制約で実現困難）

### unresolved 争点の残存

adversarial-review 審議で unresolved な本質的争点またはユーザー判断事項が残り、実装の最初の変更（不可逆処理）へ進めない場合、blocked へ遷移する。adversarial-review 自体を新しい恒久的な統制ゲートとしない。unresolved は既存の HITL、blocker、case-auto 停止理由分類のいずれかへ振り向けられる。

### blocked 詳細本文の記録

blocked 詳細本文（検出理由、対象 REQ/ADR/SPEC、想定される修正方向等）は Issue コメントに SSoT として構造化して記録する（result 契約「SSoT」節、case-run command SPEC Step 7 参照）。実行担当サブエージェントは blocked 遷移時に実装ファイル、PR、commit を残さず、worktree を実装前の状態に保つ。

## 従来フロー（review 非発動時）

発動条件非該当時（ユーザー明示指定なし）、呼出失敗時のいずれの場合も、adapter 委譲内の従来フロー（実装方針形成、実装、検証、PR 作成）を維持する。review 呼出を行わず、実装方針形成から直接実装、検証、PR 作成へ進む。

呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を PR 本文の `## Findings / Capture候補` セクションに記録した上で従来フローを維持する。呼出失敗を理由に実装方針を自動承認、自動棄却、または既存 QG を飛ばさない。

## 副作用境界と委譲契約

adversarial-review は delegation-contracts SPEC の `semantic_review`（書き込み禁止型）として適用する。許可操作は `read_files`、`inspect_content`、`return_summary`、`return_evidence`、`return_artifact_body_when_requested` に限定し、`file_write`、`issue_pr_update`、`commit`、`push`、`user_confirmation` を forbidden とする。審議結果は中間成果として実行担当サブエージェントへ返却し、新規正規 artifact を生成しない。呼出失敗時の取扱いは前節「従来フロー（review 非発動時）」を参照。

## 参照契約

挿入境界（委譲内実施、Step 6 投影、実装方針限定、blocked 遷移）は case-run command SPEC「adversarial-review 挿入境界（経路G: adapter 委譲内）」節が正であり、共通契約（任意性、副作用禁止、accepted finding 反映責務、再 review 条件、停止条件、呼出失敗時取扱い）は adversarial-review SPEC「adversarial-review caller integration 共通契約」節が正とする。本ファイルはこれらを再定義しない。adapter 委譲内の内部手続き（実装方針形成、review 呼出、結果反映、blocked 遷移）の詳細は `agentdev-case-run-execution-adapter` SPEC「adversarial-review 統合（実装方針→review→結果反映）」節が正とする。
