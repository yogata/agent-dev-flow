# traceability check fail 3 件の段階解消（対象選定材料）

## 概要

現行 main の traceability check（7種検査）で fail 3 件が継続している。malformed-declarations 1 件（docs/designs/skills/agentdev-doc-diagnostics.md L104 — ADF-COVERS(implementation) 宣言が ID リスト形式を満たさない）、missing-implementation 複数（REQ-001-066 / REQ-001-067 等）、missing-verification 複数（REQ-001-004 / REQ-001-005 等）の段階解消 case 化候補。

## 内容

- PR #2767 merge 時点の検証記録では 7 チェック pass / fail 0 であり、その後の main 変更で生じた状態。case 2769（docs_chore・変更ゼロ・target_req null）の範囲外のため当該 case では対応しなかった（QG-4 独立再検査での検出・既存事項の記録に留める）
- 現行 main 状態の実測コマンド（case 2769 SSoT 記載）を対象選定材料として利用可能:
  `bun ./src/opencode/skills/agentdev-traceability/scripts/src/check.ts --root .`
- 解消 case 化する場合の着眼点: 宣言形式不備は REQ ファイル側の ADF-COVERS 宣言修正、missing-implementation / missing-verification は REQ-001 系の対応関係（実装・検証）の棚卸しが前提となり得る

## 根拠

- 観測元: case 2769 SSoT 検証コメント（[issuecomment-5633670502](https://github.com/yogata/agent-dev-flow/issues/2769#issuecomment-5633670502) の `## Findings` / `## Capture候補`）、case-close（2026-09-11）で回収
- main 既存事項・case 2769 非起因（worktree diff 0 件のため）
