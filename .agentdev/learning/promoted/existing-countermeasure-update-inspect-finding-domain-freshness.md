# 既存対策の更新: inspect finding の domain 記録の鮮度確認（実パス機械照合）手順

## 背景

Case #3121（case-open STEP-2/STEP-3・draft-data artifact_actions と実ファイルの突合）で、draft-data の ACT-DESIGN-001 が target_design.domain: responsibilities を宣言していたが、実ファイルは docs/designs/foundations/document-model.md であり domain が実配置と不一致だった。
宣言パスを正として機械的転記すると誤パス（docs/designs/responsibilities/document-model.md・不在）への変更が発生し得た。
slug（document-model）・行番号（L375）・文言の3点による一意特定の機械的照合（responsibilities/document-model.md の不在確認・grep による DEC-002 言及 1 箇所が foundations/document-model.md L375 に存在することの確認）で実配置（foundations/）を正として判定し、Definition Package に備考記録した上で Definition PR を作成した。
根本原因は、inspect finding の domain 記録が基盤 6 ドメイン再編による配置移動後も旧配置（responsibilities/）を参照し続けていること。

## 問題

inspect finding の domain 記録の鮮度確認（実パス照合）手順が不足しており、配置移動済みの文書を旧配置の domain で参照する finding が、draft-data → Definition Package の機械的転記で誤パス更新を引き起こし得る。

## 望ましい変更

inspect-docs / req-define 系 workflow に、finding の domain 記録の鮮度確認（実パス照合）を入れる。

- draft-data の artifact_actions を機械的転記する前に、target_design の実パス実在確認（grep による本文一意性確認込み）を行う。
- domain/slug 宣言と実配置の不一致でも slug・行番号・文言が一致すれば機械的照合で解決でき、意味的決定（HITL）を要しない。
- 宣言側の誤記を正にして不在パスを変更対象にしない。

## 対象範囲

### 対象

- inspect-docs 系（finding 生成・記録側）と req-define / case-open 系（finding 由来 draft の転記側）の実パス照合手順
- domain 記録の鮮度確認のための機械的照合指針（slug・行番号・文言による一意特定）

### 対象外

- inspect finding の schema 自体の変更
- 基盤 6 ドメイン配置移動（既に完了済み）の追加対応
- 過去 finding の一括鮮度是正

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-doc-diagnostics/SKILL.md | finding 記録の domain 鮮度（実パス照合）に関する診断観点の要否判断 |
| 配布skill | src/opencode/skills/agentdev-req-structure-diagnostics/SKILL.md | REQ 構造診断における domain 参照鮮度の観点追加の要否判断 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/SKILL.md | STEP-2/STEP-3 の draft-data 転記前の実パス実在確認（slug・行番号・文言による機械的照合）注記 |

## 既存対策確認

- **確認結果**: 既存対策あり（case-open STEP-2/STEP-3 の draft-data と実ファイルの突合、機械的照合の実践記録）
- **該当ファイル**: src/opencode/skills/agentdev-workflow-case-open/SKILL.md（STEP-2/STEP-3 の突合手順）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: finding の domain 記録の鮮度確認（実パス照合・grep による本文一意性確認）の手順が明文化されておらず、配置移動後の旧 domain 参照 finding が機械的転記の誤パス更新リスクになる。

## 制約

- 機械的照合（slug・行番号・文言の3点一致）で解決できる場合は意味的決定（HITL）を発生させない運用を維持する。
- domain 記録の随時是正は inspect-docs / backlog 経由の個別対応とし、一括是正しない。

## 受け入れ条件

- [ ] finding 由来 draft の転記前の実パス実在確認手順（grep による本文一意性確認込み）が明文化されている
- [ ] slug・行番号・文言による機械的一意特定の照合指針が手順に存在する

## 元learning item / 根拠

- **要約**: inspect finding 由来 draft の target_design.domain が実配置と不一致でも slug・行番号・文言で一意特定し実配置を正として扱える（鮮度確認手順のギャップ）。
- **根拠**: Case #3121（PR #3122）の実例。responsibilities/document-model.md の不在確認と、grep による DEC-002 言及 1 箇所が foundations/document-model.md L375 に存在することの確認。Root Case 本文に解決根拠を記録し、adversarial-review skip 判断の根拠（機械的照合であり意味的決定を含まない）にも使用。
- **再発条件**: inspect finding が配置移動（ドメイン間移送）済みの文書を旧配置の domain で参照する場合に再発。
- **横展開可能性**: finding の記録項目（domain 等）が配置移動で陳腐化し得る inspect-docs / req-define 全経路に共通。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation（手順明文化）
- **関連Issue**: Case #3121（PR #3122）
