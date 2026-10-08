# textlint final gate の hard violations 40 件（pre-existing）の解消方針を確定する

統合元: 2026-10-07-case-3536-textlint-hard-40-preexisting.md

## 観測内容

textlint final gate の hard violations 40 件は main と同一の pre-existing であり、Wave 2 系各 PR では集合完全一致（新規 0 件）で合格扱いとして継続してきた（2026-10-08 実測: 566 ファイル検査・hard 40 件・FAIL。worktree と main の集合一致を Wave 2-1〜2-4 の case-close で確認済み）。

40 件の内訳は大きく 2 系統（adversarial-review 2 stream の独立実測から）:

- prh 用語系 約 25 件: baseline 12 件（DEC-029・IR-072・文書種別責務・REQ-061・REQ-062・REQ-083）+ RA-010 変更由来の完全形「Definition Amendment PR」docs 10 行 + src 配布物・その他
- 文字品質系 約 15 件: sentence-length 等

Epic #3530 の完了条件「共通必須品質統制」（check_integrity・generate_indexes・traceability・textlint guard が全統制 exit 0）は Epic レベル（Issue 3538）で判定される。Issue 3538 の完了時点でも 40 件残存の状態であり、Epic 完了条件の textlint 部分の達成根拠が別構成のまま残っている。

## 影響

Epic 完了条件の「全統制 exit 0」が textlint guard 部分で満たせず、Issue 3538 の Epic 完了判定時に全量解消または達成根拠の別構成が必要になる。放置すると pre-existing 40 件が後続変更のたびに集合突合の対象として残り続ける。

## 課題（backlog-review → req-define 向け）

40 件の解消方針を確定する: (a) 一括修正する（docs・配布物の 40 件を対象とする専用変更単位を組む）、(b) pre-existing 分類と解消計画を達成根拠として記録する、のいずれか。

依存関係: prh 用語系 25 件の解消は 2026-10-08-terminology-policy-scope-definition-amendment-pr.md（用語政策の適用境界確定）の政策判断に依存する。政策結論（要件行・定義箇所の許容、baseline 例外登録の可否）が一括修正の対象範囲を確定するため、用語政策の論点を先行または同時確定する。

進捗管理機構: learning promoted「existing-measure-update-verification-diff-checker-mandatory-elements.md」（textlint hard findings 集合の JSON 実測退避を検証差分の必須要素化）が 40 件の集合突合・進捗管理と直接交差する。backlog-review で同時処理対象として扱うこと。

## 元 observation（参照）

- https://github.com/yogata/agent-dev-flow/pull/3543（Wave 2-4・Issue 3536 Findings・worktree hard 40 = main hard 40 集合完全一致）
- Wave 2-1（#3542）・2-3（#3541）の対応記録コメントで同一の集合一致結果が継続
