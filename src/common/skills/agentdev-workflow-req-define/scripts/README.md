# `agentdev-workflow-req-define` scripts

Deterministic procedures for local draft-section assembly and inspection. These scripts preserve existing content outside the requested edit and return compact JSON evidence.

## Contents

```text
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── result.ts
│   └── fs-helpers.ts
├── src/
│   ├── assemble-draft-section.ts
│   └── evidence-match.ts
└── tests/
    ├── assemble-draft-section.test.ts
    ├── evidence-match.test.ts
    └── real-path-assembly.test.ts
```

## Contract

- Input: stdin JSON with `operation` (`replace` or `append`) and `target_file`.
- Replace requires `target_area`, `old_text`, and `new_text`; `expected_old_count` defaults to 1.
- Append requires `anchor` and `content`.
- Target headings use exact text matching, with optional Markdown heading-prefix normalization, following the `search-target-area.ts` matching rule.
- Precondition or postcondition failures return `ok: false` JSON and a non-zero exit code. A successful default run returns a compact diff and evidence without modifying the file. `--write` applies the assembled content.
- The result identifies the file, exact heading and line, operation, match and replacement counts, pre/post checks, compact changed-line diff, and evidence including input/edit hashes, check scope, execution conditions, checker version/settings, result-affecting references, check and diff summaries, and timestamp. Use the evidence only when the source hash and check scope still match. `evidence-match.ts` compares stored evidence against current conditions and returns whether it is reusable, plus which side (assembly, inspection) is invalidated on mismatch.
- `.agentdev/drafts/` is not used for script inputs, outputs, or temporary files.

## Run

```bash
bun test ./src/common/skills/agentdev-workflow-req-define/scripts/
bun run --cwd src/common/skills/agentdev-workflow-req-define/scripts typecheck
```
