---
name: agentdev-workflow-templates
description: Manages Issue/PR description and comment templates, selection rules, and section conventions for the agentdev command pipeline. USE FOR: determining which template to use for a given situation, reading template files, understanding template section structure. DO NOT USE FOR: workflow phase definitions, requirement analysis, architecture decisions.
---


# Issue テンプレート管理スキル

agentdev系コマンドで使用するIssue/PR本文、コメントテンプレートの管理、選定ルール、セクション規約を提供する。
テンプレートは Read tool で読み込み、変数部分を置換して使用する。

## テンプレート一覧

### Issue本文テンプレート

Issue 本文テンプレートは本文基本構造（目的、対象範囲・対象外、実現方針（条件付き）、完了条件、進行状況、結果（条件付き））を規定する。Epic Root は実行構成（`| Wave | Issue | 前提 | 状態 |` の一表）を加える。子 Issue 本文の冒頭行は `親Epic: #N` とする。様式の正は `workflows/issue-lifecycle-records` Design（Case Issue 工程記録モデル）であり、本スキルはテンプレート投影のセクション形式を提供する。本文テンプレートは Issue タイトルを規定せず、タイトル書式は `workflows/issue-title-policy` Design を参照する。

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

#### 基本項目と選定ルール

- 記録コメントの基本項目は 記録種別、対象工程、事実・結果、理由・根拠、次の行動、関連合意・成果物 とする。「理由・根拠」「関連合意・成果物」は非該当時に省略でき、必須項目は該当データがない場合も「該当なし」を記載しセクション自体は残す
- 種別別必須項目は上表のとおり。検証証拠には判定根拠が必須であり、検証詳細自体は重複記載せず成果物を参照する
- 投稿主体: 実行担当は報告のみを行い、記録コメントの投稿と本文進行状況・結果セクションの更新は取りまとめが実行する。実行の申告だけで完了扱いにしない
- 投稿前の必須項目検証は記録コメント検証スクリプト（`agentdev-workflow-case-run/scripts/record-comments.ts`、決定的処理）で行う。検証不備の本文は投稿しない
- 既存の対応記録コメントテンプレート（`issue_comment_feature_implementation.md`、`issue_comment_bug_record.md`）と共存する。対応記録コメントは work_type 別の詳細対応記録と検証差分セクションの置き場所であり、検証証拠コメントとの間で検証詳細を重複記載しない

#### セクション仕様

- 各テンプレートは基本セクションに種別別必須セクションを追加した構造とし、セクション見出しは `## ` 直下で統一する
- `<!-- 【必須】 -->` マーカー付きセクションは省略不可。種別別必須セクションの本文が空または「該当なし」の場合は検証不備として投稿を抑止する

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

PR 本文テンプレートに、ADF 実行の識別情報を構造化して記録する「実行識別情報」セクションを定義する。
Issue 本文には本セクションを設けない（実行単位・委譲単位・Case・GitHub Issue・PR・ADF 成果物は Issue 番号、親Epic 参照、実行構成表、Refs 行等の canonical 成果物関係から相関でき、本文へ一覧化しない）。
記録先割当と意味集合は v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節が正規所有し、本スキルはテンプレートセクション形式を提供する。

#### 対象テンプレートと記録内容

| テンプレート | 記録する識別情報 |
|---|---|
| `templates/case-revise/amendment-pr.md` | 対象 Case、実行単位 |
| `pr_desc.md` | 対象 Case、実行単位、委譲単位識別子 |

#### セクション仕様

- セクション見出しは「実行識別情報」とし、`<!-- 【必須】 -->` マーカー付きの必須セクションとする
- セクション本文は `adf_` 接頭辞付きの key-value 行（`- adf_{key}: {value}`）で構成する
- 機械的解析は本セクション内の key-value 行を正とし、自由文中に偶然出現する ID に依存しない
- 実行単位の識別は execution_unit 構成の既存定義に接続し、flow 種別（standard / epic）を記録する。対象 Issue 番号は Issue 番号、Parent 行、Refs 行等の canonical 成果物関係から導出し、重複記録しない
- 委譲単位識別子は `DEL-{N}-{seq}` 形式（N = Issue 番号、seq = 同一 Issue への委譲連番）とし、ADF が発行する識別子を正規手段とする
- harness 側識別子（OpenCode session ID 等）は任意キー `adf_harness_ref` に限定し、取得可能な場合の付加情報としてのみ記録する。必須契約としない
- 識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない
- 値の記録は識別子中心で行う（Issue 番号、PR 番号、commit SHA、REQ/Decision/Design の識別子等）

#### key 一覧

| key | 対象 | 意味 |
|---|---|---|
| `adf_case` | Issue / PR | 対象 Case の Issue 番号（#N）。Standard flow では本 Issue、Epic flow では親 Epic Issue、PR では関連Issue の番号 |
| `adf_execution_unit` | Issue / PR | 実行単位の flow 種別（standard / epic）。対象 Issue 番号は canonical 成果物関係（Issue 番号、Parent 行、Refs 行）から導出する |
| `adf_delegation` | PR | 委譲単位識別子（DEL-{N}-{seq}）。委譲 prompt から転記 |
| `adf_harness_ref` | Issue / PR | 任意。harness 側識別子。取得可能な場合のみ |

#### 配置規則と適用範囲

- PR テンプレートでは「概要」セクションの直後に配置する
- 本セクションは新規作成の PR にのみ適用し、既存 PR への遡及適用は行わない

### 検証差分セクション（PR テンプレート形式）

PR 本文テンプレートに、検証の構造化記録を行う「検証差分」セクションを定義する。
記録先割当と意味集合は v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節（PR 本文: 検証種別と検証結果）が正規所有し、本スキルはテンプレートセクション形式を提供する。

#### 対象テンプレートと記録内容

| テンプレート | 記録する検証情報 |
|---|---|
| `pr_desc.md` | 実行工程、検証種別、検証結果、finding 差分（新規、修正済み、既出、撤回、無効） |

#### セクション仕様

- セクション見出しは「検証差分」とし、`<!-- 【必須】 -->` マーカー付きの必須セクションとする
- セクション本文はテーブル形式とし、1行に1検証を記録する
- 列構成は 実行工程 / 検証種別 / 検証結果 / 新規 / 修正済み / 既出 / 撤回 / 無効 の8列とする
- 実行工程には検証を実施した ADF 工程（case-run、case-close、レビュー等）を記録する
- PR 単位の実行結果（result 契約の4状態）は canonical 成果物関係から判別する（PR の存在が completed-pr、blocked / failed / delegation-unavailable は Issue コメント SSoT）。本セクションは検証単位の実行結果（検証結果）を記録する
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

#### 検証証跡の必須要素

件数突合系の gate は、種類ごとに実行する。各実行の `stdout` と `stderr` を分けて保存し、検証差分には保存先、終了コード、checker の版、検査範囲、実行環境を記録する。checker 固有の追加要件は v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に従う。

#### 共存と所有境界

- 本セクションは case-run の PR 本文 Findings セクション（intake / learning 小見出し）を置換せず共存する。検証で発見した intake / learning 候補は Findings セクションへ記録し、本セクションには検証種別・検証結果・finding 差分を記録する
- 対論型レビュー（adversarial-review）の審議中 finding 状態の追跡と、品質ゲート完了報告における欠陥類型単位の修正証跡の所有境界を変更しない。本セクションはこれらの記録を代替しない
- 本セクションは新規作成の PR にのみ適用し、既存 PR への遡及適用は行わない

#### 配置規則

- PR テンプレートでは「品質メトリクス」セクションの直後、「Findings/ Capture候補」セクションの前に配置する

### review_dispositions の消費（Issue 本文への転記廃止）

case-open / case-ready は draft-data の `review_dispositions` を Issue 本文へ全件転記しない。

- 採用内容（accepted disposition）は実行契約の該当章（対象範囲、実現方針、完了条件の検証方法）へ反映する
- 必要な採否理由（後から判断根拠を確認する必要があるもの）だけをコメントへ残す
- review_dispositions の構造（id、disposition、reason_code、reason、evidence）の正は既存の正規所有先（artifact-contracts Design「req_draft 出力構造」節）のままとし、本変更でスキーマを変更しない。Issue 本文へ転記用の同型セクションを定義しない

### Case Issue 工程記録テンプレート（進行状況・結果セクション）

Case Issue 本文テンプレートに、工程記録の「進行状況」「結果」セクションを定義する。
セクション名・順序・項目様式の正は `workflows/issue-lifecycle-records` Design（Case Issue 工程記録モデル）であり、本節はテンプレート投影のセクション形式を提供する。

#### 対象テンプレートと配置

| テンプレート | 常設セクション | 条件付きセクション |
|---|---|---|
| `templates/case-open/root-case.md` | 目的、対象範囲・対象外、完了条件、進行状況 | 実現方針、結果（該当時のみ追加。章を常設しない） |
| `templates/case-ready/root-case.md` | 目的、対象範囲・対象外、完了条件、進行状況 | 実現方針、結果（該当時のみ追加。章を常設しない） |
| `issue_desc_feature.md` / `issue_desc_bug.md` | 目的、対象範囲・対象外、完了条件、進行状況 | 実現方針、結果（該当時のみ追加） |
| `issue_desc_epic.md` | 目的、対象範囲・対象外、実行構成、完了条件、進行状況 | 実現方針、結果（該当時のみ追加） |
| `issue_desc_child.md` | 親Epic: #N（冒頭行）、目的、対象範囲・対象外、完了条件、進行状況 | 実現方針、結果（該当時のみ追加） |

#### セクション仕様

- セクション見出しは「進行状況」「結果」とし、進行状況は `<!-- 【必須】 -->` マーカー付きの必須セクションとする。結果は完了・中止確定時にのみ作成する非常設セクションであり、起票時の本文には含めない
- 「進行状況」は 正規状態（Root Case のみ。open、ready、running、blocked、review、closed、cancelled の7値域。値の正は workflows/v4-lifecycle-state-machine Design）と 開始日時・終了日時 を key-value 行（`- {key}: {value}`）で保持する。Child Issue は開始日時・終了日時のみを保持する（子状態は親 Epic の実行構成表が所有する）
- 表示用の進行状態4値、現在工程、担当役割、次の行動、最新記録参照、停止・待機理由は保存しない
- 「結果」は 成果物 と 残件の扱い を key-value 行で保持する。終了状態は進行状況の正規状態が正であり、重複保存しない
- 開始日時は初めて実装または検証に実着手した時刻（case-run で設定）であり、停止・再開で上書きしない。終了日時は Root Case は完了または中止確定時、Child は completed 確定時にのみ設定する
- 完了判定は case-close 等の判定主体が完了条件と証拠を照合して確定し、実行の申告だけで完了扱いにしない。case-run は完了条件チェックボックスを更新しない
- 本セクションは新規作成 Issue にのみ適用し、既存 Issue への遡及適用は行わない

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

関数削除を要求する完了条件の書き方標準である。
共用関数の包括的削除による破壊的変更を防止する（PR #1140 / #1139 Epic #1138 由来）。

- 関数削除を要求する完了条件は対象スコープ（例: 「from checkX」「IR-{NNN} 由来の context exemption」）を明記すること
- 関数名列挙による完全削除の代用を禁止する。共用関数、cross-cutting helper は複数 checker から参照される可能性があり、定義削除前に全使用箇所を確認すること
- 完了条件の checkbox は「対象スコープの明示」と「全使用箇所の確認証拠」を含むこと

## See Also

- [agentdev-req-file-manager](../agentdev-req-file-manager/SKILL.md)（REQファイル管理。doc_requirement.md テンプレート）
- [agentdev-decision-file-manager](../agentdev-decision-file-manager/SKILL.md)（Decisionファイル管理。doc_decision.md テンプレート）
