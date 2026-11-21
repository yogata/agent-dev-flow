---
id: learn-20261121-test-local-parser-reimplementation-frozen-risk
created_at: 2026-11-21
source: case-run capture (PR #4174・Wave-2 #4170・Root Case #4167)
status: inbox
---

# テスト側のローカルパーサ再実装は解析契約変更に追随できず producer 側への一本化が構造リスクを解消する

- 問題事象: tim_declarations_contract.test.ts が TIM 契約検知のため宣言パーサ（正規表現）をローカル再実装していた。テスト側のローカル再実装は producer 側の解析契約変更に追随できず、契約変更時にテストだけが沈黙または誤検知する構造リスクがあった
- 発生局面: case-run（PR #4174・Wave-2 #4170）REQ-123-002 の tim 圧縮（28 → 5 ケース・22,165 → 4,443 バイト）
- 検知方法: tim 圧縮時の検知対象の再確認。TIM 契約が壊れたことだけを検知する最小構成への縮小に伴い、静的宣言ピン検証の重複とローカルパーサ再実装を削除対象として特定
- 根本原因: テストが producer の解析を別実装で再検証すると、2 つの実装が乖離したときにどちらが正かを判定する手段がなくなる。テストの検知対象は「TIM 契約の破壊」であり「パーサの再実装」ではない
- 自律対応内容: ローカル再実装パーサを廃止し producer 側 parseDeclarations へ一本化した（check と同一の解析契約を使用）。TIM 契約検知に必須の 5 ケースのみを残した
- ユーザー確認有無: なし（実行担当の裁量・監督承認 2026-11-21・テスト代表ケース選定の記録は PR 本文に記録済み）
- 横展開観点: テストが検知すべきは契約の破壊であり、解析ロジックの複製はリスクである。「検知に必須の最小ケース」を残し重複検証は producer の正規解析へ依存する構成が、解析契約を持つ producer・consumer 構造全般に適用できる
- 再発条件: テストが producer の解析・判定ロジックを正規表現・独自実装で再現して pin 検証する場合
- 予防策候補: (a) テスト側での解析ロジック再実装を禁止し producer の正規解析関数を import して使う規約、(b) 試験統合時にローカル再実装の有無を統合判定の観点に含める
- 想定反映先: agentdev-traceability（TIM 契約検知の維持方針）、repo-agentdev-integrity（試験統合・代表ケース選定の観点）
- 関連: Case #4170、PR #4174（Findings に記録済み・本 entry は case-close Capture 回収分）、REQ-123-002
- タグ: テスト設計、producer・consumer 契約、パーサ一本化、構造リスク
