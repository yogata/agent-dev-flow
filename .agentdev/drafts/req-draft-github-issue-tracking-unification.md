---
draft_type: req_draft
topic_slug: github-issue-tracking-unification
status: saved
created_at: 2026-08-25T08:54:35+09:00
source_rus: [RU-20260824-01]
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  GitHub Issue を追跡Issue（課題・ToDo・アイデア・リスクの育成管理単位）と Case Issue（req/case
  パイプライン実行票）の共通管理単位へ拡張し、旧 docs/issue-list/ 課題ファイル方式を完全除去する。
  追跡Issueの論理スキーマ（role/kind/状態遷移/物理マッピング）は agentdev-issue-tracking Design
  が一元所有し、Custom Tool agentdev_gh の操作契約へ追跡Issue操作（一覧・検索・メタデータ読取・
  labels 更新・コメント読取・reopen）を追加、ローカルモードは .agentdev/issues/issue-{NNNN}.md
  のローカルIssue共通保存（role 条件付きスキーマ・単一採番空間）へ一般化する。DEC-020 は
  proposed 段階での直接再構成とし、ISL-001 の有効論点のみ新追跡Issueへ移行する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      GitHub Issue を「人または Agent が、検討・判断・実行・追跡する必要のある事項の永続的な単位」
      とする共通管理単位へ拡張する。Issue は論理 role により追跡Issue（tracking）と Case Issue
      （case）に区別し、機械判定可能とする。kind は少なくとも problem、idea、task、risk の意味を
      表現できる。状態は少なくとも起票、検討中、保留、実行準備完了、解決済み、クローズ済みを区別でき、
      解決済みは結論確定、クローズ済みは必要な反映完了または反映不要確認完了を意味する。
      Issue が存在すること自体を Agent の実行許可としない。追跡Issueを実行票へ直接変質させず、
      実行が確定した場合は req-define 等の正規要件化・設計経路を経由し case-open が別の Case Issue
      を作成する。追跡Issueと生成された Case Issue の関係は後から追跡できるようにする。
      GitHub Issue Type / Issue Fields は利用可能な環境での物理写像として使用できるが、
      Organization 固有設定を利用必須条件としない。ADF の論理スキーマは最低限、リポジトリ単位の
      Issue、ラベル、本文、状態で表現できること。
      物理写像の解釈主体: role/kind/状態とラベル等の物理写像表の所有は agentdev-issue-tracking
      Design に一元化し、論理値と物理値の変換（写像表の機械適用）は Tool 内実装として行う。
      Tool は写像表の機械適用のみを行い、写像の意味判断を新規に所有しない。
  - id: AG-002
    content: |
      追跡Issueの論理スキーマを agentdev-issue-tracking Design に一元管理する。対象は role、kind、
      状態と状態遷移、件名、課題・アイデア・ToDo の内容、背景、影響、関連成果物、選択肢、判断材料、
      不足情報、owner・期限・優先度等の任意メタデータ、保留理由、再評価条件、解決結論、反映先と反映状態、
      追跡Issueと Case Issue の関連、GitHub 上で使用するラベル・Issue Type・Issue Field 等への物理
      マッピング、追跡Issue本文の標準構造とする。物理マッピングの正は一箇所に置き、同一のラベル名、
      kind、状態、本文フォーマットを複数の Command / Skill / Template が独自定義しない。
      検討経過は GitHub Issue コメントを正規の時系列履歴として利用し、Issue 本文は現在状態の理解のための
      要約・構造化情報を中心とし、本文内へ独自の追記専用ログを二重保持しない。
      Design の確定事項には、状態の三段写像（追跡Issue 6状態、GitHub open/closed、Tool close reason
      の対応表）と、issue_close の reason と追跡Issueの解決済み/クローズ済み/対応不要の対応を含める。
  - id: AG-003
    content: |
      /agentdev/issue を GitHub 追跡Issueの自然言語操作入口とする。起票、検索・参照、更新、コメント追加、
      保留、再評価、実行準備完了、解決、反映確認、クローズ、再オープンを自然言語入力と会話文脈から
      判断して実行する。ユーザーにサブコマンド、ラベル名、Issue Type、Field 名等の GitHub 実装詳細を
      要求しない。新規起票時は現在の作業で解決できる事項を先に解決し、既存追跡Issueを検索して重複を
      避ける。ユーザー合意が必要な設計判断を課題管理側だけで確定しない。GitHub 版では課題管理のために
      リポジトリ内課題ファイルを作成・commit しない。他 workflow も追跡Issue能力を利用できるが、
      各 workflow が追跡Issueスキーマや GitHub I/O を再実装しない。
  - id: AG-004
    content: |
      追跡Issue操作に必要な I/O を現行 Custom Tool（agentdev_gh）契約へ追加する。追加操作は
      Issue 一覧・検索（role、kind、state、関連情報等による絞り込みに必要な構造化結果）、Issue 単体
      読取のメタデータ拡張（title、state、labels、role/kind/状態写像に必要なメタデータの取得）、
      Issue 本文・メタデータ更新（labels 更新を含む）、Issue コメント追加・読取、Issue クローズ、
      Issue 再オープンとする。Case workflow が既に利用する PR 操作は維持する。
      issue_read のメタデータ拡張は既存操作契約の変更であり、新規操作追加と区別して契約・テストを
      更新する。一覧・検索は read-only 操作として応答自己整合の検証を、close/reopen/更新は副作用
      操作として読み戻し検証（VERIFY）を適用する。各 WRITE は Tool 内で VERIFY まで完了してから
      成功を返す。Command / Workflow Skill / Capability Skill の Markdown に gh CLI オプション、
      文字コード対策、一時ファイル実装等を記述しない。失敗時は既存 fail-closed 契約に従う。
  - id: AG-005
    content: |
      ローカルモードの保存単位を .agentdev/issues/issue-{NNNN}.md のローカルIssueへ一般化する。
      ローカル版 Custom Tool は通常版と同じ Issue 操作契約を実装し、GitHub Issue をローカルIssueへ
      読み替える。ローカルIssueは GitHub Issue 番号に対応する一つの共通採番空間を持ち、tracking / case
      の role で別採番に分けない。ローカルIssueは共通メタデータと role を持ち、role ごとの条件付き
      スキーマとして追跡Issueは追跡Issueスキーマに必要な情報とコメント相当履歴を、Case Issue は既存
      Case 実行に必要な Issue 本文、コメント相当情報、PR 相当セクション、マージ結果等を保持する。
      PR 関連操作は role: case のローカルIssueにのみ適用する。ローカル版 Tool 実装の読み替え規則には、
      PR 操作の対象解決（role: case の特定）とコメント読み替え先の role 分岐を Design 確定事項として
      含める。ローカルIssueスキーマは追跡Issue追加により Case 固有セクションを全 Issue の必須項目と
      せず、role ごとの必須項目・状態値・許可操作を検証できること。ローカル版の上位 Command /
      Workflow / Capability は .agentdev/issues/ を直接読み書きせず、通常版と同一の Tool 操作契約だけを
      利用する。ローカル Design は role・kind・状態の意味論を再定義せず物理表現の写像に徹する。
  - id: AG-006
    content: |
      旧課題ファイル方式を完全に除去する。docs/issue-list/ をディレクトリごと削除し、ISL-* ID、
      課題ファイルの frontmatter、課題ファイルを docs/ 配下の正規文書として扱う分類、課題ファイル専用の
      検索・一覧・検査スクリプト、テストを残さない。document-model.md の課題追跡に対応する8番目の文書
      分類を除去し、文書7分類へ戻す。GitHub の追跡Issueは docs/ 配下の文書種別ではなく、管理単位・
      永続状態として責務表、Guide、System 説明を更新する。REQ-001 の文書種別一覧等、課題ファイルを
      docs/ 配下の文書種別として追加した箇所を整合する。「課題追跡に状態管理を集約する」等、GitHub の
      追跡Issueに読み替えて現在も成立する一般原則は新方式の意味で維持する。旧方式にのみ由来する
      .agentdev/intake/inbox/2026-08-23-issue-list-docs-guard-profile-scope.md と
      .agentdev/intake/inbox/2026-08-23-req049-declaration-corpus-gap.md は新方式への移行で解消される
      古い前提の item として、移行実施時に削除する。
  - id: AG-007
    content: |
      ISL-001 の実質的な論点を失わず、新しい追跡Issueへ移す。移行情報は現在有効な内容だけとする:
      サブエージェント間で探索責務を分割すべきかという未解決論点、改善前分析で read を伴う97論理実行
      単位のうち68単位で異なる子セッション間の同一 path 参照が確認されたこと、REQ-048 と改善前分析
      Report との関連、改善効果を観測する前に構造変更すると原因と効果を分離できないため現在は保留する
      こと、REQ-048 の改善を実運用へ反映した後比較可能な OpenCode セッション履歴が十分蓄積したら
      再評価すること、再評価時に確認する残存重複、source / projection 由来重複、工程間文脈不足、
      独立検証として必要な重複、token 消費影響等の再分析事項。新しい追跡Issueに ISL-001、
      docs/issue-list/、課題管理機構の初期実装であったという経緯を記録しない。移行起票は case 側の
      実施事項とし、要件は移行内容の性質のみ規定する。
  - id: AG-008
    content: |
      新しい Issue モデルへ連動更新する対象: README.md 入口表、コマンド README、guides
      （command-selection、artifacts-and-state）、検証対応要否カタログ（verification-scope-catalog.md
      の REQ-049 行再構成）、req-impact-map、workflow-contracts、glossary、consumer-project-setup、
      install-script-usability、runtime-package-boundary、.agentdev/README.md、decisions/README.md
      トピックビュー、成果物責任表（artifact-responsibilities.md）、旧 agentdev-gh-cli Design、
      agentdev-issue-tracking scripts/README、src/opencode-local/README.md、issue コマンドテンプレート
      （templates/issue/standard.md）。
      追跡IssueのLifecycle 接続点: intake-from-github の抽出対象から role: tracking の Issue を
      除外し（クローズ済み追跡Issueは反映確認完了を意味し、未回収変更候補の回収機会と意味が衝突する
      ため）、REQ-037 または intake-from-github Design へ反映する。backlog-artifact-lifecycle には
      追跡Issueから実行確定時の要件化経路（req-define 経由）を登録する。case-open Design には Case
      Issue 本文から元追跡Issueへの参照形式を Parent: #N（Epic/child 専用）とは別形式として定義する。
  - id: AG-009
    content: |
      本要件の実装は docs 再構成（REQ/Decision/Design）と配布物実装の2系統で完結させる。配布物実装
      には Custom Tool（通常版・ローカル版）への追跡Issue操作追加、agentdev-issue-tracking /
      agentdev-workflow-issue スキル本体と /agentdev/issue コマンドの再設計、テンプレート更新、
      issue_tracking_list.test.ts の新方式検証（ローカルIssue role 条件付きスキーマ・Tool 操作契約）
      への置換を含む。docs 再構成のみで完了扱いとせず、受け入れ条件の実装系要件（追跡Issue操作入口、
      Tool 操作契約、上位層の Tool 経由、テスト置換）は実装 Wave で検証する。実装 Wave の構成は
      case_open_hints に明示し、Issue 階層・Wave 構成の最終決定は case-open が行う。
  - id: AG-010
    content: |
      REQ-049 全面再構成に伴い、REQ-049 を ADF-COVERS 宣言する成果物（agentdev-issue-tracking
      Design、issue command Design、agentdev-issue-management Design、document-model.md）の宣言を
      新しい要件行体系へ再紐づけする。既知の宣言欠落（REQ-049-001〜004 の implementation 対応）
      を合わせて解消し、トレーサビリティ検査で REQ-049 の missing-implementation が 0 となる状態を
      作る。検証対応要否カタログの REQ-049 行も新行体系へ再構成する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-049.md
    source_items: [AG-001, AG-002, AG-003, AG-007, AG-010]
    content: |
      要件表を全面再構成する。docs/issue-list 前提行（REQ-049-005、006、014、026、030 を含む）を
      削除し、次の現行要件へ書き換える: GitHub 追跡Issueを正規管理先とすること、追跡Issueと Case
      Issue の役割分離（論理 role による機械判定可能な区別、kind、状態の6意味、解決済み/クローズ済み
      の区別）、Issue 存在を実行許可としないこと、実行確定時は正規要件化経路を経て別 Case Issue を
      作成し両者関係を追跡すること、GitHub Organization 固有機能を必須前提としないこと、論理スキーマ
      の一元管理先（agentdev-issue-tracking）、/agentdev/issue 自然言語入口とユーザーへの GitHub
      実装詳細非要求、新規起票時の事前解決・重複回避・代理確定禁止、検討経過のコメント正規化、反映追跡
      とクローズ条件、ローカル版の Tool 操作契約経由、ISL-001 由来論点の移行（旧 ID・経緯の非記録を
      条件とする内容規定に置換）。状態要件として記述し、作業指示を要件行に混入しない。適用範囲の
      対象・対象外も新方式へ更新する。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-009.md
    source_items: [AG-005]
    content: |
      ローカルCase前提行（REQ-009-026〜033）をローカルIssue前提へ書き換える: 保存先を
      .agentdev/issues/issue-{NNNN}.md とすること、role（tracking/case）ごとの条件付きスキーマと
      すること、単一採番空間とすること、ローカル版 case-open/run/close と /agentdev/issue がローカル
      Issue を Tool 操作契約経由で操作すること、PR 相当情報は role: case のみが保持すること。
      REQ-009-015、016、020 の agentdev-gh-cli 表現をローカル実装 Tool（agentdev_gh の Local 実装）
      表現へ更新する。目的節・REQ-009-037 等の残存 agentdev-gh-cli 表現も Local 実装 Tool の意味へ
      整合する。適用範囲の記載を更新する。
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-011.md
    source_items: [AG-004, AG-005]
    content: |
      次の要件行を追加する: GitHub I/O を担う Custom Tool の操作契約は、追跡Issueの管理に必要な
      Issue 一覧・検索（role、kind、state 等の絞り込みを含む構造化結果）、Issue 単体読取のメタデータ
      （title、state、labels、role/kind/状態写像に必要な情報を含む）、Issue 本文・メタデータ更新
      （labels を含む）、Issue コメント追加・読取、Issue クローズ、Issue 再オープンを上位層へ提供し、
      GitHub 版とローカル版が同一の上位操作契約を提供すること。追加・変更操作は Tool 内 VERIFY を
      完了してから成功を返すこと。読み取り操作は応答の自己整合を確認すること。ローカル版は
      .agentdev/issues/ のローカルIssueの読み書きを同一契約で実装すること。
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-011.md
    source_items: [AG-004]
    content: |
      REQ-011-008「上位 command/skill は常に agentdev-gh-cli のみを参照し、別名スキルを参照しない」を
      「上位 command/skill は常に GitHub I/O を担う Custom Tool（agentdev_gh）の操作契約のみを参照し、
      I/O 手続きを Markdown へ再実装しない」へ修正する。
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-001.md
    source_items: [AG-006]
    content: |
      REQ-001-001 の文書種別リストから課題追跡を除去する。REQ-001-015 の「課題追跡」を GitHub の
      追跡Issue（Issue 基盤の管理単位）へ読み替え、REQ-001-035 の「課題追跡系」を追跡Issue基盤へ
      読み替える。いずれも現行文書の本文で歴史を扱わないという一般原則の意味は維持する。
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-020.md
    source_items: [AG-001]
    content: |
      GitHub Issue を追跡Issueと Case Issue の共通管理単位とする現在の決定のみを記述する。docs/issue-list
      を採用した経緯、却下案の記録、移行前方式の説明を含めない。判断理由として、論理 role による
      追跡Issueと Case Issue の分離により作業単位との混線を解消すること、GitHub/ローカル I/O を
      Custom Tool 境界へ集約し外部依存を統制下に置くことを記述する。status は proposed を維持する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-issue-tracking.md
    target_area: "## 確定事項"
    source_items: [AG-001, AG-002, AG-007, AG-010]
    content: |
      docs/issue-list 課題ファイル形式の全記述（ISL ID 体系、frontmatter スキーマ、list.ts 到達機構、
      状態保存値、11操作の課題ファイル操作手順）を除去し、追跡Issueの論理スキーマ・状態遷移・本文標準
      構造・物理マッピング表（role/kind/状態とラベル・Issue Type・Field の対応）の一元所有へ置換する。
      確定事項には状態の三段写像（追跡Issue 6状態、GitHub open/closed、Tool close reason）、物理写像
      表の所有と Tool による機械適用の分担、コメント読み替えの role 分岐（ローカル版）、再評価・解決・
      反映追跡の意味論、GitHub メタデータへのマッピングを含める。物理的な GitHub/ローカル I/O 手順は
      所有しない。ADF-COVERS 宣言を再構成後の REQ-049 要件行へ再紐づけし、旧 REQ-049-001〜004 相当の
      implementation 宣言を補完する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/issue.md
    target_area: "# issue Design"
    source_items: [AG-003, AG-010]
    content: |
      課題ファイル（docs/issue-list/）操作入口の記述を除去し、GitHub 追跡Issueの自然言語操作入口として
      再構成する。操作種別（起票、検索・参照、更新、コメント追加、保留、再評価、実行準備完了、解決、
      反映確認、クローズ、再オープン）、GitHub 実装詳細のユーザー非要求、編集スコープを Tool 操作契約
      経由の追跡Issue操作へ限定するガードレール、実行確定時の要件化経路への引き継ぎを記述する。
      ADF-COVERS 宣言を再構成後の REQ-049 要件行へ再紐づけする。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-issue-management.md
    target_area: "# `agentdev-issue-management` Design"
    source_items: [AG-004, AG-008, AG-010]
    content: |
      GitHub Issue（Case Issue）操作専用の安全手続としての記述を、追跡Issueと Case Issue の双方から
      利用可能な Issue 操作安全性の共通能力へ整合する。agentdev-gh-cli スキルおよび gh --body-file 等
      の旧実装詳細への言及を Custom Tool agentdev_gh の操作契約経由へ更新する。Issue 操作の前後比較、
      リンク整合、Epic テーブル更新手順の安全性要求は維持する。case-open Design との連動（Case Issue
      本文の追跡Issue参照形式の定義は case-open Design 側）を明記する。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_area: "## 対象操作の境界（初期セット）"
    source_items: [AG-004, AG-005]
    content: |
      対象操作へ追跡Issue操作（issue_list、issue_read のメタデータ拡張、issue_update の labels 更新、
      issue_comment 読取、issue_reopen）を追加する。issue_read のメタデータ拡張は既存契約の変更として
      区別して記載する。ローカル版実装差し替えの読み替え先を .agentdev/issues/ のローカルIssue
      （role 条件付きスキーマ、単一採番空間）へ更新し、PR 系操作の対象が role: case のローカルIssueに
      限られること、物理写像（role/kind/状態とラベル等の対応）の機械適用が Tool 内実装であるが写像表の
      所有は agentdev-issue-tracking Design であることを記載する。ラベル・kind 値域の正は本 Design で
      定義せず agentdev-issue-tracking Design を参照する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/local/local-case-file.md
    target_area: "# ローカル Case ファイル"
    source_items: [AG-005]
    content: |
      ローカル Case ファイル Design をローカルIssue共通スキーマ Design へ再構成する。保存先を
      .agentdev/issues/issue-{NNNN}.md とし、単一採番空間（role 別採番なし）、共通メタデータ（role
      を含む）、role: tracking の条件付きスキーマ（追跡Issueスキーマ情報とコメント相当履歴）、role: case
      の条件付きスキーマ（既存 Case 実行情報、PR 相当セクション、マージ結果）、PR 系操作の role: case
      限定、role ごとの必須項目・状態値・許可操作の検証、PR 操作の対象解決（role: case の特定）、
      コメント読み替え先の role 分岐を定義する。role・kind・状態の意味論は agentdev-issue-tracking
      Design を正とし、本 Design は物理表現の写像に徹する。case-schema 機械可読定義の更新方針も含める。
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/foundations/document-model.md
    target_area: "### 課題追跡分類の追加（8分類への拡張）"
    source_items: [AG-006]
    content: |
      「課題追跡分類の追加（8分類への拡張）」節を除去し、文書7分類モデルへ戻す。GitHub の追跡Issueは
      docs/ 配下の文書種別ではなく管理単位・永続状態である旨を文書7分類モデル節へ補足する。
      冒頭の ADF-COVERS 宣言から REQ-049-005〜010、014 の参照を除去し、再構成後の REQ-049 要件行
      体系へ再紐づけする。

conflict_resolutions:
  - id: CR-001
    conflict: DEC-020 は docs/issue-list 方式採用の決定として記録済み。GitHub Issue 共通基盤への変更は
      Decision の意味変更か、proposed 段階での直接再構成か。
    resolution: |
      DEC-020 は status: proposed（未承認）であり、accepted Decision の意味的不変原則の適用対象外で
      あるため直接再構成とする（ユーザー合意、2026-08-25）。旧方式の採用経緯、却下案、移行前方式の
      説明は残さない。ただし新モデル（GitHub Issue 共通基盤）の判断理由そのものは Decision として
      記述する（Decision 成果物モデルの本質要素のため）。
  - id: CR-002
    conflict: 既存 .agentdev/cases/case-{NNNN}.md の実データを新 .agentdev/issues/ へ移行するか。
    resolution: |
      移行は対象外とする（本リポジトリに実データなし、RU 受け入れ条件は要求・Design・実装の除去のみを
      要求）。consumer 環境の既存データの扱いは利用者判断とし、対象外節へ明示する。
  - id: CR-003
    conflict: REQ-011-008 に旧スキル名（agentdev-gh-cli）参照が残存しており REQ-011-001 と齟齬する。
      本件で修正するか別 Case（DEC-022 実装）に委ねるか。
    resolution: |
      本件の REQ-011 更新に含めて修正する（ユーザー合意、2026-08-25）。REQ-011 を開くなら揃えるのが
      自然であり、受け入れ条件の旧表現残存検出の精神と合致する。
  - id: CR-004
    conflict: 追跡Issue操作の物理写像（role/kind/状態とラベル等の対応）を誰が解釈するか。Tool が論理値を
      受け取る場合は Tool に写像知識が必要となり Tool 非意味判断原則と緊張する。上位層が物理値へ解決する
      場合は各 workflow が写像を再実装するリスクがある。
    resolution: |
      写像表の所有は agentdev-issue-tracking Design に一元化し、論理値と物理値の変換（写像表の機械
      適用）は Tool 内実装として行う方針を要件で固定する（adversarial-review stream 2 の finding
      反映）。Tool は写像表の機械適用のみを行い写像の意味判断を新規に所有しない。上位層は論理値の
      まま Tool 操作契約を利用し、写像を再実装しない。

operation_units:
  - ou_id: OU-01
    source_ru: RU-20260824-01
    target_req: REQ-049
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: applied
      saved_docs: [REQ-049]
      note: "REQ-049 要件表を全面再構成（REQ-049-001〜019 の19行体系、旧 docs/issue-list 前提行を削除）。Design は design-save 工程（ACT-DESIGN-001/002/006）で保存"
  - ou_id: OU-02
    source_ru: RU-20260824-01
    target_req: REQ-009
    operation: update
    scale: standard
    depends_on: [OU-01]
    recommended_order: 2
    issue_policy: single
    result:
      status: applied
      saved_docs: [REQ-009]
      note: "REQ-009-026〜033 をローカルIssue前提へ書き換え、REQ-009-015/016/020/037 と目的節・適用範囲の agentdev-gh-cli 表現を Local 実装 Tool 表現へ更新。Design は design-save 工程（ACT-DESIGN-005）で保存"
  - ou_id: OU-03
    source_ru: RU-20260824-01
    target_req: REQ-011
    operation: update
    scale: standard
    depends_on: [OU-01]
    recommended_order: 2
    issue_policy: single
    result:
      status: applied
      saved_docs: [REQ-011]
      note: "REQ-011-008 を修正、REQ-011-022〜024 を追加（Tool 操作契約）。Design は design-save 工程（ACT-DESIGN-003/004）で保存"
      unclassified_lines: [REQ-011-022, REQ-011-023, REQ-011-024]
  - ou_id: OU-04
    source_ru: RU-20260824-01
    target_req: REQ-001
    operation: update
    scale: standard
    depends_on: [OU-01]
    recommended_order: 2
    issue_policy: single
    result:
      status: applied
      saved_docs: [REQ-001]
      note: "REQ-001-001 の文書種別リストから課題追跡を除去、REQ-001-015/035 を追跡Issue基盤へ読み替え（REQ-001-025 の同種参照も同一読み替えで整合）"
  - ou_id: OU-05
    source_ru: RU-20260824-01
    target_req: DEC-020
    operation: update
    scale: standard
    depends_on: [OU-01]
    recommended_order: 2
    issue_policy: single
    result:
      status: applied
      saved_docs: [DEC-020]
      note: "DEC-020 を proposed 段階での直接再構成（CR-001）。title を GitHub Issue 共通管理単位の採用へ変更"
  - ou_id: OU-06
    source_ru: RU-20260824-01
    operation: create
    scale: large
    depends_on: [OU-01, OU-02, OU-03, OU-04, OU-05]
    recommended_order: 3
    issue_policy: epic
    result: {}
  - ou_id: OU-07
    source_ru: RU-20260824-01
    operation: create
    scale: standard
    depends_on: [OU-06]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-08
    source_ru: RU-20260824-01
    operation: create
    scale: standard
    depends_on: [OU-06]
    recommended_order: 4
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      再構成後の REQ-049、agentdev-issue-tracking Design、DEC-020 を読み、role（tracking/case）の
      機械判定手段、kind と状態の6意味の定義、Issue 存在を実行許可としない規定、要件化経由の
      Case Issue 生成と関係追跡、Organization 固有機能の非必須化を確認する。
    pass_criteria: |
      上記5点が全て要件・Design へ規定されており、GitHub Issue Type / Fields なしのリポジトリでも
      最低限の追跡Issue機能がラベル・本文・状態で成立する記述があること。
    on_failure: |
      不足を要件・Design 本文へ反映して再検証する（fix-and-reverify）。
  - id: TS-002
    target_item: AG-002
    verification: |
      agentdev-issue-tracking Design に論理スキーマ一元管理の全要素（role、kind、状態遷移、保持情報、
      物理マッピング表、本文標準構造、状態三段写像）が定義されていることを確認する。他の Command /
      Skill / Template に同一のラベル名、kind、状態、本文フォーマットの独自定義がないことを grep で
      確認する。
    pass_criteria: |
      論理スキーマの正が agentdev-issue-tracking Design に一元化され、重複定義が検出されないこと。
      状態三段写像と物理写像表の Tool 機械適用分担が記述されていること。
    on_failure: |
      Design へ欠落要素を反映して再検証する（fix-and-reverify）。
  - id: TS-003
    target_item: AG-003
    verification: |
      /agentdev/issue コマンド定義と workflow-issue スキルが追跡Issueの自然言語操作入口として
      再設計されていること、GitHub 実装詳細（サブコマンド、ラベル名、Issue Type、Field 名）を
      ユーザーに要求しないこと、GitHub 版でリポジトリ内課題ファイルを作成・commit しないことを
      確認する。
    pass_criteria: |
      コマンド・スキル・テンプレートが新方式へ更新され、docs/issue-list 操作の残存がないこと。
    on_failure: |
      実装を修正して再検証する（fix-and-reverify）。
  - id: TS-004
    target_item: AG-004
    verification: |
      Custom Tool（通常版・ローカル版）の操作契約と contracts 実装に追跡Issue操作（一覧・検索、
      メタデータ拡張読取、labels 更新、コメント読取、reopen）が追加されていることを確認する。
      追加操作の単体テスト・統合テストを実行する。失敗時に成功を返さないことを確認する。
    pass_criteria: |
      GitHub 版とローカル版が同一の上位操作契約を提供し、関連テストが全て成功すること。
      WRITE 操作が Tool 内 VERIFY 完了後に成功を返すこと。
    on_failure: |
      実装を修正して再検証する（fix-and-reverify）。
  - id: TS-005
    target_item: AG-005
    verification: |
      ローカル版 Tool 実装が .agentdev/issues/issue-{NNNN}.md を単一採番空間・role 条件付きスキーマで
      読み書きすること、PR 系操作が role: case にのみ適用されること、上位 Command / Workflow /
      Skill が .agentdev/issues/ を直接読み書きしないことをコード検査とテストで確認する。
    pass_criteria: |
      role ごとの必須項目・状態値・許可操作の検証テストが成功し、直接操作箇所が検出されないこと。
    on_failure: |
      実装を修正して再検証する（fix-and-reverify）。
  - id: TS-006
    target_item: AG-006
    verification: |
      rg でリポジトリ全体（node_modules、.git 除外）を検索し、docs/issue-list、ISL-、
      .agentdev/cases/ を現行仕様として参照する記述、課題ファイルを docs/ 配下の文書種別として扱う
      記述、agentdev-gh-cli を現行 I/O 正規経路として参照する記述が残存していないことを確認する。
      履歴参照・廃止説明は対象外とする。
    pass_criteria: |
      現行仕様としての参照残存が 0 件であること。
    on_failure: |
      残存箇所を特定の上新方式へ合わせて修正し、再検証する（fix-and-reverify）。
  - id: TS-007
    target_item: AG-007
    verification: |
      新しい追跡Issue（GitHub Issue またはローカル版では .agentdev/issues/ の role: tracking）に
      ISL-001 の有効論点（未解決論点、68/97 同一 path 参照、REQ-048 関連、保留理由、再評価条件、
      再分析事項）が移されていることを確認する。新 Issue に ISL-001、docs/issue-list、初期実装の
      経緯が記録されていないことを確認する。
    pass_criteria: |
      有効論点が保持され、旧 ID・旧保存方式・経緯の記録がないこと。
    on_failure: |
      移行内容を修正して再検証する（fix-and-reverify）。
  - id: TS-008
    target_item: AG-008
    verification: |
      連動更新対象（README、command README、guides、検証対応要否カタログ、req-impact-map、
      workflow-contracts、glossary、consumer-project-setup、install-script-usability、
      runtime-package-boundary、.agentdev/README.md、decisions/README.md、成果物責任表、旧
      agentdev-gh-cli Design、scripts/README、src/opencode-local/README.md、issue テンプレート、
      intake-from-github の tracking 除外、backlog-artifact-lifecycle、case-open Design）が新 Issue
      モデルへ更新されていることを確認する。
    pass_criteria: |
      列挙対象全てで旧方式の現行参照が解消され、intake-from-github が role: tracking を抽出対象外と
      していること。
    on_failure: |
      更新漏れを修正して再検証する（fix-and-reverify）。
  - id: TS-009
    target_item: AG-009
    verification: |
      配布物実装（Tool、スキル、コマンド、テンプレート）の変更後、リポジトリ既定の整合性検査・
      トレーサビリティ検査・関連テスト一式を実行する。issue_tracking_list.test.ts が新方式の検証
      （ローカルIssue role 条件付きスキーマ、Tool 操作契約）へ置換されていることを確認する。
    pass_criteria: |
      検査・テストが全て成功し、今回の変更による新規不整合がないこと。
    on_failure: |
      実装を修正して再検証する（fix-and-reverify）。
  - id: TS-010
    target_item: AG-010
    verification: |
      トレーサビリティ検査（agentdev-traceability の check）を実行し、REQ-049 の要件行について
      missing-implementation、missing-verification が 0 であることを確認する。
    pass_criteria: |
      REQ-049 の全要件行に implementation・verification の対応が過不足なく存在すること。
    on_failure: |
      ADF-COVERS 宣言の再紐づけを修正して再検証する（fix-and-reverify）。

review_dispositions: []

case_open_hints:
  epic_needed: true
  decomposition: |
    Wave 1（docs 再構成、並行化可能）: OU-01（REQ-049 + issue-tracking/issue/issue-management Design）、
    OU-02（REQ-009 + local Design）、OU-03（REQ-011 + custom-tool-contracts Design）、
    OU-04（REQ-001 + document-model）、OU-05（DEC-020）。OU-02〜05 は OU-01 完着後並行可能。
    Wave 2（配布物実装）: OU-06（Custom Tool 通常版・ローカル版への追跡Issue操作追加、
    agentdev-issue-tracking / agentdev-workflow-issue スキル本体と /agentdev/issue コマンドの再設計、
    テンプレート更新、issue_tracking_list.test.ts の新方式検証への置換）。docs 再構成の完了を前提とする。
    Wave 3（除去と連動）: OU-07（docs/issue-list/ 削除、ISL-001 移行起票、intake inbox 2件削除、
    旧 scripts 除去）、OU-08（README、guides、カタログ、影響マップ、Design 群の連動更新、
    intake-from-github の tracking 除外、backlog-artifact-lifecycle、case-open Design）。
    実装 Wave を省略しないこと（受け入れ条件の実装系要件は Wave 2 で検証する）。
  wave_hints:
    - Wave 1: OU-01 → (OU-02, OU-03, OU-04, OU-05 並行)
    - Wave 2: OU-06（Wave 1 完了後）
    - Wave 3: OU-07, OU-08（Wave 2 完了後、並行可）
```

# summary

GitHub Issue を追跡Issueと Case Issue の共通管理単位へ拡張し、旧 docs/issue-list/ 課題ファイル方式と
ローカルモードの .agentdev/cases/ Case 専用保存を完全に置き換える要件ドラフト。
RU-20260824-01（session由来、agentdev_handoff: true、self-hosting のため通常要件として処理）を入力とし、
adversarial-review 2 stream（要件・成果物体系 / 責務境界・I/O契約）の審議結果を反映済み。
物理写像の解釈主体（CR-004）、実装 Wave の明示（AG-009）、ADF-COVERS 再紐づけ（AG-010）、
intake-from-github の tracking 除外（AG-008）が review 由来の主要な追加である。
