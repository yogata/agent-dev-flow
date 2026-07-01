/**
 * Project Read Contract integrity checker (IR-056).
 *
 * Validates project read contract mechanism per ADR-0133, REQ-0157,
 * docs/specs/foundations/project-read-contracts.md.
 *
 * 9 check items:
 *   1. .agentdev/config.yaml existence and schema
 *   2. roots paths existence
 *   3. read_contracts.commands and read_contracts.skills directories existence
 *   4. command read contract existence for each public command
 *   5. each read contract schema
 *   6. each read contract paths existence
 *   7. paths discoverability from docs/DOC-MAP.md or docs (any README)
 *   8. no direct docs/specs/{domain}/** refs in src/opencode/commands/agentdev/
 *   9. no direct docs/specs/{domain}/** refs in src/opencode/skills/agentdev-/
 *
 * exemptions:
 *   - SPEC path example (<existing-spec>.md etc., template notation)
 *   - glob pattern docs/specs/** in procedure text
 *   - .agentdev/read-contracts/** refs are legitimate
 */

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

export interface CheckFailure {
  check: number;
  check_name: string;
  severity: "strict" | "warning";
  file?: string;
  message: string;
}

export interface CheckReport {
  ok: boolean;
  failures: CheckFailure[];
  stats: {
    public_commands: number;
    command_read_contracts: number;
    skill_read_contracts: number;
    direct_refs_in_commands: number;
    direct_refs_in_skills: number;
  };
}

const PUBLIC_COMMAND_DIR = "src/opencode/commands/agentdev";
const SKILLS_DIR = "src/opencode/skills";
const CONFIG_PATH = ".agentdev/config.yaml";
const DEFAULT_READ_CONTRACTS_COMMANDS_DIR = ".agentdev/read-contracts/commands";
const DEFAULT_READ_CONTRACTS_SKILLS_DIR = ".agentdev/read-contracts/skills";
const DOC_MAP_PATH = "docs/DOC-MAP.md";
const DOCS_README_PATH = "docs/README.md";
const SPECS_README_PATH = "docs/specs/README.md";

// Migration-target pattern: docs/specs/(foundations|...)/...
const DIRECT_REF_PATTERN =
  /docs\/specs\/(foundations|responsibilities|quality|integrity|local|authoring|commands|skills|workflows)\//g;

const EXEMPTION_HINTS = [
  "<existing-spec>",
  "docs/specs/**",
  "docs/specs/<",
];

function fileExists(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function dirExists(p: string): boolean {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function readText(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf-8") as string;
  } catch {
    return null;
  }
}

function listMarkdownFiles(dirPath: string, recursive: boolean): string[] {
  const result: string[] = [];
  if (!dirExists(dirPath)) return result;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }) as any[];
  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory() && recursive) {
      result.push(...listMarkdownFiles(full, true));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      result.push(full.replace(/\\/g, "/"));
    }
  }
  return result;
}

function listYamlFiles(dirPath: string): string[] {
  const result: string[] = [];
  if (!dirExists(dirPath)) return result;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }) as any[];
  for (const ent of entries) {
    if (ent.isFile() && (ent.name.endsWith(".yaml") || ent.name.endsWith(".yml"))) {
      result.push(path.join(dirPath, ent.name).replace(/\\/g, "/"));
    }
  }
  return result;
}

/**
 * Minimal YAML parser for our config.yaml and read-contract files.
 * Supports: key: value, nested via indent, list via "- ", inline arrays [a, b].
 */
function parseSimpleYaml(text: string): any {
  const lines = text.split(/\r?\n/);
  const root: any = {};
  const stack: { indent: number; node: any }[] = [{ indent: -1, node: root }];

  function currentParent(indent: number): any {
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    return stack[stack.length - 1].node;
  }

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;
    if (rawLine.trim().startsWith("#")) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();

    if (line.startsWith("- ")) {
      const parent = currentParent(indent);
      const key = parent.__pending_list_key;
      if (key) {
        if (!Array.isArray(parent[key])) parent[key] = [];
        const value = line.slice(2).trim().replace(/^["']|["']$/g, "");
        parent[key].push(value);
      }
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().replace(/^["']|["']$/g, "");
    const rawValue = line.slice(colonIdx + 1).trim();

    const parent = currentParent(indent);
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (rawValue === "") {
      parent[key] = {};
      stack.push({ indent, node: parent[key] });
      parent.__pending_list_key = key;
    } else if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      const items = rawValue
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter((s) => s.length > 0);
      parent[key] = items;
    } else {
      parent[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
  return root;
}

function collectReadContractPaths(contract: any): string[] {
  const paths: string[] = [];
  const keys = ["must_read", "allowed_discovery", "forbidden", "read_completion"];
  for (const k of keys) {
    if (Array.isArray(contract[k])) {
      paths.push(...contract[k]);
    }
  }
  if (contract.conditional_read && typeof contract.conditional_read === "object") {
    for (const cond of Object.keys(contract.conditional_read)) {
      const v = contract.conditional_read[cond];
      if (Array.isArray(v)) paths.push(...v);
    }
  }
  return paths;
}

function isExemptLine(line: string): boolean {
  for (const hint of EXEMPTION_HINTS) {
    if (line.includes(hint)) return true;
  }
  return false;
}

export function checkReadContracts(repoRoot: string): CheckReport {
  const failures: CheckFailure[] = [];
  const origCwd = process.cwd();
  process.chdir(repoRoot);
  try {
    const stats = {
      public_commands: 0,
      command_read_contracts: 0,
      skill_read_contracts: 0,
      direct_refs_in_commands: 0,
      direct_refs_in_skills: 0,
    };

    // Check 1: config.yaml existence and schema
    const configText = readText(CONFIG_PATH);
    if (!configText) {
      failures.push({
        check: 1,
        check_name: "config-existence-schema",
        severity: "strict",
        file: CONFIG_PATH,
        message: ".agentdev/config.yaml not found",
      });
    } else {
      const config = parseSimpleYaml(configText);
      const requiredTopKeys = ["version", "kind", "roots", "read_contracts"];
      for (const k of requiredTopKeys) {
        if (!(k in config)) {
          failures.push({
            check: 1,
            check_name: "config-existence-schema",
            severity: "strict",
            file: CONFIG_PATH,
            message: `.agentdev/config.yaml missing required key '${k}'`,
          });
        }
      }
      if (config.read_contracts) {
        for (const k of ["commands", "skills"]) {
          if (!(k in config.read_contracts)) {
            failures.push({
              check: 1,
              check_name: "config-existence-schema",
              severity: "strict",
              file: CONFIG_PATH,
              message: `.agentdev/config.yaml read_contracts missing key '${k}'`,
            });
          }
        }
      }

      // Check 2: roots paths existence
      if (config.roots && typeof config.roots === "object") {
        for (const [k, v] of Object.entries(config.roots)) {
          const p = String(v);
          if (!fileExists(p) && !dirExists(p)) {
            failures.push({
              check: 2,
              check_name: "roots-paths-existence",
              severity: "strict",
              file: p,
              message: `roots.${k} path '${p}' does not exist`,
            });
          }
        }
      }

      // Check 3: read_contracts dirs existence
      const commandsDir =
        config.read_contracts && config.read_contracts.commands
          ? config.read_contracts.commands
          : DEFAULT_READ_CONTRACTS_COMMANDS_DIR;
      const skillsDir =
        config.read_contracts && config.read_contracts.skills
          ? config.read_contracts.skills
          : DEFAULT_READ_CONTRACTS_SKILLS_DIR;
      if (!dirExists(commandsDir)) {
        failures.push({
          check: 3,
          check_name: "read-contracts-dirs-existence",
          severity: "strict",
          file: commandsDir,
          message: `read_contracts.commands directory '${commandsDir}' does not exist`,
        });
      }
      if (!dirExists(skillsDir)) {
        failures.push({
          check: 3,
          check_name: "read-contracts-dirs-existence",
          severity: "strict",
          file: skillsDir,
          message: `read_contracts.skills directory '${skillsDir}' does not exist`,
        });
      }

      // Check 4: each public command has a command read contract
      const commandFiles = listMarkdownFiles(PUBLIC_COMMAND_DIR, false).filter((f) => {
        const base = path.basename(f);
        return base !== "README.md";
      });
      stats.public_commands = commandFiles.length;
      for (const cf of commandFiles) {
        const base = path.basename(cf, ".md");
        const rc = path.join(commandsDir, base + ".yaml").replace(/\\/g, "/");
        if (!fileExists(rc)) {
          failures.push({
            check: 4,
            check_name: "command-read-contract-existence",
            severity: "warning",
            file: rc,
            message: `command read contract for public command '${base}' does not exist`,
          });
        }
      }

      // Check 5, 6, 7: each read contract schema, paths existence, discoverability
      const commandReadContracts = listYamlFiles(commandsDir);
      const skillReadContracts = listYamlFiles(skillsDir);
      stats.command_read_contracts = commandReadContracts.length;
      stats.skill_read_contracts = skillReadContracts.length;
      const allContracts = [...commandReadContracts, ...skillReadContracts];
      const docMapText = readText(DOC_MAP_PATH);
      const docsReadmeText = readText(DOCS_README_PATH);
      const specsReadmeText = readText(SPECS_README_PATH);
      for (const rc of allContracts) {
        const rcText = readText(rc);
        if (!rcText) continue;
        const parsed = parseSimpleYaml(rcText);
        const isCommandRc = rc.replace(/\\/g, "/").includes("/commands/");
        if (isCommandRc && !parsed.command) {
          failures.push({
            check: 5,
            check_name: "read-contract-schema",
            severity: "strict",
            file: rc,
            message: `command read contract missing 'command:' key`,
          });
        }
        if (!isCommandRc && !parsed.skill) {
          failures.push({
            check: 5,
            check_name: "read-contract-schema",
            severity: "strict",
            file: rc,
            message: `skill read contract missing 'skill:' key`,
          });
        }
        const pathsList = collectReadContractPaths(parsed);
        for (const p of pathsList) {
          if (!fileExists(p) && !dirExists(p)) {
            failures.push({
              check: 6,
              check_name: "read-contract-paths-existence",
              severity: "strict",
              file: p,
              message: `read contract '${rc}' path '${p}' does not exist`,
            });
          }
        }
        for (const p of pathsList) {
          if (p.startsWith("docs/")) {
            const baseName = path.basename(p);
            const found =
              (docMapText && (docMapText.includes(p) || docMapText.includes(baseName))) ||
              (docsReadmeText && (docsReadmeText.includes(p) || docsReadmeText.includes(baseName))) ||
              (specsReadmeText && (specsReadmeText.includes(p) || specsReadmeText.includes(baseName)));
            if (!found) {
              failures.push({
                check: 7,
                check_name: "read-contract-paths-discoverability",
                severity: "warning",
                file: p,
                message: `read contract path '${p}' not discoverable from DOC-MAP or docs/**/README.md (warning)`,
              });
            }
          }
        }
      }
    }

    // Check 8: direct refs in commands
    const commandMds = listMarkdownFiles(PUBLIC_COMMAND_DIR, true);
    for (const cf of commandMds) {
      const text = readText(cf);
      if (!text) continue;
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matches = line.match(DIRECT_REF_PATTERN);
        if (matches && !isExemptLine(line)) {
          stats.direct_refs_in_commands += matches.length;
          failures.push({
            check: 8,
            check_name: "direct-refs-in-commands",
            severity: "strict",
            file: cf,
            message: `direct docs/specs/** ref at line ${i + 1}: ${line.trim().substring(0, 200)}`,
          });
        }
      }
    }

    // Check 9: direct refs in skills
    if (dirExists(SKILLS_DIR)) {
      const skillDirs = (fs.readdirSync(SKILLS_DIR, { withFileTypes: true }) as any[])
        .filter((d) => d.isDirectory() && d.name.startsWith("agentdev-"))
        .map((d) => path.join(SKILLS_DIR, d.name).replace(/\\/g, "/"));
      for (const sd of skillDirs) {
        const skillMds = listMarkdownFiles(sd, true);
        for (const sf of skillMds) {
          const text = readText(sf);
          if (!text) continue;
          const lines = text.split(/\r?\n/);
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const matches = line.match(DIRECT_REF_PATTERN);
            if (matches && !isExemptLine(line)) {
              stats.direct_refs_in_skills += matches.length;
              failures.push({
                check: 9,
                check_name: "direct-refs-in-skills",
                severity: "strict",
                file: sf,
                message: `direct docs/specs/** ref at line ${i + 1}: ${line.trim().substring(0, 200)}`,
              });
            }
          }
        }
      }
    }

    const strictFailures = failures.filter((f) => f.severity === "strict");
    return {
      ok: strictFailures.length === 0,
      failures,
      stats,
    };
  } finally {
    process.chdir(origCwd);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const repoRoot = args[0] || process.cwd();
  const json = args.includes("--json");
  const report = checkReadContracts(repoRoot);
  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(`check_read_contracts.ts - IR-056 validation\n`);
    process.stdout.write(`========================================\n`);
    process.stdout.write(`repoRoot: ${repoRoot}\n`);
    process.stdout.write(`ok: ${report.ok}\n`);
    process.stdout.write(`stats: ${JSON.stringify(report.stats, null, 2)}\n`);
    process.stdout.write(`failures (${report.failures.length}):\n`);
    for (const f of report.failures) {
      process.stdout.write(
        `  [${f.severity}] check #${f.check} ${f.check_name}${f.file ? ` (${f.file})` : ""}: ${f.message}\n`,
      );
    }
  }
  process.exit(report.ok ? 0 : 1);
}