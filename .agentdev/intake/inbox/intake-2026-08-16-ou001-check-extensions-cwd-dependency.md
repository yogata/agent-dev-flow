# Intake Item: check_extensions.test.ts 実repo分類テストの cwd 相対パス解決依存

## 発生源

- PR: #2184 (Issue #2179 / OU-001, Epic #2178 Wave 1)
- 発生 phase: case-run 検証
- capture 分類: intake（具体的修正対象、既知のテスト環境依存）

## 問題

check_extensions.test.ts「classifies the real skill tree deterministically」は scripts ディレクトリ直下から bun test を実行した場合に deriveSkillClassification の cwd 相対パス解決で fail する（2026-08-16 時点で PR 取り込み前 main でも同一失敗する既存事象。worktree・main 両環境で再確認済み）。repo-agentdev-integrity スイート（2020 test）の全体実行は scripts ディレクトリを cwd とする必要があるため、現行の実行形態では常に 1 fail が混入する。

## 推奨対応

deriveSkillClassification のパス解決を cwd 非依存（スクリプト位置基準等）へ修正する。

## 関連

- Issue: #2179 (CLOSED), Epic: #2178
- PR: #2184 (Findings / Capture候補 セクション intake 3)
