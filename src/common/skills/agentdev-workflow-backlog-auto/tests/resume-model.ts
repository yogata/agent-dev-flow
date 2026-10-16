// case-open は case-auto 側の既存確認・再利用契約の fake。実運転の成立確認は下位 workflow が担う。
// plain object の保存状態だけを扱い、disk の原子性や外部 adapter の動作を証明しない。
export const operations = ["review", "baseline", "define", "case-open", "run", "judge", "release"] as const;
export type Operation = (typeof operations)[number];

export interface ResumeState {
  readonly setId: string;
  readonly progress: Partial<Record<Operation, "done" | "interrupted" | "held">>;
  readonly artifacts: {
    readonly reqDoc: string | null;
    readonly issue: string | null;
  };
  readonly creationLog: readonly string[];
  readonly completed: boolean;
}

export function executeE2e(saved: ResumeState, stop?: { readonly at: Operation; readonly window: "completed" | "effect" }) {
  let state = structuredClone(saved);
  const executed: Operation[] = [];
  const created: string[] = [];
  for (const operation of operations) {
    if (state.progress[operation] === "done") continue;
    executed.push(operation);
    switch (operation) {
      case "define":
        if (state.artifacts.reqDoc === null) {
          const id = `${state.setId}/reqdoc`;
          state = { ...state, artifacts: { ...state.artifacts, reqDoc: id } };
          created.push(id);
        }
        break;
      case "case-open":
        if (state.artifacts.issue === null) {
          const id = `${state.setId}/issue`;
          state = { ...state, artifacts: { ...state.artifacts, issue: id } };
          created.push(id);
        }
        break;
      case "review":
      case "baseline":
      case "run":
      case "judge":
      case "release":
        break;
      default: {
        const exhaustive: never = operation;
        return exhaustive;
      }
    }
    if (stop?.at === operation && stop.window === "effect") {
      state = { ...state, progress: { ...state.progress, [operation]: "interrupted" } };
      break;
    }
    state = { ...state, progress: { ...state.progress, [operation]: "done" },
      completed: state.completed || operation === "judge" };
    if (stop?.at === operation) break;
  }
  state = { ...state, creationLog: [...state.creationLog, ...created] };
  return { state, executed, created };
}
