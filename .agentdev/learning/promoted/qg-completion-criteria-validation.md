# QG-2/QG-4 完了条件検証強化（テスト戦略 vs 対象外、PR 範囲 vs 全体、数値閾値到達可能性）

## 背景

AgentDevFlow の case-close QG-4（最終受け入れ判定）と QG-2（Acceptance Criteria Coverage Gate）で、Issue 完了条件の解釈を巡る3つの境界ケースが顕在化した。いずれも「完了条件が客観的に達成されているか」の判定で、SPEC に判定ルールが未明文のため case-close 時に都度調整判断が必要になる。

1. **テスト戦略 vs Epic 対象外の矛盾**（#1516/TS-004）: Epic 完了条件のテスト戦略「配布 command 6ファイル実行制御パラメータ直接記述 0件」と、Epic 対象外「配布 command/skill/docs の実装本体改修」が矛盾。REQ-0162-002 は要件追加されたが src/opencode/ からの除去は未実施で、TS-004 がスコープ外と衝突。
2. **識別子中心評価: PR 範囲 vs 全体**（#1532/TS-006）: 完了条件7「REQ-0119-036 横断評価で違反0件」を「全配布物」で評価すると未達、「本 PR 対象範囲」で評価すると達成、という二値性。識別子中心評価（REQ-0146-011）と「0件」実測値要求の主評価/補助値の境界が曖昧。
3. **数値閾値到達不能問題**（#1538/TS-007）: 完了条件 TS-007「LF 数 200 以上」が case-open が生成する自然な Issue 本文構造では到達不能。draft LF 数（246）を基準にしたが、draft と case-open 生成 Issue 本文は構造が異なるため到達不能閾値になる。

## 問題

1. case-close QG-4 で「テスト戦略 vs Epic 対象外」の矛盾に直面した際、spec-bug 判定基準が SPEC に未明文化で都度調整判断が必要。
2. 完了条件の「PR 範囲 vs 全体」判定ルールが QG-4 reference に未明文で、横断評価を含む完了条件の PR が一部ファイル修正の場合に毎回直面。
3. 完了条件の数値閾値が対象成果物の自然な構造で到達可能かの事前計測が QG-2 に未実装。REQ-0131 系（test strategy 策定）にも未明文化。

## 望ましい変更

QG-2（Acceptance Criteria Coverage Gate）と QG-4（最終受け入れ判定）の reference に、3つの境界ケースに対する判定ルール・検証手順を明文化する。特に QG-2 では完了条件の達成可能性を同種既存成果物の実測値で事前検証する仕組みを導入する。case-open では完了条件のスコープ（本 Issue 対象範囲 vs 全体）を明示し、数値閾値の到達可能性を検証して到達不能場合は警告する。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md`（数値閾値到達可能性検証、テスト戦略 vs 対象外整合性検証）
- `.opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md`（PR 範囲 vs 全体 判定マトリクス、識別子中心評価の運用実例集）
- `.opencode/skills/agentdev-req-analysis/references/`（test strategy 策定ガイド：基準値を同種既存成果物から実測）
- `src/opencode/commands/agentdev/case-open.md`（完了条件の数値閾値検証、スコープ明示）
- `src/opencode/commands/agentdev/case-close.md` Step 2（完了条件評価時の PR 範囲 vs 全体 判定）

### 対象外

- agentdev-workflow-templates（Epic 完了条件テンプレート）の改修は別 Issue で検討（本成果物のスコープ外）
- 既存の spec-bug 分類基準そのものの見直し（別途 inspect-docs 等で扱う）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | .opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md | 数値閾値到達可能性検証（同種既存成果物の実測値比較）、テスト戦略 vs 対象外整合性検証を追記 |
| skill | .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | 「PR 対象範囲 vs 全体」判定マトリクス、識別子中心評価の運用実例集を追記 |
| skill | .opencode/skills/agentdev-req-analysis/references/ | test strategy 策定ガイドに基準値の同種既存成果物実測を追記 |
| command | src/opencode/commands/agentdev/case-open.md | 完了条件の数値閾値検証、スコープ（本 Issue 対象範囲 vs 全体）明示 |
| command | src/opencode/commands/agentdev/case-close.md | Step 2 に PR 範囲 vs 全体 判定ルール明記 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: .opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md、qg-4-final-acceptance.md、agentdev-req-analysis/references/
- **ギャップ分類**: fix gap
- **ギャップ詳細**: QG-2 は acceptance-criteria-coverage を扱うが、(a) 数値閾値の到達可能性（同種既存成果物の実測値比較）検証が未実装、(b) テスト戦略 vs Epic 対象外の整合性検証が未実装。QG-4 reference に「PR 対象範囲 vs 全体」判定ルールと識別子中心評価の運用実例が未明文。REQ-0131 系（test strategy）に到達可能性検証が未明文化。

## 制約

- 3つの境界ケースは関連するが個別のギャップ（fix gap）が異なるため、accept criteria で3つの観点を明示的に扱う。
- QG-2/QG-4 reference の拡充は既存の acceptance-criteria-coverage・final-acceptance フレームワークを維持しつつ拡張する形で行う。
- case-open での完了条件スコープ明示は、RU 作成時に要件定義者が明示することを前提とし、自動推論は行わない。

## 受け入れ条件

- [ ] QG-2 reference に数値閾値到達可能性検証（同種既存成果物の実測値比較）手順が追記されている
- [ ] QG-2 reference にテスト戦略 vs Epic 対象外の整合性検証手順が追記されている
- [ ] QG-4 reference に「PR 対象範囲 vs 全体」判定マトリクスが追記されている
- [ ] QG-4 reference に識別子中心評価（REQ-0146-011）の運用実例が追記されている
- [ ] agentdev-req-analysis に test strategy 策定時の基準値実測ガイドが追記されている
- [ ] case-open に完了条件のスコープ明示・数値閾値検証手順が追記されている
- [ ] case-close Step 2 に PR 範囲 vs 全体 判定ルールが明記されている

## 元learning item / 根拠

- **要約**: QG-4 / case-close での完了条件解釈を巡る3つの境界ケース（テスト戦略 vs Epic 対象外、PR 範囲 vs 全体、数値閾値到達可能性）が SPEC に未明文で、case-close 時に都度調整判断が必要。
- **根拠**:
  - inbox#2 (Issue #1516/TS-004): Epic 完了条件のテスト戦略と Epic対象外が矛盾、case-close QG-4 で accepted 判定も SPEC 化必要
  - inbox#5 (Issue #1532/TS-006): 完了条件7「違反0件」を PR 範囲 vs 全体で評価する二値性、識別子中心評価の運用実例未蓄積
  - inbox#8 (Issue #1538/TS-007): 完了条件 TS-007「LF 数 200 以上」が case-open 生成 Issue 本文構造で到達不能、draft LF 数基準が自然構造で到達不能
- **再発条件**: (1) Epic 完了条件のテスト戦略が対象外と矛盾する場合、(2) 横断評価を含む完了条件で PR が一部ファイル修正の場合、(3) 完了条件に数値閾値を設定し事前計測しない場合
- **横展開可能性**: 今後同様の「完了条件の達成可能性・スコープ解釈」問題が case-open/case-close/spec-save 等で発生し得る

## 推奨Issue分類

- **分類**: feature（QG-2/QG-4 reference の拡充、case-open/case-close の手順拡張）
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Issue #1516 (PR #1525)、Issue #1532 (PR #1534)、Issue #1538 (PR #1539)、Epic #1515 Wave 1、REQ-0146-011（識別子中心評価）、REQ-0119-036（横断評価原則）、REQ-0131（test strategy）
