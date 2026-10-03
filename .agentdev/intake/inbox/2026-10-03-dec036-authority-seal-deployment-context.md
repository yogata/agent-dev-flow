# intake: docs/designs の DEC-036 刻印残存 2件（配備形態文脈）の DEC-049 現行化

## 内容

検索語「現行の責務体制は DEC-036」で docs/designs/ に 4件残存のうち、配備形態文脈の 2件が DEC-049 配備形態への刻印現行化候補である。

- docs/designs/foundations/document-model.md:376（配置・同期記述の「現行の責務体制は DEC-036」刻印）
- docs/designs/foundations/harness-separation-model.md:149（DEC-002 括弧注記の「現行の責務体制は DEC-036」刻印）

対応候補: 配備形態の権威参照刻印を「配備形態の正は DEC-049」へ現行化する。残存 4件のうち case-auto.md:161・168 は orchestration 責務文脈（DEC-036 が正である文脈）のため対象外。

## 根拠

- 観測元: PR #3386（Case #3364・OU-003）本文 Findings / Capture候補 セクション
- 元テキスト: 「docs/designs/ の DEC-036 刻印残存 4件のうち配備形態文脈 2件: document-model.md:376・harness-separation-model.md:149（検索語「現行の責務体制は DEC-036」）。DEC-049 配備形態への刻印現行化候補。本 Case 変更対象成果物外のため対象範囲拡大せず記録」
- case-close 再実測（2026-10-03・PR HEAD worktree 3684f85e）: 4件残存を同確認（guides 3ファイル内は 0 件・本変更起因なし）
- captured_at_commit: 511dadd161b8ffeeba5eb17c16a6fdc2de52704f
