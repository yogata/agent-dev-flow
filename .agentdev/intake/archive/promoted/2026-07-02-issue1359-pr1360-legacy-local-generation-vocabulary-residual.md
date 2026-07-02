# legacy local generation vocabulary が20件残存（IR-057 検出、OU-002 core 滞留語彙除去の残滓）

## 観察

case-close Issue #1359 / PR #1360 (case-auto Draft 2 OU-003 FINAL) の TS-001 Verify-2 実施中に観察。IR-057 を `bun run check_integrity.ts --json` で実行したところ、`Legacy local generation vocabulary` 検出が20件残存した。旧SPEC直下パス検出（IR-057 main）とは別の検出カテゴリで、summary は ok=286, ng=105, warning=20, info=536（編集前後で不変）。

対象ファイルと件数:
- `docs/adr/ADR-0126.md` (1件)
- `docs/adr/ADR-0131.md` (5件: 歴史経緯記載の可能性あり、context による要確認)
- `docs/guides/glossary.md` (1件)
- `docs/specs/local/runtime-package-boundary.md` (1件)
- `docs/specs/skills/agentdev-gh-cli.md` (1件)
- `src/opencode/commands/agentdev/case-open.md` (2件)
- `src/opencode/skills/agentdev-gh-cli/references/retry.md` (4件)
- `src/opencode/skills/agentdev-gh-cli/SKILL.md` (1件)
- `src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md` (2件)
- `src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md` (1件)

link mode 廃止語彙（`上書き保護`、`直接生成方式`、`生成フロー`、`再生成`、`transform/generate.md` 等）。

## 影響

- IR-057 summary の ng 件数を下げられない（105 件の一部）
- 廃止された link mode 由来の語彙が現行ドキュメントに残り、読者の誤解を招く可能性
- 一部は ADR の歴史経緯説明（`isIr057HistoricalAdrContext` で免除されるべき）の可能性があり、ルール側の履歴マーカー判定精緻化も並行課題

## 修正されなかった理由

Issue #1359 の完了条件は REQ-0156-010/011/012 施行（旧直下パス検証、IR-057 旧直下パス検出 failures 0件、運用手順参照可能性）。legacy local generation vocabulary 残存は別カテゴリであり OU-002 (PR #1358) で core 滞留語彙を除去済みだが残滓が残った。本 PR の対象外のため別途 intake で段階解消する。

## 課題

- 20件の語彙残存を ADR 歴史経緯（免除対象）と現行ドキュメント（修正対象）に分類する
- ADR-0131 の5件は文脈精査が必要（link mode 廃止の経緯説明としての歴史参照か、誤用か）
- `isIr057HistoricalAdrContext` 判定を精緻化し、歴史経緯コンテキストを自動免除するか、語彙そのものを別表現に置換するかの方針決定が必要

## 想定対応 Issue

- 保守系（maintenance）— ドキュメント語彙の整理。優先度は高くない（実動作への影響軽微）
- 並行課題: integrity rule 側の履歴マーカー判定精緻化（`isIr057HistoricalAdrContext` の拡張）は別途 learning/intake で評価

## 根拠

PR #1360 本文「## Findings / Capture候補 > ### Finding-1」より:

> IR-057 で20件の `Legacy local generation vocabulary` 検出あり（旧直下パスとは別カテゴリ）。OU-002（PR #1358）で core 滞留語彙除去を実施したが、以下のファイルに `上書き保護`、`直接生成方式`、`生成フロー`、`再生成`、`transform/generate.md` 等の link mode 廃止語彙が残存...本 Issue の対象外（Issue #1359 は旧直下パス検証が主眼）。別途 intake 処理で段階解消を推奨。ただし一部は ADR の歴史経緯説明コンテキスト（`isIr057HistoricalAdrContext` で免除されるべき）の可能性があり、ルール側の履歴マーカー判定の精緻化も検討課題。

## 観測元

- PR #1360 (Issue #1359 / REQ-0156 APPEND / case-auto Draft 2 OU-003 FINAL)
- case-close Step 10 capture 回収
- 観測日時: 2026-07-02 (case-close 実行中)
