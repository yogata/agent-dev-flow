# 運用スクリプト3本の #Requires が comment-based help 解析を阻害

## 観測内容

`scripts/install-consumer-opencode.ps1`、`scripts/check-consumer-opencode.ps1`、`scripts/sync-self-opencode.ps1` の3スクリプト先頭にある `#Requires -Version 7.0` が PowerShell の comment-based help 解析を阻害している。
`Get-Help <script>.ps1 -Detailed` を実行しても `.DESCRIPTION` や `.PARAMETER` が表示されず、Synopsis と Syntax のみが表示される。
`#Requires`（RequiresStatement）がスクリプト本文先頭のコメントブロック直前位置を専有するため、comment-based help が認識されない。
`#Requires` 行を除去したテンポラリコピーでは `.DESCRIPTION`/`.PARAMETER` が正常に表示されることを TS-003/TS-004 検証時確認済みである。

## 影響

運用者は `Get-Help` で `.DESCRIPTION`（dry-run/check/apply の3モード優先表示）を始めとするヘルプ本文を見ることができず、Issue #1922 で追加した REQ-009-042 のヘルプ表示改善が原本スクリプトでは機能しない。
PR #1923 では原本の `#Requires` を維持（原本品質保持、スコープ外）したため、実運用では改善が残る。
優先度は中。ユーザー運用利便性の直接低下。

## 課題

原本3スクリプトの `#Requires` 配置を修正する。
選択肢は下記のいずれか。
- `#Requires` を comment-based help の下（関数定義や本体の直前）へ配置し、comment-based help をスクリプト先頭に置く
- `.externalhelp` 宣言 + XML ベースヘルプ（MAML）へ移行し、comment-based help 解析に依存しない構成にする

別途 case-update または follow-up Issue で原本3スクリプトを修正する。

## 既存要件との関連

- 対象: `scripts/install-consumer-opencode.ps1`、`scripts/check-consumer-opencode.ps1`、`scripts/sync-self-opencode.ps1`
- SPEC: `docs/specs/local/install-script-usability.md`（draft、ヘルプ表示セクション）
- REQ: REQ-009-042（ヘルプ表示）
- Issue: #1922
- PR: #1923（squash merge 35ee8097）

## 出典

- inbox 元ファイル: `intake-2026-08-02-install-scripts-requires-vs-comment-based-help.md`
- 発生日: 2026-08-02
- PR: #1923（Issue #1922）
