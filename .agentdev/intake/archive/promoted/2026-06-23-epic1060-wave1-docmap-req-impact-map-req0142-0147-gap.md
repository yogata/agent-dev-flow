# DOC-MAP.md / req-impact-map.md に REQ-0142〜0147 が欠落（先行ギャップ）

## 発生源

- Epic: #1060 (Wave 1 close)
- Issue: #1061 (OU-001: REQ-0148 CREATE + ADR-0129 CREATE)
- PR: #1068 (merged, squash f24cf00a)
- 発生日: 2026-06-23

## 内容

PR #1068 の検証過程で、以下の先行ギャップ（本 PR スコープ外）を発見した。

1. **`docs/DOC-MAP.md` の現行 REQ テーブルに REQ-0142 が欠落している**。
   - REQ-0143〜0148 は記載済み。REQ-0142 のみ行欠落。
   - req-save 時のカタログ更新漏れの可能性。本 PR では REQ-0148 のみ追加し、REQ-0142 は別途対応。

2. **`docs/specs/req-impact-map.md` の Impact Matrix に REQ-0142〜0147 が欠落している**。
   - REQ-0148 は本 PR で追加済み（IR-006, IR-016 / commands 系）。REQ-0142〜0147 は未記載。
   - 低影響リストにも REQ-0142〜0147 が未記載。
   - 同様に req-save 時のカタログ更新漏れの可能性。

## 推奨対応先

`intake-promote` での分類後、`backlog-review` → `req-define`（docs_chore）→ `case-open` / `case-run` / `case-close` で DOC-MAP.md と req-impact-map.md へ REQ-0142〜0147 の行追加を行う候補。

## 現在の追跡状態

- `docs/DOC-MAP.md`: REQ-0142 行欠落（未修正）
- `docs/specs/req-impact-map.md`: REQ-0142〜0147 行欠落（未修正）
- 完了判定: 本 PR #1068 はスコープ外として進行。REQ-0142〜0147 のギャップは本 intake で記録。
