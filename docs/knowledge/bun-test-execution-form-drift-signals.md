---
title: bun test 実行形態逸脱の検知条件と判別観点
created: 2026-09-14
updated: 2026-09-14
---

# bun test 実行形態逸脱の検知条件と判別観点

## 知識内容

bun test をスクリプト配置ディレクトリ等のリポジトリルート以外の cwd で起動すると、REPO_ROOT を cwd からの相対解決で求めるテストが環境依存 fail となる。対象パスを `./` なし表記（`.opencode/...` 等）で指定すると、bun test のパスフィルタが no test files matched となり 0 件実行となる。両逸脱はテストコードの欠陥や「問題なし」と誤認されやすいため、次の検知条件で実行形態逸脱を判別する。

逸脱時の検知条件と判別観点を次に示す。

1. **REPO_ROOT 解決系テストの fail**: repo root 以外の cwd 起動時に発生する。全件が環境依存 fail として観測され得る。fail が REPO_ROOT 相対解決を前提とするテストに集中している場合は、先に起動 cwd を疑う。リポジトリルート（main root または worktree root）からの再実行で切り分ける。
2. **no test files matched（0 件実行）**: bun test 出力に no test files matched が含まれ、実行件数が 0 件の場合は `./` なしパス指定の逸脱である。0 件実行は「問題なし」と誤読されやすい。「Ran N tests across M files」の件数確認を必ず行う。
3. **worktree node_modules 未伝播由来の依存解決失敗**: Cannot find package 等の依存解決失敗が worktree 環境で発生する場合がある。原因は node_modules が gitignore 対象で worktree へ未伝播であること。bun install 前置（または junction 代替）の要否を環境ラベル（依存パッケージ状態）で確認する。

正規の実行形態は「repo root 起 cwd + `./` 付き相対パス指定」に統一されており、契約は checker 実行契約 Design「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節が所有する。フル suite の 3 cwd 分割正規形（QG-4）は agentdev-quality-gates が正規所有する。

## 適用条件

- bun test をフル suite 正規形（3 cwd 分割実行）以外の形態（単独実行・ファイル単体指定）で実行する場合。
- bun test の fail が REPO_ROOT 解決系テストに集中し、環境依存 fail に見える場合。
- bun test の実行結果が 0 件（no test files matched）となった場合。
- worktree 環境で bun test の依存解決失敗（Cannot find package 等）が発生した場合。

## 適用対象

- case-run / case-close での bun test 実行・再実行手順と fail 由来分類。
- agentdev-quality-gates の QG-4 検証で bun test の実行形態を確認する工程。
- 本知識は実行形態逸脱の判別に限定する。fail 証跡の構造化取得（junit reporter）、timeout 由来分類、checker CLI の stdout ロスは別現象であり、関連知識を参照する。

## 根拠

- case 2766/2768/2777/2779: bun test の実行起点（cwd）とパス指定形式の非統一により、環境依存 fail と 0 件実行が繰り返し発生した（REQ-060 目的節）。
- 実行形態の一般規約が checker 実行契約 Design に配置されるまで、実行形態の知見は個別 case の運用に依存していた。逸脱検知条件の判別観点を再利用可能な形で整理した。

## 関連知識

- [bun test の fail 証跡は junit reporter で構造化取得する](bun-test-junit-reporter-evidence.md)（fail 証跡の構造化取得。fail 由来分類の証跡取得と併用）。
- [Windows + bun test の spawn timeout 由来分類と単独再実行手順](windows-bun-test-spawn-timeout-classification.md)（timeout 起因 fail の由来分類。実行形態逸脱由来の fail との判別）。
- [checker CLI の stdout 証跡が Windows + bun で失われる問題と安定実行経路](checker-cli-stdout-loss-on-windows-bun.md)（checker CLI 実行時の stdout ロス。bun test runner 出力とは別現象の判別）。
- 規範面の所在: [checker 実行契約と検出基盤規則](../designs/integrity/checker-execution-contracts.md)「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節（実行形態の正規契約と逸脱時の検知条件）。
