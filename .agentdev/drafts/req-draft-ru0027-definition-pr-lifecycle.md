---
draft_type: req_draft
topic_slug: ru0027-definition-pr-lifecycle
status: draft
created_at: 2026-09-17T01:30:00+09:00
source_rus:
  - RU-0027
---

# draft-data

```yaml
work_type: feature
scale: standard
summary: >-
  Definition PR / Definition Amendment PR を GitHub Draft PR ではない通常 Pull Request として
  定義し直し、agentdev_gh の pr_create から draft 入力を除去、pr_read に isDraft を追加して
  GitHub版/Local版の公開契約・schema・validator・契約テストを整合させる。case-ready は merge 前の
  isDraft 確認と isDraft: true 時の pr_merge 未実行・blocked 停止を所有し、現行規範・実行成果物の
  「Draft Definition PR」を「Definition PR」へ統一する（履歴成果物は書き換えない）。write guard と
  pr_merge の fail-closed、RU-0027 合意のブランチ命名（definition/issue-{N}、
  definition-amend/issue-{N}）は維持する。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      Definition PR / Definition Amendment PR は GitHub Draft PR ではなく通常 Pull Request として
      作成・受入・merge され、ADF の正規 lifecycle は GitHub Draft PR を状態として使用しない。
      外部変更・既存成果物・旧版由来の GitHub Draft PR は観測と停止の対象であり、自動復旧の対象と
      しない。Definition Amendment PR は名称を維持したまま通常 Pull Request として扱う。
  - id: AG-002
    content: >-
      agentdev_gh の pr_create は GitHub Draft PR を生成する draft 入力を公開契約（操作カタログ、
      操作スペックの実行時 validator、公開 Tool スキーマ、GitHub backend、Local backend）から除去する。
      契約外の draft フィールドを含む pr_create 要求は副作用発生前に入力契約違反
      （REQ-011-028 の一般則）として拒否し、問題フィールド（draft）を特定できる情報を返す。
  - id: AG-003
    content: >-
      agentdev_gh の pr_read の成功結果に Pull Request の Draft 状態を表す boolean（isDraft）を含める。
      GitHub backend は対象 Pull Request の実際の Draft 状態を isDraft に写像し、Local backend は
      GitHub Draft PR に相当する状態を持たないため isDraft: false を返す。GitHub版と Local版の公開
      入出力契約、Tool スキーマ、validator、runner、VERIFY、契約テストが相互に矛盾しないよう整合させる。
      Draft 状態は pr_read による観測対象であり、作成・更新操作での指定・変更の対象としない非対称契約
      として明示する。
  - id: AG-004
    content: >-
      case-open が Definition PR を、case-revise が Definition Amendment PR を作成する際、GitHub
      Draft PR を作成する指定・分岐・表現を持たない。作成は agentdev_gh の pr_create による通常
      Pull Request のみとする。
  - id: AG-005
    content: >-
      case-ready は Definition PR / Definition Amendment PR を merge する前に pr_read で対象
      Pull Request の isDraft を確認し、isDraft: true を検出した場合は pr_merge を呼び出さず blocked
      として停止する。blocked 理由には GitHub Draft PR が正規 lifecycle 外であり merge 不可である
      ことを識別可能な情報を含める。pr_ready 操作の追加、draft 解除の自動実行、raw gh WRITE による
      復旧は行わない。
  - id: AG-006
    content: >-
      現行の規範・実行成果物（REQ、Decision、Design、command、skill、reference、template）における
      「Draft Definition PR」を「Definition PR」に統一する。冪等検索、再開条件、入出力説明など同じ
      論理成果物を参照する現行記述も横断して整合させる。過去の RU、learning、intake、Issue、
      Pull Request 本文、過去の実行ログ、検証スナップショット等の履歴成果物は旧表現を含むことだけを
      理由に変更しない。
  - id: AG-007
    content: >-
      write guard による生 gh WRITE の拒否と pr_merge の fail-closed 動作を維持する。運用時の
      partial merge は行わず、merge 完結または blocked 停止のいずれかで扱う。
  - id: AG-008
    content: >-
      Definition 系ブランチの命名は Definition PR が definition/issue-{N}、Definition Amendment PR が
      definition-amend/issue-{N} とし、実装系ブランチ（feature/issue-{N}）との名前空間を区別する。
      命名規則は definition-readiness Design が正規所有する（RU-0027 合意の維持）。
  - id: AG-009
    content: >-
      正常系では Definition PR の作成（case-open / case-revise）から検査・merge（case-ready）までを
      agentdev_gh の正規操作のみで完結する。GitHub Draft 状態に関する追加操作を前提としない。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:ru0027-definition-pr-lifecycle
    source_items: [AG-001, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009]
    content: |
      ---
      id: REQ-085
      title: "Definition PR の状態契約（通常 Pull Request・ブランチ命名・用語・正規操作完結）"
      created: "2026-09-17"
      updated: "2026-09-17"
      ---

      ## 目的

      Definition PR と Definition Amendment PR の物理的・操作的契約（作成形態、ブランチ命名、用語、merge 完結経路）を正規所有し、GitHub Draft PR を ADF の正規 lifecycle から除外する。GitHub への WRITE を Custom Tool `agentdev_gh` に集約する構成（REQ-011、REQ-052、DEC-004）と、Definition 受入（REQ-061）、Definition 変更経路（REQ-062）と整合し、Definition PR の作成から merge 完結までを正規操作のみで閉じる。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-085-001 | Definition PR / Definition Amendment PR は通常の Pull Request として作成・受入・merge され、ADF の正規 lifecycle は GitHub Draft PR を状態として使用しないこと。外部変更・既存成果物・旧版由来の GitHub Draft PR は pr_read による観測と blocked 停止の対象であり、自動復旧の対象としないこと |
      | REQ-085-002 | Definition 系ブランチの命名（Definition PR: definition/issue-{N}、Definition Amendment PR: definition-amend/issue-{N}）は definition-readiness Design が正規所有し、実装系ブランチ（feature/issue-{N}）との名前空間の区別を維持すること |
      | REQ-085-003 | 対象成果物の現行名称は「Definition PR」「Definition Amendment PR」とし、「Draft Definition PR」を現行の状態名・成果物名として使用しないこと。過去の RU、learning、intake、Issue、Pull Request 本文、実行ログ等の履歴成果物の旧表現を書き換えないこと |
      | REQ-085-004 | Definition PR の作成から case-ready による merge 完結までを agentdev_gh の正規操作のみで閉じること。GitHub Draft PR の draft 解除（ready 化）操作を操作カタログへ追加しないこと |
      | REQ-085-005 | write guard による生 gh WRITE の拒否と pr_merge の fail-closed 動作を維持し、運用時の partial merge を行わないこと |
      | REQ-085-006 | 本 REQ は Definition PR の状態契約（作成形態、ブランチ命名、用語、正規操作完結）を所有し、Definition Package の構成、作成単位、実変更判定、忠実性・整合性・品質検査、Definition Amendment の意味論、merge 後の canonical Definition の扱いは対象外とすること |

      ## 適用範囲

      - **対象**: Definition PR / Definition Amendment PR の作成形態（通常 Pull Request）、Definition 系ブランチ命名の正規所有先、現行用語（Definition PR、Definition Amendment PR）、agentdev_gh 正規操作のみによる作成〜merge 完結、防衛動作（write guard、pr_merge の fail-closed、partial merge 禁止）の維持、履歴成果物の旧表現の保護
      - **対象外**: agentdev_gh の操作入出力契約の詳細（REQ-011、custom-tool-contracts Design）、case-open の Root Case 確立・Definition Package 生成・実変更判定の実行契約（REQ-030）、case-ready の Definition 受入・merge の実行契約（REQ-061）、case-revise の Definition Amendment PR 作成の実行契約（REQ-062）、Definition Package と冪等キーの構成（definition-readiness Design）
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-011.md
    target_area: 要件テーブル
    source_items: [AG-002, AG-003]
    content: |
      | REQ-011-031 | Pull Request 作成（pr_create）は公開入力契約に GitHub Draft PR を生成する入力（draft）を含まないこと。GitHub backend・Local backend・公開 Tool スキーマ・実行時 validator のいずれにも draft 入力が存在しないこと。契約外の draft フィールドを含む要求は REQ-011-028 の一般則に従い副作用発生前に入力契約違反として拒否されること |
      | REQ-011-032 | Pull Request 読取（pr_read）は成功結果に Pull Request の Draft 状態を表す boolean（isDraft）を含むこと。GitHub backend は対象 Pull Request の実際の Draft 状態を写像し、Local backend は false を返すこと。Draft 状態は読取による観測対象であり、作成・更新操作での指定・変更の対象としないこと |
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-030.md
    target_area: 要件テーブル（REQ-030-002、REQ-030-010）および目的・適用範囲本文
    source_items: [AG-001, AG-004, AG-006]
    content: |
      変更後要件行:

      | REQ-030-002 | case-open は canonical Definition に実変更がある場合のみ、Case 単位で一つの Definition PR（GitHub Draft PR ではない通常 Pull Request）を作成すること。canonical Definition に実変更がない場合は Definition PR を作成しないこと |
      | REQ-030-010 | case-open は再実行時、既存 Root Case および既存 Definition PR を再利用し、不足分だけを処理して重複生成しないこと |

      変更後本文行:

      - 目的節: 合意済み要件doc からの Root Case 確立、Definition Package の生成、canonical Definition に実変更がある場合の Definition PR 作成を扱う。
      - 適用範囲・対象節: 対象: case-open（Root Case 確立、REQ 番号埋め込み、Definition Package 生成、実変更時のみ Definition PR 作成、冪等再実行、自工程 deviation capture）
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-061.md
    target_area: 要件テーブル
    source_items: [AG-005]
    content: |
      | REQ-061-032 | case-ready は Definition PR / Definition Amendment PR を merge する前に agentdev_gh の pr_read で対象 Pull Request の Draft 状態（isDraft）を確認し、GitHub Draft PR を検出した場合は pr_merge を実行せず blocked として停止すること。blocked 理由には GitHub Draft PR が正規 lifecycle 外であり merge 不可であることを識別可能な情報を含め、draft 解除の自動実行や正規 Tool 外の操作による復旧を行わないこと |
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-061.md
    target_area: 目的節本文
    source_items: [AG-005, AG-006]
    content: |
      変更後本文行:

      - 目的節: Definition の受入（Definition PR の忠実性確認、merge 前の Draft 状態確認、自動確定・merge、HITL 停止）、canonical Definition の再取得、合意済み新規 Decision の accepted 遷移、execution contract と実行構造の確定（Standard / Epic 確定、Child Issue と Wave / 依存構造の作成を含む）、検証対応要否の最終ゲート、実行準備完了（ready 遷移）、draft / RU の削除を扱う。
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-029.md
    target_area: "## 結果、影響"
    source_items: [AG-001, AG-006]
    content: |
      公開コマンドは状態遷移単位で整理され、case-open は Root Case 確立に、case-ready は Definition 受入と実行準備完了に、それぞれ単一責務を持つ。Definition 変更がない Case では不要な保存工程や空の PR を作らない。GitHub backend と local backend は Definition の「未確定 → 確定」、Case の open → ready という同じ上位意味論を提供し、物理表現は backend Design が所有する。req-save / design-save / case-update の公開導線、テンプレート、Design、routing、README / glossary 参照は現行体系から除去され、deprecated alias を残さない。既存 DEC-010（3層分化）、DEC-020（GitHub Issue 共通管理単位）、DEC-008（bounded parent decision resolution）、DEC-003（req_draft ソフトコントラクト）、DEC-026（realization_actions）は維持され、本 Decision と補完的に機能する。

      注記（2026-09-17、REQ-085）: 本 Decision の決定時点では Definition Package を集約する Pull Request を「Draft Definition PR」と呼称した。現行では当該成果物の名称は「Definition PR」に統一され、GitHub Draft PR は ADF の正規 lifecycle で使用しない（Definition PR / Definition Amendment PR は通常 Pull Request として作成・merge される）。上位意味論（Definition の「未確定 → 確定」）と物理表現の backend Design 所有は本 Decision の決定どおり維持する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/workflows/definition-readiness.md
    target_design:
      operation: update
      domain: workflows
      slug: definition-readiness
    target_area: "## 目的"
    source_items: [AG-001, AG-006]
    content: |
      ## 目的

      Definition Package、Definition PR / Definition Amendment PR の lifecycle、canonical Definition の判定、冪等キー、backend 意味論の物理写像を定義する（REQ-030、REQ-061、REQ-062、REQ-085）。

      本 Design は ADF-COVERS 宣言を持たないため、REQ 対応の確定は PR 記録にもとづく REQ ファイル単位の近似判定（PR #2817 が REQ-061/REQ-005 対応を記録、Case #2806 closed）に基づく。2026-09-15 に REQ-032-025 の評価契約に従う棚卸し評価の結果、status を draft から accepted へ昇格した（RU-0015、Case #2848）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/workflows/definition-readiness.md
    target_design:
      operation: update
      domain: workflows
      slug: definition-readiness
    target_area: "## Definition PR lifecycle"
    source_items: [AG-001, AG-004, AG-005, AG-008, AG-009]
    content: |
      ## Definition PR lifecycle

      - Definition PR: canonical Definition に実変更がある場合のみ case-open が Case 単位で 1 件作成する。実変更のない Case（bugfix / maintenance / docs_chore 等、REQ-005-007 系）では作成しない
      - Definition Amendment PR: case-revise が再合議済みの実変更がある場合のみ作成する
      - 作成形態: Definition PR / Definition Amendment PR は GitHub Draft PR ではなく通常 Pull Request として作成する。ADF の正規 lifecycle は GitHub Draft PR を状態として使用せず、GitHub Draft PR を生成する入力は agentdev_gh の公開契約に存在しない（REQ-085-001、REQ-085-004、REQ-011-031）
      - ブランチ命名: Definition PR は definition/issue-{N}、Definition Amendment PR は definition-amend/issue-{N} を使用し、実装系 feature/issue-{N} と名前空間を区別する（REQ-085-002）
      - Draft 状態の検出: case-ready は merge 実行前に pr_read の isDraft で Draft 状態を確認する。isDraft: true の Definition PR / Definition Amendment PR は外部変更・既存成果物・旧版由来を含む正規 lifecycle 外の異常状態として pr_merge を実行せず blocked で停止する。draft 解除の自動実行、raw gh WRITE による復旧は行わない（REQ-061-032、REQ-085-001）
      - 確定: case-ready が忠実性・整合性・品質検査を確認し、新しい意味判断が不要な場合追加承認なしで merge する
      - merge 後: merge を巻き戻さず、canonical Definition を基準に再開する
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/workflows/definition-readiness.md
    target_design:
      operation: update
      domain: workflows
      slug: definition-readiness
    target_area: "## backend 意味論の物理写像"
    source_items: [AG-001, AG-003]
    content: |
      ## backend 意味論の物理写像

      - GitHub backend: Definition PR / Definition Amendment PR を通常 Pull Request として使用する。Pull Request の実際の Draft 状態は pr_read の isDraft に写像する（REQ-011-032）
      - local backend: Definition の「未確定 → 確定」を同等に表現する PR 相当状態（ローカルIssue のマージ結果セクション等への写像）、ファイル配置、内部写像は本 Design と local-case-file Design が所有する。GitHub Draft PR に相当する状態を持たないため pr_read の isDraft は false を返す。上位 command / workflow は物理表現を直接判別しない
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: "## 対象操作の境界（初期セット）"
    source_items: [AG-002, AG-003]
    content: |
      ## 対象操作の境界（初期セット）

      操作カタログを以下の16操作として定義する。

      - 基本操作: issue_create、issue_read、issue_update、issue_close、pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable、pr_update
      - 追跡Issue操作: issue_list、issue_reopen
      - Comment 操作: comment_create、comment_list、comment_update、comment_delete。Comment は Issue と Pull Request の会話コメントを同一の論理リソースとして扱う。comment_list の各要素は commentId、body、createdAt、updatedAt、url を返す。comment_update と comment_delete は commentId を対象識別子として使用する。commentId の公開型は文字列とし、GitHub 実装は数値コメント id を文字列化する
      - 廃止済み操作: issue_comment（body あり＝追加、body なし＝読取の二重モード）は正規操作カタログから除去済みであり、ADF 内部の呼出元は Comment 操作への移行が完了している。GitHub 版・Local 版のいずれの実装にも issue_comment は存在せず、廃止は確定している。外部 consumer 環境が更新前の runner を保持する間に旧 runner 側で issue_comment が動作し得るが、それは本 Design の操作契約の対象外である
      - pr_create の入力契約: Pull Request 作成は GitHub Draft PR を生成する入力（draft）を公開契約に含まない。契約外の draft フィールドを含む要求は副作用発生前に REQ-011-028 の入力契約違反として拒否する（REQ-011-031）。Draft 状態は pr_read による観測対象であり、作成・更新操作での指定・変更の対象としない
      - pr_read の拡張: 成功結果に Pull Request 本文（body）と Pull Request の Draft 状態を表す boolean（isDraft）を含む。GitHub backend は対象 Pull Request の実際の Draft 状態を isDraft に写像し、Local backend は false を返す（REQ-011-032）。本文の論理的な範囲はローカル版の物理写像（ローカルIssue共通スキーマ Design）に従い、読み取りと更新が round-trip 可能な同一の論理範囲（ローカル版ではマージ前確認・Design確定候補・Findings / Capture候補の3セクション群の直列化）とする
      - pr_update: title と body を対象とする項目単位の部分更新操作。指定されていない項目は保持し、更新後は読み戻しによって要求値の反映を確認する。ローカル版では Pull Request タイトルの正をマージ前確認セクション内の PR タイトル行とし、pr_update の title は同行を置換する
      - issue_update の部分更新不変条件: 変更を要求していない追跡Issue軸（role、kind、trackingState）を保持する。VERIFY の照合対象は追跡軸の完全一致と要求通常ラベルの包含とし、確認時点での第三者による通常ラベル追加を不変条件違反として失敗扱いにしない
      - issue_reopen の追跡Issue状態遷移: agentdev-issue-tracking Design が所有する再オープン遷移（クローズ済み→検討中）を Tool が状態ラベルの機械適用によって実現する。kind と通常ラベルを保持し、Case Issue には追跡状態遷移を適用しない。既に open の追跡Issueへの再オープンは要求的状態の確認をもって冪等に成功とする

      VERIFY 適用（READ / WRITE 分離）:
      - WRITE 操作（issue_create、issue_update、issue_close、issue_reopen、comment_create、comment_update、comment_delete、pr_create、pr_update、pr_merge）: 副作用そのものを読み戻し、要求した状態の反映と保持対象不変条件の維持を確認する。Comment WRITE は対象 Comment の存在・本文で判定し、Issue / Pull Request の open / closed 状態を成功証拠として使用しない
      - READ 操作（issue_read、issue_list、comment_list、pr_read、pr_changed_files、pr_mergeable）: 取得結果の構造と契約上必要な意味的整合性を確認する。時間変化し得る値（mergeable、isDraft 等）について連続読取の一致を要求せず、取得時点の状態を正規化して返す。pr_mergeable は単一読取の正規化結果を返し、直後の再読取との一致確認を行わない

      一覧完全性:
      - issue_list と comment_list は Tool 内部で必要なページをすべて取得し、完全一覧として返す。上位層は GitHub API のページングを指定しない
      - フィルタ可能な軸（state、labels 等）はサーバ側絞り込みクエリへ推送し、安全上限への到達可能性を低減する。上限値は本 Design のパラメータとして定義する
      - 安全上の上限によって完全取得できない場合は再試行可能な失敗（operation-failed）として扱い、不完全な一覧を完全な成功結果として返さない。呼出側の回避手順（期間分割等）は各 workflow 文書が定める

      失敗分類の判定規則:
      - 存在しない対象（Issue 番号、commentId、PR 番号）への操作は、入力が構造的に有効であれば operation-failed とする（存在性は入力妥当性ではない）
      - runner 実行時の外部操作失敗（gh / GitHub API の HTTP エラーを含む）は operation-failed に分類し、Tool / runner 自体の異常終了のみを enforcement-crashed に分類する
      - WRITE 実行後に読み戻し確認を完了できない場合は verification-incomplete とする

      GitHub版 / Local版等価性:
      - 両版は操作名、入力構造、出力構造（pr_read の isDraft を含む）、Comment 識別概念（commentId の役割と公開型）、Issue の論理状態遷移、READ / WRITE の成功意味、失敗の意味を同値とする
      - 物理写像に起因する値域差異（ローカル版追跡Issueの通常ラベル非許容。agentdev-issue-tracking Design の値域定義に従う）と、role: case の状態モデルに起因する受理条件差（ローカル版 case の再オープン拒否。ローカルIssue共通スキーマ Design の状態遷移に従う）、および Local 版が GitHub Draft PR に相当する状態を持たないことによる isDraft の値差異（Local 版は常に false。REQ-011-032）は、本 Design が例外として明示する

      操作カタログの完全列挙（16操作）は契約テストで固定し、対象外機能の追加を検出する。

      「third-party Skill 取得」操作契約:

      - 入力: third-party 宣言（skills.yaml）の対象 Skill 名（省略時は全件）、dry-run 指定
      - 出力: 取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況）
      - 保証: 取得結果の検証後に成功を返す。取得開始前に存在した正常な配置を取得失敗時に破壊しない。機構管理外の既存配置を無断で上書きしない
      - 失敗: 失敗を成功扱いとしない。部分取得状態を開始前状態へ解消し、失敗要因を報告する

      取得プロファイル（単一 SKILL.md URL 型・GitHub Skill ディレクトリ型の判定、正規化、再帰取得、相対構造保持、Skill ディレクトリ外非取得）の詳細は Design third-party-skill-management が所有する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 目的"
    source_items: [AG-006]
    content: |
      ## 目的

      合意済み要件doc をもとに Root Case（GitHub Issue）を確立し、Definition Package を生成して関連付ける。
      canonical Definition に実変更がある場合のみ Definition PR を作成する。
      壁打ち（req-define）→ Definition 受入準備（case-ready）の境界であり、execution contract の確定、Standard / Epic の最終確定、Child Issue / Wave の作成、RU 削除、proposed Decision の受理評価は case-ready 実行契約（REQ-061）が所有する。
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 出力"
    source_items: [AG-004, AG-006]
    content: |
      ## 出力

      - Root Case GitHub Issue（ラベル付き、対象 REQ 番号埋め込み、状態 open。REQ-030-001、REQ-030-009）
      - Definition Package（要件行、Decision、Design、Issue 構成案、受入条件一式を Case 単位で集約し Root Case に関連付ける。構成は definition-readiness Design。REQ-030-003）
      - Definition PR（canonical Definition に実変更がある場合のみ、Case 単位で 1 件。GitHub Draft PR ではない通常 Pull Request。REQ-030-002、REQ-085-001）
      - 完了報告（Root Case 完了報告テンプレート）
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 副作用"
    source_items: [AG-004, AG-006]
    content: |
      ## 副作用

      - GitHub I/O: Root Case 作成、Definition PR 作成（Custom Tool `agentdev_gh` 操作契約。Tool 内 VERIFY 付き）
      - deviation capture: case-open 実行中に実観測した deviation を agentdev-learning-capture skill または
        agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存する（REQ-030-011）。
        保存先は capture-boundaries.md の Split Rule に従う。
      - git 永続化: capture 成果物を明示パス指定（並列実行安全ステージング規律）で commit / push する。
      - 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節に含める。
      - 行わない副作用: draft / RU の削除（REQ-030-007。削除は case-ready が実行する）、Decision ファイルの status 変更（REQ-030-005）
  - id: ACT-DESIGN-008
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 現在の動作"
    source_items: [AG-006]
    content: |
      ## 現在の動作

      処理段階（外部から意味のある順序）。
      各段階の詳細手順は Workflow Skill（`agentdev-workflow-case-open`）が正規情報源である。

      - STEP-1 引き継ぎ判定（`agentdev_handoff: true` 検出時はリポジトリ種別に応じ継続または停止）
      - STEP-2 Root Case 確立（Root Case 本文候補生成、実行識別情報セクション付与、review_dispositions 転記、GitHub Issue 作成。状態 open、実装開始不許可）
      - STEP-3 Definition Package 生成・Root Case 関連付け（REQ-030-003）
      - STEP-4 実変更判定と Definition PR 作成（実変更時のみ、Case 単位 1 件。REQ-030-002）
      - STEP-5 冪等再実行確認（既存 Root Case・既存 Definition PR の再利用、重複生成禁止、不足分のみ処理。REQ-030-010）と横断依存検査（draft の artifact_actions と未クローズ Case 群の変更対象成果物の機械的比較、同一パス重複時の警告提示。REQ-030-012〜014）
      - STEP-6 deviation capture・完了報告（REQ-030-011）

      adversarial-review は Root Case 本文候補と Definition Package 構成案確定後、Root Case 作成前に挿入する（「adversarial-review 挿入境界（case-open）」セクション参照）。
  - id: ACT-DESIGN-009
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## Definition Package と冪等再実行（REQ-030-010）"
    source_items: [AG-001, AG-006]
    content: |
      ## Definition Package と冪等再実行（REQ-030-010）

      - Definition Package の構成、Definition PR / Definition Amendment PR の lifecycle、canonical Definition の判定、冪等キーは definition-readiness Design が正規所有する。
      - case-open は再実行時、既存 Root Case および既存 Definition PR を冪等キーで検出し、再利用する。重複生成しない（REQ-030-010）。
      - 不足分だけを処理する。Root Case が存在し Definition PR が存在しない場合は PR 生成のみを実行し、Root Case が存在しない場合は Root Case 確立から実行する。両者とも存在する場合は新規生成を行わない。
      - Definition PR は canonical Definition に実変更がある場合のみ作成する。canonical との差分が空の場合（bugfix / maintenance / docs_chore 等の実変更なし Case）は作成しない（REQ-030-002）。実変更判定が不能な場合は PR を作成せず停止し、判定不能の理由を報告する。

      ### 横断依存検査（STEP-5、REQ-030-012〜014）

      - STEP-5 冪等確認の実行時、draft の artifact_actions と未クローズ Case 群の変更対象成果物を機械的に比較し、2 以上の Case 間で同一パスが重複する場合、警告として投入者に提示する。共通契約は workflow-contracts Design「Case 投入時の横断依存検査契約」が正規所有する。
      - 検出源は draft の artifact_actions と未クローズ Case 群の宣言に限定し、合意済み宣言以外の一般的な変更影響探索・依存関係探索を行わない（REQ-021-014、REQ-030-013）。
      - Epic を構成する投入では同一投入内（Epic 配下 Wave 内）の重複検出を Wave 重複前置検出（REQ-035-012）へ委譲し、Epic をまたぐ Case 間の重複のみを検出対象とする（REQ-030-014）。
      - 警告は Root Case の確立を自動阻止せず、警告の提示記録を完了報告へ含める。
  - id: ACT-DESIGN-010
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 参照する横断 Design"
    source_items: [AG-006]
    content: |
      ## 参照する横断 Design

      - [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、主フロー構成）
      - [workflows/definition-readiness.md](../workflows/definition-readiness.md)（Definition Package 構成、Definition PR lifecycle、canonical Definition 判定、冪等キー）
      - [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Split Rule、自工程 deviation capture）
      - [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（Issue 本文品質検査）
  - id: ACT-DESIGN-011
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 対象外"
    source_items: [AG-006]
    content: |
      ## 対象外

      - execution contract の確定、Standard / Epic の最終確定、Child Issue・Wave の作成（case-ready: REQ-030-008）
      - draft / RU の削除（case-ready: REQ-030-007）
      - proposed Decision の受理評価と accepted 遷移（case-ready: REQ-030-005）
      - 検証対応要否の最終ゲート（case-ready）
      - 機能要件、非機能要件、制約、対象外、受け入れ条件の新規作成（REQ-030-004）
      - Root Case 確立後の実装開始（状態 open、REQ-030-009）
      - Definition Amendment PR の作成（case-revise の責務）
      - GitHub I/O の Tool 操作契約（Custom Tool `agentdev_gh`）経由の省略。Root Case 作成、Definition PR 作成は Tool 操作契約経由で行い、Tool 内 VERIFY を迂回する直接実行を行わないこと
      - Root Case 本文、PR 本文の文字列変数での持ち回り、親エージェントによる本文再構成の禁止
      - スイープ操作（`git add -A` / `git add .` / `git commit -a` / `git checkout .` / `git reset --hard` / `git stash` 等）の実行（v2:REQ-0137-001）
      - 明示パス指定以外のステージ、コミット（v2:REQ-0137-002/005）
      - intake / learning capture パイプライン自体の操作（保存は agentdev-learning-capture / agentdev-intake-pipeline 委譲内で行い、case-open 自身は直接変更しない）
  - id: ACT-DESIGN-012
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 検証観点"
    source_items: [AG-006]
    content: |
      ## 検証観点

      - テンプレート必須セクション完備確認（Root Case 本文テンプレートの `<!-- 【必須】 -->` セクション）
      - Root Case 本文への対象 REQ 番号埋め込み確認（REQ-030-001）
      - Root Case 状態 open の確認と実装開始不許可の確認（REQ-030-009）
      - Definition PR の Case 単位 1 件制約と実変更なし Case での不作成確認（REQ-030-002）
      - 再実行時の重複生成なし確認（REQ-030-010）
      - 出力制約: Issue 本文、PR 本文、commit message は verbatim で返す。「verbatim」とは LF・空行・インデントを含む行構造を byte 単位で保持することを指し、文字列の正規化、改行圧縮、空白挿入・削除をすべて禁止する。委譲接続点（Root Case 本文生成、PR 本文生成）と最終 gh CLI 渡し（Issue 作成、PR 作成）の双方に適用する。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す
      - deviation capture の Split Rule 分類と保存結果の完了報告記載確認（REQ-030-011）
  - id: ACT-DESIGN-013
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 停止状態"
    source_items: [AG-006]
    content: |
      ## 停止状態

      - 要件が曖昧で Root Case を確立できない場合（REQ-030-006）。
      - `auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo外操作、停止理由が残る場合。
      - 前工程からの引き継ぎ停止判定（`agentdev_handoff: true`、consumer リポジトリ）検出時（Root Case を作成せず停止する）。
      - adversarial-review 審議で unresolved なユーザー判断事項が残る場合（Root Case 作成へ進まない）。
      - canonical Definition との実変更判定が不能な場合（Definition PR を作成せず停止し、判定不能の理由を報告する）。
  - id: ACT-DESIGN-014
    artifact: design
    operation: update
    target: docs/designs/commands/case-ready.md
    target_design:
      operation: update
      domain: commands
      slug: case-ready
    target_area: "## 公開 interface"
    source_items: [AG-006]
    content: |
      ## 公開 interface

      - 入力: Root Case（Issue 番号または URL）、関連する req_draft（存在する場合）、Definition PR（存在する場合）
      - 出力: ready 状態の Root Case、確定済み execution contract、実行構造（Standard は Root Case 単一 execution unit、Epic は Child Issue と Wave / 依存構造）
      - 副作用: Definition PR の merge、REQ / Decision / Design の保存（Capability Skill 委譲）、Decision の accepted 遷移、Child Issue / Wave の作成、draft / RU の削除、Root Case の ready 遷移
  - id: ACT-DESIGN-015
    artifact: design
    operation: update
    target: docs/designs/commands/case-ready.md
    target_design:
      operation: update
      domain: commands
      slug: case-ready
    target_area: "## 内部構成"
    source_items: [AG-005, AG-006]
    content: |
      ## 内部構成

      - Definition 受入: Definition PR の忠実性確認（req-define 合意内容との投影検査）、整合性検査、品質検査、merge 前の Draft 状態確認（pr_read の isDraft、REQ-061-032）。新しい意味判断が不要な場合は追加承認なしで自動確定・merge。新しい Decision、意味変更、対象範囲拡大、意味的不整合の解消が必要な場合は停止し HITL とする
      - 保存実体: REQ / Decision / Design の保存は req-file-manager、decision-file-manager、design-file-manager、artifact-validation へ委譲する。case-ready 自身は保存手続きを実装しない
      - canonical 再取得: merge 後に canonical Definition を再取得し、以降の処理基準とする
      - 実行構造確定: 連結成分、3軸判断、単独根の Standard 化、上限遵守、構成検証、Wave ファイル重複前置検出（詳細は epic-wave-model Design）
      - 検証対応要否ゲート: 未分類行残存時は ready へ遷移させない。横断依存検査（canonical Definition と未クローズ Case 群の同一パス重複・共有領域未登録行重複需要の検出、警告+HITL 3選択肢、警告は ready 遷移判定を変更しない。REQ-061-029〜031）
      - クリーンアップ: 成功後に draft / RU を削除する（blocked / failed / 中断時は保持）
  - id: ACT-DESIGN-016
    artifact: design
    operation: update
    target: docs/designs/commands/case-ready.md
    target_design:
      operation: update
      domain: commands
      slug: case-ready
    target_area: "## 停止条件"
    source_items: [AG-005]
    content: |
      ## 停止条件

      - 対象 Definition PR が GitHub Draft PR（isDraft: true）の場合（pr_merge を実行せず blocked で停止。draft 解除の自動実行や正規 Tool 外の操作による復旧は行わない。REQ-061-032）
      - Definition PR の CI / 品質検査失敗（ready 不遷移、既存 PR 保持で再実行可能）
      - 新しい意味判断が必要（HITL）
      - 構成検証の上限超過または構成不備
      - proposed Decision の受理が一意に確定できない（proposed のまま ready 不遷移）
  - id: ACT-DESIGN-017
    artifact: design
    operation: update
    target: docs/designs/foundations/system.md
    target_design:
      operation: update
      domain: foundations
      slug: system
    target_area: "### `/agentdev/case-ready`"
    source_items: [AG-005, AG-006]
    content: |
      ### `/agentdev/case-ready`

      - **公開契約**: Root Case（Issue 番号または URL）+ 関連 req_draft / Definition PR → ready 状態の Root Case + 確定済み execution contract + 実行構造（Standard は Root Case 単一 execution unit、Epic は Child Issue と Wave / 依存構造）。Definition 確定境界の主フローコマンド（REQ-061）。
      - **主要処理段階**: Definition 受入（Definition PR の忠実性確認、整合性・品質検査、merge 前 Draft 状態確認（isDraft）、自動確定・merge と HITL 停止の分岐）→ REQ/Decision/Design 保存（Definition 保存 / Design 保存内部責務、Capability Skill 委譲）→ canonical Definition 再取得 → proposed Decision の受理評価と accepted 遷移 → execution contract 確定 → 実行構造確定（連結成分、3軸判断、単独根の Standard 化、構成検証、Wave ファイル重複前置検出）→ 検証対応要否ゲート → draft / RU 削除 → ready 遷移。
      - **分岐**: 新しい意味判断が不要（自動確定・merge）vs 必要（HITL 停止）、proposed Decision の受理可否（一意確定 vs HITL）、Standard vs Epic 構成、構成検証の上限超過・構成不備で停止。
      - **副作用**: Definition PR の merge、`docs/requirements/**` / `docs/decisions/**` / `docs/designs/**` の保存（Capability Skill 委譲）、Decision の accepted 遷移、Child Issue / Wave 作成、draft / RU 削除、Root Case の ready 遷移。
      - **HITL**: 新しい Decision、意味変更、対象範囲拡大、意味的不整合の解消が必要な場合の停止、proposed Decision の受理が一意に確定できない場合の停止、構成検証失敗時の停止。
      - **並列性**: 実行構造確定の構成アルゴリズムは決定的。Epic 構成時の Child Issue 作成は構成確定後の一括作成。
      - **resume**: merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造、Decision 受理記録を再利用し不足分のみ処理（べき等）。merge は巻き戻さない（REQ-061-004）。
      - **durable state**: canonical Definition（merge 済み REQ/Decision/Design）、execution contract（Issue 本文）、実行構造（Child Issue / Wave / 依存構造）、Decision 受理記録。
      - **Harness依存**: bash による決定的スクリプト呼出、拡張読込。
      - **Capability依存**: `agentdev-req-file-manager`、`agentdev-decision-file-manager`、`agentdev-design-file-manager`、`agentdev-artifact-validation`、`agentdev-quality-gates`、`agentdev-project-extensions`。
      - **内部workflow候補**: Definition 受入workflow（忠実性確認 + 自動確定境界）、実行構造確定workflow（連結成分 + 3軸判断、epic-wave-model Design 参照）。
  - id: ACT-DESIGN-018
    artifact: design
    operation: update
    target: docs/designs/foundations/references/verification-scope-catalog.md
    target_design:
      operation: update
      domain: foundations
      slug: verification-scope-catalog
    target_area: "### REQ-030（case-open 実行契約）"
    source_items: [AG-006]
    content: |
      ### REQ-030（case-open 実行契約）

      - REQ-030-001..REQ-030-014: Root Case 確立と対象 REQ 番号埋め込み、Definition PR 作成、Definition Package 生成と Root Case 関連付け、合意済み入力の反映、冪等再実行、deviation capture、STEP-5 冪等確認での横断依存検査（draft の artifact_actions と未クローズ Case 群の機械的比較、同一パス重複時の警告提示、検出源の限定、Epic 経路の Wave 重複前置検出への委譲境界）の実行時振る舞い
  - id: ACT-DESIGN-019
    artifact: design
    operation: update
    target: docs/designs/README.md
    target_design:
      operation: update
      domain: README
      slug: README
    target_area: "## 横断 Design 一覧（`designs/workflows/`）"
    source_items: [AG-006]
    content: |
      ## 横断 Design 一覧（`designs/workflows/`）

      | Design | status | タイトル | 責務 |
      |------|--------|---------|------|
      | [workflows/workflow-contracts.md](workflows/workflow-contracts.md) | accepted | ワークフロー契約（横断） | パイプライン概要、共通フェーズ、SSoT 遷移、実装分類、case-auto と case-run の委譲モデル、result 4状態契約 |
      | [workflows/workflow-skill-model.md](workflows/workflow-skill-model.md) | accepted | Workflow Skill Model | Command / Workflow Skill / Capability Skill の責務、依存方向、1:N分割基準、配置契約。DEC-010 実装詳細 |
      | [workflows/step-reference-contract.md](workflows/step-reference-contract.md) | accepted | STEP Reference Contract | STEP reference 構造、開始条件、結果、証拠、完了確認、べき等性。DEC-011 実装詳細 |
      | [workflows/input-resolution-and-durable-state.md](workflows/input-resolution-and-durable-state.md) | accepted | Input Resolution and Durable State | 入力解決優先順位、永続状態、current STEP 再構成、並列child task 復元。DEC-011 入力解決・永続状態側面 |
      | [workflows/delegation-contracts.md](workflows/delegation-contracts.md) | accepted | サブエージェント委譲契約 | 委譲時最小契約、委譲種別、制約、manager-orchestrator 分離 |
      | [workflows/capture-boundaries.md](workflows/capture-boundaries.md) | accepted | キャプチャ境界 | intake / learning 境界、Split Rule、PR 本文永続チャネル |
      | [workflows/epic-wave-model.md](workflows/epic-wave-model.md) | accepted | Epic / Wave / Issue 実行モデル | OU 階層、子Issue 状態 enum、Wave スケジューリング、execution_unit 構成契約、orchestration stage モデル、per-Epic 単一書き手 |
      | [workflows/definition-readiness.md](workflows/definition-readiness.md) | accepted | Definition Readiness | Definition Package、Definition PR / Definition Amendment PR の lifecycle（通常 Pull Request、merge 前 isDraft 確認を含む）、canonical Definition 判定、冪等キー、backend 意味論の物理写像 |
      | [workflows/backlog-artifact-lifecycle.md](workflows/backlog-artifact-lifecycle.md) | accepted | RU / 採用済み成果物 / draft lifecycle | artifact lifecycle、検出事項プロトコル、artifact_actions 工程分岐 |
      | [workflows/references/execution-unit-construction.md](workflows/references/execution-unit-construction.md) | accepted | execution_unit 構成アルゴリズム参照 | epic-wave-model.md から参照される連結成分アルゴリズム、3軸判断モデルの機械的判定手順 |
  - id: ACT-DESIGN-020
    artifact: design
    operation: update
    target: docs/designs/foundations/references/verification-scope-catalog.md
    target_design:
      operation: update
      domain: foundations
      slug: verification-scope-catalog
    target_area: "### REQ-011（I/O境界と外部連携手段）"
    source_items: [AG-002, AG-003]
    content: |
      ### REQ-011（I/O境界と外部連携手段）

      - REQ-011-001: gh-cli の境界確立宣言
      - REQ-011-003..REQ-011-007: I/O 手続きと検証 (VERIFY) の実行時振る舞い、ローカル版読替
      - REQ-011-009..REQ-011-013: backend 差し替え可能性、外部実行委譲、環境依存性緩和の設計原則と実行時手続き
      - REQ-011-015..REQ-011-019: 委譲形式の維持、新規 command の前提、外部実行境界と harness 実行機構・状態機構の所有区分宣言
      - REQ-011-020..REQ-011-021: Tool の非担当範囲（本文生成等の意味判断）、Hook による迂回防止適用の実行時振る舞い
      - REQ-011-022..REQ-011-024: 追跡Issue操作の Tool 操作契約提供、追加・変更操作の Tool 内 VERIFY 完了後成功返却と読み取り操作の応答自己整合、GitHub 版とローカル版の同一上位操作契約提供の実行時振る舞いと契約宣言
      - REQ-011-025..REQ-011-032: Issue 更新の追跡軸保持、再オープンの追跡状態遷移機械適用、一覧完全性（黙示切断禁止）、操作単位の入力契約（副作用発生前拒否）、失敗分類の区別、pr_read body と pr_update 部分更新、pr_create の draft 入力不在（契約外フィールド拒否）、pr_read の isDraft 写像（GitHub版は実状態、Local版は false 固定）の実行時振る舞い。Tool 実装の回帰テスト（Case Issue のテスト戦略）で検証
  - id: ACT-DESIGN-021
    artifact: design
    operation: update
    target: docs/designs/foundations/references/verification-scope-catalog.md
    target_design:
      operation: update
      domain: foundations
      slug: verification-scope-catalog
    target_area: "### REQ-061（case-ready 実行契約）"
    source_items: [AG-005]
    content: |
      ### REQ-061（case-ready 実行契約）

      - REQ-061-029..REQ-061-032: case-ready 検証対応要否ゲートでの横断依存検査（canonical Definition と未クローズ Case 群の同一パス重複・共有領域未登録行重複需要の検出、未分類行残存警告との同時提示と HITL 3 選択肢、警告の ready 遷移非影響、Epic 経路の Wave 内重複前置検出への委譲）、および merge 前 Draft 状態確認（pr_read の isDraft、GitHub Draft PR 検出時の pr_merge 未実行・blocked 停止、復旧操作なし）の実行時振る舞い。REQ-061-001..REQ-061-028 は検証対応宣言済みのため本カタログへ登録しない。恒続的な検証手段（検出条件 (b) の fixture 回帰テスト、TS-002 / TS-003、RA-002 の bun test 基盤）は実現 Case 側の整備候補として検証対応宣言の配置先であり、整備までの間は安全側の任意行として本カタログへ登録した
  - id: ACT-DESIGN-022
    artifact: design
    operation: append
    target: docs/designs/foundations/references/verification-scope-catalog.md
    target_design:
      operation: append
      domain: foundations
      slug: verification-scope-catalog
    target_area: "### REQ-082（対論型レビュー審議契約）"
    placement: tail
    source_items: [AG-001, AG-006, AG-007, AG-008, AG-009]
    content: |
      ### REQ-083（Definition PR の状態契約）

      - REQ-083-001..REQ-083-006: Definition PR / Definition Amendment PR の状態契約（通常 Pull Request 原則と外部由来 GitHub Draft PR の観測・blocked 停止扱い、definition/issue-{N}・definition-amend/issue-{N} ブランチ命名の Design 正規所有、「Definition PR」用語統一と履歴成果物の旧表現保護、agentdev_gh 正規操作のみによる作成から merge 完結、write guard・pr_merge fail-closed・partial merge 禁止の維持、状態契約以外の対象外宣言）の実行時振る舞い。REQ / Design / workflow reference の契約照合と Case Issue のテスト戦略（TS-001〜014）で検証
conflict_resolutions:
  - id: CR-001
    conflict: >-
      本トピックの 2026-09-16T12:35 時点の旧ドラフト解決（case-open が draft: false を統一指定し、
      draft 検出経路は抽象的にのみ定義）と、2026-09-16T22:13 のセッション再合意（pr_create から
      draft 入力自体を除去し、pr_read の isDraft による具体的観測契約と case-ready の blocked 停止を
      確定）が競合した。旧解決は Tool が GitHub Draft PR を生成できる非閉包な操作契約を残すため、
      再合意が優先する。
    resolution: >-
      再合意（AG-001〜009）で旧ドラフトの REQ-085 計画を全面的に置き換える。旧ドラフトは case-open
      未消費（オープン Case なし、docs/requirements に REQ-085 不在）のため丸ごと書き換えが可能。
      ブランチ命名（AG-008）は再合意が触れておらず RU-0027 合意として維持する。出典:
      session:2026-09-16-definition-pr-draft-state-contract（2026-09-16T22:13+09:00）。
  - id: CR-002
    conflict: REQ-085 の番号は CREATE 用予約枠（REQ-083〜096）による擬似採番である。
    resolution: >-
      共有予約枠から RU-0027 トピックに REQ-085 を割当てた旧ドラフトの方針を維持する。docs/requirements
      の実在最大は REQ-082 であり REQ-085 は未作成。case-open の決定的採番が実際の採番を行うため、
      REQ-085 は仮番号として扱い、採番結果が異なる場合は採番を正とする。
  - id: CR-003
    conflict: >-
      DEC-029 の決定本文が「Draft Definition PR」という用語を含み、Decision は過去の判断記録である
      一方、受け入れ条件は現行の規範・実行仕様から「Draft Definition PR」を除去することを求める。
    resolution: >-
      決定記録本文は書き換えず、DEC-004 の時付注記の前例方式に従い DEC-029「結果、影響」節へ
      注記（2026-09-17、REQ-085）を追記して現行読解との接続を明示する（ACT-DEC-001）。
      REQ-059-003 の未宣言検出は related_reqs 宣言の有無に基づくため、宣言を保持する DEC-029 では
      誤発火しない。注記は接続情報であり DEC-029 の判断内容を構成しないため、related_reqs への
      REQ-085 追加は行わない。
  - id: CR-004
    conflict: >-
      アーキテクチャ助言は REQ-062-003/005 の行更新を必須としたが、実ファイル照合では当該行に
      「Draft Definition PR」表現は存在しない（REQ-062 の用語出現は 0件）。
    resolution: >-
      REQ-062 の変更は不要とする。Amendment PR の通常 Pull Request 原則は REQ-085-001 が横断所有し、
      case-revise の reference にも draft 指定・分岐が現状存在しないため、REQ-062 への重複行は
      DUPLICATE リスクのみを生む。
  - id: CR-005
    conflict: case-ready の isDraft 事前確認義務の配置として REQ-061（実行契約）と REQ-085（lifecycle 契約）の両方が候補になった。
    resolution: >-
      義務（merge 前確認・blocked 停止）は REQ-061-032 へ、不変条件（通常 PR 原則・異常状態の定義）は
      REQ-085-001 へ住み分ける（アーキテクチャ助言の確定事項を採用）。両方に義務を書かない。
  - id: CR-006
    conflict: >-
      case-ready 検証対応要否ゲート（Root Case #2898、Definition merge 243621e4 後）で REQ-083-001〜006
      （決定的採番後の REQ-085 相当行）が未分類行として検出された。新規 REQ CREATE に伴う
      verification-scope-catalog への当該 REQ 節（任意行エントリ）登録が、req-define 合意時点の
      artifact_actions に含まれていなかった（REQ-082 等の新規 REQ CREATE と同型の登録が必要）。
    resolution: >-
      case-auto の bounded parent decision resolution により先行整備として本 Case の Definition 変更へ
      含める（ACT-DESIGN-022）。登録内容は合意済み test_strategy（TS-001〜014）と agreed_items
      （AG-001〜009）の機械的記述であり、新しい意味判断・上位合意矛盾を含まない。REQ-011/REQ-061
      範囲行更新（ACT-DESIGN-020/021）と同一の catalog への追従完了として位置づける。
operation_units:
  - ou_id: OU-001
    source_ru: RU-0027
    target_req: REQ-085
    target_design: docs/designs/workflows/definition-readiness.md
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: >-
      agentdev_gh の公開操作契約を構成する全要素（contracts.ts の操作カタログと要求型、specs-pr.ts の
      prCreateSpec 許容フィールド、plugins/agentdev-gh-tool/plugin.ts の公開 Tool スキーマ、
      custom-tool-contracts Design の操作境界記述）を照合し、pr_create に draft 入力が存在しないことを
      確認する。
    pass_criteria: >-
      GitHub backend・Local backend・公開 Tool スキーマ・実行時 validator・Design 記述のいずれにも
      pr_create の draft 入力が存在しない。
    on_failure: >-
      fix-and-reverify を選択する。残存箇所を除去し、同じ照合を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: >-
      pr_create に契約外の draft フィールドを渡した要求が副作用発前に REQ-011-029 の入力契約違反
      として拒否され、問題フィールド（draft）を特定できる情報を返すことを契約テストで検証する。
    pass_criteria: >-
      拒否が副作用発前にあり、失敗分類が REQ-011-029 の入力契約違反（実装の invalid-field エラー）で、
      フィールド特定情報に draft が含まれる。
    on_failure: >-
      fix-and-reverify を選択する。入力契約の検証順序とエラー情報を修正し、再検証する。
  - id: TS-003
    target_item: AG-003
    verification: >-
      GitHub backend の pr_read について、通常 Pull Request では isDraft: false、GitHub Draft PR では
      isDraft: true が返ることを runner テスト（gh pr view の --json isDraft 写像を含む）で検証する。
    pass_criteria: 両ケースの写像が確認でき、Draft PR で HTTP 405 到達前に状態を観測できる。
    on_failure: fix-and-reverify を選択する。写像を修正し、再検証する。
  - id: TS-004
    target_item: AG-003
    verification: Local backend の pr_read が GitHub Draft PR に相当する状態を持たず isDraft: false を返すことを runner-local テストで検証する。
    pass_criteria: Local 版 pr_read の成功結果に isDraft があり、値が false で固定される。
    on_failure: fix-and-reverify を選択する。Local 版の結果組立を修正し、再検証する。
  - id: TS-005
    target_item: AG-003
    verification: >-
      GitHub版と Local版について、isDraft 追加を含む公開入出力契約（contracts.ts）、Tool スキーマ、
      validator、runner、VERIFY、契約テスト（contracts.test.ts、runner-cli.test.ts、
      engine-fail-closed.test.ts、runner-local.test.ts、plugin.test.ts）が相互に矛盾しないことを照合する。
    pass_criteria: 両版の契約テストが全て pass し、スキーマと validator の受理集合に矛盾がない。
    on_failure: fix-and-reverify を選択する。不整合箇所を修正し、再検証する。
  - id: TS-006
    target_item: AG-004
    verification: >-
      case-open の definition-pr-and-idempotency.md と case-revise の definition-revision.md を読み、
      Definition PR / Definition Amendment PR の作成経路に GitHub Draft PR を作成する指定・分岐・表現が
      存在しないことを確認する。
    pass_criteria: 両 reference とも pr_create による通常 Pull Request 作成のみが記述され、draft 指定が存在しない。
    on_failure: fix-and-reverify を選択する。draft 関連記述を除去し、再確認する。
  - id: TS-007
    target_item: AG-005
    verification: >-
      case-ready の definition-acceptance.md について、isDraft: false の正常 merge 経路と isDraft: true の
      経路（pr_merge 未実行・blocked 停止）を個別に検証する。
    pass_criteria: >-
      isDraft 確認が merge 実行前に位置し、isDraft: true 時は pr_merge が呼ばれず、blocked 理由に
      「GitHub Draft PR が正規 lifecycle 外であり merge 不可」であることを識別可能な情報が含まれる。
    on_failure: fix-and-reverify を選択する。受入手順を修正し、再検証する。
  - id: TS-008
    target_item: AG-005
    verification: >-
      isDraft: true による blocked 時の挙動について、pr_ready 相当操作の不在、draft 解除の自動実行の
      不在、raw gh WRITE の不使用（write guard による拒否維持）を確認する。
    pass_criteria: 復旧操作が契約・手順のいずれにも存在せず、操作カタログに draft 解除操作が追加されていない。
    on_failure: fix-and-reverify を選択する。復旧経路を除去し、再確認する。
  - id: TS-009
    target_item: AG-006
    verification: >-
      docs/（REQ、Decision、Design、README 索引）と src/opencode/**（command、skill、reference、
      template）を横断検索し、「Draft Definition PR」の残存が履歴成果物（.agentdev/**、過去実行の
      snapshot fixture）に限定されていることを確認する。DEC-029 の決定本文は CR-003 のとおり時付注記
      （ACT-DEC-001）で現行読解と接続するため、決定本文の旧表現を残存例外として扱う。
    pass_criteria: 現行の規範・実行成果物に「Draft Definition PR」が 0件である（.opencode/** は src/opencode/** のジャンクション投影として同一結果。CR-003 のとおり時付注記で現行読解と接続済みの DEC-029 決定本文を除く）。
    on_failure: fix-and-reverify を選択する。残存箇所を「Definition PR」へ置換し、再検査する（DEC-029 決定本文は置換対象外）。
  - id: TS-010
    target_item: AG-007
    verification: >-
      agentdev-gh-write-guard の検出器・fail-closed テストと agentdev_gh の pr_merge fail-closed
      テストが、本変更後も変更なしで pass することを確認する。
    pass_criteria: write guard と pr_merge の既存防衛テストが全て pass する。
    on_failure: fix-and-reverify を選択する。本変更が防衛動作に影響した箇所を特定・修正し、再実行する。
  - id: TS-011
    target_item: AG-008
    verification: definition-readiness Design の Definition PR lifecycle 節と agentdev-git-worktree のブランチ派生記述を読み、definition/issue-{N}、definition-amend/issue-{N}、feature/issue-{N} の区別が維持されていることを確認する。
    pass_criteria: 両命名と実装系ブランチとの名前空間区別が Design に正規所有されている。
    on_failure: fix-and-reverify を選択する。Design の記述を修正して再確認する。
  - id: TS-012
    target_item: AG-009
    verification: >-
      Definition PR の作成（case-open / case-revise の pr_create）から検査・merge（case-ready の
      pr_read・pr_merge）までの経路を、agentdev_gh の正規操作のみで説明できることを workflow 文書群で
      照合する。
    pass_criteria: GitHub Draft 状態に関する追加操作を前提とせず、正規操作のみで経路が閉じている。
    on_failure: fix-and-reverify を選択する。正規操作外の依存を除去し、再検証する。
  - id: TS-013
    target_item: AG-006
    verification: >-
      履歴成果物（RU-0027、.agentdev/learning/**、.agentdev/intake/**、過去 Issue・PR 本文、
      scripts/self/case-intake-cross-inspection/fixtures/ 配下の過去実行 snapshot）が旧表現
      「Draft Definition PR」を含むことだけを理由に変更されていないことを確認する。
    pass_criteria: 履歴成果物の変更が 0件である。
    on_failure: fix-and-reverify を選択する。意図しない変更を検出した場合は変更を戻し、再確認する。
  - id: TS-014
    target_item: AG-001
    verification: >-
      REQ-085-001（通常 Pull Request 原則）について、REQ-085 要件行、definition-readiness Design の
      Definition PR lifecycle 節、case-open / case-revise の PR 作成 reference がいずれも
      Definition PR / Definition Amendment PR を通常 Pull Request として扱い、ADF の正規 lifecycle が
      GitHub Draft PR を状態として使用しない記述であることを照合する。
    pass_criteria: 両 PR 種の作成・受入・merge が通常 Pull Request として記述され、外部由来の GitHub Draft PR は観測と停止の対象としてのみ現れる。
    on_failure: fix-and-reverify を選択する。契約記述を修正し、再照合する。
realization_actions:
  - id: RA-001
    concern: agentdev_gh GitHub版・共通契約の実装変更
    responsibility: >-
      Custom Tool agentdev_gh の GitHub版・共通契約から GitHub Draft PR 生成経路を除去し、pr_read に
      isDraft を追加する。contracts.ts の pr_create 要求型から draft を除去、specs-pr.ts の
      prCreateSpec（許容フィールド、buildRequest）から draft を除去、runner-cli.ts の prCreate から
      draft body 投影を除去、prView の gh pr view --json に isDraft を追加して prRead 結果へ写像する。
    ownership_hints:
      - src/opencode/tools/agentdev-gh/contracts.ts
      - src/opencode/tools/agentdev-gh/specs-pr.ts
      - src/opencode/tools/agentdev-gh/runner-cli.ts
      - docs/designs/responsibilities/custom-tool-contracts.md
    intent: Tool 操作契約の閉包（lifecycle で処理できない状態を生成する入力の除去）と Draft 状態の観測可能性の確立。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-002, AG-003]
  - id: RA-002
    concern: agentdev_gh Local版・公開スキーマ・テストの整合
    responsibility: >-
      Local版 runner-local.ts の prRead 成功結果に isDraft: false を追加する。plugins/agentdev-gh-tool/
      plugin.ts の公開 Tool スキーマから draft プロパティを除去する。契約テスト群（contracts.test.ts の
      カタログ整合、runner-cli.test.ts の draft 付与テストを契約外拒否テストへ置換、
      engine-fail-closed.test.ts の draft 検証、runner-local.test.ts、plugin.test.ts）を isDraft 追加と
      draft 除去後の契約へ更新する。
    ownership_hints:
      - src/opencode-local/agentdev-gh/runner-local.ts
      - src/opencode/plugins/agentdev-gh-tool/plugin.ts
      - src/opencode/tools/agentdev-gh/tests/
      - src/opencode-local/agentdev-gh/tests/
    intent: GitHub版/Local版の公開契約・schema・validator・VERIFY・契約テストの相互不矛盾。
    verification_refs: [TS-002, TS-004, TS-005]
    source_items: [AG-002, AG-003]
  - id: RA-003
    concern: case-open の Definition PR 作成の通常 PR 化と用語統一
    responsibility: >-
      definition-pr-and-idempotency.md の「Draft Definition PR」を「Definition PR」へ統一し、pr_create
      による通常 Pull Request 作成であることを明記する。SKILL.md（description 含む）、
      capture-and-completion.md、workflow-templates の root-case.md / root-case-report.md、
      commands/agentdev/case-open.md の同一用語を更新する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-open/SKILL.md
      - src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md
      - src/opencode/skills/agentdev-workflow-case-open/references/capture-and-completion.md
      - src/opencode/skills/agentdev-workflow-templates/templates/case-open/
      - src/opencode/commands/agentdev/case-open.md
    intent: case-open の作成経路から GitHub Draft PR の指定・分岐・表現を除去する。
    verification_refs: [TS-006, TS-009]
    source_items: [AG-004, AG-006]
  - id: RA-004
    concern: case-ready の isDraft 事前確認と blocked 経路の実装
    responsibility: >-
      definition-acceptance.md の確定判定と merge 手順に merge 前 isDraft 確認を挿入し、isDraft: true 時の
      pr_merge 未実行・blocked 停止（識別可能な blocked 理由つき）を明記する。SKILL.md、
      commands/agentdev/case-ready.md の用語を更新する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-ready/SKILL.md
      - src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md
      - src/opencode/commands/agentdev/case-ready.md
    intent: HTTP 405 到達前の Draft 状態検出と、自動復旧を行わない blocked 停止の確立。
    verification_refs: [TS-007, TS-008]
    source_items: [AG-005, AG-006]
  - id: RA-005
    concern: case-revise の Amendment PR 作成の通常 PR 明記
    responsibility: >-
      definition-revision.md の Amendment PR 作成（pr_create）が通常 Pull Request であることを明記し、
      GitHub Draft PR を作成する指定・分岐が存在しないことを確認する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-revise/references/definition-revision.md
    intent: Amendment PR の作成経路の閉包（Tool 契約変更後も参照記述が通常 PR を指すこと）。
    verification_refs: [TS-006]
    source_items: [AG-004]
  - id: RA-006
    concern: 用語統一の残存検証
    responsibility: >-
      docs/ と src/opencode/** の現行ファイルを横断検索し「Draft Definition PR」の残存を 0 にする
      （DEC-029 の決定本文は CR-003 のとおり時付注記で接続するため対象外）。
      .opencode/** は src/opencode/** のジャンクション投影のため個別編集しない。.agentdev/** と
      過去実行 snapshot fixture は履歴成果物として除外する。
    ownership_hints:
      - docs/requirements/
      - docs/designs/
      - docs/decisions/
      - src/opencode/
    intent: 現行規範・実行成果物における「Draft Definition PR」の完全除去（履歴と DEC-029 決定本文は保持・注記接続）。
    verification_refs: [TS-009, TS-013]
    source_items: [AG-006]
  - id: RA-007
    concern: write guard・pr_merge fail-closed の維持確認
    responsibility: >-
      agentdev-gh-write-guard（plugin.ts、lib/gh-command-detector.ts、guard-config.ts、テスト群）と
      agentdev_gh の fail-closed テストを変更せず、回帰 pass を確認する。
    ownership_hints:
      - src/opencode/plugins/agentdev-gh-write-guard/
      - src/opencode/tools/agentdev-gh/tests/engine-fail-closed.test.ts
      - docs/designs/integrity/rules/IR-053-gh-direct-invocation-detection.md
    intent: 防衛境界（raw gh WRITE 拒否、fail-closed）が本変更で弱体化しないことの保証。
    verification_refs: [TS-010]
    source_items: [AG-007]
  - id: RA-008
    concern: verification-scope-catalog snapshot fixture の取り扱い
    responsibility: >-
      scripts/self/case-intake-cross-inspection/fixtures/batch-2026-09-15/verification-scope-catalog.snapshot.md
      は過去実行の検証記録であるため再生成・書き換えを行わない（履歴成果物扱い）。
    ownership_hints:
      - scripts/self/case-intake-cross-inspection/fixtures/batch-2026-09-15/
    intent: 履歴成果物の保護と、docs 側カタログ更新との区別。
    verification_refs: [TS-013]
    source_items: [AG-006]
  - id: RA-009
    concern: custom-tool-contracts Design の ADF-COVERS 宣言の追従
    responsibility: >-
      custom-tool-contracts.md の ADF-COVERS(implementation) 宣言へ REQ-011-031、REQ-011-032 を追記する
      （Design 保存と同一の Definition 変更内で実施）。
    ownership_hints:
      - docs/designs/responsibilities/custom-tool-contracts.md
    intent: 新規 REQ 行と Design 被覆宣言の整合。
    verification_refs: [TS-005]
    source_items: [AG-002, AG-003]
  - id: RA-010
    concern: definition-revision.md 文言固定テストの追従
    responsibility: >-
      scripts/self/release/case-revise-definition-revision.test.ts が definition-revision.md の文言を
      固定しているため、RA-005 の記述追加に合わせてアサート対象を更新する。
    ownership_hints:
      - scripts/self/release/case-revise-definition-revision.test.ts
    intent: 配布物文言とリリーステストの整合。
    verification_refs: [TS-006]
    source_items: [AG-004]
review_dispositions:
  - id: RD-001
    source_ru: RU-0027
    source_item: RU-0027-acceptance-criteria
    disposition: covered
    reason_code: superseded_by_latest_agreement
    reason: >-
      RU-0027 の受け入れ条件（draft フラグの仕様確定、draft 状態検出時の case-ready 経路の明記、
      agentdev_gh のみでの merge 完結、ブランチ命名の Design 正規所有）は、2026-09-16T22:13 の
      セッション再合意による強い閉包（draft 入力の契約除去、isDraft 観測、blocked 停止）と
      ブランチ命名の維持で充足する。旧ドラフト解決（draft: false 統一指定のみ）は CR-001 のとおり
      置換する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0027.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_item: session-2026-09-16-definition-pr-draft-state-contract-acceptance-criteria
    disposition: covered
    reason_code: converted_to_new_req_and_design_update
    reason: >-
      セッション合意（session:2026-09-16-definition-pr-draft-state-contract、2026-09-16T22:13+09:00）の
      受け入れ条件20項は AG-001〜009、REQ-085 CREATE、REQ-011/030/061 更新、DEC-029 注記、
      Design 更新群、test_strategy（TS-001〜014）へ反映した。
    evidence:
      path: null
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

変更誘発境界リスクは、dependency（REQ-011 の Tool 契約行、REQ-030/061/085 のワークフロー契約行、definition-readiness / custom-tool-contracts Design、case-open / case-ready / case-revise reference の契約接続。isDraft 観測の追加と case-ready の blocked 依存は同一バッチで担保）、client-server（agentdev_gh と GitHub PR API の Draft 状態写像、契約外 draft 入力の副作用発生前クライアント側拒否）、execution（isDraft 確認の merge 前配置、冪等キー検索・再開条件の用語横断整合、blocked 時の自動復旧禁止）、build-runtime（GitHub版/Local版の schema・validator・契約テストの同等性、検証スナップショット fixture の履歴扱い）、environment-propagation（.opencode/** のジャンクション投影、過去バージョン由来の GitHub Draft PR が実環境に残存する異常系は isDraft 検出で HTTP 405 到達前に停止）の5観点を確認済みである。

work_type は feature（状態契約の再設計であり Decision 判断を伴う契約変更。bugfix の局所修正ではない）、scale は standard（単一 OU、単一 PR で完結する原子的な契約変更。用語統一は機械的置換が大半で、分解を要する独立関心の混在なし。実装スコープシグナルは所有ヒントの提示にとどまり分解計画を要しない）と判定した。

SPLIT 要否: 不要。REQ-085 は 6行の新規 CREATE であり要件行数は閾値未満、既存 REQ への追記も各行の関心が単一である。

主要な採用判断（STEP-10 でユーザーが差し戻し可能）:
1. DEC-029 は決定本文を書き換えず「結果、影響」節へ時付注記を追記する方針（CR-003。DEC-004 前例方式）
2. REQ-085 は予約枠の仮番号であり case-open の決定的採番を正とする（CR-002）
3. REQ-062 は用語出現 0 件のため変更不要、Amendment PR の通常 PR 原則は REQ-085-001 が横断所有（CR-004）
4. case-ready の isDraft 確認義務は REQ-061-032、lifecycle 不変条件は REQ-085-001 に住み分け（CR-005）
5. adversarial-review（STEP-8、結果 warn・unresolved なし）の findings 6件を反映済み: TS-009/RA-006 への DEC-029 決定本文例外（F-1）、verification-scope-catalog の REQ-011/REQ-061 範囲行更新 ACT-DESIGN-020/021 追加（F-2）、AG-001 対応 TS-014 追加（F-3）、TS-002 と REQ-011-031 の失敗分類表記を実装コード（invalid-field）と REQ-011-028/029 の用語へ整合（F-4/F-5）、related_reqs 対応不要を CR-003 へ記録（F-6。REQ-059-003 は宣言有無ベース検出）
