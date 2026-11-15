# 機械受理基準標本 fixture の分割番号正規形整合

## 背景

close_mechanical_steps.test.ts の機械受理基準標本（completeMachineAcceptanceRecord）は、bun test 3 分割実行の分割番号と実行対象の対応を標本値として含む。この標本は機械受理基準（受理由件1〜10）の記録実体を完備させた規範標本として機能するため、標本の分割番号割当が正規形と一致しない場合、標本を参照する工程や流用する新規実装が誤った番号付けを採用するリスクがある

## 問題

fixture の分割番号割当（①=bun test ./src/〔src 側〕・②=bun test ./.opencode/skills/repo-agentdev-integrity/scripts/〔integrity suite〕・③=plugins 系）が QG-4 正規形（①=integrity suite・②=src 側・③=plugins 系・qg-4-final-acceptance.md L320-324・L328-331 実測）と入れ替わっている（fixture は close_mechanical_steps.test.ts L445-470・実測で分割①②の対象入れ替わりを再現確認）。Case #4054・OU-001 で発見時に Issue スコープ外のため Capture 提案として申告済み

## 望ましい変更

fixture 標本値を QG-4 正規形の分割番号割当へ整合させる（fixture 変更とテスト期待値の同時更新）

## 対象範囲

### 対象

- close_mechanical_steps.test.ts の completeMachineAcceptanceRecord fixture（分割番号割当）
- 同一テストの期待値

### 対象外

- QG-4 正規形文書（qg-4-final-acceptance.md）の分割番号割当変更（正規形を正とする）
- 機械工程 script の分割実行ロジック変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill scripts tests | src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts（completeMachineAcceptanceRecord） | 分割番号割当を QG-4 正規形へ整合（fixture+テスト期待値の同時更新） |

## 既存対策確認

- **確認結果**: 対策なし
- **該当ファイル**: src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts（L445-470・QG-4 正規形 qg-4-final-acceptance.md L320-324 と不整合を実測確認）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 標本 fixture の分割番号割当が QG-4 正規形と入れ替わり（①②の対象が反転）・標本と正規形の整合規律が不在

## 制約

- fixture は構造標本値で判定に件数の実在性を含まない（OU-001 申告どおり・現行維持判断の実績あり）ため、本整合は標本の規範性の是正であり機械判定の変更ではない
- テスト期待値の追随更新を同一 PR で実施する（REQ-047 系の契約テスト追随に整合）

## 受け入れ条件

- [ ] fixture の分割番号割当が QG-4 正規形（①=integrity suite・②=src 側・③=plugins 系）と一致していること
- [ ] bun test 実行で当該テストが期待値変更後に pass すること
- [ ] 標本を参照する実装・文書に番号割当の不整合が残存しないこと

## 元learning item / 根拠

- **要約**: 機械受理基準標本 fixture の分割番号割当が QG-4 正規形と入れ替わっている（①②反転・review で実測再現）
- **根拠**: qg-4-final-acceptance.md L320-324・L328-331 と close_mechanical_steps.test.ts L445-470 の対照読取実測（STEP-4 review Stream B が実測で欠陥再現・2026-11-15）
- **再発条件**: 標本 fixture を参照して分割番号を解釈する工程・fixture を流用する新規実装
- **横展開可能性**: 機械受理基準の標本を流用する実装・文書で同じ入れ替わりが再現される恐れがある。正規形と標本の整合規律として横展開可能

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: Epic #4054・Issue #4052・PR #4062 本文 Findings
