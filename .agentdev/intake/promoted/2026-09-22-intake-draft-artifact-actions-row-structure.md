# req-define の artifact_actions が既存ファイル行構造と突合されていない

## 観測内容

Case #3056 の draft-data（.agentdev/drafts/req-draft-jev-stage1-prior-evaluation.md）の artifact_actions に、実ファイル構造と整合しない指示が 2 件含まれていた（case-open で機械的追随として補正して適用）:

1. ACT-DESIGN-002（docs/designs/workflows/v4-collaboration-loop.md「.agentdev/ 状態領域の整合」表への行追加）: draft の行は 6 列（領域/内容/生成元/利用元/保持/削除条件）だが、既存表は 3 列（実ディレクトリ・ファイル/durable state 5 分類/8 寿命）。case-open は既存 3 列構造を保持し、draft 行の 6 項目を寿命セルの括弧内へ集約して適用した
2. ACT-DESIGN-004（execution-unit-construction.md の case-open 表記修正 6 箇所）: 修正対象 6 箇所は列挙どおりだったが、同一ファイルの See Also 行「`docs/designs/commands/case-open.md`（適用主体 command Design）」は対象外としつつ TS-011（所有・運用主体を意味する case-open 表記 0 件）の検索に引っかかり得る残留がある。case-open は draft の 6 箇所のみを修正した（残留は Case #3056 の Capture 候補として記録されたものが本 item）

## 影響

- draft-data の行構造が実ファイルと不整合な場合、case-open が機械的補正（既存構造への追随変換）を強制され、case-open の適用が draft どおりでなくなる
- 検索系検証（rg 等）で列挙した修正対象と実際の網羅範囲がずれると、修正漏れや過剰修正が生じる
- draft-data の意味内容（合意済み項目の集合）自体は問題なく、行の物理構造の精度が論点

## 課題

- req-define の要件展開・artifact_actions 生成が、append/update 対象の既存ファイルの表列構造・見出し構造を実ファイルから突合していない

## 提案する修正

- req-define（`agentdev-workflow-req-define`）の要件展開・artifact_actions 生成時において、append/update 対象の既存ファイルの表列構造・見出し構造を実ファイルから突合し、行をその構造に合わせて生成する検査（または生成手順の明記）を追加する
- TS 項目を定義する際、検索系検証（rg 等）の網羅範囲と修正対象列挙の一致を確認する手順を追加する（See Also 等の参照行の扱いを含む）

## 既存要件との関連

- REQ-004（要求の形成と合意）: req-define が生成する draft-data の品質に関する論点。REQ は要求を既に保持しており、生成手順の Design レベル修正で足りる
- req-define Design（artifact_actions 生成手順の所有者）
- 関連観測源: Case #3056、Definition PR #3057

## 分類根拠

- change_nature: nonconformance_fix（artifact_actions 生成手順が既存 Design の行構造へ不適合な指示を生成した問題の修正。実現方法〔検査追加 / 生成手順の明記〕の選択は後段 req-define の判断）
- req_impact: no
- target_stakeholder: 開発者（req-define / case-open の利用者）
- user_visible_change: no
- canonical_owner: agentdev-workflow-req-define（artifact_actions 生成手順）
- observed_evidence: Case #3056 の draft-data artifact_actions における ACT-DESIGN-002 の 6 列/3 列不整合、ACT-DESIGN-004 の See Also 残留リスク

## 元 intake item

- .agentdev/intake/inbox/intake-draft-artifact-actions-row-structure.md（source: case-open-deviation、Case #3056 / PR #3057、captured 2026-09-22）
