// Tests for the boundary scan-target scope (検査対象の除外領域).
//
// The exclusion canon is owned by the distribution boundary Design
// (distribution-boundary.md「検査対象の除外領域」): 共通原本側 tests/ 配下 and
// tools/<name>/local/ 配下 are NOT boundary scan targets in any projection,
// while remaining manifest members. These tests pin the predicate and its
// integration into runBoundaryDetector (exclusion decided on the candidate
// source path before the .opencode/** link mapping).

import { describe, expect, test } from "bun:test";
import { isBoundaryScanTarget, isConsumerProjectionScanTarget } from "./boundary-scan-scope.ts";
import { runBoundaryDetector } from "./boundary-runner.ts";
import type { DetectorConfig } from "./boundary-pipeline.ts";
import type { LoadedBlob } from "./blob-loader.ts";

const cfg: DetectorConfig = {
  repository_identity: {
    owner_slash_name: "yogata/agent-dev-flow",
    default_branch: "main",
  },
  producer_internal_id_prefixes: [
    "ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC",
  ],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

describe("boundary-scan-scope / isBoundaryScanTarget", () => {
  test("excludes src/common tests directories (skill scripts/tests)", () => {
    expect(isBoundaryScanTarget("src/common/skills/agentdev-x/scripts/tests/foo.test.ts")).toBe(false);
  });

  test("excludes src/common tests directories (skill tests/)", () => {
    expect(isBoundaryScanTarget("src/common/skills/agentdev-x/tests/foo.test.ts")).toBe(false);
  });

  test("excludes src/common tools tests directories", () => {
    expect(isBoundaryScanTarget("src/common/tools/agentdev-third-party/tests/engine.test.ts")).toBe(false);
  });

  test("excludes tools/<name>/local/ region", () => {
    expect(isBoundaryScanTarget("src/common/tools/agentdev-gh/local/runner-local.ts")).toBe(false);
  });

  test("excludes tools/<name>/local/tests/ region", () => {
    expect(isBoundaryScanTarget("src/common/tools/agentdev-gh/local/tests/runner-local.test.ts")).toBe(false);
  });

  test("keeps non-test skill artifacts as scan targets", () => {
    expect(isBoundaryScanTarget("src/common/skills/agentdev-x/SKILL.md")).toBe(true);
  });

  test("keeps non-local tools artifacts as scan targets", () => {
    expect(isBoundaryScanTarget("src/common/tools/agentdev-gh/engine.ts")).toBe(true);
  });

  test("keeps paths outside src/common as scan targets", () => {
    expect(isBoundaryScanTarget("scripts/install.ps1")).toBe(true);
    expect(isBoundaryScanTarget("src/opencode/plugins/agentdev-y/gate.ts")).toBe(true);
    expect(isBoundaryScanTarget("README-INSTALL.md")).toBe(true);
  });

  test("matches the tests segment exactly (retests is not tests)", () => {
    expect(isBoundaryScanTarget("src/common/skills/agentdev-x/retests/foo.md")).toBe(true);
    expect(isBoundaryScanTarget("src/common/skills/agentdev-x/tests-readme.md")).toBe(true);
  });

  test("normalizes backslash-separated paths", () => {
    expect(isBoundaryScanTarget("src\\common\\skills\\agentdev-x\\scripts\\tests\\foo.test.ts")).toBe(false);
    expect(isBoundaryScanTarget("src\\common\\tools\\agentdev-gh\\local\\runner-local.ts")).toBe(false);
  });
});

describe("boundary-scan-scope / isConsumerProjectionScanTarget", () => {
  test("keeps ordinary runtime paths as consumer scan targets", () => {
    expect(isConsumerProjectionScanTarget("src/common/skills/agentdev-x/SKILL.md")).toBe(true);
    expect(isConsumerProjectionScanTarget("src/opencode/plugins/agentdev-gh-write-guard/plugin.ts")).toBe(true);
  });

  // repo-local plugin 原本は source 投影では走査対象のまま、consumer 配布
  // 3投影（link・archive・archive-installed）の走査対象からは除外される。
  test("excludes repo-local plugin originals from consumer projections", () => {
    expect(isConsumerProjectionScanTarget("src/opencode/plugins/agentdev-distribution-boundary-guard/plugin.ts")).toBe(false);
    expect(isConsumerProjectionScanTarget("src/opencode/plugins/agentdev-distribution-boundary-guard/tests/plugin.test.ts")).toBe(false);
    expect(isConsumerProjectionScanTarget("src\\opencode\\plugins\\agentdev-distribution-boundary-guard\\plugin.ts")).toBe(false);
  });
});

function blob(
  subset: LoadedBlob["subset"],
  path: string,
  text: string,
): LoadedBlob {
  return {
    subset,
    entry: { path, sha256: "a".repeat(64), size: text.length },
    bytes: new Uint8Array(text.length),
    text,
  };
}

describe("boundary-runner / scan-target exclusion integration", () => {
  const blobs: readonly LoadedBlob[] = [
    blob("runtime", "src/common/skills/agentdev-x/SKILL.md", "See ADR-0135 for the decision."),
    blob("runtime", "src/common/skills/agentdev-x/scripts/tests/stimulus.test.ts", "See ADR-0136 stimulus."),
    blob("runtime", "src/common/tools/agentdev-gh/local/runner-local.ts", "See ADR-0137 local."),
    blob("bootstrap", "scripts/install.ps1", "See ADR-0138 bootstrap."),
  ];

  test("excluded-region blobs produce no detections in any projection", () => {
    const results = runBoundaryDetector({ blobs }, cfg);
    expect(results).toHaveLength(4);
    for (const r of results) {
      for (const d of [...r.failures, ...r.errors]) {
        expect(d.file).not.toContain("/tests/");
        expect(d.file).not.toMatch(/\.opencode\/tools\/agentdev-gh\/local\//);
        expect(d.file).not.toMatch(/src\/common\/tools\/agentdev-gh\/local\//);
      }
    }
  });

  test("scan-target blobs are still detected in every projection they appear in", () => {
    const results = runBoundaryDetector({ blobs }, cfg);
    const byProjection = new Map(results.map((r) => [r.projection, r]));
    // source: runtime + bootstrap blobs → SKILL.md and install.ps1 detections
    const source = byProjection.get("source");
    expect(source?.failures.map((d) => d.file).sort()).toEqual([
      "scripts/install.ps1",
      "src/common/skills/agentdev-x/SKILL.md",
    ]);
    // link / archive-installed: mapped runtime path only
    for (const p of ["link", "archive-installed"] as const) {
      const r = byProjection.get(p);
      expect(r?.failures.map((d) => d.file)).toEqual([
        ".opencode/skills/agentdev-x/SKILL.md",
      ]);
    }
    // archive: runtime (candidate path); bootstrap and archive-extra absent here
    const archive = byProjection.get("archive");
    expect(archive?.failures.map((d) => d.file)).toEqual([
      "src/common/skills/agentdev-x/SKILL.md",
    ]);
  });
});
