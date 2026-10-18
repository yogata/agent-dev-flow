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
│   ├── sections.ts  # themes.md / pending.md セクション解析、一覧導出、旧新解決、carried 未決抽出、採用状態照合
│   ├── handoff.ts   # 持出し文書の構成検証（必須4要素）と既知機密パターンの混入検出
│   ├── receive.ts   # 戻り入力の受理・採否分類（O(n) 線形走査、fail-closed、証跡量比例）
│   └── received-record.ts # 受領記録の生成と区別保存（1受領1ファイル、受領日時の信頼性、由来と採用根拠の区別）
├── src/
│   ├── handoff-check.ts  # CLI: 持出し文書の検証
│   ├── receive.ts        # CLI: 戻り入力の受理・採否記録生成
│   ├── themes.ts         # CLI: テーマ一覧の導出、旧新対応の解決、未決の連携参照、採用主張の照合
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
bun src/receive.ts --input <return.md | -> [--adopt <id|title>]... [--prior <prior.json>] [--prior-label <label>] [--provenance <kind | <id|title>=<kind>>]...
```

- `--input -` で stdin（貼付経路）、パスでファイル経路。両経路は同一の正規化（改行統一）で受理し、同一 JSON を返す（両経路の意味上の等価性）
- エントリ様式: `## <E-{NNN}|任意の見出し>: タイトル` で始まるセクション。見出しが1つもない入力は単一の `rejected-invalid` として記録する（fail-closed、確定しない）
- 採用根拠は `--adopt`（利用者の明示採用指示）のみ。外部AIの自己申告（本文中の「承認済み」「approved」等）は採用証拠にならず、観測情報（`selfReportDetected`）としてのみ記録する
- 採否区分: `accepted`（明示採用）/ `not-adopted`（明示指示なし）/ `rejected-invalid`（様式不備・空本文。不採用として残し確定しない）/ `detected-duplicate`（`--prior` との重複検出。再投入時の処理対象外）
- 再投入の重複判定は識別子・表題の一致に加えて正規化本文の内容同一性（`bodyDigest`）で判定する。同識別子・同表題でも本文が相違する入力は同一と断定せず、`updatedFromPrior: true` として新たな受理・採否の対象にする。実質同一（空白・改行のみの差）は重複として扱う。本文ダイジェストを持たない旧様式の prior は同一断定で除外しない
- `--provenance` は受領内容の由来（`user-provided` / `delegated-derivation` / `evaluator-finding`）。`<kind>` で全体既定、`<id|title>=<kind>` で個別指定。採用根拠とは別フィールド（`provenance`）で記録し、由来だけで採用済みと扱わない
- `--adopt` に該当する受理済みエントリが存在しない場合は非ゼロ終了（fail-closed）
- 証跡量: 出力はエントリ本文を複写しない。採用分は根拠付きレコード、不採用分は id と分類の要約のみ。記録量は明示採用件数に比例する
- 受理・解釈は入力サイズ n に対する単一の線形走査（O(n)）である

### `src/themes.ts` — テーマ一覧の導出（未決引継ぎ・旧新解決・一覧導出・採用状態照合の機械的部分）

```
bun src/themes.ts --themes-file <themes.md> [--pending-file <pending.md>] [--resolve-old <THEME-NNN>] [--assess-adoption true]
```

- テーマ一覧はテーマ正本（themes.md）のセクションから導出する。恒久一覧を作らない
- `--pending-file` で未決の連携参照（関連テーマ、carried 状態の未決）を併せて出力する
- `--resolve-old` で旧テーマ識別の後継チェーンを解決する。`resolved`（現行 active に到達）/ `terminal`（後継なし）/ `unknown`（未知識別）/ `cycle`（循環。解決せず報告）を区別する
- `--assess-adoption true` でテーマ内の採用主張（`- 採用根拠:` フィールド）の分類を出力する。利用者の明示判断・正規決定参照は照合前の採用主張（`adopted-claim-unverified`）、根拠不足は確認不足または候補（`candidate`）、採用主張なしは通常の参考テーマ（`reference-only`）として区別する。機械解析は採用の意味的な認定を行わない。不整合検出・反映状態の導出は `lib/sections.ts` の `assessAdoptionInconsistency` / `assessAdoptionReflection` が担う（正規成果物側の状態は呼出側が判定して渡す）
- テーマ識別・未決識別の重複は非ゼロ終了で拒否する（silent skip しない）

### `src/received.ts` — 受領済み知見の照会（別セッション再取得の機械的部分）

```
bun src/received.ts --dir <received-dir> [--theme <THEME-NNN>]
```

- 受領記録の様式: `received/YYYY-MM-DD-{テーマ識別}.md`。冒頭に YAML frontmatter を持つ。同日・同一テーマの複数受領は `YYYY-MM-DD-{テーマ識別}-{連番}.md` で区別して保存する（1受領1ファイル契約。生成は lib/received-record.ts の `buildReceivedRecord`）

```yaml
---
receivedAt: 2026-10-13T09:00:00Z
theme: THEME-NNN
purpose: "持出し時の目的"
question: "持出し時の問い"
references: ["docs/designs/..."]
provenance: user-provided
adoptionBasis: null
---
```

- `provenance`（由来）と `adoptionBasis`（正式な採用根拠。`user-explicit` または `decision`）は区別して記録し、由来だけで採用済みと扱わない。旧様式の記録では両フィールドとも null として読む
- 受領日時（`receivedAt`）は受領操作時点の時計からのみ取得し、入力ファイルの更新日時・本文中の日付を代用しない。取得できない場合は日時を捏造せず失敗を明示する
- 出力: 受領情報の一覧（`records`、`count`）。各レコードに採用済み判定（`adopted`。`adoptionBasis` のみから導出）を含める。`--theme` でテーマ識別の限定照会
- received/ に記録が存在しない内容は返らない（未受領の外部検討内容を復元したと扱わない契約の機械的基盤）
- frontmatter 不備の受領記録は非ゼロ終了で報告する（破損した記録を受領済み知見として扱わない）

## テストと型検査

```bash
# repo root 起 cwd で実行
bun test ./src/common/skills/agentdev-phase-theme-collaboration/scripts/tests/

# 型検査（本ディレクトリを cwd として実行）
bun run typecheck
```
