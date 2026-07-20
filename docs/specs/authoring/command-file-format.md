---
title: "コマンドファイルフォーマット規約"
status: accepted
created: 2026-06-22
updated: 2026-07-03
---

# コマンドファイルフォーマット規約

AgentDevFlow が管理する command 定義ファイルの Markdown 構成標準。
本 SPEC は command 定義ファイルが従うべき詳細なフォーマット規約を定義する。

> **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0103, ADR-0104）。

> **authoring/ ドメインでの配置理由**: 本 SPEC は本文構造・見出し構成・Step 表現・記述形式という執筆規約系の内容を扱うため、共通文書モデル規約（frontmatter・ID 体系・命名規則・URL 参照形式）を扱う `../foundations/patterns.md` と責務分離して `authoring/` ドメインに配置する。
> `authoring/` は将来 REQ/SPEC/SKILL/guide 執筆規約の集約先として拡張余地を持つ（現状は command のみ）。即時統合・`authoring/` の削除は行わない。

## 適用範囲

- **対象**: `src/opencode/commands/agentdev/*.md`（AgentDevFlow 配布 command 原本）、`.opencode/commands/repo/*.md`（repo-local command）
- **対象外**: AgentDevFlow 適用プロジェクト（consumer project）の独自 command

## extensions 手順

command 本文は extensions 手順（ADR-0135、SPEC `../foundations/project-extensions.md`）のみを持ち、具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を固定しない。

各 command は以下の共通記述を本文に持つ。extension は5セクション（`context`/`rules`/`checks`/`acceptance_gates`/`must_not`）を持ち、標準動作に追加・拡張される（上書きではない）。SPEC パス例示、検査対象パス指定は例外として許可する:

- 実行時に対応する project extension（`.agentdev/extensions/commands/<command>.yaml`）を読み込む
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して無視し、標準動作で続行する

実行時に読むべき docs 文書への参照は command extension（`.agentdev/extensions/commands/<command>.yaml`）の `context` へ移す。command 本文に直接の docs パスを記述しない。

command extension はフロントマタ（`version: 1`, `kind: command-extension`, `id: /agentdev/<command>`）と、5セクション（`context`/`rules`/`checks`/`acceptance_gates`/`must_not`、各配列）を持つ。`context` entry は `{id, when?, paths?, purpose?}`、`rules`/`checks` entry は `{id, when?, skill?}`、`acceptance_gates`/`must_not` は説明文字列のリストである。schema 詳細は SPEC `../foundations/project-extensions.md` 参照。

## 手順セクション形式

`## 手順` 配下の Step 構造は以下の形式に従う。

| 項目 | 規約 | 禁止形式 |
|------|------|----------|
| Step 見出し | `### Step N: タイトル` | - |
| Step 番号開始値 | `1` から開始 | `0`（`Step 0`） |
| サブステップ | `Step N-M`（N は親 Step 番号、M は `1` から開始） | ゼロ起点（`Step N-0`） |
| 主手順表現 | `### Step N` 見出しによる構造化 | numbered list（`1.` `2.` ...）による主手順 |
| フェーズ見出し | `## 手順` 配下に配置しない | `## 手順` 内での別軸フェーズ見出しの混在 |
| 代替フロー内サブステップ | `**EN.**`（大文字英字 + 連番、ボールド段落プレフィックス）。後述「代替フロー内サブステップ表現」参照 | `### Step N` 見出しによる代替フロー構造化（主手順の Step 番号連番を乱すため禁止） |

## 代替フロー内サブステップ表現

command が単一の主手順（`### Step N`）に加えて、入力分岐等により切り替わる代替フロー（alternative flow）を持つ場合、主手順の `### Step N` 連番を維持したまま代替フローを記述するためのサブステップ表現として `**EN.**` lettered prefix 形式を許容する。

**形式**:

- `**E1.** タイトル: 本文`（代替フローのサブステップ（`E` + 連番、`1` から開始））
- `**E1a.** タイトル: 本文`（代替フローサブステップの細分（`E` + 連番 + 小文字英字））
- 主手順の `### Step N` 見出しとは独立した連番空間を持つ（`E1`, `E2`, ... は主手順 Step 番号と衝突しない）

**適用条件**:

- 代替フローが主手順の特定 Step（例: `Step 1`）から分岐し、主手順の別 Step（例: `Step 2` 以降）に合流する構造で、主手順 Step 番号の連番を維持したい場合に使用する
- 代替フローのサブステップは `### Step N` 見出しではなく、ボールド段落プレフィックス（`**EN.**`）で表現する。これにより主手順の Step 番号と代替フローの番号が別空間となり、Step 連番検査（非連番 Step 番号検出）に抵触しない

**代表例**: `case-close.md` の Epic Wave クローズフロー（`**E1.**` 〜 `**E6.**`、`**E6a.**` / `**E6b.**` 細分）。
`Step 1`（Issue番号解決）から Epic Issue 判定で分岐し、`Step 2`（単一 Issue クローズの前提確認）に合流する構造で使用する。

**注意**:

- `**EN.**` 形式は代替フロー専用であり、主手順の Step 表現として使用しない（主手順は `### Step N: タイトル` 見出しを必ず使用する）
- 後述「機械検査対象」で `**EN.**` 形式は違反として検出しない（主手順の Step 番号連番とは独立した番号空間のため）

## ガードレール番号

ガードレール番号は `G` + ゼロ埋め2桁（`G01`, `G02`, ..., `G99`）形式に統一する。

## 機械検査対象

`/repo/docs-check` が検出する機械判定可能な違反。

| 検出項目 | 対象 |
|----------|------|
| `Step 0` の使用 | `### Step 0` 見出し、または本文中の `Step 0` 参照 |
| 非連番 Step 番号 | `## 手順` 配下の Step 番号が連続していない（飛び番） |
| ゼロ起点サブステップ | `Step N-0` 形式のサブステップ |
| numbered list 主手順 | `## 手順` 直下の numbered list による手順記述 |
| `G01` 形式以外のガードレール番号 | `G` + ゼロ埋め2桁に一致しないガードレール識別子 |

> **非検出対象（許容形式）**: `**EN.**` lettered prefix（代替フロー内サブステップ表現）は主手順の Step 番号連番とは独立した番号空間を持つため、上記検出項目のいずれにも該当しない。
> `check_command_format.ts` は `### Step N` 見出しのみを Step 番号連番検査の対象とし、`**EN.**` ボールド段落プレフィックスを検出対象外とする（「代替フロー内サブステップ表現」参照）。

## command SPEC と command 定義の Step 番号一致（REQ-0143-004）

command SPEC（`docs/specs/commands/*.md`）が記述する Step 番号構成は、対応する command 定義ファイル（`src/opencode/commands/agentdev/*.md`）と一致すること（REQ-0143-004）。
同一フェーズを指す Step 番号が SPEC と command 定義で異なる場合、読者は都度変換を強いられ、完了条件、テスト戦略、実装メモの照合で誤読が生じる。
本節は Step 0 扱いと採番開始位置の規則を確定し、変換負荷を除去する。

- **採番開始位置**: Step 番号は `1` から開始する（「手順セクション形式」表参照）。`Step 0` は使用しない
- **SPEC 側優先**: SPEC と command 定義で Step 番号構成がずれる場合、SPEC 側を command 定義へ合わせる。command 定義が正とするのは、command 定義が実行時配布対象の正本であり、SPEC は現状記述であるためである
- **サブステップ採番**: `Step N-M` の M は `1` から開始する（`Step N-0` は使用しない）。QG ゲート、事前検証等の「先行サブステップ」も `N-1` 以降の番号を採番すること
- **独立フェーズの Step 0 扱い**: 従来 `Step 0` として独立番号を与えられていたフェーズ（例: セッションコンテキスト検知、フェーズ判定、実行前同期、引き継ぎ停止判定）は、command 定義の Step 1（または後続 Step）に統合し、独立した `Step 0` としては扱わない

**適用対象**: `docs/specs/commands/*.md` のうち、Step 番号構成を記述する command SPEC（`_template.md` を含む）。Step 番号を持たない command SPEC（読み取り専用、分類系の `inspect-skills.md`、`inspect-promote.md`、`inspect-extensions.md` 等で `### Step N` 見出しを使用しない SPEC）は適用対象外とする（REQ-0143-004）。これらの SPEC は対応する command 定義ファイルと比較すべき Step 番号構成を持たないため、一致検証の対象とならない。

**検証**: 各 command/SPEC ペアについて、SPEC の Step 番号と command 定義の Step 番号が同一フェーズで一致することを確認する。ただし SPEC が Step 番号を記述しない場合は検証対象外とする。
ずれを検出した場合、SPEC 側を command 定義へ一致させる。

## 他 SPEC との関係

- **`patterns.md`**: frontmatter 規約、テンプレート命名規則を担当。本 SPEC は command 本文構造を担当し、frontmatter 規約は `patterns.md` を参照する。
- **`docs/specs/commands/*.md`**: 個別 command SPEC の位置づけを維持する。横断フォーマット規約は本 SPEC に集約し、個別 command SPEC には配置しない。各 command SPEC は本 SPEC の「command SPEC と command 定義の Step 番号一致（REQ-0143-004）」節に従い、対応する command 定義ファイル（`src/opencode/commands/agentdev/*.md`）と Step 番号構成を一致させる。
- **[REQ-0143](../../requirements/REQ-0143.md)**: command 定義ファイルフォーマット標準化の要件定義。REQ-0143-004 が SPEC↔command Step 一致原則を指示し、本 SPEC はその詳細（Step 0 扱い、採番開始位置）を配置する。
