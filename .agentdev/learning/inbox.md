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

