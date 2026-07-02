/**
 * Project Doc Inputs integrity checker (IR-056).
 *
 * Validates project doc-inputs mechanism per ADR-0133, REQ-0157,
 * docs/specs/foundations/project-doc-inputs.md.
 *
 * RU-20260701 schema:
 *   frontmatter: version: 1, kind: command-doc-input | skill-doc-input, id: <id>
 *   command doc-input: must_read[{path,purpose}], conditional_read[{id,when,paths,purpose}],
 *                      allowed_discovery[string], forbidden[string], read_completion[string]
 *   skill doc-input:   conditional_read[{id,when,paths,purpose}],
 *                      allowed_discovery[string], forbidden[string]
 *                      (must_read, read_completion absent)
 *
 * 9 check items:
 *   1. .agentdev/config.yaml existence and schema (version, kind, roots, doc_inputs only)
 *   2. roots paths existence
 *   3. doc_inputs.commands and doc_inputs.skills directories existence
 *   4. command doc-input existence for each public command
 *   5. each doc-input schema (frontmatter + object structure)
 *   6. each doc-input paths existence
 *   7. paths discoverability from docs/DOC-MAP.md or docs (any README)
 *   8. no direct docs/specs/{domain}/** refs in src/opencode/commands/agentdev/
 *   9. no direct docs/specs/{domain}/** refs in src/opencode/skills/agentdev-/
 *
 * exemptions:
 *   - SPEC path example (<existing-spec>.md etc., template notation)
 *   - glob pattern docs/specs/** in procedure text
 *   - .agentdev/doc-inputs/** refs are legitimate (hybrid model)
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
    command_doc_inputs: number;
    skill_doc_inputs: number;
    direct_refs_in_commands: number;
    direct_refs_in_skills: number;
  };
}

const PUBLIC_COMMAND_DIR = "src/opencode/commands/agentdev";
const SKILLS_DIR = "src/opencode/skills";
const CONFIG_PATH = ".agentdev/config.yaml";
const DEFAULT_DOC_INPUTS_COMMANDS_DIR = ".agentdev/doc-inputs/commands";
const DEFAULT_DOC_INPUTS_SKILLS_DIR = ".agentdev/doc-inputs/skills";
const DOC_MAP_PATH = "docs/DOC-MAP.md";
const DOCS_README_PATH = "docs/README.md";
const SPECS_README_PATH = "docs/specs/README.md";
const INTEGRITY_RULE_CATALOG_PATH = "docs/specs/integrity/integrity-rule-catalog.md";

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
 * Minimal YAML parser for our config.yaml and doc-input files.
 *
 * Supports the RU-20260701 schema:
 *   - top-level key: value
 *   - nested mapping via indent
 *   - list of scalars:  "- value"
 *   - list of mappings: "- key: value" with consecutive deeper-indent "k: v" lines
 *                        becoming fields of one element
 *   - inline arrays [a, b]
 *   - inline empty mapping {}
 *
 * Limitations: no flow-style nested mappings, no multi-line strings, no anchors.
 * Sufficient for our doc-input YAML files which use the constrained schema.
 *
 * List tracking: when `key:` has empty value, we push a placeholder node onto
 * the stack carrying `__list_owner` + `__list_key`. When a `- ` line is seen
 * at deeper indent, items are pushed onto `owner[key]` (converting from {} to []
 * on first item).
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

    // List element
    if (line.startsWith("- ")) {
      const holder = currentParent(indent);
      const owner = holder.__list_owner;
      const key = holder.__list_key;
      if (owner && key) {
        if (!Array.isArray(owner[key])) owner[key] = [];
        const rest = line.slice(2).trim();

        // Detect "- key: value" — this begins a mapping element.
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
            elem[innerKey] = null; // nested mapping continues on following indented lines
          } else if (innerRaw.startsWith("[") && innerRaw.endsWith("]")) {
            const items = innerRaw
              .slice(1, -1)
              .split(",")
              .map((s) => s.trim().replace(/^["']|["']$/g, ""))
              .filter((s) => s.length > 0);
            elem[innerKey] = items;
          } else {
            elem[innerKey] = innerRaw.replace(/^["']|["']$/g, "");
          }
          owner[key].push(elem);
          stack.push({ indent, node: elem });
        } else {
          // Plain scalar element (or quoted).
          const value = rest.replace(/^["']|["']$/g, "");
          owner[key].push(value);
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
      const items = rawValue
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter((s) => s.length > 0);
      parent[key] = items;
    } else if (rawValue === "{}") {
      parent[key] = {};
    } else {
      parent[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }

  // Post-process: replace any leftover list-holders (no `- ` items followed) with [].
  function normalize(node: any): void {
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
  }
  normalize(root);
  return root;
}

interface CollectedPathsResult {
  paths: string[];
  schemaFailures: CheckFailure[];
}

/**
 * Collect all path-like strings from a parsed doc-input.
 * Also validates object structure per the RU-20260701 schema (check #5 partial).
 */
function collectDocInputPaths(
  docInput: any,
  isCommand: boolean,
  rcFile: string,
): CollectedPathsResult {
  const paths: string[] = [];
  const schemaFailures: CheckFailure[] = [];

  // must_read: list of {path, purpose}
  if (isCommand) {
    if (docInput.must_read === undefined || docInput.must_read === null) {
      schemaFailures.push({
        check: 5,
        check_name: "doc-input-schema",
        severity: "strict",
        file: rcFile,
        message: `command doc-input missing required 'must_read' (can be empty list)`,
      });
    } else if (!Array.isArray(docInput.must_read)) {
      schemaFailures.push({
        check: 5,
        check_name: "doc-input-schema",
        severity: "strict",
        file: rcFile,
        message: `command doc-input 'must_read' must be a list`,
      });
    } else {
      for (let idx = 0; idx < docInput.must_read.length; idx++) {
        const e = docInput.must_read[idx];
        if (typeof e === "string") {
          // Backward-compat: plain string entry counts as path (no purpose).
          paths.push(e);
        } else if (e && typeof e === "object") {
          if (typeof e.path !== "string") {
            schemaFailures.push({
              check: 5,
              check_name: "doc-input-schema",
              severity: "strict",
              file: rcFile,
              message: `command doc-input must_read[${idx}] missing 'path' string`,
            });
          } else {
            paths.push(e.path);
          }
          if (typeof e.purpose !== "string") {
            schemaFailures.push({
              check: 5,
              check_name: "doc-input-schema",
              severity: "strict",
              file: rcFile,
              message: `command doc-input must_read[${idx}] missing 'purpose' string`,
            });
          }
        } else {
          schemaFailures.push({
            check: 5,
            check_name: "doc-input-schema",
            severity: "strict",
            file: rcFile,
            message: `command doc-input must_read[${idx}] must be {path, purpose} object`,
          });
        }
      }
    }
  } else {
    // skill doc-input must NOT have must_read.
    if (docInput.must_read !== undefined && docInput.must_read !== null) {
      schemaFailures.push({
        check: 5,
        check_name: "doc-input-schema",
        severity: "strict",
        file: rcFile,
        message: `skill doc-input must NOT have 'must_read'`,
      });
    }
    if (docInput.read_completion !== undefined && docInput.read_completion !== null) {
      schemaFailures.push({
        check: 5,
        check_name: "doc-input-schema",
        severity: "strict",
        file: rcFile,
        message: `skill doc-input must NOT have 'read_completion'`,
      });
    }
  }

  // conditional_read: list of {id, when, paths, purpose}
  if (
    docInput.conditional_read !== undefined &&
    docInput.conditional_read !== null &&
    !Array.isArray(docInput.conditional_read) &&
    Object.keys(docInput.conditional_read).length === 0
  ) {
    // Empty mapping {} — accepted as no conditional reads.
  } else if (
    docInput.conditional_read !== undefined &&
    docInput.conditional_read !== null
  ) {
    if (!Array.isArray(docInput.conditional_read)) {
      // Legacy form: conditional_read is a mapping id -> list of paths.
      // Tolerated but flagged as strict schema violation in the new schema.
      schemaFailures.push({
        check: 5,
        check_name: "doc-input-schema",
        severity: "strict",
        file: rcFile,
        message: `doc-input 'conditional_read' must be a list of {id, when, paths, purpose} objects (got mapping)`,
      });
      if (typeof docInput.conditional_read === "object") {
        for (const condKey of Object.keys(docInput.conditional_read)) {
          const v = docInput.conditional_read[condKey];
          if (Array.isArray(v)) paths.push(...v);
        }
      }
    } else {
      for (let idx = 0; idx < docInput.conditional_read.length; idx++) {
        const e = docInput.conditional_read[idx];
        if (!e || typeof e !== "object") {
          schemaFailures.push({
            check: 5,
            check_name: "doc-input-schema",
            severity: "strict",
            file: rcFile,
            message: `doc-input conditional_read[${idx}] must be an object`,
          });
          continue;
        }
        if (typeof e.id !== "string") {
          schemaFailures.push({
            check: 5,
            check_name: "doc-input-schema",
            severity: "strict",
            file: rcFile,
            message: `doc-input conditional_read[${idx}] missing 'id' string`,
          });
        }
        if (typeof e.when !== "string") {
          schemaFailures.push({
            check: 5,
            check_name: "doc-input-schema",
            severity: "strict",
            file: rcFile,
            message: `doc-input conditional_read[${idx}] missing 'when' string`,
          });
        }
        if (!Array.isArray(e.paths)) {
          schemaFailures.push({
            check: 5,
            check_name: "doc-input-schema",
            severity: "strict",
            file: rcFile,
            message: `doc-input conditional_read[${idx}] missing 'paths' list`,
          });
        } else {
          paths.push(...e.paths);
        }
        if (typeof e.purpose !== "string") {
          schemaFailures.push({
            check: 5,
            check_name: "doc-input-schema",
            severity: "strict",
            file: rcFile,
            message: `doc-input conditional_read[${idx}] missing 'purpose' string`,
          });
        }
      }
    }
  }

  // allowed_discovery / forbidden / read_completion: list of strings (descriptive)
  for (const k of ["allowed_discovery", "forbidden", "read_completion"]) {
    if (docInput[k] !== undefined && docInput[k] !== null) {
      if (!Array.isArray(docInput[k])) {
        schemaFailures.push({
          check: 5,
          check_name: "doc-input-schema",
          severity: "strict",
          file: rcFile,
          message: `doc-input '${k}' must be a list of strings`,
        });
      } else {
        for (let idx = 0; idx < docInput[k].length; idx++) {
          const item = docInput[k][idx];
          if (typeof item !== "string") {
            schemaFailures.push({
              check: 5,
              check_name: "doc-input-schema",
              severity: "strict",
              file: rcFile,
              message: `doc-input '${k}[${idx}]' must be a string`,
            });
          } else if (item.length === 0) {
            schemaFailures.push({
              check: 5,
              check_name: "doc-input-schema",
              severity: "strict",
              file: rcFile,
              message: `doc-input '${k}[${idx}]' must not be empty string`,
            });
          }
        }
      }
    }
  }

  if (!isCommand) {
    if (docInput["must_read"] !== undefined && docInput["must_read"] !== null) {
      schemaFailures.push({
        check: 5,
        check_name: "doc-input-schema",
        severity: "strict",
        file: rcFile,
        message: `skill doc-input must not have 'must_read' (use conditional_read instead)`,
      });
    }
    if (docInput["read_completion"] !== undefined && docInput["read_completion"] !== null) {
      schemaFailures.push({
        check: 5,
        check_name: "doc-input-schema",
        severity: "strict",
        file: rcFile,
        message: `skill doc-input must not have 'read_completion'`,
      });
    }
  }

  if (isCommand) {
    const requiredFields = ["must_read", "conditional_read", "allowed_discovery", "forbidden", "read_completion"];
    for (const field of requiredFields) {
      if (docInput[field] === undefined || docInput[field] === null) {
        schemaFailures.push({
          check: 5,
          check_name: "doc-input-schema",
          severity: "strict",
          file: rcFile,
          message: `command doc-input missing required field '${field}'`,
        });
      }
    }
  }

  return { paths, schemaFailures };
}

function isExemptLine(line: string): boolean {
  for (const hint of EXEMPTION_HINTS) {
    if (line.includes(hint)) return true;
  }
  return false;
}

/**
 * Validate frontmatter (version, kind, id) of a doc-input parsed YAML.
 * Returns schema failures (check #5).
 */
function validateFrontmatter(
  parsed: any,
  isCommand: boolean,
  rcFile: string,
): CheckFailure[] {
  const failures: CheckFailure[] = [];
  const expectedKind = isCommand ? "command-doc-input" : "skill-doc-input";

  if (parsed.version === undefined) {
    failures.push({
      check: 5,
      check_name: "doc-input-schema",
      severity: "strict",
      file: rcFile,
      message: `doc-input missing frontmatter 'version'`,
    });
  } else if (String(parsed.version) !== "1") {
    failures.push({
      check: 5,
      check_name: "doc-input-schema",
      severity: "strict",
      file: rcFile,
      message: `doc-input 'version' must be 1 (got: ${parsed.version})`,
    });
  }

  if (parsed.kind !== expectedKind) {
    failures.push({
      check: 5,
      check_name: "doc-input-schema",
      severity: "strict",
      file: rcFile,
      message: `doc-input 'kind' must be '${expectedKind}' (got: ${parsed.kind})`,
    });
  }

  if (typeof parsed.id !== "string" || parsed.id.length === 0) {
    failures.push({
      check: 5,
      check_name: "doc-input-schema",
      severity: "strict",
      file: rcFile,
      message: `doc-input missing 'id' string`,
    });
  } else if (isCommand) {
    if (!parsed.id.startsWith("/agentdev/")) {
      failures.push({
        check: 5,
        check_name: "doc-input-schema",
        severity: "strict",
        file: rcFile,
        message: `command doc-input 'id' should start with '/agentdev/' (got: ${parsed.id})`,
      });
    } else {
      const expectedName = parsed.id.replace(/^\/agentdev\//, "");
      const fileBase = rcFile.replace(/\\/g, "/").replace(/\.yaml$/, "").split("/").pop();
      if (fileBase && expectedName !== fileBase) {
        failures.push({
          check: 5,
          check_name: "doc-input-schema",
          severity: "strict",
          file: rcFile,
          message: `command doc-input 'id' (${parsed.id}) does not match filename (expected: /agentdev/${fileBase})`,
        });
      }
    }
  } else {
    const fileBase = rcFile.replace(/\\/g, "/").replace(/\.yaml$/, "").split("/").pop();
    if (fileBase && parsed.id !== fileBase) {
      failures.push({
        check: 5,
        check_name: "doc-input-schema",
        severity: "strict",
        file: rcFile,
        message: `skill doc-input 'id' (${parsed.id}) does not match filename (expected: ${fileBase})`,
      });
    }
  }

  return failures;
}

export function checkDocInputs(repoRoot: string): CheckReport {
  const failures: CheckFailure[] = [];
  const origCwd = process.cwd();
  process.chdir(repoRoot);
  try {
    const stats = {
      public_commands: 0,
      command_doc_inputs: 0,
      skill_doc_inputs: 0,
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

      // Allowed top-level keys: version, kind, roots, doc_inputs only.
      const allowedTopKeys = new Set(["version", "kind", "roots", "doc_inputs"]);
      for (const k of Object.keys(config)) {
        if (!allowedTopKeys.has(k)) {
          failures.push({
            check: 1,
            check_name: "config-existence-schema",
            severity: "strict",
            file: CONFIG_PATH,
            message: `.agentdev/config.yaml has disallowed top-level key '${k}' (allowed: version, kind, roots, doc_inputs)`,
          });
        }
      }
      const requiredTopKeys = ["version", "kind", "roots", "doc_inputs"];
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
      if (config.doc_inputs) {
        for (const k of ["commands", "skills"]) {
          if (!(k in config.doc_inputs)) {
            failures.push({
              check: 1,
              check_name: "config-existence-schema",
              severity: "strict",
              file: CONFIG_PATH,
              message: `.agentdev/config.yaml doc_inputs missing key '${k}'`,
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

      // Check 3: doc_inputs dirs existence
      const commandsDir =
        config.doc_inputs && config.doc_inputs.commands
          ? config.doc_inputs.commands
          : DEFAULT_DOC_INPUTS_COMMANDS_DIR;
      const skillsDir =
        config.doc_inputs && config.doc_inputs.skills
          ? config.doc_inputs.skills
          : DEFAULT_DOC_INPUTS_SKILLS_DIR;
      if (!dirExists(commandsDir)) {
        failures.push({
          check: 3,
          check_name: "doc-inputs-dirs-existence",
          severity: "strict",
          file: commandsDir,
          message: `doc_inputs.commands directory '${commandsDir}' does not exist`,
        });
      }
      if (!dirExists(skillsDir)) {
        failures.push({
          check: 3,
          check_name: "doc-inputs-dirs-existence",
          severity: "strict",
          file: skillsDir,
          message: `doc_inputs.skills directory '${skillsDir}' does not exist`,
        });
      }

      // Check 4: each public command has a command doc-input
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
            check_name: "command-doc-input-existence",
            severity: "warning",
            file: rc,
            message: `command doc-input for public command '${base}' does not exist`,
          });
        }
      }

      // Check 5, 6, 7: each doc-input schema, paths existence, discoverability
      const commandDocInputs = listYamlFiles(commandsDir);
      const skillDocInputs = listYamlFiles(skillsDir);
      stats.command_doc_inputs = commandDocInputs.length;
      stats.skill_doc_inputs = skillDocInputs.length;
      const allDocInputs = [...commandDocInputs, ...skillDocInputs];
      const docMapText = readText(DOC_MAP_PATH);
      const docsReadmeText = readText(DOCS_README_PATH);
      const specsReadmeText = readText(SPECS_README_PATH);
      const integrityRuleCatalogText = readText(INTEGRITY_RULE_CATALOG_PATH);
      for (const rc of allDocInputs) {
        const rcText = readText(rc);
        if (!rcText) continue;
        const parsed = parseSimpleYaml(rcText);
        const rcNorm = rc.replace(/\\/g, "/");
        const isCommand = rcNorm.includes("/commands/");

        // Frontmatter validation (check #5)
        failures.push(...validateFrontmatter(parsed, isCommand, rc));

        // Schema + paths collection (check #5 continues, #6 prepares)
        const { paths: pathsList, schemaFailures } = collectDocInputPaths(parsed, isCommand, rc);
        failures.push(...schemaFailures);

        // Check 6: paths existence
        for (const p of pathsList) {
          if (!fileExists(p) && !dirExists(p)) {
            failures.push({
              check: 6,
              check_name: "doc-input-paths-existence",
              severity: "strict",
              file: p,
              message: `doc-input '${rc}' path '${p}' does not exist`,
            });
          }
        }

        // Check 7: paths discoverability (warning)
        for (const p of pathsList) {
          if (p.startsWith("docs/")) {
            const baseName = path.basename(p);
            const found =
              (docMapText && (docMapText.includes(p) || docMapText.includes(baseName))) ||
              (docsReadmeText && (docsReadmeText.includes(p) || docsReadmeText.includes(baseName))) ||
              (specsReadmeText && (specsReadmeText.includes(p) || specsReadmeText.includes(baseName))) ||
              (integrityRuleCatalogText && (integrityRuleCatalogText.includes(p) || integrityRuleCatalogText.includes(baseName)));
            if (!found) {
              failures.push({
                check: 7,
                check_name: "doc-input-paths-discoverability",
                severity: "warning",
                file: p,
                message: `doc-input path '${p}' not discoverable from DOC-MAP or docs/**/README.md (warning)`,
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
  const report = checkDocInputs(repoRoot);
  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(`check_doc_inputs.ts - IR-056 validation\n`);
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
