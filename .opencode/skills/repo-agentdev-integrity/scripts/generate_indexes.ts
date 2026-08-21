// ADF-COVERS(implementation): REQ-010-011
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
} from "./cli_utils.ts";

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
  return match ? match[1] : null;
}

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
    const h1 = h1Match[1].trim();
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
    const beginId = extractAutogenBeginId(line);
    if (beginId !== null) {
      const startLine = i;
      const body: string[] = [];
      let j = i + 1;
      while (j < lines.length && !isAutogenEndLine(lines[j])) {
        body.push(lines[j]);
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
    if (extractAutogenBeginId(line) === id && !replaced) {
      // 開始マーカー → newBody → 終了マーカーへ置換。
      out.push(line);
      for (const bodyLine of newBody) {
        out.push(bodyLine);
      }
      // 終了マーカーまで進める。
      let j = i + 1;
      while (j < lines.length && !isAutogenEndLine(lines[j])) {
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

// ─── ADR / REQ collector (AG-008 / AG-009 / AG-013) ──────────────────────────

/**
 * ADR メタデータ（AG-008 ADR README 自動生成の_source）。
 * frontmatter から id/title/status/created を抽出する。
 */
export interface AdrInfo {
  /** ADR ID（例: "ADR-0101"）。 */
  id: string;
  /** ADR 数値部（例: 101）。ソート用。 */
  num: number;
  /** frontmatter title（例: "AgentDevFlow プラグイン名前空間の統一"）。 */
  title: string;
  /** frontmatter status（例: "accepted"）。 */
  status: string;
  /** frontmatter created（例: "2026-06-08"）。 */
  created: string;
  /** ファイル名（例: "ADR-0101.md"）。 */
  filename: string;
  /**
   * README からの相対リンクパス。
   * active ADR: "ADR-0101.md"
   * retired ADR: "retired/ADR-0001.md"（adrDir からの相対）
   */
  relPath: string;
}

/**
 * REQ メタデータ（AG-009 REQ README / AG-013 DOC-MAP 自動生成の source）。
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

/**
 * ADR-*.md からメタデータを抽出する。
 * retiredDirFromAdr: retired ファイルの場合 "retired/" prefix を付与（active は空文字）。
 */
function extractAdrInfo(
  fullPath: string,
  relPath: string,
): AdrInfo | null {
  const content = readText(fullPath);
  if (!content) return null;

  const filename = path.basename(fullPath);
  const idMatch = filename.match(/^ADR-(\d+)\.md$/);
  if (!idMatch) return null;
  const num = Number(idMatch[1]);
  // 桁数をそのまま維持する。現行契約は3桁（ADR-001..ADR-999）、履歴 v2 は4桁（ADR-0001..）。
  // padStart(4) で揃えると ADR-001 が ADR-0001 へ書き換わり契約衝突する。
  const id = `ADR-${idMatch[1]}`;

  const fm = parseFrontmatter(content);
  let title = "";
  let status = "";
  let created = "";
  if (fm) {
    if (typeof fm["title"] === "string") title = fm["title"];
    if (typeof fm["status"] === "string") status = fm["status"];
    if (typeof fm["created"] === "string") created = fm["created"];
  }
  // title が frontmatter に無い場合は H1 から抽出（フォールバック）。
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      const h1 = h1Match[1].trim();
      const colonIdx = h1.indexOf(":");
      title = colonIdx !== -1 ? h1.slice(colonIdx + 1).trim() : h1;
    }
  }

  return { id, num, title, status, created, filename, relPath };
}

/**
 * docs/adr/ 配下の ADR-*.md を収集し、番号順に返す（retired/ 除く）。
 */
export function collectAdrFiles(adrDir: string): AdrInfo[] {
  const files = listFiles(adrDir).filter((f) => /^ADR-\d+\.md$/.test(f));
  const infos: AdrInfo[] = [];
  for (const f of files) {
    const fullPath = path.join(adrDir, f);
    const info = extractAdrInfo(fullPath, f);
    if (info) infos.push(info);
  }
  infos.sort((a, b) => a.num - b.num);
  return infos;
}

/**
 * docs/adr/retired/ 配下の ADR-*.md を収集し、番号順に返す。
 */
export function collectRetiredAdrFiles(retiredDir: string): AdrInfo[] {
  const files = listFiles(retiredDir).filter((f) => /^ADR-\d+\.md$/.test(f));
  const infos: AdrInfo[] = [];
  for (const f of files) {
    const fullPath = path.join(retiredDir, f);
    const info = extractAdrInfo(fullPath, `retired/${f}`);
    if (info) infos.push(info);
  }
  infos.sort((a, b) => a.num - b.num);
  return infos;
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
  if (fm) {
    if (typeof fm["title"] === "string") title = fm["title"];
    if (typeof fm["status"] === "string") status = fm["status"];
    if (typeof fm["created"] === "string") created = fm["created"];
  }
  // title が frontmatter に無い場合は H1 から抽出（フォールバック）。
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      const h1 = h1Match[1].trim();
      const colonIdx = h1.indexOf(":");
      title = colonIdx !== -1 ? h1.slice(colonIdx + 1).trim() : h1;
    }
  }

  return { id, num, title, status, created, filename, relPath };
}

/**
 * docs/decisions/ 配下の DEC-*.md を収集し、番号順に返す（retired/ 除く）。
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

/**
 * docs/decisions/retired/ 配下の DEC-*.md を収集し、番号順に返す。
 */
export function collectRetiredDecisionFiles(
  retiredDir: string,
): DecisionInfo[] {
  const files = listFiles(retiredDir).filter((f) => /^DEC-\d+\.md$/.test(f));
  const infos: DecisionInfo[] = [];
  for (const f of files) {
    const fullPath = path.join(retiredDir, f);
    const info = extractDecisionInfo(fullPath, `retired/${f}`);
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
    if (h1Match) title = h1Match[1].trim();
  }

  return { id, num, title, filename, relPath };
}

/**
 * docs/requirements/ 配下の REQ-*.md を収集し、番号順に返す（retired/ 除く）。
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
 * docs/requirements/retired/ 配下の REQ-*.md を収集し、番号順に返す。
 */
export function collectRetiredReqFiles(retiredDir: string): ReqInfo[] {
  const files = listFiles(retiredDir).filter((f) => /^REQ-\d+\.md$/.test(f));
  const infos: ReqInfo[] = [];
  for (const f of files) {
    const fullPath = path.join(retiredDir, f);
    const info = extractReqInfo(fullPath, `retired/${f}`);
    if (info) infos.push(info);
  }
  infos.sort((a, b) => a.num - b.num);
  return infos;
}

// ─── AG-008: ADR README 生成（レガシー: check_integrity.ts IR-061 検査専用）──

// ADR README 内の AUTOGEN ブロック ID。
export const ADR_BASELINE_COUNT_BLOCK_ID = "adr-baseline-count";
export const ADR_BASELINE_TABLE_BLOCK_ID = "adr-baseline-table";
export const ADR_STATUS_ACCEPTED_BLOCK_ID = "adr-status-accepted";
export const ADR_STATUS_PROPOSED_BLOCK_ID = "adr-status-proposed";
export const ADR_STATUS_SUPERSEDED_BLOCK_ID = "adr-status-superseded";
export const ADR_STATUS_DEPRECATED_BLOCK_ID = "adr-status-deprecated";
export const ADR_RETIRED_TABLE_BLOCK_ID = "adr-retired-table";

/**
 * 表セル内のパイプ・改行を回避する（catalog/rule-ownership 形式と同一）。
 */
function sanitizeTableCell(text: string): string {
  return text.replace(/\|/g, "/").replace(/\n/g, " ");
}

/**
 * 現行基盤ビューの件数表明キャプション（1行）。
 * 形式: "現行の承認済み ADR はN件である。"
 * バージョン中立（v2 の ADR-01XX 番号帯を前提としない）。現行 ADR 数は
 * 引数 acceptedAdrs の length から導出する。
 */
export function generateAdrBaselineCaption(
  acceptedAdrs: AdrInfo[],
): string[] {
  return [
    `現行の承認済み ADR は${acceptedAdrs.length}件である。`,
  ];
}

/**
 * 現行基盤ビュー表（ヘッダー + accepted ADR 行）。
 */
export function generateAdrBaselineTable(
  acceptedAdrs: AdrInfo[],
): string[] {
  const lines: string[] = [];
  lines.push("| ADR番号 | タイトル | ステータス | 作成日 |");
  lines.push("|---------|---------|-----------|--------|");
  for (const info of acceptedAdrs) {
    lines.push(
      `| ${info.id} | ${sanitizeTableCell(info.title)} | ${info.status} | ${info.created} |`,
    );
  }
  return lines;
}

/**
 * ステータス別リスト（bullet 形式）。
 * 形式: "- [ADR-0101](ADR-0101.md)（title）"
 */
export function generateAdrStatusList(
  infos: AdrInfo[],
  status: string,
): string[] {
  return infos
    .filter((a) => a.status === status)
    .map(
      (info) => `- [${info.id}](${info.relPath})（${info.title}）`,
    );
}

/**
 * 廃止済み履歴ビュー表（ヘッダー + retired ADR 行）。
 * 引き継ぎ先列は active ADR 側の supersedes 宣言から導出可能だが、
 * retired ADR frontmatter に該当フィールドが無いため本 PR では 3 列生成とする。
 */
export function generateAdrRetiredTable(
  retiredAdrs: AdrInfo[],
): string[] {
  const lines: string[] = [];
  lines.push("| ADR番号 | タイトル | retired時ステータス |");
  lines.push("|---------|---------|-------------------|");
  for (const info of retiredAdrs) {
    lines.push(
      `| [${info.id}](${info.relPath}) | ${sanitizeTableCell(info.title)} | ${info.status} |`,
    );
  }
  return lines;
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
export const DECISION_RETIRED_TABLE_BLOCK_ID = "decision-retired-table";

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
    lines.push(
      `| ${info.id} | ${sanitizeTableCell(info.title)} | ${info.status} | ${info.created} |`,
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
    .map((info) => `- [${info.id}](${info.relPath})（${info.title}）`);
}

/**
 * 廃止済み Decision 履歴ビュー表（ヘッダー + retired DEC 行）。3列構成は
 * ADR 系 retired table と同一（retired frontmatter に引き継ぎ先フィールドが無い）。
 */
export function generateDecisionRetiredTable(
  retiredDecisions: DecisionInfo[],
): string[] {
  const lines: string[] = [];
  lines.push("| Decision番号 | タイトル | retired時ステータス |");
  lines.push("|---------|---------|-------------------|");
  for (const info of retiredDecisions) {
    lines.push(
      `| [${info.id}](${info.relPath}) | ${sanitizeTableCell(info.title)} | ${info.status} |`,
    );
  }
  return lines;
}

// ─── AG-009: REQ README 生成 ─────────────────────────────────────────────────

export const REQ_ACTIVE_COUNT_BLOCK_ID = "req-active-count";
export const REQ_ACTIVE_TABLE_BLOCK_ID = "req-active-table";
export const REQ_RETIRED_TABLE_BLOCK_ID = "req-retired-table";

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
export function generateReqActiveTable(activeReqs: ReqInfo[]): string[] {
  const lines: string[] = [];
  lines.push("| REQ ID | タイトル |");
  lines.push("|---|---|");
  for (const info of activeReqs) {
    lines.push(
      `| [${info.id}](${info.relPath}) | ${sanitizeTableCell(info.title)} |`,
    );
  }
  return lines;
}

/**
 * 廃止済み要件一覧表（ヘッダー + retired REQ 行）。
 */
export function generateReqRetiredTable(retiredReqs: ReqInfo[]): string[] {
  const lines: string[] = [];
  lines.push("| REQ ID | タイトル |");
  lines.push("|---|---|");
  for (const info of retiredReqs) {
    lines.push(
      `| [${info.id}](${info.relPath}) | ${sanitizeTableCell(info.title)} |`,
    );
  }
  return lines;
}

// ─── AG-013: DOC-MAP 生成 ────────────────────────────────────────────────────

export const DOCMAP_INVENTORY_BLOCK_ID = "docmap-inventory";

/**
 * DOC-MAP インベントリブロック（件数 + ファイル群参照）。
 * docs/requirements/REQ-*.md, docs/requirements/retired/REQ-*.md,
 * docs/adr/ADR-*.md, docs/adr/retired/ADR-*.md, docs/designs/ 配下 .md から再生成。
 */
export function generateDocMapInventory(args: {
  activeReqCount: number;
  retiredReqCount: number;
  activeAdrCount: number;
  retiredAdrCount: number;
  specCount: number;
}): string[] {
  const lines: string[] = [`- 現行 REQ: ${args.activeReqCount}件（\`docs/requirements/REQ-*.md\`）`];
  // retired 実体が存在する場合のみパス文字列を伴う行を出力する。実体不在（件数0）のときに
  // パス文字列を残すと、retired/ ディレクトリ削除後も grep 検出で残留参照のように見えるため。
  if (args.retiredReqCount > 0) {
    lines.push(`- 廃止済み REQ: ${args.retiredReqCount}件（\`docs/requirements/retired/REQ-*.md\`）`);
  }
  if (args.retiredAdrCount > 0) {
    lines.push(
      `- ADR: ${args.activeAdrCount}件（\`docs/adr/ADR-*.md\`）、retired: ${args.retiredAdrCount}件（\`docs/adr/retired/ADR-*.md\`）`,
    );
  } else {
    lines.push(`- ADR: ${args.activeAdrCount}件（\`docs/adr/ADR-*.md\`）`);
  }
  lines.push(`- Design: ${args.specCount}件（\`docs/designs/**/*.md\`）`);
  return lines;
}

/**
 * docs/designs/ 配下の .md を再帰収集して件数を返える（check_integrity.ts と同ロジック）。
 */
export function countDesignFiles(designsDir: string): number {
  if (!fs.existsSync(designsDir)) return 0;
  let count = 0;
  const walk = (dir: string): void => {
    const entries = fs.readdirSync(dir, { withFileTypes: true }) as import("fs").Dirent[];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        count++;
      }
    }
  };
  walk(designsDir);
  return count;
}

// ─── AG-006候補2: docs/README.md 件数表明 (Phase E 残) ────────────────────────

export const README_REQ_SUMMARY_COUNT_BLOCK_ID = "readme-req-summary-count";

/**
 * docs/README.md「要件」セクション冒頭の件数表明 AUTOGEN ブロック本体（1行）。
 * 形式: "現行 REQ: N件、廃止済み: M件"
 *
 * docs/README.md は入口文書であり、REQ 詳細一覧は docs/requirements/README.md へ誘導する。
 * 件数表明のみを AUTOGEN 化し、続く説明文（範囲、関連 ADR 等）は人手編集領域として残置する
 * （SC-002 Design「件数表明」自動生成原則、Wave 5 Phase E 残）。
 */
export function generateReadmeReqSummaryCount(args: {
  activeReqCount: number;
  retiredReqCount: number;
}): string[] {
  return [`現行 REQ: ${args.activeReqCount}件、廃止済み: ${args.retiredReqCount}件`];
}

// ─── AG-006候補5: REQ 健全性メトリクス計測例生成 (Phase C 拡張) ────────

export const REQ_METRICS_BLOCK_ID = "req-metrics-measurement-example";

/** REQ 要件行数シグナル閾値（req-health-metrics.md L42-46 準拠）。 */
function computeReqLineSignal(lineCount: number): string {
  if (lineCount >= 81) return "+2";
  if (lineCount >= 51) return "+1";
  return "+0";
}

/**
 * REQ ファイル本文内の要件テーブル行数を計測する。
 * 形式: `| REQ-NNNN-MMM | ... |` に一致する行数（req-health-metrics.md L19 準拠）。
 */
export function countReqRequirementLines(
  content: string,
  reqId: string,
): number {
  const pattern = new RegExp(`^\\| ${reqId}-\\d{3} \\|`);
  let count = 0;
  for (const line of content.split("\n")) {
    if (pattern.test(line)) count++;
  }
  return count;
}

/**
 * Design ファイル本文行数を計測する（design-health-metrics.md 準拠）。
 * frontmatter（先頭 `---`〜`---`）、HTML コメント（`<!--`〜`-->`、複数行可）、
 * AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=xxx -->`〜`<!-- AUTOGEN:END -->`）を除外。
 * AUTOGEN ブロックを除外することで、Design 健全性（人手執筆部分の肥大化検出）と
 * べき等性（AUTOGEN ブロック自身が計測結果に影響しない）を両立する。
 * コメント開始/終了と同一行にある本文は除外せず残置する（コメント自身のみ除去）。
 */
export function countDesignBodyLines(content: string): number {
  const lines = content.split("\n");
  let start = 0;
  // frontmatter を読み飛ばす。
  if (lines.length > 0 && lines[0].trim() === "---") {
    let i = 1;
    while (i < lines.length && lines[i].trim() !== "---") i++;
    start = i + 1;
  }
  let bodyCount = 0;
  let inComment = false;
  let inAutogen = false;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (inAutogen) {
      if (isAutogenEndLine(line)) {
        inAutogen = false;
      }
      continue;
    }
    if (inComment) {
      const endIdx = line.indexOf("-->");
      if (endIdx >= 0) {
        inComment = false;
        const after = line.slice(endIdx + 3);
        if (after.trim().length > 0) bodyCount++;
      }
      continue;
    }
    // AUTOGEN 開始マーカー（行全体一致）は AUTOGEN ブロックとして処理。
    // backtick 囲み等の部分一致は isAutogenBeginLine で自動的に除外される。
    if (isAutogenBeginLine(line)) {
      inAutogen = true;
      continue;
    }
    const startIdx = line.indexOf("<!--");
    if (startIdx >= 0) {
      const endIdx = line.indexOf("-->", startIdx + 4);
      if (endIdx >= 0) {
        // 単一行コメント: 前後の本文を残置。
        const combined = (line.slice(0, startIdx) + line.slice(endIdx + 3));
        if (combined.trim().length > 0) bodyCount++;
      } else {
        // 複数行コメント開始: 開始より前の本文を残置。
        inComment = true;
        const before = line.slice(0, startIdx);
        if (before.trim().length > 0) bodyCount++;
      }
    } else {
      bodyCount++;
    }
  }
  return bodyCount;
}

export interface ReqMetricInfo {
  /** REQ ID（例: "REQ-0101"）。 */
  id: string;
  /** 数値部（ソート用）。 */
  num: number;
  /** 要件テーブル行数。 */
  lineCount: number;
  /** 行数シグナル（"+0"/"+1"/"+2"）。 */
  signal: string;
  /** 備考（混合領域）。 */
  note: string;
}

/**
 * 既存の手動記載備考を優先保持するための内部マップ。
 * req-health-metrics.md「現行 REQ の計測例（参照値）」に既出の8件を混合領域として保持。
 * 将来的に備考の追加・修正が必要な場合は本マップを更新する（SC-002 混合領域許容）。
 */
const REQ_METRICS_HANDCURATED_NOTES: Record<string, string> = {
  "REQ-0103": "アーティファクト責任分界。肥大化",
  "REQ-0114": "case-auto。ライフサイクル段階混在で関心シグナル追加",
  "REQ-0101": "文書、REQ 管理基準",
  "REQ-0102": "要件定義、保存",
  "REQ-0112": "ADR ライフサイクル",
  "REQ-0119": "コマンド、スキル責務分界",
  "REQ-0108": "docs-check / Validation",
  "REQ-0136": "REQ/Design/ADR 適正運用自動化",
};

/**
 * docs/requirements/REQ-*.md を収集し、要件行数・シグナルを算出する。
 * retired/ 配下は対象外。要件行数降順でソート（同値の場合は REQ ID 昇順）。
 */
export function collectReqMetrics(reqDir: string): ReqMetricInfo[] {
  const reqInfos = collectReqFiles(reqDir);
  const metrics: ReqMetricInfo[] = [];
  for (const info of reqInfos) {
    const fullPath = path.join(reqDir, info.filename);
    const content = readText(fullPath);
    if (content === null) continue;
    const lineCount = countReqRequirementLines(content, info.id);
    const signal = computeReqLineSignal(lineCount);
    const note = REQ_METRICS_HANDCURATED_NOTES[info.id] ?? "";
    metrics.push({
      id: info.id,
      num: info.num,
      lineCount,
      signal,
      note,
    });
  }
  metrics.sort((a, b) => {
    if (b.lineCount !== a.lineCount) return b.lineCount - a.lineCount;
    return a.num - b.num;
  });
  return metrics;
}

/**
 * req-health-metrics.md「現行 REQ の計測例（参照値）」AUTOGEN ブロック本体を生成する。
 * 出力形式:
 *   | REQ | 要件行数 | 行数シグナル | 備考 |
 *   |---|---|---|---|
 *   | REQ-NNNN | N | +N | 備考 |
 *   ...
 *   (空行)
 *   計測日: YYYY-MM-DD
 */
export function generateReqMetricsTable(
  metrics: ReqMetricInfo[],
  measureDate: string,
): string[] {
  const lines: string[] = [];
  lines.push("| REQ | 要件行数 | 行数シグナル | 備考 |");
  lines.push("|---|---|---|---|");
  for (const m of metrics) {
    lines.push(`| ${m.id} | ${m.lineCount} | ${m.signal} | ${m.note} |`);
  }
  lines.push("");
  lines.push(`計測日: ${measureDate}。`);
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
    if (latest === null || match[1] > latest) latest = match[1];
  }
  return latest;
}

/**
 * req-metrics 計測日を導出する。対象は REQ メトリクスの計測対象ファイル群
 * （docs/requirements/REQ-*.md、retired は含まない）と同一とする。
 */
export function deriveReqMetricsMeasureDate(
  root: string,
  reqDir: string,
  metrics: ReqMetricInfo[],
): string | null {
  return deriveMeasureDateFromLastCommit(
    root,
    metrics.map((m) => path.join(reqDir, `${m.id}.md`)),
  );
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
    - docs/designs/integrity/integrity-rule-catalog.md (catalog IR entries, 2 blocks around IR-045 gap)
    - docs/designs/integrity/rule-ownership.md (IR cross-reference appendix)
  Wave 2 (AG-008/009/013, DEC-009):
    - docs/decisions/README.md (decision-* baseline/status/retired blocks; skipped when absent)
    - docs/requirements/README.md (active/retired REQ tables)
    - docs/DOC-MAP.md (inventory stats; legacy, skipped when absent)
  Wave 3 (AG-006 候補5):
    - docs/designs/quality/req-health-metrics.md (REQ line count + signal table)
      Wave 5 (Phase E 残):
    - docs/README.md (REQ count summary only; detailed table is hand-curated)

GENERATION SOURCE:
  - docs/designs/integrity/rules/IR-*.md (frontmatter + body Field/Value table)
  - docs/decisions/DEC-*.md, docs/decisions/retired/DEC-*.md (frontmatter; DEC-009)
  - docs/requirements/REQ-*.md, docs/requirements/retired/REQ-*.md (frontmatter, requirement line count)
  - docs/designs/**/*.md (file count, body line count, frontmatter status)
  - docs/adr/ADR-*.md (legacy; DOC-MAP inventory count only, used when docs/DOC-MAP.md exists)

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
  const adrDir = path.join(root, "docs", "adr");
  const adrRetiredDir = path.join(adrDir, "retired");
  const decisionsDir = path.join(root, "docs", "decisions");
  const decisionRetiredDir = path.join(decisionsDir, "retired");
  const reqDir = path.join(root, "docs", "requirements");
  const reqRetiredDir = path.join(reqDir, "retired");
  const designsDir = path.join(root, "docs", "designs");
  const decisionReadmePath = path.join(decisionsDir, "README.md");
  const reqReadmePath = path.join(reqDir, "README.md");
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  const qualityDir = path.join(designsDir, "quality");
  const reqHealthMetricsPath = path.join(qualityDir, "req-health-metrics.md");

  if (!fs.existsSync(rulesDir)) {
    console.error(`[generate_indexes] rules dir not found: ${rulesDir}`);
    process.exit(EXIT_ERROR);
  }

  const infos = collectIrFiles(rulesDir);
  if (infos.length === 0) {
    console.error(`[generate_indexes] no IR-*.md files found in ${rulesDir}`);
    process.exit(EXIT_ERROR);
  }

  const decisionInfos = collectDecisionFiles(decisionsDir);
  const decisionRetiredInfos = collectRetiredDecisionFiles(
    decisionRetiredDir,
  );
  const reqInfos = collectReqFiles(reqDir);
  const reqRetiredInfos = collectRetiredReqFiles(reqRetiredDir);

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
  const decisionRetiredTable = generateDecisionRetiredTable(
    decisionRetiredInfos,
  );
  const reqActiveCaption = generateReqActiveCaption(reqInfos);
  const reqActiveTable = generateReqActiveTable(reqInfos);
  const reqRetiredTable = generateReqRetiredTable(reqRetiredInfos);

  const reqMetrics = collectReqMetrics(reqDir);
  const reqMeasureDate = deriveReqMetricsMeasureDate(root, reqDir, reqMetrics);
  if (reqMeasureDate === null) {
    console.error(
      `[generate_indexes] measure date derivation failed for docs/requirements/REQ-*.md ` +
        `(no commit history or git failure)`,
    );
    process.exit(EXIT_ERROR);
  }
  const reqMetricsTable = generateReqMetricsTable(reqMetrics, reqMeasureDate);

  const readmeReqSummary = generateReadmeReqSummaryCount({
    activeReqCount: reqInfos.length,
    retiredReqCount: reqRetiredInfos.length,
  });

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

  // Decision README 更新 (AG-008 / DEC-009)。対象ファイル不存在時はスキップ。
  const decisionReadmeOriginal = readText(decisionReadmePath);
  if (decisionReadmeOriginal === null) {
    console.log(
      `[generate_indexes] Decision README not found, skipping: ${decisionReadmePath}`,
    );
  } else {
    const decisionReadmeBlocks = findAutogenBlocks(decisionReadmeOriginal);
    const decisionReadmeExpectedIds = [
      DECISION_BASELINE_COUNT_BLOCK_ID,
      DECISION_BASELINE_TABLE_BLOCK_ID,
      DECISION_STATUS_ACCEPTED_BLOCK_ID,
      DECISION_STATUS_PROPOSED_BLOCK_ID,
      DECISION_STATUS_SUPERSEDED_BLOCK_ID,
      DECISION_STATUS_DEPRECATED_BLOCK_ID,
      DECISION_RETIRED_TABLE_BLOCK_ID,
    ];
    const decisionReadmeFoundIds = new Set(
      decisionReadmeBlocks.map((b) => b.id),
    );
    const decisionReadmeMissing = decisionReadmeExpectedIds.filter(
      (id) => !decisionReadmeFoundIds.has(id),
    );
    if (decisionReadmeMissing.length > 0) {
      console.error(
        `[generate_indexes] Decision README AUTOGEN markers not found: ${decisionReadmeMissing.join(", ")}`,
      );
      process.exit(EXIT_ERROR);
    }
    let decisionReadmeUpdated = decisionReadmeOriginal;
    const decisionReadmeReplacements: Record<string, string[]> = {
      [DECISION_BASELINE_COUNT_BLOCK_ID]: decisionBaselineCaption,
      [DECISION_BASELINE_TABLE_BLOCK_ID]: decisionBaselineTable,
      [DECISION_STATUS_ACCEPTED_BLOCK_ID]: decisionStatusAccepted,
      [DECISION_STATUS_PROPOSED_BLOCK_ID]: decisionStatusProposed,
      [DECISION_STATUS_SUPERSEDED_BLOCK_ID]: decisionStatusSuperseded,
      [DECISION_STATUS_DEPRECATED_BLOCK_ID]: decisionStatusDeprecated,
      [DECISION_RETIRED_TABLE_BLOCK_ID]: decisionRetiredTable,
    };
    for (const blockId of decisionReadmeExpectedIds) {
      decisionReadmeUpdated = replaceAutogenBlock(
        decisionReadmeUpdated,
        blockId,
        decisionReadmeReplacements[blockId],
      );
    }
    if (decisionReadmeUpdated !== decisionReadmeOriginal) {
      updates.push({
        file: decisionReadmePath,
        content: decisionReadmeUpdated,
      });
    }
  }

  // REQ README 更新 (AG-009)
  const reqReadmeOriginal = readText(reqReadmePath);
  if (reqReadmeOriginal === null) {
    console.error(`[generate_indexes] REQ README not found: ${reqReadmePath}`);
    process.exit(EXIT_ERROR);
  }
  const reqReadmeBlocks = findAutogenBlocks(reqReadmeOriginal);
  const reqReadmeExpectedIds = [
    REQ_ACTIVE_COUNT_BLOCK_ID,
    REQ_ACTIVE_TABLE_BLOCK_ID,
    REQ_RETIRED_TABLE_BLOCK_ID,
  ];
  const reqReadmeFoundIds = new Set(reqReadmeBlocks.map((b) => b.id));
  const reqReadmeMissing = reqReadmeExpectedIds.filter(
    (id) => !reqReadmeFoundIds.has(id),
  );
  if (reqReadmeMissing.length > 0) {
    console.error(
      `[generate_indexes] REQ README AUTOGEN markers not found: ${reqReadmeMissing.join(", ")}`,
    );
    process.exit(EXIT_ERROR);
  }
  let reqReadmeUpdated = reqReadmeOriginal;
  const reqReadmeReplacements: Record<string, string[]> = {
    [REQ_ACTIVE_COUNT_BLOCK_ID]: reqActiveCaption,
    [REQ_ACTIVE_TABLE_BLOCK_ID]: reqActiveTable,
    [REQ_RETIRED_TABLE_BLOCK_ID]: reqRetiredTable,
  };
  for (const blockId of reqReadmeExpectedIds) {
    reqReadmeUpdated = replaceAutogenBlock(
      reqReadmeUpdated,
      blockId,
      reqReadmeReplacements[blockId],
    );
  }
  if (reqReadmeUpdated !== reqReadmeOriginal) {
    updates.push({ file: reqReadmePath, content: reqReadmeUpdated });
  }

  // DOC-MAP 更新 (AG-013、レガシー)。docs/DOC-MAP.md 不在時はスキップ。
  const docMapOriginal = readText(docMapPath);
  if (docMapOriginal === null) {
    console.log(
      `[generate_indexes] DOC-MAP not found, skipping: ${docMapPath}`,
    );
  } else {
    const docMapInventory = generateDocMapInventory({
      activeReqCount: reqInfos.length,
      retiredReqCount: reqRetiredInfos.length,
      activeAdrCount: collectAdrFiles(adrDir).length,
      retiredAdrCount: collectRetiredAdrFiles(adrRetiredDir).length,
      specCount: countDesignFiles(designsDir),
    });
    const docMapBlocks = findAutogenBlocks(docMapOriginal);
    if (!docMapBlocks.some((b) => b.id === DOCMAP_INVENTORY_BLOCK_ID)) {
      console.error(
        `[generate_indexes] DOC-MAP AUTOGEN marker not found. Expected id: ${DOCMAP_INVENTORY_BLOCK_ID}`,
      );
      process.exit(EXIT_ERROR);
    }
    const docMapUpdated = replaceAutogenBlock(
      docMapOriginal,
      DOCMAP_INVENTORY_BLOCK_ID,
      docMapInventory,
    );
    if (docMapUpdated !== docMapOriginal) {
      updates.push({ file: docMapPath, content: docMapUpdated });
    }
  }

  // req-health-metrics 更新 (AG-006 候補5, Wave 3)
  const reqMetricsOriginal = readText(reqHealthMetricsPath);
  if (reqMetricsOriginal === null) {
    console.error(
      `[generate_indexes] req-health-metrics not found: ${reqHealthMetricsPath}`,
    );
    process.exit(EXIT_ERROR);
  }
  if (!findAutogenBlocks(reqMetricsOriginal).some(
    (b) => b.id === REQ_METRICS_BLOCK_ID,
  )) {
    console.error(
      `[generate_indexes] req-health-metrics AUTOGEN marker not found. Expected id: ${REQ_METRICS_BLOCK_ID}`,
    );
    process.exit(EXIT_ERROR);
  }
  const reqMetricsUpdated = replaceAutogenBlock(
    reqMetricsOriginal,
    REQ_METRICS_BLOCK_ID,
    reqMetricsTable,
  );
  if (reqMetricsUpdated !== reqMetricsOriginal) {
    updates.push({ file: reqHealthMetricsPath, content: reqMetricsUpdated });
  }

  // docs/README.md 更新 (Phase E 残, Wave 5)
  const docsReadmePath = path.join(root, "docs", "README.md");
  const docsReadmeOriginal = readText(docsReadmePath);
  if (docsReadmeOriginal === null) {
    console.error(
      `[generate_indexes] docs/README.md not found: ${docsReadmePath}`,
    );
    process.exit(EXIT_ERROR);
  }
  if (!findAutogenBlocks(docsReadmeOriginal).some(
    (b) => b.id === README_REQ_SUMMARY_COUNT_BLOCK_ID,
  )) {
    console.error(
      `[generate_indexes] docs/README.md AUTOGEN marker not found. Expected id: ${README_REQ_SUMMARY_COUNT_BLOCK_ID}`,
    );
    process.exit(EXIT_ERROR);
  }
  const docsReadmeUpdated = replaceAutogenBlock(
    docsReadmeOriginal,
    README_REQ_SUMMARY_COUNT_BLOCK_ID,
    readmeReqSummary,
  );
  if (docsReadmeUpdated !== docsReadmeOriginal) {
    updates.push({ file: docsReadmePath, content: docsReadmeUpdated });
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
    console.log(
      `[generate_indexes] Decision README: ${decisionInfos.length} active, ${decisionRetiredInfos.length} retired`,
    );
    console.log(
      `[generate_indexes] REQ README: ${reqInfos.length} active, ${reqRetiredInfos.length} retired`,
    );
    console.log(
      `[generate_indexes] req-health-metrics: ${reqMetrics.length} REQs (measure date ${reqMeasureDate})`,
    );
    console.log(
      `[generate_indexes] docs/README.md: REQ summary active=${reqInfos.length} retired=${reqRetiredInfos.length}`,
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
