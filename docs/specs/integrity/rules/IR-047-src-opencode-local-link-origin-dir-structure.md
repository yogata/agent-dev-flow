---
status: accepted
---

# IR-047: src/opencode-local/ link 先原本領域ディレクトリ構成

| Field | Value |
|-------|-------|
| rule_id | IR-047 |
| description | `src/opencode-local/` はローカル版 link 先原本領域であり、許容されたディレクトリ構成（`README.md`, `agentdev-gh-cli/`）のみを保持すること（REQ-0141-004, ADR-0131 decision #3）。`agentdev-gh-cli/` 配下に `SKILL.md`, `references/`, `case-schema/` を保持する（`case-schema/` は `agentdev-gh-cli/` 配下のディレクトリとして扱う）。禁止パス（`requirements/`, `specs/`, `_conv/`, `commands/`, `skills/`, `transform/`, `generation-flow.md`）を作成しないこと（REQ-0141-005, ADR-0131 decision #4） |
| severity | strict |
| category | obsolete-structure |
| detection_method | `src/opencode-local/` 配下のディレクトリ、ファイル一覧を取得し、許容リスト（`README.md`, `agentdev-gh-cli/`）外のトップレベルパスを検出。`agentdev-gh-cli/case-schema/` は `agentdev-gh-cli/` 配下の許容ディレクトリとして扱う |
| affected_artifacts | [src/opencode-local/] |
| related_req | [REQ-0141-003, REQ-0141-004, REQ-0141-005, REQ-0134] |
| related_spec | [local-generation.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | なし。パスの直接比較による機械的検出 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 許容リスト外のディレクトリ、ファイルを削除し、`src/opencode-local/` を link mode の原本構成（`README.md`, `agentdev-gh-cli/`）へ復元。導入先リポジトリは unlink / relink により link を張り直す（ADR-0131 decision #1） |
| last_verified | 2026-06-24 |
