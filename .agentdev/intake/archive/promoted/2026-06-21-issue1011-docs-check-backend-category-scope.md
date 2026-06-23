# docs-check バックエンド（check_integrity.ts）への配布物整合性カテゴリ追加見送り

## 観測

PR #1012 (Issue #1011 / REQ-0142) で、`docs/specs/docs-spec-rebuild-integrity.md` が定義する配布物整合性検査パターン（構文健全性・文意保持・責務整合）を `inspect-docs` / `inspect-skills` / `req-structure-diagnostics` の各 skill 内に実装した。一方で `check_integrity.ts`（`repo-agentdev-integrity` skill の docs-check バックエンド）にこれらの検査カテゴリを直接追加することは見送った。

理由: 追加すると `skill-category-gap` NG が新カテゴリで汚染され、既存の「配布物↔スキルカテゴリ一致」チェック項目のターゲットングが隠退化する。docs-check の項目役割範囲は「スクリプト修正を含める範囲」と「含めない範囲（command/skill 定義レベル）」の境界を維持する必要がある。

## 影響

- docs-check 実行時に配布物整合性 NG（構文破損・壊れた括弧等）が `check_integrity.ts` で直接検出されず、`inspect-docs` / `inspect-skills` の手動実行に依存する状態が残る。
- 自動 CI 等で配布物整合性を継続監視したい場合、`check_integrity.ts` 拡張と `skill-category-gap` ルール調整の両方が必要。

## レビューで決めること

- `check_integrity.ts` に配布物整合性カテゴリを追加するか、それとも command/skill 定義レベル（inspect-docs/inspect-skills）の検出のみで運用するか。
- 追加する場合、`skill-category-gap` ルールをどう調整するか（カテゴリ除外・対象範囲再定義等）。
- docs-check の項目役割範囲（スクリプト修正を含める範囲 vs 含めない範囲）を SPEC として明文化するか。

## 根拠

- PR #1012: https://github.com/yogata/agent-dev-flow/pull/1012
- Issue #1011: https://github.com/yogata/agent-dev-flow/issues/1011
- SPEC: `docs/specs/docs-spec-rebuild-integrity.md`
- バックエンド: `src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- 既存ルール: `skill-category-gap` NG（`repo-agentdev-integrity` で実装）
