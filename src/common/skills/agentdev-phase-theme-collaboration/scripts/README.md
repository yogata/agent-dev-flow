# `agentdev-phase-theme-collaboration` scripts

工程駆動コラボレーション（テーマ正本管理・外部検討の持出しと戻り受理）の決定的処理: 戻り入力の受理、持出し文書の検証、テーマ一覧の導出、受領記録の照会。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── cli.ts       # argv 解析（--flag 値）、JSON 出力、エラー終了
│   ├── schema.ts    # 採否記録・受領記録 frontmatter の型と検証（fail-closed）
│   ├── sections.ts  # themes.md / pending.md セクション解析、一覧導出、旧新解決、carried 未決抽出
│   ├── handoff.ts   # 持出し文書の構成検証（必須4要素）と既知機密パターンの混入検出
│   └── receive.ts   # 戻り入力の受理・採否分類（O(n) 線形走査、fail-closed、証跡量比例）
├── src/
│   ├── handoff-check.ts  # CLI: 持出し文書の検証
│   ├── receive.ts        # CLI: 戻り入力の受理・採否記録生成
│   ├── themes.ts         # CLI: テーマ一覧の導出、旧新対応の解決、未決の連携参照
│   └── received.ts       # CLI: 受領済み知見の照会
└── tests/
    ├── handoff.test.ts
    ├── receive.test.ts
    ├── sections.test.ts
    └── received.test.ts
```

## I/O 契約（共通）

- 入力: argv。テキスト入力は `--input`（ファイルパス、または `-` で stdin）
- 出力: stdout に JSON
- 実行エラー（入力不正、破損状態、明示採用指示の不整合）は非ゼロ終了コード + stderr。技術的失敗を成功として出力しない
- 検証結果の報告（持出し検証の findings、採否記録の rejected-invalid を含む）は終了コード 0 で JSON を返す
- 決定性: 同一入力から同一の JSON を返す

## 操作契約

### `src/handoff-check.ts` — 持出し文書の検証（持出し確認契約の機械的部分）

```
bun src/handoff-check.ts --input <handoff.md | ->
```

- 必須4要素（`## 目的`、`## 問い`、`## 前提`、`## 参照元`）の存在と、既知の機密指定情報・認証値パターンの混入を線形走査で検出する
- 出力: `complete`（4要素の有無）、`missing`、`findings`（検出位置と内容）、`result`（`ok` / `findings`）、`sections`
- 本 CLI は送信機能を持たない。出力に送出先・送信操作のフィールドは存在しない（外部AIへの自動送信を行わない契約の構造的保証）
- 機密検出時も終了コードは 0（送出判断は利用者が担う）

### `src/receive.ts` — 戻り入力の受理（戻り受理・部分反映・非機能受け入れ条件の機械的部分）

```
bun src/receive.ts --input <return.md | -> [--adopt <id|title>]... [--prior <prior.json>] [--prior-label <label>]
```

- `--input -` で stdin（貼付経路）、パスでファイル経路。両経路は同一の正規化（改行統一）で受理し、同一 JSON を返す（両経路の意味上の等価性）
- エントリ様式: `## <E-{NNN}|任意の見出し>: タイトル` で始まるセクション。見出しが1つもない入力は単一の `rejected-invalid` として記録する（fail-closed、確定しない）
- 採用根拠は `--adopt`（利用者の明示採用指示）のみ。外部AIの自己申告（本文中の「承認済み」「approved」等）は採用証拠にならず、観測情報（`selfReportDetected`）としてのみ記録する
- 採否区分: `accepted`（明示採用）/ `not-adopted`（明示指示なし）/ `rejected-invalid`（様式不備・空本文。不採用として残し確定しない）/ `detected-duplicate`（`--prior` との重複検出。再投入時の処理対象外）
- `--adopt` に該当する受理済みエントリが存在しない場合は非ゼロ終了（fail-closed）
- 証跡量: 出力はエントリ本文を複写しない。採用分は根拠付きレコード、不採用分は id と分類の要約のみ。記録量は明示採用件数に比例する
- 受理・解釈は入力サイズ n に対する単一の線形走査（O(n)）である

### `src/themes.ts` — テーマ一覧の導出（未決引継ぎ・旧新解決・一覧導出の機械的部分）

```
bun src/themes.ts --themes-file <themes.md> [--pending-file <pending.md>] [--resolve-old <THEME-NNN>]
```

- テーマ一覧はテーマ正本（themes.md）のセクションから導出する。恒久一覧を作らない
- `--pending-file` で未決の連携参照（関連テーマ、carried 状態の未決）を併せて出力する
- `--resolve-old` で旧テーマ識別の後継チェーンを解決する。`resolved`（現行 active に到達）/ `terminal`（後継なし）/ `unknown`（未知識別）/ `cycle`（循環。解決せず報告）を区別する
- テーマ識別・未決識別の重複は非ゼロ終了で拒否する（silent skip しない）

### `src/received.ts` — 受領済み知見の照会（別セッション再取得の機械的部分）

```
bun src/received.ts --dir <received-dir> [--theme <THEME-NNN>]
```

- 受領記録の様式: `received/YYYY-MM-DD-{テーマ識別}.md`。冒頭に YAML frontmatter を持つ

```yaml
---
receivedAt: 2026-10-13T09:00:00Z
theme: THEME-NNN
purpose: "持出し時の目的"
question: "持出し時の問い"
references: ["docs/designs/..."]
---
```

- 出力: 受領情報の一覧（`records`、`count`）。`--theme` でテーマ識別の限定照会
- received/ に記録が存在しない内容は返らない（未受領の外部検討内容を復元したと扱わない契約の機械的基盤）
- frontmatter 不備の受領記録は非ゼロ終了で報告する（破損した記録を受領済み知見として扱わない）

## テストと型検査

```bash
# repo root 起 cwd で実行
bun test ./src/common/skills/agentdev-phase-theme-collaboration/scripts/tests/

# 型検査（本ディレクトリを cwd として実行）
bun run typecheck
```
