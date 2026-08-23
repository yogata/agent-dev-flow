---
title: "IR-068: skill-projection-manifest"
status: accepted
created: 2026-08-22
updated: 2026-08-23
---

# IR-068: skill-projection-manifest

| Field | Value |
|-------|-------|
| rule_id | IR-068 |
| description | src 側スキル集合（配布原本・SSoT）と `.opencode/skills` 投影スキル集合の突合を検査データ化する。検査データ `data/skill-projection-manifest.yaml`（src/opencode/skills 列挙の検出ビュー）との不一致はデータ鮮度違反として、投影（junction）との不一致は投影乖離（投影欠落・stale junction）として検出する（Issue #2383 (d)、inspect F-01、REQ-010-070 由来の整備候補） |
| severity | strict（manifest ↔ src、投影突合ともに strict。manifest スキーマ警告は heuristic） |
| category | document-drift（投影乖離の stale junction 側は obsolete-structure） |
| detection_method | `check_integrity.ts`（`checkSkillProjectionManifest`）による3方向集合比較。(1) manifest ↔ src/opencode/skills ディレクトリ列挙（データ鮮度）、(2) src ↔ .opencode/skills 投影（junction 環境のみ）。投影比較は `.opencode/skills` に非 repo-* エントリが存在する場合のみ実施し、不在環境（git worktree、junction 未伝播、REQ-018）では info で skip する（worktree 誤検出防止、`isInsideWorktree` と同一の構造的制約に対する junction 実在検出による fallback）。投影エントリは解決可能（実体ディレクトリとして解決できる junction を含む）と解決不能（リンク先欠損の stale junction、ディレクトリ以外の混入物）に分類し、解決不能エントリは projection-broken として検出する（F-01 の stale junction 3 件はリンク先欠損のため listDirs 経由の集合比較には現れず、エントリ単位の解決判定で検出する） |
| affected_artifacts | [src/opencode/skills/*, .opencode/skills/*, .opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml] |
| related_req | [REQ-010-068, REQ-018-002] |
| related_design | [../../local/runtime-package-boundary.md, ../checker-execution-contracts.md, ../integrity-rule-catalog.md] |
| gate_level | full-audit（source profile でも投影比較は junction 実在時のみ実施。installed profile では常時） |
| false_positive_risk | 低。repo-* プレフィックスの投影専用スキル（repo-local、v2:ADR-0020 / v2:REQ-0159-002）は投影比較から除外する。worktree（junction 不在）では投影比較自体を skip するため誤検出しない。解決不能エントリ（projection-broken）はディレクトリ以外の混入物も含むが、投影スキルはディレクトリであることが契約であるため誤検出とならない。manifest の重複・不正形式エントリは silent skip せず heuristic 警告する（宣言的データの silent skip 禁止、checker-execution-contracts Design） |
| regression_test | `check_integrity.test.ts` describe "IR-068 skill-projection-manifest (Issue #2383 (d), inspect F-01)"。正常例（manifest ↔ src 一致）・違反例（manifest 陳腐化・投影欠落・stale junction）・境界例（worktree = junction 不在で skip）・許容例（repo-* 投影専用スキル）・再現例（F-01: workflow-design-save 投影欠落 + `agentdev-artifact-graph` stale junction + リンク先欠損 `agentdev-spec-file-manager` の解決不能エントリ）の 5 種 fixture |
| finding_route | intake |
| triage_action | manifest 陳腐化はスキル追加・削除・リネームと同一 PR での manifest 更新で解消する。投影乖離（projection-missing / projection-extra / projection-broken）は junction 再構築（`scripts/install.ps1 -Mode apply` 再実行、局所運用タスク）で解消する。F-01 の既知乖離 7 件（投影欠落 4 + stale junction 3）は NG baseline（provenance `issue-2383-f01-junction-rebuild-pending`）で管理し、PR マージ後の junction 再構築で解消する |
| last_verified | 2026-08-22 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | manifest のスキル集合が src/opencode/skills のディレクトリ列挙と一致すること（manifest-only / src-only を検出） | strict fail |
| 2 | junction 環境において、src の全スキルが .opencode/skills 投影に存在すること（projection-missing を検出） | strict fail |
| 3 | junction 環境において、投影に src 側に存在しない非 repo-* スキル（解決可能な stale junction）が残存しないこと（projection-extra を検出） | strict fail |
| 4 | junction 環境において、ディレクトリとして解決できない投影エントリ（リンク先欠損の stale junction、混入物）が残存しないこと（projection-broken を検出） | strict fail |
| 5 | junction 不在環境（worktree）では投影比較を skip し、manifest ↔ src 比較のみ実施すること | 設計要件 |
| 6 | manifest エントリの重複・不正形式を silent skip せず警告すること | heuristic fail |

## IR-016（source-projection-integrity）との関係

IR-016 系の投影検査（`checkSourceProjectionConsistency`、`checkBrokenJunctions`）は実行 profile 分離（Issue #1928 §7.3）により source profile（docs-check 既定）では実施されない。本ルールは検査データ（manifest）を仲介することで、(1) source profile でも manifest ↔ src 比較により検査データの鮮度を常時担保し、(2) 投影比較は junction 実在検出により worktree で誤検出することなく実施する。inspect F-01（skill registry 未登録の実害）の再発防止を、局所運用タスク（junction 再構築）と分離した形で恒常化する。

## exemption（許容条件）

| 対象 | 理由 |
|------|------|
| `repo-*` プレフィックスの投影専用スキル | repo-local 成果物（v2:ADR-0020 / v2:REQ-0159-002）。src 側への昇格検査は IR-058 が所有する |
| junction 不在環境（worktree 等）の投影比較 | REQ-018 構造的制約（junction は worktree へ伝播しない）。info で skip |

## baseline 運用

導入時点（Issue #2383、2026-08-22）の既知違反は F-01 の投影乖離 7 件（投影欠落 projection-missing: `agentdev-workflow-backlog-auto`、`agentdev-workflow-design-save`、`agentdev-design-file-manager`、`agentdev-traceability` の 4 件。リンク先欠損 stale junction projection-broken: `agentdev-artifact-graph`、`agentdev-spec-file-manager`、`agentdev-workflow-spec-save` の 3 件）。junction 再構築は `.opencode/skills/*` が .gitignore 対象の局所運用タスクであり PR 成果外（RD-002）のため、NG baseline additions（provenance `issue-2383-f01-junction-rebuild-pending`）で管理し、PR マージ後の手動再構築で解消する。baseline 適用後、新規の投影乖離（スキル追加時の junction 追加漏れ等）は即時に strict fail として検出する。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- [../../local/runtime-package-boundary.md](../../local/runtime-package-boundary.md)（link mode・junction 契約の正規所有者）
- [checker-execution-contracts.md](../checker-execution-contracts.md)（宣言的データ YAML の schema 原則）
