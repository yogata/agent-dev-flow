---
title: サブエージェント委譲契約（v4）
status: accepted
created: 2026-09-20
updated: "2026-09-20"
---
<!-- ADF-COVERS(implementation): REQ-002-033, REQ-002-034 -->
<!-- ADF-COVERS(implementation): REQ-003-001, REQ-003-002, REQ-003-003, REQ-003-004, REQ-003-006, REQ-003-011, REQ-003-012, REQ-003-014, REQ-003-020 -->
<!-- ADF-COVERS(implementation): REQ-011-011, REQ-011-012, REQ-011-017 -->
<!-- ADF-COVERS(implementation): REQ-017-020 -->
<!-- ADF-COVERS(implementation): REQ-048-007, REQ-048-014 -->

# サブエージェント委譲契約（v4）

## 位置づけ

本 Design は ADF v4 の委譲契約の正本である。v4 ライフサイクル状態機械（[v4-lifecycle-state-machine.md](v4-lifecycle-state-machine.md)）と v4 Runtime 実行モデル（[../foundations/v4-runtime-execution-model.md](../foundations/v4-runtime-execution-model.md)）の下位契約として、委譲時の最小契約と制約を所有する。result 4 状態の正は v4-lifecycle-state-machine へ、authority・副作用・冪等・並行性の正は v4-runtime-execution-model へ、それぞれ参照により接続し二重管理しない。

旧称対応注記: 本 Design は旧 `workflows/delegation-contracts.md`（サブエージェント委譲契約）を集約して置き換える（集約 supersede）。旧 Design への言及（REQ-052-012 の「v4-delegation-contracts 経路」行内言及を含む）は本 Design へ読み替える。旧 Design の処遇の正本は [../foundations/v3-v4-crosswalk.md](../foundations/v3-v4-crosswalk.md)（references/crosswalk-inventory.md）が所有する。旧 Design の参考節（初期適用対象、manager-orchestrator と軽量委譲の分離表、case-auto 並列委譲モデル拡張、責務分界表）は本 Design が搬送しない（各工程 Design と REQ-034 が所有する）。

本 Design は v2:ADR-0112 で定義されたサブエージェント委譲の一般概念に基づく共通契約を定義する。個別 command / skill の委譲利用は各 Design を参照のこと。

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

### 実装委譲の受領側検査情報候補（output_contract）

実装作業の委譲（case-run から実行担当サブエージェントへの委譲）では、受領側（case-run / case-auto）が契約完了検査（3点ゲート: 4状態 result・commit hash・PR URL）を実行するため、委譲応答にこれらの情報候補を含める。
output_contract の status 値（pass | warn | fail | partial）は委譲時最小契約の一般形であり、実装委譲の result 4状態契約（completed-pr / blocked / failed / delegation-unavailable、v4-lifecycle-state-machine.md が正規所有）とは別契約として区別する。
委譲時最小契約の骨格（inputs、side_effect_boundary、output_contract、capture_handoff）は変更しない。

### structured_context の SSoT 抽出制約

- 委譲 prompt に含める structured_context の作業内容・purpose は、委譲先 Issue 本文の概要または正規 REQ から抽出する。
  親セッションの会話コンテキスト由来の推定・波及解釈を注入しない（REQ-017-019）。
- 委譲 prompt 生成時に、対象 Issue 番号と対象成果物パスの突合を行い、不一致の場合は委譲を開始しない。
- case-run / case-auto は、正典から導出可能な補助情報（対象一覧・操作サマリ等）を委譲 prompt へ含める場合、当該補助情報を正典と機械突合可能な形式で記述する。対象集合（対象ファイル、対象 REQ、対象成果物パス等）は正典から機械的に列挙できる形を維持する（REQ-017-020）。
- 委譲 prompt 生成時に、正典から導出した補助情報を正典と突合する。突合で不一致を検出した場合、当該補助情報を委譲 prompt から除去するか、正典に一致する内容へ置換してから委譲を開始する。
- 委譲を受けた実行側は、補助情報と正典の不一致を検出した場合、正典を優先し、補助情報を根拠とした対象判断・本文更新・実行継続を行わない。不一致の検出自体を親エージェントへ報告する（REQ-017-020）。

## 委譲種別（delegation_type 8 種）

delegation_type は参考分類であり、Command 本文での使用は任意である。
分類ラベルより、実際の入力範囲、副作用境界、返却内容を優先する。

| delegation_type | 用途 | 書き込み | 書き込み許可条件 |
|---|---|---:|---|
| `gate_check` | 完了判定、ガードレール充足確認、保存前/close前検査 | 禁止 | - |
| `semantic_review` | 文書、差分、REQ/Decision/Designの意味レビュー | 禁止 | - |
| `log_analysis` | テストログ、CIログ、review結果解析 | 禁止 | - |
| `classification` | 成果物 / 検出事項 / intake / learning の分類 | 禁止 | - |
| `extraction` | 候補、論点、未回収事項の抽出 | 禁止 | - |
| `draft_generation` | Issue本文、PR本文、レポート案などの草案生成 | 禁止 | - |
| `controlled_case_execution` | case-run Epic / 複数Issue実行 | 条件付き | case-run のみ |
| `step_execution` | case-auto からの構成工程（case-open / case-ready / case-run / case-close）の実行担当サブエージェント起動 | 許可 | case-auto からの工程委譲のみ。各工程のコマンド定義ガードレールに従う。委譲起動不能時の扱いは `delegation-unavailable` 状態として報告する（REQ-002-003/004）。起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md 参照 |

※ step_execution の委譲起動手段（起動方法、実行制御パラメータ）は harness の責務として AGENTS.md および references/<harness>.md に配置する（REQ-002-002）。
委譲起動不能時は `delegation-unavailable` 状態として報告し、インラインフォールバックは harness 固有の実行制御として配布 Design から除外する（REQ-002-004）。

GitHub I/O を伴う委譲の Custom Tool 経路: 委譲先サブエージェントは GitHub Issue / PR 操作を Custom Tool（`agentdev_gh`）の操作契約経由で実行する。driver 経由で委譲された場合も同じ経路であり、起動手段（driver、実行制御パラメータ）の差異を Tool 操作契約の利用方式に反映しない。生 gh コマンドの直接実行（WRITE）は正規経路としない（custom-tool-contracts Design「迂回防止」）。

## 委譲制約（6）

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
用語の正規定義と所有者は [responsibility-boundary-purification.md](../responsibilities/responsibility-boundary-purification.md)「case 実行責務の 4 用語と所有者」を SSoT とする。
本節は委譲契約からの参照レベルに留まる。

| 用語 | 定義 | 正規所有者 | 関連する委譲種別 |
|---|---|---|---|
| orchestration stage | case-auto が管理する command 間進行 | REQ-006 / case-auto | `step_execution`、case-auto からの工程委譲 |
| case-run internal lifecycle | 単一 Issue または Wave 内の準備、実行、提出 | REQ-006 / case-run | `controlled_case_execution` |
| harness execution mechanism | agent 起動、background task、並列実行、context 管理 | harness 責務（ADF 規範所有対象外、REQ-011-018） | なし（委譲対象外、配布物から抽象化） |
| external execution boundary | REQ-011 が所有する外部バックエンド接続 | REQ-011（REQ-011-017） | `controlled_case_execution`、`step_execution` 経由で REQ-011 へ委譲 |

### external execution boundary 委譲（REQ-011-017）

`controlled_case_execution`（case-run）と `step_execution`（case-auto）は外部バックエンド接続を自身で所有せず REQ-011 へ委譲し、自身は所有しない。
case-run は adapter skill（`agentdev-case-run-execution-adapter`）経由で external execution boundary への委譲契約を使用し、実行担当サブエージェントの起動と result 受領を外部実行境界として取り扱う。
adapter skill が規定する result 4状態（completed-pr / blocked / failed / delegation-unavailable）、worktree 隔離、PR URL 受領、Findings / Design確定候補の PR 本文引き継ぎは external execution boundary 委譲契約の構成要素である。

### harness execution mechanism の ADF 規範所有対象外（REQ-011-018）

agent 起動、background task、並列実行、context 管理は ADF 配布物の規範所有対象外とし、harness 責務とする。
委譲起動手段（起動方法、実行制御パラメータ）、能力検出、インラインフォールバックの有無は AGENTS.md および `references/<harness>.md` に配置し、本 Design では規範を持たない。
「委譲種別」の注記に既述のとおり step_execution の起動手段も harness 責務であり、本 Design から除外する。

## result 4 状態と authority（参照縮約）

- result 4 状態（completed-pr / blocked / failed / delegation-unavailable）と result enum の折り畳み契約の正は [v4-lifecycle-state-machine.md](v4-lifecycle-state-machine.md)「完了経路と result 状態の一般化」節が所有する。本 Design は再掲しない。
- 副作用 4 分類と authority 格子、直列化単位 5 種、冪等経路、直列化違反・競合検出時の意味論、fail-closed 適用範囲の正は [../foundations/v4-runtime-execution-model.md](../foundations/v4-runtime-execution-model.md) が所有する。委譲に伴う副作用の権威と並行性は同 Design の authority 格子に従う。

## adversarial-review との委譲契約接続

本節は adversarial-review caller integration（REQ-014）が委譲契約へ接続する際の適用を所有する。
共通 caller integration 契約の正規所有者は adversarial-review Design であり（REQ-014-003）、本節は重複定義せず、委譲契約側からの接続のみを規定する。
REQ-003-011/012 の4状態契約（completed-pr/blocked/failed/delegation-unavailable）は維持し、adversarial-review 由来の結果は第5状態を増やさず既存状態へ折り畳む（REQ-014-012、v4-lifecycle-state-machine Design）。

### 委譲種別と副作用境界

adversarial-review は「委譲種別」の `semantic_review`（書き込み禁止型）として適用する。
許可操作は `read_files`、`inspect_content`、`return_summary`、`return_evidence`、`return_artifact_body_when_requested` に限定し、`file_write`、`issue_pr_update`、`commit`、`push`、`user_confirmation` を forbidden とする（REQ-014-004）。
レビュー結果保存用の新規正規 artifact 種別を導入せず、審議結果は呼出元へ中間成果として返却する（REQ-014-005、adversarial-review Design「副作用禁止と新規 artifact 非生成」節参照）。

### review 経路での parent_decision_required / decision_context 適用

呼出元は adversarial-review の出力（合意候補、未解決争点、残留リスク、未解決事項）を `parent_decision_required` および `decision_context` を通じて受領する。
未解決のユーザー判断事項は次のように扱う。

| 起源 | parent_decision_required の扱い |
|---|---|
| case-run 起源 | result enum の `blocked` に折り畳み、停止理由として user-decision-required 分類を付与する |
| 工程委譲起源（req-define、case-open、case-close 等） | 既存 status（pass/warn/fail/partial）を維持し、`parent_decision_required` へ unresolved 判断事項を列挙する |

`decision_context` には対象案、合意候補、未解決争点、推奨案と根拠、ユーザーに確定してほしい判断を含める。
呼出元は accepted finding の反映を自身の責務で行い（REQ-014-006）、adversarial-review へ反映を委譲しない。

### case-auto による decision_context の限定的親判断解決（REQ-034-032〜034、DEC-008）

case-auto は下位 command（case-run インライン実行、工程委譲）から受領した decision_context を bounded parent decision resolution で処理する。
本節は委譲契約側からの接続のみを規定し、解決範囲、作業仮定の明示要件、停止理由分類の詳細は case-auto Design「bounded parent decision resolution（REQ-034-032〜034、DEC-008）」節が正である。

**decision_context の消費契約**:

| 受領形式 | case-auto の消費 |
|---|---|
| case-run 起源（result `blocked` + user-decision-required 分類） | decision_context を限定的親判断解決へ入力する。自律解決可能な場合は回答を case-run resume point へ返し、解決不能な場合は停止理由分類「上位合意矛盾」または「新規ユーザー判断事項」でユーザー停止する |
| 工程委譲起源（既存 status + `parent_decision_required`） | decision_context を限定的親判断解決へ入力する。自律解決可能な場合は回答を当該工程の委譲起点へ返し、解決不能な場合は停止理由分類でユーザー停止する |

**parent_decision_required の解決拡張**: case-auto は `parent_decision_required` へ列挙された unresolved 判断事項について、現行正規成果物から一意に回答可能なものを自律解決する（REQ-034-032）。
外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件を変更しない可逆的内部詳細は、既存契約で許容された範囲に限り作業仮定と根拠を明示して自走継続できる（REQ-034-033）。

**resume point の拡張利用**: case-auto が decision_context を解決した場合、回答または作業仮定を下位 command へ返し、既存 resume point（REQ-006-114）から処理を継続する。
新規の永続結果型を導入せず、既存 resume point 機構を再利用する（DEC-008 決定5）。
resume point の仕様は v4-lifecycle-state-machine Design が正である。

**非対象（REQ-015-012 維持）**: case-auto は decision_context の解決において raw finding を解釈、採否、候補反映しない。
各 caller command は自身が所有する候補について finding の意味解釈、採否、候補への反映を維持し（REQ-014-006）、raw finding を case-auto へそのまま渡さない（REQ-034-032、AG-006）。

### 呼出失敗時の扱い

adversarial-review の呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し（REQ-014-010）、呼出元は利用不能を報告した上で従来フローと既存 QG/HITL を維持する。
呼出失敗を delegation_type の `delegation-unavailable` とは別個に扱う場合、呼出元は従来フローへのフォールバックを記録する。

### 正規所有者マトリックス参照

本節と adversarial-review Design「正規所有者マトリックス」節（REQ-014-011）との間で意味の重複、矛盾を生じない。
委譲契約の一般概念（委譲時最小契約、委譲種別、制約）は本 Design の既存節が正であり、adversarial-review 固有の適用のみを本節が所有する。

## 構造化文脈引き継ぎ（委譲時）の直列化契約

委譲時最小契約（inputs、side_effect_boundary、output_contract、capture_handoff）の骨格を変更せず
（REQ-003-006 準拠）、inputs 内に構造化文脈を直列化する。構造化文脈は次の意味を扱う。

- 目的（purpose）
- 現在の ADF 工程（workflow_phase）
- 現在の実行単位（execution_unit）
- 前工程で確定した事項（resolved_context）
- 未確定事項（open_items）
- 正規参照先（canonical_references）
- 停止条件（stop_conditions）
- 期待する実行結果（expected_output）
- 後続工程へ渡すべき成果（handoff_artifacts）
- 計画変更を識別するための情報（plan_change）

直列化に全文履歴や巨大な計画本文の複製を含めない。

この意味集合および具体化する field 集合は現行ベースラインであり、REQ-048-014 のとおり REQ-048 の成立条件と
して固定しない。field 集合の変更は REQ-048-012 の実験契約（単一の主要構造変更、Guardrail 付き）に従い、
工程間の直列化（agentdev-workflow-lifecycle Design「工程間構造化文脈引き継ぎ契約」）と意味対応を維持するため
同時変更を要する。

ADF は委譲単位識別子を発行し、親子実行関係の識別の正規手段とする。委譲 prompt には対象 Case、Issue、PR、
ADF 工程、実行単位、委譲目的の識別情報を構造化して含める。OpenCode 等の harness 側セッション識別子は、
取得可能な場合に付加情報として記録し、必須契約としない（REQ-011-018、REQ-048-003 準拠）。

構造化文脈は新しい正規情報源ではない。引き継ぎ内容は永続的な正規成果物（Issue 本文、PR 本文、RU、OU 等）から
再構成可能であること（DEC-011 準拠）。

## MUST NOT DO 分類判定表（REQ-003-004）

case-auto の MUST NOT DO を「実質的 Design / REQ / Decision 内容編集禁止（lifecycle 状態遷移 `draft`→`accepted` は除く）」へ精密化する。状態遷移操作と内容編集操作の分類判定表:

| 操作分類 | case-auto での可否 |
|---|---|
| Design / REQ / Decision 本文（要件行、判定基準、アーキテクチャ決定）の編集、追記、削除、リライト | 禁止（内容編集） |
| 新規 Design frontmatter `status: draft` 付与（新規 Design 作成時） | 許可（lifecycle 状態遷移） |
| 既存 Design frontmatter `status: accepted` 昇格 | 禁止（case-close STEP-3 の責務） |
| 既存 Design frontmatter `updated` 日付更新 | 許可（lifecycle メタデータ） |
| `.agentdev/drafts/**` の status 更新 | 許可（ハンドオフ状態管理） |

## 実行主体分類表（委譲契約必須項目、REQ-003-007）

req-define の委譲契約セクションは、各委譲について実行主体分類表を必須テンプレートとして含む。
本分類軸は v2:ADR-0107 の成果物種別（command / skill / template / script）とは直交する。

| 分類 | 意味 | 例 |
|---|---|---|
| adapter skill | 委譲契約、プロンプト構成、起動仕様をカプセル化した skill | `agentdev-case-run-execution-adapter` |
| command | `/agentdev/*` 公開コマンド自体を起動主体として扱う場合 | `case-open` / `case-ready` / `case-revise` |
| subagent | 委譲で起動されるエージェント型 | 実行担当サブエージェント（AGENTS.md で選定） |
| harness | case-run 実行ハーネス（外部実行基盤） | 外部実行基盤（AGENTS.md で選定） |

## case-open push タイミング（REQ-003-003）

case-open は draft / RU 削除 commit を作成した直後に push する。
case-run 引き継ぎ時の `git pull` 失敗を防止するため、削除 commit と Issue 作成の中間で作業ツリー状態を確定させる。
`.agentdev/drafts/` 配下と `.agentdev/backlog/req-units/` 配下の削除はいずれも即時 push 対象とする。

## 前工程完了度属性（REQ-003-011）

case-open は子 Issue 本文に「前工程完了度」属性を埋め込む。
分類定義は [../commands/case-ready.md](../commands/case-ready.md)「v3 epic-wave-model Design からの吸収」節の「前工程完了度 3 分類」参照。
subagent は当該属性に応じた振る舞い指針（検証のみでも acceptance criteria 順位検証は必須等）に従う（REQ-003-012）。

## See Also

- [v4-lifecycle-state-machine.md](v4-lifecycle-state-machine.md)（result 4 状態・resume point の正）
- [../foundations/v4-runtime-execution-model.md](../foundations/v4-runtime-execution-model.md)（authority 格子・直列化単位・冪等経路の正）
- [../responsibilities/responsibility-boundary-purification.md](../responsibilities/responsibility-boundary-purification.md)（case 実行責務の 4 用語と所有者 SSoT、external execution boundary / harness execution mechanism の所有権）
- [../commands/case-run.md](../commands/case-run.md)（Epic Wave 実行モデル〔v3 epic-wave-model Design 吸収先〕）
- v2:ADR-0112（サブエージェント委譲の一般概念）
- v2:ADR-0127（case-auto の工程委譲）
- v2:ADR-0128（case-run 外部実行委譲）
- `agentdev-case-run-execution-adapter` skill（case-run 外部実行 adapter）
- `agentdev-command-authoring` skill（委譲定義記述標準）
