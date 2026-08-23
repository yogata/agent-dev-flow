// ADF-COVERS(verification): REQ-049-006, REQ-049-007, REQ-049-008, REQ-049-009, REQ-049-010, REQ-049-011, REQ-049-012, REQ-049-013, REQ-049-026, REQ-049-029
//
// agentdev-issue-tracking 配布スキル scripts の検証（Issue #2409、#2420）。
// - 課題 ID 形式が GitHub Issue 番号参照と交差しないこと（機械的識別）
// - 1課題1ファイルのフラット列挙と frontmatter による状態保持（ディレクトリ移動なし）
// - 5状態保存値の表現と未知状態の検出、解決済み・クローズ済みの同一体系内での列挙・検証
// - frontmatter 保持情報（関連成果物、担当、期限など）の解析と省略可能項目の扱い
// - frontmatter のみを解析する検索・一覧（全文読込非依存の到達機構）
// - 状態別必須項目の形式検証（保留、解決済み、クローズ済みの区別とクローズ前提）

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  GITHUB_ISSUE_REF_RE,
  ISSUE_ID_RE,
  ISSUE_STATUSES,
  countByStatus,
  filterIssues,
  parseIssueContent,
  scanIssueDir,
  toMarkdownTable,
  validateIssues,
} from "../../../../../src/opencode/skills/agentdev-issue-tracking/scripts/lib/issue_file.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `issue-tracking-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);
const ISSUE_DIR = join(ROOT, "docs", "issue-list");

function writeIssue(name: string, frontmatter: string, body: string): void {
  writeFileSync(join(ISSUE_DIR, name), `---\n${frontmatter}\n---\n\n${body}`);
}

beforeAll(() => {
  mkdirSync(ISSUE_DIR, { recursive: true });
});

afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("課題 ID 形式（GitHub Issue 番号との機械的識別）", () => {
  it("ISL-NNN 形式のみ課題 ID として受理する", () => {
    expect(ISSUE_ID_RE.test("ISL-001")).toBe(true);
    expect(ISSUE_ID_RE.test("ISL-999")).toBe(true);
    expect(ISSUE_ID_RE.test("ISL-1")).toBe(false);
    expect(ISSUE_ID_RE.test("ISL-0001")).toBe(false);
    expect(ISSUE_ID_RE.test("2409")).toBe(false);
    expect(ISSUE_ID_RE.test("#2409")).toBe(false);
    expect(ISSUE_ID_RE.test("REQ-049")).toBe(false);
  });

  it("GitHub Issue 番号参照と課題 ID 形式は交差しない", () => {
    expect(GITHUB_ISSUE_REF_RE.test("2409")).toBe(true);
    expect(GITHUB_ISSUE_REF_RE.test("#2408")).toBe(true);
    for (const id of ["ISL-001", "ISL-010", "ISL-999"]) {
      expect(GITHUB_ISSUE_REF_RE.test(id)).toBe(false);
      expect(ISSUE_ID_RE.test(id)).toBe(true);
    }
    expect(ISSUE_ID_RE.test("2409")).toBe(false);
    expect(GITHUB_ISSUE_REF_RE.test("ISL-001")).toBe(false);
  });
});

describe("状態保存値", () => {
  it("未着手、検討中、保留、解決済み、クローズ済みの5値を表現する", () => {
    expect([...ISSUE_STATUSES]).toEqual(["open", "in-progress", "on-hold", "resolved", "closed"]);
    expect(new Set(ISSUE_STATUSES).size).toBe(5);
  });

  it("未知の状態保存値を検証で検出する", () => {
    writeIssue(
      "ISL-050.md",
      "id: ISL-050\ntitle: 未知状態の課題\nstatus: pending\ncreated: 2026-08-23\nupdated: 2026-08-23",
      "## 課題内容\n\n本文\n",
    );
    const files = scanIssueDir(ROOT);
    const target = files.find((f) => f.record.id === "ISL-050");
    expect(target).toBeDefined();
    const codes = validateIssues([target!]).map((v) => v.code);
    expect(codes).toContain("unknown-status");
    rmSync(join(ISSUE_DIR, "ISL-050.md"));
  });
});

describe("frontmatter スキャンによる検索・一覧（到達機構）", () => {
  it("frontmatter のみを解析し、状態・関連成果物・課題 ID で到達できる", () => {
    writeIssue(
      "ISL-001.md",
      "id: ISL-001\ntitle: 起票のみの課題\nstatus: open\ncreated: 2026-08-01\nupdated: 2026-08-01\nrelated_artifacts: [docs/requirements/REQ-049.md]",
      "## 課題内容\n\n本文\n\n（以下、到達機構が本文に依存しないことを確認するための長い本文）\n",
    );
    writeIssue(
      "ISL-002.md",
      "id: ISL-002\ntitle: 保留中の課題\nstatus: on-hold\ncreated: 2026-08-02\nupdated: 2026-08-03\nrelated_artifacts: [docs/designs/foundations/document-model.md]\nreevaluation: 比較可能なセッション履歴が蓄積したこと",
      "## 課題内容\n\n本文\n\n## 再評価条件\n\n### 判断保留の理由\n\n効果を観測する前に構造を変更できない\n\n### 再評価条件\n\n履歴が蓄積すること\n",
    );
    writeIssue(
      "ISL-003.md",
      "id: ISL-003\ntitle: 解決済みの課題\nstatus: resolved\ncreated: 2026-08-02\nupdated: 2026-08-04\nrelated_artifacts: [docs/requirements/REQ-049.md]",
      "## 課題内容\n\n本文\n\n## 結論\n\n対応不要と判断した\n\n## 反映先\n\n反映不要。結論を本ファイルが保持する\n",
    );

    const files = scanIssueDir(ROOT);
    expect(files.map((f) => f.record.id)).toEqual(["ISL-001", "ISL-002", "ISL-003"]);

    // 状態フィルタ: 保留課題と再評価条件の要約へ到達
    const onHold = filterIssues(files, { status: "on-hold" });
    expect(onHold.map((r) => r.id)).toEqual(["ISL-002"]);
    expect(onHold[0]!.reevaluation).toBe("比較可能なセッション履歴が蓄積したこと");

    // 関連成果物フィルタ
    const byRelated = filterIssues(files, { related: "REQ-049" });
    expect(byRelated.map((r) => r.id).sort()).toEqual(["ISL-001", "ISL-003"]);

    // 課題 ID フィルタ
    const byId = filterIssues(files, { id: "ISL-003" });
    expect(byId.map((r) => r.id)).toEqual(["ISL-003"]);
    expect(byId[0]!.title).toBe("解決済みの課題");

    // 状態別件数
    expect(countByStatus(files.map((f) => f.record))).toEqual({
      open: 1,
      "in-progress": 0,
      "on-hold": 1,
      resolved: 1,
      closed: 0,
    });

    // 3課題とも状態別必須項目を満たす
    expect(validateIssues(files)).toEqual([]);
  });

  it("docs/issue-list が存在しないルートは空の一覧を返す", () => {
    expect(scanIssueDir(join(TEMP_BASE, "not-exist-root"))).toEqual([]);
  });

  it("frontmatter のフィールド値は本文に依らず解析される", () => {
    const parsed = parseIssueContent(
      "ISL-099",
      "docs/issue-list/ISL-099.md",
      `---\nid: ISL-099\ntitle: 本文が巨大な課題\nstatus: in-progress\ncreated: 2026-08-23\nupdated: 2026-08-23\nrelated_artifacts: []\nowner: ADF\ndue: 2026-12-31\n---\n\n## 課題内容\n\n${"長い本文。".repeat(500)}`,
    );
    expect(parsed.record.title).toBe("本文が巨大な課題");
    expect(parsed.record.owner).toBe("ADF");
    expect(parsed.record.due).toBe("2026-12-31");
    expect(parsed.record.relatedArtifacts).toEqual([]);
  });
});

describe("状態別必須項目の形式検証", () => {
  it("保留状態は再評価条件（frontmatter と本文セクション）を要求する", () => {
    writeIssue(
      "ISL-011.md",
      "id: ISL-011\ntitle: 再評価条件なしの保留課題\nstatus: on-hold\ncreated: 2026-08-23\nupdated: 2026-08-23",
      "## 課題内容\n\n本文\n",
    );
    const files = scanIssueDir(ROOT).filter((f) => f.record.id === "ISL-011");
    const codes = validateIssues(files).map((v) => v.code);
    expect(codes).toContain("on-hold-requires-reevaluation");
    expect(codes).toContain("on-hold-requires-section");
    rmSync(join(ISSUE_DIR, "ISL-011.md"));
  });

  it("解決済みは結論を要求し、クローズ確認までは要求しない", () => {
    writeIssue(
      "ISL-012.md",
      "id: ISL-012\ntitle: 結論なしの解決済み課題\nstatus: resolved\ncreated: 2026-08-23\nupdated: 2026-08-23",
      "## 課題内容\n\n本文\n",
    );
    const noConclusion = scanIssueDir(ROOT).filter((f) => f.record.id === "ISL-012");
    expect(validateIssues(noConclusion).map((v) => v.code)).toEqual(["resolved-requires-conclusion"]);

    writeIssue(
      "ISL-012.md",
      "id: ISL-012\ntitle: 結論ありの解決済み課題\nstatus: resolved\ncreated: 2026-08-23\nupdated: 2026-08-23",
      "## 課題内容\n\n本文\n\n## 結論\n\n対応不要。\n\n## 反映先\n\n反映不要。理由を本ファイルが保持する\n",
    );
    const withConclusion = scanIssueDir(ROOT).filter((f) => f.record.id === "ISL-012");
    // 解決済み（結論あり、反映未確認）は形式検証としては適合する。クローズは別操作の前提確認で抑止する
    expect(validateIssues(withConclusion)).toEqual([]);
    rmSync(join(ISSUE_DIR, "ISL-012.md"));
  });

  it("クローズ済みは反映先とクローズ確認を要求する", () => {
    writeIssue(
      "ISL-013.md",
      "id: ISL-013\ntitle: 反映未確認のクローズ課題\nstatus: closed\ncreated: 2026-08-23\nupdated: 2026-08-23",
      "## 課題内容\n\n本文\n\n## 結論\n\n結論\n",
    );
    const files = scanIssueDir(ROOT).filter((f) => f.record.id === "ISL-013");
    const codes = validateIssues(files).map((v) => v.code);
    expect(codes).toContain("closed-requires-reflection");
    expect(codes).toContain("closed-requires-close-confirmation");

    writeIssue(
      "ISL-013.md",
      "id: ISL-013\ntitle: 反映確認済みのクローズ課題\nstatus: closed\ncreated: 2026-08-23\nupdated: 2026-08-23",
      "## 課題内容\n\n本文\n\n## 結論\n\n結論\n\n## 反映先\n\n反映済み\n\n## クローズ確認\n\n- 2026-08-23: 反映完了を確認した\n",
    );
    const closed = scanIssueDir(ROOT).filter((f) => f.record.id === "ISL-013");
    expect(validateIssues(closed)).toEqual([]);
    rmSync(join(ISSUE_DIR, "ISL-013.md"));
  });

  it("frontmatter の id 不一致、必須フィールド欠落、日付形式を検出する", () => {
    writeIssue(
      "ISL-014.md",
      "id: ISL-999\ntitle: id 不一致の課題\nstatus: open\ncreated: 2026-08-23\nupdated: 2026/08/23",
      "## 課題内容\n\n本文\n",
    );
    const files = scanIssueDir(ROOT).filter((f) => f.record.id === "ISL-014");
    const codes = validateIssues(files).map((v) => v.code);
    expect(codes).toContain("id-mismatch");
    expect(codes).toContain("invalid-date");
    rmSync(join(ISSUE_DIR, "ISL-014.md"));

    writeIssue("ISL-015.md", "id: ISL-015\ncreated: 2026-08-23", "## 課題内容\n\n本文\n");
    const missing = scanIssueDir(ROOT).filter((f) => f.record.id === "ISL-015");
    const missingCodes = validateIssues(missing).map((v) => v.code);
    expect(missingCodes.filter((c) => c === "missing-field").length).toBe(3); // title, status, updated
    rmSync(join(ISSUE_DIR, "ISL-015.md"));
  });
});

describe("Markdown 表出力", () => {
  it("一覧を Markdown 表として出力する", () => {
    const table = toMarkdownTable([
      {
        id: "ISL-002",
        file: "docs/issue-list/ISL-002.md",
        fmId: "ISL-002",
        title: "保留中の課題",
        status: "on-hold",
        created: "2026-08-02",
        updated: "2026-08-03",
        relatedArtifacts: ["docs/designs/foundations/document-model.md"],
        owner: null,
        due: null,
        reevaluation: "履歴が蓄積すること",
      },
    ]);
    expect(table.split("\n")[0]).toBe("| 課題ID | 状態 | 件名 | 更新日 | 関連成果物 | 再評価条件 |");
    expect(table.split("\n")[2]).toContain("ISL-002");
    expect(table.split("\n")[2]).toContain("on-hold");
    expect(table.split("\n")[2]).toContain("履歴が蓄積すること");
  });
});
