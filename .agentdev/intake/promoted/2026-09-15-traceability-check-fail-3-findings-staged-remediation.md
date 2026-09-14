# traceability check fail 3 件の段階解消（対象選定材料）

## 観測内容

現行 main の traceability check（7種検査）で fail 3 件が継続している:

- malformed-declarations 1 件: `docs/designs/skills/agentdev-doc-diagnostics.md` L104 — ADF-COVERS(implementation) 宣言が ID リスト形式を満たさない
- missing-implementation 複数: REQ-001-066 / REQ-001-067 等
- missing-verification 複数: REQ-001-004 / REQ-001-005 等

PR #2767 merge 時点の検証記録では 7 チェック pass / fail 0 であり、その後の main 変更で生じた状態。

## 影響

- traceability check の fail が継続し、REQ 体系の対応関係（実装・検証）の整合確認が滞る

## 課題（対応候補と判断材料）

- 段階解消 case 化の対象選定材料として、現行 main 状態の実測コマンドを利用可: `bun ./src/opencode/skills/agentdev-traceability/scripts/src/check.ts --root .`
- 着眼点: 宣言形式不備は REQ/Design ファイル側の ADF-COVERS 宣言修正、missing-implementation / missing-verification は REQ-001 系の対応関係（実装・検証）の棚卸しが前提となり得る

## 既存要件との関連

- REQ-001 系（対応関係の棚卸し対象）
- malformed-declarations / missing-implementation / missing-verification: traceability check の検査種別

## 根拠

- 観測元: case 2769 SSoT 検証コメント（issuecomment-5633670502 の `## Findings` / `## Capture候補`。QG-4 独立再検査での検出・既存事項の記録）、case-close（2026-09-11）で回収
- main 既存事項・case 2769 非起因（worktree diff 0 件のため）
- 処分経緯: intake-promote（2026-09-15）で採用を確定（ユーザー承認。fail の現存再検証はスクリプト実行を要するため対象選定時実施）
