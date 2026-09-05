---
id: WITHDRAWAL-EXPCASE-FINAL-VERIFICATION
title: "実証Case撤回の最終検証（OU-004）"
status: accepted
created: 2026-09-05
source_issue: "#2628"
parent_epic: "#2624"
---

# 実証Case撤回の最終検証（OU-004）

本 Report は、実証Case（評価ブランチ）機構の全面撤回 Case（Epic #2624）の最終検証（OU-004）である。撤回の完了を機械検証可能な証跡で閉じることを目的とし、L1 統合 changeset（REQ 11操作・DEC-018 物理削除・Design 11ファイル・covers 同期12成果物・索引再生成、commit ec085ed8〜876aab88）と、後続 OU-001〜OU-003（PR #2629、#2630、#2631）の成果に対する TS-004〜TS-006 の検証結果を記録する。

本 Report 自身は撤回対象ではなく記録物であり、検証語を含む。§5 の全文検索では本 Report と撤回インベントリ Report（`experiment-case-withdrawal-inventory.md`）を対象から除く。本 Report は covers 宣言を持たない（§1 の covers 方針を参照）。

## 1. 検証対象と出所（provenance）

### 1.1 RU 受け入れ条件の取り扱い

RU「実証Case・評価ブランチ機構の全面撤回」の受け入れ条件の原文は、req-define での消費後に draft とともに削除された（Form Zero 契約）。repo 上に原文は存在せず、本 Report は原文の復元・推定を行わない。

代わりに、case-open 時に Epic #2624 と子 Issues #2625〜#2628 の本文へ投影された完了条件と test strategy を、受け入れ条件の永続的な再現体として検証対象とする。この扱いは、履歴保全（AG-009）と検証集約（AG-010）に基づく。

Issue #2628 のタイトルにある「受け入れ条件 1〜22」は、req-define 時点の番号帯の目安である。投影の実測は Epic #2624 完了条件 4項目、#2625 完了条件 3項目、#2626 完了条件 5項目、#2627 完了条件 4項目、#2628 完了条件 5項目の計 21項目であり、本 Report はこの 21項目を実測として番号付きで列挙する（§2）。数値は番号帯の目安との差異を説明するものであり、検証結果の欠落ではない。

### 1.2 covers 方針

本 Report は covers 宣言を持たない。理由は次のとおりである。

- 本 Report の主たる検証対象である REQ-042 と REQ-043 は retired 化済みであり、これらへの covers 宣言は traceability check で unknown-req-refs を生む（撤回インベントリ Report §1 と同方針）。
- 本 Report は撤回 Case の一回限りの最終検証記録であり、「実際に要件を検証する恒常的な検証手段」に該当する REQ 行が存在しないため、verification covers も付与しない。
- 本 Report が既存成果物種別（Report）へ保存され、後から確認可能であること自体が REQ-048-016 の求める形に合致するが、それは本 Report の保存形態の性質であり、REQ-048 の検証手段ではない。

`tim_declarations_contract.test.ts` は covers 宣言なしで合格する（23 pass / 0 fail、§4.3）。

### 1.3 検証の入力

- L1 統合 changeset: commit ec085ed8（req-save分）、9a691f5e（design-save分）、cf815cef（AUTOGEN索引再生成）、876aab88（retire元パス削除漏れ除去）
- OU-001: PR #2629（撤回インベントリ Report。本検証の基準）
- OU-002: PR #2630（配布物撤去 32ファイル）
- OU-003: PR #2631（Report 6件の意味単位書き換えと撤回注記）
- 本検証の実行環境: worktree `.worktrees/2628-feature`、branch `feature/issue-2628`、HEAD 96effc81（origin/main と同一。PR #2631 マージ後）

## 2. 受け入れ条件対応表

Epic #2624 と子 Issues #2625〜#2628 の完了条件（投影実測 21項目）の検証結果である。

| # | 出所 | 完了条件 | 判定 | 根拠 |
|---|---|---|---|---|
| 1 | Epic #2624 | OU-001〜OU-004 の子 Issue 4件すべてが完了している | pass | #2625 closed（PR #2629 マージ済み）、#2626 closed（PR #2630 マージ済み）、#2627 closed（PR #2631 マージ済み）、#2628 は本 Report が完了条件を満たす（Issue 自体のクローズは case-close 責務） |
| 2 | Epic #2624 | 各子 Issue の完了条件（TS-001〜TS-006 の pass_criteria）が満たされている | pass | TS-001〜TS-003 は各子 Issue 完了時に合格済み。TS-004〜TS-006 は本 Report §3〜§5 で合格 |
| 3 | Epic #2624 | Epic 完了時点で src/opencode・docs/reports・docs 全域の現行手続き・現行契約に検証語の残存が 0件である（歴史記録・撤回注記・retired 文書・learning/Issue 等は AG-009 対象外） | pass | §5 全文検索。現行手続き・現行契約の検証語残存 0件。残存は retired 文書・撤回注記・監査記録・無関係文脈のみ |
| 4 | Epic #2624 | 既知 fail ベースラインを超える新規 fail が 0件である | pass | §6。新規 fail 0件 |
| 5 | #2625 | 撤回インベントリ Report が docs/reports/ へ保存されている | pass | `docs/reports/experiment-case-withdrawal-inventory.md` 存在確認（PR #2629 でマージ済み） |
| 6 | #2625 | 影響ファイルリスト・covers 参照12成果物一覧・横断 REQ 参照行・索引領域の区別・検証語の定義が記録されている | pass | インベントリ Report §2〜§6 の読み戻し。影響 69件（docs 35 / src/opencode 32 / .opencode 2）、covers 12成果物、横断 REQ 参照行 11操作、AUTOGEN 4ファイルと手書き領域の区別、検証語 7種と「統合先」限定ルールを記録済み |
| 7 | #2625 | 最新 main（L1 適用済み commit 876aab88 時点）に対する実測値と一致している | pass | インベントリ Report §7 の grep 突合記録。OU-002・OU-003 が同 Report を基準として実装・検証を完了（PR #2630、#2631）し、本検証 §5 の実測とも矛盾しない |
| 8 | #2626 | src/opencode 全域で検証語の残存が 0件である（統合先は可変文脈のみ） | pass | §5。src/opencode 配下の検証語ヒット 0件。「統合先」は main 固定表記 11行のみで、評価ブランチ・実証Caseと共起する可変文脈 0件 |
| 9 | #2626 | check_distribution_boundary.ts --profile source で既知ベースライン 13件を超える新規違反が 0件である | pass | §5.3。source 13件 = ベースライン 13件 |
| 10 | #2626 | check_distribution_boundary.ts --profile link で新規違反が 0件である | pass | §5.3。link 8件 = ベースライン 8件（main root から読取専用実行） |
| 11 | #2626 | repo-agentdev-integrity full suite（正規形 3 cwd 分割）の新規 fail が 0件である | pass | §5.2。①1件（staging、基底 98496bc8 で再現する pre-existing）、②0件、③2件（REQ-017-017 anchor 既知と同一）。新規 fail 0件 |
| 12 | #2626 | templates 3本から実証Case識別情報セクションが除去されている | pass | §5.1。`実証Case識別情報` の全域ヒットはインベントリ Report の記録行 1件のみで templates 3本には 0件。templates の「統合先」は「Case に割り当てられた統合先ブランチ。main を参照する」の main 固定表記 |
| 13 | #2627 | Report 6件すべてに 2026-09-05 の撤回注記がある | pass | `git grep "2026-09-05 撤回注記"` で Report 6件（candidate-ranking:13、dead-responsibility-cleanup:13、g1:12、g2:12、g3:12、g4:12）を確認 |
| 14 | #2627 | 現行手続きを規定する実証Case依存の記述が「通常の技術検証」ベースへ意味単位で書き換えられている | pass | §5.1。Report 6件の検証語ヒットは撤回注記と歴史的事実の記述のみで、現行手続きを規定する記述 0件 |
| 15 | #2627 | 過去の測定結果・判断・作成経緯への意図しない変更がない（git diff で確認） | pass | #2627 完了時に git diff で意図外変更なしを確認済み（完了条件チェック済み、PR #2631 マージ済み）。本検証は読み取り専用であり再変更は発生していない |
| 16 | #2627 | check_changed_docs.ts（workflow profile）で failures 0 / warnings 0 である | pass | #2627 完了時に合格済み。本 Report 追加後の再実行結果を §5.4 に記録 |
| 17 | #2628 | 最終検証 Report が docs/reports/ へ保存されている | pass | 本 Report 自体がその保存の実体である |
| 18 | #2628 | RU 受け入れ条件 1〜22 のすべてが pass または not applicable（歴史領域の正当な除外）として根拠付きで記録されている | pass | 本 §2。投影実測 21項目すべて pass。not applicable は歴史領域の除外に相当する検証語の残存分類で、§5.1 の分類表により正当性を根拠付けた |
| 19 | #2628 | TS-004（L1 REQ 更新行の読み戻し）が合格している | pass | §3 |
| 20 | #2628 | TS-005（retired 配置・DEC-018 不在・covers 除去・索引整合）が合格している | pass | §4 |
| 21 | #2628 | 全文検索・full suite・docs-check・distribution boundary で新規 fail が 0件である | pass | §5・§6。新規 fail 0件 |

## 3. TS-004: L1 REQ 更新行の読み戻し

commit ec085ed8 の REQ 差分を読み戻し、現行ファイル（96effc81）との整合を確認した。

### 3.1 書き戻し行（main 固定表記の確認）

| REQ | 操作 | 読み戻し結果 |
|---|---|---|
| REQ-005 | REQ-005-005 | 「通常Caseの scale は feature のみ standard、large とすること」へ書き戻し済み（実証Case句の除去を ec085ed8 diff で確認） |
| REQ-017 | REQ-017-001 | 評価契約・評価ブランチ句を削除し、execution contract 項目の列挙へ書き戻し済み |
| REQ-030 | REQ-030-020 | 「main ブランチの作業ディレクトリとリモートの同期を確認」へ書き戻し済み |
| REQ-031 | REQ-031-024 | 「worktree の作成元と PR の base は main を参照すること」へ書き戻し済み |
| REQ-032 | REQ-032-013 | 「main 同期時に…main 以外のブランチ占有のリスクを事前検出」へ書き戻し済み |
| REQ-034 | REQ-034-026 | 「main への push、capture、commit を並列実行区間の外で処理」へ書き戻し済み |

上記の各行は REQ-042 参照句（「REQ-042 の定義による、既定 main」等）を持たない main 固定表記である。

### 3.2 削除行

| REQ | 削除行 | 読み戻し結果 |
|---|---|---|
| REQ-004 | REQ-004-054 | ec085ed8 で削除。現行 REQ-004.md に要件行なし |
| REQ-034 | REQ-034-037〜043 の 7行 | ec085ed8 で削除。適用範囲行からも「実証Caseの自走（REQ-043 所有契約の消費）」句を除去済み |
| REQ-035 | REQ-035-012 | ec085ed8 で削除。REQ-035-009 は「main 基準で rebase により機械的解消」へ書き戻し済み |

### 3.3 REQ-048 の16要件行不変・目的節のみ修正

`git diff 241d361d..ec085ed8 -- docs/requirements/REQ-048.md` の差分は、frontmatter の `updated`（2026-09-04→2026-09-05）と目的節の 1行（「最小観測・評価契約を定める」→「最小観測・評価の契約を定める」）のみである。要件節の 16行（REQ-048-001〜REQ-048-016）は不変である。

### 3.4 削除行の covers 参照残存（全文検索）

削除行 ID で docs / src / .opencode 全域を `git grep` した。実測は次のとおりである。

| 削除行 | 全域ヒット | covers 参照残存 |
|---|---|---|
| REQ-004-054 | インベントリ Report §4 の記録行 1件 | 0件（撤回記録であり covers 宣言ではない） |
| REQ-034-037 | インベントリ Report §4 の記録行 1件 | 0件（同上） |
| REQ-034-038〜043 | 0件 | 0件 |
| REQ-035-012 | インベントリ Report §4 の記録行 1件、retired/REQ-043.md:47（REQ-043-026 行内の関連要件参照）1件 | 0件（前者は撤回記録、後者は retired 文書本文の歴史記録であり covers 宣言ではない。AG-009 対象外） |

判定: pass_criteria「削除行の covers 参照残存が 0件」を満たす。

## 4. TS-005: retired 配置・DEC-018 不在・covers 除去・索引整合

### 4.1 retired 配置と DEC-018 不在

| 項目 | 実測 |
|---|---|
| docs/requirements/retired/REQ-042.md | 存在。frontmatter `status: retired`、履歴注記「RETIRE、status: retired、2026-09-05」付き |
| docs/requirements/retired/REQ-043.md | 存在。frontmatter `status: retired`、履歴注記「RETIRE、status: retired、2026-09-05」付き |
| docs/decisions/DEC-018.md | 不在（Test-Path で不存在確認） |

### 4.2 covers 除去（12成果物）

`REQ-042-[0-9]{3}` と `REQ-043-[0-9]{3}` の全域 grep 実測（インベントリ Report を除く）:

| パターン | ヒット | 詳細 |
|---|---|---|
| REQ-042-NNN | 13行 | retired/REQ-042.md 12行（要件節自体）、retired/REQ-043.md 1行（REQ-043-026 行内の REQ-042-012 参照）。いずれも retired 文書本文であり covers 宣言ではない |
| REQ-043-NNN | 30行 | retired/REQ-043.md 30行（要件節自体）のみ |

12成果物（implementation 10 Design: commands/case-open・case-close・case-run・case-auto・req-define、workflows/epic-wave-model・backlog-artifact-lifecycle、skills/agentdev-workflow-lifecycle・agentdev-git-worktree・agentdev-workflow-templates。verification 2 checker: check_templates.ts・templates_structure.test.ts）からの REQ-042-NNN / REQ-043-NNN 参照は 0件であり、covers 宣言の除去は完了している。

### 4.3 traceability 宣言整合

`bun test ./.opencode/skills/repo-agentdev-integrity/scripts/tim_declarations_contract.test.ts` の実測: 23 pass / 0 fail（52 expect() calls、1 file）。covers 宣言付き成果物と retired REQ への unknown-req-refs は検出されない。

### 4.4 索引整合

`bun ./.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts --root .` の実測: `[generate_indexes] no changes (already up-to-date)`。実行後の `git status --porcelain` は空であり、索引（requirements/README・decisions/README・docs/README・req-health-metrics・verification-scope-catalog の AUTOGEN 領域）は撤回後の体系と整合している。

判定: pass_criteria の4点すべて成立、新規 fail 0件。

## 5. TS-006: 全域機械検証

### 5.1 全文検索（検証語 7種 + 統合先限定ルール）

検証語は AG-011 の限定ルール（インベントリ Report §6 が正）に従う。`git grep -c` による行数実測（インベントリ Report 自身を除く）である。本検証 Report 自身も対象から除く。

| 検証語 | 全域ヒット | 現行手続き・現行契約の残存 | 残存の分類（AG-009 対象外の根拠） |
|---|---|---|---|
| 実証Case | 25行 | 0件 | Report 6件の撤回注記・歴史的言及 10行（PR #2631 の書き換え後の記録）、retired 文書 15行（REQ-042.md 2行、REQ-043.md 13行） |
| 実証ケース | 0行 | 0件 | — |
| 評価ブランチ | 39行 | 0件 | Report 6件の撤回注記内 6行、requirements/README.md retired 表 1行（索引として正）、retired 文書 32行（REQ-042.md 11行、REQ-043.md 21行） |
| 評価契約 | 20行 | 0件 | Report 6件の撤回注記内 4行、retired 文書 12行、verification-scope-catalog.md:227 の「縮小評価契約」1行（REQ-048-019・DEC-027 系の無関係複合語。インベントリ Report §6.3 が対象外と明記） |
| REQ-042-NNN | 13行 | 0件 | retired 文書本文 13行（退避と索引の正） |
| REQ-043-NNN | 30行 | 0件 | retired 文書本文 30行（同上） |
| DEC-018 | 0行 | 0件 | — |
| 統合先（可変文脈のみ検証対象） | 46行 | 可変文脈 0件 | main 固定表記 11行（commands/case-open.md:38、skills/case-close SKILL.md:112、case-open SKILL.md:94、issue-body-and-execution-contract.md:92,94,129、case-run SKILL.md:133、templates issue_desc_child.md:78,79、issue_desc_feature.md:79,80）、無関係文脈 19行（MERGE/duplicate 関係 5行: decision-lifecycle.md:101、document-model.md:608、agentdev-adversarial-review.md:168、adversarial-review-protocol.md:200、retired/REQ-028.md:38。監査記録 14行: audits 3ファイル）、retired 文書 15行、requirements/README.md retired 表 1行 |

判定: 現行手続き・現行契約における検証語残存 0件、「統合先」の可変文脈（評価ブランチ・実証Caseと共起する統合先選択記述）0件。残存はすべて retired 文書・撤回注記・監査記録・無関係文脈であり AG-009 の正当な対象外である。

### 5.2 repo-agentdev-integrity full suite（正規形 3 cwd 分割）

実行環境ラベル: worktree `.worktrees/2628-feature`（HEAD 96effc81）、junction 未伝播（REQ-018、git worktree は junction をコピーしない）、依存パッケージ前置 `bun install --cwd src/opencode/skills/agentdev-project-extensions/scripts` 実施済み（zod@4.4.3 ほか 6 packages、bun v1.3.6）。

| 分割 | 起動コマンド（cwd = worktree root） | 結果 |
|---|---|---|
| ① integrity suite | `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/` | 2555 pass / 1 fail（2556 tests across 102 files） |
| ② src 側 skill script テスト | `bun test ./src/opencode/skills/` | 102 pass / 0 fail（102 tests across 9 files） |
| ③ repo ルート系 guard テスト | `bun test ./.opencode/plugins/ ./scripts/` | 74 pass / 2 fail（76 tests across 5 files） |

fail 全件の由来分類:

| fail テスト | 件数 | 由来分類 |
|---|---|---|
| ① archive-builder / same-filesystem staging (parent blocker #2) > staging path is created UNDER outputRoot, never under os.tmpdir() | 1 | 基底 98496bc8 で同一テスト名が再現（§6.1）。当該 changeset 起因ではない pre-existing |
| ③ Issue template projection target (Execution Contract) > child template declares the projection contract and the REQ-017-017 anchor | 1 | 既知 fail ベースライン（REQ-017-017 anchor 2 fail、③側）と同一 |
| ③ Issue template projection target (Execution Contract) > epic template declares the projection contract and the REQ-017-017 anchor | 1 | 同上 |

件数突合: ①2556 / ②102 / ③76 の計 2734 tests。分割② の実行に node_modules 前置が効いていることを確認済み。

### 5.3 check_distribution_boundary.ts

| profile | 実行環境 | scanned | concrete-id ヒット | ベースライン | 判定 |
|---|---|---|---|---|---|
| source | worktree（--root .） | 298 | 13 | 13 | 新規違反 0件 |
| link | main root `C:/Users/ogatay/work/agent-dev-flow`（読取専用実行。junction 伝播あり） | 47 | 8 | 8 | 新規違反 0件 |

link profile を worktree 内で実行した場合、junction 未伝播により配置先実体が読めないため、REQ-018 の構造的制約に従い main root から読取専用実行で採証した（実行環境ラベルを明記）。

### 5.4 check_changed_docs.ts（workflow profile）

本 Report 追加後、`bun ./.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-run --files docs/reports/experiment-case-withdrawal-final-verification.md`（workflow profile、新規 Report を --files 指定）を実行した結果: **failures 0 / warnings 0**。

### 5.5 Standard / Epic Case の main 基準動作（静的確認）

スキル記述の読み戻しによる確認である。

| 対象 | 確認結果 |
|---|---|
| src/opencode/skills/agentdev-workflow-case-run/SKILL.md:133 | 「**統合先基準（作業起点・PR base）**: worktree の作成元と PR の base は main を参照する。rebase・同期基準、鮮度確認、Epic 後続 Wave の作業起点は main を参照する」。評価ブランチ手順の記述なし |
| src/opencode/skills/agentdev-workflow-case-close/SKILL.md:112 | 「**統合先基準（squash merge 先と同期基準）**: squash merge 先、ブランチ同期の対象は main とする。QG-4 は Issue 完了条件の最終判定として意味を変更しない」。評価ブランチ squash merge の記述なし |
| src/opencode/skills/agentdev-git-worktree/SKILL.md:28-41 | 「## main 基準の worktree 操作」「worktree の作成元、PR の base、rebase・同期基準、鮮度確認、squash merge 先、Epic 後続 Wave の作業起点は main を参照する」。評価ブランチ機構の記述なし |
| src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md:19-20、git-common-procedures.md:267 | 「worktree の作成元は main」「同期対象のブランチは main である」。評価ブランチ命名規則・可変統合先解決の記述なし |

判定: Standard / Epic Case のいずれも main 固定の動作記述のみであり、評価ブランチ手順・実証Case分岐の残存はない。

### 5.6 docs-check（full suite ① 内包）

docs-check の検査本体は repo-agentdev-integrity スキルの検査スイートであり、full suite ①（§5.2）に内包される。①の fail 1件は staging テスト（§6.1 の pre-existing 分離）であり、docs ドキュメント整合性検査の新規 fail は 0件である。

## 6. 既知 fail ベースラインとの差分

既知 fail ベースライン（インベントリ Report §9、Issue #2628 の記録）と本検証の実測の差分である。

### 6.1 ベースライン差分表

| 区分 | ベースライン | 本検証の実測 | 差分判定 |
|---|---|---|---|
| distribution checker concrete-id | 13件（source）/ 8件（link） | source 13件、link 8件 | ベースライン一致、新規 0件 |
| REQ-017-017 anchor | 2件 fail（③側） | 2件 fail（child/epic template の anchor、同一テスト名） | ベースライン一致、新規 0件 |
| fixture malformed-declarations | 1件 | full suite ①の fail は staging 1件のみで、fixture 系 fail は計上されず | 新規 0件（ベースライン時点の記録から計上外へ変動、fail 増加なし） |
| 契約テスト LOC 250超過 | 2本 | full suite fail 計上 0件 | 新規 0件 |
| missing-implementation REQ-048 | 5件（カタログ任意行） | full suite fail 計上 0件 | 新規 0件 |
| full suite ① staging trusted-distribution-gate | （ベースライン外。本検証で観測） | 1件 fail | 基底 98496bc8 で再現する pre-existing（下記 §6.2）。新規 fail ではない |

### 6.2 staging fail の基底再現確認（pre-existing 分離）

full suite ① で検出された staging fail（archive-builder「same-filesystem staging (parent blocker #2)」）が当該 changeset 起因ではないことを、基底 commit で再現比較により確認した。

- 手順: `git worktree add C:/WINDOWS/TEMP/opencode/base-check-98496bc8 98496bc8` で基底を検証用一時 worktree へ取り出し、依存パッケージ前置（`bun install --cwd src/opencode/skills/agentdev-project-extensions/scripts`）を実施のうえ、`bun test ./.opencode/skills/repo-agentdev-integrity/scripts/` を実行した。確認後、一時 worktree は削除し、`git worktree list` で削除を確認した。
- 実測: 基底 98496bc8 で 2556 tests across 102 files / 1 fail。fail テスト名は `archive-builder / same-filesystem staging (parent blocker #2) > staging path is created UNDER outputRoot, never under os.tmpdir()` であり、本検証 worktree の fail と同一である。
- 単体実行では fail しない（基底・worktree のいずれでも archive-builder.test.ts 単体は 19 pass / 0 fail）ため、フル suite 実行時の環境依存（staging 計測環境由来）と判断する。
- 判定: pre-existing（既知欠陥・環境依存）。本 OU の changeset が 1件も fail を新規に導入していないことを基底比較で確認した。

### 6.3 新規 fail 判定

全文検索（§5.1）、full suite 3分割（§5.2）、distribution boundary 両 profile（§5.3）、check_changed_docs（§5.4）、索引再生成差分（§4.4）のすべてで、既知 fail ベースラインと基底再現確認を超える新規 fail は 0件である。

## 7. 結論

- 投影実測 21項目の受け入れ条件対応表（§2）は、すべて pass である。not applicable とすべき項目は存在しなかった（歴史領域の検証語残存は §5.1 の分類により AG-009 の正当な対象外として根拠付け、対応する完了条件は pass と判定した）。
- TS-004（§3）、TS-005（§4）、TS-006（§5）はすべて pass_criteria を満たす。
- 既知 fail ベースライン（§6）を超える新規 fail は 0件である。full suite ①の staging fail 1件は基底 98496bc8 での再現により pre-existing（環境依存）と分離した。
- 実証Case・評価ブランチ・Case可変統合先機構の撤回は、REQ 11操作・DEC-018 物理削除・Design 11ファイル・covers 同期12成果物・索引再生成（commit ec085ed8〜876aab88）と、配布物撤去（PR #2630）・Report 6件の書き換え（PR #2631）を含めて、機械検証可能な証跡で完了したことを本 Report が記録する。
- Epic #2624 の完了判定と #2625〜#2628 の Issue クローズ、Epic 本文のステータス追跡更新は case-close の責務であり、本 Report はその入力となる証跡を提供する。
