---
name: agentdev-artifact-graph
description: Builds and inspects the Artifact Graph (derived index of explicit artifact relations). USE FOR: generating the graph, checking graph integrity, querying relations (neighbors, path, provenance), high-level trace queries (related, impact, dependency, implementation, diagnostics), or locating provenance in consumer and self-hosting environments. DO NOT USE FOR: replacing canonical documents, inferring semantic relations, editing graph outputs, treating Graph as SSoT.
---

# agentdev-artifact-graph

AgentDevFlow 標準配布スキル。
正規成果物（REQ/Decision/Design）間の明示関係を検索する派生索引（Artifact Graph）を生成、検査、問い合わせる（REQ-{NNNN}、DEC-{N}）。

consumer と self-hosting の両環境で動作する。
標準コアと augmentation を分離し、open extensibility によって self-hosting 固有知識を標準契約から除外する。
AgentDevFlow 標準の成果物間探索モデルとして機能する。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-artifact-graph` Design である。
Design を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は Design を正とする。

## TIM と派生索引としての位置付け

Traceability Information Model（TIM）を成果物間トレーサビリティの正規論理モデルとする。
本スキルが生成する Artifact Graph は、TIM に基づくトレーサビリティ情報から生成される再生成可能な派生索引であり、グラフの物理保存形式（`.agentdev/graph/` の5ファイル）を TIM そのものとはみなさない。
標準語彙対応、意味定義、探索方向導出規則の詳細は [references/tim.md](references/tim.md) 参照。

TIM が表現する要素と派生索引上の対応:

| TIM 表現要素 | 派生索引上の対応 |
|---|---|
| 成果物型 | node type（`manifest.json` の `node_types`、`node_type_roles`） |
| トレースリンク型・関係の意味・変更影響方向・関係制約 | relation type と意味定義（`manifest.json` の `relation_semantics`） |
| リンク元・リンク先成果物型 | edge の `source` / `target` |
| 根拠情報への関連付け | provenance（全ノード・全関係から取得可能） |

## 標準コア（デフォルト）

標準コアは self-hosting 固有知識を持たない（REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}、DEC-{N} decision {N}）。

| 項目 | デフォルト値 |
|---|---|
| indexed_paths | `docs/requirements`, `docs/decisions`, `docs/designs`（3種） |
| node_types | `requirement`, `decision`, `design`（3種） |
| relation_types | `references`, `supersedes`, `defined_in`, `contains`, `extends`（5種） |
| discovery_roots | 空（augmentation で追加） |

node_types と relation_types は closed-enum ではなく、augmentation から追加可能な open extension point である（REQ-{NNNN}-{NNN}、DEC-{N} decision {N}）。
標準コア5関係型の意味定義（意味スロット、変更影響方向、標準語彙対応）は TIM 語彙カタログが所有し、augmentation で再定義できない。
`decision` は ADF 固有の拡張成果物型であり、Decision 専用の関係型を持たない。

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

`.agentdev/graph/` は手編集せず、正規情報として扱わない。
Git 管理対象外とする（試行期間中）。

## Scripts（決定的処理）

`scripts/` 配下の決定的スクリプトが、Artifact Graph の生成、検査、問い合わせを機械的に実行する。
実装は TypeScript、決定的（純粋関数）、テスト付き（`tests/*.test.ts`）。

### I/O 契約（共通）

| 項目 | 規約 |
|---|---|
| 入力 | argv（`--root`, `--output`, `--graph`, `--augmentation` 等） |
| 出力 | stdout に JSON |
| エラー | 非ゼロ終了コード + stderr にエラーメッセージ |
| 決定性 | 同一入力からバイト同一の5ファイルを生成（REQ-{NNNN}-{NNN}） |

### 公開操作契約（スクリプト一覧）

| スクリプト | 役割 | 入力 | 出力 JSON |
|---|---|---|---|
| `build_graph.ts` | グラフ生成 | `--root`, `--output`, `--augmentation` | `{ files, nodeCount, edgeCount, diagnosticCount, inputDigest }` |
| `check_graph.ts` | グラフ検査 | `--graph` | `{ valid, errors[], warnings[] }` |
| `query_graph.ts` | グラフ問い合わせ | `--graph`, `--root`, サブコマンド+引数 | 低位: `{ nodes[], edges[], relations[], provenance[], discovered? }` / 高位: `{ profile, start, candidates[], truncation? }` |
| `prepare_graph.ts` | ワークフロー統合（fail-open） | `--root`, `--output`, `--augmentation` | `{ status, freshness, graphPath, reason? }` |
| `verify_graph.ts` | verification feedback | `--root`, `--graph`, `--augmentation` | `{ summary, differences[] }` |

query_graph.ts のサブコマンド:

| サブコマンド | 種別 | 説明 |
|---|---|---|
| `neighbors`, `path`, `provenance`, `discover` | 低位問い合わせ | 全関係（意味定義の有無を問わない）を利用する |
| `related`, `impact`, `dependency`, `implementation` | 高位問い合わせ（プロファイル） | TIM の関係意味から導出した参加可否・探索方向で走査する |
| `index` | 明示的な索引構造問い合わせ | 対象成果物の役割と一般参照による索引構造を返す |

### 実行方法

```bash
# グラフ生成
bun .opencode/skills/agentdev-artifact-graph/scripts/src/build_graph.ts --root . --output .agentdev/graph

# グラフ検査
bun .opencode/skills/agentdev-artifact-graph/scripts/src/check_graph.ts --graph .agentdev/graph

# 問い合わせ: neighbors
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph neighbors requirement:REQ-{NNNN} --depth 2

# 問い合わせ: path
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph path requirement:REQ-{NNNN} design:docs/designs/<feature>.md --max-depth 4

# 問い合わせ: provenance
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph provenance requirement:REQ-{NNNN}

# 問い合わせ: discover（discovery_roots を探索）
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --root . discover "search-term" --roots src,tests

# 高位問い合わせ: related（明示的なトレース・一般参照の関連候補）
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph related requirement:REQ-{NNNN}

# 高位問い合わせ: impact（起点成果物の変更影響候補）
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph impact design:docs/designs/<feature>.md --depth 2

# 高位問い合わせ: dependency（起点が依存する候補）
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph dependency requirement:REQ-{NNNN}

# 高位問い合わせ: implementation（要件を実現・充足する成果物候補）
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph implementation requirement:REQ-{NNNN}

# 高位問い合わせ: diagnostics（構造診断）
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph diagnostics --limit 20

# 明示的な索引構造問い合わせ
bun .opencode/skills/agentdev-artifact-graph/scripts/src/query_graph.ts --graph .agentdev/graph index catalog:INDEX-{NNN}

# ワークフロー統合（fail-open）
bun .opencode/skills/agentdev-artifact-graph/scripts/src/prepare_graph.ts --root . --output .agentdev/graph

# verification feedback
bun .opencode/skills/agentdev-artifact-graph/scripts/src/verify_graph.ts --root . --graph .agentdev/graph
```

問い合わせ結果は候補取得に限って使用する。
根拠ファイルを読み、別手段で補完または反証してから判断する。

## 高位問い合わせ（Trace Query）

related、impact、dependency、implementation、diagnostics の5種を問い合わせプロファイルとして提供する（REQ-{NNNN}）。
各プロファイルは TIM の関係意味（意味スロット、変更影響方向、依存方向）から探索方向を導出し、問い合わせごとの個別ハードコードを持たない。

| プロファイル | 意味 | 探索方向 |
|---|---|---|
| `related <node>` | 明示的なトレースまたは一般参照を持つ関連候補。変更影響・依存として解釈しない | 双方向 |
| `impact <node>` | 変更影響を受ける候補。TIM の変更影響方向（forward/backward/bidirectional/none）から導出。一般参照（変更影響なし）を経路として使用しない | 関係ごとの変更影響方向（順方向・逆方向・双方向） |
| `dependency <node>` | 起点が成立・実現・実行のために依存する候補。依存と定義されていない一般参照を扱わない | 意味スロットごとの順方向・逆方向 |
| `implementation <node>` | 実現・実装・充足系列（realize/satisfy/implement スロット）の関係を持つ候補 | 逆方向 |
| `diagnostics` | 通常の関連探索と分離した構造診断（孤立、未解決関係、廃止成果物への関係、関係制約違反、循環候補、複数経路、関係集中、根拠欠落）。構造的特徴の報告であり異常の確定ではない | — |

一般参照（`references`、SysML «trace» 相当）は変更影響・依存・実現・充足・検証の意味を持たないため、impact、dependency、implementation へ参加しない。
関連成果物確認（related）、所在確認、低位問い合わせ、明示的な索引構造問い合わせで利用できる。

共通規約:

- 候補は5要素（`candidate`、`reason`、`relation_type`、`direction`、`path`）で返す。根拠詳細は `provenance` 低位問い合わせの責務であり、高位問い合わせ結果へ重複保持しない
- 候補数上限は問い合わせ時設定として管理し、コードへ直書きしない。augmentation の `query_settings.limits` で上書きでき、`--limit` でその実行のみ上書きできる。派生索引の再生成条件に含めない
- 上限超過時は決定論的な優先・除外規則（索引・集約役割ノードの除外、距離昇順・経路辞書順）を適用し、それでも超える場合は `truncation`（全候補数、返却候補数、適用規則、`independent_search_available: true`）を返す。候補を黙って切り捨てない
- 候補0件は正常な空結果として扱う
- 意味定義を持たない拡張関係型は高位問い合わせに参加しない（名前からの意味推定をしない）。低位問い合わせ（neighbors、path、provenance）では利用できる
- `role: index` / `role: aggregation` を持つノード種別は、索引経由の候補増幅抑止のため高位問い合わせの候補・経路から除外する（グラフからの削除はしない）
- 標準5関係型の意味割り当ては TIM 語彙カタログ Design（`docs/designs/<foundations/traceability-model>.md`）が正であり、`lib/tim.ts` はその in-code 反映である。標準コア関係型の意味は augmentation で再定義できない
- 関係制約（`relation_constraints`）が定義された関係型のみ、diagnostics が制約違反を判定する

`discover` の `discovery_roots` は、`--roots` 未指定時に適用後設定（augmentation）から自動解決する。
明示指定時はその実行に限って上書きする（REQ-{NNNN}-{NNN}）。

## augmentation モデル

node_types, relation_types, indexed_paths, discovery_roots は augmentation で追加可能である（REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}）。
augmentation が存在しなくても標準動作する（REQ-{NNNN}-{NNN}）。

relation_types には `semantics`（関係の意味 `meaning`、意味スロット `semantics_slot`、変更影響方向 `change_impact_direction`、標準語彙 `standard_vocabulary`、関係制約 `source_types`/`target_types`）、node_types には `role`（`index` / `aggregation`）、トップレベルには `query_settings`（`limits`、`depths`、`concentration_threshold`）と `relation_constraints` を指定できる。
高位問い合わせ（Trace Query）の意味定義と候補数上限はこれらで拡張する。
標準コア関係型の意味は TIM 語彙カタログが正規所有するため augmentation では再定義できない。

augmentation ファイルのデフォルト配置先は `.agentdev/artifact-graph.yaml` である。
`--augmentation` フラグで明示的にパスを指定できる。
スキーマの詳細は [references/augmentation.md](references/augmentation.md) 参照。

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

## 索引・集約成果物の役割識別

README、INDEX、CATALOG 等の名称ではなく、成果物型の役割（`role: index` または `aggregation`、augmentation の node_types で宣言）として索引・集約成果物を識別する。
索引・集約成果物であることだけを理由として成果物またはその関係をグラフから削除しない。
変更影響等からの除外判断は成果物名ではなくトレースリンクの意味に基づく。
`index` サブコマンドで対象成果物の役割と一般参照による索引構造を問い合わせできる。

## 鮮度判定と利用時再生成

正規入力ファイルの更新ごとに常時派生索引を再生成しない。
鮮度保証を必要とする利用の直前（prepare_graph）に鮮度を確認し、不一致または索引不在・破損の場合のみ再生成する。
鮮度は次の4要素で判定し、すべて一致する場合のみ既存索引を再利用する:

1. `input_digest`（正規入力ファイルの内容）
2. `graph_config_digest`（生成に影響する設定。`discovery_roots`、候補数上限、表示設定など問い合わせ時設定は含めない）
3. `generator_version`
4. `schema_version`（非互換グラフは読み込み時に失敗し、再生成される）

生成不能の場合の動作は fail-open（次節）に従う。

## 標準ワークフローからの補助利用

### fail-open（REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}）

Graph 不在・stale・生成失敗でも代替探索へ fallback し、標準 workflow を恒常停止しない。

| prepare_graph status | freshness | 扱い |
|---|---|---|
| `ready` | `current` | 現在の派生索引として候補取得に使用する |
| `ready` | `regenerated` | 再生成した派生索引を候補取得に使用する |
| `limited` | `stale` | 陳腐化を明示し、既存索引を補助的な候補取得だけに使用する |
| `unavailable` | `missing` / `invalid` | Artifact Graph を使用せず、従来の探索手段で標準ワークフローを続行する |

`limited` と `unavailable` は標準ワークフローの停止条件ではない。
生成失敗の理由は実行報告へ残すが、その失敗だけを理由に command または skill を失敗させない。

### verification feedback（REQ-{NNNN}-{NNN}）

`verify_graph.ts` は Graph と独立確認結果（filesystem 直接走査）の差異を検出、分類、報告する。

- `canonical_defect`: 正規成果物に問題がある（例: リンク切れ）
- `graph_defect`: Graph の抽出に問題がある
- `matched`: Graph と独立確認が一致

差異は原因分類し、Graph を直接手編集せず原因側を修正して再生成する（REQ-{NNNN}-{NNN}）。
詳細は [references/verification.md](references/verification.md) 参照。

### Graph は SSoT ではない

グラフ結果を変更対象、操作単位、要件充足、責務重複の確定根拠として使用しない。
グラフから候補を取得した後、根拠ファイルを読み、`rg` などの別手段で補完、反証してから判断する。
構造的重複候補と意味的な責務重複を区別する。
グラフ不在を「影響なし」とする判断を行わない。

## consumer 環境での動作（REQ-{NNNN}-{NNN}）

consumer 環境では AgentDevFlow 配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`、`.agentdev-plugin/**`）を `indexed_paths` に含めない。
デフォルト設定ではこれらのパスは indexed_paths に含まれないため、生成 Graph にこれらのパターンのノードは0件となる。

consumer が AgentDevFlow運用（REQ/Decision/Design）を採用しない場合、Graph は空で生成されるが正常状態である（REQ-{NNNN}-{NNN}）。

## discovery_roots（REQ-{NNNN}-{NNN}）

project-owned source（`src/tests/scripts/config` 等）は `indexed_paths` へ含めず、`discovery_roots` と query 時 filesystem 補完で必要時探索する。
標準スキルは固定 directory 知識を埋め込まない。

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
| augmentation スキーマの詳細、node_type/relation_type 追加方法、id_template、label_source の形式、関係型の意味定義（semantics）、索引・集約成果物の役割（role） | [references/augmentation.md](references/augmentation.md) |
| TIM 標準語彙対応、意味スロット、変更影響方向4値、探索方向導出規則、一般参照と意味的トレースリンクの分離、鮮度判定4要素 | [references/tim.md](references/tim.md) |
| verification feedback 機構の詳細、差異分類、回帰検証手順 | [references/verification.md](references/verification.md) |

## See Also

- **Design**: `agentdev-artifact-graph` Design（`docs/designs/<skills/agentdev-artifact-graph>.md`）
- **REQ-{NNNN}**: Artifact Graph 標準化
- **DEC-{N}**: Artifact Graph 標準化と配布スキル昇格
- **DEC-{N}**: OpenCode ソース・プロジェクション分離（配布物原本はソースツリー、実行時投影先は `.opencode/`）
- **self-hosting augmentation**: `.agentdev/artifact-graph.yaml`（Issue #1951 で移行、旧リポジトリ固有実装を廃止）
