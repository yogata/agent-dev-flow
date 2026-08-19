# check_integrity.ts の delta 表示がレポート本文の NG 0 / Warning 14 と「14 new unmanaged NG (delta, exit code driver)」で食い違って読める

## 観測

PR 2342（Issue 2310、req-define 配布スキル適合）の品質統制で check_integrity.ts を実行したところ、レポート本文上は NG 0 / Warning 14 である一方、delta 表示は「14 new unmanaged NG (delta, exit code driver)」と出力された。Warning 14件はいずれも main 既存の docs/** 指摘（REQ-028 retired 参照、DEC-017 proposed / DEC-005 superseded 引用等）であり、本 PR 由来の指摘は 0 件であった。

- レポート本文の NG 集計（0件）と delta 表示の unmanaged NG 集計（14件）が、Warning を含むか否かで食い違っているように読める
- PR 2342 の worktree は base 40096376 からの配布物変更のみのため、main ブランチでも同様の表示になる可能性が高い

## 今回扱わない理由

本 PR（Issue 2310）の完了条件（req-define 配布スキル適合）の範囲外であり、integrity ツールの表示形式と終了コード運用は別途整理が必要。intake パイプラインでの triage 候補として記録する。

## 影響

検証ワークフローで delta 表示とレポート本文を突合する際に、NG と Warning の区別が表示上で崩れ、違反の有無を誤読する恐れがある。

## レビューで決めること

- delta 表示の「unmanaged NG」が Warning を含む集計であるなら、NG と Warning の区別がつく用語へ改めるか、終了コード driver の算出根拠を表示へ明示するか
- 既存の NG baseline 未登録 Warning 14件の扱い（NG baseline 登録・許容運用・参照側是正）との統合整理

## 根拠

- PR 2342 本文「Findings / Capture候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2342）
- 重複参照先: .agentdev/intake/inbox/2026-08-19-check-integrity-ng-baseline-warning-exit1.md（同一 Warning 14件が終了コード1のドライバーとなる問題）
