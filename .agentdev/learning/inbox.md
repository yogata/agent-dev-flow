# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## case-open での Issue 本文エンコーディング破損が case-run/case-close に波及

- **問題事象**: case-open が作成した Issue #576 の本文が日本語文字化け（EUC-JP 的な文字単位破損）し、全テキストが読取不能になった。case-run は一部チェックボックスを更新したが、文字化けにより正確な位置特定が困難で 13/17 チェックボックスが未更新のまま残った。case-close で本文全体を正しい日本語で再構築し解決。
- **発生局面**: case-open（Issue作成）→ case-run（実装）→ case-close（完了処理）の3フェーズにまたがる波及
- **検知方法**: case-close Step 2 で Issue 本文を `gh issue view --json body` で読み取り時、全セクションが文字化けしていることを検知
- **根本原因**: Windows 環境の gh CLI で `--body-file` 経由で UTF-8 本文を書き込んだ際、PowerShell のエンコーディング変換が介入して文字化けが発生。case-open のサブエージェントが agentdev-gh-cli スキルの書き込み手順（`[System.IO.File]::WriteAllText` + UTF8Encoding($false)）を正しく適用しなかった可能性が高い
- **自律対応内容**: case-close で Issue 本文を正しい日本語で再構築し、`--body-file` 経由で更新。17/17 チェックボックスを完了に設定
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用上の知見であり、仕様変更は不要）
- **横展開観点**: case-open 以外のサブエージェント（case-run、case-close 等）が `gh issue create` / `gh pr create` を実行する場面でも同一リスクが存在する
- **再発条件**: Windows 環境でサブエージェントが `--body-file` 書き込み手順を正しく適用しない場合に再発。特に agentdev-gh-cli スキルが load されていない、または `[System.IO.File]::WriteAllText` の代わりに PowerShell ネイティブ書き込みを使用した場合
- **予防策候補**: case-open/case-run/case-close コマンド定義で agentdev-gh-cli スキルの load を強制する。または integrity-check に「Issue 本文の文字化け検出」チェックを追加する
- **想定反映先**: agentdev-gh-cli スキル（強化）、agentdev-learning-capture スキル（参考事例）、または case-open/case-run/case-close の guardrails
- **関連**: Issue #576, PR #578
- **タグ**: `#encoding` `#gh-cli` `#windows` `#case-open`

---

## Epic Wave 2 並列PRの同一ファイル変更によるマージコンフリクト

- **問題事象**: Epic #580 Wave 2 で4本のPR (#590, #591, #588, #589) を並列作成後、順次 squash merge した際、#588 (Semantic Conflicts) と #589 (Runtime Boundary) で system.md および integrity report のマージコンフリクトが発生。手動で rebase + コンフリクト解決が必要だった。
- **発生局面**: case-run Epic Orchestrator → Wave 2 並列実行 → squash merge 順序処理
- **検知方法**: `gh pr merge` が `GraphQL: Pull Request has merge conflicts` エラーを返却
- **根本原因**: 並列Wave内の複数PRが同一ファイル (docs/specs/system.md) を変更。#584 が REQ range を修正、#585 が flow separators を修正、#583 が REQ range + table + classification を修正。#583 は #584/#585 の変更を取り込んでいなかった。
- **自律対応内容**: ローカルで `git fetch origin pull/{N}/head` → `git rebase origin/main` → コンフリクト解決 → `git push origin pr-{N}:{original_branch} --force-with-lease` → `gh pr merge {N} --squash` の手順で解決。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用上の知見）
- **横展開観点**: Wave 内並列実行で同一ファイルを変更する可能性がある場合、サブエージェントへのプロンプトで「他のPRと重複する変更は最小限にする」または「変更対象ファイルの重複を避ける」ガイダンスが必要。
- **再発条件**: Wave内並列実行で複数のサブエージェントが同一ファイルを変更する場合。特に system.md, AGENTS.md などの共通設定ファイル。
- **予防策候補**: (1) Wave内でファイル変更対象を事前に分割しサブエージェントに指示、(2) Merge順序を考慮したファイル分割、(3) 最初のPRマージ後に残りのPRをrebaseする運用を標準化
- **想定反映先**: agentdev-workflow-orchestration スキルの Epic Orchestrator protocol
- **関連**: Epic #580, PR #588, #589
- **タグ**: `#epic` `#merge-conflict` `#parallel-execution` `#wave-scheduling`

---

## サブエージェントの連続editによる関数定義破損（Wave 3 #586）

- **問題事象**: Wave 3 (#586) のサブエージェントが `check_integrity.ts` の `checkReqBacklogResidual` 関数に対し、exempt パターン追加の連続editを2回実行した際、いずれも内側の `scanDir` 関数定義を oldString に含めてしまい関数ボディ全体を削除。2回目も同一ミスを繰り返し、最終的に `checkPatternResidual` と `checkReqBacklogResidual` が融合する破壊的状態になった。3回目の手動修復で復旧。
- **発生局面**: case-run Wave 3 → サブエージェントのedit操作
- **検知方法**: スクリプト実行時のJSON出力空、および関数定義の目視確認
- **根本原因**: edit ツールの oldString マッチングが意図より広範囲にマッチし、内側関数定義を含む範囲を置換。複数行 oldString で内側スコープ境界（function定義行）を含むと、意図しない削除が発生しやすい。
- **自律対応内容**: 関数全体を正しく再構築してeditで修復。3回目で成功。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: サブエージェントが入れ子関数を持つファイルを連続editする場面で一般的なリスク
- **再発条件**: oldString に内側関数の定義行を含む置換を連続実行
- **予防策候補**: (1) edit後に Read tool で該当関数の全体を確認する手順を徹底、(2) 大きな関数の部分editでは oldString を最小限に限定、(3) 連続edit前に全体構造を把握してから実行
- **想定反映先**: agentdev-workflow-orchestration のサブエージェント protocol
- **関連**: PR #592, Issue #586
- **タグ**: `#edit-tool` `#subagent` `#function-corruption` `#typescript`

