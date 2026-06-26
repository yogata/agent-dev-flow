# case-open SPEC の Step 15-19-2 と command Step 10-15 の構造的番号ずれ

## 発生源

- Issue: #1196（CLOSED, COMPLETED, case-close 完了）
- PR: #1200（merged, squash 7d86f374）
- 発生日: 2026-06-26
- Findings ID: F-002

## 内容

PR #1200 の Findings / Capture候補 セクションで指摘。`docs/specs/commands/case-open.md`（SPEC）の Standard flow（Step 15-17-1）と共通終了処理（Step 18-19-2）は、command 定義 `src/opencode/commands/agentdev/case-open.md` の同名フェーズ（Step 10-15）と番号が一致しない。本 PR #1200 の +1 シフト適用後も SPEC は Step 15 から再開し、command は Step 10 から再開する。

このずれは Step 0 起因ではなく、SPEC が非連番（Step 9-1 から Step 15 への jump）を持つ構造的問題。Epic flow と Standard flow で Step 番号空間を分離していることが根因。

## 推奨対応先

別 Issue での是正を推奨。作業候補:

- case-open SPEC の Standard flow / 共通終了処理セクションの Step 番号構成を command 定義の連番構造へ再構成
- Epic flow と Standard flow の Step 番号空間の統合または分離規則の明文化
- Step 9-1 から Step 15 への jump 解消（連番化またはサブステップ階層の整理）
- 本 PR #1200 で +1 シフトした Step 番号（15-17-1, 18-19-2 等）の再調整
- TS-002 / QG-2 参照（Step 1-1→2-1 等）の更新
- draft/RU 削除残存検証（Step 18-1-1→19-1-1）参照の再更新

## 現在の追跡状態

- PR #1200 Findings / Capture候補: 本 PR のスコープ外（Step 0 扱い起因のずれ是正のみが対象）
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
- 本 intake の SPEC 確定候補: なし（既存 SPEC 構造の再構成）

## 備考

OU-003（PR #1200）は REQ-0143-004 の Step 0 扱い起因のずれ解消に限定した。本 PR で case-open SPEC に +1 シフトを適用した結果、Step 0 起因のずれは解消したが、Step 9-1 → Step 15 jump に起因する構造的ずれは残存する。この構造的ずれは Step 0 扱いとは独立の問題であり、SPEC 全体構成の見直しを要するため本 Issue のスコープ外とした。本 intake は PR #1200 の成果（Step 0 起因ずれの解消）を損なうものではない。
