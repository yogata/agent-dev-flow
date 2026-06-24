# 関数削除要求の完了条件におけるスコープ明示と全使用箇所 grep 確認の標準化

## 背景

Issue #1139 完了条件（AG-002/013）が「IR-044 context exemption 関数（isNegationContext 等5関数）の定義・呼出が 0 件」と関数単位で包括的削除を求めたが、実装の結果 isNegationContext は別 checker（checkWorkflowStatusProhibition）でも使用されており、定義削除すると同関数が壊れることが判明した（PR #1140, #1139）。本来意図は「IR-044 からの context exemption 削除」だったが、完了条件が関数名列挙で代用されたため共用関数の存在を見落とす構造だった。幸い実装者が grep で全使用箇所を確認し破壊的変更を回避したが、機械的に削除すれば破壊的変更になる設計上の罠である。

## 問題

関数削除を要求する完了条件が「関数 X の定義・呼出が 0 件」と包括的削除を求める形式で書かれると、関数 X が複数 checker で共用されている場合に破壊的変更を招く。AG-/OU- 等 action item で共用関数・cross-cutting helper・utility 関数の削除を指示する場合、事前の全使用箇所確認がないと危険。

1. **完了条件のスコープ不明示**: 完了条件が対象スコープ（「from checkX」）を明記せず、関数名列挙で完全削除を代用するため、共用関数の存在を見落とす。
2. **TS（テスト戦略）の grep 確認未標準化**: case-run の実装時に削除対象関数の全使用箇所を grep で確認する手順が標準化されておらず、実装者の注意に依存している。

## 望ましい変更

1. **Issue 完了条件の書き方ガイド追加**: `agentdev-workflow-templates` に、関数削除を要求する完了条件は対象スコープ（「from checkX」等）を明記し、関数名列挙と完全削除を混同させないガイドラインを追加。
2. **case-run テスト戦略（TS）の標準化**: 削除対象関数の全使用箇所を `grep -rn "funcName" scripts/` で確認する手順を、関数削除を伴う Issue の TS に標準組み込み。
3. **AG-/OU- action item の記述指針**: 共用関数削除を指示する action item は、事前に全使用箇所の grep 結果を議論に含めることを推奨する指針の明記。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-workflow-templates/SKILL.md`（完了条件の書き方ガイド）
- `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_*.md`（完了条件テンプレートへの注記候補）
- `src/opencode/commands/agentdev/case-run.md`（テスト戦略への全使用箇所 grep 確認の標準化）

### 対象外

- check_integrity.ts の checker 構造（本件は完了条件の表現精度の問題であり、checker 実装の改訂を要しない）
- AG-002/013 の REQ/SPEC 本文（REQ-0145 に基づく SPEC 変更だが、本件は完了条件の表現精度に起因する実装判断）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-workflow-templates/SKILL.md` | 関数削除要求の完了条件書き方ガイド（スコープ明示・関数名列挙と完全削除の混同防止）を追加 |
| command | `src/opencode/commands/agentdev/case-run.md` | テスト戦略（TS）に削除対象関数の全使用箇所 grep 確認の標準手順を追加 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_*.md`（完了条件 checkbox テンプレート既存）、`src/opencode/skills/agentdev-workflow-templates/SKILL.md` L62（完了条件は checkbox 形式と定義済み）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 完了条件テンプレート・checkbox 形式の定義は既存だが、関数削除要求時のスコープ明示ルール（「from checkX」表記指針）が未整備。case-run の TS に削除対象関数の全使用箇所 grep 確認の標準手順も未実装。

## 制約

- 完了条件の書き方ガイドは「関数削除を要求する場合」に限定し、全完了条件に過剰なスコープ明記を要求しない。
- TS の grep 確認標準化は「関数削除を伴う Issue」に適用し、全 Issue に grep を要求しない（適用範囲の明確化）。
- 既存の完了条件 checkbox 形式との互換性を維持し、ガイドラインは注記・指針レベルで追加する。

## 受け入れ条件

- [ ] `agentdev-workflow-templates` に完了条件の書き方ガイド（関数削除要求時のスコープ明示）が追加されている
- [ ] ガイドラインに共用関数・cross-cutting helper 削除時の注意が明記されている
- [ ] `case-run.md` のテスト戦略に削除対象関数の全使用箇所 grep 確認手順が追加されている
- [ ] 追加内容が既存の完了条件 checkbox 形式と整合している

## 元learning item / 根拠

- **要約**: 関数削除を要求する完了条件は対象スコープ明示が前提。共用関数の包括的削除要求は他 checker を破壊する。
- **根拠**:
  - **L-014**（PR #1140, #1139/Epic #1138）: Issue #1139 完了条件（AG-002/013）が「IR-044 context exemption 関数（isNegationContext, isDelegationContext, isMetaScopeRuleContext, isBehaviorPredicateContext, IR044_STABLE_CONTRACT_PATTERN）の定義・呼出が 0 件」と関数単位で包括的に削除を求めた。実装の結果、isNegationContext は checkWorkflowStatusProhibition（IR-044 とは別 checker）でも使用されており、定義削除すると同関数が壊れることが判明。本来意図（IR-044 からの context exemption 削除）に従い、IR-044 からの呼出のみ削除し isNegationContext の定義は維持。完了条件の記述が対象スコープを関数名列挙で代用し、共用関数の存在を見落とす構造だった。実装者が grep で全使用箇所を確認したため破壊的変更は回避された。
- **再発条件**: 完了条件が「関数 X の定義・呼出が 0 件」と包括的削除を要求し、かつ関数 X が他 checker でも使用されている場合。実装者が全使用箇所を確認せず機械的に削除すると破壊的変更になる。
- **横展開可能性**: 関数削除を要求する完了条件を持つ全 Issue。特に複数 checker 共用関数、cross-cutting helper、utility 関数の削除を求める完了条件。

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement, process, documentation
- **関連Issue**: なし（新規）
