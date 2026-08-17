# Intake Item: コマンド/スキル SPEC 6ファイルが AG SPEC の旧見出し「利用上の防護」を参照 — 「ワークフロー利用」への追従更新

## 発生源

- PR: #2197 (Issue #2192 / OU-0003, Epic #2189 Wave 1)
- 発生 phase: case-run 検証（Findings / Capture候補、stage 0 AG SPEC 更新の既知の後追い課題）
- capture 分類: intake（docs 是正候補）

## 問題

docs/specs/commands/req-define.md、spec-save.md、case-open.md、case-close.md、backlog-review.md と docs/specs/skills/agentdev-adversarial-review.md の計6ファイルが AG SPEC の旧見出し「利用上の防護」を参照している。現行見出しは「ワークフロー利用」（stage 0 spec-save commit e73ba8e5 で更新済み）。参照切れ（旧見出し参照）のままになっている。本 Epic スコープ外のため本ケースでは修正しない。

## 推奨対応

6ファイルの参照を「ワークフロー利用」へ更新する docs 是正 Issue を起票する。PR #2197 ではワークフロー定義側（src/opencode 10ファイル）を現行見出しに基づき更新済みのため、docs 側 SPEC の追従のみで完了する。

## 関連

- Issue: #2192 (CLOSED), Epic: #2189
- PR: #2197 (merged 1f415d05)
- 発生元: stage 0 spec-save commit e73ba8e5 の後追い課題（委譲コンテキスト指定の回収対象）
