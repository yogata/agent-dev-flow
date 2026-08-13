// Pipeline stage 4: decide (gate over many lines).
//
// Extracted from boundary-pipeline.ts to keep that module under the 250
// pure LOC ceiling (parent defect #12). This module owns the multi-file
// gate decision: it scans file text by index (never split, never building
// an unbounded line array), runs the per-line classifier, and routes
// detections into gate failures (producer-internal) or gate errors
// (unclassified). Combined detections per projection are bounded; once the
// cap is reached exactly one typed projection-overflow Detection is
// appended and classification stops. The gate passes only when both
// buckets are empty.
//
// Side-effect-free: no I/O, pure over inputs and config.

import type {
  Detection,
  GateResult,
  LineInput,
  Projection,
} from "./types.ts";
import { classifyLine, type DetectorConfig, type LineClassification } from "./boundary-pipeline.ts";
import { MAX_LINE_SCAN } from "./boundary-reconstruction.ts";
import { projectionOverflowDetection } from "./boundary-candidate-model.ts";

export interface ClassifyFileInput {
  readonly filePath: string;
  readonly projection: Projection;
  readonly text: string;
}

export interface DecideResult {
  readonly gate: GateResult;
}

// Per-projection combined detection cap. Once reached, classification stops
// and one typed projection-overflow Detection is appended (total cap+1).
const MAX_PROJECTION_DETECTIONS = 1024;

function classifyLineBounded(
  text: string,
  start: number,
  contentEnd: number,
  lineNumber: number,
  file: ClassifyFileInput,
  cfg: DetectorConfig,
): LineClassification {
  const scanEnd = Math.min(contentEnd, start + MAX_LINE_SCAN + 1);
  const lineText = text.substring(start, scanEnd);
  const lineInput: LineInput = {
    text: lineText,
    lineNumber,
    filePath: file.filePath,
    projection: file.projection,
  };
  return classifyLine(lineInput, cfg);
}

export function decideProjection(
  files: readonly ClassifyFileInput[],
  projection: Projection,
  cfg: DetectorConfig,
): DecideResult {
  const failures: Detection[] = [];
  const errors: Detection[] = [];
  const cap = MAX_PROJECTION_DETECTIONS;
  let detectionCount = 0;
  let projectionOverflow = false;

  outer:
  for (const file of files) {
    const text = file.text;
    const n = text.length;
    let lineStart = 0;
    let lineNumber = 1;
    while (lineStart <= n) {
      const nlIdx = text.indexOf("\n", lineStart);
      const lineEnd = nlIdx === -1 ? n : nlIdx;
      const hadNewline = nlIdx !== -1;
      let contentEnd = lineEnd;
      if (contentEnd > lineStart && text.charCodeAt(contentEnd - 1) === 0x0D) {
        contentEnd -= 1;
      }

      const classified = classifyLineBounded(text, lineStart, contentEnd, lineNumber, file, cfg);
      for (const d of classified.detections) {
        if (detectionCount >= cap) {
          projectionOverflow = true;
          break outer;
        }
        detectionCount += 1;
        if (d.classification === "producer-internal") failures.push(d);
        else if (d.classification === "unclassified") errors.push(d);
      }

      if (!hadNewline) break;
      lineStart = nlIdx + 1;
      lineNumber += 1;
    }
  }

  if (projectionOverflow) {
    const firstFile = files[0]?.filePath ?? "";
    errors.push(projectionOverflowDetection(firstFile, projection));
  }

  const gate: GateResult = {
    pass: failures.length === 0 && errors.length === 0,
    failures,
    errors,
    projection,
  };
  return { gate };
}
