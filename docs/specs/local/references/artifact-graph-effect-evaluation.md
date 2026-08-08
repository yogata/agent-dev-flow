# Artifact Graph 効果検証判断資料

> 本資料は特定時点の検証結果を記録する非規範の判断資料であり、Artifact Graph の正規仕様は `../artifact-graph.md` である。

## 検証対象

本資料は、Artifact Graph の初期導入について、代表質問に対する探索結果と従来手段の探索結果を比較し、次段階の判断根拠を示す。
検証対象は Issue #1944、Artifact Graph SPEC の効果検証、および2026年8月6日時点の `origin/main` である。
生成物は `.agentdev/graph/` に再生成し、Git 管理対象には含めていない。

## 比較方法

代表質問は、正規仕様の所在、正規所有者、6つの Project Extension の直接関係、2ノード間の経路、および根拠箇所の取得を含む10件とした。
従来手段では、README 索引で探索領域を決める操作を1回、`rg` の実行を1回として数えた。
複数ファイルの関係を結ぶ質問では、追加の `rg` 実行を1回として数えた。
Artifact Graph では、`query_graph.ts` の実行を1回として数えた。
問い合わせ結果に含まれる根拠情報の確認は、同じ問い合わせ結果の読取りであるため追加操作に数えていない。
誤候補は、質問が求める明示関係に該当しない返却ノードまたは返却関係とした。
重大な見逃しは、README 索引と `rg` で確認できる明示関係がグラフ結果に存在しない状態とした。

## 生成結果

Wave 2 完了時の引き継ぎ値は721ノード、1190関係であった。
現行入力からの初回再生成は730ノード、1193関係、22件の警告であった。
ノード数と関係数の増加は、Wave 2 後に `origin/main` へ追加された入力を含むためである。
初回比較では、配列形式の拡張定義にある `rules.skill` と `context.paths` が抽出されず、代表質問10件中8件で重大な見逃しが発生した。
原因は、軽量 YAML 解析処理が `- id: ...` で始まる配列要素の親文脈を保持せず、後続の `skill` を `rules.skill` として扱わなかったことだった。
Issue のテスト戦略にある `fix-and-reverify` に従い、配列内の対応付けから親文脈を保持する修正と回帰テストを追加した。
修正後の再生成は730ノード、1253関係、22件の警告となり、欠落していた60件の関係を回収した。
本判断資料を正規入力へ追加した最終生成値は732ノード、1256関係、22件の警告だった。
`check_graph.ts` は `valid: true` を返した。

## 代表質問の比較

| No. | 代表質問 | README 索引と `rg` による基準結果 | Artifact Graph の結果 | 従来操作数 | Graph操作数 | 判定 |
|---|---|---|---|---:|---:|---|
| 1 | Artifact Graph の正規仕様はどこか | README 索引から `docs/specs/local/artifact-graph.md` へ到達 | `provenance specification:docs/specs/local/artifact-graph.md` が同ファイル2行目を返却 | 2 | 1 | 一致 |
| 2 | Artifact Graph SPEC の直接関係と正規所有者は何か | SPEC の `canonical_owner` と SPEC 索引のリンクから `repo-agentdev-artifact-graph` および関連ファイルを確認 | `neighbors specification:docs/specs/local/artifact-graph.md --depth 1` が正規所有スキル、SPEC 索引、根拠ファイル、deep-review 拡張定義を返却 | 2 | 1 | 一致 |
| 3 | req-define 拡張定義の直接関係候補は何か | 拡張定義内の7 SPEC、対象コマンド、定義ファイル、Artifact Graph スキルを確認 | `neighbors extension:/agentdev/req-define --depth 1` が同じ直接関係候補を返却 | 2 | 1 | 一致 |
| 4 | spec-save 拡張定義の直接関係候補は何か | 拡張定義内の2 SPEC、対象コマンド、定義ファイル、Artifact Graph スキルを確認 | `neighbors extension:/agentdev/spec-save --depth 1` が同じ直接関係候補を返却 | 2 | 1 | 一致 |
| 5 | case-open 拡張定義の直接関係候補は何か | 拡張定義内の3 SPEC、対象コマンド、定義ファイル、Artifact Graph スキルを確認 | `neighbors extension:/agentdev/case-open --depth 1` が同じ直接関係候補を返却 | 2 | 1 | 一致 |
| 6 | case-run 拡張定義の直接関係候補は何か | 拡張定義内の2 SPEC、対象コマンド、定義ファイル、Artifact Graph スキルを確認 | `neighbors extension:/agentdev/case-run --depth 1` が同じ直接関係候補を返却 | 2 | 1 | 一致 |
| 7 | case-close 拡張定義の直接関係候補は何か | 拡張定義内の4 SPEC、対象コマンド、定義ファイル、2スキルを確認 | `neighbors extension:/agentdev/case-close --depth 1` が同じ直接関係候補を返却 | 2 | 1 | 一致 |
| 8 | deep-review 拡張定義の直接関係候補は何か | 拡張定義内のArtifact Graph SPEC、対象スキル、定義ファイル、Artifact Graph スキルを確認 | `neighbors extension:agentdev-deep-review --depth 1` が同じ直接関係候補を返却 | 2 | 1 | 一致 |
| 9 | case-run コマンドから Artifact Graph スキルへ到達する経路は何か | README 索引、コマンドの拡張定義読込記述、拡張定義の `rules.skill` を順に確認 | `path command:case-run skill:repo-agentdev-artifact-graph --max-depth 4` がコマンド、拡張定義、スキルの3ノード経路を返却 | 3 | 1 | 一致 |
| 10 | case-run 拡張定義の委譲関係を示す根拠箇所はどこか | `rg -n -C 2` が `.agentdev/extensions/commands/case-run.yaml` 19行目を返却 | 質問6の委譲関係に対する `provenance` が同ファイル19行目と `field:rules.skill` を返却 | 2 | 2 | 一致 |

## 定量結果

修正後は、10件すべてで基準結果に含まれる明示関係へ到達し、重大な見逃しは0件だった。
根拠ファイル到達率は10件中10件の100%だった。
返却候補57件のうち誤候補は0件で、誤候補率は0%だった。
探索操作数は10件中9件で減少し、合計では21操作から11操作へ減少した。
質問10は委譲関係IDの取得と根拠問い合わせの2操作を要するため、従来手段と同数だった。

## 生成失敗時の継続性

`prepare_graph.ts --root README.md` で生成不能を発生させると、結果は `status: unavailable`、`freshness: missing`、終了コード0となった。
この結果は、生成失敗だけを理由に標準ワークフローを停止しない契約と一致する。
自動テストは、既存索引が古く再生成に失敗した場合の `limited`、索引がなく生成に失敗した場合の `unavailable`、および CLI の終了コード0を検証している。

## 有効性

Artifact Graph は、明示関係の候補と根拠箇所を1回の問い合わせで併せて返すため、今回の代表質問では探索操作数を減らした。
特に複数ファイルをまたぐ経路探索では、コマンド、拡張定義、スキルの接続を1回で取得できた。
一方、初回比較で YAML 解析処理の抽出漏れを検出できたことから、効果検証は生成件数の確認だけでは見つからない欠落の検出にも機能した。

## 限界

評価対象は明示関係を持つ初期ワークフロー統合に偏っており、自由文にしか現れない関係の再現率は評価していない。
問い合わせ結果はノードIDと関係IDを中心に返すため、関係種別を一覧で読む用途では追加の解釈が必要になる。
22件の未解決参照の警告には、ディレクトリリンク、説明用リンク、および現行抽出範囲外の参照が含まれる。
したがって、警告件数だけから文書不整合を確定することはできない。
今回の操作数は手作業の回数であり、経過時間や認知負荷を直接測定した値ではない。

## 第2段階の判断

第2段階へ進むことを推奨する。
代表質問は、重大な見逃し0件、根拠ファイル到達率100%、誤候補率0%、10件中9件の操作数削減という完了条件を満たした。
ただし、Artifact Graph は引き続き候補取得に限定し、変更対象や要件充足の確定根拠には使用しない。
Artifact Graph 固有検査をマージゲートへ昇格する判断は、未解決参照の警告に対する分類精度を評価するまで保留する。

## 後続候補

次の候補は本Issueでは実装していない。

- 問い合わせ結果へ `type`、`source`、`target` を含め、人が関係IDを追加解釈する操作を減らす。
- 未解決参照の警告を実在しないファイル、ディレクトリリンク、説明用記法に分類する。
- 代表質問と期待関係を回帰検証へ組み込み、実リポジトリ入力に対する抽出漏れを検出する。
- 拡張定義の解析処理が対応する YAML 構造を明示し、対応外構造を診断として報告する。
