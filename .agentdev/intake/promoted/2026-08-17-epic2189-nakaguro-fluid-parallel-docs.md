# REQ-021・AG SPEC の中黒（・）流動的並列表記 — 読点または箇条書きへの置換候補

## 観測内容

文書品質査読（TS-QC-001）の機械判定で中黒の流動的並列候補を検出: REQ-021.md REQ-021-005「生成・鮮度」、AG SPEC「提供する判断・操作」（L36）、「実現・実装」（L102-103）、「統合・上位化」（L103）、「優先・除外規則」（L111）、「識別子・説明語」（L221）、「補完・反証」（L223）、「競合・混同」（L289）。いずれも docs 編集禁止パスのため本 PR では未対処。

## 影響

- 並列語の区切りが中黒のままのため、文書品質基準（機械判定）上の改善候補が残存する

## 課題

agentdev-doc-writing の機械判定候補として読点または箇条書きへの置換を検討する。配布物（src/opencode）側は本 PR 差分由来ではないため対象外。

## 既存要件・成果物との関連

- 対象: docs/requirements/REQ-021.md、docs/specs/skills/agentdev-artifact-graph.md
- 判定: TS-QC-001 文書品質査読（agentdev-doc-writing 機械判定）
- 出典: Issue #2192 (CLOSED), Epic #2189、PR #2197 (merged 1f415d05)

## 出典

- 発生日: 2026-08-17
- 発生源: PR #2197 case-run 検証（TS-QC-001 文書品質査読）
- 元 item: intake-2026-08-17-epic2189-nakaguro-fluid-parallel-docs.md
