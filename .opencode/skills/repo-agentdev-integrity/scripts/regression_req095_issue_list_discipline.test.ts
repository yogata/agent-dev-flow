// ADF-COVERS(verification): REQ-011-033, REQ-095-001, REQ-095-003
import { describe, expect, it } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const REPO_ROOT = join(SCRIPT_DIR, "..", "..", "..", "..");
const SAFETY_DOC = join(
  REPO_ROOT,
  "src",
  "common",
  "skills",
  "agentdev-issue-management",
  "references",
  "issue-operation-safety.md",
);
const TRACKING_DESIGN = join(REPO_ROOT, "docs", "designs", "skills", "agentdev-issue-tracking.md");

describe("regression_req095: issue_list 運用規律の文書整備", () => {
  const safetyDoc = readFileSync(SAFETY_DOC, "utf-8");
  const trackingDesign = readFileSync(TRACKING_DESIGN, "utf-8");

  it("REQ-011-033/REQ-095-003: issue_list の search 併用必須規律が存在し、広範 filter を search なしで実行しない旨を明記する", () => {
    expect(safetyDoc).toContain("search 併用必須");
    expect(safetyDoc).toContain("必ず併用する");
    expect(safetyDoc).toContain("広範 filter を `search` なしで実行すると");
  });

  it("REQ-095-001: labels 引数の tracking 論理値専用規律と受理能力（クライアント再フィルタ）の区別を明記し、Design 物理写像表の補記と無矛盾である", () => {
    expect(safetyDoc).toContain("物理マッピング入力に用いる");
    expect(safetyDoc).toContain("0 件帰着や無効にはならない");
    expect(safetyDoc).toContain("クライアント再フィルタ");
    expect(safetyDoc).toContain("使用規律の解禁を意味せず");
    expect(safetyDoc).toContain("`search` 引数と state の組み合わせで行う");
    expect(trackingDesign).toContain("issue_list の labels 引数の規律（物理写像の入力方向）");
    expect(trackingDesign).toContain("受理能力としては通常ラベル（enhancement、bug 等）による絞り込みも有効（クライアント再フィルタ）");
  });

  it("REQ-095-003: 上限到達時 contingency 手順が参照可能で、Tool 正規経路第一を明記する", () => {
    expect(safetyDoc).toContain("上限到達時 contingency");
    expect(safetyDoc).toContain("Tool 正規経路を第一");
    expect(safetyDoc).toContain("gh issue list --search");
    expect(safetyDoc).toContain("--json labels");
  });

  it("REQ-095-003: search トークン選択性指針・決定的違反と一時的 API エラーの再試行判断・state: open 限定の適用境界が存在する", () => {
    expect(safetyDoc).toContain("search トークンの選択性指針");
    expect(safetyDoc).toContain("選択性を持つ語（冪等キー語、REQ 番号、topic_slug 等）");
    expect(safetyDoc).toContain("相互参照トークン（兄弟 Case の RU 番号等）は選択性が低いため");
    expect(safetyDoc).toContain("単独の絞り込み根拠として用いない");
    expect(safetyDoc).toContain("`state` と role（tracking / case）の指定を併用");
    expect(safetyDoc).toContain("決定的違反と一時的 API エラーの区別と再試行判断");
    expect(safetyDoc).toContain("同一呼出の再試行で解消しない");
    expect(safetyDoc).toContain("state: open 限定の適用境界");
    expect(safetyDoc).toContain("冪等検出（重複生成の防止）を目的とする検索に限定");
    expect(safetyDoc).toContain("参照後続検索");
  });

  it("REQ-095-003: server-side search 偽陰性の呼出側規律（in:title 限定・トークン正規化不一致・空配列不存在証拠禁止・unfiltered fallback）が存在する", () => {
    expect(safetyDoc).toContain("server-side search の偽陰性に対する呼出側規律");
    expect(safetyDoc).toContain("タイトル検索限定（`in:title`）の tokenized 照合であり、本文検索ではない");
    expect(safetyDoc).toContain("`in:title` 限定の仕様による構造的な除外");
    expect(safetyDoc).toContain("ハイフンを区切りとしたトークンへ分割された正規化形で解釈される");
    expect(safetyDoc).toContain("空配列成功応答は不存在の証拠としない");
    expect(safetyDoc).toContain("対象の不存在を保証しない");
    expect(safetyDoc).toContain("unfiltered fallback（フィルタを外した一覧取得での再確認）");
    expect(safetyDoc).toContain("フィルタを外した一覧取得での再確認を行う");
  });
});
