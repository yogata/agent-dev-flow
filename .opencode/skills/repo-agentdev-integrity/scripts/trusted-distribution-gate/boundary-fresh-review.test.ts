// Fresh-review lexical ownership fixes: failing-first coverage.
//
// Each describe maps to a fresh-review case from the goal/code lane at
// 23a076c4. These tests fail against the current code, then pass after
// the authority-aware URL extractor, the bounded docs-path extractor,
// and the ownership-before-cap rewrite land.
//
// Blocker map (fresh-review blocker -> describe):
//   D1 authority parsing (mixed-case host)   -> "D1 authority"
//   D2 host/path lookalike rejection         -> "D2 lookalikes"
//   D3 scheme-less left boundary             -> "D3 scheme-less boundary"
//   D4 docs-path concrete endpoint lexing    -> "D4 docs-path endpoint"
//   D5 standalone left boundary              -> "D5 standalone boundary"
//   D6 ownership-before-cap                  -> "D6 ownership-before-cap"

import { describe, expect, test } from "bun:test";
import {
  classifyLine,
  detectCandidates,
  type Candidate,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function cls(text: string) {
  return classifyLine({ text, lineNumber: 1, filePath: "f.md", projection: "source" }, baseConfig);
}
function gateFor(text: string) {
  const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(files, "source", baseConfig).gate;
}
function urls(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<typeof c, { type: "url" }> => c.type === "url");
}
function paths(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<typeof c, { type: "path" }> => c.type === "path");
}
function directs(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<typeof c, { type: "direct-id" }> => c.type === "direct-id");
}

// D1: authority parsing — mixed-case host must be normalized for classification.
describe("D1 authority / mixed-case host is normalized", () => {
  test("producer mixed-case host https://GITHUB.COM/yogata/agent-dev-flow/blob/main/scripts/install.ps1 fails", () => {
    const text = "See https://GITHUB.COM/yogata/agent-dev-flow/blob/main/scripts/install.ps1 here.";
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(1);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const fail = g.failures.find((d) => d.category === "fixed-url");
    expect(fail?.classification).toBe("producer-internal");
  });

  test("external mixed-case host is one consumer-resolvable URL and passes", () => {
    const text = "See https://GITHUB.COM/Vercel/Next.js/blob/main/x.md here.";
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(1);
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const urlDet = g.failures.concat(g.errors).find((d) => d.category === "fixed-url");
    // Consumer-resolvable URLs do NOT appear in failures/errors; they are allowed.
    expect(urlDet).toBeUndefined();
    const r = cls(text);
    const fixed = r.detections.find((d) => d.category === "fixed-url");
    expect(fixed?.classification).toBe("consumer-resolvable");
  });
});

// D2: host/path lookalikes must NOT be misclassified as GitHub authority.
describe("D2 lookalikes / not GitHub authority", () => {
  const lookalikes: Array<[string, string]> = [
    ["path lookalike", "See https://example.com/github.com/yogata/agent-dev-flow/blob/main/docs/x.md end."],
    ["userinfo deception", "See https://github.com@evil.com/yogata/agent-dev-flow/blob/main/x.md end."],
    ["host suffix", "See https://notgithub.com/yogata/agent-dev-flow/blob/main/x.md end."],
    ["extra dot suffix", "See https://github.com.evil.com/yogata/agent-dev-flow/blob/main/x.md end."],
    ["subdomain", "See https://evil.github.com/yogata/agent-dev-flow/blob/main/x.md end."],
  ];
  for (const [label, text] of lookalikes) {
    test(`${label}: '${text.substring(0, 60)}...' is clean (no URL, no path, gate passes)`, () => {
      const cs = detectCandidates(text, baseConfig);
      expect(urls(cs).length).toBe(0);
      expect(paths(cs).length).toBe(0);
      expect(directs(cs).length).toBe(0);
      expect(gateFor(text).pass).toBe(true);
    });
  }

  test("GitHub host without owner/repo/blob-or-raw shape does not own contained IDs", () => {
    const text = "See https://github.com/ADR-0001/docs/REQ-0001.md end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs)).toEqual([]);
    expect(gateFor(text).pass).toBe(false);
  });

  test("GitHub host with unsupported action does not own contained IDs", () => {
    const text = "See https://github.com/vercel/next.js/notblob/docs/ADR-0001.md end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs)).toEqual([]);
    expect(gateFor(text).pass).toBe(false);
  });

  test("raw host without owner/repo/tail shape does not own contained IDs", () => {
    const text = "See https://raw.githubusercontent.com/ADR-0001 end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs)).toEqual([]);
    expect(gateFor(text).pass).toBe(false);
  });
});

// D3: scheme-less forms are retained but require a valid left boundary.
describe("D3 scheme-less boundary / lowercase + mixed-case retained at valid boundary", () => {
  test("scheme-less lowercase github.com/yogata/agent-dev-flow/blob/main/x.md is extracted", () => {
    const text = "See github.com/yogata/agent-dev-flow/blob/main/x.md here.";
    expect(urls(detectCandidates(text, baseConfig)).length).toBe(1);
  });

  test("scheme-less mixed-case GITHUB.COM/yogata/agent-dev-flow/blob/main/x.md is extracted", () => {
    const text = "See GITHUB.COM/yogata/agent-dev-flow/blob/main/x.md here.";
    expect(urls(detectCandidates(text, baseConfig)).length).toBe(1);
  });

  test("scheme-less raw.githubusercontent.com/yogata/agent-dev-flow/main/x.md is extracted", () => {
    const text = "See raw.githubusercontent.com/yogata/agent-dev-flow/main/x.md here.";
    expect(urls(detectCandidates(text, baseConfig)).length).toBe(1);
  });

  test("scheme-less mixed-case RAW.GITHUBUSERCONTENT.COM/yogata/agent-dev-flow/main/x.md is extracted", () => {
    const text = "See RAW.GITHUBUSERCONTENT.COM/yogata/agent-dev-flow/main/x.md here.";
    expect(urls(detectCandidates(text, baseConfig)).length).toBe(1);
  });

  test("scheme-less 'Xgithub.com/...' is NOT extracted (no left boundary)", () => {
    const text = "See Xgithub.com/yogata/agent-dev-flow/blob/main/x.md here.";
    expect(urls(detectCandidates(text, baseConfig)).length).toBe(0);
  });

  test("scheme-less 'github.com.evil.com/...' is NOT extracted (host not exact)", () => {
    const text = "See github.com.evil.com/yogata/agent-dev-flow/blob/main/x.md here.";
    expect(urls(detectCandidates(text, baseConfig)).length).toBe(0);
  });
});

// D4: docs-path extractor must terminate concrete evidence at the actual .md
// endpoint. Trailing sentence punctuation, fragment, and query must NOT make
// the path generic. Mixed `/`, `\`, `%2F` separators are supported throughout.
// `.md.bak` is NOT matched.
describe("D4 docs-path endpoint / lexing terminates at .md", () => {
  test("docs/requirements/REQ-0001.md. (trailing period) is concrete producer-internal", () => {
    const r = cls("See docs/requirements/REQ-0001.md.");
    const path = r.detections.find((d) => d.category === "concrete-path");
    expect(path?.classification).toBe("producer-internal");
    expect(path?.matched).toBe("docs/requirements/REQ-0001.md");
  });

  test("comma/semicolon/colon/Japanese punctuation after .md is concrete", () => {
    for (const punct of [",", ";", ":", "\u3002", "\u3001"]) {
      const text = `See docs/requirements/REQ-0001.md${punct} after.`;
      const path = cls(text).detections.find((d) => d.category === "concrete-path");
      expect(path?.classification).toBe("producer-internal");
      expect(path?.matched).toBe("docs/requirements/REQ-0001.md");
    }
  });

  test("docs/specs/foo.md#acceptance is concrete (fragment does not hide .md)", () => {
    const path = cls("See docs/specs/foo.md#acceptance for details.").detections.find((d) => d.category === "concrete-path");
    expect(path?.classification).toBe("producer-internal");
    expect(path?.matched).toBe("docs/specs/foo.md");
  });

  test("docs/specs/foo.md?x=1 is concrete (query does not hide .md)", () => {
    const path = cls("See docs/specs/foo.md?x=1 for details.").detections.find((d) => d.category === "concrete-path");
    expect(path?.classification).toBe("producer-internal");
    expect(path?.matched).toBe("docs/specs/foo.md");
  });

  test("multi-level docs\\specs\\foundations\\system.md is concrete", () => {
    const r = cls("See docs\\specs\\foundations\\system.md here.");
    const path = r.detections.find((d) => d.category === "concrete-path");
    expect(path?.classification).toBe("producer-internal");
  });

  test("mixed slash/backslash/percent docs%2Fspecs\\foundations/system.md is concrete", () => {
    const r = cls("See docs%2Fspecs\\foundations/system.md here.");
    const path = r.detections.find((d) => d.category === "concrete-path");
    expect(path?.classification).toBe("producer-internal");
  });

  test("non-ASCII markdown filename is concrete", () => {
    const path = cls("See docs/specs/foundations/設計.md here.").detections
      .find((d) => d.category === "concrete-path");
    expect(path?.classification).toBe("producer-internal");
  });

  test(".md.bak is NOT concrete (matched path rejects .md.bak as endpoint)", () => {
    const r = cls("See docs/specs/foo.md.bak here.");
    const concrete = r.detections.find((d) => d.category === "concrete-path" && d.classification === "producer-internal");
    expect(concrete).toBeUndefined();
  });
});

// D5: standalone left boundary for `docs`. Identifier-char and `/`/`\\`
// predecessors are rejected (the URL/path owns the region).
describe("D5 standalone boundary / docs preceded by identifier or separator is clean", () => {
  test("mydocs/specs/public.md is clean (docs preceded by identifier char)", () => {
    const r = cls("See mydocs/specs/public.md here.");
    expect(r.detections.filter((d) => d.category === "concrete-path")).toEqual([]);
  });

  test("docs inside URL path (/docs/specs/x.md) is NOT extracted as a separate path", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/docs/specs/x.md end.";
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
    // URL owns the docs span.
    expect(urls(cs).length).toBe(1);
  });
});

// D6: ownership-before-cap. Contained IDs/paths never consume the candidate
// cap; URLs alone are one candidate; standalone IDs still cap/fail closed.
describe("D6 ownership-before-cap / contained candidates do not consume cap", () => {
  test("exactly 63 external URL owners do not overflow", () => {
    const text = Array.from(
      { length: 63 },
      (_, i) => `https://github.com/ext${i}/repo/blob/main/x.md`,
    ).join(" ");
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs)).toHaveLength(63);
    expect(cs.some((c) => c.type === "overflow")).toBe(false);
  });

  test("64 external URL owners produce candidate overflow", () => {
    const text = Array.from(
      { length: 64 },
      (_, i) => `https://github.com/ext${i}/repo/blob/main/x.md`,
    ).join(" ");
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs)).toHaveLength(63);
    expect(cs.some((c) => c.type === "overflow")).toBe(true);
  });

  test("external URL with 70+ producer-looking IDs is one consumer-resolvable URL, no overflow, passes", () => {
    const ids = Array.from({ length: 75 }, (_, i) => `ADR-${String(i + 1).padStart(4, "0")}`).join("/");
    const text = `See https://github.com/vercel/next.js/blob/main/${ids}/x.md end.`;
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(1);
    expect(directs(cs).length).toBe(0);
    expect(cs.some((c) => c.type === "overflow")).toBe(false);
    expect(gateFor(text).pass).toBe(true);
  });

  test("producer URL with 70+ producer-looking IDs is one producer-internal failure, no overflow", () => {
    const ids = Array.from({ length: 75 }, (_, i) => `ADR-${String(i + 1).padStart(4, "0")}`).join("/");
    const text = `See https://github.com/yogata/agent-dev-flow/blob/main/${ids}/x.md end.`;
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(1);
    expect(directs(cs).length).toBe(0);
    expect(cs.some((c) => c.type === "overflow")).toBe(false);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.filter((d) => d.category === "fixed-url")).toHaveLength(1);
  });

  test("standalone ID adjacent to a URL is still detected", () => {
    const text = "See ADR-0001 and https://github.com/vercel/next.js/blob/main/x.md end.";
    const direct = directs(detectCandidates(text, baseConfig)).find((c) => c.value === "ADR-0001");
    expect(direct).toBeDefined();
  });

  test("standalone docs path adjacent to a URL is still detected", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md and docs/requirements/REQ-0001.md end.";
    const path = paths(detectCandidates(text, baseConfig));
    expect(path.length).toBe(1);
    expect(path[0]?.value).toBe("docs/requirements/REQ-0001.md");
  });

  test("100 standalone IDs outside URLs still cap/fail closed (overflow)", () => {
    const text = Array.from({ length: 100 }, (_, i) => `ADR-${String(i + 1).padStart(4, "0")}`).join(" ");
    const cs = detectCandidates(text, baseConfig);
    expect(cs.length).toBeLessThanOrEqual(65);
    expect(cs.some((c) => c.type === "overflow")).toBe(true);
    expect(gateFor(text).pass).toBe(false);
  });
});
