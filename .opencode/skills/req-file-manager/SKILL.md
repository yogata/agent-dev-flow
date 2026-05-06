---
name: req-file-manager
description: REQ番号採番・要件ファイル操作（CREATE/APPEND/UPDATE）の知識ベース。issue-reqおよびissue-updateから参照される。
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
| 空き番号 | 再利用禁止（欠番があても欠番を埋めない） |
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

各REQファイルのfrontmatter:

```yaml
---
id: REQ-{NNNN}
title: 要件タイトル
classification: feature | bug
category: 機能カテゴリ
status: draft | active | completed
issue: {Issue番号}
adr: {ADR番号}（該当する場合）
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [タグ1, タグ2]
---
```

---

## テンプレート参照

要件定義テンプレートは以下のパスで参照可能:

@.opencode/commands/issue/templates/doc_requirement.md
