# GitHub からの残課題抽出ロジック

GitHub から残課題を抽出する際のロジック（期間解釈、データ取得、構造検出、LLM全文解析、intake item生成）を定義する。

## 期間解釈

ユーザーの自然言語による期間指定を解釈し、GitHub CLI の検索クエリ用日付範囲（`since`/ `until`）に変換する。
現在日付は実行時のシステム日付を使用する。

## データ取得

`gh` CLI を使用して、指定期間内にクローズされた Issue と PR を取得する:
- Issues: `gh issue list --state closed --search "closed:>=YYYY-MM-DD" --limit 100 --json number,title,body,state,closedAt,labels,comments`
- PRs: `gh pr list --state closed --search "closed:>=YYYY-MM-DD" --limit 100 --json number,title,body,state,closedAt,labels,comments`
- `agentdev-gh-cli` に従ってコマンドを実行する（読み取り操作は READ 操作手順に従う）
- コメントも取得: `gh issue view {N} --json comments`/ `gh pr view {N} --json comments`

## 構造的検出

取得した Issue/PR の本文およびコメントから、未チェックのチェックボックス（`- [ ]` または `* [ ]`）を構造的に抽出する。
チェック済み（`- [x]`）は除外。

## LLM 全文解析

構造的検出で捕捉できなかった残課題を LLM による全文解析で抽出する:
- 対象キーワード: 「対象外」「先送り」「別途対応」「後で」「TODO」「FIXME」「今後の課題」「残課題」「要検討」等
- 暗黙的な残課題（否定表現等）も検出
- 各抽出結果に元テキストのコンテキスト（前後文）を付与

## intake item 生成

抽出した各候補を intake item 形式に整理する:
- 1 候補につき 1 ファイル
- ファイル名: `YYYY-MM-DD-{topic-slug}.md`
- 観測元（Issue/PR 番号）は「根拠」セクションに記載
- 元テキストのコンテキストも「根拠」セクションに含める

