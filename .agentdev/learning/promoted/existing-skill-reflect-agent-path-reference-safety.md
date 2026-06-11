# エージェントのパス・参照誤用防止 — subagent edit safety 追加

## 背景

AgentDevFlow の command/skill では、エージェントが source path（`src/opencode/...`）と runtime path（`.opencode/...`）を混同する問題が繰り返し発生している。ADR 再編成時の3区分分類パターン、runtime path 明示規約、subagent edit safety の3つの学びから、共通する根本原因は「エージェントのパス・参照に対する暗黙的な仮定」にある。runtime path 規約は command-authoring に既に反映済みだが、subagent edit safety（worktree 内制約・プレフィクス確認・ファイル存在確認）は既存スキルに未記載である。

## 問題

subagent が worktree 内でファイル編集を行う際、以下の誤操作が発生しやすい:
1. worktree 外（main checkout）への漏れ出し
2. ファイルパスの worktree プレフィクス省略
3. runtime path と source path の混同

これらを防止するための明示的な edit 安全手順が、既存の command-authoring / skill-authoring に記載されていない。

## 望ましい変更

agentdev-command-authoring または agentdev-skill-authoring の適切な箇所に、subagent edit safety に関する手順・制約を追加する:
- edit 実行前の worktree プレフィクス確認
- ファイル存在確認の義務付け
- worktree 内制約の明示

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-command-authoring/SKILL.md` — Guardrails セクション
- `src/opencode/skills/agentdev-skill-authoring/SKILL.md` — 該当箇所

### 対象外

- `agentdev-workflow-orchestration` — subagent-protocol.md は別管理
- runtime path 規約 — 既に command-authoring に反映済み

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-command-authoring/SKILL.md` | Guardrails に subagent edit safety 制約を追加 |
| skill | `.opencode/skills/agentdev-skill-authoring/SKILL.md` | 該当箇所に subagent edit safety 制約を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: `src/opencode/skills/agentdev-command-authoring/SKILL.md`（runtime path 規約: 行62-83）、`src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md`（runtime path 表: 行236-260）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: runtime path 規約は記載済みだが、subagent による worktree 内編集時の安全手順（プレフィクス確認・存在確認・worktree 内制約）が未記載

## 制約

- 既存の runtime path 規約と重複しないこと
- subagent-protocol.md（workflow-orchestration references）との整合性を保つこと

## 受け入れ条件

- [ ] command-authoring または skill-authoring に subagent edit safety 制約が追加されている
- [ ] 既存の runtime path 規約と矛盾しない
- [ ] 追加内容が明確なガイドラインとして機能する

## 元learning item / 根拠

- **要約**: エージェントのパス・参照誤用（source/runtime 混同、worktree 内外混同）を防止する知見の集約
- **根拠**: L-20260607-01（ADR再編成3区分パターン）、L-20260607-03（runtime path 明示規約）、L-20260607-05（subagent edit safety）の3エントリで、根本原因が「エージェントのパス・参照に対する暗黙的仮定」で共通
- **再発条件**: 新規 command/skill 作成時・subagent 利用時にパス混同が発生
- **横展開可能性**: 全 command/skill 作成に関連する汎用的問題

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #653, #655, #656
