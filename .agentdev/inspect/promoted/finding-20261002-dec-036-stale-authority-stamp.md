# Design 権威参照の「DEC-036 現行」刻印残留（F-04 + F-05 刻印面）

- **分類**: inspect finding promote（F-04・severity low・confidence high / F-05 刻印面・low・high）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1）

## 観測（evidence）

- `docs/designs/workflows/workflow-skill-model.md:102`「原本は `src/common/skills/`、実行時投影先は `.opencode/skills/`（REQ-002-007。現行の責務体制は DEC-036）」
- `docs/designs/authoring/vocabulary-registry.md:30`「（現行の責務体制は DEC-036）」
- DEC-049 relations が「配備形態（正本配置・投影モデル）に関する部分を本 Decision が置換する」と宣言済み。配備形態面の権威参照としての「現行の責務体制は DEC-036」刻印は陳腐化
- 記述内容自体（原本・投影先パス）は新構成に整合しており、権威参照刻印のみが問題

## 影響課題

読者が配備形態の正を DEC-036 に求めてしまう（正は DEC-049）。既知 defer DS-22（harness-separation-model.md:72 の DEC-015 固有用語）と同型パターンで一括是正候補。

## 対応候補

「現行の責務体制は DEC-036」→「配備形態の正は DEC-049」への刻印更新。DS-22 との同型一括是正も候補。

## 既存要件関連

承認済み DEC-049（配備形態部分置換宣言）を正とする。

## 統合注記（backlog-review での統合判定候補）

- 既知 defer DS-22（20260926T180630Z finding 掲載・inbox 残置中）と同型。DS-22 を併合した一括是正 RU の構成を backlog-review で判定。
- intake promoted `2026-10-02-3332-local-design-docs-modernization-pending`（local Design 現行化）とも主題隣接。
