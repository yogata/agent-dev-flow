# phase 6スキル投影未登録・配布境界違反 11 failures の是正（20261013 delta）

- 出所: inspect-docs 20261013T090730Z DB01（backlog-auto stage 1。機械検査の有効実行結果と ls・grep による実証）
- 種別: 修正候補（配布境界違反群の是正）+ 追跡Issue育成（処遇判断部分）
- 対象: src/common/skills/agentdev-phase-theme-collaboration/SKILL.md:96、src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md:27,83、src/common/skills/agentdev-phase-theme-collaboration/scripts/README.md:86,100、src/common/skills/agentdev-workflow-case-auto/SKILL.md:129、src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md:50,52,55、.opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml、.opencode/skills/ 投影

## DB01: 配布物整合性（delta 由来の配布境界違反群）

- category: 配布物整合性（delta 由来の配布境界違反群。repo root 実行の機械検査に基づく）
- target: `src/common/skills/agentdev-phase-theme-collaboration/SKILL.md:96`、`src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md:27,83`、`src/common/skills/agentdev-phase-theme-collaboration/scripts/README.md:86,100`、`src/common/skills/agentdev-workflow-case-auto/SKILL.md:129`、`src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md:50,52,55`、`.opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml`、`.opencode/skills/` 投影
- evidence: (1) SkillProjection 12 NG: phase 系6スキル（agentdev-phase-theme-collaboration、agentdev-workflow-phase-artifacts-update、agentdev-workflow-phase-review、agentdev-workflow-phase-tasks-create、agentdev-workflow-phase-tasks-update、agentdev-workflow-phase-transition）が skill-projection-manifest.yaml に未登録かつ .opencode/skills/ 投影に不在（ls 実証。規定対処は `scripts/install.ps1 -Mode apply` による junction 再構築）。(2) RuntimeReference NG 3: REQ-106 short-form 参照が phase-theme-collaboration:96、workflow-phase-artifacts-update:27,83 に存在（consumer 環境で解決不能、IR-055 strict）。(3) check_distribution_boundary（repo root、scanned 481）11 failures: 上記 REQ-106×3 に加え、REQ-108-006（case-auto:129）、REQ-021-015/018・REQ-061-023・REQ-021-024（case-open definition-pr:50,52）、IR-072（case-open definition-pr:55）、REQ-060・THEME-001（phase-theme-collaboration scripts/README:86,100）。2026-10-11 実行時は failures 0 であり全て今回 delta で導入。
- severity: medium
- confidence: high（機械検査の有効実行結果と ls・grep による実証）
- source_of_truth: IR-068（skill-projection-manifest）、IR-055（REQ-NNNN 参照禁止）、IR-053 系（distribution reference boundary）、REQ-009-016 系（配布境界）
- recommended_route: 修正候補（phase 6スキルの manifest 追記と junction 再構築、REQ-106 short-form 参照の自己完結表現への書き換え）。case-open/case-auto の行参照・IR-072 参照は境界規則上の除外運用（baseline 追加）か表現是正かの処遇判断を追跡Issue育成で確定する。
- ng_classification: 今回修正対象候補（いずれも 2026-10-11 以降の delta）。
- notes: lint_skills AG-005 NG 3件（description 超過）は既知 LINT01 と同一のため本 finding では処分変更しない。check_integrity は case-open 系を baseline 管理（approved additions）としており、check_distribution_boundary との判定差の整理も追跡課題に含める。

## 処置方針

1. phase 6スキルを skill-projection-manifest.yaml へ登録し、`scripts/install.ps1 -Mode apply` による junction 再構築を実施する（SkillProjection 12 NG の解消）
2. REQ-106 short-form 参照3件（phase-theme-collaboration:96、workflow-phase-artifacts-update:27,83）を自己完結表現へ書き換える（RuntimeReference NG 3 の解消）
3. 残り 8 failures（REQ-108-006・REQ-021-015/018・REQ-061-023・REQ-021-024・IR-072・REQ-060・THEME-001 の行参照）の処遇（境界規則上の除外運用〔baseline 追加〕か表現是正か）は追跡Issue育成の確定対象として成果物に含める。check_integrity baseline 管理と check_distribution_boundary の判定差整理を含む

## 処置判断の根拠（inspect-promote 2026-10-13）

- `.opencode/skills/` に phase スキル投影が不在であることを ls 実確認（SkillProjection 指摘の裏付け）
- 機械検査（check_distribution_boundary repo root 実行・scanned 481 / 11 failures、check_integrity SkillProjection 12 NG・RuntimeReference 3 NG）の有効実行結果が裏付け
- ①②の修正対象は明確で一意。③の処遇判断は追跡Issue育成候補として成果物に記録し backlog-review で整理する

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: .opencode/skills/ の phase スキル投影不在（ls、grep exit 1）を再確認。機械検査結果の妥当性（repo root 実行・MECH01 手順是正済み）を確認。
- Jev 評価: promote（0.90）で最終判断と一致（観測 20261013T094827Z-5dc0 d19）。
