# 配布物本体への既存 ADF-COVERS 宣言残存の段階的 cleanup

## 観測内容

配布物本体（`src/opencode/` 配布 .md 19 ファイル / 29 行、2026-09-11 main 実測）に既存の ADF-COVERS 対応宣言が残存している。c694ae3c（case #2770 の design-save）で確定した配置方針「配布物本体への ADF-COVERS 宣言付与は行わない。対応宣言は docs 配下の正規成果物（該当実装を規定する Design）へ集約する」に照らして不整合だが、残存の由来は配置方針確定前の付与 commit（#2748: c620c67e、#2760: ac4cf77e）であり、main 既存事項である。

実測コマンド（case 2770 case-close 記録、対象選定時に再利用可）:

- 対象ファイル一覧: `rg -l --glob "*.md" "ADF-COVERS" src/opencode/`
- 宣言行一覧: `rg -n --glob "*.md" "ADF-COVERS" src/opencode/`（19 ファイル / 29 行。case 2770 SSoT 記載の 16 ファイルとの差 3 ファイルはファイル範囲基準差であり、19 ファイル実測を正とする）

本 promoted 成果物の生成時点（2026-09-15）での補足:

- src/opencode 全域の ADF-COVERS 出現は 62 ファイル 83 行（宣言・説明文・テストコード混在。grep count）。cleanup case の対象選定時は上記の .md 絞り込み rg を再実行して正確な対象を確定すること

## 影響

- 配置方針（c694ae3c）と既存配布物の不整合が残存する（新規違反ではない。case #2770 で「新規付与 0 件」を配布物内部 ID 契約検査 new_delta: 0 で確認済み）

## 課題（対応候補と判断材料）

- cleanup 時の着眼点: 宣言除去のみでなく、除去対象宣言が docs 配下の正規成果物（該当実装を規定する command Design / skill Design / integrity Design）へ集約済みかを traceability coverage で突合してから除去する（REQ-057-019 系の既存取り組みと同型）

## 既存要件との関連

- c694ae3c（配置方針確定 commit）: 方針の正典
- REQ-057-019 系（docs 配下への宣言集約）: 同型取り組み

## 根拠

- 観測元: case 2770 SSoT 検証コメント（issuecomment-5634003829 の `## Findings`）および case-close 完了コメント（issuecomment-5634065716 の検証差分「修正済み」・カウント補正 19 ファイル / 29 行）、case-close（2026-09-11）で回収
- main 既存事項・case 2770 非起因（c694ae3c 以降の src/opencode 変更 0 件を diff・commit 両面で確認済み）
- 処分経緯: intake-promote（2026-09-15）で採用を確定（ユーザー承認。正確な規模照合は cleanup case で実施）
