---
title: 自己完結 checker への決定的実装共有は同一形式リーダー複製 + 対決テストで機械担保する
created: 2026-09-23
updated: 2026-09-23
---

# 自己完結 checker への決定的実装共有は同一形式リーダー複製 + 対決テストで機械担保する

## 知識内容

repo-local checker（`.opencode/skills/repo-*` 配下）は自己完結実行が前提であり、テストは checker を一時 fixture へ copy して実行する fixture 進行テスト構成（copyScripts 規約）を取る。この構成では、他 module への静的 import で決定的実装を共有すると、fixture copy 先で import 解決が失敗し全テストが起動不能になる前提衝突が発生する。

衝突を避けつつ単一情報源契約を担保するパターン:

1. **同一形式リーダー複製**: 抽出・解釈ロジックを文字列レベルで同一の形式で複製する。データ単一情報源（レジストリ・policy 等の実体）は複製せず、両側とも動的読込で維持する。複製するのはロジックのみでデータは複製しない
2. **対決テスト**: 実リポジトリの単一情報源データ + 合成データパターン（実績では 6パターン）で、正（元実装）側リーダーと複製側リーダーの出力の同値性を機械検証する。実データでの同値性検証により複製の逸脱を恒常的に検出し、単一情報源契約を維持する

両リーダーとも、単一情報源データが読み取れない場合は空集合を返し従来どおり検出する fail-open の挙動を一致させておく。

## 適用条件

- repo-local checker（`.opencode/skills/repo-*` 配下）に、他 module（採番 script 等）が所有する決定的実装を共有する必要が生じた場合
- fixture 進行テスト構成（一時 fixture への copy + 実行）を持つ checker のテストで、静的 import 共有による import 解決失敗の前提衝突を避けたい場合
- 第二のレジストリ不在（単一情報源契約）を維持したまま、実装の二重化を許容する場合

## 適用対象

- repo-local checker 系（`.opencode/skills/repo-*`）の決定的実装共有全般（抽出・解釈ロジックの共有）
- fixture copy 規約を持つ同種構成の checker・検証 script
- 配布対象 Skill（agentdev-* 配布物）への一般化は本パターンの対象外（repo-local checker 系に特化した知見）

## 根拠

- PR #3075 case-run（Case #3063・Issue #3069・DEL-3069-3、commit e4264eb9）で実装・機械検証された実例に基づく
- 実例: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` の `extractKnownGapNumbers`（既知欠番レジストリ免除、REQ-087-004）。抽出形式は採番 script `alloc-req-number.ts` の同名関数と文字列レベルで同一であり、欠番レジストリの単一情報源は numbering-policy.md（動的読込）を維持する。単一情報源維持コメントと対決テスト言及は同スクリプト L560 付近に実在（backlog-review 実行時に現物確認済み）
- 対決テスト: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts` の「loads the same gap set as alloc-req-number.ts from the real numbering-policy（単一情報源）」（L5166 付近）。実リポジトリ numbering-policy + 合成 policy 6パターンで両リーダー出力の同値性を機械検証する
- 注記: 本知識の整備元である learning promoted 成果物は `src/opencode/skills/repo-agentdev-integrity/` を実装面のパスとして記載したが、src 側に repo-agentdev-integrity は実在せず、実体は `.opencode/skills/repo-agentdev-integrity/` 配下である

## 関連知識

- 直接の関連知識なし。checker の実行環境系の知見（[checker-cli-stdout-loss-on-windows-bun.md](checker-cli-stdout-loss-on-windows-bun.md) 等）は実行時の stdout 取得の話であり、本知識は checker の構成設計（fixture 進行テスト構成との実装共有方式）の話として区別する
