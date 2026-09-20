# 境界 close の AUTOGEN drift 再生成処置における再生成不能局面（直接 commit 禁止）の扱い明文化

## 背景

第16段 RC fixes（Case #3042）の case-close で、実装 PR 3 件（#3047/#3048/#3049）squash merge 後の main HEAD @44cbd1b4 最終検査で、check_integrity IR-061（計測日 current=2026-09-20 / expected=2026-09-21）と check_autogen_freshness 違反 1 件を観測した（予測 NG 52 に対し実測 53・+1 = drift）。#3047 の generate_indexes 実行時刻（JST 2026-09-20）と squash merge の committer date（JST 2026-09-21 00:11・日付跨ぎ）の間で計測日が 1 日ずれた（機構3: committer date 置換 + 機構1: date rollover の複合）。学びの蓄積元は case-close の learning capture（commit cc5fcf25）。

## 問題

autogen-freshness-gate Design「計測日driftの発生機構」節と配布 reference（docs-and-design-promotion.md「AUTOGEN 鮮度 gate（境界 close 時の再検査）」節）に正典化された処置「drift 検出時は generate_indexes で再生成してから green 判定する。drift 検出を放置したまま green 扱いにしない」は、境界が main 直接 commit を禁止する局面（tag 作成を直前に控えた RC 境界等）では実行できない。drift 検出時の再生成は main への新規 commit を伴うため、正典化された規定と直接 commit 禁止の運用が競合するにもかかわらず、この境界ケースの扱いが Design・配布 reference のいずれにも規定されていない。第16段では再生成を見送り、drift の増減内訳（@c8d33c8e 56 → #3047 −1 IR-061 旧・−2 broken-file-link → #3048 −1 workflow-status-prohibition → コンテンツ上 52〔予測と一致〕→ +1 rollover drift = 53）を完全特定して warn 判定として対応記録コメントに記録する対応を採ったが、この扱いは規則化されていない。

## 望ましい変更

autogen-freshness-gate Design「計測日driftの発生機構」節の処置に、再生成不能局面の扱いを補遺する。(1) 再生成不能局面（main 直接 commit 禁止・tag 対象ツリー不変の維持が優先される境界）では、drift を時間依存の測定誤差として増減内訳記録付きの warn 扱いとすること (2) 再生成の正規経路は case-run 成果物 commit（または fan-in 時の再生成 commit）として実施し、境界 close 自身が索引を直接編集・commit しない契約を維持すること（第17段実践・CR-002 正当化の前例を規則化）(3) tag 実施側への引継ぎとして、次回 docs commit の generate_indexes で解消することを対応記録に明記すること。あわせて境界 close の merge 実行を AUTOGEN 再生成と同一日内に完了させる運用上の注意を配布 reference に追記する。

## 対象範囲

### 対象

- docs/designs/integrity/autogen-freshness-gate.md「計測日driftの発生機構」節（処置の補遺）
- src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md「AUTOGEN 鮮度 gate（境界 close 時の再検査）」節（再生成不能局面の扱い・引継ぎ記録）

### 対象外

- check_autogen_freshness.ts・generate_indexes.ts の実装と gate の停止条件・exit 契約（不変）
- 計測日導出基準（committer date）の切替、merge commit 除外（Design が既に「将来の評価対象」として記録済み）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/integrity/autogen-freshness-gate.md | 「計測日driftの発生機構」節へ再生成不能局面（直接 commit 禁止）での増減内訳記録付き warn 扱いと再生成の正規経路（case-run 成果物 commit）を補遺 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md | 「AUTOGEN 鮮度 gate（境界 close 時の再検査）」節へ再生成不能局面の判定材料（再生成処置の実行可否を green 判定の前提に含める）と tag 実施側への引継ぎ記録を追記 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: docs/designs/integrity/autogen-freshness-gate.md（drift 機構 3 種・再生成による green 判定、PR #3043 で正典化）、src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md（gate 手順、PR #3049 で反映）、過去採用済み成果物 measure-update-autogen-measure-date-committer-drift（第16段正典化の直接由来。制約節で再生成は case-run 側または fan-in 時の正規経路と明記）
- **ギャップ分類**: fix gap（正典化された処置の適用境界の欠落）
- **ギャップ詳細**: Design drift 節・docs-and-design-promotion.md gate 節の本文とも、再生成不能局面（main 直接 commit 禁止・tag 直前境界）での扱い（warn 判定・増減内訳記録・tag 実施側への引継ぎ）が不在（本文確認済み）。過去成果物の制約節は正規経路を示すが warn 扱いの判定規則を持たない

## 制約

- AUTOGEN 鮮度 gate の検出仕様・停止条件・exit 契約は不変。運用上の境界ケースの扱いの明文化が主体
- 再生成の実行置き場所として main 直接 commit は許可しない（case-run 成果物 commit・fan-in 時再生成の正規経路を維持）
- warn 扱いは drift の増減内訳が完全特定され（両方向差分で内容変更 0・計測日行のみの反転）、当該 Case の変更対象外と判定された場合に限定する

## 受け入れ条件

- [ ] autogen-freshness-gate Design の drift 節に、再生成不能局面（直接 commit 禁止）での増減内訳記録付き warn 扱いが規定されていること
- [ ] 再生成の正規経路（case-run 成果物 commit または fan-in 時の再生成）と、tag 実施側への引継ぎ（次回 docs commit の generate_indexes で解消）の記録が参照可能であること
- [ ] docs-and-design-promotion.md の gate 節に、freshness green 判定の前提として再生成処置の実行可否判定が含まれていること

## 元learning item / 根拠

- **要約**: 境界 close の drift 検出時再生成規定（generate_indexes で再生成してから green 判定）が、main 直接 commit を禁止する境界（tag 直前の RC 境界等）では実行できないという運用ギャップが未規定
- **根拠**: Case #3042 case-close（main HEAD @44cbd1b4 で IR-061 計測日 drift と freshness 違反 1 件、予測 52 に対し実測 53）。再生成を見送り増減内訳を完全特定して warn 判定（tag 対象ツリーを不変に維持）。learning capture commit cc5fcf25。第17段で case-run 成果物 commit としての再生成（監査レポートと同一 commit の generate_indexes 再生・046fc2e7）が実践され CR-002 で正当化の前例成立
- **再発条件**: squash merge を伴う境界 close が、最終実装 PR の AUTOGEN 再生成実行日とは異なる日付（local TZ・とくに深夜 0 時跨ぎ）で完了する場合
- **横展開可能性**: squash merge を経る境界 close 全般。計測日を含む AUTOGEN ブロックの鮮度検査を日付を跨いで実行する工程（case-close・docs-check）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, integrity
- **関連Issue**: #3042、PR #3047（merge 6967bdc0）、#3048、#3049
