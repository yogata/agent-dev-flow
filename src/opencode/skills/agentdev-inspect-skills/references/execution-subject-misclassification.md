# 実行主体分類誤認の判定基準

> **原本**: [docs/specs/document-type-responsibilities.md](../../../../../docs/specs/document-type-responsibilities.md)「実行主体分類の査読基準」。本ファイルは inspect-skills 診断観点「実行主体分類の誤認」（REQ-0125-010）の判定基準詳細を集約する運用ビューである。原本と内容が重複する場合は原本を優先する（REQ-0125-004）。

## 適用範囲

Command→Skill 参照妥当性診断で、文書内で言及される実行主体（command / skill / subagent / harness）の分類が正確かを診断する。
実行主体の誤認は `load_skills` への誤指定や委譲契約不整合を引き起こすため、本診断観点で検出する。


機械的パターンマッチングによる検出（`load_skills` 誤指定、`/` 先頭識別子の skill 表記）は `docs/specs/integrity-rule-catalog.md`（IR-050、IR-051、REQ-0108-261）が担う。
本診断はより複雑な文脈依存の誤認（command と skill の混同等）を担う。

## 実行主体の分類

| 分類 | 説明 | 判定方法 |
|---|---|---|
| command | ユーザーまたはプロンプトから実行される命令（`/agentdev/*`, `/ulw-loop` 等） | 先頭に `/` を持つ、または prompt 内で実行指示として記述される |
| skill | `load_skills` で指定される、モデルが参照する判断補助、実行知識（`agentdev-*`） | `agentdev-*` プレフィックスを持ち、`SKILL.md` を持つ |
| subagent | `task(subagent_type=...)` で起動されるエージェント型 | `task()` の `subagent_type` 引数に指定される |
| harness | 外部実行エンジン、OpenCode プラグイン（oh-my-openagent 等） | OpenCode プラグインとして提供される実行エンジン |

## 誤認パターンと診断分類

| 誤認パターン | 例 | 診断分類 |
|---|---|---|
| command を skill と呼ぶ | `/ulw-loop` を skill と記述、`load_skills=["ulw-loop"]` と指定 | execution-subject-misclassification |
| harness を skill と呼ぶ | oh-my-openagent を skill と記述 | execution-subject-misclassification |
| subagent を skill と呼ぶ | Sisyphus-Junior を skill と記述 | execution-subject-misclassification |
| skill を command と呼ぶ | `agentdev-doc-writing` を `/agentdev-doc-writing` と記述 | execution-subject-misclassification |
| skill を subagent と呼ぶ | `agentdev-case-run-execution-adapter` を subagent_type に指定 | execution-subject-misclassification |

## 診断手順

### 1. `load_skills` 引数の検査

`load_skills=["..."]` に指定された各要素について、以下を確認する。

- `/` 先頭形式（`/ulw-loop` 等）が含まれる → **誤認確定**（command 名が skill 名として指定されている）
- `agentdev-*` プレフィックスを持たない識別子が含まれる → **誤認候補**（command 名、harness 名、subagent 名の可能性）。文脈確認が必要
- `agentdev-*` プレフィックスを持つ → **OK**（skill 名として正当）

機械的検出（IR-050）と重複するが、本診断は文脈判断（command 名の既知性、委譲契約上の役割）を含む。

### 2. `task(subagent_type=...)` 記述の検査

`task(subagent_type="<X>")` に指定された `X` について、以下を確認する。

- `X` が `agentdev-*` プレフィックスを持つ → **誤認候補**（skill 名が subagent 型として指定されている可能性）
- `X` が OpenCode プラグイン提供のエージェント型名（`Sisyphus-Junior` 等）→ **OK**

### 3. `/` 先頭識別子の skill 表記検査

文書中の `/agentdev/*` や `/ulw-loop` 等の command 名が出現する文脈で、「スキル」「skill」という表記が併用されていないかを確認する。
機械的検出（IR-051）と重複するが、本診断は文脈判断を含む。

例:
- ❌ 「`/ulw-loop` スキルを呼び出す」（command を skill と呼ぶ誤認）
- ❌ 「`/ulw-loop` skill」（同上）
- ✅ 「`/ulw-loop` command を委譲 prompt 内で指定する」（正しい分類）

### 4. harness 名、subagent 名の skill 表記検査

文書中の `oh-my-openagent`（harness）や `Sisyphus-Junior`（subagent）等の名前が出現する文脈で、「スキル」「skill」という表記が併用されていないかを確認する。
機械的検出（IR-051）と重複するが、本診断は文脈判断を含む。

例:
- ❌ 「oh-my-openagent スキル経由で起動する」（harness を skill と呼ぶ誤認）
- ❌ 「Sisyphus-Junior skill」（subagent を skill と呼ぶ誤認）
- ✅ 「oh-my-openagent（OpenCode プラグイン、harness）経由で起動する」（正しい分類）

### 5. 委譲契約の主語一貫性

委譲元、委譲先の記述で実行主体の分類が一貫しているかを確認する。
例: case-run は command、Sisyphus-Junior は subagent、agentdev-case-run-execution-adapter は skill、oh-my-openagent は harness。
これらの分類が委譲契約記述全体で一貫しているかを検査する。


## 出力形式


検出した誤認は SKILL.md「出力形式」セクションの Finding 形式で報告する。
Classification には `execution-subject-misclassification` を使用する。
Recommended route には `command` / `skill` / `references` のいずれかを提示する（誤認の修正先が command 定義、skill 本文、references のいずれかによる）。

## 対象外

- 実行時の動的判定（`task()` の実際の起動、`load_skills` の実解決）は本診断の対象外。静的記述の分類正確性のみを検証する。
- 機械的パターンマッチングによる検出は `docs/specs/integrity-rule-catalog.md`（IR-050、IR-051、REQ-0108-261）が担う。本診断は意味的、文脈的な誤認検出を担う。
- 文書品質査読時の実行主体分類は `agentdev-doc-writing`（REQ-0140-027）が担う。本診断は Command→Skill 参照妥当性診断の文脈での誤認検出を担う。
