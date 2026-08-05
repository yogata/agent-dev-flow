# 変更前 line counts（WP-0 §4.1-3）

- 取得日時: 2026-08-06（worktree feature/issue-1925, baseline origin/main = 8f6558de）
- 取得方法: PowerShell `Get-Content | Measure-Object -Line`
- 用途: WP-4（command 薄型化 ≤150行）、WP-5（SKILL.md ≤200行）の変更前証拠。WP-6 で再計測し差分比較する。

## command 行数（src/opencode/commands/agentdev/*.md）

17 ファイル、合計 2319 行。

| file | lines |
|---|---:|
| backlog-review.md | 117 |
| case-auto.md | 267 |
| case-close.md | 220 |
| case-open.md | 216 |
| case-run.md | 187 |
| case-update.md | 57 |
| inspect-docs.md | 88 |
| inspect-promote.md | 73 |
| inspect-skills.md | 72 |
| intake-capture.md | 87 |
| intake-from-github.md | 83 |
| intake-promote.md | 107 |
| learning-promote.md | 113 |
| README.md | 41 |
| req-define.md | 162 |
| req-save.md | 229 |
| spec-save.md | 200 |

### WP-4 target（公開 command ≤150行）超過一覧

WP-4 は「全公開command ≤150行」を目標とする。2026-08-05 時点で 150行超は以下の 8 ファイル。

| file | lines | 超過 |
|---|---:|---:|
| case-auto.md | 267 | +117 |
| req-save.md | 229 | +79 |
| case-close.md | 220 | +70 |
| case-open.md | 216 | +66 |
| spec-save.md | 200 | +50 |
| req-define.md | 162 | +12 |
| case-run.md | 187 | +37 |
| backlog-review.md | 117 | （対象外、≤150） |

※ case-update.md, inspect-* , intake-*, learning-promote.md, README.md は ≤150 行のため WP-4 対象外。

## SKILL.md 行数（src/opencode/skills/agentdev-*/SKILL.md）

32 ファイル、合計 3306 行。

| skill | lines |
|---|---:|
| agentdev-adr-file-manager | 268 |
| agentdev-adr-guidelines | 105 |
| agentdev-architecture-advisory | 70 |
| agentdev-artifact-validation | 76 |
| agentdev-backlog-integration | 41 |
| agentdev-case-run-execution-adapter | 149 |
| agentdev-command-authoring | 101 |
| agentdev-command-creator | 27 |
| agentdev-conventional-commits | 47 |
| agentdev-deep-review | 43 |
| agentdev-doc-diagnostics | 71 |
| agentdev-doc-map | 73 |
| agentdev-doc-writing | 93 |
| agentdev-epic-tracker | 185 |
| agentdev-gh-cli | 68 |
| agentdev-git-worktree | 39 |
| agentdev-inspect-skills | 124 |
| agentdev-intake-pipeline | 33 |
| agentdev-issue-management | 47 |
| agentdev-learning-capture | 139 |
| agentdev-learning-pipeline | 286 |
| agentdev-project-extensions | 138 |
| agentdev-quality-gates | 67 |
| agentdev-req-analysis | 295 |
| agentdev-req-file-manager | 114 |
| agentdev-req-structure-diagnostics | 45 |
| agentdev-skill-authoring | 193 |
| agentdev-spec-file-manager | 102 |
| agentdev-workflow-lifecycle | 79 |
| agentdev-workflow-orchestration | 50 |
| agentdev-workflow-routing | 31 |
| agentdev-workflow-templates | 107 |

### WP-5 target（優先7 SKILL.md ≤200行）超過一覧

WP-5 は優先7 SKILL.md（req-analysis, learning-pipeline, adr-file-manager, skill-authoring, epic-tracker, case-run-execution-adapter, learning-capture）を ≤200行 に縮約する。

| skill | lines | 200行超 |
|---|---:|:---:|
| agentdev-req-analysis | 295 | +95 |
| agentdev-learning-pipeline | 286 | +86 |
| agentdev-adr-file-manager | 268 | +68 |
| agentdev-skill-authoring | 193 | （≤200、+0、境界） |
| agentdev-epic-tracker | 185 | （≤200） |
| agentdev-case-run-execution-adapter | 149 | （≤200） |
| agentdev-learning-capture | 139 | （≤200） |

優先7のうち 200行超は 3件（req-analysis, learning-pipeline, adr-file-manager）。

### 備考

- 行数計測は worktree 内の `src/opencode/`（原本）から実施。`.opencode/skills/agentdev-*` は worktree で junction が未再作成のため直接計上不可。
- WP-4/WP-5 で縮約後、本表と WP-6 で再計測した結果を比較する。
