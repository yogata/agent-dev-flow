---
id: 2026-11-23-worktree-machine-step-gate-zod-resolution
created_at: 2026-11-23T01:43:00+09:00
source: case-open (Root Case #4202 設計PR作成時・prepare_definition_pr.ts 機械工程)
status: unreviewed
---

# worktree 機械工程の gate 実行体は main root 実体からの --root 実行が必要（per-scripts node_modules 非伝播）

- **問題事象**: case-open STEP-4 機械工程（prepare_definition_pr.ts）を worktree（`.worktrees/4202-definition`、branch `definition/issue-4202`、baseline: commit 37b6e0f23・2026-11-23 実行）で実行したところ、1 回目の実行が generate_indexes 後段 gate の直前で `Cannot find package 'zod'` により失敗した（exit 1）。edit 適用後・commit 前の段階で停止し、worktree 作業木に 7 Design ファイルの未 commit 変更と未追跡の REQ-125.md が残る状態となった。実行コマンド: `bun prepare_definition_pr.ts --input <input.json> --root <worktree>`（2 回実行、1 回目失敗・2 回目成功）。
- **発生局面**: 実装（case-open 機械工程の worktree 実行時。Root Case #4202 設計PR作成・2026-11-23）
- **検知方法**: script の標準エラー出力（zod パッケージ解決失敗メッセージ）と exit code 1
- **根本原因**: git worktree は `.gitignore` 対象（node_modules）を実体として伝播しないため、scripts 配下の per-dir node_modules が worktree 側に存在せず、worktree 投影先パスから起動した bun の依存解決が失敗する。pre-push の junction 不伝播（`2026-11-21-worktree-prepush-junction-unpropagation`）と同じ worktree 構造的制約に起因するが、対象が異なる別原因である（あちらは `.opencode/skills/` の agentdev-* junction、今回は scripts 配下 node_modules）。
- **自律対応内容**: 失敗分を `git restore`（明示パス指定・7 Design ファイル）で復旧し REQ-125.md のみ残した上で、後段 gate の実行体を worktree と同一 commit（37b6e0f23・クリーン Tree）の main root 実体パスへ差し替えた入力 JSON を再構築し、`--root` で worktree を検査対象に指定して再実行した。2 回目は commit 9aa4ab349 作成、generate_indexes 成功（README AUTOGEN 更新）、check_integrity 成功（exit 0・OK 24 / NG 0）、traceability check は設計どおりの deferred warn（missing-design 0）で完走した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（作業手順の回避であり、正規成果物・配布物・Decision/REQ/spec への変更なし）
- **横展開観点**: worktree 内で scripts 配下スクリプトを起動する全工程（case-ready・case-revise・backlog/inspect/learning 系 workflow の機械工程）に同一制約が適用され得る。gate 実行体は main root の同一 commit 実体から起動し、`--root` で対象 Tree を指定する形が安全。definition-pr-and-idempotency.md STEP-4 手順 4 は後段ゲートの代替実行（main root 実体からの --root 指定）を既に規定しており、本件はその適用場面が初回実行にも及ぶことを実観測した例。
- **再発条件**: worktree 内の scripts ディレクトリに node_modules が存在しない状態で、当該 scripts 配下スクリプト（外部依存 zod 等を import するもの）を worktree 相対パスから起動した場合に再発。
- **予防策候補**: (1) case-open workflow references（script-invocation.md）または scripts README の実行契約節への「worktree 実行時は gate 実行体を main root の同一 commit 実体から起動し --root で対象を指定する」制約の追記候補、(2) prepare_definition_pr.ts 側の gate 実行体パス解決に worktree 対応を入れる改善候補（対応要否は別途判断）。
- **想定反映先**: case-open workflow skill references（script-invocation.md）、scripts README の実行契約節、または worktree 構造的制約 Knowledge（隣接課題との統合先）
- **関連**: `.agentdev/learning/inbox/2026-11-21-worktree-prepush-junction-unpropagation.md`（隣接課題・別原因）、`src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md`（STEP-4 手順 4 の代替実行条項）、Root Case #4202
- **タグ**: `#worktree` `#node_modules` `#bun` `#case-open` `#機械工程`
