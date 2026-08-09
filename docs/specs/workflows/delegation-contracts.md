---
title: サブエージェント委譲契約
status: accepted
created: 2026-06-21
updated: 2026-07-27
---

# サブエージェント委譲契約（横断）

> 本 SPEC は v2:ADR-0112 で定義されたサブエージェント委譲の一般概念に基づく共通契約を定義する。
> 個別 command / skill の委譲利用は各 SPEC を参照のこと。

## 目的

manager-orchestrator 以外のコマンドパターンから保存、更新を親に残す検査、分類委譲を行う際の最小契約と制約を定める。
`lightweight-delegation`（軽量委譲）は主要パターンではなく、主要な実装分類に重ねる委譲の扱いである。

## 委譲時最小契約

委譲時の最小契約は v2:ADR-0112 §5 に従い以下の要素を中心に記述する。
`delegation_type` と `on_result` は必須 envelope ではなく、必要な場合のみ参考ラベルまたは親側の扱いとして記述する。

```yaml
inputs:
  scope:
    - {対象ファイル、Issue、PR、ログ、成果物パスなど}
  constraints:
    - {参照してよい基準、読んでよい範囲、除外対象}
side_effect_boundary:
  allowed:
    - read_files
    - inspect_content
    - classify_candidates
    - return_summary
    - return_evidence
    - return_artifact_body_when_requested
  forbidden:
    - file_write
    - issue_pr_update
    - commit
    - push
    - user_confirmation
output_contract:
  status: pass | warn | fail | partial
  summary: {判定結果の要約}
  evidence:
    - {根拠ファイル、行、ログ、観測事実}
  artifact_body: {成果物本文がある場合のみverbatimで返す}
  parent_decision_required:
    - {親エージェントが判断・保存・確認すべき事項}
  side_effects: none
capture_handoff:
  intake_candidates:
    - {具体的な修正候補。保存は親エージェントが判断する}
  learning_candidates:
    - {再発防止知見候補。保存は親エージェントが判断する}
```

`side_effect_boundary` に `read_only` のような包括値（blanket value）を使用せず、許可する操作を具体名で列挙すること。

## 委譲種別（delegation_type 参考分類）

delegation_type は参考分類であり、Command 本文での使用は任意である。
分類ラベルより、実際の入力範囲、副作用境界、返却内容を優先する。

| delegation_type | 用途 | 書き込み | 書き込み許可条件 |
|---|---|---:|---|
| `gate_check` | 完了判定、ガードレール充足確認、保存前/close前検査 | 禁止 | - |
| `semantic_review` | 文書、差分、REQ/Decision/SPECの意味レビュー | 禁止 | - |
| `log_analysis` | テストログ、CIログ、review結果解析 | 禁止 | - |
| `classification` | 成果物 / 検出事項 / intake / learning の分類 | 禁止 | - |
| `extraction` | 候補、論点、未回収事項の抽出 | 禁止 | - |
| `draft_generation` | Issue本文、PR本文、レポート案などの草案生成 | 禁止 | - |
| `controlled_case_execution` | case-run Epic / 複数Issue実行 | 条件付き | case-run のみ |
| `step_execution` | case-auto からの構成工程（req-save / spec-save / case-open / case-close）の実行担当サブエージェント起動 | 許可 | case-auto からの工程委譲のみ。各工程のコマンド定義ガードレールに従う。委譲起動不能時の扱いは `delegation-unavailable` 状態として報告する（REQ-002-003/004）。起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md 参照 |

※ step_execution の委譲起動手段（起動方法、実行制御パラメータ）は harness の責務として AGENTS.md および references/<harness>.md に配置する（REQ-002-002）。委譲起動不能時は `delegation-unavailable` 状態として報告し、インラインフォールバックは harness 固有の実行制御として配布 SPEC から除外する（REQ-002-004）。

## 委譲制約

| 制約 | 説明 |
|---|---|
| 対象を直接修正しない委譲（書き込み禁止型） | gate_check / semantic_review / log_analysis / classification / extraction / draft_generation は検査対象アーティファクトを変更せず、許可操作は read_files / inspect_content / return_evidence 等に限定する |
| 親コマンド最終判断 | サブエージェントは判断の入力を提供し、最終決定は親コマンドが行う（v2:ADR-0112 §4） |
| 中間成果扱い | サブエージェント出力は中間成果であり、親コマンドは一部を採用、修正、却下できる（v2:ADR-0112 §6） |
| 成果物本文の verbatim | Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物はそのまま（verbatim）返す |
| 判定結果の圧縮 | 判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す |
| Script 優先 | 単純な決定的検査は Script 優先。非決定的処理（意味レビュー、分類、抽出等）にサブエージェント委譲を適用 |

## case 実行責務の 4 用語と委譲（REQ-006、REQ-011-017、REQ-011-018）

case 実行に関わる責務は 4 用語へ分解され、各委譲種別は対応する用語の所有権に従う。
用語の正規定義と所有者は [responsibility-boundary-purification.md](../responsibilities/responsibility-boundary-purification.md)「case 実行責務の 4 用語と所有者」を SSoT とする。本節は委譲契約からの参照レベルに留まる。

| 用語 | 定義 | 正規所有者 | 関連する委譲種別 |
|---|---|---|---|
| orchestration stage | case-auto が管理する command 間進行 | REQ-006 / case-auto | `step_execution`、case-auto からの工程委譲 |
| case-run internal lifecycle | 単一 Issue または Wave 内の準備、実行、提出 | REQ-006 / case-run | `controlled_case_execution` |
| harness execution mechanism | agent 起動、background task、並列実行、context 管理 | harness 責務（ADF 規範所有対象外、REQ-011-018） | なし（委譲対象外、配布物から抽象化） |
| external execution boundary | REQ-011 が所有する外部バックエンド接続 | REQ-011（REQ-011-017） | `controlled_case_execution`、`step_execution` 経由で REQ-011 へ委譲 |

### external execution boundary 委譲（REQ-011-017）

`controlled_case_execution`（case-run）と `step_execution`（case-auto）は外部バックエンド接続を自身で所有せず REQ-011 へ委譲し、自身は所有しない。
case-run は adapter skill（`agentdev-case-run-execution-adapter`）経由で external execution boundary への委譲契約を使用し、実行担当サブエージェントの起動と result 受領を外部実行境界として取り扱う。
adapter skill が規定する result 4状態（completed-pr / blocked / failed / delegation-unavailable）、worktree 隔離、PR URL 受領、Findings / SPEC確定候補の PR 本文引き継ぎは external execution boundary 委譲契約の構成要素である。

### harness execution mechanism の ADF 規範所有対象外（REQ-011-018）

agent 起動、background task、並列実行、context 管理は ADF 配布物の規範所有対象外とし、harness 責務とする。
委譲起動手段（起動方法、実行制御パラメータ）、能力検出、インラインフォールバックの有無は AGENTS.md および `references/<harness>.md` に配置し、本 SPEC では規範を持たない。
「委譲種別」の注記に既述のとおり step_execution の起動手段も harness 責務であり、本 SPEC から除外する。

## manager-orchestrator と軽量委譲の分離

| 項目 | manager-orchestrator | 軽量委譲 |
|---|---|---|
| 適用コマンド | case-run / case-auto | 上記初期適用対象（v2:ADR-0112、case-auto の工程委譲を含む、v2:ADR-0127） |
| 委譲規模 | 複数サブエージェント統制、Wave scheduling、障害伝播 | 単一タスク委譲（case-auto の構成工程委譲は step_execution で各工程単位） |
| 状態管理 | 大規模な状態機械、自己修復ループ | なし（一方向の入出力） |
| プロトコル | case-run 専用サブエージェントプロトコル（`agentdev-case-run-execution-adapter`）、case-auto は工程別委譲契約（v2:ADR-0127） | 本汎用サブエージェント委譲契約 |
| 書き込み | すべて許可 | 原則禁止（controlled_case_execution / step_execution のみ条件付き） |

## 初期適用対象

各 command / skill の具体的委譲利用は各 SPEC を参照。
本節は参考例である。

| コマンド | 委譲種別 | 委譲内容 |
|---|---|---|
| req-define | extraction / classification | 入力整理、既存文書照合、関連文書候補抽出 |
| case-run | gate_check / semantic_review / log_analysis | 検査、解析系ステップ |
| case-auto | step_execution（v2:ADR-0127） | 構成工程（req-save / spec-save / case-open / case-close）の実行担当サブエージェント起動。各工程のコマンド定義を authoritative source として実行し、結果（Issue/PR番号、pass/warn/fail）を case-auto に返す |
| inspect-docs | semantic_review / classification | 意味レビュー、分類一貫性確認 |
| backlog-review | classification / semantic_review / extraction | artifact分析、統合/分割、矛盾検出 |
| learning-promote | classification / gate_check | 分類、評価、既存対策確認 |
| intake-promote | semantic_review / classification / draft_generation | itemレビュー、分類案生成 |

## 責務分界（委譲関連）

| 責務 | 定義場所 |
|---|---|
| 公開API、入力、出力、ガードレール、高レベルStep | Command定義（`src/opencode/commands/agentdev/*.md`） |
| 再利用可能な判断基準、検査観点の詳細 | Skill references（`references/*.md`） |
| 委譲インタフェース（共通エンベロープ、delegation_type 分類、制約） | 本 SPEC |
| 委譲のアーキテクチャ判断（一般概念、manager-orchestrator位置づけ、検査、分類委譲の許容） | v2:ADR-0112 |
| case-run 専用プロトコル（起動仕様、プロンプト構成、Epic Wave 実行/クローズモデル） | `agentdev-case-run-execution-adapter` skill references |
| 編集安全手順、AST-grep運用、大規模ファイル分割 | `agentdev-case-run-execution-adapter` skill references |
| 委譲定義の最小構成、delegated_check、中間成果基準 | `agentdev-command-authoring` skill references |
| 決定的な変換、検証、生成 | Script（`scripts/*.js`） |

## case-auto 並列委譲モデル拡張（REQ-006-087〜093）

### 並列委譲と直列集約の分離

各工程のサブエージェント委譲を以下の2系統に分離する:

| 工程 | 並列対象（最大5件） | 直列集約対象（親コマンド責務） |
|---|---|---|
| case-open | 子Issue 本文案作成、検査、Issue 作成 | Epic Issue 作成、Wave 1 配置、Epic 本文ステータス追跡テーブル更新 |
| case-run | 同一 Wave 内子Issue の実装委譲 | Wave 結果集約 |
| req-save | 複数 REQ/Decision ファイルの変更案作成、検査 | 採番、index 更新、draft 更新、commit、push |
| spec-save | 複数 SPEC ファイルの変更案作成、検査 | 採番、index 更新、draft 更新、commit、push |

### 集約原則

- 並列委譲された単位の成功、失敗は親コマンドが集約し、最終判定に反映する（REQ-006-092）
- 直列集約対象は並列委譲の完了を待ってから親コマンドが実行する（REQ-006-093）

## case-auto 委譲契約 MUST NOT DO 精密化（REQ-003-004）

case-auto の MUST NOT DO を「実質的 SPEC / REQ / ADR 内容編集禁止（lifecycle 状態遷移 `draft`→`accepted` は除く）」へ精密化する。状態遷移操作と内容編集操作の分類判定表:

| 操作分類 | case-auto での可否 |
|---|---|
| SPEC / REQ / ADR 本文（要件行、判定基準、アーキテクチャ決定）の編集、追記、削除、リライト | 禁止（内容編集） |
| 新規 SPEC frontmatter `status: draft` 付与（新規 SPEC 作成時） | 許可（lifecycle 状態遷移） |
| 既存 SPEC frontmatter `status: accepted` 昇格 | 禁止（case-close Step 3 の責務） |
| 既存 SPEC frontmatter `updated` 日付更新 | 許可（lifecycle メタデータ） |
| `.agentdev/drafts/**` の status 更新 | 許可（ハンドオフ状態管理） |

## 実行主体分類表（委譲契約必須項目、REQ-003-007）

req-define の委譲契約セクションは、各委譲について実行主体分類表を必須テンプレートとして含む。
本分類軸は v2:ADR-0107 の成果物種別（command / skill / template / script）とは直交する。

| 分類 | 意味 | 例 |
|---|---|---|
| adapter skill | 委譲契約、プロンプト構成、起動仕様をカプセル化した skill | `agentdev-case-run-execution-adapter` |
| command | `/agentdev/*` 公開コマンド自体を起動主体として扱う場合 | `case-open` / `spec-save` |
| subagent | 委譲で起動されるエージェント型 | 実行担当サブエージェント（AGENTS.md で選定） |
| harness | case-run 実行ハーネス（外部実行基盤） | 外部実行基盤（AGENTS.md で選定） |

## case-open push タイミング（REQ-003-003）

case-open は draft / RU 削除 commit を作成した直後に push する。
case-run 引き継ぎ時の `git pull` 失敗を防止するため、削除 commit と Issue 作成の中間で作業ツリー状態を確定させる。
`.agentdev/drafts/` 配下と `.agentdev/backlog/req-units/` 配下の削除はいずれも即時 push 対象とする。

## 前工程完了度属性（REQ-003-011）

case-open は子 Issue 本文に「前工程完了度」属性を埋め込む。
分類定義は [epic-wave-model.md](epic-wave-model.md) の「前工程完了度3段階分類」セクション参照。
subagent は当該属性に応じた振る舞い指針（検証のみでも acceptance criteria 順位検証は必須等）に従う（REQ-003-012）。

## See Also

- [workflow-contracts.md](workflow-contracts.md)（ワークフロー全体契約）
- [epic-wave-model.md](epic-wave-model.md)（Epic Wave 実行モデル）
- [../responsibilities/responsibility-boundary-purification.md](../responsibilities/responsibility-boundary-purification.md)（case 実行責務の 4 用語と所有者 SSoT、external execution boundary / harness execution mechanism の所有権）
- v2:ADR-0112（サブエージェント委譲の一般概念）
- v2:ADR-0127（case-auto の工程委譲）
- v2:ADR-0128（case-run 外部実行委譲）
- `agentdev-case-run-execution-adapter` skill（case-run 外部実行 adapter）
- `agentdev-command-authoring` skill（委譲定義記述標準）

## adversarial-review との委譲契約接続

本節は adversarial-review caller integration（REQ-014）が委譲契約へ接続する際の適用を所有する。共通 caller integration 契約の正規所有者は adversarial-review SPEC であり（REQ-014-003）、本節は重複定義せず、委譲契約側からの接続のみを規定する。REQ-003-011/012 の4状態契約（completed-pr/blocked/failed/delegation-unavailable）は維持し、adversarial-review 由来の結果は第5状態を増やさず既存状態へ折り畳む（REQ-014-012、workflow-contracts SPEC「adversarial-review 由来の停止信号」節参照）。

### 委譲種別と副作用境界

adversarial-review は「委譲種別」の `semantic_review`（書き込み禁止型）として適用する。許可操作は `read_files`、`inspect_content`、`return_summary`、`return_evidence`、`return_artifact_body_when_requested` に限定し、`file_write`、`issue_pr_update`、`commit`、`push`、`user_confirmation` を forbidden とする（REQ-014-004）。レビュー結果保存用の新規正規 artifact 種別を導入せず、審議結果は呼出元へ中間成果として返却する（REQ-014-005、adversarial-review SPEC「副作用禁止と新規 artifact 非生成」節参照）。

### review 経路での parent_decision_required / decision_context 適用

呼出元は adversarial-review の出力（合意候補、未解決争点、残留リスク、未解決事項）を `parent_decision_required` および `decision_context` を通じて受領する。未解決のユーザー判断事項は次のように扱う。

| 起源 | parent_decision_required の扱い |
|---|---|
| case-run 起源 | result enum の `blocked` に折り畳み、停止理由として user-decision-required 分類を付与する |
| 工程委譲起源（req-define、case-open、case-close 等） | 既存 status（pass/warn/fail/partial）を維持し、`parent_decision_required` へ unresolved 判断事項を列挙する |

`decision_context` には対象案、合意候補、未解決争点、推奨案と根拠、ユーザーに確定してほしい判断を含める。呼出元は accepted finding の反映を自身の責務で行い（REQ-014-006）、adversarial-review へ反映を委譲しない。

### case-auto による decision_context の限定的親判断解決（REQ-006-112〜114、DEC-008）

case-auto は下位 command（case-run インライン実行、工程委譲）から受領した decision_context を bounded parent decision resolution で処理する。本節は委譲契約側からの接続のみを規定し、解決範囲、作業仮定の明示要件、停止理由分類の詳細は case-auto SPEC「bounded parent decision resolution（REQ-006-112〜114、DEC-008）」節が正である。

**decision_context の消費契約**:

| 受領形式 | case-auto の消費 |
|---|---|
| case-run 起源（result `blocked` + user-decision-required 分類） | decision_context を限定的親判断解決へ入力する。自律解決可能な場合は回答を case-run resume point へ返し、解決不能な場合は停止理由分類「上位合意矛盾」または「新規ユーザー判断事項」でユーザー停止する |
| 工程委譲起源（既存 status + `parent_decision_required`） | decision_context を限定的親判断解決へ入力する。自律解決可能な場合は回答を当該工程の委譲起点へ返し、解決不能な場合は停止理由分類でユーザー停止する |

**parent_decision_required の解決拡張**: case-auto は `parent_decision_required` へ列挙された unresolved 判断事項について、現行正規成果物から一意に回答可能なものを自律解決する（REQ-006-112）。外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件を変更しない可逆的内部詳細は、既存契約で許容された範囲に限り作業仮定と根拠を明示して自走継続できる（REQ-006-113）。

**resume point の拡張利用**: case-auto が decision_context を解決した場合、回答または作業仮定を下位 command へ返し、既存 resume point（REQ-006-085）から処理を継続する。新規の永続結果型を導入せず、既存 resume point 機構を再利用する（DEC-008 決定5）。resume point の仕様は workflow-contracts SPEC「case-auto への伝播と resume point」節が正である。

**非対象（REQ-015-012 維持）**: case-auto は decision_context の解決において raw finding を解釈、採否、候補反映しない。各 caller command は自身が所有する候補について finding の意味解釈、採否、候補への反映を維持し（REQ-014-006）、raw finding を case-auto へそのまま渡さない（REQ-006-112、AG-006）。

### 呼出失敗時の扱い

adversarial-review の呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し（REQ-014-010）、呼出元は利用不能を報告した上で従来フローと既存 QG/HITL を維持する。呼出失敗を delegation_type の `delegation-unavailable` とは別個に扱う場合、呼出元は従来フローへのフォールバックを記録する。

### 正規所有者マトリックス参照

本節と adversarial-review SPEC「正規所有者マトリックス」節（REQ-014-011）との間で意味の重複、矛盾を生じない。委譲契約の一般概念（委譲時最小契約、委譲種別、制約）は本 SPEC の既存節が正であり、adversarial-review 固有の適用のみを本節が所有する。
