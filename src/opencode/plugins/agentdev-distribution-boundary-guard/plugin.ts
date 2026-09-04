// Distribution boundary guard plugin — Stage B orchestrator.
//
// Wires the canonical side-effect-free detector
// (../../../../.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts)
// into OpenCode's tool.execute.before hook for the write, edit, and
// apply_patch tools. When a write would introduce a producer-internal
// reference (concrete ADR/REQ/DEC ID, concrete docs path, producer-repo
// fixed URL, or any unclassified UPPER-DIGITS family) into a distributed
// text artifact under src/opencode/{commands,skills}/**, the hook throws
// to block the write before it lands on disk.
//
// Stage B regression (PR #2092):
//   * Pre-write gate is fail-fast (the distribution boundary DEC, decision 3).
//   * Inspection errors (read failure, malformed patch input, malformed
//     supported-tool args, outside-root target, unclassified entry) are
//     gate-not-passed, NOT clean (the distribution boundary DEC, decision 5).
//   * Repository identity is explicit at the boundary
//     (DEFAULT_PLUGIN_REPOSITORY_IDENTITY for the self-hosting repo;
//     override via makeGuardEnv).
//   * Distributed paths include japanese-tech-writing.
//   * Path classification is project-root-aware: absolute paths under the
//     worktree are resolved to repo-relative; absolute paths outside the
//     worktree and traversal escapes fail closed. The worktree root comes
//     from input.worktree (PluginInput.worktree, verified against
//     @opencode-ai/plugin 1.3.x).
//   * Edit and apply_patch Update reconstruct the prospective full-file
//     content. apply_patch Move inspects the reconstructed destination
//     content (source with body applied when body is non-empty, otherwise
//     source as-is) so a rename + content edit into a distributed dir is
//     caught.
//   * Argument parsing reads the OpenCode field name `path` (not
//     `filePath`); `filePath` is accepted as a legacy alias.
//   * Argument parsing is typed (no `as string`, no broad catch swallow).
//   * Default export is V2 plugin shape `{ id, server }` so OpenCode's
//     loader detects it via readV1Plugin and skips the legacy iteration
//     that would throw on this module's non-function exports.
//
// Evaluation logic lives in lib/distribution-boundary-guard-evaluators.ts;
// argument parsing in lib/distribution-boundary-guard-parser.ts; full-file
// reconstruction in lib/distribution-boundary-guard-reconstruction.ts; path
// classification in lib/distribution-boundary-guard-paths.ts. This file
// owns the plugin shell, the GuardEnv, and the default-export wiring.

import {
  DEFAULT_DETECTOR_CONFIG,
  DEFAULT_REPOSITORY_IDENTITY,
  type DetectorConfig,
  type Projection,
  type RepositoryIdentity,
} from "../../../../.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts";
import * as fs from "fs";
import {
  parseApplyPatchArgs as parserParseApplyPatchArgs,
  parseApplyPatchText,
  parseEditArgs as parserParseEditArgs,
  parseWriteArgs as parserParseWriteArgs,
  type ParsedApplyPatch,
  type ParsedEdit,
} from "./lib/distribution-boundary-guard-parser.ts";
import {
  classifyPath,
  classifyPathNoRoot,
  isDistributedPath,
  normalizePath,
  type PathClass,
} from "./lib/distribution-boundary-guard-paths.ts";
import type { FileReader } from "./lib/distribution-boundary-guard-reconstruction.ts";
import {
  emptyOk,
  evaluateApplyPatchEnv as evaluatorsEvaluateApplyPatchEnv,
  evaluateEditEnv as evaluatorsEvaluateEditEnv,
  evaluateWriteContentEnv as evaluatorsEvaluateWriteContentEnv,
  fromDetections,
  inspectionError,
  type GuardDetectionsResult,
  type PathClassifier,
} from "./lib/distribution-boundary-guard-evaluators.ts";

// OpenCode plugin plumbing types (mirror @opencode-ai/plugin 1.3.x).
// Only the fields this plugin consumes are declared.

export type ToolExecuteBeforeInput = {
  readonly tool: string;
  readonly sessionID: string;
  readonly callID: string;
};

export type ToolExecuteBeforeOutput = {
  readonly args: Record<string, unknown>;
};

export type PluginHooks = {
  "tool.execute.before"?(
    input: ToolExecuteBeforeInput,
    output: ToolExecuteBeforeOutput,
  ): Promise<void>;
};

export type PluginInput = {
  readonly worktree: string;
  readonly directory: string;
  readonly project: { readonly worktree: string };
  readonly [key: string]: unknown;
};

export type PluginServer = (input: PluginInput) => Promise<PluginHooks>;

// ---------------------------------------------------------------------------
// Guard environment
// ---------------------------------------------------------------------------

export const DEFAULT_PLUGIN_REPOSITORY_IDENTITY: RepositoryIdentity =
  DEFAULT_REPOSITORY_IDENTITY;

export interface GuardEnv {
  readonly detector_config: DetectorConfig;
  readonly readFile: FileReader;
  readonly projection: Projection;
}

export interface MakeGuardEnvOptions {
  readonly repository_identity?: RepositoryIdentity;
  readonly producer_internal_id_prefixes?: readonly string[];
  readonly distributed_workflow_control_prefixes?: readonly string[];
  readonly readFile?: FileReader;
  projection?: Projection;
}

function defaultReadFile(path: string): string | null {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

export function makeGuardEnv(opts: MakeGuardEnvOptions = {}): GuardEnv {
  const identity = opts.repository_identity ?? DEFAULT_REPOSITORY_IDENTITY;
  const producerPrefixes =
    opts.producer_internal_id_prefixes ??
    DEFAULT_DETECTOR_CONFIG.producer_internal_id_prefixes;
  const workflowPrefixes =
    opts.distributed_workflow_control_prefixes ??
    DEFAULT_DETECTOR_CONFIG.distributed_workflow_control_prefixes;
  return {
    detector_config: {
      repository_identity: identity,
      producer_internal_id_prefixes: producerPrefixes,
      distributed_workflow_control_prefixes: workflowPrefixes,
    },
    readFile: opts.readFile ?? defaultReadFile,
    projection: opts.projection ?? "source",
  };
}

// ---------------------------------------------------------------------------
// Public helper API (exported for unit tests)
// ---------------------------------------------------------------------------

export { type GuardDetectionsResult } from "./lib/distribution-boundary-guard-evaluators.ts";

export const SUPPORTED_TOOLS = ["write", "edit", "apply_patch"] as const;
export type SupportedTool = (typeof SUPPORTED_TOOLS)[number];

export function shouldInspectTool(tool: string): boolean {
  return (SUPPORTED_TOOLS as readonly string[]).includes(tool);
}

function makeClassifier(projectRoot: string | null | undefined): PathClassifier {
  if (projectRoot === null || projectRoot === undefined || projectRoot.length === 0) {
    return classifyPathNoRoot;
  }
  return (p: string): PathClass => classifyPath(p, projectRoot);
}

export { classifyPath, classifyPathNoRoot, isDistributedPath, normalizePath, type PathClass };
export { isApprovedTemporaryPath } from "./lib/distribution-boundary-guard-paths.ts";

export const parseWriteArgs = parserParseWriteArgs;
export const parseEditArgs = parserParseEditArgs;
export const parseApplyPatchArgs = parserParseApplyPatchArgs;

export type {
  ParsedWrite,
  ParsedEdit,
  ParsedApplyPatch,
  PatchEntry,
  PatchOpKind,
  ParsedPatch,
} from "./lib/distribution-boundary-guard-parser.ts";
export {
  reconstructEdit,
  reconstructAddFile,
  reconstructUpdateFile,
  resolveMoveSource,
  safeRead,
  type FileReader,
  type ReconstructResult,
} from "./lib/distribution-boundary-guard-reconstruction.ts";

// ---------------------------------------------------------------------------
// Public evaluate API
//
// `evaluateWriteContent` / `evaluateEdit` / `evaluateApplyPatch` are legacy
// shims with no project root; they use classifyPathNoRoot (absolute paths
// fail closed). The `*Env` variants accept an optional projectRoot so the
// plugin shell can resolve absolute paths under the worktree.
// ---------------------------------------------------------------------------

export function evaluateWriteContent(
  filePath: string,
  content: string,
  projection: Projection = "source",
): GuardDetectionsResult {
  return evaluateWriteContentEnv(filePath, content, makeGuardEnv({ projection }));
}

export function evaluateEdit(args: {
  filePath: string;
  currentContent: string;
  oldString: string;
  newString: string;
  replaceAll?: boolean;
  projection?: Projection;
}): GuardDetectionsResult {
  const opts: MakeGuardEnvOptions = {};
  if (args.projection !== undefined) opts.projection = args.projection;
  return evaluateEditEnv(
    {
      filePath: args.filePath,
      oldString: args.oldString,
      newString: args.newString,
      replaceAll: args.replaceAll ?? false,
    },
    makeGuardEnv(opts),
    undefined,
    args.currentContent,
  );
}

export function evaluateApplyPatch(
  patchText: string,
  projection: Projection = "source",
): GuardDetectionsResult {
  return evaluateApplyPatchEnv({ patchText }, makeGuardEnv({ projection }));
}

export function evaluateWriteContentEnv(
  filePath: string,
  content: string,
  env: GuardEnv,
  projectRoot?: string,
): GuardDetectionsResult {
  return evaluatorsEvaluateWriteContentEnv(filePath, content, env, makeClassifier(projectRoot));
}

export function evaluateEditEnv(
  args: ParsedEdit,
  env: GuardEnv,
  projectRoot?: string,
  currentContentOverride?: string,
): GuardDetectionsResult {
  return evaluatorsEvaluateEditEnv(args, env, makeClassifier(projectRoot), currentContentOverride);
}

export function evaluateApplyPatchEnv(
  args: ParsedApplyPatch,
  env: GuardEnv,
  projectRoot?: string,
): GuardDetectionsResult {
  return evaluatorsEvaluateApplyPatchEnv(args, env, makeClassifier(projectRoot));
}

export { emptyOk, fromDetections, inspectionError, parseApplyPatchText };

// ---------------------------------------------------------------------------
// Error message formatting
// ---------------------------------------------------------------------------

export function formatBlockMessage(
  tool: string,
  result: GuardDetectionsResult,
): string {
  const header = `agentdev-distribution-boundary-guard: blocked ${tool} (producer-internal reference in distributed text artifact)`;
  if (result.ok) {
    return `${header}\nno violation detected (internal call site should not have thrown)`;
  }
  if (result.errorKind === "inspection-error") {
    return `${header}\ninspection error: malformed input, read failure, outside-root target, or unclassified entry; gate-not-passed per the distribution boundary DEC (fail-closed)`;
  }
  const lines = [header];
  for (const d of result.detections) {
    lines.push(
      `  [${d.category}] ${d.file}:${d.line} matched=${d.matched} (${d.classification})`,
    );
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Plugin wiring (V2 default export)
//
// `id` is required for path plugins (resolvePluginId throws otherwise).
// `server` is the async hook factory. The plugin shell fail-closes on
// every inspection-error path: malformed supported-tool args (parser
// returns null), outside-root target, read failure, malformed patch
// text, and unclassified entry all throw via formatBlockMessage.
// ---------------------------------------------------------------------------

const server: PluginServer = async (input) => {
  const projectRoot =
    typeof input.worktree === "string" && input.worktree.length > 0
      ? input.worktree
      : input.project?.worktree ?? "";
  const env = makeGuardEnv();
  return {
    "tool.execute.before": async (hookInput, hookOutput) => {
      if (!shouldInspectTool(hookInput.tool)) return;
      let result: GuardDetectionsResult;
      if (hookInput.tool === "write") {
        const parsed = parserParseWriteArgs(hookOutput.args);
        if (parsed === null) {
          throw new Error(formatBlockMessage("write", inspectionError()));
        }
        result = evaluateWriteContentEnv(parsed.filePath, parsed.content, env, projectRoot);
      } else if (hookInput.tool === "edit") {
        const parsed = parserParseEditArgs(hookOutput.args);
        if (parsed === null) {
          throw new Error(formatBlockMessage("edit", inspectionError()));
        }
        result = evaluateEditEnv(parsed, env, projectRoot);
      } else {
        const parsed = parserParseApplyPatchArgs(hookOutput.args);
        if (parsed === null) {
          throw new Error(formatBlockMessage("apply_patch", inspectionError()));
        }
        result = evaluateApplyPatchEnv(parsed, env, projectRoot);
      }
      if (!result.ok) {
        throw new Error(formatBlockMessage(hookInput.tool, result));
      }
    },
  };
};

export default {
  id: "agentdev-distribution-boundary-guard",
  server,
} as const;
