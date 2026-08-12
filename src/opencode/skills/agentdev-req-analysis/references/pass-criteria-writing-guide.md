# pass_criteria 記述基準

test strategy 策定時に pass_criteria を記述する際の指針。
REQ content が pipeline stage によって表現を変えることに起因する QG-{N} 評価時の食い違いを防ぐ（AG-{NNN}）。

agentdev-req-analysis SPEC「pass_criteria 記述基準」を正規原本とし、本ファイルは詳細、実例を補完する。

## 適用範囲

- test strategy の pass_criteria 策定時
- 複数 REQ にまたがる共通 pass_criteria、変更対象外 REQ 検証の pass_criteria を含む
- 完了条件チェックボックスの記述にも適用可能

数値閾値（LF 数、行数、件数等）の策定は [test-strategy-numeric-threshold-guide.md](test-strategy-numeric-threshold-guide.md) を参照。本ガイドは表現、検証対象の使い分けに限定する。

## pipeline stage モデル

AgentDevFlow では REQ content が以下の pipeline stage 間で表現を変える（ワークフロー契約 SPEC「マクロフェーズ」参照）:

| pipeline stage | REQ content の表現 |
|---|---|
| draft（壁打ち） | 要件doc 本文、要件テーブル |
| Issue 本文（構造的実行） | Issue 完了条件、要約 REQ 行 |
| PR 本文（レビュー完了） | 実装概要、変更ファイル一覧 |

各 stage で助詞、見出し表記、句の順序が自然に変化する。pass_criteria が特定 stage の文字列表現に依存すると、他 stage での評価で食い違いが生じる。

## 意味的等価許容

### 判定要件

pass_criteria は以下を満たすことで意味的等価性を担保する:

1. **核心の表現**: 対象 REQ content の核心（対象、状態、振る舞い）を過不足なく表現する
2. **文字列表現の差異許容**: 見出し表記、助詞、句読点、句の順序の差異は意味的等価性を妨げない
3. **識別子一致**: REQ ID、ファイルパス、セクション名等の識別子は一致を必須とする

### 記述例

要件「agentdev-req-analysis SPEC は pass_criteria 記述基準セクションを持つこと」に対する pass_criteria:

```yaml
# ✅ 許容される表現
pass_criteria: |
  agentdev-req-analysis SPEC に pass_criteria 記述基準セクションが追加されていること

# ✅ 許容される表現（表現差異あり、意味的等価）
pass_criteria: |
  「pass_criteria 記述基準」セクションが存在すること

# ❌ 許容されない表現（識別子不一致）
pass_criteria: |
  記述基準セクションが存在すること
  # "pass_criteria" が識別子から外れ、対象セクションが特定できない
```

### QG-{N} との連動

QG-{N} は意味的等価性で pass_criteria 充足を判定する（[qg-4-final-acceptance.md](../../agentdev-quality-gates/references/qg-4-final-acceptance.md) 観点6「test strategy 処理完了」、観点9「識別子中心評価の運用実例集」）。req-define は意味的等価を許容する表現で pass_criteria を策定することで、QG-{N} 評価時の食い違いを未然に防ぐ。

## 「存在しないこと」と「変更されていないこと」の使い分け

pass_criteria が「存在」「変更」を検証する場合、対象に応じて表現を使い分ける。誤用は QG-{N} 評価で検証不能、または無意味な検証となる。

### 使い分け表

| pass_criteria 表現 | 適用対象 | 検証方法 | 典型例 |
|---|---|---|---|
| 「存在しないこと」 | 新規作成禁止 | 当該識別子、ファイルが存在しないことを確認（`glob`、`grep` で0件、`test -f` で偽） | 「REQ-{NNNN} が存在しないこと」「新規ファイル X が存在しないこと」 |
| 「変更されていないこと」 | 既存 REQ、既存ファイルの変更がないこと | 当該ファイルに diff がないことを確認（`git diff --quiet` で終了コード0） | 「REQ-{NNNN} が変更されていないこと」「既存 SPEC ファイル X が変更されていないこと」 |

### 誤用例

- ❌「既存 REQ-{NNNN} が存在しないこと」
  - 既存 REQ は存在するため、検証が常に偽となり有意でない
  - 意図が「当該 REQ を変更しないこと」であれば「変更されていないこと」を使用する
- ❌「新規ファイル X が変更されていないこと」
  - 存在しないファイルは diff 対象にならない
  - 意図が「X を新規作成しないこと」であれば「存在しないこと」を使用する

### 正用例

- ✅「新規予定 REQ-{NNNN} が存在しないこと」
  - 当該 REQ を新規作成しないことの検証として有意
  - 検証: `glob docs/requirements/REQ-{NNNN}.md` が0件
- ✅「既存 REQ-{NNNN} が変更されていないこと」
  - 既存 REQ に diff がないことの検証として有意
  - 検証: `git diff --quiet docs/requirements/REQ-{NNNN}.md` で終了コード0

## 共通 pass_criteria と正規所有

複数 REQ にまたがる共通 pass_criteria リスク、REQ 個別期待値推奨、変更対象外 REQ 検証の正しい表現、存在確認の使用条件の運用基準は agentdev-workflow-templates SPEC「test strategy 記述ガイドライン」を正規所有とする。本ガイドは意味的等価許容、存在確認と diff 確認の使い分けに限定する。

## See Also

- agentdev-req-analysis SPEC「pass_criteria 記述基準」（正規原本）
- [test-strategy-numeric-threshold-guide.md](test-strategy-numeric-threshold-guide.md)（数値閾値策定ガイド）
- [qg-4-final-acceptance.md](../../agentdev-quality-gates/references/qg-4-final-acceptance.md)（QG-{N} 最終受け入れゲート）
- [qg-2-acceptance-criteria-coverage.md](../../agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md)（QG-{N} 完了条件網羅性）
