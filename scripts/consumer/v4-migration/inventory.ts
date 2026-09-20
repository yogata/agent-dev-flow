// v4-migration inventory 生成ツール（OU-002・第12段 migration implementation）
// ADF-COVERS(implementation): REQ-009-004
//
// 契約: docs/designs/foundations/v4-migration-and-release.md「移行ツール群」節・
// 「semantic inventory と mapping」節（第12段 Definition PR #3034 merge 6ccf5248）。
//
// - v3 適用 Project の .agentdev/ 状態領域（6 領域: intake/learning/backlog/
//   drafts/inspect*/issues）と docs 正規文書状態（REQ/Decision/Design と
//   crosswalk 上の処遇未実行行）から semantic inventory と mapping 雛形を
//   生成する、読み取り専用の決定的スクリプトである
// - 出力は markdown 形式の inventory レポート（semantic inventory 表 +
//   mapping 雛形表）を stdout へ出力する。ファイル書き込みを行わない
//   （副作用ゼロ・DEC-016 導入系スクリプト副作用ゼロ原則の適用）
// - 存在しないパス・空 .agentdev に対してはエラー終了せず、正常終了で
//   空レポートを出力する（fail-open ではなく空振り正常終了）
// - 分類は 8 寿命分類（v4-operating-model「情報寿命モデル」）。v4 canonical
//   配置は 5 分類配置表（v4-durable-state-and-recovery「5 分類と配置表」）の
//   権威の置き場所による。処遇候補・処理区分は mapping 雛形の初期値であり、
//   処遇の確定は人間の判断で行う
//
// CLI:
//   bun scripts/consumer/v4-migration/inventory.ts [--root <path>]
//     --root  対象 Project ルート（デフォルト: 実行時 cwd）
//   終了コード: 常に 0（読み取り専用・検証失敗という終了状態を持たない）

import * as fs from "fs";
import * as path from "path";

interface InventoryItem {
  readonly area: string;
  readonly relPath: string;
  readonly lifetime: string;
  readonly status: string;
  readonly disposition: string;
}

const AGENTDEV_LIFETIME: Readonly<Record<string, string>> = {
  intake: "未評価 Observation",
  learning: "reusable Knowledge",
  backlog: "未評価 Observation",
  drafts: "未評価 Observation",
  issues: "Change/Case lifetime",
};

const INSPECT_LIFETIME = "未評価 Observation";

const AGENTDEV_PLACEMENT: Readonly<Record<string, string>> = {
  intake: "repo 内正規状態（.agentdev/ Git 管理ドメイン状態）",
  learning: "repo 内正規状態（.agentdev/ Git 管理ドメイン状態）",
  backlog: "repo 内正規状態（.agentdev/ Git 管理ドメイン状態）",
  drafts: "repo 内正規状態（.agentdev/ Git 管理ドメイン状態）",
  issues: "GitHub 正規状態（Issue/PR の権威記録先）",
};

const AGENTDEV_DISPOSITION: Readonly<Record<string, string>> = {
  intake: "保持",
  learning: "保持",
  backlog: "保持",
  drafts: "保持",
  issues: "変換",
};

const FIXED_AGENTDEV_AREAS = ["backlog", "drafts", "intake", "issues", "learning"] as const;

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

function scanAgentdev(rootAbs: string): InventoryItem[] {
  const items: InventoryItem[] = [];
  const adRoot = path.join(rootAbs, ".agentdev");
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(adRoot, { withFileTypes: true });
  } catch {
    return items;
  }
  const dirNames = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  const fixed = new Set<string>(FIXED_AGENTDEV_AREAS as unknown as string[]);
  const collected: Array<{ dir: string; area: string; lifetime: string; disposition: string }> = [];
  for (const d of dirNames) {
    if (fixed.has(d)) {
      collected.push({
        dir: d,
        area: d,
        lifetime: AGENTDEV_LIFETIME[d] as string,
        disposition: AGENTDEV_DISPOSITION[d] as string,
      });
    } else if (d.startsWith("inspect")) {
      collected.push({ dir: d, area: "inspect*", lifetime: INSPECT_LIFETIME, disposition: "保持" });
    }
  }
  for (const a of collected) {
    const absDir = path.join(adRoot, a.dir);
    for (const abs of listFilesRecursive(absDir)) {
      items.push({
        area: a.area,
        relPath: toPosix(path.relative(rootAbs, abs)),
        lifetime: a.lifetime,
        status: "—",
        disposition: a.disposition,
      });
    }
  }
  return items;
}

function scanDocs(rootAbs: string): InventoryItem[] {
  const items: InventoryItem[] = [];
  const targets: ReadonlyArray<{ rel: string; area: string; lifetime: string; pattern: RegExp }> = [
    { rel: path.join("docs", "requirements"), area: "docs/requirements", lifetime: "Requirement lifetime", pattern: /^REQ-.*\.md$/ },
    { rel: path.join("docs", "decisions"), area: "docs/decisions", lifetime: "Architecture lifetime", pattern: /^DEC-.*\.md$/ },
  ];
  for (const t of targets) {
    const absDir = path.join(rootAbs, t.rel);
    let names: string[] = [];
    try {
      names = fs.readdirSync(absDir);
    } catch {
      continue;
    }
    for (const n of names.filter((n2) => t.pattern.test(n2)).sort()) {
      const abs = path.join(absDir, n);
      items.push({
        area: t.area,
        relPath: toPosix(path.join(t.rel, n)),
        lifetime: t.lifetime,
        status: readFrontmatterStatus(abs),
        disposition: "保持",
      });
    }
  }
  // docs/designs/**\/*.md（references 配下含む・決定的な深さ優先）
  const designsRoot = path.join(rootAbs, "docs", "designs");
  for (const abs of listFilesRecursive(designsRoot)) {
    const base = path.basename(abs);
    if (!base.endsWith(".md")) continue;
    items.push({
      area: "docs/designs",
      relPath: toPosix(path.relative(rootAbs, abs)),
      lifetime: "Architecture lifetime",
      status: readFrontmatterStatus(abs),
      disposition: "保持",
    });
  }
  items.sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0));
  return items;
}

function scanCrosswalkPlanned(rootAbs: string): InventoryItem[] {
  const items: InventoryItem[] = [];
  const designsRoot = path.join(rootAbs, "docs", "designs");
  for (const abs of listFilesRecursive(designsRoot)) {
    if (path.basename(abs) !== "crosswalk-inventory.md") continue;
    const relCrosswalk = toPosix(path.relative(rootAbs, abs));
    let txt = "";
    try {
      txt = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    for (const line of txt.split(/\r?\n/)) {
      const t = line.trim();
      if (!t.startsWith("|")) continue;
      const cells = t.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.length >= 5 && cells[4] === "planned") {
        const rowId = (cells[0] as string).trim();
        if (rowId === "" || rowId.startsWith("---")) continue;
        items.push({
          area: "crosswalk",
          relPath: relCrosswalk + " :: " + rowId,
          lifetime: "未評価 Observation",
          status: "planned",
          disposition: "変換",
        });
      }
    }
  }
  items.sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0));
  return items;
}

function renderReport(rootAbs: string, agentdevItems: InventoryItem[], docsItems: InventoryItem[], crosswalkItems: InventoryItem[]): string {
  const all = [...agentdevItems, ...docsItems, ...crosswalkItems];
  const lines: string[] = [];
  lines.push("# v4 Migration Inventory Report");
  lines.push("");
  lines.push("- target root: " + toPosix(rootAbs));
  lines.push("- 性質: 読み取り専用・決定的スキャン（タイムスタンプ等の非決定要素を含まない）");
  lines.push("- 属性の正: 分類 = 8 寿命分類（v4-operating-model「情報寿命モデル」）・v4 canonical 配置 = 5 分類配置表（v4-durable-state-and-recovery）。処遇候補・処理区分は雛形の初期値であり人間が確定する");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  const byArea = new Map<string, number>();
  for (const it of all) byArea.set(it.area, (byArea.get(it.area) ?? 0) + 1);
  const areaOrder = [...byArea.keys()].sort();
  if (areaOrder.length === 0) {
    lines.push("- 合計: 0 件（列挙対象が検出されなかった。処遇確定不要の空レポート）");
  } else {
    for (const a of areaOrder) lines.push("- " + a + ": " + (byArea.get(a) as number) + " 件");
    lines.push("- 合計: " + all.length + " 件");
  }
  lines.push("");
  lines.push("## semantic inventory");
  lines.push("");
  lines.push("| 領域 | パス | 分類（8 寿命分類） | 状態 | 処遇候補 |");
  lines.push("|---|---|---|---|---|");
  for (const it of all) {
    lines.push("| " + it.area + " | " + it.relPath + " | " + it.lifetime + " | " + it.status + " | " + it.disposition + " |");
  }
  lines.push("");
  lines.push("## mapping 雛形");
  lines.push("");
  lines.push("| v3 状態 | v4 canonical 配置（5 分類） | 処理区分（初期値） |");
  lines.push("|---|---|---|");
  const mappingRows: ReadonlyArray<[string, string, string]> = [
    [".agentdev/intake/", "repo 内正規状態（.agentdev/ Git 管理ドメイン状態）", "保持"],
    [".agentdev/learning/", "repo 内正規状態（.agentdev/ Git 管理ドメイン状態）", "保持"],
    [".agentdev/backlog/", "repo 内正規状態（.agentdev/ Git 管理ドメイン状態）", "保持"],
    [".agentdev/drafts/", "repo 内正規状態（.agentdev/ Git 管理ドメイン状態）", "保持"],
    [".agentdev/inspect*/", "repo 内正規状態（.agentdev/ Git 管理ドメイン状態）", "保持"],
    [".agentdev/issues/", "GitHub 正規状態（Issue/PR の権威記録先）", "変換"],
    ["docs/requirements/REQ-*.md", "repo 内正規状態（Requirement lifetime・docs/requirements/）", "保持"],
    ["docs/decisions/DEC-*.md", "repo 内正規状態（Architecture lifetime・docs/decisions/）", "保持"],
    ["docs/designs/**/*.md", "repo 内正規状態（Architecture lifetime・docs/designs/）", "保持"],
    ["crosswalk-inventory.md planned 行", "repo 内正規状態（docs/…/references/crosswalk-inventory.md）", "変換"],
  ];
  for (const [v3, v4, d] of mappingRows) {
    const present =
      (v3.startsWith(".agentdev/") && agentdevItems.some((it) => it.relPath.startsWith(v3.slice(0, -1)))) ||
      (v3 === ".agentdev/inspect*/" && agentdevItems.some((it) => it.area === "inspect*")) ||
      (v3.startsWith("docs/requirements/") && docsItems.some((it) => it.area === "docs/requirements")) ||
      (v3.startsWith("docs/decisions/") && docsItems.some((it) => it.area === "docs/decisions")) ||
      (v3.startsWith("docs/designs/") && docsItems.some((it) => it.area === "docs/designs")) ||
      (v3.startsWith("crosswalk") && crosswalkItems.length > 0);
    lines.push("| " + v3 + " | " + v4 + " | " + d + (present ? "" : " （未検出）") + " |");
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
  const agentdevItems = scanAgentdev(root);
  const docsItems = scanDocs(root);
  const crosswalkItems = scanCrosswalkPlanned(root);
  process.stdout.write(renderReport(root, agentdevItems, docsItems, crosswalkItems));
}

main();