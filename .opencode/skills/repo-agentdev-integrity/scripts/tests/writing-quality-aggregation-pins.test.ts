// ADF-COVERS(verification): REQ-098-001, REQ-098-006
//
// Issue #4030（B2-2: 工程拡張の文章品質・書込み規則の共通参照化）で確定した
// 集約構造の pin 検査。7つの workflow 拡張 rules が反復本文を廃止し、正本節
// （agentdev-workflow-lifecycle スキル「文章品質・書込み規約」節）への名レベル
// 参照のみを保持することを、内容検索（pin 型・anchor 型）で固定する。
// pin の文言変更は期待値追随を同一 PR で行う。

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..", "..", "..", "..", "..");

function read(...parts: string[]): string {
  return readFileSync(join(repoRoot, ...parts), "utf8");
}

const EXTENSIONS = [
  "agentdev-workflow-case-auto",
  "agentdev-workflow-case-open",
  "agentdev-workflow-case-ready",
  "agentdev-workflow-case-revise",
  "agentdev-workflow-case-run",
  "agentdev-workflow-case-close",
  "agentdev-workflow-issue",
].map((n) => [".agentdev", "extensions", "skills", `${n}.yaml`] as string[]);

const CANONICAL = "文章品質・書込み規約（反復規則の単一正本）";
const CANONICAL_REF = "「文章品質・書込み規約」節を正本として参照する";
// 旧反復本文の固有指標語（集約後に拡張へ残ってはならない）。
const OLD_BODY_MARKERS = [
  "検査専用本文ファイル",
  "標準回復手段",
  "yomiyasu_lint.py を環境で利用可能な Python コマンド",
  "修正試行は最大 2 回",
];
// 旧本文が案内していた迂回選択肢（workspace 外配置先への別手段書込み）。
const BYPASS_GUIDANCE_MARKERS = [
  "〔a〕bash の heredoc",
  "〔b〕作成先を project root 内",
  "Write ツールに代わる標準書込み手段",
];

describe("文章品質規則の集約構造（B2-2・Issue #4030）", () => {
  const lifecycle = read(
    "src",
    "common",
    "skills",
    "agentdev-workflow-lifecycle",
    "SKILL.md",
  );

  test("正本節と小節3種が lifecycle SKILL.md に存在する（anchor 型）", () => {
    expect(lifecycle).toContain(CANONICAL);
    expect(lifecycle).toContain("### yomiyasu 推敲の適用規律");
    expect(lifecycle).toContain("### 書込み guard の拒否対象・許可対象と拒否後の回復");
    expect(lifecycle).toContain("### 障害対応知識の条件付き参照");
  });

  test("正本節が規則本文を複製しない単一正本であることを宣言する（pin 型）", () => {
    expect(lifecycle).toContain("規則本文を各ファイルへ複製しない。本節の配置変更は公開契約の変更として扱う");
  });

  test("yomiyasu 推敲の保護条件の文言を正本が保持する（REQ-098-006 pin 型）", () => {
    expect(lifecycle).toContain("要件の必須性、条件、責任主体、数値、否定条件を保持し");
    expect(lifecycle).toContain("識別子、リンク、コード、引用、固定テンプレート、表構造、AUTOGEN 部分を保護する");
    expect(lifecycle).toContain("箇条書きの削減と否定対比の肯定化を機械的に適用しない");
  });

  test("yomiyasu 推敲の適用手順・判定・停止条件の文言を正本が保持する（REQ-098-001 pin 型）", () => {
    expect(lifecycle).toContain("編集前に yomiyasu を読み込み、内容変更が揃った後に変更文章と周辺文脈を推敲し");
    expect(lifecycle).toContain("標準入力・パイプ・リダイレクト経由の本文渡しは使わず");
    expect(lifecycle).toContain("lint の通常終了コード 0 を指摘なし・推敲済みの証明として扱わない");
    expect(lifecycle).toContain("修正試行は最大 2 回");
    expect(lifecycle).toContain("yomiyasu 未導入・lint 実行失敗の場合は対象文章の提出・投稿・マージを停止する");
    expect(lifecycle).toContain("親セッションの読込事実のみで委譲先の適用を省略しない");
    expect(lifecycle).toContain("他者の文章・引用・ログを無断でリライトしない");
    expect(lifecycle).toContain("ラベル・状態・チェックボックスのみの変更は再推敲不要");
    expect(lifecycle).toContain("記録のためだけの再帰的コメント投稿や追加永続管理を作らない");
  });

  test("guard 拒否後の回復が迂回禁止へ統一されている（pin 型）", () => {
    expect(lifecycle).toContain("guard による書込みブロックは fail-closed として維持し、guard の解除・迂回を行わない");
    expect(lifecycle).toContain("拒否後の回復は、許可された配置先への変更による");
    expect(lifecycle).toContain("別 API 経路での迂回書込み）は案内しない");
    expect(lifecycle).toContain("worktree root 配下。退避ファイルの分類規律に従う");
    expect(lifecycle).toContain("`agentdev-git-worktree` スキル「書込み guard 運用指針」節を参照する");
  });

  test("書込み guard 3種の検出対象（実効範囲）と許可対象の文面を保持する（pin 型）", () => {
    expect(lifecycle).toContain("textlint 書込み前 guard（pre-write plugin）");
    expect(lifecycle).toContain("docs/** を対象とする書込みのうち、拒否対象（hard）違反を含む内容のディスク反映");
    expect(lifecycle).toContain("プロジェクトルート外パスへの書込み");
    expect(lifecycle).toContain("src/common/commands/agentdev/** と src/common/skills/agentdev-*/**");
    expect(lifecycle).toContain("docs の要件・Decision・ADR 系パス");
    expect(lifecycle).toContain("traceability/ 配下 sidecar への対応宣言登録");
    expect(lifecycle).toContain("生 gh WRITE コマンド");
    expect(lifecycle).toContain("gh の読み取り系コマンドと、agentdev_gh Custom Tool 経由の書込み");
  });

  test("正本節が参照する障害対応知識文書が実在する（相対パス解決）", () => {
    const knowledge = [
      "windows-git-bash-inline-content-corruption.md",
      "bun-test-execution-form-drift-signals.md",
      "checker-cli-stdout-loss-on-windows-bun.md",
      "long-running-mechanical-step-background-execution.md",
      "worktree-environment-fail-classification.md",
      "windows-powershell-bulk-io-corruption.md",
    ];
    for (const doc of knowledge) {
      expect(lifecycle).toContain(`docs/knowledge/${doc}`);
      expect(existsSync(join(repoRoot, "docs", "knowledge", doc))).toBe(true);
    }
  });
});

describe("7 workflow 拡張 rules の正本参照（B2-2・Issue #4030）", () => {
  for (const rel of EXTENSIONS) {
    test(`${rel}: 呼出条件と正本への参照のみを保持する`, () => {
      const ext = read(...rel);
      expect(ext).toContain("id: yomiyasu-application-before-write");
      expect(ext).toContain("skill: yomiyasu");
      expect(ext).toContain(CANONICAL_REF);
      // 反復本文の残留 0（集約対象の反復実体が各拡張へ残っていない）
      for (const marker of OLD_BODY_MARKERS) {
        expect(ext.includes(marker)).toBe(false);
      }
      // 迂回案内の矛盾記述 0（旧本文の迂回選択肢〔a〕〔b〕が残っていない）
      for (const marker of BYPASS_GUIDANCE_MARKERS) {
        expect(ext.includes(marker)).toBe(false);
      }
    });
  }
});
