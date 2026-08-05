---
name: agentdev-adr-file-manager
description: Manages ADR numbering and architecture decision record file operations (CREATE/APPEND/UPDATE). USE FOR: creating ADR files, appending sections, or updating existing ADRs. DO NOT USE FOR: evaluating whether an ADR is needed, analyzing requirement quality, or general document management.
---

# ADRファイル管理

アーキテクチャ意思決定記録（ADR: Architecture Decision Record）ファイルの管理に関する**知識ベース**。

- **このスキル（知識）**: ADR番号採番ルール、ファイル操作モード、判定基準、ステータス遷移、整合性チェック
- **適用先**: `req-save`（ADRファイル保存時）、`case-open`（Issue作成時のADR参照）、`case-run`（実行時のADR参照）

**注意**: このスキルはADRの**管理、運用**（採番、ステータス遷移、整合性チェック）を担当する。ADRの**作成ガイドライン**（評価基準、ADR必要かどうかの判定）については、`agentdev-adr-guidelines` を参照。

---

## 原本（SSoT）

本スキルの原本仕様は `agentdev-adr-file-manager` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## ADR要否判定の責務境界

本スキルはADRファイルの操作（作成、追記、更新）を責務とし、ADRを作成すべきか否かの**意味的判定**は主責務としない。
ADR要否の判定は `agentdev-adr-guidelines` スキルが行う。
本スキルを使用する前に `agentdev-adr-guidelines` による判定が完了していることを前提とする。

## 入力

- 操作対象 ADR の有無、操作種別（CREATE/APPEND/UPDATE）、ADR本文、README.md

## 出力

- 作成/更新された `docs/adr/ADR-{NNNN}.md`、更新された `docs/adr/README.md`

## 副作用

- `docs/adr/` 配下の ADR ファイルと README.md を更新する
- REQ ファイル、SPEC ファイルは更新しない（各 file-manager の責務）

## 常に守る不変条件（採番と配置）

| 項目 | 規約 |
|---|---|
| フォーマット | `ADR-{NNNN}`（4桁ゼロ埋め） |
| 採番方法 | `docs/adr/` 配下の既存ADRファイルから最大番号を特定し、+1 |
| 空き番号 | 再利用禁止（欠番があっても欠番を埋めない） |

- **欠番が存在しても、新規ADRで欠番を埋めない。常に最大番号+1で採番する**
- req-save が ADR ファイルを保存する際、本採番ルールに従うことを必須とする。req-define 側で番号推測を行わず、req-save と本スキルの連携で確定する
- 新規作成時の初期ステータスは `proposed`（`未指定 → accepted` は禁止）

#### 基準番号帯例外

ADR体系の全面改定時は、`ADR-NNNN` 以降の番号帯を基準番号帯として一括採番できる（最大番号+1の通常採番を上書きし、基準番号帯の最小番号から連番）。適用条件は全面改定が例外要件を満たしていること。基準番号帯採番は一度のみ実行され、以降の新規ADRは通常採番に戻る。

## ファイル操作モード

| モード | 条件 | 操作 | frontmatter |
|---|---|---|---|
| CREATE | 該当するADRファイルが存在しない | テンプレート適用で新規作成、`docs/adr/README.md` インデックスへ追加 | 初期 `proposed`、採番は最大番号+1 |
| APPEND | 既存ADRに新規セクションを追加（補足説明、参照、学び） | 既存ADRへセクション追記 | `updated` を現在日時に更新 |
| UPDATE | 既存ADRの特定セクションを修正（ステータス変更、内容修正） | 該当セクション更新 | `updated` を現在日時に更新 |

- accepted後のUPDATEは非セマンティックな軽微な誤字修正のみ。意味的変更は新規ADR作成による置き換えが必須

## ファイル配置規約

```
docs/adr/
├── README.md          # ADRインデックス
└── ADR-{NNNN}.md
```

各ADRファイルのfrontmatter:

```yaml
---
id: ADR-{NNNN}
title: 意思決定タイトル
status: proposed | accepted | deprecated | superseded
superseded_by: ADR-MMMM  # status: superseded の場合のみ
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

**README.md の役割**: 全ADRの一覧表示、分類ビュー（Status View/ Topic View/ Decision Map/ Related REQ）、ADR間の相互参照マップ。**README.md は分類ビューであり、ADR本文の唯一の情報源（SSoT）ではない**。

## ステータス遷移（許容/禁止）

許容: `proposed → accepted`、`accepted → deprecated`、`accepted → superseded`（`superseded_by` 追加）、`proposed → deprecated`

禁止: `accepted → proposed`、`deprecated → *`、`superseded → *`、`未指定 → accepted`

`accepted` status の ADR のみ現行根拠として使用する。`proposed`/`deprecated`/`superseded` を現行要件判断の根拠として引用しない。

過去の判断を現行基盤から外すだけの場合（削除、廃止、移行、統合、再構築、完全削除）は、新規ADRを作成せず対象ADRのstatus遷移（retire/supersede）で処理する。新規ADRは「あるべき状態」の意思決定が存在する場合のみ作成する。

## 主要な判断順序

1. ADR要否は `agentdev-adr-guidelines` の判定完了を前提とする
2. 操作対象 ADR ファイルの有無で CREATE / 既存操作を判定
3. 既存操作は「セクション追加（APPEND）」か「内容修正・ステータス変更（UPDATE）」かを判定
4. 採番（CREATE のみ、最大番号+1、欠番埋め禁止）
5. frontmatter バリデーション、status 遷移妥当性、`superseded_by` 存在確認
6. README.md の分類ビューを ADR 変更と同一変更で更新、整合性検証

## reference選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| frontmatter 必須フィールド検証、ID/ファイル名一致確認、日付フォーマット検証、ステータス値バリデーション、ステータス遷移ルール詳細、ステータス遷移の意図、retire/supersede 基準が必要な場合 | [references/validation-and-consistency.md](references/validation-and-consistency.md) |
| 整合性チェック（README ↔ ADR、ADR ↔ ADR、REQ ↔ ADR、Issue ↔ ADR）、README 分類ビューの運用、ステータス変更時の README 整合性検証が必要な場合 | [references/validation-and-consistency.md](references/validation-and-consistency.md) |
| APPEND/UPDATE 判定フロー、APPEND条件、UPDATE条件、accepted ADR 直接編集チェックリスト（事前/事後確認、非意味修正6件、直接編集と操作の判定）が必要な場合 | [references/validation-and-consistency.md](references/validation-and-consistency.md) |

## 所有 template の入口

ADRテンプレート: @.opencode/skills/`agentdev-adr-file-manager`/templates/doc_adr.md

**テンプレートの構成**:
- Context（背景、文脈）
- Decision（決定内容）
- Consequences（影響、結果）
- Status（ステータス）
- Related Decisions（関連ADR）

## See Also

- **agentdev-adr-guidelines**: ADR作成の必要性判定基準、ライフサイクル定義
- **agentdev-req-analysis**: 要件分析におけるADR閾値判定ブリッジ
- **agentdev-req-file-manager**: REQファイル管理（ADR ↔ REQ整合性チェック）
- **agentdev-doc-writing**: ADR/REQ/SPEC横断の文書品質査読ゲート（文書種別責務、要件性、文意品質、粒度）
