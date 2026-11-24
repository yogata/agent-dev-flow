// Read-only public command entry resolution shared by all hosts.
//
// The command body is the canonical source of the business name, the
// argument meaning, and the edit scope. Host connection areas expose a
// public entry skill named `agentdev-workflow-<businessName>`; before the
// delegated workflow starts, the entry must load the full command text.
// This module owns that mapping on the common canonical side so host
// connections only bind their entry roots (fail-closed throughout).
//
// Contract:
//   - A business name is a command file name stem (<name>.md) with the
//     distributed skill-name shape (letters, digits, dashes).
//   - The delegated Workflow Skill is read from the `## workflow` section
//     of the command body: the section must delegate to exactly one
//     `agentdev-workflow-*` skill token and that token must equal
//     `agentdev-workflow-<businessName>` (public entry naming contract).
//     Prose wording is never pinned; only the skill token is read.
//   - The apply path resolves the delegated Workflow Skill through the host
//     entry projection first and the canonical skills dir second, and
//     returns the arguments unchanged.

import * as fs from "node:fs";
import * as path from "node:path";
import {
  discoverSkill,
  isValidSkillName,
  type SkillEntry,
} from "./skill-resolution.ts";

/** Prefix of the public entry skill name for a command business name. */
export const WORKFLOW_SKILL_PREFIX = "agentdev-workflow-";

export interface CommandEntry {
  readonly businessName: string;
  /** Full text of the command body (the canonical business contract). */
  readonly commandText: string;
  /** Delegated Workflow Skill name read from the `## workflow` section. */
  readonly workflowSkillName: string;
}

export type CommandEntryResult =
  | { ok: true; entry: CommandEntry }
  | {
      ok: false;
      reason:
        | "invalid-name"
        | "not-found"
        | "missing-workflow-delegation"
        | "workflow-skill-mismatch";
    };

/** Expected public entry skill name for a command business name. */
export function expectedWorkflowSkillName(businessName: string): string {
  return WORKFLOW_SKILL_PREFIX + businessName;
}

function extractWorkflowSection(commandText: string): string {
  const heading = commandText.match(/^## workflow\s*$/m);
  if (heading === null || heading.index === undefined) return "";
  const rest = commandText.slice(heading.index + heading[0].length);
  const next = rest.match(/^## /m);
  return next !== null && next.index !== undefined ? rest.slice(0, next.index) : rest;
}

/**
 * Resolve the public entry for a command business name: the full command
 * text plus the delegated Workflow Skill name read from its workflow
 * section. Fail-closed on unknown names, unreadable files, and sections
 * that do not delegate to exactly the expected workflow skill.
 */
export function resolveCommandEntry(
  commandsDir: string,
  businessName: string,
): CommandEntryResult {
  if (!isValidSkillName(businessName)) {
    return { ok: false, reason: "invalid-name" };
  }
  let commandText: string;
  try {
    commandText = fs.readFileSync(path.join(commandsDir, `${businessName}.md`), "utf-8");
  } catch {
    return { ok: false, reason: "not-found" };
  }
  const section = extractWorkflowSection(commandText);
  const delegated = new Set(section.match(/agentdev-workflow-[a-z0-9-]+/g) ?? []);
  if (delegated.size !== 1) {
    return { ok: false, reason: "missing-workflow-delegation" };
  }
  for (const workflowSkillName of delegated) {
    if (workflowSkillName !== expectedWorkflowSkillName(businessName)) {
      return { ok: false, reason: "workflow-skill-mismatch" };
    }
    return { ok: true, entry: { businessName, commandText, workflowSkillName } };
  }
  return { ok: false, reason: "missing-workflow-delegation" };
}

/** A public entry application: command text, resolved skill, unchanged args. */
export interface PublicEntryApplication {
  readonly commandText: string;
  readonly workflowSkill: SkillEntry;
  readonly args: string;
}

export type PublicEntryFailureReason =
  | "invalid-name"
  | "not-found"
  | "missing-workflow-delegation"
  | "workflow-skill-mismatch"
  | "workflow-skill-not-found";

export type PublicEntryResult =
  | { ok: true; application: PublicEntryApplication }
  | { ok: false; reason: PublicEntryFailureReason };

export interface ApplyPublicEntryInput {
  /** Canonical commands dir (src/common/commands/agentdev equivalent). */
  readonly commandsDir: string;
  /** Host public entry dirs (projection roots), first match wins. */
  readonly entrySkillsDirs: string[];
  /** Canonical skills dir (src/common/skills equivalent). */
  readonly canonicalSkillsDir: string;
  readonly businessName: string;
  readonly args: string;
}

/**
 * Apply a public command entry: load the full command text, resolve the
 * delegated Workflow Skill through the host entry projection (canonical
 * fallback), and pass the arguments through unchanged. The caller must
 * apply the command text before reading the Workflow Skill.
 */
export function applyPublicEntry(input: ApplyPublicEntryInput): PublicEntryResult {
  const command = resolveCommandEntry(input.commandsDir, input.businessName);
  if (!command.ok) {
    return command;
  }
  const skill = discoverSkill({
    skillName: command.entry.workflowSkillName,
    entrySkillsDirs: input.entrySkillsDirs,
    canonicalSkillsDir: input.canonicalSkillsDir,
  });
  if (!skill.ok) {
    return { ok: false, reason: "workflow-skill-not-found" };
  }
  return {
    ok: true,
    application: {
      commandText: command.entry.commandText,
      workflowSkill: skill.entry,
      args: input.args,
    },
  };
}
