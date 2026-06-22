---
title: src/opencode/commands/ 規範逸脱カタログ
topic: commands-compliance-catalog
source_issue: "#1041"
parent_epic: "#1037"
status: draft
created: 2026-06-23
review_norms:
  - japanese-tech-writing（command 適用サブセット: 整形・LLM 表現禁止・冗長排除・見出しの付け方・用語政策）
  - docs/specs/document-type-responsibilities.md（配置基準・用語政策）
---

# src/opencode/commands/ 規範逸脱カタログ

## 概要

`src/opencode/commands/` 配下 49 ファイル（`agentdev/` 本体 17・`agentdev/templates/**` 32）に対する japanese-tech-writing（command 適用サブセット: 整形・LLM 表現禁止・冗長排除・見出しの付け方・用語政策）および document-type-responsibilities.md（配置基準・用語政策）の逸脱を抽出したカタログ。個別修正は後続 Issue で扱う（本カタログは見える化が目的）。遡及準拠の範囲は REQ-0140-026 に基づく。

command 系は AG-007/AG-008 で一度整理されており、規範準拠度が高い。検出事項は少なめ（パターン単位で 6 件）。

## 対象範囲

49 ファイル。内訳:

- `agentdev/` コマンド定義（17）: backlog-review, case-auto, case-close, case-open, case-run, case-update, inspect-docs, inspect-promote, inspect-skills, intake-capture, intake-from-github, intake-promote, learning-promote, README, req-define, req-save, spec-save
- `agentdev/templates/**`（32）: backlog-review, case-close, case-open, case-run, case-update, common, inspect-docs, inspect-promote, inspect-skills, intake-capture, intake-from-gaintenance, integrity-check, learning-promote, req-define, req-save 各ディレクトリ配下のテンプレート群

## 適用サブセット

command 適用サブセット（整形・LLM 表現禁止・冗長排除・見出しの付け方・用語政策）。演出・パラグラフライティングは非適用。

## 検出事項

### F-001（med）: 接続の型「〜において」の使用

- **対象**: `agentdev/case-run.md` L148
- **該当規範**: LLM 表現禁止（接続の型）
- **現状**: 「G31: Sisyphus-Junior への引き渡し**において** worktree root（相対パス・`.worktrees/{N}-{type}/`）を必ず含め、メインリポジトリパスを渡さないこと」
- **改善方向**: 「において」を直接表現に置き換える。「Sisyphus-Junior へ引き渡す worktree root（...）を必ず含め」または「Sisyphus-Junior への引き渡し時に worktree root を必ず含め」。

### F-002（low）: HTML コメント内の複数文 1 行併記

- **対象**: `agentdev/templates/req-define/req-draft.md` L14, L105
- **該当規範**: 整形（一文一行）
- **現状**:
  - L14: `<!-- 【必須】draft 出力 JSON Schema。 --> JSON Schema・オプションデータは不要。-->`（コメント内で 2 文が 1 行）
  - L105: `<!-- 【必須】残すエントリを過不足なく明示。（特定のエントリを残す）（参照のみのエントリは除外対象）-->`
- **改善方向**: コメント内も一文一行を原則とする。コメントブロックを複数行に分けるか、句点で改行する。

### F-003（med）: 中黒（・）による日本語並列（パターン）

- **対象**: 複数ファイル。`agentdev/case-run.md` L4, L81, L85, L96 等、`agentdev/inspect-docs.md` L31、`agentdev/inspect-skills.md` L12 等
- **該当規範**: 整形（中黒を日本語の並列で使わない）
- **現状例**:
  - `case-run.md` L4: 「単一 Issue または単一 Wave（Epic Issue 指定時: 現在 ready な Wave の子Issue を並列実行）を実行担当サブエージェント（Sisyphus-Junior・ulw-loop）へ委譲し」
  - `case-run.md` L96: 「`## Findings / Capture候補`（本筋外発見・intake/learning 候補）とは別セクション」
  - `inspect-docs.md` L31: 「`docs/requirements/`、`docs/adr/`、`docs/specs/`、`docs/guides/`、`docs/DOC-MAP.md`、`README.md`、`.opencode/` を収集」
- **改善方向**: 日本語並列には読点（、）またはスラッシュ／箇条書きを使用する。識別子やコード値の並列も地の文としては中黒を避ける方針（document-type-responsibilities.md が同様の書き方を採用）。リポジトリ全体方針として横断 Issue で扱うことを推奨。

### F-004（med）: 引用ブロック内の太字ラベル前置き

- **対象**: `agentdev/case-run.md` L116 等（Epic Wave 実行モード冒頭）、他多数
- **該当規範**: 演出抑制（本文中の太字強調を多用しない）※command 系は演出抑制が非適用だが、LLM 表現禁止の「予告と総括」に近い前置きパターンとして記録
- **現状**: 多数の引用ブロック（`>`）やガードレール見出しで「**前置きフレーズ**」形式が多用されている。
  - 例: `> **Epic Issue の入力ソース（REQ-0114-087/088）**: Epic Issue は...`
- **改善方向**: command 系では演出抑制は非適用のため許容範囲が広いが、太字ラベル + コロン形式が連続すると読みづらさが増す。重要度に応じてラベルを外し本文に溶け込ませるか、見出し階層で表現する。

### F-005（low）: テーブルセル内の複数文併記

- **対象**: `agentdev/spec-save.md` L25 他（テーブル内）
- **該当規範**: 整形（一文一行）
- **現状**: `| draft | spec-save で保存された直後の状態。境界違反検査の対象外 | spec-save が新規 SPEC 作成時に付与（既定値） |`
- **改善方向**: テーブルセルは例外的に 1 セル複数文を許容する慣用があるが、長文になる場合は脚注または別行に分離を検討する。本カタログでは軽微として記録する。

### F-006（info）: command 系の規範準拠度（参考記録）

- **対象**: 49 ファイル全体
- **該当規範**: （参考記録・逸脱ではない）
- **現状**: command 系は AG-007/AG-008 で文章整理を一度通っており、以下の規範について顕著な逸脱は検出されなかった。
  - LLM 表現禁止（予告と総括・正面から系・空虚な形容・空虚な動詞・弱い緩和）: 顕著な使用なし
  - em-dash（—）の日本語地の文使用: 検出なし
  - 「type──主題」形式の見出し: 検出なし
  - 手順専用の情報量なし見出し: 検出なし
- **改善方向**: （対応不要。本カタログは検出事項の見える化が目的なため、準拠状況も記録する）

## 対象外

- 演出・パラグラフライティング関連の規範は command 適用サブセット外のため検出対象外。
- `agentdev/templates/**` のテンプレート変数（`{{...}}`）展開後の文書品質は、テンプレート利用時に別途評価するべきで本カタログの対象外。
- REQ/ADR/SPEC との仕様レベル整合性（コマンドと SPEC 間の責務境界・入出力契約の矛盾）は inspect-skills/inspect-docs の査読観点であり本カタログ外。

## 後続 route 候補

- F-001: 単独修正 Issue で即時修正可能。
- F-003: リポジトリ全体の中黒使用方針と合わせて判定が必要なため、用語政策系の横断 Issue で扱うことを推奨（src/opencode-local/・docs/guides/・docs/adr/ のカタログでも共通して出現）。
- F-002, F-005: command テンプレート群の軽微整形として 1 Issue にまとめ可能。
- F-004: command 系の表現スタイル方針（太字ラベル許容度）を document-type-responsibilities.md に明文化する案を、別途 ADR/SPEC 検討 Issue で扱う価値がある。
