# 新規 REQ 行の design 対応投影欠落（missing-design ゲート fail の宣言追随）の予防整備

## 背景

case-open STEP-4（Case #3177）で新規 REQ 行（REQ-007-013）を含む Definition PR を作成する際、draft に Design 変更宣言（artifact: design）がなかったため、PR 作成前の missing-design 0 件ゲート（agentdev-traceability check、fail-closed）で missing-design fail 1件を検出した。STEP-4 手順3 に従い Definition Package の構成へ戻して宣言追随を確定し、前例 REQ-007-011/012 と同一の sidecar（traceability/agentdev-quality-gates.yaml）design セクションへ追加して coverage で design 1件・check で missing-design pass を再検証した（Definition PR #3179 へ含めた）。

## 問題

- 新規 REQ 行は増分ベースの missing-design ゲート（case-open STEP-4 PR 作成前・case-ready トレーサビリティ完全性ゲート）で design 宣言を必須とする
- req-define の draft 契約には新規行の design 対応有無の投影（policy 登録判断 REQ-021-029 の design 版に相当する仕組み）がなく、draft に Design 変更がない Case では case-open 到達時に宣言追随が未確定になり得る

## 望ましい変更

- req-define の要件展開時に新規行の design 対応有無・対応先候補を draft へ投影する仕組みの検討（要否判断は req-define 変更影響分析に委ねる）
- case-open STEP-4 では missing-design ゲートを PR 作成前検査の最初に実行し、fail 時は前例 artifact を含む sidecar design セクションへの追加を標準解決とする指針の明文化

## 対象範囲

### 対象

- docs/designs/commands/req-define.md（要件展開時の design 対応投影の検討対象）
- src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（missing-design ゲート fail 時の宣言先選定指針）
- traceability sidecar の design セクション（宣言先の前例）

### 対象外

- missing-design ゲート自体の変更（増分ベース・fail-closed の現行契約は正しく機能している）
- REQ-021-029（policy 登録判断）自体の変更 — design 版を導入するかどうかの要否判断は req-define 変更影響分析に委ねる（learning-promote 時点では決定しない）
- knowledge 配置規約（知識文書は ADF-COVERS 宣言を持たない）自体の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/commands/req-define.md | 要件展開時の design 対応投影（新規行の design 対応有無・対応先候補の draft 投影）の検討 |
| 配布skill reference | src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | missing-design ゲート fail 時の宣言先選定指針（既存 sidecar design セクションへの追加を標準解決とする）の明文化 |

## 既存対策確認

- **確認結果**: あり（guardrail insufficiency）
- **該当ファイル**: なし（近縁: deferred「docs_chore の REQ 行 APPEND では traceability の missing-verification（unclassified）が必ず残る」は verification 側の対称問題・カタログ登録同時確定の運用。deferred「トレーサビリティ対応宣言の網羅性は欠落の規模を定量化して記録」も近縁）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: draft 契約に新規行の design 対応投影がなく、case-open STEP-4 のゲート fail 時の宣言先選定指針も未明文化。該当 deferred エントリなし（対称問題の近縁あり）

## 制約

- 宣言先は knowledge 配置規約（知識文書は ADF-COVERS 宣言を持たない）により RA-001 ownership_hints の知識文書を避け、同一 REQ 系統行の既存 sidecar design セクションへ統合するのが安全（前例 REQ-007-011/012 と同一の sidecar 宣言）
- 「新規 REQ 行の draft 契約に design 対応投影が無い」ことは自足的な現在のシステム事実として保持する。REQ-021-029 の design 版を導入するかどうかは req-define の変更影響分析が判断する

## 受け入れ条件

- [ ] case-open STEP-4 の missing-design ゲート fail 時の宣言先選定指針が明文化されること
- [ ] req-define 要件展開時の design 対応投影の要否判断が req-define 変更影響分析で確定すること（本成果物は投影欠落という事実のみを保持）

## 元 learning item / 根拠

- **要約**: 新規 REQ 行を含む Definition 変更で、draft の design 宣言欠落が missing-design ゲート fail として case-open 到達時に顕在化する
- **根拠**: inbox「case-open Definition PR 作成前 missing-design ゲートで draft 非宣言の design 宣言追随が確定する（新規 REQ 行）」（Case #3177・PR #3179・traceability/agentdev-quality-gates.yaml）: REQ-007-013 の missing-design fail 1件（findings: REQ-007-013）を検出。STEP-4 手順3 で Definition Package 構成へ戻し、sidecar design セクションへ同一 artifact（qg-4-final-acceptance.md）+ REQ-007-013 を追加して coverage design 1件・check pass を再検証
- **再発条件**: req-define が新規 REQ 行を作成し、draft に artifact: design の宣言を含めないすべての Case
- **横展開可能性**: 新規 REQ 行を含む Definition 変更全般で発生し得る。verification 側の対称問題（missing-verification）にも同様の投影・宣言先指針が適用可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: なし
