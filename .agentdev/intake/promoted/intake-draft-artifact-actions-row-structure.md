# req-define の artifact_actions が既存ファイル行構造と突合されていない

## 観測内容

Case #3056 の draft-data（.agentdev/drafts/req-draft-jev-stage1-prior-evaluation.md）の artifact_actions に、実ファイル構造と整合しない指示が 2 件含まれていた（case-open で機械的追随として補正して適用）:

1. ACT-DESIGN-002（docs/designs/workflows/v4-collaboration-loop.md「.agentdev/ 状態領域の整合」表への行追加）: draft の行は 6 列（領域/内容/生成元/利用元/保持/削除条件）だが、既存表は 3 列（実ディレクトリ・ファイル/durable state 5 分類/8 寿命）。case-open は既存 3 列構造を保持し、draft 行の 6 項目を寿命セルの括弧内へ集約して適用した。
2. ACT-DESIGN-004（execution-unit-construction.md の case-open 表記修正 6 箇所）: 修正対象 6 箇所は列挙どおりだったが、同一ファイルの See Also 行が TS-011（所有・運用主体を意味する case-open 表記 0 件）の検索に引っかかり得る残留リスクがあるとして記録された。

adversarial-review の技術検証による現行状態の確認（2026-09-22 時点）:

- 事象 1 の既存表が 3 列構造であることは実ファイルで確認済み。case-open の補正適用により現行表に破綻行はない。
- 事象 2 の TS-011 残留は現行ツリーでは解消済み（execution-unit-construction.md 内の case-open 表記は 0 件、See Also は case-ready 実行契約を参照、REQ-090-007 完了）。本項は採用根拠から除外し、後述の手順欠落の実例としてのみ参照する。

## 影響

- producer 側（req-define の要件展開・artifact_actions 生成手順）に、append/update 対象の既存ファイルの表列構造・見出し構造を実ファイルから突合する手順が存在しない（agentdev-workflow-req-define 配下を「表列/列構造/突合/行構造/網羅範囲」で検索し 0 件であることを機械確認済み）。
- TS 項目を定義する際、検索系検証（rg 等）の網羅範囲と修正対象列挙の一致を確認する手順も存在しない（See Also 等の参照行の扱いを含む）。
- 同種の draft 精度問題は今後の req-define 実行で再発し得る。再発時は case-open が機械的補正を強制され、draft 生成側の品質問題が後段工程の追随コストとして顕在化する。

## 課題

- 責務分離の論点: consumer 側（Design 保存内部責務・case-open）には req-define Design の create 時「既存セクション構造から追加位置を判断」のように部分的な既存構造考慮が存在するが、producer 側（req-define 生成手順）の突合手順とは責務が異なる。本提案は producer 側への手順追加であり、consumer 側の既存責務と重複しない範囲で検討されるべきである。
- draft-data の意味内容（合意済み項目の集合）自体には問題はなく、行の物理構造の精度が論点。

## 提案する修正対象

- agentdev-workflow-req-define の要件展開・artifact_actions 生成時において、append/update 対象の既存ファイルの表列構造・見出し構造を実ファイルから突合し、行をその構造に合わせて生成する検査（または生成手順の明記）を追加する。
- TS 項目を定義する際、検索系検証（rg 等）の網羅範囲と修正対象列挙の一致を確認する手順を追加する（See Also 等の参照行の扱いを含む）。

## 既存要件との関連

- REQ-004（要求の形成と合意）、req-define Design。既存の手順には本突合・一致確認が含まれない（adversarial-review で確認済み）。新規の手順追加提案であり、既存手順の置換ではない。

## 出典

- case-open-deviation、Case #3056 / PR #3057、captured_at 2026-09-22。
