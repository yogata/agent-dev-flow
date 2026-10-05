# extension rule の一時ファイル指示文言が workspace 外書込み guard と競合する

## 観測

Case 3484 の case-open 実行（2026-10-05）で、extension rule（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` の yomiyasu-application-before-write）が GitHub 書込み前推敲の lint 用「検査専用本文ファイル」の作成場所を「非永続領域〔一時ディレクトリ等のリポジトリ外〕」と指示した。write ツールによる `C:\WINDOWS\TEMP\opencode` への書込みは workspace 外書込み guard により fail-closed でブロックされた。実行側は bash ツール経由の heredoc（PowerShell cp932 再符号化の対象外）で検査専用ファイルを作成して対応したが、guard 契約の正規配置（worktree-operations.md「退避ファイルの統一配置（.agentdev/tmp/）」、case-open scripts README「検査入力 JSON の置き場所指針」の workspace 外 temp 禁止・project root 内限定）と extension rule の指示文言が不一致なまま残る。

## 今回扱わない理由

extension yaml の指示文言修正は case-open 配布物・extension 定義の変更であり、本 Case（Issue 3484、REQ 操作なし・Design append のみ）の対象範囲外であるため。

## 影響

- extension rule 適用工程で毎回 guard ブロックが発生し、実行ごとに迂回手段の選択（bash heredoc、node writeFileSync 等）が場当たり的になる
- 「別 API 経路による迂回の不採用」契約（worktree-operations.md）との緊張が、guard の fail-closed 実効性を弱める可能性がある

## レビューで決めること

- extension yaml の「リポジトリ外一時ディレクトリ」指示を「project root 内の実行時作業領域（.agentdev/tmp/ 等の gitignore 対象領域）」へ整合させるか
- 他の extension yaml・配布 reference に同種の workspace 外一時ファイル指示がないかの横断確認を併せて行うか

## 根拠

- Issue 3484 case-open 実行（Root Case 本文候補・PR 本文の書込み前 lint）
- write ツール guard ブロック事象（write targets a path outside the project root; blocked per fail-closed）
- worktree-operations.md「退避ファイルの統一配置（.agentdev/tmp/）」「workspace 外書込みのブロック事例と切替（fail-closed 維持）」
- case-open scripts README「検査入力 JSON の置き場所指針」
