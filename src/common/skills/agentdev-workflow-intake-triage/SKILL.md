---
name: agentdev-workflow-intake-triage
description: "intake-triage command の workflow 実装本体。.agentdev/intake/inbox/ と .agentdev/learning/inbox/ の項目をクラスタリングし、Route A（即時修正）/ Route B（理由記録なし即時破棄）/ Route C（要件ユニット生成・採番規律適用）へ自動振り分けして即時実行し、サマリーを出力する。USE FOR: inbox 一括走査、クラスタリング、3ルート自動振り分け、Route A 軽微修正、Route B 即時破棄、Route C 要件ユニット生成、サマリー報告。DO NOT USE FOR: intake-promote の分類・評価・HITL、backlog-review の統合判定、learning-promote の評価、adversarial-review、単独起動（/agentdev/intake-triage 経由で利用すること）。"
---

# intake-triage workflow スキル

intake-triage command の workflow 実装本体である。
`.agentdev/intake/inbox/` と `.agentdev/learning/inbox/` に蓄積した項目を一括走査し、クラスタリングと3ルート自動振り分けを行い、各ルートの即時実行と処理結果サマリーの報告までを行う軽量自動トリアージ workflow を所有する。
intake-promote の分類・評価・HITL、backlog-review の統合判定、learning-promote の評価、adversarial-review は行わない。

intake-triage command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（責務3層分化と1:N分割原則）。

## 入力

- `.agentdev/intake/inbox/*.md` と `.agentdev/learning/inbox/*.md`（.gitkeep 除外）

## 出力

- 処理結果サマリー（Route A 解決件数、Route B 破棄件数、Route C 昇格件数、残件 0 件の確認）
- Route C 生成物: `.agentdev/backlog/req-units/` への要件ユニット

## 副作用

- 対象ファイルの Route A 軽微修正（1〜2ファイルで完結する修正）
- inbox 配下の処理済みファイル削除（Route A / Route B / Route C とも削除する）
- `.agentdev/backlog/req-units/` 配下への要件ユニット作成（Route C）
- 当該 Workflow Skill は worktree root 配下以外を編集しない（worktree 隔離に従う）

## workflow model（軽量トリアージ型、STEP model 対象外）

1. **Step 1（一括走査とクラスタリング）**: 対象 inbox の全ファイルを読み込み、対象コンポーネント、関連 IR/REQ ID、問題の種類が重複・類似しているアイテムを1クラスタにグルーピングする。
2. **Step 2（3ルート自動振り分けと即時実行）**: 各クラスタを下記の判定基準で振り分け、クラスタごとに即時実行する。
3. **Step 3（サマリー出力）**: 処理結果（各ルート件数、クラスタごとの対応、残件 0 件の確認）を簡潔に報告する。

## 3ルート判定基準

| ルート | 判定基準 | 即時実行 |
|---|---|---|
| Route A（即時決済 / Quick-Fix） | タイポ修正、リンク切れ修復、未使用キー削除、既存設計書への1〜2文追記等、設計判断を伴わず1〜2ファイルで完結する軽微修正 | その場で対象ファイルを直接修正し、処理済み inbox ファイルを削除する |
| Route B（即時破棄 / Drop） | 実験優先の恒久運用原則（後方互換不要・過剰監視の排除・実験優先）に照らして不要・陳腐化している提案 | 理由を記録せず即座に削除する。破棄はサマリー件数で把握できる（未処理 inbox 項目の即時トリアージ処分は測定待ち案件スコープの狭義解釈の適用外） |
| Route C（バックログ昇格 / Promote） | 複数ファイルの構造変更や新規設計が必要な案件 | クラスタ単位で統合した要件ユニットを `.agentdev/backlog/req-units/` に生成し、元の inbox ファイルを削除する |

- 振り分け判定はクラスタ単位で行い、クラスタ内の最も要求水準の高い項目で判定する（1件でも構造変更を含むクラスタは Route C）。
- 設計判断を伴うかは、判定に必要な既存の正規成果物（REQ、Decision、Design）の実読取で確認する（inbox 項目の自己申告だけを根拠にしない）。

## Route C の要件ユニット生成（採番規律）

- 採番は `req-units/` ディレクトリの現状に加えて git 履歴上で使用されたことのある番号（消費済み・削除済み RU を含む）を検査し、衝突する番号を採番せず次の未使用番号を採番する。
- 履歴検査の実施を進捗記録に残す。履歴検査が実行できない環境では採番を確定せず理由を報告する。
- git リポジトリかつコミット 0（`git log --all` が exit 0・空出力）は使用済み集合が空の検査成功であり、履歴検査不能に該当しない。
- 生成する要件ユニットはクラスタの内容（対象コンポーネント、関連 ID、問題の種類、必要な構造変更の要約）を統合した軽量形式とし、backlog-review の統合判定の入力として十分な情報を含める。

## 検証手順（テスト用 fixture による3ルート確認）

テスト用 inbox 項目3種（軽微修正・陳腐化提案・構造変更案件）を `.agentdev/intake/inbox/` と `.agentdev/learning/inbox/` に配置して本 workflow を実行し、次を確認する:

- 3ルートの振り分けと即時実行（Route A 修正・Route B 破棄・Route C RU 生成）が行われること
- サマリー出力（各件数・残件 0 件）が確認できること
- Route C 生成要件ユニットの採番が採番規律行（現状と git 履歴検査による未使用番号）に従うこと
- 検証用 fixture は検証後に回収する（修正したファイルは元へ戻し、生成した RU と inbox 項目は削除する）

## 共通制約

- `.agentdev/intake/`、`.agentdev/learning/` の inbox 配下以外を変更しない（Route C の `req-units/` 生成を除く）
- GitHub Issue の作成は行わない（case-open が担当）
- 破棄・修正・生成の対象は inbox 項目とその指摘対象に限定し、正規成果物の意味変更は行わない

## See Also

- [agentdev-intake-pipeline](../agentdev-intake-pipeline/SKILL.md)（intake pipeline の知識ベース）
- [agentdev-backlog-integration](../agentdev-backlog-integration/SKILL.md)（promoted 成果物の統合・RU 生成ルール）
