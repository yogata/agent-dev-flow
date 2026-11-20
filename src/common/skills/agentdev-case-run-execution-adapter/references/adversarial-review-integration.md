# adversarial-review 統合（実行手続正本）

本ファイルは、adversarial-review caller integration の共通実行手続の正本である。正本化対象の caller は case-run adapter 委譲内、case-open、req-define（STEP-8）であり、各 caller は本ファイルを参照する。
case-run adapter 委譲内の正規原本は `agentdev-case-run-execution-adapter` Design「adversarial-review 統合（実装方針→review→結果反映）」節である。
本ファイルは Design を補完する実行手続きのみを保持する正本であり、共通 caller integration 契約の意味所有は adversarial-review skill Design「adversarial-review caller integration 共通契約」節が維持する。本ファイルは Design と矛盾する場合は Design を正とし、意味所有へ昇格しない。本ファイルは共通契約を再定義しない。
caller 固有の挿入境界、審議対象、戻り先、記録先等は各 caller の参照ファイルに残す: `.opencode/skills/agentdev-workflow-case-open/references/adversarial-review-integration.md`、`.opencode/skills/agentdev-workflow-req-define/references/adversarial-review-integration.md`。
case-run adapter 委譲内では、挿入境界、委譲内実施、実装方針限定、blocked 遷移の契約は case-run command Design「adversarial-review 挿入境界（case-run: adapter 委譲内）」節が正であり、本ファイルは参照レベルに留める。
各節の適用範囲: 「実装方針形成」「blocked 遷移」および「発動条件判定と review 呼出」内の実装方針に紐づく詳細は case-run adapter 委譲内に適用し、他節は全 caller に適用する。

## 実装方針形成（case-run adapter 委譲内）

> 本節は case-run adapter 委譲内に適用する。case-open、req-define の審議対象形成は各 caller の参照ファイルを参照する。

実行担当サブエージェントは委譲 prompt で指定された実行 command に従い、Issue 本文、受け入れ基準、Decision、REQ、Design、docs、repository context を再確認した上で実装方針を形成する。

実装方針の構成要素:

- 実装の全体構造（モジュール、ファイル構成、関数配置）
- 命名規則、データ構造の選択
- 実装の並び順、依存関係の整理
- 使用ライブラリ、ユーティリティの選択（既確定 Design 範囲内）
- テスト方針（test strategy 項目の検証手順の具体化）

実装方針は既確定 Issue 本文、REQ、Decision、Design を実現する内部選択に限定する。
新規要件の創出、既存 REQ/Decision/Design の変更、撤回、再解釈を含まない。
実装方針の生成、審査は case-run 本体（委譲元）ではなく adapter 委譲内の実行担当サブエージェント責務である。
実装方針は最初の実装変更（ファイル編集、コード生成等の不可逆処理）前に形成、確定する。

## 発動条件判定と review 呼出

本節は全 caller に適用する共通手続である。呼出元は審議対象の形成完了後、次の正規操作（case-run adapter 委譲内では最初の実装変更、case-open では Root Case 作成、req-define では STEP-9 のドラフト保存）の前に発動条件を判定する。
発動条件判定と review 呼出は分離する。

### 発動条件判定

caller は adversarial-review を原則実行する（default-on）。
発動条件判定は呼出元が行い、ユーザー明示指定は通常発動の必須条件ではない。審議対象の意味的決定が存在する場合に発動する。
skip 条件の一般形は、審議対象が自明（既確定 Design の機械的反映、合意済み入力の機械的投影等）で、意味的決定（構成、選択、対象範囲の決定）が存在しない場合であり、この場合 adversarial-review を省略して従来フローを継続できる。caller 固有の skip 条件は各 caller の参照ファイルを正とする。skip 判断のためだけの新規 HITL、承認点は追加しない。
case-run adapter 委譲内の skip 条件は、実装方針が自明（既確定 Design の機械的反映、単一ファイル編集等）で、実装方針の意味的決定（関数配置、命名、データ構造選択）が存在しないことである。
ユーザーが review の実施を明示的に指示した場合は、通常のユーザー指示としてその場で実行する。専用の検出、専用フラグ、Issue 本文への専用保存、後工程への専用伝播、skip 条件の専用上書き処理を持たない。
skip する場合は節末「非発動時の判定理由記録と代替自己反証」の記録義務に従う。

### review 呼出（skip 条件非該当时）

skip 条件非該当时、呼出元は `agentdev-adversarial-review` を起動し、審議対象を渡す。
呼出契約、返却契約、副作用境界は `agentdev-adversarial-review` と delegation-contracts Design（`semantic_review`、書き込み禁止型）を正とする。
adversarial-review は対象ファイル、Issue、PR、git 操作を行わず、審議結果は中間成果として呼出元へ返却され、新規正規 artifact を生成しない。

case-run adapter 委譲内で審議対象へ渡す実装方針の内容:

- 対象 Issue 番号、完了条件、受け入れ基準
- 形成した実装方針（構成要素、根拠、既確定 Issue/REQ/Decision/Design との対応）
- 想定失敗条件、技術領域、制約（review 戦略構成の入力）

## 結果反映

本節は全 caller に適用する共通手続である。
accepted finding の審議対象への反映は呼出元の責務である。
反映は次の正規操作（case-run adapter 委譲内では最初の実装変更、case-open では Root Case 作成、req-define では STEP-9 のドラフト保存）の前に行う。

反映後に審議対象の意味内容が変更された場合、呼出元は必要な既存検証（REQ/Decision/Design 整合性再確認、targeted docs guard、QG 等）を再実行する。
意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動でき、新証拠、新前提、異なる failure condition、未評価範囲のいずれも伴わない同一 finding の再起票を禁止する。
再 review 停止条件4点は adversarial-review Design を正とする。

## blocked 遷移（case-run adapter 委譲内）

本節は case-run adapter 委譲内に適用する。case-open、req-define の unresolved 判断事項の処置（次工程へ進まない等）は各 caller の参照ファイルを正とする。
実行担当サブエージェントは adapter 委譲内で次のいずれかに該当する場合、最初の実装変更を行わず result を `blocked` として case-run へ返却する。

### 実装方針が既確定文書の変更を必要とする

実装方針が次のいずれかを必要とする場合、blocked へ遷移する。

- 既確定 Issue 本文の受け入れ基準、完了条件の変更
- 既存 REQ の要件行の追加、変更、撤回
- 既存 Decision の決定事項の変更、撤回
- 既存 Design の契約、手続き、責務の変更

これらは adapter 委譲内で解決せず、ユーザー判断、REQ 更新プロセス（req-define、再合意済み Definition 変更は case-revise → case-ready）、追跡Issue操作（`agentdev-issue-tracking` スキル。`agentdev_gh` issue_update）経由の Issue 本文更新等の正規経路へ引き渡すため blocked とする。

### 要件、仕様問題の検出

要件、仕様に次のいずれかを検出した場合、勝手に仕様変更、REQ 黙示変更、Decision 再解釈を行わず blocked へ遷移する。

- 要件の欠落（完了条件、受け入れ基準が不明確、実装不可能）
- 要件の矛盾（完了条件同士、完了条件と受け入れ基準、REQ 間の矛盾）
- 曖昧さ（用語、対象範囲、境界が複数解釈可能）
- 実現不可能な条件（技術的制約、リソース制約で実現困難）

### unresolved 争点の残存（全 caller 共通）

adversarial-review 審議で unresolved な本質的争点またはユーザー判断事項が残る場合、呼出元は後続の不可逆処理（case-run adapter 委譲内では実装の最初の変更、case-open では Root Case 作成、req-define では STEP-9 のドラフト保存）へ進まない。
case-run adapter 委譲内では result を `blocked` として返却する。caller 固有の処置（既存 status への付加等）は各 caller の参照ファイルを正とする。
adversarial-review 自体を新しい恒久的な統制ゲートとしない。
unresolved は既存の HITL、blocker、case-auto 停止理由分類のいずれかへ振り向けられる。

### blocked 詳細本文の記録

blocked 詳細本文（検出理由、対象 REQ/Decision/Design、想定される修正方向等）は Issue コメントに SSoT として構造化して記録する（result 契約「SSoT」節、case-run STEP-S5（result 処理）参照）。
実行担当サブエージェントは blocked 遷移時に実装ファイル、PR、commit を残さず、worktree を実装前の状態に保つ。

## 従来フロー（review 非発動時）

本節は全 caller に適用する共通手続である。
skip 条件該当时、呼出失敗時のいずれの場合も、各 caller の従来フロー（review を挿入しない既存経路。case-run adapter 委譲内では実装方針形成、実装、検証、PR 作成）を維持する。
呼出元は review 呼出を行わず、従来フローの次の工程へ進む。

呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を各 caller の既存記録経路（case-run adapter 委譲内では PR 本文の `## Findings / Capture候補` セクション）に記録した上で従来フローを維持する。
呼出失敗を理由に審議対象を自動承認、自動棄却、または既存 QG を飛ばさない。

### 非発動時の判定理由記録と代替自己反証

skip 条件該当で非発動とする場合、呼出元は判定理由を必須記録する。
記録先は各 caller の既存記録経路に従う（case-run 委譲では PR 本文、case-close では対応記録コメント（issue_comment_bug_record.md 系の「adversarial-review 判定」欄）等）。
非発動時は代替としての自己反証を実施・記録し、silent skip を発生させない。代替自己反証の3要素:

- 却下案の検討と却下理由
- 緩和策の検討と適用可否
- unresolved な本質的争点なしの確認

非発動と判定した場合、呼出元は上記3要素を検討し、結果を判定理由とともに同一記録先へ記録する。
発動条件と審議プロトコルの正（adversarial-review Design）は本節で変更しない。

## 副作用境界と委譲契約

adversarial-review は delegation-contracts Design の `semantic_review`（書き込み禁止型）として適用する。
許可操作は `read_files`、`inspect_content`、`return_summary`、`return_evidence`、`return_artifact_body_when_requested` に限定し、`file_write`、`issue_pr_update`、`commit`、`push`、`user_confirmation` を forbidden とする。
審議結果は中間成果として呼出元へ返却し、新規正規 artifact を生成しない。
呼出失敗時の取扱いは前節「従来フロー（review 非発動時）」を参照。

## 参照契約

共通契約（任意性、副作用禁止、accepted finding 反映責務、再 review 条件、停止条件、呼出失敗時取扱い）は adversarial-review Design「adversarial-review caller integration 共通契約」節が正とする。
本ファイルはこれらを再定義しない。
case-run adapter 委譲内では、挿入境界（委譲内実施、STEP-S4 投影、実装方針限定、blocked 遷移）は case-run command Design「adversarial-review 挿入境界（case-run: adapter 委譲内）」節が正であり、adapter 委譲内の内部手続き（実装方針形成、review 呼出、結果反映、blocked 遷移）の詳細は `agentdev-case-run-execution-adapter` Design「adversarial-review 統合（実装方針→review→結果反映）」節が正とする。
case-open、req-define の各 caller は、共通実行手続を本ファイルへ参照し、caller 固有の挿入境界、審議対象、戻り先、記録先等は各 caller の参照ファイル（`.opencode/skills/agentdev-workflow-case-open/references/adversarial-review-integration.md`、`.opencode/skills/agentdev-workflow-req-define/references/adversarial-review-integration.md`）を正とする。
