//
// scripts/switch-github-route.ps1（GitHub 実行経路切替の公開入口）の挙動テスト。
//
// 実際の入口 script を pwsh で起動し、OS 一時配下の使い捨て consumer リポジトリで
// 検証する（実ネットワークも実 gh も使わない・sleep なし・終了後に一時領域を除去）。
// 検証観点: 本体リポジトリの誤実行停止（変更なし）、plugin / gh の記録とバイト一致、
// 対象外ホストの記録保持、both 切替、冪等（既記録は変更なし）、dry-run の無書込み、
// 未知ホスト・未知経路の拒否、不正な既存設定の非上書き、設定ディレクトリの作成、
// リリース ZIP 版相当の配置（抽出 archive の scripts/ から consumer を操作）。

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync, spawnSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const SWITCH_PS1 = path.join(REPO_ROOT, "scripts", "switch-github-route.ps1");

interface RunResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

function runPwsh(args: readonly string[], cwd: string): RunResult {
  const r = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", ...args], {
    cwd,
    encoding: "utf-8",
  });
  return { exitCode: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function runSwitch(scriptPath: string, args: readonly string[], cwd: string): RunResult {
  return runPwsh(["-File", scriptPath, ...args], cwd);
}

function rmrf(p: string): void {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* swallow */
  }
}

function digestTree(root: string): Map<string, string> {
  const out = new Map<string, string>();
  if (!fs.existsSync(root)) return out;
  const walk = (dir: string): void => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile()) {
        const rel = path.relative(root, full).replace(/\\/g, "/");
        const stat = fs.statSync(full);
        out.set(`${rel}:${stat.size}:${stat.mtimeMs}`);
      }
    }
  };
  walk(root);
  return out;
}

function configPath(root: string): string {
  return path.join(root, ".agentdev", "config", "github-route.json");
}

function expectedConfigBytes(codex: string, antigravity: string): Buffer {
  return Buffer.from(
    `{\n  "codex": "${codex}",\n  "antigravity": "${antigravity}"\n}\n`,
    "utf-8",
  );
}

function writeConfig(root: string, content: string): void {
  fs.mkdirSync(path.join(root, ".agentdev", "config"), { recursive: true });
  fs.writeFileSync(configPath(root), content, "utf-8");
}

/**
 * 最小の consumer fixture（git リポジトリのルート。ADF の投影物は本入口の
 * 前提ではないため、.git の存在だけを consumer 条件として模す）。
 */
function makeConsumerRepo(prefix: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: root });
  execFileSync("git", ["config", "user.name", "t"], { cwd: root });
  return root;
}

/** チェックアウト版相当: consumer リポジトリの scripts/ 配下に入口を置く。 */
function makeCheckoutConsumer(): { root: string; script: string } {
  const root = makeConsumerRepo("switch-checkout-");
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.copyFileSync(SWITCH_PS1, path.join(root, "scripts", "switch-github-route.ps1"));
  return { root, script: path.join(root, "scripts", "switch-github-route.ps1") };
}

describe("switch-github-route / 本体リポジトリの誤実行停止", () => {
  test("本体リポジトリでは何も変更せずに停止し、適切な公開入口を案内する", () => {
    const root = makeConsumerRepo("switch-selfhost-");
    try {
      fs.mkdirSync(path.join(root, "src", "opencode"), { recursive: true });
      fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
      fs.copyFileSync(SWITCH_PS1, path.join(root, "scripts", "switch-github-route.ps1"));
      const before = digestTree(root);
      const r = runSwitch(path.join(root, "scripts", "switch-github-route.ps1"), ["-AgentHosts", "codex", "-Route", "gh"], root);
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain("本体リポジトリ");
      expect(r.stdout).toContain("scripts/self-sync.ps1 を使ってください");
      expect(fs.existsSync(configPath(root))).toBe(false);
      expect(digestTree(root)).toEqual(before);
    } finally {
      rmrf(root);
    }
  }, 60000);
});

describe("switch-github-route / 経路の記録", () => {
  test("codex を gh へ切り替えるとバイト一致の設定を書く（BOM なし・LF・固定順・末尾改行）", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      const r = runSwitch(script, ["-AgentHosts", "codex", "-Route", "gh"], root);
      expect(r.exitCode).toBe(0);
      const bytes = fs.readFileSync(configPath(root));
      expect(bytes[0]).toBe(0x7b);
      expect(bytes.equals(expectedConfigBytes("gh", "plugin"))).toBe(true);
    } finally {
      rmrf(root);
    }
  }, 60000);

  test("対象外ホストの記録は保持される", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      writeConfig(root, '{"codex":"gh","antigravity":"plugin"}');
      const r = runSwitch(script, ["-AgentHosts", "antigravity", "-Route", "gh"], root);
      expect(r.exitCode).toBe(0);
      expect(fs.readFileSync(configPath(root)).equals(expectedConfigBytes("gh", "gh"))).toBe(true);
    } finally {
      rmrf(root);
    }
  }, 60000);

  test("both で両ホストを切り替える", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      const r = runSwitch(script, ["-AgentHosts", "both", "-Route", "gh"], root);
      expect(r.exitCode).toBe(0);
      expect(fs.readFileSync(configPath(root)).equals(expectedConfigBytes("gh", "gh"))).toBe(true);
    } finally {
      rmrf(root);
    }
  }, 60000);

  test("既記録の経路への切替は冪等で、変更なしとして終了 0", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      const first = runSwitch(script, ["-AgentHosts", "codex", "-Route", "gh"], root);
      expect(first.exitCode).toBe(0);
      const before = digestTree(path.join(root, ".agentdev"));
      const bytes = fs.readFileSync(configPath(root));

      const second = runSwitch(script, ["-AgentHosts", "codex", "-Route", "gh"], root);
      expect(second.exitCode).toBe(0);
      expect(second.stdout).toContain("すでに gh が記録されているため変更はありません");
      expect(second.stdout).toContain("変更はありませんでした");
      expect(digestTree(path.join(root, ".agentdev"))).toEqual(before);
      expect(fs.readFileSync(configPath(root)).equals(bytes)).toBe(true);
    } finally {
      rmrf(root);
    }
  }, 120000);
});

describe("switch-github-route / dry-run と入力検査", () => {
  test("dry-run は予定を表示し、何も書き込まない", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      const r = runSwitch(script, ["-AgentHosts", "codex", "-Route", "gh", "-DryRun"], root);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain("[DRY-RUN] codex: plugin -> gh");
      expect(r.stdout).toContain("何も書き込んでいません");
      expect(fs.existsSync(configPath(root))).toBe(false);
    } finally {
      rmrf(root);
    }
  }, 60000);

  test("未知の経路は拒否し、何も書き込まない", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      const r = runSwitch(script, ["-AgentHosts", "codex", "-Route", "cli"], root);
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain("plugin または gh を指定してください");
      expect(fs.existsSync(configPath(root))).toBe(false);
    } finally {
      rmrf(root);
    }
  }, 60000);

  test("未知のホストは拒否し、何も書き込まない", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      const r = runSwitch(script, ["-AgentHosts", "gemini", "-Route", "gh"], root);
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain("codex、antigravity、both のいずれかを指定してください");
      expect(fs.existsSync(configPath(root))).toBe(false);
    } finally {
      rmrf(root);
    }
  }, 60000);

  test("-Route 省略は使い方の表示で終了する（既定値なし・変更なし）", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      const r = runSwitch(script, ["-AgentHosts", "codex"], root);
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain("-AgentHosts と -Route は必須です");
      expect(r.stdout).toContain("使い方:");
      expect(fs.existsSync(configPath(root))).toBe(false);
    } finally {
      rmrf(root);
    }
  }, 60000);
});

describe("switch-github-route / 既存設定の保護", () => {
  test("不正な既存設定は上書きせず、修正または削除を案内して停止する", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      const invalid = "{invalid";
      writeConfig(root, invalid);
      const before = fs.readFileSync(configPath(root));
      const r = runSwitch(script, ["-AgentHosts", "codex", "-Route", "gh"], root);
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain("内容が不正です");
      expect(r.stdout).toContain("修正するか削除");
      expect(fs.readFileSync(configPath(root)).equals(before)).toBe(true);
    } finally {
      rmrf(root);
    }
  }, 60000);

  test("重複キーの既存設定は上書きせず、修正または削除を案内して停止する（共通 Tool 側と同一規則）", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      writeConfig(root, '{"codex":"gh","codex":"plugin"}');
      const before = fs.readFileSync(configPath(root));
      const r = runSwitch(script, ["-AgentHosts", "codex", "-Route", "gh"], root);
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain("重複キーがあります: codex");
      expect(r.stdout).toContain("修正するか削除");
      expect(fs.readFileSync(configPath(root)).equals(before)).toBe(true);
    } finally {
      rmrf(root);
    }
  }, 60000);

  test(".agentdev/config ディレクトリが欠落している場合は作成して書き込む", () => {
    const { root, script } = makeCheckoutConsumer();
    try {
      fs.mkdirSync(path.join(root, ".agentdev"), { recursive: true });
      const r = runSwitch(script, ["-AgentHosts", "antigravity", "-Route", "gh"], root);
      expect(r.exitCode).toBe(0);
      expect(fs.existsSync(path.join(root, ".agentdev", "config"))).toBe(true);
      expect(fs.readFileSync(configPath(root)).equals(expectedConfigBytes("plugin", "gh"))).toBe(true);
    } finally {
      rmrf(root);
    }
  }, 60000);
});

describe("switch-github-route / リリース ZIP 版相当の配置", () => {
  test("抽出 archive の scripts/ から consumer リポジトリの設定を切り替えられる", () => {
    // リポジトリの既存テストは ZIP レイアウトを staging しないため、archive
    // が scripts/switch-github-route.ps1 を運ぶという archive 正規レイアウトに
    // 対応する最小の抽出像（抽出 archive ルート + scripts/ 配下の入口）をここで
    // 構成する。入口はカレントディレクトリのみを対象とするため、抽出場所は
    // consumer リポジトリの外でよい。
    const archiveRoot = fs.mkdtempSync(path.join(os.tmpdir(), "switch-zip-"));
    const consumer = makeConsumerRepo("switch-zip-consumer-");
    try {
      fs.mkdirSync(path.join(archiveRoot, "scripts"), { recursive: true });
      const archiveScript = path.join(archiveRoot, "scripts", "switch-github-route.ps1");
      fs.copyFileSync(SWITCH_PS1, archiveScript);

      const r = runSwitch(archiveScript, ["-AgentHosts", "codex", "-Route", "gh"], consumer);
      expect(r.exitCode).toBe(0);
      expect(fs.readFileSync(configPath(consumer)).equals(expectedConfigBytes("gh", "plugin"))).toBe(true);
    } finally {
      rmrf(archiveRoot);
      rmrf(consumer);
    }
  }, 60000);
});
