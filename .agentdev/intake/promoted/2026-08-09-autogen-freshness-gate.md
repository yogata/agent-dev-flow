# AUTOGEN ブロック鮮度検出 gate 追加（rename/status 変更後の陳腐化防止）

## 観測内容

`docs/specs/quality/spec-health-metrics.md` の `<!-- AUTOGEN:BEGIN id=spec-metrics-measurement-example -->` ブロック内に `| skills/agentdev-deep-review.md | 93 | draft | skills |` 行が残存している（計測日 2026-08-07）。
spec-save 工程（commit f318d5d8）で `agentdev-deep-review.md` の frontmatter を `status: superseded` へ更新し、`agentdev-adversarial-review.md` へ rename した結果、表中の `draft` 列が実ファイルと不一致となった。
同ブロックは `generate_indexes.ts`（`.opencode/skills/repo-agentdev-integrity/scripts/`）が実ファイルから再生成する AUTOGEN 区間であり、手編集は非推奨。
PR #1961 では無関係な AUTOGEN 全面再生成を避けるため手動更新を見送った。

根本原因は adversarial-review で抽出したとおり、AUTOGEN ブロックが rename または status 変更で陳腐化する再発パターンである。個別行の手直しではなく、鮮度保証の仕組み不在が問題。

## 影響

表示不正であり、実行時コード・整合性検査には影響しない（`check_changed_docs.ts`、`check_extensions.ts` いずれも strict 違反なし）。
ただし次回 `generate_indexes.ts` 実行まで stale 行が残り、SPEC 読者へ誤情報を提供する。
優先度は中。再発パターンであり、根本対策が未存在。

## 課題

AUTOGEN ブロック鮮度を docs-check または CI で検出する gate を追加する。
手動再生成に依存しない鮮度保証を実現する。
対応候補:
- docs-check へ AUTOGEN ブロックと実ファイルの整合性検証を追加する
- CI 上で `generate_indexes.ts` を実行し差分がある場合 fail とする、または定期再生成をスケジュールする（SC-002 定期再生成前提）

## 既存要件との関連

- 対象: `docs/specs/quality/spec-health-metrics.md`（AUTOGEN ブロック `spec-metrics-measurement-example`）
- 生成スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`
- 交叉参照: 同クラスの事例 #3（`intake-2026-07-27-req-health-metrics-autogen-not-regenerated.md` / `req-health-metrics.md` AUTOGEN、REQ-006=109 へのインスタンスは解決済みだが根本は本件と同一）
- SC-002（定期再生成前提）
- Issue: #1960
- PR: #1961

## 出典

- inbox 元ファイル: `intake-2026-08-09-spec-health-metrics-autogen-stale-after-rename.md`
- 発生日: 2026-08-09
- PR: #1961（Issue #1960、Findings 見出し `### stale-reference`）
