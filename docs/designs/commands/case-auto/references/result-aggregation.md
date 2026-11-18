---
title: 結果状態の4次元集約
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-auto.md から参照される詳細仕様（遅延読み込み）。 -->

# 結果状態の4次元集約

## 結果状態の4次元集約（REQ-034-031）

case-auto は各工程の結果を次の4状態次元で保持し、集約報告で次元を混同しない。
各工程の output_contract（Workflow Skill（`agentdev-workflow-case-auto`）の工程別契約表）が情報源となる。

| 次元 | 取得元 | 値 |
|---|---|---|
| (1) 工程結果 | 全工程（case-open / case-ready / case-revise / case-run / case-close）の pass/warn/fail | pass / warn / fail |
| (2) artifact_action 適用結果 | case-ready / case-revise の action id ごとの適用結果 | applied / skipped / failed / no-op |
| (3) 定義適用工程の完了状態 | (1)(2) の組み合わせから導出 | 定義適用完了 / 警告付き工程完了 / 定義適用未完了 |
| (4) OU ライフサイクル完了状態 | case-open（Issue 作成）、case-run（PR 作成）、case-close（PR マージ、Issue クローズ）の各成否 | 各ライフサイクル事象ごとに 完了 / 未完了 |

集約規則:

- (3) の導出: 全必須 action が applied または正当な no-op で工程結果 (1) が pass → 定義適用完了。同条件で (1) が warn → 警告付き工程完了（warn を pass へ変換しない）。必須 action に skipped または failed が1件以上ある → 定義適用未完了（この場合は定義適用完了/警告付き工程完了と報告しない）。正当な no-op とは、case-ready / case-revise の contract が対象外と判定した action 不実施を指す。正当な理由なく必須 action を飛ばした場合は skipped として扱う
- (4) の独立性: OU ライフサイクル完了状態は (3) と独立して扱う。(3) が定義適用完了/警告付き工程完了であっても case-open（Issue 作成）が未実行なら OU ライフサイクルは未完了と報告する
- Phase 0 と OU 完了の分離: Phase 0 成功（(3) の定義適用完了/警告付き工程完了）と OU 完了（(4) の全ライフサイクル事象完了）を別々に報告する。一方を他方へすり替えて報告しない
- warn 変換禁止: (1) が warn の工程を pass として集約しない。完了報告には warn を warn のまま残す

完了報告（停止時フォーマットを含む）には上記4状態次元を工程別・action id 別・ライフサイクル事象別に列挙する。
実行定義は Workflow Skill（`agentdev-workflow-case-auto`）の「結果状態の4次元集約（REQ-034-031）」および「結果状態の4次元報告（REQ-034-031）」を正とする。
