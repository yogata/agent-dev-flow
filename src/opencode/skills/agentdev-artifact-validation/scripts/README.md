# `agentdev-artifact-validation` scripts

文書種別横断の決定的検証 script 群と共有 lib（REQ-0103-159/160、AG-003/009/019、design-principles.md 第5節）。

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
│   ├── check-frontmatter-consistency.ts  # frontmatter id ↔ ファイル名整合性（REQ/ADR 横断）
│   ├── check-entry-existence.ts     # README/DOC-MAP/mapping-table エントリ存在
│   └── check-change-impact.ts       # 変更範囲検証（許可パスリストとの積集合）
└── tests/
    └── *.test.ts                    # 各スクリプトの core 純粋関数テスト
```

## I/O 契約（共通）

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
bun src/check-frontmatter-consistency.ts ../../../docs/requirements req
```

各スクリプトの詳細な I/O は親 SKILL.md の「Scripts（決定的検証）」セクション参照。

## 所有権と委譲

本ディレクトリの script と lib は `agentdev-artifact-validation` が正規所有する（AG-003、AG-019）。
利用側 command、skill は内部 lib パスを直接参照せず、公開検証契約（script の argv/stdin → stdout JSON）へ委譲する（AG-009）。
同一 script または共有 lib を複数 skill へ複製しない（AG-003）。
