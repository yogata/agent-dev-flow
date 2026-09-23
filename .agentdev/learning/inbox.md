# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## agentdev_gh issue_list の全件走査で safety page limit に到達し state/search フィルタ必須を確認

- **問題事象**: agentdev_gh issue_list 操作で state を指定せず search のみで既存 Case 冪等検出を実行したところ、リポジトリの Issue 総数が多く「issue_list reached the safety page limit (10 pages of 100)」の operation-failed（retryable）が返った。ヒット有無の確認目的でも全ページ走査が発生する
- **発生局面**: 実装（case-open STEP-5 冪等検出の既存 Root Case 検索。Case #3080 実行中）
- **検知方法**: agentdev_gh issue_list 操作の operation-failed 応答（safety page limit メッセージ、contingency に gh CLI 読み取り fallback 提示）
- **根本原因**: issue_list は search 条件がヒットしなくても filter に一致する Issue をページング全走査するため、state 未指定（open + closed 全件）では大規模リポジトリで安全上限に到達する。filter を絞らずに広い検索を行った呼出側の使い方が直接原因
- **自律対応内容**: state: open を付与して再実行し、同一 search 条件で空結果を取得して冪等検出を完了した。gh CLI への切替は不要だった（1回目の再試行で解消）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Tool の公開契約変更は不要。使用側の運用知見）
- **横展開観点**: agentdev_gh issue_list の全呼び出し箇所（case-open STEP-5、case-ready、issue workflow 等）で state/search/labels フィルタを必須運用とする。冪等検出は open 状態のみで足りる Case 群が多い
- **再発条件**: Issue 数が大きいリポジトリ（1000 件超相当）で issue_list を state なし・search なしまたは広義 search で呼び出した場合
- **予防策候補**: workflow reference の冪等検出手順に「issue_list には state フィルタを付与する」旨を明記する。Tool 応答の contingency に filter 絞り込みヒントを含める
- **想定反映先**: src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（GitHub I/O 失敗時切替継続手順の周辺）、その他 issue_list を使う workflow skill references
- **関連**: .agentdev/integrity/reports/cross-dependency-input-3080.json、Case #3080、Definition PR #3081
- **タグ**: `#agentdev-gh` `#issue_list` `#冪等検出` `#ページ上限`
