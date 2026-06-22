# 実行主体分類の査読

> **原本**: [docs/specs/writing-style.md](../../../../../docs/specs/writing-style.md)「実行主体分類の査読基準」。本ファイルは判定表・誤認パターン・検出チェックリストの運用ビューである。原本と内容が重複する場合は原本を優先する。

## 適用範囲

SPEC / command / skill / AGENTS.md 等の記述で言及される実行主体の分類が正確かを査読する。実行主体の誤認は `load_skills` への誤指定や文書種別間の委譲契約不整合を引き起こすため、静的査読で検出する。

## 実行主体の分類

| 分類 | 説明 | 判定方法 |
|---|---|---|
| command | ユーザーまたはプロンプトから実行される命令（`/agentdev/*`, `/ulw-loop` 等） | 先頭に `/` を持つ、または prompt 内で実行指示として記述される |
| skill | `load_skills` で指定される、モデルが参照する判断補助・実行知識（`agentdev-*`） | `agentdev-*` プレフィックスを持ち、`SKILL.md` を持つ |
| subagent | `task(subagent_type=...)` で起動されるエージェント型 | `task()` の `subagent_type` 引数に指定される |
| harness | 外部実行エンジン・OpenCode プラグイン（oh-my-openagent 等） | OpenCode プラグインとして提供される実行エンジン |

## 誤認パターン

| 誤認 | 例 | 委譲契約上の影響 |
|------|----|------------------|
| command を skill と呼ぶ | `/ulw-loop` を skill と記述、`load_skills=["ulw-loop"]` と指定 | command 名が `load_skills` に指定され実行時エラー・契約不整合を引き起こす |
| harness を skill と呼ぶ | oh-my-openagent を skill と記述 | harness と skill の責務境界が曖昧になり、委譲契約の SSoT が崩れる |
| subagent を skill と呼ぶ | Sisyphus-Junior を skill と記述 | `task(subagent_type=...)` 起動と `load_skills=...` 参照が混同される |

## 検出チェックリスト

査読対象文書の以下の箇所を順に確認する。

1. **`load_skills` 引数の検査** — `load_skills=["..."]` に指定された名前が `agentdev-*` プレフィックスを持つ skill 名であること。command 名（`/` 先頭・または `/` を持たない command識別子）が指定されている場合は誤認。
2. **`task(subagent_type=...)` 記述の検査** — subagent 型名が skill として言及されていないか。`agentdev-*` skill 名が `subagent_type` に指定されていないか。
3. **`/` 先頭識別子の skill 表記検査** — `/agentdev/*` や `/ulw-loop` 等の command 名が「スキル」「skill」と呼ばれていないか。
4. **harness 名の skill 表記検査** — oh-my-openagent 等、OpenCode プラグインとして提供される実行エンジンが「スキル」「skill」と呼ばれていないか。
5. **委譲契約の主語一貫性** — 委譲元・委譲先の記述で実行主体の分類が一貫しているか（例: case-run は command、Sisyphus-Junior は subagent、agentdev-case-run-execution-adapter は skill、oh-my-openagent は harness）。

## 査読対象外

- 実行時の動的判定（`task()` の実際の起動・`load_skills` の実解決）は本査読の対象外。静的記述の分類正確性のみを検証する。
- 機械的パターンマッチングによる検出は `agentdev-inspect-skills`（REQ-0125-010）および `integrity-rule-catalog.md`（REQ-0108-261）が担う。本査読は意味的・文脈的な誤認検出を担う。

## 出力形式

検出した誤認は [review-output.md](review-output.md) の分類（残す/分割/移送/削除候補）に従い提示する。誤認の修正は「正しい分類名への置換」または「委譲契約記述への置換」とする。実行主体分類の定義・判定基準の原本は [docs/specs/writing-style.md](../../../../../docs/specs/writing-style.md) を参照する。
