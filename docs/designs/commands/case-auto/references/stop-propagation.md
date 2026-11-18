---
title: adversarial-review 由来の停止伝播
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-auto.md から参照される詳細仕様（遅延読み込み）。 -->

# adversarial-review 由来の停止伝播

## adversarial-review 由来の停止伝播（case-auto の停止伝播受領）

本節は case-auto が下位 command（case-run インライン実行、工程委譲）から adversarial-review 由来の停止信号を受領した際の停止伝播挙動を所有する（REQ-015-012）。
共通契約（REQ-014）の正規定義は重複せず、各正規所有者を参照する（REQ-014-011）。

- user-decision-required の位置づけ: [skills/agentdev-adversarial-review.md](../skills/agentdev-adversarial-review.md)（REQ-014-012。停止信号の状態遷移一般化は lifecycle-state-machine）
- parent_decision_required / decision_context 適用: [delegation-contracts.md](../workflows/delegation-contracts.md)「review 経路での parent_decision_required / decision_context 適用」節
- 再 review 条件、再 review 停止条件: adversarial-review Design（REQ-014-007）

### user-decision-required の位置づけ（REQ-014-012）

user-decision-required は case-run result enum（completed-pr / blocked / failed / delegation-unavailable）の第5状態ではなく、既存結果に付随する停止理由分類である（REQ-014-012、lifecycle-state-machine Design が正）。
case-auto は user-decision-required を新規 result 状態として扱わず、result 4状態のいずれかに付随する分類として受領する。

| 起源 | 受領形式 |
|---|---|
| case-run 起源 | result enum `blocked` に付随する停止理由として user-decision-required 分類を受領する |
| 工程委譲起源（req-define、case-open、case-close 等） | 既存 status（pass/warn/fail/partial）+ `parent_decision_required` を通じて受領する |

本節の停止理由分類は「停止理由分類（REQ-034-015/108 拡張）」節の分類軸とは独立する。
同節は case-auto 自身の HITL 境界停止条件（11項目）の分類であり、user-decision-required は下位 command の adversarial-review 由来の停止信号の分類である。
両者を混同しない。

### 停止伝播契約（REQ-015-012）

case-auto は下位 command から user-decision-required + decision_context を受領した場合、まず bounded parent decision resolution（次節。REQ-034-032〜034、DEC-008）へ入力し、以下の優先関係で処理する。

1. **限定的親判断解決の先行**: 正規契約から導出可能なもの・委譲された裁量の範囲内のものは、回答して当該下位の再開点（resume point）から再開する（REQ-034-032/033）
2. **自走停止（上位合意矛盾・新規ユーザー判断等のみ）**: 上位合意矛盾、または新規ユーザー価値判断・対象範囲変更・外部契約変更等（REQ-034-034。人間に留保された判断〔REQ-096-005〕の新規確定を要する場合）に限り、対象 execution_unit（Issue）の処理を停止し、ユーザー判断を待機する。他の ready 対象の execution_unit がある場合は継続する（部分停止、REQ-034-035/016 準拠）
3. **ユーザー提示**: decision_context（対象案、合意候補、未解決争点、推奨案と根拠、ユーザーに確定してほしい判断）をユーザーへ提示する（decision_context 構成は delegation-contracts Design が正）
4. **resume point の記録**: 停止時の resume point を記録する。resume point は lifecycle-state-machine Design に従い、case-run 起源の場合は当該 Issue の case-run 再開ポイント（準備フェーズ、実装フェーズ、提出フェーズのいずれか）、工程委譲起源の場合は当該工程の委譲起点とする
5. **resume point から再開**: ユーザー判断の解決後、resume point から処理を再開する。
adversarial-review の再発動要否は adversarial-review Design「再 review 条件」「再 review 停止条件」の各節に従い（REQ-014-007）、case-auto は独自に判断しない。
adversarial-review 自体を恒久的な統制ゲートとしない（REQ-014-009）

### case-auto が行わないこと（REQ-015-012）

case-auto は停止伝播において以下を行わない。
これらは下位 command（case-run の場合は adapter 委譲内、工程委譲の場合は当該工程）の責務であり、case-auto は伝播と再開のみを担う。

- **review 直接起動**: adversarial-review を直接起動しない（review 挿入境界は各 command Design が所有、REQ-015-001）
- **finding 解釈**: adversarial-review の finding を意味解釈しない（finding の意味解釈は review 呼出元である下位 command の責務）
- **採否**: finding の採用・不採用を決定しない（accepted finding の反映は review 呼出元の責務、REQ-014-006）
- **再評価**: review 対象の再評価を行わない（再 review 条件の判定は adversarial-review Design、REQ-014-007）

case-auto は停止伝播受領において純粋な伝播経路として機能し、adversarial-review の意味的処理には関与しない。
