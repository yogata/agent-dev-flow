---
name: agentdev-adr-file-manager
description: Manages ADR numbering and architecture decision record file operations (CREATE/APPEND/UPDATE). USE FOR: creating ADR files, appending sections, or updating existing ADRs. DO NOT USE FOR: evaluating whether an ADR is needed, analyzing requirement quality, or general document management.
---

# ADRファイル管理

このスキルはアーキテクチャ意思決定記録（ADR: Architecture Decision Record）ファイルの管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: ADR番号採番ルール、ファイル操作モード、判定基準、ステータス遷移、整合性チェック
- **適用先**: `req-save`（ADRファイル保存時）、`case-open`（Issue作成時のADR参照）、`case-run`（実行時のADR参照）

**注意**: このスキルはADRの**管理、運用**（採番、ステータス遷移、整合性チェック）を担当する。
ADRの**作成ガイドライン**（評価基準、ADR必要かどうかの判定）については、`agentdev-adr-guidelines` を参照。

---

## 原本（SSoT）

本スキルの原本仕様は `agentdev-adr-file-manager` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## ADR要否判定の責務境界

本スキルはADRファイルの操作（作成、追記、更新）を責務とし、ADRを作成すべきか否かの**意味的判定**は主責務としない。
ADR要否の判定は `agentdev-adr-guidelines` スキルが行う。
本スキルを使用する前に `agentdev-adr-guidelines` による判定が完了していることを前提とする。

---

## ADR番号採番ルール

| 項目 | 規約 |
|------|------|
| フォーマット | `ADR-{NNNN}`（4桁ゼロ埋め） |
| 採番方法 | `docs/adr/` 配下の既存ADRファイルから最大番号を特定し、+1 |
| 空き番号 | 再利用禁止（欠番があっても欠番を埋めない） |
| 例 | ADR-NNNNの次 → ADR-NNNN+1 |

**注意**: 欠番が存在しても、新規ADRで欠番を埋めない。
常に最大番号+1で採番する。

**強調**: req-save が ADR ファイルを保存する際、本採番ルールに従うことを必須とする。
- 必ず `docs/adr/` 配下の最大番号 + 1 で採番する（欠番埋め禁止、一貫性維持）
- req-define が `new:{topic-slug}` 形式で参照した ADR を、req-save が確定番号に置換する
- 採番の判断を req-define 側で行わない（番号推測禁止）。req-save と `agentdev-adr-file-manager` の連携で確定する

#### 基準番号帯例外

ADR体系の全面改定時は、`ADR-NNNN` 以降の番号帯を基準番号帯として一括採番できる。
この場合、最大番号+1の通常採番を上書きし、基準番号帯の最小番号から連番で採番する。

**適用条件**:
- ADRの全面改定が例外要件を満たしていること
- 基準番号帯採番は一度のみ実行され、以降の新規ADRは通常採番に戻る

**例**: 基準番号帯により ADR-NNNN〜ADR-NNNN+K を一括採番。
次の新規ADRは基準番号帯最大番号+1 から通常採番。

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
| 既存ADRに新規セクション追加（補足説明、学び、参照） | APPEND |
| 既存ADRのステータス変更、内容修正 | UPDATE |

---

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

**README.md の役割**:
- 全ADRの一覧表示（ADR一覧テーブル）
- 分類ビュー（Status View/ Topic View/ Decision Map/ Related REQ）による探索性向上
- ADR間の相互参照マップ
- **注意**: README.md は分類ビューであり、ADR本文の唯一の情報源（SSoT）ではない

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

- `created`/ `updated` は `YYYY-MM-DD` 形式であること
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

### 単なる廃止、削除、移行は新規ADRではなくretire/supersedeで扱う基準

過去の判断を現行基盤から外すだけの場合（削除、廃止、移行、統合、再構築、完全削除）は、新規ADRを作成せず、対象ADRのstatus遷移（retire/supersede）で処理する。
新規ADRは「あるべき状態」の意思決定が存在する場合のみ作成する。
削除、廃止、移行そのものを主題にした新規ADR作成は `agentdev-adr-guidelines` の作成不可条件に該当する。

---

## 整合性チェック

### README ↔ ADR

- `docs/adr/README.md` の現行基準ビュー（Current Baseline View）に `docs/adr/ADR-*.md` の全ADRが記載されているか確認
- 廃止済み ADR は物理削除を第一選択肢とする（REQ-0112-048）。実体が各 retired/ ディレクトリへ移動された場合は README の Retired/ Historical View に全 ADR が記載されているか確認する
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

- **現行基準ビュー（Current Baseline View）**: 現行の基準ADR（`docs/adr/ADR-*.md`）の基本情報テーブル（番号、タイトル、ステータス、作成日）
- **廃止履歴ビュー（Retired/ Historical View）**: retired ADR（各 retired/ ディレクトリ配下、運用上移動された場合）のテーブル（番号、タイトル、retired時ステータス、引き継ぎ先）。物理削除が第一選択肢（REQ-0112-048）
- **状態別ビュー（Status View）**: ステータス別の分類（proposed/ accepted/ superseded）
- **主題別ビュー（Topic View）**: 対象領域別の分類
- **意思決定マップ（Decision Map）**: ADR間の関係性（supersedes/ relates-to）
- **関連REQ（Related REQ）**: 各ADRが関連するREQ番号

**関連REQ/ 意思決定マップ（Related REQ/ Decision Map）の構成ルール**:
- REQ本文に記載された Related ADRs などの基準情報から構成する
- README.md の情報は分類ビューであり、ADR本文のSSoTではない
- ADR本文を更新した場合は README.md の該当箇所も更新する

**README.md の更新タイミング**:
- ADR CREATE 時: 全ビューに反映
- ADR UPDATE（ステータス変更）時: 状態別ビュー（Status View）を更新
- ADR APPEND（関連情報追加）時: 意思決定マップ/ 関連REQ を更新

### ステータス変更時の README 整合性検証

ADR の `status` を変更した場合、`docs/adr/README.md` の全ビューが実ファイルと一致していることを検証する。
ステータス変更と README 更新が同一変更内で行われないと、README と実ファイルの不整合が発生する（OU-010 学習）。

#### 検証対象ビュー

| ビュー | 検証内容 |
|-------|----------|
| 現行基盤ビュー | 変更後 status が `accepted` の場合のみ現行基盤ビューに掲載。`superseded`/`deprecated` に遷移した場合は現行基盤ビューから除外されていること |
| 状態別ビュー（superseded） | `superseded` の ADR が「置き換え済み」セクションに掲載され、`superseded by ADR-MMMM` が明記されていること |
| 状態別ビュー（deprecated） | `deprecated` の ADR が「非推奨」セクションに掲載され、deprecation 理由が明記されていること |
| トピック別ビュー | トピック分類は status によらず維持（歴史的参照のため）。ただし status 表記がある場合は実ファイルと一致 |
| 意思決定マップ | `superseded-by`/`supersedes` のリレーションが正しく記載されていること |

#### 検証手順

1. ADR frontmatter の `status` を読み取る
2. `docs/adr/README.md` の各ビューを照合し、実ファイルと一致しているか確認する
3. 不整合を検出した場合、ステータス変更と README 更新を同一変更（同一 PR、同一コミット群）で実施する
4. 整合性確認を保存前の検証ステップに組み込む（`req-save`、`case-update` での ADR status 変更時）

#### 共起必須項目

| status 遷移 | frontmatter 必須項目 | README 必須反映 |
|-------------|----------------------|-----------------|
| `accepted` → `superseded` | `superseded_by: ADR-MMMM` | superseded セクションへ移動、`superseded-by` リレーション明記、現行基盤ビューから除外 |
| `accepted` → `deprecated` | （deprecation 理由を本文に明記） | deprecated セクションへ移動、deprecation 理由を簡潔に明記、現行基盤ビューから除外 |
| `proposed` → `accepted` | （更新日時のみ） | 現行基盤ビューに掲載、accepted セクションに掲載 |

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

- 既存セクションへの内容追加（サブアイテム、メモの追記）
- 新規セクションの追加（Post-implementation Notes、追加の参照ADR等）

### UPDATE条件

- 既存セクションの内容修正（テキスト置換、表現変更）
- frontmatter フィールドの変更（status変更、title変更等）
- ステータス遷移（proposed → accepted など）

---

## テンプレート参照

ADRテンプレートは以下のパスで参照可能:

@.opencode/skills/`agentdev-adr-file-manager`/templates/doc_adr.md

**テンプレートの構成**:
- Context（背景、文脈）
- Decision（決定内容）
- Consequences（影響、結果）
- Status（ステータス）
- Related Decisions（関連ADR）

---

## See Also

- **agentdev-adr-guidelines**: ADR作成の必要性判定基準、ライフサイクル定義
- **agentdev-req-analysis**: 要件分析におけるADR閾値判定ブリッジ
- **agentdev-req-file-manager**: REQファイル管理（ADR ↔ REQ整合性チェック）
- **agentdev-doc-writing**: ADR/REQ/SPEC横断の文書品質査読ゲート（文書種別責務、要件性、文意品質、粒度）


