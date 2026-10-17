# DefinitionEdit 入力 JSON 組立時の newText 行構造事前検証

## 背景

Case #3779（2026-10-17）の case-open STEP-4 機械工程で、traceability sidecar 宣言（implementation/verification の REQ 行 ID リスト）の newText を「prefix 文字列 + 追加行リストの join」で組み立てた際、置換対象の旧文（oldText）の末尾に行末改行が含まれない前提を見落とし、`REQ-111-008  - REQ-110-016` のように REQ 行 ID が同一行に連結された状態で適用・commit された。traceability check（fail-closed）が sidecar 解析不能として missing-design/implementation/verification と malformed-declarations を検出し、PR 作成前に修正された（PR #3780）。

## 問題

`agentdev-workflow-case-open/references/definition-pr-and-idempotency.md`（STEP-4 機械工程手順）には、DefinitionEdit の入力 JSON 組立後に newText の行構造を検証する規定が存在しない:

- L35 の入力契約は「対象パス・旧文・新文の完全一致一意指定」までで、行構造・行数の検証は要求しない
- L47 の「事前検証」は品質ゲート入力（GateCommandSpec）が対象で、DefinitionEdit JSON は対象外
- L40 の「artifact_actions 適用後の verbatim 包含突合」は各行の文字列が含まれることを確認する検査であり、行区切りが欠落して複数行が1行に連結されていても成立する（行構造破壊に構造的に不感）
- 検知できるのは commit 済み HEAD に対する traceability check（malformed-declarations 等を blocking 判定）のみで、悪い commit が既に発生した後である

したがって、連結組立による行構造破損は「適用され、commit され、事後検知で発覚する」経路となり、組立時点での防止規律が存在しない。

## 望ましい変更

機械工程入力 JSON の組立手順に、DefinitionEdit ごとに newText の行構造を機械検証する事前確認を追加する。確認内容は「newText の行数 = oldText 行数 + 追加行数（置換の場合は期待行数）」等の機械的な整合確認であり、連結結果の行構造を組立時に保証する。手順明記を第一候補とし、script（prepare_definition_pr.ts）側への検証組込みの要否は req-define が判断する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` の STEP-4 機械工程手順（入力 JSON 組立条項）

### 対象外

- traceability check（check.ts）・verbatim 包含突合（L40）等の既存事後機構の変更（代替・削減しない）
- DefinitionEdit の入力契約（path / oldText / newText の旧文完全一致置換）自体の拡張・変更
- script 実装の変更（本成果物は手順明記を第一候補とする。実装強化は req-define の判断）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | STEP-4 機械工程手順 L35（入力 JSON 組立）条項に「組立後に DefinitionEdit ごとに newText の行数（oldText 行数 + 追加行数）を機械検証する事前確認」の追記 |
| 配布skill scripts | src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts | 入力検証に newText 行構造チェックを追加する実装候補（req-define が実施要否を判断） |
| deferred pool | .agentdev/learning/deferred.md L4782 付近（「prepare_definition_pr の入力 JSON を段階構築した際 definitionEdits が重複し旧文不在 fail が発生する」） | 同一 STEP-4 入力組立の近縁欠陥。本成果物の反映時に統合反映するかの判断材料 |

## 既存対策確認

- **確認結果**: 対策あり（事後）
- **該当ファイル**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（L40 verbatim 包含突合、L52-59 traceability check gate 判定仕様）、traceability/agentdev-workflow-phase-artifacts-update.yaml、src/opencode/skills/agentdev-traceability/scripts/src/check.ts（検出機構）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 組立時の事前検証規定が不在。既存の事後機構では、verbatim 包含突合は行構造破壊に不感であり、traceability check は commit 後検知であるため悪い commit を防止できない

## 制約

- 事前検証は既存の事後機構（verbatim 包含突合・traceability check）を代替せず、前置する位置づけで追加する
- 行数の数え方（行末改行の有無による差）は本件の根本原因そのものであるため、検証規則の文言では「oldText 末尾の行末改行の有無を前提にしない行構造確認」を明示する
- script 側に実装する場合、入力検証での拒否（終了コード 1）は既存の入力検証契約（L47 の事前検証パターン）に従う

## 受け入れ条件

- [ ] STEP-4 機械工程手順に DefinitionEdit の newText 行構造を組立後に機械検証する事前確認の規定が存在する
- [ ] 規定は oldText 末尾の行末改行の有無に依存しない確認方法を示している
- [ ] 既存の事後機構（verbatim 包含突合・traceability check）が維持されている

## 元learning item / 根拠

- **要約**: DefinitionEdit の newText を文字列連結で組立た際行区切りが欠落し、連結行の適用・commit を経て traceability check の事後検知で発覚した（Case #3779、PR #3780）
- **根拠**: definition-pr-and-idempotency.md 全文実測（L35 完全一致一意指定のみ・行構造検証なし、L40 verbatim 包含突合は行構造破壊に不感、L47 事前検証は gate spec 対象外、L52-59 traceability check は commit 後 blocking）。実害1回（連結行の適用・commit・PR 前修正）。adversarial-review の独立 challenge stream が全文読取で gap を確認し、orchestrator 再実測で裏取り。入力組立の近縁欠陥（deferred.md L4782・重複による旧文不在 fail〔commit 前停止で無害〕）が既に1件あり、STEP-4 入力組立の対策統合の材料になる
- **再発条件**: 旧文の末尾に行末改行を含まない DefinitionEdit に対し、newText を prefix 文字列 + 追加行リストの連結で組み立て、行区切りを明示しない実装
- **横展開可能性**: DefinitionEdit 系の入力 JSON を文字列連結で組み立てる実装（REQ 行追記、宣言リスト追記等）全般に適用。8軸評価 24/40、自動化適性 5/5、反映先明確度 4/5

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement, workflow
- **関連Issue**: Case Issue #3779
