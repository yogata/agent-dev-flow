# case-auto 子 task 中断回復パスの標準化

## 背景

case-auto 最大自走モードから起動された case-run 子 task が、commit 作成後またはファイル編集中にハーネスの bg task 機能で破棄される事象が2パターン発生した（PR #1578: commit 作成済み・PR 作成前、PR #1579: 未コミット変更あり・作業中）。いずれも case-auto 親ループが子 task 破棄を検知し、worktree の git status 確認 → commit/rebase/push/PR 作成代行で回復したが、この回復パスが case-auto SPEC に標準化されておらず、毎回アドホックに判断されていた。

## 問題

case-run 子 task のライフサイクルと成果物（commit/working tree）のライフサイクルが分離されていない。子 task が破棄されると、commit 済みの成果物が PR 未作成で行き場を失うか、未コミット変更が worktree に残留する。回復パスが標準化されていないため、回復の確実性が親ループの判断に依存する。

## 望ましい変更

case-auto command SPEC に子 task 中断検知時の標準回復パスを定義する。2パターン（commit 済み・PR 未作成 / 未コミット変更あり）を網羅する。workflow-orchestration skill に子 task ライフサイクルと成果物ライフサイクルの分離原則を記述する。

## 対象範囲

### 対象

- `docs/specs/commands/case-auto.md`（子 task 中断回復パスの標準化）
- `src/opencode/skills/agentdev-workflow-orchestration/references/`（子 task ライフサイクルと成果物ライフサイクル分離）

### 対象外

- case-run 子 task の粒度調整（細粒度 commit の推奨は予防策候補だが本変更の直接対象外）
- Epic Wave 並列委譲の回復パス（case-auto 単一子 task の回復が本体、Wave 並列は派生候補）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command spec | `docs/specs/commands/case-auto.md` | 子 task 中断検知 → worktree git status 確認 → commit/rebase/push/PR 作成代行の標準回復パスを追加 |
| skill | `src/opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md` または新規 reference | 子 task ライフサイクルと成果物（commit/working tree）ライフサイクルの分離原則、中断時の回復プロトコル |

## 既存対策確認

- **確認結果**: なし
- **該当ファイル**: なし
- **ギャップ分類**: fix gap（回復パスの標準化が case-auto SPEC に存在しない）
- **ギャップ詳細**: case-auto の自律継続動作の延長として回復は実施されていたが、SPEC/ガイドレベルで標準化されていない。2パターンの回復実績（PR #1578, #1579）があるが文書化されていない。

## 制約

- 回復パスは case-auto 親ループの責務範囲内で完結すること（子 task の再起動ではなく親が代行）
- commit 済みケースと未コミットケースの2パターンを両方網羅すること
- 未コミット変更の場合、変更内容が case-run の作業意図と整合するか確認ステップを含むこと
- Epic Wave 並列委譲での同種の子 task 破棄回復への拡張可能性を否定しないこと

## 受け入れ条件

- [ ] case-auto SPEC に子 task 中断回復パス（commit 済み・未コミットの2パターン）が記述されていること
- [ ] 回復パスに worktree git status 確認ステップが含まれること
- [ ] 未コミット変更の場合、変更内容の意図確認ステップが含まれること
- [ ] workflow-orchestration skill に子 task ライフサイクルと成果物ライフサイクル分離の記述があること

## 元learning item / 根拠

- **要約**: case-auto → case-run 子 task 破棄時の成果物行き場消失と回復パターン
- **根拠**: case-run 子 task が commit 作成後（PR #1578）または編集中（PR #1579）に bg task 破棄され、成果物が行き場を失った。親ループが worktree git status → commit/rebase/push/PR 代行で回復。子 task ライフサイクルと成果物ライフサイクルの分離不足が根本原因。
- **再発条件**: case-run 子 task が commit 作成後または編集中にハーネスの bg task 機能で破棄され、case-auto 親ループが中断を検知できる場合
- **横展開可能性**: case-auto + Epic Wave 並列委譲でも同種の子 task 破棄回復パスとして機能する可能性がある

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Issue #1575, Issue #1577, PR #1578, PR #1579
