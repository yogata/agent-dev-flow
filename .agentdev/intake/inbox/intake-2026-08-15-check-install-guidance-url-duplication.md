# intake: check/install スクリプトでチェックアウト未検出時の案内文言と既定 URL 定数が重複実装

## 発生日

2026-08-15

## 発生元

- Issue: 2129（OU-002）
- 取得元: PR 2133 本文 `## Findings / Capture候補` intake 節（case-run 実装時に観察。.agentdev/ への書き込み禁止により intake item として未保存→case-close で回収）

## 問題事象

`scripts/check-consumer-opencode.ps1` と `scripts/install-consumer-opencode.ps1` の両方が、チェックアウト未検出時の案内文言（clone コマンド例とソース ZIP 取得手順）と既定リポジトリ URL 定数を個別に保持している。OU-002 の実装で check 側の案内を新前提（チェックアウト済み・provisioning 2 形態）へ更新した際、install 側（OU-001 対象）との間で文言・定数の二重管理が明確になった。

## 影響

- 案内文言や既定 URL の変更時に両スクリプトの個別更新が必要で、片方だけ更新されるリスクがある
- provisioning 前提の変更（OU-001、OU-003 で install 側も更新予定）でずれが拡大する可能性がある

## 発生局面

実装（case-run、check スクリプトの案内更新時）

## 検知方法

両スクリプトの案内文言・URL 定数の比較（PR 2133 実装時の観察）。

## 想定される対応方向

- 案内文言テンプレートと既定 URL 定数の共有化（共通ファイル、または一方を正とする参照構成）の検討
- 共有化はスクリプト構成の変更を伴うため、OU-001（install スクリプトの provisioning 削除・チェックアウト検出）取り込み後の状態で評価するのが自然
- 対応要否・優先度は backlog-review で判断する

## 関連

- Issue: 2129（OU-002）, PR: 2133
- 対象: `scripts/check-consumer-opencode.ps1`, `scripts/install-consumer-opencode.ps1`
- 関連 OU: OU-001（install スクリプト側の変更対象）、OU-003（install スクリプトのオプション整理）
- 制約: DEC-016（導入系スクリプトの副作用ゼロ原則。共有化も provisioning・network access を行わない構成の範囲で実施する）

## 出典引用

PR 2133 本文 `## Findings / Capture候補` intake 節より:

> check スクリプトと install スクリプトでチェックアウト未検出時の案内文言・既定 URL 定数が重複実装（将来的な共有化の検討候補）

## タグ

#intake #duplication #check-script #install-script #guidance-wording #refactor-candidate
