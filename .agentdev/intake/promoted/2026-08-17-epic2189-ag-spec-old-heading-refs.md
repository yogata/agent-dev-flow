# コマンド/スキル SPEC 6ファイルが AG SPEC の旧見出し「利用上の防護」を参照 — 「ワークフロー利用」への追従更新

## 観測内容

docs/specs/commands/req-define.md、spec-save.md、case-open.md、case-close.md、backlog-review.md と docs/specs/skills/agentdev-adversarial-review.md の計6ファイルが AG SPEC の旧見出し「利用上の防護」を参照している。現行見出しは「ワークフロー利用」（stage 0 spec-save commit e73ba8e5 で更新済み）。参照切れ（旧見出し参照）のままになっている。本 Epic スコープ外のため本ケースでは修正していない。

## 影響

- 6 SPEC ファイルの参照先が現行見出しに解決せず、AG SPEC 導線が不整合のまま

## 課題

6ファイルの参照を「ワークフロー利用」へ更新する docs 是正 Issue を起票する。PR #2197 ではワークフロー定義側（src/opencode 10ファイル）を現行見出しに基づき更新済みのため、docs 側 SPEC の追従のみで完了する。

## 既存要件・成果物との関連

- 対象: docs/specs/commands/ 配下5ファイル、docs/specs/skills/agentdev-adversarial-review.md
- 発生元: stage 0 spec-save commit e73ba8e5 の後追い課題（委譲コンテキスト指定の回収対象）
- 出典: Issue #2192 (CLOSED), Epic #2189、PR #2197 (merged 1f415d05)

## 出典

- 発生日: 2026-08-17
- 発生源: PR #2197 case-run 検証（Findings / Capture候補、stage 0 AG SPEC 更新の既知の後追い課題）
- 元 item: intake-2026-08-17-epic2189-ag-spec-old-heading-refs.md
