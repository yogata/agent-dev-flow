# req-save SPEC / command 双方の Step 4-0 が command-file-format.md 違反

## 発生源

- Issue: #1196（CLOSED, COMPLETED, case-close 完了）
- PR: #1200（merged, squash 7d86f374）
- 発生日: 2026-06-26
- Findings ID: F-001

## 内容

PR #1200 の Findings / Capture候補 セクションで指摘。`docs/specs/commands/req-save.md`（SPEC）と `src/opencode/commands/agentdev/req-save.md`（command 定義）はともに `Step 4-0`（QG-1 適用結果の整合性検証）を持つ。SPEC↔command 整合性（REQ-0143-004）は充足するが、`docs/specs/command-file-format.md` が禁止する `Step N-0` 形式（ゼロ起点サブステップ）に抵触する。

`command-file-format.md` は本 PR #1200 で REQ-0143-004 後段の Step 0 扱い規則を配置済みであり、`Step N-0` 形式を明示的に禁止している。req-save ペアは SPEC↔command 間で一致しているものの、絶対規則（`command-file-format.md`）への違反が残存する。

## 推奨対応先

別 Issue での是正を推奨。作業候補:

- `src/opencode/commands/agentdev/req-save.md` の `Step 4-0` を `Step 4-1` へ変更
- 後続 Step `4-1`/`4-2`/`4-3` を +1 シフト（`4-2`/`4-3`/`4-4`）
- `docs/specs/commands/req-save.md` の対応 Step 番号を command 側へ同期
- 両ファイル内の Step 4-0 / 4-1 / 4-2 / 4-3 への前方参照を更新
- TS / 完了条件等に Step 番号参照があれば更新

## 現在の追跡状態

- PR #1200 Findings / Capture候補: 本 PR のスコープ外（REQ-0143-004 Step 0 扱い是正対象は req-define/case-run/backlog-review/case-open の 4 SPEC のみ）
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
- 本 intake の SPEC 確定候補: なし（既存 `command-file-format.md` 規則の適用漏れ是正）

## 備考

OU-003（PR #1200）は REQ-0143-004 の Step 0 扱い起因のずれ（SPEC が Step 0 を独立番号扱いし command と 1 ずれる）の解消に限定した。req-save ペアは SPEC↔command 間で Step 番号が一致しているため TECH-004 pass_criteria は充足するが、`Step N-0` 形式の絶対禁止規則違反が残存する。この違反は `command-file-format.md` の規則追加（本 PR）により新たに顕在化したものであり、本 intake は PR #1200 の成果を損なうものではない。
