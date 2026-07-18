# ハーネス制約で case-run 実行担当サブエージェント委譲不可時のフォールバック強化

## 背景

AgentDevFlow の case-run は `agentdev-case-run-execution-adapter` SKILL が定義する実行担当サブエージェント委譲プロトコルに基づき、Sisyphus-Junior 等の subagent へ実行を委譲する設計。また、Epic Wave では最大5件の子 Issue を並列委譲することで速度優位性を得る設計。しかし、oh-my-openagent ハーネスの `call_omo_agent` ツール schema は explore/librarian agent 型のみを許可し、custom agent 型（adapter skill が定義する実行担当サブエージェント型）を起動できない。Epic Wave 並列委譲（最大5件）も同様に機能しない。本問題は PR #1068（L-004）、PR #1103（L-010）で既に観察され、agentdev-case-run-execution-adapter SKILL の task() 起動失敗時フォールバックパス（L131-148）が完全カバーすることが実証済み。ただし `call_omo_agent` schema 制約（explore/librarian のみ許可）という新側面と、Epic Wave 並列委譲の速度優位性消失という影響は adapter skill に未明文化。

## 問題

1. `call_omo_agent` ツール schema が explore/librarian のみを許可するハーネス環境で case-run を実行した場合、adapter skill が定義する実行担当サブエージェント型（custom agent）が起動できない。必ず発生する。
2. Epic Wave 並列委譲（最大5件）も機能せず、速度優位性が消失する。
3. adapter skill のフォールバックパスは task() 起動失敗を想定しているが、`call_omo_agent` schema 制約という「ツールが呼べない」ケースと「Epic Wave 並列委譲不可」ケースが明示的に扱われていない。事前検出（probe）も未整備。

## 望ましい変更

adapter skill の委譲プロトコルに、ハーネス能力に応じたフォールバック定義と事前検出（probe）を追加する。case-run がハーネス能力を事前検出し、委譲可否を判断して Inability を冒頭で明示する。Epic Wave 並列委譲の速度優位性が消失する場合の運用（インライン逐次実行等）も明記する。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-case-run-execution-adapter/SKILL.md`（task() 起動失敗時事後処理セクションの拡充、事前 probe 手順）
- `.opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md`（委譲可否 probe 手順、Epic Wave 並列委譲不可時の運用）

### 対象外

- ハーネス（oh-my-openagent）側の `call_omo_agent` schema 拡張（ハーネス開発側のスコープ）
- REQ-0149（agentdev-gh-cli 委譲基盤）の実行環境前提そのものの見直し（別 Issue で議論）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | .opencode/skills/agentdev-case-run-execution-adapter/SKILL.md | `call_omo_agent` schema 制約時の挙動、Epic Wave 並列委譲不可時の運用、事前 probe 手順を追記 |
| skill | .opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md | 委譲可否 probe 手順、Epic Wave 逐次実行フォールバックを追記 |
| req | docs/requirements/REQ-0149.md | 実行環境前提（call_omo_agent schema 制約）の明記、Epic Wave 並列委譲の達成可能性再確認 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: .agentdev/learning/deferred.md L-004（PR #1068）、L-010（PR #1103）、.opencode/skills/agentdev-case-run-execution-adapter/SKILL.md L131-148（task() 起動失敗時フォールバック）
- **ギャップ分類**: application miss
- **ギャップ詳細**: 既存 adapter skill L131-148 は task() 起動失敗時フォールバックを完全カバーするが、`call_omo_agent` schema 制約（explore/librarian のみ許可）という「ツールが呼べない」ケースと、Epic Wave 並列委譲（最大5件）不可時の運用が未カバー。事前 probe 強化のみ未成熟（L-004/L-010 処分判定理由から引用）

## 制約

- ハーネス側の `call_omo_agent` schema 拡張は別プロジェクト（oh-my-openagent）のスコープ。adapter skill 側でハーネス能力を検出して適応するアプローチを採る。
- 既存の task() 起動失敗時フォールバックパス（adapter skill L131-148）との重複を避け、拡張として整理する。
- インライン実行時も adapter protocol（証拠ベース実装・品質ゲート・PR 作成・worktree 隔離・Findings 配置）には従う（L-010 自律対応内容を踏襲）。

## 受け入れ条件

- [ ] adapter skill SKILL.md に `call_omo_agent` schema 制約時の挙動が明文化されている
- [ ] adapter skill SKILL.md に事前 probe 手順（ハーネス能力検出 → 委譲可否判断 → Inability 冒頭明示）が追記されている
- [ ] adapter skill SKILL.md に Epic Wave 並列委譲不可時の運用（インライン逐次実行等）が明文化されている
- [ ] workflow-orchestration capture-boundaries.md に委譲可否 probe 手順が追記されている
- [ ] 既存の task() 起動失敗時フォールバックパス（L131-148）と重複せず拡張として整理されている
- [ ] REQ-0149 の実行環境前提に `call_omo_agent` schema 制約が明記されている（必要に応じて別 Issue で REQ 更新）

## 元learning item / 根拠

- **要約**: ハーネス制約で case-run 実行担当サブエージェント委譲が不可。adapter skill のフォールバックパスで運用は完結するが、`call_omo_agent` schema 制約の新側面と Epic Wave 並列委譲不可時の運用が adapter skill に未明文化。
- **根拠**:
  - inbox#1 (Epic #1515 Wave 1): call_omo_agent schema が explore/librarian のみを許可、Epic Wave 並列委譲不可
  - deferred L-004 (PR #1068): task() 起動失敗時フォールバック適用
  - deferred L-010 (PR #1103): orchestration + 実装を同一エージェント統合実行で完結
- **再発条件**: call_omo_agent が explore/librarian のみを許可するハーネス環境で case-run を実行した場合に必ず発生
- **横展開可能性**: 同一ハーネス環境で動作する全 case-run で発生。task() ツールを提供しない他ハーネスでも同根

## 推奨Issue分類

- **分類**: fix（既存 skill の拡充・運用対策強化）
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Epic #1515 Wave 1 PR Findings delegation-chain-unavailable エントリ全件 (PR #1522/#1523/#1524/#1525)、PR #1068 (L-004)、PR #1103 (L-010)
