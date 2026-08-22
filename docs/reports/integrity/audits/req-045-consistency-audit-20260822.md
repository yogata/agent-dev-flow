---
id: AUDIT-REQ-045-CONSISTENCY
title: "REQ-045 現行成果物体系の整合性網羅監査レポート"
status: accepted
created: 2026-08-22
audit_for: REQ-045 / Issue #2370
parent_epic: "#2369 (REQ-045〜047 Epic)"
base_ref: 08f07f4d (origin/main)
---

# REQ-045 現行成果物体系の整合性網羅監査レポート

> **位置づけ**: 本ファイルは Issue #2370（Wave 1、OU-001）の実行成果物である。REQ-045-001〜009 に基づく一回限りの網羅監査の結果を記録し、横断正規化（#2371、Wave 2）と回帰検査（#2372、Wave 3）への入力として引き渡す。本レポートは正規契約の確定や個別修正の実行を行わない（REQ-045 対象外宣言）。監査時点の HEAD は 08f07f4d（worktree `feature/issue-2370`）。

## 1. 目的と根拠

現行成果物体系全体と現在の正規契約との不一致を、網羅的な監査によって特定する（REQ-045 目的）。正規契約の参照源は次のとおり。

| 正規契約 | 本監査での適用 |
|---|---|
| DEC-009（ADR から Decision への正規成果物モデル移行、accepted） | 観点V1「ADR から Decision への移行残存」の基盤。決定11（過去版 `v2:ADR-*` は維持）、決定14（skill 移行: `agentdev-adr-file-manager` → `agentdev-decision-file-manager` 等） |
| DEC-017（最小トレーサビリティモデルの採用と Artifact Graph の廃止、proposed） | 観点V2「撤去済み Artifact Graph への現行参照」の基盤。Issue #2370 の Execution Contract が監査観点の正規基盤として指定 |
| `docs/designs/authoring/command-file-format.md` | 観点V6「Gxx の書式」、V7「手順表現と工程表現」の基盤 |
| `docs/designs/integrity/integrity-contracts.md`、`docs/designs/responsibilities/document-type-responsibilities.md`、`docs/designs/responsibilities/artifact-responsibilities.md`、`docs/designs/responsibilities/req-impact-map.md`、`docs/designs/integrity/rule-ownership.md` | 観点V8「責務所有者の不一致」、V10「同一契約の複数箇所定義」の基盤 |
| `.opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml`、`retired-artifact-registry.yaml`（検出ビュー。Design が正規） | 観点V3「旧 SPEC/旧 Design パス」の検出データ |
| REQ-013（retired、DOC-MAP 依存除去）、REQ-020/022/023/024/040（retired、Artifact Graph 系）、REQ-028（retired、IR 体系監査） | 廃止成果物の参照検出の基盤 |

**残留リスク**: DEC-017 は status: proposed である。Issue #2370 は DEC-017 を前提契機とする Epic #2369 の子 Issue であるため、本監査は DEC-017 の撤去方針を正として実施した。DEC-017 の受理判断が変更された場合、観点V2 関連の判定は再評価を要する（監査の限界を参照）。

## 2. 保存形式のスキーマ（REQ-045-009 形式要件との対応）

本レポートの各部と REQ-045-009 の形式要件（問題クラス・判定区分・証拠項目）の対応を冒頭に示す。後続 Issue はこの対応に従って参照すること。

| 形式要件 | 本レポートでの所在 |
|---|---|
| 問題クラス（原因別集約、REQ-045-005） | §5 問題クラス一覧（PC-01〜PC-11） |
| 判定区分（pass / fail / blocked / not applicable、REQ-045-003） | §8 ファイル別判定マトリクス（全対象ファイル）、§6 検出事項の各判定欄 |
| 証拠項目（7項目、REQ-045-004） | §6 検出事項明細の各 F-NNN（対象ファイル、該当箇所、現在の記述、正と判断した根拠、問題クラス、修正候補、再発防止可能性） |
| blocked の追加判断事項（REQ-045-007） | §7 blocked 一覧（B-01〜B-06） |
| 引継ぎ可能性（REQ-045-009） | §9 Wave 2・3 引継ぎ集計 |

検出事項 ID（F-NNN）、問題クラス ID（PC-NN）、blocked ID（B-NN）は本レポート内で一意である。行番号は監査時点 HEAD（08f07f4d）の実ファイルに基づく。

## 3. 監査方法

各監査観点を決定的な文字列パターンに写像し、全対象領域へ機械的スイープ（PowerShell `Select-String`）を実行した後、検出ごとに意味トリアージ（現行不整合 / 歴史許容 / プレースホルダー許容 / 検出基盤許容 / blocked）を行った。加えて `check_command_format.ts`、`check_integrity.ts`（いずれも `.opencode/skills/repo-agentdev-integrity/scripts/`）を実行し、検査コード自体の健全性を観点V10 の証拠として収集した。

| 観点（REQ-045-002） | スイープパターン（要約） |
|---|---|
| V1 ADR→Decision 移行残存 | `(?<!v2:)ADR-\d{3}(?!\d)`、`docs/adr/`、`agentdev-adr-file-manager|agentdev-adr-guidelines`、`（ADR）|\(ADR\)` |
| V2 撤去済み Artifact Graph 現行参照 | `agentdev-artifact-graph`、`\.agentdev/graph`、`Artifact Graph` |
| V3 旧 SPEC/旧 Design パス | `docs/specs/`、obsolete-path-map.yaml の old パス語彙 |
| V4 旧 command/skill 名称 | `agentdev-spec-compliance`、`inspect-extensions`、`agentdev-doc-map`、`agentdev-workflow-reporting`、廃止スキル名の語彙表突合 |
| V5 未解決 ID・プレースホルダー | `REQ-\{NNNN\}|DEC-\{N\}|AG-\{NNN\}|QG-\{N\}`、`\b(TODO|FIXME|XXX|HACK)\b`、存在しないパス参照（`.omo/plans/` 等） |
| V6 Gxx 書式・開始番号・欠番・重複・本文参照整合 | `^- \`?G(\d{2})\`?[:：]`（定義抽出）、`\bG\d{2}\b`（参照抽出）、定義順・重複・参照解決の突合 |
| V7 手順表現と工程表現の混在 | `^### Step \d`、`(?<!STEP-)\bStep \d`、`第\d+工程`、`\*\*E\d` |
| V8 責務所有者の不一致 | skill Design 一覧 vs `src/opencode/skills` 実在の突合、command Design vs `src/opencode/commands` 実在の突合、retired REQ 参照（check_integrity 警告を含む） |
| V9 削除済み機能への現行参照 | `DOC-MAP`、`check_graph`、`tombstone`、retired-artifact-registry.yaml の語彙 |
| V10 同一契約の複数箇所定義による矛盾 | `check_command_format.ts`・`check_integrity.ts` 実行結果、command-file-format.md 内部整合、AUTOGEN 突合結果 |

再現例: `Get-ChildItem src/opencode,docs/requirements,docs/designs,.opencode,.agentdev/extensions -Recurse -Include *.md,*.ts,*.yaml -File | Select-String -Pattern 'agentdev-spec-compliance'`

### 分類基準（4値判定と許容条件）

**ファイル単位の判定**（優先順位: blocked > fail > pass）:

| 判定 | 基準 |
|---|---|
| pass | 全観点で検出ゼロ、または検出が全て許容条件に該当 |
| fail | 許容条件に該当しない現行不整合（正規契約違反または正規契約と実態の矛盾）を1件以上含む |
| blocked | 判定に必要な正規契約が不在・内部矛盾し、監査中に確定できない事項を1件以上含む（§7 に追加判断事項を明示） |
| not applicable | ファイル自体が全観点の適用対象外（生成物・ロックファイル・テスト専用 fixture・空マーカー。理由をマトリクスに付記） |

**許容条件**（REQ-045-006 に基づく。これらを「誤分類せず許容」と分類することが TS-003 の検証対象）:

1. 歴史許容: `v2:` プレフィックス付き識別子（DEC-009 決定11）、`retired/` 配下・retired セクション内の記述、置換関係・由来説明として「旧」「廃止」を明示した言及（例: `quality-gates.md` L22「旧 `agentdev-spec-compliance` スキルの…再編成」）、Design Map の関係行、`v2:REQ-*` 引用
2. プレースホルダー許容: テンプレート（`templates/**`、`_template.md`）と本文中の様式例示（`DEC-{N}`、`REQ-{NNNN}-{NNN}` 等、コマンド群で一貫する委譲注記様式）
3. 検出基盤許容: 検査コード・回帰テスト・baseline が検出対象語彙そのものを扱う記述（例: `check_integrity.ts` の retired スキル名配列、`current_refs.test.ts` の `ADR-001` fixture、`ng-baseline.json` の過去検出記録）。ただし検出語彙リストと現行候補列表の区別がつかない文書は別途判断する（F-005）
4. 後方互換許容: 検査コードが廃止経路（`docs/adr/` 等）を「存在しないことの検証」のために保持する記述（IR-025/037/038 は docs/decisions 配下の ADR ファイル禁止等を現行ルールとして保持）

**検出事項（F-NNN）の判定**は同じ4値で、当該検出の確定状態を表す（pass = 許容と確定、fail = 不整合と確定、blocked = 判断保留、not applicable = 観点適用外）。

**問題クラスの集約基準**（REQ-045-005）: 同一の原因メカニズム（移行・廃止・改名時の置換漏れ、規約変更への未追随、生成物の鮮度不全、検査コードの陳腐化）ごとに分類する。表面的な文字列の類似ではなく、なぜその残存が生じたかで束ねる。

## 4. 対象範囲とカバー状況（REQ-045-001、TS-001）

監査対象は REQ-045-001 の列挙に忠実に次の6領域へ分割した。ファイル数は監査時点の実数（計 714。`.agentdev/.gitkeep` を not applicable として明示的に含める）。

| 領域 | パス | ファイル数 |
|---|---|---|
| A1 | `src/opencode/commands/**`（agentdev コマンド 17、README、templates 28） | 45 |
| A2 | `src/opencode/skills/**`（50 スキル、SKILL.md・references・scripts・templates） | 240 |
| A3 | `docs/requirements/**`（現行 38 + retired 9 + README） | 48 |
| A4 | `docs/designs/**`（commands / skills / workflows / 基盤6ドメイン、_template 含む） | 159 |
| A5 | `.opencode/**`（repo docs-check command、plugins/distribution-boundary-guard、repo-agentdev-integrity 全体: data / references / scripts / tests / baselines） | 191 |
| A6 | `.agentdev/extensions/**`（29 yaml）+ `.agentdev/README.md` + `.agentdev/.gitkeep` | 31 |

**対象外とその根拠**: `docs/decisions/**`、`docs/guides/**`、`docs/reports/**`、ルート `README.md` / `AGENTS.md`、`scripts/**`（導入系スクリプト）、`src/opencode-local/**`、`.agentdev/{intake,learning,inspect,backlog,drafts}`（実行時状態データ）は、REQ-045-001 の列挙に含まれないため監査対象外とする（`.agentdev/.gitkeep` は空マーカーとして対象ファイル群に含めた上で not applicable 判定とする）。対象外領域は正規契約の根拠参照として読み込んだ。対象外領域で観測した参考検出（`docs/guides/consumer-project-setup.md` の旧 SPEC パス broken link）は F-017 として参考記録する。

**カバー状況**: 10観点すべてを6領域へ適用した。領域×観点の未実施組み合わせは 0 件である（TS-001 検証済み）。機械的スイープの検出ゼロ観点（例: V2 の `agentdev-artifact-graph` が A3 現行 REQ で 0 件等）も「適用済み・検出なし」として記録する。

## 5. 問題クラス一覧（原因別集約、REQ-045-005）

| 問題クラス | 原因メカニズム | 該当観点 | 検出事項 | 件数(検出) | Wave 2 修正単位の目安 |
|---|---|---|---|---|---|
| PC-01 | ADR→Decision 移行（DEC-009）時の注記・語彙の置換漏れ | V1 | F-001, F-002 | 32 ファイル | 一括置換ではなく注記の意味確認後の個別修正（DEC-009 決定17: 無条件一括置換禁止） |
| PC-02 | スキル廃止・改名（DEC-009 決定14、DEC-006、DEC-017 決定3）時の参照更新漏れ | V4, V9 | F-003〜F-007 | 10 ファイル | 参照先の現行スキル（`agentdev-decision-guidelines`、`agentdev-doc-diagnostics`、`agentdev-traceability` 等）への置換 |
| PC-03 | DOC-MAP 廃止（REQ-013）後の extension context 参照残存 | V9 | F-008 | 6 ファイル | `docs/DOC-MAP.md` 参照の現行索引（`docs/designs/README.md` 等）への更新 |
| PC-04 | Gxx 採番・参照の正規契約そのものの不在（様式のみ規定） | V6 | F-009, F-010, F-027 | blocked 2 件 + 適合確認 1 件 | 正規契約の Design 確定を先行（B-01, B-02） |
| PC-05 | command フォーマット規約の内部矛盾・代表例と検出規則の陳腐化（工程表移行期の規約更新不全） | V7, V10 | F-011〜F-013 | 3 件（うち blocked 1） | 規約の正規形確定（B-03）→ 規約・代表例・検出規則の一体更新 |
| PC-06 | 旧 SPEC パス・語彙（docs/specs/ 世代、SPEC 呼称）の残存 | V3 | F-014〜F-017 | 4 件（参考 1） | 実在パス・現行呼称への置換 |
| PC-07 | retired REQ / proposed Decision への参照整合不全 | V8, V10 | F-018, F-028 | 11 ファイル | 後継 REQ（REQ-010 等）への参照更新、proposed 引用の可否判断（B-06） |
| PC-08 | AUTOGEN 生成物の鮮度不全 | V10 | F-019 | 1 件 | `generate_indexes.ts` 再生成 |
| PC-09 | 検査コード・baseline の陳腐化・過検出 | V10 | F-020〜F-023 | 4 件（blocked 2） | 検出意図の確認（B-04, B-05）→ 検査コード・baseline の更新 |
| PC-10 | baseline 未登録の配布依存境界違反（IR-055 delta） | V10 | F-024, F-025 | 2 件 | 参照の解消または baseline 登録（intake 経由） |
| PC-11 | main HEAD 時点の機械検査 NG 未解決残存（baseline 未管理 25 件） | V10 | F-026 | 1 件（集計） | #2371 での一括解消または baseline 承認 |

## 6. 検出事項明細（REQ-045-004: 証拠7項目）

判定は検出事項単位の確定状態（§3 分類基準）。「該当箇所」の行番号は監査時点 HEAD の実ファイル。

### F-001: 17 コマンドの project extensions 節における孤立（ADR）注記

- **対象ファイル**: `src/opencode/commands/agentdev/{backlog-auto, backlog-review, case-auto, case-close, case-open, case-run, case-update, design-save, inspect-docs, inspect-promote, inspect-skills, intake-capture, intake-from-github, intake-promote, learning-promote, req-define, req-save}.md`（17 ファイル）
- **該当箇所**: 各ファイルの「## project extensions」節（例: `req-define.md` L30、`case-run.md` L18、`req-save.md` L26）
- **現在の記述**: 「…project extension（`.agentdev/extensions/skills/agentdev-workflow-*.yaml`、kind: workflow-extension）を読み込む（ADR）。」
- **正と判断した根拠**: DEC-009 により判断記録文書の正規種別は Decision（`DEC-NNN`）であり、現行体系に ADR という成果物種別は存在しない。対応する project extension 読込契約の正規所有者は `docs/designs/foundations/project-extensions.md`（同 Design に「（ADR）」注記は存在しない）。読込根拠を「（ADR）」とする注記は、移行期の旧種別参照の残存であり、現在の正規契約に対応する参照先を持たない孤立注記である。`v2:` プレフィックスも付かない現行ドキュメント内の言及であるため歴史許容（§3 許容1）に該当しない。
- **問題クラス**: PC-01
- **修正候補**（方向性のみ、確定なし。Wave 2 の入力）: 注記を「（`docs/designs/foundations/project-extensions.md`）」等の Design 参照へ置換するか、根拠参照が不要なら削除する。17 ファイルで同一パターンのため一括対応が可能だが、DEC-009 決定17（文字列一括置換禁止、8 分類後に個別変更）に従い注記の意味を確認してから修正する。
- **再発防止可能性**: 高。移行時の参照置換を検証する機械検査（観点V1 パターン）を docs-check へ追加すれば、`（ADR）` のような種別注記の残存を検出できる。
- **判定**: fail

### F-002: 15 スキルファイルの方針参照（ADR）注記

- **対象ファイル**: `src/opencode/skills/agentdev-{architecture-advisory, backlog-integration, command-authoring, doc-writing, epic-tracker, inspect-skills, learning-capture, quality-gates, req-analysis, req-file-manager, req-structure-diagnostics, skill-authoring, workflow-orchestration}/SKILL.md`（13）、`src/opencode/skills/agentdev-doc-writing/references/spec-writing-quality.md`、`src/opencode/skills/agentdev-epic-tracker/references/regex-and-merge-conflict.md`
- **該当箇所**: 各 SKILL.md の冒頭方針節（例: `agentdev-quality-gates/SKILL.md` L10「本スキルは以下の方針に従う（ADR）。」）、`agentdev-epic-tracker/SKILL.md` L44 の「case-close(#epic) のみが書き込む（ADR）」
- **現在の記述**: 「本スキルは以下の方針に従う（ADR）。」等
- **正と判断した根拠**: F-001 と同一根拠。参照先となる現行 ADR 成果物は存在せず、該当方針の正規根拠は各 skill Design または Decision である。`v2:` なしの現行ファイル内言及のため歴史許容に該当しない。
- **問題クラス**: PC-01
- **修正候補**: 方針の正規根拠（`docs/designs/skills/<skill-name>.md` または `DEC-NNN`）への参照に置換、または根拠種別注記の削除。
- **再発防止可能性**: 高（F-001 と同一の機械検査でカバー可能）。
- **判定**: fail

### F-003: 廃止スキル `agentdev-spec-compliance` への現行参照

- **対象ファイル**: `src/opencode/skills/agentdev-workflow-routing/references/case-update-procedure.md`（L40, L42, L49）、`.../review-ng.md`（L9, L10, L16）、`src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_review_ng.md`（L47）、`src/opencode/skills/agentdev-learning-capture/references/example.md`（L135）、`src/opencode/skills/agentdev-learning-pipeline/references/disposition-and-artifact-schema.md`（L62 近傍）
- **該当箇所**: レビューNG分類フローの入力・委譲先としての言及
- **現在の記述**: 「`agentdev-spec-compliance` の乖離報告から影響度、対象、内容、推奨アクション、理由を抽出する。」等
- **正と判断した根拠**: `src/opencode/skills/` に `agentdev-spec-compliance` ディレクトリは存在しない（全スキル突合で確認）。`docs/designs/quality/quality-gates.md` L22 は「旧 `agentdev-spec-compliance` スキルの…再編成」と「旧」を明示しており歴史許容（§3 許容1）だが、上記5ファイルは現行の入力・委譲先として言及しており、レビューNGフロー（case-update --review-ng）の実行前提として機能しない参照である。実在しないスキルへの現行参照は観点V4（旧 skill 名称）の不整合。
- **問題クラス**: PC-02
- **修正候補**: 現行の乖離検出・分類の実在委譲先（`agentdev-quality-gates` の QG-3、または review 時の判定結果）へ置換し、テンプレート `issue_comment_review_ng.md` の引用形式も更新する。
- **再発防止可能性**: 高。配布物から参照するスキル名の実在検査（IR-058/059 の適用拡大または inspect-skills の参照妥当性診断）で検出可能。
- **判定**: fail

### F-004: `agentdev-adr-guidelines` への実参照残存

- **対象ファイル**: `.opencode/commands/repo/docs-check.md`（L59）、`.opencode/skills/repo-agentdev-integrity/SKILL.md`（L24, L27）
- **該当箇所**: docs-check G08（ADR フィールド検査の manual reference）、非対象一覧の委譲先
- **現在の記述**: 「G08: `agentdev-adr-guidelines`（manual reference）の ADR 構造定義を参照して ADR フィールド検査」「ADR 要否判断（→ `agentdev-adr-guidelines`）」
- **正と判断した根拠**: DEC-009 決定14により `agentdev-adr-guidelines` は `agentdev-decision-guidelines` へ移行済みで、旧スキルの実体は存在しない。docs-check の G08 は検査手続きの参照先として機能しない。なお `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` 内の `agentdev-adr-file-manager` 記述（L312, L322）は廃止スキル名を検出するための語彙配列であり検出基盤許容（§3 許容3）に該当するため本検出から除外する。
- **問題クラス**: PC-02
- **修正候補**: `agentdev-decision-guidelines`（Decision 要否判断）および Decision 構造定義の正規参照（`docs/designs/foundations/decision-lifecycle.md` 等）への置換。
- **再発防止可能性**: 高。repo-local 成果物も含めた旧スキル名参照検査（IR-021 の適用範囲確認）で検出可能。
- **判定**: fail

### F-005: 語彙レジストリの旧スキル語彙列挙

- **対象ファイル**: `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md`
- **該当箇所**: スキル名語彙表（L98 `agentdev-adr-file-manager`、L100 `agentdev-adr-guidelines`、L107 `agentdev-doc-map`。L135 `issue-completion-reporting` → `agentdev-workflow-reporting` 行は「廃止済み skill」注記付き）
- **現在の記述**: 「IR-050・IR-051 の対象 skill 名（`agentdev-*` プレフィックス形式）。`load_skills=["..."]` へ指定可能な識別子。」として廃止済みスキル名を実行候補として列挙
- **正と判断した根拠**: 同表の冒頭定義は「`load_skills` へ指定可能な識別子」であり、実在しないスキル名（`agentdev-adr-file-manager`、`agentdev-adr-guidelines`、`agentdev-doc-map`）は指定可能な識別子ではない。L135 の `agentdev-workflow-reporting` 行は「廃止済み skill」と注記があり歴史許容だが、残る3語は注記なしの列挙であり、`load_skills` 実行時の不正指定を誘導する陳腐化した語彙表である。
- **問題クラス**: PC-02
- **修正候補**: 実在スキルのみの列挙に更新し、廃止語は検出語彙（IR-021 系）として別表化する。
- **再発防止可能性**: 中。語彙表と `src/opencode/skills` 実在の突合を docs-check に追加すれば検出可能。
- **判定**: fail

### F-006: 成果物責任表の `agentdev-doc-map` 参照

- **対象ファイル**: `docs/designs/responsibilities/artifact-responsibilities.md`
- **該当箇所**: L62
- **現在の記述**: 「`agentdev-doc-diagnostics` は `agentdev-doc-writing`（文意品質）、`agentdev-doc-map`（探索順）、…」
- **正と判断した根拠**: `agentdev-doc-map` は REQ-013（retired、DOC-MAP 依存除去）により廃止されたスキルであり実在しない。責務連携の現行参照として残存している。同ファイル L56 の `agentdev-doc-diagnostics` 行自体は現行スキルの記述であり、旧スキルとの混在は観点V4/V8 の不整合。
- **問題クラス**: PC-02
- **修正候補**: 探索順の現行参照（`docs/designs/README.md` 索引または当該 Design）へ置換。
- **再発防止可能性**: 高（F-003 と同じ実在突合で検出可能）。
- **判定**: fail

### F-007: 機械置換規則表の `agentdev-artifact-graph` 残存セル

- **対象ファイル**: `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md`
- **該当箇所**: L95（表セル）、L99（経緯記述）
- **現在の記述**: 「| agentdev-artifact-graph SKILL.md（問い合わせプロファイル表の探索方向列） | 1 | N/A プレースホルダ | 置換対象（残存） |」
- **正と判断した根拠**: DEC-017 決定3により `agentdev-artifact-graph` は廃止され、`src/opencode/skills/` に実体は存在しない。L99 は「導入時検証での検出漏れを示す事例として扱う」と自己申告済みだが、置換対象表の現行エントリとして残存しており、同表が参照する置換済み対象は存在しない。観点V2（撤去済み Artifact Graph への現行参照）に該当する。
- **問題クラス**: PC-02
- **修正候補**: 残存セルの解消（実体削除済みのため「解消済み」への更新）と経緯記述の歴史注記化。
- **再発防止可能性**: 高。廃止スキル名の横断検索（観点V2 パターン）で検出可能。
- **判定**: fail

### F-008: extension 定義の DOC-MAP 参照残存

- **対象ファイル**: `.agentdev/extensions/skills/agentdev-workflow-{backlog-review, case-close, design-save, inspect-docs, req-define, req-save}.yaml`（6 ファイル、9 箇所）
- **該当箇所**: 各 yaml の `context` セクション（例: `agentdev-workflow-req-define.yaml` L9, L44、`agentdev-workflow-case-close.yaml` L9, L26）
- **現在の記述**: 「purpose: "REQ/ADR/Design/guides/DOC-MAP の責務マトリックスと探索入口の確認"」「purpose: "docs/DOC-MAP.md 経由で関連 Design を探索してよい"」等
- **正と判断した根拠**: `docs/DOC-MAP.md` は存在せず、REQ-013（retired）により DOC-MAP 依存は除去済みである。extension の `context.paths` に実在しないパスへの探索許可が残存しており、実行時の文書探索を不正な経路へ誘導する。観点V9（削除済み機能への現行参照）に該当する。併せて「REQ/ADR/Design/guides」の種別列挙も旧体系語（現行は Decision）である。
- **問題クラス**: PC-03
- **修正候補**: 目的の現行化（`docs/designs/README.md`、`docs/designs/responsibilities/document-model.md` 系の参照）と `docs/DOC-MAP.md` パスの除去。
- **再発防止可能性**: 高。extension `context.paths` の実在検査（check_extensions.ts の拡張）で検出可能。
- **判定**: fail

### F-009: Gxx 採番規則（開始番号・欠番）の正規契約不在 — blocked

- **対象ファイル**: `docs/designs/authoring/command-file-format.md`（規定側）、`src/opencode/commands/agentdev/*.md` 17 ファイル（適用側）
- **該当箇所**: 規定は L57「ガードレール番号は `G` + ゼロ埋め2桁（`G01`, `G02`, ..., `G99`）形式に統一する」のみ。適用側の定義抽出結果（監査データ）: `req-define.md` は G03/G04/G08 で G01 開始でない、`case-open.md` は G23/G25 のみ、`case-update.md` は G08 のみ、`case-close.md` は G01/G04/G08/G12/G17/G21/G24/G27 で欠番あり、他多数（17 ファイル中 15 ファイルが非 G01 開始または欠番を持つ）。定義の重複は 0 件、参照は全ファイルで定義へ解決済み（F-027 参照）
- **現在の記述**: 様式（G+2桁）のみ規定し、開始番号・連番・欠番の可否を規定しない
- **正と判断した根拠**: 「G01 開始・連番必須」という契約は command-file-format.md に存在せず、他の正規契約（patterns.md、quality-specs.md 等）にも G 採番規則は確認できない。欠番・非 G01 開始が違反か許容か（歴史的にガードレールを削除した結果の欠番か）を正規契約から確定できないため、監査中に独断で確定しない（REQ-045-007）。
- **問題クラス**: PC-04
- **追加判断事項**: B-01（§7）
- **修正候補**: 採番規則（連番必須 vs 欠番許容、コマンド単位の番号空間の明文化）を Design として確定した上で、全コマンドの G 番号を照合する。
- **再発防止可能性**: 規則確定後、G 番号抽出・連番検査を docs-check に追加すれば機械検査可能。
- **判定**: blocked

### F-010: Gxx・工程ラベル参照の修飾規定の不備 — blocked

- **対象ファイル**: `src/opencode/skills/agentdev-workflow-design-save/SKILL.md`（L42「G02」、L44「G12」）、`src/opencode/skills/agentdev-design-file-manager/SKILL.md`（L61, L129「G06」）、`src/opencode/skills/agentdev-project-extensions/SKILL.md`（L243 G05、L244 G07: スキル自身の定義）、`.opencode/commands/repo/docs-check.md`（G01〜G08: repo-local 独自定義）
- **該当箇所**: Workflow Skill / Capability Skill から command の G 番号を参照する箇所、およびスキル自身が G 番号を定義する箇所
- **現在の記述**: 「`docs/designs/**` と `.agentdev/drafts/**` のみ作成・編集（G02。）」等の裸参照、スキル独自の G05/G07 定義
- **正と判断した根拠**: `command-file-format.md` L126-130（順序ラベル様式）は「Workflow Skill から command の公開ラベルを参照する際は command 名で修飾する（例: 「req-save command STEP-4」）。command 名なしの裸参照はしない」と工程ラベル参照の修飾を規定するが、G 番号参照への適用、およびスキル側・repo-local command 側で G 番号を新たに定義してよいか（番号空間の所在）は規定していない。現状の裸参照・スキル内定義が違反か許容かを正規契約から確定できない。
- **問題クラス**: PC-04
- **追加判断事項**: B-02（§7）
- **修正候補**: G 番号の番号空間（command 単位かスキル横断か）と参照修飾形式を Design として確定する。
- **再発防止可能性**: 規則確定後に機械検査化可能。
- **判定**: blocked

### F-011: コマンドフォーマット規約の内部矛盾（工程表規定 vs 主手順 Step 必須）— blocked

- **対象ファイル**: `docs/designs/authoring/command-file-format.md`
- **該当箇所**: L52-53「手順セクション形式」節と L107-111「代替フロー内サブステップ表現」節の注意
- **現在の記述**: L52「手順セクションは `### Step N` 見出しの逐次列挙に代え、各工程を前提条件・出力契約・検証基準の表形式（前得出出力検証表）で記述する。」に対し、L109「`**EN.**` 形式は代替フロー専用であり、主手順の Step 表現として使用しない（主手順は `### Step N: タイトル` 見出しを必ず使用する）」、L111「公開 `/agentdev/*` コマンドでは主手順の手順列挙を `### Step N` 形式で表現する前提のため、`**EN.**` lettered prefix 形式を使用しない」
- **正と判断した根拠**: 同一 Design 内で「`### Step N` を使わず表形式とする（L52）」と「主手順は `### Step N` 見出しを必ず使用（L109, L111）」が矛盾する。現行17コマンドの実態は表形式（`### Step` 見出し 0 件、工程表 17/17）であり L52 側に合致するが、正規契約自体が両説を併記しているためどちらを正とすべきかを文書内から確定できない。観点V10（同一契約の複数箇所定義による矛盾）に該当する。
- **問題クラス**: PC-05
- **追加判断事項**: B-03（§7）
- **修正候補**: 実態（工程表）を正とする場合は L107-111 の注意文を代替フロー説明の文脈へ再構成し、`**EN.**` 規定自体の存続要否も併せて確定する（F-012 参照）。
- **再発防止可能性**: 中。Design の見出し規定と実コマンドの突合（工程表様式の肯定検査）を docs-check に追加すれば、規約と実態の乖離を検出できる。
- **判定**: blocked

### F-012: `**EN.**` 代表例の陳腐化

- **対象ファイル**: `docs/designs/authoring/command-file-format.md`
- **該当箇所**: L104「**代表例**: `case-close.md` の Epic Wave クローズフロー（`**E1.**` 〜 `**E6.**`、`**E6a.**` / `**E6b.**` 細分）。」
- **現在の記述**: case-close.md に `**EN.**` 形式の代表例が存在するという記述
- **正と判断した根拠**: 監査時点の `src/opencode/commands/agentdev/*.md` 全 17 ファイルおよび repo-local command で `**E\d` パターンは 0 件である。case-close.md の Epic Wave クローズは工程表・Epic Wave 手順節で記述されており、代表例として挙げる実体が存在しない。観点V10（規約と実態の矛盾）。
- **問題クラス**: PC-05
- **修正候補**: F-011 の正規形確定に合わせて、`**EN.**` 規定節全体（使用実績 0 件）の存続または削除を確定する。
- **再発防止可能性**: 中。代表例・サンプル参照の実在検査（`**E\d` の走査）で検出可能。
- **判定**: fail

### F-013: 検出規則（IR-028/029）の工程表様式非対応

- **対象ファイル**: `.opencode/skills/repo-agentdev-integrity/data/command-format-rules.yaml`、`docs/designs/authoring/command-file-format.md`（L62-71 機械検査対象）
- **該当箇所**: command-format-rules.yaml の `top_level_step_rules`（`### Step N:` 形式を前提）、command-file-format.md L71「従来の Step 0 検出・非連番検出・numbered list 主手順検出は前出出力検証表様式への移行に合わせて更新または廃止する」
- **現在の記述**: `heading_regex: "^###\\s+Step\\s+(\\d+)..."` による検査規則。実行結果は `check_command_format.ts` OK（見出しが存在しなければ検査対象なし）
- **正と判断した根拠**: 現行17コマンドは工程表形式で `### Step N` 見出しを持たないため、IR-028/029 の検出規則は実コマンドに対して実質的に空振りする。規約側（L71）は工程表移行に合わせた更新を宣言しているが、検出規則側は旧様式のまま残存している。観点V10（検出ビューと正規契約・実態の不整合）。ただし L71 自体が「更新または廃止する」と未完了を宣言しているため、優先度判断を含む。監査としては検出規則の陳腐化を事実として記録する。
- **問題クラス**: PC-05
- **修正候補**: 工程表様式の検査（表の列構成・工程ラベル連番）へ置換するか、L71 の宣言に従い廃止する。B-03 の正規形確定に依存する。
- **再発防止可能性**: 中。検出規則と規約本文の対応突合（canonical_source 一致検査）で検出可能。
- **判定**: fail

### F-014: obsolete-path-map の存在しない新パスエントリ

- **対象ファイル**: `.opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml`
- **該当箇所**: `docs/specs/quality/spec-health-metrics.md` → `docs/designs/quality/spec-health-metrics.md` エントリ（L91-93、L169-171 の2箇所）
- **現在の記述**: new パスとして `docs/designs/quality/spec-health-metrics.md` を登録
- **正と判断した根拠**: `docs/designs/quality/` の実ファイルは `design-health-metrics.md` であり `spec-health-metrics.md` は存在しない。旧パス対応表の移行先として存在しないパスを登録している。観点V3（旧 SPEC パス体系の残存）。
- **問題クラス**: PC-06
- **修正候補**: エントリの new を `docs/designs/quality/design-health-metrics.md` へ更新する。
- **再発防止可能性**: 高。obsolete-path-map の old/new 双方の実在検査（new 側は必ず実在）で検出可能。
- **判定**: fail

### F-015: REQ-010-059 の旧ファイル名表記

- **対象ファイル**: `docs/requirements/REQ-010.md`
- **該当箇所**: L29（REQ-010-059 要件行）
- **現在の記述**: 「docs-check または CI は AUTOGEN ブロック（spec-health-metrics.md 等）の鮮度を検出し、…」
- **正と判断した根拠**: 実ファイルは `docs/designs/quality/design-health-metrics.md` であり、`spec-health-metrics.md` は存在しない旧名称（F-014 と同根。Design ドメイン再編時の rename 漏れ）。観点V3。
- **問題クラス**: PC-06
- **修正候補**: `design-health-metrics.md` への表記更新。
- **再発防止可能性**: 高。REQ 本文内のファイル参照の実在検査で検出可能。
- **判定**: fail

### F-016: extension id の旧 SPEC 語彙

- **対象ファイル**: `.agentdev/extensions/skills/agentdev-inspect-skills.yaml`
- **該当箇所**: L11 `- id: agentdev-gh-cli-spec`
- **現在の記述**: context エントリの id として `agentdev-gh-cli-spec`（paths は `docs/designs/skills/agentdev-gh-cli.md` を正しく指す）
- **正と判断した根拠**: 参照先 Design は `agentdev-gh-cli.md` であり、「-spec」は旧 SPEC 呼称の残存。現行体系に SPEC 種別は存在しない。id は意味的ラベルであるが、旧種別語彙の残存は観点V3（旧 SPEC 語彙）に該当する。
- **問題クラス**: PC-06
- **修正候補**: id を `agentdev-gh-cli-design` 等の現行語彙へ変更。
- **再発防止可能性**: 中。extension id の語彙検査（spec 語の検出）で検出可能。
- **判定**: fail

### F-017: 対象外領域（guides）の旧 SPEC パス broken link（参考記録）

- **対象ファイル**: `docs/guides/consumer-project-setup.md`（監査対象外領域。check_integrity.ts 実行で観測）
- **該当箇所**: `../specs/local/runtime-package-boundary.md` 等への markdown リンク 5 箇所
- **現在の記述**: `docs/specs/local/...` 世代のパスへのリンク（実在せず broken）
- **正と判断した根拠**: `docs/specs/` 配下は現行体系で存在せず、正しくは `docs/designs/local/...`。check_integrity.ts が NG として検出（baseline 未管理）。
- **問題クラス**: PC-06
- **修正候補**: 現行パス（`../designs/local/...`）への更新。
- **再発防止可能性**: 高（IR-057 の対象を guides へ拡張するか、check_integrity の link 検査で検出可能）。
- **判定**: fail（対象外領域の参考記録。本監査のファイル判定マトリクスには含めない）

### F-018: retired REQ-028 への参照残存（10 Design）

- **対象ファイル**: `docs/designs/foundations/document-model.md`、`docs/designs/integrity/{checker-execution-contracts, integrity-contracts, integrity-rule-catalog, rule-ownership}.md`、`docs/designs/integrity/rules/{IR-044-req-spec-boundary-violation-detection, IR-055-runtime-unresolved-reference, IR-062-reference-path-existence}.md`、`docs/designs/responsibilities/req-impact-map.md`、`docs/designs/skills/agentdev-doc-diagnostics.md`（10 ファイル）
- **該当箇所**: 各ファイルの参照節・要件根拠（check_integrity.ts の `retired-req-primary-ref` / `retired-req-as-current` 検出による。warning 10 件 + 1 件）
- **現在の記述**: REQ-028（retired）を正規根拠・一次参照として引用
- **正と判断した根拠**: REQ-028 は DEC-013（IR 登録モデルの簡素化）に伴い retired されており、retired REQ を現行 Design の一次参照として使うことは REQ インデックスの基準（「廃止済み要件のIDは再利用しない」、文書間矛盾時は現行 REQ 優先）および IR-015 相当の後継参照原則に反する。後継は REQ-010（docs-check）である。観点V8（責務所有者の不一致: 廃止成果物を現行根拠に使用）。
- **問題クラス**: PC-07
- **修正候補**: REQ-010（および該当する現行 Design）への参照更新。
- **再発防止可能性**: 高。既に check_integrity が検出しているため、baseline 登録と解消で対処可能。
- **判定**: fail

### F-019: AUTOGEN ブロックの鮮度不全

- **対象ファイル**: `docs/designs/quality/req-health-metrics.md`
- **該当箇所**: L105 から始まる `req-metrics-measurement-example` AUTOGEN ブロック
- **現在の記述**: ブロック内の行が実ファイル由来と不一致（current 39 行 vs expected 42 行、first mismatch: REQ-030 行と REQ-010 行のずれ）
- **正と判断した根拠**: check_integrity.ts（IR-061）が NG として検出（`index-generation-consistency`、baseline 未管理）。AUTOGEN ブロックは実ファイルから再生成されるべき正規生成物であり、鮮度不全は生成物と実態の矛盾である。観点V10。
- **問題クラス**: PC-08
- **修正候補**: `bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` による再生成。
- **再発防止可能性**: 既に機械検査済み（IR-061）。baseline 承認と再生成で対処可能。
- **判定**: fail

### F-020: workflow-status-prohibition 検出の過検出候補 — blocked

- **対象ファイル**: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（検出側）。検出対象: `docs/designs/commands/design-save.md`（L93）、`docs/designs/foundations/system.md`（L172）、`docs/designs/responsibilities/artifact-contracts.md`（L124）
- **該当箇所**: LifecycleBoundary カテゴリの `workflow-status-prohibition` 検出（phase 語と status 語の共存ヒューリスティック）
- **現在の記述**: 検出証拠は「Design ファイルの基本frontmatterは title、status、created、updated の4キーとし、伝播フィールドを Design ファイルへ宣言として書き込まない。」等の Design ファイル様式規定
- **正と判断した根拠**: 検出された3文は Design ファイル自身の frontmatter 様式（`patterns.md` 体系）の規定であり、ワークフロー状態管理（6 micro-phase）の定義ではない可能性が高い。しかし同検出の意図（どの語の組み合わせを禁止するのか）は検出コードとルール定義の精査を要し、監査中に過検出と確定すると検査設計判断を代行することになる。対象3ファイルは正規契約（Design frontmatter 様式）と適合しているためファイル判定は pass とし、検出コード側の問題として判断を留保する。
- **問題クラス**: PC-09
- **追加判断事項**: B-04（§7）
- **修正候補**: 検出パターンの精査（frontmatter 様式規定の除外）または意図的に対処優先度を下げる運用。
- **再発防止可能性**: 検出意図の文書化（IR ルール側への検出条件明記）で予防可能。
- **判定**: blocked

### F-021: ng-baseline の ADR 系死蔵エントリ（許容確認）

- **対象ファイル**: `.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json`
- **該当箇所**: `category: ADR` 系エントリ（ADR-001〜005 の README 索引・status 系、理由: "Stage 5 v2→v3 migration structural consequence"）
- **現在の記述**: `docs/adr/` 世代の検出記録を baseline として保持
- **正と判断した根拠**: baseline は過去検出の記録であり、`docs/adr/README.md` が存在しない現行構成ではこれらの検出は再発しないため実害はない。歴史記録として許容できるが、エントリの意図的な整理（削除）は後続で判断する価値がある。検出基盤許容（§3 許容3・4）。
- **問題クラス**: PC-09
- **修正候補**: 死蔵エントリの整理（任意）。
- **再発防止可能性**: baseline の由来分類（AUDIT-NG21-PROVENANCE 運用）で管理可能。
- **判定**: pass（許容と確定）

### F-022: generate_indexes.ts の ADR AUTOGEN 生成経路の出力先不在

- **対象ファイル**: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`
- **該当箇所**: L514-529（`collectAdrFiles`、`docs/adr/` 配下の収集）、L700-705（`adr-baseline-*` / `adr-status-*` ブロック ID）、L1293-1294（`adrDir = path.join(root, "docs", "adr")`）
- **現在の記述**: `docs/adr/README.md` へ AUTOGEN ブロックを生成する経路を保持
- **正と判断した根拠**: `docs/adr/` ディレクトリは DEC-009 移行により存在せず、ADR README AUTOGEN 生成は出力先を持たない死蔵経路である。ADR ID 桁数保持の回帰テスト（`regression_adr_id_width.test.ts`）は fixture を使うため実経路に依存しない。観点V10（検査コードと現行構造の不整合）。DEC-009 決定12は旧 current ADR 契約（`docs/adr/`）を通常経路で生成しないことを定めており、生成経路の残存は移行完了後の残置である。
- **問題クラス**: PC-09
- **修正候補**: ADR README 生成経路（adr-baseline-* / adr-status-* ブロック出力）の削除。IR-025（docs/decisions 配下の ADR ファイル禁止）等の検査経路は B-05 で別途判断する。
- **再発防止可能性**: 中。死蔵コード経路の検出は困難なため、移行完了時のクリーンアップ手順（移行 Issue の完了条件にコード経路削除を含める）で予防する。
- **判定**: fail

### F-023: check_integrity.ts の ADR 互換検査経路の存続要否 — blocked

- **対象ファイル**: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- **該当箇所**: `docs/adr/` 参照（9 箇所）、`adr-readme-index` 検出（"ADR README.md not found" INFO）、`ADR-\d{3}` 抽出経路
- **現在の記述**: ADR 0 件のスキャン結果・ADR README 不在 INFO の出力を含む検査経路
- **正と判断した根拠**: 一方で IR-025（`docs/decisions/` 配下の `ADR-\d{4,}.md` 禁止）・IR-037（retired ADR の現行基盤引用禁止）は現行ルールとして ADR 互換検査を正当化する。他方で `docs/adr/` ディレクトリ自体の走査・ADR README 索引検査は廃止経路への検査であり、どの範囲まで後方互換として保持するかは検査設計の判断である。監査では正当部分と死蔵部分の切分けを確定しない。
- **問題クラス**: PC-09
- **追加判断事項**: B-05（§7）
- **修正候補**: IR-025/037/038 が必要とする範囲（docs/decisions 配下の検査）を残し、`docs/adr/` 経路の走査を削除する方向で整理する。
- **再発防止可能性**: 中。検査経路と IR ルール定義の対応表（IR-023 の drift 検査の適用）で管理可能。
- **判定**: blocked

### F-024: baseline 未登録の repo-* 参照（IR-055 新規違反）

- **対象ファイル**: `src/opencode/skills/agentdev-project-extensions/scripts/README.md`
- **該当箇所**: L29-30（repo-local deterministic checker の説明）
- **現在の記述**: 「repo-local deterministic checker（`.opencode/skills/repo-agentdev-integrity/scripts/check_extensions...`」等の repo-* 参照
- **正と判断した根拠**: check_integrity.ts（IR-055）が「New strict violation: repo-* reference」として baseline 未管理の新規違反として検出（exit=1 要因）。配布物（`src/opencode/**`）から repo-local 成果物への参照は consumer 環境で解決不能な参照を禁じる配布依存境界（REQ-029、DEC-014）に反する。
- **問題クラス**: PC-10
- **修正候補**: 参照の抽象化（相対 import が実在する旨の記述方法の変更）または baseline 承認登録。
- **再発防止可能性**: 既に機械検査済み（IR-055）。
- **判定**: fail

### F-025: baseline 未登録の docs/designs/ 参照（IR-055 delta）

- **対象ファイル**: `src/opencode/skills/agentdev-traceability/SKILL.md`
- **該当箇所**: L53
- **現在の記述**: `docs/designs/` への参照
- **正と判断した根拠**: check_integrity.ts が baseline 差分（delta）の heuristic 違反として検出。同種の baseline-known 違反は大量に存在するが、本箇所は baseline 未登録の新規出現である。配布依存境界の heuristic（consumer 環境で解決不能な参照の回避）に照らして記録する。
- **問題クラス**: PC-10
- **修正候補**: 参照の修飾（自己ホスト文書である旨の明示）または baseline 登録。
- **再発防止可能性**: 既に機械検査済み（IR-055）。
- **判定**: fail

### F-026: main HEAD 時点の機械検査 NG 未解決残存（集計記録）

- **対象ファイル**: 監査対象体系全体（`.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` 実行結果）
- **該当箇所**: 実行結果: exit=1、「25 new unmanaged NG (delta, exit code driver)」（内訳: IR-055 新規違反（F-024, F-025 含む）、workflow-status-prohibition 3 件（F-020）、guides broken link 5 件（F-017）、AUTOGEN 不整合 1 件（F-019）、その他 delta）
- **現在の記述**: main HEAD（08f07f4d）の時点で機械検査が未解決 NG を抱えている状態
- **正と判断した根拠**: 監査実行時の実測（`bun run check_integrity.ts`、2026-08-22）。baseline 未管理の NG が残存する状態は、正規契約との未解決不一致が機械検査レベルで存在することを示す観察事実である。
- **問題クラス**: PC-11
- **修正候補**: #2371（横断正規化）での一括解消、または intake 経由の baseline 承認。個々の内容は対応する F-NNN に分解済み。
- **再発防止可能性**: baseline 運用（由来分類・承認）で管理可能。
- **判定**: fail（集計記録。個別は各 F へ分解）

### F-027: Gxx の様式・本文参照整合の適合確認（適合側の証拠）

- **対象ファイル**: `src/opencode/commands/agentdev/*.md` 17 ファイル
- **該当箇所**: 全 G 番号定義（`- Gxx: ...` 形式）と本文内参照
- **現在の記述**: 様式は全定義で `G` + ゼロ埋め2桁に適合。定義の重複は 0 件。本文中の G 番号参照は全て同一ファイル内の定義へ解決される（未解決参照 0 件）
- **正と判断した根拠**: 監査スイープによる抽出・突合（定義抽出パターン `^- \`?G\d{2}\`?[:：]` と参照抽出パターン `\bG\d{2}\b` の差分が 0）。観点V6 のうち「書式」「重複」「本文参照整合性」は適合、「開始番号」「欠番」は F-009（blocked）として区分した。
- **問題クラス**: PC-04（適合側の記録）
- **修正候補**: なし（適合を維持する前提で B-01 の規則確定後に再確認）。
- **再発防止可能性**: F-009 と同じ機械検査で維持可能。
- **判定**: pass

### F-028: proposed Decision（DEC-017）の現行基盤引用 — blocked

- **対象ファイル**: `docs/designs/README.md`
- **該当箇所**: traceability-model.md 行等の `（REQ-012、DEC-017）` 記述、skills 一覧の `agentdev-traceability` 行（check_integrity の `accepted-adr-only-citation` WARNING 1 件）
- **現在の記述**: status 列では proposed と明示した上で、DEC-017 を現行設計の根拠として引用
- **正と判断した根拠**: 「現行根拠には accepted Decision のみを引用する」検査基準（accepted-adr-only-citation）と、DEC-017 が proposed である事実が衝突する。ただし本監査自体が Epic #2369 の前提として DEC-017 を正としており（§1 残留リスク）、README の引用を不整合と確定すると監査の前提と矛盾する。引用の可否は DEC-017 の受理判断に依存するため確定しない。
- **問題クラス**: PC-07
- **追加判断事項**: B-06（§7）
- **修正候補**: DEC-017 の受理（status 昇格）または引用表現の調整。
- **再発防止可能性**: 既に機械検査済み。
- **判定**: blocked

## 7. blocked 一覧（REQ-045-007: 追加判断事項）

| blocked ID | 対応検出事項 | 事項 | 追加で必要な判断（判断主体） |
|---|---|---|---|
| B-01 | F-009 | Gxx 採番規則（開始番号・連番・欠番の可否）が正規契約として存在しない | G 採番規則の Design 確定。欠番は残置か再採番か（設計判断。Wave 2 実施前に確定が必要） |
| B-02 | F-010 | Gxx・工程ラベル参照の修飾形式と、スキル・repo-local 側の G 番号定義の可否が規定されない | 番号空間の所在と参照修飾形式の Design 確定（設計判断） |
| B-03 | F-011, F-012, F-013 | command-file-format.md が工程表形式（L52）と主手順 `### Step N` 必須（L109-111）を併記し矛盾する。`**EN.**` 規定・検出規則（IR-028/029）の処遇も连带する | 正規形（実態の工程表を正とするか）の確定と、規約・代表例・検出規則の一体更新方針（設計判断。Wave 2 の前提） |
| B-04 | F-020 | workflow-status-prohibition 検出が Design frontmatter 様式規定を検出している（過検出候補） | 検出意図（禁止対象の語組み合わせ）の確認と除外条件の確定（検査設計判断） |
| B-05 | F-022, F-023 | check_integrity.ts / generate_indexes.ts の ADR 互換検査・生成経路のうち、`docs/adr/` 経路をどこまで保持するか | IR-025/037/038 が正当化する範囲の確定（検査設計判断） |
| B-06 | F-028 | docs/designs/README.md が proposed の DEC-017 を現行根拠として引用する可否 | DEC-017 の受理判断（status 昇格）または引用表現の調整（ユーザー/意思決定工程） |

blocked 項目は REQ-045-007 に従い監査中に確定しない。Issue #2370 の Execution Contract（scope-affecting impact candidate）に従い、後続 Wave（REQ-046-009 の blocked 報告経路）へ入力として引き継ぐ。

## 8. ファイル別判定マトリクス（REQ-045-003）

（このセクションは機械生成により追記される。全 713 ファイルの判定と、not applicable の理由を含む。）

判定集計: pass 639 / fail 64 / blocked 3 / not applicable 8 / 計 714

| 領域 | ファイル | 判定 | 根拠（F-NNN / B-NN）または not applicable 理由コード |
|---|---|---|---|
| A6 | .agentdev/.gitkeep | not applicable | empty-marker |
| A6 | .agentdev/extensions/skills/agentdev-adversarial-review.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-backlog-integration.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-command-authoring.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-doc-writing.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-epic-tracker.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-inspect-skills.yaml | fail | F-016 |
| A6 | .agentdev/extensions/skills/agentdev-learning-capture.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-quality-gates.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-req-analysis.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-req-file-manager.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-req-structure-diagnostics.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-skill-authoring.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-backlog-review.yaml | fail | F-008 |
| A6 | .agentdev/extensions/skills/agentdev-workflow-case-auto.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-case-close.yaml | fail | F-008 |
| A6 | .agentdev/extensions/skills/agentdev-workflow-case-open.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-case-run.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-case-update.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-design-save.yaml | fail | F-008 |
| A6 | .agentdev/extensions/skills/agentdev-workflow-inspect-docs.yaml | fail | F-008 |
| A6 | .agentdev/extensions/skills/agentdev-workflow-inspect-promote.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-inspect-skills.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-intake-capture.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-intake-from-github.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-intake-promote.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-orchestration.yaml | pass | - |
| A6 | .agentdev/extensions/skills/agentdev-workflow-req-define.yaml | fail | F-008 |
| A6 | .agentdev/extensions/skills/agentdev-workflow-req-save.yaml | fail | F-008 |
| A6 | .agentdev/README.md | pass | - |
| A5 | .opencode/commands/repo/docs-check.md | fail | F-004 |
| A5 | .opencode/commands/repo/templates/docs-check/standard.md | pass | - |
| A5 | .opencode/plugins/bun.lock | not applicable | lockfile |
| A5 | .opencode/plugins/distribution-boundary-guard.ts | pass | - |
| A5 | .opencode/plugins/lib/distribution-boundary-guard-evaluators.ts | pass | - |
| A5 | .opencode/plugins/lib/distribution-boundary-guard-parser.ts | pass | - |
| A5 | .opencode/plugins/lib/distribution-boundary-guard-paths.ts | pass | - |
| A5 | .opencode/plugins/lib/distribution-boundary-guard-reconstruction.ts | pass | - |
| A5 | .opencode/plugins/package.json | pass | - |
| A5 | .opencode/plugins/tests/distribution-boundary-guard.test.ts | pass | - |
| A5 | .opencode/plugins/tsconfig.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/baselines/exemptions.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/baselines/ir-059-baseline.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/baselines/lint-skills-baseline.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/data/command-format-rules.yaml | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/data/delegation-contract-patterns.yaml | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/data/distribution-targets.yaml | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml | fail | F-014 |
| A5 | .opencode/skills/repo-agentdev-integrity/data/retired-artifact-registry.yaml | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/references/gate-levels.md | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/references/remediation-routing.md | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md | fail | F-005 |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/.gitignore | not applicable | gitignore |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/backlog_auto_fanin_contract.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/bun.lock | not applicable | lockfile |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_command_format.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_command_format.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_delegation_contract_residual.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary_cli.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_executor_notation.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_extensions.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts | blocked | B-05 (F-023) |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_reference_paths.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_retired_artifact_residual.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_skill_rename_symmetry.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_skill_rename_symmetry.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_templates.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_templates.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_test_impact.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_test_impact.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_workflow_preventive.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/check_workflow_preventive.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/cli_utils.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/cli_utils.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/command_fixtures.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/commands_e2e.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/commands_error_cases.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/commands_structure.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/current_refs.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/current_refs.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/distribution_boundary_routing_contract.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts | fail | F-022 |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/ir057_history_exemption.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-baseline.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-detector.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-exemptions.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-fs.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-patterns.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-rules.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-text-binary.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-types.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lib/glob_walk.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/package-release-archive.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/package.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/race-worker.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/regression_adr_id_width.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/regression_decision_readme.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/regression_history_record_exemption.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/regression_ir057_rule_exemption.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/regression_issue616.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/regression_lifecycle_review_false_positive.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/regression_mapping_table_contract_removed.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/regression_req_id_width_generator.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/regression_req_id_width.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/skills_structure.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/templates_structure.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/check_integrity.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/fixtures/design-principles.md | not applicable | test-fixture |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/fixtures/REQ-0101.md | not applicable | test-fixture |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/traceability_check.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/traceability_coverage.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/traceability_declarations.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/traceability_impact.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/traceability_integration.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/traceability_verification_scope.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tests/traceability_workflow_integration.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tim_declarations_contract.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/.gitignore | not applicable | gitignore |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/archive-builder.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/archive-builder.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/archive-installed-verifier.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/archive-publish.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/archive-verify.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/archive-zip.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/batched-reads.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/blob-loader.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/blob-loader.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/bootstrap-report.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/bootstrap-report.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-candidate-model.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-candidate-model.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-candidate-ownership.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-docs-path-parser.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-fresh-review-v2.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-fresh-review.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-gate-bounds.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-gate.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-ownership.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-parser-bounds.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-pipeline-evasion.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-pipeline-helpers.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-pipeline.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-pipeline.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-reconstruction.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v5-authority.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v5-depth.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v5-encoded.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v5-rejection.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v5-url-ownership-path.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v5-url-ownership-pipeline.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v5-url-scheme.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v5-url-terminator.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v6-docs-prefix.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v6-id-state.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v6-url-lexical.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v6-url-linear.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v6-url-ownership.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v7-authority.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v7-docs-path.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v7-url-normalization.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v7-url-span-linear.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v8-cjk-path-stop.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v8-docs-prefix-perf.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v8-triple-decode.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v8-url-query-assignment.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-review-v9-delimiter-host.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-runner.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-span-overflow.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-url-authority.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-url-parser.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/bun.lock | not applicable | lockfile |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/cleanup-warnings.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/cli_args.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/cli-e2e.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/cli.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/concurrent-publish.test-worker.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/fail-closed-gaps.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/git-blob-batch.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/git-blob-reader.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/git-blob-reader.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/index.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-blockers.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-extra.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-fixture.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-policy.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-regression.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-result.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/manifest-diff.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/manifest.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/manifest.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/package.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/protected-check.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/protected-paths-complete.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/protected-paths.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/protected-paths.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/round4-gaps.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/round5-gaps.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/text-binary.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/text-binary.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/tsconfig.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/types.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/tsconfig.distribution-boundary.json | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/scripts/walk_enumeration_contract.test.ts | pass | - |
| A5 | .opencode/skills/repo-agentdev-integrity/SKILL.md | fail | F-004 |
| A4 | docs/designs/authoring/command-file-format.md | blocked | B-01/B-02/B-03 (F-009/F-010/F-011) |
| A4 | docs/designs/authoring/dependency-version-compatibility.md | pass | - |
| A4 | docs/designs/authoring/vocabulary-registry.md | pass | - |
| A4 | docs/designs/commands/_template.md | pass | - |
| A4 | docs/designs/commands/backlog-auto.md | pass | - |
| A4 | docs/designs/commands/backlog-review.md | pass | - |
| A4 | docs/designs/commands/case-auto.md | pass | - |
| A4 | docs/designs/commands/case-close.md | pass | - |
| A4 | docs/designs/commands/case-open.md | pass | - |
| A4 | docs/designs/commands/case-run.md | pass | - |
| A4 | docs/designs/commands/case-update.md | pass | - |
| A4 | docs/designs/commands/design-save.md | pass | - |
| A4 | docs/designs/commands/inspect-docs.md | pass | - |
| A4 | docs/designs/commands/inspect-promote.md | pass | - |
| A4 | docs/designs/commands/inspect-skills.md | pass | - |
| A4 | docs/designs/commands/intake-capture.md | pass | - |
| A4 | docs/designs/commands/intake-from-github.md | pass | - |
| A4 | docs/designs/commands/intake-promote.md | pass | - |
| A4 | docs/designs/commands/learning-promote.md | pass | - |
| A4 | docs/designs/commands/req-define.md | pass | - |
| A4 | docs/designs/commands/req-save.md | pass | - |
| A4 | docs/designs/foundations/decision-lifecycle.md | pass | - |
| A4 | docs/designs/foundations/design-principles.md | pass | - |
| A4 | docs/designs/foundations/document-model.md | fail | F-018 |
| A4 | docs/designs/foundations/harness-separation-model.md | pass | - |
| A4 | docs/designs/foundations/numbering-policy.md | pass | - |
| A4 | docs/designs/foundations/patterns.md | pass | - |
| A4 | docs/designs/foundations/project-extensions.md | pass | - |
| A4 | docs/designs/foundations/references/concrete-abstraction.md | pass | - |
| A4 | docs/designs/foundations/references/verification-scope-catalog.md | pass | - |
| A4 | docs/designs/foundations/system.md | pass | - |
| A4 | docs/designs/foundations/traceability-model.md | pass | - |
| A4 | docs/designs/integrity/autogen-freshness-gate.md | pass | - |
| A4 | docs/designs/integrity/backticks-identifier-threshold.md | pass | - |
| A4 | docs/designs/integrity/checker-execution-contracts.md | fail | F-018 |
| A4 | docs/designs/integrity/distribution-boundary.md | pass | - |
| A4 | docs/designs/integrity/docs-spec-rebuild-integrity.md | pass | - |
| A4 | docs/designs/integrity/index-auto-generation.md | pass | - |
| A4 | docs/designs/integrity/integrity-contracts.md | fail | F-018 |
| A4 | docs/designs/integrity/integrity-rule-catalog.md | fail | F-018 |
| A4 | docs/designs/integrity/references/targeted-docs-guard-implementation-details.md | pass | - |
| A4 | docs/designs/integrity/references/validator-internal-config.md | pass | - |
| A4 | docs/designs/integrity/rule-ownership.md | fail | F-018 |
| A4 | docs/designs/integrity/rules/IR-001-req-frontmatter-id-filename.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-002-req-required-frontmatter.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-003-active-retired-req-id-conflict.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-004-req-index-actual-consistency.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-005-adr-req-bidirectional-reference.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-006-command-allowed-frontmatter.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-007-skill-name-dir-match.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-008-skill-references-existence.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-009-obsolete-namespace-residual.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-010-adr-status-normalization.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-012-template-required-sections.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-013-variant-path-existence.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-014-singular-reference-dir-residual.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-015-retired-req-current-ref-detection.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-016-source-projection-integrity.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-018-req-range-notation-freshness.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-020-baseline-known-vs-new-finding.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-021-retired-skill-reference-detection.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-023-integrity-artifact-validator-drift.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-024-command-readme-actual.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-025-retired-adr-path-rule.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-027-retired-adr-current-authority-citation.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-028-command-top-step-int-only.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-029-command-alphabet-substep-prohibition.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-030-subagent-verbatim-conditional-return.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-031-findings-capture-heading-unification.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-032-delegation-type-on-result-envelope-prohibition.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-033-lightweight-delegation-primary-pattern-prohibition.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-034-skill-internal-section-step-reference-detection.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-035-skill-see-also-detection-perspective.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-037-retired-adr-current-baseline-ref.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-038-adr-index-consistency.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-039-index-req-title-consistency.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-040-retired-req-authority-comment.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-041-retired-req-broken-link.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-042-hardcoded-req-count.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-043-retired-readme-coverage.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md | fail | F-018 |
| A4 | docs/designs/integrity/rules/IR-046-consumer-generated-repo-type-fp-prevention.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-047-src-opencode-local-link-origin-dir-structure.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-048-generated-by-identifier-integrity.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-049-command-file-format-violation.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-050-load-skills-command-mis-specification.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-051-executor-skill-notation-misrecognition.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-052-completion-grep-pattern-design.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-053-gh-direct-invocation-detection.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-054-draft-spec-abandonment-detection.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md | fail | F-018 |
| A4 | docs/designs/integrity/rules/IR-056-project-extensions-integrity.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-058-distribution-untracked-skill-reference.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-059-distribution-reference-boundary.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-060-forbidden-japanese-word-detection.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-061-index-generation-consistency.md | pass | - |
| A4 | docs/designs/integrity/rules/IR-062-reference-path-existence.md | fail | F-018 |
| A4 | docs/designs/integrity/targeted-docs-guard-implementation.md | pass | - |
| A4 | docs/designs/integrity/test-impact-detection-gate.md | pass | - |
| A4 | docs/designs/integrity/validator-split-criteria.md | pass | - |
| A4 | docs/designs/local/install-script-usability.md | pass | - |
| A4 | docs/designs/local/local-case-file.md | pass | - |
| A4 | docs/designs/local/runtime-package-boundary.md | pass | - |
| A4 | docs/designs/quality/design-health-metrics.md | pass | - |
| A4 | docs/designs/quality/quality-gates.md | pass | - |
| A4 | docs/designs/quality/quality-specs.md | pass | - |
| A4 | docs/designs/quality/req-health-metrics.md | fail | F-019 |
| A4 | docs/designs/README.md | blocked | B-06 (F-028) |
| A4 | docs/designs/responsibilities/artifact-contracts.md | pass | - |
| A4 | docs/designs/responsibilities/artifact-quality-control-routing.md | pass | - |
| A4 | docs/designs/responsibilities/artifact-responsibilities.md | pass | - |
| A4 | docs/designs/responsibilities/document-type-responsibilities.md | pass | - |
| A4 | docs/designs/responsibilities/req-impact-map.md | fail | F-018, F-006 |
| A4 | docs/designs/responsibilities/responsibility-boundary-purification.md | pass | - |
| A4 | docs/designs/skills/_template.md | pass | - |
| A4 | docs/designs/skills/agentdev-adversarial-review.md | pass | - |
| A4 | docs/designs/skills/agentdev-architecture-advisory.md | pass | - |
| A4 | docs/designs/skills/agentdev-artifact-validation.md | pass | - |
| A4 | docs/designs/skills/agentdev-backlog-integration.md | pass | - |
| A4 | docs/designs/skills/agentdev-case-run-execution-adapter.md | pass | - |
| A4 | docs/designs/skills/agentdev-command-authoring.md | pass | - |
| A4 | docs/designs/skills/agentdev-command-creator.md | pass | - |
| A4 | docs/designs/skills/agentdev-conventional-commits.md | pass | - |
| A4 | docs/designs/skills/agentdev-decision-file-manager.md | pass | - |
| A4 | docs/designs/skills/agentdev-decision-guidelines.md | pass | - |
| A4 | docs/designs/skills/agentdev-design-file-manager.md | pass | - |
| A4 | docs/designs/skills/agentdev-doc-diagnostics.md | fail | F-018 |
| A4 | docs/designs/skills/agentdev-doc-writing.md | pass | - |
| A4 | docs/designs/skills/agentdev-epic-tracker.md | pass | - |
| A4 | docs/designs/skills/agentdev-gh-cli.md | pass | - |
| A4 | docs/designs/skills/agentdev-git-worktree-test-fallback.md | pass | - |
| A4 | docs/designs/skills/agentdev-git-worktree.md | pass | - |
| A4 | docs/designs/skills/agentdev-inspect-skills.md | pass | - |
| A4 | docs/designs/skills/agentdev-intake-pipeline.md | pass | - |
| A4 | docs/designs/skills/agentdev-issue-management.md | pass | - |
| A4 | docs/designs/skills/agentdev-learning-capture.md | pass | - |
| A4 | docs/designs/skills/agentdev-learning-pipeline.md | pass | - |
| A4 | docs/designs/skills/agentdev-project-extensions.md | pass | - |
| A4 | docs/designs/skills/agentdev-quality-gates.md | pass | - |
| A4 | docs/designs/skills/agentdev-req-analysis.md | pass | - |
| A4 | docs/designs/skills/agentdev-req-file-manager.md | pass | - |
| A4 | docs/designs/skills/agentdev-req-structure-diagnostics.md | pass | - |
| A4 | docs/designs/skills/agentdev-skill-authoring.md | pass | - |
| A4 | docs/designs/skills/agentdev-traceability.md | pass | - |
| A4 | docs/designs/skills/agentdev-workflow-backlog-auto.md | pass | - |
| A4 | docs/designs/skills/agentdev-workflow-lifecycle.md | pass | - |
| A4 | docs/designs/skills/agentdev-workflow-orchestration.md | pass | - |
| A4 | docs/designs/skills/agentdev-workflow-routing.md | pass | - |
| A4 | docs/designs/skills/agentdev-workflow-templates.md | pass | - |
| A4 | docs/designs/workflows/backlog-artifact-lifecycle.md | pass | - |
| A4 | docs/designs/workflows/capture-boundaries.md | pass | - |
| A4 | docs/designs/workflows/delegation-contracts.md | pass | - |
| A4 | docs/designs/workflows/epic-wave-model.md | pass | - |
| A4 | docs/designs/workflows/input-resolution-and-durable-state.md | pass | - |
| A4 | docs/designs/workflows/references/execution-unit-construction.md | pass | - |
| A4 | docs/designs/workflows/step-reference-contract.md | pass | - |
| A4 | docs/designs/workflows/workflow-contracts.md | pass | - |
| A4 | docs/designs/workflows/workflow-skill-model.md | pass | - |
| A3 | docs/requirements/README.md | pass | - |
| A3 | docs/requirements/REQ-001.md | pass | - |
| A3 | docs/requirements/REQ-002.md | pass | - |
| A3 | docs/requirements/REQ-003.md | pass | - |
| A3 | docs/requirements/REQ-004.md | pass | - |
| A3 | docs/requirements/REQ-005.md | pass | - |
| A3 | docs/requirements/REQ-006.md | pass | - |
| A3 | docs/requirements/REQ-007.md | pass | - |
| A3 | docs/requirements/REQ-008.md | pass | - |
| A3 | docs/requirements/REQ-009.md | pass | - |
| A3 | docs/requirements/REQ-010.md | fail | F-015 |
| A3 | docs/requirements/REQ-011.md | pass | - |
| A3 | docs/requirements/REQ-012.md | pass | - |
| A3 | docs/requirements/REQ-014.md | pass | - |
| A3 | docs/requirements/REQ-015.md | pass | - |
| A3 | docs/requirements/REQ-016.md | pass | - |
| A3 | docs/requirements/REQ-017.md | pass | - |
| A3 | docs/requirements/REQ-018.md | pass | - |
| A3 | docs/requirements/REQ-019.md | pass | - |
| A3 | docs/requirements/REQ-021.md | pass | - |
| A3 | docs/requirements/REQ-027.md | pass | - |
| A3 | docs/requirements/REQ-029.md | pass | - |
| A3 | docs/requirements/REQ-030.md | pass | - |
| A3 | docs/requirements/REQ-031.md | pass | - |
| A3 | docs/requirements/REQ-032.md | pass | - |
| A3 | docs/requirements/REQ-033.md | pass | - |
| A3 | docs/requirements/REQ-034.md | pass | - |
| A3 | docs/requirements/REQ-035.md | pass | - |
| A3 | docs/requirements/REQ-036.md | pass | - |
| A3 | docs/requirements/REQ-037.md | pass | - |
| A3 | docs/requirements/REQ-038.md | pass | - |
| A3 | docs/requirements/REQ-039.md | pass | - |
| A3 | docs/requirements/REQ-041.md | pass | - |
| A3 | docs/requirements/REQ-042.md | pass | - |
| A3 | docs/requirements/REQ-043.md | pass | - |
| A3 | docs/requirements/REQ-044.md | pass | - |
| A3 | docs/requirements/REQ-045.md | pass | - |
| A3 | docs/requirements/REQ-046.md | pass | - |
| A3 | docs/requirements/REQ-047.md | pass | - |
| A3 | docs/requirements/retired/REQ-013.md | pass | - |
| A3 | docs/requirements/retired/REQ-020.md | pass | - |
| A3 | docs/requirements/retired/REQ-022.md | pass | - |
| A3 | docs/requirements/retired/REQ-023.md | pass | - |
| A3 | docs/requirements/retired/REQ-024.md | pass | - |
| A3 | docs/requirements/retired/REQ-025.md | pass | - |
| A3 | docs/requirements/retired/REQ-026.md | pass | - |
| A3 | docs/requirements/retired/REQ-028.md | pass | - |
| A3 | docs/requirements/retired/REQ-040.md | pass | - |
| A1 | src/opencode/commands/agentdev/backlog-auto.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/backlog-review.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/case-auto.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/case-close.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/case-open.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/case-run.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/case-update.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/design-save.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/inspect-docs.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/inspect-promote.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/inspect-skills.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/intake-capture.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/intake-from-github.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/intake-promote.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/learning-promote.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/README.md | pass | - |
| A1 | src/opencode/commands/agentdev/req-define.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/req-save.md | fail | F-001 |
| A1 | src/opencode/commands/agentdev/templates/backlog-review/partial.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/backlog-review/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/backlog-review/zero-promoted.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/case-close/agentdev-push-failed.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/case-close/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/case-close/worktree-cleanup-failed.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/case-run/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/case-update/body.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/case-update/comment.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/case-update/req.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/case-update/review-ng.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/common/git-error-messages.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/inspect-docs/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/inspect-promote/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/inspect-skills/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/intake-capture/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/intake-from-github/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/intake-promote/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/integrity-check/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/learning-promote/standard.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/req-define/feature-epic.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/req-define/feature.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/req-define/lightweight.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/req-define/req-draft.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/req-save/epic.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/req-save/split-detected.md | pass | - |
| A1 | src/opencode/commands/agentdev/templates/req-save/standard.md | pass | - |
| A2 | src/opencode/skills/agentdev-adversarial-review/references/adversarial-review-protocol.md | pass | - |
| A2 | src/opencode/skills/agentdev-adversarial-review/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-architecture-advisory/references/architecture-review-delegation.md | pass | - |
| A2 | src/opencode/skills/agentdev-architecture-advisory/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/.gitignore | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/bun.lock | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/lib/frontmatter.ts | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/lib/fs-helpers.ts | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/lib/result.ts | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/package.json | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/README.md | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/src/check-change-impact.ts | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/src/check-entry-existence.ts | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/src/check-frontmatter-consistency.ts | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/tests/check-change-impact.test.ts | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/tests/check-entry-existence.test.ts | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/tests/check-frontmatter-consistency.test.ts | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/scripts/tsconfig.json | pass | - |
| A2 | src/opencode/skills/agentdev-artifact-validation/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-backlog-integration/references/integration-judgment.md | pass | - |
| A2 | src/opencode/skills/agentdev-backlog-integration/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md | pass | - |
| A2 | src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md | pass | - |
| A2 | src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md | pass | - |
| A2 | src/opencode/skills/agentdev-command-authoring/references/layer3-style-conversion-table.md | pass | - |
| A2 | src/opencode/skills/agentdev-command-authoring/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-command-creator/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-conventional-commits/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-decision-file-manager/references/validation-and-consistency.md | pass | - |
| A2 | src/opencode/skills/agentdev-decision-file-manager/scripts/src/alloc-decision-number.ts | pass | - |
| A2 | src/opencode/skills/agentdev-decision-file-manager/scripts/tests/alloc-decision-number.test.ts | pass | - |
| A2 | src/opencode/skills/agentdev-decision-file-manager/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-decision-file-manager/templates/doc_decision.md | pass | - |
| A2 | src/opencode/skills/agentdev-decision-guidelines/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/references/target-area-matching.md | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/scripts/.gitignore | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/scripts/lib/fs-helpers.ts | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/scripts/lib/result.ts | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/scripts/package.json | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/scripts/README.md | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/scripts/tests/search-target-area.test.ts | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/scripts/tsconfig.json | pass | - |
| A2 | src/opencode/skills/agentdev-design-file-manager/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-routing.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-diagnostics/references/finding-output-contract.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-diagnostics/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-writing/references/decision-writing-quality.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-writing/references/document-boundaries.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-writing/references/execution-subject-classification.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md | fail | F-007 |
| A2 | src/opencode/skills/agentdev-doc-writing/references/req-line-quality.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-writing/references/review-output.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-writing/references/rewrite-patterns.md | pass | - |
| A2 | src/opencode/skills/agentdev-doc-writing/references/spec-writing-quality.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-doc-writing/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-epic-tracker/references/regex-and-merge-conflict.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-epic-tracker/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-gh-cli/references/contracts.md | pass | - |
| A2 | src/opencode/skills/agentdev-gh-cli/references/retry.md | pass | - |
| A2 | src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md | pass | - |
| A2 | src/opencode/skills/agentdev-gh-cli/references/verify.md | pass | - |
| A2 | src/opencode/skills/agentdev-gh-cli/scripts/cli_utils.ts | pass | - |
| A2 | src/opencode/skills/agentdev-gh-cli/scripts/verify_body.test.ts | pass | - |
| A2 | src/opencode/skills/agentdev-gh-cli/scripts/verify_body.ts | pass | - |
| A2 | src/opencode/skills/agentdev-gh-cli/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md | pass | - |
| A2 | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | pass | - |
| A2 | src/opencode/skills/agentdev-git-worktree/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-inspect-skills/references/execution-subject-misclassification.md | pass | - |
| A2 | src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md | pass | - |
| A2 | src/opencode/skills/agentdev-inspect-skills/references/skill-frontmatter-name-backtick.md | pass | - |
| A2 | src/opencode/skills/agentdev-inspect-skills/references/spec-operation-contract-consistency.md | pass | - |
| A2 | src/opencode/skills/agentdev-inspect-skills/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-intake-pipeline/references/intake-extraction.md | pass | - |
| A2 | src/opencode/skills/agentdev-intake-pipeline/references/intake-promotion.md | pass | - |
| A2 | src/opencode/skills/agentdev-intake-pipeline/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md | pass | - |
| A2 | src/opencode/skills/agentdev-issue-management/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-learning-capture/references/capture-entry-template.md | pass | - |
| A2 | src/opencode/skills/agentdev-learning-capture/references/example.md | fail | F-003 |
| A2 | src/opencode/skills/agentdev-learning-capture/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md | pass | - |
| A2 | src/opencode/skills/agentdev-learning-pipeline/references/disposition-and-artifact-schema.md | fail | F-003 |
| A2 | src/opencode/skills/agentdev-learning-pipeline/references/inbox-and-evaluation-schema.md | pass | - |
| A2 | src/opencode/skills/agentdev-learning-pipeline/references/promote-judgment-logic.md | pass | - |
| A2 | src/opencode/skills/agentdev-learning-pipeline/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-project-extensions/scripts/.gitignore | pass | - |
| A2 | src/opencode/skills/agentdev-project-extensions/scripts/bun.lock | pass | - |
| A2 | src/opencode/skills/agentdev-project-extensions/scripts/lib/extension_state.ts | pass | - |
| A2 | src/opencode/skills/agentdev-project-extensions/scripts/package.json | pass | - |
| A2 | src/opencode/skills/agentdev-project-extensions/scripts/README.md | fail | F-024 |
| A2 | src/opencode/skills/agentdev-project-extensions/scripts/tests/extension_state.test.ts | pass | - |
| A2 | src/opencode/skills/agentdev-project-extensions/scripts/tsconfig.json | pass | - |
| A2 | src/opencode/skills/agentdev-project-extensions/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-quality-gates/references/case-run-pre-delegation-staleness-check.md | pass | - |
| A2 | src/opencode/skills/agentdev-quality-gates/references/common-gate-contract.md | pass | - |
| A2 | src/opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md | pass | - |
| A2 | src/opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md | pass | - |
| A2 | src/opencode/skills/agentdev-quality-gates/references/qg-3-implementation-deviation.md | pass | - |
| A2 | src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | pass | - |
| A2 | src/opencode/skills/agentdev-quality-gates/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-analysis/references/req-define-detailed-gates.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-analysis/references/session-context-detection.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-analysis/references/test-strategy-numeric-threshold-guide.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-analysis/references/verification-log.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-analysis/references/wall-methodology.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-analysis/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-req-file-manager/references/create-append-update-flow.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/references/matching-and-merge.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/references/numbering-and-validation.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/.gitignore | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/bun.lock | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/lib/frontmatter.ts | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/lib/fs-helpers.ts | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/lib/result.ts | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/package.json | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/README.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/tests/alloc-composite-id.test.ts | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/tests/alloc-req-number.test.ts | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/scripts/tsconfig.json | pass | - |
| A2 | src/opencode/skills/agentdev-req-file-manager/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md | pass | - |
| A2 | src/opencode/skills/agentdev-req-structure-diagnostics/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-skill-authoring/references/design-principles.md | pass | - |
| A2 | src/opencode/skills/agentdev-skill-authoring/references/development-workflow.md | pass | - |
| A2 | src/opencode/skills/agentdev-skill-authoring/references/review-protocol.md | pass | - |
| A2 | src/opencode/skills/agentdev-skill-authoring/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-traceability/scripts/.gitignore | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/bun.lock | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/lib/check.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/lib/cli_utils.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/lib/declarations.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/lib/query.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/lib/requirements.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/lib/verification_scope.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/package.json | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/README.md | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/src/check.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/src/coverage.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/src/impact.ts | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/scripts/tsconfig.json | pass | - |
| A2 | src/opencode/skills/agentdev-traceability/SKILL.md | fail | F-025 |
| A2 | src/opencode/skills/agentdev-workflow-backlog-auto/references/fan-in-and-reporting.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-backlog-auto/references/stage-execution.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-backlog-auto/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-backlog-review/references/analysis-composition-and-review.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-backlog-review/references/contradiction-ru-and-persistence.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-backlog-review/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-auto/references/conflict-resolution-and-reporting.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-auto/references/input-resolution-and-orchestration.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-auto/references/stop-and-decision-resolution.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-auto/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-close/references/epic-wave-close.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-close/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-open/references/adversarial-review-integration.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-open/references/execution-unit-and-preflight.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-open/references/handoff-and-ou-gate.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-open/references/issue-body-and-execution-contract.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-open/references/issue-creation-flows.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-open/references/termination-and-cleanup.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-open/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-run/references/epic-wave.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-run/references/single.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-run/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-update/references/update-flows.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-case-update/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-design-save/references/placement-and-save.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-design-save/references/verification-and-persistence.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-design-save/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-docs/references/distribution-check-and-output.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-docs/references/scan-and-doc-diagnostics.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-docs/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-promote/references/auto-promote-and-review.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-promote/references/hitl-and-disposition.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-promote/references/inbox-scan-and-classification.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-skills/references/finding-output-and-persist.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-skills/references/skill-structure-diagnostics.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-inspect-skills/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-intake-capture/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-intake-from-github/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-intake-promote/references/classification-and-review.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-intake-promote/references/hitl-persistence-and-destructive.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-intake-promote/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-learning-promote/references/analysis-and-review.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-learning-promote/references/hitl-and-persistence.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-learning-promote/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-orchestration/references/case-auto-recovery.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-orchestration/SKILL.md | fail | F-002 |
| A2 | src/opencode/skills/agentdev-workflow-req-define/references/adversarial-review-path-a.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-req-define/references/draft-generation.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-req-define/references/input-and-dialogue.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-req-define/references/requirement-development.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-req-define/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-req-save/references/indexes-and-persistence.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-req-save/references/precheck-and-req-ops.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-req-save/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-routing/references/case-update-procedure.md | fail | F-003 |
| A2 | src/opencode/skills/agentdev-workflow-routing/references/next-command-rules.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-routing/references/review-ng.md | fail | F-003 |
| A2 | src/opencode/skills/agentdev-workflow-routing/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/SKILL.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/case-open/epic.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/case-open/multi-req-epic.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/case-open/standard.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_analysis.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_feature_implementation.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_feature_technical.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_review_ng.md | fail | F-003 |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_update.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_bug.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_epic.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md | pass | - |
| A2 | src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md | pass | - |
| A2 | src/opencode/skills/japanese-tech-writing/SKILL.md | pass | - |


not applicable 理由コード: lockfile = 依存解決の生成ロックファイル、gitignore = 除外設定断片、test-fixture = 検査専用のダミー文書（実運用成果物ではない）、empty-marker = ディレクトリ保持用の空ファイル。

## 9. Wave 2・3 引継ぎ集計（REQ-045-009）

後続 Issue への引き渡し単位を示す。Wave 2（#2371 横断正規化）は fail 検出事項の修正と blocked 判断事項の解消を、Wave 3（#2372 回帰検査）は修正後の再検証と再発防止検査の整備を担う。

### Wave 2（#2371）への入力

| 引継ぎ項目 | 内容 | 対応検出 | 前提となる判断 |
|---|---|---|---|
| 横断正規化バッチ（機械的修正可能群） | （ADR）注記の置換・削除（32 ファイル）、`agentdev-spec-compliance` 参照置換（5 ファイル）、`agentdev-adr-guidelines` 参照置換（2 ファイル）、DOC-MAP 参照更新（6 yaml）、`spec-health-metrics` 表記修正（2 ファイル）、REQ-028 参照更新（10 Design）、`agentdev-doc-map` 参照更新（1 ファイル） | F-001〜F-006, F-008, F-014〜F-016, F-018 | DEC-009 決定17（一括置換禁止）に従い、置換後の参照先を個別確認すること |
| Design 修正群 | `command-file-format.md` の正規形確定と一体更新、`req-health-metrics.md` AUTOGEN 再生成、`artifact-responsibilities.md`・語彙レジストリの更新 | F-011〜F-013, F-019, F-005, F-006 | B-03 の確定が F-012/F-013 の前提 |
| 検査コード・データ修正群 | `generate_indexes.ts` ADR 経路削除、`check_integrity.ts` ADR 経路の整理、obsolete-path-map の new パス修正、IR-055 違反の解消（project-extensions README、traceability SKILL.md） | F-022〜F-025, F-014 | B-04, B-05 の確定を前提とするものを含む |
| blocked 判断事項の解消 | B-01〜B-06 の設計判断・受理判断 | F-009〜F-011, F-020, F-023, F-028 | REQ-046-009 の blocked 報告経路で prioritize すること |

### Wave 3（#2372）への入力

| 引継ぎ項目 | 内容 |
|---|---|
| 回帰検査の観点 | 各 F-NNN の「再発防止可能性」に記載した機械検査化候補（旧注記・旧スキル名・旧パスの検出パターン、語彙表と実在の突合、G 採番検査、AUTOGEN 鮮度）を docs-check / inspect 系の検出項目として整備する |
| 再検証のベースライン | 本レポートのファイル別判定マトリクス（§8）を修正前の状態記録とし、修正後に fail 64 件・blocked 3 件の解消を再検証する |
| baseline 整備 | F-026 の 25 new unmanaged NG を解消または承認済み baseline へ登録し、check_integrity.ts の exit=0 を回復する |

## 10. 監査の限界

1. **DEC-017 の status（proposed）**: 観点V2（撤去済み Artifact Graph）の正否は DEC-017 の受理判断に依存する（B-06、§1 残留リスク）。
2. **正規契約不在箇所の判定**: B-01〜B-05 に挙げた契約不在・検査設計判断は、監査の性質上（REQ-045-007）、判定を保留した。これらのファイル判定（blocked 3 ファイル）は判断解消後に fail または pass へ遷移する。
3. **機械スイープの検出限界**: 観点V7（表現の混在）は case-insensitive 部分一致の過検出を含むため、`STEP-N-M` 形式への正当な言及と旧 `Step N` 形式の残存を機械的に完全に区別していない。代表サンプル精査（`system.md` 等）では現行形式（工程表・STEP-N-M）で説明された箇所と判別できたため、Design 群の `Step N` 系検出は全て正当な言及・歴史記述とトリアージした。設計文書全数の逐語精査は Wave 2 の修正時に行うことを推奨する。
4. **観点V8（責務所有者）の機械検出限界**: スキル・コマンドの Design 一覧と実在の突合、`artifact-responsibilities.md` の責務表と実在の突合は実施したが、契約文言レベルの責務矛盾（意味的な二重定義）は意味診断（inspect 系）の領域であり、本監査では構造的な参照不整合（F-018 等）に限定した。
5. **対象外領域**: REQ-045-001 の列挙外（decisions、guides、reports、ルート README、導入スクリプト、opencode-local）は監査対象外とした。対象外領域で観測した参考検出は F-017 のみ記録した。
6. **歴史許容の判断**: 「旧」「廃止」明示（quality-gates.md L22 等）、Decision Map の関係行、baseline の過去検出記録を歴史許容とした判断は §3 の許容条件に基づく。許容条件自体に欠陥があると判明した場合は該当項目を blocked へ分類し直す（TS-003 の on_failure 規定）。

## 11. テスト戦略実施結果（Issue #2370 test strategy）

| TS | 検証内容（実施結果） | 判定 |
|---|---|---|
| TS-001 | 対象範囲チェックリスト（§4、6領域 714 ファイル）と監査観点（§3、V1〜V10）を要件と照合。ファイル別判定マトリクス（§8）が全 714 ファイル（A1: 45、A2: 240、A3: 48、A4: 159、A5: 191、A6: 31）をカバーし、領域×観点の未実施組み合わせが 0 件であることを機械集計で確認した | 合格 |
| TS-002 | 検出事項 28 エントリ（F-001〜F-028）全てに4値判定と証拠7項目（対象ファイル、該当箇所、現在の記述、正と判断した根拠、問題クラス、修正候補、再発防止可能性）が存在すること、問題クラス一覧（§5、PC-01〜PC-11）と blocked 項目への追加判断事項（§7、B-01〜B-06）の存在を機械検査で確認した。初回検収で F-001〜F-008 の一部に判定ラベル欠落を検出し、補完の上で再検収して欠落 0 件とした（fix-and-reverify） | 合格 |
| TS-003 | 歴史的識別子（`v2:` プレフィックス付き）とテンプレート・様式例示のプレースホルダーを fail として誤分類していないことを突合した。fail 判定 64 ファイルに `v2:` 識別子・retired セクション内記述・テンプレートプレースホルダーは含まれず（templates 配下の fail は実在しないスキル参照 F-003 のみ、retired REQ は全件 pass）、レポート内の `v2:` 言及は全て許容条件の説明文であることを確認した | 合格 |
| TS-013 | REQ-045.md の文面が恒常的な診断責務を宣言していないこと（目的節「本 REQ は一回限りの網羅監査の実行契約を所有し、恒常的な診断責務を持たない（機械検査は docs-check、意味診断は inspect 系が担当する）」）と、docs-check・inspect 系との責務境界（REQ-010-004、REQ-045 対象外宣言）との整合を確認した。本レポートも Wave 2・3 への引継ぎ（§9）までを対象とし恒常運用を宣言しない | 合格 |
| TS-QC-1 | 本レポート（document 成果物）を文書品質査読能力（agentdev-doc-writing、自然言語箇所を中心に適用）で査読した。判定ラベル欠落（TS-002 で修正）と誤字 1 件（B-02 行の「スキール」→「スキル」）を検出・修正し、再査読で未解決違反 0 件とした（fix-and-reverify） | 合格 |
