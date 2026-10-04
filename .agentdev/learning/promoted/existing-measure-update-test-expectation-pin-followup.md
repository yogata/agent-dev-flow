# pin 型・anchor 型テスト期待値の変更追随観点の拡充

## 背景

配布物の文言・構造・パス・型を pin するテスト（integrity suite・scripts/self・anchor テスト）が、当該データの変更と同一変更単位で更新されない追随漏れが4件で観測された。前回 promote 指摘（テスト期待値同期漏れ）の継続系統で、変種（pin 型テスト群・anchor テスト・型不整合）が加わった。

## 問題

(1) 破壊的構造様式変更で旧契約期待値テスト 44 件が fail した（3点セット指針が pin 型テスト群を明示対象に含まない）。(2) `src/opencode-local/` 削除にテスト側期待が追随せず 3fail+1error が残存した。(3) references の意味的追記で anchor テスト（docs 文言期待）が fail した（事前 grep で回避可能）。(4) 型定義変更（union 削除）にテストが追随せず、bun test は pass するが tsc --noEmit で error が残存した。

## 望ましい変更

(a) `docs/knowledge/structure-migration-followup-checklist.md` へ pin 型テスト群（配布物文言・構造を expect するテスト群）の期待値更新観点を追記、(b) references 編集手順に「変更対象行の文言を grep し期待値結合テストの有無を事前確認」の前置を追加、(c) bun test と typecheck の併用指針（bun test の pass は型整合を保証しない）を整備。

## 対象範囲

### 対象

- docs/knowledge/structure-migration-followup-checklist.md（pin 型テスト群観点の追記。2026-10-05 grep 実測で pin/文言期待/anchor の記述なし）
- 配布物 references 編集を伴う workflow の手順（case-open/case-ready/case-run/case-revise/case-close の手順装備系）
- scripts package を持つ skill 領域の typecheck 実行手順

### 対象外

- REQ-019 gate（check_test_impact.ts）の検出契機拡張（REQ-019-003 宣言的データ参照は実装済み。2026-10-05 実測）
- 個別テストの期待値修正（各 Case で対応済み）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/structure-migration-followup-checklist.md | pin 型テスト群・typecheck 併用観点の追記 |
| 配布skill reference | 各 workflow の references 編集手順 | 期待値結合テストの事前 grep 前置の追加 |
| Design | docs/designs/integrity/checker-execution-contracts.md 系 | typecheck 併用指針の追補候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: check_test_impact.ts（REQ-019-003 宣言的データ参照テストの検出契機を実装済み）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: gate は Design/REQ/ADR 変更と宣言的データ参照を検出するが、配布物文言 pin 型テスト群の追随確認・anchor テストの事前検出・typecheck 併用は checklist・手順に未記載

## 制約

- gate の検出契機変更を本件で要求しない（req-define の別途判断とする）
- テストと実装の同一変更単位原則は維持

## 受け入れ条件

- [ ] checklist に pin 型テスト群の期待値更新が明記される
- [ ] references 編集手順に事前 grep の前置が記載される
- [ ] bun test と typecheck の併用指針が記録される

## 元learning item / 根拠

- **要約**: pin 型・anchor 型テスト期待値の変更追随漏れ（44 fail 構造様式・削除追随 3+1・anchor テスト・tsc 型不整合の4件）
- **根拠**: Root Case #3407・PR #3409（分割①初回 44 fail → 同一変更で 42 件更新し 0 件確認）、PR #3419（src/opencode-local 削除の追随漏れを baseline 再現で由来分類）、Case #3443・PR #3449（anchor テスト文言固定の追随）、Case #3447・PR #3453（records-report.test.ts RecordOccasion 型不整合・bun test は pass）
- **再発条件**: pin 型テストが存在する文言・構造・パス・型を破壊的に変更する Case を実行する場合
- **横展開可能性**: 配布物 references・構造を編集する全 Case・scripts package を持つ skill 領域

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation, test
- **関連Issue**: なし
