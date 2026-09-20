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
