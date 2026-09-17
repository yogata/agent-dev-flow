# Windows 環境の check_distribution_boundary.ts link profile が junction を Dirent.isDirectory() フィルタで除外し skills 投影を実質走査しない（改善候補）

## 観測

Case #2903（実装 PR #2922）の case-run 配布依存境界 gate で、Windows 環境の `check_distribution_boundary.ts --profile link` が `collectTargets` の `Dirent.isDirectory()` フィルタにより junction エントリ（`isSymbolicLink=true` / `isDirectory=false`）を走査対象から除外することを確認した。結果、skills 投影（`.opencode/skills/agentdev-*`）が link 走査対象に含まれず、実質 commands 投影のみの走査（scanned 39 files）となる。main・worktree 共通の環境特性であり、契約の fallback（junction 構成が維持された root 指定）でも skills 投影側は同一挙動。

## 今回扱わない理由

本 Case（#2903）の合意済み Definition は case-ready SKILL.md 参照修正と ng-baseline legacy エントリ除去のみであり、checker の走査対象実装変更は対象範囲外（Execution Contract の対象外: checker・Tool の仕様変更）。link profile の実効性向上は detector 実装の変更を伴う別作業候補。

## 影響

link profile の「双方反映（src/opencode 正本と .opencode 配置先投影）の存在検査」が skills 投影側で実効的に機能せず、`.opencode/skills/agentdev-*` 配下の配置先投影の欠落・link 切れを link profile が検出できない。検出の網羅性が環境依存で低下する（source profile は skills 投影を走査するため、欠落検出自体は source 側で部分的に代替される）。

## レビューで決めること

(1) `collectTargets` の Dirent 判定に `isSymbolicLink()` または実体解決後の `stat` を併用し、junction を link 走査対象に含める修正を checker 整備 Case として切り出すか。(2) Windows 環境特性として現状挙動を文書化し、link profile の skills 投影非走査を既知制限として checker 実行契約 Design（docs/designs/integrity/distribution-boundary.md 系）へ明記するか。

## 根拠（任意）

PR #2922 本文「品質メトリクス」表 配布依存境界 link profile 行（scanned 39 files、skills 投影対象外の環境ラベル記録あり）。実行例: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts --profile link --root .`（2026-09-17、main 3464fa46 / worktree e0ca2454 時点）。
