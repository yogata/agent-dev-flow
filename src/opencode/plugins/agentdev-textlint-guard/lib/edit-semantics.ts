// agentdev-textlint-guard lib: ガード間共有の編集意味論共通部（純関数核）。
//
// Design「共有 detector と adapter の契約」節
// （docs/designs/integrity/distribution-boundary.md、B3-5a）に基づき、
// write / edit / apply_patch の tool 引数解析と完成予定全文の再構成を
// 1箇所で管理する。各ガード（textlint 書込み前 guard、配布依存境界 guard）は
// この共通部の解析・再構成結果に対して、固有の拒否条件のみを所有する。
//
// 配置契約: 本モジュールは consumer 配布対象 plugin（agentdev-textlint-guard）
// の package 内に配置する。配布物は導入先で解決不能な producer 内部領域
// （src/common/ 等）へ依存しない（producer 側の配布制約と、配布ソース面の
// 解決不能参照を防ぐ契約による）。repo-local の
// 配布依存境界 guard 側（src/common/guards/distribution-boundary/）からは
// canonical detector への逆向き参照と同種の repo-local 間参照で本モジュールを
// 参照する。本モジュール本文は host 非依存（ホスト名、起動 API、実行制御を
// 固定しない純関数）である。
//
// 共通部の試験は1箇所で管理する（tests/edit-semantics.test.ts）。
// 各ガードの固有の拒否条件の試験は各ガードが保持する。
// 解析不能・検査不能を許可へ変えない保証（fail-closed）は双方のガードで維持する。
//
// - write  : file_path + content（新規作成と更新の両方で content が全文）
// - edit   : 現行ディスク内容に old_string → new_string 置換を適用した全文
//            （改行正規化は現行 tool と同じ意味論: 入力を LF 正規化し、
//             ファイルの改行を検出して再適用する）
// - apply_patch: V4A パッチ（*** Begin Patch / End Patch、Add / Update / Delete / Move to、
//            @@ コンテキスト付きチャンク）を解析し、全対象ファイルの完成予定全文を組む
//
// 適用結果の意味論は OpenCode v1.18.29 の tool 実装（write.ts / edit.ts /
// apply_patch.ts / patch/index.ts、MIT license）に合わせている。
// 副作用なし（side-effect-free）。同一入力に対し同一解析・同一再構成を返す。

// ---------------------------------------------------------------------------
// tool 引数の型解析（OpenCode 1.18.x 形式）
// ---------------------------------------------------------------------------
//
// OpenCode 1.18.x tool schemas:
//   write       -> { filePath: string, content: string }
//   edit        -> { filePath: string, oldString: string, newString: string, replaceAll?: boolean }
//   apply_patch -> { patchText: string }
//
// `path` は旧 SDK 名称の legacy alias であり、存在する場合は優先する。
// 欠落・非文字列・空文字列は undefined として正直に返し、受理判断は
// 各ガードの固有条件が行う（共通部は拒否条件を所有しない）。

export interface ParsedWriteArgs {
  readonly filePath: string | undefined;
  readonly content: string | undefined;
}

export interface ParsedEditArgs {
  readonly filePath: string | undefined;
  readonly oldString: string | undefined;
  readonly newString: string | undefined;
  readonly replaceAll: boolean | undefined;
}

export interface ParsedApplyPatchArgs {
  readonly patchText: string | undefined;
}

function readPathArg(args: Record<string, unknown>): string | undefined {
  const raw = args["path"] !== undefined ? args["path"] : args["filePath"];
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

function readStringArg(args: Record<string, unknown>, key: string): string | undefined {
  const raw = args[key];
  return typeof raw === "string" ? raw : undefined;
}

function readBooleanArg(args: Record<string, unknown>, key: string): boolean | undefined {
  const raw = args[key];
  return typeof raw === "boolean" ? raw : undefined;
}

/** 引数の存在確認（undefined でないこと）。無効型の検出判断に使う（受理判断は各ガード）。 */
export function hasArg(args: Record<string, unknown>, key: string): boolean {
  return args[key] !== undefined;
}

/** write 引数の型解析。欠落・非文字列は undefined。 */
export function parseWriteToolArgs(args: Record<string, unknown>): ParsedWriteArgs {
  return {
    filePath: readPathArg(args),
    content: readStringArg(args, "content"),
  };
}

/** edit 引数の型解析。欠落・非文字列は undefined。 */
export function parseEditToolArgs(args: Record<string, unknown>): ParsedEditArgs {
  return {
    filePath: readPathArg(args),
    oldString: readStringArg(args, "oldString"),
    newString: readStringArg(args, "newString"),
    replaceAll: readBooleanArg(args, "replaceAll"),
  };
}

/** apply_patch 引数の型解析。欠落・非文字列は undefined。 */
export function parseApplyPatchToolArgs(args: Record<string, unknown>): ParsedApplyPatchArgs {
  return {
    patchText: readStringArg(args, "patchText"),
  };
}

// ---------------------------------------------------------------------------
// ファイル読込の注入契約
// ---------------------------------------------------------------------------

/**
 * ファイル読込契約。内容を文字列で返す。読めない場合（不在、権限等）は null。
 * throw も許容し、呼出側は fail-closed として扱う。
 */
export type FileReader = (path: string) => string | null;

/**
 * 注入された reader での安全読込。reader が null を返した場合も throw した場合も
 * null に正規化する。throw を「検査不能」として隠さないため、呼出側は
 * null を fail-closed として扱う。
 */
export function safeReadFile(readFile: FileReader, path: string): string | null {
  try {
    return readFile(path);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// edit の置換適用（現行 tool 意味論）
// ---------------------------------------------------------------------------

/** edit 適用の結果。matchCount は正規化後 oldString の出現数（ガードの固有条件が消費できる）。 */
export interface EditApplication {
  readonly content: string;
  readonly matchCount: number;
}

export type EditApplyOutcome =
  | { readonly ok: true; readonly result: EditApplication }
  | { readonly ok: false; readonly reason: "old-string-not-found" | "empty-old-string-with-replace-all" };

function normalizeLineEndings(text: string, ending: "\n" | "\r\n"): string {
  const lf = text.replaceAll("\r\n", "\n");
  if (ending === "\n") return lf;
  return lf.replaceAll("\n", "\r\n");
}

/**
 * 現行内容への edit 適用（現行 tool と同じ意味論）。
 * - 入力を現行内容の改行形式（CRLF 検出）へ正規化してから完全一致で置換する
 * - 空 oldString + 非replaceAll は先頭への挿入（matchCount 0）
 * - 空 oldString + replaceAll は適用不能（fail-closed）
 * - replaceAll は全置換、それ以外は最初の1箇所を置換する
 *   （一意性を要求するかどうかはガードの固有条件が matchCount で判断する）
 */
export function applyEditToContent(
  currentContent: string,
  oldString: string,
  newString: string,
  replaceAll: boolean,
): EditApplyOutcome {
  if (oldString === "") {
    if (replaceAll) return { ok: false, reason: "empty-old-string-with-replace-all" };
    return { ok: true, result: { content: newString + currentContent, matchCount: 0 } };
  }
  const ending: "\n" | "\r\n" = currentContent.includes("\r\n") ? "\r\n" : "\n";
  const old = normalizeLineEndings(oldString, ending);
  const replacement = normalizeLineEndings(newString, ending);
  const matchCount = currentContent.split(old).length - 1;
  if (matchCount === 0) return { ok: false, reason: "old-string-not-found" };
  const content = replaceAll
    ? currentContent.split(old).join(replacement)
    : currentContent.slice(0, currentContent.indexOf(old)) +
      replacement +
      currentContent.slice(currentContent.indexOf(old) + old.length);
  return { ok: true, result: { content, matchCount } };
}

// ---------------------------------------------------------------------------
// V4A patch（OpenCode apply_patch 形式）の解析
// ---------------------------------------------------------------------------

export interface UpdateChunk {
  readonly oldLines: readonly string[];
  readonly newLines: readonly string[];
  readonly changeContext?: string;
  readonly isEndOfFile?: boolean;
}

/** 解析された1操作。bodyLines は生行（`+`/`-`/` `/`@@`/`*** End of File` を保持）。 */
export interface PatchEntryCore {
  readonly kind: "add" | "update" | "delete";
  readonly path: string;
  /** move 先（*** Move to）。update 以外は null。 */
  readonly moveTo: string | null;
  /** 本文の生行（プレフィックス保持）。dist-boundary 側の検査構成が消費する。 */
  readonly bodyLines: readonly string[];
  /** kind === "add" の完成予定全文（`+` 行連結、末尾改行1つを除去）。 */
  readonly addContent: string;
  /** kind === "update" のチャンク（oldLines/newLines 分離済み）。 */
  readonly chunks: readonly UpdateChunk[];
}

/** パッチ本文内の分類不能行（裸行）の記録。行番号はパッチ全文を1始まりで数える。 */
export interface UnknownPatchLine {
  readonly line: number;
  readonly text: string;
}

export interface ParsedPatchCore {
  readonly entries: readonly PatchEntryCore[];
  /** ハンク内外を問わず分類不能行を記録する。未知行を検査不能（malformed）にするかどうかはガードの固有条件が判断する。 */
  readonly unknownLines: readonly UnknownPatchLine[];
}

export type ParsedPatchOutcome =
  | { readonly ok: true; readonly patch: ParsedPatchCore }
  | { readonly ok: false; readonly reason: string };

/** パッチ本文先端の heredoc 形式（`cat <<'EOF' ... EOF` 等）を剥がす。 */
export function stripHeredoc(input: string): string {
  const m = input.match(/^(?:cat\s+)?<<['"]?(\w+)['"]?\s*\n([\s\S]*?)\n\1\s*$/);
  return m !== null ? (m[2] ?? input) : input;
}

/**
 * V4A パッチの解析（現行 tool と同じ形式判定）。解析不能は構造化 malformed を返す
 * （throw しない。各ガードの facade が fail-closed として処理する）。
 * - Begin/End マーカーは前後空白を許容して検出する（現行 tool と同じ）
 * - 分類不能行（裸行）は malformed にせず unknownLines に記録して続行する
 */
export function parsePatch(patchText: string): ParsedPatchOutcome {
  const cleaned = stripHeredoc(patchText.trim());
  const lines = cleaned.split("\n").map((line) => line.replace(/\r$/, ""));
  const beginIdx = lines.findIndex((line) => line.trim() === "*** Begin Patch");
  const endIdx = lines.findIndex((line) => line.trim() === "*** End Patch");
  if (beginIdx === -1 || endIdx === -1 || beginIdx >= endIdx) {
    return {
      ok: false,
      reason: beginIdx === -1 ? "missing *** Begin Patch marker" : "missing *** End Patch marker",
    };
  }
  const entries: PatchEntryCore[] = [];
  const unknownLines: UnknownPatchLine[] = [];
  let current: {
    kind: "add" | "update" | "delete";
    path: string;
    moveTo: string | null;
    bodyLines: string[];
  } | null = null;

  const flushCurrent = (): void => {
    if (current === null) return;
    entries.push(buildEntryCore(current));
    current = null;
  };

  for (let i = beginIdx + 1; i < endIdx; i++) {
    const line = lines[i] ?? "";
    if (line.startsWith("*** Add File:")) {
      const filePath = line.slice("*** Add File:".length).trim();
      if (filePath === "") return { ok: false, reason: `missing path at line ${i + 1}` };
      flushCurrent();
      current = { kind: "add", path: filePath, moveTo: null, bodyLines: [] };
      continue;
    }
    if (line.startsWith("*** Delete File:")) {
      const filePath = line.slice("*** Delete File:".length).trim();
      if (filePath === "") return { ok: false, reason: `missing path at line ${i + 1}` };
      flushCurrent();
      current = { kind: "delete", path: filePath, moveTo: null, bodyLines: [] };
      continue;
    }
    if (line.startsWith("*** Update File:")) {
      const filePath = line.slice("*** Update File:".length).trim();
      if (filePath === "") return { ok: false, reason: `missing path at line ${i + 1}` };
      flushCurrent();
      current = { kind: "update", path: filePath, moveTo: null, bodyLines: [] };
      continue;
    }
    if (line.startsWith("*** Move to:")) {
      const dest = line.slice("*** Move to:".length).trim();
      if (dest === "") return { ok: false, reason: `missing move destination at line ${i + 1}` };
      if (current === null || current.kind !== "update") {
        return { ok: false, reason: `Move to: outside Update File context at line ${i + 1}` };
      }
      current.moveTo = dest;
      continue;
    }
    if (!line.startsWith("+") && !line.startsWith("-") && !line.startsWith(" ") && !line.startsWith("@@") && line !== "*** End of File") {
      unknownLines.push({ line: i + 1, text: line });
    }
    if (current === null) continue;
    current.bodyLines.push(line);
  }
  flushCurrent();
  if (entries.length === 0) return { ok: false, reason: "no operation entries" };
  return { ok: true, patch: { entries, unknownLines } };
}

function buildEntryCore(entry: {
  kind: "add" | "update" | "delete";
  path: string;
  moveTo: string | null;
  bodyLines: readonly string[];
}): PatchEntryCore {
  return {
    kind: entry.kind,
    path: entry.path,
    moveTo: entry.moveTo,
    bodyLines: entry.bodyLines,
    ...(entry.kind === "add" ? { addContent: joinAddContent(entry.bodyLines) } : { addContent: "" }),
    ...(entry.kind === "update" ? { chunks: splitUpdateChunks(entry.bodyLines) } : { chunks: [] }),
  };
}

/** add 本文の完成予定全文（`+` 行を連結、末尾改行1つを除去。現行 tool と同じ）。 */
export function joinAddContent(bodyLines: readonly string[]): string {
  let content = "";
  for (const line of bodyLines) {
    if (line.startsWith("+")) content += `${line.slice(1)}\n`;
  }
  if (content.endsWith("\n")) content = content.slice(0, -1);
  return content;
}

/** update 本文の生行から `+` 行を抽出する（プレフィックス除去）。 */
export function extractAddedLines(bodyLines: readonly string[]): string[] {
  const out: string[] = [];
  for (const raw of bodyLines) {
    if (raw.startsWith("+")) out.push(raw.slice(1));
  }
  return out;
}

/**
 * update 本文の生行（`+`/`-`/` `/`@@`/`*** End of File`）をチャンクへ分離する。
 * 現行 tool と同じチャンク意味論（@@ で開始、*** End of File で EOF 指定）。
 */
export function splitUpdateChunks(bodyLines: readonly string[]): UpdateChunk[] {
  const chunks: UpdateChunk[] = [];
  let i = 0;
  while (i < bodyLines.length) {
    const line = bodyLines[i] ?? "";
    if (line.startsWith("@@")) {
      const changeContext = line.substring(2).trim();
      i += 1;
      const oldLines: string[] = [];
      const newLines: string[] = [];
      let isEndOfFile = false;
      while (i < bodyLines.length) {
        const changeLine = bodyLines[i] ?? "";
        if (changeLine === "*** End of File") {
          isEndOfFile = true;
          i += 1;
          break;
        }
        if (changeLine.startsWith("@@")) break;
        if (changeLine.startsWith(" ")) {
          oldLines.push(changeLine.substring(1));
          newLines.push(changeLine.substring(1));
        } else if (changeLine.startsWith("-")) {
          oldLines.push(changeLine.substring(1));
        } else if (changeLine.startsWith("+")) {
          newLines.push(changeLine.substring(1));
        }
        i += 1;
      }
      chunks.push({
        oldLines,
        newLines,
        ...(changeContext !== "" ? { changeContext } : {}),
        ...(isEndOfFile ? { isEndOfFile: true } : {}),
      });
      continue;
    }
    i += 1;
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// update チャンクの適用（現行 tool と同じ一致パス: 完全一致 → 末尾空白無視 → trim）
// ---------------------------------------------------------------------------

/**
 * チャンクを現行内容へ適用し、更新後全文を組む。
 * 一致しないチャンクは throw（呼出側は fail-closed として扱う）。
 */
export function applyUpdateChunks(originalText: string, chunks: readonly UpdateChunk[], filePath: string): string {
  let originalLines = originalText.split("\n");
  if (originalLines.length > 0 && originalLines[originalLines.length - 1] === "") {
    originalLines = originalLines.slice(0, -1);
  }
  const replacements: Array<[number, number, string[]]> = [];
  let lineIndex = 0;
  for (const chunk of chunks) {
    if (chunk.changeContext !== undefined) {
      const contextIdx = seekSequence(originalLines, [chunk.changeContext], lineIndex, false, filePath);
      if (contextIdx === -1) {
        throw new Error(`failed to find context '${chunk.changeContext}' in ${filePath}`);
      }
      lineIndex = contextIdx + 1;
    }
    if (chunk.oldLines.length === 0) {
      const insertionIdx =
        originalLines.length > 0 && originalLines[originalLines.length - 1] === ""
          ? originalLines.length - 1
          : originalLines.length;
      replacements.push([insertionIdx, 0, [...chunk.newLines]]);
      continue;
    }
    let pattern = [...chunk.oldLines];
    let newSlice = [...chunk.newLines];
    let found = seekSequence(originalLines, pattern, lineIndex, chunk.isEndOfFile === true, filePath);
    if (found === -1 && pattern.length > 0 && pattern[pattern.length - 1] === "") {
      pattern = pattern.slice(0, -1);
      if (newSlice.length > 0 && newSlice[newSlice.length - 1] === "") {
        newSlice = newSlice.slice(0, -1);
      }
      found = seekSequence(originalLines, pattern, lineIndex, chunk.isEndOfFile === true, filePath);
    }
    if (found === -1) {
      throw new Error(`failed to find expected lines in ${filePath}:\n${chunk.oldLines.join("\n")}`);
    }
    replacements.push([found, pattern.length, newSlice]);
    lineIndex = found + pattern.length;
  }
  replacements.sort((a, b) => a[0] - b[0]);
  const result = [...originalLines];
  for (let i = replacements.length - 1; i >= 0; i--) {
    const [startIdx, oldLen, newSegment] = replacements[i] as [number, number, string[]];
    result.splice(startIdx, oldLen);
    result.splice(startIdx, 0, ...newSegment);
  }
  if (result.length === 0 || result[result.length - 1] !== "") {
    result.push("");
  }
  return result.join("\n");
}

function seekSequence(lines: readonly string[], pattern: readonly string[], startIndex: number, eof: boolean, filePath: string): number {
  if (pattern.length === 0) return -1;
  const passes: Array<(a: string, b: string) => boolean> = [
    (a, b) => a === b,
    (a, b) => a.trimEnd() === b.trimEnd(),
    (a, b) => a.trim() === b.trim(),
  ];
  for (const compare of passes) {
    const hit = tryMatch(lines, pattern, startIndex, compare, eof);
    if (hit !== -1) return hit;
  }
  throw new Error(`failed to find expected lines in ${filePath} (unicode-normalized matching is not reconstructed):\n${pattern.join("\n")}`);
}

function tryMatch(lines: readonly string[], pattern: readonly string[], startIndex: number, compare: (a: string, b: string) => boolean, eof: boolean): number {
  if (eof) {
    const fromEnd = lines.length - pattern.length;
    if (fromEnd >= startIndex && matchesAt(lines, fromEnd, pattern, compare)) return fromEnd;
  }
  for (let i = startIndex; i <= lines.length - pattern.length; i++) {
    if (matchesAt(lines, i, pattern, compare)) return i;
  }
  return -1;
}

function matchesAt(lines: readonly string[], start: number, pattern: readonly string[], compare: (a: string, b: string) => boolean): boolean {
  for (let j = 0; j < pattern.length; j++) {
    if (!compare(lines[start + j] ?? "", pattern[j] ?? "")) return false;
  }
  return true;
}
