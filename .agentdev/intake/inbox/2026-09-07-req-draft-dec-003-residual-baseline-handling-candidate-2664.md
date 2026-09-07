---
id: intake-20260907-req-draft-dec-003-residual-baseline-handling-candidate-2664
title: req-draft.md L118 の DEC-003 引用残存の OU-0003 baseline 再取得時の扱い判断
created: 2026-09-07
status: inbox
---

## 概要
- PR: #2677（Issue #2664・Epic #2653 Wave 1・OU-0002 配布物 concrete REQ 行 ID 是正 10箇所）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

src/opencode/commands/agentdev/templates/req-define/req-draft.md L118 の DEC-003 引用が concrete-id 検出（IR-059 系 checker、category concrete-id）として残存する。Decision ID であり本 Issue の REQ 行 ID スコープ外（CR-001）の既存起因で、本 PR では未是正のまま（checker 上の concrete-id hits は main 13件 → PR HEAD 1件、残存 1件は本箇所）。OU-0003（Issue #2665）の concrete-id baseline 再取得時の扱い（baseline 取り込み or 是正）の判断対象である。

## 変更候補

- OU-0003（#2665）baseline 再取得時に本エントリを baseline 取り込みするか、配布物本文から機能的記述へ是正するかを判断する
- 判断は distribution-boundary.md の再取得手順と baseline 運用（解消済み違反残存なし）に従う

## 関連
- Issue #2664（クローズ済み。OU-0002）
- Issue #2665（OU-0003。Epic #2653 Wave 2、open）
- PR #2677（squash merge commit 622cb977）
- src/opencode/commands/agentdev/templates/req-define/req-draft.md L118
