/** CLI: look up a transition record by idempotency key. Prints the lookup result JSON to stdout. */
import { lookupRecord } from "../lib/store.ts";
import { parseLookupArgv } from "../lib/cli.ts";

async function main(): Promise<void> {
  const { dir, key } = parseLookupArgv(process.argv.slice(2));
  const lookup = await lookupRecord(dir, key);
  process.stdout.write(`${JSON.stringify(lookup)}\n`);
}

main().catch((cause: unknown) => {
  process.stderr.write(`lookup failed: ${cause instanceof Error ? cause.message : String(cause)}\n`);
  process.exit(1);
});
