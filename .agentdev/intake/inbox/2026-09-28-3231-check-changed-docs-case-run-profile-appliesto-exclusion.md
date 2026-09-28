# intake: check_changed_docs.ts case-run profile の appliesTo が docs/knowledge/**・traceability/** を対象外とする構造の是正候補

- 観測日: 2026-09-28
- 観測元: case-close Issue 3231（REQ-094 Wave 3・PR #3232 merge 済み・マージ後 main HEAD 9ed77a73）の Capture 回収（PR 本文「Findings / Capture候補」docs-integrity）
- 種別: checker 構造是正候補（docs 横断是正系実行単位での guard 実行契約の明文化または対象拡大。軽微。既存品質ゲートへの影響なし）

## 要求内容

check_changed_docs.ts（targeted docs guard）の `--workflow case-run` profile は appliesTo が docs/knowledge/**・traceability/** を対象外とする。そのため docs/knowledge 変更を含む実行単位で case-run 工程から targeted docs guard を実行すると files_checked 0（TARGET-EMPTY）となり、guard が静かに空振りする。REQ-094 Wave 3（Issue 3231）では全件適用の `--workflow docs-check` profile へ切替えて合格した（case-close 工程では case-close profile で全件検査対象となることを 2026-09-28 に確認済み）。

## 提案する補正

- docs 横断是正バッチ（docs/knowledge・traceability 変更を含む実行単位）での guard 実行契約として、case-run profile の appliesTo 対象拡大、または docs-check profile 実行の明文化を評価する。
- TARGET-EMPTY 時の検知条件（files_checked 空時の確認手順）の運用補強をあわせて評価する。

## 根拠

- PR #3232 本文「Findings / Capture候補」セクションの docs-integrity finding（機械実測: case-run profile で files_checked 0〔TARGET-EMPTY〕・docs-check profile で files checked 17・failures 0）。
- case-close 工程での実測（2026-09-28）: check_changed_docs.ts --workflow case-close は docs/knowledge・traceability を含む全 17 件を検査対象とし failures 0 で合格（Issue 3231 対応記録コメント 5871558052 参照）。
