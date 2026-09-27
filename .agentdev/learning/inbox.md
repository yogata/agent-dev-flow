# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## agentdev_gh issue_update の入力契約は role フィールドを受けない（issue_create と共通の role 指定を転記すると invalid-input）

- **問題事象**: case-open（Root Case Issue #3189 の adf_case 埋め戻し）で agentdev_gh の issue_update を、issue_create と同じ入力構成（role: case を含む）で呼び出したところ、unknown-field [role] の invalid-input で rejected された。
- **発生局面**: 実装（case-open lifecycle STEP-2 の Issue 作成後埋め戻し。Root Case Issue #3189）
- **検知方法**: Custom Tool agentdev_gh の fail-closed 応答（kind: invalid-input、detail: field 'role' is not part of the issue_update input contract）
- **根本原因**: agentdev_gh の操作カタログでは role は issue_create / issue_list の入力契約に存在し、issue_update には存在しない。操作共通の論理役割指定（role: case）を issue_update へも転記できると想定した呼出側の契約把握不足。
- **自律対応内容**: role フィールドを除いた同一本文・同一タイトルで issue_update を再実行し、埋め戻しを完了（成功応答で検証済み）。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Tool 入力契約の範囲内の修正）
- **横展開観点**: issue_close / issue_reopen / issue_update 等、番号特定済みの後続操作では role を渡さない。issue_create → issue_update 連鎖で role を引き回す実装・プロンプトでは操作ごとの入力契約差異を意識する。
- **再発条件**: issue_create の呼出引数を流用したまま issue_update / issue_close / issue_reopen へ role を含めて渡した場合。
- **予防策候補**: agentdev_gh の操作切替時に操作固有の input contract を確認する。role は操作対象特定のための issue_create / issue_list 専用フィールドとして扱う。
- **想定反映先**: agentdev_gh Custom Tool の操作別 input contract 差異の明記（契約ドキュメント）、または issue 操作知識（agentdev-issue-tracking）への追記。
- **関連**: Root Case Issue #3189、src/opencode/skills/agentdev-workflow-case-open/
- **タグ**: `#gh-tool` `#issue-update` `#input-contract`
