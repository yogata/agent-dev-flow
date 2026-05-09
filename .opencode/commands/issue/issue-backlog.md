---
description: クローズ済みissue/PRから残課題を抽出・分類し、Epic+子Issueを作成する
agent: sisyphus
load_skills:
  - issue-guide-phases
  - issue-guide-reports
  - gh-cli-best-practices
---

# バックログ抽出

クローズ済みissue/PRの本文・コメントから残課題を抽出・分類し、ユーザー確認後にEpic + 子Issueを作成する。①バイブス壁打ちフェーズのショートカット経路。

## Input

- ユーザーの自然言語による期間指定（「直近1週間」「今月」「2026-05-02から」等）

## Output

- 抽出・分類レポート（ユーザー確認用）
- Epic Issue（サマリー + テーブル）
- 子Issue群（Epic配下）

## Steps

1. **期間解釈**: ユーザーの自然言語による期間指定を解釈し、GitHub CLIの検索クエリ用日付範囲（`since` / `until`）に変換する。現在日付は2026-05-09。

2. **データ取得**: `gh` CLIを使用して、指定期間内にクローズされたissueとPRを取得する:
   - Issues: `gh issue list --state closed --search "closed:>=YYYY-MM-DD" --limit 100 --json number,title,body,state,closedAt,labels,comments`
   - PRs: `gh pr list --state closed --search "closed:>=YYYY-MM-DD" --limit 100 --json number,title,body,state,closedAt,labels,comments`
   - `gh-cli-best-practices` に従ってコマンドを実行する
   - コメントも取得: `gh issue view {N} --json comments` / `gh pr view {N} --json comments`

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

6. **レポート生成・提示**: 分類結果をMarkdownテーブル形式のレポートとしてユーザーに提示する:
   ```markdown
   ## バックログ抽出レポート（期間: {since} 〜 {until}）

   ### サマリー
   - 対象issue/PR数: {N}
   - 抽出残課題数: {M}
   - カテゴリ別件数: {カテゴリ: 件数}

   ### 抽出結果

   #### {カテゴリ名}（優先度: {高/中/低}）
   | # | 残課題 | 出典 | 元テキスト |
   |---|--------|------|------------|
   | 1 | ... | #XX (comment) | ... |
   ```

7. **ユーザー確認**: レポートを提示後、ユーザーの確認を求める:
   - 削除指示（「3番は不要」等）
   - カテゴリ変更指示
   - 追加の微調整
   - **承認**: 次のステップへ進む
   - **差し戻し**: 調整後に再提示

8. **Epic Issue作成**: 承認された結果をもとに、Epic Issueを作成する:
   - タイトル: `バックログ: {期間} の残課題（{N}件）`
   - 本文: サマリー + カテゴリ別テーブル + 子Issueへのリンク
   - ラベル: `enhancement`, `epic`
   - `gh-cli-best-practices` に従って `--body-file` で作成

9. **子Issue作成**: 各残課題をEpic配下の子Issueとして作成する:
   - 各子Issueの本文に元issue/PRへのリンクを記載
   - Epic Issue番号を本文に記載して関連付け
   - `gh-cli-best-practices` に従って `--body-file` で作成
   - 全子Issue作成後、Epic Issue本文の子Issueリンクを更新

10. **完了報告** → `issue-guide-reports` の完了報告フォーマットに従って出力:
    ```
    ✅ バックログ抽出が完了しました。
      対象期間: {since} 〜 {until}
      Epic Issue: #{N}
      子Issue数: {M}件
    ```

## Guardrails

- ①バイブス壁打ちフェーズのショートカット経路（実装コード禁止）
- データ取得は `gh` CLIのみ使用（GitHub API直接呼び出し不可）
- `gh-cli-best-practices` に従い `--body` 直接指定を禁止し `--body-file` を使用
- 対象はクローズ済みissue/PRのみ（オープン中は対象外）
- 同一期間への再実行時は新規Epicを作成（既存Epicの更新はしない）
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- レポートはMarkdownテーブル形式で構造化して提示する
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照
