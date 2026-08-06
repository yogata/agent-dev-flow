import { describe, expect, it } from "bun:test"
import { join, resolve } from "node:path"

const REPO_ROOT = resolve(import.meta.dir, "..", "..", "..", "..", "..")
const EXTENSION_PATH = ".agentdev/extensions/skills/agentdev-deep-review.yaml"

function delegatesToArtifactGraph(value: unknown): boolean {
  if (typeof value !== "object" || value === null || !("rules" in value) || !Array.isArray(value.rules)) return false
  return value.rules.some((entry: unknown) => (
    typeof entry === "object" && entry !== null && "skill" in entry
    && entry.skill === "repo-agentdev-artifact-graph"
  ))
}

describe("TS-001: review extension integration", () => {
  it("delegates deliberation candidate discovery without a dedicated extension directory", async () => {
    // Given
    const document = Bun.YAML.parse(await Bun.file(join(REPO_ROOT, EXTENSION_PATH)).text())

    // When
    const delegated = delegatesToArtifactGraph(document)

    // Then
    expect(delegated).toBe(true)
    expect(await Bun.file(join(REPO_ROOT, ".agentdev/extensions/artifact-graph")).exists()).toBe(false)
  })
})
