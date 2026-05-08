---
name: req-file-manager
description: Manages REQ numbering and requirement file operations (CREATE/APPEND/UPDATE). Use when creating requirement files, appending sections, or updating existing requirements.
---

# REQファイル管理

このスキルは要件ファイル（REQ）の管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: REQ番号採番ルール、ファイル操作モード、判定基準
- **適用先**: `issue-req`（要件定義時）、`issue-update`（要件更新時）

---

## 概要

REQファイルの作成・追記・更新を管理する。各操作は宣言的に定義され、エージェントがコンテキストに応じて適切なモードを選択する。

---

## REQ番号採番ルール

| 項目 | 規約 |
|------|------|
| フォーマット | `REQ-{NNNN}`（4桁ゼロ埋め） |
| 採番方法 | `docs/requirements/` 配下の既存REQファイルから最大番号を特定し、+1 |
| 空き番号 | 再利用禁止（欠番があっても欠番を埋めない） |
| 例 | REQ-0035の次 → REQ-0036 |

---

## ファイル操作モード

### CREATE（新規要件）

| 項目 | 内容 |
|------|------|
| 条件 | 該当するREQファイルが存在しない場合 |
| 操作 | テンプレートを適用して新規ファイル作成 |
| 採番 | 最大REQ番号+1で採番 |
| パス | `docs/requirements/REQ-{NNNN}.md` |
| README | `docs/requirements/README.md` のインデックスに新規REQを追加 |

### APPEND（既存要件への追加）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のREQファイルに新しい要件セクションを追加する場合 |
| 操作 | 既存REQファイルにセクション追記 |
| frontmatter | `updated` フィールドを現在日時に更新 |

### UPDATE（既存要件の修正）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のREQファイルの特定セクションを修正する場合 |
| 操作 | 該当セクションの内容を更新 |
| frontmatter | `updated` フィールドを現在日時に更新 |

---

## 判定基準

| 状況 | モード |
|------|--------|
| 全く新しい要件（対応REQなし） | CREATE |
| 既存Issueに追加要件（REQファイルあり・セクション追加） | APPEND |
| 既存Issueの要件修正（REQファイルあり・内容変更） | UPDATE |

---

## ファイル配置規約

```
docs/requirements/
├── README.md          # REQインデックス
├── REQ-0001.md
├── REQ-0002.md
└── REQ-{NNNN}.md
```

**パターンA除外**: パターンA（バグ修正・軽微変更）ではREQファイルを作成しない。Issue本文のみで要件を管理する。REQファイルの修正が必要なバグ修正は、パターンB（機能追加）に昇格して扱う。

各REQファイルのfrontmatter:

```yaml
---
id: REQ-{NNNN}
title: 要件タイトル
status: planned | in-progress | implemented | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [タグ1, タグ2]
---
```

---

## バリデーションルール

### frontmatter必須フィールド

| フィールド | 型 | 許容値 |
|-----------|-----|--------|
| id | string | `REQ-{NNNN}`（4桁ゼロ埋め） |
| title | string | 空文字不可 |
| status | enum | `planned` \| `in-progress` \| `implemented` \| `deprecated` |
| created | date | `YYYY-MM-DD` |
| updated | date | `YYYY-MM-DD` |
| tags | array | 自由形式タグ（分類・カテゴリを統合） |

### IDとファイル名の一致確認

- `REQ-0001.md` → frontmatter `id: REQ-0001`（必須）
- 不一致の場合はエラーとして扱う

### 日付フォーマット検証

- `created` / `updated` は `YYYY-MM-DD` 形式であること
- `updated` ≥ `created` であること

---

## ステータス遷移ルール

### 許容遷移

```
planned → in-progress
in-progress → implemented
implemented → deprecated
planned → deprecated
```

### 禁止遷移

| 遷移 | 理由 |
|------|------|
| implemented → planned | 完了要件の再利用は禁止（新規REQを作成） |
| implemented → in-progress | 完了要件の差し戻しは禁止 |
| deprecated → * | 廃止済みは遷移不可 |

### 初期値制約

- 新規作成時は `planned` または `in-progress` に設定
- `未指定 → implemented` は禁止（必ず planned または in-progress を経由）

### ステータス正規化マッピング

外部入力（Issue等）のステータスをREQステータスに正規化:

| 入力 | 正規化先 |
|------|---------|
| open | planned |
| done | implemented |
| analyzed | planned |
| created | planned |

---

## 整合性チェック

### Issue ↔ REQ

- REQファイルはIssueから一方向参照（Issue本文にREQ番号を記載）。REQファイルからIssueへの逆参照は行わない
- REQファイルが存在するが対応Issueが閉じている場合、status を `implemented` に更新すべきか判定

### ADR ↔ REQ

- ADRが必要な要件は、REQ本文の「関連情報」セクションにADR番号を記載する
- ADRが存在しない場合、ADR作成を推奨（要件がアーキテクチャ判断を含む場合）

### README.md ↔ REQ

- `docs/requirements/README.md` のインデックスに全REQが記載されているか確認
- インデックスに記載されているがファイルが存在しないREQを検出
- ファイルが存在するがインデックスに未記載のREQを検出

---

## 関連情報管理

REQ間の関連・依存はREQ本文の「関連情報」セクションに記載する（frontmatterフィールドは使用しない）。

### 記載方法

- **置き換え**: 旧REQを新REQに包括的に置き換える場合に記載
- **関連**: 独立要件だが変更が競合する可能性がある場合に記載

---

## APPEND/UPDATE判定基準

### 判定フロー

```
操作対象は既存REQファイルか？
  ├── NO → CREATE
  └── YES → 既存セクションの「内容」を変更するか？
              ├── NO（新規セクション・チェックボックス追加） → APPEND
              └── YES（テキスト置換・ステータス変更・フィールド更新） → UPDATE
```

### APPEND条件

- 既存セクションへの内容追加（サブアイテム・メモの追記）
- 新規セクションの追加（チェックボックス追加、非機能要件セクション追加等）
- 新規タグ・関連情報の追加

### UPDATE条件

- 既存セクションの内容修正（テキスト置換・表現変更）
- frontmatter フィールドの変更（status変更、title変更等）
- チェックボックスの ON/OFF 切り替え

---

## テンプレート参照

要件定義テンプレートは以下のパスで参照可能:

@.opencode/commands/issue/templates/doc_requirement.md

---

## See Also

- **req-analysis**: 要件分析手法（機能/非機能要件の展開観点、壁打ちメソッドロジー）
- **adr-file-manager**: ADRファイル管理（REQ ↔ ADR整合性チェック）
- **adr-guidelines**: ADR作成の必要性判定基準
- **deviation-check**: 乖離検出（影響REQ番号の特定）
