// ADF-COVERS(verification): REQ-030-012, REQ-030-013, REQ-030-014, REQ-061-029, REQ-061-030, REQ-061-031
//
// 横断依存検査エンジン（case-open STEP-5 / case-ready 検証ゲート共有）の回帰テスト。
// TS-001（同一パス重複警告、3 件目継続検出、冪等再実行時の警告再提示）、
// TS-002（共有領域未登録行の重複需要と選択肢提示）、TS-003（警告のみでの
// ready 遷移非阻止、検出源取得不能時の検出不能報告）の機械面を検証する。
// 本テストは実 REQ 行ID を含む fixture を扱うため producer 側非配布領域に配置する。

import { describe, expect, test } from "bun:test";
import * as path from "node:path";
import { inspectCrossDependencies } from "../../../src/opencode/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_engine.ts";
import type {
  CrossDependencyInspectionInput,
  CrossDependencyInspectionReport,
} from "../../../src/opencode/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_types.ts";

const MARKER = ["ADF", "-", "COVERS"].join("");

// フィクスチャ用の宣言行生成。テストソース内に完成形のマーカー文字列を直接
// 記述すると実リポジトリのコーパス走査で実宣言として誤検出されるため、
// マーカーはパーツ結合経由で組み立てる。
function mdDecl(role: string, ids: string): string {
  return `<!-- ${MARKER}(${role}): ${ids} -->`;
}

function makeInput(overrides: Partial<CrossDependencyInspectionInput>): CrossDependencyInspectionInput {
  return {
    mode: "case-open",
    current_case: {
      case_ref: "#current",
      epic_ref: null,
      is_epic_intake: false,
      artifact_paths: [],
      target_rows: [],
    },
    unclosed_cases: [],
    ...overrides,
  };
}

function run(input: CrossDependencyInspectionInput): CrossDependencyInspectionReport {
  return inspectCrossDependencies(input, () => {
    throw new Error("no file expected");
  });
}

describe("条件 (a): 同一パス重複（TS-001）", () => {
  test("未クローズ Case 2 件（投入中 Case 含む）の同一パス重複を警告する", () => {
    const report = run(makeInput({
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: ["src/shared/module.ts"],
        target_rows: [],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: ["src/shared/module.ts"],
          target_rows: [],
        },
        {
          case_ref: "#102",
          epic_ref: null,
          artifact_paths: ["src/other/module.ts"],
          target_rows: [],
        },
      ],
    }));
    expect(report.ok).toBe(true);
    expect(report.condition_a.count).toBe(1);
    expect(report.condition_a.warnings[0]?.path).toBe("src/shared/module.ts");
    expect(report.condition_a.warnings[0]?.cases).toEqual(["#101", "#current"]);
  });

  test("3 件目の追加で継続検出する", () => {
    const report = run(makeInput({
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: ["src/shared/module.ts"],
        target_rows: [],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: ["src/shared/module.ts"],
          target_rows: [],
        },
        {
          case_ref: "#102",
          epic_ref: null,
          artifact_paths: ["src/shared/module.ts"],
          target_rows: [],
        },
      ],
    }));
    expect(report.condition_a.count).toBe(1);
    expect(report.condition_a.warnings[0]?.cases).toEqual(["#101", "#102", "#current"]);
  });

  test("重複しないパスは警告しない", () => {
    const report = run(makeInput({
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: ["src/a.ts"],
        target_rows: [],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: ["src/b.ts"],
          target_rows: [],
        },
      ],
    }));
    expect(report.condition_a.count).toBe(0);
    expect(report.gate_effect).toBe("none");
  });

  test("パス表記の差を正規化して比較する（バックスラッシュ・./ 付き）", () => {
    const report = run(makeInput({
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: ["src\\shared\\module.ts"],
        target_rows: [],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: ["./src/shared/module.ts"],
          target_rows: [],
        },
      ],
    }));
    expect(report.condition_a.count).toBe(1);
    expect(report.condition_a.warnings[0]?.cases).toEqual(["#101", "#current"]);
  });

  test("同一 Epic 配下のみの重複は Wave 重複前置検出へ委譲し警告しない（REQ-030-014）", () => {
    const report = run(makeInput({
      mode: "case-ready",
      current_case: {
        case_ref: "#child-1",
        epic_ref: "#epic-9",
        is_epic_intake: false,
        artifact_paths: ["src/epic-shared/module.ts"],
        target_rows: [],
      },
      unclosed_cases: [
        {
          case_ref: "#child-2",
          epic_ref: "#epic-9",
          artifact_paths: ["src/epic-shared/module.ts"],
          target_rows: [],
        },
      ],
    }));
    expect(report.condition_a.count).toBe(0);
    expect(report.scan.wave_internal_delegated_paths).toEqual(["src/epic-shared/module.ts"]);
  });

  test("Epic をまたぐ重複は検出対象とする", () => {
    const report = run(makeInput({
      mode: "case-ready",
      current_case: {
        case_ref: "#child-1",
        epic_ref: "#epic-9",
        is_epic_intake: false,
        artifact_paths: ["src/shared/module.ts"],
        target_rows: [],
      },
      unclosed_cases: [
        {
          case_ref: "#child-2",
          epic_ref: "#epic-7",
          artifact_paths: ["src/shared/module.ts"],
          target_rows: [],
        },
      ],
    }));
    expect(report.condition_a.count).toBe(1);
  });
});

describe("条件 (b): 共有領域未登録行の重複需要（TS-002）", () => {
  test("2 Case が同一共有領域の未登録行を含む場合、未登録行と選択肢を報告する", () => {
    const files: Record<string, string> = {
      "catalog.md": [
        "# catalog",
        "",
        "- REQ-900-001: 登録済み",
        "- REQ-900-010..REQ-900-012: 登録済み範囲",
      ].join("\n"),
    };
    const report = inspectCrossDependencies(makeInput({
      mode: "case-ready",
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: [],
        target_rows: ["REQ-900-002"],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: [],
          target_rows: ["REQ-900-002", "REQ-900-011"],
        },
      ],
      shared_areas: [
        {
          area_id: "catalog",
          display_name: "共有カタログ",
          kind: "req-row-list",
          file_paths: ["catalog.md"],
        },
      ],
    }), (rel) => {
      const content = files[rel];
      if (content === undefined) throw new Error(`missing fixture: ${rel}`);
      return content;
    });
    expect(report.condition_b.length).toBe(1);
    const area = report.condition_b[0];
    expect(area?.case_count).toBe(2);
    const current = area?.demand_cases.find((c) => c.case_ref === "#current");
    const other = area?.demand_cases.find((c) => c.case_ref === "#101");
    // 登録済みの REQ-900-001 / 範囲展開された REQ-900-011 は需要とならない
    expect(current?.unregistered_rows).toEqual(["REQ-900-002"]);
    expect(other?.unregistered_rows).toEqual(["REQ-900-002"]);
    expect(report.hitl_options.length).toBe(3);
    expect(report.hitl_options[0]).toContain("先行整備 Case の切り出し提案");
    expect(report.hitl_options[1]).toContain("既存 Case への登録責務の割り当て");
    expect(report.hitl_options[2]).toContain("このまま並行投入");
  });

  test("対応宣言領域（宣言行）を登録状態として読み取る", () => {
    const files: Record<string, string> = {
      "decls.md": [
        "# declarations",
        "",
        mdDecl("implementation", "REQ-900-001, REQ-900-002"),
        mdDecl("verification", "REQ-900-003"),
      ].join("\n"),
    };
    const report = inspectCrossDependencies(makeInput({
      mode: "case-ready",
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: [],
        target_rows: ["REQ-900-001", "REQ-900-003", "REQ-900-004"],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: [],
          target_rows: ["REQ-900-004"],
        },
      ],
      shared_areas: [
        {
          area_id: "decl-area",
          display_name: "対応宣言領域",
          kind: "adf-covers-declarations",
          file_paths: ["decls.md"],
        },
      ],
    }), (rel) => {
      const content = files[rel];
      if (content === undefined) throw new Error(`missing fixture: ${rel}`);
      return content;
    });
    const area = report.condition_b[0];
    expect(area?.demand_cases.length).toBe(2);
    const current = area?.demand_cases.find((c) => c.case_ref === "#current");
    // 宣言済みの 001〜003 は需要とならず、未宣言の 004 のみ需要となる
    expect(current?.unregistered_rows).toEqual(["REQ-900-004"]);
  });

  test("索引等の緩い形式（本文中の言及）を登録状態として読み取る", () => {
    const files: Record<string, string> = {
      "index.md": "| [REQ-900-001](req-900.md) | title |\n| [REQ-900-002](req-900.md) | title |\n",
    };
    const report = inspectCrossDependencies(makeInput({
      mode: "case-ready",
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: [],
        target_rows: ["REQ-900-001", "REQ-900-005"],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: [],
          target_rows: ["REQ-900-005"],
        },
      ],
      shared_areas: [
        {
          area_id: "index",
          display_name: "索引",
          kind: "req-row-mentions",
          file_paths: ["index.md"],
        },
      ],
    }), (rel) => {
      const content = files[rel];
      if (content === undefined) throw new Error(`missing fixture: ${rel}`);
      return content;
    });
    const area = report.condition_b[0];
    const current = area?.demand_cases.find((c) => c.case_ref === "#current");
    expect(current?.unregistered_rows).toEqual(["REQ-900-005"]);
  });
});

describe("検出不能報告と非阻止（TS-003）", () => {
  test("共有領域実ファイルの読取失敗時、比較を省略せず検出不能として報告する", () => {
    const report = inspectCrossDependencies(makeInput({
      mode: "case-ready",
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: [],
        target_rows: ["REQ-900-002"],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: [],
          target_rows: ["REQ-900-002"],
        },
      ],
      shared_areas: [
        {
          area_id: "catalog",
          display_name: "共有カタログ",
          kind: "req-row-list",
          file_paths: ["missing.md"],
        },
      ],
    }), () => {
      throw new Error("ENOENT: no such file");
    });
    expect(report.detection_unavailable.length).toBe(1);
    expect(report.detection_unavailable[0]?.source).toBe("shared-area-file");
    expect(report.detection_unavailable[0]?.ref).toBe("missing.md");
    // 読取失敗を空の登録状態で捏代わりに需要計算しない
    expect(report.condition_b[0]?.demand_cases).toEqual([]);
    expect(report.condition_b[0]?.file_results[0]?.read_ok).toBe(false);
  });

  test("呼出側で観測した検出源取得失敗（Issue 取得失敗等）を検出不能として報告する", () => {
    const report = run(makeInput({
      source_failures: [
        { source: "unclosed-cases", ref: "issue-list", reason: "issue_list failed" },
      ],
    }));
    expect(report.detection_unavailable.length).toBe(1);
    expect(report.detection_unavailable[0]?.source).toBe("unclosed-cases");
  });

  test("警告検出時も報告は ok でありゲート遷移判定に影響しない（ready 遷移非阻止の機械面）", () => {
    const report = run(makeInput({
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: ["src/shared/module.ts"],
        target_rows: [],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: ["src/shared/module.ts"],
          target_rows: [],
        },
      ],
    }));
    expect(report.ok).toBe(true);
    expect(report.condition_a.count).toBe(1);
    expect(report.gate_effect).toBe("none");
  });
});

describe("冪等再実行時の警告再提示（TS-001）", () => {
  test("同一入力から同一の報告を返す", () => {
    const files: Record<string, string> = {
      "catalog.md": "- REQ-900-001: 登録済み\n",
    };
    const input = makeInput({
      mode: "case-ready",
      current_case: {
        case_ref: "#current",
        epic_ref: null,
        is_epic_intake: false,
        artifact_paths: ["src/shared/module.ts"],
        target_rows: ["REQ-900-002"],
      },
      unclosed_cases: [
        {
          case_ref: "#101",
          epic_ref: null,
          artifact_paths: ["src/shared/module.ts"],
          target_rows: ["REQ-900-002"],
        },
      ],
      shared_areas: [
        {
          area_id: "catalog",
          display_name: "共有カタログ",
          kind: "req-row-list",
          file_paths: ["catalog.md"],
        },
      ],
    });
    const read = (rel: string): string => {
      const content = files[rel];
      if (content === undefined) throw new Error(`missing fixture: ${rel}`);
      return content;
    };
    const first = inspectCrossDependencies(input, read);
    const second = inspectCrossDependencies(input, read);
    expect(second).toEqual(first);
    expect(first.condition_a.count).toBe(1);
    expect(first.condition_b[0]?.case_count).toBe(2);
  });
});

describe("CLI（実行形態・REQ-060 準拠はバッチ fixture テストで検証）", () => {
  test("入力形式エラー時は終了コード 1 で stderr に報告する", () => {
    const result = Bun.spawnSync([
      process.execPath,
      path.join("src", "opencode", "skills", "agentdev-workflow-case-open", "scripts", "src", "inspect_cross_dependencies.ts"),
    ], {
      cwd: path.resolve(import.meta.dir, "..", "..", ".."),
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(result.exitCode).toBe(1);
    expect(new TextDecoder().decode(result.stderr)).toContain("--input is required");
  });
});
