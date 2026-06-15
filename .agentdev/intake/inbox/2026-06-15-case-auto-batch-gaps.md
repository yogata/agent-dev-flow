# case-auto 一括処理の2つのギャップ

## 観測

5RU を req-define で処理し、case-auto で OU-3 を実行した際、2つの構造的ギャップが判明した。

### ギャップ1: req-define が maintenance OU の draft を作成しない

req-define Step 9 は「バグ修正・保守: ドラフト保存不要。セッション内で完結」と規定している。そのため、maintenance work_type の OU（OU-1, OU-4-A/B/C）は draft ファイルが作成されず、要件内容がセッション内にしか存在しない。

結果として case-auto はこれらの OU を入力として検出できず、処理対象に含められない。case-auto Step 1 の入力解決優先順位の第3段「セッション内要件doc」に該当するが、draft-meta がないため work_type 読取（Step 2）が機能しない。

### ギャップ2: case-auto が Standard flow 完了後に次 OU へ進まない

case-auto の Standard flow（単一 Issue）は case-close 完了で全体完了とする。REQ-0114-053「1 OU を close 完了後に次の OU へ進む」は Step 4-2（Epic flow の case-close ループ）内に記述されており、Standard flow には次 OU への自動進行がない。

結果として、複数 OU を含む draft を case-auto で処理しても、最初の OU が Standard flow だとそこで停止し、残り OU が未処理のまま再起動を要求される。

## 影響

- case-auto の「最大自走」が機能しない。5RU から7OU を生成しても、1 OU 処理ごとに手動再起動が必要。
- maintenance OU は draft がないため、セッション終了で要件内容が消失するリスクがある。
- req-define → case-auto のパイプラインが work_type によって断絶する。

## レビューで決めること

1. req-define が全 work_type で draft を作成するようにするか（Step 9 の「ドラフト保存不要」を撤廃）
2. case-auto が Standard flow の case-close 完了後に operation_units から次 OU を取得して自動進行するか
3. これらを1 RU で扱うか、2 RU（draft改善 + case-auto改善）に分離するか
4. REQ-0102（要件定義・保存）と REQ-0114（case-auto）のどちらに反映するか、または新規REQか

## 根拠

- req-define Step 9: 「バグ修正・軽微変更/リファクタリング・保守/ドキュメント・雑務: ドラフト保存不要。セッション内で完結」
- case-auto Step 4-2: REQ-0114-053「case-auto は 1 OU を close まで完了した後に次の OU へ進むこと」は Epic flow 内にのみ記述
- .agentdev/README.md: drafts/req-draft-*.md の Producer は req-define、Consumer は req-save
- セッション実績: 5RU → 7OU生成 → OU-3のみStandard flowで処理 → 残り6 OU が未処理で停止
