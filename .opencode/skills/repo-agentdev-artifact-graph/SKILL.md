---
name: repo-agentdev-artifact-graph
description: Builds and inspects the agent-dev-flow repository-local Artifact Graph. USE FOR: generating the derived graph index, checking graph integrity, querying explicit artifact relations, locating provenance. DO NOT USE FOR: replacing canonical documents, inferring semantic relations, editing graph outputs, consumer repositories.
---

# repo-agentdev-artifact-graph

AgentDevFlow 本体リポジトリの正規入力から、明示関係を検索する派生索引を生成する。
生成物は `.agentdev/graph/` に置き、正規情報や確定判断の根拠として扱わない。

## 入力と出力

入力範囲と除外規則は [extraction.yaml](extraction.yaml) を正とする。
ノード、関係、根拠、生成物のスキーマは [schema.yaml](schema.yaml) を正とする。

生成物は次の5ファイルである。

- `manifest.json`
- `nodes.jsonl`
- `edges.jsonl`
- `provenance.jsonl`
- `diagnostics.json`

## 生成

リポジトリルートで実行する。

```bash
bun .opencode/skills/repo-agentdev-artifact-graph/scripts/build_graph.ts --root . --output .agentdev/graph
```

入力相対パスと内容から `input_digest` を計算する。
現在時刻を生成物へ含めず、入力、ノード、関係、根拠を安定順に整列する。

## 検査

```bash
bun .opencode/skills/repo-agentdev-artifact-graph/scripts/check_graph.ts --graph .agentdev/graph
```

ノード、関係、根拠の ID 重複、存在しないノードへの関係、根拠欠落、禁止された関係カテゴリを検査する。
終了コードは、正常が0、検査不合格が1、入力または実行エラーが2である。

## 問い合わせ

直接関係または指定深度の関係を取得する。

```bash
bun .opencode/skills/repo-agentdev-artifact-graph/scripts/query_graph.ts --graph .agentdev/graph neighbors requirement:REQ-001 --depth 2
```

2ノード間の経路を取得する。

```bash
bun .opencode/skills/repo-agentdev-artifact-graph/scripts/query_graph.ts --graph .agentdev/graph path requirement:REQ-001 specification:docs/specs/example.md --max-depth 4
```

ノードまたは関係の根拠 ID を取得する。

```bash
bun .opencode/skills/repo-agentdev-artifact-graph/scripts/query_graph.ts --graph .agentdev/graph provenance requirement:REQ-001
```

問い合わせ結果は候補取得に限って使用する。
根拠ファイルを読み、別手段で補完または反証してから判断する。

## 標準ワークフローからの補助利用

Project Extension から委譲された場合は、問い合わせ前に次を実行する。

```bash
bun .opencode/skills/repo-agentdev-artifact-graph/scripts/prepare_graph.ts --root . --output .agentdev/graph
```

結果の扱いは次のとおりとする。

| status | freshness | 扱い |
|---|---|---|
| `ready` | `current` | 現在の派生索引として候補取得に使用する |
| `ready` | `regenerated` | 再生成した派生索引を候補取得に使用する |
| `limited` | `stale` | 陳腐化を明示し、既存索引を補助的な候補取得だけに使用する |
| `unavailable` | `missing` / `invalid` | Artifact Graph を使用せず、従来の探索手段で標準ワークフローを続行する |

`limited` と `unavailable` は標準ワークフローの停止条件ではない。
生成失敗の理由は実行報告へ残すが、その失敗だけを理由に command または skill を失敗させない。

### 委譲元ごとの候補取得

- `req-define`: 既存REQ、関連ADRとSPEC、構造的所有者重複の候補
- `spec-save`: 対応REQ、同じ正規所有対象を持つSPEC、関連command、skill、整合性ルールの候補
- `case-open`: 起点成果物から到達できる変更影響、廃止参照、未解決参照の候補
- `case-run`: 実装対象に関係するREQ、SPEC、整合性ルール、周辺成果物の候補
- `case-close`: 鮮度、未解決参照、存在しないノードへの関係、根拠欠落、関係閉包の候補
- `agentdev-deep-review`: 複数規範関係、循環、集中ノード、孤立、複数経路の論点候補

構造的重複候補は、明示された所有者、識別子、関係の一致から機械的に得た候補を指す。
文章の意味や責務境界を読んで判断する意味的な責務重複とは区別し、前者だけから後者を確定しない。

## 責務境界

- `declared` と `derived` の関係だけを生成し、`inferred` は生成しない。
- `.agentdev/graph/` を手編集または Git 管理しない。
- グラフ不在や生成失敗を「影響なし」の根拠にしない。
- グラフから変更対象、要件充足、責務重複を確定しない。
- 構造的重複候補を意味的な責務重複の確定結果として扱わない。
