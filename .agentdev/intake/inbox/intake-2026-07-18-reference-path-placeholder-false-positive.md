# Intake Item: ReferencePath 検査の false positive（`<harness>` placeholder）

## 発生源

- docs-check 実行日時: 2026-07-18
- 検査スクリプト: check_integrity.ts (ReferencePath)
- 検査ルート: intake
- 原因分類: 確認済（検査スクリプト側の誤検出）

## 問題

check_integrity.ts の ReferencePath 検査が、`references/<harness>.md` のような山括弧 placeholder 構文をリテラルパスとして扱い、「参照先が存在しない」と誤判定している。

検出11件（すべて同一パターン）:

- `src/opencode/commands/agentdev/case-auto.md:65,97,138`
- `src/opencode/commands/agentdev/case-run.md:141,213`
- `src/opencode/skills/agentdev-architecture-advisory/SKILL.md:76`
- `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:29,31,130,132,159`

文脈確認: 当該箇所はすべて「AGENTS.md および references/<harness>.md 参照（REQ-0162-002）」等の形で、harness 名（oh-my-openagent 等）で置換されるべき変数表記として使用されている。配布物が複数 harness に対応するため、harness 固有の参照を抽象化する正当な placeholder。

## 推奨修正対象

検査スクリプト `check_integrity.ts` の ReferencePath 検査処理に placeholder 除外ロジックを追加する。

修正方針候補:

1. パス中に `<...>` 構文を含む場合、placeholder として検査対象外にする（最も簡潔）
2. `references/<harness>.md` 等の既知 placeholder パターンを allowlist 化する
3. placeholder を含むパスは独立した INFO finding として報告する（参考情報扱い）

整合性確認: 既存の `<harness>` 以外にも placeholder 表記が使われている箇所があるか、配布物全体を `grep -r "<[a-z_]\+>"` 等で精査し、一般化された除外ロジックとする。

昇格先候補: intake-promote で採否判断。検査スクリプトの改修は `repo-agentdev-integrity` skill 配下（`scripts/check_integrity.ts`、`scripts/check_integrity.test.ts` の回帰テスト）で実施。

## 関連

- 検出元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report-2.md`（ReferencePath セクション）
- 関連 REQ: REQ-0162-002（`<harness>` placeholder を AGENTS.md / references/<harness>.md に配置する規約）
- 検査スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- 検査テスト: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts`
