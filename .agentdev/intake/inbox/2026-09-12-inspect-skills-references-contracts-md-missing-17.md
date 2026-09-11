# agentdev-inspect-skills references/contracts.md 不在参照（reference-path-existence NG 17 件）

## 概要

case 2785 の full-audit で新規 unmanaged NG 17 件として検出された `agentdev-inspect-skills/references/` 配下の `references/contracts.md` 不在参照（reference-path-existence）の修復判断候補。本 case（SKILL.md L53 用語置換・docs_chore）の変更対象と無関係の pre-existing 起因のため case 2785 では処置せず、intake 経由で修復・baseline 登録の判断先を確定する。

## 内容

- `src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md:202` および `references/spec-operation-contract-consistency.md` 複数行で `references/contracts.md` を参照しているが、当該ファイルは src / projection（.opencode/skills）双方に存在しないため reference-path-existence が NG 17 件を報告する
- check_integrity.ts full-audit（worktree root cwd・bun 実行）の報告: 「17 new unmanaged NG (delta, exit code driver)」。baseline-known 管理外の新規 unmanaged として分類される
- 類似既存 intake item: `2026-09-12-ng-baseline-registration-decision-for-worktree-fallback.md`（IR-062 ng 15 件として観測・ng-baseline 登録判断）。同一根拠ファイル（contracts.md 不在）の検出だが観測時点で件数・検出器（IR-062 vs reference-path-existence）が異なるため、統合または分離判断は intake-promote 側で行う

## 根拠

- 観測元: PR 2786（case 2785 / issue 2785、`## Findings / Capture候補` intake セクションおよび `## 検証差分` 無効 17 件行）、case-close（2026-09-12）で回収
- 元テキスト: 「`agentdev-inspect-skills/references/` 配下 2 ファイル（`semantic-diagnostic-perspectives.md:202`、`spec-operation-contract-consistency.md` 複数行）で `references/contracts.md` 不在参照（reference-path-existence）が full-audit で新規 unmanaged NG 17 件として検出。本 case（artifact-validation 用語置換）と無関係のため処置せず、intake 経由での確認候補として記録」
