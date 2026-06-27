---
draft_type: req_draft
topic_slug: case-auto-inline-fallback
status: saved
created_at: 2026-06-28T02:10:00+09:00
source_rus: []
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: >-
  case-auto G07（各工程の task() 委譲必須、インライン実行禁止）を緩和し、
  task() 委譲を基本としつつ委譲失敗時にインライン実行へフォールバックするレジリエンス機構を追加する。
  フォールバックトリガーは task() 起動失敗と blocked/failed 結果（委譲 chain 破綾）の両方。
  case-run インライン時は case-auto から直接 Sisyphus-Junior へ委譲（委譲起点の折りたたみ）。
  ADR-0127 を UPDATE しフォールバックを例外として追記、元判断（task() 委譲によるスケーラビリティ）は維持。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      case-auto G07 を「task() 委譲必須、インライン実行禁止」から「task() 委譲を基本とし、委譲失敗時にインライン実行へフォールバック」へ変更する。フォールバックは例外的措置であり、通常時は ADR-0127 の task() 委譲モデルを維持する。

      変更対象のガードレール:
      - 現行 G07: 「case-auto は各工程（req-save/ spec-save/ case-open/ case-run/ case-close）を task で起動し、インライン実行してはならない。case-run も task 起動を使用する。各工程の task は対応するコマンド定義を authoritative source として実行する（手順の case-auto 定義内再実装は回避）」
      - 変更後 G07: 「case-auto は各工程を task で起動する。各工程の task は対応するコマンド定義を authoritative source として実行する。委譲失敗時のフォールバック（ADR-0127 例外）として、task() 起動失敗または blocked/failed 結果のうち委譲 chain 破綾を検知した場合、当該工程をインライン実行へフォールバックする。genuine blocker はフォールバック対象外とし Step 7 停止条件として扱う」

      変更対象ファイル:
      - src/opencode/commands/agentdev/case-auto.md（G07 本文、Step 4 にフォールバック判定手順を追記）
      - docs/specs/commands/case-auto.md（対象外セクション、現在の動作セクション）
      - docs/specs/workflows/delegation-contracts.md（step_execution 委譲種別）

  - id: AG-002
    content: |-
      フォールバックのトリガー条件は以下の両方を含む:

      (1) task() 起動自体の失敗（ツール不在、ハードリジェクト、call_omo_agent が agent type を拒否等）
      (2) task() 起動成功だが結果が blocked/failed（委譲 chain 破綾を含む）

      (2) の場合、blocked/failed の理由を確認し以下を区別する:
      - 委譲 chain の破綾（Sisyphus-Junior 起動失敗、task() ツール不在、ネスト委譲制限等）→ フォールバック対象
      - genuine blocker（実装上の問題、スコープ外操作、コンフリクト解消不能等）→ Step 7 停止条件として扱う（フォールバック対象外）

      判定材料: case-run result 本文、Issue コメント（SSoT）、エラーメッセージのパターンマッチ（"Invalid agent type", "Only explore, librarian are allowed", "task() not available" 等）。

  - id: AG-003
    content: |-
      case-run 工程のインライン実行時、case-auto は以下を実行する:

      1. case-run Step 1-5（フェーズ判定、Issue 本文抽出、関連 ADR 特定、work_type 判定、worktree 作成、precondition gate）を case-auto が自ら実行する。worktree は既に作成済みの場合はスキップ（べき等性維持）。
      2. case-run Step 6（実装委譲）では、case-auto から直接 Sisyphus-Junior へ task() 委譲する（委譲起点の折りたたみ）。adapter protocol（agentdev-case-run-execution-adapter）の委譲契約、委譲プロンプト形式（/ulw-loop）、result 契約（completed(pr)/blocked/failed）は維持する。case-auto 自らは実装コードを書かない。
      3. case-run Step 7-8（result 処理、worktree クリーンアップ確認、完了報告）を case-auto が実行する。L2 タイムスタンプ計測も case-auto が記録する。

      Epic Wave 実行モード（case-run #epic）のインライン時も同様に、case-auto が Wave 内子Issue を最大5件並列で直接 Sisyphus-Junior へ委譲する。

  - id: AG-004
    content: |-
      非 case-run 工程（req-save/spec-save/case-open/case-close）のインライン実行時、case-auto は当該コマンド定義（.opencode/commands/agentdev/{step}.md または src/opencode/commands/agentdev/{step}.md）を読み込み、手順を自ら実行する。各工程のガードレール（G01-G32）、品質ゲート（QG-1〜QG-4）は各コマンド定義に従い case-auto が適用する。

      req-save/spec-save 統合 task（AG-005）のインライン時も同様に、case-auto が両コマンド定義を順次読み込み実行する。commit/push は1回に統合する（通常時と同じ）。

  - id: AG-005
    content: |-
      コンテキスト枯渇リスクへの対処:

      フォールバックは委譲失敗時の例外的措置であり、通常時は task() 委譲を維持することで ADR-0127 のコンテキスト分離効果を享受する。フォールバック時は以下のコンテキスト管理を実施する:

      1. フォールバック発動時に compress ツールで直前の工程のコンテキストを圧縮する。
      2. 各工程のインライン実行完了後、次工程へ進む前に compress で当該工程の調査過程・中間ログを圧縮し、完了結果（Issue/PR 番号、pass/warn/fail）のみを保持する（REQ-0114-085 の精神を維持）。
      3. REQ-0114-073（親コンテキスト非累積）はフォールバック時の例外として扱い、フォールバック発動と compress 使用を完了報告（Step 8）に記録する。

      この運用により、ADR-0127 が排除した「コンテキスト枯渇」リスクを、フォールバックという例外的シナリオに限定して管理する。

  - id: AG-006
    content: |-
      ADR-0127 を UPDATE し、Decision セクションにフォールバック例外を追記する。

      追記内容:
      - Decision セクションに「委譲失敗時フォールバック例外」を追加。元判断（task() 委譲によるスケーラビリティ確立）は維持し、フォールバックを「委譲 chain 破綾時の例外的レジリエンス機構」として位置づける。
      - 代替案1「インライン実行の維持（現状）」を更新。「通常時のインライン実行は不採用（コンテキスト枯渇リスク、維持）」とした上で、「フォールバック時のインライン実行は例外的に許可（compress でコンテキスト管理）」を追記する。
      - 結果・影響セクションにフォールバック例外の影響を追記。

      ADR 判断根拠（Step 6-3）: ユーザー合意（壁打ち A3-(A)）。新規 ADR ではなく既存 ADR-0127 の UPDATE 选择的根拠: フォールバックは ADR-0127 の決定（task() 委譲）を覆すものではなく例外を追加するものであり、独立したアーキテクチャ判断としての閾値に達しない。ADR-0127 の「背景」「代替案」が直接修正対象であるため、同 ADR の UPDATE が最適。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0114
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |-
      REQ-0114-006 を以下へ更新:
      「各工程（req-save / spec-save / case-open / case-run / case-close）をサブエージェント委譲で起動し、各コマンドの Steps / ガードレール / エラー処理に従って実行させること（ADR-0127）。原則として case-auto 定義内でインライン実行してはならないが、委譲失敗時（task() 起動失敗、または blocked/failed 結果のうち委譲 chain 破綾）は例外としてインライン実行へフォールバックする（ADR-0127 フォールバック例外）。フォールバック時のコンテキスト管理は compress で対応する」

      REQ-0114-084 を以下へ更新:
      「case-auto は全工程を各コマンドの委譲契約に従ってサブエージェント起動すること（原則）。委譲失敗時はインライン実行へフォールバックする（ADR-0127 例外）。case-run は Epic Issue 指定時、現在 Wave の ready 子Issue をサブエージェントへ並列委譲する（ADR-0128）。Epic/Wave orchestration は case-run / case-close が担い、case-auto は Wave 反復制御に専念すること。インラインフォールバック時もこの責務分界は維持する」

      新規要件行を追加:
      - REQ-0114-0XX: case-auto は委譲失敗時（task() 起動失敗、blocked/failed 結果のうち委譲 chain 破綾）にインライン実行へフォールバックすること。genuine blocker はフォールバック対象外とし停止条件として扱うこと（ADR-0127 例外）
      - REQ-0114-0XX: case-run インライン実行時、case-auto は case-run のオーケストレーション手順（Step 1-5, 7-8）を自ら実行し、Step 6 では case-auto から直接 Sisyphus-Junior へ task() 委譲すること（委譲起点の折りたたみ）。case-auto 自らは実装を行わないこと
      - REQ-0114-0XX: フォールバック時のコンテキスト管理は compress で対応し、REQ-0114-073（親コンテキスト非累積）はフォールバック時の例外として扱うこと。フォールバック発動を完了報告に記録すること

  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: ADR-0127
    source_items: [AG-001, AG-006]
    content: |-
      ADR-0127 Decision セクションに「5. 委譲失敗時フォールバック例外」を追記:

      ---
      ### 5. 委譲失敗時フォールバック例外（ADR-0127 UPDATE）

      case-auto の各工程 task() 起動が失敗（ツール不在、ハードリジェクト）、または結果が blocked/failed でかつその理由が委譲 chain の破綾（Sisyphus-Junior 起動失敗、ネスト委譲制限等）の場合、当該工程をインライン実行へフォールバックする。

      - case-run インライン時: case-auto が case-run の Step 1-5, 7-8 を実行し、Step 6 は case-auto から直接 Sisyphus-Junior へ委譲する（委譲起点の折りたたみ）。
      - 非 case-run 工程インライン時: case-auto がコマンド定義を読み込み手順を自ら実行する。
      - コンテキスト管理: フォールバック時は compress で工程間コンテキストを圧縮する。
      - genuine blocker（実装上の問題、スコープ外操作等）はフォールバック対象外とし停止条件として扱う。

      元判断（§1-4）は維持する。フォールバックは例外的レジリエンス機構であり、通常時の task() 委譲モデルを変更しない。
      ---

      代替案1 を以下へ更新:
      「インライン実行の維持（通常時）: コンテキスト枯渇が構造的に解消されないため不採用（維持）。ただし委譲失敗時のフォールバックとしてのインライン実行は例外的に許可する（compress でコンテキスト管理）。REQ-0114-073 もフォールバック時は例外扱いとする。」

      結果・影響セクションに追記:
      「- フォールバック例外の追加により、委譲 chain 破綾時（ハーネス制限、ツール不在等）でも case-auto が処理を継続できる。コンテキスト枯渇リスクは compress で管理し、通常時の task() 委譲モデルは維持される。」

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/case-auto.md
    target_area: "## 対象外"
    source_items: [AG-001, AG-005]
    content: |-
      ## 対象外

      - DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報変更、repo 外実データ操作、通知送信（G02）
      - migrationファイル、IaCファイルの作成、修正以外の migration実行、IaC apply（G03）
      - remote branch 削除で当該 case-auto / case-run が作成した branch 以外の対象（G05）
      - 各工程のインライン実行は通常時対象外（G07、task() 起動必須、ADR-0127, REQ-0114-006/073/084）。委譲失敗時（task() 起動失敗、blocked/failed 結果のうち委譲 chain 破綾）のフォールバックとしてのインライン実行は例外として許可（ADR-0127 フォールバック例外、compress でコンテキスト管理）
      - 既存 req-save / spec-save / case-open / case-run / case-close の責務変更（G09、task() 委譲は起動方式変更のみ）
      - source path の実行時パス読み替え（G11）
      - Issue 階層決定ロジックの独自保持（G13、case-open に委譲）
      - req-save task() から case-open task() への状態引き継ぎ時のフィルタリング、再評価（G14、保存結果をそのまま渡す）
      - 子Issue 選択ロジック、子Issue 単位の task() 並列起動（G15、case-run(#epic) / case-close(#epic) に委譲）
      - Epic Issue 本文の書き込み（G16、case-close の単一書き手責務、ADR-0125、case-auto は読み取るのみ）
      - 操作単位本文の抽出、変換、REQ 操作解釈（G18、REQ-0114-051）
      - case-open 完了後の draft SSoT 扱い（G19、case-open 完了後は子Issue が SSoT）
      - OU 間依存のみでの Epic Issue 化（G20、REQ-0114-055）
      - Epic Issue 化判定への関与（G21、REQ-0114-057）
      - case-auto 固有の capture 振る舞い（G17, G13、構成コマンドの capture 責務境界に従う）

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/case-auto.md
    target_area: "## 現在の動作"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |-
      ## 現在の動作

      - Step 1: 入力解決
        - 実行開始時刻の記録（REQ-0114-082）（JST（Etc/GMT-9）、人間が読みやすい形式（例: `2026-06-21 15:30:00 JST`）で `case_auto_started_at` 変数に保持）
        - Issue番号/URL入力モード（`^\d+$` または GitHub Issue URL の場合、case-run移行モードへ分岐）
        - 要件doc入力モード（明示パス→draft検出（複数件含む全件処理）→セッション内要件docの順で入力特定）
      - Step 2: work_type 読取（`draft-data` から work_type 取得（参考情報、パイプライン分岐には使用しない、REQ-0138-010））
      - Step 3: 工程分岐（`work_type` 固定分岐ではなく `artifact_actions` 存在による動的判定、REQ-0138-009）
        - Issue番号/URL入力: case-run → case-close（req-save、spec-save、case-open、work_type読取スキップ）
        - artifact_actions ベース分岐: `artifact: req` or `artifact: adr` → req-save / `artifact: spec` → spec-save（req-save の後）/ 常に → case-open / その後 → case-run → case-close
        - spec-save 実行判定（ADR-0123 Decision #3, REQ-0136-014）（req-save 完了後に `artifact: spec` entry 確認）
        - auto_gate preflight（`auto_gate.auto_ready` が false または未解決 item 残る場合は停止）
      - Step 4: 各工程の実行（task() 委譲が基本、委譲失敗時にインラインフォールバック（ADR-0127 例外））
        - 通常時: 各工程を task() で起動（ADR-0127, REQ-0114-006/084/085）。req-save / spec-save 統合 task（AG-005）で順次実行、case-open / case-run / case-close は各コマンド委譲契約に従い task() で起動
        - フォールバック時（委譲失敗検知時）: 当該工程をインライン実行へ切替。詳細は「フォールバックモデル」セクション参照
      - Step 4-0: フォールバック判定（各工程の task() 起動後または起動失敗時）
        - task() 起動失敗（ツール不在、ハードリジェクト）→ インラインフォールバックへ
        - task() 結果が blocked/failed → 理由を確認: 委譲 chain 破綾ならインラインフォールバックへ、genuine blocker なら Step 7 停止条件として扱う
        - フォールバック判定時、compress で直前工程のコンテキストを圧縮してからインライン実行へ移行
      - Step 5: 工程間の状態引き継ぎ（Issue番号、PR番号、RU ファイルパス、capture 対象情報を最終工程まで保持）
      - Step 6: 複数REQ対応（req-save task() の出力から複数 REQ doc または scale:large 検出時、case-open の Issue 構造ルールを使用）。case-auto 自体に Issue 階層決定ロジックを持たない
      - Step 7: 停止条件の検出（停止時タイミング情報の追記（開始時刻、停止時刻、経過時間、REQ-0114-083））。10項目の停止条件いずれかを検出時、実行停止、停止理由、現在地点、再開可能な次コマンドを報告
      - Step 8: 完了報告（最終工程の完了報告をそのまま出力）。タイミング情報追記（開始時刻、終了時刻、所要時間、REQ-0114-083）。フォールバック発動の有無と compress 使用状況を記録
      - Step 8-1: Standard flow 逐次OU処理ループ（case-close task() 完了後、未処理 OU が残存する場合は次 OU の処理を自動開始（REQ-0114-065〜067））

      ### フォールバックモデル（ADR-0127 例外）

      各工程の task() 委譲が失敗した場合、case-auto は当該工程をインライン実行へフォールバックする。

      フォールバックトリガー:
      1. task() 起動失敗（ツール不在、ハードリジェクト、agent type 拒否）
      2. task() 結果が blocked/failed で、理由が委譲 chain 破綾（Sisyphus-Junior 起動失敗、ネスト委譲制限等）

      ※ genuine blocker（実装上の問題、スコープ外操作、コンフリクト解消不能等）はフォールバック対象外。Step 7 停止条件として扱う。

      工程別のインライン実行方式:
      - req-save / spec-save / case-open / case-close: case-auto がコマンド定義を読み込み手順を自ら実行。各コマンドのガードレール、品質ゲート（QG-1〜QG-4）を適用。
      - case-run（単一 Issue / Epic Wave）: case-auto が case-run Step 1-5, 7-8 を実行。Step 6 は case-auto から直接 Sisyphus-Junior へ task() 委譲（委譲起点の折りたたみ）。adapter protocol の委譲契約、result 契約は維持。

      コンテキスト管理:
      - フォールバック発動時に compress で直前工程のコンテキストを圧縮
      - 各工程インライン実行完了後、次工程へ進む前に compress で調査過程・中間ログを圧縮、完了結果のみ保持
      - REQ-0114-073（親コンテキスト非累積）はフォールバック時の例外
      - フォールバック発動と compress 使用を完了報告（Step 8）に記録

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/specs/workflows/delegation-contracts.md
    target_area: "## 委譲種別（delegation_type 参考分類）"
    source_items: [AG-001, AG-003, AG-004]
    content: |-
      ## 委譲種別（delegation_type 参考分類）

      delegation_type は参考分類であり、Command 本文での使用は任意である。
      分類ラベルより、実際の入力範囲、副作用境界、返却内容を優先する。

      | delegation_type | 用途 | 書き込み | 書き込み許可条件 |
      |---|---|---:|---|
      | `gate_check` | 完了判定、ガードレール充足確認、保存前/close前検査 | 禁止 | - |
      | `semantic_review` | 文書、差分、REQ/ADR/SPECの意味レビュー | 禁止 | - |
      | `log_analysis` | テストログ、CIログ、review結果解析 | 禁止 | - |
      | `classification` | 成果物 / 検出事項 / intake / learning の分類 | 禁止 | - |
      | `extraction` | 候補、論点、未回収事項の抽出 | 禁止 | - |
      | `draft_generation` | Issue本文、PR本文、レポート案などの草案生成 | 禁止 | - |
      | `controlled_case_execution` | case-run Epic / 複数Issue実行 | 条件付き | case-run のみ |
      | `step_execution` | case-auto からの構成工程（req-save / spec-save / case-open / case-close）の task() 起動（ADR-0127） | 許可 | case-auto からの工程委譲のみ。各工程のコマンド定義ガードレールに従う。委譲失敗時のフォールバック（インライン実行）も本委譲種別の例外として許可（ADR-0127 フォールバック例外、compress でコンテキスト管理） |

      ※ フォールバック時の step_execution は case-auto 自身が各工程のコマンド定義を読み込み実行する形態（task() 起動ではない）を含む。case-run フォールバック時は case-auto から直接 Sisyphus-Junior への controlled_case_execution 委譲（委譲起点の折りたたみ）を含む。

conflict_resolutions:
  - id: CR-001
    conflict: >-
      REQ-0114 は既存88件の要件行を持ち、docs/specs/quality/req-health-metrics.md の SPLIT 閾値（51行超）を既に超過している。本要件の APPEND により更に肥大化する。
    resolution: >-
      APPEND を採用。本要件（G07 フォールバック緩和）は case-auto の委譲モデルに関するものであり、REQ-0114（case-auto 最大自走モード）のドメインに直接属する。REQ-0114 の SPLIT は別件の構造課題（REQ-0114 が case-auto の全側面をカバーしていることが肥大化の主因）であり、本要件の対象外とする。SPLIT 検出時は requirements review 別起票で対応する。
  - id: CR-002
    conflict: >-
      ADR-0127 は「コンテキスト枯渇」を理由にインライン実行を明確に排斥した（背景1、代替案1）。フォールバック許可はこの判断と表面的に矛盾する。
    resolution: >-
      ADR-0127 の元判断（通常時の task() 委譲によるスケーラビリティ確立）は維持する。フォールバックは「委譲 chain 破綾時の例外的レジリエンス機構」であり、通常時のインライン実行ではない。コンテキスト枯渇リスクは compress で管理し、REQ-0114-073 はフォールバック時の例外として扱う。この位置づけを ADR-0127 の UPDATE（代替案1 への追記）で明確化する。ユーザー合意済み（壁打ち A3-(A)）。
  - id: CR-003
    conflict: >-
      フォールバック時の blocked/failed の理由判定（委譲 chain 砺綾 vs genuine blocker）が主観的になるリスク。
    resolution: >-
      判定材料を客観化する: (1) エラーメッセージのパターンマッチ（"Invalid agent type", "Only explore, librarian are allowed", "task() not available" 等）, (2) case-run result 本文の構造化フィールド, (3) Issue コメント（SSoT）。パターンに合致しない blocked/failed は genuine blocker として扱い、フォールバックしない（安全側に倒す）。

operation_units:
  - ou_id: OU-001
    source_ru: null
    target_req: REQ-0114
    target_spec: docs/specs/commands/case-auto.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      src/opencode/commands/agentdev/case-auto.md の G07 を確認する。G07 が「task() 委譲を基本」+「委譲失敗時にインラインフォールバック」の両方を記述しているか検証する。また Step 4 にフォールバック判定手順が追記されているか確認する。
    pass_criteria: |-
      G07 が「通常時は task() 委譲」「委譲失敗時（task() 起動失敗 または blocked/failed のうち委譲 chain 破綾）はインラインフォールバック」「genuine blocker はフォールバック対象外」の3点を明記していること。Step 4 にフォールバック判定手順（Step 4-0）が追記されていること。
    on_failure: |-
      fix-and-reverify。G07 本文または Step 4-0 の記載漏れがある場合、case-auto.md を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |-
      case-auto.md のフォールバックトリガー条件を確認する。(1) task() 起動失敗 (2) blocked/failed 結果のうち委譲 chain 破綾 — の両方がトリガーとして明記されているか検証する。また genuine blocker との区別方法（エラーメッセージパターンマッチ等）が記載されているか確認する。
    pass_criteria: |-
      (1) と (2) の両方がフォールバックトリガーとして明記されていること。genuine blocker 判定方法が客観的基準（パターンマッチ、SSoT 参照）で記載されていること。
    on_failure: |-
      fix-and-reverify。トリガー条件の記載漏れまたは genuine blocker 判定の主観性が残る場合、修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |-
      case-auto.md の case-run インライン実行手順を確認する。case-auto が Step 1-5, 7-8 を自ら実行し、Step 6 で case-auto から直接 Sisyphus-Junior へ task() 委譲する（委譲起点の折りたたみ）ことが明記されているか検証する。case-auto 自らは実装を行わないことが明記されているか確認する。
    pass_criteria: |-
      case-run インライン時の Step 1-5, 7-8 が case-auto 実行、Step 6 が case-auto → Sisyphus-Junior 直接委譲として明記されていること。「case-auto 自らは実装を行わない」が明記されていること。
    on_failure: |-
      fix-and-reverify。case-run イライン手順の記載漏れがある場合、修正して再検証する。
  - id: TS-004
    target_item: AG-006
    verification: |-
      docs/adr/ADR-0127.md を確認する。Decision セクションにフォールバック例外（「5. 委譲失敗時フォールバック例外」または同等セクション）が追記されているか検証する。元判断（§1-4）が維持されているか確認する。代替案1 が更新されているか確認する。
    pass_criteria: |-
      Decision セクションにフォールバック例外が追記され、元判断が維持されていること。代替案1 に「通常時不採用（維持）」「フォールバック時例外的許可」が両方記載されていること。
    on_failure: |-
      fix-and-reverify。ADR-0127 の追記漏れまたは元判断の変更がある場合、修正して再検証する。
  - id: TS-005
    target_item: AG-001
    verification: |-
      docs/requirements/REQ-0114.md の REQ-0114-006 を確認する。「case-auto 定義内でインライン実行してはならない」にフォールバック例外が追加されているか検証する。新規要件行（フォールバックトリガー、case-run 直接委譲、compress コンテキスト管理）が追加されているか確認する。
    pass_criteria: |-
      REQ-0114-006 に「委譲失敗時のフォールバック例外」が追加されていること。新規要件行が3件（トリガー条件、case-run 直接委譲、compress 管理）追加されていること。
    on_failure: |-
      fix-and-reverify。REQ-0114 の更新漏れがある場合、修正して再検証する。
  - id: TS-006
    target_item: AG-005
    verification: |-
      case-auto.md と ADR-0127.md のフォールバック時コンテキスト管理方針を確認する。compress 使用方針、REQ-0114-073 例外扱い、完了報告へのフォールバック記録が記載されているか検証する。
    pass_criteria: |-
      フォールバック時の compress 使用が明記されていること。REQ-0114-073 例外扱いが明記されていること。完了報告（Step 8）へのフォールバック発動記録が明記されていること。
    on_failure: |-
      fix-and-reverify。コンテキスト管理方針の記載漏れがある場合、修正して再検証する。
  - id: TS-007
    target_item: AG-004
    verification: |-
      docs/specs/commands/case-auto.md の対象外セクションを確認する。「各工程のインライン実行」の記載が「通常時対象外、フォールバック時例外許可」に更新されているか検証する。docs/specs/workflows/delegation-contracts.md の step_execution 行にフォールバック例外が追記されているか確認する。
    pass_criteria: |-
      case-auto SPEC 対象外セクションが更新されていること。delegation-contracts SPEC の step_execution 行にフォールバック例外が追記されていること。
    on_failure: |-
      fix-and-reverify。SPEC 更新漏れがある場合、修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []

spec_artifact_actions_consumed:
  consumed_at: 2026-06-28T02:10:00+09:00
  consumed_by: spec-save
  processed_items:
    - id: ACT-SPEC-001
      target: docs/specs/commands/case-auto.md
      target_area: "## 対象外"
      operation: spec-update
      result: applied
    - id: ACT-SPEC-002
      target: docs/specs/commands/case-auto.md
      target_area: "## 現在の動作"
      operation: spec-update
      result: applied
    - id: ACT-SPEC-003
      target: docs/specs/workflows/delegation-contracts.md
      target_area: "## 委譲種別（delegation_type 参考分類）"
      operation: spec-update
      result: applied
```

# summary

<!-- 人間可読サマリー。処理の原本は上記 # draft-data YAML ブロックである。 -->

case-auto G07（各工程の task() 委譲必須、インライン実行禁止）を緩和し、委譲失敗時のインラインフォールバック機構を追加する。

直前の case-auto 実行（Epic #1308、docs/specs 正規化）で、case-auto → task(case-run) → task(Sisyphus-Junior) のネスト委譲 chain がハーネス制限により破綻した事象（G07 適応）を恒久解消する。

設計判断:
- フォールバックは両トリガー（task() 起動失敗 + blocked/failed 結果のうち委譲 chain 破綾）を対象
- case-run インライン時は委譲起点を折りたたみ（case-auto → Sisyphus-Junior 直接委譲）、case-auto 自らは実装しない
- ADR-0127 は UPDATE（元判断維持、フォールバック例外追記）
- コンテキスト枯渇は compress で管理（REQ-0114-073 フォールバック時例外）

変更対象: REQ-0114（006 更新 + 新規3行追加）、ADR-0127（Decision §5 追記 + 代替案1 更新）、case-auto SPEC（対象外・現在の動作更新）、delegation-contracts SPEC（step_execution 行更新）、case-auto.md command definition（G07 + Step 4-0 追記）。

SPLIT シグナル: REQ-0114 は既に88行（閾値51行超）。本要件 APPEND で更に肥大化するが、case-auto ドメインに直接属するため APPEND 採用。REQ-0114 の SPLIT は別件（CR-001）。
