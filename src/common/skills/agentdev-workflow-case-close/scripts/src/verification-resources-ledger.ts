//
// 検証用一時資材の台帳（生成記録）モジュール。
// 様式の正は 検証用一時資材のライフサイクル Design「台帳（生成記録）」節:
// - 保存場所: メインrepo root の .agentdev/tmp/verification-resources/{案件識別子}.json
//   （gitignore 対象・非永続。worktree ライフサイクルをまたぐ案件スコープの記録は
//   メインroot側に置く。worktree-context 独立解決）
// - 空状態の区別: 台帳ファイル不在と記録ゼロを区別し、不在を「作成物なし」の
//   根拠にしない
// - 評価単位: 子 Issue の終了判定は子所有の一時資材のみを評価し、親・共通の
//   残存は親の管理する終了単位の全体未完了として機械判定する
// 純粋関数 + I/O 注入で構成し、単体テストは偽 I/O と実 fs の一時領域で行う。
//

import * as path from "node:path";
import { tmpdir } from "node:os";

const LEDGER_DIR_RELATIVE = ".agentdev/tmp/verification-resources";
const REGULAR_TEMP_AREA_RELATIVE = ".agentdev/tmp";

/** 一時資材の種別（Design 台帳データモデルの列挙に対応）。 */
export const VERIFICATION_RESOURCE_KINDS = [
  "remote",
  "clone",
  "bare-repository",
  "capture-log",
  "helper-script",
  "dedicated-server",
  "dedicated-process",
  "temporary-output",
] as const;

export type VerificationResourceKind = (typeof VERIFICATION_RESOURCE_KINDS)[number];

/** 所有区分（親・子・共通）。 */
export const VERIFICATION_RESOURCE_OWNERSHIPS = ["parent", "child", "common"] as const;

export type VerificationResourceOwnership = (typeof VERIFICATION_RESOURCE_OWNERSHIPS)[number];

/**
 * 台帳記録の基準（記録がどの契約経路で成立したかの区別）。
 * "creation-time-machine-registration" は作成入口（作成ヘルパー）の作成時機械登録。
 * "evidenced-occurrence-record" は既存実在物の実証された発生事実としての後追い記録
 * （作成時機械登録があった形で表示しない）。
 */
export const REGISTRATION_BASES = [
  "creation-time-machine-registration",
  "evidenced-occurrence-record",
] as const;

export type RegistrationBasis = (typeof REGISTRATION_BASES)[number];

/**
 * 削除確認の記録（利用者の明示確認の台帳追跡実体）。
 * source は user-explicit のみを許容する（実行担当が生成した approval 等の
 * 機械可読値は利用者確認として台帳へ記録しない）。
 */
export interface DeletionConfirmationRecord {
  /** 確認の発生源。user-explicit 固定。 */
  source: "user-explicit";
  /** 確認主体の識別。 */
  confirmedBy: string;
  /** 確認時刻（ISO 8601）。 */
  confirmedAt: string;
  /** 確認時点の識別情報スナップショット（台帳エントリの識別情報と突合する）。 */
  identifiers: Record<string, string>;
}

/** 台帳エントリ（Design 台帳データモデルの対応実体）。 */
export interface VerificationResourceEntry {
  /** 台帳内で一意の登録 ID（vr-{案件識別子}-{連番}）。 */
  id: string;
  /** 案件識別子（Case/Root Case/Epic Issue番号）。 */
  caseId: string;
  /** 種別。 */
  kind: VerificationResourceKind;
  /** 所在（絶対パスまたは URL）。 */
  location: string;
  /** 識別情報（パス、サイズ、内容ハッシュ、PID、コマンドライン、listenポート、URL、repo識別のうち確認できた項目。最低1項目）。 */
  identifiers: Record<string, string>;
  /** 回収担当（記録した入口の識別）。 */
  collector: string;
  /** 所有区分。 */
  ownership: VerificationResourceOwnership;
  /** ownership === "child" のとき必須の子 Issue 番号。それ以外は null。 */
  childIssue: number | null;
  /** 作成経路（記録主体）。 */
  recordedBy: string;
  /** 作成時刻（ISO 8601）。 */
  createdAt: string;
  /** 台帳記録の基準（作成時機械登録 / 既存実在物の発生事実としての後追い記録）。 */
  registrationBasis: RegistrationBasis;
  /** 回収済み時刻（未回収は null）。削除実行は回収記録（collectedAt）と削除確認記録（deletionConfirmation）の対で扱う。 */
  collectedAt: string | null;
  /** 削除確認の記録（回収が削除を伴う場合の利用者明示確認。記録がない場合は省略または null。旧形式の台帳との互換のため省略可能）。 */
  deletionConfirmation?: DeletionConfirmationRecord | null;
}

/** 登録入力（入口の実行処理から台帳へ渡す実体。boolean 申告ではなく記録実体）。 */
export interface VerificationResourceRegistrationInput {
  caseId: string;
  kind: VerificationResourceKind;
  location: string;
  identifiers: Record<string, string>;
  collector: string;
  ownership: VerificationResourceOwnership;
  childIssue: number | null;
  recordedBy: string;
  createdAt: string;
}

/** 台帳読取結果。不在と記録ゼロを区別する（空状態の区別）。 */
export interface LedgerReadResult {
  /** "missing": 台帳ファイル不在（記録欠落）。"present": 台帳ファイルが存在。 */
  state: "missing" | "present";
  entries: VerificationResourceEntry[];
}

/** 台帳 I/O 注入。単体テストでは偽 I/O、実行時は node 実装を使用する。 */
export interface LedgerIo {
  exists(absolutePath: string): boolean;
  readTextFile(absolutePath: string): string;
  writeTextFile(absolutePath: string, content: string): void;
  mkdirRecursive(absolutePath: string): void;
  /** メインrepo root の .git ディレクトリ絶対パスを返す（worktree cwd でもメインrepo の .git を指す）。 */
  gitCommonDir(): string;
}

/** 台帳ファイル形式の破損。fail-closed（破損台帳を空扱いにしない）。 */
export class LedgerFormatError extends Error {}

/** 登録入力の契約違反。fail-closed（必須項目欠落の登録を行わない）。 */
export class LedgerInputError extends Error {}

/** 台帳の保存場所（メインrepo root 基準・案件単位ファイル分離）。 */
export function resolveLedgerPath(mainRepoRoot: string, caseId: string): string {
  const root = mainRepoRoot.replace(/[\\/]+$/, "");
  if (root.length === 0) throw new LedgerInputError("mainRepoRoot is required");
  if (!isNonEmptyString(caseId)) throw new LedgerInputError("caseId is required");
  return path.join(root, LEDGER_DIR_RELATIVE, `${caseId}.json`);
}

/**
 * メインrepo root の解決（worktree-context 独立）。
 * git rev-parse --path-format=absolute --git-common-dir の返り値（メインrepo の .git）
 * の親ディレクトリをメインrepo root とする。worktree 内の cwd から呼んでもメインrepo root を返す。
 */
export function resolveMainRepoRoot(io: LedgerIo): string {
  const commonDir = io.gitCommonDir().trim();
  if (!isNonEmptyString(commonDir)) {
    throw new LedgerFormatError("git rev-parse --path-format=absolute --git-common-dir returned an empty value");
  }
  const root = path.dirname(commonDir);
  if (root === commonDir) {
    throw new LedgerFormatError(`could not derive main repo root from the git common dir: ${commonDir}`);
  }
  return root;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * 削除確認記録フィールドの解析。キー不在は undefined（旧形式の台帳との互換）、
 * null は明示的な記録なしとして許容する。値が存在する場合は必須項目と列挙値を
 * 検査し、違反は LedgerFormatError（fail-closed）。
 */
function parseDeletionConfirmation(value: unknown): DeletionConfirmationRecord | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new LedgerFormatError("ledger entry.deletionConfirmation must be an object or null");
  }
  const v = value as Record<string, unknown>;
  if (v.source !== "user-explicit") {
    throw new LedgerFormatError(
      "ledger entry.deletionConfirmation.source must be user-explicit (machine-readable values are not recorded as user confirmation)",
    );
  }
  if (!isNonEmptyString(v.confirmedBy)) {
    throw new LedgerFormatError("ledger entry.deletionConfirmation.confirmedBy is required");
  }
  if (!isNonEmptyString(v.confirmedAt)) {
    throw new LedgerFormatError("ledger entry.deletionConfirmation.confirmedAt is required");
  }
  const identifiers = v.identifiers;
  if (
    typeof identifiers !== "object" ||
    identifiers === null ||
    Array.isArray(identifiers) ||
    Object.keys(identifiers).length === 0 ||
    !Object.values(identifiers).every((identifierValue) => typeof identifierValue === "string")
  ) {
    throw new LedgerFormatError(
      "ledger entry.deletionConfirmation.identifiers must be a non-empty object of string values",
    );
  }
  return {
    source: "user-explicit",
    confirmedBy: v.confirmedBy as string,
    confirmedAt: v.confirmedAt as string,
    identifiers: identifiers as Record<string, string>,
  };
}

function parseEntry(raw: unknown, seenIds: Set<string>): VerificationResourceEntry {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new LedgerFormatError("ledger entry must be a JSON object");
  }
  const v = raw as Record<string, unknown>;
  const requiredString = (field: string): string => {
    if (!isNonEmptyString(v[field])) throw new LedgerFormatError(`ledger entry.${field} is required`);
    return v[field] as string;
  };
  const id = requiredString("id");
  if (seenIds.has(id)) throw new LedgerFormatError(`ledger entry id is duplicated: ${id}`);
  seenIds.add(id);
  const caseId = requiredString("caseId");
  const kind = requiredString("kind");
  if (!(VERIFICATION_RESOURCE_KINDS as readonly string[]).includes(kind)) {
    throw new LedgerFormatError(
      `ledger entry.kind must be one of: ${VERIFICATION_RESOURCE_KINDS.join(", ")} (got: ${kind})`,
    );
  }
  const location = requiredString("location");
  const identifiers = v.identifiers;
  if (
    typeof identifiers !== "object" ||
    identifiers === null ||
    Array.isArray(identifiers) ||
    Object.keys(identifiers).length === 0 ||
    !Object.values(identifiers).every((value) => typeof value === "string")
  ) {
    throw new LedgerFormatError("ledger entry.identifiers must be a non-empty object of string values");
  }
  const collector = requiredString("collector");
  const ownership = requiredString("ownership");
  if (!(VERIFICATION_RESOURCE_OWNERSHIPS as readonly string[]).includes(ownership)) {
    throw new LedgerFormatError(
      `ledger entry.ownership must be one of: ${VERIFICATION_RESOURCE_OWNERSHIPS.join(", ")} (got: ${ownership})`,
    );
  }
  const childIssue = v.childIssue;
  if (childIssue !== null && typeof childIssue !== "number") {
    throw new LedgerFormatError("ledger entry.childIssue must be a number or null");
  }
  if (ownership === "child" && typeof childIssue !== "number") {
    throw new LedgerFormatError("ledger entry.childIssue is required when ownership is child");
  }
  if (ownership !== "child" && childIssue !== null) {
    throw new LedgerFormatError("ledger entry.childIssue must be null unless ownership is child");
  }
  const recordedBy = requiredString("recordedBy");
  const createdAt = requiredString("createdAt");
  const registrationBasis = v.registrationBasis;
  if (registrationBasis === undefined) {
    // 旧形式の台帳（registrationBasis 記述のない既存行）は作成時機械登録入口経由の
    // 記録として読む（後追い記録入口は registrationBasis を必ず書くため、不在＝旧形式）。
  } else if (
    !(REGISTRATION_BASES as readonly string[]).includes(registrationBasis as string)
  ) {
    throw new LedgerFormatError(
      `ledger entry.registrationBasis must be one of: ${REGISTRATION_BASES.join(", ")} (got: ${String(registrationBasis)})`,
    );
  }
  const collectedAt = v.collectedAt;
  if (collectedAt !== null && !isNonEmptyString(collectedAt)) {
    throw new LedgerFormatError("ledger entry.collectedAt must be a non-empty string or null");
  }
  const deletionConfirmation = parseDeletionConfirmation(v.deletionConfirmation);
  return {
    id,
    caseId,
    kind: kind as VerificationResourceKind,
    location,
    identifiers: identifiers as Record<string, string>,
    collector,
    ownership: ownership as VerificationResourceOwnership,
    childIssue,
    recordedBy,
    createdAt,
    registrationBasis:
      registrationBasis === undefined
        ? "creation-time-machine-registration"
        : (registrationBasis as RegistrationBasis),
    collectedAt: collectedAt as string | null,
    ...(deletionConfirmation !== undefined ? { deletionConfirmation } : {}),
  };
}

/** 台帳テキストの解析。破損は LedgerFormatError（fail-closed。破損台帳を空扱いにしない）。 */
export function parseLedgerText(text: string): VerificationResourceEntry[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new LedgerFormatError(
      "ledger file is empty (a missing entry delimiter is treated as malformed, not as zero creations)",
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (cause) {
    throw new LedgerFormatError(`ledger file is not valid JSON: ${String(cause)}`);
  }
  if (!Array.isArray(parsed)) {
    throw new LedgerFormatError("ledger file must be a JSON array of entries");
  }
  const seenIds = new Set<string>();
  return parsed.map((raw) => parseEntry(raw, seenIds));
}

/** 台帳エントリ一覧の直列化。 */
export function serializeLedger(entries: readonly VerificationResourceEntry[]): string {
  return `${JSON.stringify(entries, null, 2)}\n`;
}

/** 台帳ファイルの読取。不在は state: "missing"、存在は state: "present"（記録ゼロを含む）。 */
export function readLedger(io: LedgerIo, ledgerPath: string): LedgerReadResult {
  if (!io.exists(ledgerPath)) {
    return { state: "missing", entries: [] };
  }
  return { state: "present", entries: parseLedgerText(io.readTextFile(ledgerPath)) };
}

/**
 * 「作成物なし」の根拠判定。台帳ファイルが存在し記録ゼロのときだけ true。
 * 台帳不在（記録欠落）を「作成物なし」の根拠にしない（空状態の区別）。
 */
export function isConfirmedEmptyBasis(readResult: LedgerReadResult): boolean {
  return readResult.state === "present" && readResult.entries.length === 0;
}

/**
 * 作成先確認（専用領域配置・作成経路の制限の機械拒否面）。
 * ファイルシステム パス形の所在は、環境指定TEMP配下またはプロジェクト内正規一時領域
 * （repo root の .agentdev/tmp/）に限り許可し、プロジェクト親ディレクトリ等の作成先違反を
 * 拒否する。リポジトリ内部は正規一時領域（.agentdev/tmp/）配下のみ許可し、それ以外の
 * repo 内領域は拒否する。パスは node:path の標準APIで解決して境界判定し、`..` による
 * 境界外逃げを許可しない。パス要素に案件番号が含まれることは許可根拠にしない。
 * URL形・疑似スキーマ所在（process:pid=… 等）は作成先確認の対象外とする。
 * 正は 検証用一時資材のライフサイクル Design「専用領域と作成経路の制限」節。
 */
export interface CreationDestinationEvaluation {
  valid: boolean;
  /** 許可根拠（env-temp-area / repo-regular-temp-area / non-path-location）。invalid 時は null。 */
  basis: string | null;
  /** 拒否理由。許可時は null。 */
  reason: string | null;
}

function isPathLikeLocation(location: string): boolean {
  return (
    /^[a-zA-Z]:[\\/]/.test(location) ||
    location.startsWith("//") ||
    location.startsWith("\\\\") ||
    location.startsWith("/") ||
    location.startsWith("\\") ||
    location.startsWith("./") ||
    location.startsWith("../")
  );
}

function isAbsoluteLocation(location: string): boolean {
  return (
    /^[a-zA-Z]:[\\/]/.test(location) ||
    location.startsWith("//") ||
    location.startsWith("\\\\") ||
    location.startsWith("/") ||
    location.startsWith("\\")
  );
}

function isUnderDestinationPath(candidate: string, base: string): boolean {
  const relative = path.relative(base, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function evaluateCreationDestination(
  location: string,
  mainRepoRoot: string,
  tempRoot: string,
): CreationDestinationEvaluation {
  if (!isPathLikeLocation(location)) {
    return { valid: true, basis: "non-path-location", reason: null };
  }
  if (!isAbsoluteLocation(location)) {
    return {
      valid: false,
      basis: null,
      reason:
        "relative destination paths are not permitted; use an absolute path under the environment-designated TEMP area or the project-internal regular temporary area (.agentdev/tmp/)",
    };
  }
  const resolved = path.resolve(location);
  if (isUnderDestinationPath(resolved, path.resolve(tempRoot))) {
    return { valid: true, basis: "env-temp-area", reason: null };
  }
  const resolvedRepo = path.resolve(mainRepoRoot);
  if (isUnderDestinationPath(resolved, resolvedRepo)) {
    if (isUnderDestinationPath(resolved, path.join(resolvedRepo, REGULAR_TEMP_AREA_RELATIVE))) {
      return { valid: true, basis: "repo-regular-temp-area", reason: null };
    }
    return {
      valid: false,
      basis: null,
      reason:
        "creation inside the repository is permitted only under the project-internal regular temporary area (.agentdev/tmp/); other repository areas are not permitted destinations",
    };
  }
  return {
    valid: false,
    basis: null,
    reason:
      "creation destination is not permitted: only the environment-designated TEMP area or the project-internal regular temporary area (.agentdev/tmp/ under the repository root) is allowed; the presence of the case identifier in a path segment is not a permission basis, so the project parent directory and arbitrary paths are rejected",
  };
}

/** 登録入力の契約検証。必須項目欠落・列挙外の値は LedgerInputError（fail-closed）。 */
export function validateRegistrationInput(input: unknown): VerificationResourceRegistrationInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new LedgerInputError("registration input must be an object");
  }
  const v = input as Record<string, unknown>;
  const nonEmpty = (field: string): string => {
    if (!isNonEmptyString(v[field])) throw new LedgerInputError(`registration input.${field} is required`);
    return (v[field] as string).trim();
  };
  const caseId = nonEmpty("caseId");
  const kind = nonEmpty("kind");
  if (!(VERIFICATION_RESOURCE_KINDS as readonly string[]).includes(kind)) {
    throw new LedgerInputError(
      `registration input.kind must be one of: ${VERIFICATION_RESOURCE_KINDS.join(", ")} (got: ${kind})`,
    );
  }
  const location = nonEmpty("location");
  const identifiers = v.identifiers;
  if (typeof identifiers !== "object" || identifiers === null || Array.isArray(identifiers)) {
    throw new LedgerInputError("registration input.identifiers must be an object of string values");
  }
  const identifierRecord: Record<string, string> = {};
  for (const [key, value] of Object.entries(identifiers as Record<string, unknown>)) {
    if (!isNonEmptyString(key) || !isNonEmptyString(value)) {
      throw new LedgerInputError("registration input.identifiers must be non-empty string key/value pairs");
    }
    identifierRecord[key] = value;
  }
  if (Object.keys(identifierRecord).length === 0) {
    throw new LedgerInputError("registration input.identifiers requires at least one identification entry");
  }
  const collector = nonEmpty("collector");
  const ownership = nonEmpty("ownership");
  if (!(VERIFICATION_RESOURCE_OWNERSHIPS as readonly string[]).includes(ownership)) {
    throw new LedgerInputError(
      `registration input.ownership must be one of: ${VERIFICATION_RESOURCE_OWNERSHIPS.join(", ")} (got: ${ownership})`,
    );
  }
  const childIssue = v.childIssue;
  if (childIssue !== null && typeof childIssue !== "number") {
    throw new LedgerInputError("registration input.childIssue must be a number or null");
  }
  if (ownership === "child" && typeof childIssue !== "number") {
    throw new LedgerInputError("registration input.childIssue is required when ownership is child");
  }
  if (ownership !== "child" && childIssue !== null) {
    throw new LedgerInputError("registration input.childIssue must be null unless ownership is child");
  }
  const recordedBy = nonEmpty("recordedBy");
  const createdAt = nonEmpty("createdAt");
  return {
    caseId,
    kind: kind as VerificationResourceKind,
    location,
    identifiers: identifierRecord,
    collector,
    ownership: ownership as VerificationResourceOwnership,
    childIssue,
    recordedBy,
    createdAt,
  };
}

/** 台帳への追記。登録 ID は既存記録数から決定的連番を採番する（既存 ID との重複は回避）。 */
export function appendEntry(
  entries: readonly VerificationResourceEntry[],
  input: VerificationResourceRegistrationInput,
  registrationBasis: RegistrationBasis = "creation-time-machine-registration",
): { entry: VerificationResourceEntry; entries: VerificationResourceEntry[] } {
  const existingIds = new Set(entries.map((entry) => entry.id));
  let seq = entries.length + 1;
  let id = `vr-${input.caseId}-${seq}`;
  while (existingIds.has(id)) {
    seq += 1;
    id = `vr-${input.caseId}-${seq}`;
  }
  const entry: VerificationResourceEntry = {
    id,
    caseId: input.caseId,
    kind: input.kind,
    location: input.location,
    identifiers: { ...input.identifiers },
    collector: input.collector,
    ownership: input.ownership,
    childIssue: input.childIssue,
    recordedBy: input.recordedBy,
    createdAt: input.createdAt,
    registrationBasis,
    collectedAt: null,
  };
  return { entry, entries: [...entries, entry] };
}

/**
 * 過去生成物の実証された発生事実としての台帳追記（後追い記録入口）。
 * 既存実在物の所在記録であり新規作成ではないため、作成先確認（新規作成の作成先拒否）は
 * 実施しない。registrationBasis は固定で evidenced-occurrence-record を付与し、
 * 作成時機械登録があった形での記録をしない（発生事実の誠実な表現）。
 * 台帳不在の案件では新規台帳を作成して追記する（registerResource と同一の保存先契約）。
 */
export function recordOccurrenceFact(
  io: LedgerIo,
  mainRepoRoot: string,
  input: VerificationResourceRegistrationInput,
): { ok: true; ledgerPath: string; entryId: string; entryCount: number } {
  const validated = validateRegistrationInput(input);
  const ledgerPath = resolveLedgerPath(mainRepoRoot, validated.caseId);
  const read = readLedger(io, ledgerPath);
  const { entry, entries } = appendEntry(read.entries, validated, "evidenced-occurrence-record");
  io.mkdirRecursive(path.dirname(ledgerPath));
  io.writeTextFile(ledgerPath, serializeLedger(entries));
  return { ok: true, ledgerPath, entryId: entry.id, entryCount: entries.length };
}

/**
 * 作成と同時の台帳登録（作成ヘルパーの本体）。登録→作成先確認→保存を1回の呼出で行い、
 * 登録結果（登録 ID・台帳パス・記録数）を返す。台帳不在の案件では新規台帳を作成する。
 * 作成先確認（環境指定TEMPまたはプロジェクト内正規一時領域への制限）で違反の所在は
 * 台帳を書換えずに拒否する。
 */
export function registerResource(
  io: LedgerIo,
  mainRepoRoot: string,
  input: VerificationResourceRegistrationInput,
  options: { tempRoot?: string } = {},
): { ok: true; ledgerPath: string; entryId: string; entryCount: number } {
  const validated = validateRegistrationInput(input);
  const destination = evaluateCreationDestination(
    validated.location,
    mainRepoRoot,
    options.tempRoot ?? tmpdir(),
  );
  if (!destination.valid) {
    throw new LedgerInputError(
      `registration input.location rejected by the creation destination check: ${validated.location} (${destination.reason})`,
    );
  }
  const ledgerPath = resolveLedgerPath(mainRepoRoot, validated.caseId);
  const read = readLedger(io, ledgerPath);
  const { entry, entries } = appendEntry(
    read.entries,
    validated,
    "creation-time-machine-registration",
  );
  io.mkdirRecursive(path.dirname(ledgerPath));
  io.writeTextFile(ledgerPath, serializeLedger(entries));
  return { ok: true, ledgerPath, entryId: entry.id, entryCount: entries.length };
}

/** 子完了判定の結果（評価単位の機械判定）。 */
export interface ChildCompletionEvaluation {
  /** 子所有の一時資材の総数。 */
  childOwnedTotal: number;
  /** 子所有の未回収数。 */
  childOwnedUncollected: number;
  /** 子close許可（子所有のみの評価で決まる）。 */
  childClosePermitted: boolean;
  /** 親・共通の残存（子close許可判定に含めないが、全体未完了判定の材料）。 */
  parentOrCommonResidue: readonly { id: string; ownership: VerificationResourceOwnership }[];
  /** 親の管理する終了単位の全体未完了（親・共通の残存時に true）。 */
  terminationUnitBlocked: boolean;
}

/**
 * 子 Issue 完了時の評価単位判定。子closeは子所有の一時資材のみを評価し、
 * 親・共通の残存は子close許可に影響しない。一方、親・共通の残存時は
 * 親の管理する終了単位（全体）を未完了として機械判定する。
 */
export function evaluateChildCompletion(
  entries: readonly VerificationResourceEntry[],
  childIssueNumber: number,
): ChildCompletionEvaluation {
  const childOwned = entries.filter((entry) => entry.ownership === "child" && entry.childIssue === childIssueNumber);
  const childOwnedUncollected = childOwned.filter((entry) => entry.collectedAt === null);
  const parentOrCommonResidue = entries
    .filter(
      (entry) =>
        (entry.ownership === "parent" || entry.ownership === "common") &&
        entry.collectedAt === null,
    )
    .map((entry) => ({ id: entry.id, ownership: entry.ownership }));
  return {
    childOwnedTotal: childOwned.length,
    childOwnedUncollected: childOwnedUncollected.length,
    childClosePermitted: childOwnedUncollected.length === 0,
    parentOrCommonResidue,
    terminationUnitBlocked: parentOrCommonResidue.length > 0,
  };
}

/** 親の管理する終了単位の判定結果（親の最終終了時は全所有区分を評価する）。 */
export interface ParentTerminationUnitEvaluation {
  total: number;
  uncollected: number;
  uncollectedByOwnership: Readonly<Record<VerificationResourceOwnership, number>>;
  /** 全件回収済みのとき true。 */
  terminationUnitComplete: boolean;
}

/** 親の管理する終了単位の評価。親・共通・子の全件を評価する。 */
export function evaluateParentTerminationUnit(
  entries: readonly VerificationResourceEntry[],
): ParentTerminationUnitEvaluation {
  const uncollectedByOwnership: Record<VerificationResourceOwnership, number> = {
    parent: 0,
    child: 0,
    common: 0,
  };
  let uncollected = 0;
  for (const entry of entries) {
    if (entry.collectedAt !== null) continue;
    uncollected += 1;
    uncollectedByOwnership[entry.ownership] += 1;
  }
  return {
    total: entries.length,
    uncollected,
    uncollectedByOwnership,
    terminationUnitComplete: uncollected === 0,
  };
}

/** 削除確認記録付与の入力違反。 */
function validateDeletionConfirmationRecordInput(record: unknown): DeletionConfirmationRecord {
  if (typeof record !== "object" || record === null || Array.isArray(record)) {
    throw new LedgerInputError("deletion confirmation record must be an object");
  }
  const v = record as Record<string, unknown>;
  if (v.source !== "user-explicit") {
    throw new LedgerInputError(
      "deletion confirmation record.source must be user-explicit (machine-readable values are not recorded as user confirmation)",
    );
  }
  if (!isNonEmptyString(v.confirmedBy)) {
    throw new LedgerInputError("deletion confirmation record.confirmedBy is required");
  }
  if (!isNonEmptyString(v.confirmedAt)) {
    throw new LedgerInputError("deletion confirmation record.confirmedAt is required");
  }
  const identifiers = v.identifiers;
  if (
    typeof identifiers !== "object" ||
    identifiers === null ||
    Array.isArray(identifiers) ||
    Object.keys(identifiers).length === 0 ||
    !Object.values(identifiers).every((identifierValue) => typeof identifierValue === "string")
  ) {
    throw new LedgerInputError(
      "deletion confirmation record.identifiers must be a non-empty object of string values",
    );
  }
  return {
    source: "user-explicit",
    confirmedBy: (v.confirmedBy as string).trim(),
    confirmedAt: (v.confirmedAt as string).trim(),
    identifiers: identifiers as Record<string, string>,
  };
}

/**
 * 台帳エントリへの削除確認記録の付与。機械可読値のみの確認（source が
 * user-explicit 以外）は台帳へ記録せず拒否する。既に削除確認記録があるエントリ
 * への再付与は記録の上書きになるため拒否する（fail-closed）。台帳不在・対象
 * エントリ不在も LedgerInputError で拒否する。
 */
export function recordDeletionConfirmation(
  io: LedgerIo,
  mainRepoRoot: string,
  caseId: string,
  entryId: string,
  record: unknown,
): { ok: true; ledgerPath: string; entryId: string } {
  if (!isNonEmptyString(entryId)) throw new LedgerInputError("entryId is required");
  const validated = validateDeletionConfirmationRecordInput(record);
  const ledgerPath = resolveLedgerPath(mainRepoRoot, caseId);
  const read = readLedger(io, ledgerPath);
  if (read.state === "missing") {
    throw new LedgerInputError(`ledger for case ${caseId} does not exist (recording to a missing ledger is refused)`);
  }
  const target = read.entries.find((entry) => entry.id === entryId);
  if (target === undefined) {
    throw new LedgerInputError(`ledger entry not found: ${entryId}`);
  }
  if (target.deletionConfirmation !== undefined && target.deletionConfirmation !== null) {
    throw new LedgerInputError(`ledger entry already has a deletion confirmation record: ${entryId}`);
  }
  const entries = read.entries.map((entry) =>
    entry.id === entryId ? { ...entry, deletionConfirmation: validated } : entry,
  );
  io.writeTextFile(ledgerPath, serializeLedger(entries));
  return { ok: true, ledgerPath, entryId };
}

/**
 * 台帳エントリへの回収（削除実行）記録の付与。削除確認記録（deletionConfirmation）
 * のないエントリへの付与は、削除確認なしの回収記録になるため拒否する（fail-closed）。
 * collectedAt の再付与（上書き）も拒否する。
 */
export function markEntryCollected(
  io: LedgerIo,
  mainRepoRoot: string,
  caseId: string,
  entryId: string,
  collectedAt: string,
): { ok: true; ledgerPath: string; entryId: string } {
  if (!isNonEmptyString(entryId)) throw new LedgerInputError("entryId is required");
  if (!isNonEmptyString(collectedAt)) throw new LedgerInputError("collectedAt is required");
  const ledgerPath = resolveLedgerPath(mainRepoRoot, caseId);
  const read = readLedger(io, ledgerPath);
  if (read.state === "missing") {
    throw new LedgerInputError(`ledger for case ${caseId} does not exist (recording to a missing ledger is refused)`);
  }
  const target = read.entries.find((entry) => entry.id === entryId);
  if (target === undefined) {
    throw new LedgerInputError(`ledger entry not found: ${entryId}`);
  }
  if (target.deletionConfirmation === undefined || target.deletionConfirmation === null) {
    throw new LedgerInputError(
      `ledger entry has no deletion confirmation record (collected without confirmation is refused): ${entryId}`,
    );
  }
  if (target.collectedAt !== null) {
    throw new LedgerInputError(`ledger entry is already collected: ${entryId} (collectedAt=${target.collectedAt})`);
  }
  const entries = read.entries.map((entry) =>
    entry.id === entryId ? { ...entry, collectedAt: collectedAt.trim() } : entry,
  );
  io.writeTextFile(ledgerPath, serializeLedger(entries));
  return { ok: true, ledgerPath, entryId };
}
