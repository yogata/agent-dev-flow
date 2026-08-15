# Intake Item: SPEC確定候補 — checker 実行契約 SPEC の frontmatter 除外キー列挙の正規化

## 発生源

- PR: #2149 (Issue #2138 / OU-004, Epic #2134 Wave 1)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

checker 実行契約 SPEC（`docs/specs/integrity/checker-execution-contracts.md`「検出対象除外規定」）は配置ディレクトリ（`docs/specs/integrity/audits/`、`baselines/`）を列挙しているが、frontmatter 信号（`baseline_for` / `audit_for`）は「frontmatter または配置ディレクトリに基づく」との原則記述にとどまり、具体キー列挙を明記していない。実装（check_changed_docs.ts `isSpecFile`）が採用した frontmatter キー列挙を SPEC 側の正規列挙として確定することを提案する（列挙の正規所有を SPEC に置く ADR 拘束との整合）。

## 推奨対応

spec-save 経由で `baseline_for` / `audit_for` の frontmatter キー列挙を正規列挙として確定する。実装側は PR #2149 で main 入り済み。

## 関連

- Issue: #2138 (CLOSED), Epic: #2134
- PR: #2149 (SPEC確定候補 セクション)
- 実装: check_changed_docs.ts isSpecFile（L736）
- 類似の除外規定議論: intake-2026-08-16-ou003-ts009-node-modules-scan-exclusion.md
