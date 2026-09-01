# 配布依存境界 checker と baseline 運用の整備（9件統合）

## 背景

配布依存境界 checker（distribution-boundary-guard）の分類・baseline 運用に係る未整備・残存が9件指摘されている。tests/ 除外（809292c5）済みの根因レベルの課題と、baseline 整備・残渣 cleanup が混在。

## 問題

- concrete ID 残存（README L3・plugin.ts L7 等10件）により release archive が exit 6 でブロック継続
- ir-055-baseline.json / ir-059-baseline.json の整備不足（entries 空・該当エントリなし）
- checker の repo-local モデル、outside-root 挙動、jtw 特例残存15ファイル、tmp-plugin-local-* 追跡残渣
- japanese-tech-writing の実取得未実行（third-party-sync 未実施）

## 望ましい変更

- concrete ID の cleanup（プレースホルダ・Design 参照表記へ）と baseline エントリ整備
- checker の repo-local モデル整備・outside-root over-block の解消方針確定・jtw 特例の一般化
- tmp 残渣削除と生成抑止
- third-party-sync の実取得実行（japanese-tech-writing のメイン環境配置）

## 対象範囲

### 対象

| item | 対応 |
|---|---|
| distribution-baseline-concrete-id-cleanup | concrete ID 残存の cleanup＋inspect-skills L59 unclassified-entry の baseline 登録判断 |
| package-release-archive-exit6-blocked | release ブロックの根因（同一）解消 |
| ir055-baseline-dec023-third-party-sync-skill | SKILL.md L89 DEC-023 参照の是正（inspect F-18 統合）＋ baseline 整備 |
| ir059-false-positive-suppression-adf-covers | IR-059 suppression の整備方式（baseline 登録 or checker 修正） |
| distribution-boundary-checker-repo-local-model-mismatch | repo-local モデルと detector 列挙の整合（設計判断） |
| distribution-boundary-guard-overblock-temp | outside-root の over-block 解消方針 |
| checker-impl-residual-jtw-specialcase | jtw 特例残存15ファイルの一般化方針 |
| gh-tool-tests-tmp-plugin-leftovers | tmp-plugin-local-* 5件の削除＋生成抑止 |
| third-party-sync-runtime-acquisition-pending | japanese-tech-writing の実取得実行 |

### 対象外

- tests/ 除外（809292c5 で実施済み）
- checker 仕様の大規模変更（方針確定後の別 Case）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/designs/local/runtime-package-boundary.md、配布依存境界 Design | repo-local モデル・over-block 方針の反映 |
| skill | src/opencode/skills/agentdev-workflow-third-party-sync/SKILL.md | DEC-023 参照の処理（inspect F-18 と統合） |
| baselines | src/opencode/skills/repo-agentdev-integrity/baselines/*.json | baseline エントリ整備 |

## 既存対策確認

- **確認結果**: 検出器・baseline 機構は既存、整備が未了
- **ギャップ分類**: fix gap（残存 cleanup・baseline 未整備）

## 制約

- baseline 変更は既知残存の記録として行い、新規違反を隠蔽しない
- 実取得（network）は third-party-sync コマンド経由で実行

## 受け入れ条件

- [ ] concrete ID 残存10件が解消され release archive が exit 0 になる
- [ ] baseline 整備の方式が確定し適用されている
- [ ] tmp 残渣が削除されている
- [ ] japanese-tech-writing がメイン環境に配置されている

## 元learning item / 根拠

- **根拠**: 各 intake item の現状確認（git ls-files・baseline JSON・SKILL.md 行番号実証済み）
- **横展開可能性**: 配布依存境界 gate 運用全般

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: integrity, distribution
- **関連Issue**: なし
