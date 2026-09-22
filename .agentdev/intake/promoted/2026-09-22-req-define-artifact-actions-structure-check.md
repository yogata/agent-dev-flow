# req-define の artifact_actions 生成における既存ファイル構造突合の強化

## 観測内容

Case #3056 の draft-data（.agentdev/drafts/req-draft-jev-stage1-prior-evaluation.md）の artifact_actions に、実ファイル構造と整合しない指示が 2 件含まれていた（case-open が機械的追随として補正して適用）:

1. ACT-DESIGN-002（docs/designs/workflows/v4-collaboration-loop.md「.agentdev/ 状態領域の整合」表への行追加）: draft の行は 6 列（領域/内容/生成元/利用元/保持/削除条件）だが、既存表は 3 列（実ディレクトリ・ファイル/durable state 5 分類/8 寿命）。case-open は既存 3 列構造を保持し、draft 行の 6 項目を寿命セルの括弧内へ集約して適用した。
2. ACT-DESIGN-004（execution-unit-construction.md の case-open 表記修正 6 箇所）: 修正対象 6 箇所は列挙どおりだったが、同一ファイルの See Also 行「`docs/designs/commands/case-open.md`（適用主体 command Design）」は対象外としつつ TS-011（所有・運用主体を意味する case-open 表記 0 件）の検索に引っかかり得る残留がある。case-open は draft の 6 箇所のみを修正し、残留は Case #3056 の Capture 候補として記録。

## 影響

- req-define が生成する artifact_actions の物理構造精度が低いと、case-open の機械的追随が毎回補正を要し、draft → Definition の変換コストと追随ミスのリスクが増大する。
- TS 項目（検索系検証）の網羅範囲と修正対象列挙が一致しないと、検証の偽陽性・偽陰性と修正漏れが発生し得る。
- draft-data の意味内容（合意済み項目の集合）自体には問題がないため、論点は行の物理構造の生成精度に限定される。

## 課題（改善要求）

- req-define（`agentdev-workflow-req-define`）の要件展開・artifact_actions 生成時において、append/update 対象の既存ファイルの表列構造・見出し構造を実ファイルから突合し、行をその構造に合わせて生成する検査（または生成手順の明記）を追加する。
- TS 項目を定義する際、検索系検証（rg 等）の網羅範囲と修正対象列挙の一致を確認する手順を追加する（See Also 等の参照行の扱いを含む）。

## 既存要件との関連

- REQ-004（要求の形成と合意）— draft 品質の向上
- req-define Design / agentdev-workflow-req-define（修正対象の workflow skill）
- case-open の機械的追随（definition artifact actions 適用）— 補正負担の解消

## 出典

- intake item: `.agentdev/intake/inbox/intake-draft-artifact-actions-row-structure.md`（source: case-open-deviation、Case #3056、PR #3057、captured_at: 2026-09-22）
