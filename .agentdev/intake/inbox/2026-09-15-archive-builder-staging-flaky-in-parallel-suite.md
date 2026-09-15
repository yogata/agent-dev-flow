# archive-builder staging path テストのフルスイート並列実行時不安定

## 内容

`trusted-distribution-gate/launcher-blockers.test.ts` の archive-builder staging path テスト（same-filesystem staging / parent blocker #2）が、bun test フルスイート並列実行時のみ不安定で fail する。単独実行では worktree・main とも green（17 pass / 0 fail）。一時ディレクトリ競合が推定される。

## 提案

並列実行時の staging path 競合の切り分け（テスト内一時ディレクトリの分離、環境変数 TMP の個別化、または並列実行での該当テストの隔離）。flaky test として分類し、変更起因 fail と誤認されるノイズを解消する。

## 根拠

- 観測元: PR #2872 本文 Findings（Case #2870 case-run 検証、main checkout 読取専用再実行で比較確認）および case-close での full integrity suite 再実行
- 観測時 commit: b85c179d（PR #2872 head）/ main HEAD 5d2f297b
- bun test split 1: `(fail) archive-builder / same-filesystem staging (parent blocker #2) > staging path is created UNDER outputRoot, never under os.tmpdir()`（単独実行は green、フルスイート時のみ再現）

## 分類

- 分類: intake（具体的修正対象あり: launcher-blockers.test.ts の一時ディレクトリ競合）
- 変更種別: tests（flaky test の切り分け・安定化）
- 優先度: 低（環境依存・単独実行 green。スイート実行時のノイズ解消候補）
