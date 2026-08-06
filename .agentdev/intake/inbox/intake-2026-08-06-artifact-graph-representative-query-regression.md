# intake: Artifact Graphの代表質問を実入力回帰検証へ組み込む

## 発生日

2026-08-06

## 発生元

- Epic: #1941（本体リポジトリ固有Artifact Graphを導入する）
- Issue: #1944（Artifact Graphの探索効果を代表質問で検証する）
- PR: #1947
- 取得元: PR #1947本文「## Findings/ Capture候補」セクション

## 問題事象

単純化したfixtureによる既存テストは、実リポジトリの配列形式に起因する関係抽出漏れを検出できなかった。
代表質問による効果検証で初めて、10件中8件の重大な見逃しが判明した。

## 影響

- fixtureが合格しても、実入力に対する探索結果の完全性を保証できない。
- 入力構造の変化により同種の抽出漏れが再発した場合、効果検証まで検知が遅れる。

## 発生局面

効果検証（TS-013の初回比較）

## 検知方法

代表質問10件についてDOC-MAPと`rg`による基準結果をArtifact Graphの結果と比較し、欠落した関係を確認した。

## 想定される対応方向

- 代表質問と期待するノード、関係、根拠を回帰検証データとして定義する。
- 実リポジトリ入力を再生成し、代表質問の重大な見逃しを自動検出する検査を追加する。
- fixtureによる局所検査と実入力による横断検査を分離して維持する。

## 関連

- Epic: #1941
- Issue: #1944
- PR: #1947
- 効果検証: `docs/specs/local/references/artifact-graph-effect-evaluation.md`
- テスト: `.opencode/skills/repo-agentdev-artifact-graph/scripts/tests/`

## 出典引用

PR #1947本文「## Findings/ Capture候補」より:

> 実リポジトリ入力に対する代表質問を回帰検証へ組み込む候補。

## タグ

#intake #artifact-graph #regression-test #real-input #issue-1944
