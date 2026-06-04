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

## Trigger conditions

- ユーザーが「AIっぽい」「薄い」「抽象的」「意味不明」「ビジネス文書として直せ」と指示した場合
- README/docs/REQ/ADR/Issue/PR/完了報告/設計説明/発表原稿を執筆またはレビューする場合
- 完了報告を出力する場合
- Issue/PR 本文を生成する場合
- REQ/ADR 文書を作成する場合
- intake/learning 中間成果物を生成する場合

## 参照先

- [references/forbidden-phrases.md](references/forbidden-phrases.md) — 9 分類の検出・置換ルールセット

### See Also

- agentdev-workflow-templates
- agentdev-req-file-manager
- agentdev-adr-file-manager
- agentdev-skill-authoring
