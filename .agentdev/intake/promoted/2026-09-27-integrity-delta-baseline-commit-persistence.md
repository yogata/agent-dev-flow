# intake 採用済み成果物: integrity suite delta baseline commit（bac3ca4b...）の永続化・ラベリング方針

- 観測日: 2026-09-27
- 観測元: learning-promote E12（Case #3158 case-close QG-4。ユーザー承認により intake 起票）
- 種別: 対象範囲の新規決定候補（学び処分〔knowledge 昇華〕とは独立）
- 分類確定: 採用（intake-promote 2026-09-27・adversarial-review 2 stream 収束・自律確定）

## 観測内容

- case-close QG-4 の IR-055 runtime-unresolved-reference delta 回帰テストが参照する delta baseline object `bac3ca4b...` がワークツリーから参照不能（fatal: bad object。main 現行 clone で git cat-file 実測）となった。テストは継続動作し、参照可能範囲での比較結果（PR 変更対象外ファイル由来の検出 2件）を報告した
- repo 内ソースに bac3ca4b への静的参照は存在しない（baseline は動的に生成・取得される。参照不在は adversarial-review で grep 検証済み）

## 影響

- delta 比較の基準 commit がクローン内に存在しない場合、比較が参照可能な範囲へ無言に劣化する（silent degradation・fail-closed でない）。fail の由来分類（pre-existing 判定）に baseline 再現（detached worktree・main root の3点確認）を要するコストが QG-4 実行時に毎回発生する

## 課題（検討対象・adversarial-review 反映後）

0. 前置: baseline object が参照不能になった原因の特定（gc による pruning・shallow/partial clone・fetch 不足のいずれか。原因次第で以下の適切解が変わるため、対策選定の前に実施）
1. delta baseline commit の fetch/refspec 永続化
2. ラベル・タグ付けによる参照可能性の保証
3. 参照不能時のテストスキップまたは明示的警告への変更（silent degradation の解消）

## 既存要件との関連

- Case #3158、PR #3160、check_integrity.test.ts、Issue #1782（IR-055）
- 知識側（由来分類手順）: docs/knowledge/qg4-baseline-detached-worktree-reproduction.md（当該文書は本件を「対象外: delta baseline commit object の永続化・ラベリング方針（別途 intake 起票済み）」と明示し分離済み）
