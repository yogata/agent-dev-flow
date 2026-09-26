---
title: Custom Tool 操作契約
status: accepted
created: 2026-08-24
updated: 2026-09-24
---
<!-- ADF-COVERS(design): REQ-090-001, REQ-090-002, REQ-090-003, REQ-090-004, REQ-090-009, REQ-090-010, REQ-090-011, REQ-090-012, REQ-090-013, REQ-090-014, REQ-090-015, REQ-090-016, REQ-090-017, REQ-092-003, REQ-011-033 -->
<!-- ADF-COVERS(design): REQ-009-051, REQ-052-013 -->
<!-- ADF-COVERS(implementation): REQ-011-001, REQ-011-002, REQ-011-003, REQ-011-005, REQ-011-008, REQ-011-009, REQ-011-013, REQ-011-014, REQ-011-015, REQ-011-020, REQ-011-021, REQ-011-022, REQ-011-023, REQ-011-024, REQ-011-031, REQ-011-032, REQ-052-001, REQ-052-002, REQ-052-003, REQ-052-004, REQ-052-005, REQ-052-008, REQ-052-009, REQ-052-010, REQ-052-011 -->

# Custom Tool 操作契約

Git、GitHub、外部ソース（URL、Git リポジトリ等）からの取得等の構造化された副作用操作を担う Custom Tool の操作契約と失敗時動作を所有する
（REQ-052）。

## 操作契約の構成要素

操作契約の構成要素に入力契約と失敗分類の厳格化を追加する。

入力契約（操作単位の定義）:
- 各操作は操作単位の入力フィールド定義（必須、任意、型）を持ち、操作の入力定義に存在しないフィールドを含む要求は副作用発生前に invalid-input で拒否する
- 必須フィールドの不足も副作用発生前に invalid-input で拒否し、問題となったフィールドまたは不足フィールドを特定できる情報（フィールド名を含む）を返す。検証結果は構造化されたエラー情報として操作スペックから engine へ返す
- 一つの flat schema に操作ごとの必須条件を文章だけで補う運用を解消する。公開される Tool スキーマは契約型（contracts.ts）に追従し、実行時 validator と矛盾しない。実行時検証が公開スキーマより厳密であることを妨げない。スキーマと validator の一致性（実行時受理集合が公開スキーマ許容集合に含まれること）はテストで検証する

失敗分類:
- GhToolFailureKind は invalid-input、operation-failed、verification-incomplete、enforcement-crashed、config-uninterpretable、path-unresolvable の6種を維持し、相互に集約しない
- runner と engine の間の実行応答は失敗クラス情報を持ち、外部操作の失敗（HTTP エラー、対象不在）と Tool / runner 自体の異常を engine が区別して分類する
- 入力契約違反は invalid-input とし、外部操作の失敗・検証未了・Tool 異常と同一分類に集約しない

runner 応答 before 契約（追跡軸保持 VERIFY の実行前状態接合）:
- issue_update、issue_reopen の追跡軸保持 VERIFY は、副作用後の読み戻しのみでは自己保持できない実行前状態を必要とするため、runner の成功応答 payload は実行前状態（before）を正規化済み導出値として含める。含める導出値は state、labels、role、kind、trackingState、closeReason とし、正規化規則は契約型（contracts.ts）と追跡スキーマ（tracking-schema.ts）の実装に従う
- runner と engine の間の内部契約を拡張する場合は、GitHub 版と Local 版へ同時に反映する。Local 版の実装が未完了の間は、最低限の型整合を維持し、当該操作の VERIFY は fail-closed で verification-incomplete として返ることを許容する

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

操作カタログの完全列挙（16操作）は契約テストで固定し、対象外機能の追加を検出する。

「third-party Skill 取得」操作契約:

- 入力: third-party 宣言（skills.yaml）の対象 Skill 名（省略時は全件）、dry-run 指定
- 出力: 取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況）
- 保証: 取得結果の検証後に成功を返す。取得開始前に存在した正常な配置を取得失敗時に破壊しない。機構管理外の既存配置を無断で上書きしない
- 失敗: 失敗を成功扱いとしない。部分取得状態を開始前状態へ解消し、失敗要因を報告する

取得プロファイル（単一 SKILL.md URL 型・GitHub Skill ディレクトリ型の判定、正規化、再帰取得、相対構造保持、Skill ディレクトリ外非取得）の詳細は Design third-party-skill-management が所有する。

「Jev 先行評価」操作契約:

- 入力: 評価リクエスト（state、instructions、criteria、質問群〔形式: boolean 相当・choice（候補付き）・score（水準付き）〕）。provider 接続設定は AI_GATEWAY_API_KEY 環境変数で解決する。
- 出力: 質問ごとの結果（選択・真偽・水準）、候補別確率分布、provider が実際に返した confidence（evaluation 単位。provider 固有の格納位置〔初期 Vercel adapter では AI SDK 7 experimental_evaluate 経由の providerMetadata.typesafe.confidence〕を内部吸収して共通形式へ正規化。provider が返さない場合は返さない）、inputTokens（provider が返す場合）、機械的処理時間。失敗時は構造化失敗（分類: not_configured、timeout、429、5xx、network error、response validation error 等）。
- 保証: 公開契約は provider・SDK 非依存とし、AI SDK の型名・API 名を公開スキーマと Workflow 層へ漏らさない。質問型（独立命題・排他候補・順序水準）と boolean/choice/score の対応づけは adapter mapping であり意味契約の変更ではない。Tool は判断対象の意味・評価基準・Jev を呼ぶべき箇所・最終判断を所有しない（REQ-011-020 準拠）。API key 未設定時は呼び出さず構造化失敗（not_configured）を返し、semantic evaluation observation を生成しない。評価入力の事前検証失敗（invalid input）でも observation を生成しない。代替手段は従来 LLM 経路であり、Jev 障害時も Workflow は継続できる（REQ-052-005 の代替手段・継続可否の定義義務に基づく）。評価言語は日本語とする。
- 観測契約（一次事実）: 観測単位は 1 semantic evaluation = 1 observation（1 JSON）とし、1 Workflow 実行単位の JSON 集約を行わない。各 observation は実行元 Workflow と評価種別を識別できる情報を持つ。保存する一次事実は次に限定する。(1) evaluator 返却結果（canonical result: boolean=真偽、choice=候補、score=scale level。評価入力の各質問と各結果の1対1対応、各質問の evaluator result と候補別確率分布の双方保持。REQ-090-014）、(2) provider が実際に返した confidence（evaluation 単位のみ。judgment 単位への複製、probability distribution からの代替 confidence の生成・永続化の禁止）、(3) 入力再構成情報（具体的 source revision、再構成可能入力は参照と request digest、再構成不能入力のみ最小 snapshot。source revision から一意に導出できる provider・requested model 等の観測ごとの必須保存をしない。非導出の identity 差異が実行時観測された場合のみ保持）、(4) reasoning model の最終判断結果と差異理由分類（final result は evaluator 成功観測に限定して保持。failure observation への重複保存を要求しない。差異理由は evaluator result と final result が異なる場合のみ evaluation_input_defect / semantic_disagreement / deterministic_override / unknown の4分類。REQ-090-015）、(5) 呼出し時間と input token 数（provider 返却時のみ）、(6) 失敗分類と最小 diagnostic（実際の呼出し開始後の失敗のみ: timeout、429、5xx、network error、response validation error の5分類。REQ-090-016）。観測は append-only の一次事実であり、Workflow 再開・再実行による同一判断の再観測を排除・統合しない。
- 永続化契約（中断耐性）: evaluate は evaluator 成功後・呼出元 Workflow が reasoning model へ進む前に、当該評価の一次観測の永続化を試みる。永続化成功後の中断でも一次観測が失われない。永続化自体の失敗は観測保存失敗契約（fail-open）に従う。観測の保存のみに失敗した場合、Workflow の正規処理結果を維持し、rollback・再実行・擬似再生成を行わず、識別可能な warning を構造化情報として呼出元へ返す（REQ-090-013）。
- 書込先: 書込先 root は Tool が内部解決し、呼出側から指定できない。worktree コンテキストの委譲実行から呼び出された場合も main リポジトリ側 `.agentdev/jev-observations/` に帰着する（実測: 20260923T133911Z-6859）。この振る舞いは worktree コンテキストに依存しない。機構記述（cwd 相対解説等）は契約文言に含めず、観測可能契約のみを規定する（実装は物理実装の自由度とする）。
- 旧派生状態の除去: recordState、outcome、llmTreatment、unchanged/corrected、finalizedBy、direct-finalization marker、fallback reason、not_configured/invalid_input observation を正規観測契約から除去する（REQ-090-017）。既存の v1 観測（1 Workflow 実行 = 1 JSON、部分レコード/完成レコード形式）は履歴として保持し、migration・変換・読み取り互換を要求しない。v1 観測を新契約の現行 observation として解釈しない。
- 操作構成の自由度: operation カタログ（evaluate、観測の永続化と final result 反映の操作分割の有無）、観測 JSON の field 名、filename、完了状態の物理表現は実装設計時の自由度とし、本節の意味契約（一次事実、evaluation 単位 confidence、中断耐性、fail-open）を変更しない範囲で定める。
- 配布境界: ADF 汎用の Tool として配布対象とする（REQ-052-006）。正式名称 `agentdev_jev`、物理配置 Tool 本体 `src/opencode/tools/agentdev-jev/`、初期 Vercel adapter `src/opencode/tools/agentdev-jev/adapter-vercel/`（評価 SDK 依存はこの adapter パッケージに閉じる）、Plugin 登録配線 `src/opencode/plugins/agentdev-jev-tool/`。

## ローカル版実装差し替え

ローカル版は同一の操作契約で Case ファイル読み書きを実装した Local 実装を提供する（REQ-011-006、DEC-004）。
Workflow は GitHub 版と Local 版の差を認識しない。

## 迂回防止

Plugin / Hook（tool.execute.before 等）により、生 gh WRITE 等の正規経路迂回を検出・拒否できる。
禁止範囲（読み取り系の許容等を含む）は本 Design が所有する。

Plugin / Hook の設定契約:

- 強制境界 Plugin の設定は環境変数経由で行う。gh-write-guard Plugin は `AGENTDEV_GH_WRITE_GUARD_CONFIG`（JSON、`enforcedTools` 一覧）を受け付け、未設定時は既定の強制対象で動作し、設定を解釈できない場合は対象副作用を実行せず fail-closed で拒否する（REQ-052-004）。gh-tool Plugin は `AGENTDEV_GH_REPO` で対象リポジトリを指定できる。リポジトリ解決に失敗した場合、failure detail には試行した解決手段（環境変数、gh repo view）、外部コマンドの終了コードと stderr の要因を診断情報として含め、環境変数設定による解決手続きへの導線を維持する（REQ-052-013）
- 正規経路の Custom Tool 名は `agentdev_gh`（GitHub Issue / PR 操作）と `agentdev_third_party`（third-party Skill 取得）である。配布物の実行手順はこれらのツール名を経由し、生 gh WRITE の直接実行を正規経路としない（REQ-011-021、REQ-052-010）

## v4 adapter 経由の harness 接続

Custom Tool の操作契約（本 Design 既有）は、v4 では Harness/Backend adapter 境界（ADF v4 実装責務境界 Design・DEC-036）を経由して harness へ接続する。現行の plugins/ による tool 登録配線（agentdev-gh-tool・agentdev-third-party-tool）がこの形態の OpenCode 実装例である。

adapter の追加は必要になった時点で行い、未使用 adapter を先回りして実装しない。種別契約の正は REQ-052、操作契約の正は本 Design、境界定義の正は v4-responsibility-boundaries が所有する。

既存節（操作契約の構成要素・対象操作の境界・ローカル版実装差し替え・迂回防止・移管記録）は不変とする。

## 移管記録（旧 `agentdev-gh-cli` Skill Design の廃止）

GitHub I/O の操作契約、VERIFY、失敗時動作、環境依存隠蔽、ローカル版実装差し替えの正規所有は本 Design が一元的に担う。旧 Skill Design（`docs/designs/skills/agentdev-gh-cli.md`）はこの移管の完了に伴い現行 Design 体系から除去する。

旧 Design が掲載していた操作契約表と拡大手続き（PR 変更ファイル一覧取得、PR mergeable 状態取得）は本 Design の「対象操作の境界（初期セット）」が所有する。gh 直接記述の検出スコープは IR-053（gh 直接記述検出）が所有する。Windows 環境依存の実装詳細（コンソールエンコーディング初期化、`--body-file`、一時ファイル運用等）は Tool 内部に隠蔽し、Design では正規所有しない。

旧 Design が実装対応宣言の対象としていた各行（REQ-011-001、REQ-011-002、REQ-011-003、REQ-011-005、REQ-011-008、REQ-011-009、REQ-011-013、REQ-011-014、REQ-011-015）の被覆を本 Design が引き継ぎ、本 Design の実装対応宣言へ上記の各行を追記する。

ローカル版の正規原本は `src/opencode-local/agentdev-gh/` とし、通常版 `src/opencode/tools/agentdev-gh/` と同一の `agentdev-gh` 名で対応させる。
