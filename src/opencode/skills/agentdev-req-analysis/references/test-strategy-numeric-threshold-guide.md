# test strategy 数値閾値策定ガイド

test strategy 策定時に完了条件の数値閾値（LF 数、行数、ファイル数、件数等の定量化基準）を設定する際の具体的指針（REQ-0131-031）。
QG-2（[qg-2-acceptance-criteria-coverage.md](../../../agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md) 観点6「数値閾値到達可能性検証」）と連動し、req-define から case-open まで一貫した数値閾値運用を担保する。

境界ケース #1538/TS-007（LF 数 200 以上、等の数値閾値が対象成果物の自然な構造で到達可能か事前検証が欠けていた事象）に対応する。

## 適用範囲

- 完了条件、テスト戦略 pass_criteria に数値閾値を設定する場合
- 対象となる数値閾値の例: LF 数、ファイル行数、ファイル数、NG 件数、IR 違反件数、coverage %、実行時間 ms

数値閾値を設定しない完了条件（識別子存在、ファイル存在、定性評価等）は本ガイドの対象外。

## 数値閾値策定プロセス

### Step 1: 対象成果物の同種既存例抽出

同じ性質の成果物（同じ SPEC、同じ command、同じ種別のファイル等）で既存のものを抽出する。

- 例: Markdown ファイルの LF 数 → 同ディレクトリの既存 Markdown ファイル群
- 例: command ファイル行数 → `src/opencode/commands/agentdev/` 配下の既存 command 群
- 例: NG 件数 → 過去の検出事項データ（`.agentdev/intake/`、過去 PR 等）

同種例が存在しない場合、類似種別から推定する。類似すらない場合は本 Step で「閾値設定根拠が薄弱」を明示する。

### Step 2: 実測値の取得

抽出した同種既存例を実測する。コマンド例:

- LF 数: `wc -l <file>` または `git ls-files 'path/*.md' | xargs wc -l`
- ファイル行数: `wc -l`
- NG 件数: `rg -c '<pattern>' <path>` または integrity check 実行結果
- coverage: coverage tool 実行結果

実測値は中央値、最小値、最大値を把握する。外れ値（極端に大きい/小さいファイル）は別途扱う。

### Step 3: 対象成果物の自然な構造での到達可能性評価

実測値の分布と、今回の対象成果物の自然な構造（セクション構成、ファイル構成等）を照合し、設定閾値が到達可能か評価する。

評価観点:

- **構造的要件**: 対象成果物が必要なセクション、要素を含むか（Markdown セクション構造、関数群等）
- **同種例との乖離**: 実測値の中央値と設定閾値の比が異常でないか（10 倍以上等の極端な差）
- **過剰/過小でないか**: 閾値が異常に大きい（意味のない水準）、または異常に小さい（実質的に意味を持たない）

### Step 4: 閾値の記述

採用した閾値は test strategy の pass_criteria に記述する。あわせて同種既存例の実測値を参考情報として併記し、設定根拠を明示する。

記述例:

```yaml
- id: TS-001
  target_item: AG-001
  verification: |
    対象ファイルの LF 数を wc -l で計測する
  pass_criteria: |
    対象ファイルの LF 数が {N} 以上であること
    （参考: 同種既存例 central=O, min=A, max=B）
  on_failure: |
    fix-and-reverify。LF 数が閾値に届かない場合、セクション構造を見直し再計測
```

## 数値閾値設定の失敗パターン

参考までに、到達可能性検証が欠けていた事例のパターンを示す:

| 失敗パターン | 症状 | 対策 |
|-------------|------|------|
| 根拠なき高閾値 | 同種例の中央値を大きく上回り、自然な構造で到達不能 | 実測値ベースで閾値を再設定 |
| スナップショット誤用 | 過去某時点の実測値を閾値化したが、現在の構造と不整合 | 最新の同種例を再実測 |
| 平均の罠 | 平均値を閾値化したが、外れ値に引っ張られて中央値から乖離 | 中央値（median）ベースを基本 |
| 範囲無視 | 最小値を下回る閾値で実質意味を持たない | min/max/central の3点を把握 |

## QG-2 観点6 との連動

QG-2（case-open 完了条件網羅性検証）の観点6「数値閾値到達可能性検証」は、本ガイドに従って策定された数値閾値を入力とする。本ガイドで根拠が不明確な閾値は QG-2 で fail または warn となる。

連動フロー:

```
req-define (本ガイドで数値閾値を策定)
  → req-save (test_strategy に数値閾値を保存)
    → case-open Step 2-1 (QG-2 観点6 で到達可能性検証)
      → case-run (test strategy 項目として検証)
        → case-close (QG-4 で最終確認)
```

## See Also

- [qg-2-acceptance-criteria-coverage.md](../../../agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md)（QG-2 観点6 数値閾値到達可能性検証）
- [qg-4-final-acceptance.md](../../../agentdev-quality-gates/references/qg-4-final-acceptance.md)（QG-4 観点8 PR 範囲 vs 全体 判定マトリクス、観点9 識別子中心評価）
- REQ-0131-031（本ガイドの要件根拠）
- 境界ケース #1538/TS-007（LF 数閾値到達可能性、本ガイド策定の契機）
