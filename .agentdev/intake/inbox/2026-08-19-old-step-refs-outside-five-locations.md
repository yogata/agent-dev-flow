# Issue 5箇所リスト外の旧 Step 参照残存（workflow-templates・execution-adapter・spec-file-manager・SPEC 群・IR-052）

## 観測

Issue 2238（OU-0023）の5箇所リスト外に旧 command 番号（Step N）参照が残存する。

- workflow-templates（SKILL.md・templates/pr_desc.md の case-close Step 3）
- case-run-execution-adapter（SKILL.md・references/adversarial-review-integration.md の「case-run command SPEC Step 7」。当該 SPEC は Step 番号を保持しないため stale）
- docs/specs/skills/agentdev-case-run-execution-adapter.md
- spec-file-manager（references/spec-lifecycle-application.md の case-close Step 3）
- docs/specs/skills/agentdev-git-worktree.md、docs/specs/workflows/delegation-contracts.md、IR-052

## 今回扱わない理由

Issue 2238 の対象は5箇所列挙（git-worktree・gh-cli・quality-gates の各 references、workflow-orchestration、system.md）に限定されていた。上記はスコープ外のため未対応。

## 影響

旧 Step 参照が現行 STEP 構成と乖離した状態で配布物・SPEC に残る。特に execution-adapter の「SPEC Step 7」は参照先が番号を保持しない stale 参照である。

## レビューで決めること

- 是正の実施単位（残存一括是正か、stale 参照のみ優先か）
- IR-052 の参照表記の扱い（ルール文書は検出パターン例示との境界確認を含めるか）

## 根拠

- PR 2281 本文「Findings / Capture候補」intake 候補2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2281）
- 除外判定の併記: req-structure-review.md 142行・design-principles.md 282行の「case-run Step N」言及は検出パターン・変換例の例示であり実参照ではないため本件対象外（同 PR 本文 intake 候補3件目）
