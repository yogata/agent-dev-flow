# Artifact Graph 軽量YAML解析の対応構造明示と未対応構造診断

## 観測内容

Artifact Graph の軽量YAML解析処理（`.opencode/skills/repo-agentdev-artifact-graph/scripts/lib/parse.ts`）は対応する構造を明示していない。
配列要素の親文脈を保持しない実装であっても既存テストが合格していた。
解析対象外の YAML 構造を入力しても診断されないため、関係抽出漏れを生成成功と区別できない。
PR #1947 で実際の拡張定義と問い合わせ結果を比較し、`rules.skill` と `context.paths` の欠落を確認した。

## 影響

Project Extension の記述形式が変化すると、関係が欠落しても生成処理が成功する可能性がある。
生成件数と構造検査だけでは、対応外構造による抽出漏れを特定できない。
優先度は中。抽出漏れの隠蔽リスク。

## 課題

軽量YAML解析（parse.ts）の対応構造明示と対応外構造診断を実装する。
対応候補:
- 軽量YAML解析処理が対応する mapping、sequence、scalar の組み合わせを明示する
- 対応外構造を検出した場合は、生成失敗とは分離した診断を出力する（抽出漏れ隠蔽の防止）
- 実際の配列形式を fixture へ含め、親文脈を保持した抽出を回帰検証する

## 既存要件との関連

- 対象: `.opencode/skills/repo-agentdev-artifact-graph/scripts/lib/parse.ts`
- 仕様: `docs/specs/local/artifact-graph.md`
- Epic: #1941
- Issue: #1944
- PR: #1947

## 出典

- inbox 元ファイル: `intake-2026-08-06-artifact-graph-yaml-structure-diagnostics.md`
- 発生日: 2026-08-06
- PR: #1947（Issue #1944, Epic #1941）
