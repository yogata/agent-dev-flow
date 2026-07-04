---
description: docs整合性検査（旧称: integrity-check）。agent-dev-flow repo self-audit（repo-local, not distributed to consumers）
agent: sisyphus
---

# Repo Self-Audit: Docs Check

agent-dev-flow リポジトリの自己監査コマンド。AgentDevFlow 管理下の artifact（REQ、ADR、skill、command、spec）の整合性を検査し、結果をレポートとして出力する。検査対象 artifact を直接修正せず、許可出力は `.agentdev/integrity/reports/` のレポートと `.agentdev/intake/inbox/` の intake item のみ。

> **Note**: このコマンドは repo-local であり、AgentDevFlow の配布対象外である。Consumer project では利用しない。

## 基本原則: 検査対象を直接修正しない制約

検査対象 artifact を変更しない。許容する新規作成は `.agentdev/integrity/reports/` のレポート生成と `.agentdev/intake/inbox/` の intake item（実行＝保存承認、REQ-0108-225）。

## 入力

なし（コマンド実行時に全 artifact を自動スキャン）

## 出力

- `.agentdev/integrity/reports/YYYY-MM-DD-integrity-report.md` — 検出結果レポート（非永続、commit/push対象外）
- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` — 通常 intake item（NG/WARNING finding から自動生成、0件以上）

## 手順

### Step 1: スクリプト実行

**実行ランナー（REQ-0108-054）**: 本 command が呼び出す検査スクリプト群（`check_integrity.ts`、`check_command_format.ts`、`check_extensions.ts`、`check_distribution_boundary.ts`、`check_changed_docs.ts`、`check_templates.ts`、`lint_skills.ts`）は TypeScript 直接実行と `require()` / `import` 混在構文、併設テストの `bun:test` 依存を前提とするため、実行ランナーは **Bun** とする。`node` 等の Bun 以外のランナーで直接起動すると `ReferenceError: require is not defined` 等 ESM 解釈エラーが発生する。スクリプトは `bun run <script-path>` 形式で起動すること。

`repo-agentdev-integrity` の検査スクリプト（`.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`）を `bun run` で実行。検査カテゴリ・対象パス・検出結果の分類は SKILL.md（.opencode/skills/repo-agentdev-integrity/SKILL.md）の検査カテゴリ定義を authoritative source とする。command 定義ファイルフォーマット違反検出（IR-049・`check_command_format.ts`）を含む
- Finding 分類・ルートは SKILL.md の定義に準拠
- **IR-056（project extensions 整合性）**: `check_extensions.ts`（`.opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts`）を `bun run` で併せて実行し、IR-056 として strict に取り扱う（project extensions SPEC、project extensions 読み込み標準 skill）。check_extensions.ts の strict failure は docs-check 全体を fail とする
- **配布物参照境界（配布 command/skill 本文の具体参照禁止）**: `check_distribution_boundary.ts`（`.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts`）を `bun run` で併せて実行する。配布 command/skill 本文（`src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/agentdev-*/**/*.md`）に含まれる具体ID（`ADR-NNNN`、`REQ-NNNN`）、具体パス（`docs/(adr|requirements|specs)/<file>.md`、但し README.md とテンプレート表記は除外）、固定URL（blob/raw）を検出し、厳格に取り扱う。check_distribution_boundary.ts の failure は docs-check 全体を fail とする

### Step 2: レポート確認・Finding整理

reportのNG/WARNING findingについて重複・誤検出・根拠を確認し整理する。INFOは対象外（REQ-0108-224）。エージェントがfinding群を確認し、同一是正方針で統合可能かを判断する（REQ-0108-222）。固定単位での機械的分割は禁止。

### Step 3: Intake Item 自動生成

整理結果から通常intake itemを生成し、`.agentdev/intake/inbox/`に保存。形式は`/agentdev/intake-capture`の通常形式に従う（frontmatter・route・dedup keyなし）。各itemは自己完結（非永続reportへの参照なしで後続処理成立）。原因分類は確認済/仮説/不明を区別。実行＝保存承認（REQ-0108-225）。採否は`intake-promote`に委譲。learning/RU/REQの直接生成禁止（MUST NOT）。

### Step 4: Git 永続化（条件付き）

intake item作成時のみcommit/push。`git add`は`.agentdev/intake/`配下のみ。integrity reportはcommit対象外（REQ-0108-229）。

### Step 5: 完了報告

完了報告templateに従って出力。template: .opencode/commands/repo/templates/docs-check/standard.md

## ガードレール

- G01: 検査対象 artifact を変更しない。レポート・intake item の新規作成のみ許容
- G02: `git` コマンドは intake item 作成時にのみ `.agentdev/intake/` 配下に限定
- G03: finding は intake 対象（原則）。learning item の直接作成は行わない（MUST NOT）
- G04: finding 分類・ルートを付与すること（REQ-0101）
- G05: intake item は NG/WARNING finding から自動生成する。実行＝保存承認（REQ-0108-225）。採否は intake-promote に委譲（REQ-0108-226）。learning/RU/REQ の直接生成禁止（MUST NOT、REQ-0108-227）
- G06: `gh` コマンドは使用しない
- G07: `agentdev-req-analysis`（manual reference）の要件分析手法を参照して REQ フィールド検査
- G08: `agentdev-adr-guidelines`（manual reference）の ADR 構造定義を参照して ADR フィールド検査
