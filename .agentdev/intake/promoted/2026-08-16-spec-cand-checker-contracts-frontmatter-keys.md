# checker 実行契約 SPEC の frontmatter 除外キー列挙の正規化（SPEC確定候補）

## 観測内容

checker 実行契約 SPEC（`docs/specs/integrity/checker-execution-contracts.md`「検出対象除外規定」）は配置ディレクトリ（`docs/specs/integrity/audits/`、`baselines/`）を列挙しているが、frontmatter 信号（`baseline_for` / `audit_for`）は「frontmatter または配置ディレクトリに基づく」との原則記述にとどまり、具体キー列挙を明記していない。実装（check_changed_docs.ts `isSpecFile`）が採用した frontmatter キー列挙を SPEC 側の正規列挙として確定することが提案されている（列挙の正規所有を SPEC に置く ADR 拘束との整合）。

## 影響

- 除外判定の具体キーが実装のみに存在し、SPEC 変更時に実装と正典の乖離リスクが残る

## 課題

spec-save 経由で `baseline_for` / `audit_for` の frontmatter キー列挙を正規列挙として確定する。実装側は PR #2149 で main 入り済み。

## 既存要件・成果物との関連

- SPEC: checker-execution-contracts.md「検出対象除外規定」
- 実装: check_changed_docs.ts isSpecFile（L736、PR #2149 main 入り済み）
- 類似の除外規定議論: 2026-08-16-ou003-ts009-node-modules-scan-exclusion.md

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2149 (Issue #2138 / OU-004, Epic #2134 Wave 1) SPEC確定候補 セクション
- 元 item: intake-2026-08-16-spec-cand-checker-contracts-frontmatter-keys.md
