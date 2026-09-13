# verify-only case の実行証跡 SSoT 記録の標準化

## 背景

変更ゼロの verify-only case（PR・carrier commit が存在しない closure）では、検証完了の証跡が会話上のみで消えると QG-4 判定根拠が恒久記録から追跡できなくなる（case 2769、前例 case 2768）。

## 問題

verify-only case の検証証跡の恒久記録方法が手順として明文化されておらず、case 2768 で確立した「SSoT コメントへの実行コマンド列付き記録」の運用依存となっている。証跡不在のまま処分判断だけ行うと QG-4 判定根拠が再現不可能になる。

## 望ましい変更

verify-only case では3検査（配布依存境界・IR-055・traceability）と integrity suite を実 case と同水準で実行し、実行コマンド列と結果（new_delta 0、新規違反 0 件、pass/fail 数等）を SSoT コメントへ記録する運用を標準化する。実行コマンド列はそのまま再実行手順になる。

## 対象範囲

- 対象: verify-only case（変更ゼロ closure）の case-run / case-close 検証、および検証のみで完了する maintenance case
- 対象外: 通常 case（PR が存在する closure）の QG-4 記録（既存契約の対象）

## 反映先候補

| 種別 | パス | 変更内容 |
|---|---|---|
| REQ（候補） | docs/requirements/ | verify-only case の実行証跡記録要件として新設候補 |
| Design | docs/designs/skills/agentdev-workflow-case-run.md 関連 | verify-only 契約の証跡記録手順 |
| Design | docs/designs/skills/agentdev-workflow-case-close.md 関連 | QG-4 判定根拠の SSoT 参照手順 |

## 既存対策確認

- 確認結果: 前例（case 2768・2769）の運用実績あり、恒久契約としては未整備
- 該当ファイル: case-run / case-close workflow skills
- ギャップ分類: fix gap（運用は確立、契約は不在）
- ギャップ詳細: 「SSoT コメントへ実行コマンド列付き記録」が workflow skill に明文化されていない

## 制約

- PR-less closure は carrier commit 捏造を却下した作業仮定に基づく（case 2769 記録）
- 記録先は SSoT コメント（Issue コメント）とし、PR 本文は使えない（PR が存在しないため）

## 受け入れ条件

- [ ] verify-only case の case-run で3検査+integrity suite が実行される
- [ ] 実行コマンド列と結果が SSoT コメントへ記録される
- [ ] case-close が SSoT を QG-4 判定根拠として参照する

## 元learning item / 根拠

- 要約: verify-only case の検証完了根拠が会話上で消失する問題。3検査+integrity suite を SSoT コメントへ実行コマンド列付き記録する運用の標準化
- 根拠: case 2769 で確立（case-run 側が同水準実行・SSoT 記録、case-close 側が SSoT を QG-4 判定根拠として参照）。前例 case 2768（verify-only closure、PR なし）
- 再発条件: verify-only case で検証コマンドと結果を SSoT コメントへ記録せずに処分判断だけを行った場合
- 横展開可能性: 変更ゼロの docs_chore case 全般、検証のみで完了する maintenance case

## 推奨Issue分類

- 分類: feature
- 推奨ラベル: docs, workflow
- 関連Issue: 2769, 2768
