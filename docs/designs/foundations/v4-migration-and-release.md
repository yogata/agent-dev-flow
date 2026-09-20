---
title: ADF v4 Migration と Release の標準境界
status: accepted
created: 2026-09-18
updated: 2026-09-20
---

# ADF v4 Migration と Release の標準境界

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 標準 migration pattern

Freeze source -> separate migration worktree -> semantic inventory/mapping -> target canonical paths への v4 state 構築 -> v4 validation -> cutover。

- source のその場破壊禁止
- 一時 staging（.agentdev-v4/ 等）は cutover 後に canonical candidate として残さない一時的なものである
- cutover 後の Project には canonical ADF state を一つだけ存在させる
- .agentdev/ を v4 正規 path とする場合の構築順序

### semantic inventory と mapping

semantic inventory は移行対象 Project の v3 状態の網羅列挙であり、mapping は v3 状態から v4 canonical path への対応表である。

- 列挙対象は v3 適用 Project の .agentdev/ 状態領域（intake・learning・backlog・drafts・inspect・issues の 6 領域。正は v4-collaboration-loop「.agentdev/ 状態領域の整合」表）と、v3 正規文書状態（REQ/Decision/Design の現行・廃止、crosswalk 上の処遇未実行行）である
- 各項目は領域・パス・分類（8 寿命分類）・処遇候補（保持/変換/廃止）の属性を持つ
- mapping は v3 状態から v4 canonical path への対応表形式とし、処遇区分は保持・変換・廃止の 3 値とする
- v4 canonical path の正は v4-durable-state-and-recovery「5 分類と配置表」であり、本 Design は参照にとどめ配置表を再掲しない

### v4 state 構築手順

target canonical paths への v4 state 構築は次の原則と構築順序で行う。

- Freeze source: v3 .agentdev/ をその場で破壊しない。移行作業は分離された migration worktree で行う
- 一時 staging（.agentdev-v4/ 等）は構築作業のための一時領域であり、cutover 後に canonical candidate として残さない
- 構築順序は次の 4 段階とする
  1. .agentdev/ 骨格（v4 正規 path 構造）
  2. 永続ドメイン状態（backlog、issues 等、Git 管理対象から）
  3. 一時領域（intake/learning inbox 等の空ディレクトリと .gitkeep）
  4. 投影構造（.opencode/ プロジェクション・junction 再作成）
- 各段階は冪等に再実行できる（v4-durable-state-and-recovery「部分失敗の調整」の非原子調整原則を援用し、成立済み段階を確認した上で未成立分のみを再実行する）
- cutover 後の Project には canonical ADF state を一つだけ存在させる（冒頭 4 原則の展開である）

### v4 validation

移行中に実行する検査と cutover 前の検査を分けて定義する。両者の実行時点と成立条件を分離し、cutover 判定の根拠を曖昧にしない。

- 移行中検査: 移行作業の各段階で実行する検査である。check_integrity 相当・traceability 相当・要件行対応の存在確認から構成する
- 構築済み state と semantic inventory・mapping との整合を段階ごとに確認する
- cutover 前検査: cutover 可否の前提となる feature complete 確認である。正規所有は後続 Sequence の full validation（第13段）であり、本 Design は移行側から見た接続のみを定義する
- 移行中検査の結果は cutover 前検査の入力とし、移行中検査不合格の state を cutover 前検査へ進めない

### 配布物・プロジェクションの移行

配布物と projection の移行時扱い（v3-v4-crosswalk「配布物・プロジェクション（概念）」行の処遇）は次のとおりとする。

- consumer は v4 正規 installation/projection 適用（cutover sequence の工程）までの間、v3 配布物のままで v4 state への移行準備を行える
- 移行準備のために配布物の先行更新を要求しない
- projection（junction/copy）は移行 worktree では作成しない。cutover 時に正規 installation/projection 手順で構築する
- 移行の境界は rollback anchor として v3-baseline tag を用いる（本 Design「v3 baseline と rollback anchor」節参照）

### 移行ツール群

標準 migration pattern を支援するツール群の契約は次の 3 種とする。

- v4-migration inventory 生成ツール: v3 .agentdev/ と docs 状態から semantic inventory と mapping 雛形を生成する、読み取り専用の決定的スクリプト。配置は scripts/consumer/v4-migration/（非公開ヘルパー領域）とし、出力は markdown 形式の inventory レポート（semantic inventory 表 + mapping 雛形表）とする
- v4 state 構築ツール: mapping に基づき canonical paths へ状態を構築するツール（契約のみ定義・実装は pilot で必要になった時点）
- cutover 支援ツール: cutover sequence の機械的検証を担うツール（契約のみ定義）

実装は必要になった時点で追加し、未使用ツールを先回りして実装しない（adapter 境界と同一原則の適用）。読み取り専用ツールは副作用ゼロとする（DEC-016 の導入系スクリプト副作用ゼロ原則を適用）。

## RC tag 運用と cutover sequence

v4.0.0-rc.N の annotated tag 運用（exact candidate commit、tag push、detached HEAD を通常開発環境としない）、RC 成立条件（feature complete 条件リスト）、cutover sequence（feature complete -> full validation -> 正規 release line 統合 -> branch push -> tag -> tag push -> worktree 更新 -> v4 正規 installation/projection 適用 -> controller 切替 -> self-hosting 開始）、RC 以降の self-hosting loop。

### feature complete 条件リスト

RC 成立条件（feature complete）は DEC-034 決定(3) の 15 項目とし、各項目に対応する実装段階と確認手段を持つ。確認手段は各段の Root Case Issue・Definition/実装 PR と crosswalk（v3-v4-crosswalk references/crosswalk-inventory.md）の executed 行への紐付けを基本とし、項目ごとの所有 Design・証跡は次表のとおりである。

| # | 条件項目 | 実装段階 | 確認手段 |
|---|---|---|---|
| 1 | v4 model canonical 確定 | 第1〜3段（Foundation・Runtime・REQ/Decision/Design implementation） | 各段の Root Case Issue・Definition PR・crosswalk executed 行 |
| 2 | Runtime | 第2段（二層状態機械・durable state・実行モデル） | v4-runtime-execution-model Design・crosswalk executed 行 |
| 3 | 文書運用 | 第3段（REQ/Decision/Design 再編・受理） | 現行 REQ/Decision/Design の accepted 状態・crosswalk executed 行 |
| 4 | req-define 相当入口 | 第4段（公開 UX 2 入口収斂） | v4-standard-lifecycle Design・crosswalk executed 行 |
| 5 | case-auto 相当 orchestration | 第4段（内部 lifecycle 回収） | v4-standard-lifecycle Design・crosswalk executed 行 |
| 6 | work_type/scale/Epic/Wave | 第5段（語彙直交性） | v4-standard-lifecycle Design・crosswalk executed 行 |
| 7 | Collaboration Loop | 第9段（継続コラボレーションループ） | v4-collaboration-loop Design・crosswalk executed 行 |
| 8 | Quality/Evidence/Gate | 第6段（Quality モデル） | v4-quality-gate-model Design・crosswalk executed 行 |
| 9 | Traceability | 第7段（Change/Evidence 中心化） | v4-traceability-model Design・crosswalk executed 行 |
| 10 | Skill 再編 | 第8段（semantic Skill / deterministic code 再分類） | 配布 Skill 構成（src/opencode/skills）・crosswalk executed 行 |
| 11 | Extensions | 第10段（semantic extension point） | v4-responsibility-boundaries Design・crosswalk executed 行 |
| 12 | adapter | 第11段（Harness/Backend adapter 境界） | v4-responsibility-boundaries Design・crosswalk executed 行 |
| 13 | migration mechanism | 第12段（標準 migration pattern） | 本 Design「標準 migration pattern」節・crosswalk executed 行 |
| 14 | automated validation | 第13段（full validation・本リストの全項目確認） | 本リスト全項目の確認記録・監査レポート（docs/reports/integrity/audits/） |
| 15 | self-hosting 開始可能 | 第13段（readiness の確認。実行は cutover 後の self-hosting + pilot 段階が所有） | 本リスト項目 1〜14 の成立確認と bootstrap self-hosting readiness の確認 |

確認は full validation（第13段）で一括実施し、証跡は監査レポートと crosswalk executed 行に紐付ける。

### cutover 実行手順

cutover sequence（DEC-034 決定(2)）の実行手順。feature complete 確認と full validation 再確認を前置確認として実行し、正規 release line 統合から controller 切替までの 7 操作を read-back 検証とともに実行する。この時点で初めて main へ統合する（cutover までの main 不変の運用制約は本 sequence の正規工程をもって解禁される）。git 操作・tag・push・projection 適用は自走対象とし、GitHub 上の設定変更（default branch 切替・branch protection 等）は行わない（外部 SaaS 設定変更は自走対象外）。

- 前置確認（cutover 直前の成立条件）: feature complete 15 項目（前節の対応表）・full validation 実施済み（第13段監査レポート）・crosswalk 全行 executed（第13段 case-close 成果）・main が cutover 直前状態（v3-baseline tag と同一 commit）・v4-dev と origin/v4-dev の同期・working tree clean。不成立の場合は blocked として報告し、cutover を開始しない
- 実行操作は次の 7 工程とする
  1. 正規 release line 統合: v4-dev から main への --no-ff merge とする（v3 から v4 への境界を merge commit として履歴に明示する。fast-forward は不可）。merge commit メッセージは「v4.0.0-rc.1 cutover: ADF v4 正規 release line 統合（v4-dev → main）」形式とし、本文に v3-baseline から v4-dev HEAD までの第1〜13段の経緯を要約する
  2. branch push: main を origin へ push する
  3. tag 作成: v4.0.0-rc.1 を annotated tag として merge 後の main HEAD（exact candidate commit）に付与する。tag message には DEC-034 決定(2) の境界宣言（controller cutover・full validation 済み candidate）を含む
  4. tag push: tag を origin へ push する。既存 tag（v3-baseline・vX.Y.Z）は一切移動しない
  5. worktree 更新: main repo の main branch を merge 後の状態へ更新する（pull・working tree clean 確認）。v4 worktree は untracked ファイル残存を確認した上で削除する（git worktree remove）。v4-dev branch は履歴保持のため残置する。cutover 後の canonical ADF state は main repo 一つのみである
  6. v4 正規 installation/projection 適用: main repo 上で scripts/self-sync.ps1 を dry-run → check → apply の順に実行する（本体 repo 向けの正規入口。install.ps1 は本体 repo では実行しない）。適用後は check_integrity の installed profile（projection_missing・projection_extra・content_mismatch・broken_junction なし）で投影整合を検証する
  7. controller 切替: 新世代が新世代自身を継続開発する段階への移行宣言とする。実体は cutover 証跡の SSoT コメント（Root Case への記録・merge SHA・tag SHA・projection 適用結果を含む）・進捗トラッカー（移行ロードマップ追跡 Issue）の当該段階行の更新・以後の v4 開発を main repo 上の main branch で実行する運用への切替である
- read-back 検証: 各操作の実行結果（merge 後 main SHA・tag の commit 参照・origin との同期・worktree 一覧・projection の junction 状態）を操作直後に検証する
- 失敗時の扱い: merge 前の失敗は main へ影響がないため v4-dev 上で fix-and-reverify とする。merge 後の失敗は rollback anchor（v3-baseline tag）を参照した報告とし、tag 移動・main 書換による回復は行わない。回復は正規開発経路（main 上の修正 commit）で行う

## pilot migration と v4.0.0 final 条件

正式リリース前の ADF 自己 self-hosting と複数既存 v3 適用 Project の RC pilot migration（検証項目リスト、RC tag 明示、未タグ main を migration target としない）、v4.0.0 final tag の成立条件、rc.N の運用。

- pilot migration の検証項目: semantic preservation、Project Contract 再構成、Loop continuity、Extensions migration、Quality 実用性、Traceability migration、req-define -> case-auto 実利用、context reconstruction、resume/recovery、rollback

## v3 baseline と rollback anchor

v3-baseline tag の参照方法、rollback 手順の骨子、非 SemVer 命名（v3-baseline）の採用根拠（release tag 空間との分離、SemVer ツールの誤解析回避）。

- v3-baseline は annotated tag として baseline 記録 commit（453a549f70edb1ca18b89b012ad5b8af6ee5d592、v3.4.0 と同一 commit）へ付与し、origin へ push 済みである
- 既存 tag（vX.Y.Z）は一切移動しない
- 現行開発体制は v3 凍結・v4-dev branch 分離とし、旧世代からの定期同期は原則不要（緊急修正時は個別反映）とする

## 後続 v4 Implementation Sequence

Foundation -> Runtime/lifecycle/state -> REQ/Decision/Design implementation -> req-define/case-auto UX -> work_type/scale/Epic/Wave -> Quality -> Traceability -> Skill restructuring -> Loop -> Extensions -> adapters -> migration implementation -> full validation -> v4.0.0-rc.1 -> self-hosting + pilot -> RC fixes -> v4.0.0 の依存順序と調整原則（RC 前に migration と bootstrap self-hosting readiness を満たす）。
