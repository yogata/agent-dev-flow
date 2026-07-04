# SPEC project-extensions.md 具体ID厳格定義と実態の乖離判断

## 観測

PR #1411（Epic #1403 Wave 3, Issue #1407）の検査実装で判明。SPEC `docs/specs/foundations/project-extensions.md` は「command/skill 本文の参照禁止」セクションで具体ID（`ADR-NNNN`, `REQ-NNNN`）記述を厳格に禁止する。しかし実運用では、配布 command/skill 本文において `REQ-NNNN-NNN` 形式（サブ要件番号）の引用が広く普及しており（303件、56ファイル）、SPEC 厳格解釈と実態が乖離している。

## 影響

- SPEC に忠実な解釈では配布物本文の303件がすべて違反。しかし `REQ-NNNN-NNN` サブ要件番号は、トレーサビリティのために command/skill 本文から REQ 詳細仕様を参照する実務上の慣行として定着している。
- SPEC を厳格適用して303件を一括 generic 表記へ是正すると、command/skill 本文から REQ 詳細仕様への traceability が失われる可能性がある。
- 一方で、配布物をプロジェクト非依存に保つという ADR-0135 の本来目的からは、具体参照の排除が望ましい。

## レビューで決めること

以下いずれかの方向性を決定する必要がある:
- (a) **SPEC 緩和**: `REQ-NNNN-NNN` サブ要件番号引用を許容するよう SPEC を修正し、`ADR-NNNN`/`REQ-NNNN` の4桁 root ID のみ禁止とする
- (b) **SPEC 厳格適用**: 配布物本文を一括で generic 表記へ是正し、traceability は extensions 経由で担保する（関連 intake: `distribution-boundary-303-existing-violations`）
- (c) **中間**: extension 側で許容対象 ID リストを定義し、検査機構が許容リストベースで判定する

## 根拠

PR #1411 Findings/Capture候補 #2 より。Wave 3 case-close で回収。SPEC 確定フロー（case-close Step 3-2）の入力として case-close 時に判断が必要だが、本判断は SPEC 修正を伴うため spec-save 再起動または見送りが妥当。本 intake は判断を backlog-review → req-define へ委ねる。
