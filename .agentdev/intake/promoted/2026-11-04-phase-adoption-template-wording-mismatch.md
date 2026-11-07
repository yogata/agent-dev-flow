# phase_adoption_record_contract.test.ts の期待文言不一致（full suite split 1 継続 fail）

## 観測内容

`phase_adoption_record_contract.test.ts`「初回保存経路の workflow skill が非破壊実体化を規定する」テストの期待文言（`` `templates/phase-readme.md` `` — backtick が templates の直前）と、`agentdev-workflow-phase-{tasks-create,tasks-update,artifacts-update}` SKILL.md の実文（`.opencode/skills/agentdev-phase-theme-collaboration/templates/phase-readme.md` 全体を1つの backtick で囲む）が不一致で、テストが不合格になる。merge 直前 HEAD 9680a8eb1 と baseline afd9e0607（detached worktree）の双方で同一 fail を再現（pre-existing 分類）。worktree 依存でなく repo 本体の既存不整合であり、full integrity suite split 1 を fail させ続ける。

観測元: PR #3904 本文 `## Findings / Capture候補`（### intake 第1項）、Issue #3902（case-close 対応記録コメント 6617043300）。

## 影響

full integrity suite split 1 が継続的に fail し、suite 全体の fail 検知能力を損なう。新規の真の fail が既知欠陥の中に埋もれ、変化検知の信頼性が低下する。

## 課題

テスト期待文言と SKILL.md 実文のどちらを正とするかの決定が最初の判断点である（現行では SKILL.md 側の実文が正規表記であることを確認した上でテスト期待文言を修正する方向で整理する。判断は backlog-review 以降の RU 化・実装時に確定する）。修正対象は 1 箇所の文言不一致であり対応は軽微。

## 既存要件との関連

- REQ-117-002 は既知の inline コードフェンス破損箇所（3 箇所 + 複製整合 9 箇所）を対象とし、本件の phase_adoption_record_contract.test.ts 期待文言不一致は含まない別欠陥である。
- 対論型レビュー（intake-promote STEP-2）で、現在の main HEAD において欠陥が実在することを確認済み（テスト期待文言 `` `templates/phase-readme.md` `` と SKILL.md 実文の不一致を再検証）。
