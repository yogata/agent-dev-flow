# REQ-0108 SPEC 参照値表の行数陳腐化

## 観測内容

PR #1553（Issue #1552 case-close 時の Findings / Capture候補回収、発見日時: 2026-07-18、検査ルート: intake）で検出。

`docs/specs/quality/req-health-metrics.md:95` の REQ 健全性参照値表が、REQ-0108 の要件行数を `22` と記載している。実際の `docs/requirements/REQ-0108.md` は commit `d9480642` での REQ-0108-270/271 APPEND により 39行（+17行）となっており、参照値表が陳腐化している。

- 対象ファイル: `docs/specs/quality/req-health-metrics.md`
- 記載行: REQ-0108 の行数欄 `22`（+0 表示）
- 実態: 39行（SPEC 基準 0-50行の健全圏内）

REQ-0108-270/271 追記（commit `d9480642`）時に SPEC 参照値表の REQ-0108 行が同時に更新されなかった。req-health-metrics SPEC は参照値を静的テキストで保持しており、req-save 工程での自動同期機構がないため手動更新に依存している。

## 影響

SPEC 参照値の陳腐化。実行時機能破壊はなく、行数自体は健全圏内（0-50行）。docs 整合性ドリフト。REQ 行数追記ごとに再発する可能性がある。修正は1ファイル2カラム変更。

## 課題

req-health-metrics SPEC の REQ-0108 参照値表を行数 22→39、差分 +0→+17 へ更新する。

## 既存要件・仕様との関連

- REQ-0108（docs-check / 検証・テスト）: 参照値表の監視対象 REQ。
- REQ-0108-270/271（commit `d9480642` で APPEND）: 追記時に参照元 SPEC の参照値表が追従しなかった。
- 関係: SPEC の静的参照値が実 REQ 行数より17行古い（陳腐化）。

## 対応方針の方向性

`docs/specs/quality/req-health-metrics.md` の REQ-0108 参照値表行を更新する（行数欄 `22`→`39`、差分欄 `+0`→`+17`）。他 REQ の参照値表も含めた一括精査の可否は backlog-review で判断する。

予防策（req-save が要件行数を APPEND する際の参照元 SPEC 自動更新機構、または docs-check / inspect-docs での行数ズレ checker 追加）は知見として記録する。
