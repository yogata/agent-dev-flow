# integrity-rule-gap: 'docs 日本語表現・文意整合' カテゴリが gap detector の map に未マッピング

## 観測

`/repo/docs-check` の `integrity-rule-gap/skill-category-gap` ルールが NG 1 件を報告。

> SKILL.md category 'docs 日本語表現・文意整合' has no mapping in gap detector (category-to-check-pattern map)

`repo-agentdev-integrity` の SKILL.md「検査カテゴリ」表で 'docs 日本語表現・文意整合' が定義され（IR-045, REQ-0140）、`check_integrity.ts` にも `doc-language-quality` 等の検出処理が実装済み。しかし gap detector が保持する category-to-check-pattern map に当該カテゴリのエントリが追加されていない。原因は確認済（カテゴリ追加時の gap detector 側メタデータ更新漏れ）。

## 影響

- gap detector が SKILL.md カテゴリと checker 実装の過不足を監視する目的を、当カテゴリについて果たせない。将来 checker 実装が削除されても gap detector が警告しない。
- `/repo/docs-check` が NG を継続報告する。
- REQ-0108「SKILL.md カテゴリと checker 実装の一致」という不変条件の保証が弱まる。

## レビューで決めること

- gap detector の category-to-check-pattern map に 'docs 日本語表現・文意整合' を追加し、既存の `doc-language-quality` 系検出関数を対応付けするか。
- あるいは SKILL.md のカテゴリ表記を既存マップ済みカテゴリ（'語彙ポリシー' / 'Cross-REQ vocab' 等）へ統合してカテゴリ新設を取りやめるか。
- 類似の「SKILL.md に定義されたが gap detector に未マッピング」カテゴリが他に潜在していないか横展開確認するか。

## 根拠

- 検出ルール: `integrity-rule-gap/skill-category-gap` NG（`check_integrity.ts`）
- SKILL.md: `.opencode/skills/repo-agentdev-integrity/SKILL.md`「検査カテゴリ」表（'docs 日本語表現・文意整合' = IR-045 / REQ-0140 由来）
- ルート: req-define（カテゴリ定義と checker map の整合性は要件構造判断領域）
- 関連 intake item: `2026-06-21-issue1011-docs-check-backend-category-scope.md`（docs-check バックエンドへのカテゴリ追加可否。本 item は配布物整合性カテゴリではなく 'docs 日本語表現・文意整合' カテゴリに特化）
- 検出元: `/repo/docs-check` 実行（2026-06-22）
