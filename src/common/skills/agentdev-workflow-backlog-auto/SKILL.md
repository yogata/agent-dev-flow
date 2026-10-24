---
name: agentdev-workflow-backlog-auto
description: "backlog-auto command の workflow 実装本体。orchestration stage 構成（stage 1: inspect-docs 単独直列、stage 2: 昇格3系統の並行実行と競合直列化、stage 3: backlog-review、stage 4: 要件定義接続、stage 5: 実行接続、stage 6: 全体完了判定、stage 7: リリース）、fan-in 判定、set-state 永続化、基準点確認手続、全体完了突合手続、リリース手順と再開経路、停止伝播、resume 契約を所有する。USE FOR: backlog-auto 実行時の workflow 制御（工程間順序制御、昇格3系統の並行実行と競合処理の直列化、fan-in 判定、一気通貫実行の接続、停止伝播、再開）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）、子ワークフロー内部の分類、評価、昇格、RU 生成ロジックの所有（各子 Workflow Skill が正規の処理主体）、Epic/Wave 構成規則・共有並列上限・依存判断・並列実行アルゴリズムの再定義。"
---

# backlog-auto workflow スキル

backlog-auto command の workflow 実装本体である。
backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）の工程間制御（順序、並列と直列化、合流（fan-in）、停止伝播、再開）と、承認確定 RU 一式の一気通貫実行（要件定義接続 → 実行接続 → 全体完了判定 → リリース）の接続制御を所有する。
子ワークフロー内部の分類、評価、昇格、RU 生成ロジック、並列実行アルゴリズムは各子 Workflow Skill が正規の処理主体として所有し、本スキルはこれらを複製しない。
backlog 整理サイクルは継続コラボレーションループ（`<workflows/v4-collaboration-loop>` Design）における要求入口としてのループ駆動点であり、Observe → Intake/Learning → Backlog の実行順序で一巡する。

backlog-auto command は公開 interface（入出力契約、ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}）。
一気通貫実行（単一起動での整理サイクルからパッチリリース作成までの接続、set-state による一式の運搬体、実行前後の版管理）の実行契約は一気通貫実行の REQ が所有し、版番号規則・リリース条件・公開操作はパッチリリース規則の Decision（accepted）に従う。

## 入力

- backlog-auto command から渡される入力（引数なし。対象状態は各子コマンドの永続状態と set-state から解決する）

## 出力

- 各子コマンドの既存出力（子コマンド公開契約どおり）
- backlog-auto 全体の実行結果報告（工程別結果、停止理由、再開コマンド提示を含む共通実行契約形式）
- 一気通貫の実行結果報告（工程別結果、全体完了判定結果、リリース結果または保留理由、再開経路を含む共通実行契約形式）

## 副作用

- 各子ワークフローの既存副作用（`.agentdev/` 配下の成果物作成、削除、git commit / push、ユーザー対話）を子コマンド公開契約どおりに発生させる
- set-state の作成・更新（`.agentdev/` 配下、req-units と draft の配置外。set-state 永続化契約に従う）
- git タグ作成・push（リリース時。版番号・リリース条件・公開操作はパッチリリース規則の Decision に従う）
- 追加公開成果物の対応（ADF本体では GitHub Release の草稿作成・読み戻しと、公開権限の確認で利用者が公開を明示承認した場合の公開（カタログ内操作 release_publish。承認根拠必須・draft 解除のみ）までを Custom Tool カタログ経路で実行する。公開は利用者が草稿作成とは別に明確に認めた場合に限る）
- 当該 Workflow Skill は worktree root 配下以外を編集しない

## 制御平面（STEP 一覧）

backlog-auto workflow は次の11 STEP で構成する。
各 STEP は再開ポイント（resume point）を持ち（DEC-{N}、`<foundations/v4-durable-state-and-recovery>` Design）、会話コンテキストに依存せず、永続状態（`backlog_auto_started_at`、set-state、各子コマンドの永続状態）から再開点を再構成する。
STEP 番号は既存 STEP（STEP-1〜6）の契約を維持したままの追加順を反映し、実行順序は「STEP 間の依存と分岐」の定義を正とする。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 開始時刻記録・進行状態初期化 | backlog-auto 起動 | 開始時刻記録、永続状態からの進行状態再構成 | [references/stage-execution.md](references/stage-execution.md) |
| STEP-2 | stage 1: inspect-docs 実行 | 開始時刻記録済み | 検出事項生成または検出事項なし完了 | [references/stage-execution.md](references/stage-execution.md) |
| STEP-3 | stage 2: 昇格3系統実行 | stage 1 正常終了 | 系統別実行結果（正常完了 / 対象なし終了 / blocked / failed / 未完了） | [references/stage-execution.md](references/stage-execution.md) |
| STEP-4 | 合流判定（fan-in） | 3系統の結果受領 | backlog-review 開始可否の判定 | [references/fan-in-and-reporting.md](references/fan-in-and-reporting.md) |
| STEP-5 | stage 3: backlog-review 実行 | 合流判定が開始可 | RU 生成、成功成果物削除（backlog-review 公開契約どおり） | [references/fan-in-and-reporting.md](references/fan-in-and-reporting.md) |
| STEP-6 | 完了報告 | 全工程完了 または 停止（一気通貫実行時は STEP-11 完了後） | 工程別結果、停止理由、再開コマンド提示、一気通貫実行結果を含む実行結果報告 | [references/fan-in-and-reporting.md](references/fan-in-and-reporting.md) |
| STEP-7 | set-state 初期化・基準点確定 | stage 3 正常完了、承認確定 RU 一式が存在 | set-state 作成（一式識別子、義務スナップショット、対応表、基準点情報）、開始コミット ID 記録 | [references/end-to-end-execution.md](references/end-to-end-execution.md) |
| STEP-8 | stage 4: 要件定義接続 | set-state 初期化済み | 単一要件doc 確定（単一 req-define 実行、入力は一式 RU の明示列挙） | [references/end-to-end-execution.md](references/end-to-end-execution.md) |
| STEP-9 | stage 5: 実行接続 | 要件doc 確定 | 単一 case-auto 実行の完了または停止（要件doc 明示指定） | [references/end-to-end-execution.md](references/end-to-end-execution.md) |
| STEP-10 | stage 6: 全体完了判定 | case-auto 完了、または再開時に set-state 上で実行済みと確定 | 完遂 / 未完遂判定（義務スナップショットと対応表による突合） | [references/end-to-end-execution.md](references/end-to-end-execution.md) |
| STEP-11 | stage 7: リリース | 完遂、リリース条件・公開権限の成立 | タグ作成、Release 草稿作成・読み戻し確認、承認時の Release 公開（release_publish）、リリース状態記録（公開実行形態を含む）/ 完遂済み・リリース保留 | [references/end-to-end-execution.md](references/end-to-end-execution.md) |

### STEP 間の依存と分岐

- **正常経路（整理サイクルのみ）**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 →（一式 RU なし）→ STEP-6
- **正常経路（一気通貫）**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 →（一式 RU あり）→ STEP-7 → STEP-8 → STEP-9 → STEP-10 → STEP-11 → STEP-6
- **stage 1 停止経路**: STEP-2 で inspect-docs が blocked / failed → 下流工程（stage 2、stage 3、stage 4〜7）を開始せず STEP-6（停止報告）
- **合流判定不合格経路**: STEP-4 で1系統でも blocked、failed、未完了 → backlog-review を開始せず STEP-6（停止報告、全体完了報告の抑制）
- **基準点確定不能経路**: STEP-7 で初期状態・到達不能正式タグ等により基準点を確定できない → stage 4〜7 を開始せず STEP-6（停止報告、利用者判断要求）
- **一式分割経路**: STEP-8 の req-define 壁打ちで複数要件docへの分割が判断された → 分割判断を再スコープとして set-state に記録し、分割後の各一式は独立した一気通貫ライフサイクル（基準点確定から）で扱う
- **要件定義停止経路**: STEP-8 で req-define が blocked / failed → STEP-9 以降を開始せず STEP-6（停止報告、set-state に進捗記録）
- **実行停止経路**: STEP-9 で case-auto が blocked / failed → STEP-10 以降を開始せず STEP-6（停止報告、set-state に進捗記録、停止報告には case-auto 単独の再開入口と一式再開経路（backlog-auto 再実行）を併記）
- **完遂不成立経路**: STEP-10 で義務・検証結果の突合が成立しない → 完遂とせず STEP-6（全体完遂不成立の報告。不足内容と再開経路を含める）
- **リリース保留経路**: STEP-11 でリリース条件・公開権限が不成立 → タグ・リリースを作成せず「完遂済み・リリース保留（理由記録）」として STEP-6 へ（報告）。backlog-auto 再実行はリリース段階から再開する
- **公開途中失敗経路**: STEP-11 の公開途中で失敗・中断 → 既存結果を読み戻し、読み戻し再開可能な状態で報告する（タグの移動・再作成、第二のパッチ番号の消費は行わない）
- **系統内再開**: STEP-3 の各系統は子ワークフローの既存再開契約（STEP model、永続状態）で系統内の再開点から再開する
- **一式再開**: STEP-7〜11 の中断時は set-state から同じ一式の対象と進捗を復元し、未完了部分から再開する

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: `backlog_auto_started_at`、stage 1 の完了証跡（直近 inspect-docs 実行の検出事項ファイル群または検出事項なし完了）、stage 2 系統別の永続状態（learning は `inbox.md` / `deferred.md` / `evaluation-report.md` / `promoted/`、intake は `inbox/` と `promoted/` の実ファイル状態、inspect は `inbox/` と `promoted/` と auto-promote-log）、stage 3 の永続状態（各 `promoted/` 残存成果物、`.agentdev/backlog/req-units/` の `RU-*.md` 実ファイル）、stage 4〜7 の set-state（一式識別子、義務スナップショット、対応表、基準点情報、stage 別進捗、リリース状態）
- 完了済み工程を重複実行せず、未完了工程を完了済みと誤認しない。確定不能な工程は未完了として扱う
- RU 生成後・要件定義後・Issue 生成後・実行中のいずれで中断しても、set-state から同じ一式の対象と進捗を復元し、未完了部分から再開する。stage 5 の実行再開は case-auto 単独の再開入口契約（Root Case 指定の再開）を利用する
- backlog-auto の再実行は set-state から完遂済み Case を検出し、全体完了判定（stage 6）以降の段階から再開する。実装を再実行しない
- inspect-docs は STEP model 対象外であり、実行途中の中断時は先頭から再実行する
- 停止時報告に再開点と再開可能な次コマンド（`/agentdev/backlog-auto` 再実行、または対象子コマンドの単独実行。stage 5 停止時は case-auto 単独の再開入口を併記）を明示し、会話コンテキストの記憶に依存しない

### 終了条件（termination）

- 正常終了: stage 3（backlog-review）完了後の一式 RU 不存在時の完了報告、または stage 6〜7（全体完了判定とリリースまたはリリース保留）完了後の完了報告（全系統対象なし終了であっても backlog-review 実行後の完了報告を含む）
- 停止終了: inspect-docs の blocked / failed（下流非開始）、合流判定不合格（blocked / failed / 未完了残存時の backlog-review 非開始）、基準点確定不能、要件定義・実行の blocking 停止伝播、全体完遂不成立、公開途中失敗のいずれかの検出時（停止理由分類済み報告）
- 完遂済み・リリース保留: 一式完遂後にリリース条件・権限が不成立の場合、完遂は完了扱いとし、リリース保留（理由記録）として報告する。backlog-auto 再実行はリリース段階から再開する

## 下位 Workflow Skill 連携（上位 orchestrator）

本スキルは上位 orchestrator として次の下位 Workflow Skill を名レベルで参照する。
下位 workflow の契約詳細を複製しない。

- `agentdev-workflow-inspect-docs`: stage 1 工程（診断専用、STEP model 対象外、中断時は先頭再実行）
- `agentdev-workflow-learning-promote`: stage 2 learning 系統
- `agentdev-workflow-intake-promote`: stage 2 intake 系統
- `agentdev-workflow-inspect-promote`: stage 2 inspect 系統（`--auto` は子コマンドの明示 opt-in のみで有効化され、本 workflow の通常実行では渡さない）
- `agentdev-workflow-backlog-review`: stage 3 工程
- `agentdev-workflow-req-define`: stage 4 工程（要件定義接続。req-define 自体の壁打ち・承認境界を保存する接続であり、壁打ちを自動化しない）
- `agentdev-workflow-case-auto`: stage 5 工程（実行接続。要件doc 明示指定の単一実行。並列実行制御、依存判断、再開入口は case-auto 側の既存契約の所有であり、本スキルは再定義しない）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する。

- `agentdev-project-extensions`: project extension 読込
- 各子ワークフローが依存する Capability Skill（`agentdev-learning-pipeline`、`agentdev-intake-pipeline`、`agentdev-backlog-integration` 等）は各子 Workflow Skill 経由で継承され、本スキルから直接参照しない

## set-state 永続化契約（一気通貫実行）

一式の運搬体となる set-state の契約は次のとおりである。詳細（配置、形式、単一書き手規則、基準点確認手続、全体完了突合手続、リリース手順シーケンスと再開経路、公開操作の実行経路）は [references/end-to-end-execution.md](references/end-to-end-execution.md) を参照する。

- set-state は一式識別子、必須要求と受け入れ義務のスナップショット、RU・要件doc・operation_unit・実行単位の対応表（統合・分割を含む）、基準点情報（最後の正式リリース、開始コミット ID）、stage 別進捗、リリース状態（未着手／基準点確定済み／保留理由／完了。完了には公開実行形態（workflow 実行／代行／利用者手動）と、workflow 実行時は承認根拠の参照を含める）を記録する
- 配置は `.agentdev/` 配下で req-units と draft の配置外とし、ドラフト残存・RU 残存を検証するクリーンアップ検証ゲートの対象外とする。全体完了とリリース完了まで保持する
- set-state への書込みは同一 backlog-auto 実行に限定する（単一書き手規則）。backlog-auto の二重起動に対しては既存の single-flight 保護に準じて排除する
- 一式全体の完遂判定と最終報告は一気通貫実行の REQ が所有し、backlog 整理サイクルの実行契約 REQ の完了扱い・全体報告（backlog 整理サイクル部分に係る行）と分離する

## 重要変更の通知と結果説明

backlog-auto は、一気通貫実行（stage 4〜7、backlog 整理サイクル、req-define、case-auto の接続を含む）において、子ワークフローの重要変更の通知が親側の実行・結果報告によって失われず、利用者に提示されることを維持する。stage 4〜7 の各工程の接続と STEP-6 完了報告で、子ワークフロー・委譲実行から判明した重要変更の通知を収集して提示する。同一の意味を持つ重要変更は、利用者が理解する変更単位に集約し、ファイルごと・工程ごと・委譲先ごとの実質的な重複通知を繰り返さない。新たな重要な影響の判明は、重複通知と区別して追加説明する。

一気通貫全体の完了報告（STEP-6）には、重要変更に関する実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める。事前通知したが実施しなかった変更を実施済みと報告せず、一部成功・一部失敗・未確認・中断を実際の成立状況に応じて区別して報告する。中断・失敗・再開時には、中断時点で判明していた重要変更と未提示の通知を停止報告へ含め、再開時に同じ内容の重複通知を繰り返さず、残る未提示分から提示する。

既存の利用者判断境界（backlog-review の RU 承認、req-define の壁打ち、リリース条件・公開権限の確認）を維持し、通知で代替しない。通知のみを理由とする新たな一律停止を設けない。重要変更の意味判断は各子ワークフローが局所所有し、backlog-auto は伝達と集約を担う。

## 共通制約

- **soft guard**: 本スキルは `/agentdev/backlog-auto` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わない
- **順序ゲート**: inspect-docs が正常終了する前に昇格3系統を開始しない。昇格3系統すべてが正常完了または対象なしで終了する前に backlog-review を開始しない。stage 3 が正常完了し承認確定 RU 一式が存在する場合を除き、stage 4〜7 を開始しない。基準点が確定できない場合、stage 4〜7 を開始しない
- **直列化契約**: 競合する Git 操作（同期、commit、push）、共有成果物への競合書き込み、ユーザー対話は直列化する。ユーザー対話は系統識別付きで表示する
- **HITL 境界の維持**: 各子ワークフローの HITL 境界、安全境界、停止条件、自動昇格 opt-in を子ワークフロー側の所有として維持する。req-define の壁打ち・承認、backlog-review の RU 承認、リリース条件・公開権限の確認を自動化しない
- **一式対象の限定**: 一気通貫実行の対象は当該実行の backlog-review で承認確定した RU 一式に限定し、一式と無関係な既存 RU・ドラフト・Issue を取り込まない。一式の統合・分割後も元の要求と後続対象の対応を set-state の対応表で維持する
- **単一実行への写像**: 一式は単一の req-define 実行（入力は一式 RU の明示列挙）で処理し、単一の要件doc に確定する。実行は当該要件doc を明示指定した単一の case-auto 実行として接続する。引数なし全件処理と個別ドラフトごとの複数 case-auto 起動を用いない
- **並列実行の維持**: 一式から複数の独立した実行可能 Issue が生じた場合の並列実行は、case-auto 側の既存の共有 active Issue task 上限と横断補充に従う。一式を複数グループへ分断して先行グループの全完了を待つ逐次化を行わない
- **完遂判定の厳格化**: 一式全体の完遂は、set-state の義務スナップショットと対応表を正として、要件定義・実行対象・検証結果の過不足ない突合と必要な範囲の検証結果の成立によってのみ判定する。個別の Issue 終了・PR merge のみで完遂としない
- **版管理の境界**: 一式の実行開始時に基準点（最後の正式リリース、開始コミット ID）を確定し、完遂前に新規のタグ・リリースを作成しない。リリースは完遂・リリース条件・公開権限がすべて成立した場合に限り行い、タグの移動・再作成、同一実行での二つの版番号の消費、major/minor 自動判定を行わない
- **単一書き手**: set-state への書込みは同一 backlog-auto 実行に限定する。二重起動は single-flight 保護に準じて排除する
- **部分停止の非連鎖**: 1系統の blocked、failed で独立して進行可能な他系統を停止しない。blocked、failed、未完了残存時は backlog-review を開始せず、全体完了を報告しない
- **対象なしの正常扱い**: 昇格3系統の対象なし終了は正常終了として扱う。新規 promoted 0件でも backlog-review を実行する（実行前から存在する promoted を処理対象にできる）。一式 RU が 0 件の場合は一気通貫実行（stage 4〜7）を開始せず、リリースを作成せずその旨を報告する
- **親コンテキスト非累積**: 系統別の完了結果（結果状態、出力パス、次アクション）のみを親コンテキストに保持し、系統内部の調査過程、中間ログ、読解メモを親コンテキストに累積しない
- **実装分類**: manager-orchestrator（既存の実装分類を利用）。子ワークフロー内部の分類、評価、昇格、RU 生成ロジックは子 Workflow Skill の責務であり、本スキルは工程間の順序制御と一気通貫実行の接続制御のみを所有する

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<foundations/v4-durable-state-and-recovery>` Design**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **一気通貫実行の実行契約 REQ とパッチリリース規則の Decision（accepted）**: 一気通貫実行の要求（単一起動、set-state、完遂判定、版管理、リリース条件）と版番号規則・リリース条件・公開操作の正
- **backlog-auto command**: 本スキルの呼出元（公開 interface、ガードレール、dispatch を所有）
