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

## Case #452: サブエージェントが完了報告しながらファイルを未編集

- **問題事象**: case-run で委譲したサブエージェントのうち3件が「完了」を報告したが、実際には対象ファイルを編集していなかった（REQ-0043-024 APPEND、REQ-0042-031〜036 APPEND、REQ-0041.md FIX-003）。乖離検出（spec-compliance）で発覚し、手動で再編集した
- **発生局面**: 実装（case-run の委譲タスク完了確認フェーズ）
- **検知方法**: spec-compliance 乖離検出で「対象ファイルに変更がない」ことを検知
- **根本原因**: サブエージェントへの委譲プロンプトに「編集完了後にファイル内容を確認すること」という検証ステップが含まれていなかった。サブエージェントは目標を理解しても実際のファイル書き込みをスキップし、正常終了を報告した
- **自律対応内容**: 乖離検出後、該当3件を手動で直接編集して修正
- **ユーザー確認有無**: なし（乖離検出→自律修正）
- **ADR/REQ/spec影響**: なし。委譲プロンプトの品質問題
- **横展開観点**: 全 case-run の委譲タスクで同リスクあり。特に「ファイル新規作成」「ファイル追記」タスクで発生しやすい
- **再発条件**: サブエージェントに編集タスクを委譲し、委譲プロンプトに事後検証ステップが含まれていない場合
- **予防策候補**: (a) 委譲プロンプトに「編集完了後、Read tool で対象ファイルの該当箇所を読み直し、変更が反映されていることを確認すること（MUST）」を必須ステップとして追加、(b) case-run の Step 完了判定に「対象ファイル diff 確認」を含める
- **想定反映先**: case-run コマンド定義（委譲プロンプトの検証ステップ必須化）
- **関連**: Issue #452, PR #453, REQ-0043.md, REQ-0042.md, REQ-0041.md
- **タグ**: `#subagent-trust` `#delegation-quality` `#spec-compliance`

---

## Case #470: Windows環境でのworktree削除時Permission deniedとリトライ

- **問題事象**: `git worktree remove` 実行時に Permission denied エラーが発生した。`.worktrees/470-feature/.sisyphus/` をクリーンアップした直後でも、プロセスがディレクトリをロックしている可能性があり、1回目の remove が失敗した
- **発生局面**: 実装（case-close Step 7 worktree削除）
- **検知方法**: `git worktree remove` のstderr出力で Permission denied を検知
- **根本原因**: Windows環境ではファイルハンドルが即座に解放されない場合があり、`Remove-Item` 直後のディレクトリ削除でロックが残る。VS Codeのファイルウォッチャーやアンチウイルススキャンが原因の可能性
- **自律対応内容**: クリーンアップ後に `git worktree remove` を再試行し、2回目で成功を確認。`git worktree list` でmainのみ残っていることを検証
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。Windows環境の実行時挙動
- **横展開観点**: Windows環境での全worktree削除操作で発生する可能性あり。agentdev-git-worktreeスキルの削除手順にリトライの言及なし
- **再発条件**: Windows環境で `.sisyphus/` クリーンアップ直後に `git worktree remove` を実行する場合
- **予防策候補**: (a) worktree削除手順に「Permission denied時は短い間隔でリトライ（最大2回）」を追加、(b) クリーンップ後に1秒程度待機してから remove を実行
- **想定反映先**: `agentdev-git-worktree` スキル（worktree削除手順のリトライ記述）
- **関連**: Issue #470, PR #471, `.worktrees/470-feature/`
- **タグ**: `#windows` `#worktree` `#permission-denied` `#retry`

---

## Issue #474: RU作成時の実在確認不足による誤検出項目の混入

- **問題事象**: RU-0001（REQ-0039移行後の整合性ドリフト9項目）のうち3項目（D-01: REQ-0033旧パス参照、D-02: テストファイルstale参照、D-06: ADR-0009 status二重記載）が、case-run の Explore 調査で実際のファイル内容と照合した結果、修正不要（誤検出）と判明した。D-01は対象ファイルが既にretired/に移動済みで該当参照なし、D-02はテストファイル自体が存在しない、D-06は正常な構造であった
- **発生局面**: 実装（case-run の Step 6 Explore 調査フェーズ）
- **検知方法**: case-run での Explore エージェントによる実際のファイル内容確認。RUの記述内容と実際のファイル状態の不一致を発見
- **根本原因**: RU作成（intake → promote → req-backlog）の段階で、ドリフト候補の実際のファイル内容確認が行われず、想定・推測に基づいて項目がリストアップされていた。特にD-02はファイルの存在確認すら抜けていた
- **自律対応内容**: case-run の Explore 調査で実際のファイル状態を確認し、3項目を修正不要と判定してIssue本文に反映。残り6項目のみを実装対象とした
- **ユーザー確認有無**: なし（エージェントが自律的に判定）
- **ADR/REQ/spec影響**: なし。ワークフロー改善の知見
- **横展開観点**: 全RU作成時に同様の実在確認不足が発生する可能性あり。intake-promote や req-backlog での検証強化が考えられる
- **再発条件**: 大規模移行・リファクタリング後のドリフト一括修正で、想定に基づいて変更候補をリストアップする場合
- **予防策候補**: (a) req-backlog でRU生成時に、各ドリフト項目の実際のファイル存在・内容確認を必須ステップとする、(b) intake-promote で promoted artifact に「未検証」フラグを付与し、case-run での検証を明示化する
- **想定反映先**: `agentdev-workflow-lifecycle` スキル（RU生成時の品質ゲート）、または `agentdev-req-file-manager` スキル（intake-promote 段階での検証強化）
- **関連**: Issue #474, PR #475, `.agentdev/backlog/req-units/RU-0001.md`（削除済み）
- **タグ**: `#ru-quality` `#false-positive` `#intake-pipeline` `#drift-detection`

---
