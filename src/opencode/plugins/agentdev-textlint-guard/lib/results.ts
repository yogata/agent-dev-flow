// ADF-COVERS(implementation): REQ-053-025, REQ-053-026, REQ-053-027, REQ-053-028, REQ-053-031, REQ-053-033, REQ-053-034
// agentdev-textlint-guard 共通実行基盤: 結果型と整形。
//
// 共通の結果は対象パス、行と列などの位置、rule ID、該当表現または範囲を含む。
// 規則が提供する replacement と guidance を保持し、助言対象を拒否対象と区別する。
// pre-write と最終検査は同一全文、同一パス、同一設定、同一規則で同じ判定を返す
// （両入口は本モジュールの inspect 系関数を共有することで同一性を保証）。

/** 検査メッセージの重大度。textlint の severity 数値（0=info, 1=warning, 2=error）を意味保持した論理値へ写像する。 */
export type Severity = "info" | "advice" | "hard";

/** 拒否対象（hard）と助言対象（advice/info）の区別。hard のみ検査不合格の根拠になる。 */
export function classifySeverity(kernelSeverity: number): Severity {
  if (kernelSeverity >= 2) return "hard";
  if (kernelSeverity === 1) return "advice";
  return "info";
}

/** 1件の検査結果。整形前の共通データ契約（両入口で同一形状）。 */
export interface InspectionFinding {
  /** ルート相対パス（区切りは /）。 */
  readonly path: string;
  readonly line: number;
  readonly column: number;
  /** textlint rule ID（プリケット規則は preset/<rule> 形式）。 */
  readonly ruleId: string;
  /** 規則が返したメッセージ本文（guidance）。 */
  readonly message: string;
  /** 該当表現（範囲テキスト）。範囲が取れない場合は null。 */
  readonly excerpt: string | null;
  /** 規則が提供する置換候補。提供されない場合は null。 */
  readonly replacement: string | null;
  readonly severity: Severity;
}

/** 1ファイル分の検査結果。 */
export interface FileInspectionResult {
  readonly path: string;
  readonly findings: readonly InspectionFinding[];
  readonly hardCount: number;
}

/** 検査全体の結果。 */
export interface InspectionOutcome {
  readonly files: readonly FileInspectionResult[];
  readonly hardCount: number;
}

export function summarizeOutcome(files: readonly FileInspectionResult[]): InspectionOutcome {
  return { files, hardCount: files.reduce((acc, f) => acc + f.hardCount, 0) };
}

/** 該当箇所の抽出。textlint の range（0-based 文字オフセット）から全文テキストを切り出す。 */
export function extractExcerpt(
  text: string,
  range: readonly [number, number] | null,
): string | null {
  if (range === null) return null;
  const [start, end] = range;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start < 0 || end > text.length || start >= end) return null;
  const slice = text.slice(start, end);
  return slice.length > 0 ? slice : null;
}

/** 結果の整形（利用者向け文字列）。対象、位置、rule ID、該当箇所、修正情報を1行に含める。 */
export function formatFinding(finding: InspectionFinding): string {
  const severityLabel = finding.severity === "hard" ? "拒否" : finding.severity === "advice" ? "助言" : "参考";
  const excerpt = finding.excerpt !== null ? ` 該当: ${truncate(finding.excerpt, 60)}` : "";
  const replacement =
    finding.replacement !== null ? ` 修正候補: ${truncate(finding.replacement, 60)}` : "";
  return `${finding.path}:${finding.line}:${finding.column} [${severityLabel}] ${finding.ruleId} ${truncate(
    finding.message,
    160,
  )}${excerpt}${replacement}`;
}

export function formatOutcome(outcome: InspectionOutcome): string {
  const lines: string[] = [];
  for (const file of outcome.files) {
    for (const finding of file.findings) {
      lines.push(formatFinding(finding));
    }
  }
  if (outcome.hardCount > 0) {
    lines.push(`合計 ${outcome.files.length} ファイルを検査し、拒否対象の違反が ${outcome.hardCount} 件あります。`);
  }
  return lines.join("\n");
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}
