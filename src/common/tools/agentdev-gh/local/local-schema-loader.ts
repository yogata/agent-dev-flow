// agentdev-gh Local 実装の case-schema rules yaml 実行時消費（REQ-047-012、G-007 解消）。
//
// case-schema/rules/{status,labels,headings}.yaml はローカルIssueの role 条件付き
// スキーマの操作用定義である。本モジュールが当該 yaml を runtime で読み込み、
// runner-local.ts の実行時強制箇所（status 値域、labels 値域、終端状態、本文見出し）
// が当該定義を消費する。yaml 欠損・スキーマ不適合時は fail-closed で throw する
// （宣言的データ読込原則、silent skip 禁止）。
//
// 正本: docs/designs/local/local-case-file.md。本 yaml と矛盾してはならない。
import * as fs from "node:fs";
import * as path from "node:path";

export interface LocalCaseSchema {
  /** role: tracking の status 値域（tracking_status_enum）。 */
  readonly trackingStatusValues: readonly string[];
  /** role: case の status 値域（case_status_enum）。 */
  readonly caseStatusValues: readonly string[];
  /** role ごとの終端状態（terminal_states）。 */
  readonly terminalStates: Readonly<Record<"tracking" | "case", readonly string[]>>;
  /** role: case の labels 値域（case_label_enum）。 */
  readonly caseLabelValues: readonly string[];
  /** role ごとの本文必須見出し（role_conditional_headings.<role>.required）。 */
  readonly requiredHeadings: Readonly<Record<"tracking" | "case", readonly string[]>>;
  /** role ごとのコメント相当セクション見出し（comment_section）。 */
  readonly commentSections: Readonly<Record<"tracking" | "case", string>>;
  /** case_headings の number → 見出しマップ。 */
  readonly caseHeadingsByNumber: Readonly<Record<number, string>>;
}

function readYamlLines(rulesDir: string, file: string): string[] {
  const filePath = path.join(rulesDir, file);
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    throw new Error(`local case-schema yaml is required at runtime and missing: ${filePath}`);
  }
  return content.split(/\r?\n/);
}

function stripQuotes(v: string): string {
  return v.replace(/^["']|["']$/g, "").trim();
}

interface Section {
  name: string;
  lines: string[];
}

function splitTopLevelSections(lines: string[]): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    const topLevelKey = /^(?!\s)([A-Za-z_][\w]*):\s*(?:#.*)?$/.exec(line);
    if (topLevelKey) {
      const name = topLevelKey[1] as string;
      const section: Section = { name, lines: [] };
      sections.push(section);
      current = section;
      continue;
    }
    if (current) current.lines.push(line);
  }
  return sections;
}

function enumKeysOf(section: Section): string[] {
  const keys: string[] = [];
  for (const line of section.lines) {
    const m = /^\s{2}([A-Za-z][\w-]*):\s*(?:#.*)?$/.exec(line);
    if (m) keys.push(m[1] as string);
  }
  return keys;
}

function listUnderSubKey(section: Section, subKey: string): string[] {
  const out: string[] = [];
  let inSub = false;
  for (const line of section.lines) {
    const sub = new RegExp(`^\\s{2}${subKey}:\\s*(?:#.*)?$`).exec(line);
    if (sub) {
      inSub = true;
      continue;
    }
    if (!inSub) continue;
    const nextSub = /^\s{2}[A-Za-z_][\w-]*:\s*(?:#.*)?$/.exec(line);
    if (nextSub) break;
    const item = /^\s{4}-\s+(.+)$/.exec(line);
    if (item) out.push(stripQuotes(item[1] as string));
  }
  return out;
}

function requiredListUnderSubKey(section: Section, subKey: string): string[] {
  const out: string[] = [];
  let inSub = false;
  for (const line of section.lines) {
    const sub = new RegExp(`^\\s{2}${subKey}:\\s*(?:#.*)?$`).exec(line);
    if (sub) {
      inSub = true;
      continue;
    }
    if (!inSub) continue;
    const nextSub = /^\s{2}[A-Za-z_][\w-]*:\s*(?:#.*)?$/.exec(line);
    if (nextSub) break;
    const item = /^\s{6}-\s+(.+)$/.exec(line);
    if (item) out.push(stripQuotes(item[1] as string));
  }
  return out;
}

function parseStatusYaml(lines: string[]): Pick<
  LocalCaseSchema,
  "trackingStatusValues" | "caseStatusValues" | "terminalStates"
> {
  const sections = splitTopLevelSections(lines);
  const byName = new Map(sections.map((s) => [s.name, s] as const));
  const trackingSection = byName.get("tracking_status_enum");
  const caseSection = byName.get("case_status_enum");
  const terminalSection = byName.get("terminal_states");
  const missing = [
    ["tracking_status_enum", trackingSection],
    ["case_status_enum", caseSection],
    ["terminal_states", terminalSection],
  ].filter(([, s]) => !s).map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(`local case-schema status.yaml missing required sections: ${missing.join(", ")}`);
  }
  const trackingStatusValues = enumKeysOf(trackingSection!);
  const caseStatusValues = enumKeysOf(caseSection!);
  if (trackingStatusValues.length === 0) {
    throw new Error("local case-schema status.yaml tracking_status_enum has no values");
  }
  if (caseStatusValues.length === 0) {
    throw new Error("local case-schema status.yaml case_status_enum has no values");
  }
  return {
    trackingStatusValues,
    caseStatusValues,
    terminalStates: {
      tracking: listUnderSubKey(terminalSection!, "tracking"),
      case: listUnderSubKey(terminalSection!, "case"),
    },
  };
}

function parseLabelsYaml(lines: string[]): Pick<LocalCaseSchema, "caseLabelValues"> {
  const sections = splitTopLevelSections(lines);
  const section = sections.find((s) => s.name === "case_label_enum");
  if (!section) {
    throw new Error("local case-schema labels.yaml missing case_label_enum section");
  }
  const caseLabelValues = enumKeysOf(section);
  if (caseLabelValues.length === 0) {
    throw new Error("local case-schema labels.yaml case_label_enum has no values");
  }
  return { caseLabelValues };
}

function parseHeadingsYaml(lines: string[]): Pick<
  LocalCaseSchema,
  "requiredHeadings" | "commentSections" | "caseHeadingsByNumber"
> {
  const sections = splitTopLevelSections(lines);
  const byName = new Map(sections.map((s) => [s.name, s] as const));
  const conditional = byName.get("role_conditional_headings");
  const caseHeadings = byName.get("case_headings");
  if (!conditional) {
    throw new Error("local case-schema headings.yaml missing role_conditional_headings section");
  }
  const requiredHeadings = {
    tracking: requiredListUnderSubKey(conditional, "tracking"),
    case: requiredListUnderSubKey(conditional, "case"),
  };
  const commentSections = {
    tracking: scalarUnderSubKeyAt(conditional, "tracking", "comment_section"),
    case: scalarUnderSubKeyAt(conditional, "case", "comment_section"),
  };
  if (!commentSections.tracking || !commentSections.case) {
    throw new Error("local case-schema headings.yaml missing comment_section for tracking/case");
  }
  const caseHeadingsByNumber: Record<number, string> = {};
  if (caseHeadings) {
    let currentNumber: number | null = null;
    for (const line of caseHeadings.lines) {
      const num = /^\s{2}-\s+number:\s*(\d+)\s*$/.exec(line);
      if (num) {
        currentNumber = Number(num[1]);
        continue;
      }
      const heading = /^\s+heading:\s*["'](.+?)["']\s*$/.exec(line);
      if (heading && currentNumber !== null) {
        caseHeadingsByNumber[currentNumber] = heading[1] as string;
        currentNumber = null;
      }
    }
  }
  return { requiredHeadings, commentSections, caseHeadingsByNumber };
}

function scalarUnderSubKeyAt(section: Section, subKey: string, field: string): string {
  let inSub = false;
  for (const line of section.lines) {
    const sub = new RegExp(`^\\s{2}${subKey}:\\s*(?:#.*)?$`).exec(line);
    if (sub) {
      inSub = true;
      continue;
    }
    if (!inSub) continue;
    const nextSub = /^\s{2}[A-Za-z_][\w-]*:\s*(?:#.*)?$/.exec(line);
    if (nextSub) break;
    const m = new RegExp(`^\\s{4}${field}:\\s*(.+)$`).exec(line);
    if (m) return stripQuotes((m[1] as string).replace(/\s+#.*$/, ""));
  }
  return "";
}

export function loadLocalCaseSchema(rulesDir: string): LocalCaseSchema {
  const status = parseStatusYaml(readYamlLines(rulesDir, "status.yaml"));
  const labels = parseLabelsYaml(readYamlLines(rulesDir, "labels.yaml"));
  const headings = parseHeadingsYaml(readYamlLines(rulesDir, "headings.yaml"));
  return { ...status, ...labels, ...headings };
}
