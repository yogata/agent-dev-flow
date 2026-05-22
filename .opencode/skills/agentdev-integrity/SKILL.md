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
- Skill ↔ load_skills 参照整合性の確認
- Command-map ↔ 実体の整合性確認
- 旧 namespace 残存の検出
- ワークフローテンプレートの構造検証
- Skill 構造（SKILL.md）の lint
- 検出結果の JSON / Markdown レポート生成

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
| Skill reference | `.opencode/skills/**/reference/*.md` | glob |
| Skill references | `.opencode/skills/**/references/*.md` | glob |
| Command ファイル | `.opencode/commands/**/*.md`（README.md 含む） | glob |
| Root README | `README.md` | Read |
| Specs ファイル | `docs/specs/*.md` | glob |
| Workflow templates | `.opencode/skills/agentdev-workflow-templates/templates/*.md` | glob |

### 検査カテゴリ

| 検査カテゴリ | スクリプト | 内容 |
|-------------|-----------|------|
| REQ frontmatter ↔ ファイル名 | `check_integrity.ts` | frontmatter id ↔ ファイル名、必須フィールド、README インデックス |
| ADR ↔ REQ 相互参照 | `check_integrity.ts` | 双方向参照の存在確認 |
| Skill ↔ load_skills 参照 | `check_integrity.ts` | load_skills 先存在、agentdev- prefix、未使用 skill |
| Command-map ↔ 実体 | `check_integrity.ts` | README ↔ 実ファイル、command inventory |
| 旧 namespace 残存 | `check_integrity.ts` | 旧コマンド名、旧パス、二重 prefix |
| Workflow template 構造 | `check_templates.ts` | frontmatter、必須セクション、placeholder、命名規則 |
| Skill 構造 | `lint_skills.ts` | frontmatter name ↔ dir、USE FOR / DO NOT USE FOR、See Also |

## 検出結果分類基準

| レベル | 意味 | 取扱い |
|--------|------|--------|
| NG | 不整合が検出された | 修正必須 |
| warning | 疑わしいが確定ではない | 確認推奨 |
| info | 参考情報 | 報告のみ |

**方針**: false positive（過検出）を許容し、false negative（見逃し）を減らす。

## レポート Schema

### JSON 出力

```typescript
interface IntegrityReport {
  timestamp: string;          // ISO 8601
  scanned: {
    reqs: number;
    adrs: number;
    skills: number;
    commands: number;
    templates: number;
  };
  summary: {
    ok: number;
    ng: number;
    warning: number;
    info: number;
  };
  results: CheckResult[];
}

interface CheckResult {
  category: string;
  check: string;
  level: "ok" | "ng" | "warning" | "info";
  message: string;
  file?: string;
  line?: number;
}
```

### Markdown 出力

`/agentdev/integrity-check` command の Step 7 レポート形式に準拠。

## 出力規約

- **レポート出力先**: `.agentdev/integrity/reports/`
- **ファイル名**: `YYYY-MM-DD-integrity-report.{json,md}`
- **ディレクトリが存在しない場合**: 作成する
- **過去レポート**: 上書きしない（日付ベースで毎回新規作成）

## Intake Item 化候補ルール

- NG レベルの検出結果は intake item 化候補とする
- warning レベルはユーザー判断に委ねる
- 検出 → intake item 化の最終判断は `/agentdev/integrity-check` command（ユーザー承認時のみ）

## Validator 呼び出し規約

各 validator script は 共通 CLI 契約（REQ-0021-021~027）に従う:

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
