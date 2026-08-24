# main HEAD 由来の pre-existing NG 13 件（Wave 2 時点の内訳確定）

## 観測

PR 2433（Issue 2429、OU-002）の check_integrity 全体実行（--profile source）で、本変更起因の新規 NG は 0 件だが、main HEAD 起点の pre-existing 13 NG が残存する（メイン root 同一実行で同一 13 件を確認済み）。内訳: `docs/guides/consumer-project-setup.md` の broken-file-link 5 件（`../specs/local/*` 旧パス参照）、`design-save.md` / `artifact-contries.md` の workflow-status-prohibition 2 件、`agentdev-issue-tracking`（SKILL.md・references/operations.md）・`agentdev-workflow-issue`（SKILL.md）の TODO マーカー 3 件、`DEC-022.md` の phantom REQ 行引用 1 件（REQ-046-004 retire 由来）、`skill-projection-manifest.yaml` の src-only スキル 2 件（agentdev-issue-tracking / agentdev-workflow-issue の manifest 未登録）。

## 今回扱わない理由

いずれも PR 2433 の変更対象外（main HEAD 起点）。Wave 1（PR 2432）由来の残課題の可能性が高く、既存 intake（2026-08-24-unmanaged-ng-20-preexisting-origin-main.md）の追跡対象と重なる。

## 影響

13 NG は baseline 比較で新規違反 0 件の担保のもと警告的に扱われている。broken-file-link 5 件は docs-check の案内品質を損なう。放置すれば Wave 3（OU-004）以降の docs-check 実行で常に再報告される。

## レビューで決めること

- Wave 1 capture の 20 件からの経過（20 → 13 に減少した内訳の確認）
- 各 NG の修正担当の割当（guide パス修正、TODO 除去、manifest 登録の優先順位）

## 根拠

- PR 2433 本文「Findings / Capture候補」intake 1件目（発見元: check_integrity 全体実行）
- PR 2433 本文「品質メトリクス」check_integrity 行
