## 観測内容
Issue #1191（case-run SPEC の L2 タイムスタンプ計測 Step 整合を回復する）で、AG-004 完了条件 5「SPEC accepted 昇格判定」を **見送り（DEFER）** とした。L2 セクション整合性は解消したが、case-run.md SPEC は複合 SPEC であり、SPEC 内 Step 番号体系（SPEC は Step 0-7、command は Step 1-8 で 1 オフセット）と他セクションの網羅的 SPEC↔command 整合性が未検証のため、ADR-0123「accepted = 全整合性ルール検査対象」に照らして昇格を見送った。

Issue #1191 での判定:
> **SPEC accepted 昇格判定（AG-004 完了条件 5）**: **見送り（DEFER）**。L2 セクション整合性は本 PR で解消した。ただし case-run.md SPEC は複合 SPEC であり、SPEC 内 Step 番号体系（SPEC は Step 0-7、command は Step 1-8 で 1 オフセット）と他セクションの網羅的 SPEC ↔ command 整合性が未検証。AG-004 適用範囲「対象外: command 定義 Step 番号の再編」で明示される番号不整合は SPEC 内 L2 セクションと他セクション間でも発生している。ADR-0123「accepted = 全整合性ルール検査対象」に照らし、既知の不整合が残る状態での昇格は不適切ため spec-save 又は専用 Issue での網羅的 SPEC ↔ command 整合回復後に昇格する。

## 影響
SPEC accepted 昇格が ADR-0123「accepted = 全整合性ルール検査対象」要件を満たしていない状態。既知の不整合（Step 番号体系のオフセット）が残る状態での昇格は不適切。

## 課題
case-run.md SPEC の網羅的 SPEC↔command 整合性回復:
- SPEC 内 Step 番号体系（SPEC は Step 0-7、command は Step 1-8 で 1 オフセット）の整合性検証
- 他セクションの網羅的 SPEC↔command 整合性検証
- ADR-0123 要件を満たした上で accepted 昇格

## 既存要件との関連
- Issue #1191（case-run SPEC の L2 タイムスタンプ計測 Step 整合を回復する）
- ADR-0123「accepted = 全整合性ルール検査対象」
- AG-004（SPEC accepted 昇格判定完了条件 5）
