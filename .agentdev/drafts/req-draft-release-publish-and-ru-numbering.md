---
draft_type: req_draft
topic_slug: release-publish-and-ru-numbering
status: draft
created_at: 2026-10-20T10:50:00+09:00
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >-
  v5.1.4 リリース（backlog-auto 一気通貫 20261019T231959JST）の真因分析と利用者断定（2026-10-20:
  リリースを公開するのが要件であり、承認後に公開を実行しない設計は要件不適合）に基づき、
  (1) 承認後の GitHub Release 公開を workflow の正規経路として実装する要件（agentdev_gh カタログへの
  release_publish 追加・承認根拠必須の fail-closed 入力契約、backlog-auto stage 7 の承認時公開実行、
  set-state への公開実行形態の区別記録、完了検証の条件化）と、(2) backlog-review の RU 採番に git
  履歴の使用番号検査を組み込み消費済み番号との衝突を防ぐ要件を、REQ-114-010/016 の UPDATE、
  REQ-039-007 の APPEND、DEC-060 部分置換の新規 Decision、Design 4 ファイル 7 セクションの
  UPDATE として確定した。承認境界（公開は利用者が草稿作成とは別に明確に認めた場合に限る）と
  既存の安全境界（タグ不移動・生コマンド迂回禁止・既存 Release 不変）は維持する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      agentdev_gh 操作カタログに release_publish 操作を追加する。処理内容は対象 Release の draft 解除（publish 相当）と、読戻し確認（draft=false・published_at の実測）までとする。入力契約はタグ名と公開承認の根拠（承認した HITL 質問 ID・回答の記録参照）を必須とし、承認根拠を欠く要求、および契約外フィールドを含む要求は副作用発生前に入力契約違反として拒否する（fail-closed）。公開対象リポジトリの特定は runner 境界の既存のリポジトリ解決（カタログ全操作と同一）で保証し、per-request のリポジトリフィールドは持たない。承認根拠の検証は Tool 境界では構造検査（必須・非空・形式）までとし、参照された承認記録の実在・承認済み確認は呼出元 workflow の責務とする（Tool は実行機構であり、判断・承認の所有者は Workflow／利用者側）。release_publish は draft 解除のみを行い、Release のタイトル・本文・prerelease を変更しない。GitHub 接続専用とし、ローカル版は既存 Release 操作と同一の構造化失敗を返す。
  - id: AG-002
    content: |
      contracts.test.ts の forbidden リストから release_publish と release_create_published を除去する。release_update・release_delete は引き続きカタログ外（forbidden 維持）とする。release_create が公開相当フィールド（draft、published、publish、make_latest）を拒否する既存検査は維持する。release_publish の入力契約検査（承認根拠必須・契約外フィールド拒否）、カタログ列挙の更新（19操作→20操作）、テストヘッダコメント・テスト名の自己記述更新、index.ts の Tool description、agentdev-gh README の操作一覧の更新を同時に行う。
  - id: AG-003
    content: |
      backlog-auto stage 7（Release 記録手順）は、公開権限 HITL で利用者が公開を承認した場合、承認根拠（HITL 質問 ID・回答記録参照）を伴って release_publish を呼び、公開（draft=false・published_at の読戻し確認）までを workflow 実行として完了する。HITL 選択肢は実行能力と一致した文言とし、workflow が履行できない選択肢を提示しない（「公開まで実施」は workflow 自身の実行を意味する）。set-state のリリース状態には公開の実行形態（workflow 実行、代行、利用者手動）を区別して記録し、workflow 実行を正規経路、代行・利用者手動を例外経路とする。Release 記録工程の完了検証は set-state の公開記録を判定鍵として条件化する。未承認の場合は対象 Release が draft 状態で維持されていることを確認し、承認済み（workflow 実行）の場合は公開完了（draft=false・published_at の読み戻し）を確認し、代行・利用者手動の場合は記録と実状態の一致を確認する。未承認であるのに公開済み状態を検出した場合は不整合として完了とせず報告する。公開成功後に読戻し・記録が失敗・中断した場合の再開では、読戻しにより already-published（draft=false）を検出したときは重複実行せず記録完了として扱う（タグ不移動・第二の版番号消費なし）。
  - id: AG-004
    content: |
      公開には利用者の明示承認を必須のままとする（承認なし公開の禁止・fail-closed。REQ-114-014 のリリース条件・公開権限確認の HITL 境界は自動化しない）。既存の Release の本文・公開状態を変えない、承認なしの草稿公開をしない、タグ不移動（DEC-039）、同一タグへの二つ目の Release 作成禁止、生コマンドによる Release 書き込み禁止（REQ-114-016）を維持する。本変更はカタログ内に操作を追加するものであり、カタログ外書き込み経路の解禁ではない。REQ-114-017 の RC 版タグの Release は草稿かつプレリリースとして作成する規則は維持し、承認公開後も prerelease=true は不変とする（release_publish は draft 解除のみを行う）。
  - id: AG-005
    content: |
      DEC-060 を部分置換する新規 Decision を作成する。置換対象は決定(1)のうち公開の実行経路・実行主体に関わる部分（公開の実行は、利用者が草稿作成とは別に明確に承認した場合、workflow がカタログ内操作 release_publish 経由で行う規則へ置換）と決定(3)（カタログへの追加は Release 草稿作成・Release 読み戻しに必要な機能のみとする範囲制限。Release 草稿作成・Release 読み戻し・承認付き Release 公開に必要な機能へ置換）である。DEC-060 の承認境界（公開は利用者が草稿作成とは別に明確に認めた場合に限る）、release_create の入力契約に公開モードを含めない規則、草稿作成・読み戻しのカタログ限定経路、決定(2)（DEC-059 / DEC-039 系譜の維持）は維持する。DEC-059 は公開操作規則を既に DEC-060 へ部分置換委譲済み（supersede_note 明記）のため本文を直接編集しない。Decision の relations は supersedes DEC-060（部分置換）・relates-to DEC-059・DEC-039、related_reqs は REQ-114 とする。
  - id: AG-006
    content: |
      backlog-review の RU 採番は、req-units ディレクトリの現状（既存ファイルの最大番号+1）に加えて、git 履歴（git log --all 相当、消費済み・削除済み RU を含む）の使用番号を検査し、衝突する番号を採番せず次の未使用番号を採番する。履歴検査の実施を進捗記録に残す。履歴検査が実行できない環境では採番を確定せず理由を報告する（fail-closed）。v5.1.4 実行で利用者が承認済みの RU-0001〜0010 採番のやり直しは行わない（対象外維持）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-114.md
    target_area: 要件
    source_items: [AG-001, AG-003, AG-004, AG-005]
    content: |
      | REQ-114-010 | 正式リリースは、一式全体の完遂、リリース条件（Decision `DEC-059` の適用規則）、公開操作の権限がすべて成立した場合に限り、対象プロジェクトの採用方式に従って作成すること。少なくとも正式バージョン、リリース対象コミット、タグ、リリース内容が確認可能であること。追加の公開成果物は対象プロジェクトの採用方式に従い、ADF本体では版タグ（正式 SemVer タグと RC タグを含む）ごとにタグ名と一致する GitHub Release を1件だけ対応させ、対応する Release のない版タグには草稿を作ること。既存の Release の本文と公開状態を変えず、承認なしに草稿を公開しないこと（公開は、草稿作成とは別に利用者が明確に認めた場合に限る）。公開権限の確認で利用者が公開を明示承認した場合、workflow は承認根拠（承認した HITL 質問 ID・回答の記録参照）を伴ってカタログ内の公開操作で公開（draft の解除）を実行し、読戻しで公開状態を確認するまでを workflow 実行として完了すること。公開の実行形態（workflow 実行、代行、利用者手動）を set-state のリリース状態に区別して記録し、HITL 選択肢は実行能力と一致した文言とし workflow が履行できない選択肢を提示しないこと |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-114.md
    target_area: 要件
    source_items: [AG-001, AG-004, AG-005]
    content: |
      | REQ-114-016 | リリース工程における GitHub Release の作成・読み戻し・公開（draft の解除）は、ADF が認めた経路（Custom Tool 操作契約のカタログ）だけで行い、生コマンド実行でカタログ外の書き込み経路を迂回しないこと。公開操作（release_publish）の入力契約はタグ名と公開承認の根拠（承認した HITL 質問 ID・回答の記録参照）を必須とし、承認根拠を欠く要求は副作用発生前に入力契約違反として拒否されること。版タグと Release の対応を GitHub から読み戻して確認するまでリリース工程を完了とせず、草稿作成に失敗した場合はタグを移動・再作成せず、Release が欠けているため工程を完了できない旨を報告して停止すること。再開時は既存のタグと Release を使い、同一タグへ二つ目の Release を作らないこと。Release 記録の補完は版番号の消費とタグの作成・移動を伴わない記録操作であり、REQ-114-008 の完遂前の新規リリース作成禁止の対象外であること |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-039.md
    target_area: 要件
    source_items: [AG-006]
    content: |
      | REQ-039-007 | backlog-review の RU 採番は、req-units ディレクトリの現状に加えて git 履歴上で使用されたことのある番号（消費済み・削除済み RU を含む）を検査し、衝突する番号を採番せず次の未使用番号を採番すること。履歴検査の実施を進捗記録に残すこと。履歴検査が実行できない環境では採番を確定せず理由を報告すること |
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:release-publish-route
    source_items: [AG-005]
    content: |
      タイトル: Release 公開操作のカタログ正規化（承認後の workflow 実行経路）
      relations: supersedes DEC-060（決定(1)の公開の実行経路・実行主体部分と決定(3)を部分置換）／ relates-to DEC-059（版番号規則等の維持確認）／ relates-to DEC-039（タグ権威・不移動の継承）
      related_reqs: [REQ-114]

      ## 背景

      DEC-060 は GitHub Release の草稿作成・読み戻しを workflow 実行範囲に含め、公開（draft の publish 化）は利用者が草稿作成とは別に明確に認めた場合に限ると定めたが、承認後の公開の実行経路・実行主体を確定しなかった。2026-10-20 の backlog-auto 一気通貫実行（20261019T231959JST）による v5.1.4 リリースで、stage 7 の公開権限 HITL で利用者が公開を承認したにもかかわらず workflow は公開を実行できず利用者側実施へ転嫁し、カタログ外の代行実行により公開された。利用者断定（2026-10-20）: リリースを公開するのが要件であり、承認後に公開を実行しない設計は要件不適合である。HITL 選択肢文言「公開まで実施」は存在しない経路を履行可能と提示していた。

      ## 決定

      (1) DEC-060 決定(1) のうち公開の実行経路・実行主体に関わる部分を次のとおり部分置換する。ADF本体の採用方式において、GitHub Release の公開（draft の publish 化）は、利用者が草稿作成とは別に明確に承認した場合、workflow が Custom Tool 操作カタログの公開操作（release_publish）経由で実行する。公開操作の入力契約はタグ名と公開承認の根拠（承認した HITL 質問 ID・回答の記録参照）を必須とし、承認根拠を欠く要求は副作用発生前に入力契約違反として拒否される（fail-closed）。承認根拠の検証は Tool 境界では構造検査（必須・非空・形式）までとし、参照された承認記録の実在・承認済み確認は呼出元 workflow の責務とする（Tool は実行機構であり、判断・承認の所有者は Workflow／利用者側）。公開操作は対象 Release の draft 解除のみを行い（タイトル・本文・prerelease を変更しない）、読戻しで draft=false・published_at を確認する。

      (2) DEC-060 決定(3) を次のとおり置換する。カタログへの追加は Release 草稿作成・Release 読み戻し・承認付き Release 公開に必要な機能とし、操作契約（custom-tool-contracts Design）と操作カタログ列挙の契約テストを同時更新する。

      (3) DEC-060 の承認境界（公開は利用者が草稿作成とは別に明確に認めた場合に限る）、release_create の入力契約に公開モードを含めない規則、草稿作成・読み戻しのカタログ限定経路、決定(2)（DEC-059 / DEC-039 系譜の維持）は維持する。

      (4) 公開の実行形態（workflow 実行、代行、利用者手動）を set-state のリリース状態に区別して記録する。workflow 実行を正規経路とし、代行・利用者手動は例外経路として明示的に区別する。未承認であるのに公開済み状態を検出した場合は不整合として完了とせず報告する。

      ## 代替案

      生コマンド（gh CLI 直接実行）による公開経路（REQ-114-016 のカタログ外書き込み禁止に反するため不採用）。release_create への公開モード追加（承認境界の分離を崩すため不採用）。公開を workflow 実行範囲に含めず利用者実施のまま据え置く案（利用者断定により要件不適合と確定したため不採用）。

      ## 結果、影響

      REQ-114-010、REQ-114-016 に適用する。stage 7 リリース（backlog-auto）、agentdev_gh 操作カタログ、custom-tool-contracts Design、backlog-auto Workflow Skill Design、backlog-auto command Design が対象。DEC-059 は本文を直接変更しない（公開操作規則は supersede_note により既に DEC-060 へ委譲済み）。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-001, AG-002, AG-005]
    content: |
      ## 対象操作の境界（初期セット）

      操作カタログを以下の20操作として定義する。

      - 基本操作: issue_create、issue_read、issue_update、issue_close、pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable、pr_update
      - 追跡Issue操作: issue_list、issue_reopen
      - Release 操作: release_create、release_list、release_read、release_publish。Release 草稿作成（release_create）はタグ名、タイトル、本文、prerelease を入力とする WRITE であり、作成後の読み戻しでタグ対応・draft 状態・prerelease を VERIFY する。Release 一覧読取（release_list）と Release 読み戻し（release_read）は READ であり、タグと Release の対応確認用に正規化して返す。Release 公開（release_publish）はタグ名と公開承認の根拠（承認した HITL 質問 ID・回答の記録参照）を入力とする WRITE であり、対象 Release の draft 解除のみを行い（タイトル・本文・prerelease を変更しない）、作成後の読み戻しで draft=false・published_at を VERIFY する。承認根拠の検証は Tool 境界では構造検査（必須・非空・形式）までとし、参照された承認記録の実在・承認済み確認は呼出元 workflow の責務とする（Tool は実行機構であり、判断・承認の所有者は Workflow／利用者側）。release_create の入力契約には公開モード（draft の解除、publish 相当のフィールド）を含めず、契約外の公開指定フィールドを含む要求は副作用発生前に入力契約違反として拒否する
      - Comment 操作: comment_create、comment_list、comment_update、comment_delete。Comment は Issue と Pull Request の会話コメントを同一の論理リソースとして扱う。comment_list の各要素は commentId、body、createdAt、updatedAt、url を返す。comment_update と comment_delete は commentId を対象識別子として使用する。commentId の公開型は文字列とし、GitHub 実装は数値コメント id を文字列化する
      - 廃止済み操作: issue_comment（body あり＝追加、body なし＝読取の二重モード）は正規操作カタログから除去済みであり、ADF 内部の呼出元は Comment 操作への移行が完了している。GitHub 版・Local 版のいずれの実装にも issue_comment は存在せず、廃止は確定している。外部 consumer 環境が更新前の runner を保持する間に旧 runner 側で issue_comment が動作し得るが、それは本 Design の操作契約の対象外である
      - pr_create の入力契約: Pull Request 作成は GitHub Draft PR を生成する入力（draft）を公開契約に含まない。契約外の draft フィールドを含む要求は副作用発生前に REQ-011-028 の入力契約違反として拒否する（REQ-011-031）。Draft 状態は pr_read による観測対象であり、作成・更新操作での指定・変更の対象としない
      - pr_read の拡張: 成功結果に Pull Request 本文（body）と Pull Request の Draft 状態を表す boolean（isDraft）を含む。GitHub backend は対象 Pull Request の実際の Draft 状態を isDraft に写像し、Local backend は false を返す（REQ-011-032）。本文の論理的な範囲はローカル版の物理写像（ローカルIssue共通スキーマ Design）に従い、読み取りと更新が round-trip 可能な同一の論理範囲（ローカル版ではマージ前確認・Design確定候補・Findings / Capture候補の3セクション群の直列化）とする
      - pr_update: title と body を対象とする項目単位の部分更新操作。指定されていない項目は保持し、更新後は読戻しによって要求値の反映を確認する。ローカル版では Pull Request タイトルの正をマージ前確認セクション内の PR タイトル行とし、pr_update の title は同行を置換する
      - pr_merge の入力契約: pr_merge はローカル版の取り込み確認情報として commitHash（文字列、任意フィールド）を受理する。ローカル版では必須として検証し（実在確認）、GitHub 版では受理してマージ動作には使用しない
      - issue_update の部分更新不変条件: 変更を要求していない追跡Issue軸（role）を保持する。VERIFY の照合対象は追跡軸の完全一致と要求通常ラベルの包含とし、確認時点での第三者による通常ラベル追加を不変条件違反として失敗扱いにしない
      - issue_reopen の追跡Issue取扱い: 再オープンによって role と通常ラベルを保持する。追跡状態の再オープン遷移（クローズ済み→検討中）は本文の状態保持節の更新として呼出側が行い、Tool は追跡状態遷移を機械適用しない。Case Issue には追跡状態遷移を適用しない。既に open の追跡Issueへの再オープンは要求的状態の確認をもって冪等に成功とする

      VERIFY 適用（READ / WRITE 分離）:
      - WRITE 操作（issue_create、issue_update、issue_close、issue_reopen、comment_create、comment_update、comment_delete、pr_create、pr_update、pr_merge、release_create、release_publish）: 副作用そのものを読み戻し、要求した状態の反映と保持対象不変条件の維持を確認する。Comment WRITE は対象 Comment の存在・本文で判定し、Issue / Pull Request の open / closed 状態を成功証拠として使用しない
      - READ 操作（issue_read、issue_list、comment_list、pr_read、pr_changed_files、pr_mergeable、release_list、release_read）: 取得結果の構造と契約上必要な意味的整合性を確認する。時間変化し得る値（mergeable、isDraft 等）について連続読取の一致を要求せず、取得時点の状態を正規化して返す。pr_mergeable は単一読取の正規化結果を返し、直後の再読取との一致確認を行わない

      一覧完全性:
      - issue_list と comment_list は Tool 内部で必要なページをすべて取得し、完全一覧として返す。上位層は GitHub API のページングを指定しない
      - フィルタ可能な軸（state、labels 等）はサーバ側絞り込みクエリへ推送し、安全上限への到達可能性を低減する。上限値は本 Design のパラメータとして定義する
      - issue_list の search 指定はサーバ側絞り込み推送の対象である（REQ-011-033）。search 指定時は search/issues エンドポイント（q=repo:{owner}/{repo} is:issue state:{state} {search} in:title label:...）へ切替え、クライアント側 title フィルタ（title.includes）は Local 版のみの実現手段とする。search 未指定時は従来どおり list 系クエリの完全走査とする
      - 物理写像差異の宣言（REQ-011-024）: GitHub 版 in:title は tokenized 照合であり substring と異なり前方部分文字列照合（例: 「REQ-012」で「REQ-0122」を拾う）が成立しない場合がある。重複回避検索の呼出側は検索キー選定でこの差を考慮する。Local 版は includes() を維持し同一観測契約とする
      - 運用注意: GitHub search index の更新遅延（作成直後の Issue が検索に現れるまで秒〜分程度かかる可能性）、search API rate limit（30 req/min）。安全上限（10ページ×100件）の意味は変更しない
      - 安全上の上限によって完全取得できない場合は再試行可能な失敗（operation-failed）として扱い、不完全な一覧を完全な成功結果として返さない。呼出側の回避手順（期間分割等）は各 workflow 文書が定める

      失敗分類の判定規則:
      - 存在しない対象（Issue 番号、commentId、PR 番号）への操作は、入力が構造的に有効であれば operation-failed とする（存在性は入力妥当性ではない）
      - runner 実行時の外部操作失敗（gh / GitHub API の HTTP エラーを含む）は operation-failed に分類し、Tool / runner 自体の異常終了のみを enforcement-crashed に分類する
      - WRITE 実行後に読み戻し確認を完了できない場合は verification-incomplete とする

      GitHub版 / Local版等価性:
      - 両版は操作名、入力構造、出力構造（pr_read の isDraft を含む）、Comment 識別概念（commentId の役割と公開型）、Issue の論理状態遷移、READ / WRITE の成功意味、失敗の意味を同値とする
      - 物理写像に起因する値域差異（ローカル版追跡Issueの通常ラベル非許容。agentdev-issue-tracking Design の値域定義に従う）と、role: case の状態モデルに起因する受理条件差（ローカル版 case の再オープン拒否。ローカルIssue共通スキーマ Design の状態遷移に従う）、および Local 版が GitHub Draft PR に相当する状態を持たないことによる isDraft の値差異（Local 版は常に false。REQ-011-032）は、本 Design が例外として明示する
      - pr_merge の入力契約に起因する受理条件差（ローカル版は commitHash を取り込み確認情報として必須検証〔実在確認〕し、GitHub 版は受理してマージ動作に使用しない）は、本 Design が例外として明示する
      - Release 操作（release_create、release_list、release_read、release_publish）は GitHub 接続専用とし、Local 版は構造化失敗（operation-failed。ローカル環境では GitHub Release 相当の状態を持たない旨を詳細に含む）を返す。失敗分類は既存の値域を維持する。この例外は本 Design が明示する

      操作カタログの完全列挙（20操作）は契約テストで固定し、対象外機能の追加を検出する。

      「third-party Skill 取得」操作契約:

      - 入力: third-party 宣言（skills.yaml）の対象 Skill 名（省略時は全件）、dry-run 指定
      - 出力: 取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況）
      - 保証: 取得結果の検証後に成功を返す。取得開始前に存在した正常な配置を取得失敗時に破壊しない。機構管理外の既存配置を無断で上書きしない
      - 失敗: 失敗を成功扱いとしない。部分取得状態を開始前状態へ解消し、失敗要因を報告する

      取得プロファイル（単一 SKILL.md URL 型・GitHub Skill ディレクトリ型の判定、正規化、再帰取得、相対構造保持、Skill ディレクトリ外非取得）の詳細は Design third-party-skill-management が所有する。

      「Jev 先行評価」操作契約:

      - 入力: 評価リクエスト（state、instructions、criteria、質問群〔形式: boolean 相当・choice（候補付き）・score（重複のない離散的な水準付き）〕）。provider 接続設定は `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` 環境変数で解決する（Cloudflare AI Gateway の default Gateway を利用し、Gateway ID を ADF の設定契約として持たない）。判断対象・必要 state・判断基準・結果空間を評価入力だけで判断可能な形に閉じる構成は Workflow / Capability Skill の責務である（REQ-090-019）。評価入力を閉じる過程に別の未解決な意味判断を隠してはならない（REQ-090-019）。
      - 出力: 質問ごとの結果（選択・真偽・水準）、候補別確率分布、provider が実際に返した confidence（evaluation 単位。provider 固有の格納位置〔Cloudflare adapter では Cloudflare AI Gateway `/ai/run` response 内の provider 固有 field。物理 field 名は adapter 実装の自由度とする〕を内部吸収して共通形式へ正規化。provider が返さない場合は返さない）、inputTokens（provider が返す場合）、機械的処理時間。失敗時は構造化失敗（分類: not_configured、timeout、429、5xx、network error、response validation error 等）。
      - 保証: 公開契約は provider・SDK 非依存とし、AI SDK の型名・API 名を公開スキーマと Workflow 層へ漏らさない。質問型（独立命題・排他候補・順序水準）と boolean/choice/score の対応づけは adapter mapping であり意味契約の変更ではない。Tool は判断対象の意味・評価基準・Jev を呼ぶべき箇所・最終判断を所有しない（REQ-011-020 準拠）。Tool は評価入力に対する構造検証に限定して携わり、semantic input の意味的完備性（判断対象・必要 state・判断基準・結果空間の閉じ性、候補集合の正解クラス網羅、水準の意味境界の適切性）を自動判定・推論・補完しない（REQ-090-019）。API key 未設定時は呼び出さず構造化失敗（not_configured）を返し、semantic evaluation observation を生成しない。評価入力の事前検証失敗（invalid input）でも observation を生成しない。必須の閉じた意味評価が評価器障害（未設定、利用不能、timeout、rate limit、network error、provider error、応答検証失敗等）で成立しない場合、LLM 推論へ fallback して判定を継続しない（REQ-103-008）。当該判定を未確定として扱い、当該判定に依存する後続の副作用および状態遷移を開始せず（REQ-103-009）、評価器障害だけを理由に人間判断へ移行せず（REQ-103-010）、復旧後は正規の再実行・再開経路で評価を再実行する（REQ-103-011）。代替手段・継続可否の定義義務（REQ-052-005）はこの障害時契約で充足する。評価言語は日本語とする。
      - 観測契約（一次事実）: 観測単位は 1 semantic evaluation = 1 observation（1 JSON）とし、1 Workflow 実行単位の JSON 集約を行わない。各 observation は実行元 Workflow と評価種別を識別できる情報を持つ。保存する一次事実は次に限定する。(1) evaluator 返却結果（canonical result: boolean=真偽、choice=候補、score=定義済み scale 内の離散的な level に一意対応する正規化表現〔level label と scale 内の整数位置のいずれか一方へ Custom Tool が正規化したもの。evaluator result と final result は同一の正規化表現で比較する〕。score の canonical result への連続値〔例: 0.31、1.25〕の受理・保存は機械検証可能な形で拒否し、判断の分布情報は候補別確率分布で保持する。REQ-090-014。評価入力の各質問と各結果の1対1対応、各質問の evaluator result と候補別確率分布の双方保持）、(2) provider が実際に返した confidence（evaluation 単位のみ。judg
      - 観測契約（一次事実）: 観測単位は 1 semantic evaluation = 1 observation（1 JSON）とし、1 Workflow 実行単位の JSON 集約を行わない。各 observation は実行元 Workflow と評価種別を識別できる情報を持つ。保存する一次事実は次に限定する。(1) evaluator 返却結果（canonical result: boolean=真偽、choice=候補、score=定義済み scale 内の離散的な level に一意対応する正規化表現〔level label と scale 内の整数位置のいずれか一方へ Custom Tool が正規化したもの。evaluator result と final result は同一の正規化表現で比較する〕。score の canonical result への連続値〔例: 0.31、1.25〕の受理・保存は機械検証可能な形で拒否し、判断の分布情報は候補別確率分布で保持する。REQ-090-014。評価入力の各質問と各結果の1対1対応、各質問の evaluator result と候補別確率分布の双方保持）、(2) provider が実際に返した confidence（evaluation 単位のみ。judgment 単位への複製、probability distribution からの代替 confidence の生成・永続化の禁止）、(3) 入力再構成情報（具体的 source revision、再構成可能入力は参照と request digest、再構成不能入力のみ最小 snapshot。source revision から一意に導出できる provider・requested model 等の観測ごとの必須保存をしない。非導出の identity 差異が実行時観測された場合のみ保持）、(4) reasoning model の最終判断結果と差異理由分類（final result は evaluator 成功観測に限定して保持。failure observation への重複保存を要求しない。差異理由は canonical result が evaluator result と final result で異なる場合に必須とし、一致する場合は保持せずその指定を拒否する。差異理由は evaluation_input_defect / semantic_disagreement / deterministic_override / unknown の4分類とし、原因を確定できない差異は unknown として保存できる。REQ-090-015）、(5) 呼出し時間と input token 数（provider 返却時のみ）、(6) 失敗分類と最小 diagnostic（実際の呼出し開始後の失敗のみ: timeout、429、5xx、network error、response validation error の5分類。REQ-090-016）。観測は append-only の一次事実であり、Workflow 再開・再実行による同一判断の再観測を排除・統合しない。観測識別子の安定性: 同じ意味判断を継続する場合は workflow、evaluationKind、questionId を維持すること。判断対象、結果範囲または判断基準の意味が変わった場合および複数の判断を統合した場合は新しい questionId を使用すること。版の違いは sourceRevision、requestDigest で区別すること（REQ-090-026）。条件付き評価の発動条件: 親判断の最終確定結果が発動条件を満たさない場合、後続質問および後続の意味評価に対応する観測記録を生成しないこと（REQ-090-025）。
      - 永続化契約（中断耐性）: evaluate は evaluator 成功後・呼出元 Workflow が reasoning model へ進む前に、当該評価の一次観測の永続化を試みる。永続化成功後の中断でも一次観測が失われない。永続化自体の失敗は観測保存失敗契約（fail-open）に従う。観測の保存のみに失敗した場合、Workflow の正規処理結果を維持し、rollback・再実行・擬似再生成を行わず、識別可能な warning を構造化情報として呼出元へ返す（REQ-090-013）。
      - deterministic 境界: semantic evaluation の適用対象の画定境界は REQ-090-018 参照。Tool 視点では、境界判定（機械判定基準「モデル推論なしで一意に導出できること」）とその適用は Workflow / Capability Skill 側の責務であり、Tool は境界判定そのものを評価入力として受け取らず、境界適用済みの閉じた評価入力のみを扱う。評価後に判明した機械的確定は差異理由 deterministic_override として処理し、機械的に確定した結果を Jev で再判定させる二重確認は行わない。境界判定が確定できない場合の REQ-090-024 適格条件〔REQ-090-024 が REQ-096 の閉じた意味評価の閉包条件を参照する形で維持。閉包条件の正典は REQ-096 および v4-responsibility-boundaries Design「閉じた意味評価の閉包条件」節〕による判定も REQ-090-018 の定めるとおりとする（REQ-090-018）。
      - 評価指標（集計・分析時）: 観測に基づく Jev と最終判断の関係の集計方法（ground truth を設定することを前提としないこと、raw agreement と semantic agreement の分離、semantic agreement 母集団の差異理由による除外、集計粒度、指標名 Jev–final agreement）は REQ-090-020 参照。Tool 視点では、集計は観測の一次事実からの分析時の導出であり、Tool の観測保存時に新規 field を追加する要件を生まない（REQ-090-020）。
      - 書込先: 書込先 root は Tool が内部解決し、呼出側から指定できない。worktree コンテキストの委譲実行から呼び出された場合も main リポジトリ側 `.agentdev/jev-observations/` に帰着する（実測観測により確認済み）。この振る舞いは worktree コンテキストに依存しない。機構記述（cwd 相対解説等）は契約文言に含めず、観測可能契約のみを規定する（実装は物理実装の自由度とする）。
      - 旧派生状態の除去: recordState、outcome、llmTreatment、unchanged/corrected、finalizedBy、direct-finalization marker、fallback reason、not_configured/invalid_input observation を正規観測契約から除去する（REQ-090-017）。既存の v1 観測（1 Workflow 実行 = 1 JSON、部分レコード/完成レコード形式）は履歴として保持し、migration・変換・読み取り互換を要求しない。v1 観測を新契約の現行 observation として解釈しない。
      - 操作構成の自由度: operation カタログ（evaluate、観測の永続化と final result 反映の操作分割の有無）、観測 JSON の field 名、filename、完了状態の物理表現は実装設計時の自由度とし、本節の意味契約（一次事実、evaluation 単位 confidence、中断耐性、fail-open）を変更しない範囲で定める。provider 返却の score 値から定義済み scale level への正規化の写像方法も、連続値を canonical result として残さない限りにおいて実装設計時の自由度とする（REQ-090-014）。
      - 配布境界: ADF 汎用の Tool として配布対象とする（REQ-052-006）。正式名称 `agentdev_jev`、物理配置 Tool 本体 `src/opencode/tools/agentdev-jev/`、Cloudflare adapter パッケージ（`src/opencode/tools/agentdev-jev/` 配下。Cloudflare AI Gateway 接続。物理ディレクトリ名は repository 規約に従う。評価 SDK・HTTP 依存はこの adapter パッケージに閉じる）、Plugin 登録配線 `src/opencode/plugins/agentdev-jev-tool/`。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-workflow-backlog-auto
    target_area: リリース手順シーケンスと再開経路
    source_items: [AG-003, AG-004]
    content: |
      ### リリース手順シーケンスと再開経路

      - リリース時点の正式タグ再確認、版番導出、対象コミット確定（一式の全マージ完遂時点の main HEAD）と無関係コミット混入検知（開始コミット..対象コミットの差分と一式分実変更の突合）、タグ作成、（採用方式があれば）追加公開物（草稿作成・読み戻し、承認済みの場合は公開まで）、結果記録の順
      - 各段階の中断・失敗時は既存結果の読み戻しにより未完了段階から再開する（タグ不移動・再作成なし・第二番号なし）
      - backlog-auto 再実行は set-state から完遂済み Case を検出し全体完了判定以降から再開する
      - 停止報告には case-auto 単独の再開入口（REQ-034-038）に加えて一式再開経路（backlog-auto 再実行）を併記する
      - リリース記録対応（REQ-114-016、REQ-114-017）: タグをリモートへ送った後、版タグ（正式 SemVer タグと RC タグ。非 SemVer ベースラインタグは除外）をすべて列挙し、対応する Release の有無を Custom Tool の Release 読取で確認する。対応する Release のない版タグへ草稿を作る（RC 版タグは prerelease 有効）。既存の Release は対象外とし本文・公開状態を変更しない。作成後、GitHub から読み戻して版タグと Release の対応（同名 Release の存在、draft・prerelease 状態）を確認する。公開権限 HITL で利用者が公開を承認した場合、承認根拠（HITL 質問 ID・回答記録参照）を伴って release_publish を呼び、draft=false・published_at の読戻し確認までを workflow 実行として完了する。公開の実行形態（workflow 実行、代行、利用者手動）を set-state のリリース状態に区別して記録する。未承認の場合は対象 Release が draft 状態で維持されていることを確認するまで Release 工程を完了としない
      - 公開完了検証の条件化: Release 記録工程の完了検証は set-state の公開記録を判定鍵とする。未承認の場合は対象 Release が draft 状態で維持されていることを確認し、承認済み（workflow 実行）の場合は公開完了（draft=false・published_at の読み戻し）を確認し、代行・利用者手動の場合は記録と実状態の一致を確認する。未承認であるのに公開済み状態を検出した場合は不整合として完了とせず報告する。公開成功後に読戻し・記録が失敗・中断した場合の再開では、読戻しにより already-published（draft=false）を検出したときは重複実行せず記録完了として扱う（タグ不移動・第二の版番号消費なし）
      - リリース記録の異常系: 草稿作成の失敗時、および読戻しで同名 Release が2件検出された場合は、既存を削除せず報告して停止する（利用者判断）。リモートに存在しない既存の版タグは、注釈付きタグを通常の push（非 force）で送り、リモートとローカルのタグ識別子一致を確認してから草稿を作る。push の拒否（リモートに同名タグが異なるオブジェクトで存在する場合等）は失敗として報告し、force による解消を行わない
      - リリース記録の重複作成防止: 草稿作成前に存在確認を行い、再開時は既存 Release を検出して作成を省略する
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-workflow-backlog-auto
    target_area: 委譲
    source_items: [AG-001, AG-003]
    content: |
      ### 委譲

      - 子ワークフロー（req-define、case-auto、整理サイクル各コマンド）への委譲は既存の委譲契約に従う
      - Release 公開の実行は Custom Tool カタログの公開操作（release_publish）経由で行う（承認根拠を入力契約に必須とする）。カタログに含まれない操作はワークフローが準備までを行い、実行は承認後の所定経路とし、その場合の公開実行形態は例外経路として set-state へ記録する
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: backlog-auto
    target_area: 副作用
    source_items: [AG-003, AG-004]
    content: |
      ## 副作用

      - 各子コマンドの既存副作用（`.agentdev/` 配下の成果物作成・削除、git commit/push、ユーザー対話）を子コマンド公開契約どおりに発生させる
      - set-state の作成・更新（`.agentdev/` 配下、req-units/drafts の外）
      - git タグ作成・push（リリース時、DEC-059 準拠）
      - 追加公開成果物の対応（ADF本体では GitHub Release の草稿作成・読み戻し、および承認済みの場合の公開までを Custom Tool カタログ経路で実行する。公開は利用者が草稿作成とは別に明確に認めた場合に限る。カタログに含まれない操作の実行は承認後の所定経路）
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: backlog-auto
    target_area: 一気通貫実行の拡張（REQ-114）
    source_items: [AG-003, AG-004]
    content: |
      ## 一気通貫実行の拡張（REQ-114）

      公開 interface の拡張（実行構造の複製は行わない。orchestration stage 構成・set-state 形式・resume 契約は Workflow Skill 側 Design の所有）:
      - 目的: backlog-auto の対象を、backlog 整理サイクルに加えて RU 一式の要件定義・実行・検証・統合・全体完了判定・パッチリリース作成への接続（一気通貫実行）まで拡張する。所有する実行契約は REQ-114。
      - 入力: 引数なし（対象状態は各子コマンドと set-state の永続状態から解決する）。
      - 出力: 整理サイクルの既存出力に加え、一気通貫の実行結果報告（工程別結果、全体完了判定結果、リリース結果または保留理由、再開経路を含む共通実行契約形式）。
      - 副作用: 整理サイクルの既存副作用に加え、set-state の作成・更新（.agentdev/ 配下、req-units/drafts の外）、git タグ作成・push（リリース時、Decision DEC-059 準拠）、GitHub Release 草稿作成および承認済みの場合の公開を含む追加公開成果物の対応（Custom Tool カタログ経路。公開は利用者が草稿作成とは別に明確に認めた場合に限る）を発生させる。
      - HITL 境界: 既存の子ワークフロー HITL 境界に加え、開始時基準点確認（初期状態・到達不能正式タグの場合の停止）、リリース条件確認、公開権限確認を利用者判断境界として持つ。既存境界の自動化は行わない。
      - 停止条件: 整理サイクルの既存停止条件に加え、基準点確定不能、要件定義・実行の blocking 停止伝播、全体完遂不成立、リリース条件・権限不成立（完遂済み・リリース保留として報告）、公開途中失敗（読み戻し再開可能な状態で報告）。
      - 対象外: REQ-114 対象外節（docs/requirements/REQ-114.md 適用範囲）および本 Design「対象外」節に列挙した事項。
      - 検証観点: 一気通貫の実行結果報告が共通実行契約形式で報告されること、既存子コマンドの公開契約に差分がないこと。
      - 詳細受入条件: backlog-auto 一気通貫実行の受入条件は docs/requirements/REQ-114.md の要件行 REQ-114-001〜015 を参照
      - 対論型レビュー: REQ-114 の対論型レビュー審議は定義 Case #3725 の審議記録を参照
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-backlog-integration
    target_area: 提供する判断、操作
    source_items: [AG-006]
    content: |
      ## 提供する判断、操作

      - N:1 統合判定 / 1:N 分割判定
      - 矛盾検出（矛盾する artifact を RU 化せずユーザーに確認、矛盾しない artifact は通常通り RU 化、partial success）
      - RU 生成（frontmatter、構成、採番。採番はディレクトリ現状の最大番号+1に加えて git 履歴上の使用番号〔消費済み・削除済み RU を含む〕を検査し、衝突する番号を採番せず次の未使用番号を採番する。履歴検査の実施を進捗記録に残し、検査が実行できない環境では採番を確定せず理由を報告する）
      - depends_on 依存解決基準（RU-ID のみ許容、採用済み成果物パス指定不可）
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-backlog-integration
    target_area: 検証観点
    source_items: [AG-006]
    content: |
      ## 検証観点

      - 統合/分割ロジックの正確性（N:1 / 1:N）
      - 矛盾検出の網羅性
      - RU スキーマの適合性（frontmatter、構成、採番。採番の検証にはディレクトリ現状と git 履歴の使用番号検査を含める）
      - depends_on に RU-ID のみが指定されているか

conflict_resolutions:
  - id: CR-001
    conflict: DEC-060 決定(3)（カタログへの追加は Release 草稿作成・Release 読み戻しに必要な機能のみ）および決定(1)の公開実行経路未確定が、承認後の workflow による公開実行と衝突する
    resolution: DEC-060 を部分置換する新規 Decision で解消する（ACT-DEC-001）。承認境界そのもの（公開は利用者が草稿作成とは別に明確に認めた場合に限る）と release_create の公開モードなしは維持する。decision-lifecycle 部分置換様式（status 維持・supersede_note 記録）に従う。アーキテクチャ助言 A1（確信度: 高）を採用。
  - id: CR-002
    conflict: backlog-auto stage 7 の完了不変条件「公開操作（draft の解除）が実行されていないこと。Release 草稿は draft 状態のまま保持されていること」（end-to-end-execution.md）が承認時公開と衝突する
    resolution: 完了検証を set-state の公開記録を判定鍵とする条件化で解消する（未承認→draft 維持確認／承認済み→公開完了確認／代行・利用者手動→記録と実状態の一致確認。未承認なのに公開済み検出時は不整合として報告停止。already-published 検出時は冪等に記録完了扱い）。アーキテクチャ助言 A9（確信度: 中高）を採用。
  - id: CR-003
    conflict: contracts.test.ts の forbidden リストが release_publish・release_create_published を機械禁止しており、カタログ追加と衝突する
    resolution: 正規化に伴い forbidden リストから release_publish・release_create_published を除去し、release_publish の入力契約検査（承認根拠必須・拒否系）へ置換する。release_update・release_delete は禁止維持、release_create への公開相当フィールド拒否テストは維持する（アーキテクチャ助言 A4、確信度: 高）。テストヘッダコメント・テスト名・カタログ列挙（19→20操作）・Tool description の自己記述も同時更新する。
  - id: CR-004
    conflict: 要件入力の「入力契約は対象リポジトリ・タグ名・公開承認の根拠を必須とする」という列挙と、現行カタログ構造（全操作がリポジトリを runner 境界で一意解決し per-request リポジトリフィールドを持たない）が衝突する
    resolution: 案A（推奨）を採用する。入力契約はタグ名＋承認根拠のみとし、「対象リポジトリ」の要件意図（公開対象が一意に特定されること）は runner 境界の既存保証で満たす。per-request repo フィールドはカタログ対称性を崩し runner 解決との不一致という新たな失敗モードを導入するため設けない（アーキテクチャ助言 A5/A6、確信度: 高/中）。利用者への質問を提示済みであり、要件doc 提示（STEP-10）時点で案B（must-match 確認フィールド）へ差し戻し可能。差し戻し時の影響範囲は AG-001・ACT-REQ-002・ACT-DESIGN-001 の3箇所に限定的。

operation_units:
  - ou_id: OU-001
    target_req: REQ-114
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    target_req: REQ-039
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      bun test（cwd: src/common/tools/agentdev-gh）で release_publish の入力契約テストを実行する。承認根拠フィールドの欠落・空文字・形式不正、および契約外フィールド（draft、publish、published 等）を含む要求を投入する。
    pass_criteria: |
      いずれの不正要求も runner 呼出前に構造化失敗（missing-field / invalid-field / unknown-field）として拒否されること。副作用（draft 解除）が実行されないこと。
    on_failure: |
      fix-and-reverify（入力契約の検証順序または許可フィールド列表の誤りであるため、実装修正後に同一検証を再実行する）
  - id: TS-002
    target_item: AG-001
    verification: |
      モック runner による単体テストで、draft Release 存在状態から release_publish を実行し、読戻し（draft=false・publishedAt）を検証する。読戻し伝播遅延の再照合、公開済み（draft=false）検出時の副操作なし報告、タイトル・本文・prerelease の不変も併せて検証する。
    pass_criteria: |
      draft 解除の副作用が実行され、読戻しで draft=false・published_at が確認された場合のみ成功すること。公開済み検出時は副操作を実行せず検出結果を報告すること。他フィールドに変更が生じないこと。
    on_failure: |
      fix-and-reverify（検証・読戻し経路の実装誤りであるため、実装修正後に再検証する）
  - id: TS-003
    target_item: AG-002
    verification: |
      bun test で contracts.test.ts を実行する。カタログ列挙（20操作）、forbidden リスト（release_update・release_delete 残存、release_publish・release_create_published 除去）、release_create の公開相当フィールド（draft、published、publish、make_latest）拒否の各テストを確認する。
    pass_criteria: |
      全テスト合格。release_publish がカタログに存在し、release_update・release_delete はカタログ外のままであること。release_create への公開相当フィールド拒否が維持されていること。テストヘッダコメント・テスト名・Tool description・agentdev-gh README がカタログ実態と一致すること。
    on_failure: |
      fix-and-reverify（カタログと契約テストの同期不備であるため、実装とテストを整合させて再検証する）
  - id: TS-004
    target_item: AG-003
    verification: |
      ADF本体の隔離検証環境（GitHub 版隔離検証環境。REQ-116 の管理者事前準備）で、Release 草稿作成→公開権限 HITL 承認→release_publish（承認根拠付き）→draft=false・published_at 読戻し→set-state リリース状態への workflow 実行記録までを実際に実行して実測する。必要な環境・権限がなく確認できない条件は合格ではなく未検証として扱う（REQ-114-013 準拠）。
    pass_criteria: |
      承認から set-state 記録までが途切れなく実行され、set-state の公開欄に workflow 実行（承認根拠参照を含む）が記録されること。
    on_failure: |
      fix-and-reverify（公開途中の失敗は既存の再開規律〔タグ不移動・再作成なし〕に従い、already-published 検出を記録完了として扱った上で不具合を修正して再検証する）
  - id: TS-005
    target_item: AG-003
    verification: |
      stage 7 の公開権限 HITL 選択肢の文言（または選択肢生成箇所）と、実際に呼び出せるカタログ操作（release_publish の有無）を突合する検証を実施する（文言一元化または選択肢生成の突合の実現方式に応じた検査）。
    pass_criteria: |
      公開を促す選択肢を選択した場合に workflow が公開まで実行できること。workflow が履行できない選択肢が提示されないこと。
    on_failure: |
      fix-and-reverify（選択肢文言と実行能力の不一致は本要件の完了条件そのもののため、修正して再検証する）
  - id: TS-006
    target_item: AG-004
    verification: |
      release_publish 実行前後で、既存 Release（他の版タグ）の本文・公開状態・prerelease が変化しないことを読戻しで確認するテストを実行する。RC タグの prerelease=true が公開後も維持されることを含める。
    pass_criteria: |
      対象 Release の draft 解除のみが行われ、他の Release および対象のタイトル・本文・prerelease に変化がないこと。
    on_failure: |
      fix-and-reverify（draft 解除以外の副作用が混入しているため、実装修正後に再検証する）
  - id: TS-007
    target_item: AG-006
    verification: |
      git 履歴に既存 RU 番号が存在する状態（履歴上は消費済みでディレクトリ現状には存在しない番号を含む）で backlog-review の採番を試行し、提案番号が履歴使用番号と衝突しないことを確認する。
    pass_criteria: |
      履歴上使用された番号が提案されず、次の未使用番号が採番されること。履歴検査の実施が進捗記録に残ること。
    on_failure: |
      fix-and-reverify（採番ロジックの検査範囲漏れであるため、修正後に再検証する）
  - id: TS-008
    target_item: AG-006
    verification: |
      git 履歴の参照が不能な状態（履歴なし・検査手段が失敗する条件）で採番を試行する。
    pass_criteria: |
      採番が確定されず、理由が報告されること（fail-closed）。履歴検査不能が成功扱いにされないこと。
    on_failure: |
      fix-and-reverify（fail-closed の逸脱は安全境界の欠陥であるため、修正後に再検証する）
  - id: TS-009
    target_item: AG-005
    verification: |
      case-ready の Decision 受理評価（STEP-3）で、新規 Decision の部分置換関係（supersedes DEC-060 部分）、承認境界維持の明記、REQ-114-010/016 変更後行および Design 4ファイル（custom-tool-contracts、agentdev-workflow-backlog-auto、backlog-auto command、agentdev-backlog-integration）の反映内容との一致を照合する。
    pass_criteria: |
      relations 宣言（supersedes DEC-060 部分置換・relates-to DEC-059/DEC-039）と承認境界維持の明記があり、REQ 行・Design 本文との矛盾がないこと。
    on_failure: |
      fix-and-reverify（受理評価での差戻しは req-define 再合意経路で解消する）

realization_actions:
  - id: RA-001
    concern: agentdev_gh Tool 実装への release_publish 追加
    responsibility: src/common/tools/agentdev-gh/ の操作スペック・契約型・カタログ登録・runner 写像に release_publish を追加する
    ownership_hints:
      - src/common/tools/agentdev-gh/specs-release.ts（release_publish spec: validate はタグ名・承認根拠必須と unknown-field 拒否、verify は draft=false・published_at 読戻し・伝播遅延吸収・already-published 検出）
      - src/common/tools/agentdev-gh/contracts.ts（GhToolRequest/GhToolSuccess へ release_publish 型追加、release_read 正規化出力への publishedAt 追加）
      - src/common/tools/agentdev-gh/index.ts（操作カタログ登録・Tool description 文字列の更新）
      - src/common/tools/agentdev-gh/runner-cli.ts（draft 解除の gh CLI / REST API 写像）
    intent: 承認根拠必須の fail-closed な公開操作（draft 解除のみ・他フィールド不変・GitHub 接続専用）を実装する
    verification_refs: [TS-001, TS-002, TS-006]
    source_items: [AG-001, AG-004]
  - id: RA-002
    concern: 契約テストと Tool 周辺の自己記述更新
    responsibility: contracts.test.ts の forbidden 除去・入力契約検査追加・列挙更新と、README・Tool description 等の自己記述同期
    ownership_hints:
      - src/common/tools/agentdev-gh/tests/contracts.test.ts（forbidden から release_publish・release_create_published 除去、release_publish 入力契約検査追加、19操作→20操作列挙、ヘッダコメント・テスト名更新、release_create の公開相当フィールド拒否テスト維持）
      - src/common/tools/agentdev-gh/README.md（操作一覧への Release 操作・release_publish 記載。現状16操作表記の陳腐化解消を含む）
      - src/opencode/plugins/agentdev-gh-tool/（Tool description の同期）
    intent: カタログ変更と機械強制・自己記述の同期を保つ
    verification_refs: [TS-003]
    source_items: [AG-002]
  - id: RA-003
    concern: backlog-auto stage 7 の承認時公開接続
    responsibility: Workflow Skill 本文・reference の Release 記録手順・HITL 選択肢・set-state 記録・完了検証の条件化
    ownership_hints:
      - src/common/skills/agentdev-workflow-backlog-auto/SKILL.md（副作用節の「承認後の所定経路」文言更新）
      - src/common/skills/agentdev-workflow-backlog-auto/references/end-to-end-execution.md（Release 記録手順への承認時 release_publish 呼出追加、完了検証の条件化、「公開操作が実行されていないこと」完了不変条件の条件化、「公開操作の実行経路」節の更新、HITL 選択肢文言と実行能力の突合または文言一元化）
      - set-state リリース状態スキーマ（公開実行形態欄: workflow 実行／代行／利用者手動の区別）
    intent: 承認→release_publish→draft=false 読戻し→set-state 記録の E2E 接続と、履行不能な選択肢の排除
    verification_refs: [TS-004, TS-005]
    source_items: [AG-003]
  - id: RA-004
    concern: backlog-review の RU 採番履歴検査実装
    responsibility: RU 採番規則の実装面への git 履歴検査組込みと進捗記録
    ownership_hints:
      - src/common/skills/agentdev-backlog-integration/references/integration-judgment.md（RU 生成の採番規則に git 履歴検査を追加）
      - src/common/skills/agentdev-workflow-backlog-review/（採番実行箇所・進捗記録への履歴検査実施記録）
    intent: 消費済み・削除済み RU 番号との衝突防止（検査不能時は採番確定せず報告）
    verification_refs: [TS-007, TS-008]
    source_items: [AG-006]

assembly_evidence:
  - target_file: docs/requirements/REQ-114.md
    target_content_sha256: 8c71eca60d928a7349f78550ad9ab5518c7814aff652567f0177a6d89e10634f
    check_scope: {heading: "## 要件", start_line: 12, end_line: 33}
    execution_conditions: {operation: replace, edit_sha256: 80bc667e6f007d4e18a881c4b31d1bd072bc387fdaef7b92f402112180627046, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:32:09.609Z"
  - target_file: docs/requirements/REQ-114.md
    target_content_sha256: 8c71eca60d928a7349f78550ad9ab5518c7814aff652567f0177a6d89e10634f
    check_scope: {heading: "## 要件", start_line: 12, end_line: 33}
    execution_conditions: {operation: replace, edit_sha256: 0e14da19c1daf5405cb5f4dd65876001888733688a4f01240e1b2e6175894261, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:32:09.691Z"
  - target_file: docs/requirements/REQ-039.md
    target_content_sha256: a14da6636e7640effd0d2ffa6073fa49c76c5ee989b22537d313ab5e93e5b21b
    check_scope: {heading: "## 要件", start_line: 15, end_line: 25}
    execution_conditions: {operation: append, edit_sha256: fef25c83c7aa2202cc4684e1c804f577325201381f9b0453a95d24bc54a7a714, expected_old_count: null}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 2, all_ok: true}, post: {count: 2, all_ok: true}}
    diff_compact: {changed_lines_count: 2, added: 2, removed: 0}
    executed_at: "2026-10-20T01:35:31.984Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: e5f8ccd511fdebc935853177f0df4f600b8fbd07231e7bb5c2e308e42271e3a6
    check_scope: {heading: "## 対象操作の境界（初期セット）", start_line: 38, end_line: 101}
    execution_conditions: {operation: replace, edit_sha256: 2ab41655f8e483a77c9eb01bdf0365de2048ecd0c2ba67e5a57bfcf8453088d0, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:32:09.859Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: e5f8ccd511fdebc935853177f0df4f600b8fbd07231e7bb5c2e308e42271e3a6
    check_scope: {heading: "## 対象操作の境界（初期セット）", start_line: 38, end_line: 101}
    execution_conditions: {operation: replace, edit_sha256: 89e83d27acd73dae5867c1337d0670798eb4759859390bd49acd9b700419f953, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:35:32.076Z"
  - target_file: docs/designs/skills/agentdev-workflow-backlog-auto.md
    target_content_sha256: 140062c40e6bbdc144d01f3340fda395c2ae29892bb6ab60a22ecd877fb57279
    check_scope: {heading: "### リリース手順シーケンスと再開経路", start_line: 96, end_line: 105}
    execution_conditions: {operation: replace, edit_sha256: 7237846c60998ee482fec8046fe729182cff4d62efe3e393cf11b73fe92c0873, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:35:32.163Z"
  - target_file: docs/designs/skills/agentdev-workflow-backlog-auto.md
    target_content_sha256: 140062c40e6bbdc144d01f3340fda395c2ae29892bb6ab60a22ecd877fb57279
    check_scope: {heading: "### リリース手順シーケンスと再開経路", start_line: 96, end_line: 105}
    execution_conditions: {operation: replace, edit_sha256: d2f4077482dba6cfcb32f758800fe7056aad03c36c7e6aa00779e2b8ad1ea091, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 2, added: 2, removed: 1}
    executed_at: "2026-10-20T01:35:32.251Z"
  - target_file: docs/designs/skills/agentdev-workflow-backlog-auto.md
    target_content_sha256: 140062c40e6bbdc144d01f3340fda395c2ae29892bb6ab60a22ecd877fb57279
    check_scope: {heading: "### 委譲", start_line: 106, end_line: 110}
    execution_conditions: {operation: replace, edit_sha256: 21270010174c18239e66d69cda7de5cad345acd1826a9eb2b0f49821a423024e, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:36:16.494Z"
  - target_file: docs/designs/commands/backlog-auto.md
    target_content_sha256: b69ef06845f72e279a4aa895240c52047d992fda5e336b390a799698f72cee0b
    check_scope: {heading: "## 副作用", start_line: 30, end_line: 36}
    execution_conditions: {operation: replace, edit_sha256: c1f9a4f53c50e97e6b52296351c2bdd8657bb5dfdcb29ab8dc68b3cb923fd1b7, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:36:16.605Z"
  - target_file: docs/designs/commands/backlog-auto.md
    target_content_sha256: b69ef06845f72e279a4aa895240c52047d992fda5e336b390a799698f72cee0b
    check_scope: {heading: "## 一気通貫実行の拡張（REQ-114）", start_line: 69, end_line: 82}
    execution_conditions: {operation: replace, edit_sha256: 4f0dc8574548effbe176be54bf47b5cdf77fca00c9b122433647607a54de2065, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:36:16.720Z"
  - target_file: docs/designs/skills/agentdev-backlog-integration.md
    target_content_sha256: 28acc0b7592ee71a6f04aa82cb2431034f4226a1dd3384b8af2f00f76c03c31f
    check_scope: {heading: "## 提供する判断、操作", start_line: 22, end_line: 28}
    execution_conditions: {operation: replace, edit_sha256: 95c666e19cfcbf9999d361f8bd281b437a2dc08771de0234876766060c7b5e9d, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:36:16.838Z"
  - target_file: docs/designs/skills/agentdev-backlog-integration.md
    target_content_sha256: 28acc0b7592ee71a6f04aa82cb2431034f4226a1dd3384b8af2f00f76c03c31f
    check_scope: {heading: "## 検証観点", start_line: 46, end_line: 52}
    execution_conditions: {operation: replace, edit_sha256: cb6a5b2d8d46240f94e6e34c6734e927517b7b611729a06aa7f8cb209ebe8852, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:36:16.940Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: e5f8ccd511fdebc935853177f0df4f600b8fbd07231e7bb5c2e308e42271e3a6
    check_scope: {heading: "## 対象操作の境界（初期セット）", start_line: 38, end_line: 101}
    execution_conditions: {operation: replace, edit_sha256: 8128992dc54201207956110fdc7035b818cf75483005ec8462317e5df72e534f, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:40:04.654Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: e5f8ccd511fdebc935853177f0df4f600b8fbd07231e7bb5c2e308e42271e3a6
    check_scope: {heading: "## 対象操作の境界（初期セット）", start_line: 38, end_line: 101}
    execution_conditions: {operation: replace, edit_sha256: 2cbd15153ff1d5f86dd17817af88f050191a052ed8067bdcdd76bc2f7897e3f8, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:40:04.742Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: e5f8ccd511fdebc935853177f0df4f600b8fbd07231e7bb5c2e308e42271e3a6
    check_scope: {heading: "## 対象操作の境界（初期セット）", start_line: 38, end_line: 101}
    execution_conditions: {operation: replace, edit_sha256: c8804add0b050020d3f234844f4140b04807d6a88b81ccc3077c543bbb02ed9a, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: 0.1.0, settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-20T01:40:04.829Z"

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

## 適用時の注意（下流工程向け）

- ACT-REQ-003（REQ-039-007 行追加）: 組立検査は append モード（anchor: 要件）で実施しており、スクリプトの append は節末尾に区切り空白行を挿入する。テーブル行の適用では空白行を挟まず REQ-039-006 行の直後に連結して挿入すること（表構造維持）。列構造は実ファイルと突合済み（2列: ID/要件）。
- 提示時確認事項（CR-004）: release_publish の入力契約はタグ名＋承認根拠のみ（対象リポジトリは runner 境界で解決、案A）。案B（per-request repo フィールド）へ差し戻す場合、AG-001・ACT-REQ-002・ACT-DESIGN-001 の3箇所を更新する。
