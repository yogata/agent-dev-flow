---
description: docs整合性検査（旧称: integrity-check）。agent-dev-flow repo self-audit（repo-local, not distributed to consumers）
agent: sisyphus
---
<!-- ADF-COVERS(implementation): REQ-010-001, REQ-010-002, REQ-010-003, REQ-010-004, REQ-010-071 -->

# Repo Self-Audit: Docs Check

agent-dev-flow リポジトリの自己監査コマンド。AgentDevFlow 管理下の artifact（REQ、Decision、skill、command、design）の整合性を検査し、結果をレポートとして出力する。検査対象 artifact を直接修正せず、許可出力は `.agentdev/integrity/reports/` のレポートと `.agentdev/intake/inbox/` の intake item のみ。

> **Note**: このコマンドは repo-local であり、AgentDevFlow の配布対象外である。Consumer project では利用しない。

## 基本原則: 検査対象を直接修正しない制約

検査対象 artifact を変更しない。許容する新規作成は `.agentdev/integrity/reports/` のレポート生成と `.agentdev/intake/inbox/` の intake item（実行＝保存承認、REQ-0108-225）。

## 入力

なし（コマンド実行時に全 artifact を自動スキャン）

## 出力

- `.agentdev/integrity/reports/YYYY-MM-DD-integrity-report.md` — 検出結果レポート（非永続、commit/push対象外）
- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` — 通常 intake item（NG/WARNING finding から自動生成、0件以上）

## workflow

本コマンドは repo-local command であり、Workflow Skill への委譲を持たない（workflow 本体を command 本文が所有する）。各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 スクリプト実行 | なし（コマンド実行時に全 artifact を自動スキャン） | 検査スクリプト群の実行結果（exit code・検出結果） | 検査スクリプト群をすべて `bun run` 形式で起動・実行していること。strict failure を示す終了コード1は docs-check 全体の失敗として扱っていること |
| STEP-2 レポート確認・Finding整理 | 検査スクリプト実行済み | 重複・誤検出・根拠を確認した整理済み finding 群 | report の NG/WARNING finding のみを対象とし（INFO は対象外、REQ-0108-224）、同一是正方針で統合可能かの判断を経ていること（REQ-0108-222。固定単位での機械的分割を行っていないこと） |
| STEP-3 Intake Item 自動生成 | finding 整理済み | `.agentdev/intake/inbox/` へ保存された通常 intake item（0件以上） | `/agentdev/intake-capture` の通常形式（frontmatter・route・dedup keyなし）に従い、各 item が自己完結（非永続 report への参照なしで後続処理成立）であること。原因分類が確認済/仮説/不明で区別されていること（実行＝保存承認、REQ-0108-225。採否は `intake-promote` へ委譲） |
| STEP-4 Git 永続化（条件付き） | intake item 作成あり | commit・push（`.agentdev/intake/` 配下のみ） | intake item 作成時のみ commit/push を行い、`git add` が `.agentdev/intake/` 配下に限定されていること（integrity report は commit 対象外、REQ-0108-229） |
| STEP-5 完了報告 | 永続化処理済み（intake item 未作成時は STEP-3 で 0 件確認済み） | 完了報告 | 完了報告 template（.opencode/commands/repo/templates/docs-check/standard.md）に従って出力していること |

**STEP-1 検査スクリプト群の実行詳細**:

- **実行ランナー（REQ-0108-054）**: 本 command が呼び出す検査スクリプト群（検証エンジン `cli.ts`、`lint_skills.ts`、`check_autogen_freshness.ts`）は TypeScript 直接実行と `require()` / `import` 混在構文、併設テストの `bun:test` 依存を前提とするため、実行ランナーは **Bun** とする。`node` 等の Bun 以外のランナーで直接起動すると `ReferenceError: require is not defined` 等 ESM 解釈エラーが発生する。スクリプトは `bun run <script-path>` 形式で起動すること
- **full integrity suite（検証エンジン全量実行、DEC-065 決定3）**: `bun run src/common/skills/repo-agentdev-integrity/scripts/cli.ts` を `bun run` で実行する。検証エンジンは残存24 IR ルール（rules レジストリ）とエンジン内蔵検査（未追跡ファイル検出 REQ-010-084、既知混入形の異言語文字混入検出 REQ-010-083）を単一走査の共有コンテキストで実行する。検査カテゴリ・対象パス・検出結果の分類は `docs/designs/integrity/integrity-rule-catalog.md`（rules レジストリから自動生成）と各ルール文書 `docs/designs/integrity/rules/IR-NNN-*.md` を authoritative source とする。exit code 1（違反または warning）は docs-check 全体の失敗として扱う
- **IR-056（project extensions 整合性）**: 検証エンジンの rules レジストリ（ir-056）として全量実行に含まれ、strict に取り扱う（project extensions Design、project extensions 読み込み標準 skill）。IR-056 の strict 違反は docs-check 全体を fail とする
- **配布物参照境界（配布 command/skill 本文の具体参照禁止）**: 検証エンジンの rules レジストリ（ir-059）として全量実行に含まれる。配布物本文の具体 ID・具体パス・固定 URL を検出し、厳格に取り扱う。IR-059 の違反は docs-check 全体を fail とする
- **Skill 記述基準（AG-005 規則群）**: `lint_skills.ts`（`src/common/skills/repo-agentdev-integrity/scripts/lint_skills.ts`）を `bun run` で併せて実行する。AG-005 規則群は IR レジストリ外の checker カテゴリであり、検出違反は baseline による免除管理を行わず対象側の直接修正で解消する。lint_skills.ts の failure は docs-check 全体を fail とする
- **AUTOGEN ブロック鮮度検出 gate（REQ-010-059、autogen-freshness-gate Design）**: `check_autogen_freshness.ts`（`src/common/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts`）を `bun run` で併せて実行する。AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=xxx -->`〜`<!-- AUTOGEN:END -->`）を含む索引ファイル群について、ソース（frontmatter / ファイル名 / status）の rename や status 変更後に AUTOGEN ブロックが陳腐化しているかを検出し、鮮度種別（rename / status_change / content_change）を分類して報告する。check_autogen_freshness.ts の strict failure（stale blocks 検出）は docs-check 全体を fail とする。不合格時は `bun run src/common/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` で AUTOGEN ブロックを再生成すること（自動修復は行わない、Design「不合格時の処置」）。IR-061（検証エンジン rules レジストリ）と同一不整合を検出し得るが、両検査は独立して実施し、いずれか単独の実施要否にも他方の結果は影響しない
- **full integrity suite（bun test 全件、QG-4 bun test 実行形態契約）**: `bun test ./src/` を実行する。`./` prefix 付きで対象ディレクトリを明示指定する（必須ステップ）。実行結果の「Ran N tests across M files」の N/M 件数突合を実施し（必須ステップ）、直前実績と比較して件数が急減していないかの妥当性を検証する（固定値の期待値化は行わない）。実行 cwd と起動コマンド形式（prefix・パス指定を含む）をレポートの証拠記録に明記する。対象スイートには cwd 依存テストが混在するため、カレントディレクトトリビアな実行（`bun test` 単体等）で代替しない

## ガードレール

- 検査対象 artifact を変更しない。レポート・intake item の新規作成のみ許容
- `git` コマンドは intake item 作成時にのみ `.agentdev/intake/` 配下に限定
- finding は intake 対象（原則）。learning item の直接作成は行わない（MUST NOT）
- finding 分類・ルートを付与すること（REQ-0101）
- intake item は NG/WARNING finding から自動生成する。実行＝保存承認（REQ-0108-225）。採否は intake-promote に委譲（REQ-0108-226）。learning/RU/REQ の直接生成禁止（MUST NOT、REQ-0108-227）
- `gh` コマンドは使用しない
- `agentdev-req-analysis`（manual reference）の要件分析手法を参照して REQ フィールド検査
- `agentdev-decision-guidelines`（manual reference）および Decision lifecycle Design（`docs/designs/foundations/decision-lifecycle.md`）の Decision 構造定義を参照して Decision フィールド検査
