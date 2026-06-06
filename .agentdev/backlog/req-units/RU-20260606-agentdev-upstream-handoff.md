---
source_type: chat
generated_by: session
generated_at: 2026-06-06T14:00:00+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-06-agentdev-upstream-handoff
---

# RU: AgentDevFlow upstream handoff runtime behavior

## 背景

AgentDevFlow 適用プロジェクトでは、実装対象はその適用プロジェクトである。

agent-dev-flow repository では、AgentDevFlow 本体の workflow / command / skill / template / docs が現在プロジェクトの成果物であり、通常の req/case workflow により改修対象にできる。

AgentDevFlow 適用プロジェクトで AgentDevFlow 本体の不具合・改善点を発見することはあるが、その場で AgentDevFlow 配布物を直接改修するのではなく、agent-dev-flow repository へ手動取り込みする upstream handoff 用 RU として整理する必要がある。

## 問題

現状の command / skill には、AgentDevFlow 適用プロジェクトで AgentDevFlow 本体の改善点を扱う場合の runtime behavior が不足している。

docs に仕様を書くだけでは、適用プロジェクトに配布される command / skill の実行時挙動には反映されない。

一方で、repo_scope 判定、self-hosting 判定 script、差分検査、ガード専用 skill の追加は過剰である。

## Source Summary

この RU は、2026-06-06 のチャットで合意した以下の内容に基づく。

- AgentDevFlow workflow の実装対象は現在のプロジェクトである。
- AgentDevFlow 適用プロジェクトでは、AgentDevFlow 本体を直接改修対象にしない。
- AgentDevFlow 適用プロジェクトで見つけた AgentDevFlow 本体の不具合・改善点は、upstream handoff 用 RU として整理する。
- agent-dev-flow repository では、AgentDevFlow 本体が現在プロジェクトの成果物であるため、通常の req/case workflow で改修できる。
- 新規 guard skill、repo_scope、自動 self-hosting 判定、git diff ベースの強制ガードは採用しない。
- 既存 `agentdev-workflow-lifecycle` skill の reference に共通方針を追加し、該当 command から短く参照する。

## 統合理由

この内容は、learning / intake 経由の RU 化だけでなく、`req-define` 直行ケース、`backlog-review` / `backlog-save`、`case-open` / `case-run` の実装境界にも関係する。

個別 command ごとに別 RU 化すると、AgentDevFlow upstream handoff の扱いが分散し、command 間で挙動がずれる可能性がある。

そのため、共通 reference と該当 command の最小改修を1つの RU として扱う。

## 要件化の方向

AgentDevFlow upstream handoff の共通方針を、既存 `agentdev-workflow-lifecycle` skill の reference として追加する。

新規ガード専用 skill は作成しない。

各 command には長文を複製せず、`agentdev-workflow-lifecycle/references/upstream-handoff.md` に従う旨と、必要最小限の分岐・停止条件だけを追加する。

## 主対象REQまたは変更対象候補

主対象REQは未特定。

変更対象候補は以下。

### 追加

- `src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md`

### 更新

- `src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md`
- `src/opencode/commands/agentdev/req-define.md`
- `src/opencode/commands/agentdev/backlog-review.md`
- `src/opencode/commands/agentdev/backlog-save.md`
- `src/opencode/commands/agentdev/case-open.md`
- `src/opencode/commands/agentdev/case-run.md`

## 要件詳細

### 1. upstream-handoff reference を追加する

`src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md` を追加する。

この reference には以下を定義する。

- AgentDevFlow workflow の実装対象は現在のプロジェクトである。
- AgentDevFlow 適用プロジェクトでは、AgentDevFlow 本体・配布 command・配布 skill・配布 template・配布 script を直接改修対象にしない。
- 適用プロジェクトで AgentDevFlow 自体の不具合・改善点を発見した場合は、現在プロジェクトでは適用せず、AgentDevFlow upstream handoff 用 RU として整理する。
- agent-dev-flow repository では、AgentDevFlow 自体が現在プロジェクトの成果物であるため、通常の req/case workflow で改修対象にできる。
- upstream handoff metadata は以下を基本とする。
  - `handoff_target: agent-dev-flow`
  - `apply_in_current_project: false`

### 2. `agentdev-workflow-lifecycle/SKILL.md` を更新する

`USE FOR` に AgentDevFlow upstream handoff の判定・扱いを追加する。

### 3. `req-define.md` を更新する

入力が AgentDevFlow 本体・配布 command・配布 skill・配布 template・配布 script の不具合または改善点を対象にする場合、`upstream-handoff.md` に従う。

AgentDevFlow 適用プロジェクトでは、現在プロジェクトの通常要件docとして定義せず、upstream handoff 用 RU 入力として整理する。

出力には必要に応じて以下を含める。

- `handoff_target: agent-dev-flow`
- `apply_in_current_project: false`

### 4. `backlog-review.md` を更新する

promoted artifact が AgentDevFlow 本体の不具合・改善点を扱う場合、review 結果に以下を記録する。

- `handoff_target: agent-dev-flow`
- `apply_in_current_project: false`

### 5. `backlog-save.md` を更新する

backlog-review draft に upstream handoff metadata が存在する場合、RU frontmatter に転記する。

RU 本文にも、この RU は現在プロジェクトでは実装しない upstream handoff 用 RU であることを記載する。

### 6. `case-open.md` を更新する

入力要件docまたは RU に `apply_in_current_project: false` がある場合、Issue を作成せず停止する。

agent-dev-flow repository への手動取り込み対象として報告する。

### 7. `case-run.md` を更新する

Issue 本文、要件doc、Requirement Source に `apply_in_current_project: false` がある場合、実装を開始せず停止する。

agent-dev-flow repository への手動取り込み対象として報告する。

## 対象外

- 新規 `agentdev-scope-guard` skill の作成
- repo_scope / self-hosting 判定 script の作成
- case-run における git diff ベースの AgentDevFlow managed artifact 検査
- 全 command への長文ルール複製
- `/repo/intake-*` または `/repo/learning-*` の新設
- 適用プロジェクトでの AgentDevFlow 本体改修の自動適用
- 未合意の REQ ID 確定

## 受け入れ条件

- `upstream-handoff.md` が `agentdev-workflow-lifecycle` skill の reference として追加されている。
- `agentdev-workflow-lifecycle/SKILL.md` から upstream handoff の用途が分かる。
- `req-define` は AgentDevFlow 本体改善要求を upstream handoff 用 RU 入力として整理できる。
- `backlog-review` は AgentDevFlow 本体改善 artifact に handoff metadata を付与できる。
- `backlog-save` は handoff metadata を RU frontmatter に転記できる。
- `case-open` は `apply_in_current_project: false` の入力から Issue を作成しない。
- `case-run` は `apply_in_current_project: false` の入力を実装対象にしない。
- command 側に長文の重複実装がなく、共通方針は `upstream-handoff.md` に集約されている。
