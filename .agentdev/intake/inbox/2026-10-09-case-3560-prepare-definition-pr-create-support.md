# prepare_definition_pr へ create 操作（新規ファイル作成）対応の追加を評価する

## 内容

case-open STEP-4 の機械工程 script（`src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts`）の入力契約 `DefinitionEdit` は「対象パス + 旧文完全一致置換」のみを受理し、artifact_actions の create 操作（新規 REQ/DEC ファイル作成）を入力 JSON で表現できない。Case #3560 では worktree を agentdev-git-worktree 標準手順（type=definition）で前置作成し、新規 10 ファイル（REQ-104〜109、DEC-053〜056）を node writeFileSync で worktree 内へ配置した上で script を呼び出す構成で回避した（運用知見は learning inbox へ記録）。

## 影響

新規 REQ/DEC を含む Definition 変更の case-open で毎回、非正規経路になり得る前段手動配置が発生する。前置作成した worktree への手動配置は script の冪等再利用（branch 確認済み再利用）と整合するが、機械工程の「1 回の呼び出し」契約（case-open Design 機械工程節）に対する解釈の幅が残り、実行経路の再現性が実装者に依存する。

## 提案

case-open Design「機械工程の script 呼び出し契約」節の解釈を確定した上で、次のいずれかを評価する。
1. `DefinitionEdit` に create 操作（対象パス + 全文 content、既存ファイルが存在する場合は失敗）を追加し、REQ/DEC 新規作成を input JSON で表現可能にする
2. 現行契約を正とし、新規ファイル配置の前段手順を case-open references（definition-pr-and-idempotency.md STEP-4）へ明文化する

いずれも REQ/Design 変更を伴うため、req-define 再合意を経る正規経路で評価する。

## 根拠

Case #3560 case-open STEP-4 実行記録（PR #3561 本文「検証」節）、learning inbox「prepare_definition_pr の definitionEdits は既存ファイル置換のみで新規ファイル作成を表現できない」エントリ。
