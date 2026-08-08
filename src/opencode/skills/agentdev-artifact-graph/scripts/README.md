# `agentdev-artifact-graph` scripts

Artifact Graph 標準配布スキルの決定的エンジン（REQ-012、ADR-007）。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── model.ts           # 型、zod schema、定数（open extension point）
│   ├── config.ts          # デフォルト設定、augmentation 読込、path utility
│   ├── parse.ts           # frontmatter、markdown link、extension field parser
│   ├── provenance.ts      # provenance hashing
│   ├── input.ts           # 入力収集 + digest
│   ├── nodes.ts           # config 駆動ノード抽出
│   ├── edges.ts           # config 駆動エッジ抽出
│   ├── graph.ts           # build + load（動的 schema）
│   ├── checker.ts         # 整合性検査
│   ├── query.ts           # neighbors, path, provenance, discover
│   ├── workflow.ts        # prepare（fail-open）
│   └── verification.ts    # verification feedback
├── src/
│   ├── build_graph.ts     # CLI: グラフ生成
│   ├── check_graph.ts     # CLI: グラフ検査
│   ├── query_graph.ts     # CLI: グラフ問い合わせ
│   ├── prepare_graph.ts   # CLI: ワークフロー統合
│   └── verify_graph.ts    # CLI: verification feedback
└── tests/
    └── *.test.ts          # テスト戦略 TS-001〜TS-008 + REQ 項目
```

## I/O 契約（共通）

- 入力: argv
- 出力: stdout に JSON
- エラー: 非ゼロ終了コード + stderr にエラーメッセージ
- 決定性: 同一入力からバイト同一の5ファイルを生成

## 実行方法

```bash
# 依存関係インストール（初回のみ）
bun install

# テスト実行
bun test

# 型チェック
bun run tsc --noEmit

# グラフ生成
bun src/build_graph.ts --root . --output .agentdev/graph
```

各スクリプトの詳細な I/O は親 SKILL.md の「Scripts（決定的処理）」セクション参照。
