---
title: ADF v4 実装責務境界（semantic Skill / deterministic code / Harness adapter / Project Extensions）
status: draft
created: 2026-09-18
updated: 2026-09-18
---

# ADF v4 実装責務境界（semantic Skill / deterministic code / Harness adapter / Project Extensions）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## semantic / deterministic 責務境界

semantic 責務と deterministic 責務の分類基準と、現行 Skill の再分類判定基準。

- semantic 責務（Skill が所有）: requirement analysis、architecture/design judgment、decomposition judgment、adversarial review、learning evaluation、semantic classification（6 項目）
- deterministic 責務（code/script/tool が所有）: parsing、validation、ID 採番、状態遷移、dependency graph、Wave scheduling、path safety、traceability extraction、evidence aggregation、API I/O、file transformation（11 項目）
- Skill 数の削減自体を目的としない

## Harness / Backend adapter 境界

ADF（semantic contract）と Harness（実行機構）の責務分担、OpenCode を first-class reference harness とする位置づけ、adapter 追加契機、未使用 adapter の先行実装禁止。

- ADF は requirement/lifecycle/authority/evidence 等の semantic contract を所有する
- Harness は agent 起動、context、background execution、tool invocation 等の実行機構を所有する
- OpenCode を first-class reference harness として扱う。必要になった時点で adapter を追加し、未使用 Harness/Backend を先回りして実装しない

## Project Extensions の semantic extension point

標準プロセス置換でない追加モデルと、現行 Skill 名結合からの移行方針。

- Project Extensions は、project context、rules、quality/evidence policy、project-specific verifier/check、tool/config integration、semantic guidance を標準プロセスへ追加する semantic extension point である（表現力 6 項目）
- 標準プロセスを別 workflow へ置き換える仕組みとしない
- 現行 Skill 名への直接結合を v4 の安定 API としない
