// v4 -> v5 移行 非破壊検証ツール（OU-0007 / Issue #3592 / REQ-109）
// ADF-COVERS(implementation): REQ-109-001, REQ-109-002, REQ-109-003, REQ-109-004, REQ-109-005, REQ-109-007, REQ-109-008
//
// 契約: docs/designs/foundations/v4-migration-and-release.md「v4 → v5 移行手順と検証」節
// （手順 3: 非破壊構築と非破壊検証・手順 4: 切替と移行結果の確定）・docs/decisions/DEC-056.md。
//
// - 移行元（root）の意味インベントリ、対応表（mapping）、構築済み staging の三者を突合し、
//   欠落・不整合・検証不能を検出する読み取り専用の決定的スクリプトである
// - 検出種別:
//   欠落（missing）: インベントリ項目が対応表に未記録 / keep・redefine・supersede 行の
//   staging 側実体不在
//   不整合（inconsistent）: staging 側内容ハッシュ不一致 / 未処理改善情報の処理状態不一致
//   検証不能（unverifiable）: 処遇語彙外 / 対応表の移行元パス虚参照 / 内容読み出し失敗
// - 合否条件は意味保存（内容・処理状態・対応関係の保全）のみであり、旧コマンド名・旧配置
//   パスの一致は合否条件に含まない（REQ-109-001。対応先パスが移行元と異なっても、対応表の
//   対応関係で紐付いた保全は合格とする）
// - 欠落・不整合・検証不能が 1 件でもある場合は「移行成功として確定できない」と判定し、
//   対象と理由を検出明細として特定する（REQ-109-005・REQ-109-008。破棄済み・処理済みとして
//   黙認しない）
// - --baseline <git-ref> 指定時は baseline tag 参照から移行前内容を取得して対照する
//   （DEC-056: baseline tag を一意比較点として使用。対照参考であり合否には非計上。
//   移行元が baseline 以降へ進行している場合は移行元現行が正である）
// - 出力は markdown レポート（--json で JSON）を stdout へ出力する。ファイル書き込みを行わない
//
// CLI:
//   bun scripts/consumer/v5-migration/verify-migration.ts --root <path> --mapping <path> --staging <path> [--baseline <git-ref>] [--json]
//   終了コード: 0 = 検査 pass（成功確定可能）、2 = 検査 fail（欠落・不整合・検証不能あり）、
//               1 = 実行エラー（mapping 不在等）

import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
import { spawnSync } from "child_process";
import { collectInventory, type InventoryItem } from "./inventory.ts";
import { parseMapping, parseArgs } from "./build-staging.ts";

const COPY_DISPOSITIONS = new Set(["keep", "redefine", "supersede"]);
const RESERVE_DISPOSITIONS = new Set(["retire", "defer"]);
const DISPOSITIONS = new Set([...COPY_DISPOSITIONS, ...RESERVE_DISPOSITIONS]);

interface Finding {
  readonly kind: string; // missing / inconsistent / unverifiable
  readonly detector: string;
  readonly target: string;
  readonly reason: string;
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function sha256_12(abs: string): string | null {
  try {
    return createHash("sha256").update(fs.readFileSync(abs)).digest("hex").slice(0, 12);
  } catch {
    return null;
  }
}

function baselineHash(root: string, baseline: string, relPath: string): string | null {
  const r = spawnSync("git", ["-C", root, "show", baseline + ":" + relPath], { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) return null;
  return createHash("sha256").update(r.stdout).digest("hex").slice(0, 12);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const root = path.resolve(args.get("--root") ?? process.cwd());
  const mappingArg = args.get("--mapping");
  const stagingArg = args.get("--staging");
  if (!mappingArg) {
    process.stderr.write("verify-migration: --mapping は必須です\n");
    process.exit(1);
  }
  if (!stagingArg) {
    process.stderr.write("verify-migration: --staging は必須です\n");
    process.exit(1);
  }
  const baseline = args.get("--baseline") ?? "";
  const jsonOut = process.argv.slice(2).includes("--json");
  const mappingAbs = path.resolve(mappingArg as string);
  const staging = path.resolve(stagingArg as string);

  const inv = collectInventory(root);
  const allItems: InventoryItem[] = [...inv.canonical, ...inv.relations, ...inv.unprocessed];
  const byRel = new Map<string, InventoryItem>();
  for (const it of allItems) byRel.set(it.relPath, it);

  const rows = parseMapping(mappingAbs); // 読み込み失敗時は内部で exit 1

  const findings: Finding[] = [];
  const mappedSrc = new Set<string>();
  let compared = 0;
  let reserved = 0;
  let baselineAcquired = 0;
  let baselineConsistent = 0;
  let baselineDiff = 0;
  let baselineUnreadable = 0;

  for (const row of rows) {
    if (mappedSrc.has(row.srcRel)) {
      findings.push({ kind: "unverifiable", detector: "duplicate-mapping-row", target: row.srcRel, reason: "同一移行元パスの対応表行が重複しています" });
      continue;
    }
    mappedSrc.add(row.srcRel);
    const item = byRel.get(row.srcRel);
    if (!item) {
      findings.push({ kind: "unverifiable", detector: "mapping-src-not-in-inventory", target: row.srcRel, reason: "対応表の移行元パスが移行元インベントリに不在です（虚参照）" });
      continue;
    }
    if (!DISPOSITIONS.has(row.disposition)) {
      findings.push({ kind: "unverifiable", detector: "unknown-disposition", target: row.srcRel, reason: "処遇語彙外の値です（keep / redefine / supersede / retire / defer のみ有効）: " + row.disposition });
      continue;
    }
    if (RESERVE_DISPOSITIONS.has(row.disposition)) {
      reserved++;
      continue;
    }
    if (row.dstRel === "") {
      findings.push({ kind: "unverifiable", detector: "empty-destination", target: row.srcRel, reason: "copy 処遇（" + row.disposition + "）の対応先パスが空です" });
      continue;
    }
    const srcAbs = path.join(root, ...row.srcRel.split("/"));
    const dstAbs = path.join(staging, ...row.dstRel.split("/"));
    const srcHash = sha256_12(srcAbs);
    const dstHash = sha256_12(dstAbs);
    if (srcHash === null) {
      findings.push({ kind: "unverifiable", detector: "unreadable-source", target: row.srcRel, reason: "移行元の内容を読み出せません" });
      continue;
    }
    if (dstHash === null) {
      findings.push({ kind: "missing", detector: "staging-missing", target: row.dstRel, reason: "対応表の " + row.disposition + " 行に対する staging 側実体がありません（欠落）" });
      continue;
    }
    compared++;
    if (srcHash !== dstHash) {
      findings.push({ kind: "inconsistent", detector: "content-hash-mismatch", target: row.dstRel, reason: "staging 側内容ハッシュが移行元と不一致です（" + srcHash + " ≠ " + dstHash + "）" });
      continue;
    }
    if (item.system === "C" && item.processState !== row.processState) {
      findings.push({ kind: "inconsistent", detector: "process-state-mismatch", target: row.srcRel, reason: "未処理改善情報の処理状態が移行元の値と不一致です（移行元: " + item.processState + " / 対応表: " + row.processState + "）" });
      continue;
    }
    if (baseline) {
      const bHash = baselineHash(root, baseline, row.srcRel);
      if (bHash === null) {
        baselineUnreadable++;
      } else {
        baselineAcquired++;
        if (bHash === srcHash) baselineConsistent++;
        else baselineDiff++;
      }
    }
  }

  for (const it of allItems) {
    if (!mappedSrc.has(it.relPath)) {
      findings.push({ kind: "missing", detector: "inventory-item-unmapped", target: it.relPath, reason: "移行元インベントリ項目が対応表に記録されていません（未対応記録）" });
    }
  }

  findings.sort((a, b) => (a.target + a.detector < b.target + b.detector ? -1 : 1));

  const nMissing = findings.filter((f) => f.kind === "missing").length;
  const nInconsistent = findings.filter((f) => f.kind === "inconsistent").length;
  const nUnverifiable = findings.filter((f) => f.kind === "unverifiable").length;
  const ok = findings.length === 0;

  if (jsonOut) {
    const payload = {
      ok,
      summary: {
        missing: nMissing,
        inconsistent: nInconsistent,
        unverifiable: nUnverifiable,
        mappedRows: rows.length,
        compared,
        reserved,
        inventoryItems: allItems.length,
        baseline: baseline === "" ? null : { ref: baseline, acquired: baselineAcquired, consistent: baselineConsistent, differing: baselineDiff, unreadable: baselineUnreadable },
      },
      findings,
    };
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
    process.exit(ok ? 0 : 2);
  }

  const lines: string[] = [];
  lines.push("# v4→v5 Migration Verification Result");
  lines.push("");
  lines.push("- root: " + toPosix(root));
  lines.push("- staging: " + toPosix(staging));
  lines.push("- mapping: " + toPosix(mappingAbs));
  lines.push("- baseline: " + (baseline === "" ? "（未指定）" : baseline + "（対照参考。合否には非計上）"));
  lines.push("- 性質: 読み取り専用・決定的突合。合否条件は意味保存（内容・処理状態・対応関係の保全）のみ。旧コマンド名・旧配置パスの一致は合否条件に含まない（REQ-109-001）");
  lines.push("");
  lines.push("## 判定");
  lines.push("");
  lines.push("- 欠落: " + nMissing + " 件 / 不整合: " + nInconsistent + " 件 / 検証不能: " + nUnverifiable + " 件");
  if (ok) {
    lines.push("- 判定: 移行成功として確定可能（REQ-109-005・手順 4 前提条件を満たす。切替操作自体は本検証の対象外）");
  } else {
    lines.push("- 判定: 移行成功として確定できない（REQ-109-005）。対象と理由を検出明細から特定し、破棄済み・処理済みとして黙認しない（REQ-109-008）");
  }
  lines.push("");
  lines.push("## 突合統計");
  lines.push("");
  lines.push("- インベントリ項目: " + allItems.length + " 件 / 対応表行: " + rows.length + " 件（copy 照合 " + compared + " 件・留保 " + reserved + " 件）");
  if (baseline !== "") {
    lines.push("- baseline 対照（" + baseline + "）: 取得成功 " + baselineAcquired + " 件（うち移行元現行と一致 " + baselineConsistent + " 件・baseline 以降の進行差分 " + baselineDiff + " 件）・取得不能 " + baselineUnreadable + " 件（移行元現行が正）");
  }
  lines.push("");
  lines.push("## 検出明細");
  lines.push("");
  if (findings.length === 0) {
    lines.push("- （検出 0 件）");
  } else {
    lines.push("| 種別 | 対象 | 理由 |");
    lines.push("|---|---|---|");
    for (const f of findings) {
      lines.push("| " + f.kind + " | " + f.target + " | " + f.detector + ": " + f.reason + " |");
    }
  }
  lines.push("");
  process.stdout.write(lines.join("\n"));
  process.exit(ok ? 0 : 2);
}

if (import.meta.main) {
  main();
}
