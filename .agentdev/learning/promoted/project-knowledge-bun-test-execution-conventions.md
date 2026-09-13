# bun test 実行形態の統一（cwd 起点・パス指定形式）

## 背景

case 2766 / 2768 / 2777 / 2779 で、bun test の実行起点（cwd）とパス指定形式の非統一により、環境依存 fail・テスト未実行が繰り返し発生した。QG-4 フル suite 正規形（3 cwd 分割実行）は品質統制側で規定済みだが、単独実行・ファイル単体指定時の規約は知識として未整備だった。

## 問題

- bun test は REPO_ROOT を cwd からの相対解決で求めるテスト（issue_tracking_list 等）を含み、scripts 配下等 repo root 以外を cwd にすると誤動作する（case 2768: 8 fail / 4 errors、全件環境依存）
- bun test のパスフィルタは `./` 付き相対パスとして解決されるため、`./` なしの `.opencode/...` 表記では「no test files matched」となり 0 件実行になる（case 2779）
- worktree では node_modules 欠落が同時リスク（case 2768）

## 望ましい変更

bun test の実行形態契約として「repo root 起 cwd + `./.opencode/...` 形式（ファイル単体指定も `./` 付き）」への統一を知識文書化し、検証手順のテンプレートに明記する。逸脱時は REPO_ROOT 解決系テストの失敗・no test files matched 出力から気付ける条件を併記する。

## 対象範囲

- 対象: bun test による integrity suite 実行（フル suite・単独・ファイル単体）、worktree でのテスト実行
- 対象外: QG-4 フル suite 正規形の変更（既存契約の補完であり再定義ではない）、bun 以外のテストランナー

## 反映先候補

| 種別 | パス | 変更内容 |
|---|---|---|
| Design | docs/designs/integrity/checker-execution-contracts.md | bun test 実行形態契約への「repo root 起 cwd・`./` 付きパス指定」明記 |
| knowledge | docs/knowledge/（新規知識文書） | bun test 実行規約の知識文書化（QG-4 正規形への参照を含む） |
| reference | src/opencode/skills/agentdev-quality-gates（QG-4 関連 references） | 単独実行・ファイル単体指定時の正規形参照 |

## 既存対策確認

- 確認結果: 部分的に既存（QG-4 フル suite 正規形は存在）
- 該当ファイル: src/opencode/skills/agentdev-quality-gates/、src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md
- ギャップ分類: load miss
- ギャップ詳細: フル suite 正規形は存在するが、単独実行・ファイル単体指定の cwd・パス形式規約が知識として未整備。再発が 5 件観測されている

## 制約

- QG-4 正規形の所有権（agentdev-quality-gates）を侵食しない。本知識は正規形への参照・補完に留める
- bun の仕様変更時は本規約の前提ごと再評価する

## 受け入れ条件

- [ ] bun test 実行形態（repo root 起 cwd・`./` 付きパス指定）が知識文書または実行契約に明記されている
- [ ] フル suite 正規形（QG-4）と矛盾しない
- [ ] 逸脱時の検知条件（REPO_ROOT 解決系 fail・no test files matched）が併記されている

## 元learning item / 根拠

- 要約: bun test の cwd 依存・パスフィルタ仕様による環境依存 fail とテスト未実行の再発
- 根拠: inbox 2026-09-11（CWD 起点実行で 8 fail/4 errors、repo root 起で 2565 pass/0 fail）、2026-09-12（worktree で scripts 配下 cwd 誤動作、`./` なしパスで 0 件実行）+ deferred 2026-09-05（cwd 依存と dot ディレクトリ既定探索）、deferred 2026-09-04（位置引数フィルタは ./ prefix 付きでのみマッチ）。計5件の発生
- 再発条件: repo root 以外を cwd にした実行、`./` なしパス指定、worktree での node_modules 未整備実行
- 横展開可能性: repo root 相対パスを前提とする検査系スクリプト・テスト全般

## 推奨Issue分類

- 分類: feature（運用知識の整備）
- 推奨ラベル: documentation, agentdev
- 関連Issue: なし（case 2766/2768/2777/2779 の集約知見）
