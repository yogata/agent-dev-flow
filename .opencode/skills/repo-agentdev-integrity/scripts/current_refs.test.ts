import { describe, it, expect } from "bun:test";
import {
  extractCurrentReqRefs,
  extractCurrentAdrRefs,
  extractCurrentAdrReadmeInventory,
} from "./current_refs.ts";

describe("extractCurrentReqRefs", () => {
  it("returns plain 3-digit REQ ref as current", () => {
    expect(extractCurrentReqRefs("See REQ-001 for context.")).toEqual([
      "REQ-001",
    ]);
  });

  it("returns plain 4-digit REQ ref as current (still detectable as broken)", () => {
    expect(extractCurrentReqRefs("See REQ-9999 for context.")).toEqual([
      "REQ-9999",
    ]);
  });

  it("excludes REQ ref immediately prefixed with v2:", () => {
    const content = "Lineage: v2:REQ-0102 was the historical requirement.";
    expect(extractCurrentReqRefs(content)).toEqual([]);
  });

  it("keeps v2: exclusion scoped to immediate prefix only", () => {
    const content = "Discussed under v2: tag, see REQ-0102 for current.";
    expect(extractCurrentReqRefs(content)).toEqual(["REQ-0102"]);
  });

  it("dedupes preserving first-occurrence order", () => {
    const content = "REQ-001 then ADR-001 then REQ-001 again then REQ-002";
    expect(extractCurrentReqRefs(content)).toEqual(["REQ-001", "REQ-002"]);
  });

  it("mixes current and lineage refs in the same content", () => {
    const content = [
      "Current REQ-001 is the basis.",
      "Historical v2:REQ-0102 covered the same scope.",
      "Plain broken REQ-999 should be detected.",
    ].join("\n");
    expect(extractCurrentReqRefs(content)).toEqual([
      "REQ-001",
      "REQ-999",
    ]);
  });

  it("returns empty array when no current REQ ref is present", () => {
    expect(extractCurrentReqRefs("No refs here.")).toEqual([]);
  });
});

describe("extractCurrentAdrRefs", () => {
  it("returns plain 3-digit ADR ref as current", () => {
    expect(extractCurrentAdrRefs("See ADR-001 for context.")).toEqual([
      "ADR-001",
    ]);
  });

  it("excludes ADR ref immediately prefixed with v2:", () => {
    const content = "Relates-to v2:ADR-0105 (historical baseline).";
    expect(extractCurrentAdrRefs(content)).toEqual([]);
  });

  it("keeps plain 4-digit broken ADR ref detectable", () => {
    expect(extractCurrentAdrRefs("See ADR-9999 for context.")).toEqual([
      "ADR-9999",
    ]);
  });

  it("mixes current and lineage ADR refs", () => {
    const content = [
      "ADR-002 relates-to v2:ADR-0105.",
      "Plain broken ADR-999 must remain detectable.",
    ].join("\n");
    expect(extractCurrentAdrRefs(content)).toEqual(["ADR-002", "ADR-999"]);
  });
});

describe("extractCurrentAdrReadmeInventory", () => {
  it("accepts 3-digit current IDs from the current section", () => {
    const readme = [
      "# ADR",
      "",
      "## 現行 ADR",
      "",
      "| ADR番号 | タイトル | ステータス | 作成日 |",
      "|---------|---------|-----------|--------|",
      "| ADR-001 | Charter | accepted | 2026-07-24 |",
      "| ADR-005 | Extensions | accepted | 2026-07-25 |",
      "",
    ].join("\n");
    expect(extractCurrentAdrReadmeInventory(readme)).toEqual(
      new Set(["ADR-001", "ADR-005"]),
    );
  });

  it("excludes v2:-prefixed rows even inside the current section (defense in depth)", () => {
    const readme = [
      "# ADR",
      "",
      "## 現行 ADR",
      "",
      "| ADR-001 | Charter | accepted | 2026-07-24 |",
      "| ADR-002 | relates-to v2:ADR-0105 | accepted | 2026-07-25 |",
      "",
    ].join("\n");
    expect(extractCurrentAdrReadmeInventory(readme)).toEqual(
      new Set(["ADR-001", "ADR-002"]),
    );
  });

  it("skips the entire 過去版の履歴基盤 historical section", () => {
    const readme = [
      "# ADR",
      "",
      "## 現行 ADR",
      "",
      "| ADR-001 | Charter | accepted | 2026-07-24 |",
      "",
      "## 過去版の履歴基盤",
      "",
      "次の ADR-01XX 群は tag v2.11.0 時点の基盤である。",
      "",
      "### tag v2.11.0 基盤ビュー",
      "",
      "| v2:ADR-0101 | Namespace | accepted | 2026-06-08 |",
      "| v2:ADR-0105 | Source/projection | accepted | 2026-06-08 |",
      "",
    ].join("\n");
    expect(extractCurrentAdrReadmeInventory(readme)).toEqual(
      new Set(["ADR-001"]),
    );
  });

  it("skips unprefixed 3-digit IDs nested under a historical heading", () => {
    const readme = [
      "## 現行 ADR",
      "",
      "| ADR-001 | Charter | accepted | 2026-07-24 |",
      "",
      "## 過去版の履歴基盤",
      "",
      "### tag v2.11.0 基盤ビュー",
      "",
      "| ADR-123 | Historical unprefixed row | accepted | 2026-06-08 |",
      "",
    ].join("\n");
    expect(extractCurrentAdrReadmeInventory(readme)).toEqual(
      new Set(["ADR-001"]),
    );
  });

  it("does not match IDs inside inline code or backticks differently (still extracts the ID)", () => {
    const readme = [
      "## 現行 ADR",
      "",
      "Refer to `ADR-003` for the soft-contract principle.",
      "",
    ].join("\n");
    expect(extractCurrentAdrReadmeInventory(readme)).toEqual(
      new Set(["ADR-003"]),
    );
  });

  it("returns empty set when only historical IDs exist", () => {
    const readme = [
      "# ADR",
      "",
      "## 過去版の履歴基盤",
      "",
      "| v2:ADR-0101 | Namespace | accepted | 2026-06-08 |",
      "",
    ].join("\n");
    expect(extractCurrentAdrReadmeInventory(readme)).toEqual(new Set());
  });
});
