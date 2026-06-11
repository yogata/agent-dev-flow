# case-open Issue 作成詳細

case-open が REQ ファイルまたは要件 doc から GitHub Issue を作成する際の詳細手順を定義する。親エージェントは進行判断・Issue 作成・更新・削除・完了報告を担当し、サブエージェントへ委譲する場合は探索・検査・候補抽出のみを依頼する。

## Issue 本文生成

1. `docs/requirements/REQ-{NNNN}.md` が存在する場合は REQ 内容の目的・要件・適用範囲を読み取る。存在しない場合はセッション内要件 doc から直接生成する。
2. `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md` または `issue_desc_bug.md` を Read tool で読み込む。
3. REQ または要件 doc の `## Requirement Source` を補足情報セクション後に配置する。
4. 関連ドキュメント更新候補セクションを転記する。
5. 関連ドキュメント更新候補の `直接矛盾` は完了条件にチェックボックスとして反映する。
6. 各テスト項目が単一 PR 内で完結可能か判定する。完結不可項目は `- [ ]` として出力せず、情報保持が必要な場合のみ `> ℹ️ 別途確認: {項目名}` とする。

## Epic flow 詳細

1. Epic テンプレート `issue_desc_epic.md` を Read tool で読み込む。
2. `{summary}`、`{problem}`、`{solution}`、`{completion_criteria}` を埋める。
3. 子 Issue 番号は `#{TBD}`、Wave 対象 Issue は `#{TBD_Wn}` として分解テーブルと Wave テーブルを生成する。
4. マルチ REQ では各 REQ doc の依存関係を解析し、対象 REQ 列に REQ 番号を記載する。
5. 単一 REQ Epic では `agentdev-workflow-orchestration` の Wave scheduling ロジックに従う。
6. ステータス追跡テーブルの総数・進行中・完了を初期化する。
7. 子 Issue 数が上限を超える場合は Epic・子 Issue のいずれも作成せず停止する。
8. Epic Issue を `enhancement`、`feature`、`epic` ラベル付きで作成し、`agentdev-gh-cli` の VERIFY 操作で検証する。
9. 子 Issue は `issue_desc_child.md` を使い、本文先頭に `Parent: #{epic_number}` を置く。
10. マルチ REQ の子 Issue には Wave 番号、依存、REQ doc 番号を補足情報として記載し、必要に応じて孫 Issue 判定を行う。
11. 子 Issue 作成後、Epic 本文内の `#{TBD}` と `#{TBD_Wn}` を実番号に置換し、ステータス追跡テーブルを更新する。
12. Epic 本文更新後も `agentdev-gh-cli` の VERIFY 操作で検証する。

## Standard flow 詳細

1. `docs/adr/README.md` から関連 ADR を特定する。単一 REQ Epic flow の内容反映にも活用する。
2. `agentdev-workflow-lifecycle` のラベル体系に従ってラベルを決める。
3. `gh issue create --body-file` で Issue を作成し、VERIFY 操作で検証する。
4. バグ・軽微変更では `issue_comment_bug_analysis.md`、機能追加では `issue_comment_feature_technical.md` を読み込み、コメントを追加して VERIFY 操作で検証する。

## 共通終了詳細

1. `.sisyphus/drafts/req-draft-{topic-slug}.md` が存在する場合は削除する。
2. Issue 作成と VERIFY が正常完了した場合のみ、Requirement Source から抽出した `RU-*.md` に一致する RU ファイルを削除する。
3. RU パターンに一致しないファイルは削除しない。
4. 削除後、commit/push 後に `git rev-parse HEAD` と `origin/main` が一致し、`git status --porcelain` に削除 RU が残っていないことを確認する。失敗時はファイル・HEAD・origin/main を表示して停止する。
5. 完了報告 template は Standard、単一 REQ Epic、マルチ REQ Epic の実行結果に応じて選択する。
