import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  assertWithinWorkspace,
  discoverSkill,
  isWithinWorkspace,
  isValidSkillName,
  resolveSkillAsset,
  resolveWorkspaceRoot,
} from "../src/skill-resolution.ts";

let fixtureRoot: string | null = null;

function writeFixture(relPath: string, content: string): string {
  const target = path.join(fixtureRoot!, relPath);
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

function buildFixture(): {
  wsA: string;
  wsB: string;
  canonicalDir: string;
  entryDir: string;
} {
  fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "adf-skill-resolution-"));
  const wsA = path.join(fixtureRoot, "ws-a");
  const wsB = path.join(fixtureRoot, "ws-b");
  fs.mkdirSync(path.join(wsA, ".agentdev"), { recursive: true });
  fs.mkdirSync(path.join(wsB, ".agentdev"), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, "plain"), { recursive: true });
  const canonicalDir = path.join(wsA, "src", "common", "skills");
  const entryDir = path.join(wsA, ".senpi", "skills");
  writeFixture(
    path.join("ws-a", ".senpi", "skills", "agentdev-fixture", "SKILL.md"),
    "---\nname: agentdev-fixture\ndescription: entry projection\n---\n\n# fixture (entry)\n",
  );
  writeFixture(
    path.join("ws-a", "src", "common", "skills", "agentdev-fixture", "SKILL.md"),
    "---\nname: agentdev-fixture\ndescription: canonical source\n---\n\n# fixture (canonical)\n",
  );
  writeFixture(
    path.join("ws-a", "src", "common", "skills", "agentdev-fixture", "references", "guide.md"),
    "# bundled reference\n",
  );
  writeFixture(
    path.join("ws-a", "src", "common", "skills", "agentdev-fixture", "templates", "item.md"),
    "# bundled template\n",
  );
  writeFixture(
    path.join("ws-a", "src", "common", "skills", "agentdev-fixture", "scripts", "run.ts"),
    "export const bundled = true;\n",
  );
  writeFixture(
    path.join("ws-a", "src", "common", "skills", "agentdev-fixture", "references", "dir.d", "keep.md"),
    "placeholder to make references/dir.d a directory\n",
  );
  writeFixture(
    path.join("ws-a", "src", "common", "skills", "agentdev-child", "SKILL.md"),
    "---\nname: agentdev-child\ndescription: canonical only child\n---\n",
  );
  writeFixture(
    path.join("ws-a", "src", "common", "skills", "agentdev-broken", "SKILL.md"),
    "---\nname: agentdev-broken\ndescription: canonical for broken entry\n---\n",
  );
  // Broken entry: projection dir exists but no readable SKILL.md (stale
  // junction equivalent). Resolution must skip it, not fail.
  fs.mkdirSync(path.join(entryDir, "agentdev-broken"), { recursive: true });
  writeFixture(path.join("ws-b", "other", "file.md"), "sibling workspace\n");
  writeFixture(path.join("plain", "file.md"), "no workspace marker\n");
  return { wsA, wsB, canonicalDir, entryDir };
}

describe("workspace root resolution", () => {
  test("resolves the workspace root from a nested start dir", () => {
    const f = buildFixture();
    const resolved = resolveWorkspaceRoot(path.join(f.wsA, "src", "common", "skills"));
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(path.resolve(resolved.workspaceRoot)).toBe(path.resolve(f.wsA));
    }
  });

  test("resolves the workspace root from the root itself", () => {
    const f = buildFixture();
    const resolved = resolveWorkspaceRoot(f.wsA);
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(path.resolve(resolved.workspaceRoot)).toBe(path.resolve(f.wsA));
    }
  });

  test("fails closed when no workspace marker exists", () => {
    buildFixture();
    const resolved = resolveWorkspaceRoot(path.join(fixtureRoot!, "plain"));
    expect(resolved).toEqual({ ok: false, reason: "no-marker" });
  });
});

describe("workspace containment", () => {
  test("accepts the workspace root and paths beneath it", () => {
    const f = buildFixture();
    expect(isWithinWorkspace(f.wsA, f.wsA)).toBe(true);
    expect(isWithinWorkspace(f.wsA, path.join(f.wsA, "src", "a.md"))).toBe(true);
    expect(assertWithinWorkspace(f.wsA, path.join(f.wsA, ".senpi", "x"))).toEqual({ ok: true });
  });

  test("rejects sibling workspace, parent, and unrelated paths", () => {
    const f = buildFixture();
    const sibling = path.join(f.wsB, "other", "file.md");
    expect(isWithinWorkspace(f.wsA, sibling)).toBe(false);
    expect(isWithinWorkspace(f.wsA, fixtureRoot!)).toBe(false);
    expect(assertWithinWorkspace(f.wsA, sibling)).toEqual({
      ok: false,
      reason: "outside-workspace",
    });
  });
});

describe("parent and child skill discovery", () => {
  test("prefers the host entry projection over the canonical source", () => {
    const f = buildFixture();
    const result = discoverSkill({
      skillName: "agentdev-fixture",
      entrySkillsDirs: [f.entryDir],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.origin).toBe("entry");
      expect(path.resolve(result.entry.skillRoot)).toBe(
        path.resolve(path.join(f.entryDir, "agentdev-fixture")),
      );
    }
  });

  test("falls back to the canonical source when the entry projection is absent", () => {
    const f = buildFixture();
    const result = discoverSkill({
      skillName: "agentdev-child",
      entrySkillsDirs: [f.entryDir],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.origin).toBe("canonical");
    }
  });

  test("skips a broken entry projection and resolves through the canonical source", () => {
    const f = buildFixture();
    const result = discoverSkill({
      skillName: "agentdev-broken",
      entrySkillsDirs: [f.entryDir],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.origin).toBe("canonical");
    }
  });

  test("child skills resolve through the same contract, not the parent dir", () => {
    const f = buildFixture();
    const child = discoverSkill({
      skillName: "agentdev-child",
      entrySkillsDirs: [f.entryDir],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(child.ok).toBe(true);
    if (child.ok) {
      expect(child.entry.origin).toBe("canonical");
    }
  });

  test("reports not-found without guessing", () => {
    const f = buildFixture();
    const result = discoverSkill({
      skillName: "agentdev-nowhere",
      entrySkillsDirs: [f.entryDir],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(result).toEqual({ ok: false, reason: "not-found" });
  });
});

describe("skill name validation", () => {
  test("rejects traversal and non-directory shapes", () => {
    expect(isValidSkillName("agentdev-fixture")).toBe(true);
    expect(isValidSkillName("agentdev-fixture-2")).toBe(true);
    expect(isValidSkillName("../escape")).toBe(false);
    expect(isValidSkillName("agentdev/../secret")).toBe(false);
    expect(isValidSkillName("agentdev_x")).toBe(false);
    expect(isValidSkillName("")).toBe(false);
    expect(isValidSkillName(".")).toBe(false);
  });

  test("discoverSkill rejects traversal-shaped names fail-closed", () => {
    const f = buildFixture();
    const result = discoverSkill({
      skillName: "../escape",
      entrySkillsDirs: [f.entryDir],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(result).toEqual({ ok: false, reason: "invalid-name" });
  });
});

describe("bundled reference, template, and script resolution", () => {
  test("resolves bundled assets relative to the skill root", () => {
    const f = buildFixture();
    const discovered = discoverSkill({
      skillName: "agentdev-fixture",
      entrySkillsDirs: [],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(discovered.ok).toBe(true);
    if (!discovered.ok) return;
    for (const ref of [
      "references/guide.md",
      "templates/item.md",
      "scripts/run.ts",
    ]) {
      const asset = resolveSkillAsset(discovered.entry, ref);
      expect(asset.ok).toBe(true);
      if (asset.ok) {
        expect(path.resolve(asset.assetPath)).toBe(
          path.resolve(path.join(discovered.entry.skillRoot, ref)),
        );
      }
    }
  });

  test("rejects traversal above the skill root before filesystem access", () => {
    const f = buildFixture();
    const discovered = discoverSkill({
      skillName: "agentdev-fixture",
      entrySkillsDirs: [],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(discovered.ok).toBe(true);
    if (!discovered.ok) return;
    expect(resolveSkillAsset(discovered.entry, "../outside.md")).toEqual({
      ok: false,
      reason: "escapes-skill-root",
    });
    expect(resolveSkillAsset(discovered.entry, "..")).toEqual({
      ok: false,
      reason: "escapes-skill-root",
    });
    // A relative path that stays beneath the skill root is legal; it is
    // rejected as missing, not as an escape.
    expect(resolveSkillAsset(discovered.entry, "src/common/secret.md")).toEqual({
      ok: false,
      reason: "missing",
    });
  });

  test("rejects absolute references", () => {
    const f = buildFixture();
    const discovered = discoverSkill({
      skillName: "agentdev-fixture",
      entrySkillsDirs: [],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(discovered.ok).toBe(true);
    if (!discovered.ok) return;
    const outside = path.join(fixtureRoot!, "plain", "file.md");
    expect(resolveSkillAsset(discovered.entry, outside)).toEqual({
      ok: false,
      reason: "escapes-skill-root",
    });
  });

  test("reports missing assets and non-file targets", () => {
    const f = buildFixture();
    const discovered = discoverSkill({
      skillName: "agentdev-fixture",
      entrySkillsDirs: [],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(discovered.ok).toBe(true);
    if (!discovered.ok) return;
    expect(resolveSkillAsset(discovered.entry, "references/absent.md")).toEqual({
      ok: false,
      reason: "missing",
    });
    expect(resolveSkillAsset(discovered.entry, "references/dir.d")).toEqual({
      ok: false,
      reason: "missing",
    });
  });
});

describe("resolution stays inside the designated workspace", () => {
  test("every canonical-resolved root and asset lives beneath the workspace", () => {
    const f = buildFixture();
    const discovered = discoverSkill({
      skillName: "agentdev-child",
      entrySkillsDirs: [f.entryDir],
      canonicalSkillsDir: f.canonicalDir,
    });
    expect(discovered.ok).toBe(true);
    if (!discovered.ok) return;
    expect(isWithinWorkspace(f.wsA, discovered.entry.skillRoot)).toBe(true);
    const asset = resolveSkillAsset(discovered.entry, "SKILL.md");
    expect(asset.ok).toBe(true);
    if (asset.ok) {
      expect(isWithinWorkspace(f.wsA, asset.assetPath)).toBe(true);
      expect(assertWithinWorkspace(f.wsA, asset.assetPath)).toEqual({ ok: true });
    }
  });
});
