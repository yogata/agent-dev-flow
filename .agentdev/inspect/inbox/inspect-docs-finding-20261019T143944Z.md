# inspect-docs finding 20261019T143944Z

## サマリ

- 対象版: `abe519fc74c28cffc975dff33a99c05d099063ae`。backlog-auto stage 1 の診断。
- 本ファイルの検出事項: Design 索引の状態可視性1件。severity は low、confidence は medium。high severity は0件。
- 実行全体の対象・被覆・既知事項・未処理成果物・逸脱は、同時生成の `inspect-docs-finding-20261019T143943Z.md`「診断実施記録」「実行上の逸脱と検証限界」を参照。

## 検出事項リスト

### IDX-02: references 配下の Design 状態が索引の状態集約から読み取れない

- id: IDX-02
- category: README 索引診断（Design 状態の可視性）
- target: `docs/designs/README.md`「Design status 追跡情報源」「新規 Design 追加時の index 登録手順」「foundations/」表、`docs/designs/foundations/references/v4-v5-crosswalk.md:3`
- evidence: Design README は「全 Design の status を追跡対象」とし、status を視認する単一の追跡情報源を同 README と定める。一方、references 配下は独立行登録せず親行の備考で言及する規則である。v4-v5-crosswalk の frontmatter は draft だが、親 v5-adopted-conventions の備考は子文書の所有内容とパスだけを記し、子文書自身の status を表示しない。親の draft 列が子の状態まで表すのか、子の状態を独立追跡しないのかが明示されていない。
- severity: low
- confidence: medium
- source_of_truth: `docs/designs/README.md` の「全 Design の status を追跡」と「references は親行の備考で言及」という両規則、および子文書自身の frontmatter を正とする。前回 finding の「draft status と本文一致」判断を否定せず、状態の表示契約だけを対象とする。
- recommended_route: inspect-promote による分類後、references 配下の状態を親の備考で明示するか、親子状態の扱いを索引契約で明文化する改善候補として扱う。
- ng_classification: pre-existing
- notes: 子文書の draft 継続が不適切、昇格漏れ、Case 完了済みとは判定していない。親子とも現状 draft であるため、実害ではなく将来の状態分岐時の可視性問題である。「親の status 列が子も含む」とする運用なら問題が成立しない可能性があり、confidence を medium とした。DS37 や RQ08 の移行確定論点とは分離する。

## 参照

- `docs/designs/README.md:10-18`: status の単一追跡源と全 Design の集約宣言。
- `docs/designs/README.md`「新規 Design 追加時の index 登録手順」末尾: references 配下の独立行登録を行わない規則。
- `docs/designs/README.md` foundations/v5-adopted-conventions 行: 親の draft 列と子文書への備考参照。
- `docs/designs/foundations/references/v4-v5-crosswalk.md:1-9,74-81`: 子の draft 状態と別論点である移行確定条件。
- `.agentdev/inspect/inbox/inspect-docs-finding-20261017T102200Z.md:151`: 前回の draft 2件に関する本文整合判断。

## 推奨アクション

- 親子状態の表示契約を確認してから対応要否を判断する。現時点で status の変更を要求しない。
- docs-check 候補: 親への参照だけでなく子の status も索引で追跡すべきか、正規の索引契約を先に定める。

## 対象外（Out of Scope）

- draft の経過日数に基づく放置検出、Case 完了と状態乖離の認定、Design の accepted への変更。
- 既存 finding の変更、正規成果物の修正、採否判断、Git 操作。

## 処理記録（2026-10-19 inspect-promote、backlog-auto stage 2 inspect 系統、--auto なし）

- 分類確定: **defer**（自律確定）: 「全 Design の status を追跡」宣言と references 親行備考規則の両規則の実在、v4-v5-crosswalk の status: draft を現物確認。ただし「親の status 列が子も含む」運用なら問題不成立の可能性が残り（診断の自己申告不確実性どおり）、表示契約の正とする解釈が未確定のため採否を保留。既知 defer DS-13（20260927、Design 索引の references/ 規則と独立行の不整合）と同一索引規則領域のため、DS-13 側（20260927T135638Z）へ同時再評価の相互注記を追記済み。Jev 先行評価（観測 20261019T150102Z-f15b、defer 1.0）と LLM 最終判断一致
- 再評価条件: Design 索引の親子状態表示契約（親 status 列の包含範囲）が判断される時（DS-13〔20260927〕の再評価条件「Design 索引規則の経過措置判断の機会」と同時）、または references 配下 Design の status が accepted へ遷移して可視性の実害が顕在化する時

- 2026-10-27 実施（backlog-auto stage 2 inspect 系統、--auto なし）再評価: IDX-02 は defer 継続（自律確定）: 再評価条件（親子状態表示契約の判断〔DS-13 同時〕、references 配下 Design の status 遷移による実害顕在化）はいずれも未発火。stage 1 診断（20261026T190542Z）の既知項目照合で対象変化の報告なし
