const V2_PREFIX = "v2:";
const CURRENT_REQ_REF_RE = /\bREQ-\d{3,4}\b/g;
const CURRENT_ADR_REF_RE = /\bADR-\d{3,4}\b/g;
const CURRENT_ADR_INVENTORY_REF_RE = /\bADR-\d{3}\b/g;
const CURRENT_DEC_REF_RE = /\bDEC-\d{3}\b/g;
const HISTORICAL_HEADING_RE =
  /\b(retired|historical)\b|履歴|過去経緯|retired-no-successor|historical-only/i;

function extractRefsWithoutV2Prefix(content: string, pattern: RegExp): string[] {
  const refs: string[] = [];
  const seen = new Set<string>();

  for (const match of content.matchAll(pattern)) {
    const ref = match[0];
    const index = match.index;
    if (ref === undefined || index === undefined) continue;
    if (content.slice(index - V2_PREFIX.length, index) === V2_PREFIX) continue;
    if (seen.has(ref)) continue;
    seen.add(ref);
    refs.push(ref);
  }

  return refs;
}

export function extractCurrentReqRefs(content: string): string[] {
  return extractRefsWithoutV2Prefix(content, CURRENT_REQ_REF_RE);
}

export function extractCurrentAdrRefs(content: string): string[] {
  return extractRefsWithoutV2Prefix(content, CURRENT_ADR_REF_RE);
}

export function extractCurrentDecRefs(content: string): string[] {
  return extractRefsWithoutV2Prefix(content, CURRENT_DEC_REF_RE);
}

export function extractCurrentAdrReadmeInventory(content: string): Set<string> {
  const indexedIds = new Set<string>();
  let historicalSectionLevel: number | undefined;

  for (const line of content.split("\n")) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    const marker = heading?.[1];
    const headingText = heading?.[2];
    if (marker !== undefined && headingText !== undefined) {
      const headingLevel = marker.length;
      if (HISTORICAL_HEADING_RE.test(headingText)) {
        historicalSectionLevel = headingLevel;
      } else if (
        historicalSectionLevel !== undefined &&
        headingLevel <= historicalSectionLevel
      ) {
        historicalSectionLevel = undefined;
      }
    }
    if (historicalSectionLevel !== undefined) continue;

    for (const id of extractRefsWithoutV2Prefix(
      line,
      CURRENT_ADR_INVENTORY_REF_RE,
    )) {
      indexedIds.add(id);
    }
  }

  return indexedIds;
}
