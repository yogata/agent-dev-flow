---
name: agentdev-workflow-templates
description: Manages Issue/PR description and comment templates, selection rules, and section conventions for the agentdev command pipeline. USE FOR: determining which template to use for a given situation, reading template files, understanding template section structure. DO NOT USE FOR: workflow phase definitions, requirement analysis, architecture decisions.
---


# Issue テンプレート管理スキル

本スキルは骨格（制御フロー）と references/ 詳細仕様の2層構成である。本文はテンプレート一覧・選定ルール・共通ルールを保持し、セクション形式の詳細仕様は references/ 配下へ分離している。通常経路で全 reference を無条件読込せず、必要な条件に応じて遅延読み込みする。
agentdev系コマンドで使用するIssue/PR本文、コメントテンプレートの管理、選定ルール、セクション規約を提供する。
テンプレートは Read tool で読み込み、変数部分を置換して使用する。

## テンプレート一覧

### Issue本文テンプレート

Issue 本文テンプレートは本文基本構造（目的、対象範囲・対象外、実現方針（条件付き）、完了条件、進行状況、結果（条件付き））を規定する。Epic Root は実行構成（`| Wave | Issue | 前提 | 状態 |` の一表）を加える。子 Issue 本文の冒頭行は `親Epic: #N` とする。様式の正は `workflows/issue-lifecycle-records` Design（Case Issue 工程記録モデル）であり、本スキルはテンプレート投影のセクション形式を提供する。本文テンプレートは Issue タイトルを規定せず、タイトル書式は `workflows/issue-title-policy` Design を参照する。

実行契約に未決判断に依存する部分（保留）や利用者が明示的に許可した試作の区別を記録する場合も、専用セクションを新設せず既存欄で表現する（保留の対象と理由は「対象範囲・対象外」の対象外記述、保留の合格条件と試作を正式採用と区別する条件は「完了条件」の検証方法・合格条件記述）。専用記録欄の非新設は既存の対象外事項（新たな判断工程・台帳の設置をしない方針）と整合する。

| テンプレート | 用途 | 対象コマンド |
|---|---|---|
| `issue_desc_feature.md` | Standard Case 本文（機能追加・変更） | case-open |
| `issue_desc_bug.md` | Standard Case 本文（バグ修正） | case-open |
| `issue_desc_epic.md` | Epic Root 本文（実行構成一表を含む） | case-ready |
| `issue_desc_child.md` | 子 Issue 本文（冒頭 `親Epic: #N`） | case-ready |

### コメントテンプレート

| テンプレート | 用途 | 対象コマンド | タイミング |
|---|---|---|---|
| `issue_comment_bug_analysis.md` | バグ分析結果 | case-open | Issue作成後コメント (バグ修正、軽微変更/リファクタリング、保守作業/ドキュメント、雑務) |
| `issue_comment_feature_technical.md` | 技術検討結果 | case-open | Issue作成後コメント (機能追加) |
| `issue_comment_review_ng.md` | レビューNG記録 | - | レビューNG時コメント |
| `issue_comment_feature_implementation.md` | 実装記録 | case-close | PRマージ後コメント (機能追加) |
| `issue_comment_bug_record.md` | 対応記録 | case-close | PRマージ後コメント (バグ修正、軽微変更/リファクタリング、保守作業/ドキュメント、雑務) |
| `issue_comment_record_hold.md` | 工程記録（停止） | case-run | 確定した停止を報告された時点（途中報告を含む） |
| `issue_comment_record_decision_change.md` | 工程記録（判断変更） | case-run | 確定した判断変更・判断待ちを報告された時点 |
| `issue_comment_record_completion.md` | 工程記録（検証証拠） | case-run / case-close | 検証のみで完了する Issue の証拠を記録する時 |

着手・引き渡し・再開を契機とするコメントは生成せず、対応するテンプレート実体は廃止した。記録対象の正は `workflows/issue-lifecycle-records` Design「コメント種別と実装語彙」節である。

コメントテンプレートの本文は Read tool で読み込んで変数置換し、Custom Tool `agentdev_gh` の comment_create 操作で投稿する。テンプレートファイル名 `issue_comment_*.md` は用途識別子であり、Tool 操作名を指さない。

### 工程記録コメントテンプレート（Case Issue 記録契機）

Case Issue の工程記録（記録様式の正は workflows/issue-lifecycle-records Design）を投稿する際の記録種別別テンプレート。取りまとめ（実行担当の報告を受けた進行側工程）が投稿する。

#### 記録契機とテンプレートの対応

| 記録契機 | テンプレート | 投稿主体 | 種別別必須項目 |
|---|---|---|---|
| 停止 | `issue_comment_record_hold.md` | case-run | 再開条件 |
| 判断変更 | `issue_comment_record_decision_change.md` | case-run | 撤回対象 |
| 検証証拠 | `issue_comment_record_completion.md` | case-run / case-close | 判定根拠 |

着手・引き渡し・再開は記録契機ではない。これらの契機でコメントを生成せず、進行状況の開始日時（初回実着手）と本文・PR で工程移行を表現する。

記録コメントの基本項目・選定ルール・セクション仕様の詳細は [references/record-comments-and-criteria.md](references/record-comments-and-criteria.md) を参照（遅延読み込み）。

### case-open テンプレート（Root Case 用）

| テンプレート | 用途 | 対象コマンド | 適用対象 |
|---|---|---|---|
| `templates/case-open/root-case.md` | Root Case Issue 本文 | case-open | 全 Case |
| `templates/case-open/root-case-report.md` | Root Case 完了報告 | case-open | 全 Case |

### case-ready テンプレート（Root Case 用）

| テンプレート | 用途 | 対象コマンド | 適用対象 |
|---|---|---|---|
| `templates/case-ready/root-case.md` | Root Case Issue 本文（実現方針と完了条件を case-ready が確定して更新する構造） | case-ready | 全 Case |
| `templates/case-ready/root-case-report.md` | Root Case 完了報告 | case-ready | 全 Case |

### case-revise テンプレート

| テンプレート | 用途 | 対象コマンド | 適用対象 |
|---|---|---|---|
| `templates/case-revise/amendment-pr.md` | 設計修正PR本文（実変更がある場合のみ作成） | case-revise | 実変更がある Case |
| `templates/case-revise/root-case-report.md` | Root Case 完了報告 | case-revise | 全 Case |

### PR本文テンプレート

| テンプレート | 用途 | 対象コマンド |
|---|---|---|
| `pr_desc.md` | PR本文 | case-run |

### PR本文必須セクション（pr_desc.md）

| セクション | マーカー | 記述ルール | 該当なし時 |
|---|---|---|---|
| 概要 | 【必須】 | Issueの要約 | - |
| 実行識別情報 | 【必須】 | 構造化識別情報セクション形式（後述「実行識別情報セクション」参照） | - |
| 実装内容 | 【必須】 | 実装内容の概要 | - |
| 完了条件 | 【必須】 | チェックボックス形式 | - |
| テスト結果 | 【必須】 | テスト結果の概要に加え、テスト実行形態として実行 cwd と起動コマンド形式（./ prefix・パス指定を含む）を記録する | 「該当なし」 |
| 品質メトリクス | 【必須】 | テーブル形式（メトリクス/結果/基準/判定） | - |
| 検証差分 | 【必須】 | 検証差分セクション形式（後述「検証差分セクション」参照）。実行工程、検証種別、検証結果、finding 差分の5分類を1行1検証のテーブルで記録する | 「該当なし」 |
| Findings/ Intake候補 | 【必須】 | case-run で発見した本筋外 Finding（intake候補、learning候補）を記録。各項目に発見元、内容、分類（intake/learning）を含める | 「該当なし」 |
| Design確定候補 | 【任意】 | case-run/ driver が実装時に発見した Design レベルの詳細（schema、enum、判定表、内部アルゴリズム等）。`Findings / Capture候補` とは別セクション。case-close STEP-3 の Design 状態評価（棚卸し制）への補助入力となる（棚卸し列挙が正、申告の不在で棚卸しは省略されない） | セクションごと省略 |

### 実行識別情報セクション（PR テンプレート形式）

PR 本文テンプレートに、ADF 実行の識別情報を構造化して記録する「実行識別情報」セクションを定義する。対象テンプレートは `templates/case-revise/amendment-pr.md` と `pr_desc.md` であり、PR テンプレートでは「概要」セクションの直後に配置する。Issue 本文には本セクションを設けない。
key 一覧（`adf_case`、`adf_execution_unit`、`adf_delegation`、`adf_harness_ref`）とセクション仕様の詳細は [references/execution-identity-section.md](references/execution-identity-section.md) を参照（遅延読み込み）。

### 検証差分セクション（PR テンプレート形式）

PR 本文テンプレートに、検証の構造化記録を行う「検証差分」セクションを定義する。対象テンプレートは `pr_desc.md` のみであり、PR テンプレートでは「品質メトリクス」セクションの直後、「Findings/ Capture候補」セクションの前に配置する。検証証跡の必須要素は件数突合系 gate ごとの stdout/stderr 退避・終了コード・checker 版・検査範囲・実行環境の記録である。
列構成、finding 差分の5分類（新規、修正済み、既出、撤回、無効）、工程間比較規則、共存と所有境界の詳細は [references/verification-diff-section.md](references/verification-diff-section.md) を参照（遅延読み込み）。

### Case Issue 工程記録テンプレート（進行状況・結果セクション）

Case Issue 本文テンプレートに、工程記録の「進行状況」「結果」セクションを定義する。「進行状況」は正規状態と開始日時・終了日時を key-value 行で保持する常設必須セクションであり、「結果」は完了・中止確定時にのみ作成する非常設セクションである。case-open / case-ready は draft-data の `review_dispositions` を Issue 本文へ全件転記しない。
対象テンプレート別の常設・条件付きセクション表、セクション仕様、review_dispositions の消費規則の詳細は [references/issue-progress-sections.md](references/issue-progress-sections.md) を参照（遅延読み込み）。

### reference 選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| PR 本文の実行識別情報セクションの key 一覧・セクション仕様・配置規則が必要な場合 | [references/execution-identity-section.md](references/execution-identity-section.md) |
| PR 本文の検証差分セクションの列構成・5分類・工程間比較規則が必要な場合 | [references/verification-diff-section.md](references/verification-diff-section.md) |
| Case Issue 本文の進行状況・結果セクション様式や review_dispositions の消費規則が必要な場合 | [references/issue-progress-sections.md](references/issue-progress-sections.md) |
| 工程記録コメントの基本項目・セクション仕様や完了条件書き方ガイドが必要な場合 | [references/record-comments-and-criteria.md](references/record-comments-and-criteria.md) |

### テンプレートパス

テンプレートファイルは以下のパスに配置される:

```
.opencode/skills/agentdev-workflow-templates/templates/
```

## 選定ルール

### Issue作成時のテンプレート選定（case-open）

| 条件 | 本文テンプレート |
|------|-----------------|
| 全 work_type（Root Case） | `templates/case-open/root-case.md` |

Root Case 本文は work_type によらず同一テンプレートを使用する。
work_type は Definition Package の属性として記録し、ラベル付与と設計PRの実変更判定（bugfix 等の実変更なし Case では PR 不作成）に用いる。
work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照する。

本文テンプレートは Issue 本文の構造のみを規定し、Issue タイトルを規定しない。テンプレート例・変数値にタイトル書式を複製せず、起票時のタイトル書式と付与・更新の場面は `<workflows/issue-title-policy>` Design（Issue タイトル記述規則）を参照する。

### Issueクローズ時のテンプレート選定（case-close）

| 条件 | コメントテンプレート |
|------|---------------------|
| feature | `issue_comment_feature_implementation.md` |
| その他（non-feature (bugfix/maintenance/docs_chore)） | `issue_comment_bug_record.md` |

### 完了報告時のテンプレート選定（case-open）

| 条件 | 完了報告テンプレート |
|------|---------------------|
| Root Case（全 Case） | `templates/case-open/root-case-report.md` |

### 完了報告時のテンプレート選定（case-ready）

| 条件 | 完了報告テンプレート |
|------|---------------------|
| Root Case（全 Case） | `templates/case-ready/root-case-report.md` |

### 共通ルール

- テンプレートは Read tool で読み込み、変数部分を置換して使用する
- 変数置換後の本文は文字列変数での持ち回りによらず Custom Tool `agentdev_gh` の操作引数として渡す。文字コード・一時ファイル操作の実装詳細は Tool 内部に隠蔽される
- テンプレートの構造を維持する（セクションの削除、順序変更禁止）。Markdown 行構造（LF、セクション間空行、インデント）の byte 単位保持を含む
- 変数に該当するデータがない場合、そのセクションに「該当なし」と記載する（セクションごと削除しない）
- セクション見出しは日本語で記述する
- `<!-- 【必須】 -->` マーカー付きセクションは省略不可。ただし該当データがない場合は「該当なし」と記載し、セクション自体は残す
- `<!-- 【任意】 -->` マーカー付きセクションはセクション単位で丸ごと省略できる

### 必須セクション検証

本文の必須セクション検証は、`<!-- 【必須】 -->` マーカーに基づいて行う:

- `<!-- 【必須】 -->` が見出し行の直後にある場合、その見出しが必須セクション
- 検証対象は見出し行（`## ...`）の文字列一致

## 完了条件書き方ガイド

関数削除を要求する完了条件の書き方標準は [references/record-comments-and-criteria.md](references/record-comments-and-criteria.md)「完了条件書き方ガイド」を参照（遅延読み込み）。

## See Also

- [agentdev-req-file-manager](../agentdev-req-file-manager/SKILL.md)（REQファイル管理。doc_requirement.md テンプレート）
- [agentdev-decision-file-manager](../agentdev-decision-file-manager/SKILL.md)（Decisionファイル管理。doc_decision.md テンプレート）
