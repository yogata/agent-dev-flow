---
title: 文書種別責務・配置基準
status: accepted
created: 2026-06-23
updated: 2026-07-12
---

# 文書種別責務、配置基準

> **他 SPEC との役割分担**: 本 SPEC と `../foundations/document-model.md` は補完関係にある（AG-004）。
> 文書種別の基準境界（REQ/ADR/SPEC/guides/DOC-MAP の役割定義、ライフサイクル、優先順位、参照規則、投影方向、SPEC内部論理区分、文書7分類、局所物理分離、ドメイン別体系化規範）は `../foundations/document-model.md` の正本を参照する。
> 本 SPEC は文書種別配置の執筆時判定基準、実行主体分類、要件行書き方、SKILL構造、用語政策を扱う。
> 共通文書モデル規約（frontmatter、ID 体系、命名規則、URL 参照形式、共通フォーマット規約）は `../foundations/patterns.md` を参照する（AG-006）。
> 新規ファイル分割は行わず、既存2ファイル（本 SPEC と document-model.md）間の重複削除で運用する（AG-004）。両 SPEC の境界変更時は相互参照を更新し、同一関心の説明が重複・矛盾しない状態を維持する。

docs/ 配下の文書（REQ/ADR/SPEC/guides/DOC-MAP/README）および AGENTS.md の日本語執筆における文書種別責務、配置基準、用語政策を示す。
REQ-0140（文書品質ゲート）の原本仕様（文書種別配置、用語政策系）であり、`agentdev-doc-writing` スキルの参照先である。
REQ-0101-061、REQ-0103-032 の詳細参照先。

> **執筆規範の SSoT は japanese-tech-writing スキル**: 基本原則、術語の平易化、文体基準、不自然な日本語の典型は AGENTS.md 経由で japanese-tech-writing スキルを参照する。
> 本 SPEC は文書種別の配置基準とリポジトリ固有の用語政策に特化し、japanese-tech-writing の内容を複製しない。
>
> **AI-slop 検出基準は含めない**: AI-slop 概念は完全廃止し、文章品質の判定は japanese-tech-writing（LLM っぽい表現の禁止、空虚な形容、空虚な動詞）に完全委譲する。
> 対応表は作成しない。

## 文書種別の基準境界（参照）

REQ/ADR/SPEC/guides/DOC-MAP の役割定義、記述対象、記述対象外の基準境界は `../foundations/document-model.md` の「責務マトリックス」「文書分類ポリシー」を正本とする（AG-004）。本 SPEC は基準境界を再定義せず、執筆時の配置判定のみを扱う。

README は agent-dev-flow リポジトリの構成要素（identity、入口表、参照先リンク、最小限のクイックスタート）であり、REQ/ADR/SPEC/guide/DOC-MAP と並ぶ基準境界対象ではなく README.md の構造要件に従う。

### 新規文書作成時の分類判断ツリー <!-- REQ-0101 -->

新規文書を作成する際の分類判断フロー。文書種別の基準境界（`../foundations/document-model.md`「責務マトリックス」）に基づき、執筆時にどの文書種別へ配置するかを判定する。

| 判断質問 | 結果 | 文書種別 |
|---|---|---|
| 満たすべき振る舞い、制約、状態の定義か? | YES → | **REQ** |
| 可逆的な運用上の判断か? | YES → | Guide または workflow 内の判断として扱い、独立文書不要 |
| 将来の設計、運用、文書システムを制約する決定か? | YES → | **ADR** |
| 現在のアーキテクチャ、システム動作の記述か? | YES → | **SPEC** |
| 分析結果、監査所見、インシデント記録か? | YES → | **Report** |
| 人間向けのナビゲーション、案内か? | YES → | **Guide** |
| 文書探索の索引か? | YES → | **DOC-MAP** |
| 上記のいずれにも該当しない → | 既存文書の APPEND/UPDATE で対応できないか確認。新規文書が必要な場合は REQ として要件化 |

判断の結果が複数の文書種別にまたがる場合、それぞれの責務に応じて分割する。単一文書に複数種別の内容を混在させない。

### REQ と SPEC の配置境界（執筆時判断）

REQ 要件行が SPEC 相当内容（スキーマフィールド、enum 値一覧、判定表、ファイルパターン、テンプレート種別、レポート形式、テストデータ詳細、個別 checker ルール、retry 回数、token 目安、行数上限、Step 番号、Phase 番号、内部アルゴリズム、作業履歴）のみを主たる文意とする場合、当該内容は SPEC 等へ配置する。移管候補一覧と安定契約の完全な定義は `../foundations/document-model.md`「SPEC 分離基準」「安定契約の例外」を参照（AG-004）。

ただし公開 command 名、公開入口、ドメイン状態の位置づけ、他 command との接続契約、安全境界、停止条件の大枠、後続工程が依存する安定した外部契約に該当する場合は、REQ に要約として記述できる（安定契約例外、REQ-0101-069）。

## 実行主体分類の査読基準

文書内で言及される実行主体は、以下の分類に従って正確に記述すること。
この基準は `agentdev-doc-writing`（REQ-0140-027）および `agentdev-inspect-skills`（REQ-0125-010）の査読対象である。

| 分類 | 説明 | 判定方法 |
|---|---|---|
| command | ユーザーまたはプロンプトから実行される命令（`/agentdev/*`, harness 固有の実行 command 等） | 先頭に `/` を持つ、または prompt 内で実行指示として記述される |
| skill | `load_skills` で指定される、モデルが参照する判断補助、実行知識（`agentdev-*`） | `agentdev-*` プレフィックスを持ち、`SKILL.md` を持つ |
| subagent | 委譲で起動されるエージェント型 | 委譲起動の対象として指定される（起動手段は AGENTS.md 参照） |
| harness | 外部実行エンジン（AGENTS.md で選定） | OpenCode プラグインとして提供される実行エンジン |

よくある誤認パターン:

- command を skill と呼ぶ（例: 実行 command を skill と記述、`load_skills` に command 名を指定）
- harness を skill と呼ぶ
- subagent を skill と呼ぶ

これらの誤認は `load_skills` への誤指定や文書種別間の契約不整合を引き起こすため、査読で検出する。
具体的な誤認事例と修正方向性は `agentdev-inspect-skills` skill の診断観点を参照。

## 要件行の書き方

### 1行1関心原則

1要件行に複数の独立した判断、関心を混入させない。
1行に「定義 + 配置 + 参照形式 + 禁止」等の複数関心が混在する場合、関心ごとに分割する。


### 肯定文主文


主たる文意を肯定文で記述する（REQ-0101-064）。
否定文は、肯定文で記述された主たる文意に対する境界条件、例外、補足として併記する場合に限り使用する（REQ-0101-065）。
主たる文意とは、当該記述が単独で表現する「満たすべき状態、振る舞い、制約」を指す。
主たる文意が否定文のみで構成されている要件行は、対応する肯定文へ書き換える（REQ-0101-066）。


### 長大行の分割基準


1要件行に複数ルール、長大列挙、複文が混在する場合、1判断につき1行に分割する。
分類カタログ、値一覧、判定表は SPEC 等に委譲し、REQ 行は核心を1文で表現する。

## 要件性

要件行の合格基準として、以下を全て満たすこと。

- **主語**: 誰が、何がその要件を満たすかが明確であること
- **対象**: 何を対象とした要件かが明確であること
- **状態**: どうあるべきか、どう振る舞うべきかが明確であること
- **検証可能性**: どう確認するかが特定可能であること
- **独立性**: 他の要件行と関心が混入していないこと

## 粒度

1行1責務の基準: 1要件行は1つの判断、関心、制約を表現する。
1行に「定義 + 配置 + 参照形式 + 禁止」等の複数関心が混在する場合、関心ごとに別行へ分割する。

## 移送判断

査読時に問題箇所を以下のいずれかに分類する。

| 分類 | 意味 |
|---|---|
| 残す | 現在の文書種別、位置が適切。文章品質の修正のみで対応可能 |
| 分割 | 1行に複数関心が混在。関心ごとに別行へ分割 |
| 移送 | 別の文書種別（REQ↔SPEC↔ADR↔guide↔skill reference）への移動が必要 |
| 削除候補 | 作業記録、移行結果、現状構成の詳細説明、変更履歴等、要件として不要な内容 |

## 硬直的固定記述の回避

件数（「10 ガイド」等）、ファイル名列挙を要件に埋め込まず、構造要件のみ記述する。
件数、ファイル名は SPEC、README、guide 側で管理し、REQ は構造（「README.md（入口）と個別ガイドファイルで構成する」等）のみ記述する。

## SKILL 構造（概要節/機能節役割分担）

SKILL.md の節構成は以下の役割分担に従う。

| 節 | 役割 | 内容 |
|---|---|---|
| 概要節（`# {スキル名}` 直下、`## 目的` 等） | 入口 | スキルの役割、位置づけを簡潔に導入。機能説明の詳細は含まない |
| 機能節（`## 責務`, `## USE FOR`, `## 担当` 等） | 新情報追加 | 概要節で触れない具体的な対象、対象外、查読観点、判定基準を詳細に記述 |

**禁止パターン**: 概要節に機能節と同じ内容の詳細説明を含め、機能節で再説明する重複構造。
SKILL.md 査読時（`agentdev-doc-writing`）に概要節と機能節の重複を検出し、概要節を簡潔な導入へ縮退するよう指示する。

**適用対象**: src/opencode/skills/agentdev-*/SKILL.md（全27ファイル）。


## SKILL.md 重複查読の優先度基準と段階的スケジュール

REQ-0140-032 が定める段階的查読の詳細基準。REQ-0140-031 の查読対象宣言を受けて運用具体化する。

### 優先度軸

- 重複度合い: 概要節（description frontmatter）と機能節（## セクション群）の語彙・文脈重複を高位/中位/低位の3段階で分類する
- 文書の影響度: SKILL.md の参照頻度、command からの呼出頻度を影響度 高位/中位/低位 で分類する

### 段階的查読スケジュール

- Wave 1: 優先度高位（重複度合い高位 かつ 影響度高位）
- Wave 2: 優先度中位（重複度合い中位 または 影響度中位）
- Wave 3: 優先度低位（上記以外）

### 対象 SKILL.md

src/opencode/skills/agentdev-*/SKILL.md（28ファイル）。各 SKILL.md は docs/specs/skills/agentdev-*.md（1:1 対応）を SSoT とし、重複部分を SPEC から DERIVE した生成物に変更する。

#### Wave 1（高優先度、フェーズ2 #1610 で実施済）
- agentdev-doc-writing（REFERENCE 強化 + 高優先度重複除去）

#### Wave 2（中優先度、フェーズ3対象）
- 中核スキル群: agentdev-req-analysis, agentdev-req-file-manager, agentdev-adr-file-manager, agentdev-adr-guidelines, agentdev-workflow-orchestration, agentdev-workflow-routing, agentdev-workflow-lifecycle
- 概要節と機能節の重複が明確に存在し、SPEC への DERIVE による解消が効果的なスキルを優先
- DERIVE 対象: 各 SKILL.md の機能一覧、責務宣言、入出力等の SPEC と重複する記述

#### Wave 3（低優先度、フェーズ3対象）
- 補助スキル群: agentdev-doc-map, agentdev-case-run-execution-adapter, agentdev-issue-management, agentdev-epic-tracker, agentdev-gh-cli, agentdev-git-worktree, agentdev-intake-pipeline, agentdev-learning-capture, agentdev-learning-pipeline, agentdev-quality-gates, agentdev-inspect-skills, agentdev-command-authoring, agentdev-command-creator, agentdev-conventional-commits, agentdev-skill-authoring, agentdev-backlog-integration, agentdev-project-extensions, agentdev-req-structure-diagnostics
- 重複度合いが低い、または SPEC との対応が限定的なスキル
- U-012（extension と SKILL.md の記載重複）の解消を含める

#### 優先度判定基準
- 重複度合い（概要節と機能節の文字重複率）
- 文書の影響度（配布対象、利用頻度）
- SPEC との対応関係の明確さ（1:1 対応が取れているか）
- DERIVE 機構導入の効果（重複解消による保守性向上の大きさ）


## 用語政策


japanese-tech-writing は「術語の扱い方の一般論」を管理する。
本節は AgentDevFlow リポジトリ固有の許容リスト、訳語表を管理する。
両者の責務は重複しない。

### 英語のまま残す語（固有名詞、識別子）

製品名（AgentDevFlow, OpenCode）、ID（REQ-0138 等）、略語（REQ/ADR/SPEC/RU/OU/PR/SSoT/HITL）、コマンド名、ファイルパス、YAMLフィールド名（説明文では日本語訳を併記）、パイプライン名（Intake/Learning/Backlog）。

### 修飾語の日本語化の方向性

active→現行、retired→廃止、accepted→承認済み、upstream/downstream→文脈で「前工程/次工程」「上位/下位」等（固定しない）、current→現行/現在の、top-level→最上位（既存「トップレベル」も統一）。

### 複合技術語の訳し方指針（文意に基づく）

domain state→「ドメイン状態」「保持する管理情報」等、runtime command→「実行時コマンド」、command topology→「コマンド構成」、provenance marker→「出典標識」、upstream handoff→「前工程からの引き継ぎ」「上位工程からの受渡し」等、fixture detail→「テストデータ詳細」「検査データ詳細」等、runtime workspace→「実行時作業領域」、canonical path→「正規パス」、self-hosting（普通名詞）→「本体リポジトリ」、junction→「ジャンクション」、session-sourced→「セッション由来」。
いずれも文脈で最も自然な表現を選ぶ。

### 専門カタカナ語の日本語訳（文意に基づく）

fixture→「テストデータ」「検査データ」、variant→「種別」「バリエーション」「形式」、provider→「提供元」、baseline→「基準」、finding→「検出事項」、promoted artifact→「採用済み成果物」。

### 識別子と散文普通名詞の区別

識別子（Type ID、enum 値、frontmatter field、ファイル名、ディレクトリ名、バッククォート内コード値）は英語のまま許容する。
日本語散文中で普通名詞として使用する場合は推奨訳に置換する。
runtime-package-boundary.md が実装している良いパターン（本文は日本語、表の Type ID 列は `` `self-hosting` `` のまま）を参照。
識別子（backticks 必須）と一般名詞（backticks 任意）の機械判定閾値は [backticks-identifier-threshold.md](../integrity/backticks-identifier-threshold.md) を参照。

### カタカナ語（一般的定着語は許容）

許容: スキーマ、ライフサイクル、カタログ、パイプライン 程度。
非許容（文意に基づく日本語訳）: フィクスチャ、バリアント、プロバイダ、ベースライン 等。

### 略語の扱い

SSoT, HITL は略語のまま使用。
初出時のみ日本語訳（「唯一の情報源（SSoT）」「人の判断を挟む（HITL）」）を併記。

### 中黒使用の許容範囲

中黒（`・`）は原則として日本語並列に使わない（japanese-tech-writing L18）。ただし以下は許容する:

- 固定複合名詞の内部（「実行時・編集時」「コマンド・スキル・テンプレート・スクリプト」等の確定 tech term）
- 単一固有名詞の内部

流動的並列、識別子の並列、コード値の並列は読点（、）、スラッシュ、箇条書きに置換する。

中黒許容範囲の機械判定アルゴリズム（許容条件4種、判定手順、テーブルセル扱い）は algorithm SSoT（[mechanical-replacement-rules.md](../../../src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md)）Section 1 を参照。
本節は固定複合名詞・単一固有名詞の許容例の原本として機能し、algorithm 的記述は SSoT へ委任する。

### em-dash 置換形式

em-dash（`—`、`―`）は japanese-tech-writing L17 に従い、同格、補足は括弧（`（）`）で、言い換え、敷衍は句点で2文分割または読点でつなぐ。
コロン（`:`）による置換は行わない。

テーブルセル内の em-dash（`| — |`、N/A プレースホルダ用途）は `| - |`（ハイフン1文字）へ機械置換する。
本文中の em-dash とは意味が異なり、文脈判断を要しない安全な機械置換である。
検出後の文脈判定パターン（A: label—explanation、B: 句点直後、C: 括弧内既存、D: テーブルセル、ママ）の詳細は algorithm SSoT（mechanical-replacement-rules.md）Section 2 を参照。

### frontmatter 訳語

YAML frontmatter は「YAML フロントマター」を推奨訳とする。
原語併記（「frontmatter（YAML 前書き）」）または初出のみ訳出の運用も許容する。
ファイル名 `rules/frontmatter.yaml` は原語を保持する。

### 推奨訳語（追補）

既存の用語政策に以下を追加する:

- fixture → テストデータ/検査データ
- variant → 種別/バリエーション/形式
- provider → 提供元
- baseline → 基準
- current → 現行/現在の

識別子（Type ID、enum 値、frontmatter field、ファイル名、バッククォート内コード値）は英語のままとする。

### LLM 表現の検出→書き換え方針

LLM 表現（接続の型、空虚な動詞、空虚な形容、ラベル前置き）の検出→書き換えパターンの具体例は
`agentdev-doc-writing` スキルの運用参照資料 `references/llm-expression-patterns.md`（OU-003 の case-run で新規作成）で管理する。本 SPEC には方針のみを記載し、具体例の正誤表は skill references に集約する
（REQ-0140-026「個別用語の正誤表は `agentdev-doc-writing` スキルの参照資料で管理」準拠）。

### 不自然表現検出分類（REQ-0140-033）

`agentdev-doc-writing` は文書品質ゲートの查読観点として、現行自然言語文書および直近1週間以内に作成・更新された GitHub Issue 本文における不自然な日本語表現を検出する。検出分類（P0〜P4）と代表例を以下に示す。

| 分類 | 内容 | 例 |
|---|---|---|
| P0 | 文字化け、誤字、中国語簡体字混入、意味欠落 | `而非`, `来源`, `破綾`, `監査証跠` |
| P1 | 常用しない直訳語、独自語 | `単独根`, `局所物理分離`, `具象参照抽象化` |
| P2 | 名詞の過剰連結、助詞欠落 | `前工程完了度`, `責務割当`, `配布物ハーネス境界浄化` |
| P3 | 識別子ではない英語の文章混在 | `authoritative source`, `living pool`, `return` |
| P4 | 表記揺れ、用語統一 | `正規の情報源`, `正の情報源`, `権威ある情報源` |

修正方式（A: 安全な横断置換、B: 文脈別置換、C: 文全体の再記述、D: 原文復元）の対応表と禁語・許容の機械判定は、`agentdev-doc-writing` スキル参照資料（[japanese-replacement-dictionary.md](../../../src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md)）で管理する。本節は検出分類の原本として機能し、各語の割当ては参照資料へ委任する。

## 文書種別ごとの japanese-tech-writing 適用サブセット

japanese-tech-writing が定める全規範のうち、文書種別ごとに適用するサブセットを示す。
各文書種別は該当サブセットのみを適用対象とし、記載のない規範（演出、パラグラフライティング等）は適用外とする。
guides/README のみ全規範を適用する。

| 文書種別 | 適用サブセット | 非適用 |
|---|---|---|
| REQ | 整形、LLM表現禁止、冗長排除、演出抑制、用語政策 | パラグラフライティング、山場の演出 |
| ADR | 整形、LLM表現禁止、冗長排除、論証の厳密さ（因果の機構、譲歩の処理）、用語政策 | 演出 |
| SPEC | 整形、LLM表現禁止、冗長排除、識別子と散文の区別、用語政策 | 演出、パラグラフライティング |
| command | 整形、LLM表現禁止、冗長排除、見出しの付け方、用語政策 | 演出、パラグラフライティング |
| skill | 整形、LLM表現禁止、冗長排除、論証の厳密さ、用語政策 | 演出 |
| guides/README | japanese-tech-writing 全規範 | なし |
