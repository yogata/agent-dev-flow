---
name: adr-file-manager
description: Manages ADR numbering and architecture decision record file operations (CREATE/APPEND/UPDATE). Use when creating ADR files, appending sections, or updating existing ADRs.
---

# ADRファイル管理

このスキルはアーキテクチャ意思決定記録（ADR: Architecture Decision Record）ファイルの管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: ADR番号採番ルール、ファイル操作モード、判定基準、ステータス遷移、整合性チェック
- **適用先**: `issue-work`（ADR作成時）、`issue-update`（ADR更新時）

**注意**: このスキルはADRの**管理・運用**（採番、ステータス遷移、整合性チェック）を担当する。ADRの**作成ガイドライン**（評価基準、ADR必要かどうかの判定）は `adr-guidelines` スキルの責務である。

---

## 概要

ADRファイルの作成・追記・更新を管理する。各操作は宣言的に定義され、エージェントがコンテキストに応じて適切なモードを選択する。

ADRはアーキテクチャ上の重要な意思決定を記録し、後で参照できるようにするためのドキュメントである。ステータス管理（proposed/accepted/deprecated/superseded-by）とADR間の相互参照を通じて、意思決定の履歴を追跡する。

---

## ADR番号採番ルール

| 項目 | 規約 |
|------|------|
| フォーマット | `ADR-{NNNN}`（4桁ゼロ埋め） |
| 採番方法 | `docs/adr/` 配下の既存ADRファイルから最大番号を特定し、+1 |
| 空き番号 | 再利用禁止（欠番があっても欠番を埋めない） |
| 例 | ADR-0022の次 → ADR-0023 |

**注意**: 欠番（例: ADR-0011）が存在しても、新規ADRで欠番を埋めない。常に最大番号+1で採番する。

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
- 実装後の学び（Post-implementation Notes）を追記
- 関連するADRへの参照を追加

### UPDATE（既存ADRの修正）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のADRファイルの特定セクションを修正する場合 |
| 操作 | 該当セクションの内容を更新 |
| frontmatter | `updated` フィールドを現在日時に更新 |

**UPDATEの使用例**:
- ステータス変更（proposed → accepted）
- 決定内容の修正（accepted後の軽微な誤字修正のみ）

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
├── ADR-0001.md
├── ADR-0002.md
└── ADR-{NNNN}.md
```

各ADRファイルのfrontmatter:

```yaml
---
id: ADR-{NNNN}
title: 意思決定タイトル
status: proposed | accepted | deprecated | superseded-by:[ADR-MMMM]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

**README.md の役割**:
- 全ADRの一覧表示
- ステータス別の分類
- ADR間の相互参照マップ

---

## バリデーションルール

### frontmatter必須フィールド

| フィールド | 型 | 許容値 |
|-----------|-----|--------|
| id | string | `ADR-{NNNN}`（4桁ゼロ埋め） |
| title | string | 空文字不可 |
| status | enum | `proposed` \| `accepted` \| `deprecated` \| `superseded-by:[ADR-MMMM]` |
| created | date | `YYYY-MM-DD` |
| updated | date | `YYYY-MM-DD` |

### IDとファイル名の一致確認

- `ADR-0001.md` → frontmatter `id: ADR-0001`（必須）
- 不一致の場合はエラーとして扱う

### 日付フォーマット検証

- `created` / `updated` は `YYYY-MM-DD` 形式であること
- `updated` ≥ `created` であること

### ステータス値のバリデーション

- `superseded-by` の形式: `superseded-by:[ADR-MMMM]`（コロン区切りで後継ADR番号を指定）
- `superseded-by` に指定されたADR番号が存在することを確認

---

## ステータス遷移ルール

### 許容遷移

```
proposed → accepted
accepted → deprecated
accepted → superseded-by:[ADR-MMMM]
proposed → deprecated
```

### 禁止遷移

| 遷移 | 理由 |
|------|------|
| accepted → proposed | 合意済み決定の差し戻しは禁止（新規ADRを作成） |
| deprecated → * | 廃止済みは遷移不可 |
| superseded-by → * | 置き換え済みは遷移不可 |

### 初期値制約

- 新規作成時は `proposed` に設定
- `未指定 → accepted` は禁止（必ず proposed → accepted の遷移を経由）

### ステータス遷移の意図

- **proposed**: 検討中の決定事項。レビュー待ち。
- **accepted**: 正式に合意された決定。実装中または実装済み。
- **deprecated**: 廃止された決定。使用しない。
- **superseded-by**: 他のADRに置き換えられた決定。参照先を記載。

---

## 整合性チェック

### README ↔ ADR

- `docs/adr/README.md` のインデックスに全ADRが記載されているか確認
- インデックスに記載されているがファイルが存在しないADRを検出
- ファイルが存在するがインデックスに未記載のADRを検出

### ADR ↔ ADR

- `superseded-by` リンクの妥当性を確認
  - 後継ADRが存在すること
  - 循環参照がないこと（A → B → A）
- ADR本文内の参照（Related Decisions）の整合性を確認

### REQ ↔ ADR

- REQ本文の「関連情報」セクションに記載されたADR番号の存在確認
- ADRが存在しない場合、ADR作成を推奨（要件がアーキテクチャ判断を含む場合）
- ADRがREQを参照していない場合、関連性の再評価を推奨

### Issue ↔ ADR

- ADRファイルはIssueから一方向参照（Issue本文にADR番号を記載）
- ADRファイルからIssueへの逆参照は行わない

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

@.opencode/commands/issue/templates/doc_adr.md

**テンプレートの構成**:
- Context（背景・文脈）
- Decision（決定内容）
- Consequences（影響・結果）
- Status（ステータス）
- Related Decisions（関連ADR）
- Post-implementation Notes（実装後の学び）

---

## See Also

- **adr-guidelines**: ADR作成の必要性判定基準・ライフサイクル定義
- **req-analysis**: 要件分析におけるADR閾値判定ブリッジ
- **req-file-manager**: REQファイル管理（ADR ↔ REQ整合性チェック）
