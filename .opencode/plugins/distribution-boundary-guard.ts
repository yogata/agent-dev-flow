// Distribution boundary guard plugin (TS-005 fail-fast pre-write gate).
//
// Wires the canonical side-effect-free detector
// (../skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts)
// into OpenCode's tool.execute.before hook for the write, edit, and
// apply_patch tools. When a write would introduce a producer-internal
// reference (concrete ADR/REQ ID, concrete docs path, fixed blob/raw URL)
// into a distributed text artifact under src/opencode/{commands,skills}/**,
// the hook throws to block the write before it lands on disk.
//
// API contract per docs/specs/integrity/distribution-boundary.md:
//   * Pre-write gate is a fail-fast adapter (DEC-014 decision 3).
//   * Inspection errors (read failure, malformed patch input, adapter
//     failure) are gate-not-passed, NOT clean (DEC-014 decision 5).
//   * The plugin does NOT degrade to final-gate-only. If the official hook
//     API cannot satisfy the contract, this file MUST be removed or the
//     contract MUST be re-opened; silent fallback is forbidden (TS-005).

import {
  classifyContent,
  classifyLine,
  decideGate,
  type Detection,
  type Projection,
} from "../skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts";
import * as fs from "fs";

// ---------------------------------------------------------------------------
// Minimal local types for OpenCode plugin plumbing.
//
// The canonical @opencode-ai/plugin package is not a runtime dependency of
// this repo. The shapes here mirror the official Hooks/plugin type as of the
// 2026 OpenCode release (see
// packages/plugin/src/index.ts in the opencode repo). Only the subset this
// plugin actually consumes is mirrored; widening the official type does not
// break us because tool.execute.before is keyed by string.
// ---------------------------------------------------------------------------

export type ToolExecuteBeforeInput = {
  tool: string;
  sessionID: string;
  callID: string;
};

export type ToolExecuteBeforeOutput = {
  // The official type is `{ args: any }`. We mirror it as a record of unknown
  // so consumers do not need @types/node-style any.
  args: Record<string, unknown>;
};

export type PluginHooks = {
  "tool.execute.before"?(
    input: ToolExecuteBeforeInput,
    output: ToolExecuteBeforeOutput,
  ): Promise<void>;
};

export type PluginInput = {
  // Reserved for future use (client, project, etc.). We only need the
  // hook wiring surface.
};

export type Plugin = (input: PluginInput) => Promise<PluginHooks>;

// ---------------------------------------------------------------------------
// Public helper API (exported for unit tests).
// ---------------------------------------------------------------------------

export type GuardDetectionsResult =
  | { ok: true; detections: readonly Detection[] }
  | { ok: false; detections: readonly Detection[]; errorKind: "violation" | "inspection-error" };

export const SUPPORTED_TOOLS = ["write", "edit", "apply_patch"] as const;
export type SupportedTool = (typeof SUPPORTED_TOOLS)[number];

export function shouldInspectTool(tool: string): boolean {
  return (SUPPORTED_TOOLS as readonly string[]).includes(tool);
}

// Distributed text artifact paths. Matches either src/opencode/... source
// projection (the only path the pre-write gate needs to defend; consumer-side
// link/archive projections are checked by the final gate / release pipeline).
const DISTRIBUTED_PATH_RE =
  /src\/opencode\/commands\/agentdev\/|src\/opencode\/skills\/agentdev-[^/]+\//;

export function isDistributedPath(filePath: string): boolean {
  return DISTRIBUTED_PATH_RE.test(filePath);
}

function emptyOk(): GuardDetectionsResult {
  return { ok: true, detections: [] };
}

function fromDetections(detections: readonly Detection[]): GuardDetectionsResult {
  if (detections.length === 0) return { ok: true, detections };
  const gate = decideGate(detections);
  if (gate.pass) return { ok: true, detections };
  const hasErrors = gate.errors.length > 0;
  return {
    ok: false,
    detections,
    errorKind: hasErrors ? "inspection-error" : "violation",
  };
}

export function evaluateWriteContent(
  filePath: string,
  content: string,
  projection: Projection = "source",
): GuardDetectionsResult {
  if (!isDistributedPath(filePath)) return emptyOk();
  return fromDetections(classifyContent(content, filePath, projection));
}

export function evaluateEdit(args: {
  filePath: string;
  currentContent: string;
  oldString: string;
  newString: string;
  replaceAll?: boolean;
  projection?: Projection;
}): GuardDetectionsResult {
  if (!isDistributedPath(args.filePath)) return emptyOk();
  // The edit replaces oldString with newString. Classify what the edit
  // introduces by classifying the prospective newString (the lines the agent
  // is adding). Existing pre-existing refs in currentContent are owned by
  // the final gate; the pre-write gate only blocks writes that themselves
  // carry new producer-internal references.
  const introduced = splitAddedLinesFromNewString(args.newString);
  if (introduced.length === 0) return emptyOk();
  const detections: Detection[] = [];
  for (let i = 0; i < introduced.length; i++) {
    const lineDetections = classifyLineVirtual(
      introduced[i]!,
      i + 1,
      args.filePath,
      args.projection ?? "source",
    );
    for (const d of lineDetections) detections.push(d);
  }
  return fromDetections(detections);
}

export function evaluateApplyPatch(patchText: string, projection: Projection = "source"): GuardDetectionsResult {
  // Parse the OpenCode apply_patch text format. We extract (path, added-lines)
  // pairs and classify each added line. Lines being removed ("-") are not
  // inspected; only additions can introduce new violations.
  const parsed = parseApplyPatch(patchText);
  if (parsed.kind === "malformed") {
    // Per SPEC: inspection error is gate-not-passed, not clean.
    return {
      ok: false,
      detections: [],
      errorKind: "inspection-error",
    };
  }
  const detections: Detection[] = [];
  for (const entry of parsed.entries) {
    if (!isDistributedPath(entry.path)) continue;
    for (let i = 0; i < entry.addedLines.length; i++) {
      const lineDetections = classifyLineVirtual(
        entry.addedLines[i]!,
        i + 1,
        entry.path,
        projection,
      );
      for (const d of lineDetections) detections.push(d);
    }
  }
  return fromDetections(detections);
}

export function formatBlockMessage(tool: string, result: GuardDetectionsResult): string {
  const header = `distribution-boundary-guard: blocked ${tool} (producer-internal reference in distributed text artifact)`;
  if (result.ok) {
    return `${header}\nno violation detected (internal call site should not have thrown)`;
  }
  if (result.errorKind === "inspection-error") {
    return `${header}\ninspection error: malformed input or unclassified entry; gate-not-passed per DEC-014 decision 5`;
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
// Internal: virtual line classification (mirrors classifyLine from lib but
// inlined here to avoid an extra export). We import classifyContent from the
// lib for file-level scans and use classifyLine for single-line checks.
// ---------------------------------------------------------------------------

function classifyLineVirtual(
  text: string,
  lineNumber: number,
  filePath: string,
  projection: Projection,
): readonly Detection[] {
  return classifyLine({ text, lineNumber, filePath, projection });
}

function splitAddedLinesFromNewString(newString: string): string[] {
  if (newString.length === 0) return [];
  return newString.split(/\r?\n/).filter((l) => l.length > 0);
}

type ParsedPatch =
  | { kind: "ok"; entries: Array<{ path: string; addedLines: string[] }> }
  | { kind: "malformed" };

function parseApplyPatch(patchText: string): ParsedPatch {
  if (typeof patchText !== "string" || patchText.length === 0) {
    return { kind: "malformed" };
  }
  // Heuristic: an apply_patch text contains one or more "*** <Op> File: <path>"
  // marker lines. If none are present, we cannot extract any file context and
  // treat the input as malformed (gate-not-passed per SPEC).
  if (!/\*\*\* (Add|Update|Delete|Move) File: /.test(patchText)) {
    return { kind: "malformed" };
  }
  const lines = patchText.split(/\r?\n/);
  const entries: Array<{ path: string; addedLines: string[] }> = [];
  let current: { path: string; addedLines: string[] } | null = null;
  for (const raw of lines) {
    const m = raw.match(/^\*\*\* (?:Add|Update) File: (.+)$/);
    if (m) {
      if (current) entries.push(current);
      current = { path: m[1]!.trim(), addedLines: [] };
      continue;
    }
    if (raw.match(/^\*\*\* (?:Delete|Move) File: /)) {
      if (current) {
        entries.push(current);
        current = null;
      }
      continue;
    }
    if (raw.match(/^\*\*\* (?:Begin|End) Patch/)) continue;
    if (current && raw.startsWith("+")) {
      current.addedLines.push(raw.slice(1));
    }
  }
  if (current) entries.push(current);
  return { kind: "ok", entries };
}

// ---------------------------------------------------------------------------
// Plugin wiring (default export).
// ---------------------------------------------------------------------------

const plugin: Plugin = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (!shouldInspectTool(input.tool)) return;
      let result: GuardDetectionsResult;
      if (input.tool === "write") {
        const filePath = String(output.args.filePath ?? "");
        const content = String(output.args.content ?? "");
        result = evaluateWriteContent(filePath, content);
      } else if (input.tool === "edit") {
        const filePath = String(output.args.filePath ?? "");
        const oldString = String(output.args.oldString ?? "");
        const newString = String(output.args.newString ?? "");
        const replaceAll = Boolean(output.args.replaceAll);
        const currentContent = readCurrentForEdit(filePath);
        result = evaluateEdit({
          filePath,
          currentContent,
          oldString,
          newString,
          replaceAll,
        });
      } else if (input.tool === "apply_patch") {
        const patchText = String(output.args.patchText ?? "");
        result = evaluateApplyPatch(patchText);
      } else {
        return;
      }
      if (!result.ok) {
        throw new Error(formatBlockMessage(input.tool, result));
      }
    },
  };
};

function readCurrentForEdit(filePath: string): string {
  // Best-effort read of the current file content for edit inspection. The
  // pre-write gate primarily inspects the newString (what is being added);
  // currentContent is read so future refinements can reconstruct the full
  // post-edit file. If the read fails we still classify newString.
  try {
    return fs.readFileSync(filePath, "utf-8") as string;
  } catch {
    return "";
  }
}

export default plugin;
