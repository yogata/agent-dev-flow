# `agentdev-artifact-semantics` scripts

成果物の意味と工程別正式確定の決定的判定器。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── roles.ts             # 成果物役割（要求・Decision・設計・実装・検証）の決定的判定（宣言優先・配置規約補助・複数役割許容）
│   ├── conventions.ts       # 採用規約の解決（採用宣言 YAML → 移行期デフォルトへの接続）
│   ├── coverage-report.ts   # agentdev-traceability coverage CLI 出力の消費用型と検証
│   ├── design-basis.ts      # 採用規約に基づく設計根拠の判定（欠落検出・妥当性非合格の構造保証）
│   ├── finalization.ts      # 工程別正式確定の判定と要求充足の別判定
│   └── cli_utils.ts         # argv 解析、JSON 出力、エラー終了
├── src/
│   ├── classify.ts          # CLI: classify
│   ├── design-basis.ts      # CLI: design-basis
│   └── finalize.ts          # CLI: finalize
└── tests/
    ├── roles.test.ts
    ├── design-basis.test.ts
    └── finalization.test.ts
```

対応宣言（covers）の解析は所有しない。`agentdev-traceability` coverage CLI の出力を
入力として消費する（宣言解析の正規所有者は agentdev-traceability）。

## I/O 契約（共通）

- 入力: argv（`--root` と各操作のパラメータ）
- 出力: stdout に JSON
- エラー: 非ゼロ終了コード + stderr にエラーメッセージ
- 決定性: 同一入力から同一の JSON を返す

## 実行方法

`--root` には検証対象リポジトリのルートを指定する。絶対パスを推奨する。
相対パスは実行時のカレントディレクトリ基準で解決される。

```bash
# 型チェック
bun run tsc --noEmit

# 成果物役割の判定（classify）
bun src/classify.ts --root <repo-root> --files docs/designs/x.md,src/y.ts

# 設計責務判定（design-basis）
# 事前に coverage 報告を生成する
bun ../../agentdev-traceability/scripts/src/coverage.ts --root <repo-root> --req REQ-{NNNN}-{MMM} > /tmp/coverage.json
bun src/design-basis.ts --root <repo-root> --req REQ-{NNNN}-{MMM} --coverage-report-file /tmp/coverage.json [--adopted <conventions.yaml>]

# 工程別正式確定判定（finalize）
# 事前に coverage 報告を生成する
bun ../../agentdev-traceability/scripts/src/coverage.ts --root <repo-root> --artifact <path> > /tmp/coverage.json
bun src/finalize.ts --root <repo-root> --artifact <path> --phase design --upstream REQ-{NNNN}-{MMM} --verification <test.ts> --coverage-report-file /tmp/coverage.json
```

## 判定規約の要点

- 役割判定は成果物の自らの宣言（frontmatter `artifact_roles`）を優先し、宣言が無い
  場合に配置規約の既定役割（要求文書配置 → requirement、Decision 文書配置 →
  decision、Design 文書配置 → design、テスト → verification。各配置の判定は
  producer 側リポジトリの文書種別配置規約に従う）を適用する。
  どちらでも解決できない成果物は unclassified として報告する（誤解決しない）
- 設計根拠判定は coverage 報告の design 宣言を、独立設計書型（Design 文書配置規約に
  従う成果物）と
  代替成果物型に分類し、採用規約（または移行期デフォルト）に基づいて
  confirmed / missing を判定する。宣言参照先成果物が実在しない場合、宣言は根拠に
  数えない。設計妥当性そのものは常に `not-evaluated-by-this-tool` を返す
  （対応宣言の存在を妥当性の合格根拠にしない構造保証）
- 正式確定判定は、成果物実在・工程役割の所有・上流整合（現行要件行の存在+対応宣言）・
  必要な検証の成立を条件に finalized を返す。後続工程の成果物を要求しない。
  requirementSatisfaction は常に `not-assessed-by-this-tool` を返す
  （正式確定をもって要求充足済みと判定しない構造保証）

## 採用規約入力（`--adopted`）

```yaml
artifact_semantics:
  independentDesignRequired: true   # 独立設計書を必須成果物として採用するか
  alternativeDesignBasisAllowed: true  # 独立 Design 文書以外の成果物からの設計根拠宣言を認めるか
  adoptedAt: "2026-10-10"           # 採用の適用開始点（任意）
```

`--adopted` を省略した場合、移行期契約（採用宣言が行われるまでの間、現に実効している
運用を採用済み規約として扱う）に従い移行期デフォルト（independentDesignRequired: true、
alternativeDesignBasisAllowed: true）を適用する。
採用宣言ファイルが指定されたが読取・解析に失敗した場合は、移行期デフォルトへ
フォールバックせず fail-closed で失敗する。
