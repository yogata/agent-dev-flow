// scripts/git-hooks/minimal-gate.mjs — Minimal-by-Default ゲート（決定論的・ローカル）。
// agent-dev-flow ソースリポジトリ専用。配布物（配布アーカイブ・consumer リポジトリ）には
// 含めない（配布写像は trusted-distribution-gate/manifest.ts の限定列挙で scripts/git-hooks/ は対象外）。
// 実行点は pre-commit のみ（単一の正本）。pre-push は本ゲートを実行しない（整合性・試験の品質保証のみ担当）。
// 2 検査: (a) 単一ファイルサイズ上限（LLM コンテキスト・1モジュール1責務の目安）
//        (b) アクティブ WIP キューの滞留監視（WARN 表示のみ）
// 強制度合い: block は「恒久資産（.agentdev/ 以外）の新規追加ファイルが単一ファイルサイズ上限を
// 超える場合」のみ。.agentdev/ 配下（drafts/・backlog/ 等）は工程の一時ワークスペースであるため、
// 上限超過は新規・既存を問わず WARN 表示のみで終了コード 0 とする。恒久資産の既存の上限超過
// ファイルを編集する場合も WARN 表示のみとし、リファクタリング途中のコミットを妨げない。
// backlog/intake/learning/inspect のキューは後から非同期に処理するため、滞留ゼロを強制しない
// （合計 10 件超のみ WARN 表示。ワークフロー自身の learning 自動保存が push を自己ブロックした
// 構造欠陥の解消。2026-11-20）。
// 存在しない過去資産の監視（禁止パス・追加行の禁止語スキャン）は置かない（Zero-Base Filter。
// 歴史は Git ログが唯一の正本である）。
// 呼び出し: bun scripts/git-hooks/minimal-gate.mjs pre-commit
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const mode = process.argv[2] ?? "pre-commit";
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });

const KB = 1024;
// 単一ファイルサイズ上限（LLM コンテキスト・1モジュール1責務の目安）。
const FILE_SIZE_LIMITS = [
  { label: ".md", test: (p) => p.endsWith(".md"), maxBytes: 20 * KB },
  { label: ".ts", test: (p) => p.endsWith(".ts"), maxBytes: 25 * KB },
];
// アクティブ WIP キュー（滞留は WARN 表示のみ。.gitkeep と README.md は数えない）。
const WIP_QUEUE_DIRS = [
  ".agentdev/backlog/req-units",
  ".agentdev/intake/inbox",
  ".agentdev/learning/inbox",
  ".agentdev/inspect/inbox",
];
const WIP_QUEUE_MAX = 10;
// ガバナンス表面積（WARN 表示のみ）。
const IR_RULES_DIR = "src/common/skills/repo-agentdev-integrity/rules";
const IR_RULES_MAX = 25;
const PUBLIC_COMMANDS_DIR = "src/common/commands/agentdev";
const PUBLIC_COMMANDS_MAX = 15;

const violations = [];
const warnings = [];
const fail = (msg) => violations.push(msg);
const warn = (msg) => warnings.push(msg);
const worktreeSize = (p) => {
  try {
    return statSync(path.join(root, p)).size;
  } catch {
    return -1;
  }
};

// --- git 状態の読み取り補助（stagedEntries と単一ファイル上限の判定で使用） ---
function headTree() {
  const map = new Map();
  let out = "";
  try {
    out = git(["ls-tree", "-r", "-l", "HEAD"]);
  } catch {
    return map;
  }
  for (const line of out.split("\n")) {
    const m = line.match(/^\d+\s+\w+\s+[0-9a-f]+\s+(\d+|-)\t(.+)$/);
    if (m) map.set(m[2], m[1] === "-" ? 0 : Number(m[1]));
  }
  return map;
}

function stagedEntries() {
  let out = "";
  try {
    out = git(["diff", "--cached", "--name-status", "--no-renames"]);
  } catch {
    return [];
  }
  const entries = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    const tab = line.indexOf("\t");
    if (tab < 0) continue;
    const status = line.slice(0, tab).trim()[0];
    const file = line.slice(tab + 1).trim();
    if (file) entries.push({ status, file });
  }
  return entries;
}

// --- (a) 単一ファイルサイズ上限（恒久資産の新規追加のみ block。.agentdev/ 一時ワークスペースと既存ファイルの編集は WARN） ---
function checkFileSizes() {
  const head = headTree();
  for (const { status, file } of stagedEntries()) {
    if (status === "D") continue;
    const limit = FILE_SIZE_LIMITS.find((l) => l.test(file));
    if (!limit) continue;
    const size = worktreeSize(file);
    if (size < 0) continue;
    if (size <= limit.maxBytes) continue;
    if (file === ".agentdev" || file.startsWith(".agentdev/")) {
      warn(
        `WARN 単一ファイル上限超過(.agentdev/ 一時ワークスペース・ブロックしない): ${file} ${size} バイト（上限 ${limit.maxBytes}、${limit.label}）`,
      );
      continue;
    }
    const old = head.get(file) ?? 0;
    if (old === 0) {
      fail(`単一ファイル上限(新規追加): ${file} ${size} バイト（上限 ${limit.maxBytes}、${limit.label}）`);
    } else {
      warn(
        `WARN 単一ファイル上限超過(既存ファイルの編集・ブロックしない): ${file} ${size} バイト（上限 ${limit.maxBytes}、${limit.label}）`,
      );
    }
  }
}

// --- (b) アクティブ WIP キューの滞留監視（WARN 表示のみ） ---
function countQueueFiles(relDir) {
  const abs = path.join(root, relDir);
  if (!existsSync(abs)) return 0;
  const walk = (dir) => {
    let n = 0;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".gitkeep" || entry.name === "README.md") continue;
      if (entry.isDirectory()) n += walk(path.join(dir, entry.name));
      else n += 1;
    }
    return n;
  };
  return walk(abs);
}

function checkWipQueues() {
  const counts = WIP_QUEUE_DIRS.map((d) => ({ dir: d, n: countQueueFiles(d) }));
  const total = counts.reduce((s, c) => s + c.n, 0);
  if (total > WIP_QUEUE_MAX) {
    const detail = counts.filter((c) => c.n > 0).map((c) => `${c.dir}: ${c.n}`).join(", ");
    warn(`WARN WIPキュー滞留: 合計 ${total} 件（目安 ${WIP_QUEUE_MAX}）${detail ? ` — ${detail}` : ""}`);
  }
}

// --- (c) ガバナンス表面積の監視（WARN 表示のみ） ---
function countDirFiles(relDir, filter) {
  const abs = path.join(root, relDir);
  if (!existsSync(abs)) return 0;
  return readdirSync(abs).filter((f) => (filter ? filter(f) : true)).length;
}

function checkGovernance() {
  const irs = countDirFiles(IR_RULES_DIR, (f) => /^ir-\d+.*\.ts$/.test(f));
  if (irs > IR_RULES_MAX) {
    warn(`WARN ガバナンス表面積: IR ルール ${irs} 件（上限 ${IR_RULES_MAX}）`);
  }
  const cmds = countDirFiles(PUBLIC_COMMANDS_DIR, (f) => f.endsWith(".md") && f !== "README.md");
  if (cmds > PUBLIC_COMMANDS_MAX) {
    warn(`WARN ガバナンス表面積: 公開コマンド ${cmds} 件（上限 ${PUBLIC_COMMANDS_MAX}）`);
  }
}

// --- WIP キュー滞留の WARN 監視は pre-commit のみで実行（pre-push は本ゲートを持たない） ---

if (mode === "pre-commit") {
  checkFileSizes();
  checkWipQueues();
  checkGovernance();
} else {
  console.error(`[minimal-gate] 未知のモード: ${mode}`);
  process.exit(2);
}

for (const w of warnings) console.log(`  - ${w}`);
if (violations.length > 0) {
  console.error(`[minimal-gate] ${mode} 検査不合格（${violations.length} 件）:`);
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}
console.log(`[minimal-gate] ${mode} 検査合格${warnings.length > 0 ? `（WARN ${warnings.length} 件）` : ""}`);
process.exit(0);
