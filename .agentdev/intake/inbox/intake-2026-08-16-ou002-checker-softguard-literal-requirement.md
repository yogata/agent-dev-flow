# Intake Item: check_workflow_preventive item 3 のリテラル「soft guard」要求と AG-004 簡潔トリガー項 SPEC の不整合

## 発生源

- PR: #2185 (Issue #2180 / OU-002, Epic #2178 Wave 2)
- 発生 phase: case-run 実装
- capture 分類: intake（具体的修正対象、判断候補）

## 問題

check_workflow_preventive.ts item 3（workflow-soft-guard）は command-bound Workflow Skill の SKILL.md 全文にリテラル「soft guard」を要求する。一方で agentdev-skill-authoring SPEC 層1（RU-0018、AG-004）は description からマーカー語を除去し簡潔トリガー項（単独起動 + /agentdev/* コマンド経由）を正としており、PR #2185 の実装後は SKILL.md 内のマーカー語出現が 0 になり、checker は SPEC と矛盾する検証不通過となる（マージ後 main で再現確認済み: item 3 のみ fail、他 6 item は pass。QG-4 では warn 記録としマージ阻止なし）。

## 推奨対応

checker 側を簡潔トリガー項（単独起動）の肯定検証へ更新するか、SKILL.md 本文への宣言節配置を決定する。checker 修正は別 Issue 化される性質（元 Issue #2180 の MUST NOT DO によりスコープ外とされた）。

## 関連

- Issue: #2180 (CLOSED), Epic: #2178
- PR: #2185 (Findings / Capture候補 セクション intake 1)