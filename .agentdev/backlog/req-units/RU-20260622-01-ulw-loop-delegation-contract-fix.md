---
source_type: chat
generated_by: session
generated_at: 2026-06-22T12:11:06+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-22-ulw-loop-delegation-contract-fix
---

# ulw-loop にかかる case-run 委譲契約の是正

## 背景

case-run は ADR-0128 に基づき、実装作業を `task()` によって実行担当サブエージェントへ委譲する。

今回、case-run の委譲実行時に `ulw-loop` を `load_skills` に指定した結果、`ulw-loop` が見つからない問題が発生した。会話内で確認した結果、`ulw-loop` は skill ではなく、実行担当サブエージェント側で prompt 内から実行される command として扱うべきものだった。

## 問題

現行の REQ / ADR / SPEC / command / skill / AGENTS.md に、`ulw-loop` を skill として扱う誤った記述が混入している。

特に、以下の問題がある。

- REQ-0139 が `ulw-loop`、`Sisyphus-Junior`、`load_skills` などの具体実装に言及しすぎている
- ADR-0128 が「CLI subprocess 廃止」を主題化しており、task() による実行担当サブエージェント委譲という意思決定を主語にできていない
- `docs/specs/commands/case-run.md` が `ulw-loop` を `load_skills` に指定する誤った task() 仕様を持っている
- `src/opencode/commands/agentdev/case-run.md` および `agentdev-case-run-execution-adapter` に同じ誤りが反映されている
- AGENTS.md にも同型の誤った実行契約が含まれている

## Source Summary

本セッションでは、以下を合意した。

- `ulw-loop` は skill ではない
- `ulw-loop` を `load_skills` に指定してはならない
- `load_skills` には AgentDevFlow 側の adapter skill を指定する
- `/ulw-loop` は prompt 内の実行 command として扱う
- REQ は特定実装名や task() 引数の具体形まで書くべきではない
- ADR-0128 は「CLI subprocess 廃止」ではなく、「task() による実行担当サブエージェント委譲」を意思決定として記述するべきである
- Issue #1015 の実装に入る前に、case-run 委譲契約の破損を是正する必要がある

## 統合理由

本件は、`ulw-loop` に関する単一の委譲契約バグとして統合する。

REQ / ADR / SPEC / command / skill / AGENTS.md にまたがるが、いずれも同じ誤認に起因している。

- `ulw-loop` を skill と誤認した
- `load_skills` に指定すべき対象を誤った
- case-run の task() 委譲契約を誤って文書化・実装した

したがって、同一 RU でまとめて是正する。

## 要件化の方向

case-run の実装実行委譲は、以下の契約に正規化する。

- case-run は `task()` により実行担当サブエージェントへ実装作業を委譲する
- `load_skills` には AgentDevFlow 側の case-run 実行 adapter skill を指定する
- `ulw-loop` は skill として扱わない
- `/ulw-loop` は prompt 内で実行する command として扱う
- REQ は task() 引数の具体形や外部 command 名を主要件として固定しない
- ADR は task() による実行担当サブエージェント委譲を意思決定として記録する
- SPEC / command / skill は、正しい実行主体分類に基づいて task() 委譲契約を記述する

## 主対象REQまたは変更対象候補

主対象REQ候補:

- `docs/requirements/REQ-0139.md`

変更対象候補:

- `docs/adr/ADR-0128.md`
- `docs/specs/commands/case-run.md`
- `src/opencode/commands/agentdev/case-run.md`
- `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md`
- `src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md`
- `AGENTS.md`

## 対象外

以下は本 RU の対象外とする。

- Issue #1015 の並列委譲実装
- `case-auto`、`case-open`、`req-save`、`spec-save` の Issue #1015 対応
- レポジトリ全体の責務境界総点検
- inspect 系または docs-check 系への再発防止実装
- 未確認の他コマンド・他スキルの横断修正

## 受け入れ条件

- `load_skills=["ulw-loop"]` が対象文書・配布物から除去されている
- `ulw-loop` を skill と呼ぶ記述が対象文書・配布物から除去されている
- REQ-0139 が `ulw-loop`、`Sisyphus-Junior`、`load_skills`、task() 呼び出し例を主要件として固定していない
- ADR-0128 の主題が「CLI subprocess 廃止」ではなく「task() による実行担当サブエージェント委譲」になっている
- ADR-0128 で CLI subprocess を使わないことは、主決定ではなく、結果・制約・非採用案として扱われている
- `docs/specs/commands/case-run.md` の task() 委譲契約が、adapter skill と prompt 内 `/ulw-loop` 実行に正規化されている
- `src/opencode/commands/agentdev/case-run.md` が SPEC と同じ task() 委譲契約を持っている
- `agentdev-case-run-execution-adapter` が `ulw-loop` を skill と誤称していない
- AGENTS.md の case-run ハーネス記述が、SPEC / command / skill と矛盾していない
