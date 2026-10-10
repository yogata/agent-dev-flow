---
name: agentdev-adopted-conventions
description: Deterministic resolver for adopted conventions (adopted processes, process relations, required artifacts): declaration parsing, transition-default connection, and the non-adoption / no-pass-by-absence judgment rules. USE FOR: resolving a project's adopted processes and required artifacts as the basis of target work, judging artifact presence without counting un-adopted reference examples as missing, blocking pass-by-absence for required artifacts, keeping obligations across process splits/merges/omissions, running both single-process and end-to-end execution from one common-duty model. DO NOT USE FOR: authoring or editing the declaration itself as a policy decision, system-model design content, WBS/schedule/progress management, permanent process-progress ledgers, workflow orchestration, traceability coverage checks.
---

# agentdev-adopted-conventions

本スキルは採用規約（プロジェクトが採用した詳細工程・工程間関係・必須成果物）を宣言・保存・解決する機構の、決定的解決器とその利用知識を提供する。
工程構成に基づいて成果物の有無・成立を判定するすべての作業（Case 実行、品質ゲート、docs 診断等）から参照される。

モデル・判定規則の規範は producer 側リポジトリの ADF v5 採用規約機構 Design（v5-adopted-conventions）が所有する。本スキルはその利用知識と実行能力を提供し、規範の独立定義を行わない。

## モデルの基本（採用規約の 3 構成要素）

採用規約は、プロジェクトが採用した次の 3 要素の宣言的集合である。

| 構成要素 | 内容 |
|---|---|
| 採用済み工程 | プロジェクトが必須として採用した詳細工程の種別と範囲 |
| 工程間関係 | 採用済み工程間の順序・依存・上位下位関係 |
| 必須成果物 | 採用済み工程ごとに必須とする成果物と、その成立条件 |

採用規約は宣言的である。参照モデルの工程を既定で必須化せず、採用されていない工程・成果物は判定基準に含まれない。
工程構成の説明（プロセスモデル）と対象システムの設計内容（システムモデル）は別の関心として区別する。本スキルはプロセスモデル側のみを扱い、設計内容を所有しない。

## 宣言と保存

採用宣言は対象プロジェクトの root から到達できる正規ファイルとして保存する。既定の配置先は `.agentdev/adopted-conventions.yaml` である（`--file` で上書き可能）。会話・記憶・一時コンテキストを保存先としない。

宣言には採用の適用開始点（`adoptedAt`）と 3 構成要素（`processes`、`requiredArtifacts`、`exclusions`）を含める。schema の詳細は本ディレクトリの scripts/lib/schema.ts の実装が正であり、未知キー・参照不整合・継承義務欠落は silent skip せず検出する。

工程の分割・統合（再構成）を宣言する場合（`restructuredFrom`）、元の要求・制約・受け入れ条件・検証義務の継承宣言（`inheritsObligations`）が必須である。継承宣言なし・空宣言の再構成は schema 違反として拒否する（fail-closed）。

工程の省略は、採用規約上の採用外・省略の明示（`exclusions`、根拠必須）または対象作業の実行契約における根拠ある除外宣言によってのみ成立する。

## 解決手順

解決は次の 3 段階である。

1. **採用宣言の確認**: 宣言が存在する場合はそれを正規の採用規約として解決する。存在しない場合は移行期デフォルトへ接続する（次節）。読取不能・schema 不適合の場合は解決を実行不能とする（判定を下さず判断留保。全要件の不存在や全工程の省略として解釈しない）
2. **基準の特定**: 採用規約から、対象作業に適用される採用済み工程・工程間関係・必須成果物を特定する。参照モデル（未採用の例示）は基準の特定の入力にしない
3. **判定**: 特定した必須成果物を判定基準として、対象作業の成果物の有無と成立根拠を判定する

## 移行期デフォルトとの接続

プロジェクトが採用宣言を行うまでの間は、当該プロジェクトの現に実効している工程・成果物の運用を採用済み規約として扱う。resolver は移行期デフォルトへ接続した旨と参照点（現行の正規成果物から解決すること）を返し、判定自体は下さない（判断留保）。現行運用の意味判断は呼出側の実行契約が行う。採用宣言が行われた後は、採用宣言を正規基準として解決する。

## 判定規則（2 条）

1. **誤判定禁止**: 採用されていない参照例の工程・成果物が存在しないことを、欠落と判定しない。基準に含まれない成果物の不在は `not-in-criteria`（正）として返す
2. **省略合格禁止**: 採用済みで必須の成果物が存在しない場合、ファイル不在だけを根拠に工程省略として合格させない。不在は `missing`（合格禁止・根拠確認要求）として検出し、採用規約上の省略明示または根拠ある除外宣言を経てのみ `excluded-with-basis` に解消する。根拠確認を経ない不在は欠落のままである

## 公開操作契約（スクリプト一覧）

共通の I/O 契約: 入力は argv、出力は stdout の JSON、実行エラーは非ゼロ終了コード + stderr。同一コーパスから同一の JSON を返す（決定的）。`--root` は採用宣言を配置した対象プロジェクトのルート（絶対パス推奨）。scripts ディレクトリを cwd に起動することを前提とする。

```bash
# 解決（採用宣言の確認と基準の特定）
bun src/resolve.ts --root <project-root> [--file <declaration-path>] [--scope <process-id>]

# 判定（基準に対する対象成果物の有無と成立根拠）
bun src/evaluate.ts --root <project-root> [--file <declaration-path>] [--scope <process-id>] [--check-path <artifact-path>] [--exclude <process>:<artifact-path>:<reason>]
```

- `resolve.ts` の出力: `basis`（`adopted` / `transition-default` / `unresolvable`）と、adopted の場合は特定済み基準 `criteria`（採用済み工程、工程間関係 `processRelations`、必須成果物、継承義務 `inheritedObligations`）
- `evaluate.ts` の出力: `outcome`（`judged` / `judgment-deferred` / `unresolvable`）。judged の場合は `verdicts`（各成果物の `pass` / `excluded-with-basis` / `missing` / `not-in-criteria`）、合格可否 `accepted`、集計 `summary`
- `--scope`: 判定対象工程の部分集合（単独工程の実施）。scope 内工程の前置依存も基準に含める（依存切断で義務を失わせない）
- `--check-path`: 存在確認の対象パスを限定する。基準に含まれないパスは `not-in-criteria` として明示的に返す
- `--exclude`: 対象作業の実行契約由来の根拠ある除外宣言。採用規約上の省略明示（`exclusions`）の代替ではなく、空の根拠では成立しない

## 責務境界

| 関心 | 正規所有 |
|---|---|
| 採用規約の宣言・保存・解決の構造、移行期デフォルトとの接続、判定規則 | v5 採用規約機構 Design |
| 本スキルが所有する | 機械的解決器（宣言解析、schema 検証、基準特定、判定規則の決定的実行）とその利用知識 |
| 採用方針の決定（何を採用するか） | プロジェクト方針。本スキルは宣言された内容を解決するのみ |
| 対象システムの設計内容（システムモデル） | 対象プロジェクトの設計成果物 |
| 工程の実行・進捗管理 | 呼出側 workflow。本スキルは工程進捗の恒久状態を保持しない |
| 対応関係の完全性検査 | トレーサビリティ標準配布スキル |

## See Also

- 本ディレクトリ `scripts/README.md`: 実行方法と構成の詳細
