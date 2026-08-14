// Review-v5 URL terminator strictness: conditional ASCII colon (path-only),
// unconditional full-width colon U+FF1A, and opening delimiters `(`, `[`, `{`
// terminate URL ownership so an adjacent docs path or producer ID is
// independently detected.
//
// Scope:
//   - C4.1 ASCII colon after path terminates; adjacent docs path / ID visible.
//   - C4.2 full-width colon U+FF1A terminates unconditionally.
//   - C4.3 opening delimiters `(`, `[`, `{` terminate unconditionally.
//   - C4.4 colons inside query (`?`) or fragment (`#`) stay in the URL.
//   - C4.5 default-port authority colon (`:443`) preserved (regression).
//   - C4.6 prior punctuation controls (comma, CJK, semicolon) remain green.

import { describe, expect, test } from "bun:test";
import { extractUrls } from "./boundary-url-parser.ts";
import { detectCandidates, type Candidate, type DetectorConfig } from "./boundary-pipeline.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function findPath(cs: readonly Candidate[], value: string) {
  return cs.find((c): c is Extract<Candidate, { type: "path" }> => c.type === "path" && c.value === value);
}

function findDirectId(cs: readonly Candidate[], value: string) {
  return cs.find((c): c is Extract<Candidate, { type: "direct-id" }> => c.type === "direct-id" && c.value === value);
}

const FW_COLON = "\uFF1A";
const FW_COMMA = "\uFF0C";

// C4.1: ASCII colon after path terminates URL ownership.
describe("C4.1 ASCII colon after path terminates URL", () => {
  test("scheme-less URL then :docs/specs/foo.md - URL ends at .md, path independently visible", () => {
    const text = "See github.com/vercel/next.js/blob/main/x.md:docs/specs/foo.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("github.com/vercel/next.js/blob/main/x.md");
    expect(findPath(detectCandidates(text, baseConfig), "docs/specs/foo.md")).toBeDefined();
  });

  test("scheme URL then :ADR-0001 - URL ends at .md, ADR independently visible", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md:ADR-0001 end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("https://github.com/vercel/next.js/blob/main/x.md");
    expect(findDirectId(detectCandidates(text, baseConfig), "ADR-0001")).toBeDefined();
  });
});

// C4.2: full-width colon U+FF1A terminates unconditionally.
describe("C4.2 full-width colon terminates URL", () => {
  test("scheme-less URL then U+FF1A + docs/specs/foo.md - URL ends at .md", () => {
    const text = `See github.com/vercel/next.js/blob/main/x.md${FW_COLON}docs/specs/foo.md end.`;
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("github.com/vercel/next.js/blob/main/x.md");
  });
});

// C4.3: opening delimiters terminate URL unconditionally.
describe("C4.3 opening delimiters terminate URL", () => {
  test("( terminates URL", () => {
    const text = "See github.com/vercel/next.js/blob/main/x.md(docs/specs/foo.md) end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("github.com/vercel/next.js/blob/main/x.md");
  });

  test("[ terminates URL", () => {
    const text = "See github.com/vercel/next.js/blob/main/x.md[docs/specs/foo.md] end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("github.com/vercel/next.js/blob/main/x.md");
  });

  test("{ terminates URL (regression control)", () => {
    const text = "See github.com/vercel/next.js/blob/main/x.md{docs/specs/foo.md} end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("github.com/vercel/next.js/blob/main/x.md");
  });
});

// C4.4: colons inside query or fragment stay in the URL.
describe("C4.4 query/fragment colons stay in URL", () => {
  test("query ?q=a:b - colon stays in URL", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md?q=a:b end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("https://github.com/vercel/next.js/blob/main/x.md?q=a:b");
  });

  test("fragment #frag:c - colon stays in URL", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md#frag:c end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("https://github.com/vercel/next.js/blob/main/x.md#frag:c");
  });

  test("query and fragment ?q=a:b#frag:c - both colons stay", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md?q=a:b#frag:c end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("https://github.com/vercel/next.js/blob/main/x.md?q=a:b#frag:c");
  });
});

// C4.5: default-port authority colon preserved (regression).
describe("C4.5 authority colon preserved", () => {
  test("https://github.com:443/... - port colon does NOT terminate", () => {
    const text = "See https://github.com:443/vercel/next.js/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("https://github.com:443/vercel/next.js/blob/main/x.md");
    expect(urls[0]?.malformed).toBe(false);
  });
});

// C4.6: prior punctuation controls remain green.
describe("C4.6 prior punctuation controls", () => {
  test("comma terminates URL", () => {
    const text = "See github.com/vercel/next.js/blob/main/x.md,docs/specs/foo.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("github.com/vercel/next.js/blob/main/x.md");
  });

  test("full-width comma U+FF0C terminates URL", () => {
    const text = `See github.com/vercel/next.js/blob/main/x.md${FW_COMMA}docs/specs/foo.md end.`;
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("github.com/vercel/next.js/blob/main/x.md");
  });

  test("semicolon terminates URL", () => {
    const text = "See github.com/vercel/next.js/blob/main/x.md;docs/specs/foo.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.value).toBe("github.com/vercel/next.js/blob/main/x.md");
  });
});
