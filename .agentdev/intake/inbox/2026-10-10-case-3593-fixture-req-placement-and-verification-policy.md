# fixture 検証手順の知識化候補（fixture root の架空 REQ 配置と policy.yaml 影響の前置明示）

## 内容

代表事例の fixture 構築で、架空 REQ ID を使う管理された検証対象では fixture root に docs/requirements/REQ-*.md 配置（要件テーブル行形式）が必要である。さらに traceability/policy.yaml が不在の場合は全要件行が検証対応必須として扱われ、検証対応宣言なしの fixture REQ 行は missing-verification として fail に向かう。fixture 設計時にこの2点の前置（REQ 行形式の配置・policy.yaml の有無確認と fixture 内設置オプション）を手順として明示する必要がある。

## 影響

fixture ベースの v5 モード実行実証・検証を繰り返す実行者が、REQ 行配置漏れや policy.yaml 不在の影響を毎回自力で発見する必要がある。検証手順の決定性が損なわれ、初回実行者が traceability check の fail を検証対象データ由来か実装欠陥由来か区別できず誤判断し得る。

## 提案

fixture 検証手順を knowledge 文書化する（v5 モード運用手順の knowledge または docs/knowledge 配下）。手順には (1) fixture root の docs/requirements/REQ-*.md 要件テーブル行形式の配置、(2) traceability/policy.yaml 不在時は全要件行が検証対応必須になる旨と fixture 内 policy.yaml 設置オプション、(3) PR #3602 §3 の fixture 設計 3点運用（fixture 内 git リポジトリによる成果物表出の代替・架空 REQ 配置・GitHub 資産を作らない場合の検証対象内代替の明示）を含める。PR #3602 Design 確定候補評価の見送り記録（Issue #3593 コメント 6096682530）の再評価契機に対応する後続工程（learning-promote / backlog-review 経由の promoted 入力）で採否を判断する。

## 根拠

Epic #3585・PR #3602 Findings（intake 候補）。代表事例 (a)(b) の fixture 構築実績（PR 本文 §3 の記録が SSoT。worktree 内 fixture `.agentdev/tmp/DEL-3593-1/` case-a・case-b は worktree 側 gitignored 領域で永続対象外）。
