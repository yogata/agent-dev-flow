# 検証対応要否カタログ任意行のうち恒常検証手段を構築し得る行の必須行復帰候補（PR #2368 由来）

## 観測

Epic #2358 Wave 4（Issue #2362、PR #2368）の棚卸し (a') で、検証対応のなかった 512 要件行を検証対応要否カタログ（docs/designs/foundations/references/verification-scope-catalog.md）へ任意行として登録した。経路G adversarial-review（Stream A、finding A-1）で、そのうち恒常検証手段を構築し得る行が含まれることを確認した。

- REQ-010-062「テストと配布 checker の規則同一性の維持」（構造テスト・contract test で恒常検証を構築可能）
- REQ-009-021〜044 の link・変換 script 系要件行（script 出力の検証資産を構築可能）

区分適用後の基準（実在する検証手段のみ宣言、任意行はカタログ登録）には合致しており、現状の check 全検査 pass（7/7）は正当である。

## 今回扱わない理由

検証資産（構造テスト、contract test）の新規構築は Issue #2362 の対象範囲外（RU-0004 対象外の拡張作業）。区分適用の判定基準上、実在しない検証手段を宣言することは許容されないため、任意行扱いが現時点の正しい状態である。

## 影響

検証資産を整備した際に必須行への復帰とカタログ登録解除を行わないと、実装済みの検証手段が検証対応として計上されない状態が続く（check の完全性計上がカタログ申告に依存するままになる）。

## レビューで決めること

- 必須行への復帰候補の優先順位（REQ-010-062、REQ-009-021〜044 のうちどれを先に恒常検証化するか）
- カタログ登録解除の手順（check の計上基準・カタログ形式節との整合、解除時の再検査方法）

## 根拠

- PR #2368 本文「Findings / Capture候補」intake 1（経路G adversarial-review Stream A finding A-1、限定合意 disposition）
- docs/designs/foundations/references/verification-scope-catalog.md（512 行の任意行登録、REQ 単位・範囲表現）
- Issue #2362 判断反映コメント（issuecomment-5367783737）「残余実行計画 (a')」
