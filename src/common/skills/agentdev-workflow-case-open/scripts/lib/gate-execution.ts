// supported lib interface: agentdev-artifact-validation が正規所有するゲート機械処理
// 共有 lib（scripts/lib/gate-execution.ts）の参照経路。本 skill（case-open 機械工程
// 入口）は本 shim 経由でのみ共有 lib を利用し、内部パスを直接参照しない
//（agentdev-artifact-validation skill Design「境界」節の supported lib interface 条項）。
// 本 shim は再エクスポート以外の実装を持たない。

export {
  buildGateEvidence,
  buildKnownCheckIntegritySpec,
  buildKnownGateArgContracts,
  buildKnownGenerateIndexesSpec,
  buildKnownOverlapCheckSpec,
  buildKnownTraceabilityCheckSpec,
  buildKnownWorkflowIntegrityGateSpec,
  evaluateGateAvailability,
  extractFlagValue,
  fail,
  GATE_ALTERNATIVE_ROUTES,
  MechanicalInputError,
  parseGateCliArgs,
  preValidateGateSpecWithContracts,
  requireGateSpec,
  requireReqIdList,
  resolveGateExecutablePath,
  runGatePreValidation,
} from "../../../agentdev-artifact-validation/scripts/lib/gate-execution.ts";

export type {
  CommandResult,
  CommandSpec,
  GateAvailabilityRecord,
  GateCommandSpec,
  GateExecutionEvidence,
  KnownArgContract,
  KnownGateInvocation,
  KnownOverlapGateInput,
  KnownTraceabilityGateInput,
  KnownWorkflowGateInput,
} from "../../../agentdev-artifact-validation/scripts/lib/gate-execution.ts";
