# DEC-010 本文が廃止済み DEC-002 の現在形維持宣言と src/opencode 旧原本主張を現行宣言として保持

- **分類**: inspect finding promote（DC-02・severity high・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261004T162140Z（backlog-auto stage 1）。inspect-promote 2026-10-05 自律確定。**20260925 defer F-08（DEC-010 が superseded DEC-002 を現在形で「維持する」と記述）のエスカレーション併合**
- **F-08 系譜の保存**: F-08 の論点（Decision を受領時点の歴史記録として保持する立場 vs 後継 DEC への参照注記追加）は本件の判断対象に含まれる。src/opencode 原本主張が REQ-099/DEC-049 受理により現行 REQ と正面矛盾化したことで、既知 defer（low〜medium 扱い）から矛盾度が上昇したもの

## 観測（evidence・実測確認済み）

- `docs/decisions/DEC-010.md:35-36` が「DEC-002（ソース・プロジェクション分離）を維持する。新 Workflow Skill / Capability Skill は src/opencode/skills/ を原本とする。」と現在形で記述（実読確認済み）
- (a) DEC-002 は superseded（by DEC-036）
- (b) 「src/opencode/skills/ を原本とする」は REQ-099/DEC-049 受理（共通正本は src/common、src/opencode/skills は 5 件のみ・src/common/skills は 50 件）により現行構造と矛盾
- accepted Decision の本文が現行 REQ（REQ-099）より下位の主張を現在形で維持する状態

## 影響課題

読者が DEC-010 を正とした場合、共通正本構造（multi-host-canonical-model）と矛盾する配置判断を導く恐れがある。

## 対応候補

intake route: DEC-010 部分置換の req-define 壁打ち対象。DEC-032:28・DEC-039:53 の「superseded 実行済み」明示パターンが修正の参照形。F-08 が保持する後継注記ポリシーの論点も壁打ちで確定する。

## 既存要件関連

REQ-099（共通原本とホスト接続領域の分離）、DEC-049、multi-host-canonical-model.md。

## 統合注記（backlog-review での統合判定候補）

DS-01（src/opencode 旧パス参照クラスタ）は Design・配布物側の同根問題として別成果物。本件は Decision 側。両者の同時是正を backlog-review で束化判定可。
