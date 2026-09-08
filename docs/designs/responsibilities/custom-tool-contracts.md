---
title: Custom Tool 操作契約
status: accepted
created: 2026-08-24
updated: 2026-09-09
---
<!-- ADF-COVERS(implementation): REQ-011-001, REQ-011-002, REQ-011-003, REQ-011-005, REQ-011-008, REQ-011-009, REQ-011-013, REQ-011-014, REQ-011-015, REQ-011-020, REQ-011-021, REQ-011-022, REQ-011-023, REQ-011-024, REQ-052-001, REQ-052-002, REQ-052-003, REQ-052-004, REQ-052-005, REQ-052-008, REQ-052-009, REQ-052-010, REQ-052-011 -->

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

## ローカル版実装差し替え

ローカル版は同一の操作契約で Case ファイル読み書きを実装した Local 実装を提供する（REQ-011-006、DEC-004）。
Workflow は GitHub 版と Local 版の差を認識しない。

## 迂回防止

Plugin / Hook（tool.execute.before 等）により、生 gh WRITE 等の正規経路迂回を検出・拒否できる。
禁止範囲（読み取り系の許容等を含む）は本 Design が所有する。

Plugin / Hook の設定契約:

- 強制境界 Plugin の設定は環境変数経由で行う。gh-write-guard Plugin は `AGENTDEV_GH_WRITE_GUARD_CONFIG`（JSON、`enforcedTools` 一覧）を受け付け、未設定時は既定の強制対象で動作し、設定を解釈できない場合は対象副作用を実行せず fail-closed で拒否する（REQ-052-004）。gh-tool Plugin は `AGENTDEV_GH_REPO` で対象リポジトリを指定できる
- 正規経路の Custom Tool 名は `agentdev_gh`（GitHub Issue / PR 操作）と `agentdev_third_party`（third-party Skill 取得）である。配布物の実行手順はこれらのツール名を経由し、生 gh WRITE の直接実行を正規経路としない（REQ-011-021、REQ-052-010）

## 移管記録（旧 `agentdev-gh-cli` Skill Design の廃止）

GitHub I/O の操作契約、VERIFY、失敗時動作、環境依存隠蔽、ローカル版実装差し替えの正規所有は本 Design が一元的に担う。旧 Skill Design（`docs/designs/skills/agentdev-gh-cli.md`）はこの移管の完了に伴い現行 Design 体系から除去する。

旧 Design が掲載していた操作契約表と拡大手続き（PR 変更ファイル一覧取得、PR mergeable 状態取得）は本 Design の「対象操作の境界（初期セット）」が所有する。gh 直接記述の検出スコープは IR-053（gh 直接記述検出）が所有する。Windows 環境依存の実装詳細（コンソールエンコーディング初期化、`--body-file`、一時ファイル運用等）は Tool 内部に隠蔽し、Design では正規所有しない。

旧 Design が実装対応宣言の対象としていた各行（REQ-011-001、REQ-011-002、REQ-011-003、REQ-011-005、REQ-011-008、REQ-011-009、REQ-011-013、REQ-011-014、REQ-011-015）の被覆を本 Design が引き継ぎ、本 Design の実装対応宣言へ上記の各行を追記する。

ローカル版の正規原本は `src/opencode-local/agentdev-gh/` とし、通常版 `src/opencode/tools/agentdev-gh/` と同一の `agentdev-gh` 名で対応させる。
