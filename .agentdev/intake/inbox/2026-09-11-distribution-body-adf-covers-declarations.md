# 配布物本体への既存 ADF-COVERS 宣言残存の段階的 cleanup

## 概要

配布物本体（`src/opencode/` 配布 .md 19 ファイル / 29 行、2026-09-11 main 実測）に既存の ADF-COVERS 対応宣言が残存している。c694ae3c（case #2770 の design-save）で確定した配置方針「配布物本体への ADF-COVERS 宣言付与は行わない。対応宣言は docs 配下の正規成果物（該当実装を規定する Design）へ集約する」に照らして、docs 配下への宣言集約と配布物本体からの宣言除去を行う段階的 cleanup の case 化候補。

## 内容

- 残存宣言の由来は既存 case の付与 commit: #2748（c620c67e、2026-09-09）・#2760（ac4cf77e、2026-09-10）。配置方針確定前の付与であり、現行方針とは不整合だが main 既存事項
- case #2770（TS-003）では「新規付与 0 件」を配布物内部 ID 契約検査（distribution boundary、new_delta: 0）で確認済み。本件は新規違反ではなく既存残存の cleanup 課題である
- 実測コマンド（case 2770 case-close 記録）:
  - 対象ファイル一覧: `rg -l --glob "*.md" "ADF-COVERS" src/opencode/`
  - 宣言行一覧: `rg -n --glob "*.md" "ADF-COVERS" src/opencode/`（19 ファイル / 29 行）
  - case 2770 SSoT 記載の 16 ファイルとの差 3 ファイルは references/ 配下等のファイル範囲基準差（本 intake の 19 ファイル実測を正とする）
- cleanup 時の着眼点: 宣言除去のみでなく、除去対象宣言が docs 配下の正規成果物（該当実装を規定する command Design / skill Design / integrity Design）へ集約済みかを traceability coverage で突合してから除去する（REQ-057-019 系の既存取り組みと同型）

## 根拠

- 観測元: case 2770 SSoT 検証コメント（[issuecomment-5634003829](https://github.com/yogata/agent-dev-flow/issues/2770#issuecomment-5634003829) の `## Findings`）および case-close 完了コメント（[issuecomment-5634065716](https://github.com/yogata/agent-dev-flow/issues/2770#issuecomment-5634065716) の検証差分「修正済み」（カウント補正 19 ファイル / 29 行））、case-close（2026-09-11）で回収
- main 既存事項・case 2770 非起因（c694ae3c 以降の `src/opencode/` 変更 0 件を diff・commit 両面で確認済み）
