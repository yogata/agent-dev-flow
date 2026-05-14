---
name: archive-completed-plan
description: Cleans up workspace by moving completed plan files to archive. USE FOR: archiving completed plans and cleaning up workspace. DO NOT USE FOR: creating new plans, starting work on plans, or general file management unrelated to plan archival.
---

# Archive Completed Plan

## Overview
Moves all files related to a specific plan (plans, drafts, evidence, execution, notepads, tasks, reports) from the active `.sisyphus` directories to `.sisyphus/archives/<plan_name>`.

## When to Use
- After finishing a task or plan.
- When `boulder.json` or development flow indicates the plan is done.
- To organize the `.sisyphus` workspace.

## Usage

Run the helper script with the plan name.

```bash
python ".opencode/skills/archive-completed-plan/archive_plan.py" <plan_name>
```

## Behavior
Scans the following directories for files matching `<plan_name>`, `<plan_name>.*`, or `<plan_name>-*`:
- `.sisyphus/plans`
- `.sisyphus/drafts`
- `.sisyphus/evidence`
- `.sisyphus/execution`
- `.sisyphus/notepads` (special handling: moves contents of `.sisyphus/notepads/<plan_name>/` directly)
- `.sisyphus/tasks`
- `.sisyphus/reports`

Moves found files to `.sisyphus/archives/<plan_name>/<category>/`.

### Special Note on notepads
For the `notepads` category, the script moves the **contents** of `.sisyphus/notepads/<plan_name>/` directly to `.sisyphus/archives/<plan_name>/notepads/` (without creating an extra subdirectory).

## 終了コード

| コード | 意味 | 備考 |
|--------|------|------|
| 0 | 成功 | 全ファイル正常移動 |
| 0 | 移動対象0件 | 警告付きで正常終了 |
| 1 | 部分失敗 | 一部ファイル移動失敗 |
| 2 | 全体失敗 | 移動処理全体が失敗 |
