/**
 * Tests for check_workflow_preventive.ts (AG-008 preventive checks).
 *
 * Integration target is the parent repo: after the OU-007 cleanup all 7
 * preventive items must pass (ok=true). Fixture-based tests verify each
 * item's detection logic and the structured exemptions.
 */

import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { checkWorkflowPreventive } from "./check_workflow_preventive.ts";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

// Resolve to the worktree root (4 levels up from .opencode/skills/repo-agentdev-integrity/scripts).
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

describe("checkWorkflowPreventive (integration against real repo)", () => {
  test("all 7 preventive items pass (ok=true)", () => {
    const report = checkWorkflowPreventive(REPO_ROOT);
    expect(report.ok).toBe(true);
    expect(report.checks.length).toBe(7);
    for (const c of report.checks) {
      expect(c.pass).toBe(true);
    }
    expect(report.failures.filter((f) => f.severity === "strict").length).toBe(0);
    // 18 public commands since issue was added (17 before).
    expect(report.stats.public_commands).toBe(18);
    expect(report.stats.legacy_kind_files).toBe(0);
    expect(report.stats.legacy_commands_dir_files).toBe(0);
  });

  test("exemptions are structured and recorded", () => {
    const report = checkWorkflowPreventive(REPO_ROOT);
    const areas = report.exemptions.map((e) => e.area);
    expect(areas).toContain("check-4 legacy-path detection fixtures");
    expect(areas).toContain("check-4 abolition declarations");
    expect(areas).toContain("check-5 generic directory declarations");
  });
});

interface FixtureOptions {
  commandBody?: string;
  skillBody?: string;
  skillExists?: boolean;
  extensionYaml?: string | null;
  legacyCommandsDirFile?: boolean;
  extraDistributionFile?: { rel: string; content: string } | null;
  rulesYaml?: string;
}

const DEFAULT_COMMAND_BODY = `---
description: fixture command
---

# demo

本コマンドは workflow 実装本体を \`agentdev-workflow-demo\` スキルへ委譲する（DEC-010、REQ-002-016）。

各 STEP の詳細は \`agentdev-workflow-demo\` スキルの \`references/\` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない。

**soft guard（REQ-002-017）**: 同 Workflow Skill は本コマンドの工程経由でのみ利用し、単独起動を行わない。
`;

const DEFAULT_SKILL_BODY = `---
name: agentdev-workflow-demo
description: fixture workflow skill。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。
---

# agentdev-workflow-demo

本スキルは case-run workflow を所有する。
`;

const DEFAULT_EXTENSION_YAML = `version: 1
kind: workflow-extension
id: agentdev-workflow-demo

context: []
rules: []
checks: []
acceptance_gates: []
must_not: []
`;

const DEFAULT_RULES_YAML = `schema_version: 1
top_level_step_rules:
  scan_dirs:
    - src/opencode/commands/agentdev
  heading_regex: "^###\\\\s+Step\\\\s+(\\\\d+)(?:[〜-](\\\\d+))?\\\\s*:"
  forbidden_heading_regex: "^###\\\\s+Step\\\\s+[A-Za-z]"
`;

function buildFixture(dir: string, opts: FixtureOptions = {}): string {
  const root = fs.mkdtempSync(path.join(dir, "wf-prev-"));
  const commandDir = path.join(root, "src/opencode/commands/agentdev");
  fs.mkdirSync(commandDir, { recursive: true });
  fs.writeFileSync(path.join(commandDir, "demo.md"), opts.commandBody ?? DEFAULT_COMMAND_BODY, "utf-8");

  if (opts.skillExists !== false) {
    const skillDir = path.join(root, "src/opencode/skills/agentdev-workflow-demo");
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, "SKILL.md"), opts.skillBody ?? DEFAULT_SKILL_BODY, "utf-8");
  }

  if (opts.extensionYaml !== null) {
    const extDir = path.join(root, ".agentdev/extensions/skills");
    fs.mkdirSync(extDir, { recursive: true });
    fs.writeFileSync(
      path.join(extDir, "agentdev-workflow-demo.yaml"),
      opts.extensionYaml ?? DEFAULT_EXTENSION_YAML,
      "utf-8",
    );
  }

  if (opts.legacyCommandsDirFile) {
    const legacyDir = path.join(root, ".agentdev/extensions/commands");
    fs.mkdirSync(legacyDir, { recursive: true });
    fs.writeFileSync(path.join(legacyDir, "demo.yaml"), "kind: command-extension\n", "utf-8");
  }

  if (opts.extraDistributionFile) {
    const abs = path.join(root, opts.extraDistributionFile.rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, opts.extraDistributionFile.content, "utf-8");
  }

  const rulesPath = path.join(root, ".opencode/skills/repo-agentdev-integrity/data");
  fs.mkdirSync(rulesPath, { recursive: true });
  fs.writeFileSync(
    path.join(rulesPath, "command-format-rules.yaml"),
    opts.rulesYaml ?? DEFAULT_RULES_YAML,
    "utf-8",
  );
  return root;
}

let tmpBase: string;

beforeAll(() => {
  tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "agentdev-wf-prev-test-"));
});

afterAll(() => {
  fs.rmSync(tmpBase, { recursive: true, force: true });
});

describe("fixture: valid repository passes", () => {
  test("ok=true with all checks passing", () => {
    const root = buildFixture(tmpBase);
    const report = checkWorkflowPreventive(root);
    expect(report.ok).toBe(true);
    expect(report.checks.every((c) => c.pass)).toBe(true);
  });
});

describe("check 1: workflow-dispatch-presence", () => {
  test("command without a dispatch mention fails", () => {
    const root = buildFixture(tmpBase, {
      commandBody: DEFAULT_COMMAND_BODY.replace(/agentdev-workflow-demo/g, "agentdev-somewhere-else"),
    });
    const report = checkWorkflowPreventive(root);
    expect(report.ok).toBe(false);
    expect(report.checks.find((c) => c.item === 1)?.pass).toBe(false);
    expect(report.failures.some((f) => f.check === 1 && f.check_name === "workflow-dispatch-presence")).toBe(true);
  });
});

describe("check 2: dispatch-target-existence", () => {
  test("missing Workflow Skill directory fails", () => {
    const root = buildFixture(tmpBase, { skillExists: false });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 2)?.pass).toBe(false);
  });
});

describe("check 3: workflow-soft-guard", () => {
  test("Workflow Skill description without the concise trigger item fails", () => {
    const root = buildFixture(tmpBase, {
      skillBody: DEFAULT_SKILL_BODY.replace(
        "DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。",
        "DO NOT USE FOR: 単独利用。",
      ),
    });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 3)?.pass).toBe(false);
    expect(report.failures.some((f) => f.check === 3)).toBe(true);
  });

  test("body-level soft guard wording without the description trigger item fails (AG-004 detection word)", () => {
    // PR #2185 removed body-level "soft guard" wording from compliant
    // Workflow Skills; the legacy body-only form must not satisfy check 3.
    const root = buildFixture(tmpBase, {
      skillBody: `---
name: agentdev-workflow-demo
description: fixture workflow skill
---

# agentdev-workflow-demo

本スキルは case-run workflow を所有する。

**soft guard**: 本スキルは \`/agentdev/demo\` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わない。
`,
    });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 3)?.pass).toBe(false);
    expect(
      report.failures.some((f) => f.check === 3 && f.message.includes("単独起動")),
    ).toBe(true);
  });
});

describe("check 4: legacy-extension-residual", () => {
  test("legacy extension kind fails", () => {
    const root = buildFixture(tmpBase, {
      extensionYaml: DEFAULT_EXTENSION_YAML.replace("kind: workflow-extension", "kind: skill-extension"),
    });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 4)?.pass).toBe(false);
    expect(report.stats.legacy_kind_files).toBe(1);
  });

  test("legacy commands extension directory residual fails", () => {
    const root = buildFixture(tmpBase, { legacyCommandsDirFile: true });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 4)?.pass).toBe(false);
    expect(report.stats.legacy_commands_dir_files).toBe(1);
  });

  test("legacy runtime path reference in a command body fails", () => {
    const root = buildFixture(tmpBase, {
      commandBody:
        DEFAULT_COMMAND_BODY +
        "\n本コマンドは `.agentdev/extensions/commands/demo.yaml` を読み込む。\n",
    });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 4)?.pass).toBe(false);
    expect(
      report.failures.some((f) => f.check === 4 && f.message.includes("abolished extension runtime path")),
    ).toBe(true);
  });

  test("abolition-declaration line is exempted", () => {
    const root = buildFixture(tmpBase, {
      extraDistributionFile: {
        rel: "src/opencode/skills/agentdev-project-extensions/SKILL.md",
        content:
          "# project extensions\n\n旧配置 `.agentdev/extensions/commands/**` は廃止済みである。runtime は旧配置を後方互換で読まない。\n",
      },
    });
    const report = checkWorkflowPreventive(root);
    expect(report.ok).toBe(true);
    expect(report.stats.legacy_path_exempted_lines).toBe(1);
  });

  test("detection fixture (*.test.ts) building the legacy path is exempted", () => {
    const root = buildFixture(tmpBase, {
      extraDistributionFile: {
        rel: "src/opencode/skills/agentdev-sample-skill/scripts/tests/containment.test.ts",
        content:
          "test(\"containment\", () => {\n  const dir = join(root, \".agentdev/extensions/commands\");\n});\n",
      },
    });
    const report = checkWorkflowPreventive(root);
    expect(report.ok).toBe(true);
  });
});

describe("check 5: internal-reference-direct-dep", () => {
  test("specific reference file mention fails", () => {
    const root = buildFixture(tmpBase, {
      commandBody:
        DEFAULT_COMMAND_BODY +
        "\n手続きの詳細は `agentdev-workflow-demo` スキル（references/delegation-and-result.md の STEP-S5）を参照する。\n",
    });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 5)?.pass).toBe(false);
    expect(report.failures.some((f) => f.check === 5 && f.file?.endsWith("demo.md"))).toBe(true);
  });

  test("generic `references/` 配下 declaration without a filename is exempted", () => {
    const root = buildFixture(tmpBase);
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 5)?.pass).toBe(true);
  });
});

describe("check 6: classification-kind-consistency", () => {
  test("workflow-extension targeting a non-Workflow Skill fails", () => {
    const root = buildFixture(tmpBase, {
      extensionYaml: DEFAULT_EXTENSION_YAML.replace(
        "id: agentdev-workflow-demo",
        "id: agentdev-cap-thing",
      ),
    });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 6)?.pass).toBe(false);
    expect(
      report.failures.some((f) => f.check === 6 && f.message.includes("is not a Workflow Skill")),
    ).toBe(true);
  });

  test("capability-skill-extension targeting a Workflow Skill fails", () => {
    const root = buildFixture(tmpBase, {
      extensionYaml: DEFAULT_EXTENSION_YAML.replace(
        "kind: workflow-extension",
        "kind: capability-skill-extension",
      ),
    });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 6)?.pass).toBe(false);
    expect(
      report.failures.some((f) => f.check === 6 && f.message.includes("is not a Capability Skill")),
    ).toBe(true);
  });
});

describe("check 7: command-format-thin-consistency", () => {
  test("mandatory procedure-section directive fails", () => {
    const root = buildFixture(tmpBase, {
      rulesYaml: DEFAULT_RULES_YAML + 'required_sections:\n  - "## 手順"\n',
    });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 7)?.pass).toBe(false);
    expect(report.failures.some((f) => f.check === 7 && f.message.includes("mandatory-content"))).toBe(true);
  });

  test("forbidden pattern rejecting the thin dispatch heading fails", () => {
    const root = buildFixture(tmpBase, {
      rulesYaml:
        'schema_version: 1\nforbidden_heading_rules:\n  forbidden_primary_headings:\n    - "^##\\\\s+workflow\\\\s*$"\n',
    });
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 7)?.pass).toBe(false);
    expect(
      report.failures.some((f) => f.check === 7 && f.message.includes("must not forbid the thin model")),
    ).toBe(true);
  });

  test("missing rules file fails", () => {
    const root = buildFixture(tmpBase);
    fs.rmSync(path.join(root, ".opencode/skills/repo-agentdev-integrity/data/command-format-rules.yaml"));
    const report = checkWorkflowPreventive(root);
    expect(report.checks.find((c) => c.item === 7)?.pass).toBe(false);
    expect(report.failures.some((f) => f.check === 7 && f.message.includes("rules file is missing"))).toBe(true);
  });
});
