---
title: req-define SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-19
---

# req-define SPEC

## 目的

機能追加またはバグ修正の要件を壁打ちにより整理、定義し、構造化 `draft-data` 形式の要件 doc（`.agentdev/drafts/req-draft-{topic-slug}.md`）を生成する。
壁打ちフェーズで使用。

## 承認・HITL 境界

- 壁打ち対話そのものが主要 HITL である（要件の深掘り、合意形成をユーザーとの対話で行う、REQ-004）。
- auto_gate の未解決 item 解消方策は壁打ちで合意する（解消時は `auto_ready: true` へ更新。ユーザーが明示的に false を選択した場合は `conflict_resolutions` に記録して継続する）。
- 生成した要件doc は提示のみとし、承認は求めない（後続の req-save / case-open へそのまま渡す）。

## 入力

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）
- ユーザーが明示した入力ファイル: 設計メモ、調査メモ、RU（`.agentdev/backlog/req-units/RU-*.md`）。全て参照専用入力
- req-save SPLIT 検出時の検出事項（`.agentdev/drafts/requirements-review-finding-{topic-slug}.md`）
- inspect-skills 診断結果の検出事項（`.agentdev/inspect/inbox/inspect-skills-finding-{topic-slug}.md`）。参照専用入力
- promoted 直読み禁止: `.agentdev/intake/promoted/`、`.agentdev/learning/promoted/` は直接読み込まない

## 出力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（全 work_type 共通、構造化 `draft-data` 形式: REQ-008, DEC-003）

## 副作用

- ファイル作成: `.agentdev/drafts/req-draft-{topic-slug}.md` のみ
- git 操作: 実行しない（G08）
- Issue 作成: 行わない（後続 case-open 責務）

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-req-define`）が正規情報源である。

- セッションコンテキスト検知（引数なし単体実行時のみ）（当該セッション履歴、現在コンテキストを Requirement Source 候補として評価）
- 明示入力ファイル読込（指定時）（RU 自動検出を含む）
- 壁打ち対話（`agentdev-req-analysis` に従い深掘り）
  - 前工程からの引き継ぎ判定（`agentdev_handoff: true` フラグ処理）
- 既存REQ照合（`agentdev-req-file-manager` 照合方法論）
  - 定量的データ検証（`glob docs/requirements/REQ-*.md` で AGENTS.md 記載レンジと照合）
  - SPLIT 予兆計測（既存REQの健全性メトリクス計測）
- 要件展開（`agentdev-req-analysis` 分析観点）
  - 変更影響候補抽出
    - RU 由来キーワード抽出 + glob/grep 前処理によるサブエージェント調査委譲スコープの絞り込み（REQ-004-072）。絞り込みはサブエージェント調査委譲の調査優先対象リストのみに適用（ヒントでありハードフィルタではない）し、実ファイル列挙（REQ-004-002）の完全性は維持する
  - 非機能受け入れ条件の条件付き確認（work_type に関わらず常に実行。REQ-004-050〜053）
    - 適用対象判定: 対象が、信頼できない入力の構文解析、検証、解釈（パーサ、レクサ、デシリアライザ等）、権限、配布、trust 境界の enforcement、外部ネットワーク経路、アーカイブ展開等の外部攻撃面を持つ処理のいずれかに該当するか否かを判定する（判定基準は `agentdev-req-analysis` SPEC の分析観点を正とする）
    - 適用対象の場合、処理量の上限（時間計算量、処理ステップ数、または走査量の上限）、出力の上限（出力件数、証跡量の上限）、不正または曖昧な入力時の失敗挙動（fail-open か fail-closed か）の3確認事項への回答が確定するまで壁打ちを継続する
    - 回答は検証可能な形式（上限は数値または計算量の形、失敗挙動は fail-open / fail-closed のいずれか）を要求し、形式不定の回答や形式的な記述を許容しない。数値上限は既存の test strategy 数値閾値ガイドおよび pass_criteria 記述ガイドの規範に従う
    - 適用対象とした場合はその前提を要件docに記録する（適用外の場合の記録は強制しない）
    - 確定した受け入れ条件は既存の投影契約により test strategy（TS-NNN）へ直列化し、draft-data スキーマ、要件docテンプレート、QG、正規成果物種別を本件のために変更しない
  - 分類ゲート（v2:REQ-0155-004 最終分類確定ステップ）（変更後仕様 or 反映作業、REQ/SPEC 境界判定）。RU 入力の暫定分類（backlog-review が `tentative_classification` に付与）が存在する場合、`docs/specs/foundations/document-model.md` の文書7分類モデルに照らして最終分類を確定し暫定分類を上書きする。確定時のバリデーション（暫定分類の7値チェック、フィールド欠落時の停止、最終分類上書き値の7値チェック）は後述「tentative_classification 最終確定のバリデーション（v2:REQ-0155-008）」に定める
  - 文書分類妥当性検証（SPEC 分離基準違反残留検出）
    - Decision要否確認ゲート（`agentdev-architecture-advisory` 経由でアーキテクチャ助言サブエージェントへ委譲）
    - アーキテクチャ助言サブエージェントへの入力標準テンプレート使用 + 出力 4 ラベル構造要求（REQ-004-073）。ラベル構造は soft-contract（DEC-003）とし、分類権限は親が保持する
  - 実行主体分類表（REQ-003-007）（委譲契約を定義する場合、実行主体分類表（adapter skill / command / subagent / harness）を必須とする（`docs/specs/workflows/delegation-contracts.md` 参照））。委譲を含まない要件では省略可
  - Test strategy 定義（要件展開内）
    - 各 test strategy 項目を verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素構造として定義
    - on_failure（不合格時の処置）を持たない検証項目は test strategy に含めない
    - 項目識別子: TS-NNN 形式（NNNは3桁ゼロ埋め連番）
    - 各項目属性: id（TS-NNN）、target_item（AG-* への参照）、verification、pass_criteria、on_failure
    - on_failure アクション種別: fix-and-reverify（実装を修正して再検証）/ record-in-findings（Findings に out-of-scope として記録）の2値
- Decision判断（`agentdev-decision-guidelines`）
  - 既存Decision重複確認
  - Decision禁止ゲート
  - Decision判断根拠記録
  - 作業手段Decision拒否ゲート
  - Decision 番号指定形式（`new:{topic-slug}` 形式）
- 要件doc生成（テンプレート: `templates/req-define/req-draft.md`）
  - 定義完全性ゲート（QG-1）
  - operation_units 生成
  - artifact_actions 生成
  - draft-data test_strategy 生成（各項目の5属性をYAML形式で格納）
- work_type 判定（bugfix/feature/maintenance/docs_chore）
- Scale判断（featureのみ、`agentdev-workflow-lifecycle`）
  - 実装スコープシグナル確認
- ドラフト保存（`.agentdev/drafts/req-draft-{topic-slug}.md`）
  - 実装詳細の分離
  - auto_gate完了ゲート（auto_gate.auto_ready:false または未解決 item 残存時、stop_reasons を提示し解消方策を壁打ちで合意）。解消時は auto_ready:true に更新。ユーザーが明示的に false 選択時は conflict_resolutions に記録し継続。未解決のままの場合は壁打ちへ差し戻し
- 要件doc確認（ユーザー提示のみ、承認は求めない）
  - 複数RU受付、統合/分離判定、出力生成、Epic規模検出、Wave候補記録、OU 構造検証
- 完了報告（work_type 別テンプレート選択）

req-define は Workflow Skill と手順番号を複製せず、公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止状態、必須順序、利用 skill 責務によって対応付ける（v2:REQ-0143-005）。
詳細は `command-file-format.md`「command SPEC と command 定義の対応付け（v2:REQ-0143-005）」参照。

### tentative_classification 最終確定のバリデーション（v2:REQ-0155-008）

分類ゲート（最終分類確定ステップ）が backlog-review 付与の暫定分類（`tentative_classification`）を最終分類として確定（上書き）する際、以下を検証すること:

1. 暫定分類が v2:REQ-0155-003 の7値のいずれかであること。7値以外の場合、確定を停止し理由を提示すること
2. フィールドが欠落している場合、暫定分類未付与として確定を停止し、backlog-review への差し戻しを提示すること
3. 最終分類への上書き値も7値のいずれかであること

7値の定義、検出時の具体的挙動は backlog-review.md「tentative_classification フィールド仕様」を参照すること。

## REQ影響判定とSPEC正規所有者確定

req-define は backlog-review の暫定分類（`tentative_classification`）を暫定入力とし、最終分類を自身で確定する（REQ-004-087、REQ-001）。

### 最終分類確定ステップで判定する項目

req-define は次の7項目を判定し、`artifact_actions`、`operation_units` へ反映する:

| 判定項目 | 内容 |
|---|---|
| 新しいステークホルダー要求か | 既存REQ が要求を保持していない新しい要求か |
| 既存REQ が要求を既に保持しているか | 同一関心が既存REQ に存在するか |
| 利用者から見える外部契約が変わるか | 外部契約変更（change_nature: `external_contract_change`）に該当するか |
| REQ の作成・更新が必要か | 上記3項目から REQ 作成・更新要否を確定 |
| SPEC の論理区分 | v2:REQ-0155-009 の5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）のいずれか |
| 正規所有者 | 対象 command、skill、workflow、品質ルール、整合性ルール等の関心キー（REQ-003-038） |
| 正規追記先 | 既存 SPEC のどの領域へ追記するか（target_area、target_spec） |

### SPEC action への分類根拠出力

最終分類確定ステップで `artifact: spec` の SPEC action 各 entry へ `spec_logical_division` と `canonical_owner` を最終分類確定値として出力する。
出力値は `../responsibilities/artifact-contracts.md`「分類根拠伝播契約」の伝播フィールド一覧（`spec_logical_division`、`canonical_owner`）と一致し、後続の spec-save が SPEC frontmatter または冒頭宣言節へ宣言を付与するための入力となる。
分類値が確定できない場合は `unknown` とし、soft-contract（DEC-003）に従い spec-save へ警告付きで引き継ぐ。

### REQ 影響なし時の取扱い

REQ 影響なしと確定した変更からは `artifact_actions` の `artifact: req` エントリを生成しない（REQ-004-088）。
代わりに `artifact: spec` エントリのみを生成し、SPEC への配置のみを行う。
SPEC action には前項「SPEC action への分類根拠出力」を適用する。

### 分類根拠の引き継ぎ

req-define は RU から引き継いだ分類根拠（`artifact-contracts.md`「分類根拠伝播契約」参照）を暫定入力とし、最終分類を確定した上で draft-data へ反映する。
分類根拠の soft-contract 運用（欠落時 unknown 既定値、警告）は DEC-003 に従う。

### tentative_classification との関係

backlog-review が付与する `tentative_classification`（v2:REQ-0155-003 の7値）は暫定値であり、req-define が最終分類を上書きする。
最終分類確定時のバリデーション（7値チェック、フィールド欠落時の停止、上書き値の7値チェック）は前述「tentative_classification 最終確定のバリデーション」に従う。

### 壁打ち対話 構造的分析フレーム先行手順（REQ-004-083, REQ-004-084, REQ-004-085）

壁打ち対話の開始時に、入力（RU、セッションコンテキスト、明示入力ファイル）の構造を入力データの性質に応じた分析フレームで先行して整理し、個別論点の深掘り前に全体構造をユーザーに提示する。

#### 分析フレームの選択

入力データの性質に応じて以下のフレームから選択する:

| 入力データの性質 | 推奨フレーム |
|---|---|
| 複数RU・複数改善候補 | 対象×変更種別の二軸マトリクス |
| 既存要件との照合が必要 | 既有件化/未要件化/SPEC配置の3分類表 |
| 修正要否の判定 | 実装面/SPEC面の両面分析表 |

上記は推奨例であり、入力データの性質に応じて適切なフレームを選択する。
分析フレームは個別論点の深掘りに先行して提示する。

#### 二項選択回答規定

ユーザーが二項選択（「AかBか」）を求めた質問に対し、「混在」「要確認」単独の回答を出力しない。
件数と根拠でいずれかを明示して回答する。
両選択肢に該当する場合は、それぞれの件数と根拠を明示して両方を提示する。

#### 実装/SPEC両面分析規定

修正の要否を検討する際、実装面（ソースコード、スクリプト、スキル定義ファイル等の変更）と SPEC 面（docs/specs/ 配下の文書変更）の両面を分析し、各面の修正対象と修正内容を明示する。
片面のみの分析で修正要否を断定しない。

#### agentdev-req-analysis SKILL 連携

上記手順の詳細（質問運用ルール、分析フレーム選択基準）は `agentdev-req-analysis` SKILL（`src/opencode/skills/agentdev-req-analysis/SKILL.md`）の「質問運用ルール」「要件分析観点」セクションに反映する。
本 SPEC は手順の要件を定義し、SKILL は実装詳細を定義する（原本src→配置先.opencode の文書間投影規則に準拠）。

## draft-data test_strategy フィールドスキーマ

要件定義で test_strategy（テスト戦略）を定義する場合のシリアライズ形式を定義する。

### test_strategy 項目構造

各 test strategy 項目は以下の5属性を持つ:

| 属性 | 型 | 説明 | 例 |
|------|------|------|----|
| id | string | TS-NNN 形式（NNNは3桁ゼロ埋め連番） | `TS-001` |
| target_item | string | AG-* への参照 | `AG-NNN` |
| verification | string | 検証手順 | `check_integrity.ts を実行する` |
| pass_criteria | string | 合格基準 | `エラー 0 件で完了すること` |
| on_failure | string | 不合格時の処置 | `実装を修正して再検証する` |

### YAML 表現形式

```yaml
test_strategy:
  - id: TS-001
    target_item: AG-NNN
    verification: |
      検証手順の記述
    pass_criteria: |
      合格基準の記述
    on_failure: |
      不合格時の処置の記述
```

### on_failure アクション種別

| 種別 | 説明 | 選択基準 |
|------|------|---------|
| fix-and-reverify | 実装を修正して再検証する | 修正可能な実装不良の場合 |
| record-in-findings | Findings に out-of-scope として記録する | スコープ外または修正困難な事象の場合 |

## artifact_actions 生成

req-define は `artifact_actions` の producer である。
要件doc生成の artifact_actions 生成で要件展開の結果を `draft-data` の `artifact_actions` へ出力する。
本節は req-define 側の生成契約（operation の選択基準、`spec-append` の生成、誤記との機械的区別、後方互換）を規定する。
各 operation の `target_area` と `content` の出力形式は後段「[draft-data artifact_actions フィールド形式](#draft-data-artifact_actions-フィールド形式)」を参照。

### operation の選択基準

req-define は変更の性質に応じて SPEC operation を選択する。
SPEC operation の公式 enum、非正規 alias、alias から公式 enum への映射、consumer 側の後方互換は [artifact-contracts.md](../responsibilities/artifact-contracts.md)「artifact_actions operation」が正規所有する。

| 変更の性質 | operation | 意図 |
|---|---|---|
| 新規 SPEC ファイル作成 | `create` / `spec-create` | SPEC ファイルを新規作成する |
| 既存 SPEC ファイルの既存セクション置換 | `update` / `spec-update` | 既存セクション全体を新しい内容で置換する |
| 既存 SPEC ファイルへの新規セクション追加 | `spec-append` | 既存 SPEC ファイルへ新規セクションを追加する |

`create` / `update` は公式 enum であり、`spec-create` / `spec-update` / `spec-append` は非正規 alias である。

### spec-append の生成契約

req-define は既存 SPEC ファイルへ新規セクションを追加する場合、`operation: spec-append` として action を出力する。
入力フィールドは以下の通り。

| field | 必須性 | 形式 |
|---|---|---|
| `target` | 必須 | 既存 SPEC ファイルパス |
| `target_area` | 必須 | 追加する新規セクションの見出し（Markdown 見出し行形式。例: `### IR-044`） |
| `content` | 必須 | 追加する新規セクション全文（見出し行から始まる） |
| `placement` | 任意（省略時 `tail`） | `tail` / `after_anchor` / `before_anchor` のいずれか |
| `anchor` | `placement` が `tail` 以外は必須 | 挿入位置の基準となる見出し行（`target_area` と同一形式） |

`placement` 別の追加位置、`anchor` マッチング規則、anchor 未検出時の挙動、同名見出し時の挙動、合格基準は [artifact-contracts.md](../responsibilities/artifact-contracts.md)「spec-append operation」および [spec-save.md](spec-save.md)「spec-append 操作時のセクション追加ロジック」が正規所有する。
req-define 側は入力フィールドの選択と値の生成のみを規定し、配置実行の詳細は規定しない。

### 新規セクション追加と target_area 誤記の機械的区別

`spec-append` を用いることで、意図的な新規セクション追加と `target_area` の誤字・古い見出し名・参照先間違いを機械的に区別できる。

- `update` / `spec-update`: 既存セクションを置換する意図。`target_area` に一致する見出しが存在しない場合、consumer（spec-save）は未検出として follow-up 報告を行う。`target_area` の誤字、古い見出し名、参照先間違いはこの経路で検出される
- `spec-append`: 新規セクションを追加する意図。`target_area` は追加する新規セクションの見出しを示し、既存見出しとの一致を前提としない。配置位置は `placement` と `anchor` で指示する

両者を operation で明示することで、consumer 側は `target_area` が既存見出しと一致しない事象を「置換対象の誤記」と「新規セクション追加の意図」で区別して処理できる。

### 後方互換

既存の `create` / `update` および alias `spec-create` / `spec-update` は従来通り出力可能であり、consumer（spec-save）は `create` / `update` / `spec-create` / `spec-update` / `spec-append` の全てを受理する（後方互換）。
`target_area`、`placement`、`anchor` 等のフィールドを持たない旧形式 draft も consumer は入力として拒否しない。
後方互換の正規定義は [artifact-contracts.md](../responsibilities/artifact-contracts.md)「SPEC operation enum と非正規 alias」を参照。

## draft-data artifact_actions フィールド形式

artifact_actions の各 entry が出力する `target_area` と `content` の扱いは operation 別に以下を規定する（REQ-004-078, REQ-004-079、REQ-008-058）。

SPEC operation の公式 enum は `create` / `update` であり、req-define は非正規 alias（`spec-create`, `spec-update`, `spec-append`）も出力可能とする。
alias から公式 enum への映射: `spec-create` → `create`、`spec-update` → `update`、`spec-append` → `update`（既存 SPEC ファイルへ新規セクションを追加する操作）。
alias 固有の契約（placement, anchor 等）は後段の表および [spec-save.md](spec-save.md) に従う。

| operation | target_area | content |
|-----------|-------------|---------|
| create / spec-create | 任意（省略時は spec-save が既存セクション構造から追加位置を判断） | 新規セクション本文 |
| update / spec-update | 必須（対象セクション見出し、Markdown 見出し行形式。例: `### IR-044`） | 変更後セクション全文（対象セクションの見出し行から次の同レベル見出しの直前までの全内容） |
| spec-append | 必須（anchor 見出し、Markdown 見出し行形式。例: `### IR-044`）。anchor 末尾への追加を示す `placement: tail`（既定）、anchor 直後を示す `placement: after_anchor`、anchor 直前を示す `placement: before_anchor` を action へ併せて出力できる（省略時は `tail`） | 追記する新規セクション本文（見出し行を含む） |

req-define 側は出力形式のみを規定する。
`target_area` の形式（Markdown 見出し行）、見出し階層の解釈規則、複数マッチ、未検出時の挙動、`spec-append` の placement 別挙動は [spec-save.md](spec-save.md) 側に配置する。

## review_dispositions の producer 契約

req-define は `review_dispositions` の producer である。
要件doc生成で壁打ち過程の採否判断を `draft-data` の `review_dispositions` へ出力する。

### 出力義務

req-define は以下の入力項目について disposition を記録する:

| 記録対象 | 内容 |
|---|---|
| 採用しなかった入力 | RU、inbox item、セッション会話から採用を見送った項目 |
| 既存要件で充足済みの入力 | 既存 REQ、既存 SPEC、同意済み artifact_actions で既に満たされている項目（disposition: `covered`） |
| 一部のみ採用した入力 | 項目の一部を採用し、残部を採用しなかったもの（disposition: `partially_covered`） |

`review_dispositions` は optional な soft-contract であり（DEC-003）、欠落時に後続工程が draft を拒否しない。
covered 項目だけで構成される Issue や PR を作成しない方針を維持する。

### 未決事項の取扱い

未決事項（未解決質問、未解決衝突、repo 外操作要否等）は disposition で代替せず、`auto_gate` の `unresolved_questions`、`unresolved_conflicts`、`out_of_repo_operations`、`stop_reasons` へ記録する。
disposition は確定した採否判断のみを保持する。

### 根拠不足時の取扱い

disposition の `evidence` に根拠（path、section）を設定できない場合、または根拠が曖昧な場合は `auto_gate.auto_ready: false` とし、`stop_reasons` へ根拠不足の旨を記録する。
根拠不足のまま draft を完成させてはならない。

`evidence.checked_at_commit` は req-define 生成時 `null` とする（G08 git 操作禁止）。
default branch 最新化後の evidence 再確認は consumer（case-open）の責務である。

## draft-data review_dispositions フィールドスキーマ

要件定義で `review_dispositions` を出力する場合のシリアライズ形式を定義する。
schema の正規所有先は [artifact-contracts.md](../responsibilities/artifact-contracts.md)「review_dispositions 構造」節である。
本節は req-define 固有の出力形式を規定する。

### review_dispositions 項目構造

各 disposition エントリは以下の field を持つ:

| field | 型 | 必須 | 説明 |
|------|------|------|------|
| id | string | 必須 | `RD-NNN` 形式（NNN は連番） |
| source_ru | string | optional | 単一の元 RU-ID（RU 入力でない場合は省略可） |
| source_item | string | 必須 | 単一の元 item 識別子（RU 内の要件行 ID 等。複数指定不可） |
| disposition | enum | 必須 | `covered` / `partially_covered` / `rejected` / `not_applicable`。必要に応じて `superseded` / `stale_target` を追加 |
| reason_code | string | 必須 | 判断理由のコード |
| reason | string | 必須 | 人間可読の判断理由本文 |
| evidence | object | 必須 | 根拠。`path`、`section`、`checked_at_commit` を持つ。`checked_at_commit` は生成時 `null`（G08 git 操作禁止） |
| related_removed_items | list | optional | 本判断により除外された関連項目の識別子リスト |

1 disposition エントリ = 単一 `source_ru` + 単一 `source_item` の組み合わせとする（重複禁止）。

### YAML 表現形式

```yaml
review_dispositions:
  - id: RD-001
    source_ru: RU-NNN
    source_item: RU-NNN.req-001
    disposition: covered
    reason_code: already_satisfied
    reason: |
      REQ-002 が既に当該要件を保持しているため採用を省略した。
    evidence:
      path: docs/requirements/REQ-002.md
      section: REQ-002-045
      checked_at_commit: null  # req-define 生成時は null。case-open が確認 commit SHA を記録する
    related_removed_items: []
  - id: RD-002
    source_ru: RU-NNN
    source_item: RU-NNN.req-002
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      本 draft の対象範囲外のため採用しない。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
```

### checked_at_commit 運用

`evidence.checked_at_commit` は req-define 生成時 `null` とする（G08 git 操作禁止）。
case-open が default branch 最新化後に evidence の path/section を再確認し、確認時の commit SHA を当該フィールドへ記録する。
根拠失効時は `covered` のまま起票せず `stale_target` または再評価対象として停止する。

### 後方互換性

`review_dispositions` は optional な soft-contract である。
本フィールドを持たない旧ドラフトを req-save、case-open は入力として拒否しない（DEC-003 準拠）。

## 未確定内容の auto_ready 抑止（REQ-008-059）

req-define は、後続工程で決定する必要がある未確定事項、必須内容の欠落、暫定プレースホルダーが `agreed_items` または `artifact_actions` に残る場合、`auto_gate.auto_ready` を `true` にしないこと（REQ-008-059）。
本抑止は REQ-008-030（`artifact_actions` の `content` 完全確定）の強制機構として働く。

### 抑止条件

auto_gate完了ゲートの判定前に、以下の2系統の検査を組み合わせて `auto_gate.auto_ready` を確定する。

#### (A) 決定的マーカー検査

`agreed_items` 各エントリの `content`、`artifact_actions` 各エントリの `content` について、以下の5種の代表マーカーのいずれかを部分文字列として含むか検査する。
検査は意味解釈を伴わない文字列一致（大文字小文字区別なし）とし、QG-1 意味判定（後述 (B)）に先立って機械的に適用する。

| # | マーカー | 意味 |
|---|---|---|
| 1 | `TBD` | 未決定事項の表明 |
| 2 | `TODO` | 未実装・未確定事項の表明 |
| 3 | `未定` | 日本語での未確定表明 |
| 4 | `後続工程で確定` | 後工程への持ち越し表明 |
| 5 | `case-run で確定` | case-run への持ち越し表明（前後の空白有無を許容） |

いずれかのマーカーを検出した場合、`auto_gate.auto_ready: false` とし、検出元の AG-ID（`agreed_items` 由来）または ACT-ID（`artifact_actions` 由来）と検出マーカーを `auto_gate.stop_reasons` へ記録する。

##### 引用・禁止事例の誤検知防止

マーカー文字列が「禁止事項や過去事例の引用」として使われている文は抑止対象外とする。
代表的な引用パターンを以下に示す。
これらは意味判定ではなく、文脈パターンの文字列一致で除外する。

| 引用パターン | 例 |
|---|---|
| 禁止を述べる文 | 「TBD を残さないこと」「TODO を含めないこと」「未定のまま保存しないこと」 |
| 過去事例の引用 | 「前回の TBD 残存事例を参考に」 |
| 検査項目としての言及 | 「TBD/ TODO/ 未定 を検出する」 |

判定は文単位で行う。
マーカーを含む文が上記いずれかの引用パターンに合致する場合、当該文のマーカーを検出扱いとしない。
同一 AG-ID/ ACT-ID 内に引用以外の未確定を示すマーカー出現が残る場合は抑止を維持する。

#### (B) QG-1 意味判定

決定的マーカー検査 (A) に加え、QG-1（Definition Integrity Gate）の意味判定観点（必須フィールド欠落、曖昧要件、測定不能条件）を `agreed_items`/ `artifact_actions` の各エントリへ適用する。
QG-1 が fail となるエントリがある場合、`auto_gate.auto_ready: false` とし、該当 AG-ID/ ACT-ID と QG-1 該当観点を `auto_gate.stop_reasons` へ記録する。

### stop_reasons 記録形式

抑止時に `auto_gate.stop_reasons` へ記録する各エントリは、対象 ID と理由を含む文字列とする。
形式は soft-contract（DEC-003）とし厳格スキーマ検証を導入しないが、少なくとも以下の情報を含むこと。

- 対象 ID（`AG-NNN` または `ACT-{ARTIFACT}-NNN`）
- 抑止理由（検出マーカー、または QG-1 該当観点）
- 該当箇所の要約（マーカー文字列、または欠落フィールド名）

記述例:

```yaml
auto_gate:
  auto_ready: false
  stop_reasons:
    - "ACT-REQ-003: 未確定マーカー 'TBD' が content に含まれる（対象: API仕様）"
    - "AG-005: QG-1 必須フィールド欠落（target_area 未設定）"
```

### 後続ステップへの引き継ぎ

抑止により `auto_ready: false` となった場合、auto_gate完了ゲートの既存手順に従い `stop_reasons` をユーザーへ提示し、壁打ち対話で解消方策を合意する。
合意により未確定事項が解消され、(A)(B) いずれの検査も該当しなくなった場合に限り `auto_ready: true` へ更新する。
ユーザーが「`auto_ready: false` のまま標準フローで手動実行する」と明示的に選択した場合は `conflict_resolutions` へ記録して継続する（REQ-004-048）。

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 SPEC であり、command 定義（`src/opencode/commands/agentdev/req-define.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（STEP 構成、resume protocol、reference 構成）は Workflow Skill（`agentdev-workflow-req-define`）が所有し、本 SPEC はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## Artifact Graph 利用

req-define は既存 REQ、関連 Decision と SPEC、canonical owner、構造的所有者重複、downstream 変更影響候補の探索に Artifact Graph を利用できる。
Graph は候補提供者であり、CREATE, APPEND, UPDATE, SPLIT, MERGE, 意味的重複, canonical owner の最終判断は正規成果物本文と独立探索手段（`glob`, `grep`, `rg` 等）での確認後に下す。
共通利用原則の防護事項は `agentdev-artifact-graph` SPEC「ワークフロー利用」を参照。

Graph 不在、stale、consumer 環境に対応 node type または relation type が存在しない場合は、従来の探索経路で継続し、workflow を停止しない（fail-open）。

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、SSoT 遷移）
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（extraction / classification 委譲）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（REQ再構成 intake、draft lifecycle）
- [req-health-metrics.md](../quality/req-health-metrics.md)（SPLIT 予兆計測閾値）
- [quality-gates.md](../quality/quality-gates.md)（QG-1）
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（draft body 品質検査）

## 実証Case判定と評価契約（新規セクション）

本節は req-define における実証Case判定と評価契約確定の実行詳細を所有する。実証Caseと評価契約の意味論の正規所有は REQ-043 であり、本節はその実行位置と構成要素を規定する。

### 実証必要性推論の観点

- 調査・設計だけでは重要な採否判断を確定できないか
- 実行・測定・観察が必要か
- 単なる追加調査でないか

単なる追加調査だけを理由に実証Caseとしない（REQ-043-002）。

### 実証Case推奨時の壁打ち手順

ユーザーが実証を明示している場合は再確認せず実証Caseとして扱う。明示していない場合は req-define が実証を推奨する理由を提示し、壁打ちにより実証Caseへの移行を確定する（REQ-043-003）。実証Caseとして確定した後は評価ブランチ利用を別途確認せず、実証Caseなら評価ブランチ、通常Caseなら main と決定的に導出する（REQ-043-004）。

### 実証Issue 入力（req-define <実証Issue>）

- 実証Issue 明示指定時は、評価契約、最終評価結果、参照証拠を当該実証の正式化の主たる入力として取り込む
- 実証Issue 明示指定時に RU 自動検出と混在する場合は、どちらを処理するかユーザーへ確認する入力優先規定を適用する

### 評価契約の構成要素一覧

req-define は実証開始前に、必要に応じて次の構成要素を確定する（REQ-043-005）。

評価対象・仮説、比較対象、比較条件、評価方法、評価観点、評価シナリオ、測定・観察項目、判定基準、必要証拠、採用条件、不採用条件、判定不能条件、中止条件、再実行条件、比較条件逸脱時の扱い

### 評価契約と test strategy の分離基準

test strategy は実証手段・計測手段・実証環境が正常に動作したかを扱い、評価契約は評価対象から得られた結果と採否を扱う。評価対象が採用基準を満たさなかったことを実装不具合として自動修正しない（REQ-043-006）。

### 評価ブランチ・worktree 準備タイミングと実行主体

実証Case確定後、最初の保存処理より前に当該実証専用の評価ブランチと必要な worktree を準備する。準備の実行主体・手順は SPEC が所有し、req-define 単独の Git 副作用としない（REQ-043-009）。req-define 自身は Git 副作用を持たず、評価ブランチ作成だけの新しい公開コマンドを追加しない。

### 実証Case の draft-data 出力形式

req-define は実証Case の draft-data に実証Caseであること、評価契約、評価ブランチ識別情報を出力する（REQ-043-030）。下流コマンドは Issue 等の永続情報または draft-data の当該情報から実証Caseを認識する。

### draft の評価環境への引き継ぎ契約

req-define が生成した draft を内容欠落なく評価環境へ引き継ぎ、req-save / spec-save を評価ブランチ上で継続実行できる（REQ-043-010）。

## 対象外

- 実装コードの作成、編集（G01: 壁打ちフェーズのみ）
- 関連ドキュメントの個別ファイル列挙をユーザーに求める（G02）
- `.agentdev/drafts/**` 以外のファイル作成、編集（G03）
- ユーザー明示入力ファイルの変更、削除、RU 削除（G04）
- `docs/` 配下の広範な探索（G05。例外: 明示入力ファイル、`docs/requirements/**` 参照、変更影響候補抽出の限定探索）
- `inbox.md` / `deferred.md` 直接ロード（G06）
- 採用済み成果物の直読み（G07）
- `git` コマンド実行（G08）
- Issue 階層決定（G13、case-open 責務）
- `execution_groups` セクション出力（G14）
- SPEC 分離基準（REQ-001-068）該当要件行の REQ 残留（G15、`artifact_actions` へ分離）
- Decision判断における未確認事項の要件本文混入（G17、REQ-003-002/004）
- アーキテクチャ助言サブエージェントによるファイル編集（G18、REQ-003-003）

## 検証観点

- QG-1（Definition Integrity Gate）: 定義完全性ゲートで要件doc構造的完全性を検証（REQ/SPEC 分類、Decision ゲート、チェックボックス測可能性、必須フィールド完全性、artifact_actions 構成妥当性）
 - test_strategy 3要素完全性検査: 各 test strategy 項目が verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素を完全に保持すること。いずれかが欠落する項目を検出した場合、fail とする
- チェックボックス品質基準: `agentdev-req-analysis` に従い測定可能で一意（G09）
- artifact_actions 構成: REQ/Decision/SPEC 別 action が適切に統合されているか
- OU 構造検証: 要件doc確認工程で ou_id、operation、target_req/target_spec、depends_on、result 整合性

## 停止状態

- auto_gate 完了ゲートで未解決 item が残る場合（stop_reasons を提示して解消方策を壁打ちで合意する。未解決のままの場合は壁打ちへ差し戻し、要件doc を確定させない）。
- tentative_classification の最終確定バリデーションで7値違反、フィールド欠落を検出した場合（確定を停止し、理由を提示、または backlog-review への差し戻しを提示する）。
- 前工程からの引き継ぎ判定（`agentdev_handoff: true`）検出時（要件展開を開始せず停止する）。
- adversarial-review 審議で unresolved な本質的争点が残る場合（最初の副作用（要件doc 保存）へ進まず停止する）。

## See Also

- [req-save.md](req-save.md)（後続コマンド（REQ/Decision 保存））
- [spec-save.md](spec-save.md)（後続コマンド（SPEC 保存））
- [case-open.md](case-open.md)（後続コマンド（Issue 作成））
- `agentdev-workflow-req-define` skill（workflow 実装本体（STEP 構成、resume protocol））
- `agentdev-req-analysis` skill（要件分析手法）
- `agentdev-req-file-manager` skill（REQ ファイル管理、照合）
- `agentdev-decision-guidelines` skill（Decision 判断基準）
- `agentdev-architecture-advisory` skill（アーキテクチャ助言サブエージェント連携）
- `agentdev-workflow-lifecycle` skill（work_type、scale 判定）
- REQ-004（要件定義、保存）
- REQ-008（構造化 req_draft 契約）
- REQ-003（外部エージェント統合契約）
- DEC-003（構造化 draft-data 形式）

## adversarial-review 挿入境界（経路A）

本節は req-define への adversarial-review caller integration（経路A、REQ-015-004）の挿入境界を正典として所有する。
共通 caller integration 契約（任意性、QG/HITL 非代替、副作用禁止、accepted finding 反映責務、再 review 条件と停止条件、呼出失敗時取扱い）は [adversarial-review SPEC](../skills/agentdev-adversarial-review.md)「adversarial-review caller integration 共通契約」節が正であり、本節は経路A 固有の発動条件、review 対象確定位置、採用後戻り先、最初の副作用との順序のみを規定する（REQ-014-011）。

### 挿入位置（REQ-015-004）

review 挿入位置は「Scale 判断後・Decision判断前・要件doc生成前」と一意に特定可能である。
処理段階への対応付けを次に示す。

| 条件 | feature の場合 | feature 以外（bugfix, maintenance, docs_chore）の場合 |
|---|---|---|
| Scale 判断後 | Scale判断完了後 | work_type 判定完了後。Scale判断 は feature のみ実行するため、work_type 判定完了をもって意味的完成とする |
| Decision判断前 | Decision判断の判断結果がドラフト保存で永続化される前 | 同左 |
| 要件doc生成前 | 要件doc生成の成果物がドラフト保存で永続化される前 | 同左 |

review は Scale判断（feature 以外は work_type 判定）完了後、ドラフト保存の前に挿入する。
Decision判断および要件doc生成は当該時点で実行済みであるが、その成果物はドラフト保存で永続化されるまで確定扱いとならない。
review の finding は Decision判断、要件doc生成の成果物へ反映可能であり、ADR finding は Decision判断へ戻す。

### 発動条件判定 Step（REQ-015-001、REQ-015-002、REQ-015-003）

発動条件判定と review 呼出を分離する（REQ-015-001）。
発動条件判定 Step は default-on 原則（REQ-015-002）と skip 条件（REQ-015-003）を評価する。

- **default-on（原則実行）**: req-define は adversarial-review を原則実行する（REQ-015-002）。ユーザー明示指定は通常発動の必須条件ではなく、review 対象の意味的決定（要件展開、Decision要否判定、Scale判断）が存在する場合に発動する。
- **skip 条件**: 次のいずれかに該当する場合、adversarial-review を省略して従来フロー（review を挿入せずドラフト保存へ進む）を継続できる（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。
  - Scale が L0（独立、自明）で Decision判断対象が存在せず、review 対象となる意味的決定が存在しない場合
- **ユーザー明示指定時の必須実行**: ユーザーが req-define 実行中に adversarial-review の実施を明示的に指定した場合、skip 条件の該当にかかわらず必ず発動する（REQ-015-002）。

### review 呼出 Step（REQ-015-001）

発動条件判定 Step で発動と判定された場合、review 呼出 Step で adversarial-review を呼び出す（REQ-015-001）。

- **委譲契約**: adversarial-review は `semantic_review`（書き込み禁止型）として適用する（[delegation-contracts SPEC](../workflows/delegation-contracts.md)「adversarial-review との委譲契約接続」節）。adversarial-review 自身は対象ファイル、Issue、PR、git 操作を行わない（REQ-014-004）。
- **review 対象**: 当該 req-define で生成した要件候補（draft-data、`agreed_items`、`artifact_actions`、Decision判断結果、Scale判断結果）。
- **採用後戻り先**: accepted finding のうち ADR 関連の finding は Decision判断へ戻し再評価する。要件展開に関わる finding は該当段階（要件展開以降）へ戻す。accepted finding の対象候補への反映は req-define（呼出元）の責務である（REQ-014-006）。
- **unresolved 時の取扱い**: 未解決のユーザー判断事項が残る場合、ドラフト保存へ進まない（REQ-014-009）。工程委譲起源であるため、既存 status（pass/warn/fail/partial）に unresolved 判断事項を付加し、case-auto 経由時は user-decision-required 停止理由分類として伝播する（REQ-014-012、[workflow-contracts SPEC](../workflows/workflow-contracts.md)「adversarial-review 由来の停止信号」節）。
- **呼出失敗時**: adversarial-review の呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持する（REQ-014-010）。

### 最初の副作用（要件doc保存）との順序

review はドラフト保存より前に実行する。
ドラフト保存が req-define の最初の副作用（`.agentdev/drafts/req-draft-{topic-slug}.md` のファイル作成）であるため、review は最初の副作用の前に挿入される。
review の結果、要件候補が変更された場合は、ドラフト保存で保存されるドラフトへ反映する。

