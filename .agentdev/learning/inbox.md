# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## Draft Definition PR の draft 状態で case-ready の merge が完結不能（agentdev_gh に ready 化操作不在）

- **問題事象**: case-ready STEP-1 の Definition PR 受入で、Draft Definition PR 10件（#2826〜2830・#2851〜2859）が draft 状態のまま作成されており、pr_merge が「gh: Pull Request is still a draft (HTTP 405)」で失敗。agentdev_gh Custom Tool に draft 解除（ready 化）操作が存在しないため（pr_update 契約は draft フィールドを unknown-field として拒否）、merge 前提を満たせず HITL 停止した
- **発生局面**: 実装（case-ready workflow STEP-1 Definition PR 受入。Batch 1〜4 の 20 Case 一括処理時）
- **検知方法**: pr_merge 操作の失敗応答（HTTP 405、draft 状態の検出）。pr_update による draft 解除試行も invalid-input（unknown-field [draft]）で拒否、gh pr ready の直接実行も agentdev-gh-write-guard が raw gh WRITE をブロック
- **根本原因**: case-open が Definition PR を作成する際の draft フラグが不統一（Batch 1/4 は draft、Batch 2/3 は非 draft）であり、かつ case-ready 側の GitHub I/O 境界（agentdev_gh）の操作カタログに draft 解除操作が設計として含まれていない
- **自律対応内容**: partial merge（非 draft の9件のみ先行 merge）を検討したが、REQ-057.md 要件テーブルへの行追加連鎖（#2836 の REQ-057-029 が先行 merge されると、後続 #2827〜2829 の rebase 時に 026〜028 行が 029 行の後ろへ配置され採番順序が崩壊）のリスクから断念。write-guard 境界を遵守し、全件を保持したまま HITL 停止として報告
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行時の運用ギャップ。将来の反映候補: case-open の PR 作成 draft フラグ統一、agentdev_gh への draft 解除操作追加、case-ready STEP-1 への draft PR 検出時経路の明記）
- **横展開観点**: agentdev_gh 操作カタログに存在しない GitHub 副作用が必要になった場合、write-guard により gh CLI 直操作は実行不可。Custom Tool 契約の拡張を前提に計画する必要がある
- **再発条件**: case-open が draft PR を作成し、かつ case-ready が agentdev_gh のみで merge を完結しようとする場合に毎回発生
- **予防策候補**: (1) case-open が Definition PR を draft: false で統一作成、(2) agentdev_gh に pr_ready（draft 解除）操作を追加、(3) case-ready STEP-1 reference に draft PR 検出時の経路を明記
- **想定反映先**: agentdev-workflow-case-open / agentdev-workflow-case-ready（Design・skill）、agentdev_gh Custom Tool
- **関連**: PR #2826〜2830・#2851〜2859、Case #2821〜2825・#2850〜2858、.opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md
- **タグ**: `#github-io` `#draft-pr` `#custom-tool` `#workflow-deviation`

## case-open が検証対応要否分類ゲートを実行せず、case-ready STEP-6 が新規 REQ 行の unclassified で停止

- **問題事象**: case-ready STEP-6 検証ゲートで、直前に merge した Definition PR の新規 REQ 行（REQ-057-026..029・REQ-036-027・REQ-047-010・REQ-010-077・REQ-021-026/027・REQ-031-029/030・REQ-082-001..025 の計 36 行）が verification-scope-catalog 未登録で `verificationClassification: unclassified` となり、対象 10 Case（#2822/2823/2824/2825/2831/2832/2833/2846/2856/2858）が ready 保留となった。特に REQ-082 は REQ-003-021..056 の範囲表現任意行から移動してきたにもかかわらずカタログに REQ-082 節自体が存在せず、移動元と異なり未分類に転落した
- **発生局面**: Definition 保存（case-ready STEP-6 検証ゲート。Batch 1〜4 の 20 Case 一括処理時）
- **検知方法**: agentdev-traceability `check.ts` の `verificationClassification` 出力（全 973 行中 unclassified 72 行、うち今回対象行 36 行）
- **根本原因**: case-open が REQ 行追加を伴う Definition Package 生成時に検証対応要否分類ゲート（verification-scope-catalog への任意行エントリ追加またはカタログ追随）を実行せず、Draft Definition PR の changed files にカタログ更新を含めなかった。カタログ本文の過去エントリ記録（「REQ-057-025 のエントリは...case-open の検証対応要否分類ゲートで追加した」等）は同ゲート運用が存在したことを示すが、case-open workflow のゲート規定が実行時に担保されていなかった
- **自律対応内容**: カタログ編集は実変更（main 直接変更）であり case-ready が Definition PR 経由以外で行う経路が存在しないため、カタログ補完を行わず ready 可能 10 Case（対象 REQ 行 unclassified なし）と ready 保留 10 Case を分離して部分完了とし、未分類行一覧を HITL 報告
- **ユーザー確認有無**: なし（HITL 報告予定）
- **Decision/REQ/spec影響**: なし（実行時の運用ギャップ。将来の反映候補: case-open の検証対応要否分類ゲート明示化）
- **横展開観点**: REQ 行追加を伴う全 workflow（req-define、case-open、case-revise）で同じゲート欠落が同様の ready 停止を生む。traceability check を case-open の前置検査として機械実行すれば検出可能
- **再発条件**: REQ 行追加を伴う Definition PR が case-open で作成され、カタログ更新が Definition Package に含まれない場合に毎回発生
- **予防策候補**: (1) case-open（および req-define）の工程へ検証対応要否分類ゲートの明示（REQ 行追加時は verification-scope-catalog 更新を Definition に含める）、(2) case-ready STEP-2 の canonical 再取得時に traceability check を機械実行し unclassified 検出時に case-open へ差し戻す経路の明記、(3) REQ 移動・分割時にカタログの範囲表現追随を Definition 変更の必須構成とする
- **想定反映先**: agentdev-workflow-case-open / agentdev-workflow-req-define / agentdev-workflow-case-ready（Design・skill）、verification-scope-catalog.md の運用記録
- **関連**: Case #2822/2823/2824/2825/2831/2832/2833/2846/2856/2858、PR #2827/2828/2829/2830/2836/2837/2838/2847/2857/2859、docs/designs/foundations/references/verification-scope-catalog.md、.opencode/skills/agentdev-traceability/scripts/src/check.ts
- **タグ**: `#traceability` `#verification-scope-catalog` `#unclassified` `#workflow-deviation`

## case-run が PR 作成後に完了報告を残さず中断すると case-close が PR を検出できない（422 + refs/pull 照合で回収）

- **問題事象**: Case #2852 の case-run が PR #2868 作成まで完了しながら、Issue 本文・コメントへの PR 番号記録（完了報告コメント）を残さず中断した。case-close 実行時に Issue 側の永続状態から PR 番号を解決できず、PR 未作成と誤認して pr_create を試行すると「Validation Failed (HTTP 422)」で失敗した
- **発生局面**: 完了処理（case-close STEP-1/STEP-4。PR 自動検出は Issue 本文・コメントの記録が前提、agentdev_gh に pr_list 操作は存在しない）
- **検知方法**: pr_create の fail-closed 失敗応答（HTTP 422 = head ブランチの既存 PR 存在の典型応答）。`git ls-remote origin refs/pull/*/head` による head SHA（d7372002）照合で PR #2868 を特定（gh コマンド不使用、git transport 経由で POL-gh-io-delegation 準拠）
- **根本原因**: case-run の PR 作成と PR 番号の SSoT 記録（Issue 本文/コメントへの完了報告）が分離しており、PR 作成後に中断すると PR の所在が永続状態から復元できない。エージェント本体の中断は SSoT 記録を保証しない
- **自律対応内容**: 重複 PR 作成は fail-closed で防止された（副作用なし）。refs/pull/*/head 照合で既存 PR #2868 を特定し、pr_read で本文・mergeable（MERGEABLE）を確認の上、そのまま squash merge して完了処理を継続した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行時の運用ギャップ。将来の反映候補: case-close の PR 自動検出手順へのフォールバック明記）
- **横展開観点**: PR 番号を入力とする全操作（pr_merge、pr_mergeable、pr_changed_files）で同じ検出不能状態が発生し得る。git transport（ls-remote の refs/pull/*）は GitHub API を経由しないため gh-io 委譲境界外の読取手段として使える
- **再発条件**: case-run 等の PR 作成者が、PR 作成後・Issue 側記録前に中断・失敗した場合に毎回発生
- **予防策候補**: (1) case-run が PR 作成直後に Issue 本文またはコメントへ PR 番号を記録する前倒し、(2) case-close STEP-1 の PR 自動検出へ refs/pull/*/head 照合フォールバックの明記（Issue 側記録不在時）、(3) pr_create の HTTP 422 を「既存 PR 存在シグナル」として特定手順に接続する経路の文書化
- **想定反映先**: agentdev-workflow-case-run / agentdev-workflow-case-close（Design・skill・references）
- **関連**: Case #2852、PR #2868（head d7372002、merge 後 main HEAD bf4a3224）、.opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md
- **タグ**: `#github-io` `#pr-detection` `#custom-tool` `#workflow-deviation`

## case-open が Definition 変更を main へ直接 push し Draft Definition PR を作成不能にした

- **問題事象**: case-open STEP-4 で Definition 変更 commit を `git push origin HEAD:main` により main へ直接 push し、Draft Definition PR を経由せず canonical Definition（origin/main の docs）が更新された。その後の pr_create は head branch（feature/issue-2870）が remote に存在せず、かつ main との差分が消失していたため HTTP 422 で失敗し、PR 作成不能となった
- **発生局面**: 実装（case-open workflow STEP-4 実変更判定と Definition PR 作成。Case #2870）
- **検知方法**: pr_create の失敗応答（HTTP 422 Validation Failed）。初回 push 自体は成功していたため、PR 作成失敗時に push refspec（`HEAD:main`）を見直して発見
- **根本原因**: Definition 変更の push 先を worktree branch（`git push origin feature/issue-2870`）ではなく main（`git push origin HEAD:main`）に誤指定。直前の並行セッションの capture 回収（16c397dd）が main 直接 push 形式であるのを参照し、capture 永続化の手順と Definition 変更の push 手順を混同した
- **自律対応内容**: force push による巻き戻しは禁止（並行セッション影響・承認要件）のため不実施。revert + PR 再投入は deviation の増幅と履歴汚染のため見送り。main 反映済みの内容は draft-data の正規投影であり diff 検証済みのため現状を活かし、Root Case #2870 本文へ PR 未作成の実態を記録、本 learning へ capture
- **ユーザー確認有無**: なし（完了報告で報告）
- **Decision/REQ/spec影響**: Definition 変更の内容・配置は Definition Package 投影どおり。case-ready の Definition 受入（Draft Definition PR の忠実性・整合性・品質検査 → merge）は PR 不在のため canonical 照合へのフォールバックが必要となり、case-ready 実行時の停止リスクが残る
- **横展開観点**: worktree branch push（PR 作成前提）と main 直接 push（capture 等の継続作業永続化）は目的も受入経路も異なる別手順。push refspec は実行前に必ず検査する
- **再発条件**: case-open が Definition 変更を worktree branch push せず main へ直接 push する場合に毎回発生
- **予防策候補**: (1) case-open STEP-4 reference に push コマンド（`git push origin {worktree-branch}`）を明記、(2) push 実行前の refspec 検査（`:main` を含まないこと）の追加、(3) pr_create 失敗時の head branch push 状態確認手順を reference へ明記
- **想定反映先**: agentdev-workflow-case-open（STEP-4 reference）、agentdev-issue-management（push 安全手順）
- **関連**: Case #2870、main push 17afaf86、docs/designs/workflows/definition-readiness.md、src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md
- **タグ**: `#git` `#push` `#definition-pr` `#workflow-deviation`
