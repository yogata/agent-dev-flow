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

