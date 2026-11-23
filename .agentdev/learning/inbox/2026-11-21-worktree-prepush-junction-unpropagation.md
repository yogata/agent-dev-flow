---
id: 2026-11-21-worktree-prepush-junction-unpropagation
created_at: 2026-11-21T19:50:00+09:00
source: case-open (Root Case #4177 設計PR #4178 の push 時・pre-push Step 1)
status: unreviewed
---

worktree 環境での git push が pre-push ゲート Step 1（check_autogen_freshness.ts → extensions-integrity.ts → agentdev-project-extensions/scripts/lib/extension_state.ts）で Module not found となる。worktree 内の .opencode/skills/ には repo- プレフィックス実体のみが存在し、agentdev-* junction が伝播しないため、pre-push が依存する junction 系 skill（agentdev-project-extensions）の実体が不在となる。

回避として、worktree 内へ junction を手動作成（New-Item -ItemType Junction、target = worktree 内 src/common/skills/<name> の正本実体）して環境を補完したうえで push を継続した。このとき Step 2 で bun install 由来の残存物（scripts 配下の bun.lock）が untracked-residue に検出されたため、生成した bun.lock を削除して main 側の状態へ戻した。

観点: worktree 構造的制約 Knowledge に「pre-push を含む push 経路の junction 補完手順（worktree 内 src/common 側実体への junction 作成・target は worktree 内正本）」の追記候補。worktree-operations.md の junction 判定規約補記（OU-009・REQ-124-009）と同じ junction 領域の隣接課題。

補足（2026-11-23、Root Case #4212・PR #4213 の push で実証）:

- pre-push の Step 3（検証エンジンテストスイート）起動まで通すには、`.opencode/skills/agentdev-project-extensions`（main 側同名実体への junction）と `src/common/skills/agentdev-project-extensions/scripts/node_modules`（main 側 node_modules への junction・zod 解決）の 2 件の補完が要る。main 側は読取参照のみで不破壊。
- push 成功後に junction エントリのみを削除（node fs.rmdirSync）して後片付けする運用を実践。正規手順の正は worktree-operations.md「bun test 実行の環境前提」節の junction 作成・削除手順（target = main root 絶対パス）。target を worktree 内正本とする本エントリ本編のバリエーションと併せて、依存整備手段選択基準（同節「整備手段の選択基準」）に従って使い分ける。
