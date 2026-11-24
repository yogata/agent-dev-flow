---
id: 2026-11-25-delegate-split-impl-and-pr-evidence-to-files
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# 委譲は「実装と検証」と「PR 作成」に分け、証跡は作業中にファイルへ書き出させる

- **問題事象**: 実行担当は push の完了後に接続を断ち、最終報告と PR 作成に到達しなかった。証跡が evidence に残っていたため、取りまとめが最終 gate を再実行できた
- **発生局面**: 実装（Issue #4222 の case-run、実行委譲。2026-11-25 JST）
- **検知方法**: 実行担当の最終報告の不在と evidence の証跡（`C/_index.log`、`C/push-3.stdout`）
- **根本原因**: 実装と PR 作成を 1 つの委譲に含めたため、接続断で後半の工程が失われた
- **自律対応内容**: 取りまとめが evidence の証跡から最終 gate を再実行し、PR の開設は監督の代理セッションが行った
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（委譲運用の観測であり、正規成果物への影響なし）
- **横展開観点**: 委譲は「実装と検証」と「PR 作成」に分け、証跡は作業中にファイルへ書き出させる
- **再発条件**: 実装から PR 作成までを単一の委譲に含め、証跡をファイルへ書き出さない場合
- **予防策候補**: 委譲の分割と証跡のファイル書き出しを委譲契約へ含める
- **想定反映先**: agentdev-case-run-execution-adapter SKILL（委譲プロトコル）
- **関連**: PR #4225、Issue #4222
- **タグ**: `#delegation` `#evidence`
