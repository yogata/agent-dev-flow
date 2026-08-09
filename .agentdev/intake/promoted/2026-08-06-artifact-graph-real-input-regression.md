# Artifact Graph の代表質問回帰検証への実入力組込み

## 観測内容

Artifact Graph の既存テストは単純化した fixture を用いている。
代表質問による効果検証（TS-013 の初回比較）で初めて、実リポジトリの配列形式に起因する関係抽出漏れ 10件中8件が判明した。
代表質問10件について DOC-MAP と `rg` による基準結果を Artifact Graph の結果と比較し、欠落した関係を確認した。
fixture ではこの抽出漏れを検出できなかった。

## 影響

fixture が合格しても、実入力に対する探索結果の完全性を保証できない。
入力構造の変化により同種の抽出漏れが再発した場合、効果検証まで検知が遅れる。
優先度は中〜高。抽出正確性に関わるため AG 安定化前に対応が望ましい。

## 課題

実リポジトリ入力形式に対する回帰検証を組込む。
対応候補:
- 代表質問と期待するノード、関係、根拠を回帰検証データとして定義する
- 実リポジトリ入力を再生成し、代表質問の重大な見逃しを自動検出する検査を追加する
- fixture による局所検査と実入力による横断検査を分離して維持する

【注意】agentdev-artifact-graph SPEC は draft、ADR-007 は proposed である。本件は抽出正確性に関わるため AG 安定化前に対応が望ましい。

## 既存要件との関連

- 対象: `.opencode/skills/repo-agentdev-artifact-graph/scripts/tests/`
- 効果検証: `docs/specs/local/references/artifact-graph-effect-evaluation.md`
- Epic: #1941（本体リポジトリ固有 Artifact Graph を導入する）
- Issue: #1944（Artifact Graph の探索効果を代表質問で検証する）
- PR: #1947

## 出典

- inbox 元ファイル: `intake-2026-08-06-artifact-graph-representative-query-regression.md`
- 発生日: 2026-08-06
- PR: #1947（Issue #1944, Epic #1941）
