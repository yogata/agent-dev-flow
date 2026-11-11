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
│   └── fs-helpers.ts                # ファイル名/番号/ゼロ埋めヘルパー
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
利用側 command、skill は内部 script パスを直接参照せず、公開検証契約（script の argv/stdin → stdout JSON）へ委譲する（「Script 所有権と委譲契約」の委譲規則）。
同一 script または共有 lib を複数 skill へ複製しない（「Script 所有権と委譲契約」の複製禁止規則）。

公開検証契約への委譲とは別に、兄弟 skill は共有 lib（fs-helpers、result、frontmatter）を supported lib interface 経由で利用できる。
supported lib interface は、各利用側 skill の `scripts/lib/` から本ディレクトリの lib への再公開を参照経路とする。利用側 scripts は自スキルの lib 参照を維持する。検証操作の公開検証契約と supported lib interface は別契約として区別する。
共有 lib の受理集合（ファイル名形式・番号桁などの解析対象範囲）を変更する場合は、影響する全利用側の変更前後比較を前提とする。利用側の受理集合に変化がある場合は、利用者再合意を前提とする。共有 lib に明示的な書込みなど検証操作の副作用を含めない。
