# 中黒許容範囲アルゴリズムの SPEC document-type-responsibilities.md 反映候補

## 発生源

- Issue: #1106
- PR: #1117 (merged, squash 9d692b8)
- 発生日: 2026-06-24

## 内容

PR #1117 で `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 1 に中黒許容範囲の機械判定アルゴリズム（許容条件 4 種: SPEC 明示例、時系列対比ペア `X時・Y時`、code block 内、YAML title）を明文化した。

本アルゴリズムは将来的に SPEC `docs/specs/document-type-responsibilities.md`「中黒使用の許容範囲」節へ、機械適用向けアルゴリズム記述として反映可能。SPEC 側は人間向け判定基準を持ち、機械適用向けのアルゴリズム的記述を欠く状態が継続している。

PR では skill reference への集約までとし、SPEC 昇格は case-close Step 3 の判断に委ねた。本候補は SPEC 昇格 (draft → accepted) ではなく既存 accepted SPEC への追記であり、かつ本 Issue は docs_chore で spec-save flow の対象外のため、見送りとして intake 化する。

## 推奨対応先

別 Issue として切り出すことを推奨。作業候補:

- SPEC `document-type-responsibilities.md`「中黒使用の許容範囲」節に機械判定アルゴリズム（許容条件 4 種）の参照または記述を追記
- `mechanical-replacement-rules.md` section 1 との二重管理を避けるため、SPEC 側は参照先として最小化するかを併せて検討

## 現在の追跡状態

- PR #1117 SPEC確定候補に記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
