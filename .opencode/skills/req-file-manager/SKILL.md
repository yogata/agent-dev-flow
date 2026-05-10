---
name: req-file-manager
description: Manages REQ numbering and requirement file operations (CREATE/APPEND/UPDATE). USE FOR: creating requirement files, appending sections, or updating existing requirements. DO NOT USE FOR: analyzing requirement quality, creating ADR files, general document management, or requirement gathering.
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
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照

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
| REQ frontmatter status | docs/requirements/README.mdのStatusと一致するか | テーブル側をREQ frontmatterに合わせる |

#### 自動修正の実行手順

1. `docs/requirements/REQ-*.md` ファイル一覧を取得
2. 各REQファイルのfrontmatterから `id`, `title`, `status` を読み取り
3. `docs/requirements/README.md` のテーブルと照合:
   - ファイルが存在するがテーブルにない → テーブルに追加
   - テーブルにあるがファイルが存在しない → テーブルから削除
   - title または status が不一致 → テーブルを frontmatter 値で更新
4. `docs/README.md` の Requirements セクションと照合:
   - ファイルが存在するがリンクがない → リンクを追加（REQ番号順の正しい位置に挿入）
   - リンクがあるがファイルが存在しない → リンクを削除
5. 変更があった場合は `docs/requirements/README.md` と `docs/README.md` を更新

#### 実行タイミング

この整合性チェックは以下のタイミングで実行する:
- `issue-save-req` の Step 7（docs変更整合性検証）で実行
- `issue-close` の Step 3（docs検証）で実行

## ステータス同期

### Issue close → REQ status 更新

Issue close 時に、関連REQの status を自動更新する。`issue-close` Step 5 で実行。

**更新手順**:

1. Issue本文からREQ番号を抽出（`REQ-{NNNN}` パターンを検索）
2. 各REQファイルの frontmatter `status` を確認
3. 以下のルールで更新:
   - `planned` → `implemented`（要件が実装完了）
   - `in-progress` → `implemented`（実装中要件が完了）
   - `implemented` → スキップ（既に完了済み）
   - `deprecated` → 警告表示してスキップ（廃止済みは更新不可）
4. frontmatter `updated` フィールドを現在日時に更新
5. `docs/requirements/README.md` テーブルの該当行の Status を `implemented` に更新

**遷移ルール**: 本スキルの「ステータス遷移ルール」に準拠。禁止遷移に該当する場合は警告表示してスキップ。

### 不整合検出

REQ status と Issue status の不整合を検出する。

**検出手順**:

1. `docs/requirements/` 配下の全REQファイルの frontmatter `status` を取得
2. 各REQ番号が記載されたIssue（`gh issue list --search "REQ-{NNNN}"`）の状態を取得
3. 以下の不整合パターンを検出:
   - **Issue closed + REQ `planned`/`in-progress`** → 不整合（Issue完了だがREQ未更新）
   - **Issue open + REQ `implemented`** → 要確認（実装済みだがIssue未クローズ）
4. 検出結果を報告（修正は手動または `issue-update --req` で対応）

**実行タイミング**: `issue-close` Step 5 での自動実行、または手動確認

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
- **spec-compliance**: 仕様適合性検出（影響REQ番号の特定）
