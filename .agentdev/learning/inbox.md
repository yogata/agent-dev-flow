# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 2026-06-21 PR #974 (Issue #973 / OU-11: agentdev-gh-cli Windows 文字化け対策)

### PowerShell ヒアドキュメント選択のガードレール明文化候補

- 観測: 本 PR 本文生成時、oh-my-openagent 側で展開ヒアドキュメント（`@"..."@`）を使用した結果、コードフェンス（```` ``` ````）のバッククォートがエスケープ文字として処理されて fence 欠損、`$OutputEncoding` が変数展開されて `System.Text.UTF8Encoding+UTF8EncodingSealed` に化ける事象が発生した。
- 自己修復: SKILL.md Section 6 (b) 内容再生成ルート（非展開ヒアドキュメント `@'...'@` 切替）で解決。
- 教訓候補: 「コードフェンス・`$variable` を含む本文は非展開ヒアドキュメント `@'...'@` を使用」の明文化を `agentdev-gh-cli` または専用 learning で検討すべきか。

### SKILL VERIFY 操作の有効性証左

- 観測: 今回の PR 本文生成プロセスが、今回 SKILL に追記した Section 2 Step 0（コンソールエンコーディング初期化）→ Step 1（`[System.IO.File]::WriteAllText` UTF-8 BOM なし）→ Step 3（`gh pr create --body-file`）→ Section 5-8 VERIFY 操作までを自然に実践し、読み戻し検証で Markdown 構造崩れを検出して Section 6 (b) で自己修復した。
- 教訓: SKILL 手順化（Step 0 → Step 1 → Step 3 → VERIFY）の有効性を示す実証事例。同種の手順化推進の根拠として使える。

### oh-my-openagent の Findings / Capture候補 セクション自動生成未対応

- 観測: 本 PR では case-run 実行担当サブエージェントが事後補完した。
- 改善候補: `references/oh-my-openagent.md` の指示プロンプト雛形に `## Findings / Capture候補`（`### intake` / `### learning` 小見出し）のテンプレート埋め込みを検討すべきか。

## 2026-06-21 PR #975 (Issue #970 / バッチB 文書品質・整備)

### REQ 要件行の振る舞い単位記述と既存 REQ の遡及適用

- 観測: REQ 要件行の「振る舞い単位記述」と「Step 番号参照の排除」は、既存の多くの REQ で部分的に逸脱している可能性が高い（例: REQ 行が「Step N-M で処理する」といった表現を含むケース）。
- リスク: 本 PR で追記したガイドを既存 REQ に遡及適用するかは別 Issue の範囲だが、整備時に暗黙に後方互換性を損なうリスクがある。
- 教訓: 「既存 REQ は現状維持・新規 REQ から適用」の運用ルールがあちこちで暗黙仮定されている。この運用ルールを文書化（REQ-0101 等）すべきか。

### ADR 採番ルールの SKILL↔command 重複と同期リスク

- 観測: ADR 採番（max+1, 欠番埋め禁止）の強調ブロックを SKILL.md と req-save.md の両方に記載した。知識の二重保持は意図的（SKILL は知識ベース・command は実行手順）だが、将来の改定時に同期漏れが起き得る。
- 教訓: SKILL ↔ command の同一ルール重複を許容するか・一方向参照にするかの判断基準が artfact-responsibilities で明示されていない。SKILL/command の責務分割原則に「同一ルール重複」の許容条件を追加すべきか。

## 2026-06-21 PR #976 (Issue #972 / バッチD 記録・検出精度)

### SPEC catalog と実装の同期重要

- 観測: IR-044 検出関数は commit a27a8e56 で「3層ゲート自動化と共に削除」されたが、catalog 定義（IR-044）は維持された。SPEC catalog と実装の間に乖離が生じないよう、削除時は catalog の `baseline_status` を `new` から `resolved` に変更する等の同期運用が必要。
- 教訓: 今回の再実装でこの教訓を反映し、catalog（spec-save 済み）と実装を一致させた。今後 SPEC catalog ↔ 実装の削除・復活時には双方向同期を必須とする。

### `import.meta.main` ガードパターン（bun）

- 観測: `check_integrity.ts` の `main()` がモジュール末尾で無条件実行されており、テストファイルからの import 時に副作用（スクリプト実行）が発生していた。
- 教訓: bun の `import.meta.main` を用いたガードは、エントリポイント判定の標準パターンとして他のスクリプトでも推奨。新規スクリプト作成時のデフォルトパターン化を検討すべきか。

## 2026-06-21 PR #977 (Issue #971 / バッチC 実行インフラ改善)

### ハーネスタイムアウト事後処理の実証

- 観測: 本 Issue の実装プロセス自体が「oh-my-openagent 起動失敗 → 直接実装へ切り替え」の事後処理手順（OU-013 で新設）の実証例となった。`bunx oh-my-openagent run` に prompt を標準入力で渡すと `error: missing required argument 'message'` で即時失敗したことを契機に、直接実装へ切り替えて PR を完遂した。
- 教訓: ハーネス起動失敗時の事後処理として以下の 3 点が有効だった: (1) CLI 引数仕様の事前検証（`--help` で必須引数を確認）、(2) タイムアウト後の worktree `git status` 確認（未コミット変更の有無で再実装 vs 継続を判断）、(3) フォールバック時も REQ/ADR/SPEC/docs を再確認する（driver 引き継ぎプロンプト制約の実践）。本 PR で SKILL 化した手順が即座に自己適用された形。
- 関連 intake: `2026-06-21-issue971-oh-my-openagent-cli-arg-spec.md`（CLI 引数仕様の文脈）。

## 2026-06-21 Epic #979 Wave1 #982 (case-auto worktree基点問題による sub-agent スコープ違反)

### case-auto worktree作成タイミングと中間成果物commitタイミングの不整合

- 観測: Epic #979 Wave 1 の #982 sub-agent が、worktree（origin/main基点＝REQ/ADR 旧状態）で作業中、Issue本文に「REQ-0139-013 は req-save で保存済み」と記載されているにも関わらず worktree内ファイルが旧状態である矛盾に直面。sub-agent はこの矛盾を「修正すべき不具合」と解釈し、MUST NOT DO で禁止されていた REQ/ADR/SPEC ファイルを編集してしまった（PR #986 スコープ違反）。
- 根本原因: case-auto が req-save/spec-save 成果物を main に commit+push する前に worktree を作成したため、worktree に中間成果物が含まれていなかった。Issue本文（「保存済み」）と worktree実ファイル（旧状態）の乖離が発生。
- 影響: PR #986 がスコープ違反でクローズ。REQ/ADR/SPEC の canonical版（main commit 29004a3）と重複する変更が PR に含まれ、マージ時に競合リスクが発生。
- 再発防止候補1: case-auto は case-run（worktree作成）の前に、req-save/spec-save 成果物を main に commit+push するべき。これにより worktree が最新の中間成果物を含む。
- 再発防止候補2: sub-agent のプロンプトで「worktree のファイルが Issue 本文と乖離している場合、REQ/ADR/SPEC を編集せず blocked として報告せよ」と明記する。
- 教訓: 複数工程にまたがるパイプライン（req-save → spec-save → case-open → case-run → case-close）で、中間工程の成果物が main に commit されないまま後続工程の worktree が作成されると、sub-agent がファイル状態の矛盾に直面しスコープ違反を起こすリスクがある。

