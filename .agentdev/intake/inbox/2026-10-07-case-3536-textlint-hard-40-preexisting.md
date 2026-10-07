# textlint final gate の hard violations 40 件（pre-existing）の別課題処理を Epic レベルで確定する

## 内容

textlint final gate の hard violations 40 件は main HEAD と同一の pre-existing であり、Wave 2 系各 PR（#3542・#3543 等）では集合完全一致（新規 0 件）で合格扱いとして継続している。Epic #3530 の完了条件「共通必須品質統制」（check_integrity・generate_indexes・traceability・textlint guard が全統制 exit 0）は Epic レベル（Issue 3538）で判定されるため、40 件残存のままでは Epic 完了条件の textlint 部分が未充足の状態になる。

- 40 件の内訳は既存 docs・配布物ファイルの違反で、Wave 2 の変更対象外ファイルに属する
- Wave 2-1〜2-4 の case-close では「本変更行由来 0 件」（worktree hard 集合 = main hard 集合の突合）を合格基準として処理してきた

## 影響

Epic #3530 完了条件の「全統制 exit 0」が textlint guard 部分で満たせず、Issue 3538 の Epic 完了判定時に全量解消または達成根拠の別構成が必要になる。放置すると pre-existing 40 件が後続変更のたびに集合突合の対象として残り続ける。

## 提案

Issue 3538（Wave 3 横断検証）で 40 件の解消方針を確定する（一括修正するか、Epic 完了条件の達成根拠として pre-existing 分類と解消計画を記録するか）。一括修正する場合は docs・配布物の 40 件を対象とする専用変更単位を Wave 3 に含め、textlint guard exit 0 を Epic レベルで成立させる。

## 根拠

Epic #3530 Wave 2-4（Issue 3536）の PR 本文 Findings 節と case-close 対応記録コメントの textlint 検証差分行（worktree hard 40 = main hard 40 集合完全一致）。Wave 2-1（#3533）・2-3（#3535）の対応記録コメントで同一の集合一致結果が継続している。

https://github.com/yogata/agent-dev-flow/pull/3543
