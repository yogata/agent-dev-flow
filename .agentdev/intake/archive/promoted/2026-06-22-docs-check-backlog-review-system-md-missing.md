# backlog-review コマンドが docs/specs/system.md のコマンド一覧に未登録

## 観測

`/repo/docs-check` の `expanded-readme-sync` ルールが NG 1 件を報告。

> backlog-review exists in agentdev/ but not found in system.md

`.opencode/commands/agentdev/backlog-review.md` が実在する一方で、`docs/specs/system.md` のコマンド一覧に backlog-review が含まれていない。原因は確認済（コマンド追加時の system.md 同步漏れ）。

## 影響

- `/repo/docs-check` が継続して NG を報告する（ノイズ）。
- `docs/specs/system.md` をコマンド目次として参照する利用者・エージェントが backlog-review の存在を認知できず、RU から req-define への導線を見落とす可能性がある。
- `docs/requirements/README.md` や `src/opencode/commands/agentdev/README.md` には記載されているため、文書間の不整合が生じている。

## レビューで決めること

- `docs/specs/system.md` のコマンド一覧へ backlog-review を追加する。
- 併せて他のコマンド（case-update, case-auto 等の新規コマンド）も system.md へ漏れなく反映されているか横展開確認するか。
- `expanded-readme-sync` ルールの対象を「agentdev/ 全コマンド ↔ system.md」で担保するか、それとも system.md を補助資料（README.md が一次）として扱いルールを緩和するか。

## 根拠

- 検出ルール: `expanded-readme-sync` NG（`check_integrity.ts`）
- 対象コマンド: `.opencode/commands/agentdev/backlog-review.md`（実在・junction 先は `src/opencode/commands/agentdev/backlog-review.md`）
- 検出元: `/repo/docs-check` 実行（2026-06-22）
- 関連: README.md（root）入口表、`src/opencode/commands/agentdev/README.md` には backlog-review が記載済み
