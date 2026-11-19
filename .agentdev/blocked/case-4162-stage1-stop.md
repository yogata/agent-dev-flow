# Case #4162 停止状態（case-auto stage 1・2026-11-19T14:31:07+09:00）

## 実行状態

- 対象: OU-001（RU-0303・REQ-048 update・単一 Issue 構成・feature/standard）
- Root Case: #4162「Case: 仮説に基づく既存統制変更原則を確立し効果実測の必須条件を解除する」（open・読戻し確認済み）
- 進行: stage 1 case-open で停止。STEP-1〜3・冪等前置・横断依存検査（警告 0 件）・STEP-6 capture まで完了。STEP-4 設計PR作成は機械検証 fail-closed 拒否により未実施（PR なし）。stage 2（case-ready）・クリーンアップ検証ゲート・stage 3（case-run）・stage 4（case-close）未実行
- main ローカル未 push commit: 582e26d4d（draft）・751220dbb（jev 観測 2件）・8048c6a2d（learning capture）
- draft（`.agentdev/drafts/req-draft-hypothesis-driven-control-changes.md`）・RU（`.agentdev/backlog/req-units/RU-0303.md`）は保持

## 停止理由

停止理由分類: command 契約・実装不整合。draft の ACT-REQ-001(1)（REQ-048 目的節第2段落置換・assembly_evidence ASM-REQ-048-PURPOSE）は 4行→3行の行統合を含み、case-open 機械工程の行構造事前確認（REQ-030-030・行区切り保全・fail-closed）と適合しない。機械証拠: `prepare_definition_pr.ts --validate-input` stderr・exit 1。req-define 組立出力と case-open 機械工程契約の横断不整合であり、正規契約内に適用経路なし（合意内容の再折り返しは verbatim 契約〔REQ-030-027〕と内容補完禁止に抵触）。

## 再開情報

再開入口（いずれかの解消後）:

1. `/agentdev/req-define` で draft を再組立（ACT-REQ-001(1) を意味維持の行保全 4 行構成へ変更し assembly_evidence 再取得）→ `/agentdev/case-auto 4162`（Root Case 冪等再利用・case-open STEP-4 から再開）
2. REQ-030-030 側の行統合例外規定整備を別案件で起票・採用後、`/agentdev/case-auto 4162` で再開

再開点の詳細: Root Case #4162 停止記録コメント（issuecomment-7000709011）。learning: `.agentdev/learning/inbox/2026-11-19-definition-pr-preshcheck-rejects-merged-line.md`
