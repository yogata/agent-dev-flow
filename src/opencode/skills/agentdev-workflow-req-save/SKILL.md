---
name: agentdev-workflow-req-save
description: "req-save command の workflow 実装本体。壁打ち成果物（draft-data）をREQ/Decisionファイルとしてdocs/に保存し、コミット・プッシュする制御を所有する。事前チェック（no-op 判定）、REQ ファイル操作と適用結果整合性検証、検証対応要否未分類行の検出・記録（保存は失敗させない）、インデックス・ハブ更新、Decision ファイル作成、docs 変更整合性検証、変更範囲検証、ドラフト status 更新（saved）も含む。USE FOR: req-save 実行時の workflow 制御（normal create/update・no-op・validation failure・partial failure・rerun idempotency・commit 前中断・external Git failure 各シナリオ）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# req-save workflow スキル

req-save command の workflow 実装本体。
req-define で生成された壁打ち成果物をREQ/Decisionファイルとしてdocs/に保存し、コミット・プッシュする制御構造を所有する。
`work_type` による消費判定は廃止し、`artifact_actions` の有無で判定する。

req-save command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define で生成されたドラフト）

## 出力

- `docs/requirements/REQ-{NNNN}.md`（新規/追記/更新）、`docs/requirements/README.md`、`docs/README.md`
- `docs/decisions/<DEC-NNN>.md`（Decision判断がある場合のみ）
- `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（SPLIT検出時のみ）
- `.agentdev/intake/inbox/req-restructure/*.md`（REQ再構成候補検知時のみ）

## 副作用

- docs/ 配下のファイル作成・更新（req-save command の許可パスのみ）、ドラフト status 更新
- main ブランチへの commit・push（明示パスステージ、`agentdev-git-worktree` プロシージャ準拠）
- Issue は作成しない（case-open の責任範囲）

## 制御平面（STEP 一覧）

req-save workflow は次の12 STEP で構成する。
各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`docs/designs/<workflows/step-reference-contract>.md`）。
会話コンテキストに依存せず、永続状態（draft の `status` frontmatter、REQ/Decision ファイル、README エントリ、commit hash、git 状態）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 事前チェック | req-save 起動 | 処理要否判定（no-op or 継続） | [references/precheck-and-req-ops.md](references/precheck-and-req-ops.md) |
| STEP-2 | ドラフト読込 | 処理対象あり | ドラフト読込済み、読込時 commit hash 記録 | [references/precheck-and-req-ops.md](references/precheck-and-req-ops.md) |
| STEP-3 | ドラフト検証・処理対象確定 | ドラフト読込済み | 必須フィールド検証、処理対象 entry 確定 | [references/precheck-and-req-ops.md](references/precheck-and-req-ops.md) |
| STEP-4 | REQ ファイル操作 | 処理対象確定 | REQ/Decision ファイル保存（QG-1 相当検証、決定的スクリプト適用、検証対応要否未分類行の検出・記録） | [references/precheck-and-req-ops.md](references/precheck-and-req-ops.md) |
| STEP-5 | インデックス・ハブ更新 | REQ ファイル操作完了 | README エントリ登録（check-entry-existence 検証済み） | [references/indexes-and-persistence.md](references/indexes-and-persistence.md) |
| STEP-6 | Decision ファイル作成 | `artifact: decision` entry 存在 | Decision ファイル作成、ハブ追記 | [references/indexes-and-persistence.md](references/indexes-and-persistence.md) |
| STEP-7 | docs 変更整合性検証 | ファイル操作完了 | REQ番号連続性、frontmatter id↔ファイル名整合 | [references/indexes-and-persistence.md](references/indexes-and-persistence.md) |
| STEP-8 | README 索引影響確認 | 整合性検証完了 | 索引更新、targeted docs guard、extension 更新要否確認 | [references/indexes-and-persistence.md](references/indexes-and-persistence.md) |
| STEP-9 | 変更範囲検証・リモート同期 | 索引確認完了 | check-change-impact 検証、pull と hash 一致検証 | [references/indexes-and-persistence.md](references/indexes-and-persistence.md) |
| STEP-10 | ドラフト status 更新 | 変更範囲検証合格 | `status: saved`（commit 対象に含む） | [references/indexes-and-persistence.md](references/indexes-and-persistence.md) |
| STEP-11 | コミット・プッシュ | status 更新済み | 明示パス commit、push、OU 結果書き戻し | [references/indexes-and-persistence.md](references/indexes-and-persistence.md) |
| STEP-12 | 完了報告 | push 完了 | 種別別完了報告 | [references/indexes-and-persistence.md](references/indexes-and-persistence.md) |

### STEP 間の依存と分岐

- **標準経路**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → (STEP-6) → STEP-7 → STEP-8 → STEP-9 → STEP-10 → STEP-11 → STEP-12
- **no-op 経路**: STEP-1 で REQ/Decision 対象 artifact_actions がない場合、no-op 完了（後続の case-open へ進むよう完了報告で案内）
- **エラー停止**: STEP-3 の必須フィールド欠損、STEP-4 の QG-1 fail（req-define へ差し戻し）、STEP-9 の変更範囲違反（ユーザーへ報告し指示待ち）
- **並列委譲**: 複数 REQ/Decision ファイル操作は3フェーズ分離（採番バッチ[直列] / ファイル作成[並列・最大5件] / インデックス更新[直列]）で並列化できる

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: draft の `status` frontmatter（`saved` であれば commit/push 済み）、REQ/Decision ファイルの存在、README エントリの存在、`git log` の commit、読込時 hash と pull 後 hash の一致
- commit 前中断時は `git status` と `git diff --name-only` で変更ファイルを再検出し、未実行 STEP から再開する。`status: saved` への更新は commit/push より前に実施し commit 対象に含める（push 後の status 更新は永続化されないため禁止、command 不変条件）
- external Git failure（pull 失敗、push 拒絶）時はエラーを報告し、同一永続状態からリトライ可能な STEP を明示する

### 終了条件（termination）

- 正常終了: STEP-12 の完了報告出力まで（no-op 時は STEP-1 の no-op 完了報告）
- 停止終了: ドラフト不存在（エラーで中止、req-define を案内）、必須フィールド欠損、QG-1 fail（req-define 差し戻し）、変更範囲違反（ユーザー指示待ち）、hash 不一致（評価・承認のやり直し）
- Issue は作成しない。`artifact: design` entry は処理しない（design-save の対象）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-req-file-manager`: REQ ファイル操作の判定ロジック、採番ルール、3フェーズ分離詳細、決定的スクリプト呼出契約（CREATE/APPEND/UPDATE 候補、SPLIT 候補、REQ 再構成候補はサブエージェントが返し、親エージェントがファイル保存）
- `agentdev-decision-file-manager`: Decision ファイル作成、採番ルール（max+1、欠番埋め禁止）
- `agentdev-artifact-validation`: 公開検証契約（check-frontmatter-consistency、check-entry-existence、check-change-impact、決定的採番）
- `agentdev-quality-gates`: QG-1（適用結果の整合性検証）
- `agentdev-conventional-commits`: commit message 生成
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（明示パスステージ、`git commit -- <paths>`）
- `agentdev-workflow-orchestration`: capture 境界（deviation capture の委譲）
- `agentdev-traceability`: 検証対応要否未分類行の導出（check。分類状態の導出定義はトレーサビリティモデル「対応関係の完全性規則」が所有）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- integrity checker skill（AG-{NNN} detector、repo 固有）: check_changed_docs.ts（targeted docs guard）

## 共通制約

- **工程分岐**: `work_type` 固定分岐ではなく `artifact_actions` の有無で判定する（判定基準の詳細は `agentdev-workflow-lifecycle` 参照）
- **Issue 作成禁止**: req-save は Issue を作成しない（case-open の責任範囲）
- **capture 非関与**: intake/learning capture は原則行わない。例外は REQ 再構成 intake（`.agentdev/intake/inbox/req-restructure/**`）のみ生成可。deviation capture は Skill（`agentdev-learning-capture` または `agentdev-intake-pipeline`）への委譲で実施する
- **内容品質の再検証なし**: req-save の QG-1 は適用結果の整合性のみ検証し、内容の品質は req-define の QG-1 の責務
- **成果物本文 verbatim**: 成果物本文は verbatim で返す。判定結果、調査過程、中間ログは要約・圧縮して返す
- **検証対応要否の段階ゲート（検出・記録面）**: 保存対象の新規 REQ または追加要件行のうち検証対応要否が未分類（検証対応宣言が存在せず、検証対応要否カタログにも未登録）の行を検出し、未分類行として保存結果に明示的に記録する。未分類行の存在だけを理由として保存を失敗させない。分類の完了は case-open 側の停止条件が担う（判定方法の詳細は STEP-4 reference）

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **req-save command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
