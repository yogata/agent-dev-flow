# Intake Item: REQ-0108 SPEC 参照値表の行数陳腐化

## 発生源

- 発見元: PR #1553（Issue #1552 case-close時の Findings / Capture候補回収）
- 発見日時: 2026-07-18
- 検査ルート: intake
- 原因分類: 確認済（REQ-0108-270/271 追記時の SPEC 参照値表更新漏れ）

## 問題

`docs/specs/quality/req-health-metrics.md:95` の REQ 健全性参照値表が、REQ-0108 の要件行数を `22` と記載している。実際の `docs/requirements/REQ-0108.md` は commit `d9480642` での REQ-0108-270/271 APPEND により 39行（+17行）となっており、参照値表が陳腐化している。

検出1件:

- ファイル: `docs/specs/quality/req-health-metrics.md`
- 記載行: REQ-0108 の行数欄 `22`（+0 表示）
- 実態: 39行（SPEC 基準 0-50行の健全圏内）

REQ-0108-270/271 追記（commit `d9480642`）時に SPEC 参照値表の REQ-0108 行が同時に更新されなかった。req-health-metrics SPEC は参照値を静的テキストで保持しており、req-save 工程での自動同期機構がないため手動更新に依存している。

## 推奨修正対象

`docs/specs/quality/req-health-metrics.md` の REQ-0108 参照値表行を更新する。

- 行数欄: `22` → `39`
- 差分欄: `+0` → `+17`（22 からの実増分）

予防策検討（別件）: req-save が要件行数を APPEND する際、参照元 SPEC の参照値表を自動更新する仕組み、または `docs-check` / `inspect-docs` で行数ズレを検出する checker 追加を検討すると再発防止になる可能性。本 item は修正自体が主目的で、予防策は知見として記録。

昇格先候補: intake-promote で採否判断。修正は1ファイル2カラム変更のため単純だが、他 REQ の参照値表も含めて一括精査するかは intake-promote で判断。AG-004（OU-002 別 case）でのドリフト検出機構検討の material にもなり得る。

## 関連

- 発見元 PR: https://github.com/yogata/agent-dev-flow/pull/1553（Findings / Capture候補 セクション docs-integrity）
- 発見元 Issue: https://github.com/yogata/agent-dev-flow/issues/1552
- 対象ファイル: `docs/specs/quality/req-health-metrics.md`（95行目付近の REQ-0108 行）
- 関連 REQ: REQ-0108（docs-check / 検証・テスト）、REQ-0108-270/271（commit `d9480642` で APPEND）
