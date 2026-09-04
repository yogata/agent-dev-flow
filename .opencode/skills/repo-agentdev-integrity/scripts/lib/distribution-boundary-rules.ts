// ADF-COVERS(implementation): REQ-047-009
// IR-046/047/048 rules: repo-self-hosting-specific distribution integrity
// checks that complement the canonical detector. Phase 3 §6.3 / Phase 6
// delegation. Declarative data is in data/distribution-targets.yaml (Wave 6).
// Per REQ-047-009 the YAML is the canonical detection-definition source and
// this module loads it (single path, fail-closed on missing/malformed YAML
// per the declarative data loading principle, ACT-DESIGN-007). Output-facing
// finding fields (rule, description wording) stay here so the CLI output
// contract is unchanged (REQ-047-005).
// Self-host detectable concerns implemented here; consumer-environment
// specific detection is delegated to install-consumer-opencode.ps1.
//
// Split out of check_distribution_boundary.ts so rule logic lives in a
// focused module consumed by the orchestrator.

import * as path from "path";
import * as fs from "fs";
import { classifyByExtension } from "./distribution-boundary.ts";
import type { DistributionRuleFinding } from "./distribution-boundary-types.ts";
import {
  PUBLIC_COMMAND_DIR,
  PUBLIC_SKILLS_PARENT,
  dirExists,
  readArtifactBytes,
} from "./distribution-boundary-fs.ts";

const DISTRIBUTION_TARGETS_REL_PATH = path.join(
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "data",
  "distribution-targets.yaml",
);

export interface DistributionTargets {
  /** IR-046: self-hosting-only content markers forbidden in distributed content. */
  readonly ir046Markers: readonly string[];
  /** IR-047: subdirectories allowed under src/opencode-local/. */
  readonly ir047Allowed: readonly string[];
  /** IR-048: generated_by marker prefix scanned in the local-mode link target. */
  readonly ir048Prefix: string;
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(
      `fail-closed: ${DISTRIBUTION_TARGETS_REL_PATH}: '${label}' must be a mapping`,
    );
  }
  return value as Record<string, unknown>;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `fail-closed: ${DISTRIBUTION_TARGETS_REL_PATH}: '${label}' must be a non-empty string`,
    );
  }
  return value;
}

function requireStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(
      `fail-closed: ${DISTRIBUTION_TARGETS_REL_PATH}: '${label}' must be a non-empty array`,
    );
  }
  return value.map((v) => {
    if (typeof v !== "string" || v.length === 0) {
      throw new Error(
        `fail-closed: ${DISTRIBUTION_TARGETS_REL_PATH}: '${label}' must hold non-empty strings`,
      );
    }
    return v;
  });
}

export function loadDistributionTargets(repoRoot: string): DistributionTargets {
  const yamlPath = path.join(repoRoot, DISTRIBUTION_TARGETS_REL_PATH);
  let text: string;
  try {
    text = fs.readFileSync(yamlPath, "utf-8");
  } catch {
    throw new Error(
      `fail-closed: distribution targets file is missing (${DISTRIBUTION_TARGETS_REL_PATH})`,
    );
  }
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(text);
  } catch {
    throw new Error(
      `fail-closed: distribution targets file is not valid YAML (${DISTRIBUTION_TARGETS_REL_PATH})`,
    );
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(
      `fail-closed: distribution targets file has an unexpected structure (${DISTRIBUTION_TARGETS_REL_PATH})`,
    );
  }
  const root = parsed as Record<string, unknown>;

  const repoKind = requireObject(root.repo_kind_rules, "repo_kind_rules");
  const linkTarget = requireObject(
    root.link_target_structure_rules,
    "link_target_structure_rules",
  );
  const generatedBy = requireObject(
    root.generated_by_identifier_rules,
    "generated_by_identifier_rules",
  );

  return {
    ir046Markers: requireStringArray(
      repoKind.self_hosting_only_markers,
      "repo_kind_rules.self_hosting_only_markers",
    ),
    ir047Allowed: requireStringArray(
      linkTarget.allowed_link_subdirs,
      "link_target_structure_rules.allowed_link_subdirs",
    ),
    ir048Prefix: requireString(
      generatedBy.expected_marker_prefix,
      "generated_by_identifier_rules.expected_marker_prefix",
    ),
  };
}

export interface DistributionRulesResult {
  ok: boolean;
  findings: DistributionRuleFinding[];
  stats: {
    ir046_hits: number;
    ir047_hits: number;
    ir048_hits: number;
    scanned_files: number;
  };
}

interface ScannedFile {
  file: string;
  text: string | null;
}

function listPublicMarkdownFiles(repoRoot: string): string[] {
  const out: string[] = [];
  const stack: string[] = [path.join(repoRoot, PUBLIC_COMMAND_DIR)];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) break;
    if (!dirExists(current)) continue;
    let entries: Array<fs.Dirent>;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true }) as Array<fs.Dirent>;
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules") continue;
        stack.push(full);
      } else if (ent.isFile() && classifyByExtension(ent.name).kind === "text") {
        out.push(full.replace(/\\/g, "/"));
      }
    }
  }
  const skillsParent = path.join(repoRoot, PUBLIC_SKILLS_PARENT);
  if (dirExists(skillsParent)) {
    let top: Array<fs.Dirent>;
    try {
      top = fs.readdirSync(skillsParent, { withFileTypes: true }) as Array<fs.Dirent>;
    } catch {
      return out;
    }
    for (const ent of top) {
      if (!ent.isDirectory()) continue;
      if (!ent.name.startsWith("agentdev-") && ent.name !== "japanese-tech-writing") {
        continue;
      }
      const subStack: string[] = [path.join(skillsParent, ent.name)];
      while (subStack.length > 0) {
        const cur = subStack.pop();
        if (cur === undefined) break;
        if (!dirExists(cur)) continue;
        let sub: Array<fs.Dirent>;
        try {
          sub = fs.readdirSync(cur, { withFileTypes: true }) as Array<fs.Dirent>;
        } catch {
          continue;
        }
        for (const e of sub) {
          const f = path.join(cur, e.name);
          if (e.isDirectory()) {
            if (e.name === "node_modules") continue;
            subStack.push(f);
          } else if (e.isFile() && classifyByExtension(e.name).kind === "text") {
            out.push(f.replace(/\\/g, "/"));
          }
        }
      }
    }
  }
  return out;
}

function scanTexts(files: readonly string[]): ScannedFile[] {
  const out: ScannedFile[] = [];
  for (const file of files) {
    const r = readArtifactBytes(file);
    out.push({ file, text: r.ok ? r.text : null });
  }
  return out;
}

function checkIr046(
  scanned: readonly ScannedFile[],
  markers: readonly string[],
): DistributionRuleFinding[] {
  const findings: DistributionRuleFinding[] = [];
  for (const { file, text } of scanned) {
    if (text === null) continue;
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      for (const marker of markers) {
        const line = lines[i];
        if (line !== undefined && line.includes(marker)) {
          findings.push({
            rule: "ir046",
            file,
            line: i + 1,
            matched: marker,
            description: "self-hosting-only marker detected in distributed content",
          });
        }
      }
    }
  }
  return findings;
}

function checkIr047(
  repoRoot: string,
  allowed: readonly string[],
): DistributionRuleFinding[] {
  const findings: DistributionRuleFinding[] = [];
  const localRoot = path.join(repoRoot, "src", "opencode-local");
  if (!dirExists(localRoot)) return findings;
  let subs: Array<fs.Dirent>;
  try {
    subs = fs.readdirSync(localRoot, { withFileTypes: true }) as Array<fs.Dirent>;
  } catch {
    return findings;
  }
  for (const ent of subs) {
    if (!ent.isDirectory()) continue;
    if (!allowed.includes(ent.name)) {
      findings.push({
        rule: "ir047",
        file: path.join(localRoot, ent.name).replace(/\\/g, "/"),
        line: 0,
        matched: ent.name,
        description: `src/opencode-local/ subdir not in allowed set ${JSON.stringify(allowed)}`,
      });
    }
  }
  return findings;
}

function checkIr048(
  repoRoot: string,
  markerPrefix: string,
): {
  findings: DistributionRuleFinding[];
  scanned: number;
} {
  const findings: DistributionRuleFinding[] = [];
  const localGhCli = path.join(repoRoot, "src", "opencode-local", "agentdev-gh-cli");
  if (!dirExists(localGhCli)) return { findings, scanned: 0 };
  const files = listAgentGhCliTextFiles(localGhCli);
  const scanned = scanTexts(files);
  for (const { file, text } of scanned) {
    if (text === null) continue;
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line !== undefined && line.includes(markerPrefix)) {
        findings.push({
          rule: "ir048",
          file,
          line: i + 1,
          matched: markerPrefix,
          description: "local-mode link target must not declare generated_by marker",
        });
      }
    }
  }
  return { findings, scanned: scanned.length };
}

function listAgentGhCliTextFiles(rootDir: string): string[] {
  const out: string[] = [];
  const stack: string[] = [rootDir];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (cur === undefined) break;
    if (!dirExists(cur)) continue;
    let entries: Array<fs.Dirent>;
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true }) as Array<fs.Dirent>;
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules") continue;
        stack.push(full);
      } else if (ent.isFile() && classifyByExtension(ent.name).kind === "text") {
        out.push(full.replace(/\\/g, "/"));
      }
    }
  }
  return out;
}

export function checkDistributionRules(repoRoot: string): DistributionRulesResult {
  const targets = loadDistributionTargets(repoRoot);
  const publicFiles = listPublicMarkdownFiles(repoRoot);
  const publicScanned = scanTexts(publicFiles);

  const ir046 = checkIr046(publicScanned, targets.ir046Markers);
  const ir047 = checkIr047(repoRoot, targets.ir047Allowed);
  const ir048 = checkIr048(repoRoot, targets.ir048Prefix);

  const findings: DistributionRuleFinding[] = [
    ...ir046,
    ...ir047,
    ...ir048.findings,
  ];

  return {
    ok: findings.length === 0,
    findings,
    stats: {
      ir046_hits: ir046.length,
      ir047_hits: ir047.length,
      ir048_hits: ir048.findings.length,
      scanned_files: publicScanned.length + ir048.scanned,
    },
  };
}
