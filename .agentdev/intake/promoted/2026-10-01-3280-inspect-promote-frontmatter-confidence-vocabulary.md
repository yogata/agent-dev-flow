# intake: inspect-promote frontmatter description の「高確信度」語彙の新モデル語彙統一候補

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

- `src/opencode/commands/agentdev/inspect-promote.md` の frontmatter description に「高確信度」語彙が残存している（frontmatter 無変更制約のため RA-002 では本文のみ更新・description は未更新）
- 本文・commands/agentdev/README.md は Wave 2-3 で「自動 promote 対象カテゴリに合致する」語彙へ統一済みであり、frontmatter description のみ旧語彙が残る非対称状態
- 関連する別文脈の語彙残存: `src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md` 18行・89行・99行も「高確信度カテゴリ」表現が残存している（#3283 スコープ。ただし auto-promote-and-review.md 109-110行は Jev を適用しない決定的カテゴリ適合の判定原理を明記しており、REQ-096-004 禁止対象〔確信度を人間判断要求の根拠とする〕ではなく自動化許可条件〔別文脈〕。REQ-036-021 と同クラス）

## 影響・課題

- 判断モデル語彙の非対称残存は、REQ-096 判定表語彙への移行完了度を不透明にする
- 自動化許可条件の文脈（REQ-096-004 禁止対象外）であることを判定表側で保持しつつ、表現をカテゴリ合致ベースへ統一する必要がある

## 既存要件・成果物との関連

- REQ-096-004（確信度を人間判断要求の根拠とする禁止）
- REQ-036-021（自動昇格 opt-in 条件。learning deferred に語彙現行性の確認候補として記録済み）
- src/opencode/commands/agentdev/inspect-promote.md（frontmatter description）
- src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md 18/89/99行
- src/opencode/skills/agentdev-workflow-inspect-promote/references/auto-promote-and-review.md 109-110行（決定的基準の明記）

## 対応候補

- frontmatter description と SKILL.md の「高確信度」表現を、本文と同一の「自動 promote 対象カテゴリに合致する」等のカテゴリ合致ベース語彙へ統一する（決定的カテゴリ適合という現行判定原理の表現整合）
- frontmatter 変更は command 定義の構造変更に当たるため、command authoring 品質基準の下で実施
- REQ-036-021 の現行性確認（learning deferred エントリ）と同時に処理する候補

## 統合・関連 item

- 2026-10-01-3288-inspect-promote-frontmatter-confidence-term.md（同一 PR #3288 の Wave 2 回収時点記録。本 item は Wave 3 最終回収で同一対象を網羅するため統合して本成果物で処理。Wave 2・Wave 3 の両方で観測されたことを本注記で保持）

## 元 item

- 観測日: 2026-10-01
- 観測元: Epic #3280 Wave 3 case-close 最終 Capture 回収（PR #3288 本文 Findings。Issue #3284 / RA-002 で検出）
- 再導出手段: PR #3288 本文「Findings / Capture候補」第1項を参照。src/opencode/commands/agentdev/inspect-promote.md frontmatter と本文の対照で再導出可能
