---
title: 語彙レジストリ
status: accepted
created: 2026-08-20
updated: 2026-08-11
---

# 語彙レジストリ

AgentDevFlow 管理下の文書で使用する正規語彙と旧語彙の対照表の配置基準、連携契約、IR-045 文意品質検出対象語の移管状態を定義する（ACT-SPEC-007、REQ-028-007、DEC-013 適用）。

## 目的

- docs-check / IR-050 / IR-051 / IR-044 等の語彙検出ルールが参照する語彙対照表の正規所有と配置基準を明文化する
- IR-045（docs 日本語表現、文意整合検査、削除済み）の文意品質検出対象語の移管完了状態を記録する
- 配布物側の語彙レジストリ実体との責務分担を確定する

## 配置と連携

語彙レジストリの実体対照表は配布物側に配置し、本 SPEC は配置基準と連携契約のみを所有する（重複管理回避、charter 原則）。

| 区分 | 配置先 | 役割 |
|---|---|---|
| 実体対照表（canonical source） | `src/opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` | コマンド名、スキル名、サブエージェント名、ハーネス名、語彙ポリシー、廃止済み概念、完了報告フィールド、REQ 範囲表記、旧分類用語、Capture 語彙、文意品質検出対象語（IR-045）、候補語対照表（IR-044 連携）、IR-055 runtime-unresolved-reference 対照の各テーブルを所有する |
| 基盤 SPEC（本ファイル） | `docs/designs/authoring/vocabulary-registry.md` | 語彙レジストリの配置基準、連携契約、IR-045 移管状態、IR-050/IR-051/IR-044 協調契約を所有する |

配布物側の語彙レジストリは `src/opencode/skills/repo-agentdev-integrity/references/` 配下に配置し、`.opencode/skills/repo-agentdev-integrity/references/` へ投射する。
canonical は source 側とする（DEC-002）。

## IR-045 文意品質検出対象語の移管状態（ACT-SPEC-007、REQ-028-007）

IR-045（docs 日本語表現、文意整合検査）は REQ-010-003、REQ-036-023 により docs-check 機械検出対象から除外し、`agentdev-doc-writing` スキル配下へ移譲済みである。
catalog-only tombstone として管理され、本 SPEC では文意品質検出対象語の参照として保持する。

移管対象語（`read-only`、`read-only-diagnostic`、`advisor`/`advisory`、`architecture-affecting`、`Architecture advisory gate` 等）の対照表は配布物側 `src/opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md`「文意品質検出対象語（IR-045）」節が正である。
本 SPEC は当該節の管理権限を配布物側へ委譲し、重複所有しない。

## IR-050 / IR-051 語彙レジストリ協調

IR-050（load_skills 誤指定検出）、IR-051（実行主体 skill 表記誤認検出）は語彙レジストリの存在確認、必要語彙の補充後に適用する（REQ-010-006/007）。
IR-051 の「一定文字距離内」は語彙レジストリで確定された具体閾値（同一行内、隣接リスト項目、段落下）を使用する。
閾値未確定時は heuristic として報告するが auto-promote 対象外とする。

詳細な距離閾値契約は repo-local 参照ファイル `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md`「IR-051 距離閾値（v2:REQ-0145-007）」節が正である。

## IR-044 候補語対照表連携

IR-044（REQ/SPEC 境界違反検出）の候補語対照表は `docs/designs/responsibilities/document-type-responsibilities.md` 訳語表および `docs/designs/integrity/integrity-rule-catalog.md` / `docs/designs/integrity/rules/` 配下に掲載される散文英語普通名詞を対象とする（RU-0007、RU-0008）。
候補語の分類（検出対象 / 正規使用）と IR-044 適用除外根拠は配布物側語彙レジストリ「候補語対照表（IR-044 連携）」節が正である。

## 適用範囲

- 対象: 語彙レジストリの配置基準、連携契約、IR-045/050/051/044/055 と配布物側語彙レジストリの責務分担
- 対象外: 実体対照表の内容管理（配布物側 `src/opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` の責務）、語彙検出ロジックの実装詳細（`check_integrity.ts`、IR-050/051 個別ルールファイルの責務）

## 関連 SPEC

- [../integrity/integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md): IR スキーマ、IR-045 削除エントリ
- [../integrity/integrity-contracts.md](../integrity/integrity-contracts.md): 3層検出構造、検出事項経路マップ
- [../responsibilities/document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md): 訳語表、文意品質ゲート
- [../integrity/rules/IR-044-req-spec-boundary-violation-detection.md](../integrity/rules/IR-044-req-spec-boundary-violation-detection.md): 候補語対照表連携元
- [../integrity/rules/IR-050-load-skills-command-mis-specification.md](../integrity/rules/IR-050-load-skills-command-mis-specification.md): load_skills 誤指定検出
- [../integrity/rules/IR-051-executor-skill-notation-misrecognition.md](../integrity/rules/IR-051-executor-skill-notation-misrecognition.md): 実行主体 skill 表記誤認検出
- [../integrity/rules/IR-055-runtime-unresolved-reference.md](../integrity/rules/IR-055-runtime-unresolved-reference.md): runtime-unresolved-reference 対照
