# inspect-skills SKILL.md の IR 参照表記の扱い統一（IR-053 言及の unclassified-entry 扱い）

## 観測内容（capture 時点）

配布依存境界 gate（source profile）が inspect-skills SKILL.md 59 行目の IR-053 への言及を unclassified-entry として検出し続けている状態が観測された（PR #2475 記録、Epic #2465 Wave2-a の OU-005 では対象範囲外として記録のみ）。配布物での IR 参照表記の扱い（抽象化表記への統一要否）と、統一する場合の gate の unclassified-entry 検出の扱い（baseline 管理か除外規則か）が判断事項とされた。

## 2026-09-03 現行差分（adversarial-review で確認）

- 現行 main の `src/opencode/skills/agentdev-inspect-skills/SKILL.md` から IR-053 の直言及は消滅している（`git grep IR-053` が skill 配下で不検出）。59・61・98 行目は `IR-{NNN}` の裸プレースホルダーへ変換されており、これは ID プレースホルダー裸出力様式 item（2026-08-22）の従属インスタンス 3 箇所 item（2026-09-03）が観測する状態と一致する。
- すなわち「抽象化表記への統一」は既に適用済みで、残る判断は (1) 裸 `IR-{NNN}` 様式の正規化（backtick 包囲か裸出力許容か、IR-064 の判定正規化）と、(2) その様式決定に応じた配布依存境界 gate 側の扱い（unclassified-entry 検出の baseline 管理か除外規則か）に従属する。

## 影響

capture 時点の観測（IR-053 直言及の unclassified-entry 常時 1 件残留）は現行 main で再現しない。一方、様式決定後の gate 側扱いの判断は未了であり、様式決定 item の従属先として保持する価値がある。

## 課題（レビューで決めること）

- 配布物内の IR 参照表記の正規様式決定（裸 `IR-{NNN}` の扱いは 2026-08-22 / 2026-09-03 の様式決定 item と一体）に応じた、配布依存境界 gate の unclassified-entry 検出の扱い（baseline 管理か除外規則か）

## 既存要件・契約との関連

- 配布依存境界 Design（docs/designs/integrity/distribution-boundary.md）の unclassified-entry 検出、IR-064（unresolved-placeholder）の判定正規化。
- 関連 item: ID プレースホルダー裸出力 48 件の正規様式確定（2026-08-22）、agentdev-inspect-skills の裸 `IR-{NNN}` 3 箇所（2026-09-03）。本 item は両 item の様式決定に従属し、backlog-review での統合判定候補。

## 根拠

- PR #2475 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2475 ）
- 2026-09-03 機械確認: `git grep IR-053 -- src/opencode/skills/agentdev-inspect-skills/` 不検出、SKILL.md 59/61/98 行目に `IR-{NNN}` 裸出力を確認
