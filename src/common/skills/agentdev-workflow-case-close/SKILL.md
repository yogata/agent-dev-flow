---
name: agentdev-workflow-case-close
description: "case-close workflow 本体。PR merge と conflict 対応、同期リスク検出、QG-4、docs 検証、Design 確定、Capture 回収、Epic Wave クローズを制御する。USE FOR: case-close の完了判定・PR merge・Design/Capture 処理。DO NOT USE FOR: 単独起動（case-auto 内部段階）。"
---

# case-close workflow スキル

case-auto の内部段階として単一 Issue または Epic Issue と PR 番号（省略時は検出）を受け取る。最終受入判定、main への squash merge、Issue 終了と作業領域の回収を所有する。マージや Issue 終了だけを要求充足の証拠としない。ファイル編集は対象 worktree に限定し、外部副作用は確認済みの権限と安全条件の範囲で行う。

## 制御平面（STEP 一覧）

| STEP | 実行と出口条件 | 詳細 |
|---|---|---|
| STEP-1 | Issue・PR を解決し、単一 Issue と Epic Wave を分岐 | [Issue 解決と QG-4](references/issue-resolution-and-qg4.md) |
| STEP-2 | 正規完了条件を再読込し、独立検証サブエージェントによる証拠照合結果を受領して観点8の評価範囲でチェックボックスを評価・更新。未達・証拠不足は停止 | [Issue 解決と QG-4](references/issue-resolution-and-qg4.md) |
| STEP-3 | QG-4 合格後に targeted docs、拡張整合、配布依存境界 最終 gate、最終試験を実施。Design は全件を棚卸しし整合する draft のみ昇格 | [references/docs-and-design-promotion.md](references/docs-and-design-promotion.md) |
| STEP-4 | gate 合格後、HEAD を記録して main へ squash merge。Level 1 rebase 失敗は case-auto の Level 2/3 へ | [マージとコンフリクト](references/pr-merge-and-conflict.md) |
| STEP-5 | マージ後の CI を確認し、検査済み完了記録と本文結果を反映して Issue を閉じる | [クリーンアップと Capture](references/cleanup-and-capture.md) |
| STEP-6 | 安全に worktree・ローカルブランチを削除し、同期・Capture・永続化・一時ファイル回収後に報告 | [クリーンアップと Capture](references/cleanup-and-capture.md) |
| STEP-E1〜E6 | Epic 実行構成表から現在 Wave を処理（配布依存境界 最終 gate を含む）。最終 Wave なら終了、それ以外は残 Wave を通知 | [references/epic-wave-close.md](references/epic-wave-close.md) |

- **PR なし**: 直接 push 済みの適格な `docs_chore` は既存 commit、verify-only closure は case-run の SSoT コメントで QG-4 を評価する。後者でコメント・検証結果が欠ける場合は完了しない。PR 依存処理を適用しない条件は STEP-2 の参照を読む。
- **配布依存境界**: STEP-3-1 と STEP-E4-1 の双方で `check_distribution_boundary.ts` の同一 detector をマージ前に実行する。違反はマージ停止、Wave では当該子 Issue を `blocked` とする。
- **試験義務**: リポジトリ全体が義務なら full integrity suite を機械受理される形で実行する。選択範囲では対象・結果・除外根拠と変更との対応を記録し、範囲内を省略しない。未実行、機械受理失敗、根拠なしの除外、0件の成功扱いは完了を阻止する。
- **終了判定**: 契約状態記録の未コミット・未追跡残存、検証用一時資材の回収・引継ぎ、終了判定記録の扱いは [終了前の機械検査と後片付け](references/close-acceptance-evidence.md) を適用する。通常は当該実行の `.agentdev/tmp/`、Wave はさらに当該 Wave の一時成果物の残存がないことを終了条件にする。

### 再開と書込み境界

Issue 本文と正規記録、PR・HEAD、Design status、worktree、Capture ファイルから未完了 STEP を復元する。マージ済み PR を再マージせず、確定済み判定を再実行しない。停止報告には Root Case 指定の case-close 再開入口を残し、active を維持する。Local の残件は `## 残課題` に記録し、closed から遷移しない。

機械工程は `scripts/src/close_mechanical_steps.ts` の pre-merge / post-merge を利用する。観点評価、警告・失敗・Design 確定の意味判断はモデルが行う。Issue 更新と PR マージ・Issue 終了は `agentdev_gh` を用いる。Local の `pr_merge` は取り込み結果の記録であり取り込みは case-close が行う。`--delete-branch` は使用せず、ローカル削除は別 STEP、リモート削除は GitHub に委譲する。

## 統合・クローズ工程の実作業委譲と判断主体保持

- **読取り・検証の実作業委譲**: PR 差分確認、コンフリクト調査、テスト再実行、`check` 実行、証拠と正規成果物との照合は、読取りと検証を担当する書き込み禁止型サブエージェント（`gate_check` / `semantic_review` / `log_analysis`）へ委譲して行う。完了判定（QG-4）に用いる `check` 実行と証拠照合は、実行担当と独立な検証サブエージェントが行う。
- **書込みを伴う複数文書同期の区別**: 複数文書の同期や修正など書込みを伴う作業は、工程下部に新たな書込み権限付き委譲を設けず、既存の書込み許可のある工程委譲（case-auto からの工程委譲）の範囲内で case-close が行う。
- **判断主体の保持**: 完了条件チェックボックスの評価と更新、進行判断、永続化、Issue/PR 状態遷移、commit、push、merge、ユーザー確認は case-close が保持する。直接実行の上限と環境制約時の直接書込みフォールバックは委譲契約 Design「親セッション向け委譲結果サマリ」節に従う。
- **生ログ読戻し抑止**: case-close は子セッションの生ログ（詳細な実行履歴）や、探索・検証対象の生の本文・大量の検索結果を読み戻したり自ら収集したりしない。進行判定と完了判定（QG-4）は委譲結果サマリに記録された参照（退避先のパス、PR の URL、テスト結果の件数など）と正規証拠（PR 本文の検証差分・Issue コメント SSoT・検証記録）との突合によって行い、参照先の確認は当該参照に限る。

## トレーサビリティ能力の利用（QG-4 独立再検査）

Design 対応、implementation 対応、verification 対応（policy が required と判定する要件行）の完全性は、実行担当と独立な検証サブエージェントへ `agentdev-traceability` の `check --req` 実行と証拠照合を委譲して case-run と独立に再検査し、観点の評価と完了条件チェックボックスの確定は case-close が行う。inline declaration と top-level `traceability/` 配下の sidecar を同一に扱う。`missing-design` / `missing-implementation` / `missing-verification` と対象の未解決不合格は完了阻止とし、case-run へ差し戻す。Decision 対応の欠落は不合格条件に含めない。既定は required だが、policy が optional と明示した要件行の verification 対応欠落は完全性違反に含めない。全現行要件行の corpus 計数は診断用とし、今回の試験結果と恒常的な検証対応を区別する。

必須検査が検査不能の場合は合格として扱わず、検査不能の旨を報告して完了判定とマージへ進まない。機能不在、実行失敗、空結果、候補過多だけなら既存 gate・独立探索へ切り替える。同等以上の観測能力があり未証明範囲を増やさない代替手順を証跡化し、代替の履行なしに成功扱いしない。正規成果物側の実不整合は fail とする。

worktree で判定できなければ main 側 root で check を再実行し、トレーサビリティポリシー登録 commit の時系列を確認する。durable state 上で解消済みの対象行を本変更起因の失敗と誤判定しない。再実行は読取に限る。

## 重要変更の通知と結果説明（完了報告接続）

QG-4 と完了記録には、case-run の Issue 記録と PR 本文に照らして重要変更の実際の成立状況を反映する。実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める。事前通知したが実施されなかった変更を実施済みと判定・記録せず、一部成功・一部失敗・未確認・中断を実際の成立状況に応じて区別して記録する。証拠照合を通知で代替しない。通知を合格条件に追加せず、承認権限・安全境界・完了阻止条件を弱めない。

## 記録とクローズ

- 完了条件チェックボックスは case-close のみが更新する。QG-4 後の完了記録は判定根拠を含め、結果セクションに成果物・最終判定・残件の扱いを記録する。`agentdev-workflow-case-run/scripts/record-comments.ts` で検査後、`comment_create` / `issue_update` を行う。
- **委譲結果サマリとゲート確認の退避先参照**: 委譲実行（case-run）の結果は、ステータス（報告用 `completed` / `blocked` / `failed`）、副作用有無を含む判定要約、変更ファイルパス一覧、コミット SHA、Issue/PR 番号、テスト結果の pass/fail 件数、未達事項/ブロッカー、詳細成果物パスの八項目からなる構造化サマリ（UTF-8 上限目安 3〜4 KB 以内）として受け取りうる。完了判定（QG-4）はサマリ本文を根拠とせず、退避先（PR 本文の検証差分・Issue コメント SSoT・検証記録）の原文・証拠を参照して行う。
- 各検証を対応記録コメントへ記録する。形式は検証差分セクション規約に従い、case-run の PR 本文を比較元として、新規、修正済み、既出、撤回、無効を区別する。
- Epic 本文は case-close の単一書込みとし、closing 書込みと取りまとめを同一の per-Epic 排他制御・局所直列化の下で最新取得・マージ・更新する。Wave の Design 判定は直列集約し、既存の取りまとめ記録を消さない。
- Capture は PR 本文のみを入力に intake / learning を分離し、各経路の規則で永続化する。コミットは Issue の意図しない自動終了を起こさない参照形式を使う。
- 定型状態確認集約（case-open スキル配下の読取専用の単一実装。実行時パス `.opencode/skills/agentdev-workflow-case-open/scripts/src/collect_status_summary.ts`）: git 作業状態・対象ファイル整合・滞留キュー・GitHub 状態の定型確認の機械的集約。本スキルは複製実装を持たない（重複実装禁止）
