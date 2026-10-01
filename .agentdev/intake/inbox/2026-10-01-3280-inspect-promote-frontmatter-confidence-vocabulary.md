# intake: inspect-promote frontmatter description の「高確信度」語彙の新モデル語彙統一候補

- 観測日: 2026-10-01
- 観測元: Epic #3280 Wave 3 case-close 最終 Capture 回収（PR #3288 本文 Findings。Issue #3284 / RA-002 で検出・Wave 2 で未回収のまま残存していた候補を Wave 3 で回収）
- 種別: 変更候補（配布 command 定義 frontmatter の語彙統一）

## 内容

- `src/opencode/commands/agentdev/inspect-promote.md` の frontmatter description に「高確信度」語彙が残存している（frontmatter 無変更制約のため RA-002 では本文のみ更新・description は未更新）。
- 本文・commands/agentdev/README.md は Wave 2-3 で「自動 promote 対象カテゴリに合致する」語彙へ統一済みであり、frontmatter description のみ旧語彙が残る非対称状態。
- 関連する別文脈の語彙残存: `src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md` 18行・89行・99行も「高確信度カテゴリ」表現が残存している（#3283 スコープ。ただし auto-promote-and-review.md 109-110行は Jev を適用しない決定的カテゴリ適合の判定原理を明記しており、REQ-096-004 禁止対象〔確信度を人間判断要求の根拠とする〕ではなく自動化許可条件〔別文脈〕。REQ-036-021 と同クラス）。
- 期待する状態: frontmatter description と SKILL.md の「高確信度」表現を、本文と同一の「自動 promote 対象カテゴリに合致する」等のカテゴリ合致ベース語彙へ統一する（決定的カテゴリ適合という現行判定原理の表現整合）。REQ-036-021 の現行性確認（learning inbox 記録済み）と同時に処理する候補。

## 再導出手段

- PR #3288 本文「Findings / Capture候補」第1項（frontmatter description 残存の申告）を参照。
- src/opencode/commands/agentdev/inspect-promote.md（frontmatter description）・src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md 18/89/99行・src/opencode/skills/agentdev-workflow-inspect-promote/references/auto-promote-and-review.md 109-110行（決定的基準の明記）の対照で再導出可能。
- 関連: REQ-096-004（確信度を人間判断要求の根拠とする禁止）・REQ-036-021（自動昇格 opt-in 条件）・.agentdev/learning/inbox.md「REQ-036-021 の高確信度語彙は自動昇格 opt-in 条件（REQ-096-004 禁止対象の別文脈）として現行性確認を要する」エントリ。
