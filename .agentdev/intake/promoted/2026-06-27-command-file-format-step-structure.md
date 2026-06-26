# command-file-format Step 番号構造ずれ（case-open 構造的ずれ / req-save Step 4-0 違反）

## 発生源

- Issue: #1196 (CLOSED, COMPLETED)
- PR: #1200 (merged, squash 7d86f374)
- 発生日: 2026-06-26
- 元 item: case-open Step 構造的番号ずれ（F-002）、req-save Step 4-0 command-file-format 違反（F-001）

## 観測内容

PR #1200 で REQ-0143-004 の Step 0 扱い起因のずれを是正したが、2 つの残存構造問題がある。

1. **case-open 構造的番号ずれ（F-002）**: `docs/specs/commands/case-open.md` の Standard flow（Step 15-17-1）と共通終了処理（Step 18-19-2）が、command 定義 `src/opencode/commands/agentdev/case-open.md` の同名フェーズ（Step 10-15）と番号不一致。Step 0 起因ではなく、SPEC が Step 9-1 → Step 15 の非連番 jump を持つ構造的問題。Epic flow と Standard flow で Step 番号空間を分離していることが根因。
2. **req-save Step 4-0 違反（F-001）**: `docs/specs/commands/req-save.md` と `src/opencode/commands/agentdev/req-save.md` の双方が `Step 4-0` を持つ。SPEC↔command 間で一致（REQ-0143-004 充足）するが、`docs/specs/command-file-format.md` が禁止する `Step N-0` 形式（ゼロ起点サブステップ）に抵触。

## 影響

- case-open SPEC の Step 番号が command 定義と一致せず、 SPEC↔command 照合時に追跡困難
- req-save の `Step N-0` 形式が絶対規則（command-file-format.md）に違反。本 PR #1200 で規則を追加したことで新たに顕在化

## 課題

- case-open SPEC の Standard flow / 共通終了処理セクションの Step 番号構成を command 定義の連番構造へ再構成するか。Epic flow と Standard flow の Step 番号空間の統合または分離規則を明文化するか。Step 9-1 → Step 15 jump を解消するか
- req-save の `Step 4-0` を `Step 4-1` へ変更し、後続 `4-1/4-2/4-3` を +1 シフト（`4-2/4-3/4-4`）するか。SPEC 側を同期し前方参照を更新するか

## 既存要件との関連

- `docs/specs/command-file-format.md`（`Step N-0` 形式禁止規則）
- REQ-0143-004（SPEC↔command Step 一致原則）
- `docs/specs/commands/case-open.md`, `docs/specs/commands/req-save.md`
- `src/opencode/commands/agentdev/case-open.md`, `src/opencode/commands/agentdev/req-save.md`

## 対応方針候補

- 別 Issue として 2 SPEC の Step 構造再構成を扱う。case-open は Step 番号空間の分離規則明文化を含む。req-save は +1 シフトと前方参照更新を含む。TS-002 / QG-2 / draft/RU 削除残存検証の参照更新も併せて実施
