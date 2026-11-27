import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = mkdtempSync(join(tmpdir(), "adf-4232-case-"));
const repo = join(root, "repo");
mkdirSync(repo);
const entry = resolve("src/common/skills/agentdev-workflow-case-auto/scripts/src/preparation.ts");
function git(cwd: string, ...args: string[]) {
  const result = Bun.spawnSync(["git", "-C", cwd, ...args]);
  assert.equal(result.exitCode, 0, result.stderr.toString());
  return result.stdout.toString().trim();
}
git(repo, "init", "--initial-branch=main");
git(repo, "config", "user.name", "Isolated ADF test");
git(repo, "config", "user.email", "fixture@example.invalid");
git(repo, "config", "core.autocrlf", "false");
writeFileSync(join(repo, "base.txt"), "base\n");
git(repo, "add", "base.txt");
git(repo, "commit", "-m", "Base");
const base = git(repo, "rev-parse", "HEAD");
const paths = ["src/codex/mapping.txt", "src/antigravity/mapping.txt", ".agentdev/config/github-route.json"];
const preparations = paths.map((path, i) => ({
  id: "2/" + (i + 1), issue: "2", baseSha: base, definitionConfirmed: true,
  independentOfUnmergedChanges: true, contractReflectionConfirmed: true,
  writePaths: [path], readPaths: [], tests: ["verify:" + path],
}));
const directories = paths.map((_, i) => join(root, "prep-" + i));
for (const [i, dir] of directories.entries()) git(repo, "worktree", "add", "-b", "prep-" + i, dir, base);
const closeDir = join(root, "close");
git(repo, "worktree", "add", "-b", "case-close", closeDir, base);

function decision(mode: string, input: unknown) {
  const result = Bun.spawnSync(["bun", "run", entry, mode], { stdin: Buffer.from(JSON.stringify(input)) });
  assert.equal(result.exitCode, 0, result.stderr.toString());
  return JSON.parse(result.stdout.toString());
}
const start = Date.now();
const close = { kind: "case-close", id: "close", issue: "epic", coveredIssues: ["1"],
  readPaths: ["previous.txt"], writePaths: ["previous.txt"] };
const records = [{ issue: "1", status: "outcome-determined", outcome: "pass",
  ownRequiredConditionsMet: true, acceptance: { closeAllowed: true } }];
const snapshot = { nowMs: start, lastStartMs: null as number | null, observationComplete: true,
  baseSha: base, active: [] as unknown[], records: [] as typeof records, closing: close as typeof close | undefined,
  formal: [{ issue: "2", dependsOn: ["1"], contractReflectionConfirmed: true, readPaths: [], writePaths: paths }],
  preparations, attemptedPreparations: [] as string[], protectedPaths: ["src/distribution/files.json"] };

const worker = `
  import {mkdirSync,writeFileSync,readFileSync} from "node:fs";
  import {dirname} from "node:path";
  const [path,deadline]=Bun.argv.slice(1);
  await Bun.sleep(Math.max(0,Number(deadline)-Date.now()));
  if (dirname(path) !== ".") mkdirSync(dirname(path),{recursive:true});
  writeFileSync(path,"result\\n");
  if(readFileSync(path,"utf8")!=="result\\n") process.exit(2);
  for(const args of [["add","--",path],["commit","-m","Fixture work"]])
    if(Bun.spawnSync(["git",...args]).exitCode!==0) process.exit(3);
`;
const timeline: { kind: string; id: string; at: number; end?: number }[] = [];
const tasks: ReturnType<typeof Bun.spawn>[] = [];
function launch(kind: string, id: string, cwd: string, path: string, deadline: number) {
  const at = Date.now();
  const event: typeof timeline[number] = {kind, id, at};
  if (timeline.length) assert(at - timeline.at(-1)!.at >= 10_000);
  timeline.push(event);
  snapshot.lastStartMs = at;
  const handle = Bun.spawn(["bun", "-e", worker, path, String(deadline)], { cwd });
  tasks.push(handle);
  void handle.exited.then(() => { event.end = Date.now(); });
  return handle;
}
assert.equal(decision("plan", snapshot).kind, "case-close");
launch("case-close", "close", closeDir, "previous.txt", start + 38_000);
snapshot.closing = undefined;
snapshot.active.push(close);
for (const [i, preparation] of preparations.entries()) {
  snapshot.nowMs = Date.now();
  const wait = decision("plan", snapshot);
  assert.equal(wait.reason, "start-interval");
  await Bun.sleep(Math.max(0, wait.retryAtMs - Date.now()));
  snapshot.nowMs = Date.now();
  const selection = decision("plan", snapshot);
  assert.equal(selection.kind, "preparation");
  assert.equal(selection.preparation.id, preparation.id);
  launch("preparation", preparation.id, directories[i], paths[i], start + 35_000);
  snapshot.active.push({ ...preparation, kind: "preparation" });
  snapshot.attemptedPreparations.push(preparation.id);
}
assert.equal(timeline.slice(1).filter(event => !event.end).length, 3);
assert.equal(decision("plan", { ...snapshot, nowMs: snapshot.lastStartMs! + 10_000,
  active: [close], preparations: [] }).kind, "wait");
assert.deepEqual(await Promise.all(tasks.map(task => task.exited)), [0, 0, 0, 0]);
git(repo, "merge", "--ff-only", "case-close");
timeline[0].end = Date.now();
const officialBase = git(repo, "rev-parse", "HEAD");
snapshot.baseSha = officialBase;
snapshot.records = records;
snapshot.active = [];
await Bun.sleep(Math.max(0, snapshot.lastStartMs! + 10_000 - Date.now()));
snapshot.nowMs = Date.now();
assert.deepEqual(decision("plan", snapshot), { kind: "case-run", issue: "2" });
timeline.push({ kind: "case-run", id: "2", at: Date.now() });
const upstream = git(repo, "diff", "--name-only", base, officialBase).split("\n");
for (const [i, preparation] of preparations.entries()) {
  const commit = git(directories[i], "rev-parse", "HEAD");
  git(repo, "merge-base", "--is-ancestor", base, commit);
  const receipt = { verifiedBaseSha: base, commitSha: commit,
    changedPaths: git(repo, "diff", "--name-only", base, commit).split("\n"),
    passedTests: preparation.tests, officialBaseSha: officialBase,
    baseChangedPaths: upstream, protectedPaths: [] };
  assert.equal(decision("verify", { preparation, receipt }).reusable, true);
  assert.equal(decision("verify", { preparation, receipt: { ...receipt, changedPaths: ["README.md"] } }).reusable, false);
  git(repo, "cherry-pick", commit);
  assert.equal(await Bun.file(join(repo, paths[i])).text(), "result\n");
}
const summary = {
  timeline: timeline.map(({at,end,...rest}) => ({...rest, startMs: at-start, endMs: end ? end-start : null})),
  intervalsMs: timeline.slice(1).map((event,i) => event.at-timeline[i].at),
  maxConcurrent: Math.max(...timeline.map(({at}) => timeline.filter(t => t.at <= at && (!t.end || t.end > at)).length)),
  allPreparationsOverlapClose: timeline.slice(1,4).every(event => event.at < timeline[0].end!),
  formalAfterClose: timeline[4].at >= timeline[0].end!,
  integrated: preparations.length,
};
assert(summary.allPreparationsOverlapClose && summary.formalAfterClose && summary.maxConcurrent <= 5);
assert(summary.intervalsMs.every(interval => interval >= 10000));
console.log(JSON.stringify(summary, null, 2));
