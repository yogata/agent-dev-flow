# phase-artifacts-update description 上限超過（pre-existing NG）と集約予算超過の漸進回収

## 観測内容

- `agentdev-workflow-phase-artifacts-update` の description が 676 chars で個別上限 600 を超過する pre-existing NG（lint_skills AG-005、RU-0018 層1）
- あわせて description 集約予算超過（warning、58 ファイル合計 20724 > 20300）

## 影響

- 個別 NG は lint_skills の運用方針（「次回 skill 変更時の top 層からの description 削減による漸進回収」）の対象候補であり、当該 skill の次回変更時に回収機会がある。
- 集約予算超過は warning の傾向管理対象であり、放置すると他 skill の変更で新規 NG 化する余地がある。

## 課題

- 個別削減と集約予算の回収を同時進行で扱うかどうかの後続分析。

## 既存要件との関連

- RU-0018（skill description 基準、層1 AG-005）、lint_skills 運用方針（漸進回収）

## 出典

- 観測元: PR #3833 本文「## Findings / Capture候補」セクション intake 1 件目（case-close #3831 対応記録コメント検証差分 #7 の lint_skills 実測で再確認）
- 実測証跡: case-run（DEL-3831-1）lint_skills.ts 実行（profile source、58 件スキャン）。17 変更ファイルの diff に description 行の変更なし（pre-existing 分類の根拠）
