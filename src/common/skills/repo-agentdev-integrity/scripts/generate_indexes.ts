// ADF-COVERS(implementation): REQ-010-011, REQ-059-002, REQ-059-003, REQ-047-013, REQ-122-001, REQ-122-003, REQ-122-006
// ADF-COVERS(verification): REQ-103-022, REQ-103-024, REQ-103-025
/**
 * Index auto-generation script (SC-002 Phase C, IR-061).
 *
 * 対象索引（Wave 1）:
 *   - `docs/designs/integrity/integrity-rule-catalog.md`（catalog IR エントリ一覧）
 *   - `docs/designs/integrity/rule-ownership.md`（IR 別関連マッピング appendix）
 *
 * 自動生成マーカー（HTML コメント形式）で囲まれた領域を実ファイルから再生成する。
 * docs-check（`check_integrity.ts`）の IR-061 検査が整合性を検証する。
 *
 * 参考 Design: `docs/designs/integrity/index-auto-generation.md`（SC-002）
 * 参考 IR:   `docs/designs/integrity/rules/IR-061-index-generation-consistency.md`
 *
 * 使用資産: `cli_utils.ts`（parseArgs, findRepoRoot, EXIT_*）
 * require/import 混在許容（AG-001、既存資産踏襲）。
 */
import {
  EXIT_OK,
  EXIT_ERROR,
  parseArgs,
  findRepoRoot,
} from "../lib/cli_utils.ts";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

const SCRIPT_NAME = "generate_indexes.ts";
const DESCRIPTION =
  "AgentDevFlow index auto-generation script (SC-002 Phase C, IR-061)";
const USAGE =
  "bun run generate_indexes.ts [--help] [--dry-run] [--root <path>]";

// 自動生成マーカー形式（SC-002 Design、IR-061 準拠）:
//   <!-- AUTOGEN:BEGIN:id=<id> -->
//   ... 自動生成領域 ...
//   <!-- AUTOGEN:END -->
//
// 検出は行全体一致方式（Issue #1771）。説明文中の backtick 囲み（インラインコード）
// marker 文字列を実 marker と誤認しないため、部分一致（line.includes）ではなく
// 行全体が正規マーカー形式に一致するかで判定する。backtick 文脈判定のような
// 部分一致ロジックは併用しない（index-auto-generation.md「AUTOGEN marker 検出契約」）。

/** AUTOGEN:BEGIN マーカー行全体一致パターン。id は非空白文字列。 */
const AUTOGEN_BEGIN_LINE_RE = /^\s*<!-- AUTOGEN:BEGIN:id=(\S+) -->\s*$/;
/** AUTOGEN:END マーカー行全体一致パターン。 */
const AUTOGEN_END_LINE_RE = /^\s*<!-- AUTOGEN:END -->\s*$/;

/**
 * 行全体が AUTOGEN:BEGIN マーカー形式（`<!-- AUTOGEN:BEGIN:id=<id> -->`）に一致するか判定する。
 * backtick 囲み等の部分一致は行全体一致判定で自動的に除外される。
 */
export function isAutogenBeginLine(line: string): boolean {
  return AUTOGEN_BEGIN_LINE_RE.test(line);
}

/**
 * 行全体が AUTOGEN:END マーカー形式（`<!-- AUTOGEN:END -->`）に一致するか判定する。
 */
export function isAutogenEndLine(line: string): boolean {
  return AUTOGEN_END_LINE_RE.test(line);
}

/**
 * AUTOGEN:BEGIN マーカー行から id を抽出する。
 * 行全体が BEGIN マーカー形式に一致しない場合は null を返す。
 */
export function extractAutogenBeginId(line: string): string | null {
  const match = line.match(AUTOGEN_BEGIN_LINE_RE);
  return match ? (match[1] ?? null) : null;
}

// catalog 内の AUTOGEN ブロック ID（レジストリ単一ソース。DEC-065 決定3 により
// rules/index.ts のレジストリから生成する単一ブロック構成へ再編）。
export const CATALOG_BLOCK_ID = "catalog-ir-entries";

// rule-ownership 内の AUTOGEN ブロック ID（IR 別関連マッピング appendix）。
export const RULE_OWNERSHIP_BLOCK_ID = "rule-ownership-ir-crossref";

// req-impact-map 内の AUTOGEN ブロック ID（REQ → 影響する Rule IDs の逆方向対応）。
// IR 文書 frontmatter related_req から導出する（rule-ownership.md
// 「対応表の機械検証への移行（B3-1）」、REQ-047-013）。
export const REQ_IMPACT_MAP_BLOCK_ID = "req-impact-map-req-ir-crossref";

// skill-projection-manifest.yaml の skills セクション再生成（B3-3）。
// 正規情報源は src/common/skills/ のディレクトリ列挙。checker は IR-068 で
// manifest↔src の差分を厳格検出する。third_party_skills は third-party 取得
// 機構の管理登録（判断列）であり導出対象外。
export const SKILL_PROJECTION_MANIFEST_REL =
  ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml";

export interface SkillProjectionManifestUpdate {
  skills: string[];
  generatedAt: string;
}

/**
 * src/common/skills/ のディレクトリ列挙から manifest skills リストを導出する。
 * repo-*（repo-local integrity skill）は third-party / ADF 投影スキルではなく
 * 検出対象外のため除外する（IR-068 loadSkillProjectionManifest の投影列挙と同一規則）。
 */
export function deriveSkillProjectionManifestSkills(skillsDir: string): string[] {
  let entries: import("fs").Dirent[];
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true }) as import("fs").Dirent[];
  } catch {
    return [];
  }
  const names: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith("repo-")) continue;
    if (entry.isDirectory()) {
      names.push(entry.name);
      continue;
    }
    try {
      if (fs.statSync(path.join(skillsDir, entry.name)).isDirectory()) {
        names.push(entry.name);
      }
    } catch {
      // 解決不能エントリ（stale junction 等）は導出対象外。
    }
  }
  return names.sort();
}

/**
 * manifest yaml の skills セクションのエントリ行（`skills:` 直後の連続する
 * リスト行）を機械生成リストで置換した content を返す。エントリ行以外
 * （空行、後続キー等）は保持する。セクション検出不能時は unchanged を返す。
 */
export function replaceSkillProjectionManifestSkills(
  content: string,
  skills: string[],
): string {
  const lines = content.split(/\r?\n/);
  const skillsIdx = lines.findIndex((l) => /^skills:\s*$/.test(l));
  if (skillsIdx === -1) return content;
  let firstEntry = -1;
  let lastEntry = -1;
  for (let i = skillsIdx + 1; i < lines.length; i++) {
    if (/^\s*-\s+\S/.test(lines[i] ?? "")) {
      if (firstEntry === -1) firstEntry = i;
      lastEntry = i;
      continue;
    }
    if (firstEntry !== -1) break;
  }
  if (firstEntry === -1) return content;
  const generated = skills.map((s) => `  - ${s}`);
  const out = [
    ...lines.slice(0, firstEntry),
    ...generated,
    ...lines.slice(lastEntry + 1),
  ];
  return out.join("\n");
}

/**
 * manifest yaml の generated_at 行を更新した content を返す。行不在時は unchanged。
 */
export function replaceSkillProjectionManifestGeneratedAt(
  content: string,
  generatedAt: string,
): string {
  return content.replace(
    /^generated_at:\s*.*$/m,
    `generated_at: ${generatedAt}`,
  );
}

/**
 * IR frontmatter / Field-Value 表の related_req から REQ → IR の逆索引を導出する。
 * v2: 履歴参照と IR カタログの注記セル（非 ID 要素）は除外し、行レベル ID
 * （REQ-NNN-NNN）はファイルレベル（REQ-NNN）へ集約する。
 */
export function buildReqToIrIndex(infos: IrInfo[]): Map<string, string[]> {
  const reqToIrs = new Map<string, Set<string>>();
  for (const info of infos) {
    for (const raw of info.relatedReq) {
      const id = raw.trim();
      if (!id || id.startsWith("v2:") || id.startsWith("-")) continue;
      // 行レベル ID（REQ-NNN-NNN）はファイルレベル（REQ-NNN）へ集約する。
      // 注記付き要素（REQ-NNN (説明) 等）は ID prefix を正規化して採用する。
      const fileLevel = /^(REQ-\d+)(?:-\d+)?(?=\s|$)/.exec(id);
      if (!fileLevel) continue;
      const reqId = fileLevel[1];
      let set = reqToIrs.get(reqId!);
      if (!set) {
        set = new Set<string>();
        reqToIrs.set(reqId!, set);
      }
      set.add(info.id);
    }
  }
  const result = new Map<string, string[]>();
  for (const [reqId, irSet] of reqToIrs) {
    result.set(
      reqId,
      [...irSet].sort((a, b) => {
        const na = Number(a.slice(3));
        const nb = Number(b.slice(3));
        return na - nb;
      }),
    );
  }
  return result;
}

/**
 * req-impact-map 逆方向対応表（REQ → 影響する Rule IDs）の本文を生成する。
 * REQ タイトルは現行 REQ frontmatter から導出する。reqDir の実在 REQ ファイルと
 * 突合し、存在しない REQ ID は行に含めない（retired は導出対象外）。
 */
export function generateReqImpactMapCrossref(
  infos: IrInfo[],
  reqInfos: ReqInfo[],
): string[] {
  const reqToIrs = buildReqToIrIndex(infos);
  const titleById = new Map(reqInfos.map((r) => [r.id, r.title] as const));
  const reqIds = [...reqToIrs.keys()]
    .filter((id) => titleById.has(id))
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
  const lines: string[] = [];
  lines.push("| REQ | タイトル | 影響する Rule IDs |");
  lines.push("|-----|---------|------------------|");
  for (const reqId of reqIds) {
    const title = sanitizeTableCell(titleById.get(reqId) ?? "");
    const irCell = reqToIrs.get(reqId)!.join(", ");
    lines.push(`| [${reqId}](../../requirements/${reqId}.md) | ${title} | ${irCell} |`);
  }
  return lines;
}

// ─── Frontmatter / body parser ──────────────────────────────────────────────

/**
 * Markdown frontmatter をパースする（cli_utils/check_integrity と同等 logic に
 * 加えて YAML ブロックスカラ対応を持つ）。戻り値は key→string|string[] の Map。
 * frontmatter なしは null。
 *
 * ブロックスカラ（`|`、`|-`、`|+`、`>`、`>-`、`>+`）は、キー行より深いインデントの
 * 後続行を改行結合した 1 文字列として値に格納する（DEC frontmatter の
 * supersede_note 等）。同等 logic の簡易パーサーがブロックスカラ指示子を
 * リテラル値（"|"）として読み、注記レンダリングを破損させる（〔|〕出力）
 * ことを防ぐ（index-auto-generation.md 注記形式契約・ACT-DESIGN-035）。
 */
function parseFrontmatter(
  content: string,
): Record<string, string | string[]> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const yaml = parts[1]!.trim();
  const result: Record<string, string | string[]> = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  const currentArray: string[] = [];
  let blockKey: string | null = null;
  let blockIndent: number | null = null;
  const blockLines: string[] = [];

  function flushArray() {
    if (currentKey !== null && currentArray.length > 0) {
      result[currentKey] = [...currentArray];
    }
    currentKey = null;
    currentArray.length = 0;
  }

  function flushBlockScalar() {
    if (blockKey !== null) {
      result[blockKey] = blockLines.join("\n");
    }
    blockKey = null;
    blockIndent = null;
    blockLines.length = 0;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (blockKey !== null) {
      if (trimmed === "") {
        blockLines.push("");
        continue;
      }
      const indent = line.length - line.trimStart().length;
      if (blockIndent === null) blockIndent = indent;
      if (indent >= blockIndent) {
        blockLines.push(line.slice(blockIndent));
        continue;
      }
      // ブロックスカラ領域の終端（より浅いインデントの行）。通常パースへ続く。
      flushBlockScalar();
    }

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
    } else if (/^[|>][+-]?$/.test(value)) {
      // YAML ブロックスカラ開始。後続の深いインデント行を収集する。
      blockKey = key;
      blockIndent = null;
      blockLines.length = 0;
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

  flushBlockScalar();
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
  /** related_design 一覧（例: ["integrity-contracts.md"]）。 */
  relatedDesign: string[];
}

/**
 * IR 個別ファイル（rules/IR-NNN-{slug}.md）からメタデータを抽出する。
 * frontmatter に id/related_req/related_design が含まれる場合（IR-061 形式）はそれを優先し、
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
    const h1 = h1Match[1]!.trim();
    const colonIdx = h1.indexOf(":");
    if (colonIdx !== -1) {
      title = h1.slice(colonIdx + 1).trim();
    } else {
      title = h1;
    }
  }

  // frontmatter から related_req/related_design を取得（IR-061 等の新形式）。
  const fm = parseFrontmatter(content);
  let relatedReq: string[] = [];
  let relatedDesign: string[] = [];
  if (fm) {
    const rr = fm["related_req"];
    if (Array.isArray(rr)) relatedReq = rr;
    else if (typeof rr === "string") relatedReq = [rr];
    const rs = fm["related_design"];
    if (Array.isArray(rs)) relatedDesign = rs;
    else if (typeof rs === "string") relatedDesign = [rs];
  }

  // frontmatter に無い場合は本文 Field/Value 表から抽出（IR-001..IR-060 形式）。
  if (relatedReq.length === 0) {
    relatedReq = parseBodyTableArray(content, "related_req");
  }
  if (relatedDesign.length === 0) {
    relatedDesign = parseBodyTableArray(content, "related_design");
  }

  return {
    id,
    num,
    title,
    filename,
    relPath,
    relatedReq,
    relatedDesign,
  };
}

/**
 * 本文の Field/Value Markdown 表から指定 field の list 値を抽出する。
 * 形式: `| related_req | [REQ-0108-001, REQ-0101] |` → ["REQ-0108-001", "REQ-0101"]
 */
export function parseBodyTableArray(content: string, field: string): string[] {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    // | field | value | 形式
    const match = trimmed.match(
      new RegExp(`^\\|\\s*${field}\\s*\\|\\s*(.+?)\\s*\\|$`, "i"),
    );
    if (!match) continue;
    let value = match[1]!.trim();
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
 * docs/designs/integrity/rules/ 配下の IR-*.md を収集し、IR 番号順に返す。
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
 * rules/index.ts のレジストリから catalog の AUTOGEN ブロック本文を生成する
 * （DEC-065 決定3: カタログ自動生成の単一ソース = rules レジストリ）。
 * IR-075 は Wave-4 でルール登録されるため、登録前は 24 構成となる。
 */
export function generateCatalogEntries(
  rules: readonly { id: string; title: string; slug: string }[],
): string[] {
  return rules.map((rule) => `- [${rule.id}: ${rule.title}](rules/IR-${rule.id.slice(3)}-${rule.slug}.md)`);
}

// ─── rule-ownership appendix 生成 ─────────────────────────────────────────────

/**
 * rule-ownership appendix（IR 別関連マッピング）の表行を生成する。
 * 形式: `| IR-001 | title | REQ-0108-001, REQ-0101 | integrity-contracts.md |`
 */
function formatRuleOwnershipLine(info: IrInfo): string {
  const reqCell = info.relatedReq.length > 0 ? info.relatedReq.join(", ") : "-";
  const specCell =
    info.relatedDesign.length > 0 ? info.relatedDesign.join(", ") : "-";
  // 表セル内のパイプを回避するため改行・パイプを空白へ置換。
  const safeTitle = info.title.replace(/\|/g, "/").replace(/\n/g, " ");
  return `| ${info.id} | ${safeTitle} | ${reqCell} | ${specCell} |`;
}

export function generateRuleOwnershipAppendix(infos: IrInfo[]): string[] {
  const lines: string[] = [];
  lines.push("| IR ID | title | Related REQ | Related Design |");
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
    const beginId = extractAutogenBeginId(line!);
    if (beginId !== null) {
      const startLine = i;
      const body: string[] = [];
      let j = i + 1;
      while (j < lines.length && !isAutogenEndLine(lines[j]!)) {
        body.push(lines[j]!);
        j++;
      }
      if (j >= lines.length) {
        // 終了マーカー不在は壊れた状態。読み飛ばす。
        i++;
        continue;
      }
      blocks.push({
        id: beginId,
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
export function replaceAutogenBlock(
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
    if (extractAutogenBeginId(line!) === id && !replaced) {
      // 開始マーカー → newBody → 終了マーカーへ置換。
      out.push(line!);
      for (const bodyLine of newBody) {
        out.push(bodyLine);
      }
      // 終了マーカーまで進める。
      let j = i + 1;
      while (j < lines.length && !isAutogenEndLine(lines[j]!)) {
        j++;
      }
      if (j < lines.length) {
        out.push(lines[j]!);
        i = j + 1;
        replaced = true;
      } else {
        // 終了マーカー不在。残りを出力して終了。
        i = i + 1;
        replaced = true;
      }
    } else {
      out.push(line!);
      i++;
    }
  }
  return out.join("\n");
}

// ─── REQ collector (AG-009) ─────────────────────────────────────────────────

/**
 * REQ メタデータ（AG-009 REQ README 自動生成の source）。
 */
export interface ReqInfo {
  /** REQ ID（例: "REQ-0101"）。 */
  id: string;
  /** REQ 数値部（例: 101）。 */
  num: number;
  /** frontmatter title。 */
  title: string;
  /** ファイル名（例: "REQ-0101.md"）。 */
  filename: string;
  /** README からの相対リンクパス。 */
  relPath: string;
}

// ─── Decision collector (DEC-009) ───────────────────────────────────────────

/**
 * Decision メタデータ（docs/decisions/README.md の decision-* AUTOGEN block 生成源）。
 * DEC-009（ADR から Decision への正規成果物モデル移行）に基づく現行モデル。
 * frontmatter から id/title/status/created を抽出する。
 */
export interface DecisionInfo {
  /** Decision ID（例: "DEC-001"）。 */
  id: string;
  /** Decision 数値部（例: 1）。ソート用。 */
  num: number;
  /** frontmatter title（例: "AgentDevFlow 憲章"）。 */
  title: string;
  /** frontmatter status（例: "accepted"）。 */
  status: string;
  /** frontmatter created（例: "2026-07-24"）。 */
  created: string;
  /** ファイル名（例: "DEC-001.md"）。 */
  filename: string;
  /**
   * README からの相対リンクパス。
   * 現行 Decision: "DEC-001.md"、retired Decision: "retired/DEC-001.md"
   */
  relPath: string;
  /**
   * frontmatter related_reqs（REQ-059-001）。
   * 未宣言（フィールド欠落）は REQ-059-003 の機械検出対象であり正規状態ではないため、
   * 空宣言（[]）と区別して null で表現する。
   */
  relatedReqs: string[] | null;
  /**
   * frontmatter superseded_by（例: "DEC-037"）。superseded 以外または未宣言は null。
   */
  supersededBy: string | null;
  /**
   * frontmatter supersede_note（部分置換注記の本文、例: "決定4 は DEC-037 が置換。決定1〜3は維持"）。
   * 未宣言は null。
   */
  supersedeNote: string | null;
}

/**
 * DEC-*.md からメタデータを抽出する。
 * 桁数はファイル名由来のまま維持する（ADR 系 collector と同一規則）。
 */
function extractDecisionInfo(
  fullPath: string,
  relPath: string,
): DecisionInfo | null {
  const content = readText(fullPath);
  if (!content) return null;

  const filename = path.basename(fullPath);
  const idMatch = filename.match(/^DEC-(\d+)\.md$/);
  if (!idMatch) return null;
  const num = Number(idMatch[1]);
  const id = `DEC-${idMatch[1]}`;

  const fm = parseFrontmatter(content);
  let title = "";
  let status = "";
  let created = "";
  let relatedReqs: string[] | null = null;
  let supersededBy: string | null = null;
  let supersedeNote: string | null = null;
  if (fm) {
    if (typeof fm["title"] === "string") title = fm["title"];
    if (typeof fm["status"] === "string") status = fm["status"];
    if (typeof fm["created"] === "string") created = fm["created"];
    const rr = fm["related_reqs"];
    if (Array.isArray(rr)) relatedReqs = rr;
    else if (typeof rr === "string") relatedReqs = [rr];
    if (typeof fm["superseded_by"] === "string") {
      supersededBy = fm["superseded_by"];
    }
    if (typeof fm["supersede_note"] === "string") {
      supersedeNote = fm["supersede_note"];
    }
  }
  // title が frontmatter に無い場合は H1 から抽出（フォールバック）。
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      const h1 = h1Match[1]!.trim();
      const colonIdx = h1.indexOf(":");
      title = colonIdx !== -1 ? h1.slice(colonIdx + 1).trim() : h1;
    }
  }

  return {
    id,
    num,
    title,
    status,
    created,
    filename,
    relPath,
    relatedReqs,
    supersededBy,
    supersedeNote,
  };
}

/**
 * docs/decisions/ 配下の DEC-*.md を収集し、番号順に返す。
 */
export function collectDecisionFiles(decisionsDir: string): DecisionInfo[] {
  const files = listFiles(decisionsDir).filter((f) => /^DEC-\d+\.md$/.test(f));
  const infos: DecisionInfo[] = [];
  for (const f of files) {
    const fullPath = path.join(decisionsDir, f);
    const info = extractDecisionInfo(fullPath, f);
    if (info) infos.push(info);
  }
  infos.sort((a, b) => a.num - b.num);
  return infos;
}

function extractReqInfo(
  fullPath: string,
  relPath: string,
): ReqInfo | null {
  const content = readText(fullPath);
  if (!content) return null;

  const filename = path.basename(fullPath);
  const idMatch = filename.match(/^REQ-(\d+)\.md$/);
  if (!idMatch) return null;
  const num = Number(idMatch[1]);
  const id = `REQ-${idMatch[1]}`;

  const fm = parseFrontmatter(content);
  let title = "";
  if (fm) {
    if (typeof fm["title"] === "string") title = fm["title"];
  }
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) title = h1Match[1]!.trim();
  }

  return { id, num, title, filename, relPath };
}

/**
 * docs/requirements/ 配下の REQ-*.md を収集し、番号順に返す。
 */
export function collectReqFiles(reqDir: string): ReqInfo[] {
  const files = listFiles(reqDir).filter((f) => /^REQ-\d+\.md$/.test(f));
  const infos: ReqInfo[] = [];
  for (const f of files) {
    const fullPath = path.join(reqDir, f);
    const info = extractReqInfo(fullPath, f);
    if (info) infos.push(info);
  }
  infos.sort((a, b) => a.num - b.num);
  return infos;
}

/**
 * 表セル内のパイプ・改行を回避する（catalog/rule-ownership 形式と同一）。
 */
function sanitizeTableCell(text: string): string {
  return text.replace(/\|/g, "/").replace(/\n/g, " ");
}

// ─── AG-008: Decision README 生成 (DEC-009) ─────────────────────────────────

// docs/decisions/README.md 内の AUTOGEN block ID。
// index-auto-generation Design「AUTOGEN block ID 命名パターン」採用 ID 参照例の
// Decision README 系。旧 ADR README（docs/adr/README.md、adr-* block ID 群）は
// DEC-009 で廃止済みであり採用しない。
export const DECISION_BASELINE_COUNT_BLOCK_ID = "decision-baseline-count";
export const DECISION_BASELINE_TABLE_BLOCK_ID = "decision-baseline-table";
export const DECISION_STATUS_ACCEPTED_BLOCK_ID = "decision-status-accepted";
export const DECISION_STATUS_PROPOSED_BLOCK_ID = "decision-status-proposed";
export const DECISION_STATUS_SUPERSEDED_BLOCK_ID =
  "decision-status-superseded";
export const DECISION_STATUS_DEPRECATED_BLOCK_ID =
  "decision-status-deprecated";

// Decision README 関連REQ表（REQ-059-002、REQ-059-003）。
// 混合領域構成: 生成処理は Decision 列と関連REQ列のみ上書きし、
// 「説明」列（人手判断列）は現在の README 内容から抽出して保持する
// （index-auto-generation.md「Decision 関連REQ表の自動生成」）。
export const DECISION_RELATED_REQ_TABLE_BLOCK_ID = "decision-related-req-table";

export function normalizeSupersedeNote(
  note: string | null,
): string | null {
  if (note === null) return null;
  const normalized = note.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : null;
}

/**
 * superseded Decision 行の部分置換注記サフィックス（index-auto-generation.md
 * 「現在稼働している自動生成契約」5「Decision frontmatter の supersede_note 由来の
 * 部分置換注記生成」）。
 *
 * superseded Decision で frontmatter に `supersede_note` フィールドが存在する場合、
 * `superseded_by` と `supersede_note` の両 frontmatter フィールドをデータ源として
 * `〔superseded by DEC-MMM。<note>〕` 形式の注記文字列を返す。
 * status 表（decision-baseline-table）・superseded セクション（decision-status-superseded）
 * 間で同一注記文字列を出力する。
 * supersede_note 未宣言（全体置換等）、空値・空白のみの場合は null を返し、
 * 注記を付与しない（空括弧・区切り文字のみの出力の禁止）。ブロックスカラ由来の
 * 改行を含む内容は正規展開して 1 行注記とする。
 */
export function formatSupersedeNoteSuffix(info: DecisionInfo): string | null {
  if (info.status !== "superseded") return null;
  const note = normalizeSupersedeNote(info.supersedeNote);
  if (note === null) return null;
  const by = info.supersededBy ? `superseded by ${info.supersededBy}。` : "";
  return `〔${by}${note}〕`;
}

/**
 * 現行 Decision の件数表明キャプション（1行）。
 * 形式: "現行の承認済み Decision はN件、提案中の Decision はM件である。"
 */
export function generateDecisionBaselineCaption(
  decisions: DecisionInfo[],
): string[] {
  const accepted = decisions.filter((d) => d.status === "accepted").length;
  const proposed = decisions.filter((d) => d.status === "proposed").length;
  return [
    `現行の承認済み Decision は${accepted}件、提案中の Decision は${proposed}件である。`,
  ];
}

/**
 * 現行 Decision 一覧表（ヘッダー + 全 DEC 行）。
 * ステータス列を持つため accepted 以外（proposed / superseded 等）も全件出力する。
 */
export function generateDecisionBaselineTable(
  decisions: DecisionInfo[],
): string[] {
  const lines: string[] = [];
  lines.push("| Decision番号 | タイトル | ステータス | 作成日 |");
  lines.push("|---------|---------|-----------|--------|");
  for (const info of decisions) {
    const note = formatSupersedeNoteSuffix(info);
    const titleCell = sanitizeTableCell(
      note ? `${info.title}${note}` : info.title,
    );
    lines.push(
      `| ${info.id} | ${titleCell} | ${info.status} | ${info.created} |`,
    );
  }
  return lines;
}

/**
 * ステータス別リスト（bullet 形式）。
 * 形式: "- [DEC-001](DEC-001.md)（title）"
 */
export function generateDecisionStatusList(
  decisions: DecisionInfo[],
  status: string,
): string[] {
  return decisions
    .filter((d) => d.status === status)
    .map((info) => {
      const base = `- [${info.id}](${info.relPath})（${info.title}）`;
      const note = formatSupersedeNoteSuffix(info);
      return note ? `${base}${note}` : base;
    });
}

// ─── Decision 関連REQ表生成 (REQ-059-002) ──────────────────────────────────

/**
 * 関連REQ列のセル（frontmatter related_reqs 由来）。空宣言は "-"。
 */
export function formatRelatedReqCell(relatedReqs: string[]): string {
  if (relatedReqs.length === 0) return "-";
  return relatedReqs
    .map((reqId) => `[${reqId}](../requirements/${reqId}.md)`)
    .join(", ");
}

/**
 * 現在の README 内容の「## 関連 REQ」セクション表から DEC ID → 説明列 を抽出する。
 * 説明列は frontmatter から導出できない人手判断列のため、AUTOGEN ブロック囲みの
 * 有無に依存せず見出しスコープで抽出する（初回 AUTOGEN 化時の手動表取り込み対応）。
 */
export function extractRelatedReqNotes(
  readmeContent: string,
): Record<string, string> {
  const notes: Record<string, string> = {};
  const lines = readmeContent.split("\n");
  let inSection = false;
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      inSection = /^##\s+関連 REQ\s*$/.test(line.trim());
      continue;
    }
    if (!inSection) continue;
    const rowMatch = line.match(/^\|\s*(DEC-\d+)\s*\|/);
    if (!rowMatch) continue;
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length >= 4) {
      notes[rowMatch[1]!] = cells[3]!;
    }
  }
  return notes;
}

/**
 * 未宣言（related_reqs フィールド欠落）Decision の検出（REQ-059-003）。
 * 検出は finding であり工程停止条件としない（DEC-001 決定4）。
 */
export function findUndeclaredRelatedReqDecisions(
  decisions: DecisionInfo[],
): DecisionInfo[] {
  return decisions.filter((d) => d.relatedReqs === null);
}

/**
 * Decision 関連REQ表（混合領域構成）。
 * Decision 列と関連REQ列を frontmatter から生成し、「説明」列は notes（現在 README
 * の人手判断列）を優先して保持する。notes に存在しない行（新規 Decision 等）は "-"。
 */
export function generateDecisionRelatedReqTable(
  decisions: DecisionInfo[],
  notes: Record<string, string>,
): string[] {
  const lines: string[] = [];
  lines.push("| Decision | 関連REQ | 説明 |");
  lines.push("|-----|---------|------|");
  for (const info of decisions) {
    const cell = formatRelatedReqCell(info.relatedReqs ?? []);
    const note = sanitizeTableCell(notes[info.id] ?? "-");
    lines.push(`| ${info.id} | ${cell} | ${note} |`);
  }
  return lines;
}

// ─── AG-009: REQ README 生成 ─────────────────────────────────────────────────

export const REQ_ACTIVE_COUNT_BLOCK_ID = "req-active-count";
export const REQ_ACTIVE_TABLE_BLOCK_ID = "req-active-table";

/**
 * 現行要件の件数表明キャプション（1行）。
 * 形式: "現在の要件判断では、以下N件を第一参照先とする。"
 */
export function generateReqActiveCaption(activeReqs: ReqInfo[]): string[] {
  return [
    `現在の要件判断では、以下${activeReqs.length}件を第一参照先とする。`,
  ];
}

/**
 * 現行要件一覧表（ヘッダー + active REQ 行）。関心対象列は hand-curated のため
 * AG-009 では REQ ID + タイトルの 2 列自動生成とする（SC-002 混合領域許容）。
 */
export function generateReqActiveTable(
  activeReqs: ReqInfo[],
  linkPrefix = "",
): string[] {
  const lines: string[] = [];
  lines.push("| REQ ID | タイトル |");
  lines.push("|---|---|");
  for (const info of activeReqs) {
    lines.push(
      `| [${info.id}](${linkPrefix}${info.relPath}) | ${sanitizeTableCell(info.title)} |`,
    );
  }
  return lines;
}

// ─── AG-006候補2: docs/README.md 件数表明 (Phase E 残) ────────────────────────

export const README_REQ_SUMMARY_COUNT_BLOCK_ID = "readme-req-summary-count";
export const README_REQ_SUMMARY_TABLE_BLOCK_ID = "readme-req-summary-table";

/**
 * docs/README.md「要件」セクション冒頭の件数表明 AUTOGEN ブロック本体（1行）。
 * 形式: "REQ: N件"
 *
 * docs/README.md は入口文書であり、REQ 詳細一覧は docs/requirements/README.md へ誘導する。
 * 件数表明のみを AUTOGEN 化し、続く説明文（範囲、関連 ADR 等）は人手編集領域として残置する
 * （SC-002 Design「件数表明」自動生成原則、Wave 5 Phase E 残）。
 */
export function generateReadmeReqSummaryCount(args: {
  activeReqCount: number;
}): string[] {
  return [`REQ: ${args.activeReqCount}件`];
}

// ─── AG-005: docs/README.md Decision 静的表生成 ──────────────────────────────

// docs/README.md「## Decision」セクションの Decision 静的表 AUTOGEN block ID
// （index-auto-generation.md「AUTOGEN block ID 命名パターン」採用 ID 参照例）。
export const README_DECISION_SUMMARY_TABLE_BLOCK_ID =
  "readme-decision-summary-table";

/**
 * docs/README.md Decision 静的表（readme-decision-summary-table）の生成本体。
 * 「superseded by DEC-XXX」括弧注記は index-auto-generation.md「docs/README.md
 * Decision 静的表の AUTOGEN 生成」rule 6 の恒常規則に従う。
 * 適用条件は `superseded_by` frontmatter を持つ全 DEC 行（status によらない）、
 * 注記文言のデータ源は `superseded_by` と `supersede_note` の両 frontmatter
 * フィールドである。`supersede_note` を持つ DEC 行は、その内容を notes 記法〔...〕の
 * 部分置換詳細注記として title 直後に展開する。
 * 表上部の件数 caption は生成対象外の手動残置（AG-005 既知限界）。
 */
export function generateDocsReadmeDecisionTable(
  decisions: DecisionInfo[],
): string[] {
  const lines: string[] = [];
  lines.push("| Decision | タイトル |");
  lines.push("|---|---|");
  for (const info of decisions) {
    let titleCell = sanitizeTableCell(info.title);
    if (info.supersededBy) {
      const note = normalizeSupersedeNote(info.supersedeNote);
      const notePart = note !== null ? `〔${sanitizeTableCell(note)}〕` : "";
      titleCell += `（superseded by ${info.supersededBy}${notePart}）`;
    }
    lines.push(`| [${info.id}](decisions/${info.relPath}) | ${titleCell} |`);
  }
  return lines;
}

/**
 * 対象ドキュメント群の最終コミット日付（YYYY-MM-DD）を導出する（SC-002「計測日導出」）。
 *
 * `git log -1 --format=%cI -- <paths...>` で対象群のいずれかに触った最終コミット
 * （= 各ファイル最終コミット日付の最大値）を取得し、その ISO 8601 日付部
 * （コミットタイムゾーン基準）を返す。実行環境のタイムゾーンや実行時日付
 * （`new Date()`）に依存しないため、ドキュメント群に実変更がない限り計測日を含む
 * AUTOGEN ブロックは鮮度を失わない（IR-061 日次再検出の構造的解消）。
 *
 * 導出不能時（git コマンド失敗、対象パスへのコミット実績なし）は null を返す。
 * 呼び出し元は null を検知した場合に生成・検査を失敗扱いとする。
 */
export function deriveMeasureDateFromLastCommit(
  root: string,
  absPaths: string[],
): string | null {
  if (absPaths.length === 0) return null;
  const { execFileSync } = require("child_process") as typeof import("child_process");
  const relPaths = absPaths.map((p) =>
    path.relative(root, p).replace(/\\/g, "/"),
  );
  // パスを分割実行して Windows コマンドライン長制限を回避する。パスは OR 条件の
  // ため、チャンクごとの最大値（ISO 日付の辞書順比較）の全体最大が群の最終コミット日付。
  const CHUNK_SIZE = 100;
  let latest: string | null = null;
  for (let i = 0; i < relPaths.length; i += CHUNK_SIZE) {
    const chunk = relPaths.slice(i, i + CHUNK_SIZE);
    let out: string;
    try {
      out = execFileSync(
        "git",
        ["log", "-1", "--format=%cI", "--", ...chunk],
        { cwd: root, encoding: "utf-8" },
      ) as string;
    } catch {
      return null;
    }
    const match = out.trim().match(/^(\d{4}-\d{2}-\d{2})T/);
    if (!match) continue;
    if (latest === null || match[1]! > latest) latest = match[1]!;
  }
  return latest;
}

// ─── main ──────────────────────────────────────────────────────────────────

/**
 * セクション入力の不存在時の扱いを本体 / 導入先で分岐する。
 * 本体（rules dir 存在 = IR 管理対象）では従来どおり fail-fast で異常終了し、
 * 導入先（rules dir 不在）では IR-061 と同一の適用範囲（マーカー不在 =
 * 検証対象外）でスキップを記録して継続する（自動生成領域を持たない索引ファイルは
 * 導入先として正常な状態である）。
 */
function skipOrExit(hasIntegrityStructure: boolean, message: string): void {
  if (hasIntegrityStructure) {
    console.error(`[generate_indexes] ${message}`);
    process.exit(EXIT_ERROR);
  }
  console.log(
    `[generate_indexes] ${message} (integrity structure absent, skipping)`,
  );
}

/** content 内に存在しない AUTOGEN block ID の一覧を返す（全て存在すれば空配列）。 */
function missingAutogenIds(
  content: string,
  expectedIds: readonly string[],
): string[] {
  const foundIds = new Set(findAutogenBlocks(content).map((b) => b.id));
  return expectedIds.filter((id) => !foundIds.has(id));
}

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
    // ヘルプテキストを標準形式で表示（exit 0）。
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

TARGET FILES (SC-002 Phase C):
  Wave 1:
    - docs/designs/integrity/integrity-rule-catalog.md (catalog IR entries)
    - docs/designs/integrity/rule-ownership.md (IR cross-reference appendix)
  Wave 2 (AG-008/009, DEC-009):
  - docs/decisions/README.md (decision-* blocks; skipped when absent)
    - docs/requirements/README.md (active REQ tables)
  Wave 5 (Phase E 残):
    - docs/README.md (REQ count summary + detailed table, readme-req-summary-*)

GENERATION SOURCE:
  - docs/designs/integrity/rules/IR-*.md (frontmatter + body Field/Value table)
  - docs/decisions/DEC-*.md (frontmatter; DEC-009)
  - docs/requirements/REQ-*.md (frontmatter)
  - docs/designs/**/*.md (file count, frontmatter status)

RELATED:
  - Design: docs/designs/integrity/index-auto-generation.md (SC-002)
  - IR:   docs/designs/integrity/rules/IR-061-index-generation-consistency.md
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
    "docs", "designs",
    "integrity",
    "rules",
  );
  const catalogPath = path.join(
    root,
    "docs", "designs",
    "integrity",
    "integrity-rule-catalog.md",
  );
  const ruleOwnershipPath = path.join(
    root,
    "docs", "designs",
    "integrity",
    "rule-ownership.md",
  );
  const reqImpactMapPath = path.join(
    root, "docs", "designs", "responsibilities", "req-impact-map.md",
  );
  const skillProjectionManifestPath = path.join(
    root, ...SKILL_PROJECTION_MANIFEST_REL.split("/"),
  );
  const sourceSkillsDir = path.join(root, "src", "common", "skills");
  const decisionsDir = path.join(root, "docs", "decisions");
  const reqDir = path.join(root, "docs", "requirements");
  const decisionReadmePath = path.join(decisionsDir, "README.md");
  const reqReadmePath = path.join(reqDir, "README.md");

  // IR 管理対象判定: rules dir の存在は check_integrity.ts
  // checkIndexGenerationConsistency（IR-061）が既に使用する同一の存在条件である。
  // 本体（producer, rules dir 存在）では従来どおり全セクション必須の fail-fast を
  // 維持する。導入先（consumer, rules dir 不在）では integrity 系セクションを
  // スキップし、AUTOGEN 領域を保持するファイルのみを再生成する（IR-061 exemption
  // 「自動生成マーカーが存在しないファイルは検証対象外」と同一の適用範囲。
  // REQ-029-001: 配布成果物は producer 内部依存に依存しない）。
  //
  // ただし rules dir 不在でも catalog / rule-ownership が残存する場合は
  // consumer と分類しない。両ファイルは producer モードでは必須成果物であり、
  // 導入先（REQ-029: integrity 構造は producer 内部成果物）には存在しないため、
  // この残存は producer 側 integrity 構造の部分欠損を示す。consumer と誤分類すると
  // 全 fail-fast が skip 記録に退化し exit 0 で正常終了するため、rules dir 不在時の
  // 旧実装（#3898以前）と同一の fail-closed（exit 2）を維持する。
  const hasIntegrityStructure = fs.existsSync(rulesDir);
  if (
    !hasIntegrityStructure &&
    (fs.existsSync(catalogPath) || fs.existsSync(ruleOwnershipPath))
  ) {
    console.error(`[generate_indexes] rules dir not found: ${rulesDir}`);
    process.exit(EXIT_ERROR);
  }
  const infos = hasIntegrityStructure ? collectIrFiles(rulesDir) : [];
  if (hasIntegrityStructure && infos.length === 0) {
    console.error(`[generate_indexes] no IR-*.md files found in ${rulesDir}`);
    process.exit(EXIT_ERROR);
  }

  const decisionInfos = collectDecisionFiles(decisionsDir);
  const reqInfos = collectReqFiles(reqDir);

  const decisionBaselineCaption = generateDecisionBaselineCaption(
    decisionInfos,
  );
  const decisionBaselineTable = generateDecisionBaselineTable(decisionInfos);
  const decisionStatusAccepted = generateDecisionStatusList(
    decisionInfos,
    "accepted",
  );
  const decisionStatusProposed = generateDecisionStatusList(
    decisionInfos,
    "proposed",
  );
  const decisionStatusSuperseded = generateDecisionStatusList(
    decisionInfos,
    "superseded",
  );
  const decisionStatusDeprecated = generateDecisionStatusList(
    decisionInfos,
    "deprecated",
  );
  const reqActiveCaption = generateReqActiveCaption(reqInfos);
  const reqActiveTable = generateReqActiveTable(reqInfos);

  const readmeReqSummary = generateReadmeReqSummaryCount({
    activeReqCount: reqInfos.length,
  });

  // integrity 系の生成ブロックは rules dir が存在する場合のみ生成する。
  // カタログは rules レジストリから生成する（DEC-065 決定3 単一ソース）。
  // rules レジストリはカタログ生成源（DEC-065 決定3）。main 実行時の遅延 import
  // により、rules/index.ts ↔ generate_indexes.ts の静的循環 import を避ける
  // （ir-061.ts が generate_indexes.ts を静的 import するため）。
  const { rules: registryRules } = await import("../rules/index.ts");
  const catalogEntries = hasIntegrityStructure
    ? generateCatalogEntries(registryRules)
    : [];
  const ruleOwnershipLines = hasIntegrityStructure
    ? generateRuleOwnershipAppendix(infos)
    : [];

  const updates: { file: string; content: string }[] = [];

  if (hasIntegrityStructure) {
    // catalog 更新
    const catalogOriginal = readText(catalogPath);
    if (catalogOriginal === null) {
      console.error(`[generate_indexes] catalog not found: ${catalogPath}`);
      process.exit(EXIT_ERROR);
    }
    let catalogUpdated = catalogOriginal;
    const catalogBlocks = findAutogenBlocks(catalogOriginal).filter(
      (b) => b.id === CATALOG_BLOCK_ID,
    );
    if (catalogBlocks.length === 0) {
      console.error(
        `[generate_indexes] catalog AUTOGEN markers not found. ` +
          `Expected id: ${CATALOG_BLOCK_ID}`,
      );
      process.exit(EXIT_ERROR);
    }
    catalogUpdated = replaceAutogenBlock(
      catalogUpdated,
      CATALOG_BLOCK_ID,
      catalogEntries,
    );
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
    const ruleOwnershipBlocks = findAutogenBlocks(
      ruleOwnershipOriginal,
    ).filter((b) => b.id === RULE_OWNERSHIP_BLOCK_ID);
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

    // req-impact-map 逆方向対応（REQ → 影響する Rule IDs）の AUTOGEN 更新（B3-1）。
    // ファイル不在・マーカー不在時は人手編集領域として扱い、変更せず記録する
    // （他 README 系と同一の扱い。fail-fast しない）。
    const reqImpactMapOriginal = readText(reqImpactMapPath);
    if (reqImpactMapOriginal === null) {
      console.log(
        `[generate_indexes] req-impact-map not found, skipping: ${reqImpactMapPath}`,
      );
    } else {
      const reqImpactMapBlocks = findAutogenBlocks(reqImpactMapOriginal).filter(
        (b) => b.id === REQ_IMPACT_MAP_BLOCK_ID,
      );
      if (reqImpactMapBlocks.length === 0) {
        console.log(
          `[generate_indexes] req-impact-map AUTOGEN marker not found, skipping: ${REQ_IMPACT_MAP_BLOCK_ID}`,
        );
      } else {
        const reqImpactMapLines = generateReqImpactMapCrossref(infos, reqInfos);
        const reqImpactMapUpdated = replaceAutogenBlock(
          reqImpactMapOriginal,
          REQ_IMPACT_MAP_BLOCK_ID,
          reqImpactMapLines,
        );
        if (reqImpactMapUpdated !== reqImpactMapOriginal) {
          updates.push({
            file: reqImpactMapPath,
            content: reqImpactMapUpdated,
          });
        }
      }
    }
  } else {
    console.log(
      `[generate_indexes] integrity catalog / rule-ownership not found, skipping (integrity structure absent)`,
    );
  }

  // skill-projection-manifest.yaml の skills セクション再生成（B3-3）。
  // 正規情報源（src/common/skills 列挙）から導出し、third_party_skills と
  // ヘッダーは既存内容を保持する。manifest 不在時はスキップ（導入先に manifest は
  // 存在しない。IR-068 検査の skip 挙動と同一の適用範囲）。
  const manifestOriginal = readText(skillProjectionManifestPath);
  if (manifestOriginal === null) {
    console.log(
      `[generate_indexes] skill-projection-manifest not found, skipping: ${skillProjectionManifestPath}`,
    );
  } else if (!fs.existsSync(sourceSkillsDir)) {
    console.log(
      `[generate_indexes] src/common/skills not found, manifest regeneration skipped`,
    );
  } else {
    const skills = deriveSkillProjectionManifestSkills(sourceSkillsDir);
    const generatedAt =
      deriveMeasureDateFromLastCommit(root, [sourceSkillsDir]) ??
      new Date().toISOString().slice(0, 10);
    let manifestUpdated = replaceSkillProjectionManifestSkills(
      manifestOriginal,
      skills,
    );
    manifestUpdated = replaceSkillProjectionManifestGeneratedAt(
      manifestUpdated,
      generatedAt,
    );
    if (manifestUpdated !== manifestOriginal) {
      updates.push({
        file: skillProjectionManifestPath,
        content: manifestUpdated,
      });
    }
    if (options.dryRun) {
      console.log(
        `[generate_indexes] skill-projection-manifest: ${skills.length} skills derived from src/common/skills`,
      );
    }
  }

  // Decision README 更新 (AG-008 / DEC-009)。対象ファイル不存在時はスキップ。
  const decisionReadmeOriginal = readText(decisionReadmePath);
  if (decisionReadmeOriginal === null) {
    console.log(
      `[generate_indexes] Decision README not found, skipping: ${decisionReadmePath}`,
    );
  } else {
    const decisionReadmeExpectedIds = [
      DECISION_BASELINE_COUNT_BLOCK_ID,
      DECISION_BASELINE_TABLE_BLOCK_ID,
      DECISION_STATUS_ACCEPTED_BLOCK_ID,
      DECISION_STATUS_PROPOSED_BLOCK_ID,
      DECISION_STATUS_SUPERSEDED_BLOCK_ID,
      DECISION_STATUS_DEPRECATED_BLOCK_ID,
      DECISION_RELATED_REQ_TABLE_BLOCK_ID,
    ];
    const decisionReadmeMissing = missingAutogenIds(
      decisionReadmeOriginal,
      decisionReadmeExpectedIds,
    );
    if (decisionReadmeMissing.length > 0) {
      skipOrExit(
        hasIntegrityStructure,
        `Decision README AUTOGEN markers not found: ${decisionReadmeMissing.join(", ")}`,
      );
    }
    // 欠落マーカーがあっても、存在する AUTOGEN 領域は独立に再生成する
    // （PR #3898 本文「マーカーがあれば通常再生成」。部分マーカーで
    // 既存領域の陳腐化を残さない）。replaceAutogenBlock は未検出 block を
    // unchanged で返すため、欠落分は書込み差分にならない。
    const relatedReqNotes = extractRelatedReqNotes(decisionReadmeOriginal);
    const decisionRelatedReqTable = generateDecisionRelatedReqTable(
      decisionInfos,
      relatedReqNotes,
    );
    let decisionReadmeUpdated = decisionReadmeOriginal;
    const decisionReadmeReplacements: Record<string, string[]> = {
      [DECISION_BASELINE_COUNT_BLOCK_ID]: decisionBaselineCaption,
      [DECISION_BASELINE_TABLE_BLOCK_ID]: decisionBaselineTable,
      [DECISION_STATUS_ACCEPTED_BLOCK_ID]: decisionStatusAccepted,
      [DECISION_STATUS_PROPOSED_BLOCK_ID]: decisionStatusProposed,
      [DECISION_STATUS_SUPERSEDED_BLOCK_ID]: decisionStatusSuperseded,
      [DECISION_STATUS_DEPRECATED_BLOCK_ID]: decisionStatusDeprecated,
      [DECISION_RELATED_REQ_TABLE_BLOCK_ID]: decisionRelatedReqTable,
    };
    for (const blockId of decisionReadmeExpectedIds) {
      decisionReadmeUpdated = replaceAutogenBlock(
        decisionReadmeUpdated,
        blockId,
        decisionReadmeReplacements[blockId]!,
      );
    }
    if (decisionReadmeUpdated !== decisionReadmeOriginal) {
      updates.push({
        file: decisionReadmePath,
        content: decisionReadmeUpdated,
      });
    }
  }

  // REQ README 更新 (AG-009)。マーカー欠落は IR-061 と同一の取り扱い
  // （マーカー不在 = 検証対象外）で記録し、本体では従来どおり fail-fast。
  // 欠落があっても存在する AUTOGEN 領域は独立に再生成する。
  const reqReadmeOriginal = readText(reqReadmePath);
  if (reqReadmeOriginal === null) {
    skipOrExit(hasIntegrityStructure, `REQ README not found: ${reqReadmePath}`);
  } else {
    const reqReadmeExpectedIds = [
      REQ_ACTIVE_COUNT_BLOCK_ID,
      REQ_ACTIVE_TABLE_BLOCK_ID,
    ];
    const reqReadmeMissing = missingAutogenIds(
      reqReadmeOriginal,
      reqReadmeExpectedIds,
    );
    if (reqReadmeMissing.length > 0) {
      skipOrExit(
        hasIntegrityStructure,
        `REQ README AUTOGEN markers not found: ${reqReadmeMissing.join(", ")}`,
      );
    }
    // 欠落マーカーがあっても、存在する AUTOGEN 領域は独立に再生成する
    // （PR #3898 本文「マーカーがあれば通常再生成」。部分マーカーで
    // 既存領域の陳腐化を残さない）。
    let reqReadmeUpdated = reqReadmeOriginal;
    const reqReadmeReplacements: Record<string, string[]> = {
      [REQ_ACTIVE_COUNT_BLOCK_ID]: reqActiveCaption,
      [REQ_ACTIVE_TABLE_BLOCK_ID]: reqActiveTable,
    };
    for (const blockId of reqReadmeExpectedIds) {
      reqReadmeUpdated = replaceAutogenBlock(
        reqReadmeUpdated,
        blockId,
        reqReadmeReplacements[blockId]!,
      );
    }
    if (reqReadmeUpdated !== reqReadmeOriginal) {
      updates.push({ file: reqReadmePath, content: reqReadmeUpdated });
    }
  }

  // docs/README.md 更新 (Phase E 残, Wave 5 / REQ-057-018 readme-req-summary-table)
  const docsReadmePath = path.join(root, "docs", "README.md");
  const docsReadmeOriginal = readText(docsReadmePath);
  if (docsReadmeOriginal === null) {
    skipOrExit(
      hasIntegrityStructure,
      `docs/README.md not found: ${docsReadmePath}`,
    );
  } else {
    const docsReadmeExpectedIds = [
      README_REQ_SUMMARY_COUNT_BLOCK_ID,
      README_REQ_SUMMARY_TABLE_BLOCK_ID,
      README_DECISION_SUMMARY_TABLE_BLOCK_ID,
    ];
    const docsReadmeMissing = missingAutogenIds(
      docsReadmeOriginal,
      docsReadmeExpectedIds,
    );
    if (docsReadmeMissing.length > 0) {
      skipOrExit(
        hasIntegrityStructure,
        `docs/README.md AUTOGEN markers not found: ${docsReadmeMissing.join(", ")}`,
      );
    }
    // 欠落マーカーがあっても、存在する AUTOGEN 領域は独立に再生成する
    // （他 README セクションと同一の扱い）。
    let docsReadmeUpdated = docsReadmeOriginal;
    const docsReadmeReplacements: Record<string, string[]> = {
      [README_REQ_SUMMARY_COUNT_BLOCK_ID]: readmeReqSummary,
      [README_REQ_SUMMARY_TABLE_BLOCK_ID]: generateReqActiveTable(
        reqInfos,
        "requirements/",
      ),
      [README_DECISION_SUMMARY_TABLE_BLOCK_ID]: generateDocsReadmeDecisionTable(
        decisionInfos,
      ),
    };
    for (const blockId of docsReadmeExpectedIds) {
      docsReadmeUpdated = replaceAutogenBlock(
        docsReadmeUpdated,
        blockId,
        docsReadmeReplacements[blockId]!,
      );
    }
    if (docsReadmeUpdated !== docsReadmeOriginal) {
      updates.push({ file: docsReadmePath, content: docsReadmeUpdated });
    }
  }

  if (options.dryRun) {
    if (hasIntegrityStructure) {
      console.log(
        `[generate_indexes] dry-run: ${infos.length} IR files collected`,
      );
      console.log(
        `[generate_indexes] catalog entries: ${catalogEntries.length} entries`,
      );
      console.log(
        `[generate_indexes] catalog source: rules registry (single source),`,
      );
      console.log(
        `[generate_indexes] rule-ownership appendix: ${ruleOwnershipLines.length} rows (incl. header)`,
      );
    }
    console.log(
      `[generate_indexes] Decision README: ${decisionInfos.length} decisions`,
    );
    console.log(
      `[generate_indexes] REQ README: ${reqInfos.length} REQs`,
    );
    console.log(
      `[generate_indexes] docs/README.md: REQ summary=${reqInfos.length}, table=${reqActiveTable.length - 2} rows, Decision table=${decisionInfos.length} rows`,
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
