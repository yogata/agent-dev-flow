---
name: agentdev-host-github-guidance
description: Guides GitHub operations on hosts without the ADF Custom Tool registration (Codex, Antigravity). USE FOR: confirming the host's existing GitHub plugin capabilities before use, handing Issue/PR creation over to OpenCode, checking which ADF skills are out of the guarantee scope on those hosts, reporting GitHub-dependent operations as blocked. DO NOT USE FOR: GitHub operations on OpenCode or Senpi (the agentdev_gh tool is available there), implementing MCP, registering ADF tools, hooks, or guards on new hosts.
---

# ホスト別 GitHub 操作案内（host-github-guidance）

Codex と Antigravity で ADF の業務を行う際の GitHub 操作の案内である。両ホストは ADF の Custom Tool（`agentdev_gh`、`agentdev_third_party`）の登録対象外である。GitHub 操作は各ホストが既に持つ GitHub プラグインの能力を利用者が確認してから用いる。ADF は MCP を実装せず、新ホストへの Tool 登録・hook・guard・取得機構の登録も行わない。

## 対象と対象外

| ホスト | 本案内 | GitHub 操作の手段 |
|---|---|---|
| Codex | 対象 | Codex 既存の GitHub プラグイン（利用者が確認済みの能力に限定） |
| Antigravity | 対象 | Antigravity 既存の GitHub プラグイン（利用者が確認済みの能力に限定） |
| OpenCode / Senpi | 対象外 | `agentdev_gh`（ADF の Tool 登録があり、制約なしに利用可能） |

## 能力確認の手順

GitHub 操作を始める前に、利用者が実行するホストの GitHub プラグイン能力を確認する。

1. **操作の必要条件を列挙する**: 実行しようとする workflow が必要とする GitHub 操作（Issue の参照、Issue の更新、PR の作成など）を特定する。
2. **ホスト能力を確認する**: 対象ホストの GitHub プラグインがそれらの操作を提供するかを、利用者が実機または公開資料で確認する。
3. **確認済みの操作だけを計画に含める**: 確認できなかった操作は実行計画から除外する。

確認できない能力を成功扱いしない。未確認の能力が必要な操作は、実行を blocked として報告し、OpenCode での実行へ引き渡す。

## 引き渡し規則

- **Issue・PR・Release の作成と更新は OpenCode へ引き渡す**: `agentdev_gh` が利用可能な OpenCode 側で実行する。Codex と Antigravity では作成・更新を行わない。
- **読込操作は確認済みのホスト能力で行える**: 参照専用の読込操作（Issue の参照など）は、確認済みのホスト能力で実行してよい。

## 保証対象外のスキル集合（基準版17スキル）

次の17スキルは `agentdev_gh` の操作を前提として構成されている。Codex と Antigravity では保証対象外であり、実行前に必要な GitHub 操作が確認済み能力で満たされるかを利用者が判断する。

- agentdev-case-run-execution-adapter
- agentdev-command-authoring
- agentdev-epic-tracker
- agentdev-git-worktree
- agentdev-inspect-skills
- agentdev-intake-pipeline
- agentdev-issue-management
- agentdev-issue-tracking
- agentdev-quality-gates
- agentdev-workflow-case-auto
- agentdev-workflow-case-close
- agentdev-workflow-case-open
- agentdev-workflow-case-ready
- agentdev-workflow-case-revise
- agentdev-workflow-case-run
- agentdev-workflow-lifecycle
- agentdev-workflow-templates

## 関連

- Codex 接続領域（`src/codex/`）と Antigravity 接続領域（`src/antigravity/`）: 本案内が参照する両ホストの接続配置
