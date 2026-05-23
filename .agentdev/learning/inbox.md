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
