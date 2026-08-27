// ADF-COVERS(implementation): REQ-052-011, REQ-053-001, REQ-053-002, REQ-053-003, REQ-053-004, REQ-053-005, REQ-053-006, REQ-053-007, REQ-053-008, REQ-053-009, REQ-053-010, REQ-053-011, REQ-053-012, REQ-053-013, REQ-053-014, REQ-053-016, REQ-053-017
// agentdev-model-escalation Plugin（REQ-053、DEC-023、Design foundations/model-escalation-runtime）。
//
// OpenCode セッションの同一性（sessionID・会話履歴）を保持したまま、ターン境界で
// モデルを昇格・復帰する ADF 共通 Plugin。昇格先は .agentdev/agentdev.jsonc の
// modelEscalation キーから解決する。
//
// 責務分離（REQ-053-017）:
//   - モデルは意味的判断（解決困難か、解決したか）のみを担い、要求 tool の呼出のみを行う。
//   - 本 Plugin がセッション識別・ターン境界切替・状態保持・復帰・通知・失敗報告・
//     無限反復防止のすべてを担う。
//
// 不発動契約（Design「Plugin 構成と登録」）:
//   - .agentdev/agentdev.jsonc の読み込み・検証に失敗した場合、機能を発動しない
//     （要求 tool を提供せず、切替を行わない）。
//   - modelEscalation キー不在時も同様に発動しない（REQ-053-002）。
//
// 切替メカニズム（Design「ターン境界切替メカニズム」。OpenCode v1.18.23 の公式フック契約内）:
//   - chat.message フックは user message の永続化前に発火し、output.message は参照渡し。
//     output.message.model = { providerID, modelID, variant } を書換すると、当該ターンの
//     LLM 呼出へ反映される。セッション行は発火前に書込済みのため、昇格状態の間は毎ターン
//     chat.message で書換を再適用する。
//   - 復帰時は昇格直前に実際に使用していたモデル・variant へ戻し、以降の書換を停止する。
//   - 進行中の推論は切替対象外（フックはターン境界でのみ切替を行う）。
//
// 無限反復防止（DEC-023 決定7）:
//   - 状態機械 normal / escalated により重複要求を拒否する。
//   - 同一ターン内の要求は最終要求のみ適用する。escalate 直後の同一ターン内 revert は
//     打ち消され、状態遷移も切替通知も発生しない。
//   - 本 Plugin は自律的に（自動リトライ等で）切替を反復しない。
//
// 外部依存: なし（omo 等の特定ハーネス拡張に依存しない。JSONC は自前で解釈する）。

import { join } from "node:path";
import { readFile } from "node:fs/promises";

// ---------- 型 ----------

/** plugin 入力（@opencode-ai/plugin と同じ形状。消費するフィールドのみ宣言する）。 */
export type PluginInput = {
  readonly worktree: string;
  readonly directory: string;
  readonly project: { readonly worktree: string };
  readonly [key: string]: unknown;
};

/** chat.message フックが渡すターンモデル（provider/model 形式の分解表現）。 */
export type TurnModel = {
  providerID: string;
  modelID: string;
  variant?: string | null;
};

export type EscalationConfig = {
  /** provider/model 形式（例: "zai-coding-plan/glm-5.3"）。 */
  model: string;
  variant: string | undefined;
};

export type Phase = "normal" | "escalated";

/** sessionID 単位で Plugin 実行プロセス内に保持する昇格状態（Design「状態保持」）。 */
export type SessionState = {
  phase: Phase;
  escalationModel: string;
  escalationVariant: string | undefined;
  /** 昇格直前に実際に使用していたモデル・variant（復帰先）。 */
  preModel: string;
  preVariant: string | undefined;
  /** 直近の chat.message フック時に記録した実際のモデル・variant。 */
  currentTurnModel: string;
  currentTurnVariant: string | undefined;
  /** 同一ターン内の未適用要求（ターン境界で消費される）。 */
  pending: "escalate" | "revert" | null;
  /** 次の experimental.chat.system.transform で注入する一行（補助通知）。 */
  systemNote: string | null;
};

export type RequestVerdict =
  | { kind: "accepted"; line: string; pending: "escalate" | "revert" }
  | { kind: "rejected"; line: string }
  | { kind: "failed"; line: string }
  | { kind: "cancelled"; line: string };

export type ModelResolution = { ok: true } | { ok: false; detail: string };

export type ConfigResolution =
  | { ok: true; config: EscalationConfig }
  | { ok: false; reason: "missing" | "unparseable" | "absent" | "invalid"; detail: string };

export type PluginHooks = {
  tool?: Record<
    string,
    {
      description: string;
      execute: (args: Record<string, never>, context: unknown) => Promise<string>;
    }
  >;
  "chat.message"?: (input: unknown, output: unknown) => Promise<void>;
  "experimental.chat.system.transform"?: (input: unknown, output: unknown) => Promise<void>;
};

export type PluginServer = (input: PluginInput) => Promise<PluginHooks>;

export const PLUGIN_ID = "agentdev-model-escalation";
const LINE_PREFIX = "agentdev-model-escalation:";

// ---------- JSONC 自前解釈（外部依存なし） ----------

/** JSONC の行コメント（2連スラッシュ）とブロックコメントを除去する（文字列リテラル内は保護する）。 */
export function stripJsoncComments(src: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      out += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      for (; i < src.length && src[i] !== "\n"; i++);
      out += "\n";
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      i += 2;
      for (; i < src.length && !(src[i] === "*" && src[i + 1] === "/"); i++);
      i++;
      out += " ";
      continue;
    }
    out += ch;
  }
  return out;
}

/** JSONC 文字列を解釈する。解釈不能時は throw する。 */
export function parseJsonc(src: string): unknown {
  return JSON.parse(stripJsoncComments(src)) as unknown;
}

// ---------- 設定解決 ----------

/** provider/model 形式を分割する。形式不正時は空文字を返す。 */
export function splitModelKey(model: string): { providerID: string; modelID: string } {
  const index = model.indexOf("/");
  if (index <= 0 || index === model.length - 1) return { providerID: "", modelID: "" };
  return { providerID: model.slice(0, index), modelID: model.slice(index + 1) };
}

/**
 * agentdev.jsonc の内容を modelEscalation 設定として解釈する。
 * 不在時は reason: "absent"（正常な不発動）、読み込み・検証失敗時は
 * reason: "missing"/"unparseable"/"invalid"（異常な不発動）。
 */
export function interpretAgentdevConfig(content: string | undefined): ConfigResolution {
  if (content === undefined) {
    return { ok: false, reason: "missing", detail: ".agentdev/agentdev.jsonc not found" };
  }
  let parsed: unknown;
  try {
    parsed = parseJsonc(content);
  } catch (e) {
    return {
      ok: false,
      reason: "unparseable",
      detail: `agentdev.jsonc is not valid JSONC: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: "invalid", detail: "agentdev.jsonc root is not an object" };
  }
  const escalation = (parsed as Record<string, unknown>).modelEscalation;
  if (escalation === undefined) {
    return {
      ok: false,
      reason: "absent",
      detail: "modelEscalation key is absent; escalation stays inactive",
    };
  }
  if (!escalation || typeof escalation !== "object" || Array.isArray(escalation)) {
    return { ok: false, reason: "invalid", detail: "modelEscalation is not an object" };
  }
  const record = escalation as Record<string, unknown>;
  const model = record.model;
  if (typeof model !== "string") {
    return { ok: false, reason: "invalid", detail: "modelEscalation.model must be a string" };
  }
  if (!splitModelKey(model).modelID) {
    return {
      ok: false,
      reason: "invalid",
      detail: "modelEscalation.model must be a provider/model string",
    };
  }
  const variant = record.variant;
  if (variant !== undefined && typeof variant !== "string") {
    return {
      ok: false,
      reason: "invalid",
      detail: "modelEscalation.variant must be a string when present",
    };
  }
  return { ok: true, config: { model, variant: variant as string | undefined } };
}

// ---------- 表示・書換ヘルパ ----------

export function normalizeVariant(variant: string | null | undefined): string | undefined {
  return variant ?? undefined;
}

export function formatModelKey(model: TurnModel): string {
  return `${model.providerID}/${model.modelID}`;
}

export function formatModelName(model: string, variant: string | undefined): string {
  if (!model) return "unknown";
  return variant ? `${model} (variant: ${variant})` : `${model} (variant: none)`;
}

/**
 * ターンの model オブジェクトを切替先へ in-place 書換する（参照渡し契約）。
 * variant 未指定の場合は variant キーを除去する。
 */
export function rewriteTurnModel(turnModel: TurnModel, target: EscalationConfig): boolean {
  const split = splitModelKey(target.model);
  if (!split.providerID || !split.modelID) return false;
  turnModel.providerID = split.providerID;
  turnModel.modelID = split.modelID;
  const record = turnModel as unknown as Record<string, unknown>;
  if (target.variant !== undefined) {
    record.variant = target.variant;
  } else {
    delete record.variant;
  }
  return true;
}

// ---------- 昇格先の存在検証（Design「失敗報告と無限反復防止」） ----------

/**
 * 切替前に昇格先 provider と model の解決を確認する。
 * 解決不能な場合（provider/model 不在、client 不在、問合せ失敗）は失敗を報告し、
 * 状態を変更しない（成功として表示・記録しない。REQ-053-009）。
 */
export async function resolveEscalationTarget(
  client: unknown,
  config: EscalationConfig,
): Promise<ModelResolution> {
  const providerClient = (client as { provider?: { list?: unknown } } | undefined)?.provider;
  if (typeof providerClient?.list !== "function") {
    return { ok: false, detail: "provider client is unavailable" };
  }
  const split = splitModelKey(config.model);
  try {
    const result = await (
      providerClient.list as () => Promise<{
        data?: {
          all?: Array<{ id?: string; models?: Record<string, unknown> }>;
          providers?: Record<string, { models?: Record<string, unknown> }>;
        };
      }>
    )();
    const data = result?.data ?? (result as NonNullable<typeof result>["data"]);
    const all = data?.all;
    if (Array.isArray(all)) {
      const provider = all.find((p) => p?.id === split.providerID);
      if (!provider) {
        return { ok: false, detail: `provider not found: ${split.providerID}` };
      }
      if (!provider.models || !(split.modelID in provider.models)) {
        return { ok: false, detail: `model not found: ${config.model}` };
      }
      return { ok: true };
    }
    const map = data?.providers;
    if (map && typeof map === "object" && split.providerID in map) {
      const models = map[split.providerID]?.models;
      if (!models || !(split.modelID in models)) {
        return { ok: false, detail: `model not found: ${config.model}` };
      }
      return { ok: true };
    }
    return { ok: false, detail: "provider list shape is unrecognized" };
  } catch (e) {
    return {
      ok: false,
      detail: `provider lookup failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ---------- 状態機械（Design「失敗報告と無限反復防止」） ----------

function initialState(turnModel: TurnModel | undefined): SessionState {
  return {
    phase: "normal",
    escalationModel: "",
    escalationVariant: undefined,
    preModel: turnModel ? formatModelKey(turnModel) : "",
    preVariant: turnModel ? normalizeVariant(turnModel.variant) : undefined,
    currentTurnModel: turnModel ? formatModelKey(turnModel) : "",
    currentTurnVariant: turnModel ? normalizeVariant(turnModel.variant) : undefined,
    pending: null,
    systemNote: null,
  };
}

function acceptedEscalateLine(state: SessionState): string {
  return `${LINE_PREFIX} escalate accepted. Next turn starts on ${formatModelName(state.escalationModel, state.escalationVariant)} (current turn stays on ${formatModelName(state.preModel, state.preVariant)}).`;
}

function acceptedRevertLine(state: SessionState): string {
  return `${LINE_PREFIX} revert accepted. Next turn starts on ${formatModelName(state.preModel, state.preVariant)} (current turn stays on ${formatModelName(state.escalationModel, state.escalationVariant)}).`;
}

/**
 * 昇格要求の受理判定。tool 実行は chat.message 後に起こるため、
 * preModel/preVariant はフック時に記録済みの currentTurn 値から採用する
 * （Design「状態保持」）。
 */
export function requestEscalate(
  states: Map<string, SessionState>,
  sessionID: string,
  config: EscalationConfig,
  resolution: ModelResolution,
): RequestVerdict {
  const state = states.get(sessionID);
  if (!state) {
    return {
      kind: "failed",
      line: `${LINE_PREFIX} escalate failed. Session state is not initialized; no model change.`,
    };
  }
  if (state.phase === "escalated") {
    return {
      kind: "rejected",
      line: `${LINE_PREFIX} escalate rejected. Already escalated to ${formatModelName(state.escalationModel, state.escalationVariant)}; no model change.`,
    };
  }
  if (state.pending === "escalate") {
    // 同一ターン内の重複昇格要求は冪等（同じ pending を維持する）。
    return { kind: "accepted", line: acceptedEscalateLine(state), pending: "escalate" };
  }
  if (!resolution.ok) {
    return {
      kind: "failed",
      line: `${LINE_PREFIX} escalate failed. ${resolution.detail}; state unchanged, no model change.`,
    };
  }
  if (!state.currentTurnModel) {
    return {
      kind: "failed",
      line: `${LINE_PREFIX} escalate failed. Current turn model is unknown; state unchanged, no model change.`,
    };
  }
  state.escalationModel = config.model;
  state.escalationVariant = config.variant;
  state.preModel = state.currentTurnModel;
  state.preVariant = state.currentTurnVariant;
  state.pending = "escalate";
  return { kind: "accepted", line: acceptedEscalateLine(state), pending: "escalate" };
}

/** 復帰要求の受理判定。 */
export function requestRevert(
  states: Map<string, SessionState>,
  sessionID: string,
): RequestVerdict {
  const state = states.get(sessionID);
  if (!state || (state.phase === "normal" && state.pending === null)) {
    const current = state
      ? formatModelName(state.currentTurnModel, state.currentTurnVariant)
      : "unknown";
    return {
      kind: "rejected",
      line: `${LINE_PREFIX} revert rejected. Not escalated (current: ${current}); no model change.`,
    };
  }
  if (state.phase === "normal" && state.pending === "escalate") {
    // 同一ターン内の escalate 直後の revert は昇格を適用前に打ち消す。
    // 状態遷移は発生させず、切替通知も発行しない（DEC-023 決定7）。
    state.pending = null;
    return {
      kind: "cancelled",
      line: `${LINE_PREFIX} escalate request cancelled in the same turn; state unchanged, no model change.`,
    };
  }
  if (state.pending === "revert") {
    // 同一ターン内の重複復帰要求は冪等。
    return { kind: "accepted", line: acceptedRevertLine(state), pending: "revert" };
  }
  state.pending = "revert";
  return { kind: "accepted", line: acceptedRevertLine(state), pending: "revert" };
}

export type TurnBoundaryResult = {
  /** chat.message の output.message.model へ書換する切替先（null は書換不要）。 */
  rewrite: EscalationConfig | null;
  /** 機構ログ用の切替確定イベント（null は切替確定なし）。 */
  applied: "escalated" | "reverted" | "reapplied" | null;
};

/**
 * ターン境界での状態消費と切替先の決定。
 * - pending を最終要求として消費し、phase を遷移させる。
 * - 昇格状態の間は毎ターン昇格先を再適用する（セッション行の手動変更に優先）。
 * - 復帰確定後のターンから書換を停止する。
 */
export function applyTurnBoundary(
  states: Map<string, SessionState>,
  sessionID: string,
  turnModel: TurnModel | undefined,
): TurnBoundaryResult {
  let state = states.get(sessionID);
  if (!state) {
    states.set(sessionID, initialState(turnModel));
    return { rewrite: null, applied: null };
  }
  if (turnModel && typeof turnModel.providerID === "string" && typeof turnModel.modelID === "string") {
    state.currentTurnModel = formatModelKey(turnModel);
    state.currentTurnVariant = normalizeVariant(turnModel.variant);
  }
  if (state.pending === "escalate") {
    state.phase = "escalated";
    state.pending = null;
    state.systemNote = `${LINE_PREFIX} this session now runs on ${formatModelName(state.escalationModel, state.escalationVariant)}; previous model ${formatModelName(state.preModel, state.preVariant)}.`;
    return {
      rewrite: { model: state.escalationModel, variant: state.escalationVariant },
      applied: "escalated",
    };
  }
  if (state.pending === "revert") {
    state.phase = "normal";
    state.pending = null;
    state.systemNote = `${LINE_PREFIX} this session reverted to ${formatModelName(state.preModel, state.preVariant)}; escalation ${formatModelName(state.escalationModel, state.escalationVariant)} ended.`;
    return {
      rewrite: { model: state.preModel, variant: state.preVariant },
      applied: "reverted",
    };
  }
  if (state.phase === "escalated") {
    return {
      rewrite: { model: state.escalationModel, variant: state.escalationVariant },
      applied: "reapplied",
    };
  }
  return { rewrite: null, applied: null };
}

/** 次の system 注入一行を消費する（補助通知。存在しなければ null）。 */
export function consumeSystemNote(
  states: Map<string, SessionState>,
  sessionID: string,
): string | null {
  const state = states.get(sessionID);
  if (!state || state.systemNote === null) return null;
  const note = state.systemNote;
  state.systemNote = null;
  return note;
}

// ---------- Plugin 本体 ----------

function logEvent(event: string, sessionID: string, detail: string): void {
  console.log(`[agentdev-model-escalation] ${event} sessionID=${sessionID} ${detail}`);
}

function extractSessionID(context: unknown): string | undefined {
  const id = (context as { sessionID?: unknown } | undefined)?.sessionID;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}

function resolveWorktree(input: PluginInput): string {
  if (typeof input.project?.worktree === "string" && input.project.worktree.length > 0) {
    return input.project.worktree;
  }
  if (typeof input.worktree === "string" && input.worktree.length > 0) return input.worktree;
  if (typeof input.directory === "string" && input.directory.length > 0) return input.directory;
  return process.cwd();
}

const ESCALATE_DESCRIPTION =
  "Request switching this session to the escalation model configured in .agentdev/agentdev.jsonc (modelEscalation key). Call only when the current model cannot solve the task. The switch is applied at the NEXT turn boundary: the current turn continues with the current model and the next turn starts with the escalation model. The session ID and the whole conversation history stay unchanged. Returns 'already escalated' when an escalation is already active.";

const REVERT_DESCRIPTION =
  "Request reverting this session to the model and variant that were active immediately before the escalation. Call when the escalated model finished its work. The switch is applied at the NEXT turn boundary: the current turn is not switched. Returns 'not escalated' when no escalation is active.";

const server: PluginServer = async (input) => {
  let content: string | undefined;
  try {
    content = await readFile(join(resolveWorktree(input), ".agentdev", "agentdev.jsonc"), "utf8");
  } catch {
    content = undefined;
  }
  const resolution = interpretAgentdevConfig(content);
  if (!resolution.ok) {
    // 不発動契約: 設定不在・解釈失敗時は機能を発動しない。
    console.log(`[agentdev-model-escalation] inactive: ${resolution.detail}`);
    return {};
  }
  const config = resolution.config;
  const states = new Map<string, SessionState>();
  console.log(
    `[agentdev-model-escalation] active: escalation target ${formatModelName(config.model, config.variant)}`,
  );

  return {
    tool: {
      escalate_model: {
        description: ESCALATE_DESCRIPTION,
        execute: async (_args, context) => {
          const sessionID = extractSessionID(context);
          if (!sessionID) {
            return `${LINE_PREFIX} escalate failed. Session ID is unavailable; no model change.`;
          }
          const targetResolution = await resolveEscalationTarget(input.client, config);
          const verdict = requestEscalate(states, sessionID, config, targetResolution);
          logEvent(`escalate:${verdict.kind}`, sessionID, verdict.line);
          return verdict.line;
        },
      },
      revert_model: {
        description: REVERT_DESCRIPTION,
        execute: async (_args, context) => {
          const sessionID = extractSessionID(context);
          if (!sessionID) {
            return `${LINE_PREFIX} revert failed. Session ID is unavailable; no model change.`;
          }
          const verdict = requestRevert(states, sessionID);
          logEvent(`revert:${verdict.kind}`, sessionID, verdict.line);
          return verdict.line;
        },
      },
    },
    "chat.message": async (hookInput, hookOutput) => {
      const sessionID = extractSessionID(hookInput);
      if (!sessionID) return;
      const message = (hookOutput as { message?: { model?: TurnModel } } | undefined)?.message;
      const turnModel = message?.model;
      const usable =
        !!turnModel &&
        typeof turnModel.providerID === "string" &&
        typeof turnModel.modelID === "string";
      const { rewrite, applied } = applyTurnBoundary(
        states,
        sessionID,
        usable ? (turnModel as TurnModel) : undefined,
      );
      if (!rewrite || !usable || !turnModel) return;
      if (rewriteTurnModel(turnModel, rewrite)) {
        logEvent(
          `turn:${applied ?? "noop"}`,
          sessionID,
          `switched to ${formatModelName(rewrite.model, rewrite.variant)}`,
        );
      }
    },
    "experimental.chat.system.transform": async (hookInput, hookOutput) => {
      const sessionID = extractSessionID(hookInput);
      if (!sessionID) return;
      const note = consumeSystemNote(states, sessionID);
      if (note === null) return;
      const system = (hookOutput as { system?: string[] } | undefined)?.system;
      if (Array.isArray(system)) system.push(note);
    },
  };
};

export default {
  id: PLUGIN_ID,
  server,
} as const;
