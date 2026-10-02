// Behavioral distribution tests for the agentdev-textlint-guard plugin
// package (REQ-053-033 install-time resolution + REQ-029-012/013 dependency
// boundary + REQ-052-007 plugin projection).
//
// Covers the distribution contract under the version-pin-only distribution
// model (vendor artifacts are NOT shipped):
//   - consumer install (git-clone style and source-ZIP style checkouts)
//     projects plugins/agentdev-textlint-guard with a depth-1 loader shim, and
//     the install fails closed when the install-time dependency artifacts
//     (vendor/) are missing or partially generated, guiding the resolution
//     steps (bun install && bun run build:engine) without generating or
//     fetching anything itself
//   - archive install (scripts/consumer/archive/install.ps1 copy mode) behaves
//     the same: exit 6 with resolution guidance until vendor/ is complete
//   - after the resolution steps are run (bun install -> build:engine ->
//     node_modules removed; bun install performs network fetching — this is
//     the documented install-time resolution), the final gate runs from every
//     projection WITHOUT node_modules and with an empty package cache
//   - install.ps1 -Mode check reports version divergence between the
//     generated bundle and the bun.lock pins
//   - release archive staging excludes vendor/, carries
//     THIRD-PARTY-NOTICES.md and the version pin metadata (package.json +
//     bun.lock), and fails closed when the pin metadata is missing
//   - install/self-sync generic enumeration covers the new plugin with no
//     special-case branching and no repo-local exclusion entry

// ADF-COVERS(verification): REQ-053-025, REQ-053-033, REQ-053-034
// ADF-COVERS(verification): REQ-052-006, REQ-052-007
// ADF-COVERS(verification): REQ-050-002, REQ-050-004

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync, spawnSync } from "child_process";
import { invalidateEngineCache, loadEngine } from "../../../src/opencode/plugins/agentdev-textlint-guard/lib/engine-bundle.ts";

const REPO_ROOT = path.resolve(import.meta.dir, "..", "..", "..");
const INSTALL_PS1 = path.join(REPO_ROOT, "scripts", "install.ps1");
const ARCHIVE_INSTALL_PS1 = path.join(REPO_ROOT, "scripts", "consumer", "archive", "install.ps1");
const SELF_SYNC_PS1 = path.join(REPO_ROOT, "scripts", "self-sync.ps1");
const PLUGIN_SOURCE_DIR = path.join(REPO_ROOT, "src", "opencode", "plugins", "agentdev-textlint-guard");

const CLEAN_DOC = "# 見出し\n\nこれは正常な文章である。\n";
const VIOLATING_DOC = "# 見出し\n\n半角カナ\uFF71\uFF72\uFF73が混入している。\n";

function rmrf(p: string): void {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* swallow */
  }
}

function copyTree(src: string, dst: string, skip: (rel: string) => boolean = () => false): void {
  // rel は copyTree 起点（plugin package root）からの相対パスで skip へ渡す
  const root = src;
  const walk = (dir: string, dest: string): void => {
    fs.mkdirSync(dest, { recursive: true });
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const s = path.join(dir, ent.name);
      const d = path.join(dest, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules") continue;
        // skip 対象のディレクトリ（tests/、vendor/ 等）はディレクトリ自体を作らない
        const dirRel = path.relative(root, s);
        if (skip(dirRel)) continue;
        walk(s, d);
      } else if (ent.isFile()) {
        const rel = path.relative(root, s);
        if (skip(rel)) continue;
        fs.copyFileSync(s, d);
      }
    }
  };
  walk(src, dst);
}

/** 実 plugin package を node_modules・vendor なしでフィクスチャへ配置する（版固定情報のみ配布の前提）。 */
function placeRealPlugin(parentSrcOpencode: string): void {
  copyTree(PLUGIN_SOURCE_DIR, path.join(parentSrcOpencode, "plugins", "agentdev-textlint-guard"), (rel) => {
    const norm = rel.replaceAll("\\", "/");
    // テスト実行成果物と導入時生成依存（vendor）は配布物に含めない（ディレクトリ自体も含まない）
    return (
      norm === "tests" || norm.startsWith("tests/") || norm === "vendor" || norm.startsWith("vendor/")
    );
  });
}

/**
 * 導入手順（依存生成）を fixture の plugin package 配下で実行する。
 * bun install はネットワーク取得を含む（導入時依存解決の検証構成として明示）。
 * 依存生成後に node_modules を除去する（検証構成の明示項目）。
 */
function runDependencyResolution(pluginPackageDir: string): void {
  execFileSync("bun", ["install"], { cwd: pluginPackageDir, stdio: "pipe", maxBuffer: 16 * 1024 * 1024 });
  execFileSync("bun", ["run", "build:engine"], { cwd: pluginPackageDir, stdio: "pipe", maxBuffer: 16 * 1024 * 1024 });
  rmrf(path.join(pluginPackageDir, "node_modules"));
}

/** vendor 成果物の完全状態（engine bundle + kuromoji 辞書）の存在を確認する。 */
function expectVendorComplete(pluginPackageDir: string): void {
  expect(fs.existsSync(path.join(pluginPackageDir, "vendor", "textlint-engine.bundle.json"))).toBe(true);
  const dictFiles = fs.readdirSync(path.join(pluginPackageDir, "vendor", "kuromoji-dict"));
  expect(dictFiles.length).toBeGreaterThan(0);
}

/** fail-closed 案内文言（導入手順の提示）を確認する。 */
function expectVendorGuidance(text: string): void {
  expect(text).toContain("bun install");
  expect(text).toContain("bun run build:engine");
}

interface GateRun {
  readonly exitCode: number;
  readonly stdout: string;
}

function runGateFrom(projectionPluginDir: string, projectRoot: string): GateRun {
  const emptyCache = fs.mkdtempSync(path.join(os.tmpdir(), "adf-empty-cache-"));
  try {
    const r = spawnSync("bun", ["run", path.join(projectionPluginDir, "gate.ts"), "--root", projectRoot], {
      encoding: "utf8",
      env: { ...process.env, BUN_INSTALL_CACHE_DIR: emptyCache, BUN_INSTALL_BIN_DIR: emptyCache },
      maxBuffer: 16 * 1024 * 1024,
    });
    return { exitCode: r.status ?? -1, stdout: `${r.stdout ?? ""}${r.stderr ?? ""}` };
  } finally {
    rmrf(emptyCache);
  }
}

function runPwsh(file: string, args: readonly string[], cwd: string): { exitCode: number; stdout: string } {
  const r = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-File", file, ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return { exitCode: r.status ?? -1, stdout: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function writeDocs(root: string, files: Record<string, string>): void {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
}

function assertNoNodeModules(root: string): void {
  expect(fs.existsSync(path.join(root, "node_modules"))).toBe(false);
  const pluginDir = path.join(root, ".opencode", "plugins", "agentdev-textlint-guard");
  expect(fs.existsSync(path.join(pluginDir, "node_modules"))).toBe(false);
}

function expectShim(pluginsDir: string): void {
  const shim = path.join(pluginsDir, "agentdev-textlint-guard.ts");
  expect(fs.existsSync(shim)).toBe(true);
  expect(fs.readFileSync(shim, "utf8")).toBe(
    `// Generated by scripts/install.ps1 / scripts/self-sync.ps1 - do not edit.\n` +
      `export { default } from "./agentdev-textlint-guard/plugin.ts";\n`,
  );
}

describe("agentdev-textlint-guard distribution / consumer install (TS-005 / TS-006)", () => {
  function consumerScenario(label: string, gitCloneStyle: boolean): void {
    test(`${label}: vendor 欠落で fail-closed 停止と案内、導入手順後の offline gate`, () => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), `adftl-dist-${gitCloneStyle ? "git" : "zip"}-`));
      try {
        // マルチホスト正本モデルの最小フィクスチャ: 共通正本 src/common/（commands/tools の
        // 投影元・usable checkout 判定材料）+ OpenCode 接続領域 src/opencode/（plugins）+
        // Senpi 接続領域 src/senpi/（配置対象ホスト既定 both の投影元）
        const srcCommon = path.join(root, ".agentdev-plugin", "src", "common");
        const srcOpencode = path.join(root, ".agentdev-plugin", "src", "opencode");
        const srcSenpi = path.join(root, ".agentdev-plugin", "src", "senpi");
        fs.mkdirSync(path.join(srcCommon, "commands", "agentdev"), { recursive: true });
        fs.writeFileSync(path.join(srcCommon, "commands", "agentdev", "case-run.md"), "# case-run\n", "utf8");
        // check モードは .opencode/tools の存在を期待するため既存テストと同じ最小 tools エントリを置く
        fs.mkdirSync(path.join(srcCommon, "tools", "agentdev-gh"), { recursive: true });
        fs.writeFileSync(path.join(srcCommon, "tools", "agentdev-gh", "index.ts"), "// tool\n", "utf8");
        fs.mkdirSync(path.join(srcSenpi, "connection-demo"), { recursive: true });
        fs.writeFileSync(path.join(srcSenpi, "connection-demo", "connection.ts"), "// senpi connection\n", "utf8");
        fs.writeFileSync(path.join(srcSenpi, "README.md"), "# src/senpi/ (Senpi host connection area)\n", "utf8");
        placeRealPlugin(srcOpencode);
        fs.mkdirSync(path.join(root, "scripts", "consumer"), { recursive: true });
        fs.copyFileSync(INSTALL_PS1, path.join(root, "scripts", "install.ps1"));
        fs.copyFileSync(path.join(REPO_ROOT, "scripts", "consumer", "common.ps1"), path.join(root, "scripts", "consumer", "common.ps1"));
        execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
        execFileSync("git", ["config", "user.email", "t@t"], { cwd: root });
        execFileSync("git", ["config", "user.name", "t"], { cwd: root });
        if (gitCloneStyle) {
          const plugin = path.join(root, ".agentdev-plugin");
          execFileSync("git", ["init", "-q", "-b", "main"], { cwd: plugin });
          execFileSync("git", ["config", "user.email", "t@t"], { cwd: plugin });
          execFileSync("git", ["config", "user.name", "t"], { cwd: plugin });
          execFileSync("git", ["add", "-A"], { cwd: plugin });
          execFileSync("git", ["commit", "-q", "-m", "plugin"], { cwd: plugin });
        }

        const pluginCheckout = path.join(srcOpencode, "plugins", "agentdev-textlint-guard");
        // 版固定情報は配布され、導入時生成依存（vendor）は未生成の前提
        expect(fs.existsSync(path.join(pluginCheckout, "package.json"))).toBe(true);
        expect(fs.existsSync(path.join(pluginCheckout, "bun.lock"))).toBe(true);
        expect(fs.existsSync(path.join(pluginCheckout, "vendor"))).toBe(false);

        // 依存未生成のまま install → fail-closed 停止と導入手順案内（配置は行われない）
        const blockedApply = runPwsh(path.join(root, "scripts", "install.ps1"), ["-Mode", "apply"], root);
        expect(blockedApply.exitCode).toBe(1);
        expectVendorGuidance(blockedApply.stdout);
        expect(fs.existsSync(path.join(root, ".opencode", "plugins", "agentdev-textlint-guard"))).toBe(false);

        // 案内の導入手順を実行（bun install → build:engine → node_modules 除去。ネットワーク取得を含む）
        runDependencyResolution(pluginCheckout);
        expectVendorComplete(pluginCheckout);

        // 再実行 → 成功（junction + shim）
        const apply = runPwsh(path.join(root, "scripts", "install.ps1"), ["-Mode", "apply"], root);
        expect(apply.exitCode).toBe(0);

        const pluginsDir = path.join(root, ".opencode", "plugins");
        const pluginLink = path.join(pluginsDir, "agentdev-textlint-guard");
        expect(fs.existsSync(path.join(pluginLink, "plugin.ts"))).toBe(true);
        expect(fs.existsSync(path.join(pluginLink, "vendor", "textlint-engine.bundle.json"))).toBe(true);
        expect(fs.existsSync(path.join(pluginLink, "rules", "default-prh.yml"))).toBe(true);
        expectShim(pluginsDir);

        const check = runPwsh(path.join(root, "scripts", "install.ps1"), ["-Mode", "check"], root);
        expect(check.exitCode).toBe(0);
        expect(check.stdout).toContain("textlint guard plugin dependency versions match the bun.lock pins");

        // 部分生成状態（辞書欠損）でも fail-closed 停止する
        const dictDir = path.join(pluginCheckout, "vendor", "kuromoji-dict");
        const dictBackup = `${dictDir}.backup`;
        fs.renameSync(dictDir, dictBackup);
        try {
          const partialApply = runPwsh(path.join(root, "scripts", "install.ps1"), ["-Mode", "apply"], root);
          expect(partialApply.exitCode).toBe(1);
          expectVendorGuidance(partialApply.stdout);
        } finally {
          fs.renameSync(dictBackup, dictDir);
        }

        // install.ps1 -Mode check が版乖離（bundle versions ≠ bun.lock pin）を報告に含める
        const bundlePath = path.join(pluginCheckout, "vendor", "textlint-engine.bundle.json");
        const bundleBackup = fs.readFileSync(bundlePath, "utf8");
        try {
          const envelope = JSON.parse(bundleBackup) as { versions: Record<string, string> };
          const divergent = { ...envelope, versions: { ...envelope.versions } };
          divergent.versions["@textlint/kernel"] = "0.0.0-divergent";
          fs.writeFileSync(bundlePath, JSON.stringify(divergent), "utf8");
          const checkDivergence = runPwsh(path.join(root, "scripts", "install.ps1"), ["-Mode", "check"], root);
          expect(checkDivergence.exitCode).toBe(1);
          expect(checkDivergence.stdout).toContain("version divergence");
        } finally {
          fs.writeFileSync(bundlePath, bundleBackup, "utf8");
        }

        // オフライン最終検査（node_modules なし・空キャッシュ環境変数）
        assertNoNodeModules(root);
        writeDocs(root, { "docs/ok.md": CLEAN_DOC });
        const pass = runGateFrom(pluginLink, root);
        expect(pass.exitCode).toBe(0);
        expect(pass.stdout).toContain("PASS");

        writeDocs(root, { "docs/bypass.md": VIOLATING_DOC });
        const fail = runGateFrom(pluginLink, root);
        expect(fail.exitCode).toBe(1);
        expect(fail.stdout).toContain("no-hankaku-kana");
      } finally {
        rmrf(root);
      }
    }, 600000);
  }

  consumerScenario("git clone checkout", true);
  consumerScenario("source ZIP checkout (.git absent inside the plugin checkout)", false);
});

describe("agentdev-textlint-guard distribution / archive install (TS-005)", () => {
  test("archive installer: vendor 欠落で exit 6 停止と案内、導入手順後の再実行成功と offline gate", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-arc-"));
    try {
      const stageSrc = path.join(root, "archive", "src", "opencode");
      fs.mkdirSync(path.join(stageSrc, "commands", "agentdev"), { recursive: true });
      fs.writeFileSync(path.join(stageSrc, "commands", "agentdev", "case-run.md"), "# case-run\n", "utf8");
      fs.mkdirSync(path.join(stageSrc, "skills", "agentdev-workflow-case-run"), { recursive: true });
      fs.writeFileSync(path.join(stageSrc, "skills", "agentdev-workflow-case-run", "SKILL.md"), "# case-run\n", "utf8");
      placeRealPlugin(stageSrc);

      const target = path.join(root, "consumer", ".opencode");
      const installerArgs = ["-Source", path.join(root, "archive", "src", "opencode"), "-Target", target, "-Mode", "copy"];

      // 依存未生成のまま installer → exit 6（fail-closed）と導入手順案内
      const blocked = runPwsh(ARCHIVE_INSTALL_PS1, installerArgs, root);
      expect(blocked.exitCode).toBe(6);
      expectVendorGuidance(blocked.stdout);

      // 案内の導入手順を配置先 plugin package 配下で実行（ネットワーク取得を含む）
      const installedPlugin = path.join(target, "plugins", "agentdev-textlint-guard");
      runDependencyResolution(installedPlugin);
      expectVendorComplete(installedPlugin);

      // 再実行 → 成功
      const r = runPwsh(ARCHIVE_INSTALL_PS1, installerArgs, root);
      expect(r.exitCode).toBe(0);

      const pluginsDir = path.join(target, "plugins");
      const pluginDir = path.join(pluginsDir, "agentdev-textlint-guard");
      expect(fs.existsSync(path.join(pluginDir, "plugin.ts"))).toBe(true);
      expect(fs.existsSync(path.join(pluginDir, "gate.ts"))).toBe(true);
      expect(fs.existsSync(path.join(pluginDir, "vendor", "textlint-engine.bundle.json"))).toBe(true);
      expectShim(pluginsDir);

      // archive 導入は実ファイル配置（junction-free）
      const stat = fs.lstatSync(pluginDir);
      expect(stat.isSymbolicLink()).toBe(false);

      const consumerRoot = path.join(root, "consumer");
      assertNoNodeModules(consumerRoot);
      writeDocs(consumerRoot, { "docs/ok.md": CLEAN_DOC, "docs/violating.md": VIOLATING_DOC });
      const gate = runGateFrom(pluginDir, consumerRoot);
      expect(gate.exitCode).toBe(1);
      expect(gate.stdout).toContain("violating.md");
      expect(gate.stdout).toContain("no-hankaku-kana");
    } finally {
      rmrf(root);
    }
  }, 600000);
});

describe("agentdev-textlint-guard engine-bundle error guidance (TS-005)", () => {
  test("vendor 不在の loadEngine エラー detail に導入手順案内を含める", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-ebg-"));
    try {
      const pluginPackageDir = path.join(root, "plugin");
      fs.mkdirSync(pluginPackageDir, { recursive: true });
      // vendor が欠落した部分状態の代理（package.json のみ配置）
      fs.writeFileSync(path.join(pluginPackageDir, "package.json"), "{}\n", "utf8");
      invalidateEngineCache();
      const result = await loadEngine(pluginPackageDir);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.detail).toContain("cannot read the vendored engine bundle");
      expect(result.detail).toContain("bun install");
      expect(result.detail).toContain("bun run build:engine");
      invalidateEngineCache();
    } finally {
      rmrf(root);
    }
  });
});

describe("agentdev-textlint-guard distribution / generic enumeration contract (TS-005)", () => {
  test("install.ps1 and package-release-archive.ps1 keep the plugin out of repo-local exclusions", () => {
    const install = fs.readFileSync(INSTALL_PS1, "utf8");
    const release = fs.readFileSync(
      path.join(REPO_ROOT, "scripts", "self", "release", "package-release-archive.ps1"),
      "utf8",
    );
    const archiveInstall = fs.readFileSync(ARCHIVE_INSTALL_PS1, "utf8");
    for (const [name, text] of [
      ["install.ps1", install],
      ["package-release-archive.ps1", release],
      ["archive install.ps1", archiveInstall],
    ] as const) {
      // repo-local 除外リストは agentdev-distribution-boundary-guard のみ（追加禁止）
      const repoLocalMatch = text.match(/\$repoLocalPluginNames?\s*=\s*@\(([^)]*)\)/i);
      expect(repoLocalMatch).not.toBeNull();
      if (repoLocalMatch !== null) {
        expect(repoLocalMatch[1]).not.toContain("agentdev-textlint-guard");
      }
      // 汎用列挙（agentdev-* フィルタ）が存在する
      expect(text).toMatch(/agentdev-\*/);
      void name;
    }
  });

  test("self-sync.ps1 enumerates plugins generically and does not exclude the plugin", () => {
    const sync = fs.readFileSync(SELF_SYNC_PS1, "utf8");
    expect(sync).toMatch(/plugins/);
    expect(sync).toMatch(/agentdev-\*/);
    expect(sync).not.toContain("agentdev-textlint-guard");
  });

  test("release archive staging excludes vendor/ and carries THIRD-PARTY-NOTICES.md + version pin metadata", () => {
    const release = fs.readFileSync(
      path.join(REPO_ROOT, "scripts", "self", "release", "package-release-archive.ps1"),
      "utf8",
    );
    // Copy-Item -Recurse で plugin package 全体を stage へコピーした後、
    // node_modules と導入時生成依存（vendor/）が staging から除去される
    expect(release).toMatch(/Filter "node_modules"/);
    expect(release).toMatch(/Filter "vendor"/);
    // THIRD-PARTY-NOTICES.md を必須同梱する（repo root の通知文書。欠落時 fail-closed）
    expect(fs.existsSync(path.join(REPO_ROOT, "THIRD-PARTY-NOTICES.md"))).toBe(true);
    expect(release).toContain("THIRD-PARTY-NOTICES.md");
    // 版固定情報（package.json + bun.lock）不在時の fail-closed 検査を含める
    expect(release).toContain('foreach ($pinFile in @("package.json", "bun.lock"))');
  });

  test("install.ps1 -Mode check includes the vendor completeness and version divergence checks", () => {
    const install = fs.readFileSync(INSTALL_PS1, "utf8");
    expect(install).toContain("Test-TextlintVendorReady");
    expect(install).toContain("Test-TextlintBundleVersionsMatchPin");
    expect(install).toContain("version divergence");
  });
});
