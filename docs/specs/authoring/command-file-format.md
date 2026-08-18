---
title: "コマンドファイルフォーマット規約"
status: accepted
created: 2026-06-22
updated: 2026-08-18
spec_logical_division: cross_cutting_contract
canonical_owner: command-file-format
---

# コマンドファイルフォーマット規約

AgentDevFlow が管理する command 定義ファイルの Markdown 構成標準。
本 SPEC は command 定義ファイルが従うべき詳細なフォーマット規約を定義する。

> **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（REQ-001）。

> **authoring/ ドメインでの配置理由**: 本 SPEC は本文構造・見出し構成・Step 表現・記述形式という執筆規約系の内容を扱うため、共通文書モデル規約（frontmatter・ID 体系・命名規則・URL 参照形式）を扱う `../foundations/patterns.md` と責務分離して `authoring/` ドメインに配置する。
> `authoring/` は将来 REQ/SPEC/SKILL/guide 執筆規約の集約先として拡張余地を持つ（現状は command のみ）。
> 即時統合・`authoring/` の削除は行わない。

## 適用範囲

- **対象**: `src/opencode/commands/agentdev/*.md`（AgentDevFlow 配布 command 原本）、`.opencode/commands/repo/*.md`（repo-local command）
- **対象外**: AgentDevFlow 適用プロジェクト（consumer project）の独自 command

## Command 構造

Command は公開interface（入出力契約・ガードレール）と workflow dispatch を中心とする
（DEC-010）。
workflow 手順本体は Workflow Skill へ移行し、Command に重複残存しない。
workflow への参照は Workflow Skill 名レベルとする（REQ-002-017）。

## extensions 手順

command 本文は extensions 手順（SPEC `../foundations/project-extensions.md`）のみを持ち、具体的な project docs 内部パスを固定しない。

各 command は以下の共通記述を本文に持つ。
extension は5セクション（`context`/`rules`/`checks`/`acceptance_gates`/`must_not`）を持ち、標準動作に追加・拡張される（上書きではない）。

- 実行時に対応する project extension を読み込む。Workflow Skill は .agentdev/extensions/skills/{workflow-skill-name}.yaml（kind: workflow-extension）、Capability Skill は .agentdev/extensions/skills/{capability-skill-name}.yaml（kind: capability-skill-extension）を対象とする（詳細は SPEC `../foundations/project-extensions.md` 参照）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して無視し、標準動作で続行する（REQ-002-031 準拠、fail-open）

実行時に読むべき docs 文書への参照は Workflow Skill extension の `context` へ移す。
command 本文に直接の docs パスを記述しない。

extension はフロントマタ（`version: 1`, `kind:`（公式3値: workflow-extension / internal-workflow-extension / capability-skill-extension）, `id:`）と、5セクションを持つ。
schema 詳細は SPEC `../foundations/project-extensions.md` 参照。
旧 kind（command-extension / skill-extension）は廃止済みであり、検出時は migration-required として停止する。

## 手順セクション形式

手順セクションは `### Step N` 見出しの逐次列挙に代え、各工程を前提条件・出力契約・検証基準の表形式（前得出出力検証表）で記述する。
推奨順は表または順序ラベルで保持する。Workflow Skill 側の STEP resume point（references/）はこの限りではない。

## ガードレール番号

ガードレール番号は `G` + ゼロ埋め2桁（`G01`, `G02`, ..., `G99`）形式に統一する。
G 番号は硬い境界（課金・認証・破壊的操作、state 破壊等の否定規則）に限定して付番する。
工程上の選好は肯定形の不変条件として本文へ集約し、G 番号を付さない。
変換時は変換対照表（変換前 G 番号から変換後所在）を成果物として保持する。

## 機械検査対象

`/repo/docs-check` が検出する機械判定可能な違反。

- description 文字数: 単体 600 超過と OpenCode 仕様 1024 超過は検証不通過、合計 平均 350×N 超過は warn（N は実ファイル数から算出）
- description 内マーカー語（`soft guard`、`直接起動`）と内部 ID の検出（検証不通過）
- description と本文の USE FOR 二重保持の検出（検証不通過）
- 全 Workflow Skill description への簡潔トリガー項（単独起動 + /agentdev/* コマンド経由）存在の肯定検証（欠落時検証不通過）
- 300 行超 references ファイルの目次存在検出（欠落時検証不通過）
- 従来の Step 0 検出・非連番検出・numbered list 主手順検出は前出出力検証表様式への移行に合わせて更新または廃止する

### thin Command モデル検査（公開 /agentdev/* Command 対象）

公開 `/agentdev/*` Command について以下を検査対象に追加する。
`/repo/*` Command は従来検査を維持し、公開 `/agentdev/*` Command と checker 上で区別する。

| 検出項目 | 対象 |
|----------|------|
| Workflow Skill dispatch 不存在 | 公開 Command が Workflow Skill への dispatch を持たない |
| workflow 手順本体の重複残存 | Command 本文に Workflow Skill が所有すべき workflow 手順が機械判定可能な形で残存する |
| Capability Skill 内部 reference 直接依存 | Command 本文から Skill の references/* 等の内部パスへの直接参照 |

意味的重複（soft contract 判断）は `/agentdev/inspect-skills` が所有する。
機械検査は構造的に判定可能な項目のみを対象とする。

> **非検出対象（許容形式）**: `**EN.**` lettered prefix（代替フロー内サブステップ表現）は主手順の Step 番号連番とは独立した番号空間を持つため、上記検出項目のいずれにも該当しない。

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
- 本形式の採用は `/repo/*`（repo-local コマンド）限定とする。公開 `/agentdev/*` コマンドでは主手順の手順列挙を `### Step N` 形式で表現する前提のため、`**EN.**` lettered prefix 形式を使用しない

## 順序ラベル様式（サブステップ識別子・工程一覧表ラベル・工程参照形式）

工程・サブステップ識別子の様式規約を次のとおり正規契約化する（PR #2153 による16 Skill 横断の運用統一、merge fb0a5ac5、を正規化する）。

### サブステップ階層形式

- サブステップは `STEP-N-M` 形式、細分サブステップは `STEP-N-M-K` 形式とする（例: `STEP-3-1`、`STEP-3-1-1`）
- 副番号（M、K）は 1 起点とする。ゼロ起点（例: `E4-0`）は使用しない。既存のゼロ起点表記は規約確定後に振り直し要否を個別判断する

### STEP model 対象外型 SKILL.md の工程一覧表ラベル

- STEP model 対象外型（capture-only 型、read-only-diagnostic 型等）の SKILL.md で工程順序を示す場合も、工程一覧表のラベルは順序を表す一貫した様式（`STEP-N` または同等の連番形式）で示す。様式を持たない絵日的な列挙は行わない

### 成果物間の工程ラベル参照形式

- Workflow Skill から command の公開ラベルを参照する際は command 名で修飾する（例: 「req-save command STEP-4」）。command 名なしの裸参照はしない
- Capability Skill・SPEC から Workflow Skill の工程を参照する際は実番号（例: `STEP-S5`）を用いる。相対表現（「第5工程」等）は使用しない
- 旧 command 番号（`Step N`）形式での参照は新規に書かない。既存参照は AG-023 是正の対象とする

## command SPEC と command 定義の対応付け

command SPEC は command 定義ファイルの Step 番号を複製しない。

command SPEC と command 定義は、公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止状態、必須順序、利用する skill の責務で対応付ける。

Step 番号は command 定義の内部構造であり、SPEC の公開契約に含めない。

**対応付けの軸**:

- **公開目的**: command が解決するユーザー関心、入力、成果物
- **許可される副作用**: command 実行時に許可されるファイル作成、更新、外部 API 呼出
- **安全境界**: command が越えてはならない責務範囲（G02 等のファイル操作制約）
- **承認境界**: ユーザー確認を要する判断、停止条件
- **停止状態**: 異常時、未解決時、ユーザー判断待ちの状態
- **必須順序**: 成果物、安全性、外部契約へ影響する順序（順序を変えると成果物または安全性が変わるもののみ）
- **利用 skill 責務**: command が利用する skill 名と委譲する責務

**適用対象**: `docs/specs/commands/*.md` の全 command SPEC（`_template.md` を含む）。

読み取り専用または分類系で Step を持たない command SPEC は、Step による対応付けの対象外であることを当該 SPEC に明記する。

**検証**: 各 command/SPEC ペアについて、SPEC が公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止状態、必須順序、利用 skill 責務の各軸で command 定義と整合することを確認する。
Step 番号の不一致は違反として扱わず、公開契約の欠落、相互矛盾を違反として扱う。

## 他 SPEC との関係

- **`patterns.md`**: frontmatter 規約、テンプレート命名規則を担当。本 SPEC は command 本文構造を担当し、frontmatter 規約は `patterns.md` を参照する。
- **`docs/specs/commands/*.md`**: 個別 command SPEC の位置づけを維持する。横断フォーマット規約は本 SPEC に集約し、個別 command SPEC は公開契約の各対応付け軸を定義する。
