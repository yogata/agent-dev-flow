import { describe, expect, it } from "bun:test"
import { join, resolve } from "node:path"

const REPO_ROOT = resolve(import.meta.dir, "..", "..", "..", "..", "..")
const EXTENSION_PATHS = [
  ".agentdev/extensions/commands/req-define.yaml",
  ".agentdev/extensions/commands/spec-save.yaml",
] as const

function delegatesToArtifactGraph(value: unknown): boolean {
  if (typeof value !== "object" || value === null || !("rules" in value) || !Array.isArray(value.rules)) return false
  return value.rules.some((entry: unknown) => (
    typeof entry === "object" && entry !== null && "skill" in entry
    && entry.skill === "repo-agentdev-artifact-graph"
  ))
}

describe("TS-001: definition extension integration", () => {
  it("delegates requirement and specification candidate discovery", async () => {
    // Given
    const documents = await Promise.all(EXTENSION_PATHS.map(async (path) => (
      Bun.YAML.parse(await Bun.file(join(REPO_ROOT, path)).text())
    )))

    // When
    const delegated = documents.map(delegatesToArtifactGraph)

    // Then
    expect(delegated).toEqual([true, true])
  })
})
