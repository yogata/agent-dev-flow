import { test, expect, describe } from "bun:test";
import { checkSingleFile } from "../src/check-frontmatter-consistency.ts";

describe("checkSingleFile", () => {
  test("ok when REQ filename matches frontmatter id", () => {
    const content = `---
id: REQ-0103
title: "Test"
created: 2026-01-01
updated: 2026-01-01
---

# Body`;
    const result = checkSingleFile("REQ-0103.md", content, "req");
    expect(result.ok).toBe(true);
    expect(result.issues.filenameNumber).toBe(103);
    expect(result.issues.frontmatterNumber).toBe(103);
  });

  test("not ok when REQ filename does not match frontmatter id", () => {
    const content = `---
id: REQ-0102
title: "Mismatch"
---

Body`;
    const result = checkSingleFile("REQ-0103.md", content, "req");
    expect(result.ok).toBe(false);
    expect(result.issues.filenameNumber).toBe(103);
    expect(result.issues.frontmatterNumber).toBe(102);
  });

  test("not ok when frontmatter id is missing", () => {
    const content = `---
title: "No id"
---

Body`;
    const result = checkSingleFile("REQ-0103.md", content, "req");
    expect(result.ok).toBe(false);
    expect(result.issues.frontmatterId).toBeNull();
    expect(result.issues.frontmatterNumber).toBeNull();
  });

  test("not ok when frontmatter is entirely missing", () => {
    const content = "# Body without frontmatter";
    const result = checkSingleFile("REQ-0103.md", content, "req");
    expect(result.ok).toBe(false);
    expect(result.issues.frontmatterId).toBeNull();
  });

  test("ok when ADR filename matches frontmatter id", () => {
    const content = `---
id: ADR-0128
title: "Decision"
---

# Body`;
    const result = checkSingleFile("ADR-0128.md", content, "adr");
    expect(result.ok).toBe(true);
    expect(result.issues.filenameNumber).toBe(128);
  });

  test("ok when DEC filename matches frontmatter id (3-digit)", () => {
    const content = `---
id: DEC-007
title: "Decision"
---

# Body`;
    const result = checkSingleFile("DEC-007.md", content, "decision");
    expect(result.ok).toBe(true);
    expect(result.issues.filenameNumber).toBe(7);
    expect(result.issues.frontmatterNumber).toBe(7);
  });

  test("not ok when DEC filename does not match frontmatter id", () => {
    const content = `---
id: DEC-006
title: "Mismatch"
---

Body`;
    const result = checkSingleFile("DEC-007.md", content, "decision");
    expect(result.ok).toBe(false);
    expect(result.issues.filenameNumber).toBe(7);
    expect(result.issues.frontmatterNumber).toBe(6);
  });

  test("DEC requires 3-digit padding (DEC-1 rejected)", () => {
    const content = `---
id: DEC-1
---

Body`;
    const result = checkSingleFile("DEC-001.md", content, "decision");
    expect(result.ok).toBe(false);
    expect(result.issues.frontmatterNumber).toBeNull();
  });

  test("strips quotes from frontmatter id value", () => {
    const content = `---
id: "REQ-0103"
---

Body`;
    const result = checkSingleFile("REQ-0103.md", content, "req");
    expect(result.ok).toBe(true);
    expect(result.issues.frontmatterId).toBe("REQ-0103");
  });
});
