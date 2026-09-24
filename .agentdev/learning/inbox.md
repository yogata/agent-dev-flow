# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 横断依存検査の検査入力 JSON が workspace 外書込みで guard ブロックされ worktree 内一時パスへ切替

- **問題事象**: case-open STEP-5 横断依存検査の検査入力 JSON を harness 提案の temp ディレクトリ（C:\WINDOWS\TEMP\opencode）へ保存しようとしたところ、agentdev-textlint-guard Plugin が workspace 外への write を fail-closed でブロックした（エラーメッセージ: write targets a path outside the project root; blocked per fail-closed）
- **発生局面**: 実装（case-open workflow STEP-5・Case #3101）
- **検知方法**: write ツールの fail-closed エラー応答
- **根本原因**: 横断依存検査エンジン（inspect_cross_dependencies.ts）の scripts/README.md は --input \<input.json\> のみを規定し、検査入力 JSON の置き場所の推奨先を定めていない。一時ファイル先として workspace 外 temp を選択したが、write guard は fail-closed で workspace 外書込みを拒否する（AGENTS.md 行動規範と整合した正しい動作）
- **自律対応内容**: workspace 外 temp への書込みを断念し、本 Case 専用 worktree 配下（.worktrees/3101-definition/\.tmp-crossdep-input-ru0123.json、git 未追跡）に検査入力を置いてエンジンを実行。検査後に一時ファイルを削除し、worktree が clean であることを git status で確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree 配下で実行する機械的検査の入力一時ファイルは、workspace 外 temp ではなく検査対象 worktree 配下の明示的な一時パス（commit 対象外・検査後削除）へ置く。guard ブロックは迂回せず標準手段へ切替する（AGENTS.md 書込み guard 運用指針の実行例）
- **再発条件**: worktree 配下の workflow がエンジン入力 JSON 等の一時ファイルを必要とし、harness 側推奨 temp パスに書込む場合に再発
- **予防策候補**: inspect_cross_dependencies.ts の scripts/README.md に検査入力 JSON の置き場所指針（workspace 外 temp 禁止・worktree 配下一時パス推奨・検査後削除）の注記を追加する
- **想定反映先**: docs（src/opencode/skills/agentdev-workflow-case-open/scripts/README.md への注記追記。具体化の判断は backlog/intake 側）
- **関連**: .opencode/skills/agentdev-workflow-case-open/scripts/README.md、Case #3101（PR #3102）
- **タグ**: `#worktree` `#write-guard` `#cross-dependency-inspection`
