// engine/context.ts — 単一走査・frontmatter/リンク/REQ参照キャッシュ構築エンジン。
// 契約所有: docs/designs/integrity/integrity-engine-plugin-architecture.md
// 「共有コンテキストキャッシュ」。

import * as fs from "node:fs";
import * as path from "node:path";
import { parseMinimalYaml } from "../lib/minimal-yaml.ts";
import type { IntegrityContext, ParsedFile } from "./types.ts";

const SCAN_ROOTS = ["docs", "src", ".agentdev", "traceability"] as const;
const SCAN_EXTENSIONS = new Set([".md", ".yaml", ".yml"]);
const SKIP_DIR_NAMES = new Set(["node_modules", ".git", "vendor", "tmp"]);
const SKIP_DIR_PREFIXES = [".agentdev/integrity/"] as const;

/** `---` 囲みの YAML frontmatter と本文を分割する。欠落・空は null frontmatter。 */
export function extractFrontmatter(rawContent: string): {
  frontmatter: Record<string, unknown> | null;
  body: string;
} {
  const lines = rawContent.split("\n");
  if (lines[0]?.trimEnd() !== "---") {
    return { frontmatter: null, body: rawContent };
  }
  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trimEnd() === "---") {
      close = i;
      break;
    }
  }
  if (close === -1) {
    return { frontmatter: null, body: rawContent };
  }
  const yamlText = lines.slice(1, close).join("\n").trim();
  const body = lines.slice(close + 1).join("\n");
  if (yamlText.length === 0) {
    return { frontmatter: null, body };
  }
  try {
    const parsed = parseMinimalYaml(yamlText);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { frontmatter: null, body };
    }
    return { frontmatter: parsed as Record<string, unknown>, body };
  } catch {
    return { frontmatter: null, body };
  }
}

/** 本文から相対リンク（http/mailto/# 除外）を抽出する。 */
export function parseMarkdownLinks(body: string): {
  text: string;
  href: string;
}[] {
  const links: { text: string; href: string }[] = [];
  const linkRe = /\[([^\]]*)\]\(([^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(body)) !== null) {
    const href = m[2]!.trim();
    if (href === "" || /^(https?:|mailto:|#)/.test(href)) continue;
    links.push({ text: m[1]!, href });
  }
  return links;
}

const REQ_DEC_REFERENCE_RE = /\b(REQ-\d+(?:-\d+)?|DEC-\d+)\b/g;

/** 本文から REQ/DEC 参照（重複排除・出現順）を抽出する。 */
export function extractReqReferences(body: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(REQ_DEC_REFERENCE_RE.source, "g");
  while ((m = re.exec(body)) !== null) {
    const ref = m[1]!;
    if (!seen.has(ref)) {
      seen.add(ref);
      out.push(ref);
    }
  }
  return out;
}

export function parseParsedFile(relPath: string, rawContent: string): ParsedFile {
  const { frontmatter, body } = extractFrontmatter(rawContent);
  return {
    path: relPath,
    rawContent,
    lines: rawContent.split("\n"),
    frontmatter,
    markdownLinks: parseMarkdownLinks(body),
    reqReferences: extractReqReferences(body),
  };
}

function shouldSkipDir(relDir: string, name: string): boolean {
  if (SKIP_DIR_NAMES.has(name)) return true;
  if (name.startsWith(".")) return true;
  return SKIP_DIR_PREFIXES.some((p) => relDir === p || relDir.startsWith(`${p}/`));
}

function isScannableFile(name: string): boolean {
  return SCAN_EXTENSIONS.has(path.extname(name).toLowerCase());
}

/** 走査対象ルートを列挙し、Markdown/YAML を単一走査で ParsedFile 化する。 */
export function walkScanFiles(repoRoot: string): ParsedFile[] {
  const files: ParsedFile[] = [];
  for (const root of SCAN_ROOTS) {
    const rootDir = path.join(repoRoot, root);
    if (!fs.existsSync(rootDir)) continue;
    collectDir(repoRoot, rootDir, root, files);
  }
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return files;
}

function collectDir(
  repoRoot: string,
  absDir: string,
  relDir: string,
  acc: ParsedFile[],
): void {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const absPath = path.join(absDir, entry.name);
    const relPath = [relDir, entry.name].join("/");
    if (entry.isDirectory()) {
      if (shouldSkipDir(relDir, entry.name)) continue;
      collectDir(repoRoot, absPath, relPath, acc);
      continue;
    }
    if (!entry.isFile() || !isScannableFile(entry.name)) continue;
    acc.push(parseParsedFile(relPath, fs.readFileSync(absPath, "utf-8")));
  }
}

/** glob パターン（repo ルート相対）を正規表現へ変換する。`**` は 0 段以上、`*` は 1 段内、`?` は 1 文字。 */
export function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  let out = "";
  for (let i = 0; i < escaped.length; i++) {
    const ch = escaped[i];
    if (ch === "*" && escaped[i + 1] === "*") {
      if (escaped[i + 2] === "/") {
        out += "(?:.*/)?";
        i += 2;
      } else {
        out += ".*";
        i += 1;
      }
      continue;
    }
    if (ch === "*") {
      out += "[^/]*";
      continue;
    }
    if (ch === "?") {
      out += "[^/]";
      continue;
    }
    out += ch;
  }
  return new RegExp(`^${out}$`);
}

class IntegrityContextImpl implements IntegrityContext {
  #byPath: Map<string, ParsedFile>;
  #existsCache: Map<string, boolean>;

  constructor(
    readonly repoRoot: string,
    readonly files: readonly ParsedFile[],
    readonly changedFiles: readonly string[],
  ) {
    this.#byPath = new Map(files.map((f) => [f.path, f]));
    this.#existsCache = new Map();
  }

  readFile(relPath: string): ParsedFile | null {
    const normalized = relPath.replace(/\\/g, "/");
    return this.#byPath.get(normalized) ?? null;
  }

  pathExists(relPath: string): boolean {
    const normalized = relPath.replace(/\\/g, "/");
    const cached = this.#existsCache.get(normalized);
    if (cached !== undefined) return cached;
    const exists = fs.existsSync(path.join(this.repoRoot, ...normalized.split("/")));
    this.#existsCache.set(normalized, exists);
    return exists;
  }

  readRaw(relPath: string): string | null {
    const normalized = relPath.replace(/\\/g, "/");
    try {
      return fs.readFileSync(path.join(this.repoRoot, ...normalized.split("/")), "utf-8");
    } catch {
      return null;
    }
  }

  getFilesByGlob(pattern: string): ParsedFile[] {
    const re = globToRegExp(pattern);
    return this.files.filter((f) => re.test(f.path));
  }

  listDir(relPath: string): string[] {
    const normalized = relPath.replace(/\\/g, "/");
    const absDir = path.join(this.repoRoot, ...normalized.split("/"));
    try {
      return fs.readdirSync(absDir);
    } catch {
      return [];
    }
  }
}

export function buildContext(
  repoRoot: string,
  changedFiles: readonly string[] = [],
): IntegrityContext {
  return new IntegrityContextImpl(
    repoRoot,
    walkScanFiles(repoRoot),
    [...changedFiles],
  );
}
