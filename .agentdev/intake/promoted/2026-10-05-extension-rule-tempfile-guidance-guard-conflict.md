# 採用済み成果物: extension rule の一時ファイル指示文言と workspace 外書込み guard 契約の競合解消

## 観測内容

Case 3484 の case-open 実行（2026-10-05）で、extension rule の GitHub 書込み前推敲（yomiyasu-application-before-write）が lint 用「検査専用本文ファイル」の作成場所を「非永続領域〔一時ディレクトリ等のリポジトリ外〕」と指示した。write ツールによる `C:\WINDOWS\TEMP\opencode` への書込みは workspace 外書込み guard により fail-closed でブロックされ、実行側は bash ツール経由 heredoc で場当たり的に迂回した。guard 契約の正規配置（worktree-operations.md「退避ファイルの統一配置（.agentdev/tmp/）」・case-open scripts README「検査入力 JSON の置き場所指針」の workspace 外 temp 禁止・project root 内限定）と extension rule の指示文言が不一致のまま残る。

## 影響

- extension rule 適用工程で毎回 guard ブロックが発生し、迂回手段の選択（bash heredoc、node writeFileSync 等）が場当たり的になる
- 「別 API 経路による迂回の不採用」契約（worktree-operations.md）との緊張が、guard の fail-closed 実効性を弱める
- adversarial-review による横断実測: 同一文言が **7つの extension yaml** に存在（case-open:30, case-close:37, case-ready:19, case-auto:37, case-run:23, case-revise:23, issue:11）。影響範囲は1ファイルではなく7ファイル

## 課題（統合先・現行状態の明記）

1. 7 extension yaml の「非永続領域〔一時ディレクトリ等のリポジトリ外〕」文言を、guard 契約の正規配置（project root 内の実行時作業領域 .agentdev/tmp/ 等）へ整合させる
2. worktree-operations.md L289 の統一配置契約は字義上「worktree 内で checker・検証コマンドを実行する際の退避ファイル」に限定されており、lint 用検査専用本文ファイルを契約対象に含めるかの範囲拡張判断を伴う（文言修正と合わせて明示するか）
3. scripts README「検査入力 JSON の置き場所指針」（具体候補 .agentdev/integrity/reports/）と worktree-operations.md（.agentdev/tmp/）の具体パス差の整理

統合視点: 本 item は「一時・退避先の配置規律」ファミリー（temp 残骸削除基準・textlint vendor 退避証跡運用と同根）であり、backlog-review で同根バンドルの検討を推奨（個別 RU 化より統合された規律整備が自然）。

## 既存要件との関連

- worktree-operations.md「退避ファイルの統一配置（.agentdev/tmp/）」「workspace 外書込みのブロック事例と切替（fail-closed 維持）」
- case-open scripts README「検査入力 JSON の置き場所指針」
- write ツール guard 契約（workspace 外書込みの fail-closed ブロック）
- extension rule 実行契約（.agentdev/extensions/skills/*.yaml）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-05-extension-rule-tempfile-guidance-guard-conflict.md`（分類採用により削除済み）
- Issue 3484 case-open 実行（Root Case 本文候補・PR 本文の書込み前 lint）
- write ツール guard ブロック事象（write targets a path outside the project root; blocked per fail-closed）
- adversarial-review Stream B 横断実測（7 yaml 文言存在、2026-10-07）
