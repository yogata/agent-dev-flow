---
description: 壁打ち成果物をREQ/ADRファイルとしてdocs/に保存し、コミット・プッシュする
agent: sisyphus
load_skills:
  - req-file-manager
  - adr-file-manager
  - adr-guidelines
  - issue-guide
  - conventional-commits
---

# 要件保存（壁打ち→docs永続化）

issue-req（Prometheus）で壁打ちした成果物をREQ/ADRファイルとしてdocs/に保存し、コミット・プッシュする。①バイブス壁打ちフェーズで使用（パターンBのみ）。

## Input

- `.sisyphus/drafts/req-draft-{topic-slug}.md`（issue-req で生成されたドラフト）

## Output

- `docs/requirements/REQ-{NNNN}.md`（新規/追記/更新）
- `docs/requirements/README.md`（インデックス更新）
- `docs/README.md`（ドキュメントハブ更新）
- `docs/adr/ADR-{NNNN}.md`（ADR判断がある場合のみ）

## Steps

1. 事前チェック: `draft-meta` セクションの `pattern` を確認 → パターンA（バグ修正・軽微変更）の場合は即座に中止し、エラーメッセージを表示: `パターンAでは issue-save-req は不要です。直接 /issue/issue-create を実行してください。`
2. ドラフト読込: `.sisyphus/drafts/req-draft-*.md` を読み込む → 最新の1件を対象とする。見つからない場合はエラーで中止: `壁打ちドラフトが見つかりません。先に /issue/issue-req を実行してください。`
3. ドラフト検証: `draft-meta` セクションの必須フィールド（pattern, req-operation, topic-slug）が存在することを確認。欠損時はエラーで中止
4. REQ ファイル操作 → `req-file-manager` の判定ロジックと採番ルールに従って実行:
   - **CREATE**: テンプレート適用、最大REQ番号+1で採番、`docs/requirements/REQ-{NNNN}.md` に保存
   - **APPEND**: 既存REQファイルにセクション追記、frontmatter updated 更新
   - **UPDATE**: 既存REQファイルの該当セクション更新、frontmatter updated 更新
5. インデックス更新: `docs/requirements/README.md` のインデックスに新規REQを追加、`docs/README.md` のドキュメントハブにリンク追加（CREATE の場合のみ）
6. ADR ファイル作成（`draft-meta` の `adr-required: true` の場合のみ）→ `adr-file-manager` に従って ADR ファイルを作成
7. docs 変更整合性検証: REQ番号の連続性確認、frontmatter の `id` とファイル名の一致を確認
8. 変更範囲検証: `git diff --name-only` で変更ファイル一覧を取得し、`docs/` 以外の変更が含まれていれば即座に取り消し（`git checkout -- <file>`）、ユーザーに警告
9. コミット・プッシュ → `conventional-commits` に従ってコミットメッセージを生成し、mainブランチに push
10. ドラフト削除: 処理完了後、`.sisyphus/drafts/req-draft-{topic-slug}.md` を削除
11. 完了報告 → `issue-guide` の完了報告フォーマットに従って出力:
    ```
    ✅ 要件をdocs/に保存しました（REQ-{NNNN} を{CREATE/APPEND/UPDATE}）。
      {ADR作成がある場合: ADR-{NNNN} を作成しました。}
      次のステップ: /issue/issue-create
    ```

## Guardrails

- **ファイル編集スコープ**: 以下のパスのみ作成・編集を許可:
  - `docs/requirements/**`（REQファイル）
  - `docs/adr/**`（ADR）
  - `docs/README.md`（ドキュメントハブ）
  - `.sisyphus/drafts/**`（ドラフト削除用）
- **上記以外のファイル作成・編集は禁止**
- パターンAの場合は実行不可（エラーで中止）
- ドラフトファイルが存在しない場合は実行不可（エラーで中止）
- REQ番号は連番・一意であること（空き番号の再利用禁止）→ `req-file-manager` に従う
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
