// skill-projection-manifest.yaml の skills セクション再生成（B3-3）
// （generate_indexes.ts 分割モジュール）。
// 正規情報源は src/common/skills/ のディレクトリ列挙。checker は IR-068 で
// manifest↔src の差分を厳格検出する。third_party_skills は third-party 取得
// 機構の管理登録（判断列）であり導出対象外。

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

export const SKILL_PROJECTION_MANIFEST_REL =
  ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml";

/**
 * src/common/skills/ のディレクトリ列挙から manifest skills リストを導出する。
 * repo-*（repo-local integrity skill）は third-party / ADF 投影スキルではなく
 * 検出対象外のため除外する（IR-068 loadSkillProjectionManifest の投影列挙と同一規則）。
 */
export function deriveSkillProjectionManifestSkills(skillsDir: string): string[] {
  let entries: import("fs").Dirent[];
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true }) as import("fs").Dirent[];
  } catch {
    return [];
  }
  const names: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith("repo-")) continue;
    if (entry.isDirectory()) {
      names.push(entry.name);
      continue;
    }
    try {
      if (fs.statSync(path.join(skillsDir, entry.name)).isDirectory()) {
        names.push(entry.name);
      }
    } catch {
      // 解決不能エントリ（stale junction 等）は導出対象外。
    }
  }
  return names.sort();
}

/**
 * manifest yaml の skills セクションのエントリ行（`skills:` 直後の連続する
 * リスト行）を機械生成リストで置換した content を返す。エントリ行以外
 * （空行、後続キー等）は保持する。セクション検出不能時は unchanged を返す。
 */
export function replaceSkillProjectionManifestSkills(
  content: string,
  skills: string[],
): string {
  const lines = content.split(/\r?\n/);
  const skillsIdx = lines.findIndex((l) => /^skills:\s*$/.test(l));
  if (skillsIdx === -1) return content;
  let firstEntry = -1;
  let lastEntry = -1;
  for (let i = skillsIdx + 1; i < lines.length; i++) {
    if (/^\s*-\s+\S/.test(lines[i] ?? "")) {
      if (firstEntry === -1) firstEntry = i;
      lastEntry = i;
      continue;
    }
    if (firstEntry !== -1) break;
  }
  if (firstEntry === -1) return content;
  const generated = skills.map((s) => `  - ${s}`);
  const out = [
    ...lines.slice(0, firstEntry),
    ...generated,
    ...lines.slice(lastEntry + 1),
  ];
  return out.join("\n");
}

/**
 * manifest yaml の generated_at 行を更新した content を返す。行不在時は unchanged。
 */
export function replaceSkillProjectionManifestGeneratedAt(
  content: string,
  generatedAt: string,
): string {
  return content.replace(
    /^generated_at:\s*.*$/m,
    `generated_at: ${generatedAt}`,
  );
}
