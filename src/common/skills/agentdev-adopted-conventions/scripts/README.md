# `agentdev-adopted-conventions` scripts

採用規約（採用済み工程・工程間関係・必須成果物）の決定的解決器。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── schema.ts       # 採用宣言 schema 型と検証（silent skip 禁止、継承義務 fail-closed）
│   ├── parse.ts        # 採用宣言の読み込み（YAML 標準 API 委譲、absent / unreadable / invalid を区別）
│   ├── resolve.ts      # 解決手順（採用宣言の確認 → 基準の特定、移行期デフォルト接続）
│   ├── judge.ts        # 判定規則（誤判定禁止・省略合格禁止、根拠確認の機械的部分）
│   └── cli.ts          # argv 解析、JSON 出力、エラー終了
└── src/
    ├── resolve.ts      # CLI: 解決（採用宣言の確認と基準の特定）
    └── evaluate.ts     # CLI: 判定（基準に対する対象成果物の有無と成立根拠）
```

`lib/`（解析コア）と `src/`（CLI）の分離は決定的解決器の共通構成に従う。
ユニットテストは受入シナリオを含め `tests/` 配下へ配置する（宣言解析に架空の concrete 要件行 ID を必要としないため、共通原本側で完結する）。

## I/O 契約（共通）

- 入力: argv（`--root`, `--file`, `--scope`, `--check-path`, `--exclude`）
- 出力: stdout に JSON
- エラー: 実行エラーは非ゼロ終了コード + stderr。`unresolvable`（解決実行不能）と `judgment-deferred`（移行期デフォルト）は判定結果・判断留保として終了コード 0 で JSON を返す
- 決定性: 同一コーパスから同一の JSON を返す。工程進捗の恒久状態を保持しない

## 実行方法

`--root` には採用宣言を配置した対象プロジェクトのルートを指定する。絶対パスを推奨する。
既定の採用宣言配置先は対象プロジェクト root からの相対で `.agentdev/adopted-conventions.yaml`。

```bash
# 型チェック（本ディレクトリを cwd として実行）
bun run tsc --noEmit

# 解決
bun src/resolve.ts --root <project-root>
bun src/resolve.ts --root <project-root> --scope <process-id>

# 判定
bun src/evaluate.ts --root <project-root>
bun src/evaluate.ts --root <project-root> --check-path <artifact-path>
```

各 CLI の出力契約の詳細は親 SKILL.md の「公開操作契約（スクリプト一覧）」参照。
