# senpi guard-connection の試験の1件不合格（ADF簡素化調査 N-08）

## 観測内容

- 評価用の worktree（コミット e0f551be、場所は Temp 配下）で `bun test ./src/` を実行したところ、2,008試験のうち `src/senpi/plugins/agentdev-guard-connection/tests/guard-connection.test.ts` 159行の1件のみが不合格（2007合格・終了コード1）。
- 実装の読解では、`distribution-boundary-guard-paths.ts` の `isApprovedTemporaryPath` が一時領域の判定を先に行うため、projectRoot の外のパスの分類を試験が期待する経路に到達しない（実装は変更していない）。
- 通常の配置での比較は未実施。

## 影響

- senpi guard-connection の試験 1件が worktree 環境で不合格し、通常配置での再現性が未確認。合格するなら環境条件の明記だけで済み、どの環境でも不合格するなら実装か試験のどちらかの不整合として扱う必要がある。

## 課題

- 通常の位置に checkout した環境での追試が前提。合格するなら環境条件の明記だけで済む。どの環境でも不合格するなら実装か試験のどちらかの不整合として扱う。

## 既存要件との関連

- evidence: 2026-11-14 調査の `qg4-split2-src-all-post` 記録
