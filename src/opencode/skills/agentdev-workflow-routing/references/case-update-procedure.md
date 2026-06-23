# case-update 詳細手順

case-update が既存 Case の本文更新、コメント追加、REQ ファイル更新、レビュー NG コメント投稿を行う際の詳細手順を定義する。親エージェントは Issue 更新、REQ ファイル更新、commit、push、ユーザー確認を担当する。サブエージェントへ委譲する場合は状態読解、分類候補、根拠抽出のみを依頼する。

## Issue 番号解決

1. ユーザー入力から Issue 番号を取得する。
2. 番号が省略された場合は、セッション内会話から直近の Issue 番号を検索する。
3. 複数の Issue 番号が存在する場合は直近のものを優先し、ユーザーに確認する。
4. 検出できない場合はユーザーに番号の指定を求めて停止する。

## 本文更新

Issue 作成時に使用された `issue_desc_bug.md`、`issue_desc_feature.md`、`issue_desc_epic.md`、`issue_desc_child.md` のいずれかに従って更新する。該当テンプレートの必須セクションが全て本文に含まれることを確認し、`gh issue edit` で更新する。

## コメント追加

`.opencode/skills/agentdev-workflow-templates/templates/issue_comment_update.md` を Read tool で読み込む。テンプレートの必須セクションが全てコメント本文に含まれることを確認し、欠落時は生成をやり直す。投稿は `gh issue comment` で行う。

## REQ ファイル更新

case-update `--req` は req-save へ委譲せず、直接 commit と push を行う。

1. Issue 本文の REQ 番号参照、または `docs/requirements/` から関連 REQ ファイルを特定する。
2. 更新タイプを APPEND または UPDATE に判定する。
3. APPEND は要件テーブルへの行追加または適用範囲の拡張として扱う。
4. UPDATE は既存セクションの内容修正として扱う。
5. frontmatter `updated` フィールドを現在日時に更新する。
6. ファイルを書き出す。
7. `gh issue edit` で Issue 本文の該当箇所も同期する。
8. REQ ファイルおよび影響を受ける docs ファイルを commit + push する。

## レビュー NG コメント

入力条件は、`agentdev-spec-compliance` の乖離報告とユーザー承認済み判断が存在することとする。

1. `agentdev-spec-compliance` の乖離報告から影響度、対象、内容、推奨アクション、理由を抽出する。
2. 乖離タイプに基づき、spec-bug、impl-bug、scope-creep、テスト不足、品質基準未達へ分類する。
3. spec-bug は REQ UPDATE とレビュー NG コメント投稿を行う。
4. impl-bug はレビュー NG コメント投稿のみを行う。
5. scope-creep は REQ UPDATE とレビュー NG コメント投稿を行う。
6. テスト不足、品質基準未達はレビュー NG コメント投稿のみを行う。
7. `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_review_ng.md` を Read tool で読み込み、必須セクション欠落時は生成をやり直す。
8. agentdev-spec-compliance 結果をテンプレートの「仕様適合性 結果」セクションに展開する。
9. NG 理由分類のチェックボックスを自動選択する。
10. `agentdev-gh-cli` に従い `--body-file` 経由でコメント投稿する。

## 更新漏れ局所確認

レビュー NG コメント投稿後、乖離内容に基づき以下の更新漏れを局所的に確認する。

- SPEC 本文と実装の矛盾に起因する更新必要性
- 乖離修正に伴う command 定義の更新必要性
- 乖離修正に伴う skill 責務境界の変更必要性

更新漏れを検出した場合はコメントに併記する。この確認はレビュー NG 時の局所的な漏れ検出であり、`/agentdev/inspect-docs` の全体意味レビューの代替ではない。
