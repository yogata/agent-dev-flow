# traceability check/coverage の結果解釈と網羅検索の手順化

## 背景

traceability check・coverage の結果解釈（--req 限定でも形式検査系 findings は全体出力、coverage は advisory で欠落特定は check が正）と宣言走査経路（inline・sidecar・extensions yaml の複数系統）の手順化がなく、誤判定・検出手間が5件で観測された。sidecar 単一情報源違反3件の適用徹底観点も本件に含む。

## 問題

(1) coverage --req の複数行カンマ列挙では reqId ごとの design 宣言欠落が判別できず（関係全件が帰着し「欠落なし」と誤判定できた）、check --req の missing-design findings が正だった。(2) extensions yaml の ADF-COVERS 宣言は corpus の inline 走査対象外で sidecar 経由のみ機械検査されるため、unknown-req-refs の検出源特定に手間取った。(3) --req 指定時も unknown-req-refs 等の形式検査系は全体出力され、REQ-053 系 16 findings が混入し続ける（docs/reports の旧 REQ 行参照残骸・baseline 未登録）。(4) 無関係 REQ 系 fail は対照検証（main root で同 fail 確認）で変更起因から分離する手順が有効。(5) sidecar 単一情報源違反（同一 artifact × role 重複）3件は既存の事前確認手順・duplicate-inconsistencies 検出で機能したが適用徹底の観点整理が残る。

## 望ましい変更

(a) case-open STEP-3 design 対応事前確認手順に「coverage は reqId 単位で実測帰着・欠落行の発見は check --req を併用」を明記、(b) REQ 行参照追随手順に「traceability 配下 sidecar の REQ-NNN 全件検索（extensions yaml 宣言を含む）」を明記、(c) REQ 行廃止・移管の artifact_actions に docs/reports 等の参照残存確認を追加、unknown-req-refs の baseline 登録・分離表示を checker 改善候補として記録、(d) 対照実行による変更起因分離の標準手順化、(e) sidecar 追加時の事前確認（agentdev-traceability SKILL.md L35・sidecar-and-policy.md）の適用徹底観点を (b) と合わせて手順化。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md`（STEP-3 意味変更行 design 対応事前確認）
- `src/common/skills/agentdev-traceability/SKILL.md`（実行手順・sidecar 事前確認の適用徹底）
- traceability check（scripts）の baseline 登録・分離表示改善の情報候補

### 対象外

- traceability check の検出仕様（--req の対象限定と形式検査系全体出力の現仕様は維持）
- coverage の出力仕様変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md | coverage/check 役割分担・reqId 単位実行の事前確認手順明記 |
| 配布skill | src/common/skills/agentdev-traceability/SKILL.md | 参照追随の網羅検索手順（sidecar 全件検索）・結果解釈（completeness findings と形式検査系 findings の区別）の追記 |
| 配布skill scripts | .opencode/skills/repo-agentdev-integrity/scripts/（traceability check） | unknown-req-refs の baseline 登録・分離表示の改善情報候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: agentdev-traceability SKILL.md（9種検査の記述・sidecar 事前確認 L35・単一情報源優先規則 L52-56 実測）、case-open Design（design 対応事前確認）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 検出・規律は存在するが、coverage/check の役割分担の使い分け、--req 実行時の結果解釈、参照追随の網羅検索手順が実行手順側に未整備

## 制約

- check の検出条件・判定・計上は変更しない（single source of truth 維持）
- coverage を欠落検証の正にしない（advisory のまま）

## 受け入れ条件

- [ ] design 対応事前確認手順に check 併用・reqId 単位実行が明記される
- [ ] 参照追随手順に sidecar 全件検索（extensions yaml 含む）が明記される
- [ ] --req 実行時の結果解釈と対照実行による分離手順が記録される

## 元learning item / 根拠

- **要約**: traceability 実行の結果解釈・網羅検索の手順化欠落（coverage 判別 1件・extensions yaml 経路 1件・unknown-req-refs 混入 2件・対照分離 1件）と sidecar 単一情報源の適用徹底 3件
- **根拠**: Root Case #3420・PR #3421（coverage カンマ列挙の誤判定可能・check --req で REQ-006-112 欠落検出）、PR #3439（extensions yaml 走査経路・sidecar 58行の補完検出）、Case #3442・PR #3448 と Case #3446・PR #3452（REQ-053 系 16 findings の継続・--req でも全体出力）、Case #3444・PR #3450（対照検証で変更起因分離）、Case #3336/#3360/#3391（sidecar duplicate-inconsistencies 3件・規律どおり解消）
- **再発条件**: 複数行を coverage のカンマ列挙で一括確認する場合、extensions 側 ADF-COVERS 宣言を持つ REQ 行を編集する場合、REQ 行廃止・移管時にレポート参照が追随しない場合、全体走査系 checker で対象外の既知 NG が混在する場合
- **横展開可能性**: traceability 運用全体・REQ 行編集を伴う全 workflow

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation, workflow
- **関連Issue**: なし
