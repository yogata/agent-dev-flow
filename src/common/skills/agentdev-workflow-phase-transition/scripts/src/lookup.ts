/** CLI: look up a transition record by idempotency key and, when the record exists, verify the current identity state against it before restoration. Prints the lookup result JSON to stdout. */
import { lookupRecord } from "../lib/store.ts";
import { parseLookupArgv } from "../lib/cli.ts";
import { checkIdentityAgainstRecord, readIdentity } from "../lib/identity.ts";

async function main(): Promise<void> {
  const { dir, key, identityFile } = parseLookupArgv(process.argv.slice(2));
  const lookup = await lookupRecord(dir, key);
  if (lookup.result !== "existing") {
    process.stdout.write(`${JSON.stringify(lookup)}\n`);
    return;
  }
  let identity;
  try {
    identity = await readIdentity(identityFile);
  } catch (cause) {
    // Unreadable identity: the current identity state cannot be verified, so
    // restoration cannot proceed (hold; never treated as consistent).
    process.stdout.write(
      `${JSON.stringify({ result: "error", reason: `identity file is unreadable: ${cause instanceof Error ? cause.message : String(cause)}`, path: identityFile, record: lookup.record })}\n`,
    );
    process.stderr.write("lookup: identity state is unverifiable; operations depending on the transition record must be held\n");
    process.exit(1);
  }
  const check = checkIdentityAgainstRecord(identity, lookup.record);
  if (!check.ok) {
    process.stdout.write(`${JSON.stringify({ result: "mismatch", path: lookup.path, record: lookup.record, identity, reasons: check.reasons })}\n`);
    process.stderr.write("lookup: identity and recorded transition are inconsistent; operations depending on the transition record must be held (resolving the conflict is the user's judgment)\n");
    process.exit(1);
  }
  process.stdout.write(`${JSON.stringify({ result: "existing", record: lookup.record, path: lookup.path, identityCheck: check })}\n`);
}

main().catch((cause: unknown) => {
  process.stderr.write(`lookup failed: ${cause instanceof Error ? cause.message : String(cause)}\n`);
  process.exit(1);
});
