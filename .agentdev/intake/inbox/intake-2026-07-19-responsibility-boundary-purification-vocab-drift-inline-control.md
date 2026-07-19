# Intake Item: responsibility-boundary-purification.md で「実行担当サブエージェント内部」の語彙が揺れている

## 発生源

- 発見日時: 2026-07-19
- 発見 PR: PR #1594（harness-separation-model.md SPEC update、ACT-SPEC-006）
- 発見 Issue: Issue #1588（responsibility-boundary-purification.md の case-auto 所有/非所有リスト更新）
- 検出方法: case-run QG-3 検証時の手動確認（PR #1594 Findings セクションに記録）

## 問題

`docs/specs/foundations/responsibility-boundary-purification.md` において「実行担当サブエージェント内部」の処理を指す表現が揺れている。Issue #1588 の完了条件 2「実行担当サブエージェント内部実行制御」に対し、該当 SPEC は行によって表現が異なる:

- SPEC line 36（非所有リスト相当）: 「実行担当サブエージェント内部の **推論**」
- SPEC line 38（限定注記）: 「実行担当サブエージェント内部の **実行制御**」

概念的整合（推論を実行制御が含む関係）は取れているが、語彙の揺れが SPEC 品質上の微細な改善候補として残る。Issue #1588 の完了判定には影響しない（限定注記で意図が明確化されているため）。

## 推奨修正対象

`docs/specs/foundations/responsibility-boundary-purification.md` の line 36「実行担当サブエージェント内部の推論」を、line 38 限定注記と整合する「実行担当サブエージェント内部の実行制御（推論、context 管理、retry、エラー解析等）」へ修正し、用語を統一する。または逆に line 38 を具体例（推論等）付きの表現へ拡張し、両者で表現粒度を揃える。

route 想定: spec-save（既存 SPEC への語彙統一のみ）。REQ 改訂を伴わない SPEC 更新のため req-define は経由しない。

## 関連

- 発見元 PR: https://github.com/yogata/agent-dev-flow/pull/1594
- 発見元 Issue: https://github.com/yogata/agent-dev-flow/issues/1588
- Epic: https://github.com/yogata/agent-dev-flow/issues/1581
- 対象ファイル: `docs/specs/foundations/responsibility-boundary-purification.md`（line 36, line 38 周辺）
- 関連 SPEC: harness-separation-model.md（ACT-SPEC-005 で ADR-0136 決定2限定注記と整合）
