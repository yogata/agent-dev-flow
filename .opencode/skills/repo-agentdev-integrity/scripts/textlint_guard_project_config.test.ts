// ADF-COVERS(verification): REQ-053-029, REQ-053-030, REQ-053-004
// agentdev-textlint-guard の ADR 本体 project-local 設定と特例分岐禁止の
// repo レベル契約テスト（Issue #2725 TS-007）。
// - ADR 本体（agent-dev-flow リポジトリ）の追加対象設定が
//   .agentdev/config/plugins/agentdev-textlint-guard.yaml に存在し、
//   Plugin の実際の設定 loader で解釈して src/opencode/commands/**/*.md と
//   src/opencode/skills/**/*.md の加算だけを生成すること（AG-007）
// - 追加対象設定が .agentdev/extensions/**（Skill Project Extensions）に
//   存在しないこと（deterministic runtime Plugin の対象パス設定に使用しない）
// - Plugin source にリポジトリ名による特別分岐が存在しないこと
import { describe, it, expect } from "bun:test";
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
const PLUGIN_DIR = path.join(REPO_ROOT, "src", "opencode", "plugins", "agentdev-textlint-guard");

function walkFiles(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (dir === undefined) break;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true }) as fs.Dirent[];
    } catch {
      continue;
    }
    for (const ent of entries) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (ent.isFile()) out.push(p);
    }
  }
  return out;
}

describe("agentdev-textlint-guard ADR 本体設定（TS-007）", () => {
  it("Plugin の実際の設定 loader で ADR 本体設定が解釈され、追加対象は commands / skills のみ", async () => {
    const configModule = await import(path.join(PLUGIN_DIR, "lib", "config.ts"));
    configModule.invalidateConfigCache();
    const result = configModule.loadGuardConfig(REPO_ROOT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.present).toBe(true);
    expect(result.config.additionalTargets).toEqual([
      "src/opencode/commands/**/*.md",
      "src/opencode/skills/**/*.md",
    ]);
  });

  it("追加対象の実在ファイルが対象解決で列挙される（同一 Plugin が扱う）", async () => {
    const configModule = await import(path.join(PLUGIN_DIR, "lib", "config.ts"));
    configModule.invalidateConfigCache();
    const configResult = configModule.loadGuardConfig(REPO_ROOT);
    expect(configResult.ok).toBe(true);
    if (!configResult.ok) return;
    const targetsModule = await import(path.join(PLUGIN_DIR, "lib", "targets.ts"));
    const targets = targetsModule.enumerateTargetFiles(REPO_ROOT, configResult.config);
    expect(targets.some((rel) => rel.replaceAll("\\", "/").startsWith("src/opencode/commands/"))).toBe(true);
    expect(targets.some((rel) => rel.replaceAll("\\", "/").startsWith("src/opencode/skills/"))).toBe(true);
    expect(targets.some((rel) => rel.replaceAll("\\", "/").startsWith("docs/"))).toBe(true);
  });

  it("対象パス設定は .agentdev/extensions/** に存在しない", () => {
    const extensionsDir = path.join(REPO_ROOT, ".agentdev", "extensions");
    expect(fs.existsSync(extensionsDir)).toBe(true);
    for (const file of walkFiles(extensionsDir)) {
      const text = fs.readFileSync(file, "utf8");
      expect(text.includes("agentdev-textlint-guard")).toBe(false);
      expect(text.includes("additional_targets")).toBe(false);
    }
  });

  it("Plugin source にリポジトリ名による特別分岐が存在しない", () => {
    for (const file of walkFiles(PLUGIN_DIR)) {
      const rel = path.relative(PLUGIN_DIR, file).replaceAll("\\", "/");
      if (!rel.endsWith(".ts") || rel.startsWith("tests/") || rel.startsWith("node_modules/")) continue;
      const text = fs.readFileSync(file, "utf8");
      expect(text.includes("agent-dev-flow")).toBe(false);
      expect(/isAdfRepository|adfRepo|repositoryName/.test(text)).toBe(false);
    }
  });
});
