---
id: learn-20261118-delegation-harness-interruption-inline-resume
created_at: 2026-11-18
source: case-close capture (PR #4157)
status: inbox
---
# case-run の委譲がハーネス障害（モデル解決エラー→子セッション消失）で2回中断し、親オーケストレータのインライン実行で継続した

- 問題事象: case-run の実行担当委譲（DEL-4153-1）がハーネス障害（モデル解決エラー→子セッション消失）で2回中断した。実装・検証は中断後も継続が必要であり、再委譲の安全性判定（中断済み成果物の再利用可否）が委譲契約に明文化されていなかった
- 発生局面: case-run STEP（Issue 4153 実装・Case 4150 Wave-1・PR 4157）
- 検知方法: 委譲セッションの消失検知（ハーネス側のモデル解決エラーと子セッション不在の観測）
- 根本原因: 委譲先サブエージェントの実行継続性がハーネス障害に対して単一障害点であり、障害時の再委譲と親インライン実行の切替条件・中断済み成果物の同一性確認手順が委譲契約に未規定
- 自律対応内容: 監督者指示により親オーケストレータのインライン実行として完了。委譲先が得ていた調査成果（期待値結合テスト7ファイル検出等）は継承して実装へ反映済み
- ユーザー確認有無: あり（監督者指示により委譲からインライン実行へ切替）
- Decision/REQ/spec 影響: REQ-031（case-run 実行契約・委譲）、agentdev-case-run-execution-adapter、agentdev-workflow-orchestration references/subagent-protocol.md（サブエージェント protocol・self-healing loop）
- 横展開観点: 委譲実行の中断後の継続は「再委譲」と「親インライン実行」の2経路があり、どちらを選ぶかは中断済み成果物の同一性・範囲確認と障害種別（一時的か恒常的か）で決まる。障害種別ごとの既定経路を契約に置くと判断が安定する
- 再発条件: ハーネス障害（モデル解決エラー・セッション消失等）が委譲実行中に発生する場合
- 予防策候補: 委譲契約へ再委譲の安全性判定基準（中断済み成果物の同一性・範囲確認、再委譲とインライン実行の切替条件）と障害種別ごとの既定経路を明記する
- 想定反映先: agentdev-workflow-case-run references/delegation-and-result.md、agentdev-workflow-orchestration references/subagent-protocol.md
- 関連: Case 4150、Issue 4153、PR 4157
- タグ: 委譲、ハーネス障害、セッション消失、インライン実行、再開
