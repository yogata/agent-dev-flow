# sister-Issue 実装分散パターン（incident 由来の verify/impl 分割）

## 観測内容

Issue #1533（本文崩壊 incident）を起点とし、単一 RU（RU-20260718-01）から派生した姉妹 Issue #1537（verify + AG-007 修復担当）と #1538（実装担当）が並立した。実装は PR #1539（Refs #1538）に集約され main 反映済み。PR #1600（#1537 側）は空コミットの verify-only PR として #1538 側実装の完了確認と AG-007 修復を担う構成となった。

このパターンの特徴:

- 同一 incident 由来で verify Issue と impl Issue が姉妹関係になる。
- impl Issue 側の PR が先にマージされ、verify Issue 側は空コミット PR でクローズする。
- 完了条件の評価スコープ（QG-4 観点8）が PR 対象範囲ではなく「全体（リポジトリ現在状態）」になるため、case-close は実装 PR（本件では #1539）の diff を横断参照する必要がある。
- verify-only PR では targeted docs guard が `files_checked: []` となり、正当理由の明示（verify-only であること、実装 PR が別途監査済みであること）が必須になる。

verify-only PR は PR #1591, #1600 と既に2件発生しており、継続的に発生し得るパターンである。

## 影響

verify-only PR における targeted docs guard の `files_checked: []` 時の正当理由記述が毎回 case-close 担当者に委ねられており、判断根拠が属人化している。完了条件の評価スコープ（全体 vs PR 範囲）の判断も暗黙に case-close の QG-4 観点8 に委ねられている。

## 課題

verify-only PR で `files_checked: []` となる際の正当理由を構造化し、case-close 担当者の属人判断を減らす必要がある。姉妹 Issue 構成（incident 由来の verify + impl 分割）を起票時に明示できる仕組みの要否も検討対象である。

## 既存要件・仕様との関連

- QG-4 観点8（`qg-4-final-acceptance.md`「PR 対象範囲 vs 全体 判定マトリクス」）: 評価スコープ判断の現行根拠。
- case-close targeted docs guard: `files_checked` 空時の確認手順の現状（標準化されていない）。

## 対応方針の方向性

1. case-open / req-define での姉妹 Issue 構成の明示支援: incident 由来で verify + impl を分割する場合、起票時に「姉妹 Issue」「評価スコープ: 全体（PR 範囲外参照）」属性を明示できる仕組み。
2. case-close targeted docs guard の verify-only PR 正当理由チェックの正規化: PR 本文または完了条件に「verify-only」「実装 PR: #N（マージ済み・監査済み）」を明示するフォーマットを `agentdev-workflow-templates` の pr_desc.md に追加。推奨候補（反復性あり）。
3. 見送り: 姉妹 Issue 構成は例外的運用（incident 由来の一次性パターン）とし、現状の case-close QG-4 観点8 暗黙判断で十分と判断する。
