# `agentdev-issue-tracking` scripts

課題管理配布スキルの決定的エンジン。課題ファイル（`docs/issue-list/ISL-*.md`）の検索、一覧、形式検証を提供する。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── issue_file.ts   # frontmatter 解析、検索フィルタ、状態別必須項目の形式検証（純粋関数）
│   └── cli_utils.ts    # argv 解析、JSON 出力、エラー終了
└── src/
    └── list.ts         # CLI: list / search / validate
```

`lib/`（解析コア）と `src/`（CLI）の分離により、外部契約を変えずに将来キャッシュまたは索引を追加できる。
ユニットテスト（架空の課題 ID を使うため配布物に含めない）は producer 側リポジトリの検証スイート（`issue_tracking_list.test.ts`）が担う。

## I/O 契約（共通）

- 入力: argv（`--root` 必須、任意: `--status`, `--related`, `--id`, `--format`, `--validate`）
- 出力: stdout に JSON（`--format md` 指定時は Markdown 表）
- エラー: 実行エラーで終了コード 1、`--validate` 指定時に形式検証 fail ありで終了コード 2
- 決定性: 同一ディレクトリ状態から同一の列挙順（ファイル名順）・同一の出力を返す
- 走査: `--root` 配下の `docs/issue-list/` 直下の `ISL-*.md` のみ。ディレクトリ不在は空の一覧

## 形式検証の検査項目

| code | 検査 |
|---|---|
| `missing-field` | frontmatter 必須フィールド（id, title, status, created, updated）の未記述 |
| `id-mismatch` | frontmatter id とファイル名の課題 ID の不一致 |
| `unknown-status` | 5状態保存値以外の status |
| `invalid-date` | created / updated の日付形式 |
| `missing-section` | 本文「## 課題内容」の欠落 |
| `on-hold-requires-reevaluation` | 保留状態での frontmatter reevaluation 欠落 |
| `on-hold-requires-section` | 保留状態での本文「## 再評価条件」欠落 |
| `resolved-requires-conclusion` | 解決済み以上での本文「## 結論」欠落 |
| `closed-requires-reflection` | クローズ済みでの本文「## 反映先」欠落（反映完了または反映不要の確認の前提） |
| `closed-requires-close-confirmation` | クローズ済みでの本文「## クローズ確認」欠落 |

## 実行方法

```bash
# 型チェック
bun run tsc --noEmit

# 全課題の一覧（状態別件数つき）
bun scripts/src/list.ts --root .

# 保留課題（再評価条件の要約を含む）
bun scripts/src/list.ts --root . --status on-hold

# 関連成果物でフィルタ
bun scripts/src/list.ts --root . --related docs/requirements/REQ-{NNN}.md

# 形式検証
bun scripts/src/list.ts --root . --validate
```
