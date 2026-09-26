# 配布物 canonical 参照の concrete ID 直書き禁止を委譲指示規約へ組込み（sidecar 宣言パターン含む）

## 背景

Case #3144（DEL-3144-1）と Case #3145（DEL-3145-1）の同一バッチで、配布 skill reference・運用文書への canonical 参照追記において concrete ID（REQ 行 ID・CR 番号）を本文に直書きし、配布依存境界 final gate（--profile source）の concrete_id_hits が BASE 38 から増加して「新規違反ゼロ」を不合格とした。両 Case とも fix-and-reverify で解消したが、同一知識文書の更新（2026-09-20）後に違反が再発生した。

## 問題

- 配布物（src/opencode 配下）本文に concrete ID を直書きすると concrete-id ルールが新規 hit として計上される
- 中核知識（docs/knowledge/distribution-concrete-id-placement.md）は存在するが、実装委譲時の指示規約（agentdev-case-run-execution-adapter references）に組込まれていないため、委譲先が知識を参照せず違反する（application miss。知識存在下の同一バッチ2回発生で実証）

## 望ましい変更

実装委譲時の指示規約へ「配布物本文の canonical 参照は節名のみで記述し、REQ 行等との対応関係は traceability sidecar（agentdev-issue-management.yaml 等 implementation 宣言）で記録する」規律を事前明示する。

## 対象範囲

### 対象

- agentdev-case-run-execution-adapter references（実装指示規約）
- canonical REQ 行から運用文書への規律展開を行う全 Case

### 対象外

- docs/knowledge/distribution-concrete-id-placement.md の中核知識（保有済み）
- 配布境界 checker 側の変更（検出は機能している）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md 等の指示規約節 | concrete ID 直書き禁止・節名参照・sidecar 宣言パターンを委譲指示に事前明示 |

## 既存対策確認

- **確認結果**: あり（application miss）
- **該当ファイル**: docs/knowledge/distribution-concrete-id-placement.md（本文概念名参照・ID ファミリー制限・3系統同時衝突を記載）
- **ギャップ分類**: application miss
- **ギャップ詳細**: 委譲指示規約への組込みなし。sidecar（traceability YAML implementation 宣言）による対応関係記録という実装パターンの言及なし

## 制約

- evidence 併記規約（Case #3144 本体変更）により evidence path の prune 後識別子併記はケースバイケースで必要
- baseline delta の機械確認を final gate で必須化（現行契約どおり）

## 受け入れ条件

- [ ] 委譲指示規約に concrete ID 直書き禁止・節名参照・sidecar 宣言パターンが明記されること
- [ ] 以降の RA 実装系 Case で concrete_id 新規 hit が発生しないこと

## 元 learning item / 根拠

- inbox 2026-09-26「配布物本文への canonical 参照は節名のみで記述する」（Case #3144、PR #3155、DEL-3144-1）: concrete_id_hits 38→42 の 5 件を節名参照へ書き換え BASE 同値へ復帰
- inbox 2026-09-26「canonical REQ 行 ID の運用文書への展開は sidecar 宣言パターンで行う」（Case #3145、PR #3153、DEL-3145-1）: REQ-092-004 直書き 1 件を機能的記述+sidecar 宣言へ切替、baseline delta -4・新規 0
- deferred「配布物の不在ID参照残骸は概念名参照へ置換する」（移動日 2026-09-03、PR #2539、Issue #2538）: 同一事象の初回観測（不在 ID 参照残骸）
