---
name: agentdev-case-run-execution-adapter
description: "case-run external execution adapter. USE FOR: connecting case-run issue execution to 実行担当サブエージェント via adapter skill delegation, handling completed-pr/blocked/failed/delegation-unavailable results. DO NOT USE FOR: workflow state management, Issue completion checkbox evaluation."
---

# case-run 外部実行アダプター（External Execution Adapter）

case-run が1 Issue 単位（または1 Wave 単位）の実装作業を実行担当サブエージェントへ接続する際のアダプタープロトコル（adapter protocol）を定義する知識ベースである。
adapter skill 経由での委譲起動、委譲 prompt 内で実行 command を指定する委譲に基づく。
対象を case-run に限定する。

- **参照元**: `case-run`（実行担当サブエージェント起動時）
- **特性**: アダプタープロトコルの宣言的定義のみ提供する。Epic/Wave orchestration、worktree 管理、完了条件チェックボックス評価は本スキルの対象外。

## 入力

- case-run から引き渡される worktree root（相対パス）、ブランチ名、対象 Issue 番号、委譲 prompt 内の実行 command 指定

## 出力

- result 契約の4状態いずれか（`completed-pr` は PR番号/ PR URL を伴う）

## 副作用

- worktree root 配下でのみファイル編集を行う（メインリポジトリには触れない）
- PR 作成、Issue コメント追加は実行担当サブエージェントが実施（Custom Tool `agentdev_gh` 経由）

## 実行モデル

```
case-run (orchestration)
  └── adapter skill を読み込んだ実行担当サブエージェントへ委譲（委譲 prompt 内で実行 command を指定）
        ├── Issue 本文・受け入れ基準読込（実行 command が success criteria に分解）
        ├── ADR / REQ / Design / docs / repository context 再確認
        ├── 実行 command による evidence-backed 実装・品質ゲート（code review + QA review + gate review）
        ├── test strategy 項目の test-fix ループ（項目ごと検証、不合格時 fix-and-reverify / record-in-findings、全項目処理まで反復）
        ├── blocker 処理
        ├── PR 作成操作（agentdev_gh pr_create）による PR 作成（PR URL を result に格納）
        └── result を case-run へ返却
```

- **case-run 本体**: 単一 Issue または単一 Wave（Epic Issue 指定時、最大5件並列）で実行担当サブエージェントを委譲起動し、result を処理する。実装実行そのものは行わない。起動手段は AGENTS.md および references/harness-delegation.md 参照。
- **実行担当サブエージェント**: 外部実行基盤（AGENTS.md で選定）が提供するエージェント型。1 Issue あたり1起動。adapter skill（`agentdev-case-run-execution-adapter`）を読み込み、委譲 prompt 内で実行 command を起動する。仕様を再解釈、再設計しないアダプターである。
- **実行 command（harness が提供）**: 委譲 prompt 内で指定される実行 command（skill ではない）。Issue を success criteria に分解、各 criterion に observable evidence を要求、品質ゲートを実行する。各ツール呼び出しの保護（timeout 等）は harness 側が提供する。command の具体名、起動手段は AGENTS.md および references/harness-delegation.md 参照。
- **外部実行基盤（external execution boundary）**: 実行担当サブエージェントの背後で実行エンジンとして振る舞う外部実行境界。本境界は I/O 境界要件により I/O 境界 Design が正規所有し、case-run は自身で所有せず I/O 境界 Design へ委譲する。plan artifact 等の中間成果物の内部構造には依存しない。最終結果は **PR URL** で受領する（透明）。

## external execution boundary と harness execution mechanism

本 adapter skill は external execution boundary への委譲契約を使用し、harness execution mechanism を ADF 規範所有対象外として扱う。

| 区分 | 内容 | 正規所有者 |
|---|---|---|
| external execution boundary | 外部バックエンド接続（実行担当サブエージェント起動、result 受領、PR URL 受領）。adapter skill 経由の委譲契約、result 4状態契約、worktree 隔離、Findings / Design確定候補の PR 本文引き継ぎを含む | I/O 境界 Design。case-run は I/O 境界 Design へ委譲し、自身は所有しない |
| harness execution mechanism | agent 起動 API、background task、並列実行、context 管理、timeout、retry、queue、heartbeat | harness 責務（ADF 規範所有対象外）。AGENTS.md および `references/harness-delegation.md` に配置 |

harness execution mechanism は本 SKILL の規範対象外とし、`references/harness-delegation.md` へ集約する。
用語の正規定義と所有者は responsibility-boundary-purification Design「case 実行責務の 4 用語と所有者」を SSoT とする。

## 実行担当サブエージェントの責務

実行担当サブエージェントは以下を順に実行する:

1. **Issue 読込**: 対象 Issue 本文、受け入れ基準を読み込む。実行 command が Issue を success criteria に分解する
2. **context 再確認**: ADR/ REQ/ Design/ docs/ repository context を再確認し、実装が既存の決定事項に矛盾しないことを担保する。
トレーサビリティ能力（`agentdev-traceability` の coverage）を、対象要件と正規成果物の既存の対応関係確認に利用できる。
問い合わせ結果は候補提供であり最終判断としない、新規の依存関係、実行構成、Wave 構成、実行順序の設計には使用しない、機能の不在、実行失敗、空結果、候補過多の場合は README 索引、正規成果物の直接読取、`rg` 等の代替探索で継続する（fail-open）
3. **実装、検証、PR 作成**: 実行 command に従い evidence-backed に実装を実行し、品質ゲートを通して `agentdev_gh` の pr_create 操作で PR を作成する。
実際に要件を実現する成果物へ実装対応を、実際に要件を検証する恒常的な検証手段へ検証対応を、対応宣言として正規成果物へ明示する（単に変更されたファイルであることを理由に、そのファイルを要件へ自動的に対応付けない）。
PR 本文には実行識別情報セクション（対象 Case、PR、実行単位、委譲単位識別子と委譲目的、実行結果）を記録する。形式は `agentdev-workflow-templates` の実行識別情報セクション規約に従い、委譲 prompt の委譲識別情報ブロックから `adf_delegation` へ転記する。
PR 本文には検証差分セクション（実行工程、検証種別、検証結果、finding 差分の5分類: 新規、修正済み、既出、撤回、無効）を記録する。形式は `agentdev-workflow-templates` の検証差分セクション規約に従い、実施した各検証（test strategy 項目検証、品質ゲート等）ごとに実行工程 case-run の行として記録する。
PR 作成前に `agentdev-traceability` の check を実行し、対象要件の実装対応、検証対応、対応宣言の整合性を検査する。check の不合格が承認済み対象範囲内で修正可能な場合は修正して再検証し、要件変更、対象範囲拡大、追加設計判断、外部依存解消が必要な場合は blocked として判断事項を報告する。
ハーネスの plan artifact 等の中間成果物は解釈せず、PR URL で最終結果を受領する。
実装完了後、test strategy 項目の test-fix ループ（後述）を実行する
4. **blocker 処理**: 回答可能な blocker（ADR/REQ/Design/docs/Issue本文で回答できるもの）は自律的に実行 command 内で再評価できる
5. **result 返却**: 後述の result 契約に従い case-run へ返却する

## test strategy 項目の test-fix ループ（REQ）

実行担当サブエージェントは実装完了後、Issue 本文のテスト戦略セクションに含まれる各 test strategy 項目（3要素構造: verification / pass_criteria / on_failure）について以下のループを実行する。
全項目の処理が完了するまで反復する。

1. **項目ごとの検証**: 各 test strategy 項目の `verification` 手順に従い検証を実行し、`pass_criteria` を満たすか確認する
2. **不合格時の処置**: 検証結果が `pass_criteria` を満たさない場合、当該項目の `on_failure` に従い以下いずれかを実行する:
   - **fix-and-reverify**: 実装を修正し、当該項目の検証を再実行する。再検証で合格するまで修正と再検証を反復する
   - **record-in-findings**: 実装修正で対応困難な場合（仕様上の制約、スコープ外の原因等）、当該項目を不合格理由とともに PR 本文の `## Findings / Capture候補` セクションに記録する
3. **全項目処理までの反復**: 未処理の test strategy 項目が残る場合、1〜2 を繰り返す。全項目が「合格」または「Findings 記録済み」のいずれかに分類されるまで反復を完了しない

## Result 契約（最小契約）

実行担当サブエージェントは以下のいずれか1状態を返す:

| result | 意味 | 成果物 |
|---|---|---|
| `completed-pr` | 実装完了、PR作成済み | **PR番号**を伴う。case-run の成功成果は PR 作成である |
| `blocked` | 回答可能な blocker に遭遇 | 詳細本文は **Issue コメント** に SSoT として記録される |
| `failed` | repository context で回答不能な blocker | 詳細本文は **Issue コメント** に構造化して記録される |
| `delegation-unavailable` | 実行インフラが委譲を起動できなかった状態 | 実行未試行のため `pending` に戻す |

### SSoT（信頼できる情報源）

| 状態 | SSoT |
|---|---|
| 成功（completed-pr） | **PR 本文** |
| blocked/ failed | **Issue コメント** |

一時会話コンテキスト、ローカル変数、中間ファイルは SSoT としない。

## 責務境界（非対象）

本プロトコルは以下を扱わない。各責務主体に委譲する:

| 非対象 | 責務主体 |
|---|---|
| workflow state 管理（Issue/PR/worktree） | case-run |
| 複数 Issue/ Epic orchestration | case-auto/ case-run |
| Issue 完了条件チェックボックスの評価、更新 | case-close |
| 完了条件チェックボックスの最終完了判定 | case-close |
| req-define のアーキテクチャ確認 | `agentdev-architecture-advisory` |

実行担当サブエージェント、外部実行基盤は Issue 本文の完了条件チェックボックスを更新しない（PR 作成後に case-close が別コンテキストで評価する）。

## worktree 隔離の遵守（禁止事項）

実行担当サブエージェントは worktree root（`.worktrees/{N}-{type}/`）以外のパスでファイル編集を行わない。
case-run から引き渡された worktree root（相対パス）配下でのみ作業する。

| 禁止事項 | 違反時の対応 |
|---|---|
| worktree root 以外のパス（メインリポジトリルート直下、他 worktree 等）でのファイル編集 | メインリポジトリでの作業を検知した場合は直ちに作業を停止し、`failed` として result を返却する。詳細本文は Issue コメントに SSoT として構造化して記録する |
| メインリポジトリパスを引き渡し、使用すること | case-run は worktree root（相対パス）のみを引き渡す。実行担当サブエージェントは受け取った worktree root 配下でのみ作業する |

**自己検証**: 実装作業開始前に `agentdev-git-worktree` の検証ヘルパー（`.opencode/skills/agentdev-git-worktree/references/worktree-operations.md`「worktree 内判定ヘルパー」参照）で現在 worktree 内にいることを自己検証する。
メインリポジトリにいると判定された場合は実装を開始せず `failed` として result を返却する。

## Findings/ Capture 配置

本筋外の検出事項（Findings）/ Capture 候補（intake/ learning）は **PR 本文** の `## Findings / Capture候補` セクションに記述する。
capture 境界の詳細は `agentdev-workflow-orchestration` を参照。
実行担当サブエージェントは `.agentdev/intake/`、`.agentdev/learning/` を直接変更しない。

## Design確定候補配置

実装時に発見された Design レベルの詳細（Design に記載すべき schema、enum、判定表、内部アルゴリズム等）は PR 本文の `## Design確定候補` セクションに記録する。
`## Findings / Capture候補` とは別セクションとし、混在させない。
実行担当サブエージェントが記録し、case-close STEP-3 の Design 確定チェックの入力となる。

## 外部成果物の取扱い

外部実行基盤の結果は **PR URL** で受領する（透明）。
plan artifact 等の中間成果物の内部構造には依存しない。
実行担当サブエージェントは中間成果物の内部構造に依存した処理、検証を行わず、result 契約（4状態）のみで接合する。
AgentDevFlow の永続状態は既存の draft/ Issue/ PR/ REQ/ ADR/ Design に限定し、中間成果物を永続状態として扱わない。

## STEP model 連携（REQ-{NNNN}-{NNN}、DEC-{N}）

本スキルは Capability Skill として、case-run Workflow Skill の `execute` STEP（`agentdev-workflow-orchestration` 参照）から委譲起動される（`<workflows/workflow-skill-model>` Design）。
本スキル自身は case-run workflow の STEP を所有せず、委譲契約（4状態 result）で case-run 側 STEP へ接合する。

### 委譲コンテキストと Input Resolution

委譲起動時に case-run から引き渡される worktree root、ブランチ名、Issue 番号、実行 command 指定は、永続状態の優先順位（`<workflows/input-resolution-and-durable-state>` Design）に従い、case-run `execute` STEP の入力解決（Input Resolution）で解決された入力である。
実行担当サブエージェントは委譲内で Issue 本文、REQ/Decision/Design を SSoT 再構成（最上位優先）で再取得・再検証し、自然言語の前STEP result のみに依存しない。

### 委譲内シーケンスと result 接合

実行担当サブエージェントの責務（Issue 読込、context 再確認、実装・検証・PR 作成、blocker 処理、result 返却）は adapter 委譲内の内部シーケンスであり、case-run 側からは result 4状態（`completed-pr` / `blocked` / `failed` / `delegation-unavailable`）のみで観測される。
内部シーケンスの STEP 遷移を case-run workflow の STEP model へ投影せず、PR URL（成功時）または Issue コメント（blocked/failed時）を SSoT として扱う。
STEP reference 8 要素は `<workflows/step-reference-contract>` Design 参照。

## 委譲抽象IF

- case-run は adapter skill（`agentdev-case-run-execution-adapter`）を読み込んだ実行担当サブエージェントへ委譲を起動する（委譲 prompt 内で実行 command を指定）。起動手段、実行制御パラメータは AGENTS.md および references/harness-delegation.md に配置する。
- 委譲起動方式の具体的な実装（実行担当サブエージェント起動、委譲 prompt 構築、evidence 確認、result 受領、timeout/ retry、category 設計）は `references/harness-delegation.md` 参照
- 実行担当サブエージェントが利用不可の場合は委譲起動失敗として検知される（後述「委譲起動不能時の取扱い」および references/harness-delegation.md「委譲起動失敗、異常終了時事後処理」参照）
- Issue 本文に req-define 壁打ち合意の実行計画方向性（参考情報）が含まれ得る。実行担当サブエージェントはこれを参考情報として扱い、束縛されない

## 委譲起動不能時の取扱い

委譲起動不能時（実行担当サブエージェント型が不許可、起動 API 異常等）は、result 契約の `delegation-unavailable` を返し、Issue を `pending` に戻して case-run を停止する（委譲契約 Design「委譲種別」注記）。

インラインフォールバック（case-run が自ら実装・検証を実行する逐次パス）は harness 固有の実行制御として配布 Design および本 SKILL から除外する。
委譲起動手段、能力検出、インライン代替の有無は harness execution mechanism に属し、harness の責務として AGENTS.md および `references/harness-delegation.md` に配置する（委譲契約 Design「委譲種別」注記）。

`references/harness-delegation.md`「委譲起動失敗、異常終了時事後処理」は**委譲起動後**の異常終了に対する事後処理であり、本節の委譲起動不能（事前判定）とは対象段階が異なる。

## reference選択表

通常経路で全 reference を無条件読込しない。
必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 委譲起動の具象実装（起動方式、worktree 取り扱い、PR 作成と URL 受領、result 受領、evidence 確認、timeout/ 中断、委譲プロンプト構築例、委譲プロンプト雛形）が必要な場合 | [references/harness-delegation.md](references/harness-delegation.md) |
| 委譲プロトコルと category 設計（`writing` category と発火スキルの相互作用、`unspecified-high` 推奨根拠、category 選定ガイドライン、MUST NOT DO 必須化）が必要な場合 | [references/harness-delegation.md](references/harness-delegation.md) |
| 委譲起動失敗、異常終了時の事後処理（worktree git status 確認、変更残留時の分類、残留箇所の grep 検出、手動修正または PR 化）が必要な場合 | [references/harness-delegation.md](references/harness-delegation.md) |
| adapter 委譲内 adversarial-review 統合（実装方針形成、review 呼出、結果反映、blocked 遷移の実行時詳細手順、候補判断基準、呼出失敗時の取扱い）が必要な場合 | [references/adversarial-review-integration.md](references/adversarial-review-integration.md) |

## adversarial-review 統合（case-run: adapter 委譲内）

本スキルは case-run の adapter 委譲内（REQ-{NNNN}）における adversarial-review 統合（実装方針形成、review 呼出、結果反映、blocked 遷移）の実行時参照を提供する。
正規原本は `agentdev-case-run-execution-adapter` Design「adversarial-review 統合（実装方針→review→結果反映）」節である（REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}）。
本 SKILL.md は重複定義せず、詳細は `references/adversarial-review-integration.md`「adversarial-review 統合（adapter 委譲内）」節を参照。

呼出元（case-run command）と本スキルの主な契約（詳細は Design と reference を正とする）:

| 契約 | 要件 | 概要 |
|---|---|---|
| 実装方針の形成と限定 | REQ-{NNNN}-{NNN} | 委譲内で既確定 Issue/REQ/ADR/Design を実現する内部選択として実装方針を形成する。case-run 本体は形成しない |
| 実施位置 | REQ-{NNNN}-{NNN} | 最初の実装変更前に実施する（実装、検証、PR 作成より前） |
| 委譲内 review 呼出 | REQ-{NNNN}-{NNN}/{NNN} | adapter 委譲内で実行担当サブエージェントが発動条件判定（ユーザー明示指定）と review 呼出を分離して実施する |
| blocked 遷移（実装方針限定違反） | REQ-{NNNN}-{NNN} | 実装方針が既確定文書の変更、追加、撤回を必要とする場合は blocked へ遷移する |
| blocked 遷移（要件/仕様問題） | REQ-{NNNN}-{NNN} | 要件、仕様問題を検出した場合は勝手に仕様変更せず blocked へ遷移する |
| blocked 遷移（unresolved 残存） | REQ-{NNNN}-{NNN} | unresolved な本質的争点またはユーザー判断事項が残る場合は実装の最初の変更へ進まず blocked へ遷移する |
| 従来フロー維持 | REQ-{NNNN}-{NNN} | 発動条件非該当時、呼出失敗時は委譲内の従来フロー（実装方針形成、実装、検証、PR 作成）を維持する |
| accepted finding 反映 | REQ-{NNNN}-{NNN} | accepted finding の実装方針への反映は adapter 委譲内の実行担当サブエージェント責務 |
| 再 review 条件 | REQ-{NNNN}-{NNN} | 意味内容変更時のみ再発動可能、同一 finding 再起票禁止（正は adversarial-review Design） |
| 呼出失敗時の扱い | REQ-{NNNN}-{NNN} | silent skip 禁止、従来フロー維持（正は adversarial-review Design） |
| 副作用境界 | REQ-{NNNN}-{NNN}/{NNN} | `semantic_review`（書き込み禁止型）、新規 artifact 非生成（正は adversarial-review Design、delegation-contracts Design） |

## See Also

- **agentdev-workflow-orchestration**: サブエージェントプロトコル、capture 境界
- **agentdev-workflow-templates**: PR 本文、コメント SSoT のテンプレート構造
- **Design `delegation-contracts.md`**: 委譲契約横断 Design、case 実行責務の 4 用語
- **Design `responsibility-boundary-purification.md`**: case 実行責務の 4 用語と所有者 SSoT
- **references/harness-delegation.md**: 委譲起動、category 設計、異常終了回復の具象実装ノート
