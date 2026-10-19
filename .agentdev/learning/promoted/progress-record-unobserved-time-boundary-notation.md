# progress-record-unobserved-time-boundary-notation

## 背景

case-auto stage 3 の工程記録取りまとめ反映時、子 Issue 6 件の進行状況（開始・終了日時）を実着手・完了確定の実測なしに PR 作成時刻からの逆算で書き込み、case-run 段階（完了判定を所有しない）で終了日時を設定した。書換えも record-comments.ts の構築・検証関数を経由しない raw 正規表現置換スクリプトで行った。正規ツール復旧後に 6 件の進行状況を観測事実に基づく記録へ置換し、case-close の完了確定時に実測終了日時のみを設定して訂正した（ユーザー確認あり）。

## 問題

工程記録契約（開始日時は初回実着手の実測値のみ・終了日時は completed 確定時のみ設定）は issue-lifecycle-records.md L43 に既存するが、観測できない時刻を記録欄に埋めたい誘惑に対する規律の補助となる様式（未観測時刻を明示できる境界表現）が提供されていない。record-comments.ts の構築・検証関数には未観測時刻の境界表現（既知の上限・下限時刻の併記）の様式サポートが存在せず（adversarial-review A2 実測: 様式語「未記録」「実測」「推定」「上限」「下限」「N/A」の grep 0 件）、raw 置換で本文を書き換える経路を選択させる間接要因となった。

## 望ましい変更

未観測時刻を「記載しない」契約を維持した上で、既知の境界時刻（ブランチ作成・初回 commit・PR 作成等の観測事実）を併記する境界表現の様式を、記録構築手段（record-comments.ts）の様式サポート候補および issue-lifecycle-records.md の記録契約への補足として提案する。様式の採用にあたっては次の設計分岐（adversarial-review A2 受理）の判断を req-define が行う: (a) 日時欄の書式例外を新設する Design 契約変更、または (b) 本文記録上の補足表現に留める。いずれの場合も issue-lifecycle-records.md は docs/designs/workflows/ 配下の Design であり、その更新は backlog-review 承認経由の対象である。

## 対象範囲

### 対象

- src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts（境界表現の様式サポート候補）
- docs/designs/workflows/issue-lifecycle-records.md（未観測時刻の取扱い補足候補。Design 更新は backlog-review 承認経由）

### 対象外

- 工程記録契約（開始日時・終了日時の設定条件）自体の変更（L43 の現行契約は維持）
- raw 正規表現置換の禁止 enforcement（書換えは正規の構築・検証関数を経由する規律は既存）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| workflow scripts（候補） | src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts | 未観測時刻の境界表現の様式サポート（(a)/(b) 設計分岐の判断後に確定） |
| Design（backlog-review 承認経由） | docs/designs/workflows/issue-lifecycle-records.md | 未観測時刻の境界表現（既知の上限・下限時刻の併記）の取扱い補足 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: issue-lifecycle-records.md L43（記録契約: 終了日時は completed 確定時にのみ設定）、record-comments.ts（構築・検証関数による本文構築規律）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 未観測時刻の境界表現の様式サポート不在（record-comments.ts で様式語 grep 0 件・「境界」1 件は別文脈 L205。issue-lifecycle-records.md にも様式規定なし）。現行契約下の正解は「設定しない」であり、境界表現は様式の拡張であり契約違反の正当化ではない点に留意

## 制約

- (a) 日時欄の書式例外新設は Design 契約変更にあたる（backlog-review 承認経由）。(b) 本文記録上の補足表現に留める場合は現行契約との整合を維持する
- 様式サポートの追加は record-comments.ts の構築・検証関数を経由する本文構築規律と矛盾しないこと
- 未観測時刻の推定生成を正当化する様式にしないこと（境界時刻は観測事実のみ）

## 受け入れ条件

- [ ] (a)/(b) の設計分岐が req-define で判断され、選択された経路が issue-lifecycle-records.md（Design 承認経由）または record-comments.ts 様式サポートへ反映されていること
- [ ] 境界表現が観測事実（既知の上限・下限時刻）のみで構成されること
- [ ] 様式サポート採用時、record-comments.ts の検証関数が様式どおりの記録を検証できること

## 元learning item / 根拠

- **要約**: 工程記録の未観測時刻に対する境界表現様式の提供（逆算書込みの再発防止）
- **根拠**: 6 件の記録訂正とユーザー確認を要した実害 1 回。様式サポート不在を実測で確認。同根の計測漏れ系（deferred L4378・初手計測手順不在）とは根本原因が別（捏造 vs 欠測）として分離
- **再発条件**: 記録契約上の時刻が未観測のまま記録欄を埋める必要が生じ、推定値の生成と raw での本文書換えを選択する場合
- **横展開可能性**: 工程記録・時刻記録の運用全般（case-run/case-close の記録構築全般）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement
- **関連Issue**: なし
