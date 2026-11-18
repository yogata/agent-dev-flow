// rules/projection-manifest.ts — skill-projection-manifest.yaml の共有読込 helper。
// IR-016 / IR-068 が共有する。copy_projections セクションは DEC-065 決定3
// （repo-agentdev-integrity の copy 投影登録）の検出ビューである。

import type { IntegrityContext } from "../engine/types.ts";

export const MANIFEST_REL =
  ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml";

export interface CopyProjectionEntry {
  canonical: string;
  projection: string;
}

export interface ProjectionManifest {
  /** manifest 読込失敗時は null（fail-closed）。 */
  skills: string[] | null;
  thirdPartySkills: string[];
  copyProjections: CopyProjectionEntry[];
  warnings: string[];
}

function unquoteYamlScalar(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function loadProjectionManifest(ctx: IntegrityContext): ProjectionManifest {
  const result: ProjectionManifest = {
    skills: null,
    thirdPartySkills: [],
    copyProjections: [],
    warnings: [],
  };
  const file = ctx.readFile(MANIFEST_REL);
  if (file === null) return result;

  const skills: string[] = [];
  const thirdPartySkills: string[] = [];
  let inSkills = false;
  let inThirdParty = false;
  let inCopy = false;
  let currentCopy: Partial<CopyProjectionEntry> | null = null;

  for (const raw of file.lines) {
    const line = raw.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (/^skills:\s*$/.test(line)) {
      inSkills = true;
      inThirdParty = false;
      inCopy = false;
      continue;
    }
    if (/^third_party_skills:\s*$/.test(line)) {
      inSkills = false;
      inThirdParty = true;
      inCopy = false;
      continue;
    }
    if (/^copy_projections:\s*$/.test(line)) {
      inSkills = false;
      inThirdParty = false;
      inCopy = true;
      continue;
    }
    if (/^[A-Za-z_][\w]*:/.test(line)) {
      inSkills = false;
      inThirdParty = false;
      inCopy = false;
      currentCopy = null;
      continue;
    }
    if (inSkills || inThirdParty) {
      const m = line.match(/^\s*-\s+(.+)$/);
      if (!m) continue;
      const name = unquoteYamlScalar(m[1]!);
      if (!/^[a-z][a-z0-9-]*$/.test(name)) {
        result.warnings.push(`invalid skill name '${name}' in ${MANIFEST_REL}`);
        continue;
      }
      const entries = inSkills ? skills : thirdPartySkills;
      const kind = inSkills ? "skill name" : "third-party skill name";
      if (entries.includes(name)) {
        result.warnings.push(`duplicate ${kind} '${name}' in ${MANIFEST_REL}`);
        continue;
      }
      entries.push(name);
      continue;
    }
    if (inCopy) {
      const listMatch = line.match(/^\s*-\s+(.+)$/);
      if (listMatch) {
        if (currentCopy !== null && currentCopy.canonical && currentCopy.projection) {
          result.copyProjections.push({
            canonical: currentCopy.canonical,
            projection: currentCopy.projection,
          });
        }
        currentCopy = null;
        const pairMatch = listMatch[1]!.match(/canonical:\s*(.+)$/);
        if (pairMatch) {
          currentCopy = { canonical: unquoteYamlScalar(pairMatch[1]!) };
        }
        continue;
      }
      const canonicalMatch = line.match(/^\s+canonical:\s*(.+)$/);
      if (canonicalMatch && currentCopy !== null) {
        currentCopy.canonical = unquoteYamlScalar(canonicalMatch[1]!);
        continue;
      }
      const projectionMatch = line.match(/^\s+projection:\s*(.+)$/);
      if (projectionMatch && currentCopy !== null) {
        currentCopy.projection = unquoteYamlScalar(projectionMatch[1]!);
        continue;
      }
    }
  }
  if (currentCopy !== null && currentCopy.canonical && currentCopy.projection) {
    result.copyProjections.push({
      canonical: currentCopy.canonical,
      projection: currentCopy.projection,
    });
  }

  result.skills = skills;
  result.thirdPartySkills = thirdPartySkills;
  return result;
}
