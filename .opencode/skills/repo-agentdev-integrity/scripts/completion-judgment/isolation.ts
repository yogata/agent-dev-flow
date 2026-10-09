// ADF-COVERS(verification): REQ-110-002
// 反例投入の隔離環境構築。模擬環境は OS 一時ディレクトリ配下へ構築し、
// リポジトリの正規状態へ書き込まない（REQ-110-002）。
// 模擬環境の宣言ファイルは JSON 形式の模擬採用宣言であり、本物の採用規約機構
// （v5-adopted-conventions）には接続しない。

import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { tmpdir } from "node:os";
import type { IsolationFacts } from "./case-catalog.ts";

export interface IsolatedCase {
  readonly root: string;
  readonly cleanup: () => Promise<void>;
}

export async function createIsolatedCase(label: string): Promise<IsolatedCase> {
  const root = await mkdtempSafe(label);
  return {
    root,
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}

async function mkdtempSafe(label: string): Promise<string> {
  const base = join(tmpdir(), `g4-case-${label}-`);
  await mkdir(tmpdir(), { recursive: true });
  let index = 0;
  for (;;) {
    const candidate = `${base}${Date.now()}-${index}`;
    try {
      await mkdir(candidate, { recursive: false });
      return candidate;
    } catch {
      index += 1;
      if (index > 100) throw new Error(`cannot create isolated dir under ${base}`);
    }
  }
}

// 隔離ディレクトリが OS 一時ディレクトリ配下であることを確認する
// （正規状態を破壊しないことの構造的担保）。
export function isInsideOsTempDir(path: string): boolean {
  return path.startsWith(tmpdir() + sep);
}

// G4-X01: 必須採用成果物を実体なしで宣言した模擬環境を構築し、
// 実際の fs 状態から投入事実を導出する。
export async function fixtureMissingAdoptedArtifact(
  isolated: IsolatedCase,
): Promise<IsolationFacts> {
  const declaration = {
    adoptedRequiredArtifacts: ["design-doc.md", "verification-record.md"],
  };
  await writeFile(
    join(isolated.root, "adopted-conventions.json"),
    `${JSON.stringify(declaration, null, 2)}\n`,
    { encoding: "utf8" },
  );
  // 実体ファイルは design-doc.md のみ作成し、verification-record.md を欠落させる。
  await mkdir(isolated.root, { recursive: true });
  await writeFile(join(isolated.root, "design-doc.md"), "# design\n", { encoding: "utf8" });

  const raw = await readFile(join(isolated.root, "adopted-conventions.json"), "utf8");
  const parsed = JSON.parse(raw) as { adoptedRequiredArtifacts: string[] };
  const missing = parsed.adoptedRequiredArtifacts.find(
    (name) => !existsSync(join(isolated.root, name)),
  );
  if (missing === undefined) {
    throw new Error("fixtureMissingAdoptedArtifact: no missing artifact (fixture defect)");
  }
  return { requiredArtifactMissing: { name: missing } };
}

// G4-X07: 対応関係が存在しない参照先を指す模擬環境を構築し、
// 実際の fs 状態から投入事実を導出する。
export async function fixtureMissingRelationTarget(
  isolated: IsolatedCase,
): Promise<IsolationFacts> {
  await writeFile(join(isolated.root, "source.md"), "# source\n", { encoding: "utf8" });
  // 参照先 target.md は作成しない（追跡先欠落）。
  const source = "source.md";
  const target = "target.md";
  if (existsSync(join(isolated.root, target))) {
    throw new Error("fixtureMissingRelationTarget: target exists (fixture defect)");
  }
  return { missingRelationTarget: { source, target } };
}

// G4-X11: 移行必須情報が欠落した模擬環境を構築し、
// 実際の fs 状態から投入事実を導出する。
export async function fixtureIncompleteMigration(
  isolated: IsolatedCase,
): Promise<IsolationFacts> {
  const manifest = { requiredMigrationInfo: ["intake.md", "learning.md", "backlog.md"] };
  await writeFile(
    join(isolated.root, "migration-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { encoding: "utf8" },
  );
  await writeFile(join(isolated.root, "intake.md"), "# intake\n", { encoding: "utf8" });
  await writeFile(join(isolated.root, "learning.md"), "# learning\n", { encoding: "utf8" });
  // backlog.md は作成しない（移行情報欠落）。

  const raw = await readFile(join(isolated.root, "migration-manifest.json"), "utf8");
  const parsed = JSON.parse(raw) as { requiredMigrationInfo: string[] };
  const missing = parsed.requiredMigrationInfo.filter(
    (name) => !existsSync(join(isolated.root, name)),
  );
  if (missing.length === 0) {
    throw new Error("fixtureIncompleteMigration: nothing missing (fixture defect)");
  }
  return { migrationMissing: missing };
}
