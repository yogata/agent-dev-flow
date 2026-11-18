---
title: "配布依存境界"
status: accepted
created: "2026-08-11"
updated: "2026-11-18"
---
<!-- ADF-COVERS(implementation): REQ-002-027 -->
<!-- ADF-COVERS(implementation): REQ-009-045 -->
<!-- ADF-COVERS(implementation): REQ-029-001, REQ-029-002, REQ-029-003, REQ-029-004, REQ-029-005, REQ-029-006, REQ-029-007, REQ-029-008 -->
<!-- ADF-COVERS(design): REQ-029-010, REQ-029-011 -->
<!-- ADF-COVERS(design): REQ-029-001, REQ-029-002, REQ-029-003, REQ-029-004, REQ-029-005, REQ-029-006, REQ-029-007, REQ-029-008 -->
<!-- ADF-COVERS(design): REQ-031-032 -->

# 配布依存境界 Design

> **正規所有宣言**: 本 Design は REQ-029 が宣言する意味境界を検証するための意味モデル、分類、検出パイプライン、projection 契約、gate 契約に加え、ユーザーが確定した安定実装契約を一括して正規所有する。
> 関数署名と実装コードは実装詳細として本 Design に含めない。

## 目的

配布依存境界の検証モデルを確立する。正規所有する内容は、producer 内部依存と consumer 解決可能依存の区別、配布テキスト成果物の対象定義、決定的判定と未分類扱い、generic と template の許容、ベースラインと個別承認例外の区別、誤検出の抑制、検査エラーの意味、各 projection の検査契約、事前書き込み gate と最終 gate の契約、archive 公開前検査、安定実装契約である（REQ-029、REQ-010-060、DEC-014）。

## producer と distribution の意味モデル

producer は配布成果物を生成・管理する AgentDevFlow 本体を指す。
distribution は consumer 環境へ配布されるテキスト成果物の集合を指す。
配布成果物は consumer 環境で自己完結して実行されるため、producer 内部の構成体、内部文書、harness 実行制御の詳細に依存して成立してはならない（REQ-029-001）。

依存分類値は次の通り。

- consumer-resolvable（許容）: consumer 環境で runtime 解決可能な参照。
- generic-or-template（許容）: producer 内部へ解決しない汎用参照または template 参照（REQ-029-004）。
- producer-internal（不許容）: consumer 環境に不在の producer 内部成果物への具体参照。
- unclassified（gate-not-passed）: 検査時点で分類不能。検査エラーと同等に gate-not-passed 扱いとする。

## 配布テキスト成果物の対象モデル

境界は Markdown 本文に限定しない（REQ-029-002）。
配布対象のテキスト成果物（command 定義、skill 定義、template、script ソース、附属するテキスト形式の設定や README）すべてへ適用する。
テキストと判定可能な成果物とバイナリと判定される成果物を決定的に区別し、判定不能なエントリは unclassified として gate-not-passed 扱いとする。
検査対象の除外領域: 共通原本側 tests/ 配下（検出刺激用のサンプル文字列を含むテスト。Issue #2480）と、tools/<name>/local/ 配下（通常版の同期・インストールの配布対象から除外された Local 実装領域。REQ-009-016）は配布テキスト成果物の対象外とする。
この除外は配布依存境界検査の走査対象からの除外（4 projection 共通）であり、manifest の監査期待対象（tests を含み、manifest 側は除外しない）と配布アーカイブ内容には影響しない。除外判定は候補ツリーの共通原本パス（src/common 基準の path segment 一致）で行い、link・archive-installed 投影では .opencode 写像の前の段階で適用する。
repo-local plugin 原本（除外基準カノンにより consumer 配布全経路から除外される plugin。現行は agentdev-distribution-boundary-guard）は、source projection の原本検査対象には含めたまま、consumer 配布3投影（link・archive・archive-installed）の走査対象と監査期待対象から除外する。この除外リストは監査期待の独立性予約（I-004）どおり検査側が独立に保持し、除外基準カノンから導出しない。

## 配布物本文の記述規則

配布物（配布 command / skill / template / script）の本文・コメント・reference における
記述規則を以下のとおり明文化する。
- 配布対象成果物の本文・コメントへ、producer 側トレーサビリティ metadata（inline ADF-COVERS 宣言、要件行 ID、Decision ID 等の concrete ID を含む）を記載しない。consumer distribution closure 内の producer 側トレーサビリティ metadata は0件とする
- 配布対象成果物の対応関係（REQ / Decision ID との対応）は、producer / project 側の `traceability/` 配下 sidecar のみへ保持する。対応関係を配布物へ投影せず、配布時 strip 処理を前提としない
- 配布物本文は設計契約名、Design 節名、内容説明などの一般化表現で記述する
- docs/ 内部パス参照（docs/designs/、docs/requirements/ 等のパス表記）を配布物へ残さない。
  導入先で解決できない参照は「Design一覧」等の一般名詞表現へ置換する
- 本規則は REQ-029（配布依存境界）および IR-055 の enforcement に接続し、
  違反は配布依存境界検査・IR-055 検査で検出する

distribution purity check は、distribution-bound artifact 内の producer 側トレーサビリティ metadata を例外許容せず検出する。
検出シグナルは distribution-bound テキスト成果物全文に対する ADF-COVERS 宣言マーカー一致とし、役割フィルタやパスフィルタによる例外許容を持たない。
対象は配布テキスト成果物の全種別（command、skill、reference、tool、plugin / hook、template、runtime script、package 付随ファイル、その他 consumer distribution closure に含まれるテキスト成果物）とする。
配布入力となる製品ソース自体を clean な状態で保持し、変換工程を通さない配布形態（link projection を含む）でも同一の clean 状態が維持される。

正本参照の backtick パス運用: 配布 skill 間の正本参照は backtick パス（Markdown リンクなし）で記述する運用を正とする。配布先でのリンク破損を回避するため、配布物本文内の skill 間正本参照は Markdown リンクを使用しない。配布境界 checker の concrete path 検証（hits 0 確認）を併記し、backtick パス記述の運用が concrete path 検出の誤検出源にならないことを確認する（PR #4065 本文の記録にのみ存在した運用の Design 様式への正規化）。

相互参照パス解決可能性検査（候補設計と採否判断）: 配布物本文内の相互参照パスについて配布レイアウトでの実在解決を検査する汎用 checker の候補設計を次のとおり確定する。検出対象は配布テキスト成果物本文中の backtick 内パス参照（skill・command・reference 間の正本参照）とし、参照元ファイルの配置位置からの相対解決で実在性を判定する。Markdown リンク形式は backtick 運用違反の検出信号として区別して報告する。運用記述の誤検出除外は参照パスの先頭要素で機械区別する: src/、docs/、scripts/ 等の原本領域を指すパス記述は原本位置の案内記述として解決対象外とし、配布レイアウト内に解決される参照のみを検査する。採否判断: 本候補は採用とする（実装は別作業単位）。採用根拠は、backtick パス運用の正規化により参照形式が確定し機械検出の入力が安定したこと、配布先での参照破損は consumer 側でしか顕在化しないため公開前の機械検査が唯一の検出経路となることである。checker 実装単位は本節の区別規則（原本領域パスの案内記述扱い・相対解決）に従う。

## 候補抽出から決定までのパイプライン

走査契約: checker の走査判定は isDirectory() に加えて isSymbolicLink() を併用し、link profile (.opencode/** 配下) の junction (directory symlink) をディレクトリとして走査対象に含める。走査の意味論は次の3点である。(1) junction 経由の走査は link projection の検査であり、参照先 source projection (src 側原本) との重複検出は link profile / source profile の区別表示により回避する。(2) junction 参照先の配布対象外ファイル (テスト・開発用 scripts 等) は link projection の検査対象外とする。(3) 循環参照防止のため走査済み実パスの追跡を行う。

検出パイプラインは次の 4 段階で構成する。
各段階で副作用を発生させない。

1. 候補抽出: 配布テキスト成果物から依存候補を抽出する。
2. 解決: 候補を consumer 環境の仮定で解決試行する。
3. 分類: 解決結果に基づき consumer-resolvable、generic-or-template、producer-internal、unclassified のいずれかへ分類する。
4. 決定: 分類結果に基づき gate 合格または gate-not-passed を決定する。

配布依存境界 gate は、third-party 取得機構経由の配置（管理登録済み）を許容配置として扱い、unmanaged 検出から除外する。除外は manifest 登録の有無で機械判定する。

## generic と template 許容

REQ-029-004 が許容する generic および template 参照は、producer 内部へ解決しないことを条件に許容する。
ルールレベルで許容集合を定義し、個別承認例外（individual accepted exception）とは区別する。

## baseline 運用の撤廃と residual 参照の処遇区分（REQ-010-074/079、Epic #4126 Phase 4）

baseline（IR-059 baseline、NG baseline）による既知違反の免除管理・delta 運用、および個別承認例外（exemptions.json）は撤廃済みである（IR-055・IR-059 の検出器自体は存続。IR-073 のルール登録は DEC-065 により終了済み）。
検出された concrete-id 等の違反は免除せず、検出エントリごとに次の処遇区分で直接修正する。

- **表現是正区分**: 文面が自己完結しており、出典参照の除去または一般化表現への置換で consumer 解決不能性が解消できる参照。配布物本文の記述規則に従い是正する
- **出典移管区分**: 出典明示の情報価値が是正で代替できず、producer 側開発者向けの正規出典として保持する価値がある参照。出典情報の正規保持先は producer 側 traceability/ 配下 sidecar への登録であり、配布物本文へ出典番号を投影しない

配布物本文の記述規則（一般化表現、concrete ID 非記載）が原則である。ルールレベルの許容（generic と template）と誤検出抑制（false-positive suppression、検出器の挙動調整）は baseline 機構と別物として現行どおり維持する。

ID プレースホルダー（IR-{NNNN} 等）の裸出力は、表の根拠列・パターン定義内など正規様式として許容する領域を除外規則で定義する。許容領域の裸出力は unclassified-entry 検出の対象外とする（IR-064 文脈許容様式との連動: ru-batch-20260903）。

配布物本文の記述規則に従わない producer 内部参照の排除（REQ-029-001）と baseline 変更禁止の制約（撤廃済み）に依存する表現は、上記の処遇区分へ読み替える。

## 共有 detector と adapter の契約

共有 detector は副作用なし（side-effect-free）とし、複数経路から同一入力に対し同一判定を返す（DEC-014）。
adapter は detector の判定を書き込み前に反映する fail-fast な経路である。
両者の契約は本 Design が正規所有し、実装詳細は Epic が所有する。

- ガード間（textlint 書込み前 guard と配布境界ガード等）で重複する編集意味論の解析・再構成部（write/edit/apply_patch の引数解析と完成予定全文の再構成）は、共通部として1箇所で管理する（B3-5a）。各ガードは固有の拒否条件のみを所有する
- 共通部の試験は1箇所で管理し、各ガードの拒否条件の試験は現行のまま各ガードが保持する。解析不能・検査不能を許可へ変えない保証は双方のガードで維持する
- 共通部（編集意味論の解析・再構成）の配置は、consumer 配布対象 plugin package 内の共有モジュール（lib/edit-semantics.ts）へ置き、repo-local ガード側から参照する形式とする（B3-5a・Epic #4026）。配布物の producer 内部参照排除（REQ-029-001）と baseline 変更禁止の制約から、src/common/guards/ 配下への配置は採用しない
- 各ガードの固有条件は、解析結果の消費方法で分離する。matchCount の消費有無、unknownLines の malformed 化有無、`@@` anchor の強制有無、replaceAll の無効型拒否有無をガード固有の差異として扱い、将来の第3ガード接続時も同パターンの適用候補とする（Epic #4026 の確定記録）

## 検査エラーの意味

検査対象欠落、読込不能、未分類エントリ、adapter 起動失敗などの検査エラーはすべて gate-not-passed として扱う。
clean として通過させない（DEC-014 決定5）。

## projection の分離

次の 4 projection を分離して検査する。

- source projection: 共通原本 src/common/（commands/skills/tools/guards）とホスト接続領域の plugin 原本 src/opencode/plugins/ など原本領域。
- link projection: 通常の consumer リンクインストールで展開される配置先。
- archive projection: release として具体化された配布アーカイブ。
- archive-installed projection: archive を展開し install した状態。

いずれかの projection で違反が残存する場合、全体を通過扱いにしない。

通常 checkout 版の `scripts/install.ps1` と release archive 版の `scripts/install.ps1` は同名で併存する。
trust root / manifest の検証は projection スコープで実施し、両者を区別して扱う（REQ-050-010、REQ-050-012）。

## 事前書き込み gate と最終 gate の契約

事前書き込み gate は執筆・編集経路で動作する fail-fast adapter であり、書き込み前に検出結果を反映する。
最終 gate は REQ-010-060 が宣言する ADF 所有の保存・完了・release 経路での最終保証である。
adapter を利用者または編集経路がバイパスしても、最終 gate で停止する。
事前 gate を通過しても最終 gate を省略しない。

作成時予防と事後検知の両面運用: 配布物の新規作成を委譲する実行系（case-run の委譲 context）は、
配布物本文の記述規則（concrete-id・ADF-COVERS 宣言の本文直書き禁止、traceability sidecar への対応宣言
登録）を作成時の予防観点として実行担当サブエージェントへ引き渡す。事前書き込み gate・最終 gate
（check_distribution_boundary --profile source 等）は事後検知として両立し、予防観点の引き渡しは
検知機構の代替にも検知機構の変更にもしない（REQ-031-032）。

## archive 公開前検査

archive は公開前に検査する。
違反が残存する場合は最終 archive と成功経路を残さない（DEC-014 決定7、REQ-009-045）。

## 安定実装契約

ユーザーが本 Design 候補へ配置を確定した安定実装契約。
Epic 実装はこれに従う。
関数署名、実装コード、内部データ表現は実装詳細として本節に含めない。

- 共有 module: 副作用なし（side-effect-free）の canonical detector module は repo-agentdev-integrity 配下が所有する。想定モジュールパスは `.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts`。既存の checker はこの共有 module への adapter となる。
- repo-local plugin: 原本は `src/opencode/plugins/agentdev-distribution-boundary-guard/` 配下（package.json に repo-local 配布除外の判定根拠を含む）。利用側は self-sync 投影（`.opencode/plugins/agentdev-distribution-boundary-guard/` junction + depth-1 loader shim `agentdev-distribution-boundary-guard.ts`）。
- plugin からの相対 import は、移動後に想定モジュールパス（canonical detector `.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts`）へ src 配下から .opencode 配下への逆向き参照になる（REQ-018 テスト fallback 観点）。
- 旧名称・旧パス（distribution-boundary-guard、`.opencode/plugins/distribution-boundary-guard.ts`）の残存は IR-055（runtime-unresolved-reference）の検出対象であり、 旧パス対照表（obsolete-vocabulary-map.yaml、削除済み）への登録運用は撤廃済みである。並存禁止は IR-055 の検出と case-close の最終検証で担保する。
- 事前書き込み gate: OpenCode の `tool.execute.before` フック（サポート対象は `edit`、`write`、`apply_patch`）で構成する。adapter は prospective content を評価し、違反または検査エラー時に書き込みを block する。
- archive 公開前検査の呼び出し点: `scripts/self/release/package-release-archive.ps1` が最終公開前に一時 archive を検証する。
- archive-installed 検証の配置: 一時的な consumer/archive-install パスを用いて archive-installed projection を検証する。consumer 向け公開入口（scripts/install.ps1）へ新たな責務を追加しない。archive-installed 検証は consumer 向け公開入口を利用しない別経路を維持する（特定入口名への再刻印を避け、将来の入口再編で再度陳腐化しない一般化表現とする）。
- trust root / protected path と配布 manifest の対象パス: スクリプトパスを契約として保持する検証処理・テストは新構造（scripts/install.ps1、scripts/self-sync.ps1、scripts/consumer/ 配下、scripts/self/ 配下）へ追従させる。trust root / protected path は新しい信頼対象パスを保護し、移動後の旧パスのみを保護する状態にしない。公開入口の実行依存集合（scripts/consumer/common.ps1 等）が配布 manifest 対象に完全に含まれることを検証対象とする。
- trusted-distribution-gate CLI（`trusted-distribution-gate/cli.ts`）の引数構文解析は `node:util.parseArgs` へ移行する。オプション間依存（`--profile release` 時の `--archive` 必須等）の意味検証は ADF 側に残留し、CLI の終了コード・stdout・stderr 契約は変更しない。移行契約の詳細は checker 共通実行契約 Design「再帰ファイル探索と CLI 引数解析の標準API移行」が定める。

## 関連 Design と実装詳細の帰属

- 検出シグナル、正規表現、exemption 条件、severity、gate 実行経路の詳細: IR-059 と integrity-rule-catalog.md、rule-ownership.md、req-impact-map.md の同期更新で整理する。
- 各 projection の技術詳細（link 構成、install 手順、archive レイアウト）: runtime-package-boundary.md、integrity-contracts.md の各 UPDATE で反映する。
- 関数署名、実装コード、内部データ表現: Epic 実装詳細。本 Design は安定実装契約（モジュールパス、plugin パス、フック種別、archive 検査呼び出し点）のみを正規所有する。
