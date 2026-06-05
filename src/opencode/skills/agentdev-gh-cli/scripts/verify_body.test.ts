import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const SCRIPT_PATH = join(import.meta.dir, "verify_body.ts");
const TEMP_DIR = join("C:", "WINDOWS", "TEMP", "opencode", `verify-body-test-${Date.now()}`);

const VALID_BODY = [
  "# テスト仕様書",
  "",
  "## 概要",
  "",
  "<!-- 【必須】 -->",
  "",
  "これは日本語テキストを含むテスト文書です。",
  "",
  "## チェックリスト",
  "",
  "<!-- 【必須】 -->",
  "",
  "- [x] 項目1",
  "- [ ] 項目2",
  "  - [x] サブ項目1",
  "  - [ ] サブ項目2",
  "",
  "## テーブル",
  "",
  "| 列1 | 列2 | 列3 |",
  "|-----|-----|-----|",
  "| 値1 | 値2 | 値3 |",
  "| A | B | C |",
  "",
  "## コード",
  "",
  "```typescript",
  "const x = 1;",
  "```",
  "",
  "## その他",
  "",
  "追加の情報。",
].join("\n");

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface CheckResultJson {
  category: string;
  check: string;
  level: string;
  message: string;
}

interface ReportJson {
  script: string;
  summary: { ok: number; ng: number; warning: number; info: number };
  results: CheckResultJson[];
}

function runScript(args: string[]): RunResult {
  const result = Bun.spawnSync(["bun", "run", SCRIPT_PATH, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    exitCode: result.exitCode ?? 1,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

beforeAll(() => {
  mkdirSync(TEMP_DIR, { recursive: true });

  writeFileSync(join(TEMP_DIR, "expected.md"), VALID_BODY, "utf-8");
  writeFileSync(join(TEMP_DIR, "actual.md"), VALID_BODY, "utf-8");
  writeFileSync(join(TEMP_DIR, "actual_crlf.md"), VALID_BODY.replace(/\n/g, "\r\n"), "utf-8");
  writeFileSync(
    join(TEMP_DIR, "actual_broken_table.md"),
    VALID_BODY.replace("| A | B | C |", "| A | B |"),
    "utf-8",
  );
  writeFileSync(
    join(TEMP_DIR, "actual_missing_sections.md"),
    VALID_BODY.replace("## 概要", "## Summary").replace("## チェックリスト", "## Tasks"),
    "utf-8",
  );
  writeFileSync(join(TEMP_DIR, "actual_control_chars.md"), VALID_BODY + "\n\x01\x02\x03", "utf-8");

  const bomPrefix = Buffer.from([0xef, 0xbb, 0xbf]);
  const bomContent = Buffer.concat([bomPrefix, Buffer.from(VALID_BODY, "utf-8")]);
  writeFileSync(join(TEMP_DIR, "actual_bom.md"), bomContent);

  // Link normalization fixtures
  writeFileSync(
    join(TEMP_DIR, "actual_relative_link.md"),
    VALID_BODY + "\n\n## References\n\n- [REQ-0031](docs/requirements/REQ-0031.md)\n- [ADR-0001](../docs/adr/ADR-0001.md)\n",
    "utf-8",
  );
  writeFileSync(
    join(TEMP_DIR, "actual_github_url.md"),
    VALID_BODY + "\n\n## References\n\n- [REQ-0031](https://github.com/yogata/agent-dev-flow/blob/main/docs/requirements/REQ-0031.md)\n",
    "utf-8",
  );
  writeFileSync(
    join(TEMP_DIR, "actual_code_block_link.md"),
    VALID_BODY + "\n\n```\n- [REQ-0031](docs/requirements/REQ-0031.md)\n```\n",
    "utf-8",
  );
});

afterAll(() => {
  rmSync(TEMP_DIR, { recursive: true, force: true });
});

describe("verify_body.ts", () => {
  it("--help: exits 0 and shows help text", () => {
    const result = runScript(["--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("verify_body.ts");
    expect(result.stdout).toContain("USAGE:");
    expect(result.stdout).toContain("--expected");
    expect(result.stdout).toContain("--actual");
  });

  it("--dry-run: exits 0 and shows what would be checked", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual.md"),
      "--dry-run",
    ]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Would verify");
    expect(result.stdout).toContain("Encoding");
    expect(result.stdout).toContain("Markdown");
  });

  it("--json with matching files: exit 0, valid JSON with no NG", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual.md"),
      "--json",
    ]);
    expect(result.exitCode).toBe(0);
    const parsed: ReportJson = JSON.parse(result.stdout);
    expect(parsed.script).toBe("verify_body.ts");
    expect(parsed.summary.ok).toBeGreaterThan(0);
    expect(parsed.summary.ng).toBe(0);
  });

  it("CRLF detection: exit 1, NG result for encoding", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual_crlf.md"),
      "--json",
    ]);
    expect(result.exitCode).toBe(1);
    const parsed: ReportJson = JSON.parse(result.stdout);
    const hasCrlfNg = parsed.results.some(
      (r) => r.category === "Encoding" && r.check === "UTF-8 / LF" && r.level === "ng" && r.message.includes("CRLF"),
    );
    expect(hasCrlfNg).toBe(true);
  });

  it("Broken table: exit 1, NG for table structure", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual_broken_table.md"),
      "--json",
    ]);
    expect(result.exitCode).toBe(1);
    const parsed: ReportJson = JSON.parse(result.stdout);
    const hasTableNg = parsed.results.some(
      (r) => r.category === "Markdown" && r.check === "Table column consistency" && r.level === "ng",
    );
    expect(hasTableNg).toBe(true);
  });

  it("Missing required sections: exit 1, NG for required sections", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual_missing_sections.md"),
      "--json",
    ]);
    expect(result.exitCode).toBe(1);
    const parsed: ReportJson = JSON.parse(result.stdout);
    const hasSectionNg = parsed.results.some(
      (r) => r.category === "RequiredSections" && r.level === "ng",
    );
    expect(hasSectionNg).toBe(true);
  });

  it("Control characters: exit 1, NG for control chars", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual_control_chars.md"),
      "--json",
    ]);
    expect(result.exitCode).toBe(1);
    const parsed: ReportJson = JSON.parse(result.stdout);
    const hasControlNg = parsed.results.some(
      (r) => r.category === "Encoding" && r.check === "Control characters" && r.level === "ng",
    );
    expect(hasControlNg).toBe(true);
  });

  it("BOM detection: exit 1, NG when actual file has BOM", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual_bom.md"),
      "--json",
    ]);
    expect(result.exitCode).toBe(1);
    const parsed: ReportJson = JSON.parse(result.stdout);
    const hasBomNg = parsed.results.some(
      (r) => r.category === "Encoding" && r.check === "UTF-8 / LF" && r.level === "ng" && r.message.includes("BOM"),
    );
    expect(hasBomNg).toBe(true);
  });

  it("No BOM: existing actual.md passes BOM check", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual.md"),
      "--json",
    ]);
    expect(result.exitCode).toBe(0);
    const parsed: ReportJson = JSON.parse(result.stdout);
    const hasBomOk = parsed.results.some(
      (r) => r.category === "Encoding" && r.check === "UTF-8 / LF" && r.level === "ok" && r.message.includes("No BOM"),
    );
    expect(hasBomOk).toBe(true);
  });

  it("Relative path link: exit 1, NG for LinkNormalization", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual_relative_link.md"),
      "--json",
    ]);
    expect(result.exitCode).toBe(1);
    const parsed: ReportJson = JSON.parse(result.stdout);
    const hasLinkNg = parsed.results.some(
      (r) => r.category === "LinkNormalization" && r.level === "ng",
    );
    expect(hasLinkNg).toBe(true);
  });

  it("GitHub URL: exit 0, no NG for LinkNormalization", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual_github_url.md"),
      "--json",
    ]);
    const parsed: ReportJson = JSON.parse(result.stdout);
    const hasLinkNg = parsed.results.some(
      (r) => r.category === "LinkNormalization" && r.level === "ng",
    );
    expect(hasLinkNg).toBe(false);
  });

  it("Code block path excluded: exit 0", () => {
    const result = runScript([
      "--expected", join(TEMP_DIR, "expected.md"),
      "--actual", join(TEMP_DIR, "actual_code_block_link.md"),
      "--json",
    ]);
    const parsed: ReportJson = JSON.parse(result.stdout);
    const hasLinkNg = parsed.results.some(
      (r) => r.category === "LinkNormalization" && r.level === "ng",
    );
    expect(hasLinkNg).toBe(false);
  });
});
