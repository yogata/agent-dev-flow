---
name: agentdev-adr-file-manager
description: Manages ADR numbering and architecture decision record file operations (CREATE/APPEND/UPDATE). USE FOR: creating ADR files, appending sections, or updating existing ADRs. DO NOT USE FOR: evaluating whether an ADR is needed, analyzing requirement quality, or general document management.
---

# ADRファイル管理

このスキルはアーキテクチャ意思決定記録（ADR: Architecture Decision Record）ファイルの管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: ADR番号採番ルール、ファイル操作モード、判定基準、ステータス遷移、整合性チェック
- **適用先**: `req-save`（ADRファイル保存時）、`case-open`（Issue作成時のADR参照）、`case-run`（実行時のADR参照）

**注意**: このスキルはADRの**管理・運用**（採番、ステータス遷移、整合性チェック）を担当する。ADRの**作成ガイドライン**（評価基準、ADR必要かどうかの判定）については、See Also の `agentdev-adr-guidelines` を参照。

---

## 概要

ADRファイルの作成・追記・更新を管理する。各操作は宣言的に定義され、エージェントがコンテキストに応じて適切なモードを選択する。

ADRはアーキテクチャ上の重要な意思決定を記録し、後で参照できるようにするためのドキュメントである。ステータス管理（proposed/accepted/deprecated/superseded）とADR間の相互参照を通じて、意思決定の履歴を追跡する。

#### ADR要否判定の責務境界

本スキルはADRファイルの操作（作成・追記・更新）を責務とし、ADRを作成すべきか否かの**意味的判定**は主責務としない。ADR要否の判定は `agentdev-adr-guidelines` スキルが行う。本スキルを使用する前に `agentdev-adr-guidelines` による判定が完了していることを前提とする。

---

## ADR番号採番ルール

| 項目 | 規約 |
|------|------|
| フォーマット | `ADR-{NNNN}`（4桁ゼロ埋め） |
| 採番方法 | `docs/adr/` 配下の既存ADRファイルから最大番号を特定し、+1 |
| 空き番号 | 再利用禁止（欠番があっても欠番を埋めない） |
| 例 | ADR-NNNNの次 → ADR-NNNN+1 |

**注意**: 欠番が存在しても、新規ADRで欠番を埋めない。常に最大番号+1で採番する。

#### Baseline range 例外

ADR体系の全面改定時は、`ADR-NNNN` 以降の番号帯を baseline range として一括採番できる。この場合、最大番号+1の通常採番を上書きし、baseline range の最小番号から連番で採番する。

**適用条件**:
- ADRの全面改定が例外要件を満たしていること
- baseline range 採番は一度のみ実行され、以降の新規ADRは通常採番に戻る

**例**: baseline range により ADR-NNNN〜ADR-NNNN+K を一括採番。次の新規ADRは baseline range 最大番号+1 から通常採番。

---

## ファイル操作モード

### CREATE（新規ADR）

| 項目 | 内容 |
|------|------|
| 条件 | 該当するADRファイルが存在しない場合 |
| 操作 | テンプレートを適用して新規ファイル作成 |
| 採番 | 最大ADR番号+1で採番 |
| パス | `docs/adr/ADR-{NNNN}.md` |
| README | `docs/adr/README.md` のインデックスに新規ADRを追加 |
| 初期ステータス | `proposed` に設定 |

### APPEND（既存ADRへの追加）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のADRファイルに新しいセクションを追加する場合 |
| 操作 | 既存ADRファイルにセクション追記 |
| frontmatter | `updated` フィールドを現在日時に更新 |

**APPENDの使用例**:
- 決定内容の補足説明を追加
- 関連するADRへの参照を追加

### UPDATE（既存ADRの修正）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のADRファイルの特定セクションを修正する場合 |
| 操作 | 該当セクションの内容を更新 |
| frontmatter | `updated` フィールドを現在日時に更新 |

**UPDATEの使用例**:
- ステータス変更（proposed → accepted）
- 決定内容の修正（accepted後は非セマンティックな軽微な誤字修正のみ。意味的変更は新規ADR作成による置き換えが必須）

---

## 判定基準

| 状況 | モード |
|------|--------|
| 全く新しいADR（該当ファイルなし） | CREATE |
| 既存ADRに新規セクション追加（補足説明・学び・参照） | APPEND |
| 既存ADRのステータス変更・内容修正 | UPDATE |

---

## ファイル配置規約

```
docs/adr/
├── README.md          # ADRインデックス
├── ADR-0101.md
├── ADR-{NNNN}.md
└── retired/
    ├── ADR-0001.md
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

**README.md の役割**:
- 全ADRの一覧表示（ADR一覧テーブル）
- 分類ビュー（Status View / Topic View / Decision Map / Related REQ）による探索性向上
- ADR間の相互参照マップ
- **注意**: README.md は分類ビューであり、ADR本文のSSoTではない

---

## バリデーションルール

### frontmatter必須フィールド

| フィールド | 型 | 許容値 |
|-----------|-----|--------|
| id | string | `ADR-{NNNN}`（4桁ゼロ埋め） |
| title | string | 空文字不可 |
| status | enum | `proposed` \| `accepted` \| `deprecated` \| `superseded` |
| created | date | `YYYY-MM-DD` |
| updated | date | `YYYY-MM-DD` |

### IDとファイル名の一致確認

- `ADR-NNNN.md` → frontmatter `id: ADR-NNNN`（必須）
- 不一致の場合はエラーとして扱う

### 日付フォーマット検証

- `created` / `updated` は `YYYY-MM-DD` 形式であること
- `updated` ≥ `created` であること

### ステータス値のバリデーション

- `superseded` の場合、frontmatter に `superseded_by: ADR-MMMM` フィールドが存在することを確認
- `superseded_by` に指定されたADR番号が存在することを確認

---

## ステータス遷移ルール

### 許容遷移

```
proposed → accepted
accepted → deprecated
accepted → superseded（frontmatter に superseded_by を追加）
proposed → deprecated
```

### 禁止遷移

| 遷移 | 理由 |
|------|------|
| accepted → proposed | 合意済み決定の差し戻しは禁止（新規ADRを作成） |
| deprecated → * | 廃止済みは遷移不可 |
| superseded → * | 置き換え済みは遷移不可 |

### 初期値制約

- 新規作成時は `proposed` に設定
- `未指定 → accepted` は禁止（必ず proposed → accepted の遷移を経由）

### ステータス遷移の意図

- **proposed**: 検討中の決定事項。レビュー待ち。
- **accepted**: 正式に合意された決定。実装中または実装済み。
- **deprecated**: 廃止された決定。使用しない。
- **superseded**: 他のADRに置き換えられた決定。`superseded_by` フィールドに後継ADR番号を記載。`accepted` status の ADR のみ現行根拠として使用する。`proposed`/`deprecated`/`superseded` の ADR を現行要件判断の根拠として引用しない

---

## 整合性チェック

### README ↔ ADR

- `docs/adr/README.md` の Current Baseline View に `docs/adr/ADR-*.md` の全ADRが記載されているか確認
- `docs/adr/README.md` の Retired / Historical View に `docs/adr/retired/ADR-*.md` の全ADRが記載されているか確認
- Current View に記載されているがファイルが存在しないADRを検出
- ファイルが存在するが Current/Retired View いずれにも未記載のADRを検出
- Retired View と current ADR の番号重複がないことを確認

### ADR ↔ ADR

- `superseded_by` リンクの妥当性を確認
  - 後継ADRが存在すること
  - 循環参照がないこと（A → B → A）
- ADR本文内の参照（Related Decisions）の整合性を確認

### REQ ↔ ADR

- REQ本文の「関連情報」セクションに記載されたADR番号の存在確認
- ADRが存在しない場合、ADR作成を推奨（要件がアーキテクチャ判断を含む場合）
- ADRがREQを参照していない場合、関連性の再評価を推奨

### Issue ↔ ADR

- ADRファイルはIssueから一方向参照（Issue本文にADR番号を記載）
- ADRファイルからIssueへの逆参照は原則禁止する。ADRを実装履歴に引きずらせないため
- **例外**: ADR作成の経緯としてIssue番号を背景（Context）に記載することは許可する。ただし、ADR本文の決定内容が特定Issueの実装詳細に依存しないこと

### README 分類ビューの運用

`docs/adr/README.md` に以下の分類ビューを設ける:

- **Current Baseline View**: 現行baseline ADR（`docs/adr/ADR-*.md`）の基本情報テーブル（番号、タイトル、ステータス、作成日）
- **Retired / Historical View**: retired ADR（`docs/adr/retired/ADR-*.md`）のテーブル（番号、タイトル、retired時ステータス、引き継ぎ先）
- **Status View**: ステータス別の分類（proposed / accepted / superseded）
- **Topic View**: 対象領域別の分類
- **Decision Map**: ADR間の関係性（supersedes / relates-to）
- **Related REQ**: 各ADRが関連するREQ番号

**Related REQ / Decision Map の構成ルール**:
- REQ本文に記載された Related ADRs などの基準情報から構成する
- README.md の情報は分類ビューであり、ADR本文のSSoTではない
- ADR本文を更新した場合は README.md の該当箇所も更新する

**README.md の更新タイミング**:
- ADR CREATE 時: 全ビューに反映
- ADR UPDATE（ステータス変更）時: Status View を更新
- ADR APPEND（関連情報追加）時: Decision Map / Related REQ を更新

---

## APPEND/UPDATE判定基準

### 判定フロー

```
操作対象は既存ADRファイルか？
  ├── NO → CREATE
  └── YES → 既存セクションの「内容」を変更するか？
              ├── NO（新規セクション追加・補足説明） → APPEND
              └── YES（テキスト置換・ステータス変更・フィールド更新） → UPDATE
```

### APPEND条件

- 既存セクションへの内容追加（サブアイテム・メモの追記）
- 新規セクションの追加（Post-implementation Notes、追加の参照ADR等）

### UPDATE条件

- 既存セクションの内容修正（テキスト置換・表現変更）
- frontmatter フィールドの変更（status変更、title変更等）
- ステータス遷移（proposed → accepted など）

---

## テンプレート参照

ADRテンプレートは以下のパスで参照可能:

@.opencode/skills/agentdev-adr-file-manager/templates/doc_adr.md

**テンプレートの構成**:
- Context（背景・文脈）
- Decision（決定内容）
- Consequences（影響・結果）
- Status（ステータス）
- Related Decisions（関連ADR）

---

## See Also

- **agentdev-adr-guidelines**: ADR作成の必要性判定基準・ライフサイクル定義
- **agentdev-req-analysis**: 要件分析におけるADR閾値判定ブリッジ
- **agentdev-req-file-manager**: REQファイル管理（ADR ↔ REQ整合性チェック）
- **agentdev-no-ai-slop-writing**: 自然言語成果物の文章品質ゲート（AI-slop 検出・修正）
