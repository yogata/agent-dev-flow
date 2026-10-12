/**
 * 持出し文書の構成検証（持出し確認契約の機械的部分）。
 * - 有効な目的・問い・必要な前提・参照元の4要素が利用者確認できる形で揃っているか
 * - 既知の機密指定情報・認証値のパターンが混入していないか（無断混入の防止）
 * - 本モジュールは送信機能を一切持たない（外部AIへの自動送信を行わない契約の構造的保証）。
 *   出力は検証結果のみであり、送出先・送信操作のフィールドを含まない
 */

export interface HandoffFinding {
  readonly kind: "missing-section" | "secret-pattern";
  readonly detail: string;
  readonly line: number | null;
}

export interface HandoffCheckResult {
  /** 必須4要素が揃っているか。 */
  readonly complete: boolean;
  readonly missing: readonly string[];
  /** 機密パターンの検出。検出時は利用者へ除去と再確認を促す（送信判断は利用者が担う）。 */
  readonly findings: readonly HandoffFinding[];
  readonly result: "ok" | "findings";
  readonly sections: readonly string[];
}

/** 持出し文書の必須セクション見出し。 */
export const REQUIRED_SECTIONS: readonly string[] = ["目的", "問い", "前提", "参照元"];

/** 既知の機密指定情報・認証値のパターン（線形走査で1回だけ走査する）。 */
const SECRET_PATTERNS: readonly { readonly label: string; readonly pattern: RegExp }[] = [
  { label: "OpenAI 様式 API キー", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: "GitHub personal access token (ghp_)", pattern: /\bghp_[A-Za-z0-9]{20,}\b/ },
  { label: "GitHub fine-grained token", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { label: "AWS access key id", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: "Bearer トークン", pattern: /Bearer\s+[A-Za-z0-9._-]{16,}/ },
  { label: "JWT 様式トークン", pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { label: "認証値の代入形", pattern: /\b(api[_-]?key|token|secret|password|passwd|credential)\b\s*[=:]\s*\S+/i },
  { label: "既知の認証環境変数参照", pattern: /\b(CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|ANTHROPIC_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|AWS_SECRET_ACCESS_KEY)\b/ },
];

/**
 * 持出し文書を検証する。
 * - 必須セクション見出し（`## 目的` 等）の存在を確認する
 * - 機密パターンを1回の行走査で検出する
 * - 結果は確認用の報告であり、送信を行わない
 */
export function checkHandoff(text: string): HandoffCheckResult {
  const present = new Set<string>();
  const findings: HandoffFinding[] = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!text.includes(`## ${section}`)) {
      findings.push({ kind: "missing-section", detail: `必須セクション「${section}」が存在しない`, line: null });
    } else {
      present.add(section);
    }
  }
  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined) continue;
    for (const secret of SECRET_PATTERNS) {
      const match = secret.pattern.exec(line);
      if (match !== null) {
        findings.push({
          kind: "secret-pattern",
          detail: `既知の機密パターンを検出した（${secret.label}）。持出し内容から除去し、利用者が再確認すること`,
          line: index + 1,
        });
      }
    }
  }
  const secretFindings = findings.filter((finding) => finding.kind === "secret-pattern");
  return {
    complete: findings.every((finding) => finding.kind !== "missing-section"),
    missing: findings.filter((finding) => finding.kind === "missing-section").map((finding) => finding.detail),
    findings,
    result: secretFindings.length > 0 ? "findings" : "ok",
    sections: [...present],
  };
}
