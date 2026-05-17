---
description: クローズ済みissue/PRから残課題を抽出・分類し、解消チェック後にdraftとして保存する
agent: sisyphus
load_skills:
  - issue-lifecycle
  - issue-reporting
  - gh-cli-best-practices
---

# バックログ抽出

クローズ済みissue/PRの本文・コメントから残課題を抽出・分類し、解消チェック後にユーザー確認を行い、承認された内容をdraftとして保存する。①バイブス壁打ちフェーズのショートカット経路。

Issue作成は `issue-backlog-create` コマンドで行う。

## Input

- ユーザーの自然言語による期間指定（「直近1週間」「今月」「2026-05-02から」等）

## Output

- 抽出・分類・解消チェックレポート（ユーザー確認用）
- 承認済みバックログdraft（`.sisyphus/drafts/backlog-draft-{period-slug}.md`）

## Steps

1. **期間解釈**: ユーザーの自然言語による期間指定を解釈し、GitHub CLIの検索クエリ用日付範囲（`since` / `until`）に変換する。現在日付は実行時のシステム日付を使用する。`period-slug` を `{since}-{until}` 形式で生成する（例: `2026-05-01-2026-05-07`）。

2. **データ取得**: `gh` CLIを使用して、指定期間内にクローズされたissueとPRを取得する:
   - Issues: `gh issue list --state closed --search "closed:>=YYYY-MM-DD" --limit 100 --json number,title,body,state,closedAt,labels,comments`
   - PRs: `gh pr list --state closed --search "closed:>=YYYY-MM-DD" --limit 100 --json number,title,body,state,closedAt,labels,comments`
   - `gh-cli-best-practices` に従ってコマンドを実行する
   - コメントも取得: `gh issue view {N} --json comments` / `gh pr view {N} --json comments`

2a. **既抽出スキップ**: 取得した各issue/PRのコメント（本文・コメント欄の両方）にマーカーキーワード `backlog-extracted` が含まれているか確認する:
   - 含まれている → 当該issue/PRを抽出対象からスキップする（レポートにも表示しない）
   - 含まれていない → 抽出対象として次Stepへ進む
   - マーカーキーワードは1箇所で定義: `backlog-extracted`

3. **Phase1 — 構造的検出**: 取得したissue/PRの本文およびコメントから、未チェックのチェックボックス（`- [ ]` または `* [ ]`）を構造的に抽出する:
   - 各未チェックチェックボックスのテキスト内容
   - 出現元（issue/PR番号、本文/コメントの区別）
   - チェック済み（`- [x]`）は除外

4. **Phase2 — LLM全文解析**: Phase1で検出できなかった残課題を、LLMによる全文解析で抽出する:
   - 対象キーワード: 「対象外」「先送り」「別途対応」「後で」「TODO」「FIXME」「今後の課題」「残課題」「要検討」等
   - 暗黙的な残課題（「〇〇は対応しなかった」「うまくいかなかった」等の否定表現）も検出
   - 各抽出結果に元テキストのコンテキスト（前後文）を付与

5. **ハイブリッド分類**: Phase1 + Phase2の抽出結果を以下のカテゴリで分類する:
   - **固定カテゴリ（4つ）**:
     - `未検証テスト戦略（優先度: 高）`: テスト未検証・テスト戦略の不備
     - `明示的先送り（優先度: 中）`: 明確に「後で」「別Issue」等と先送りされた項目
     - `確認待ち（優先度: 中）`: レビュー確認中・回答待ちの項目
     - `ステータス不整合（優先度: 低）`: クローズ済みだが未完了タスクが残っている
   - **LLM追加カテゴリ**: 上記に当てはまらない場合、LLMが適切なカテゴリを新規生成して分類

6. **解消チェック**: 各抽出候補について、既に別のissue/PRで解消されているかを確認する:
   - 検索対象: 元issue/PRの `closed_at` 以降かつ同一期間内にクローズされたissue/PR
   - 検索方法: `gh issue list --state closed --search "closed:>={source_closed_at}"` および `gh pr list --state closed --search "closed:>={source_closed_at}"` で候補を取得（期間内に制限）
   - マッチング範囲: 候補の **title + body + comments** のみ（commitsは対象外）
   - 3値判定:
     - `解消済み`: 同一または類似の課題が後のissue/PRで明示的に解消されている。該当issue/PR番号を根拠として記録
     - `未解消`: 解消を示す証拠が見つからない
     - `不明`: 関連する記述があるが、解消されたか不明確
   - `解消済み` の項目 → バックログ作成対象から除外し、レポートに「除外: 修正済み」と根拠issue/PR番号と共に表示
   - `不明` の項目 → バックログ作成対象に含め、`未確認` として記録

7. **レポート生成・提示**: 分類結果と解消チェック結果をMarkdownテーブル形式のレポートとしてユーザーに提示する:
   ```markdown
   ## バックログ抽出レポート（期間: {since} 〜 {until}）

   ### サマリー
   - 対象issue/PR数: {N}
   - 抽出残課題数: {M}
   - 解消済み（除外）: {X}件
   - バックログ作成対象: {Y}件
   - カテゴリ別件数: {カテゴリ: 件数}

   ### 解消済み（除外）

   | # | 残課題 | 元issue/PR | 解消根拠 |
   |---|--------|------------|----------|
   | 1 | ... | #XX | #YY（title） |

   ### 抽出結果（バックログ作成対象）

   #### {カテゴリ名}（優先度: {高/中/低}）
   | # | 残課題 | 元issue/PR | 元テキスト | 解消状態 |
   |---|--------|------------|------------|----------|
   | 1 | ... | #XX (comment) | ... | 未解消 |
   | 2 | ... | #XX | ... | 未確認 |
   ```

8. **ドラフト保存**: レポート提示後、抽出内容を `status: draft` でドラフトファイルに保存する:
   - 保存先: `.sisyphus/drafts/backlog-draft-{period-slug}.md`
   - frontmatter:
     ```yaml
     ---
     period: "{since} 〜 {until}"
     period-slug: "{period-slug}"
     status: draft
     created: "{YYYY-MM-DD}"
     sources:
       - type: issue
         number: {N}
         closed_at: "{YYYY-MM-DD}"
       - type: pr
         number: {N}
         closed_at: "{YYYY-MM-DD}"
     ---
     ```
   - frontmatter以降の本文: 抽出項目をカテゴリ別セクションに構造化して記載
     - 各項目: タイトル、説明、カテゴリ、優先度、元テキスト、元issue/PR、解消チェック結果
     - 解消済み項目は「除外」セクションに記録（根拠issue/PR付き）

9. **ユーザー確認・承認**: レポートとドラフト保存完了を報告し、ユーザーの確認を求める:
   - 削除指示（「3番は不要」等）
   - カテゴリ変更指示
   - 追加の微調整
   - **承認**: ドラフトの `status` を `approved` に更新する
   - **差し戻し**: 調整内容をドラフトに反映してレポートを再提示（`status` は `draft` のまま維持）

10. **完了報告** → `issue-reporting` の完了報告フォーマットに従って出力:
    ```
    ✅ バックログ抽出が完了しました。
      対象期間: {since} 〜 {until}
      ドラフト保存先: .sisyphus/drafts/backlog-draft-{period-slug}.md
      ステータス: approved
      バックログ作成対象: {Y}件（解消済み除外: {X}件）
      次のステップ: `/issue/issue-backlog-create` でIssueを作成してください
    ```

## Guardrails

- ①バイブス壁打ちフェーズのショートカット経路（実装コード禁止）
- データ取得は `gh` CLIのみ使用（GitHub API直接呼び出し不可）
- `gh-cli-best-practices` に従い `--body` 直接指定を禁止し `--body-file` を使用
- 対象はクローズ済みissue/PRのみ（オープン中は対象外）
- 同一期間への再実行時は、既に `backlog-extracted` コメントが付与されたissue/PRをスキップする（重複抽出防止）
- **Issue/PRの作成・コメント投稿は行わない**（`issue-backlog-create` が担当）
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- レポートはMarkdownテーブル形式で構造化して提示する
- Pattern分岐の判定基準と固有ルールは `issue-lifecycle` → Pattern Registry を参照
- 解消チェックのマッチング範囲は title + body + comments のみ（commitsは対象外）
