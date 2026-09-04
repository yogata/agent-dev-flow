---
name: agentdev-workflow-templates
description: Manages Issue/PR description and comment templates, selection rules, and section conventions for the agentdev command pipeline. USE FOR: determining which template to use for a given situation, reading template files, understanding template section structure. DO NOT USE FOR: workflow phase definitions, requirement analysis, architecture decisions.
---

# Issue テンプレート管理スキル

agentdev系コマンドで使用するIssue/PR本文、コメントテンプレートの管理、選定ルール、セクション規約を提供する。
テンプレートは Read tool で読み込み、変数部分を置換して使用する。

## テンプレート一覧

### Issue本文テンプレート

| テンプレート | 用途 | 対象コマンド | work_type |
|---|---|---|---|
| `issue_desc_feature.md` | 機能追加、変更 | case-open | feature |
| `issue_desc_bug.md` | バグ修正 | case-open | bugfix |
| `issue_desc_epic.md` | Epic Issue本文 | case-open | feature (Epic) |
| `issue_desc_child.md` | 子Issue本文 | case-open | feature (Epic) |

### コメントテンプレート

| テンプレート | 用途 | 対象コマンド | タイミング |
|---|---|---|---|
| `issue_comment_bug_analysis.md` | バグ分析結果 | case-open | Issue作成後コメント (バグ修正、軽微変更/リファクタリング、保守作業/ドキュメント、雑務) |
| `issue_comment_feature_technical.md` | 技術検討結果 | case-open | Issue作成後コメント (機能追加) |
| `issue_comment_update.md` | 進捗更新 | case-update | Issue更新時コメント |
| `issue_comment_review_ng.md` | レビューNG記録 | case-update | レビューNG時コメント |
| `issue_comment_feature_implementation.md` | 実装記録 | case-close | PRマージ後コメント (機能追加) |
| `issue_comment_bug_record.md` | 対応記録 | case-close | PRマージ後コメント (バグ修正、軽微変更/リファクタリング、保守作業/ドキュメント、雑務) |

### case-open 完了報告テンプレート

| テンプレート | 用途 | 対象コマンド | flow |
|---|---|---|---|
| `templates/case-open/standard.md` | Standard flow 完了報告 | case-open | Standard flow |
| `templates/case-open/epic.md` | 単一REQ Epic flow 完了報告 | case-open | Epic flow（単一REQ） |
| `templates/case-open/multi-req-epic.md` | マルチREQ Epic flow 完了報告 | case-open | Epic flow（マルチREQ） |

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
| Design確定候補 | 【任意】 | case-run/ driver が実装時に発見した Design レベルの詳細（schema、enum、判定表、内部アルゴリズム等）。`Findings / Capture候補` とは別セクション。case-close STEP-3 の Design 確定チェック入力となる | セクションごと省略 |

### 実行識別情報セクション（Issue/PR テンプレート共通形式）

Issue 本文テンプレートと PR 本文テンプレートに、ADF 実行の識別情報を構造化して記録する「実行識別情報」セクションを定義する。
記録先割当と意味集合は workflow-contracts Design「ADF 実行識別情報の記録契約」が正規所有し、本スキルはテンプレートセクション形式を提供する。

#### 対象テンプレートと記録内容

| テンプレート | 記録する識別情報 |
|---|---|
| `issue_desc_feature.md` | 対象 Case、ADF 工程、実行単位、前工程で確定した事項 |
| `issue_desc_bug.md` | 対象 Case、ADF 工程、実行単位、前工程で確定した事項 |
| `issue_desc_epic.md` | 対象 Case、ADF 工程、実行単位、前工程で確定した事項 |
| `issue_desc_child.md` | 対象 Case、ADF 工程、実行単位、前工程で確定した事項 |
| `pr_desc.md` | 対象 Case、PR、実行単位、委譲単位識別子と委譲目的、実行結果 |

#### セクション仕様

- セクション見出しは「実行識別情報」とし、`<!-- 【必須】 -->` マーカー付きの必須セクションとする
- セクション本文は `adf_` 接頭辞付きの key-value 行（`- adf_{key}: {value}`）で構成する
- 機械的解析は本セクション内の key-value 行を正とし、自由文中に偶然出現する ID に依存しない
- 実行単位の識別は execution_unit 構成の既存定義（standard / epic と Issue 番号）に接続し、新規の識別体系を並立させない
- 委譲単位識別子は `DEL-{N}-{seq}` 形式（N = Issue 番号、seq = 同一 Issue への委譲連番）とし、ADF が発行する識別子を正規手段とする
- harness 側識別子（OpenCode session ID 等）は任意キー `adf_harness_ref` に限定し、取得可能な場合の付加情報としてのみ記録する。必須契約としない
- 識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない
- 値の記録は識別子中心で行う（Issue 番号、PR 番号、commit SHA、REQ/Decision/Design の識別子等）

#### key 一覧

| key | 対象 | 意味 |
|---|---|---|
| `adf_case` | Issue / PR | 対象 Case の Issue 番号（#N） |
| `adf_phase` | Issue | 当該記録を生成した ADF 工程 |
| `adf_execution_unit` | Issue / PR | 実行単位（standard:#N または epic:#N） |
| `adf_upstream_confirmed` | Issue | 前工程で確定した事項（識別子中心） |
| `adf_pr` | PR | 本 PR の番号（#N） |
| `adf_delegation` | PR | 委譲単位識別子（DEL-{N}-{seq}）と委譲目的。委譲 prompt から転記 |
| `adf_result` | PR | 実行結果（result 契約の4状態） |
| `adf_harness_ref` | Issue / PR | 任意。harness 側識別子。取得可能な場合のみ |

#### 配置規則と適用範囲

- Issue テンプレートでは「概要」セクション（bug テンプレートでは「説明」セクション）の直後に配置する
- PR テンプレートでは「概要」セクションの直後に配置する
- 本セクションは新規作成の Issue / PR にのみ適用し、既存 Issue / PR への遡及適用は行わない

### 検証差分セクション（PR テンプレート形式）

PR 本文テンプレートに、検証の構造化記録を行う「検証差分」セクションを定義する。
記録先割当と意味集合は workflow-contracts Design「ADF 実行識別情報の記録契約」（PR 本文: 検証種別と検証結果）が正規所有し、本スキルはテンプレートセクション形式を提供する。

#### 対象テンプレートと記録内容

| テンプレート | 記録する検証情報 |
|---|---|
| `pr_desc.md` | 実行工程、検証種別、検証結果、finding 差分（新規、修正済み、既出、撤回、無効） |

#### セクション仕様

- セクション見出しは「検証差分」とし、`<!-- 【必須】 -->` マーカー付きの必須セクションとする
- セクション本文はテーブル形式とし、1行に1検証を記録する
- 列構成は 実行工程 / 検証種別 / 検証結果 / 新規 / 修正済み / 既出 / 撤回 / 無効 の8列とする
- 実行工程には検証を実施した ADF 工程（case-run、case-close、レビュー等）を記録する
- PR 単位の実行結果は「実行識別情報」セクションの `adf_result` が正であり、本セクションは検証単位の実行結果（検証結果）を記録する
- finding の特定は要約と参照（セクション名、Issue コメント、PR 本文内位置等）で行う
- 各分類に該当する finding がない場合は「該当なし」と記載する

#### finding 差分の5分類

| 分類 | 意味 |
|---|---|
| 新規 | 前段階の同種検証で検出されていなかった finding。前段階の同種検証が存在しない初回検証では、検出された全 finding を新規として記録する |
| 修正済み | 前段階で検出済みの finding が当該検証時点で修正されたことを確認したもの |
| 既出 | 前段階で検出済みで、当該検証でも未解決のまま再検出されたもの |
| 撤回 | 起票側または審議の結果として撤回されたもの（「撤回または無効となった finding」の内訳） |
| 無効 | 誤検出、検証対象外等により無効と判定されたもの（「撤回または無効となった finding」の内訳） |

#### 工程間比較規則

- 同じ種類の検証が複数工程で行われた場合は、工程ごとに行を並べる。各行の finding 分類を前段階の行と読み比べることで、後続検証が追加価値を持ったかを後から判定できる
- case-run の検証行は実行担当サブエージェントが PR 作成時に PR 本文へ記録する（実行工程: case-run）
- case-close の検証行（QG-4 完了条件評価、docs 検証、配布依存境界 最終 gate、トレーサビリティ独立再検査等）は対応記録コメントへ本セクションと同一形式で記録する（実行工程: case-close）。前段階（case-run）の PR 本文記録との差分で各 finding を分類する

#### 共存と所有境界

- 本セクションは case-run の PR 本文 Findings セクション（intake / learning 小見出し）を置換せず共存する。検証で発見した intake / learning 候補は Findings セクションへ記録し、本セクションには検証種別・検証結果・finding 差分を記録する
- 対論型レビュー（adversarial-review）の審議中 finding 状態の追跡と、品質ゲート完了報告における欠陥類型単位の修正証跡の所有境界を変更しない。本セクションはこれらの記録を代替しない
- 本セクションは新規作成の PR にのみ適用し、既存 PR への遡及適用は行わない

#### 配置規則

- PR テンプレートでは「品質メトリクス」セクションの直後、「Findings/ Capture候補」セクションの前に配置する

### review_dispositions 証跡セクション（Issue本文テンプレート）

case-open が draft-data の `review_dispositions` を読み取り、Issue 本文の「レビュー判断」セクションへ恒久証跡として転記する（AG-{NNN}、AG-{NNN}）。

#### 対象テンプレートと内容

| テンプレート | work_type | セクション内容 |
|---|---|---|
| `issue_desc_feature.md` | feature | 全 disposition 明細（`<!-- 【必須】 -->`） |
| `issue_desc_bug.md` | bugfix | 全 disposition 明細（`<!-- 【必須】 -->`） |
| `issue_desc_epic.md` | feature (Epic) | 全 disposition 明細（`<!-- 【必須】 -->`）。Epic flow の場合は全 disposition を Epic Issue へ転記 |
| `issue_desc_child.md` | feature (Epic child) | 親 Epic Issue 参照のみ（明細重複転記なし、`<!-- 【必須】 -->`、「該当なし」不使用） |

#### セクション仕様

「レビュー判断」セクションは `<!-- 【必須】 -->` マーカー付きの必須セクションとする。
feature、bug、epic テンプレートでは転記対象 disposition がない場合「該当なし」と記載する。
child テンプレートでは「該当なし」を使用せず、親 Epic Issue 参照のみを記載する。

各 disposition 明細は id（`RD-NNN`）、disposition、reason_code、reason、evidence（path、section、checked_at_commit）を記載する。
`checked_at_commit` は case-open が default branch 最新化後に再確認した commit SHA を記録する。

#### 配置規則

feature、bug、child テンプレートでは「テスト戦略」セクションの直後、「補足情報」セクションの前に配置する。
epic テンプレートでは「完了条件」セクションの直後、「補足情報」セクションの前に配置する。

#### 転記規則（AG-{NNN}）

- 単一 Standard Issue: 全 disposition を当該 Issue へ転記
- Epic flow: 全 disposition を Epic Issue へ転記。子 Issue へは重複転記しない
- 複数 Standard Issue: 各 Issue の OU、変更対象に関連する disposition を当該 Issue へ転記。ドラフト全体の disposition はルート Issue（`recommended_order` 最小）へ転記

### テンプレートパス

テンプレートファイルは以下のパスに配置される:

```
.opencode/skills/agentdev-workflow-templates/templates/
```

## 選定ルール

### Issue作成時のテンプレート選定（case-open）

| 条件 | 本文テンプレート | コメントテンプレート |
|------|-----------------|---------------------|
| bugfix | `issue_desc_bug.md` | `issue_comment_bug_analysis.md` |
| feature | `issue_desc_feature.md` | `issue_comment_feature_technical.md` |
| maintenance | `issue_desc_feature.md` | `issue_comment_bug_analysis.md` |
| docs_chore | `issue_desc_feature.md` | `issue_comment_bug_analysis.md` |
| Epic フロー | `issue_desc_epic.md` | work_type に応じて子Issueと同一ルール適用 |

### Issueクローズ時のテンプレート選定（case-close）

| 条件 | コメントテンプレート |
|------|---------------------|
| feature | `issue_comment_feature_implementation.md` |
| その他（non-feature (bugfix/maintenance/docs_chore)） | `issue_comment_bug_record.md` |

### 完了報告時のテンプレート選定（case-open）

| 条件 | 完了報告テンプレート |
|------|---------------------|
| Standard flow | `templates/case-open/standard.md` |
| Epic flow（単一REQ） | `templates/case-open/epic.md` |
| Epic flow（マルチREQ） | `templates/case-open/multi-req-epic.md` |

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

関数削除を要求する完了条件の書き方標準である。
共用関数の包括的削除による破壊的変更を防止する（PR #1140 / #1139 Epic #1138 由来）。

- 関数削除を要求する完了条件は対象スコープ（例: 「from checkX」「IR-{NNN} 由来の context exemption」）を明記すること
- 関数名列挙による完全削除の代用を禁止する。共用関数、cross-cutting helper は複数 checker から参照される可能性があり、定義削除前に全使用箇所を確認すること
- 完了条件の checkbox は「対象スコープの明示」と「全使用箇所の確認証拠」を含むこと

## See Also

- [agentdev-req-file-manager](../agentdev-req-file-manager/SKILL.md)（REQファイル管理。doc_requirement.md テンプレート）
- [agentdev-decision-file-manager](../agentdev-decision-file-manager/SKILL.md)（Decisionファイル管理。doc_decision.md テンプレート）
- **agentdev-doc-writing**: Decision/REQ/Design横断の文書品質査読ゲート（文書種別責務、要件性、文意品質、粒度）

