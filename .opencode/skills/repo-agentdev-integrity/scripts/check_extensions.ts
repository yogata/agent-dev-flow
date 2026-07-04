/**
 * Project Extensions integrity checker (IR-056).
 *
 * Validates project extensions mechanism per ADR-0135, REQ-0160,
 * docs/specs/foundations/project-extensions.md.
 *
 * Extension schema:
 *   frontmatter: version: 1, kind: command-extension | skill-extension, id: <id>
 *   5 sections (each an array):
 *     context[{id, when?, paths?, purpose?}]  — additive context entries
 *     rules[{id, when?, skill?}]              — additive rules, optional project-local skill delegation
 *     checks[{id, when?, skill?}]             — additive checks, optional project-local skill delegation
 *     acceptance_gates[string]                 — additive pre-completion gates
 *     must_not[string]                         — additive prohibitions
 *
 * 8 inspection items (per /agentdev/inspect-extensions Step 2):
 *   1. extension listing (.agentdev/extensions/{commands,skills}/*.yaml)
 *   2. extension YAML structure (version, kind, id, 5 sections as arrays)
 *   3. kind/placement match (command-extension in commands/, skill-extension in skills/)
 *   4. id/filename correspondence
 *   5. context.paths existence
 *   6. rules.skill / checks.skill project-local skill existence (warning)
 *   7. legacy .agentdev/doc-inputs/** residual detection (warning)
 *   8. override intent detection in extension bodies (warning, heuristic)
 *
 * Distribution reference boundary (direct refs in src/opencode/commands|skills)
 * is handled by check_distribution_boundary.ts.
 *
 * exemptions within extensions directory:
 *   - inspect-extensions.md legitimately references .agentdev/doc-inputs/**
 *     (residual detection target declaration) but that file is in
 *     src/opencode/commands/agentdev/ and therefore outside this script's
 *     scope.
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
    command_extensions: number;
    skill_extensions: number;
    public_commands: number;
    public_skills: number;
    doc_inputs_residual_files: number;
  };
}

const PUBLIC_COMMAND_DIR = "src/opencode/commands/agentdev";
const SKILLS_DIR = "src/opencode/skills";
const REPO_LOCAL_SKILLS_DIR = ".opencode/skills";
const EXTENSIONS_COMMANDS_DIR = ".agentdev/extensions/commands";
const EXTENSIONS_SKILLS_DIR = ".agentdev/extensions/skills";
const LEGACY_DOC_INPUTS_DIR = ".agentdev/doc-inputs";

// Heuristic override-intent phrases (check #8). Extension is additive-only.
const OVERRIDE_PHRASES = [
  "置き換える",
  "default を変更",
  "defaultを変更",
  "標準動作を置き換え",
  "override standard",
  "replace default",
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

function listFilesRecursive(dirPath: string): string[] {
  const result: string[] = [];
  if (!dirExists(dirPath)) return result;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }) as any[];
  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      result.push(...listFilesRecursive(full));
    } else if (ent.isFile()) {
      result.push(full.replace(/\\/g, "/"));
    }
  }
  return result;
}

/**
 * Minimal YAML parser tailored to extension files (same constraints as the
 * earlier doc-input parser: top-level key: value, nested mapping by indent,
 * list of scalars, list of mappings with deeper-indent continuation,
 * inline arrays [a, b], inline empty mapping {}).
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

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    i++;
    if (!rawLine.trim()) continue;
    if (rawLine.trim().startsWith("#")) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();

    if (line.startsWith("- ")) {
      const holder = currentParent(indent);
      const owner = holder.__list_owner;
      const key = holder.__list_key;
      if (owner && key) {
        if (!Array.isArray(owner[key])) owner[key] = [];
        const rest = line.slice(2).trim();
        const colonIdx = rest.indexOf(":");
        if (
          colonIdx !== -1 &&
          !rest.startsWith("[") &&
          !rest.startsWith('"') &&
          !rest.startsWith("'")
        ) {
          const innerKey = rest.slice(0, colonIdx).trim().replace(/^["']|["']$/g, "");
          const innerRaw = rest.slice(colonIdx + 1).trim();
          const elem: any = {};
          if (innerRaw === "") {
            elem[innerKey] = null;
          } else if (innerRaw.startsWith("[") && innerRaw.endsWith("]")) {
            elem[innerKey] = innerRaw
              .slice(1, -1)
              .split(",")
              .map((s) => s.trim().replace(/^["']|["']$/g, ""))
              .filter((s) => s.length > 0);
          } else {
            elem[innerKey] = innerRaw.replace(/^["']|["']$/g, "");
          }
          owner[key].push(elem);
          stack.push({ indent, node: elem });
        } else {
          owner[key].push(rest.replace(/^["']|["']$/g, ""));
        }
      }
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().replace(/^["']|["']$/g, "");
    const rawValue = line.slice(colonIdx + 1).trim();

    let parent = currentParent(indent);

    if (parent && parent.__list_owner !== undefined) {
      const owner = parent.__list_owner;
      const ownerKey = parent.__list_key;
      const realNode: any = {};
      owner[ownerKey] = realNode;
      if (stack.length > 0 && stack[stack.length - 1].node === parent) {
        stack[stack.length - 1].node = realNode;
      }
      parent = realNode;
    }

    if (rawValue === "") {
      const holder: any = {
        __list_owner: parent,
        __list_key: key,
      };
      parent[key] = holder;
      stack.push({ indent, node: holder });
    } else if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      parent[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter((s) => s.length > 0);
    } else if (rawValue === "{}") {
      parent[key] = {};
    } else {
      parent[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }

  (function normalize(node: any): void {
    if (node && typeof node === "object") {
      for (const k of Object.keys(node)) {
        const v = node[k];
        if (v && typeof v === "object" && v.__list_owner !== undefined) {
          node[k] = [];
        } else if (Array.isArray(v)) {
          for (const e of v) normalize(e);
        } else if (v && typeof v === "object") {
          normalize(v);
        }
      }
    }
  })(root);
  return root;
}

/**
 * Known project-local skill locations for check #6 existence confirmation.
 * Returns true if a directory matching the skill name exists in any known
 * skills location.
 */
function projectLocalSkillExists(skillName: string): boolean {
  // Distributed skills
  const distPath = path.join(SKILLS_DIR, skillName);
  if (dirExists(distPath)) return true;
  // Repo-local skills
  const repoLocalPath = path.join(REPO_LOCAL_SKILLS_DIR, skillName);
  if (dirExists(repoLocalPath)) return true;
  return false;
}

/**
 * Validate frontmatter (version, kind, id) of an extension parsed YAML.
 */
function validateFrontmatter(
  parsed: any,
  isCommand: boolean,
  rcFile: string,
): CheckFailure[] {
  const failures: CheckFailure[] = [];
  const expectedKind = isCommand ? "command-extension" : "skill-extension";

  if (parsed.version === undefined) {
    failures.push({
      check: 2,
      check_name: "extension-structure",
      severity: "strict",
      file: rcFile,
      message: `extension missing frontmatter 'version'`,
    });
  } else if (String(parsed.version) !== "1") {
    failures.push({
      check: 2,
      check_name: "extension-structure",
      severity: "strict",
      file: rcFile,
      message: `extension 'version' must be 1 (got: ${parsed.version})`,
    });
  }

  if (parsed.kind !== expectedKind) {
    failures.push({
      check: 2,
      check_name: "extension-structure",
      severity: "strict",
      file: rcFile,
      message: `extension 'kind' must be '${expectedKind}' (got: ${parsed.kind})`,
    });
  }

  if (typeof parsed.id !== "string" || parsed.id.length === 0) {
    failures.push({
      check: 2,
      check_name: "extension-structure",
      severity: "strict",
      file: rcFile,
      message: `extension missing 'id' string`,
    });
  }
  return failures;
}

/**
 * Validate the 5 sections (context/rules/checks/acceptance_gates/must_not) are arrays.
 */
function validateSections(parsed: any, rcFile: string): CheckFailure[] {
  const failures: CheckFailure[] = [];
  const requiredSections = ["context", "rules", "checks", "acceptance_gates", "must_not"];
  for (const sec of requiredSections) {
    if (parsed[sec] === undefined || parsed[sec] === null) {
      failures.push({
        check: 2,
        check_name: "extension-structure",
        severity: "strict",
        file: rcFile,
        message: `extension missing required section '${sec}' (use empty array if no entries)`,
      });
    } else if (!Array.isArray(parsed[sec])) {
      failures.push({
        check: 2,
        check_name: "extension-structure",
        severity: "strict",
        file: rcFile,
        message: `extension section '${sec}' must be an array`,
      });
    }
  }
  return failures;
}

interface ExtensionWalkResult {
  pathsReferenced: string[];
  skillsReferenced: string[];
  rawText: string;
  failures: CheckFailure[];
}

/**
 * Walk context/rules/checks sections to collect path strings, skill names,
 * and detect override-intent phrases (check #8 heuristic).
 */
function walkExtension(parsed: any, rawText: string, rcFile: string): ExtensionWalkResult {
  const pathsReferenced: string[] = [];
  const skillsReferenced: string[] = [];
  const failures: CheckFailure[] = [];

  // context: array of {id, when?, paths?, purpose?}
  if (Array.isArray(parsed.context)) {
    for (let idx = 0; idx < parsed.context.length; idx++) {
      const e = parsed.context[idx];
      if (!e || typeof e !== "object") {
        failures.push({
          check: 2,
          check_name: "extension-structure",
          severity: "strict",
          file: rcFile,
          message: `context[${idx}] must be an object`,
        });
        continue;
      }
      if (typeof e.id !== "string") {
        failures.push({
          check: 2,
          check_name: "extension-structure",
          severity: "strict",
          file: rcFile,
          message: `context[${idx}] missing 'id' string`,
        });
      }
      if (Array.isArray(e.paths)) {
        for (const p of e.paths) {
          if (typeof p === "string") pathsReferenced.push(p);
        }
      }
    }
  }

  // rules / checks: array of {id, when?, skill?}
  for (const sec of ["rules", "checks"] as const) {
    if (Array.isArray(parsed[sec])) {
      for (let idx = 0; idx < parsed[sec].length; idx++) {
        const e = parsed[sec][idx];
        if (!e || typeof e !== "object") {
          failures.push({
            check: 2,
            check_name: "extension-structure",
            severity: "strict",
            file: rcFile,
            message: `${sec}[${idx}] must be an object`,
          });
          continue;
        }
        if (typeof e.id !== "string") {
          failures.push({
            check: 2,
            check_name: "extension-structure",
            severity: "strict",
            file: rcFile,
            message: `${sec}[${idx}] missing 'id' string`,
          });
        }
        if (typeof e.skill === "string" && e.skill.length > 0) {
          skillsReferenced.push(e.skill);
        }
      }
    }
  }

  // Check #8: override-intent phrase detection (heuristic, warning)
  for (const phrase of OVERRIDE_PHRASES) {
    if (rawText.includes(phrase)) {
      failures.push({
        check: 8,
        check_name: "override-intent",
        severity: "warning",
        file: rcFile,
        message: `extension contains override-intent phrase '${phrase}' (extension must be additive-only)`,
      });
    }
  }

  return { pathsReferenced, skillsReferenced, rawText, failures };
}

export function checkExtensions(repoRoot: string): CheckReport {
  const failures: CheckFailure[] = [];
  const origCwd = process.cwd();
  process.chdir(repoRoot);
  try {
    const stats = {
      command_extensions: 0,
      skill_extensions: 0,
      public_commands: 0,
      public_skills: 0,
      doc_inputs_residual_files: 0,
    };

    const commandExts = listYamlFiles(EXTENSIONS_COMMANDS_DIR);
    const skillExts = listYamlFiles(EXTENSIONS_SKILLS_DIR);
    stats.command_extensions = commandExts.length;
    stats.skill_extensions = skillExts.length;
    const allExts = [...commandExts, ...skillExts];

    // Checks 2-6, 8: per-extension validation
    for (const rc of allExts) {
      const rcText = readText(rc);
      if (!rcText) continue;
      const parsed = parseSimpleYaml(rcText);
      const rcNorm = rc.replace(/\\/g, "/");
      const isCommand = rcNorm.includes("/commands/");

      // Check 2: frontmatter + sections
      failures.push(...validateFrontmatter(parsed, isCommand, rc));
      failures.push(...validateSections(parsed, rc));

      // Check 3: kind/placement match
      if (isCommand && parsed.kind !== "command-extension") {
        failures.push({
          check: 3,
          check_name: "kind-placement-match",
          severity: "strict",
          file: rc,
          message: `command extension must have kind 'command-extension' (got: ${parsed.kind})`,
        });
      }
      if (!isCommand && parsed.kind !== "skill-extension") {
        failures.push({
          check: 3,
          check_name: "kind-placement-match",
          severity: "strict",
          file: rc,
          message: `skill extension must have kind 'skill-extension' (got: ${parsed.kind})`,
        });
      }

      // Check 4: id/filename correspondence
      const fileBase = rcNorm.replace(/\.yaml$/, "").split("/").pop();
      if (fileBase && typeof parsed.id === "string") {
        if (isCommand) {
          const expectedId = `/agentdev/${fileBase}`;
          // For command, id may legitimately not match filename if command
          // was renamed. We check the suffix matches.
          if (!parsed.id.endsWith(`/agentdev/${fileBase}`) && parsed.id !== fileBase) {
            failures.push({
              check: 4,
              check_name: "id-filename-match",
              severity: "strict",
              file: rc,
              message: `command extension 'id' (${parsed.id}) does not match filename (expected: /agentdev/${fileBase})`,
            });
          }
        } else {
          if (parsed.id !== fileBase) {
            failures.push({
              check: 4,
              check_name: "id-filename-match",
              severity: "strict",
              file: rc,
              message: `skill extension 'id' (${parsed.id}) does not match filename (expected: ${fileBase})`,
            });
          }
        }
      }

      // Walk sections: collect paths/skills, check structure, override phrases
      const walk = walkExtension(parsed, rcText, rc);
      failures.push(...walk.failures);

      // Check 5: context.paths existence
      for (const p of walk.pathsReferenced) {
        if (!fileExists(p) && !dirExists(p)) {
          failures.push({
            check: 5,
            check_name: "context-paths-existence",
            severity: "strict",
            file: p,
            message: `extension '${rc}' context.paths '${p}' does not exist`,
          });
        }
      }

      // Check 6: rules.skill / checks.skill project-local skill existence (warning)
      for (const skillName of walk.skillsReferenced) {
        if (!projectLocalSkillExists(skillName)) {
          failures.push({
            check: 6,
            check_name: "skill-existence",
            severity: "warning",
            file: rc,
            message: `extension '${rc}' references project-local skill '${skillName}' which is not found in known skill locations`,
          });
        }
      }
    }

    // Check 7: legacy .agentdev/doc-inputs/** residual detection (warning)
    if (dirExists(LEGACY_DOC_INPUTS_DIR)) {
      const legacyFiles = listFilesRecursive(LEGACY_DOC_INPUTS_DIR);
      stats.doc_inputs_residual_files = legacyFiles.length;
      if (legacyFiles.length > 0) {
        failures.push({
          check: 7,
          check_name: "legacy-doc-inputs-residual",
          severity: "warning",
          file: LEGACY_DOC_INPUTS_DIR,
          message: `legacy .agentdev/doc-inputs/** still contains ${legacyFiles.length} file(s); migration to extensions should remove them`,
        });
      }
    }

    // Stats: public commands/skills counts (informational)
    const commandFiles = listMarkdownFiles(PUBLIC_COMMAND_DIR, false).filter((f) => {
      const base = path.basename(f);
      return base !== "README.md";
    });
    stats.public_commands = commandFiles.length;
    if (dirExists(SKILLS_DIR)) {
      const skillDirs = (fs.readdirSync(SKILLS_DIR, { withFileTypes: true }) as any[])
        .filter((d) => d.isDirectory() && d.name.startsWith("agentdev-"));
      stats.public_skills = skillDirs.length;
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
  const report = checkExtensions(repoRoot);
  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(`check_extensions.ts - IR-056 validation\n`);
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
