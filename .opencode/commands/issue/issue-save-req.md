---
description: 壁打ち成果物をREQ/ADRファイルとしてdocs/に保存し、コミット・プッシュする
agent: sisyphus
load_skills:
  - req-file-manager
  - adr-file-manager
  - adr-guidelines
  - issue-guide-phases
  - issue-guide-reports
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
4. REQ ファイル操作 → `req-file-manager` の判定ロジックと採番ルールに従って実行。ドラフトに複数の `req-operation` + `target-req` ペアが含まれる場合は、各ペアを順次処理する（バルクUPDATE対応）:
    - **CREATE**: テンプレート適用（目的/要件/適用範囲構造）、最大REQ番号+1で採番、`docs/requirements/REQ-{NNNN}.md` に保存
      **テンプレート準拠検証**: 生成されたREQファイルに `doc_requirement.md` の【必須】セクション（目的、要件、適用範囲）が全て含まれていることを確認すること。frontmatterの必須フィールド（id, title, created）の存在も確認すること。
    - **APPEND**: 既存REQファイルの要件テーブルに行を追加、frontmatter updated 更新
    - **UPDATE**: 既存REQファイルの該当セクション（目的/要件/適用範囲）を更新、frontmatter updated 更新
    - **バルク処理**: 複数REQファイルのUPDATEが指示されている場合、各REQファイルに対して上記UPDATE手順を順次実行する。全UPDATEの整合性（REQ番号の重複なし、frontmatterの一貫性）を最後に一括で検証する
5. インデックス・ハブ更新:
   - **docs/requirements/README.md**: CREATE時は新規行を追加、APPEND/UPDATE時は該当REQのtitle列をfrontmatter値に合わせて更新
   - **docs/README.md**: CREATE時は新規リンクをREQ番号順の正しい位置に挿入、APPEND/UPDATE時は該当REQのリンクテキスト（タイトル変更時のみ）を更新
   - 両ファイルの更新後、`req-file-manager` の整合性チェック自動修正手順に従って検証
6. ADR ファイル作成（`draft-meta` の `adr-required: true` の場合のみ）→ `adr-file-manager` に従って ADR ファイルを作成。作成後、`docs/README.md` にADRセクションが存在しない場合は追加し、ADRエントリを記載
7. docs 変更整合性検証: REQ番号の連続性確認、frontmatter の `id` とファイル名の一致を確認
8. 変更範囲検証: `git diff --name-only` で変更ファイル一覧を取得し、`docs/` 以外の変更が含まれていればエラー内容をユーザーに報告して指示を待つ（変更の自動破棄は行わない）
9. コミット・プッシュ → `conventional-commits` に従ってコミットメッセージを生成し、mainブランチに push
10. ドラフトの `## draft-meta` セクションの `status` を `saved` に更新する
11. 完了報告 → `issue-guide-reports` の完了報告フォーマットに従って出力:
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
  - `.sisyphus/drafts/**`（ドラフトstatus更新用）
- **上記以外のファイル作成・編集は禁止**
- パターンAの場合は実行不可（エラーで中止）
- ドラフトファイルが存在しない場合は実行不可（エラーで中止）
- REQ番号は連番・一意であること（空き番号の再利用禁止）→ `req-file-manager` に従う
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照
- 要件doc構造は `doc_requirement.md` テンプレートに厳密に従うこと。【必須】セクションの欠落は禁止
