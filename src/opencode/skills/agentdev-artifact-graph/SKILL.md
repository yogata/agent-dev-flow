---
name: agentdev-artifact-graph
description: Builds and inspects the Artifact Graph (derived index of explicit artifact relations). USE FOR: generating the graph, checking graph integrity, querying relations (neighbors, path, provenance, discover), or locating provenance in consumer and self-hosting environments. DO NOT USE FOR: replacing canonical documents, inferring semantic relations, editing graph outputs, treating Graph as SSoT, or halting workflow on graph failure.
---

# agentdev-artifact-graph

AgentDevFlow 標準配布スキル。正規成果物（REQ/ADR/SPEC）間の明示関係を検索する派生索引（Artifact Graph）を生成、検査、問い合わせる（REQ-012、ADR-007）。

consumer と self-hosting の両環境で動作する。標準コアと augmentation を分離し、open extensibility によって self-hosting 固有知識を標準契約から除外する。DOC-MAP 廃止後の標準探索モデルとして機能する。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-artifact-graph` SPEC である。SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。

## 標準コア（デフォルト）

標準コアは self-hosting 固有知識を持たない（REQ-012-001、REQ-012-002、ADR-007 decision 3）。

| 項目 | デフォルト値 |
|---|---|
| indexed_paths | `docs/requirements`, `docs/adr`, `docs/specs`（3種） |
| node_types | `requirement`, `adr`, `specification`（3種） |
| relation_types | `references`, `supersedes`, `defined_in`, `contains`, `extends`（5種） |
| discovery_roots | 空（augmentation で追加） |

node_types と relation_types は closed-enum ではなく、augmentation から追加可能な open extension point である（REQ-012-004、ADR-007 decision 2）。

## 入力と出力

### 入力（正規情報）

標準コア デフォルト `indexed_paths`（3種）から入力を収集する。

### 出力（派生索引）

`.agentdev/graph/` 配下に5ファイルを生成する。

- `manifest.json`
- `nodes.jsonl`
- `edges.jsonl`
- `provenance.jsonl`
- `diagnostics.json`

`.agentdev/graph/` は手編集せず、正規情報として扱わない。Git 管理対象外とする（試行期間中）。

## Scripts（決定的処理）

`scripts/` 配下の決定的スクリプトが、Artifact Graph の生成、検査、問い合わせを機械的に実行する。実装は TypeScript、決定的（純粋関数）、テスト付き（`tests/*.test.ts`）。

### I/O 契約（共通）

| 項目 | 規約 |
|---|---|
| 入力 | argv（`--root`, `--output`, `--graph`, `--augmentation` 等） |
| 出力 | stdout に JSON |
| エラー | 非ゼロ終了コード + stderr にエラーメッセージ |
| 決定性 | 同一入力からバイト同一の5ファイルを生成（REQ-012-013） |

### 公開操作契約（スクリプト一覧）

| スクリプト | 役割 | 入力 | 出力 JSON |
|---|---|---|---|
| `build_graph.ts` | グラフ生成 | `--root`, `--output`, `--augmentation` | `{ files, nodeCount, edgeCount, diagnosticCount, inputDigest }` |
| `check_graph.ts` | グラフ検査 | `--graph` | `{ valid, errors[], warnings[] }` |
| `query_graph.ts` | グラフ問い合わせ | `--graph`, `--root`, サブコマンド+引数 | `{ nodes[], edges[], provenance[], discovered? }` |
| `prepare_graph.ts` | ワークフロー統合（fail-open） | `--root`, `--output`, `--augmentation` | `{ status, freshness, graphPath, reason? }` |
| `verify_graph.ts` | verification feedback | `--root`, `--graph`, `--augmentation` | `{ summary, differences[] }` |

### 実行方法

```bash
# グラフ生成
bun .opencode/skills/agentdev-artifact-graph/scripts/src/build_graph.ts --root . --output .agentdev/graph

# グラフ検査
bun .opencode/skills/agentdev-artifact-graph/scripts/src/check_graph.ts --graph .agentdev/graph

# 問い合わせ: neighbors
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph neighbors requirement:REQ-001 --depth 2

# 問い合わせ: path
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph path requirement:REQ-001 specification:docs/specs/feature.md --max-depth 4

# 問い合わせ: provenance
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph provenance requirement:REQ-001

# 問い合わせ: discover（discovery_roots を探索）
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --root . discover "search-term" --roots src,tests

# ワークフロー統合（fail-open）
bun .opencode/skills/agentdev-artifact-graph/scripts/src/prepare_graph.ts --root . --output .agentdev/graph

# verification feedback
bun .opencode/skills/agentdev-artifact-graph/scripts/src/verify_graph.ts --root . --graph .agentdev/graph
```

問い合わせ結果は候補取得に限って使用する。根拠ファイルを読み、別手段で補完または反証してから判断する。

## augmentation モデル

node_types, relation_types, indexed_paths, discovery_roots は augmentation で追加可能である（REQ-012-004、REQ-012-006）。augmentation が存在しなくても標準動作する（REQ-012-005）。

augmentation ファイルのデフォルト配置先は `.agentdev/artifact-graph.yaml` である。`--augmentation` フラグで明示的にパスを指定できる。スキーマの詳細は [references/augmentation.md](references/augmentation.md) 参照。

```yaml
# .agentdev/artifact-graph.yaml の例（project augmentation）
node_types:
  - name: guide
    path_pattern: "^docs/guides/([^/]+)\\.md$"
    id_template: "guide:{match1}"
    label_source:
      - kind: first_heading
    extraction_rule: frontmatter
relation_types:
  - name: documented_in
    fields: [documented_in]
    reverse_direction: false
indexed_paths:
  - docs/guides
discovery_roots:
  - src
  - tests
```

## 標準ワークフローからの補助利用

### fail-open（REQ-012-010、REQ-012-012）

Graph 不在・stale・生成失敗でも代替探索へ fallback し、標準 workflow を恒常停止しない。

| prepare_graph status | freshness | 扱い |
|---|---|---|
| `ready` | `current` | 現在の派生索引として候補取得に使用する |
| `ready` | `regenerated` | 再生成した派生索引を候補取得に使用する |
| `limited` | `stale` | 陳腐化を明示し、既存索引を補助的な候補取得だけに使用する |
| `unavailable` | `missing` / `invalid` | Artifact Graph を使用せず、従来の探索手段で標準ワークフローを続行する |

`limited` と `unavailable` は標準ワークフローの停止条件ではない。生成失敗の理由は実行報告へ残すが、その失敗だけを理由に command または skill を失敗させない。

### verification feedback（REQ-012-011）

`verify_graph.ts` は Graph と独立確認結果（filesystem 直接走査）の差異を検出、分類、報告する。

- `canonical_defect`: 正規成果物に問題がある（例: リンク切れ）
- `graph_defect`: Graph の抽出に問題がある
- `matched`: Graph と独立確認が一致

差異は原因分類し、Graph を直接手編集せず原因側を修正して再生成する（REQ-012-012）。詳細は [references/verification.md](references/verification.md) 参照。

### Graph は SSoT ではない

グラフ結果を変更対象、操作単位、要件充足、責務重複の確定根拠として使用しない。グラフから候補を取得した後、根拠ファイルを読み、`rg` などの別手段で補完、反証してから判断する。構造的重複候補と意味的な責務重複を区別する。グラフ不在を「影響なし」とする判断を行わない。

## consumer 環境での動作（REQ-012-008）

consumer 環境では AgentDevFlow 配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`、`.agentdev-plugin/**`）を `indexed_paths` に含めない。デフォルト設定ではこれらのパスは indexed_paths に含まれないため、生成 Graph にこれらのパターンのノードは0件となる。

consumer が AgentDevFlow運用（REQ/ADR/SPEC）を採用しない場合、Graph は空で生成されるが正常状態である（REQ-012-014）。

## discovery_roots（REQ-012-007）

project-owned source（`src/tests/scripts/config` 等）は `indexed_paths` へ含めず、`discovery_roots` と query 時 filesystem 補完で必要時探索する。標準スキルは固定 directory 知識を埋め込まない。

`discover` サブコマンドは指定した `discovery_roots` 配下を走査し、検索語を含むファイルを返す。

## 責務境界

- `declared` と `derived` の関係だけを生成し、`inferred` は生成しない。
- `.agentdev/graph/` を手編集または Git 管理しない。
- グラフ不在や生成失敗を「影響なし」の根拠にしない。
- グラフから変更対象、要件充足、責務重複を確定しない。
- 構造的重複候補を意味的な責務重複の確定結果として扱わない。

## 必要な reference の選択条件

| 条件 | 読む reference |
|---|---|
| augmentation スキーマの詳細、node_type/relation_type 追加方法、id_template、label_source の形式 | [references/augmentation.md](references/augmentation.md) |
| verification feedback 機構の詳細、差異分類、回帰検証手順 | [references/verification.md](references/verification.md) |

## See Also

- **SPEC**: `agentdev-artifact-graph` SPEC（`docs/specs/skills/agentdev-artifact-graph.md`）
- **REQ-012**: Artifact Graph 標準化
- **ADR-007**: Artifact Graph 標準化と配布スキル昇格
- **ADR-002**: OpenCode ソース・プロジェクション分離（配布物原本は src/opencode/ へ）
- **旧 repo-local 実装**: `.opencode/skills/repo-agentdev-artifact-graph/`（self-hosting 固有、Issue #1951 で augmentation へ移行予定）
