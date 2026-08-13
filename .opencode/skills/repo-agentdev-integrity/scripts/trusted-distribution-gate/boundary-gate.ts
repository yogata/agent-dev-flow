// Pipeline stage 4: decide (gate over many lines).
//
// Extracted from boundary-pipeline.ts to keep that module under the 250
// pure LOC ceiling (parent defect #12). This module owns the multi-file
// gate decision: it splits each file into lines, runs the per-line
// classifier (boundary-pipeline.classifyLine), and routes detections into
// gate failures (producer-internal) or gate errors (unclassified). The
// gate passes only when both buckets are empty.
//
// Side-effect-free: no I/O, pure over inputs and config.

import type {
  Detection,
  GateResult,
  LineInput,
  Projection,
} from "./types.ts";
import { classifyLine, type DetectorConfig } from "./boundary-pipeline.ts";

export interface ClassifyFileInput {
  readonly filePath: string;
  readonly projection: Projection;
  /** Text content (already validated UTF-8 by the text-binary module). */
  readonly text: string;
}

export interface DecideResult {
  readonly gate: GateResult;
}

export function decideProjection(
  files: readonly ClassifyFileInput[],
  projection: Projection,
  cfg: DetectorConfig,
): DecideResult {
  const failures: Detection[] = [];
  const errors: Detection[] = [];

  for (const file of files) {
    const lines = file.text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i] ?? "";
      const lineInput: LineInput = {
        text: lineText,
        lineNumber: i + 1,
        filePath: file.filePath,
        projection: file.projection,
      };
      const classified = classifyLine(lineInput, cfg);
      for (const d of classified.detections) {
        if (d.classification === "producer-internal") failures.push(d);
        else if (d.classification === "unclassified") errors.push(d);
      }
    }
  }

  const gate: GateResult = {
    pass: failures.length === 0 && errors.length === 0,
    failures,
    errors,
    projection,
  };
  return { gate };
}
