---
draft_type: req_draft
topic_slug: case-auto-inline-case-run
status: saved
created_at: 2026-07-16T00:00:00+09:00
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  case-auto が case-run を委譲ではなくインライン実行する構成へ再構築する。
  case-auto は case-run.md を authoritative source として読み込み、準備/クリーンアップフェーズを自ら実行し、
  実行担当サブエージェントへ直接委譲する（委譲起点の折りたたみ）。
  これにより多重委譲（case-auto → case-run → 実行担当サブエージェント）を回避し、
  委譲チェーンを1段階に圧縮する。
  omo ハーネスが多重委譲を許容しない制約に加え、非 omo ハーネスも同様の制約を持つ可能性があるため、
  フォールバック而非標準構造として多重委譲を最初から要求しない設計とする。
  req-save / spec-save / case-open / case-close は従来通り case-auto からの委譲とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      case-auto は case-run を委譲ではなくインライン実行する。case-run.md を authoritative source として読み込み、
      case-auto のコンテキスト内で case-run の手順を実行する。多重委譲（case-auto → case-run → 実行担当サブエージェント）
      を回避し、委譲チェーンを case-auto → 実行担当サブエージェントの1段階に圧縮する。
      これは case-run のフォールバック而非標準動作である（REQ-0114-099 の標準化）。
      ただし case-auto 自らは実装を行わず、実装は実行担当サブエージェントが行う。

  - id: AG-002
    content: |
      case-auto は case-run の準備フェーズ（worktree 作成、委譲 prompt 構築等）およびクリーンアップフェーズ
      （worktree 削除、result 処理等）のオーケストレーション手順を自ら実行する。
      実行担当サブエージェント委譲フェーズでは case-auto から直接実行担当サブエージェントへ委譲する（委譲起点の折りたたみ）。
      adapter skill（agentdev-case-run-execution-adapter）を case-auto が読み込んで委譲を起動する。
      実行担当サブエージェントの起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md 参照とする（REQ-0162-002）。

  - id: AG-003
    content: |
      Epic Wave モードにおいて、case-auto は Wave 反復制御、現在 Wave の ready 子Issue 選択、
      子Issue 並列委譲（最大5件、REQ-0130-026 踏襲）を直接担当する。
      case-run(#epic) への委譲は行わない。
      子Issue の実行は各子Issue ごとにインライン case-run を実行し、各子Issue の実行担当サブエージェントへ委譲する。
      case-close(#epic) は従来通り委譲する。

  - id: AG-004
    content: |
      req-save / spec-save / case-open / case-close は従来通り case-auto からの委譲起動とする。
      delegation-unavailable（委譲起動不能）はこれらの委譲工程にのみ適用し、停止条件として扱う。
      インライン case-run における実行担当サブエージェントへの委譲失敗は case-run の result 契約
      （completed-pr / blocked / failed / delegation-unavailable）に従い処理する。

  - id: AG-005
    content: |
      コンフリクト解消モデル Level 2（コンフリクト文脈付き再実行）は、case-run への再委譲ではなく、
      case-auto によるインライン case-run 再実行となる（最大2回、元の実行を含む計3回）。
      コンフリクト文脈を付けてインライン case-run を再実行し、実行担当サブエージェントへ再委譲する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0114
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |
      REQ-0114 UPDATE ノート（case-run インライン実行標準化）。
      以下の要件行を UPDATE する。変更後の全文を記載する。

      **REQ-0114-006**（UPDATE）:
      req-save / spec-save / case-open / case-close を実行担当サブエージェントへ委譲し、各コマンドの Steps / ガードレール / エラー処理に従って実行させること（ADR-0127）。case-run はインライン実行する（case-run.md を authoritative source として読み込み、case-auto が直接実行、AG-001/002）。多重委譲（case-auto → case-run → 実行担当サブエージェント）を回避するため、case-run の工程は委譲ではなくインライン実行とする。委譲起動不能（delegation-unavailable）は委譲工程（req-save / spec-save / case-open / case-close）にのみ適用し、停止条件として扱うこと（REQ-0162-003/004）。インライン実行時のコンテキスト管理は harness の機能で対応する。

      **REQ-0114-084**（UPDATE）:
      case-auto は req-save / spec-save / case-open / case-close を各コマンドの委譲契約に従ってサブエージェント起動する。case-run はインライン実行する（case-run.md を authoritative source として読み込み、実行担当サブエージェントへ直接委譲、委譲起点の折りたたみ、AG-001/002）。Epic Wave 実行時、case-auto は Wave 反復制御、現在 Wave の ready 子Issue 選択、子Issue 並列委譲（最大5件、REQ-0130-026 踏襲）を直接担当する（AG-003）。case-close は委譲起動する。インライン実行時も case-auto 自らは実装を行わないこと。

      **REQ-0114-085**（UPDATE）:
      case-auto は委譲工程（req-save / spec-save / case-open / case-close）の委譲結果（Issue/PR番号、保存済みファイル、pass/warn/fail）のみを受領し、当該工程内部の調査過程、中間ログを親コンテキストに累積しないこと（REQ-0114-073 の実現手段、ADR-0127）。case-run インライン実行時のコンテキスト管理は harness の機能で対応し、REQ-0114-073 は case-run インライン実行時の例外として扱うこと。

      **REQ-0114-086**（UPDATE）:
      case-auto は Epic Issue に対し case-run（インライン）→ case-close（委譲）を反復し、case-close が Epic 完了を報告するまで反復すること。子Issue の個別選択、並列委譲、インライン case-run 実行は case-auto の責務（AG-003）。子Issue の個別クローズは case-close の責務である。

      **REQ-0114-095**（UPDATE）:
      case-auto は case-close からのコンフリクトエスカレーションを受領した場合、コンフリクト文脈付きでインライン case-run を再実行すること（case-run への再委譲ではなく、AG-005 参照、最大2回）。

      **REQ-0114-096**（UPDATE）:
      case-auto のコマンド定義は、case-run をインライン実行する際の準備/クリーンアップフェーズのオーケストレーション手順を記述する。実行担当サブエージェントの起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md 参照とする（REQ-0162-002）。case-auto 自らは実装を行わないこと。case-run のコマンド定義（case-run.md）はインライン実行時の authoritative source として機能する。

      **REQ-0114-097**（UPDATE）:
      case-auto の Epic Wave 実行に関する記述は、case-auto が直接 Wave 反復制御、現在 Wave の ready 子Issue 選択、子Issue 並列委譲（最大5件）を行う手順を含むこと（AG-003）。実行担当サブエージェント、adapter protocol、委譲 prompt の具体は case-run のコマンド定義（case-run.md）を authoritative source として参照する。

      **REQ-0114-098**（UPDATE）:
      case-run は case-auto によりインライン実行される（標準動作、AG-001）。genuine blocker（実装上の問題、スコープ外操作等）および委譲起動不能（delegation-unavailable）は停止条件として扱うこと（REQ-0162-003/004）。インライン実行時の実行担当サブエージェントへの委譲失敗は delegation-unavailable として case-run result 契約に従い処理する。

      **REQ-0114-099**（標準化、フォールバックから標準動作へ昇格）:
      case-auto は case-run をインライン実行する（標準動作）。準備フェーズ（worktree 作成、委譲 prompt 構築等）およびクリーンアップフェーズ（worktree 削除、result 処理等）のオーケストレーション手順を自ら実行し、実行担当サブエージェント委譲フェーズでは case-auto から直接実行担当サブエージェントへ委譲すること（委譲起点の折りたたみ、AG-002）。case-auto 自らは実装を行わないこと。

      **REQ-0114-100**（UPDATE）:
      インライン実行時のコンテキスト管理は harness の機能で対応し、REQ-0114-073（親コンテキスト非累積）は case-run インライン実行時の例外として扱うこと。インライン実行の適用を完了報告に記録すること（フォールバック而非標準動作として）。

      **REQ-0114-101**（UPDATE）:
      case-auto の所有対象は入力解決、auto_gate確認、artifact_actions基準工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測、case-run インライン実行時の準備/クリーンアップフェーズのオーケストレーション手順に限定する。実行エージェント選定、スケジューリング、並列数、エラー解析、context圧縮、retry、QG再評価、capture再実装は harness 責務とし、case-auto は規定しない（REQ-0162-002 の case-auto 適用）。

  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:case-auto-inline-case-run
    source_items: [AG-001, AG-002]
    content: |
      # ADR: case-auto における case-run インライン実行（多重委譲回避）

      ## Status

      Accepted（req-save で確定）

      ## Context

      case-auto は構成工程（req-save / spec-save / case-open / case-run / case-close）を各コマンドの委譲起動で実行する設計であった（ADR-0127）。このうち case-run は実行担当サブエージェントへ further delegation する 2 段階委譲構造を持つ。

      しかし、oh-my-openagent（omo）ハーネスの call_omo_agent ツールは explore / librarian agent 型のみを許可し、実行担当サブエージェント型の起動を許容しない。この制約により case-auto → case-run → 実行担当サブエージェントの 2 段階委譲 chain が破綻する。

      実運用（ses_09a81d1c5, Epic #1515 処理）において、case-run オーケストレータが実行担当サブエージェントを兼務する ad-hoc インライン実行で 6 子Issue を完遂した実績がある。この時は現行 spec（G07, Step 4-0）違反の回避であった。

      ses_09cdd5833 で extension rule case-run-inline-mode としてインライン実行機構を一度実装したが、omo への強い暗黙前提を懸念してリバートした。その後、以下の判断に至った:

      1. omo は暗黙の前提である（利用プロジェクトごとに extensions で対応するのは非現実的）
      2. 非 omo ハーネスも omo と同様に多重委譲を許容しない可能性がある
      3. したがって、フォールバックとしてインライン実行を追加するのではなく、最初から多重委譲を要求しない構造にする

      ## Decision

      case-auto は case-run を委譲ではなくインライン実行する。case-run.md を authoritative source として読み込み、case-auto のコンテキスト内で case-run の準備/クリーンアップフェーズを自ら実行し、実行担当サブエージェントへ直接委譲する（委譲起点の折りたたみ）。

      これにより委譲チェーンを case-auto → 実行担当サブエージェントの1段階に圧縮し、多重委譲の制約に起因する chain 破綻を構造的に排除する。

      req-save / spec-save / case-open / case-close は従来通り委譲起動とする（ADR-0127 の適用範囲はこれらの工程に縮小）。

      ## Consequences

      - REQ-0114 複数行 UPDATE（006, 084, 085, 086, 095, 096, 097, 098, 099, 100, 101）
      - ADR-0127 の適用範囲が case-run を除く4工程に縮小（ADR-0127 自体は retire しない）
      - case-auto SPEC（docs/specs/commands/case-auto.md）UPDATE
      - case-auto のコンテキスト使用量が増加（case-run のオーケストレーションを含むため）。コンテキスト管理は harness の機能（compress 等）で対応する
      - REQ-0114-099 委譲起点の折りたたみ機構がフォールバックから標準動作へ昇格

      ## Considered Alternatives

      1. extension（case-run-inline-mode rule）によるプロジェクト別対応: 非現実的（全利用プロジェクトが同じ設定を必要とする）
      2. フォールバックとしてのインライン実装（ses_09cdd5833 で一度実装しリバート）: フォールバックは例外的扱いであり、標準構造として多重委譲を要求しない設計が望ましい

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    target_area: "## 現在の動作"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |
      docs/specs/commands/case-auto.md の以下セクションを UPDATE する。
      変更後セクション全文（対象セクション見出しから次の同レベル見出しの直前まで）:

      ## 現在の動作

      - Step 1: 入力解決
        - 実行開始時刻の記録（REQ-0114-082）（JST、人間が読みやすい形式で case_auto_started_at 変数に保持）
        - Issue番号/URL入力モード（^\d+$ または GitHub Issue URL の場合、case-run移行モードへ分岐）
        - 要件doc入力モード（明示パス→draft検出（複数件含む全件処理）→セッション内要件docの順で入力特定）
      - Step 2: work_type 読取（draft-data から work_type 取得（参考情報、パイプライン分岐には使用しない、REQ-0138-010））
      - Step 3: 工程分岐（work_type 固定分岐ではなく artifact_actions 存在による動的判定、REQ-0138-009）
        - Issue番号/URL入力: case-run（インライン）→ case-close（req-save、spec-save、case-open、work_type読取スキップ）
        - artifact_actions ベース分岐: artifact: req or artifact: adr → req-save / artifact: spec → spec-save（req-save の後）/ 常に → case-open / その後 → case-run（インライン）→ case-close
        - spec-save 実行判定（ADR-0123 Decision #3, REQ-0136-014）（req-save 完了後に artifact: spec entry 確認）
        - auto_gate preflight（auto_gate.auto_ready が false または未解決 item 残る場合は停止）
      - Step 4: 各工程の実行
        - 委譲工程（req-save / spec-save / case-open / case-close）: 実行担当サブエージェントとして起動（ADR-0127, REQ-0114-006/084/085）。req-save / spec-save 統合委譲で順次実行、case-open / case-close は各コマンド委譲契約に従い起動。委譲起動不能時に delegation-unavailable 報告（REQ-0162-003/004）
        - case-run（インライン実行）: case-auto が case-run.md を authoritative source として読み込み、準備/クリーンアップフェーズを自ら実行。実行担当サブエージェント委譲フェーズでは case-auto から直接実行担当サブエージェントへ委譲（委譲起点の折りたたみ、AG-001/002）。adapter skill（agentdev-case-run-execution-adapter）を case-auto が読み込む
      - Step 4-1: Wave 反復制御（Epic Issue 指定時）
        - case-auto が Epic Issue 番号を記録。Epic Issue 本文から Wave 構成、各子Issue ステータスを読み取る（読み取りのみ、Epic Issue 本文の書き込みは case-close の責務）
        - case-auto が現在 Wave の ready 子Issue を選択し、各子Issue ごとにインライン case-run を実行（最大5件並列、REQ-0130-026 踏襲）。各子Issue の実行担当サブエージェントへ case-auto から直接委譲
        - Wave 内全子Issue の完了（completed-pr / blocked / failed / delegation-unavailable）を待機
        - completed-pr の子Issue がある場合、case-close(#epic) へ委譲
        - 残 Wave がある場合、次 Wave を実行（べき等）
      - Step 5: 工程間の状態引き継ぎ（Issue番号、PR番号、RU ファイルパス、capture 対象情報を最終工程まで保持）
      - Step 6: 複数REQ対応（req-save 委譲の出力から複数 REQ doc または scale:large 検出時、case-open の Issue 構造ルールを使用）
      - Step 7: 停止条件の検出（停止時タイミング情報の追記。10項目の停止条件いずれかを検出時、実行停止）
      - Step 8: 完了報告（タイミング情報追記。インライン実行の適用を記録）

      ### 委譲起動不能時の扱い（REQ-0162-003/004）

      委譲工程（req-save / spec-save / case-open / case-close）の委譲が起動できなかった場合、case-auto は当該工程を delegation-unavailable として報告する。

      case-run インライン実行時の実行担当サブエージェントへの委譲失敗は、case-run result 契約（completed-pr / blocked / failed / delegation-unavailable）に従い処理する。delegation-unavailable の場合は当該子Issue を pending に戻す（REQ-0162-004）。

      genuine blocker（実装上の問題、スコープ外操作、コンフリクト解消不能等）は Step 7 停止条件として扱う。

      context 管理:
      - case-run インライン実行時のコンテキスト管理は harness の責務（REQ-0162-002）
      - REQ-0114-073（親コンテキスト非累積）は case-run インライン実行時の例外として取り扱う

conflict_resolutions:
  - id: CR-001
    conflict: |
      case-run の委譲制限を extensions（.agentdev/extensions/）で対応するか、case-auto 本体に実装するか。
      ADR-0136（harness 実行制御分離）は配布物の harness 非依存を原則とし、インライン実行は配布 SPEC から除外としていた。
    resolution: |
      case-auto 本体に実装する。利用プロジェクトごとに extensions で対応するのは非現実的（全プロジェクトが同じ設定を必要とする）。
      omo は暗黙の前提であり、非 omo ハーネスも同様の制約を持つ可能性がある。
      ADR-0136 の原則（配布物は harness 非依存）は維持しつつ、インライン実行は case-run の業務ワークフロー手順を実行するものであり、
      実行担当サブエージェントの起動手段（harness 依存）は従来通り AGENTS.md / references/<harness>.md に配置する。
      新 ADR（new:case-auto-inline-case-run）で ADR-0136 に対する例外として明記する。

  - id: CR-002
    conflict: |
      インライン実行をフォールバック（委譲失敗時の例外）とするか、標準動作（最初からインライン）とするか。
      REQ-0114-098/099 は現行フォールバック扱い。
    resolution: |
      標準動作とする。多重委譲を最初から要求しない構造とすることで、chain 破綻を構造的に排除する。
      フォールバック扱いでは「標準で動くべき環境で動かない」状態を例外的に扱うことになり、運用が複雑化する。
      REQ-0114-099（委譲起点の折りたたみ）を標準動作へ昇格させる。

operation_units:
  - ou_id: OU-001
    source_ru: null
    target_req: REQ-0114
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      case-auto を実行し、case-run 工程が委譲起動（task() 等）ではなくインライン実行されていることを確認する。
      case-auto の実行ログ、完了報告において case-run が subagent delegation ではなくインライン実行されたことを検証する。
    pass_criteria: |
      case-auto が case-run.md を読み込み、case-auto のコンテキスト内で case-run の手順を実行していること。
      case-auto → case-run の delegation が発生していないこと。
    on_failure: |
      fix-and-reverify。インライン実行が実装されていない場合、case-auto.md および case-auto SPEC を修正して再検証。

  - id: TS-002
    target_item: AG-002
    verification: |
      case-auto 実行時、実行担当サブエージェントへの委譲が case-auto から直接起動されていることを確認する。
      委譲 chain が case-auto → 実行担当サブエージェントの1段階であることを検証する。
    pass_criteria: |
      委譲起点が case-auto であり、case-run を経由した 2 段階委譲が発生していないこと。
      adapter skill（agentdev-case-run-execution-adapter）が case-auto に読み込まれていること。
    on_failure: |
      fix-and-reverify。委譲 chain が2段階以上の場合、委譲起点の折りたたみ実装を修正して再検証。

  - id: TS-003
    target_item: AG-003
    verification: |
      Epic Wave モードで case-auto を実行し、Wave 反復制御、子Issue 選択、子Issue 並列委譲が case-auto により直接行われることを確認する。
    pass_criteria: |
      case-run(#epic) への委譲が発生せず、case-auto が各子Issue ごとにインライン case-run を実行していること。
      子Issue 並列委譲上限（最大5件）が維持されていること。
    on_failure: |
      fix-and-reverify。Wave 反復制御ロジックを修正して再検証。

  - id: TS-004
    target_item: AG-004
    verification: |
      case-auto 実行時、req-save / spec-save / case-open / case-close が従来通り委譲起動されていることを確認する。
      これらの工程で delegation-unavailable が発生した場合、停止条件として扱われることを確認する。
    pass_criteria: |
      req-save / spec-save / case-open / case-close が subagent delegation で起動されていること。
      delegation-unavailable 発生時に case-auto が停止し、報告すること。
    on_failure: |
      fix-and-reverify。委譲起動ロジックを修正して再検証。

case_open_hints:
  epic_needed: false
```

# summary

case-auto が case-run を委譲ではなくインライン実行する構成へ再構築する要件。
多重委譲（case-auto → case-run → 実行担当サブエージェント）を回避し、委譲チェーンを1段階に圧縮する。
REQ-0114-099（委譲起点の折りたたみ）をフォールバックから標準動作へ昇格させる。
主な変更対象: REQ-0114（11要件行 UPDATE）、新規 ADR、case-auto SPEC。
