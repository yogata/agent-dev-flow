// third-party Skill 宣言ファイル（src/third-party/skills.yaml）の読み込み。
//
// スキーマの正は Design `docs/designs/local/third-party-skill-management.md`
// 「宣言ファイル（skills.yaml）」である: name（kebab-case、agentdev-・repo-
// 接頭辞拒否）と source の2キー。revision 項目なし、type 項目なし。
//
// YAML 解析は依存ゼロのサブセットパーサーとする（宣言スキーマが
// name/source の2キー flat リストであるため十分であり、外部依存の
// 追加を避ける）。宣言を解釈できない場合は失敗とし、取得を実行しない
// （fail-closed）。


/** 宣言された1つの third-party Skill。 */
export interface DeclaredSkill {
  readonly name: string;
  readonly source: string;
}

/** 宣言ファイルの読み込み結果。 */
export type DeclarationResult =
  | { readonly ok: true; readonly skills: readonly DeclaredSkill[] }
  | { readonly ok: false; readonly detail: string };

/** Skill 名の正規形。kebab-case（小文字、数字、ハイフン）。 */
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** 取得対象から除外する予約接頭辞（ADF 製・repo-local 名前空間）。 */
export const RESERVED_SKILL_PREFIXES = ["agentdev-", "repo-"] as const;

/** Skill 名の妥当性検証（予約接頭辞を含む）。 */
export function validateSkillName(name: string): string | null {
  if (!NAME_PATTERN.test(name)) {
    return `skill name must be kebab-case (lowercase, digits, hyphens): ${name}`;
  }
  for (const prefix of RESERVED_SKILL_PREFIXES) {
    if (name.startsWith(prefix)) {
      return `skill name must not use the reserved prefix "${prefix}": ${name}`;
    }
  }
  return null;
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/** 値部の抽出（行コメント除去とクォート除去）。 */
function parseScalarValue(raw: string): string {
  const hashIndex = raw.indexOf(" #");
  const cleaned = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
  return stripQuotes(cleaned.trim());
}

/** name/source の2キー flat リストのみを許容する YAML サブセットパーサー。 */
export function parseDeclaration(text: string): DeclarationResult {
  const skills: DeclaredSkill[] = [];
  let inSkills = false;
  let current: { name?: string; source?: string } | null = null;

  for (const originalLine of text.split(/\r?\n/)) {
    const line = originalLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;

    if (!inSkills) {
      if (line === "skills:") {
        inSkills = true;
        continue;
      }
      return { ok: false, detail: `declaration must start with "skills:", got: ${line}` };
    }

    if (line.startsWith("- name:")) {
      if (current !== null) {
        return { ok: false, detail: "declaration entry is missing source before the next entry" };
      }
      const name = parseScalarValue(line.slice("- name:".length));
      const nameError = validateSkillName(name);
      if (nameError !== null) {
        return { ok: false, detail: nameError };
      }
      current = { name };
      continue;
    }

    if (line.startsWith("source:")) {
      if (current === null || current.source !== undefined) {
        return { ok: false, detail: "source line without an open declaration entry" };
      }
      const source = parseScalarValue(line.slice("source:".length));
      if (!/^https:\/\//.test(source)) {
        return { ok: false, detail: `source must be an https:// URL: ${source}` };
      }
      current = { ...current, source };
      skills.push({ name: current.name as string, source });
      current = null;
      continue;
    }

    return { ok: false, detail: `unsupported declaration line: ${line}` };
  }

  if (current !== null) {
    return { ok: false, detail: `declaration entry "${current.name ?? "?"}" is missing source` };
  }
  if (!inSkills) {
    return { ok: false, detail: 'declaration must contain a "skills:" section' };
  }

  const seen = new Set<string>();
  for (const skill of skills) {
    if (seen.has(skill.name)) {
      return { ok: false, detail: `duplicate skill name in declaration: ${skill.name}` };
    }
    seen.add(skill.name);
  }
  return { ok: true, skills };
}

/** 宣言ファイルの読み込み。不存在・非 UTF-8・不正スキーマは失敗（fail-closed）。 */
export async function loadDeclaration(declarationPath: string): Promise<DeclarationResult> {
  let file;
  try {
    file = Bun.file(declarationPath);
  } catch (e) {
    return { ok: false, detail: `cannot access declaration file: ${e instanceof Error ? e.message : String(e)}` };
  }
  if (!(await file.exists())) {
    return { ok: false, detail: `declaration file does not exist: ${declarationPath}` };
  }
  let text: string;
  try {
    text = await file.text();
  } catch (e) {
    return { ok: false, detail: `cannot read declaration file: ${e instanceof Error ? e.message : String(e)}` };
  }
  return parseDeclaration(text);
}
