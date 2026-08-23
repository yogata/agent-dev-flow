# case-open workflow extension の rules 空欄と段階ゲート traceability 利用の反映判断

## 観測

Issue 2418（PR #2424）で case-open の段階ゲート（REQ-021-024）が agentdev-traceability check を決定的導出手段として利用するようになった一方、case-open の workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`）は `rules: []` のまま保有している。段階ゲートの traceability 利用を extension rules へ反映するかどうかは判断が保留された（PR #2424 本文「Findings / Capture候補」2件目）。

## 今回扱わない理由

導出契約を check 操作へ明示統合する Issue #2419（OU-3、REQ-012-051）との協働で判断するのが適切と判断され、Issue 2418（変更対象成果物外）では変更されなかった。

## 影響

なし（extension rules は標準動作に追加・拡張する仕組みであり、空欄でも標準 SKILL.md 手順は機能する。段階ゲート自体は fixture 検証で合格済み）。

## レビューで決めること

- Issue #2419（OU-3）の導出契約統合後に、case-open extension rules へ traceability 利用を反映するか否か
- 反映する場合の rules 記述内容（check 利用と手動フォールバックの記載粒度）

## 根拠

- PR #2424 本文「Findings / Capture候補」2件目（発見元: case-run 実装）
- Issue #2419（OU-3、REQ-012-051 導出契約）
