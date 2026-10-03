// Case Issue 本文テンプレートの新形式構造（目的、対象範囲・対象外、完了条件、進行状況、
// 結果は条件付き）の検査。セクション名・順序・項目様式の正は workflows/issue-lifecycle-records
// Design（Case Issue 工程記録モデル）であり、本テストはテンプレート実体への投影が Design
// 確定事項と一致することを検査する。結果・実現方針は非該当時に章を常設しないため、
// 起票時の本文には含めないことを併せて検査する。
// 要件との対応関係の正は repository top-level traceability/ sidecar が保持する。

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const TEMPLATES_DIR = join(import.meta.dir, "..", "templates");

// 対象テンプレートと役割（root / child / epic）。Child の進行状況は日時のみ、
// Epic は実行構成表を追加で保持する。
const TARGETS = [
  { file: "case-open/root-case.md", role: "root" },
  { file: "case-ready/root-case.md", role: "root" },
  { file: "issue_desc_feature.md", role: "root" },
  { file: "issue_desc_bug.md", role: "root" },
  { file: "issue_desc_epic.md", role: "epic" },
  { file: "issue_desc_child.md", role: "child" },
] as const;

// 廃止章。新形式本文には存在しない（非該当章の常設廃止・独立章生成廃止）。
const ABOLISHED_HEADINGS = [
  "## 実行識別情報",
  "## 対象 REQ",
  "## REQ参照",
  "## Definition Package",
  "## Case 状態と次工程",
  "## Execution Contract",
  "## レビュー判断",
  "## 現在地",
  "## テスト戦略",
  "## 分解",
  "## 実行順序",
  "## ステータス追跡",
];

// 進行状況セクションの必須項目（正規状態は Root / Epic のみ、Child は日時のみ）
const PROGRESS_ITEMS_ROOT = ["正規状態", "開始日時", "終了日時"];
const PROGRESS_ITEMS_CHILD = ["開始日時", "終了日時"];
// 正規状態3値（表示と値トークン）
const CANONICAL_STATES = [
  "実行継続中（active）",
  "完了（closed）",
  "中止（cancelled）",
];

function readTemplate(relPath: string): string {
  return readFileSync(join(TEMPLATES_DIR, ...relPath.split("/")), "utf-8");
}

describe("Case Issue 本文テンプレートの新形式投影", () => {
  for (const target of TARGETS) {
    describe(target.file, () => {
      const body = readTemplate(target.file);
      const idxPurpose = body.indexOf("## 目的");
      const idxScope = body.indexOf("## 対象範囲・対象外");
      const idxCriteria = body.indexOf("## 完了条件");
      const idxProgress = body.indexOf("## 進行状況");
      const progressBlock =
        idxProgress >= 0 ? body.slice(idxProgress, idxProgress + 900) : "";

      it("本文基本構造を順序どおり保持する（目的 → 対象範囲・対象外 → 完了条件 → 進行状況）", () => {
        expect(idxPurpose).toBeGreaterThanOrEqual(0);
        expect(idxScope).toBeGreaterThan(idxPurpose);
        expect(idxCriteria).toBeGreaterThan(idxScope);
        expect(idxProgress).toBeGreaterThan(idxCriteria);
      });

      it("進行状況セクションは必須セクションである", () => {
        const afterHeading = body.slice(idxProgress, idxProgress + 200);
        expect(afterHeading).toContain("<!-- 【必須】 -->");
      });

      it("廃止章を生成しない構造である", () => {
        for (const heading of ABOLISHED_HEADINGS) {
          expect(body).not.toContain(heading);
        }
      });

      it("結果・実現方針の章は起票時の本文に含めない（非該当時は章を常設しない）", () => {
        expect(body).not.toMatch(/^## 結果/m);
        expect(body).not.toMatch(/^## 実現方針/m);
      });

      if (target.role === "child") {
        it("Child 本文の冒頭行は 親Epic: #N である", () => {
          expect(body).toMatch(/^親Epic: #\{epic_number\}/m);
          expect(body).not.toContain("Parent: #");
        });

        it("Child の進行状況は開始・終了日時のみで正規状態行を持たない", () => {
          expect(progressBlock).toContain("- 開始日時:");
          expect(progressBlock).toContain("- 終了日時:");
          expect(progressBlock).not.toContain("- 正規状態:");
        });

        it("Child の完了条件はチェックボックス形式の検証項目（条件・検証方法・合格条件）を保持する", () => {
          expect(body).toContain("- [ ] [");
          expect(body).toContain("検証方法:");
          expect(body).toContain("合格条件:");
        });
      } else {
        it("Root の進行状況は正規状態と開始・終了日時のみを保持する", () => {
          expect(progressBlock).toContain("- 正規状態: 実行継続中（active）");
          expect(progressBlock).toContain("- 開始日時:");
          expect(progressBlock).toContain("- 終了日時:");
          expect(progressBlock).not.toMatch(/^- 進行状態:/m);
          expect(progressBlock).not.toMatch(/^- 担当役割:/m);
          expect(progressBlock).not.toMatch(/^- 次の行動:/m);
          expect(progressBlock).not.toMatch(/^- 最新記録参照:/m);
        });

        it("進行状況は正規状態3値の様式に従う", () => {
          expect(CANONICAL_STATES).toContain("実行継続中（active）");
          expect(progressBlock).not.toContain("未着手");
          expect(progressBlock).not.toContain("待機");
        });

        it("完了条件はチェックボックス形式の検証項目（条件・検証方法・合格条件）を保持する", () => {
          expect(body).toContain("- [ ] [");
          expect(body).toContain("検証方法:");
          expect(body).toContain("合格条件:");
        });
      }

      if (target.role === "epic") {
        it("実行構成は | Wave | Issue | 前提 | 状態 | の一表のみで分解表・実行順序表・状態別件数表を持たない", () => {
          const waveMatches = body.match(/\| Wave \| Issue \| 前提 \| 状態 \|/g) ?? [];
          expect(waveMatches.length).toBe(1);
          expect(body).not.toContain("| # | Issue | ステータス | 内容 |");
          expect(body).not.toContain("| # | Issue | タイトル | ステータス |");
          expect(body).not.toContain("| 状態 | 件数 |");
          expect(body).not.toContain("実行方法");
        });

        it("実行構成表は子状態4値のみを規定し PR 付記形式を含まない", () => {
          expect(body).toContain("pending / completed / blocked / failed");
          expect(body).not.toContain("([PR#");
        });
      }
    });
  }
});

describe("工程記録コメントテンプレートの新形式投影", () => {
  const RECORD_KINDS = [
    { file: "issue_comment_record_hold.md", kind: "停止", required: "再開条件" },
    { file: "issue_comment_record_decision_change.md", kind: "判断変更", required: "撤回対象" },
    { file: "issue_comment_record_completion.md", kind: "検証証拠", required: "判定根拠" },
  ];

  for (const t of RECORD_KINDS) {
    it(`${t.file} は記録種別 ${t.kind} と種別別必須項目 ${t.required} を保持する`, () => {
      const body = readFileSync(join(TEMPLATES_DIR, ...t.file.split("/")), "utf-8");
      expect(body).toContain(`## 記録種別`);
      expect(body).toContain(t.kind);
      expect(body).toContain(`## ${t.required}`);
    });
  }

  it("廃止記録契機（着手・引き渡し・再開）のテンプレート実体は存在しない", () => {
    for (const file of [
      "issue_comment_record_start.md",
      "issue_comment_record_handoff.md",
      "issue_comment_record_resume.md",
    ]) {
      expect(() => readFileSync(join(TEMPLATES_DIR, file), "utf-8")).toThrow();
    }
  });
});
