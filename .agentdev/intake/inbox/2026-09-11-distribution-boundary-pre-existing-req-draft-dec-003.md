# 配布依存境界 pre-existing 1 件の段階解消（req-draft.md:118 concrete-id DEC-003）

## 概要

case 2771 の case-close 配布依存境界 最終 gate（check_distribution_boundary.ts --profile source、PR HEAD worktree 検査対象）で base 由来 pre-existing 1 件が検出された。`src/opencode/commands/agentdev/templates/req-define/req-draft.md:118` の concrete-id 参照（matched=DEC-003、snippet「欠落時に後続工程は draft を拒否しない（soft contract、DEC-003）」）。case 2771 の PR 変更 10 ファイルには含まれず、main root（38f0cae5、ワークツリー変更ゼロ環境）で同一 failure の再現を機械確認済み（変更由来でないことを確認）。次回段階解消 case の対象選定材料。

## 内容

- `src/opencode/commands/agentdev/templates/req-define/req-draft.md` L118 の concrete-id（DEC-003）を、配布物として consumer 側で解決可能な一般化表現（契約名・節名参照等）へ置換する
- 既存の配布物内部参照段階解消 case（case 2766 系の IR-055 baseline 段階解消 intake item: 2026-09-11-ir055-baseline-staged-remediation.md）と同一の運用系統。次回段階解消 case で同時処理可能

## 根拠

- 観測元: PR 2772（case 2771 / issue 2771、`## Findings / Capture候補` の distribution-boundary 節）、case-close（2026-09-11）で回収
- 元テキスト: 「case-close 最終 gate（STEP-3、--profile source、検査対象 PR HEAD worktree babaedb2）: PR 変更由来の違反 0 件。base 由来 pre-existing 1 件を検出（src/opencode/commands/agentdev/templates/req-define/req-draft.md:118 concrete-id DEC-003）。main root（38f0cae5、ワークツリー変更ゼロ環境）で同一コマンド再実行により同一 failure の再現を確認済み（変更由来でないことを機械確認。本 PR 変更ファイル 10 件に当該ファイルは含まれない）」
- case-close 再確認: main root での同一 failure 再現を機械確認済み（本 intake item の概要に記載のとおり）
