# learning-promote 再開記録

## 実行識別と停止位置

- 系統: learning-promote（Case #3725、backlog-auto stage 2）
- 親開始日時: 2026-10-15T18:08:07+09:00
- 系統開始日時: 未計測。親開始日時を系統の開始日時として代用しない。
- 最初の成功した Jev 観測: 2026-10-15T09:53:38Z
- 停止日時: 2026-10-15T19:21:28+09:00
- 指示された基準 revision: 38bc58c7（本記録では Git による再取得未実施）
- 状態: blocked。git gate 到達前。完了、ready-to-commit、承認済みのいずれでもない。

## 再開の前提

今回の指示は書込みを learning 配下と docs/knowledge 配下に限定する。一方、workflow の永続化 reference は当該実行で生成した Jev 観測も明示パスで commit することを要求する。
Jev Tool は下記14観測を .agentdev/jev-observations/ へ自動保存した。指示の競合を未解決のまま commit 対象へ加えない。観測の削除、手動書換え、再キー付けも行わない。
orchestrator には、当該14観測を許可範囲へ追加してよいか確認する。commit/push は、それとは別に既定の直列化 gate の go-ahead を必要とする。

## 入力と処理状況

- inbox.md: 全674行を読込。見出しで識別した41エントリ。E1〜E41 は元ファイル内の出現順。
- 全エントリは13項目形式に相当する。日付欠落と E6 の空タグは推測補完しない。元ファイルは不変。
- deferred.md: 4528行。見出しのインデックス取得と重点候補本文の読込を実施。ただしタグ行を含む完全な候補集合、直近20エントリ全件、全面読みフォールバックの実施証跡は未完備。STEP-1 完了という途中報告はこの点を過大に表現していた。再開時に補完する。
- evaluation-report.md は2026-10-13実行分のまま。本実行の評価レポートとして再利用しない。
- 本記録は再開用の補助証拠であり、evaluation-report.md、採用済み成果物、ユーザー承認の代替ではない。

## 分類と評価の暫定整理

| 単位 | inbox エントリ | 問題 |
|---|---|---|
| C1 | E28, E33 | bash パイプ経由の終了コード誤観測 |
| C2 | E20, E25, E34, E37 | 並行負荷時の timeout と由来分離 |
| C3 | E24, E27 | baseline 既存 fail と絶対完了条件 |
| C4 | E21, E26 | vendor 依存未生成 |
| C5 | E2, E15 | 既存債務時の対照救済と残ゲート継続 |
| C6 | E7, E23 | 対応宣言の集約と集合一致 |
| C7 | E5, E11 | traceability 対象行選択 |
| C8 | E6, E35 | Windows と POSIX 形式パスの不一致 |

単独23件: E1, E3, E4, E8, E9, E10, E12, E13, E14, E16, E17, E18, E19, E22, E29, E30, E31, E32, E36, E38, E39, E40, E41。

分類41問と、31評価単位の7軸217問を Jev で評価し最終判断を追記した。発生件数軸は inbox 内の件数から機械導出した。既存 deferred の類似件数を勝手に加算しない。
score の返却値は0始まりの scale index であり、水準表示は index + 1 とする。途中で水準番号と index を取り違えた観測追記があり、同じ observationId に observation_write で訂正した。観測を手動編集していない。再開時に訂正後の値と差異理由、8軸合計を読み戻して照合する。途中説明中の合計値は正としない。

## Jev 観測一覧

すべて .agentdev/jev-observations/ 配下の JSON。

| ID | 判断 | 最終判断の追記 |
|---|---|---|
| 20261015T095338Z-9c80 | 分類 E1〜E10 | 済 |
| 20261015T095425Z-9f0c | 分類 E11〜E21 | 済 |
| 20261015T095512Z-f301 | 分類 E22〜E31 | 済 |
| 20261015T095608Z-6ced | 分類 E32〜E41 | 済 |
| 20261015T095958Z-5d54 | 7軸 C1〜C4 | 済・index 訂正あり |
| 20261015T100237Z-a16d | 7軸 C5〜C8 | 済・index 訂正あり |
| 20261015T100435Z-31e3 | 7軸 E1/E3/E4/E8 | 済・index 訂正あり |
| 20261015T100604Z-1ea4 | 7軸 E9/E10/E12/E13 | 済 |
| 20261015T101003Z-b48b | 7軸 E14/E16/E17/E18 | 済 |
| 20261015T101127Z-6ec0 | 7軸 E19/E22/E29/E30 | 済 |
| 20261015T101239Z-c481 | 7軸 E31/E32/E36/E38 | 済 |
| 20261015T101346Z-e910 | 7軸 E39/E40/E41 | 済 |
| 20261015T101814Z-dcbe | 処分区分31単位 | 未追記・最終未確定 |
| 20261015T102028Z-8467 | 昇華可能性31単位 | 未追記・最終未確定 |

## 既存対策の取得済み証拠

grep による取得結果。行位置は取得時点の補助情報。

- worktree-operations.md L114/L167: textlint vendor 再生成前置。L178: fail 全件の由来分類。
- definition-pr-and-idempotency.md L50: missing-design 対象行判定。L55: findings 完全一致の対照救済。
- sidecar-and-policy.md L49〜53/L130: 宣言集約と集合一致。
- checker-execution-contracts.md L219: Bun.YAML 等に依存する checker は bun 経由で実行。
- qg-4-final-acceptance.md L340: 依存解決前置。L363/L447: 件数突合。L364: stdout/stderr 分離退避。L392以降: fail 由来分類。
- execution-contract.md L87: Root Case 本文更新節が存在。
- windows-checker-msys-path-argument.md: 実在。ただし spawnSync cwd と /tmp の網羅性は追加確認を要する。

## 未確定の処分案と残作業

途中案は採用34エントリ、deferred 3エントリ（E4/E10/E36）、duplicate 4エントリ（C4の2件、E1、E29）、rejected 0件。ただしこれは確定件数ではない。
deferred 内に同根記録があるだけでは、恒久契約・知識・配布物で十分カバーされているという duplicate の条件を満たさない。特に E1 の duplicate 案は再評価を要する。
昇華可能性評価では多くの項目について Jev は false を返した。結果を一律 true へ変更しない。既存対策の更新候補と恒久契約への昇華可能性を区別し、各単位の閉じた判断入力の妥当性と最終判断根拠を再検討する。
異なる根本原因・再発条件・予防策を持つ単位を、同じ workflow を触るという理由だけで1成果物へ束ねない。
単独再実行で非再現になったことだけを根拠に負荷起因を断定しない。変更ファイル集合と NG ファイル集合が非交差という理由だけで gate を warn へ緩和しない。

再開順序:

1. 書込み範囲の競合を解決し、入力・規則・成果物への変更影響を確認する。
2. STEP-1 の候補集合と必要本文読込を補完する。
3. STEP-2 の観測を読み戻し、尺度・合計を照合して evaluation-report.md を生成する。Decision 候補除外根拠も再確認する。
4. STEP-3 はその report を再取得して処分区分と昇華可能性を確定し、残る2観測へ最終判断を追記する。
5. STEP-4 の発動条件判定と独立 stream を備えた adversarial-review を実行する。現時点では未実施。
6. STEP-5 の自律確定/HITL 判断後にのみ、STEP-6 の成果物生成・検証付き deferred 移動・prune を行う。
7. 正確な変更パスと提案メッセージを報告して git gate で停止する。go-ahead 前に commit/push しない。

## 副作用と検証

- inbox.md / deferred.md の移動・クリア・prune: 未実施。
- promoted/ 成果物生成: 未実施。
- docs/knowledge、intake、inspect の編集: 未実施。
- git pull / add / commit / push: 未実施。
- 本実行の状態: WARN / blocked。処理完了0件、読込41件、処分未確定41件。
