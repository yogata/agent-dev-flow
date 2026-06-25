---
draft_type: req_draft
topic_slug: case-auto-case-run-delegation-boundary
status: saved
created_at: 2026-06-25T23:50:00+09:00
source_rus:
  - RU-20260625-01-case-auto-case-run-delegation-boundary
---

<!-- req_draft: case-auto と case-run の実行方式記述責務の分離。
  原本は # draft-data 内の YAML ブロックである。soft contract（ADR-0124）。 -->

# draft-data

```yaml
# work_type: 既存責務境界の明確化・是正。新規ユーザ機能追加なし、実行時挙動不变
work_type: maintenance

# scale: maintenance では未設定
scale: standard

# summary: case-auto のコマンド定義から case-run 内部実行方式の具体宣言を除去し、
#   case-run task への入力引き渡しと result 受領の外部契約のみを記述する責務境界を
#   REQ-0114 に明文化する。case-run 側は既存記述を維持する。
summary: |
  case-auto のコマンド定義が case-run の内部実行方式（実行バックエンド、実行担当
  サブエージェント名、adapter skill、委譲 prompt の具体、ulw-loop/ultrawork 利用宣言）
  を重複宣言している問題を解消する。REQ-0114 に、case-auto は case-run task への
  Issue番号/Epic Issue番号の引き渡しと result（completed(pr)/blocked/failed）の受領
  という外部契約のみを記述し、内部実行方式の SSoT は case-run のコマンド定義である
  ことを要件として追加する。Epic Wave 実行に関する case-auto 側の記述は、case-run が
  現在 Wave の ready 子Issue を最大5件並列実行して result を返す外部契約に限定する。
  SPEC（docs/specs/commands/case-auto.md）は既にクリーンであり、主な修正対象は実行時
  コマンド定義 src/opencode/commands/agentdev/case-auto.md である。

# auto_gate: 未解決 item なし。repo 内ファイル編集のみ
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: チャット合意（RU Source Summary）を Confirmed として採用
agreed_items:
  - id: AG-001
    content: |
      case-auto のコマンド定義は、case-run の内部実行方式（実行バックエンド、実行担当
      サブエージェント名、adapter skill、委譲 prompt の具体、ulw-loop / ultrawork 利用
      宣言）を記述しないこと。case-auto は case-run task への入力（Issue番号または Epic
      Issue番号）の引き渡しと、result（completed(pr) / blocked / failed）の受領という
      外部契約のみを記述すること。case-run の内部実行方式の SSoT（唯一の情報源）は
      case-run のコマンド定義であること。

      現状違反箇所（実行時コマンド定義 case-auto.md）:
      - case-run の実行バックエンドとして Sisyphus-Junior、ulw-loop を宣言する記述
      - task(subagent_type="Sisyphus-Junior", load_skills=["agentdev-case-run-execution-adapter"])
        の具体起動式
      - 委譲 prompt 内 /ulw-loop command の具体宣言
      - 実行担当サブエージェント（agentdev-case-run-execution-adapter）経由宣言

      これらは case-run のコマンド定義（src/opencode/commands/agentdev/case-run.md）に
      既に正しく保持されており、case-auto 側への重複を除去する。工程別委譲契約の
      output_contract（result 種別: completed(pr)/blocked/failed）は case-auto が受領
      する外部契約として維持する。
  - id: AG-002
    content: |
      case-auto の Epic Wave 実行に関する記述は、case-run が現在 Wave の ready 子Issue を
      最大5件並列実行して result を返す、という外部契約に限定すること。実行担当サブエージェント、
      adapter protocol、委譲 prompt、ulw-loop 利用の具体は case-run のコマンド定義に集約し、
      case-auto のコマンド定義に重複させないこと。

      case-auto 側に残す Epic Wave 記述は「case-run コマンド定義に従う」「現在 Wave の
      ready 子Issue を最大5件並列実行する」という外部契約参照程度に留めること。

# artifact_actions: REQ-0114 への APPEND のみ。SPEC は既存クリーンのため SPEC action なし。
#   case-auto.md の編集は反映作業（実装）であり artifact_actions 対象外
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0114
    source_items: [AG-001, AG-002]
    content: |
      REQ-0114-096: case-auto のコマンド定義は、case-run の内部実行方式（実行バックエンド、実行担当サブエージェント名、adapter skill、委譲 prompt の具体、ulw-loop / ultrawork 利用宣言）を記述しないこと。case-auto は case-run task への入力（Issue番号または Epic Issue番号）の引き渡しと、result（completed(pr) / blocked / failed）の受領という外部契約のみを記述すること。case-run の内部実行方式の SSoT は case-run のコマンド定義であること

      REQ-0114-097: case-auto の Epic Wave 実行に関する記述は、case-run が現在 Wave の ready 子Issue を最大5件並列実行して result を返す、という外部契約に限定すること。実行担当サブエージェント、adapter protocol、委譲 prompt、ulw-loop 利用の具体は case-run のコマンド定義に集約し、case-auto のコマンド定義に重複させないこと

      > **REQ-0114-096/097 適用範囲追記**
      >
      > REQ-0114 の適用範囲（対象）に以下を追加すること:
      > - case-auto と case-run の実行方式記述責務境界（case-auto は外部契約のみ、case-run が内部実行方式の SSoT）
      > - Epic Wave 実行の外部契約参照（最大5件並列実行）への記述限定

# conflict_resolutions: REQ-0114 SPLIT 予兆の取扱い
conflict_resolutions:
  - id: CR-001
    conflict: |
      REQ-0114 は既に約86要件行（81+ → SPLIT シグナル +2）、関心分類数 複数（入力解決、
      工程分岐、自走境界、停止条件、Epic Issue 制御、OU 処理、コンフリクト解消、タイム
      スタンプ等 → シグナル +1）、合計シグナル 3 以上（SPLIT 推奨レンジ）。APPEND 前に
      SPLIT 要否の確認が要求される（Step 4-2）。
    resolution: |
      今回は APPEND で進行し、REQ-0114 の SPLIT は別件の requirements review 候補とする。
      根拠: (1) case-auto は単一コマンドであり機能的に凝集している。(2) 今回の追加は
      2 行（096, 097）と小規模である。(3) REQ-0114 全体の SPLIT は同 REQ の再構成を要し、
      本 RU のスコープ（case-auto/case-run 記述責務の分離）を超える。(4) split-forecast
      に REQ-0114 の健全性メトリクスを記録し、別途 requirements review で取り上げる。

# operation_units: 単一 REQ 操作（REQ-0114 APPEND）1件
operation_units:
  - ou_id: OU-001
    source_ru: RU-20260625-01-case-auto-case-run-delegation-boundary
    target_req: REQ-0114
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs: [REQ-0114]
      appended_rows: [REQ-0114-096, REQ-0114-097]
      artifact_action_to_req:
        ACT-REQ-001: REQ-0114
      source_item_to_req:
        AG-001: REQ-0114-096
        AG-002: REQ-0114-097
      adr_created: false
      adr_judgment: "ADR不要（既存 ADR-0127/0128 が委譲・実行モデルをカバー。本件は既存アーキテクチャ原則の実装是正）"
      case_open_consumable: true
      case_open:
        issue_number: 1186
        issue_url: https://github.com/yogata/agent-dev-flow/issues/1186
        created_at: 2026-06-26T00:00:00+09:00

# test_strategy: 各合意項目の検証方法。3要素（verification/pass_criteria/on_failure）必須
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      case-auto の実行時コマンド定義（src/opencode/commands/agentdev/case-auto.md）を
      対象に、case-run の内部実行方式キーワード（Sisyphus-Junior、ulw-loop、ultrawork、
      agentdev-case-run-execution-adapter、/ulw-loop Implement）を grep し、case-run の
      実行方式宣言として残存しないことを確認する。ただし工程別委譲契約表の output_contract
      （result 種別: completed(pr)/blocked/failed）と、case-auto が case-run result から
      読み取る計測情報の参照先は除外する（これらは case-auto が受領する外部契約）。併せて
      case-auto が case-run task に Issue番号/Epic Issue番号を渡し result を受領する外部
      契約記述が存在することを確認する。
    pass_criteria: |
      case-auto のコマンド定義に、case-run の実行バックエンド、実行担当サブエージェント名、
      adapter skill、委譲 prompt の具体宣言が存在しないこと。case-auto と case-run の間で
      同一の内部実行方式説明が重複していないこと。case-auto が case-run task へ入力を渡し
      result を受領する外部契約記述が存在すること。
    on_failure: |
      fix-and-reverify。残留箇所は実装修正可能な記述不整合のため。該当キーワードを case-run
      定義へ集約するか case-auto から除去し、再 grep で 0 件を確認する。SPEC
      docs/specs/commands/case-auto.md も併せて確認し、必要に応じて case-run result 参照の
      表記を内部実行主体名を含まない形へ調整する。
  - id: TS-002
    target_item: AG-002
    verification: |
      case-auto の実行時コマンド定義の Epic Wave 関連記述（Step 4-1 Wave 反復制御、
      独立 OU 並列委譲等）を確認し、実行担当サブエージェント名、adapter protocol、
      委譲 prompt、ulw-loop の具体宣言が含まれないこと、外部契約（現在 Wave の ready
      子Issue を最大5件並列実行して result を返す）に限定されていることを確認する。
      併せて case-run のコマンド定義（src/opencode/commands/agentdev/case-run.md）に
      実行担当サブエージェント、adapter protocol、委譲 prompt、ulw-loop 利用の具体が
      保持されていることを確認する。
    pass_criteria: |
      case-auto の Epic Wave 記述が外部契約（最大5件並列実行、result 返却）に限定されて
      いること。case-run 側に実行担当サブエージェント、adapter protocol、委譲 prompt、
      ulw-loop の具体が保持されていること。case-auto は工程オーケストレーション、case-run
      は実装実行委譲という責務境界が両コマンド定義から読み取れること。
    on_failure: |
      fix-and-reverify。重複残留または case-run 側への集約漏れのため。該当箇所を
      case-run のコマンド定義へ移動するか case-auto から削除し、再検証で外部契約限定と
      case-run 側保持の双方を確認する。

# case_open_hints: 単一 Issue で完結
case_open_hints:
  epic_needed: false
  wave_hints: []
```

<!-- draft-meta: ADR判断根拠、SPLIT予兆、影響候補（req-define 参照用・req-save 消費外） -->

## ADR判断記録（Step 6）

- **6-1 既存ADR重複確認**: docs/adr/ の承認済み ADR 一覧（ADR-0101〜0132）と照合。
  ADR-0127（case-auto 工程委譲: 各工程を task() で起動し authoritative source に従わせる）、
  ADR-0128（case-run の実行モデル: task() による実行担当サブエージェント委譲）が委譲・実行
  アーキテクチャをカバーする。本件と意味重複する新規 ADR は存在しない。
- **6-2 ADR禁止ゲート**: 本件は REQ レベルの責務境界要件（外部契約の明文化）であり、
  REQ/SPEC 相当（詳細パラメータ・判定表）ではない。除外対象外。
- **6-3 ADR判断根拠**: **新規 ADR 不要**。
  根拠: (1) 本件は既存アーキテクチャ原則（ADR-0127/0128 が定める委譲モデル・実行モデル）
  の実装是正であり、新規アーキテクチャ判断ではない。(2) 責務境界自体は REQ-0114-019/
  084/086 で既に確立されており、本件はそれを検証可能な要件として明文化する。（3）実行時
  挙動は不变（case-auto は従来通り case-run へ task() 委譲、case-run は従来通り内部実行
  方式を保持）。
- **6-4 作業手段ADR拒否ゲート**: 削除・廃止・移行・統合そのものを主題としない。N/A。

## SPLIT予兆記録（split-forecast）

- 対象: REQ-0114（既存）
- メトリクス: 要件行数 約86（シグナル +2）、関心分類数 複数（+1）、成果物種別数 1-2（+0）、
  SPEC分離基準違反 0（+0）
- 合計シグナル: 3（SPLIT 推奨レンジ）
- 推奨アクション: SPLIT 推奨。ただし今回は APPEND で進行（CR-001 参照）。
- thresholds_ref: docs/specs/req-health-metrics.md

## 変更影響候補（Step 5-1）

- **主対象（REQ APPEND）**: REQ-0114（case-auto 最大自走モード）
- **実行時コマンド定義（反映作業・実装）**: src/opencode/commands/agentdev/case-auto.md
  - 違反箇所: L48（Sisyphus-Junior/ulw-loop 起動式宣言）、L74（adapter 経由宣言）、
    L88（Wave 並列委譲の内部実行宣言）、L55/L144（Sisyphus-Junior 計測参照）
  - case-run.md（src/opencode/commands/agentdev/case-run.md）は既存記述を維持（変更不要）
- **SPEC（参照専用・既存クリーン）**: docs/specs/commands/case-auto.md
  - L48「case-run の実行担当サブエージェント委譲モデル（case-auto は変更せず）」は既に正しい。
  - L162（case-run 内 Sisyphus-Junior 計測参照）、L168（See Also: adapter skill）は
    case-auto result の読取り元参照・相互参照であり、厳密には内部実行主体名を含むが
    外部契約参照の範囲。TS-001 on_failure で必要に応じて表記調整を確認する。
- **整合性確認対象（変更不要想定）**: REQ-0130（case-run、既存記述が正しい）、
  ADR-0127/0128（既存カバー）、docs/requirements/README.md（REQ-0114 既掲載）

# summary

case-auto のコマンド定義が case-run の内部実行方式を重複宣言している問題を、REQ-0114 へ
責務境界要件（096/097）を APPEND することで解消する。case-auto は case-run task への入力
引き渡しと result 受領の外部契約のみを記述し、内部実行方式の SSoT は case-run のコマンド
定義に集約する。実行時コマンド定義 case-auto.md の具体宣言除去は実装（反映作業）として
扱い、SPEC は既存クリーンのため主な修正対象は実行時コマンド定義となる。REQ-0114 の肥大化
（SPLIT シグナル 3+）は別件の requirements review 候補として記録した。
