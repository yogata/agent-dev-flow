# OU-002 Wave 3 事前存在 NG（workflow-status-prohibition / retired-in-active-index / legacy-normative-marker）の横断是正

## 観測

OU-002 Wave 3 (#1021 / PR #1025) の横断検出で事前存在 NG findings として 3 違反が検出された。いずれも case-close での intake 化が漏れていたため事後収集された。`/repo/docs-check` が継続して NG を報告し続けている。

### 違反一覧

1. **workflow-status-prohibition**（REQ-0112 違反）: REQ-0112 で廃止された 6 状態否定表現（"not X" 形式）が現行文書に残存。ワークフロー状態モデルの一意性が損なわれる。
2. **retired-in-active-index**（REQ-0101-016 違反）: 廃止 REQ（REQ-0111, 0115, 0116, 0117, 0118, 0120, 0121, 0122）が現行索引で履歴マーキングなしに参照されている。
3. **legacy-normative-marker**（REQ-0122 廃止・REQ-0101-061 違反）: workflow-orchestration SKILL.md L29 に RFC2119 由来の「（MUST）」規範マーカーが残存。REQ-0122 で RFC2119 は完全廃止済み。

## 影響

- ワークフロー状態モデルの一意性が損なわれ、docs-check が継続 NG を報告
- 廃止 REQ が現行文書で不適切に参照され、利用者が廃止情報を現行と誤認するリスク
- 規範表現の権威源泉が REQ/ADR ではなく skill 本文に分散する

## 課題

- 各違反の該当ファイル・箇所を `/repo/docs-check` で特定し、REQ-0101-016 準拠の履歴マーキング・肯定文への書き直しを実施
- 機械判定ルールの検出パターン・exemption 条件を見直す必要があるか確認
- 3 違反を一括 case として扱うか、違反種別ごとに分割するか

## 既存要件との関連

- REQ-0112（6状態否定表現の禁止）
- REQ-0101-016（廃止REQ参照の歴史参照と現行参照の区別）
- REQ-0122（RFC2119 完全廃止）
- REQ-0101-061（英語語句の自然な日本語化）

## 根拠

- 元 inbox item:
  - `2026-06-22-epic1018-wave3-docs-check-workflow-status-prohibition.md`
  - `2026-06-22-epic1018-wave3-docs-check-retired-in-active-index.md`
  - `2026-06-22-epic1018-wave3-docs-check-legacy-normative-marker.md`
- 検出元: OU-002 Wave 3 (#1021 / PR #1025)
