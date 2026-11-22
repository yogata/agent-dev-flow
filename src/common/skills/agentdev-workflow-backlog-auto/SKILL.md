---
name: agentdev-workflow-backlog-auto
description: "backlog-auto command の workflow 実装本体。orchestration stage 構成（7 stage）、fan-in 判定、set-state 永続化、基準点確認手続、全体完了突合手続、リリース手順と再開経路、停止伝播、resume 契約を所有する。USE FOR: backlog-auto 実行時の workflow 制御（工程間順序制御、昇格3系統の並行実行と競合処理の直列化、fan-in 判定、一気通貫実行の接続、停止伝播、再開）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）、子ワークフロー内部の分類、評価、昇格、RU 生成ロジックの所有（各子 Workflow Skill が正規の処理主体）、Epic/Wave 構成規則・共有並列上限・依存判断・並列実行アルゴリズムの再定義。"
---
# backlog-auto workflow スキル

backlog-auto command の workflow 実装本体である。backlog 整理サイクルの工程間制御と、承認確定 RU 一式の一気通貫実行の接続制御を所有し、子の内部ロジックは各子の所有として複製しない。

## 入力

- 引数なし。対象状態は各子の永続状態と set-state から解決する

## 出力

- 各子の既存出力
- 全体の実行結果報告
- 一気通貫の実行結果報告

## 副作用

- 子ワークフローの既存副作用を公開契約どおりに発生させる
- set-state の作成・更新
- git タグ作成・push、Release 草稿作成・読み戻し、明示承認時の公開（承認根拠必須）
- worktree root 配下以外を編集しない

## 制御平面（STEP 一覧）

backlog-auto workflow は次の11 STEP で構成する。
詳細: STEP-1〜3 stage-execution.md、STEP-4〜6 fan-in-and-reporting.md、STEP-7〜11 end-to-end-execution.md。

| STEP | 名称 | 結果 |
|---|---|---|
| STEP-1 | 開始時刻記録・進行状態初期化 | 初期化 |
| STEP-2 | stage 1: inspect-docs | 検出事項またはなし |
| STEP-3 | stage 2: 昇格3系統 | 系統別結果 |
| STEP-4 | 合流判定（fan-in） | 可否判定 |
| STEP-5 | stage 3: backlog-review | RU 生成、成功成果物削除 |
| STEP-6 | 完了報告 | 実行結果報告 |
| STEP-7 | set-state 初期化・基準点確定 | 作成、基準点記録 |
| STEP-8 | stage 4: 要件定義接続 | 要件doc 確定 |
| STEP-9 | stage 5: 実行接続 | 完了または停止 |
| STEP-10 | stage 6: 全体完了判定 | 完遂・未完遂判定 |
| STEP-11 | stage 7: リリース | リリース対象コミットでのリポジトリ全体の試験の実行・受理証拠確認（正式版タグ作成前。fail-closed）、タグ作成、Release 草稿作成・読み戻し確認、承認時の Release 公開（release_publish）、リリース状態記録（公開実行形態を含む）/ 完遂済み・リリース保留 |

### STEP 間の依存と分岐

- **正常経路（一気通貫）**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 →（一式 RU あり）→ STEP-7 → STEP-8 → STEP-9 → STEP-10 → STEP-11 → STEP-6
- **stage 1 停止・合流判定不合格経路**: inspect-docs・系統の blocked / failed / 未完了残存 → 下流・backlog-review 非開始で STEP-6
- **基準点確定不能経路**: stage 4〜7 非開始で STEP-6
- **一式分割経路**: req-define の壁打ちで分割が判断された → 分割判断を set-state に記録し、分割後の各一式は独立した一気通貫ライフサイクル（基準点確定から）で扱う
- **実行停止経路**: case-auto が blocked / failed → STEP-10 以降非開始で STEP-6（停止報告には case-auto 単独の再開入口と一式再開経路（backlog-auto 再実行）を併記）
- **完遂不成立経路**: 突合不成立 → 完遂とせず STEP-6
- **リリース保留経路**: STEP-11 でリリース条件・公開権限が不成立、またはリリース前全試験確認で全試験未実施・対象コミット不一致・不合格・証拠不足・実行不能が検出された場合 → タグ・リリースを作成せず「完遂済み・リリース保留（理由記録）」として STEP-6 へ（報告）
- **公開途中失敗経路**: 公開途中の失敗・中断 → 既存結果を読み戻して報告

### 再開プロトコル

- 再開点は永続状態から再構成する: `backlog_auto_started_at`、promoted 残存・`RU-*.md`、stage 4〜7 の set-state
- 完了済み工程を重複実行せず、未完了工程を完了済みと誤認しない。確定不能な工程は未完了として扱う
- RU 生成後・要件定義後・Issue 生成後・実行中のいずれで中断しても、set-state から同じ一式の対象と進捗を復元し、未完了部分から再開する。stage 5 の実行再開は case-auto 単独の再開入口契約（Root Case 指定の再開）を利用する
- **一式再開**: STEP-7〜11 の中断時は set-state から同じ一式の対象と進捗を復元し、未完了部分から再開する
- backlog-auto の再実行は set-state から完遂済み Case を検出し、全体完了判定（stage 6）以降の段階から再開する。実装を再実行しない
- 停止報告に再開点と次コマンドを明示し、会話記憶に依存しない

### 工程・投入境界のチェックポイントとハンドオフ（正規原本は backlog-auto Design「工程境界チェックポイント」節）

- inspect/promote 収束後（STEP-3/4）、backlog-review/RU 生成後（STEP-5）、req-define 完了後（STEP-8）、case-auto バッチ投入後（STEP-9）の各工程境界で、成立した永続状態に対応するハンドオフを出力できる
- ハンドオフには、入力集合または一式識別子、成立を裏付ける既存ファイルと set-state（作成済みの場合）、git の参照、関連 Issue/PR 番号、既存の再開入口を含める。子の詳細は「親セッション向け委譲結果サマリ」から必要な範囲だけ参照する
- 新規セッションでは既存の証拠と正規状態を突合し、未完了部分のみを冪等に継続する。昇格の合流、承認、一式完了判定、リリース条件を保ち、通常の一回起動に手動コマンド入力を追加しない
- チェックポイントは終了済みの証拠でも、新しい工程状態の正本でもない

### 終了条件

- 正常終了: 一式 RU 不存在時または stage 6〜7 完了後の完了報告
- 停止終了: 上記分岐の停止条件到達時
- 完遂済み・リリース保留: 一式完遂後にリリース条件・権限が不成立の場合、完遂は完了扱いとし、リリース保留（理由記録）として報告する。backlog-auto 再実行はリリース段階から再開する

## 下位 Workflow Skill 連携

名レベルで参照し、契約詳細を複製しない。

- `agentdev-workflow-inspect-docs`: stage 1
- `agentdev-workflow-learning-promote` / `agentdev-workflow-intake-promote` / `agentdev-workflow-inspect-promote`: stage 2 各系統
- `agentdev-workflow-backlog-review`: stage 3
- `agentdev-workflow-req-define`: stage 4 工程（要件定義接続。req-define 自体の壁打ち・承認境界を保存する接続であり、壁打ちを自動化しない）
- `agentdev-workflow-case-auto`: stage 5 工程（実行接続。要件doc 明示指定の単一実行。並列実行制御、依存判断、再開入口は case-auto 側の既存契約の所有であり、本スキルは再定義しない）

## 主要 Capability Skill 連携

- `agentdev-project-extensions`: project extension 読込。子が依存する Capability Skill は子経由で継承され、直接参照しない

## set-state 永続化契約（一気通貫実行）

詳細は references/end-to-end-execution.md 参照。

- set-state は一式識別子、必須要求と受け入れ義務のスナップショット、RU・要件doc・operation_unit・実行単位の対応表（統合・分割を含む）、基準点情報（最後の正式リリース、開始コミット ID）、stage 別進捗、リリース状態（未着手／基準点確定済み／保留理由／完了。完了には公開実行形態（workflow 実行／代行／利用者手動）と、workflow 実行時は承認根拠の参照を含める）を記録する
- 配置は `.agentdev/` 配下で req-units と draft の配置外とし、ドラフト残存・RU 残存を検証するクリーンアップ検証ゲートの対象外とする。全体完了とリリース完了まで保持する
- set-state への書込みは同一 backlog-auto 実行に限定する（単一書き手規則）。backlog-auto の二重起動に対しては既存の single-flight 保護に準じて排除する
- 完遂判定と最終報告の所有は一気通貫実行の REQ。整理サイクルの完了扱いと分離

## 重要変更の通知と結果説明

一気通貫実行で子ワークフローの重要変更の通知が親側の実行・結果報告によって失われず、利用者に提示されることを維持する。子の通知は利用者が理解する変更単位に集約し、重複通知を繰り返さない。完了報告（STEP-6）には実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める。一部成功・一部失敗・未確認・中断を実際の成立状況に応じて区別して報告する。中断・失敗・再開時には通知契約に従い、利用者判断を通知で代替しない。通知のみを理由とする新たな一律停止を設けない。

## 共通制約

- **soft guard**: 本スキルは `/agentdev/backlog-auto` 工程経由でのみ利用し、単独起動しない
- **順序ゲート**: inspect-docs 正常終了前に昇格3系統、3系統完了前に backlog-review を開始しない。stage 3 が正常完了し承認確定 RU 一式が存在する場合を除き、stage 4〜7 を開始しない。基準点が確定できない場合、stage 4〜7 を開始しない
- **直列化契約**: 競合する Git 操作、共有成果物への書込み、ユーザー対話は直列化する
- **HITL 境界の維持**: 子の HITL 境界・安全境界・停止条件は子側の所有。壁打ち・承認、RU 承認、リリース条件・公開権限の確認を自動化しない
- **一式対象の限定**: 当該実行で承認確定した RU 一式に限定し、無関係な既存 RU・ドラフト・Issue を取り込まない
- **単一実行への写像**: 一式は単一の req-define 実行で単一の要件doc に確定し、明示指定の単一 case-auto 実行で接続。引数なし全件処理と複数起動を用いない
- **並列実行の維持**: 一式を複数グループへ分断して先行グループの全完了を待つ逐次化を行わない
- **完遂判定の厳格化**: set-state のスナップショットと対応表を正とする突合と検証結果の成立でのみ判定し、個別の Issue 終了・PR merge のみで完遂としない
- **版管理の境界**: 実行開始時に基準点を確定し、完遂前にタグ・リリースを作成しない。タグの移動・再作成、同一実行での二つの版番号の消費、major/minor 自動判定を行わない
- **単一書き手**: 上記 set-state 契約どおり
- **部分停止の非連鎖**: 1系統の blocked / failed で独立系統を停止しない
- **対象なしの正常扱い**: promoted 0件でも backlog-review を実行する。一式 RU が 0 件の場合は一気通貫実行（stage 4〜7）を開始せず、リリースを作成せずその旨を報告する
- **親コンテキスト非累積**: 系統別の完了結果のみ保持- **親コンテキスト非累積**: 系統別の完了結果のみ保持。子ワークフロー・委譲実行の結果の返却本文は、ステータス（報告用 `completed` / `blocked` / `failed`）、副作用有無を含む判定要約、変更ファイルパス一覧、コミット SHA、Issue/PR 番号、テスト結果の pass/fail 件数、未達事項/ブロッカー、詳細成果物パスの八項目からなる構造化サマリ（UTF-8 上限目安 3〜4 KB 以内）を受領し、長大な詳細は退避先のパス/URL 参照で到達する。完遂判定は既存の突合手続（義務スナップショット・対応表）で行う
- **実装分類**: manager-orchestrator

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 契約の正
- **`<foundations/durable-state-and-recovery>` Design**: resume point
- **`<workflows/collaboration-loop>` Design**: 要求入口ループ駆動点
- **一気通貫実行の実行契約 REQ とパッチリリース規則の Decision（accepted）**: 版番号規則・リリース条件・公開操作の正
- **backlog-auto command**: 本スキルの呼出元
