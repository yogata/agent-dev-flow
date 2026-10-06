# IR-072 frontmatter updated 再実測の対象範囲と実行タイミングを手順へ明示する

## 背景

可変メタデータ再実測（frontmatter updated を変更日へ進行）の規律（IR-072 req-updated-freshness）について、Case 3494 で2種類の適用漏れが発生した。(1) 対象漏れ: REQ ファイルのみ再実測し Design 6 ファイルの frontmatter updated 進行を漏らし、check_integrity が IR-072 を 6 件検出（commit f7fe8db4 で解消）。(2) タイミング漏れ: case-open が検証実行後に索引最新化 commit（01ded1f5）を追加し、req-health-metrics.md の計測日が content change したまま frontmatter updated が再実測されず、case-ready 受入検査で IR-072 が新規検出された（修正 commit d6a9c76a で解消）。

## 問題

case-open STEP-3 手順 1.5(3) の再実測規律が REQ ファイルにのみ言及し、Design・Decision への適用対象が明示されていない。また検証実行後に派生物を含む commit を追加する場合の再実測タイミング（最終 commit HEAD での再実測）と、case-ready 受入側の branch HEAD 再実測が手順として明文化されていない。

## 望ましい変更

対象面として手順 1.5(3) へ Design・Decision の frontmatter updated 再実測を明示する。タイミング面として case-open 手順 2.5 へ索引再生成 commit を検証実行より前に完了させる順序を補足し、case-ready STEP-1 の品質検査で merge 直前 branch HEAD での再実測を必須化する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md`（手順 1.5 の(3)）
- `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md`（手順 2.5 の実行順序）
- `src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md`（STEP-1 品質検査の再実測）

### 対象外

- IR-072 checker の検出基準（現行どおり）
- generate_indexes の計測日導出設計（現行どおり）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md | 手順 1.5(3) へ Design・Decision の再実測対象明示 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | 手順 2.5 へ索引再生成 commit を検証実行前に完了させる順序補足 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md | 品質検査での merge 直前 branch HEAD 再実測の必須化 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: IR-072 check（req-updated-freshness 検出）、root-case-and-definition-package.md 手順 1.5(3)、deferred の 2026-09-16 知識（REQ/Design 同時更新）
- **ギャップ分類**: fix gap・application miss
- **ギャップ詳細**: 検出は機械化済みだが、適用対象（Design・Decision）と再実測タイミング（検証後 commit 後・受入側 HEAD）が手順に明示されない

## 制約

- 検出後の修正 commit による回復経路は現行どおり（巻き戻し不要）
- 索引再生成を同一 PR へ含める運用は現行どおり

## 受け入れ条件

- [ ] 手順 1.5(3) に REQ/Design/Decision の全区別の再実測対象が明記される
- [ ] 手順 2.5 に索引再生成 commit の検証前完了が明記される
- [ ] definition-acceptance.md に branch HEAD 再実測の必須化が明記される

## 元learning item / 根拠

- **要約**: IR-072 frontmatter updated 再実測の対象（Design 側）とタイミング（検証後 commit 後・受入側 HEAD）が手順に明示されず適用漏れが再発（2件・同一 Case で2経路）
- **根拠**: Case 3494・Definition PR 3495（Design 6 ファイル IR-072 6件→f7fe8db4、req-health-metrics IR-072 1件→d6a9c76a）
- **再発条件**: Design への append/update を含む Definition 変更、検証後に派生物を含む commit を追加する Definition PR
- **横展開可能性**: frontmatter 鮮度管理は可変メタデータを持つ全成果物で汎用（IR-072 は本プロジェクトの checker）

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
