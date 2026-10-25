// ADF-COVERS(verification): REQ-110-040, REQ-110-041, REQ-111-020
//
// 直接採用の採否記録の保存先契約（REQ-110-040）と領域契約文書の配布テンプレート
// 非破壊実体化（REQ-110-041）、終端遷移後の保存状態の参照専用保持（REQ-111-020）
// の pin 検査。配布物本文の追記文言が恒久的に保持されることを、内容検索（pin 型）
// で検証する。pin の文言変更は期待値追随を同一 PR で行う。
// 配布テンプレート（正本）と dogfood 実体（.agentdev/phase/README.md）の内容一致も
// pin する（初回保存経路での実体化内容がテンプレートと一致する契約の構造的基盤）。

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..", "..", "..", "..", "..");

function read(...parts: string[]): string {
  return readFileSync(join(repoRoot, ...parts), "utf8");
}

// 見出しから次の同レベル見出しまでの節本文を抽出する。
function sectionBetween(text: string, heading: string): string {
  const start = text.indexOf(heading);
  if (start === -1) return "";
  const rest = text.slice(start + heading.length);
  const next = rest.indexOf("\n## ");
  return next === -1 ? rest : rest.slice(0, next);
}

const TEMPLATE_PATH = [
  "src",
  "common",
  "skills",
  "agentdev-phase-theme-collaboration",
  "templates",
  "phase-readme.md",
] as const;

const ADOPTION_SKILL_PATH = [
  "src",
  "common",
  "skills",
  "agentdev-workflow-phase-artifacts-update",
  "SKILL.md",
] as const;

describe("直接採用の採否記録の保存先契約（REQ-110-040）", () => {
  test("phase-artifacts-update workflow skill が採否記録の保存先と証跡規律を規定する", () => {
    const sec = sectionBetween(read(...ADOPTION_SKILL_PATH), "## 記録の保存");
    expect(sec.length).toBeGreaterThan(0);
    expect(sec).toContain("`.agentdev/phase/adoptions/`");
    expect(sec).toContain("1採用1ファイル");
    expect(sec).toContain("受領記録と同じ証跡規律");
    expect(sec).toContain("由来（provenance）と正式な採用根拠（adoptionBasis）を区別");
    expect(sec).toContain("fail-closed");
    expect(sec).toContain("上書き・消失させない");
  });

  test("保存先が領域契約文書から発見できる", () => {
    const sec = sectionBetween(read(...ADOPTION_SKILL_PATH), "## 記録の保存");
    expect(sec).toContain("「adoptions/ の様式」から発見できる");
    const readme = read(".agentdev", "phase", "README.md");
    expect(sectionBetween(readme, "## adoptions/ の様式").length).toBeGreaterThan(0);
    expect(readme).toContain("| `adoptions/` | 直接採用の採否記録（1採用1ファイル） |");
  });

  test("phase-artifacts-update command が採否記録の保存先と証跡規律を規定する", () => {
    const command = read("src", "common", "commands", "agentdev", "phase-artifacts-update.md");
    expect(command).toContain("`.agentdev/phase/adoptions/` へ1採用1ファイルで保存");
    expect(command).toContain("受領記録と同じ証跡規律");
  });

  test("様式と機械生成の所有（Capability Skill）と保存責務分界が規定される", () => {
    const capability = read(
      "src",
      "common",
      "skills",
      "agentdev-phase-theme-collaboration",
      "SKILL.md",
    );
    expect(capability).toContain("`.agentdev/phase/adoptions/`");
    expect(capability).toContain("受領記録と同じ証跡規律");
    const scriptsReadme = read(
      "src",
      "common",
      "skills",
      "agentdev-phase-theme-collaboration",
      "scripts",
      "README.md",
    );
    expect(scriptsReadme).toContain("採否記録の保存を行わない");
  });
});

describe("領域契約文書の配布テンプレート非破壊実体化（REQ-110-041）", () => {
  test("配布テンプレート（正本）と dogfood 実体の内容が一致する", () => {
    const template = read(...TEMPLATE_PATH);
    const readme = read(".agentdev", "phase", "README.md");
    expect(template).toBe(readme);
  });

  test("配布テンプレートが採否記録と遷移記録の保存先を保存モデル表へ掲載する", () => {
    const template = read(...TEMPLATE_PATH);
    expect(template).toContain("| `adoptions/` | 直接採用の採否記録（1採用1ファイル） |");
    expect(template).toContain("| `transitions/` | 工程遷移の遷移記録（1遷移1ファイル） |");
  });

  test("初回保存経路の workflow skill が非破壊実体化を規定する", () => {
    for (const skillName of [
      "agentdev-workflow-phase-tasks-create",
      "agentdev-workflow-phase-tasks-update",
      "agentdev-workflow-phase-artifacts-update",
    ]) {
      const sec = sectionBetween(
        read("src", "common", "skills", skillName, "SKILL.md"),
        "## 領域契約文書の非破壊実体化",
      );
      expect(sec.length, `${skillName} の非破壊実体化節が存在すること`).toBeGreaterThan(0);
      expect(sec).toContain("存在しない場合のみ");
      expect(sec).toContain("`templates/phase-readme.md`");
      expect(sec).toContain("上書きしない");
      expect(sec).toContain("テンプレートと一致させる");
      expect(sec).toContain("検査失敗として扱わない");
    }
  });

  test("対応する command 契約が既存領域契約文書の非上書きを規定する", () => {
    for (const commandName of ["phase-tasks-create", "phase-tasks-update", "phase-artifacts-update"]) {
      const command = read("src", "common", "commands", "agentdev", `${commandName}.md`);
      expect(command, `${commandName} の領域契約文書非上書き規定`).toContain("上書きしない");
    }
  });

  test("Capability Skill がテンプレート正本と実体化契約を所有する", () => {
    const capability = read(
      "src",
      "common",
      "skills",
      "agentdev-phase-theme-collaboration",
      "SKILL.md",
    );
    const sec = sectionBetween(capability, "## 領域契約文書の配布テンプレートと実体化");
    expect(sec.length).toBeGreaterThan(0);
    expect(sec).toContain("`templates/phase-readme.md`");
    expect(sec).toContain("上書きしない");
    expect(sec).toContain("検査失敗として扱わない");
  });
});

describe("終端遷移後の保存状態の参照専用保持（REQ-111-020）", () => {
  test("領域契約 README テンプレートが参照専用保持の契約を規定する", () => {
    const template = read(...TEMPLATE_PATH);
    const sec = sectionBetween(template, "## 終端遷移後の保存状態の保持");
    expect(sec.length).toBeGreaterThan(0);
    expect(sec).toContain("架空の後続工程を作らない記録形式で遷移記録へ保存される");
    expect(sec).toContain("保存された記録から終端であることを再構成できる");
    expect(sec).toContain("テーマ正本、識別状態、遷移記録");
    expect(sec).toContain("参照専用として保持する");
  });

  test("参照専用の保持が完了済み過去工程の正規改訂と変更駆動経路を妨げないことを規定する", () => {
    const template = read(...TEMPLATE_PATH);
    const sec = sectionBetween(template, "## 終端遷移後の保存状態の保持");
    expect(sec).toContain("完了済み過去工程の正規改訂と変更駆動経路による作業を妨げない");
    expect(sec).toContain("テーマ状態（active、merged、deprecated）に完了状態を追加せず");
  });

  test("dogfood 実体がテンプレートと同じ節を保持する", () => {
    const readme = read(".agentdev", "phase", "README.md");
    const sec = sectionBetween(readme, "## 終端遷移後の保存状態の保持");
    expect(sec).toContain("参照専用として保持する");
  });
});
