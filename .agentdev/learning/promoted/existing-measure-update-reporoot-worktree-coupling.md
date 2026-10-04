# worktree 深度に結合した repoRoot 計算テストの修正

## 背景

bun test の回帰検証で、`import.meta.dir` からの固定階層上昇（`..` × 8）で repoRoot を解決するテストが worktree 深度・main root 構造に結合し、実行環境で green/fail が逆転する事象が3件（worktree では green・main root では ENOENT fail、およびその逆の false green）で観測された。

## 問題

`src/common/skills/agentdev-workflow-case-run/scripts/tests/process-conformance.test.ts` 等の repoRoot 計算が worktree 構造（`.worktrees/<slug>` の深度）を暗黙前提とし、main root 実行で `C:/Users/<user>/src/...` の誤解決による ENOENT fail（7 tests 未実行・件数 242→235）、skills_structure.test.ts の projection-only テストの環境差 fail、worktree 実行時の main 側 SKILL.md 読み取りによる検証漏れ（false green）を生む。

## 望ましい変更

対象テストの repoRoot 解決を git 依存解決（`git rev-parse --show-toplevel` 相当）または階層数を固定しない探索へ変更する。skills_structure.test.ts の project-local skill 許容リストも main root 実行を前提に調整する。main root 正規形実行での既知 fail は由来分類記録とする。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-run/scripts/tests/process-conformance.test.ts`（repoRoot 計算）
- `.opencode/skills/repo-agentdev-integrity/scripts/skills_structure.test.ts`（projection-only placements テスト・See Also 参照検査）

### 対象外

- bun test 実行形態契約（3 cwd 分割）自体の変更
- 新規テストの追加

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill scripts | src/common/skills/agentdev-workflow-case-run/scripts/tests/process-conformance.test.ts | repoRoot 解決の git 依存化 |
| 配布skill scripts | .opencode/skills/repo-agentdev-integrity/scripts/skills_structure.test.ts | main root/worktree 両環境で安定する走査前提の調整 |
| Design | docs/designs/integrity/checker-execution-contracts.md 系 | integrity 基盤テストの repoRoot 解決規約の追補候補 |

## 既存対策確認

- **確認結果**: 既存対策なし（修正対象の既知欠陥）
- **該当ファイル**: なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: worktree 構造系テスト fallback 契約（REQ-018 系）は templates 配置等に存在するが、repoRoot 計算の環境非依存化規約は存在しない

## 制約

- テストの期待値（検証内容）は変更しない（解決経路のみ変更する）
- baseline 再現確認（pre-existing 分類）の運用は維持する

## 受け入れ条件

- [ ] main root・worktree の両方で process-conformance.test.ts が同一結果になる
- [ ] skills_structure.test.ts が main root 実行で既知 fail を出さない（または由来分類記録が済む）
- [ ] 修正後、bun test 3 分割が両環境で全 green になる

## 元learning item / 根拠

- **要約**: worktree・main root のパス深さ構造に結合した repoRoot 計算テストの green/fail 逆転（3件）
- **根拠**: worktree 内 bun test が main repo root の SKILL.md を読む false green（Case #3391・PR #3404）、main root 正規形で path 深さ依存 fail 2種（PR #3409・検証証拠 comment 5974678572）、process-conformance.test.ts の ENOENT fail と件数差 7（Case #3420・PR #3422・baseline 再現 cc3420-baseline.json）
- **再発条件**: worktree 実行で作成・検証した相対階層数前提の repoRoot 計算を別深度環境で実行する場合
- **横展開可能性**: import.meta.dir 系 repoRoot 計算を持つテスト全般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, test
- **関連Issue**: なし（PR #3401/#3404/#3409/#3422 は完了済み）
