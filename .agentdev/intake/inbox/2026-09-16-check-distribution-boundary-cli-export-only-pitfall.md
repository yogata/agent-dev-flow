# check_distribution_boundary_cli.ts は export-only モジュールで CLI 起動時無出力・exit 0

## 内容

`check_distribution_boundary_cli.ts` は export-only モジュールであり、`bun check_distribution_boundary_cli.ts --profile source` の形態で CLI 起動しても何も出力せず exit 0 で即終了する（Case #2846 F-003）。CLI 起動形式を誤っても成功扱いになるため、検証を誤認するリスクがある。正しい起動は check_distribution_boundary.ts（検査本体）経由であることは checker 実行契約 Design に記載があるが、cli.ts というファイル名が誤起動を誘発しやすい。

## 提案

checker 実行契約（docs/designs/integrity/checker-execution-contracts.md）への注意追記、または cli.ts ファイルのエントリポイント化 / リネーム（命名規約の明確化）を検討する。

## 根拠

- 観測元: PR #2879 本文 Findings F-003（Case #2846 case-close 対応記録）
- 観測時 commit: PR #2879 head
- 対象: .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary_cli.ts

## 分類

- 分類: intake（命名・契約注意の改善候補）
- 変更種別: docs または scripts（注意書きが軽微、リネームは影響評価必要）
- 優先度: 低（検証誤認の予防として軽微な修正で解消可能）
