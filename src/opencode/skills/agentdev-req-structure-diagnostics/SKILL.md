---
name: agentdev-req-structure-diagnostics
description: inspect-docs コマンドの REQ 構造診断ロジックの知識ベース。USE FOR: REQ参照ID整合性確認、第一参照導線確認、現行/廃止/世代境界確認、6観点診断（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）、未処理成果物確認、問題候補出力スキーマ。DO NOT USE FOR: backlog統合手順（agentdev-backlog-integration を参照）、intake pipeline（agentdev-intake-pipeline を参照）、work_type判定（agentdev-workflow-lifecycle を参照）
---

# REQ 構造診断知識ベース

inspect-docs コマンドの REQ 構造診断知識ベース。
REQ参照ID整合性、第一参照導線、現行/廃止/世代境界、6観点診断、未処理成果物確認、問題候補出力スキーマの判定基準と検出シグナルを提供する。
検査対象を直接修正しない診断専用であり、本スキルは判定ロジックの提供のみを行い、ファイル変更や成果物処理は行わない。

## USE FOR

- REQ参照ID整合性確認（frontmatter `id` 一意性、ファイル名整合、相互参照の存在）
- 第一参照導線確認（DOC-MAP、README、requirements/README 導線）
- 現行/廃止/世代境界確認（廃止専有 ID、二重存在、100s番台境界）
- SPEC分離基準違反検出（REQ 要件行に残留した schema field、enum 値一覧、判定表、file pattern、テンプレート種別、report format、内部アルゴリズム、作業履歴、実装パラメータ）
- 配布物 ID 汚染検出（`src/opencode/commands/`、`src/opencode/skills/` への `REQ-XXXX`/`ADR-XXXX`/`SPEC-{KIND}-{NNN}`/`IR-XX` 等の内部 ID 残留）
- 配布物統合性検出（`docs/specs/integrity/docs-spec-rebuild-integrity.md` 準拠）: ID 除去後の構文健全性（frontmatter 重複、見出し重複、Markdown 構文破損）、文意保持（壊れた括弧、壊れた参照表現、主語/目的語欠落文）、責務整合（command 本体と SPEC 間の責務説明照合、case-open/run/close/auto の責務境界一致、command と関連 skill 間の責務説明照合）、NG 分類（false positive/ pre-existing/ 今回修正対象）
- SPEC 三層構造の整合性検出（commands/skills/workflows 層分離違反、旧 grab-bag SPEC 残存）
- HOW 除去後の acceptance-criteria 順位検証（機械的除去で見逃された HOW 残留、ID 残留、責務混入の再検出）
- 6観点診断（SPLIT/ MERGE/ MOVE/ DUPLICATE/ RETIRE/ DRIFT）とシグナル閾値
- 未処理成果物の確認（intake/learning/RU の存在と影響の報告）
- 問題候補出力スキーマ（7フィールド構成）と診断結果の出力構成

## DO NOT USE FOR

- backlog 統合手順: `agentdev-backlog-integration` を参照
- intake pipeline（capture/promote の処理手順）: `agentdev-intake-pipeline` を参照
- work_type 判定、フェーズ定義: `agentdev-workflow-lifecycle` を参照

## 対象コマンド

| コマンド | 目的 |
|----------|------|
| inspect-docs | docs全体の意味整合性レビューにおける REQ 構造診断ロジックの提供（REQ参照ID整合性、第一参照導線、現行/廃止境界、SPEC分離基準違反検出、6観点診断、未処理成果物確認、問題候補出力スキーマ、配布物統合性検出（構文健全性、文意保持、責務整合、NG 分類）） |

## references/ 構成一覧

| ファイル | 内容 |
|----------|------|
| `references/req-structure-review.md` | REQ参照ID整合性確認、第一参照導線確認、現行/廃止/世代境界確認、SPEC分離基準違反検出、配布物 ID 汚染検出、配布物統合性検出（構文健全性、文意保持、責務整合、NG 分類、`docs/specs/integrity/docs-spec-rebuild-integrity.md` 準拠）、SPEC 三層構造の整合性検出、HOW 除去後の acceptance-criteria 順位検証、6観点診断（観点、検出シグナル、シグナル閾値）、未処理成果物確認、診断結果の出力（問題候補出力スキーマ7フィールド） |

## See Also

- **agentdev-workflow-lifecycle**: work_type 判定、フェーズ定義
- **agentdev-doc-map**: DOC-MAP 索引構造、summary/index 文書の分量基準

