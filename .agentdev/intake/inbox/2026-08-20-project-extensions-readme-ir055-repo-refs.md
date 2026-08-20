# agentdev-project-extensions scripts README の repo-* 参照による IR-055 delta 違反

## 観測
マージ後 main（abb13c1d）で repo-agentdev-integrity フル suite を実施した結果、`src/opencode/skills/agentdev-project-extensions/scripts/README.md` の `repo-local`（2箇所）・`repo-agentdev-integrity`（1箇所）参照が IR-055「runtime-unresolved-reference」delta from baseline 違反（ng / strict）3件として検出された。PR #2355 で新規追加された配布物ファイル。

## 今回扱わない理由
PR #2355 の case-run は配布側サブセットテストのみ実施しフル integrity suite を未実施、配布依存境界 gate（check_distribution_boundary.ts）は concrete ID / concrete path 検出が主体で `repo-*` トークンは IR-055（check_integrity.ts）の管轄のため、マージ前は検出されなかった。case-close のマージ後検証で初検出。Issue #2352 の完了条件（6項目）には IR-055 / README 記載に関する項目が含まれない。

## 影響
マージ後 main の `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/` が 2 fail のうち1件（IR-055 実修復回帰、新規違反3件）で red。配布物が consumer 環境で持たない repo-local 成果物を参照している。

## レビューで決めること
- README.md の該当3箇所を repo-local 参照を含まない一般化した記述へ修正する（PR #2355 自身が他ファイルで実施したのと同様のコメント一般化）。
- あわせて配布側 scripts を追加する PR でのフル integrity suite 実施を品質統制に明示するか（learning inbox の別エントリと合わせて判断）。

## 根拠
- case-close マージ後検証: check_integrity.ts --json（failures: runtime-unresolved-reference × 3、file: src/opencode/skills/agentdev-project-extensions/scripts/README.md）
- PR 2355（該当ファイルの追加元: https://github.com/yogata/agent-dev-flow/pull/2355）、Epic 2351 Wave 1 クローズ
