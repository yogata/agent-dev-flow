// ADF-COVERS(verification): REQ-110-008
// 移行前後照合と処理継続性実証の検証（bun test 分割①で恒久発火）。
// 検査基準の正は正規原本（REQ-110-008、REQ-109-007/008、DEC-056、v5-completion-judgment Design
// 「移行検証の手順」節、v4-migration-and-release Design「v4 → v5 移行手順と検証」節・
// 「未処理 Intake・Learning・Backlog 情報の移行と継続」節）であり、実行結果から生成しない。
// 実環境照合は読み取り専用であり、正規状態へ書き込まない。反例投入は OS 一時ディレクトリ配下の
// 模擬環境で行い、リポジトリの正規状態を破壊しない。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  enumeratePendingState,
  extractRelations,
  PENDING_LOCATIONS,
  proveProcessingContinuity,
  reconcilePendingState,
  runMigrationPrecheck,
  splitEntries,
  type PendingItem,
} from "./migration_continuity.ts";

// テスト実行 cwd は repo root（REQ-060 bun test 実行形態）。worktree から実行した場合は
// worktree root の .agentdev/ が対象（git 管理実体として main と同一内容を参照する）。
const REPO_ROOT = process.cwd();
const STATE_ROOT = path.join(REPO_ROOT, ".agentdev");

function stateRootOf(projectRoot: string): string {
  return path.join(projectRoot, ".agentdev");
}

function writeTree(root: string, files: Record<string, string>): void {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
  }
}

// 模擬対象プロジェクト（合意済み対象プロジェクトの手順適用性を検証する fixture）。
// 未処理 Intake・Learning・Backlog の各情報を配置由来の正規構造で保持する。
const FIXTURE_PENDING: Record<string, string> = {
  ".agentdev/intake/inbox/2026-10-01-sample-intake.md": [
    "# 模擬 intake item A",
    "",
    "## 内容",
    "",
    "未処理 intake の模擬本文。",
    "参照: [REQ-109](../../docs/requirements/REQ-109.md)",
    "",
  ].join("\n"),
  ".agentdev/intake/inbox/2026-10-02-sample-intake-b.md": [
    "# 模擬 intake item B",
    "",
    "## 提案",
    "",
    "参照関係を持たない未処理 intake の模擬本文。",
    "",
  ].join("\n"),
  ".agentdev/learning/inbox.md": [
    "# 学び、教訓",
    "",
    "このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。",
    "",
    "---",
    "",
    "## 模擬 learning エントリ 1",
    "",
    "- **問題事象**: 模擬事象 1",
    "- **関連**: Issue #9999、src/common/sample.ts",
    "- **タグ**: `#sample1`",
    "",
    "## 模擬 learning エントリ 2",
    "",
    "- **問題事象**: 模擬事象 2",
    "- **タグ**: `#sample2`",
    "",
    "---",
    "",
  ].join("\n"),
  ".agentdev/learning/deferred.md": [
    "# 学び deferred pool",
    "",
    "## 2026-10-01: 模擬保留エントリ",
    "",
    "- **問題事象**: 模擬保留事象",
    "- **関連**: docs/guides/sample.md",
    "- **移動日**: 2026-10-01",
    "",
    "---",
    "",
  ].join("\n"),
  ".agentdev/backlog/req-units/RU-9999-sample.md": [
    "# RU-9999: 模擬 RU",
    "",
    "未処理 backlog RU の模擬本文。",
    "",
  ].join("\n"),
}

function makeFixtureProject(extra: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mig-continuity-fixture-"));
  writeTree(root, { ...FIXTURE_PENDING, ...extra });
  // backlog/req-units への .gitkeep（実リポジトリと同一の管理ファイル。列挙対象外であることの確認にも使用）
  fs.writeFileSync(path.join(root, ".agentdev", "backlog", "req-units", ".gitkeep"), "", "utf-8");
  return root;
}

function fixture(rel: string): string {
  const value = FIXTURE_PENDING[rel];
  if (value === undefined) {
    throw new Error(`fixture entry missing: ${rel}`);
  }
  return value;
}

describe("列挙とスナップショット（決定性の確認）", () => {
  test("配置由来の処理状態マッピングは正規配置表と一致する", () => {
    // 正: docs/guides/intake-learning-backlog-flow.md の配置表・deferred.md の状態定義
    const paths = PENDING_LOCATIONS.map((l) => `${l.domain}:${l.path}=${l.state}`);
    expect(paths).toContain("intake:intake/inbox=pending");
    expect(paths).toContain("learning:learning/inbox.md=pending");
    expect(paths).toContain("learning:learning/deferred.md=deferred");
    expect(paths).toContain("backlog:backlog/req-units=pending");
    expect(PENDING_LOCATIONS.length).toBe(4);
  });

  test("単一ファイルは `## ` 見出しで決定的にエントリ分割される", () => {
    const entries = splitEntries(fixture(".agentdev/learning/inbox.md"));
    expect(entries.length).toBe(2);
    expect(entries[0]?.title).toBe("模擬 learning エントリ 1");
    expect(entries[1]?.title).toBe("模擬 learning エントリ 2");
  });

  test("参照関係の抽出は markdown リンクと「関連」行を決定的に抽出する", () => {
    const body = fixture(".agentdev/intake/inbox/2026-10-01-sample-intake.md");
    expect(extractRelations(body)).toEqual([
      "link:../../docs/requirements/REQ-109.md",
    ]);
    const learningEntry = splitEntries(fixture(".agentdev/learning/inbox.md"))[0]?.body ?? "";
    expect(extractRelations(learningEntry)).toContain("related:Issue #9999、src/common/sample.ts");
  });
});

describe("ADF 自身の実環境非破壊前後照合（REQ-110-008・読み取り専用）", () => {
  test("移行前後照合で欠落・不整合・検証不能が 0 件（件数突合・差分 0 の機械確認）", () => {
    const report = runMigrationPrecheck(STATE_ROOT);
    // 列挙・照合・差分 0 の出力件数突合（委譲契約の検証義務）
    expect(report.beforeCount).toBeGreaterThan(0);
    expect(report.afterCount).toBe(report.beforeCount);
    expect(report.discrepancies.length).toBe(0);
    expect(report.ok).toBe(true);
  });

  test("実環境の未処理情報は intake・learning から列挙され、全項目に内容・処理状態・参照関係の 3 属性がある", () => {
    const items = enumeratePendingState(STATE_ROOT);
    const domains = new Set(items.map((i) => i.domain));
    // 実環境では未処理 intake・learning が存在する（backlog req-units は現時点で 0 件であり、
    // backlog 領域の列挙能力は模擬対象プロジェクトの fixture テストで立証する）
    expect(domains.has("intake")).toBe(true);
    expect(domains.has("learning")).toBe(true);
    expect(items.filter((i) => i.domain === "backlog").length).toBe(0);
    const learningEntries = items.filter((i) => i.location.startsWith("learning/"));
    expect(learningEntries.length).toBeGreaterThan(0);
    for (const item of items) {
      // スナップショットの完全性: 全項目に内容・処理状態・参照関係の 3 属性が存在する
      expect(item.contentDigest).toMatch(/^[0-9a-f]{64}$/);
      expect(item.state.length).toBeGreaterThan(0);
      expect(Array.isArray(item.relations)).toBe(true);
    }
  });

  test("処理継続性の実行時実証: 実環境の全未処理項目で後続処理入力の形成が成立する", () => {
    const proof = proveProcessingContinuity(STATE_ROOT);
    expect(proof.attempted).toBeGreaterThan(0);
    expect(proof.succeeded).toBe(proof.attempted);
    expect(proof.failures.length).toBe(0);
    expect(proof.ok).toBe(true);
  });
});

describe("模擬対象プロジェクトの非破壊移行照合（合意済み対象プロジェクトの手順適用性）", () => {
  test("模擬移行（同内容の移行先構築）で前後照合が差分 0 件・処理継続性が成立する", () => {
    const root = makeFixtureProject();
    try {
      const report = runMigrationPrecheck(stateRootOf(root));
      expect(report.beforeCount).toBe(
        Object.keys(FIXTURE_PENDING).length - 1 + 2, // learning/inbox.md は 2 エントリ
      );
      expect(report.beforeCount).toBeGreaterThan(0);
      expect(report.afterCount).toBe(report.beforeCount);
      expect(report.discrepancies.length).toBe(0);
      expect(report.ok).toBe(true);

      const proof = proveProcessingContinuity(stateRootOf(root));
      expect(proof.succeeded).toBe(proof.attempted);
      expect(proof.ok).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("反例（移行情報欠落）: 移行先で項目が欠けると missing を検出し合格しない", () => {
    const root = makeFixtureProject();
    try {
      fs.rmSync(path.join(root, ".agentdev", "intake", "inbox", "2026-10-01-sample-intake.md"));
      const after = enumeratePendingState(stateRootOf(root));
      const before = enumeratePendingState(stateRootOf(makeFixtureProject()));
      const diffs = reconcilePendingState(before, after);
      const missing = diffs.filter((d) => d.kind === "missing");
      expect(missing.length).toBe(1);
      expect(missing[0]?.location).toBe("intake/inbox/2026-10-01-sample-intake.md");
      expect(diffs.length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("反例（処理状態の黙認変化）: 同一内容が別の処理状態へ移動すると state-mismatch を検出する（黙認禁止・REQ-109-008）", () => {
    const root = makeFixtureProject();
    try {
      // 未処理（inbox.md）エントリを保留（deferred.md）へ、内容を変更せずに移動した状態を模擬する
      const inboxPath = path.join(root, ".agentdev", "learning", "inbox.md");
      const inboxText = fs.readFileSync(inboxPath, "utf8");
      const entries = splitEntries(inboxText);
      const moved = entries.find((e) => e.title === "模擬 learning エントリ 2");
      expect(moved).toBeDefined();
      const kept = entries.filter((e) => e.title !== "模擬 learning エントリ 2");
      fs.writeFileSync(
        inboxPath,
        ["# 学び、教訓", "", ...kept.map((e) => e.body)].join("\n"),
        "utf-8",
      );
      const deferredPath = path.join(root, ".agentdev", "learning", "deferred.md");
      fs.writeFileSync(
        deferredPath,
        [fs.readFileSync(deferredPath, "utf8"), moved?.body ?? ""].join("\n"),
        "utf-8",
      );
      const after = enumeratePendingState(stateRootOf(root));
      const before = enumeratePendingState(stateRootOf(makeFixtureProject()));
      const diffs = reconcilePendingState(before, after);
      const stateMismatches = diffs.filter((d) => d.kind === "state-mismatch");
      expect(stateMismatches.length).toBeGreaterThanOrEqual(1);
      const target = stateMismatches.find((d) => d.kind === "state-mismatch" && d.beforeState === "pending" && d.afterState === "deferred");
      expect(target).toBeDefined();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("反例（内容不整合）: 同一所在で内容が変化すると content-mismatch を検出する", () => {
    const root = makeFixtureProject();
    try {
      const target = path.join(root, ".agentdev", "backlog", "req-units", "RU-9999-sample.md");
      fs.writeFileSync(target, "# RU-9999: 模擬 RU（改変後）\n\n内容が変化した模擬本文。\n", "utf-8");
      const after = enumeratePendingState(stateRootOf(root));
      const before = enumeratePendingState(stateRootOf(makeFixtureProject()));
      const diffs = reconcilePendingState(before, after);
      const contentMismatch = diffs.filter((d) => d.kind === "content-mismatch");
      expect(contentMismatch.length).toBe(1);
      expect(contentMismatch[0]?.location).toBe("backlog/req-units/RU-9999-sample.md");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("反例（参照関係喪失）: 移行後に参照関係が失われると relation-lost を検出する", () => {
    const root = makeFixtureProject();
    try {
      const target = path.join(
        root,
        ".agentdev",
        "intake",
        "inbox",
        "2026-10-01-sample-intake.md",
      );
      fs.writeFileSync(
        target,
        "# 模擬 intake item A\n\n## 内容\n\n未処理 intake の模擬本文。\n\n",
        "utf-8",
      );
      const after = enumeratePendingState(stateRootOf(root));
      const before = enumeratePendingState(stateRootOf(makeFixtureProject()));
      const diffs = reconcilePendingState(before, after);
      const relationLost = diffs.filter((d) => d.kind === "relation-lost");
      expect(relationLost.length).toBe(1);
      const lost = relationLost[0];
      expect(lost?.kind === "relation-lost" && lost.relation).toBe(
        "link:../../docs/requirements/REQ-109.md",
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("反例（後続処理入力の不成立）: 見出しを欠く項目は処理継続性の実証が合格しない", () => {
    const root = makeFixtureProject();
    try {
      const target = path.join(root, ".agentdev", "backlog", "req-units", "RU-9999-sample.md");
      fs.writeFileSync(target, "見出し行を持たない模擬本文。\n", "utf-8");
      const proof = proveProcessingContinuity(stateRootOf(root));
      expect(proof.ok).toBe(false);
      expect(proof.failures.length).toBe(1);
      expect(proof.failures[0]?.reason).toBe("no-title");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test(".gitkeep 等の管理ファイルは未処理項目として列挙されない", () => {
    const root = makeFixtureProject();
    try {
      const items = enumeratePendingState(stateRootOf(root));
      const gitkeep = items.filter((i) => i.location.includes(".gitkeep"));
      expect(gitkeep.length).toBe(0);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("検証器の偽陽性回避（REQ-109-008・反例を合格としない構造）", () => {
  test("before に対応しない after 追加項目は discrepancy に計上されず、欠落検出を代替しない", () => {
    const before: PendingItem[] = [
      {
        domain: "backlog",
        location: "backlog/req-units/RU-0001-a.md",
        state: "pending",
        contentDigest: "a".repeat(64),
        relations: [],
      },
    ];
    const after: PendingItem[] = [
      {
        domain: "backlog",
        location: "backlog/req-units/RU-0002-b.md",
        state: "pending",
        contentDigest: "b".repeat(64),
        relations: [],
      },
    ];
    const diffs = reconcilePendingState(before, after);
    // before 項目は消失しており missing として検出される（追加項目による補填で合格化しない）
    expect(diffs.length).toBe(1);
    expect(diffs[0]?.kind).toBe("missing");
    expect(diffs[0]?.location).toBe("backlog/req-units/RU-0001-a.md");
  });
});
