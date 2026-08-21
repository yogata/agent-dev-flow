# `agentdev-traceability` scripts

トレーサビリティ標準配布スキルの決定的エンジン。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── declarations.ts   # ADF-COVERS 対応宣言の解析（行単位パターン照合、意味推定なし）
│   ├── corpus.ts         # 正規成果物コーパスの直接走査（派生 Graph 非依存）
│   ├── requirements.ts   # 現行要件行ID（docs/requirements/REQ-{NNNN}.md）の収集
│   ├── query.ts          # coverage・impact の公開契約（純粋関数）
│   ├── check.ts          # check の6種検査（純粋関数）
│   └── cli_utils.ts      # argv 解析、JSON 出力、エラー終了
└── src/
    ├── coverage.ts       # CLI: coverage
    ├── impact.ts         # CLI: impact
    └── check.ts          # CLI: check
```

`lib/`（解析コア）と `src/`（CLI）の分離により、coverage、impact、check の外部契約を変えずに、将来キャッシュまたは索引を追加できる。
ユニットテスト（宣言解析に架空の concrete 要件行ID を必要とするため producer 側の非配布領域へ配置）は producer 側リポジトリの検証スイート（`traceability_*.test.ts`）が担う。

## I/O 契約（共通）

- 入力: argv（`--root`, `--req`, `--artifact`）
- 出力: stdout に JSON
- エラー: 非ゼロ終了コード + stderr にエラーメッセージ（check は検査 fail ありで終了コード 2、実行エラーで 1）
- 決定性: 同一コーパスから同一の列挙順（名前順）・同一の JSON を返す

## 実行方法

```bash
# 型チェック
bun run tsc --noEmit

# coverage
bun src/coverage.ts --root . --req REQ-{NNNN}-{MMM}
bun src/coverage.ts --root . --artifact docs/designs/<path/to/artifact>.md

# impact
bun src/impact.ts --root . --req REQ-{NNNN}-{MMM}
bun src/impact.ts --root . --artifact src/<path/to/artifact>.ts

# check
bun src/check.ts --root .
bun src/check.ts --root . --req REQ-{NNNN}-{MMM},REQ-{NNNN}-{MMM}
bun src/check.ts --root . --artifact docs/designs/<path/to/artifact>.md
```

各 CLI の詳細な出力契約は親 SKILL.md の「公開操作契約（スクリプト一覧）」参照。
