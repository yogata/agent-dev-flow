---
draft_type: req_draft
topic_slug: post-2686-contract-alignment-batch
status: saved
created_at: 2026-09-08T22:59:24+09:00
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
  - RU-0005
  - RU-0006
  - RU-0007
  - RU-0008
  - RU-0009
  - RU-0010
  - RU-0011
  - RU-0012
  - RU-0013
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する
work_type: feature

# scale: feature のみ standard / large。それ以外は未設定でよい
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: >-
  Epic #2686（agentdev_gh 16操作カタログ刷新）完了後の13 RU 一括是正バッチとして、
  (1) REQ-057 へ IR-055 baseline 鮮度維持と配布物 Markdown 変更時のマージ前置確認義務を1行追加し、
  baseline を現行 main 配布物状態へ再生成して integrity suite の既知 delta 赤を解消する。
  (2) Design 6ファイル（custom-tool-contracts、case-run、agentdev-traceability、
  checker-execution-contracts、runtime-package-boundary、agentdev-skill-authoring）について、
  移行期間前提記述の現行化、宣言形式文字列の言い換え、before payload 契約と両版同時反映原則の記載、
  対応宣言の表記・解釈仕様の明示、Bun 依存 checker の bun 経路実行明記、bun.lock root name 確認手順、
  配布境界 ID 執筆規律の反映を行う。(3) 配布物側（opencode-local 説明文書、追跡Issue系 SKILL 5箇所、
  QG-4 実行形態契約、case-close・worktree・orchestration 参照、AGENTS.md、テスト2ファイル）の
  現行化・注記・型修正を realization として引き継ぐ。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-001
    content: >-
      docs/designs/responsibilities/custom-tool-contracts.md「対象操作の境界（初期セット）」節の移行期間前提記述を現行化する。
      issue_comment の温存条項（35行目「移行完了までの間は一時的に温存する」）は、廃止確定を明記した現行状態記述へ置き換える。
      操作カタログ列挙中の移行期注記（「（新規）」等）も現行の確定カタログ表現へ整える。
      外部 consumer 環境が更新前の runner を保持し得る期間の考慮を処置判断に含め、旧 runner 側での挙動は本 Design の操作契約の対象外である旨を明記する。
      同一ファイルを編集する AG-004（移管記録節）・AG-009（操作契約の構成要素節）と同時期に適用する場合は単一変更へ直列化する。
  - id: AG-002
    content: >-
      src/opencode-local/agentdev-gh/README.md（4・26・31行目）と src/opencode-local/agentdev-gh/case-schema/case-file.md（71・75行目）を
      現行契約へ現行化する。README は16操作カタログ（issue_comment 温存表記の除去）、Comment CRUD の `### c{NN}` 形式、
      pr_read 論理 PR 本文3セクション直列化の実装済み契約へ整合させる。case-file.md は PR 系操作列挙へ pr_update を追加し、
      旧操作名の読み替え規則を Comment 操作4種（comment_create、comment_list、comment_update、comment_delete）へ置換する。
      正本 docs/designs/local/local-case-file.md は既に現行のため変更しない。
  - id: AG-003
    content: >-
      docs/designs/commands/case-run.md「verification-only PR（実装差分なし、検証のみ）（v2:REQ-0158-002）」節の raw gh CLI 表記を
      Custom Tool 操作名表記へ統一する。200行目 `gh pr view --json files` は pr_changed_files による変更ファイル一覧確認へ、
      216行目 `gh pr merge --squash` は pr_merge（squash merge）へ置き換える。既存の書き換えパターン（case-close.md「現在の動作」セクション）と同一形式とする。
  - id: AG-004
    content: >-
      docs/designs/responsibilities/custom-tool-contracts.md「移管記録（旧 `agentdev-gh-cli` Skill Design の廃止）」節91行目の散文中の
      宣言形式文字列を、宣言形式と区別される自然文へ言い換える。agentdev-traceability check の malformed-declarations 検出の常態化を解消し、
      検査の信号対雑音比を回復する。
  - id: AG-005
    content: >-
      IR-055 baseline（.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json）を現行 main の配布物 Markdown 状態へ再生成し、
      integrity suite（bun test repo-agentdev-integrity 系）の既知 delta 由来の赤を解消する。あわせて REQ-057 へ次の要件行を追加する。
      「IR-055 既知 delta の baseline は現行の配布物 Markdown 状態への整合を維持すること。配布物の Markdown を変更する変更では、
      マージの前置確認で当該既知 delta の鮮度を確認し、baseline の再生成または該当表現の解消のいずれかを行うこと」。
      本行は corpus 変更側の義務に限定し、baseline 再生成のスコープとタイミング（完了工程品質ゲート既存行）および
      docs-check の検出結果報告側（docs-check 検査責務既存行）が既に所有する範囲を再定義しない。
      repo-local の IR-055 運用記録（vocabulary-registry.md 当該節）へ前置確認運用を1行注記する。main の integrity suite 赤が継続しているため本項を最優先で処理する。
  - id: AG-006
    content: >-
      docs/designs/skills/agentdev-traceability.md「対応宣言の表記（正規情報源）」節へ対応宣言の表記・解釈仕様を明示する。
      (a) 宣言の REQ-ID は子要件行 ID 形式で指定し、親要件 ID のみの参照（子行番号を伴わない bare ID）は実装宣言・検証宣言の配置対象とならないこと、
      check が bare ID 参照を missing-implementation の報告対象として計上し得るため参照側は子行 ID の個別指定運用をとること。
      (b) 実装対応宣言の配置先は成果物責任表（artifact-responsibilities.md）の正規配置先カタログに従う旨の参照導線。
      (c) 宣言未付与の既存行は missing-implementation として計上され、段階的付与は当該カタログの運用に従うこと（付与方針の再定義を行わない）。
      配布 SKILL.md（src/opencode/skills/agentdev-traceability/SKILL.md）の「対応宣言の表記」ミラーの同期更新を伴う。
  - id: AG-007
    content: >-
      agentdev-traceability の check 実行前提を手順文書へ注記する。(1) `--req` は個別カンマ指定形式のみを受理し、
      範囲構文（`..` 形式）は範囲展開されずリテラル reqId として報告されること。(2) worktree で scripts ディレクトリを cwd に起動した場合は
      `--root` を repo-root 明示で指定すること（既存の相対パス解決警告と重複しない cwd 固有の事故像に限定する）。
      (3) 宣言の走査対象は .md と .ts のみであり、除外ディレクトリ（.agentdev/ 等）への宣言配置は計上されないこと。
      注記先は src/opencode/skills/agentdev-traceability/SKILL.md「実行方法」節、scripts/README.md、
      case-close／case-run のトレーサビリティ独立再検査手順参照とする。`--req` 範囲展開の実装改善は本要件の対象外とする。
  - id: AG-008
    content: >-
      src/opencode/skills/agentdev-issue-tracking/SKILL.md（60・66・91・100行目）と src/opencode/skills/agentdev-workflow-issue/SKILL.md（71行目）の
      issue_list 絞り込み記述を現行契約へ現行化する。「labels・search パラメータは Tool が invalid-input として拒否するため指定せず、
      結果の絞り込みは応答一覧をクライアント側で行う」および「role 単位で列挙。絞り込みは応答一覧をクライアント側で行う」の旧契約記述を、
      Tool 側絞り込み軸（role、kind、state、trackingState、labels、search を含む構造化結果）を提供する現行契約（REQ-011-022、
      custom-tool-contracts.md のサーバ側絞り込みクエリ推送、plugin 公開スキーマ、実装）へ置き換える。
  - id: AG-009
    content: >-
      docs/designs/responsibilities/custom-tool-contracts.md「操作契約の構成要素」節へ runner 応答 before 契約と内部契約拡張の両版同時反映原則を記載する。
      issue_update・issue_reopen の追跡軸保持 VERIFY は副作用後の読み戻しのみでは自己保持できない実行前状態を必要とするため、
      runner の成功応答 payload は実行前状態（before）を正規化済み導出値として含める。含める導出値は state、labels、role、kind、trackingState、closeReason とし、
      正規化規則は契約型（contracts.ts）と追跡スキーマ（tracking-schema.ts）の実装と突合して確定する。
      runner と engine の間の内部契約を拡張する場合は GitHub 版と Local 版へ同時に反映し、Local 版の実装が未完了の間は最低限の型整合を維持し、
      当該操作の VERIFY が fail-closed で verification-incomplete として返ることを許容する。
  - id: AG-010
    content: >-
      Windows 検証実行・証跡取得の残存 gap を契約へ集約する。(a) bun test の証跡は stdout と stderr を分離して併退避することを
      QG-4 実行形態契約（qg-4-final-acceptance.md「3 cwd 分割実行」節）へ明記する。(b) Bun ランタイム API に依存する checker は
      bun 経路で実行することを docs/designs/integrity/checker-execution-contracts.md「安定実行経路」節へ明記する。
      (c) AGENTS.md の PowerShell 警告へリダイレクト・パイプ（`>` / `*>`）による UTF-8 再符号化破損の言及を補記する。
      既存対策（worktree 依存前置対象ディレクトリ集合、checker stdout 退避契約、一括読み書き警告）は既に充足済みであり本項の対象外とする。
  - id: AG-011
    content: >-
      ツール・プロセス境界跨ぎ編集の永続化確認手順を正規手順文書へ明文化する。(a) case-close の rebase 手順へ、
      解消編集の rebase --continue 前 git add 確定・squash merge 前 worktree clean 確認・merge 後 main 上での再検証を注記する。
      (b) Epic Wave 境界クローズに廃止キーワードの全文検索を定型手順として注記する。
      (c) package rename 時の bun.lock root workspace name 追従確認を docs/designs/local/runtime-package-boundary.md「本体リポジトリ sync」節へ注記する
      （bun install 実行面を持つ worktree 運用参照との相互参照を付ける）。
  - id: AG-012
    content: >-
      docs/designs/skills/agentdev-skill-authoring.md「配布物執筆時の ID 衛生（REQ-057-019）」節へ配布境界 ID 執筆規律を反映する。
      記載例・サンプルのプレースホルダ形式（digits を持たないトークン）徹底、具体 ID が不可欠な場合の配布依存境界 gate（--profile source）前置実行、
      操作廃止系 test strategy の全文検索対象に repo-local 実体を含めるかの明示判断規定、release archive 同梱ファイルの具体 ID 制約運用。
      検出器の ID 分類規則は変更しない前提の執筆規律であり、配布物のプロジェクト非依存要件を緩和しない。
  - id: AG-013
    content: >-
      src/opencode/tools/agentdev-gh/tests/runner-cli.test.ts 1034行目と src/opencode/plugins/agentdev-gh-tool/tests/plugin.test.ts の
      labels 関連3箇所（行番号は実装時に特定）の TypeScript 型エラーを、テスト意図を変えない範囲で修正する（テストコードのみ・契約型変更なし）。
      Issue #2663（agentdev_gh 表示スキーマの契約型整合）は完了済みであり、本修正は #2663 のスコープと重複しないことを確認済みである。

# artifact_actions: REQ/Decision/Design への保存対象
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-057.md
    source_items: [AG-005]
    content: |-
      | REQ-057-024 | IR-055 既知 delta の baseline は現行の配布物 Markdown 状態への整合を維持すること。配布物の Markdown を変更する変更では、マージの前置確認で当該既知 delta の鮮度を確認し、baseline の再生成または該当表現の解消のいずれかを行うこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-001]
    content: |-
      操作カタログを以下の16操作として定義する。

      - 基本操作: issue_create、issue_read、issue_update、issue_close、pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable、pr_update
      - 追跡Issue操作: issue_list、issue_reopen
      - Comment 操作: comment_create、comment_list、comment_update、comment_delete。Comment は Issue と Pull Request の会話コメントを同一の論理リソースとして扱う。comment_list の各要素は commentId、body、createdAt、updatedAt、url を返す。comment_update と comment_delete は commentId を対象識別子として使用する。commentId の公開型は文字列とし、GitHub 実装は数値コメント id を文字列化する
      - 廃止済み操作: issue_comment（body あり＝追加、body なし＝読取の二重モード）は正規操作カタログから除去済みであり、ADF 内部の呼出元は Comment 操作への移行が完了している。GitHub 版・Local 版のいずれの実装にも issue_comment は存在せず、廃止は確定している。外部 consumer 環境が更新前の runner を保持する間に旧 runner 側で issue_comment が動作し得るが、それは本 Design の操作契約の対象外である
      - pr_read の拡張: 成功結果に Pull Request 本文（body）を含む。本文の論理的な範囲はローカル版の物理写像（ローカルIssue共通スキーマ Design）に従い、読み取りと更新が round-trip 可能な同一の論理範囲（ローカル版ではマージ前確認・Design確定候補・Findings / Capture候補の3セクション群の直列化）とする
      - pr_update: title と body を対象とする項目単位の部分更新操作。指定されていない項目は保持し、更新後は読み戻しによって要求値の反映を確認する。ローカル版では Pull Request タイトルの正をマージ前確認セクション内の PR タイトル行とし、pr_update の title は同行を置換する
      - issue_update の部分更新不変条件: 変更を要求していない追跡Issue軸（role、kind、trackingState）を保持する。VERIFY の照合対象は追跡軸の完全一致と要求通常ラベルの包含とし、確認時点での第三者による通常ラベル追加を不変条件違反として失敗扱いにしない
      - issue_reopen の追跡Issue状態遷移: agentdev-issue-tracking Design が所有する再オープン遷移（クローズ済み→検討中）を Tool が状態ラベルの機械適用によって実現する。kind と通常ラベルを保持し、Case Issue には追跡状態遷移を適用しない。既に open の追跡Issueへの再オープンは要求的状態の確認をもって冪等に成功とする

      VERIFY 適用（READ / WRITE 分離）:
      - WRITE 操作（issue_create、issue_update、issue_close、issue_reopen、comment_create、comment_update、comment_delete、pr_create、pr_update、pr_merge）: 副作用そのものを読み戻し、要求した状態の反映と保持対象不変条件の維持を確認する。Comment WRITE は対象 Comment の存在・本文で判定し、Issue / Pull Request の open / closed 状態を成功証拠として使用しない
      - READ 操作（issue_read、issue_list、comment_list、pr_read、pr_changed_files、pr_mergeable）: 取得結果の構造と契約上必要な意味的整合性を確認する。時間変化し得る値（mergeable 等）について連続読取の一致を要求せず、取得時点の状態を正規化して返す。pr_mergeable は単一読取の正規化結果を返し、直後の再読取との一致確認を行わない

      一覧完全性:
      - issue_list と comment_list は Tool 内部で必要なページをすべて取得し、完全一覧として返す。上位層は GitHub API のページングを指定しない
      - フィルタ可能な軸（state、labels 等）はサーバ側絞り込みクエリへ推送し、安全上限への到達可能性を低減する。上限値は本 Design のパラメータとして定義する
      - 安全上の上限によって完全取得できない場合は再試行可能な失敗（operation-failed）として扱い、不完全な一覧を完全な成功結果として返さない。呼出側の回避手順（期間分割等）は各 workflow 文書が定める

      失敗分類の判定規則:
      - 存在しない対象（Issue 番号、commentId、PR 番号）への操作は、入力が構造的に有効であれば operation-failed とする（存在性は入力妥当性ではない）
      - runner 実行時の外部操作失敗（gh / GitHub API の HTTP エラーを含む）は operation-failed に分類し、Tool / runner 自体の異常終了のみを enforcement-crashed に分類する
      - WRITE 実行後に読み戻し確認を完了できない場合は verification-incomplete とする

      GitHub版 / Local版等価性:
      - 両版は操作名、入力構造、出力構造、Comment 識別概念（commentId の役割と公開型）、Issue の論理状態遷移、READ / WRITE の成功意味、失敗の意味を同値とする
      - 物理写像に起因する値域差異（ローカル版追跡Issueの通常ラベル非許容。agentdev-issue-tracking Design の値域定義に従う）と、role: case の状態モデルに起因する受理条件差（ローカル版 case の再オープン拒否。ローカルIssue共通スキーマ Design の状態遷移に従う）は、本 Design が例外として明示する

      操作カタログの完全列挙（16操作）は契約テストで固定し、対象外機能の追加を検出する。

      「third-party Skill 取得」操作契約:

      - 入力: third-party 宣言（skills.yaml）の対象 Skill 名（省略時は全件）、dry-run 指定
      - 出力: 取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況）
      - 保証: 取得結果の検証後に成功を返す。取得開始前に存在した正常な配置を取得失敗時に破壊しない。機構管理外の既存配置を無断で上書きしない
      - 失敗: 失敗を成功扱いとしない。部分取得状態を開始前状態へ解消し、失敗要因を報告する

      取得プロファイル（単一 SKILL.md URL 型・GitHub Skill ディレクトリ型の判定、正規化、再帰取得、相対構造保持、Skill ディレクトリ外非取得）の詳細は Design third-party-skill-management が所有する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_area: 移管記録（旧 `agentdev-gh-cli` Skill Design の廃止）
    source_items: [AG-004]
    content: |-
      GitHub I/O の操作契約、VERIFY、失敗時動作、環境依存隠蔽、ローカル版実装差し替えの正規所有は本 Design が一元的に担う。旧 Skill Design（`docs/designs/skills/agentdev-gh-cli.md`）はこの移管の完了に伴い現行 Design 体系から除去する。

      旧 Design が掲載していた操作契約表と拡大手続き（PR 変更ファイル一覧取得、PR mergeable 状態取得）は本 Design の「対象操作の境界（初期セット）」が所有する。gh 直接記述の検出スコープは IR-053（gh 直接記述検出）が所有する。Windows 環境依存の実装詳細（コンソールエンコーディング初期化、`--body-file`、一時ファイル運用等）は Tool 内部に隠蔽し、Design では正規所有しない。

      旧 Design が実装対応宣言の対象としていた各行（REQ-011-001、REQ-011-002、REQ-011-003、REQ-011-005、REQ-011-008、REQ-011-009、REQ-011-013、REQ-011-014、REQ-011-015）の被覆を本 Design が引き継ぎ、本 Design の実装対応宣言へ上記の各行を追記する。

      ローカル版の正規原本は `src/opencode-local/agentdev-gh/` とし、通常版 `src/opencode/tools/agentdev-gh/` と同一の `agentdev-gh` 名で対応させる。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_area: 操作契約の構成要素
    source_items: [AG-009]
    content: |-
      runner 応答 before 契約（追跡軸保持 VERIFY の実行前状態接合）:
      - issue_update、issue_reopen の追跡軸保持 VERIFY は、副作用後の読み戻しのみでは自己保持できない実行前状態を必要とするため、runner の成功応答 payload は実行前状態（before）を正規化済み導出値として含める。含める導出値は state、labels、role、kind、trackingState、closeReason とし、正規化規則は契約型（contracts.ts）と追跡スキーマ（tracking-schema.ts）の実装に従う
      - runner と engine の間の内部契約を拡張する場合は、GitHub 版と Local 版へ同時に反映する。Local 版の実装が未完了の間は、最低限の型整合を維持し、当該操作の VERIFY は fail-closed で verification-incomplete として返ることを許容する
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/commands/case-run.md
    target_area: verification-only PR（実装差分なし、検証のみ）（v2:REQ-0158-002）
    source_items: [AG-003]
    content: |-
      case-run は実行担当サブエージェント委譲の結果、実装差分0件・検証のみで完了する PR（**verification-only PR**）を生成する場合がある。
      本節は verification-only PR の判定条件、PR 本文の根拠欄記入規則、GitHub の空 PR 取り扱い、case-close への引継ぎ注意事项を定める。
      要件の SSoT は v2:REQ-0158-002。

      PR テンプレート（pr_desc.md）と Issue 本文構造は workflow-templates（[agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md)）の責務である。
      pr_desc.md への verify-only 根拠欄追加は workflow-templates Design の変更として位置付ける。

      ### 定義

      verification-only PR は以下を全て満たす PR とする（v2:REQ-0158-002）。

      - PR の変更ファイル数が0件（pr_changed_files の変更ファイル一覧が空と確認される）
      - Issue の受け入れ基準が検証のみで充足された（既存実装・既存文書が要件を満たしており、追加実装を要しなかった）
      - 検証結果が PR 本文の verify-only 根拠欄に evidence として記録されている

      実行担当サブエージェントは verification-only で完了した場合も `completed-pr` を返し、PR URL を委譲 result に含める（`blocked` / `failed` にはしない）。

      ### verify-only 根拠欄の記入規則

      case-run は verify-only PR 作成時に pr_desc.md の verify-only 根拠欄へ、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果を記入する。
      根拠は姉妹実装 PR だけでなく、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。
      「実装内容」欄は空欄にせず、「実装差分なし」と理由を記録する。

      ### GitHub の空 PR 許容

      GitHub は空 PR（変更ファイル0件）の squash merge を許可し、空 commit を生成する（commit 2b34f8b0 で実証）。
      case-run は空 PR の作成・マージを GitHub の挙動に依存して実行する。
      squash merge で生成された空 commit は履歴に残り、pr_merge（squash merge）の通常フローに従う。

      ### case-close 引継ぎ注意事项

      verification-only PR は case-close の targeted docs guard で files_checked が空になるため、次の注意事项を case-close へ引き継ぐ。

      - PR 本文の verify-only 根拠欄に「実装差分を含まない理由」「根拠成果物または commit」「検証対象」「検証結果」が記録されていること（[case-close.md](case-close.md)「verification-only PR の files_checked 空確認（v2:REQ-0158-002）」参照）
      - case-close は files_checked 空を検出した場合、v2:REQ-0158-002 に基づき verification-only 判定ステップを経て PASS 処理する（false-clean 3層防御との相互作用は case-close Design 参照）
      - case-run 側は PR 作成までを責務とし、verification-only 判定自体は case-close が行う（単一書き手: case-close、REQ-011 完了条件チェックボックス専任責務）
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target: docs/designs/skills/agentdev-traceability.md
    target_area: 対応宣言の表記（正規情報源）
    source_items: [AG-006]
    content: |-
      - 宣言の REQ-ID は子要件行 ID（`REQ-{NNNN}-{MMM}` 形式）で指定する。親要件 ID のみの参照（子行番号を伴わない bare ID）は実装宣言・検証宣言の配置対象とならない。check は bare ID 参照を missing-implementation の報告対象として計上し得るため、参照側は子行 ID の個別指定運用をとる
      - 実装対応宣言の配置先は成果物責任表（artifact-responsibilities.md）の正規配置先カタログに従う
      - 宣言が未付与の既存行は missing-implementation として計上され、fail-open 運用の下で正規配置先カタログに従い段階的に付与される。付与方針の正は当該カタログが所有する
  - id: ACT-DESIGN-006
    artifact: design
    operation: append
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area: 安定実行経路
    source_items: [AG-010]
    content: |-
      - Bun ランタイム API（Bun.YAML 等）に依存する checker は bun 経由（`bun run`）で実行する。node の安定実行経路は Bun ランタイム API に依存しない checker に適用され、依存する checker には適用されない
  - id: ACT-DESIGN-007
    artifact: design
    operation: append
    target: docs/designs/local/runtime-package-boundary.md
    target_area: 本体リポジトリ sync
    source_items: [AG-011]
    content: |-
      - package rename（パッケージ名の変更）を行った場合は、bun install が bun.lock の root workspace name を自動同期しないため、bun.lock の name が新パッケージ名へ追従していることを確認する。bun install の実行面（依存前置）は worktree 運用参照（agentdev-git-worktree/references/worktree-operations.md）と相互参照する
  - id: ACT-DESIGN-008
    artifact: design
    operation: append
    target: docs/designs/skills/agentdev-skill-authoring.md
    target_area: 配布物執筆時の ID 衛生（REQ-057-019）
    source_items: [AG-012]
    content: |-
      - 記載例・サンプルは最初からプレースホルダ形式（`REQ-{NNNN}-{NNN}`、`TS-{NNN}` 等、digits を持たないトークン）で執筆する。検出器の ID 分類規則（プレースホルダ形式は concrete ID として検出されない）は変更しない前提の運用規律である
      - 具体 ID の実例が不可欠な場合は、PR 作成前に配布依存境界 gate（check_distribution_boundary.ts の --profile source）を前置実行して新規違反 0 件を確認する
      - 操作廃止系の Case で test strategy に全文検索対象を定義する際は、repo-local 実体（`.opencode/skills/repo-*` 配下の checker・テスト等）を検査対象に含めるか否かを明示的に判断する
      - release archive に同梱されるファイルにも記載例・本文中の concrete ID 制約が適用される。whole-line 形式の対応宣言コメントは配布依存境界 gate の既存 exemption（IR-059）の対象であり、archive 同梱ファイルでの宣言配置を制限しない

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: RU-0006 の実装宣言の配置先・漸進モデルの規定が、正規配置先カタログ（artifact-responsibilities.md、REQ-057-023 が配置先カタログへ委任）と二重所有になり得る
    resolution: >-
      表記・解釈仕様（bare ID 扱い、子行 ID 指定運用、計上 semantics）のみを agentdev-traceability.md「対応宣言の表記（正規情報源）」節へ記載し、
      配置先は既存カタログへの参照導線1行に限定、漸進モデルの付与方針は再定義しない（アーキテクチャ助言 Q2 を採用）。
  - id: CR-002
    conflict: RU-0005(b) の baseline 鮮度前置確認義務が、docs-check の既知 delta 報告側（REQ-010-074）および baseline 再生成タイミング（REQ-007-009 系）と重複し得る
    resolution: >-
      corpus 変更側の義務（鮮度維持とマージ前置確認）に限定した新行として REQ-057 へ追加し、既存行の所有範囲を再定義しない
      （アーキテクチャ助言 Q1 を採用。REQ-010-074 は主語が docs-check 報告側、REQ-007-009 系は再生成のスコープとタイミングが既に所有）。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0005
    target_req: REQ-057
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      save_stage: req-save
      status: saved
      saved_docs:
        - docs/requirements/REQ-057.md
      artifact_action: ACT-REQ-001
      new_row: REQ-057-024
      auto_index_regen: docs/designs/quality/req-health-metrics.md（REQ-057-018 前置、鮮度検査 exit 0）
      unclassified_rows: [REQ-057-024]
      realization_pending: RA-002（baseline 再生成・運用注記、case-open 以降で実装）
  - ou_id: OU-002
    source_ru: RU-0001
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0004
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0009
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0003
    target_design: docs/designs/commands/case-run.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0006
    target_design: docs/designs/skills/agentdev-traceability.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-007
    source_ru: RU-0010
    target_design: docs/designs/integrity/checker-execution-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-008
    source_ru: RU-0011
    target_design: docs/designs/local/runtime-package-boundary.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-009
    source_ru: RU-0012
    target_design: docs/designs/skills/agentdev-skill-authoring.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-010
    source_ru: RU-0002
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result:
      save_stage: none
      status: no-save-stage-artifact
      note: realization 主体（RA-001）。req-save/design-save 対象の artifact_actions なし。case-open 以降の実装で対応
  - ou_id: OU-011
    source_ru: RU-0007
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result:
      save_stage: none
      status: no-save-stage-artifact
      note: realization 主体（RA-003）。req-save/design-save 対象の artifact_actions なし。case-open 以降の実装で対応
  - ou_id: OU-012
    source_ru: RU-0008
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result:
      save_stage: none
      status: no-save-stage-artifact
      note: realization 主体（RA-004）。req-save/design-save 対象の artifact_actions なし。case-open 以降の実装で対応
  - ou_id: OU-013
    source_ru: RU-0013
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result:
      save_stage: none
      status: no-save-stage-artifact
      note: realization 主体（RA-008）。req-save/design-save 対象の artifact_actions なし。case-open 以降の実装で対応

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素を必須とする
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      design-save 適用後、docs/designs/responsibilities/custom-tool-contracts.md について全文検索する。
      「一時的に温存」「移行完了までの間」の移行期間前提語の残存 0 件、廃止済み操作条項に廃止確定と外部 consumer 期間考慮の記載存在、
      操作カタログ列挙に移行期注記（「（新規）」）の残存 0 件を確認する。
    pass_criteria: |-
      移行期間前提語 0 件、廃止確定記載存在、移行期注記 0 件であること。加えて同 commit で配布依存境界 gate（--profile source）の新規違反 0 件であること（docs/designs 配下は検査対象外のため全体新規違反で判定）。
    on_failure: |-
      fix-and-reverify（Design 文言の修正であり即時再検証可能なため）。
  - id: TS-002
    target_item: AG-002
    verification: |-
      src/opencode-local/agentdev-gh/README.md と case-schema/case-file.md について全文検索する。
      「温存」「issue_comment」（テンプレートファイル名を除く運用記述）「#2688 が確定する」の旧表現 0 件、
      pr_update の列挙存在、Comment 操作4種の読み替え規則存在、`### c{NN}` 形式と3セクション直列化の言及存在を確認する。
    pass_criteria: |-
      旧表現 0 件、現行契約の構成要素（pr_update・Comment 操作4種・c{NN}・3セクション直列化）がすべて言及されていること。
      正本 docs/designs/local/local-case-file.md が変更されていないこと（diff なし）。
    on_failure: |-
      fix-and-reverify（説明文書の文言修正のため）。
  - id: TS-003
    target_item: AG-003
    verification: |-
      docs/designs/commands/case-run.md の verification-only PR 節について全文検索する。
      生 gh CLI コマンド表記（`gh pr view`、`gh pr merge`）0 件、Tool 操作名表記（pr_changed_files、pr_merge）の存在を確認する。
    pass_criteria: |-
      生 gh CLI 表記 0 件、Tool 操作名表記存在。IR-053（gh 直接記述検出）で当該ファイルの新規検出なし。
    on_failure: |-
      fix-and-reverify。
  - id: TS-004
    target_item: AG-004
    verification: |-
      docs/designs/responsibilities/custom-tool-contracts.md 移管記録節について、宣言形式文字列（宣言ロール名を含む括弧形式）の文中使用が 0 件であることを確認する。
      agentdev-traceability check 実行で当該ファイル由来の malformed-declarations 報告が既知分を増やさないことを確認する。
    pass_criteria: |-
      宣言形式文字列の文中使用 0 件、malformed-declarations の新規発生なし。
    on_failure: |-
      fix-and-reverify（文言の言い換え修正のため）。
  - id: TS-005
    target_item: AG-005
    verification: |-
      ir-055-baseline.json を現行 main 配布物状態へ再生成した後、repo-agentdev-integrity の integrity suite
      （bun test .opencode/skills/repo-agentdev-integrity/scripts/ 相当）を実行し、IR-055 既知 delta 由来の fail が解消されていることを確認する。
      あわせて REQ-057 への要件行追加が req-save で適用され、AUTOGEN 対象索引の同 commit 再生成が行われていることを確認する。
      repo-local vocabulary-registry.md 当該節へ前置確認運用の注記が追加されていることを確認する。
    pass_criteria: |-
      integrity suite が IR-055 既知 delta 由来の fail なしで pass すること（既知 baseline の他検査分は既存扱い）。REQ-057 行追加と AUTOGEN 再生成の適用、運用注記の存在。
    on_failure: |-
      fix-and-reverify（baseline 再生成または該当配布物表現の解消で対応可能なため）。
  - id: TS-006
    target_item: AG-006
    verification: |-
      docs/designs/skills/agentdev-traceability.md「対応宣言の表記（正規情報源）」節に (a) bare ID 扱いと子行 ID 指定運用、
      (b) 配置先カタログへの参照導線、(c) 計上 semantics と段階的付与の記載が存在することを確認する。
      配布 SKILL.md「対応宣言の表記」ミラーが Design 変更と同期されていることを確認する。
      artifact-responsibilities.md の正規配置先カタログが変更されていないこと（参照導線のみであること）を確認する。
    pass_criteria: |-
      3要素の記載存在、SKILL.md ミラーの同期、配置先カタログ不変。traceability check の既存 usage が regress しないこと。
    on_failure: |-
      fix-and-reverify（Design・SKILL 文言の修正のため）。
  - id: TS-007
    target_item: AG-007
    verification: |-
      src/opencode/skills/agentdev-traceability/SKILL.md「実行方法」節と scripts/README.md に、--req 個別カンマ指定（範囲構文非対応の明記）、
      worktree での --root 明示、走査対象拡張子と除外ディレクトリの前提の注記が存在することを確認する。
      case-close／case-run のトレーサビリティ独立再検査手順参照に前置注記が存在することを確認する。
      既存の --root 相対パス解決警告との文言重複がないことを確認する。
    pass_criteria: |-
      3前提の注記存在、再検査手順参照への注記存在、既存警告との重複なし。
    on_failure: |-
      fix-and-reverify。
  - id: TS-008
    target_item: AG-008
    verification: |-
      src/opencode/skills/agentdev-issue-tracking/SKILL.md と src/opencode/skills/agentdev-workflow-issue/SKILL.md について全文検索する。
      「クライアント側で行う」絞り込み記述と「labels・search パラメータは Tool が invalid-input として拒否」記述の残存 0 件、
      Tool 側絞り込み軸（role、kind、state、trackingState、labels、search）を説明する現行契約記述の存在を確認する。
      plugin.ts 公開スキーマ（issue_list の labels・search 受理）と記述が矛盾しないことを確認する。
    pass_criteria: |-
      旧記述 0 件（5箇所すべて現行化）、現行契約記述存在、公開スキーマとの矛盾なし。
      修正後の両 SKILL 本文に concrete REQ/DEC ID（digits を持つ ID）が含まれないこと（ID 衛生）。
    on_failure: |-
      fix-and-reverify（SKILL 文言の修正のため）。
  - id: TS-009
    target_item: AG-009
    verification: |-
      docs/designs/responsibilities/custom-tool-contracts.md「操作契約の構成要素」節の before 契約記載について、
      導出値（state、labels、role、kind、trackingState、closeReason）と対象操作（issue_update、issue_reopen）が
      src/opencode/tools/agentdev-gh/contracts.ts・tracking-schema.ts の実装と一致することを突合する。
      両版同時反映原則と Local 版未完了時の型整合・fail-closed 許容の記載が存在することを確認する。
    pass_criteria: |-
      Design 記載と実装の突合一致、原則の記載存在。
    on_failure: |-
      fix-and-reverify（Design 記載を実装へ合わせて修正する。実装側の変更は本 Case の対象外とし、乖離が実装起因の場合は Findings 記録）。
  - id: TS-010
    target_item: AG-010
    verification: |-
      src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md「3 cwd 分割実行」節に stderr 併退避の記載、
      docs/designs/integrity/checker-execution-contracts.md「安定実行経路」節に Bun 依存 checker の bun 経路実行の記載、
      AGENTS.md にリダイレクト・パイプ（`>` / `*>`）による再符号化破損の言及がそれぞれ存在することを確認する。
    pass_criteria: |-
      3箇所の記載存在。
    on_failure: |-
      fix-and-reverify。
  - id: TS-011
    target_item: AG-011
    verification: |-
      各正規手順文書の該当節に注記が存在することを確認する。(a) case-close の pr-merge-and-conflict.md（Level 1 rebase パス）に
      git add 確定・worktree clean 確認・merge 後 main 上再検証、(b) case-close の epic-wave-close.md に
      廃止キーワード全文検索、(c) runtime-package-boundary.md「本体リポジトリ sync」節に bun.lock root name 確認と worktree 運用参照との相互参照。
    pass_criteria: |-
      3系統の注記がすべて存在すること。
    on_failure: |-
      fix-and-reverify。
  - id: TS-012
    target_item: AG-012
    verification: |-
      docs/designs/skills/agentdev-skill-authoring.md「配布物執筆時の ID 衛生（REQ-057-019）」節に、
      プレースホルダ形式徹底・前置 gate 実行・repo-local 実体包含の明示判断規定・archive 同梱の ID 制約運用の4項目が記載されていることを確認する。
      当該節自身の記載例がプレースホルダ形式であること（自己準拠）を確認する。
    pass_criteria: |-
      4項目の記載存在と自己準拠。配布依存境界 gate の同 commit 全体新規違反 0 件（当該節は docs/designs 配下のため検査対象外、全体新規違反で判定）。
    on_failure: |-
      fix-and-reverify。
  - id: TS-013
    target_item: AG-013
    verification: |-
      修正後、agentdev-gh（src/opencode/tools/agentdev-gh）・agentdev-gh-tool plugin（src/opencode/plugins/agentdev-gh-tool）・
      opencode-local（src/opencode-local）の各パッケージで typecheck を実行し 0 error であることを確認する。
      runner-cli.test.ts と plugin.test.ts の bun test が既存挙動を維持して pass することを確認する。
    pass_criteria: |-
      3パッケージの typecheck 0 error、テスト pass 維持（テスト意図の変更なし）。
    on_failure: |-
      fix-and-reverify（テストコード内の型是正のため。契約型の変更が必要と判明した場合は Findings 記録として対象範囲変更を報告）。

# realization_actions: 実現面の変更方針
realization_actions:
  - id: RA-001
    concern: opencode-local agentdev-gh 説明文書2ファイルの16操作現行化
    responsibility: >-
      src/opencode-local/agentdev-gh/README.md と src/opencode-local/agentdev-gh/case-schema/case-file.md の説明文書を
      16操作カタログ・Comment CRUD（`### c{NN}` 形式）・pr_read 論理 PR 本文3セクション直列化の現行契約へ現行化する。
      正本 Design（local-case-file.md）は変更しない。
    ownership_hints:
      - src/opencode-local/agentdev-gh/README.md
      - src/opencode-local/agentdev-gh/case-schema/case-file.md
      - 正本: docs/designs/local/local-case-file.md（参照のみ）
    intent: >-
      廃止済み操作の読み替え規則を信頼した呼出が invalid-input になる危険と、正本 Design との文書レベル矛盾を解消する。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-002
    concern: IR-055 baseline 再生成と前置確認運用の整備
    responsibility: >-
      .opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json を現行 main 配布物 Markdown 状態へ再生成する
      （check_integrity.ts の --update-ir055-baseline 経路）。あわせて repo-local の vocabulary-registry.md 当該節へ
      配布物 Markdown 変更時の IR-055 delta 前置確認運用を注記する。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json
      - .opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts（再生成経路の参照のみ）
    intent: >-
      main の integrity suite 赤継続を解消し、baseline 未更新による新規 delta 違反の再発を前置確認で予防する（REQ-057 新行の運用面）。
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-003
    concern: agentdev-traceability 配布 SKILL の check 実行前提注記
    responsibility: >-
      src/opencode/skills/agentdev-traceability/SKILL.md「実行方法」節と scripts/README.md へ --req 個別カンマ指定（範囲構文非対応）、
      worktree での --root 明示、走査対象拡張子・除外ディレクトリの前提を注記する。
      case-close／case-run のトレーサビリティ独立再検査手順参照（issue-resolution-and-qg4.md 等）へ前置注記を加える。
    ownership_hints:
      - src/opencode/skills/agentdev-traceability/SKILL.md
      - src/opencode/skills/agentdev-traceability/scripts/README.md
      - src/opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md
      - src/opencode/skills/agentdev-workflow-case-run/references/（トレーサビリティ再検査手順記述箇所）
    intent: >-
      QG-4 独立再検査という高頻度経路での反復的誤実行・誤計上（3観測）を実行前提の明記で予防する。
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-004
    concern: 追跡Issue系配布 SKILL 2ファイルの issue_list 絞り込み記述現行化
    responsibility: >-
      src/opencode/skills/agentdev-issue-tracking/SKILL.md（60・66・91・100行目）と
      src/opencode/skills/agentdev-workflow-issue/SKILL.md（71行目）の旧契約記述（クライアント側絞り込み・labels/search 拒否）を
      現行契約（Tool 側絞り込み軸 role、kind、state、trackingState、labels、search）へ置き換える。
    ownership_hints:
      - src/opencode/skills/agentdev-issue-tracking/SKILL.md
      - src/opencode/skills/agentdev-workflow-issue/SKILL.md
      - 照合基準: src/opencode/tools/agentdev-gh/contracts.ts・src/opencode/plugins/agentdev-gh-tool/plugin.ts 公開スキーマ（参照のみ）
    intent: >-
      配布 SKILL の操作説明が現行操作契約（REQ-011-022）と矛盾する読まれ方をする high 検出事項を解消する。
    verification_refs: [TS-008]
    source_items: [AG-008]
  - id: RA-005
    concern: QG-4 実行形態契約の stderr 併退避注記と AGENTS.md リダイレクト・パイプ補記
    responsibility: >-
      src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md「3 cwd 分割実行」節へ
      bun test 証跡の stdout・stderr 分離併退避を注記する。AGENTS.md の PowerShell 警告段落へ
      リダイレクト・パイプ（`>` / `*>`）による UTF-8 再符号化破損の言及を補記する。
    ownership_hints:
      - src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
      - AGENTS.md（リポジトリルート）
    intent: >-
      証跡欠落・gate 不能・誤判定という反復失敗モード（bun test stderr 流出、PS 再符号化）を契約注記で予防する。
    verification_refs: [TS-010]
    source_items: [AG-010]
  - id: RA-006
    concern: 境界跨ぎ編集の永続化確認手順の配布参照への明文化
    responsibility: >-
      src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md（Merge Conflict 対応パターン）へ
      squash merge 前 worktree clean 確認を、src/opencode/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md（STEP-4-5 Level 1 rebase パス）へ
      解消編集の git add 確定と merge 後 main 上再検証を、同 references/epic-wave-close.md へ
      廃止キーワード全文検索の定型手順を、それぞれ注記する。
    ownership_hints:
      - src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md
      - src/opencode/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md
      - src/opencode/skills/agentdev-workflow-case-close/references/epic-wave-close.md
    intent: >-
      rebase 解消漏れによる main 破壊と fix コミット（77e2caa4 事例）、Wave 境界での横断的残存遅延発覚を機械確認手順で予防する。
    verification_refs: [TS-011]
    source_items: [AG-011]
  - id: RA-007
    concern: agentdev-traceability 配布 SKILL の対応宣言表記ミラー同期
    responsibility: >-
      docs/designs/skills/agentdev-traceability.md「対応宣言の表記（正規情報源）」節の変更（ACT-DESIGN-005）に伴い、
      src/opencode/skills/agentdev-traceability/SKILL.md の「対応宣言の表記」要約を同期更新する
      （重複許容時の同期ルール: 正の情報源の変更時は同期側の更新を必須とする）。
    ownership_hints:
      - src/opencode/skills/agentdev-traceability/SKILL.md
      - 正: docs/designs/skills/agentdev-traceability.md
    intent: >-
      Design と配布 SKILL の表記仕様の乖離を同期義務で防止する。
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-008
    concern: Epic 遺留テストコード型エラーの解消
    responsibility: >-
      src/opencode/tools/agentdev-gh/tests/runner-cli.test.ts 1034行目と
      src/opencode/plugins/agentdev-gh-tool/tests/plugin.test.ts の labels 関連3箇所（行番号は実装時に特定）の TypeScript 型エラーを
      テスト意図を変えない範囲で修正する（契約型 contracts.ts・公開スキーマは変更しない）。
    ownership_hints:
      - src/opencode/tools/agentdev-gh/tests/runner-cli.test.ts
      - src/opencode/plugins/agentdev-gh-tool/tests/plugin.test.ts
    intent: >-
      typecheck の常態化した赤を解消し、新規型不整合の検出可能性を回復する（Issue #2663 は完了済み・重複なし確認済み）。
    verification_refs: [TS-013]
    source_items: [AG-013]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001
    disposition: covered
    reason_code: integrated
    reason: >-
      ACT-DESIGN-001（対象操作の境界（初期セット）節の現行化）として AG-001 へ統合。intake 成果物と inspect F-05 の二重起票を単一変更へ集約。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: RU-0002
    disposition: covered
    reason_code: integrated
    reason: >-
      RA-001（説明文書2ファイルの現行化）として AG-002 へ統合。inspect F-03/F-04 を同一バッチで包含。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: RU-0003
    disposition: covered
    reason_code: integrated
    reason: >-
      ACT-DESIGN-004（case-run.md verification-only PR 節の表記統一）として AG-003 へ統合。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: RU-0004
    disposition: covered
    reason_code: integrated
    reason: >-
      ACT-DESIGN-002（移管記録節91行目の言い換え）として AG-004 へ統合。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0005
    source_item: RU-0005
    disposition: covered
    reason_code: integrated
    reason: >-
      ACT-REQ-001（REQ-057 新行）と RA-002（baseline 再生成・運用注記）の2層構造として AG-005 へ統合。
      (a) 必須層は baseline 再生成、(b) 前置検出は REQ-057 新行と運用注記で採用。
    evidence:
      path: .agentdev/backlog/req-units/RU-0005.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0006
    source_item: RU-0006
    disposition: covered
    reason_code: integrated
    reason: >-
      ACT-DESIGN-005 と RA-007（SKILL.md ミラー同期）として AG-006 へ統合。
      配置先カタログと漸進モデルは既存所有（artifact-responsibilities.md、REQ-057-023）の参照導線化（CR-001）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0006.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0007
    source_item: RU-0007
    disposition: covered
    reason_code: integrated
    reason: >-
      RA-003（実行前提注記）として AG-007 へ統合。注記先は実在確認済みの SKILL.md「実行方法」節・scripts/README.md・再検査手順参照へ修正。
      `--req` 範囲展開の実装改善は本バッチ対象外（個別カンマ指定運用で対処）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0007.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0008
    source_item: RU-0008
    disposition: partially_covered
    reason_code: integrated_with_deferred_item
    reason: >-
      (a) 現行化5箇所は RA-004 として AG-008 へ統合。(b) docs-check 機械照合新規検査クラスは本バッチで要件化しない
      （REQ-010-068 回帰テスト義務を伴う独立規模であり、散文主張とスキーマの突合は許容例設計が困難。
      再検知経路は今回の inspect-docs 検出で実証済み。必要時に改めて要件化する）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0008.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0009
    source_item: RU-0009
    disposition: covered
    reason_code: integrated
    reason: >-
      ACT-DESIGN-003（before 契約・両版同時反映原則の Design 化）として AG-009 へ統合。
      実装は両版反映済みであり Design が未追随の fix gap を解消する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0009.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0010
    source_item: RU-0010
    disposition: covered
    reason_code: integrated
    reason: >-
      ACT-DESIGN-006（Bun 経路実行）と RA-005（stderr 併退避・AGENTS.md 補記）として AG-010 へ統合。
      対論でスコープ縮小済みの残存 gap のみを対象とする。
    evidence:
      path: .agentdev/backlog/req-units/RU-0010.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0011
    source_item: RU-0011
    disposition: covered
    reason_code: integrated
    reason: >-
      ACT-DESIGN-007（bun.lock name 確認）と RA-006（rebase・Wave・merge 系手順注記）として AG-011 へ統合。
    evidence:
      path: .agentdev/backlog/req-units/RU-0011.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0012
    source_item: RU-0012
    disposition: covered
    reason_code: integrated
    reason: >-
      ACT-DESIGN-008（ID 執筆規律の反映）として AG-012 へ統合。
      実在しない反映先候補行（custom-tool-contracts.md TS-003 検索範囲関連節）は転記せず、knowledge 新規文書化も不採用（Design が正規所有）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0012.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0013
    source_item: RU-0013
    disposition: covered
    reason_code: integrated
    reason: >-
      RA-008（テスト型修正）として AG-013 へ統合。
      Issue #2663 は closed・完了済みで本修正と重複しないことを req-define で確認済み（bun test は typecheck を含まない、
      Epic #2686 スキーマ刷新後に顕在化した型レベルの問題であるため #2663 スコープ外）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0013.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: true
  decomposition: >-
    OU-001（REQ-057 行追加と baseline 再生成）は main の integrity suite 赤解消のため最優先で処理する。
    OU-002〜004（custom-tool-contracts.md への3関心）の同一ファイル逐次適用は design-save の単一コマンド内の連続適用で解決済みであり、
    子 Issue は OU 単位で生成する（Issue 化単位は OU 単位の不変条件に従う）。
    feature 経路では req-save・design-save が ACT-REQ-001・ACT-DESIGN-001〜008 の適用を case-open 前に完了させるため、
    子 Issue の実装範囲は RA と TS 検証に限定される（RA→OU 対応: RA-002→OU-001、RA-007→OU-006、RA-005→OU-007、
    RA-006→OU-008、RA-001→OU-010、RA-003→OU-011、RA-004→OU-012、RA-008→OU-013）。
    Design 適用のみの OU（OU-002〜005・009）は verification-only PR 想定、realization 主体の OU（OU-010〜013）は
    RA 実装を変更スコープとし、残る Design 系 OU（OU-006〜008）は RA 実装と TS 検証を併せ持つ。
  wave_hints:
    - OU-001 を最初の Wave に含める（integrity suite 赤の早期解消）
    - OU-002〜005・009（verification-only 想定）は相互独立であり任意の Wave で処理可能
```

# summary

## 構成

Epic #2686 完了直後の13 RU（backlog-auto 2026-09-08 生成）を一括処理する。13 RU は AG-001〜013 に対応づけ、
REQ-057 への1行追加（ACT-REQ-001）と Design 6ファイルへの8アクション（ACT-DESIGN-001〜008）、
配布物・repo-local・ルートファイル群の8実現面（RA-001〜008）へ展開した。OU は13件（REQ-057×1、Design×8、realization 主体×4）、
依存なし（custom-tool-contracts.md の3関心は design-save 単一コマンド内の逐次適用で直列化し、子 Issue は OU 単位で生成）。

## 壁打ち・助言での主な判断

- RU-0005(b) 前置検出は「corpus 変更側の義務」として REQ-057 新行（REQ-057-024 予定）で採用。REQ-010-074（docs-check 報告側）・REQ-007-009 系（再生成タイミング）との主語分離を明記（CR-002）。
- RU-0006 は表記・解釈のみ traceability Design へ、配置先は既存カタログの参照導線化、漸進モデルは再定義なし（CR-001）。配布 SKILL.md ミラー同期を RA-007 として追加。
- RU-0008(b)（docs-check 機械照合新規検査クラス）は本バッチ対象外。理由は RD-008 に記録（再検知経路は inspect-docs で実証済み）。
- RU-0007 の注記先は「SKILL references」ではなく実在する SKILL.md「実行方法」節・scripts/README.md へ修正（references/ ディレクトリ不存在を確認済み）。`--req` 範囲展開の実装改善は不採用（個別カンマ指定運用で対処）。
- RU-0005a の vocabulary-registry.md 運用注記は REQ-057 新行の運用面として repo-local ファイル（.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md）へ1行注記する形で採用。
- DEC-022 は proposed のため Design 本文で権威引用しない（REQ-011-023/024 と accepted Design を正規根拠とする）。
- アーキテクチャ助言（Q1/Q2/Q3/Q5/Q6）は確定事項として採用、Q4 は推定事項として親判断で採用。ユーザー判断事項・ブロッカーなし。
- 対論レビュー（Stream A/B）の本質的 findings 5件（A-1 pr_read 表記、A-2/A-3 配置先カタログとの両立不能文言、B-1/B-2 case_open_hints の OU 束ね・段階混在）を全て反映済み。
- 観測記録: corpus 既存の対立（正規配置先カタログ (a)＋配布物実態＋IR-059 exemption vs REQ-057-005/019 の docs 配下配置原則）は本バッチの範囲外として観測に留める（検出は inspect-docs の正規経路）。本 draft は当該対立へ片側で加担しない文言へ縮小済み。
