// effectiveness/independent_search.ts — Graph を経由しない素のファイルシステム探索。
//
// rg / glob / frontmatter parse 相当の操作を Bun の fs API で実装する。
// 外部 CLI (rg 等) に依存しないことで、harness は Node/Bun 単体で再現可能である。
//
// 戻り値は「ファイルパス（repo root 相対、POSIX 区切り）」のリスト。
// harness 側で node ID 空間へ正規化する（path → nodeId 変換）。

import { readdir, readFile, stat } from "node:fs/promises"
import type { Dirent } from "node:fs"
import { join } from "node:path"
import { parseFrontmatter } from "../lib/parse.ts"
import type { IndependentSearchSpec } from "./types.ts"

async function walkFiles(rootDir: string, relPath: string, results: string[]): Promise<void> {
  let entries: Dirent[]
  try {
    entries = await readdir(join(rootDir, relPath), { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const childRel = `${relPath}/${entry.name}`
    if (entry.isDirectory()) {
      await walkFiles(rootDir, childRel, results)
    } else if (entry.isFile()) {
      results.push(childRel)
    }
  }
}

function hasExtension(path: string, extensions: readonly string[]): boolean {
  if (extensions.length === 0) return true
  const dot = path.lastIndexOf(".")
  return dot >= 0 && extensions.includes(path.slice(dot))
}

async function ensureDirectory(rootDir: string, relRoot: string): Promise<boolean> {
  try {
    const s = await stat(join(rootDir, relRoot))
    return s.isDirectory()
  } catch {
    return false
  }
}

/**
 * 1 つの独立探索 spec を実行し、マッチしたファイルパス（repo root 相対・POSIX 区切り）
 * を返す。戻り値はソート済みで重複なし。
 *
 * 配下の操作回数（呼出側で "search effort" 指標として使う）:
 * - grep / frontmatterField: 走査したルート数 + 読んだファイル数
 * - glob: 走査したルート数 + マッチしたファイル数
 *
 * 配下の実装は「外部 CLI なしで再現可能」を優先し、Bun の fs API のみ使用する。
 * discovered_via は diagnostic 用の付随情報（どのファイルがどのルート経由で見つかったか）。
 */
export interface IndependentSearchOutcome {
  readonly matchedPaths: readonly string[]
  readonly operationCount: number
}

export async function executeIndependentSearch(
  rootDir: string,
  spec: IndependentSearchSpec,
): Promise<IndependentSearchOutcome> {
  switch (spec.kind) {
    case "grep":
      return executeGrep(rootDir, spec)
    case "frontmatterField":
      return executeFrontmatterField(rootDir, spec)
    case "glob":
      return executeGlob(rootDir, spec)
    default: {
      const exhaustive: never = spec
      throw new TypeError(`unsupported independent search: ${JSON.stringify(exhaustive)}`)
    }
  }
}

async function executeGrep(
  rootDir: string,
  spec: Extract<IndependentSearchSpec, { readonly kind: "grep" }>,
): Promise<IndependentSearchOutcome> {
  const pattern = new RegExp(spec.pattern, "u")
  const matches = new Set<string>()
  let operations = 0
  for (const relRoot of spec.roots) {
    operations += 1 // root walk
    if (!(await ensureDirectory(rootDir, relRoot))) continue
    const files: string[] = []
    await walkFiles(rootDir, relRoot, files)
    for (const file of files.sort()) {
      if (!hasExtension(file, spec.extensions)) continue
      operations += 1 // file read
      try {
        const content = await readFile(join(rootDir, file), "utf8")
        if (pattern.test(content)) {
          matches.add(file)
        }
      } catch {
        // skip unreadable
      }
    }
  }
  return { matchedPaths: [...matches].sort(), operationCount: operations }
}

async function executeFrontmatterField(
  rootDir: string,
  spec: Extract<IndependentSearchSpec, { readonly kind: "frontmatterField" }>,
): Promise<IndependentSearchOutcome> {
  const matches = new Set<string>()
  let operations = 0
  for (const relRoot of spec.roots) {
    operations += 1
    if (!(await ensureDirectory(rootDir, relRoot))) continue
    const files: string[] = []
    await walkFiles(rootDir, relRoot, files)
    for (const file of files.sort()) {
      if (!hasExtension(file, spec.extensions)) continue
      operations += 1
      try {
        const content = await readFile(join(rootDir, file), "utf8")
        const fields = parseFrontmatter(content)
        const hit = fields.some(
          (f) => f.key === spec.field && f.values.includes(spec.value),
        )
        if (hit) matches.add(file)
      } catch {
        // skip unreadable
      }
    }
  }
  return { matchedPaths: [...matches].sort(), operationCount: operations }
}

async function executeGlob(
  rootDir: string,
  spec: Extract<IndependentSearchSpec, { readonly kind: "glob" }>,
): Promise<IndependentSearchOutcome> {
  const matcher = new Bun.Glob(spec.pattern)
  const matches = new Set<string>()
  let operations = 0
  for (const relRoot of spec.roots) {
    operations += 1
    if (!(await ensureDirectory(rootDir, relRoot))) continue
    const iter = matcher.scan({
      cwd: join(rootDir, relRoot),
      dot: false,
      onlyFiles: true,
    })
    for await (const rel of iter) {
      matches.add(`${relRoot}/${rel}`.replaceAll("\\", "/"))
    }
  }
  return { matchedPaths: [...matches].sort(), operationCount: operations }
}
