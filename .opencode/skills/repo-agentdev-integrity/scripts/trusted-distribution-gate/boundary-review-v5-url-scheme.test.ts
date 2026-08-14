// Review-v5 URL scheme boundary fixes: multi-URL span independence and
// unsupported composite-scheme handling (C2).
//
// Scope:
//   - Two GitHub URLs on one line keep independent, non-overlapping spans;
//     a later bare host never grabs an earlier URL's scheme prefix.
//   - `git+https://` is an unsupported composite scheme: it cannot own or
//     hide contained producer references (fail-closed).
//   - Regression controls: ordinary https, userinfo, userinfo deception,
//     unsupported evil/ftp, and valid bare scheme-less hosts stay correct.

import { describe, expect, test } from "bun:test";
import { extractUrls } from "./boundary-url-parser.ts";
import { detectCandidates, type DetectorConfig } from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function gateFor(text: string) {
  const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(files, "source", baseConfig).gate;
}

// C2.1: two GitHub URLs on one line keep independent, non-overlapping spans.
describe("C2.1 multi-URL span independence", () => {
  test("two scheme URLs separated by space have non-overlapping spans", () => {
    const text = "https://github.com/vercel/next.js/blob/main/a.md https://github.com/yogata/agent-dev-flow/blob/main/b.md";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(2);
    const u1 = urls[0];
    const u2 = urls[1];
    if (u1 === undefined || u2 === undefined) throw new Error("expected two urls");
    expect(u1.span.end).toBeLessThanOrEqual(u2.span.start);
    expect(u1.value).toBe("https://github.com/vercel/next.js/blob/main/a.md");
    expect(u2.value).toBe("https://github.com/yogata/agent-dev-flow/blob/main/b.md");
  });

  test("scheme URL followed by bare host: bare URL never grabs earlier scheme", () => {
    const text = "https://github.com/vercel/next.js/blob/main/a.md github.com/yogata/agent-dev-flow/blob/main/b.md";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(2);
    const u1 = urls[0];
    const u2 = urls[1];
    if (u1 === undefined || u2 === undefined) throw new Error("expected two urls");
    expect(u1.span.end).toBeLessThanOrEqual(u2.span.start);
    expect(u2.value.startsWith("https://")).toBe(false);
    expect(u2.value).toBe("github.com/yogata/agent-dev-flow/blob/main/b.md");
  });

  test("scheme URL + text + bare host: bare URL stays independent after the text", () => {
    const text = "https://github.com/vercel/next.js/blob/main/a.md then github.com/yogata/agent-dev-flow/blob/main/b.md";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(2);
    const u1 = urls[0];
    const u2 = urls[1];
    if (u1 === undefined || u2 === undefined) throw new Error("expected two urls");
    expect(u1.span.end).toBeLessThanOrEqual(u2.span.start);
    expect(u2.value).toBe("github.com/yogata/agent-dev-flow/blob/main/b.md");
  });
});

// C2.2: a non-GitHub URL before a bare GitHub host — the bare host is its own URL.
describe("C2.2 example.com then bare GitHub host", () => {
  test("http://example.com and github.com/producer/... keeps bare GitHub URL independent", () => {
    const text = "http://example.com and github.com/yogata/agent-dev-flow/blob/main/x.md";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.value).toBe("github.com/yogata/agent-dev-flow/blob/main/x.md");
    expect(u.value.startsWith("http://")).toBe(false);
  });
});

// C2.3: unsupported composite scheme git+https emits a malformed candidate
// (fail-closed). Historical intent was "0 URLs, gate PASS" but per
// distribution-boundary.md the detector must fail-closed on evasion forms.
describe("C2.3 git+https unsupported composite scheme emits malformed", () => {
  test("git+https://github.com/vercel/.../ADR-1.md → 1 malformed URL (ownershipSpan null), ADR visible, gate fails", () => {
    const text = "See git+https://github.com/vercel/next.js/blob/main/docs/ADR-1.md here.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(true);
    expect(urls[0]?.ownershipSpan).toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  });

  test("detectCandidates yields 1 malformed url candidate for git+https producer path", () => {
    const text = "See git+https://github.com/yogata/agent-dev-flow/blob/main/docs/ADR-1.md here.";
    const cs = detectCandidates(text, baseConfig);
    expect(cs.filter((c) => c.type === "url")).toHaveLength(1);
  });
});

// C2.4: regression controls — pre-existing behavior preserved.
describe("C2.4 regression controls", () => {
  test("ordinary https producer URL is producer-internal", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(gateFor(text).pass).toBe(false);
  });

  test("userinfo producer URL is producer-internal and keeps scheme prefix", () => {
    const text = "See https://user@github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.value.startsWith("https://")).toBe(true);
  });

  test("userinfo deception github.com@evil.com is NOT a GitHub authority", () => {
    const text = "See https://github.com@evil.com/yogata/agent-dev-flow/blob/main/x.md end.";
    expect(extractUrls(text, 64).urls).toHaveLength(0);
  });

  test("unsupported evil:// and ftp:// emit 1 malformed each (fail-closed per distribution-boundary.md)", () => {
    const eu = extractUrls("See evil://github.com/yogata/agent-dev-flow/blob/main/x.md end.", 64).urls;
    expect(eu).toHaveLength(1);
    expect(eu[0]?.malformed).toBe(true);
    expect(eu[0]?.ownershipSpan).toBeNull();
    const fu = extractUrls("See ftp://github.com/yogata/agent-dev-flow/blob/main/x.md end.", 64).urls;
    expect(fu).toHaveLength(1);
    expect(fu[0]?.malformed).toBe(true);
    expect(fu[0]?.ownershipSpan).toBeNull();
  });

  test("valid bare scheme-less github.com producer URL is extracted", () => {
    const text = "See github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.value).toBe("github.com/yogata/agent-dev-flow/blob/main/x.md");
  });
});
