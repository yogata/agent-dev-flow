---
draft_type: req_draft
topic_slug: agentdev-gh-operation-contract-overhaul
status: saved
created_at: "2026-09-08T18:00:00+09:00"
source_rus:
  - session:2026-09-08-agentdev-gh-operation-contract-reliability
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  agentdev_gh の GitHub I/O 操作契約を、追跡Issueの部分更新不変条件・再オープン状態遷移、
  Comment 操作の分離（comment_create/list/update/delete と commentId）、一覧完全性、
  pr_read.body と pr_update、READ/WRITE VERIFY 意味の分離、操作単位の厳密な入力契約、
  失敗分類の区別、GitHub版/Local版の外部契約同値性の各観点で一体的に是正する。
  変更先は REQ-011 の行更新・追記と、custom-tool-contracts・agentdev-issue-tracking・
  local-case-file の3 Design 更新であり、実現面は Tool 契約型・engine・両 runner・
  plugin スキーマ・呼出元文書・テストにまたがる（scale: large、Epic 構成候補）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      agentdev_gh の Issue 更新（issue_update）は、追跡Issue（role: tracking）に対する部分更新において、
      明示的に変更を要求していない追跡軸（role、kind、trackingState）を保持する。
      通常ラベルの置換指定は通常ラベル軸のみに作用し、要求対象外の追跡軸を変化させない。
      kind または trackingState を個別に変更した場合も、要求対象外の追跡軸が保持される。
      WRITE 後の VERIFY は、要求した更新内容の反映に加えて、保持対象の追跡軸が維持されたことを確認する。
      VERIFY の照合対象は追跡軸の完全一致と要求通常ラベルの包含とし、確認時点での第三者による
      通常ラベル追加を不変条件違反として失敗扱いにしない。なお現行 GitHub 実装では labels のみの更新が
      追跡ラベルを剥離して追跡Issueが Case Issue 化し得ることを本項は是正する。
  - id: AG-002
    content: |
      agentdev_gh の追跡Issue再オープン（issue_reopen）は、GitHub 上の open 状態への復帰に加えて、
      追跡Issue状態遷移の正を所有する Design が定める再オープン遷移（クローズ済みから検討中への遷移）に従って
      trackingState を遷移させ、Tool が状態ラベルの機械適用を行う。
      再オープンによって kind と通常ラベルを失わない。対象が既に open の追跡Issueへの再オープンは
      要求された状態（open および遷移適用後の追跡状態）の確認をもって冪等に成功とする。
      Case Issue（role: case）には追跡Issue固有の状態遷移を適用しない。
  - id: AG-003
    content: |
      agentdev_gh は Comment 操作として、コメント作成（comment_create）、コメント一覧（comment_list）、
      コメント更新（comment_update）、コメント削除（comment_delete）を独立した操作として提供する。
      現行の issue_comment 操作（body あり＝追加、body なし＝読取の二重モード）は正規操作カタログから廃止する。
      Comment は Issue と Pull Request の会話コメントを同一の論理リソースとして扱う。
      ADF 内部の呼出元（commands / skills / workflow 文書、テンプレート対応表、case 系 workflow の
      作業ログ追記手順）はすべて新 Comment 操作へ移行する。移行完了までの間、旧 issue_comment を
      一時的に温存し、呼出元移行完了後に廃止する。
  - id: AG-004
    content: |
      comment_list の各要素は少なくとも commentId、body、createdAt、updatedAt、url を返す。
      comment_update および comment_delete は commentId を対象識別子として使用する。
      commentId の公開型は文字列に統一する（GitHub の数値コメント id は文字列化して返す）。
      GitHub版と Local版では物理的な識別方法が異なってよいが、呼出側から見える commentId の役割と
      操作契約は同一とする。updatedAt は最終更新日時を表し、更新操作を適用していないコメントに
      ついては createdAt と同一の値を返す。
  - id: AG-005
    content: |
      comment_create は作成した Comment を commentId で識別し、作成結果を読み戻して本文が作成内容と
      一致することを確認した後に成功を返す。comment_update は同一 commentId の本文が更新値と一致することを、
      comment_delete は対象 commentId が削除済みであることを確認した後に成功を返す。
      Issue / Pull Request の open / closed 状態を Comment WRITE の成功判定に使用しない。
  - id: AG-006
    content: |
      issue_list および comment_list は、完全一覧として成功結果を返す場合、内部ページングや件数上限によって
      結果を黙って切り捨てない。上位 workflow に GitHub API のページングを意識させないことを基本とし、
      Tool 内部で必要なページを取得する。安全上の上限等によって完全取得できない場合は、不完全な結果を
      完全な成功結果として返さない（失敗として扱い、再試行可能な失敗として返す）。
      フィルタ可能な軸はサーバ側絞り込みで上限到達可能性を低減する実装義務を Design が定める。
  - id: AG-007
    content: |
      pr_read の成功結果は Pull Request 本文（body）を含む。Pull Request 更新操作（pr_update）を提供し、
      対象は少なくとも title と body とする。pr_update は title / body 項目単位の部分更新であり、
      指定されていない項目は保持する。更新後は読み戻しによって要求値が反映されたことを確認する。
      Pull Request 本文の論理的な範囲（GitHub 版の PR 本文全体と、ローカル版における対応セクション群）は
      Design が定める物理写像に従い、読み取りと更新が round-trip 可能な同一の論理範囲を対象とする。
  - id: AG-008
    content: |
      VERIFY の意味を READ と WRITE で分離する。WRITE は副作用によって要求した状態が実際に反映されたことを
      読み戻して確認する。READ は取得結果の構造および契約上必要な意味的整合性を確認する。
      時間によって変化し得る READ 値について、連続した複数回の読取値が同一であることを成功条件としない。
      pr_mergeable はこの原則に従い、取得した GitHub 状態を正規化して返し、直後の再読取値との一致を
      要求しない。
  - id: AG-009
    content: |
      agentdev_gh の各操作は、その操作が受理するフィールドを操作単位で定義する。
      操作の入力定義に存在しないフィールドを含む要求は副作用発生前に invalid-input として拒否し、
      必須フィールドの不足も副作用発生前に invalid-input として拒否する。
      invalid-input の結果から問題となったフィールドまたは不足フィールドを特定できる情報を返す。
      一つの flat schema に操作ごとの必須条件を文章だけで補う状態を解消し、公開される Tool スキーマと
      実行時 validator が矛盾しない（実行時検証が公開スキーマより厳密であることを妨げない）。
  - id: AG-010
    content: |
      失敗の意味として少なくとも invalid-input（呼出要求が操作契約に違反）、operation-failed
      （外部操作が実行されたが GitHub 等から拒否または失敗。存在しない対象への操作を含む）、
      verification-incomplete（WRITE 実行後に結果確認を完了できない）、enforcement-crashed
      （Tool / runner 自体が正常に処理を継続できない異常）を区別して返す。
      入力契約違反、外部サービス失敗、VERIFY 失敗、Tool 自体の異常を同一理由へ集約しない。
      存在性は入力妥当性ではない（構造的に有効な入力で対象が存在しない場合は operation-failed）。
  - id: AG-011
    content: |
      本要件で定義する外部操作契約は GitHub版と Local版の双方へ適用する。少なくとも操作名、入力構造、
      出力構造、Comment 識別概念（commentId の役割と公開型）、Issue の論理状態遷移、READ / WRITE の
      成功意味、Failure の意味を同値とする。保存方式や外部サービス固有の物理実装の同一性は要求しない。
      物理写像に起因する値域差異（ローカル版追跡Issueの通常ラベル非許容等）および role: case の
      状態モデルに起因する受理条件差（ローカル版 case の再オープン拒否）は、Design が所有する
      物理写像・状態モデルの差異として Design に明示する。
  - id: AG-012
    content: |
      本要件の変更によって、対象外として合意された GitHub 機能（Issue 削除、Pull Request の close / reopen、
      Pull Request review、inline review comment、assignee、milestone、GitHub Projects、lock / unlock、
      pin / unpin、pr_update による base branch 変更と draft 状態変更、GitHub API 全機能網羅）を
      新たに操作カタログへ追加しない。確定後の操作カタログは16操作
      （基本: issue_create、issue_read、issue_update、issue_close、pr_create、pr_read、pr_merge、
      pr_changed_files、pr_mergeable、pr_update、追跡Issue: issue_list、issue_reopen、
      Comment: comment_create、comment_list、comment_update、comment_delete）とし、
      操作カタログの完全列挙を固定する契約テストで検証する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-011.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012]
    content: |
      REQ-011 の要件表を次のとおり更新・追記する。

      更新行:
      | REQ-011-022 | GitHub I/O を担う Custom Tool の操作契約は、追跡Issueの管理に必要な Issue 一覧・検索（role、kind、state 等による絞り込みを含む構造化結果）、Issue 単体読取のメタデータ（title、state、labels、role/kind/状態写像に必要な情報を含む）、Issue 本文・メタデータ更新（labels 更新を含む）、Issue コメントの作成・一覧・更新・削除（Comment を Issue と Pull Request の共通の論理リソースとして扱い、一覧・更新・削除はコメント識別子（commentId、公開型は文字列）を対象識別として使用する）、Issue クローズ、Issue 再オープンを上位層へ提供すること。コメント追加とコメント読取を単一操作の引数有無で兼ねる二重モード操作を正規操作カタログに含まないこと |
      | REQ-011-023 | 追加・変更を行う操作（WRITE）は Tool 内 VERIFY として、副作用そのものを読み戻し、要求した更新内容の反映と操作契約が定める保持対象の不変条件の維持を確認してから成功を返すこと。読み取り操作（READ）は取得結果の構造と契約上必要な意味的整合性を確認すること。時間変化し得る READ 値について連続した複数回の読取値の一致を成功条件としないこと |
      | REQ-011-024 | GitHub 版とローカル版は同一の上位操作契約（操作名、入力構造、出力構造、Comment 識別概念、Issue の論理状態遷移、READ / WRITE の成功意味、失敗の意味）を提供すること。ローカル版は .agentdev/issues/ のローカルIssueの読み書きを同一契約で実装すること。物理値域および受理条件の差異のうち物理写像・状態モデルに起因するものは Design が定めること |

      追記行:
      | REQ-011-025 | Issue 更新は部分更新として、変更を要求していない追跡Issue軸（role、kind、trackingState）を保持すること。通常ラベルの置換指定は通常ラベル軸のみに作用し、要求対象外の追跡軸を変化させないこと。VERIFY は追跡軸の維持を確認すること |
      | REQ-011-026 | Issue 再オープンは追跡Issueについて、追跡Issue状態遷移の正を所有する Design が定める再オープン遷移に従って追跡状態を遷移させ、kind と通常ラベルを保持すること。Case Issue には追跡Issue固有の状態遷移を適用しないこと |
      | REQ-011-027 | Issue 一覧・検索とコメント一覧は、完全一覧として成功結果を返す場合に内部ページングや件数上限によって結果を黙って切り捨てないこと。安全上の上限によって完全取得できない場合、不完全な結果を完全な成功結果として返さないこと |
      | REQ-011-028 | 各操作は操作単位の入力定義を持ち、操作契約に存在しないフィールドを含む要求と必須フィールドが不足する要求を副作用の発生前に拒否すること。拒否した場合、問題となったフィールドまたは不足フィールドを特定できる情報を返すこと。公開される Tool スキーマと実行時 validator が矛盾しないこと |
      | REQ-011-029 | 失敗の意味は、入力契約違反、外部操作の失敗（存在しない対象への操作を含む）、WRITE 実行後の結果確認未了、Tool / runner 自体の異常を区別すること。外部操作の失敗と Tool / runner 自体の異常を同一分類へ集約しないこと |
      | REQ-011-030 | Pull Request 読取（pr_read）は Pull Request 本文（body）を成功結果に含むこと。Pull Request 更新操作（pr_update）を提供し、title と body を項目単位の部分更新（指定されていない項目の保持）の対象とし、読み戻しによって要求値の反映を確認してから成功を返すこと |

      適用範囲（対象外）への追記:
      - 操作カタログ拡張に伴う対象外: Issue 削除操作、Pull Request の close・reopen 操作、Pull Request review の作成、inline review comment の作成・編集・削除、assignee 操作、milestone 操作、GitHub Projects 操作、lock / unlock、pin / unpin、pr_update による base branch 変更と draft 状態変更、GitHub API 全機能の網羅
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-011, AG-012]
    content: |
      操作カタログを以下の16操作へ再定義する。

      - 基本操作: issue_create、issue_read、issue_update、issue_close、pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable、pr_update（新規）
      - 追跡Issue操作: issue_list、issue_reopen
      - Comment 操作（新規）: comment_create、comment_list、comment_update、comment_delete。Comment は Issue と Pull Request の会話コメントを同一の論理リソースとして扱う。comment_list の各要素は commentId、body、createdAt、updatedAt、url を返す。comment_update と comment_delete は commentId を対象識別子として使用する。commentId の公開型は文字列とし、GitHub 実装は数値コメント id を文字列化する
      - 廃止: issue_comment（body あり＝追加、body なし＝読取の二重モード）。正規操作カタログから除去し、ADF 内部の呼出元は Comment 操作へ移行する。移行完了までの間は一時的に温存する
      - pr_read の拡張: 成功結果に Pull Request 本文（body）を含む。本文の論理的な範囲はローカル版の物理写像（ローカルIssue共通スキーマ Design）に従い、読み取りと更新が round-trip 可能な同一の論理範囲（ローカル版ではマージ前確認・Design確定候補・Findings / Capture候補の3セクション群の直列化）とする
      - pr_update: title と body を対象とする項目単位の部分更新操作。指定されていない項目は保持し、更新後は読み戻しによって要求値の反映を確認する。ローカル版では Pull Request タイトルの正をマージ前確認セクション内の PR タイトル行とし、pr_update の title は同行を置換する
      - issue_update の部分更新不変条件: 変更を要求していない追跡Issue軸（role、kind、trackingState）を保持する。VERIFY の照合対象は追跡軸の完全一致と要求通常ラベルの包含とし、確認時点での第三者による通常ラベル追加を不変条件違反として失敗扱いにしない
      - issue_reopen の追跡Issue状態遷移: agentdev-issue-tracking Design が所有する再オープン遷移（クローズ済み→検討中）を Tool が状態ラベルの機械適用によって実現する。kind と通常ラベルを保持し、Case Issue には追跡状態遷移を適用しない。既に open の追跡Issueへの再オープンは要求的状態の確認をもって冪等に成功とする

      VERIFY 適用（READ / WRITE 分離）:
      - WRITE 操作（issue_create、issue_update、issue_close、issue_reopen、comment_create、comment_update、comment_delete、pr_create、pr_update、pr_merge）: 副作用そのものを読み戻し、要求した状態の反映と保持対象不変条件の維持を確認する。Comment WRITE は対象 Comment の存在・本文で判定し、Issue / Pull Request の open / closed 状態を成功証拠として使用しない
      - READ 操作（issue_read、issue_list、comment_list、pr_read、pr_changed_files、pr_mergeable）: 取得結果の構造と契約上必要な意味的整合性を確認する。時間変化し得る値（mergeable 等）について連続読取の一致を要求せず、取得時点の状態を正規化して返す。pr_mergeable は単一読取の正規化結果を返し、直後の再読取との一致確認を行わない

      一覧完全性:
      - issue_list と comment_list は Tool 内部で必要なページをすべて取得し、完全一覧として返す。上位層は GitHub API のページングを指定しない
      - フィルタ可能な軸（state、labels 等）はサーバ側絾り込みクエリへ推送し、安全上限への到達可能性を低減する。上限値は本 Design のパラメータとして定義する
      - 安全上の上限によって完全取得できない場合は再試行可能な失敗（operation-failed）として扱い、不完全な一覧を完全な成功結果として返さない。呼出側の回避手順（期間分割等）は各 workflow 文書が定める

      失敗分類の判定規則:
      - 存在しない対象（Issue 番号、commentId、PR 番号）への操作は、入力が構造的に有効であれば operation-failed とする（存在性は入力妥当性ではない）
      - runner 実行時の外部操作失敗（gh / GitHub API の HTTP エラーを含む）は operation-failed に分類し、Tool / runner 自体の異常終了のみを enforcement-crashed に分類する
      - WRITE 実行後に読み戻し確認を完了できない場合は verification-incomplete とする

      GitHub版 / Local版等価性:
      - 両版は操作名、入力構造、出力構造、Comment 識別概念（commentId の役割と公開型）、Issue の論理状態遷移、READ / WRITE の成功意味、失敗の意味を同値とする
      - 物理写像に起因する値域差異（ローカル版追跡Issueの通常ラベル非許容。agentdev-issue-tracking Design の値域定義に従う）と、role: case の状態モデルに起因する受理条件差（ローカル版 case の再オープン拒否。ローカルIssue共通スキーマ Design の状態遷移に従う）は、本 Design が例外として明示する

      操作カタログの完全列挙（16操作）は契約テストで固定し、対象外機能の追加を検出する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 操作契約の構成要素
    source_items: [AG-009, AG-010]
    content: |
      操作契約の構成要素に入力契約と失敗分類の厳格化を追加する。

      入力契約（操作単位の定義）:
      - 各操作は操作単位の入力フィールド定義（必須、任意、型）を持ち、操作の入力定義に存在しないフィールドを含む要求は副作用発生前に invalid-input で拒否する
      - 必須フィールドの不足も副作用発生前に invalid-input で拒否し、問題となったフィールドまたは不足フィールドを特定できる情報（フィールド名を含む）を返す。検証結果は構造化されたエラー情報として操作スペックから engine へ返す
      - 一つの flat schema に操作ごとの必須条件を文章だけで補う運用を解消する。公開される Tool スキーマは契約型（contracts.ts）に追従し、実行時 validator と矛盾しない。実行時検証が公開スキーマより厳密であることを妨げない。スキーマと validator の一致性（実行時受理集合が公開スキーマ許容集合に含まれること）はテストで検証する

      失敗分類:
      - GhToolFailureKind は invalid-input、operation-failed、verification-incomplete、enforcement-crashed、config-uninterpretable、path-unresolvable の6種を維持し、相互に集約しない
      - runner と engine の間の実行応答は失敗クラス情報を持ち、外部操作の失敗（HTTP エラー、対象不在）と Tool / runner 自体の異常を engine が区別して分類する
      - 入力契約違反は invalid-input とし、外部操作の失敗・検証未了・Tool 異常と同一分類に集約しない
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-issue-tracking
    target_area: 確定事項
    source_items: [AG-002, AG-003, AG-005]
    content: |
      確定事項の拡張:

      12. 再オープン遷移（拡張）: 追跡Issueの再オープンは closed → in-discussion（再検討）へ遷移させる。再オープンによって kind と通常ラベルを失わない。GitHub 版では Tool が状態ラベルの再付与によって遷移を機械適用する。ローカル版の role: case は終端状態からの遷移を定義しないため、reopen を拒否する（ローカルIssue共通スキーマ Design の role: case 状態遷移と整合）

      14. Comment 更新・削除の利用規律（新規）: comment_update と comment_delete は Comment を管理する汎用操作として Tool に提供される。追跡Issueの検討経過コメントへの適用は、時系列履歴の整合を損なわない範囲（誤記修正、機密情報の除去、重複の統合、直前誤投稿の訂正等）に限る。適用可否の判断規律の正は agentdev-issue-tracking Capability Skill の操作知識が単一参照点として所有し、操作能力を利用する workflow はこれに従う。本項は検討経過コメントが正規の時系列履歴である要件（REQ-049-012）との整合境界を定める
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: local-case-file
    target_area: コメント読み替えの role 分岐
    source_items: [AG-003, AG-004, AG-005, AG-011]
    content: |
      コメント読み替えと Comment 操作の物理写像（拡張）:

      - Comment 操作（comment_create、comment_list、comment_update、comment_delete）の読み替え先は role により分岐する: role: tracking は `## 検討経過`、role: case は `## 作業ログ` 等の Case 実行のコメント相当情報セクション。両 role のコメント相当エントリは同一の物理形式を採用する
      - コメント相当エントリは安定したコメント識別子を持つ。見出し形式を `### c{NN} {ISO 8601}` とし、commentId の物理表現は `issue-{NNNN}-c{NN}`（公開型は文字列）とする
      - 採番はローカルIssueの frontmatter 項目 `comment_seq`（任意項目。初回コメント書込時に初期化し単調増加）を最高水位標として管理し、削除による欠番は再利用しない。同一Issueへのコメント操作は逐次実行を前提とする（既存の採番前提と同一）
      - role: case の既存の無区切り作業ログ内容は、初回のコメント操作時に先頭エントリ c01 として束ねる（過去分の分割不能に伴う等価性の明示的制約）。新規コメントは c02 以降に採番する
      - comment_list は全エントリを commentId、body、createdAt、updatedAt（未更新なら createdAt と同一値）、url（当該ローカルIssueファイルの絶対パス）で返す
      - comment_update は対象エントリの本文を置換し updated_at を更新する。comment_delete は対象エントリを除去する（git 履歴から復旧可能）
      - 旧形式（`### {ISO 8601}` 見出しのみ）の既存エントリは、最初のコメント書込操作の一部として冪等に新形式へ移行する
      - コメント書込（新規採番・旧形式移行を含む）はファイル全体の原子的書込み（一時ファイル書込み後にリネーム）で行う
      - case 系 workflow の作業ログ追記は comment_create 経由とし、issue_update による本文全体置換の際はコメントエントリ構造を保持して round-trip する

      共通メタデータ表へ `comment_seq`（数値、任意、コメント採番の最高水位標）を追加する。
      `src/opencode-local/agentdev-gh/case-schema/` の機械可読定義（case-file.md、headings.yaml 等）を
      本拡張へ合わせて更新する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: local-case-file
    target_area: PR 系操作の対象解決
    source_items: [AG-007, AG-011]
    content: |
      PR 系操作の対象解決（拡張）:

      - PR 系操作（pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable、pr_update）の対象は role: case のローカルIssueに限る
      - ローカル版における Pull Request 本文の論理範囲は、`## マージ前確認`、`## Design確定候補`、`## Findings / Capture候補` の3セクションの内容を定義順に直列化したものとする。pr_read の body は当該直列化を返し、pr_update の body 指定は当該3セクションの内容を置換する（セクション見出し構造は呼出側の round-trip 責任。GitHub 版の本文全体置換と同一規律）
      - Pull Request タイトルの正は `## マージ前確認` セクション内の PR タイトル行とし、pr_read の title は同行から、pr_update の title 指定は同行を置換する。frontmatter の title はローカルIssue（Issue 側）のタイトルであり Pull Request タイトルの更新対象としない
      - `## マージ前確認` セクションが存在しない場合、pr_read と pr_update は operation-failed とする。セクションが複数存在する場合（pr_create の繰り返し実行時）、最後のセクションを対象とする

      GitHub Issue / PR 置換対応表への追記:
      | GitHub Issue コメント（commentId 付き） | コメント相当セクションの `### c{NN}` エントリ（commentId = issue-{NNNN}-c{NN}） |
      | GitHub PR 本文の読取・更新（pr_read.body / pr_update） | マージ前確認・Design確定候補・Findings / Capture候補の3セクション直列化と PR タイトル行 |

conflict_resolutions:
  - id: CR-001
    conflict: |
      comment_update / comment_delete の可変性と、REQ-049-012「検討経過は Issue コメントを正規の時系列履歴とすること」の緊張。
      Comment 削除・更新が時系列履歴の完全性を損なう可能性がある。
    resolution: |
      Comment 操作は汎用能力として Tool 契約に提供し（利用契約は session で合意済み）、追跡Issueの
      検討経過コメントへの適用規律（時系列整合を損なわない範囲の訂正に限る）の正を
      agentdev-issue-tracking Capability Skill の操作知識へ単一所属させる（REQ-049-007 の単一所有原則に整合）。
      REQ-049 の要件行は変更しない（同 REQ は可変性を禁止しておらず、本文内二重保持のみを禁止している）。
      ローカル版は git 管理により削除済みコメントも履歴から復旧可能である。adversarial-review で指摘された
      「利用 workflow ごとの判断」による判断所有の分散を回避し、Capability Skill 操作知識への集約を採用した。
  - id: CR-002
    conflict: |
      pr_mergeable の二重読取一致確認と、REQ-011-023「読み取り操作は応答の自己整合を確認すること」の解釈。
      mergeable は GitHub 側の非同期計算により変化し得るため、連続読取一致を要求すると偽陰性が発生する。
    resolution: |
      「応答の自己整合」の解釈を構造・意味的整合性に精密化し、時間変動値の連続読取一致を要求しない旨を
      REQ-011-023 の行更新で明文化する。仕様の精密化であり契約変更ではない（architecture advisory 確定）。
  - id: CR-003
    conflict: |
      Pull Request 本文の更新範囲について、GitHub 版は PR 本文全体置換、ローカル版は物理セクション置換となる
      構造差があり、read-modify-write 型の呼出が一方の runner でのみ破壊を生じ得る
      （adversarial-review Stream A 指摘）。
    resolution: |
      ローカル版の「論理 PR 本文」をマージ前確認・Design確定候補・Findings / Capture候補の3セクション直列化と
      定義し、pr_read.body と pr_update.body が同一の論理範囲を round-trip する写像を採用する。
      セクション見出し構造の保持は呼出側規律として GitHub 版の本文全体置換と同一の責務とする。

operation_units:
  - ou_id: OU-001
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    target_req: REQ-011
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result:
status: saved
design_saved: true
      saved_docs:
        - docs/requirements/REQ-011.md
      artifact_action_mapping:
        ACT-REQ-001: docs/requirements/REQ-011.md
      source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
      req_operation: update REQ-011 (-022/-023/-024 updated, -025/-026/-027/-028/-029/-030 added, 対象外 section appended)
      unclassified_verification_rows:
        - REQ-011-025
        - REQ-011-026
        - REQ-011-027
        - REQ-011-028
        - REQ-011-029
        - REQ-011-030
      case_open_input: REQ-011.md（検証対応要否未分類行6行は case-open の段階ゲートで分類完了を要する）
  - ou_id: OU-002
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      status: saved
      saved_designs:
        - docs/designs/responsibilities/custom-tool-contracts.md
      artifact_action_mapping:
        ACT-DESIGN-001: docs/designs/responsibilities/custom-tool-contracts.md#対象操作の境界（初期セット）
        ACT-DESIGN-002: docs/designs/responsibilities/custom-tool-contracts.md#操作契約の構成要素
  - ou_id: OU-003
    target_design: docs/designs/skills/agentdev-issue-tracking.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result:
      status: saved
      saved_designs:
        - docs/designs/skills/agentdev-issue-tracking.md
      artifact_action_mapping:
        ACT-DESIGN-003: docs/designs/skills/agentdev-issue-tracking.md#確定事項（12 置換・14 追加）
  - ou_id: OU-004
    target_design: docs/designs/local/local-case-file.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 4
    issue_policy: single
    result:
      status: saved
      saved_designs:
        - docs/designs/local/local-case-file.md
      artifact_action_mapping:
        ACT-DESIGN-004: docs/designs/local/local-case-file.md#コメント読み替えの role 分岐（共通メタデータ表への comment_seq 追記を含む）
        ACT-DESIGN-005: docs/designs/local/local-case-file.md#PR 系操作の対象解決（置換対応表への追記を含む）

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      GitHub 版 agentdev_gh に対し、kind と trackingState を持つ追跡Issueを準備し、
      (a) 通常ラベルのみを指定した issue_update、(b) kind のみを指定した issue_update、
      (c) trackingState のみを指定した issue_update を実行する。
      各操作後に issue_read で role / kind / trackingState / 通常ラベルを読み戻す。
      修正前に現行挙動（labels のみ更新で追跡ラベル剥離・tracking→case 化、VERIFY 通過）を捕捉する
      回帰テストを先に用意する。
    pass_criteria: |
      (a) 実行後に更新前の role / kind / trackingState が保持されていること。
      (b) 実行後に role / trackingState / 通常ラベルが保持されていること。
      (c) 実行後に role / kind / 通常ラベルが保持されていること。
      いずれの場合も追跡Issueが Case Issue 化しないこと。
    on_failure: |
      fix-and-reverify。不変条件保持は契約中核の保護要件であるため、実装を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      クローズ済み追跡Issue（kind・通常ラベル付き）に issue_reopen を実行し、GitHub state、
      trackingState、kind、通常ラベルを読み戻す。加えて、open 状態の追跡Issueへの再実行（冪等性）と、
      Case Issue への issue_reopen を実行する。
    pass_criteria: |
      クローズ済み追跡Issueが open となり trackingState が in-discussion となっていること。
      kind と通常ラベルが失われていないこと。open 済み追跡Issueへの再実行が要求的状態の確認をもって
      成功すること。Case Issue に追跡状態遷移が適用されていないこと。
    on_failure: |
      fix-and-reverify。状態遷移の機械適用は REQ-011-026 の直接要件のため実装を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      修正後に操作カタログ（contracts.ts の GH_TOOL_OPERATIONS と plugin.ts 公開スキーマ）に
      issue_comment が含まれないことを確認する。src/ 配下の commands / skills（references を含む）と
      docs/designs 配下で issue_comment 操作への言及が残っていないことを全文検索で確認する。
      移行完了までの温存期間中は issue_comment が動作し、廃止 Wave で除去されることを確認する。
    pass_criteria: |
      正規操作カタログと公開スキーマから issue_comment が除去されていること。
      ADF 内部の呼出元文書に旧操作への参照が残存していないこと。
      comment_create / comment_list / comment_update / comment_delete が利用可能であること。
    on_failure: |
      fix-and-reverify。移行漏れは検出次第修正する。
  - id: TS-004
    target_item: AG-004
    verification: |
      comment_create を実行し、応答の commentId を記録する。comment_list を実行して当該 commentId の
      エントリを取得し本文を読み戻す。
    pass_criteria: |
      comment_create の応答に作成コメントの commentId（文字列）が含まれること。
      comment_list から同一 commentId の本文が作成内容と一致して取得できること。
    on_failure: |
      fix-and-reverify。
  - id: TS-005
    target_item: AG-004
    verification: |
      コメントが存在する対象（Issue と Pull Request の両方）に comment_list を実行し、
      各要素のフィールド構成を検査する。
    pass_criteria: |
      各要素に commentId / body / createdAt / updatedAt / url が過不足なく含まれること。
      Issue と Pull Request の双方で同一構造となること。
    on_failure: |
      fix-and-reverify。
  - id: TS-006
    target_item: AG-004
    verification: |
      2件以上のコメントが存在する対象に comment_update を実行（対象 commentId と新しい本文を指定）し、
      comment_list で全コメントを読み戻す。
    pass_criteria: |
      指定 commentId の本文だけが更新され、他のコメントが変化していないこと。
      読み戻した本文が要求値と一致すること。
    on_failure: |
      fix-and-reverify。
  - id: TS-007
    target_item: AG-004
    verification: |
      コメントが存在する対象に comment_delete を実行（対象 commentId を指定）し、
      comment_list で対象の存否を確認する。
    pass_criteria: |
      対象 commentId が comment_list に存在しないこと。他のコメントが保持されていること。
    on_failure: |
      fix-and-reverify。
  - id: TS-008
    target_item: AG-006
    verification: |
      31件以上（境界値として35件）のコメントが存在する対象をフィクスチャで準備し、
      comment_list を実行する。GitHub 版はページング経路をスタブ化し、ローカル版は実ファイルで検証する。
    pass_criteria: |
      35件すべてが完全一覧として返されること。先頭30件のみが返される等の黙示切断が発生しないこと。
    on_failure: |
      fix-and-reverify。ページング実装を修正して再検証する。
  - id: TS-009
    target_item: AG-006
    verification: |
      issue_list の安全上限到達時の挙動をスタブで検証する（総件数が上限超、かつ狭いフィルタ
      （例: 特定 kind）を指定したケースを含む）。また上限に到達しない構成では、上位層がページ番号等を
      指定せずに必要な全件を取得できることを確認する。
    pass_criteria: |
      上限到達時に不完全な一覧が完全な成功結果として返されないこと（再試行可能な失敗となること）。
      サーバ側絞り込みにより、総件数が上限超でも狭いフィルタでは完全取得できること。
      上限未到達時に全件が取得できること。
    on_failure: |
      fix-and-reverify。サーバ側絞り込みの実装を修正して再検証する。
  - id: TS-010
    target_item: AG-007
    verification: |
      title と body を持つ Pull Request を準備し、(a) title を指定した pr_update、
      (b) body を指定した pr_update、(c) 両方を指定した pr_update を実行し、pr_read で読み戻す。
      ローカル版は Design確定候補・Findings セクションを含むケースで round-trip を確認する。
    pass_criteria: |
      (a) 実行後に body が保持されていること。(b) 実行後に title が保持されていること。
      (c) 両方が要求値どおり更新されていること。いずれも読み戻し値が要求値と一致すること。
      ローカル版で3セクション直列化の round-trip が成立すること。
    on_failure: |
      fix-and-reverify。
  - id: TS-011
    target_item: AG-008
    verification: |
      pr_mergeable を実行する。GitHub の mergeable が UNKNOWN → MERGEABLE 等へ遷移し得る条件下で
      （スタブで連続読取値を変化させて）成功判定を確認する。
    pass_criteria: |
      pr_mergeable の成功判定が直後の2回目の読取値との一致を必要としないこと。
      取得時点の状態の正規化結果（UNKNOWN を含む）が返ること。
      時間変化し得る READ 値の変化だけを理由に verification-incomplete とならないこと。
    on_failure: |
      fix-and-reverify。VERIFY 意味を READ 契約へ修正して再検証する。
  - id: TS-012
    target_item: AG-005
    verification: |
      comment_create / comment_update / comment_delete の各 WRITE について、VERIFY が対象コメントの
      存在・本文で判定していることをコード検査とスタブ検証で確認する
      （Issue / Pull Request の open / closed 状態を成功証拠に使用していないこと）。
      WRITE 成功後に読み戻しのみが失敗するケースをスタブで再現し、verification-incomplete となることを確認する。
    pass_criteria: |
      各 Comment WRITE が副作用そのものの読み戻しで判定されていること。
      読み戻しのみ失敗時に verification-incomplete が返ること（成功扱いにならないこと）。
    on_failure: |
      fix-and-reverify。
  - id: TS-013
    target_item: AG-009
    verification: |
      各操作について (a) 契約外フィールドを含む要求、(b) 必須フィールド不足の要求を送出する。
      また公開スキーマと実行時 validator の一致性テストを実行する。
    pass_criteria: |
      (a)(b) とも副作用発生前に invalid-input となること。
      失敗結果から問題フィールド名または不足フィールド名を特定できること。
      一致性テスト（実行時受理集合が公開スキーマ許容集合に含まれる）が合格すること。
    on_failure: |
      fix-and-reverify。入力検証の構造化エラー実装を修正して再検証する。
  - id: TS-014
    target_item: AG-010
    verification: |
      (a) 外部 GitHub 操作の失敗（HTTP 404 / 422 をスタブで再現）、(b) Tool / runner 自体の異常終了、
      (c) 存在しない commentId への comment_update、(d) 存在しない Issue 番号への issue_read を実行する。
    pass_criteria: |
      (a) が operation-failed、(b) が enforcement-crashed に分類され、同一分類に集約されないこと。
      (c)(d) が operation-failed となること（構造的に有効な入力であるため invalid-input とならないこと）。
    on_failure: |
      fix-and-reverify。runner・engine の失敗クラス分類を修正して再検証する。
  - id: TS-015
    target_item: AG-011
    verification: |
      GitHub 版と Local 版の両 runner に対し、本要件の対象操作（comment CRUD、issue_update 部分更新、
      issue_reopen、issue_list、comment_list、pr_read、pr_update、pr_mergeable）を同一の入力で実行し、
      出力構造・状態遷移・成功/失敗意味を比較する。ローカル版は c{NN} 採番の単調性（削除後の再利用なし、
      comment_seq 最高水位標）、旧形式エントリの冪等移行、case 既存作業ログの c01 束ね、
      原子的書込み、UTF-8（BOM なし）保持を確認する。値域差異（ローカル版追跡Issueの通常ラベル非許容）と
      case reopen の受理条件差が Design に明示されていることを確認する。
    pass_criteria: |
      対象操作の入力構造・出力構造・commentId の役割と公開型・状態遷移・成功/失敗意味が両版で一致すること。
      物理写像由来の差異が Design に明示されていること。ローカル版の採番・移行・書込み・エンコーディング
      保証がすべて成立すること。
    on_failure: |
      fix-and-reverify。等価性違反は実装を修正して再検証する。Design 明示の漏れは Design 更新で修正する。
  - id: TS-016
    target_item: AG-012
    verification: |
      contracts.test.ts の操作カタログ完全列挙テストが16操作（issue_create、issue_read、issue_update、
      issue_close、pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable、pr_update、issue_list、
      issue_reopen、comment_create、comment_list、comment_update、comment_delete）を固定していることを
      確認する。
    pass_criteria: |
      カタログロックテストが16操作を完全列挙し、対象外操作（Issue 削除、PR close/reopen、review、
      inline review comment、assignee、milestone、Projects、lock/unlock、pin/unpin 等）の追加を
      検出できること。
    on_failure: |
      fix-and-reverify。意図しない操作追加の場合は当該追加を除去する。

realization_actions:
  - id: RA-001
    concern: 操作契約型とカタログの再定義
    responsibility: |
      contracts.ts の操作カタログを16操作へ再構成する。comment_create / comment_list / comment_update /
      comment_delete の要求・成功型（commentId は文字列）、pr_update の要求・成功型、pr_read の body 拡張を
      定義する。issue_comment の型を削除する（廃止 Wave）。失敗種別の意味コメントを更新する。
    ownership_hints:
      - src/opencode/tools/agentdev-gh/contracts.ts
      - src/opencode/tools/agentdev-gh/tracking-schema.ts（ラベル写像参照）
    intent: |
      操作契約の正本体を新しいカタログへ更新し、commentId 文字列統一・pr_update・pr_read.body の
      型基盤を確立する。
    verification_refs: [TS-004, TS-005, TS-016]
    source_items: [AG-003, AG-004, AG-007, AG-012]
  - id: RA-002
    concern: 実行エンジンと runner 境界の失敗分類・入力検証拡張
    responsibility: |
      engine.ts の OperationSpec.validate の戻り値を構造化エラー（フィールド特定情報を含む）へ拡張し、
      失敗分類を変更する（外部操作失敗 = operation-failed、Tool/runner 異常 = enforcement-crashed）。
      runner.ts の GhRunnerReply に失敗クラス情報を追加し、両 runner が失敗クラスを返すようにする。
    ownership_hints:
      - src/opencode/tools/agentdev-gh/engine.ts
      - src/opencode/tools/agentdev-gh/runner.ts
    intent: |
      AG-009（フィールド特定付き拒否）と AG-010（失敗意味の区別）は engine・runner 境界の変更なしには
      実装できないため、実装面に明示的に含める（adversarial-review 指摘の対応）。
    verification_refs: [TS-013, TS-014]
    source_items: [AG-009, AG-010]
  - id: RA-003
    concern: 操作スペック（入力検証・応答解釈・VERIFY）の再実装
    responsibility: |
      specs-issue.ts に comment 4操作のスペックを作り、issue_update の VERIFY に追跡軸保持の不変条件照合
      （追跡軸完全一致 + 要求通常ラベル包含）を追加し、issue_reopen の VERIFY に状態・追跡状態・保存の
      照合を追加する。specs-pr.ts で pr_read の body 解析、pr_update スペック（部分更新・読み戻し）、
      pr_mergeable の VERIFY 単純化（単一読取の正規化）を実装する。
    ownership_hints:
      - src/opencode/tools/agentdev-gh/specs-issue.ts
      - src/opencode/tools/agentdev-gh/specs-pr.ts
    intent: |
      操作単位の入力定義・READ/WRITE VERIFY 分離・Comment WRITE の本文読み戻し判定をスペック層へ実装する。
    verification_refs: [TS-001, TS-002, TS-011, TS-012, TS-013]
    source_items: [AG-001, AG-002, AG-005, AG-008, AG-009]
  - id: RA-004
    concern: GitHub runner（runner-cli.ts）の操作実装
    responsibility: |
      Comment CRUD の REST 呼出し（作成・一覧・更新・削除、コメント id の文字列化）、comment_list の
      ページング取得、issue_reopen の状態ラベル機械適用（冪等）、issue_update の追跡軸ラベル保持修正、
      サーバ側絞り込み推送、pr_read の body 取得、pr_update の title/body 部分更新、失敗クラス応答を
      実装する。
    ownership_hints:
      - src/opencode/tools/agentdev-gh/runner-cli.ts
    intent: |
      現行実装の実欠陥（labels のみ更新での追跡ラベル剥離、コメント読取の30件黙示切断、コメント VERIFY の
      issue state 依存、runner 失敗の一律 enforcement-crashed 分類）を修正する。
    verification_refs: [TS-001, TS-002, TS-008, TS-009, TS-010, TS-014]
    source_items: [AG-001, AG-002, AG-005, AG-006, AG-007, AG-010]
  - id: RA-005
    concern: Local runner（runner-local.ts）の等価実装
    responsibility: |
      両 role のコメント相当セクションへ `### c{NN} {ISO 8601}` エントリ形式を導入し、comment_seq
      （frontmatter 最高水位標）による単調採番、旧形式エントリの冪等移行、case 既存作業ログの c01 束ね、
      comment CRUD、原子的書込み（一時ファイル + リネーム）、tracking reopen の冪等成功化、
      論理 PR 本文（3セクション直列化）の pr_read.body / pr_update、PR タイトル行の正統一を実装する。
    ownership_hints:
      - src/opencode-local/agentdev-gh/runner-local.ts
      - src/opencode-local/agentdev-gh/case-schema/（case-file.md、rules/*.yaml の機械可読定義更新）
    intent: |
      AG-011 の外部契約同値性をローカル物理写像で成立させる（adversarial-review Stream A/B 指摘の
      commentId 採番・case 作業ログ・PR 本文写像の対応）。
    verification_refs: [TS-004, TS-006, TS-007, TS-010, TS-015]
    source_items: [AG-003, AG-004, AG-007, AG-011]
  - id: RA-006
    concern: Plugin 公開スキーマと登録の更新
    responsibility: |
      plugin.ts の公開 JSON スキーマへ commentId 等の新フィールドと操作 enum を反映し、description の
      操作別説明（issue_comment の二重モード説明の除去を含む）を更新する。
      公開スキーマと実行時 validator の一致性テストを追加する。
    ownership_hints:
      - src/opencode/plugins/agentdev-gh-tool/plugin.ts
      - src/opencode/plugins/agentdev-gh-tool/tests/plugin.test.ts
    intent: |
      AG-009 の「公開スキーマと実行時 validator の非矛盾」を配線層で成立させる。
    verification_refs: [TS-013]
    source_items: [AG-009]
  - id: RA-007
    concern: ADF 内部呼出元の新 Comment 操作への移行
    responsibility: |
      旧 issue_comment を利用する呼出元文書を新操作へ移行する。移行対象（操作名・テンプレート ID の
      リテラル検索に基づく再構成済みインベントリ）: commands/agentdev/case-open.md、
      agentdev-issue-tracking/SKILL.md、agentdev-workflow-issue/SKILL.md、agentdev-issue-management/
      SKILL.md + references/issue-operation-safety.md（標準呼出形式）、agentdev-workflow-routing/
      references/case-update-procedure.md + review-ng.md、agentdev-workflow-case-close/references/
      pr-merge-and-conflict.md + epic-wave-close.md + cleanup-and-capture.md、
      agentdev-workflow-case-open/SKILL.md + references/termination-and-cleanup.md、
      agentdev-workflow-case-update/SKILL.md + references/update-flows.md、agentdev-workflow-case-auto/
      （comment I/O 総則）、agentdev-workflow-templates/SKILL.md（テンプレート対応表。テンプレート
      ファイル名 issue_comment_*.md は用途識別子として維持し、対応表を comment_create へ張替え）、
      agentdev-case-run-execution-adapter/SKILL.md + references/harness-delegation.md（コメント追加の
      記述更新）、agentdev-intake-pipeline/references/intake-extraction.md（コメント一覧取得の誤記
      「pr_changed_files / pr_mergeable でコメント一覧を取得」を comment_list へ是正）、
      docs/designs/skills/agentdev-workflow-templates.md（使用形態の確認・更新）。
      case 系 workflow の作業ログ追記は comment_create 経由へ移行する。
    ownership_hints:
      - src/opencode/commands/agentdev/case-open.md
      - src/opencode/skills/agentdev-issue-tracking/SKILL.md
      - src/opencode/skills/agentdev-workflow-issue/SKILL.md
      - src/opencode/skills/agentdev-issue-management/（SKILL.md、references/issue-operation-safety.md）
      - src/opencode/skills/agentdev-workflow-routing/references/（case-update-procedure.md、review-ng.md）
      - src/opencode/skills/agentdev-workflow-case-close/references/（pr-merge-and-conflict.md、epic-wave-close.md、cleanup-and-capture.md）
      - src/opencode/skills/agentdev-workflow-case-open/（SKILL.md、references/termination-and-cleanup.md）
      - src/opencode/skills/agentdev-workflow-case-update/（SKILL.md、references/update-flows.md）
      - src/opencode/skills/agentdev-workflow-case-auto/SKILL.md
      - src/opencode/skills/agentdev-workflow-templates/SKILL.md
      - src/opencode/skills/agentdev-case-run-execution-adapter/（SKILL.md、references/harness-delegation.md）
      - src/opencode/skills/agentdev-intake-pipeline/references/intake-extraction.md
      - docs/designs/skills/agentdev-workflow-templates.md
    intent: |
      旧操作の廃止後に呼出元が存在しない操作を参照しない状態を確定させる。移行完了まで issue_comment を
      温存し、廃止は移行完了後の Wave で実行する（adversarial-review Stream B 指摘の中間状態破綻回避）。
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-008
    concern: テストスイートの整備
    responsibility: |
      contracts.test.ts（16操作カタログロック）、engine-fail-closed.test.ts（失敗分類・構造化入力エラー）、
      runner-cli.test.ts（comment CRUD・ページング 35件・reopen ラベル・pr_update・失敗クラス）、
      runner-local.test.ts（c{NN} 採番・移行・case c01 束ね・論理 PR 本文 round-trip・原子的書込み・
      UTF-8 保持）、plugin.test.ts（スキーマ一致性）を更新・追加する。
      両版比較（TS-015）用の共通シナリオ実行基盤を用意する。
    ownership_hints:
      - src/opencode/tools/agentdev-gh/tests/
      - src/opencode-local/agentdev-gh/tests/
      - src/opencode/plugins/agentdev-gh-tool/tests/
    intent: |
      受け入れ条件を pass / fail / blocked / not applicable で個別判定可能な検証構成を提供する。
    verification_refs: [TS-001, TS-008, TS-009, TS-015, TS-016]
    source_items: [AG-003, AG-006, AG-011, AG-012]

review_dispositions:
  - id: RD-001
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-1
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-001、REQ-011-023 更新、REQ-011-025 追記、ACT-DESIGN-001 の VERIFY 照合規則へ全面的に反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-001
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-2
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-002、REQ-011-026（参照形。遷移先の具体値は Design 所有）、ACT-DESIGN-001/003 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-002
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-3
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-003、REQ-011-022 更新、ACT-DESIGN-001、RA-007（呼出元移行）へ反映した。廃止は移行完了後の
      Wave 実行とし温存期間を設けた。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-003
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-4
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-004（commentId 文字列統一を含む）、ACT-DESIGN-001/004 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-004
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-5
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-005、REQ-011-023 更新、ACT-DESIGN-001 の Comment WRITE VERIFY 規則へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-005
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-6
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-006、REQ-011-027、ACT-DESIGN-001（サーバ側絞り込み義務・上限時の再試行可能失敗を含む）へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-006
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-7
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-007、REQ-011-030、ACT-DESIGN-005（論理 PR 本文の round-trip 写像）へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-007
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-8
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-008、REQ-011-023 更新、CR-002、ACT-DESIGN-001 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-008
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-9
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-009、REQ-011-028、ACT-DESIGN-002、RA-002/006 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-009
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-10
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-010、REQ-011-029、ACT-DESIGN-002（存在性 = operation-failed の判定規則を含む）へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-010
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 要件化の方向-11
    disposition: covered
    reason_code: fully_reflected
    reason: |
      AG-011、REQ-011-024 更新、ACT-DESIGN-001（物理写像由来差異の明示的例外列挙を含む）へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-011
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: session:2026-09-08-agentdev-gh-operation-contract-reliability
    source_item: 対象外リスト（Issue 削除、PR close/reopen、review、inline review comment、assignee、milestone、Projects、lock/unlock、pin/unpin、base/draft 変更、API 網羅）
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      session で対象外合意済み。REQ-011 対象外への明記と AG-012（16操作カタログ固定・カタログロック
      テスト）によりスコープ境界を維持する。
    evidence:
      path: .agentdev/drafts/req-draft-agentdev-gh-operation-contract-overhaul.md
      section: agreed_items.AG-012
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    scale: large（影響ファイル 30 超え、個別変更件数 30 超え）。実装は Engine/契約層・両 runner・
    呼出元移行にまたがるため Epic 構成を推奨。Wave 構成は issue_comment 廃止の中間状態破綻を
    回避するため追加先行とする（adversarial-review Stream B 指摘の反映）。
  wave_hints:
    - "Wave 1（追加のみ）: RA-001〜006・008 のコア実装。comment CRUD・pr_update を追加し、issue_comment は温存（deprecated 扱い）"
    - "Wave 2（移行）: RA-007 呼出元移行と docs 更新（REQ-011・3 Design は req-save / design-save で先行保存済みの前提）"
    - "Wave 3（廃止）: issue_comment のカタログ・型・スキーマからの除去とカタログロック更新（Wave 2 完了確認後。Wave 2 の同一 PR 最終コミットへ統合也可）"
```

# summary

`agentdev_gh` の GitHub I/O 操作契約を、(1) 追跡Issue部分更新の追跡軸保持、(2) 再オープンの状態遷移機械適用、
(3) Comment 操作の CRUD 分離と commentId（文字列統一）、(4) 一覧完全性、(5) pr_read.body と pr_update、
(6) READ/WRITE VERIFY 意味の分離、(7) 操作単位の厳密な入力契約、(8) 失敗分類の区別、
(9) GitHub版/Local版の外部契約同値性、の9観点で一体的に是正する要件定義。

変更先は REQ-011（行 022/023/024 更新、025〜030 追記）と custom-tool-contracts・agentdev-issue-tracking・
local-case-file の3 Design。実現面は契約型・engine・runner 境界・スペック・両 runner・plugin スキーマ・
呼出元文書（約15ファイル）・テスト（5スイート）にまたがり、scale: large（Epic 構成、Wave は追加先行・
移行・廃止の3段）。

 adversarial-review（2系統独立レビュー）で指摘された本質的争点（PR 本文の論理範囲、commentId 採番の
最高水位標、case 作業ログの移行、engine/runner 実装面、廃止タイミングと Wave 構成、等価性の例外明示）は
すべて契約・Design・実装方針へ反映済みで、未解決事項は残っていない。
