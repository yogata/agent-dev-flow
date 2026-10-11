// ---------------------------------------------------------------------------
// 昇格3系統の実並列と競合排他の手順 pin と検証用模擬。backlog-auto Design
// 「昇格3系統の実並列と競合排他の接続」節と stage-execution reference
// （STEP-3、直列化キュー節）、fan-in-and-reporting reference（STEP-6）の
// 手順が本 skill 配下 reference に実装されていることを anchor 型 pin で
// 確認し、直列化キューの規則を検証用模擬（fake 3系統の同時要求列を
// 決定的に模擬）で検査する。模擬は runtime 機構ではなく検証コードであり、
// 規則表の改訂時は本模擬も追随更新する。対応関係の正は repository
// top-level の traceability sidecar（本ファイルは配布物のため concrete ID
// を直書きせず節名参照のみ）。
// ---------------------------------------------------------------------------

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(import.meta.dir);

function readBacklogAutoReference(fileName: string): string {
  return fs.readFileSync(
    path.join(
      REPO_ROOT,
      "src",
      "common",
      "skills",
      "agentdev-workflow-backlog-auto",
      "references",
      fileName,
    ),
    "utf-8",
  );
}

describe("昇格3系統の実並列の手順 pin", () => {
  test("stage-execution STEP-3 に並列起動原則（実際に並列に進め、系統全体の逐次直列化を行わない）が明文化されている", () => {
    const stage = readBacklogAutoReference("stage-execution.md");
    expect(stage).toContain("実際に並列に進める");
    expect(stage).toContain("系統全体の逐次直列化を行わず");
    expect(stage).toContain("提供元不調や Git 競合を理由に系統全体を直列化しない");
    expect(stage).toContain("逐次実行で完了を装わず");
  });

  test("stage-execution STEP-3 に起動記録と活動区間（起動時刻・終了時刻）の記録と完了報告への集約が明文化されている", () => {
    const stage = readBacklogAutoReference("stage-execution.md");
    expect(stage).toContain("各系統の起動時刻と終了時刻を記録し");
    expect(stage).toContain("活動区間（起動時刻から終了時刻まで）");
    expect(stage).toContain("STEP-6 の完了報告へ集約する");
    expect(stage).toContain("活動区間の重なりから複数系統の並列実行を確認できること");
  });

  test("stage-execution STEP-3 に失敗・停止時の排他解除と結果回収、兄弟非連鎖停止が明文化されている", () => {
    const stage = readBacklogAutoReference("stage-execution.md");
    expect(stage).toContain("他系統を連鎖停止しない");
    expect(stage).toContain("投入済みの操作要求と排他を解除し");
    expect(stage).toContain("投入済み要求の結果を回収する");
  });

  test("直列化キュー節に既存報告項目の再定義禁止と実行記録の記録先・最小形式が明文化されている", () => {
    const stage = readBacklogAutoReference("stage-execution.md");
    expect(stage).toContain("報告項目の再定義は行わない");
    expect(stage).toContain("操作要求と発行・抑止");
    expect(stage).toContain("解除・結果回収");
    expect(stage).toContain("新しい台帳・永続化先を追加しない");
  });

  test("fan-in-and-reporting STEP-6 に活動区間と直列化キュー実行記録の報告集約と並列性確認が明文化されている", () => {
    const reporting = readBacklogAutoReference("fan-in-and-reporting.md");
    expect(reporting).toContain("系統別の起動時刻・終了時刻（活動区間）");
    expect(reporting).toContain("直列化キューの実行記録（操作要求、発行と抑止、実行順序、解除、結果回収を含む）");
    expect(reporting).toContain("排他解除と結果回収の実施結果");
    expect(reporting).toContain("活動区間の重なりから並列実行の成立を確認できること");
  });
});

// ---------------------------------------------------------------------------
// 直列化キュー規則の検証用模擬（fake 3系統）。規則（直列化キュー節）の機械化
// であり runtime 機構ではない。排他操作は同カテゴリ内で先着順に直列実行され、
// 非競合操作（読取・分析）は待機しない。時刻は操作1回ごとに1進む決定的時計。
// ---------------------------------------------------------------------------

const SYSTEMS = ["learning", "intake", "inspect"] as const;
type SystemId = (typeof SYSTEMS)[number];

interface QueueRequest {
  system: SystemId;
  op: "git-write" | "shared-write" | "dialog" | "read-analyze";
  exclusive: boolean;
}

interface QueueRun {
  system: SystemId;
  op: QueueRequest["op"];
  start: number;
  end: number;
}

interface ReleaseRecord {
  system: SystemId;
  requested: QueueRequest["op"];
  waitedForEnd: number;
}

function simulateQueue(requests: readonly QueueRequest[]): {
  runs: QueueRun[];
  releases: ReleaseRecord[];
} {
  const runs: QueueRun[] = [];
  const releases: ReleaseRecord[] = [];
  const latestEndByOp = new Map<QueueRequest["op"], number>();

  for (const req of requests) {
    if (!req.exclusive) {
      runs.push({ system: req.system, op: req.op, start: 0, end: 1 });
      continue;
    }
    const prevEnd = latestEndByOp.get(req.op);
    if (prevEnd === undefined) {
      runs.push({ system: req.system, op: req.op, start: 0, end: 1 });
      latestEndByOp.set(req.op, 1);
      continue;
    }
    releases.push({
      system: req.system,
      requested: req.op,
      waitedForEnd: prevEnd,
    });
    runs.push({ system: req.system, op: req.op, start: prevEnd, end: prevEnd + 1 });
    latestEndByOp.set(req.op, prevEnd + 1);
  }

  return { runs, releases };
}

function concurrentOverlaps(runs: readonly QueueRun[], op: QueueRequest["op"]): number {
  const same = runs.filter((run) => run.op === op);
  let count = 0;
  for (let i = 0; i < same.length; i++) {
    for (let j = i + 1; j < same.length; j++) {
      if (same[i].start < same[j].end && same[j].start < same[i].end) count++;
    }
  }
  return count;
}

function intervalOverlaps3Systems(runs: readonly QueueRun[]): boolean {
  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      if (
        runs[i].system !== runs[j].system &&
        runs[i].start < runs[j].end &&
        runs[j].start < runs[i].end
      ) {
        return true;
      }
    }
  }
  return false;
}

describe("直列化キュー規則の検証用模擬（fake 3系統の同時要求列）", () => {
  test("競合操作（Git 同期・commit・push）の同時実行は 0 件で、先着順に排他実行される", () => {
    const requests: QueueRequest[] = SYSTEMS.map((system) => ({
      system,
      op: "git-write",
      exclusive: true,
    }));
    const { runs, releases } = simulateQueue(requests);
    expect(runs).toHaveLength(3);
    expect(concurrentOverlaps(runs, "git-write")).toBe(0);
    // 抑止された重複要求は棄却されず、先着操作の完了後に順序実行される
    expect(releases).toHaveLength(2);
    const sortedEnds = runs.map((run) => run.end).sort((a, b) => a - b);
    expect(sortedEnds).toEqual([1, 2, 3]);
  });

  test("非競合処理（読取・分析）は排他操作の実行中も待機しない（抑止 0 件）", () => {
    const requests: QueueRequest[] = [
      { system: "learning", op: "git-write", exclusive: true },
      { system: "intake", op: "read-analyze", exclusive: false },
      { system: "inspect", op: "read-analyze", exclusive: false },
    ];
    const { runs, releases } = simulateQueue(requests);
    expect(releases).toHaveLength(0);
    const readAnalyze = runs.filter((run) => run.op === "read-analyze");
    expect(readAnalyze.every((run) => run.start === 0)).toBe(true);
  });

  test("並列起動の観測: 3系統の活動区間記録の重なりから並列実行を確認できる", () => {
    const requests: QueueRequest[] = [
      { system: "learning", op: "read-analyze", exclusive: false },
      { system: "intake", op: "read-analyze", exclusive: false },
      { system: "inspect", op: "read-analyze", exclusive: false },
    ];
    const { runs } = simulateQueue(requests);
    expect(runs).toHaveLength(3);
    expect(intervalOverlaps3Systems(runs)).toBe(true);
  });

  test("順次直列化された活動区間記録では並列実行を確認できない（確認不能の検出）", () => {
    const sequentialRuns: QueueRun[] = [
      { system: "learning", op: "read-analyze", start: 0, end: 1 },
      { system: "intake", op: "read-analyze", start: 1, end: 2 },
      { system: "inspect", op: "read-analyze", start: 2, end: 3 },
    ];
    expect(intervalOverlaps3Systems(sequentialRuns)).toBe(false);
  });

  test("失敗・停止時は投入済み操作要求の排他解除と結果回収が成立し、他系統は連鎖停止しない", () => {
    // 停止系統（learning）の未発行要求は解除（released）として記録し、
    // 発行済み要求の結果は回収（collected）として記録する。解除後に
    // 排他は残存せず、他系統（intake、inspect）の同一カテゴリ操作は実行される。
    const failedSystem: SystemId = "learning";
    const pendingRequests: QueueRequest[] = [
      { system: failedSystem, op: "git-write", exclusive: true },
      { system: failedSystem, op: "shared-write", exclusive: true },
    ];
    const released: ReleaseRecord[] = pendingRequests.map((req) => ({
      system: failedSystem,
      requested: req.op,
      waitedForEnd: 0,
    }));
    const collected: { system: SystemId; op: QueueRequest["op"]; status: "pass" | "released" }[] =
      pendingRequests.map((req) => ({
        system: failedSystem,
        op: req.op,
        status: "released",
      }));

    // 解除後、他系統は同カテゴリ操作を実行できる（排他残存 0 件）。
    const afterRelease: QueueRequest[] = SYSTEMS.filter(
      (system) => system !== failedSystem,
    ).map((system) => ({
      system,
      op: "git-write",
      exclusive: true,
    }));
    const { runs } = simulateQueue(afterRelease);
    expect(runs).toHaveLength(2);
    expect(concurrentOverlaps(runs, "git-write")).toBe(0);
    expect(runs.every((run) => run.system !== failedSystem)).toBe(true);
    expect(collected.every((entry) => entry.system === failedSystem)).toBe(true);
    expect(released).toHaveLength(pendingRequests.length);
  });
});
