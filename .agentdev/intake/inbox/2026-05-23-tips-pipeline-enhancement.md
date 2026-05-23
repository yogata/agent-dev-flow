# tips/refactor 分析高度化・elevate 処分判断精緻化・archive prune 未実装

## 観測
#212 で learning-pipeline（tips-refactor / tips-elevate / archive）の改善が行われたが、以下3点が明示的に未実装のまま残っている:

1. **tips-refactor 分析の浅さ**: 現状はテーマ分類のみ。根本原因・再発条件・予防策・8軸評価ディメンションが未実装。
2. **tips-elevate 処分判断の粗さ**: 現状は4段階判定のみ。learning-pipeline スキルが定義する11処分区分・既存対策照合が未対応。
3. **archive.md の prune 未実装**: append-only で古いエントリが蓄積され続け、prune（不要エントリの削除・統合）が未実装。

## 今回扱わない理由
#212 では learning pipeline の基本骨格確立が最優先とされ、高度化は後続タスクとして明示的に先送りされた。

## 影響
- 学習品質が低い（根本原因分析なし、処分判断が粗い）
- archive.md が無制限に肥大化する可能性
- learning-pipeline スキルの定義と実装の乖離が拡大

## レビューで決めること
- 3項目の実装優先順位
- 8軸評価ディメンションの具体的な実装方法（プロンプト設計）
- prune ポリシーの要件（保持期間・エントリ数上限等）
- 独立した Issue として起票するか、1つの Epic にまとめるか

## 根拠（任意）
- 元 Issue: #212 — learning pipeline 改善の中で、3項目が未実装として明示的に記載
