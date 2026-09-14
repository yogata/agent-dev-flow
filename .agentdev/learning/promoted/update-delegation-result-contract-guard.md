# 委譲結果受領の契約完了検査（4-state result・commit hash・PR URL の3点ゲートと消失時回復）

## 背景

case-run は実装作業を実行担当サブエージェントへ委譲し、result 4状態契約（completed-pr / blocked / failed / delegation-unavailable）で結果を受領する設計である。case 2796/2799/2800（2026-09-14）と case 2805 OU-006（PR #2819、2026-09-15）で、委譲の起動・応答が契約どおり受領保証されない事象（background 起動の無通知消失、委譲先が要約のみで応答し commit・PR・4状態結果を返さない）が発生し、Case の実行・完了が停滞した。

## 問題

1. run_in_background=true の委譲起動が起動直後に消失しても、harness からは通知されず、実行未試行（worktree クリーン・PR なし・SSoT コメントなし）と実行中断の区別が自動では付かない。
2. 委譲先が実装・検証の要約を返しても、契約上必要な commit・PR 作成と4状態結果を返さないことがあり、受領側が完了検査を行わないと adapter contract の完了判定が未達のまま後続工程へ進めない。
3. 受領側（case-run / case-auto）に、委譲結果の最終ゲートとして commit hash・PR URL・4-state result の3点を必須検査する guard、および background 委譲消失時に durable state で帰属確認し未試行なら同期実行で再委譲する回復手順が明文化されていない。

## 望ましい変更

- 委譲結果受領時の最終ゲートとして、commit hash・PR URL・4-state result の3点を必須検査し、不足時は「要約で終了」と扱わず再開（再委譲または継続指示）する guard を受領側手順へ明文化する。
- background 委譲の消失を検知した場合の回復手順を明文化する: durable state（worktree git status・PR 存在・Issue コメント）で帰属を確認し、実行未試行と判定した場合は同期実行（run_in_background=false）で再委譲する。

## 対象範囲

### 対象

- case-run の委譲結果受領・fan-in での result 検証手順
- case-run execution adapter の result 受領検査
- case-auto の停止理由分類における委譲未達検知

### 対象外

- result 4状態契約の状態定義そのもの（completed-pr / blocked / failed / delegation-unavailable の意味は変更しない）
- harness 側 background task 機構の修正（ADF 配布物の管轄外）
- 委譲先サブエージェントのプロンプト規約全般（作業衛生は別学び E-07/E-19 として deferred で管理）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | .opencode/skills/agentdev-case-run-execution-adapter/SKILL.md | result 受領時の3点検査（4-state result・commit hash・PR URL）guard と background 消失時の durable state 帰属確認・同期再委譲の回復手順 |
| 配布skill | .opencode/skills/agentdev-workflow-case-run/（fan-in・result 検証） | 委譲応答の完了判定に3点検査を組み込む情報候補 |
| Design | docs/designs/workflows/delegation-contracts.md | 委譲時最小契約の output_contract に受領側検査の情報候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（guardrail insufficiency）
- **該当ファイル**: .opencode/skills/agentdev-case-run-execution-adapter/SKILL.md（result 4状態契約・PR URL 受領・task() 起動失敗時フォールバック）、docs/designs/workflows/workflow-contracts.md（result 4状態契約）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: result 4状態・PR URL 受領は既存だが、(a) 委譲応答が4状態を返さず要約で終了する失敗模式を検出する受領側の3点検査 guard、(b) background 起動消失時の durable state 帰属確認と同期実行での再委譲という回復手順は未整備。

## 制約

- result 4状態契約に第5の状態を追加しない（既存契約の意味を変更しない）。
- harness 側機構（background task の起動保証）を前提とした変更にしない。受領側の検査・回復手順の追加に限定する。
- 同期実行への切替は、並列実行の効率化を損なわない範囲で消失検知時のフォールバックとする（常時同期化はしない）。

## 受け入れ条件

- [ ] 委譲応答の受領時に commit hash・PR URL・4-state result の3点検査が手順化され、不足時は要約で完結扱いにしないことが明記される
- [ ] background 委譲消失時の durable state 帰属確認（worktree git status・PR・Issue コメント）と、実行未試行時の同期実行による再委譲手順が文書化される
- [ ] 本手順により、委譲未達の未検知による case-run / case-close の停滞が防止できる

## 元learning item / 根拠

- **要約**: 委譲の起動・応答は契約どおり受領保証されないことがあり、受領側の完了検査（3点ゲート）と durable state による帰属確認・同期再委譲の回復手順が必要である。
- **根拠**:
  - case 2796/2799/2800（case-run 実行 DEL-{N}-1/-2、case-close 2026-09-14 回収）: run_in_background=true の委譲起動が2回連続で起動直後に消失（worktree クリーン・PR なし・SSoT コメントなしで実行未試行と判定）。harness 側 background task 機構の異常。同期実行（run_in_background=false）への切替で確実に result を受領。background 委譲の消失を検知したら durable state で帰属確認し、未試行なら同期実行で再委譲する回復手順が有効。
  - case 2805 OU-006（PR #2819、DEL-2811-1、case-close 2026-09-15 回収）: 初回 delegation turn は実装・検証の要約を返したが commit と PR を作成せず、4状態結果も返さなかった。adapter contract の完了判定が未達のまま後続工程へ進めず、再開セッションで残りの検証・10コミット・PR 作成まで完了した。delegated task の最終ゲートとして commit hash・PR URL・4-state result の3点必須検査と、不足時の再開 guard が有効。
- **再発条件**: run_in_background=true の委譲起動で harness 側の起動異常が発生する場合、委譲先が result 契約を守らず要約で応答を終える場合、受領側で3点検査を行わない場合。
- **横展開可能性**: サブエージェント委譲を実行する case-run / case-auto 全般（中。委譲を利用するすべてのワークフロー）。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: workflow, robustness
- **関連Issue**: Issue #2811（OU-006、PR #2819 / PR #2820 関連）
