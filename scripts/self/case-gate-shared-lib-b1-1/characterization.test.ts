// B1-1（Issue #4014・委譲 DEL-4014-1）特性化比較テスト。
//
// TS-001: 3工程入口 script の CLI レベル挙動（通常起動・失敗分岐・--validate-input の
//   stdout/stderr JSON 構造と終了コード・副作用の有無）を、変更前に記録した golden
//   （golden/characterization.json）と同一条件で再実行して比較する。リファクタ後も
//   同一 golden で合格することで変更前後同一を証明する。さらに runner 注入レベルで、
//   ゲート呼び出しの対象・順序・条件・結果解釈（step 構造・status・警告文面）と
//   失敗分岐の副作用なしを pin する。既存の入口別ユニットテストを置き換えず、
//   工程横断の特性化だけをここに置く。
// TS-002: B1-1 の CLI 利用側 4 skill の公開 CLI について、有効入力・無効入力・
//   ゲート不能の判定（受理・拒否・対象外）と終了コードを pin する。詳細出力の
//   変更前後比較は record-golden.ts が退避した evidence baseline と
//   compare-evidence.ts の比較結果で記録する。

import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  ACCEPT_SCRIPT,
  CLOSE_SCRIPT,
  PREPARE_SCRIPT,
  REPO_ROOT,
  buildCliSkillCases,
  buildInputFixtures,
  cleanupFixtures,
  ensureFixtures,
  normalizeOutput,
  runBun,
  type CliOutcome,
} from "./characterization-lib.ts";

const GOLDEN_PATH = path.join(REPO_ROOT, "scripts/self/case-gate-shared-lib-b1-1/golden/characterization.json");

interface Golden {
  gateEntryOutcomes: Record<string, Record<string, CliOutcome>>;
}

const golden = JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf-8")) as Golden;
const SCRIPT_BY_ENTRY: Record<string, string> = {
  prepare_definition_pr: PREPARE_SCRIPT,
  accept_definition_checks: ACCEPT_SCRIPT,
  close_mechanical_steps: CLOSE_SCRIPT,
};

afterAll(() => {
  cleanupFixtures();
});

// ---------------------------------------------------------------------------
// TS-001: golden 比較（3入口の CLI レベル挙動）
// ---------------------------------------------------------------------------

for (const [entry, expectedOutcomes] of Object.entries(golden.gateEntryOutcomes)) {
  describe(`characterization gate entry (golden): ${entry}`, () => {
    for (const [caseId, expected] of Object.entries(expectedOutcomes)) {
      test(`${caseId}: exit/stdout/stderr identical to golden`, () => {
        const args = caseArgsFor(entry, caseId);
        const actual = runBun([SCRIPT_BY_ENTRY[entry], ...args]);
        expect(actual.exitCode).toBe(expected.exitCode);
        expect(normalizeOutput(actual.stdout)).toBe(expected.stdout);
        expect(normalizeOutput(actual.stderr)).toBe(expected.stderr);
      });
    }
  });
}

const TMP_DIR_ROOT = ".agentdev/tmp/del4014-char";

const CASE_ARGS: Record<string, Record<string, readonly string[]>> = {
  prepare_definition_pr: {
    "p-1-validate-input-valid": ["--input", `${TMP_DIR_ROOT}/prepare-valid.json`, "--validate-input"],
    "p-2-validate-input-missing-gate": ["--input", `${TMP_DIR_ROOT}/prepare-missing-gate.json`, "--validate-input"],
    "p-3-validate-input-empty-stagepaths": ["--input", `${TMP_DIR_ROOT}/prepare-empty-stagepaths.json`, "--validate-input"],
    "p-4-invalid-json": ["--input", `${TMP_DIR_ROOT}/invalid-json.json`],
    "p-5-no-args": [],
    "p-6-unknown-arg": ["--bogus"],
    "p-7-help": ["--help"],
    "p-8-run-missing-gate": ["--input", `${TMP_DIR_ROOT}/prepare-missing-gate.json`],
    "p-9-run-input-file-missing": ["--input", `${TMP_DIR_ROOT}/no-such-input.json`],
  },
  accept_definition_checks: {
    "a-1-validate-input-valid": ["--input", `${TMP_DIR_ROOT}/accept-valid.json`, "--validate-input"],
    "a-2-validate-input-missing-gate": ["--input", `${TMP_DIR_ROOT}/accept-missing-gate.json`, "--validate-input"],
    "a-3-validate-input-bad-phase": ["--input", `${TMP_DIR_ROOT}/accept-bad-phase.json`, "--validate-input"],
    "a-4-invalid-json": ["--input", `${TMP_DIR_ROOT}/invalid-json.json`],
    "a-5-no-args": [],
    "a-6-unknown-arg": ["--bogus"],
    "a-7-help": ["--help"],
    "a-8-run-missing-gate": ["--input", `${TMP_DIR_ROOT}/accept-missing-gate.json`],
    "a-9-run-input-file-missing": ["--input", `${TMP_DIR_ROOT}/no-such-input.json`],
  },
  close_mechanical_steps: {
    "c-1-validate-input-valid": ["--input", `${TMP_DIR_ROOT}/close-valid.json`, "--validate-input"],
    "c-2-validate-input-missing-gate": ["--input", `${TMP_DIR_ROOT}/close-missing-gate.json`, "--validate-input"],
    "c-3-validate-input-bad-phase": ["--input", `${TMP_DIR_ROOT}/close-bad-phase.json`, "--validate-input"],
    "c-4-invalid-json": ["--input", `${TMP_DIR_ROOT}/invalid-json.json`],
    "c-5-no-args": [],
    "c-6-unknown-arg": ["--bogus"],
    "c-7-help": ["--help"],
    "c-9-run-input-file-missing": ["--input", `${TMP_DIR_ROOT}/no-such-input.json`],
  },
};

function caseArgsFor(entry: string, caseId: string): readonly string[] {
  const { gatePath, missingGatePath } = ensureFixtures();
  buildInputFixtures(gatePath, missingGatePath);
  const args = CASE_ARGS[entry][caseId];
  if (args === undefined) throw new Error(`unknown characterization case: ${entry}/${caseId}`);
  return args;
}

// ---------------------------------------------------------------------------
// runner 注入レベル: ゲート呼び出しの対象・順序・条件・結果解釈と失敗分岐の副作用なし
// ---------------------------------------------------------------------------

describe("runner-level characterization: prepare_definition_pr", () => {
  test("gate call order and step order on the happy path", async () => {
    const probes = await import("./gate-entry-probes.ts");
    const { report, gateCalls } = probes.runPrepareHappyPath();
    const stepNames = report.result.steps.map((step: { name: string }) => step.name);
    expect(stepNames).toEqual([
      "gate-availability",
      "worktree-create",
      "definition-edit",
      "generate_indexes",
      "stage-and-commit",
      "check_integrity",
      "traceability-check",
    ]);
    expect(gateCalls.map((call: { gate: string }) => call.gate)).toEqual([
      "generate_indexes",
      "check_integrity",
      "traceability-check",
    ]);
    expect(report.result.exitCategory).toBe("success");
    const traceabilityDetail = report.result.steps.find(
      (step: { name: string }) => step.name === "traceability-check",
    )?.detail as { targetRevision?: string };
    expect(traceabilityDetail.targetRevision).toBe("def0123");
    const integrityDetail = report.result.steps.find(
      (step: { name: string }) => step.name === "check_integrity",
    )?.detail as { targetRevision?: string };
    expect(integrityDetail.targetRevision).toBe("def0123");
  });

  test("missing gate executable fails closed before any worktree/git side effect", async () => {
    const probes = await import("./gate-entry-probes.ts");
    const { report, allCalls } = probes.runPrepareMissingGate();
    expect(report.result.steps.length).toBe(1);
    expect(report.result.steps[0].name).toBe("gate-availability");
    expect(report.result.steps[0].status).toBe("fail");
    expect(report.result.exitCategory).toBe("failure");
    expect(report.warnings.join("\n")).toContain("alternative routes");
    expect(allCalls.length).toBe(0);
  });

  test("runValidateInputOnly keeps the report shape and ok/missing semantics", async () => {
    const probes = await import("./gate-entry-probes.ts");
    const outcome = probes.validateInputOnlyHappy(() => true);
    expect(outcome.ok).toBe(true);
    expect(Object.keys(outcome.report)).toEqual([
      "ok",
      "mode",
      "script",
      "inputValidation",
      "gatePreValidation",
      "gateAvailability",
      "sideEffects",
    ]);
    expect(outcome.report.mode).toBe("validate-input");
    expect(outcome.report.script).toBe("prepare_definition_pr");
    expect(outcome.report.sideEffects).toBe("none");
    const failing = probes.validateInputOnlyMissing((p: string) => !p.includes("missing-gate"));
    expect(failing.ok).toBe(false);
    const availability = failing.report.gateAvailability as { missing: readonly string[] };
    expect(availability.missing).toEqual(["check_integrity"]);
  });
});

describe("runner-level characterization: accept_definition_checks", () => {
  test("gate call order and step order on the happy path", async () => {
    const probes = await import("./gate-entry-probes.ts");
    const { report, gateCalls } = probes.runAcceptHappyPath();
    const stepNames = report.result.steps.map((step: { name: string }) => step.name);
    expect(stepNames).toEqual([
      "gate-availability",
      "definition-acceptance-checks",
      "overlap-cross-check",
      "autogen-regeneration-diff",
      "traceability-check",
    ]);
    expect(gateCalls.map((call: { gate: string }) => call.gate)).toEqual([
      "check_integrity",
      "overlap-cross-check",
      "generate_indexes",
      "traceability-check",
    ]);
    expect(report.result.exitCategory).toBe("success");
  });

  test("missing gate executable fails closed before any git side effect", async () => {
    const probes = await import("./gate-entry-probes.ts");
    const { report, allCalls } = probes.runAcceptMissingGate();
    expect(report.result.steps.length).toBe(1);
    expect(report.result.steps[0].name).toBe("gate-availability");
    expect(report.result.steps[0].status).toBe("fail");
    expect(allCalls.length).toBe(0);
  });
});

describe("runner-level characterization: close_mechanical_steps", () => {
  test("pre-merge missing gate fails closed after provisional record and before any external command", async () => {
    const probes = await import("./gate-entry-probes.ts");
    const { report, externalCalls } = probes.runCloseMissingGatePreMerge();
    const stepNames = report.result.steps.map((step: { name: string }) => step.name);
    expect(stepNames).toEqual(["close-acceptance-record", "gate-availability"]);
    expect(report.result.steps[1].status).toBe("fail");
    expect(report.result.exitCategory).toBe("failure");
    expect(report.warnings.join("\n")).toContain("alternative routes");
    expect(externalCalls.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// TS-002: B1-1 の CLI 利用側 4 skill の pin（判定と終了コード）
// ---------------------------------------------------------------------------

const cliSkillCases = buildCliSkillCases();
const PINNED_EXIT_CODES: Record<string, number> = {
  "agentdev-traceability/check-invalid-unknown-req": 2,
  "agentdev-traceability/check-gate-unavailable-missing-root": 0,
  "agentdev-traceability/coverage-invalid-no-target": 1,
  "agentdev-traceability/coverage-gate-unavailable-missing-root": 0,
  "agentdev-adopted-conventions/resolve-invalid-missing-root": 0,
  "agentdev-adopted-conventions/evaluate-invalid-bad-exclude": 1,
  "agentdev-artifact-semantics/classify-invalid-missing-files-flag": 1,
  "agentdev-artifact-semantics/classify-gate-unavailable-missing-file": 2,
  "agentdev-phase-theme-collaboration/themes-invalid-missing-flag": 1,
  "agentdev-phase-theme-collaboration/themes-gate-unavailable-missing-file": 1,
  "agentdev-phase-theme-collaboration/received-gate-unavailable-missing-dir": 1,
};

describe("TS-002: B1-1 CLI consumer skills keep their public CLI behavior", () => {
  for (const [skill, cases] of Object.entries(cliSkillCases)) {
    describe(skill, () => {
      for (const cliCase of cases) {
        const pinKey = `${skill}/${cliCase.id}`;
        const pinnedExit = PINNED_EXIT_CODES[pinKey];
        if (cliCase.compare && pinnedExit !== undefined) {
          test(`${cliCase.id}: pinned exit code ${pinnedExit}`, () => {
            const actual = runBun(cliCase.args);
            expect(actual.exitCode).toBe(pinnedExit);
          });
        } else {
          test(`${cliCase.id}: public CLI contract shape`, () => {
            const actual = runBun(cliCase.args);
            const parsed = JSON.parse(actual.stdout) as Record<string, unknown>;
            if (skill === "agentdev-traceability" && cliCase.id.startsWith("check-")) {
              // check の終了コードは summary.fail 件数（対応データの現状）に依存するため
              // pin せず、報告 JSON 契約（checks・summary の構造）だけを pin する。
              expect([0, 2]).toContain(actual.exitCode);
              expect(typeof parsed.checks).toBe("object");
              expect(typeof parsed.summary).toBe("object");
            } else {
              expect(actual.exitCode).toBe(0);
            }
            if (skill === "agentdev-traceability" && cliCase.id.startsWith("coverage-")) {
              expect(parsed.mode).toBe("requirement");
            }
            if (skill === "agentdev-adopted-conventions" && cliCase.id.startsWith("resolve-")) {
              expect(typeof parsed.basis).toBe("string");
            }
            if (skill === "agentdev-adopted-conventions" && cliCase.id.startsWith("evaluate-")) {
              expect(typeof parsed.outcome).toBe("string");
            }
            if (skill === "agentdev-artifact-semantics") {
              expect(parsed.mode).toBe("classify");
            }
            if (skill === "agentdev-phase-theme-collaboration" && cliCase.id.startsWith("themes-")) {
              expect(typeof parsed.count).toBe("number");
            }
            if (skill === "agentdev-phase-theme-collaboration" && cliCase.id.startsWith("received-")) {
              expect(typeof parsed.count).toBe("number");
            }
          });
        }
      }
    });
  }
});
