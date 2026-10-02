import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  SENPI_CANONICAL_SKILLS_DIR,
  SENPI_ENTRY_SKILLS_DIR,
  senpiAssertWriteTarget,
  senpiCanonicalSkillsDir,
  senpiDiscoverSkill,
  senpiEntrySkillsDir,
  senpiResolveSkillAsset,
} from "../senpi-skill-discovery.ts";

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

function buildFixture(): { ws: string; sibling: string } {
  fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "adf-senpi-discovery-"));
  const ws = path.join(fixtureRoot, "ws");
  const sibling = path.join(fixtureRoot, "sibling-ws");
  fs.mkdirSync(path.join(ws, ".agentdev"), { recursive: true });
  fs.mkdirSync(path.join(sibling, ".agentdev"), { recursive: true });
  writeFixture(
    path.join("ws", SENPI_ENTRY_SKILLS_DIR, "agentdev-entry", "SKILL.md"),
    "---\nname: agentdev-entry\ndescription: senpi entry projection\n---\n",
  );
  writeFixture(
    path.join("ws", SENPI_CANONICAL_SKILLS_DIR, "agentdev-entry", "SKILL.md"),
    "---\nname: agentdev-entry\ndescription: canonical twin\n---\n",
  );
  writeFixture(
    path.join("ws", SENPI_CANONICAL_SKILLS_DIR, "agentdev-child", "SKILL.md"),
    "---\nname: agentdev-child\ndescription: canonical child\n---\n",
  );
  writeFixture(
    path.join("ws", SENPI_CANONICAL_SKILLS_DIR, "agentdev-child", "references", "ref.md"),
    "# child bundled reference\n",
  );
  writeFixture(path.join("sibling", "other.md"), "sibling\n");
  writeFixture(path.join("ws", "docs", "note.md"), "workspace note\n");
  return { ws, sibling };
}

describe("Senpi skill discovery binding", () => {
  test("binds the .senpi/skills entry root inside the designated workspace", () => {
    const f = buildFixture();
    expect(path.resolve(senpiEntrySkillsDir(f.ws))).toBe(
      path.resolve(path.join(f.ws, ".senpi", "skills")),
    );
    expect(path.resolve(senpiCanonicalSkillsDir(f.ws))).toBe(
      path.resolve(path.join(f.ws, "src", "common", "skills")),
    );
  });

  test("resolves a parent skill through the entry projection first", () => {
    const f = buildFixture();
    const result = senpiDiscoverSkill(f.ws, f.ws, "agentdev-entry");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.origin).toBe("entry");
      expect(isInside(result.entry.skillRoot, f.ws)).toBe(true);
    }
  });

  test("resolves a child skill through the canonical fallback", () => {
    const f = buildFixture();
    const result = senpiDiscoverSkill(f.ws, f.ws, "agentdev-child");
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
    const result = senpiDiscoverSkill(f.sibling, f.sibling, "agentdev-entry");
    expect(result).toEqual({ ok: false, reason: "not-found" });
  });
});

describe("Senpi bundled asset resolution binding", () => {
  test("resolves bundled references inside the workspace", () => {
    const f = buildFixture();
    const child = senpiDiscoverSkill(f.ws, f.ws, "agentdev-child");
    expect(child.ok).toBe(true);
    if (!child.ok) return;
    const asset = senpiResolveSkillAsset(f.ws, child.entry, "references/ref.md");
    expect(asset.ok).toBe(true);
    if (asset.ok) {
      expect(isInside(asset.assetPath, f.ws)).toBe(true);
    }
  });

  test("rejects assets whose skill root escapes the designated workspace", () => {
    const f = buildFixture();
    const child = senpiDiscoverSkill(f.ws, f.ws, "agentdev-child");
    expect(child.ok).toBe(true);
    if (!child.ok) return;
    // Forge an entry whose root lives outside the designated workspace.
    const forged = { ...child.entry, skillRoot: path.join(f.sibling, "skills", "x") };
    expect(senpiResolveSkillAsset(f.ws, forged, "SKILL.md")).toEqual({
      ok: false,
      reason: "escapes-skill-root",
    });
  });
});

describe("Senpi write-target gate (edit / tool / guard root consistency)", () => {
  test("accepts write targets beneath the designated workspace", () => {
    const f = buildFixture();
    expect(senpiAssertWriteTarget(f.ws, path.join(f.ws, "docs", "note.md"))).toEqual({
      ok: true,
    });
    expect(senpiAssertWriteTarget(f.ws, f.ws)).toEqual({ ok: true });
  });

  test("rejects sibling workspace, parent, and unrelated targets fail-closed", () => {
    const f = buildFixture();
    expect(senpiAssertWriteTarget(f.ws, path.join(f.sibling, "other.md"))).toEqual({
      ok: false,
      reason: "outside-workspace",
    });
    expect(senpiAssertWriteTarget(f.ws, f.sibling)).toEqual({
      ok: false,
      reason: "outside-workspace",
    });
    expect(senpiAssertWriteTarget(f.ws, fixtureRoot!)).toEqual({
      ok: false,
      reason: "outside-workspace",
    });
  });
});

function isInside(target: string, root: string): boolean {
  const t = path.resolve(target).replace(/\\/g, "/").replace(/\/+$/, "");
  const r = path.resolve(root).replace(/\\/g, "/").replace(/\/+$/, "");
  if (t === r) return true;
  return t.toLowerCase().startsWith(r.toLowerCase() + "/");
}
