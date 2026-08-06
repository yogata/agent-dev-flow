export const INDEXED_PATHS = [
  "docs/requirements",
  "docs/adr",
  "docs/specs",
  "src/opencode",
  ".opencode",
  ".agentdev/extensions",
  "scripts",
  "tests",
] as const

export const EXCLUDED_PATHS = [
  ".agentdev/graph/**",
  ".git/**",
  ".worktrees/**",
  "node_modules/**",
  "dist/**",
  "outputs/**",
  ".cache/**",
  ".omo/**",
  ".sisyphus/**",
  "**/*.tmp",
] as const

const EXCLUDED_SEGMENTS = new Set([
  ".git", ".worktrees", "node_modules", "dist", "outputs", ".cache", ".omo", ".sisyphus",
])

const INPUT_EXTENSIONS = new Set([
  ".md", ".yaml", ".yml", ".ts", ".tsx", ".mts", ".cts", ".json", ".jsonc", ".ps1", ".sh",
])

export function isExcludedPath(path: string): boolean {
  const parts = path.split("/")
  if (parts.some((part) => EXCLUDED_SEGMENTS.has(part))) return true
  if (path === ".agentdev/graph" || path.startsWith(".agentdev/graph/")) return true
  return path.endsWith(".tmp")
}

export function isInputFile(path: string): boolean {
  const dot = path.lastIndexOf(".")
  return dot >= 0 && INPUT_EXTENSIONS.has(path.slice(dot).toLowerCase())
}
