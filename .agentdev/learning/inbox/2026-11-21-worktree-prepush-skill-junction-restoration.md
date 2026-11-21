---
id: learn-20261121-worktree-prepush-skill-junction-restoration
created_at: 2026-11-21
source: case-run capture (PR #4174・Wave-2 #4170・Root Case #4167)
status: inbox
---

# pre-push Step 1/2 は worktree 内に .opencode 投影側 junction が無いとモジュール解決で必ず失敗する

- 問題事象: pre-push フック（Step 1/2）は `.opencode/` 投影側チェッカーを worktree root で実行するため、main root の `.opencode/skills/<name>` junction（52 件・git 非追跡）が worktree に伝播していないとモジュール解決で必ず失敗する。同様に cli.ts・traceability check・textlint gate・機械工程 script が参照する各 skill scripts 配下 node_modules と textlint-guard の node_modules/vendor も git 非追跡のため worktree には生成されない
- 発生局面: case-run（PR #4174・Wave-2 #4170）の pre-push ゲート実行・case-close 機械ゲート（pre-merge）の worktree 環境準備
- 検知方法: worktree 内での gate 実行体存在確認（close_mechanical_steps.ts --validate-input の gateAvailability）とモジュール解決失敗の実観測
- 根本原因: 投影構造（src/ 正本 → .opencode/ 投影）は junction で実現され、junction と node_modules/vendor は git 管理対象外。git worktree は git 管理対象ファイルのみを checkout するため、投影と依存実体が worktree に自動復元されない
- 自律対応内容: worktree 内に main root と同構成の junction を復元して解消した（node symlinkSync junction・61 件: .opencode/skills 52 件・src/common/skills 7 skill scripts node_modules・textlint-guard node_modules/vendor。成果物変更なし・gitignore 対象のため worktree status はクリーン維持）
- ユーザー確認有無: なし（監督承認済みの環境復元・成果物変更なし）
- 横展開観点: worktree で integrity suite・traceability check・textlint・機械工程 script を実行する全経路（case-run の pre-push ゲート・case-close の機械ゲート等）に共通する必須の環境準備であり、省略すると fail-closed ゲートが構造的に失敗する
- 再発条件: git worktree を作成して .opencode/ 投影側チェッカーまたは skill scripts の node_modules 依存を持つ検証を実行する場合
- 予防策候補: (a) worktree 作成手順への junction 復元の組み込み、(b) knowledge 化（docs/knowledge/ 等への手順記録）、(c) 機械ゲート側での gateAvailability 事前確認の維持
- 想定反映先: agentdev-git-worktree（worktree 作成手順）、agentdev-workflow-case-close（機械ゲート実行前の環境準備手順）、case-run（pre-push ゲート実行手順）
- 関連: Case #4170、PR #4174（Findings に記録済み・本 entry は case-close Capture 回収分）
- タグ: worktree、junction、投影構造、環境準備、pre-push、fail-closed
