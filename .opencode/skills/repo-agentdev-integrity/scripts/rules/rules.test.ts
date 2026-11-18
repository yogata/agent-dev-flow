// scripts/rules/rules.test.ts — 残存ルールの正常系・異常系をインメモリ IntegrityContext で検証する。
// 契約所有: docs/designs/integrity/integrity-engine-plugin-architecture.md「テスト構成」。
// 保持3能力の回帰テスト（REQ-117-006 sidecar 重複キー・REQ-010-084 未追跡・REQ-010-083
// known-corruption-literal）を含む。

import { describe, expect, test } from "bun:test";
import { parseParsedFile } from "../../engine/context.ts";
import type { IntegrityContext, ParsedFile } from "../../engine/types.ts";
import { checkKnownCorruptionLiterals } from "../../lib/builtin-checks.ts";
import { detectDuplicateSidecarKeys, parseSidecar } from "../../../../skills/agentdev-traceability/scripts/lib/sidecar.ts";
import { ir001 } from "../../rules/ir-001.ts";
import { ir002 } from "../../rules/ir-002.ts";
import { ir003 } from "../../rules/ir-003.ts";
import { ir004 } from "../../rules/ir-004.ts";
import { ir007 } from "../../rules/ir-007.ts";
import { ir008 } from "../../rules/ir-008.ts";
import { ir013 } from "../../rules/ir-013.ts";
import { ir016 } from "../../rules/ir-016.ts";
import { ir024 } from "../../rules/ir-024.ts";
import { ir044 } from "../../rules/ir-044.ts";
import { ir053 } from "../../rules/ir-053.ts";
import { ir055 } from "../../rules/ir-055.ts";
import { ir056 } from "../../rules/ir-056.ts";
import { ir059 } from "../../rules/ir-059.ts";
import { ir062 } from "../../rules/ir-062.ts";
import { ir063 } from "../../rules/ir-063.ts";
import { ir064 } from "../../rules/ir-064.ts";
import { ir067 } from "../../rules/ir-067.ts";
import { ir068 } from "../../rules/ir-068.ts";
import { ir069 } from "../../rules/ir-069.ts";
import { ir070 } from "../../rules/ir-070.ts";
import { ir071 } from "../../rules/ir-071.ts";

class MemoryContext implements IntegrityContext {
  #byPath: Map<string, ParsedFile>;
  #dirs: Set<string>;
  #raw: Map<string, string>;

  constructor(
    readonly repoRoot: string,
    files: Record<string, string>,
    readonly changedFiles: readonly string[] = [],
    dirs: readonly string[] = [],
    rawFiles: Record<string, string> = {},
  ) {
    this.#byPath = new Map(
      Object.entries(files).map(([p, content]) => [p, parseParsedFile(p, content)]),
    );
    this.#dirs = new Set(dirs);
    this.#raw = new Map(Object.entries(rawFiles));
    for (const [p, content] of Object.entries(files)) {
      this.#raw.set(p, content);
    }
  }

  get files(): readonly ParsedFile[] {
    return [...this.#byPath.values()].sort((a, b) => (a.path < b.path ? -1 : 1));
  }

  readFile(relPath: string): ParsedFile | null {
    return this.#byPath.get(relPath.replace(/\\/g, "/")) ?? null;
  }

  pathExists(relPath: string): boolean {
    const normalized = relPath.replace(/\\/g, "/").replace(/\/$/, "");
    if (this.#raw.has(normalized) || this.#dirs.has(normalized) || this.#byPath.has(normalized)) {
      return true;
    }
    for (const p of this.#raw.keys()) {
      if (p.startsWith(`${normalized}/`)) return true;
    }
    for (const d of this.#dirs) {
      if (d.startsWith(`${normalized}/`)) return true;
    }
    return false;
  }

  readRaw(relPath: string): string | null {
    return this.#raw.get(relPath.replace(/\\/g, "/")) ?? null;
  }

  getFilesByGlob(pattern: string): ParsedFile[] {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    let out = "";
    for (let i = 0; i < escaped.length; i++) {
      const ch = escaped[i]!;
      if (ch === "*" && escaped[i + 1] === "*") {
        if (escaped[i + 2] === "/") {
          out += "(?:.*/)?";
          i += 2;
        } else {
          out += ".*";
          i += 1;
        }
        continue;
      }
      if (ch === "*") {
        out += "[^/]*";
        continue;
      }
      if (ch === "?") {
        out += "[^/]";
        continue;
      }
      out += ch;
    }
    const re = new RegExp(`^${out}$`);
    return this.files.filter((f) => re.test(f.path));
  }

  listDir(relPath: string): string[] {
    const normalized = relPath.replace(/\\/g, "/");
    const out = new Set<string>();
    for (const path of this.#dirs) {
      if (!path.startsWith(`${normalized}/`)) continue;
      const rest = path.slice(normalized.length + 1);
      out.add(rest.split("/")[0]!);
    }
    for (const path of this.#raw.keys()) {
      if (!path.startsWith(`${normalized}/`)) continue;
      const rest = path.slice(normalized.length + 1);
      out.add(rest.split("/")[0]!);
    }
    return [...out];
  }
}

const REQ_MD_OK = `---
id: REQ-001
title: "sample"
created: "2026-01-01"
updated: "2026-01-02"
---

# REQ-001

| 要件ID | 要件 | 受け入れ条件 | 検証 |
|---|---|---|---|
| REQ-001-001 | サンプル要件 | 判定可能 | TS-001 |
`;

const REQ_MD_BAD_ID = REQ_MD_OK.replace("id: REQ-001", "id: REQ-002");

const REQ_README_OK = `# 要件

| REQ ID | タイトル |
|---|---|
| [REQ-001](REQ-001.md) | サンプル |
`;

describe("IR-016: source/projection 整合性", () => {
  const manifestWithCopy =
    "schema_version: 1\n\nskills:\n  - agentdev-sample\n\ncopy_projections:\n  - canonical: src/common/skills/repo-sample\n    projection: .opencode/skills/repo-sample\n";

  test("異常系: copy 投影に無い canonical ファイルは違反", () => {
    const ctx = new MemoryContext(
      "/repo",
      {
        ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml": manifestWithCopy,
        "src/common/skills/repo-sample/engine/types.ts": "export const a = 1;\n",
        ".opencode/skills/repo-sample/engine/types.ts": "export const a = 1;\n",
        "src/common/skills/repo-sample/rules/ir-999.ts": "export const b = 2;\n",
      },
      [],
    );
    const violations = ir016.check(ctx);
    expect(violations.some((v) => v.message.includes("missing from copy projection"))).toBe(true);
  });

  test("正常系: canonical と copy 投影の内容が一致する場合は違反 0", () => {
    const ctx = new MemoryContext(
      "/repo",
      {
        ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml": manifestWithCopy,
        "src/common/skills/repo-sample/engine/types.ts": "export const a = 1;\n",
        ".opencode/skills/repo-sample/engine/types.ts": "export const a = 1;\n",
      },
      [],
    );
    expect(ir016.check(ctx)).toEqual([]);
  });
});

describe("IR-056: project-extensions-integrity", () => {
  const extYaml = (kind: string, id: string): string =>
    `version: 1\nkind: ${kind}\nid: ${id}\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n`;

  test("異常系: workflow-extension の対象が Workflow Skill でない場合は違反", () => {
    const ctx = new MemoryContext(
      "/repo",
      {
        "src/common/commands/agentdev/demo.md": "---\ndescription: c\n---\n",
        "src/common/skills/agentdev-workflow-demo/SKILL.md":
          "---\nname: agentdev-workflow-demo\ndescription: s\n---\n",
        "src/common/skills/agentdev-cap-demo/SKILL.md":
          "---\nname: agentdev-cap-demo\ndescription: s\n---\n",
        ".agentdev/extensions/skills/agentdev-cap-demo.yaml": extYaml("workflow-extension", "agentdev-cap-demo"),
      },
      [],
    );
    const violations = ir056.check(ctx);
    expect(violations.some((v) => v.message.includes("capability-workflow-classification"))).toBe(true);
  });

  test("正常系: workflow-extension が Workflow Skill を対象とする場合は違反 0", () => {
    const ctx = new MemoryContext(
      "/repo",
      {
        "src/common/commands/agentdev/demo.md": "---\ndescription: c\n---\n",
        "src/common/skills/agentdev-workflow-demo/SKILL.md":
          "---\nname: agentdev-workflow-demo\ndescription: s\n---\n",
        ".agentdev/extensions/skills/agentdev-workflow-demo.yaml": extYaml("workflow-extension", "agentdev-workflow-demo"),
      },
      [],
    );
    expect(ir056.check(ctx)).toEqual([]);
  });
});

describe("IR-059: distribution-reference-boundary（実環境実行のスモーク）", () => {
  test("check が例外なく実行できること（違反判定は cli 全量実行で確認）", () => {
    const ctx = new MemoryContext("/repo", { "docs/requirements/REQ-001.md": REQ_MD_OK });
    expect(() => ir059.check(ctx)).not.toThrow();
  });
});

describe("IR-001: 現行 REQ frontmatter id ↔ ファイル名", () => {
  test("正常系: id がファイル名と一致する場合は違反 0", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK,
    });
    expect(ir001.check(ctx)).toEqual([]);
  });

  test("異常系: id がファイル名と不一致の場合は違反 1", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_BAD_ID,
    });
    const violations = ir001.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("does not match filename");
  });
});

describe("IR-002: 現行 REQ 必須 frontmatter fields", () => {
  test("正常系: 必須フィールド揃いは違反 0", () => {
    const ctx = new MemoryContext("/repo", { "docs/requirements/REQ-001.md": REQ_MD_OK });
    expect(ir002.check(ctx)).toEqual([]);
  });

  test("異常系: updated 欠落は違反を報告する", () => {
    const content = REQ_MD_OK.replace('updated: "2026-01-02"\n', "");
    const ctx = new MemoryContext("/repo", { "docs/requirements/REQ-001.md": content });
    const violations = ir002.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("updated");
  });
});

describe("IR-003: Active/廃止 REQ ID 重複", () => {
  test("異常系: active と retired の両方に存在する ID は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK,
      "docs/requirements/retired/REQ-001.md": REQ_MD_OK,
    });
    const violations = ir003.check(ctx);
    expect(violations.some((v) => v.message.includes("both active and retired"))).toBe(true);
  });

  test("正常系: retired への歴史文脈参照は違反にならない", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/retired/REQ-090.md": REQ_MD_OK,
      "docs/guides/charter.md": "# 指針\n\nREQ-090 は retired（廃止）済みである。\n",
    });
    expect(ir003.check(ctx)).toEqual([]);
  });
});

describe("IR-004: REQ index ↔ 現行 REQ 一致", () => {
  test("正常系: README インデックスが実ファイルと一致", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK,
      "docs/requirements/README.md": REQ_README_OK,
    });
    expect(ir004.check(ctx)).toEqual([]);
  });

  test("異常系: README に無い REQ ファイルは違反", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK,
      "docs/requirements/REQ-002.md": REQ_MD_OK,
      "docs/requirements/README.md": REQ_README_OK,
    });
    const violations = ir004.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("REQ-002 exists as file");
  });
});

describe("IR-007: Skill frontmatter name ↔ dir", () => {
  const skillMd = (name: string): string =>
    `---\nname: ${name}\ndescription: sample skill\n---\n\n# sample\n\nUSE FOR: sample\nDO NOT USE FOR: sample2\n`;

  test("正常系: name がディレクトリ名と一致", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md": skillMd("agentdev-sample"),
    });
    expect(ir007.check(ctx)).toEqual([]);
  });

  test("異常系: name がディレクトリ名と不一致", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md": skillMd("agentdev-other"),
    });
    const violations = ir007.check(ctx);
    expect(violations.some((v) => v.message.includes("does not match directory"))).toBe(true);
  });
});

describe("IR-008 / IR-062: パス参照実在", () => {
  test("正常系: 参照先が存在する場合は違反 0", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\n本 skill は `references/notes.md` を参照する（対象 skill は agentdev-sample）。\n",
      "src/common/skills/agentdev-sample/references/notes.md": "# notes\n",
    });
    expect(ir008.check(ctx)).toEqual([]);
  });

  test("異常系: 参照先が存在しない場合は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\n本 skill は `references/absent.md` を参照する（対象 skill は agentdev-sample）。\n",
    });
    const violations = ir008.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("Referenced path does not exist");
  });

  test("IR-062: command 本文の未解決パス参照は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/commands/agentdev/sample.md":
        "---\ndescription: c\n---\n\n# sample\n\n実行スクリプトは `scripts/sample.ts` にある。\n",
    });
    const violations = ir062.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.ruleId).toBe("IR-062");
  });
});

describe("IR-013: 完了報告種別実在", () => {
  test("異常系: 実在しない variant path 参照は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/commands/agentdev/sample.md":
        "---\ndescription: c\n---\n\n完了報告は completion-reports/default/report.md を参照する。\n",
    });
    const violations = ir013.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("references 'completion-reports/default/report.md'");
  });

  test("正常系: 参照先が実在する場合は違反 0", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/commands/agentdev/sample.md":
        "---\ndescription: c\n---\n\n完了報告は completion-reports/default/report.md を参照する。\n",
      "docs/commands/completion-reports/default/report.md": "# report\n",
    });
    expect(ir013.check(ctx)).toEqual([]);
  });
});

describe("IR-024: Command README ↔ 実体", () => {
  test("正常系: README 表と command 実体が一致", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/commands/agentdev/sample.md": "---\ndescription: c\n---\n",
      "src/common/commands/agentdev/README.md": "| `sample` |\n|---|\n",
    });
    expect(ir024.check(ctx)).toEqual([]);
  });

  test("異常系: README 表に無い command ファイルは違反", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/commands/agentdev/sample.md": "---\ndescription: c\n---\n",
      "src/common/commands/agentdev/other.md": "---\ndescription: c2\n---\n",
      "src/common/commands/agentdev/README.md": "| `sample` |\n|---|\n",
    });
    const violations = ir024.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("other.md exists but not listed");
  });
});

describe("IR-044: REQ/Design 境界違反検出", () => {
  test("異常系: 要件行の Step number シグナルは warning", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK.replace(
        "| REQ-001-001 | サンプル要件 | 判定可能 | TS-001 |",
        "| REQ-001-001 | Step 3 で実行する | 判定可能 | TS-001 |",
      ),
    });
    const violations = ir044.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.severity).toBe("warning");
  });

  test("正常系: 様式外の行は対象外", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK,
    });
    expect(ir044.check(ctx)).toEqual([]);
  });
});

describe("IR-053: gh 直接記述検出", () => {
  test("異常系: gh issue create の直接記述は warning", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\n`gh issue create` を実行する。\n",
    });
    const violations = ir053.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.severity).toBe("warning");
  });

  test("正常系: 否定文脈は許容", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\n`gh issue view` は発行しない。\n",
    });
    expect(ir053.check(ctx)).toEqual([]);
  });
});

describe("IR-055: runtime-unresolved-reference", () => {
  test("異常系: 配布物内の具体 REQ 行 ID 参照は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\n詳細は REQ-122-005 を参照する。\n",
    });
    const violations = ir055.check(ctx);
    expect(violations.some((v) => v.message.includes("REQ-NNNN-NNN"))).toBe(true);
  });

  test("正常系: v2: 歴史 ADR 参照とコードブロック内は対象外", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\n```md\nREQ-122-005\n```\n\nv2:ADR-0105 は歴史参照。\n",
    });
    expect(ir055.check(ctx)).toEqual([]);
  });
});

describe("IR-063: common-policy-identifier-invariant", () => {
  const registry =
    "- **POL-sample**: サンプル識別子\n- **POL-other**: 別の識別子\n";

  test("異常系: registry 未定義の POL- 参照は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-command-authoring/references/common-policy-identifiers.md": registry,
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\nPOL-unknown を使用する。\n",
    });
    const violations = ir063.check(ctx);
    expect(violations.some((v) => v.message.includes("Undefined common policy identifier reference: POL-unknown"))).toBe(true);
  });

  test("正常系: 定義済み参照は違反 0", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-command-authoring/references/common-policy-identifiers.md": registry,
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\n`POL-sample` を使用する。\n",
    });
    expect(ir063.check(ctx)).toEqual([]);
  });
});

describe("IR-064: unresolved-placeholder", () => {
  test("異常系: 配布物本文の TODO マーカーは違反", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\nTODO 後で書く。\n",
    });
    const violations = ir064.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("TODO-family marker");
  });

  test("正常系: code span 内とテンプレート領域は許容", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\n`TODO` は語彙列挙。`REQ-{NNNN}` は括弧内（REQ-{NNNN}-{NNN}）。\n",
      "src/common/skills/agentdev-sample/templates/note.md": "TODO template\n",
    });
    expect(ir064.check(ctx)).toEqual([]);
  });
});

describe("IR-067: referenced-req-row-existence", () => {
  test("異常系: 実在しない REQ 行 ID の引用は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK,
      "docs/guides/charter.md": "# 指針\n\nREQ-001-999 を参照する。\n",
    });
    const violations = ir067.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("Phantom REQ row citation 'REQ-001-999'");
  });

  test("正常系: 実在する行 ID の引用は違反 0", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK,
      "docs/guides/charter.md": "# 指針\n\nREQ-001-001 を参照する。\n",
    });
    expect(ir067.check(ctx)).toEqual([]);
  });
});

describe("IR-068: skill-projection-manifest", () => {
  const skillMd = (name: string): string =>
    `---\nname: ${name}\ndescription: sample skill\n---\n\nUSE FOR: sample\n`;
  const manifestYaml = (copy: string): string =>
    `schema_version: 1\ngenerated_at: 2026-11-18\n\nskills:\n  - agentdev-sample\n\nthird_party_skills:\n  - explainer\n${copy}`;

  test("異常系: manifest 未掲載の src skill は違反", () => {
    const ctx = new MemoryContext(
      "/repo",
      {
        ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml": manifestYaml(""),
        "src/common/skills/agentdev-sample/SKILL.md": skillMd("agentdev-sample"),
        "src/common/skills/agentdev-other/SKILL.md": skillMd("agentdev-other"),
      },
      [],
      ["src/common/skills", ".opencode/skills"],
    );
    const violations = ir068.check(ctx);
    expect(violations.some((v) => v.message.includes("agentdev-other"))).toBe(true);
  });

  test("正常系: copy_projections 登録エントリが両側実在する場合は違反 0", () => {
    const ctx = new MemoryContext(
      "/repo",
      {
        ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml": manifestYaml(
          "copy_projections:\n  - canonical: src/common/skills/repo-agentdev-integrity\n    projection: .opencode/skills/repo-agentdev-integrity\n",
        ),
        "src/common/skills/agentdev-sample/SKILL.md": skillMd("agentdev-sample"),
        ".opencode/skills/agentdev-sample/SKILL.md": skillMd("agentdev-sample"),
        "src/common/skills/repo-agentdev-integrity/engine/types.ts": "export const a = 1;\n",
        ".opencode/skills/repo-agentdev-integrity/engine/types.ts": "export const a = 1;\n",
      },
      [],
      ["src/common/skills", ".opencode/skills"],
    );
    expect(ir068.check(ctx)).toEqual([]);
  });
});

describe("IR-069: req-number-gap-recorded", () => {
  test("異常系: 無記録欠番は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK,
      "docs/requirements/REQ-003.md": REQ_MD_OK.replace("REQ-001", "REQ-003"),
      "docs/requirements/REQ-004.md": REQ_MD_OK.replace("REQ-001", "REQ-004"),
      "docs/requirements/README.md": "# 要件\n",
      "docs/README.md": "# docs\n",
    });
    const violations = ir069.check(ctx);
    expect(violations.some((v) => v.message.includes("REQ-002"))).toBe(true);
  });

  test("正常系: 欠番明記行がある場合は違反 0", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/requirements/REQ-001.md": REQ_MD_OK,
      "docs/requirements/REQ-003.md": REQ_MD_OK.replace("REQ-001", "REQ-003"),
      "docs/requirements/REQ-004.md": REQ_MD_OK.replace("REQ-001", "REQ-004"),
      "docs/requirements/README.md": "# 要件\n\n欠番: REQ-002 は共有予約枠である。\n",
      "docs/README.md": "# docs\n\n欠番: REQ-002 は共有予約枠である。\n",
    });
    expect(ir069.check(ctx)).toEqual([]);
  });
});

describe("IR-070: design-frontmatter-required-keys", () => {
  test("異常系: updated 欠落は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/designs/integrity/sample.md": "---\ntitle: sample\nstatus: accepted\ncreated: 2026-01-01\n---\n\n# sample\n",
    });
    const violations = ir070.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("updated");
  });

  test("正常系: 必須キー揃いは違反 0", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/designs/integrity/sample.md": "---\ntitle: sample\nstatus: accepted\ncreated: 2026-01-01\nupdated: 2026-01-02\n---\n\n# sample\n",
    });
    expect(ir070.check(ctx)).toEqual([]);
  });
});

describe("IR-071: integrity-rule-related-req-existence", () => {
  test("異常系: 実在しない related_req は違反", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/designs/integrity/rules/IR-001-req-frontmatter-id-filename.md":
        "---\ntitle: IR-001\nstatus: accepted\ncreated: 2026-01-01\nupdated: 2026-01-01\ndetection_method_class: machine-check\n---\n\n# IR-001: sample\n\n| related_req | [REQ-010-999] |\n|---|---|\n",
    });
    const violations = ir071.check(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("Phantom related_req 'REQ-010-999'");
  });

  test("正常系: 実在する related_req は違反 0", () => {
    const ctx = new MemoryContext("/repo", {
      "docs/designs/integrity/rules/IR-001-req-frontmatter-id-filename.md":
        "---\ntitle: IR-001\nstatus: accepted\ncreated: 2026-01-01\nupdated: 2026-01-01\ndetection_method_class: machine-check\n---\n\n# IR-001: sample\n\n| related_req | [REQ-001-001] |\n|---|---|\n",
      "docs/requirements/REQ-001.md": REQ_MD_OK,
    });
    expect(ir071.check(ctx)).toEqual([]);
  });
});

describe("保持能力の回帰: known-corruption-literal（REQ-010-083）", () => {
  test("異常系: 既知混入形リテラルの確定一致を検出する", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\n状態を卡outする。\n",
    });
    const violations = checkKnownCorruptionLiterals(ctx);
    expect(violations.length).toBe(1);
    expect(violations[0]?.message).toContain("REQ-010-083");
  });

  test("正常系: 正規片仮名語（カード）は確定一致しない", () => {
    const ctx = new MemoryContext("/repo", {
      "src/common/skills/agentdev-sample/SKILL.md":
        "---\nname: agentdev-sample\ndescription: s\n---\n\nカードを使う。\n",
    });
    const violations = checkKnownCorruptionLiterals(ctx);
    expect(violations.length).toBe(0);
  });
});

describe("保持能力の回帰: sidecar 重複キー検出（REQ-117-006）", () => {
  const validSidecar =
    "component: test-component\nimplementation:\n  src/example/impl.ts:\n  - REQ-001-001\n";
  const duplicateSidecar =
    "component: test-component\nimplementation:\n  src/example/impl.ts:\n  - REQ-001-001\n  - REQ-001-002\nimplementation:\n  src/example/other.ts:\n  - REQ-001-003\n";

  test("重複キーを含む sidecar で detectDuplicateSidecarKeys が検出する", () => {
    const dups = detectDuplicateSidecarKeys(duplicateSidecar);
    expect(dups.length).toBe(1);
    expect(dups[0]?.key).toBe("implementation");
    expect(dups[0]?.line).toBe(6);
  });

  test("重複キーなしの sidecar は検出 0 件", () => {
    expect(detectDuplicateSidecarKeys(validSidecar).length).toBe(0);
  });

  test("parseSidecar が重複キーを issues として報告する", () => {
    const result = parseSidecar("traceability/test.yaml", duplicateSidecar);
    const dupIssues = result.issues.filter((i) => i.detail.includes("重複キー"));
    expect(dupIssues.length).toBe(1);
    expect(dupIssues[0]?.reason).toBe("invalid-schema");
  });
});
