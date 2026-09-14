# check_distribution_boundary 実行時の distribution-targets.yaml 読込 warning（base でも発生）

## 概要

case-run 提供 runner（check_distribution_boundary_cli.ts）の実行時に stderr へ `fail-closed: distribution targets file is not valid YAML (.opencode\skills\repo-agentdev-integrity\data\distribution-targets.yaml)` が出力される。検査本体は動作し JSON stdout は正常（exit code も契約どおり）だが、base main 実行でも同一出力が観測される。distribution-targets.yaml の解決・読込状態（パス解決の妥当性、YAML 形式、警告と検査結果の関係）の調査候補。

## 内容

- `.opencode/skills/repo-agentdev-integrity/data/distribution-targets.yaml` の読込経路と YAML 妥当性の確認
- stderr warning が検査結果（failures/stats）に影響しないことの確認（現状は JSON 出力正常・scanned_files 343 で実害なしと判断）
- Windows パス区切り（バックスラッシュ混在表示）と file 解決の関係確認

## 根拠

- 観測元: case 2796 Wave 1 / case 2797（DEL-2797-3、PR #2801）本文 Findings（intake 候補）、case-close（2026-09-14）で回収
- 元テキスト: PR #2801 本文 Findings/Capture候補「case-run 提供 runner の実行時に stderr へ fail-closed: distribution targets file is not valid YAML が出力される（base main 実行でも同一出力、検査本体は動作し JSON stdout は正常）。distribution-targets.yaml の解決・読込状態の調査候補」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
