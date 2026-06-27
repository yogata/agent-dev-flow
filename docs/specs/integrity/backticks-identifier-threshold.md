---
title: "backticks 識別子/一般名詞 判定閾値"
status: accepted
created: 2026-06-25
updated: 2026-06-25
---

# backticks 識別子/一般名詞 判定閾値

## 目的

docs/** 配下の自然言語記述において、識別子（backticks 必須）と一般名詞（backticks 任意）の判定閾値を機械判定可能な形で定義する（#1118 X-7）。
runtime-package-boundary.md「5 種のリポジトリ種別」表の Type ID 列（識別子は backticks、名称は日本語）を良パターン基準とする。

## 識別子（backticks 必須）

以下のいずれかに該当する語句は識別子とし、backticks で囲むことを必須とする。

- コマンド名、スキル名、ファイル名、ディレクトリパス（`/agentdev/req-define`、`agentdev-doc-writing`、`docs/specs/foundations/system.md`）
- REQ/ADR/SPEC/RU/OU/IR 等の成果物 ID（`REQ-0101`、`ADR-0103`、`RU-0005`）
- frontmatter キー、YAML フィールド名、enum 値、code block 内字句
- 英字 kebab-case / snake_case / CamelCase の技術識別子（`self-hosting`、`work_type`、`auto_ready`）

## 一般名詞（backticks 任意）

以下の語句は一般名詞とし、backticks を必須としない。

- 日本語一般名詞（要件定義、品質ゲート）
- 和訳済み技術用語で定着したもの（document-type-responsibilities.md 許容リスト参照）
- 文中の普通名詞としての英語（baseline, provider 等の散文使用は SUB-D 判定対象）

## 機械判定閾値

| 分類 | 機械判定条件 | backticks |
|---|---|---|
| 識別子 | 上記識別子条件のいずれかに合致 | 必須 |
| 一般名詞 | 識別子条件に非合致 | 任意 |

判定は mechanical-replacement-rules.md の相互参照先として組み込まれ、inspect-docs 検出処理が参照する。
文脈依存の境界ケース（英字複合語の識別子/普通名詞揺らぎ）は機械判定対象外とし、サンプリング查読へ委譲する。

## 関連

- 用語政策 SSoT: `docs/specs/responsibilities/document-type-responsibilities.md`
- 機械判定アルゴリズム: `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md`
- 良パターン基準: `docs/specs/local/runtime-package-boundary.md`「5 種のリポジトリ種別」Type ID 列
