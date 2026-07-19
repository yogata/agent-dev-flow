# Intake Item: check_integrity.ts IR-055 heuristic の行内複数パターン集計仕様の精査

## 発生源

- 発見日時: 2026-07-19
- 発見 PR: https://github.com/yogata/agent-dev-flow/pull/1570
- 発見 Issue: https://github.com/yogata/agent-dev-flow/issues/1564
- 発見セクション: PR 本文 `## Findings / Capture候補` intake 候補
- 検査ルート: case-run（TS-001/TS-002 検証時の baseline リスト 1:1 照合作業）
- 原因分類: 既存実装の仕様揺れ疑い（check_integrity.ts IR-055 heuristic）

## 問題

`check_integrity.ts` の IR-055 heuristic は行内の複数パターン（`docs/specs/`, `docs/guides/`, `docs/adr/` 等）を検出する際、行単位の集計件数が揺れている疑いがある。SPEC `docs/specs/foundations/harness-separation-model.md` baseline リスト11件と `check_integrity.ts --json` warning level 出力は整合しているが、行レベルで見ると下記の不一致が観察される。

具体事例（Issue #1564 TS-002 検証時）:

- `src/opencode/commands/agentdev/req-save.md` L262 は実際のコンテンツで `docs/guides/` と `docs/specs/` 両方を含むが、SPEC baseline（`check_integrity.ts` warning 出力に基づく）は `docs/guides/` のみ1件としている。
- 一方 `src/opencode/commands/agentdev/req-save.md` L272 は両パターン（`docs/specs/`, `docs/guides/`）を2件として扱っている。

本事象は baseline の抽出元（`check_integrity.ts`）に起因し、SPEC 記載内容は抽出元と整合しているため、SPEC 側の不備ではない。`check_integrity.ts` 側の IR-055 heuristic の集計仕様の精査が望まれる。

## 推奨修正対象

`check_integrity.ts` の IR-055 heuristic 実装（`src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` または関連モジュール）。下記点を精査する。

1. 行内の複数パターンマッチをどう集計するか（最初の1件のみ、全件、パターン種別単位等）の仕様明文化。
2. 既存 baseline（harness-separation-model.md 11件）との整合性を保ったまま、行レベルの集計規則を統一。
3. SPEC 側の baseline リスト記載形式（`ファイルパス:行番号:違反内容:検出ルール`）が、行内複数パターンを表現できる形式か確認。必要なら SPEC 側の表現拡張（例: 同一行の複数パターンを別エントリとして列挙）を検討。

注意: SPEC `harness-separation-model.md` の baseline リスト自体は抽出元（`check_integrity.ts`）と整合しており、SPEC 側の改訂を要しない可能性が高い。heuristic 側の精査結果次第。

昇格先候補: intake-promote で採否判断。採用時は `check_integrity.ts` 改修 RU として backlog 化。

## 関連

- 発見元 PR: PR #1570 (https://github.com/yogata/agent-dev-flow/pull/1570)
- 発見元 Issue: Issue #1564 (https://github.com/yogata/agent-dev-flow/issues/1564)
- 関連 SPEC: `docs/specs/foundations/harness-separation-model.md` baseline 既知違反サブセクション（件数定義 + baseline リスト11件）
- 関連 TS: TS-001, TS-002（Issue #1564 テスト戦略）
- 関連検査ルール: IR-055 (runtime-unresolved-reference, heuristic)
- 関連ファイル:
  - `src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（推定実装箇所）
  - `src/opencode/commands/agentdev/req-save.md` L262, L272（観察事例の対象行）
- 関連 REQ/ADR:
  - REQ-0108-263/264（IR-055 段階導入）
  - Epic #1515（配布物浄化バッチ、本 intake 由来は配布物浄化の対象外: 検査スクリプト本体の改修）
- トレーサビリティ: PR #1570 Findings / Capture候補 intake セクション
