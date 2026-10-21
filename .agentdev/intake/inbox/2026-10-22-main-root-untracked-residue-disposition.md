# main root の既存未追跡残存の運用処置（gitignore 追加 または 承認一覧登録）

- **出典**: PR #3843 本文 Findings（Case #3841 case-close 時の Capture 回収。実測は case-close 前回実行時の IR-073 関連観測）
- **内容**: main root には `.tmp-jev-analysis/`、`src/common/tools/agentdev-gh/tests/tmp-runner-cli-*/`、`.local/` 等の未追跡かつ gitignore 管理対象外の残存が観測されている。IR-073（check_integrity 未追跡残存検査）の恒常運用が main root 起点で始まると NG 検出（exit 1）となる
- **必要な判断**: 対象パスごとに (a) 正規の非追跡領域であれば `.gitignore` へ追加、(b) 恒久的な許容であれば `baselines/ng-baseline.json`（category=UntrackedResidue / check=untracked-residue / file=<対象パス>）へ provenance 付きで人間の運用判断による明示登録、(c) 削除可能な残骸であれば削除、のいずれかを運用判断として決定する
- **注意**: 検査実行が承認を自動追加することはない（IR-073 契約）。承認登録には provenance（起因の由来、正当化の参照先、適用日）が必須
- **関連**: REQ-010-084、docs/designs/integrity/rules/IR-073-untracked-residue.md、Issue #3841（closed）、PR #3843
