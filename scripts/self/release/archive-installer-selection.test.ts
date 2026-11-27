// Verification tests for the archive-edition installer selection contract
// (scripts/consumer/archive/install.ps1):
//   - install state records are classified like the checkout edition: a
//     record without selection fields falls back to ownership-confirmed
//     placements, the legacy agentHosts array is an auxiliary signal, and an
//     invalid record with an omitted side stops (REQ-099-040)
//   - every non-empty selection of the 4 agents places exactly its managed
//     files and records the selection (REQ-099-036, REQ-099-037)
//   - the pre-publish installed projection checker
//     (check_installed_projection.ts) passes for every selection the way
//     package-release-archive.ps1 runs it, and reports a missing, extra or
//     mismatching placement individually (REQ-099-042)
//
// ADF-COVERS(verification): REQ-099-036, REQ-099-037
// ADF-COVERS(verification): REQ-099-040
// ADF-COVERS(verification): REQ-099-042

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { spawnSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const ARCHIVE_INSTALLER = path.join(REPO_ROOT, "scripts", "consumer", "archive", "install.ps1");

type Agent = "opencode" | "senpi" | "codex" | "antigravity";
type Record = Record<string, unknown>;

interface RunResult {
  readonly exitCode: number;
  readonly stdout: string;
}

function rmrf(p: string): void {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* swallow */
  }
}

function writeFile(root: string, rel: string, text: string): void {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, text, "utf-8");
}

/** Consumer root holding an unpacked archive source tree (one file per host area). */
function makeConsumerRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adf-arch-select-"));
  writeFile(root, "src/common/VERSION", "0.0.0-test\n");
  writeFile(root, "src/common/commands/agentdev/case-run.md", "# case-run\n");
  writeFile(root, "src/common/skills/agentdev-x/SKILL.md", "# x\n");
  writeFile(root, "src/opencode/plugins/agentdev-testplugin/plugin.ts", "// plugin\n");
  writeFile(root, "src/senpi/README.md", "# senpi\n");
  writeFile(root, "src/codex/README.md", "# codex\n");
  writeFile(root, "src/antigravity/README.md", "# antigravity\n");
  return root;
}

function runInstaller(root: string, args: readonly string[] = []): RunResult {
  const r = spawnSync(
    "pwsh",
    [
      "-NoProfile",
      "-NonInteractive",
      "-File",
      ARCHIVE_INSTALLER,
      "-Source",
      path.join(root, "src"),
      "-Target",
      path.join(root, ".opencode"),
      "-Mode",
      "copy",
      ...args,
    ],
    { cwd: root, encoding: "utf-8" },
  );
  return { exitCode: r.status ?? -1, stdout: (r.stdout ?? "") + (r.stderr ?? "") };
}

const recordPath = (root: string): string => path.join(root, ".agentdev", "install-state.json");

function readRecord(root: string): Record {
  return JSON.parse(fs.readFileSync(recordPath(root), "utf-8")) as Record;
}

function writeRecord(root: string, record: Record): void {
  fs.writeFileSync(recordPath(root), JSON.stringify(record), "utf-8");
}

/** The -Hosts / -AgentHosts arguments expressing one selection. */
function selectionArgs(selection: readonly Agent[]): string[] {
  const hosts = selection.filter((a) => a === "opencode" || a === "senpi");
  const agents = selection.filter((a) => a === "codex" || a === "antigravity");
  const value = (names: readonly string[], both: string): string =>
    names.length === 2 ? both : (names[0] ?? "none");
  return ["-Hosts", value(hosts, "both"), "-AgentHosts", value(agents, "both")];
}

const CANONICAL_ORDER: readonly Agent[] = ["opencode", "senpi", "codex", "antigravity"];
const canonical = (selection: readonly Agent[]): Agent[] =>
  CANONICAL_ORDER.filter((a) => selection.includes(a));

describe("archive-edition installer / install state record classification (REQ-099-040)", () => {
  const versionFields = (record: Record): Record => ({
    distributionVersion: record.distributionVersion,
    recordedAt: record.recordedAt,
  });

  test("a legacy agentHosts array selects Codex/Antigravity and placements confirm the OpenCode/Senpi side", () => {
    const cases = [
      { first: ["-AgentHosts", "codex"], agentHosts: ["codex"], expected: ["opencode", "senpi", "codex"] },
      { first: [], agentHosts: [], expected: ["opencode", "senpi"] },
      {
        first: ["-AgentHosts", "both"],
        agentHosts: ["codex", "antigravity"],
        expected: ["opencode", "senpi", "codex", "antigravity"],
      },
    ];
    for (const c of cases) {
      const root = makeConsumerRoot();
      try {
        expect(runInstaller(root, c.first).exitCode).toBe(0);
        writeRecord(root, { ...versionFields(readRecord(root)), agentHosts: c.agentHosts });
        const apply = runInstaller(root);
        expect(apply.exitCode).toBe(0);
        expect(readRecord(root).selectedAgents).toEqual(c.expected);
        expect(runProjectionChecker(root).exitCode).toBe(0);
      } finally {
        rmrf(root);
      }
    }
  }, 300000);

  test("a record without selection fields keeps the selection that placements confirm", () => {
    const root = makeConsumerRoot();
    try {
      expect(runInstaller(root, ["-Hosts", "senpi", "-AgentHosts", "antigravity"]).exitCode).toBe(0);
      writeRecord(root, versionFields(readRecord(root)));
      const apply = runInstaller(root);
      expect(apply.exitCode).toBe(0);
      expect(readRecord(root).selectedAgents).toEqual(["senpi", "antigravity"]);
      expect(runProjectionChecker(root).exitCode).toBe(0);
    } finally {
      rmrf(root);
    }
  }, 180000);

  test("an invalid record with an omitted side stops and leaves the record as is", () => {
    const invalid: Record[] = [
      { selectedAgents: ["bogus"] },
      { selectedAgents: ["bogus"], agentHosts: ["codex"] },
      { agentHosts: ["bogus"] },
    ];
    for (const fields of invalid) {
      const root = makeConsumerRoot();
      try {
        expect(runInstaller(root, ["-AgentHosts", "codex"]).exitCode).toBe(0);
        writeRecord(root, { ...versionFields(readRecord(root)), ...fields });
        const before = fs.readFileSync(recordPath(root));
        const apply = runInstaller(root);
        expect(apply.exitCode).toBe(1);
        expect(fs.readFileSync(recordPath(root)).equals(before)).toBe(true);
      } finally {
        rmrf(root);
      }
    }
  }, 300000);
});

const OPEN_FILES = [
  ".opencode/commands/agentdev/case-run.md",
  ".opencode/skills/agentdev-x/SKILL.md",
  ".opencode/plugins/agentdev-testplugin/plugin.ts",
  ".opencode/plugins/agentdev-testplugin.ts",
];
const SENPI_FILES = [".senpi/skills/agentdev-x/SKILL.md", ".agents/agentdev/senpi/README.md"];
const COMMON_FILES = ["VERSION", "commands/agentdev/case-run.md", "skills/agentdev-x/SKILL.md"].map(
  (file) => `.agents/agentdev/common/${file}`,
);
const AGENT_ENTRY_FILES = [".agents/skills/agentdev-x/SKILL.md"];

function expectedFiles(selection: readonly Agent[]): string[] {
  const has = (...names: Agent[]): boolean => names.some((n) => selection.includes(n));
  const agentSide = has("codex", "antigravity");
  return [
    ...(has("opencode") ? OPEN_FILES : []),
    ...(has("senpi") ? SENPI_FILES : []),
    ...(has("senpi") || agentSide ? COMMON_FILES : []),
    ...(agentSide ? AGENT_ENTRY_FILES : []),
    ...(has("codex") ? [".agents/agentdev/codex/README.md"] : []),
    ...(has("antigravity") ? [".agents/agentdev/antigravity/README.md"] : []),
  ].sort();
}

function placedFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string, rel: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relEntry = `${rel}/${entry.name}`;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), relEntry);
      else files.push(relEntry);
    }
  };
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name === "src" || entry.name === ".agentdev") continue;
    if (entry.isDirectory()) walk(path.join(root, entry.name), entry.name);
    else files.push(entry.name);
  }
  return files.sort();
}

const PROJECTION_CHECKER = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "trusted-distribution-gate",
  "check_installed_projection.ts",
);

interface Finding {
  readonly category: string;
  readonly path: string;
}

interface CheckerResult {
  readonly exitCode: number;
  readonly findings: readonly Finding[];
  readonly stats: { readonly expectedFiles: number; readonly placedFiles: number };
  readonly selectedAgents: string[];
}

function runProjectionChecker(root: string): CheckerResult {
  const r = spawnSync(
    "bun",
    ["run", PROJECTION_CHECKER, "--root", root, "--source", path.join(root, "src"), "--json"],
    { cwd: root, encoding: "utf-8" },
  );
  const stdout = r.stdout ?? "";
  const start = stdout.indexOf("{");
  const payload =
    start >= 0 ? (JSON.parse(stdout.slice(start)) as Omit<CheckerResult, "exitCode">) : undefined;
  return {
    exitCode: r.status ?? -1,
    findings: payload?.findings ?? [],
    stats: payload?.stats ?? { expectedFiles: -1, placedFiles: -2 },
    selectedAgents: payload?.selectedAgents ?? [],
  };
}

const findingKey = (finding: Finding): string => `${finding.category} ${finding.path}`;

const ALL_AGENTS: readonly Agent[] = ["opencode", "senpi", "codex", "antigravity"];
const NON_EMPTY_SELECTIONS: Agent[][] = [];
for (let mask = 1; mask < 1 << ALL_AGENTS.length; mask++) {
  NON_EMPTY_SELECTIONS.push(ALL_AGENTS.filter((_, i) => (mask & (1 << i)) !== 0));
}

describe("archive-edition installer / selection set (REQ-099-036, REQ-099-037)", () => {
  for (const selection of NON_EMPTY_SELECTIONS) {
    test(`selection ${selection.join("+")} places exactly its managed files`, () => {
      const root = makeConsumerRoot();
      try {
        const apply = runInstaller(root, selectionArgs(selection));
        expect(apply.exitCode).toBe(0);
        expect(placedFiles(root)).toEqual(expectedFiles(selection));
        expect(readRecord(root).selectedAgents).toEqual(canonical(selection));
        const rerun = runInstaller(root);
        expect(rerun.exitCode).toBe(0);
        expect(placedFiles(root)).toEqual(expectedFiles(selection));
        expect(readRecord(root).selectedAgents).toEqual(canonical(selection));
      } finally {
        rmrf(root);
      }
    }, 180000);
  }

  test("an empty selection is rejected before anything is placed", () => {
    const root = makeConsumerRoot();
    try {
      const apply = runInstaller(root, ["-Hosts", "none", "-AgentHosts", "none"]);
      expect(apply.exitCode).toBe(1);
      expect(placedFiles(root)).toEqual([]);
      for (const dir of [".opencode", ".senpi", ".agents", ".agentdev"]) {
        expect(fs.existsSync(path.join(root, dir))).toBe(false);
      }
    } finally {
      rmrf(root);
    }
  }, 120000);
});

describe("archive-edition installer / pre-publish installed projection check (REQ-099-042)", () => {
  const TAMPER_CASES: ReadonlyArray<{
    readonly name: string;
    readonly selection: readonly Agent[];
    readonly tamper: (root: string) => void;
    readonly findings: readonly string[];
  }> = [
    {
      name: "a missing placed file",
      selection: ALL_AGENTS,
      tamper: (root) => fs.rmSync(path.join(root, ".opencode", "skills", "agentdev-x", "SKILL.md")),
      findings: ["projection_missing .opencode/skills/agentdev-x/SKILL.md"],
    },
    {
      name: "a missing selected root",
      selection: ALL_AGENTS,
      tamper: (root) => fs.rmSync(path.join(root, ".agents", "agentdev", "codex"), { recursive: true }),
      findings: ["missing_required_dir .agents/agentdev/codex"],
    },
    {
      name: "a placed file that differs from the source",
      selection: ALL_AGENTS,
      tamper: (root) => writeFile(root, ".senpi/skills/agentdev-x/SKILL.md", "# tampered\n"),
      findings: ["content_mismatch .senpi/skills/agentdev-x/SKILL.md"],
    },
    {
      name: "a managed file the source does not have",
      selection: ALL_AGENTS,
      tamper: (root) => writeFile(root, ".opencode/skills/agentdev-y/SKILL.md", "# y\n"),
      findings: ["extra .opencode/skills/agentdev-y/SKILL.md"],
    },
    {
      name: "managed content under a deselected root",
      selection: ["senpi", "codex"],
      tamper: (root) => writeFile(root, ".opencode/skills/agentdev-x/SKILL.md", "# x\n"),
      findings: ["extra .opencode/skills/agentdev-x/SKILL.md"],
    },
  ];

  for (const c of TAMPER_CASES) {
    test(`the checker reports ${c.name} individually`, () => {
      const root = makeConsumerRoot();
      try {
        expect(runInstaller(root, selectionArgs(c.selection)).exitCode).toBe(0);
        c.tamper(root);
        const check = runProjectionChecker(root);
        expect(check.exitCode).toBe(1);
        expect(check.findings.map(findingKey)).toEqual(c.findings);
      } finally {
        rmrf(root);
      }
    }, 180000);
  }

  test("the checker reports three tampers as three findings", () => {
    const root = makeConsumerRoot();
    try {
      expect(runInstaller(root, selectionArgs(ALL_AGENTS)).exitCode).toBe(0);
      fs.rmSync(path.join(root, ".opencode", "skills", "agentdev-x", "SKILL.md"));
      writeFile(root, ".opencode/commands/agentdev/case-run.md", "# tampered\n");
      writeFile(root, ".opencode/skills/agentdev-y/SKILL.md", "# y\n");
      const check = runProjectionChecker(root);
      expect(check.exitCode).toBe(1);
      expect(check.findings.map(findingKey).sort()).toEqual([
        "content_mismatch .opencode/commands/agentdev/case-run.md",
        "extra .opencode/skills/agentdev-y/SKILL.md",
        "projection_missing .opencode/skills/agentdev-x/SKILL.md",
      ]);
    } finally {
      rmrf(root);
    }
  }, 180000);

  for (const selection of NON_EMPTY_SELECTIONS) {
    test(`the checker passes selection ${selection.join("+")} after a selection-omitting rerun`, () => {
      const root = makeConsumerRoot();
      try {
        expect(runInstaller(root, selectionArgs(selection)).exitCode).toBe(0);
        expect(runInstaller(root).exitCode).toBe(0);
        const check = runProjectionChecker(root);
        expect(check.exitCode).toBe(0);
        expect(check.selectedAgents).toEqual(canonical(selection));
        expect(check.findings).toEqual([]);
        expect(check.stats.expectedFiles).toBeGreaterThan(0);
        expect(check.stats.placedFiles).toBe(check.stats.expectedFiles);
      } finally {
        rmrf(root);
      }
    }, 180000);
  }
});

describe("archive-edition installer / ownership conflicts (REQ-099-040)", () => {
  const tamper = (root: string, rel: string): string => {
    const file = path.join(root, rel);
    fs.writeFileSync(file, "# tampered\n", "utf-8");
    return file;
  };
  const conflictLineFor = (output: string, rootKey: string): boolean =>
    output.split(/\r?\n/).some((line) => /conflict/i.test(line) && line.includes(`'${rootKey}'`));

  test("a changed copy the record accounts for is kept and reported, and the record is not updated", () => {
    const root = makeConsumerRoot();
    try {
      expect(runInstaller(root, selectionArgs(ALL_AGENTS)).exitCode).toBe(0);
      const file = tamper(root, ".opencode/skills/agentdev-x/SKILL.md");
      const before = fs.readFileSync(recordPath(root));
      const apply = runInstaller(root);
      expect(apply.exitCode).toBe(4);
      expect(conflictLineFor(apply.stdout, "skills")).toBe(true);
      expect(fs.readFileSync(file, "utf-8")).toBe("# tampered\n");
      expect(fs.readFileSync(recordPath(root)).equals(before)).toBe(true);
    } finally {
      rmrf(root);
    }
  }, 180000);

  test("a changed copy no record accounts for is kept and reported, and no record is written", () => {
    const root = makeConsumerRoot();
    try {
      expect(runInstaller(root, selectionArgs(ALL_AGENTS)).exitCode).toBe(0);
      fs.rmSync(recordPath(root));
      const file = tamper(root, ".senpi/skills/agentdev-x/SKILL.md");
      const apply = runInstaller(root);
      expect(apply.exitCode).toBe(4);
      expect(conflictLineFor(apply.stdout, "senpi")).toBe(true);
      expect(fs.readFileSync(file, "utf-8")).toBe("# tampered\n");
      expect(fs.existsSync(recordPath(root))).toBe(false);
    } finally {
      rmrf(root);
    }
  }, 180000);

  test("a switch keeps a changed copy of a deselected agent and does not succeed", () => {
    const root = makeConsumerRoot();
    try {
      expect(runInstaller(root, selectionArgs(ALL_AGENTS)).exitCode).toBe(0);
      const file = tamper(root, ".agents/agentdev/codex/README.md");
      const before = fs.readFileSync(recordPath(root));
      const apply = runInstaller(root, selectionArgs(["opencode"]));
      expect(apply.exitCode).toBe(4);
      expect(conflictLineFor(apply.stdout, "agentdev-codex")).toBe(true);
      expect(fs.readFileSync(file, "utf-8")).toBe("# tampered\n");
      expect(fs.readFileSync(recordPath(root)).equals(before)).toBe(true);
    } finally {
      rmrf(root);
    }
  }, 180000);
});
