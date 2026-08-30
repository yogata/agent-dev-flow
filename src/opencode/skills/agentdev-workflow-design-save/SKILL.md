---
name: agentdev-workflow-design-save
description: "design-save command の workflow 実装本体。req-define で分離された Design 保存対象（artifact: design entry）の保存・確定を行う制御を所有する。事前チェック（no-op 判定）、配置先解決、Design ファイル操作（target_area セクション置換、Design 宣言付与）、インデックス整合、targeted docs guard、ドラフト status 更新、変更範囲検証、コミット・プッシュも含む。USE FOR: design-save 実行時の workflow 制御（normal create/update・no-op・validation failure・partial failure・rerun idempotency・commit 前中断・external Git failure 各シナリオ）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# design-save workflow スキル

design-save command の workflow 実装本体である。
req-define で分離された Design 保存対象（`draft-data` の `artifact_actions` 内 `artifact: design` entry）を `docs/designs/<**/*>.md` に保存、確定する制御構造を所有する。
req-save の次、case-open の前に実行する。
req-save のファイル編集スコープ制約（Design 編集禁止）を緩和するものではなく、Design 保存を独立責務として切り出す。
全 work_type 対象であり、`work_type` による判定は廃止する。

design-save command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define が生成し req-save が REQ 保存済みのドラフト。`draft-data` の `artifact_actions` に `artifact: design` entry を含む）

## 出力

- `docs/designs/<**/*>.md`（既存 Design への追記 or 新規 Design 作成）
- `.agentdev/drafts/req-draft-{topic-slug}.md`（Design artifact_actions 消費済みフラグの status 更新）

## 副作用

- `docs/designs/**` と `.agentdev/drafts/**` のみ作成・編集（`docs/designs/README.md` は Design 操作に付随する更新のみ）
- main ブランチへの commit・push（明示パスステージ、`agentdev-git-worktree` プロシージャ準拠）
- Issue は作成しない（case-open の責任範囲）

## 制御平面（STEP 一覧）

design-save workflow は次の11 STEP で構成する。
各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`docs/designs/<workflows/step-reference-contract>.md`）。
会話コンテキストに依存せず、永続状態（draft の Design 消費済みフラグ、Design ファイルの存在と frontmatter `status`、`docs/designs/README.md` エントリ、git 状態）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 事前チェック | design-save 起動 | 処理要否判定（no-op or 継続） | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-2 | Design artifact_actions 読込 | 処理対象あり | 処理対象 entry（target、operation、content）確定 | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-3 | 配置先解決 | entry 確定 | 配置先 Design（既存 or 新規）解決、target_area 判定 | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-4 | Design 分離基準の最終確認 | 配置先解決済み | 適合判定（安定契約例外は除外し follow-up 明示） | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-5 | Design ファイル操作 | 適合判定済み | Design create / update 実行（並列化、宣言付与） | [references/placement-and-save.md](references/placement-and-save.md) |
| STEP-6 | インデックス整合 | ファイル操作完了 | 新規 Design の README 一覧登録（check-entry-existence 検証） | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-7 | Design 一覧整合確認 | インデックス整合完了 | targeted docs guard、extension 更新要否確認、Design バッチ更新時の参照先用語実在確認 | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-8 | ドラフト status 更新 | 一覧整合確認完了 | Design 消費済みフラグ（commit 対象に含む） | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-9 | 変更範囲検証 | status 更新済み | check-change-impact 検証 | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-10 | コミット・プッシュ | 変更範囲検証合格 | 明示パス commit、push | [references/verification-and-persistence.md](references/verification-and-persistence.md) |
| STEP-11 | 完了報告 | push 完了 | 保存した Design 一覧、スキップ、follow-up 報告 | [references/verification-and-persistence.md](references/verification-and-persistence.md) |

### STEP 間の依存と分岐

- **標準経路**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6 → STEP-7 → STEP-8 → STEP-9 → STEP-10 → STEP-11
- **no-op 経路**: STEP-1 で `artifact: design` entry がない場合（旧形式 draft 含む）、no-op で完了
- **部分スキップ**: STEP-3 で配置先 Design 特定不能な候補は当該候補をスキップし follow-up 明示（全体中止しない）。STEP-4 で安定契約例外相当は除外し follow-up に明示
- **並列化**: 異なる `target` パスの Design create/update は並列化可能（最大5件）。同一 Design ファイルへの複数 action は順序依存のため直列サブセットとして分離する

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: draft の Design 消費済みフラグ、Design ファイルの存在と frontmatter（`status`、`updated`）、`docs/designs/README.md` のエントリ、`git status`
- commit 前中断時は `git diff --name-only` で変更ファイルを再検出し、未実行 STEP から再開する。Design 消費済みフラグの更新は commit/push より前に実施し commit 対象に含める
- partial failure 時は保存済み Design（永続状態）を残したまま未完了 action のみ再処理する（rerun idempotency）。external Git failure 時はエラー報告し、同一状態からリトライ可能な STEP を明示する

### 終了条件（termination）

- 正常終了: STEP-11 の完了報告出力まで（no-op 時は STEP-1 の no-op 完了）
- 停止終了: ドラフト不存在（エラーで中止、req-define を案内）、`artifact_actions` 形式不正（エラーで中止し req-define 差し戻し推奨）、変更範囲検証違反（ユーザーへ報告し指示待ち、自動破棄禁止）
- Design status は新規作成時 `draft` のみ付与し、既存追記時は変更しない。`accepted` 昇格は case-close の責務

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-design-file-manager`: Design ファイル操作、配置判断、target_area マッチング規則、Design ライフサイクル適用、決定的スクリプト呼出契約（search-target-area.ts）、複数 action 並列化
- `agentdev-artifact-validation`: 公開検証契約（check-entry-existence、check-change-impact）
- `agentdev-conventional-commits`: commit message 生成
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（明示パスステージ、`git commit -- <paths>`）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- integrity checker skill（AG-{NNN} detector、repo 固有）: check_changed_docs.ts（--workflow design-save）

## トレーサビリティ能力の利用

design-save は、req-define で Design action と対象要件の対応が明示的に確定している場合、その情報を利用して Design 文書と要件の対応関係を対応宣言として正規成果物へ保存できる。
対応宣言の表記仕様は `agentdev-traceability` Design「対応宣言の表記」が正規所有し、本スキルは表記仕様を再定義しない。

- Design 本文の自由記述から対象要件を再推論して正規の対応関係を生成しない
- Design 文書の対応付けは任意とし、Design action が存在しない要件の処理を妨げない
- 対応 REQ、同一 canonical owner の Design、関連 command、skill、integrity rule の探索（STEP-3 配置先解決、STEP-4 Design 分離基準の最終確認）は、README 索引、正規成果物の直接読取、`rg` 等の独立探索手段で行う（agentdev-traceability を一般文書探索、依存関係探索へ利用しない）
- 中断後の再実行では、正規成果物に保存済みの対応宣言を再利用し、同じ対応宣言を重複生成しない

## 共通制約

- **工程分岐**: `artifact: design` entry の有無で判定する（全 work_type 対象、`work_type` による判定は廃止）
- **Design ライフサイクル**: 新規作成時 `status: draft`、既存追記時 `status` 変更なし。遷移契機の詳細は `agentdev-design-file-manager` の design-lifecycle-application を正とする
- **再分類禁止**: Design artifact_actions の分離根拠、配置先判定は req-define（`agentdev-req-analysis`）の結果を尊重し、design-save で再分類しない
- **実行時非依存**: Design ファイルは実行時コマンドが依存する記述にしない（command 不変条件）
- **Issue 作成禁止**: design-save は Issue を作成しない（case-open の責任範囲）

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **design-save command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
