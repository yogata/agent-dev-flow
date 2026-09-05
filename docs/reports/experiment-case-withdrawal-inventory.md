---
id: WITHDRAWAL-EXPCASE-REQ048-INVENTORY
title: "実証Case撤回インベントリ（OU-001）"
status: accepted
created: 2026-09-05
source_issue: "#2625"
parent_epic: "#2624"
---

# 実証Case撤回インベントリ（OU-001）

本 Report は、実証Case（評価ブランチ）機構の撤回について、req-define 時点の実測インベントリを正規記録したものである。OU-002（src/opencode 32ファイル）、OU-003（Report 6件）、OU-004（最終検証）の各 engineering unit は、本 Report を実測の正として変更完遂と検証を行う（AG-011、CR-005）。

実測値は Issue #2625 補足情報の req-define 時点探索結果を入力とし、L1 適用済み commit（876aab88 時点）をベースとする worktree 上で grep 突合を実施して確認した。突合で判明した乖離は、実測値を正として本 Report に記録し、PR 本文 Findings にも記録する。

## 1. 撤回路の要約

- 撤回単位: REQ-042「Case統合先とブランチモデル」および REQ-043「評価ブランチ実証ワークフロー」の retired 化、DEC-018 の物理削除。実証Case機構（評価ブランチ、評価契約、実証Case識別情報）を正規体系から撤回する。
- L1 完了分: docs 側 29件と .opencode checker 2件。適用 commit は ec085ed8、9a691f5e、cf815cef、876aab88 の4件である。
- 残作業: OU-002 が src/opencode 32ファイル、OU-003 が docs/reports の Report 6件を担当する。OU-004 が全撤回の最終検証を担当し、その基準が本 Report である。
- 本 Report は対象要件が REQ-042（retired）であるため covers 宣言を持たない。retired REQ への covers 宣言は unknown-req-refs を生むため、意図的に付与しない。

## 2. 影響ファイルリスト

影響合計は 69件である（docs 35件、src/opencode 32件、.opencode 2件）。

### 2.1 docs 側 35件（L1 完了 29件 + Report 6件）

L1 完了 29件は次のとおり（commit ec085ed8 / 9a691f5e / cf815cef / 876aab88、REQ-042/043 は移動後パスで計上）。

| 区分 | ファイル |
|---|---|
| 索引 | docs/README.md、docs/requirements/README.md、docs/decisions/README.md |
| Decision | docs/decisions/DEC-018.md（物理削除） |
| REQ | docs/requirements/REQ-004.md、REQ-005.md、REQ-017.md、REQ-030.md、REQ-031.md、REQ-032.md、REQ-034.md、REQ-035.md、REQ-048.md |
| REQ（retired 化） | docs/requirements/retired/REQ-042.md、docs/requirements/retired/REQ-043.md |
| command Design | docs/designs/commands/case-open.md、case-close.md、case-run.md、case-auto.md、req-define.md |
| foundations Design | docs/designs/foundations/document-model.md、docs/designs/foundations/references/verification-scope-catalog.md |
| skill Design | docs/designs/skills/agentdev-git-worktree.md、agentdev-workflow-lifecycle.md、agentdev-workflow-templates.md |
| workflow Design | docs/designs/workflows/backlog-artifact-lifecycle.md、epic-wave-model.md、workflow-contracts.md |
| quality Design | docs/designs/quality/req-health-metrics.md |

残り 6件が docs/reports の Report であり、OU-003 の対象である（§8）。

### 2.2 src/opencode 側 32件

OU-002 の対象。行番号付き内訳は §7 のとおり。

### 2.3 .opencode 側 2件

checker 2件で L1 完了済み。

- .opencode/skills/repo-agentdev-integrity/scripts/check_templates.ts
- .opencode/skills/repo-agentdev-integrity/scripts/templates_structure.test.ts

## 3. covers 参照12成果物一覧

実証Case機構の covers 宣言を保持していた12成果物であり、L1 で REQ-042/REQ-043 の covers 宣言同期を完了した。

| 種別 | 成果物 |
|---|---|
| implementation（10 Design） | docs/designs/commands/case-open.md |
| implementation（10 Design） | docs/designs/commands/case-close.md |
| implementation（10 Design） | docs/designs/commands/case-run.md |
| implementation（10 Design） | docs/designs/commands/case-auto.md |
| implementation（10 Design） | docs/designs/commands/req-define.md |
| implementation（10 Design） | docs/designs/workflows/epic-wave-model.md |
| implementation（10 Design） | docs/designs/workflows/backlog-artifact-lifecycle.md |
| implementation（10 Design） | docs/designs/skills/agentdev-workflow-lifecycle.md |
| implementation（10 Design） | docs/designs/skills/agentdev-git-worktree.md |
| implementation（10 Design） | docs/designs/skills/agentdev-workflow-templates.md |
| verification（2 checker） | .opencode/skills/repo-agentdev-integrity/scripts/check_templates.ts |
| verification（2 checker） | .opencode/skills/repo-agentdev-integrity/scripts/templates_structure.test.ts |

現行の docs/ 配下には REQ-042 または REQ-043 を covers する宣言は存在しない（grep 検証済み）。REQ-042/043 への言及残存は、requirements/README.md の retired 表（索引として正）、retired 配下の当該ファイル自体、および §8 の Report 6件（OU-003 対象）のみである。

## 4. 横断 REQ 参照行

L1 で適用済みの REQ 11操作、DEC-018 削除、covers 連鎖修正の記録である。

| 操作 | 対象 | 内容 |
|---|---|---|
| REQ-042 | 全体 | retired 化（retired/ へ移動、status: retired） |
| REQ-043 | 全体 | retired 化（retired/ へ移動、status: retired） |
| REQ-004 | REQ-004-054 | 削除（covers 連鎖修正） |
| REQ-005 | REQ-005-005 | 実証Case句の除去 |
| REQ-017 | REQ-017-001 | 評価契約句の削除 |
| REQ-030 | REQ-030-020 | main 統合先への書き戻し |
| REQ-031 | REQ-031-024 | main 統合先への書き戻し |
| REQ-032 | REQ-032-013 | main 統合先への書き戻し |
| REQ-034 | REQ-034-026、REQ-034-037〜043 | 更新（REQ-034-037〜043 は covers 連鎖修正） |
| REQ-035 | REQ-035-009、REQ-035-012 | 更新（REQ-035-012 は covers 連鎖修正） |
| REQ-048 | 目的節 | 撤回を反映した目的節の更新 |
| DEC-018 | 全体 | 物理削除 |

grep 検証の結果、REQ-004、REQ-005、REQ-017、REQ-030、REQ-031、REQ-032、REQ-034、REQ-035、REQ-048 の9ファイルから検証語（§6）のヒットは 0件であり、要件側の撤回は完了している。

## 5. 索引領域の区別

### 5.1 AUTOGEN 再生成領域（4ファイル）

次の4ファイルは AUTOGEN マーカー領域を保持し、L1 の cf815cef で再生成した。

- docs/README.md
- docs/requirements/README.md
- docs/decisions/README.md
- docs/designs/quality/req-health-metrics.md

### 5.2 手書き領域

AUTOGEN 外の手書き領域であり、L1 で手動編集した位置の記録である。行番号は L1 適用時の編集位置であり、現行本文には反映済みである。

- docs/README.md: 49行、50行（REQ 表の REQ-042/043 行周辺）、71行（Decision 件数段落の直後）、93行（Decision 表行周辺）
- docs/decisions/README.md: Decision Map 3行（DEC-018 関連行の除去）、関連 REQ 表（DEC-018 行の除去）

現行の索引ファイルにおける REQ-042/043 言及は、docs/requirements/README.md の retired 表（AUTOGEN 領域）のみである。

## 6. 検証語の定義

AG-011 の限定ルールに従い、撤回の検証語と適用範囲を次のとおり定義する。

### 6.1 検証語

- 実証Case
- 実証ケース
- 評価ブランチ
- 評価契約
- REQ-042-NNN（REQ-042-001〜 の要件項目参照）
- REQ-043-NNN
- DEC-018

### 6.2 「統合先」の扱い

「統合先」は、評価ブランチまたは実証Caseと共起する可変文脈のときのみ検証対象とする。MERGE 統合先、重複関係の統合元/統合先など、無関係文脈のヒットは除外する。

除外対象の実測一覧は次の8件である（5件の個別ファイル + docs/reports/integrity/audits/ 3件）。いずれも無関係文脈であることを行単位で確認済みである。

| ファイル | 行 | 無関係文脈の区分 |
|---|---|---|
| docs/requirements/retired/REQ-028.md | 38 | checker MERGE 時の統合先維持 |
| docs/designs/foundations/decision-lifecycle.md | 101 | MERGE 候補の統合先 Decision |
| docs/designs/foundations/document-model.md | 608 | MERGE 記述の統合先 |
| docs/designs/skills/agentdev-adversarial-review.md | 168 | duplicate 関係の統合元/統合先 |
| src/opencode/skills/agentdev-adversarial-review/references/adversarial-review-protocol.md | 200 | duplicate 関係の統合元/統合先 |
| docs/reports/integrity/audits/classification-20260811.md | 該当行 | 監査記録内の無関係文脈 |
| docs/reports/integrity/audits/bidirectional-audit-20260811.md | 該当行 | 監査記録内の無関係文脈 |
| docs/reports/integrity/audits/cross-cutting-integration-design-20260811.md | 該当行 | 監査記録内の無関係文脈 |

Issue 補足情報の表記は「除外 7ファイル」であるが、列挙実体は上記のとおり 5件 + 3件である。本 Report は列挙実体を正とする。

### 6.3 対象外の語

- 「縮小評価契約」は、実証Caseの評価契約とは別の複合語であり、検証対象としない。当該語を含む行は撤回対象から除外する。
- retired/REQ-042.md、retired/REQ-043.md、および requirements/README.md retired 表の行は、退避と索引の正として保持する撤回対象外である。
- 本 Report 自身は撤回対象ではなく記録物であり、検証語を含む。OU-002〜004 の検証では本 Report を対象から除く。

## 7. src/opencode 32ファイルの行番号付き内訳（OU-002 対象）

検証語ヒット行の内訳である。行番号は req-define 時点の実測であり、src/opencode は L1 後も未変更のため有効である。worktree 上の grep 突合で32ファイルの存在と行番号を確認した。1件の乖離（agentdev-workflow-case-auto/references/stop-and-decision-resolution.md の49行）を実測で追加し、修正済みを ★ で示す。

| ディレクトリ / ファイル | 検証語ヒット行 |
|---|---|
| commands/agentdev/req-define.md | 17、46〜48 |
| commands/agentdev/case-open.md | 38 |
| commands/agentdev/case-run.md | 38 |
| commands/agentdev/case-close.md | 45、46 |
| commands/agentdev/case-auto.md | 40 |
| skills/agentdev-workflow-case-open/SKILL.md | 94 |
| skills/agentdev-workflow-case-open/references/issue-body-and-execution-contract.md | 92〜138 |
| skills/agentdev-workflow-case-open/references/execution-unit-and-preflight.md | 10、48、50 |
| skills/agentdev-workflow-case-open/references/termination-and-cleanup.md | 47、48 |
| skills/agentdev-workflow-case-run/SKILL.md | 133、134 |
| skills/agentdev-workflow-case-run/references/single.md | 79〜122 |
| skills/agentdev-workflow-case-run/references/epic-wave.md | 38〜80 |
| skills/agentdev-workflow-case-run/references/delegation-and-result.md | 43〜46 |
| skills/agentdev-workflow-case-close/SKILL.md | 12、113、114 |
| skills/agentdev-workflow-case-close/references/cleanup-and-capture.md | 16〜237 |
| skills/agentdev-workflow-case-close/references/epic-wave-close.md | 4〜146 |
| skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md | 12〜92 |
| skills/agentdev-workflow-case-auto/SKILL.md | 100〜102 |
| skills/agentdev-workflow-case-auto/references/input-resolution-and-orchestration.md | 41〜215 |
| skills/agentdev-workflow-case-auto/references/stop-and-decision-resolution.md | 47、49、174 ★ |
| skills/agentdev-workflow-case-auto/references/conflict-resolution-and-reporting.md | 63〜115 |
| skills/agentdev-workflow-req-define/SKILL.md | 18〜100 |
| skills/agentdev-workflow-req-define/references/input-and-dialogue.md | 33〜95 |
| skills/agentdev-workflow-req-define/references/requirement-development.md | 77〜155 |
| skills/agentdev-workflow-req-define/references/draft-generation.md | 38〜120 |
| skills/agentdev-workflow-lifecycle/SKILL.md | 60、61、101、104、105 |
| skills/agentdev-git-worktree/SKILL.md | 30〜59 |
| skills/agentdev-git-worktree/references/worktree-operations.md | 6〜85 |
| skills/agentdev-git-worktree/references/git-common-procedures.md | 267、546 |
| skills/agentdev-workflow-templates/templates/issue_desc_feature.md | 97〜101 |
| skills/agentdev-workflow-templates/templates/issue_desc_epic.md | 108〜114 |
| skills/agentdev-workflow-templates/templates/issue_desc_child.md | 107〜111 |

★ は Issue 補足情報（47、174）からの実測修正である。49行は「実証Caseで再開可能な場合は評価ブランチを保持する」の記述であり、評価ブランチの検証語ヒットとして実測 grep で確認した。

## 8. Report 6件の行番号付き内訳（OU-003 対象）

docs/reports 配下の残撤回対象 6件である。行番号は実測 grep で全行一致を確認済みである。

| ファイル | 検証語ヒット行 |
|---|---|
| docs/reports/req-048-experiment-g1-definition.md | 17、43、45、56、113、148、152、153、155、176 |
| docs/reports/req-048-experiment-g2-definition.md | 17、66、68、79、138、170、174、178、179、181、182、203 |
| docs/reports/req-048-experiment-g3-definition.md | 19、66、68、79、86、147、184、188、189、191、192、213 |
| docs/reports/req-048-experiment-g4-definition.md | 17、38、67、69、80、138、176、180、181、183、184、206 |
| docs/reports/req-048-candidate-ranking.md | 18 |
| docs/reports/req-048-dead-responsibility-cleanup.md | 44 |

共通文言と節見出しの位置は次のとおりである。

- 共通文言「実行時に、評価ブランチと評価契約を当該実証Caseの Issue で確定する（REQ-043、DEC-018）」: g1 153行、g2 179行、g3 189行、g4 181行
- 節見出し「実験の実行・判定の分離（後続実証Case）」: g1 148行、g2 174行、g3 184行、g4 176行

## 9. 既知 fail ベースライン

req-define 時点で記録された既知 fail のベースラインである。OU-004 の最終検証では、このベースラインからの新規増加がないことを確認する。

| 区分 | ベースライン |
|---|---|
| distribution checker | concrete-id 13件（source）/ 8件（link） |
| REQ-017-017 anchor | 2件 fail（3 cwd 分割の③側） |
| fixture | malformed-declarations 1件 |
| 契約テスト LOC | 250超過 2本 |
| missing-implementation | REQ-048 5件（カタログ任意行） |
