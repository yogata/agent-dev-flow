# inspect-promote promoted 2026-10-27（docs 機械的是正候補 5件）

- 採用実行: backlog-auto stage 2 inspect 系統（inspect-promote、--auto なし）。ソース: `.agentdev/inspect/inbox/inspect-docs-finding-20261026T190542Z.md`（対象版 `a7a0cdb8415b8ea53e1bd7f45e1cf9d1a44494cb` 診断）
- 分類: 全件自律確定（HITL 対象なし・破壊的変更なし）。根拠: いずれも明確な不整合で正規情報源特定済み・修正対象行が一意であり、STEP-3 分類基準「明確な不整合 → promote」の直接導出である。IDX-04 は `check_content_corruption` exit 1（docs-check gate fail）の現行違反、IDX-03 は REQ-108-014..024 の正本行が表として解釈されない構造破損であり、RU 化の緊急性が高い。本成果物は採用記録であり docs 側の直接修正を含まない（修正は backlog-review 経由の RU 化後）
- 前提の現物確認（2026-10-27 inspect-promote 実行時）: REQ-108.md:30 空行と :31-41 ヘッダなし表行（IDX-03）／`docs/designs/skills/agentdev-design-file-manager.md:75` の inline ``` 3ランと機械検査違反2ファイル（IDX-04）／REQ-060.md:3 title 現行化済みに対し :10 旧用語残存（IDX-08）／REQ-010.md:44 の REQ-010-080 誤位置（070→080→071…）（IDX-09）／numbering-policy.md:34 のタイトル引用と DEC-062 実在（docs/README・decisions/README の Decision 表で確認）（IDX-12）

## IDX-03（原状保存）

- id: IDX-03
- category: REQ 構造整合性（Markdown 表分断）
- target: `docs/requirements/REQ-108.md:30`（空行）、`:31-41`（REQ-108-014..024）
- evidence: `REQ-108.md:29`（REQ-108-013 = 旧最終行）→ `:30`（空行）→ `:31`（REQ-108-014 開始。`| ID | 要件 |` ヘッダと `|---|` 区切り行を持たない表行の連続）。GFM では空行で表が終了し、区切り行のない後続 `|` 行は表として解釈されないため、11行が本文テキスト扱いになる。PR #3848（c60f7d716）で旧最終行の終端空行の後に新規行を挿入した構造由来
- severity: medium
- confidence: high
- source_of_truth: REQ-001（文書体系）・文書フォーマット規約（patterns.md）の要件表書式
- recommended_route: inspect-promote による分類後、intake 経由で `:30` の空行削除による表統合（1行削除の小修正）
- ng_classification: pre-existing（今回診断時点の main 既存。delta 窓内 2026-10-16 #3848 で混入）
- notes: REQ-108-014..024 は重要変更通知要件（#3847〜#3849 実装）の正本行であり、表として読めない状態は要件行の機械抽出・閲覧の両面で阻害要因。意図的な視覚的分離の可能性は低い（013 と 014 に主題断絶なし）

## IDX-04（原状保存）

- id: IDX-04
- category: 配布物整合性検査（壊れたコードスパン、REQ-053-008）
- target: `docs/designs/skills/agentdev-design-file-manager.md:75`、`src/common/skills/agentdev-design-file-manager/references/target-area-matching.md:33`
- evidence: 両ファイルの同一段落「見出しの走査と…行頭（字下げなし）の ``` で開始する…行頭の ``` のみを条件とし…閉じの ``` がない場合は…」に inline ``` ラン3箇所（奇数）。CommonMark では1つ目と2つ目が対になって中間文がコードスパンに飲み込まれ、3つ目が未対応のリテラルとして残る。check_content_corruption 実測: 428ファイル走査・違反2件・exit 1（REQ-053-008 準拠、2026-10-26T19:0x JST 実行）。配布物側（src/common → .opencode 投影）は REQ-053-008「配布物は…壊れたコードスパンを含まない」への直接違反。PR #3821（78041ccf4、2026-10-20）で混入し、2026-10-17 検査時は全違反 0 だった
- severity: medium（docs-check gate を fail させる現行状態＋配布物への REQ-053-008 直接違反。ただし文意は保持され是正は機械的）
- confidence: high（機械検査 exit 1 の実測・違反2ファイル特定済み）
- source_of_truth: REQ-053-008（配布物の構造健全性）と content-corruption-checker Design の検出契約（段落内 backtick ラン奇数）
- recommended_route: inspect-promote による分類後、是正 Case（fence マーカーの表現を ```` ``` ```` 等の4バッククォート囲みへ変更する表現修正、または ALLOWED_USAGE 登録のいずれかを判断）。同規則の同一内容維持は REQ-004-066..068 が要求するため、修正時は9箇所の複製（Design 3・配布 reference 2・script JSDoc 3・REQ 行）の整合を含む
- ng_classification: pre-existing（delta 窓内 2026-10-20 #3821 で混入した回帰）
- notes: 2ラン（偶数）の複製3箇所（numbering-policy.md:77、req-define.md:147、draft-generation.md:73）は検査契約上合格だが、同様に中間文がコードスパン化する表示になり得る。表現統一の際に併せて検討する価値がある

## IDX-08（原状保存）

- id: IDX-08
- category: DRIFT（用語現行化の部分反映）
- target: `docs/requirements/REQ-060.md:10`
- evidence: `REQ-060.md:3` の title は「リポジトリルートを cwd にして実行・`./` 付きパス指定」に現行化済み（README 表 `docs/requirements/README.md:58` も追随済み）だが、`:10` の目的節本文は「repo root 起 cwd + `./` 付き相対パス指定」の旧用語のまま。knowledge 2件（`docs/knowledge/bun-test-execution-form-drift-signals.md:19`、`windows-bun-test-spawn-timeout-classification.md:28`）も旧用語を記述
- severity: low
- confidence: high
- source_of_truth: REQ-094（ADF の Markdown 日本語表現および用語選択基準）の現行化方向
- recommended_route: inspect-promote による分類後、intake（REQ-060.md:10 の用語現行化の小修正。knowledge 側を含めるかは採否判断）
- ng_classification: pre-existing
- notes: なし

## IDX-09（原状保存）

- id: IDX-09
- category: REQ 構造整合性（行順序）
- target: `docs/requirements/REQ-010.md:44`
- evidence: 表行の出現順が 070（:43）→ 080（:44）→ 071（:45）→ … → 079（:53）→ 081（:54）。正しくは 070 → 071..079 → 080 → 081。番号の欠番は規約対象外だが、出現順序の逆転は連番検査・diff 突合の妨げになる構造乱れ
- severity: low
- confidence: high
- source_of_truth: 要件表の連番整列は REQ ファイル書式の前提（patterns.md）
- recommended_route: inspect-promote による分類後、intake（REQ-010-080 行の移動。1行の並べ替え）
- ng_classification: pre-existing
- notes: なし

## IDX-12（原状保存）

- id: IDX-12
- category: 第一参照導線（Decision 参照の ID 化不足）
- target: `docs/designs/foundations/numbering-policy.md:34`
- evidence: 「（「要件ID桁数の受理上限撤廃と表示ゼロ埋め・受理検証の分離」Decision 参照）」— DEC-062 の内容反映自体は完了（:32-33、DEC-062.md:4 accepted・題名一致確認済み）だが、参照が ID ではなくタイトル文字列のみで機械解決不能
- severity: low
- confidence: high
- source_of_truth: DEC-062（accepted）
- recommended_route: inspect-promote による分類後、intake（「Decision `DEC-062`」への ID 化の小修正）
- ng_classification: pre-existing（delta 窓内 68f5492ad #3865 で新設された行）
- notes: なし

## 未決の実装判断事項（RU 化時に判断）

- IDX-04: 是正方向（fence マーカー表現の4バッククォート囲みへの表現修正、または ALLOWED_USAGE 登録）は本成果物では確定しない（修正方向は未決のまま後続検討へ）。表現修正を採る場合は REQ-004-066..068 が要求する同内容9箇所複製（Design 3・配布 reference 2・script JSDoc 3・REQ 行）の整合を含め、2ラン複製3箇所（numbering-policy.md:77、req-define.md:147、draft-generation.md:73）の表現統一を併せて検討すること。IDX-04 は docs-check gate fail（check_content_corruption exit 1）の現行状態のため、次回 docs-check 実行前までの是正（または ALLOWED_USAGE 登録）が推奨される
- IDX-08: knowledge 2件（`docs/knowledge/bun-test-execution-form-drift-signals.md:19`、`windows-bun-test-spawn-timeout-classification.md:28`）の旧用語を本件の修正範囲に含めるかは採否判断として RU 化時に判断する（REQ-060.md:10 の修正自体は確定）

## 処理記録

- 2026-10-27 実施（backlog-auto stage 2 inspect 系統、--auto なし、in-context 審議・legacy LLM パス）: promote 5件を本成果物へ原状保存し、ソース finding ファイルから削除。Jev 先行評価は本 run の git 永続化スコープ制約（`.agentdev/inspect/` 配下のみ commit 対象。観測 JSON の新規 untracked 残留は既知の untracked-residue NG 源）により不使用とした。STEP-5 adversarial-review は監査後の条件付き化発動条件（手動分類対象が存在し本質的争点が残る）を満たさないため生成せず（観測なし=契約どおり）
