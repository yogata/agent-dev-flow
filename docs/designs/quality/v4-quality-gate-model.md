---
title: ADF v4 Quality / Verification / Evidence / Gate モデル
status: draft
created: 2026-09-18
updated: 2026-09-18
---

# ADF v4 Quality / Verification / Evidence / Gate モデル

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 5 概念の定義と責務

Quality Policy / Verification Obligation / Verifier / Evidence / Gate の定義、相互の非重複責務、Gate = 状態遷移 predicate としての契約、tool-specific detail の Verifier/adapter 配置原則。

- Quality Policy: 何を品質として要求するか
- Verification Obligation: Requirement/risk/acceptance から何を検証すべきか
- Verifier: deterministic または semantic な検証を実行する主体
- Evidence: 検証結果の永続的または参照可能な根拠
- Gate: 次状態へ遷移するために必要な条件/Evidence が揃っているかを判定する predicate
- Gate を checker、test、Skill の別名として定義せず、Bun invocation、path check、lint command 等の tool-specific detail は Gate の意味契約へ含めず Verifier/adapter/deterministic implementation 側へ置く

## v4 standard lifecycle からの Gate 再導出

現行 QG-1〜QG-4 を前提としない再導出手順、requirements-driven verification（change -> risk -> verification obligation -> test strategy）との接続、要求形成時に必要 Evidence 種類を確定し実行後に同一 Evidence で完了判定する閉ループ。

- 現行 QG-1〜QG-4 を v4 の前提とせず、v4 standard lifecycle と requirements-driven verification から必要な Gate を再導出する
- 要求形成時に必要 Evidence の種類が明確になり、実行後にその Evidence で完了判定できるモデルを作る

## Verifier 分類

deterministic verifier と semantic verifier の分類、Evidence の保存契約（永続/参照可能）。
