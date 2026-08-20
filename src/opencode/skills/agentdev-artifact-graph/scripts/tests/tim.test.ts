import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { DEFAULT_RELATION_TYPE_VOCABULARY } from "../lib/config.ts"
import { AUGMENTATION_DEFAULT_PATH, resolveConfig, type AugmentationFile } from "../lib/augmentation.ts"
import {
  DEFAULT_ARTIFACT_TYPE_SEMANTICS,
  DEFAULT_RELATION_SEMANTICS,
  deriveProfileParticipation,
  type RelationSemantics,
} from "../lib/tim.ts"
import { AUGMENTATION_WITH_TIM, createFixture, createTimFixture } from "./fixture.ts"

const roots: string[] = []

async function timGraphFixture() {
  const root = await mkdtemp(join(tmpdir(), "ag-tim-"))
  roots.push(root)
  await createFixture(root)
  await createTimFixture(root)
  await mkdir(join(root, ".agentdev"), { recursive: true })
  await writeFile(join(root, AUGMENTATION_DEFAULT_PATH), AUGMENTATION_WITH_TIM, "utf8")
  const output = join(root, ".agentdev", "graph")
  await buildGraph({ root, output })
  return { root, output, graph: await loadGraph(output) }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

function semanticsOf(name: string): RelationSemantics {
  const semantics = DEFAULT_RELATION_SEMANTICS[name]
  if (semantics === undefined) throw new TypeError(`missing semantics for ${name}`)
  return semantics
}

describe("TIM catalog: standard core vocabulary (REQ-{NNNN}-{NNN} series)", () => {
  it("declares complete semantics for all 5 standard core relation types", () => {
    const defaultNames = [...DEFAULT_RELATION_TYPE_VOCABULARY] as readonly string[]
    expect(new Set<string>(defaultNames)).toEqual(new Set<string>(Object.keys(DEFAULT_RELATION_SEMANTICS)))
    for (const semantics of Object.values(DEFAULT_RELATION_SEMANTICS)) {
      expect(semantics.meaning.length).toBeGreaterThan(0)
      expect(semantics.change_impact_direction).toBeDefined()
    }
  })

  it("assigns change impact directions per relation type, distinct from link direction", () => {
    expect(semanticsOf("references").change_impact_direction).toBe("none")
    expect(semanticsOf("supersedes").change_impact_direction).toBe("none")
    expect(semanticsOf("defined_in").change_impact_direction).toBe("backward")
    expect(semanticsOf("contains").change_impact_direction).toBe("bidirectional")
    expect(semanticsOf("extends").change_impact_direction).toBe("bidirectional")
  })

  it("maps general reference to the SysML trace slot (REQ-{NNNN}-{NNN})", () => {
    expect(semanticsOf("references").semantics_slot).toBe("general_reference")
    expect(semanticsOf("references").standard_vocabulary).toContain("SysML «trace»")
  })

  it("marks decision as the ADF-specific artifact type without a dedicated relation type (REQ-{NNNN}-{NNN})", () => {
    expect(DEFAULT_ARTIFACT_TYPE_SEMANTICS["decision"]?.origin).toBe("adf")
    expect(DEFAULT_ARTIFACT_TYPE_SEMANTICS["requirement"]?.origin).toBe("standard")
    expect(DEFAULT_ARTIFACT_TYPE_SEMANTICS["design"]?.origin).toBe("standard")
    for (const name of Object.keys(DEFAULT_RELATION_SEMANTICS)) {
      expect(name).not.toContain("decision")
    }
  })
})

describe("profile participation derived from relation meaning (REQ-{NNNN}-{NNN} series)", () => {
  it("keeps general references out of impact, dependency and implementation", () => {
    const participation = deriveProfileParticipation(semanticsOf("references"))
    expect(participation.impact).toBe(false)
    expect(participation.dependency).toEqual([])
    expect(participation.implementation).toEqual([])
    expect(participation.related).toBe(true)
  })

  it("derives impact participation from change impact direction", () => {
    expect(deriveProfileParticipation(semanticsOf("supersedes")).impact).toBe(false)
    expect(deriveProfileParticipation(semanticsOf("contains")).impact).toBe(true)
  })

  it("derives dependency and implementation orientations per semantics slot", () => {
    expect(deriveProfileParticipation(semanticsOf("defined_in")).dependency).toEqual(["forward"])
    expect(deriveProfileParticipation(semanticsOf("extends")).dependency).toEqual(["forward"])
    const satisfy: RelationSemantics = {
      meaning: "実装成果物が要件を充足する",
      semantics_slot: "satisfy",
      change_impact_direction: "backward",
      standard_vocabulary: [],
    }
    expect(deriveProfileParticipation(satisfy).dependency).toEqual(["reverse"])
    expect(deriveProfileParticipation(satisfy).implementation).toEqual(["reverse"])
  })

  it("keeps slot-less semantic definitions out of dependency and implementation", () => {
    const adHoc: RelationSemantics = {
      meaning: "ADF 固有の双方向整合関係",
      change_impact_direction: "bidirectional",
      standard_vocabulary: [],
    }
    const participation = deriveProfileParticipation(adHoc)
    expect(participation.impact).toBe(true)
    expect(participation.dependency).toEqual([])
    expect(participation.implementation).toEqual([])
  })
})

describe("augmentation semantics boundary (REQ-{NNNN}-{NNN})", () => {
  it("rejects incomplete semantics declarations", () => {
    const augmentation: AugmentationFile = {
      relation_types: [{ name: "partial", fields: ["partial_field"], semantics: { meaning: "意味のみ" } }],
    }
    expect(() => resolveConfig(augmentation)).toThrow(/requires change_impact_direction/)
  })

  it("rejects semantics redefinition for standard core relation types", () => {
    const augmentation: AugmentationFile = {
      relation_types: [
        {
          name: "references",
          semantics: { meaning: "上書き", change_impact_direction: "forward" },
        },
      ],
    }
    expect(() => resolveConfig(augmentation)).toThrow(/owned by the TIM vocabulary catalog/)
  })

  it("rejects role declaration for standard core node types", () => {
    const augmentation: AugmentationFile = {
      node_types: [{ name: "design", path_pattern: "^docs/designs/.+\\.md$", role: "index" }],
    }
    expect(() => resolveConfig(augmentation)).toThrow(/owned by the TIM vocabulary catalog/)
  })

  it("rejects unknown role values", () => {
    const augmentation: AugmentationFile = {
      node_types: [{ name: "custom", path_pattern: "^docs/custom/.+\\.md$", role: "directory" }],
    }
    expect(() => resolveConfig(augmentation)).toThrow(/role must be 'index' or 'aggregation'/)
  })

  it("records extension semantics and roles in the manifest", async () => {
    const { graph } = await timGraphFixture()
    expect(Object.keys(graph.manifest.relation_semantics).sort()).toEqual(
      [...Object.keys(DEFAULT_RELATION_SEMANTICS), "constrains", "satisfies", "syncs_with"].sort(),
    )
    expect(graph.manifest.relation_semantics["tracks"]).toBeUndefined()
    expect(graph.manifest.node_type_roles["catalog"]).toBe("index")
  })
})
