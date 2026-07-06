---
source_type: mixed
generated_by: req-define
generated_at: 2026-07-06T09:15:00+09:00
status: saved
sources:
  - path: .agentdev/backlog/req-units/RU-0001.md
    type: ru
  - path: .agentdev/backlog/req-units/RU-0002.md
    type: ru
  - path: .agentdev/backlog/req-units/RU-0003.md
    type: ru
agentdev_handoff: false
---

# draft-data

```yaml
work_type: feature
scale: standard
summary: >-
  学習パイプライン由来の3件の予防的コマンド手順改善を要件化する。
  (1) req-define 壁打ち手順拡充（構造的分析フレーム先行・二項選択回答規定・実装/SPEC両面分析）、
  (2) case-open スナップショット陳腐化予防（完了条件展開前再確認・同日内複数PR時再確認）、
  (3) case-close docs guard false-clean 予防（files_checked 空確認・空時 warning）。
  3件は独立した関心領域であり、3つの operation unit として構成する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      req-define は壁打ち開始時、入力（RU、セッションコンテキスト、明示入力ファイル）の構造を
      入力データの性質に応じた分析フレーム（対象×変更種別の二軸マトリクス、既存要件との照合表等）で
      先行して整理し、個別論点の深掘り前に全体構造をユーザーに提示する。
    ou_ref: OU-001
    source: RU-0001
  - id: AG-002
    content: >-
      req-define は二項選択を求められた質問に対し、件数と根拠でいずれかを明示して回答する。
      「混在」「要確認」単独の回答を出力しない。両選択肢に該当する場合は両方の件数と根拠を明示する。
    ou_ref: OU-001
    source: RU-0001
  - id: AG-003
    content: >-
      req-define は修正の要否を検討する際、実装面（ソースコード、スクリプト、スキル定義ファイル等）
      と SPEC 面（docs/specs/ 配下の文書）の両面を分析し、各面の修正対象と修正内容を明示する。
      片面のみの分析で修正要否を断定しない。
    ou_ref: OU-001
    source: RU-0001
  - id: AG-004
    content: >-
      case-open は完了条件を Issue 本文に展開する前に、対象パスで最新状態の再確認を行う。
      検出時点スナップショットと起票時点の最新状態に差異がある場合、最新状態を優先する。
    ou_ref: OU-002
    source: RU-0002
  - id: AG-005
    content: >-
      case-open は同一日内に複数 PR がマージされた後の Issue 起票、および順次 Wave 実行時の
      後続 Wave Issue 起票において、起票前に最新状態の再確認を必須とする。
    ou_ref: OU-002
    source: RU-0002
  - id: AG-006
    content: >-
      case-close は targeted docs guard（check_changed_docs.ts）の実行結果で files_checked が空の場合、
      検査見逃しのリスクとして警告を確認し、--files での再実行または対象ファイルの確認を行う。
    ou_ref: OU-003
    source: RU-0003
  - id: AG-007
    content: >-
      check_changed_docs.ts は files_checked が空の場合、検査対象ファイルが検出されなかった旨の
      警告（warnings 配列）を出力する。
    ou_ref: OU-003
    source: RU-0003

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0102
    source_items: [AG-001, AG-002, AG-003]
    content: |-
      REQ-0102（要件定義・保存）に以下の3要件行を追加する:
      - 構造的分析フレーム先行: req-define は壁打ち開始時、入力の構造を入力データの性質に応じた分析フレームで先行して整理し、個別論点の深掘り前に全体構造を提示すること（AG-001）
      - 二項選択回答規定: req-define は二項選択を求められた質問に対し、件数と根拠でいずれかを明示して回答すること。「混在」「要確認」単独の回答は出力しないこと（AG-002）
      - 実装/SPEC両面分析規定: req-define は修正の要否を検討する際、実装面と SPEC 面の両面を分析し、各面の修正対象と修正内容を明示すること。片面のみの分析で修正要否を断定しないこと（AG-003）
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-create
    target: docs/specs/commands/req-define.md
    source_items: [AG-001, AG-002, AG-003]
    content: |-
      ### Step 3 構造的分析フレーム先行手順（REQ-0102-NEW）

      Step 3（壁打ち対話）の開始時に、入力（RU、セッションコンテキスト、明示入力ファイル）の構造を入力データの性質に応じた分析フレームで先行して整理し、個別論点の深掘り前に全体構造をユーザーに提示する（AG-001）。

      #### 分析フレームの選択

      入力データの性質に応じて以下のフレームから選択する:

      | 入力データの性質 | 推奨フレーム |
      |---|---|
      | 複数RU・複数改善候補 | 対象×変更種別の二軸マトリクス |
      | 既存要件との照合が必要 | 既有件化/未要件化/SPEC配置の3分類表 |
      | 修正要否の判定 | 実装面/SPEC面の両面分析表 |

      上記は推奨例であり、入力データの性質に応じて適切なフレームを選択する。分析フレームは個別論点の深掘りに先行して提示する。

      #### 二項選択回答規定（AG-002）

      ユーザーが二項選択（「AかBか」）を求めた質問に対し、「混在」「要確認」単独の回答を出力しない。件数と根拠でいずれかを明示して回答する。両選択肢に該当する場合は、それぞれの件数と根拠を明示して両方を提示する。

      #### 実装/SPEC両面分析規定（AG-003）

      修正の要否を検討する際、実装面（ソースコード、スクリプト、スキル定義ファイル等の変更）と SPEC 面（docs/specs/ 配下の文書変更）の両面を分析し、各面の修正対象と修正内容を明示する。片面のみの分析で修正要否を断定しない。

      #### agentdev-req-analysis SKILL 連携

      上記手順の詳細（質問運用ルール、分析フレーム選択基準）は `agentdev-req-analysis` SKILL（`src/opencode/skills/agentdev-req-analysis/SKILL.md`）の「質問運用ルール」「要件分析観点」セクションに反映する。本 SPEC は手順の要件を定義し、SKILL は実装詳細を定義する（原本src→配置先.opencode の文書間投影規則に準拠）。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0132
    source_items: [AG-004, AG-005]
    content: |-
      REQ-0132（case-open / Issue作成）に以下の2要件行を追加する:
      - 完了条件展開前再確認: case-open は完了条件を Issue 本文に展開する前に、対象パスで最新状態の再確認を行うこと。検出時点スナップショットと起票時点の最新状態に差異がある場合、最新状態を優先すること（AG-004）
      - 同日内複数PRマージ時再確認: case-open は同一日内に複数 PR がマージされた後の Issue 起票、および順次 Wave 実行時の後続 Wave Issue 起票において、起票前に最新状態の再確認を必須とすること（AG-005）
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-create
    target: docs/specs/commands/case-open.md
    source_items: [AG-004, AG-005]
    content: |-
      ## 完了条件展開前の最新状態再確認（REQ-0132-NEW）

      case-open は完了条件を Issue 本文に展開する前に、対象パスで最新状態の再確認を行う（AG-004）。検出時点スナップショットと起票時点の最新状態に差異がある場合、最新状態を優先する。

      ### 再確認タイミング

      以下のタイミングで完了条件展開前の再確認を必須とする（AG-005）:

      - **同日内複数 PR マージ後の Issue 起票**: 同一日内に複数 PR がマージされた後、当該マージにより `docs/requirements/REQ-*.md`、`docs/adr/ADR-*.md`、`docs/specs/**/*.md` の内容が変動する可能性があるため、起票前に最新状態を再確認する
      - **順次 Wave 実行時**: 複数 Wave が順次実行される場合、先行 Wave のマージ完了後に後続 Wave の Issue を起票する際、件数等の実測値が変動している可能性があるため再確認する

      再確認は識別子（ファイルパス、REQ ID、NG ID、IR ID）の存在確認を主軸とし、件数等の実測値は補助値として扱う（既存「完了条件・事前状態記載ガイドライン」準拠）。
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0131
    source_items: [AG-006]
    content: |-
      REQ-0131（case-close / 完了処理）に以下の要件行を追加する:
      - files_checked 空確認: case-close は targeted docs guard（check_changed_docs.ts）の実行結果で files_checked が空の場合、検査見逃しのリスクとして警告を確認し、--files での再実行または対象ファイルの確認を行うこと（AG-006）
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-0158
    source_items: [AG-007]
    content: |-
      REQ-0158（Targeted Docs Integrity Guard）に以下の要件行を追加する:
      - files_checked 空時 warning: check_changed_docs.ts は files_checked が空の場合、検査対象ファイルが検出されなかった旨の警告（warnings 配列）を出力すること（AG-007）
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-create
    target: docs/specs/commands/case-close.md
    source_items: [AG-006, AG-007]
    content: |-
      ### files_checked 空時警告と確認ステップ（REQ-0131-NEW, REQ-0158-NEW）

      targeted docs guard（check_changed_docs.ts）の実行結果で `files_checked` が空の場合、検査対象ファイルが検出されなかったことを示す。これは `--files` 指定の不備、PR 変更ファイル取得の失敗、または検査対象パスの誤りの可能性がある。

      #### check_changed_docs.ts 側の出力（AG-007）

      `files_checked` が空の場合、`warnings` 配列に検査対象ファイル未検出の警告を追加する。警告メッセージは検査対象ファイルが検出されなかった旨と `--files` 指定の確認を促す内容とする。

      #### case-close 側の確認ステップ（AG-006）

      case-close は targeted docs guard の結果で `files_checked` が空の場合、以下を行う:

      1. 警告を検査見逃しのリスクとして認識する
      2. `--files` 指定の妥当性を確認する（PR 変更ファイル一覧の再取得、パス指定の確認）
      3. 必要に応じて `--files` での再実行、または対象ファイルの手動確認を行う
      4. 空の理由が正当（対象ファイルが本当に変更されていない等）であることを確認してから続行する

      上記確認を経ずに `files_checked` 空のまま完了扱いとしない。

conflict_resolutions:
  - id: CR-001
    item: RU-0001 QG-1 evidence-first 違反検出の要件化範囲
    decision: 案C（本要件化対象外）
    rationale: >-
      機械検出は技術困難（QG-1 は soft-contract ADR-0124 範囲外の文脈判断を含む）、
      guide は既存 evidence-first 原則（agentdev-req-analysis SKILL）と重複、
      予防策（構造的分析フレーム先行）が主眼であり本要件で対応する。
    inferred: true
  - id: CR-002
    item: RU-0002 issue-management SKILL への再確認ルール追記
    decision: 案B（SPEC のみ、SKILL 追記なし）
    rationale: >-
      既存パターン（SKILL は SPEC を参照し、判定基準は SPEC に集約）を踏襲。
      SKILL への二重記載は保守性リスクを生むため回避する。
    inferred: true

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-0102
    target_spec: docs/specs/commands/req-define.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: REQ-0132
    target_spec: docs/specs/commands/case-open.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0003
    target_req: [REQ-0131, REQ-0158]
    target_spec: docs/specs/commands/case-close.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      本要件適用後の req-define 実行（複数RU入力または複数改善候補を含むケース）で、
      壁打ち開始時に分析フレーム（二軸マトリクス等）が提示され、個別論点の深掘り前に
      全体構造が提示されていることを確認する。
    pass_criteria: >-
      draft または壁打ち対話ログに、分析フレームの提示が個別論点深掘りに先行して存在すること。
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: AG-002
    verification: >-
      本要件適用後の req-define 実行で、二項選択を求められた質問に対する回答が
      件数と根拠を伴い、「混在」「要確認」単独の回答が出力されていないことを確認する。
    pass_criteria: >-
      二項選択質問への回答に件数と根拠が含まれ、「混在」「要確認」単独の回答が存在しないこと。
    on_failure: fix-and-reverify
  - id: TS-003
    target_item: AG-004
    verification: >-
      同一日内に複数PRマージが発生するシナリオで case-open を実行し、
      完了条件展開前に最新状態の再確認が行われることを確認する。
    pass_criteria: >-
      case-open の実行ログに、完了条件展開前の再確認ステップが含まれ、
      件数等の実測値が最新状態に更新されていること。
    on_failure: fix-and-reverify
  - id: TS-004
    target_item: AG-006
    verification: >-
      check_changed_docs.ts に files_checked が空になる入力を与え、
      warnings に空時警告が出力されることを確認する。
      case-close で files_checked 空の結果を受け取った際に確認ステップが実行されることを確認する。
    pass_criteria: >-
      (1) files_checked 空時、warnings 配列に検査対象ファイル未検出の警告が含まれること。
      (2) case-close が files_checked 空の結果を受け取った際、--files 再実行または対象確認が行われること。
    on_failure: fix-and-reverify

case_open_hints: {}
```

## 分析メモ（実装詳細、draft 反映外）

### 構造的分析フレーム結果（RU-0001 提案手順の実践）

3件の RU を二軸マトリクス（対象コマンド × 既有件化/未要件化/SPEC配置）で構造化:

| RU | 対象コマンド | 既有件化済み | 未要件化（REQ UPDATE） | SPEC配置 |
|---|---|---|---|---|
| RU-0001 | req-define | REQ-0102-008/-050/-052/-055 | 構造フレーム先行/二項選択/両面分析 | req-define.md Step3 |
| RU-0002 | case-open | REQ-0132-021（件数補助値） | 完了条件展開前再確認/同日内複数PR時再確認 | case-open.md |
| RU-0003 | case-close | REQ-0158（--files/--base-ref既存） | files_checked空確認/空時warning | case-close.md Step3-1 |

### ADR判断根拠（Step 6-3）

3件とも既存コマンド手順の拡充であり、新規アーキテクチャ判断、責務境界変更、既存ADRとの衝突なし。ADR-0124（soft-contract）の範囲内。ADR不要。

### SPLIT予兆計測結果（Step 4-2）

| 対象REQ | 要件行数 | 関心分類 | 成果物種別 | SPLIT合計 | 判定 |
|---|---|---|---|---|---|
| REQ-0102 | 56行→59行 | 1（要件定義・保存） | 2（REQ+SPEC） | +1 | APPEND許可 |
| REQ-0132 | 21行→23行 | 1（case-open） | 2（REQ+SPEC） | +0 | APPEND許可 |
| REQ-0131 | 29行→30行 | 1（case-close） | 2（REQ+SPEC） | +0 | APPEND許可 |
| REQ-0158 | 詳細SPEC形式 | 1（docs guard） | 2（REQ+SPEC） | +0 | APPEND許可 |

### 実装スコープ（case-run 向けメモ、要件doc外）

- `src/opencode/skills/agentdev-req-analysis/SKILL.md`: 質問運用ルール拡充（AG-002）、分析フレーム選択基準（AG-001）。ACT-SPEC-001 content 内で参照。
- `scripts/check_changed_docs.ts`: files_checked 空時 warning 出力（AG-007）。ACT-SPEC-003 content 内で参照。
- 上記は実装（case-run）対象であり、本要件doc の artifact_actions には SPEC のみ記載。
