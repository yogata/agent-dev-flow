---
name: agentdev-integrity
description: Centralized integrity validation for AgentDevFlow artifacts. Provides validator scripts for REQ/ADR/skill/command consistency, template validation, and skill structure linting. USE FOR: running integrity checks on AgentDevFlow artifacts, validating REQ frontmatter and cross-references, detecting legacy namespace remnants, verifying workflow templates, linting skill structures. DO NOT USE FOR: semantic content evaluation, user approval decisions, requirement analysis, or ADR necessity judgment.
---

# agentdev-integrity

AgentDevFlow 管理下の artifact の整合性検査を集約する skill。機械的検査をスクリプトとして提供し、検査の再現性と信頼性を担保する。

## USE FOR

- AgentDevFlow artifact（REQ、ADR、skill、command、template）の整合性検査
- REQ frontmatter ↔ ファイル名整合性の確認
- ADR ↔ REQ 相互参照の確認
- Command-map ↔ 実体の整合性確認
- 旧 namespace 残存の検出
- 完了報告フォーマットの整合性検証（REQ-0107, REQ-0107）
- ワークフローテンプレートの構造検証
- Skill 構造（SKILL.md）の lint
- 検出結果の Markdown レポート生成

## DO NOT USE FOR

- ドキュメント内容の意味的妥当性判定（→ `agentdev-req-analysis`、`agentdev-adr-guidelines`）
- ユーザー承認が必要かどうかの判断（→ 各コマンドの skill）
- 要件分析・壁打ち（→ `agentdev-req-analysis`）
- ADR 要否判断（→ `agentdev-adr-guidelines`）
- `spec-bug` / `impl-bug` / `scope-creep` の最終分類（→ `agentdev-spec-compliance`）
- `gh` 書き込み検証の orchestration（→ `agentdev-gh-cli`）
- 実装の自動修正（read-only 原則）

## 検査対象定義

### Artifact カテゴリ

| カテゴリ | 対象パス | 収集方法 |
|----------|----------|----------|
| REQ ファイル | `docs/requirements/REQ-*.md` | glob |
| ADR ファイル | `docs/adr/ADR-*.md` | glob |
| Skill 定義 | `.opencode/skills/*/SKILL.md` | glob |
| Skill reference (obsolete) | `.opencode/skills/**/reference/*.md` | glob (obsolete-structure if present) |
| Skill references (canonical) | `.opencode/skills/**/references/*.md` | glob |
| Command ファイル | `.opencode/commands/**/*.md`（README.md 含む） | glob |
| Root README | `README.md` | Read |
| Specs ファイル | `docs/specs/*.md` | glob |
| Workflow templates | `.opencode/skills/agentdev-workflow-templates/templates/*.md` | glob |

### 検査カテゴリ

| 検査カテゴリ | スクリプト | 内容 |
|-------------|-----------|------|
| REQ frontmatter ↔ ファイル名 | `check_integrity.ts` | frontmatter id ↔ ファイル名、必須フィールド、README インデックス |
| Retired REQ frontmatter | `check_integrity.ts` | retired REQ filename ↔ id、必須フィールド、active/retired ID 重複 (REQ-0108-080~082) |
| ADR ↔ REQ 相互参照 | `check_integrity.ts` | 双方向参照の存在確認、retired 区別 |
| Skill frontmatter | `check_integrity.ts` | name ↔ dir 一致、USE FOR 境界、reference/ 残存 (REQ-0108-092~094) |
| Command-map ↔ 実体 | `check_integrity.ts` | README ↔ 実ファイル、command inventory |
| Command frontmatter | `check_integrity.ts` | implementation_pattern / secondary_pattern / load_skills 禁止検出、pattern / workflow_route / branch_type / labels 禁止、agent 名、deprecated 混入 (REQ-0108-095~099, 124, Case 5 / RU-0020) |
| 旧 namespace 残存 | `check_integrity.ts` | 旧コマンド名、旧パス、二重 prefix、bare slash (scoped) |
| 完了報告フォーマット | `check_integrity.ts` | load_skills 参照、completion-reports.md テンプレート存在、インライン完了報告、完了後追加出力、旧 terminology（REQ-0107, REQ-0107） |
| Variant report | `check_integrity.ts` | variant 実在確認、registry 登録確認、必須フィールド、fragment 合成パターン (REQ-0108-089~091) |
| Mapping table | `check_integrity.ts` | 全件記録・存在確認・移行先確認・status enum 検査 (REQ-0108-083~088) |
| ADR status 正規化 | `check_integrity.ts` | 旧形式 `superseded-by:[ADR-XXXX]` 検出 (REQ-0108-121) |
| RU-ID 根拠参照 | `check_integrity.ts` | docs 永続文書内の RU-ID パターン検出 (REQ-0108-122) |
| Workflow status 禁止 | `check_integrity.ts` | REQ/SPEC 内の workflow status / 6 マイクロフェーズ検出 (REQ-0108-123) |
| Accepted ADR 引用 | `check_integrity.ts` | accepted 以外の ADR 引用検出 (SHOULD, REQ-0108-125) |
| Workflow template 構造 | `check_templates.ts` | frontmatter、必須セクション、placeholder、命名規則 |
| Skill 構造 | `lint_skills.ts` | frontmatter name ↔ dir、USE FOR / DO NOT USE FOR、See Also |

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

## レポート Schema

### Markdown 出力

`/agentdev/integrity-check` command の Step 7 レポート形式に準拠。

```markdown
# Integrity Check Report

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

### ADR↔REQ 相互参照
{検出結果の詳細}

### Command-map↔実体
{検出結果の詳細}

### 旧 namespace 残存
{検出結果の詳細}

### 完了報告フォーマット
{検出結果の詳細}
```

## 出力規約

- **レポート出力先**: `.agentdev/integrity/reports/`
- **ファイル名**: `YYYY-MM-DD-integrity-report.md`
- **ディレクトリが存在しない場合**: 作成する
- **過去レポート**: 上書きしない（日付ベースで毎回新規作成）

## スキルの責務範囲

本スキルは検査・レポートschema定義のみを提供する。intake item の作成（`.agentdev/intake/inbox/` へのファイル生成）は `/agentdev/integrity-check` コマンドの責務であり、本スキルは intake item 作成の判定基準や手順を定義しない。

## Validator 呼び出し規約

- `--help`: 使用方法を表示
- `--json`: JSON 形式で出力
- `--dry-run`: 検査を実行せず対象一覧を表示
- exit code: 0（問題なし）、1（検査NG）、2（入力不正・実行エラー）
- 非対話実行
- 破壊的変更を行わない

## 共通 CLI 契約ユーティリティ

`scripts/cli_utils.ts` に共通パーサー・フォーマッタを提供する。各 validator script はこれを import して使用する。

## See Also

- **agentdev-req-file-manager**: REQ 番号採番ルール、frontmatter 規約
- **agentdev-adr-guidelines**: ADR 構造定義
- **agentdev-gh-cli**: gh 書き込み後の body verifier (`verify_body.ts`)
- **agentdev-workflow-templates**: ワークフローテンプレート定義
- **agentdev-spec-compliance**: 仕様適合性検出
