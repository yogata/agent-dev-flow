---
title: Artifact Graph（本体リポジトリ固有派生索引）
status: superseded
superseded_by: skills/agentdev-artifact-graph.md
created: 2026-08-06
updated: 2026-08-08
spec_logical_division: behavior
canonical_owner: repo-agentdev-artifact-graph
---

> 本 SPEC は DEC-007「Artifact Graph 標準化と配布スキル昇格」により superseded された。
> 後継 SPEC は `docs/specs/skills/agentdev-artifact-graph.md`（skills ドメイン）。
> 本文件は履歴参照として現状維持する。

# Artifact Graph（本体リポジトリ固有派生索引）

## 目的

AgentDevFlow 本体リポジトリに限って、成果物間の明示関係を検索できる Artifact Graph を導入する。Artifact Graph は正規情報の代替ではなく、関連成果物と根拠箇所を発見する派生索引として扱う。初期導入により、関連文書探索、明示参照に基づく変更影響候補の取得、未解決参照と廃止済み成果物への参照の検出、成果物間の経路探索、根拠箇所の提示を可能にする。

## 所有と配置

生成、検査、問い合わせ処理は、リポジトリ固有 skill である `.opencode/skills/repo-agentdev-artifact-graph/` が所有する。既存 Project Extensions 契約に従い、必要な規則または検査を次の既存 extension へ追加し、`rules.skill` または `checks.skill` から `repo-agentdev-artifact-graph` へ委譲する。

- `.agentdev/extensions/commands/req-define.yaml`
- `.agentdev/extensions/commands/spec-save.yaml`
- `.agentdev/extensions/commands/case-open.yaml`
- `.agentdev/extensions/commands/case-run.yaml`
- `.agentdev/extensions/commands/case-close.yaml`
- `.agentdev/extensions/skills/agentdev-deep-review.yaml`

専用の extension ディレクトリ（`.agentdev/extensions/artifact-graph/`）は新設しない。新しい extension loader または独自の読込方式は導入しない。配布物（`src/opencode/commands/**`、`src/opencode/skills/**`）へ Artifact Graph 固有処理または固有依存を追加しない。

## 正規情報と生成物

次を正規情報として入力する。

- `docs/requirements/`
- `docs/decisions/`
- `docs/specs/`
- `src/opencode/`
- `.opencode/`
- `.agentdev/extensions/`
- その他の実装、検査、テスト

次を派生索引として `.agentdev/graph/` 配下に生成する。

- `manifest.json`
- `nodes.jsonl`
- `edges.jsonl`
- `provenance.jsonl`
- `diagnostics.json`

`.agentdev/graph/` は手編集せず、正規情報として扱わない。

## グラフモデル

### 初期対象ノード

- requirement
- decision
- specification
- integrity_rule
- command
- skill
- extension
- source_file

### 初期対象関係

- `references`
- `supersedes`
- `defined_in`
- `contains`
- `extends`
- `delegates_to`
- `governs`

### 関係カテゴリ

関係は `declared`（宣言された関係）と `derived`（正規情報から導出した関係）を対象とする。意味的に推定する `inferred` は予約値にとどめ、初期実装では生成しない。

### 初期利用範囲

初期実装は次を扱う。

- 関連文書の候補取得
- 明示参照に基づく変更影響候補の取得
- 未解決参照の検出
- 廃止済み成果物への参照検出
- 直接関係、指定深度、2ノード間経路の問い合わせ
- 根拠ファイルと根拠箇所の提示
- 明示された所有者、識別子、関係に基づく構造的重複候補の検出
- 孤立候補、循環関係、過度に集中したノードの観測

## 抽出契約

### 抽出順序

抽出元は次の順で段階導入する。

1. YAML フロントマター
2. 既知の構造化 field
3. Markdown リンク
4. extension の `id`、`context.paths`、`rules.skill`、`checks.skill`
5. 既知の見出しまたは表内にある識別子
6. 自由文中の裸の識別子

初期実装では 1 から 4 を必須対象とする。5 は対象文書と記法を限定して導入し、6 は誤検出評価が完了するまで対象外とする。

### 成果物の版区別

現行成果物、廃止済み成果物、`v2:` で識別される過去版、コードブロック内の例示、検出規則を説明する識別子を区別する。

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

`path`、見出し、要素 ID、抽出文字列のハッシュを安定した根拠識別に使用する。行番号は人が根拠へ移動するための補助情報とし、要素の主識別子には使用しない。

## 決定論性と鮮度

`manifest.json` は少なくとも次を保持する。

- `schema_version`
- `generator_version`
- `input_digest`
- `indexed_paths`
- `excluded_paths`

現在時刻を表す `generated_at` は決定論的生成物に含めず、必要な実行日時は標準出力または実行報告へ記録する。`input_digest` は対象入力ファイルの相対パスと内容から計算する。

`.agentdev/graph/**`、`.git/**`、ビルド成果物、キャッシュ、一時ファイル、作業ツリー固有の管理ファイルは入力から除外する。

同じ入力から生成した 5 ファイル（`manifest.json`、`nodes.jsonl`、`edges.jsonl`、`provenance.jsonl`、`diagnostics.json`）はバイト単位で同一になるようにする。

## Git管理

試行期間中は `.agentdev/graph/**` を Git 管理対象外とする。生成物はローカルまたは CI で再生成し、実行報告には件数と診断結果を記録する。グラフ本体を Git 管理するかどうかは、差分量と利用効果を測定した後に別課題で判断する。

## ワークフロー利用

各コマンド、skill は次の候補取得に Artifact Graph を利用できる。

- `req-define`: 既存REQ、関連DecisionとSPEC、構造的所有者重複の候補取得
- `spec-save`: 対応REQ、同じ正規所有対象を持つSPEC、関連command、skill、整合性ルールの候補取得
- `case-open`: 起点成果物から到達できる変更影響、廃止参照、未解決参照の候補取得
- `case-run`: 実装対象に関係するREQ、SPEC、整合性ルール、周辺成果物の候補取得
- `case-close`: 鮮度、未解決参照、存在しないノードへの関係、根拠欠落、関係閉包候補の観測
- `agentdev-deep-review`: 複数規範関係、循環、集中ノード、孤立候補、複数経路の論点抽出

### 利用上の防護

グラフ結果を変更対象、操作単位、要件充足、責務重複の確定根拠として使用しない。グラフから候補を取得した後、根拠ファイルを読み、`rg` などの別手段で補完、反証してから判断する。構造的重複候補と意味的な責務重複を区別する。グラフ不在を「影響なし」とする判断を行わない。

## 障害耐性

グラフが存在しない場合も標準ワークフローが従来どおり続行する。グラフが古い場合は再生成するか、古い状態であることを明示して補助利用に限定する。グラフ生成失敗だけを理由に標準ワークフローを恒常的に停止しない。

## 効果検証

実装前に最低 10 件の代表的な探索質問と、README 索引、`rg` による現行結果を記録する。初回生成後、同じ質問に対する Artifact Graph の結果を比較する。評価対象は、抽出漏れ、誤った候補、根拠到達率、探索操作数、生成失敗時の標準ワークフロー継続とする。

## 対象外

- consumer リポジトリへの導入
- ADF 標準機能への昇格
- `src/opencode/commands/**`、`src/opencode/skills/**` への Artifact Graph 固有処理の追加、固有依存の追加
- `.agentdev/extensions/artifact-graph/` の新設
- 新しい extension loader または独自の読込方式
- Neo4j などの専用グラフDB
- embeddings 生成と外部ベクトルストア
- Microsoft GraphRAG ランタイム
- LLM による全面的な関係抽出
- 文章の意味が類似する責務重複の決定論的な確定
- 明示参照が存在しない影響の網羅保証
- グラフ不在を「影響なし」とする判断
- グラフ生成失敗による標準ワークフローの恒常的停止
- 初期段階での checker、test、draft、Issue 関連成果物の全面グラフ化
- 効果検証前の Artifact Graph 固有検査のマージゲート化

## 正規所有者とアンカー

| 関心 | 正規所有者またはアンカー |
|---|---|
| リポジトリ固有の生成、検査、問い合わせ | `.opencode/skills/repo-agentdev-artifact-graph/` |
| command固有の追加利用規則 | `.agentdev/extensions/commands/<command>.yaml` |
| skill固有の追加利用規則 | `.agentdev/extensions/skills/<skill>.yaml` |
| 派生索引 | `.agentdev/graph/` |
| Project Extensions の配置と読込契約 | `docs/specs/foundations/project-extensions.md` |
| extension の決定論的検査 | `docs/specs/integrity/rules/IR-056-project-extensions-integrity.md` |
| 文書種別と正規情報の責務境界 | `docs/specs/foundations/document-model.md` |
| RU 契約 | `docs/specs/responsibilities/artifact-contracts.md` |

既存の解析、索引生成、整合性検査処理を調査し、再利用可能な処理を重複実装しない。
