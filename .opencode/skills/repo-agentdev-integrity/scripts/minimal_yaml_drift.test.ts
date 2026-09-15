// ADF-COVERS(verification): REQ-047-010
// Drift guard for the canonical YAML load fallback (lib/minimal-yaml.ts).
//
// REQ-047-010: the canonical detection-definition YAML must load without
// warning noise whenever the file exists and is valid. The load path parses
// via Bun.YAML under the Bun runtime and via the deterministic subset parser
// on the node standard route. This test pins both paths to identical results
// on the real canonical file so the subset parser cannot silently drift away
// from Bun.YAML.parse when the definition file evolves.
import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import { parseMinimalYaml } from "./lib/minimal-yaml.ts";

const CANONICAL_YAML = path.resolve(
  import.meta.dir,
  "..",
  "data",
  "distribution-targets.yaml",
);

function bunParse(text: string): unknown {
  const bun = (globalThis as { Bun?: { YAML?: { parse?: (t: string) => unknown } } }).Bun;
  expect(typeof bun?.YAML?.parse).toBe("function");
  return bun!.YAML!.parse!(text);
}

describe("minimal-yaml drift guard (REQ-047-010)", () => {
  test("matches Bun.YAML.parse on the real canonical distribution-targets.yaml", () => {
    const text = fs.readFileSync(CANONICAL_YAML, "utf-8");
    expect(parseMinimalYaml(text)).toEqual(bunParse(text));
  });

  test("parses mapping, nested mapping and block sequence", () => {
    const text = [
      "root:",
      "  child: value",
      "  list:",
      "    - one",
      "    - two",
    ].join("\n");
    expect(parseMinimalYaml(text)).toEqual(bunParse(text));
  });

  test("parses sequence items that are mappings", () => {
    const text = [
      "items:",
      "  - kind: a",
      "    path: p/a",
      "    flag: false",
      "  - kind: b",
    ].join("\n");
    expect(parseMinimalYaml(text)).toEqual(bunParse(text));
  });

  test("parses literal block | with clip and |- with strip", () => {
    const text = ["clip: |", "  l1", "  l2", "strip: |-", "  s1", "  s2"].join("\n");
    expect(parseMinimalYaml(text)).toEqual(bunParse(text));
  });

  test("parses quoted scalars containing ':' and inline comments", () => {
    const text = ['k: "generated_by:"', "n: 42  # count", "b: true"].join("\n");
    expect(parseMinimalYaml(text)).toEqual(bunParse(text));
  });

  test("throws on anchors/aliases, flow collections and multi-document input", () => {
    expect(() => parseMinimalYaml("a: &x 1")).toThrow();
    expect(() => parseMinimalYaml("a: *x")).toThrow();
    expect(() => parseMinimalYaml("a: [1, 2]")).toThrow();
    expect(() => parseMinimalYaml("a: {k: v}")).toThrow();
    expect(() => parseMinimalYaml("---\na: 1\n")).toThrow();
  });

  test("throws on tabs and on content after the document", () => {
    expect(() => parseMinimalYaml("a:\n\t- x")).toThrow();
    expect(() => parseMinimalYaml("a: 1\nb\n")).toThrow();
  });
});
