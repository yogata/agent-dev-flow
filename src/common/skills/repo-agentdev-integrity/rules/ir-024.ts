// rules/ir-024.ts — Command README ↔ 実体。
// ルール詳細: docs/designs/integrity/rules/IR-024-command-readme-actual.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

export const COMMANDS_DIR = "src/common/commands/agentdev";

/** README 表から command 名（backtick 囲みの kebab-case 名）を抽出する。 */
export function extractReadmeTableCommands(content: string): Set<string> {
  const commands = new Set<string>();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const backtickContent = trimmed.match(/`[^`]+`/g);
    if (!backtickContent) continue;
    for (const bt of backtickContent) {
      const inner = bt.replace(/`/g, "");
      const slashIdx = inner.lastIndexOf("/");
      const name = slashIdx >= 0 ? inner.slice(slashIdx + 1) : inner;
      if (/^[a-z][a-z0-9-]*$/.test(name) && name.length > 1) {
        commands.add(name);
      }
    }
  }
  return commands;
}

export const ir024: IntegrityRule = {
  id: "IR-024",
  slug: "command-readme-actual",
  title: "Command README ↔ 実体",
  description:
    "共通 command ディレクトリの実ファイル集合と README 表の command 名が一致する。",
  relatedReqs: ["REQ-001-026", "REQ-010-003"],
  targetGlobs: ["src/common/commands/agentdev/*.md"],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const cmdFileNames = new Set(
      ctx
        .getFilesByGlob(`${COMMANDS_DIR}/*.md`)
        .map((f) => (f.path.split("/").pop() ?? "").replace(/\.md$/, ""))
        .filter((name) => name !== "README"),
    );

    const readmePath = `${COMMANDS_DIR}/README.md`;
    const readme = ctx.readFile(readmePath);
    if (readme === null) {
      violations.push({
        ruleId: "IR-024",
        severity: "error",
        filePath: readmePath,
        message: `README.md not found in ${COMMANDS_DIR}`,
      });
      return violations;
    }

    const indexedCommands = extractReadmeTableCommands(readme.rawContent);
    for (const name of cmdFileNames) {
      if (!indexedCommands.has(name)) {
        violations.push({
          ruleId: "IR-024",
          severity: "error",
          filePath: `${COMMANDS_DIR}/${name}.md`,
          message: `${name}.md exists but not listed in README table`,
        });
      }
    }
    for (const name of indexedCommands) {
      if (!cmdFileNames.has(name)) {
        violations.push({
          ruleId: "IR-024",
          severity: "error",
          filePath: readmePath,
          message: `${name} listed in README table but no corresponding .md file`,
        });
      }
    }
    return violations;
  },
};
