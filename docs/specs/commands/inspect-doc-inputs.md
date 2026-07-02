---
title: inspect-doc-inputs command SPEC
status: draft
created: 2026-07-02
updated: 2026-07-02
---

# inspect-doc-inputs command SPEC

## 目的

project doc-inputs 機構（ADR-0133、IR-056）の整合性を読み取り専用で診断する。

## 適用対象

- `.agentdev/config.yaml` の schema 適合確認（`version`, `kind`, `roots`, `doc_inputs` のみ）
- `.agentdev/doc-inputs/commands/*.yaml`、`.agentdev/doc-inputs/skills/*.yaml` の schema、paths 存在、探索可能性検査
- `src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/agentdev-*/SKILL.md`、`src/opencode/skills/agentdev-*/references/**/*.md` の直接 docs/specs/{domain}/** 参照残存検査

## 提供する判断、操作

- `check_doc_inputs.ts` 実行結果の解釈
- 検出事項の NG 分類（false positive / pre-existing / 今回修正対象）
- 推奨 route 提示（intake / req-define / 直接修正）

## 参照する references

- なし（コマンド本文に集約）

## 現在の動作

- 診断専用（検査対象を直接修正しない）
- `check_doc_inputs.ts` の結果をそのまま提示し、独自検査で上書きしない
- 検出事項を `.agentdev/inspect/inbox/inspect-doc-inputs-finding-*.md` へ出力

## 対象外

- 検査対象の直接修正（各コマンド、req-define、intake 等が担当）
- check_doc_inputs.ts の実装保守（`repo-agentdev-integrity` skill 配下）

## 検証観点

- `check_doc_inputs.ts` が正常終了し、JSON レポートを生成すること
- 検出事項が `.agentdev/inspect/inbox/` へ出力されること
- false positive 判定が exemption 仕様に厳密に従うこと

## See Also

- project-doc-inputs SPEC
- IR-056 integrity rule
- inspect-promote（次工程）
