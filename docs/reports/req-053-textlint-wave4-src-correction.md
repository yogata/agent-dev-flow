---
id: REQ-053-TEXTLINT-WAVE4-SRC-CORRECTION
title: "textlint Wave4 src 系表層是正の実行記録（修正不要証明）"
status: accepted
created: 2026-09-09
source_issue: "#2738"
parent_epic: "#2734"
---

<!-- ADF-COVERS(implementation): REQ-053-013, REQ-053-002 -->

# textlint Wave4 src 系表層是正の実行記録（修正不要証明）

本 Report は、textlint 是正キャンペーン Epic（#2734）Wave 4（Issue #2738、RA-004 src 系分割）の実行記録である。Wave 2 の正式初期判定で拒否対象違反が空集合（初期不合格ファイル 0 件）であったため、本 Wave の表層是正対象は存在しない。本実行は、src 系 230 ファイルの最終判定の機械実行、TS-003 ファイル単位記録の全対象分生成、TS-006 検査群と TS-008 文字コード検査の実行、修正不要証明を行う。REQ-053-013（変更禁止事項遵守）と REQ-053-002（メタ指示不含有無の維持）は、src 側の変更を一切行わない維持証明によって実現した（本 Report の implementation 宣言はこの維持証明に対応する）。実行環境は worktree `.worktrees/2738-refactor`、base は main HEAD 7ff5327d（Wave 2 merge commit 4b596742 を含む）。実行識別情報（委譲単位 DEL-2738-1）と最終 HEAD の確定値は該当 PR 本文に記録する。実行日時は 2026-09-09。

## 1. 対象空集合の証明と最終判定

Wave 2 正式初期判定（docs/reports/req-053-textlint-wave2-calibration.md 第 5 節）で拒否対象違反は 0 件、初期不合格ファイルは空一覧であった。そのため Wave 3/4 の是正対象は存在せず、本 Wave は「拒否対象違反ゼロの維持証明」を実務とする。

本実行の最終判定（`bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root . --json`、worktree root で実行、終了コード 0、HEAD 7ff5327d の実ファイル）:

| 項目 | 実測値 |
|---|---|
| 解決対象ファイル数 | 493 |
| 拒否対象違反（hardCount） | 0（終了コード 0） |
| 助言指摘（全 corpus） | 4,382 件 / 422 ファイル |
| src 系対象ファイル数 | 230（commands 47 / skills 174 / plugins README 4 / tools README 2 / src/opencode-local 3） |
| src 系拒否対象違反 | 0 件 / 0 ファイル |
| src 系助言指摘 | 2,054 件 / 221 ファイル（クリーン 9 ファイル） |

Issue #2738 本文の「240ファイル」は case-open 時のベースライン参考値であり、実測 230 は corpus 移動を反映した値である（差異は PR 本文の stale-reference に記録）。node_modules 配下（Issue 本文の 487 ファイル）は対象解決の機構側既定除外に含まれ、本実行の解決対象 493 件に node_modules 配下のパスは 0 件であることを機械確認した。

## 2. Wave 2 正式初期判定との差分（助言 +7 件の由来分類）

| 項目 | Wave 2 正式初期判定 | 本実行（7ff5327d） |
|---|---|---|
| 解決対象ファイル数 | 493 | 493 |
| 拒否対象違反（hardCount） | 0 | 0 |
| 助言指摘 | 4,375 件 / 422 ファイル | 4,382 件 / 422 ファイル |

corpus の差分（`git diff 4b596742..main`）は `src/opencode/skills/agentdev-workflow-case-open/references/execution-unit-and-preflight.md` と `src/opencode/skills/agentdev-workflow-case-run/references/epic-wave.md` の 2 ファイルのみ（Issue #2748 の実装、commit c620c67e）であり、残り 491 ファイルは Wave 2 実行時と byte 等価である。同一規則構成の下で決定的に動作する gate の性質上、助言 +7 件（sentence-length +3、no-mix-dearu-desumasu +3、no-doubled-conjunction +1）の増分は同 2 ファイルの修正に全量帰属する（同 2 ファイルの本実行時助言合計は 18 件）。拒否対象違反の増加はなく、REQ-053-020/038 のゼロ維持は保たれている。Wave 2 Report 第 7 節のとおり助言件数の一致は Wave 5 の突合対象ではない。

## 3. 規則構成の同一性（Wave 5 突合への注意事項）

- gate.ts は Wave 2 merge commit 4b596742 を祖先に含む main HEAD（`git merge-base --is-ancestor 4b596742 HEAD` で確認）で実行した。
- Wave 2 Report 第 4.1 節の再計算手順テキストに従い規則構成ハッシュを再計算したが、既定の解釈では Wave 2 記録値 `8b6aea87...` と一致しなかった。原因候補を特定した: prh 規則の options.rulePaths には engine 起動環境の plugin dir 絶対パスが入り、canonical JSON(options) に環境依存値が混在する。手順テキストからは環境依存値の正規化要否が確定できない。
- 構成要素の実測は Wave 2 記録の構成要素表とすべて一致する: 採用規則 29（ja preset 23 + ai preset 5 + prh 1）、prh 標準辞書 SHA-256 `98c1ac19d8f6f2f85b4cab978ea9f752f35c93c14040c3227f0567f6a21b500e`（12 語）、依存版（@textlint/kernel 14.8.4 / plugin-markdown 14.8.4 / ja-technical-writing 12.0.2 / ai-writing 1.7.0 / prh 6.1.0）、拒否対象 5 規則（no-hankaku-kana、no-invalid-control-character、no-nfd、no-zero-width-spaces、prh）、プロジェクト用語辞書なし。
- 行動的証拠: 491 ファイルが byte 等価な同一 corpus に対し、本実行は hardCount 0 と Wave 2 記録の規則別助言内訳 18 規則中 15 規則の完全一致（残 3 規則の差分は第 2 節の src 2 ファイル修正に全量帰属）を再現した。本実行が Wave 2 固定規則と同一の規則構成で動作したことを裏付ける。
- Wave 5 は突合の前に、Wave 2 の計算実装（PR #2747 の関連セッション記録）で手順の実装詳細を確認し、prh options.rulePaths の環境依存絶対パスの取扱い（正規化または除外）を確定してから再計算すること。

## 4. TS-003 ファイル単位の結果（全 230 対象）

集計: 対象 230 ファイル = 合格 230 / 修正不要 230 / 残存不備 0 / blocked 0。集計値は第 4.1 節のファイル単位結果と一致する（REQ-053-019）。blocked 項目は 0 件のため判断必要事項の記録対象も 0 件である。

### 4.1 ファイル単位の結果

- 初期判定: 本実行の gate.ts --json の機械出力（Wave 2 固定規則、HEAD 7ff5327d 実ファイル）
- 修正有無: 全対象が修正不要（是正対象空集合のため編集を実施していない）
- 確認した品質観点: 固定 29 規則（拒否対象 5 規則: no-hankaku-kana、no-invalid-control-character、no-nfd、no-zero-width-spaces、prh）による文章表層品質と、REQ-053-013 変更禁止リスト（責務・振る舞い・処理順序・状態遷移・入出力契約・API/CLI 契約・ファイル形式・識別子・状態値・停止条件・安全制約・外部依存）の変更ゼロによる維持
- 最終判定: 全対象が合格（拒否対象違反ゼロ、終了コード 0）
- 残存不備: なし（blocked の判断必要事項もなし）

<details>
<summary>全 230 ファイルの個別結果（machine-generated）</summary>

| ファイルパス | 初期判定 | 修正有無 | 確認した品質観点 | 最終判定 | 残存不備 | blocked 判断必要事項 |
|---|---|---|---|---|---|---|
| `src/opencode-local/README.md` | 拒否対象 0 件 / 助言 15 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode-local/agentdev-gh/README.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode-local/agentdev-gh/case-schema/case-file.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/README.md` | 拒否対象 0 件 / 助言 0 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/backlog-auto.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/backlog-review.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/case-auto.md` | 拒否対象 0 件 / 助言 19 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/case-close.md` | 拒否対象 0 件 / 助言 15 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/case-open.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/case-run.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/case-update.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/design-save.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/inspect-docs.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/inspect-promote.md` | 拒否対象 0 件 / 助言 11 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/inspect-skills.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/intake-capture.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/intake-from-github.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/intake-promote.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/issue.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/learning-promote.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/req-define.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/req-save.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/backlog-review/partial.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/backlog-review/standard.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/backlog-review/zero-promoted.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/case-close/agentdev-push-failed.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/case-close/standard.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/case-close/worktree-cleanup-failed.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/case-run/standard.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/case-update/body.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/case-update/comment.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/case-update/req.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/case-update/review-ng.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/common/git-error-messages.md` | 拒否対象 0 件 / 助言 0 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/inspect-docs/standard.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/inspect-promote/standard.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/inspect-skills/standard.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/intake-capture/standard.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/intake-from-github/standard.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/intake-promote/standard.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/issue/standard.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/learning-promote/standard.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/req-define/feature-epic.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/req-define/feature.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/req-define/lightweight.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/req-define/req-draft.md` | 拒否対象 0 件 / 助言 1 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/req-save/epic.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/req-save/split-detected.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/templates/req-save/standard.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/commands/agentdev/third-party-sync.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/plugins/agentdev-gh-tool/README.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/plugins/agentdev-gh-write-guard/README.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/plugins/agentdev-textlint-guard/README.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/plugins/agentdev-third-party-tool/README.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-adversarial-review/SKILL.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-adversarial-review/references/adversarial-review-protocol.md` | 拒否対象 0 件 / 助言 15 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-architecture-advisory/SKILL.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-architecture-advisory/references/architecture-review-delegation.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-artifact-validation/SKILL.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-artifact-validation/scripts/README.md` | 拒否対象 0 件 / 助言 0 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-backlog-integration/SKILL.md` | 拒否対象 0 件 / 助言 12 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-backlog-integration/references/integration-judgment.md` | 拒否対象 0 件 / 助言 20 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-backlog-integration/references/learning-outcome-routing.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md` | 拒否対象 0 件 / 助言 42 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md` | 拒否対象 0 件 / 助言 19 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md` | 拒否対象 0 件 / 助言 29 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-command-authoring/SKILL.md` | 拒否対象 0 件 / 助言 18 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-command-authoring/references/common-policy-identifiers.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-command-creator/SKILL.md` | 拒否対象 0 件 / 助言 0 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-conventional-commits/SKILL.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-decision-file-manager/SKILL.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-decision-file-manager/references/validation-and-consistency.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-decision-file-manager/templates/doc_decision.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-decision-guidelines/SKILL.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-design-file-manager/SKILL.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-design-file-manager/references/target-area-matching.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-design-file-manager/scripts/README.md` | 拒否対象 0 件 / 助言 1 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-doc-diagnostics/SKILL.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md` | 拒否対象 0 件 / 助言 12 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-routing.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-doc-diagnostics/references/finding-output-contract.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-epic-tracker/SKILL.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-epic-tracker/references/regex-and-merge-conflict.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-git-worktree/SKILL.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` | 拒否対象 0 件 / 助言 43 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` | 拒否対象 0 件 / 助言 36 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-inspect-skills/SKILL.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-inspect-skills/references/execution-subject-misclassification.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md` | 拒否対象 0 件 / 助言 18 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-inspect-skills/references/skill-frontmatter-name-backtick.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-inspect-skills/references/spec-operation-contract-consistency.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-intake-pipeline/SKILL.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-intake-pipeline/references/intake-extraction.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-intake-pipeline/references/intake-promotion.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-issue-management/SKILL.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-issue-tracking/SKILL.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-learning-capture/SKILL.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-learning-capture/references/capture-entry-template.md` | 拒否対象 0 件 / 助言 1 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-learning-capture/references/example.md` | 拒否対象 0 件 / 助言 21 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-learning-pipeline/SKILL.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-learning-pipeline/references/disposition-and-artifact-schema.md` | 拒否対象 0 件 / 助言 17 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-learning-pipeline/references/inbox-and-evaluation-schema.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-learning-pipeline/references/promote-judgment-logic.md` | 拒否対象 0 件 / 助言 11 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-project-extensions/SKILL.md` | 拒否対象 0 件 / 助言 18 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-project-extensions/scripts/README.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-quality-gates/SKILL.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-quality-gates/references/case-run-pre-delegation-staleness-check.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-quality-gates/references/common-gate-contract.md` | 拒否対象 0 件 / 助言 0 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md` | 拒否対象 0 件 / 助言 18 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md` | 拒否対象 0 件 / 助言 15 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-quality-gates/references/qg-3-implementation-deviation.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md` | 拒否対象 0 件 / 助言 29 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-analysis/SKILL.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md` | 拒否対象 0 件 / 助言 38 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md` | 拒否対象 0 件 / 助言 11 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-analysis/references/req-define-detailed-gates.md` | 拒否対象 0 件 / 助言 16 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-analysis/references/session-context-detection.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-analysis/references/test-strategy-numeric-threshold-guide.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-analysis/references/verification-log.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-analysis/references/wall-methodology.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-file-manager/SKILL.md` | 拒否対象 0 件 / 助言 17 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-file-manager/references/create-append-update-flow.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-file-manager/references/matching-and-merge.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-file-manager/references/numbering-and-validation.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-file-manager/scripts/README.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-structure-diagnostics/SKILL.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md` | 拒否対象 0 件 / 助言 28 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-skill-authoring/SKILL.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-skill-authoring/references/design-principles.md` | 拒否対象 0 件 / 助言 27 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-skill-authoring/references/development-workflow.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-skill-authoring/references/review-protocol.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-traceability/SKILL.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-traceability/scripts/README.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-backlog-auto/SKILL.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-backlog-auto/references/fan-in-and-reporting.md` | 拒否対象 0 件 / 助言 12 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-backlog-auto/references/stage-execution.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-backlog-review/SKILL.md` | 拒否対象 0 件 / 助言 26 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-backlog-review/references/analysis-composition-and-review.md` | 拒否対象 0 件 / 助言 15 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-backlog-review/references/contradiction-ru-and-persistence.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-auto/SKILL.md` | 拒否対象 0 件 / 助言 19 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-auto/references/conflict-resolution-and-reporting.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-auto/references/input-resolution-and-orchestration.md` | 拒否対象 0 件 / 助言 15 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-auto/references/stop-and-decision-resolution.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-close/SKILL.md` | 拒否対象 0 件 / 助言 27 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md` | 拒否対象 0 件 / 助言 21 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-close/references/epic-wave-close.md` | 拒否対象 0 件 / 助言 21 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md` | 拒否対象 0 件 / 助言 12 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md` | 拒否対象 0 件 / 助言 16 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-open/SKILL.md` | 拒否対象 0 件 / 助言 17 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-open/references/adversarial-review-integration.md` | 拒否対象 0 件 / 助言 1 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-open/references/execution-unit-and-preflight.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-open/references/handoff-and-ou-gate.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-open/references/issue-body-and-execution-contract.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-open/references/issue-creation-flows.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-open/references/termination-and-cleanup.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-run/SKILL.md` | 拒否対象 0 件 / 助言 19 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md` | 拒否対象 0 件 / 助言 28 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-run/references/epic-wave.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-run/references/single.md` | 拒否対象 0 件 / 助言 34 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-update/SKILL.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-case-update/references/update-flows.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-design-save/SKILL.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-design-save/references/placement-and-save.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-design-save/references/verification-and-persistence.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-docs/SKILL.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-docs/references/distribution-check-and-output.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-docs/references/scan-and-doc-diagnostics.md` | 拒否対象 0 件 / 助言 1 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md` | 拒否対象 0 件 / 助言 16 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-promote/references/auto-promote-and-review.md` | 拒否対象 0 件 / 助言 11 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-promote/references/hitl-and-disposition.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-promote/references/inbox-scan-and-classification.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-skills/SKILL.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-skills/references/finding-output-and-persist.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-inspect-skills/references/skill-structure-diagnostics.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-intake-capture/SKILL.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-intake-from-github/SKILL.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-intake-promote/SKILL.md` | 拒否対象 0 件 / 助言 11 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-intake-promote/references/classification-and-review.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-intake-promote/references/hitl-persistence-and-destructive.md` | 拒否対象 0 件 / 助言 1 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-issue/SKILL.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-learning-promote/SKILL.md` | 拒否対象 0 件 / 助言 12 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-learning-promote/references/analysis-and-review.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-learning-promote/references/hitl-and-persistence.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-lifecycle/references/reference-resolution.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-lifecycle/references/structured-stage-handoff.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md` | 拒否対象 0 件 / 助言 14 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-orchestration/references/case-auto-recovery.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md` | 拒否対象 0 件 / 助言 12 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-req-define/SKILL.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-req-define/references/adversarial-review-integration.md` | 拒否対象 0 件 / 助言 1 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-req-define/references/draft-generation.md` | 拒否対象 0 件 / 助言 12 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-req-define/references/input-and-dialogue.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-req-define/references/requirement-development.md` | 拒否対象 0 件 / 助言 15 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-req-save/SKILL.md` | 拒否対象 0 件 / 助言 10 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-req-save/references/indexes-and-persistence.md` | 拒否対象 0 件 / 助言 13 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-req-save/references/precheck-and-req-ops.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-routing/SKILL.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-routing/references/case-update-procedure.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-routing/references/next-command-rules.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-routing/references/review-ng.md` | 拒否対象 0 件 / 助言 0 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/SKILL.md` | 拒否対象 0 件 / 助言 12 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/case-open/epic.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/case-open/multi-req-epic.md` | 拒否対象 0 件 / 助言 4 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/case-open/standard.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_analysis.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md` | 拒否対象 0 件 / 助言 0 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_feature_implementation.md` | 拒否対象 0 件 / 助言 0 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_feature_technical.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_review_ng.md` | 拒否対象 0 件 / 助言 3 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_update.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_bug.md` | 拒否対象 0 件 / 助言 8 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md` | 拒否対象 0 件 / 助言 2 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_epic.md` | 拒否対象 0 件 / 助言 0 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md` | 拒否対象 0 件 / 助言 6 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/skills/agentdev-workflow-third-party-sync/SKILL.md` | 拒否対象 0 件 / 助言 9 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/tools/agentdev-gh/README.md` | 拒否対象 0 件 / 助言 7 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |
| `src/opencode/tools/agentdev-third-party/README.md` | 拒否対象 0 件 / 助言 5 件 | 修正不要 | 固定29規則（拒否対象5規則）; REQ-053-013 変更禁止リスト維持 | 合格（拒否対象違反ゼロ） | なし | なし |

</details>

## 5. TS-008 文字コード検査

全 230 対象ファイルを node スクリプト（readFileSync + fatal TextDecoder）で機械検査した。UTF-8 BOM 検出 0 件、UTF-8 不正（fatal decode 失敗）0 件、CRLF 検出 0 件。checked 230 / problems 0。本実行は src 側の変更ゼロのため、cp932 由来の文字化け・CRLF 混入が存在しないことの維持証明である（REQ-057-021 の Windows 文字コード安全手順に沿った実行。大出力の証跡退避も node spawnSync + fs.writeFileSync UTF-8 明示で実施し、PowerShell リダイレクトは使用していない）。

## 6. TS-006 検査群の実行結果

実行環境: worktree root（cwd 明記）。本 Issue の変更範囲は docs/reports/ への本 Report 新規 1 ファイルのみである。

| 検査 | 実行 | 結果 |
|---|---|---|
| integrity suite | `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/`（cwd: worktree root） | **2557 pass / 1 fail / 0 errors**（Ran 2558 tests across 104 files）。唯一の fail は IR-055 runtime-unresolved-reference delta 1 件で、第 7 節のとおり main HEAD 既存の既知違反であり本 PR 由来ではない。初回実行時に見られた 4 errors（`Cannot find package 'zod'`）は worktree の node_modules 未伝播という環境由来であり、`src/opencode/skills/agentdev-project-extensions/scripts/` での bun install（依存整備）後に 0 件へ解消した |
| 配布物整合性検査（docs-spec-rebuild-integrity 由来、integrity suite 内） | integrity suite 全件実行に含まれる（`check_templates` 関連 test、`lint_skills` 関連 test、project-skill 整合 test 群等） | suite の 2557 pass に含まれて合格。worktree 環境固有の junction 未伝播に起因する WARNING は第 7 節に分類 |
| docs-check 系 checker | `check_integrity.ts`（--json、--profile source 既定）、`check_command_format.ts --root`、`check_extensions.ts`、`check_distribution_boundary.ts`、`check_templates.ts`、`lint_skills.ts`、`check_content_corruption.ts`、`check_knowledge_docs.ts`（いずれも bun run、cwd: worktree root） | check_command_format: OK（exit 0）。check_extensions: failures 0（exit 0）。check_content_corruption: 違反なし（exit 0）。check_knowledge_docs: 構造違反なし（exit 0）。check_distribution_boundary: 既知違反 1 件のみ（第 7 節、preflight S3-5 と同一）。check_templates: WARNING 1 件（第 7 節、worktree 環境由来）。lint_skills: NG 0 / Warning 1（第 7 節、main HEAD 集計値）。新規違反は 0 件 |
| traceability 検証 | `bun src/opencode/skills/agentdev-traceability/scripts/src/check.ts --root . --req REQ-053-013,REQ-053-002,REQ-053-023,REQ-057-021` | **7 check すべて pass（fail 0）**。初回実行では missing-implementation（REQ-053-013、REQ-053-002）を検出したが、本 Report frontmatter 直下の実装対応宣言（implementation ロール）により解消を確認した。本 Report 本文内のマーカー言及が宣言形式として解釈される（malformed-declaration）事象も、本文を形状を含まない表現へ変更して解消している |
| AUTOGEN ブロック鮮度 gate（REQ-010-059） | `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts --root <worktree>` | 「すべての AUTOGEN ブロックは鮮度が保たれています（再生成不要）」（exit 0）。本実行は src/opencode 変更ゼロのため鮮度確認でよい（preflight S3-6） |
| 変更範囲限定検査 | `check_changed_docs.ts --workflow case-run --base-ref main --root <worktree>`（worktree 環境の正規形） | commit 後に実行し、PR 本文の検証差分に結果を記録する |

## 7. 既知違反の由来分類（本 PR 新規違反ゼロの区別）

| 違反 / Warning | 内容 | 由来分類 |
|---|---|---|
| IR-055 runtime-unresolved-reference delta 1 件 | `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` L146 の `docs/designs/` 参照（heuristic） | **main HEAD 既存**。`git status --porcelain` が空であること（worktree = main HEAD）、および `git show main:...` で main ブロブの L146 に同参照が存在すること（node UTF-8 読取で確認）を機械証明。check_integrity.ts は決定的 checker であるため main HEAD でも同一違反が発生する。本 PR は src 変更ゼロのため新規違反は 0 件。修復主責任は Wave 5（REQ-057-024、IR-055 baseline 再生成の主責任 Wave）に引き継ぐ |
| check_distribution_boundary 違反 1 件 | `src/opencode/commands/agentdev/templates/req-define/req-draft.md` L118 の `DEC-003`（concrete-id） | preflight S3-5 に記録済みの main 起因既知違反（scanned=288、違反 1 件）。本 PR は src 変更ゼロのため増加なし |
| lint_skills Warning 1 件 | description aggregate budget 超過（total 17,506 chars / N=50、avg 350.1 > 350×50=17,500、warn、RU-0018 議題管理） | NG 0 件。Warning は main HEAD の SKILL.md 集計値であり、本 PR の変更（docs/reports 新規 1 ファイル）とは無関係。sk 管理（RU-0018）に委ねる既存 Warning |
| check_templates WARNING 1 件 | Templates directory not found in projection（`.opencode/skills/agentdev-workflow-templates/templates`） | worktree 環境（junction 未伝播）由来の環境 Warning。main 環境の検査には影響しない |

## 8. node_modules の取扱い（変更ゼロ証明）

- 解決対象への非含有: gate.ts の対象解決（既定除外 `**/node_modules/**`）により、解決対象 493 件に node_modules 配下のパスは 0 件（gate-output JSON 全 path の機械走査で確認）。
- 変更ゼロ: `git status --porcelain` と `git diff main --stat` が空であること（worktree = main HEAD と完全同一、node_modules は .gitignore 管理の untracked）を機械確認。本実行での bun install は検査実行のための依存整備（`src/opencode/plugins/agentdev-textlint-guard/`、`src/opencode/skills/agentdev-project-extensions/scripts/`、worktree 直下に package.json 不在のため対象なし）であり、git 管理対象への変更を生まない。

## 9. CR-001 助言の内訳（是正は実施しない）

助言対象の指摘は完了条件外であり、配布物の意味保存リスクとスコープ管理のため本 Wave では是正を実施しない（CR-001）。内訳を記録する。

全 corpus（493 ファイル、4382 件 / 422 ファイル）と src 系（230 ファイル、2054 件 / 221 ファイル）の規則別助言件数:

| 規則 | 全 corpus | src 系 |
|---|---|---|
| preset-ja-technical-writing/sentence-length | 2507 | 1016 |
| preset-ja-technical-writing/ja-no-mixed-period | 563 | 405 |
| preset-ja-technical-writing/no-mix-dearu-desumasu | 370 | 160 |
| preset-ai-writing/no-ai-colon-continuation | 213 | 139 |
| preset-ja-technical-writing/ja-no-redundant-expression | 206 | 125 |
| preset-ja-technical-writing/no-doubled-joshi | 145 | 69 |
| preset-ja-technical-writing/ja-no-successive-word | 97 | 9 |
| preset-ai-writing/ai-tech-writing-guideline | 71 | 34 |
| preset-ja-technical-writing/max-comma | 44 | 15 |
| preset-ja-technical-writing/max-kanji-continuous-len | 33 | 19 |
| preset-ja-technical-writing/max-ten | 31 | 12 |
| preset-ja-technical-writing/arabic-kanji-numbers | 29 | 2 |
| preset-ai-writing/no-ai-list-formatting | 28 | 24 |
| preset-ja-technical-writing/no-exclamation-question-mark | 17 | 11 |
| preset-ja-technical-writing/no-doubled-conjunction | 12 | 6 |
| preset-ai-writing/no-ai-hype-expressions | 12 | 6 |
| preset-ja-technical-writing/ja-no-weak-phrase | 3 | 1 |
| preset-ja-technical-writing/no-doubled-conjunctive-particle-ga | 1 | 1 |

## 10. Wave 5 への引き継ぎ

| 項目 | 内容 |
|---|---|
| 規則構成ハッシュ再計算 | 第 3 節の注意事項を参照。prh options.rulePaths の環境依存絶対パスの取扱いを Wave 2 計算実装の確認後に確定すること |
| corpus 変動 | 4b596742..7ff5327d で src 2 ファイル修正（#2748）による助言 +7 件。Wave 3/4 の merge によりさらに変動し得る。Wave 2 Report 第 7 節のとおり助言件数の一致は突合対象外 |
| IR-055 baseline 再生成 | 第 7 節の delta 1 件（worktree-operations.md L146）を含めて Wave 5 が REQ-057-024 に従い baseline を再生成すること |
| 拒否対象違反ゼロ維持 | 本実行時点で 0 を確認。Wave 5 は同一入口（`gate.ts --root . --json`）・同一規則構成で最終確認すること |
