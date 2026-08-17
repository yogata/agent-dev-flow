# TS-009 配布物スキャンの node_modules 除外規定の検討

## 観測内容

`commands_e2e.test.ts` の TS-009「実配布物: src/opencode 配下の Markdown に BOM と CRLF/LF 混在は存在しない」が main 作業ディレクトリのみ失敗する。原因は `src/opencode/skills/*/scripts/node_modules/@types/bun/README.md`（4件、git 管理外）が CRLF/LF 混在で、再帰スキャンが node_modules を除外していないため。worktree（node_modules 未配置）では発生しない。checker 実行契約系 SPEC でのスキャン除外規定の候補。

case-close 時点状況: merge 後 main（3143a0bf）でも再現を確認（当該 4 ファイルの実在と TS-009 の 1 fail）。Wave 1 の各完了条件の対象外（環境起因の pre-existing）。

## 影響

- main 作業ディレクトリで TS-009 が恒常的に 1 fail し、フルスイート結果にノイズが混入する

## 課題

checker 実行契約系 SPEC（検出対象除外規定の正規所有者）で node_modules 系 git 管理外ディレクトリのスキャン除外を検討する。

## 既存要件・成果物との関連

- SPEC: checker 実行契約系（検出対象除外規定）
- 対象: commands_e2e.test.ts TS-009
- 類似: 2026-08-16-spec-cand-checker-contracts-frontmatter-keys.md（同 SPEC の除外規定議論）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2146 (Issue #2137 / OU-003, Epic #2134 Wave 1) Findings / Capture候補 セクション intake 1
- 元 item: intake-2026-08-16-ou003-ts009-node-modules-scan-exclusion.md
