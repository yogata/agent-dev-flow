# integrity-contracts.md SPEC drift: docs-check allowed changes の承認フロー表現

## 観測

Issue #707（docs-check検出結果のintake item化）の乖離検出にて、`docs/specs/integrity-contracts.md` line 137のdocs-check allowed changes記述がREQ-0108-225「実行＝保存承認」と乖離していることを検出した。

### 対象箇所

- **SPEC**: `docs/specs/integrity-contracts.md` line 137付近
- **現行記述**: docs-checkのallowed changesに「承認時」という条件で `.agentdev/intake/inbox/` への保存を許可
- **REQ-0108-225**: docs-check実行自体が保存承認であり、別途ユーザー承認は不要

### 乖離の内容

SPECの「承認時」という表現は、別途ユーザーによる明示的承認プロセスを示唆しているが、REQ-0108-225ではコマンド実行＝保存承認としており、明示的承認は不要としている。

## 影響

docs-checkコマンドの利用者がSPECとREQで矛盾する指示を受ける可能性がある。

## 推奨対応

SPEC該当箇所の「承認時」を「実行時（REQ-0108-225）」に更新する。軽微な表現修正のみ。

## 出所

- PR #708: https://github.com/yogata/agent-dev-flow/pull/708
- 乖離検出: case-run Step 8（spec-compliance）
