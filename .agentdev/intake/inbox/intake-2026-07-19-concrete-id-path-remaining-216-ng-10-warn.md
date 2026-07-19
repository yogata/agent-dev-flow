# Intake Item: 配布物 concrete ID・docs/src 内部パス参照 段階的除去（残り NG 216件・WARNING 10件）

## 発生源

- 由来 PR: https://github.com/yogata/agent-dev-flow/pull/1579
- 由来 Issue: https://github.com/yogata/agent-dev-flow/issues/1577（CLOSED, 部分完了）
- 後続 Issue: https://github.com/yogata/agent-dev-flow/issues/1580
- 検査ルート: case-close（PR #1579 `## Findings・Capture候補` セクションから回収）
- 原因分類: 確認済（REQ-0162-010 段階的除去計画の最初の分割 case 完了、残り継続）

## 問題

`check_integrity.ts` の RuntimeReference 検査（IR-055）が、配布 Command/Skill 本文に残存する concrete ID 参照・docs/src 内部パス参照を検出している。起票時点 NG 218件・WARNING 10件のうち、PR #1579 で req-save.md, spec-save.md の2ファイル分を処理済み。残り NG 216件・WARNING 10件を後続 case で段階的処理する必要がある。

検出残:

| 検査 | 残件数 | 主な内容 |
|------|--------|----------|
| check_integrity.ts RuntimeReference NG (IR-055 delta) | 216件 | req-save.md/spec-save.md 以外の concrete ID・具体パス参照 |
| check_integrity.ts RuntimeReference Warning | 10件 | heuristic 違反（docs/specs/, docs/guides/ 参照） |
| check_distribution_boundary.ts EXIT | 1（EXIT=1） | 上記同一問題を厳格に全件報告 |

## 推奨修正対象

REQ-0162-010（段階的除去計画）に基づき、command 群・skill 群ごとの分割 case で順次処理する。

1. **OU-002**: NG 216件・WARNING 10件を command 群・skill 群ごとに分類し、分割 case 構成を策定。IR-055 カタログ該当項目をリスト化
2. **OU-003**: command 群（`src/opencode/commands/agentdev/*.md`、req-save.md/spec-save.md 以外）の分割 case を順次実施。concrete ID・内部パス参照を文脈保持型置換（例: 「REQ-0119 で要件化」→「責務分界 REQ で要件化」等の識別子非依存表現）へ差し替え
3. **OU-004**: skill 群（`src/opencode/skills/agentdev-*/SKILL.md` + `references/*.md`）ごとの分割 case を順次実施
4. **OU-005**: `check_integrity.ts` と `check_distribution_boundary.ts` で NG/WARNING 減少を確認。docs-check 全体の EXIT=0 を達成

PR #1579 で処理済みのファイル（重複回避）:
- `src/opencode/commands/agentdev/req-save.md`（2箇所）
- `src/opencode/commands/agentdev/spec-save.md`（4箇所）

## 関連

- 由来 PR: https://github.com/yogata/agent-dev-flow/pull/1579
- 由来 Issue: https://github.com/yogata/agent-dev-flow/issues/1577
- 後続 Issue: https://github.com/yogata/agent-dev-flow/issues/1580
- 対象 REQ: REQ-0162（REQ-0162-010 段階的除去計画、REQ-0162-007 識別子不含、REQ-0162-008 内部パス参照不含、REQ-0142 文意保持・構文健全性・責務整合）
- 関連 ADR: ADR-0136（配布物の harness 実行制御分離）
- 関連 RU: RU-0007（前身 #1577 由来）、RU-0011（harness-separation baseline list, TS-004 連動）
- 既存 intake item（重複参照）: `intake-2026-07-18-distribution-reference-boundary-violations.md`（元 218件・WARNING 10件の全体像）
