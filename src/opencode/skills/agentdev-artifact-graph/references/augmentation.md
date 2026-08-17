# augmentation スキーマ

Artifact Graph 標準スキルの open extension point 詳細。

## 配置先

デフォルト: `.agentdev/artifact-graph.yaml`

CLI 上書き: `--augmentation <path>`

augmentation が存在しなくても標準スキルは動作する。

## スキーマ

```yaml
node_types:       # 追加するノード型（配列）
  - name: string          # 必須: 型名（例: "command"）
    path_pattern: string  # 必須: リポジトリ相対パスにマッチする正規表現
    id_template: string   # 省略可: デフォルト "{name}:{path}"（例: "requirement:{match1}"）
    label_source: array   # 省略可: デフォルト [{ kind: "first_heading" }]
    extraction_rule: string # 省略可: デフォルト "frontmatter"
    role: string          # 省略可: "index" または "aggregation"（索引・集約成果物の役割識別）
relation_types:   # 追加する関係型（配列）
  - name: string          # 必須: 型名
    fields: array         # frontmatter フィールドキーのリスト
    reverse_direction: boolean # 省略可: デフォルト false
    semantics:            # 省略可: 高位問い合わせへ参加させる場合は必須（meaning と change_impact_direction）
      meaning: string           # 必須: 関係の意味
      semantics_slot: string    # 省略可: TIM 意味スロット（標準意味が当てはまらない場合は省略）
      change_impact_direction: string  # 必須: forward | reverse | both | none
      standard_vocabulary: array      # 省略可: 採用した標準語彙
      source_types: array            # 省略可: リンク元成果物型の関係制約
      target_types: array            # 省略可: リンク先成果物型の関係制約
indexed_paths:    # 追加する indexed_paths（配列）
  - string
discovery_roots:  # 追加する discovery_roots（配列）
  - string
```

`semantics` を持たない拡張関係型はグラフに生成されるが、高位問い合わせ（related、impact、dependency、implementation）へ自動参加しない。低位問い合わせ（neighbors、path、provenance）で利用できる。標準コア5関係型（references, supersedes, defined_in, contains, extends）への semantics・role 宣言はできない（TIM 語彙カタログが所有する）。意味スロットと変更影響方向の対応は [tim.md](tim.md) 参照。

## id_template 変数

| 変数 | 展開結果 |
|---|---|
| `{match1}`, `{match2}`, ... | `path_pattern` のN番目キャプチャグループ |
| `{path}` | リポジトリ相対パス全体 |
| `{stem}` | 拡張子なしのファイル名 |

## label_source step 種別

| kind | 動作 | 追加プロパティ |
|---|---|---|
| `frontmatter_field` | frontmatter フィールド値を使用 | `field`: フィールド名 |
| `first_heading` | 最初の `#` 見出しを使用 | - |
| `filename_stem` | 拡張子なしファイル名を使用 | - |
| `path_group` | `path_pattern` のN番目グループを使用 | `group`: グループ番号 |
| `literal` | 固定文字列を使用 | `value`: 文字列 |
| `path` | リポジトリ相対パス全体を使用 | - |

steps は配列の先頭から順に試し、最初に空でない値を採用する（フォールバックチェーン）。

## extraction_rule 値

`frontmatter`、`extension_field`、`filesystem` のいずれか。provenance の `extraction_rule` フィールドに記録される。

## 標準コア ルール（参考）

デフォルトの3ノード型と2関係型抽出ルール（`lib/config.ts` の `DEFAULT_NODE_TYPE_RULES`、`DEFAULT_RELATION_TYPE_RULES`）。

| 型 | path_pattern | id_template | label_source |
|---|---|---|---|
| requirement | `^docs/requirements/(REQ-\d+)\.md$` | `requirement:{match1}` | frontmatter title → first heading → filename stem |
| decision | `^docs/decisions/(?:retired/)?(DEC-\d+)\.md$` | `decision:{match1}` | frontmatter title → first heading → filename stem |
| specification | `^docs/specs/<(?!.*README\>.md$).+\.md$` | `specification:{path}` | frontmatter title → first heading → path |

| 関係型 | fields | reverse |
|---|---|---|
| references | `canonical_owner`, `context.paths` | false |
| supersedes | `superseded_by` | true |

`defined_in`、`contains`、`extends` は語彙に含まれるが、デフォルトコアではフィールドベース抽出を持たない。これらは containment/extension ロジックで、対応するノード型が augmentation で追加された場合に生成される。

## self-hosting augmentation

self-hosting augmentation は次を追加することで現行の自己ホスト運用と同等の探索能力を維持する。実装は `.agentdev/artifact-graph.yaml`（Issue #1951）を参照。

- node_type: `command`, `skill`, `integrity_rule`, `extension`, `source_file`
- relation_type: `delegates_to`, `governs`
- indexed_paths: `src/opencode`, `.opencode`, `.agentdev/extensions`, `scripts`, `tests`

`source_file` は containment logic が全入力ファイルへ対してノードを生成し、`defined_in`/`contains` edge を介して artifact node と双方向に接続する。`extension` は `.agentdev/extensions/` 配下の YAML ファイルから node を生成し、path 構造から推定した対象 command または skill へ `extends` edge を生成する。
