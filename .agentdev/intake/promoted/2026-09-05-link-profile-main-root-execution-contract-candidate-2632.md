# link profile の実効実行要件の明記

## 観測内容
PR #2632（Issue #2628）の最終検証で、worktree 内では junction 未伝播により link profile が concrete-id 0件の無効実行になり得ることが記録された。

## 影響
無効な検証結果を有効な採証と誤認し、配布依存境界の検査を取りこぼす可能性がある。

## 課題
checker 実行契約へ、main root からの読取専用実行、環境ラベル記録、worktree 内実行の制約を明記する。source/link profile の対比表も検討する。

## 既存要件・正規成果物との関連
PR #2632（b6a90fe4）、最終検証 Report §5.3、REQ-018、checker-execution-contracts Design。
