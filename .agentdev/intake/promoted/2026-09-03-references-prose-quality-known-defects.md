# references/ 配下の同種既知不備 22 箇所（文章品質是正の対象集合外）

## 観測内容

PR #2539（Issue #2538、配布 command・skill 70 ファイルの文章品質是正）の case-run で、本次の対象集合（`src/opencode/commands/agentdev/` 直下 + `src/opencode/skills/agentdev-*/SKILL.md`）外の `references/` 配下に同種の既知不備 22 箇所が残存することを検出した:

- `agentdev-doc-writing/references/*`: 簡体字「查読」14 箇所
- `agentdev-decision-file-manager/references/validation-and-consistency.md`: `docs/decisions<README>.md` 5 箇所
- `agentdev-req-analysis/references/analysis-viewpoints.md:104`: 「-066 準拠」1 箇所
- `agentdev-workflow-case-open/references/issue-creation-flows.md`: `docs/decisions<README>.md` 2 箇所

いずれも既知不備センチネル検査 Design（docs/designs/integrity/prose-quality-sentinel-checks.md、status: accepted）の S-05（查読）、S-06（docs/decisions<README>.md）、S-08（-066）に対応する種類の不備。

本次（Issue #2538）の対象集合は配布 command・skill 本文で、`references/` は対象外（PR #2539 本文に記録済み）。後続是正案件として分離された。

## 影響

`references/` 配下に既知不備（簡体字混入、誤記リンク表記、参照残骸）が残存する。センチネル検査 Design の対象集合には含まれないが、同種是正案件の候補一覧として活用できる。

## 課題（レビューで決めること）

- `references/` 配下を検査対象集合へ含める是正案件の要否と優先度
- センチネル検査 Design の対象集合拡大（references/ 追加）の要否

## 既存要件・契約との関連

- REQ-053-022（既知不備センチネル検査）、prose-quality-sentinel-checks Design（docs/designs/integrity/prose-quality-sentinel-checks.md）の S-05/S-06/S-08、Issue #2538（本次の文章品質是正 Case）。

## 根拠

- PR #2539 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2539 ）
- Issue #2538、REQ-053-022（既知不備センチネル検査）
