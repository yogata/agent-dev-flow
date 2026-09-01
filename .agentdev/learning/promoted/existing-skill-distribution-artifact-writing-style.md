# 配布物執筆時の ID 衛生・記載様式ガイダンスの明文化

## 背景

配布 skill への実行手順・例示記載と、配布物への対応宣言配置において、検出器の性質（IR-055 は inline code span 内のパス参照を検出し fenced block 内は非検出、concrete ID は配布境界違反、新規ファイルは baseline info 降格対象外で fail）を記載時に考慮しないことで IR-055 delta 違反 5〜13件の手戻りが繰り返し発生した（PR #2391 / Issue #2381、PR 2406 / Issue 2402）。対応宣言の配置についても配布物直書きと docs 配下 Design 配置の混在が続いた。

## 問題

- agentdev-skill-authoring に「fenced code block ＋ プレースホルダ ＋ ID 引用排除」の記載様式ガイダンスが存在しない（grep 実証）
- 配布物への対応宣言（ADF-COVERS）の正規配置先（docs 配下の command/skill Design）が authoring ガイダンスに明文化されていない

## 望ましい変更

authoring ガイダンスへ次の2点を明記する。(1) 配布物への実行手順・例示は fenced code block とプレースホルダ表記で書き、concrete ID（REQ/DEC/AG 等の具象参照）の inline 記載を排除し、要件根拠は PR 本文 ADF-COVERS 宣言へ集約する。(2) 対応宣言（ADF-COVERS implementation/verification）の正規配置先は docs 配下の正規成果物（skill Design・command Design）とする。

## 対象範囲

### 対象

- src/opencode/skills/agentdev-skill-authoring/SKILL.md（記載様式・配置ガイダンスの追記）
- docs/designs/skills/agentdev-doc-writing.md 関連（文意品質査読観点への追記候補）

### 対象外

- IR-055・配布境界 checker 自体の仕様変更
- クラス8残余（archive 公開前検査は既存）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | src/opencode/skills/agentdev-skill-authoring/SKILL.md | ID 衛生・記載様式（fenced＋プレースホルダ＋ID引用排除）と対応宣言の docs 配下配置を Guardrails/Steps へ追記 |
| spec | docs/designs/skills/agentdev-doc-writing.md | 査読観点への記載様式観点追記（候補） |

## 既存対策確認

- **確認結果**: 既存対策なし（ガイダンス欠落）
- **該当ファイル**: agentdev-skill-authoring（配置ガイダンスなし、grep 実証）
- **ギャップ分類**: 対策不存在（検出器は既存・執筆側ガイダンスが欠落）
- **ギャップ詳細**: IR-055 検出は既存で機能するが、事前防止の執筆ガイダンスが未整備

## 制約

- IR-055・配布依存境界・TIM の既存規定と矛盾しない
- ガイダンス追記のみで checker 変更を伴わない

## 受け入れ条件

- [ ] 記載様式（fenced＋プレースホルダ＋ID引用排除）が authoring ガイダンスに明記されている
- [ ] 対応宣言の正規配置先（docs 配下 Design）が authoring ガイダンスに明記されている
- [ ] 既存 IR-055・配布境界規定と矛盾がない

## 元learning item / 根拠

- **要約**: 配布物記載様式（2件）と対応宣言配置（2件）の ID 衛生ギャップ（4件統合）
- **根拠**: 「配布 skill への実行手順記載は fenced code block とプレースホルダーで書く」「新規配布物ファイルの IR-055 delta は ADF-COVERS 宣言の PR 本文集約で回避する」「配布 Workflow Skill 本文への具象 REQ ID 記載は IR-055 違反になるため対応宣言は command Design へ置く」「traceability の ADF-COVERS(implementation) 宣言は docs 配下 Design へ置く（配布物直書きは concrete-id gate と衝突）」— 8軸評価 29/40・30/40（反映先明確度 5・固有知識 5）
- **再発条件**: 配布 skill・配布物に inline code span で直参照や具象 ID を記載、対応宣言を配布物直書き
- **横展開可能性**: 配布 skill/command 編集全般・対応宣言を記載するすべての場面

## 推奨Issue分類

- **分類**: docs_chore
- **推奨ラベル**: documentation, skill
- **関連Issue**: なし
