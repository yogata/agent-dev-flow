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
