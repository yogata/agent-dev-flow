// gh WRITE 迂回検出器（正規経路迂回防止、決定5）。
//
// Custom Tool（agentdev-gh 等）の正規経路を迂回する生 gh WRITE コマンドを
// コマンド文字列から検出する純関数群。Plugin / Hook（tool.execute.before）が
// 実行前に拒否するために使用する。
//
// 禁止範囲の詳細（読み取り系の許容等を含む）は Design
// `docs/designs/responsibilities/custom-tool-contracts.md`「迂回防止」が所有する。
// 本検出器は over-block を許容し under-block を許さない（迂回防止優先）。


/** 検出結果。block は拒否すべき gh WRITE、allow は検出なし。 */
export type GhWriteVerdict =
  | { readonly kind: "block"; readonly command: string; readonly rule: string }
  | { readonly kind: "allow" };

interface WritePattern {
  readonly re: RegExp;
  readonly rule: string;
}

// gh の WRITE 系サブコマンド。読み取り系（view、list、status、diff、checks 等）
// は Design の許容範囲であり、ここに列挙しない。
const GH_WRITE_PATTERNS: readonly WritePattern[] = [
  {
    re: /\bgh\s+issue\s+(create|edit|close|reopen|comment|delete|pin|unpin|transfer|lock|unlock)\b/,
    rule: "gh issue WRITE",
  },
  {
    re: /\bgh\s+pr\s+(create|edit|merge|close|reopen|ready|review|comment|delete-branch)\b/,
    rule: "gh pr WRITE",
  },
  {
    re: /\bgh\s+api\b[^\n]*?(?:-X|--method)(?:=|\s+)\s*(?:POST|PATCH|PUT|DELETE)\b/i,
    rule: "gh api WRITE method",
  },
  {
    re: /\bgh\s+label\s+(create|edit|delete)\b/,
    rule: "gh label WRITE",
  },
  {
    re: /\bgh\s+release\s+(create|upload|delete|edit)\b/,
    rule: "gh release WRITE",
  },
  {
    re: /\bgh\s+repo\s+(create|edit|delete|archive|unarchive|rename)\b/,
    rule: "gh repo WRITE",
  },
  {
    re: /\bgh\s+workflow\s+run\b/,
    rule: "gh workflow trigger",
  },
  {
    re: /\bgh\s+gist\s+(create|edit|delete)\b/,
    rule: "gh gist WRITE",
  },
  {
    re: /\bgh\s+milestone\s+(create|edit|delete)\b/,
    rule: "gh milestone WRITE",
  },
  {
    re: /\bgh\s+project\s+(create|edit|delete|link|unlink)\b/,
    rule: "gh project WRITE",
  },
];

/** コマンド文字列から生 gh WRITE を検出する。行単位で判定する。 */
export function detectGhWriteCommand(command: string): GhWriteVerdict {
  for (const line of command.split(/\r?\n/)) {
    for (const pattern of GH_WRITE_PATTERNS) {
      if (pattern.re.test(line)) {
        return { kind: "block", command: line.trim(), rule: pattern.rule };
      }
    }
  }
  return { kind: "allow" };
}

/** ブロック時のメッセージ。throw 内容として利用する。 */
export function formatBlockReason(verdict: GhWriteVerdict & { kind: "block" }): string {
  return (
    "agentdev-gh-write-guard: blocked a raw gh WRITE command. " +
    "GitHub side-effect operations must go through the agentdev-gh Custom Tool. " +
    `rule=${verdict.rule} command=${verdict.command}`
  );
}
