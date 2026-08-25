# 配布物対応宣言の producer 側 Design 配置運用が Design へ明文化されていない（PR #2364・#2368 由来）

## 観測

配布スキル本体（src/opencode/**）は concrete 要件行ID を持てない（DEC-014、IR-055、check_distribution_boundary gate）。このため Epic #2358 の棚卸しでは「配布物（src/opencode/**）の対応宣言は producer 側 Design（docs/designs/**）へ配置する」運用を採用した（commit b44024f8 で確立）。この配置規則が agentdev-traceability.md Design および traceability-model.md の対応関係規範に明文化されていない。

PR #2364（Wave 2）では「TIM 対応宣言の保存先と配布依存境界の衝突」として報告され、OU-003・OU-004 での検討候補とされたが、全 Wave 完了後も未解決のまま残存している（PR #2368 Findings intake 2 が同一課題の再報告）。

## 今回扱わない理由

Epic #2358 全 Wave の実装・検証は配置運用の実践で完結しており、check 全検査 pass（missing-implementation 0 / missing-verification 0）が配置運用の実効性を示している。Design への規範明文化は境界規則の見直し判断（配布物の宣言保持を許容するか）を含み、case-close の capture 責務（回収・保存）の対象外である。

## 影響

明文化がない状態では、次回以降の配布スキル対応宣言の保存先判断が慣例依存になる。「対応宣言は対応する成果物自身を正規情報源として保持する」（traceability-model.md）との完全整合には、(a) 配布物の宣言保持を許容する境界規則の見直し、または (b) 配布スキルの対応宣言の保存先規範の明文化、のいずれかが必要な状態が継続する。

## レビューで決めること

- (a) 境界規則の見直し（配布物の宣言保持許容）と (b) 保存先規範の明文化（producer 側 Design 配置の正規化）のどちらを採るか
- IR-055 境界と対応宣言の配置規則の関係をどの Design（agentdev-traceability.md / traceability-model.md）へ記録するか

## 根拠

- PR #2364 本文「Findings / Capture候補」docs-integrity 1（TIM 対応宣言の保存先と配布依存境界の衝突）
- PR #2368 本文「Findings / Capture候補」intake 2（producer 側 Design 配置運用の未明文化、前回 blocked Findings 3 の未解決）
- commit b44024f8（配布物への対応宣言を producer 側 Design へ移設）
- docs/designs/foundations/traceability-model.md「対応関係の完全性規則」（区分適用版）
