# CanonicalConflict: case-close.md の gh pr view 直接呼び出し（2箇所）

## 観測内容

`.opencode/commands/agentdev/case-close.md:120` および `:161` に `gh pr view` の直接呼び出しが存在。IR-053（gh CLI 委譲）は `agentdev-gh-cli` skill への委譲を要求。

## 影響

- gh CLI 委譲の一貫性違反（IR-053, REQ-0152-001）
- 直接呼び出しによる command 局所化リスク（エラーハンドリング、引数バリデーションの不統一）

## 課題

case-close.md に `gh pr view` 直接呼び出しが残留。IR-053 が要求する `agentdev-gh-cli` skill 委譲への変更が必要。

## 既存要件との関連

- IR-053（gh CLI 委譲）
- REQ-0152-001（gh CLI 直接呼び出し禁止）

## 対応方針の方向性

case-close.md の `gh pr view` 直接呼び出しを、`agentdev-gh-cli` skill 委譲の表現に変更する。2箇所（:120, :161）。

route: command fix。

## 根拠

- 観測元: /repo/docs-check 2026-07-15 実施（check_integrity.ts CanonicalConflict heuristic）
- 対象: `.opencode/commands/agentdev/case-close.md:120, :161`
- 設計原則: IR-053, REQ-0152-001
- 検出規模: WARNING 2件
