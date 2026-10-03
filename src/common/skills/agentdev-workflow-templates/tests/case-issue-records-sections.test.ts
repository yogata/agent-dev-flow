// Case Issue 本文テンプレートの工程記録セクション（現在地・結果）の構造検査。
// セクション名・順序・項目様式の正は workflows/issue-lifecycle-records Design（Case Issue 工程記録モデル）であり、
// 本テストはテンプレート実体への投影が Design 確定事項と一致することを検査する。
// 要件との対応関係の正は repository top-level traceability/ sidecar が保持する。

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const TEMPLATES_DIR = join(import.meta.dir, "..", "templates");

// 対象テンプレートと、現在地セクションに記録する起票時点の工程、および後続セクション名
const TARGETS = [
  { file: "case-open/root-case.md", phase: "case-open", tail: "補足情報（オプション）" },
  { file: "case-ready/root-case.md", phase: "case-ready", tail: "補足情報（オプション）" },
  { file: "issue_desc_feature.md", phase: "case-open", tail: "補足情報（オプション）" },
  { file: "issue_desc_bug.md", phase: "case-open", tail: "補足情報（オプション）" },
  { file: "issue_desc_epic.md", phase: "case-ready", tail: "補足情報" },
  { file: "issue_desc_child.md", phase: "case-ready", tail: "補足情報" },
] as const;

// 現在地セクションの必須項目（工程、進行状態、次の行動、担当役割、停止・待機理由、最新記録参照）
const CURRENT_ITEMS = ["工程", "進行状態", "次の行動", "担当役割", "停止・待機理由", "最新記録参照"];
// 結果セクションの必須項目（成果物、最終判定と根拠、残件の扱い）
const RESULT_ITEMS = ["成果物", "最終判定と根拠", "残件の扱い"];
// 進行状態4値
const PROGRESS_STATES = ["未着手", "実行中", "待機", "終了"];

function readTemplate(relPath: string): string {
  return readFileSync(join(TEMPLATES_DIR, ...relPath.split("/")), "utf-8");
}

describe("Case Issue 工程記録セクションのテンプレート投影", () => {
  for (const target of TARGETS) {
    describe(target.file, () => {
      const body = readTemplate(target.file);
      const idxReview = body.indexOf("## レビュー判断");
      const idxCurrent = body.indexOf("## 現在地");
      const idxResult = body.indexOf("## 結果");
      const idxTail = body.indexOf(`## ${target.tail}`);
      const currentBlock = idxCurrent >= 0 && idxResult > idxCurrent ? body.slice(idxCurrent, idxResult) : "";
      const resultBlock = idxResult >= 0 && idxTail > idxResult ? body.slice(idxResult, idxTail) : "";

      it("現在地・結果セクションをレビュー判断の後、補足情報の前に順序どおり保持する", () => {
        expect(idxCurrent).toBeGreaterThan(idxReview);
        expect(idxResult).toBeGreaterThan(idxCurrent);
        expect(idxTail).toBeGreaterThan(idxResult);
      });

      it("現在地・結果セクションは必須セクションである", () => {
        expect(currentBlock).toContain("<!-- 【必須】 -->");
        expect(resultBlock).toContain("<!-- 【必須】 -->");
      });

      it("現在地セクションは必須項目を key-value 行で保持する", () => {
        for (const item of CURRENT_ITEMS) {
          expect(currentBlock).toContain(`- ${item}:`);
        }
      });

      it("現在地セクションは進行状態4値を表示し、起票時点は未着手である", () => {
        for (const state of PROGRESS_STATES) {
          expect(currentBlock).toContain(state);
        }
        expect(currentBlock).toContain("- 進行状態: 未着手");
      });

      it("現在地セクションは起票時点の工程を記録する", () => {
        expect(currentBlock).toContain(`- 工程: ${target.phase}`);
      });

      it("現在地セクションは記録契機6種を保持する", () => {
        for (const trigger of ["着手", "引き渡し", "停止", "再開", "判断変更", "完了"]) {
          expect(currentBlock).toContain(trigger);
        }
      });

      it("現在地セクションは担当役割3種を保持する", () => {
        for (const role of ["実行担当", "取りまとめ", "判定主体"]) {
          expect(currentBlock).toContain(role);
        }
      });

      it("結果セクションは必須項目を key-value 行で保持する", () => {
        for (const item of RESULT_ITEMS) {
          expect(resultBlock).toContain(`- ${item}:`);
        }
      });

      it("結果セクションは判定主体による完了判定を明示する", () => {
        expect(resultBlock).toContain("case-close");
        expect(resultBlock).toContain("完了条件と証拠を照合");
      });
    });
  }
});
