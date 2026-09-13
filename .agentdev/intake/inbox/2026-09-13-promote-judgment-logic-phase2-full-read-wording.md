# promote-judgment-logic.md Phase 2 記述に旧全面読み契約の字面残存

## 概要

learning-promote deferred.md 読込2フェーズ化（case 2789、REQ-038-006）の実装後に、旧全面読み契約の字面が `promote-judgment-logic.md`（agentdev-learning-pipeline 配布 skill reference）の Phase 2 記述に残存していることが確認された。本ファイルは RA-001/RA-002 の ownership_hints 外のため当該 PR では変更せず、2フェーズ読込契約への字面更新の判断候補として記録する。

## 内容

- `src/opencode/skills/agentdev-learning-pipeline/references/promote-judgment-logic.md` の Phase 2 記述「inbox.md + deferred.md から全エントリをパース」に、旧全面読み契約の字面が残存している
- 2フェーズ化後の `analysis-and-review.md` STEP-1（inbox は全面読込・正規化、deferred は候補本文のみ解析対象）と字面が競合し得る
- 実行手順の正規所有者は workflow skill STEP-1（learning-promote Design「所有関係と委譲」）であり、duplicate 判定ロジック自体（evaluation-report.md のクラスタ主入力、本文突合）は AG-002（候補選択は過剰包含、判定は本文突合）と整合しているため即時の矛盾ではない
- 更新を行う場合は字面のみの修正（「deferred は STEP-1 で選択された候補エントリ本文からパース」等）でよく、判定ロジックの変更を伴わない

## 根拠

- 観測元: PR 2790（case 2789 / issue 2789、`## Findings / Capture候補` intake セクション。scope-affecting impact candidate 整合確認時に検出）、case-close（2026-09-13）で回収
- 元テキスト: 「`src/opencode/skills/agentdev-learning-pipeline/references/promote-judgment-logic.md` の Phase 2 記述『inbox.md + deferred.md から全エントリをパース』に、旧全面読み契約の字面が残存している。本 PR 後の analysis-and-review.md STEP-1（inbox 全面 + deferred 候補本文のみ）と字面が競合し得る。実行手順の正規所有者は workflow skill STEP-1（learning-promote Design『所有関係と委譲』）であり、duplicate 判定ロジック自体（evaluation-report.md のクラスタ主入力、本文突合）は AG-002 と整合しているため即時の矛盾ではないが、2フェーズ読込契約への字面更新候補。本ファイルの変更は ownership_hints（RA-001/RA-002）外のため本 PR では実施しない」
