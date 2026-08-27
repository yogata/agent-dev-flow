import { describe, expect, test } from "bun:test";
import {
  applyTurnBoundary,
  consumeSystemNote,
  interpretAgentdevConfig,
  parseJsonc,
  requestEscalate,
  requestRevert,
  resolveEscalationTarget,
  rewriteTurnModel,
  stripJsoncComments,
  type EscalationConfig,
  type ModelResolution,
  type SessionState,
  type TurnModel,
} from "../plugin.ts";

const okResolution: ModelResolution = { ok: true };
const failResolution: ModelResolution = { ok: false, detail: "provider not found: x" };
const config: EscalationConfig = { model: "zai-coding-plan/glm-5.3", variant: "max" };
const configNoVariant: EscalationConfig = { model: "zai-coding-plan/glm-5.3", variant: undefined };
const turnModel = (providerID: string, modelID: string, variant?: string): TurnModel => ({
  providerID,
  modelID,
  ...(variant === undefined ? {} : { variant }),
});

function freshState(current: TurnModel): SessionState {
  const states = new Map<string, SessionState>();
  applyTurnBoundary(states, "ses", current);
  return states.get("ses") as SessionState;
}

describe("stripJsoncComments", () => {
  test("removes line comments", () => {
    const src = '{\n  // comment\n  "a": 1\n}\n';
    expect(JSON.parse(stripJsoncComments(src))).toEqual({ a: 1 });
  });

  test("removes block comments", () => {
    const src = '{\n  /* block */ "a": 1\n}\n';
    expect(JSON.parse(stripJsoncComments(src))).toEqual({ a: 1 });
  });

  test("keeps comment markers inside string literals", () => {
    const src = '{ "a": "http://x /* y */ z" }';
    expect(JSON.parse(stripJsoncComments(src))).toEqual({ a: "http://x /* y */ z" });
  });
});

describe("parseJsonc", () => {
  test("parses a JSONC with comments", () => {
    expect(parseJsonc('{ // hi\n "a": 1 }')).toEqual({ a: 1 });
  });

  test("throws on invalid JSON", () => {
    expect(() => parseJsonc("{ nope }")).toThrow();
  });
});

describe("interpretAgentdevConfig", () => {
  test("accepts modelEscalation with model and variant", () => {
    const result = interpretAgentdevConfig('{ "modelEscalation": { "model": "a/b", "variant": "max" } }');
    expect(result).toEqual({ ok: true, config: { model: "a/b", variant: "max" } });
  });

  test("accepts modelEscalation without variant", () => {
    const result = interpretAgentdevConfig('{ "modelEscalation": { "model": "a/b" } }');
    expect(result).toEqual({ ok: true, config: { model: "a/b", variant: undefined } });
  });

  test("reports absent when the modelEscalation key is missing", () => {
    const result = interpretAgentdevConfig("{}");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("absent");
  });

  test("reports missing when the file content is undefined", () => {
    const result = interpretAgentdevConfig(undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("missing");
  });

  test("reports unparseable for broken JSONC", () => {
    const result = interpretAgentdevConfig("{ broken }");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("unparseable");
  });

  test("reports invalid for a model without provider/model form", () => {
    const result = interpretAgentdevConfig('{ "modelEscalation": { "model": "onlymodel" } }');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid");
  });

  test("reports invalid for a non-string variant", () => {
    const result = interpretAgentdevConfig('{ "modelEscalation": { "model": "a/b", "variant": 3 } }');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid");
  });
});

describe("rewriteTurnModel", () => {
  test("rewrites provider, model, and variant in place", () => {
    const model = turnModel("anthropic", "claude-sonnet-4", "default");
    expect(rewriteTurnModel(model, config)).toBe(true);
    expect(model).toEqual({ providerID: "zai-coding-plan", modelID: "glm-5.3", variant: "max" });
  });

  test("removes the variant key when the target has none", () => {
    const model = turnModel("anthropic", "claude-sonnet-4", "default");
    expect(rewriteTurnModel(model, configNoVariant)).toBe(true);
    expect(model).toEqual({ providerID: "zai-coding-plan", modelID: "glm-5.3" });
  });

  test("refuses to rewrite to a malformed target", () => {
    const model = turnModel("anthropic", "claude-sonnet-4");
    expect(rewriteTurnModel(model, { model: "broken", variant: undefined })).toBe(false);
    expect(model.providerID).toBe("anthropic");
  });
});

describe("requestEscalate", () => {
  test("accepts a request in normal phase and records the pre model", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4", "thinking"));
    const verdict = requestEscalate(states, "ses", config, okResolution);
    expect(verdict.kind).toBe("accepted");
    const state = states.get("ses") as SessionState;
    expect(state.pending).toBe("escalate");
    expect(state.preModel).toBe("anthropic/claude-sonnet-4");
    expect(state.preVariant).toBe("thinking");
    expect(state.escalationModel).toBe("zai-coding-plan/glm-5.3");
    if (verdict.kind === "accepted") {
      expect(verdict.line).toContain("anthropic/claude-sonnet-4");
      expect(verdict.line).toContain("zai-coding-plan/glm-5.3");
    }
  });

  test("fails without state change when the target does not resolve", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    const verdict = requestEscalate(states, "ses", config, failResolution);
    expect(verdict.kind).toBe("failed");
    const state = states.get("ses") as SessionState;
    expect(state.pending).toBeNull();
    expect(state.phase).toBe("normal");
    expect(state.escalationModel).toBe("");
    if (verdict.kind === "failed") expect(verdict.line).toContain("provider not found");
  });

  test("rejects an escalation request while escalated", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    requestEscalate(states, "ses", config, okResolution);
    applyTurnBoundary(states, "ses", turnModel("zai-coding-plan", "glm-5.3", "max"));
    const verdict = requestEscalate(states, "ses", config, okResolution);
    expect(verdict.kind).toBe("rejected");
    if (verdict.kind === "rejected") expect(verdict.line).toContain("Already escalated");
  });

  test("is idempotent for a duplicate request in the same turn", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    requestEscalate(states, "ses", config, okResolution);
    const verdict = requestEscalate(states, "ses", config, okResolution);
    expect(verdict.kind).toBe("accepted");
    expect((states.get("ses") as SessionState).pending).toBe("escalate");
  });
});

describe("requestRevert", () => {
  test("rejects when not escalated", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    const verdict = requestRevert(states, "ses");
    expect(verdict.kind).toBe("rejected");
    if (verdict.kind === "rejected") expect(verdict.line).toContain("Not escalated");
  });

  test("accepts a revert while escalated and records the pending switch", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4", "high"));
    requestEscalate(states, "ses", config, okResolution);
    applyTurnBoundary(states, "ses", turnModel("zai-coding-plan", "glm-5.3", "max"));
    const verdict = requestRevert(states, "ses");
    expect(verdict.kind).toBe("accepted");
    expect((states.get("ses") as SessionState).pending).toBe("revert");
    if (verdict.kind === "accepted") {
      expect(verdict.line).toContain("anthropic/claude-sonnet-4");
      expect(verdict.line).toContain("zai-coding-plan/glm-5.3");
    }
  });

  test("cancels an escalation requested in the same turn without a state transition", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    requestEscalate(states, "ses", config, okResolution);
    const verdict = requestRevert(states, "ses");
    expect(verdict.kind).toBe("cancelled");
    const state = states.get("ses") as SessionState;
    expect(state.pending).toBeNull();
    expect(state.phase).toBe("normal");
  });

  test("is idempotent for a duplicate revert request", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    requestEscalate(states, "ses", config, okResolution);
    applyTurnBoundary(states, "ses", turnModel("zai-coding-plan", "glm-5.3", "max"));
    requestRevert(states, "ses");
    const verdict = requestRevert(states, "ses");
    expect(verdict.kind).toBe("accepted");
    expect((states.get("ses") as SessionState).pending).toBe("revert");
  });
});

describe("applyTurnBoundary", () => {
  test("initializes a normal state without rewriting the first turn", () => {
    const states = new Map<string, SessionState>();
    const result = applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    expect(result.rewrite).toBeNull();
    expect(result.applied).toBeNull();
    expect((states.get("ses") as SessionState).phase).toBe("normal");
  });

  test("switches to the escalation target at the next turn boundary", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    requestEscalate(states, "ses", config, okResolution);
    const model = turnModel("anthropic", "claude-sonnet-4");
    const result = applyTurnBoundary(states, "ses", model);
    expect(result.rewrite).toEqual({ model: "zai-coding-plan/glm-5.3", variant: "max" });
    expect(result.applied).toBe("escalated");
    expect((states.get("ses") as SessionState).phase).toBe("escalated");
    expect((states.get("ses") as SessionState).systemNote).toContain("now runs on");
  });

  test("reapplies the escalation target on every escalated turn", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    requestEscalate(states, "ses", config, okResolution);
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    const manual = turnModel("anthropic", "opus-x", "low");
    const result = applyTurnBoundary(states, "ses", manual);
    expect(result.applied).toBe("reapplied");
    expect(result.rewrite).toEqual({ model: "zai-coding-plan/glm-5.3", variant: "max" });
  });

  test("reverts to the pre model and stops rewriting afterwards", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4", "thinking"));
    requestEscalate(states, "ses", config, okResolution);
    applyTurnBoundary(states, "ses", turnModel("zai-coding-plan", "glm-5.3", "max"));
    requestRevert(states, "ses");
    const model = turnModel("zai-coding-plan", "glm-5.3", "max");
    const result = applyTurnBoundary(states, "ses", model);
    expect(result.rewrite).toEqual({
      model: "anthropic/claude-sonnet-4",
      variant: "thinking",
    });
    expect(result.applied).toBe("reverted");
    expect((states.get("ses") as SessionState).phase).toBe("normal");
    const later = turnModel("anthropic", "opus-x");
    const laterResult = applyTurnBoundary(states, "ses", later);
    expect(laterResult.rewrite).toBeNull();
    expect(laterResult.applied).toBeNull();
  });

  test("records the current turn model for the pre-escalation fallback", () => {
    const state = freshState(turnModel("google", "gemini-x", "fast"));
    expect(state.currentTurnModel).toBe("google/gemini-x");
    expect(state.currentTurnVariant).toBe("fast");
  });
});

describe("consumeSystemNote", () => {
  test("delivers the note once", () => {
    const states = new Map<string, SessionState>();
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    requestEscalate(states, "ses", config, okResolution);
    applyTurnBoundary(states, "ses", turnModel("anthropic", "claude-sonnet-4"));
    const note = consumeSystemNote(states, "ses");
    expect(note).toContain("now runs on zai-coding-plan/glm-5.3");
    expect(consumeSystemNote(states, "ses")).toBeNull();
  });
});

describe("resolveEscalationTarget", () => {
  test("accepts when the provider and model exist", async () => {
    const client = {
      provider: {
        list: async () => ({
          data: { all: [{ id: "zai-coding-plan", models: { "glm-5.3": {} } }] },
        }),
      },
    };
    const result = await resolveEscalationTarget(client, config);
    expect(result).toEqual({ ok: true });
  });

  test("fails when the model is missing from the provider", async () => {
    const client = {
      provider: {
        list: async () => ({ data: { all: [{ id: "zai-coding-plan", models: {} }] } }),
      },
    };
    const result = await resolveEscalationTarget(client, config);
    expect(result.ok).toBe(false);
  });

  test("fails when the client is unavailable", async () => {
    const result = await resolveEscalationTarget(undefined, config);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.detail).toContain("unavailable");
  });

  test("fails when the provider lookup throws", async () => {
    const client = {
      provider: {
        list: async () => {
          throw new Error("boom");
        },
      },
    };
    const result = await resolveEscalationTarget(client, config);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.detail).toContain("boom");
  });
});
