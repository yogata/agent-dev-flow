# Intake Item: diagnostics 高位問い合わせプロファイル未実装 — Trace Query 層の実装割当て明確化

## 発生源

- PR: #2198 (Issue #2190 / OU-0001, Epic #2189 Wave 1)
- 発生 phase: case-run 検証（Findings / Capture候補）
- capture 分類: intake（配布物是正候補）

## 問題

AG SPEC「高位問い合わせプロファイル」は related / impact / dependency / implementation / diagnostics の5プロファイルを定義するが、diagnostics（孤立候補・未解決関係・廃止成果物への関係・関係制約違反・循環・複数経路・関係集中・根拠欠落）は Issue #2190 の test strategy（TS-001〜005）対象外であり未実装のまま。diagnostics 実装（lib/trace_diagnostics.ts）は PR #2195（Issue #2191）に存在するが、Level 1 rebase コンフリクトにより未マージ。

## 推奨対応

PR #2195（Issue #2191）のコンフリクト解消（case-auto Level 2/3）後に diagnostics を含む5プロファイル全体の実装・検証を完了する。REQ-021-003（inspect-docs/inspect-skills の diagnostics 利用）、REQ-021-004（adversarial-review の diagnostics 利用）の実効性は diagnostics 実装マージ後に確認する。

## 関連

- Issue: #2190 (CLOSED), #2191 (OPEN、コンフリクト解消待ち), Epic: #2189
- PR: #2198 (merged f4ac8d70), #2195 (OPEN/CONFLICTING)
- SPEC: docs/specs/skills/agentdev-artifact-graph.md「高位問い合わせプロファイル」
