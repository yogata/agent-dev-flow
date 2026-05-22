# integrity-check 旧名残存検出の除外パス設定

## 背景

大規模 rename（コマンド・スキル・namespace）後に旧名が active guidance（操作手順・次ステップ・delegate 指示）に残存し、実行時エラーや誤動作を引き起こす問題が2回発生（評価スコア 25/40）。integrity-check の旧名残存検出は包括的だが、historical context（ADR 背景・migration table）と active guidance の区別が難しく、除外パス設定がないため誤検出が発生する。

## 問題

integrity-check の旧 namespace 検出で、ADR 背景説明・migration table・integrity-check.md 自身の検出説明文に含まれる旧名も「残存エラー」としてヒットする。これらは historical context であり正当な記載だが、除外パス設定がないため毎回手動で確認・除外する必要がある。

## 望ましい変更

`agentdev-integrity-check` コマンドの旧名残存検出ルールに除外パス設定を追加:
- `docs/adr/` 配下の旧名参照を除外（ADR は歴史的記録）
- `docs/research/` 配下を除外（研究・調査記録）
- integrity-check.md 自身の検出ルール説明を除外
- 除外パスは拡張可能なリスト形式で定義

## 対象範囲

### 対象

- `.opencode/commands/agentdev/integrity-check.md`

### 対象外

- 他のコマンド
- 実際の旧名残存の修正（本スタブは検出精度の向上のみ）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/integrity-check.md` | Step 6 旧名残存検出に除外パスリストを追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/commands/agentdev/integrity-check.md`
- **ギャップ分類**: guardrail insufficiency（除外パス設定が不十分）
- **ギャップ詳細**: Step 6 (lines 85-100) に包括的な旧名検出ルールがあるが、"REQ 関連情報セクションの「旧称」" 以外の除外パス（docs/adr/, docs/research/ 等）が設定されていない

## 制約

- 除外パスの追加は検出精度の向上であり、既存の検出ルール自体は変更しない
- 除外パスリストは将来的に拡張可能な形式にする

## 受け入れ条件

- [ ] 旧名残存検出ルールに除外パスリストが追加されている
- [ ] `docs/adr/` と `docs/research/` が除外パスに含まれている
- [ ] integrity-check.md 自身の検出説明文が除外対象に含まれている
- [ ] 除外パスリストが拡張可能な形式で定義されている

## 元learning item / 根拠

- **要約**: 大規模 rename 後の旧名残存検出における誤検出防止（2件）
- **根拠**: skill rename 後に旧名で delegate して task() 失敗。Namespace 移行後の grep 検証で ADR・integrity-check.md 自身の旧名がヒットし誤判定リスク
- **再発条件**: 大規模 rename 後に旧名参照の残存確認を実施する場合
- **横展開可能性**: 高（大規模 rename を行うプロジェクト全般で発生）

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #292, Issue #306, PR #307
