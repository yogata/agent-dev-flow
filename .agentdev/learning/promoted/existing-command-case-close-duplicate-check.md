# case-close 実行前の未コミット変更と PR 変更ファイルの重複チェック追加

## 背景

case-close Step 9（`git pull --ff-only`）が、メインリポジトリの別件未コミット変更（REQ-0124 関連: `docs/DOC-MAP.md`, `docs/README.md`, `docs/requirements/README.md`）と PR #804 の squash commit の変更ファイルが重複したため失敗した。結果として `.agentdev/` domain state の commit/push（Step 11）が実行不能になった。

既存の `agentdev-git-worktree/references/git-common-procedures.md` の「実行前同期」手順は `git status --porcelain` で「任意のローカル変更」を検出して停止するが、これは粗すぎる。重複の有無にかかわらず全てのローカル変更で停止するため、ユーザーが別件作業を残したまま case-close を実行する通常運用で頻繁にブロックされる。重複特化の早期警告が Step 1-2 に必要。

## 問題

- case-close Step 1-2（前提確認）に、メインリポジトリの未コミット変更と対象 PR の変更ファイルの重複チェックが不在
- 既存の「任意のローカル変更で停止」チェック（Step 9 経由で git-common-procedures.md）は粗すぎる。無害な非重複変更でも停止する
- 重複による `git pull --ff-only` 失敗が Step 9 で初めて発覚し、Step 4（merge）後に手戻りが発生する
- 並行作業（複数 Issue 同時進行）環境で特に発生しやすいが、その前提の早期警告がない

## 望ましい変更

case-close Step 1（Issue番号解決）の直後に、メインリポジトリの `git status --short` と対象 PR の変更ファイル一覧（`gh pr view --json files`）の重複チェックを追加する。重複ファイルがある場合は Step 4（merge）前にユーザーに警告し、対応（stash/commit/checkout）を促す。

## 対象範囲

### 対象

- `src/opencode/commands/agentdev/case-close.md`（Step 1-2 に早期チェック追加）
- `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md`（「未コミット変更検出」手順に PR 変更ファイルとの重複判定ロジックを拡張、必要に応じて）

### 対象外

- case-close Step 9（実行前同期）本体の `git pull --ff-only` 手順（本体は維持。早期チェックの追加で Step 9 到達前のリスク低減を図る）
- 他コマンド（case-update, case-auto 等）の同等チェック（まずは case-close で実装し、有効性を確認後に展開を検討）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `src/opencode/commands/agentdev/case-close.md` | Step 1（Issue番号解決）と Step 2（前提確認）の間に、メインリポジトリ `git status --short` と PR 変更ファイル（`gh pr view --json files`）の重複チェックサブステップを追加。重複時は構造化警告でユーザーに対応を促す |
| skill | `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` | （副次）「未コミット変更検出」手順に、PR 変更ファイル一覧との比較ロジックを拡張候補として追記。既存の「任意の変更で停止」を「重複時のみ停止」に緩和する判断材料を提供 |
| command | `src/opencode/commands/agentdev/case-close.md`（Guardrail セクション） | 重複チェック必須をガードレール（G07 等）に追加 |

## 既存対策確認

- **確認結果**: 既存対策なし（特定の重複チェックが不在）
- **該当ファイル**: `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md`（「実行前同期」手順に `git status --porcelain` で任意のローカル変更を検出して停止するチェックは存在するが、PR 変更ファイルとの重複特化ではない）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存チェックは「任意のローカル変更」で停止する粗い粒度。学びが提案する「PR 変更ファイルとの重複特化チェック」は不在。重複時の早期警告（Step 1-2）も不在で、Step 9 の `git pull --ff-only` 失敗で初めて発覚する。case-close.md の grep で「重複」「duplicate」キーワードはヒットしない（他コマンドの別目的用途のみ）。

## 制約

- 既存の Step 9（実行前同期）本体を置き換えるのではなく、Step 1-2 で早期警告を追加するアプローチであること（後方互換性維持）
- `gh pr view --json files` の実行には GitHub CLI と該当 PR へのアクセス権が必要。要件不全時はフォールバック動作（既存の Step 9 で検出）を維持すること
- 重複ファイル検出時のユーザーアクション候補（`git stash` / commit / `git checkout -- <file>` / worktree 利用）を構造化メッセージで提示すること
- 並行作業環境（複数 Issue 同時進行）で特に有効であることをガードレールまたは备注で明記すること

## 受け入れ条件

- [ ] case-close Step 1 と Step 2 の間に重複チェックサブステップが追加されている
- [ ] `git status --short` と `gh pr view --json files` の比較ロジックが手順化されている
- [ ] 重複ファイル検出時の構造化警告メッセージ形式が定義されている
- [ ] 重複時のユーザーアクション候補（stash/commit/checkout/worktree）が提示される
- [ ] ガードレールセクションに重複チェック必須が追記されている
- [ ] （副次）git-common-procedures.md の「未コミット変更検出」手順に重複判定拡張の検討メモが残されている

## 元learning item / 根拠

- **要約**: メインリポジトリの別件未コミット変更と対象 PR の変更ファイルが重複し、case-close Step 9 の `git pull --ff-only` が失敗。Domain state 永続化（Step 11）がブロックされた。
- **根拠**: Issue #803, PR #804, case-close Step 9 で実証。REQ-0124 関連の未コミット変更（`docs/DOC-MAP.md`, `docs/README.md`, `docs/requirements/README.md`）が PR #804（REQ-0122 retire）の squash commit 変更ファイルと重複。`git pull --ff-only` が作業ツリー上書き拒否で exit code 1。
- **再発条件**: メインリポジトリに未コミット変更がある状態で case-close を実行し、変更ファイルが対象 PR と重複する場合
- **横展開可能性**: 並行作業（複数 Issue 同時進行）環境で特に発生しやすい

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement, guardrail, developer-experience
- **関連Issue**: Issue #803, PR #804, case-close Step 9
