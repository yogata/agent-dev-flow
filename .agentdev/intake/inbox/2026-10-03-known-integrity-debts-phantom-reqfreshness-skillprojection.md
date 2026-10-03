# intake: docs 整合性の既知債務 3件（Phantom REQ-003-055・ReqFreshness・SkillProjection manifest 鮮度）

## 内容

check_integrity（docs-check）で検出される既知債務 3系統。Case #3364（PR #3386）の変更対象ファイルと非交差の baseline 既出であり本変更起因なし。

1. **Phantom REQ-003-055 引用 ×3**（IR-067）: docs/designs/foundations/v4-responsibility-boundaries.md:44・67、docs/requirements/REQ-003.md:56。REQ-003 の 2026-10-03 内容変更由来の先行欠陥。
2. **ReqFreshness NG ×4**（IR-072）: REQ-003・REQ-012・REQ-034・REQ-082 の frontmatter updated と最終 content-change commit 日（2026-10-03）不一致。main 追随差由来。
3. **skill-projection-manifest.yaml 鮮度**（IR-068）: src/common/skills の agentdev-skill-resolution が manifest 未登録。

対応候補: Phantom 引用の是正、ReqFreshness の frontmatter updated 更新（次回 REQ 内容変更時に追随確認）、SkillProjection manifest への agentdev-skill-resolution 登録。

## 根拠

- 観測元: PR #3386（Case #3364・OU-003）本文 Findings / Capture候補 セクション
- 元テキスト: 「Phantom REQ-003-055 引用 ×3（IR-067）…REQ-003 の 2026-10-03 内容変更由来の先行欠陥」「ReqFreshness NG ×4（IR-072）…main 追随差由来」「skill-projection-manifest.yaml 鮮度…manifest 未登録（IR-068）」いずれも関連 Case: #3364 検出・本変更無関係
- case-close 再実測（2026-10-03）: case-run の docs-check 記録（ok 798 / ng 8 / warning 3・本変更起因 NG 0 件）で同系統確認済み
- captured_at_commit: 511dadd161b8ffeeba5eb17c16a6fdc2de52704f
- 再観測（capture 統合）: Case #3391 Wave 1（PR #3405・#3398）の検証でも同 4 REQ（REQ-003/012/034/082）の req-updated-freshness NG を e7c2626b（REQ-101 新設 merge）由来として再検出（check_integrity --root worktree・main root で同一再現）。REQ 変更時に frontmatter updated を進行させる手順の追随漏れ。PR 本文 intake 候補から本 item へ統合（重複のため新規 item は作成せず）
