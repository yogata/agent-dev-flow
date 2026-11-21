---
title: req-define Design
status: accepted
created: 2026-06-21
updated: "2026-11-21"
---
<!-- ADF-COVERS(implementation): REQ-008-018, REQ-008-019, REQ-008-020, REQ-008-021, REQ-008-023, REQ-008-024, REQ-008-025, REQ-008-026, REQ-008-027, REQ-008-028, REQ-008-029, REQ-008-030, REQ-008-031, REQ-008-034, REQ-008-035, REQ-008-038, REQ-008-039, REQ-008-040, REQ-008-042, REQ-008-043, REQ-008-044, REQ-008-045, REQ-008-046, REQ-008-050, REQ-008-051, REQ-008-054, REQ-008-058, REQ-008-059 -->
<!-- ADF-COVERS(implementation): -->
<!-- ADF-COVERS(design): REQ-008-058, REQ-008-059, REQ-008-060, REQ-008-061, REQ-008-062, REQ-004-056, REQ-004-057, REQ-004-058, REQ-004-059, REQ-004-060, REQ-004-062, REQ-004-063 -->
<!-- ADF-COVERS(design): REQ-004-064, REQ-004-065（draft 保存後 git 永続化手順と oldText 転記規約の組立手順設計） -->
<!-- ADF-COVERS(design): REQ-004-076, REQ-004-077（IR-044 シグナル語事前走査と検索型合格条件の解釈注記指針の req-define 契約面の組立手順設計。対応する Design 更新は OU-008・OU-010 実行時の draft-generation.md 更新） -->
<!-- ADF-COVERS(design): REQ-004-071, REQ-004-072, REQ-004-075（判断根拠の維持・採用範囲の維持・両経路共通原則節。AG-003、AG-004、AG-007 に対応） -->
<!-- ADF-COVERS(design): REQ-108-014, REQ-108-015, REQ-108-016, REQ-108-017（重要変更の通知と結果説明節。AG-001〜003 に対応） -->

<!-- ADF-COVERS(implementation): REQ-021-011, REQ-021-022 -->
<!-- ADF-COVERS(design): REQ-021-011 -->
<!-- ADF-COVERS(design): REQ-021-012, REQ-021-023, REQ-021-028, REQ-021-029 -->
<!-- ADF-COVERS(design): REQ-012-031（設計根拠対応の条件付き意味節が、設計根拠対応の成立を独立 Design 文書の存在に一律依存させない設計判断） -->
<!-- ADF-COVERS(implementation): REQ-015-004 -->
<!-- ADF-COVERS(implementation): REQ-104-009, REQ-104-010, REQ-104-011（採用規約の解決の実行経路接続節） -->
<!-- ADF-COVERS(implementation): REQ-004-001, REQ-004-002, REQ-004-004, REQ-004-010, REQ-004-014, REQ-004-015, REQ-004-016, REQ-004-017, REQ-004-018, REQ-004-019, REQ-004-020, REQ-004-022, REQ-004-023, REQ-004-034, REQ-004-035, REQ-004-036, REQ-004-037, REQ-004-038, REQ-004-039, REQ-004-042, REQ-004-043, REQ-004-046, REQ-004-047, REQ-004-048, REQ-004-049, REQ-004-050, REQ-004-051, REQ-004-052, REQ-004-053, REQ-008-022, REQ-008-032, REQ-008-033, REQ-008-041, REQ-008-047, REQ-008-048, REQ-008-049, REQ-008-052, REQ-008-053 -->

# req-define Design

本 Design は骨格（公開契約と制御フロー）と references/ 詳細仕様の2層構成である。実行手順・schema・判定規則の詳細は references/req-define/ 配下へ分離している。通常経路で全 reference を無条件読込せず、必要な条件に応じて遅延読み込みする。

本 command は要求から開始する入口（requirements-driven entry point）である（要求入口 2 つの一方）。

自然言語による機能要求、バグレポート、エラー・ログ・障害事象、外部課題、RU、設計・調査メモ、診断由来 finding を入力として、要件を壁打ちにより整理、定義し、構造化 `draft-data` 形式の要件 doc（`.agentdev/drafts/req-draft-{topic-slug}.md`）を生成する。標準経路の次段は case-auto である。
壁打ちフェーズで使用。

## 承認・HITL 境界

- 壁打ち対話そのものが主要 HITL である（要件の深掘り、合意形成をユーザーとの対話で行う、REQ-004）。
- auto_gate の未解決項目の解消方策は壁打ちで合意する（解消時は `auto_ready: true` へ更新。ユーザーが明示的に false を選択した場合は `conflict_resolutions` に記録して継続する）。
- 生成した要件doc は提示のみとし、承認は求めない（後続の case-auto へそのまま渡す）。Definition の保存は case-ready / case-revise の内部責務で実行する

## 入力

- ユーザーの自然言語による機能要求、バグレポートの説明
- GitHub Issue URL（既存Issueの場合）
- エラー・ログ・障害事象（エラー・障害入力の評価経路: 現象理解、原因分析、期待状態、影響分析、要求化の必要性を順に評価し REQ/Decision/Design への接続可否を判定する。評価経路の実行は work_type の値に依存しない。REQ-004-054/055）
- 外部課題（外部課題管理システムのチケット、障害報告書等）
- ユーザーが明示した入力ファイル: 設計メモ、調査メモ、RU（`.agentdev/backlog/req-units/RU-*.md`）。全て参照専用入力
- Definition 保存（case-ready / case-revise の内部責務）の SPLIT 検出時の検出事項（`.agentdev/drafts/requirements-review-finding-{topic-slug}.md`）
- inspect-skills 診断結果の検出事項（`.agentdev/inspect/inbox/inspect-skills-finding-{topic-slug}.md`）。参照専用入力
- promoted 直読み禁止: `.agentdev/intake/promoted/`、`.agentdev/learning/promoted/` は直接読み込まない

## 出力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（全 work_type 共通、構造化 `draft-data` 形式: REQ-008, DEC-003）

## 副作用

- ファイル作成: `.agentdev/drafts/req-draft-{topic-slug}.md` のみ
- git 操作: 実行しない
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
    - RU 由来キーワード抽出 + glob/grep 前処理によるサブエージェント調査委譲スコープの絞り込み。絞り込みはサブエージェント調査委譲の調査優先対象リストのみに適用（ヒントでありハードフィルタではない）し、実ファイル列挙（REQ-004-002）の完全性は維持する
  - 非機能受け入れ条件の条件付き確認（work_type に関わらず常に実行。REQ-004-050〜053）
    - 適用対象判定: 対象が、信頼できない入力の構文解析、検証、解釈（パーサ、レクサ、デシリアライザ等）、権限、配布、trust 境界の enforcement、外部ネットワーク経路、アーカイブ展開等の外部攻撃面を持つ処理のいずれかに該当するか否かを判定する（判定基準は `agentdev-req-analysis` Design の分析観点を正とする）
    - 適用対象の場合、処理量の上限（時間計算量、処理ステップ数、または走査量の上限）、出力の上限（出力件数、証跡量の上限）、不正または曖昧な入力時の失敗挙動（fail-open か fail-closed か）の3確認事項への回答が確定するまで壁打ちを継続する
    - 回答は検証可能な形式（上限は数値または計算量の形、失敗挙動は fail-open / fail-closed のいずれか）を要求し、形式不定の回答や形式的な記述を許容しない。数値上限は既存の test strategy 数値閾値ガイドおよび pass_criteria 記述ガイドの規範に従う
    - 適用対象とした場合はその前提を要件docに記録する（適用外の場合の記録は強制しない）
    - 確定した受け入れ条件は既存の投影契約により test strategy（TS-NNN）へ直列化し、draft-data スキーマ、要件docテンプレート、QG、正規成果物種別を本件のために変更しない
  - 分類ゲート（暫定分類契約は REQ-008。文書7分類モデルは document-model Design）の最終分類確定ステップ（変更後仕様 or 反映作業、REQ/Design 境界判定）。RU 入力の暫定分類（backlog-review が `tentative_classification` に付与）が存在する場合、`docs/designs/foundations/document-model.md` の文書7分類モデルに照らして最終分類を確定し暫定分類を上書きする。確定時のバリデーション（暫定分類の7値チェック、フィールド欠落時の停止、最終分類上書き値の7値チェック）は後述「tentative_classification 最終確定のバリデーション（現行は REQ-008）」に定める
  - 文書分類妥当性検証（Design 分離基準違反残留検出）
    - Decision要否確認ゲート（`agentdev-architecture-advisory` 経由でアーキテクチャ助言サブエージェントへ委譲）
    - アーキテクチャ助言サブエージェントへの入力標準テンプレート使用 + 出力 4 ラベル構造要求（REQ-004-042）。ラベル構造は soft-contract（DEC-003）とし、分類権限は親が保持する
  - 実行主体分類表（REQ-003-007）（委譲契約を定義する場合、実行主体分類表（adapter skill / command / subagent / harness）を必須とする（`docs/designs/workflows/delegation-contracts.md` 参照））。委譲を含まない要件では省略可
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
  - auto_gate完了ゲート（auto_gate.auto_ready:false または未解決項目の残存時、stop_reasons を提示し解消方策を壁打ちで合意）。解消時は auto_ready:true に更新。ユーザーが明示的に false 選択時は conflict_resolutions に記録し継続。未解決のままの場合は壁打ちへ差し戻し
- 要件doc確認（ユーザー提示のみ、承認は求めない）
  - 複数RU受付、統合/分離判定、出力生成、Epic規模検出、Wave候補記録、OU 構造検証
- 完了報告（work_type 別テンプレート選択）

req-define は Workflow Skill と手順番号を複製せず、公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止状態、必須順序、利用 skill 責務によって対応付ける（v2:REQ-0143-005）。
詳細は `command-file-format.md`「command Design と command 定義の対応付け（v2:REQ-0143-005）」参照。

### tentative_classification 最終確定のバリデーション（現行は REQ-008）

詳細は references/current-behavior-details.md を参照（遅延読み込み）。
### 判断根拠の維持・採用範囲の維持・両経路共通原則（RU-0255）

壁打ちからドラフト保存、Definition 保存までの各段階で、所有先判断（CREATE、APPEND、UPDATE、REQ操作なし、保留）とその根拠を draft-data（agreed_items、artifact_actions の source_items、conflict_resolutions）を通じて追跡可能に維持する。初期判断と異なる所有先へ保存する場合は再判断の根拠を記録する。判断不能な部分は未解決質問・保留として扱い、無断で解決済みにしない。

採用済み・未採用・採否不明が混在する入力では、採用根拠照合（STEP-2）の結果に基づき採用された対象・内容・範囲だけを保存対象とする。保存先ファイルへの書込み権限や編集範囲の存在だけを根拠に、採用されていない意味的変更を確定しない。重要変更の反映前通知と結果説明は既存の通知契約（REQ-108）に従う。

req-define 系経路の所有先判断、採用範囲の維持、保存結果の確認、中断後の再実行は、工程駆動系経路（phase-artifacts-update、REQ-110）に適用されるのと同じ基本原則に基づいて成立させる。両経路の成立は、公開入口から正規保存と保存結果確認までの実経路（GitHub版・Local版の対象経路を含む）で確認し、部品試験だけの成功をもって完了としない。

## 組立検査証拠の同一実行内引継ぎ

詳細は references/current-behavior-details.md を参照（遅延読み込み）。
## 調査委譲の全文機械抽出・安全な書込み・独立作業の並列化

詳細は references/current-behavior-details.md を参照（遅延読み込み）。
## REQ影響判定とDesign正規所有者確定

詳細は references/req-impact-determination.md を参照（遅延読み込み）。
## draft-data test_strategy フィールドスキーマ

詳細は references/test-strategy-schema.md を参照（遅延読み込み）。
## artifact_actions 生成

詳細は references/artifact-actions.md を参照（遅延読み込み）。
## draft-data artifact_actions フィールド形式

詳細は references/artifact-actions.md を参照（遅延読み込み）。
## review_dispositions の producer 契約

詳細は references/review-dispositions-schema.md を参照（遅延読み込み）。
## draft-data review_dispositions フィールドスキーマ

詳細は references/review-dispositions-schema.md を参照（遅延読み込み）。
## 未確定内容の auto_ready 抑止（REQ-008-059）

詳細は references/auto-ready-suppression.md を参照（遅延読み込み）。
## 所有関係と委譲

詳細は references/ownership-and-crossrefs.md を参照（遅延読み込み）。
## トレーサビリティ能力の利用

req-define は、既存の明示的な対応関係（`agentdev-traceability` の coverage）と impact を変更影響候補の確認に利用できる（REQ-021-011）。
あわせて、既存の下流成果物が依拠した上流の状態と現在の上流状態の比較に基づく差分候補を利用できる。取得機構は agentdev-traceability Design「impact 拡張（差分候補）」節を参照する。
問い合わせ結果は候補提供であり、CREATE, APPEND, UPDATE, SPLIT, MERGE, 意味的重複, canonical owner の最終判断は正規成果物本文と独立探索手段（README 索引、正規成果物の直接読取、`glob`, `grep`, `rg` 等）での確認後に下す。

- トレーサビリティ情報だけで変更対象、正規所有者、対象範囲を確定しない
- impact の空結果を「影響なし」の根拠としない
- 将来作成される実装成果物または検証手段との対応関係を推測して正規情報として保存しない
- agentdev-traceability の不在、実行失敗、空結果、候補過多だけを理由として workflow を停止しない（fail-open）。独立探索手段で継続し、正規成果物そのものの異常とトレーサビリティ機能側の異常を区別する

## 参照する横断 Design

詳細は references/ownership-and-crossrefs.md を参照（遅延読み込み）。
## 対象外

- 実装コードの作成、編集（壁打ちフェーズのみ）
- 関連ドキュメントの個別ファイル列挙をユーザーに求める
- `.agentdev/drafts/**` 以外のファイル作成、編集
- ユーザー明示入力ファイルの変更、削除、RU 削除
- `docs/` 配下の広範な探索（例外: 明示入力ファイル、`docs/requirements/**` 参照、変更影響候補抽出の限定探索）
- `inbox/` / `deferred/` 直接ロード
- 採用済み成果物の直読み
- `git` コマンド実行
- Issue 階層決定（case-open 責務）
- `execution_groups` セクション出力
- Design 分離基準（REQ-001-067）該当要件行の REQ 残留（`artifact_actions` へ分離）
- Decision判断における未確認事項の要件本文混入（REQ-003-002/004）
- アーキテクチャ助言サブエージェントによるファイル編集（REQ-003-003）

## 検証観点

- QG-1（Definition Integrity Gate）: 定義完全性ゲートで要件doc構造的完全性を検証（REQ/Design 分類、Decision ゲート、チェックボックス測可能性、必須フィールド完全性、artifact_actions 構成妥当性）
 - test_strategy 3要素完全性検査: 各 test strategy 項目が verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素を完全に保持すること。いずれかが欠落する項目を検出した場合、fail とする
- チェックボックス品質基準: `agentdev-req-analysis` に従い測定可能で一意
- artifact_actions 構成: REQ/Decision/Design 別 action が適切に統合されているか
- OU 構造検証: 要件doc確認工程で ou_id、operation、target_req/target_design、depends_on、result 整合性

## 停止状態

- auto_gate 完了ゲートで未解決項目が残る場合（stop_reasons を提示して解消方策を壁打ちで合意する。未解決のままの場合は壁打ちへ差し戻し、要件doc を確定させない）。
- tentative_classification の最終確定バリデーションで7値違反、フィールド欠落を検出した場合（確定を停止し、理由を提示、または backlog-review への差し戻しを提示する）。
- 前工程からの引き継ぎ判定（`agentdev_handoff: true`）検出時（要件展開を開始せず停止する）。
- adversarial-review 審議で unresolved な本質的争点が残る場合（最初の副作用（要件doc 保存）へ進まず停止する）。

## reference 選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 現在の動作の詳細（tentative_classification・判断根拠・組立検査証拠・調査委譲） の詳細が必要な場合 | references/current-behavior-details.md |
| 所有関係と委譲、参照する横断 Design の詳細が必要な場合 | references/ownership-and-crossrefs.md |
| REQ影響判定とDesign正規所有者確定 の詳細が必要な場合 | references/req-impact-determination.md |
| draft-data test_strategy フィールドスキーマ の詳細が必要な場合 | references/test-strategy-schema.md |
| artifact_actions 生成とフィールド形式 の詳細が必要な場合 | references/artifact-actions.md |
| review_dispositions の producer 契約とフィールドスキーマ の詳細が必要な場合 | references/review-dispositions-schema.md |
| 未確定内容の auto_ready 抑止 の詳細が必要な場合 | references/auto-ready-suppression.md |
| adversarial-review 挿入境界（req-define） の詳細が必要な場合 | references/adversarial-review-insertion.md |

## See Also

- [case-open.md](case-open.md)（後続コマンド（Issue 作成））
- [case-ready.md](case-ready.md)（後続コマンド（Definition 確定、REQ/Decision/Design 保存の内部責務実行））
- [case-revise.md](case-revise.md)（例外経路コマンド（再合意済み Definition 変更の反映））
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

## adversarial-review 挿入境界（req-define）

詳細は references/adversarial-review-insertion.md を参照（遅延読み込み）。
## 重要変更の通知と結果説明

壁打ちで合意した要件内容が既存の正規成果物（REQ・Decision・Design）への重要変更を含む場合、当該変更について、変更する理由、何をどのように変更する予定か、想定される影響、確定している事項と未確認の事項（該当する場合）を、draft 保存より前に利用者への実行出力へ通知する。通知は変更の意味を利用者が理解できる文章とし、変更ファイル一覧だけで代替しない。重要変更の識別はファイル数や変更行数ではなく変更の意味と影響に基づき、req-define 自身の判断責務として行う。

通知と承認は区別する。合意済み要件の具体化（委譲された裁量の範囲内）は事前通知のみで継続し、壁打ちによる合意形成と既存の HITL 境界を通知で代替しない。
