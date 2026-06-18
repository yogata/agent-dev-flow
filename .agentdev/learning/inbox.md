# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 2026-06-18: case-open cleanup で git add -A を使用すると意図しないファイル削除が混入するリスク

**状況**: case-open の後段処理（draft/RU削除）で `git add -A` を使用したところ、過去のcase-auto実行で作業ディレクトリから物理削除されていた他のtracked draftファイルの削除も同時にstagingしてしまった。対象外のdraft 2件が誤削除され、復元commitが必要になった。

**学び**: cleanup処理で `git add -A` を使う前に `git status` で意図しない変更・削除がないか必ず確認すること。または、削除対象ファイルのパスを明示的に `git rm` / `git add` で指定し、`git add -A` を避けること。

**再発防止**: case-open/case-close のcleanup stepでは、削除対象ファイルを明示的に指定して staging する。

## 2026-06-18: REQ ID は4桁、IR ID は3桁 — パーサ実装で桁数を取り違える落とし穴

**状況**: Issue #898 の catalog/impact-map パーサ実装で、REQ ID の正規表現を `/^REQ-\d{3}$/` と書いてしまった（3桁）。実際の REQ ID は4桁（REQ-0101 等）であり、テストで REQ ID が一切マッチしない不具合が発生した。IR ID は3桁（IR-001 等）であるため、両者を混同しやすい。

**学び**: AgentDevFlow の ID 体系では「REQ は4桁（REQ-NNNN）、IR は3桁（IR-NNN）」と桁数が異なる。パーサやバリデータを実装する際は、ID 種別ごとの桁数を明示的に確認し、正規表現の桁数を取り違えないこと。

**再発防止**: ID の正規表現を書く際は、対象 ID の実際のサンプル（REQ-0101, IR-001 等）をコメントに併記し、桁数を誤らないようにする。テストでは必ず実データ（catalog や impact-map からの実 ID）を使用して検証する。

## 2026-06-18: gate hook の strict/heuristic 区別は --strict-only flag で解決する（global exit code 変更禁止）

**状況**: Issue #899 の Delta Guard / Impact Guard 実装で、`check_integrity.ts` の exit code が strict 違反（block）と heuristic 違反（warning）を区別できない問題に直面した。`determineExitCode()` は ng と warning の両方で EXIT_NG(1) を返すため、heuristic 違反でも commit/push が block されてしまう。global な `determineExitCode()` の挙動を変更すると full-audit mode の既存テストが壊れるリスクがあった。

**学び**: gate hook で strict/heuristic を区別する必要がある場合、global exit code semantics を変更せず、`--strict-only` flag を追加して `determineExitCodeStrict()` を実装すること。これにより既存の full-audit 呼び出しは影響を受けず、gate hook のみが strict-only モードで動作する。併せて `classifyResult()` が `finding_level` を未設定のまま残す既存不具合も root-cause fix した（`--strict-only` の前提となるため）。

**再発防止**: exit code の strict/heuristic 区別が必要な場面では、呼び出し元が flag で挙動を切り替えられるようにする。global な関数の挙動を変更すると影響範囲が予測不能なため、flag-based の opt-in アプローチを優先する。

## 2026-06-18: Windows+junction worktree では .opencode/ が空になり source/projection 手動同期が必要 — driver 引き継ぎに明記

**状況**: Issue #900 (RU-3) の driver 委譲で、git worktree（`.worktrees/{N}-*`）内の `.opencode/commands/agentdev/`・`.opencode/skills/agentdev-*/` が junction 未伝播で空ディレクトリになった。本 repo では `.opencode/agentdev-*` が `.gitignore` で track 対象外のため worktree 作成時に内容が伝播せず、同期スクリプトに頼ると worktree 内で source-projection 系整合性検査が失敗する。

**学び**: Windows+junction 環境の worktree では plugin skill/command の projection 側が空になる。source（`src/opencode/**`）と projection（`.opencode/**`）の両辺を手動編集で同期し、同期スクリプトではなく手動コピーで担保する。この制約自体は `agentdev-workflow-orchestration` SKILL に既記載だが、driver subagent への引き継ぎプロンプトに毎回明記する必要がある。

**再発防止**: case-run から driver subagent を起動する際、プロンプトの CONTEXT に「worktree 内 `.opencode/` は空・source/projection は手動両辺編集・同期スクリプト非依存」を必ず明記する。提出フェーズのローカル検証で source-projection 系整合性検査を含む場合は worktree 内で失敗することを前提に扱う。

## 2026-06-18: REQ に command の Step 番号を固定すると drift する — 振る舞いで書き command reference 参照に

**状況**: Issue #903 (RU-5) の IR-044 クリーンアップで、REQ-0131-010 が「`case-close` Step 8 乖離検出において…」と記載していたが、現行 `case-close.md` では乖離検出（docs/検証）は Step 3 に該当し、REQ の Step 番号が実装と drift していた。REQ-0104-047 / REQ-0114-060/063 / REQ-0136-010 でも同様に command の Step 番号が REQ に固定されていた。IR-044 はこれらを SPEC 詳細（Step 番号）混入として検出した。

**学び**: REQ 要件行に特定 command の Step 番号を書くと、command のリファクタ（Step 番号変更）で即座に REQ が陳腐化する。REQ には振る舞い（何をするか・なぜ）を書き、具体的ステップ番号は command reference（`.md`）側にのみ保持し、REQ からは「対象ステップの詳細は command reference 参照」と抽象化する。これが REQ/SPEC 責務分離（REQ-0101-068）の Step 番号項目の実践的意味でもある。

**再発防止**: REQ を新規作成・更新する際、要件行に command の Step 番号を直接書かない。振る舞いで記述し、ステップ詳細は command reference へ委ねる。IR-044 が Step 番号混入を検出したら移行（番号除去 + 振る舞い残留）で是正する。

