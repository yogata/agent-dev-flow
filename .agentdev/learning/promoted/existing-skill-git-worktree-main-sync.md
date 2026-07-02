# case-close Step 9 git main同期の前提条件・順序・並列性明示

## 背景

case-close Step 9（git pull --ff-only）は、main worktree が main ブランチにあり、ローカル変更がなく、他の fetch 系操作が並行していないという暗黙前提に依存している。Epic Wave クローズ（複数PR連続マージ）、case-auto 並列実行（sibling が main worktree を占有）、手順順序（SPEC 昇格編集 → pull）のいずれかで前提が崩れると pull がブロック・失敗し、case-close 全体が停止する。3件の実証事象がある。

## 問題

git-common-procedures.md Section 1（実行前同期）はローカル変更検出と pull 手順を規定するが、以下の前提条件チェック・順序依存性が未規定である。

- pull 系（git pull --ff-only）と fetch --prune 系を並列実行すると ref lock が競合する（Git の ref lock は並列安全を保証しない）
- main worktree が main 以外のブランチにいる場合、git checkout main は working tree を移動し sibling セッションの作業を破壊するリスクがある
- case-close Step 3-2（SPEC 昇格編集）を Step 9（git pull）より前に行うと、Epic Wave で差分蓄積により working tree が dirty となり pull がブロックされる

## 望ましい変更

git-common-procedures.md Section 1（実行前同期）に以下を追加する。

1. **pull/fetch 系直列化**: pull --ff-only 系と fetch --prune 系を同一スクリプト内で並列実行しない。順序固定（pull 後に fetch --prune、または git pull --prune --ff-only の単一コマンド統合）を推奨。
2. **現在ブランチ確認**: pull 実行前に git branch --show-current で現在ブランチを確認。main 以外のブランチにいる場合は git checkout main で working tree を移動せず、git fetch origin main:main で local main ref のみを fast-forward 更新する代替手順を規定。
3. **編集→pull 順序**: case-close SPEC で Step 3-2（SPEC 昇格編集）と Step 9（git pull）の順序依存性を明記。Epic Wave クローズでは Step E4 完了直後に Step 9 を実行し、その後に Step 3-2 を行う順序が安全であることを明示。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` Section 1（実行前同期）
- `docs/specs/commands/case-close.md`（Step 3-2 / Step 7 / Step 9 の順序依存性）

### 対象外

- case-run の隔離 worktree（index が独立、対象外）
- pull --rebase 系の競合解消手順（既存の Merge Conflict 対応パターンでカバー済み）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` | Section 1 に pull/fetch 直列化、非 main ブランチ時の代替同期手順（git fetch origin main:main）を追加 |
| spec | `docs/specs/commands/case-close.md` | Step 3-2 / Step 7 / Step 9 の順序依存性、Epic Wave クローズ時の安全な実行順序を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分カバー）
- **該当ファイル**: `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` Section 1（実行前同期・ローカル変更検出）、Section 8（並列セッション pull 拒否フォールバック）
- **ギャップ分類**: fix gap + guardrail insufficiency
- **ギャップ詳細**: Section 1 はローカル変更検出で停止するが、pull/fetch 直列化・非 main ブランチ時の ref のみ同期・SPEC 編集→pull 順序は未規定。Section 8 は未コミット変更による pull 拒否のみで、ブランチ状態による前提崩壊は未カバー。

## 制約

- 並列実行安全ステージングプロシージャ（Section 3）と整合させること。代替同期手順（git fetch origin main:main）は working tree を移動しない前提を維持すること。
- 既存のローカル変更検出エラー（Section 1）を置き換えず、前提条件チェックとして前置すること。

## 受け入れ条件

- [ ] git-common-procedures.md Section 1 に pull/fetch 直列化の注意が追加されている
- [ ] 非 main ブランチ時の代替同期手順（git fetch origin main:main）が規定されている
- [ ] case-close SPEC に Step 3-2 / Step 7 / Step 9 の順序依存性が明記されている
- [ ] 既存のローカル変更検出・停止条件が維持されている

## 元learning item / 根拠

- **要約**: case-close の git main 同期（Step 9）周辺で、worktree 状態・並列実行・手順順序の暗黙前提が崩れて pull が失敗する事象が3件発生。
- **根拠**: (1) 19PR squash merge 後の pull と fetch --prune 並列で ref lock 競合、(2) Epic Wave Step 3-2 SPEC 昇格編集が Step 9 pull を dirty working tree でブロック、(3) case-auto 並列で main worktree が sibling ブランチに占有され pull 前提崩壊。回避策は git fetch origin で ref 再取得→pull 再実行、git stash で SPEC 編集退避→pull→再適用、git fetch origin main:main で ref のみ同期。
- **再発条件**: case-close で main 同期を実行する際、暗黙前提（ブランチ状態・並列性・手順順序）が崩れる条件が成立した時。Epic Wave / case-auto 並列実行でほぼ確実。
- **横展開可能性**: case-close/case-auto の main 同期全般、並列 worktree 運用環境で高い。

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #1250〜#1268（ref lock）、Epic #1308（working tree 衝突）、Issue #1342（非 main ブランチ）
