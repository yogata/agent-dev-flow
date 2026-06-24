---
name: agentdev-req-file-manager
description: Manages REQ numbering and requirement file operations (CREATE/APPEND/UPDATE). USE FOR: creating requirement files, appending sections, updating existing requirements, matching existing requirements for CREATE/APPEND/UPDATE judgment, or deleting requirement unit files. DO NOT USE FOR: analyzing requirement quality, creating ADR files, general document management, or requirement gathering.
---

# REQファイル管理

このスキルは要件ファイル（REQ）の管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: REQ番号採番ルール、ファイル操作モード、判定基準
- **適用先**: `req-define`（要件定義時）、`req-save`（REQ保存時）、`case-open`（Issue作成時のREQ参照）、`case-run`（実行時のREQ参照）、`case-update`（要件更新時）、`case-close`（完了時のREQ参照）

---

## 概要

REQファイルの作成、追記、更新を管理する。
各操作は宣言的に定義され、エージェントがコンテキストに応じて適切なモードを選択する。

---

## REQ番号採番ルール

| 項目 | 規約 |
|------|------|
| フォーマット | `REQ-{NNNN}`（4桁ゼロ埋め） |
| 採番方法 | `docs/requirements/` 配下の既存REQファイルから最大番号を特定し、+1 |
| 空き番号 | 再利用禁止（欠番があっても欠番を埋めない） |
| 例 | REQ-NNNNの次 → REQ-NNNN+1 |

---

## REQ 要件行の記述基準

REQ 要件行は「変更後に満たすべき振る舞い、制約、状態」のみを記述する。
実装指示（具体的ファイル編集内容、コード断片、ステップバイステップ手順、テストコマンド等）は要件行に含めない。
これらは command reference、skill references、SPEC 等の適切な配置先へ移送する。

| 記述内容 | REQ 要件行への配置 | 適切な配置先 |
|---|---|---|
| 変更後に満たすべき振る舞い、制約、状態 | 配置する | - |
| 具体的ファイル編集内容、コード断片 | 配置しない | command reference、実装Issue |
| ステップバイステップ手順、テストコマンド | 配置しない | command Steps、script |
| Step 番号の細分（4-1, 4-2 等）、判定表、分類表、状態機械詳細 | 配置しない | command reference、skill 本体、skill `references/` |

要件行は `REQ-{NNNN}-{MMM}` 形式の ID を持つ（後述「要件行ID定義」参照）が、その内容は振る舞い単位であること。
Step 番号参照やコマンド実装詳細を要件行に混入させないこと。

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

---

## 判定基準

| 状況 | モード |
|------|--------|
| 全く新しい要件（対応REQなし） | CREATE |
| 既存Issueに追加要件（REQファイルあり、要件行追加） | APPEND |
| 既存Issueの要件修正（REQファイルあり、内容変更） | UPDATE |

---

## 既存REQ照合方法論

req-define（壁打ちフェーズ）で既存REQファイルとユーザーの要件を照合する方法論を定義する。

### 照合の実行タイミング

壁打ちの意図把握後、要件展開の前に実行する。
照合結果は要件展開に反映される。

### 照合の判定要素

| 判定要素 | 重み | 説明 |
|----------|------|------|
| タイトル | 高 | 要件の主題とREQのタイトルの意味的類似性 |
| 目的セクション | 高 | REQの「目的」セクションとユーザー要件の目的の意味的重複 |
| 要件内容 | 中 | REQの要件テーブル内容とユーザー要件の具体的な重複、包含関係 |

### 照合結果の分類

| 状況 | 操作分類 | 説明 |
|------|----------|------|
| 同じ関心領域のREQが存在し、内容を修正する場合 | `UPDATE` | 既存REQのセクション内容を変更 |
| 関連するREQが存在し、新しい要件を追加する場合 | `APPEND` | 既存REQに要件行を追加 |
| 同じ関心領域のREQが存在しない場合 | `CREATE` | 新規REQファイルを作成 |

※ SPLIT（要件の分割）が検出された場合は、requirements review/ follow-up 候補として扱い、保存操作の対象外とする。

### 操作分類の判定軸

関連REQ特定後の CREATE/APPEND/UPDATE 選択で、以下の5軸で評価する（全て重み:高）。

| 判定軸 | 説明 |
|--------|------|
| 対象コンポーネント | 同じUI部品、画面、機能単位への変更か |
| 対象スコープ | 同じ利用者操作、業務範囲、表示範囲への変更か |
| 目的の連続性 | 既存REQの目的に対する追加、補強、調整か |
| 要件行追加可能性 | 既存REQの要件テーブルへ自然に新規行として追加できるか |
| 独立目的の有無 | 既存REQとは独立した目的を持つ新規要件か |

**判定フロー**:

1. 照合で関連REQを特定後、上記5軸で評価
2. 対象コンポーネント、対象スコープが一致する関連REQが存在 → APPEND をデフォルト
3. 既存REQの目的、要件行、適用範囲の内容修正 → UPDATE
4. 独立した目的を持ち、関連REQと対象コンポーネント、スコープが異なる → CREATE
5. CREATE 選択時は req-define コマンドの `create-rationale` フィールドに理由を記録

### 照合時の壁打ち反映

関連REQが特定された場合、以下を壁打ちコンテキストに即時反映する: 該当REQの目的セクション、既存要件テーブル、適用範囲。
これにより重複や矛盾を防ぐ。

### REQファイルの照合用情報記述規則

将来の APPEND/UPDATE 判定で参照できるよう、REQファイルの既存セクションに照合用情報を明示する。
frontmatterへの新規フィールド追加は行わない。

| セクション | 記述内容 | 例 |
|-----------|----------|-----|
| title | 対象コンポーネント、対象領域を含める | "AgentDevFlow コマンドプロトコル" |
| 適用範囲（対象） | 対象コンポーネント、対象画面、対象操作、対象スコープを含める | "req-defineの既存REQ照合プロセス" |
| 適用範囲（対象外） | 明示的に対象外とするスコープを含める | "並列実行の依存分析" |

---

## ファイル配置規約

> `REQ-{NNNN}.md` を永続的な基準ファイルとする。area-based 構造への移行は撤回済み。

```
docs/requirements/
├── README.md          # REQインデックス
└── REQ-{NNNN}.md
```

`docs/DOC-MAP.md`（ドキュメント探索経路インデックス）は `docs/` 直下に配置する。

**バグ修正、軽微変更除外**: bugfixではREQファイルを作成しない。Issue本文のみで要件を管理する。REQファイルの修正が必要なバグ修正は、featureに昇格して扱う。
- work_type分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照

各REQファイルのfrontmatter:

```yaml
---
id: REQ-{NNNN}
title: 要件タイトル
created: YYYY-MM-DD
updated: YYYY-MM-DD
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

### IDとファイル名の一致確認

- `REQ-{NNNN}.md` → frontmatter `id: REQ-{NNNN}`（必須、ファイル名と ID の一致）
- 不一致の場合はエラーとして扱う

### 日付フォーマット検証

- `created`/ `updated` は `YYYY-MM-DD` 形式であること
- `updated` ≥ `created` であること

### 分類ゲートルール

要件行候補が「変更後仕様」か「既存成果物への反映作業」かを分類し、反映作業のみの要件行の混入を防止する。

#### 反映作業の定義

既存成果物への以下の操作を「反映作業」とする: 更新、削除、移動、名称変更、廃止、置換、参照修正、インデックス修正、整合性修正。

#### 適用タイミング

| コマンド | タイミング |
|----------|-----------|
| `req-define` | 要件展開の直後、ADR判定の前 |
| `req-save` | CREATE対象REQの保存前 |

#### 判定基準

| 分類 | 述語の特徴 | 判定 |
|------|-----------|------|
| **変更後仕様** | 「〜すること」「〜禁止」「〜しない」等で表現される振る舞い、制約、状態 | 要件行として採用 |
| **反映作業のみ** | 「〜を更新/削除/移動/改名/廃止/置換/修正すること」のみを表す | 独立要件行として不採用 |
| **混合** | 変更後仕様の記述を含み、かつ反映作業も含む | 要件行として採用（反映作業部分は移送候補としてマーク） |

#### 処理ルール

1. 反映作業のみの候補は、独立した要件行として扱わない
2. 後続工程への移送候補として振り分ける: 対象REQ/ADR/SPEC等への UPDATE/APPEND、後続Caseの変更対象
3. `req-save` での検査: CREATE対象REQの保存前に反映作業のみの要件行が残っていないか検査し、検出時は保存を停止して該当行、判定理由、移送先を報告する

### HOW 除去後の acceptance-criteria 順位検証

機械的（単パス）な HOW 除去を実施した後、必ず acceptance criteria 順位による再検証を行う。
前工程で機械的に HOW を除去しても、完了条件を順位順に再照合しないと残余 violation が残る（OU-008/Wave 4 学習: 機械的除去後に8件の残余 violation を検出）。

#### 適用タイミング

| コマンド | タイミング |
|----------|-----------|
| `req-save` | HOW 除去（SPEC 相当行の SPEC 候補セクションへの分離）の完了後、保存前 |

#### 検証手順

1. **完了条件の展開**: 当該 REQ の必達要件、関連 Issue の完了条件を受け入れ基準単位に展開し、優先順位をつける
2. **順位順の検証**: 高優先度の完了条件から順に、REQ 要件行、SPEC、関連アーティファクトを照合し、HOW 残存がないか確認する
3. **残余検出時**: 機械的除去で見逃されたパターンを特定し、SPEC 候補セクションへの追加移送または要件行の修正を行う

#### 残余 violation の高頻度パターン

| パターン | 例 | 対応 |
|----------|----|------|
| 複数行にまたがる HOW 記述 | ステップ番号参照が別段落に分散 | 全文再読して参照関係を追跡 |
| 文脈依存の ID 参照 | 「当該 REQ」「上位 SPEC」等の代名詞的参照 | 具体的対象に置換または削除 |
| 間接的なスキル名直参照 | `agentdev-xxx` を要件文中に埋め込み | 機能概要へ置換 |
| 旧名称の残存 | diagnostics → inspect 改名前の名称 | 現行名称へ統一 |
| CLI 詳細の抽象化漏れ | コマンドライン引数、フラグ詳細 | 「外部実行ハーネス」等の抽象表現へ |
| ファイルパスの直接参照 | `src/opencode/...` 等の実装パス | 配置規約への参照へ置換 |

#### 判定ルール

- 機械的除去の単パスで完了とせず、必ず acceptance criteria 順位による再検証を実施する
- 残余 violation を検出した場合、検出件数、パターン、修正内容を保存ログとして残す（再発防止のため）
- 再検証で新たなパターンを発見した場合、本表中のパターンを拡充する（learning-capture 経由）

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

---

## REQ-ID 安定ID 規約

REQ-ID（`REQ-{NNNN}`）は安定IDであり、ファイル配置に依存しない。

- REQ-ID に area 情報を含めない（例: `REQ-core-0001` とはしない）
- REQ-ID は要件の分割、統合が発生しても変更しない

---

## REQ本文内メタデータ規約

REQ単位の関連情報は frontmatter フィールドとして管理せず、本文内に記述する。

| 項目 | 説明 |
|------|------|
| REQ-ID | `REQ-{NNNN}` |
| title | 要件タイトル |
| Status | retained/ partially superseded/ superseded |
| Related artifacts | 関連ドキュメントへの参照 |
| Related ADRs | 関連ADRへの参照 |
| Supersedes | この要件が置き換える旧要件 |
| Superseded by | この要件を置き換える新要件 |

---

## 関連情報管理

REQ間の関連、依存はREQ本文の「関連情報」セクションに記載する（frontmatterフィールドは使用しない）。

- **置き換え**: 旧REQを新REQに置き換える場合に記載
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

`REQ-{NNNN}-{MMM}` は要件行ID。
`{NNNN}` は親REQ番号、`{MMM}` は3桁ゼロ埋めの行連番（既存行の最大番号 + 1）。
採番ルールはREQ-IDと同様に欠番再利用禁止。

### APPEND条件

- 「要件」テーブルへの新規行追加（要件行ID採番: `REQ-{NNNN}-{MMM}`）
- 「適用範囲」への項目追加

### UPDATE条件

- 既存要件行の内容修正（テキスト置換、表現変更）
- frontmatter フィールドの変更（title変更等）
- 「目的」「適用範囲」セクションの内容修正

---

## テンプレート参照

要件定義テンプレートは以下のパスで参照可能:

@.opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md

テンプレート構成:
- **frontmatter**: `id`, `title`, `created`, `updated`
- **必須セクション**: `目的`, `要件`（テーブル形式）, `適用範囲`（対象/対象外）
- **補助セクション（任意）**: `SPEC候補` — req-define が REQ 要件行候補から分離した SPEC 相当行と想定配置先 SPEC を記載。req-save が REQ ファイル保存時に本セクションを除去し、内容は `draft-meta.spec-candidates` 経由で spec-save が消費する。最終 REQ ファイルに本セクションは残さない

---

## 検出事項と REQ の関係

要件レビューの検出事項は REQ ファイルへの保存操作ではなく、要件体系の再構成候補を一時的に保持する中間アーティファクトである。

- **保存先**: `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（REQファイルと同じ `docs/requirements/` には保存しない）
- **次工程**: 検出事項は req-define の明示入力ファイルとして渡され、正式な要件変更（CREATE/APPEND/UPDATE）に変換される
- **SPLIT 検出時**: req-save が SPLIT を検出した場合、保存可能範囲を実行した後に検出事項を作成する
- **詳細**: `agentdev-workflow-lifecycle` reference の `requirements-review-finding-protocol.md` を参照

---

## See Also

- **agentdev-req-analysis**: 要件分析手法（要件の展開観点、必達要件記述ガイダンス、壁打ちメソドロジー）
- **agentdev-adr-file-manager**: ADRファイル管理（REQ ↔ ADR整合性チェック）
- **agentdev-adr-guidelines**: ADR作成の必要性判定基準
- **agentdev-doc-writing**: ADR/REQ/SPEC横断の文書品質査読ゲート（文書種別責務、要件性、文意品質、粒度）

## マージ競合対応パターン

### REQファイル更新時のマージ競合対応

#### 1. 競合リスク状況

| 状況 | リスクレベル |
|------|-------------|
| 複数ユーザーが同時に同じREQを編集 | 高 |
| req-saveと手動編集が競合 | 中 |
| APPENDとUPDATEが同時に実行 | 中 |

**競合予防**: 更新前に `git pull --ff-only` で最新を取得し、`git status --porcelain` でローカル変更を確認。

#### 2. frontmatter競合の解決

- `created`: 古い日時を維持（変更禁止）
- `updated`: 最新の日時を採用
- `title`: 手動で統合

解決後は frontmatter バリデーションを実施（id/ファイル名一致、created ≤ updated）。

#### 3. 本文セクションの競合解決

| 競合パターン | 解決方法 |
|-------------|----------|
| 異なる要件行の追加 | 両方の要件行を追加（行順は要件番号順） |
| 同じ要件行の内容変更 | 手動で統合 |
| 要件行IDの重複 | 再採番（最大番号 + 1） |

目的セクション、適用範囲セクションの競合: 両方の内容を手動で統合し、意図が矛盾する場合は要件の分割、統合を検討。

**重要**: 自動的な競合解決は禁止。必ず手動解決をユーザーに依頼する。

#### 4. REQ更新失敗時の報告フォーマット

REQ更新時に競合やエラーが発生した場合:

```markdown
## REQ 更新失敗エラー

**REQ番号**: REQ-{NNNN}
**操作モード**: {CREATE/APPEND/UPDATE}
**失敗理由**: {競合発生 / file write error / etc}
**ユーザーアクション**: 手動で競合を解決してください
```



