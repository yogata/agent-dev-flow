# overlap警告を構造化結果から正しく要約する

## 背景

case-ready 受入検査で `accept_definition_checks.ts` の overlap summary は `warnings=0` と報告したが、同じ step の stdout には `condition_a.warnings=1` が記録されていた。consumer が summary を使うと実在する警告の提示記録が欠落する。

## 問題

overlap engine の警告は `condition_a.warnings` に格納される一方、summary 生成側が不在の top-level `warnings` を読み、常に0件と表示する。

## 望ましい変更

summary が engine の構造化結果と detection-unavailable 状態を正しく反映し、消費側の手順では summary だけでなく保存済み stdout 原証跡から警告を確定できるようにする。実現方法は下流の変更影響分析で決定する。

## 対象範囲

### 対象

- overlap-cross-check の構造化警告結果と要約表示
- 原証跡を参照する consumer 側の警告確認手順

### 対象外

- overlap 警告の無視・抑制
- summary を gate 原結果や stdout の代替とすること

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| script / 配布skill | `agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts`、同 references | 警告要約と原証跡消費の候補 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `agentdev-workflow-case-ready/references/definition-acceptance.md`、overlap engine の報告契約
- **ギャップ分類**: fix gap
- **ギャップ詳細**: engine の警告は `condition_a.warnings` にネストされるが、summary は `parsed.warnings` を読むため件数を落とす。原証跡を機械再解析する consumer 規律も必要である。

## 制約

summary の不具合を根拠に警告を隠さず、gate の結果意味論を別途合意なく変更しない。原 stdout を証跡の正として保持する。

## 受け入れ条件

- [ ] summary が `condition_a.warnings` の実件数を反映する。
- [ ] unavailable 状態を0件と誤表示しない。
- [ ] consumer は警告確認時に保存済み stdout 原証跡を検査する。

## 元learning item / 根拠

- **要約**: engine が警告1件を返したのに overlap summary が0件と表示した。
- **根拠**: inbox の E13、Case #3682、PR #3685、および `cross_dependency_types.ts` の報告契約。
- **再発条件**: overlap engine が1件以上の警告を返す状態で `accept_definition_checks.ts` の summary を使う場合。
- **横展開可能性**: 構造化報告を summary へ変換し、その結果を consumer が使う品質ゲート全般。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: #3680
