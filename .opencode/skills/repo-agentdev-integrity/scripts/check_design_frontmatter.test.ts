// ADF-COVERS(verification): REQ-010-068, REQ-010-062
/**
 * check_design_frontmatter.test.ts — bun:test 単体テスト（IR-070）。
 *
 * REQ-010-068 に従い、正常例、違反例、境界例、許容例、再現例を含む回帰テストを提供する。
 * 合成ディレクトリ（mkdtemp）を検査対象とし、リポジトリ実状態に依存しない。
 */
import { describe, expect, test, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ALLOWED_STATUS_VALUES,
  DESIGNS_DIR,
  REQUIRED_DESIGN_FRONTMATTER_FIELDS,
  extractFrontmatterFields,
  findDesignFrontmatterViolations,
  findLeadingWhitespaceKeys,
  hasDetectionSignalKey,
  isExcludedDesignFile,
  scanDesignFrontmatter,
  stripYamlQuotes,
} from "./check_design_frontmatter.ts";

// ─── fixture helper ──────────────────────────────────────────────────────

let tempRoots: string[] = [];

function makeTempRoot(): string {
  const dir = mkdtempSync(join(tmpdir(), "check-design-frontmatter-test-"));
  tempRoots.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempRoots) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // cleanup failure must not mask test results
    }
  }
  tempRoots = [];
});

const VALID_FRONTMATTER_DOC = `---
title: 正常な Design
status: accepted
created: 2026-08-20
updated: 2026-09-20
---

# 正常な Design

本文。
`;

function writeDesignDoc(root: string, relPath: string, body: string): string {
  const area = join(root, ...DESIGNS_DIR.split("/"));
  const filePath = join(area, ...relPath.split("/"));
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, body, "utf-8");
  return filePath;
}

// ─── 純関数: stripYamlQuotes ─────────────────────────────────────────────

describe("stripYamlQuotes", () => {
  test("ダブルクォートで囲まれた値は中身を返す", () => {
    expect(stripYamlQuotes(`"2026-09-20"`)).toBe("2026-09-20");
  });

  test("シングルクォートで囲まれた値は中身を返す", () => {
    expect(stripYamlQuotes(`'2026-09-20'`)).toBe("2026-09-20");
  });

  test("裸の値は trim のみ行う", () => {
    expect(stripYamlQuotes("  2026-09-20  ")).toBe("2026-09-20");
  });

  test("片側のみの引用符は剥がさない（境界例）", () => {
    expect(stripYamlQuotes(`"2026-09-20`)).toBe(`"2026-09-20`);
    expect(stripYamlQuotes(`2026-09-20"`)).toBe(`2026-09-20"`);
  });
});

// ─── 純関数: extractFrontmatterFields / findLeadingWhitespaceKeys ────────

describe("extractFrontmatterFields", () => {
  test("key: value 行を抽出する", () => {
    const fields = extractFrontmatterFields(["title: x", "status: accepted"]);
    expect(fields.get("title")).toBe("x");
    expect(fields.get("status")).toBe("accepted");
  });

  test("行頭空白付きキー行は YAML キーとして認識しない（キー名破損の原理）", () => {
    const fields = extractFrontmatterFields([" updated: 2026-09-14"]);
    expect(fields.has("updated")).toBe(false);
  });

  test("閉じ引用符を含む値を保持する", () => {
    const fields = extractFrontmatterFields([`title: "IR-070: design"`]);
    expect(fields.get("title")).toBe(`"IR-070: design"`);
  });
});

describe("findLeadingWhitespaceKeys", () => {
  test("行頭空白付き必須キー行のキー名を検出する（再現例: RA-005 実被害形状）", () => {
    expect(
      findLeadingWhitespaceKeys([
        "title: 整合性契約",
        "status: accepted",
        "created: 2026-08-20",
        " updated: 2026-09-14",
      ]),
    ).toEqual(["updated"]);
  });

  test("正常なキー行は検出しない", () => {
    expect(
      findLeadingWhitespaceKeys(["title: x", "status: draft", "created: 2026-01-01", "updated: 2026-01-02"]),
    ).toEqual([]);
  });

  test("必須キー以外の行頭空白行は検出しない（境界例）", () => {
    expect(findLeadingWhitespaceKeys([" note: 補足"])).toEqual([]);
  });
});

// ─── 純関数: findDesignFrontmatterViolations ─────────────────────────────

describe("findDesignFrontmatterViolations", () => {
  test("必須キーが揃い値形式が正当なら違反なし（正常例）", () => {
    expect(findDesignFrontmatterViolations(VALID_FRONTMATTER_DOC)).toEqual([]);
  });

  test("frontmatter ブロック欠落を検出する（違反例: missing-frontmatter）", () => {
    const violations = findDesignFrontmatterViolations("# 本文のみ\n");
    expect(violations).toHaveLength(1);
    expect(violations[0].kind).toBe("missing-frontmatter");
  });

  test("必須キー欠落を検出する（違反例: 再現例 - v4-collaboration-loop 形状の updated 欠落）", () => {
    const doc = `---
id: sample
title: 欠落
created: 2026-09-20
status: accepted
---
`;
    const violations = findDesignFrontmatterViolations(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].kind).toBe("invalid-frontmatter");
    expect(violations[0].problem).toContain("updated");
  });

  test("行頭空白付き updated 行をキー名破損とキー欠落の両方で検出する（再現例: integrity-contracts 形状）", () => {
    const doc = `---
title: 整合性契約
status: accepted
created: 2026-08-20
 updated: 2026-09-14
---
`;
    const violations = findDesignFrontmatterViolations(doc);
    const kinds = violations.map((v) => v.kind);
    expect(kinds).toContain("leading-whitespace-key");
    expect(kinds).toContain("invalid-frontmatter");
    expect(violations.filter((v) => v.kind === "leading-whitespace-key")).toHaveLength(1);
    expect(violations.filter((v) => v.kind === "invalid-frontmatter")).toHaveLength(1);
  });

  test("空値の必須キーを検出する（違反例）", () => {
    const doc = `---
title:
status: accepted
created: 2026-08-20
updated: 2026-09-20
---
`;
    const violations = findDesignFrontmatterViolations(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].problem).toContain("title");
  });

  test("ISO 8601 形式違反を検出する（違反例: 値形式不正）", () => {
    const doc = `---
title: x
status: accepted
created: 2026/08/20
updated: 2026-09-20
---
`;
    const violations = findDesignFrontmatterViolations(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].problem).toContain("created");
  });

  test("存在しない暦日を検出する（違反例: 値形式不正）", () => {
    const doc = `---
title: x
status: accepted
created: 2026-02-30
updated: 2026-09-20
---
`;
    expect(findDesignFrontmatterViolations(doc)).toHaveLength(1);
  });

  test("引用符付き日付値を許容する（許容例: Design corpus の正規運用）", () => {
    const doc = `---
title: "IR 形状の Design"
status: "accepted"
created: "2026-08-20"
updated: "2026-09-19"
---
`;
    expect(findDesignFrontmatterViolations(doc)).toEqual([]);
  });

  test("status の値域違反を検出する（違反例: 値形式不正）", () => {
    const doc = `---
title: x
status: proposed
created: 2026-08-20
updated: 2026-09-20
---
`;
    const violations = findDesignFrontmatterViolations(doc);
    expect(violations).toHaveLength(1);
    expect(violations[0].problem).toContain("status");
    expect(violations[0].problem).toContain(ALLOWED_STATUS_VALUES.join(" / "));
  });

  test("status: draft を許容する（許容例）", () => {
    const doc = VALID_FRONTMATTER_DOC.replace("status: accepted", "status: draft");
    expect(findDesignFrontmatterViolations(doc)).toEqual([]);
  });

  test("updated が created より前でも検出しない（許容例: 順序比較は検出対象外）", () => {
    const doc = `---
title: x
status: accepted
created: 2026-08-20
updated: 2026-08-06
---
`;
    expect(findDesignFrontmatterViolations(doc)).toEqual([]);
  });

  test("必須キー全欠落のブロックなし本文は missing-frontmatter のみ（境界例）", () => {
    const violations = findDesignFrontmatterViolations("---\n");
    expect(violations).toHaveLength(1);
    expect(violations[0].kind).toBe("missing-frontmatter");
  });
});

// ─── 純関数: isExcludedDesignFile / hasDetectionSignalKey ────────────────

describe("isExcludedDesignFile", () => {
  test("Design 領域ルートの README.md は対象外", () => {
    expect(isExcludedDesignFile("README.md")).toBe(true);
  });

  test("サブディレクトリ直下の README.md も対象外（境界例）", () => {
    expect(isExcludedDesignFile("integrity/README.md")).toBe(true);
  });

  test("references/ 配下は対象外（crosswalk-inventory.md の対象範囲判定）", () => {
    expect(isExcludedDesignFile("foundations/references/crosswalk-inventory.md")).toBe(true);
    expect(isExcludedDesignFile("workflows/references/execution-unit-construction.md")).toBe(true);
  });

  test("audits/ baselines/ 配下は対象外", () => {
    expect(isExcludedDesignFile("integrity/audits/report.md")).toBe(true);
    expect(isExcludedDesignFile("integrity/baselines/snapshot.md")).toBe(true);
  });

  test("rules/ 配下の IR ルールファイルは検査対象（frontmatter 保持）", () => {
    expect(isExcludedDesignFile("integrity/rules/IR-069-req-number-gap-recorded.md")).toBe(false);
  });

  test("通常の Design ファイルは検査対象", () => {
    expect(isExcludedDesignFile("workflows/v4-collaboration-loop.md")).toBe(false);
    expect(isExcludedDesignFile("integrity/integrity-contracts.md")).toBe(false);
  });
});

describe("hasDetectionSignalKey", () => {
  test("baseline_for / audit_for 保持行を検出する", () => {
    expect(hasDetectionSignalKey(["baseline_for: 60120646"])).toBe(true);
    expect(hasDetectionSignalKey(["audit_for: AG-008"])).toBe(true);
  });

  test("信号キーなしは false、frontmatter 欠落（null）も false", () => {
    expect(hasDetectionSignalKey(["title: x"])).toBe(false);
    expect(hasDetectionSignalKey(null)).toBe(false);
  });
});

// ─── 統合: scanDesignFrontmatter ─────────────────────────────────────────

describe("scanDesignFrontmatter", () => {
  test("領域未設置は違反としない（境界例）", () => {
    const root = makeTempRoot();
    const result = scanDesignFrontmatter(root);
    expect(result.areaPresent).toBe(false);
    expect(result.findings).toEqual([]);
    expect(result.filesEnumerated).toBe(0);
  });

  test("正常 corpus は違反 0 で件数整合する（正常例）", () => {
    const root = makeTempRoot();
    writeDesignDoc(root, "foundations/numbering-policy.md", VALID_FRONTMATTER_DOC);
    writeDesignDoc(root, "workflows/capture-boundaries.md", VALID_FRONTMATTER_DOC);
    const result = scanDesignFrontmatter(root);
    expect(result.areaPresent).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.filesEnumerated).toBe(2);
    expect(result.filesScanned).toBe(2);
    expect(result.filesSkipped).toBe(0);
    expect(result.filesScanned + result.filesSkipped).toBe(result.filesEnumerated);
  });

  test("frontmatter 欠落の corpus 2 件を検出する（再現例: RA-005 残存形状）", () => {
    const root = makeTempRoot();
    writeDesignDoc(root, "integrity/integrity-contracts.md", `---
title: 整合性契約
status: accepted
created: 2026-08-20
 updated: 2026-09-14
---
`);
    writeDesignDoc(root, "workflows/v4-collaboration-loop.md", `---
id: v4-collaboration-loop
title: ADF v4 継続コラボレーションループ
created: 2026-09-20
status: accepted
---
`);
    const result = scanDesignFrontmatter(root);
    expect(result.findings).toHaveLength(3); // キー名破損 1 + updated 欠落 2
    const byFile = new Map<string, number>();
    for (const f of result.findings) {
      byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
    }
    expect(byFile.get("docs/designs/integrity/integrity-contracts.md")).toBe(2);
    expect(byFile.get("docs/designs/workflows/v4-collaboration-loop.md")).toBe(1);
  });

  test("README.md と references/ 配下の frontmatter なしファイルは検出しない（許容例: 対象範囲判定）", () => {
    const root = makeTempRoot();
    writeDesignDoc(root, "README.md", "# Design インデックス\n");
    writeDesignDoc(
      root,
      "foundations/references/crosswalk-inventory.md",
      "# frontmatter なし references 文書\n",
    );
    writeDesignDoc(root, "foundations/system.md", VALID_FRONTMATTER_DOC);
    const result = scanDesignFrontmatter(root);
    expect(result.findings).toEqual([]);
    expect(result.filesEnumerated).toBe(3);
    expect(result.filesScanned).toBe(1);
    expect(result.filesSkipped).toBe(2);
  });

  test("baseline_for 信号キー保持ファイルは検査対象外（許容例: 監査記録免除）", () => {
    const root = makeTempRoot();
    writeDesignDoc(
      root,
      "quality/audit-report.md",
      `---
title: 監査記録
status: accepted
created: 2026-08-20
baseline_for: 60120646
---
`,
    );
    // baseline_for は必須キー検査の前に signal key 判定で skip される（updated 欠落でも検出しない）
    const result = scanDesignFrontmatter(root);
    expect(result.findings).toEqual([]);
    expect(result.filesSkipped).toBe(1);
    expect(result.filesScanned).toBe(0);
  });

  test("非 Markdown ファイルは列挙しない（境界例）", () => {
    const root = makeTempRoot();
    const area = join(root, ...DESIGNS_DIR.split("/"));
    mkdirSync(area, { recursive: true });
    writeFileSync(join(area, "notes.txt"), "text", "utf-8");
    writeDesignDoc(root, "foundations/system.md", VALID_FRONTMATTER_DOC);
    const result = scanDesignFrontmatter(root);
    expect(result.filesEnumerated).toBe(1);
    expect(result.findings).toEqual([]);
  });
});

// ─── 契約: 必須キー定義 ──────────────────────────────────────────────────

describe("required fields contract", () => {
  test("必須キーは正典（checker-execution-contracts Design）の列挙と一致する", () => {
    expect(REQUIRED_DESIGN_FRONTMATTER_FIELDS).toEqual([
      "title",
      "status",
      "created",
      "updated",
    ]);
  });

  test("status 許容値は patterns Design の列挙と一致する", () => {
    expect(ALLOWED_STATUS_VALUES).toEqual(["draft", "accepted"]);
  });
});
