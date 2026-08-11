import { afterEach, describe, expect, it } from "bun:test"
import { rm } from "node:fs/promises"
import { join, resolve } from "node:path"
import { readdir } from "node:fs/promises"

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

const REPO_ROOT = resolve(import.meta.dir, "..", "..", "..", "..", "..", "..")
const SKILLS_SOURCE = join(REPO_ROOT, "src", "opencode", "skills")
const INSTALL_SCRIPT = join(REPO_ROOT, "scripts", "install-consumer-opencode.ps1")

describe("install-consumer-opencode.ps1: agentdev-artifact-graph consumer junction (REQ\u002D012-001)", () => {
  it("standard skill directory exists at src/opencode/skills/agentdev-artifact-graph/", async () => {
    const skillExists = await Bun.file(join(SKILLS_SOURCE, "agentdev-artifact-graph", "SKILL.md")).exists()
    expect(skillExists).toBe(true)
  })

  it("directory name matches the agentdev-* glob used for dynamic enumeration", async () => {
    const entries = await readdir(SKILLS_SOURCE)
    const agentdevSkills = entries.filter((name) => name.startsWith("agentdev-"))
    expect(agentdevSkills).toContain("agentdev-artifact-graph")
    expect(agentdevSkills.every((name) => /^agentdev-/.test(name))).toBe(true)
  })

  it("PowerShell Get-ChildItem -Filter 'agentdev-*' enumerates agentdev-artifact-graph", async () => {
    const proc = Bun.spawn(
      ["pwsh", "-NoProfile", "-Command", `Get-ChildItem -LiteralPath '${SKILLS_SOURCE}' -Directory -Filter 'agentdev-*' | Select-Object -ExpandProperty Name`],
      { stdout: "pipe", stderr: "pipe" },
    )
    const exitCode = await proc.exited
    const stdout = await new Response(proc.stdout).text()

    expect(exitCode).toBe(0)
    const enumerated = stdout.trim().split(/\r?\n/).filter(Boolean)
    expect(enumerated).toContain("agentdev-artifact-graph")
  })

  it("install-consumer-opencode.ps1 source contains the agentdev-* dynamic enumeration logic", async () => {
    const content = await Bun.file(INSTALL_SCRIPT).text()
    expect(content).toMatch(/Get-ChildItem.*-Filter\s+'agentdev-\*'/)
  })
})

