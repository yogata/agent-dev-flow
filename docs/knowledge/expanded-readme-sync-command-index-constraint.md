---
title: expanded-readme-sync は全配布コマンド名言及を機械要求する（README 索引構成の接合点）
created: 2026-09-15
updated: 2026-09-15
---

# expanded-readme-sync は全配布コマンド名言及を機械要求する（README 索引構成の接合点）

## 知識内容

docs-check の expanded-readme-sync 検査は、ルート README への全配布コマンド名の言及（substring 一致）を機械要求する。PR 2792 が確立した README 構成（REQ-057-016: ルート README は索引と参照リンクで足りる）では、「配布コマンドの索引」リストがこの機械契約との接合点である。取り扱いは次のとおりである。

1. ルート README の「配布コマンドの索引」節は状態→コマンド対応を持たない純粋な名前索引であり、入口表（コマンド選択は docs/guides/command-selection.md）の復活を意味しない。
2. 今後 README 構成を変更（簡素化）する case は、索引リストの維持（機械契約遵守）または checker 側要件の見直しのいずれかを対応前提とする。
3. 索引リストを除去・縮小する場合は expanded-readme-sync の検査要件と衝突するため、checker 側要件の見直しを伴う変更として扱う。

## 適用条件

- ルート README の構成を変更（簡素化・節の除去・索引リストの変更）する case の計画時・実施時。
- docs-check expanded-readme-sync の検査要件変更を検討する場合。

## 適用対象

- ルート README.md の「配布コマンドの索引」節と配布コマンド言及全般。
- docs-check の expanded-readme-sync 検査（機械要求の正規所有者）。

## 根拠

- case 2791 / PR 2792: README 主要導線再編（入口表の command-selection.md 一元化、配布コマンドの索引リスト追加）で機械契約と REQ-057-016 の接合点が確立。case-close（2026-09-13）で回収、intake-promote（2026-09-15）で制約記録・知識統合系 item として採用、backlog-review（2026-09-15）で docs/knowledge/ 直接保存を承認。

## 関連知識

- （関連する既存知識文書なし）
