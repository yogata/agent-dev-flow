---
title: agentdev-artifact-graph SPEC
status: draft
created: 2026-08-10
updated: 2026-08-18
spec_logical_division: behavior
canonical_owner: agentdev-artifact-graph
---

# agentdev-artifact-graph SPEC

## 目的

AgentDevFlow 標準配布スキル `agentdev-artifact-graph` は、正規成果物（REQ/Decision/SPEC）間の明示関係を検索できる Artifact Graph を生成、検査、問い合わせる。
consumer と self-hosting の両環境で動作し、標準コアと augmentation を分離することで self-hosting 固有知識を標準契約から除外する。
AgentDevFlow 標準の成果物間探索モデルとして機能する。

本 SPEC は `agentdev-artifact-graph` 配布スキルの振る舞い契約を定義する。
実行時スキル（`src/opencode/skills/agentdev-artifact-graph/SKILL.md`）は本 SPEC に依存しない（REQ-001）。

## 適用対象

**USE FOR**:
- consumer 環境、self-hosting 環境双方での Artifact Graph 生成、検査、問い合わせ
- 関連文書探索、明示参照に基づく変更影響候補の取得
- 未解決参照、廃止済み成果物への参照の検出
- 成果物間の経路探索、根拠箇所の提示
- project 固有正規成果物の node_types/relation_types 追加（augmentation 経由）

**DO NOT USE FOR**:
- Graph を SSoT とする判断（Graph は派生索引であり、正規成果物で常時確認する）
- Graph 不在時の workflow 停止（fail-open で代替探索へ fallback する）
- AgentDevFlow 配布物以外への強制適用
- LLM による全面的な関係抽出、意味的類似の決定論的確定

## 提供する判断・操作

- グラフ生成（build_graph）: 正規情報から派生索引（5ファイル）を生成する
- グラフ検査（check_graph）: 生成された Graph の整合性を検査する
- グラフ問い合わせ（query_graph）: neighbors, path, provenance 各サブコマンドで関連取得、経路探索、根拠取得を行う
- verification feedback: Graph と rg 等の独立確認結果の差異を検出、分類、是正、回帰検証する
- augmentation 受理: project augmentation と self-hosting augmentation で node_types, relation_types, indexed_paths を追加する

所有 script と公開検証契約は `agentdev-artifact-graph` スキル配下の `scripts/` が担う。
詳細な I/O 契約、CLI 形式、stdout schema は SKILL.md「Scripts（決定的処理）」を参照。

## 入力と出力

### 入力（正規情報）

標準コア デフォルト `indexed_paths`:
- `docs/requirements/`
- `docs/decisions/`
- `docs/specs/`

self-hosting augmentation が追加する `indexed_paths`:
- `src/opencode/`
- `.opencode/`
- `.agentdev/extensions/`
- `scripts/`
- `tests/`

consumer 環境では AgentDevFlow 配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`、`.agentdev-plugin/**`）を `indexed_paths` へ含めず、生成 Graph へこれらパターンのノードを含めない。

### 出力（派生索引）

`.agentdev/graph/` 配下に5ファイルを生成する:

- `manifest.json`
- `nodes.jsonl`
- `edges.jsonl`
- `provenance.jsonl`
- `diagnostics.json`

`.agentdev/graph/` は手編集せず、正規情報として扱わない。

## 問い合わせ結果の出力形式

query_graph.ts の問い合わせ結果は、各関係について以下の情報を含める。

- 関係ID（既存）
- 関係 type（関係種別、例: depends_on、derived_from）
- source（接続元ノード）
- target（接続先ノード）
- 根拠 evidence（既存）

既存のノードID、関係ID、根拠情報との互換性を維持し、新規フィールドを追加する形式とする。

query_graph.ts のサブコマンド構成を次のとおり確定する。

- 構造問い合わせ: `neighbors`（近傍）、`path`（到達経路）、`provenance`（根拠）、`discover`（語句探索）、`index`（索引情報）
- 高位問い合わせ: プロファイル名（`related`、`impact`、`dependency`、`implementation`、`diagnostics`）をサブコマンドとして直接指定できる
- 出力は全サブコマンド共通で JSON（機械可読）とする。text や table などの人間向け表示形式は持たず、整形は呼出側の責務とする

## 高位問い合わせプロファイル

高位問い合わせ related、impact、dependency、implementation、diagnostics を
問い合わせプロファイルとして定義する。各プロファイルは TIM の意味を利用し、
独立した関係モデルを持たない。

- related: 起点成果物と明示的なトレースまたは一般参照を持つ関連成果物候補の取得。
  結果を変更影響または依存関係として解釈しない
- impact: 起点成果物を変更した場合に影響を受ける可能性がある成果物候補の取得。
  探索方向は TIM に定義された関係の変更影響意味から導出する。一般参照または変更影響なしと
  定義された関係を、単にリンクが存在することだけを理由に探索経路として使用しない
- dependency: 起点成果物が成立、実現または実行されるために依存する成果物候補の取得。
  依存関係として定義されていない一般参照を依存関係として扱わない
- implementation: 要件、仕様、設計等を実現・実装する成果物候補の取得。
  実現・実装・充足系列の関係を利用する。将来 coverage 問い合わせへ統合・上位化できる設計
- diagnostics: 構造上の注目候補（孤立候補、未解決関係、廃止成果物への関係、関係制約違反、
  循環候補、複数経路、関係集中、根拠欠落）の診断。構造的特徴だけから異常を確定しない。
  ADF 固有の所有・統制構造等は ADF Integration 層の診断規則として扱う

共通規則:
- 候補数上限は問い合わせ設定として管理し、コードへ直書きしない。プロジェクト拡張は
  上限を上書き可能とする。標準上限値の決定は代表ケースによる回帰検証結果に基づく
- 上限超過時は決定論的な優先・除外規則を適用し、それでも超える場合は候補過多であること、
  全候補数、返却候補数、適用した絞り込み規則、独立探索へ移行可能であることを返す。
  候補過多のみを理由として ADF ワークフロー全体を停止させない
- 問い合わせ結果は候補ごとに候補成果物、候補となった理由、トレースリンク型、探索方向、
  到達経路を確認可能とする。詳細な根拠箇所は根拠問い合わせ（provenance）の責務とし、
  高位問い合わせへ根拠詳細を重複保持しない
- 候補が存在しない場合、正常な空結果として扱う

### 標準候補数上限の決定手順

標準候補数上限の値は固定値として確定せず、次の手順に従って決定する（REQ-040-008、REQ-020-006）。

1. 暫定の関係意味表を実装から TIM 語彙カタログ定義（traceability-model.md）へ置換する
2. 置換後のカタログ定義で回帰スイートを再実行し、期待出力との差異を文書化する（差分文書化を受け入れ条件に含める）
3. representative query suite の実測から recommended_standard_limit を算出し、増幅実測値（上位候補の追加増分）と突合する
4. 標準上限値を最終決定し、問い合わせ設定の標準値へ反映する

運用契機はカタログ置換後の再計測を前提とし、カタログ変更を伴わない上限値の暫定運用は行わない。

Issue #2204（OU-0002）でのカタログ置換後再計測に基づく決定結果は次のとおりである。

- 標準上限値（related、impact、dependency、implementation）: 12。diagnostics は構造診断であり候補数上限回帰の対象外のため決定対象としない
- 決定根拠: recommended_standard_limit 実測値 9（全代表ケースの必須候補を保持する最小上限値）以上で、AI へ渡す候補量の実用範囲に収まる値として 12 を決定した。初期値 30 と暫定実測推奨 12 の乖離は本決定で解消した
- 増幅実測値との突合: 索引・集約成果物経由の増幅（代表ケースの意味列挙との差分 42〜74 件）は候補数上限ではなく索引役割宣言（`index`）による探索経路除外で抑制する。上限を超過した代表ケース（13 件、46 件）は候補過多時5項目を返す
- 手順1〜3の実行記録と期待出力の差異: [candidate-limit-tim-catalog-diff-20260818.md](../integrity/audits/candidate-limit-tim-catalog-diff-20260818.md)

## グラフモデル（open extensibility を含む）

### 標準コア node_types（デフォルト）

- `requirement`
- `decision`
- `specification`

### 標準コア relation_types（デフォルト）

- `references`
- `supersedes`
- `defined_in`
- `contains`
- `extends`

### open extensibility

`node_types` と `relation_types` は closed-enum ではなく augmentation から追加可能な open extension point として実装する。

augmentation が追加可能な node_type 例: `command`, `skill`, `integrity_rule`, `extension`, `source_file`
augmentation が追加可能な relation_type 例: `delegates_to`, `governs`

### 関係カテゴリ

関係は `declared`（宣言された関係）と `derived`（正規情報から導出した関係）を対象とする。
意味的に推定する `inferred` は予約値にとどめ、標準実装では生成しない。

## 抽出契約

### 抽出順序

抽出元は次の順で段階導入する。

1. YAML フロントマター
2. 既知の構造化 field
3. Markdown リンク
4. extension の `id`、`context.paths`、`rules.skill`、`checks.skill`
5. 既知の見出しまたは表内にある識別子
6. 自由文中の裸の識別子

標準実装では 1 から 4 を必須対象とする。
5 は対象文書と記法を限定して導入し、6 は誤検出評価が完了するまで対象外とする。

### 成果物の版区別

現行成果物、廃止済み成果物、`v2:` で識別される過去版、コードブロック内の例示、検出規則を説明する識別子を区別する。

## 解析品質と回帰検証

### 解析スクリプトの対応 YAML 構造の明示契約

agentdev-artifact-graph の解析スクリプト群（parse.ts 等）は対応する YAML 構造を明示する（REQ-020-001）。
対応構造は次を含む。

- frontmatter（`id`, `title`, `status`, `created`, `updated`, `superseded_by` 等）
- 既知の構造化 field（`spec_logical_division`, `canonical_owner` 等）
- extension 仕様の構造化 field（`context.paths`, `rules.skill`, `checks.skill` 等）
- その他抽出順序で明示した構造（Markdown リンク、既知の見出し、表内識別子）

対応構造の追加、変更は SPEC 更新で明示し、スクリプトの内部実装へ暗黙に埋め込まない。

### 未対応 YAML 構造の診断契約

解析スクリプトは入力 YAML に未対応構造を検出した場合、構造の種別と出現位置（path、見出し、行範囲）を診断情報として `diagnostics.json` または標準エラー出力へ出す（REQ-020-002）。
診断は抽出失敗ではなく、抽出範囲外の入力が存在することの報告である。
fail-open 原則に従い、未対応構造の存在だけでグラフ生成を停止しない。

### 代表質問回帰検証への実入力組込み契約

agentdev-artifact-graph は代表質問回帰検証（10件）を解析スクリプトへの実入力として組み込む（REQ-020-003）。
実行契約は次のとおり。

- **入力**: 実入力 fixture（後述の設計原則に従ってキャプチャした10件の代表質問）
- **実行契機**: 解析スクリプト、抽出ルールの変更時、および定期回帰検証
- **期待出力**: 各代表質問に対して Graph が返すノード、関係、経路、根拠
- **合格基準**: 過去の期待出力とバイト単位または要素単位で一致すること。差異がある場合は変更影響を文書化し、期待出力を更新した上で再検証する

### 代表質問10件の選定基準

代表質問10件は次のいずれかの基準で選定し、合計10件を上限とする（REQ-020-005）。

1. **高頻度運用質問**: 過去運用での高頻度質問上位10件。頻度は問い合わせ履歴、利用ログ、Issue 等の実績データから集計する
2. **経路クラス別代表サンプル**: Artifact Graph 経路クラス別（隣接、パス、プロベナンス、発見的抽出）の代表サンプルを合計10件上限で抽出

選定基準の採用、差し替えは SPEC 更新で明示し、実装に埋め込まない。

### 実入力 fixture 設計原則

実入力 fixture は次の設計原則に従う（REQ-020-004）。

- **選定基準の明示**: 各 fixture がどの代表質問、経路クラス、入力パターンを代表するかをメタデータとして保持する
- **配置先**: fixture は標準スキル配下の所定ディレクトリ（例: `tests/fixtures/`）へ配置し、配布物と明確に区別する
- **再現性**: 同一 fixture から同一の Graph 結果が得られること。`manifest.json` の `input_digest` 等の決定論性条件を満たす
- **機密情報除去**: 実プロジェクト由来の入力を fixture 化する場合は、REQ/Decision/SPEC の具体内容を抽象化またはダミー化し、機密情報を含めない
- **版管理**: fixture の追加、変更、廃止は SPEC 更新で明示し、暗黙に変更しない

## check_graph.ts 抽出規則と warning 分類

未解決参照の抽出結果は参照種別と参照元で分類し、以下の重要度で扱う。

- 解決可能な相対参照: warning 対象外（除外）
- 識別子・説明語で解決対象外: info（参照記録として保持、検出対象外明示）

抽出規則の変更時は候補探索の補完・反証機能を維持し、回帰検証を実施する。

## 根拠追跡

すべてのノードと関係から、次の根拠情報を取得できるようにする。

- `path`
- `heading`
- `element_id`
- `matched_text`
- `matched_text_hash`
- `line_start`
- `line_end`
- `extraction_rule`

`path`、見出し、要素 ID、抽出文字列のハッシュを安定した根拠識別に使用する。
行番号は人が根拠へ移動するための補助情報とし、要素の主識別子には使用しない。

## 決定論性と鮮度

`manifest.json` は少なくとも次を保持する。

- `schema_version`（現行スキーマ版は `2.0.0`）
- `generator_version`
- `input_digest`（対象入力ファイルの相対パスと内容から計算する 64 桁十六進ダイジェスト）
- `indexed_paths`
- `excluded_paths`
- `node_types`（当該生成に参加した node_type の一覧）
- `relation_types`（当該生成に参加した relation_type の一覧）

現在時刻を表す `generated_at` は決定論的生成物に含めず、必要な実行日時は標準出力または実行報告へ記録する。
`input_digest` は対象入力ファイルの相対パスと内容から計算する。

`.agentdev/graph/**`、`.git/**`、ビルド成果物、キャッシュ、一時ファイル、作業ツリー固有の管理ファイルは入力から除外する。

同一入力（`input_digest`, `indexed_paths`, `excluded_paths`, `schema_version`, `generator_version` が同一）から生成した5ファイル（`manifest.json`、`nodes.jsonl`、`edges.jsonl`、`provenance.jsonl`、`diagnostics.json`）はバイト単位で同一になるようにする。

## augmentation モデル

### project augmentation

consumer は project 固有正規成果物を `node_types`, `relation_types` へ追加できる。
project augmentation が存在しなくても標準スキルは動作する（fail-open）。

consumer が AgentDevFlow 運用（REQ/Decision/SPEC）を採用しない場合、Graph は空で生成されるが正常状態とする。

project-owned source（`src/tests/scripts/config` 等）は `indexed_paths` へ含めず、project augmentation の `discovery_roots`（明示参照起点リスト）と query 時の `rg`/filesystem 補完で必要時探索する。
標準スキルは固定 directory 知識を埋め込まない。

augmentation ファイル（`.agentdev/artifact-graph.yaml`）のスキーマ拡張点を次の4系統として確定する。各拡張点は宣言的に記述し、手続き的ロジックを含めない。

1. `node_types` 定義: `name`、`path_pattern`、`id_template`、`label_source`、`extraction_rule`、`role`（`index` / `aggregation`）
2. `relation_types` 定義: `name`、`fields`、`reverse_direction`、`semantics`（関係の意味、意味スロット、変更影響方向、標準語彙対応、関係制約（`source_types` / `target_types`））
3. `indexed_paths` と `discovery_roots`（対象と探索起点の宣言）
4. `query_settings` と `relation_constraints`（問い合わせ上限・深さの上書きと関係制約）

標準コアの成果物型・関係型の意味は TIM 語彙カタログ（[../foundations/traceability-model.md](../foundations/traceability-model.md)）が正規所有する。
augmentation は標準コアの node_type への `role` 宣言、relation_type への `semantics` 宣言を拒否する。
抽出規則（`path_pattern`、`fields` 等）の上書きはこの限りでない。
拡張関係型の高位問い合わせ参加区分は宣言せず、`semantics` の意味スロットと変更影響方向から導出する。

### self-hosting augmentation

self-hosting augmentation は次を追加することで現行 repo-local と同等の探索能力を維持する。

- node_type: `command`, `skill`, `integrity_rule`, `extension`, `source_file`
- relation_type: `delegates_to`, `governs`
- indexed_paths デフォルトへ: `src/opencode`, `.opencode`, `.agentdev/extensions`, `scripts`, `tests`

## augmentation 配置先

Artifact Graph 標準配布スキルの augmentation は専用配置
（.agentdev/artifact-graph.yaml）を正規配置とする。

### 選定根拠

- augmentation は Artifact Graph の relation 追加データを担う独立関心であり、
  project-extensions 機構が担う「標準配布スキルの挙動に対する project 固有拡張
  （context/rules/checks/acceptance_gates/must_not）」とは責務が異なる
- 専用配置により、augmentation データ形式と project-extensions 拡張データの
  競合・混同を防ぐ

### project-extensions 機構（DEC-005）との使い分け

| 配置先 | 用途 | 対象 |
|--------|------|------|
| .agentdev/artifact-graph.yaml | Artifact Graph relation 追加データ | augmentation |
| .agentdev/extensions/skills/agentdev-artifact-graph.yaml | 標準配布スキル挙動への project 固有拡張 | context/rules/checks/acceptance_gates/must_not |

### 今後の評価

段階3 Issue #1951（Self-hosting 移行）で project-extensions 機構との
整合性を再評価する予定である。

## ワークフロー利用

| ワークフロー | 主な問い合わせ |
|---|---|
| req-define | related、impact、必要に応じて dependency |
| spec-save | related |
| case-open | impact、dependency |
| case-run | implementation（既に決定された実装対象と正規成果物の実現関係確認。新規の依存関係、実行構成、Wave 構成、実行順序の設計は行わない） |
| case-close | 必要に応じて整合性確認 |
| backlog-review | related、impact（統合・分割判定の補助 evidence、depends_on 依存解決の補助 evidence） |
| adversarial-review | diagnostics、論点に応じた他問い合わせ |
| inspect-docs 等 | diagnostics |

この割り当ては ADF の責務分担を表すものであり、TIM そのものへ組み込まない。
ADF 固有ワークフローは TIM、派生索引、問い合わせ内部規則を独自に再定義せず、
問い合わせ目的を指定し返された候補を利用して判断する。
問い合わせ結果を最終判断として扱わず、正規成果物本文、rg 等の文字列探索、ファイル探索等の
独立確認手段を必要な判断で利用する。派生索引の不在、生成失敗、空結果、候補過多だけを
理由として「関係なし」「影響なし」と判断しない。

## 障害耐性

グラフが存在しない場合も標準ワークフローが従来どおり続行する（fail-open）。
グラフが古い場合は再生成するか、古い状態であることを明示して補助利用に限定する。
グラフ生成失敗だけを理由に標準ワークフローを恒常的に停止しない。
fallback 時は README と `rg` の組合せで人間が確認できる水準を保持する。

## 効果検証

Artifact Graph の検証を2種類に分離する。

### Parser / Graph regression

Graph parser, augmentation, relation extraction, provenance の正確性を検証する。
本層は REQ-020 が所有し、既存 extension 構造等を用いた代表 fixture で維持する。
詳細は REQ-020 および対応 SPEC を参照。

### Workflow effectiveness

実際の AgentDevFlow workflow で発生する質問を対象とする。
対象質問は以下を含む。

- REQ の変更影響候補
- 同一 owner の SPEC
- 関連 command, skill, integrity rule
- command から実際に委譲される skill
- superseded artifact への現行参照
- 変更後の dangling relation

representative query suite と ground truth を用意し、Graph 利用時と独立探索時を以下の観点で比較する。

- 必要候補の recall
- false candidate
- canonical source 到達可否
- Graph-only miss
- independent-search-only miss
- 探索操作量

Artifact Graph 自身の接続確認のみを workflow effectiveness の成立根拠としない。

## Git管理

試行期間中は `.agentdev/graph/**` を Git 管理対象外とする。
生成物はローカルまたは CI で再生成し、実行報告には件数と診断結果を記録する。
グラフ本体を Git 管理するかどうかは、差分量と利用効果を測定した後に別課題で判断する。

## 対象外

- Graph を SSoT とすること。Graph は派生索引であり、正規成果物での確認を常時実施する
- Graph 不在、stale、生成失敗での標準 workflow 恒常停止
- AgentDevFlow 以外のプロジェクト固有 Graph 実装の強制
- embeddings 生成と外部ベクトルストア
- Neo4j 等の専用グラフDB
- Microsoft GraphRAG ランタイム
- LLM による全面的な関係抽出
- 文章の意味が類似する責務重複の決定論的な確定
- 明示参照が存在しない影響の網羅保証
- グラフ不在を「影響なし」とする判断
- 初期段階での checker、test、draft、Issue 関連成果物の全面グラフ化
- 効果検証前の Artifact Graph 固有検査のマージゲート化

## 検証観点

- **consumer 環境での標準動作**: project augmentation なしでビルド、検査、クエリが動作すること（REQ-012-005）
- **標準コア不変条件**: デフォルト `indexed_paths` が3種（`docs/requirements`, `docs/decisions`, `docs/specs`）のみ、デフォルト `node_types` が3種（`requirement`, `decision`, `specification`）のみであること（REQ-012-002, REQ-012-003）
- **consumer 配布物除外**: consumer 環境で生成 Graph に配布物パターンのノードが0件であること（REQ-012-008）
- **open extensibility**: augmentation で追加した `node_type`, `relation_type` が Graph へ反映されること（REQ-012-004, REQ-012-006）
- **fail-open**: Graph 不在で workflow が停止しないこと（REQ-012-010）
- **決定論性**: 同一入力から生成した5ファイルがバイト単位で同一であること（REQ-012-013）
- **provenance 完全性**: 全ノード、関係から根拠情報が取得できること
- **verification feedback**: Graph と独立確認結果の差異検出、分類、是正、回帰検証が動作すること（REQ-012-011）
- **対応 YAML 構造の明示**: 解析スクリプト群（parse.ts 等）が対応する YAML 構造を明示していること（REQ-020-001）
- **未対応構造の診断**: 解析スクリプトが未対応 YAML 構造を検出し、構造種別と出現位置を診断情報として出力すること（REQ-020-002）
- **代表質問回帰検証**: 実入力 fixture（10件）を解析スクリプトへの入力として組み込み、過去期待出力との一致を検証すること（REQ-020-003、REQ-020-005）
- **fixture 設計原則の遵守**: 実入力 fixture が選定基準明示、配置先、再現性、機密情報除去、版管理の各原則を満たすこと（REQ-020-004）

## SPEC 反映提案群の採否確定

Epic #2189 の実行時に各 PR の SPEC確定候補として提起され、case-close で確定できなかった反映提案群4項目について、Issue #2203（OU-0001）の AG SPEC 確定時に採否を確定する。
4項目とも本 SPEC の該当節へ反映済みであり、実装（`scripts/lib/`、`scripts/src/`）との突合で乖離を確認しなかったため、すべて採用とする。

| 提案 | 反映先 | 採否 | 確定根拠 |
|---|---|---|---|
| manifest スキーマ 2.0.0 の確定 | 「決定論性と鮮度」節 | 採用 | `model.ts` の `SCHEMA_VERSION`（`2.0.0`）、manifest 必須項目、`generated_at` 非保持、同一入力からのバイト同一生成（`determinism.test.ts`）と整合する |
| query_graph サブコマンド構成の確定 | 「問い合わせ結果の出力形式」節 | 採用 | `query_graph.ts` の構造問い合わせ5種（neighbors、path、provenance、discover、index）、プロファイル直指定、JSON 出力のみの構成と整合する |
| augmentation スキーマ4拡張点の確定 | 「augmentation モデル」節 | 採用 | `augmentation.ts` のスキーマ（node_types、relation_types、indexed_paths と discovery_roots、query_settings と relation_constraints）と整合する |
| 「ワークフロー利用」割当表への backlog-review 行追加 | 「ワークフロー利用」節 | 採用 | backlog-review 行（related、impact、統合・分割判定と depends_on 依存解決の補助 evidence）を割当表へ明記済みである |

## See Also

- [../local/artifact-graph.md](../local/artifact-graph.md)（旧 repo-local 仕様、superseded）
- [../foundations/document-model.md](../foundations/document-model.md)（文書モデル）
- [../../requirements/REQ-012.md](../../requirements/REQ-012.md)（Artifact Graph 標準化 REQ）
- [../../requirements/retired/REQ-013.md](../../requirements/retired/REQ-013.md)（旧文書探索経路インデックス依存除去 REQ、docs/requirements/retired/ へ移行済み。後継は REQ-012、integrity スクリプト残存参照の生死判定記録は [docmap-reference-audit.md](../integrity/references/docmap-reference-audit.md)）
- [../../requirements/REQ-020.md](../../requirements/REQ-020.md)（Artifact Graph 解析品質と検証 REQ）
- [../../decisions/DEC-007.md](../../decisions/DEC-007.md)（Artifact Graph 標準化と配布スキル昇格 Decision）
- DEC-002（OpenCode ソース・プロジェクション分離）
