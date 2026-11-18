// scripts/rules/ir-075.test.ts — IR-075（ir-file-size）の正常系・異常系検証。
// TS-011（REQ-122-011）の検証方法に従い、実 CLI（cli.ts --rule IR-075）を
// 一時 fixture root 上で実行して検出・除外・非違反・メッセージ内容を確認する。

import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseParsedFile } from "../../engine/context.ts";
import type { IntegrityContext, ParsedFile } from "../../engine/types.ts";
import { countFileLines, ir075, isReferencesExempt } from "../../rules/ir-075.ts";

const cli = resolve(import.meta.dir, "../cli.ts");

class MemoryContext implements IntegrityContext {
  #byPath: Map<string, ParsedFile>;
  #raw: Map<string, string>;

  constructor(files: Record<string, string>) {
    this.#byPath = new Map(
      Object.entries(files).map(([p, content]) => [p, parseParsedFile(p, content)]),
    );
    this.#raw = new Map(Object.entries(files));
  }

  readonly repoRoot = "(memory)";
  readonly changedFiles: readonly string[] = [];

  get files(): readonly ParsedFile[] {
    return [...this.#byPath.values()];
  }

  readFile(relPath: string): ParsedFile | null {
    return this.#byPath.get(relPath.replace(/\\/g, "/")) ?? null;
  }

  pathExists(relPath: string): boolean {
    return this.readRaw(relPath) !== null;
  }

  readRaw(relPath: string): string | null {
    return this.#raw.get(relPath.replace(/\\/g, "/")) ?? null;
  }

  getFilesByGlob(pattern: string): ParsedFile[] {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    let out = "";
    for (let i = 0; i < escaped.length; i++) {
      const ch = escaped[i]!;
      if (ch === "*" && escaped[i + 1] === "*") {
        if (escaped[i + 2] === "/") {
          out += "(?:.*/)?";
          i += 2;
        } else {
          out += ".*";
          i += 1;
        }
        continue;
      }
      if (ch === "*") {
        out += "[^/]*";
        continue;
      }
      if (ch === "?") {
        out += "[^/]";
        continue;
      }
      out += ch;
    }
    const re = new RegExp(`^${out}$`);
    return this.files.filter((f) => re.test(f.path));
  }

  listDir(): string[] {
    return [];
  }
}

function markdownWithLines(lineCount: number): string {
  const lines = [
    "---",
    'title: "fixture"',
    "---",
    "",
  ];
  for (let i = lines.length; i < lineCount; i++) {
    lines.push(`line ${i}`);
  }
  return lines.join("\n") + "\n";
}

describe("countFileLines", () => {
  test("末尾改行あり 249 行は 249", () => {
    expect(countFileLines(markdownWithLines(249))).toBe(249);
  });

  test("末尾改行なしの最終行も 1 行として数える", () => {
    expect(countFileLines(markdownWithLines(250).trimEnd())).toBe(250);
  });
});

describe("isReferencesExempt", () => {
  test("references/ 配下の Markdown は免除", () => {
    expect(isReferencesExempt("src/common/skills/agentdev-x/references/flow.md")).toBe(true);
  });

  test("SKILL.md 本体と command 本文は免除でない", () => {
    expect(isReferencesExempt("src/common/skills/agentdev-x/SKILL.md")).toBe(false);
    expect(isReferencesExempt("src/common/commands/agentdev/req-define.md")).toBe(false);
  });
});

describe("ir075.check（インメモリ）", () => {
  test("251 行（Frontmatter 込み）をエラーで検出し、メッセージに行数とバイト数を出力する", () => {
    const files = {
      "src/common/skills/agentdev-x/SKILL.md": markdownWithLines(251),
    };
    const violations = ir075.check(new MemoryContext(files));
    expect(violations).toHaveLength(1);
    const v = violations[0]!;
    expect(v.ruleId).toBe("IR-075");
    expect(v.severity).toBe("error");
    expect(v.filePath).toBe("src/common/skills/agentdev-x/SKILL.md");
    expect(v.message).toContain("lines: 251");
    expect(v.message).toContain("bytes:");
    expect(v.message).toContain(String(Buffer.byteLength(files["src/common/skills/agentdev-x/SKILL.md"]!, "utf-8")));
  });

  test("references/ 配下の 500 行超過ファイルは検出しない", () => {
    const files = {
      "src/common/skills/agentdev-x/references/flow.md": markdownWithLines(500),
    };
    expect(ir075.check(new MemoryContext(files))).toHaveLength(0);
  });

  test("249 行は非違反", () => {
    const files = {
      "src/common/commands/agentdev/req-define.md": markdownWithLines(249),
    };
    expect(ir075.check(new MemoryContext(files))).toHaveLength(0);
  });

  test("バイト数のみの超過は非違反（250 行以内・マルチバイトでバイト数大）", () => {
    const longLine = "あ".repeat(200);
    const lines = ["---", 'title: "fixture"', "---", ""];
    for (let i = lines.length; i < 250; i++) lines.push(longLine);
    const content = lines.join("\n") + "\n";
    expect(Buffer.byteLength(content, "utf-8")).toBeGreaterThan(
      Buffer.byteLength(markdownWithLines(251), "utf-8"),
    );
    const files = {
      "src/common/commands/agentdev/heavy-bytes.md": content,
    };
    expect(ir075.check(new MemoryContext(files))).toHaveLength(0);
  });

  test("対象パス外（docs 側 Design）は検出対象にしない", () => {
    const files = {
      "docs/designs/commands/req-define.md": markdownWithLines(700),
    };
    expect(ir075.check(new MemoryContext(files))).toHaveLength(0);
  });

  test("同一ファイルが複数 glob にマッチしても重複検出しない", () => {
    const files = {
      "src/common/commands/agentdev/oversize.md": markdownWithLines(252),
    };
    expect(ir075.check(new MemoryContext(files))).toHaveLength(1);
  });
});

function writeFixture(root: string, relPath: string, content: string): void {
  const abs = join(root, relPath);
  mkdirSync(join(abs, ".."), { recursive: true });
  writeFileSync(abs, content, "utf-8");
}

function runCliRule(root: string): { status: number; stdout: string } {
  const result = spawnSync(process.execPath, [cli, "--root", root, "--rule", "IR-075", "--json"], {
    encoding: "utf8",
  });
  return { status: result.status ?? -1, stdout: result.stdout };
}

function inFixtureRoot(run: (root: string) => void): void {
  const temp = resolve(".agentdev/tmp");
  mkdirSync(temp, { recursive: true });
  const root = mkdtempSync(join(temp, "ir-075-"));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("実 CLI による IR-075 検証（TS-011 検証方法）", () => {
  test("対象パス配置の 251 行 fixture で違反検出（Exit 1・行数とバイト数をメッセージ出力）", () => {
    inFixtureRoot((root) => {
      writeFixture(root, "src/common/commands/agentdev/ir-075-oversize.md", markdownWithLines(251));
      const { status, stdout } = runCliRule(root);
      expect(status).toBe(1);
      const parsed = JSON.parse(stdout) as {
        results: { ruleId: string; violations: { message: string }[] }[];
      };
      const result = parsed.results.find((r) => r.ruleId === "IR-075");
      expect(result).toBeDefined();
      expect(result!.violations).toHaveLength(1);
      expect(result!.violations[0]!.message).toContain("lines: 251");
      expect(result!.violations[0]!.message).toContain("bytes:");
    });
  });

  test("references/ 配下の同一 251 行 fixture は非違反（Exit 0）", () => {
    inFixtureRoot((root) => {
      writeFixture(
        root,
        "src/common/skills/agentdev-ir075-fixture/references/oversize.md",
        markdownWithLines(251),
      );
      expect(runCliRule(root).status).toBe(0);
    });
  });

  test("249 行 fixture は非違反（Exit 0）", () => {
    inFixtureRoot((root) => {
      writeFixture(root, "src/common/commands/agentdev/ir-075-ok.md", markdownWithLines(249));
      expect(runCliRule(root).status).toBe(0);
    });
  });

  test("バイト数のみ超過の 250 行 fixture は非違反（Exit 0）", () => {
    inFixtureRoot((root) => {
      const longLine = "あ".repeat(300);
      const lines = ["---", 'title: "fixture"', "---", ""];
      for (let i = lines.length; i < 250; i++) lines.push(longLine);
      const content = lines.join("\n") + "\n";
      expect(Buffer.byteLength(content, "utf-8")).toBeGreaterThan(
        Buffer.byteLength(markdownWithLines(251), "utf-8"),
      );
      writeFixture(root, "src/common/commands/agentdev/ir-075-heavy-bytes.md", content);
      expect(runCliRule(root).status).toBe(0);
    });
  });
});
