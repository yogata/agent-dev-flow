# check_integrity.ts の NG baseline 未登録により main 既存 Warning 14件が終了コード1のドライバーとなる

## 観測

PR 2321（Issue 2318、DEC-018 適用確定の検証）の品質統制で worktree 内（branch chore/issue-2318、base origin/main 9c2e3c51 と同一ツリー）から `bun .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --root .`（source profile）を実行したところ、NG 0 / OK 247 / Warning 14 / Info 144 であった。check_integrity.ts に NG baseline が未登録のため、この Warning 14件（レベル Warning、main 既存、DEC-018 無関係）が終了コード1のドライバーとなった。

- Warning 14件の内訳: LinkIntegrity 1、LifecycleBoundary 10、Decision 3
- すべて main 既存（検証 worktree は base 9c2e3c51 と同一ツリー）。DEC-018・docs/decisions/README.md・docs/README.md に関わる検出は 0 件
- Decision カテゴリの警告は DEC-017（proposed）・DEC-005（superseded）の citation のみ

## 今回扱わない理由

当該 Issue は前工程完了度「検証のみ」（ファイル変更なし）であり、Warning はいずれも main 既存で本件由来ではない。route: intake 指定のため、intake パイプラインでの triage 候補として記録する。

## 影響

check_integrity.ts が baseline 未登録の main 既存 Warning を伴う限り終了コード1を返し続ける。検証ワークフローからは NG と Warning の区別が終了コード上で崩れ、警告ノイズが検証合格判定の妨げになる。

## レビューで決めること

- main 既存 Warning 14件（LinkIntegrity 1、LifecycleBoundary 10、Decision 3）を NG baseline 登録・許容運用・参照側是正のいずれで扱うか

## 根拠

- PR 2321 本文「Findings / Capture候補」intake 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2321）
- 重複参照先: .agentdev/intake/inbox/2026-08-19-check-integrity-warning-dec-nonaccepted-citation.md（Decision 3件系）、.agentdev/intake/inbox/2026-08-18-retired-req-warn-prefix-match.md（REQ-028 retired 参照系）
