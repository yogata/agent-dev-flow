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
│   ├── identity.ts     # identity（現在工程の識別状態）の解析と既存記録との一致照合（読取専用・不一致は保留）
│   ├── successor.ts    # 後続候補の判別（0 -> terminal、1 -> unique、2+ -> ambiguous）
│   └── cli.ts          # argv 解析（node:util parseArgs）、stdin/file 入力読取
├── src/
│   ├── lookup.ts           # CLI: 記録照会と identity 照合（復元前の照合入口）
│   ├── apply.ts            # CLI: 冪等保存
│   └── resolve-successor.ts # CLI: 後続候補の判別
└── tests/
    └── transition-state.test.ts
```

## I/O 契約（共通）

- 入力: argv。JSON 入力は `--input`（ファイルパス、または `-` で stdin）
- 出力: stdout に JSON（1行 + 改行）
- 実行エラー（入力不正、破損状態、書込み失敗）は非ゼロ終了コード + stderr。技術的失敗を成功として出力しない
- 照会の判定結果（既存記録の破損検出 `result:"error"` を含む）は終了コード 0 で JSON を返す。ただし identity 照合に由来する保留判定（`result:"mismatch"`、identity 読取不能の `result:"error"`）は非ゼロ終了で返す（lookup.ts の操作契約を参照）
- 決定性: 同一状態から同一の JSON を返す

## 操作契約

### `src/lookup.ts` — 遷移記録の照会と identity 照合

```
bun src/lookup.ts --dir <transitions-dir> --key <idempotency-key> --identity-file <identity.yaml>
```

- `--identity-file` は必須（`.agentdev/phase/identity.yaml`）。既存記録の復元は、現在工程の識別状態を記録と照合して矛盾がないことを確認した後でのみ行う（REQ-111-023）。照合は逐語一致のみで行い、正規化・部分一致・自動解消を行わない。照合対象は undertaking↔scope と current_phase↔fromPhase/toPhase（current_phase は fromPhase または toPhase のいずれかと一致すればよく、終端記録 toPhase null は fromPhase のみ）。identity ファイルは読取専用であり、本 script はこれを変更しない
- 出力:
  - `{"result":"absent"}` — 記録なし。記録領域自体の不存在のみを記録不在として扱う
  - `{"result":"existing","record":{...},"path":"...","identityCheck":{"ok":true,"undertaking":"match","currentPhase":"match-toPhase"|"match-fromPhase"}}` — 既存記録の検出と identity 照合一致（再実行はこれを復元して二重実行を防ぐ）
  - `{"result":"mismatch","path":"...","record":{...},"identity":{...},"reasons":[...]}` — identity と既存記録の矛盾検出。**非ゼロ終了**で返り、遷移記録に依存する操作は保留する。矛盾の解消は利用者判断であり、本 script は矛盾を自動解消しない（undertaking が空で同一取組を確認できない場合も mismatch に含める）
  - `{"result":"error","reason":"...","path":"..."}` — 確認不能または破損状態の検出。記録領域の列挙・読取が技術的に失敗した場合（存在確認不能、パスが通常ファイル等）と、記録ファイルの読取失敗・JSON 破損・schema 違反を含む。existing として扱わず、記録不在（absent）としても扱わない。**identity ファイル自体の読取失敗も error（非ゼロ終了）として返し**、確認不能な識別状態の上で復元を続行しない
  - `result:"mismatch"` と identity 由来の `result:"error"` は保留（非ゼロ終了）を意味する判定結果であり、記録領域自体の照会判定（`result:"error"` 終了コード 0）とは区別される

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

- 終端の遷移（採用済みの工程関係に後続工程が存在しない遷移）は、toPhase に `null` を記録する。架空の後続工程を作らず、保存された記録から終端であることを再構成できる:

```json
{
  "key": "transition-20261013-002",
  "scope": "work-scope-id",
  "fromPhase": "requirements",
  "toPhase": null,
  "recordedAt": "2026-10-13T10:00:00Z"
}
```

- 出力:
  - `{"result":"recorded","record":{...},"path":"..."}` — 新規記録の保存成功
  - `{"result":"duplicate","record":{...},"path":"..."}` — 既存記録の検出（二重記録なし。記録から復元）。同一キーで対象範囲（scope）・遷移元（fromPhase）・遷移先（toPhase）が一致する場合のみ duplicate として復元する。recordedAt は記録時刻メタデータであり内容照合の対象外
- 入力不正、破損状態の検出、書込み失敗は非ゼロ終了（保存を実行しない）
- 同一キーで対象範囲・遷移元・遷移先のいずれかが異なる要求は、既存記録を復元せず、上書き・置換せず、当該要求の記録を保存せずに非ゼロ終了で拒否する（fail-closed）
- 既存記録領域の読取が確認不能（`{"result":"error",...}`）な場合は保存を実行せず非ゼロ終了する

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
