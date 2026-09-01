# routing・運用明文化と learning 委譲候補（5件統合）

## 背景

workflow-templates の空見出し残骸、route 識別子の検出基準未明文化、junction 投影残滓の自己修復知見、adversarial-review 挿入境界の見出し表記規約未明文化、knowledge 見出しの機械判定形式未明記が指摘されている（5件）。

## 問題

- 運用上の判断基準・表記規約が明文化されず、個別文脈判断に依存
- 空見出し残骸は構文検査の誘因になる（inspect F-29 と同一対象）

## 望ましい変更

| item | 対応 |
|---|---|
| workflow-templates-empty-case-close-template-heading | SKILL.md L221 の空見出し残骸削除（inspect F-29 統合） |
| route-identifier-detection-criteria-candidate | route 識別子の検出基準の明文化先判断（learning routing 候補・横断検索の再発予防知見） |
| stale-junction-selfsync | junction 投影残滓の自己修復知見（learning routing 候補） |
| adversarial-review-heading-notation-design-candidate | 挿入境界見出し表記規約の明文化先判断（低優先） |
| patterns-design-knowledge-heading-match-form | knowledge 見出し一致の機械判定形式の明記（形式設計は req-define で判断） |

### learning routing 備考

- route-identifier・stale-junction の2件は具体的修正対象を持たない再発防止知見のため、backlog-review の learning 昇華先ルーティング（docs/knowledge/ 保存等）への回し候補として本文に記載

## 対象範囲

### 対象

- 上表5件（残骸削除・明文化先の確定）

### 対象外

- checker 実装の新規追加（機械判定形式確定後の別 Case）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | src/opencode/skills/agentdev-workflow-templates/SKILL.md | 空見出し削除 |
| spec | 明文化先（document-type-responsibilities.md か adversarial-review Design か等・req-define で確定） | 規約明文化 |

## 既存対策確認

- **確認結果**: 運用適用は済み（adversarial-review-heading）、明文化未実施
- **ギャップ分類**: guardrail insufficiency（軽微）

## 制約

- 明文化先の正規所有判断は req-define / backlog-review で行う
- F-29（inspect）と同一対象のため inspect promoted と統合して処理（二重修正の回避）

## 受け入れ条件

- [ ] 空見出し残骸が削除されている
- [ ] 各規約の明文化先が確定し反映されている（または learning routing に回付されている）

## 元learning item / 根拠

- **根拠**: SKILL.md L221 空見出しの行番号実証、明文化箇所の検索ゼロ確認
- **横展開可能性**: 運用規約の明文化全般

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし
