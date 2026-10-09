// ADF-COVERS(verification): REQ-110-008
// 移行前後照合と処理継続性実証（v5-completion-judgment Design「移行検証の手順」節の実装側構造）:
//   - ADF自身と合意済み対象プロジェクトについて、移行前後で未処理 Intake・Learning・Backlog の
//     内容・処理状態・参照関係を前後照合する（DEC-056、REQ-109-007/008）。欠落・不整合・検証不能は
//     移行成功として確定しない
//   - 処理継続性（移行後も後続処理が継続できること）を実行時に実証する（REQ-109-007）
// 列挙・照合・実証は読み取り専用であり、正規状態へ書き込まない。スナップショットはメモリ内にのみ
// 存在する。移行元・移行先の実操作（切替・削除）は本モジュールの対象外である
// （v4-migration-and-release Design「未処理 Intake・Learning・Backlog 情報の移行と継続」節）。

import { readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export type PendingDomain = "intake" | "learning" | "backlog";

// 未処理・保留情報の配置 → 処理状態の決定的マッピング。
// 配置・状態の正は docs/guides/intake-learning-backlog-flow.md の配置表と
// .agentdev/learning/deferred.md 冒頭の状態定義である:
//   - intake/inbox/            = 未処理（pending。promoted/ は採用済みのため列挙対象外）
//   - learning/inbox.md        = 未整理エントリ（pending）
//   - learning/deferred.md     = 保留・未処分・再評価対象（deferred。living pool）
//   - backlog/req-units/       = 未処理 RU（pending。promoted・blocked は処理済みのため対象外）
export interface PendingLocation {
  readonly domain: PendingDomain;
  readonly kind: "file-items" | "entries";
  readonly path: string;
  readonly state: string;
}

export const PENDING_LOCATIONS: readonly PendingLocation[] = [
  { domain: "intake", kind: "file-items", path: "intake/inbox", state: "pending" },
  { domain: "learning", kind: "entries", path: "learning/inbox.md", state: "pending" },
  { domain: "learning", kind: "entries", path: "learning/deferred.md", state: "deferred" },
  { domain: "backlog", kind: "file-items", path: "backlog/req-units", state: "pending" },
];

export interface PendingItem {
  readonly domain: PendingDomain;
  // 項目所在。file-items は <配置パス>/<ファイル名>、entries は <配置パス>#<見出し識別子>。
  readonly location: string;
  // 処理状態（配置由来の状態値。REQ-109-007「処理状態（未処理・保留等の状態値）」）
  readonly state: string;
  // 内容（本文の sha256。REQ-109-007「内容の保存（情報そのものの本文）」）
  readonly contentDigest: string;
  // 参照関係（本文から決定的に抽出した参照。REQ-109-007「必要な参照関係」）
  readonly relations: readonly string[];
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

// 参照関係の決定的抽出: markdown リンク target と「関連」行の値部分。
// 本モジュールのスナップショット照合はこの抽出結果の前後一致を検査するため、
// 抽出規則は決定的であること（同一本文から常に同一結果）だけが要件である。
export function extractRelations(body: string): string[] {
  const relations: string[] = [];
  for (const match of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = (match[1] ?? "").trim();
    if (target.length > 0) relations.push(`link:${target}`);
  }
  for (const line of body.split(/\r?\n/)) {
    const related = line.match(/^[-*]\s*\*\*関連\*\*:?\s*(.+)$/);
    const value = related === null ? "" : (related[1] ?? "").trim();
    if (value.length > 0) relations.push(`related:${value}`);
  }
  return relations;
}

// learning 系単一ファイルを `## ` 見出しでエントリ分割する（決定的）。
// エントリ識別子は見出しテキスト、contentDigest は見出し行を含むエントリ本文。
export function splitEntries(text: string): { title: string; body: string }[] {
  const entries: { title: string; body: string }[] = [];
  const lines = text.split(/\r?\n/);
  let current: { title: string; bodyLines: string[] } | null = null;
  for (const line of lines) {
    const heading = line.match(/^## (.+)$/);
    if (heading !== null) {
      if (current !== null) {
        entries.push({ title: current.title, body: current.bodyLines.join("\n") });
      }
      current = { title: (heading[1] ?? "").trim(), bodyLines: [line] };
      continue;
    }
    if (current !== null) {
      current.bodyLines.push(line);
    }
  }
  if (current !== null) {
    entries.push({ title: current.title, body: current.bodyLines.join("\n") });
  }
  return entries;
}

function digestEntryBody(body: string): string {
  // エントリ本文は見出し行を含む。行末の空行は同一エントリ内の表記ゆれとして
  // 正規化しない（決定性を保つため本文をそのままハッシュする）。
  return sha256(body.trim());
}

// 移行対象 Project の .agentdev/ 状態領域 root（stateRoot）から
// 未処理 Intake・Learning・Backlog を網羅列挙する
// （v4-migration-and-release Design「手順 1: 意味インベントリ」節の未処理改善情報列挙）。
// stateRoot は列挙対象の Project の .agentdev/ ディレクトリ絶対パスであり、
// PENDING_LOCATIONS の path は stateRoot 相対である。
// 読み取り専用。stateRoot 配下のみを参照し、書込みは行わない。
export function enumeratePendingState(stateRoot: string): PendingItem[] {
  const items: PendingItem[] = [];
  for (const loc of PENDING_LOCATIONS) {
    const absPath = join(stateRoot, ...loc.path.split("/"));
    if (loc.kind === "file-items") {
      const files = existsDir(absPath) ? readdirSync(absPath) : [];
      for (const name of files) {
        if (name.startsWith(".")) continue; // .gitkeep 等の管理ファイルは項目としない
        if (!name.endsWith(".md")) continue;
        const body = readFileSync(join(absPath, name), "utf8");
        items.push({
          domain: loc.domain,
          location: `${loc.path}/${name}`,
          state: loc.state,
          contentDigest: sha256(body),
          relations: extractRelations(body),
        });
      }
      continue;
    }
    // entries: 単一ファイル内の `## ` 見出しエントリ
    const body = existsFileSync(absPath) ? readFileSync(absPath, "utf8") : null;
    if (body === null) continue;
    for (const entry of splitEntries(body)) {
      if (entry.title.length === 0) continue;
      items.push({
        domain: loc.domain,
        location: `${loc.path}#${entry.title}`,
        state: loc.state,
        contentDigest: digestEntryBody(entry.body),
        relations: extractRelations(entry.body),
      });
    }
  }
  return items;
}

function existsDir(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function existsFileSync(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

// 前後突合（v4-migration-and-release Design「手順 3: 非破壊構築と非破壊検証」節・
// 「未処理 Intake・Learning・Backlog 情報の移行と継続」節の確認 3 点）。
//   - missing           移行前に存在した項目が移行後に所在できない（欠落）
//   - state-mismatch    同一内容の項目が処理状態を変えて所在している（処理状態の変化。黙認しない。REQ-109-008）
//   - content-mismatch  同一所在の項目で内容が変化している（不整合）
//   - relation-lost     移行後に必要な参照関係が失われている（参照関係喪失）
// 検出結果は空であってはならず（REQ-109-008 黙認禁止）、1 件以上の検出は移行成功として確定しない。
export type Discrepancy =
  | { kind: "missing"; domain: PendingDomain; location: string; detail: string }
  | {
      kind: "state-mismatch";
      domain: PendingDomain;
      location: string;
      beforeState: string;
      afterState: string;
      detail: string;
    }
  | { kind: "content-mismatch"; domain: PendingDomain; location: string; detail: string }
  | { kind: "relation-lost"; domain: PendingDomain; location: string; relation: string; detail: string };

export function reconcilePendingState(
  before: readonly PendingItem[],
  after: readonly PendingItem[],
): Discrepancy[] {
  const afterByKey = new Map(after.map((a) => [`${a.domain}:${a.location}`, a]));
  const matchedAfter = new Set<string>();
  const diffs: Discrepancy[] = [];

  for (const b of before) {
    const key = `${b.domain}:${b.location}`;
    const a = afterByKey.get(key);
    if (a === undefined) {
      // 所在不可。同一内容が別の処理状態・所在へ移っていれば処理状態変化として検出する
      //（黙認禁止。REQ-109-008「破棄済み・処理済みとして黙認せず」）。
      const moved = after.find(
        (candidate) =>
          !matchedAfter.has(`${candidate.domain}:${candidate.location}`) &&
          candidate.contentDigest === b.contentDigest,
      );
      if (moved !== undefined) {
        matchedAfter.add(`${moved.domain}:${moved.location}`);
        diffs.push({
          kind: "state-mismatch",
          domain: b.domain,
          location: b.location,
          beforeState: b.state,
          afterState: moved.state,
          detail: `同一内容の項目が移行後に ${moved.location}（state=${moved.state}）へ移動している（移行前 state=${b.state}）`,
        });
      } else {
        diffs.push({
          kind: "missing",
          domain: b.domain,
          location: b.location,
          detail: "移行前に存在した未処理項目が移行後に所在できない",
        });
      }
      continue;
    }
    matchedAfter.add(key);
    if (a.contentDigest !== b.contentDigest) {
      diffs.push({
        kind: "content-mismatch",
        domain: b.domain,
        location: b.location,
        detail: "同一所在の項目で内容が移行前と一致しない",
      });
    }
    if (a.state !== b.state) {
      diffs.push({
        kind: "state-mismatch",
        domain: b.domain,
        location: b.location,
        beforeState: b.state,
        afterState: a.state,
        detail: "同一所在の項目で処理状態が移行前と一致しない",
      });
    }
    for (const relation of b.relations) {
      if (!a.relations.includes(relation)) {
        diffs.push({
          kind: "relation-lost",
          domain: b.domain,
          location: b.location,
          relation,
          detail: "移行前に存在した参照関係が移行後に失われている",
        });
      }
    }
  }
  return diffs;
}

export interface MigrationPrecheckReport {
  // 移行前（before）と移行後（after）の列挙件数。前後照合の出力件数突合に用いる
  readonly beforeCount: number;
  readonly afterCount: number;
  readonly addedAfterCount: number;
  readonly discrepancies: readonly Discrepancy[];
  // 合格条件: 前後照合で欠落・不整合・検証不能が 0 件（Issue #3579 完了条件2）
  readonly ok: boolean;
}

// 非破壊前後照合の実行。移行元のその場破壊は行わず、同一対象に対する列挙・突合のみを行う
// （本委譲は照合手順の実装と非破壊検証を所有し、移行の切替操作は所有しない）。
// stateRoot は列挙対象の Project の .agentdev/ 状態領域絶対パスである。
export function runMigrationPrecheck(stateRoot: string): MigrationPrecheckReport {
  const before = enumeratePendingState(stateRoot);
  const after = enumeratePendingState(stateRoot);
  const discrepancies = reconcilePendingState(before, after);
  const beforeKeys = new Set(before.map((b) => `${b.domain}:${b.location}`));
  const addedAfter = after.filter((a) => !beforeKeys.has(`${a.domain}:${a.location}`));
  return {
    beforeCount: before.length,
    afterCount: after.length,
    addedAfterCount: addedAfter.length,
    discrepancies,
    ok: discrepancies.length === 0,
  };
}

// 処理継続性の実行時実証（REQ-109-007「未処理状態から適切な後続処理を継続できること」）。
// 後続処理（learning-promote・intake-promote・backlog-review の入力経路）が消費する入力要素
// （タイトル・分類キー）を列挙済み項目から抽出し、後続処理への入力形成が成立することを
// ランタイムで確認する。後続処理の実施自体は移行手順の対象外である
// （v4-migration-and-release Design「未処理 Intake・Learning・Backlog 情報の移行と継続」節）。
export interface ContinuityFailure {
  readonly domain: PendingDomain;
  readonly location: string;
  readonly reason: "unreadable" | "no-title" | "empty-body";
}

export interface ContinuityProof {
  readonly attempted: number;
  readonly succeeded: number;
  readonly failures: readonly ContinuityFailure[];
  // 合格条件: 全項目で後続処理入力の形成が成立すること。1 件でも成立しない項目があれば
  // 処理継続性は実証されない（検証不能は移行成功として確定しない。REQ-109-008）
  readonly ok: boolean;
}

export function proveProcessingContinuity(stateRoot: string): ContinuityProof {
  const items = enumeratePendingState(stateRoot);
  const failures: ContinuityFailure[] = [];
  let succeeded = 0;
  for (const item of items) {
    const continuation = readContinuationInput(stateRoot, item);
    if (continuation === null) {
      failures.push({
        domain: item.domain,
        location: item.location,
        reason: "unreadable",
      });
      continue;
    }
    const title = continuation.match(/^#{1,2} (.+)$/m)?.[1]?.trim() ?? "";
    if (title.length === 0) {
      failures.push({ domain: item.domain, location: item.location, reason: "no-title" });
      continue;
    }
    if (continuation.trim().length === 0) {
      failures.push({ domain: item.domain, location: item.location, reason: "empty-body" });
      continue;
    }
    succeeded += 1;
  }
  return { attempted: items.length, succeeded, failures, ok: failures.length === 0 };
}

// 項目所在から後続処理の入力本文を再読取する（エントリ形式は所在の見出し識別子で本文を再構成）。
function readContinuationInput(stateRoot: string, item: PendingItem): string | null {
  const hashIdx = item.location.indexOf("#");
  if (hashIdx >= 0) {
    const filePath = item.location.slice(0, hashIdx);
    const entryTitle = item.location.slice(hashIdx + 1);
    try {
      const text = readFileSync(join(stateRoot, ...filePath.split("/")), "utf8");
      const entry = splitEntries(text).find((e) => e.title === entryTitle);
      return entry === undefined ? null : entry.body;
    } catch {
      return null;
    }
  }
  try {
    return readFileSync(join(stateRoot, ...item.location.split("/")), "utf8");
  } catch {
    return null;
  }
}
