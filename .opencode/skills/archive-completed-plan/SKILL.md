---
name: archive-completed-plan
description: Use when a development plan is completed and you want to clean up the workspace by moving related files to the archive.
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
