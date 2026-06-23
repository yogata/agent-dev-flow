---
title: "配布物整合性検査ルール"
status: draft
created: 2026-06-22
updated: 2026-06-22
---

# 配布物整合性検査ルール

REQ-0142-006 / REQ-0142-007 の検査観点の詳細を配置する。
配布物（`src/opencode/commands/agentdev/`、`src/opencode/skills/agentdev-*/`）から内部管理 ID を除去した後の完了条件として、構文健全性、文意保持、責務整合を検査するための検出パターンと NG 分類を定義する。

## 構文健全性検査

- frontmatter 重複検出パターン
- 見出し（タイトル、入力、出力、手順）重複検出パターン
- Markdown 構文破損検出パターン

## 文意保持検査

- 壊れた括弧検出パターン（例: `（OU-012/）` 等、ID のみ除去された残骸）
- 壊れた参照表現検出パターン
- 主語、目的語欠落文検出パターン

## 責務整合検査

- command 本体と command SPEC 間の責務説明照合
- command と関連 skill 間の責務説明照合
- case-open / case-run / case-close / case-auto の責務境界照合（合意済み責務境界との一致）

## NG 分類表

| 分類 | 定義 | 後続対象 |
|------|------|----------|
| false positive | 検査ルールの誤検知 | 検査ルールの修正 |
| pre-existing | 今回の変更以前から存在する既知の問題 | 別途要件化 |
| 今回修正対象 | 今回の変更で導入、残存した問題 | 今回の Issue で修正 |
