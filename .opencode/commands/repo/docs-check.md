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

`repo-agentdev-integrity` の検査スクリプト（`.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`）を実行。検査カテゴリ・対象パス・検出結果の分類は SKILL.md（.opencode/skills/repo-agentdev-integrity/SKILL.md）の検査カテゴリ定義を authoritative source とする。command 定義ファイルフォーマット違反検出（IR-049・`check_command_format.ts`）を含む
- Finding 分類・ルートは SKILL.md の定義に準拠
- **IR-056（project read contract 整合性）**: `check_read_contracts.ts`（`.opencode/skills/repo-agentdev-integrity/scripts/check_read_contracts.ts`）を併せて実行し、IR-056 として strict に取り扱う（ADR-0133、REQ-0157）。check_read_contracts.ts の strict failure は docs-check 全体を fail とする

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
