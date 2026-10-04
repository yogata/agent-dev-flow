# REQ-099/DEC-049 再構成後の src/opencode 旧パス参照クラスタ（Design↔実装 DRIFT）

- **分類**: inspect finding promote（DS-01・severity high・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261004T162140Z（backlog-auto stage 1）。inspect-promote 2026-10-05 自律確定

## 観測（evidence・実測確認済み）

- 実装の真実: check_integrity.ts が `.opencode → src/common` を解決（243-249行）、`IR058_DISTRIBUTION_DIRS = ["src/common/commands/agentdev", "src/common/skills", ...]`（5459-5465行）
- fs 状態: src/opencode/skills/ は 5 件のみ（src/common/skills は 50 件・実計数確認済み）、src/opencode/commands/ は存在せず
- IR-028 detection_method の `src/opencode/commands/agentdev/*.md` 旧パス現在形宣言を実読確認。同様の旧ルート現在形宣言が次に残存:
  - integrity ルール文書: IR-028:16、IR-029:16、IR-049:13、IR-053:16-17、IR-055:13/17、IR-058:13/16/17/24/43、IR-059:21、IR-062:78、IR-063:17/38、IR-064:13/17/38、IR-067:43、IR-068:17（detection_method/affected_artifacts/検査対象）
  - integrity 本体: integrity-rule-catalog.md:189、prose-quality-sentinel-checks.md:22-24、targeted-docs-guard-implementation.md:112/202/209
  - command Design 定型文「command 定義（`src/opencode/commands/agentdev/*.md`）はその実行時投影」: req-define.md:485、learning-promote.md:104、intake-promote.md:89、intake-from-github.md:56、intake-capture.md:52、inspect-skills.md:25-26/68、inspect-promote.md:64、_template.md:66 ほか計10件
  - req-define.md:195（実在しない `src/opencode/skills/agentdev-req-analysis/SKILL.md` を正規位置として参照）、agentdev-skill-authoring.md:44

## 影響課題

IR ルール群の検査対象契約が現行構造と矛盾し、文書通りに走査すると対象を取り逃す。再構成（43f4d392/54c54db9）で実装と一部 Design のみが追随し、残りが取り残された。IR-053/059 は対象期間内変更ファイルなのに旧パスのまま。

## 対応候補

二系統: (1) docs-check route: docs/designs 内パス実在性検査によるパス追随 sweep の機械化（IR-055 系パターンの Design 適用）。(2) intake route: IR ルール affected_artifacts 一括是正の要件化。

## 既存要件関連

REQ-099、DEC-049、multi-host-canonical-model.md:19-29。

## 統合注記（backlog-review での統合判定候補）

免除判定済み（歴史・例示・現存パス）: backlogs-identifier-threshold.md:26（PR 事故履歴）、concrete-abstraction.md:50-52（検出記録の引用例）、IR-066:48（語彙例）、agentdev-quality-gates.md:80（現存パス）。DC-02（DEC-010）は Decision 側の同根問題として別成果物。
