// scripts/git-hooks/minimal-gate.mjs — Minimal-by-Default ゲート（決定論的・ローカル）。
// 3 検査: (a) 物理バジェット（領域別ファイル数・容量・単一ファイル上限）
//        (b) 歴史堆積語彙の追加・変更行ブロック（例外台帳なし）
//        (c) .agentdev/ 未処理キュー（inbox）滞留の push ブロック
// 予算の判断規則: 上限超過かつ前回比増加の場合のみブロックする（新規膨張のみを阻止し、
// 縮小方向の変更は常に許可する）。検証基盤自身（scripts/git-hooks/）は予算計上から除外する。
// 呼び出し: bun scripts/git-hooks/minimal-gate.mjs pre-commit | pre-push
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const mode = process.argv[2] ?? "pre-commit";
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });

const KB = 1024;
const MB = 1024 * 1024;
// 領域別上限（Step 0 推奨値を初期値として採用。段階的に縮小する静的上限）。
const AREAS = [
  { name: "(total)", maxFiles: 1300, maxBytes: 10 * MB },
  { name: "src/", maxFiles: 600, maxBytes: 5 * MB },
  { name: ".opencode/", maxFiles: 60 },
  { name: "docs/decisions/", maxFiles: 35 },
  { name: "docs/designs/", maxFiles: 110, maxBytes: Math.round(1.3 * MB) },
  { name: "docs/requirements/", maxFiles: 70 },
  { name: "docs/knowledge/", maxFiles: 30 },
  { name: "docs/reports/", maxFiles: 15, maxBytes: Math.round(0.5 * MB) },
  { name: "traceability/", maxFiles: 45 },
  { name: "scripts/", maxFiles: 40, maxBytes: Math.round(0.6 * MB) },
  { name: ".agentdev/", maxFiles: 20 },
];
// 単一ファイル上限（サイズ・行数）。先頭一致の最初の条件を適用する。
const FILE_LIMITS = [
  { label: ".md", test: (p) => p.endsWith(".md"), maxBytes: 50 * KB, maxLines: 2000 },
  { label: "code", test: () => true, maxBytes: 100 * KB, maxLines: 4000 },
];
const GATE_PREFIX = "scripts/git-hooks/";
// 堆積語彙（追加・変更行で禁止。例外台帳は作らない。learning/deferred は
// 現行パス・status 値として存続するため語彙から除外）。
const ACCUMULATION_RE =
  /(後方互換|互換層|legacy|deprecat|\bv[345]\b|移行手順|見送り|baseline|crosswalk|retired|欠番)/i;

const violations = [];
const fail = (msg) => violations.push(msg);
const worktreeSize = (p) => {
  try {
    return statSync(path.join(root, p)).size;
  } catch {
    return -1;
  }
};
const worktreeLines = (p) => {
  try {
    return readFileSync(path.join(root, p), "utf8").split("\n").length;
  } catch {
    return -1;
  }
};

// --- (a) 物理バジェット ---
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

function checkBudget() {
  const head = headTree();
  const projected = new Map(head);
  const touched = [];
  for (const { status, file } of stagedEntries()) {
    if (status === "D") {
      projected.delete(file);
    } else {
      const size = worktreeSize(file);
      if (size < 0) projected.delete(file);
      else projected.set(file, size);
      touched.push({ file, old: head.get(file) ?? 0 });
    }
  }
  const inArea = (file, area) => {
    if (file.startsWith(GATE_PREFIX)) return false;
    if (area.name === "(total)") return true;
    return file.startsWith(area.name);
  };
  for (const area of AREAS) {
    let curN = 0;
    let curB = 0;
    let projN = 0;
    let projB = 0;
    for (const [file, size] of head) {
      if (!inArea(file, area)) continue;
      curN += 1;
      curB += size;
    }
    for (const [file, size] of projected) {
      if (!inArea(file, area)) continue;
      projN += 1;
      projB += size;
    }
    if (area.maxFiles !== undefined && projN > area.maxFiles && projN > curN) {
      fail(`物理バジェット超過(増加): ${area.name} ファイル数 ${curN} → ${projN}（上限 ${area.maxFiles}）`);
    }
    if (area.maxBytes !== undefined && projB > area.maxBytes && projB > curB) {
      fail(`物理バジェット超過(増加): ${area.name} 容量 ${curB} → ${projB} バイト（上限 ${area.maxBytes}）`);
    }
  }
  for (const { file, old } of touched) {
    if (file.startsWith(GATE_PREFIX)) continue;
    const limit = FILE_LIMITS.find((l) => l.test(file));
    if (!limit) continue;
    const size = worktreeSize(file);
    const lines = worktreeLines(file);
    if (size > limit.maxBytes && size > old) {
      fail(`単一ファイル上限(増加): ${file} ${size} バイト（上限 ${limit.maxBytes}、${limit.label}）`);
    }
    if (lines > limit.maxLines && size > old) {
      fail(`単一ファイル上限(増加): ${file} ${lines} 行（上限 ${limit.maxLines}、${limit.label}）`);
    }
  }
}

// --- (b) 堆積語彙ブロック（追加・変更行のみ。検証基盤自身を対象外） ---
function checkVocabulary() {
  let out = "";
  try {
    out = git(["diff", "--cached", "-U0", "--no-color"]);
  } catch {
    return;
  }
  let file = "";
  let lineNo = 0;
  for (const line of out.split("\n")) {
    if (line.startsWith("+++")) {
      file = line.slice(6).trim();
      continue;
    }
    const hunk = line.match(/^@@ -(?:\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      lineNo = Number(hunk[1]) - 1;
      continue;
    }
    if (line.startsWith("+") && file && !file.startsWith(GATE_PREFIX)) {
      lineNo += 1;
      const text = line.slice(1);
      if (ACCUMULATION_RE.test(text)) {
        fail(`堆積語彙: ${file}:${lineNo} ${text.trim().slice(0, 100)}`);
      }
    }
  }
}

// --- (c) キュー滞留ゼロ強制（.agentdev/ 配下の inbox ディレクトリ） ---
function checkQueue() {
  const base = path.join(root, ".agentdev");
  if (!existsSync(base)) return;
  const scan = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;
      if (entry.name === "inbox") {
        const lingering = readdirSync(full).filter((f) => f !== ".gitkeep");
        if (lingering.length > 0) {
          fail(`未処理キュー滞留: ${path.relative(root, full)} に ${lingering.length} 件残存`);
        }
      } else {
        scan(full);
      }
    }
  };
  scan(base);
}

if (mode === "pre-commit") {
  checkBudget();
  checkVocabulary();
} else if (mode === "pre-push") {
  checkQueue();
} else {
  console.error(`[minimal-gate] 未知のモード: ${mode}`);
  process.exit(2);
}

if (violations.length > 0) {
  console.error(`[minimal-gate] ${mode} 検査不合格（${violations.length} 件）:`);
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}
console.log(`[minimal-gate] ${mode} 検査合格`);
process.exit(0);
