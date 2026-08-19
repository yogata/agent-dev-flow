# 成果物責任表に廃止済み agentdev-doc-map 参照が残存

## 観測

docs/specs/responsibilities/artifact-responsibilities.md の L54（「操作 skill の正規所有者一覧」表 `agentdev-doc-diagnostics` 行の対象外欄「探索順（`agentdev-doc-map`）」）と L60（重複なし確認の「`agentdev-doc-map`（探索順）」）に、廃止済み配布スキル `agentdev-doc-map`（REQ-013-002/003 で廃止、実体不存在）への参照が現役で残存している。

## 今回扱わない理由

Issue #2250（OU-0040）の TS-040 grep 対象は doc-diagnostics SPEC（docs/specs/skills/agentdev-doc-diagnostics.md）のみであり、artifact-responsibilities.md は本 Issue の対象範囲外。

## 影響

廃止済みスキルが現役であるかのような参照が docs/specs/responsibilities/ に残存し、読み手を旧所有権構成（探索順の旧所有者表明）へ誘導する。

## レビューで決めること

- 歴史記述として許容するか、廃止スキル参照の是正漏れとして現行の正規所有者記述（README 索引・トレーサビリティ派生索引）へ更新するか

## 根拠

- PR 2285 本文「Findings / Capture候補」セクション intake 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2285）
