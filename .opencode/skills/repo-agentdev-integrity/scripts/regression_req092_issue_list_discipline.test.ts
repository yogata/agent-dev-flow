// ADF-COVERS(verification): REQ-092-001, REQ-092-002, REQ-092-003
import { describe, expect, it } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const REPO_ROOT = join(SCRIPT_DIR, "..", "..", "..", "..");
const SAFETY_DOC = join(
  REPO_ROOT,
  "src",
  "opencode",
  "skills",
  "agentdev-issue-management",
  "references",
  "issue-operation-safety.md",
);
const TRACKING_DESIGN = join(REPO_ROOT, "docs", "designs", "skills", "agentdev-issue-tracking.md");

describe("regression_req092: issue_list 運用規律の文書整備", () => {
  const safetyDoc = readFileSync(SAFETY_DOC, "utf-8");
  const trackingDesign = readFileSync(TRACKING_DESIGN, "utf-8");

  it("REQ-092-001: issue_list の search 併用必須規律が存在し、広範 filter を search なしで実行しない旨を明記する", () => {
    expect(safetyDoc).toContain("search 併用必須");
    expect(safetyDoc).toContain("必ず併用する");
    expect(safetyDoc).toContain("広範 filter を `search` なしで実行すると");
  });

  it("REQ-092-002: labels 引数の tracking 論理値専用を明記し、Design 物理写像表の補記と無矛盾である", () => {
    expect(safetyDoc).toContain("物理マッピング入力専用");
    expect(safetyDoc).toContain("0 件帰着または無効となる");
    expect(safetyDoc).toContain("`search` 引数と state の組み合わせで行う");
    expect(trackingDesign).toContain("issue_list の labels 引数の規律（物理写像の入力方向）");
    expect(trackingDesign).toContain("0 件帰着させるか無効となる");
  });

  it("REQ-092-003: 上限到達時 contingency 手順が参照可能で、Tool 正規経路第一を明記する", () => {
    expect(safetyDoc).toContain("上限到達時 contingency");
    expect(safetyDoc).toContain("Tool 正規経路を第一");
    expect(safetyDoc).toContain("gh issue list --search");
    expect(safetyDoc).toContain("--json labels");
  });
});
