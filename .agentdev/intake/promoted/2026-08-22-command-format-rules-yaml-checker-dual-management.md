# command-format-rules.yaml と check_command_format.ts の検出パターン二重管理（checker への yaml 読込統合の検討）

## 観測内容

REQ-047（PR #2377、Issue #2373）の所有権整理で、`.opencode/skills/repo-agentdev-integrity/data/command-format-rules.yaml` と `check_command_format.ts` が同一規則の検出パターンを独立に保持する二重管理状態を確認した。ヘッダーの誤った消費者宣言（「Consumed by: check_command_format.ts」— 実際には読んでいない）を実態（check_workflow_preventive.ts check 7 が yaml 自体を検証）へ訂正し、同期条件を明記済み。

checker への yaml 読込統合による一元化は checker 実装の構成変更を伴い、一方向化の完了条件（REQ-047-005: 既存 checker の外部契約を必要なく変更しない）との併存判断を要するため、case-close の capture 時点では回収・保存のみ実施。

## 影響

検出パターン追加・変更時に yaml と checker の二箇所更新が必要な状態が続く（check 7 の yaml 検証は yaml 側の様式検証であり、checker 側パターンとの一致保証ではない）。

## 課題（レビューで決めること）

- yaml への checker 読込統合（一元化）を進めるか、二重管理＋同期条件明示（現状）を維持するか

## 既存要件・契約との関連

- REQ-047（規則所有権の一方向化）、特に REQ-047-005（既存 checker の外部契約不変更）との両立判断。
- 関連 item: distribution-targets.yaml の読込統合か廃止かの設計判断（2026-08-22、同系統の二重管理課題）。

## 根拠

- PR #2377 本文「Findings / Capture候補」intake 2
- .opencode/skills/repo-agentdev-integrity/data/command-format-rules.yaml ヘッダー
