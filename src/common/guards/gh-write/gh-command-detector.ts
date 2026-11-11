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

// gh api の副作用分類境界（Design custom-tool-contracts.md「迂回防止」節の4分類）。
// (1) 明示的な書込みメソッド指定（-X / --method の POST・PATCH・PUT・DELETE）を含む
//     gh api は既存パターン「gh api WRITE method」で拒否する（segment 分類も同等判定を保持）。
// (2) フィールド系・入力系オプション（-f/--raw-field、-F/--field、--input 等）を含み、
//     明示的な GET 指定を含まない gh api は暗黙 POST として拒否する
//     （gh CLI の既定動作: パラメータ追加時の既定メソッドは POST に切替わる）。
// (3) 明示的な GET 指定と併用するフィールド系オプションは読み取りとして許容する
//     （gh CLI は --method GET 指定時パラメータをクエリ文字列として送る）。
// (4) 判定要素の解析が不能または曖昧な組合せは書込み側に分類して拒否する
//     （over-block 許容・under-block 不許容）。
// トークン解釈はシェル引用符の意味論に従う: 引用符はトークン分割のみに影響し
// フラグ解釈には影響しないため、引用符付きフラグ（'-f'、"-X" 等）も引用符なしと
// 同一に判定する。一方、引用符内に含まれる値は単一トークンとしてまとまり、
// 値の内部の文字列（'body=x --method GET' 等）はフラグ・メソッド指定として
// 解釈しない。閉じられていない引用符は解析不能として分類 (4) の曖昧 block に倒す。
// 単発 &（バックグラウンド実行演算子）も &&・||・;・| と同様にコマンド区切りとして
// 扱い、各セグメントを独立分類する。
const GH_API_COMMAND_RE = /\bgh\s+api\b/;
const GH_API_SEGMENT_SPLIT_RE = /\s*(?:&&|\|\||;|\||&)\s*/;
const GH_API_WRITE_METHOD_RE = /^(?:POST|PATCH|PUT|DELETE)$/i;
const GH_API_GET_METHOD_RE = /^GET$/i;

type MethodKind = "get" | "write" | "ambiguous";

function classifyMethodValue(value: string): MethodKind {
  if (GH_API_GET_METHOD_RE.test(value)) return "get";
  if (GH_API_WRITE_METHOD_RE.test(value)) return "write";
  return "ambiguous";
}

/**
 * トークンがメソッド指定（--method / -X）ならその値の分類を返す。
 * メソッド指定でないトークンは null。値が取れない指定は曖昧（分類 (4)）とする。
 */
function methodSpecKind(token: string, nextToken: string | undefined): MethodKind | null {
  if (token === "--method" || token === "-X") {
    return nextToken === undefined ? "ambiguous" : classifyMethodValue(nextToken);
  }
  const equalsForm = token.match(/^--method=(.*)$/);
  if (equalsForm !== null) return classifyMethodValue(equalsForm[1] ?? "");
  const combinedForm = token.match(/^-X(\S+)$/);
  if (combinedForm !== null) return classifyMethodValue(combinedForm[1] ?? "");
  return null;
}

/** フィールド系・入力系オプション（Design 分類 (2) の判定要素）かどうか。 */
function isFieldInputOption(token: string): boolean {
  return (
    token === "-f" ||
    token === "-F" ||
    token === "--raw-field" ||
    token === "--field" ||
    token === "--input" ||
    /^--(?:raw-field|field|input)=/.test(token) ||
    /^-[fF][A-Za-z0-9]/.test(token)
  );
}

/** gh api 引数トークン列を Design 分類境界（4分類）に従い判定する。 */
function classifyGhApiArgs(
  tokens: readonly string[],
): { kind: "block"; rule: string } | { kind: "read" } {
  let explicitGet = false;
  let hasFieldInput = false;
  for (let index = 0; index < tokens.length; index++) {
    const method = methodSpecKind(tokens[index] ?? "", tokens[index + 1]);
    if (method !== null) {
      if (method === "write") return { kind: "block", rule: "gh api WRITE method" };
      if (method === "ambiguous") return { kind: "block", rule: "gh api ambiguous" };
      explicitGet = true;
      continue;
    }
    if (isFieldInputOption(tokens[index] ?? "")) hasFieldInput = true;
  }
  if (hasFieldInput && !explicitGet) {
    return { kind: "block", rule: "gh api implicit POST" };
  }
  return { kind: "read" };
}

/** セグメント文字列から gh api コマンドの引数部分を切り出す。gh api を含まなければ null。 */
function extractGhApiArgs(segment: string): string | null {
  const match = segment.match(GH_API_COMMAND_RE);
  if (match === null || match.index === undefined) return null;
  return segment.slice(match.index + match[0].length);
}

/**
 * シェル引用符の意味論に従い引数部分をトークン化する。
 * 引用符はトークン分割のみに影響しフラグ解釈には影響しないため引用符文字は除去し、
 * 引用符内の値は空白を含めて単一トークンにまとめる（値の内部はフラグとして解釈されない）。
 * 閉じられていない引用符は解析不能として unterminated で報告する。
 */
function tokenizeSegmentArgs(args: string): { tokens: readonly string[]; unterminated: boolean } {
  const tokens: string[] = [];
  let current = "";
  let hasCurrent = false;
  let quote: '"' | "'" | null = null;
  for (const character of args) {
    if (quote !== null) {
      if (character === quote) {
        quote = null;
      } else {
        current += character;
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      hasCurrent = true;
      continue;
    }
    if (/\s/.test(character)) {
      if (hasCurrent) tokens.push(current);
      current = "";
      hasCurrent = false;
      continue;
    }
    current += character;
    hasCurrent = true;
  }
  if (quote !== null) return { tokens: [], unterminated: true };
  if (hasCurrent) tokens.push(current);
  return { tokens, unterminated: false };
}

/**
 * 1行を複合シェル構文（&&、||、;、|、単発 &）で分割し、gh api を含むセグメントを
 * Design 分類境界に従い判定する。block すべきセグメントがあればその判定を返す。
 */
function detectGhApiBoundary(line: string): GhWriteVerdict | null {
  for (const segment of line.split(GH_API_SEGMENT_SPLIT_RE)) {
    const args = extractGhApiArgs(segment);
    if (args === null) continue;
    const tokenized = tokenizeSegmentArgs(args.trim());
    if (tokenized.unterminated) {
      return { kind: "block", command: segment.trim(), rule: "gh api ambiguous" };
    }
    const classification = classifyGhApiArgs(tokenized.tokens);
    if (classification.kind === "block") {
      return { kind: "block", command: segment.trim(), rule: classification.rule };
    }
  }
  return null;
}

/** コマンド文字列から生 gh WRITE を検出する。行単位で判定する。 */
export function detectGhWriteCommand(command: string): GhWriteVerdict {
  for (const line of command.split(/\r?\n/)) {
    for (const pattern of GH_WRITE_PATTERNS) {
      if (pattern.re.test(line)) {
        return { kind: "block", command: line.trim(), rule: pattern.rule };
      }
    }
    const ghApiVerdict = detectGhApiBoundary(line);
    if (ghApiVerdict !== null) return ghApiVerdict;
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
