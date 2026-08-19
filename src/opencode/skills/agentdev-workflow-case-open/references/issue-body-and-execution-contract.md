# STEP-2: Issue 本文生成・execution contract 確定（issue-body-and-execution-contract）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の Control Plane STEP-2 詳細である。
> Issue 本文生成と execution contract 確定の手順を提供する。

## Purpose

Issue 本文候補を生成し、execution contract を確定する。

## Input Resolution

1. SSoT 再構成: 要件doc（draft-data、`agreed_items`、`artifact_actions`、`test_strategy`、`review_dispositions`）、対象 REQ/Decision/SPEC、関連 ADR（Decision）
2. identifier 保持: REQ-ID、DEC-ID、OU ID、AG-ID
3. 最小 scalar: なし
4. runtime artifact: Issue 本文候補ファイル（委譲接続点経由）

## Preconditions

- STEP-1 で処理対象が確定している

## Procedure

### Issue 本文生成（委譲接続点）

詳細、委譲接続点（サブエージェントは REQ 読解、テンプレート充足検査、完了条件候補抽出のみを返し、親エージェントが本文確定と Issue 作成）は `agentdev-issue-management` を参照。
本文候補の受け渡しは `agentdev-issue-management` の「委譲接続点と本文受け渡し」セクションに従いファイルパス経由で行う（G25）。

### QG-2 完了条件網羅性検証（2-1 / 2-1a / 2-1b）

Issue 本文生成後、Issue 作成前に `agentdev-quality-gates` の QG-2 に従い完了条件が対象 REQ/Decision/SPEC の必達要件を網羅しているかを検証（fail 時は req-define 差し戻し推奨）。

- **2-1a**: 数値閾値到達可能性検証（QG-2 観点6、#1538 由来、要件定義者が明示した閾値のみ受け付け、自動推論しない）
- **2-1b**: スコープ明示（本 Issue 対象範囲 vs 全体、#1532 由来、QG-4 観点8 判定マトリクスの入力前提、識別子中心、横断評価は「全体」デフォルト）

### test_strategy 埋め込み（2-2、REQ）

draft-data の `test_strategy` を読み取り、Issue 本文の「テスト戦略」セクションに 3 要素構造（`verification` / `pass_criteria` / `on_failure`）で反映（スキーマは req-define command SPEC extension 経由）。
未定義の場合はテンプレートのプレースホルダをそのまま残す。

### 識別子中心記載・最新状態再確認・evidence 転記（2-3 / 2-4 / 2-5）

- **2-3**: 識別子中心の記載粒度ガイドライン（case-run の QG-3 前置 staleness check の入力前提、詳細・記載例は `agentdev-issue-management` 参照）
- **2-4**: 完了条件展開前の最新状態再確認（同日内複数 PR マージ後・順次 Wave 実行時の後続 Wave Issue 起票で必須、識別子存在確認を主軸）
- **2-5**: review_dispositions の読取・evidence 再確認・証跡転記（consumer 契約は case-open command SPEC extension 経由、evidence 失効時は停止し `stale_target` へ更新）

各詳細は `agentdev-issue-management`、case-open command SPEC（extension 経由）を参照。

### execution contract 確定ステップ（2-6）

Issue 本文生成前に次の確定ステップを実行し、結果を Issue 本文の対応セクション（対象範囲、test strategy、完了条件、Execution Contract セクション）へ反映する。
詳細な判定規則、対応表は case-open command SPEC（extension 経由）「execution contract 確定ステップ」節、artifact-quality-control-routing SPEC（extension 経由）を正とする。

#### 変更対象成果物の確定

合意済み要件doc の `artifact_actions` から変更予定成果物を抽出し、Issue 本文の「対象範囲」セクションへ確定する。

#### 必須品質統制の導出と test strategy 投影

artifact-quality-control-routing SPEC の合成規則に従い変更予定成果物の種別から必須品質能力を導出する。
各能力について test strategy 項目を生成し、Issue 本文の test strategy セクションへ投影する。

#### 完了条件の確定

合意内容から成果状態を抽出し、Issue 本文の完了条件セクションへ確定する。
実行手段、検証手段は test strategy へ分離する。
必須品質能力の呼出自体が利用者要求でない限り、Skill 呼出を完了条件化しない。

#### 関連 ADR 拘束条件の特定と反映

Issue の実装を拘束する関連 ADR を特定し、必要な制約を完了条件または test strategy へ反映する。

#### 予定変更内容から事前判定可能な追加検証条件の展開

「関数削除時は全利用箇所を検査する」等、予定変更内容から事前判定可能な検証条件を test strategy へ展開する。
case-open が追加できる test strategy は合意済み変更対象と共通ルールから決定的に導ける必須検証に限定し、新しい利用者要求を生成しない。

#### scope-affecting impact candidate の探索と反映

Issue 作成前に変更影響候補を探索し、scope、完了条件、test strategy に影響する候補を execution contract へ反映する。

#### adversarial-review 発動契約の永続化

ユーザー明示指定による adversarial-review 発動契約が Issue 作成前に判明している場合、Issue 本文の契約セクションへ永続化する（経路F 拡張）。

#### execution contract 必須セクションの付与

新規 Issue 作成時、新契約識別用の必須セクション（Execution Contract セクション、必須品質統制セクション）を Issue 本文へ付与する。
presence-based 判定により新旧 Issue を識別する。
テンプレート（`issue_desc_feature.md`、`issue_desc_child.md`）の Execution Contract セクション構造は `agentdev-workflow-templates` を参照。

## 共通ルール（STEP 全体適用）

- **VERIFY**: gh CLI 書込後は毎回 `agentdev-gh-cli` VERIFY 操作で検証
- **テンプレート準拠**: テンプレート読込後は毎回【必須】セクションの完備を確認、【任意】は内容がある場合のみ含める、欠落時は再生成

## Result

- Issue 本文候補（execution contract 反映済み）
- QG-2 完了条件網羅性検証合格
- test_strategy 埋め込み済み（3 要素構造）

## Evidence

- Issue 本文候補のファイルパス、QG-2 検証結果、execution contract 確定結果、test_strategy 反映状態

## Completion Verification

- QG-2 が合格であり（fail 時は req-define 差し戻し推奨）、execution contract 必須セクションが本文候補へ付与されていること

## Resume-Idempotency

- 本文候補はファイルパス（durable state）で保持するため、中断再開時は候補ファイルを再読込して未実行の確定ステップのみ再実行する

## resume point

- Issue 本文候補のファイルパス（`agentdev-issue-management` 委譲接続点）
- QG-2 検証結果、execution contract 確定結果、test_strategy 反映状態

## 関連 STEP

- 前: STEP-1（handoff-and-ou-gate）
- 次: STEP-3（execution-unit-and-preflight）

## 関連 Capability Skill

- `agentdev-issue-management`: Issue 操作の安全手続き、委譲接続点
- `agentdev-quality-gates`: QG-2 完了条件網羅性検証
- `agentdev-workflow-templates`: テンプレート選定・構造
