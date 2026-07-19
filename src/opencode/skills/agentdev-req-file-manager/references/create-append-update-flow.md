# CREATE/APPEND/UPDATE 操作と判定フロー

本ファイルは `agentdev-req-file-manager` SKILL.md の補助資料であり、REQファイル操作モード（CREATE、APPEND、UPDATE）の詳細定義、状況判定基準、APPEND/UPDATE判定フロー、廃止宣言 APPEND の precedent 利用を扱う。SKILL.md 本文では3モードの要点のみを提示し、個別の操作条件とフロー詳細は本ファイルを参照する（REQ-0113-010）。

## ファイル操作モード

### CREATE（新規要件）

| 項目 | 内容 |
|------|------|
| 条件 | 該当するREQファイルが存在しない場合 |
| 操作 | テンプレートを適用して新規ファイル作成 |
| 採番 | 最大REQ番号+1で採番 |
| パス | `docs/requirements/REQ-{NNNN}.md` |
| README | `docs/requirements/README.md` のインデックスに新規REQを追加 |
| ドキュメントハブ | `docs/README.md` の Requirements セクションに新規REQを追加 |

### APPEND（既存要件への追加）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のREQファイルに新しい要件行を追加する場合 |
| 操作 | 既存REQファイルの「要件」テーブルに行追記 |
| frontmatter | `updated` フィールドを現在日時に更新 |
| ドキュメントハブ | `docs/README.md` の該当REQエントリを更新（必要に応じて） |

#### 廃止宣言 APPEND の precedent 利用

APPENDで廃止宣言（retire宣言）を行う場合、`docs/requirements/` 配下のREQファイルから既存の廃止宣言行を検索し、その書式を機械的に再利用することを推奨する。
precedent行から以下の要素を再利用し、対象REQ番号と理由のみ差し替える。

- **理由**: 当該REQをretireする根拠
- **移行先**: 内容が吸収された宛先、または「後継なし」
- **非吸収宣言**: 内容が移行されなかった場合の明示

この運用は推奨（必須ではない）。
precedentに従うことで書式設計のコストを削減し、REQ間で廃止宣言の表記揺れを防ぐ。
特定のprecedentを「唯一の正解」として固定化せず、出発点として参照する。

### UPDATE（既存要件の修正）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のREQファイルの特定セクションを修正する場合 |
| 操作 | 該当セクションの内容を更新 |
| frontmatter | `updated` フィールドを現在日時に更新 |
| ドキュメントハブ | `docs/README.md` の該当REQエントリを更新（必要に応じて） |

## 状況判定基準

| 状況 | モード |
|------|--------|
| 全く新しい要件（対応REQなし） | CREATE |
| 既存Issueに追加要件（REQファイルあり、要件行追加） | APPEND |
| 既存Issueの要件修正（REQファイルあり、内容変更） | UPDATE |

## APPEND/UPDATE判定フロー

```
操作対象は既存REQファイルか？
  ├── NO → CREATE
  └── YES → 既存セクションの「内容」を変更するか？
             ├── NO（新規要件行・セクション追加） → APPEND
             └── YES（テキスト置換・フィールド更新） → UPDATE
```

### APPEND条件

- 「要件」テーブルへの新規行追加（要件行ID採番: `REQ-{NNNN}-{MMM}`）
- 「適用範囲」への項目追加

### UPDATE条件

- 既存要件行の内容修正（テキスト置換、表現変更）
- frontmatter フィールドの変更（title変更等）
- 「目的」「適用範囲」セクションの内容修正
