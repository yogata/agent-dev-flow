# phase コマンド実装済み後の「将来実装予定」系表現の統一

- 出所: inspect-docs 20261013T090730Z DS11（backlog-auto stage 1。REQ 担当 F1-3・Decision 担当 F1・Design 担当 FD03 統合）
- 種別: 表現是正（実装済み機能の移行期表現の不統一解消）
- 対象: docs/guides/artifacts-and-state.md:147、docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:14,50、対比: README.md:19,47、docs/guides/command-selection.md:42、src/common/commands/agentdev/README.md:14,22-26、.agentdev/README.md phase 行

## DS11: 実装済み機能の移行期表現の不統一

- category: 横断（実装済み機能の移行期表現の不統一。REQ 担当 F1-3・Decision 担当 F1・Design 担当 FD03 の統合）
- target: `docs/guides/artifacts-and-state.md:147`、`docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:14,50`、対比: `README.md:19,47`、`docs/guides/command-selection.md:42`、`src/common/commands/agentdev/README.md:14,22-26`、`.agentdev/README.md` phase 行
- evidence: artifacts-and-state.md:147 は工程駆動実行を「（将来実装予定）」と記す。v51-phase-transition:14「公開操作の最終名、保存方式、具体的なスキル構成は…後続設計が確定する」、:50「具体的な公開名と保存実装は後続の実現設計で確定する」と未来形で記す。一方、同一 delta 窓内の commit ed0dc04d・69573879（2026-10-13）で phase-tasks-create/update、phase-artifacts-update、phase-review、phase-transition の5コマンドと workflow skill 5件が実装済みであり、root README 索引・コマンドリファレンス・command-selection.md:42（「各操作は単独で起動でき」現在形）・v51-phase-driven:25-28（最終名を現在形で定義）は限定なしで現行として案内する。同一経路の実装状態の現在性が導線間で割れている。
- severity: medium
- confidence: high（表現不整合は確認済み）/ medium（「将来実装予定」が Local 版適用（REQ-111-011）や正式採用など別の限定を意図する可能性）
- source_of_truth: REQ-111-011、REQ-111-013、DEC-058、root README 索引（18コマンド）、実装ファイル群
- recommended_route: 表現是正候補（「将来実装予定」「後続設計で確定」の意図する限定内容を明記し、全ミラー箇所で表記を統一）。
- ng_classification: 今回修正対象候補（当該記述は今回 delta で追加）。
- notes: `.agentdev/README.md` phase 行「操作の実装は後続 Wave で導入」も実装済み後は陳腐化する（附随観察）。実装済み範囲の GitHub 版 / Local 版の断定は REQ-111-011 の検証義務の状態次第で保留。

## 処置方針

1. 「将来実装予定」「後続設計で確定」の各記述について、意図する限定内容（正式採用未了・Local 版検証義務〔REQ-111-011〕の未消化等）を明記し、全ミラー箇所（artifacts-and-state.md:147、v51-phase-transition:14,50、.agentdev/README.md phase 行）で表記を統一する
2. 限定する根拠がない記述（実装済み事実と矛盾する「将来実装予定」）は、実装状態を現在形へ現行化する
3. phase 5コマンドの command Design 未整備（DS12 附随観察）とは連動して処置する

## 処置判断の根拠（inspect-promote 2026-10-13）

- artifacts-and-state.md:147「（将来実装予定）」を現物実読確認。同一 delta 窓で phase 5コマンド・6スキルが実装済み（root README 索引 18コマンド・commit 69573879）は機械検査・README コマンド索引実在確認で裏付け済み
- 実装状態の現在性が導線間で割れている事実（表現不整合）は確定。「別の限定を意図する可能性」は是正時に限定内容の明記として解消する

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: artifacts-and-state.md:147 現物実読と README 18コマンド索引（20261013 診断機械検査・親確認）で実装済み事実を再確認。
- Jev 評価: promote（0.59）で最終判断と一致（観測 20261013T094827Z-5dc0 d10）。
