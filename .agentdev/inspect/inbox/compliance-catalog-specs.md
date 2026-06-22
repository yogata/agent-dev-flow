---
title: docs/specs/ 規範逸脱カタログ
topic: specs-compliance-catalog
source_issue: "#1047"
parent_epic: "#1037"
status: draft
created: 2026-06-23
review_norms:
  - japanese-tech-writing（SPEC 適用サブセット: 整形・LLM 表現禁止・冗長排除・識別子と散文の区別・用語政策）
  - docs/specs/document-type-responsibilities.md（配置基準・用語政策・識別子と散文普通名詞の区別）
---

# docs/specs/ 規範逸脱カタログ

## 概要

`docs/specs/` 配下 71 ファイル（`document-type-responsibilities.md` は基準文書のため除外）に対する japanese-tech-writing（SPEC 適用サブセット: 整形・LLM 表現禁止・冗長排除・識別子と散文の区別・用語政策）および document-type-responsibilities.md（配置基準・用語政策・識別子と散文普通名詞の区別）の逸脱を抽出したカタログ。個別修正は後続 Issue で扱う（本カタログは見える化が目的）。遡及準拠の範囲は REQ-0140-026 に基づく。

SPEC は 3 層構造（commands / skills / workflows）を持ち、ENUM・スキーマ・カタログ・判定表形式の記述を主体とするため、パラグラフライティング・演出は非適用。検出は整形（中黒・em-dash・一文一行）・LLM 表現禁止・識別子と散文の区別に集中する。`document-type-responsibilities.md`（OU-005 で新規作成・基準文書）は本カタログの査読基準そのものであるため査読対象外。`docs/specs/skills/agentdev-doc-writing.md` は AG-007 で更新済みのため、最新状態で査読対象とした。

## 対象範囲

71 ファイル（`document-type-responsibilities.md` は基準文書のため除外）。内訳:

- `specs/*.md` 直下（20 ファイル）: system, patterns, design-principles, quality-specs, quality-gates, document-model, artifact-contracts, artifact-responsibilities, integrity-contracts, integrity-rule-catalog, workflow-contracts（旧版・縮小済み）, runtime-package-boundary, local-case-file, local-generation, local-transform, rule-ownership, req-impact-map, req-health-metrics, docs-spec-rebuild-integrity, command-file-format, README.md
- `specs/commands/*.md`（17 ファイル）: `_template.md` + 16 command SPEC
- `specs/skills/*.md`（28 ファイル）: `_template.md` + 27 skill SPEC
- `specs/workflows/*.md`（5 ファイル）: workflow-contracts, delegation-contracts, capture-boundaries, epic-wave-model, backlog-artifact-lifecycle

`document-type-responsibilities.md` は基準文書のため査読対象外（Issue #1047 完了条件に明示）。

## 適用サブセット

SPEC 適用サブセット（整形・LLM 表現禁止・冗長排除・識別子と散文の区別・用語政策）。演出・パラグラフライティングは非適用。

## 検出事項

### F-001（high）: 関連項目・参照リストでの em-dash（—）使用（パターン）

- **対象**: 計 496 件 / 59 ファイルで検出（grep `[—――]`）。多: `commands/case-close.md` (41), `commands/case-open.md` (34), `commands/case-auto.md` (33), `commands/req-save.md` (31), `commands/case-run.md` (30), `commands/spec-save.md` (24), `commands/inspect-docs.md` (22), `commands/req-define.md` (22), `workflows/workflow-contracts.md` (17), `commands/case-update.md` (15), `commands/backlog-review.md` (14), `workflows/capture-boundaries.md` (14), `workflows/delegation-contracts.md` (13) 他
- **該当規範**: 整形（ダッシュを日本語の地の文・見出しで使わない。同格・補足の挿入は括弧（）に）
- **現状**: command SPEC 系を中心に「## 関連項目」「## 参照」節のリスト項目で em-dash による同格・補足挿入が広く浸透している。docs/adr/ のカタログ（F-001 high）と同種。
  - `commands/_template.md` L62-L65: 「- [skills/_template.md](../skills/_template.md) — skill SPEC テンプレート」「- ADR-0123 — SPEC lifecycle（draft/accepted）」
  - `commands/case-run.md` L27-L28: 「- Issue番号またはURL（要件doc埋め込み済み）— 単一 Issue 実行モード」「- Epic Issue番号またはURL — Epic Wave 実行モード（`case-run #epic`）」
  - `commands/case-run.md` L100-L103: 「- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md) — Pattern Taxonomy（manager-orchestrator）」「- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md) — controlled_case_execution 委譲」
- **改善方向**: em-dash を括弧（）またはコロン（:）に置換する。リポジトリ全体方針として横断 Issue で扱うことを推奨（docs/adr/ のカタログ F-001 と統合）。
  - 例: 「- [skills/_template.md](../skills/_template.md)（skill SPEC テンプレート）」「- ADR-0123（SPEC lifecycle: draft/accepted）」

### F-002（high）: 中黒（・）による日本語並列（パターン）

- **対象**: 計 1072 件 / 72 ファイル（grep `[・]`・`document-type-responsibilities.md` 含むため 71 対象中 71 ファイル全件）。多: `integrity-rule-catalog.md` (80), `document-model.md` (47), `commands/case-close.md` (37), `commands/case-run.md` (36), `commands/case-auto.md` (33), `workflows/delegation-contracts.md` (33), `commands/case-open.md` (32), `commands/req-save.md` (32), `document-type-responsibilities.md` (30), `workflows/epic-wave-model.md` (29), `README.md` (26) 他
- **該当規範**: 整形（中黒を日本語の並列で使わない）
- **現状**: SPEC 全体に中黒が広範に浸透。コード値・識別子の並列にも使用されているが、日本語地の文の並列にも使用されている。
  - `commands/req-define.md` L22 相当: 「`.agentdev/intake/promoted/`・`.agentdev/learning/promoted/` は直接読み込まない」（ファイルパス並列）
  - `workflows/delegation-contracts.md`: 委譲種別の列挙で中黒使用
- **改善方向**: 日本語並列には読点（、）を使用する。コード値・識別子の列挙も地の文としては読点または箇条書きにする。リポジトリ全体方針として横断 Issue で扱うことを推奨（src/opencode/commands/・src/opencode/skills/・docs/adr/・docs/guides/・docs/requirements/ の各カタログでも共通出現）。

### F-003（med）: 散文普通名詞が英語のまま（識別子以外の fixture/variant/provider/baseline/current 等）

- **対象**: `document-model.md`, `integrity-rule-catalog.md`, `runtime-package-boundary.md`, `design-principles.md`, `local-case-file.md`, `local-generation.md`, `local-transform.md` 他 6 ファイル以上
- **該当規範**: 識別子と散文普通名詞の区別・用語政策（fixture→テストデータ/検査データ、variant→種別/バリエーション/形式、provider→提供元、baseline→基準、current→現行/現在の）
- **現状**: 識別子（Type ID・enum 値・frontmatter field・ファイル名・バッククォート内コード値）でない普通名詞が英語のまま散文で使用されている。
  - `document-model.md`: 「テンプレート種別（`variant`）」「テストデータ詳細（`fixture detail`）」（括弧内は識別子として英語のままで妥当だが、外側の「種別」「詳細」が訳語表の推奨訳とズレる場合あり）
  - `integrity-rule-catalog.md` L758 相当: 「Current Baseline View・後継ADRの Related Decisions・REQ/SPEC の現行根拠」（散文で `Current Baseline View` が英語のまま・`baseline` は推奨訳「基準」がある）
  - `runtime-package-boundary.md`: リポジトリ種別（repo type）の記述で `repo type` が英語のまま（識別子ではない）
- **改善方向**: 識別子（コード値・フィールド名・enum 値・表の Type ID 列）は英語のまま。散文普通名詞は推奨訳に置換する。
  - 「Current Baseline View」→「現行基準ビュー」
  - 「repo type」→「リポジトリ種別」（既に併記されている箇所は日本語を主表記に）
  - runtime-package-boundary.md が実装している良いパターン（本文は日本語、表の Type ID 列は ` `self-hosting` ` のまま）を他 SPEC も踏襲する。

### F-004（med）: 「において」の過度使用（接続の型パターン）

- **対象**: `local-case-file.md` L14・`quality-gates.md` L123・`integrity-rule-catalog.md` L758, L1066・`design-principles.md` L13, L57・`runtime-package-boundary.md` L3・`artifact-contracts.md` L196 他（active 24 件・計 37 件）
- **該当規範**: LLM 表現禁止（接続の型「〜において」）
- **現状**:
  - `local-case-file.md` L14: 「GitHub Issue / PR を使わない個人利用環境（ローカル版 OpenCode）**において**、Issue / PR 相当の永続情報を保持する Case ファイルの構造を定義する」
  - `quality-gates.md` L123: 「各ゲート**において**、何を機械化できるか・何を推論に委ねるか・何をサブエージェントに委譲するかを明確にする。」
  - `integrity-rule-catalog.md` L1066: 「docs/SPEC/command/skill **において** 既知 command 名…が「スキル」「skill」と表記されていることを検出すること」
- **改善方向**: 「において」を直接表現に置き換える。「個人利用環境（ローカル版 OpenCode）では」「各ゲートで」「docs/SPEC/command/skill で」等。

### F-005（med）: 引用ブロック（`>`）でのラベル前置き「> **Scope**:」「> **縮小済み**:」等

- **対象**: `system.md`, `workflow-contracts.md`（旧版・縮小済み）, `runtime-package-boundary.md`, `local-case-file.md`, `local-generation.md`, `local-transform.md`, `docs-spec-rebuild-integrity.md` 他多数
- **該当規範**: LLM 表現禁止（予告と総括・ラベル前置き）・演出抑制（mild SPEC 適用外だが予告ラベルは LLM 表現禁止に合致）
- **現状**: SPEC の冒頭で `> **Scope**: …`、`> **縮小済み**: …`、`> **リポジトリローカル文脈**: …`、`> **リポジトリ内部設計文書**: …` 等のラベル前置きが広く使用されている。
  - `runtime-package-boundary.md` L3: `> **Scope**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である（ADR-0103）。…`
  - `workflow-contracts.md`（旧版）冒頭: `> **縮小済み**: …`
- **改善方向**: ラベルを外し本文に溶け込ませるか、見出し階層（`## 適用範囲` 等）で表現する。
  - 例: `本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である（ADR-0103）。リポジトリ種別（repo type）間の実行時パッケージ境界モデルを本リポジトリの観点から記述し、consumer プロジェクトの振る舞いを規定しない。`（見出し `## 適用範囲` 配下）

### F-006（med）: 空虚な形容「不可欠」・「核心的」・「根本的な」（少件数）

- **対象**: `design-principles.md` L13・`design-principles.md` L57 他（grep で 8 件 / 6 ファイル）
- **該当規範**: LLM 表現禁止（空虚な形容）
- **現状**:
  - `design-principles.md` L13: 「**feature** は新しい振る舞いをシステムに導入するため、WHAT（要件）と HOW（実装）の分離が**不可欠**である。」
  - `design-principles.md` L57: 「実装先行の原則: 多くの場合、実装が先に存在し、要件は事後的に記録される。」（「多くの場合」は弱い緩和）
- **改善方向**: 主張の中身を説明する。「不可欠」→「が必要」「が前提」等。
  - 「**feature** は新しい振る舞いをシステムに導入するため、WHAT（要件）と HOW（実装）を分離する。」

### F-007（low）: 見出しの「種別──主題」形式

- **対象**: 全 SPEC 検索で顕著な「種別──主題」形式（罫線・em-dash で 2 要素を詰め込む）は検出されず
- **該当規範**: 整形（見出しに罫線/ダッシュで「種別──主題」を詰め込まない）
- **現状**: SPEC 見出しは「## システム仕様」「## 文書種別責務・配置基準」等の形式で、em-dash による 2 要素詰め込みは見られない。F-001 の関連項目リスト内 em-dash は別パターン（見出しではなく本文リスト）。
- **改善方向**: （対応不要。見出し規範は遵守されている）

### F-008（low）: 一文一行違反（リード文・概要節）

- **対象**: 各 SPEC の冒頭リード文・`## 概要` 節
- **該当規範**: 整形（一文一行）
- **現状**: 多数の SPEC 冒頭で要約が 1 行に複数文併記されている。SPEC は技術仕様のため概要を 1 行に圧縮する傾向がある。
- **改善方向**: リード文は読者が最初に読む部分のため、1 文 1 行を厳格に適用する。複数文は改行で分割する。

### F-009（low）: 「〜には〜がある」「〜を参照」の接続の型（少件数）

- **対象**: `README.md`, 各 SPEC の「## 関連項目」節他
- **該当規範**: LLM 表現禁止（接続の型）
- **現状**: 「〜を参照」の連打は「## 関連項目」節で広く見られるが、リンク集としての性質上ある程度は許容範囲。冒頭概要での「〜には〜がある」型は少数。
- **改善方向**: 「には〜がある」型は直接内容を書く。「〜を参照」の連打は関連項目節では許容するが、本文中の過度な使用は前置きを削って関連リンクとして扱う。

### F-010（low）: 識別子表記の backticks 有無混用

- **対象**: 全 SPEC に散在。`design-principles.md`（WHAT/HOW の backticks なし）他
- **該当規範**: 整形・識別子と散文の区別（識別子は backticks で明示）
- **現状**: ファイルパス・command 名・enum 値は backticks 付きで統一されているが、`WHAT`・`HOW`・`REQ`・`ADR` 等の略語・概念名が backticks なしで使われる場合がある。
  - `design-principles.md` L13: 「WHAT（要件）と HOW（実装）の分離」（backticks なし）
- **改善方向**: 識別子（Type ID・enum 値・フィールド名・ファイルパス・command 名）は一貫して backticks で囲む。`REQ`・`ADR`・`SPEC` 等の略語は用語政策の許容リストに従い backticks なしで統一するか、文脈で判断する。

### F-011（info）: SPEC 相当内容（enum・判定表・カタログ）の配置適正性

- **対象**: 全 SPEC ファイル（ENUM・カタログ・スキーマ定義主体）
- **該当規範**: （参考記録・SPEC なのでこの配置は適正）
- **現状**: SPEC ファイルは ENUM 値一覧・判定表・スキーマ・ルールカタログを主体としており、document-type-responsibilities.md の「SPEC 相当内容は SPEC へ」のルールに適合している。`integrity-rule-catalog.md`（1207 行・整合性検査ルールカタログ）・`local-case-file.md`（状態遷移表）・`quality-gates.md`（QG-1〜QG-4 定義表）等は SPEC として適正な配置。
- **改善方向**: （対応不要。SPEC の責務を果たしている）

### F-012（info）: SPEC 全体の規範準拠度（参考記録）

- **対象**: 71 ファイル全体
- **該当規範**: （参考記録・逸脱ではない）
- **現状**: SPEC ファイル群は現行アーキテクチャの基準文書として整理されており、論証構造・情報の正確性・識別子の一貫性に顕著な問題はない。主要な逸脱は整形（em-dash・中黒）と LLM 表現（において・ラベル前置き）に集中する。SPEC は技術的精密度が高く、演出・パラグラフライティング非適用により表現スタイルの逸脱は相対的に少ない。
- **改善方向**: （対応不要。検出事項の見える化が目的なため準拠状況も記録する）

## 対象外

- 演出・パラグラフライティング関連の規範は SPEC 適用サブセット外のため検出対象外。
- SPEC ファイル間の相互参照リンク切れ・参照先不存在は `/agentdev/inspect-skills`・`/repo/docs-check` の査読観点であり本カタログ外。
- SPEC 内容と実装の乖離（論理的矛盾・機能欠落）は `/repo/docs-check`・`/agentdev/inspect-docs` の検出対象であり本カタログ外。
- SPEC 内で言及されるコマンド名・スキル名・サブエージェント名・harness 名の正しさ（実行主体分類の誤認）は `/agentdev/inspect-skills` で扱う（REQ-0140-027・REQ-0108-261 参照）。
- `document-type-responsibilities.md` は基準文書そのものであるため査読対象外（Issue #1047 完了条件に明示）。

## 後続 route 候補

- F-001, F-002（em-dash・中黒）: リポジトリ全体の整形方針（src/opencode/commands/・src/opencode/skills/・docs/adr/・docs/guides/・docs/requirements/ の各カタログでも共通出現）と合わせて横断 Issue で扱うことを推奨。F-001（em-dash）は docs/adr/ カタログ F-001 と統合可能。
- F-003（散文英単語）: 用語政策系の横断 Issue で扱うことを推奨（docs/guides/・src/opencode/commands/ のカタログでも共通出現）。
- F-004, F-005, F-006（LLM 表現系）: 1 Issue で「docs/specs/ LLM 表現禁止の整形（において・ラベル前置き・空虚な形容）」として扱う。
- F-008, F-009, F-010（軽微整形）: 1 Issue にまとめて対応可能。
- F-007, F-011, F-012（info・対応不要）: 本カタログの見える化記録として扱い、後続 Issue は発生しない。
