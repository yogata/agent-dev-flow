# STEP-4 / STEP-5: 実変更判定・設計PR作成と冪等再実行（definition-pr-and-idempotency）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の制御平面（STEP 一覧）STEP-4、STEP-5 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は両 STEP の実行詳細を提供する。

## Purpose

canonical Definition との実変更を判定し、実変更がある場合のみ設計PRを作成する。
再実行時は既存 Root Case と既存設計PRを再利用し、不足分だけを処理して重複生成しない。

## Input Resolution

1. SSoT 再構成: Definition Package（STEP-3 生成）、canonical Definition（merge 済み main の docs 永続文書（REQ / Decision / Design）と Issue / Epic 構造の確定状態）
2. identifier 保持: 対象 REQ 番号、Root Case Issue 番号、既存設計PR番号
3. 最小 scalar: 実変更判定結果
4. runtime artifact: canonical Definition との差分

## Preconditions

- STEP-3 の Definition Package 生成と関連付けが完了している
- canonical Definition が取得できること。判定対象を取得できない場合は実変更判定を行わず停止する（停止理由を報告する）

## Procedure

### STEP-4: 実変更判定と設計PR作成

#### 機械工程の script 呼び出し（prepare_definition_pr）

STEP-4 の機械工程（専用 worktree 作成、Definition branch 作成、REQ 行編集、`generate_indexes`、`check_integrity`、traceability check、明示パス指定 stage・commit まで）は、工程別 script 1 回の呼び出しで実行する。実装は本スキル配下の `scripts/src/prepare_definition_pr.ts`。契約の正は case-open Design「機械工程の script 呼び出し契約」節である。

1. 入力 JSON を組みて script を 1 回呼び出す: `bun ./src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts --input <input.json>`。入力 JSON には worktree root、Definition branch 名、base ref、Root Case 識別子、Definition 編集内容（対象パス・旧文・新文の完全一致一意指定）、品質ゲート実行仕様（generate_indexes / check_integrity / traceability check。省略は入力検証で拒否される）、明示パス指定 stage 対象、commit message を含める
2. 報告 JSON を解釈する。報告は実行結果（工程別 step の成否）、差分（変更ファイル・HEAD）、警告、提案する Issue/PR 本文の4要素を持つ。終了コードは成功 0、要判断 2、失敗 1。script は処理を省略せず、失敗時は途中結果とともに非 0 で終了する。空の結果や既定値で成功扱いにしない
3. 提案本文と報告内容の意味レビューはモデルが担当する。警告の重要度評価、実変更判定の確定、PR 作成の可否判断はモデルが行う
4. 冪等再実行: script は既存 worktree を検出した場合は期待 branch 上のとき再利用し、別 branch のとき失敗を返す。再実行時は編集旧文の不在（適用済み）を失敗として報告するため、再実行前に報告 JSON と git 状態から適用済みの工程を確認し、不足分のみを入力 JSON に含める

#### PR 作成（実変更がある場合）

1. head branch push（前段）: `git push -u origin definition/issue-{N}` を実行し、push 出力で remote branch 名と upstream 設定が意図した先であることを確認する。pr_create は remote に存在する branch を head とするため、push を pr_create より手前に位置させる
2. 並行 case-open 実行時は、PR 作成前に正規所有である case-open Design「並行 case-open の作業隔離規律」節の隔離検査（merge-base 起点 `git diff --stat "$MB" HEAD` による自 Case 差分検査、`git log --oneline "$MB"..HEAD` によるスタック構造判定、明示パス指定ステージ、1-writer 侵害検知時の早期断念）を実行する。origin/main 直指定の diff は merge-base 起点検査の代替にしない
3. PR 作成は `agentdev_gh` の pr_create で行い、GitHub Draft PR ではない通常 Pull Request として作成する（draft 指定は公開契約に存在しない）。PR 本文は script の提案本文を意味レビューした上で verbatim で記録する。実変更判定: Definition Package と canonical Definition の比較で差分が空の場合は実変更なし → PR を作成せず STEP-5 へ進む。実変更のない Case（bugfix / maintenance / docs_chore 等）では作成しない
4. REQ 行変更（新規行の追加・移管・廃止等）を伴う設計PRでは、PR 作成前に Design の ADF-COVERS 宣言の追随反映を確認し、トレーサビリティ check で当該 REQ 行の missing-design が 0 件であることを確認する（missing-design 0 件ゲート。coverage `--req` による実測帰着確認を併用する。coverage は advisory・fail-open であり、check の判定を代替しない）。**宣言形式は design 役割タグ付きの ADF-COVERS 宣言を標準とする**。missing-design が残る場合は既存 sidecar の `design` セクションへの追加を標準の宣言先とする。宣言追随が Definition に含まれておらず missing-design が 0 件でない場合は PR を作成せず、Definition Package の構成へ戻して宣言追随を確定する

### 投影不備判明時の正規訂正経路差し戻し（Definition 確定後）

正規所有は case-open Design「受け入れ義務保存の投影」節であり、本節は STEP-4 / STEP-5 の実行手順を提供する。Definition 確定後に投影不備（合意済み入力の必須受け入れ義務の欠落・縮小・反転、対応先のない義務の残存）が判明した場合に適用する。STEP-3 の受け入れ義務の忠実性照合（root-case-and-definition-package.md）を通過した Definition が対象になる。

1. **非公式補完の禁止**: 判明した投影不備を消費済み入力で実行契約へ非公式に補完しない。実行手順・PR 本文・コメント等での義務の再定義、暗黙の補完、補いの記載を行わない
2. **不備内容の記録**: 投影不備の内容（対象の義務、差異種別〔欠落・縮小・反転・対応先なし〕、判明した箇所と影響範囲）を検証記録（実行記録）と設計PRに記録する
3. **正規の訂正経路への差し戻し**: 修復を正規の訂正経路（req-define 再合意を経る case-revise 等）へ差し戻す。case-open 側では Definition の確定済み内容を変更せず、差し戻し先と理由を検証記録へ残す

### STEP-5: 冪等再実行確認

1. 冪等キー（case-open / case-ready Design）で既存成果物を検出する: 既存 Root Case、既存設計PR
2. 検出した成果物を再利用し、重複生成しない。Root Case の重複は STEP-2 で、設計PRの重複は STEP-4 で排除する
3. 不足分だけを処理する: Root Case が存在し設計PRが存在しない場合は STEP-4 の手順で PR のみ作成する。Root Case が存在しない場合は STEP-2 から実行する。両者とも存在する場合は新規生成を行わない
4. 再利用判定はファイル単位の存在確認で近似しない。同一ファイル内に複数の instruction・複数の Issue 節が混在する成果物（Root Case 本文、Definition Package 等）は、委譲 prompt の instruction 単位、Issue 本文の節単位（【必須】セクション等）で完了度を照合し、未完了の instruction・節のみを処理対象として検出する（ファイル単位の近似照合で部分完了を見逃さない）
5. 重複生成がないことを確認し、結果を記録する
6. 横断依存検査（後述）を実行し、警告の提示記録または検出不能報告を完了報告へ含める

### GitHub I/O 失敗時の gh CLI 切替継続手順（冪等検出）

冪等検出（既存 Root Case、既存設計PRの検出）は `agentdev_gh` の読み取り操作（issue_list、issue_read、pr_read 等）に依存する。`agentdev_gh` の読み取り操作が失敗（Tool 異常、API エラー）し、冪等検出が完了できない場合、検出自体を放棄せず次の手順で継続する。

1. **切替判定**: 読み取り操作の失敗を検知した場合、同一操作を1回再試行する。再試行でも失敗する場合に gh CLI へ切替する（単発の timeout・一時的 API エラーで即切替しない）
2. **切替範囲の限定**: gh CLI による切替は**読み取り専用の検出**（`gh issue list`、`gh issue view`、`gh pr list`、`gh pr view` 等）に限定する。書込み操作（作成、更新、クローズ、merge）を gh CLI で代替しない（GitHub I/O の正規経路は Custom Tool `agentdev_gh` に限定する契約を維持する）
3. **検出基準の不変性**: gh CLI で検出した結果も、`agentdev_gh` で検出した場合と同一の冪等キー基準で解釈する。切替により再利用判定・重複生成判定の基準を変えない
4. **切替の記録**: 切替理由（失敗した操作と失敗内容）、使用した gh CLI コマンド、検出結果を検証記録（実行記録）へ残す
5. **切替後も検出不能な場合**: gh CLI でも検出が完了しない場合は検出不能として報告し停止する。検出不能のまま既存成果物の有無を確認せずに新規生成へ進むことは、重複生成を誘発するため行わない

### 横断依存検査（STEP-5 実行時）

共通契約の正規所有はワークフロー契約 Design「Case 投入時の横断依存検査契約」節である。本節は case-open 側（STEP-5）の実行手順を定める（case-open 実行契約 REQ の横断依存検査行に対応する）。

- **検出源の限定**: draft の `artifact_actions` が宣言する変更対象成果物パスと、未クローズ Case 群の宣言（Issue 本文の execution contract 系セクションが宣言する変更対象成果物）に限定する。合意済み宣言以外の読み取り、一般的な変更影響探索・依存関係探索を行わず、対象範囲を再決定しない
- **スキャン範囲**: 未クローズ Case 群の全体とする。時間窓による狭域化はしない
- **機械的比較の実行**: 検出源を検査入力 JSON に組み、本スキル配下の共有エンジンを実行する:
  `bun .opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts --input <input.json> --root <repo-root>`
  （投影先パスから実行する。worktree で投影が利用できない場合は worktree 構造的制約の fallback 手順に従う。入力 JSON の構成は `scripts/README.md` 参照）
- **検出条件**: 2 以上の Case 間で変更対象成果物の同一パスが重複する場合、警告として投入者に提示する
- **警告時の挙動**: エラーではなく警告とし、投入者（HITL）へ (1) 先行整備 Case の切り出し提案、(2) 既存 Case への登録責務の割り当て、(3) このまま並行投入、の選択肢を提示する。整備 Case を自動作成せず、マージ順序を自動決定しない。case-auto 配下では警告検出時の判断を decision_context による親判断解決へ委譲する
- **警告のみでの阻止禁止**: 警告のみで Root Case の確立を自動阻止しない。警告の提示記録を完了報告へ含める
- **検出源取得不能時**: 未クローズ Case 群の取得に失敗した場合は比較を省略せず、検出不能として報告する（検査入力の `source_failures` に失敗を記録し、報告の `detection_unavailable` に出力する）
- **Epic 経路の委譲境界**: draft の構成ヒント（`case_open_hints`）が Epic 構成を示す投入では、同一投入内（Epic 配下 Wave 内）の重複検出は Wave 重複前置検出（case-ready Design「v3 epic-wave-model Design からの吸収」節の前置検出契約）へ委譲し二重検査としない。Epic をまたぐ Case 間の重複は本検査が検出対象とする
- **冪等再実行時の再提示**: 再実行時も本検査を再実行し、警告を再提示する（エンジンは同一入力から同一の報告を返す）

## Result

- 実変更判定結果（実変更あり / なし）
- 設計PR作成結果（実変更時のみ。Case 単位 1 件）
- head branch push 結果（実変更時のみ。push 済み HEAD hash と remote branch 名、refspec 確認済み）
- 並行 case-open 実行時の PR 作成前隔離検査結果（自 Case 差分のみの確認、スタック検出時は差分再構成救済の実施）
- 冪等確認結果（既存成果物の再利用、重複生成なし、不足分のみ処理）
- 横断依存検査結果（警告の提示記録、または検出不能報告。警告のみで Root Case の確立は阻止しない）
- 投影不備判明時の差し戻し結果（判明時のみ。非公式補完を行わないことの確認、不備内容の記録、正規の訂正経路への差し戻し）

## Evidence

- 実変更判定根拠（canonical Definition との差分）、作成した PR 番号、既存成果物の検出結果
- REQ 行変更または Decision 変更を伴う場合の `generate_indexes.ts` 実行結果、再生成された派生物一覧、および派生物が同一 PR に含まれることの確認結果
- head branch push の実行証跡（push 出力による refspec 確認結果、push 済み HEAD hash と remote branch 名。実変更時のみ）
- 並行 case-open 実行時の PR 作成前隔離検査実行証跡（merge-base / diff --stat の結果、救済実施時は差分再構成の記録）
- 横断依存検査の実行証跡（検査入力、エンジンの報告 JSON、投入者への選択肢提示とその応答）
- 投影不備判明時の差し戻し証跡（判明した不備の内容、非公式補完を行わない確認、差し戻し先と理由。判明時のみ）

## Completion Verification

- 実変更がない Case について設計PRが存在しないこと
- 実変更がある Case について設計PRが 1 件であること
- 実変更がある Case について、pr_create の前段で head branch push が実行され、push 先 refspec の確認が記録されていること
- REQ 行変更を伴う Case について、PR 作成前の missing-design 0 件ゲート確認が行われていること
- 並行 case-open 実行時に、PR 作成前隔離検査（自 Case 差分のみ・明示パスステージ・1-writer 侵害検知時の早期断念）が実行されていること
- 再実行時に Root Case と設計PRの件数が増加しないこと
- 再利用判定が instruction 単位・Issue 節単位の完了度照合に基づいていること（ファイル単位の近似照合で部分完了を完了扱いにしていないこと）
- 横断依存検査が実行され、警告検出時は提示記録が、検出源取得不能時は検出不能報告が残っていること
- Definition 確定後に投影不備が判明した場合、消費済み入力での非公式補完が行われておらず、不備内容の記録と正規の訂正経路（req-define 再合意を経る case-revise 等）への差し戻しが完了していること（未判明時は適用なし）

## Resume-Idempotency

- 実変更判定は読取と判定のみで副作用を持たない。PR 作成は既存 PR がある場合は skip する。再実行時は冪等キーで同一の再利用判定に到達する

## resume point

- 実変更判定結果、PR 作成状態、既存成果物の検出結果

## 関連 STEP

- 前: STEP-2 / STEP-3（root-case-and-definition-package）
- 次: STEP-6（capture-and-completion）
