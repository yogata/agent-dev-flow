# REQ 行追加を伴う Definition 生成時の verification-scope-catalog 追随工程の規定

## 背景

case-ready STEP-6 検証ゲートで、直前に merge した Definition PR の新規 REQ 行（REQ-057-026..029・REQ-036-027・REQ-047-010・REQ-010-077・REQ-021-026/027・REQ-031-029/030・REQ-082-001..025 の計 36 行）が verification-scope-catalog 未登録で `verificationClassification: unclassified` となり、対象 10 Case（#2822 / #2823 / #2824 / #2825 / #2831 / #2832 / #2833 / #2846 / #2856 / #2858）が ready 保留となった。36 行は Issue #2867（未分類行の一括登録）で解消済みであり、本成果物は再発防止の工程規定に関する残余ギャップを対象とする。

## 問題

REQ 行追加を伴う Definition Package 生成時に、verification-scope-catalog への任意行エントリ追加（またはカタログ追随）を Definition に含める工程規定が存在しない。現行の case-open は未分類行の残存を許容し（検証対応要否の最終ゲートは case-ready が所有）、#2870 で追加された横断依存検査ゲートは同一パス重複・共有領域未登録行の重複需要は検出するが「カタログ更新の不在」そのものを検出しない。このため REQ 行追加を伴うバッチ投入では、case-ready STEP-6 での ready 保留が反復し得る。

## 望ましい変更

次の予防策のいずれか（または組み合わせ）により、REQ 行追加とカタログ分類の追随を工程として接続する。実現方法の選択は req-define の変更影響分析に委ねる:

1. case-open（および req-define）の工程へ検証対応要否分類ゲートを明示する（REQ 行追加時は verification-scope-catalog 更新を Definition Package に含める）
2. case-ready STEP-2 の canonical 再取得時に traceability check を機械実行し、unclassified 検出時に case-open へ差し戻す経路を明記する
3. REQ 移動・分割時にカタログの範囲表現追随を Definition 変更の必須構成とする

## 対象範囲

### 対象

- case-open の Definition Package 生成・横断依存検査（STEP-4 / STEP-5）
- req-define の要件doc 生成（REQ 行追加の上流）
- case-ready STEP-2（canonical 再取得）・STEP-6（検証対応要否最終ゲート）
- verification-scope-catalog.md の運用記録

### 対象外

- 対象 36 行の分類確定自体（Issue #2867 で解消済み）
- case-open が未分類行の残存を許容する現行設計の廃止そのもの（最終ゲートの case-ready 所有は維持したまま、追随の工程接続を扱う）
- traceability check の unclassified / missing-verification 検査仕様の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | case-open の Definition Package 生成・横断依存検査 reference | REQ 行追加時のカタログ追随要件（Definition 構成へのカタログ更新包含または警告） |
| 配布skill | case-ready の canonical 再取得・検証ゲート reference | unclassified 検出時の差し戻し経路と機械検出（traceability check）の明記 |
| Design | docs/designs/foundations/references/verification-scope-catalog.md（棚卸し方針・運用） | REQ 行追加時の追随契約の記載候補 |
| 配布skill | req-define の要件doc 生成 reference | REQ 行追加時にカタログ登録要否を要件doc 側で明示する候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: case-open SKILL.md（未分類行の残存許容・最終ゲートの case-ready 所有の明記、横断依存検査エンジンを case-ready 検証対応要否ゲートと共有）、verification-scope-catalog.md 棚卸し方針・実施記録（Issue #2510 / #2867 / #2870 の事後登録）、case-ready の検証対応要否ゲート
- **ギャップ分類**: fix gap / application miss
- **ギャップ詳細**: 分類機能・最終ゲート・事後棚卸し手順は存在するが、(a) REQ 行追加を伴う Definition 生成時にカタログ更新を Definition に含める工程規定が存在しない、(b) #2870 の横断依存検査ゲートは同一パス重複・共有領域未登録行の重複需要のみ検出し「カタログ更新の不在」を検出しない、(c) case-ready での unclassified 検出時に case-open へ差し戻す経路が規定されていない（2026-09-16 実行時に case-open SKILL・カタログ実施記録を確認）

## 制約

- 検証対応要否の最終ゲートの case-ready 所有（case-open SKILL の現行明記）を前提とし、本変更は追随の工程接続に留める
- カタログ編集は実変更（main 直接変更を伴う）であるため、Definition PR 経由以外の適用経路を取らない
- traceability check の unclassified と missing-verification は同一行集合の単一導出である（計上仕様を変更しない）

## 受け入れ条件

- [ ] REQ 行追加を伴う Definition 生成時、カタログ追随の要否が工程上明示されること（Definition 構成への包含または上位工程での明示）
- [ ] case-ready で unclassified を検出した際の差し戻しまたは保留の経路が reference に明記されていること
- [ ] バッチ投入（複数 Case の一括処理）で新規 REQ 行の unclassified による ready 保留が構造的に防止または早期検出されること

## 元learning item / 根拠

- **要約**: case-open が検証対応要否分類ゲートを実行せず、Definition PR の changed files にカタログ更新を含めなかったため、case-ready STEP-6 で新規 REQ 行 36 行が unclassified となり 10 Case が ready 保留した。部分的な ready 可能 10 Case との分離報告の後、Issue #2867 で 72 行（36 行を含む）を一括登録して解消した。
- **根拠**: カタログ本文の過去エントリ記録は case-open の分類ゲート運用が存在したことを示すが、case-open workflow のゲート規定が実行時に担保されていなかった。カタログ編集は実変更（main 直接変更）であり case-ready が Definition PR 経由以外で行う経路が存在しないため、実行時はカタログ補完を行わず部分完了として HITL 報告した。
- **再発条件**: REQ 行追加を伴う Definition PR が case-open で作成され、カタログ更新が Definition Package に含まれない場合に毎回発生
- **横展開可能性**: REQ 行追加を伴う全 workflow（req-define、case-open、case-revise）。traceability check の機械実行で検出可能
- **prune 証拠**: inbox.md 2026-09-16 実行分「case-open が検証対応要否分類ゲートを実行せず、case-ready STEP-6 が新規 REQ 行の unclassified で停止」エントリ（削除前の完全本文は git 履歴の inbox.md @ 795bfb19 を正とする）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: workflow, traceability
- **関連Issue**: Issue #2867、Issue #2870、Case #2822 / #2823 / #2824 / #2825 / #2831 / #2832 / #2833 / #2846 / #2856 / #2858
