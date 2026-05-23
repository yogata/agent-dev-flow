# learning pipeline 高度化 — 既存仕様との差分に基づく要件定義

## 観測内容

#212 で learning-pipeline（旧 tips-refactor / tips-elevate / archive）の基本骨格が確立されたが、以下3点が未実装のまま残っている:

1. **分析の浅さ**: テーマ分類のみで、根本原因・再発条件・予防策・8軸評価が未実装
2. **処分判断の粗さ**: 4段階判定のみで、11処分区分・既存対策照合が未対応
3. **prune 未実装**: append-only で古いエントリが蓄積

ただし、**現行 `agentdev-learning-pipeline` スキルは既に 8軸評価、prune 方針、promote 時 prune、staging stub archive rules を持つ**。したがって新規要件としては「既存仕様の不足点」のみを差分化して定義する必要がある。

## 影響

- learning pipeline の定義と実装の乖離
- archive.md の無制限肥大化
- 学習品質の低さ（根本原因分析なし）

## req-define で壁打ちすべき課題

- 既存 learning-pipeline スキル（8軸評価・prune 方針等）のうち、どの部分が「定義のみで実装されていない」かの差分確認
- 差分に基づく実装要件の整理（既存仕様の不足点のみを要件化）
- 実装優先順位（分析高度化 / 処分判断精緻化 / prune のどれから）
- 独立した Issue として起票するか、1つの Epic にまとめるか

## 既存要件との関連

- `agentdev-learning-pipeline` スキル: 8軸評価・11処分区分・prune 方針等が定義済み
- Issue #212: 基本骨格確立、3項目が明示的に先送り

## 根拠

- 元 item: `.agentdev/intake/accepted/2026-05-23-tips-pipeline-enhancement.md`
- 元 Issue: #212
