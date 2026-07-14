# CanonicalConflict: case-close.md の gh pr view 直接呼び出し（2箇所）

## 概要

`.opencode/commands/agentdev/case-close.md:120` および `:161` に `gh pr view` の直接呼び出しが存在する。IR-053（gh CLI 委譲）に従い、`agentdev-gh-cli` skill への委譲に変更すべき。

## 詳細

- 対象:
  - `.opencode/commands/agentdev/case-close.md:120` → `gh pr view`
  - `.opencode/commands/agentdev/case-close.md:161` → `gh pr view`
- 検出: check_integrity.ts CanonicalConflict gh-direct-invocation（WARNING 2件）
- 設計原則: IR-053, REQ-0152-001（gh CLI 直接呼び出し禁止、agentdev-gh-cli 委譲）

## 候補となる対応

case-close.md の `gh pr view` 直接呼び出しを、`agentdev-gh-cli` skill 委譲の表現に変更する。

## 根拠

- 観測元: /repo/docs-check 2026-07-15 実施（check_integrity.ts CanonicalConflict heuristic）
- 設計原則: IR-053, REQ-0152-001
- 検出規模: WARNING 2件
- 原因分類: 確認済み（gh 直接呼び出しの残留）
- route: intake → command fix
