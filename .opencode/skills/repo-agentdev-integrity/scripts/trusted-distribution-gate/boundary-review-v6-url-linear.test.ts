// Review-v6 URL scanner linear-complexity bound and behavior preservation.
//
// The backward authority scan walked, per host hit, from `hostStart - 1`
// back through the lexical authority region. Although each individual
// walk was bounded, the structure was awkward to reason about and could
// not surface a step count for a linear-complexity contract. The forward
// scanner advances a cursor from the previous match position up to the
// current `hostStart`, so total work is bounded by line length.
//
// Scope:
//   - V6.1 step-count linear bound: a single large authority, many URLs
//     on one line, and cap+1 URLs each stay within `16 * text.length + 64`
//     scanner operations.
//   - V6.2 classification behavior preserved: valid producer URL still
//     extracted; backslash authority malformed; default port accepted;
//     non-default port malformed.

import { describe, expect, test } from "bun:test";
import { extractUrls } from "./boundary-url-parser.ts";

const LINEAR_K = 16;
const LINEAR_C = 64;

function assertLinearBound(label: string, text: string, cap: number): void {
  const result = extractUrls(text, cap);
  const bound = LINEAR_K * text.length + LINEAR_C;
  expect(
    result.steps,
    `${label}: steps=${result.steps} must be <= bound=${bound} (text.length=${text.length})`,
  ).toBeLessThanOrEqual(bound);
}

// V6.1: step-count linear bound across adversarial inputs.
describe("V6.1 URL scan linear-step bound", () => {
  test("single large authority stays within linear bound", () => {
    const text = "https://user" + "a".repeat(50000) + "@github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    assertLinearBound("single-large-authority", text, 64);
  });

  test("multiple URLs on one line stay within linear bound", () => {
    const parts: string[] = [];
    for (let i = 0; i < 100; i++) {
      parts.push("https://github.com/o" + i + "/r/blob/main/x.md");
    }
    const text = parts.join(" ") + " end.";
    assertLinearBound("multi-url-one-line", text, 64);
  });

  test("cap+1 URLs stay within linear bound", () => {
    const cap = 32;
    const parts: string[] = [];
    for (let i = 0; i <= cap; i++) {
      parts.push("https://github.com/o" + i + "/r/blob/main/x.md");
    }
    const text = parts.join(" ") + " end.";
    assertLinearBound("cap-plus-one", text, cap);
  });
});

// V6.2: classification behavior preserved (regression controls for the
// forward-scan rewrite).
describe("V6.2 classification behavior preserved", () => {
  test("valid http(s) producer URL is extracted as non-malformed", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(false);
    expect(u.value).toBe("https://github.com/yogata/agent-dev-flow/blob/main/x.md");
  });

  test("backslash authority is classified malformed", () => {
    const text = "See https://evil.com\\@github.com/vercel/next.js/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    const u = urls[0];
    if (u === undefined) throw new Error("expected malformed url");
    expect(u.malformed).toBe(true);
  });

  test("default port accepted (non-malformed)", () => {
    const text = "See https://github.com:443/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(false);
  });

  test("non-default port is malformed", () => {
    const text = "See https://github.com:8080/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    const u = urls[0];
    if (u === undefined) throw new Error("expected malformed url");
    expect(u.malformed).toBe(true);
  });
});
