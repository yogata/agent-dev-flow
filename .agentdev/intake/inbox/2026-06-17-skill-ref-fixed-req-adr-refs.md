# Skill reference ファイル群に固定 REQ/ADR 参照が残存

## 観測

配布対象 skill の reference ファイルに、固定 REQ/ADR 参照（REQ-0103-079 違反候補）が残存している。PR #802 で 13 ファイル中 7 ファイルの禁止参照是正を実施した際、スコープ外の reference ファイルにも同種の残存を発見し、明示的に「intake候補（次回クリーンアップ対象）」と分類した。

残存対象:

1. `src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md`
   - REQ-0119-005/006 の固定参照（Step 表記ルール記述箇所）
   - REQ-0111-004 の固定参照（セマンティクス維持確認箇所）
   - ADR-0112 §4/§5/§6 の固定参照（委譲定義確認セクション）

2. `src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md`
   - REQ-0104-021 の固定参照（Upstream Handoff Metadata Convention 記述箇所）

※ 2026-06-17 時点で grep 確認済み：両ファイルとも上記参照が現存する。

## 今回扱われないだった理由

PR #802 のスコープ（Issue #801 対象の 13 ファイル）外であったため、当該 PR では対応を見送った。

## 影響

- reference ファイルが特定 REQ/ADR の要件行番号に結合しており、REQ/ADR の改廃時に reference 側の記述が陳腐化するリスク
- REQ-0111（retired）の要件番号を参照している箇所があり、retired REQ 参照として整合性を損なう可能性

## レビューで決めること

- reference ファイル内の REQ/ADR 引用が「ルールの出典明示」として許容されるか、それとも固定参照として抽象化（プレースホルダー化・自然文置換）すべきか
- ADR-0112 の §番号参照をセクション名レベルへ抽象化すべきか

## 根拠

- 観測元: PR #802「fix(skill-refs): remove forbidden references from distributed skill files (#801)」の Findings / Capture候補セクション
- 元テキスト（PR #802 Findings）:
  > 1. **発見元**: Step 8 grep検証
  >    **内容**: `agentdev-command-authoring/references/command-authoring-standards.md` に REQ-0119-005/006、REQ-0111-004、ADR-0112 §4/§5/§6 の固定参照が残存
  >    **分類**: intake候補（次回クリーンアップ対象）
  >
  > 2. **発見元**: Step 8 grep検証
  >    **内容**: `agentdev-workflow-lifecycle/references/upstream-handoff.md` に REQ-0104-021 の固定参照が残存
  >    **分類**: intake候補（次回クリーンアップ対象）
- 関連 REQ: REQ-0103-079（配布物の REQ/ADR 固定参照禁止）、REQ-0103-090/099（参照境界）
