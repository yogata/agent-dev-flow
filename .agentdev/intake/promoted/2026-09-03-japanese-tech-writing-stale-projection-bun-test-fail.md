# japanese-tech-writing の遺構投影ディレクトリが整合検査・bun test を汚染（4 fail 含む）

## 観測内容

2026-09-03 の docs-check で、`src/opencode/skills/japanese-tech-writing/`（2026-08-27 commit `da5e5b7a` で追跡対象外化、ローカルのみ管理へ移行）に対応する `.opencode/skills/japanese-tech-writing/` の投影ディレクトリが git 管理外のまま残留し、複数の検査がこれを検出している:

- check_integrity [NG] skill-projection-manifest: src 側に存在しない投影（stale junction, IR-068）
- check_integrity [WARNING] skill-use-for-boundary: USE FOR セクション不在
- lint_skills [WARNING] ×2: USE FOR / DO NOT USE FOR トリガー不在
- `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/`: REQ-0030-004 の skills_structure.test.ts で 4 fail（同 SKILL.md の USE FOR / DO NOT USE FOR 検査。2026-09-03 実行: 2532 tests / 101 files / 2528 pass / 4 fail）

原因分類: 確認済（`git ls-files` で src・.opencode 両パスとも追跡なし、src 側ディレクトリは実在せず、.opencode 側のみ実ディレクトリとして残留。追跡対象外化のコミットは確認済）。

2026-09-03 現行確認: `.opencode/skills/japanese-tech-writing/` は実ディレクトリとして存在し、両パスとも git 追跡外であることを再確認済み。

## 影響

- bun test フル suite が恒常的に 4 fail となり、QG-4 の bun test 正規形（fail 0 前提の機械受理）と不整合
- check_integrity / lint_skills の検出に新規違反でないノイズが混入し、baseline 運用の delta 判定を妨げる

## 課題（レビューで決めること）

- 遺構投影ディレクトリ `.opencode/skills/japanese-tech-writing/` の削除の要否（ローカル管理スキルを .opencode 投影で使い続ける方針なら、検査・テストの走査除外の確定が必要）
- skills_structure.test.ts など `.opencode/skills/` を走査するテスト・検査の対象除外方針（追跡対象外スキルの扱いの明文化）
- japanese-tech-writing 自体の配置方針（src への復帰 / ローカル専用の維持）の再確定

## 既存要件・契約との関連

- IR-068（skill-projection-manifest 突合）、REQ-0030-004（skills_structure.test.ts）、QG-4 の bun test 正規形（agentdev-quality-gates）、third-party Skill 管理 Design のローカル管理モデル。
- 関連 item: IR-068 checker の third-party Skill 許容拡張（2026-09-02、jtw の projection-extra 検出の扱いと接続）。

## 根拠

- check_integrity レポート `.agentdev/integrity/reports/2026-09-03-integrity-report.md`（NG skill-projection-manifest、WARNING skill-use-for-boundary）
- bun test 実行結果（2026-09-03、`bun test ./.opencode/skills/repo-agentdev-integrity/scripts/`、4 fail はすべて japanese-tech-writing）
- commit `da5e5b7a`（chore(skills): japanese-tech-writing を追跡対象外に変更、ローカルのみで管理）
