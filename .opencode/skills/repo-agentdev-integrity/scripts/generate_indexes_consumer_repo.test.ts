/**
 * Regression tests: generate_indexes on repositories without the producer-only
 * integrity structure (consumer 導入先, Issue #3897, REQ-029-001).
 *
 * (1) consumer shape (rules dir absent, index files without AUTOGEN markers):
 *     exits 0, writes nothing, skips integrity sections and AUTOGEN-less files
 *     (IR-061 exemption「自動生成マーカーが存在しないファイルは検証対象外」と同一).
 * (2) consumer shape with one AUTOGEN-marked REQ README: the marked region is
 *     still regenerated (consumer 既存の索引再生成の維持).
 * (3) producer shape strictness retained: rules dir present + IR file present +
 *     catalog/rule-ownership marked, but REQ README without markers → exit 2
 *     (本体のマーカー喪失 fail-fast は緩和しない).
 * (4) producer shape: rules dir present but no IR-*.md files → exit 2.
 * (5) consumer partial markers (2 of 3 present, stale content): the present
 *     regions regenerate independently and the missing marker stays reported
 *     (PR #3898 regression: whole-file skip kept stale blocks passing).
 * (6) broken producer (rules dir absent, integrity catalog / rule-ownership
 *     remaining): exit 2 like the pre-#3898 implementation. Classifying this
 *     shape as consumer degrades every fail-fast to a skip record and exits 0.
 * (7) broken producer with a single remaining producer artifact: same exit 2.
 *
 * 生成器の終了コード・書込み差分は case-open / case-ready / case-close の
 * 必須品質ゲート（REQUIRED_GATES 系）が消費するため、両環境の分岐を固定する。
 */
import { describe, it, expect, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "fs";
import { join } from "path";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `gen-indexes-consumer-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);
const SCRIPT = join(import.meta.dir, "generate_indexes.ts");

function runGenerator(root: string): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  const proc = Bun.spawnSync(["bun", "run", SCRIPT, "--root", root], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    exitCode: proc.exitCode ?? -1,
    stdout: proc.stdout?.toString("utf-8") ?? "",
    stderr: proc.stderr?.toString("utf-8") ?? "",
  };
}

function mkdirp(p: string): void {
  mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string): void {
  mkdirp(join(p, ".."));
  writeFileSync(p, content, "utf-8");
}

function writeReqFile(dir: string, id: string): void {
  writeFile(
    join(dir, `${id}.md`),
    [
      "---",
      `id: ${id}`,
      `title: "Test requirement ${id}"`,
      `created: 2026-11-03`,
      `updated: 2026-11-03`,
      "---",
      "",
      `# ${id}: Test requirement`,
      "",
    ].join("\n"),
  );
}

function buildConsumerShape(root: string): void {
  // 実隔離検証環境（docs/requirements + docs/designs/quality のみ、AUTOGEN
  // マーカーなし）と同一の形状。
  writeReqFile(join(root, "docs", "requirements"), "REQ-001");
  writeFile(
    join(root, "docs", "requirements", "README.md"),
    [
      "# Requirements",
      "",
      "| REQ | Title |",
      "|---|---|",
      "| [REQ-001](REQ-001.md) | Test requirement REQ-001 |",
      "",
    ].join("\n"),
  );
  writeFile(
    join(root, "docs", "README.md"),
    [
      "# docs",
      "",
      "| Doc | Title |",
      "|---|---|",
      "| [REQ-001](requirements/REQ-001.md) | Test requirement |",
      "",
    ].join("\n"),
  );
}

afterAll(() => {
  rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe("generate_indexes on consumer-shaped repo (rules dir absent)", () => {
  const consumerRoot = join(TEMP_ROOT, "consumer");

  it("exits 0, writes nothing, and records skips instead of failing (Issue #3897)", () => {
    buildConsumerShape(consumerRoot);
    const before = readFileSync(
      join(consumerRoot, "docs", "requirements", "README.md"),
      "utf-8",
    );

    const result = runGenerator(consumerRoot);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("integrity structure absent, skipping");
    expect(result.stdout).toContain("no changes (already up-to-date)");
    const after = readFileSync(
      join(consumerRoot, "docs", "requirements", "README.md"),
      "utf-8",
    );
    expect(after).toBe(before);
  });

  it("still regenerates AUTOGEN-marked regions present in the consumer", () => {
    const reqReadmePath = join(consumerRoot, "docs", "requirements", "README.md");
    const marked = [
      "# Requirements",
      "",
      "<!-- AUTOGEN:BEGIN:id=req-active-count -->",
      "old caption",
      "<!-- AUTOGEN:END -->",
      "",
      "<!-- AUTOGEN:BEGIN:id=req-active-table -->",
      "| REQ | Title |",
      "|---|---|",
      "| [REQ-999](REQ-999.md) | stale row |",
      "<!-- AUTOGEN:END -->",
      "",
      "<!-- AUTOGEN:BEGIN:id=req-retired-table -->",
      "_（現行ディレクトリに retired REQ はありません。）_",
      "<!-- AUTOGEN:END -->",
      "",
    ].join("\n");
    writeFileSync(reqReadmePath, marked, "utf-8");

    const result = runGenerator(consumerRoot);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[generate_indexes] updated:");
    const updated = readFileSync(reqReadmePath, "utf-8");
    expect(updated).toContain("REQ-001");
    expect(updated).not.toContain("REQ-999");
    expect(updated).not.toContain("old caption");
  });

  it("regenerates present regions independently when markers are partial (PR #3898 regression)", () => {
    // req-retired-table マーカー欠落の consumer README: 既存 2 領域の STALE
    // 内容を再生成し、欠落マーカーは IR-061 と同一の適用範囲で記録して隠さない。
    const reqReadmePath = join(consumerRoot, "docs", "requirements", "README.md");
    writeFileSync(
      reqReadmePath,
      [
        "# Requirements",
        "",
        "<!-- AUTOGEN:BEGIN:id=req-active-count -->",
        "STALE COUNT",
        "<!-- AUTOGEN:END -->",
        "",
        "<!-- AUTOGEN:BEGIN:id=req-active-table -->",
        "| REQ | Title |",
        "|---|---|",
        "| [REQ-999](REQ-999.md) | STALE TABLE |",
        "<!-- AUTOGEN:END -->",
        "",
      ].join("\n"),
      "utf-8",
    );

    const result = runGenerator(consumerRoot);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "REQ README AUTOGEN markers not found: req-retired-table",
    );
    expect(result.stdout).toContain("integrity structure absent, skipping");
    expect(result.stdout).toContain("[generate_indexes] updated:");
    const updated = readFileSync(reqReadmePath, "utf-8");
    expect(updated).toContain("REQ-001");
    expect(updated).not.toContain("STALE COUNT");
    expect(updated).not.toContain("STALE TABLE");
  });
});

describe("generate_indexes on producer-shaped repo (rules dir present)", () => {
  it("keeps fail-fast when REQ README AUTOGEN markers are missing", () => {
    const producerRoot = join(TEMP_ROOT, "producer-strict");
    writeReqFile(join(producerRoot, "docs", "requirements"), "REQ-001");
    writeFile(
      join(producerRoot, "docs", "requirements", "README.md"),
      "# Requirements\n\nmarkers removed\n",
    );
    writeFile(
      join(producerRoot, "docs", "designs", "integrity", "rules", "IR-001-test.md"),
      "---\nrelated_req: REQ-010\n---\n\n# IR-001: Test rule\n",
    );
    writeFile(
      join(
        producerRoot,
        "docs",
        "designs",
        "integrity",
        "integrity-rule-catalog.md",
      ),
      [
        "<!-- AUTOGEN:BEGIN:id=catalog-ir-entries-pre-045 -->",
        "<!-- AUTOGEN:END -->",
        "",
        "<!-- AUTOGEN:BEGIN:id=catalog-ir-entries-post-045 -->",
        "<!-- AUTOGEN:END -->",
        "",
      ].join("\n"),
    );
    writeFile(
      join(producerRoot, "docs", "designs", "integrity", "rule-ownership.md"),
      [
        "<!-- AUTOGEN:BEGIN:id=rule-ownership-ir-crossref -->",
        "<!-- AUTOGEN:END -->",
        "",
      ].join("\n"),
    );
    // req-health-metrics / docs/README.md は REQ README より後段のため、
    // 本 test の対象外（欠落のまま到達しない）。

    const result = runGenerator(producerRoot);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("REQ README AUTOGEN markers not found");
  });

  it("keeps fail-fast when the rules dir has no IR-*.md files", () => {
    const producerRoot = join(TEMP_ROOT, "producer-empty-rules");
    writeReqFile(join(producerRoot, "docs", "requirements"), "REQ-001");
    writeFile(
      join(producerRoot, "docs", "requirements", "README.md"),
      "# Requirements\n",
    );
    mkdirp(join(producerRoot, "docs", "designs", "integrity", "rules"));

    const result = runGenerator(producerRoot);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("no IR-*.md files found");
  });
});

describe("generate_indexes on broken producer shape (rules dir absent, producer artifacts remain)", () => {
  it("fails closed when the rules dir is lost while integrity artifacts remain (PR #3898 regression)", () => {
    // producer から rules dir のみ喪失した部分欠損形状。consumer（導入先）は
    // catalog / rule-ownership も持たないため、この形状は consumer ではなく
    // producer 側構造の異常である。consumer と誤分類すると全 fail-fast が
    // skip 記録に退化し exit 0 で正常終了するため、旧実装同様 exit 2 を返す。
    const brokenProducerRoot = join(TEMP_ROOT, "producer-rules-dir-absent");
    writeReqFile(join(brokenProducerRoot, "docs", "requirements"), "REQ-001");
    writeFile(
      join(brokenProducerRoot, "docs", "requirements", "README.md"),
      "# Requirements\n",
    );
    writeFile(
      join(
        brokenProducerRoot,
        "docs",
        "designs",
        "integrity",
        "integrity-rule-catalog.md",
      ),
      [
        "<!-- AUTOGEN:BEGIN:id=catalog-ir-entries-pre-045 -->",
        "<!-- AUTOGEN:END -->",
        "",
      ].join("\n"),
    );
    writeFile(
      join(brokenProducerRoot, "docs", "designs", "integrity", "rule-ownership.md"),
      [
        "<!-- AUTOGEN:BEGIN:id=rule-ownership-ir-crossref -->",
        "<!-- AUTOGEN:END -->",
        "",
      ].join("\n"),
    );

    const result = runGenerator(brokenProducerRoot);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("rules dir not found");
    expect(result.stderr).toContain(brokenProducerRoot);
  });

  it("fails closed when only one producer artifact remains without the rules dir", () => {
    // catalog / rule-ownership のいずれか片方のみ残存しても producer 証跡と
    // して扱う（producer モードでは両者が必須ファイルであるため）。
    const brokenProducerRoot = join(TEMP_ROOT, "producer-rule-ownership-only");
    writeReqFile(join(brokenProducerRoot, "docs", "requirements"), "REQ-001");
    writeFile(
      join(brokenProducerRoot, "docs", "requirements", "README.md"),
      "# Requirements\n",
    );
    writeFile(
      join(brokenProducerRoot, "docs", "designs", "integrity", "rule-ownership.md"),
      [
        "<!-- AUTOGEN:BEGIN:id=rule-ownership-ir-crossref -->",
        "<!-- AUTOGEN:END -->",
        "",
      ].join("\n"),
    );

    const result = runGenerator(brokenProducerRoot);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("rules dir not found");
  });
});
