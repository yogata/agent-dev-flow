# promote-judgment-logic.md Phase 2 記述に旧全面読み契約の字面残存

## 観測内容

learning-promote deferred.md 読込2フェーズ化（case 2789、REQ-038-006）の実装後に、旧全面読み契約の字面が `promote-judgment-logic.md`（agentdev-learning-pipeline 配布 skill reference）の Phase 2 記述に残存している。

本 promoted 成果物の生成時点（2026-09-15）で再検証済み:

- `src/opencode/skills/agentdev-learning-pipeline/references/promote-judgment-logic.md` L10-12 の「全エントリの読込と旧フォーマット正規化」「inbox.md + deferred.md から全エントリをパース」残存を grep 確認

## 影響

- 2フェーズ化後の `analysis-and-review.md` STEP-1（inbox は全面読込・正規化、deferred は候補本文のみ解析対象）と字面が競合し得る。ただし実行手順の正規所有者は workflow skill STEP-1（learning-promote Design「所有関係と委譲」）であり、duplicate 判定ロジック自体（evaluation-report.md のクラスタ主入力・本文突合）は AG-002（候補選択は過剰包含、判定は本文突合）と整合しているため即時の矛盾ではない

## 課題（対応候補と判断材料）

- 更新は字面のみの修正（「deferred は STEP-1 で選択された候補エントリ本文からパース」等）でよく、判定ロジックの変更を伴わない

## 既存要件との関連

- REQ-038-006（deferred.md 読込2フェーズ化）: 字面更新の契約基準
- AG-002（duplicate 判定の本文突合）: 判定ロジック整合の確認済み根拠

## 根拠

- 観測元: PR 2790（case 2789 / issue 2789）`## Findings / Capture候補` intake セクション（scope-affecting impact candidate 整合確認時に検出）、case-close（2026-09-13）で回収
- 処分経緯: intake-promote（2026-09-15）で L12 残存を grep により機械再確認し、採用を確定（自律確定）
