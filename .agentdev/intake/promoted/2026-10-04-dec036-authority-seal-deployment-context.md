# 採用済み成果物: docs/designs の DEC-036 刻印残存 2件（配備形態文脈）の DEC-049 現行化

## 観測内容

検索語「現行の責務体制は DEC-036」で docs/designs/ に残存する刻印のうち、配備形態文脈の 2件が DEC-049 配備形態への刻印現行化候補である。

- docs/designs/foundations/document-model.md:402（配置・同期記述の「現行の責務体制は DEC-036」刻印）
- docs/designs/foundations/harness-separation-model.md:148（DEC-002 括弧注記の「現行の責務体制は DEC-036」刻印）

同一検索語の残存うち docs/designs/skills/case-auto.md の記述（旧 161・168 行付近）は orchestration 責務文脈（DEC-036 が正である文脈）のため対象外。

## 影響

配備形態（マルチホスト正本モデル・投影）に関する権威参照が旧 Decision（DEC-036）を指し続け、読み手を誤った正規情報源へ誘導する可能性。文書の意味内容は正しいが権威刻印のみ旧い状態。

## 課題

配備形態の権威参照刻印を「配備形態の正は DEC-049」へ現行化する対応候補。対象は上記 2箇所の文言更新のみの小規模修正。

## 既存要件との関連

- DEC-049（配備形態）・DEC-036（orchestration 責務体制）の権威分野境界
- REQ-050 系（docs 体系の現行性維持）の文脈

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-03-dec036-authority-seal-deployment-context.md`（分類採用により削除済み）
- 観測元: PR #3386（Case #3364・OU-003）本文 Findings / Capture候補 セクション
- case-close 再実測（2026-10-03・PR HEAD worktree 3684f85e）: 4件残存を同確認
- captured_at_commit: 511dadd161b8ffeeba5eb17c16a6fdc2de52704f
- 現行源検証（intake-promote・ad6e8341・読取のみ）: 上記 2箇所の刻印が現行も残存することを grep 実測で確認（document-model.md は行番号が 376 から 402 へ移動）
