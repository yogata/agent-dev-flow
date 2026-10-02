// agentdev_third_party Custom Tool の host 非依存公開スキーマ（Tool 引数の JSON Schema）。
//
// 配置先ルート（.opencode/skills / Senpi 向け skillsRoot）はホスト接続側の実行
// context 変換で差し替えられる一方、操作引数の公開契約は host 非依存である。
// OpenCode（plugins/agentdev-third-party-tool）と Senpi（src/senpi/tools/）の
// 両ホスト接続が本モジュールを参照し、ホスト別にスキーマを複製しない。

/** 操作要求の公開スキーマ（JSON Schema）。正の契約は Tool の contracts.ts が所有する。 */
export const AGENTDEV_THIRD_PARTY_REQUEST_PROPERTY_SCHEMA = {
  type: "object",
  description:
    "Structured third-party Skill acquisition request. Acquires skills declared in " +
    "src/third-party/skills.yaml (producer-managed) or .agentdev/third-party/skills.yaml " +
    "(consumer-managed fallback) into the host skills root (<skillsRoot>/<name>/). " +
    "Single SKILL.md sources are normalized to <skillsRoot>/<name>/SKILL.md; " +
    "GitHub Skill directory sources are acquired recursively preserving the relative structure " +
    "(nothing outside the Skill directory is acquired). Existing unmanaged placements with the " +
    "same name are never overwritten (refused, not skipped). The placement is verified by " +
    "read-back before success is returned; verification failures never return success (fail-closed). " +
    "On failure the pre-acquisition state is restored and the failure causes are reported.",
  properties: {
    operation: {
      type: "string",
      enum: ["acquire"],
      description: "Operation name from the agentdev_third_party operation catalog.",
    },
    skill: {
      type: "string",
      description: "Target skill name from the declaration. Omit to acquire all declared skills.",
    },
    dryRun: {
      type: "boolean",
      description:
        "When true, no acquisition runs; returns the plan (targets, placement paths, unmanaged conflicts).",
    },
  },
  required: ["operation"],
  additionalProperties: false,
} as const;
