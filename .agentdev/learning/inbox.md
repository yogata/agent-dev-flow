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
