import { test, expect, describe } from "bun:test";
import {
  DEFAULT_ID_PATTERN,
  buildRequirementRowIndex,
  checkReqRowExistence,
  collectRequirementRowIds,
  isExemptTargetPath,
  isInsideCodeBlock,
  isInsideCodeSpan,
  isRequirementTablePath,
  findPhantomCitations,
  toPosixPath,
  type ReqRowRef,
} from "../src/check-req-row-existence.ts";

function compile(source: string): RegExp {
  return new RegExp(source, "g");
}

function baseTableReq(path = "docs/requirements/REQ-107.md"): ReqRowRef {
  return { path, content: BASE_TABLE };
}

const BASE_TABLE = `# REQ-107

| REQ ID | タイトル |
|---|---|
| REQ-107-001 | 既存要件A |
| REQ-107-002 | 既存要件B |
`;

describe("toPosixPath", () => {
  test("converts backslashes", () => {
    expect(toPosixPath("docs\\designs\\x.md")).toBe("docs/designs/x.md");
  });
});

describe("isRequirementTablePath", () => {
  test("accepts current requirement files", () => {
    expect(isRequirementTablePath("docs/requirements/REQ-107.md")).toBe(true);
  });

  test("accepts retired requirement files", () => {
    expect(isRequirementTablePath("docs/requirements/retired/REQ-0136.md")).toBe(true);
  });

  test("rejects non-table paths", () => {
    expect(isRequirementTablePath("docs/designs/x.md")).toBe(false);
    expect(isRequirementTablePath("docs/requirements/README.md")).toBe(false);
  });
});

describe("isExemptTargetPath", () => {
  test("template files are exempt", () => {
    expect(isExemptTargetPath("docs/designs/commands/_template.md")).toBe(true);
    expect(isExemptTargetPath("src/common/commands/agentdev/templates/tpl.md")).toBe(true);
  });

  test("integrity rule description files are exempt", () => {
    expect(isExemptTargetPath("docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md")).toBe(true);
  });

  test("history areas are exempt", () => {
    expect(isExemptTargetPath("docs/requirements/retired/REQ-0136.md")).toBe(true);
    expect(isExemptTargetPath("docs/decisions/retired/DEC-010.md")).toBe(true);
    expect(isExemptTargetPath("docs/reports/x.md")).toBe(true);
  });

  test("normal artifacts are not exempt", () => {
    expect(isExemptTargetPath("docs/designs/skills/agentdev-artifact-validation.md")).toBe(false);
    expect(isExemptTargetPath("docs/requirements/REQ-107.md")).toBe(false);
  });
});

describe("isInsideCodeSpan", () => {
  test("detects backtick-enclosed position", () => {
    const line = "cite `REQ-107-009` here";
    expect(isInsideCodeSpan(line, 7)).toBe(true);
    expect(isInsideCodeSpan(line, 19)).toBe(false);
  });
});

describe("isInsideCodeBlock", () => {
  test("detects fenced block interior", () => {
    const lines = ["text", "```", "REQ-107-009", "```", "after"];
    expect(isInsideCodeBlock(lines, 2)).toBe(true);
    expect(isInsideCodeBlock(lines, 0)).toBe(false);
    expect(isInsideCodeBlock(lines, 4)).toBe(false);
  });
});

describe("collectRequirementRowIds", () => {
  test("collects table-row ids only, not prose mentions", () => {
    const content = `| REQ-107-001 | A |\n本文で REQ-107-002 に言及\n| REQ-107-003 | B |`;
    const rows = collectRequirementRowIds(content, compile(DEFAULT_ID_PATTERN));
    expect(rows.has("REQ-107-001")).toBe(true);
    expect(rows.has("REQ-107-003")).toBe(true);
    expect(rows.has("REQ-107-002")).toBe(false);
  });
});

describe("buildRequirementRowIndex", () => {
  test("overlay overrides base (post-application state)", () => {
    const base = [baseTableReq()];
    const overlay = [
      {
        path: "docs/requirements/REQ-107.md",
        content: "| REQ-107-001 | A |\n| REQ-107-009 | 新規要件 |",
      },
    ];
    const rows = buildRequirementRowIndex(base, overlay, compile(DEFAULT_ID_PATTERN));
    expect(rows.has("REQ-107-001")).toBe(true);
    expect(rows.has("REQ-107-002")).toBe(false);
    expect(rows.has("REQ-107-009")).toBe(true);
  });
});

describe("findPhantomCitations", () => {
  test("reports only ids missing from the index", () => {
    const index = buildRequirementRowIndex([baseTableReq()], [], compile(DEFAULT_ID_PATTERN));
    const target: ReqRowRef = {
      path: "docs/designs/x.md",
      content: "REQ-107-001 と REQ-107-009 を引用",
    };
    const phantoms = findPhantomCitations(target, index, compile(DEFAULT_ID_PATTERN));
    expect(phantoms).toEqual([{ id: "REQ-107-009", line: 1 }]);
  });

  test("exempts code span, code block, autogen, placeholders, v2: prefix", () => {
    const index = buildRequirementRowIndex([baseTableReq()], [], compile(DEFAULT_ID_PATTERN));
    const target: ReqRowRef = {
      path: "docs/designs/x.md",
      content: [
        "code span: `REQ-107-777`",
        "```",
        "REQ-107-778 in block",
        "```",
        "<!-- AUTOGEN:BEGIN:id=t -->",
        "REQ-107-779 in autogen",
        "<!-- AUTOGEN:END -->",
        "placeholder: REQ-010-NNN and REQ-{NNNN}-{NNN} and REQ-107-NNN",
        "historical: v2:REQ-0108-193",
        "invalid empty segment: REQ-107-",
      ].join("\n"),
    };
    const phantoms = findPhantomCitations(target, index, compile(DEFAULT_ID_PATTERN));
    expect(phantoms).toEqual([]);
  });
});

describe("checkReqRowExistence", () => {
  test("TS-006 case 1: citation of a nonexistent requirement row id fails", () => {
    const index = buildRequirementRowIndex([baseTableReq()], [], compile(DEFAULT_ID_PATTERN));
    const result = checkReqRowExistence(
      [{ path: "docs/designs/x.md", content: "REQ-107-999 を引用する" }],
      index,
      compile(DEFAULT_ID_PATTERN),
    );
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual([
      { id: "REQ-107-999", file: "docs/designs/x.md", line: 1 },
    ]);
    expect(result.errors).toHaveLength(1);
  });

  test("TS-006 case 2: same-change created reference target passes (post-application state)", () => {
    // Design と REQ テーブルが同じ変更で更新される場合、REQ の適用後本文を
    // overlay として渡せば Design 側の引用は合格する（保存順序に依存しない）
    const overlayReq = `| REQ-107-001 | A |\n| REQ-107-009 | 新規要件 |`;
    const index = buildRequirementRowIndex([baseTableReq()], [{ path: "docs/requirements/REQ-107.md", content: overlayReq }], compile(DEFAULT_ID_PATTERN));
    const result = checkReqRowExistence(
      [
        { path: "docs/designs/x.md", content: "REQ-107-009 を引用する" },
        { path: "docs/requirements/REQ-107.md", content: overlayReq },
      ],
      index,
      compile(DEFAULT_ID_PATTERN),
    );
    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.checkedFiles).toBe(2);
  });

  test("exempt target paths are skipped with warnings", () => {
    const index = buildRequirementRowIndex([baseTableReq()], [], compile(DEFAULT_ID_PATTERN));
    const result = checkReqRowExistence(
      [
        { path: "docs/designs/integrity/rules/IR-067-x.md", content: "REQ-107-999" },
        { path: "docs/reports/hist.md", content: "REQ-107-999" },
      ],
      index,
      compile(DEFAULT_ID_PATTERN),
    );
    expect(result.ok).toBe(true);
    expect(result.checkedFiles).toBe(0);
    expect(result.warnings).toHaveLength(2);
  });

  test("legacy 4-digit band is not exempt by default (post-application default)", () => {
    const index = buildRequirementRowIndex([baseTableReq()], [], compile(DEFAULT_ID_PATTERN));
    const result = checkReqRowExistence(
      [{ path: "docs/designs/x.md", content: "REQ-0136-029 を引用" }],
      index,
      compile(DEFAULT_ID_PATTERN),
    );
    expect(result.ok).toBe(false);
    expect(result.missing[0]?.id).toBe("REQ-0136-029");
  });

  test("default pattern resolves 3-4 digit prefix widths from project numbering", () => {
    const index = buildRequirementRowIndex(
      [{ path: "docs/requirements/retired/REQ-0136.md", content: "| REQ-0136-029 | 旧要件 |" }],
      [],
      compile(DEFAULT_ID_PATTERN),
    );
    const result = checkReqRowExistence(
      [{ path: "docs/designs/x.md", content: "REQ-0136-029 を引用" }],
      index,
      compile(DEFAULT_ID_PATTERN),
    );
    expect(result.ok).toBe(true);
  });

  test("table rows of a written REQ file itself resolve against its own post-application table", () => {
    const reqAfter = `# REQ-108\n\n| REQ ID | タイトル |\n|---|---|\n| REQ-108-001 | 新規 |\n本文で REQ-108-001 を参照\n`;
    const index = buildRequirementRowIndex([], [{ path: "docs/requirements/REQ-108.md", content: reqAfter }], compile(DEFAULT_ID_PATTERN));
    const result = checkReqRowExistence(
      [{ path: "docs/requirements/REQ-108.md", content: reqAfter }],
      index,
      compile(DEFAULT_ID_PATTERN),
    );
    expect(result.ok).toBe(true);
  });
});
