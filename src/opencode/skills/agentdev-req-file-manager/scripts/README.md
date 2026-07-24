# `agentdev-req-file-manager` scripts

REQ/ADR 固有の採番・検索処理のみを扱う決定的処理スクリプト群（REQ/160、AG-002/006、design-principles.md 第5節）。
`search-target-area.ts` は `agentdev-spec-file-manager` へ移管済み。
文書種別横断の検証 script（`check-frontmatter-consistency`、`check-entry-existence`、`check-change-impact`）と共有 lib は `agentdev-artifact-validation` へ移管済み（AG-019、RU-20260722-01 合意）。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── result.ts                    # 結果型と stdout/stderr ヘルパー
│   ├── frontmatter.ts               # frontmatter parse、ID 形式抽出（純粋関数）
│   └── fs-helpers.ts                # ファイル名/番号/ゼロ埋めヘルパー
├── src/
│   ├── alloc-req-number.ts          # REQ番号採番（max+1、欠番埋め禁止）
│   ├── alloc-adr-number.ts          # ADR番号採番（max+1、欠番埋め禁止）
│   └── alloc-composite-id.ts        # 要件行ID採番（REQ-NNNN-MMM、max+1）
└── tests/
    └── *.test.ts                    # 各スクリプトの core 純粋関数テスト
```

## I/O 契約（REQ）

- 入力: argv（ファイル/ディレクトリパス）または stdin（JSON）
- 出力: stdout に JSON
- エラー: 非ゼロ終了コード + stderr にエラーメッセージ
- 副作用: なし（純粋関数、ファイル I/O は入力読み込みのみ）

## 実行方法

```bash
# 依存関係インストール（初回のみ）
bun install

# テスト実行
bun test         # または npm test

# 型チェック
bun run tsc --noEmit   # または npm run typecheck

# 個別スクリプト実行
bun src/alloc-req-number.ts ../../../docs/requirements
```

各スクリプトの詳細な I/O は親 SKILL.md の「Scripts（決定的処理）」セクション参照。
