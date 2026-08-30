# checker source profile が repo-local Plugin を配布対象と扱う模型ずれ（tests/ 除外は対処済み、根因は未解決）

## 観測

配布境界 gate（--profile source）が `src/opencode/plugins/agentdev-*` を列挙対象とするため、repo-local 配布対象外の agentdev-distribution-boundary-guard パッケージも走査され、テストフィクスチャ（detector の検出刺激として意図的に埋め込まれた producer 内部 ID・producer URL・docs パス）85 行が新規検出された（PR #2481 case-run 記録）。plugin/lib 本体からの新規検出はゼロ（ID トークン除去で解消）。

- 本 PR（809292c5）で checker に tests/ ディレクトリ除外を追加し、baseline 11 = final 11 で表面解消済み
- 根因は source profile が repo-local Plugin を配布対象と扱う模型ずれで、次の repo-local Plugin 追加・移動時に再発する

## 今回扱わない理由

checker 側（check_distribution_boundary.ts + lib/distribution-boundary*.ts）は本 Case（Issue #2480）の対象外（UQ-003 ユーザー合意済み）。根因修正には check_distribution_boundary 側の repo-local Plugin モデル整備（package.json マーカー参照等、runtime-package-boundary Design「将来 repo-local Plugin が複数化した時点でマーカー方式への拡張条件を判断」に対応）が必要。

## 影響

- repo-local Plugin が複数化した時点で gate 偽陽性が再発する
- tests/ 以外の位置（README、コメント等）のフィクスチャ的記述は当該除外の対象外

## レビューで決めること

- checker 対象外の解除（REQ-029 検査対象の見直し）または repo-local 除外のモデル整備（package.json マーカー参照方式）を別 Case として実施するか
- tests/ ディレクトリ除外を恒久措置として維持するか、マーカー方式移行時に撤去するか

## 根拠

- PR #2481 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2481 ）
