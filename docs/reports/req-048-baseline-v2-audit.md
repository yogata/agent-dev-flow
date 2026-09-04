---
id: BASELINE-REQ048-V2-AUDIT
title: "REQ-048 再構築 Baseline V2 現行監査（OU-001 / WP-01 Phase A）"
status: accepted
created: 2026-09-05
baseline_for: REQ-048（再構築版） / DEC-027
source_issue: "#2598 (OU-001 / WP-01 Repository Baseline & Current-State Audit)"
parent_epic: "#2596 (REQ-048 再構築)"
---

<!-- ADF-COVERS(implementation): REQ-048-016 -->
<!-- ADF-COVERS(verification): REQ-048-016 -->
# REQ-048 再構築 Baseline V2 現行監査（OU-001 / WP-01 Phase A）

## 本 Report の位置づけ

本 Report は REQ-048 再構築 Epic（#2596）の Wave 1（OU-001 / WP-01）として実施した現行監査の記録である。
後続 Wave（OU-002〜006）が structured handoff、source / projection 参照、検証差分記録等の同期義務と縮小（NARROW / MERGE / DOWNGRADE / DELETE）判断を行う際の基礎資料である。
監査は既存成果物の読み取りと記録のみで、監査対象への変更を含まない。
既存成果物種別（Report）への保存であり、この目的だけの新規成果物種別は追加していない（REQ-048-016）。

## 1. baseline commit の固定・記録

実行時点（2026-09-05）で `git fetch origin main` を実行し、GitHub 最新 default branch の SHA を取得した。

| 項目 | 値 |
|---|---|
| 実行時 GitHub 最新 default branch SHA（origin/main） | `729cd778fd944b9c547db2a59f78d4354ee3d6d4` |
| 自走実行全体の起点 baseline commit | `94746a33fb3e2160ceeb677d44a1fceac4232ce6` |
| merge-base（起点と origin/main） | `94746a33`（起点から origin/main への fast-forward 関係） |
| 取得方式 | `git fetch origin main` 後 `git rev-parse origin/main` |

起点 94746a33 から実行時最新 729cd778 までの commit 一覧（`git log --oneline 94746a33..origin/main`、計 5件）:

| commit | 内容 |
|---|---|
| `241d361d` | docs(req): REQ-048 全面再構築（21行→16行）と DEC-027 新規作成 |
| `ca3a3d82` | docs(design): REQ-048 再構築に伴う安定契約原則更新（workflow/delegation/templates Design 5セクション） |
| `24cb0c85` | fix(traceability): REQ ID 第1セグメントの3〜4桁受理緩和 (#2595) |
| `cf072de4` | docs(learning): capture learning entries via case-close for Issue 2594 |
| `729cd778` | chore(case-open): REQ-048 再構築 Case の draft 削除（Issue #2596 / #2597 作成済み） |

監査対象コードが起点時点から不変か否か（`git diff --name-status 94746a33..origin/main` による判定）:

| 監査対象 | 起点からの変更 | 補足 |
|---|---|---|
| docs/requirements/REQ-048.md | 変更（241d361d） | 21行→16行の全面再構築。監査の比較基準（新16行） |
| docs/decisions/DEC-027.md | 新規（241d361d） | 観測ベース統制縮小評価ループ（proposed） |
| docs/designs/workflows/workflow-contracts.md | 変更（ca3a3d82） | 安定契約原則更新（5セクションの一部） |
| docs/designs/workflows/delegation-contracts.md | 変更（ca3a3d82） | 同上 |
| docs/designs/skills/agentdev-workflow-templates.md | 変更（ca3a3d82） | 同上 |
| docs/designs/foundations/references/verification-scope-catalog.md | 不変 | 起点時点と同一 |
| docs/reports/req-048-reanalysis-baseline.md | 不変 | 同上 |
| src/opencode/skills/agentdev-workflow-lifecycle/references/structured-stage-handoff.md | 不変 | 同上 |
| src/opencode/skills/agentdev-workflow-templates/templates/（11本） | 不変 | テンプレート実体は起点時点と同一 |
| 契約テスト2本（execution_ident_contract.test.ts、verification_diff_contract.test.ts） | 起点比較不能 | main repo `.opencode/skills/repo-agentdev-integrity/scripts/` 配下の untracked 実体であり git 管理外。起点半び同 SHA 間での変更有無を git で判定できない |

`24cb0c85`（#2595）は `src/opencode/skills/agentdev-traceability/scripts/lib/`（declarations.ts、requirements.ts、verification_scope.ts）の変更であり、監査対象6系統への直接変更はない。covers 宣言の行 ID 解析挙動（REQ ID 第1セグメント受理桁数）に影響する変更であるため、後続 Wave の covers 棚卸し（本 Report 第4節）の前提として記録する。

本監査で固定した SHA（729cd778）は既知 fail 分離運用（AG-010）の再現比較基準として後続 Wave が参照できる。本節が記録先である。

## 2. 契約テスト2本の現行 assertion 構造

実体は main repo `.opencode/skills/repo-agentdev-integrity/scripts/` 配下の untracked ファイルである（worktree には存在しない）。
covers 宣言は旧行 ID（REQ-048-001〜021）のまま残存している。

### 2.1 execution_ident_contract.test.ts（349行、実行識別情報セクション契約テスト）

| 位置 | 内容 |
|---|---|
| L1-2 | `ADF-COVERS(verification): REQ-048-001..006`、`REQ-048-019`（旧行 ID） |
| L46-51 | `ISSUE_TEMPLATES` = issue_desc_feature / bug / epic / child の4本 |
| L53-58 | `ISSUE_REQUIRED_KEYS` = adf_case、adf_phase、adf_execution_unit、adf_upstream_confirmed |
| L60-66 | `PR_REQUIRED_KEYS` = adf_case、adf_pr、adf_execution_unit、adf_delegation、adf_result |
| L69-78 | `FORBIDDEN_REQUIRED_KEYS` = adf_session、adf_session_id、adf_model、adf_token、adf_tool_call、adf_message、adf_part、adf_compaction（harness 生実行履歴系を必須化しない） |
| L80-85 | `RESULT_STATES` = completed-pr、blocked、failed、delegation-unavailable |
| L89-137 | `BASELINE_REQUIRED_SECTIONS`。実行識別情報セクション導入前の各テンプレート必須セクション（issue_desc 4本 + pr_desc.md の5テンプレート分） |
| L148-166 | `extractExecutionIdent`。`## 実行識別情報` セクション内の `- adf_{key}: value` 行のみを正とする機械解析 |
| L189-257 | describe「REQ-048-001/002/006」: セクション存在、【必須】マーカー、必須 key 復元、セクション外 adf_ 行不在、配布物内部 ID（REQ-XXXX 数字つき）不在、実行識別情報を持つテンプレートが既存5本のみ（新規テンプレート種別の新設なし） |
| L259-278 | describe「REQ-048-003/004」: FORBIDDEN_REQUIRED_KEYS 不在、adf_harness_ref の任意明記 |
| L280-292 | describe「REQ-048-005」: 欠落時の N/A 記録と「停止しない」規約の存在 |
| L294-335 | describe「REQ-048-001/002」: 委譲識別情報ブロック雛形（`<delegation-ident>`、adf_delegation_id / purpose / parent / child）の存在、`DEL-{N}-{seq}` 形式規定、PR テンプレート adf_delegation の転記規定、adf_result の4状態列挙 |
| L337-349 | describe「REQ-048-019」: ベースライン必須セクション（BASELINE_REQUIRED_SECTIONS）の全残存 |

テンプレート読込は projection（.opencode/）を優先し不在時に source（src/opencode/）へ fallback する二段構成（L26-43）。

### 2.2 verification_diff_contract.test.ts（350行、検証差分セクション契約テスト）

| 位置 | 内容 |
|---|---|
| L1-2 | `ADF-COVERS(verification): REQ-048-015..018`、`REQ-048-019`（旧行 ID） |
| L49-58 | `PR_BASELINE_REQUIRED_SECTIONS` = 概要、実行識別情報、実装内容、完了条件、テスト結果、品質メトリクス、Findings/ Capture候補、関連Issue の8セクション |
| L61-67 | `FINDING_DIFF_CLASSES` = 新規、修正済み、既出、撤回、無効 の5分類 |
| L71-83 | `KNOWN_TEMPLATE_FILES` = templates ディレクトリ直下 11本の固定リスト（新規テンプレート種別の新設なしを固定） |
| L97-104 | `extractDiffSection`。`## 検証差分` から次の `## ` 見出しまでを抽出 |
| L110-127 | `extractDiffTableHeader`。セクション内の最初のテーブルヘッダー行を抽出 |
| L150-179 | describe「REQ-048-015」: セクション存在、【必須】マーカー、8列ヘッダー（実行工程、検証種別、検証結果 + 5分類）、5分類と初回検証の全 finding 新規扱い規約 |
| L181-198 | describe「REQ-048-017」: 同種検証の複数工程実施時の行並びと工程間比較規約、templates スキルによる case-run / case-close 記録先定義 |
| L200-227 | describe「REQ-048-016」: 検証差分セクションを持つテンプレートが pr_desc.md のみ、配布物内部 ID 不在、templates スキルの規約と5分類定義 |
| L229-251 | describe「REQ-048-015/016」: Findings セクション（`### intake` / `### learning` 小見出し）との共存、置換しない |
| L253-288 | describe「REQ-048-018」: 審議中 finding 状態（REQ-003-042）と修正証跡（REQ-007-005）の所有境界非変更。case-close の pr-merge-and-conflict.md、adversarial-review の protocol 参照を検査 |
| L290-336 | describe「REQ-048-015/017」: adapter スキルと harness-delegation.md の検証差分記録指示、case-run delegation-and-result.md の委譲 prompt 記録指示、case-close pr-merge-and-conflict.md の対応記録コメント記録指示 |
| L338-350 | describe「REQ-048-019」: PR テンプレートのベースライン必須セクション全残存、検証差分セクション自体の必須登録 |

## 3. correlation field（adf_*）の配置

配置基盤は `src/opencode/skills/agentdev-workflow-templates/templates/` 直下 11本。
実行識別情報セクションを持つのは issue_desc 4本 + pr_desc.md の5本であり、それ以外（issue_comment 6本、case-open 3本）は持たない（テスト L246-256 で機械固定）。

| テンプレート | adf_case | adf_phase | adf_execution_unit | adf_upstream_confirmed | adf_pr | adf_delegation | adf_result | adf_harness_ref |
|---|---|---|---|---|---|---|---|---|
| issue_desc_feature.md（L22-26） | ○ | ○ | ○ | ○ | − | − | − | ○（任意） |
| issue_desc_bug.md（L22-26） | ○ | ○ | ○ | ○ | − | − | − | ○（任意） |
| issue_desc_epic.md（L22-26） | ○ | ○ | ○（epic:#N） | ○ | − | − | − | ○（任意） |
| issue_desc_child.md（L26-30） | ○ | ○ | ○（standard:#N） | ○ | − | − | − | ○（任意） |
| pr_desc.md（L24-29） | ○ | − | ○ | − | ○ | ○ | ○ | ○（任意） |

補足（バックフィルと転記の規約所在）:

- `adf_pr` は PR 作成時点では番号が確定しない自己参照値であり、`agentdev-case-run-execution-adapter/references/harness-delegation.md` L52 が PR 本文更新での埋め戻しを規定する。実例として docs/reports/req-048-reanalysis-baseline.md L75 に「adf_pr は作成後埋め戻しで確定」の確認記録がある。
- 委譲識別情報ブロック（`<delegation-ident>`）の雛形と定義は `harness-delegation.md` L101-104（雛形）、L151-154（adf_delegation_id / adf_delegation_purpose / adf_parent / adf_child の4 key 定義表）、L157（実行担当サブエージェントが PR 本文の adf_delegation へ転記する指示）。
- pr_desc.md の検証差分セクションは8列構造（実行工程、検証種別、検証結果、新規、修正済み、既出、撤回、無効）を L19 前後の規約コメントとテーブルで所有する。

## 4. ADF-COVERS 宣言の現状（旧行 ID 残存の棚卸し）

REQ-048 は 241d361d で全面再構築された（旧21行 REQ-048-001〜021 → 新16行 REQ-048-001〜016、docs/requirements/REQ-048.md L26-41）。
既存の ADF-COVERS 宣言は旧行 ID のまま残存しており、新16行と番号が重複する。
covers 宣言が旧行と新行のどちらを指すかがトレーサビリティ解析上で判別できない状態であり、これが後続 Wave の同期義務の主要対象である。

監査対象ファイル群における旧行 ID の残存箇所:

| ファイル | 宣言位置 | covers 役割 | 残存している旧行 ID |
|---|---|---|---|
| docs/designs/workflows/workflow-contracts.md | L10-12 | implementation | REQ-048-007..011、REQ-048-001..006 + 021、REQ-048-012..014 |
| docs/designs/workflows/delegation-contracts.md | L10 | implementation | REQ-048-007、009、010、011 |
| docs/designs/skills/agentdev-workflow-templates.md | L8 | implementation | REQ-048-001、002、006、015、016、017、018 + REQ-057-020 |
| execution_ident_contract.test.ts | L1-2 | verification | REQ-048-001..006、019 |
| verification_diff_contract.test.ts | L1-2 | verification | REQ-048-015..019 |
| docs/reports/req-048-reanalysis-baseline.md | L11-12 | implementation + verification | REQ-048-019、020、021 |

Design 本文内の旧行 ID 言及（covers 宣言以外）:

- workflow-contracts.md L93-94、L359-360、L371、L384-385、L389、L395、L399（REQ-048-001、002、003、004、007、008、012、014 を「REQ-048 の成立条件として固定しない」趣旨の注記付きで参照）
- delegation-contracts.md L300-301、L307（REQ-048-014、REQ-048-012、REQ-048-003 を参照）
- agentdev-workflow-templates.md L244-246（REQ-048-008、REQ-048-014、REQ-048-012 を参照）

新16行との対応切断の具体箇所（棚卸し結果）:

| 箇所 | 切断の内容 |
|---|---|
| 上記 covers 宣言6群 | 旧行 ID（REQ-048-001〜021）を宣言。新16行と番号衝突し、traceability coverage / check の解析対象行が曖昧 |
| docs/reports/req-048-reanalysis-baseline.md L6 | frontmatter `baseline_for: REQ-048-021 / DEC-017`。新16行に REQ-048-021 が存在せず参照解決不能 |
| docs/designs/foundations/references/verification-scope-catalog.md L225-228 | セクション見出しが旧要件タイトル「REQ-048（ADF 実行効率第1次改善・実行観測基盤）」のまま。行記録も旧行範囲（REQ-048-007..014）のみ |
| docs/decisions/DEC-027.md L15、L42 | 旧行を「旧 REQ-048-019（一律削減なし）」と「旧」接頭辞付きで明示的に参照（意図的な記録であり問題ではないが、旧行参照の正例） |
| structured-stage-handoff.md | REQ-048 表記なし（次節）。旧行 ID の参照切断は発生していない |

## 5. verification-scope-catalog.md の REQ-048 行

`docs/designs/foundations/references/verification-scope-catalog.md`（起点時点から不変）における REQ-048 の記録内容:

- L20: Issue #2510（OU-003 宣言・カタログ整備）の棚卸し記録。REQ-048-007..REQ-048-014 を含む41件を任意行として本カタログへ登録した経緯。
- L33: エントリ追加経緯の記録。REQ-045 から REQ-048 のエントリは Issue #2510 の棚卸しで追加した旨。
- L225-228: `### REQ-048（ADF 実行効率第1次改善・実行観測基盤）` セクション。記録内容は次の2行。
  - REQ-048-007..REQ-048-011: 工程間・委譲時の構造化文脈引き継ぎの識別情報、確定済み事項の初期文脈利用、複製要求の禁止、正規情報源の非代替、委譲時最小契約の維持の実行時振る舞い
  - REQ-048-012..REQ-048-014: source / projection の確認対象判別、解決済み参照先の後工程への引き継ぎ、双方確認の維持と責務境界変更時の正規判断の実行時振る舞い

現行分類は「任意行（実行時振る舞い、docs-check 検査と回帰テストで検証する系統ではない）」であり、検証対応宣言の対象になっていない。
セクション見出しと行範囲は旧要件（REQ-048-001〜021）基準のままで、新16行への更新は未実施。

## 6. docs/reports/req-048-reanalysis-baseline.md の現状

起点時点から不変（本監査対象内の変更禁止対象、再枠付けは OU-006 / #2603 の責務）。現状インベントリ:

- frontmatter（L1-9）: id `BASELINE-REQ048-REANALYSIS`、status accepted、`baseline_for: REQ-048-021 / DEC-017`（L6。新16行への参照切断あり、第4節参照）、source_issue `#2400`、parent_epic `#2399`。
- covers（L11-12）: implementation + verification に REQ-048-019、020、021（旧行 ID）。
- 計測条件（L26-29）: 改善前分析は 2026-08-22 時点から直近30日の ADF 実行を OpenCode 永続セッションデータから分析。出所は RU-0001（消費済み）第2節・第4節（`git show 55853b4f:.agentdev/backlog/req-units/RU-0001.md` で参照）。
- 定義と基線値（L31-51）: 論理実行単位（97単位。DEL-{N}-{seq} による機械区分と導入前の従来区分の併用）、正規化 path（167 path）、token（総計約67.9億、49,157回のモデル呼出し、大半を cache read が占める）、同一 path 再読込（78/97単位）、子セッション間の同一 path 再読込（68/97単位）、source / projection 重複参照（35単位、167 path、931 read）、新規・修正・既出 finding（未構造化。5分類の機械化は検証差分セクション導入後）、対応付け率（導入前は実質 0%）、構造化文脈の利用状況（導入前は委譲 prompt に統一契約なし）。
- 手順（L53-63）: 再分析手順 5ステップ（期間設定、読み取り専用抽出、論理実行単位への区分、定義どおりの算出、基線値との比較）。集計スクリプトの新設禁止と将来のスクリプト化経路を明記。
- REQ-048 旧行参照の所在: frontmatter `baseline_for: REQ-048-021`（L6）と covers 宣言（L11-12、REQ-048-019、020、021）。
- 代表実データ確認記録（L70-77）: Issue #2400 の遡及適用なし、PR #2405 の adf_pr 埋め戻し実例、契約テスト 50 pass。

## 7. structured handoff の参照構造

`src/opencode/skills/agentdev-workflow-lifecycle/references/structured-stage-handoff.md`（71行、起点時点から不変）:

- 所有: agentdev-workflow-lifecycle スキルの references/ 配下。原本仕様は `<workflows/workflow-contracts>` Design「工程間構造化文脈引き継ぎ契約」。
- field 集（直列化形式 10意味、L19-36）: structured_context 配下に purpose、workflow_phase、execution_unit、resolved_context、open_items、canonical_references、stop_conditions、expected_output、handoff_artifacts、plan_change。キーの削除・名称変更は委譲時の直列化との意味対応を壊すため禁止（L39）。
- 参照元: 本参照を配布物側の適用形として所有するのは agentdev-workflow-lifecycle スキル。生成側は前工程（case-auto 等の orchestrator が委譲 prompt の入力内へ直列化、L41-47）。
- 参照先（L65-71）: `<workflows/workflow-contracts>` Design（原本）、`<workflows/delegation-contracts>` Design（委譲時の原本）、agentdev-case-run-execution-adapter スキルの委譲プロンプト雛形、references/reference-resolution.md（source / projection 目的判別）。
- REQ-048 旧行参照の所在: なし。本参照には REQ-048 表記が存在せず、旧行 ID の参照切断は発生していない。旧 REQ-048-007〜014 が規定していた領域は workflow-contracts / delegation-contracts 両 Design が正規所有する構造である。
- adf_* 表記: なし（委譲時の adf key 定義は harness-delegation.md 側、工程間は上記10意味キー）。

## 8. 観察（後続 Wave への事実提供）

本監査で検出した事実を後続 Wave の判断材料として記録する。本節は処分判断を含まない。

1. covers 宣言6群と新16行の番号衝突がトレーサビリティ解析（agentdev-traceability の coverage / check）に影響する。旧行を新行へ対応付ける同期作業、または covers 宣言の更新が必要な状態である。
2. verification-scope-catalog.md の REQ-048 セクションは旧タイトル・旧行範囲（REQ-048-007..014）で記録されており、新16行の行集合（REQ-048-001〜016）との対応が未定義。
3. baseline report の `baseline_for: REQ-048-021` は新16行に解決先が存在しない。再枠付け（OU-006 / #2603）まで現状維持であり、本監査では変更しない。
4. 契約テスト2本は covers 宣言と assertion 定数（describe 名、エラーメッセージ）が旧行 ID に依存する。行 ID の付け替え時はテスト2本の更新（OU-003 / #2600 の責務）が前提になる。
5. 契約テスト2本の実体が main repo untracked であり、worktree からは起動できない（junction 未伝播）。テスト実行は main repo 側でのみ可能という環境制約である。
6. 旧21行のうち新16行へ対応する行と対応しない行の区別は、REQ-048.md 再構築時の本文（REQ-048.md L18-20「旧 REQ-048 … を観測・評価対象として扱い直す」）と DEC-027 の併読で初めて判別可能であり、ID 表面上は機械判別できない。
