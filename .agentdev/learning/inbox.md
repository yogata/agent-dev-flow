# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## REQ 行 append を伴う req-save では AUTOGEN 索引の同 commit 再生成が必要

- **問題事象**: REQ 行の append を伴う req-save（commit 340e7304）実行後、docs/designs/quality/req-health-metrics.md の AUTOGEN ブロック（req-metrics-measurement-example）が再生成されず、REQ-010 21→23 行・REQ-032 21→22 行の鮮度違反（CONTENT_CHANGE）が下流 Issue #2380 の検証で発覚した（check_autogen_freshness.ts exit 1）
- **発生局面**: 実装（req-save 工程）と検証（下流 case work の docs-check）
- **検知方法**: check_autogen_freshness.ts の非ゼロ exit（REQ-010-059 鮮度 gate）
- **根本原因**: REQ 行の append を伴う req-save 実行時に AUTOGEN 対象索引の再生成を同 commit で行う契約が手順側に明確でなく、再生成が漏れた
- **自律対応内容**: Issue #2380 の検証で bun run generate_indexes.ts により req-health-metrics.md を再生成し、鮮度検査 exit 0 を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（AG-009(a)（OU-008、Issue #2386）の AUTOGEN 再生成前置化の動機を裏付ける実例）
- **横展開観点**: REQ 行を append する req-save 実行時は常に AUTOGEN 対象索引（req-health-metrics.md 等）の再生成要否を確認する
- **再発条件**: REQ 行 append を伴う req-save で AUTOGEN 再生成を省略した場合
- **予防策候補**: req-save 手順への AUTOGEN 再生成前置の明記、または req-save 完了時の鮮度検査自動実行
- **想定反映先**: agentdev-workflow-req-save 手順、docs/designs/integrity/checker-execution-contracts.md（AG-009(a) で扱う領域）
- **関連**: PR #2390 本文、Issue #2380、commit 340e7304
- **タグ**: `#req-save` `#autogen` `#freshness-gate`

## 配布 skill への実行手順記載は fenced code block とプレースホルダーで書く

- **問題事象**: 配布 skill（src/opencode/**）にコマンド例を inline code span で src/opencode/ 直参照付きで記載した結果、check_integrity の IR-055 strict 違反（delta）5 件と check_distribution_boundary --profile source の concrete-id 違反 6 件を検出した
- **発生局面**: 実装（skill 文書への実行手順追記、Issue #2381 の case work）
- **検知方法**: check_integrity.ts（IR-055 runtime-unresolved-reference delta）、check_distribution_boundary.ts --profile source
- **根本原因**: inline code span 内のパス参照は IR-055 の検出対象になるが fenced code block 内は非検出、REQ-/DEC- 等 concrete ID は配布依存境界の concrete-id 違反になるという検出器の性質を記載時に考慮していなかった
- **自律対応内容**: 該当箇所を fenced code block 化し、concrete ID をプレースホルダー（<integrity-detector-skill> 等）へ置き換えた結果、IR-055 delta 0・concrete-id 違反 0 を機械確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（IR-055・配布依存境界の既存規定の運用知見）
- **横展開観点**: 配布 skill・command へコマンド例やパス参照を記載するすべての場面
- **再発条件**: 配布 skill に inline code span で src/opencode/ 直参照や concrete ID を記載した場合
- **予防策候補**: 配布 skill 編集時の「fenced code block + プレースホルダー」様式の徹底（skill-authoring ガイダンスへの明記候補）
- **想定反映先**: agentdev-skill-authoring、agentdev-doc-writing の記載様式ガイド
- **関連**: PR #2391 本文、Issue #2381、docs/designs/integrity/rules/IR-055（runtime-unresolved-reference）
- **タグ**: `#distribution-boundary` `#ir055` `#skill-authoring`

## gh api での Issue コメント編集には REST numeric id が必要

- **問題事象**: gh issue view --json comments で取得したコメント id（IC_... 形式の GraphQL node id）を gh api -X PATCH /repos/{owner}/{repo}/issues/comments/{id} に渡したところ HTTP 404 Not Found になった
- **発生局面**: 運用（case-close での投稿済みコメント修正）
- **検知方法**: gh api の HTTP 404 エラー（documentation_url は issues/comments#update-an-issue-comment）
- **根本原因**: issues/comments の REST endpoint は numeric database id を要求するが、gh issue view の comments JSON が返す id は GraphQL node id である
- **自律対応内容**: gh api /repos/{owner}/{repo}/issues/{N}/comments（REST）でコメント一覧を再取得して numeric id（5379964457）を使い、PATCH を成功させた
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: gh issue view --json 系の出力を gh api REST 呼び出しのパスに流用するすべての場面
- **再発条件**: GraphQL node id を REST API パスに埋め込む場合
- **予防策候補**: コメント編集時は REST 一覧（gh api /repos/.../issues/{N}/comments）から numeric id を取得する手順を標準とする
- **想定反映先**: agentdev-gh-cli references（REST API PATCH 標準手続き系への注記候補）
- **関連**: Issue #2379 コメント修正（numeric id 5379964457）
- **タグ**: `#gh-cli` `#rest-api`
