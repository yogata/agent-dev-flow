# Intake Item: 配布 Command/Skill 本文の concrete ID 参照・docs/src 内部パス参照残存（IR-055 delta）

## 発生源

- 発生 phase: /repo/docs-check 実行（2026-07-18 04:35）
- capture 分類: intake（具体的作業候補 = concrete ID と docs/src パスの abstract 化）

## 問題

`check_integrity.ts` の RuntimeReference 検査（IR-055 delta from baseline）が、配布 Command/Skill 本文（`src/opencode/commands/agentdev/**/*.md`, `src/opencode/skills/agentdev-*/**/*.md`）に残存する concrete ID・内部パス参照を新規違反（NG 218件 + WARNING 10件）として検出した。`check_distribution_boundary.ts` も同じ対象を concrete-id / concrete-path として検出し EXIT=1 で完了（docs-check 全体を fail にする要因）。

検出対象の主な内訳:

- concrete ID（`REQ-NNNN`, `REQ-NNNN-NNN`, `ADR-NNNN`）: 配布 command/skill 本文に要件・決定の根拠として concrete ID が直接記述されている。 Consumers 環境ではこれらの docs は配布対象外のため未解決参照となる（IR-055 strict）。
- concrete path（`docs/specs/...`, `docs/guides/...`, `src/opencode/...`, `repo-*`）: 同様に consumers 環境で未解決となるパス参照（IR-055 strict/heuristic）。

主な該当ファイル（多岐）:

- `src/opencode/commands/agentdev/case-auto.md`（多数行、主に REQ-0114/0130/0148/0151/0162 参照）
- `src/opencode/commands/agentdev/case-close.md`（REQ-0131/0144/0162）
- `src/opencode/commands/agentdev/case-open.md`（REQ-0132 多数）
- `src/opencode/commands/agentdev/case-run.md`（REQ-0130/0144/0162、concrete path docs/specs/integrity/...）
- `src/opencode/commands/agentdev/req-save.md`（REQ-0124/0125、WARNING: docs/specs/, docs/guides/）
- `src/opencode/commands/agentdev/spec-save.md`（REQ-0124/0125、WARNING: docs/specs/, docs/guides/）
- `src/opencode/skills/agentdev-architecture-advisory/{SKILL.md, references/architecture-review-delegation.md}`（REQ-0162、ADR-0136）
- `src/opencode/skills/agentdev-case-run-execution-adapter/{SKILL.md, references/harness-delegation.md}`（REQ-0162）
- `src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md`（REQ-0140 多数、`repo-local`）
- `src/opencode/skills/agentdev-gh-cli/references/verify.md`（REQ-0149）
- `src/opencode/skills/agentdev-inspect-skills/{SKILL.md, references/semantic-diagnostic-perspectives.md}`（REQ-0119/0125、ADR-0107、`src/opencode/`、`docs/specs/`）
- `src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md:9`（REQ-0132-024）
- `src/opencode/skills/agentdev-workflow-templates/SKILL.md:96-97`（REQ-0132）
- `src/opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md:55`（WARNING: docs/specs/）

原因分類: 確認済（IR-055 baseline 運用開始後、新規に追加・改修された配布物で ID 除去・abstract 化が漏れたものが delta として検出されている。REQ-0142「配布物ID除去後の文意保持・構文健全性・責務整合」および ADR-0136/REQ-0162 の移行期に伴う追従不足）。

## 推奨修正対象

全該当箇所について、以下のいずれかの方針で abstract 化する。ファイル数が多いため、command 群・skill 群ごとに分割 case として段階対応することを推奨（機械的分割ではなく、意味単位での分割）。

1. concrete ID を `agentdev-*` スキル名や SPEC 名への参照に置換（例: 「REQ-0162-002 参照」→「`agentdev-case-run-execution-adapter` SKILL の harness 分離契約参照」）。
2. concrete docs/src パスを配布物内の相対参照（`references/*.md` 等）またはスキル名参照に置換。
3.どうしても残す必要がある ID は baseline 登録を検討（但し本来 baseline は経過措置であり、最終的には abstract 化が完了条件）。

完了条件は `check_distribution_boundary.ts` が EXIT=0 になること、および RuntimeReference の IR-055 delta が 0件になること（baseline 移行または除去）。

## 関連

- 発見元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report.md` RuntimeReference セクション（非永続・commit対象外）
- 補助検査: `check_distribution_boundary.ts`（同対象を concrete-id/concrete-path として検出、EXIT=1）
- 要件: REQ-0142（配布物ID除去後の文意保持）、REQ-0162（harness 実行制御分離）、REQ-0159-001/003（配布物依存スキル）
- ADR: ADR-0136（harness 実行制御分離）
- 既存関連 intake item:
  - `intake-2026-07-18-0545-req0119-remaining-command-duplication.md`（Command 群の重複定義解消未対応。本 item の対象範囲と一部重複し得るため、intake-promote で統合可否を判断）
