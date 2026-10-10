// YAML 解析の共通ラッパ。Bun 標準 API（Bun.YAML.parse）へ委譲する。
// 保証サブセット（anchor、alias、カスタムタグ、複数ドキュメントを除く）は
// Bun.YAML の仕様に従う。

export function parse(content: string): Record<string, unknown> | null {
  const parsed = Bun.YAML.parse(content) as unknown;
  if (parsed === null || parsed === undefined) return null;
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("YAML の解析結果がオブジェクトでない");
  }
  return parsed as Record<string, unknown>;
}

export function parseOrThrow(content: string, message: string): Record<string, unknown> {
  try {
    return parse(content) ?? {};
  } catch (error) {
    throw new Error(`${message}: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}
