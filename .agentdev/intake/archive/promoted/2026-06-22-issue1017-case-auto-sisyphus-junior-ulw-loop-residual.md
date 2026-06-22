# case-auto.md に残存する Sisyphus-Junior(ulw-loop) 誤分類

## 観測

PR #1022 (Issue #1017) で case-run 委譲契約の誤分類（`ulw-loop` を skill として扱う記述）を7対象ファイルで是正した。その過程で、Issue #1017 の対象ファイル外だが同じ誤分類パターンが `src/opencode/commands/agentdev/case-auto.md`（L45, L74）に2箇所残存することを検出した。これらは「case-run は Sisyphus-Junior(ulw-loop) への task 委譲モデルを使用する」「case-run は現在 Wave の ready 子Issue を Sisyphus-Junior(ulw-loop) に並列委譲（最大5件）」という文脈で現れる。

## 影響

- `case-auto.md` が case-run の委譲契約を説明する際、SPEC `docs/specs/commands/case-run.md`（正規化済み）・`src/opencode/commands/agentdev/case-run.md`（本 PR で正規化済み）と表記が不一致。読者に「ulw-loop は Sisyphus-Junior の修飾または別名」との誤解を与える可能性がある。
- Issue #1017 の完了条件「`src/opencode/` 配下で `load_skills=["ulw-loop"]` 0 件」「`ulw-loop.{0,10}(スキル|skill)` 0 件」の字面判定では捕捉されない（`Sisyphus-Junior(ulw-loop)` 表記のため）。別パターン `Sisyphus-Junior\(ulw-loop\)` での grep が必要。

## レビューで決めること

- 当該 2 箇所（L45, L74）を `Sisyphus-Junior(ulw-loop)` → `Sisyphus-Junior` に修正するバグ修正 Issue を起票するか。
- 修正時に `case-auto.md` 内の委譲契約記述全体を SPEC `docs/specs/commands/case-run.md` と再照合し、他の表記揺れがないか確認するか。
- 予防措置として、`Sisyphus-Junior\(ulw-loop\)` パターンの grep 検査を `/repo/docs-check` または `inspect-skills` に恒久的ルールとして追加するか（F-2 と同根）。

## 根拠

- PR #1022: https://github.com/yogata/agent-dev-flow/pull/1022（Findings / Capture候補 F-1）
- Issue #1017: https://github.com/yogata/agent-dev-flow/issues/1017（本 PR の対象ファイル外）
- 対象: `src/opencode/commands/agentdev/case-auto.md` L45, L74
- 関連 SPEC: `docs/specs/commands/case-run.md`（正規化済み委譲契約）
- 後続 Epic: OU-002（文書責務境界の抜本修正）の候補対象
