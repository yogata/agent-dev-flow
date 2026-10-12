/**
 * Shared CLI helpers: argv parsing via the standard API (node:util parseArgs,
 * standard-API delegation) and JSON input reading from a file path or stdin ("-").
 */
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";

export interface TwoArgOptions {
  readonly dir: string;
  readonly input: string;
}

export interface OneArgOptions {
  readonly input: string;
}

export function parseTwoArgArgv(argv: readonly string[]): TwoArgOptions {
  const { values } = parseArgs({
    args: [...argv],
    options: {
      dir: { type: "string" },
      input: { type: "string" },
    },
  });
  if (typeof values.dir !== "string" || values.dir.length === 0) {
    throw new Error("--dir is required");
  }
  if (typeof values.input !== "string" || values.input.length === 0) {
    throw new Error("--input is required (JSON file path, or - for stdin)");
  }
  return { dir: values.dir, input: values.input };
}

export function parseOneArgArgv(argv: readonly string[]): OneArgOptions {
  const { values } = parseArgs({
    args: [...argv],
    options: {
      input: { type: "string" },
    },
  });
  if (typeof values.input !== "string" || values.input.length === 0) {
    throw new Error("--input is required (JSON file path, or - for stdin)");
  }
  return { input: values.input };
}

export function parseLookupArgv(argv: readonly string[]): { dir: string; key: string } {
  const { values } = parseArgs({
    args: [...argv],
    options: {
      dir: { type: "string" },
      key: { type: "string" },
    },
  });
  if (typeof values.dir !== "string" || values.dir.length === 0) {
    throw new Error("--dir is required");
  }
  if (typeof values.key !== "string" || values.key.length === 0) {
    throw new Error("--key is required (idempotency key of the transition)");
  }
  return { dir: values.dir, key: values.key };
}

/** Read JSON from a file path or from stdin when the path is "-". */
export async function readJsonInput(input: string): Promise<unknown> {
  const content = input === "-" ? await readStdin() : await readFile(input, "utf8");
  return JSON.parse(content) as unknown;
}

async function readStdin(): Promise<string> {
  const decoder = new TextDecoder();
  let content = "";
  for await (const chunk of Bun.stdin.stream()) {
    content += decoder.decode(chunk, { stream: true });
  }
  return content;
}
