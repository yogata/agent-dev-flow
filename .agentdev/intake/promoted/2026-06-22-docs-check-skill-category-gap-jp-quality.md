# docs 日本語表現・文意整合 カテゴリが gap detector の map に未マッピング

## 観測

`/repo/docs-check` の `integrity-rule-gap/skill-category-gap` ルールが NG を報告。'docs 日本語表現・文意整合' カテゴリが SKILL.md には定義済みだが、`check_integrity.ts` の category-to-check-pattern map にエントリが追加されていない。

## 影響

- gap detector の監視機能が当該カテゴリについて機能していない
- 将来 checker 実装が削除されても警告が出ない
- REQ-0108「SKILL.md カテゴリと checker 実装の一致」の不変条件の保証が弱まる

## 課題

- gap detector の category-to-check-pattern map に 'docs 日本語表現・文意整合' を追加するか、既存カテゴリへ統合するか

## 既存要件との関連

- REQ-0108（SKILL.md カテゴリと checker 実装の一致）
- IR-045（docs 日本語表現・文意整合検査）
- REQ-0140（docs 日本語表現・文意整合カテゴリ）

## 根拠

- 元 inbox item: `2026-06-22-docs-check-skill-category-gap-jp-quality.md`
- 検査: `skill-category-gap`（strict）
