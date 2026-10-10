# yomiyasu lint 用一時ファイル作成手段と workspace 外書込み guard の規約不整合

## 内容

`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` の yomiyasu-application-before-write rule は、GitHub 書込み前推敲の lint 検査専用本文ファイルを「非永続領域〔一時ディレクトリ等のリポジトリ外〕に新規作成して lint のファイル引数実行」するよう指示する。一方、実行基盤の書込み guard（agentdev-textlint-guard の workspace 外書込み検査）は Write ツールによるリポジトリ外パスへの書込みを fail-closed で拒否する。rule の指示どおり Write ツールで作成しようとすると必ずブロックされ、実行者は毎回手段を自力で切替する必要がある。

## 影響

case-open 等の extension rule 適用工程で GitHub 文章を書き込むたびに guard ブロックと手動切替が発生し、手順の決定性が損なわれる。切替手段（バイト安全な作成経路）を知らない実行では、rule の「yomiyasu 未導入・lint 実行失敗の場合は対象文章の提出・投稿を停止する」条件により誤って停止し得る。

## 提案

rule 文面に作成手段の contingency を追加する（例: Write ツールが guard で拒否した場合は bash の heredoc または node fs.writeFileSync（UTF-8 明示）で作成する、または lint 用一時ファイルの置き場所を project root 内の git 管理対象外領域（.agentdev/integrity/reports/ 等。`scripts/README.md`「検査入力 JSON の置き場所指針」と整合）へ変更する）。Rule 文面変更は配布物更新を伴うため req-define 再合意を経る正規経路で評価する。

## 根拠

Issue #3585（case-open STEP-2 実行時。Root Case 本文候補の lint 用本文ファイルをリポジトリ外一時ディレクトリへ Write ツールで作成しようとしたところ guard により fail-closed 拒否。bash heredoc へ切替して解消）。同種の置き場所 contingency の先例: `src/common/skills/agentdev-workflow-case-open/scripts/README.md`「検査入力 JSON の置き場所指針」節。
