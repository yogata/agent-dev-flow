# `agentdev-artifact-graph` scripts

Artifact Graph 標準配布スキルの決定的エンジン（REQ-{NNNN}、DEC-{N}）。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── model.ts           # 型、zod schema、定数（open extension point）
│   ├── tim.ts             # TIM 意味カタログ（意味スロット、変更影響方向、プロファイル参加導出）
│   ├── config.ts          # デフォルト設定、graph_config_digest、path utility
│   ├── augmentation.ts    # augmentation 読込・解析、resolveConfig
│   ├── parse.ts           # frontmatter、markdown link、extension field parser
│   ├── provenance.ts      # provenance hashing
│   ├── input.ts           # 入力収集 + digest
│   ├── nodes.ts           # config 駆動ノード抽出
│   ├── edges.ts           # config 駆動エッジ抽出
│   ├── graph.ts           # build + load（動的 schema）
│   ├── checker.ts         # 整合性検査（関係制約違反を含む）
│   ├── query_support.ts   # 問い合わせ結果の共通型・補完
│   ├── query.ts           # neighbors, path, provenance, discover、問い合わせ dispatcher
│   ├── profiles.ts        # 高位プロファイル（related, impact, dependency, implementation）、index
│   ├── workflow.ts        # prepare（fail-open、鮮度4要素判定）
│   └── verification.ts    # verification feedback
├── src/
│   ├── build_graph.ts     # CLI: グラフ生成
│   ├── check_graph.ts     # CLI: グラフ検査
│   ├── query_graph.ts     # CLI: グラフ問い合わせ
│   ├── prepare_graph.ts   # CLI: ワークフロー統合
│   └── verify_graph.ts    # CLI: verification feedback
└── tests/
    └── *.test.ts          # テスト戦略 TS-{NNN} + REQ 項目
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
