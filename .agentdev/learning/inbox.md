# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## case-open と case-run の間に rename PR がマージされると Issue 本文のファイル名参照が陳腐化する

- **問題事象**: Issue #1371 本文が `check_read_contracts.ts`、`docs/specs/commands/inspect-read-contracts.md` を参照していたが、case-open → case-run の間に並行 PR #1362 がマージされ、対象ファイルは `check_doc_inputs.ts`、`docs/specs/commands/inspect-doc-inputs.md` へ rename 済みとなっていた。case-run 実装時に現行名称へ読み替えて実装する必要が生じ、QG-3 で has-deviation（spec-bug 分類）として記録された
- **発生局面**: case-run 実装中（QG-3 実装乖離検出）
- **検知方法**: QG-3 実装乖離検出。Issue 本文の完了条件が旧名称のままで、実装は現行名称で行われたため乖離として分類
- **根本原因**: case-open 時点で存在したファイル名・パスが、並行 rename PR のマージで陳腐化した。case-open 実行時のファイル存在確認、case-run 冒頭の staleness check のいずれも手順化されていない
- **自律対応内容**: 現行名称で実装し、QG-3 乖離として PR 本文に分類（spec-bug）と経緯を記録。REQ-0108-054 の本来要件（ランナー明記）は保持した。Issue 本文の旧名称の書き換えは case-update 責務のため case-close では実施せず、完了条件チェックボックスのみ更新した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。QG-3 has-deviation として処理済み。プロセス改善候補の記録のみ
- **横展開観点**: 手動 case 単独運用で並行 rename PR がマージされる場合に同様の陳腐化リスクがある。case-auto は Wave 境界で PR マージするため Wave 内では発生しにくいが、Wave 間でも前 Wave の rename が後 Wave の Issue 本文へ影響する可能性は残る
- **再発条件**: case-open → case-run の間に、Issue 本文が参照するファイル名・パスを変更する PR がマージされた場合
- **予防策候補**: case-run 冒頭で Issue 本文が参照するファイルパスの存在確認（staleness check）を QG-3 の前置検査として追加する。または case-open の Issue 本文生成時に、参照ファイルが存在することを確認する手順を強化する。検出後は case-update で Issue 本文を現行名称へ更新してから case-run を再開する運用も想定
- **想定反映先**: case-run command 手順（QG-3 前置 staleness check）、または inspect-docs 検出対象候補、case-open 手順の参照ファイル存在確認強化
- **関連**: Issue #1371、PR #1372、PR #1362（rename 元）、QG-3 has-deviation（spec-bug 分類）
- **タグ**: `#case-run` `#qg-3` `#staleness` `#rename`

---

## commit message の (case-close #N) 等の複合語が GitHub auto-close キーワードを誘発し、参照先 Issue を意図せずクローズする

- **問題事象**: case-close (Epic Wave クローズ) Step 11 で push した commit `ecfd327a` のメッセージ "chore(agentdev): capture Wave 1 PR #1409 findings to intake inbox (case-close #1403)" により、Epic #1403 が 2026-07-04T07:54:16Z に COMPLETED で自動クローズされた。本来 Wave 2 (#1406), Wave 3 (#1407) が残っているため OPEN を維持すべきだった
- **発生局面**: case-close Step 11（ドメイン状態永続化: .agentdev/ 成果物の commit/push）
- **検知方法**: case-close E6 最終 Wave 判定前の最終状態 VERIFY で Epic #1403 state が CLOSED COMPLETED になっていることを発見。closedByPullRequestsReferences が空配列で PR 由来ではないことを確認し、commit message 由来と特定
- **根本原因**: commit message 末尾の "(case-close #1403)" のうち、GitHub が "close #1403" を auto-close キーワード（close/closes/closed + #issue）として認識した。"case-close" はハイフン区切りの複合語だが、GitHub の auto-close 検出は "close" を部分文字列として扱い、直後の "#1403" を issue 参照として解釈した
- **自律対応内容**: Epic #1403 を `gh issue reopen` で再オープン（stateReason: REOPENED）。再オープンコメントで事象・影響・対応・今後の Wave を明記。ステータス追跡テーブルは正しい状態（pending 2, completed 2）を維持していたため本文再編集不要
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（プロセス改善候補の記録のみ）。ただし agentdev コマンド名に "close" を含むもの（case-close, case-auto の内部 case-close 等）が多数存在し、commit message での issue 番号参照と組み合わせた場合の systemic リスクあり
- **横展開観点**: agentdev コミットメッセージ規約（agentdev-conventional-commits skill）で "(case-close #N)" "(learning-promote #N)" 等の括弧内コマンド名+issue番号表記が慣習的に使われる。"close" を含むコマンド名（case-close）と issue 番号の組み合わせが特に危険。他にも "fixed in #N", "resolved via #N" 等の表現も GitHub auto-close を誘発する
- **再発条件**: commit message に "close"/"closes"/"closed"/"fix"/"fixes"/"fixed"/"resolve"/"resolves"/"resolved" を部分文字列として含む単語（case-close, disclose, closed-loop 等）と同一行または近接する issue 番号参照（#N）が同時に存在し、当該 commit が main へ push された場合
- **予防策候補**: (1) commit message でコマンド名と issue 番号を分離（例: "case-close: Epic #1403 Wave 1" → "case-close for Epic 1403"、# 記号を避ける）。(2) agentdev-conventional-commits skill のコミットメッセージ規約に auto-close キーワード回避ガイドラインを追加。(3) case-close Step 11 で commit message に issue 番号を # 付きで記載しない（"case-close 1403" のように # を省略）。(4) pre-commit hook または commit message lint で "close #N" パターン（複合語内含む）を検出して警告
- **想定反映先**: agentdev-conventional-commits skill（コミットメッセージ規約へ auto-close 回避ガイドライン追加）、case-close command Step 11（commit message 生成時の #N 使用抑制）、または agentdev-git-worktree skill の commit 手順
- **関連**: Epic #1403, commit ecfd327a, case-close Step 11, GitHub auto-close keywords (close/closes/closed/fix/fixes/fixed/resolve/resolves/resolved)
- **タグ**: `#case-close` `#commit-message` `#github-autoclose` `#conventional-commits`

---

## 限定的検査による「配布物参照境界達成」報告が包括的検査で覆る（Wave 1/2 → Wave 3）

- **問題事象**: Epic #1403 Wave 1 (#1404/#1405) と Wave 2 (#1406) において、配布 command/skill 本文から docs/specs/{domain}/** 直参照を除去したことで「配布物参照境界達成」と報告された。しかし Wave 3 (#1407) で包括的検査（check_distribution_boundary.ts）を実装した結果、`ADR-NNNN`/`REQ-NNNN` の具体ID参照が303件（56ファイル）残存していることが発覚した。Wave 1/2 の達成報告は「限定的検査（check_extensions.ts 検査 #9/#10 は docs/specs/{domain}/** 直参照のみ対象）による部分達成」だった。
- **発生局面**: case-close（Wave 3 PR #1411 の QG-3 評定時、新検査機構の実行結果確認）
- **検知方法**: check_distribution_boundary.ts の実行結果（303件検出）と Wave 1/2 達成報告（`docs/specs/{domain}/**` 直参照のみ検査）の比較
- **根本原因**: Wave 1/2 で使われた check_extensions.ts 検査 #9/#10 は「具体パス（docs/specs/{domain}/**）」のみを検査対象とし、「具体ID（ADR-NNNN, REQ-NNNN の4桁数字）」は検査対象外だった。達成報告が検査対象の範囲内のみで「達成」と判断され、検査対象外の違反が見逃された。検査の網羅性と達成報告の表現（「配布物参照境界達成」vs「限定的検査項目達成」）に乖離があった
- **自律対応内容**: 発見事実を PR #1411 Findings セクションへ記録。303件の既存違反は別 Issue 化（intake inbox へ Capture）。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（プロセス改善候補の記録のみ）。ただし SPEC project-extensions.md「具体ID 記述禁止」厳格定義と実態の乖離判断が未解決（関連 intake: spec-concrete-id-strictness-divergence）
- **横展開観点**: 「検査項目達成」を「機能要件達成」と同義に扱う報告表現は、検査の網羅性が限定的な場合に誤解を生む。特に段階的実装（Wave分割）で前 Wave の達成が後 Wave の包括的検査で覆るリスクは、Epic 構成で「検査機構実装」を最終 Wave に配置する場合に systemic に発生しうる
- **再発条件**: (1) 機能達成を限定的検査の通過で代用し、達成報告が検査範囲を明示しない場合。(2) Epic の最終 Wave で包括的検査機構を実装し、前 Wave の達成前提を覆す場合
- **予防策候補**: (1) 達成報告時に「どの検査項目を満たしたか」を明示し「全体達成」と「部分達成」を区別する。(2) case-open/case-run で受け入れ基準を立てる際、検査可能な基準と検査未実装の基準を分離し、後者は「検査機構実装後に確認」と注記する。(3) QG-2/QG-3 で受け入れ基準の網羅性（検査カバレッジ）を確認する観点を追加するか検討
- **想定反映先**: case-open（受け入れ基準の検査可能性明示）、QG-2（acceptance criteria coverage に検査カバレッジ観点追加を検討）、agentdev-quality-gates skill（達成報告の表現ガイドライン）
- **関連**: Epic #1403, Wave 1 (#1404/#1405), Wave 2 (#1406), Wave 3 (#1407/PR#1411), check_extensions.ts 検査 #9/#10, check_distribution_boundary.ts
- **タグ**: `#wave-coverage` `#acceptance-criteria` `#partial-achievement` `#qg-2`
