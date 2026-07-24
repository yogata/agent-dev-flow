# `agentdev-spec-file-manager` scripts

SPEC 固有の決定的処理スクリプト群（AG-002/006、design-principles.md 第5節）。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── result.ts                    # 結果型と stdout/stderr ヘルパー（SPEC 固有のみ）
│   └── fs-helpers.ts                # ファイル I/O ヘルパー（SPEC 固有のみ）
├── src/
│   └── search-target-area.ts        # SPEC ファイル内 target_area 見出し検索
└── tests/
    └── search-target-area.test.ts   # core 純粋関数テスト
```

## 対象範囲

本ディレクトリは SPEC 固有スクリプトのみを配置する。
共通検証スクリプト（`check-frontmatter-consistency.ts`、`check-entry-existence.ts`、`check-change-impact.ts`）は `agentdev-artifact-validation` が所有し、本スキルは公開検証契約経由で委譲する。REQ/ADR 番号採番スクリプトは `agentdev-req-file-manager` 配下に存続する。

## I/O 契約（REQ）

- 入力: argv（ファイルパス）または stdin（JSON）
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
bun src/search-target-area.ts "target_area文字列" ../../../docs/specs/{domain}/<existing-spec>.md
```

各スクリプトの詳細な I/O は親 SKILL.md の「Scripts（決定的処理）」セクション参照。
