import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { enumerateFilesRel } from "./glob_walk.ts"
import { isExcludedPath, isInputFile, type ResolvedConfig } from "./config.ts"
import type { InputFile } from "./model.ts"

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/")
}

function walk(root: string, directory: string): readonly string[] {
  const paths: string[] = []
  for (const rel of enumerateFilesRel(directory)) {
    const repoPath = normalizePath(join(directory, rel).slice(root.length + 1).replace(/\\/g, "/"))
    if (isExcludedPath(repoPath)) continue
    if (isInputFile(repoPath)) paths.push(repoPath)
  }
  return paths
}

export async function collectInputs(root: string, config: ResolvedConfig): Promise<readonly InputFile[]> {
  const paths = new Set<string>()
  for (const indexedPath of config.indexed_paths) {
    for (const path of walk(root, join(root, indexedPath))) paths.add(path)
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
