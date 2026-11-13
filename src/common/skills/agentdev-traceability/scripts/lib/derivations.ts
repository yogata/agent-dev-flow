// 対応宣言の導出機構（agentdev-traceability 決定的エンジンの一部）。
//
// 正規成果物の配置と内容から機械導出できる対応（実装・試験ファイルの対応等）は
// 導出によって宣言でき、手動保守をなくなった分だけ縮小する（B3-6、v4-traceability
// model Design「永続情報と導出可能情報の分離」節）。導出対象と手動付与対象の
// 境界は同節が所有する。
//
// - 導出対象は検証対応（verification role）のみ。対象テスト配置は
//   traceability/derivations.yaml（repository-local 導出規約）が宣言する
// - 導出根拠はテスト本文の import 実測と、import 先モジュールへの手動対応宣言
//   （inline + sidecar）の REQ 集合。導出宣言自体は導出根拠に含めない
//   （導出の連鎖を防ぎ、同一コーパスから同一結果の決定性を保持する）
// - 導出は対応関係の存在を宣言するのみで、要件の実現または検証の成立を
//   推定する根拠にしない（T-003 の原則維持）
// - 検証対応要否は traceability/policy.yaml が所有し、導出しない
//   （検証対応要否のポリシー所有）
// - 規約不在時は導出不活性（導出宣言 0・issue 0）。規約の schema 不備は
//   silent skip せず issue として報告する（fail-closed、checker 実行契約 Design
//   の宣言的データの silent skip 禁止と同一規定）

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CoverDeclaration } from "./declarations.ts";

export const DERIVATIONS_FILE_REL = "traceability/derivations.yaml";

export interface DerivationsConfig {
  /** 検証対応の導出対象とするテストディレクトリ（リポジトリ相対パス、POSIX 区切り）。 */
  readonly testsDirs: readonly string[];
}

export type DerivationIssueReason = "invalid-derivations-schema" | "unreadable-derivations";

export interface DerivationIssue {
  readonly reason: DerivationIssueReason;
  /** issue の発生元ファイル（derivations.yaml または対象テスト）。 */
  readonly file: string;
  readonly text?: string;
  readonly detail: string;
}

export interface DerivationResult {
  /** 導出された対応宣言（source: "derived"、role: verification のみ）。 */
  readonly declarations: readonly CoverDeclaration[];
  /** 規約解析・導出実行の issues（check の fail-closed 判定入力）。 */
  readonly issues: readonly DerivationIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toForwardSlash(value: string): string {
  return value.replaceAll("\\", "/");
}

function normalizeRepoRelative(pathValue: string): string {
  const parts: string[] = [];
  for (const segment of toForwardSlash(pathValue).split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      parts.pop();
      continue;
    }
    parts.push(segment);
  }
  return parts.join("/");
}

/**
 * テスト本文から import 指定子（相対パス形式のみ）を実測抽出する。
 * 静的 import / export from / 動的 import() を対象とし、bare spec
 * （パッケージ依存、組み込みモジュール）は対象外とする。
 */
function extractRelativeImportSpecs(content: string): readonly string[] {
  const specs: string[] = [];
  const fromRe = /(?:^|\n)[ \t]*(?:import|export)[^;\n]*?from[ \t\n]+["']([^"']+)["']/g;
  for (const m of content.matchAll(fromRe)) {
    const spec = m[1];
    if (spec !== undefined) specs.push(spec);
  }
  const dynamicRe = /import[ \t]*\([ \t]*["']([^"']+)["']/g;
  for (const m of content.matchAll(dynamicRe)) {
    const spec = m[1];
    if (spec !== undefined) specs.push(spec);
  }
  return specs;
}

/**
 * import 指定子をリポジトリ相対パスへ解決する。解決不能な場合は undefined。
 * テストファイルの配置ディレクトリ基準で解決し、.ts 拡張子の省略を補う。
 */
function resolveImportSpec(
  testFileDir: string,
  spec: string,
): string | undefined {
  if (!spec.startsWith("./") && !spec.startsWith("../")) return undefined;
  const withoutFileUrl = spec.startsWith("file://")
    ? decodeURIComponent(spec.slice("file://".length))
    : spec;
  const base = testFileDir === "" ? "" : testFileDir;
  const candidate = normalizeRepoRelative(
    base === "" ? withoutFileUrl : `${base}/${withoutFileUrl}`,
  );
  if (candidate === "" || candidate.startsWith("../")) return undefined;
  if (candidate.endsWith(".ts")) return candidate;
  return `${candidate}.ts`;
}

/**
 * 導出規約（traceability/derivations.yaml）本文を解析する。
 * 未知キー・形式不備を黙って読み飛ばさない（silent skip 禁止）。
 */
export function parseDerivationsConfig(
  file: string,
  content: string,
): { config: DerivationsConfig | undefined; issues: DerivationIssue[] } {
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(content);
  } catch (error) {
    return {
      config: undefined,
      issues: [
        {
          reason: "invalid-derivations-schema",
          file,
          text: content.slice(0, 200),
          detail: `導出規約の YAML 解析に失敗した（${error instanceof Error ? error.message : "unknown error"}）`,
        },
      ],
    };
  }
  if (!isRecord(parsed)) {
    return {
      config: undefined,
      issues: [
        {
          reason: "invalid-derivations-schema",
          file,
          detail: "導出規約の内容はトップレベルに test-verifications キーを持つマッピング",
        },
      ],
    };
  }
  const issues: DerivationIssue[] = [];
  for (const key of Object.keys(parsed)) {
    if (key !== "test-verifications") {
      issues.push({
        reason: "invalid-derivations-schema",
        file,
        text: key,
        detail: "未知のトップレベルキー（許容キーは test-verifications のみ）",
      });
    }
  }
  const testVerifications = parsed["test-verifications"];
  if (!isRecord(testVerifications)) {
    issues.push({
      reason: "invalid-derivations-schema",
      file,
      detail: "test-verifications の値は tests-dirs を持つマッピング",
    });
    return { config: undefined, issues };
  }
  for (const key of Object.keys(testVerifications)) {
    if (key !== "tests-dirs") {
      issues.push({
        reason: "invalid-derivations-schema",
        file,
        text: key,
        detail: "未知の test-verifications キー（許容キーは tests-dirs のみ）",
      });
    }
  }
  const testsDirsValue = testVerifications["tests-dirs"];
  if (!Array.isArray(testsDirsValue) || testsDirsValue.length === 0) {
    issues.push({
      reason: "invalid-derivations-schema",
      file,
      detail: "tests-dirs は非空のリポジトリ相対パス（POSIX 区切り）の配列",
    });
    return { config: undefined, issues };
  }
  const testsDirs: string[] = [];
  for (const entry of testsDirsValue) {
    if (typeof entry !== "string" || entry.trim() === "") {
      issues.push({
        reason: "invalid-derivations-schema",
        file,
        text: typeof entry === "string" ? entry : undefined,
        detail: "tests-dirs の各要素は非空のリポジトリ相対パス（POSIX 区切り）",
      });
      continue;
    }
    testsDirs.push(toForwardSlash(entry).replace(/\/$/, ""));
  }
  if (issues.length > 0 || testsDirs.length === 0) {
    return { config: undefined, issues };
  }
  return { config: { testsDirs }, issues: [] };
}

/**
 * root 配下の導出規約を解決する。規約不在時は不活性（available: false、issues 空）。
 * 読取不能・schema 不備は issue として報告する（fail-closed）。
 */
export function resolveDerivationsFromRoot(root: string): {
  available: boolean;
  config: DerivationsConfig | undefined;
  issues: readonly DerivationIssue[];
} {
  let stat;
  try {
    stat = statSync(join(root, DERIVATIONS_FILE_REL));
  } catch {
    return { available: false, config: undefined, issues: [] };
  }
  if (!stat.isFile()) {
    return {
      available: true,
      config: undefined,
      issues: [
        {
          reason: "invalid-derivations-schema",
          file: DERIVATIONS_FILE_REL,
          detail: "導出規約のパスは通常ファイルではない",
        },
      ],
    };
  }
  let content;
  try {
    content = readFileSync(join(root, DERIVATIONS_FILE_REL), "utf-8");
  } catch {
    return {
      available: true,
      config: undefined,
      issues: [
        {
          reason: "unreadable-derivations",
          file: DERIVATIONS_FILE_REL,
          detail: "導出規約ファイルを読み取れない",
        },
      ],
    };
  }
  const parsed = parseDerivationsConfig(DERIVATIONS_FILE_REL, content);
  return { available: true, config: parsed.config, issues: parsed.issues };
}

/**
 * 検証対応（verification role）を決定的に導出する。
 * - 各 tests-dir 配下の .test.ts を名前順で列挙する
 * - テスト本文の相対 import 実測から検証対象モジュールを解決する
 * - 検証対象モジュールの手動対応宣言（inline + sidecar。manualDeclarations は
 *   source !== "derived" のみを渡す）の REQ 集合の和集合を導出 REQ 集合とする
 * - 導出 REQ 集合が空のテストは導出しない（手動付与対象として sidecar 宣言が
 *   残る。対応関係の不在を黙って補わない）
 */
export function deriveDeclarations(
  root: string,
  config: DerivationsConfig,
  manualDeclarations: readonly CoverDeclaration[],
): DerivationResult {
  const issues: DerivationIssue[] = [];
  const manualReqIdsByArtifact = new Map<string, Set<string>>();
  for (const d of manualDeclarations) {
    if (d.source === "derived") continue;
    let set = manualReqIdsByArtifact.get(d.file);
    if (set === undefined) {
      set = new Set();
      manualReqIdsByArtifact.set(d.file, set);
    }
    for (const reqId of d.reqIds) set.add(reqId);
  }
  const declarations: CoverDeclaration[] = [];
  for (const testsDir of config.testsDirs) {
    let entries;
    try {
      entries = readdirSync(join(root, testsDir), { withFileTypes: true });
    } catch {
      issues.push({
        reason: "invalid-derivations-schema",
        file: DERIVATIONS_FILE_REL,
        text: testsDir,
        detail: "tests-dirs のディレクトリを読み取れない（存在しないまたは読取不能）",
      });
      continue;
    }
    const testFiles = entries
      .filter((e) => e.isFile() && e.name.endsWith(".test.ts"))
      .map((e) => e.name)
      .sort();
    for (const name of testFiles) {
      const testFileRel = `${testsDir}/${name}`;
      let content;
      try {
        content = readFileSync(join(root, testFileRel), "utf-8");
      } catch {
        continue;
      }
      const testFileDir = normalizeRepoRelative(testFileRel.split("/").slice(0, -1).join("/"));
      const reqIds = new Set<string>();
      for (const spec of extractRelativeImportSpecs(content)) {
        const resolved = resolveImportSpec(testFileDir, spec);
        if (resolved === undefined) continue;
        const manualReqIds = manualReqIdsByArtifact.get(resolved);
        if (manualReqIds === undefined) continue;
        for (const reqId of manualReqIds) reqIds.add(reqId);
      }
      if (reqIds.size === 0) continue;
      declarations.push({
        role: "verification",
        reqIds: [...reqIds].sort(),
        file: testFileRel,
        line: 0,
        source: "derived",
        sourceFile: DERIVATIONS_FILE_REL,
      });
    }
  }
  return { declarations, issues };
}

/**
 * 導出規約と手動対応宣言から導出を実行する統合入口。
 * 手動宣言（inline + sidecar 正規化分）のみを導出根拠とする。
 */
export function deriveFromManualDeclarations(
  root: string,
  manualDeclarations: readonly CoverDeclaration[],
): DerivationResult {
  const resolved = resolveDerivationsFromRoot(root);
  if (!resolved.available) {
    return { declarations: [], issues: [] };
  }
  if (resolved.config === undefined) {
    return { declarations: [], issues: [...resolved.issues] };
  }
  return deriveDeclarations(root, resolved.config, manualDeclarations);
}
