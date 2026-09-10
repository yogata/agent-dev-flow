---
name: agentdev-decision-file-manager
description: Manages Decision numbering and decision record file operations (CREATE/APPEND/UPDATE). USE FOR: creating Decision files, appending sections, updating existing Decisions. DO NOT USE FOR: evaluating whether a Decision is needed, analyzing requirement quality, general document management.
---

# Decisionファイル管理

**意思決定記録（Decision）** ファイルの管理に関する**知識ベース**である。

- **このスキル（知識）**: Decision番号採番ルール、ファイル操作モード、判定基準、ステータス遷移、整合性チェック
- **適用先**: `req-save`（Decisionファイル保存時）、`case-open`（Issue作成時のDecision参照）、`case-run`（実行時のDecision参照）

**注意**: このスキルはDecisionの**管理、運用**（採番、ステータス遷移、整合性チェック）を担当する。
Decisionの**作成ガイドライン**（評価基準、Decision必要かどうかの判定）については、`agentdev-decision-guidelines` を参照。

---

## Decision要否判定の責務境界

本スキルはDecisionファイルの操作（作成、追記、更新）を責務とし、Decisionを作成すべきか否かの**意味的判定**は主責務としない。
Decision要否の判定は `agentdev-decision-guidelines` スキルが行う。
本スキルを使用する前に `agentdev-decision-guidelines` による判定が完了していることを前提とする。

## 入力

- 操作対象 Decision の有無、操作種別（CREATE/APPEND/UPDATE）、Decision本文、README.md

## 出力

- 作成/更新された `docs/decisions/<DEC-NNN>.md`、更新された `docs/decisions/README.md`

## 副作用

- `docs/decisions/` 配下の Decision ファイルと README.md を更新する
- REQ ファイル、Design ファイルは更新しない（各 file-manager の責務）

## 常に守る不変条件（採番と配置）

| 項目 | 規約 |
|---|---|
| フォーマット | `DEC-NNN`（3桁ゼロ埋め） |
| 採番方法 | `docs/decisions/` 配下の既存Decisionファイルから最大番号を特定し、+1 |
| 空き番号 | 再利用禁止（欠番があっても欠番を埋めない） |

- **欠番が存在しても、新規Decisionで欠番を埋めない。常に最大番号+1で採番する**
- req-save が Decision ファイルを保存する際、本採番ルールに従うことを必須とする。req-define 側で番号推測を行わず、req-save と本スキルの連携で確定する
- 新規作成時の初期ステータスは `proposed`（`未指定 → accepted` は禁止）

### 基準番号帯例外

Decision体系の全面改定時は、`DEC-NNN` 以降の番号帯を基準番号帯として一括採番できる（最大番号+1の通常採番を上書きし、基準番号帯の最小番号から連番）。
適用条件は全面改定が例外要件を満たしていること。
基準番号帯採番は一度のみ実行され、以降の新規Decisionは通常採番に戻る。

## ファイル操作モード

| モード | 条件 | 操作 | frontmatter |
|---|---|---|---|
| CREATE | 該当するDecisionファイルが存在しない | テンプレート適用で新規作成、`docs/decisions/README.md` インデックスへ追加 | 初期 `proposed`、採番は最大番号+1 |
| APPEND | 既存Decisionに新規セクションを追加（補足説明、参照、学び） | 既存Decisionへセクション追記 | `updated` を現在日時に更新 |
| UPDATE | 既存Decisionの特定セクションを修正（ステータス変更、内容修正） | 該当セクション更新 | `updated` を現在日時に更新 |

- accepted後のUPDATEは非セマンティックな軽微な誤字修正のみ。意味的変更は新規Decision作成による置き換えが必須
- accepted 遷移時は「## 承認記録」セクションを本文末尾へ追記する。形式（日付・遷移・承認根拠）の
  正規所有は patterns.md Design「承認記録セクション形式」。本追記は UPDATE 操作の標準手順に含める

## related_reqs フィールド管理

- **CREATE 時**: req-save が要件doc（draft-data）の該当 Decision 対象操作で確定した関連 REQ を
  frontmatter `related_reqs` へ決定的に保存する（初期保存手順は `agentdev-req-file-manager` の
  req-save-procedure reference、フィールド規約の正本は patterns.md Design）
- **UPDATE 時**: 関連 REQ の変更（要件再構成、Decision の置換・再確認）を `related_reqs` フィールド更新
  として扱う。status 遷移とは独立に更新できる
- **検証**: REQ 識別子形式（`REQ-{NNNN}`）、実在 REQ の指先確認（`docs/requirements/` または
  `docs/requirements/retired/` に実在すること）、空宣言（`related_reqs: []`、関連なしの正規状態）と
  未宣言（フィールド欠落、正規状態ではなく機械検出対象）の区別
- 本フィールドは Decision 成果物のローカルメタデータであり、TIM の ADF-COVERS 宣言・covers 関係とは
  独立に管理される。agentdev-traceability は本フィールドを消費しない
- `docs/decisions/README.md` 関連REQ表は本フィールドから自動生成される（混合領域構成。
  「説明」列のみ人手管理）。整合検査は docs-check の索引整合 checker が担う

## ファイル配置規約

```
docs/decisions/
├── README.md          # Decisionインデックス
└── DEC-NNN.md
```

各Decisionファイルのfrontmatter:

```yaml
---
id: DEC-NNN
title: 意思決定タイトル
status: proposed | accepted | deprecated | superseded
superseded_by: DEC-MMM  # status: superseded の場合のみ
related_reqs: [REQ-NNNN, ...]  # 関連 REQ が存在しない場合は []（空宣言）。未宣言（フィールド欠落）は正規状態ではない
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

**README.md の役割**: 全Decisionの一覧表示、分類ビュー（Status View/ Topic View/ Decision Map/ Related REQ）、Decision間の相互参照マップ。
**README.md は分類ビューであり、Decision本文の唯一の情報源（SSoT）ではない**。

## ステータス遷移（許容/禁止）

許容: `proposed → accepted`、`accepted → deprecated`、`accepted → superseded`（`superseded_by` 追加）、`proposed → deprecated`

禁止: `accepted → proposed`、`deprecated → *`、`superseded → *`、`未指定 → accepted`

`accepted` status の Decision のみ現行根拠として使用する。
`proposed`/`deprecated`/`superseded` を現行要件判断の根拠として引用しない。

過去の判断を現行基盤から外すだけの場合（削除、廃止、移行、統合、再構築、完全削除）は、新規Decisionを作成せず対象Decisionのstatus遷移（retire/supersede）で処理する。
新規Decisionは「あるべき状態」の意思決定が存在する場合のみ作成する。

## 主要な判断順序

1. Decision要否は `agentdev-decision-guidelines` の判定完了を前提とする
2. 操作対象 Decision ファイルの有無で CREATE / 既存操作を判定
3. 既存操作は「セクション追加（APPEND）」か「内容修正・ステータス変更（UPDATE）」かを判定
4. 採番（CREATE のみ、最大番号+1、欠番埋め禁止）
5. frontmatter バリデーション、status 遷移妥当性、`superseded_by` 存在確認
6. README.md の分類ビューを Decision 変更と同一変更で更新、整合性検証

## reference選択表

通常経路で全 reference を無条件読込しない。
必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| frontmatter 必須フィールド検証、ID/ファイル名一致確認、日付フォーマット検証、ステータス値バリデーション、ステータス遷移ルール詳細、ステータス遷移の意図、retire/supersede 基準が必要な場合 | [references/validation-and-consistency.md](references/validation-and-consistency.md) |
| 整合性チェック（README ↔ Decision、Decision ↔ Decision、REQ ↔ Decision、Issue ↔ Decision）、README 分類ビューの運用、ステータス変更時の README 整合性検証が必要な場合 | [references/validation-and-consistency.md](references/validation-and-consistency.md) |
| APPEND/UPDATE 判定フロー、APPEND条件、UPDATE条件、accepted Decision 直接編集チェックリスト（事前/事後確認、非意味修正6件、直接編集と操作の判定）が必要な場合 | [references/validation-and-consistency.md](references/validation-and-consistency.md) |

## 所有 template の入口

Decisionテンプレート: @.opencode/skills/`agentdev-decision-file-manager`/templates/doc_decision.md

**テンプレートの構成**:
- Context（背景、文脈）
- Decision（決定内容）
- Consequences（影響、結果）
- Status（ステータス）
- Related Decisions（関連Decision）

## Scripts（決定的処理）

Decision 番号採番は決定的スクリプトで実行する（artifact-contracts Design「Script 所有権と委譲契約」、OU-{NNN} 移行）。

| スクリプト | 役割 | 入力 | 出力 JSON |
|-----------|------|------|-----------|
| `alloc-decision-number.ts` | Decision番号採番（max+1、欠番埋め禁止） | argv[2]=Decision dir | `{ ok, allocated: "DEC-NNN", max }` |

実行方法:

```bash
bun .opencode/skills/agentdev-decision-file-manager/scripts/src/alloc-decision-number.ts docs/decisions
```

本スクリプトは self-contained であり、兄弟 skill の lib を直接参照しない（artifact-contracts Design「Script 所有権と委譲契約」準拠）。

## See Also

- **agentdev-decision-guidelines**: Decision作成の必要性判定基準、ライフサイクル定義
- **agentdev-req-analysis**: 要件分析におけるDecision閾値判定ブリッジ
- **agentdev-req-file-manager**: REQファイル管理（Decision ↔ REQ整合性チェック）
