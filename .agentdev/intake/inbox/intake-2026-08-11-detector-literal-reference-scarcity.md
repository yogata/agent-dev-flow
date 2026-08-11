# intake: detector リテラル参照稀少（約44件の IR が意味ベース依存）の命名規約導入候補

## 発生日

2026-08-11

## 発生元

- Issue: #2078 (OU-002 Phase 1 全59 IR 双方向ポートフォリオ監査)
- PR: #2085 (feat(spec): REQ-028 Phase 1 全59 IR 双方向監査結果追加)
- Epic: #2076 (REQ-028: IR portfolio audit and existence-condition hardening)
- 取得元: PR #2085 本文「## Findings / Capture候補」>「### intake 候補」セクション、および 監査結果ドキュメント §4 各 IR 詳細「detector」列、§5 実装→IR 方向解析

## 問題事象

REQ-028 Phase 1 双方向監査の過程で、detector 実装から IR ID（`IR-NNN`）へのリテラル参照が約15件のみに留まり、約44件の IR が意味ベース（関数名、ファイル配置、コメント等からの意味推論）でのみ check 関数と紐づいていることを観測した。リテラル参照の欠如は、実装→IR 方向の逆引き網羅性を低下させ、所有者不明検査（TS-008）の完全解消を困難にする構造的要因。

観測事実:
- 全59 IR 中、detector リテラル参照あり: 約15件
- 意味ベース依存（リテラル参照なし）: 約44件
- detector 未実装: 20件（IMPLEMENT 候補、Phase 4/5 で実装予定）

## 影響

- TS-008（所有 IR 不明検査の残存なし）完全達成の阻害: 意味ベース依存の検査は所有 IR が機械的に確定せず、Phase 2/3 での意味判断を要する
- REQ-028-001 存在条件3「executable detector」の安定性: detector 実装が意味ベース依存の場合、detector ↔ IR 紐付けが実装者の暗黙知に依存し、リファクタリング時の切り離しリスクが高い
- AG-005（同種 invariant 横断的再評価と共通 detector 統合）の阻害: 意味ベース依存では統合候補の機械的検出が困難
- Phase 2 (OU-003) 入力データの品質: 約44件の IR について意味ベースマッピングの完全化が Phase 2 課題として残存

## 発生局面

実装（REQ-028 Phase 1 双方向監査での実装→IR 方向解析）

## 検知方法

Phase 1 監査結果ドキュメント `docs/specs/integrity/audits/bidirectional-audit-20260811.md` §5.1（実装→IR 逆引き表）、§5.2（所有者不明検査リスト）で、check 関数から IR ID のリテラル参照が見出せない事例を約44件確認。PR #2085 本文「### intake 候補」に明記。

## 想定される対応方向

- **Phase 4 (OU-005) または Phase 5 (OU-006) で命名規約導入**: detector 関数名、ファイル名、JSDoc コメント等に IR ID（`IR-NNN`）をリテラル参照として含める命名規約を策定し、機械的逆引きを可能にする
- **判定候補確定後（Phase 2 完了後）に策定**: KEEP/IMPLEMENT 判定された IR について、Phase 4/5 で命名規約を適用。MERGE 候補は統合先で新規命名
- **規約案の候補**:
  - 関数名: `checkIR_NNN_<invariant>` 形式
  - JSDoc: `@ir IR-NNN` タグ標準化
  - ファイル配置: `integrity/rules/IR-NNN-*.md` との対称性を checker/test 側でも維持
- **backlog-review で優先度判断**: Phase 4/5 の作業スコープに含めるか、独立作業（Epic #2076 完了後）とするかを評価

## 関連

- Epic: #2076 (REQ-028 IR portfolio audit)
- Issue: #2078 (OU-002 Phase 1)
- PR: #2085 (squash merge commit fbc277bf)
- 監査結果ドキュメント: `docs/specs/integrity/audits/bidirectional-audit-20260811.md` §4, §5
- 関連要件: REQ-028-001（8項目存在条件）、REQ-028-003（双方向監査）、AG-005（同種 invariant 横断的再評価）
- 後続 Issue: #2079 (OU-003 Phase 2 KEEP/MERGE/IMPLEMENT/DELETE 判定)、#2081 (OU-005 Phase 4 IR 管理モデル再設計)、#2082 (OU-006 Phase 5 判定結果適用)

## 出典引用

PR #2085 本文「## Findings / Capture候補」>「### intake 候補」より:

> - detector リテラル参照の稀少（約44件の IR が意味ベース依存）は、Phase 4 (OU-005) または Phase 5 (OU-006) で detector 実装時の命名規約導入候補

PR #2085 本文「## Findings / Capture候補」>「### Phase 2 (OU-003) への委譲事項」より（関連事項）:

> - **意味ベースマッピングの完全化**: 約44件の IR（リテラル参照なし）について check 関数との完全マッピング

## タグ

#intake #detector #naming-convention #literal-reference #req-028 #epic-2076 #ir-portfolio-audit #phase-delegation
