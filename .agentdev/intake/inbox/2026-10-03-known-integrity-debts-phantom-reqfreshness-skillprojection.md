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
