import { createHash } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import type { Dirent } from "node:fs"
import { join } from "node:path"
import { isExcludedPath, isInputFile, type ResolvedConfig } from "./config.ts"
import type { InputFile } from "./model.ts"

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/")
}

async function walk(root: string, directory: string): Promise<readonly string[]> {
  let entries: Dirent[]
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return []
    throw error
  }
  const paths: string[] = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const fullPath = join(directory, entry.name)
    const repoPath = normalizePath(fullPath.slice(root.length + 1).replace(/\\/g, "/"))
    if (isExcludedPath(repoPath)) continue
    if (entry.isDirectory()) paths.push(...await walk(root, fullPath))
    if (entry.isFile() && isInputFile(repoPath)) paths.push(repoPath)
  }
  return paths
}

export async function collectInputs(root: string, config: ResolvedConfig): Promise<readonly InputFile[]> {
  const paths = new Set<string>()
  for (const indexedPath of config.indexed_paths) {
    for (const path of await walk(root, join(root, indexedPath))) paths.add(path)
  }
  return Promise.all([...paths].sort().map(async (path) => ({
    path,
    content: await readFile(join(root, path), "utf8"),
  })))
}

export function computeInputDigest(inputs: readonly InputFile[]): string {
  const hash = createHash("sha256")
  for (const input of [...inputs].sort((left, right) => left.path.localeCompare(right.path))) {
    hash.update(input.path)
    hash.update("\0")
    hash.update(input.content)
    hash.update("\0")
  }
  return hash.digest("hex")
}
