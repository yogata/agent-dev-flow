# check_changed_docs.ts の case-run workflow profile が配布 skill（src/opencode/skills）を対象に含まない

## 概要

targeted docs guard（check_changed_docs.ts）の case-run workflow profile の appliesTo は `docs/**`・AGENTS.md・README 系のみを対象とし、`src/opencode/skills/**`（配布 skill ソース面）を含まない。このため配布 skill 変更のみを含む case-run PR では files_checked 0（warning）となり、TS-007 系完了条件の意味ある検査は配布依存境界 gate 側が担う構造になっている。品質ゲート構成の見直し候補として記録する。

## 内容

- case-run workflow profile の appliesTo 対象に `src/opencode/skills/**` が含まれないため、配布 skill reference のみを変更する PR（case 2789 など）では targeted docs guard が files_checked 0 を返す（`--base-ref` 指定時の警告は仕様通り）
- この場合、配布物整合の実質検査は配布依存境界 gate（check_distribution_boundary.ts、case-run STEP-S5 / case-close STEP-3 共用 detector）が担っており、guard と gate の対象不均衡が生じている
- 見直し候補は2系統: case-run profile への配布 skill 対象追加、または配布 skill 変更時の代替検査指定（ガイド側で配布依存境界 gate を正と明記する等）
- case-close 側は `--files` 明示指定（case-close profile）で files_checked 2件の意味ある検査が実行できており、問題は case-run profile に限定される

## 根拠

- 観測元: PR 2790（case 2789 / issue 2789、`## Findings / Capture候補` intake セクション。TS-007 targeted docs guard 実行時に検出）、case-close（2026-09-13）で回収
- 元テキスト: 「`check_changed_docs.ts` の case-run workflow profile の appliesTo は `docs/**`・AGENTS.md・README 系のみを対象とし、`src/opencode/skills/**`（配布 skill）を含まない。配布 skill 変更のみを含む case-run PR では files_checked 0（warning）となり、TS-007 の意味ある検査は配布依存境界 gate 側が担う構造になっている。case-run profile への配布 skill 対象追加（または代替検査の指定）は品質ゲート構成の見直し候補」
