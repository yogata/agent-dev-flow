# case-auto 一括処理の2つのギャップ改善

## 観測内容

5RU を req-define で処理し case-auto で実行した際、2つの構造的ギャップが実測された。

### ギャップ1: req-define が maintenance OU の draft を作成しない

req-define Step 9 は work_type が bugfix / maintenance / docs_chore の場合「ドラフト保存不要。セッション内で完結」とする。結果として maintenance OU の要件内容がファイルとして永続化されず、case-auto や case-open が入力として検出できない。

### ギャップ2: case-auto が Standard flow 完了後に次 OU へ自動進行しない

case-auto の Standard flow は case-close 完了で全体完了とする。REQ-0114-053「1 OU を close 完了後に次の OU へ進む」は Epic flow 内（Step 4-2）にのみ記述され、Standard flow には次 OU への自動進行ループがない。

## 影響

- case-auto の「最大自走」が機能しない。7OU 生成しても1 OU処理ごとに手動再起動が必要。
- maintenance OU は draft がないためセッション終了で要件内容が消失するリスクがある。
- req-define → case-auto パイプラインが work_type によって断絶する。

## 課題

- req-define Step 9 の「ドラフト保存不要」を全 work_type で draft 保存するよう変更する必要がある。
- case-auto に Standard flow 完了後の次 OU 自動進行ループを追加する必要がある。
- REQ-0102（要件定義・保存）と REQ-0114（case-auto）の両方への反映が必要。

## 既存要件との関連

- REQ-0102: 要件定義・保存（draft 保存対象の拡張）
- REQ-0114: case-auto 最大自走モード（Standard flow での逐次OU処理）
- REQ-0104: Workflow / Command Protocol（work_type 分岐ルールの整理）

## 改善の方向性

### 改善1: 全 work_type で draft 保存

req-define は全 work_type で `.agentdev/drafts/req-draft-{topic-slug}.md` を保存する。work_type は draft-meta に記録し、後続工程の分岐制御に使用する。ファイル保存の有無ではなく、どのコマンドが消費するかを work_type で決定する。

### 改善2: case-auto Standard flow での次 OU 自動進行

case-auto は Standard flow の case-close 完了後、operation_units から次の OU を取得し（recommended_order, depends_on に基づく）、自動的に次 OU の処理を開始する。全 OU の処理が完了した場合のみ全体完了とする。
