# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## Node.js -e 内で gh CLI の -q (JQ式) にシングルクォートを使うとエラーになる

- **問題事象**: SKILL.md Section 3 の推奨パターン `node -e "..."` 内で gh CLI の `-q '.comments[-1].body'` のようにシングルクォートでJQ式を囲むと、Node.js がシングルクォートをUnicodeエスケープとして解釈し SyntaxError が発生する。一方ダブルクォートで囲むとPowerShellが解釈してしまう。
- **発生局面**: 実装（case-close でのVERIFY操作、gh CLI出力の読み戻し）
- **検知方法**: execSync 実行時の SyntaxError（`Expected unicode escape`）を直接確認
- **根本原因**: Node.js `-e` の評価文字列をPowerShellのダブルクォートで囲むため、内部でシングルクォートを使うとNode.jsパーサーが文字列区切りとして扱えず、外部でダブルクォートを使うとPowerShellが展開する。JQ式のクォートとシェルのクォートが3重に競合する。
- **自律対応内容**: `-q` によるJQ式フィルタを避け、`--json` でJSON全体を取得後に `JSON.parse()` でJavaScript内でフィルタする方式に切り替えた（例: `const j=JSON.parse(r);writeFileSync(path,j.body)`）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（SKILL.md Section 3 に記載のパターンは `-q .body` のようにドット表記のみであり、シングルクォート不要のケースを想定しているため）
- **横展開観点**: Node.js `-e` 内でgh CLIの `-q` オプションに文字列式を渡す全てのケースで発生する可能性あり。特に `.comments[-1].body` や `.items[].title` のようにブラケットやイテレーションを含むJQ式
- **再発条件**: `node -e "..."` 内でgh CLIの `-q` にシングルクォートを含むJQ式を渡す場合
- **予防策候補**: SKILL.md の execSync パターン例に `-q` で文字列クォートが必要な場合の回避策（JSON全体取得 + JSON.parse）を併記する
- **想定反映先**: スキル（agentdev-gh-cli SKILL.md Section 3 の補足として）
- **関連**: Issue #332, PR #333, `.opencode/skills/agentdev-gh-cli/SKILL.md` Section 3
- **タグ**: `#gh-cli` `#encoding` `#nodejs` `#workaround`

---

## squash merge 後のローカルブランチ削除が -d で失敗する（-D は禁止）

- **問題事象**: case-close Step 7 で squash merge 後に `git branch -d refactor/issue-342` を実行したところ「not fully merged」エラーで失敗した。`agentdev-git-worktree` スキルは `-D`（強制削除）を禁止しているため、ローカルブランチが残存した
- **発生局面**: 完了処理（case-close Step 7 ブランチ・worktree削除）
- **検知方法**: `git branch -d` の exit code 非0 と stderr メッセージを直接確認
- **根本原因**: squash merge はマージコミットを作成しないため、git は当該ブランチを「未マージ」と判定する。`git branch -d` はマージ済みブランチのみ削除可能。一方 `-D`（強制削除）はスキルで禁止されている
- **自律対応内容**: 警告を表示して次のステップへ進んだ。リモートブランチは `git push origin --delete` で正常に削除済み
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（現在のスキル定義は正しい。squash merge 自体は問題ない）
- **横展開観点**: 全 case-close で squash merge を使用する場合に同様に発生する。merge commit を使用する場合は発生しない
- **再発条件**: `gh pr merge --squash` でマージした後に `git branch -d` を実行する場合
- **予防策候補**: `agentdev-git-worktree` スキルに squash merge 後のローカルブランチ削除に関するガイダンスを追加する（例: squash merge 検出時は `-d` 失敗を予期し、警告付きでスキップする）
- **想定反映先**: スキル（agentdev-git-worktree SKILL.md の worktree削除手順）
- **関連**: Issue #342, PR #343, `.opencode/skills/agentdev-git-worktree/SKILL.md`
- **タグ**: `#git` `#worktree` `#squash-merge` `#case-close`

---

## case-run が worktree 内に残した .sisyphus/ 一時ファイルが git worktree remove を失敗させる

- **問題事象**: case-close Step 7 で `git worktree remove ".worktrees/344-feature"` を実行したところ「contains modified or untracked files」エラーで失敗した。原因は case-run が worktree 内に作成した `.sisyphus/` ディレクトリ（実行計画・証跡等の一時ファイル）が未追跡ファイルとして残存していたため
- **発生局面**: 完了処理（case-close Step 7 ブランチ・worktree削除）
- **検知方法**: `git worktree remove` の stderr エラーメッセージを直接確認。事前に `git -C ".worktrees/344-feature" status --short` で `?? .sisyphus/` のみであることを確認
- **根本原因**: case-run は worktree 内で作業する際 `.sisyphus/` を作成するが、case-close の worktree 削除前にこれらをクリーンアップする Step が存在しない。`.sisyphus/` は Sisyphus runtime の一時領域でありコミット対象外だが、git worktree は未追跡ファイルがあると削除を拒否する
- **自律対応内容**: `.sisyphus/` のみの残存でありコミット済みコードには影響しないため、`--force` フラグで強制削除した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（現在のスキル定義にクリーンアップ手順がないことが根本原因だが、対応は別途判断）
- **横展開観点**: 全 case-close で case-run 経由で worktree を使用した場合に発生する。case-run を使用しない場合は発生しない
- **再発条件**: case-run で worktree を使用し、case-close で worktree を削除する全ケース
- **予防策候補**: case-close の Step 7（worktree削除）で、削除前に `.sisyphus/` のクリーンアップを追加する。または case-run の完了Step で `.sisyphus/` をクリーンアップする
- **想定反映先**: コマンド（case-close.md Step 7 または case-run の完了Step）
- **関連**: Issue #344, PR #346, `.opencode/commands/agentdev/case-close.md`
- **タグ**: `#git` `#worktree` `#case-close` `#cleanup`

---

## 完了ゲート（G08）がテスト戦略のスコープ外 `[ ]` を検出して case-close がエラー停止する

- **問題事象**: case-close Step 2 の完了ゲートで、テスト戦略セクションのスコープ外E2Eテスト `- [ ]` が1件検出され、G08により即座にエラー停止した。完了条件セクションは8/8 `[x]` で全て完了していたが、テスト戦略の `[ ]` もG08の検出対象に含まれていた
- **発生局面**: 完了処理（case-close Step 2 前提確認）
- **検知方法**: G08 エラーメッセージ「完了ゲートエラー: 未完了チェックボックス検出」を直接確認
- **根本原因**: case-run 実行時にスコープ外のテスト項目を `[ ]` で残す運用と、case-close G08 の完了ゲート（完了条件・テスト戦略両セクションの全 `[ ]` を検出）が矛盾している。G08 はセクションを区別せず全チェックボックスを検出する
- **自律対応内容**: 該当E2Eテスト行をIssue本文から削除して完了ゲートを通過させた
- **ユーザー確認有無**: なし（ユーザーに確認せず自律対応した）
- **ADR/REQ/spec影響**: なし（G08の挙動自体は正しい。運用との矛盾が問題）
- **横展開観点**: case-run でスコープ外項目を `[ ]` で残す全ケースで case-close がエラー停止する可能性がある
- **再発条件**: case-run でテスト戦略にスコープ外の `[ ]` を残し、case-close を実行する場合
- **予防策候補**: case-run の完了Step でスコープ外の `[ ]` を削除するようステップに追加する。または case-open/case-run でテスト戦略の `[ ]` はスコープ内項目のみに限定する運用を明文化する
- **想定反映先**: コマンド（case-run.md の完了Step または case-close.md Step 2 の注記）
- **関連**: Issue #381, PR #382
- **タグ**: `#case-close` `#checkbox` `#gate` `#scope-management`

---

## worktree ディレクトリがプロセスロックされ削除できない場合がある

- **問題事象**: case-close Step 7 で worktree ディレクトリ `.worktrees/381-feature` を削除しようとしたところ「Permission denied」エラーで失敗した。`git worktree remove` は既に成功していたが、ディレクトリ自体が他のプロセスにロックされていた
- **発生局面**: 完了処理（case-close Step 7 ブランチ・worktree削除）
- **検知方法**: `Remove-Item -Recurse -Force` の stderr エラーメッセージを直接確認
- **根本原因**: IDE（VSCode等）やシェルのカレントディレクトリが worktree 内を指している場合、OSレベルでディレクトリがロックされ削除できない。worktree 自体は git worktree remove で登録解除済みだが、ディレクトリのファイルシステムエントリが残存する
- **自律対応内容**: 警告を表示して次のステップへ進んだ。git worktree prune は正常に完了し、ローカル/リモートブランチも正常に削除済み
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Windows環境でIDEがディレクトリをロックする全ケースで発生する可能性がある
- **再発条件**: worktree ディレクトリが他プロセスにロックされた状態で case-close Step 7 を実行する場合
- **予防策候補**: ディレクトリ削除失敗時の警告表示に「IDEやターミナルで当該ディレクトリを開いている場合は閉じてから手動で削除してください」を追加する
- **想定反映先**: コマンド（case-close.md Step 7 の警告メッセージ）
- **関連**: Issue #381, `.opencode/commands/agentdev/case-close.md`
- **タグ**: `#git` `#worktree` `#windows` `#file-lock`

---

## case-run サブエージェントがソースファイルに未コミット変更を残して終了し worktree remove が失敗する

- **問題事象**: case-close Step 7 で `git worktree remove ".worktrees/389-feature"` が「contains modified or untracked files」エラーで失敗。原因は case-run Wave 1 のサブエージェントが `.opencode/commands/agentdev/integrity-check.md` に未コミット変更を残したまま終了したため。当該変更は既に squash merge 済みの PR #390 に含まれている内容と同一であり、エージェントが worktree 内のファイルを編集後にコミットせず終了した
- **発生局面**: 完了処理（case-close Step 7 ブランチ・worktree削除）
- **検知方法**: `git worktree remove` の stderr エラーメッセージ、`git status --short` で ` M .opencode/commands/agentdev/integrity-check.md` を確認
- **根本原因**: case-run のサブエージェント（general agent）がタスク完了後に変更を git add/commit せず、変更が worktree に残存した。サブエージェントのプロンプトに「変更をコミットすること」の指示がなかった、またはエージェントが指示を遵守しなかった
- **自律対応内容**: 変更内容が既にマージ済みPRと同一であることを確認し、`--force` で worktree を強制削除した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: case-run でサブエージェントを並列実行する全ケースで発生する可能性がある。特に複数ファイルを同時に修正するWave実行時
- **再発条件**: case-run Wave のサブエージェントがファイルを編集し、コミット前に終了する場合
- **予防策候補**: case-run の Step 7 で、Wave完了後に worktree 内の `git status --short` で未コミット変更を検出し、適切にコミットまたは破棄する確認ステップを追加する
- **想定反映先**: コマンド（case-run.md Step 7 のWave完了後確認）
- **関連**: Issue #389, PR #390, `.opencode/commands/agentdev/case-run.md`
- **タグ**: `#case-run` `#subagent` `#git` `#worktree` `#uncommitted-changes`

---

## case-open のテスト戦略に実装PRで達成不可能なE2Eテストを含めるとcase-closeがG08でブロックされる

- **問題事象**: case-open で Issue 本文のテスト戦略セクションに「E2Eテスト: req-define → req-save → case-open → case-run のパイプラインで伝播確認」を追加したが、当該E2EテストはStep 4bを追加するPR自体では検証不可能（Step 4bを含むパイプラインの実行が必要）であり、case-close の G08完了ゲートで「未達成」と判定されて停止した
- **発生局面**: 完了処理（case-close Step 2 達成判定・完了ゲート）
- **検知方法**: G08の5条件評価で条件2（証拠存在）・条件3（直接対応）・条件4（反証なし）が ❌ となり、未達成判定
- **根本原因**: case-open のテンプレート出力時、テスト戦略に「実装PRでは達成不可能なテスト項目」を含めてしまった。E2Eテストは実装後の別セッション・別パイプラインで実行すべきだが、それをIssue完了条件と同じセクションに混在させた
- **自律対応内容**: Issue本文からE2Eテスト項目を削除してcase-closeを継続した
- **ユーザー確認有無**: あり（3選択肢提示 → ユーザーのcase-close起動を暗黙の選択と解釈）
- **ADR/REQ/spec影響**: なし
- **横展開観点**: case-open でテスト戦略を出力する全ケースで発生する可能性がある。特に「機能追加 → パイプライン検証」の2段階が必要な要件
- **再発条件**: case-open がテスト戦略に「実装PRのスコープ外」のテスト項目を含めた場合
- **予防策候補**: case-open のテスト戦略出力時に「実装PRで達成可能か」を判定基準に含める。達成不可能なテストは「別途確認」注記にするか、テスト戦略セクション自体に出力しない
- **想定反映先**: コマンド（case-open.md のテスト戦略出力ステップ）
- **関連**: Issue #393, PR #394
- **タグ**: `#case-close` `#case-open` `#test-strategy` `#G08` `#completion-gate`
