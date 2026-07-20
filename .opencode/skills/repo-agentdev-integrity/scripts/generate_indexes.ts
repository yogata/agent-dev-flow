/**
 * Index auto-generation script (SC-002 Phase C, IR-061).
 *
 * 対象索引（Wave 1）:
 *   - `docs/specs/integrity/integrity-rule-catalog.md`（catalog IR エントリ一覧）
 *   - `docs/specs/integrity/rule-ownership.md`（IR 別関連マッピング appendix）
 *
 * 自動生成マーカー（HTML コメント形式）で囲まれた領域を実ファイルから再生成する。
 * docs-check（`check_integrity.ts`）の IR-061 検査が整合性を検証する。
 *
 * 参考 SPEC: `docs/specs/integrity/index-auto-generation.md`（SC-002）
 * 参考 IR:   `docs/specs/integrity/rules/IR-061-index-generation-consistency.md`
 *
 * 使用資産: `cli_utils.ts`（parseArgs, printHelp, findRepoRoot, EXIT_*）
 * require/import 混在許容（AG-001、既存資産踏襲）。
 */
import {
  EXIT_OK,
  EXIT_ERROR,
  parseArgs,
  printHelp,
  findRepoRoot,
} from "./cli_utils.ts";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

const SCRIPT_NAME = "generate_indexes.ts";
const DESCRIPTION =
  "AgentDevFlow index auto-generation script (SC-002 Phase C, IR-061)";
const USAGE =
  "bun run generate_indexes.ts [--help] [--dry-run] [--root <path>]";

// 自動生成マーカー形式（SC-002 SPEC、IR-061 準拠）:
//   <!-- AUTOGEN:BEGIN:id=<id> -->
//   ... 自動生成領域 ...
//   <!-- AUTOGEN:END -->
const AUTOGEN_BEGIN_PREFIX = "<!-- AUTOGEN:BEGIN:id=";
const AUTOGEN_END_MARKER = "<!-- AUTOGEN:END -->";

// catalog 内の AUTOGEN ブロック ID（IR-045 欠番を挟む2ブロック構成）。
export const CATALOG_PRE_BLOCK_ID = "catalog-ir-entries-pre-045";
export const CATALOG_POST_BLOCK_ID = "catalog-ir-entries-post-045";
// IR-045 は削除済み（ファイル不在）。catalog では人手編集領域として削除注記を残置。
const IR045_GAP_ID = 45;

// rule-ownership 内の AUTOGEN ブロック ID（IR 別関連マッピング appendix）。
export const RULE_OWNERSHIP_BLOCK_ID = "rule-ownership-ir-crossref";

// ─── Frontmatter / body parser ──────────────────────────────────────────────

/**
 * Markdown frontmatter をパースする（cli_utils/check_integrity と同等 logic）。
 * 戻り値は key→string|string[] の Map。frontmatter なしは null。
 */
function parseFrontmatter(
  content: string,
): Record<string, string | string[]> | null {
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

function readText(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8") as string;
  } catch {
    return null;
  }
}

export interface IrInfo {
  /** IR ID（例: "IR-001"）。ファイル名由来。 */
  id: string;
  /** IR 数値部（例: 1）。ソート・分割用。 */
  num: number;
  /** H1 から抽出した title（例: "現行 REQ frontmatter id ↔ ファイル名"）。 */
  title: string;
  /** ファイル名（例: "IR-001-req-frontmatter-id-filename.md"）。 */
  filename: string;
  /** catalog 用相対リンクパス（例: "rules/IR-001-req-frontmatter-id-filename.md"）。 */
  relPath: string;
  /** related_req 一覧（例: ["REQ-0108-001", "REQ-0101"]）。 */
  relatedReq: string[];
  /** related_spec 一覧（例: ["integrity-contracts.md"]）。 */
  relatedSpec: string[];
}

/**
 * IR 個別ファイル（rules/IR-NNN-{slug}.md）からメタデータを抽出する。
 * frontmatter に id/related_req/related_spec が含まれる場合（IR-061 形式）はそれを優先し、
 * 含まれない場合は本文の Field/Value 表（IR-001..IR-060 形式）から抽出する。
 */
function extractIrInfo(fullPath: string, relPath: string): IrInfo | null {
  const content = readText(fullPath);
  if (!content) return null;

  const filename = path.basename(fullPath);
  const idMatch = filename.match(/^IR-(\d+)-/);
  if (!idMatch) return null;
  const num = Number(idMatch[1]);
  const id = `IR-${String(num).padStart(3, "0")}`;

  // title は H1 行から抽出（" # IR-NNN: Title "）。
  let title = "";
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const h1 = h1Match[1].trim();
    const colonIdx = h1.indexOf(":");
    if (colonIdx !== -1) {
      title = h1.slice(colonIdx + 1).trim();
    } else {
      title = h1;
    }
  }

  // frontmatter から related_req/related_spec を取得（IR-061 等の新形式）。
  const fm = parseFrontmatter(content);
  let relatedReq: string[] = [];
  let relatedSpec: string[] = [];
  if (fm) {
    const rr = fm["related_req"];
    if (Array.isArray(rr)) relatedReq = rr;
    else if (typeof rr === "string") relatedReq = [rr];
    const rs = fm["related_spec"];
    if (Array.isArray(rs)) relatedSpec = rs;
    else if (typeof rs === "string") relatedSpec = [rs];
  }

  // frontmatter に無い場合は本文 Field/Value 表から抽出（IR-001..IR-060 形式）。
  if (relatedReq.length === 0) {
    relatedReq = parseBodyTableArray(content, "related_req");
  }
  if (relatedSpec.length === 0) {
    relatedSpec = parseBodyTableArray(content, "related_spec");
  }

  return {
    id,
    num,
    title,
    filename,
    relPath,
    relatedReq,
    relatedSpec,
  };
}

/**
 * 本文の Field/Value Markdown 表から指定 field の list 値を抽出する。
 * 形式: `| related_req | [REQ-0108-001, REQ-0101] |` → ["REQ-0108-001", "REQ-0101"]
 */
function parseBodyTableArray(content: string, field: string): string[] {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    // | field | value | 形式
    const match = trimmed.match(
      new RegExp(`^\\|\\s*${field}\\s*\\|\\s*(.+?)\\s*\\|$`, "i"),
    );
    if (!match) continue;
    let value = match[1].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1);
    }
    return value
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s.length > 0);
  }
  return [];
}

function listFiles(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return (fs.readdirSync(dirPath) as string[])
      .filter((f) => f.endsWith(".md"))
      .sort();
  } catch {
    return [];
  }
}

/**
 * docs/specs/integrity/rules/ 配下の IR-*.md を収集し、IR 番号順に返す。
 */
export function collectIrFiles(rulesDir: string): IrInfo[] {
  const files = listFiles(rulesDir).filter((f) => /^IR-\d+-.*\.md$/.test(f));
  const infos: IrInfo[] = [];
  for (const f of files) {
    const fullPath = path.join(rulesDir, f);
    const relPath = `rules/${f}`;
    const info = extractIrInfo(fullPath, relPath);
    if (info) infos.push(info);
  }
  infos.sort((a, b) => a.num - b.num);
  return infos;
}

// ─── Catalog 生成 ────────────────────────────────────────────────────────────

/**
 * catalog 用の IR エントリ bullet 行を生成する。
 * 形式: `- [IR-NNN: title](rules/IR-NNN-slug.md)`
 */
function formatCatalogLine(info: IrInfo): string {
  return `- [${info.id}: ${info.title}](${info.relPath})`;
}

/**
 * catalog の AUTOGEN ブロック2件（pre/post IR-045）向けにエントリ群を分割生成する。
 * 戻り値: { pre: IR-001..IR-044, post: IR-046..IR-NNN }
 */
export function generateCatalogBlocks(
  infos: IrInfo[],
): { pre: string[]; post: string[] } {
  const pre: string[] = [];
  const post: string[] = [];
  for (const info of infos) {
    if (info.num < IR045_GAP_ID) {
      pre.push(formatCatalogLine(info));
    } else if (info.num > IR045_GAP_ID) {
      post.push(formatCatalogLine(info));
    }
    // info.num === IR045_GAP_ID はファイル不在のため対象外。
  }
  return { pre, post };
}

// ─── rule-ownership appendix 生成 ─────────────────────────────────────────────

/**
 * rule-ownership appendix（IR 別関連マッピング）の表行を生成する。
 * 形式: `| IR-001 | title | REQ-0108-001, REQ-0101 | integrity-contracts.md |`
 */
function formatRuleOwnershipLine(info: IrInfo): string {
  const reqCell = info.relatedReq.length > 0 ? info.relatedReq.join(", ") : "-";
  const specCell =
    info.relatedSpec.length > 0 ? info.relatedSpec.join(", ") : "-";
  // 表セル内のパイプを回避するため改行・パイプを空白へ置換。
  const safeTitle = info.title.replace(/\|/g, "/").replace(/\n/g, " ");
  return `| ${info.id} | ${safeTitle} | ${reqCell} | ${specCell} |`;
}

export function generateRuleOwnershipAppendix(infos: IrInfo[]): string[] {
  const lines: string[] = [];
  lines.push("| IR ID | title | Related REQ | Related SPEC |");
  lines.push("|-------|-------|-------------|--------------|");
  for (const info of infos) {
    lines.push(formatRuleOwnershipLine(info));
  }
  return lines;
}

// ─── AUTOGEN マーカー処理 ────────────────────────────────────────────────────

export interface AutogenBlock {
  id: string;
  /** マーカー開始行から終了行まで（マーカー自身を含む）。 */
  startLine: number;
  endLine: number;
  /** 現在のコードブロック内行配列（マーカー間、マーカー自身は含まず）。 */
  currentBody: string[];
}

/**
 * content から指定 id の AUTOGEN ブロックを検出する。
 * マーカー形式:
 *   <!-- AUTOGEN:BEGIN:id=<id> -->
 *   ... content ...
 *   <!-- AUTOGEN:END -->
 */
export function findAutogenBlocks(content: string): AutogenBlock[] {
  const lines = content.split("\n");
  const blocks: AutogenBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.includes(AUTOGEN_BEGIN_PREFIX)) {
      const idStart = line.indexOf(AUTOGEN_BEGIN_PREFIX) + AUTOGEN_BEGIN_PREFIX.length;
      const idEnd = line.indexOf("-->", idStart);
      if (idEnd === -1) {
        i++;
        continue;
      }
      const id = line.slice(idStart, idEnd).trim();
      const startLine = i;
      const body: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].includes(AUTOGEN_END_MARKER)) {
        body.push(lines[j]);
        j++;
      }
      if (j >= lines.length) {
        // 終了マーカー不在は壊れた状態。読み飛ばす。
        i++;
        continue;
      }
      blocks.push({
        id,
        startLine,
        endLine: j,
        currentBody: body,
      });
      i = j + 1;
    } else {
      i++;
    }
  }
  return blocks;
}

/**
 * 指量 id の AUTOGEN ブロック本文を newBody で置換した content を返す。
 * ブロック未検出時は content を unchanged で返す（呼び出し元で検出）。
 */
function replaceAutogenBlock(
  content: string,
  id: string,
  newBody: string[],
): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let i = 0;
  let replaced = false;
  while (i < lines.length) {
    const line = lines[i];
    if (
      line.includes(AUTOGEN_BEGIN_PREFIX) &&
      line.includes(`id=${id}`) &&
      !replaced
    ) {
      // 開始マーカー → newBody → 終了マーカーへ置換。
      out.push(line);
      for (const bodyLine of newBody) {
        out.push(bodyLine);
      }
      // 終了マーカーまで進める。
      let j = i + 1;
      while (j < lines.length && !lines[j].includes(AUTOGEN_END_MARKER)) {
        j++;
      }
      if (j < lines.length) {
        out.push(lines[j]);
        i = j + 1;
        replaced = true;
      } else {
        // 終了マーカー不在。残りを出力して終了。
        i = i + 1;
        replaced = true;
      }
    } else {
      out.push(line);
      i++;
    }
  }
  return out.join("\n");
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let options;
  try {
    options = parseArgs(args);
  } catch (e) {
    console.error(
      `[generate_indexes] ${e instanceof Error ? e.message : String(e)}`,
    );
    process.exit(EXIT_ERROR);
  }

  if (options.help) {
    // USAGE を printHelp の標準形式で表示（exit 0）。
    const helpText = `${SCRIPT_NAME} ― ${DESCRIPTION}

USAGE:
  ${USAGE}

OPTIONS:
  --help            Show this help message
  --dry-run         Show what would be regenerated without writing files
  --root <path>     Explicit repository root (worktree/CI support)

EXIT CODES:
  0  All targeted indexes regenerated (or dry-run completed)
  1  Unused (kept for compatibility with EXIT_NG)
  2  Input error or execution failure

TARGET FILES (SC-002 Phase C, Wave 1):
  - docs/specs/integrity/integrity-rule-catalog.md (catalog IR entries, 2 blocks around IR-045 gap)
  - docs/specs/integrity/rule-ownership.md (IR cross-reference appendix)

GENERATION SOURCE:
  - docs/specs/integrity/rules/IR-*.md (frontmatter + body Field/Value table)

RELATED:
  - SPEC: docs/specs/integrity/index-auto-generation.md (SC-002)
  - IR:   docs/specs/integrity/rules/IR-061-index-generation-consistency.md
  - docs-check: check_integrity.ts checkIndexGenerationConsistency (IR-061)
`;
    console.log(helpText);
    process.exit(EXIT_OK);
  }

  const scriptDir =
    (typeof import.meta !== "undefined" && (import.meta as any).dir) ||
    __dirname ||
    process.cwd();
  const root = findRepoRoot(scriptDir, { explicitRoot: options.root });

  const rulesDir = path.join(
    root,
    "docs",
    "specs",
    "integrity",
    "rules",
  );
  const catalogPath = path.join(
    root,
    "docs",
    "specs",
    "integrity",
    "integrity-rule-catalog.md",
  );
  const ruleOwnershipPath = path.join(
    root,
    "docs",
    "specs",
    "integrity",
    "rule-ownership.md",
  );

  if (!fs.existsSync(rulesDir)) {
    console.error(`[generate_indexes] rules dir not found: ${rulesDir}`);
    process.exit(EXIT_ERROR);
  }

  const infos = collectIrFiles(rulesDir);
  if (infos.length === 0) {
    console.error(`[generate_indexes] no IR-*.md files found in ${rulesDir}`);
    process.exit(EXIT_ERROR);
  }

  const { pre: catalogPre, post: catalogPost } = generateCatalogBlocks(infos);
  const ruleOwnershipLines = generateRuleOwnershipAppendix(infos);

  const updates: { file: string; content: string }[] = [];

  // catalog 更新
  const catalogOriginal = readText(catalogPath);
  if (catalogOriginal === null) {
    console.error(`[generate_indexes] catalog not found: ${catalogPath}`);
    process.exit(EXIT_ERROR);
  }
  let catalogUpdated = catalogOriginal;
  const catalogPreBlocks = findAutogenBlocks(catalogOriginal).filter(
    (b) => b.id === CATALOG_PRE_BLOCK_ID,
  );
  const catalogPostBlocks = findAutogenBlocks(catalogOriginal).filter(
    (b) => b.id === CATALOG_POST_BLOCK_ID,
  );
  if (catalogPreBlocks.length === 0 && catalogPostBlocks.length === 0) {
    console.error(
      `[generate_indexes] catalog AUTOGEN markers not found. ` +
        `Expected ids: ${CATALOG_PRE_BLOCK_ID}, ${CATALOG_POST_BLOCK_ID}`,
    );
    process.exit(EXIT_ERROR);
  }
  if (catalogPreBlocks.length > 0) {
    catalogUpdated = replaceAutogenBlock(
      catalogUpdated,
      CATALOG_PRE_BLOCK_ID,
      catalogPre,
    );
  }
  if (catalogPostBlocks.length > 0) {
    catalogUpdated = replaceAutogenBlock(
      catalogUpdated,
      CATALOG_POST_BLOCK_ID,
      catalogPost,
    );
  }
  if (catalogUpdated !== catalogOriginal) {
    updates.push({ file: catalogPath, content: catalogUpdated });
  }

  // rule-ownership 更新
  const ruleOwnershipOriginal = readText(ruleOwnershipPath);
  if (ruleOwnershipOriginal === null) {
    console.error(
      `[generate_indexes] rule-ownership not found: ${ruleOwnershipPath}`,
    );
    process.exit(EXIT_ERROR);
  }
  const ruleOwnershipBlocks = findAutogenBlocks(ruleOwnershipOriginal).filter(
    (b) => b.id === RULE_OWNERSHIP_BLOCK_ID,
  );
  if (ruleOwnershipBlocks.length === 0) {
    console.error(
      `[generate_indexes] rule-ownership AUTOGEN marker not found. ` +
        `Expected id: ${RULE_OWNERSHIP_BLOCK_ID}`,
    );
    process.exit(EXIT_ERROR);
  }
  const ruleOwnershipUpdated = replaceAutogenBlock(
    ruleOwnershipOriginal,
    RULE_OWNERSHIP_BLOCK_ID,
    ruleOwnershipLines,
  );
  if (ruleOwnershipUpdated !== ruleOwnershipOriginal) {
    updates.push({ file: ruleOwnershipPath, content: ruleOwnershipUpdated });
  }

  if (options.dryRun) {
    console.log(
      `[generate_indexes] dry-run: ${infos.length} IR files collected`,
    );
    console.log(
      `[generate_indexes] catalog pre-block: ${catalogPre.length} entries`,
    );
    console.log(
      `[generate_indexes] catalog post-block: ${catalogPost.length} entries`,
    );
    console.log(
      `[generate_indexes] rule-ownership appendix: ${ruleOwnershipLines.length} rows (incl. header)`,
    );
    for (const u of updates) {
      console.log(`[generate_indexes] WOULD UPDATE: ${u.file}`);
    }
    process.exit(EXIT_OK);
  }

  for (const u of updates) {
    fs.writeFileSync(u.file, u.content, "utf-8");
    console.log(`[generate_indexes] updated: ${u.file}`);
  }
  if (updates.length === 0) {
    console.log(`[generate_indexes] no changes (already up-to-date)`);
  }
  process.exit(EXIT_OK);
}

if (import.meta.main) {
  main();
}
