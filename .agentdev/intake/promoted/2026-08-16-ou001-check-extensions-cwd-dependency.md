# check_extensions.test.ts 実repo分類テストの cwd 相対パス解決依存

## 観測内容

check_extensions.test.ts「classifies the real skill tree deterministically」は scripts ディレクトリ直下から bun test を実行した場合に deriveSkillClassification の cwd 相対パス解決で fail する（2026-08-16 時点で PR 取り込み前 main でも同一失敗する既存事象。worktree・main 両環境で再確認済み）。repo-agentdev-integrity スイート（2020 test）の全体実行は scripts ディレクトリを cwd とする必要があるため、現行の実行形態では常に 1 fail が混入する。

## 影響

- スイート全体実行に恒常的な 1 fail が混入し、成否判定の正確性を下げる

## 課題

deriveSkillClassification のパス解決を cwd 非依存（スクリプト位置基準等）へ修正する。

## 既存要件・成果物との関連

- 対象: check_extensions.test.ts、deriveSkillClassification
- 関連: 2026-08-16-ou004-check-extensions-order-dependent-failure.md（フルスイート時のみ失敗）、2026-08-16-ou007-checkextensions-worktree-junction-failure.md（worktree 環境失敗）— 同一根候補（統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2184 (Issue #2179 / OU-001, Epic #2178 Wave 1) Findings / Capture候補 セクション intake 3
- 元 item: intake-2026-08-16-ou001-check-extensions-cwd-dependency.md
