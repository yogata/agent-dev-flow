// ADF-COVERS(verification): REQ-100-001, REQ-100-002, REQ-100-003, REQ-100-004
// workflows/issue-title-policy Design の生成例を用いた回帰テスト（Issue #3388 TS-007）。
// - Design の判定表に 4 役割（Case / Epic / Wave-N / Tracking）の書式が
//   定義され、REQ-100 要件行が対応する必須条件を持つこと（TS-001）
// - Design 生成例（全役割 + 未確定原因を断定しない例）が判定表の書式へ合致すること
// - 判定表に存在しない接頭辞（廃止した Task: を含む）の生成例が Design に紛れ込んでいないこと
// 本テストは生成例の回帰検証であり、タイトル書式の意味評価器（REQ-100-008 の禁止対象）
// ではない。判定は Design 判定表の接頭辞パターンとの形式突合に限定する。
// 本テストの成功は Issue タイトルの作成・同期が実施されたことの証明ではない（生成例の形式突合のみを検査する）。
import { describe, it, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    if (fs.existsSync(path.join(dir, "src", "opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const DESIGN_PATH = path.join(REPO_ROOT, "docs", "designs", "workflows", "issue-title-policy.md");
const REQ_PATH = path.join(REPO_ROOT, "docs", "requirements", "REQ-100.md");

// 判定表の 4 役割書式。形式の正は Design「役割別書式（判定表）」節（REQ-100 は必須条件を所有）。
// Task: は廃止（子 Issue は [Epic #<親番号>] Wave-N: 主題 に統一）。
const ROLE_PATTERNS: Array<{ role: string; pattern: RegExp }> = [
  { role: "Case", pattern: /^Case: .+/ },
  { role: "Epic", pattern: /^Epic: .+/ },
  { role: "Wave-N", pattern: /^\[Epic #\d+\] Wave-\d+: .+/ },
  { role: "Tracking", pattern: /^Tracking: .+/ },
];

function readDesign(): string {
  return fs.readFileSync(DESIGN_PATH, "utf8");
}

function readReq(): string {
  return fs.readFileSync(REQ_PATH, "utf8");
}

// Design「生成例」節からバッククォート引用のタイトル例を抽出する。
function extractExamples(design: string): string[] {
  const section = design.split("## 生成例")[1];
  if (section === undefined) return [];
  const body = section.split("## 機械検査と推敲の責任分担")[0];
  const matches = [...body.matchAll(/^- `([^`]+)`/gm)];
  return matches.map((m) => m[1]);
}

describe("issue-title-policy 生成例の回帰テスト（REQ-100、Issue #3388 TS-007）", () => {
  it("Design と REQ-100 が実在する", () => {
    expect(fs.existsSync(DESIGN_PATH)).toBe(true);
    expect(fs.existsSync(REQ_PATH)).toBe(true);
  });

  it("Design 判定表に 4 役割の書式が定義されている（TS-001）", () => {
    const design = readDesign();
    expect(design).toContain("Case: 主題");
    expect(design).toContain("Epic: 主題");
    expect(design).toContain("[Epic #<親番号>] Wave-N: 主題");
    expect(design).toContain("Tracking: 主題");
  });

  it("REQ-100 要件行に 4 役割の必須条件がある（TS-001）", () => {
    const req = readReq();
    expect(req).toContain("`Case: 主題`");
    expect(req).toContain("`Epic: 主題`");
    expect(req).toContain("`[Epic #<親番号>] Wave-N: 主題`");
    expect(req).toContain("`Tracking: 主題`");
    expect(req).toContain("`Task:` 形式を使用しない");
  });

  it("生成例が存在し全役割を網羅する（TS-005 / TS-007）", () => {
    const examples = extractExamples(readDesign());
    expect(examples.length).toBeGreaterThanOrEqual(5);
    for (const { pattern } of ROLE_PATTERNS) {
      expect(examples.some((t) => pattern.test(t))).toBe(true);
    }
  });

  it("生成例が判定表の書式に合致する（TS-007）", () => {
    const examples = extractExamples(readDesign());
    for (const example of examples) {
      const matched = ROLE_PATTERNS.some(({ pattern }) => pattern.test(example));
      expect({ example, matched }).toEqual({ example, matched: true });
    }
  });

  it("廃止書式（Task: 接頭辞）の生成例が Design に紛れ込んでいない（REQ-100-001）", () => {
    const examples = extractExamples(readDesign());
    for (const example of examples) {
      expect({ example, matched: /Task: /.test(example) }).toEqual({ example, matched: false });
    }
  });

  it("旧形式（親番号なし Wave-N）タイトルの受理互換を維持する（REQ-100-004）", () => {
    // 旧形式の既存 Issue は一括改名対象外であり、旧形式だけを理由に参照・再開・更新・
    // 重複判定を拒否しない（REQ-100 適用範囲の対象外規定の維持を機械確認する）。
    // 本テストは Design 生成例の形式突合に限定する（冒頭宣言どおり）ため、旧形式タイトルを
    // 失格化する検査は導入しない。子 Issue パターンは新形式のみを判別条件とし、
    // 旧形式が合致しないことは照合の拒否を意味せず、受理可否の運用契約は REQ-100-004 が所有する。
    const req = readReq();
    expect(req).toContain("既存 Issue の一括改名");
    const legacyTitle = "Wave-2: 差分・変更影響・増分更新を実現する";
    const wavePattern = ROLE_PATTERNS.find(({ role }) => role === "Wave-N")!.pattern;
    expect({ title: legacyTitle, formatMatch: wavePattern.test(legacyTitle) })
      .toEqual({ title: legacyTitle, formatMatch: false });
  });

  it("未確定原因を断定しない生成例が存在する（TS-005）", () => {
    const design = readDesign();
    expect(design).toMatch(/未確定原因の断定を避ける例/);
  });
});
