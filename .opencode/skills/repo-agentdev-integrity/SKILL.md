---
name: repo-agentdev-integrity
description: Repo-local integrity validation for agent-dev-flow self-hosting artifacts. Provides validator scripts for REQ/ADR/skill/command consistency, template validation, and skill structure linting. USE FOR: running integrity checks on agent-dev-flow repo artifacts, validating REQ frontmatter and cross-references, detecting legacy namespace remnants, verifying workflow templates, linting skill structures. DO NOT USE FOR: semantic content evaluation, user approval decisions, requirement analysis, or ADR necessity judgment.
---

# repo-agentdev-integrity

agent-dev-flow リポジトリ（self-hosting repo）の artifact 整合性検査を集約する repo-local skill。AgentDevFlow の配布対象外であり、consumer project では利用しない（ADR-0020）。機械的検査をスクリプトとして提供し、検査の再現性と信頼性を担保する。

## USE FOR

- agent-dev-flow repo artifact（REQ、ADR、skill、command、template）の整合性検査
- REQ frontmatter ↔ ファイル名整合性の確認
- ADR ↔ REQ 相互参照の確認
- Command-map ↔ 実体の整合性確認
- 旧 namespace 残存の検出
- 完了報告フォーマットの整合性検証（REQ-0107）
- ワークフローテンプレートの構造検証
- Skill 構造（SKILL.md）の lint
- 検出結果の Markdown レポート生成

## DO NOT USE FOR

- ドキュメント内容の意味的妥当性判定（→ `agentdev-req-analysis`、`agentdev-decision-guidelines`）
- ユーザー承認が必要かどうかの判断（→ 各コマンドの skill）
- 要件分析・壁打ち（→ `agentdev-req-analysis`）
- Decision 要否判断（→ `agentdev-decision-guidelines`）
- `spec-bug` / `impl-bug` / `scope-creep` の最終分類（→ `agentdev-quality-gates` QG-3、最終判断は case-update）
- `gh` 書き込み検証の orchestration（→ `agentdev-gh-cli`）
- 実装の自動修正（検査対象を直接修正しない原則。許可出力はレポート・intake item のみ）
- Consumer project での整合性検査（本 skill は self-hosting repo のみ対象）

## 検査対象定義

### Artifact カテゴリ

| カテゴリ | 対象パス | 収集方法 |
|----------|----------|----------|
| REQ ファイル | `docs/requirements/REQ-*.md` | glob |
| ADR ファイル（current） | `docs/adr/ADR-*.md` | glob |
| ADR ファイル（retired） | `docs/adr/retired/ADR-*.md` | glob |
| Skill 定義 | `.opencode/skills/*/SKILL.md` | glob |
| Skill reference (obsolete) | `.opencode/skills/**/reference/*.md` | glob (obsolete-structure if present) |
| Skill references (canonical) | `.opencode/skills/**/references/*.md` | glob |
| Command ファイル | `.opencode/commands/**/*.md`（README.md 含む） | glob |
| Root README | `README.md` | Read |
| Designs ファイル | `docs/designs/**/*.md`（再帰。README.md は Design inventory/status 同期検査でのみ対象、Design本文検査では除外） | glob (walkMarkdown) |
| Workflow templates | `.opencode/skills/agentdev-workflow-templates/templates/*.md` | glob |

### 検査カテゴリ

| 検査カテゴリ | スクリプト | 内容 |
|-------------|-----------|------|
| REQ frontmatter ↔ ファイル名 | `check_integrity.ts` | frontmatter id ↔ ファイル名、必須フィールド、README インデックス |
| Retired REQ frontmatter | `check_integrity.ts` | retired REQ filename ↔ id、必須フィールド、active/retired ID 重複 (REQ-0108-080~082) |
| ADR ↔ REQ 相互参照 | `check_integrity.ts` | 双方向参照の存在確認、current/retired 区別（REQ-0112-050） |
| Skill frontmatter | `check_integrity.ts` | name ↔ dir 一致、USE FOR 境界、reference/ 残存 (REQ-0108-092~094) |
| Command-map ↔ 実体 | `check_integrity.ts` | README ↔ 実ファイル、command inventory |
| Command frontmatter | `check_integrity.ts` | pattern / workflow_route / branch_type / labels 禁止、agent 名、deprecated 混入 (REQ-0108-095~099, 124) |
| 旧 namespace 残存 | `check_integrity.ts` | 旧コマンド名、旧パス、二重 prefix、bare slash (scoped) |
| 完了報告フォーマット | `check_integrity.ts` | completion-reports.md テンプレート存在、インライン完了報告、完了後追加出力、旧 terminology（REQ-0107） |
| Variant report | `check_integrity.ts` | variant 実在確認、registry 登録確認、必須フィールド、fragment 合成パターン (REQ-0108-089~091) |
| ADR status 正規化 | `check_integrity.ts` | 旧形式 `superseded-by:[ADR-XXXX]` 検出 (REQ-0108-121) |
| RU-ID 根拠参照 | `check_integrity.ts` | docs 永続文書内の RU-ID パターン検出 (REQ-0108-122) |
| Workflow status 禁止 | `check_integrity.ts` | REQ/Design 内の workflow status / 6 マイクロフェーズ検出 (REQ-0108-123) |
| Accepted ADR 引用 | `check_integrity.ts` | accepted 以外の ADR 引用検出（current baseline + retired 区別、推奨, REQ-0108-125, REQ-0112-050） |
| Workflow template 構造 | `check_templates.ts` | frontmatter、必須セクション、placeholder、命名規則 |
| Skill 構造 | `lint_skills.ts` | frontmatter name ↔ dir、USE FOR / DO NOT USE FOR、See Also |
| AG-005 規則群 | `lint_skills.ts` | skill 記述基準（層1〜2）機械検査。hard 6規則（description 1024/600 文字上限、マーカー語・内部 ID 混入、USE FOR 二重保持、後続トリガー語（AG-004、command-bound のみ厳密検査）、300 行超 references の目次欠落）+ warn 1規則（description 集約予算 350×N）。検出規則の登録は integrity-rule-catalog「AG-005 規則群」節（REQ-0145-005 判定記録を含む）、既知違反は `baselines/lint-skills-baseline.json` で管理（delta-aware、baseline-known は info 降格） |
| Junction 整合性 | `check_integrity.ts` | broken junction / symlink 検出（Windows junction / Unix symlink のリンク先不存在） |
| Capture boundary | `check_integrity.ts` | capture-boundaries.md 存在確認、PR template セクション名検証、command capture 責務記述確認（REQ-0105） |
| REQ verification basis | `check_integrity.ts` | REQ 要件行の検証基準が 規範語ではなく必達要件判定であること（REQ-0115-044） |
| Runtime reference | `check_integrity.ts` | 配布物（src/opencode/commands/agentdev、src/opencode/skills/agentdev-*/**/*.md）内の導入先未解決参照検出。baseline 既知と新規区別、段階導入（IR-055, REQ-0108-263/264） |
| Distribution untracked skill | `check_integrity.ts` | 配布物が `.opencode/skills/` 配下にのみ存在するスキルを参照した場合の src 昇格漏れ検出（IR-058, REQ-0159-003） |
| Guardrail number invariant | `check_integrity.ts` | 公開 command のガードレール番号（Gxx）不変量: 開始番号（G01 起点）・欠番・重複・未定義本文参照（IR-063, REQ-010-064, Issue #2372）。既知違反は NG baseline（delta-aware） |
| Unresolved placeholder | `check_integrity.ts` | 実行時配布対象の未解決プレースホルダー: TODO 系マーカー（strict）と ID プレースホルダー裸出力（heuristic）。許容条件: テンプレート、code block、code span、括弧内、引用「」内列挙（IR-064, REQ-010-065, Issue #2372） |
| Obsolete vocabulary & legacy path | `check_integrity.ts` | 廃止語彙（旧 ADR 表記等）・旧パス・削除済み名称の現行概念としての使用検出（IR-065/IR-066, REQ-010-066/067, Issue #2372）。許容条件: `v2:` プレフィックス、行レベル履歴マーカー、superseded Decision、否定文脈、existence_probe、exemption_files（`data/obsolete-vocabulary-map.yaml`）。v1〜v4 監査観点再走査（Issue #2383 (b)）採用分の廃止語彙（`inspect-extensions`、`agentdev-spec-file-manager`、`agentdev-workflow-spec-save`）を IR-066 語彙へ拡張 |
| 引用 REQ 行実在性 | `check_integrity.ts` | docs 本文が引用する階層 REQ 行 ID（REQ-NNN-NNN）の実在性検査。ファントム引用（未コミット草案番号・要件分割前の旧行 ID 残存）を検出（IR-067, REQ-010-069, Issue #2383 (a)）。許容条件: `v2:` プレフィックス、プレースホルダー様式例示（REQ-010-065）、code span/code block、テンプレート領域、IR ルール説明文、AUTOGEN ブロック、retired ディレクトリ。既知違反（要件分割由来の旧行 ID 引用）は NG baseline（delta-aware） |
| スキル集合突合（投影マニフェスト） | `check_integrity.ts` | src 側スキル集合（SSoT）と `.opencode/skills` 投影スキル集合の突合を検査データ化（IR-068, Issue #2383 (d)、inspect F-01）。`data/skill-projection-manifest.yaml`（src 列挙の検出ビュー）との不一致はデータ鮮度 NG。投影比較は junction 環境のみ実施し、worktree（junction 未伝播、REQ-018）では info で skip。リンク先欠損の stale junction（解決不能投影エントリ）は projection-broken として検出 |
| Skill rename 対称性 | `check_skill_rename_symmetry.ts` | 恒常検査: SKILL.md frontmatter `name` ↔ 親 dir、Design title token ↔ filename stem（frontmatter id ↔ 物理 path 整合、REQ-010-063）。`--rename <旧名>=<新名>` 宣言時のみ旧名・新名間の path 一致（src/opencode/skills/{name} ↔ docs/designs/skills/{name}.md の対称性）を検査。同名 Skill Design の存在は恒常不変条件としない（Workflow Skill は違反としない）。`status: superseded` Design の skill dir 欠落は許容、`status: draft` は warning |

### 補助検査スクリプト（categoryToCheckPattern 対象外）

以下の検査は `categoryToCheckPattern` map で管理されない補助スクリプトによる検査である（integrity-rule-catalog.md「新規カテゴリ追加判定フロー」: map 追加不要の方針に従う）:

| 検査 | スクリプト | 内容 |
|------|-----------|------|
| Obsolete design path | `check_integrity.ts` | `obsolete-path-map.yaml` に基づく旧Design直下パス参照検出、直接生成方式語彙検出（IR-057, REQ-0158-002） |
| Distribution reference boundary | `check_distribution_boundary.ts` | 配布 command/skill 本文（`src/opencode/commands/agentdev/**/*.md`, `src/opencode/skills/agentdev-*/**/*.md`）に含まれる具体ID（`ADR-NNNN`, `REQ-NNNN`）、具体パス（`docs/(adr\|requirements\designs)/<file>.md`、但し README.md とテンプレート表記は除外）、固定URL（blob/raw）を検出。project extensions 機構（配布物参照境界）の持続的検査を担う |
| Targeted docs guard | `check_changed_docs.ts` | 変更ファイル限定の整合性検査。req-save / design-save / case-close / docs-check の各 workflow で実行（REQ-0158-003） |
| Workflow preventive checks | `check_workflow_preventive.ts` | AG-008 旧責務残存の予防検査7項目（全公開 Command の Workflow Skill dispatch 存在、dispatch 先 Skill 存在、Workflow Skill の description 簡潔トリガー項存在（AG-004、検出語は lint_skills.ts と統一）、旧 extension kind・runtime path 残存禁止、Command から Skill 内部 reference 直接依存禁止、Workflow/Capability 分類と Extension kind 整合、command-format rules と thin Command モデル無矛盾）。false positive 対策の exemption は script 本体に構造化 |

### Finding レベル（REQ-0108-100~105）

| レベル | 意味 | 取扱い |
|--------|------|--------|
| strict | 存在、参照、frontmatter、index、registry など再現可能な検査 | 標準 NG/OK 判定 |
| heuristic | 意味判断を含むが明確な根拠を持つ warning | 確認推奨 |
| observation | 参考情報。標準レポートの主 finding や NG カウントに含めない | 報告のみ |

## 検出結果分類基準

| レベル | 意味 | 取扱い |
|--------|------|--------|
| NG | 不整合が検出された（strict/heuristic） | 修正必須 / 確認推奨 |
| warning | 疑わしいが確定ではない（heuristic） | 確認推奨 |
| info | 参考情報（observation） | 報告のみ |

**方針**: false positive（過検出）を許容し、false negative（見逃し）を減らす。observation レベルの finding は標準レポートの主 finding や NG カウントに含めない（REQ-0108-103）。

#### ADR意味妥当性の判定方針（REQ-0112-043）

本スキルはADRの**機械的整合性**（frontmatter・ファイル名・ステータス遷移・相互参照）を検査し、ADRの**意味的妥当性**（技術判断を含むか、正しい文書種別か）のstrict判定は行わない。

**誤分類兆候の検出（warning/observation）**:

以下の兆候を検出した場合はwarningまたはobservationとして報告する（errorとしては扱わない）:

| 兆候 | 検出基準 | レベル |
|------|---------|--------|
| 技術判断不在 | ADRのDecision sectionに技術的決定が見当たらない | observation |
| REQ/Design相当内容の混入 | ADR本文にcommand仕様・workflow定義・運用ルール等が記述されている | observation |
| ADR-0017適合外 | ADR-0017（文書種別責務境界）で定義されたADR適用基準を満たしていない | warning |
| 文書種別不一致 | ADRの内容が実際にはREQ/Design/guideの適用範囲に該当する | warning |

## レポート Schema

### Markdown 出力

`/repo/docs-check` command のレポート形式に準拠。

```markdown
# Docs Check Report

- **実行日時**: YYYY-MM-DD HH:MM
- **スキャン対象**: REQ N件、ADR N件、Skill N件、Command N件

## サマリ

| 検査カテゴリ | OK | NG | 備考 |
|-------------|----|----|------|
| REQ frontmatter↔ファイル名 | N | N | — |
| ADR↔REQ 相互参照 | N | N | — |
| Command-map↔実体 | N | N | — |
| 旧 namespace 残存 | N | N | — |
| 完了報告フォーマット | N | N | — |
| ADR status 正規化 | N | N | — |
| RU-ID 根拠参照 | N | N | — |
| Workflow status 禁止 | N | N | — |
| Accepted ADR 引用 | N | N | — |

## 詳細

### REQ frontmatter↔ファイル名
{検出結果の詳細}
```

## 出力規約

- **レポート出力先**: `.agentdev/integrity/reports/`
- **ファイル名**: `YYYY-MM-DD-integrity-report.md`
- **ディレクトリが存在しない場合**: 作成する
- **過去レポート**: 上書きしない（日付ベースで毎回新規作成）

## スキルの責務範囲

本スキルは検査・レポートschema定義のみを提供する。intake item の作成（`.agentdev/intake/inbox/` へのファイル生成）は `/repo/docs-check` コマンドの責務であり、本スキルは intake item 作成の判定基準や手順を定義しない。

## Validator 呼び出し規約

- `--help`: 使用方法を表示
- `--json`: JSON 形式で出力
- `--dry-run`: 検査を実行せず対象一覧を表示
- `--profile source|installed|release`: 実行 profile（既定 `source`、Issue #1928 / WP-3）。詳細は `docs/designs/integrity/integrity-contracts.md`「実行プロファイル分離」
  - `source`: 原本（`src/opencode/`、docs、repo-local checker）を直接検査。projection 検査は対象外
  - `installed`: 原本と配置先（`.opencode/`）を比較し、配置漏れ（`projection_missing` / `projection_extra` / `content_mismatch` / `broken_junction` / `missing_required_dir`）を検出
  - `release`: `--archive <zip>` 必須。archive 展開→`install-from-archive.ps1`→`installed` profile を `--root` 付きで host 側 checker が実行
- `--archive <zip>`: `--profile release` のとき必須。それ以外では無視
- `--root <path>`: リポジトリルート（REQ-0145-014、worktree/CI support）
- exit code: 0（問題なし）、1（検査NG/warning）、2（入力不正・実行エラー）
- 非対話実行
- 破壊的変更を行わない

## 共通 CLI 契約ユーティリティ

`scripts/cli_utils.ts` に共通パーサー・フォーマッタを提供する。各 validator script はこれを import して使用する。

## 語彙レジストリ

旧語彙検出の根拠として `references/vocabulary-registry.md` を参照する。IR-050/051 の判定対象（command 名・harness 名・subagent 名）・IR-051 距離閾値（REQ-0145-007）も本レジストリに集約する。

## 新規カテゴリ追加判定フロー（REQ-0145-005）

新規 NG ルール・検査カテゴリを追加する際、既存 NG への副作用を評価してから追加する。詳細手順は [integrity-rule-catalog.md](../../../../docs/designs/integrity-rule-catalog.md)「新規カテゴリ追加判定フロー」参照。本 SKILL.md は判定基準の提示のみを担い、追加可否の最終判断は運用者（HITL）が行う。

判定項目（全て満たす必要あり）:

1. 既存ルールの exemption 条件・baseline_status・severity 分類との整合性
2. catalog エントリ（15 フィールド以上・`baseline_status: new`）の追加
3. `check_integrity.ts` 実装（exemption・false_positive_risk 反映）
4. `check_integrity.test.ts` の drift detection smoke test 通過
5. 語彙検出関わる場合の `vocabulary-registry.md` 同期
6. `check_integrity.ts` の `categoryToCheckPattern` map 更新（skill-category-gap 解消）

## See Also

- **agentdev-req-file-manager**: REQ 番号採番ルール、frontmatter 規約
- **agentdev-decision-file-manager**: Decision 構造定義
- **agentdev-gh-cli**: gh 書き込み後の body verifier (`verify_body.ts`)
- **agentdev-workflow-templates**: ワークフローテンプレート定義

## Junction 管理手順（Windows 環境）

Windows 環境では `.opencode/skills/` および `.opencode/commands/` 配下のディレクトリは `src/opencode/` への junction（reparse point）として実現される。Git は junction を追跡しないため、運用上の注意が必要。

### 作成

```powershell
# Skill junction 作成
cmd /c mklink /J ".opencode\skills\{skill-name}" "src\opencode\skills\{skill-name}"

# Command junction 作成
cmd /c mklink /J ".opencode\commands\agentdev" "src\opencode\commands\agentdev"
```

### 検証

```powershell
# Junction 一覧確認
cmd /c "dir /al .opencode\skills"

# Junction 先が存在するか確認
Test-Path -LiteralPath "src\opencode\skills\{skill-name}"
```

integrity-check スクリプト（docs-check で使用）の `checkBrokenJunctions` が `.opencode/skills/` 内の broken junction を自動検出する。

### 削除

```powershell
# Junction の削除（rmdir を使用。del は不可）
cmd /c rmdir ".opencode\skills\{skill-name}"

# または PowerShell
Remove-Item -LiteralPath ".opencode\skills\{skill-name}" -Recurse -Force
```

### 注意事項

- `git worktree` は junction をコピーしない。worktree 内で junction が必要な場合は手動で再作成する
- junction は `.gitignore` に含まれるため、Git では追跡されない
- skill のリネーム・移動時は junction の再作成が必要
- broken junction は `check_integrity.ts` の `JunctionIntegrity` チェックで検出される
