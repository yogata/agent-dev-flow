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
  const id = `ADR-${String(num).padStart(4, "0")}`;

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
  const id = `REQ-${String(num).padStart(4, "0")}`;

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

// ─── AG-008: ADR README 生成 ─────────────────────────────────────────────────

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
 * 形式: "承認済みステータス（accepted）の ADR-01XX N件が、現在のアーキテクチャ判断の基盤である。"
 */
export function generateAdrBaselineCaption(
  acceptedAdrs: AdrInfo[],
): string[] {
  return [
    `承認済みステータス（accepted）の ADR-01XX ${acceptedAdrs.length}件が、現在のアーキテクチャ判断の基盤である。`,
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
 * docs/adr/ADR-*.md, docs/adr/retired/ADR-*.md, docs/specs/ 配下 .md から再生成。
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
  lines.push(`- SPEC: ${args.specCount}件（\`docs/specs/**/*.md\`）`);
  return lines;
}

/**
 * docs/specs/ 配下の .md を再帰収集して件数を返える（check_integrity.ts と同ロジック）。
 */
export function countSpecFiles(specsDir: string): number {
  if (!fs.existsSync(specsDir)) return 0;
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
  walk(specsDir);
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
 * （SC-002 SPEC「件数表明」自動生成原則、Wave 5 Phase E 残）。
 */
export function generateReadmeReqSummaryCount(args: {
  activeReqCount: number;
  retiredReqCount: number;
}): string[] {
  return [`現行 REQ: ${args.activeReqCount}件、廃止済み: ${args.retiredReqCount}件`];
}

// ─── AG-006候補5: REQ/SPEC 健全性メトリクス計測例生成 (Phase C 拡張) ────────

export const REQ_METRICS_BLOCK_ID = "req-metrics-measurement-example";
export const SPEC_METRICS_BLOCK_ID = "spec-metrics-measurement-example";

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
 * SPEC ファイル本文行数を計測する（spec-health-metrics.md L22 準拠）。
 * frontmatter（先頭 `---`〜`---`）、HTML コメント（`<!--`〜`-->`、複数行可）、
 * AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=xxx -->`〜`<!-- AUTOGEN:END -->`）を除外。
 * AUTOGEN ブロックを除外することで、SPEC 健全性（人手執筆部分の肥大化検出）と
 * べき等性（AUTOGEN ブロック自身が計測結果に影響しない）を両立する。
 * コメント開始/終了と同一行にある本文は除外せず残置する（コメント自身のみ除去）。
 */
export function countSpecBodyLines(content: string): number {
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

export interface SpecMetricInfo {
  /** SPEC ファイルの docs/specs/ からの相対パス（例: "quality/req-health-metrics.md"）。 */
  relPath: string;
  /** SPEC 本文行数。 */
  lineCount: number;
  /** frontmatter status（欠落時は "-"）。 */
  status: string;
  /** ドメイン分類（commands/skills/workflows/foundations/responsibilities/quality/integrity/local/authoring/uncategorized）。 */
  domain: string;
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
  "REQ-0136": "REQ/SPEC/ADR 適正運用自動化",
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
 * SPEC ファイルの相対パスからドメイン分類を抽出する。
 * docs/specs/{domain}/{file} の形式を想定。未知のトップレベルディレクトリは uncategorized。
 * _template.md は collectSpecMetrics 側で除外済みを前提。
 */
export function extractSpecDomain(relPath: string): string {
  const known = [
    "commands",
    "skills",
    "workflows",
    "foundations",
    "responsibilities",
    "quality",
    "integrity",
    "local",
    "authoring",
  ];
  const firstSep = relPath.indexOf("/");
  if (firstSep === -1) return "uncategorized";
  const top = relPath.slice(0, firstSep);
  return known.includes(top) ? top : "uncategorized";
}

/**
 * docs/specs/ 配下の .md ファイルを再帰収集し、本文行数・status・ドメイン分類を算出する。
 * _template.md は除外。SPEC 行数降順でソート（同値の場合は relPath 昇順）。
 */
export function collectSpecMetrics(specsDir: string): SpecMetricInfo[] {
  const metrics: SpecMetricInfo[] = [];
  const walk = (dir: string, relPrefix: string): void => {
    let entries: import("fs").Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true }) as import("fs").Dirent[];
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = relPrefix === "" ? entry.name : `${relPrefix}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(full, rel);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      if (entry.name === "_template.md") continue;
      const content = readText(full);
      if (content === null) continue;
      const lineCount = countSpecBodyLines(content);
      const fm = parseFrontmatter(content);
      let status = "-";
      if (fm && typeof fm["status"] === "string") status = fm["status"];
      metrics.push({
        relPath: rel,
        lineCount,
        status,
        domain: extractSpecDomain(rel),
      });
    }
  };
  walk(specsDir, "");
  metrics.sort((a, b) => {
    if (b.lineCount !== a.lineCount) return b.lineCount - a.lineCount;
    return a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0;
  });
  return metrics;
}

/**
 * spec-health-metrics.md「SPEC 計測例」AUTOGEN ブロック本体を生成する。
 * 出力形式:
 *   | SPEC | SPEC 行数 | status | ドメイン分類 |
 *   |---|---|---|---|
 *   | path/to/spec.md | N | status | domain |
 *   ...
 *   (空行)
 *   計測日: YYYY-MM-DD
 */
export function generateSpecMetricsTable(
  metrics: SpecMetricInfo[],
  measureDate: string,
): string[] {
  const lines: string[] = [];
  lines.push("| SPEC | SPEC 行数 | status | ドメイン分類 |");
  lines.push("|---|---|---|---|");
  for (const m of metrics) {
    lines.push(
      `| ${m.relPath} | ${m.lineCount} | ${m.status} | ${m.domain} |`,
    );
  }
  lines.push("");
  lines.push(`計測日: ${measureDate}。`);
  return lines;
}

/**
 * 現在日付を YYYY-MM-DD 形式（ローカル時刻）で返す。
 * スクリプト実行環境のタイムゾーンに依存する（docs-check 実行環境と同一）。
 */
export function formatMeasureDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

TARGET FILES (SC-002 Phase C):
  Wave 1:
    - docs/specs/integrity/integrity-rule-catalog.md (catalog IR entries, 2 blocks around IR-045 gap)
    - docs/specs/integrity/rule-ownership.md (IR cross-reference appendix)
  Wave 2 (AG-008/009/013):
    - docs/adr/README.md (baseline view, status views, retired history)
    - docs/requirements/README.md (active/retired REQ tables)
    - docs/DOC-MAP.md (inventory stats)
  Wave 3 (AG-006 候補5):
    - docs/specs/quality/req-health-metrics.md (REQ line count + signal table)
    - docs/specs/quality/spec-health-metrics.md (SPEC line count + status + domain table)
  Wave 5 (Phase E 残):
    - docs/README.md (REQ count summary only; detailed table is hand-curated)

GENERATION SOURCE:
  - docs/specs/integrity/rules/IR-*.md (frontmatter + body Field/Value table)
  - docs/adr/ADR-*.md, docs/adr/retired/ADR-*.md (frontmatter)
  - docs/requirements/REQ-*.md, docs/requirements/retired/REQ-*.md (frontmatter, requirement line count)
  - docs/specs/**/*.md (file count, body line count, frontmatter status)

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
  const adrDir = path.join(root, "docs", "adr");
  const adrRetiredDir = path.join(adrDir, "retired");
  const reqDir = path.join(root, "docs", "requirements");
  const reqRetiredDir = path.join(reqDir, "retired");
  const specsDir = path.join(root, "docs", "specs");
  const adrReadmePath = path.join(adrDir, "README.md");
  const reqReadmePath = path.join(reqDir, "README.md");
  const docMapPath = path.join(root, "docs", "DOC-MAP.md");
  const qualityDir = path.join(specsDir, "quality");
  const reqHealthMetricsPath = path.join(qualityDir, "req-health-metrics.md");
  const specHealthMetricsPath = path.join(
    qualityDir,
    "spec-health-metrics.md",
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

  const adrInfos = collectAdrFiles(adrDir);
  const adrRetiredInfos = collectRetiredAdrFiles(adrRetiredDir);
  const reqInfos = collectReqFiles(reqDir);
  const reqRetiredInfos = collectRetiredReqFiles(reqRetiredDir);
  const specCount = countSpecFiles(specsDir);
  const acceptedAdrs = adrInfos.filter((a) => a.status === "accepted");

  const adrBaselineCaption = generateAdrBaselineCaption(acceptedAdrs);
  const adrBaselineTable = generateAdrBaselineTable(acceptedAdrs);
  const adrStatusAccepted = generateAdrStatusList(adrInfos, "accepted");
  const adrStatusProposed = generateAdrStatusList(adrInfos, "proposed");
  const adrStatusSuperseded = generateAdrStatusList(adrInfos, "superseded");
  const adrStatusDeprecated = generateAdrStatusList(adrInfos, "deprecated");
  const adrRetiredTable = generateAdrRetiredTable(adrRetiredInfos);
  const reqActiveCaption = generateReqActiveCaption(reqInfos);
  const reqActiveTable = generateReqActiveTable(reqInfos);
  const reqRetiredTable = generateReqRetiredTable(reqRetiredInfos);
  const docMapInventory = generateDocMapInventory({
    activeReqCount: reqInfos.length,
    retiredReqCount: reqRetiredInfos.length,
    activeAdrCount: adrInfos.length,
    retiredAdrCount: adrRetiredInfos.length,
    specCount,
  });

  const measureDate = formatMeasureDate(new Date());
  const reqMetrics = collectReqMetrics(reqDir);
  const specMetrics = collectSpecMetrics(specsDir);
  const reqMetricsTable = generateReqMetricsTable(reqMetrics, measureDate);
  const specMetricsTable = generateSpecMetricsTable(specMetrics, measureDate);

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

  // ADR README 更新 (AG-008)
  const adrReadmeOriginal = readText(adrReadmePath);
  if (adrReadmeOriginal === null) {
    console.error(`[generate_indexes] ADR README not found: ${adrReadmePath}`);
    process.exit(EXIT_ERROR);
  }
  const adrReadmeBlocks = findAutogenBlocks(adrReadmeOriginal);
  const adrReadmeExpectedIds = [
    ADR_BASELINE_COUNT_BLOCK_ID,
    ADR_BASELINE_TABLE_BLOCK_ID,
    ADR_STATUS_ACCEPTED_BLOCK_ID,
    ADR_STATUS_PROPOSED_BLOCK_ID,
    ADR_STATUS_SUPERSEDED_BLOCK_ID,
    ADR_STATUS_DEPRECATED_BLOCK_ID,
    ADR_RETIRED_TABLE_BLOCK_ID,
  ];
  const adrReadmeFoundIds = new Set(adrReadmeBlocks.map((b) => b.id));
  const adrReadmeMissing = adrReadmeExpectedIds.filter(
    (id) => !adrReadmeFoundIds.has(id),
  );
  if (adrReadmeMissing.length > 0) {
    console.error(
      `[generate_indexes] ADR README AUTOGEN markers not found: ${adrReadmeMissing.join(", ")}`,
    );
    process.exit(EXIT_ERROR);
  }
  let adrReadmeUpdated = adrReadmeOriginal;
  const adrReadmeReplacements: Record<string, string[]> = {
    [ADR_BASELINE_COUNT_BLOCK_ID]: adrBaselineCaption,
    [ADR_BASELINE_TABLE_BLOCK_ID]: adrBaselineTable,
    [ADR_STATUS_ACCEPTED_BLOCK_ID]: adrStatusAccepted,
    [ADR_STATUS_PROPOSED_BLOCK_ID]: adrStatusProposed,
    [ADR_STATUS_SUPERSEDED_BLOCK_ID]: adrStatusSuperseded,
    [ADR_STATUS_DEPRECATED_BLOCK_ID]: adrStatusDeprecated,
    [ADR_RETIRED_TABLE_BLOCK_ID]: adrRetiredTable,
  };
  for (const blockId of adrReadmeExpectedIds) {
    adrReadmeUpdated = replaceAutogenBlock(
      adrReadmeUpdated,
      blockId,
      adrReadmeReplacements[blockId],
    );
  }
  if (adrReadmeUpdated !== adrReadmeOriginal) {
    updates.push({ file: adrReadmePath, content: adrReadmeUpdated });
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

  // DOC-MAP 更新 (AG-013)
  const docMapOriginal = readText(docMapPath);
  if (docMapOriginal === null) {
    console.error(`[generate_indexes] DOC-MAP not found: ${docMapPath}`);
    process.exit(EXIT_ERROR);
  }
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

  // spec-health-metrics 更新 (AG-006 候補5, Wave 3)
  const specMetricsOriginal = readText(specHealthMetricsPath);
  if (specMetricsOriginal === null) {
    console.error(
      `[generate_indexes] spec-health-metrics not found: ${specHealthMetricsPath}`,
    );
    process.exit(EXIT_ERROR);
  }
  if (!findAutogenBlocks(specMetricsOriginal).some(
    (b) => b.id === SPEC_METRICS_BLOCK_ID,
  )) {
    console.error(
      `[generate_indexes] spec-health-metrics AUTOGEN marker not found. Expected id: ${SPEC_METRICS_BLOCK_ID}`,
    );
    process.exit(EXIT_ERROR);
  }
  const specMetricsUpdated = replaceAutogenBlock(
    specMetricsOriginal,
    SPEC_METRICS_BLOCK_ID,
    specMetricsTable,
  );
  if (specMetricsUpdated !== specMetricsOriginal) {
    updates.push({ file: specHealthMetricsPath, content: specMetricsUpdated });
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
      `[generate_indexes] ADR README: ${adrInfos.length} active (${acceptedAdrs.length} accepted), ${adrRetiredInfos.length} retired`,
    );
    console.log(
      `[generate_indexes] REQ README: ${reqInfos.length} active, ${reqRetiredInfos.length} retired`,
    );
    console.log(
      `[generate_indexes] DOC-MAP inventory: SPEC ${specCount} files`,
    );
    console.log(
      `[generate_indexes] req-health-metrics: ${reqMetrics.length} REQs (measure date ${measureDate})`,
    );
    console.log(
      `[generate_indexes] spec-health-metrics: ${specMetrics.length} SPECs (measure date ${measureDate})`,
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
