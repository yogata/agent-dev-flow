# agentdev-command-authoring の delegated_check 様式例が工程表正規形以前のまま（ガイダンス資産の現行化検討）

## 観測

REQ-047-006 の B-03 解消（PR #2377、Issue #2373）で command-file-format.md が工程表形式を公開 command の正規形として確定したが、`src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md` の delegated_check 様式例（`### Step N: {検査名}` サンプル）は工程表正規形以前の旧様式のままである。

## 今回扱わない理由

同 references は正規定義ではなくガイダンス資産であり、REQ-047 の対象規則（正規契約の所有権一方向化）の対象外。正規契約と矛盾する記述ではなく、様式例の陳腐化に留まる。

## 影響

ガイダンスの様式例に従うと、公開 command の正規形（工程表形式）と乖離した手順記述を誘導し得る。

## レビューで決めること

- 様式例を工程表正規形へ現行化するか（該当 references の更新要否）

## 根拠

- PR #2377 本文「Findings / Capture候補」intake 3
