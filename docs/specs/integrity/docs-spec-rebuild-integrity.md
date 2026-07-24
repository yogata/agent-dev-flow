---
title: "配布物整合性検査ルール"
status: accepted
created: 2026-06-22
updated: 2026-07-24
---

# 配布物整合性検査ルール

REQ-0142-006 / REQ-0142-007 の検査観点の詳細を配置する。
配布物（`src/opencode/commands/agentdev/`、`src/opencode/skills/agentdev-*/`）から内部管理 ID を除去した後の完了条件として、構文健全性、文意保持、責務整合を検査するための検出パターンと NG 分類を定義する。

## 検査バックエンド責務分担（check_integrity.ts vs inspect-* skills）

配布物整合性検査（本 SPEC が定義する構文健全性、文意保持、責務整合の検出パターン）の実行バックエンドを以下の通り確定する。
`docs-check` バックエンド（`check_integrity.ts`）と inspect-* skills の責務分担を明確化し、検出漏れと NG 汚染を防ぐ（REQ-0145-004）。

### 責務分担（決定論的 vs 意味的診断）

[integrity-contracts.md](integrity-contracts.md) 「3層検出構造の責務分担」に基づき、配布物整合性検査は**意味的診断層**に位置づける。

| 層 | 担当 | 配布物整合性検査における役割 |
|-----|------|------------------------------|
| 機械的検出 | `docs-check` + `check_integrity.ts`（IR ルール） | 配布物に対する**決定論的**検出のみ（frontmatter 許可フィールド、`### Step N` 連番、ガードレール番号形式、リンク先存在等、IR ルールカタログ既定の検出） |
| 意味的診断 | inspect-* skills（inspect-docs / inspect-skills） | **配布物整合性検査の本体**。本 SPEC が定義する構文健全性（frontmatter 重複、見出し重複、Markdown 構文破損）、文意保持（壊れた括弧、壊れた参照表現、主語/目的語欠落文）、責務整合（command↔SPEC、command↔skill 責務説明照合、case-* 責務境界一致）を診断する |
| 査読時観点 | doc-writing skill | 文書品質の査読 |

### 境界の明文化

- **`check_integrity.ts`（docs-check バックエンド）の扱い**: 配布物に対して REQ/SPEC/reference 整合性（frontmatter 許可フィールド、ID 一意性、リンク到達性、Step 形式、namespace legacy 残存等、IR ルールカタログ既定の決定論的検出）を実施する。本 SPEC が定義する配布物整合性検査（構文健全性の重複検出、文意保持の意味解析、責務整合の照合）は `check_integrity.ts` に追加**しない**。
- **inspect-* skills の扱い**: 配布物整合性検査（本 SPEC）は inspect-docs（Step 11: 配布物整合性検査）、inspect-skills（配布物 frontmatter 構文健全性、見出し構文健全性、Markdown 構文破損、壊れた括弧/参照残骸、command-skill 責務説明矛盾）のみで運用する。
- **`skill-category-gap` ルールとの整合**: 配布物整合性検査を `check_integrity.ts` に新カテゴリとして追加しないことにより、`check_integrity.ts` の `categoryToCheckPattern` map と SKILL.md カテゴリ定義の不一致（skill-category-gap、REQ-0108-161/171、REQ-0144-005）による NG 汚染を生じない。新カテゴリ導入に伴うターゲットング隠退化を防ぐため、配布物整合性検査は inspect-* skills（意味的診断層）に集約する。

### 根拠

- 配布物整合性検査の主要観点（重複検出、文意保持の意味解析、責務説明照合）は意味判断を含み、決定論的機械検出では偽陽性リスクが高い。`integrity-contracts.md`「3層検出構造の責務分担」は「機械的検出で偽陽性となる意味的判断は inspect-skills へ振り分ける」を定めるため、配布物整合性検査は意味的診断層（inspect-* skills）に集約する。
- `check_integrity.ts` は決定論的検出（IR ルール）に特化し、実行速度、再現性、CI 適性を維持する。意味的診断を混入しないことで NG ノイズを低減する。

## 構文健全性検査

- frontmatter 重複検出パターン
- 見出し（タイトル、入力、出力、手順）重複検出パターン
- Markdown 構文破損検出パターン
- 存在しない command 参照の検出パターン
- エンコーディング不整合の検出パターン

存在しない command 参照の検出は、README listing と command 本文の相互参照について、存在しない command を指す参照を検出事項として出力する。実在する command を指す参照は検出対象としない。

エンコーディング不整合の検出は、配布物 Markdown の UTF-8 BOM の有無と改行コードの一貫性を検査し、UTF-8 BOM 付きファイルまたは単一ファイル内の CRLF/LF 混在を検出事項とする。BOM なし UTF-8 かつ単一の改行コードで構成されたファイルは検出対象としない。

これらの検出は配布物整合性診断を提供する各 command（inspect-docs、inspect-skills）に共通で適用する。診断カテゴリ、共通証拠構造、finding 出力契約は agentdev-doc-diagnostics skill（`docs/specs/skills/agentdev-doc-diagnostics.md`「検証観点」「See Also」が正規所有箇所）を正規所有者とし、本 SPEC は検出パターンの定義に特化する。

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

