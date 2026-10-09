# case-open extension rule の検査専用本文ファイル先（リポジトリ外一時ディレクトリ）が workspace 外書込み guard で fail-closed ブロックされる

## 内容

agentdev-workflow-case-open の project extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`）の yomiyasu-application-before-write rule は、yomiyasu lint の検査専用本文ファイルを「非永続領域〔一時ディレクトリ等のリポジトリ外〕に新規作成」するよう指示する。一方、agentdev-textlint-guard の workspace 外書込み guard は project root 外への write を fail-closed で拒否する（`C:\WINDOWS\TEMP\opencode` への write 実行が「write targets a path outside the project root; blocked per fail-closed」でブロックされることを Case #3575 で実測）。規律上、guard の解除・迂回は禁止され標準手段への切替が必要なため、指示どおりの経路では検査専用ファイルの作成が構造的に成立しない。

## 影響

extension rule に従う workflow（case-open STEP-2 の GitHub 文章推敲、docs 編集前の lint 実行）が、指示どおりの経路では検査専用ファイルを作成できず、実行ごとに project root 内の代替領域（`.agentdev/integrity/reports/` 等の git 管理対象外領域）への切替判断を要求する。切替先は scripts README の一時ファイル方針（workspace 外 temp 禁止）と整合するが、extension rule 側の文言との不整合が毎回の解釈労力と迂回判断を生む。

## 提案

extension rule（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` の yomiyasu-application-before-write）の検査専用本文ファイル先の文言を「project root 内の実行時作業領域（git 管理対象外。例: `.agentdev/integrity/reports/`）」へ改訂する。agentdev-workflow-case-open scripts README「検査入力 JSON の置き場所指針」の workspace 外 temp 禁止方針との整合も併せて確認する。

## 根拠

Case #3575 case-open STEP-2 での write 実行の fail-closed 拒否実測（agentdev-textlint-guard guard ブロック）。`src/common/skills/agentdev-workflow-case-open/scripts/README.md`「検査入力 JSON の置き場所指針」（workspace 外 temp 禁止・project root 内限定・commit 対象外・検査後削除）。

https://github.com/yogata/agent-dev-flow/issues/3575
