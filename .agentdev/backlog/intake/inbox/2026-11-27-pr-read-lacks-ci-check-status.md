---
id: 2026-11-27-pr-read-lacks-ci-check-status
created_at: 2026-11-27T02:22:00+09:00
source: case-ready (Root Case #4227 の自工程 deviation capture)
status: unreviewed
---

# agentdev_gh の pr_read に CI 検査結果の欄がなく、case-ready STEP-1 の「設計PRの CI 結果の確認」を正規経路だけでは読み取れない

- **課題**: `src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md` は設計PRの CI 結果と品質検査結果の確認を求め、CI の失敗時は merge しないとしている。一方で Custom Tool `agentdev_gh` の `pr_read` の出力に CI 検査結果の欄がない。GitHub I/O は `agentdev_gh` に限定されるため、CI を持つリポジトリでは case-ready が CI の失敗を読み取る経路がない
- **期待する処分**: `pr_read` または専用の読み取り操作に検査結果の要約を加えるか、case-ready の手順に CI 結果の確認手段を明記するかを判断する
- **出典**: Root Case #4227 の case-ready 実行（2026-11-27、設計PR #4228 の受入）
- **実証根拠**: (1) definition-acceptance.md の 22 行と 76〜78 行の規定。(2) 2026-11-27 に `pr_read`（#4228）を実行し、出力が title、body、state、mergeable、isDraft のみであること。(3) `src/common/tools/agentdev-gh/` 配下に statusCheck、checkRun、checks を含むファイルがないこと（grep による検索）。本リポジトリは `.github/` がなく CI を持たないため、今回は品質検査（acceptance-checks の機械ゲートと merge 後の pre-push ゲート）で判断し、影響は生じなかった
