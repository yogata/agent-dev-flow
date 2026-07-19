# Intake Item: sister-Issue 実装分散パターン（incident 由来の verify/impl 分割）

## メタデータ

- PR: #1600 (Issue #1537 / AG-007, bugfix・verify-only)
- 発生 phase: case-close capture 回収 (Step 10)
- capture 種別: intake（姉妹 Issue 構成の運用観察）
- 入力源: PR #1600 本文 `## Findings / Capture候補` > `### 実装分散の記録（参考・今後報告用）`

## 内容

Issue #1533 本文崩壊 incident を起点とし、単一 RU（RU-20260718-01）から派生した姉妹 Issue #1537（verify + AG-007 修復担当）と #1538（実装担当）が並立した。実装は PR #1539（Refs #1538）に集約され main 反映済み。PR #1600（#1537 側）は空コミットの verify-only PR として #1538 側実装の完了確認と AG-007 修復を担う構成となった。

このパターンの特徴:

- 同一 incident 由来で verify Issue と impl Issue が姉妹関係になる
- impl Issue 側の PR が先にマージされ、verify Issue 側は空コミット PR でクローズする
- 完了条件の評価スコープ（QG-4 観点8）が PR 対象範囲ではなく「全体（リポジトリ現在状態）」になるため、case-close は実装 PR（本件では #1539）の diff を横断参照する必要がある
- verify-only PR では targeted docs guard が `files_checked: []` となり、正当理由の明示（verify-only であること、実装 PR が別途監査済みであること）が必須になる

## 改善対象

以下のいずれかを後続 case で検討（user 確認が必要）:

1. **case-open / req-define での姉妹 Issue 構成の明示支援**: incident 由来で verify + impl を分割する場合、起票時に「姉妹 Issue」「評価スコープ: 全体（PR 範囲外参照）」属性を明示できる仕組み。現在は暗黙に case-close の QG-4 観点8 判断に委ねられている。
2. **case-close targeted docs guard の verify-only PR 正当理由チェックの正規化**: PR 本文または完了条件に「verify-only」「実装 PR: #N（マージ済み・監査済み）」を明示するフォーマットを `agentdev-workflow-templates` の pr_desc.md に追加し、`files_checked: []` 警告時の判断根拠を構造化する。
3. **見送り**: 姉妹 Issue 構成は例外的運用（incident 由来の一次性パターン）とし、現状の case-close QG-4 観点8 暗黙判断で十分と判断する。

候補: (2)。verify-only PR は PR #1591, #1600 と既に 2 件発生しており、継続的に発生し得るパターン。targeted docs guard の `files_checked: []` 時の正当理由記述方法が毎回 case-close 担当者に委ねられているため、pr_desc.md の標準セクションで正規化する価値がある。

対象範囲（候補 (2) 採用時）:

- `src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md`（新規セクション「verify-only PR メタ」追加）
- `docs/specs/skills/agentdev-workflow-templates.md`（新規セクション記述）
- `src/opencode/commands/agentdev/case-close.md`（targeted docs guard の files_checked 空時の手順に verify-only PR メタ参照を追記）

route は req-define に相当する理由: command 定義 / template 構造 / SPEC 文面の更新であり、意味境界の改訂を含むため。req-define で要件を整理してから req-save / spec-save / case-open へ進む流れを想定。

昇格判断: intake-promote で採否判断。req-define への引き継ぎを前提とするため、本 item を起点に新規 REQ を起票したり SPEC を改訂したりしない。

## 関連

- PR: #1600, #1591（先行する verify-only PR 事例）
- Issue: #1537（verify 側・本 Issue）, #1538（impl 側・姉妹 Issue）
- 起点 incident: #1533（本文崩壊）
- 起点 RU: RU-20260718-01
- 実装 PR: #1539（Refs #1538）
- 参照 SPEC: QG-4 観点8（`qg-4-final-acceptance.md`「PR 対象範囲 vs 全体 判定マトリクス」）
- 参照 command SPEC: case-close（targeted docs guard, files_checked 空時の確認）
- タグ: `#verify-only-pr` `#sister-issue` `#incident-driven` `#case-close` `#qg-4` `#targeted-docs-guard`
