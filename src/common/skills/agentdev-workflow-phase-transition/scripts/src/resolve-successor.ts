/** CLI: resolve successor candidates (0 -> terminal, 1 -> unique, 2+ -> ambiguous). Prints the resolution JSON to stdout. */
import { parseSuccessorInput, resolveSuccessor } from "../lib/successor.ts";
import { parseOneArgArgv, readJsonInput } from "../lib/cli.ts";

async function main(): Promise<void> {
  const { input } = parseOneArgArgv(process.argv.slice(2));
  const value = await readJsonInput(input);
  const parsed = parseSuccessorInput(value);
  if (!parsed.ok) {
    process.stderr.write(`resolve-successor failed: ${parsed.reason}\n`);
    process.exit(1);
  }
  const resolution = resolveSuccessor(parsed.candidates);
  process.stdout.write(`${JSON.stringify(resolution)}\n`);
}

main().catch((cause: unknown) => {
  process.stderr.write(`resolve-successor failed: ${cause instanceof Error ? cause.message : String(cause)}\n`);
  process.exit(1);
});
