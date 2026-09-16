# check_distribution_boundary_cli.ts は export-only モジュールで CLI 起動時無出力・exit 0

## 観測内容

`check_distribution_boundary_cli.ts` は export-only モジュールであり、`bun check_distribution_boundary_cli.ts --profile source` の形態で CLI 起動しても何も出力せず exit 0 で即終了する（Case #2846 F-003）。CLI 起動形式を誤っても成功扱いになるため、検証を誤認するリスクがある。正しい起動は check_distribution_boundary.ts（検査本体）経由であることは checker 実行契約 Design に記載があるが、cli.ts というファイル名が誤起動を誘発しやすい。

2026-09-16 時点の再実査: 当該ファイルは `export function runCli(): void` を定義するが top-level での呼び出しを持たず、直接実行しても無出力・exit 0 になる構造は不変。

## 影響

- 検証担当が正規の検査を実行したつもりで無検証のまま成功扱いになるリスク（検証誤認の予防が必要な状態）

## 課題（対応候補と判断材料）

- checker 実行契約（docs/designs/integrity/checker-execution-contracts.md）への注意追記
- または cli.ts のエントリポイント化（top-level での runCli 起動）／リネーム（命名規約の明確化）— 軽微な docs 対応と scripts 対応の選択は採用時に確定する

## 既存要件との関連

- checker 実行契約 Design（check_distribution_boundary 系の正規起動形）: 注意追記の対象
- REQ-047 系（checker 実行契約）

## 根拠

- 観測元: PR #2879 本文 Findings F-003（Case #2846 case-close 対応記録）
- 観測時 commit: PR #2879 head（merge 後 main 2098a9d9）
- 対象: .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary_cli.ts
- 2026-09-16 再検証: runCli が export-only で top-level 呼び出し不在を確認
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: 構造が実査で確認済み。優先度低）
