---
name: agentdev-req-file-manager
description: Manages REQ numbering and requirement file operations (CREATE/APPEND/UPDATE). USE FOR: creating requirement files, appending sections, or updating existing requirements. DO NOT USE FOR: analyzing requirement quality, creating ADR files, general document management, or requirement gathering.
---

# REQファイル管理

このスキルは要件ファイル（REQ）の管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: REQ番号採番ルール、ファイル操作モード、判定基準
- **適用先**: `req-define`（要件定義時）、`req-save`（REQ保存時）、`case-open`（Issue作成時のREQ参照）、`case-run`（実行時のREQ参照）、`case-update`（要件更新時）、`case-close`（完了時のREQ参照）

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
| ドキュメントハブ | `docs/README.md` の Requirements セクションに新規REQを追加 |

### APPEND（既存要件への追加）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のREQファイルに新しい要件行を追加する場合 |
| 操作 | 既存REQファイルの「要件」テーブルに行追記 |
| frontmatter | `updated` フィールドを現在日時に更新 |
| ドキュメントハブ | `docs/README.md` の該当REQエントリを更新（必要に応じて） |

### UPDATE（既存要件の修正）

| 項目 | 内容 |
|------|------|
| 条件 | 既存のREQファイルの特定セクションを修正する場合 |
| 操作 | 該当セクションの内容を更新 |
| frontmatter | `updated` フィールドを現在日時に更新 |
| ドキュメントハブ | `docs/README.md` の該当REQエントリを更新（必要に応じて） |

---

## 判定基準

| 状況 | モード |
|------|--------|
| 全く新しい要件（対応REQなし） | CREATE |
| 既存Issueに追加要件（REQファイルあり・要件行追加） | APPEND |
| 既存Issueの要件修正（REQファイルあり・内容変更） | UPDATE |

---

## 既存REQ照合方法論

req-define（壁打ちフェーズ）で既存REQファイルとユーザーの要件を照合する方法論を定義する。

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

※ SPLIT（要件の分割）が検出された場合は、requirements review / follow-up 候補として扱い、保存操作の対象外とする。保存可能範囲（CREATE/APPEND/UPDATE）は通常通り実行する。

### 操作分類の判定軸

関連REQ特定後の CREATE/APPEND/UPDATE 選択において、以下の5つの判定軸を評価する。全ての判定軸は重み:高 として扱う。

| 判定軸 | 重み | 説明 |
|--------|------|------|
| 対象コンポーネント | 高 | 同じUI部品・画面・機能単位への変更か |
| 対象スコープ | 高 | 同じ利用者操作・業務範囲・表示範囲への変更か |
| 目的の連続性 | 高 | 既存REQの目的に対する追加・補強・調整か |
| 要件行追加可能性 | 高 | 既存REQの要件テーブルへ自然に新規行として追加できるか |
| 独立目的の有無 | 高 | 既存REQとは独立した目的を持つ新規要件か |

**判定フロー**:

1. 照合で関連REQを特定後、上記5軸で評価
2. 対象コンポーネント・対象スコープが一致する関連REQが存在 → APPEND をデフォルト
3. 既存REQの目的・要件行・適用範囲の内容修正 → UPDATE
4. 独立した目的を持ち、関連REQと対象コンポーネント・スコープが異なる → CREATE
5. CREATE 選択時は req-define コマンドの `create-rationale` フィールドに理由を記録

### 照合時の壁打ち反映

関連REQが特定された場合、以下を壁打ちコンテキストに即時反映する:
- 該当REQの目的セクション
- 該当REQの既存要件テーブル
- 該当REQの適用範囲

これにより、ユーザーの要件が既存要件と整合し、重複や矛盾を防ぐ。

### REQファイルの照合用情報記述規則

将来の APPEND/UPDATE 判定（操作分類の判定軸）で参照できるよう、REQファイルの既存セクションに照合用情報を明示する記述規則を定義する。frontmatterへの新規フィールド追加は行わない。

| セクション | 記述内容 | 例 |
|-----------|----------|-----|
| title | 対象コンポーネント・対象領域を含める | "AgentDevFlow コマンドプロトコル" |
| tags | 対象領域・対象コンポーネントを含める | `[commands, protocol, req-comparison]` |
| 適用範囲（対象） | 対象コンポーネント・対象画面・対象操作・対象スコープを含める | "req-defineの既存REQ照合プロセス、操作分類精度向上" |
| 適用範囲（対象外） | 明示的に対象外とするスコープを含める | "並列実行の依存分析、テンプレートの内容" |

**目的**: 照合の判定要素（タイトル・tags・目的・要件内容）に加えて、操作分類の判定軸（対象コンポーネント・対象スコープ等）が既存REQファイルから機械的に参照できるようにする。

---

## ファイル配置規約

### 基準構造（per-file）

> `REQ-{NNNN}.md` を永続的な基準ファイルとする。area-based 構造への移行は撤回済み（ADR-0007）。

```
docs/requirements/
├── README.md          # REQインデックス
├── REQ-0001.md
├── REQ-0002.md
└── REQ-{NNNN}.md
```

`docs/DOC-MAP.md`（ドキュメント探索経路インデックス）は `docs/` 直下に配置する。DOC-MAP は補助文書であり、基準は `REQ-{NNNN}.md` である（REQ-0035-012）。

**バグ修正・軽微変更除外**: バグ修正・軽微変更（Pattern A）ではREQファイルを作成しない。Issue本文のみで要件を管理する。REQファイルの修正が必要なバグ修正は、機能追加（Pattern B）に昇格して扱う。
- Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照

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

### 分類ゲートルール（REQ-0041-013〜016）

要件行候補が「変更後仕様」か「既存成果物への反映作業」かを分類し、反映作業のみの要件行の混入を防止する。

#### 反映作業の定義

既存成果物への以下の操作そのものを記述する要件行候補を「反映作業」とする:

| 操作種別 | 例 |
|----------|-----|
| 更新 | 「REQ-0002の目的セクションを更新する」 |
| 削除 | 「廃止されたセクションを削除する」 |
| 移動 | 「docs/old/ から docs/new/ に移動する」 |
| 名称変更 | 「コマンド名をxxxに改名する」 |
| 廃止 | 「旧ワークフローを廃止する」 |
| 置換 | 「旧REQを新REQで置換する」 |
| 参照修正 | 「リンク先を新パスに修正する」 |
| インデックス修正 | 「READMEのインデックスを更新する」 |
| 整合性修正 | 「frontmatterのidを修正する」 |

#### 適用タイミング

| コマンド | タイミング | 要件ID |
|----------|-----------|--------|
| `req-define` | 要件展開（Step 4）の直後、ADR判定（Step 5）の前 | REQ-0041-013, REQ-0041-014 |
| `req-save` | CREATE対象REQの保存前（Step 3a） | REQ-0041-015, REQ-0041-016 |

#### 判定基準

要件行候補の述語に基づいて分類する:

| 分類 | 述語の特徴 | 判定 |
|------|-----------|------|
| **変更後仕様** | 「〜すること（SHALL/SHOULD/MAY）」で表現される振る舞い・制約・状態 | 要件行として採用 |
| **反映作業のみ** | 「〜を更新/削除/移動/改名/廃止/置換/修正すること」のみを表す | 独立要件行として不採用 |
| **混合** | 変更後仕様の記述を含み、かつ反映作業も含む | 要件行として採用（反映作業部分は移送候補としてマーク） |

#### 処理ルール

1. 反映作業のみの候補は、独立した要件行として扱わない（REQ-0041-014）
2. 反映作業のみの候補は、後続工程への移送候補として以下のいずれかに振り分ける:
   - 対象REQ/ADR/SPEC等への UPDATE / APPEND
   - 関連ドキュメント更新候補（req-define の Step 4b で管理）
   - 後続Caseの変更対象
3. `req-save` での検査（REQ-0041-015, 016）: CREATE対象REQの保存前に反映作業のみの要件行が残っていないか検査し、検出時は保存を停止して該当行・判定理由・移送先を報告する

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
- `req-save` の Step 7（docs変更整合性検証）で実行（自動修正あり）
- `case-close` の Step 3（docs検証）で実行（検証のみ。自動修正は行わない。修正が必要な場合は req-save または case-update で対応）

---

## DOC-MAP 影響確認ルール

REQ CREATE / APPEND / UPDATE 時に `docs/DOC-MAP.md` への影響を確認するルール（REQ-0035-034 ~ 037）。

### 影響確認フロー

1. REQ操作（CREATE/APPEND/UPDATE）実行時、`docs/DOC-MAP.md` に該当領域のセクションが存在するか確認する
2. 影響がある場合は、同一変更内で `docs/DOC-MAP.md` を更新する
3. 影響がない場合は更新不要。完了報告で「DOC-MAP更新なし」と明示する
4. 更新が必要だが作業範囲を超える場合、REQ保存は中止せず follow-up として明示する

### 影響確認対象

| 操作 | 確認対象 | 説明 |
|------|---------|------|
| REQ追加時 | `docs/requirements/README.md`, `docs/DOC-MAP.md` | 新規REQがDOC-MAPの対象領域に含まれるか確認 |
| ADR追加時 | `docs/adr/README.md`, `docs/DOC-MAP.md` | 新規ADRがDOC-MAPの対象領域に含まれるか確認 |
| SPEC追加/分割/削除時 | `docs/specs/README.md`, `docs/DOC-MAP.md` | SPEC構成変更がDOC-MAPに影響するか確認 |

### 矛盾時の優先順位

- `docs/DOC-MAP.md` と基準（REQ/ADR/SPEC）が矛盾する場合、基準を優先する
- `docs/DOC-MAP.md` を修正対象とする

### DOC-MAP更新の位置づけ

- DOC-MAPの更新は探索経路の更新であり、要件・判断・仕様の更新ではない（REQ-0035-037）

---

## REQ-ID 安定ID 規約

REQ-ID（`REQ-{NNNN}`）は安定IDであり、ファイル配置に依存しない。

- REQ-ID に area 情報を含めない（例: `REQ-core-0001` とはしない）
- REQ-ID は要件の分割・統合が発生しても変更しない

---

## REQ本文内メタデータ規約

REQ単位の関連情報は frontmatter フィールドとして管理せず、本文内に記述する。

### 記述項目

| 項目 | 説明 |
|------|------|
| REQ-ID | `REQ-{NNNN}` |
| title | 要件タイトル |
| Status | retained / partially superseded / superseded |
| Related artifacts | 関連ドキュメントへの参照 |
| Related ADRs | 関連ADRへの参照 |
| Supersedes | この要件が置き換える旧要件 |
| Superseded by | この要件を置き換える新要件 |

### 記述方法

REQファイル内に、上記メタデータを構造化して記述する。frontmatter フィールドとしては管理しない。

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
  └── YES → 既存セクションの「内容」を変更するか？
             ├── NO（新規要件行・セクション追加） → APPEND
             └── YES（テキスト置換・フィールド更新） → UPDATE
```

### 要件行ID定義

`REQ-{NNNN}-{MMM}` は要件行IDであり、REQファイル内の「要件」テーブルの各行を一意に識別する。`{NNNN}` は親REQ番号、`{MMM}` は3桁ゼロ埋めの行連番（既存行の最大番号 + 1）。採番ルールはREQ-ID（`REQ-{NNNN}`）と同様に欠番再利用禁止。

### APPEND条件

- 「要件」テーブルへの新規行追加（要件行ID採番: `REQ-{NNNN}-{MMM}`）
- 「適用範囲」への項目追加
- 新規タグ・関連情報の追加

### UPDATE条件

- 既存要件行の内容修正（テキスト置換・表現変更）
- frontmatter フィールドの変更（title変更、tags変更等）
- 「目的」「適用範囲」セクションの内容修正

---

## テンプレート参照

要件定義テンプレートは以下のパスで参照可能:

@.opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md

テンプレート構成:
- **frontmatter**: `id`, `title`, `created`, `updated`, `tags`
- **セクション**: `目的`, `要件`（テーブル形式）, `適用範囲`（対象/対象外）

---

## Finding と REQ の関係

### Finding の位置づけ

requirements review finding は REQ ファイルへの保存操作ではなく、要件体系の再構成候補を一時的に保持する中間アーティファクトである。

- **保存先**: `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md`（REQファイルと同じ `docs/requirements/` には保存しない）
- **次工程**: finding は req-define の明示入力ファイルとして渡され、正式な要件変更（CREATE/APPEND/UPDATE）に変換される
- **SPLIT 検出時**: req-save が SPLIT を検出した場合、保存可能範囲（CREATE/APPEND/UPDATE）を実行した後に finding を作成する
- **詳細**: `agentdev-workflow-lifecycle` reference の `requirements-review-finding-protocol.md` を参照

---

## See Also

- **agentdev-req-analysis**: 要件分析手法（要件の展開観点、RFC 2119言語ガイダンス、壁打ちメソドロジー）
- **agentdev-adr-file-manager**: ADRファイル管理（REQ ↔ ADR整合性チェック）
- **agentdev-adr-guidelines**: ADR作成の必要性判定基準
- **agentdev-spec-compliance**: 仕様適合性検出（影響REQ番号の特定）
- **agentdev-no-ai-slop-writing**: 自然言語成果物の文章品質ゲート（AI-slop 検出・修正）
