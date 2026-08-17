# git stash の環境依存挙動と worktree 検証手順（stash 不使用・detached worktree 標準）（既存 skill 反映）

## 背景

PR #2148（OU-001、Epic #2134 Wave 1）と PR #2201（OU-001、Issue #2200、backlog-auto 実装）で、git stash の環境依存挙動に起因する2件の障害が発生した。(1) pwsh で `git stash pop stash@{0}` が hashtable リテラルと解釈され構文エラーになる、`git stash push -u` に node_modules 実態のある pathspec を渡すと大量ファイルが stash に取り込まれる。(2) stash list は worktree 間で共有される（refs/stash）ため、変更なし worktree での stash が no-op になり、続く pop が他 worktree 由来の無関係な stash を pop して conflict 状態になった。

## 問題

agentdev-git-worktree skill に worktree 環境での stash 運用の規定がない。stash 往復は baseline 比較・一時退避の用途で case-run 検証中に自然に発生する操作だが、(a) stash の worktree 非分離、(b) pwsh の `@{}` 構文解釈、(c) `-u` と pathspec の相互作用、により構造的に危険であり、代替手順（detached worktree による baseline 比較）が標準化されていない。

## 望ましい変更

1. worktree 検証での一時退避に stash を使わず、detached worktree による baseline 比較を標準手順として明記する
2. やむを得ず stash を扱う場合の規則として、(a) `stash@{0}` 等 `@{}` を含む引数（`HEAD@{n}` 等）は常に引用符で括る、(b) `-u` 使用時は除外 pathspec を指定するか node_modules を一時退避する、を明記する
3. 複数 worktree が存在するリポジトリでは stash 往復前に変更の有無確認と `git stash list` の確認を必須とする

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-git-worktree/SKILL.md`（および references）の検証手順
- worktree で baseline 比較・帰属確認を行う case-run 検証手順（クラス「worktree・実行形態の環境差」成果物と連携）

### 対象外

- git 本体の stash 仕様（refs/stash の worktree 分離要望は git 側課題）
- main リポジトリ（単一 worktree）での stash 利用の全面禁止
- stash 以外の git 操作（commit/branch/merge は既存手続のまま）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-git-worktree/SKILL.md` | worktree 検証手順へ stash 不使用・detached worktree 標準手順とクォーティング規則を追記 |
| skill reference | agentdev-git-worktree references | `@{}` 引数の引用符必須・除外 pathspec の具体例を追記 |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: なし（agentdev-git-worktree SKILL.md に stash 運用の記述なし）
- **ギャップ分類**: なし（対策不在。新規手順の反映が必要）
- **ギャップ詳細**: なし

## 制約

- git-worktree skill は配布スキルであり、配布依存境界（プロジェクト固有 ID の直書き禁止）を遵守する
- AGENTS.md 編集規約（per-line edit）に従い段階的開示を維持する（SKILL.md は簡潔に、詳細は references へ）

## 受け入れ条件

- [ ] worktree 検証での stash 不使用・detached worktree による baseline 比較手順が skill に明記されていること
- [ ] `@{}` を含む git 引数の引用符必須規則が明記されていること
- [ ] 複数 worktree 環境での stash 往返リスク（stash list 共有・no-op 時の誤 pop）が明記されていること

## 元learning item / 根拠

- **要約**: git stash は worktree 非分離の共有リソースであり、pwsh の `@{}` 構文解釈と合わせて worktree 検証で構造的に危険。代替手順の標準化が必要
- **根拠**: (1) PR #2148（Issue #2135）: pwsh で `git stash pop stash@{0}` が構文エラー（hashtable リテラル解釈）。`'stash@{0}'` 引用符で解決。`git stash push -u` に node_modules 実態のある pathspec で大量取り込み + CRLF 警告（除外 pathspec・一時退避で回避）。(2) PR #2201（Issue #2200）: 変更なし worktree で `git stash` が no-op、続く `git stash pop` が他 worktree 由来の無関係 stash を pop して conflict。`git reset --hard HEAD` で復旧し stash エントリは保持。以後 worktree では detached worktree による baseline 比較へ切り替え
- **再発条件**: 複数 worktree が存在するリポジトリで変更の有無を確認せず stash 往復する場合、pwsh で stash ref を引用符なしで渡す場合、worktree で node_modules を含む stash 往返を行う場合
- **横展開可能性**: 高い。pwsh + worktree 環境の git 操作全般

## 推奨Issue分類

- **分類**: chore（配布 skill 手順の追記）
- **推奨ラベル**: documentation, windows, worktree, git
- **関連Issue**: #2135 (CLOSED), #2200 (CLOSED)
