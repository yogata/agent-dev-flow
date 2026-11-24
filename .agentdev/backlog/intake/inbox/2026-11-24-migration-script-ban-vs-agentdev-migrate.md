---
id: 2026-11-24-migration-script-ban-vs-agentdev-migrate
created_at: 2026-11-24T13:45:00+09:00
source: case-close (Issue #4218 PR #4219 本文 Findings の回収)
status: unreviewed
---

# 「移行スクリプトを書くな」と /agentdev/migrate の関係が未確認

- **課題**: 差し替え後の AGENTS.md 最上位制約 1 項は「移行スクリプトを書くな」と定める。並行 Case #4214（PR #4216）は `.agentdev/` の構成移行のための `/agentdev/migrate` と版別差分仕様を導入する。両者が矛盾するのか、対象が異なるのかは未確認
- **期待する処分**: 利用者・監督による方針の関係の確認（矛盾する場合はどちらかを調整する判断）
- **出典**: PR #4219 本文 `## Findings/ Capture候補` の `### intake` 第 2 項（発見元: case-run（DEL-4218-1）が PR #4216 の本文と Issue #4218 の対象外（AG-005）を読み合わせて気づいた点）。原文: 「8 項は利用者が確定した依頼文のまま使っており、この PR では変えない。統合後に利用者・監督が方針の関係を確認する候補。」
- **実証根拠**: main `c294f965d28fe56f8660123d818713fe08c43122` の AGENTS.md 1 項の文言。PR #4216 の導入内容は PR 本文による（Issue #4218 の case-close では PR #4216 の差分は確認していない）
