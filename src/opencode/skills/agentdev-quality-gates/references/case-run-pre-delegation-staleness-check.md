# case-run 前置 staleness check（REQ〜034）

case-run Step 5-3 で実施する、実装作業開始前の入力妥当性検査。
QG-3 本体（case-run Step 6 委譲先が実施する PR 作成直前ゲート）とは独立した前置検査であり、QG-3 deviation 分類（spec-bug 等）運用を変更しない。staleness check は実装開始前の入力妥当性検査であり、QG-3 本体の実施要否には影響しない。

## 検証項目

### 1. ファイルパス現行存在確認

Issue 本文が参照するファイルパス（command 定義、SPEC、template 等）が現行リポジトリに存在するか確認する。Issue 作成時点から移動、改名、削除されたパスを検出対象とする（REQ）。

### 2. 検査結果件数再計測

Issue 本文の事前状態セクションが列挙する検査結果件数（NG 件数、IR 違反件数等）を再計測し、Issue 本文記載値と比較する。件数は変動しやすい実測値スナップショットであるため、差異の有無のみを判定材料とする（REQ）。

## 差異検出時のアクション（REQ）

差異を検出した場合、case-run は以下を実施する:

1. 検出結果（対象パス、Issue 本文記載値、現行値）を Step 6 委譲プロンプトに含めて実行担当サブエージェントへ引き渡す。実行担当サブエージェントは PR 本文の `## Findings / Capture候補` セクションに `### stale-reference` 小見出しで差異内容を記録する（Findings 記録は実行担当サブエージェント責務）
2. case-update へ連携し、Issue 本文の参照パス・件数の更新を委譲する
3. case-run 単独では Issue 本文を書き換えない（Issue 本文更新は case-update の責務）

差異非検出時はそのまま Step 6 へ進む。staleness check の差異有無によらず QG-3 本体（Step 6 委譲先）の実施要否は変更しない。

## QG-3 本体との関係

staleness check は QG-3 本体（PR 作成直前の実装充足・乖離ゲート）とは独立した前置検査である。QG-3 が実装結果に対するゲートであるのに対し、staleness check は実装開始前の入力妥当性検査である。両者は順序依存を持たない。

## 各 command の参照方法

command 側（case-run Step 5-3）には以下のように参照する:

- 「`agentdev-quality-gates` の case-run 前置 staleness check（REQ）に従い、ファイルパス現行存在確認、検査結果件数再計測、差異検出時の引き渡し・連携を実行」
