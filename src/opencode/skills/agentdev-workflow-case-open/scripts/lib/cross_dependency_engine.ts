//
// Case 投入時の横断依存検査の比較エンジン（純粋関数）。
// case-open（STEP-5 冪等確認）と case-ready（トレーサビリティ完全性ゲート）の両 workflow skill が
// 共有する単一実装であり、両スキル間で比較手続きを重複実装しない。
//
// - 検出条件 (a): 2 以上の未クローズ Case の変更対象成果物の同一パス重複
// - 検出条件 (b): 2 以上の Case の対象要件行が同一共有領域への未登録行を含む重複需要
// - 検出は合意済み宣言の機械的比較に限定し、一般的な変更影響探索・依存関係探索を
//   行わない（入力された宣言以外の読み取りを行わない構造により担保）
// - 警告はエラーではなく、ゲート遷移判定（Root Case の確立・ready 遷移）に影響しない
// - 検出源の取得失敗は比較の黙示省略をせず検出不能として報告する
// - 同一入力から常に同一の JSON を返す（冪等再実行時の警告再提示の一貫性）

import type {
  CaseDeclaration,
  CrossDependencyInspectionInput,
  CrossDependencyInspectionReport,
  DetectionUnavailable,
  SamePathWarning,
  SharedAreaDefinition,
  SharedAreaDemand,
  SharedAreaFileResult,
} from "./cross_dependency_types.ts";
import { normalizeArtifactPath } from "./cross_dependency_types.ts";
import { readSharedAreaRegistration } from "./shared_area_registration.ts";

export const HITL_OPTIONS: readonly [string, string, string] = [
  "先行整備 Case の切り出し提案（共有領域への登録を先行して担う Case の切り出し）",
  "既存 Case への登録責務の割り当て（いずれかの Case へ登録責務を割り当てる）",
  "このまま並行投入（警告を記録した上で並行して投入する）",
];

export type FileReader = (relativePath: string) => string;

interface PopulationEntry {
  readonly decl: CaseDeclaration;
}

export function inspectCrossDependencies(
  input: CrossDependencyInspectionInput,
  readFile: FileReader,
): CrossDependencyInspectionReport {
  const population: PopulationEntry[] = buildPopulation(input);

  const conditionA = detectSamePathOverlaps(population);
  const { demands, unavailable } = detectSharedAreaDemand(input, population, readFile);
  const detectionUnavailable = mergeSourceFailures(input, unavailable);

  return {
    ok: true,
    mode: input.mode,
    scan: {
      current_case: input.current_case.case_ref,
      population_count: population.length,
      time_window_narrowing: false,
      epic_intake: input.current_case.is_epic_intake,
      wave_internal_delegated_paths: conditionA.delegatedPaths,
    },
    condition_a: {
      warnings: conditionA.warnings,
      count: conditionA.warnings.length,
    },
    condition_b: demands,
    detection_unavailable: detectionUnavailable,
    hitl_options: HITL_OPTIONS,
    gate_effect: "none",
  };
}

function buildPopulation(input: CrossDependencyInspectionInput): PopulationEntry[] {
  const seen = new Set<string>([input.current_case.case_ref]);
  const population: PopulationEntry[] = [{ decl: input.current_case }];
  for (const decl of input.unclosed_cases) {
    if (seen.has(decl.case_ref)) continue;
    seen.add(decl.case_ref);
    population.push({ decl });
  }
  return population;
}

interface SamePathResult {
  readonly warnings: SamePathWarning[];
  readonly delegatedPaths: string[];
}

function detectSamePathOverlaps(population: readonly PopulationEntry[]): SamePathResult {
  const byPath = new Map<string, Map<string, CaseDeclaration>>();
  for (const { decl } of population) {
    for (const raw of decl.artifact_paths) {
      const p = normalizeArtifactPath(raw);
      if (p === "") continue;
      let cases = byPath.get(p);
      if (!cases) {
        cases = new Map<string, CaseDeclaration>();
        byPath.set(p, cases);
      }
      if (!cases.has(decl.case_ref)) cases.set(decl.case_ref, decl);
    }
  }

  const warnings: SamePathWarning[] = [];
  const delegatedPaths: string[] = [];
  const grouped = [...byPath.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  for (const [p, cases] of grouped) {
    if (cases.size < 2) continue;
    if (isWaveInternal(cases)) {
      delegatedPaths.push(p);
      continue;
    }
    warnings.push({ path: p, cases: [...cases.keys()].sort() });
  }
  return { warnings, delegatedPaths };
}

// Wave 内重複（同一 Epic 配下の子 Issue 間）は前置検出の正規所有対象のため
// 本検査から委譲する。グループの全 Case が同一の非 null Epic に属する場合のみ委譲扱いとし、
// Epic をまたぐ重複と非 Epic Case を含む重複は検出対象とする。
function isWaveInternal(cases: ReadonlyMap<string, CaseDeclaration>): boolean {
  const epics = new Set<string>();
  for (const decl of cases.values()) {
    if (decl.epic_ref === null) return false;
    epics.add(decl.epic_ref);
  }
  return epics.size === 1;
}

interface DemandResult {
  readonly demands: SharedAreaDemand[];
  readonly unavailable: DetectionUnavailable[];
}

function detectSharedAreaDemand(
  input: CrossDependencyInspectionInput,
  population: readonly PopulationEntry[],
  readFile: FileReader,
): DemandResult {
  const demands: SharedAreaDemand[] = [];
  const unavailable: DetectionUnavailable[] = [];
  const areas: readonly SharedAreaDefinition[] = input.shared_areas ?? [];

  for (const area of areas) {
    const fileResults: SharedAreaFileResult[] = [];
    const registered = new Set<string>();
    let readFailed = false;
    for (const filePath of [...area.file_paths].sort()) {
      try {
        const content = readFile(filePath);
        for (const row of extractRegisteredRows(area.kind, content)) {
          registered.add(row);
        }
        fileResults.push({ file_path: filePath, read_ok: true, registered_rows: [] });
      } catch (error) {
        readFailed = true;
        fileResults.push({
          file_path: filePath,
          read_ok: false,
          registered_rows: [],
        });
        unavailable.push({
          source: "shared-area-file",
          ref: filePath,
          reason: describeError(error),
        });
      }
    }
    if (readFailed) {
      // 読取失敗時は空の登録状態で需要を捏造せず、当該領域を検出不能として報告する。
      demands.push({
        area_id: area.area_id,
        display_name: area.display_name,
        file_results: fileResults.map((r) => ({ ...r })),
        demand_cases: [],
        case_count: 0,
      });
      continue;
    }

    const demandCases = collectDemandCases(population, registered);
    demands.push({
      area_id: area.area_id,
      display_name: area.display_name,
      file_results: fileResults.map((r) => ({
        ...r,
        registered_rows: [...registered].sort(),
      })),
      demand_cases: demandCases,
      case_count: demandCases.length,
    });
  }
  return { demands, unavailable };
}

function collectDemandCases(
  population: readonly PopulationEntry[],
  registered: ReadonlySet<string>,
): SharedAreaDemand["demand_cases"] {
  const out: {
    case_ref: string;
    unregistered_rows: readonly string[];
  }[] = [];
  for (const { decl } of population) {
    const unregistered = [...decl.target_rows]
      .filter((row) => row !== "" && !registered.has(row))
      .sort();
    if (unregistered.length > 0) {
      out.push({ case_ref: decl.case_ref, unregistered_rows: unregistered });
    }
  }
  return out.sort((a, b) => (a.case_ref < b.case_ref ? -1 : a.case_ref > b.case_ref ? 1 : 0));
}

function extractRegisteredRows(kind: SharedAreaDefinition["kind"], content: string): Set<string> {
  return readSharedAreaRegistration(kind, content);
}

function mergeSourceFailures(
  input: CrossDependencyInspectionInput,
  areaFailures: readonly DetectionUnavailable[],
): DetectionUnavailable[] {
  const echoed = (input.source_failures ?? []).map((f) => ({ ...f }));
  return [...echoed, ...areaFailures];
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
