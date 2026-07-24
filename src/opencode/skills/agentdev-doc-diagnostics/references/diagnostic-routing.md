# 文書種別別診断へのルーティング

inspect-docs command が実行する docs 横断診断のうち、専門診断を要する事項を適切な専門 skill へルーティングするための規則を定義する。
本スキル（`agentdev-doc-diagnostics`）は横断編成と結果統合のみを所有し、専門診断の判定ロジックを再定義しない（AC-014、REQ-0109-048）。

## ルーティング対象と委譲先

| 診断観点 | 委譲先 skill | 本スキルの役割 | 委譲しない情形 |
|----------|--------------|----------------|----------------|
| REQ 固有 SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT | `agentdev-req-structure-diagnostics` | 横断的に複数 REQ を比較し、シグナルを抽出してルーティング | 該当なし（常に委譲） |
| REQ 参照 ID 整合性、第一参照導線、現行/廃止/世代境界 | `agentdev-req-structure-diagnostics` | 横断スキャンで対象を特定し、ルーティング | 該当なし（常に委譲） |
| SPEC 分離基準違反（HOW 詳細残留） | `agentdev-req-structure-diagnostics`（MOVE 観点） | 要件行のシグナル抽出（`diagnostic-categories.md` 参照）、安定契約例外判定の補助 | 該当なし（常に委譲） |
| 配布物 ID 汚染（`src/opencode/` の内部 ID 残留） | `agentdev-req-structure-diagnostics` | 横断スキャンで検出、ルーティング | 該当なし（常に委譲） |
| 配布物統合性（構文健全性、文意保持、責務整合） | `agentdev-req-structure-diagnostics` | 対象範囲の特定、ルーティング | 該当なし（常に委譲） |

配布物統合性の構文健全性には docs-spec-rebuild-integrity SPEC が定義する5パターン（frontmatter 重複、見出し重複、Markdown 構文破損、存在しない command 参照、エンコーディング不整合）が含まれる。存在しない command 参照は README listing と command 本文の相互参照について存在しない command を指す参照を検出し、エンコーディング不整合は UTF-8 BOM 付きファイルと単一ファイル内の CRLF/LF 混在を検出する。実在する command 参照、BOM なし UTF-8 かつ単一改行コードで構成されたファイルは検出対象外である。判定基準の詳細、検出手順、報告例は docs-spec-rebuild-integrity SPEC（extension 経由）と `agentdev-req-structure-diagnostics` が所有する。本スキルは横断スキャンで対象範囲を特定し、ルーティングする。
| SPEC 三層構造違反（commands/skills/workflows 層分離） | `agentdev-req-structure-diagnostics` | 横断的に SPEC を比較、シグナル抽出、ルーティング | 該当なし（常に委譲） |
| 文意品質（LLM っぽい表現、空虚な形容/動詞、英語混じり表現） | `agentdev-doc-writing` | 横断スキャンで検出、ルーティング | 該当なし（常に委譲） |
| 実行主体分類の誤認（command を skill と呼ぶ等） | `agentdev-doc-writing`（doc-writing 査読観点） | 横断スキャンで検出、ルーティング | 該当なし（常に委譲） |
| DOC-MAP 探索順、関連文書探索 | `agentdev-doc-map` | 横断スキャンで DOC-MAP 記載との整合性を確認、ルーティング | 該当なし（常に委譲） |
| Command/Skill 参照妥当性、Skill 構造 | `agentdev-inspect-skills`（独立 inspect-* 対象） | ルーティングしない（独立コマンド `inspect-skills` の対象） | inspect-docs からはルーティングせず、独立実行を促す |

## 委譲規則

### 1. 横断編成は本スキルが所有

複数文書種別にまたがる診断カテゴリ（廃止 REQ/SPEC 由来記述残置、REQ/SPEC 境界違反、REQ 粒度過小、横断契約矛盾）は本スキルが横断的にスキャンし、シグナルを抽出する（`diagnostic-categories.md` 参照）。
個別 REQ/ADR/SPEC の内部診断は専門 skill へルーティングする。

### 2. 専門診断の再定義禁止

本スキルの references には専門診断の判定ロジック（SPLIT シグナル閾値、REQ 参照 ID 整合性の具体的検出手順、文意品質判定辞書 等）を再定義しない。
必要な情報は委譲先 skill の reference を参照するか、委譲時に必要な入力（対象ファイル、シグナル概要）を引き渡す。

### 3. 委譲時の入力引き渡し

専門 skill へルーティングする際、以下を引き渡す。

| 項目 | 内容 |
|------|------|
| 対象範囲 | ファイルパス、REQ ID、セクション 等 |
| 抽出シグナル | 横断スキャンで検出したシグナルの概要 |
| 横断文脈 | 他文書との関係、source-of-truth 判定結果 |
| 期待される専門診断 | SPLIT/MOVE 等、委譲先が担当する観点 |

### 4. ルーティング結果の統合

専門 skill から返却された検出事項（finding）は、本スキルが定める共通 finding 出力契約（`finding-output-contract.md`）へ適合させて統合する。
severity、confidence、NG 分類は本スキルの共通契約へ正規化する。

## ルーティング表と inspect-docs Step の対応

inspect-docs command の各 Step は次のように本スキルと専門 skill を組み合わせる。

| inspect-docs Step | 本スキルの役割 | ルーティング先 |
|--------------------|----------------|----------------|
| Step 2: REQ 参照 ID 整合性確認 | 横断スキャンで対象特定 | `agentdev-req-structure-diagnostics` |
| Step 3: 第一参照導線確認 | 横断スキャンで対象特定 | `agentdev-req-structure-diagnostics` |
| Step 4: 現行/廃止/世代境界確認 | 横断スキャンで対象特定 | `agentdev-req-structure-diagnostics` |
| Step 5: SPEC 意味診断 | 横断契約矛盾の抽出（本スキル直接判定） | `agentdev-req-structure-diagnostics`（詳細は委譲） |
| Step 6: ADR 意味診断 | 横断契約矛盾の抽出（本スキル直接判定） | `agentdev-req-structure-diagnostics`（詳細は委譲） |
| Step 7: guides 意味診断 | 横断契約矛盾の抽出（本スキル直接判定） | `agentdev-doc-writing`（文意品質）、`agentdev-doc-map`（探索順） |
| Step 8: DOC-MAP 意味診断 | 索引の範囲超過の抽出（本スキル直接判定） | `agentdev-doc-map` |
| Step 9: REQ structure review（6観点） | 横断比較でシグナル抽出 | `agentdev-req-structure-diagnostics` |
| Step 10: 文書分類一貫性検査 | 横断スキャンで SPEC 分離基準違反シグナル抽出 | `agentdev-req-structure-diagnostics`（MOVE 観点） |
| Step 11: 配布物整合性検査 | 対象範囲特定、ルーティング | `agentdev-req-structure-diagnostics` |
| Step 13: 未処理 artifact 確認 | 横断スキャン（本スキル直接判定） | 該当なし |

## 責務重複なしの保証（AC-014）

本スキルと 3 専門 skill との責務重複がないことを、以下の境界で保証する。

| skill | 専門領域 | 本スキルとの境界 |
|-------|----------|------------------|
| `agentdev-req-structure-diagnostics` | REQ 固有 SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断、REQ 参照 ID 整合性、配布物統合性、SPEC 三層構造 | 本スキルは横断スキャン、シグナル抽出、ルーティングのみ。判定ロジック、シグナル閾値、出力 schema（7フィールド）は再定義しない |
| `agentdev-doc-writing` | 文意品質（LLM 表現、空虚語、英語混じり）、実行主体分類、機械的置換辞書 | 本スキルは横断スキャンで検出、ルーティングのみ。判定辞書、書き換え辞書は再定義しない |
| `agentdev-doc-map` | DOC-MAP 読み方ガイド、ドキュメント探索順序、影響確認ルール | 本スキルは横断スキャンで DOC-MAP との整合性を確認、ルーティングのみ。探索順、影響確認フローは再定義しない |

境界違反を検出した場合（本スキルが専門診断を再定義している、専門 skill が横断編成を所有している等）は stop-and-fix で即時修正する。
