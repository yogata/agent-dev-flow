// v4 -> v5 移行 非破壊 staging 構築ツール（OU-0007 / Issue #3592 / REQ-109）
// ADF-COVERS(implementation): REQ-109-002, REQ-109-004, REQ-109-006, REQ-109-007
//
// 契約: docs/designs/foundations/v4-migration-and-release.md「v4 → v5 移行手順と検証」節
// （手順 2: 対応付け・手順 3: 非破壊構築と非破壊検証）・docs/decisions/DEC-056.md。
//
// - 対応表（mapping markdown。inventory.ts が生成する「migration mapping」表を人手確定した
//   もの）に基づき、移行元を参照・破壊しない分離領域（staging）へ移行先を構築する
// - 移行元への書き込みは行わない。staging が移行元 root の内部にある構成は拒否する
//   （非破壊原則・REQ-109-004）
// - 処遇語彙: keep / redefine / supersede は staging へ copy する（構築段では元の意味を
//   保全する。切替後の v5 運用での再定義は切替後の作業）。retire / defer は copy しない
//   （対応表への記録が処遇であり、留保を欠落・廃止として扱わない）
// - 対応先パスが空の keep / redefine / supersede 行は実行エラーで停止する（fail-closed。
//   対応先決定未了の項目は defer に変更して記録を残す）
// - 冪等であり、再実行で同一結果となる（上書き copy）
// - 出力は構築結果サマリを stdout へ出力する。staging 以外へのファイル書き込みは行わない
//
// CLI:
//   bun scripts/consumer/v5-migration/build-staging.ts --root <path> --mapping <path> --staging <path>
//   終了コード: 0 = 構築成功、1 = 実行エラー（mapping 不在・語彙外・虚参照・staging 構成違反）

import * as fs from "fs";
import * as path from "path";

export interface MappingRow {
  readonly srcRel: string; // 移行元パス（root 相対 POSIX）
  readonly dstRel: string; // 移行先パス（staging 相対 POSIX。空文字許容）
  readonly disposition: string; // keep / redefine / supersede / retire / defer
  readonly processState: string; // 処理状態
  readonly reason: string; // 対応根拠
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function fail(msg: string): never {
  process.stderr.write("build-staging: " + msg + "\n");
  process.exit(1);
}

// 対応表（migration mapping 表）の機械解析。verify-migration と共用する
export function parseMapping(mappingAbs: string): MappingRow[] {
  let txt = "";
  try {
    txt = fs.readFileSync(mappingAbs, "utf8");
  } catch {
    fail("mapping ファイルを読み込めません: " + toPosix(mappingAbs));
  }
  const lines = txt.split(/\r?\n/);
  const rows: MappingRow[] = [];
  let inTable = false;
  for (const line of lines) {
    if (/^#{1,6}\s.*migration mapping/.test(line)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (/^#{1,6}\s/.test(line) && !line.includes("migration mapping")) break;
    const t = line.trim();
    if (!t.startsWith("|")) {
      if (rows.length > 0) break;
      continue;
    }
    const cells = t.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) continue;
    if ((cells[0] as string) === "移行元パス") continue;
    if (/^:?-{3,}:?$/.test(cells[0] as string)) continue;
    rows.push({
      srcRel: (cells[0] as string).replace(/\\/g, "/"),
      dstRel: (cells[1] as string).replace(/\\/g, "/"),
      disposition: cells[2] as string,
      processState: cells[3] as string,
      reason: (cells.slice(4).join(" | ")),
    });
  }
  return rows;
}

export function parseArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] as string;
    if (a === "--root" || a === "--mapping" || a === "--staging" || a === "--baseline") {
      const v = argv[i + 1] as string;
      if (!v) fail("オプション " + a + " には値が必要です");
      args.set(a, v);
      i++;
    }
  }
  return args;
}

const COPY_DISPOSITIONS = new Set(["keep", "redefine", "supersede"]);
const KEEP_ONLY_DISPOSITIONS = new Set(["retire", "defer"]);

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const root = path.resolve(args.get("--root") ?? process.cwd());
  const mappingArg = args.get("--mapping");
  const staging = path.resolve(args.get("--staging") ?? "");
  if (!mappingArg) fail("--mapping は必須です");
  if (!args.get("--staging")) fail("--staging は必須です（移行元を破壊しない分離領域を指定）");
  const mappingAbs = path.resolve(mappingArg as string);
  if (staging === root || staging.startsWith(root + path.sep)) {
    fail("staging が移行元 root の内部にあります（非破壊原則に反するため停止します）: " + toPosix(staging));
  }
  const rows = parseMapping(mappingAbs);
  if (rows.length === 0) fail("migration mapping 表が 1 行も検出できませんでした: " + toPosix(mappingAbs));

  let copied = 0;
  let reserved = 0;
  const built: string[] = [];
  for (const row of rows) {
    if (COPY_DISPOSITIONS.has(row.disposition)) {
      if (row.dstRel === "") {
        fail("対応先パスが空の " + row.disposition + " 行があります（対応先決定未了の項目は defer へ変更して記録を残すこと）: " + row.srcRel);
      }
      const srcAbs = path.join(root, ...row.srcRel.split("/"));
      const dstAbs = path.join(staging, ...row.dstRel.split("/"));
      let st: fs.Stats;
      try {
        st = fs.statSync(srcAbs);
      } catch {
        fail("対応表の移行元パスが移行元に不在です（虚参照。対象と理由を対応表で修正すること）: " + row.srcRel);
      }
      if (!st.isFile()) {
        fail("対応表の移行元パスがファイルではありません（項目はファイル単位で記録すること）: " + row.srcRel);
      }
      fs.mkdirSync(path.dirname(dstAbs), { recursive: true });
      fs.copyFileSync(srcAbs, dstAbs);
      built.push(toPosix(row.dstRel));
      copied++;
    } else if (KEEP_ONLY_DISPOSITIONS.has(row.disposition)) {
      reserved++;
    } else {
      fail("処遇語彙外の値です（keep / redefine / supersede / retire / defer のみ有効）: " + row.disposition + "（" + row.srcRel + "）");
    }
  }
  built.sort();

  const lines: string[] = [];
  lines.push("# v4→v5 Migration Staging Build Result");
  lines.push("");
  lines.push("- root: " + toPosix(root));
  lines.push("- staging: " + toPosix(staging));
  lines.push("- mapping: " + toPosix(mappingAbs));
  lines.push("- 性質: 移行元への書き込みなし・冪等 copy（再実行で同一結果）");
  lines.push("- copy: " + copied + " 件 / 留保（retire・defer・copy しない）: " + reserved + " 件");
  lines.push("");
  lines.push("## 構築済み staging 項目");
  lines.push("");
  for (const b of built) lines.push("- " + b);
  if (built.length === 0) lines.push("- （なし）");
  lines.push("");
  process.stdout.write(lines.join("\n"));
}

if (import.meta.main) {
  main();
}
