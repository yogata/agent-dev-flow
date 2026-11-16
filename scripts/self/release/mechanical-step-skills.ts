// Consumer-fixture helper for the REQ-009-053 mechanical-step prerequisite
// verification (install.ps1 / self-sync.ps1 check mode).
//
// install.ps1's $MechanicalStepProbeContract probes four skill scripts in the
// placed projection (.opencode/skills) and expects them to answer their
// verification-only entry against consumer-condition fixtures. A consumer
// checkout carries those skills under src/common/skills, so consumer-shaped
// test fixtures must carry the same scripts trees or check mode reports
// "[DIVERGENCE] Mechanical-step script missing" and exits non-zero.
//
// The closure below is import-verified against src/common/skills:
//   - the four probed scripts: case-open (prepare_definition_pr,
//     inspect_cross_dependencies), case-ready (accept_definition_checks),
//     case-close (close_mechanical_steps)
//   - agentdev-artifact-validation: imported by the gate-execution lib shared
//     by the case-open / case-ready / case-close scripts
//   - agentdev-epic-tracker: imported by close_mechanical_steps
//   - agentdev-traceability: the probe fixtures reference its checker as the
//     gate executable (New-MechanicalStepProbeInput $traceChecker)
//   - agentdev-decision-file-manager / agentdev-req-file-manager: close the
//     tests-directory imports of the agentdev-artifact-validation scripts
//     tree (the whole scripts tree is copied, matching the real checkout)
//
// The scripts trees have no external npm dependency (node: builtins only), so
// node_modules is neither copied nor required.

import * as fs from "fs";
import * as path from "path";

export const MECHANICAL_STEP_SKILL_NAMES = [
  "agentdev-workflow-case-open",
  "agentdev-workflow-case-ready",
  "agentdev-workflow-case-close",
  "agentdev-traceability",
  "agentdev-epic-tracker",
  "agentdev-artifact-validation",
  "agentdev-decision-file-manager",
  "agentdev-req-file-manager",
] as const;

function copyTreeExcludingNodeModules(src: string, dst: string): void {
  fs.mkdirSync(dst, { recursive: true });
  const walk = (dir: string, dest: string): void => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name === "node_modules") continue;
      const s = path.join(dir, ent.name);
      const d = path.join(dest, ent.name);
      if (ent.isDirectory()) {
        fs.mkdirSync(d, { recursive: true });
        walk(s, d);
      } else if (ent.isFile()) {
        fs.copyFileSync(s, d);
      }
    }
  };
  walk(src, dst);
}

/**
 * Place the mechanical-step skill scripts closure into a consumer-shaped
 * fixture: <fixtureSkillsDir>/<skill>/scripts for each skill above, copied
 * from <repoRoot>/src/common/skills/<skill>/scripts (node_modules excluded).
 */
export function placeMechanicalStepSkillScripts(repoRoot: string, fixtureSkillsDir: string): void {
  for (const name of MECHANICAL_STEP_SKILL_NAMES) {
    const src = path.join(repoRoot, "src", "common", "skills", name, "scripts");
    if (!fs.existsSync(src)) {
      throw new Error(`mechanical-step skill scripts source not found: ${src}`);
    }
    copyTreeExcludingNodeModules(src, path.join(fixtureSkillsDir, name, "scripts"));
  }
}
