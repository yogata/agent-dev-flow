// ファイル走査・メタデータ抽出（generate_indexes.ts 分割モジュール）。
// IR / REQ / Decision の個別ファイルからメタデータを抽出し、番号順に収集する。

const path = require("path") as typeof import("path");
import { listFiles, parseBodyTableArray, parseFrontmatter, readText } from "./markdown.ts";

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
