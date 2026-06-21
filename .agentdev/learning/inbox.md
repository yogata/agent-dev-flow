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

