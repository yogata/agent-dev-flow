# REQ-0030-009/010/011 pre-existing failure（case-close/case-open Steps 構造・ADR README 存在性）

## 観測内容

Phase 6 worktree と main baseline の双方で同一に fail する3件の pre-existing failure が存在する。case-close/case-open の Steps section 構造・template skill coverage、case-close body numbered step、case-close/case-open full validation・ADR README.md 存在性に関連する。

## 影響

- Phase 6 スコープ外の構造的改善要求が未対応のまま残る
- テストの base 失敗として新規失敗の判別ノイズになる

## 課題

独立 RU 化し、case-close/case-open command の Steps 構造と ADR README.md 存在性前提箇所を是正する。

## 既存要件・成果物との関連

- 対象: src/opencode/commands/agentdev/case-close.md、case-open.md
- 関連: REQ-0030-009/010/011、DEC-009（ADR→Decision 移行）、commands_e2e の ADR README 期待値（promoted item 2026-08-15-commands-e2e-adr-readme-stale-expectation と一部重複の可能性）

## 出典

- 発生日: 2026-08-11
- 取得元: Phase 6 検証時の観測
- 元 item: intake-2026-08-11-req-0030-pre-existing-failure.md
