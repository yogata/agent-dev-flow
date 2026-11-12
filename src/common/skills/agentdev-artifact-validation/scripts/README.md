# `agentdev-artifact-validation` scripts

文書種別横断の決定的検証 script 群と共有 lib（「Script 所有権と委譲契約」、design-principles.md 第5節）。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── result.ts                    # 結果型と stdout/stderr ヘルパー
│   ├── frontmatter.ts               # frontmatter parse、ID 形式抽出（純粋関数）
│   ├── fs-helpers.ts                # ファイル名/番号/ゼロ埋めヘルパー
│   └── gate-execution.ts            # ゲート機械処理共有 lib（case 系 workflow 入口が supported lib interface 経由で利用）
├── src/
│   ├── check-frontmatter-consistency.ts  # frontmatter id ↔ ファイル名整合性（REQ/ADR 横断）
│   ├── check-entry-existence.ts     # README エントリ存在
│   ├── check-change-impact.ts       # 変更範囲検証（許可パスリストとの積集合）
│   └── check-req-row-existence.ts   # 書込み時引用識別子実在検証（第4共通検証、適用後状態評価）
└── tests/
    └── *.test.ts                    # 各スクリプトの core 純粋関数テスト
```

## I/O 契約（共通）

- 入力: argv（ファイル/ディレクトリパス）または stdin（JSON）
- 出力: stdout に JSON
- エラー: 非ゼロ終了コード + stderr にエラーメッセージ
- 副作用: なし（純粋関数、ファイル I/O は入力読み込みのみ）

`check-frontmatter-consistency.ts` の `kind` は `req`、`adr`、`decision` を受理する。

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

# 書込み時引用識別子実在検証（第4共通検証）
bun src/check-req-row-existence.ts --root <repo-root> --file <repo-relative-path>
# 同一変更で作成される参照先（REQ テーブル）の適用後本文を併せて渡す場合（stdin JSON）
echo '{"root":"<repo-root>","files":[{"path":"<written-artifact-path>","content":"<適用後本文>"},{"path":"docs/requirements<REQ-NNNN>.md","content":"<適用後本文>"}]}' | bun src/check-req-row-existence.ts
```

各スクリプトの詳細な I/O は親 SKILL.md の「Scripts（決定的検証）」セクション参照。

## 所有権と委譲

本ディレクトリの script と lib は `agentdev-artifact-validation` が正規所有する（「Script 所有権と委譲契約」に基づく単一所有）。
利用側 command、skill は内部 lib パスを直接参照せず、公開検証契約（script の argv/stdin → stdout JSON）へ委譲する（「Script 所有権と委譲契約」の委譲規則）。
共有 lib（fs-helpers、result、gate-execution）の正は本 skill が所有する。gate-execution は case 系 workflow 入口が共有するゲート機械処理です。利用側は supported lib interface（利用側 skill の `scripts/lib/` 配下の再エクスポート shim）経由でのみ利用する。本 skill の内部 lib パスを利用側が直接参照することはありません。共有 lib は検証操作の副作用を持ちません（agentdev-artifact-validation skill Design「現在の動作」「境界」節）。
同一 script または共有 lib を複数 skill へ複製しない（「Script 所有権と委譲契約」の複製禁止規則）。
