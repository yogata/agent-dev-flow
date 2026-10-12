/** CLI: apply a transition record with single-execution control. Prints the apply result JSON to stdout.
 * Technical failures (invalid input, corrupted existing state, write failure) exit non-zero and never report success. */
import { applyRecord } from "../lib/store.ts";
import { parseTwoArgArgv, readJsonInput } from "../lib/cli.ts";

async function main(): Promise<void> {
  const { dir, input } = parseTwoArgArgv(process.argv.slice(2));
  const value = await readJsonInput(input);
  const applied = await applyRecord(dir, value);
  process.stdout.write(`${JSON.stringify(applied)}\n`);
}

main().catch((cause: unknown) => {
  process.stderr.write(`apply failed: ${cause instanceof Error ? cause.message : String(cause)}\n`);
  process.exit(1);
});
