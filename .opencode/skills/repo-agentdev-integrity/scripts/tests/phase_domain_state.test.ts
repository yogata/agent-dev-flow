// ADF-COVERS(verification): REQ-110-001, REQ-110-004, REQ-110-010, REQ-110-013, REQ-110-014
//
// .agentdev/phase/ 工程駆動ドメイン状態領域の保存契約検証。
// 実領域の構造（許可ファイル集合、identity フィールド、phase/README.md 契約の様式トークン）を
// 実ファイル読み取りで突合し、テンポラリ複製上で identity の保存・別セッション復元、
// テーマ正本からの一覧導出、未決事項の判断根拠追跡、受領情報からの知見再取得を動的に検証する。
// 実領域への書込みは行わない（動的検証はテンポラリ複製上で実施する）。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..", "..", "..", "..", "..");
const PHASE_DIR = join(REPO_ROOT, ".agentdev", "phase");
const PHASE_README = join(PHASE_DIR, "README.md");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const TEMP_ROOT = join(TEMP_BASE, `phase-domain-state-${crypto.randomUUID().slice(0, 8)}`);

const ALLOWED_PHASE_ENTRIES = new Set(["README.md", "identity.yaml", "themes.md", "pending.md", "received"]);
const IDENTITY_FIELDS = ["undertaking", "target_version", "current_phase"] as const;

interface ThemeEntry {
  id: string;
  title: string;
  state: string;
  successor: string | null;
}

function parseIdentityYaml(content: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const match = /^([a-z_]+):\s*"(.*)"\s*$/.exec(line.trim());
    if (match !== null) {
      fields[match[1]] = match[2];
    }
  }
  return fields;
}

function parseThemes(content: string): ThemeEntry[] {
  const entries: ThemeEntry[] = [];
  const sections = content.split(/^## /m).slice(1);
  for (const section of sections) {
    const header = /^(THEME-\d+): (.+)$/m.exec(section);
    if (header === null) {
      continue;
    }
    const state = /^- 状態: (active|merged|deprecated)$/m.exec(section);
    const successor = /^- 後継: (THEME-\d+)$/m.exec(section);
    entries.push({
      id: header[1],
      title: header[2],
      state: state === null ? "" : state[1],
      successor: successor === null ? null : successor[1],
    });
  }
  return entries;
}

function parsePendingEntries(content: string): Array<Record<string, string>> {
  const entries: Array<Record<string, string>> = [];
  const sections = content.split(/^## /m).slice(1);
  for (const section of sections) {
    if (!/^PEND-\d+/m.test(section)) {
      continue;
    }
    entries.push({
      state: /^- 状態: (.+)$/m.exec(section)?.[1] ?? "",
      relatedThemes: /^- 関連テーマ: (.+)$/m.exec(section)?.[1] ?? "",
      rationale: /^- 判断根拠: (.+)$/m.exec(section)?.[1] ?? "",
    });
  }
  return entries;
}

describe("phase domain state 領域の保存契約", () => {
  beforeAll(() => {
    mkdirSync(join(TEMP_ROOT, "received"), { recursive: true });
  });

  afterAll(() => {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
  });

  it("実領域が許可ファイル集合のみで構成される（一覧・閲覧像の恒久保存ファイルが存在しない）", () => {
    expect(existsSync(PHASE_DIR)).toBe(true);
    for (const required of ALLOWED_PHASE_ENTRIES) {
      expect(existsSync(join(PHASE_DIR, required))).toBe(true);
    }
    const entries = readdirSync(PHASE_DIR).filter((entry) => entry !== "received");
    for (const entry of entries) {
      expect(ALLOWED_PHASE_ENTRIES.has(entry)).toBe(true);
    }
  });

  it("identity.yaml が取組・対象版・現在工程の3フィールドを持つ", () => {
    const identity = parseIdentityYaml(readFileSync(join(PHASE_DIR, "identity.yaml"), "utf-8"));
    for (const field of IDENTITY_FIELDS) {
      expect(field in identity).toBe(true);
    }
  });

  it("実領域の初期 identity が未設定の空値である", () => {
    const identity = parseIdentityYaml(readFileSync(join(PHASE_DIR, "identity.yaml"), "utf-8"));
    for (const field of IDENTITY_FIELDS) {
      expect(identity[field]).toBe("");
    }
  });

  it("phase/README.md 契約が様式トークンを保持する", () => {
    const readme = readFileSync(PHASE_README, "utf-8");
    expect(readme).toContain("## 導出規則");
    expect(readme).toContain("一覧を恒久保存する別ファイルを作らない");
    expect(readme).toContain("第二の正本として管理しない");
    for (const field of IDENTITY_FIELDS) {
      expect(readme).toContain(`${field}: ""`);
    }
    for (const token of ["状態: active | merged | deprecated", "後継:", "判断根拠:"]) {
      expect(readme).toContain(token);
    }
    for (const token of ["受領日時", "テーマ識別", "目的と問い", "参照元"]) {
      expect(readme).toContain(token);
    }
  });

  it("identity に確定値を保存し、別セッションの読み戻しで復元できる", () => {
    const tempIdentity = join(TEMP_ROOT, "identity.yaml");
    cpSync(join(PHASE_DIR, "identity.yaml"), tempIdentity);
    const settled = { undertaking: "T-UT", target_version: "v5.1.0", current_phase: "基本設計" };
    writeFileSync(tempIdentity, `${Object.entries(settled).map(([k, v]) => `${k}: "${v}"`).join("\n")}\n`, "utf-8");
    const restored = parseIdentityYaml(readFileSync(tempIdentity, "utf-8"));
    expect(restored["undertaking"]).toBe(settled.undertaking);
    expect(restored["target_version"]).toBe(settled.target_version);
    expect(restored["current_phase"]).toBe(settled.current_phase);
  });

  it("テーマ正本のセクションから一覧と旧新対応が導出される", () => {
    const tempThemes = join(TEMP_ROOT, "themes.md");
    writeFileSync(
      tempThemes,
      [
        "# 検討テーマ正本",
        "",
        "## THEME-001: 保存領域の様式確定",
        "",
        "- 状態: active",
        "- 具体化: 参照元の正規成果物から様式を確定する",
        "",
        "## THEME-002: 運用手順の整理",
        "",
        "- 状態: deprecated",
        "- 後継: THEME-003",
        "- 具体化: 手順候補（廃止）",
        "",
        "## THEME-003: 運用手順の確定",
        "",
        "- 状態: active",
        "- 具体化: THEME-002 の後継として手順を確定する",
        "",
      ].join("\n"),
      "utf-8",
    );
    const entries = parseThemes(readFileSync(tempThemes, "utf-8"));
    expect(entries.map((entry) => entry.id)).toEqual(["THEME-001", "THEME-002", "THEME-003"]);
    const deprecated = entries.find((entry) => entry.id === "THEME-002");
    expect(deprecated?.state).toBe("deprecated");
    expect(deprecated?.successor).toBe("THEME-003");
    const merged = entries.find((entry) => entry.id === "THEME-003");
    expect(merged?.state).toBe("active");
    expect(merged?.successor).toBeNull();
  });

  it("未決事項の判断根拠が保存され、追跡できる", () => {
    const tempPending = join(TEMP_ROOT, "pending.md");
    writeFileSync(
      tempPending,
      [
        "# 未決事項と判断根拠",
        "",
        "## PEND-001: 運用手順の採否",
        "",
        "- 状態: carried",
        "- 関連テーマ: THEME-002、THEME-003",
        "- 判断根拠: 手順候補は対象外とし、後継テーマで改めて判断する",
        "",
      ].join("\n"),
      "utf-8",
    );
    const entries = parsePendingEntries(readFileSync(tempPending, "utf-8"));
    expect(entries).toHaveLength(1);
    expect(entries[0]?.state).toBe("carried");
    expect(entries[0]?.relatedThemes).toContain("THEME-002");
    expect(entries[0]?.relatedThemes).toContain("THEME-003");
    expect(entries[0]?.rationale).not.toBe("");
  });

  it("受領情報から受領済み途中検討知見を再取得できる", () => {
    const receivedFile = join(TEMP_ROOT, "received", "2026-10-13-THEME-001.md");
    const content = [
      "# 受領記録",
      "",
      "- 受領日時: 2026-10-13",
      "- 対象テーマ: THEME-001",
      "- 目的と問い: 様式確定に必要な前提は何か",
      "- 参照元: 参照モデル工程の上流成果物",
      "",
      "## 採用",
      "",
      "- 採用1の内容（根拠: 利用者の明示判断）",
      "",
      "## 不採用・保留",
      "",
      "- 保留1の内容（曖昧なため確定しない）",
      "",
    ].join("\n");
    writeFileSync(receivedFile, content, "utf-8");
    expect(existsSync(receivedFile)).toBe(true);
    const loaded = readFileSync(receivedFile, "utf-8");
    expect(loaded).toContain("- 対象テーマ: THEME-001");
    expect(loaded).toContain("根拠: 利用者の明示判断");
  });
});
