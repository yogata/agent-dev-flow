---
title: ADF v4 Runtime 実行モデル（authority 格子・直列化単位・冪等経路・runtime 制御ループ）
status: accepted
created: 2026-09-19
updated: 2026-09-23
---
<!-- ADF-COVERS(implementation): REQ-035-001, REQ-035-007 -->

# ADF v4 Runtime 実行モデル（authority 格子・直列化単位・冪等経路・runtime 制御ループ）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 副作用分類と authority 格子

副作用を 4 分類し、実行権限は「対象 × 操作 × 寿命」の格子で決める（分類単位では決めない）。

| 副作用分類 | 対象例 | 権限判定の軸 |
|---|---|---|
| repo 内ファイル | docs/、src/**、.agentdev/、索引 | 対象パス（正規領域/一時領域）× 操作（作成/更新/削除）× 寿命 |
| GitHub | Issue/PR/comment の作成・更新・クローズ、ラベル | 対象種別 × 操作 × 寿命 |
| remote branch・tag | push、branch 削除、tag 作成 | lifecycle role × 操作 × 寿命 |
| repo 外 | DB migration、deploy、クラウド、外部SaaS、課金、権限、認証、repo 外実データ、通知 | 原則自走対象外（ Fence ） |

tag・branch の lifecycle role 別サブ表:

| lifecycle role | 権威 |
|---|---|
| baseline anchor tag（v3-baseline 等） | 移行境界で合意された作成のみ許可。移動しない |
| release tag（vX.Y.Z） | cutover 手順内でのみ作成。既存 tag は一切移動しない |
| rc tag（v4.0.0-rc.N） | cutover sequence 内でのみ作成（それ以前の作成は違反） |
| Case branch（definition/issue-* 等） | Case 実行内で作成。削除は自 Case が作成した branch に限定 |
| 統合 branch（main、v4-dev） | merge は各段階の統合基準に従う（v4 段階は v4-dev） |

## 直列化単位表

競合する共有書き込みは次の 5 単位で局所直列化する。無関係な対象の並列を妨げない。

| 直列化単位 | 対象 | 単位 |
|---|---|---|
| merge/push | 統合 branch への merge・push | リポジトリ単位 |
| Epic Issue 本文 | ステータス追跡テーブル等の更新 | per-Epic 単一書き手 |
| 採番割当 | REQ/Decision/IR 等の ID 採番 | グローバル |
| AUTOGEN 索引再生成 | README 索引・件数の再生成 | グローバル |
| worktree/git index | worktree 内の git 操作・index 競合 | worktree 単位（隔離または直列化） |

採番割当と AUTOGEN 再生成は別単位とする（割当は短時間、再生成は長時間であるため、同一単位化は待ち時間を増大させる）。並列実行で同一 worktree を共有する場合は読取のみの並列を許可し、書き込みを伴う場合は worktree 隔離または index 競合時の再試行規則を適用する（v3 Foundation Case 実績の一般化）。直列化の実行機構（lock、queue、scheduler）の所有は Tool 契約・実装段階が担い、本 Design は単位の定義と原則を所有する。

## 冪等経路

成果物作成操作は並行安全な冪等経路を要件とする。

- 手段: (a) 安定キー付き作列（Tool 契約が安定キーを解釈し、既存物を検出して再利用）、(b) 作成経路の直列化（単一 writer による逐次作成）のいずれか
- 検出→作成の競合（TOCTOU）を機構で防ぐ。標題検索ベースの事前検出は補助であり、単独では並行安全を担保しない
- verify-only closure の SSoT コメントヘッダ規約（DEL-{N}-{n} 形式）は現行の事実上の冪等キーとして位置づける。再試行時は既存ヘッダを検出して更新（comment_update）し、重複作成しない
- 既存成果物検出ガード（git log による配置検証モード切替）、case-open/case-revise の冪等再実行、Definition PR 冪等キーは本要件の v3 実装形とする

## 直列化違反・競合検出時の意味論

競合書き込み・直列化違反の検出時は、権威優先での解消（DEC-038 のクラス別権威順）または停止とする。意味的な自動マージを行わない。コンフリクト解消 Level 1（rebase）/ Level 2（再実行）は機械的解消手段として維持し、Level 3 は停止とする（v3 契約の一般化）。

## runtime 制御ループ

状態機械の遷移 predicate に含めない実行制御を runtime 制御ループとして本 Design 側に位置づける。

- 再試行カウンタ: コンフリクト解消 Level 2/3 の試行回数、委譲の再試行回数。ローカル一時状態として保持し、durable enum に含めない
- 外部状態ポーリング: mergeable UNKNOWN のポーリング等。外部システムの非同期値を待つループであり、遷移 predicate とは区別する
- 起動間隔と active 枠: 並列委譲の起動間隔（10 秒）の実行安全境界と、1 回の case-auto orchestration の stage 3 全体で共有される active Issue task 数の上限（現行 5、数値は case-auto Design が所有）を区別して管理する。起動数と active 数は区別し、空き枠補充により起動は実行進行中に継続する（REQ-034-027、REQ-034-040、DEC-041）
- 空き枠補充: 各 Epic の現在 Wave と Standard Issue を横断した候補認識と、実行上の安全条件を満たす候補への補充（横断補充は best-effort でなく必須）。最初に起動した全 task の完了を待つ固定 batch 方式を取らない（REQ-034-040）
- 状態管理: Issue 実行の状態を pending、ready、active、実行結果確定で区別して管理する（REQ-034-041）
- 再開: 既存 active task を計上し、同一 Issue の二重起動と上限超過を防ぐ。状態不明の task は終了確認まで実行枠を解放せず、完了済み Issue を未完了に戻さない（REQ-034-041）
- 統合処理: 統合処理（マージ・クローズ相当）は active Issue task の実行枠を消費しないが、共有書き込みの直列化点として扱う（REQ-034-042）
- 論理上限と harness 制限の切り離し: active Issue task 数の論理上限は ADF 契約として所有する。harness の同時起動制限（bg task API 上限等）は adapter・実装制約（キューイング・バンドリング等）であり、論理上限の値の根拠としない。構成不変性の検証に多数の同時実行を要しない（DEC-041）

## fail-closed 適用範囲

書き込み経路の統制点は fail-closed とする。Custom Tool の書き込み操作（読戻し検証失敗時に成功を返さない）、書込み guard（ブロックを解除せず標準手段へ切替）を含む。助言的統合（検査・診断系、fail-open 許容の traceability 能力等）のみ例外として fail-open を許す。

## 決定的実行・adapter 実行との接続

状態遷移 predicate 評価・冪等キー照合・依存解決・Wave scheduling の決定的所有は DEC-036 の deterministic 項目分類に従う（本 Design は再列挙しない）。semantic 判断（要件解釈、block 判定、レビュー）は Skill が所有する。adapter execution（agent 起動、context、background execution、tool invocation の実行機構）は Harness/Backend adapter 境界（DEC-036）が所有し、本 Design の副作用分類・直列化単位は adapter 経由の実行にも適用される。
