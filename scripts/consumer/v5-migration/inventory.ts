// v4 -> v5 移行 意味インベントリ生成ツール（OU-0007 / Issue #3592 / REQ-109）
// ADF-COVERS(implementation): REQ-109-002, REQ-109-003, REQ-109-007
//
// 契約: docs/designs/foundations/v4-migration-and-release.md「v4 → v5 移行手順と検証」節
// （手順 1: 意味インベントリ・手順 2: 対応付け）・docs/decisions/DEC-056.md。
//
// - 移行対象 Project の有効な正規情報（要件・重要判断・現在の設計・対応関係表現）と
//   未処理改善情報（Intake・Learning・Backlog と周辺の改善記録）を網羅列挙する、
//   読み取り専用の決定的スクリプトである
// - 列挙系統:
//   A. 有効な正規情報（REQ-109-002）: docs/requirements/（現行・retired 含む世代境界）・
//      docs/decisions/・docs/designs/
//   B. 対応関係表現（REQ-109-003）: traceability/ 配下 sidecar（component 一覧）と
//      inline ADF-COVERS 宣言（src・scripts・docs・.agentdev を走査）
//   C. 未処理改善情報（REQ-109-007）: .agentdev/ の intake・learning・backlog・inspect・
//      blocked・drafts・issues。内容（sha256-12/bytes）・処理状態・参照関係（#NNN 件数）を
//      属性として列挙する
// - 空の配置は「空（正規消費済み相当または未生成）」として空確認に記録し、欠落と誤判定しない
// - 出力は markdown 形式の inventory レポート（semantic inventory + 対応関係表現 +
//   空確認 + migration mapping 全項目雛形）を stdout へ出力する。ファイル書き込みを行わない
//   （副作用ゼロ・DEC-016 導入系スクリプト副作用ゼロ原則の適用）
// - 処遇候補（keep / redefine / supersede / retire / defer）は雛形の初期値であり、
//   処遇の確定は人手で行う（REQ-109-006: 人手介入を含む移行方法）
// - 存在しないパス・空 .agentdev に対してはエラー終了せず、正常終了で空レポートを出力する
//
// CLI:
//   bun scripts/consumer/v5-migration/inventory.ts [--root <path>]
//     --root  対象 Project ルート（デフォルト: 実行時 cwd）
//   終了コード: 常に 0（読み取り専用・検証失敗という終了状態を持たない）

import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";

export interface InventoryItem {
  readonly system: string; // 系統: A 正規情報 / B 対応関係表現 / C 未処理改善情報
  readonly area: string;
  readonly relPath: string; // root 相対 POSIX
  readonly category: string; // 分類（寿命相当）
  readonly status: string; // frontmatter status 等（該当なしは "—"）
  readonly processState: string; // 処理状態（正規情報は "—"）
  readonly content: string; // sha256-12/bytes（ファイル不在は "—"）
  readonly references: string; // 参照関係（#NNN 出現件数）
  readonly disposition: string; // 処遇候補の初期値
}

export const DISPOSITIONS = ["keep", "redefine", "supersede", "retire", "defer"] as const;

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function listFilesRecursive(absDir: string): string[] {
  const out: string[] = [];
  const stack: string[] = [absDir];
  while (stack.length > 0) {
    const cur = stack.pop() as string;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const abs = path.join(cur, e.name);
      if (e.isDirectory()) {
        stack.push(abs);
      } else if (e.isFile() && e.name !== ".gitkeep") {
        out.push(abs);
      }
    }
  }
  out.sort();
  return out;
}

function sha256_12(abs: string): string | null {
  try {
    return createHash("sha256").update(fs.readFileSync(abs)).digest("hex").slice(0, 12);
  } catch {
    return null;
  }
}

function byteLen(abs: string): number | null {
  try {
    return fs.statSync(abs).size;
  } catch {
    return null;
  }
}

function readFrontmatterStatus(abs: string): string {
  let txt = "";
  try {
    txt = fs.readFileSync(abs, "utf8");
  } catch {
    return "—";
  }
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return "—";
  const fm = m[1] as string;
  const statusMatch = fm.match(/^status:\s*(.+)$/m);
  if (!statusMatch) return "—";
  const status = (statusMatch[1] as string).trim();
  const supMatch = fm.match(/^superseded_by:\s*(\S+)/m);
  return supMatch ? status + " (superseded_by " + (supMatch[1] as string) + ")" : status;
}

function referenceCount(abs: string): string {
  let txt = "";
  try {
    txt = fs.readFileSync(abs, "utf8");
  } catch {
    return "—";
  }
  const count = (txt.match(/#\d+/g) ?? []).length;
  return count > 0 ? String(count) + " 件" : "—";
}

function contentLabel(abs: string): string {
  const h = sha256_12(abs);
  const n = byteLen(abs);
  if (h === null || n === null) return "—";
  return h + "/" + n + "B";
}

function item(
  system: string,
  area: string,
  rootAbs: string,
  abs: string,
  category: string,
  status: string,
  processState: string,
  disposition: string,
): InventoryItem {
  return {
    system,
    area,
    relPath: toPosix(path.relative(rootAbs, abs)),
    category,
    status,
    processState,
    content: contentLabel(abs),
    references: referenceCount(abs),
    disposition,
  };
}

// A 系統: 有効な正規情報（要件・重要判断・現在の設計。現行・廃止・世代境界を含む）
export function scanCanonicalDocs(rootAbs: string): InventoryItem[] {
  const items: InventoryItem[] = [];
  const reqDirs: ReadonlyArray<{ rel: string; retired: boolean }> = [
    { rel: path.join("docs", "requirements"), retired: false },
    { rel: path.join("docs", "requirements", "retired"), retired: true },
  ];
  for (const d of reqDirs) {
    const absDir = path.join(rootAbs, d.rel);
    let names: string[] = [];
    try {
      names = fs.readdirSync(absDir);
    } catch {
      continue;
    }
    for (const n of names.filter((x) => /^REQ-.*\.md$/.test(x)).sort()) {
      items.push(
        item(
          "A",
          d.retired ? "docs/requirements/retired" : "docs/requirements",
          rootAbs,
          path.join(absDir, n),
          "Requirement lifetime" + (d.retired ? "（廃止済み・世代境界を含む列挙）" : ""),
          "—",
          "—",
          "keep",
        ),
      );
    }
  }
  const decDir = path.join(rootAbs, "docs", "decisions");
  let decNames: string[] = [];
  try {
    decNames = fs.readdirSync(decDir);
  } catch {
    decNames = [];
  }
  for (const n of decNames.filter((x) => /^DEC-.*\.md$/.test(x)).sort()) {
    items.push(
      item("A", "docs/decisions", rootAbs, path.join(decDir, n), "Architecture lifetime", readFrontmatterStatus(path.join(decDir, n)), "—", "keep"),
    );
  }
  const designsRoot = path.join(rootAbs, "docs", "designs");
  for (const abs of listFilesRecursive(designsRoot)) {
    if (!path.basename(abs).endsWith(".md")) continue;
    const st = readFrontmatterStatus(abs);
    items.push(item("A", "docs/designs", rootAbs, abs, "Architecture lifetime", st === "—" ? "accepted 相当" : st, "—", "keep"));
  }
  items.sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0));
  return items;
}

const DECL_DIRS = ["src", "scripts", "docs", ".agentdev"] as const;
const DECL_SKIP = new Set(["node_modules", ".git", "vendor"]);

// B 系統: 対応関係表現（実装成果物と検証手段・証拠の対応。inline 宣言 + sidecar）
export function scanRelationDeclarations(rootAbs: string): InventoryItem[] {
  const items: InventoryItem[] = [];
  const stack: string[] = [];
  for (const d of DECL_DIRS) stack.push(path.join(rootAbs, d));
  while (stack.length > 0) {
    const cur = stack.pop() as string;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (DECL_SKIP.has(e.name)) continue;
      const abs = path.join(cur, e.name);
      if (e.isDirectory()) {
        stack.push(abs);
        continue;
      }
      if (!e.isFile() || !/\.(md|ts)$/.test(e.name)) continue;
      let txt = "";
      try {
        txt = fs.readFileSync(abs, "utf8");
      } catch {
        continue;
      }
      const kinds = new Map<string, Set<string>>();
      for (const line of txt.split(/\r?\n/)) {
        const m = line.match(/ADF-COVERS\(([^)]*)\):\s*(.+)$/);
        if (!m) continue;
        const kind = (m[1] as string).trim();
        const reqs = (m[2] as string).match(/(REQ|DEC)-\d+(?:-\d+)?/g) ?? [];
        if (reqs.length === 0) continue;
        const set = kinds.get(kind) ?? new Set<string>();
        for (const r of reqs) set.add(r);
        kinds.set(kind, set);
      }
      if (kinds.size === 0) continue;
      const kindSummary = [...kinds.keys()].sort().join("+");
      const reqSummary = [...new Set([...kinds.values()].flatMap((s) => [...s]))].sort().join(", ");
      items.push({
        system: "B",
        area: "inline 宣言",
        relPath: toPosix(path.relative(rootAbs, abs)),
        category: "対応関係表現（implementation/design/verification）",
        status: kindSummary,
        processState: "—",
        content: contentLabel(abs),
        references: reqSummary.split(", ").length + " 要件",
        disposition: "keep",
      });
    }
  }
  const traceDir = path.join(rootAbs, "traceability");
  for (const abs of listFilesRecursive(traceDir)) {
    if (!/\.ya?ml$/.test(path.basename(abs))) continue;
    let txt = "";
    try {
      txt = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    const comp = txt.match(/^component:\s*(\S+)/m);
    items.push({
      system: "B",
      area: "sidecar",
      relPath: toPosix(path.relative(rootAbs, abs)),
      category: "対応関係表現（sidecar）",
      status: comp ? comp[1] as string : "—",
      processState: "—",
      content: contentLabel(abs),
      references: (txt.match(/REQ-\d+-\d+/g) ?? []).length + " 行",
      disposition: "keep",
    });
  }
  items.sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0));
  return items;
}

// C 系統: 未処理改善情報（Intake・Learning・Backlog と周辺の改善記録・記録資産）
interface CSpec {
  readonly rel: string; // root 相対（ディレクトリは再帰・ファイルは直接）
  readonly area: string;
  readonly category: string;
  readonly processState: string;
}

const C_TARGETS: ReadonlyArray<CSpec> = [
  { rel: path.join(".agentdev", "intake", "inbox"), area: "intake/inbox", category: "未評価 Observation", processState: "raw item（未処理）" },
  { rel: path.join(".agentdev", "intake", "promoted"), area: "intake/promoted", category: "未評価 Observation", processState: "promoted（backlog-review 待ち）" },
  { rel: path.join(".agentdev", "learning", "inbox.md"), area: "learning/inbox.md", category: "reusable Knowledge", processState: "未整理（learning-promote 待ち）" },
  { rel: path.join(".agentdev", "learning", "deferred.md"), area: "learning/deferred.md", category: "reusable Knowledge", processState: "分類済み living pool（prune 禁止）" },
  { rel: path.join(".agentdev", "learning", "evaluation-report.md"), area: "learning/evaluation-report.md", category: "reusable Knowledge", processState: "境界 artifact（毎回上書き）" },
  { rel: path.join(".agentdev", "learning", "promoted"), area: "learning/promoted", category: "reusable Knowledge", processState: "promoted（backlog-review 待ち）" },
  { rel: path.join(".agentdev", "backlog", "req-units"), area: "backlog/req-units", category: "未評価 Observation", processState: "RU（req-define / case-open 待ち）" },
  { rel: path.join(".agentdev", "inspect", "inbox"), area: "inspect/inbox", category: "未評価 Observation", processState: "未分類（inspect-promote 待ち）" },
  { rel: path.join(".agentdev", "inspect", "promoted"), area: "inspect/promoted", category: "未評価 Observation", processState: "promoted（backlog-review 待ち）" },
  { rel: path.join(".agentdev", "blocked"), area: "blocked", category: "記録資産（過去 blocked 事象の SSoT）", processState: "記録（処理対象ではない）" },
  { rel: path.join(".agentdev", "drafts"), area: "drafts", category: "未評価 Observation", processState: "working draft（正規 lifecycle で空になり得る）" },
  { rel: path.join(".agentdev", "issues"), area: "issues", category: "Change/Case lifetime", processState: "ローカルIssue（永続・ローカル版のみ）" },
];

export function emptyCheckTargets(): ReadonlyArray<{ area: string; rel: string }> {
  return C_TARGETS.map((t) => ({ area: t.area, rel: toPosix(t.rel) }));
}

export function scanUnprocessedInfo(rootAbs: string): InventoryItem[] {
  const items: InventoryItem[] = [];
  for (const t of C_TARGETS) {
    const abs = path.join(rootAbs, t.rel);
    if (!fs.existsSync(abs)) continue;
    if (fs.statSync(abs).isFile()) {
      items.push(item("C", t.area, rootAbs, abs, t.category, "—", t.processState, "keep"));
      continue;
    }
    for (const f of listFilesRecursive(abs)) {
      items.push(item("C", t.area, rootAbs, f, t.category, "—", t.processState, "keep"));
    }
  }
  items.sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0));
  return items;
}

export function collectInventory(rootAbs: string): { canonical: InventoryItem[]; relations: InventoryItem[]; unprocessed: InventoryItem[] } {
  return {
    canonical: scanCanonicalDocs(rootAbs),
    relations: scanRelationDeclarations(rootAbs),
    unprocessed: scanUnprocessedInfo(rootAbs),
  };
}

function renderReport(
  rootAbs: string,
  canonical: InventoryItem[],
  relations: InventoryItem[],
  unprocessed: InventoryItem[],
): string {
  const all = [...canonical, ...relations, ...unprocessed];
  const lines: string[] = [];
  lines.push("# v4→v5 Migration Inventory Report");
  lines.push("");
  lines.push("- target root: " + toPosix(rootAbs));
  lines.push("- 性質: 読み取り専用・決定的スキャン（タイムスタンプ等の非決定要素を含まない）");
  lines.push("- 契約: v4-migration-and-release Design「v4 → v5 移行手順と検証」節（手順 1〜2）・DEC-056");
  lines.push("- 処遇候補語彙: keep / redefine / supersede / retire / defer（v4-v5-crosswalk 語彙を援用）。初期値は雛形値であり、処遇の確定は人手で行う（REQ-109-006）");
  lines.push("- v5 採用可否が未確定の項目は defer とする。defer は対応先の決定を留保した記録であり、欠落・廃止として扱わない");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  const count = (sys: string, arr: InventoryItem[]) => arr.filter((x) => x.system === sys).length;
  lines.push("- A 有効な正規情報: " + count("A", all) + " 件");
  lines.push("- B 対応関係表現: " + count("B", all) + " 件");
  lines.push("- C 未処理改善情報: " + count("C", all) + " 件");
  lines.push("- 合計: " + all.length + " 件");
  if (all.length === 0) lines.push("- （列挙対象が検出されなかった。処遇確定不要の空レポート）");
  lines.push("");
  lines.push("## semantic inventory");
  lines.push("");
  lines.push("| 系統 | 領域 | パス | 分類 | 状態 | 処理状態 | 内容（sha256-12/bytes） | 参照関係 | 処遇候補（初期値） |");
  lines.push("|---|---|---|---|---|---|---|---|---|");
  for (const it of all) {
    lines.push("| " + it.system + " | " + it.area + " | " + it.relPath + " | " + it.category + " | " + it.status + " | " + it.processState + " | " + it.content + " | " + it.references + " | " + it.disposition + " |");
  }
  lines.push("");
  lines.push("## 空確認");
  lines.push("");
  lines.push("| 配置 | 状態 |");
  lines.push("|---|---|");
  for (const t of emptyCheckTargets()) {
    const abs = path.join(rootAbs, t.rel);
    let present = false;
    let empty = true;
    try {
      if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
        present = true;
        empty = listFilesRecursive(abs).length === 0;
      } else if (fs.existsSync(abs)) {
        present = true;
        empty = false;
      }
    } catch {
      present = false;
    }
    const label = !present ? "空（未生成）" : empty ? "空（正規消費済み相当または未処理なし。git 履歴で消費経路を裏付け）" : "実体あり";
    lines.push("| " + t.area + " | " + label + " |");
  }
  lines.push("");
  lines.push("## migration mapping（全項目雛形・要人手確定）");
  lines.push("");
  lines.push("- 初期値は「同一移行・keep」。処遇を変更する行のみ人手で書き換える（redefine / supersede / retire / defer）。対応先パスを変更する行は移行先パス列を書き換える");
  lines.push("- 空確認が「実体あり」でない配置は移行対象項目を持たないため、雛形に含めない");
  lines.push("");
  lines.push("| 移行元パス | 移行先パス（staging 相対） | 処遇 | 処理状態 | 対応根拠 |");
  lines.push("|---|---|---|---|---|");
  // 同一パスが複数系統（A 正規情報と B 対応関係表現等）で列挙される場合、対応表では 1 項目 1 行に統合する（手順 2 の記録単位）
  const seen = new Set<string>();
  for (const it of all) {
    if (seen.has(it.relPath)) continue;
    seen.add(it.relPath);
    lines.push("| " + it.relPath + " | " + it.relPath + " | " + it.disposition + " | " + it.processState + " | 同一移行（内容・処理状態・参照関係の保全） |");
  }
  lines.push("");
  return lines.join("\n") + "\n";
}

function main(): void {
  const argv = process.argv.slice(2);
  let root = process.cwd();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--root" && i + 1 < argv.length) {
      root = path.resolve(argv[i + 1] as string);
      i++;
    }
  }
  const inv = collectInventory(root);
  process.stdout.write(renderReport(root, inv.canonical, inv.relations, inv.unprocessed));
}

if (import.meta.main) {
  main();
}
