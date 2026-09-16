# archive-builder staging path テストのフルスイート並列実行時不安定（flaky test の切り分け）

## 観測内容

`trusted-distribution-gate/launcher-blockers.test.ts` の archive-builder staging path テスト（same-filesystem staging / parent blocker #2）が、bun test フルスイート並列実行時のみ不安定で fail する。単独実行では worktree・main とも green（17 pass / 0 fail）。一時ディレクトリ競合が推定される。

- 再現テスト: bun test split 1 `(fail) archive-builder / same-filesystem staging (parent blocker #2) > staging path is created UNDER outputRoot, never under os.tmpdir()`

## 影響

- フルスイート実行時に変更起因 fail と誤認されるノイズが継続する（CI・case-close の full integrity suite 再実行で再発し得る）

## 課題（対応候補と判断材料）

- テスト内一時ディレクトリの分離（staging path 競合の切り分け）
- 環境変数 TMP の個別化
- または並列実行での当該テストの隔離（flaky test 分類）
- 対応時は単独実行 green・フルスイート時のみ再現という特性から、検証はフルスイート実行で行うこと

## 既存要件との関連

- trusted-distribution-gate の checker 回帰テスト群。並列実行時の分離要件を持つテスト設計の改善候補

## 根拠

- 観測元: PR #2872 本文 Findings（Case #2870 case-run 検証、main checkout 読取専用再実行で比較確認）および case-close での full integrity suite 再実行
- 観測時 commit: b85c179d（PR #2872 head）/ main HEAD 5d2f297b
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: 修正対象が具体的で PR 記録により裏付け。優先度低）
