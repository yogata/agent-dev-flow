---
title: ADF v4 Migration と Release の標準境界
status: accepted
created: 2026-09-18
updated: 2026-09-19
---

# ADF v4 Migration と Release の標準境界

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 標準 migration pattern

Freeze source -> separate migration worktree -> semantic inventory/mapping -> target canonical paths への v4 state 構築 -> v4 validation -> cutover。

- source のその場破壊禁止
- 一時 staging（.agentdev-v4/ 等）は cutover 後に canonical candidate として残さない一時的なものである
- cutover 後の Project には canonical ADF state を一つだけ存在させる
- .agentdev/ を v4 正規 path とする場合の構築順序

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
