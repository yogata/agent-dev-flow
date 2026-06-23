# ローカル版 OpenCode レビュー用プロンプト

> 本ファイルは生成先リポジトリに生成された `.opencode/commands/` および `.opencode/skills/` が `src/opencode-local/` 配下の仕様・定義に合致しているか確認するための指示書である。意味仕様の正本は `docs/specs/local-transform.md`。変換仕様の集約は `transform/spec.md` 参照。

## 目的

ローカル版生成（`transform/generate.md` に従う生成）の結果が、`src/opencode-local/` のスキーマ・定義・ガードレールに合致しているかを検証する。必須チェックが1つでも失敗した場合、結果は `FAIL` とする（REQ-0141-028）。部分通過（一部必須項目のみ通過）を `PASS` として扱わない。

## 入力

レビュー対象と参照定義を以下に示す。

| 種別 | 対象 |
|---|---|
| レビュー対象（生成物） | 生成先リポジトリの `.opencode/commands/agentdev/` ・ `.opencode/skills/agentdev-*/` ・ `.opencode/` 配下ひな形 |
| 参照定義（仕様管理リポジトリ） | `src/opencode-local/case-schema/case-file.md` ・ `rules/*.yaml` ・ `transform/spec.md` ・ `generation-flow.md` |
| 正本 SPEC | `docs/specs/local-case-file.md` ・ `docs/specs/local-generation.md` ・ `docs/specs/local-transform.md` |

## 確認対象一覧

以下の6区分について確認する（REQ-0141-028, AG-009）。各項目は必須チェックであり、1つでも失敗すれば結果は `FAIL` となる。

### 1. 生成物の配置と識別子

- [ ] `.opencode/commands/` にローカル版コマンドが生成されていること
- [ ] `.opencode/skills/` にローカル版スキルが生成されていること
- [ ] ローカル版コマンド / スキルが参照するひな形が `.opencode/` 配下に生成されていること
- [ ] 生成物が `src/opencode-local/` 配下に出力されていないこと
- [ ] `.opencode/` が `src/opencode/` 配下へ解決されていないこと（ジャンクション検出安全ゲート）
- [ ] 同名ファイルに `generated_by: local-opencode-transform` の識別情報がある場合のみ再生成・上書きが許可されること
- [ ] 同名ファイルに識別情報がない場合、または異なる識別情報がある場合、生成が停止されること
- [ ] 生成物に `generated_by: local-opencode-transform` の識別情報があること

### 2. GitHub Issue / PR 非依存の確認

- [ ] 生成されたローカル版が GitHub Issue 作成を必須操作として要求していないこと
- [ ] 生成されたローカル版が GitHub PR 作成を必須操作として要求していないこと
- [ ] 生成されたローカル版が GitHub PR 取り込みを必須操作として要求していないこと

### 3. Case ファイル運用の確認

- [ ] ローカル版 `case-open` が `.agentdev/cases/case-{NNNN}.md` を作成すること
- [ ] ローカル版 `case-run` が GitHub PR を作成せず、Case ファイルを更新すること
- [ ] ローカル版 `case-close` が GitHub PR 取り込み / Issue クローズを要求せず、Case ファイルを完了状態に更新すること
- [ ] `SPEC確定候補` と `Findings / Capture候補` が Case ファイルに保持されること

### 4. Case ファイル仕様の準拠確認

- [ ] 状態が `rules/status.yaml` の `status_enum` に従うこと
- [ ] ラベルが `rules/labels.yaml` の `label_enum` から選定されていること
- [ ] 見出しが `rules/headings.yaml` の定義に従うこと（`SPEC確定候補`・`Findings / Capture候補` が必須）
- [ ] YAML 前書きが `rules/frontmatter.yaml` のスキーマに従うこと（7 必須フィールド・禁止フィールドなし）

### 5. 状態遷移の定義確認

- [ ] ローカル版 `case-run` 停止時の `running` から `blocked` への遷移が定義されていること
- [ ] ローカル版 `case-close` 停止時の `review` から `blocked` への遷移が定義されていること
- [ ] ローカル版 `case-run` 停止後の `blocked` → `running` → `review` の再開経路が定義されていること
- [ ] ローカル版 `case-close` 停止後の `blocked` → `review` → `closed` の再開経路が定義されていること

### 6. 残存 GitHub 固有参照の扱い確認

- [ ] 残存する GitHub 固有参照のうち、必須操作・必須入力・必須出力として残るものが違反として扱われていること
- [ ] 背景説明・置換表・対象外・用語上の GitHub 参照が違反として扱われていないこと

## 違反一覧

検出された違反は以下の形式で列挙する。違反とは「必須操作・必須入力・必須出力として残る GitHub Issue / PR 参照」または「確認対象一覧の各必須チェック失敗」を指す。

GitHub 固有参照の違反/非違反判定基準は `transform/spec.md` の「残存 GitHub 固有参照の違反判定基準」参照（REQ-0141-029）。本レビューではこれに「確認対象一覧の必須チェック失敗」を加えたものを違反として扱う。

## レビュー結果フォーマット

レビュー結果は少なくとも以下の項目を含む（REQ-0141-028, AG-009）。

| 項目 | 内容 |
|---|---|
| 結果 | `PASS` / `FAIL` |
| 確認した入力 | レビュー対象としたファイル一覧 |
| 違反一覧 | 検出された違反のリスト（対象・違反内容） |
| 警告 | 違反ではないが注意が必要な事項 |
| 確認済み要件 | 確認対象一覧の各項目に対する判定結果 |
| 最終判定 | 総合判定とその根拠 |

### レビュー結果の例

```markdown
## レビュー結果

- 結果: FAIL
- 確認した入力:
  - .opencode/commands/agentdev/case-open.md
  - .opencode/commands/agentdev/case-run.md
  - .opencode/commands/agentdev/case-close.md
  - .opencode/skills/agentdev-*/SKILL.md (N 件)
- 違反一覧:
  - 対象: .opencode/commands/agentdev/case-run.md
    違反内容: case-run が gh pr create を必須操作として要求している（必須操作の GitHub PR 参照）
- 警告:
  - なし
- 確認済み要件:
  - 1. 生成物の配置と識別子: PASS
  - 2. GitHub Issue / PR 非依存の確認: FAIL
  - 3. Case ファイル運用の確認: PASS
  - 4. Case ファイル仕様の準拠確認: PASS
  - 5. 状態遷移の定義確認: PASS
  - 6. 残存 GitHub 固有参照の扱い確認: FAIL
- 最終判定: FAIL（区分2・6で違反を検出。case-run が GitHub PR 作成を必須操作として残している）
```

## 必須チェック失敗時の扱い

冒頭の規定（必須チェック1件でも失敗で `FAIL`・部分通過の `PASS` 扱い禁止）に従う。`FAIL` の場合は生成物を修正して再レビューし、再レビューでも `FAIL` の場合は利用者に手動確認を促す。

## 関連項目

- [変換用プロンプト](generate.md) — ローカル版生成の指示書
- [変換仕様](spec.md) — 変換対象一覧・ガードレール一覧・レポートフォーマットの集約
- [Case ファイルスキーマ定義](../case-schema/case-file.md) — ローカル Case ファイルの構造
- `docs/specs/local-transform.md` — レビュープロンプト要件の正本
- REQ-0141 — ローカル版 OpenCode 生成方式とローカル Case ファイル運用の要件定義
