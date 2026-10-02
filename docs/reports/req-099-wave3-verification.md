# REQ-099 Wave 3 統合検証の試験実行記録（Issue #3324）

Epic #3316（Case #3314）の Wave 3 統合検証として、REQ-099 の全組合せ試験（TS-003）、
既存ローカルIssue資産互換試験（TS-004）、工程適合試験（TS-009）、必須能力欠落環境試験
（TS-012）、および TS-011 全スコープ残存検索の実行結果を記録する。
基準コミットは e9506080（Wave 2 merge 完了後の main）である。

## 検証環境と実行方法

| 項目 | 内容 |
|---|---|
| worktree | `.worktrees/3324-feature`（branch: feature/issue-3324） |
| ランタイム | bun test v1.3.6、Node 22 系（checker 実行） |
| テスト実行 | `bun test ./src/`（repo root cwd、REQ-060 準拠）と `bun test ./scripts/` |
| GitHub 組合せの実呼出し | Custom Tool `agentdev_gh`（issue_read: Epic #3316、PR 作成時 pr_create） |

## TS-003 全組合せ Tool 操作契約試験（REQ-099-007）

4組合せそれぞれで、ホスト登録 surface を通して Tool 操作契約の主要操作一連
（起票・読取・更新・状態遷移・コメント CRUD と読み戻し検証）を実行した。
操作系列は issue_create → issue_read → issue_update → comment_create →
comment_list → comment_update → issue_close → issue_reopen → comment_delete の 9 操作で、
すべて engine の VERIFY（読み戻し照合）を通過した場合のみ成功を返す契約に基づく。

| 組合せ | 登録 surface | テスト | 結果 |
|---|---|---|---|
| OpenCode×GitHub | `src/opencode/plugins/agentdev-gh-tool/plugin.ts`（GitHub 実装 runner） | `src/opencode/plugins/agentdev-gh-tool/tests/four-combination.test.ts` | pass（9 操作 + 読み戻し一致） |
| OpenCode×ローカルIssue | 同上（投影パス検出 → LocalRunner） | 同上 | pass（9 操作 + 実ファイル検証: 採番、LF、BOM なし） |
| Senpi×GitHub | `src/senpi/tools/agentdev-gh-tool/registration.ts`（GitHub 実装 runner） | `src/senpi/tools/agentdev-gh-tool/tests/four-combination.test.ts` | pass（9 操作 + 読み戻し一致） |
| Senpi×ローカルIssue | 同上（`.senpi/tools/agentdev-gh/runner-local.ts` 投影検出） | 同上 | pass（9 操作 + 実ファイル検証） |

GitHub 組合せは gh CLI を実行しないステートフルスタブで検証した（検証対象は操作契約と
VERIFY であり、gh 自体の呼出し品質は REQ-093 領域）。OpenCode×GitHub の実呼出し証跡として、
本委譲内で Custom Tool `agentdev_gh` の issue_read（#3316 取得）と pr_create（本 PR）を
実行し、ok:true（VERIFY 通過）を確認した。

## TS-004 既存ローカルIssue資産互換（REQ-099-008、REQ-099-009）

`docs/designs/local/local-case-file.md` と `case-schema/rules/*.yaml` の現行スキーマに
準拠した代表資産を fixture とし、単一の Local 実装（両ホスト接続の共通原本）で検証した。

| 観点 | 検証内容 | 結果 |
|---|---|---|
| 追加変換なしの読み書き | tracking 資産（in-discussion、コメント 2 件）の読込で role/kind/trackingState/state を導出し、title 更新で frontmatter のみ書換・本文とコメント実体を不変 | pass |
| 採番空間の維持 | 既存 issue-0007 が存在する空間での起票は issue-0008 を採番し、欠番 1〜6 を再利用しない | pass |
| 状態写像の逸脱 0 件 | tracking 6 状態（created/in-discussion/on-hold/ready/resolved/closed）の導出と GitHub 三段写像（open/closed）が全状態で一致 | pass |
| PR 系状態写像 | case 資産（status: review）の pr_mergeable が MERGEABLE を導出 | pass |
| スキーマ違反の fail-closed | status 値域外の資産は読み取りを失敗させ、変換で直さない | pass |
| ホスト別重複の不在 | 採番・状態写像・読み書きは共通 engine（`src/common/tools/agentdev-gh/local/runner-local.ts`）が単一所有。TS-003 の両ホスト投影検出テストが同一原本からの構築を固定 | pass |

補足: 本リポジトリ（ADF 自己ホスト環境）の `.agentdev/issues/` には既存ローカルIssue資産が
実在しないため、代表資産は共通スキーマ Design と機械可読 rules から構成した。旧形式コメント
（旧日時見出し・見出しなし作業ログ）の移行互換は既存テスト
（`src/common/tools/agentdev-gh/local/tests/runner-local.test.ts`）が固定する。

## TS-009 工程適合（REQ-099-015、REQ-099-016）

対応環境での工程契約の適合を、workflow skill 定義と既存契約の構造照合で実施した
（本 Issue では live な case 全体の再実行ではなく、契約照合と構造固定を対象とする）。

| 観点 | 照合内容 | 結果 |
|---|---|---|
| case-run 契約 | result 4 状態（completed-pr/blocked/failed/delegation-unavailable）、委譲 1 件への収斂、前置/最終 gate、completed の SSoT は PR 本文（成果物未確認の成功を禁止） | pass |
| case-auto 契約 | orchestration stage モデル、stage 内並列・stage 間 fan-in（未収束対象の残存を収束済みとしない）、同期逐次実行への切替禁止 | pass |
| adapter 委譲契約 | 3点ゲート（4状態 result・commit hash・PR URL）、3点の欠ける応答を completed-pr として扱わない | pass |
| Tool 操作契約の維持 | 副作用操作は読み戻し照合（VERIFY）を通過した場合のみ成功を返す（agentdev_gh 共通契約） | pass |

上記の照合を恒久テストとして
`src/common/skills/agentdev-workflow-case-run/scripts/tests/process-conformance.test.ts`
へ追加した（契約要素の欠落を回帰として検出する）。成果物未確認の成功は 0 件である
（テストコードの全成功は読み戻し検証つき、工程契約は成果物検証つきの成功のみを固定）。

## TS-012 必須能力欠落環境（REQ-099-015）

| 欠落能力 | 検証内容 | 結果 |
|---|---|---|
| Local バックエンド実装（投影破損） | 投影パスに createLocalRunner を export しない runner-local.ts がある環境で対象操作を起動し、GitHub 実装への暗黙 fallback が発生しないことを確認（構造化失敗 config-uninterpretable で報告） | pass |
| リポジトリ解決 | 解決不能環境は実行可能と判定せず config-uninterpretable で報告（既存契約の再確認） | pass |
| guard の検査不能 | 共通判定の検査エラーは block で成功扱いしない、正常操作の誤拒否 0 件（既存テスト `guard-connection.test.ts`、`gh-command-detector.test.ts` が固定） | pass |

検出に伴い、Wave 2 接続実装（`src/opencode/plugins/agentdev-gh-tool/plugin.ts`、
`src/senpi/tools/agentdev-gh-tool/registration.ts`）の既定 runner 構築を修正した。
修正前は投影パスに破損した Local 実装が存在する場合、GitHub 実装へ暗黙 fallback していた。
修正後は fail-closed で構造化失敗を返す。暗黙 fallback は 0 件である。

## TS-011 全スコープ残存検索の集約

検索コマンドを次に示す（worktree 全体、`--glob '!node_modules'`、`!vendor`、lock ファイル除外）。

```bash
rg -n "src/opencode/commands|src/opencode/skills|src/opencode/tools" src/ docs/ scripts/ traceability/ *.md
rg -n "opencode-local" src/ docs/ scripts/ *.md
rg -n "\.opencode/tools|\.senpi/tools" src/ docs/ scripts/ *.md
```

実施時点の hit と分類を次に示す。

| 分類 | 内容 | 処置 |
|---|---|---|
| src/ 配下のコード・テスト参照 | scripts/self 配下の検査テスト 8 ファイル（旧原本パスをパス定数として保持、実行時に ENOENT）、case-intake-cross-inspection 3 ファイル（区切り配列形式パス）、third-party-sync 契約テスト、textlint-guard テスト 2 ファイル、guard-connection テスト（bare import） | 本 PR 内で新原本パスへ更新し検証済み（bun test src 878 pass / scripts 263 pass） |
| installer の旧 Local 実装参照 | `scripts/install.ps1`（LocalMode リンク先 `src/opencode-local`、実体不存在）、`scripts/consumer/common.ps1`、`scripts-behavior.test.ts` fixture | 本 PR 内で `src/common/tools/agentdev-gh/local/` へ更新し、実 fixture 統合テストで検証済み（17 pass） |
| docs 記述の現行化 | docs/designs、docs/knowledge、AGENTS.md の現行記述としての旧原本パス（artifact-responsibilities、document-model、workflow-skill-model、custom-tool-contracts、local-case-file 等のパス文字列） | パス文字列を同値置換で現行化（文意不変）。yomiyasu 同梱 lint 全件 exit 0 を確認 |
| 歴史記録・移行記述（参照行として除外） | DEC-004（当時の名称である旨を明記）、DEC-007（superseded 済み決定記録）、docs/requirements/retired 配下、backticks-identifier-threshold の過去事象記述、checker-fixture 知識の過去注記 | 変更しない（Decision と retired REQ は決定記録・歴史記録であり遡及改変しない） |
| 旧 archive 構造一式（本 PR で修正せず記録） | `scripts/self/release/package-release-archive.ps1`（src/opencode 前提の収集・boundary check）、`scripts/consumer/archive/install.ps1`、`README-INSTALL.md` の同梱内容、`docs/designs/integrity/integrity-contracts.md` の archive レイアウト節 | release archive の新構造（src/common + src/opencode + src/senpi + src/third-party）対応は収集対象と boundary check の再設計を伴うため、Findings / Capture候補 へ記録 |
| Design 文書の旧構成セクション（本 PR で修正せず記録） | `docs/designs/local/runtime-package-boundary.md`（REQ-009 時代の接続構成を大量保持）、`docs/designs/local/third-party-skill-management.md`（旧 skill-projection-manifest 時代の記述） | 文書全体の現行化は意味判断を伴うため Findings へ記録 |
| REQ-099 スコープ外の陳腐化 | `docs/designs/integrity/integrity-rule-catalog.md` の IR-047 参照（REQ-051 で Decision 移行済み旧 IR の遺物） | Findings へ記録 |

`.senpi/tools` 参照は現行の Senpi 向け投影パス（REQ-099 の新構造）であり旧パス参照ではない。

## 品質ゲート実行結果

| ゲート | コマンド | 結果 |
|---|---|---|
| 単体・統合テスト（src） | `bun test ./src/` | 878 pass / 0 fail |
| リリース検査（scripts） | `bun test ./scripts/` | 263 pass / 0 fail |
| textlint 最終検査 | `bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root .` | PASS（548 対象ファイル、hard 違反 0 件） |
| 配布依存境界最終 gate | `node --experimental-strip-types ./.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts --profile source --root <worktree> --json` | ok:true / failures 0（scanned 362） |
| UTF-8 健全性（変更ファイル全件） | BOM / CR / U+FFFD 検査 | 49 ファイル / 異常 0 件 |
| トレーサビリティ check | `bun src/common/skills/agentdev-traceability/scripts/src/check.ts --root . --req REQ-099-007,REQ-099-008,REQ-099-009,REQ-099-015,REQ-099-016,REQ-099-019` | 9 検出項目の結果は PR 本文の検証差分セクションを参照 |

## REQ-098 yomiyasu 推敲の適用記録

docs 変更（パス現行化と本記録）に対し、yomiyasu を読み込んだ上で編集を行い、同梱 lint
（`yomiyasu_lint.py`）を変更ファイル 23 件へ実行した。全件 exit 0。パス文字列の同値置換は
文意・数値・識別子を変更しないため、本文の推敲不要を確認した（REQ-098-007 の修正不要確認）。
