# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## PowerShell が Node.js インラインスクリプト内の regex backreference `$1`/`$2` を PS 変数として補間し JS コードを破壊する

- **問題事象**: `node -e "..."` で実行した JavaScript 内の `String.prototype.replace(/pattern/, '$1 completed $2')` の `$1`/`$2` が PowerShell によって PowerShell 変数（空文字列）として先に補間され、結果として `replace` の第2引数が `' completed '` のような壊れた文字列になり、SyntaxError または意図しない置換結果になった
- **発生局面**: 実装（case-close 実行中、gh CLI WRITE 手続きでの Issue 本文更新）
- **検知方法**: 手動確認（node コマンド実行時の SyntaxError、および対象ファイルが生成されない事象から即座に検知）
- **根本原因**: PowerShell は二重引用符内の `$ identifier` を常に PowerShell 変数として補間しようとする。`node -e "..."` の二重引用符内で JS の regex backreference `$1`/`$2` を使うと、PowerShell が先に解釈して空文字列へ置換し、その後 Node.js が壊れた JS コードを評価する。standard-procedures.md Section 3 はクォート競合一般を扱うが、regex backreference の `$N` パターンを明示的には扱っていない
- **自律対応内容**: `.split(oldStr).join(newStr)` 形式（backreference を使わない文字列置換）に切り替え、さらに複雑な置換は `.sisyphus/tmp/update-*.js` ファイルへ退避して `node <file>.js` で実行する形式（Section 3 項目7 退避策）を採用した。Epic #1472 status table 更新と Issue #1475 完了条件更新の両方でこの形式を採用し、verify も成功した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり。`agentdev-gh-cli` references/standard-procedures.md Section 3（READ 手続き）および Section 2（WRITE 手続き）に「regex backreference `$N` を `node -e` 二重引用符内で使用してはならない（PS 変数補間で壊れる）」旨を追記すべき。また同 skill の「禁止事項」リストに `$N` パターンのインライン使用禁止を追加すべき
- **横展開観点**: PowerShell + Node.js の組み合わせで `node -e` を使う全コマンド・全 agent に適用。`agentdev-gh-cli` 経由で gh CLI を呼ぶ全 WRITE/READ 手続きが対象。特に Issue/PR 本文の一括文字列置換（完了条件チェックボックス更新、ステータス追跡テーブル更新等）で高頻度に発生する
- **再発条件**: PowerShell 環境（Windows PowerShell 5.x / pwsh 7 ともに）で `node -e "..."` の二重引用符内で `$1`/`$2`/`$3` 等 regex backreference を使用した場合
- **予防策候補**: (a) `String.prototype.replace` で backreference が必要な場合は `node -e` を使わず `.js` ファイルへ退避して実行する。(b) 単純な文字列置換は `split().join()` を使う。(c) `agentdev-gh-cli` standard-procedures.md Section 1（禁止事項）へ「`node -e` 二重引用符内での regex backreference `$N` 使用禁止（PowerShell 変数補間で破壊される）」を追記する
- **想定反映先**: `agentdev-gh-cli` skill references/standard-procedures.md（Section 1 禁止事項、Section 3 項目7 退避策の拡充）。学習成果物として `learning-promote` → backlog-review → req-define 経由で反映
- **関連**: src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md, Epic #1472 Wave 3 case-close (Issue #1475, PR #1478), 2026-07-07 実施
- **タグ**: `#powershell` `#node-e` `#encoding` `#regex` `#agentdev-gh-cli` `#windows`
