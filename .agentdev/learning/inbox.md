# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-09 bun test は repo root から dot-directory 配下の test を位置フィルタで発見できない

- **発生源**: PR #2717（Issue #2708 / OU-009）テスト結果
- **クラス**: ツール制約（反復的誤実行の予防）

`bun test` を repo root で実行した場合、位置フィルタ指定でも `.opencode/` 等 dot-directory 配下の test file が発見対象にならない。`.opencode/skills/repo-agentdev-integrity/scripts/` の test suite を実行する場合は scripts dir を cwd として起動する必要がある（case-run 3 cwd 分割実行の契約と整合）。

## 2026-09-09 worktree への node_modules 非伝播で integrity suite が環境起因 fail する

- **発生源**: PR #2718（Issue #2706 / OU-007）、PR #2717（Issue #2708 / OU-009）テスト結果
- **クラス**: 環境前提（worktree 構造的制約）

git worktree には root の node_modules が伝播しないため、worktree で integrity suite を実行すると `Cannot find package 'zod'`（extension_state.ts import）等の import 失敗が発生する。加えて junction 未伝播の worktree では IR-055 delta-from-baseline テストが baseline パス変換のずれで未編集ファイルを「新規違反」として検出し fail する（変更ゼロの baseline commit で再現確認済み、main root では不発生）。bun install の安易な実行は tsconfig 系ファイル書き戻しリスク（AGENTS.md 警告規定）を伴うため、worktree でフル suite を実行する際はこの既知の環境依存を前提に結果を解釈する。

## 2026-09-09 Windows/Bun のオフライン配布 bundle は target:node 生成と // @bun バナー除去を固定する

- **発生源**: PR #2729（Issue #2724 / Epic #2723 W1）テスト結果
- **クラス**: 環境前提（配布 bundle 生成条件）

Windows/Bun 環境で配布用の単一 ESM bundle を作る場合、`target: node` で生成し、`// @bun` バナーを除去しないと consumer 側で UTF-8 parse error になる。今後のオフライン bundle 作成時は生成条件（target 指定とバナー除去）を固定し、配布同梱前に consumer 実行系での起動を検証する。
