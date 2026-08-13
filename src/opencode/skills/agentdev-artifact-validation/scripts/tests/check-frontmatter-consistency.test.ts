import { test, expect, describe } from "bun:test";
import { checkSingleFile } from "../src/check-frontmatter-consistency.ts";
import { formatReqId } from "../../../agentdev-req-file-manager/scripts/src/alloc-req-number.ts";
import { formatDecisionId } from "../../../agentdev-decision-file-manager/scripts/src/alloc-decision-number.ts";

function reqFile(n: number): string { return formatReqId(n) + ".md"; }

describe("checkSingleFile", () => {
  test("ok when REQ filename matches frontmatter id", () => {
    const id = formatReqId(1024);
    const content = `---
id: ${id}
title: "Test"
created: 2026-01-01
updated: 2026-01-01
---

# Body`;
    const result = checkSingleFile(reqFile(1024), content, "req");
    expect(result.ok).toBe(true);
    expect(result.issues.filenameNumber).toBe(1024);
    expect(result.issues.frontmatterNumber).toBe(1024);
  });

  test("not ok when REQ filename does not match frontmatter id", () => {
    const mismatchId = formatReqId(1023);
    const content = `---
id: ${mismatchId}
title: "Mismatch"
---

Body`;
    const result = checkSingleFile(reqFile(1024), content, "req");
    expect(result.ok).toBe(false);
    expect(result.issues.filenameNumber).toBe(1024);
    expect(result.issues.frontmatterNumber).toBe(1023);
  });

  test("not ok when frontmatter id is missing", () => {
    const content = `---
title: "No id"
---

Body`;
    const result = checkSingleFile(reqFile(1024), content, "req");
    expect(result.ok).toBe(false);
    expect(result.issues.frontmatterId).toBeNull();
    expect(result.issues.frontmatterNumber).toBeNull();
  });

  test("not ok when frontmatter is entirely missing", () => {
    const content = "# Body without frontmatter";
    const result = checkSingleFile(reqFile(1024), content, "req");
    expect(result.ok).toBe(false);
    expect(result.issues.frontmatterId).toBeNull();
  });

  test("ok when ADR filename matches frontmatter id", () => {
    // ADR shares the 4-digit format with REQ. Extract the padded number
    // from the production REQ formatter and apply the ADR prefix.
    const numPart = formatReqId(1128).slice(4);
    const filename = `ADR-${numPart}.md`;
    const content = `---
id: ADR-${numPart}
title: "Decision"
---

# Body`;
    const result = checkSingleFile(filename, content, "adr");
    expect(result.ok).toBe(true);
    expect(result.issues.filenameNumber).toBe(1128);
  });

  test("ok when DEC filename matches frontmatter id (3-digit)", () => {
    const id = formatDecisionId(7);
    const filename = `${id}.md`;
    const content = `---
id: ${id}
title: "Decision"
---

# Body`;
    const result = checkSingleFile(filename, content, "decision");
    expect(result.ok).toBe(true);
    expect(result.issues.filenameNumber).toBe(7);
    expect(result.issues.frontmatterNumber).toBe(7);
  });

  test("not ok when DEC filename does not match frontmatter id", () => {
    const fileId = formatDecisionId(7);
    const fmId = formatDecisionId(6);
    const filename = `${fileId}.md`;
    const content = `---
id: ${fmId}
title: "Mismatch"
---

Body`;
    const result = checkSingleFile(filename, content, "decision");
    expect(result.ok).toBe(false);
    expect(result.issues.filenameNumber).toBe(7);
    expect(result.issues.frontmatterNumber).toBe(6);
  });

  test("DEC requires 3-digit padding (unpadded rejected)", () => {
    const content = `---
id: DEC-${1}
---

Body`;
    const filename = `${formatDecisionId(1)}.md`;
    const result = checkSingleFile(filename, content, "decision");
    expect(result.ok).toBe(false);
    expect(result.issues.frontmatterNumber).toBeNull();
  });

  test("strips quotes from frontmatter id value", () => {
    const id = formatReqId(1024);
    const content = `---
id: "${id}"
---

Body`;
    const result = checkSingleFile(reqFile(1024), content, "req");
    expect(result.ok).toBe(true);
    expect(result.issues.frontmatterId).toBe(id);
  });
});
