# req-save command の G12 定義と SPEC deviation capture 責務の不整合

## 観測内容

`src/opencode/commands/agentdev/req-save.md` の G12 制約定義が「原則非関与。intake/ learning capture を行わない。例外: REQ 再構成 intake（`.agentdev/intake/inbox/req-restructure/**`）のみ生成可能」という旧記述のまま残存している。
一方で Issue #1874 により `docs/specs/commands/req-save.md`（SPEC）の「## 副作用」セクションは deviation capture 責務（agentdev-learning-capture skill / agentdev-intake-pipeline 委譲）へ更新された。
結果として SPEC と command file で責務定義が不整合となっている。

## 影響

req-save command 実行時のガードレール（G12）と SPEC の責務定義が乖離しており、実装が SPEC へ追従する際に G12 と競合する可能性がある。
また req-save の完了報告に `Capture結果` 小節を含めるべきか、G12 が「capture 非関与」を主張するため判定が不明確になる。
優先度は中。

## 課題

`src/opencode/commands/agentdev/req-save.md` の G12 定義を SPEC（`docs/specs/commands/req-save.md`）へ整合させる。
整合理候補: deviation capture は Skill 委譲で実施し、command file は直接 inbox へ書き込まない、等。

【adversarial-review 残留リスク】
G12 は「原則非関与＋例外」との意図的な細則とも読め、SPEC 側（req-save SPEC deviation capture 責務）との矛盾か否かは RU shaping 時に SPEC 原文との照合が必須である。修正前に `docs/specs/commands/req-save.md` の deviation capture 定義と G12 旧記述の SPEC 側参照を直接照合すること。

## 既存要件との関連

- 対象: `src/opencode/commands/agentdev/req-save.md`（G12 定義）
- SPEC: `docs/specs/commands/req-save.md`（deviation capture、G12 旧記述の SPEC 側参照）
- REQ: REQ-005、REQ-007（capture 責務境界関連）
- Epic: #1871（工程横断 capture 境界拡張）
- Issue: #1874（OU-003）
- PR: #1911

## 出典

- inbox 元ファイル: `intake-2026-07-28-req-save-command-g12-spec-inconsistency.md`
- 発生日: 2026-07-28
- PR: #1911（Issue #1874 / OU-003, Epic #1871）
