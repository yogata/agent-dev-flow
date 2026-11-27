import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  ANTIGRAVITY_CANONICAL_COMMANDS_DIR,
  ANTIGRAVITY_CANONICAL_SKILLS_DIR,
  ANTIGRAVITY_ENTRY_SKILLS_DIR,
  antigravityApplyPublicEntry,
  antigravityAssertWriteTarget,
  antigravityCanonicalCommandsDir,
  antigravityCanonicalSkillsDir,
  antigravityDiscoverSkill,
  antigravityEntrySkillsDir,
  antigravityResolveSkillAsset,
} from "../antigravity-skill-discovery.ts";

let fixtureRoot: string | null = null;

function writeFixture(relPath: string, content: string): string {
  if (fixtureRoot === null) {
    throw new Error("fixture root is not built");
  }
  const target = path.join(fixtureRoot, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf-8");
  return target;
}

afterEach(() => {
  if (fixtureRoot !== null) {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
    fixtureRoot = null;
  }
});

function buildFixture(): { ws: string; sibling: string } {
  fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "adf-antigravity-discovery-"));
  const ws = path.join(fixtureRoot, "ws");
  const sibling = path.join(fixtureRoot, "sibling-ws");
  fs.mkdirSync(path.join(ws, ".agentdev"), { recursive: true });
  fs.mkdirSync(path.join(sibling, ".agentdev"), { recursive: true });
  writeFixture(
    path.join("ws", ANTIGRAVITY_ENTRY_SKILLS_DIR, "agentdev-entry", "SKILL.md"),
    "---\nname: agentdev-entry\ndescription: antigravity entry projection\n---\n",
  );
  writeFixture(
    path.join("ws", ANTIGRAVITY_CANONICAL_SKILLS_DIR, "agentdev-entry", "SKILL.md"),
    "---\nname: agentdev-entry\ndescription: canonical twin\n---\n",
  );
  writeFixture(
    path.join("ws", ANTIGRAVITY_CANONICAL_SKILLS_DIR, "agentdev-child", "SKILL.md"),
    "---\nname: agentdev-child\ndescription: canonical child\n---\n",
  );
  writeFixture(
    path.join("ws", ANTIGRAVITY_CANONICAL_SKILLS_DIR, "agentdev-child", "references", "ref.md"),
    "# child bundled reference\n",
  );
  writeFixture(
    path.join("ws", ANTIGRAVITY_CANONICAL_COMMANDS_DIR, "sample.md"),
    "# sample\n\n## workflow\n\nDelegates to `agentdev-workflow-sample` skill.\n",
  );
  writeFixture(
    path.join("ws", ANTIGRAVITY_ENTRY_SKILLS_DIR, "agentdev-workflow-sample", "SKILL.md"),
    "---\nname: agentdev-workflow-sample\ndescription: antigravity entry projection\n---\n",
  );
  writeFixture(
    path.join("ws", ANTIGRAVITY_CANONICAL_COMMANDS_DIR, "lonely.md"),
    "# lonely\n\n## workflow\n\nDelegates to `agentdev-workflow-lonely` skill.\n",
  );
  writeFixture(path.join("sibling", "other.md"), "sibling\n");
  writeFixture(path.join("ws", "docs", "note.md"), "workspace note\n");
  return { ws, sibling };
}

describe("Antigravity skill discovery binding", () => {
  test("binds the .agents/skills entry root inside the designated workspace", () => {
    const f = buildFixture();
    expect(path.resolve(antigravityEntrySkillsDir(f.ws))).toBe(
      path.resolve(path.join(f.ws, ".agents", "skills")),
    );
    expect(path.resolve(antigravityCanonicalSkillsDir(f.ws))).toBe(
      path.resolve(path.join(f.ws, "src", "common", "skills")),
    );
    expect(path.resolve(antigravityCanonicalCommandsDir(f.ws))).toBe(
      path.resolve(path.join(f.ws, "src", "common", "commands", "agentdev")),
    );
  });

  test("resolves a parent skill through the entry projection first", () => {
    const f = buildFixture();
    const result = antigravityDiscoverSkill(f.ws, f.ws, "agentdev-entry");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.origin).toBe("entry");
      expect(isInside(result.entry.skillRoot, f.ws)).toBe(true);
    }
  });

  test("resolves a child skill through the canonical fallback", () => {
    const f = buildFixture();
    const result = antigravityDiscoverSkill(f.ws, f.ws, "agentdev-child");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.origin).toBe("canonical");
      expect(isInside(result.entry.skillRoot, f.ws)).toBe(true);
    }
  });

  test("never resolves a skill from outside the designated workspace", () => {
    const f = buildFixture();
    // The skill exists in the sibling workspace; the designated workspace
    // binding must not see it (no cross-workspace leakage).
    const result = antigravityDiscoverSkill(f.sibling, f.sibling, "agentdev-entry");
    expect(result).toEqual({ ok: false, reason: "not-found" });
  });
});

describe("Antigravity bundled asset resolution binding", () => {
  test("resolves bundled references inside the workspace", () => {
    const f = buildFixture();
    const child = antigravityDiscoverSkill(f.ws, f.ws, "agentdev-child");
    expect(child.ok).toBe(true);
    if (!child.ok) return;
    const asset = antigravityResolveSkillAsset(f.ws, child.entry, "references/ref.md");
    expect(asset.ok).toBe(true);
    if (asset.ok) {
      expect(isInside(asset.assetPath, f.ws)).toBe(true);
    }
  });

  test("rejects assets whose skill root escapes the designated workspace", () => {
    const f = buildFixture();
    const child = antigravityDiscoverSkill(f.ws, f.ws, "agentdev-child");
    expect(child.ok).toBe(true);
    if (!child.ok) return;
    // Forge an entry whose root lives outside the designated workspace.
    const forged = { ...child.entry, skillRoot: path.join(f.sibling, "skills", "x") };
    expect(antigravityResolveSkillAsset(f.ws, forged, "SKILL.md")).toEqual({
      ok: false,
      reason: "escapes-skill-root",
    });
  });
});

describe("Antigravity public command entry binding", () => {
  test("returns the command full text, the workflow skill, and unchanged args", () => {
    const f = buildFixture();
    const result = antigravityApplyPublicEntry(f.ws, f.ws, "sample", "issue-42 --dry");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.application.commandText).toContain("agentdev-workflow-sample");
      expect(result.application.commandText).toMatch(/^## workflow\s*$/m);
      expect(result.application.workflowSkill.skillName).toBe("agentdev-workflow-sample");
      expect(result.application.workflowSkill.origin).toBe("entry");
      expect(result.application.args).toBe("issue-42 --dry");
    }
  });

  test("rejects an unknown business name and an invalid business name", () => {
    const f = buildFixture();
    expect(antigravityApplyPublicEntry(f.ws, f.ws, "no-such-command", "")).toEqual({
      ok: false,
      reason: "not-found",
    });
    expect(antigravityApplyPublicEntry(f.ws, f.ws, "bad/name", "")).toEqual({
      ok: false,
      reason: "invalid-name",
    });
  });

  test("fails closed when the workflow skill is missing everywhere", () => {
    const f = buildFixture();
    expect(antigravityApplyPublicEntry(f.ws, f.ws, "lonely", "")).toEqual({
      ok: false,
      reason: "workflow-skill-not-found",
    });
  });
});

describe("Antigravity write-target gate (edit / tool / guard root consistency)", () => {
  test("accepts write targets beneath the designated workspace", () => {
    const f = buildFixture();
    expect(antigravityAssertWriteTarget(f.ws, path.join(f.ws, "docs", "note.md"))).toEqual({
      ok: true,
    });
    expect(antigravityAssertWriteTarget(f.ws, f.ws)).toEqual({ ok: true });
  });

  test("rejects sibling workspace, parent, and unrelated targets fail-closed", () => {
    const f = buildFixture();
    expect(antigravityAssertWriteTarget(f.ws, path.join(f.sibling, "other.md"))).toEqual({
      ok: false,
      reason: "outside-workspace",
    });
    expect(antigravityAssertWriteTarget(f.ws, f.sibling)).toEqual({
      ok: false,
      reason: "outside-workspace",
    });
    expect(antigravityAssertWriteTarget(f.ws, path.dirname(f.ws))).toEqual({
      ok: false,
      reason: "outside-workspace",
    });
  });
});

describe("Antigravity installed canonical binding (release install layout)", () => {
  test("prefers .agents/agentdev/common over the source fallback when present", () => {
    const f = buildFixture();
    writeFixture(
      path.join("ws", ".agents", "agentdev", "common", "skills", "agentdev-installed", "SKILL.md"),
      "---\nname: agentdev-installed\ndescription: installed canonical\n---\n",
    );
    writeFixture(
      path.join("ws", ".agents", "agentdev", "common", "commands", "agentdev", "installed.md"),
      "# installed\n\n## workflow\n\nDelegates to `agentdev-workflow-installed` skill.\n",
    );
    writeFixture(
      path.join("ws", ".agents", "skills", "agentdev-workflow-installed", "SKILL.md"),
      "---\nname: agentdev-workflow-installed\ndescription: installed entry\n---\n",
    );
    expect(path.resolve(antigravityCanonicalSkillsDir(f.ws))).toBe(
      path.resolve(path.join(f.ws, ".agents", "agentdev", "common", "skills")),
    );
    expect(path.resolve(antigravityCanonicalCommandsDir(f.ws))).toBe(
      path.resolve(path.join(f.ws, ".agents", "agentdev", "common", "commands", "agentdev")),
    );
  });

  test("resolves skills and command entries through the installed canonical copy", () => {
    const f = buildFixture();
    writeFixture(
      path.join("ws", ".agents", "agentdev", "common", "skills", "agentdev-installed", "SKILL.md"),
      "---\nname: agentdev-installed\ndescription: installed canonical\n---\n",
    );
    writeFixture(
      path.join("ws", ".agents", "agentdev", "common", "commands", "agentdev", "installed.md"),
      "# installed\n\n## workflow\n\nDelegates to `agentdev-workflow-installed` skill.\n",
    );
    writeFixture(
      path.join("ws", ".agents", "skills", "agentdev-workflow-installed", "SKILL.md"),
      "---\nname: agentdev-workflow-installed\ndescription: installed entry\n---\n",
    );
    const discovered = antigravityDiscoverSkill(f.ws, f.ws, "agentdev-installed");
    expect(discovered.ok).toBe(true);
    if (discovered.ok) {
      expect(discovered.entry.origin).toBe("canonical");
      expect(isInside(discovered.entry.skillRoot, f.ws)).toBe(true);
    }
    const entry = antigravityApplyPublicEntry(f.ws, f.ws, "installed", "issue-7");
    expect(entry.ok).toBe(true);
    if (entry.ok) {
      expect(entry.application.commandText).toContain("agentdev-workflow-installed");
      expect(entry.application.workflowSkill.skillName).toBe("agentdev-workflow-installed");
      expect(entry.application.workflowSkill.origin).toBe("entry");
      expect(entry.application.args).toBe("issue-7");
    }
  });
});

function isInside(target: string, root: string): boolean {
  const t = path.resolve(target).replace(/\\/g, "/").replace(/\/+$/, "");
  const r = path.resolve(root).replace(/\\/g, "/").replace(/\/+$/, "");
  if (t === r) return true;
  return t.toLowerCase().startsWith(r.toLowerCase() + "/");
}
