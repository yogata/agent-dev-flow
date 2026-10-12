# `agentdev-workflow-phase-transition` scripts

工程遷移記録の決定的処理: 記録照会、冪等保存（一度実行の制御）、後続候補の判別。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── schema.ts       # 遷移記録 schema 型と検証（fail-closed、余分なフィールド禁止）
│   ├── store.ts        # 記録の照会と冪等保存（既存記録の検出で二重記録を防ぐ、破損状態は保存を拒否）
│   ├── successor.ts    # 後続候補の判別（0 -> terminal、1 -> unique、2+ -> ambiguous）
│   └── cli.ts          # argv 解析（node:util parseArgs）、stdin/file 入力読取
├── src/
│   ├── lookup.ts           # CLI: 記録照会
│   ├── apply.ts            # CLI: 冪等保存
│   └── resolve-successor.ts # CLI: 後続候補の判別
└── tests/
    └── transition-state.test.ts
```

## I/O 契約（共通）

- 入力: argv。JSON 入力は `--input`（ファイルパス、または `-` で stdin）
- 出力: stdout に JSON（1行 + 改行）
- 実行エラー（入力不正、破損状態、書込み失敗）は非ゼロ終了コード + stderr。技術的失敗を成功として出力しない
- 照会の判定結果（既存記録の破損検出 `result:"error"` を含む）は終了コード 0 で JSON を返す
- 決定性: 同一状態から同一の JSON を返す

## 操作契約

### `src/lookup.ts` — 遷移記録の照会

```
bun src/lookup.ts --dir <transitions-dir> --key <idempotency-key>
```

- 出力:
  - `{"result":"absent"}` — 記録なし（ディレクトリ不存在を含む）
  - `{"result":"existing","record":{...},"path":"..."}` — 既存記録の検出（再実行はこれを復元して二重実行を防ぐ）
  - `{"result":"error","reason":"...","path":"..."}` — 破損記録の検出。existing として扱わない

### `src/apply.ts` — 遷移記録の保存（冪等）

```
bun src/apply.ts --dir <transitions-dir> --input <record.json | ->
```

- 入力 JSON（遷移記録。余分なフィールドは拒否）:

```json
{
  "key": "transition-20261013-001",
  "scope": "work-scope-id",
  "fromPhase": "requirements",
  "toPhase": "design",
  "recordedAt": "2026-10-13T09:00:00Z"
}
```

- 出力:
  - `{"result":"recorded","record":{...},"path":"..."}` — 新規記録の保存成功
  - `{"result":"duplicate","record":{...},"path":"..."}` — 既存記録の検出（二重記録なし。記録から復元）
- 入力不正、破損状態の検出、書込み失敗は非ゼロ終了（保存を実行しない）

### `src/resolve-successor.ts` — 後続候補の判別

```
bun src/resolve-successor.ts --input <candidates.json | ->
```

- 入力 JSON: `{"candidates":["phase-a","phase-b"]}`
- 出力:
  - `{"kind":"terminal"}` — 後続0件（終端。架空の工程を作らない）
  - `{"kind":"unique","successor":"..."}` — 後続1件（一意に解決）
  - `{"kind":"ambiguous","candidates":[...]}` — 後続複数件（利用者選択へ）

## テストと型検査

```bash
# 本ディレクトリを cwd として実行
bun test ./tests/
bun run typecheck
```
