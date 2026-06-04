# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 同一ファイルを変更する兄弟PRの逐次マージ時のコンフリクト対処

- **問題事象**: case-closeでPR #507(Issue #504)を先にsquash mergeした後、PR #508(Issue #503)の `gh pr merge --squash` が失敗。両PRが同一テストファイル `check_integrity.test.ts` の末尾に独立したテストセクション（describe block）を追加しており、main側が更新されたことでfeature/issue-503ブランチがbehindになった
- **発生局面**: 実装（case-close の PRマージステップ）
- **検知方法**: `gh pr merge --squash` の非ゼロ終了コードとエラーメッセージ
- **根本原因**: 兄弟Issue (#503, #504) がEpic #502配下で並列開発され、同一ファイルに追記形の変更を行っていた。一方のマージ後にもう一方のブランチがbaseより古くなり、squash merge不可となった
- **自律対応内容**: (1) `git rebase origin/main` でfeature/issue-503を最新mainにrebase、(2) コンフリクトを解消（両方のテストセクションを保持）、(3) force push、(4) squash merge成功を確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 同一Epic配下の並列開発で同一ファイルを変更するパターン全般に適用可能。特にテストファイルの末尾追記型変更で顕著
- **再発条件**: (1) 同一ファイルを変更する2つ以上のPRが存在、(2) それらを逐次マージする場合、(3) 後続PRがrebaseなしでマージを試みた場合
- **予防策候補**: (1) case-closeで複数PRを処理する際、マージ順序で後になるPRほどコンフリクトリスクが高いことを認識する、(2) マージ失敗時はrebase + conflict resolution → force push → retryのワークフローを標準手順とする
- **想定反映先**: case-close コマンドの Step 4（PRマージ）のエラー回復手順として文書化、または case-run の並列開発ガイドライン
- **関連**: Issue #503, #504, PR #507, #508, Epic #502, `tests/check_integrity.test.ts`
- **タグ**: `#merge-conflict` `#case-close` `#parallel-development` `#rebase`

---

## 2026-06-02: 並行PRでの同一正規化変更によるdocs競合の反復発生

- **問題事象**: case-close #511でPR #516をマージ時、#513と#512が先にマージされており、両方でreference/→references/正規化を実施済みのためdocs/guides/artifact-model.mdとdocs/specs/patterns.mdでコンフリクトが発生した
- **発生局面**: 実装（case-closeのPRマージステップ）
- **検知方法**: `git merge origin/main`のCONFLICT出力
- **根本原因**: 3つの並行PR（#511, #512, #513）がすべて同じreference/→references/正規化を独立に実施し、同一ファイルの同じ箇所を変更した
- **自律対応内容**: (1) worktree内でorigin/mainをmerge、(2) 2ファイルの競合を解消（表示テキストの`reference/`を`references/`に統一、コメント表記の"Skill"大文字化を採用）、(3) commit & push、(4) squash merge成功
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 複数Issueで共通のpath正規化・名称統一作業を行う場合、最初のPRだけで対応し後続PRでは重複させない設計が必要
- **再発条件**: (1) 複数PRが同一ファイルの同じ箇所を同じ方向に変更する、(2) PRが逐次マージされる、(3) 後続PRのマージ時に先にマージされた変更と競合する
- **予防策候補**: (1) 共通変更（path正規化等）は独立した単独PRとして最初にマージする、(2) 並行PR間で変更ファイルの重複を事前検知する、(3) case-run/case-closeでmerge前に`git merge origin/main --no-commit`で競合の有無を確認する手順を標準化する
- **想定反映先**: agentdev-git-worktree/references/git-common-procedures.mdのPR merge前確認手順、またはagentdev-workflow-orchestrationの並行Wave実行ガイド
- **関連**: Issue #511, #512, #513, PR #516, `docs/guides/artifact-model.md`, `docs/specs/patterns.md`
- **タグ**: `#merge-conflict` `#parallel-pr` `#canonical-path` `#case-close`

---

## 2026-06-02: .sisyphus/内のtracked fileがworktree削除をブロック

- **問題事象**: case-close #511のworktree削除で`git worktree remove`が"contains modified or untracked files"で失敗。原因は.sisyphus/plans/plan-513.mdがfeature branchにcommitされており、.sisyphus/クリーンアップで削除したことでgitがmodified（deleted）と判定した
- **発生局面**: 実装（case-closeのworktree削除ステップ）
- **検知方法**: `git worktree remove`の非ゼロ終了コード
- **根本原因**: (1) .sisyphus/plans/plan-513.mdがfeature branchにcommitされていた（runtime workspaceのファイルがgit管理下にあった）、(2) .sisyphus/クリーンアップがtracked fileも削除してしまった
- **自律対応内容**: (1) `git checkout .`でdeleted fileを復元、(2) `git worktree remove`を再実行して成功
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。AGENTS.mdに「.sisyphus/はruntime workspace」と明記済みだが、実際にはtracked fileが存在した
- **横展開観点**: .sisyphus/内にtracked fileが残存する他のworktreeでも同様に発生しうる
- **再発条件**: (1) worktree内で.sisyphus/以下のファイルがgit commitされている、(2) case-closeの.sisyphus/クリーンアップでtracked fileを削除する、(3) `git worktree remove`がmodified filesを検出する
- **予防策候補**: (1) .sisyphus/クリーンアップ手順を`git status --short`でuntracked filesのみ削除するよう変更、(2) .sisyphus/plans/等のruntime fileをcommitしない運用にする、(3) worktree削除前に`git checkout .`でrestorationを挟む手順を追加
- **想定反映先**: agentdev-git-worktreeのworktree削除手順（SKILL.mdまたはreferences/worktree-operations.md）
- **関連**: Issue #511, `.sisyphus/plans/plan-513.md`, `agentdev-git-worktree/references/worktree-operations.md`
- **タグ**: `#worktree` `#cleanup` `#case-close` `#git`

---

## 2026-06-03: Epic Orchestrator完了後の子Issue未クローズ残存パターン

- **問題事象**: Epic #519 の case-run (Orchestratorモード) で全10子IssueのPR作成・MERGEDまで完了したが、子Issue #520-#527の8件がOPENのまま残存。Epic #519のcase-close時にG04（Epic自動クローズは全子Issue CLOSEDの場合のみ）に抵触し、先に8件の子Issueを個別にcase-closeする必要が生じた
- **発生局面**: 完了処理（case-close Epic Issue）
- **検知方法**: G04 guardrail判定によるEpicクローズ不可の検出
- **根本原因**: Epic Orchestratorモードのcase-runはPR作成までを担当し、Issueクローズはcase-closeの責務。しかしEpic Orchestratorで連続実行した場合、各Waveの完了 = PR MERGED ≠ Issue CLOSED という状態が暗黙に蓄積する。子Issueのcase-closeを個別に実行する運用フローが確立されていなかった
- **自律対応内容**: (1) #520-#527の8件に対して対応記録コメント投稿＋gh issue close --reason completedを一括実行、(2) 全子Issue CLOSEDを確認後、Epic #519をクローズ
- **ユーザー確認有無**: あり（G04制約を説明し、子Issue先closeを推奨→ユーザー承認）
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Epic Orchestratorで10+子Issueを処理する全パターンに適用。特にWave数が多い大規模Epicで顕著
- **再発条件**: (1) Epic Orchestratorモードでcase-runを実行、(2) 子IssueのPRがMERGEDされる、(3) 子Issueのcase-closeを個別に実行せずにEpicのcase-closeを試みる
- **予防策候補**: (1) Epic Orchestrator完了後に「未クローズ子Issueのcase-close」を自動プロンプトする、(2) case-closeのEpic検出時に子IssueのOPEN/CLOSED状態を事前チェックする手順を追加、(3) Orchestrator完了報告に「N件の子IssueがOPEN（要case-close）」を明記する
- **想定反映先**: case-closeコマンドのEpic Issue検出時の事前チェック、またはcase-runのOrchestrator完了報告フォーマット
- **関連**: Epic #519, 子Issue #520-#529, case-run Orchestratorモード, G04 guardrail
- **タグ**: `#epic-orchestrator` `#case-close` `#issue-lifecycle` `#guardrail`

---

## cross-skill 参照の false positive: path 存在検査の精度限界

- **問題事象**: `checkScriptTemplateReferencePaths()` が cross-skill の相対パス参照を false positive として8件検出。skill 内からの参照は skill-relative だが、他の skill から参照されるパスはリポジトリルート相対として解釈されるため、実在するファイルが "missing" と判定される
- **発生局面**: 実装（case-run Step 6 の integrity-check 拡張）
- **検知方法**: integrity-check 実行時の 35 ReferencePath results（27 ok, 8 ng）
- **根本原因**: path 存在検査が参照元ファイルのディレクトリを基準に相対パスを解決するが、cross-skill 参照では参照元 skill のディレクトリではなくリポジトリルートが意図されるケースがある。Markdown 内の相対パス解決ルールとファイルシステムの相対パス解決ルールの差
- **自律対応内容**: false positive を既知の制約として受け入れ、完了報告に明記。修正はスコープ外
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-0108-115/116 の要件は充足）
- **横展開観点**: integrity-check の path 存在検査全般に適用。Markdown 内リンクとファイルシステムパスの解決ルール差異に起因する false positive パターン
- **再発条件**: (1) skill A が skill B のファイルを相対パスで参照、(2) 参照元を基準にパス解決すると実在しないパスになる、(3) リポジトリルート基準なら実在する
- **予防策候補**: (1) 参照元の種別（command/skill）に応じたベースディレクトリ切替、(2) Markdown link 解決ルールの明文化、(3) false positive を抑制する除外パターンの導入
- **想定反映先**: agentdev-integrity の checkScriptTemplateReferencePaths() 改善、または REQ-0108 の path 解決ルール明文化
- **関連**: Issue #544, PR #545, REQ-0108-115/116, check_integrity.ts
- **タグ**: `#integrity-check` `#false-positive` `#path-resolution` `#cross-skill`

---

## worktree ディレクトリのプロセスロックによる削除失敗

- **問題事象**: case-close の Step 7 で `git worktree remove` が "Permission denied" で失敗。ローカルブランチとリモートブランチは削除成功したが、.worktrees/544-feature ディレクトリがプロセスにロックされ物理削除不可
- **発生局面**: case-close Step 7（ブランチ・worktree削除）
- **検知方法**: `git worktree remove` の non-zero exit と "Permission denied" エラー
- **根本原因**: LSP server（TypeScript Language Server）やエディタが worktree 内のファイルを監視・インデックスしており、ディレクトリハンドルを解放していない。`git worktree prune` 後もファイルシステムレベルでロックが継続
- **自律対応内容**: (1) `git worktree prune` で git 管理からは除外、(2) ローカル/リモートブランチ削除は完了、(3) ディレクトリ物理削除は警告として完了報告に記載
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 全 case-close で worktree 削除時に発生する可能性。特に TypeScript/Node.js プロジェクトで LSP が動作している環境
- **再発条件**: (1) LSP が worktree 内のファイルを監視中、(2) worktree を削除しようとした場合
- **予防策候補**: (1) worktree 削除前に LSP を停止する手順の追加、(2) 削除失敗時の遅延リトライ（5-10秒後に再試行）、(3) 削除失敗を警告として扱いユーザーに手動削除を促す（現状の対応）
- **想定反映先**: agentdev-git-worktree の worktree 削除手順、または case-close のエラー回復手順
- **関連**: Issue #544, case-close Step 7, .worktrees/544-feature
- **タグ**: `#worktree` `#permission-denied` `#lsp` `#case-close`

---

## 2026-06-04: Epic子Issueの逐次squash merge時のbase branch modification失敗

- **問題事象**: Epic #559 の6PRを逐次squash mergeする際、PR #566 (#561) のマージが4回連続で失敗。エラーは「base branch was modified」。先行PR (#567, #569, #571, #568, #570) のマージが毎回mainを更新するため、GitHub APIがbase branch modificationを検出した
- **発生局面**: 完了処理（case-closeのPRマージステップ）
- **検知方法**: `gh pr merge --squash` の非ゼロ終了コードとエラーメッセージ
- **根本原因**: Epicの子Issue PRを逐次squash mergeすると、各マージがbase branch (main) を更新する。GitHubはsquash merge時にbase branchの最新stateを検証し、マージ実行直前にbaseが更新された場合（直前のPRマージによる）は操作を拒否する。6PRのマージで最大5回のbase更新が発生し、後続PRほど失敗確率が上がる
- **自律対応内容**: (1) 失敗するたびに同一内容でリトライ、(2) 4回目のリトライで成功。base branch更新のタイミングとマージ実行のタイミングがズレることで最終的に成功する
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 3件以上のPRを逐次squash mergeする全パターンに適用。特にEpicの子Issue一括マージで顕著
- **再発条件**: (1) 同一base branchに対する複数PRを逐次squash mergeする、(2) マージ間隔が短い（秒単位）、(3) GitHub APIがbase branch modificationを検出する
- **予防策候補**: (1) squash merge間に短い待機（5-10秒）を挟む、(2) マージ失敗時の自動リトライ回数を増やす（現状2回→5回程度）、(3) case-closeで複数PRを処理する際のリトライロジックを強化
- **想定反映先**: case-closeコマンドのStep 4（PRマージ）のリトライロジック、またはagentdev-gh-cliのVERIFY操作リトライ
- **関連**: Epic #559, PR #566/#567/#568/#569/#570/#571, case-close Step 4
- **タグ**: `#squash-merge` `#base-branch` `#retry` `#case-close` `#epic`

---

## 2026-06-04: Node.js -e内のテンプレートリテラルでバックティックと中括弧が競合

- **問題事象**: gh CLI出力をNode.js `node -e` で処理する一時スクリプトで、テンプレートリテラル内にバックティックを含むパス（例: `.opencode/commands/agentdev/templates/{command}/{variant}.md`）を記述したところ、Node.jsが中括弧を式補間と解釈し`ReferenceError: commands is not defined`が発生
- **発生局面**: 実装（case-closeのコメント投稿スクリプト）
- **検知方法**: `node script.js` 実行時のSyntaxError/ReferenceError
- **根本原因**: JavaScriptテンプレートリテラル（バックティック）内の`${...}`は式補間として評価される。中括弧 `{command}` を含むパス文字列をテンプレートリテラル内に記述すると、`${command}` とは限らずともパーサが混乱し、エスケープされていない中括弧パターンでエラーになる。特に `node -e "..."` のインライン実行ではクォート階層が複雑になり回避困難
- **自律対応内容**: (1) テンプレートリテラルの使用を中止、(2) 配列の `join("\n")` による文字列構築に切り替え、(3) 外部.jsファイルに退避して実行
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Node.jsで一時スクリプトを書く全パターンに適用。特にgh CLI出力の後処理スクリプト
- **再発条件**: (1) Node.jsスクリプト内でテンプレートリテラルを使う、(2) 文字列内にバックティックや`${...}`パターンを含む、(3) `node -e` のインライン実行でクォート階層が競合する
- **予防策候補**: (1) 一時スクリプトではテンプレートリテラルを使わず配列joinまたは文字列結合を使用、(2) `node -e` は単純な式のみに制限、(3) 複雑な文字列処理は外部.jsファイルに退避（agentdev-gh-cli skill の推奨に従う）
- **想定反映先**: agentdev-gh-cli skill のWindows回避策セクション、またはcase-close/case-runの一時スクリプト作成ガイド
- **関連**: case-close Step 4a, `.sisyphus/tmp/post-comments.js`
- **タグ**: `#nodejs` `#template-literal` `#script` `#workaround`
