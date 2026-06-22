---
title: agentdev-doc-writing SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-doc-writing SPEC

## 目的

docs 配下の REQ/ADR/SPEC/guides/DOC-MAP/README および関連する command/skill の自然言語記述の品質を静的査読し、読者が判断・実行できる文書へ修正提案を提示する。QG-1〜QG-4 の主ゲート体系を置き換えず、文書種別責務・要件性・文意品質・粒度の補助査読として位置づける（REQ-0140）。

## 適用対象

- `docs/**`（REQ, ADR, SPEC, guides, DOC-MAP, README）の作成・編集・レビュー時
- docs を生成・編集する command / skill の自然言語記述（本文・description・参照記述）の執筆・編集時
- ユーザーが「AIっぽい」「薄い」「抽象的」「意味不明」「ビジネス文書として直せ」と指示した場合
- Issue/PR 本文・完了報告・設計説明の執筆またはレビュー時
- `read-only`・`advisor`・`architecture-affecting` 等の英語混じり表現が docs に残留していないか確認する場合

## 提供する判断・操作

- 文書種別責務・要件性・文意品質・粒度の補助査読
- AI-slop 検出（10基準・5出力原則・11ルール）
- 英語混じり表現・抽象語の具体的書き換え
- 査読出力の分類（残す/分割/移送/削除候補）と修正文案提示

## 参照する references

- `references/document-boundaries.md` — 文書種別責務
- `references/req-line-quality.md` — 要件行の品質
- `references/adr-writing-quality.md` — ADR 本文の品質
- `references/spec-writing-quality.md` — SPEC 本文の品質
- `references/ai-slop-detection.md` — AI-slop 検出
- `references/rewrite-patterns.md` — 検出→書き換え
- `references/review-output.md` — 査読出力形式
- `references/execution-subject-classification.md` — 実行主体分類（command / skill / subagent / harness）の査読

原本は `docs/specs/writing-style.md`。内容が重複する場合は原本を優先（REQ-0140-023）。

## 現在の動作

- 静的査読のみを担当。実行時の動的判断（要件分析・ADR 要否判定）は `agentdev-req-analysis`・`agentdev-adr-guidelines` が担う（REQ-0140-024）
- ファイル保存・commit・push は行わない。査読提案を返すのみ（REQ-0140-022）
- 未合意事項を確定しない。問題箇所を分類し修正文案または移送先候補として提示する（REQ-0140-021）

## 対象外

- コード実装・テスト実行
- REQ/ADR 番号付与・APPEND/UPDATE/CREATE 判定（`agentdev-req-file-manager` / `agentdev-adr-file-manager` 担当）
- ADR 必要性判定（`agentdev-adr-guidelines` 担当）
- command 手順設計・Issue/PR CRUD
- 要件分析（`agentdev-req-analysis` 担当）
- カジュアルな文章・広告・詩

## 検証観点

- 文書種別責務が妥当か（REQ/ADR/SPEC/guide/README の配置）
- 要件行が主語・対象・状態・検証可能性・独立性・肯定文主文を満たすか
- ADR 本文が意思決定文書として成立しているか
- SPEC 本文が詳細仕様の置き場として成立しているか
- AI-slop 基準（10基準・5出力原則・11ルール）への適合

## See Also

- [agentdev-req-analysis.md](agentdev-req-analysis.md) — 要件分析（動的判断）
- [agentdev-adr-guidelines.md](agentdev-adr-guidelines.md) — ADR 要否判定（動的判断）
- [writing-style.md](../../writing-style.md) — 原本 SPEC
- REQ-0140 — 文書品質ゲート
