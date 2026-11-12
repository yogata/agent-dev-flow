// delegation_retired_residual.test.ts — check_delegation_contract_residual.ts
// (IR-032/IR-033) と check_retired_artifact_residual.ts (IR-025/IR-037/IR-043) の
// 最小契約試験（Issue #4029 / REQ-047-012 の verification_path 実在化）。
//
// 契約:
// - 宣言的データ yaml（delegation-contract-patterns.yaml /
//   retired-artifact-registry.yaml）が配置されており読み込み可能であること
//   （yaml 欠損時の checker は ok=false の fail-closed〔REQ-047-009、宣言的データの
//   silent skip 禁止〕で停止する。本試験はその前提条件として yaml 実在を固定する）
// - 現行リポジトリでの実行が有効実行（走査対象 0 件でない）であること
//   （REQ-010-076 準拠。zero-targets は無効実行）
// - IR-032/IR-033/IR-025/IR-037/IR-043 の検出が現行リポジトリで違反 0 件で
//   合格すること
import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { checkDelegationContractResidual } from "../check_delegation_contract_residual.ts";
import { checkRetiredArtifactResidual } from "../check_retired_artifact_residual.ts";
import { findRepoRoot } from "../cli_utils.ts";

const REPO_ROOT = findRepoRoot(import.meta.dir, {});

describe("delegation contract residual (IR-032/IR-033)", () => {
  test("declaration yaml exists and the scan runs with 0 violations", () => {
    const dataYaml = join(
      REPO_ROOT,
      ".opencode/skills/repo-agentdev-integrity/data/delegation-contract-patterns.yaml",
    );
    expect(existsSync(dataYaml)).toBe(true);
    const report = checkDelegationContractResidual(REPO_ROOT);
    expect(report.stats.scanned_files).toBeGreaterThan(0);
    expect(report.stats.ir_032_violations).toBe(0);
    expect(report.stats.ir_033_violations).toBe(0);
    expect(report.ok).toBe(true);
  });
});

describe("retired artifact residual (IR-025/IR-037/IR-043)", () => {
  test("registry yaml exists and the scan reports 0 violations", () => {
    const registryYaml = join(
      REPO_ROOT,
      ".opencode/skills/repo-agentdev-integrity/data/retired-artifact-registry.yaml",
    );
    expect(existsSync(registryYaml)).toBe(true);
    const report = checkRetiredArtifactResidual(REPO_ROOT);
    expect(report.stats.ir_025_violations).toBe(0);
    expect(report.stats.ir_037_violations).toBe(0);
    expect(report.stats.ir_043_violations).toBe(0);
    expect(report.ok).toBe(true);
  });
});
