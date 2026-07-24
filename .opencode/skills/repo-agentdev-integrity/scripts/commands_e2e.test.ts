/**
 * E2E workflow tests for all agentdev command definitions.
 * REQ-0030-009: Normal-path E2E tests for all commands
 * REQ-0030-013: Test files placed in corresponding scripts/ directory
 *
 * Validates end-to-end workflow aspects:
 * - Pipeline continuity (commands form valid chains)
 * - Cross-command data flow (output of one matches input of next)
 * - Template reference validity from command definitions
 * - Guardrail completeness
 * - Input/Output/Steps section completeness
 */
import {
  describe,
  it,
  expect,
} from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    if (fs.existsSync(path.join(dir, "src", "opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const PROJECTION_CMD_DIR = path.join(REPO_ROOT, ".opencode", "commands", "agentdev");
const SOURCE_CMD_DIR = path.join(REPO_ROOT, "src", "opencode", "commands", "agentdev");
const CMD_DIR = fs.existsSync(PROJECTION_CMD_DIR) ? PROJECTION_CMD_DIR : SOURCE_CMD_DIR;
const PROJECTION_SKILLS_DIR = path.join(REPO_ROOT, ".opencode", "skills");
const SOURCE_SKILLS_DIR = path.join(REPO_ROOT, "src", "opencode", "skills");
const SKILLS_DIR = fs.existsSync(path.join(PROJECTION_SKILLS_DIR, "agentdev-workflow-templates"))
  ? PROJECTION_SKILLS_DIR
  : SOURCE_SKILLS_DIR;
const PROJECTION_TEMPLATES_DIR = path.join(
  PROJECTION_SKILLS_DIR,
  "agentdev-workflow-templates",
  "templates",
);
const SOURCE_TEMPLATES_DIR = path.join(
  SOURCE_SKILLS_DIR,
  "agentdev-workflow-templates",
  "templates",
);
const TEMPLATES_DIR = fs.existsSync(PROJECTION_TEMPLATES_DIR) ? PROJECTION_TEMPLATES_DIR : SOURCE_TEMPLATES_DIR;

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseFrontmatter(content: string): Record<string, string | string[]> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const yaml = parts[1].trim();
  const result: Record<string, string | string[]> = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  const currentArray: string[] = [];

  function flushArray() {
    if (currentKey !== null && currentArray.length > 0) {
      result[currentKey] = [...currentArray];
    }
    currentKey = null;
    currentArray.length = 0;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("- ") && currentKey !== null) {
      currentArray.push(trimmed.slice(2).trim());
      continue;
    }
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    flushArray();
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (value === "") {
      currentKey = key;
      currentArray.length = 0;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      result[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  flushArray();
  return result;
}

function getCommandFiles(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(CMD_DIR)) return map;
  for (const f of fs.readdirSync(CMD_DIR).filter((f) => f.endsWith(".md") && f !== "README.md").sort()) {
    map.set(f.replace(".md", ""), fs.readFileSync(path.join(CMD_DIR, f), "utf-8"));
  }
  return map;
}

function extractSection(content: string, heading: string): string {
  const body = content.split("---").slice(2).join("---");
  const lines = body.split("\n");
  let inSection = false;
  const sectionLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("### ")) {
      if (inSection) break;
      if (line === `## ${heading}` || line.startsWith(`## ${heading} `)) {
        inSection = true;
      }
      continue;
    }
    if (inSection) sectionLines.push(line);
  }
  return sectionLines.join("\n").trim();
}

function extractTemplateRefs(content: string): string[] {
  const refs: string[] = [];
  const pattern = /agentdev-workflow-templates\/templates\/([a-z_]+\.md)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    refs.push(match[1]);
  }
  return [...new Set(refs)];
}

function extractCommandRefs(content: string): string[] {
  const refs: string[] = [];
  const pattern = /\/agentdev\/([a-z][a-z0-9-]*)\b(?!\/)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    refs.push(match[1]);
  }
  return [...new Set(refs)];
}

function getSkillDirs(): Set<string> {
  if (!fs.existsSync(SKILLS_DIR)) return new Set();
  return new Set(
    fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );
}

function getTemplateFiles(): Set<string> {
  if (!fs.existsSync(TEMPLATES_DIR)) return new Set();
  return new Set(fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".md")));
}

// ─── TS-008 / TS-009 detection helpers ───────────────────────────────────────
// docs-spec-rebuild-integrity SPEC 構文健全性検査（不存在 command 参照・エンコーディング
// 不整合）に準拠する純粋関数。inspect-docs / inspect-skills 配布物整合性診断が宣言する
// 検出パターンと同じ規則を正例・負例の回帰テストへ接続する。

interface CommandRefFinding {
  ref: string;
  line: number;
  snippet: string;
}

interface EncodingFinding {
  category: "utf8-bom" | "crlf-lf-mixed";
  file: string;
  line: number;
}

function detectNonExistentCommandRefs(
  content: string,
  validCommands: ReadonlySet<string>,
  options: {
    sourceLabel?: string;
    skillRefAllowList?: ReadonlySet<string>;
  } = {},
): CommandRefFinding[] {
  const self = options.sourceLabel;
  const skillRefs = options.skillRefAllowList ?? new Set<string>();
  // (?!\/) excludes path references (e.g. /agentdev/templates/...).
  const pattern = /\/agentdev\/([a-z][a-z0-9-]*)\b(?!\/)/g;
  const findings: CommandRefFinding[] = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      const ref = match[1];
      if (ref === undefined) continue;
      if (self !== undefined && ref === self) continue;
      if (skillRefs.has(ref)) continue;
      if (validCommands.has(ref)) continue;
      findings.push({
        ref,
        line: i + 1,
        snippet: line.trim().substring(0, 200),
      });
    }
  }
  return findings;
}

function detectEncodingInconsistencies(
  fileBytes: Uint8Array,
  filePath: string,
): EncodingFinding[] {
  const findings: EncodingFinding[] = [];

  // UTF-8 BOM magic bytes: EF BB BF.
  if (
    fileBytes.length >= 3 &&
    fileBytes[0] === 0xef &&
    fileBytes[1] === 0xbb &&
    fileBytes[2] === 0xbf
  ) {
    findings.push({ category: "utf8-bom", file: filePath, line: 1 });
  }

  let hasCrlf = false;
  let hasLfOnly = false;
  let firstKind: "crlf" | "lf" | null = null;
  let firstMixLine: number | null = null;
  let lineNum = 1;
  for (let i = 0; i < fileBytes.length; i++) {
    const b = fileBytes[i];
    if (b === undefined) continue;
    const next = fileBytes[i + 1];
    if (b === 0x0d && next === 0x0a) {
      hasCrlf = true;
      if (firstKind === null) {
        firstKind = "crlf";
      } else if (firstKind !== "crlf" && firstMixLine === null) {
        firstMixLine = lineNum;
      }
      lineNum++;
      i++;
    } else if (b === 0x0a) {
      hasLfOnly = true;
      if (firstKind === null) {
        firstKind = "lf";
      } else if (firstKind !== "lf" && firstMixLine === null) {
        firstMixLine = lineNum;
      }
      lineNum++;
    }
  }
  if (hasCrlf && hasLfOnly && firstMixLine !== null) {
    findings.push({
      category: "crlf-lf-mixed",
      file: filePath,
      line: firstMixLine,
    });
  }

  return findings;
}

const commands = getCommandFiles();
const skillDirs = getSkillDirs();
const templateFiles = getTemplateFiles();

// Current 17 public agentdev commands (aligns with commands/agentdev/README.md listing)
const EXPECTED_COMMANDS = [
  "backlog-review",
  "case-auto",
  "case-close",
  "case-open",
  "case-run",
  "case-update",
  "inspect-docs",
  "inspect-extensions",
  "inspect-promote",
  "inspect-skills",
  "intake-capture",
  "intake-from-github",
  "intake-promote",
  "learning-promote",
  "req-define",
  "req-save",
  "spec-save",
];

// agentdev-prefixed references that are valid skills (not commands).
// /agentdev/learning-capture is a skill invocation, not a command definition file.
const VALID_SKILL_REFS = new Set([
  "learning-capture",
]);

const COMMAND_COUNT = EXPECTED_COMMANDS.length;

// Pipeline definitions
const REQ_CASE_PIPELINE = ["req-define", "req-save", "spec-save", "case-open", "case-run", "case-update", "case-close"];
const LEARNING_PIPELINE = ["learning-promote"];
const INTAKE_PIPELINE = ["intake-capture", "intake-from-github", "intake-promote"];

// Valid agent types
const VALID_AGENTS = new Set(["sisyphus", "prometheus", "oracle", "metis", "hephaestus", "momus"]);

// ─── REQ-0030-009: Normal-path E2E tests ───────────────────────────────────

describe("REQ-0030-009: E2E workflow tests for all commands", () => {
  // ─── Pipeline completeness ───────────────────────────────────────────────

  describe("Pipeline completeness: all commands exist", () => {
    it(`has exactly ${COMMAND_COUNT} command definition files`, () => {
      expect(commands.size).toBe(COMMAND_COUNT);
    });
    for (const cmd of EXPECTED_COMMANDS) {
      it(`command "${cmd}" exists as .md file`, () => {
        expect(commands.has(cmd)).toBe(true);
      });
    }
  });

  // ─── Per-command E2E validation ──────────────────────────────────────────

  for (const [cmdName, content] of commands) {
    describe(`E2E: ${cmdName}`, () => {
      const fm = parseFrontmatter(content);

      it("has Input section defining expected inputs", () => {
        const inputSection = extractSection(content, "入力");
        expect(inputSection.length).toBeGreaterThan(0);
      });

      it("has Output section defining expected outputs", () => {
        const outputSection = extractSection(content, "出力");
        expect(outputSection.length).toBeGreaterThan(0);
      });

      it("has Steps section with numbered or phased structure", () => {
        const hasSteps = /(^##\s+Steps)|(^###\s+Step\s+\d)|(^##\s+Step\s+\d)|(^###\s+Phase)|(^##\s+フェーズ)/m.test(content);
        expect(hasSteps).toBe(true);
      });

      it("has valid agent type in frontmatter", () => {
        expect(fm).not.toBeNull();
        if (fm) {
          const agent = fm["agent"] as string;
          expect(VALID_AGENTS.has(agent)).toBe(true);
        }
      });

      const templateRefs = extractTemplateRefs(content);
      for (const tmplRef of templateRefs) {
        it(`template reference "${tmplRef}" exists in templates directory`, () => {
          expect(templateFiles.has(tmplRef)).toBe(true);
        });
      }

      const cmdRefs = extractCommandRefs(content);
      for (const ref of cmdRefs) {
        if (ref === cmdName) continue;
        if (VALID_SKILL_REFS.has(ref)) continue;
        it(`command reference "/agentdev/${ref}" points to existing command`, () => {
          expect(EXPECTED_COMMANDS.includes(ref)).toBe(true);
        });
      }
    });
  }

  // ─── Pipeline continuity ─────────────────────────────────────────────────

  describe("Pipeline continuity: req/case pipeline", () => {
    it("req-define output matches req-save input expectations", () => {
      const reqDefine = commands.get("req-define");
      const reqSave = commands.get("req-save");
      expect(reqDefine).toBeDefined();
      expect(reqSave).toBeDefined();
      if (reqDefine && reqSave) {
        const reqDefineOutput = extractSection(reqDefine, "出力");
        const reqSaveInput = extractSection(reqSave, "入力");
        expect(reqDefineOutput).toContain(".agentdev/drafts");
        expect(reqSaveInput).toContain(".agentdev/drafts");
      }
    });

    it("req-save output matches case-open input expectations", () => {
      const reqSave = commands.get("req-save");
      const caseOpen = commands.get("case-open");
      expect(reqSave).toBeDefined();
      expect(caseOpen).toBeDefined();
      if (reqSave && caseOpen) {
        const reqSaveOutput = extractSection(reqSave, "出力");
        const caseOpenInput = extractSection(caseOpen, "入力");
        expect(reqSaveOutput).toContain("REQ");
        expect(caseOpenInput).toContain("req-define");
      }
    });

    it("case-open output matches case-run input expectations", () => {
      const caseOpen = commands.get("case-open");
      const caseRun = commands.get("case-run");
      expect(caseOpen).toBeDefined();
      expect(caseRun).toBeDefined();
      if (caseOpen && caseRun) {
        const caseOpenOutput = extractSection(caseOpen, "出力");
        const caseRunInput = extractSection(caseRun, "入力");
        expect(caseOpenOutput).toContain("Issue");
        expect(caseRunInput).toContain("Issue");
      }
    });

    it("case-run output matches case-close input expectations", () => {
      const caseRun = commands.get("case-run");
      const caseClose = commands.get("case-close");
      expect(caseRun).toBeDefined();
      expect(caseClose).toBeDefined();
      if (caseRun && caseClose) {
        const caseRunOutput = extractSection(caseRun, "出力");
        const caseCloseInput = extractSection(caseClose, "入力");
        expect(caseRunOutput).toContain("PR");
        expect(caseCloseInput).toContain("PR");
      }
    });
  });

  describe("Pipeline continuity: learning pipeline", () => {
    it("learning-promote references backlog-review for promotion route", () => {
      const promote = commands.get("learning-promote");
      expect(promote).toBeDefined();
      if (promote) {
        expect(promote).toContain("backlog-review");
      }
    });
  });

  describe("Pipeline continuity: intake pipeline", () => {
    it("intake-capture and intake-from-github produce compatible outputs", () => {
      const capture = commands.get("intake-capture");
      const fromGithub = commands.get("intake-from-github");
      expect(capture).toBeDefined();
      expect(fromGithub).toBeDefined();
      if (capture && fromGithub) {
        const captureOutput = extractSection(capture, "出力");
        const githubOutput = extractSection(fromGithub, "出力");
        expect(captureOutput).toContain("inbox");
        expect(githubOutput).toContain("inbox");
      }
    });

    it("intake-promote input matches intake-capture/intake-from-github output", () => {
      const promote = commands.get("intake-promote");
      expect(promote).toBeDefined();
      if (promote) {
        const promoteInput = extractSection(promote, "入力");
        expect(promoteInput).toContain("inbox");
      }
    });

    it("intake-promote output references backlog-review", () => {
      const promote = commands.get("intake-promote");
      expect(promote).toBeDefined();
      if (promote) {
        const promoteOutput = extractSection(promote, "出力");
        expect(promoteOutput).toContain("promoted");
      }
    });
  });

  // ─── Guardrail completeness ──────────────────────────────────────────────

  describe("Guardrail completeness for complex commands", () => {
    const commandsWithGuardrails = ["case-open", "case-run", "case-close"];
    for (const cmdName of commandsWithGuardrails) {
      it(`${cmdName} has Guardrails section`, () => {
        const content = commands.get(cmdName);
        expect(content).toBeDefined();
        if (content) {
          expect(content).toMatch(/## ガードレール/);
        }
      });
    }
  });

  // ─── Template skill coverage per command ─────────────────────────────────
  // case-open/close reference templates through `agentdev-workflow-templates` skill.
  // case-update uses its own templates under commands/agentdev/templates/case-update/.
  describe("Template skill coverage for issue/PR-creating commands", () => {
    it("case-open references agentdev-workflow-templates skill", () => {
      const content = commands.get("case-open");
      expect(content).toBeDefined();
      if (content) {
        expect(content).toMatch(/agentdev-workflow-templates/);
      }
    });

    it("case-close references agentdev-workflow-templates skill", () => {
      const content = commands.get("case-close");
      expect(content).toBeDefined();
      if (content) {
        expect(content).toMatch(/agentdev-workflow-templates/);
      }
    });

    it("case-update references its own template directory", () => {
      const content = commands.get("case-update");
      expect(content).toBeDefined();
      if (content) {
        expect(content).toMatch(/templates\/case-update\//);
      }
    });
  });

  // ─── Agent type consistency ──────────────────────────────────────────────

  describe("Agent type consistency per pipeline", () => {
    it("all agentdev commands use sisyphus agent", () => {
      for (const cmd of EXPECTED_COMMANDS) {
        const content = commands.get(cmd);
        expect(content).toBeDefined();
        if (content) {
          const fm = parseFrontmatter(content);
          expect(fm?.["agent"]).toBe("sisyphus");
        }
      }
    });
  });

  // ─── README.md consistency ───────────────────────────────────────────────

  describe("README.md command listing consistency", () => {
    it(`README.md lists all ${COMMAND_COUNT} commands`, () => {
      const readmePath = path.join(CMD_DIR, "README.md");
      expect(fs.existsSync(readmePath)).toBe(true);
      const readme = fs.readFileSync(readmePath, "utf-8");
      for (const cmd of EXPECTED_COMMANDS) {
        expect(readme).toContain(cmd);
      }
    });
  });
});

// ─── TS-008: 不存在 command 参照検出 ─────────────────────────────────────────
// docs-spec-rebuild-integrity SPEC 構文健全性検査。README listing と command 本文の
// 相互参照で存在しない command を指す参照を検出する。

describe("TS-008: 不存在 command 参照検出", () => {
  const validCommands = new Set(EXPECTED_COMMANDS);
  const skillRefs = new Set(VALID_SKILL_REFS);

  it("正例: 廃止済み command 参照は根拠ファイルと行を持つ検出事項として出力される", () => {
    const content = [
      "# sample",
      "",
      "See /agentdev/req-define for the requirement flow.",
      "Removed: /agentdev/retired-old-command is gone.",
      "See /agentdev/case-open next.",
      "",
    ].join("\n");
    const findings = detectNonExistentCommandRefs(content, validCommands, {
      skillRefAllowList: skillRefs,
    });
    expect(findings.length).toBe(1);
    expect(findings[0]?.ref).toBe("retired-old-command");
    expect(findings[0]?.line).toBe(4);
    expect(findings[0]?.snippet).toContain("retired-old-command");
  });

  it("負例: 実在する command 参照と skill 参照は検出事項にならない", () => {
    const content = [
      "# sample",
      "",
      "See /agentdev/req-define and /agentdev/case-open.",
      "Skill invocation: /agentdev/learning-capture.",
      "",
    ].join("\n");
    const findings = detectNonExistentCommandRefs(content, validCommands, {
      skillRefAllowList: skillRefs,
    });
    expect(findings.length).toBe(0);
  });

  it("負例: 自己参照とパス参照は検出対象外", () => {
    const content = [
      "# sample",
      "",
      "本コマンド自身: /agentdev/req-define",
      "パス参照: /agentdev/templates/case-open/open-issue.md",
      "",
    ].join("\n");
    const findings = detectNonExistentCommandRefs(content, validCommands, {
      sourceLabel: "req-define",
      skillRefAllowList: skillRefs,
    });
    expect(findings.length).toBe(0);
  });

  it("実配布物: README listing と全 command 定義に不存在 command 参照は存在しない", () => {
    const readmePath = path.join(CMD_DIR, "README.md");
    if (!fs.existsSync(readmePath)) return;
    const readme = fs.readFileSync(readmePath, "utf-8");
    const readmeFindings = detectNonExistentCommandRefs(readme, validCommands, {
      skillRefAllowList: skillRefs,
    });
    expect(readmeFindings).toEqual([]);

    for (const [cmdName, content] of commands) {
      const findings = detectNonExistentCommandRefs(content, validCommands, {
        sourceLabel: cmdName,
        skillRefAllowList: skillRefs,
      });
      expect(findings).toEqual([]);
    }
  });
});

// ─── TS-009: エンコーディング不整合検出 ───────────────────────────────────────
// docs-spec-rebuild-integrity SPEC 構文健全性検査。UTF-8 BOM 付きファイルと単一
// ファイル内の CRLF/LF 混在を検出する。

describe("TS-009: エンコーディング不整合検出", () => {
  const encoder = new TextEncoder();

  it("正例: UTF-8 BOM 付きファイルは検出事項になる", () => {
    const bom = Uint8Array.of(0xef, 0xbb, 0xbf);
    const body = encoder.encode("# title\nline2\n");
    const bytes = new Uint8Array([...bom, ...body]);
    const findings = detectEncodingInconsistencies(bytes, "fixture/bom.md");
    expect(findings.length).toBe(1);
    expect(findings[0]?.category).toBe("utf8-bom");
    expect(findings[0]?.line).toBe(1);
  });

  it("正例: 単一ファイル内 CRLF/LF 混在は検出事項になる", () => {
    const bytes = encoder.encode("line1\r\nline2\nline3\r\n");
    const findings = detectEncodingInconsistencies(bytes, "fixture/mixed.md");
    const categories = findings.map((f) => f.category);
    expect(categories).toContain("crlf-lf-mixed");
    const mixed = findings.find((f) => f.category === "crlf-lf-mixed");
    expect(mixed?.line).toBeGreaterThan(0);
  });

  it("負例: BOM なし UTF-8 かつ LF 単一は検出対象外", () => {
    const bytes = encoder.encode("# title\nline2\nline3\n");
    const findings = detectEncodingInconsistencies(bytes, "fixture/clean-lf.md");
    expect(findings.length).toBe(0);
  });

  it("負例: BOM なし UTF-8 かつ CRLF 単一は検出対象外", () => {
    const bytes = encoder.encode("# title\r\nline2\r\nline3\r\n");
    const findings = detectEncodingInconsistencies(bytes, "fixture/clean-crlf.md");
    expect(findings.length).toBe(0);
  });

  it("実配布物: src/opencode 配下の Markdown に BOM と CRLF/LF 混在は存在しない", () => {
    const srcRoot = path.join(REPO_ROOT, "src", "opencode");
    if (!fs.existsSync(srcRoot)) return;
    const mdFiles = collectMarkdownFiles(srcRoot);
    const findings: EncodingFinding[] = [];
    for (const file of mdFiles) {
      const raw = fs.readFileSync(file);
      const bytes = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
      findings.push(...detectEncodingInconsistencies(bytes, file));
    }
    expect(findings).toEqual([]);
  });
});

function collectMarkdownFiles(dir: string): string[] {
  const result: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      result.push(...collectMarkdownFiles(full));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      result.push(full);
    }
  }
  return result;
}
