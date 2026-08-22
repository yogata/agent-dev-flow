# src/opencode-local 側 gh-cli references に一文一行機械判定違反が残存する

## 観測

agentdev-gh-cli ローカル版（src/opencode-local/agentdev-gh-cli/references/）の兄弟ファイルに一文一行機械判定違反が残存する。

- contracts.md: 2行
- verify.md: 3行
- retry.md: 1行

OU-0018 の機械是正（PR 2275）は src/opencode 側のみが適用範囲で、src/opencode-local 側は適用外だった。

## 今回扱わない理由

Issue 2246（OU-0019）は local-procedures.md への git CLI 初期化要件追記がスコープ。兄弟ファイルの横断是正は対象外。

## 影響

src/opencode-local 側の文書品質基準が src/opencode 側と不整合のまま残る。機械判定の横断是正を実施する際の漏れ対象になる。

## レビューで決めること

- src/opencode-local/agentdev-gh-cli/references/ 6行分の一文一行是正を独立 Case として実施するか

## 根拠

- PR 2278 本文「Findings・Capture候補」intake 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2278）
- 適用範囲の前提: PR 2275（OU-0018、src/opencode 側のみ適用）
