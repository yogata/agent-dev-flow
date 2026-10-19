# inspect-docs finding 20261019T143943Z

## サマリ

- 実行: backlog-auto stage 1、2026-10-19。対象版: `abe519fc74c28cffc975dff33a99c05d099063ae`。
- 対象: 現行 REQ 72件、廃止 REQ 19件、Decision 59件、Design 群、guides 13編とその README、root/docs/各文書種別 README、共通配布正本とホスト接続領域。
- 本ファイルの検出事項: README 索引診断1件。severity は low、confidence は high。high severity は0件。
- 同時実行の新規検出事項は計2件。もう1件は `inspect-docs-finding-20261019T143944Z.md`。既存13ファイルは変更していない。

## 検出事項リスト

### IDX-01: DEC-059 の部分置換関係が docs/README のサマリ表に表示されない

- id: IDX-01
- category: README 索引診断（Decision 部分置換関係の表示）
- target: `docs/README.md:177`、`docs/decisions/DEC-059.md:1-8`
- evidence: `docs/README.md:177` の DEC-059 行には DEC-060 による部分置換注記がない。同表の DEC-028/033/034/036/037/041/044/045 行には後継への注記がある。DEC-059 の frontmatter は `supersede_note` に DEC-060 による決定(1)「公開操作」の部分置換を記録する一方、`superseded_by` を宣言していない。生成器 `generate_indexes.ts:1000-1018` は status によらず `superseded_by` が存在する場合だけ注記を生成するため、単純な再生成では表示欠落を解消できない。
- severity: low
- confidence: high
- source_of_truth: 承認済み `docs/decisions/DEC-059.md:8` と `docs/decisions/DEC-060.md:9-11` の部分置換宣言を正とする。README は判断根拠の正本ではなく分類・案内のビューである。生成器は現在の入力契約どおり動作しており、生成処理の故障とは判定しない。
- recommended_route: inspect-promote による分類後、Decision メタデータと索引表示の整合を要件化する。部分置換関係をどの宣言から索引へ渡すかを確認し、正規の生成入力を整えて再生成する。AUTOGEN 表の行だけを直接修正する対応は推奨しない。
- ng_classification: pre-existing
- notes: 今回の診断前から存在する問題。DEC-059 自体の accepted 状態や、版番号・リリース条件等の維持条項を変更する提案ではない。既知 DC01（decisions/README の Decision Map 欠落）と対象表が異なる増分であり、同時再評価を推奨する。

## 参照

- `docs/README.md:146-163,177-178`: 同一表内の部分置換注記の対比。
- `docs/decisions/DEC-059.md:8`: 維持条項と部分置換対象。
- `docs/decisions/DEC-060.md:9-11`: 後継側の supersedes 宣言。
- `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts:1000-1021`: 索引注記の生成条件。

## 推奨アクション

- docs-check 候補: 後継側の部分置換関係・前身側の注記・索引生成入力の不一致を検出できるか、既存 owner で検討する。
- 既知 DC01 と統合する場合も、本件は docs/README の自動生成表とメタデータの接続問題であることを保持する。

## 診断実施記録

- STEP-1: docs/src の管理対象一覧、frontmatter、README、前回 finding を収集。重点差分は `d03c9d6b7..abe519fc7`。差分外は構造検索と文脈確認を実施し、全ファイル全文読了とは扱わない。
- STEP-2: 読取専用の3担当から結果を回収。REQ 体系担当8分52秒、Design 担当5分10秒、Decision/guides/README 担当10分11秒。全担当完了。SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT を確認し、候補の重複・矛盾・既知事項を照合した。
- REQ 整合性: 現行72件と廃止19件の id 一意性・ファイル名一致・二重配置を確認。現行参照と索引の72/19件が一致。差分7 REQ、差分9 Design を全文確認した。
- 6観点: 新規の確定違反なし。REQ-110 の33行は正規の行数閾値51行未満。同型の case-open/case-ready 検査要件は段階別適用であり、文面類似の回数を独立シグナル数として数えない。採用・未決・試作の義務も経路別適用宣言と sidecar の束ね管理があり、重複違反とはしない。
- 状態乖離: Decision は accepted 50、superseded 9、proposed 0。draft Design は2件。v4-v5-crosswalk は implementation 宣言（REQ-111-013）を持つが、本文78-81行と既知 RQ08 の移行確定条件を無視して、同一 REQ の別行の実装完了から昇格漏れと断定しない。Case 状態の外部照合は未実施であり、新規状態乖離の確定判定は行わない。
- 配布物: 公開コマンド18件と root README の集合が一致。既に取得した正本・投影の比較では commands の差分なし、skills は junction 接続。272 Markdown の簡易走査で BOM・CRLF/LF 混在・奇数フェンスのシグナルなし。これは正規チェッカー全件合格の代用ではない。内部 ID の4桁パターン走査も候補収集に限定した。README 内の旧 case-* は廃止案内の文脈で除外した。
- ホスト接続: src/opencode と src/senpi の接続領域を共通正本の独立コピーとは扱わない。README の配置契約と共通 Tool/guard への import を確認。Senpi 実機導入・実行・全接続テストは未実施。
- 未処理成果物: intake inbox 7件、learning inbox 20エントリ。intake/learning/inspect の promoted、req-units、drafts は空。stage 2 以降の入力として報告し、存在だけを異常扱いせず、処理しない。
- 既知事項: 最新 finding の DC01、GR12、DC02、GR13、RQ16、RQ17、DS36、DS37 は継続として照合し、同一内容を新規生成しない。過去13ファイル全件の意味的な重複照合までは完了していない。

## 実行上の逸脱と検証限界

- 利用者指定に従い、git pull/add/commit/push は実施せず、親の直列化キューへ引き継ぐ。
- STEP-3 の一部の候補収集を STEP-2 の完了待ち中に先行実施した。最終判定は3担当の回収後に行ったが、厳密な工程順序には従えていない。
- ファイル探索・文字コード等の読取専用走査に Bash の非 git コマンドを使用した。利用者指定の Bash 用途制限からの逸脱であり、正規の docs-check は実行していない。
- 配布物の見出し・frontmatter 候補の文脈確認は代表例中心であり、全パターンの網羅的な合格は主張しない。

## 対象外（Out of Scope）

- docs/src/README の修正、既存 finding の変更、採否判断、Issue/PR 操作、Git 永続化。
- 指定されたプール外ファイル、Jev 観測、end-to-end 状態の変更。
- 全テスト、型検査、正規の機械検査一式、Senpi 実機検証。今回は診断 Markdown の新規生成のみ。

## 処理記録（2026-10-19 inspect-promote、backlog-auto stage 2 inspect 系統、--auto なし）

- 分類確定: **defer**（自律確定）: docs/README.md の DEC-059 行に部分置換注記がない事実は現物確認済み（DEC-059 frontmatter は supersede_note あり・superseded_by なし、DEC-060 側 supersedes 宣言あり、生成器は superseded_by のみ参照）だが、部分置換時に前提側へ superseded_by を置くことを必須とする規範は明文化されておらず、修正経路（frontmatter 追加 vs 生成器が supersede_note／後継側 supersedes を参照する拡張）と正とする情報源が未確定。既知 defer DC01（decisions/README.md Decision Map）・DC-07・DC-10 と同一テーマ族（掲載基準・記録方式が慣行ベースで契約上明文化されず、欠落＝違反と確定できない）であり、処分一貫性から defer とする。Jev 先行評価（観測 20261019T150102Z-f15b、defer 0.94）を受けて暫定 promote から defer へ変更（LLM 最終判断。DC01 族前例との処分一貫性を評価器指摘の規範未文書化論拠と併せて採用）。DC01 側（20261017T102200Z）へ同時再評価の相互注記を追記済み
- 再評価条件: Decision Map・docs/README Decision 索引の掲載基準が明文化される時（DC01 族の同時再評価時）、または部分置換メタデータ運用（superseded_by の要否）の判断が確定する時。docs-check 候補（後継側部分置換関係・前身側注記・索引生成入力の不一致検出）は DC01 由来候補と併せて backlog-review 経由で検討
