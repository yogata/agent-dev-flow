---
name: req-file-manager
description: Manages REQ numbering and requirement file operations (CREATE/APPEND/UPDATE/SPLIT). USE FOR: creating requirement files, appending sections, splitting oversized files, or updating existing requirements. DO NOT USE FOR: analyzing requirement quality, creating ADR files, general document management, or requirement gathering.
---

# REQファイル管理

このスキルは要件ファイル（REQ）の管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: REQ番号採番ルール、ファイル操作モード、判定基準
- **適用先**: `issue-req`（要件定義時）、`issue-save-req`（REQ保存時）、`issue-create`（Issue作成時のREQ参照）、`issue-work`（実行時のREQ参照）、`issue-update`（要件更新時）、`issue-close`（完了時のREQ参照）

---

## 概要

REQファイルの作成・追記・更新・分割を管理する。各操作は宣言的に定義され、エージェントがコンテキストに応じて適切なモードを選択する。

---

## REQ番号採番ルール

| 項目 | 規約 |
|------|------|
| フォーマット | `REQ-{NNNN}`（4桁ゼロ埋め） |
| 採番方法 | `docs/requirements/` 配下の既存REQファイルから最大番号を特定し、+1 |
| 空き番号 | 再利用禁止（欠番があっても欠番を埋めない） |
| 例 | REQ-0009の次 → REQ-0010 |

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
| 条件 | 既存のREQファイルに新しい要件行を追加する場合 |
| 操作 | 既存REQファイルの「要件」テーブルに行追記 |
| frontmatter | `updated` フィールドを現在日時に更新 |

### UPDATE（既存要件の修正）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のREQファイルの特定セクションを修正する場合 |
| 操作 | 該当セクションの内容を更新 |
| frontmatter | `updated` フィールドを現在日時に更新 |

### SPLIT（要件の分割）

| 項目 | 内容 |
|------|------|
| 条件 | 1つのREQファイルの要件数が多すぎる、または関心領域が複数に分かれる場合 |
| 操作 | 既存REQファイルから要件を分割し、新規REQファイルを作成 |
| 採番 | 最大REQ番号+1で新規採番（分割先ファイル） |
| frontmatter | 元ファイル・新規ファイルともに `updated` を現在日時に更新 |
| 判定基準 | 要件テーブルが10行を超える、または「適用範囲」に複数の関心領域が混在する場合に実施を検討 |
| 関連記載 | 分割元のREQ本文に「分割先: REQ-{NNNN}」を記載。分割先のREQ本文に「分割元: REQ-{NNNN}」を記載 |

---

## 判定基準

| 状況 | モード |
|------|--------|
| 全く新しい要件（対応REQなし） | CREATE |
| 既存Issueに追加要件（REQファイルあり・要件行追加） | APPEND |
| 既存Issueの要件修正（REQファイルあり・内容変更） | UPDATE |
| 1ファイルの要件が膨張・関心領域が分離可能 | SPLIT |

---

## 既存REQ照合方法論

issue-req（壁打ちフェーズ）で既存REQファイルとユーザーの要件を照合する方法論を定義する。

### 照合の実行タイミング

壁打ちの意図把握後（Step 1完了時）、要件展開（Step 3）の前に実行する。照合結果は要件展開に反映され、要件の具体化に活用される。

### 照合の判定要素

ユーザーの要件説明と既存REQファイルを以下の要素で比較し、総合的に関連性を判定する。

| 判定要素 | 重み | 説明 |
|----------|------|------|
| タイトル | 高 | 要件の主題とREQのタイトルの意味的類似性 |
| tags | 中 | frontmatterのtagsとユーザー要件の領域の一致 |
| 目的セクション | 高 | REQの「目的」セクションとユーザー要件の目的の意味的重複 |
| 要件内容 | 中 | REQの要件テーブル内容とユーザー要件の具体的な重複・包含関係 |

### 照合結果の分類

| 状況 | 操作分類 | 説明 |
|------|----------|------|
| ユーザー要件と同じ関心領域のREQが存在し、内容を修正する場合 | `UPDATE` | 既存REQのセクション内容を変更 |
| ユーザー要件と関連するREQが存在し、新しい要件を追加する場合 | `APPEND` | 既存REQに要件行を追加 |
| ユーザー要件と同じ関心領域のREQが存在しない場合 | `CREATE` | 新規REQファイルを作成 |
| 1つのREQに複数の関心領域が混在する場合 | `SPLIT` → `APPEND` | 先にSPLITしてから該当REQにAPPEND |

### 照合時の壁打ち反映

関連REQが特定された場合、以下を壁打ちコンテキストに即時反映する:
- 該当REQの目的セクション
- 該当REQの既存要件テーブル
- 該当REQの適用範囲

これにより、ユーザーの要件が既存要件と整合し、重複や矛盾を防ぐ。

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
- Pattern分岐の判定基準と固有ルールは `issue-lifecycle` → Pattern Registry を参照

各REQファイルのfrontmatter:

```yaml
---
id: REQ-{NNNN}
title: 要件タイトル
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

## 整合性チェック

### Issue ↔ REQ

- REQファイルはIssueから一方向参照（Issue本文にREQ番号を記載）。REQファイルからIssueへの逆参照は行わない

### ADR ↔ REQ

- ADRが必要な要件は、REQ本文の「関連情報」セクションにADR番号を記載する
- ADRが存在しない場合、ADR作成を推奨（要件がアーキテクチャ判断を含む場合）

### README.md ↔ REQ

- `docs/requirements/README.md` のインデックスに全REQが記載されているか確認
- インデックスに記載されているがファイルが存在しないREQを検出
- ファイルが存在するがインデックスに未記載のREQを検出

### 整合性チェック自動修正手順

REQファイル・docs/requirements/README.md・docs/README.md間の整合性を検証し、自動修正する手順。

#### 検証項目

| チェック対象 | 検証内容 | 自動修正 |
|-------------|---------|---------|
| docs/requirements/ 配下のファイル | 全REQファイルが存在するか | 欠落ファイルは警告のみ（自動作成しない） |
| docs/requirements/README.md インデックス | 全REQファイルがテーブルに記載されているか | 未記載のREQをテーブルに追加 |
| docs/requirements/README.md インデックス | テーブルに記載されたREQのファイルが存在するか | 存在しないエントリをテーブルから削除 |
| docs/README.md ドキュメントハブ | 全REQファイルがリンクとして記載されているか | 未記載のREQをリンクとして追加 |
| docs/README.md ドキュメントハブ | リンク先のREQファイルが存在するか | 存在しないエントリを削除 |
| REQ frontmatter id | ファイル名と一致するか | エラーとして報告（自動修正しない） |

#### 自動修正の実行手順

1. `docs/requirements/REQ-*.md` ファイル一覧を取得
2. 各REQファイルのfrontmatterから `id`, `title` を読み取り
3. `docs/requirements/README.md` のテーブルと照合:
   - ファイルが存在するがテーブルにない → テーブルに追加
   - テーブルにあるがファイルが存在しない → テーブルから削除
   - title が不一致 → テーブルを frontmatter 値で更新
4. `docs/README.md` の Requirements セクションと照合:
   - ファイルが存在するがリンクがない → リンクを追加（REQ番号順の正しい位置に挿入）
   - リンクがあるがファイルが存在しない → リンクを削除
5. 変更があった場合は `docs/requirements/README.md` と `docs/README.md` を更新

#### 実行タイミング

この整合性チェックは以下のタイミングで実行する:
- `issue-save-req` の Step 7（docs変更整合性検証）で実行
- `issue-close` の Step 3（docs検証）で実行

---

## 関連情報管理

REQ間の関連・依存はREQ本文の「関連情報」セクションに記載する（frontmatterフィールドは使用しない）。

### 記載方法

- **置き換え**: 旧REQを新REQに包括的に置き換える場合に記載
- **関連**: 独立要件だが変更が競合する可能性がある場合に記載
- **分割元/分割先**: SPLIT操作による分割関係

---

## APPEND/UPDATE判定基準

### 判定フロー

```
操作対象は既存REQファイルか？
  ├── NO → CREATE
  └── YES → 1ファイル内の要件が膨張・関心分離可能か？
               ├── YES → SPLIT
               └── NO → 既存セクションの「内容」を変更するか？
                         ├── NO（新規要件行・セクション追加） → APPEND
                         └── YES（テキスト置換・フィールド更新） → UPDATE
```

### APPEND条件

- 「要件」テーブルへの新規行追加（新ID採番: `REQ-{NNNN}-{MMM}`）
- 「適用範囲」への項目追加
- 新規タグ・関連情報の追加

### UPDATE条件

- 既存要件行の内容修正（テキスト置換・表現変更）
- frontmatter フィールドの変更（title変更、tags変更等）
- 「目的」「適用範囲」セクションの内容修正

---

## テンプレート参照

要件定義テンプレートは以下のパスで参照可能:

@.opencode/commands/issue/templates/doc_requirement.md

テンプレート構成:
- **frontmatter**: `id`, `title`, `created`, `updated`, `tags`
- **セクション**: `目的`, `要件`（テーブル形式）, `適用範囲`（対象/対象外）

---

## See Also

- **req-analysis**: 要件分析手法（要件の展開観点、RFC 2119言語ガイダンス、壁打ちメソドロジー）
- **adr-file-manager**: ADRファイル管理（REQ ↔ ADR整合性チェック）
- **adr-guidelines**: ADR作成の必要性判定基準
- **spec-compliance**: 仕様適合性検出（影響REQ番号の特定）
