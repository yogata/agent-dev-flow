# inspect-docs finding 20260911T055548Z

> 本ファイルは /agentdev/inspect-docs（/agentdev/backlog-auto stage 1、2026-09-11 実行）の未分類検出事項である。分類（promote / defer / reject）は後続の /agentdev/inspect-promote の責務である。
> 既存 defer 残置分（20260822T080133Z F-05、20260901T120043Z F-08〜F-12/F-27/F-34、20260907T012032Z F-04）は本サイクルでも変化なし（F-27 は guides 原文残存を再確認、F-04 は REQ-057 完了条件未充足のまま観察継続）。

## 検出事項リスト

### F-01: agentdev-textlint-guard Plugin の自己ホスト投影（.opencode/plugins/）が不在

- **category**: 配布投影非対称（自己ホスト投影 stale、横断契約矛盾候補）
- **target**: `.opencode/plugins/agentdev-textlint-guard/`（ディレクトリ・loader shim `.ts` ともに不存在）
- **evidence**:
  1. 正本 `src/opencode/plugins/agentdev-textlint-guard/` は git tracked で実在（plugin.ts、README.md、rules/、vendor/、tests/）。submodule ではなく通常ディレクトリ
  2. `.opencode/plugins/` には他 4 plugin（agentdev-distribution-boundary-guard / agentdev-gh-tool / agentdev-gh-write-guard / agentdev-third-party-tool）の loader shim（`agentdev-*.ts`）と junction ディレクトリが存在するが、textlint-guard は shim もディレクトリも不存在
  3. `docs/designs/local/runtime-package-boundary.md` L270 は「`scripts/self-sync.ps1` は repo-local Plugin を除外しない（自己ホスト投影を維持する）」と規定。L162-166 の plugin 動的列挙（`Get-ChildItem src/opencode/plugins -Directory -Filter 'agentdev-*'`）に除外条件は存在しない
  4. `src/opencode/plugins/agentdev-textlint-guard/README.md` は「本 package は consumer 配布対象（Plugin / Hook 配布種別）であり、repo-local 除外リストへ登録しない」と宣言し、最終検査の実行例に「導入先」パスとして `.opencode/plugins/agentdev-textlint-guard/gate.ts` を明記
  5. DEC-028（文章表層品質の共通実行基盤、accepted 2026-09-09）が本 plugin を正規採用。AGENTS.md も同 plugin を textlint 共通基盤の正規参照点として参照。OpenCode は `.opencode/plugins/` depth-1 のファイルのみ自動読み込みするため、現状自己ホスト環境で pre-write Plugin がロードされていない
  6. `docs/designs/quality/textlint-quality-runtime.md` L92 は「空のキャッシュとネットワーク遮断下で Plugin と最終検査が追加操作なしに起動すること」を検証条件とし、L52 は self-sync 経路での動作を前提とする
- **severity**: medium
- **confidence**: high（契約文書 3 点〔Design / README / self-sync.ps1〕と実配置の矛盾を直接確認）
- **source_of_truth**: `docs/designs/local/runtime-package-boundary.md`（投影契約）> `src/opencode/plugins/agentdev-textlint-guard/README.md`（配布宣言）
- **recommended_route**: 意味診断検出事項。対処は (a) `scripts/self-sync.ps1` の再実行による自己ホスト投影の再同期（check モードでは shim 欠落が [DIVERGENCE] 検出対象）、または (b) 意図的除外であれば runtime-package-boundary.md 側への正当化記録の追加。配布境界 checker（docs-check 機械検査）route 候補：投影対称性検査の検出対象になり得るかの確認
- **ng_classification**: new finding（前回 20260907T012032Z は DEC-028 accepted（2026-09-09）以前であり、本サイクルで初検出）
- **notes**: `.opencode/plugins/` 配下は git 管理外のローカル生成物（git ls-files 空）のため、本検出はリポジトリ内容の修正ではなく実行環境の再同期を求めるもの。REQ-052-006（repo-local 判定基準）上も本 plugin は「ADF 汎用の Plugin」（配布対象）と解釈される

## クリーン判定（問題なしと確認した観点）

- REQ frontmatter id↔ファイル名一致・id 一意性: 現行 48 + retired 11 の全 59 ファイルで問題なし
- 索引三重突合: requirements/README.md AUTOGEN（現行 48 + retired 11）、docs/README.md AUTOGEN（48 / 11）、実ファイル数が完全一致
- Decision 索引整合: decisions/README.md AUTOGEN（承認済み 25 / 提案中 0）、実 status 分布（accepted 25 / superseded 2）、docs/README.md「DEC-001〜028 の27件（DEC-005、DEC-007 は superseded）」が一致。DEC-018 欠番は既知（DEC-013 の欠番維持記録あり）
- REQ-059（Decision と REQ の関連宣言管理）実装整合: 全 26 現行 DEC が frontmatter `related_reqs` を宣言（未宣言 0、空宣言 0）。decisions/README.md 関連REQ表と frontmatter が全件一致（retired REQ は retired 前置き付き表記）
- 廃止 REQ 参照: 活性文書（docs/reports/、retired/ を除く）での全言及が retired 注記・移管証跡・履歴文脈付き（v2:REQ-0137 等の 4 桁帯 ID は部分文字列誤マッチとして除外）
- superseded DEC（DEC-005、DEC-007）参照: 全て supersedes 宣言・status 別ビュー・履歴記録の文脈
- Design 状態乖離 DRIFT: designs/README.md の status 表 42 行すべて accepted、frontmatter status=draft の Design 0 件（放置 draft なし）
- Decision 状態乖離 DRIFT: proposed 0 件、related_reqs 未宣言 0 件
- REQ 分類一貫性: 48 現行 REQ で要件テーブル外の表形式 0 件。REQ-058 / REQ-059 は目的・要件・適用範囲の標準構成
- リンク実在性: ルート README、docs/README.md、requirements/decisions/designs/guides 各 README、guides 12 ファイルの相対リンク切れ 0 件（`src/opencode/commands/agentdev/README.md` 含む）
- guides 索引: guides/README.md の 11 リンクと実 11 ファイルが完全一致
- designs README 索引: command Design 19 行 = 実 19 コマンド、索引リンク切れ 0 件
- 配布物（src/opencode 自著作 227 md、node_modules 除外）: frontmatter 重複 0、UTF-8 BOM 0、CRLF/LF 混在 0、制御文字・U+FFFD 0、相対リンク切れ 0、存在しない command 参照 0（commands README listing 19 コマンドと完全一致）。非フェンス H1 重複 2 件はいずれも既知の例示系偽陽性（req-draft.md の `# draft-data` / `# summary` は YAML マルチドキュメント区切りコメント、agentdev-skill-authoring/references/development-workflow.md:72 は 4 重バックフェンス内テンプレート例）
- src/opencode ↔ .opencode 投影: 共通ファイルの内容差分 0（IR-016 領域、junction 構造）。projection-only 8 ファイルは /repo/docs-check・repo-agentdev-integrity 等 repo-local 配布除外（designs README に正当化記載あり）
- tools / commands の agentdev 対称: src・投影で個数一致、src-only / proj-only なし

## 対象外（Out of Scope）

- vendored node_modules（`.opencode/skills/*/scripts/node_modules/`、plugin 配下 node_modules）。git 管理対象外のローカル生成物
- docs/reports/ 配下の監査レポート相対リンク（前回 20260907 で docs-check route 候補 3 として扱い明確化を提案済み、変化なし）
- 配布物 ADF-COVERS(implementation) 宣言中の REQ ID: 全 227 ファイルの宣言 REQ・行 ID を docs 側 REQ 本文と突合し不存在 0 件を確認（機械消費の対応宣言）

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 13 item（2026-09-09 〜 2026-09-10 付。前回 26 item から減少）
- `.agentdev/learning/inbox.md`: 20 エントリ（前回 26 から減少）
- `.agentdev/intake/promoted/`、`.agentdev/learning/promoted/`、`.agentdev/inspect/promoted/`、`.agentdev/backlog/req-units/`: 空（.gitkeep のみ）
- `.agentdev/inspect/inbox/`: 既存 defer 3 ファイル（20260822T080133Z、20260901T120043Z、20260907T012032Z）
- `.agentdev/drafts/`、`.agentdev/issues/`: 不在（空扱い）

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-11
- 探索手段: README 索引・正規成果物の直接読取・node による機械的走査（REQ frontmatter、索引突合、retired/superseded 参照スキャン、リンク実在、配布物エンコーディング/構文/ID パターン、ADF-COVERS 実在、投影対称性）
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）

## 審議記録（参照）

- 本 workflow は read-only-diagnostic 型のため、暫定分類・adversarial-review は後続の inspect-promote が所有する。本ファイルは診断結果と証拠のみを含む
