---
id: 2026-11-24-category-model-delegate-large-tool-call-reset
created_at: 2026-11-24T13:45:00+09:00
source: case-close (Issue #4218 PR #4219 本文 Findings の回収)
status: unreviewed
---

# 大型本文の書込みを要する工程委譲で category モデルの委譲先が tool 呼び出しを完了できなかった

- **問題事象**: case-open の工程で、委譲先のセッション（category モデル）が Root Case 起票の大型 tool 呼び出しを 2 回完了できなかった（各回、約 10 分後に接続リセット）
- **発生局面**: 実装（Issue #4218 の case-open 工程）
- **検知方法**: 委譲 prompt から実行担当（DEL-4218-1）が引継いだ経緯の記載（PR #4219 本文）
- **根本原因**: 未確定。大型本文の書込みを要する工程委譲での発生が疑われる（PR 本文の記載による）
- **自律対応内容**: 親オーケストレータが監督指示により起票を直接実行した。以後の工程委譲は general エージェントで完了した
- **ユーザー確認有無**: あり（監督指示により親オーケストレータが起票を直接実行）
- **Decision/REQ/spec影響**: なし（実行時の委譲先の観測であり、正規成果物への変更なし）
- **横展開観点**: 大型本文の書込みを伴う工程を委譲するときは、委譲先と呼び出しの分割を事前に確認する
- **再発条件**: category モデルに大型本文の書込みを伴う tool 呼び出しを委譲した場合に再発する可能性がある
- **予防策候補**: 大型本文の書込みを分割する、または委譲先を general エージェントにする運用基準の検討
- **想定反映先**: agentdev-case-run-execution-adapter SKILL「委譲プロトコルと category 設計」節
- **関連**: Issue #4218、PR #4219
- **タグ**: `#delegation` `#case-open` `#tool-call`
