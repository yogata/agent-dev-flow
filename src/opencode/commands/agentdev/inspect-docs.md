---
description: docs全体の意味整合性を検出し、inspect finding を .agentdev/inspect/inbox/ へ出力する
agent: sisyphus
---

# inspect-docs

docs全体（REQ/ADR/SPEC/guides/DOC-MAP）の意味整合性を診断し、finding を `.agentdev/inspect/inbox/` へ出力する read-only 診断コマンド。REQ structure review（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）に加えて SPEC・ADR・guides・DOC-MAP の意味診断を含む。

## 基本原則: 診断専用（Read-Only）

診断のみを実行する。許可される side effect は `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit / push）のみ。

- 診断結果の提示（finding、根拠、source-of-truth判定、推奨route）
- `.agentdev/inspect/inbox/` への finding 出力
- Issue/PR作成・worktree作成・intake/learning/RU処理の禁止

## Input

- なし（コマンド実行時に全対象 artifact を自動スキャン）

## Output

- 診断結果（セッション内テキスト出力 + `.agentdev/inspect/inbox/` への finding file）
  - finding リスト（観点、対象、根拠、source-of-truth判定、推奨route）

## Steps

1. **スキャン対象の収集**: `docs/requirements/`、`docs/adr/`、`docs/specs/`、`docs/guides/`、`docs/DOC-MAP.md`、`README.md`、`.opencode/` を収集
2. **REQ参照ID整合性確認**: `agentdev-req-structure-diagnostics` 参照
3. **第一参照導線確認**: `agentdev-req-structure-diagnostics` 参照
4. **active/retired/世代境界確認**: `agentdev-req-structure-diagnostics` 参照
5. **SPEC意味診断**: SPEC が REQ/ADR/guides の代替・将来計画の混入・runtime依存先としての不適切扱いを確認
6. **ADR意味診断**: accepted ADR のみを現行判断の根拠として扱っているか確認
7. **guides意味診断**: guides が navigation layer の範囲を超えていないか確認。履歴混入を検出した場合 route を追加（REQ-0115-041）
8. **DOC-MAP意味診断**: DOC-MAP が索引の範囲を超えていないか確認。内容過多を検出した場合分割を誘導（REQ-0115-042）
9. **REQ structure review（6観点）**: SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT。`agentdev-req-structure-diagnostics` 参照
10. **文書分類一貫性検査**: `docs/specs/document-model.md` の classification policy への適合確認。REQ 要件行に schema field、enum 値一覧、route/category/status 判定表、file pattern、template variant、report format、内部アルゴリズム、作業履歴、実装パラメータ等の SPEC分離基準違反が残留していないかを `agentdev-req-structure-diagnostics` に従って自動検出する
11. **docs-check route判定**: 意味的疑いのうち機械的検査に落とせるものを docs-check rule/fixture 候補として提示
12. **未処理artifact確認**: `agentdev-req-structure-diagnostics` 参照
13. **finding 出力**: finding を `.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md` へ出力。source-of-truth priority: active REQ > accepted ADR > SPEC > DOC-MAP/guides
14. **実行前同期（git pull --ff-only）**:
    - `git pull --ff-only` を実行
    - **失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（自動解消しない）
15. **.agentdev/inspect/ 変更の commit と push**:
    - `git diff --name-only` で `.agentdev/inspect/` 配下の変更を確認
    - **変更なし時**: commit/push せず完了報告で「変更なし」と報告
    - **変更あり時**:
       1. `git add` は `.agentdev/inspect/` のみ対象
       2. commit message: `chore(agentdev): capture inspect-docs finding`
       3. `git push` 実行
       4. **push 失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（完了扱いにしない）
16. **完了報告**: 完了報告 template に従って出力

## Guardrails

- G01: ファイルを変更・作成・削除しない。ただし `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成は例外として許可する
- G02: GitHub Issue/PR を作成・更新しない
- G03: worktree/ブランチを作成しない
- G04: intake/learning/RU の処理を行わない
- G05: source-of-truth priority（active REQ > accepted ADR > SPEC > DOC-MAP/guides）に従って矛盾を判定する

## Error Handling

| エラー | 対処 |
|--------|------|
| スキャン対象ディレクトリが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| DOC-MAP が存在しない | 該当 step をスキップし、警告を出力 |
