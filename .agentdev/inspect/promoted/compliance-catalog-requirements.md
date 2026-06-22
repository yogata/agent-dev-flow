---
title: docs/requirements/ 規範逸脱カタログ
topic: requirements-compliance-catalog
source_issue: "#1046"
parent_epic: "#1037"
status: draft
created: 2026-06-23
review_norms:
  - japanese-tech-writing（REQ 適用サブセット: 整形・LLM 表現禁止・冗長排除・演出抑制・用語政策）
  - docs/specs/document-type-responsibilities.md（配置基準・用語政策・要件行の書き方・要件性・粒度・移送判断）
---

# docs/requirements/ 規範逸脱カタログ

## 概要

`docs/requirements/` 配下 41 ファイル（`retired/` ディレクトリ 59 ファイル除外・REQ-0101〜REQ-0147 の現行 39 件 + README.md + mapping-table.md）に対する japanese-tech-writing（REQ 適用サブセット: 整形・LLM 表現禁止・冗長排除・演出抑制・用語政策）および document-type-responsibilities.md（配置基準・用語政策・要件行の書き方・要件性・粒度・移送判断・硬直的固定記述の回避）の逸脱を抽出したカタログ。個別修正は後続 Issue で扱う（本カタログは見える化が目的）。遡及準拠の範囲は REQ-0140-026 に基づく。

> **ファイル数に関する注記**: Issue #1046 本文は「約96件」と記載するが、実際の `.md` ファイル数は **41 ファイル**（REQ-0101〜REQ-0147 の現行 39 件 + README.md + mapping-table.md）。`retired/` 配下 59 ファイルは査読対象外。Issue 本文の「約96件」は retired/ 含む想定または過去の構成に基づく数値とみられる（#1042 と同種のファイル数差異）。本カタログは実ファイル数 41 で査読した。Issue 本文の修正は別途 case-update 等で扱う。

REQ は要件テーブル（`| ID | 要件 |` 形式）を主体とするため、パラグラフライティング・演出は非適用。検出は整形（中黒・一文一行）・LLM 表現禁止・REQ 固有の要件行の書き方（1 行 1 関心・肯定文主文・要件性・粒度・移送判断・硬直的固定記述の回避）に集中する。

## 対象範囲

41 ファイル。内訳:

- `REQ-0101.md` 〜 `REQ-0147.md`（現行 REQ 39 件・番号飛びあり・retired 8 件除外）
- `README.md`（REQ インデックス・現行/廃止 REQ 一覧）
- `mapping-table.md`（旧 REQ から新 active REQ への移行表）

`retired/` 配下 59 ファイル（旧 REQ 50 件 + 廃止 8 件 + README）は査読対象外。`REQ-0140.md`・`REQ-0107.md`・`REQ-0101.md`・`REQ-0103.md` は req-save で更新済み（OU-001〜004）のため、最新状態で査読対象とした。

## 適用サブセット

REQ 適用サブセット（整形・LLM 表現禁止・冗長排除・演出抑制・用語政策）。パラグラフライティング・山場の演出は非適用。REQ 固有として要件行の書き方（1 行 1 関心原則・肯定文主文・長大行の分割基準）・要件性（主語・対象・状態・検証可能性・独立性）・粒度・移送判断・硬直的固定記述の回避を適用。

## 検出事項

### F-001（high）: 中黒（・）による日本語並列（パターン）

- **対象**: 全 41 ファイル中 39 ファイルで計 267 件（grep `[・]` で集計・retired/ 除く）。多: `REQ-0114.md` (41), `REQ-0102.md` (29), `REQ-0103.md` (28), `REQ-0101.md` (27), `README.md` (26), `REQ-0140.md` (19), `REQ-0112.md` (15), `REQ-0130.md` (13), `REQ-0104.md` (12), `REQ-0136.md` (12), `REQ-0137.md` (12), `REQ-0124.md` (11), `REQ-0145.md` (11) 他
- **該当規範**: 整形（中黒を日本語の並列で使わない）
- **現状**:
  - `REQ-0101.md` L29: 「`docs/guides/` は README.md（入口）と個別ガイドファイル（quickstart, command-selection, req-case-flow, intake-learning-backlog-flow, diagnostics-and-maintenance, artifacts-and-state, project-docs-and-specs, consumer-project-setup, troubleshooting, glossary）で構成すること」の関心対象列での中黒（`README.md` の関心対象欄「REQ/retired REQ/ADR/SPEC/DOC-MAP/guides の基準境界、ADR記述対象境界（意思決定のみ・作業手段除外・既存ADR重複確認）」等も同様）
  - `REQ-0140.md` L10: 「`agentdev-doc-writing`スキルに包括的文書品質ゲートを設ける。原本仕様は…`document-type-responsibilities.md`（文書種別の配置基準・用語政策）と…」
- **改善方向**: 日本語並列には読点（、）を使用する。括弧内の並列も読点に置換する。リポジトリ全体方針として横断 Issue で扱うことを推奨（src/opencode/commands/・src/opencode/skills/・docs/adr/・docs/guides/ の各カタログでも共通出現）。
  - 例: 「ADR記述対象境界（意思決定のみ、作業手段除外、既存ADR重複確認）」

### F-002（high）: README.md 関心対象列における 1 セル複数関心（パターン）

- **対象**: `README.md` L8-L46（REQ-0101〜REQ-0147 の全行の「関心対象」列）。39 行中ほぼ全行が影響。
- **該当規範**: 粒度（1 行 1 責務）・要件行の書き方（長大行の分割基準）・移送判断（SPEC 相当内容の列挙は SPEC・README 別節に）
- **現状**: 各 REQ 行の「関心対象」セルに、読点・中黒・スラッシュ区切りで 5〜15 関心が 1 セルに詰め込まれている。
  - `README.md` L8（REQ-0101 行）: 「REQ/retired REQ/ADR/SPEC/DOC-MAP/guides の基準境界、ADR記述対象境界（意思決定のみ・作業手段除外・既存ADR重複確認）」
  - `README.md` L15（REQ-0108 行）: 「整合性検査、検出事項の分類・ルーティング、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査、artifact collection registry、source/projection scan分離、基準管理、ルールカタログ、REQ impact map、3層gate、meta-integrity、repo-local自己監査・配布対象外、ADR主題妥当性検出」（14 関心）
  - `README.md` L40（REQ-0146 行）: 「oh-my-openagent CLI引数正規化・委譲プロンプト雛形・case-open即時push・case-auto委譲契約MUST NOT DO・case-close squash merge後reset・git-common-procedures・実行主体分類表・3層検出構造SPEC化・doc-writing査読観点・前工程完了度3段階・subagent-protocol・command-authoring判断基準・バッチIssue完了判定追跡性」（13 関心・スラッシュ区切り）
- **改善方向**: 関心対象は核心 1 文に短縮するか、箇条書きに展開する。詳細関心は各 REQ ファイル本文に譲り、README は REQ タイトル相当の要約に留める。「SPEC 相当内容の列挙」（ルールカタログ・schema・enum・判定表）は SPEC へ移送する候補。

### F-003（med）: 要件行の主語省略・操作主体不明（パターン）

- **対象**: 全 39 REQ ファイル中 15 以上で検出。`REQ-0101.md`, `REQ-0102.md`, `REQ-0104.md`, `REQ-0119.md`, `REQ-0140.md` 他
- **該当規範**: 要件性（主語: 誰が・何がその要件を満たすかが明確であること）・要件行の書き方（肯定文主文）
- **現状**: 多くの要件行が「〜すること」形式で、操作主体（command・skill・ユーザー・システム）が省略されている。REQ-0101 では明示（`REQ-0101-008: ADR は…配置すること`）されている行と省略されている行が混在。
  - `REQ-0101.md` L18: 「`REQ-0101-018 | コマンド系統の説明においては、機能的責務・操作種別・分類体系に基づく構造名を使用すること |`」（誰が使用するか: README 作成者・command 作者・スキル作者いずれか）
  - `REQ-0140.md` L25: 「`REQ-0140-010 | サブエージェント委譲の共通契約は読解・検査・分類・候補抽出・根拠提示に限定し、保存・Issue/PR更新・commit・push・ユーザー確認・完了報告は親コマンドが保持すること |`」（「親コマンド」は主体だが、特定 command 名でない）
- **改善方向**: 各要件行の主語（command 名・skill 名・ユーザー・システム）を冒頭に明示する。 REQ-0140-010 は「サブエージェントを呼び出す親 command は、委譲契約を…に限定すること」と書き換え可能。

### F-004（med）: SPEC 相当内容（列挙・カタログ・手順明細）の REQ 埋め込み

- **対象**: `REQ-0108.md`, `REQ-0144.md`, `REQ-0145.md`, `REQ-0146.md`, `REQ-0147.md`, `REQ-0101.md` L29, `REQ-0112.md` 他。8 件以上。
- **該当規範**: 文書種別責務（REQ 要件行が SPEC 相当内容のみを主たる文意とする場合 SPEC 等へ配置）・移送判断（移送: 別の文書種別への移動が必要）・REQ-0140-027（実行主体分類・SPEC 配置）
- **現状**: REQ 要件行が SPEC 相当の列挙・カタログ・手順詳細を主内容としている。
  - `REQ-0108.md`（関心対象）: 「整合性検査、検出事項の分類・ルーティング、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査、artifact collection registry、source/projection scan分離、基準管理、ルールカタログ、REQ impact map、3層gate、meta-integrity、repo-local自己監査・配布対象外、ADR主題妥当性検出」（ルールカタログ・検査項目列挙は SPEC 相当・`docs/specs/integrity-rule-catalog.md` が既存）
  - `REQ-0144.md`・`REQ-0145.md` の要件行も個別 docs-check 検出項目・IR 番号・閾値を列挙しており SPEC 相当（`docs/specs/integrity-rule-catalog.md`・`docs/specs/docs-spec-rebuild-integrity.md` への移送候補）
- **改善方向**: 列挙・カタログ・詳細手順は該当 SPEC ファイルへ移送し、REQ 行は核心契約（何を保証するか）のみを 1 文で表現する。既存 SPEC（`integrity-rule-catalog.md` 等）への参照形式にする。安定契約例外（REQ-0101-069）に該当する公開 command 名・入口・安全境界は REQ に残せる。

### F-005（med）: 硬直的固定記述（件数・ファイル名列挙の REQ 埋め込み）

- **対象**: `README.md` L5, L34, L40 他・`REQ-0101.md` L29（ガイドファイル名列挙）・`mapping-table.md`
- **該当規範**: 硬直的固定記述の回避（件数・ファイル名列挙を要件に埋め込まず、構造要件のみ記述する）
- **現状**:
  - `README.md` L5: 「現在の要件判断では、以下39件（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は廃止）を第一参照先とする。」（件数 39 と廃止 REQ 8 件の ID 列挙が埋め込み）
  - `REQ-0101.md` L29: 「`docs/guides/` は README.md（入口）と個別ガイドファイル（quickstart, command-selection, req-case-flow, intake-learning-backlog-flow, diagnostics-and-maintenance, artifacts-and-state, project-docs-and-specs, consumer-project-setup, troubleshooting, glossary）で構成すること」（10 ガイドファイル名を要件に埋め込み）
- **改善方向**: 件数・ファイル名は SPEC・README・guide 側で管理し、REQ は構造のみ（「現行要件セットを第一参照先とする」「`docs/guides/` は README.md（入口）と個別ガイドファイルで構成する」）を記述する。ファイル追加時に REQ を都度更新する硬直性を排除する。

### F-006（med）: 接続の型「〜において」の使用（パターン）

- **対象**: `REQ-0101.md` L18, L33・`REQ-0103.md` L93, L94・`REQ-0131.md` L25・`REQ-0114.md` L40, L44-L45, L51-L52・`REQ-0104.md` L40-L41・`REQ-0134.md` L34・`REQ-0140.md` L17, L41・`REQ-0109.md` L16 他（active 16 件・計 37 件）
- **該当規範**: LLM 表現禁止（接続の型「〜において」）
- **現状**:
  - `REQ-0101.md` L18: 「コマンド系統の説明**において**は、機能的責務・操作種別・分類体系に基づく構造名を使用すること」
  - `REQ-0140.md` L41: 「SPEC / command / skill **において**実行主体が誤認されている箇所（command を skill と呼ぶ、harness を skill と呼ぶ、subagent を skill と呼ぶ等）を検出すること」
- **改善方向**: 「において」を直接表現に置き換える。「コマンド系統の説明では、…」「SPEC / command / skill で実行主体が誤認されている箇所を…」等。とりわけ REQ-0140 自身が LLM 表現禁止を定める REQ であり、自身の記述での「において」使用は規範と矛盾する。

### F-007（low）: em-dash（— ―）の使用（少件数）

- **対象**: `REQ-0119.md` (1)・`REQ-0123.md` (1)。active ファイル 2 件のみ（retired/ には多数）。
- **該当規範**: 整形（ダッシュを日本語の地の文・見出しで使わない）
- **現状**: active REQ ファイルでは em-dash 使用は限定的（2 件のみ）。retired/ 配下では広範（112 件 / 31 ファイル）だが retired は査読対象外。
- **改善方向**: 該当 2 箇所を括弧（）または句点による 2 文分割へ置換する。active REQ の整形準拠度は高いため、軽微な修正で完了する。

### F-008（low）: 1 行複数文（要件行内・目的節）

- **対象**: 各 REQ ファイルの「## 目的」節・README.md L5（3 文 1 行）他
- **該当規範**: 整形（一文一行）
- **現状**:
  - `REQ-0140.md` L10: 「`docs/`配下の現行文書の文書種別責務・要件性・文意品質・粒度を是正・維持するため、`agentdev-doc-writing`スキルに包括的文書品質ゲートを設ける。原本仕様は`docs/specs/document-type-responsibilities.md`（文書種別の配置基準・用語政策）とAGENTS.md経由で参照する`japanese-tech-writing`スキル（執筆規範）とし、`agentdev-doc-writing`はその実行入口、`references/*`は運用ビューとする。このゲートはQG-1〜QG-4の主ゲート体系を置き換えず、req-save / spec-saveで必須チェックとして組み込む。」（3 文 1 行・目的・原本仕様・ゲート位置づけが混在）
  - `README.md` L5: 「現在の要件判断では、以下39件（…）を第一参照先とする。旧REQ 50件はすべて廃止済みであり、履歴参照に限定する。」（2 文 1 行）
- **改善方向**: 文ごとに改行する。目的節は読者が最初に読む部分のため、1 文 1 行を厳格に適用する。

### F-009（low）: 「〜する」「〜すること」体言止め・述語省略の混在

- **対象**: 各 REQ ファイルの要件行（`| REQ-XXXX-NNN | 〜すること |`）の末尾・README.md L18-L20 の「基準構造」節他
- **該当規範**: 整形（一文一行）・読者への誠実さ（完結した文にする）
- **現状**: 要件行は「〜すること」形式で統一されているが、README.md の「基準構造」節は体言止め（「現行 REQ: `docs/requirements/REQ-{NNNN}.md`」）で述語がない。両形式が README 内で混在する。
- **改善方向**: README の箇条書きは体言止めで統一するか、完結した文にする。REQ 要件行の「〜すること」形式は SPEC が定める要件行形式（REQ-0101-004 等）に従うため維持し、README のみ整える。

### F-010（info）: REQ 全体の規範準拠度（参考記録）

- **対象**: 41 ファイル全体
- **該当規範**: （参考記録・逸脱ではない）
- **現状**: REQ ファイル群は要件定義文書として整理されており、主要な逸脱は表現スタイル（中黒・複数関心・硬直的固定記述）に集中する。論証構造・情報の正確性・要件 ID の一意性に顕著な問題はない。REQ-0140（文書品質ゲートを定める REQ 自身）に「において」・中黒が含まれる点は、遡及準拠（REQ-0140-026）の対象として後続 Issue で修正する。
- **改善方向**: （対応不要。検出事項の見える化が目的なため準拠状況も記録する）

## 対象外

- 要件内容の正確性・過情報・不足（論理的矛盾・機能欠落）は `/agentdev/inspect-docs` で扱う。
- REQ 間のリンク切れ・参照先不存在・REQ-ADR 間の参照不整合は `/agentdev/inspect-docs`・`/agentdev/inspect-skills` で扱う。
- REQ 内で言及されるコマンド名・スキル名・サブエージェント名の正しさ（実行主体分類の誤認）は `/agentdev/inspect-skills` で扱う。REQ-0140-027 がこの査読を要求するが、発見の修正は inspect-skills／後続 Issue が担う。
- `retired/` 配下 59 ファイルは Issue #1046 の対象外（履歴参照用途）。本カタログは retired/ を査読していない。

## 後続 route 候補

- F-001（中黒）: リポジトリ全体の中黒使用方針（src/opencode/commands/・src/opencode/skills/・docs/adr/・docs/guides/ の各カタログでも共通出現）と合わせて横断 Issue で扱うことを推奨。
- F-002, F-004, F-005（README 関心対象列の複数関心・SPEC 相当内容・硬直的固定記述）: 1 Issue で「docs/requirements/README.md 関心対象列の整理・SPEC 相当内容の移送・件数/ファイル名の SPEC 委譲」として扱う。
- F-003（主語省略）: 1 Issue で「docs/requirements/ 要件行の主語明示」として扱う。
- F-006（において）: 接続の型の軽微整形として 1 Issue にまとめ対応可能（REQ-0140 自身の自己準拠を含む）。
- F-007, F-008, F-009（軽微整形）: 1 Issue にまとめて対応可能。
