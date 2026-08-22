# SPEC確定候補: NG baseline 正規化衝突時の semantic（max 採用）の明文化

## 観測
PR 2254 のパス bucket key 正規化により、環境別表記の baseline entries が同一 bucket key へ衝突しうる。実装は同一論理 NG の環境別観測として count の大きい方（max）を採用する（加算しない）。この semantic は checker アルゴリズム詳細として SPEC 未記載。

## 今回扱わない理由
SPEC 本文への追記を要する確定判断であり、Issue #2206 の完了条件（既存4点の記載確認と checker 修正）の範囲外。PR #2254 の SPEC確定候補として記録。

## 影響
加算すると単一論理 NG の実数を超えて降格を許す（NG 隠蔽リスク）、min は環境別観測の実数を下回る恐れがあるため、max 採用が妥当という実装判断の根拠が SPEC に正規化されていない。

## レビューで決めること
- integrity-contracts「NG baseline 運用手順」節へ正規化衝突時 semantic（max 採用・非加算の理由）を明文化するか。

## 根拠
- PR 2254 本文「SPEC確定候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2254）
