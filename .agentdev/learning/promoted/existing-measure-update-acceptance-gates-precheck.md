# workflow-extension acceptance_gates の merge 前確認を受入手順へ前置する

## 背景

project-extensions の workflow-extension が定める acceptance_gates（Definition PR 差分に docs/** 日本語文章変更を含む場合、yomiyasu 適用記録が PR 上に存在すること。不足時は merge 前差し戻し）の確認を、case-ready STEP-1 の受入検査で実施せず merge した事象が2回連続で発生した（Issue 3484・PR 3487、Case 3494・PR 3495）。いずれも merge 後の検証ゲート（STEP-6）で拡張 rules を読んだ時点で発覚し、merge 巻き戻し禁止のため事後補完（yomiyasu_lint.py 実行と PR への記録コメント）で回復した。

## 問題

case-ready STEP-1 の受入検査手順（忠実性・整合性・品質検査・isDraft 確認）に、project-extensions の workflow-extension acceptance_gates を merge 判定前に読み込む前置確認が明示されていない。workflow-extension の解決位置が「検証ゲート横断依存検査の共有領域解決」に紐づいており、ゲート確認のタイミングが受入より後になっている。case-open 側も PR 作成時に適用記録を付与する観点がなく、両工程で予防が働かない構造になっている。

## 望ましい変更

case-ready STEP-1 の受入検査手順へ「merge 判定前の project-extensions workflow-extension acceptance_gates 読込と突合」を前置項目として明示する。あわせて case-open STEP-4 の PR 作成手順へ、docs/** 日本語文章変更を含む場合の yomiyasu 適用記録の PR 本文への付与を明示する（前工程の予防）。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md`（STEP-1 受入検査の前置観点）
- `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md`（PR 本文記録欄）

### 対象外

- project-extensions の acceptance_gates 定義側（.agentdev/extensions/ のプロジェクト固有設定）
- yomiyasu_lint.py の判定基準

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md | merge 前 acceptance_gates 突合の前置項目化 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | PR 本文への yomiyasu 適用記録付与の明示 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: case-ready 検証ゲート（STEP-6）での project-extensions 読込、definition-acceptance.md（3検査+isDraft）
- **ギャップ分類**: fix gap・application miss
- **ギャップ詳細**: 検出は STEP-6 で機能するが merge 判定（STEP-1）に間に合わない。受入手順への前置と case-open 側の記録付与が不在

## 制約

- merge 巻き戻し禁止（冪等原則）は現行どおり。本変更は merge 前検出の前置のみを対象とする
- acceptance_gates の内容はプロジェクト固有（extension 側）であり、手順側は「読込と突合」の汎用観点のみを規定する

## 受け入れ条件

- [ ] definition-acceptance.md の受入検査手順に merge 前の acceptance_gates 突合が明記される
- [ ] definition-pr-and-idempotency.md の PR 作成手順に日本語文章変更時の適用記録付与が明記される

## 元learning item / 根拠

- **要約**: workflow-extension acceptance_gates の確認が merge 後（検証ゲート）にしか発生せず、受入前置と PR 作成側の記録付与の両方が手順にない（2回連続再発）
- **根拠**: Issue 3484・PR 3487（適用記録なし merge→事後コメント補完）、Case 3494・PR 3495（同様、記録コメント 6006528395）
- **再発条件**: docs/** 日本語文章変更を含む Definition PR を case-ready が受入・merge する場合（merge を実行する全 Case）
- **横展開可能性**: workflow-extension の acceptance_gates・rules を消費する受入・merge を伴う STEP 全般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
