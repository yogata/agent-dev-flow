# 対応宣言・カタログ・棚卸しの整備（12件統合）

## 背景

ADF-COVERS 宣言の配置、verification-scope-catalog・integrity rule catalog の未登録、traceability の missing-implementation 棚卸しに係る未整備が複数指摘されている（12件）。

## 問題

宣言・カタログの未登録により、traceability check や integrity check が恒常 fail / 検出漏れになり、対応関係が機械解析に現れない。

## 望ましい変更

- 未配置の implementation/verification 宣言を docs 配下 Design へ配置する（REQ-011-020/021、REQ-052、REQ-032-022、REQ-048-012〜014）
- verification-scope-catalog へ REQ-050 セクションを追加する
- corpus 拡張（.ps1 等の拡張子方針）と 3値分類の Design 反映を行う
- REQ-046-004 幻参照（DEC-022.md L63）の是正（現行行への付け替え、該当なしなら参照除去）
- case-open extension rules（rules: []）の運用判断
- missing-implementation / unclassified-req-rows の棚卸し単位・方針を確定する（3方針併存のため req-define で判断）

## 対象範囲

### 対象

| item | 対応 |
|---|---|
| req032-022-adf-covers-design-unregistered | REQ-032-022 の implementation 宣言を case-close 関連 Design へ |
| traceability-missing-implementation-inventory | missing-implementation の棚卸し（単位・方針は req-define で判断） |
| traceability-exit2-gate-prerequisite | traceability exit 2 の gate 前提整理 |
| traceability-design-check-derivation-details | Design への3値分類記載追加 or 参照のみかの判断 |
| verification-scope-catalog-req050-unregistered | catalog へ REQ-050 セクション追加 |
| adf-covers-placement-req011-rows | REQ-011-020/021 宣言の custom-tool-contracts.md への配置 |
| req052-adf-covers-design-placement | REQ-052 宣言の Design 側配置 |
| traceability-req048-declaration-corpus-gap | REQ-048-012〜014 宣言の配置（Design 追記 / corpus 拡張 / CLI 挙動の3方針から選択） |
| unclassified-req-rows-66-backlog | catalog 未登録 REQ 行の棚卸し（66件単位の要否判断） |
| req046-004-phantom-reference-dec022 | DEC-022.md L63 の REQ-046-004 幻参照是正（欠番のため現行行への付け替え or 除去） |
| case-open-extension-rules-traceability | .agentdev/extensions の rules 運用（空のまま）の判断 |
| traceability-corpus-ps1-gap | corpus.ts DEFAULT_SCAN_EXTENSIONS の拡張子方針（.ps1 追加 or 除外明示） |

### 対象外

- traceability check の CLI 仕様変更（方針確定後の別 Case）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/designs/workflows/workflow-contracts.md、docs/designs/responsibilities/custom-tool-contracts.md、docs/designs/commands/case-close.md、docs/designs/foundations/references/verification-scope-catalog.md ほか | 宣言配置・catalog 追加 |
| req | docs/requirements/REQ-048.md 関連 | 宣言の正規配置先確定 |

## 既存対策確認

- **確認結果**: 検出器（traceability check）は既存、宣言・catalog の整備が未了
- **ギャップ分類**: fix gap（宣言未配置・catalog 未登録）

## 制約

- 対応宣言の正規配置先は docs 配下 Design（learning promoted「配布物執筆時の ID 衛生」統合参照）
- inspect findings F-01〜F-07（dangling 行参照）と REQ-046-004 は同型作業（統合マーカー: inspect promoted）

## 受け入れ条件

- [ ] 上表の宣言・catalog 未登録が解消されている
- [ ] traceability check の恒常 fail（当該分）が解消または方針確定している

## 元learning item / 根拠

- **根拠**: 各 intake item の現状確認（宣言配置・catalog 検索ゼロの実証済み）
- **横展開可能性**: ADF-COVERS 宣言・verification-scope-catalog 運用全般

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: traceability
- **関連Issue**: なし
