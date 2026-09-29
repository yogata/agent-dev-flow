# 同一 worktree 並行委譲の二重実装競合回避 — durable state 帰属確認と協調規律

## 背景

Case #3236（case-run 実装委譲 DEL-3236-1 の実行中）で、同一 worktree・同一ブランチに複数の実行担当サブエージェントが並行で委譲され、git status 上の編集が相互に進行して二重実装・競合となる事象が観測された。既存の「委譲前重複実行時検出」（case-auto stage 3）は計画時点の変更対象ファイル集合の重複検出であり、実行中の相互進行には対応していない。

## 問題

複数委譲が同一作業領域（worktree・ブランチ）を共有し、進行中の編集の帰属が durable state（git status・commit・PR・Issue コメント等）から判別できないまま並行進行すると、二重実装・競合が生じる。実行中の相互進行を検出した場合の協調規律（同一ファイル編集の回避、guard の fail-closed 拒否後の実取得 → 再適用）が既存配布物に記載されていない。

## 望ましい変更

委譲実行前に durable state で帰属を確認し、並行進行が判明した場合は同一ファイル編集を避ける協調規律を、case-auto stage 3 の Wave 実行制御（委譲前重複実行時検出）の補完知見として、worktree-operations.md「同一ファイルへの複数 edit の規律」節等へ追記する。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md`「同一ファイルへの複数 edit の規律」節（実行中並行進行検出時の協調規律の追記）
- `src/opencode/skills/agentdev-workflow-case-auto/` stage 3 委譲制御（補完知識の参照）

### 対象外

- Wave 実行制御の契約変更（委譲前重複実行時検出の仕様自体は変更しない）
- worktree 分離による根本解消（別契約議論。本知見は同一 worktree 運用下の協調規律）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 「同一ファイルへの複数 edit の規律」節へ、実行中の並行進行検出時の協調規律（durable state による帰属確認・同一ファイル編集回避・guard fail-closed 拒否後の実取得再適用）を追記 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-auto/SKILL.md | stage 3 委譲前重複実行時検出の補完知見として相互参照（必要に応じて） |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: src/opencode/skills/agentdev-workflow-case-auto/SKILL.md:90（委譲前重複実行時検定）、worktree-operations.md「同一ファイルへの複数 edit の規律」節
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存検出は委譲前（計画時点）の変更対象ファイル集合重複のみ対象。実行中に相互進行が判明した場合の協調規律（帰属確認・同一ファイル編集回避・guard 拒否後の再適用手順）は未記載

## 制約

- guard の fail-closed 挙動は維持する（回避ではなく協調手順で対処）
- Wave 実行制御の契約変更を含まない（運用上の回避知見の範囲）

## 受け入れ条件

- [ ] 実行中の並行進行検出時の協調規律が既存の規律節に追記されている
- [ ] Case #3236 の実測（DEL-3236-1 実行中の相互進行検出と協調対応）が根拠として記録されている

## 元learning item / 根拠

- **要約**: 同一 worktree・同一ブランチへの複数サブエージェント並行委譲は二重実装競合を生む。委譲実行前に durable state で帰属を確認し、並行進行検出時は同一ファイル編集を避ける
- **根拠**: 複数委譲が同一作業領域を共有し、進行中の編集の帰属が durable state から判別できないまま並行進行した（Case #3236、case-run 実装委譲 DEL-3236-1 の実行中）。durable state による帰属確認と、guard の fail-closed 拒否 → 実取得 → 再適用の協調観測で回避
- **再発条件**: 同一 worktree・同一ブランチへの複数サブエージェント同時委譲
- **横展開可能性**: Wave 並列実行・サブエージェント委譲全般

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし（Case #3236、PR #3238、worktree-operations.md「同一ファイルへの複数 edit の規律」節由来）
