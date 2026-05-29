# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

## Epic #421: 並列PRの順次マージ時コンフリクト予防

- **問題事象**: 5子IssueのPR（#427〜#431）がすべて main から独立して分岐していたため、順次マージ時に6ファイルでマージコンフリクトが発生した。特に PR #430（Wave 3）は Wave 1-2 の変更と多数衝突した
- **発生局面**: 実装（Epic Orchestrator case-run の PR マージフェーズ）
- **検知方法**: Oracle検証でテストマージを実施し発見
- **根本原因**: Epic Orchestrator が各 Wave の subagent に main ベースの worktree を提供し、先行 Wave のマージ結果を後続 Wave のブランチに取り込まなかったため。PR は個別には main に対して CLEAN だが、累積マージ状態に対してはコンフリクトを起こす
- **自律対応内容**: 各PRを順次リベース（main の最新状態に rebase）→ コンフリクト手動解決（テンプレート削除の維持、reference ファイルは --theirs 採用）→ force push → マージ。PR #430 は6ファイルのコンフリクト解消が必要だった
- **ユーザー確認有無**: なし（エージェントが自律的に解決）
- **ADR/REQ/spec影響**: なし。case-run の実行時挙動の問題であり仕様の不備ではない
- **横展開観点**: 2+ Wave の Epic で、後続 Wave が先行 Wave のファイルを変更する場合に常に発生するリスク
- **再発条件**: 1 Epic 内で複数 Wave が共通ファイルを変更し、各ブランチが main から独立分岐している場合
- **予防策候補**: (a) case-run の Epic Orchestrator が各 Wave 開始時に、先行 Wave の累積マージ結果を後続 Wave のブランチに rebase する仕組みを追加、(b) 参照整合性更新（Wave 3等）を最終 Wave としてスケジュールし、先行 Wave をすべてマージ後に worktree を作成する
- **想定反映先**: `agentdev-workflow-orchestration` スキル（Wave実行後のリベース推奨追加）、または case-run コマンド定義（Step 8 以降の PR マージ手順）
- **関連**: Epic #421, PR #427〜#431, `agentdev-workflow-orchestration`
- **タグ**: `#epic-orchestrator` `#merge-conflict` `#wave-scheduling`

## Epic #421: case-run サブエージェントの stale 参照見落とし

- **問題事象**: intake-promote.md に10件の stale な `intake-open` 参照が残っていた。5子Issueのいずれも intake-promote.md を更新対象としていなかった（スコープ外判定）
- **発生局面**: レビュー（Oracle検証フェーズ）
- **検知方法**: Oracle検証で `intake-open` 参照の全件grepを実施し発見
- **根本原因**: REQ-0039 のスコープ定義で intake-promote.md が更新対象に含まれていなかった。各子Issueは自身のスコープ内のファイルのみを更新し、他コマンドへの波及効果を検査していなかった
- **自律対応内容**: 該当10件を `intake-open` → `req-backlog` に更新（commit 66bf316）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。実行時の見落とし
- **横展開観点**: コマンドの削除・名称変更を伴う要件変更では、コマンド定義ファイル以外の参照元（他コマンドからの呼び出し、スキル内の参照、テストコード）を常にgrepで網羅確認すべき
- **再発条件**: コマンドの削除・名称変更がスコープに含まれる場合
- **予防策候補**: case-run の実装フェーズで「削除・変更対象キーワードの全コードベースgrep」を必須ステップとする
- **想定反映先**: case-run コマンド定義（乖離検出ステップの強化）
- **関連**: Epic #421, commit 66bf316, intake-promote.md
- **タグ**: `#stale-reference` `#scope-gap` `#intake-open-deletion`

## Epic #421: Epic ステータステーブルの更新漏れ

- **問題事象**: Epic #421 のステータス追跡テーブルで、子Issue #422/#425/#423/#424 が `🔄 進行中` のままだった。#426 のみ更新されていた
- **発生局面**: レビュー（Oracle検証フェーズ）
- **検知方法**: Oracle検証で Epic 本文を確認し発見
- **根本原因**: case-run のサブエージェントが親 Epic のステータス更新を行わなかった。Epic Orchestrator の Wave 開始時に親エージェントが一括で `🔄 進行中` に更新したが、完了時の更新は case-close の責務とされており、各サブエージェントは完了報告のみ行った
- **自律対応内容**: 親エージェントが Epic #421 本文を直接編集し、5子Issueすべてを `✅ 完了` に更新
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。`agentdev-epic-tracker` の運用上の問題
- **横展開観点**: Epic Orchestrator の全実行で同様のリスクあり
- **再発条件**: Epic Orchestrator で Wave 完了後にステータステーブルを更新しない場合
- **予防策候補**: Epic Orchestrator の Wave 完了後に、親エージェントが該当 Wave の子Issue ステータスを一括更新するステップを明示的に追加する
- **想定反映先**: `agentdev-workflow-orchestration` スキル（Wave完了後のステータス更新ステップ）
- **関連**: Epic #421, `agentdev-epic-tracker`
- **タグ**: `#epic-orchestrator` `#status-tracking` `#epic-tracker`

---
