# TIM 意味カタログ（実行時参照）

Traceability Information Model（TIM）の語彙・意味定義のうち、`agentdev-artifact-graph` 標準コアが実装する部分の詳細（`scripts/lib/tim.ts`）。

語彙カタログの正規原本は TIM 語彙カタログ SPEC（`docs/specs/<foundations/traceability-model>.md`）である。本参照と SPEC に不一致がある場合は SPEC を正とする。

## 位置付け

- TIM を成果物間トレーサビリティの正規論理モデルとする。Artifact Graph は TIM に基づくトレーサビリティ情報から生成される再生成可能な派生索引であり、グラフの物理保存形式（`.agentdev/graph/` の5ファイル）を TIM そのものとはみなさない
- 成果物型・トレースリンク型は SysML、OSLC、OpenFastTrace 等で確立された語彙を優先して採用する。標準語彙で表現できない場合のみ ADF 固有関係を追加する

## 標準コア成果物型

| 成果物型 | 由来 | 標準語彙対応 |
|---|---|---|
| `requirement` | 標準 | SysML requirement / OSLC Requirement / OpenFastTrace requirement |
| `specification` | 標準 | OSLC Specification |
| `decision` | ADF 固有拡張 | なし。Decision 専用の関係型は追加せず、他成果物との関係は標準関係型で表現する |

## 標準コア関係型の意味定義

| 関係型 | 意味スロット | 変更影響方向 | 標準語彙対応 |
|---|---|---|---|
| `references` | general_reference（一般参照） | none | SysML «trace» |
| `supersedes` | supersede（置換・改訂） | none | Dublin Core `dct:replaces` |
| `defined_in` | specify（定義所在） | backward | OSLC specifiedBy 系（意味近似） |
| `contains` | decompose（分解） | bidirectional | SysML requirement containment / OSLC decomposedBy |
| `extends` | refine（具体化・拡張） | bidirectional | UML «extend» |

変更影響方向はリンクの記述方向（source→target）と独立に定義する。

| 方向 | 意味 |
|---|---|
| `forward` | source の変更が target に影響する |
| `backward` | target の変更が source に影響する |
| `bidirectional` | 双方向に影響する |
| `none` | 変更影響の意味を持たない（一般参照） |

## 意味スロットと探索方向導出

目的別問い合わせの探索方向・参加可否は、関係の意味定義から導出する（問い合わせごとの個別ハードコードを持たない）。

| スロット | 意味 | dependency 探索方向 | implementation 探索方向 |
|---|---|---|---|
| general_reference | 一般参照 | 参加しない | 参加しない |
| supersede | 置換・改訂 | 参加しない | 参加しない |
| decompose | 分解 | 順方向 | 参加しない |
| refine | 具体化 | 順方向 | 参加しない |
| specify | 仕様化・定義所在 | 順方向 | 参加しない |
| constrain | 制約 | 順方向 | 参加しない |
| depend | 依存 | 順方向 | 参加しない |
| realize | 実現 | 逆方向 | 逆方向 |
| satisfy | 充足 | 逆方向 | 逆方向 |
| implement | 実装 | 逆方向 | 逆方向 |
| verify | 検証 | 逆方向 | 参加しない |
| validate | 妥当性確認 | 逆方向 | 参加しない |

- impact プロファイル: 変更影響方向が `none` 以外の関係が方向値に従って参加する
- 順方向 = リンクの source から target への走査、逆方向 = target から source への走査
- 意味スロットを持たない ADF 固有の意味定義は、impact（方向値による）と related にのみ参加する

## 一般参照と意味的トレースリンクの分離

一般参照（`references`、SysML «trace» 相当）は、変更影響・依存・実現・充足・検証の意味を持たない。リンクの存在だけを理由に impact、dependency、implementation へ参加させない。

一般参照は次で利用できる: 関連成果物確認（related）、所在確認、低位問い合わせ（neighbors、path、provenance）、明示的な索引構造問い合わせ（index）。

## 拡張関係型の意味定義様式

augmentation の relation_types エントリは `semantics` ブロックで意味情報を宣言できる。高位問い合わせへ参加させる拡張関係型は、関係の意味（`meaning`）と変更影響方向（`change_impact_direction`）の明示が必須である。

```yaml
relation_types:
  - name: satisfies
    fields: [satisfies]
    semantics:
      meaning: "設計成果物が要件を充足する"   # 必須
      semantics_slot: satisfy                # 省略可（標準意味が当てはまらない場合）
      change_impact_direction: backward      # 必須: forward | backward | bidirectional | none
      standard_vocabulary: ["SysML «satisfy»"]  # 省略可
      source_types: [design]                 # 省略可: 関係制約
      target_types: [requirement]            # 省略可: 関係制約
```

- 意味定義を持たない拡張関係型: グラフ生成の対象であり、低位問い合わせで利用できる。高位問い合わせへは自動参加しない
- 不完全な意味定義（`meaning` または `change_impact_direction` の欠落）: 設定エラー（fail-open に従い prepare_graph は unavailable/limited を返す）
- 標準コア5関係型の意味定義の再定義: 不可（TIM 語彙カタログが所有する）
- 関係型名や LLM 推論からの意味の自動推定は行わない
- `source_types` / `target_types` の関係制約違反は `check_graph` の warning（`relation_constraint:source` / `relation_constraint:target`）として報告される

## 索引・集約成果物の役割識別

README、INDEX、CATALOG 等の名称ではなく、成果物型の役割（role）として識別する。役割は augmentation の node_types で宣言する。

```yaml
node_types:
  - name: catalog
    path_pattern: "^docs/catalog/(INDEX-[^/]+)\\.md$"
    id_template: "catalog:{match1}"
    role: index          # index または aggregation
```

- 索引・集約成果物をグラフから削除しない（役割であることだけを理由としたノード・関係の削除を行わない）
- 変更影響等からの除外判断は成果物名ではなくトレースリンクの意味（変更影響方向）に基づく
- `index` サブコマンドで明示的な索引構造問い合わせができる: 対象成果物の役割と、一般参照（意味スロット general_reference）でつながる索引自体の構造を返す

## 鮮度判定4要素

派生索引の鮮度は次の4要素で判定し、すべて一致する場合のみ既存索引を再利用する。

1. `input_digest`: 正規入力ファイル（相対パスと内容）
2. `graph_config_digest`: 生成に影響する設定（indexed_paths、excluded_paths、node/relation ルール、意味定義、役割）
3. `generator_version`: 生成器の版
4. `schema_version`: 派生索引スキーマの版（非互換グラフは読み込み時に失敗し、再生成される）

`discovery_roots`、候補数上限（`--limit`）、問い合わせ結果の表示設定は派生索引の生成結果へ影響しないため、`graph_config_digest` と再生成条件に含めない。
