# proxy-case-close resume procedure: Root Case #3293（docs-current-model-alignment-and-compression-foundation）Wave 1 GitHub 書込みの proxy 実行と case-auto 再開

## 状況（2026-10-01 時点の永続状態）

- Root Case #3293（Epic #3296・8 OU・Wave 6 本）の Wave 1（#3297/#3298/#3299）について、実装・検証・branch push・case-close 全ローカル gate（QG-4 含む）まで完了している。#3298/#3299 は case-close 1回目の QG-4 fail（契約テスト期待値・IR-055 新規 delta）から case-run 差し戻し → 修正 commit（#3298: 0b2e1e7b・#3299: 5448916f）→ case-close 再実行で全 gate 合格済み
- `agentdev_gh` が gh exit 66（起動環境障害・stderr 空・REQ-093 既知事象・回復は opencode serve 再起動のみ）で持続し、GitHub 書込み（PR merge・Issue close・コメント・Epic ステータス更新）が実行不能なため、verbatim 成果物を payload として永続化した。raw gh WRITE は実施していない
- 読取系（raw gh CLI・GitHub Web）は正常。PR #3305/#3306/#3307 はすべて OPEN・MERGEABLE・base main・変更ファイル集合は完全排他

## 対象 payload（本 procedure と同時永続化。適用後に consume 削除する）

1. `.agentdev/drafts/proxy-case-close-docs-current-model-alignment-ou-0001-merge-and-close.md`（#3297・PR #3305・書込み4操作）
2. `.agentdev/drafts/proxy-case-close-docs-current-model-alignment-ou-0002-merge-and-close.md`（#3298・PR #3306・書込み5操作〔pr_update title 含む〕）
3. `.agentdev/drafts/proxy-case-close-docs-current-model-alignment-ou-0003-merge-and-close.md`（#3299・PR #3307・書込み5操作〔pr_update title 含む〕）
4. `.agentdev/drafts/proxy-case-close-docs-current-model-alignment-epic-3296-wave1-status-update.md`（Epic #3296 本文更新・書込み1操作・3子 Issue 適用後に実行）

## 前提（開始条件）

- `agentdev_gh` が回復していること（probe: operation issue_read number 3293 が成功すること）。失敗する場合は本 procedure を実行せず、blocked 状態を維持する
- 作業前同期: `git pull --ff-only`（main は fe2656fc 系。payload commit 以降の main 側進行があれば取り込む）
- GitHub 書込みはすべて Custom Tool `agentdev_gh` 経由で実行する（raw gh WRITE 禁止）。同 Tool は書込み後の読み取り検証（fail-closed）を内蔵する

## 手順

1. **OU-0001（#3297・PR #3305）の適用**: payload 1 の操作 ①〜④（issue_update 最終本文 → pr_merge #3305 squash → issue_close #3297 completed → comment_create 対応記録コメント）を順に実行。各操作は payload 記載の冪等性に従い、済んでいる操作は skip
2. **OU-0002（#3298・PR #3306）の適用**: payload 2 の操作 ①〜⑤（issue_update 最終本文 → pr_update #3306 title〔Refs 追記〕→ pr_merge #3306 squash → issue_close #3298 completed → comment_create 対応記録コメント）
3. **OU-0003（#3299・PR #3307）の適用**: payload 3 の操作 ①〜⑤（issue_update 最終本文 → pr_update #3307 title〔Refs 追記〕→ pr_merge #3307 squash → issue_close #3299 completed → comment_create 対応記録コメント）
4. **Epic #3296 ステータス更新**: payload 4 の操作 ①（issue_update #3296・Wave 1 の 3行 completed 化 + 件数表 pending 5 / completed 3）。手順 1〜3 の merged/closed 確定後に 1回だけ実行（単一書き手）
5. **最終状態確認（読取）**: PR #3305/#3306/#3307 = MERGED、Issue #3297/#3298/#3299 = CLOSED（reason completed）、各 Issue 本文の完了条件 checkbox が [x]、対応記録コメントが各 Issue に 1件、Epic #3296 の分解テーブル Wave 1 行が completed・件数表が pending 5 / completed 3。origin/case-3297,case-3298,case-3299 は deleteBranchOnMerge により自動削除されているはず（残っていても手動削除しない–GitHub 設定に委譲）
6. **worktree・ローカル branch クリーンアップ（case-close STEP-6 の DOWN mode SKIP 分の回収）**: `git worktree remove .worktrees/3297-case` / `.worktrees/3298-case` / `.worktrees/3299-case`（クリーン状態を確認のうえ。汚れがある場合は `--force` でなく内容確認後に判断）。続けて `git branch -D case-3297 case-3298 case-3299`（squash merge のため `-d` は未マージ判定になることに注意）
7. **Capture 回収（case-close STEP-6・PR 本文のみを capture 入力源とする）**: PR #3305/#3306/#3307 の本文「Findings/ Capture候補」節から intake / learning を分離して保存
   - intake（.agentdev/intake/inbox/ へ item 保存）: ① REQ-003-055 phantom citation（docs/designs/foundations/v4-responsibility-boundaries.md:44,:67、docs/requirements/REQ-003.md:56。main/worktree 同一検出・本 Case 非起因）② REQ-032.md frontmatter updated (2026-09-29) ≠ last content-change commit date (2026-10-01)（IR-072・本日別 merge 起因）③ PR 本文各末尾に記録された横断残存 concrete 箇所（case-run/case-auto/case-revise 系の TS-001 残存・OU-0008 担当分の引継ぎ）
   - learning（.agentdev/learning/inbox.md へ追記）: ① 契約テストが配布物本文を verbatim pin する構成では、配布物側の判断境界文言更新が repo-side テスト期待値の遅延不整合を生む（文言更新を含む配布物変更では同一変更セット内で pin テスト期待値の同期を予防確認する価値。#3298 事例）② integrity suite のサブプロセス実行型回帰テスト（IR-055 実修復回帰・NG21）はテスト側 15 秒タイムアウトを持ち、同一 HEAD・同一 canonical 形式で環境負荷により 0 fail ⇄ 4 fail が変動する（main root 同一再現で確認済み。タイムアウト値見直しまたは実行系分離が安定化方策）③ agentdev_gh exit 66 持続時の縮退運用（probe 1回 → write 持続確認 1回 → 書込み打ち止め → payload 化）が機能したことを記録（REQ-093 既知事象の運用実績。新規登録ではなく補強）
8. **payload の consume 削除と git 永続化**: 上記 1〜7 完了後、payload 4件 + 本 procedure ファイルを削除し、Capture 成果物（intake item・learning inbox エントリ）と合わせて commit・push（commit message 例: `chore(agentdev): consume case-close proxy payload for wave 1 (Refs #3293)`・auto-close キーワード不使用）
9. **case-auto 再開**: Root Case #3293 に対して case-auto を再開する（resume）。再開点 = orchestration stage 3 の Wave 反復・Wave 2 開始判定（Wave 1 収束=3子 Issue 実行結果確定 + Wave 2 依存充足=#3299 完了）。Wave 2 は #3300（OU-0004: docs/designs/** 現在形純化スイープ、前提 #3299）→ Wave 3 #3301 → Wave 4 #3302（前提 #3297,#3298,#3301）→ Wave 5 #3303 → Wave 6 #3304 と続く。Epic stage 3 完了後は stage 4 case-close(#epic) を経て STEP-8 完了報告へ

## 完了条件

- 手順 1〜5 の GitHub 最終状態が揃っていること（手順 5 の確認項目すべて）
- 手順 6〜8 のローカル後処理（worktree 削除・Capture 回収・payload consume 削除・git 永続化）が完了していること
- 手順 9 の case-auto 再開が Wave 2 以降の自走に移行したこと（または case-auto 自身の停止条件に従って次の停止点で報告されたこと）

## 備考

- 本 procedure は case-auto（Root Case #3293）の stage 3 Wave 1 fan-in（case-close×3）の DOWN 時代理実行分である。case-close 各委譲の全ローカル gate 合格・QG-4 成立の evidence chain は各 payload の「実行前提」節に要約済み
- Root Case #3293 の状態遷移: 本 procedure 適用完了までは blocked（GitHub 書込み待ち）、適用完了後に case-auto 再開で running へ戻る
- merge 順序は OU-0001 → OU-0002 → OU-0003 を推奨（#3297 は Phase 1 から merge-ready・#3305/#3306/#3307 の変更ファイル集合は完全排他のため順序依存は実質なし）。Epic 更新は最後
