// Consolidated gate-level boundary tests (Wave-2, Issue #4154).
//
// Preserves the meaningful defensive coverage of the deleted
// version-history review test files (boundary-review-v5..v9,
// boundary-fresh-review, boundary-fresh-review-v2) that is NOT already
// held by the surviving suites (boundary-pipeline.test.ts,
// boundary-pipeline-evasion.test.ts, boundary-span-overflow.test.ts,
// boundary-gate-bounds.test.ts, boundary-ownership.test.ts,
// boundary-pipeline-helpers.test.ts, distribution-boundary.test.ts).
//
// Consolidation map (deleted file -> describe block here):
//   - v5-url-scheme / v6-url-lexical / v7-url-normalization /
//     v8-triple-decode / v8-url-query-assignment / v9-delimiter-host
//       -> "URL evasion taxonomy" (malformed emission fail-closed)
//   - v5-authority / v7-authority
//       -> "URL authority fail-closed" + unit tables
//   - v5-url-terminator / em-dash case of v6-url-lexical
//       -> "URL terminator matrix"
//   - v6-url-ownership / v7-url-span-linear / v5-url-ownership-pipeline /
//     v5-url-ownership-path (span geometry unique cases)
//       -> "URL ownership span split" / "URL cap and ownership interactions"
//   - v5-depth / v5-encoded / v5-rejection / v6-docs-prefix / v7-docs-path
//       -> "docs path prefix grammar"
//   - v7-docs-path (left boundary) / v8-cjk-path-stop (terminator)
//       -> "docs path CJK boundaries"
//   - boundary-fresh-review D4 (endpoint) / D2 (lookalikes)
//       -> "docs path .md endpoint" / "URL lookalike rejection"
//   - v8-docs-prefix-perf / v6-url-linear / v7-url-span-linear #7
//       -> "linear and performance bounds"
//   - v6-id-state -> "GENERIC_ID_PATTERN statelessness"
//   - repeated regression controls -> "regression controls"
//
// Side-effect-free: pure functions only, no I/O.

import { describe, expect, test } from "bun:test";
import {
  detectCandidates,
  GENERIC_ID_PATTERN,
  normalizePathToken,
  resolveCandidate,
  type Candidate,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
import { decideProjection } from "./boundary-gate.ts";
import { extractUrls } from "./boundary-url-parser.ts";
import { extractDocsPaths } from "./boundary-docs-path-parser.ts";
import { classifyAuthority, parseUrlHost } from "./boundary-url-authority.ts";

const baseConfig: DetectorConfig = {
  repository_identity: {
    owner_slash_name: "yogata/agent-dev-flow",
    default_branch: "main",
  },
  producer_internal_id_prefixes: [
    "ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC",
  ],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

const PRODUCER_URL = "https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md";
const CONSUMER_URL = "https://github.com/vercel/next.js/blob/main/docs/tutorial.md";

// ─── Shared assertion helpers ────────────────────────────────────────────

type UrlCandidate = Extract<Candidate, { type: "url" }>;

function candidates(line: string): Candidate[] {
  return detectCandidates(line, baseConfig);
}

function urlCandidates(line: string): UrlCandidate[] {
  return candidates(line).filter((c): c is UrlCandidate => c.type === "url");
}

function pathValues(line: string): string[] {
  return candidates(line)
    .filter((c): c is Extract<Candidate, { type: "path" }> => c.type === "path")
    .map((c) => c.value);
}

function normPathValues(line: string): string[] {
  return pathValues(line).map((v) => normalizePathToken(v));
}

function gateFor(text: string) {
  return decideProjection(
    [{ filePath: "f.md", projection: "source", text }],
    "source",
    baseConfig,
  ).gate;
}

function expectClean(line: string): void {
  const g = gateFor(line);
  expect(g.pass).toBe(true);
  expect(g.failures).toHaveLength(0);
  expect(g.errors).toHaveLength(0);
}

function expectProducerFailure(line: string, matched?: string): void {
  const g = gateFor(line);
  expect(g.pass).toBe(false);
  expect(g.failures.length).toBeGreaterThanOrEqual(1);
  if (matched !== undefined) {
    expect(g.failures.some((d) => d.matched === matched)).toBe(true);
  }
}

/** Deleted v7-url-normalization / v8-url-query-assignment / v9-delimiter-host
 *  shared shape: exactly one malformed URL candidate with no ownership span,
 *  reported as an evasion-attempt gate error (fail-closed). */
function expectMalformedEvasion(line: string): void {
  const urls = urlCandidates(line);
  expect(urls).toHaveLength(1);
  const u = urls[0]!;
  expect(u.malformed).toBe(true);
  expect(u.ownershipSpan).toBeNull();
  const g = gateFor(line);
  expect(g.pass).toBe(false);
  expect(g.errors.length).toBeGreaterThanOrEqual(1);
  expect(g.errors.some((d) => d.category === "evasion-attempt")).toBe(true);
}

// ─── Regression controls (Group F boilerplate from 12+ deleted files) ────

describe("regression controls", () => {
  test("valid producer URL fails the gate (producer-internal/fixed-url)", () => {
    const g = gateFor(PRODUCER_URL);
    expect(g.pass).toBe(false);
    expect(g.errors).toHaveLength(0);
    const f = g.failures[0]!;
    expect(f.classification).toBe("producer-internal");
    expect(f.category).toBe("fixed-url");
  });

  test("valid consumer URL passes the gate", () => {
    expectClean(CONSUMER_URL);
  });

  test("userinfo deception github.com@evil.com emits no URL and passes", () => {
    expect(urlCandidates("See https://github.com@evil.com/yogata/agent-dev-flow/x.md")).toHaveLength(0);
    expectClean("https://github.com@evil.com/yogata/agent-dev-flow/x.md");
    expect(urlCandidates("github.com@evil.com/yogata/agent-dev-flow/x.md")).toHaveLength(0);
  });

  test("mixed-case host normalizes for producer/consumer classification", () => {
    expectProducerFailure("See https://GITHUB.COM/yogata/agent-dev-flow/blob/main/docs/foo.md");
    expectClean("See https://GITHUB.COM/vercel/next.js/blob/main/docs/tutorial.md");
  });
});

// ─── URL evasion taxonomy (v5-url-scheme, v6-url-lexical,
//     v7-url-normalization, v8-triple-decode, v8-url-query-assignment,
//     v9-delimiter-host, fresh-review-v2 T1.5) ─────────────────────────────

describe("URL evasion taxonomy: unsupported and composite schemes", () => {
  test("unsupported scheme ftp:// is emitted malformed (fail-closed)", () => {
    expectMalformedEvasion("See ftp://github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("unsupported scheme evil:// is emitted malformed", () => {
    expectMalformedEvasion("Read evil://github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("composite scheme git+https:// is emitted malformed", () => {
    expectMalformedEvasion("Clone git+https://github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("composite scheme abchttps:// is emitted malformed", () => {
    expectMalformedEvasion("Browse abchttps://github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("schemed assignment url=https:// stays a valid producer URL", () => {
    const urls = urlCandidates("url=https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md");
    expect(urls).toHaveLength(1);
    expect(urls[0]!.malformed).toBe(false);
    expectProducerFailure("url=https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md");
  });
});

describe("URL evasion taxonomy: encoded and Unicode-dot hosts", () => {
  test("single percent-encoded host %67ithub.com is malformed", () => {
    expectMalformedEvasion("%67ithub.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("encoded dot host github%2ecom is malformed", () => {
    expectMalformedEvasion("github%2ecom/yogata/agent-dev-flow/docs/foo.md");
  });

  test("double percent-encoded host %2567ithub.com is malformed", () => {
    expectMalformedEvasion("%2567ithub.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("triple percent-encoded host %252567ithub.com is malformed", () => {
    expectMalformedEvasion("%252567ithub.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("ideographic full stop host github\\u3002com is malformed", () => {
    expectMalformedEvasion("github\u3002com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("halfwidth ideographic full stop host github\\uFF61com is malformed", () => {
    expectMalformedEvasion("github\uFF61com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("fullwidth full stop host github\\uFF0Ecom is malformed", () => {
    expectMalformedEvasion("github\uFF0Ecom/yogata/agent-dev-flow/docs/foo.md");
  });

  test("UTF-8 percent-encoded ideographic dot host is malformed", () => {
    expectMalformedEvasion("github%E3%80%82com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("uppercase host after Unicode dot GITHUB\\u3002COM is malformed", () => {
    expectMalformedEvasion("GITHUB\u3002COM/yogata/agent-dev-flow/docs/foo.md");
  });
});

describe("URL evasion taxonomy: slash variants and dot segments", () => {
  test("four leading slashes https://// is malformed", () => {
    expectMalformedEvasion("https:////github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("zero-slash scheme https:host is malformed (WHATWG)", () => {
    expectMalformedEvasion("https:github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("one-slash scheme https:/host is malformed (WHATWG)", () => {
    expectMalformedEvasion("https:/github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("literal .. dot segment in producer URL path is malformed", () => {
    expectMalformedEvasion("https://github.com/yogata/decoy/../blob/main/docs/foo.md");
  });

  test("encoded %2e%2e dot segment is malformed", () => {
    expectMalformedEvasion("https://github.com/yogata/%2e%2e/docs/foo.md");
  });

  test("mixed .%2e dot segment is malformed", () => {
    expectMalformedEvasion("https://github.com/yogata/decoy/.%2e/docs/foo.md");
  });

  test("mixed %2e. dot segment is malformed", () => {
    expectMalformedEvasion("https://github.com/yogata/decoy/%2e./docs/foo.md");
  });

  test("backslash in URL path is malformed with lexical-extent span", () => {
    const line = "See https://github.com/yogata/a\\b/blob/main/docs/foo.md ADR-0001";
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(1);
    const u = urls[0]!;
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    const backslashIdx = line.indexOf("\\");
    expect(u.span.end).toBeGreaterThan(backslashIdx);
    // The reconstructed-looking ID after the malformed URL stays visible.
    expectProducerFailure(line, "ADR-0001");
  });
});

describe("URL evasion taxonomy: delimiter-host forms", () => {
  test("scheme-less host after ':' label delimiter is malformed", () => {
    expectMalformedEvasion("label:github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("scheme-less host after '?' delimiter is malformed", () => {
    expectMalformedEvasion("page?github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("scheme-less host after '#' delimiter is malformed", () => {
    expectMalformedEvasion("anchor#github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("scheme-less host after '=' assignment is malformed", () => {
    expectMalformedEvasion("next=github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("scheme-less host after '&' assignment is malformed", () => {
    expectMalformedEvasion("a=1&link=github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("scheme-less host inside external URL query is malformed", () => {
    expectMalformedEvasion("https://example.com/page?next=github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("schemed URL after ':' delimiter is accepted as producer", () => {
    const line = "label:https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md";
    expectProducerFailure(line);
    const urls = urlCandidates(line);
    expect(urls[0]!.malformed).toBe(false);
    expect(urls[0]!.ownershipSpan).not.toBeNull();
  });

  test("schemed URL after '?' delimiter is accepted and classified", () => {
    expectClean("page?https://github.com/vercel/next.js/blob/main/docs/tutorial.md");
    expectProducerFailure("page?https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md");
  });
});

// ─── URL authority fail-closed (v5-authority, v7-authority) ─────────────

describe("URL authority fail-closed: ports", () => {
  test("scheme default ports 443/80 are valid", () => {
    expectProducerFailure("https://github.com:443/yogata/agent-dev-flow/blob/main/docs/foo.md");
    expectProducerFailure("http://github.com:80/yogata/agent-dev-flow/blob/main/docs/foo.md");
  });

  test("non-default port 8080 is malformed", () => {
    expectMalformedEvasion("https://github.com:8080/yogata/agent-dev-flow/docs/foo.md");
  });

  test("wrong scheme-default port https:80 is malformed", () => {
    expectMalformedEvasion("https://github.com:80/yogata/agent-dev-flow/docs/foo.md");
  });

  test("wrong scheme-default port http:443 is malformed", () => {
    expectMalformedEvasion("http://github.com:443/yogata/agent-dev-flow/docs/foo.md");
  });

  test("non-numeric port :abc is malformed", () => {
    expectMalformedEvasion("https://github.com:abc/yogata/agent-dev-flow/docs/foo.md");
  });

  test("out-of-range port :99999 is malformed", () => {
    expectMalformedEvasion("https://github.com:99999/yogata/agent-dev-flow/docs/foo.md");
  });

  test("scheme-less URL with port is malformed", () => {
    expectMalformedEvasion("github.com:8080/yogata/agent-dev-flow/docs/foo.md");
  });

  test("scheme-less userinfo+port user@github.com:443 is malformed", () => {
    expectMalformedEvasion("user@github.com:443/yogata/agent-dev-flow/docs/foo.md");
  });
});

describe("URL authority fail-closed: backslash authorities", () => {
  test("backslash authority evil.com\\@github.com is malformed and does not hide the path", () => {
    const line = "See https://evil.com\\@github.com/yogata/agent-dev-flow/x.md ADR-0001";
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(1);
    expect(urls[0]!.malformed).toBe(true);
    expect(urls[0]!.ownershipSpan).toBeNull();
    // The malformed span must NOT cover the trailing reference.
    expect(urls[0]!.span.end).toBeLessThan(line.indexOf("ADR-0001"));
    expectProducerFailure(line, "ADR-0001");
  });

  test("reversed backslash authority github.com\\@evil.com is malformed", () => {
    expectMalformedEvasion("https://github.com\\@evil.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("no-@ backslash authority github.com\\evil.com is malformed", () => {
    expectMalformedEvasion("https://github.com\\evil.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("userinfo backslash user\\name@github.com is malformed", () => {
    expectMalformedEvasion("https://user\\name@github.com/yogata/agent-dev-flow/docs/foo.md");
  });

  test("\\u0041DR-0001 near a malformed URL stays independently visible", () => {
    const line = "https://evil.com\\@github.com/x.md \\u0041DR-0001";
    const g = gateFor(line);
    expect(g.pass).toBe(false);
    // reconstructed-id -> evasion-attempt error, plus the malformed URL error.
    expect(g.errors.some((d) => d.category === "evasion-attempt")).toBe(true);
  });
});

describe("authority unit tables (v5-authority C3.8/C3.9)", () => {
  test("parseUrlHost host table", () => {
    expect(parseUrlHost("https://github.com:443/a")).toBe("github.com");
    expect(parseUrlHost("http://github.com:80/a")).toBe("github.com");
    expect(parseUrlHost("https://github.com/a")).toBe("github.com");
    expect(parseUrlHost("github.com/a")).toBe("github.com");
    expect(parseUrlHost("https://github.com:8080/a")).toBeNull();
    expect(parseUrlHost("https://github.com:80/a")).toBeNull();
    expect(parseUrlHost("https://evil.com\\@github.com/a")).toBeNull();
    expect(parseUrlHost("https://github.com@evil.com/a")).toBeNull();
    expect(parseUrlHost("https://notgithub.com/a")).toBeNull();
  });

  test("classifyAuthority kind/host table", () => {
    expect(classifyAuthority("https://github.com:443/a")).toEqual({ kind: "valid", host: "github.com" });
    expect(classifyAuthority("http://github.com:80/a")).toEqual({ kind: "valid", host: "github.com" });
    expect(classifyAuthority("https://github.com:8080/a")).toEqual({ kind: "malformed", host: "github.com" });
    expect(classifyAuthority("github.com:8080/a")).toEqual({ kind: "malformed", host: "github.com" });
    expect(classifyAuthority("https://evil.com\\@github.com/a")).toEqual({ kind: "malformed", host: "github.com" });
    expect(classifyAuthority("https://user\\name@github.com/a")).toEqual({ kind: "malformed", host: "github.com" });
    expect(classifyAuthority("https://github.com@evil.com/a")).toEqual({ kind: "rejected", host: null });
    expect(classifyAuthority("https://notgithub.com/a")).toEqual({ kind: "rejected", host: null });
  });
});

// ─── URL terminator matrix (v5-url-terminator, em-dash of v6-url-lexical) ─

describe("URL terminator matrix", () => {
  const urlBase = "https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md";

  test("ASCII colon after the path terminates the URL", () => {
    const line = `${urlBase}:docs/specs/foo.md`;
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(1);
    expect(urls[0]!.value.endsWith(".md")).toBe(true);
    expect(pathValues(line)).toContain("docs/specs/foo.md");
  });

  test("full-width colon U+FF1A terminates the URL", () => {
    const line = `${urlBase}\uFF1AADR-0001`;
    expect(urlCandidates(line)).toHaveLength(1);
    expect(urlCandidates(line)[0]!.value.endsWith(".md")).toBe(true);
    expectProducerFailure(line, "ADR-0001");
  });

  test("opening delimiters ( [ { terminate the URL", () => {
    for (const open of ["(", "[", "{"]) {
      const line = `Result ${open}${urlBase} is concrete`;
      const urls = urlCandidates(line);
      expect(urls).toHaveLength(1);
      expect(urls[0]!.value).toBe(urlBase);
    }
  });

  test("colons inside query strings stay inside the URL", () => {
    const line = `${urlBase}?q=a:b`;
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(1);
    expect(urls[0]!.value.endsWith("?q=a:b")).toBe(true);
    expect(urls[0]!.ownershipSpan).not.toBeNull();
  });

  test("colons inside fragments stay inside the URL", () => {
    const line = `${urlBase}#frag:c`;
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(1);
    expect(urls[0]!.value.endsWith("#frag:c")).toBe(true);
  });

  test("em dash U+2014 terminates the URL and exposes trailing IDs", () => {
    const line = `${urlBase}\u2014ADR-0001`;
    expect(urlCandidates(line)).toHaveLength(1);
    expect(urlCandidates(line)[0]!.value.endsWith(".md")).toBe(true);
    expectProducerFailure(line, "ADR-0001");
  });

  test("comma, full-width comma, and semicolon terminate the URL", () => {
    for (const [sep] of [[","], ["\uFF0C"], [";"]] as const) {
      const line = `${urlBase}${sep} ADR-0001`;
      const urls = urlCandidates(line);
      expect(urls).toHaveLength(1);
      expect(urls[0]!.value.endsWith(".md")).toBe(true);
      expectProducerFailure(line, "ADR-0001");
    }
  });
});

// ─── URL ownership span split (v6-url-ownership, v7-url-span-linear) ────

describe("URL ownership span split", () => {
  test("query ID after ? is visible outside the ownership span", () => {
    const line = "https://example.com/vercel/next.js?ref=ADR-1";
    const g = gateFor(line);
    expect(g.pass).toBe(false);
    expect(g.errors).toHaveLength(0);
    const f = g.failures.find((d) => d.matched === "ADR-1")!;
    expect(f).toBeDefined();
    expect(f.classification).toBe("producer-internal");
    expect(f.category).toBe("concrete-id");
  });

  test("docs path after # is visible outside the ownership span", () => {
    const line = "https://example.com/vercel/next.js#docs/specs/foo.md";
    const g = gateFor(line);
    expect(g.pass).toBe(false);
    expect(g.failures.some((d) => d.category === "concrete-path")).toBe(true);
  });

  test("nested producer URL in an external URL's query is independently detected", () => {
    const line = `https://example.com/page?next=${PRODUCER_URL}`;
    const g = gateFor(line);
    expect(g.pass).toBe(false);
    expect(g.failures.some((d) => d.category === "fixed-url" && d.classification === "producer-internal")).toBe(true);
  });

  test("userinfo-embedded producer ID is visible (ownershipSpan starts at path slash)", () => {
    const line = "https://ADR-0001@github.com/yogata/agent-dev-flow/blob/main/x.md";
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(1);
    const u = urls[0]!;
    expect(u.malformed).toBe(false);
    expect(u.ownershipSpan).not.toBeNull();
    // Ownership starts at the first path slash after the authority, NOT at
    // the URL start, so the userinfo ID must stay visible.
    expect(u.ownershipSpan!.start).toBeGreaterThan(line.indexOf("@"));
    expectProducerFailure(line, "ADR-0001");
  });

  test("evasion host inside an external URL's query is emitted independently (ownershipSpan dedup)", () => {
    const line = "https://github.com/vercel/next.js/blob/main?next=%67ithub.com/x";
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(2);
    expect(urls.some((u) => u.malformed)).toBe(true);
    const g = gateFor(line);
    expect(g.pass).toBe(false);
    expect(g.errors.some((d) => d.category === "evasion-attempt")).toBe(true);
  });

  test("malformed URL span is truncated to the authority (url.value assertion)", () => {
    const line = "https://evil.com\\@github.com/yogata/agent-dev-flow/x.md";
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(1);
    expect(urls[0]!.value).toBe("https://evil.com\\@github.com");
  });
});

// ─── Multi-URL span independence (v5-url-scheme C2.1/C2.2) ──────────────

describe("multi-URL span independence", () => {
  test("two scheme URLs do not overlap", () => {
    const line = `${PRODUCER_URL} and ${CONSUMER_URL}`;
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(2);
    expect(urls[0]!.span.end <= urls[1]!.span.start).toBe(true);
    expectProducerFailure(line, "https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md");
  });

  test("bare host after a scheme URL never grabs the earlier scheme", () => {
    const line = "https://github.com/vercel/next.js/blob/main/a.md github.com/yogata/agent-dev-flow/blob/main/docs/foo.md";
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(2);
    const bare = urls.find((u) => u.value.startsWith("github.com/"))!;
    expect(bare).toBeDefined();
    expect(bare.value.startsWith("https://")).toBe(false);
    expectProducerFailure(line);
  });

  test("bare scheme-less producer URL at a valid left boundary is extracted", () => {
    const line = "See github.com/yogata/agent-dev-flow/blob/main/docs/foo.md and GitHub.com/yogata/agent-dev-flow/blob/main/docs/bar.md";
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(2);
    expectProducerFailure(line);
  });

  test("scheme-less host without blob/raw shape emits no URL (contained IDs stay owned)", () => {
    const line = "See github.com/ADR-0001/docs/adr/ADR-0002.md";
    expect(urlCandidates(line)).toHaveLength(0);
    expectProducerFailure(line, "ADR-0001");
    expectProducerFailure(line, "ADR-0002");
  });
});

// ─── URL lookalike rejection (fresh-review D2) ──────────────────────────

describe("URL lookalike rejection", () => {
  test("path lookalike example.com/github.com is not a URL candidate", () => {
    expectClean("See example.com/github.com/blob/main/docs/foo.md for details");
  });

  test("host suffix notgithub.com is not a URL candidate", () => {
    expectClean("See notgithub.com/yogata/agent-dev-flow/x.md");
  });

  test("extra dot github.com.evil.com is not a URL candidate", () => {
    expectClean("See github.com.evil.com/yogata/agent-dev-flow/x.md");
  });

  test("subdomain evil.github.com is not a URL candidate", () => {
    expectClean("See evil.github.com/yogata/agent-dev-flow/x.md");
  });
});

// ─── URL cap and ownership interactions (fresh-review D6) ───────────────

describe("URL cap and ownership interactions", () => {
  test("63 external URL owners: no overflow, gate passes", () => {
    const line = Array.from({ length: 63 }, (_, i) => `https://github.com/org${i}/repo${i}/blob/main/x${i}.md`).join(" ");
    const r = extractUrls(line, 63);
    expect(r.urls).toHaveLength(63);
    expect(r.overflow).toBe(false);
    expectClean(line);
  });

  test("64th external URL triggers overflow and the gate fails closed", () => {
    const line = Array.from({ length: 64 }, (_, i) => `https://github.com/org${i}/repo${i}/blob/main/x${i}.md`).join(" ");
    const g = gateFor(line);
    expect(g.pass).toBe(false);
    expect(g.errors.some((d) => d.category === "evasion-attempt")).toBe(true);
  });

  test("IDs inside an external URL do not consume the candidate cap", () => {
    const ids = Array.from({ length: 75 }, (_, i) => `ADR-${String(1000 + i).padStart(4, "0")}`).join("/");
    const line = `https://github.com/vercel/next.js/blob/main/${ids}`;
    const g = gateFor(line);
    expect(g.pass).toBe(true);
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(1);
  });

  test("IDs inside a producer URL are suppressed into one fixed-url failure", () => {
    const ids = Array.from({ length: 75 }, (_, i) => `ADR-${String(1000 + i).padStart(4, "0")}`).join("/");
    const line = `https://github.com/yogata/agent-dev-flow/blob/main/${ids}`;
    const g = gateFor(line);
    expect(g.pass).toBe(false);
    expect(g.failures).toHaveLength(1);
    expect(g.failures[0]!.category).toBe("fixed-url");
  });

  test("100 standalone IDs are capped with a typed overflow (fail-closed)", () => {
    const line = Array.from({ length: 100 }, (_, i) => `ADR-${String(2000 + i).padStart(4, "0")}`).join(" ");
    const g = gateFor(line);
    expect(g.pass).toBe(false);
    expect(g.errors.some((d) => d.category === "evasion-attempt")).toBe(true);
  });

  test("query-ID cap: 62 IDs stay overflow-free, 63 trigger a typed overflow", () => {
    const mk = (n: number) =>
      `https://github.com/vercel/next.js/blob/main?${Array.from({ length: n }, (_, i) => `a${i}=REQ-${String(1000 + i).padStart(4, "0")}`).join("&")}`;
    const cs62 = candidates(mk(62));
    expect(cs62).toHaveLength(63); // 1 URL + 62 query IDs = candidate cap exactly
    expect(cs62.some((c) => c.type === "overflow")).toBe(false);
    const cs63 = candidates(mk(63));
    expect(cs63.some((c) => c.type === "overflow")).toBe(true);
    const g = gateFor(mk(63));
    expect(g.pass).toBe(false);
    expect(g.errors.some((d) => d.category === "evasion-attempt")).toBe(true);
  });
});

// ─── Linear and performance bounds (v6-url-linear, v7-url-span-linear #7,
//     v8-docs-prefix-perf) ────────────────────────────────────────────────

describe("linear and performance bounds", () => {
  test("URL scanner steps stay linear on a 50K userinfo authority", () => {
    const line = `https://${"u.".repeat(20000)}github.com/yogata/agent-dev-flow/x.md`;
    const r = extractUrls(line, 500);
    expect(r.steps).toBeLessThanOrEqual(16 * line.length + 64);
  });

  test("URL scanner steps stay linear with 100 URLs on one line", () => {
    const line = Array.from({ length: 100 }, (_, i) => `https://github.com/o${i}/r/blob/main/docs/a${i}.md`).join(" ");
    const r = extractUrls(line, 500);
    expect(r.steps).toBeLessThanOrEqual(16 * line.length + 64);
  });

  test("repeated host run github.com/.repeat(1000) stays linear", () => {
    const line = "github.com/".repeat(1000);
    const r = extractUrls(line, 500);
    expect(r.steps).toBeLessThanOrEqual(16 * line.length + 64);
  });

  test("repeated host run with trailing ADR keeps the ID visible and fails", () => {
    const line = "github.com/".repeat(500) + " ADR-0001";
    const r = extractUrls(line, 500);
    expect(r.steps).toBeLessThanOrEqual(16 * line.length + 64);
    expectProducerFailure(line, "ADR-0001");
  });

  test("docs-prefix scan stays linear on a 48K adversarial line (under 1000ms)", () => {
    const line = "a/docs".repeat(8000);
    const t0 = Date.now();
    const r = extractDocsPaths(line, 63);
    const elapsed = Date.now() - t0;
    expect(r.paths).toHaveLength(0);
    expect(r.overflow).toBe(false);
    expect(elapsed).toBeLessThan(1000);
  });

  test("dot-segment cancel a/b/c/../../../docs still yields one path", () => {
    const r = extractDocsPaths("a/b/c/../../../docs/specs/foo.md", 63);
    expect(r.paths).toHaveLength(1);
    expect(r.paths[0]!.value).toBe("docs/specs/foo.md");
  });
});

// ─── GENERIC_ID_PATTERN statelessness (v6-id-state) ─────────────────────

describe("GENERIC_ID_PATTERN statelessness", () => {
  test("repeated .test() calls return consistent results", () => {
    expect(GENERIC_ID_PATTERN.test("REQ-1234")).toBe(true);
    expect(GENERIC_ID_PATTERN.test("REQ-1234")).toBe(true);
    expect(GENERIC_ID_PATTERN.test("DEC-5678")).toBe(true);
    expect(GENERIC_ID_PATTERN.test("SPEC-9999")).toBe(true);
    expect(GENERIC_ID_PATTERN.test("REQ-1234")).toBe(true);
    expect(GENERIC_ID_PATTERN.test("no id here")).toBe(false);
    expect(GENERIC_ID_PATTERN.test("no id here")).toBe(false);
  });

  test("detectCandidates is idempotent across repeated calls", () => {
    const line = "Fix ADR-0001 with REQ-0002 and DEC-0003 and SPEC-0004";
    const first = candidates(line);
    const second = candidates(line);
    expect(second).toEqual(first);
  });

  test("detectCandidates and .test() interleave without interference", () => {
    expect(GENERIC_ID_PATTERN.test("ADR-0001")).toBe(true);
    expect(candidates("Fix ADR-0001 first")).toHaveLength(1);
    expect(GENERIC_ID_PATTERN.test("ADR-0001")).toBe(true);
    expect(candidates("No ids in this line")).toHaveLength(0);
    expect(GENERIC_ID_PATTERN.test("no match")).toBe(false);
  });

  test("all four ID families on one line are extracted in order", () => {
    const line = "ADR-0001 then REQ-0002 then DEC-0003 then SPEC-0004";
    const ids = candidates(line).filter((c) => c.type === "direct-id");
    expect(ids.map((c) => (c as Extract<Candidate, { type: "direct-id" }>).value)).toEqual([
      "ADR-0001", "REQ-0002", "DEC-0003", "SPEC-0004",
    ]);
  });

  test("UTF encoding labels are not ID candidates", () => {
    const line = "UTF-8 and UTF-16 and UTF-32 encodings";
    expect(candidates(line)).toHaveLength(0);
  });
});

// ─── docs path prefix grammar (v5-depth, v5-encoded, v5-rejection,
//     v6-docs-prefix, v7-docs-path controls) ──────────────────────────────

describe("docs path prefix grammar", () => {
  test("dot-prefixed relative paths are detected at any depth", () => {
    const cases = [
      ["./docs/specs/foo.md", "docs/specs/foo.md"],
      ["../docs/specs/foo.md", "docs/specs/foo.md"],
      ["../../docs/specs/foo.md", "docs/specs/foo.md"],
      ["../../../docs/adr/ADR-0001.md", "docs/adr/ADR-0001.md"],
      ["../../../../docs/specs/foo.md", "docs/specs/foo.md"],
    ] as const;
    for (const [line, expected] of cases) {
      expect(normPathValues(line)).toContain(expected);
      expectProducerFailure(line);
    }
  });

  test("identifier-prefixed dot-segment collapse resolves to docs (fail-closed)", () => {
    const cases = [
      ["a/../../docs/specs/foo.md", "docs/specs/foo.md"],
      ["foo/bar/../../docs/specs/foo.md", "docs/specs/foo.md"],
      ["x/../../../docs/adr/ADR-0001.md", "docs/adr/ADR-0001.md"],
    ] as const;
    for (const [line, expected] of cases) {
      expect(normPathValues(line)).toContain(expected);
      expectProducerFailure(line);
    }
  });

  test("backslash-at-depth mixed separators are detected", () => {
    const cases = [
      ["..\\..\\docs/specs/foo.md", "docs/specs/foo.md"],
      ["..\\../../docs/specs/foo.md", "docs/specs/foo.md"],
      ["../../docs\\adr\\ADR-0001.md", "docs/adr/ADR-0001.md"],
    ] as const;
    for (const [line, expected] of cases) {
      expect(normPathValues(line)).toContain(expected);
      expectProducerFailure(line);
    }
  });

  test("percent-encoded backslash separators (%5C/%5c) are detected in any position", () => {
    const cases = [
      "docs%5Cspecs%5Cfoo.md",
      "docs%5cspecs%5cfoo.md",
      "./docs%5Cspecs/foo.md",
      "../docs%5Cspecs/foo.md",
      "../../docs%5Cspecs/foo.md",
      "docs%5Cspecs/foo.md",
      "docs/specs%5Cfoo.md",
    ];
    for (const line of cases) {
      expect(normPathValues(line)).toContain("docs/specs/foo.md");
      expectProducerFailure(line);
    }
  });

  test("encoded forward slash prefixes are detected", () => {
    for (const line of ["..%2Fdocs/specs/foo.md", "..%2fdocs/specs/foo.md"]) {
      expect(pathValues(line)).toContain("docs/specs/foo.md");
      expectProducerFailure(line);
    }
  });

  test("invalid prefixes are rejected", () => {
    for (const line of [
      ".docs/specs/foo.md",
      "/docs/specs/foo.md",
      "///docs/specs/foo.md",
      "\\docs\\specs\\foo.md",
      ".../docs/specs/foo.md",
      "..../docs/specs/foo.md",
      "%2Fdocs/specs/foo.md",
    ]) {
      expect(pathValues(line)).not.toContain("docs/specs/foo.md");
      expectClean(line);
    }
  });

  test("Markdown link contexts are detected", () => {
    expect(pathValues("[text](docs/specs/foo.md)")).toContain("docs/specs/foo.md");
    expect(pathValues("[docs/specs/foo.md](https://example.com/x)")).toContain("docs/specs/foo.md");
    expectProducerFailure("See [the guide](docs/specs/foo.md) for details");
  });

  test("query-assignment contexts are detected on the docs-path side", () => {
    expect(pathValues("path=docs/specs/foo.md")).toContain("docs/specs/foo.md");
    expect(pathValues("ref=other&docs/specs/foo.md")).toContain("docs/specs/foo.md");
    expectProducerFailure("redirect with path=docs/specs/foo.md in the config");
  });
});

// ─── docs path CJK boundaries (v7-docs-path left boundary,
//     v8-cjk-path-stop terminator) ────────────────────────────────────────

describe("docs path CJK boundaries", () => {
  test("CJK punctuation acts as a valid LEFT boundary", () => {
    for (const sep of ["\uFF1A", "\uFF1B", "\uFF0C", "\uFF1F", "\u2014"]) {
      const line = `\u8aac\u660e${sep}docs/specs/foo.md`;
      expect(pathValues(line)).toContain("docs/specs/foo.md");
      expectProducerFailure(line);
    }
  });

  test("consumer URL + full-width colon + docs path yields URL and path", () => {
    const line = "https://github.com/vercel/next.js/blob/main/x.md\uFF1Adocs/specs/foo.md";
    expect(urlCandidates(line)).toHaveLength(1);
    expect(pathValues(line)).toContain("docs/specs/foo.md");
    expectProducerFailure(line);
  });

  test("CJK punctuation stops the path content at the .md endpoint", () => {
    for (const stop of ["\uFF1A", "\uFF1B", "\uFF0C", "\uFF1F", "\u2014"]) {
      const line = `docs/specs/foo.md${stop}end`;
      const values = pathValues(line);
      expect(values).toContain("docs/specs/foo.md");
      expect(values).not.toContain(`docs/specs/foo.md${stop}`);
    }
  });

  test("ASCII space terminator is unchanged", () => {
    expect(pathValues("docs/specs/foo.md end")).toContain("docs/specs/foo.md");
  });
});

// ─── docs path .md endpoint (fresh-review D4) ───────────────────────────

describe("docs path .md endpoint", () => {
  test("terminal punctuation truncates the matched path to .md", () => {
    for (const sep of [",", ";", ":", "\u3002", "\u3001", "#", "?"]) {
      const line = `docs/specs/foo.md${sep}`;
      expect(pathValues(line)).toContain("docs/specs/foo.md");
    }
  });

  test("sentence-final period truncates foo.md. to foo.md", () => {
    expect(pathValues("docs/specs/foo.md.")).toContain("docs/specs/foo.md");
  });

  test("non-ASCII filename remains a concrete path", () => {
    expect(pathValues("docs/specs/\u8a2d\u8a08.md")).toContain("docs/specs/\u8a2d\u8a08.md");
    expectProducerFailure("docs/specs/\u8a2d\u8a08.md");
  });

  test(".md.bak is NOT emitted (continuation suffix)", () => {
    expect(pathValues("docs/specs/foo.md.bak")).toHaveLength(0);
    expectClean("docs/specs/foo.md.bak");
  });

  test("query and fragment terminate before the endpoint", () => {
    expect(pathValues("docs/specs/foo.md?x=1")).toContain("docs/specs/foo.md");
    expect(pathValues("docs/specs/foo.md#sec")).toContain("docs/specs/foo.md");
  });
});

// ─── ownership span geometry (v5-url-ownership-path / pipeline unique) ──

describe("ownership span geometry", () => {
  test("valid URL suppresses an embedded docs path", () => {
    const line = "https://github.com/vercel/next.js/blob/docs/specs/foo.md";
    expect(urlCandidates(line)).toHaveLength(1);
    expect(pathValues(line)).toHaveLength(0);
    expectClean(line);
  });

  test("malformed URL does not suppress a docs path after it", () => {
    const line = "https://evil.com\\@github.com/a docs/specs/foo.md";
    const urls = urlCandidates(line);
    expect(urls).toHaveLength(1);
    expect(urls[0]!.malformed).toBe(true);
    expect(pathValues(line)).toContain("docs/specs/foo.md");
    const g = gateFor(line);
    expect(g.pass).toBe(false);
    expect(g.failures.some((d) => d.category === "concrete-path")).toBe(true);
  });

  test("partial overlap does not suppress: path starting before the URL span", () => {
    // The docs path starts before the URL and ends inside it; containment
    // requires BOTH bounds inside, so the path survives.
    const line = "docs/specs/foo.md is served at https://example.com/docs/specs/foo.md";
    const r = extractDocsPaths(line, 63);
    expect(r.paths.length).toBeGreaterThanOrEqual(1);
    expect(r.paths[0]!.value).toBe("docs/specs/foo.md");
  });

  test("resolveCandidate maps a malformed URL to unclassified/evasion-attempt", () => {
    const line = "https://github.com:8080/yogata/agent-dev-flow/x.md";
    const u = urlCandidates(line)[0]!;
    const resolved = resolveCandidate(u, baseConfig);
    expect(resolved.classification).toBe("unclassified");
    expect(resolved.category).toBe("evasion-attempt");
  });
});
