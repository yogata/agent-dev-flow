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
