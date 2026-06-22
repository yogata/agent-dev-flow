# backlog-review コマンドが docs/specs/system.md のコマンド一覧に未登録

## 観測

`/repo/docs-check` の `expanded-readme-sync` ルールが NG を報告。backlog-review コマンドは実在するが、`docs/specs/system.md` のコマンド一覧に記載漏れ。README.md や `src/opencode/commands/agentdev/README.md` には記載済みだが、system.md にのみ漏れている。

## 影響

- docs-check が継続して NG を報告する
- system.md をコマンド目次として参照する利用者が backlog-review を認知できず、RU から req-define への導線を見落とす可能性

## 課題

- system.md のコマンド一覧へ backlog-review を追加
- 他の新規コマンドも漏れなく反映されているか横展開確認

## 既存要件との関連

- なし（文書整合性の観点。特定 REQ 番号は明示されていない）

## 根拠

- 元 inbox item: `2026-06-22-docs-check-backlog-review-system-md-missing.md`
- 検査: `expanded-readme-sync`
