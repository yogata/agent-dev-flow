// Distribution boundary guard plugin — Stage B orchestrator.
//
// Wires the canonical side-effect-free detector
// (../skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts)
// into OpenCode's tool.execute.before hook for the write, edit, and
// apply_patch tools. When a write would introduce a producer-internal
// reference (concrete ADR/REQ/DEC ID, concrete docs path, producer-repo
// fixed URL, or any unclassified UPPER-DIGITS family) into a distributed
// text artifact under src/opencode/{commands,skills}/**, the hook throws
// to block the write before it lands on disk.
//
// Stage B regression (PR #2092):
//   * Pre-write gate is fail-fast (DEC-014 decision 3).
//   * Inspection errors (read failure, malformed patch input, adapter
//     failure, unclassified entry) are gate-not-passed, NOT clean
//     (DEC-014 decision 5).
//   * Repository identity is explicit at the boundary
//     (DEFAULT_PLUGIN_REPOSITORY_IDENTITY for the self-hosting repo;
//     override via makeGuardEnv).
//   * Distributed paths include japanese-tech-writing.
//   * Path matching is case-insensitive (Windows filesystem semantics).
//   * Edit and apply_patch Update reconstruct the prospective full-file
//     content. apply_patch Move inspects source content at the destination.
//   * Argument parsing is typed (no `as string`, no broad catch swallow).
//
// Evaluation logic lives in distribution-boundary-guard-evaluators.ts;
// argument parsing in distribution-boundary-guard-parser.ts; full-file
// reconstruction in distribution-boundary-guard-reconstruction.ts. This
// file owns the plugin shell, the GuardEnv, the distributed-path predicate,
// and the default-export wiring.

import {
  DEFAULT_DETECTOR_CONFIG,
  DEFAULT_REPOSITORY_IDENTITY,
  type DetectorConfig,
  type Projection,
  type RepositoryIdentity,
} from "../skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts";
import * as fs from "fs";
import {
  parseApplyPatchArgs as parserParseApplyPatchArgs,
  parseApplyPatchText,
  parseEditArgs as parserParseEditArgs,
  parseWriteArgs as parserParseWriteArgs,
  type ParsedApplyPatch,
  type ParsedEdit,
} from "./distribution-boundary-guard-parser.ts";
import type { FileReader } from "./distribution-boundary-guard-reconstruction.ts";
import {
  emptyOk,
  evaluateApplyPatchEnv as evaluatorsEvaluateApplyPatchEnv,
  evaluateEditEnv as evaluatorsEvaluateEditEnv,
  evaluateWriteContentEnv as evaluatorsEvaluateWriteContentEnv,
  fromDetections,
  inspectionError,
  type GuardDetectionsResult,
} from "./distribution-boundary-guard-evaluators.ts";

// ---------------------------------------------------------------------------
// Minimal local types for OpenCode plugin plumbing (mirror @opencode-ai/plugin).
// ---------------------------------------------------------------------------

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

export type PluginInput = Record<string, unknown>;

export type Plugin = (input: PluginInput) => Promise<PluginHooks>;

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
  const prefixes =
    opts.producer_internal_id_prefixes ??
    DEFAULT_DETECTOR_CONFIG.producer_internal_id_prefixes;
  return {
    detector_config: {
      repository_identity: identity,
      producer_internal_id_prefixes: prefixes,
    },
    readFile: opts.readFile ?? defaultReadFile,
    projection: opts.projection ?? "source",
  };
}

// ---------------------------------------------------------------------------
// Public helper API (exported for unit tests)
// ---------------------------------------------------------------------------

export { type GuardDetectionsResult } from "./distribution-boundary-guard-evaluators.ts";

export const SUPPORTED_TOOLS = ["write", "edit", "apply_patch"] as const;
export type SupportedTool = (typeof SUPPORTED_TOOLS)[number];

export function shouldInspectTool(tool: string): boolean {
  return (SUPPORTED_TOOLS as readonly string[]).includes(tool);
}

// Distributed text artifact paths. Matches either src/opencode/... source
// projection (the only path the pre-write gate needs to defend; consumer-side
// link/archive projections are checked by the final gate / release pipeline).
// Case-insensitive: Windows filesystem is case-insensitive at runtime.
const DISTRIBUTED_PATH_RE =
  /^src\/opencode\/commands\/agentdev\/|^src\/opencode\/skills\/(?:agentdev-[^\/]+|japanese-tech-writing)\//i;

export function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

export function isDistributedPath(filePath: string): boolean {
  return DISTRIBUTED_PATH_RE.test(normalizePath(filePath));
}

// ---------------------------------------------------------------------------
// Argument parsing re-exports (typed entries into the orchestrator)
// ---------------------------------------------------------------------------

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
} from "./distribution-boundary-guard-parser.ts";
export {
  reconstructEdit,
  reconstructAddFile,
  reconstructUpdateFile,
  resolveMoveSource,
  safeRead,
  type FileReader,
  type ReconstructResult,
} from "./distribution-boundary-guard-reconstruction.ts";

// ---------------------------------------------------------------------------
// Public evaluate API (legacy non-env shims for backward compat)
// ---------------------------------------------------------------------------

export function evaluateWriteContent(
  filePath: string,
  content: string,
  projection: Projection = "source",
): GuardDetectionsResult {
  return evaluateWriteContentEnv(
    filePath,
    content,
    makeGuardEnv({ projection }),
  );
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
  if (args.projection !== undefined) {
    opts.projection = args.projection;
  }
  const env = makeGuardEnv(opts);
  return evaluatorsEvaluateEditEnv(
    {
      filePath: args.filePath,
      oldString: args.oldString,
      newString: args.newString,
      replaceAll: args.replaceAll ?? false,
    },
    env,
    isDistributedPath,
    args.currentContent,
  );
}

export function evaluateApplyPatch(
  patchText: string,
  projection: Projection = "source",
): GuardDetectionsResult {
  return evaluatorsEvaluateApplyPatchEnv(
    { patchText },
    makeGuardEnv({ projection }),
    isDistributedPath,
  );
}

// Env-aware variants used by the plugin shell and by tests.
export function evaluateWriteContentEnv(
  filePath: string,
  content: string,
  env: GuardEnv,
): GuardDetectionsResult {
  return evaluatorsEvaluateWriteContentEnv(filePath, content, env, isDistributedPath);
}

export function evaluateEditEnv(
  args: ParsedEdit,
  env: GuardEnv,
  currentContentOverride?: string,
): GuardDetectionsResult {
  return evaluatorsEvaluateEditEnv(args, env, isDistributedPath, currentContentOverride);
}

export function evaluateApplyPatchEnv(
  args: ParsedApplyPatch,
  env: GuardEnv,
): GuardDetectionsResult {
  return evaluatorsEvaluateApplyPatchEnv(args, env, isDistributedPath);
}

// Re-export internals for tests that need them.
export { emptyOk, fromDetections, inspectionError, parseApplyPatchText };

// ---------------------------------------------------------------------------
// Error message formatting
// ---------------------------------------------------------------------------

export function formatBlockMessage(
  tool: string,
  result: GuardDetectionsResult,
): string {
  const header = `distribution-boundary-guard: blocked ${tool} (producer-internal reference in distributed text artifact)`;
  if (result.ok) {
    return `${header}\nno violation detected (internal call site should not have thrown)`;
  }
  if (result.errorKind === "inspection-error") {
    return `${header}\ninspection error: malformed input, read failure, or unclassified entry; gate-not-passed per DEC-014 decision 5`;
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
// Plugin wiring (default export)
// ---------------------------------------------------------------------------

const plugin: Plugin = async () => {
  const env = makeGuardEnv();
  return {
    "tool.execute.before": async (input, output) => {
      if (!shouldInspectTool(input.tool)) return;
      let result: GuardDetectionsResult;
      if (input.tool === "write") {
        const parsed = parserParseWriteArgs(output.args);
        if (parsed === null) return;
        result = evaluateWriteContentEnv(parsed.filePath, parsed.content, env);
      } else if (input.tool === "edit") {
        const parsed = parserParseEditArgs(output.args);
        if (parsed === null) return;
        result = evaluateEditEnv(parsed, env);
      } else if (input.tool === "apply_patch") {
        const parsed = parserParseApplyPatchArgs(output.args);
        if (parsed === null) return;
        result = evaluateApplyPatchEnv(parsed, env);
      } else {
        return;
      }
      if (!result.ok) {
        throw new Error(formatBlockMessage(input.tool, result));
      }
    },
  };
};

export default plugin;
