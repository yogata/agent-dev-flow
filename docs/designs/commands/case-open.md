---
title: case-open Design
status: accepted
created: 2026-06-21
updated: "2026-11-18"
---

<!-- ADF-COVERS(implementation): REQ-030-001, REQ-030-002, REQ-030-003, REQ-030-004, REQ-030-005, REQ-030-006, REQ-030-007, REQ-030-008, REQ-030-009, REQ-030-010, REQ-030-011, REQ-030-015, REQ-122-012 -->
<!-- ADF-COVERS(implementation): REQ-015-009 -->
<!-- ADF-COVERS(implementation): REQ-021-014, REQ-021-024 -->
<!-- ADF-COVERS(implementation): REQ-035-006, REQ-035-008 -->
<!-- ADF-COVERS(implementation): REQ-049-005 -->
<!-- ADF-COVERS(implementation): REQ-083-002 -->
<!-- ADF-COVERS(design): REQ-030-014, REQ-030-017, REQ-030-018, REQ-030-022 -->
<!-- ADF-COVERS(design): REQ-030-025, REQ-030-026, REQ-030-028, REQ-030-029, REQ-030-030, REQ-030-031 -->
<!-- ADF-COVERS(design): REQ-030-027 -->
<!-- ADF-COVERS(design): REQ-030-019, REQ-030-020, REQ-030-021, REQ-030-024 -->
<!-- ADF-COVERS(design): REQ-083-002, REQ-083-003 -->
<!-- ADF-COVERS(design): REQ-029-014, REQ-029-015, REQ-029-016 -->
<!-- ADF-COVERS(design): REQ-029-017 -->

# case-open Design

本 Design は骨格（公開契約と制御フロー）と references/ 詳細仕様の2層構成である。機械工程・Definition Package 確立手順・adversarial-review 挿入境界の詳細は references/case-open/ 配下へ分離している。通常経路で全 reference を無条件読込せず、必要な条件に応じて遅延読み込みする。

本 Design が定義する case-open は公開 command ではなく内部 lifecycle 段階である。公開 UX は要求入口（req-define、backlog-auto）と標準実行コマンド case-auto へ収斂しており、本段階は case-auto の orchestration から駆動される。本 Design は内部 lifecycle 段階の契約を定める正規文書である。
## 目的

合意済み要件doc をもとに Root Case（GitHub Issue）を確立し、Definition Package を生成して関連付ける。
canonical Definition に実変更がある場合のみ設計PRを作成する。
壁打ち（req-define）→ Definition 受入準備（case-ready）の境界であり、execution contract の確定、Standard / Epic の最終確定、Child Issue / Wave の作成、RU 削除、proposed Decision の受理評価は case-ready 実行契約（REQ-061）が所有する。

## 承認・HITL 境界

- case-open 自身の承認点を持たない（req-define で壁打ち合意済みの要件 doc を入力とし、Root Case 確立を自動実行する）。
- 要件が曖昧で Root Case を確立できない場合は停止する（REQ-030-006）。
- adversarial-review 審議で unresolved なユーザー判断事項が残る場合は、Root Case 作成（最初の GitHub Issue 作成）へ進まない（REQ-014-009、adversarial-review caller integration 共通契約）。

## 入力

- req-define で生成・合意された要件doc（構造化 `draft-data` 形式: REQ-008, DEC-003、チェックボックス付き）
- draft 全体の `agreed_items`、`artifact_actions`、`operation_units`、`realization_actions`、`review_dispositions`、`case_open_hints` を処理対象とし、OU ごとにスライスせず draft 全体を取り扱う
- `realization_actions`（DEC-026 構造化ハンドオフ）は新たな execution contract として確定せず、Definition Package の構成要素として保持する。実現面の変更方針の execution contract への投影は case-ready が実行する
- 要件が曖昧で Root Case を確立できない場合、`auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo外操作、停止理由が残る場合は停止する（REQ-030-006）
- `conflict_resolutions` に記録済みの衝突は同じ内容をユーザーへ再確認しない

## 出力

- Root Case GitHub Issue（ラベル付き、対象 REQ 番号埋め込み、状態 open。REQ-030-001、REQ-030-009）
- Definition Package（要件行、Decision、Design、Issue 構成案、受入条件一式を Case 単位で集約し Root Case に関連付ける。構成は case-open / case-ready Design（v4）。REQ-030-003）
- 設計PR（canonical Definition に実変更がある場合のみ、Case 単位で 1 件。GitHub Draft PR ではない通常 Pull Request。REQ-030-002、REQ-083-001）
- 完了報告（Root Case 完了報告テンプレート）

## 副作用

- preflight 設定検証（Root Case 確立の preflight。GitHub Issue/PR を使用するリポジトリ種別のみ。REQ-030-018）: 読取専用の repo meta 照会（`gh repo view --json deleteBranchOnMerge` を正規手段）で GitHub repo 設定 deleteBranchOnMerge が true であることを検証する。Custom Tool `agentdev_gh` の操作カタログは拡張しない（読取専用 repo meta 照会はローカル環境確認〔gh auth status と同格〕扱いの bash 実行 Harness 依存。agentdev-gh Local 実装への影響なし）。preflight の deleteBranchOnMerge 設定確認は、true でない場合と確認できない場合を区別した警告（設定無効 / 設定照会不能）として報告し、当該設定理由だけでは blocked 停止しない（部分置換後の DEC-045 を参照）。設定照会不能は実操作の安全性の証明ではなく、実操作の認証・権限・必要な読取・書込み等の成立を確認できない場合は既存の安全契約（agentdev_gh の config-uninterpretable fail-closed、実操作失敗時の停止）に従って停止する。Root Case 本文候補の生成は設定警告の報告後に実行する（blocked 通過条件の撤廃）。GitHub Issue/PR を使用しないローカル版では本検証をスキップする（REQ-009-031/034/039 整合）
- GitHub I/O: Root Case 作成、設計PR作成（Custom Tool `agentdev_gh` 操作契約。Tool 内 VERIFY 付き）
- deviation capture: case-open 実行中に実観測した deviation を agentdev-learning-capture skill または
  agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存する（REQ-030-011）。
  保存先は capture-boundaries.md の Split Rule に従う。
- git 永続化: capture 成果物を明示パス指定（並列実行安全ステージング規律）で commit / push する。
- 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節に含める。
- 行わない副作用: draft / RU の削除（REQ-030-007。削除は case-ready が実行する）、Decision ファイルの status 変更（REQ-030-005）

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-case-open`）が正規情報源である。

- STEP-1 引き継ぎ判定（`agentdev_handoff: true` 検出時はリポジトリ種別に応じ継続または停止）
- STEP-2 Root Case 確立（Root Case 本文候補生成、GitHub Issue 作成。正規状態は実行継続中、実装開始不許可）
- STEP-3 Definition Package 生成・Root Case 関連付け（REQ-030-003）
- STEP-4 実変更判定と設計PR作成（実変更時のみ、Case 単位 1 件。REQ-030-002）
- STEP-5 冪等再実行確認（既存 Root Case・既存設計PRの再利用、重複生成禁止、不足分のみ処理。REQ-030-010）と横断依存検査（draft の artifact_actions と未クローズ Case 群の変更対象成果物の機械的比較、同一パス重複時の警告提示。REQ-030-012〜014）
- STEP-6 deviation capture・完了報告（REQ-030-011）

adversarial-review は Root Case 本文候補と Definition Package 構成案確定後、Root Case 作成前に挿入する（「adversarial-review 挿入境界（case-open）」セクション参照）。

### 機械工程の script 呼び出し契約（RU-0162）

詳細は references/script-invocation.md を参照（遅延読み込み）。
### 検査入力と実行証拠の接続

詳細は references/script-invocation.md を参照（遅延読み込み）。
## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、case-auto の orchestration による Workflow Skill load 時に本 Design が読み込まれる（DEC-010。第4段以降は command 定義の実行時投影ではなく直接読込）。
- workflow 実装本体（STEP 構成、内部手順、reference 構成）は Workflow Skill（`agentdev-workflow-case-open`）が所有し、本 Design はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、case-auto orchestration の委譲制御と Workflow Skill description の DO NOT USE FOR トリガーにより実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## Definition Package と冪等再実行（REQ-030-010）

詳細は references/definition-package.md を参照（遅延読み込み）。
## review_dispositions の消費

詳細は references/definition-package.md を参照（遅延読み込み）。
## Case Issue 本文の元追跡Issue参照形式

詳細は references/definition-package.md を参照（遅延読み込み）。
## トレーサビリティ能力の利用

case-open は、上流工程（req-define）で確定した対象要件と実行契約を Issue へ引き継ぐ（REQ-021-014）。
実行契約は実行契約候補（realization_actions 等の Definition Package 構成要素）として引き継がれ、確定は case-ready が行う。

- req-define と重複して一般的な変更影響探索や依存関係探索を行い、対象範囲を再決定しない
- 対象要件行に設計根拠対応が未成立の行、または検証対応要否の未分類行が残る場合も Root Case の確立を妨げない（REQ-021-024）。設計根拠対応の成立判定と検証対応要否の最終ゲートは case-ready が所有する
- 引き継ぎ情報に欠落があり実行契約候補の構成が不能な場合は、req-define へ差し戻す

## 参照する横断 Design

- [workflows/lifecycle-state-machine.md](../workflows/lifecycle-state-machine.md)（フェーズ定義、標準経路構成）
- [commands/case-ready.md](../commands/case-ready.md)（Definition Package 構成、設計PR lifecycle、canonical Definition 判定、冪等キー。case-open 側は本 Design）
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Split Rule、自工程 deviation capture）
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（Issue 本文品質検査）

### case-open が使用する検査ツール

case-open が使用する検査ツール（[integrity-contracts.md](../integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- なし（case-open は Root Case 確立と Definition Package 生成を責務とし、docs 整合性検査・extensions 検査・検証対応分類ゲートを実行しない。検査は case-ready、case-run、case-close で実施する）

※肯定表現のみ（REQ-010-002, REQ-010-003 準拠）。

## 対象外

- execution contract の確定、Standard / Epic の最終確定、Child Issue・Wave の作成（case-ready: REQ-030-008）
- draft / RU の削除（case-ready: REQ-030-007）
- proposed Decision の受理評価と accepted 遷移（case-ready: REQ-030-005）
- 検証対応要否の最終ゲート（case-ready）
- 機能要件、非機能要件、制約、対象外、受け入れ条件の新規作成（REQ-030-004）
- Root Case 確立後の実装開始（状態 open、REQ-030-009）
- 設計修正PRの作成（case-revise の責務）
- GitHub I/O の Tool 操作契約（Custom Tool `agentdev_gh`）経由の省略。Root Case 作成、設計PR作成は Tool 操作契約経由で行い、Tool 内 VERIFY を迂回する直接実行を行わないこと
- Root Case 本文、PR 本文の文字列変数での持ち回り、親エージェントによる本文再構成の禁止
- スイープ操作（`git add -A` / `git add .` / `git commit -a` / `git checkout .` / `git reset --hard` / `git stash` 等）の実行（並行作業隔離と 1-writer 検知規律は REQ-030-017）
- 明示パス指定以外のステージ、コミット（REQ-030-017）
- intake / learning capture パイプライン自体の操作（保存は agentdev-learning-capture / agentdev-intake-pipeline 委譲内で行い、case-open 自身は直接変更しない）

## 検証観点

- テンプレート必須セクション完備確認（Root Case 本文テンプレートの `<!-- 【必須】 -->` セクション）
- Root Case 本文への対象 REQ 番号埋め込み確認（REQ-030-001）
- Root Case 状態 open の確認と実装開始不許可の確認（REQ-030-009）
- 設計PRの Case 単位 1 件制約と実変更なし Case での不作成確認（REQ-030-002）
- 再実行時の重複生成なし確認（REQ-030-010）
- 出力制約: Issue 本文、PR 本文、commit message は verbatim で返す。「verbatim」とは LF・空行・インデントを含む行構造を byte 単位で保持することを指し、文字列の正規化、改行圧縮、空白挿入・削除をすべて禁止する。委譲接続点（Root Case 本文生成、PR 本文生成）と最終 gh CLI 渡し（Issue 作成、PR 作成）の双方に適用する。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す
- deviation capture の Split Rule 分類と保存結果の完了報告記載確認（REQ-030-011）

## 停止状態

- 要件が曖昧で Root Case を確立できない場合（REQ-030-006）。
- `auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo外操作、停止理由が残る場合。
- 前工程からの引き継ぎ停止判定（`agentdev_handoff: true`、consumer リポジトリ）検出時（Root Case を作成せず停止する）。
- adversarial-review 審議で unresolved なユーザー判断事項が残る場合（Root Case 作成へ進まない）。
- canonical Definition との実変更判定が不能な場合（設計PRを作成せず停止し、判定不能の理由を報告する）。

## adversarial-review 挿入境界（case-open）

詳細は references/adversarial-review-insertion.md を参照（遅延読み込み）。
## 受け入れ義務保存の投影（REQ-030-019〜021、RU-20261004-08）

詳細は references/definition-package.md を参照（遅延読み込み）。
## reference 選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 機械工程の script 呼び出し契約と検査入力の接続 の詳細が必要な場合 | references/script-invocation.md |
| Definition Package と冪等再実行・review_dispositions の消費・元追跡Issue参照形式・受け入れ義務保存の投影 の詳細が必要な場合 | references/definition-package.md |
| adversarial-review 挿入境界（case-open） の詳細が必要な場合 | references/adversarial-review-insertion.md |

## See Also

- [req-define.md](req-define.md)（前段コマンド）
- [case-ready.md](case-ready.md)（後続コマンド（Definition 受入と実行準備完了））
- [case-revise.md](case-revise.md)（Definition 変更の例外経路）
- `agentdev-workflow-case-open` skill（workflow 実装本体（STEP 構成、resume protocol））
- `agentdev-issue-management` skill（Issue 操作、テンプレート充足）
- `agentdev-workflow-templates` skill（テンプレート選定、実行識別情報・レビュー判断セクション規約）
- `agentdev-workflow-lifecycle` skill（work_type、ラベル付与、引き継ぎ停止判定）
- `agentdev-learning-capture` / `agentdev-intake-pipeline` skill（deviation capture 委譲）
- Custom Tool `agentdev_gh`（GitHub I/O 操作契約。[custom-tool-contracts.md](../responsibilities/custom-tool-contracts.md)）
- REQ-030（case-open 実行契約）
- REQ-061（case-ready 実行契約）
- [commands/case-ready.md](../commands/case-ready.md)（Definition Package、冪等キーの後継）
