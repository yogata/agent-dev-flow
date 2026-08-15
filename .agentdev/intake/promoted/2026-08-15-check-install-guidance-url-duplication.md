# check/install スクリプトの案内文言・既定 URL 定数の二重管理解消

## 観測内容

check-consumer-opencode.ps1 と install-consumer-opencode.ps1 の両方が、チェックアウト未検出時の案内文言と既定 URL 定数を個別に保持しており二重管理になっている。OU-002 で check 側をチェックアウト前提へ更新した際、install 側とのずれが明確化した。

item が前提とした「OU-001/OU-003 取り込み後」の状態は成立済み（PR #2131/#2132 マージ、install スクリプトのウィザード・ヘルプ文言がチェックアウト済み前提へ更新されていることを intake-promote が実ファイル検証済み）。

## 影響

- 両スクリプトで案内文言・URL 定数が独立に陳腐化するリスクが残る
- 将来の URL 変更時に片側のみ更新される不一致が発生し得る

## 課題

案内文言と既定 URL 定数の共有化（共通モジュール化または単一定義参照）を検討し、二重管理を解消する。対応要否・優先度は backlog-review で判断する。

## 既存要件・成果物との関連

- 対象: scripts/check-consumer-opencode.ps1、scripts/install-consumer-opencode.ps1
- 関連: OU-001（Issue #2128、PR #2131）、OU-002（Issue #2129）、OU-003（Issue #2130、PR #2132）

## 出典

- 発生日: 2026-08-15
- 取得元: case-close Capture 回収（OU-002 実施過程の観測）
- 元 item: intake-2026-08-15-check-install-guidance-url-duplication.md
