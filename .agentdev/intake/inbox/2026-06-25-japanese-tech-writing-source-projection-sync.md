# japanese-tech-writing skill が source (`src/opencode/skills/`) に存在しない

## 概要

`japanese-tech-writing` skill が projection (`.opencode/skills/japanese-tech-writing/`) に実体を持つ一方で、source 側 (`src/opencode/skills/`) に存在しない。`src/opencode/skills/` 配下は `agentdev-*` prefix を持つ 27 skill のみで、`japanese-tech-writing` は含まれない。`.opencode/skills/japanese-tech-writing/` は実ディレクトリ（junction ではない）。

## 提案しなかった理由

本 finding は `/repo/docs-check`（機械的整合性検査）の検出結果であり、採否は `intake-promote` に委譲する前提のため。設計意図（意図的な repo-local skill か、配布対象からの漏れか）の確定には REQ/ADR の確認が必要で、本 item 単独では判断できない。

## テーマ

- 配布基盤・source/projection 整合性
- 関連 REQ: REQ-0134（配布基盤: source/projection・sync・repo type・consumer install）、ADR-0105（source/projection 分離）、ADR-0020（repo-agentdev-integrity の repo-local 扱い）

## レビューで決めること

- `japanese-tech-writing` を配布対象（`src/opencode/skills/` 配下）とするか、repo-local skill（`repo-agentdev-integrity` と同等）とするか。AGENTS.md は `japanese-tech-writing` を SSoT として参照しており、consumer project にも提供すべき内容に見える
- repo-local とする場合、検出ルール（`source-projection-sync`）の exemption 対象に `japanese-tech-writing` を明示的に追加するか、スキル配置の正規化（`src/` へ移動）を行うか
- `japanese-tech-writing` は `agentdev-` prefix を持たない（INFO レベルで別途検出済み）。prefix 方針と配置方針を合わせて確定する必要がある

## 備考

- **Finding 分類**: NG / Inventory / source-projection-sync
- **Route**: req-define
- **根拠**: `/repo/docs-check` 実行（2026-06-25）。`.agentdev/integrity/reports/2026-06-24-integrity-report.md`
- **原因分類**: 不明（設計意図要確認）
- 関連 finding: 同 skill の USE FOR section 欠如（WARNING / skill-use-for-boundary）は別 item として起票済み。両者は関連するが是正方針が異なるため分離
