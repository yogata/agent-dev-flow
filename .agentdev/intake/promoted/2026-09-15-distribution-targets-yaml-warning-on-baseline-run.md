# check_distribution_boundary 実行時の distribution-targets.yaml 読込 warning（base でも発生）

## 観測内容

case-run 提供 runner（check_distribution_boundary_cli.ts）の実行時に stderr へ `fail-closed: distribution targets file is not valid YAML (.opencode\skills\repo-agentdev-integrity\data\distribution-targets.yaml)` が出力される。検査本体は動作し JSON stdout は正常（exit code も契約どおり）だが、base main 実行でも同一出力が観測される（main 由来）。

## 影響

- 現状は実害なし（JSON 出力正常・scanned_files 343・failures 正常）だが、警告ノイズとして毎回出力され続ける

## 課題（対応候補と判断材料）

- `.opencode/skills/repo-agentdev-integrity/data/distribution-targets.yaml` の読込経路と YAML 妁当性の確認
- stderr warning が検査結果（failures/stats）に影響しないことの確認
- Windows パス区切り（バックスラッシュ混在表示）と file 解決の関係確認

## 既存要件との関連

- 配布依存境界 gate（check_distribution_boundary.ts）: warning の発生源

## 根拠

- 観測元: case 2796 Wave 1 / case 2797（DEL-2797-3、PR #2801）本文 Findings（intake 候補）、case-close（2026-09-14）で回収
- 処分経緯: intake-promote（2026-09-15）で採用を確定（ユーザー承認）
