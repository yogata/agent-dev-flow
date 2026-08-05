# WP-0 事前状態確認（§4.4 B6）

- 取得日時: 2026-08-06（worktree feature/issue-1925, baseline origin/main = 8f6558de）
- 作成ルート: case-auto Wave 1（OU-001/WP-0, Issue #1925）インライン case-run 実行担当サブエージェント
- ADR-001 リリース条件（ドメイン状態取得）に従い、作業開始前に active な成果物を取得し継続/隔離/完了を判定した。

## 判定結果サマリー

| 区分 | 件数 |
|---|---:|
| continue | 18 |
| isolate | 0 |
| complete | 0 |
| **未決着** | **0** |

停止条件（§4.4）: `isolate` / `complete` が必要な件でユーザー合意が得られない場合は作業着手を見送る。本件は `continue` のみで構成されるため、WP-0 残作業へ進む。

## 1. active な draft

取得: `Get-ChildItem .agentdev\drafts\req-draft-*.md, spec-draft-*.md, requirements-review-finding-*.md`

結果: **0件**（空）

判定: 該当なし。前工程 case-open（commit 8f6558de）で当該移行の draft（req-draft-agentdev-migration-2026-08.md）を削除済み。CR-003 により req-save をスキップしたため新規 draft は生成されていない。

## 2. active な RU（Requirements Unit）

取得: `Get-ChildItem .agentdev\backlog\req-units\RU-*.md`

結果: **0件**（`.gitkeep` のみ）

判定: 該当なし。CR-003（req-save スキップ）により RU は存在しない。

## 3. active な Issue

取得: `gh issue list --state open --json number,title,labels`

結果: **8件**（全て本移行の Issue）

| # | title | 判定 | 根拠 |
|---|---|---|---|
| 1924 | [Epic] AgentDevFlow 2026-08 移行 | continue | 本移行の親 Epic。そのまま残す |
| 1925 | [WP-0] 現状固定と事前状態確認 | continue | 本 Issue。実行中 |
| 1926 | [WP-1] 基準文書・frontmatter・旧検査契約の正常化 | continue | 後続 WP。本 WP と競合しない |
| 1927 | [WP-2] 配布物の内部参照除去と自己完結化 | continue | 後続 WP |
| 1928 | [WP-3] Integrity Checker 実行プロファイル分離 | continue | 後続 WP |
| 1929 | [WP-4] command の薄型化 | continue | 後続 WP |
| 1930 | [WP-5] SKILL.md の段階的開示化 | continue | 後続 WP |
| 1931 | [WP-6] 索引再生成・統合検証・Release Report | continue | 後続 WP |

判定: 全件 `continue`。本移行は Wave 1 = #1925 の単独実行であり、他 WP（#1926-1931）は直列後続のため本 WP と競合しない。Epic #1924 も親として残す。

## 4. active な PR

取得: `gh pr list --state open --json number,title,headRefName`

結果: **0件**（空）

判定: 該当なし。オープン PR はない。

## 5. inspect inbox

取得: `Get-ChildItem .agentdev\inspect\inbox\*.md`

結果: **2件**（既存の無関係 finding）

| file | 判定 | 根拠 |
|---|---|---|
| inspect-deferred-20260715-081722.md | continue | 2026-07 以前の inspect deferred。本移行（2026-08）と無関係。そのまま残す |
| inspect-docs-finding-20260625-202639.md | continue | 2026-06 の inspect docs finding。本移行と無関係。そのまま残す |

判定: 全件 `continue`。本移行で触れない。

## 6. その他のドメイン状態（参考記録）

### intake inbox（10件）

`.agentdev/intake/inbox/` に 2026-07〜08 の intake 項目が10件存在する（install-scripts, req-health-metrics, search-target-area, skills-english, spec-save-vs-artifact 等）。これらは本移行のスコープ外（別課題の intake）であり、本 WP で触れない。全件 `continue`。

### learning（3件）

`.agentdev/learning/` に `deferred.md`, `evaluation-report.md`, `inbox.md` が存在する。本移行と無関係の学習記録。`continue`。

### extensions（commands 18 + skills 14）

`.agentdev/extensions/` 配下の project extensions は本 WP では参照しない。WP-5（段階的開示化）で `agentdev-project-extensions` 経由で参照する。`continue`。

## 停止判定結論

`isolate` / `complete` が必要な件は 0件。未決着 0件。全て `continue` で構成されるため、WP-0 の残作業（§4.1 各項目の証拠保存、commit、PR 作成）へ進む。

## TS-001 検証（本 WP 内 test-fix ループ）

- **verification**: 本 preflight.md が存在し、active な draft/RU/Issue/PR/inbox の continue/isolate/complete が全件（18件）記録済。baseline 配下のハッシュは `.omo/plans/agentdev-migration-2026-08-05.baselines-before.md` に記録済。
- **pass_criteria**: 未決着 0件（達成）。baseline 配下は `git status` で clean（後述 commit 前確認で検証）。変更前検査結果・行数・baseline 状態は各 evidence ファイルで再確認可能。
- **on_failure**: 該当なし（不合格項目なし）。

### baseline clean 確認

`.opencode/skills/repo-agentdev-integrity/baselines/` 配下は本 WP で一切編集していない。commit 直前に `git status` および `git diff -- .opencode/skills/repo-agentdev-integrity/baselines/` で clean であることを確認する。
