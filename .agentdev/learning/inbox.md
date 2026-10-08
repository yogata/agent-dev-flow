# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 新規起票直後の issue_list search トークン検索が空を返す（GitHub search インデックス遅延）

- **問題事象**: issue_create 直後の STEP-5 冪等検出で、search トークン「verification-infra」（作成済み Issue 本文に含む）による issue_list が空配列を返した。直前に issue_create 成功（VERIFY 済み）を確認した Issue #3550 は GitHub 上に実在する
- **発生局面**: 実装（case-open STEP-5 冪等検出。case-auto stage 1 からの委譲実行）
- **検知方法**: issue_list の検索結果が空であることと、直前の issue_create 成功報告（#3550）との矛盾
- **根本原因**: GitHub search API は新規 Issue を検索インデックスへ反映するまで時間差がある。起票直後の search トークン検索は該当 Issue をヒットさせない
- **自律対応内容**: search による検出を、既知番号の issue_read（#3550 直接読取で存在・本文・状態を確認）と issue_list の role=case + state=open フィルタ列挙へ切替して冪等検出を完了した。切替は「GitHub I/O 失敗時の gh CLI 切替継続手順」の再試行後切替規律に倣い、冪等キー基準は変更しなかった
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存手順内 contingency の適用のみ。新規契約・規則変更なし）
- **横展開観点**: case-ready 円等検出・Epic Wave 重複前置検出・兄弟 Case 検出など、search トークンで直近起票 Issue を探す全工程へ適用できる。role/state フィルタ列挙は search インデックス遅延の影響を受けない
- **再発条件**: issue_create 直後（数十秒〜数分以内）に、同じ対象を search トークンで検索した場合
- **予防策候補**: 起票直後の検出では search に依存せず、(1) 既知番号の issue_read による直接確認、(2) role/state フィルタによる列挙のいずれかで代替する。search は起票から十分な時間が経過した対象の検索に限定する
- **想定反映先**: agentdev-issue-management issue-operation-safety.md「issue_list の絞り込み規律と上限到達時 contingency」節への補足候補
- **関連**: Issue #3550、src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md「GitHub I/O 失敗時の gh CLI 切替継続手順」節
- **タグ**: `#issue_list` `#search-index-lag` `#idempotent-detection`

## 並行 case-open で関連 Jev 観測の先行 commit により partial commit が実体乖離する

- **問題事象**: case-open STEP-1 入口の先行明示パス commit で、自 Case の draft と関連 Jev 観測（req-define のバッチ構成評価。13 RU→4 draft 全体の共通観測）を commit 対象に含めたが、兄弟 Case（verification-infra）が同一観測を先行 commit（e6707290）済みだったため、自 commit（9929404b）には draft のみが含まれた。commit message は「persist ... req-draft and jev observation」であり、実体（1 ファイル）と message（2 資産）が乖離した
- **発生局面**: 実装（case-open STEP-1 untracked domain state 先行 commit。case-auto stage 1 からの委譲実行）
- **検知方法**: commit 後の出力「1 file changed」が、commit 対象に含めた 2 パスと不一致
- **根本原因**: バッチ共通の Jev 観測（subject が draft 群全体の構成評価）は複数 Case の関連観測として二重選定される。`git commit -- <paths>`（partial commit）は既に tracked になり差分のないパスを含めず、message との乖離が残る
- **自律対応内容**: 観測自体は永続化済み（兄弟 commit による）であり永続化の対は成立していたため、実害なしとして処理を継続した。message 修正（amend）は並行実行中の main 履歴に対して行わない
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存手順内での観測。契約変更なし）
- **横展開観点**: バッチ共通の Jev 観測・draft を複数 Case が commit する並行 case-open 全体。先行 commit の成否ではなく「commit message に挙げた資産が実在するか」を commit 直前に照合する規律が有効
- **再発条件**: 複数 Case が同一の共通観測（バッチ構成評価等）を関連観測として commit 対象に含め、片方が先行した場合
- **予防策候補**: 先行明示パス commit の message は、`git add` 後に `git status --short` で実際に新規 untracked のまま残っている対象のみを列挙して組む（既に tracked な対象を message に含めない）
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/handoff.md「入口の untracked domain state 検出と先行明示パス commit」節への補足候補
- **関連**: Issue #3548、commit 9929404b・e6707290、Issue #3550 の学び（search インデックス遅延）と同系統の並行実行 contingency
- **タグ**: `#case-open` `#jev-observation` `#parallel-case-open` `#commit-message-accuracy`

