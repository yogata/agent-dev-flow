# integrity-contracts.md SPEC drift: docs-check allowed changes の承認フロー表現

## 観測

`docs/specs/integrity-contracts.md` line 137 の docs-check allowed changes 記述が REQ-0108-225「実行＝保存承認」と乖離している。

### 対象箇所

- **SPEC**: `docs/specs/integrity-contracts.md` line 137 付近
- **現行記述**: `.agentdev/intake/inbox/`（承認時）
- **REQ-0108-225**: docs-check 実行自体が保存承認であり、別途ユーザー承認は不要

### 乖離の内容

SPEC の「承認時」という表現は別途ユーザーによる明示的承認プロセスを示唆しているが、REQ-0108-225 ではコマンド実行＝保存承認としており、明示的承認は不要としている。

## 影響

docs-check コマンドの利用者が SPEC と REQ で矛盾する指示を受ける可能性がある。

## 推奨対応

SPEC 該当箇所の「承認時」を「実行時（REQ-0108-225）」に更新する。軽微な表現修正のみ。

## 出所

- PR #708: https://github.com/yogata/agent-dev-flow/pull/708
- 乖離検出: case-run Step 8（spec-compliance）
