# intake: integrity suite delta baseline commit（bac3ca4b...）の永続化・ラベリング方針

- 観測日: 2026-09-27
- 観測元: learning-promote E12（Case #3158 case-close QG-4。ユーザー承認により intake 起票）
- 種別: 対象範囲の新規決定候補（学び処分〔knowledge 昇華〕とは独立）

## 候補: delta baseline commit オブジェクトの永続化またはラベリング方針の検討

- **実観測事実**: case-close QG-4 の IR-055 runtime-unresolved-reference delta 回帰テストが参照する delta baseline object `bac3ca4b...` がワークツリーから参照不能（fatal: bad object）となった。テストは継続動作し、参照可能範囲での比較結果（PR 変更対象外ファイル由来の検出 2件）を報告した
- **問題構造**: delta 比較の基準 commit がクローン内に存在しない場合、比較が参照可能な範囲で動作するため、fail の由来分類（pre-existing 判定）に baseline 再現（detached worktree・main root の3点確認）を要するコストが発生する
- **検討対象**: (i) delta baseline commit の fetch/refspec 永続化、(ii) ラベル・タグ付けによる参照可能性の保証、(iii) 参照不能時のテストスキップまたは明示的警告への変更、のいずれかまたは組み合わせ
- **関連**: Case #3158、PR #3160、check_integrity.test.ts、Issue #1782（IR-055）、learning promoted/knowledge-qg4-pre-existing-baseline-reproduction.md（由来分類手順の知識化側）
