# local-generation.md の「廃止候補」表記が REQ-0141 昇格後ズレ（transform/ 確定廃止との整合）

## 発生源

- Issue: #1193（CLOSED, COMPLETED, case-close 完了）
- PR: #1195（merged, squash 8e66106b）
- 発生日: 2026-06-26

## 内容

PR #1195 の Findings セクションで指摘。`docs/specs/local-generation.md` L52, L63 は `transform/` を「廃止候補」として記載していたが、本 PR #1195 で REQ-0141-004/009/028 を「確定廃止」へ昇格したため、SPEC 記載との間に軽微なズレが生じた。

Issue #1193 は local-generation.md を是正対象外（既に ADR-0131 link mode 語彙で是正済み）として明示的にスコープ外扱いとしたため、本 PR #1195 では対処せず。SPEC 整合性の観点から別 Issue で local-generation.md のみ語彙修正（「廃止候補」→「確定廃止」相当の表現）を検討可能。

## 推奨対応先

別 Issue（docs_chore）として切り出すことを推奨。作業候補:

- local-generation.md L52, L63 の「廃止候補」表記を REQ-0141 確定廃止状態と整合する表記へ是正
- REQ-0141.md 側の昇格後表記との語彙一致性を再確認
- ADR-0131 link mode 語彙との二重確認

## 現在の追跡状態

- PR #1195 Findings: scope out（4 ファイルスコープ外）
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
- 本 intake の SPEC 確定候補: なし（既存 SPEC の語彙整備作業）

## 備考

local-generation.md は ADR-0131 link mode 語彙への是正自体は完了している。本 intake は REQ-0141 昇格に伴う語彙ズレの解消が目的であり、link mode 移行の妥当性そのものには影響しない。
