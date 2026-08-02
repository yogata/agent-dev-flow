# intake: ユーザー運用スクリプト3本の #Requires -Version 7.0 が comment-based help の Get-Help 解析を阻害

## 発生日

2026-08-02

## 発生元

- Issue: #1922 (ユーザー運用スクリプト install/check/sync-self の使い勝手改善)
- PR: #1923
- 取得元: PR #1923 本文「## Findings / Capture候補」セクション

## 問題事象

`scripts/install-consumer-opencode.ps1`、`scripts/check-consumer-opencode.ps1`、`scripts/sync-self-opencode.ps1` の3スクリプト先頭にある `#Requires -Version 7.0` が PowerShell の comment-based help 解析を阻害する。`Get-Help <script>.ps1 -Detailed` を実行しても `.DESCRIPTION` や `.PARAMETER` が表示されず、Synopsis と Syntax のみが表示される。`#Requires` 行を除去したテンポラリコピーでは `.DESCRIPTION`/`.PARAMETER` が正常に表示されることを確認済み（TS-003/TS-004 検証時）。

PowerShell では comment-based help はスクリプト本文の先頭のコメントブロックとして解釈される規則があるが、`#Requires`（RequiresStatement）がその直前位置を専有するため認識されない。

## 影響

- 運用者は `Get-Help` で `.DESCRIPTION`（dry-run/check/apply の3モード優先表示）を始めとするヘルプ本文を見ることができず、本Issueで追加した REQ-009-042 のヘルプ表示改善が原本スクリプトでは機能しない。
- 今回の変更では原本の `#Requires` を維持（原本品質保持、スコープ外）。スコアカードは `#Requires` を外したテンポラリコピーで検証、原本は保持した。
- 実運用では `Get-Help` で表示されない改善が残る。

## 発生局面

実装（TS-003/TS-004 検証時）

## 検知方法

TS-003（ヘルプ表示検証）、TS-004（オプション注記検証）の実行過程で、原本スクリプトで `Get-Help -Detailed` を実行した際に `.DESCRIPTION` が表示されないことから発見。`#Requires` を除去したテンポラリコピーで表示されることを確認し、原因を `#Requires` の干渉と特定。

## 想定される対応方向

- `#Requires` を comment-based help の下（関数定義や本体の直前）へ配置し、comment-based help をスクリプト先頭に置く。
- または `.externalhelp` 宣言 + XML ベースヘルプ（MAML）へ移行し、comment-based help 解析に依存しない構成にする。
- 別途 case-update または follow-up Issue で原本3スクリプトを修正する。

## 関連

- Issue: #1922 (REQ-009-042 ヘルプ表示)
- PR: #1923 (squash merge 35ee8097)
- 対象ファイル: `scripts/install-consumer-opencode.ps1`、`scripts/check-consumer-opencode.ps1`、`scripts/sync-self-opencode.ps1`（先頭 `#Requires -Version 7.0`）
- SPEC: `docs/specs/local/install-script-usability.md`（draft、ヘルプ表示セクション）

## 出典引用

PR #1923 本文「## Findings / Capture候補」intake セクションより:

> 原本の `#Requires -Version 7.0` が comment-based help の `Get-Help` 認識を妨害する。3スクリプトの先頭にある `#Requires -Version 7.0` が PowerShell の comment-based help 解析を阻害し、`Get-Help <script>.ps1 -Detailed` で `.DESCRIPTION` や `.PARAMETER` が表示されない（Synopsis と Syntax のみ表示）。`#Requires` 行を除去したテンポラリコピーでは正常に表示されることを確認済み。PowerShell の仕様で、comment-based help はスクリプト本文の最初のコメントブロックとして解釈される規則があるが、`#Requires`（RequiresStatement）がその位置を専有するため認識されないと推察。

## タグ

#intake #install-scripts #requires-statement #comment-based-help #req-009-042 #get-help