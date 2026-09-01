---
title: Custom Tool 操作契約
status: accepted
created: 2026-08-24
updated: 2026-09-02
---
<!-- ADF-COVERS(implementation): REQ-011-020, REQ-011-021, REQ-011-022, REQ-011-023, REQ-011-024, REQ-052-001, REQ-052-002, REQ-052-003, REQ-052-004, REQ-052-005, REQ-052-008, REQ-052-009, REQ-052-010, REQ-052-011 -->

# Custom Tool 操作契約

Git、GitHub、外部ソース（URL、Git リポジトリ等）からの取得等の構造化された副作用操作を担う Custom Tool の操作契約と失敗時動作を所有する
（REQ-052）。

## 操作契約の構成要素

各操作は次の外部契約のみを公開する。実装詳細（gh オプション、--body-file、UTF-8 BOM なし、
chcp、REST API PATCH、一時ファイル、PowerShell 対策等）は Tool 内部に隠蔽する。

| 要素 | 内容 |
|---|---|
| 入力 | 操作名、構造化引数（title、body、labels 等）。環境依存の引数運用規則を含まない |
| 出力 | 構造化結果（issue 番号、URL 等） |
| 保証 | 操作の結果を検証（読み戻し等）してから成功を返す |
| 失敗 | 保存または検証に失敗した場合に成功扱いとしない。エラー種別と再試験可否を返す |

## 対象操作の境界（初期セット）

GitHub I/O の対象操作は次のとおり。

- 基本操作: issue_create、issue_read、issue_update、issue_comment、issue_close、pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable
- 追跡Issue操作（追加）: issue_list（role、kind、state 等による絞り込みを含む構造化結果を返す Issue 一覧・検索）、issue_reopen（Issue 再オープン）
- 既存契約の変更: issue_read のメタデータ拡張。title、state、labels に加え、role/kind/状態写像に必要なメタデータを返す。新規操作追加と区別して契約・テストを更新する
- 既存契約の変更: issue_create は任意の `role`（既定 `case`）と `kind` を受け付ける。ローカル版は role 条件付きスキーマ充足のため作成時の role が必須になる
- 既存契約の拡張: issue_update は Issue 本文・メタデータ更新に labels 更新を含む。labels 指定は追跡Issue軸ラベル（role/kind/status）を除いた残りのラベルの置換を意味し、追跡Issue軸は kind/trackingState 指定で置換される。issue_comment はコメント追加・読取の双方を扱う（body あり＝コメント追加、body なし＝コメント読取）

issue_list と issue_read は read-only 操作として応答自己整合の検証を、issue_update、issue_comment、issue_close、issue_reopen は副作用操作として読み戻し検証（VERIFY）を適用する。各 WRITE は Tool 内で VERIFY まで完了してから成功を返す（REQ-011-023）。

ローカル版実装差し替えの読み替え先は .agentdev/issues/ のローカルIssue（role 条件付きスキーマ、単一採番空間）とする。PR 系操作（pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable）の対象は role: case のローカルIssueに限る。物理写像（role、kind、状態とラベル等の対応）の機械適用は Tool 内実装が行うが、写像表の所有は agentdev-issue-tracking Design である。ラベル・kind 値域の正は本 Design で定義せず、agentdev-issue-tracking Design を参照する。

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
