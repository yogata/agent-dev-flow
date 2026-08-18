# real repo integration テスト2件の repo 状態依存の恒常失敗（checkWorkflowPreventive・IR-055 実修復回帰）

## 観測

full integrity suite の次の2テストが、base commit（5d89b9df）と main リポジトリ（junction 有り）の双方で失敗する。

- check_workflow_preventive.test.ts「all 7 preventive items pass (ok=true)」
- check_integrity.test.ts「IR-055 runtime-unresolved-reference 実修復回帰（Issue #1782）」

real repo integration テストの repo 状態依存の既存欠陥候補。

## 今回扱わない理由

Epic #2213（EU-C）Wave 1 の各 Issue スコープ外の既存失敗。PR #2258 の Findings に記録のみ実施。

## 影響

full integrity suite が恒常的に 2 fail を含み、新規変更のテスト判定でノイズになる。post-merge main（3937fbf1）でも 2038 pass / 2 fail で同一。

## レビューで決めること

- checkWorkflowPreventive 分は既存 intake item（2026-08-18-workflow-skill-softguard-undeclared.md）と重複するため、本 item からの二重採択を避ける扱いを決める
- IR-055 delta 分は Issue #2210（対応中）が対象としているため、本 item と Issue 2210 の整理関係を決める
- real repo integration テストの repo 状態依存を検知可能にする運用（hermetic 化または事前帰属確認）を取るか

## 根拠

- PR 2258 本文「Findings / Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2258）
