/**
 * third-party skills.yaml 宣言の読込と検証（配布側共有実装）。
 *
 * 契約:
 * - YAML 構文解析は Bun.YAML.parse へ委譲し、例外は result 値へ変換する。
 *   呼び出し側を直接クラッシュさせない。
 * - 保証 YAML 機能はマッピング、配列、文字列、数値、真偽値、null、入れ子、
 *   通常のクォート文字列に限定する。anchor、alias、カスタムタグ、
 *   複数ドキュメントは保証対象外である。
 * - 検証違反が1件でもある場合は取得対象エントリ集合を返さない（fail-closed）。
 *   取得機構は ok:false を受け取った時点で取得を実行してはならない（TS-010）。
 * - スキーマは name + source のみ。revision 項目なし、type 項目なし。
 *   版固定は source URL で表現し、取得形式は source から判定する。
 * - スキーマ外の項目（revision、type を含む）は silent skip せず違反として報告する
 *   （宣言的データの silent skip 禁止）。
 *
 * 正本: docs/designs/local/third-party-skill-management.md「宣言ファイル（skills.yaml）」
 * 要求: REQ-002-042、REQ-002-043、REQ-002-044（AG-002、AG-010、AG-011）
 * 本モジュールは配布側実装であり、repo-local 成果物へ依存しない。
 */

export const DECLARATION_SCHEMA_VERSION = "1.0";

export const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** 名前空間予約との衝突回避のため拒否する接頭辞（AG-002、AG-011）。 */
export const RESERVED_NAME_PREFIXES: readonly string[] = ["agentdev-", "repo-"];

export interface SkillDeclarationEntry {
  name: string;
  source: string;
}

export type DeclarationViolationKind =
  | "syntax"
  | "structure"
  | "entry";

export interface DeclarationViolation {
  kind: DeclarationViolationKind;
  /** entry 違反の対象 name（name 解析不能な場合は省略）。 */
  name?: string;
  message: string;
}

export type SkillsDeclarationResult =
  | { ok: true; entries: SkillDeclarationEntry[] }
  | { ok: false; violations: DeclarationViolation[] };

// ---------------------------------------------------------------------------
// YAML syntax parsing (Bun.YAML delegation)
// ---------------------------------------------------------------------------

export type ParseResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

/**
 * Delegates YAML syntax parsing to Bun.YAML.parse and converts exceptions
 * into a value so callers classify them as a syntax violation instead of
 * crashing.
 */
export function parseSkillsYaml(text: string): ParseResult {
  try {
    return { ok: true, data: Bun.YAML.parse(text) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message.split("\n")[0] ?? message };
  }
}

// ---------------------------------------------------------------------------
// Name constraints (AG-002, AG-011)
// ---------------------------------------------------------------------------

/**
 * name 単体の制約検証（kebab-case、予約接頭辞）。違反メッセージを返す。
 * 違反なしの場合は空配列を返す。
 */
export function validateSkillName(name: string): string[] {
  const messages: string[] = [];
  if (!NAME_PATTERN.test(name)) {
    messages.push(
      `name "${name}" is not kebab-case (expected pattern: ${NAME_PATTERN.source})`,
    );
  }
  for (const prefix of RESERVED_NAME_PREFIXES) {
    if (name.startsWith(prefix)) {
      messages.push(`name "${name}" uses reserved prefix "${prefix}"`);
    }
  }
  return messages;
}

// ---------------------------------------------------------------------------
// Declaration validation (structure + entries)
// ---------------------------------------------------------------------------

/**
 * パース済み宣言の構造検証とエントリ検証。
 *
 * - トップレベルは mapping で、必須キーは skills（配列）、許容キーは
 *   schema_version（DECLARATION_SCHEMA_VERSION 固定）。
 * - 各エントリは name（kebab-case、予約接頭辞拒否）と source（非空文字列）のみ
 *   を持つ。スキーマ外の項目は違反とする。
 * - 違反が1件でもある場合は ok:false を返し、取得対象エントリ集合を返さない
 *   （fail-closed: 違反宣言での取得停止）。
 */
export function validateSkillsDeclaration(parsed: unknown): SkillsDeclarationResult {
  const violations: DeclarationViolation[] = [];

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      ok: false,
      violations: [
        {
          kind: "structure",
          message: "declaration top level must be a mapping",
        },
      ],
    };
  }

  const document = parsed as Record<string, unknown>;

  const allowedTopKeys = ["schema_version", "skills"] as const;
  for (const key of Object.keys(document)) {
    if (!(allowedTopKeys as readonly string[]).includes(key)) {
      violations.push({
        kind: "structure",
        message: `unknown top-level key "${key}"`,
      });
    }
  }

  if (!("skills" in document)) {
    violations.push({
      kind: "structure",
      message: 'missing required top-level key "skills"',
    });
  } else if (!Array.isArray(document.skills)) {
    violations.push({
      kind: "structure",
      message: '"skills" must be an array',
    });
  }

  if ("schema_version" in document) {
    const version = document.schema_version;
    const versionText = typeof version === "string" ? version : String(version);
    if (versionText !== DECLARATION_SCHEMA_VERSION) {
      violations.push({
        kind: "structure",
        message: `schema_version must be "${DECLARATION_SCHEMA_VERSION}" (got "${versionText}")`,
      });
    }
  }

  const entries: SkillDeclarationEntry[] = [];
  if (Array.isArray(document.skills)) {
    document.skills.forEach((raw, index) => {
      const violationsBefore = violations.length;
      const entry = validateEntry(raw, index, violations);
      if (violations.length === violationsBefore) {
        entries.push(entry);
      }
    });
  }

  if (violations.length > 0) {
    return { ok: false, violations };
  }
  return { ok: true, entries };
}

function validateEntry(
  raw: unknown,
  index: number,
  violations: DeclarationViolation[],
): SkillDeclarationEntry {
  const entryLabel = `skills[${index}]`;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    violations.push({
      kind: "entry",
      message: `${entryLabel} must be a mapping with "name" and "source"`,
    });
    return { name: "", source: "" };
  }

  const record = raw as Record<string, unknown>;

  const allowedEntryKeys = ["name", "source"] as const;
  for (const key of Object.keys(record)) {
    if (!(allowedEntryKeys as readonly string[]).includes(key)) {
      violations.push({
        kind: "entry",
        message: `${entryLabel} has unknown field "${key}" (allowed fields: name, source; revision and type are not part of the schema)`,
      });
    }
  }

  let name = "";
  if (!("name" in record)) {
    violations.push({
      kind: "entry",
      message: `${entryLabel} is missing required field "name"`,
    });
  } else if (typeof record.name !== "string") {
    violations.push({
      kind: "entry",
      message: `${entryLabel} field "name" must be a string`,
    });
  } else {
    name = record.name;
    for (const message of validateSkillName(record.name)) {
      violations.push({ kind: "entry", name: record.name, message });
    }
  }

  let source = "";
  if (!("source" in record)) {
    violations.push({
      kind: "entry",
      message: `${entryLabel} is missing required field "source"`,
    });
  } else if (typeof record.source !== "string") {
    violations.push({
      kind: "entry",
      message: `${entryLabel} field "source" must be a string`,
    });
  } else if (record.source.trim().length === 0) {
    violations.push({
      kind: "entry",
      name,
      message: `${entryLabel} field "source" must not be empty`,
    });
  } else {
    source = record.source;
  }

  return { name, source };
}

// ---------------------------------------------------------------------------
// Combined loader (syntax + validation, fail-closed)
// ---------------------------------------------------------------------------

/**
 * 宣言テキストを構文解析して検証する合成入口。
 * 取得機構は本関数のみを正規経路とし、ok:false の場合は取得を実行しない。
 */
export function loadSkillsDeclaration(text: string): SkillsDeclarationResult {
  const parsed = parseSkillsYaml(text);
  if (!parsed.ok) {
    return {
      ok: false,
      violations: [{ kind: "syntax", message: `YAML syntax error: ${parsed.error}` }],
    };
  }
  return validateSkillsDeclaration(parsed.data);
}
