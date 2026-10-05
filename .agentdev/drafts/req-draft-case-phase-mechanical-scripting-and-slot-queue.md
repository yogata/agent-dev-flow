---
draft_type: req_draft
topic_slug: case-phase-mechanical-scripting-and-slot-queue
status: draft
created_at: 2026-10-06T02:00:00+09:00
source_rus:
  - RU-0162
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |-
  case-open STEP-4・case-ready・case-close の機械的に確定した手順（worktree 作成、検査実行、索引再生成、整合検査、traceability 検査、commit、マージ前後処理等）を、各 workflow skill 配下の工程別 script 1 回の呼び出しに束ね、報告 JSON（実行結果・差分・警告・提案する Issue/PR 本文）を stdout へ返す。GitHub I/O は Custom Tool agentdev_gh の境界を維持し、script はローカル決定的処理のみとする。意味判断（停止判断、deviation 分類、adversarial review、警告の重要度評価）はモデルが担当し続ける。orchestration stage 3 の Wave 障壁を緩和し、完了即次投入のスロット型キュー（依存充足済み子 Issue の即時投入、依存関係のある Definition merge の排他維持、wave-gate 依存充足ゲート純関数の再利用）へ変更する。これに伴い REQ-034-012/040・REQ-035-017 を意味変更し、DEC-041 決定5 を置換する新規 Decision を作成する。HITL question をスキップ可能キュー化し（人間留保判断・安全境界のブロッキング停止は維持）、委譲プロンプト雛形へ必須契約要約を埋め込み、bash 内蔵コマンドの内蔵ツール使用規律を各 workflow skill へ明記する。工程スコープシグナル（影響ファイル数 10 超: 工程 script ×3、references 文面、workflow skill ×5、Design ×6、REQ ×2、Decision ×1、配布 command、テスト群）により scale: large とする。RU-0162 の generation_actor: supervisor と session 由来 RU 契約固定値 req-define-parent の差異は case-open 開始前に解決する（配置許可を契約改訂の承認として扱わない、正規契約は変更しない）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      変更の原則: 意味判断（停止判断、deviation 分類、adversarial review、警告の重要度評価）はモデルが担当し続ける。worktree 作成、テンプレート複写、索引再生成、整合検査、traceability 検査、commit、PR/Issue 本文の組立といった決定的処理は、各 workflow skill 配下の script 1 呼び出しに束ねる。GitHub I/O（issue/pr 作成・マージ・クローズ）は Custom Tool agentdev_gh のまま維持し、script はローカル決定的処理のみとする境界を維持する。script は工程別の個別 script とし、共通基盤は作らない（3 工程の実測が揃ってから別途検討）。実装は inspect_cross_dependencies.ts と同じ作りに従う。
  - id: AG-002
    content: |-
      case-open STEP-4（実変更判定と Definition PR 作成）の機械工程（worktree 作成から REQ 行編集、generate_indexes、check_integrity、traceability check、commit まで）を 1 script 呼び出しとし、報告 JSON（実行結果・差分・警告・提案する Issue/PR 本文）を stdout へ返す。モデルは報告 JSON の意味レビューと agentdev_gh による I/O 実行のみを担う。
  - id: AG-003
    content: |-
      case-ready・case-close の機械工程も同様に工程別 script 化する。case-ready は Definition PR の忠実性・整合性・品質検査、overlap 突合、AUTOGEN 再生成差分検出、traceability check、merge 後 canonical 再取得、draft/RU 削除 commit を対象とし、REQ/Decision/Design の保存実体（Capability Skill 委譲による保存手続き）は対象外として保存責務の委譲構造を変更しない。case-close は mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の解析と状態更新、完了条件チェックボックス評価の機械的抽出、AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約、worktree/branch クリーンアップを対象とする。
  - id: AG-004
    content: |-
      workflow skill 参照文面（references/*.md）を、LLM が bash コマンドを逐次実行する指示から script 呼び出しと報告 JSON 解釈への置換へ短縮する。REQ-018-002/005/008・REQ-061-037 が要求する references・手順への明文化は、移行後の保存先（script または Design）で維持する。
  - id: AG-005
    content: |-
      既存の品質ゲート（check_integrity、traceability check、generate_indexes 差分検出、textlint 最終検査）は全て script 内で実行し、省略しない。script は処理を省略せず、失敗時は途中結果とともに非 0 で終了する。空の結果や既定値で成功扱いにしない。
  - id: AG-006
    content: |-
      orchestration stage 3 の Wave 障壁を緩和する。子 Issue の開始は当該子 Issue に必要な全ての意味的依存条件の充足（必要な統合・マージの完了を含む）のみを条件とし、Wave 収束を後続の子 Issue 開始の前提としない（完了即次投入のスロット型キュー）。Wave 構成は意味的依存 DAG から決定的に導出される実行構成の記録単位として維持し、依存充足の判定は wave-gate.ts の依存充足ゲート純関数を再利用する。共有 active Issue task 枠（上限 5）と依存関係のある Definition merge の排他は維持する。blocked、failed、delegation-unavailable は依存充足とはみなさない。
  - id: AG-007
    content: |-
      委譲プロンプト雛形（agentdev-case-run-execution-adapter の references/harness-delegation.md）へ、委譲先が毎回参照資料を読み直さなくても済む程度の必須契約要約（result 4状態、3点ゲート、worktree 隔離、PR 本文・SSoT チャネルの必須セクション、禁止事項の要点）を埋め込む。要約は参照資料の正規契約を代替せず、REQ-003-020 の category 選定・禁止事項セクションの要件は維持する。
  - id: AG-008
    content: |-
      orchestration 中の警告・確認・選択肢提示に由来する HITL question をノンブロッキング化し、スキップ可能キューへ投入して stage 境界または完了報告で一括提示する。人間に留保された判断（REQ-096-005）の新規確定と既存の安全境界が要求する操作承認を要する停止は本キューの対象外として従来どおりブロッキングする（REQ-015-012、REQ-061-003 の停止契約は変更しない）。
  - id: AG-009
    content: |-
      bash 内蔵コマンド（grep、ls 等）によるファイル検索・内容検索・ディレクトリ列挙を標準手順とする指示を各 workflow skill の本文・references から除外し、実行基盤の内蔵ツール（ファイル検索、内容検索、読み取り）の使用を明記する。bash 実行が本来必要な処理（script 呼び出し、git 操作等）は対象外とする。
  - id: AG-010
    content: |-
      効果測定は同じ入力（同等の draft・Case 規模）での変更前後比較で行う。case-open/ready/close 各 1 件の実施で、従来の bash 逐次実行（OU1 件あたり read 20 回・bash 57 回・所要 29 分）が script 呼び出し中心（ツール呼び出し約 6 回）へ置換され、所要が目安半減すること、報告 JSON に実行結果・差分・警告・提案本文が含まれ、モデルが意味レビューを行った痕跡（review ログ）が残ることを確認する。測定条件（入力、環境、計測単位）を記録し、測定変動を効果の証明に使わない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-034.md
    source_items: [AG-006]
    content: |
      | REQ-034-012 | case-auto は同一 Epic 内の子 Issue の開始を、当該子 Issue に必要な全ての意味的依存条件の充足（必要な統合・マージの完了を含む）を条件とすること。Wave 収束（全子 Issue の実行結果確定）を後続の子 Issue 開始の前提とせず、共有 active Issue task 枠（REQ-034-027）に空きが生じたときは依存充足済みの子 Issue から投入すること（完了即次投入のスロット型キュー）。Wave 構成（REQ-061-038）と依存充足ゲートの判定を維持し、依存条件が未充足の子 Issue を投入しないこと |
      | REQ-034-040 | case-auto は active Issue task 数が上限未満の場合、各 Epic の依存充足済みの子 Issue（Wave の前後を前提としない）と Standard Issue から開始条件を満たす Issue を横断して候補として認識し、実行上の安全条件を満たす候補がある限り補充すること（横断補充は best-effort でなく必須）。最初に起動した全 task の完了を待つ固定 batch 方式を取らず、既存の起動間隔・局所的な競合回避は維持すること |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-035.md
    source_items: [AG-006]
    content: |
      | REQ-035-017 | 子 Issue の開始条件は当該子 Issue に必要な全ての意味的依存条件の成立（必要な統合・マージの完了を含む）を満たすこと。実装 task の完了（PR 作成）と依存充足を区別すること。Wave 収束（REQ-035-016）を子 Issue 開始の前提とせず、共有 active Issue task 枠の空き発生時に依存充足済みの子 Issue から投入すること |
  - id: ACT-DEC-001
    artifact: adr
    operation: create
    target_decision: new:case-auto-stage3-slot-queue
    canonical_owner: "Decision（docs/decisions/。採番と保存は case-ready の Decision 保存内部責務）"
    source_items: [AG-006]
    content: |
      ---
      title: "case-auto stage 3 のスロット型キューへの移行（Wave 収束前提の撤廃）"
      status: proposed
      related_reqs: [REQ-034, REQ-035]
      relations:
        - type: supersedes
          target: DEC-041
          reason: 決定5（Wave 収束と依存充足の二条件 gate）を依存充足ゲート単独条件へ置換する。決定1（Wave 構成純度）、決定2（実行並列上限の単一所有）、決定3（論理上限と harness 制限の切り離し）、決定4（重複検出の用途転換）は維持する
        - type: relates-to
          target: DEC-042
          reason: スロット型キューは stage 3 の最大並列維持（並列必須・順次フォールバック禁止）を支援する進行モデル
      ---

      # case-auto stage 3 のスロット型キューへの移行（Wave 収束前提の撤廃）

      ## 背景

      過去 72 時間（2026-10-02〜05）の OpenCode 実測（268 セッション、19,428 ツール呼び出し）で、case-open（平均 29 分・31 実施）、case-ready（平均 21 分・20 実施）、case-close（平均 27 分・30 実施）の所要の大半が LLM 推論ターンであり、機械的に確定した手順を LLM が bash コマンド 1 個ずつとして生成・実行している構造が主因である（RU-0162 の合意、2026-10-05）。加えて stage 3 の Wave 障壁により、依存充足済みの子 Issue が前 Wave の収束待ちで遊休する。DEC-041 決定5 は次 Wave 開始に Wave 収束と依存充足の両方を要求しており、この収束前提が遊休の直接原因である。

      ## 決定

      1. **依存充足ゲート単独条件化**: 子 Issue の開始条件は当該子 Issue に必要な全ての意味的依存条件の充足（必要な統合・マージの完了を含む）のみとし、Wave 収束（全子 Issue の実行結果確定）を後続の子 Issue 開始の前提としない（完了即次投入のスロット型キュー）。
      2. **Wave 構成の記録単位化**: Wave 構成は意味的依存 DAG から決定的に導出される実行構成の記録単位として維持する（DEC-041 決定1 の構成純度は維持）。依存充足の判定は wave-gate の依存充足ゲート純関数を再利用し、判定ロジックを新規作成しない。
      3. **実行上限・排他の維持**: 共有 active Issue task 枠（上限の数値は case-auto Design が所有）と依存関係のある Definition merge の排他は維持する（DEC-041 決定2/3、DEC-042 と整合）。
      4. **依存充足判定の区別の維持**: blocked、failed、delegation-unavailable は依存充足とはみなさない（DEC-041 決定5 の依存充足側の区別を維持）。

      ## 代替案

      - Wave 障壁の維持（現行）: 依存充足済み子 Issue の遊休を解消できず、実測された並列度の損失が残るため不採用。
      - Wave 構成自体の廃止: Epic 実行構成表・case-close の進行判定・実行構造の決定的導出（REQ-061-038）が失われるため不採用（記録単位として維持）。

      ## 結果、影響

      - 正: 依存充足済み子 Issue の遊休期間の削減、stage 3 のスループット向上、機械工程 script 化（RU-0162）との相乗。
      - 負: Wave 単位の進行把握が Epic 実行構成表の状態管理への依存を強める。投入制御の実装と回帰検証（依存違反投入ゼロ、上限・二重起動防止、実行構成表の状態整合）が必要。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-auto.md
    target_area: "### 並列実行の判定"
    canonical_owner: "case-auto Design（docs/designs/commands/case-auto.md）"
    source_items: [AG-006]
    content: |
      ### 並列実行の判定

      並列可否は連結成分（必須依存のみをエッジとする）で判定する（REQ-034-013）:

      - 必須依存がない複数 execution_unit 間（Epic 間、Standard 間、混在）は並列実行
      - 同一 Epic 内の子 Issue 間は意味的依存で順序づけ、依存充足済みの子 Issue からスロット型キューで投入する（REQ-034-012）
      - 技術的依存レベル（L0-L3）は並列判定軸から外す。ファイル衝突（L2）があっても並列を許容し、PR マージコンフリクトは後続 PR の rebase で解決する（REQ-034-013, REQ-031-003）

      グローバル並列上限は設定しない（REQ-034-013）。
      実行並列上限は 1 回の orchestration の stage 3 全体で共有される active Issue task 数の上限（REQ-034-027、数値 5）として case-auto が単一所有する（DEC-041）。
      Epic、Wave、Standard Issue、case-run 呼出しごとの独立した実行枠は設けない。N 個の execution_unit が並列実行された場合も、stage 3 全体で共有される active Issue task 数のみが制御対象となる。論理上限と harness の同時起動制限（bg task API 上限等）は切り離し、harness 制限は adapter・実装制約（キューイング・バンドリング等）として扱い、論理上限の値の根拠としない（DEC-041）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-auto.md
    target_area: "### runtime 制御契約"
    canonical_owner: "case-auto Design（docs/designs/commands/case-auto.md）"
    source_items: [AG-006]
    content: |
      ### runtime 制御契約

      stage 3 の runtime 制御ループは case-auto が所有し、次の契約に従う（REQ-034-040〜045、REQ-035-016、REQ-035-017、DEC-041、DEC-042。詳細は v4-runtime-execution-model「runtime 制御ループ」節）:

      - 共有 active 枠: 1 active task は 1 Issue への実装実行委譲であり、Epic・Wave・Standard Issue を横断して active Issue task 数が上限（現行 5）を超えない
      - 空き枠補充: 各 Epic の依存充足済みの子 Issue（Wave の前後を前提としない）と Standard Issue から開始条件を満たす Issue を候補として認識し、active 数が上限未満で実行上の安全条件を満たす候補がある限り補充する（横断補充は best-effort でなく必須）。最初に起動した全 task の完了を待つ固定 batch 方式を取らず、起動間隔（10 秒）と局所的な競合回避の運用は維持する（REQ-034-040）
      - 状態管理: Issue 実行の状態を pending、ready、active、実行結果確定で区別して管理する（REQ-034-041）
      - 再開: 再開時は既存の active task を計上し、同一 Issue の二重起動と上限超過を防ぐ。状態不明の task は終了確認まで実行枠を解放せず、完了済み Issue を未完了に戻さない（REQ-034-041）
      - 統合処理: 統合処理（マージ・クローズ相当）は active Issue task の実行枠を消費しないが、共有書き込みの直列化点として扱う（REQ-034-042）
      - 依存充足ゲートとスロット型キュー: 子 Issue の開始は当該子 Issue に必要な全ての意味的依存条件の充足（必要な統合・マージの完了を含む）のみを条件とし、Wave 収束（全子 Issue の実行結果確定、未処理・実行中・状態不明なし）を後続の子 Issue 開始の前提としない（完了即次投入のスロット型キュー）。Wave 構成は意味的依存 DAG から決定的に導出される実行構成の記録単位として維持し（REQ-061-038）、依存充足の判定には wave-gate の依存充足ゲート純関数を再利用する。blocked、failed、delegation-unavailable は依存充足とはみなさない（REQ-034-012、REQ-035-016、REQ-035-017）。依存関係のある Definition merge は排他維持する
      - 重複の実行時検出: stage 3 の委譲前に同一 Wave 内の子 Issue 間で変更対象ファイル集合の重複を検出し、一時直列化・変更対象の調整・merge 順序・衝突解消担当の判断に用いる。変更対象集合が取得不能な子 Issue を含む場合は比較を省略せず検出不能として報告する（REQ-034-043、REQ-035-012）
      - Wave 表現: Wave 表現は子 Issue 数の上限を持たない（Epic サイズ上限のみ適用）。runtime 上の batch や一時直列化を Wave 分割として永続化しない（DEC-041）
      - 並列維持（REQ-034-028、REQ-034-044、DEC-042）: 並列実行は必須であり、実行環境由来の障害（background task の消失、親 run の中断、プロバイダー障害等）を理由とする同期逐次実行（順次フォールバック）への切替を行わない。並列起動が当該 stage の起動可能対象集合に対して1件も成立しない場合は、直列化で完了を装わず停止理由「並列起動不能」（原因の断定を含まない）と再開可能性を報告して停止する。再開時は REQ-034-025 の再開契約および REQ-034-041（再開時の active task 計上、同一 Issue の二重起動防止）に従うことを条件に、durable state（Issue、PR、RU、draft、bg task 状態、worktree の git 状態）を照合して未完了かつ再試行可能な対象のみを特定し、起動間隔契約（最初の委譲は直ちに開始、以降の委譲起動ごとに間隔を置く、同一ツール呼び出し一括ブロックでの複数起動を行わない、前 task の完了待ちを起動の条件にしない）に従う staggered background fan-out で並列再委譲し、並列性の回復を resume の反復で追求する（反復に回数上限を設けない）。REQ-034-029 の状態別回復（親ループによる代行回復を含む）および REQ-034-030 のコンフリクト解消再委譲は本条の対象外とし各既存契約に従う
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/commands/case-auto.md
    target_area: "### HITL question のスキップ可能キュー（RU-0162）"
    anchor: "## 承認・HITL 境界"
    placement: tail
    canonical_owner: "case-auto Design（docs/designs/commands/case-auto.md）"
    source_items: [AG-008]
    content: |
      ### HITL question のスキップ可能キュー（RU-0162）

      orchestration 中の警告・確認・選択肢提示に由来する HITL question は、工程の進行をブロックしない。下位 workflow は回答を要しない question をスキップ可能キューへ投入し、既定の安全側の挙動（警告の記録と継続、または当該対象のみの停止）で進行し、キューの内容を stage 境界または完了報告で一括提示する。人間に留保された判断（REQ-096-005）の新規確定と、既存の安全境界が要求する操作承認を要する停止は本キューの対象外とし、従来どおりブロッキングする（REQ-015-012、REQ-061-003 の停止契約は変更しない）。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/commands/case-open.md
    target_area: "### 機械工程の script 呼び出し契約（RU-0162）"
    anchor: "## 現在の動作"
    placement: tail
    canonical_owner: "case-open Design（docs/designs/commands/case-open.md）"
    source_items: [AG-001, AG-002, AG-004, AG-005]
    content: |
      ### 機械工程の script 呼び出し契約（RU-0162）

      case-open STEP-4（実変更判定と Definition PR 作成）の機械工程（専用 worktree 作成、Definition branch 作成、REQ 行編集、generate_indexes、check_integrity、traceability check、明示パス指定 stage・commit まで）は、工程別 script 1 回の呼び出しに束ねる。script はローカル決定的処理のみを担当し、GitHub I/O（Issue/PR 作成・マージ・クローズ）は Custom Tool agentdev_gh の境界を維持し、script 内で直接実行しない。

      - 入力 JSON: 対象 draft パス、Root Case 識別子、Definition branch 名など所定の入力一式を渡す
      - 報告 JSON: 実行結果（各処理の成否）、差分、警告、提案する Issue/PR 本文を stdout へ返す。提案本文の採否と報告内容の意味レビューはモデルが担当する
      - 終了コード: 成功は 0、要判断・失敗は非 0 を区別する。script は処理を省略せず、失敗時は途中結果とともに非 0 で終了する
      - 既存の品質ゲート（check_integrity、traceability check、generate_indexes 差分検出）は script 内で実行し、省略しない
      - script の実装は inspect_cross_dependencies.ts と同じ作りに従い、共通基盤は作らない
      - 意味判断（停止判断、deviation 分類、adversarial review、警告の重要度評価）はモデルが担当し続け、script は機械的に確定した手順のみを実行する
      - workflow skill 参照文面（references/*.md）は、LLM が bash コマンドを逐次実行する指示から script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target: docs/designs/commands/case-ready.md
    target_area: "## 機械工程の script 呼び出し契約（RU-0162）"
    anchor: "## Definition 適用直前の対象セクション照合"
    placement: tail
    canonical_owner: "case-ready Design（docs/designs/commands/case-ready.md）"
    source_items: [AG-001, AG-003, AG-004, AG-005]
    content: |
      ## 機械工程の script 呼び出し契約（RU-0162）

      case-ready の機械工程（Definition PR の忠実性・整合性・品質検査の実行、overlap 突合、AUTOGEN 対象 block の再生成差分検出、traceability check、merge 後の canonical 再取得、draft/RU 削除の git rm と明示パス指定 commit）は、工程別 script 1 回の呼び出しに束ねる。GitHub I/O（pr_read、pr_merge、Issue 本文更新）は Custom Tool agentdev_gh の境界を維持する。REQ/Decision/Design の保存実体（Capability Skill 委譲による保存手続き）は本 script の対象外とし、保存責務の委譲構造を変更しない。

      - 入力 JSON / 報告 JSON / 終了コードの契約、品質ゲートの script 内実行（省略禁止）、inspect_cross_dependencies.ts と同じ作り（共通基盤不作成）、意味判断のモデル担当は、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節と同一の規律に従う
      - 報告 JSON には検査結果、再生成差分、警告、提案する Issue/PR 本文を含め、モデルは報告 JSON の意味レビューと agentdev_gh による I/O 実行のみを担う
      - workflow skill 参照文面は script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
  - id: ACT-DESIGN-006
    artifact: design
    operation: append
    target: docs/designs/commands/case-close.md
    target_area: "## 機械工程の script 呼び出し契約（RU-0162）"
    anchor: "## 完了条件単位の最終評価と非循環証拠（REQ-032-031〜038、RU-20261004-08）"
    placement: tail
    canonical_owner: "case-close Design（docs/designs/commands/case-close.md）"
    source_items: [AG-001, AG-003, AG-004, AG-005]
    content: |
      ## 機械工程の script 呼び出し契約（RU-0162）

      case-close の機械工程（mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の解析と状態更新、完了条件チェックボックス評価の機械的抽出、AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約、worktree/branch クリーンアップ）は、工程別 script 1 回の呼び出しに束ねる。GitHub I/O（pr_merge、issue_close、Issue 本文更新）は Custom Tool agentdev_gh の境界を維持する。

      - 入力 JSON / 報告 JSON / 終了コードの契約、品質ゲートの script 内実行（省略禁止）、final-acceptance.ts・inspect_cross_dependencies.ts と同じ作り（共通基盤不作成）、意味判断（警告の重要度評価、Design 確定判断、未達判定の確定）のモデル担当は、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節と同一の規律に従う
      - 報告 JSON にはマージ・検証・クリーンアップの各結果、差分、警告、提案するコメント本文を含める
      - workflow skill 参照文面は script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
  - id: ACT-DESIGN-007
    artifact: design
    operation: append
    target: docs/designs/skills/agentdev-case-run-execution-adapter.md
    target_area: "## 委譲プロンプト雛形への必須契約要約の埋め込み（RU-0162）"
    anchor: "## v4 責務分類"
    placement: tail
    canonical_owner: "agentdev-case-run-execution-adapter Design（docs/designs/skills/agentdev-case-run-execution-adapter.md）"
    source_items: [AG-007]
    content: |
      ## 委譲プロンプト雛形への必須契約要約の埋め込み（RU-0162）

      委譲プロンプト雛形（references/harness-delegation.md）には、委譲先が毎回参照資料を読み直さなくても済む程度の必須契約要約（result 4状態、3点ゲート、worktree 隔離、PR 本文・SSoT チャネルの必須セクション、禁止事項の要点）を埋め込む。要約は参照資料の正規契約を代替せず、参照先を明示した要約として雛形内に保持する。雛形の構造変更は委譲契約の意味を変更しない（REQ-003-020 の category 選定・禁止事項セクションの要件は維持する）。
  - id: ACT-DESIGN-008
    artifact: design
    operation: append
    target: docs/designs/workflows/workflow-skill-model.md
    target_area: "### workflow skill 本文における内蔵ツール使用規律（RU-0162）"
    anchor: "### 1:N 分割基準の適用実例（case-run）"
    placement: tail
    canonical_owner: "Workflow Skill Model（docs/designs/workflows/workflow-skill-model.md）"
    source_items: [AG-009]
    content: |
      ### workflow skill 本文における内蔵ツール使用規律（RU-0162）

      各 workflow skill の本文と references は、ファイル検索・内容検索・ディレクトリ列挙を bash 内蔵コマンド（grep、ls 等）で実行する指示を標準手順として含めず、実行基盤の内蔵ツール（ファイル検索、内容検索、読み取り）の使用を明記する。bash 実行が本来必要な処理（script 呼び出し、git 操作等）は本規律の対象外とする。機械工程の script 呼び出し契約（各 command Design の RU-0162 節）への移行後も、残余の探索・読取手順に本規律を適用する。

conflict_resolutions:
  - id: CR-001
    conflict: |-
      既存REQ照合の Jev 先行評価は領域A（機械工程 script 化・委譲雛形・bash 規律）の帰属を APPEND（0.58、REQ操作なし 0.37）と示した。一方で最終分類・Design 分離の Jev 評価は script 呼び出し契約の記述帰属を Design 行（0.93）と示し、RU 本文の要件化の方向も「各工程の workflow skill Design に script 呼び出し契約を追加し、参照文面を短縮する」と Design 追加を明記する。
    resolution: |-
      領域A を REQ操作なし（Design 追記・更新のみ）として確定した。根拠: (1) REQ-002-040 が「決定的な解析・変換・検証・生成は Script…実装手順を配布成果物の Markdown に残存させないこと」を既に所有しており、script 化はこの既存原則の個別適用であって新しいステークホルダー要求の創出ではない、(2) REQ-030/061/032 が所有するのは各工程の成果契約（公開契約）であり工程内部の実行形態は所有しない、(3) RU の要件化の方向が Design 追加を明記、(4) 暫定分類が挙動Design。差異理由 semantic_disagreement として Jev 観測（20261005T165045Z-38b5）へ記録済み。
  - id: CR-002
    conflict: |-
      orchestration stage 3 のスロット型キュー化は、DEC-041 決定5「Wave 収束と依存充足を区別し、次 Wave の開始は両方の成立を条件とする」と既存 Decision が確定済みの実行モデルに直接反する（REQ-034-012・REQ-035-017 も同旨の二条件を明文要求）。
    resolution: |-
      新規 Decision（new:case-auto-stage3-slot-queue）による DEC-041 決定5 の部分置換として解消する。決定1（Wave 構成純度）、決定2（実行並列上限の単一所有）、決定3（論理上限と harness 制限の切り離し）、決定4（重複検出の用途転換）は維持し、依存充足側の区別（blocked/failed/delegation-unavailable を充足としない）も維持する。REQ-034-012/040・REQ-035-017 の意味変更と case-auto Design の当該節更新を同一変更単位として扱う。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0162
    target_req:
      - docs/requirements/REQ-034.md
      - docs/requirements/REQ-035.md
    target_design:
      - docs/designs/commands/case-auto.md
      - docs/designs/commands/case-open.md
      - docs/designs/commands/case-ready.md
      - docs/designs/commands/case-close.md
      - docs/designs/skills/agentdev-case-run-execution-adapter.md
      - docs/designs/workflows/workflow-skill-model.md
    target_decision: new:case-auto-stage3-slot-queue
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-010
    verification: |-
      変更前後で case-open/case-ready/case-close 各 1 件の実施を同じ入力（同等の draft・Case 規模）で行い、工程ごとのツール呼び出し内訳（read・bash・script 呼び出し数）と所要時間を記録する。測定条件（入力、環境、計測単位、日時）を記録し、測定変動を効果の証明に使わない。照合基準は RU-0162 の実測値（OU1 件あたり read 20 回・bash 57 回・所要 29 分、ツール呼び出し約 6 回への置換、所要目安半減）とし、比較対照の入力規模が異なる場合は理由と対応を記録する。
    pass_criteria: |-
      3 工程すべてで bash 逐次実行から script 呼び出しへの置換が確認でき、所要が目安半減の方向である。半減未達の場合も置換構造の成立と残った bottleneck の特定を記録し、短縮を偽装しない。
    on_failure: |-
      fix-and-reverify: 置換構造の不足（script 対象範囲の狭さ、残余の逐次手順）に起因する場合は対象範囲を見直して再検証する。環境変動・provider 遅延に起因する場合は測定条件を整えて再計測する。
  - id: TS-002
    target_item: AG-002
    verification: |-
      case-open/ready/close 各工程 script の報告 JSON に実行結果・差分・警告・提案本文の 4 要素が含まれること、およびモデルが報告 JSON の意味レビューを行った痕跡（review ログ・完了報告・Issue/PR 本文への反映記録）が残ることを確認する。
    pass_criteria: |-
      3 工程すべてで報告 JSON の 4 要素と意味レビューの痕跡が存在する。
    on_failure: |-
      fix-and-reverify: 報告 JSON の構造不足または review 記録の欠落に起因するため修正して再検証する。
  - id: TS-003
    target_item: AG-001
    verification: |-
      新規工程 script 群と対象 workflow skill 配下の全 script について、rg で GitHub への書き込み系 gh CLI サブコマンドの直接実行（gh issue create、gh pr merge、gh issue close 等の呼び出し）を検索する。検索範囲は src/common/skills/agentdev-workflow-case-open/scripts/**、src/common/skills/agentdev-workflow-case-ready/scripts/**、src/common/skills/agentdev-workflow-case-close/scripts/**、src/common/skills/agentdev-workflow-case-auto/scripts/** とし、See Also 等の参照行は検出対象外とする。
    pass_criteria: |-
      script 内の GitHub I/O 直接実行が 0 件であり、GitHub I/O が agentdev_gh 操作経由のみであることが確認できる。
    on_failure: |-
      fix-and-reverify: script 内の I/O 実装違反に起因するため、当該箇所を agentdev_gh 操作経由へ戻して再検証する。
  - id: TS-004
    target_item: AG-005
    verification: |-
      各工程 script の実行ログ・報告 JSON から、check_integrity、traceability check、generate_indexes 差分検出、textlint 最終検査（case-close）が script 内で実行されたことを確認し、いずれかの品質ゲートが省略された工程がないことを確認する。
    pass_criteria: |-
      対象品質ゲートの実行記録が全工程に存在し、省略が 0 件である。
    on_failure: |-
      fix-and-reverify: ゲート呼び出しの欠落に起因するため script へ組込んで再検証する。
  - id: TS-005
    target_item: AG-006
    verification: |-
      wave-gate.ts の依存充足ゲート純関数を用いて、依存未充足子 Issue の投入拒否、blocked/failed/delegation-unavailable を充足としない判定、依存関係のある Definition merge の排他維持を単体テスト・結合テストで確認する。既存の Wave 関連テスト群の回帰を実行する。
    pass_criteria: |-
      依存違反の投入が 0 件であり、全テストが成功する。依存充足ゲートの判定ロジックが wave-gate 純関数の再利用であることが確認できる。
    on_failure: |-
      fix-and-reverify: 依存充足判定の実装不良に起因するため修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |-
      並列実行下でスロット上限超過がないこと、空き枠補充が機能すること、再開時の二重起動防止が維持されること、Epic 実行構成表の状態更新と現在 Wave 特定ロジックがスロット型キュー投入後も破綻しないことを、既存 orchestration テスト群の回帰と追加テストで確認する。
    pass_criteria: |-
      上限超過・同一 Issue の二重起動が 0 件であり、実行構成表の状態が投入順序によらず一貫する。
    on_failure: |-
      fix-and-reverify: スロット管理・実行構成表更新の実装不良に起因するため修正して再検証する。
  - id: TS-007
    target_item: AG-001
    verification: |-
      新規 script が各 workflow skill の scripts/ 配下に配置されていること、scripts/ 直下の公開入口（install.ps1 / self-sync.ps1 の 2 本）を追加・変更していないことを確認する（REQ-050-001、DEC-021）。bun 実行・cwd・相対パス解決が各 script の単体テストで確認済みであることを確認する。
    pass_criteria: |-
      公開入口 2 本が維持され、新規 script が skill 配下に配置されている。
    on_failure: |-
      fix-and-reverify: 配置違反に起因するため所定位置へ移動して再検証する。
  - id: TS-008
    target_item: AG-004
    verification: |-
      対象 workflow skill（agentdev-workflow-case-open / case-ready / case-close / case-auto、agentdev-case-run-execution-adapter）の references/*.md と SKILL.md に対し、rg で bash 内蔵コマンド（grep、ls 等）による検索・列挙を標準手順として命じる旧指示の残存を検索する。検索範囲は修正対象ファイル集合（RA-005・RA-007 の ownership_hints）に限定し、See Also 等の参照行は検出対象外とする。
    pass_criteria: |-
      標準手順としての旧 bash 逐次指示が 0 件であり、script 呼び出しと内蔵ツール使用への置換が確認できる。
    on_failure: |-
      fix-and-reverify: 参照文面の更新漏れに起因するため修正して再検証する。
  - id: TS-009
    target_item: AG-008
    verification: |-
      人間に留保された判断（REQ-096-005）の新規確定と既存の安全境界が要求する操作承認を要する停止がブロッキング維持されること（REQ-015-012、REQ-061-003 の停止契約の文言・挙動が変更されていないこと）を、配布 command・workflow skill の該当節とテストで確認する。キュー投入対象が警告・確認系に限られ、留保判断を含まないことを確認する。
    pass_criteria: |-
      停止契約が維持され、キュー対象が留保判断・安全境界の操作承認を含まない。
    on_failure: |-
      fix-and-reverify: HITL キューの対象判定の実装不良に起因するため修正して再検証する。

realization_actions:
  - id: RA-001
    concern: case-open STEP-4 機械工程 script の実装
    responsibility: |-
      src/common/skills/agentdev-workflow-case-open/scripts/ 配下に工程 script（worktree 作成、Definition branch 作成、REQ 行編集、generate_indexes、check_integrity、traceability check、明示パス指定 stage・commit までを 1 呼び出しに束ねる）とその入力 JSON・報告 JSON・終了コード契約、関連テストを実装する。inspect_cross_dependencies.ts と同じ作りに従い、GitHub I/O は扱わない。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-open/scripts/src/（新規工程 script）"
      - "src/common/skills/agentdev-workflow-case-open/scripts/src/*.test.ts（関連テスト）"
    intent: |-
      case-open の機械工程を 1 script 呼び出しに束ね、モデルを報告 JSON の意味レビューと agentdev_gh I/O に専念させる。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-007]
    source_items: [AG-001, AG-002, AG-005]
  - id: RA-002
    concern: case-ready 機械工程 script の実装
    responsibility: |-
      src/common/skills/agentdev-workflow-case-ready/scripts/ 配下に工程 script（Definition PR の忠実性・整合性・品質検査、overlap 突合、AUTOGEN 再生成差分検出、traceability check、merge 後 canonical 再取得、draft/RU 削除の git rm と明示パス指定 commit）と関連テストを実装する。REQ/Decision/Design の保存実体（Capability Skill 委譲）と GitHub I/O は対象外とする。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-ready/scripts/src/（新規工程 script）"
      - "src/common/skills/agentdev-workflow-case-ready/scripts/src/*.test.ts（関連テスト）"
    intent: |-
      case-ready の機械工程を 1 script 呼び出しに束ね、保存責務の委譲構造を変更しない。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-007]
    source_items: [AG-001, AG-003, AG-005]
  - id: RA-003
    concern: case-close 機械工程 script の実装
    responsibility: |-
      src/common/skills/agentdev-workflow-case-close/scripts/ 配下に工程 script（mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の解析と状態更新、完了条件チェックボックス評価の機械的抽出、AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約、worktree/branch クリーンアップ）と関連テストを実装する。final-acceptance.ts と同じ作りに従い、GitHub I/O は対象外とする。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-close/scripts/src/（新規工程 script）"
      - "src/common/skills/agentdev-workflow-case-close/scripts/src/final-acceptance.ts（既存パターン参照）"
    intent: |-
      case-close の機械工程を 1 script 呼び出しに束ね、品質ゲートの実行と証跡の集約を script 内で完結させる。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-007]
    source_items: [AG-001, AG-003, AG-005]
  - id: RA-004
    concern: orchestration stage 3 のスロット型キューへの移行
    responsibility: |-
      src/common/skills/agentdev-workflow-case-auto/ の stage 3 制御（wave-gate.ts の依存充足ゲート純関数を再利用した投入判定、空き枠補充の候補プール拡大、Epic 実行構成表の状態更新と現在 Wave 特定ロジックの整合、再開時二重起動防止の維持）を実装する。配布 command case-auto.md の不変条件記述（Wave 収束と依存充足の両条件 gate の記述）をスロット型キューへ更新する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-auto/scripts/src/wave-gate.ts（依存充足ゲート純関数の再利用）"
      - "src/common/skills/agentdev-workflow-case-auto/（stage 3 制御の実装・SKILL.md）"
      - "src/common/commands/agentdev/case-auto.md（orchestration stage 契約の記述更新）"
    intent: |-
      依存充足済み子 Issue の遊休を解消し、Wave 収束前提を撤廃する。依存充足ゲート・共有 active 枠・Definition merge 排他は維持する。
    verification_refs: [TS-005, TS-006]
    source_items: [AG-006]
  - id: RA-005
    concern: workflow skill 参照文面の短縮
    responsibility: |-
      対象 workflow skill（agentdev-workflow-case-open / case-ready / case-close / case-auto）の references/*.md を、LLM が bash コマンドを逐次実行する指示から script 呼び出しと報告 JSON 解釈への置換へ短縮する。REQ-018-002/005/008・REQ-061-037 が要求する明文化の保存先を維持する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md ほか対象 references"
      - "src/common/skills/agentdev-workflow-case-ready/references/"
      - "src/common/skills/agentdev-workflow-case-close/references/"
      - "src/common/skills/agentdev-workflow-case-auto/references/"
    intent: |-
      参照文面の読込量と逐次実行の指示を削減し、script 呼び出し契約へ整合させる。
    verification_refs: [TS-008]
    source_items: [AG-004]
  - id: RA-006
    concern: 委譲プロンプト雛形への必須契約要約の埋め込み
    responsibility: |-
      src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md の委譲プロンプト雛形へ、必須契約要約（result 4状態、3点ゲート、worktree 隔離、PR 本文・SSoT チャネルの必須セクション、禁止事項の要点）を埋め込む。参照先を明示した要約とし、正規契約の参照を代替しない。
    ownership_hints:
      - "src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md"
      - "src/common/skills/agentdev-case-run-execution-adapter/SKILL.md（責務範囲の維持確認）"
    intent: |-
      委譲先のセッション毎の参照資料再読込を削減する。
    verification_refs: [TS-008]
    source_items: [AG-007]
  - id: RA-007
    concern: bash 内蔵コマンドの内蔵ツール使用規律の明記
    responsibility: |-
      各 workflow skill の本文・references から bash 内蔵コマンド（grep、ls 等）による検索・列挙を標準手順とする指示を除外し、実行基盤の内蔵ツール使用を明記する。bash 実行が本来必要な処理（script 呼び出し、git 操作等）は対象外とする。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-{open,ready,close,auto}/SKILL.md・references/"
      - "src/common/skills/agentdev-case-run-execution-adapter/SKILL.md・references/"
    intent: |-
      内蔵ツールと bash の使い分けを各 workflow skill に明記し、無用な bash 呼び出しを減らす。
    verification_refs: [TS-008]
    source_items: [AG-009]
  - id: RA-008
    concern: HITL question のスキップ可能キューの実装
    responsibility: |-
      対象 workflow skill の質問経路に、回答を要しない警告・確認系 question をスキップ可能キューへ投入し stage 境界または完了報告で一括提示する機構を実装する。人間留保判断（REQ-096-005）・安全境界の操作承認を要する停止はブロッキング維持する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-auto/（orchestration 側のキュー受領・一括提示）"
      - "src/common/skills/agentdev-workflow-case-{open,ready,close}/（下位 workflow 側のキュー投入）"
    intent: |-
      工程の進行を警告・確認系 question のユーザー待ちでブロックしない。
    verification_refs: [TS-009]
    source_items: [AG-008]

case_open_hints:
  epic_needed: false
  decomposition: "単一 Issue で実装。内部作業順序の参考: (1) DEC・REQ・Design の契約変更（DEC-041 決定5 置換の新規 Decision、REQ-034-012/040・REQ-035-017 更新、case-auto Design 2 節更新・HITL キュー節追記、各工程 Design・adapter Design・workflow-skill-model Design 追記）、(2) 各工程 script の実装（case-open → case-ready → case-close。工程別個別 script・共通基盤なし）、(3) orchestration スロット型キューと HITL キューの実装、(4) 参照文面短縮・委譲雛形要約・bash 規律の明記、(5) 前後比較の効果測定と回帰テスト。単一 Issue 推奨の理由: 受け入れ条件の効果測定が 3 工程横断で一体、参照文面短縮と script 追加が同じファイル群を対象、RU-0161 先例。RU-0162 の generation_actor: supervisor と session 由来 RU 契約固定値 req-define-parent の差異は case-open 開始前に解決する。"
  wave_hints: []
```

# summary

RU-0162（収束済み検討由来、72 時間実測に基づく処理時間分析の合意）を要件化した。構成は 3 系統である。(1) 機械工程 script 化系: case-open/case-ready/case-close の Design へ script 呼び出し契約（入力 JSON・報告 JSON・終了コード、GitHub I/O の agentdev_gh 境界維持、品質ゲートの script 内実行、工程別個別 script・共通基盤なし）を追記し、実現面は RA-001〜003・RA-005。REQ 操作なし（CR-001 記録のとおり REQ-002-040 既存原則の適用、Jev 観測 20261005T165045Z-38b5 とは semantic_disagreement を記録済み）。(2) orchestration 系: REQ-034-012/040・REQ-035-017 の意味変更（Wave 収束前提の撤廃、依存充足ゲート単独条件のスロット型キュー）、case-auto Design「並列実行の判定」「runtime 制御契約」の 2 節更新、DEC-041 決定5 を部分置換する新規 Decision（new:case-auto-stage3-slot-queue）を作成する。(3) 契約整理系: HITL question のスキップ可能キュー（case-auto Design 承認・HITL 境界へ追記、留保判断・安全境界のブロッキング停止は維持）、委譲プロンプト雛形への必須契約要約埋め込み（adapter Design）、bash 内蔵コマンドの内蔵ツール使用規律（workflow-skill-model Design）。

adversarial-review（STEP-8、semantic_review）の採択 finding を反映済み: case-ready script の対象から保存実体（Capability Skill 委譲）を除外（AG-003・ACT-DESIGN-005・RA-002）、RA-004・TS-006 へ Epic 実行構成表の状態整合を組込み、TS-001 の測定条件を精緻化した。unresolved なユーザー判断事項は残っていない。

機械組立・検査（assemble-draft-section.ts、commit 9ca73db4 時点の実ファイルに対する検査、書き込みなし）: 全 12 操作が ok（対象見出し一意・旧文実在件数一致・組立後検査合格）。主な証拠（target sha256 先頭 12 桁 / edit sha256 先頭 12 桁）: REQ-034.md ab59f376e576（41d7d7b4a074, da78621190dd）、REQ-035.md 3fff66ea9704（REQ-035-017 置換）、case-auto.md 89790ac4349a（74074a5b9a32, 87fd210260ad, 8b95e2c79a00, HITL キュー節追記 38417fd7631a）、case-open.md 4bba5367fb47（4a9f409ac6ea）、case-ready.md e74260b01c60（修正版追記 22de22942db1）、case-close.md be216a458165（510fef4d4afc）、adapter Design df79632efd2f（d9a1dc72deb7）、workflow-skill-model.md ed8cd30f7201（4f2559772deb）。design 対応事前確認: 意味変更行（REQ-034-012/040・REQ-035-017）は case-auto.md の ADF-COVERS(design) 宣言に登録済みであり、本 Definition の Design 更新が対応内容を最新化する（coverage --req の空結果は fail-open として扱い、影響なしの根拠には使用していない）。

Jev 先行評価の観測 2 件（既存REQ照合: 20261005T165045Z-38b5、最終分類・Design 分離: 20261005T165045Z-a5ca）を .agentdev/jev-observations/ へ永続化し、最終判断を反映済み。RU-0163（Caseラベルの解消）は agentdev_handoff: true のため本 req-define では処理せず req-units/ に維持する。
