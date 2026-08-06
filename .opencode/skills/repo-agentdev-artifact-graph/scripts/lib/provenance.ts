import { createHash } from "node:crypto"
import type { EvidenceSeed, Provenance } from "./model.ts"

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

export function makeProvenance(seed: EvidenceSeed): Provenance {
  const matchedTextHash = sha256(seed.matchedText)
  const stableIdentity = [
    seed.path,
    seed.heading,
    seed.elementId,
    matchedTextHash,
    seed.extractionRule,
  ].join("\0")
  return {
    id: `provenance:${sha256(stableIdentity)}`,
    path: seed.path,
    heading: seed.heading,
    element_id: seed.elementId,
    matched_text: seed.matchedText,
    matched_text_hash: matchedTextHash,
    line_start: seed.lineStart,
    line_end: seed.lineEnd,
    extraction_rule: seed.extractionRule,
  }
}
