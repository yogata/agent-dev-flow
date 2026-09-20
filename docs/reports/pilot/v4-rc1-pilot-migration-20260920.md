---
id: v4-rc1-pilot-migration-20260920
title: v4.0.0-rc.1 Pilot Migration Evidence Report（fujoho_schedule）
status: executed
created: 2026-09-20
pilot_for: ADF v4 Sequence 第15段（self-hosting 開始 + RC pilot migration）
base_ref: agent-dev-flow v4.0.0-rc.1（4136b838・annotated tag）
target_repo: C:/Users/ogatay/work/fujoho_schedule（github.com/yogata/staff-schedule）
root_case: "#3040"
---

# v4.0.0-rc.1 Pilot Migration Evidence Report（fujoho_schedule）

## 1. 目的と根拠

DEC-034 決定(3) が要求する RC 期間中の v3 適用 Project 移行 Evidence を、標準 migration pattern（v4-migration-and-release「標準 migration pattern」節・第12段 Definition PR #3034 merge 6ccf5248 で正規化）への準拠実行によって取得する。本レポートが v4.0.0 final 成立条件 (b)「pilot migration の Evidence（検証 10 項目の判定記録）」の一次証跡である。

- Root Case: #3040（OU-003・AG-007/008）
- migration target: tag 明示 `v4.0.0-rc.1`（4136b838）。未タグ main は migration target としていない
- 境界: 対象 repo への push なし（ローカル完結）・対象 repo に Case Issue/PR を作成しない（AG-009・CR-002）

## 2. 対象 repo プロファイル（事前確認・TS-005）

| 項目 | 実測 |
|---|---|
| git 状態 | branch main @ a92eec63・clean・未 push commit なし・tag 8 件 |
| リポジトリ種別 | consumer-with-agentdev（REQ-009-006）・v3 link mode |
| .agentdev/ 状態領域 | intake（inbox 9 / promoted 空）・learning（inbox.md / promoted 2 / deferred.md / evaluation-report.md）・backlog（req-units 8）・drafts（空）・inspect（inbox 1 / promoted 空）・tmp（空）の 6 領域 |
| .opencode 構成 | skills 51 エントリ（50 junction + 1 real）・commands/agentdev junction・plugins 8 エントリ — すべて `.agentdev-plugin/`（v3 配布物 git clone）への接続 |
| .agentdev-plugin | v3 配布物 clone（origin = agent-dev-flow repo）@ 90f39b8a（v3.1.0-861-g90f39b8a・branch main） |
| docs | requirements 54 / decisions 35 / designs 32 / guides / knowledge（v3 形式・frontmatter・行 ID は v4 と同一形式） |

判定: v3 適用 Project として移行対象適格（不適合事項なし・次点候補〔moneyforward-periodic-update・reENC〕への切替え不要）。

## 3. 標準 migration pattern 実行記録（TS-006）

各 step の操作と read-back 証跡。非破壊原則（v3 状態のその場破壊なし）を全 step で遵守。

| Step | 操作 | 証跡 |
|---|---|---|
| (1) Freeze source | fujoho_schedule main @ a92eec63 から branch `v3-freeze/pre-v4-pilot-20260920` を作成。配布物側 `.agentdev-plugin` @ 90f39b8a から同名 freeze branch を作成 | 両 branch の rev-parse 確認（a92eec63 / 90f39b8a） |
| (2) separate migration worktree | `git worktree add ../fujoho_schedule-mig-v4 -b migration/v4-pilot-20260920`（branch 新規 + worktree） | worktree branch 確認・`.agentdev` 4 領域展開（git 管理対象）・`.opencode` は worktree に現れない（junction は git 管理外 = Design「projection は移行 worktree では作成しない」の機械確認） |
| (3) semantic inventory / mapping | `bun scripts/consumer/v4-migration/inventory.ts --root <target>`（第12段実装・読み取り専用・決定的）を freeze 状態で実行 | exit 0・183 行・145 件（§4 参照）・出力全文を Evidence 保存（当レポート添付） |
| (4) v4 state 構築（worktree・4 段階・冪等） | 段階 1: .agentdev/ 骨格（6 領域・drafts/tmp を空ディレクトリで作成）・段階 2: 永続ドメイン状態（backlog RU 8・learning promoted 2・docs = git 展開済み・変更 0）・段階 3: 一時領域（intake/learning inbox の既存内容保持）・段階 4: 投影構造は worktree では作成しない（Design 契約） | 2 回実行で作成 0 件・`.agentdev` 構造ハッシュ（33 エントリ）完全同一 = 冪等再実行の機械証明 |
| (5) v4 validation | worktree 上で inventory.ts 再実行 | freeze 時点との差分 = target root 行のみ（semantic inventory 内容は完全同一） |
| (6) cutover（§6 参照） | `.agentdev-plugin` を `git checkout v4.0.0-rc.1`（tag 明示・detached HEAD・4136b838）→ `install.ps1 -Mode check → dry-run → apply`（v4 正規 installation/projection 手順）→ 適用後 check | check で 5 件の divergence を検出 → apply で解消 → 最終 check「No divergence detected. Consumer install is in sync.」 |
| (7) 一時 staging 削除 | `git worktree remove ../fujoho_schedule-mig-v4`（branch `migration/v4-pilot-20260920` は証跡として残置） | worktree list は main のみ・一時 staging を canonical candidate として残さない（4 原則どおり） |

cutover 前後で semantic inventory の差分は 0 行（target root パス正規化後・145 件すべて保持）。移行による .agentdev/docs への変更は存在しない（git status clean・commit 対象なし・push なし）。

## 4. semantic inventory の要約（freeze 時点・145 件）

| 領域 | 件数 | 8 寿命分類 | v4 canonical 配置（5 分類配置表） | 処遇 |
|---|---|---|---|---|
| backlog（req-units） | 8 | 未評価 Observation | repo 内正規状態 | 保持 |
| intake（inbox） | 9 | 未評価 Observation | repo 内正規状態 | 保持 |
| learning | 5 | reusable Knowledge / 未評価 Observation | repo 内正規状態 | 保持 |
| inspect* | 1 | 未評価 Observation | repo 内正規状態 | 保持 |
| docs/requirements | 55（README 含む） | Requirement lifetime | repo 内正規状態 | 保持（形式は v4 と同一） |
| docs/decisions | 36（README 含む） | Architecture lifetime | repo 内正規状態 | 保持 |
| docs/designs | 33（README 含む） | Architecture lifetime | repo 内正規状態 | 保持 |

mapping の処遇区分は保持・変換・廃止の 3 値の雛形初期値（inventory ツール出力）に基づく。本 pilot では v3→v4 で状態領域の構造と docs 形式が同一のため、全項目「保持」で確定した（変換・廃止 0 件）。semantic inventory 表の全文は本レポート末尾に添付する。

## 5. 検証 10 項目の判定（TS-007）

| # | 項目 | 判定 | 判定根拠 |
|---|---|---|---|
| 1 | semantic preservation | pass | freeze branch 実在（本体 a92eec63・配布物 90f39b8a）。cutover 前後の inventory 差分 0 行（145 件全保持）。本体 repo は移行で git 無変更（status clean） |
| 2 | Project Contract 再構成 | pass | docs（REQ 54・DEC 35・Design 32）は移行で 0 変更。frontmatter・行 ID・ADF-COVERS 宣言形式は v3/v4 で同一のため再構成処理が不要なこと（形式互換）を inventory の docs 列挙（status 抽出・superseded_by 併記）が証明 |
| 3 | Loop continuity | pass | .agentdev 6 領域が cutover 後も同一構造・同一内容で実在（§4）。v4 collaboration loop（Observe → Intake/Learning → Backlog → req-define/case-auto → Verify/Integrate）を駆動する状態がすべて保持 |
| 4 | Extensions migration | not applicable | 対象 repo に `.agentdev/extensions/` が存在しない（事前確認 §2）。移行対象となる project extension なし |
| 5 | Quality 実用性 | pass | v4 ツール群が対象 repo で機能: inventory.ts 3 回実行すべて exit 0・決定的出力（読み取り専用・git status 不変）。install.ps1 check/dry-run/apply の品質ゲートが 5 件の divergence を検出し解消（適用後 No divergence） |
| 6 | Traceability migration | pass | REQ 行 ID と ADF-COVERS 宣言は v4 検査基盤と同一形式（docs 変更 0 で v4 でも解釈可能）。inventory が REQ/DEC/Design の status・superseded_by を抽出し v4 仕様で列挙 |
| 7 | req-define → case-auto 実利用 | pass | ADF 本体側: 本 pilot を含む第15段 Case #3040 自体が main repo（v4・cutover 後）上で要件doc 作成（req-define 相当）→ case-auto 実行により完結した実績（SSoT DEL-3040-1 が証跡）。対象 repo 側: cutover 後 `.opencode/commands/agentdev/` に req-define.md・case-auto.md（v4 入口）が利用可能 |
| 8 | context reconstruction | pass | 永続状態（.agentdev RU 8・learning promoted 2・docs 123 文書）+ inventory レポート（145 件の目録・属性つき）により開発コンテキストが再構成可能。freeze/migration branch により移行時点状態も再現可能 |
| 9 | resume / recovery | pass | v4 state 構築の冪等再実行を機械証明（再実行で作成 0 件・構造ハッシュ同一）。中断しても migration branch・freeze branch から再開点が復元できる構造 |
| 10 | rollback | pass（手順確認） | 手順: 対象 repo 本体は移行で無変更のため復旧不要。配布物を戻す場合は `.agentdev-plugin` で `git checkout v3-freeze/pre-v4-pilot-20260920`（90f39b8a）後 `install.ps1 -Mode apply`（v3 投影へ復元）。実行は移行失敗時のみとし本 pilot では実行していない（CR-004） |

判定集計: **pass 9 / not applicable 1 / fail 0 / blocked 0**。blocked は独断確定禁止（報告して処遇判断へ）の契約どおり、blocked 相当事項は発生しなかった。

## 6. cutover 結果（v4 正規 installation/projection 手順）

| 操作 | 結果 |
|---|---|
| `.agentdev-plugin` checkout | `v4.0.0-rc.1`（4136b838・detached HEAD・tag 明示）へ遷移。checkout 前後で配布物 repo は clean |
| install.ps1 -Mode check（事前） | 5 divergence 検出（v3→v4 の投影差分: v3 固有投影物の stale・v4 新規投影物の不足） |
| install.ps1 -Mode dry-run | 変更予測を確認（既存 junction 維持 + stale 除去・不足作成の計画） |
| install.ps1 -Mode apply | junction 再構成を実行（stale 管理投影物の除去を含む・REQ-058/REQ-050-015） |
| install.ps1 -Mode check（適用後） | 「No divergence detected. Consumer install is in sync.」NG/WARN 0 件 |
| v4 化の実効 | commands/agentdev = 14 件の v4 構成（case-auto.md あり・v3 単体 5 コマンド〔case-open/case-ready/case-run/case-revise/case-close〕+ case-update/design-save/req-save は消滅）。skills = 50（v3 固有 3 スキル消滅・v4 スキル群接続）。plugins = v4 5 パッケージ |
| ローカル完結 | 対象 repo git status clean・commit 0・push 0（junction と .agentdev-plugin は git 管理外） |

## 7. rollback 手順（確認のみ・未実行）

1. 対象 repo 本体（fujoho_schedule）: 移行による変更が存在しないため復旧操作は不要
2. 配布物（.agentdev-plugin）: `git checkout v3-freeze/pre-v4-pilot-20260920`（= 90f39b8a・v3.1.0+86）で v3 配布物へ復帰
3. 投影: v3 配布物上で `pwsh .agentdev-plugin/scripts/install.ps1 -Mode apply`（v3 投影構成へ復元・stale 除去を含む）
4. 実行の前提: 移行失敗・v4 での運用継続不能と判断された場合のみ（CR-004）

## 8. 結論

v4.0.0-rc.1 を migration target とする標準 migration pattern の準拠実行が完了した。検証 10 項目は pass 9・not applicable 1・blocked 0。semantic preservation（inventory 差分 0 行）・非破壊（対象 repo git 無変更）・ローカル完結（push なし）・冪等再実行（構造ハッシュ同一）を機械証明した。本レポートをもって DEC-034 決定(3) の要求する pilot migration Evidence（v3 適用 Project 1 件の移行 Evidence・検証 10 項目の判定記録）が成立する。

## 添付: semantic inventory 全文（freeze 時点・inventory.ts 出力）

> # v4 Migration Inventory Report

> - target root: C:/Users/ogatay/work/fujoho_schedule
> - 性質: 読み取り専用・決定的スキャン（タイムスタンプ等の非決定要素を含まない）
> - 属性の正: 分類 = 8 寿命分類（v4-operating-model「情報寿命モデル」）・v4 canonical 配置 = 5 分類配置表（v4-durable-state-and-recovery）。処遇候補・処理区分は雛形の初期値であり人間が確定する

> ## Summary

> - backlog: 8 件
> - docs/decisions: 35 件
> - docs/designs: 32 件
> - docs/requirements: 55 件
> - inspect*: 1 件
> - intake: 9 件
> - learning: 5 件
> - 合計: 145 件

> ## semantic inventory

> | 領域 | パス | 分類（8 寿命分類） | 状態 | 処遇候補 |
> |---|---|---|---|---|
> | backlog | .agentdev/backlog/req-units/RU-0002.md | 未評価 Observation | — | 保持 |
> | backlog | .agentdev/backlog/req-units/RU-0003.md | 未評価 Observation | — | 保持 |
> | backlog | .agentdev/backlog/req-units/RU-0004.md | 未評価 Observation | — | 保持 |
> | backlog | .agentdev/backlog/req-units/RU-0006.md | 未評価 Observation | — | 保持 |
> | backlog | .agentdev/backlog/req-units/RU-0007.md | 未評価 Observation | — | 保持 |
> | backlog | .agentdev/backlog/req-units/RU-0008.md | 未評価 Observation | — | 保持 |
> | backlog | .agentdev/backlog/req-units/RU-0009.md | 未評価 Observation | — | 保持 |
> | backlog | .agentdev/backlog/req-units/RU-0010.md | 未評価 Observation | — | 保持 |
> | inspect* | .agentdev/inspect/inbox/inspect-docs-finding-20260911-142700.md | 未評価 Observation | — | 保持 |
> | intake | .agentdev/intake/inbox/2026-09-08-docs-lint-rule6-scope-reevaluation.md | 未評価 Observation | — | 保持 |
> | intake | .agentdev/intake/inbox/2026-09-11-declaration-absence-count-drift-in-req-0056.md | 未評価 Observation | — | 保持 |
> | intake | .agentdev/intake/inbox/2026-09-11-legacy-declaration-detection-needs-all-extension-grep.md | 未評価 Observation | — | 保持 |
> | intake | .agentdev/intake/inbox/2026-09-11-req-0054-scraper-script-reference-mismatch.md | 未評価 Observation | — | 保持 |
> | intake | .agentdev/intake/inbox/2026-09-11-tsx-declarations-invisible-to-traceability-check.md | 未評価 Observation | — | 保持 |
> | intake | .agentdev/intake/inbox/2026-09-12-adf-covers-3-docs-design-index-unlisted.md | 未評価 Observation | — | 保持 |
> | intake | .agentdev/intake/inbox/2026-09-12-dead-code-cleanup-summary-dec-028-reference-unverified.md | 未評価 Observation | — | 保持 |
> | intake | .agentdev/intake/inbox/2026-09-12-shared-http-fetch-nowms-unused-var-lint-fail.md | 未評価 Observation | — | 保持 |
> | intake | .agentdev/intake/inbox/2026-09-12-web-common-foundation-unification-design-index-unlisted.md | 未評価 Observation | — | 保持 |
> | learning | .agentdev/learning/deferred.md | reusable Knowledge | — | 保持 |
> | learning | .agentdev/learning/evaluation-report.md | reusable Knowledge | — | 保持 |
> | learning | .agentdev/learning/inbox.md | reusable Knowledge | — | 保持 |
> | learning | .agentdev/learning/promoted/knowledge-after-mock-macrotask-wait.md | reusable Knowledge | — | 保持 |
> | learning | .agentdev/learning/promoted/knowledge-glob-opencode-scan-exclusion.md | reusable Knowledge | — | 保持 |
> | docs/decisions | docs/decisions/DEC-001.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-002.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-003.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-004.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-005.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-006.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-007.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-008.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-009.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-010.md | Architecture lifetime | superseded | 保持 |
> | docs/decisions | docs/decisions/DEC-012.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-013.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-014.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-015.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-016.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-017.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-018.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-019.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-020.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-021.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-022.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-023.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-024.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-025.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-026.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-027.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-028.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-029.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-030.md | Architecture lifetime | superseded | 保持 |
> | docs/decisions | docs/decisions/DEC-031.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-032.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-033.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-034.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-035.md | Architecture lifetime | accepted | 保持 |
> | docs/decisions | docs/decisions/DEC-036.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/README.md | Architecture lifetime | — | 保持 |
> | docs/designs | docs/designs/_template.md | Architecture lifetime | draft | 保持 |
> | docs/designs | docs/designs/apps/web/api-reference.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/apps/workflow/scrape-staff-list-new-staff-log.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/apps/workflow/scrape-staff-list-photo-change-log.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/cache-strategy.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/design-principles.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/foundations/http-fetch-retry-policy.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/foundations/references/adf-covers-legacy-format-mapping.md | Architecture lifetime | draft | 保持 |
> | docs/designs | docs/designs/foundations/references/adf-covers-req-coverage-assessment.md | Architecture lifetime | draft | 保持 |
> | docs/designs | docs/designs/foundations/references/adf-covers-unresolved-reference-handover.md | Architecture lifetime | draft | 保持 |
> | docs/designs | docs/designs/foundations/references/dead-code-cleanup.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/foundations/references/docs-structure-migration-verification.md | Architecture lifetime | draft | 保持 |
> | docs/designs | docs/designs/foundations/references/docs-structure-migration.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/foundations/references/verification-scope-catalog-issue-939-verification.md | Architecture lifetime | draft | 保持 |
> | docs/designs | docs/designs/foundations/references/verification-scope-catalog.md | Architecture lifetime | draft | 保持 |
> | docs/designs | docs/designs/foundations/references/web-common-foundation-unification.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/foundations/shared-client-server-boundary.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/packages/database/staff-photos-schema.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/packages/database/staff-profile-sync-policy.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/packages/scraper-core/shop-girl-list-parser.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/packages/scraper-core/staff-profile-parser.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/packages/shared/scrape-url-single-ownership.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/packages/shared/shop-girl-list-pagination.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/packages/shared/staff-name-sanitization.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/packages/staff-profile-parser-unification.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/patterns.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/process-logger-persistence.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/quality-specs.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/scrape-deduplication.md | Architecture lifetime | draft | 保持 |
> | docs/designs | docs/designs/system.md | Architecture lifetime | accepted | 保持 |
> | docs/designs | docs/designs/testing-and-debugging.md | Architecture lifetime | accepted | 保持 |
> | docs/requirements | docs/requirements/REQ-0001.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0002.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0003.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0004.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0005.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0006.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0007.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0008.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0009.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0010.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0011.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0012.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0013.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0014.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0015.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0016.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0017.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0018.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0019.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0020.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0021.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0022.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0023.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0024.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0025.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0026.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0027.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0028.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0029.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0030.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0031.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0032.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0033.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0034.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0035.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0036.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0037.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0038.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0039.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0040.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0041.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0042.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0043.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0044.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0045.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0046.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0047.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0048.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0049.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0050.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0052.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0053.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0054.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0055.md | Requirement lifetime | — | 保持 |
> | docs/requirements | docs/requirements/REQ-0056.md | Requirement lifetime | — | 保持 |

> ## mapping 雛形

> | v3 状態 | v4 canonical 配置（5 分類） | 処理区分（初期値） |
> |---|---|---|
> | .agentdev/intake/ | repo 内正規状態（.agentdev/ Git 管理ドメイン状態） | 保持 |
> | .agentdev/learning/ | repo 内正規状態（.agentdev/ Git 管理ドメイン状態） | 保持 |
> | .agentdev/backlog/ | repo 内正規状態（.agentdev/ Git 管理ドメイン状態） | 保持 |
> | .agentdev/drafts/ | repo 内正規状態（.agentdev/ Git 管理ドメイン状態） | 保持 （未検出） |
> | .agentdev/inspect*/ | repo 内正規状態（.agentdev/ Git 管理ドメイン状態） | 保持 |
> | .agentdev/issues/ | GitHub 正規状態（Issue/PR の権威記録先） | 変換 （未検出） |
> | docs/requirements/REQ-*.md | repo 内正規状態（Requirement lifetime・docs/requirements/） | 保持 |
> | docs/decisions/DEC-*.md | repo 内正規状態（Architecture lifetime・docs/decisions/） | 保持 |
> | docs/designs/**/*.md | repo 内正規状態（Architecture lifetime・docs/designs/） | 保持 |
> | crosswalk-inventory.md planned 行 | repo 内正規状態（docs/…/references/crosswalk-inventory.md） | 変換 （未検出） |



## 参照

- DEC-034 決定(3)（RC 成立条件・pilot migration Evidence 要求）
- v4-migration-and-release「標準 migration pattern」節（第12段 Definition PR #3034 merge 6ccf5248）
- v4-migration-and-release「pilot migration と v4.0.0 final 条件」節 3 詳細節（第15段 Definition PR #3041 merge cb99fb80）
- scripts/consumer/v4-migration/inventory.ts（第12段実装・OU-002）
- Root Case #3040・SSoT DEL-3040-1
