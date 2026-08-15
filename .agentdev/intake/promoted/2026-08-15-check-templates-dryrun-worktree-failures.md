# check_templates.ts の --dry-run 系テスト3件の worktree 環境依存失敗

## 観測内容

check_templates.ts の --dry-run 系テスト3件が base ブランチから失敗しており、worktree 配置の templates 参照解決が環境依存になっている。

## 影響

- worktree 環境でテストが恒常失敗し、新規失敗との判別が都度手作業になる
- テストの自動化価値が低下する

## 課題

worktree 配置でも templates 参照が解決されるようパス解決を修正するか、環境差を吸収する test 設計へ変更する。

## 既存要件・成果物との関連

- 対象: check_templates.ts の --dry-run 系テスト3件
- 関連: lint_skills.ts src/ フォールバック（同種問題、promoted item 2026-08-15-lint-skills-src-fallback-missing）

## 出典

- 発生日: 2026-08-15
- 取得元: テスト実行時の観測
- 元 item: intake-2026-08-15-check-templates-dryrun-worktree-failures.md
