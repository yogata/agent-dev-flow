# case-ready canonical 再取得の squash merge 後分岐ハンドリング接続

## 背景

Case #3776（2026-10-16〜17）の case-ready STEP-7 で、Definition PR（squash merge）直後の canonical 再取得フェーズにおいて、`accept_definition_checks.ts` の `git fetch origin main` → `git merge --ff-only origin/main` 経路が「Diverging branches can't be fast-forwarded」で exit 1 となり、canonical 同期が失敗した。実行側は `agentdev-git-worktree` references の squash merge 後分岐対応手順（重複分析 → rebase）を手動適用して復帰したが、script と STEP-7 手順書のどちらにも分岐発生時の規定がない状態で停止していた。

## 問題

case-open は STEP-1 入口で untracked domain state（draft・RU・jev-observations）を main 作業ディレクトリの先行明示パス commit で永続化する（`agentdev-workflow-case-open/references/handoff.md` L32-36）。設計PR は squash merge により origin/main 側へ新しい統合 commit を作るため、ローカル main に draft 永続化 commit が残存する限り、squash merge 後の origin/main とローカル main は構造的に分岐する。一方:

- `agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts` の canonical 再取得フェーズ（L553-571）は、fetch 失敗時・ff-only merge 失敗時に warning を push して終了するのみで、分岐検出・解消のフォールバックを持たない（テストも「ff-only merge が失敗する場合は削除 commit を行わず失敗を返す」を pin）
- `agentdev-workflow-case-ready/references/readiness-and-cleanup.md`（STEP-7）は script 呼出と前置確認（実在確認・ステージ確認・履歴操作前確認）のみを規定し、分岐発生時の手順参照がない
- 既存の恒久手順「Squash merge 後分岐ハンドリング手順」（`agentdev-git-worktree/references/git-common-procedures.md` L521-586。完全重複時 `git reset --hard` / 部分重複時 soft reset 提案 / 独立変更時ユーザー報告の処理分岐を持つ）は case-close STEP-4-3 からのみ参照され、case-ready STEP-7 からは参照されない

結果として、同一構造を持つ全 case-ready 実行で ff-only merge 失敗が繰り返し起こり、毎回実行側の手動判断（手順発見・重複分析・rebase）に依存する。

## 望ましい変更

case-ready STEP-7 の canonical-and-cleanup が squash merge 後分岐を検出した場合に、既存の恒久手順へ正規に接続する。第一候補は script 呼出前の手順参照の明文化（readiness-and-cleanup.md への前置規律追記）、第二候補は script 自体への分岐検出時フォールバック組込み。いずれか一方、または両方の組合せを req-define が確定する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md`（STEP-7 手順への分岐時手順参照の追加）
- `src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts`（分岐検出時のフォールバック接続を script 側に持たせる場合）

### 対象外

- case-close STEP-4-3/4-4 の既存の分岐ハンドリング配線（変更しない）
- 設計PR の merge method（squash）自体の変更
- case-open の draft 永続化手順（main 作業ディレクトリでの先行 commit）の変更
- 「コンフリクト解消 rebase パス」（git-common-procedures.md L590-615。case-close STEP-4-4 配線）の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md | STEP-7 canonical 再取得の手順に「ff-only merge 失敗・分岐検出時は agentdev-git-worktree の squash merge 後分岐ハンドリング手順に従う」前置規律を追記 |
| 配布skill scripts | src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts | ff-only merge 失敗時に分岐検出（ローカル先行 commit の有無）を実施し、結果を報告 JSON の detail へ含める改善候補 |
| 配布skill references | src/common/skills/agentdev-git-worktree/references/git-common-procedures.md | 「Squash merge 後分岐ハンドリング手順」の参照元への case-ready STEP-7 追記候補（手順本文は変更しない） |

## 既存対策確認

- **確認結果**: 対策あり
- **該当ファイル**: src/common/skills/agentdev-git-worktree/references/git-common-procedures.md（「Squash merge 後分岐ハンドリング手順」L521-586）、src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（L553-571）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存の分岐ハンドリング手順が case-close STEP-4-3 にのみ配線され、case-ready STEP-7（canonical-and-cleanup）から参照されない。script は分岐を検出せず warning のみで終了する。STEP-7 手順書（readiness-and-cleanup.md）に分岐時の参照規律がない

## 制約

- 既存手順の処理分岐（完全重複 = `git reset --hard origin/{branch}` / 部分重複 = soft reset または手動解決提案 / 独立変更 = ユーザー報告）を変更・緩和しない。独立変更の場合は自動 rebase ではなくユーザー判断を残す（Case #3776 実績は「重複ゼロのため conflict なしで自動解決」であり、重複がある場合の自動解消を裏付けない）
- script の失敗契約はテストで pin されている（scripts/tests/accept_definition_checks.test.ts L238「ff-only merge が失敗する場合は削除 commit を行わず失敗を返す」、L359 stderr 全文保存）。script を変更する場合はテスト追随が必須
- readiness-and-cleanup.md の既存条項「reset --hard 等の履歴操作の前に状態確認」を維持し、フォールバックは前置確認の後段に接続する
- remote-tracking ref 消失ケース（既存手順の手順0）との整合を保持する

## 受け入れ条件

- [ ] case-ready STEP-7 の canonical 再取得で squash merge 後分岐が検出された場合の正規手順が readiness-and-cleanup.md（または script）に明文化されている
- [ ] 明文化された手順は既存の「Squash merge 後分岐ハンドリング手順」を参照し、新しい解消経路を発明しない
- [ ] script を変更した場合は対応するテストが更新され、分岐検出時の報告内容が検証されている

## 元learning item / 根拠

- **要約**: case-ready canonical-and-cleanup の ff-only merge が case-open draft 永続化 commit 残存による構造的分岐で常時失敗する（Case #3776、Case Issue #3776）
- **根拠**: script L553-571 の実測（fetch/ff-only 失敗時は warning のみ・フォールバック実装なし。case-ready skill 全体に rebase 言及ゼロ）。既存「Squash merge 後分岐ハンドリング手順」（git-common-procedures.md L521-586）が case-close STEP-4-3 にのみ配線。handoff.md L32-36 で case-open が main 作業ディレクトリで draft 永続 commit を実行する構造を実測。adversarial-review の独立 challenge stream 2 本と orchestrator 再実測で確認
- **再発条件**: ローカル main に未 push の commit（draft 永続化 commit 等）がある状態で pr_merge（squash）を完了し、case-ready の canonical-and-cleanup を呼び出した場合。case-revise 由来の設計修正PR squash merge 後の case-ready 再実行でも同一条件が成立し得る
- **横展開可能性**: 同一 Case での draft 永続化 commit 残存を持つ全 case-ready 実行に適用。8軸評価 30/40（8クラス中最高）、再発可能性 5/5（構造条件）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement, workflow
- **関連Issue**: Case Issue #3776
