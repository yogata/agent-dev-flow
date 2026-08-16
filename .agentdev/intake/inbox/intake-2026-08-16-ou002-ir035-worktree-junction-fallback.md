# Intake Item: ir035-skill-see-also-reference の worktree（junction 未伝播）環境での誤検出と src/ fallback 欠落

## 発生源

- PR: #2151 (Issue #2136 / OU-002, Epic #2134 Wave 2)
- 発生 phase: case-run 検証（check_integrity worktree 実行）
- capture 分類: intake（環境依存解消候補）

## 問題

ir035-skill-see-also-reference は `.opencode/skills/` のディレクトリ実在のみを検証する実装のため、worktree（junction 未伝播、`.opencode/skills/agentdev-*` が 0 ディレクトリ）環境で実在スキルへの正常な参照4件（agentdev-req-file-manager / agentdev-decision-file-manager / agentdev-gh-cli / agentdev-workflow-templates）を誤検出する。`src/opencode/skills/` への fallback 実装がない（OU-004 と同種の環境依存）。

## 推奨対応

`src/opencode/skills/` への fallback 実装を追加する（OU-004 の check_extensions fallback と同種の環境依存解消）。Level 2 検証では worktree 内に skills junction を作成して回避した（commit・push 対象外の環境設定のみ）。

## 関連

- Issue: #2136 (CLOSED), Epic: #2134
- PR: #2151 (Findings / Capture候補 セクション intake 1、Level 2 rebase note「検証環境に関する注記」)
- audit: docs/specs/integrity/audits/ng21-provenance-classification-20260816.md 残存課題「ir035 の worktree 誤検出」
