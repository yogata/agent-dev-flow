---
name: agentdev-no-ai-slop-writing
description: Detects and fixes AI-slop in natural language artifacts to produce actionable business documents. USE FOR: writing or reviewing README/docs/REQ/ADR/Issue/PR/reports/design docs/presentations, fixing AI-ish/thin/abstract content. DO NOT USE FOR: code implementation, test execution, REQ/ADR numbering, APPEND/UPDATE/CREATE judgment, ADR necessity judgment, command procedure design, Issue/PR CRUD, casual writing/ads/poetry.
---

# AI-slop Writing Quality Gate

## 目的

自然言語アーティファクト中の AI-slop を検出し、読者が判断・実行できる文書に修正する。AI-slop とは、一見整っているが判断材料として機能しないテキスト。目的は「文章をきれいにする」ことではない。

## 対象 / 対象外

**対象:** README, docs/guides/specs, REQ/ADR, command/skill descriptions, Issue bodies, PR bodies, 完了報告, 設計説明, 発表原稿, intake/learning 中間成果物

**対象外:** REQ/ADR 番号付与, APPEND/UPDATE/CREATE 判定, ADR 必要性判定, command 手順設計, Issue/PR CRUD, コード実装, テスト実行, カジュアルな文章/広告/詩

## AI-slop 定義（10 基準）

1. **主語がない** — 誰が何をするか不明
2. **結論がない** — 読み手が次に何をすべきか分からない
3. **根拠と判断が分離されていない** — なぜその判断に至ったか追跡不能
4. **抽象的で具体的な操作に落とせない** — 実行可能な手順に変換できない
5. **既存の実装・ドキュメント・要件との関連がない** — 文脈から浮いている
6. **読者の次動作がない** — 読後に何も起きない
7. **根拠のない推測がある** — 事実と推論が混在
8. **比喩や雰囲気の水増しがある** — 実質なしで文字数を稼ぐ
9. **ユーザーの同意を前提としていない確認がある** — 形式的な確認で実質的な合意を回避
10. **もっともらしい一般論で具体的事実を置き換えている** — 固有の文脈を一般化で回避

## 出力原則（5 順序）

1. 結論
2. 判断理由
3. 根拠
4. 具体的な対応
5. 不明点または残リスク

この順序を崩すのは、読者にとってその方が明確になる場合のみ。

## Pre-output review（11 ルール）

1. 結論を先頭に書く
2. 主語を明示する
3. 判断と根拠を分離する
4. 抽象語を条件・操作・判定基準・成果物・責務・失敗条件・参照先に置換する
5. 根拠なき推測で不明点を埋めない
6. 推論は「推論」と明記する
7. 不明点は「不明」と明記する
8. 同じ内容の言い換えを削除する
9. 水増し、無条件の同調、不要な結びを削除する
10. 外部事実、仕様、数値、引用、最新情報には根拠を付ける
11. 読者が承認・却下・修正指示・実装・レビュー・Issue 化・後続調査のいずれかを実行できる状態にする

## 文書表記・文意品質ゲート

docs 作成・編集時に併用する付帯品質ゲート（REQ-0140）。QG-1〜QG-4 の主ゲート体系を置き換えず、docs 日本語表現・文意整合の補助検査として位置づける。

### 対象

- `docs/**`（REQ, ADR, SPEC, guides, DOC-MAP, README）
- docs を生成・編集する command / skill の自然言語記述（req-define, req-save, spec-save, case-run, case-close, case-auto, inspect-docs, docs-check が扱う docs 成果物とその記述）

### 位置づけ

- 本ゲートは付帯品質ゲートであり、QG-1（定義完全性）・QG-2（受入基準網羅）・QG-3（実装乖離）・QG-4（最終受入）の主ゲートを置き換えない。
- docs 作成・編集時に `agentdev-quality-gates` の主ゲートとは独立に併用する。

### 判定基準（7 項目）

1. **日本語本文の自然性** — 機械翻訳調・不自然な語順・助詞の欠落がないか。読者が一度で理解できる日本語か。
2. **主体・対象・許可操作・禁止操作・出力先・最終判断者の明確性** — 誰が何を対象に何を許可され何を禁止され、結果をどこへ出力し、最終判断を誰が行うかが明記されているか。
3. **英語混じり抽象語の説明なし残留** — `read-only`・`advisor`・`architecture-affecting` 等の英語抽象語が、文脈定義なしで残留していないか。
4. **識別子の初出日本語注記** — `gate_check`・`delegation_type`・`side_effect_boundary` 等の識別子は初出時に日本語で役割が注記されているか（REQ-0140-003）。
5. **`read-only` の機械的置換禁止** — `read-only` を「読み取り専用」と一律に置換せず、文脈に応じて参照専用入力・対象を直接修正しない診断・保存更新を親に残す委譲・検出報告型へ分解しているか（REQ-0140-004）。
6. **出力生成コマンドの read-only 表記禁止** — 実際に出力生成・commit・push・git 永続化を行うコマンド全体を `read-only` と表現していないか（REQ-0140-005）。許可出力と禁止操作を明記する。
7. **アーキテクチャ助言系表現の責務分解** — `architecture-affecting`・`Architecture advisory gate`・`advisor`・`advisory` 型の表現を、ADR 要否・判断主体・根拠提示・最終判断の責務へ分解しているか。`architecture-affecting` は「ADR判断が必要な変更」または「ADR要否確認が必要な変更」と表現し、「アーキテクチャに影響する」のみで使用しない。`Architecture advisory gate` は「ADR要否確認ゲート」と表現する（REQ-0140-006, 012, 013）。

### read-only 系表現の分解要件

`read-only` 系表現を用いる・診断コマンドを記述する場合は以下を明記する（REQ-0140-008, 009, 010, 011）。

- 何を変更しないか（検査対象ファイル・canonical docs・REQ/ADR/SPEC）
- 何を読み取ってよいか
- 何を生成してよいか（許可出力先: finding file・report・intake item 等）
- commit / push の可否と対象範囲
- Issue / PR 更新の可否
- 最終判断主体（親コマンドが保持するか）

診断コマンドの許可出力: 検出結果・根拠・推奨処理先・レポート・intake item。禁止操作: 検査対象ファイル変更・許可範囲外 commit/push・Issue/PR 更新。

サブエージェント委譲の共通契約は読解・検査・分類・候補抽出・根拠提示に限定し、保存・Issue/PR 更新・commit・push・ユーザー確認・完了報告は親コマンドが保持する（REQ-0140-010）。委譲定義の `side_effect_boundary` に `read_only` を包括値として使用せず、`read_files`・`inspect_content`・`return_evidence` 等の具体的な許可操作で表現する（REQ-0140-011）。

### Trigger conditions（ゲート専用）

- docs/** の REQ・ADR・SPEC・guides・DOC-MAP・README を作成・編集・レビューする場合
- docs を生成・編集する command / skill の本文・description・参照記述を執筆・編集する場合
- `read-only`・`advisor`・`architecture-affecting` 等の英語混じり表現が docs に残留していないか確認する場合
- 委譲契約・実装分類の副作用境界を記述する場合

### Pre-output review（ゲート専用）

文書表記・文意品質ゲートを通す場合、docs 成果物の出力前に以下を確認する。

1. 英語抽象語が検出された場合、[forbidden-phrases.md](references/forbidden-phrases.md) の「文意修正ルール」に従い検出→書き換えを行う
2. `read-only` が「読み取り専用」と機械置換されていないか確認する
3. 実際に commit/push を行うコマンドが `read-only` と表現されていないか確認する
4. 識別子（`delegation_type`・`side_effect_boundary` 等）の初出に日本語注記があるか確認する
5. 委譲定義の `side_effect_boundary` が包括値 `read_only` ではなく具体的許可操作で記述されているか確認する
6. `architecture-affecting` 系表現が ADR 要否・判断主体・根拠へ分解されているか確認する

## Trigger conditions

- ユーザーが「AIっぽい」「薄い」「抽象的」「意味不明」「ビジネス文書として直せ」と指示した場合
- README/docs/REQ/ADR/Issue/PR/完了報告/設計説明/発表原稿を執筆またはレビューする場合
- 完了報告を出力する場合
- Issue/PR 本文を生成する場合
- REQ/ADR 文書を作成する場合
- intake/learning 中間成果物を生成する場合

## 参照先

- [references/forbidden-phrases.md](references/forbidden-phrases.md) — 9 分類の検出・置換ルールセット、文意修正ルール（read-only・advisor・architecture-affecting 系変換）

### See Also

- agentdev-workflow-templates
- agentdev-req-file-manager
- agentdev-adr-file-manager
- agentdev-skill-authoring
