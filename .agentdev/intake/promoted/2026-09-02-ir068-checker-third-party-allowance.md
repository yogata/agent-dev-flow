# IR-068 checker の third-party Skill 許容拡張

## 観測内容

PR #2528 で skill-projection-manifest から japanese-tech-writing（third-party 取得機構経由配置・src 非存在）を除外した結果、junction 環境（メインリポジトリ）の check_integrity --profile source で jtw が projection-extra として検出され続ける（Skill warning、既知残存）。checker の third-party 許容拡張（検出ロジック・IR-068 exemption 節の更新）は checker 仕様変更に該当し REQ-057 対象外のため未実施。jtw の非対象化は third-party-skill-management.md「取得プロファイル」節へ恒久記録済み。

checker 検出ロジック・exemption 節の変更は REQ-057 の対象外規定（checker 仕様変更は対象外）に触れるため、本バッチでは実施しない判断だった。

## 影響

メイン環境の check_integrity --profile source で jtw projection-extra が warning として継続検出され、baseline/既知残存との区別が必要な状態が続く。

## 課題（レビューで決めること）

- checker（distribution-boundary / IR-068 関連検査）の third-party 取得機構経由配置の許容拡張の要否と仕様
- 許容拡張時の exemption 節・検出ロジック更新と検証手段

## 既存要件・契約との関連

- IR-068（skill-projection-manifest 突合）、distribution-boundary Design、third-party Skill 管理 Design（docs/designs/local/third-party-skill-management.md「取得プロファイル」節の恒久記録）、DEC-023（third-party Skill の分離管理、proposed）。
- 関連 item: worktree junction 環境での skill-projection-manifest 突合検出差分の扱い（2026-09-01、同一検査の環境差扱い課題）。

## 根拠

- PR #2528 本文「Findings / Capture候補」finding 2（回収元: https://github.com/yogata/agent-dev-flow/pull/2528 ）
