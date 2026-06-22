---
source_type: chat
generated_by: session
generated_at: 2026-06-22T12:11:06+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-22-doc-boundary-root-cause-remediation
---

# 真因分析に基づく文書責務境界とレポジトリ全体の抜本的修正

## 背景

case-run の `ulw-loop` 委譲契約バグを確認した結果、単なる記述ミスではなく、REQ / ADR / SPEC / command / skill / AGENTS.md の責務境界が実効的に検査されていないことが明らかになった。

今回の一例は、`ulw-loop` を skill と誤認した直接バグである。しかし、同じ種類の問題は、特定語句の検索だけでは検出できない。真因は語句ではなく、文書種別ごとの責務逸脱である。

## 問題

現行の文書・配布物・スキル体系には、以下の構造的問題がある。

- REQ に実装手順、具体 command、task() 呼び出し例、下位実装名が混入し得る
- ADR が採用する構造や責務境界ではなく、廃止・削除・移行・置換・修正作業そのものを主題化し得る
- SPEC が command / skill / subagent / harness / adapter の実行主体分類を誤認し得る
- command が SPEC 未定義の実行契約を持ち得る
- skill が command、harness、subagent を skill と誤称し得る
- AGENTS.md が SPEC / command / skill と矛盾する実行前提を正規化し得る
- doc-writing / req-analysis / inspect 系がこれらの同型問題を検出できていない

## Source Summary

本セッションでは、以下を合意した。

- `ulw-loop` 問題は症状であり、真因ではない
- 真因は、文書種別ごとの責務境界チェックが効いていないことである
- 横断検索は `ulw-loop`、`load_skills` などの既知語句に寄せるべきではない
- 真因分析に基づき、文書種別ごとの検出軸を定義する必要がある
- REQ / ADR / SPEC / command / skill / AGENTS.md の全体を対象に、同型問題を洗い出す必要がある
- 一例の是正に留めず、再発防止を doc-writing / inspect 系へ適用する必要がある
- Issue #1015 の是正とは分離する必要がある

## 統合理由

本 RU は、`ulw-loop` 固有の直接バグではなく、レポジトリ全体に対する構造的な是正である。

以下は同一の真因から派生しているため、まとめて扱う。

- REQ への下位実装詳細の混入
- ADR の非Decision化
- SPEC / command / skill の実行主体分類誤認
- command / skill / AGENTS.md 間の契約不整合
- doc-writing / inspect 系による検出漏れ

## 要件化の方向

文書種別ごとの責務境界を、検査可能な基準として整理する。

REQ:

- 達成すべき状態を記述する
- 実装手順、具体 command、task() 引数、ブランチ名、ファイル編集手順、下位実装名を主要件として固定しない

ADR:

- 採用する構造、責務境界、情報源、実行モデルを意思決定として記録する
- 廃止、削除、移行、置換、修正作業そのものを Decision の主題にしない
- 廃止や移行は、採用決定の結果、影響、非採用案として扱う

SPEC:

- command / skill / subagent / harness / adapter の実行主体分類を明示する
- task() などの呼び出し契約は、実在する型分類に基づいて記述する
- command と配布物が従う契約を定義する

command:

- SPEC に基づく実行手順を記述する
- SPEC 未定義の実行契約を独自に追加しない
- ユーザー実行手順とサブエージェント委譲契約を混同しない

skill:

- モデルが参照する判断補助・実行知識を提供する
- command、harness、subagent を skill と誤称しない
- REQ / ADR / SPEC の判断を上書きしない

AGENTS.md:

- リポジトリ固有の運用前提と制約を記述する
- SPEC / command / skill と矛盾する実行契約を持たない

## 主対象REQまたは変更対象候補

主対象REQ候補:

- 文書種別責務境界に関わる既存REQ
- REQ品質基準に関わる既存REQ
- inspect / docs-check / doc-writing の品質検査に関わる既存REQ

変更対象候補:

- `docs/requirements/`
- `docs/adr/`
- `docs/specs/`
- `src/opencode/commands/`
- `src/opencode/skills/`
- `AGENTS.md`
- `src/opencode/skills/agentdev-doc-writing/`
- `src/opencode/skills/agentdev-req-analysis/`
- `src/opencode/skills/agentdev-req-structure-diagnostics/`
- inspect-docs 系 command / skill / script
- command / skill / SPEC 整合性検査

## 対象外

以下は本 RU の対象外とする。

- `ulw-loop` 固有の委譲契約直接是正
- Issue #1015 の command 実装
- 未調査の個別ファイルに対する推測ベースの修正
- 実装計画の詳細化
- コード差分案
- PR 作成
- Issue 作成

## 受け入れ条件

- REQ に実装手順、具体 command、task() 呼び出し例、ブランチ名、具体ファイル編集手順、下位実装名を主要件として固定している箇所が横断検出されている
- ADR のタイトル、Decision 見出し、Decision 主文において、廃止・削除・移行・置換・修正作業そのものを主題化している箇所が横断検出されている
- SPEC において、command / skill / subagent / harness / adapter の実行主体分類を誤認している箇所が横断検出されている
- command において、SPEC 未定義の実行契約または実行不能な task() 委譲例が横断検出されている
- skill において、command、harness、subagent を skill と誤称している箇所が横断検出されている
- AGENTS.md において、SPEC / command / skill と矛盾する実行契約が検出されている
- 検出された同型問題が、文書種別ごとの責務に従って修正されている
- ADR 執筆要領に、廃止・削除・移行・置換を Decision 主題にしない基準が追加されている
- REQ 品質基準に、実装詳細を主要件化しない基準が追加されている
- SPEC / command / skill の実行主体分類チェックが追加されている
- doc-writing / inspect 系で、同型の混入を検出できる
- Issue #1015 の実装内容が本 RU に混入していない
