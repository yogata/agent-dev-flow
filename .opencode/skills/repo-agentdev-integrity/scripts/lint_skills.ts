/**
 * Skill structure linter for AgentDevFlow.
 * Validates all skill directories under .opencode/skills/ for structural
 * correctness and naming conventions.
 *
 * Checks:
 *   Structure: SKILL.md existence, directory name vs frontmatter name
 *   Content: description, USE FOR, DO NOT USE FOR, See Also references
 *   References: resource subdirectories, SKILL.md bloat
 *   Namespace: agentdev- prefix
 *   AG-005 (RU-0018 / Issue #2179): skill 記述基準 層1〜2 machine checks
 *     (description length 600/1024, marker words / internal IDs in
 *     description, USE FOR double keeping, workflow trigger item,
 *     references TOC for >300-line files, aggregate description budget warn)
 */
import {
  EXIT_OK,
  EXIT_ERROR,
  parseArgs,
  printHelp,
  ok,
  ng,
  warn,
  info,
  computeSummary,
  formatJsonReport,
  formatMarkdownReport,
  determineExitCode,
  findRepoRoot,
  DEFAULT_PROFILE,
} from "./cli_utils.ts";
import type { CheckResult, ScanSummary, IntegrityReport } from "./cli_utils.ts";

const SCRIPT_NAME = "lint_skills.ts";
const SCRIPT_DESCRIPTION = "Skill structure linter for AgentDevFlow";
const SCRIPT_USAGE =
  "bun run .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts [--help] [--json] [--dry-run] [--root <path>]";

const fs = require("fs");
const path = require("path");

interface FrontMatter {
  name: string;
  description: string;
}

function parseFrontMatter(content: string): FrontMatter | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const body = parts[1].trim();
  const fields: Record<string, string> = {};
  for (const line of body.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    fields[key] = value;
  }
  if (!fields.name) return null;
  return {
    name: fields.name,
    description: fields.description || "",
  };
}

function stripAgentdevPrefix(name: string): string {
  return name.startsWith("agentdev-") ? name.slice("agentdev-".length) : name;
}

function extractSeeAlsoReferences(content: string): string[] {
  const refs: string[] = [];
  const seeAlsoMatch = content.match(/## See Also([\s\S]*?)$/);
  if (!seeAlsoMatch) return refs;
  const section = seeAlsoMatch[1];
  const boldPattern = /\*\*(agentdev-[a-z0-9-]+)\*\*/g;
  let match: RegExpExecArray | null;
  while ((match = boldPattern.exec(section)) !== null) {
    refs.push(match[1]);
  }
  const linkPattern = /\[(agentdev-[a-z0-9-]+)\]\([^)]*\)/g;
  while ((match = linkPattern.exec(section)) !== null) {
    refs.push(match[1]);
  }
  return [...new Set(refs)];
}

// ===== AG-005 (RU-0018 / Issue #2179): skill 記述基準 層1〜2 machine checks =====
//
// Canonical owners (SPEC is authoritative; this linter is the detection view):
//   - docs/specs/skills/agentdev-skill-authoring.md「機械検査（本 SPEC 検証観点への追加）」
//   - docs/specs/authoring/command-file-format.md「機械検査対象」
//
// 検証不通過 (hard): description 1024 超過 / 単体 600 超過 / USE FOR 二重保持 /
//   description 内マーカー語・内部 ID / 簡潔トリガー項欠落（AG-004、command-bound
//   Workflow Skill のみ肯定検証）/ 300 行超 references の目次欠落。
// warn: 集約予算（平均 350×N、N = src/opencode/skills 配下の SKILL.md 実ファイル数）。
//
// Pre-existing violations known at introduction are grandfathered via
// baselines/lint-skills-baseline.json using the same delta-aware semantics as
// the check_integrity.ts NG baseline (v2:REQ-0161-005): baseline-known
// ng/warning findings are demoted to info, only findings exceeding the
// baseline drive the exit code. OU-002〜005 (Epic #2178 Waves 2-3) remove the
// violations and must shrink or delete the corresponding baseline entries in
// the same PRs.

const AG005_CATEGORY = "AG-005";
const DESC_INDIVIDUAL_LIMIT = 600;
const DESC_SPEC_LIMIT = 1024;
const DESC_AVERAGE_BUDGET = 350;
const REFERENCES_TOC_LINE_LIMIT = 300;
// soft guard マーカー語（AG-001）。簡潔トリガー項の「単独起動」はマーカー語ではない。
const DESC_MARKER_WORD_RE = /soft guard|直接起動/i;
// 内部 ID（REQ-/ADR-/DEC-/IR-/RU-/TS-/AG- + 数字）
const DESC_INTERNAL_ID_RE = /\b(?:REQ|ADR|DEC|IR|RU|TS|AG)-\d+/i;
const BODY_USE_FOR_HEADING_RE = /^##\s+(?:USE FOR|DO NOT USE FOR)\s*$/gm;
const DESC_USE_FOR_RE = /USE FOR/i;
const WORKFLOW_TRIGGER_ITEM = "単独起動";
const TOC_HEADING_RE = /^#{1,3}\s*(?:目次|Table of Contents)\s*$/mi;
const TOC_ANCHOR_RE = /\]\(#/g;
const TOC_ANCHOR_MIN_LINKS = 5;

function listCommandBoundWorkflowSkills(repoRoot: string): Set<string> {
  // Workflow Skill = agentdev-workflow-{X} where src/opencode/commands/agentdev/{X}.md
  // exists（deriveSkillClassification と同一の決定的分類。CLI 直依存を避けるため
  // lint_skills 内では同導出を維持する）。
  const bound = new Set<string>();
  const cmdDir = path.join(repoRoot, "src", "opencode", "commands", "agentdev");
  if (!fs.existsSync(cmdDir)) return bound;
  for (const f of fs.readdirSync(cmdDir)) {
    if (!f.endsWith(".md") || f === "README.md") continue;
    bound.add(`agentdev-workflow-${f.replace(/\.md$/, "")}`);
  }
  return bound;
}

function lintDescriptionAg005(
  dirName: string,
  frontMatter: FrontMatter | null,
  content: string,
  workflowBound: Set<string>,
): CheckResult[] {
  const results: CheckResult[] = [];
  const desc = frontMatter?.description ?? "";
  const parts = content.split("---");
  const body = parts.length >= 3 ? parts.slice(2).join("---") : "";

  if (frontMatter && desc.length > 0) {
    const len = desc.length;
    if (len > DESC_SPEC_LIMIT) {
      results.push(
        ng(
          AG005_CATEGORY,
          "description length 1024",
          `description is ${len} chars, exceeding the OpenCode spec limit ${DESC_SPEC_LIMIT} (検証不通過の安全線, RU-0018 層1)`,
          dirName,
          undefined,
          { evidence: `${len} chars`, expected: `<= ${DESC_SPEC_LIMIT}` },
        ),
      );
    } else if (len > DESC_INDIVIDUAL_LIMIT) {
      results.push(
        ng(
          AG005_CATEGORY,
          "description length 600",
          `description is ${len} chars, exceeding the individual limit ${DESC_INDIVIDUAL_LIMIT} (検証不通過, RU-0018 層1)`,
          dirName,
          undefined,
          { evidence: `${len} chars`, expected: `<= ${DESC_INDIVIDUAL_LIMIT}` },
        ),
      );
    } else {
      results.push(
        ok(
          AG005_CATEGORY,
          "description length 600",
          `${dirName} description is ${len} chars (within ${DESC_INDIVIDUAL_LIMIT})`,
          dirName,
        ),
      );
    }

    const marker = desc.match(DESC_MARKER_WORD_RE);
    if (marker) {
      results.push(
        ng(
          AG005_CATEGORY,
          "description marker word",
          `description contains the soft guard marker word "${marker[0]}" (marker words belong to the body or authoritative docs, RU-0018 層1)`,
          dirName,
          undefined,
          {
            evidence: marker[0],
            expected: "no soft guard marker word in description",
          },
        ),
      );
    } else {
      results.push(
        ok(
          AG005_CATEGORY,
          "description marker word",
          `${dirName} description has no soft guard marker word`,
          dirName,
        ),
      );
    }

    const ids = desc.match(new RegExp(DESC_INTERNAL_ID_RE.source, "gi"));
    if (ids) {
      const unique = [...new Set(ids)];
      results.push(
        ng(
          AG005_CATEGORY,
          "description internal ID",
          `description contains internal ID(s): ${unique.join(", ")} (internal IDs belong to the body or authoritative docs, RU-0018 層1)`,
          dirName,
          undefined,
          {
            evidence: unique.join(", "),
            expected: "no internal ID in description",
          },
        ),
      );
    } else {
      results.push(
        ok(
          AG005_CATEGORY,
          "description internal ID",
          `${dirName} description has no internal ID`,
          dirName,
        ),
      );
    }
  }

  // USE FOR 二重保持: トリガーは frontmatter description の単一所属とする（RU-0018 層2）。
  const descDeclaresUseFor = DESC_USE_FOR_RE.test(desc);
  const bodySections = body.match(BODY_USE_FOR_HEADING_RE) ?? [];
  if (descDeclaresUseFor && bodySections.length > 0) {
    results.push(
      ng(
        AG005_CATEGORY,
        "USE FOR double keeping",
        `description declares USE FOR triggers and the body also keeps ${bodySections.length} USE FOR section heading(s) (${bodySections.map((s) => s.trim()).join(", ")}); keep triggers in the description only (RU-0018 層2)`,
        dirName,
      ),
    );
  } else {
    results.push(
      ok(
        AG005_CATEGORY,
        "USE FOR double keeping",
        `${dirName} keeps USE FOR triggers in a single place`,
        dirName,
      ),
    );
  }

  // AG-004 簡潔トリガー項の肯定検証（command-bound Workflow Skill のみ）。
  if (workflowBound.has(dirName)) {
    if (desc.includes(WORKFLOW_TRIGGER_ITEM)) {
      results.push(
        ok(
          AG005_CATEGORY,
          "workflow trigger item",
          `${dirName} description declares the concise trigger item (${WORKFLOW_TRIGGER_ITEM})`,
          dirName,
        ),
      );
    } else {
      results.push(
        ng(
          AG005_CATEGORY,
          "workflow trigger item",
          `Workflow Skill description lacks the concise trigger item "単独起動（対応する /agentdev/* コマンド経由で利用すること）" in DO NOT USE FOR (AG-004)`,
          dirName,
        ),
      );
    }
  }

  return results;
}

function lintReferencesTocAg005(skillDir: string, dirName: string): CheckResult[] {
  const results: CheckResult[] = [];
  const refsDir = path.join(skillDir, "references");
  if (!fs.existsSync(refsDir)) return results;
  const files: string[] = [];
  (function walk(dir: string): void {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile() && ent.name.endsWith(".md")) {
        files.push(full);
      }
    }
  })(refsDir);
  for (const refPath of files.sort()) {
    const text = fs.readFileSync(refPath, "utf-8");
    const lineCount = text.split(/\r?\n/).length;
    if (lineCount <= REFERENCES_TOC_LINE_LIMIT) continue;
    const rel = path.relative(skillDir, refPath).replace(/\\/g, "/");
    const hasToc =
      TOC_HEADING_RE.test(text) ||
      (text.match(TOC_ANCHOR_RE) ?? []).length >= TOC_ANCHOR_MIN_LINKS;
    if (hasToc) {
      results.push(
        ok(
          AG005_CATEGORY,
          "references TOC",
          `${dirName}/${rel} has ${lineCount} lines and a table of contents`,
          `${dirName}/${rel}`,
        ),
      );
    } else {
      results.push(
        ng(
          AG005_CATEGORY,
          "references TOC",
          `references file exceeds ${REFERENCES_TOC_LINE_LIMIT} lines (${lineCount}) without a table of contents (目次) (RU-0018 層2)`,
          `${dirName}/${rel}`,
          undefined,
          {
            evidence: `${lineCount} lines`,
            expected: `<= ${REFERENCES_TOC_LINE_LIMIT} lines or a TOC`,
          },
        ),
      );
    }
  }
  return results;
}

function aggregateBudgetResultAg005(
  totalChars: number,
  n: number,
): CheckResult {
  const budget = DESC_AVERAGE_BUDGET * n;
  const avg = n > 0 ? Math.round((totalChars / n) * 10) / 10 : 0;
  if (n > 0 && totalChars > budget) {
    return warn(
      AG005_CATEGORY,
      "description aggregate budget",
      `aggregate description budget exceeded: total ${totalChars} chars across N=${n} SKILL.md files (avg ${avg}) > ${DESC_AVERAGE_BUDGET}*${n}=${budget} (warn, 傾向管理, RU-0018 層1)`,
    );
  }
  return ok(
    AG005_CATEGORY,
    "description aggregate budget",
    `aggregate description budget within limit: total ${totalChars} chars across N=${n} SKILL.md files (avg ${avg} <= ${DESC_AVERAGE_BUDGET})`,
  );
}

// ===== lint-skills NG baseline（AG-005 既知違反の grandfathering）=====
//
// check_integrity.ts の NG baseline（v2:REQ-0161-005）と同じ delta-aware 準拠:
// baseline-known の ng/warning は info へ降格し、baseline を超過した分（delta）のみ
// exit code を駆動する。bucket key は check + file（各 check/file は最大1 finding の
// ため evidence は key に含めない）。baseline は明示的に編集して更新する（自動再生成
// なし）。実欠陥の恒久隠蔽ではなく、OU-002〜005（Epic #2178）での解消までの承認録。

const LINT_SKILLS_BASELINE_PATH = path.join(
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "baselines",
  "lint-skills-baseline.json",
);

interface LintSkillsBaselineEntry {
  check: string;
  file: string | null;
  count: number;
  provenance: string;
  reason: string;
}

interface LintSkillsBaseline {
  version: number;
  rule_id: string;
  generated_at: string;
  entries: LintSkillsBaselineEntry[];
}

function loadLintSkillsBaseline(repoRoot: string): LintSkillsBaseline | null {
  try {
    const raw = fs.readFileSync(path.join(repoRoot, LINT_SKILLS_BASELINE_PATH), "utf-8");
    const parsed = JSON.parse(raw) as Partial<LintSkillsBaseline>;
    if (!parsed || !Array.isArray(parsed.entries)) return null;
    return {
      version: typeof parsed.version === "number" ? parsed.version : 1,
      rule_id: parsed.rule_id ?? "LINT-SKILLS-NG-BASELINE",
      generated_at: parsed.generated_at ?? "",
      entries: parsed.entries.map((e) => ({
        check: String(e.check ?? ""),
        file: e.file === null || e.file === undefined ? null : String(e.file),
        count: typeof e.count === "number" ? e.count : 0,
        provenance: e.provenance ? String(e.provenance) : "legacy",
        reason: e.reason ? String(e.reason) : "",
      })),
    };
  } catch {
    return null;
  }
}

function lintBaselineKey(check: string, file: string | null): string {
  return `${check}\t${file ?? ""}`;
}

function applyLintSkillsBaseline(
  results: CheckResult[],
  baseline: LintSkillsBaseline,
): { demoted: number; delta: number } {
  const baselineIndex = new Map<string, { count: number; provenance: string }>();
  for (const entry of baseline.entries) {
    baselineIndex.set(lintBaselineKey(entry.check, entry.file), {
      count: entry.count,
      provenance: entry.provenance,
    });
  }

  const currentCounts = new Map<string, number>();
  for (const r of results) {
    if (r.level !== "ng" && r.level !== "warning") continue;
    const key = lintBaselineKey(r.check, r.file ?? null);
    currentCounts.set(key, (currentCounts.get(key) ?? 0) + 1);
  }
  const newBuckets = new Set<string>();
  for (const [key, count] of currentCounts) {
    if (count > (baselineIndex.get(key)?.count ?? 0)) newBuckets.add(key);
  }

  const emittedPerBucket = new Map<string, number>();
  let demoted = 0;
  let delta = 0;
  for (const r of results) {
    if (r.level !== "ng" && r.level !== "warning") continue;
    const key = lintBaselineKey(r.check, r.file ?? null);
    const baselineCount = baselineIndex.get(key)?.count ?? 0;
    const provenance = baselineIndex.get(key)?.provenance ?? "legacy";
    const emitted = emittedPerBucket.get(key) ?? 0;
    emittedPerBucket.set(key, emitted + 1);
    if (emitted < baselineCount && !newBuckets.has(key)) {
      r.level = "info";
      r.finding_level = "observation";
      const tag =
        provenance === "legacy"
          ? "[baseline-known]"
          : `[baseline-known provenance=${provenance}]`;
      r.message = `${tag} ${r.message} (lint-skills baseline, not yet cleaned)`;
      demoted++;
    } else {
      delta++;
    }
  }
  return { demoted, delta };
}

function lintSkill(
  skillDir: string,
  dirName: string,
  allDirNames: Set<string>,
): CheckResult[] {
  const results: CheckResult[] = [];
  const skillMdPath = path.join(skillDir, "SKILL.md");

  if (!fs.existsSync(skillMdPath)) {
    results.push(
      ng(
        "Structure",
        "SKILL.md existence",
        `SKILL.md not found in ${dirName}`,
        dirName,
      ),
    );
    return results;
  }
  results.push(
    ok("Structure", "SKILL.md existence", `${dirName}/SKILL.md exists`),
  );

  const content = fs.readFileSync(skillMdPath, "utf-8");
  const frontMatter = parseFrontMatter(content);

  if (frontMatter) {
    const fmStripped = stripAgentdevPrefix(frontMatter.name);
    const dirStripped = stripAgentdevPrefix(dirName);
    if (fmStripped !== dirStripped) {
      results.push(
        warn(
          "Structure",
          "Directory naming vs frontmatter name",
          `Directory "${dirName}" does not match frontmatter name "${frontMatter.name}"`,
          dirName,
        ),
      );
    } else {
      results.push(
        ok(
          "Structure",
          "Directory naming vs frontmatter name",
          `${dirName} matches frontmatter`,
        ),
      );
    }
  } else {
    results.push(
      warn(
        "Structure",
        "Directory naming vs frontmatter name",
        `Could not parse frontmatter in ${dirName}/SKILL.md`,
        dirName,
      ),
    );
  }

  if (frontMatter && frontMatter.description.length > 0) {
    results.push(
      ok("Content", "Description presence", `${dirName} has description`),
    );
  } else {
    results.push(
      ng(
        "Content",
        "Description presence",
        `Missing or empty description in ${dirName}/SKILL.md frontmatter`,
        dirName,
      ),
    );
  }

  // Trigger Convention (REQ-0103-097, agentdev-skill-authoring): USE FOR /
  // DO NOT USE FOR are declared in the frontmatter `description` field, not as
  // markdown sections. Validate the frontmatter block accordingly.
  const fmBlock = content.split("---")[1] || "";

  if (/USE FOR/i.test(fmBlock)) {
    results.push(
      ok("Content", "USE FOR trigger", `${dirName} declares USE FOR`),
    );
  } else {
    results.push(
      warn(
        "Content",
        "USE FOR trigger",
        `Missing USE FOR trigger in ${dirName}/SKILL.md frontmatter description`,
        dirName,
      ),
    );
  }

  if (/DO NOT USE FOR/i.test(fmBlock)) {
    results.push(
      ok(
        "Content",
        "DO NOT USE FOR trigger",
        `${dirName} declares DO NOT USE FOR`,
      ),
    );
  } else {
    results.push(
      warn(
        "Content",
        "DO NOT USE FOR trigger",
        `Missing DO NOT USE FOR trigger in ${dirName}/SKILL.md frontmatter description`,
        dirName,
      ),
    );
  }

  const seeAlsoRefs = extractSeeAlsoReferences(content);
  if (seeAlsoRefs.length > 0) {
    const brokenRefs = seeAlsoRefs.filter((ref) => !allDirNames.has(ref));
    if (brokenRefs.length > 0) {
      for (const broken of brokenRefs) {
        results.push(
          ng(
            "Content",
            "See Also references",
            `Broken reference to "${broken}" in See Also section`,
            dirName,
          ),
        );
      }
    } else {
      results.push(
        ok(
          "Content",
          "See Also references",
          `${dirName} See Also references all valid`,
        ),
      );
    }
  } else {
    results.push(
      ok(
        "Content",
        "See Also references",
        `${dirName} has no See Also references to check`,
      ),
    );
  }

  // Detect self-referential resource file paths (the skill referencing a file in
  // its OWN scripts/references/templates subdir). The leading negative
  // lookbehind excludes cross-skill paths (.opencode/skills/agentdev-X/... or
  // .../agentdev-X/templates/) and bare concept mentions, so only genuine
  // self-claims are validated. Placeholder paths with {...} are skipped.
  // Mirrors SCRIPT_TEMPLATE_REF_PATTERNS in check_integrity.ts.
  const selfResourceRe =
    /(?<![.\w/-])(scripts\/[^\s"')\]}]+\.ts|references\/[^\s"')\]}]+\.md|templates\/[^\s"')\]}]+\.md)/g;
  const resourceSubdirs = new Set<string>();
  let resMatch: RegExpExecArray | null;
  selfResourceRe.lastIndex = 0;
  while ((resMatch = selfResourceRe.exec(content)) !== null) {
    if (resMatch[0].includes("{")) continue;
    resourceSubdirs.add(resMatch[0].split("/")[0] + "/");
  }
  const mentionedResources = [...resourceSubdirs];

  if (mentionedResources.length > 0) {
    let allExist = true;
    for (const res of mentionedResources) {
      const resPath = path.join(skillDir, res.replace("/", path.sep));
      if (!fs.existsSync(resPath)) {
        results.push(
          warn(
            "References",
            "Resource references",
            `Referenced subdirectory "${res}" not found in ${dirName}`,
            dirName,
          ),
        );
        allExist = false;
      }
    }
    if (allExist) {
      results.push(
        ok(
          "References",
          "Resource references",
          `${dirName} referenced resources all exist`,
        ),
      );
    }
  } else {
    results.push(
      ok(
        "References",
        "Resource references",
        `${dirName} has no resource references to check`,
      ),
    );
  }

  const lineCount = content.split("\n").length;
  if (lineCount > 500) {
    results.push(
      warn(
        "References",
        "SKILL.md bloat",
        `SKILL.md has ${lineCount} lines (exceeds 500 line threshold)`,
        dirName,
      ),
    );
  } else {
    results.push(
      ok(
        "References",
        "SKILL.md bloat",
        `${dirName}/SKILL.md has ${lineCount} lines (within 500 line limit)`,
      ),
    );
  }

  if (dirName.startsWith("agentdev-")) {
    results.push(
      ok("Namespace", "agentdev- prefix", `${dirName} uses agentdev- prefix`),
    );
  } else {
    results.push(
      info(
        "Namespace",
        "agentdev- prefix",
        `${dirName} does not use agentdev- prefix`,
        dirName,
      ),
    );
  }

  return results;
}

function listSkillDirs(
  skillsDir: string,
): { name: string; fullPath: string }[] {
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  return entries
    .filter(
      (e: { isDirectory: () => boolean; name: string }) => {
        if (e.isDirectory()) return true;
        // Windows junctions: isDirectory() returns false (libuv reparse point
        // behavior). statSync follows the link so junctioned agentdev-* skills
        // are seen. Mirrors listDirs() in check_integrity.ts (#779).
        try {
          return fs.statSync(path.join(skillsDir, e.name)).isDirectory();
        } catch {
          return false;
        }
      },
    )
    .filter((e: { name: string }) => e.name !== "README.md")
    .map((e: { name: string }) => ({
      name: e.name,
      fullPath: path.join(skillsDir, e.name),
    }));
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printHelp(SCRIPT_NAME, SCRIPT_DESCRIPTION, SCRIPT_USAGE);
    process.exit(EXIT_OK);
  }

  const repoRoot = findRepoRoot(import.meta.dir, {
    explicitRoot: options.root,
  });
  const projectionSkillsDir = path.join(repoRoot, ".opencode", "skills");
  const sourceSkillsDir = path.join(repoRoot, "src", "opencode", "skills");
  // worktree junction 未設定環境では projection に配布スキルが存在しないため src/opencode/ へ
  // fallback する（REQ-018-001。skills_structure.test.ts と同一の sentinel 基準）。
  // sentinel・src とも無い環境（テスト fixture）は projection を維持する。
  const skillsDir = fs.existsSync(
    path.join(projectionSkillsDir, "agentdev-workflow-templates"),
  )
    ? projectionSkillsDir
    : fs.existsSync(sourceSkillsDir)
      ? sourceSkillsDir
      : projectionSkillsDir;
  if (!fs.existsSync(skillsDir)) {
    console.error(`Skills directory not found: ${skillsDir}`);
    process.exit(EXIT_ERROR);
  }

  const skillDirs = listSkillDirs(skillsDir);

  if (options.dryRun) {
    console.log("Skills to be checked:");
    for (const sd of skillDirs) {
      console.log(`  ${sd.name}`);
    }
    console.log(`Total: ${skillDirs.length} skill directories`);
    console.log(
      `AG-005 scan dir: ${fs.existsSync(sourceSkillsDir) ? sourceSkillsDir : skillsDir}`,
    );
    process.exit(EXIT_OK);
  }

  const allDirNames = new Set(skillDirs.map((sd) => sd.name));
  const allResults: CheckResult[] = [];
  for (const sd of skillDirs) {
    const results = lintSkill(sd.fullPath, sd.name, allDirNames);
    allResults.push(...results);
  }

  // AG-005 は配布 SoT（src/opencode/skills）を対象に測定する（N = SKILL.md 実ファイル数、
  // RU-0018 層1）。projection スキャンと対象が乖離する環境（main repo junction 有無）で
  // も同一結果となるよう、src が存在する場合は src を、無い場合は fixture の skillsDir
  // を用いる。
  const agScanDir = fs.existsSync(sourceSkillsDir) ? sourceSkillsDir : skillsDir;
  const workflowBound = listCommandBoundWorkflowSkills(repoRoot);
  let agTotalChars = 0;
  let agSkillCount = 0;
  if (fs.existsSync(agScanDir)) {
    for (const sd of listSkillDirs(agScanDir)) {
      const skillMdPath = path.join(sd.fullPath, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) continue;
      agSkillCount++;
      const content = fs.readFileSync(skillMdPath, "utf-8");
      const frontMatter = parseFrontMatter(content);
      if (frontMatter && frontMatter.description.length > 0) {
        agTotalChars += frontMatter.description.length;
      }
      allResults.push(
        ...lintDescriptionAg005(sd.name, frontMatter, content, workflowBound),
      );
      allResults.push(...lintReferencesTocAg005(sd.fullPath, sd.name));
    }
  }
  allResults.push(aggregateBudgetResultAg005(agTotalChars, agSkillCount));

  const baseline = loadLintSkillsBaseline(repoRoot);
  if (baseline) {
    const applied = applyLintSkillsBaseline(allResults, baseline);
    console.error(
      `[lint-skills] baseline applied: ${applied.demoted} baseline-known (demoted to info), ${applied.delta} new unmanaged (delta, exit code driver).`,
    );
  }

  const summary: ScanSummary = computeSummary(allResults);
  const report: IntegrityReport = {
    timestamp: new Date().toISOString(),
    script: SCRIPT_NAME,
    profile: DEFAULT_PROFILE,
    scanned: { skills: skillDirs.length, ag005_skills: agSkillCount },
    summary,
    results: allResults,
  };

  if (options.json) {
    console.log(formatJsonReport(report));
  } else {
    console.log(formatMarkdownReport(report));
  }
  process.exit(determineExitCode(summary));
}

main();
