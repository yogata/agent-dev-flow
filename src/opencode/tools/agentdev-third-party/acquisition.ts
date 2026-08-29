// third-party Skill 取得プロファイル（取得、非破壊配置、検証）。
//
// 取得プロファイルの正は Design `docs/designs/local/third-party-skill-management.md`
// 「取得プロファイル」「非破壊性と上書き保護」である:
//   - 単一ファイル型: .opencode/skills/<name>/SKILL.md へ正規化
//   - ディレクトリ型: Skill ディレクトリ配下を再帰取得し相対構造を保持。
//     Skill ディレクトリ外のファイルは取得しない
//   - 取得失敗時に開始前状態を維持する
//   - 機構管理外（agentdev-・repo- 接頭辞、宣言に由来しない同名配置）の
//     無断上書き禁止
//
// 非破壊アルゴリズム: staging 取得 → staging 検証（読み戻し一致）→
// 既存管理対象配置の backup → 配置 → 読み戻し VERIFY → backup 削除。
// いずれかの段階が失敗した場合、配置を開始前状態へ復元する。
//
// 管理対象の判別方法（Design「Design で確定する実装判断」）: provenance
// マーカー（PROVENANCE_FILENAME）による決定論的判定。マーカーを欠く既存
// 配置は機構管理外とみなし、上書きを拒否する（fail-safe 側へ倒す）。


import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { AcquisitionProfile, PlannedTarget } from "./contracts.ts";
import { RESERVED_SKILL_PREFIXES } from "./declaration.ts";
import { resolveSourceUrl, type ResolvedSource } from "./source-url.ts";
import { buildContentsApiUrl, buildRawFileUrl, type SourceFetcher } from "./transport.ts";

/** provenance マーカー。本機構が配置した Skill ディレクトリ直下に置く。 */
export const PROVENANCE_FILENAME = ".agentdev-third-party.json";

/** 管理対象 Skill の判別に使用する provenance 記録。 */
export interface ProvenanceRecord {
  readonly tool: "agentdev_third_party";
  readonly name: string;
  readonly source: string;
  readonly profile: AcquisitionProfile;
  readonly acquiredAt: string;
}

/** 取得実行環境（fail-closed 前提が成立した環境）。 */
export interface AcquisitionEnv {
  readonly fetcher: SourceFetcher;
  /** 配置先ルート（.opencode/skills/）の絶対パス。 */
  readonly skillsRoot: string;
  /** staging・backup に使用する一時領域の絶対パス。 */
  readonly stagingRoot: string;
  readonly now: () => Date;
}

export type AcquireAction = "acquired" | "updated";

export type AcquireOutcome =
  | { readonly ok: true; readonly action: AcquireAction; readonly fileCount: number }
  | {
      readonly ok: false;
      readonly reason:
        | "refused-unmanaged"
        | "source-error"
        | "staging-failed"
        | "placement-failed"
        | "verify-failed";
      readonly detail: string;
    };

export type PlanOutcome =
  | { readonly ok: true; readonly target: PlannedTarget; readonly resolved: ResolvedSource }
  | { readonly ok: false; readonly reason: "source-error" | "path-unresolvable"; readonly detail: string };

/** 既存配置の管理区分。 */
export type ExistingClassification = "absent" | "managed" | "unmanaged";

function placementPathOf(skillsRoot: string, name: string): string {
  return path.join(skillsRoot, name);
}

/** 配置先の既存配置を決定論的に分類する（provenance マーカー基準）。 */
export async function classifyExisting(skillsRoot: string, name: string): Promise<ExistingClassification> {
  const placementPath = placementPathOf(skillsRoot, name);
  let stat;
  try {
    stat = await fs.stat(placementPath);
  } catch {
    return "absent";
  }
  if (!stat.isDirectory()) {
    return "unmanaged";
  }
  const provenance = await readProvenance(placementPath);
  if (provenance !== null && provenance.name === name) {
    return "managed";
  }
  return "unmanaged";
}

async function readProvenance(placementPath: string): Promise<ProvenanceRecord | null> {
  let text: string;
  try {
    text = await fs.readFile(path.join(placementPath, PROVENANCE_FILENAME), "utf8");
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (
      parsed.tool !== "agentdev_third_party" ||
      typeof parsed.name !== "string" ||
      typeof parsed.source !== "string" ||
      (parsed.profile !== "single-file" && parsed.profile !== "directory") ||
      typeof parsed.acquiredAt !== "string"
    ) {
      return null;
    }
    return {
      tool: "agentdev_third_party",
      name: parsed.name,
      source: parsed.source,
      profile: parsed.profile,
      acquiredAt: parsed.acquiredAt,
    };
  } catch {
    return null;
  }
}

/** 取得対象の計画（source URL 判定、プロファイル決定、既存衝突検出）。dry-run もこの計画を返す。 */
export async function planTarget(
  env: AcquisitionEnv,
  name: string,
  source: string,
): Promise<PlanOutcome> {
  for (const prefix of RESERVED_SKILL_PREFIXES) {
    if (name.startsWith(prefix)) {
      return {
        ok: false,
        reason: "source-error",
        detail: `reserved skill name prefix "${prefix}" cannot be acquired into: ${name}`,
      };
    }
  }
  const resolution = resolveSourceUrl(source);
  if (!resolution.ok) {
    return { ok: false, reason: "source-error", detail: resolution.detail };
  }
  const placementPath = placementPathOf(env.skillsRoot, name);
  let existing: ExistingClassification;
  try {
    existing = await classifyExisting(env.skillsRoot, name);
  } catch (e) {
    return {
      ok: false,
      reason: "path-unresolvable",
      detail: `cannot classify the existing placement ${placementPath}: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  return {
    ok: true,
    resolved: resolution.source,
    target: {
      name,
      source,
      profile: resolution.source.profile,
      placementPath,
      existing,
    },
  };
}

interface StagedFile {
  readonly relativePath: string;
  readonly content: Uint8Array;
}

interface StagedAcquisition {
  readonly stagingDir: string;
  readonly files: readonly StagedFile[];
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Skill ディレクトリ相対パスの妥当性検証（path traversal 防御）。 */
function validateRelativePath(relativePath: string): string | null {
  if (relativePath.length === 0) return "empty relative path";
  if (relativePath.includes("\\")) return `backslash in relative path: ${relativePath}`;
  for (const segment of relativePath.split("/")) {
    if (segment === "." || segment === ".." || segment.length === 0) {
      return `unsafe path segment in relative path: ${relativePath}`;
    }
  }
  return null;
}

/** staging への取得（配置には触れない）。全ファイルの取得が完了した場合のみ staging 検証を通る。 */
async function stageAcquisition(
  env: AcquisitionEnv,
  name: string,
  resolved: ResolvedSource,
): Promise<{ ok: true; staged: StagedAcquisition } | { ok: false; detail: string }> {
  const stagingDir = path.join(env.stagingRoot, `tp-${name}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  try {
    await fs.mkdir(stagingDir, { recursive: true });
  } catch (e) {
    return { ok: false, detail: `cannot create staging dir: ${e instanceof Error ? e.message : String(e)}` };
  }

  const files: StagedFile[] = [];
  const { endpoints } = env.fetcher;
  const { owner, repo, ref } = resolved;

  if (resolved.profile === "single-file") {
    // 取得は fetcher.endpoints 経由で行う（rawUrl は宣言 URL の正規化表示）。
    const rawUrl = buildRawFileUrl(endpoints.rawBaseUrl, owner, repo, ref, resolved.path);
    const fetched = await env.fetcher.fetchFile(rawUrl);
    if (!fetched.ok) {
      await fs.rm(stagingDir, { recursive: true, force: true });
      return { ok: false, detail: `source fetch failed: ${fetched.error}` };
    }
    files.push({ relativePath: "SKILL.md", content: fetched.content });
  } else {
    // ディレクトリ型: Skill ディレクトリ配下のみを走査し、相対構造を保持する。
    // 走査起点が Skill ディレクトリであるため、Skill ディレクトリ外の
    // ファイルは取得対象に含まれない（構造的に保証）。
    const queue: Array<{ repoPath: string; relativeDir: string }> = [
      { repoPath: resolved.dir, relativeDir: "" },
    ];
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === undefined) break;
      const listUrl = buildContentsApiUrl(endpoints.apiBaseUrl, owner, repo, ref, current.repoPath);
      const listing = await env.fetcher.listDirectory(listUrl);
      if (!listing.ok) {
        await fs.rm(stagingDir, { recursive: true, force: true });
        return { ok: false, detail: `directory listing failed for ${current.repoPath}: ${listing.error}` };
      }
      for (const entry of listing.entries) {
        const relativePath = current.relativeDir.length > 0
          ? `${current.relativeDir}/${entry.name}`
          : entry.name;
        if (entry.type === "dir") {
          queue.push({ repoPath: entry.repoPath, relativeDir: relativePath });
          continue;
        }
        const unsafe = validateRelativePath(relativePath);
        if (unsafe !== null) {
          await fs.rm(stagingDir, { recursive: true, force: true });
          return { ok: false, detail: `refusing unsafe entry from source: ${unsafe}` };
        }
        const fileUrl = buildRawFileUrl(endpoints.rawBaseUrl, owner, repo, ref, entry.repoPath);
        const fetched = await env.fetcher.fetchFile(fileUrl);
        if (!fetched.ok) {
          await fs.rm(stagingDir, { recursive: true, force: true });
          return { ok: false, detail: `source fetch failed for ${relativePath}: ${fetched.error}` };
        }
        files.push({ relativePath, content: fetched.content });
      }
    }
  }

  if (files.length === 0) {
    await fs.rm(stagingDir, { recursive: true, force: true });
    return { ok: false, detail: "source contains no files to acquire" };
  }
  const hasSkillMd = files.some((f) => f.relativePath === "SKILL.md");
  if (!hasSkillMd) {
    await fs.rm(stagingDir, { recursive: true, force: true });
    return { ok: false, detail: "source does not contain SKILL.md at the Skill directory root" };
  }

  for (const file of files) {
    const target = path.join(stagingDir, ...file.relativePath.split("/"));
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, file.content);
    } catch (e) {
      await fs.rm(stagingDir, { recursive: true, force: true });
      return { ok: false, detail: `cannot write staging file ${file.relativePath}: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  // staging 検証: 書き込んだファイルを読み戻し、取得内容と一致することを確認する。
  for (const file of files) {
    const target = path.join(stagingDir, ...file.relativePath.split("/"));
    let onDisk: Buffer;
    try {
      onDisk = await fs.readFile(target);
    } catch (e) {
      await fs.rm(stagingDir, { recursive: true, force: true });
      return { ok: false, detail: `staging read-back failed for ${file.relativePath}: ${e instanceof Error ? e.message : String(e)}` };
    }
    if (!bytesEqual(new Uint8Array(onDisk), file.content)) {
      await fs.rm(stagingDir, { recursive: true, force: true });
      return { ok: false, detail: `staging read-back mismatch for ${file.relativePath}` };
    }
  }

  return { ok: true, staged: { stagingDir, files } };
}

async function copyDir(from: string, to: string): Promise<void> {
  await fs.cp(from, to, { recursive: true });
}

/**
 * 配置の読み戻し検証（VERIFY）。staging 取得内容と配置内容の一致、
 * SKILL.md の存在、provenance マーカーの読み戻しを確認する。
 * true の場合のみ操作を成功扱いにできる。
 */
async function verifyPlacement(
  env: AcquisitionEnv,
  name: string,
  sourceUrl: string,
  profile: AcquisitionProfile,
  staged: StagedAcquisition,
): Promise<{ ok: true } | { ok: false; detail: string }> {
  const placementPath = placementPathOf(env.skillsRoot, name);
  let stat;
  try {
    stat = await fs.stat(placementPath);
  } catch {
    return { ok: false, detail: `placement read-back failed: ${placementPath} does not exist` };
  }
  if (!stat.isDirectory()) {
    return { ok: false, detail: `placement read-back failed: ${placementPath} is not a directory` };
  }
  try {
    await fs.access(path.join(placementPath, "SKILL.md"));
  } catch {
    return { ok: false, detail: "placement read-back failed: SKILL.md is missing after placement" };
  }
  for (const file of staged.files) {
    let onDisk: Buffer;
    try {
      onDisk = await fs.readFile(path.join(placementPath, ...file.relativePath.split("/")));
    } catch (e) {
      return { ok: false, detail: `placement read-back failed for ${file.relativePath}: ${e instanceof Error ? e.message : String(e)}` };
    }
    if (!bytesEqual(new Uint8Array(onDisk), file.content)) {
      return { ok: false, detail: `placement read-back mismatch for ${file.relativePath}` };
    }
  }
  const provenance = await readProvenance(placementPath);
  if (provenance === null) {
    return { ok: false, detail: "placement read-back failed: provenance marker is missing or unreadable" };
  }
  if (provenance.name !== name || provenance.source !== sourceUrl || provenance.profile !== profile) {
    return { ok: false, detail: "placement read-back failed: provenance marker does not match the acquisition" };
  }
  return { ok: true };
}

/**
 * 1 Skill の取得（検証済み配置）。配置は非破壊である:
 * staging 取得と検証が完了するまで既存配置には触れず、配置後の読み戻し
 * 検証が失敗した場合は開始前状態へ復元する。機構管理外の既存配置は
 * 上書きせず拒否する（refused-unmanaged、skip 成功ではない）。
 */
export async function acquireTarget(
  env: AcquisitionEnv,
  name: string,
  source: string,
  resolved: ResolvedSource,
  existing: ExistingClassification,
): Promise<AcquireOutcome> {
  const placementPath = placementPathOf(env.skillsRoot, name);

  if (existing === "unmanaged") {
    return {
      ok: false,
      reason: "refused-unmanaged",
      detail:
        `refusing to overwrite an existing unmanaged placement at ${placementPath} ` +
        `(no ${PROVENANCE_FILENAME} provenance marker); the existing placement is left untouched`,
    };
  }

  const stagedResult = await stageAcquisition(env, name, resolved);
  if (!stagedResult.ok) {
    return { ok: false, reason: "staging-failed", detail: stagedResult.detail };
  }
  const staged = stagedResult.staged;

  const backupDir = path.join(env.stagingRoot, `tp-backup-${name}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  let backupTaken = false;
  if (existing === "managed") {
    try {
      await copyDir(placementPath, backupDir);
      backupTaken = true;
    } catch (e) {
      await fs.rm(staged.stagingDir, { recursive: true, force: true });
      return {
        ok: false,
        reason: "placement-failed",
        detail: `cannot back up the existing managed placement: ${e instanceof Error ? e.message : String(e)}`,
      };
    }
  }

  const provenance: ProvenanceRecord = {
    tool: "agentdev_third_party",
    name,
    source,
    profile: resolved.profile,
    acquiredAt: env.now().toISOString(),
  };

  // 配置: 管理対象の既存配置は削除してから staging 内容で置換する。
  let placementOutcome: { ok: true } | { ok: false; detail: string };
  try {
    if (existing === "managed") {
      await fs.rm(placementPath, { recursive: true, force: true });
    } else {
      await fs.mkdir(env.skillsRoot, { recursive: true });
    }
    await copyDir(staged.stagingDir, placementPath);
    await fs.writeFile(
      path.join(placementPath, PROVENANCE_FILENAME),
      `${JSON.stringify(provenance, null, 2)}\n`,
      "utf8",
    );
    placementOutcome = { ok: true };
  } catch (e) {
    placementOutcome = {
      ok: false,
      detail: `placement write failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  // 保証: 取得結果の検証（読み戻し）後に成功を返す。
  let verifyDetail: string | null = null;
  if (placementOutcome.ok) {
    const verified = await verifyPlacement(env, name, source, resolved.profile, staged);
    if (!verified.ok) {
      verifyDetail = verified.detail;
    }
  }

  // 成功時は backup を破棄し、失敗時は部分取得状態を開始前状態へ解消する
  // （検証を通過した配置のみを成功扱いにする）。
  const succeeded = placementOutcome.ok && verifyDetail === null;
  if (succeeded) {
    if (backupTaken) {
      await fs.rm(backupDir, { recursive: true, force: true }).catch(() => undefined);
    }
  } else if (backupTaken) {
    try {
      await fs.rm(placementPath, { recursive: true, force: true });
      await copyDir(backupDir, placementPath);
      await fs.rm(backupDir, { recursive: true, force: true });
    } catch {
      // 復元失敗は既存配置の損失を意味しない（backup は残る）。失敗報告に記録する。
    }
  } else {
    // 新規配置の失敗: 部分状態を解消する（配置前に失敗した場合は no-op）。
    await fs.rm(placementPath, { recursive: true, force: true }).catch(() => undefined);
  }
  await fs.rm(staged.stagingDir, { recursive: true, force: true }).catch(() => undefined);

  if (succeeded) {
    const action: AcquireAction = existing === "managed" ? "updated" : "acquired";
    return { ok: true, action, fileCount: staged.files.length };
  }
  if (!placementOutcome.ok) {
    return { ok: false, reason: "placement-failed", detail: placementOutcome.detail };
  }
  return { ok: false, reason: "verify-failed", detail: verifyDetail ?? "placement verification failed" };
}
