# intake: Artifact Graphの対応YAML構造と未対応構造を診断する

## 発生日

2026-08-06

## 発生元

- Epic: #1941（本体リポジトリ固有Artifact Graphを導入する）
- Issue: #1944（Artifact Graphの探索効果を代表質問で検証する）
- PR: #1947
- 取得元: PR #1947本文「## Findings/ Capture候補」セクション

## 問題事象

Artifact Graphの軽量YAML解析処理が対応する構造が明示されておらず、配列要素の親文脈を保持しない実装でも既存テストが合格していた。
解析対象外のYAML構造を入力しても診断されないため、関係抽出漏れを生成成功と区別できない。

## 影響

- Project Extensionの記述形式が変化すると、関係が欠落しても生成処理が成功する可能性がある。
- 生成件数と構造検査だけでは、対応外構造による抽出漏れを特定できない。

## 発生局面

効果検証（配列形式の拡張定義に対する初回比較）

## 検知方法

PR #1947で実際の拡張定義と問い合わせ結果を比較し、`rules.skill`と`context.paths`の欠落を確認した。

## 想定される対応方向

- 軽量YAML解析処理が対応するmapping、sequence、scalarの組み合わせを明示する。
- 対応外構造を検出した場合は、生成失敗とは分離した診断を出力する。
- 実際の配列形式をfixtureへ含め、親文脈を保持した抽出を回帰検証する。

## 関連

- Epic: #1941
- Issue: #1944
- PR: #1947
- 解析処理: `.opencode/skills/repo-agentdev-artifact-graph/scripts/lib/parse.ts`
- 仕様: `docs/specs/local/artifact-graph.md`

## 出典引用

PR #1947本文「## Findings/ Capture候補」より:

> 対応する YAML 構造を明示し、対応外構造を診断する候補。

## タグ

#intake #artifact-graph #yaml #parser #diagnostics #issue-1944
