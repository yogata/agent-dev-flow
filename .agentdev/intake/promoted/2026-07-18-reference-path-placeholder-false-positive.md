# ReferencePath 検査の false positive（`<harness>` placeholder）

## 観測内容

2026-07-18 の docs-check（検査スクリプト: `check_integrity.ts` ReferencePath、検査ルート: intake）で検出。

`check_integrity.ts` の ReferencePath 検査が `references/<harness>.md` のような山括弧 placeholder 構文をリテラルパスとして扱い、「参照先が存在しない」と誤判定している。

検出11件（すべて同一パターン）:

- `src/opencode/commands/agentdev/case-auto.md:65,97,138`
- `src/opencode/commands/agentdev/case-run.md:141,213`
- `src/opencode/skills/agentdev-architecture-advisory/SKILL.md:76`
- `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:29,31,130,132,159`

当該箇所はすべて「AGENTS.md および references/<harness>.md 参照（REQ-0162-002）」等の形で、harness 名（oh-my-openagent 等）で置換されるべき変数表記として使用されている。配布物が複数 harness に対応するため、harness 固有の参照を抽象化する正当な placeholder。

- 検出元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report-2.md`（ReferencePath セクション）

## 影響

検査レポートに11件の誤検出ノイズが恒常発生する。docs-check 結果の信頼性が低下し、真の破損参照を見逃す要因になる。機能自体への実害はないが、CI/検査の S/N 比悪化。

## 課題

`check_integrity.ts` の ReferencePath 検査が placeholder 構文を破損参照として誤検出している。

## 既存要件・仕様との関連

- REQ-0162-002（`<harness>` placeholder を AGENTS.md / `references/<harness>.md` に配置する規約）: 検査スクリプトが当該規約の placeholder 表記を考慮していない点で矛盾。

## 対応方針の方向性

検査スクリプト `check_integrity.ts` の ReferencePath 検査に placeholder 除外ロジックを追加する。修正方針候補:

1. パス中に `<...>` 構文を含む場合、placeholder として検査対象外にする（最も簡潔）。
2. `references/<harness>.md` 等の既知 placeholder パターンを allowlist 化する。
3. placeholder を含むパスを独立した INFO finding として報告する（参考情報扱い）。

配布物全体を精査し（`grep -r "<[a-z_]\+>"` 等）、`<harness>` 以外の placeholder 表記の有無を確認の上、一般化された除外ロジックとする。改修は `repo-agentdev-integrity` skill 配下の `scripts/check_integrity.ts` と回帰テスト `scripts/check_integrity.test.ts` で実施する。
