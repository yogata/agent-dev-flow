// ADF-COVERS(verification): REQ-010-011, REQ-059-001, REQ-059-002, REQ-059-003, REQ-059-004, REQ-059-005, REQ-047-013
/**
 * Representative tests for index generation modules (generate_indexes/).
 *
 * 全インデックス種別の代表正常系と、マーカー検出・計測日導出・関連REQ表・
 * supersede 注記・逆索引・manifest 再生成の代表異常系を代表ケースで固定する。
 *
 * マーカー検出（行全体一致）は backtick 囲みの marker 文字列を実 marker と
 * 誤認して generate_indexes.ts が停止した回帰（PR #1718 / Issue #1771、RU-0002）を
 * 代表ケースで固定する。
 *
 * Design: docs/designs/integrity/index-auto-generation.md「AUTOGEN marker 検出契約」
 */
import { describe, it, expect, afterAll } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  isAutogenBeginLine,
  isAutogenEndLine,
  extractAutogenBeginId,
  findAutogenBlocks,
  replaceAutogenBlock,
  README_REQ_SUMMARY_COUNT_BLOCK_ID,
  README_REQ_SUMMARY_TABLE_BLOCK_ID,
  README_DECISION_SUMMARY_TABLE_BLOCK_ID,
} from "../generate_indexes/markers.ts";
import {
  collectDecisionFiles,
  collectReqFiles,
} from "../generate_indexes/collectors.ts";
import {
  buildReqToIrIndex,
  generateReqImpactMapCrossref,
} from "../generate_indexes/integrity_indexes.ts";
import {
  extractRelatedReqNotes,
  findUndeclaredRelatedReqDecisions,
  formatRelatedReqCell,
  formatSupersedeNoteSuffix,
  generateDecisionBaselineTable,
  generateDecisionRelatedReqTable,
  generateDecisionStatusList,
  normalizeSupersedeNote,
} from "../generate_indexes/decision_readme.ts";
import { generateReqActiveTable } from "../generate_indexes/req_readme.ts";
import { generateDocsReadmeDecisionTable } from "../generate_indexes/docs_readme.ts";
import {
  SKILL_PROJECTION_MANIFEST_REL,
  deriveSkillProjectionManifestSkills,
  replaceSkillProjectionManifestGeneratedAt,
  replaceSkillProjectionManifestSkills,
} from "../generate_indexes/skill_manifest.ts";
import { deriveMeasureDateFromLastCommit } from "../generate_indexes/measure_date.ts";
import { findRepoRoot } from "../../lib/cli_utils.ts";

const REPO_ROOT_FOR_B31 = findRepoRoot(import.meta.dir);

describe("AUTOGEN marker detection (whole-line matching, Issue #1771)", () => {
  it("detects canonical and whitespace-padded marker lines", () => {
    expect(isAutogenBeginLine("<!-- AUTOGEN:BEGIN:id=catalog-ir-entries-pre-045 -->")).toBe(true);
    expect(isAutogenBeginLine("  <!-- AUTOGEN:BEGIN:id=xxx -->")).toBe(true);
    expect(isAutogenBeginLine("<!-- AUTOGEN:BEGIN:id=xxx -->  ")).toBe(true);
    expect(isAutogenEndLine("<!-- AUTOGEN:END -->")).toBe(true);
    expect(isAutogenEndLine("  <!-- AUTOGEN:END -->")).toBe(true);
    expect(extractAutogenBeginId("<!-- AUTOGEN:BEGIN:id=catalog-ir-entries-pre-045 -->")).toBe("catalog-ir-entries-pre-045");
    expect(extractAutogenBeginId("  <!-- AUTOGEN:BEGIN:id=spec-metrics-measurement-example -->")).toBe("spec-metrics-measurement-example");
  });

  it("rejects backtick-wrapped, boundary-adjacent, and prose-inline markers", () => {
    expect(isAutogenBeginLine("`<!-- AUTOGEN:BEGIN:id=xxx -->`")).toBe(false);
    expect(isAutogenBeginLine("`<!-- AUTOGEN:BEGIN:id=xxx -->")).toBe(false);
    expect(isAutogenBeginLine("<!-- AUTOGEN:BEGIN:id=xxx -->`")).toBe(false);
    const prose = "AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から対応する`<!-- AUTOGEN:END -->`までを除外する。";
    expect(isAutogenBeginLine(prose)).toBe(false);
    expect(isAutogenEndLine(prose)).toBe(false);
    expect(isAutogenBeginLine("This is a normal paragraph.")).toBe(false);
    expect(extractAutogenBeginId("`<!-- AUTOGEN:BEGIN:id=xxx -->`")).toBe(null);
    expect(extractAutogenBeginId("normal text")).toBe(null);
  });

  it("finds and replaces only real blocks even when prose contains backtick-wrapped markers", () => {
    const mixed = [
      "# Title",
      "",
      "AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から対応する`<!-- AUTOGEN:END -->`までを除外する。",
      "",
      "<!-- AUTOGEN:BEGIN:id=real-block -->",
      "old line",
      "<!-- AUTOGEN:END -->",
      "",
      "After block.",
    ].join("\n");
    const blocks = findAutogenBlocks(mixed);
    expect(blocks.length).toBe(1);
    expect(blocks[0].id).toBe("real-block");
    expect(blocks[0].startLine).toBe(4);
    expect(blocks[0].endLine).toBe(6);
    expect(blocks[0].currentBody).toEqual(["old line"]);

    const replaced = replaceAutogenBlock(mixed, "real-block", ["new line"]);
    expect(replaced).toContain("new line");
    expect(replaced).not.toContain("old line");
    expect(replaced).toContain("AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から対応する`<!-- AUTOGEN:END -->`までを除外する。");
  });

  it("detects multiple distinct real blocks and leaves unmatched ids unchanged", () => {
    const content = [
      "<!-- AUTOGEN:BEGIN:id=block-1 -->",
      "a",
      "<!-- AUTOGEN:END -->",
      "gap",
      "<!-- AUTOGEN:BEGIN:id=block-2 -->",
      "b",
      "<!-- AUTOGEN:END -->",
    ].join("\n");
    const blocks = findAutogenBlocks(content);
    expect(blocks.length).toBe(2);
    expect(blocks.map((b) => b.id)).toEqual(["block-1", "block-2"]);
    expect(replaceAutogenBlock(content, "absent", ["new"])).toBe(content);
  });
});

// ─── 計測日導出（SC-002「計測日導出」、Issue #2211）───────────────────────

describe("deriveMeasureDateFromLastCommit", () => {
  it("returns a stable YYYY-MM-DD for a tracked file with commit history", () => {
    const root = findRepoRoot(import.meta.dir);
    const p = path.join(root, "docs", "README.md");
    const date = deriveMeasureDateFromLastCommit(root, [p]);
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(deriveMeasureDateFromLastCommit(root, [p])).toBe(date);
  });

  it("returns null without commit history or for an empty path list", () => {
    const root = findRepoRoot(import.meta.dir);
    expect(
      deriveMeasureDateFromLastCommit(root, [
        path.join(root, "docs", "__no_such_file__.md"),
      ]),
    ).toBe(null);
    expect(deriveMeasureDateFromLastCommit(root, [])).toBe(null);
  });
});

// ─── Decision 関連REQ表（REQ-059-001..003）──────────────────────────────────

const RR_TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "genidx-related-req-"));

function writeDecision(dir: string, id: string, fmBody: string): void {
  fs.writeFileSync(
    path.join(dir, `${id}.md`),
    ["---", `id: ${id}`, fmBody, "---", "", `# ${id}`, ""].join("\n"),
    "utf-8",
  );
}

describe("Decision related_reqs collection (REQ-059-001..003)", () => {
  const decDir = path.join(RR_TMP_ROOT, "decisions");
  if (!fs.existsSync(decDir)) {
    fs.mkdirSync(decDir, { recursive: true });
    writeDecision(
      decDir,
      "DEC-001",
      'title: "T1"\nstatus: accepted\nrelated_reqs: [REQ-002, REQ-009]\ncreated: "2026-01-01"\nupdated: "2026-01-01"',
    );
    writeDecision(
      decDir,
      "DEC-002",
      'title: "T2"\nstatus: accepted\nrelated_reqs: []\ncreated: "2026-01-01"\nupdated: "2026-01-01"',
    );
    writeDecision(
      decDir,
      "DEC-003",
      'title: "T3"\nstatus: proposed\ncreated: "2026-01-01"\nupdated: "2026-01-01"',
    );
  }

  it("parses a declared list, an empty declaration, and an undeclared field distinctly", () => {
    const infos = collectDecisionFiles(decDir);
    const byId = new Map(infos.map((d) => [d.id, d]));
    expect(byId.get("DEC-001")?.relatedReqs).toEqual(["REQ-002", "REQ-009"]);
    expect(byId.get("DEC-002")?.relatedReqs).toEqual([]);
    expect(byId.get("DEC-003")?.relatedReqs).toBe(null);
    const undeclared = findUndeclaredRelatedReqDecisions(infos);
    expect(undeclared.map((d) => d.id)).toEqual(["DEC-003"]);
  });

  it("formats declared and empty cells", () => {
    expect(formatRelatedReqCell(["REQ-002", "REQ-009"])).toBe(
      "[REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md)",
    );
    expect(formatRelatedReqCell([])).toBe("-");
  });

  it("generates a mixed-area table preserving hand-curated note cells", () => {
    const infos = collectDecisionFiles(decDir);
    const notes = { "DEC-001": "人手判断列" };
    const table = generateDecisionRelatedReqTable(infos, notes);
    expect(table[0]).toBe("| Decision | 関連REQ | 説明 |");
    expect(table[2]).toContain("| DEC-001 | [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md) | 人手判断列 |");
    expect(table[3]).toContain("| DEC-002 | - | - |");
  });

  it("keeps generation idempotent for note cells (no data loss on re-run)", () => {
    const infos = collectDecisionFiles(decDir);
    const notes = { "DEC-001": "人手判断列" };
    const first = generateDecisionRelatedReqTable(infos, notes);
    const secondNotes = extractRelatedReqNotes(
      ["## 関連 REQ", "", ...first, "", "## 次の節", ""].join("\n"),
    );
    const second = generateDecisionRelatedReqTable(infos, secondNotes);
    expect(second).toEqual(first);
  });
});

describe("extractRelatedReqNotes", () => {
  it("extracts note cells only within the related REQ section", () => {
    const content = [
      "## Decision Map",
      "",
      "| Decision | 関係 | 対象 | 説明 |",
      "| DEC-001 | relates-to | v2:ADR-0105 | map row must not be picked |",
      "",
      "## 関連 REQ",
      "",
      "| Decision | 関連REQ | 説明 |",
      "| DEC-002 | [REQ-009](../requirements/REQ-009.md) | note-two |",
      "",
      "## 過去版の履歴基盤",
      "",
      "| DEC-003 | after section must not be picked |",
    ].join("\n");
    const notes = extractRelatedReqNotes(content);
    expect(notes).toEqual({ "DEC-002": "note-two" });
  });
});

// ─── supersede_note 由来の部分置換注記生成（RA-002 / Issue #3460）────────────

const SUP_TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "genidx-supersede-"));

describe("supersede_note parsing and suffix generation (RA-002)", () => {
  const supDecDir = path.join(SUP_TMP_ROOT, "decisions");
  if (!fs.existsSync(supDecDir)) {
    fs.mkdirSync(supDecDir, { recursive: true });
    writeDecision(
      supDecDir,
      "DEC-017",
      'title: "T17"\nstatus: superseded\nsuperseded_by: DEC-037\nsupersede_note: "決定4 は DEC-037 が置換。決定1〜3は維持"\nrelated_reqs: [REQ-032]\ncreated: "2026-01-01"\nupdated: "2026-01-01"',
    );
    writeDecision(
      supDecDir,
      "DEC-030",
      'title: "T30"\nstatus: superseded\nsuperseded_by: DEC-037\nrelated_reqs: [REQ-032]\ncreated: "2026-01-01"\nupdated: "2026-01-01"',
    );
    writeDecision(
      supDecDir,
      "DEC-037",
      'title: "T37"\nstatus: accepted\nrelated_reqs: [REQ-032]\ncreated: "2026-01-01"\nupdated: "2026-01-01"',
    );
  }

  it("parses superseded_by and supersede_note from frontmatter", () => {
    const byId = new Map(collectDecisionFiles(supDecDir).map((d) => [d.id, d]));
    expect(byId.get("DEC-017")?.supersededBy).toBe("DEC-037");
    expect(byId.get("DEC-017")?.supersedeNote).toBe(
      "決定4 は DEC-037 が置換。決定1〜3は維持",
    );
    expect(byId.get("DEC-030")?.supersedeNote).toBe(null);
    expect(byId.get("DEC-037")?.supersededBy).toBe(null);
  });

  it("returns the note suffix only for a superseded decision with supersede_note", () => {
    const byId = new Map(collectDecisionFiles(supDecDir).map((d) => [d.id, d]));
    expect(formatSupersedeNoteSuffix(byId.get("DEC-017")!)).toBe(
      "〔superseded by DEC-037。決定4 は DEC-037 が置換。決定1〜3は維持〕",
    );
    expect(formatSupersedeNoteSuffix(byId.get("DEC-030")!)).toBe(null);
    expect(formatSupersedeNoteSuffix(byId.get("DEC-037")!)).toBe(null);
  });

  it("appends the same note to the baseline table row and the superseded section row", () => {
    const infos = collectDecisionFiles(supDecDir);
    const table = generateDecisionBaselineTable(infos);
    const list = generateDecisionStatusList(infos, "superseded");
    const expectedNote =
      "〔superseded by DEC-037。決定4 は DEC-037 が置換。決定1〜3は維持〕";
    expect(table).toContain(`| DEC-017 | T17${expectedNote} | superseded | 2026-01-01 |`);
    expect(list).toContain(
      `- [DEC-017](DEC-017.md)（T17）${expectedNote}`,
    );
    expect(table.join("\n")).not.toContain("| DEC-030 | T30〔");
    expect(list.join("\n")).not.toContain("[DEC-030](DEC-030.md)（T30）〔");
  });
});

describe("supersede_note rendering normalization (Issue #3460, ACT-DESIGN-035)", () => {
  const normDecDir = path.join(SUP_TMP_ROOT, "norm", "decisions");
  if (!fs.existsSync(normDecDir)) {
    fs.mkdirSync(normDecDir, { recursive: true });
    writeDecision(
      normDecDir,
      "DEC-045",
      'title: "T45"\nstatus: accepted\nsuperseded_by: DEC-050\nsupersede_note: |\n  部分置換。決定3後半を新規 Decision が置換する。\n  置換対象外: 決定1、決定2。\nrelated_reqs: [REQ-032]\ncreated: "2026-09-27"\nupdated: "2026-10-04"',
    );
    writeDecision(
      normDecDir,
      "DEC-051",
      'title: "T51"\nstatus: superseded\nsuperseded_by: DEC-050\nsupersede_note: ""\nrelated_reqs: [REQ-032]\ncreated: "2026-10-01"\nupdated: "2026-10-01"',
    );
    writeDecision(
      normDecDir,
      "DEC-053",
      'title: "T53"\nstatus: superseded\nsuperseded_by: DEC-050\nsupersede_note: |\n  決定2のみ後継が置換。\n  決定1・3は維持。\nrelated_reqs: [REQ-032]\ncreated: "2026-10-01"\nupdated: "2026-10-01"',
    );
  }

  const byId = () =>
    new Map(collectDecisionFiles(normDecDir).map((d) => [d.id, d]));

  it("parses YAML block-scalar supersede_note into the full multiline text", () => {
    const dec = byId().get("DEC-045")!;
    expect(dec.supersededBy).toBe("DEC-050");
    expect(dec.supersedeNote).toBe(
      "部分置換。決定3後半を新規 Decision が置換する。\n置換対象外: 決定1、決定2。",
    );
  });

  it("normalizes block-scalar notes to single-line and empty inputs to null", () => {
    expect(normalizeSupersedeNote(byId().get("DEC-045")!.supersedeNote)).toBe(
      "部分置換。決定3後半を新規 Decision が置換する。 置換対象外: 決定1、決定2。",
    );
    expect(normalizeSupersedeNote("")).toBe(null);
    expect(normalizeSupersedeNote("   ")).toBe(null);
    expect(normalizeSupersedeNote("\n  ")).toBe(null);
    expect(normalizeSupersedeNote(null)).toBe(null);
    expect(formatSupersedeNoteSuffix(byId().get("DEC-051")!)).toBe(null);
  });

  it("expands block-scalar supersede_note as a single-line suffix", () => {
    expect(formatSupersedeNoteSuffix(byId().get("DEC-053")!)).toBe(
      "〔superseded by DEC-050。決定2のみ後継が置換。 決定1・3は維持。〕",
    );
  });

  it("expands block-scalar supersede_note in docs/README table row without pipe-only output", () => {
    const rows = generateDocsReadmeDecisionTable(
      collectDecisionFiles(normDecDir),
    );
    const row = rows.find((r) => r.includes("[DEC-045]"))!;
    expect(row).toBe(
      "| [DEC-045](decisions/DEC-045.md) | T45（superseded by DEC-050〔部分置換。決定3後半を新規 Decision が置換する。 置換対象外: 決定1、決定2。〕） |",
    );
    expect(row).not.toContain("〔|〕");
    expect(row).not.toContain("|〕");
  });

  it("degrades docs/README annotation to no-note form for empty or whitespace-only supersede_note", () => {
    const rows = generateDocsReadmeDecisionTable(
      collectDecisionFiles(normDecDir),
    );
    const emptyRow = rows.find((r) => r.includes("[DEC-051]"))!;
    expect(emptyRow).toBe(
      "| [DEC-051](decisions/DEC-051.md) | T51（superseded by DEC-050） |",
    );
    expect(rows.join("\n")).not.toContain("〔|〕");
  });

  it("sanitizes pipes and newlines inside the note annotation to keep the table intact", () => {
    const info = {
      id: "DEC-099",
      num: 99,
      title: "T99",
      status: "superseded",
      created: "2026-10-01",
      filename: "DEC-099.md",
      relPath: "DEC-099.md",
      relatedReqs: [] as string[],
      supersededBy: "DEC-100",
      supersedeNote: "行1\n行2 | 行3",
    } as never;
    const rows = generateDocsReadmeDecisionTable([info]);
    expect(rows[2]).toBe(
      "| [DEC-099](decisions/DEC-099.md) | T99（superseded by DEC-100〔行1 行2 / 行3〕） |",
    );
  });
});

describe("doc_decision template related_reqs initial value (REQ-059-004)", () => {
  const repoRoot = findRepoRoot(import.meta.dir);
  const templateCandidates = [
    path.join(repoRoot, "src", "common", "skills", "agentdev-decision-file-manager", "templates", "doc_decision.md"),
    path.join(repoRoot, ".opencode", "skills", "agentdev-decision-file-manager", "templates", "doc_decision.md"),
  ];
  const templatePath = templateCandidates.find((p) => fs.existsSync(p));

  it("declares related_reqs: [] as the initial frontmatter value", () => {
    expect(templatePath).toBeDefined();
    const content = fs.readFileSync(templatePath!, "utf-8");
    const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    expect(fmMatch).not.toBeNull();
    const relatedReqLine = fmMatch![1]
      .split("\n")
      .find((l) => /^related_reqs:/.test(l));
    expect(relatedReqLine).toBe("related_reqs: []");
  });
});

describe("readme-req-summary-table (REQ-057-018)", () => {
  it("replaces docs/README.md readme-req-summary-table block with REQ ID + title rows", () => {
    expect(README_REQ_SUMMARY_TABLE_BLOCK_ID).toBe("readme-req-summary-table");
    expect(README_REQ_SUMMARY_COUNT_BLOCK_ID).toBe("readme-req-summary-count");
    const original = [
      "現行要件の説明文（人手編集領域）",
      "",
      "<!-- AUTOGEN:BEGIN:id=readme-req-summary-table -->",
      "| REQ | タイトル |",
      "|---|---|",
      "| [REQ-001](requirements/REQ-001.md) | 旧手動行 |",
      "<!-- AUTOGEN:END -->",
      "",
      "- [要件インデックス](requirements/README.md)",
    ].join("\n");
    const rows = [
      { id: "REQ-001", relPath: "requirements/REQ-001.md", title: "文書体系" },
    ] as never[];
    const updated = replaceAutogenBlock(
      original,
      README_REQ_SUMMARY_TABLE_BLOCK_ID,
      generateReqActiveTable(rows),
    );
    expect(updated).toContain("<!-- AUTOGEN:BEGIN:id=readme-req-summary-table -->");
    expect(updated).toContain("| REQ ID | タイトル |");
    expect(updated).toContain("現行要件の説明文（人手編集領域）");
    expect(updated).not.toContain("旧手動行");
  });
});

describe("readme-decision-summary-table (AG-005, Case #3166)", () => {
  const dec = (over: Partial<Record<string, unknown>>) =>
    ({
      id: "DEC-017",
      num: 40,
      title: "fixture: サンプル Decision の supersede 表記",
      status: "superseded",
      created: "2026-09-22",
      filename: "DEC-017.md",
      relPath: "DEC-017.md",
      relatedReqs: ["REQ-032"],
      supersededBy: "DEC-037",
      supersedeNote: null,
      ...over,
    }) as never;

  it("generates rows with superseded_by annotation and expands supersede_note as notes notation", () => {
    expect(README_DECISION_SUMMARY_TABLE_BLOCK_ID).toBe(
      "readme-decision-summary-table",
    );
    const rows = generateDocsReadmeDecisionTable([dec({})]);
    expect(rows).toContain(
      "| [DEC-017](decisions/DEC-017.md) | fixture: サンプル Decision の supersede 表記（superseded by DEC-037） |",
    );
    const noted = generateDocsReadmeDecisionTable([
      dec({
        supersedeNote:
          "決定4 は DEC-037 が置換。決定2 は DEC-036 が置換。決定1・3は維持",
      }),
    ]);
    expect(noted).toContain(
      "| [DEC-017](decisions/DEC-017.md) | fixture: サンプル Decision の supersede 表記（superseded by DEC-037〔決定4 は DEC-037 が置換。決定2 は DEC-036 が置換。決定1・3は維持〕） |",
    );
  });

  it("derives annotation for accepted decisions with superseded_by and skips decisions without superseded_by", () => {
    const accepted = generateDocsReadmeDecisionTable([
      dec({
        id: "DEC-028",
        num: 28,
        title: "文章表層品質の共通実行基盤",
        status: "accepted",
        created: "2026-09-09",
        filename: "DEC-028.md",
        relPath: "DEC-028.md",
        relatedReqs: ["REQ-053", "REQ-010", "REQ-036"],
        supersededBy: "DEC-047",
        supersedeNote:
          "「配布前に依存を解決した成果物を供給し、導入先での追加パッケージ取得を必要としない」条項は DEC-047 が textlint guard 依存実体の配布供給の範囲で部分置換。DEC-016 維持宣言と他の決定は維持（status: accepted 維持）",
      }),
    ]);
    expect(accepted.join("\n")).toContain(
      "文章表層品質の共通実行基盤（superseded by DEC-047〔「配布前に依存を解決した成果物を供給し、導入先での追加パッケージ取得を必要としない」条項は DEC-047 が textlint guard 依存実体の配布供給の範囲で部分置換。DEC-016 維持宣言と他の決定は維持（status: accepted 維持）〕）",
    );
    const noSupersede = generateDocsReadmeDecisionTable([
      dec({ status: "accepted", supersededBy: null }),
    ]);
    expect(noSupersede.join("\n")).not.toContain("superseded by");
  });
});

const B31_TMP_ROOT = fs.mkdtempSync(
  path.join(os.tmpdir(), "generate-indexes-b31-"),
);

function irFixture(id: string, relatedReq: string[]): ReturnType<typeof import("../generate_indexes/collectors.ts").collectIrFiles>[number] {
  return {
    id,
    num: Number(id.slice(3)),
    title: `${id} fixture`,
    filename: `${id.toLowerCase()}-fixture.md`,
    relPath: `rules/${id.toLowerCase()}-fixture.md`,
    relatedReq,
    relatedDesign: [],
  };
}

describe("buildReqToIrIndex (REQ-047-013, B3-1 逆方向導出)", () => {
  it("collects file-level REQ ids per IR with numeric IR ordering", () => {
    const index = buildReqToIrIndex([
      irFixture("IR-005", ["REQ-010-003", "REQ-010"]),
      irFixture("IR-001", ["REQ-010-001", "REQ-001"]),
    ]);
    expect([...index.keys()].sort()).toEqual(["REQ-001", "REQ-010"]);
    expect(index.get("REQ-010")).toEqual(["IR-001", "IR-005"]);
  });

  it("skips v2 historical refs, annotation cells and non-REQ ids", () => {
    const index = buildReqToIrIndex([
      irFixture("IR-002", ["v2:REQ-0143", "REQ-002 (注記)", "-", "039", "REQ-047-011"]),
    ]);
    expect([...index.keys()]).toEqual(["REQ-002", "REQ-047"]);
  });
});

describe("generateReqImpactMapCrossref (REQ-047-013, B3-1 逆方向導出)", () => {
  it("renders only current REQ rows with titles and numeric ordering", () => {
    const reqDir = path.join(B31_TMP_ROOT, "req-crossref");
    fs.mkdirSync(reqDir, { recursive: true });
    fs.writeFileSync(
      path.join(reqDir, "REQ-001.md"),
      "---\nid: REQ-001\ntitle: 文書体系と持続可能な基準構造\n---\n\nBody.\n",
      "utf-8",
    );
    fs.writeFileSync(
      path.join(reqDir, "REQ-047.md"),
      "---\nid: REQ-047\ntitle: 規則所有権の一方向化\n---\n\nBody.\n",
      "utf-8",
    );
    const reqInfos = collectReqFiles(reqDir);
    const rows = generateReqImpactMapCrossref(
      [
        irFixture("IR-001", ["REQ-001"]),
        irFixture("IR-002", ["REQ-999", "REQ-047"]),
      ],
      reqInfos,
    );
    expect(rows[0]).toContain("影響する Rule IDs");
    expect(rows.join("\n")).toContain("| [REQ-001](../../requirements/REQ-001.md) | 文書体系と持続可能な基準構造 | IR-001 |");
    expect(rows.join("\n")).toContain("| [REQ-047](../../requirements/REQ-047.md) | 規則所有権の一方向化 | IR-002 |");
    expect(rows.join("\n")).not.toContain("REQ-999");
  });
});

describe("skill-projection-manifest regeneration (REQ-047-013, B3-3)", () => {
  it("derives sorted skills excluding repo-* from src enumeration", () => {
    const skillsDir = path.join(B31_TMP_ROOT, "skills-enum");
    fs.mkdirSync(path.join(skillsDir, "agentdev-zzz"), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, "agentdev-aaa"), { recursive: true });
    fs.mkdirSync(path.join(skillsDir, "repo-agentdev-integrity"), { recursive: true });
    const skills = deriveSkillProjectionManifestSkills(skillsDir);
    expect(skills).toEqual(["agentdev-aaa", "agentdev-zzz"]);
  });

  it("replaces the skills entry block and keeps surrounding lines", () => {
    const content = [
      "# header comment",
      "schema_version: 1",
      "generated_at: 2026-01-01",
      "",
      "skills:",
      "  - agentdev-old-a",
      "  - agentdev-old-b",
      "",
      "third_party_skills:",
      "  - explainer",
      "",
    ].join("\n");
    const updated = replaceSkillProjectionManifestSkills(content, [
      "agentdev-new-a",
      "agentdev-new-b",
      "agentdev-new-c",
    ]);
    expect(updated).toContain("  - agentdev-new-a\n  - agentdev-new-b\n  - agentdev-new-c");
    expect(updated).not.toContain("agentdev-old");
    expect(updated).toContain("# header comment");
    expect(updated).toContain("third_party_skills:");
    expect(updated).toContain("  - explainer");
    expect(updated).toContain("\n\nthird_party_skills:");
  });

  it("updates generated_at line only and matches the canonical data file path", () => {
    const content = "schema_version: 1\ngenerated_at: 2026-01-01\n";
    const updated = replaceSkillProjectionManifestGeneratedAt(content, "2026-11-13");
    expect(updated).toBe("schema_version: 1\ngenerated_at: 2026-11-13\n");
    expect(SKILL_PROJECTION_MANIFEST_REL).toBe(
      ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml",
    );
    expect(fs.existsSync(path.join(REPO_ROOT_FOR_B31, ...SKILL_PROJECTION_MANIFEST_REL.split("/")))).toBe(true);
  });
});

afterAll(() => {
  fs.rmSync(RR_TMP_ROOT, { recursive: true, force: true });
  fs.rmSync(SUP_TMP_ROOT, { recursive: true, force: true });
  fs.rmSync(B31_TMP_ROOT, { recursive: true, force: true });
});
