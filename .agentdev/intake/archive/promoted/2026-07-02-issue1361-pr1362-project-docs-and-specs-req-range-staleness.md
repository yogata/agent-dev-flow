# docs/guides/project-docs-and-specs.md の REQ 範囲記載が stale（REQ-0156 まで ↔ 実際は REQ-0158 まで）

## 観察

case-close Issue #1361 / PR #1362 (Project Doc Inputs Migration, REQ-0157 / ADR-0133) の Step 3 docs 検証中に観察。PR #1362 は doc-inputs 移行が主眼であり、ガイドファイルの REQ 範囲記載は対象外。移行後も `docs/guides/project-docs-and-specs.md` line 26 の REQ 範囲記載が stale なまま残存する。

対象:
- `docs/guides/project-docs-and-specs.md` line 26: 「現行 REQ は REQ-0101 から REQ-0156 までの 48 件」
- `docs/README.md` line 4（現行）: 「現行要件の第一参照先は REQ-0101 から REQ-0158 までの 50 件」

ガイドが README より2件（REQ-0157, REQ-0158）、2件（48 → 50）古い。pre-existing の req-range-staleness。

## 影響

- ガイド読者が REQ 範囲を誤認する可能性（実際より2件少ない）
- docs/README.md（現行 SSoT 的位置づけ）と docs/guides/project-docs-and-specs.md で REQ 範囲表記に不整合
- 実動作への影響なし。ドキュメント整合性の問題

## 修正されなかった理由

PR #1362 の完了条件は doc-inputs 移行。`docs/guides/**` の REQ 範囲記載の更新は本 PR のスコープ外。case-run が finding-002 として PR 本文に記録し、case-close が capture 回収した。pre-existing の staleness であり本 PR が導入したものではない。

## 課題

- `docs/guides/project-docs-and-specs.md` line 26 の「REQ-0101 から REQ-0156 までの 48 件」を「REQ-0101 から REQ-0158 までの 50 件」に更新
- 他のガイドファイルでも同様の REQ 範囲 staleness がないか横断確認を推奨（`docs/guides/*.md` 配下）

## 想定対応 Issue

- 保守系（maintenance）— ガイドの REQ 範囲記載更新。優先度は高くない（実動作への影響なし）
- 次回ガイド整備時に併せて更新することを推奨

## 根拠

PR #1362 本文「## Findings / Capture候補 > finding-002 (intake)」より:

> `docs/guides/project-docs-and-specs.md` が REQ 範囲を REQ-0156 までと記載（実際は REQ-0158 まで存在）。pre-existing の req-range-staleness NG。本件スコープ外だが次回ガイド整備時に更新推奨。

## 観測元

- PR #1362 (Issue #1361 / REQ-0157 Project Doc Inputs Migration)
- case-close Step 10 capture 回収
- 観測日時: 2026-07-02 (case-close 実行中)
