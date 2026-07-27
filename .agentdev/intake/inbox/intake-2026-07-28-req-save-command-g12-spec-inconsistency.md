# intake: req-save command file G12 定義が SPEC と不整合

## 発生日

2026-07-28

## 発生元

- Epic: #1871 (工程横断 capture 境界拡張)
- Issue: #1874 (OU-003: req-save.md 副作用セクション更新)
- PR: #1911
- 取得元: PR #1911 本文「## Findings / Capture候補」セクション

## 問題事象

`src/opencode/commands/agentdev/req-save.md` 行314 の G12 制約定義が旧記述のまま残存:

> G12: req-save の capture 責務は原則非関与。intake/ learning capture を行わない。例外: REQ 再構成 intake（`.agentdev/intake/inbox/req-restructure/**`）のみ生成可能。

Issue #1874 で `docs/specs/commands/req-save.md`（SPEC）の「## 副作用」セクションは deviation capture 責務（agentdev-learning-capture skill / agentdev-intake-pipeline 委譲）へ更新されたが、command file 側の G12 定義は「原則非関与」の旧記述のまま。SPEC と command file で責務定義が不整合。

## 影響

- req-save command 実行時のガードレール（G12）と SPEC の責務定義が乖離。実装が SPEC へ追従する際に G12 と競合する可能性。
- req-save の完了報告に `Capture結果` 小節を含めるべきか、G12 が「capture 非関与」を主張するため判定が不明確。

## 発生局面

実装（case-close時の PR 本文 capture 回収）

## 検知方法

PR #1911 の Findings セクションで明示。`src/opencode/commands/agentdev/req-save.md` L314 の G12 文と `docs/specs/commands/req-save.md` L35 の deviation capture 記述を比較。

## 想定される対応方向

- case-update または follow-up Issue で `src/opencode/commands/agentdev/req-save.md` G12 を SPEC へ整合させる（deviation capture は Skill 委譲で実施、直接 inbox へは書き込まない、等）

## 関連

- Epic: #1871
- Issue: #1874 (OU-03)
- 対象ファイル: `src/opencode/commands/agentdev/req-save.md` L314
- SPEC: `docs/specs/commands/req-save.md` L35 (deviation capture), L99 (G12 旧記述の SPEC 側参照)

## 出典引用

PR #1911 本文「## Findings / Capture候補」より:

> `src/opencode/commands/agentdev/req-save.md` 行314 の G12 制約定義が旧記述のまま残存... 本 Issue の対象範囲は `docs/specs/commands/req-save.md`（SPEC）のみであり、command file の G12 定義は対象外。別途 case-update または follow-up Issue で整合させる必要がある。

## タグ

#intake #req-save #g12-inconsistency #spec-command-gap #epic-1871
