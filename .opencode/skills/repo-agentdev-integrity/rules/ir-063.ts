// rules/ir-063.ts — common-policy-identifier-invariant。
// ルール詳細: docs/designs/integrity/rules/IR-063-common-policy-identifier-invariant.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import { collectCommandScopeFiles } from "./reference-path-core.ts";

const POLICY_REGISTRY_REL_PATH =
  "src/common/skills/agentdev-command-authoring/references/common-policy-identifiers.md";
const POLICY_DEF_LINE_RE = /^[-*]\s+\*\*(POL-[a-z0-9]+(?:-[a-z0-9]+)*)\*\*/;
const POLICY_REF_RE = /\bPOL-[a-z0-9]+(?:-[a-z0-9]+)*\b/g;
const RESIDUAL_GXX_RE = /\bG\d{2}\b/g;

export const ir063: IntegrityRule = {
  id: "IR-063",
  slug: "common-policy-identifier-invariant",
  title: "common-policy-identifier-invariant",
  description:
    "共通ポリシー意味識別子（POL-）の未定義参照・registry 外定義・重複定義と廃止済み Gxx 表記の配布物残存を検出する。",
  relatedReqs: ["REQ-051-005", "REQ-051-006", "REQ-010-064", "REQ-010-068"],
  targetGlobs: [
    "src/common/commands/agentdev/**/*.md",
    "src/common/skills/**/*.md",
    "src/common/skills/agentdev-command-authoring/references/common-policy-identifiers.md",
  ],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const registry = ctx.readFile(POLICY_REGISTRY_REL_PATH);

    if (registry === null) {
      if (ctx.pathExists("src/common/skills/agentdev-command-authoring")) {
        violations.push({
          ruleId: "IR-063",
          severity: "error",
          filePath: POLICY_REGISTRY_REL_PATH,
          message: `Common policy identifier registry missing: ${POLICY_REGISTRY_REL_PATH} not found (REQ-051-005, IR-063)`,
          remediationHint: "registry file exists at src/common/skills/agentdev-command-authoring/references/",
        });
      }
      return violations;
    }

    const defined = new Set<string>();
    registry.lines.forEach((line, idx) => {
      const m = line.match(POLICY_DEF_LINE_RE);
      if (!m) return;
      const id = m[1]!;
      if (defined.has(id)) {
        violations.push({
          ruleId: "IR-063",
          severity: "error",
          filePath: POLICY_REGISTRY_REL_PATH,
          line: idx + 1,
          message: `Duplicate common policy identifier definition: ${id} is defined more than once (REQ-051-005, IR-063)`,
          remediationHint: `${id} is defined exactly once in the registry`,
        });
        return;
      }
      defined.add(id);
    });

    const seen = new Set<string>();
    const targets: string[] = [];
    for (const file of collectCommandScopeFiles(ctx)) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      targets.push(file.path);
    }
    for (const file of ctx.getFilesByGlob("src/common/skills/agentdev-*/**/*.md")) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      targets.push(file.path);
    }

    for (const targetPath of targets) {
      if (targetPath === POLICY_REGISTRY_REL_PATH) continue;
      const file = ctx.readFile(targetPath);
      if (file === null) continue;
      for (let idx = 0; idx < file.lines.length; idx++) {
        const line = file.lines[idx] ?? "";
        const defMatch = line.match(POLICY_DEF_LINE_RE);
        if (defMatch) {
          violations.push({
            ruleId: "IR-063",
            severity: "error",
            filePath: targetPath,
            line: idx + 1,
            message: `Common policy identifier defined outside the registry: ${defMatch[1]} must be defined only in the registry (REQ-051-005, IR-063)`,
            remediationHint: `${defMatch[1]} is defined in common-policy-identifiers.md only`,
          });
        }
        POLICY_REF_RE.lastIndex = 0;
        const reportedIds = new Set<string>();
        let refMatch: RegExpExecArray | null;
        while ((refMatch = POLICY_REF_RE.exec(line)) !== null) {
          const id = refMatch[0];
          if (defined.has(id) || reportedIds.has(id)) continue;
          reportedIds.add(id);
          violations.push({
            ruleId: "IR-063",
            severity: "error",
            filePath: targetPath,
            line: idx + 1,
            message: `Undefined common policy identifier reference: ${id} is not defined in the registry (REQ-051-005, IR-063)`,
            remediationHint: `${id} is defined in common-policy-identifiers.md`,
          });
        }
        RESIDUAL_GXX_RE.lastIndex = 0;
        const reportedGxx = new Set<string>();
        let gxxMatch: RegExpExecArray | null;
        while ((gxxMatch = RESIDUAL_GXX_RE.exec(line)) !== null) {
          const id = gxxMatch[0];
          if (reportedGxx.has(id)) continue;
          reportedGxx.add(id);
          violations.push({
            ruleId: "IR-063",
            severity: "error",
            filePath: targetPath,
            line: idx + 1,
            message: `Residual abolished guardrail number: ${id} remains in distribution (Gxx numbering was abolished, REQ-051-005, IR-063)`,
            remediationHint: "guardrail descriptions use plain text or common policy identifiers (POL-)",
          });
        }
      }
    }
    return violations;
  },
};
