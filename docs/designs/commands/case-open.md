---
title: case-open Design
status: accepted
created: 2026-06-21
updated: "2026-09-17"
---

<!-- ADF-COVERS(implementation): REQ-030-001, REQ-030-002, REQ-030-003, REQ-030-004, REQ-030-005, REQ-030-006, REQ-030-007, REQ-030-008, REQ-030-009, REQ-030-010, REQ-030-011 -->
<!-- ADF-COVERS(implementation): REQ-015-009 -->
<!-- ADF-COVERS(implementation): REQ-021-014, REQ-021-024 -->
<!-- ADF-COVERS(implementation): REQ-049-005 -->

# case-open Design

## 目的

合意済み要件doc をもとに Root Case（GitHub Issue）を確立し、Definition Package を生成して関連付ける。
canonical Definition に実変更がある場合のみ Definition PR を作成する。
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
- Definition Package（要件行、Decision、Design、Issue 構成案、受入条件一式を Case 単位で集約し Root Case に関連付ける。構成は definition-readiness Design。REQ-030-003）
- Definition PR（canonical Definition に実変更がある場合のみ、Case 単位で 1 件。GitHub Draft PR ではない通常 Pull Request。REQ-030-002、REQ-083-001）
- 完了報告（Root Case 完了報告テンプレート）

## 副作用

- GitHub I/O: Root Case 作成、Definition PR 作成（Custom Tool `agentdev_gh` 操作契約。Tool 内 VERIFY 付き）
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
- STEP-2 Root Case 確立（Root Case 本文候補生成、実行識別情報セクション付与、review_dispositions 転記、GitHub Issue 作成。状態 open、実装開始不許可）
- STEP-3 Definition Package 生成・Root Case 関連付け（REQ-030-003）
- STEP-4 実変更判定と Definition PR 作成（実変更時のみ、Case 単位 1 件。REQ-030-002）
- STEP-5 冪等再実行確認（既存 Root Case・既存 Definition PR の再利用、重複生成禁止、不足分のみ処理。REQ-030-010）と横断依存検査（draft の artifact_actions と未クローズ Case 群の変更対象成果物の機械的比較、同一パス重複時の警告提示。REQ-030-012〜014）
- STEP-6 deviation capture・完了報告（REQ-030-011）

adversarial-review は Root Case 本文候補と Definition Package 構成案確定後、Root Case 作成前に挿入する（「adversarial-review 挿入境界（case-open）」セクション参照）。

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（`src/opencode/commands/agentdev/case-open.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（STEP 構成、内部手順、reference 構成）は Workflow Skill（`agentdev-workflow-case-open`）が所有し、本 Design はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## Definition Package と冪等再実行（REQ-030-010）

- Definition Package の構成、Definition PR / Definition Amendment PR の lifecycle、canonical Definition の判定、冪等キーは definition-readiness Design が正規所有する。
- case-open は再実行時、既存 Root Case および既存 Definition PR を冪等キーで検出し、再利用する。重複生成しない（REQ-030-010）。
- 不足分だけを処理する。Root Case が存在し Definition PR が存在しない場合は PR 生成のみを実行し、Root Case が存在しない場合は Root Case 確立から実行する。両者とも存在する場合は新規生成を行わない。
- Definition PR は canonical Definition に実変更がある場合のみ作成する。canonical との差分が空の場合（bugfix / maintenance / docs_chore 等の実変更なし Case）は作成しない（REQ-030-002）。実変更判定が不能な場合は PR を作成せず停止し、判定不能の理由を報告する。

### 横断依存検査（STEP-5、REQ-030-012〜014）

- STEP-5 冪等確認の実行時、draft の artifact_actions と未クローズ Case 群の変更対象成果物を機械的に比較し、2 以上の Case 間で同一パスが重複する場合、警告として投入者に提示する。共通契約は workflow-contracts Design「Case 投入時の横断依存検査契約」が正規所有する。
- 検出源は draft の artifact_actions と未クローズ Case 群の宣言に限定し、合意済み宣言以外の一般的な変更影響探索・依存関係探索を行わない（REQ-021-014、REQ-030-013）。
- Epic を構成する投入では同一投入内（Epic 配下 Wave 内）の重複検出を Wave 重複前置検出（REQ-035-012）へ委譲し、Epic をまたぐ Case 間の重複のみを検出対象とする（REQ-030-014）。
- 警告は Root Case の確立を自動阻止せず、警告の提示記録を完了報告へ含める。

## review_dispositions の消費と証跡転記

case-open は `review_dispositions` を読み取り、Root Case 本文「レビュー判断」セクションへ恒久証跡として転記する。

### 転記規則

- 全 disposition を Root Case 本文へ転記する（Case 単位）。
- Epic Issue / 子 Issue への転記は case-ready が Epic 構成確定後に実行する（case-open は転記しない）。

### レビュー判断セクションへの転記形式

転記先の Root Case 本文「レビュー判断」セクションの構造は workflow-templates Design（`docs/designs/skills/agentdev-workflow-templates.md`「review_dispositions 証跡セクション」節）が正規所有する。
各 disposition は id、disposition、reason_code、reason、evidence（path、section、checked_at_commit）を記載する。

### 後方互換（AG-001）

`review_dispositions` を持たない旧ドラフトを case-open は入力として拒否しない（DEC-003 準拠）。
「レビュー判断」セクションへ「該当なし」と記載する。

## Case Issue 本文の元追跡Issue参照形式

Case Issue（Root Case を含む）の本文冒頭には、req-define 経由で要件化された元追跡Issueへの参照を `Tracking: #N` 形式で記録する（REQ-049-005「追跡Issueと生成された Case Issue の関係は後から追跡できること」の実現手段）。

- **記載形式**: 本文冒頭ブロックに `Tracking: #N` を1行で記載する。複数の元追跡Issueがある場合は `Tracking: #N, #M` のようにカンマ区切りで列挙する
- **Parent: #N との区別**: `Parent: #N` は Epic Issue と子 Issue の階層関係（Epic/child 専用）を表す形式であり、元追跡Issueへの参照には使用しない。両形式は別用途である
- **記載対象**: 追跡Issueから要件化された Case Issue のテンプレートで元追跡Issueが判明している場合に記載する。追跡Issueを起源としない通常の Case Issue には記載しない
- **追跡Issue側との対応**: 追跡Issue側の本文標準構造（関連 Case Issue への参照セクション）との双方向参照として保持する。論理スキーマ（role、kind、状態、本文標準構造を含む）の正は agentdev-issue-tracking Design が一元管理し、本節は Case Issue 本文側の記載形式のみを所有する

## トレーサビリティ能力の利用

case-open は、上流工程（req-define）で確定した対象要件と実行契約を Issue へ引き継ぐ（REQ-021-014）。
実行契約は実行契約候補（realization_actions 等の Definition Package 構成要素）として引き継がれ、確定は case-ready が行う。

- req-define と重複して一般的な変更影響探索や依存関係探索を行い、対象範囲を再決定しない
- 対象要件行に検証対応要否の未分類行が残る場合も Root Case の確立を妨げない（REQ-021-024）。検証対応要否の最終ゲートは case-ready が所有する
- 引き継ぎ情報に欠落があり実行契約候補の構成が不能な場合は、req-define へ差し戻す

## 参照する横断 Design

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、主フロー構成）
- [workflows/definition-readiness.md](../workflows/definition-readiness.md)（Definition Package 構成、Definition PR lifecycle、canonical Definition 判定、冪等キー）
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
- Definition Amendment PR の作成（case-revise の責務）
- GitHub I/O の Tool 操作契約（Custom Tool `agentdev_gh`）経由の省略。Root Case 作成、Definition PR 作成は Tool 操作契約経由で行い、Tool 内 VERIFY を迂回する直接実行を行わないこと
- Root Case 本文、PR 本文の文字列変数での持ち回り、親エージェントによる本文再構成の禁止
- スイープ操作（`git add -A` / `git add .` / `git commit -a` / `git checkout .` / `git reset --hard` / `git stash` 等）の実行（v2:REQ-0137-001）
- 明示パス指定以外のステージ、コミット（v2:REQ-0137-002/005）
- intake / learning capture パイプライン自体の操作（保存は agentdev-learning-capture / agentdev-intake-pipeline 委譲内で行い、case-open 自身は直接変更しない）

## 検証観点

- テンプレート必須セクション完備確認（Root Case 本文テンプレートの `<!-- 【必須】 -->` セクション）
- Root Case 本文への対象 REQ 番号埋め込み確認（REQ-030-001）
- Root Case 状態 open の確認と実装開始不許可の確認（REQ-030-009）
- Definition PR の Case 単位 1 件制約と実変更なし Case での不作成確認（REQ-030-002）
- 再実行時の重複生成なし確認（REQ-030-010）
- 出力制約: Issue 本文、PR 本文、commit message は verbatim で返す。「verbatim」とは LF・空行・インデントを含む行構造を byte 単位で保持することを指し、文字列の正規化、改行圧縮、空白挿入・削除をすべて禁止する。委譲接続点（Root Case 本文生成、PR 本文生成）と最終 gh CLI 渡し（Issue 作成、PR 作成）の双方に適用する。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す
- deviation capture の Split Rule 分類と保存結果の完了報告記載確認（REQ-030-011）

## 停止状態

- 要件が曖昧で Root Case を確立できない場合（REQ-030-006）。
- `auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo外操作、停止理由が残る場合。
- 前工程からの引き継ぎ停止判定（`agentdev_handoff: true`、consumer リポジトリ）検出時（Root Case を作成せず停止する）。
- adversarial-review 審議で unresolved なユーザー判断事項が残る場合（Root Case 作成へ進まない）。
- canonical Definition との実変更判定が不能な場合（Definition PR を作成せず停止し、判定不能の理由を報告する）。

## adversarial-review 挿入境界（case-open）

本節は case-open への adversarial-review caller integration（REQ-015-009）の挿入境界を case-open 固有の側面で所有する。
共通 caller integration 契約（任意性、QG/HITL 非代替、副作用禁止、accepted finding 反映責務、再 review 条件と停止条件、呼出失敗時取扱い）は [adversarial-review Design](../skills/agentdev-adversarial-review.md)「adversarial-review caller integration 共通契約」節が正であり、本節は case-open 固有の挿入位置、発動条件、変更影響別再実行ルール、最初の副作用との順序のみを規定する（REQ-014-011）。

### 挿入位置（REQ-015-009）

review 挿入位置は「Root Case 本文候補と Definition Package 構成案確定後・最初の GitHub Issue 作成（Root Case 作成）前」である。
REQ-030 への縮小に伴い、かつて case-open が構成していた execution structure（Epic / Wave / Issue 構成）と完了条件（QG-2 検証）は case-ready へ移管済みであるため、review 対象は case-open が現に構成する2者である。

### 発動条件判定 Step（REQ-015-001、REQ-015-002、REQ-015-003）

発動条件判定と review 呼出を分離する（REQ-015-001）。
発動条件判定 Step は default-on 原則（REQ-015-002、REQ-014-013）と skip 条件（REQ-015-003、REQ-014-014）を評価する。

- **default-on（原則実行）**: case-open は adversarial-review を原則実行する。ユーザー明示指定は通常発動の必須条件ではなく、Root Case 本文候補、Definition Package 構成案のいずれかに意味的決定が存在する場合に発動する。
- **skip 条件**: Root Case 本文候補が合意済み入力（draft-data）の機械的投影のみで新しい意味的決定を含まない場合、adversarial-review を省略して Root Case 作成へ進める（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。
- **ユーザー明示指定時の必須実行**: ユーザーが case-open 実行中に adversarial-review の実施を明示的に指定した場合、skip 条件の該当にかかわらず必ず発動する（REQ-015-002）。

### review 呼出 Step（REQ-015-001）

発動条件判定 Step で発動と判定された場合、review 呼出 Step で adversarial-review を呼び出す（REQ-015-001）。

- **委譲契約**: adversarial-review は `semantic_review`（書き込み禁止型）として適用する（[delegation-contracts Design](../workflows/delegation-contracts.md)「adversarial-review との委譲契約接続」節）。adversarial-review 自身は対象ファイル、Issue、PR、git 操作を行わない（REQ-014-004）。
- **review 対象**: Root Case 本文候補、Definition Package 構成案の2者。
- **採用後戻り先**: Root Case 本文候補に関わる finding は本文候補生成へ戻し再評価する。Definition Package 構成案に関わる finding は構成案評価へ戻す。accepted finding の対象候補への反映は case-open（呼出元）の責務である（REQ-014-006）。
- **unresolved 時の取扱い**: 未解決のユーザー判断事項が残る場合、Root Case 作成へ進まない（REQ-014-009）。工程委譲起源であるため、既存 status（pass/warn/fail/partial）に unresolved 判断事項を付加し、case-auto 経由時は user-decision-required 停止理由分類として伝播する（REQ-014-012、[workflow-contracts Design](../workflows/workflow-contracts.md)「adversarial-review 由来の停止信号」節）。
- **呼出失敗時**: adversarial-review の呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持する（REQ-014-010）。

### 変更影響別の再実行ルール（REQ-014-007）

review の結果反映で review 対象の意味内容が変更された場合（REQ-014-007）、変更影響範囲に応じて次の4パターンのいずれかを実行する。

| 変更影響 | 再実行対象 | 根拠 |
|---|---|---|
| Root Case 本文候補のみ変更 | 本文候補の再生成 | 本文候補の意味内容を最新化する |
| Definition Package 構成案のみ変更 | 構成案の再評価 | 構成案の意味内容を最新化する |
| 両方が変更 | 本文候補の再生成と構成案の再評価 | 両方を再実行する |
| 意味内容変更なし | 再実行不要 | review 対象の意味内容に変更がないため、Root Case 作成へ進む |

4パターンのいずれかを完了した後、意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる（REQ-014-007）。
同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しない。
再 review の停止条件（REQ-014-008）を満たした場合、Root Case 作成へ進む。

### 最初の副作用（Root Case 作成）との順序

review は最初の GitHub Issue 作成呼び出し（Root Case 作成）より前に実行する。
Root Case 作成が case-open の最初の副作用（GitHub API 呼び出しによる Issue レコード生成）であるため、review は最初の副作用の前に挿入される。
review の結果、Root Case 本文候補、Definition Package 構成案のいずれかが変更された場合は、変更影響別の再実行ルールに従い、Root Case 作成前に反映を完了する。

### 正規所有者マトリックス参照

本節と adversarial-review Design「adversarial-review caller integration 共通契約」節（REQ-014-011）、delegation-contracts Design「adversarial-review との委譲契約接続」節、workflow-contracts Design「adversarial-review 由来の停止信号」節との間で意味の重複、矛盾を生じない。
case-open command 固有の挿入境界（発動条件、挿入構造、変更影響別再実行ルール、順序）のみを本節が所有し、共通 caller integration 契約、adversarial-review 自身の振る舞い契約、再 review 条件と停止条件の詳細は各正規所有者 Design を正とする。

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
- [workflows/definition-readiness.md](../workflows/definition-readiness.md)（Definition Package、冪等キー）
