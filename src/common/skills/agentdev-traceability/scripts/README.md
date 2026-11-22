# `agentdev-traceability` scripts

トレーサビリティ標準配布スキルの決定的エンジン。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── declarations.ts       # ADF-COVERS 対応宣言の解析（4役割、正規宣言位置の行単位パターン照合、prose 対象外、意味推定なし）
│   ├── links.ts              # ADF-LINKS 隣接工程間対応宣言の解析（inline 宣言 + sidecar links セクション、upstream 方向のみ）
│   ├── sidecar.ts            # traceability/ 配下 sidecar の読み込みと論理対応関係への正規化（covers + links、最小データ、YAML 標準 API 委譲）
│   ├── corpus.ts             # 正規成果物コーパスの直接走査（inline .md/.ts + traceability/ 配下 sidecar YAML、派生 Graph 非依存）
│   ├── requirements.ts       # 現行要件行ID（docs/requirements/REQ-{NNNN}.md）の収集
│   ├── verification_scope.ts # 検証スコープポリシー（traceability/policy.yaml）の解析・解決（不在時は全行必須、fail-closed）
│   ├── query.ts              # coverage・impact の公開契約（純粋関数、4役割の役割付き対応関係）
│   ├── check.ts              # check の12種検査（純粋関数、Decision 欠落非計上、links 完全性検査なし、structuralOnly）
│   ├── inventory.ts          # 棚卸し（直接走査での宣言外候補発見、advisory）
│   ├── reuse.ts              # 証拠再利用の構造的適用可否確認（合格判定なし、manualConfirmation 明示）
│   ├── derivations.ts        # 対応宣言の導出機構（traceability/derivations.yaml の導出規約に基づく検証対応の決定的導出）
│   └── cli_utils.ts          # argv 解析、JSON 出力、エラー終了
└── src/
    ├── coverage.ts       # CLI: coverage
    ├── impact.ts         # CLI: impact
    ├── check.ts          # CLI: check
    ├── links.ts          # CLI: links（隣接工程間対応の双方向追跡）
    ├── inventory.ts      # CLI: inventory（棚卸し）
    ├── reuse.ts          # CLI: reuse（証拠再利用確認）
    └── derivations.ts    # CLI: derivations（導出実行と重複・矛盾の決定的検出、恒常 checker）
```

`lib/`（解析コア）と `src/`（CLI）の分離により、coverage、impact、check、links、inventory、reuse の外部契約を変えずに、将来キャッシュまたは索引を追加できる。
ユニットテスト（宣言解析に架空の concrete 要件行ID を必要とするため producer 側の非配布領域へ配置）は producer 側リポジトリの検証スイート（`traceability_*.test.ts`）が担う。

## I/O 契約（共通）

- 入力: argv（`--root`, `--req`, `--artifact`, `--evidence`）
- 出力: stdout に JSON
- エラー: 非ゼロ終了コード + stderr にエラーメッセージ（check は検査 fail ありで終了コード 2、実行エラーで 1）
- 決定性: 同一コーパスから同一の列挙順（名前順）・同一の JSON を返す

## 実行方法

`--root` には検証対象リポジトリのルート（`<repo-root>`）を指定する。絶対パスを推奨する。相対パスは実行時のカレントディレクトリ基準で解決される。

実行前提（共通）:

- `--req` は要件行ID（`REQ-{NNNN}-{MMM}`）の個別カンマ指定のみを受理する。`..` 形式の範囲構文は範囲展開されずリテラルの reqId として扱われるため、check の完全性検査（`missing-design` / `missing-implementation` / `missing-verification`）の対象限定が空振りし、未検査の行が存在しないかのような結果を返す。対象行は1つずつ列挙すること
- 本 README のコマンド例は scripts ディレクトリを cwd に起動することを前提とする。worktree を検証対象とする場合は `--root` にその worktree のルートを明示する（相対パス指定の注意は前段のとおり）
- inline 宣言の走査対象は拡張子 `.md` / `.ts` のファイルのみで、除外ディレクトリは `.git`、`.agentdev`、`.agentdev-plugin`、`.worktrees`、`node_modules`。`docs/reports/` 配下は履歴記録領域として走査対象から除外する（checker 実行契約 Design「検出対象除外規定」）。除外ディレクトリ配下や対象拡張子以外のファイルに配置した宣言は計上されない
- sidecar の走査対象は top-level `traceability/` 配下の `.yaml` / `.yml`（`policy.yaml` と `derivations.yaml` を除く。それぞれ検証スコープポリシー・導出規約であり対応関係データではない）。sidecar が参照する成果物はリポジトリ相対パスで存在確認される（checker 実行契約 Design の走査対象方針）
- 導出機構は `traceability/derivations.yaml`（repository-local 導出規約）が存在する場合のみ活性化する。規約不在時は導出が不活性（導出宣言 0・issue 0）。規約の解析不能・schema 不備は check の `derived-declaration-conflicts` として fail-closed に計上する

```bash
# 型チェック
bun run tsc --noEmit

# coverage
bun src/coverage.ts --root <repo-root> --req REQ-{NNNN}-{MMM}
bun src/coverage.ts --root <repo-root> --artifact docs/designs/<path/to/artifact>.md

# impact
bun src/impact.ts --root <repo-root> --req REQ-{NNNN}-{MMM}
bun src/impact.ts --root <repo-root> --artifact src/<path/to/artifact>.ts

# check
bun src/check.ts --root <repo-root>
bun src/check.ts --root <repo-root> --req REQ-{NNNN}-{MMM},REQ-{NNNN}-{MMM}
bun src/check.ts --root <repo-root> --artifact docs/designs/<path/to/artifact>.md

# links（隣接工程間対応の双方向追跡）
bun src/links.ts --root <repo-root> --artifact <repo-relative-path>

# inventory（棚卸しと宣言外候補の発見）
bun src/inventory.ts --root <repo-root>

# reuse（証拠再利用の構造的適用可否確認）
bun src/reuse.ts --root <repo-root> --evidence <repo-relative-path> --revision <identifier>

# derivations（導出実行と重複・矛盾の決定的検出。恒常 checker。検出ありで終了コード 2）
bun src/derivations.ts --root <repo-root>
```

各 CLI の詳細な出力契約は下記「公開操作契約（出力 JSON の要点）」参照。


## 公開操作契約（出力 JSON の要点）

| スクリプト | 出力 JSON の要点 |
|---|---|
| `src/coverage.ts` | 要件起点: 役割付き対応関係の全件（`relations`, `counts`, `truncated: false`）/ 成果物起点: 当該成果物の対応要件（`relations`, `emptyResult`） |
| `src/impact.ts` | 要件起点: 再確認候補 / 成果物起点: `viaRequirements` + `recheckCandidates`。空結果は `emptyResult: true` と `note`（影響なしの証明ではない旨）で明示 |
| `src/relied-diff.ts` | 依拠版に基づく影響分類（`impacts` の4区分 `update` / `up-to-date` / `create` / `unverified` と根拠 `basis`、中間変更の伝播対象 `propagationRequired`）、下流不在の `create`（`downstream`）、再利用証拠の上流整合（`evidence`）、全体反映完了判定（`fullyPropagated`: yes / no / undetermined）。比較基準（依拠版）を特定できない場合は分類を実行せず `fullyPropagated: undetermined` を返す（根拠なしに「影響なし」・「完了」と判定しない） |
| `src/check.ts` | 12種検査の `checks`（項目ごと pass / fail と findings）、`summary`、`structuralOnly: true`（構造検査のみの明示） |
| `src/derivations.ts` | 導出された対応宣言（`derivedDeclarations`）、導出機構の issues（`derivationIssues`）、導出結果と手動宣言の重複・矛盾検査結果（`conflicts`）、`summary`。検出ありで終了コード 2 |
| `src/links.ts` | 当該成果物の `upstream`（下流→上流）と `downstream`（上流→下流・逆引き）の双方向列挙。固定 1 ホップ。空結果は `emptyResult` と `note` |
| `src/inventory.ts` | 直接走査で発見した実在成果物の全件（`corpusArtifacts`）、宣言済み集合（`declaredArtifacts`, `linkedArtifacts`）、宣言外の実在成果物の発見候補（`discoveredCandidates`。advisory・欠落と誤判定しない `note` 付き） |
| `src/reuse.ts` | 証拠成果物の存在・読取可能性、証拠自身の対応関係（`declaredRelations`）、links の双方向（`upstreamArtifacts`, `downstreamArtifacts`）、構造検査で解決しない確認事項（`manualConfirmation`）。適用可否の合格判定は返さない |

## check の12種検査

`malformed-declarations`（sidecar および inline declaration の形式・構文違反）、`unknown-roles`（未知の成果物役割）、`unknown-req-refs`（存在しない要件行への参照。sidecar、inline declaration、policy.yaml の optional 列挙を含む）、`invalid-artifact-paths`（存在しない、または取得不能な artifact path）、`missing-design`（Design 対応の欠落。現行要件行で0件）、`missing-implementation`（実装対応の欠落。現行要件行で0件）、`missing-verification`（検証対応の欠落。検証スコープポリシーが required と判定する現行要件行のみ計上）、`policy-invalid`（検証スコープポリシーの不正。schema 違反、default 値不正、optional 列挙の要件行 ID 形式違反、存在しない要件行の列挙、policy 読取不能）、`duplicate-inconsistencies`（同一論理関係の不整合な重複。同一 artifact パス × role × 要件行 ID の組み合わせが sidecar と inline declaration の間、または同一情報源内で矛盾する状態）、`malformed-links`（隣接工程間対応の宣言形式・構文違反。inline 宣言の形式不備・不明方向、sidecar links セクションの schema 不正）、`dangling-links`（links の source / target 参照先の不存在）、`derived-declaration-conflicts`（導出対応宣言と手動宣言の重複・矛盾。導出された論理関係と同一の手動宣言の共存〔重複〕、導出対象範囲の論理関係で手動宣言と導出結果が部分重複しつつ要件行 ID 集合が一致しない状態〔矛盾〕、導出規約 traceability/derivations.yaml の解析不能・schema 不備を計上。交差なしの共存〔導出に含まれない要件行 ID のみの手動宣言〕は手動付与対象の正当な残存として検出しない）。

## 対応宣言の導出（derivations）

`traceability/derivations.yaml`（repository-local 導出規約）が宣言するテストディレクトリ配下の `.test.ts` について、テスト本文の import 実測と検証対象モジュールへの手動対応宣言（inline + sidecar）から verification 対応を決定的に導出する。導出根拠のないテストは導出せず手動付与対象として残る。導出対象と手動付与対象の境界は traceability-model Design「永続情報と導出可能情報の分離」節が所有する。検証対応要否はトレーサビリティポリシー（policy.yaml）が所有し導出しない。導出された対応宣言も対応関係の存在であり、対応宣言の存在だけを根拠に実現または検証の成立を推定しない（T-003）。
