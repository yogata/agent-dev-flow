# case-open 円等検出の複数トークン・二段検証

## 背景

case-open STEP-2 の円等検出で draft topic_slug 単独の search トークンでヒット 0 件と判定し、既存 Root Case（#3988）と設計 PR（#3991）が既存であることが判明後に Root Case（#3989）と設計 PR（#3990）を新規作成した。GitHub search/issues は in:title tokenized match であり、既存 Root Case のタイトル・本文に topic_slug が含まれない書式では空振りする。#3989 は対照実行側により重複タイトルへ更新され、#3990 と #3991 の tree 差分 0 件を機械証明して重複 PR の内容不備がないことを確認済み

## 問題

issue-operation-safety.md「search トークンの選択性指針」節（L63-65）に「search トークン単独で目的の絞り込みが満たせない場合は state と role の指定を併用して母集団を先に限定」は規定済みだが、(1) 円等検出の search を topic_slug に限定した単一トークンで行うことの危険 (2) ヒット 0 件の場合でも主題語・REQ 行 ID による再検索を実施する二段検証の規律が不在

## 望ましい変更

(1) issue-operation-safety.md の選択性指針に「ヒット 0 件時は合意済み対象・目的から導出した主題語と対象 REQ 番号による再検索を実施する二段検証」を追加 (2) case-open references（definition-pr-and-idempotency.md STEP-2 節等）の円等検出手順に複数トークン検索（topic_slug + 主題語 + REQ 番号）を明記する

## 対象範囲

### 対象

- issue-operation-safety.md「search トークンの選択性指針」節（二段検証の追加）
- case-open references 円等検出手順（複数トークン検索の明記）

### 対象外

- GitHub search API 自体の変更対応
- agentdev_gh issue_list 操作契約の変更（in:title tokenized match は Tool 側の外部仕様）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-issue-management/references/issue-operation-safety.md「search トークンの選択性指針」節 | ヒット 0 件時の主題語・REQ 番号再検索（二段検証）の追加 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（STEP-2 円等検出の候補配置先） | 複数トークン検索（topic_slug + 主題語 + REQ 番号）の明記 |

## 既存対策確認

- **確認結果**: 対策あり（部分的）
- **該当ファイル**: src/common/skills/agentdev-issue-management/references/issue-operation-safety.md（L63-65 選択性指針・state+role 併用は実在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: ヒット 0 件時の主題語・REQ 番号再検索規律（二段検証）の欠落。重複 Root Case・重複設計 PR 作成の実害

## 制約

- search トークンの選択性指針（相互参照トークンの単独使用禁止）は維持
- 円等検出の対象は Root Case・Case Issue・設計 PR 等であり、対象ごとの検索書式差を手順に反映する

## 受け入れ条件

- [ ] 選択性指針（または円等検出手順）にヒット 0 件時の二段検証（主題語・REQ 番号再検索）が明記されていること
- [ ] 後続の case-open 円等検出で topic_slug 単独検索による重複作成が構造的に発生しないこと

## 元learning item / 根拠

- **要約**: case-open 円等検出で topic_slug 単独の search トークンが空振りし既存 Root Case・設計 PR を重複作成
- **根拠**: issue-operation-safety.md L63-65 のファイル読取実測でヒット 0 件時再検索規律の不在（2026-11-15）・重複 Root Case #3989・重複 PR #3990 の実害と tree 差分 0 件機械証明
- **再発条件**: draft topic_slug が既存 Root Case のタイトル・本文に含まれない書式で起票されている場合に、topic_slug 単独の search トークンで円等検出を実施した場合
- **横展開可能性**: 既存成果物の円等検出を行う全 workflow（case-ready・case-revise・case-close）へ同種の複数トークン・二段検証を適用可能

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
