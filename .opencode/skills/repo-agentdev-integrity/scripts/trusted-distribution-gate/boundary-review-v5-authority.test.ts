// Review-v5 URL authority malformedness: default ports, invalid ports,
// and backslash authorities (C3).
//
// Scope:
//   - Default GitHub ports (https:443, http:80) classify normally.
//   - Non-default / invalid / scheme-less ports fail closed (evasion-attempt).
//   - Backslash authorities (evil.com\@github.com, user\name@github.com)
//     fail closed and cannot own/hide contained producer references.
//   - Regression controls: normal userinfo, userinfo deception, ordinary
//     external/producer/scheme-less behavior preserved.
//
// Each test was RED against the pre-C3 baseline (ports were rejected
// outright; backslash authorities were silently dropped) and is GREEN
// after C3.

import { describe, expect, test } from "bun:test";
import { extractUrls } from "./boundary-url-parser.ts";
import { classifyAuthority, parseUrlHost } from "./boundary-url-authority.ts";
import {
  detectCandidates,
  resolveCandidate,
  type Candidate,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
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

const SPAN = { start: 0, end: 1 };

function urlType(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<Candidate, { type: "url" }> => c.type === "url");
}

// C3.1: default ports classify normally.
describe("C3.1 default ports / https:443 and http:80 classify normally", () => {
  test("https://github.com:443/producer/... is producer-internal, gate fails", () => {
    const text = "See https://github.com:443/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.find((d) => d.category === "fixed-url")?.classification).toBe("producer-internal");
  });

  test("http://github.com:80/producer/... is producer-internal, gate fails", () => {
    const text = "See http://github.com:80/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
    expect(gateFor(text).pass).toBe(false);
  });

  test("https://github.com:443/external/... is consumer-resolvable, gate passes", () => {
    const text = "See https://github.com:443/vercel/next.js/blob/main/x.md end.";
    expect(extractUrls(text, 64).urls).toHaveLength(1);
    expect(gateFor(text).pass).toBe(true);
  });
});

// C3.2: non-default / invalid / out-of-range ports fail closed.
describe("C3.2 non-default ports / fail closed via evasion-attempt", () => {
  const cases: Array<[string, string]> = [
    ["https :8080", "See https://github.com:8080/yogata/agent-dev-flow/blob/main/x.md end."],
    ["https :80 (wrong scheme-default)", "See https://github.com:80/yogata/agent-dev-flow/blob/main/x.md end."],
    ["http :443 (wrong scheme-default)", "See http://github.com:443/yogata/agent-dev-flow/blob/main/x.md end."],
    ["https :abc (non-numeric)", "See https://github.com:abc/yogata/agent-dev-flow/blob/main/x.md end."],
    ["https :99999 (out-of-range)", "See https://github.com:99999/yogata/agent-dev-flow/blob/main/x.md end."],
  ];
  for (const [label, text] of cases) {
    test(`${label}: gate fails with evasion-attempt error`, () => {
      const g = gateFor(text);
      expect(g.pass).toBe(false);
      expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
    });
  }

  test("resolveCandidate classifies malformed URL as unclassified/evasion-attempt", () => {
    const r = resolveCandidate(
      { type: "url", value: "https://github.com:8080", span: SPAN, malformed: true },
      baseConfig,
    );
    expect(r.classification).toBe("unclassified");
    expect(r.category).toBe("evasion-attempt");
  });
});

// C3.3: scheme-less port fail-closed.
describe("C3.3 scheme-less port / fail closed", () => {
  test("github.com:8080/producer/... fails with evasion-attempt", () => {
    const text = "See github.com:8080/yogata/agent-dev-flow/blob/main/x.md end.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  });
});

// C3.4: backslash authority — recognized host inside a malformed backslash
// authority never passes clean and cannot own/hide contained references.
describe("C3.4 backslash authority / fail closed and cannot own ADR", () => {
  test("https://evil.com\\@github.com/.../ADR-0001: gate fails, ADR independently visible", () => {
    const text = "See https://evil.com\\@github.com/vercel/next.js/blob/main/ADR-0001 end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urlType(cs).find((c) => c.malformed)).toBeDefined();
    const adr = cs.find(
      (c): c is Extract<Candidate, { type: "direct-id" }> => c.type === "direct-id" && c.value === "ADR-0001",
    );
    expect(adr).toBeDefined();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
    expect(g.failures.find((d) => d.classification === "producer-internal")).toBeDefined();
  });

  test("malformed URL span does NOT cover the path (ADR outside authority)", () => {
    const text = "https://evil.com\\@github.com/vercel/next.js/blob/main/ADR-0001";
    const { urls } = extractUrls(text, 64);
    const u = urls[0];
    if (u === undefined) throw new Error("expected malformed url");
    expect(u.malformed).toBe(true);
    const adrIdx = text.indexOf("ADR-0001");
    expect(u.span.end).toBeLessThanOrEqual(adrIdx);
  });
});

// C3.5: backslash authority with reconstructed ADR and docs path independently visible.
describe("C3.5 backslash authority / reconstructed ADR and docs path visible", () => {
  test("reconstructed \\u0041DR-0001 near malformed URL is independently visible", () => {
    const text = "See \\u0041DR-0001 in https://evil.com\\@github.com/vercel/next.js/blob/main/x.md end.";
    const cs = detectCandidates(text, baseConfig);
    const recon = cs.find(
      (c): c is Extract<Candidate, { type: "reconstructed-id" }> =>
        c.type === "reconstructed-id" && c.value === "ADR-0001",
    );
    expect(recon).toBeDefined();
    expect(gateFor(text).pass).toBe(false);
  });

  test("docs/requirements/REQ-0001.md near malformed URL is independently visible", () => {
    const text = "See https://evil.com\\@github.com/vercel/next.js/blob/main/x.md docs/requirements/REQ-0001.md end.";
    const cs = detectCandidates(text, baseConfig);
    const path = cs.find(
      (c): c is Extract<Candidate, { type: "path" }> =>
        c.type === "path" && c.value === "docs/requirements/REQ-0001.md",
    );
    expect(path).toBeDefined();
    expect(gateFor(text).pass).toBe(false);
  });
});

// C3.6: userinfo backslash fail-closed.
describe("C3.6 userinfo backslash / fail closed", () => {
  test("https://user\\name@github.com/producer/... fails with evasion-attempt", () => {
    const text = "See https://user\\name@github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  });
});

// C3.7: regression controls — pre-existing behavior preserved.
describe("C3.7 regression controls", () => {
  test("normal userinfo https://user@github.com/producer/... is producer-internal", () => {
    const text = "See https://user@github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
    expect(gateFor(text).pass).toBe(false);
  });

  test("userinfo deception github.com@evil.com is NOT GitHub authority", () => {
    const text = "See https://github.com@evil.com/yogata/agent-dev-flow/blob/main/x.md end.";
    expect(extractUrls(text, 64).urls).toHaveLength(0);
    expect(gateFor(text).pass).toBe(true);
  });

  test("ordinary https producer URL without port is producer-internal", () => {
    expect(gateFor("See https://github.com/yogata/agent-dev-flow/blob/main/x.md end.").pass).toBe(false);
  });

  test("ordinary external URL without port is consumer-resolvable, gate passes", () => {
    expect(gateFor("See https://github.com/vercel/next.js/blob/main/x.md end.").pass).toBe(true);
  });

  test("valid bare scheme-less github.com producer URL is extracted (not malformed)", () => {
    const text = "See github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
  });
});

// C3.8: parseUrlHost expected results.
describe("C3.8 parseUrlHost / authority host extraction", () => {
  const cases: Array<[string, string | null]> = [
    ["https://github.com:443/o/r/blob/main/x.md", "github.com"],
    ["http://github.com:80/o/r/blob/main/x.md", "github.com"],
    ["https://github.com/o/r/blob/main/x.md", "github.com"],
    ["github.com/o/r/blob/main/x.md", "github.com"],
    ["https://github.com:8080/o/r/blob/main/x.md", null],
    ["https://github.com:80/o/r/blob/main/x.md", null],
    ["github.com:8080/o/r/blob/main/x.md", null],
    ["https://evil.com\\@github.com/o/r/blob/main/x.md", null],
    ["https://github.com@evil.com/o/r/blob/main/x.md", null],
    ["https://notgithub.com/o/r/blob/main/x.md", null],
  ];
  for (const [url, expected] of cases) {
    test(`parseUrlHost('${url.substring(0, 50)}') === ${expected}`, () => {
      expect(parseUrlHost(url)).toBe(expected);
    });
  }
});

// C3.9: classifyAuthority three-way classification.
describe("C3.9 classifyAuthority / valid / malformed / rejected", () => {
  const cases: Array<[string, "valid" | "malformed" | "rejected"]> = [
    ["https://github.com:443/o/r/blob/main/x.md", "valid"],
    ["http://github.com:80/o/r/blob/main/x.md", "valid"],
    ["https://github.com:8080/o/r/blob/main/x.md", "malformed"],
    ["github.com:8080/o/r/blob/main/x.md", "malformed"],
    ["https://evil.com\\@github.com/o/r/blob/main/x.md", "malformed"],
    ["https://user\\name@github.com/o/r/blob/main/x.md", "malformed"],
    ["https://github.com@evil.com/o/r/blob/main/x.md", "rejected"],
    ["https://notgithub.com/o/r/blob/main/x.md", "rejected"],
  ];
  for (const [url, expected] of cases) {
    test(`classifyAuthority('${url.substring(0, 50)}') === ${expected}`, () => {
      expect(classifyAuthority(url).kind).toBe(expected);
    });
  }
});
