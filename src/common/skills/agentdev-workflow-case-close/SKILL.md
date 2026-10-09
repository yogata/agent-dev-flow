---
name: agentdev-workflow-case-close
description: "case-close workflow 本体。PR merge と conflict 対応、同期リスク検出、QG-4、docs 検証、Design 確定、Capture 回収、Epic Wave クローズを制御する。USE FOR: case-close の完了判定・PR merge・Design/Capture 処理。DO NOT USE FOR: 単独起動（case-auto 内部段階）。"
---


# case-close workflow スキル

case-close command の workflow 実装本体である。
PR マージから Issue クローズ、Capture 回収、ドメイン状態永続化、完了報告までの制御構造、QG-4 最終完了判定ゲート（完了条件チェックボックス評価・更新）、Design 状態評価（棚卸し制、draft → accepted 昇格）、Epic Wave クローズ（E1〜E6、単一書き手）を所有する。
squash merge 先は main とし、同期時のリスク事前検出を行う。
Case 状態モデルでは active から closed への遷移を担い、停止時は Root Case 指定の再開入口（case-close）を停止報告へ記録する（Root Case の status は実行継続のまま active を維持する。失敗・未完了はマージ結果等の記録で表現する）。再開時は Root Case 指定による経路解決（正規状態、実行構成、既存成果物、実行の生存状況の照合）に従い未完了 STEP を続行する。
完了判定は最終的な要求充足の根拠を確認し、PR のマージや Issue の終了だけを根拠に完了と宣言しない。外部副作用は成果物の作成と区別し、確認済みの権限・安全条件を満たす範囲に限定する。

case-close command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 入力

- case-close command から渡される Issue 番号（単一 Issue または Epic Issue）
- PR 番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- **単一 Issue クローズ時**: マージ済みPR、クローズ済みCase、削除済みローカルブランチ、worktree
- **Epic Wave クローズ時**: 現在 Wave の全子Issue マージ、クローズ、Epic 実行構成表の子状態更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## 副作用

- PR squash merge、Issue close、Issue コメント追加、Epic Issue 本文ステータステーブル更新（Custom Tool `agentdev_gh` 経由、case-close 単一書き手）
- worktree/ ローカルブランチ削除（remote ブランチは GitHub の deleteBranchOnMerge 自動削除に委譲し、case-close は実行しない）
- Design `status` frontmatter 昇格（draft → accepted、棚卸し制の Design 状態評価（STEP-3-2）で実装・検証との整合確認を通過した対象 Design）
- `.agentdev/learning/inbox.md`、`.agentdev/intake/inbox/` への Capture 回収、`.agentdev/` 配下 commit/push
- 当該 Workflow Skill は worktree root 配下以外を編集しない（case-close command の worktree 隔離に従う）

## 制御平面（STEP 一覧）

case-close workflow は次の STEP で構成する。
Epic Wave クローズは STEP-1 のルーティングで分岐し、E1〜E6 として並列記述する。
各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`docs/designs/<foundations/v4-durable-state-and-recovery>.md`）。
会話コンテキストに依存せず、永続状態（GitHub Issue/PR、`.agentdev/`、commit hash、Design status）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | Issue 番号解決・ルーティング | Issue 番号受領 | 単一 Issue クローズ または Epic Wave クローズのルート確定 | [references/issue-resolution-and-qg4.md](references/issue-resolution-and-qg4.md) |
| STEP-2 | QG-4 達成判定 | ルート確定（単一 Issue） | 完了条件チェックボックス評価・更新、観点8 評価スコープ確定 | [references/issue-resolution-and-qg4.md](references/issue-resolution-and-qg4.md) |
| STEP-3 | docs 検証・Design 確定（配布依存境界 最終 gate 含む） | QG-4 合格 | targeted docs guard、IR-{NNN} check_extensions.ts、配布依存境界 最終 gate、full integrity suite 実行（bun test 実行形態契約）、Design 状態評価（棚卸し制：PR 本文申告候補の統合を含む全件評価）・Design status 昇格 | [references/docs-and-design-promotion.md](references/docs-and-design-promotion.md) |
| STEP-4 | PR マージ・コンフリクト解消 | docs 検証合格（配布依存境界 最終 gate 含む） | マージ済みPR（squash merge 先は main）、HEAD commit hash 記録、コンフリクト Level 1 解消 または case-auto エスカレーション | [references/pr-merge-and-conflict.md](references/pr-merge-and-conflict.md) |
| STEP-5 | Post-merge・Issue クローズ | PR マージ完了 | CI 通過確認、Issue 本文更新、Issue close | [references/cleanup-and-capture.md](references/cleanup-and-capture.md) |
| STEP-6 | クリーンアップ・Capture 回収・永続化 | Issue クローズ完了 | worktree/ローカルブランチ削除、親Epic 自動クローズ、実行前同期、Capture 回収、学び検知、`.agentdev/` 永続化、tmp/ 残存確認、完了報告 | [references/cleanup-and-capture.md](references/cleanup-and-capture.md) |
| STEP-E1〜E6 | Epic Wave クローズ（E4-1 配布依存境界 最終 gate 含む） | Epic Issue 番号受領、実行構成表存在 | 現在 Wave の子Issue 一括マージ・クローズ（E4-1 gate 違反子Issue は `blocked` でマージ対象外）、Design 状態評価の Wave 内集約（E4-3、直列集約段で一元評価）、Epic 実行構成表の子状態更新、当該 Wave スコープの一時成果物残留確認（E6-1、残留時は完了扱いにしない）、最終 Wave 判定 | [references/epic-wave-close.md](references/epic-wave-close.md) |

### STEP 間の依存と分岐

- **単一 Issue クローズ**: STEP-1（単一 ルート）→ STEP-2 → STEP-3（配布依存境界 最終 gate 含む）→ STEP-4 → STEP-5 → STEP-6
- **Epic Wave クローズ**: STEP-1（Epic ルート、実行構成表存在時）→ STEP-E1〜E6（E4 内で配布依存境界 最終 gate を各子Issue に適用、single-Issue STEP-3-1 と同一 detector）
- **コンフリクトエスカレーション**: STEP-4 で Level 1 rebase 失敗時、case-auto Level 2/3 エスカレーションへ（本 workflow の対象外）
- **PR なし特例フロー（docs_chore、main 直接 push 済み）**: STEP-1（特例ルート）→ STEP-2 → STEP-3 → STEP-5 → STEP-6。PR 関連処理（STEP-4、STEP-5 の CI 通過確認等 PR 依存部分）は N/A とし、既存 commit を最終成果物として QG-4（STEP-2）は直接 commit 内容で検証する。適用条件と実装系 feature/fix への適用除外は case-close command の特例フローセクションを正とする
- **verify-only closure（PR も carrier commit も存在しない Issue 完了）**: 単一 Issue クローズのルート分岐に従い、STEP-2 QG-4 達成判定の判定根拠を case-run が記録した SSoT コメント（Issue コメント）から参照する。docs_chore 特例フロー（main 直接 commit が存在する PR なし完了）は直接 commit 内容で QG-4 を検証するため、verify-only closure とは判定根拠が異なる。SSoT コメント参照手順と不在時の完了抑止は [references/issue-resolution-and-qg4.md](references/issue-resolution-and-qg4.md) の STEP-2 を参照する

### 共通事前マージ gate（両ルート共通、DEC-{N}、配布依存境界 Design）

配布依存境界の最終 gate は single-Issue ルート（STEP-3-1）と Epic Wave ルート（STEP-E4-1）の両方で、PR マージ前に必ず経由する共用事前マージ seam である。
両ルートとも同一 detector（`check_distribution_boundary.ts` 経由の `lib/distribution-boundary.ts`、IR-{NNN}）を呼び出し、どちらかのルートだけ gate を省略しない（DEC-{N}「事前書き込み gate と最終 gate の契約」、case-run command STEP-S5 と case-close で同一 detector を再利用）。
gate 違反時は両ルートとも PR マージを停止する。

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: Issue 本文の完了条件チェックボックス状態、PR の mergeable/マージ済み状態、HEAD commit hash、Design `status` frontmatter、worktree・ローカルブランチの存在、Capture 回収済みファイルの存在
- 各 STEP の再実行はべき等であり、マージ済み PR への再マージ、更新済みチェックボックスの再評価を発生させない
- 停止終了時は Root Case 指定の再開入口（case-close）を停止報告へ記録する（Root Case の status は実行継続のまま active を維持する。ローカル版では失敗・未完了を `## 残課題` に記録する）。再開時は Root Case 指定による経路解決に従い未完了 STEP を続行する。closed は終端状態であり、終端からの遷移は行わない

### 機械工程の script 呼び出しと内蔵ツール使用規律

- **機械工程の script 呼び出し**: mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の解析と状態更新（解析・現在 Wave 特定・状態更新適用の決定的部分。Epic 本文書込みはモデルが agentdev_gh 経由で行う）、完了条件チェックボックス評価の機械的抽出（評価はモデルが担当）、AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約、textlint 最終検査、worktree/branch クリーンアップは、工程別 script `scripts/src/close_mechanical_steps.ts`（phase: pre-merge / post-merge）の呼び出しで実行する。PR merge 本体（pr_merge）、Issue 本文更新、issue_close は Custom Tool `agentdev_gh` の境界を維持する（case-close Design「機械工程の script 呼び出し契約」節）。報告 JSON（実行結果・差分・警告・提案本文）の意味レビュー（警告の重要度評価、Design 確定判断、未達判定の確定）はモデルが担当する
- **内蔵ツール使用規律**: ファイル検索・内容検索・ディレクトリ列挙は実行基盤の内蔵ツール（ファイル検索、内容検索、読み取り）を使用し、bash 内蔵コマンド（grep、ls 等）を標準手順としない。bash 実行が本来必要な処理（script 呼び出し、git 操作等）は本規律の対象外とする（workflow-skill-model Design「workflow skill 本文における内蔵ツール使用規律」節）

### 終了条件（termination）

- 正常終了: 単一 Issue ルートはクリーンアップ・Capture 回収・永続化 STEP の完了報告まで。Epic Wave ルートは最終 Wave 判定（Epic クローズ または 残 Wave 通知）まで
- 一時ファイル残存: 単一 Issue ルートの正常終了の前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（STEP-6-6 で確認。一時ファイル cleanup 規定（workflow 側で生成した `.agentdev/tmp/` 一時ファイルは当該実行内で削除する。Custom Tool 内部の一時ファイルは Tool が操作ごとに自動削除する））
- 一時成果物残留（Epic Wave ルート）: Epic Wave クローズの正常終了の前提として、当該 Wave スコープの一時成果物（draft、RU、検出事項等のドメイン状態）残留と当該実行で `.agentdev/tmp/` に作成した一時ファイルの残存がないこと（E6-1 で確認。残留時は当該 Wave を完了扱いにしない）
- 停止終了: 未達チェックボックス残存（構造化エラー）、QG-4 不合格、SSoT コメント不在の verify-only closure または SSoT コメントに検証結果の記載が欠落している verify-only closure（verify-only closure の QG-4 完了抑止）、対象要件行の Design 対応・implementation 対応・required 行 verification 対応の欠落（QG-4 完全性検査の完了阻止条件）、配布依存境界 最終 gate 違反、mergeable ポーリング上限超過、Level 1 rebase 失敗（case-auto エスカレーション）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-quality-gates`: QG-4 Final Acceptance Gate、観点8 PR対象範囲 vs 全体 判定マトリクス
- Custom Tool `agentdev_gh`: PR merge / pr_mergeable（UNKNOWN ポーリングは workflow 側）/ Issue close
- `agentdev-git-worktree`: 重複ファイルチェック、squash merge 後分岐ハンドリング、コンフリクト解消 rebase パス、worktree 削除、実行前同期リスク検出
- `agentdev-epic-tracker`: Epic Issue 本文実行構成表、E1〜E6 詳細、子Issue 状態 enum、Epic 自動クローズ判定
- `agentdev-design-file-manager`: Design status 昇格（draft → accepted）、design-lifecycle-application
- `agentdev-workflow-templates`: 対応記録コメント、完了報告テンプレート、工程記録コメントテンプレート（記録種別別6種）の選定と様式
- `agentdev-workflow-case-run`: 記録コメント検証スクリプト（`agentdev-workflow-case-run/scripts/record-comments.ts`。工程記録の事前検査・セクション構築の決定的処理。完了契機の反映で利用）
- `agentdev-learning-capture`: 学び検知・抽出（エージェント自律）
- `agentdev-learning-pipeline`: deferred ルール、採用済み成果物取り込み判定
- `agentdev-intake-pipeline`: intake inbox への Capture 回収
- `agentdev-workflow-orchestration`: capture 境界（intake/learning 分離）
- `agentdev-conventional-commits`: GitHub auto-close 回避ガイドライン
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- `agentdev-traceability`: トレーサビリティ能力（check。QG-4 の対応完全性の独立再検査。fail-open）
- integrity checker skill（リポジトリ固有・配布対象外）: check_changed_docs.ts（targeted docs guard）、check_extensions.ts（IR-{NNN}）

## トレーサビリティ能力の利用（QG-4 独立再検査）

本スキルは QG-4 の一部として、対象要件行の Design 対応、implementation 対応、verification 対応（policy が required と判定する要件行）の完全性を `agentdev-traceability` の check で対応関係全体（正規成果物の inline declaration と top-level `traceability/` 配下の sidecar を同一に扱う）から独立して再検査する（STEP-3 docs 検証）。
case-run 側の事前検査とは独立に実施する。検証手段との対応関係と「今回その検証を実行して合格したか」という実行結果（Issue、PR、QG の記録）を分離して扱う。

- 対象要件行に Design 対応、implementation 対応、または policy が required と判定する要件行の verification 対応の欠落が残る場合はマージせず停止する。Decision 対応の欠落は QG-4 の不合格条件に含めない。不足する対応関係を自動追加または修正せず、検査失敗を case-run 側の修正対象として差し戻す
- **検証対応の3完全性ゲート（完了阻止面）**: 対象要件行の Design 対応、implementation 対応、および policy が required と判定する要件行の verification 対応のいずれかに欠落が残る場合、当該 Case を完了として扱わない。導出は `agentdev-traceability` の check（`--req` で対象要件行に限定）で機械的に行い、`missing-design` / `missing-implementation` / `missing-verification` の findings を該当行の完了阻止条件として扱う。check が正常に完全性を判定できなかった場合（check 実行不能、検査対象の取得不能等）は対応完全性の合格として扱わず、検査不能の旨を報告してマージに進まない（fail-closed）
- **policy optional 行の保護**: verification 対応の完全性判定は、project-level verification policy が required と判定する要件行のみを計上する。policy の正規情報源は `traceability/policy.yaml`（既定 required、optional な要件行のみ明示、未指定の要件行は required）であり、policy が optional と明示した要件行の verification 対応欠落は完全性違反に含めない
- **worktree root 起点の完全性判定時の取扱い**: traceability check を worktree root 起点で実行して検出対象の完全性が確定できない場合、main 側 root で check を再実行し、トレーサビリティポリシー登録 commit の時系列（ブランチ分岐の前後）を確認してから完了阻止を判断する。durable state 上で解消済みの対象行を本変更起因の失敗と誤判定しない。再実行は読取系 check の実行のみで行う
- QG-4 の対応完全性検査は有効である。対応完全性は2層で解釈する（正本: v4-traceability-model Design「completeness の 2 層」節）。lifecycle gate 完全性は対象要件行に scope を限定して判定し、対象要件行の Design 対応と implementation 対応、および policy が required と判定する要件行の verification 対応の欠落と、対象要件行に限定した check（`--req`）の未解決不合格を完了阻止条件とする（fail-closed）。全現行要件行を対象とする corpus 完全性の計数（missing 系の件数）は到達目標状態の診断指標として数値追跡し、lifecycle gate の判定と完了条件には使用しない（advisory・fail-open）。verification 対応の完全性判定は policy が required と判定する要件行のみを計上する
- agentdev-traceability の不在、実行失敗、空結果、候補過多のみを理由に本 workflow を失敗させない（fail-open）。代替検証経路（既存の品質ゲート、targeted docs guard、`rg` 等の独立探索）で継続し、正規成果物そのものの異常とトレーサビリティ機能側の異常を区別する
- 正規成果物側の実不整合が確認された場合は、既存の品質ゲート、受け入れ条件に従って fail とする

## 共通制約

- **完了条件チェックボックス評価・更新は case-close の専任責務**: case-run/ driver/ 外部実行バックエンドは更新しない。case-close は別コンテキストで Issue 本文を再読込し、PR 本文を capture 入力源として最終完了判定する
- **工程記録の完了契機反映**: QG-4 合格後のクローズ契機で、判定主体として完了記録（記録種別=完了、判定根拠必須）を記録コメントとして投稿し、本文結果セクション（成果物、最終判定と根拠、残件の扱い）を更新する。検証詳細は成果物（PR 本文、対応記録コメント）を参照し、本文・コメント・PR 本文へ重複して記載しない。反映は記録コメント検証スクリプト（`agentdev-workflow-case-run/scripts/record-comments.ts`、決定的処理。種別別必須項目検証、結果セクション構築と既存本文への適用）による事前検査を経由し、Custom Tool `agentdev_gh` の comment_create / issue_update で行う。実行の申告だけで完了扱いにしない（実行担当は報告、case-close は完了条件と証拠を照合する）。手順詳細は references/cleanup-and-capture.md の STEP-5 参照
- **Epic Issue 本文実行構成表の更新は case-close 単一書き手**: case-run は読み取りのみ、case-auto は Wave 反復制御のみで直接書き込まない（last-write-wins 競合防止）。Case Issue 工程記録の取りまとめによる記録契機別の Epic 反映（子状態集約・全体条件評価）は、case-close と同一の per-Epic 排他制御・局所直列化の下で Epic Issue 本文へ書き込む（手順の正は `agentdev-epic-tracker`）。E5 の closing 書き込みは直列化区間内での最新取得→マージ→更新により行い、取りまとめ反映の集約セクションを消去しない
- **Capture 境界**: intake/ learning を別々の成果物として扱い、PR 本文のみを capture 入力源とする（一時会話コンテキスト不入力）
- **検証差分の記録**: case-close が実施した各検証（QG-4 完了条件評価、docs 検証・配布依存境界 最終 gate、トレーサビリティ独立再検査等）について、検証種別、検証結果、finding 差分（新規、修正済み、既出、撤回、無効の5分類）を対応記録コメントへ記録する。形式は `agentdev-workflow-templates` の検証差分セクション規約（PR テンプレート形式と同一のテーブル）に従い、前段階（case-run）の PR 本文検証差分セクションの記録との差分で finding を分類し、工程間の比較ができる。対論型レビューの審議中 finding 状態の追跡と品質ゲート完了報告の修正証跡の所有境界を変更しない
- **統合先基準（squash merge 先・同期基準）**: squash merge 先、ブランチ同期の対象は main とする。QG-4 は Issue 完了条件の最終判定として意味を変更しない
- **`--delete-branch` 使用禁止**: PR マージ時に `--delete-branch` オプションを使用しない（マージと同時にブランチ削除を実行すると、アクティブ worktree に checkout されたブランチで local 削除が失敗する local checkout 副作用があるため）。ブランチ削除は独立 STEP で実施
- **GitHub auto-close 回避**: commit message でコマンド名と Issue 番号を分離し、`#` 記号による近接参照を避ける

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<foundations/v4-durable-state-and-recovery>` Design**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-close command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
