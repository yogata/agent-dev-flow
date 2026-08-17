# ir035-skill-see-also-reference の worktree（junction 未伝播）環境での誤検出と src/ fallback 欠落

## 観測内容

ir035-skill-see-also-reference は `.opencode/skills/` のディレクトリ実在のみを検証する実装のため、worktree（junction 未伝播、`.opencode/skills/agentdev-*` が 0 ディレクトリ）環境で実在スキルへの正常な参照4件（agentdev-req-file-manager / agentdev-decision-file-manager / agentdev-gh-cli / agentdev-workflow-templates）を誤検出する。`src/opencode/skills/` への fallback 実装がない（OU-004 と同種の環境依存）。

## 影響

- worktree 実行時に正常参照が誤検出され、checker 結果の信頼性が下がる

## 課題

`src/opencode/skills/` への fallback 実装を追加する（OU-004 の check_extensions fallback と同種の環境依存解消）。Level 2 検証では worktree 内に skills junction を作成して回避した（commit・push 対象外の環境設定のみ）。

## 既存要件・成果物との関連

- 対象: ir035（skill-see-also-reference）
- 類型: OU-004 の check_extensions fallback と同種の環境依存解消
- audit: docs/specs/integrity/audits/ng21-provenance-classification-20260816.md 残存課題「ir035 の worktree 誤検出」

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2151 (Issue #2136 / OU-002, Epic #2134 Wave 2) Findings / Capture候補 セクション intake 1、Level 2 rebase note「検証環境に関する注記」
- 元 item: intake-2026-08-16-ou002-ir035-worktree-junction-fallback.md
