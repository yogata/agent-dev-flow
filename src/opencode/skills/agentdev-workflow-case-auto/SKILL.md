---
name: agentdev-workflow-case-auto
description: "case-auto command の workflow 実装本体。req-save → design-save → case-open → case-run → case-close の自走 orchestration、orchestration stage モデル、Wave 反復制御、bounded parent decision resolution、コンフリクト解消 Level 2/3、停止理由分類、adversarial-review 経路H 停止伝播、結果集約を所有する。USE FOR: case-auto 実行時の workflow 制御（入力解決・工程分岐・orchestration・停止検出・停止理由分類）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# case-auto workflow スキル

case-auto command の workflow 実装本体。
要件doc または Issue番号から req-save → design-save → case-open → case-run → case-close を順次自走し、repo 内変更に限りマージまで完了する制御構造を所有する。
orchestration stage モデル、Wave 反復制御、bounded parent decision resolution、コンフリクト解消 Level 2/3、停止理由分類、adversarial-review 経路H 停止伝播を統合する。

case-auto command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-case-auto.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と case-auto command の公開契約のみを前提とする。SPEC ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない SPEC 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- case-auto command から渡される入力（Issue番号/URL、要件doc、明示パス、セッション指定キーワード）

## 出力

- REQ/Decision artifact_actions がある場合: REQ/Decisionファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力

## 副作用

- 各工程の委譲起動（req-save、design-save、case-open、case-close）とインライン実行（case-run、AG-{NNN}/{NNN}）
- bg task API による stage 2 並列起動（最大5件）
- GitHub Issue/PR/comment/merge/close（自走対象、command 不変条件）
- remote branch 削除（当該 case-auto/ case-run が作成した branch に限定、G05）
- docs/ REQ/ ADR/ SPEC/ command reference/ guide の更新（自走対象、command 不変条件）
- 当該 Workflow Skill は worktree root 配下以外を編集しない

## Control Plane（STEP 一覧）

case-auto workflow は次の8 STEP で構成する。
各 STEP は resume point を持つ（DEC-{N}、`docs/designs/<workflows/step-reference-contract>.md`）。
会話コンテキストに依存せず、durable state（`case_auto_started_at`、L1 タイムスタンプ、orchestration stage 別結果、bg task 状態、結果状態4次元）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 入力解決・開始時刻記録 | case-auto 起動 | 入力モード確定、`case_auto_started_at` 記録 | [references/input-resolution-and-orchestration.md](references/input-resolution-and-orchestration.md) |
| STEP-2 | work_type 読取・工程分岐 | 入力解決完了 | 工程順序確定（artifact_actions ベース、auto_gate preflight） | [references/input-resolution-and-orchestration.md](references/input-resolution-and-orchestration.md) |
| STEP-3 | orchestration 実行 | 工程順序確定 | 各工程の実行結果、stage モデル適用、Wave 反復、bg task 状態管理 | [references/input-resolution-and-orchestration.md](references/input-resolution-and-orchestration.md) |
| STEP-4 | 停止条件検出・停止理由分類 | 各工程の結果受領 | 停止判定（11項目）、停止理由分類（7軸＋上位合意矛盾/新規ユーザー判断） | [references/stop-and-decision-resolution.md](references/stop-and-decision-resolution.md) |
| STEP-5 | adversarial-review 経路H 停止伝播 | user-decision-required + decision_context 受領 | 当該 execution_unit の自走停止、ユーザー判断待機 | [references/stop-and-decision-resolution.md](references/stop-and-decision-resolution.md) |
| STEP-6 | bounded parent decision resolution | decision_context 受領 | 自律解決 / 作業仮定 / 上位合意矛盾停止 / 新規ユーザー判断停止 | [references/stop-and-decision-resolution.md](references/stop-and-decision-resolution.md) |
| STEP-7 | コンフリクト解消 Level 2/3 | case-close から Level 1 失敗エスカレーション受領 | インライン case-run 再実行（最大2回）、オーケストレーション級判断、解消 or 停止 | [references/conflict-resolution-and-reporting.md](references/conflict-resolution-and-reporting.md) |
| STEP-8 | 完了報告 | 全工程完了 or 停止 | L1 タイムスタンプ、4次元集約、OU処理ループ、tmp/ 残存確認、結果状態の分離報告 | [references/conflict-resolution-and-reporting.md](references/conflict-resolution-and-reporting.md) |

### STEP 間の依存と分岐

- **正常経路**: STEP-1 → STEP-2 → STEP-3 → STEP-8（全工程完了時）
- **停止経路**: STEP-3 → STEP-4（停止条件検出時）→ STEP-8（停止報告）
- **経路H**: STEP-3 → STEP-5（user-decision-required 受領時）→ ユーザー判断待機 → resume point から再開
- **bounded parent decision**: STEP-3 → STEP-6（decision_context 受領時）→ 自律解決時は STEP-3 へ戻る、上位合意矛盾/新規ユーザー判断時は STEP-4 停止経路へ
- **コンフリクトエスカレーション**: STEP-3（case-close 委譲時）→ STEP-7（Level 1 失敗時）→ 解消時は STEP-3 へ戻る、Level 3 失敗時は STEP-4 停止経路へ

### resume protocol

- 再開点は durable state から再構成する: `case_auto_started_at` と L1 工程別タイムスタンプ、Issue/PR の存在と番号、Epic Issue 本文のステータス追跡テーブル（Wave 進行）、draft の有無（case-open 完了前のみ pre-reader）、各工程の完了結果
- 停止時報告に再開点と再開可能な次コマンドを明示し、会話コンテキストの記憶に依存しない。case-open 成功後の再開は Issue と Epic だけで成立させる（orchestration pre-reader 契約）

### termination

- 正常終了: 全工程完了（OU処理ループを含む全 OU 処理完了）時の完了報告まで
- 一時ファイル残存: 正常終了の前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（STEP-8 で確認。cleanup 規定は `agentdev-gh-cli`）
- 停止終了: 11項目の停止条件いずれかの検出時（停止理由分類済み報告）。bounded parent decision resolution での上位合意矛盾・新規ユーザー判断。経路H の user-decision-required。コンフリクト Level 3 失敗
- 委譲起動不能時: `delegation-unavailable` として報告（委譲工程のインライン実行への切替えは行わない）

## 下位 Workflow Skill 連携（上位 orchestrator）

本スキルは上位 orchestrator として次の下位 Workflow Skill を名レベルで参照する（REQ-{NNNN}-{NNN}/{NNN}）。
下位 workflow の契約詳細を複製しない。

- `agentdev-workflow-req-save`: req-save 工程（委譲起動、委譲先 subagent が権威情報源として読み込む）
- `agentdev-workflow-design-save`: design-save 工程（同上）
- `agentdev-workflow-case-open`: case-open 工程（同上）
- `agentdev-workflow-case-run`: case-run 工程（case-auto 自身がインライン実行の読込主体として読み込む、起動手段は harness 分離モデル SPEC 参照）
- `agentdev-workflow-case-close`: case-close 工程（委譲起動、委譲先 subagent が権威情報源として読み込む）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-workflow-orchestration`: orchestration 詳細プロトコル、bg task 破棄検知・状態別回復、capture 境界、Subagent 委譲プロトコル、停止理由分類詳細、コンフリクト解消 Level 2/3 詳細
- `agentdev-case-run-execution-adapter`: case-run 委譲契約（インライン実行時）
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ、コンフリクト解消 rebase パス（Level 1 は case-close、Level 2/3 は本 workflow）
- `agentdev-epic-tracker`: Epic Issue 本文ステータス追跡テーブル（case-auto は読取のみ、書き込みは case-close 単一書き手）
- `agentdev-workflow-lifecycle`: 引き継ぎ停止判定
- `agentdev-gh-cli`: GitHub Issue/PR/comment/merge/close I/O
- `agentdev-project-extensions`: project extension 読込
- `agentdev-adversarial-review`: 経路H で停止伝播のみ受領（case-auto は直接起動しない）
- 各工程の Capability Skill を継承（req-save/design-save/case-open/case-run/case-close の依存スキル群）

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-auto.yaml`、`kind: workflow-extension`）を読み込む場合がある（REQ-{NNNN}-{NNN}、DEC-{N}）。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-auto/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、case-auto command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **自走境界（ガードレール G02・G05、ほか不変条件）**: repo にファイルとして残る変更のみ自走対象。DB migration 実行、deploy/apply、クラウドリソース操作、外部SaaS 設定変更、課金、権限、認証情報、repo外実データ操作、通知送信は対象外
- **委譲・参照制約（command 不変条件、ガードレール G16）**: 各工程は対応するコマンド定義を authoritative source として実行（case-auto 定義内再実装回避）。case-run はインライン実行（標準動作、AG-{NNN}）。Epic Issue 本文書き込みは case-close 単一書き手（case-auto は読取のみ、G16）。case-auto は Issue 階層決定ロジックを持たない、Epic Issue 化の判定に関与しない（command 不変条件）
- **3つの「5件」文脈の区別**: (1) case-run Wave 内子 Issue 並列、(2) case-auto Phase 2 同時起動数、(3) execution_unit 全体並列（上限なし）。混同しない
- **OU処理ループ**: Standard flow の case-close 完了後に未処理 OU が残存する場合は次 OU の処理を STEP-3 から開始（全 OU 処理完了時のみ全体完了報告）
- **実証Case認識と評価ブランチ伝播**: 実証Caseを draft-data の実証情報（実証Caseであること、評価契約、評価ブランチ識別情報）または Issue 等の永続情報の実証Case識別情報から復元し、通常Caseと区別する。実証Caseは復元した評価ブランチを統合先として全工程（req-save、design-save、case-open、case-run、case-close）へ一貫して伝播する。同時に複数実証を処理する場合はそれぞれ異なる評価ブランチを利用する。実証であることだけを理由に req-save / design-save を省略せず、評価ブランチ上で実行する。通常Caseの既存挙動は維持する（実証Case自走の実行詳細は case-auto command SPEC（project extension 経由参照）「実証Case自走」節参照）
- **実証Caseの完了扱いと評価ブランチ保持**: 評価ブランチへの squash merge を正常なCase完了として扱う。採用でも評価ブランチを main へ merge せず、同一実行内で正式化・本実装へ自動継続せず、実証全体の最終 case-close を当該実行の正常終了点とする。Epic 実証の各 Wave の case-run → case-close は同じ評価ブランチ上で反復する。blocked / failed / ユーザー中断時に再開可能なら評価ブランチを保持し、実証の明示的な終了・放棄時のみ必要な記録後に破棄する。評価契約を自律変更しない。ユーザーが評価契約変更を明示した場合は変更履歴と既存結果への影響を保持し、必要な再評価または再実行を継続する
- **実証Case自走の最終出力**: 最終出力に評価結果、実証Issue、主要PRまたは証拠、main 未反映であること、次の req-define <実証Issue> を示す。実証全体の完了時のみ正式化案内を示す。blocked / failed 等で実証が未完のまま終了する場合は評価結果を未確定として再開手段を示す。Epic 実証の中間Wave完了を実証全体完了と誤認せず正式化案内を出さない
- **親コンテキスト非累積（command 不変条件）**: 委譲工程の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持し、委譲工程内部の調査過程、中間ログ、読解メモを親コンテキストに累積しない
- **L1 タイムスタンプ**: 開始時刻（`case_auto_started_at`）、工程別タイムスタンプ（req-save+design-save 統合委譲 / case-open / case-run / case-close）、終了時刻を記録。case-run の L2 内訳は case-run result から読み取って含める

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` SPEC**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **`docs/decisions/DEC-{N}.md`**: case-auto の限定的親判断解決（bounded parent decision resolution）
- **case-auto command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
