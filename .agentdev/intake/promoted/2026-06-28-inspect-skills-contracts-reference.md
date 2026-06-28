## 観測内容
`check_integrity.ts` の ReferencePath カテゴリ（`reference-path-existence`）が、`.opencode/skills/agentdev-inspect-skills/SKILL.md` の行 3、52（2出現）、81 で `references/contracts.md` を相対参照している点を NG 検出した（route: intake、NG 4件）。

当該ファイルは `agentdev-inspect-skills/references/` 配下ではなく `agentdev-gh-cli/references/contracts.md` にのみ存在する。相対パス `references/contracts.md` で記述するとローカルスキル内にファイルがないため解決できない。

実体確認結果:
- `agentdev-gh-cli/references/contracts.md`: 存在する（`Test-Path` = True）
- `agentdev-inspect-skills/references/contracts.md`: 存在しない

SKILL.md の参照箇所:
- 行 3（frontmatter description）: 「detecting SPEC operation contract table vs references/contracts.md field inconsistency」
- 行 52（診断観点表）: 「対応する `references/contracts.md` のフィールド集合が...」
- 行 81（診断分類表）: 「SPEC 操作契約テーブルと references/contracts.md の...」

行 52 で `references/contracts.md` が同一行に2回出現するため、スクリプトが別 finding として計上している。実体は同一問題である。

## 影響
docs-check NG が継続しており、参照解決エラー状態（NG 4件、うち2件は同行重複）。相対パス参照が解決できないため、ドキュメント整合性チェックが通らない状態。

## 課題
- `references/contracts.md` 参照を明示パス `.opencode/skills/agentdev-gh-cli/references/contracts.md` へ修正すること（原因分類: 確認済 — 実体配置確認済）
- `inspect-skills/references/` 配下へ contracts.md をコピーする案は単一情報源原則に反するため採らない（原因分類: 確認済）

## 既存要件との関連
なし
